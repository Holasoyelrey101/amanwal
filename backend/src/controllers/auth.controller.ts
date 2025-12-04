import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { isEmail } from 'validator';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail, getVerificationEmailTemplate } from '../utils/emailService';

const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  name: string;
  password: string;
  birthDate?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const generateToken = (userId: string, role: string = 'user'): string => {
  const secret = process.env.JWT_SECRET as string || 'your-secret-key';
  const expiresIn = (process.env.JWT_EXPIRE as string) || '7d';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: expiresIn,
  } as any);
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name, password, birthDate }: RegisterBody = req.body;

    // Validaciones
    if (!email || !name || !password) {
      res.status(400).json({ error: 'Email, nombre y contraseña son requeridos' });
      return;
    }

    // Validación de email más permisiva (permite @live.cl, @outlook.com, etc.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        ...(birthDate && { birthDate: new Date(birthDate) }),
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Enviar email de verificación
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try {
      const emailTemplate = getVerificationEmailTemplate(name, verificationUrl);

      await sendEmail({
        to: email,
        subject: '✓ Verifica tu email en Amanwal',
        html: emailTemplate,
      });

      console.log(`📧 Email de verificación enviado a ${email}`);
    } catch (emailError) {
      console.error('Error al enviar email de verificación:', emailError);
      // No fallar el registro si el email no se envía
    }

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
      },
      requiresVerification: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginBody = req.body;

    // Validaciones
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // Verificar si el email está verificado
    if (!user.isEmailVerified) {
      res.status(403).json({ 
        error: 'Por favor verifica tu email antes de iniciar sesión',
        requiresVerification: true,
        userId: user.id,
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        birthDate: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Obtener reservas del usuario
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        cabin: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      ...user,
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });

    res.json({
      message: 'Perfil actualizado',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Las contraseñas no coinciden' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Contraseña actual incorrecta' });
      return;
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

/**
 * Verifica el email del usuario usando el token enviado por email
 */
export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ error: 'Token de verificación requerido' });
      return;
    }

    // Buscar usuario con este token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token aún no expirado
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: 'Token inválido o expirado' });
      return;
    }

    // Marcar como verificado
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Generar token JWT para login automático
    const jwtToken = generateToken(updatedUser.id, updatedUser.role);

    res.json({
      message: '✓ Email verificado exitosamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        isEmailVerified: updatedUser.isEmailVerified,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar email' });
  }
};

/**
 * Reenvía email de verificación si el usuario aún no lo verificó
 */
export const resendVerificationEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email requerido' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ error: 'Este email ya está verificado' });
      return;
    }

    // Generar nuevo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Enviar email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try {
      const emailTemplate = getVerificationEmailTemplate(user.name, verificationUrl);

      await sendEmail({
        to: email,
        subject: '✓ Verifica tu email en Amanwal',
        html: emailTemplate,
      });

      res.json({ message: 'Email de verificación reenviado exitosamente' });
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      res.status(500).json({ error: 'Error al enviar email de verificación' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reenviar email' });
  }
};

/**
 * Obtiene el rol actual del usuario desde la base de datos
 */
export const getCurrentRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el rol' });
  }
};
