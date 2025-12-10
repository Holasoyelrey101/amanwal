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
  // Rutas que SIEMPRE deben estar disponibles (incluso en mantenimiento)
  const alwaysAllowedRoutes = [
    '/api/maintenance',
    '/api/health',
    '/maintenance.html',
  ];

  // Verificar si la ruta está siempre permitida
  if (alwaysAllowedRoutes.some((route) => req.path.startsWith(route))) {
    return next();
  }

  // Verificar si está en modo mantenimiento
  const isMaintenanceMode = fs.existsSync(MAINTENANCE_FILE);

  if (!isMaintenanceMode) {
    // No está en mantenimiento, permitir acceso a todos
    return next();
  }

  // ESTÁ EN MANTENIMIENTO - Verificar si el usuario tiene token admin válido
  const adminToken = process.env.ADMIN_MAINTENANCE_TOKEN;
  const tokenFromHeader = req.headers['x-admin-token'] as string;
  const tokenFromQuery = req.query.token as string;
  const tokenFromCookie = req.cookies?.maintenanceToken;
  const token = tokenFromHeader || tokenFromQuery || tokenFromCookie;

  if (adminToken && token === adminToken) {
    // Token válido - permitir acceso a TODO
    console.log('✅ Token admin válido en mantenimiento - Acceso permitido');
    return next();
  }

  // Sin token válido en modo mantenimiento
  // Si es una petición de API, devolver error JSON
  if (req.path.startsWith('/api/')) {
    console.log('🔧 Modo mantenimiento - API bloqueada');
    return res.status(503).json({
      error: 'Sistema en mantenimiento',
      message: 'El sitio está en mantenimiento. Intenta más tarde.',
    });
  }

  // Si es una petición de HTML/página, servir maintenance.html
  console.log('🔧 Modo mantenimiento - Página de mantenimiento mostrada');
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
