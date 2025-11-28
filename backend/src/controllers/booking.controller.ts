import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const generateBookingNumber = (): string => {
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `RES-${randomNum}`;
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { cabinId, checkIn, checkOut } = req.body;

    if (!cabinId || !checkIn || !checkOut) {
      res.status(400).json({ error: 'Campos requeridos faltantes' });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const cabin = await prisma.cabin.findUnique({ where: { id: cabinId } });
    if (!cabin) {
      res.status(404).json({ error: 'Cabaña no encontrada' });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validar fechas
    if (checkInDate >= checkOutDate) {
      res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
      return;
    }

    // Verificar disponibilidad
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        cabinId,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gt: checkInDate } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      res.status(400).json({ error: 'Estas fechas no están disponibles' });
      return;
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = cabin.price * nights;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        cabinId,
        userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: 'confirmed'
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        cabin: true,
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

export const getCabinBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cabinId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: {
        cabinId,
        status: { not: 'cancelled' }
      },
      select: {
        checkIn: true,
        checkOut: true
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas de cabaña' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.userId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para cancelar esta reserva' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};
