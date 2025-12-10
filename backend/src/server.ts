import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

// Aplicar rate limiter a todas las rutas API
app.use('/api/', apiRateLimiter);

// Middleware de modo mantenimiento (aplicar ANTES de las rutas)
app.use(maintenanceMiddleware);

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
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

// Error handling middleware
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

