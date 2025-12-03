import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail, getCancellationEmailTemplate, getConfirmationEmailTemplate } from '../utils/emailService';

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
        status: 'pending',
        paymentStatus: 'pending'
      },
      include: {
        cabin: true,
        user: true
      }
    });

    // NO enviar email aquí - esperar a confirmación de pago
    // El email se enviará cuando el webhook de Flow confirme el pago

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
    const userRole = req.user?.role;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cabin: true,
        user: true
      }
    });

    if (!booking) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    // Permitir cancelación si es el propietario o si es admin
    if (booking.userId !== userId && userRole !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para cancelar esta reserva' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        cabin: true,
        user: true
      }
    });

    // Enviar email de cancelación
    try {
      const emailTemplate = getCancellationEmailTemplate(
        updatedBooking.user.name,
        updatedBooking.cabin.title,
        updatedBooking.checkIn.toISOString(),
        updatedBooking.checkOut.toISOString(),
        updatedBooking.totalPrice,
        updatedBooking.bookingNumber
      );

      await sendEmail({
        to: updatedBooking.user.email,
        subject: `❌ Reserva Cancelada - ${updatedBooking.bookingNumber}`,
        html: emailTemplate,
        fromName: '🏠 Amanwal Reservas'
      });
    } catch (emailError) {
      console.error('Error al enviar email de cancelación:', emailError);
      // No fallar la cancelación si el email falla
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
};

export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    // Solo el admin o el dueño de la reserva pueden eliminarla
    if (booking.userId !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para eliminar esta reserva' });
      return;
    }

    // Solo se pueden eliminar reservas canceladas
    if (booking.status !== 'cancelled') {
      res.status(400).json({ error: 'Solo se pueden eliminar reservas canceladas' });
      return;
    }

    await prisma.booking.delete({
      where: { id }
    });

    res.json({ message: 'Reserva eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
};

/**
 * Obtiene una reserva específica por ID (solo para el propietario)
 */
export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      res.status(400).json({ error: 'ID de reserva requerido' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        cabin: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            price: true,
            capacity: true,
            images: true,
          }
        }
      }
    });

    if (!booking) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    // Verificar que el usuario sea el propietario
    if (booking.userId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para ver esta reserva' });
      return;
    }

    res.json(booking);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
};

/**
 * Permite al usuario confirmar su propia reserva después de pagar
 * Usado después de que Flow redirige de vuelta
 */
export const confirmUserBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    // Solo el propietario puede confirmar su propia reserva
    if (booking.userId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para confirmar esta reserva' });
      return;
    }

    // Solo confirmar si está en pending
    if (booking.status !== 'pending') {
      res.status(400).json({ error: 'Esta reserva ya no puede ser confirmada' });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentDate: new Date(),
      }
    });

    // NO enviar email aquí - el webhook de Flow ya lo envía
    // Solo actualizar el estado de la reserva

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al confirmar reserva' });
  }
};
