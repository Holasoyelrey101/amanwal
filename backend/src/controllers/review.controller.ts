import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { cabinId, rating, comment } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!cabinId || !rating || !comment) {
      res.status(400).json({ error: 'Campos requeridos faltantes' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
      return;
    }

    // Verificar que el usuario ha reservado esta cabaña (opcional para desarrollo)
    const booking = await prisma.booking.findFirst({
      where: { cabinId, userId },
    });

    // Permitir reseña solo si ha reservado (comentar para desarrollo sin restricción)
    // if (!booking) {
    //   res.status(403).json({ error: 'Solo puedes revisar cabañas que has reservado' });
    //   return;
    // }

    const review = await prisma.review.create({
      data: {
        cabinId,
        userId,
        rating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

export const getCabinReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cabinId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { cabinId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};
