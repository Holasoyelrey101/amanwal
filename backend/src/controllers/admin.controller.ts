import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
// @ts-ignore
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCabins = await prisma.cabin.count();
    
    // Solo contar reservas activas (no canceladas ni completadas)
    const totalBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['pending', 'confirmed']
        }
      }
    });
    
    const totalReviews = await prisma.review.count();

    // Contar reservas activas recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        status: {
          in: ['pending', 'confirmed']
        }
      },
    });

    res.json({
      totalUsers,
      totalCabins,
      totalBookings,
      totalReviews,
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { cabins: true, bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!userId || !['user', 'admin', 'soporte', 'developer'].includes(role)) {
      res.status(400).json({ error: 'userId y role (user/admin/soporte/developer) son requeridos' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ message: 'Rol actualizado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (userId === req.user?.userId) {
      res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, password, role } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId es requerido' });
      return;
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Preparar datos a actualizar
    const data: any = {};

    if (name) {
      data.name = name;
    }

    if (email) {
      data.email = email;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    if (role && ['user', 'admin'].includes(role)) {
      data.role = role;
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const getAllCabinsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cabins = await prisma.cabin.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(cabins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cabañas' });
  }
};

export const deleteCabinAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cabinId } = req.params;

    await prisma.cabin.delete({
      where: { id: cabinId },
    });

    res.json({ message: 'Cabaña eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cabaña' });
  }
};

export const createCabinAsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('createCabinAsAdmin - req.user:', req.user);
    const { title, description, location, price, capacity, bedrooms, bathrooms, latitude, longitude, amenities, images } = req.body;

    if (!title || !description || !location || !price || !capacity) {
      res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const data: any = {
      title,
      description,
      location,
      price: parseFloat(price),
      capacity: parseInt(capacity),
      ownerId: req.user.id,
    };

    if (bedrooms) data.bedrooms = parseInt(bedrooms);
    if (bathrooms) data.bathrooms = parseInt(bathrooms);
    if (latitude) data.latitude = parseFloat(latitude);
    if (longitude) data.longitude = parseFloat(longitude);
    if (amenities) data.amenities = JSON.stringify(amenities);
    if (images) data.images = JSON.stringify(images);

    const cabin = await prisma.cabin.create({
      data,
      include: { owner: { select: { name: true, email: true } } },
    });

    res.status(201).json({ message: 'Cabaña creada exitosamente', cabin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cabaña' });
  }
};

export const updateCabinAsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cabinId } = req.params;
    const { title, description, location, price, capacity, bedrooms, bathrooms, amenities, images } = req.body;

    if (!title || !description || !location || !price || !capacity) {
      res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes' });
      return;
    }

    const data: any = {
      title,
      description,
      location,
      price: parseFloat(price),
      capacity: parseInt(capacity),
    };

    if (bedrooms) data.bedrooms = parseInt(bedrooms);
    if (bathrooms) data.bathrooms = parseInt(bathrooms);
    if (amenities) data.amenities = JSON.stringify(amenities);
    if (images) data.images = JSON.stringify(images);

    const cabin = await prisma.cabin.update({
      where: { id: cabinId },
      data,
      include: { owner: { select: { name: true, email: true } } },
    });

    res.json({ message: 'Cabaña actualizada exitosamente', cabin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cabaña' });
  }
};

export const getAllBookingsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        cabin: { select: { id: true, title: true, location: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { checkIn: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

export const confirmBookingAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
      include: {
        cabin: { select: { title: true } },
        user: { select: { name: true, email: true } }
      }
    });

    res.json({ message: 'Reserva confirmada', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al confirmar reserva' });
  }
};

export const updateBookingAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { checkIn, checkOut, totalPrice, status } = req.body;

    const data: any = {};
    if (checkIn) data.checkIn = new Date(checkIn);
    if (checkOut) data.checkOut = new Date(checkOut);
    if (totalPrice !== undefined) data.totalPrice = parseFloat(totalPrice);
    if (status) data.status = status;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data,
      include: {
        cabin: { select: { title: true, location: true } },
        user: { select: { name: true, email: true } }
      }
    });

    res.json({ message: 'Reserva actualizada', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
};