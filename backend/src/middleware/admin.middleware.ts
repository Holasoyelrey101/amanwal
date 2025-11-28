import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder.' });
      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};
