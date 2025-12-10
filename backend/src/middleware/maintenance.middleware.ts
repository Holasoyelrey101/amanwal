import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const MAINTENANCE_FILE = path.join(process.cwd(), '.maintenance');

/**
 * Middleware para verificar si el sitio está en modo mantenimiento
 * Permite acceso si:
 * 1. El modo mantenimiento está desactivado
 * 2. El usuario es admin (con token especial)
 * 3. Es una ruta de admin o API interna
 */
export const maintenanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Rutas que siempre deben estar disponibles
  const allowedRoutes = [
    '/api/maintenance',
    '/api/health',
    '/maintenance.html',
  ];

  // Verificar si la ruta está permitida
  if (allowedRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  // Verificar si está en modo mantenimiento
  const isMaintenanceMode = fs.existsSync(MAINTENANCE_FILE);

  if (!isMaintenanceMode) {
    return next();
  }

  // Verificar si el usuario es admin (mediante token especial)
  const adminToken = process.env.ADMIN_MAINTENANCE_TOKEN;
  const token = req.headers['x-admin-token'] as string;

  if (adminToken && token === adminToken) {
    // Admin puede acceder normalmente
    return next();
  }

  // Si no es admin, mostrar página de mantenimiento
  res.status(503).sendFile(path.join(process.cwd(), 'maintenance.html'));
};

/**
 * Obtiene el estado actual del modo mantenimiento
 */
export const getMaintenanceStatus = (): {
  enabled: boolean;
  message: string;
} => {
  const isEnabled = fs.existsSync(MAINTENANCE_FILE);
  let message = '';

  if (isEnabled) {
    try {
      message = fs.readFileSync(MAINTENANCE_FILE, 'utf-8');
    } catch (e) {
      message = 'Sistema en mantenimiento';
    }
  }

  return { enabled: isEnabled, message };
};

/**
 * Activa el modo mantenimiento
 */
export const enableMaintenance = (message: string = 'Sistema en mantenimiento'): void => {
  try {
    fs.writeFileSync(MAINTENANCE_FILE, message, 'utf-8');
    console.log('🔧 Modo mantenimiento ACTIVADO');
  } catch (error) {
    console.error('Error activando modo mantenimiento:', error);
  }
};

/**
 * Desactiva el modo mantenimiento
 */
export const disableMaintenance = (): void => {
  try {
    if (fs.existsSync(MAINTENANCE_FILE)) {
      fs.unlinkSync(MAINTENANCE_FILE);
    }
    console.log('✅ Modo mantenimiento DESACTIVADO');
  } catch (error) {
    console.error('Error desactivando modo mantenimiento:', error);
  }
};
