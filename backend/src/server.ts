import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import cabinRoutes from './routes/cabin.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import setupRoutes from './routes/setup.routes';
import paymentRoutes from './routes/payment.routes';
import supportRoutes from './routes/support.routes';
import uploadRoutes from './routes/upload.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import { apiRateLimiter } from './middleware/rateLimiter.middleware';
import { maintenanceMiddleware } from './middleware/maintenance.middleware';
import { startExpiredBookingCleanup } from './services/expiredBookingCleanup';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());

// Aplicar rate limiter a todas las rutas API
app.use('/api/', apiRateLimiter);

// Middleware de modo mantenimiento (aplicar ANTES de las rutas)
app.use(maintenanceMiddleware);

// SPA fallback middleware - ANTES de express.static
// Esto intercepta requests y sirve index.html si no tiene extensión
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Solo para GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Si ya respondimos (mantenimiento), no hacer nada
  if (res.headersSent) {
    return;
  }
  
  // NUNCA interceptar rutas de API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Si no tiene extensión, es probablemente una ruta SPA
  if (!path.extname(req.path)) {
    console.log(`🔄 SPA Fallback: ${req.path}`);
    return res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'), (err) => {
      if (err) {
        console.error('Error sendFile:', err.message);
        return next();
      }
    });
  }
  
  // Si tiene extensión, pasar al siguiente middleware (probablemente express.static)
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/cabins', cabinRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Error handling middleware - DEBE ir al final
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
    // Iniciar limpieza automática de reservas vencidas
    startExpiredBookingCleanup();
  });
}

export default app;

