import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import flowService from '../services/flowService';
import { sendEmail, getConfirmationEmailTemplate } from '../utils/emailService';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/payments/create
 * Crea una orden de pago en Flow
 * Requiere: bookingId
 */
router.post('/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId es requerido' });
    }

    // Obtener detalles de la reserva
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        cabin: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Verificar que la reserva pertenece al usuario
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Crear orden en Flow
    const confirmationUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/confirm`;
    
    // La URL de retorno debe ser el backend, que luego redirige al frontend
    const returnUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/return/${bookingId}`;

    const paymentResponse = await flowService.createPayment({
      commerceOrder: booking.bookingNumber,
      subject: `Reserva - ${booking.cabin.title}`,
      currency: 'CLP',
      amount: booking.totalPrice,
      email: booking.user.email,
      urlConfirmation: confirmationUrl,
      urlReturn: returnUrl,
    });

    // Guardar token de Flow en la reserva para después
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentToken: paymentResponse.token,
        flowOrder: paymentResponse.flowOrder,
      },
    });

    // Construir URL de redirección
    const redirectUrl = flowService.buildRedirectUrl(paymentResponse);

    console.log(`💳 Reserva ${booking.bookingNumber} lista para pago`);

    res.json({
      success: true,
      redirectUrl: redirectUrl,
      token: paymentResponse.token,
      flowOrder: paymentResponse.flowOrder,
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({
      error: 'Error al procesar pago',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET/POST /api/payments/return/:bookingId
 * Maneja la redirección desde Flow
 * Flow redirige aquí y luego enviamos al frontend
 */
router.get('/return/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId es requerido' });
    }

    console.log(`🔄 Retorno de Flow para reserva: ${bookingId}`);

    // Redirigir al frontend a la página de retorno
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment-return/${bookingId}`);
  } catch (error) {
    console.error('Error en retorno de Flow:', error);
    res.status(500).json({
      error: 'Error al procesar retorno de pago',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post('/return/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId es requerido' });
    }

    console.log(`🔄 Retorno POST de Flow para reserva: ${bookingId}`);

    // Redirigir al frontend a la página de retorno
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment-return/${bookingId}`);
  } catch (error) {
    console.error('Error en retorno de Flow:', error);
    res.status(500).json({
      error: 'Error al procesar retorno de pago',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /api/payments/confirm
 * Webhook que recibe Flow para confirmar el pago
 * Flow envía: token (POST body)
 */
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      console.error('❌ Token no recibido en webhook de Flow');
      return res.status(400).json({ error: 'Token es requerido' });
    }

    console.log(`🔔 Webhook recibido - Token: ${token}`);

    // Verificar estado del pago con Flow
    const paymentStatus = await flowService.getPaymentStatus(token);

    console.log(`📊 Estado del pago: ${paymentStatus.status}`);
    console.log(`💰 Monto: ${paymentStatus.amount}`);
    console.log(`📋 Orden: ${paymentStatus.commerceOrder}`);

    // Buscar la reserva por bookingNumber
    const booking = await prisma.booking.findUnique({
      where: { bookingNumber: paymentStatus.commerceOrder },
    });

    if (!booking) {
      console.error(`❌ Reserva ${paymentStatus.commerceOrder} no encontrada`);
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Actualizar estado del pago en la reserva
    if (flowService.isPaymentSuccessful(paymentStatus.status)) {
      console.log(`✅ Pago exitoso - Reserva: ${booking.bookingNumber}`);

      // Obtener datos completos de la reserva incluyendo relaciones
      const updatedBooking = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: {
          user: true,
          cabin: true,
        },
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'confirmed',
          paymentStatus: 'completed',
          paymentDate: new Date(),
        },
      });

      // Enviar email de confirmación de pago
      try {
        if (updatedBooking) {
          const emailTemplate = getConfirmationEmailTemplate(
            updatedBooking.user.name,
            updatedBooking.cabin.title,
            updatedBooking.checkIn.toISOString(),
            updatedBooking.checkOut.toISOString(),
            updatedBooking.totalPrice,
            updatedBooking.bookingNumber
          );

          await sendEmail({
            to: updatedBooking.user.email,
            subject: `✓ Reserva Confirmada - ${updatedBooking.bookingNumber}`,
            html: emailTemplate
          });

          console.log(`📧 Email de confirmación enviado a ${updatedBooking.user.email}`);
        }
      } catch (emailError) {
        console.error('Error al enviar email de confirmación:', emailError);
        // No fallar la confirmación de pago si el email falla
      }

      res.json({
        success: true,
        message: 'Pago confirmado',
        status: paymentStatus.status,
      });
    } else if (flowService.isPaymentPending(paymentStatus.status)) {
      console.log(`⏳ Pago pendiente - Reserva: ${booking.bookingNumber}`);

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'pending',
          paymentStatus: 'pending',
        },
      });

      res.json({
        success: true,
        message: 'Pago pendiente',
        status: paymentStatus.status,
      });
    } else if (flowService.isPaymentRejected(paymentStatus.status)) {
      console.log(`❌ Pago rechazado - Reserva: ${booking.bookingNumber}`);

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'cancelled',
          paymentStatus: 'failed',
        },
      });

      res.json({
        success: false,
        message: 'Pago rechazado',
        status: paymentStatus.status,
      });
    }
  } catch (error) {
    console.error('Error en webhook de Flow:', error);
    res.status(500).json({
      error: 'Error al procesar confirmación',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/payments/status/:token
 * Obtiene el estado de un pago (para consultas del frontend)
 */
router.get('/status/:token', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: 'Token es requerido' });
    }

    const paymentStatus = await flowService.getPaymentStatus(token);

    res.json({
      success: true,
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      commerceOrder: paymentStatus.commerceOrder,
      isSuccessful: flowService.isPaymentSuccessful(paymentStatus.status),
      isPending: flowService.isPaymentPending(paymentStatus.status),
      isRejected: flowService.isPaymentRejected(paymentStatus.status),
    });
  } catch (error) {
    console.error('Error al obtener estado:', error);
    res.status(500).json({
      error: 'Error al obtener estado del pago',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
