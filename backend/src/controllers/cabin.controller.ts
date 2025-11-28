import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAllCabins = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cabins = await prisma.cabin.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(cabins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cabañas' });
  }
};

export const getCabinById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cabin = await prisma.cabin.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: true,
      },
    });

    if (!cabin) {
      res.status(404).json({ error: 'Cabaña no encontrada' });
      return;
    }

    res.json(cabin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cabaña' });
  }
};

export const createCabin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, description, location, latitude, longitude, price, capacity, bedrooms, bathrooms, amenities, images } = req.body;

    if (!title || !description || !location || !price || !capacity) {
      res.status(400).json({ error: 'Campos requeridos faltantes' });
      return;
    }

    const cabin = await prisma.cabin.create({
      data: {
        title,
        description,
        location,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        amenities: JSON.stringify(amenities || []),
        images: JSON.stringify(images || []),
        ownerId: userId,
      },
    });

    res.status(201).json(cabin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cabaña' });
  }
};

export const updateCabin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Verificar que el usuario es el propietario
    const cabin = await prisma.cabin.findUnique({ where: { id } });
    if (!cabin || cabin.ownerId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para actualizar esta cabaña' });
      return;
    }

    const updatedCabin = await prisma.cabin.update({
      where: { id },
      data: req.body,
    });

    res.json(updatedCabin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cabaña' });
  }
};

export const deleteCabin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Verificar que el usuario es el propietario
    const cabin = await prisma.cabin.findUnique({ where: { id } });
    if (!cabin || cabin.ownerId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para eliminar esta cabaña' });
      return;
    }

    await prisma.cabin.delete({ where: { id } });

    res.json({ message: 'Cabaña eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cabaña' });
  }
};
