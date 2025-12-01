import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
    
    // Verificar que el token tiene las propiedades necesarias
    if (!decoded || typeof decoded === 'string' || !decoded.id) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Obtener el rol actual del usuario de la BD para validar cambios
    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar el rol en el decoded token con el rol actual de la BD
    req.user = {
      id: decoded.id as string,
      role: user.role, // Usar el rol actual de la BD, no del token
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
