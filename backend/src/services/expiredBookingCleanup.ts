import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cancela automáticamente las reservas cuyo tiempo de pago ha expirado
 * Se ejecuta cada minuto
 */
export const cancelExpiredBookings = async () => {
  try {
    const now = new Date();

    // Buscar todas las reservas pendientes cuyo tiempo de pago ha expirado
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'pending',
        paymentExpiresAt: {
          lt: now, // paymentExpiresAt < now
        },
      },
    });

    if (expiredBookings.length === 0) {
      console.log('✓ No hay reservas vencidas para cancelar');
      return;
    }

    // Cancelar todas las reservas vencidas
    const cancelled = await prisma.booking.updateMany({
      where: {
        status: 'pending',
        paymentExpiresAt: {
          lt: now,
        },
      },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed',
      },
    });

    console.log(`⏰ ${cancelled.count} reservas canceladas por expiración de tiempo de pago`);

    // Log de cada reserva cancelada
    expiredBookings.forEach((booking) => {
      console.log(`  - Reserva ${booking.bookingNumber} cancelada (expiró a ${booking.paymentExpiresAt})`);
    });
  } catch (error) {
    console.error('❌ Error al cancelar reservas vencidas:', error);
  }
};

/**
 * Inicia un intervalo que ejecuta cancelExpiredBookings cada minuto
 */
export const startExpiredBookingCleanup = () => {
  console.log('⏰ Iniciando limpieza automática de reservas vencidas (cada minuto)');

  // Ejecutar inmediatamente
  cancelExpiredBookings();

  // Ejecutar cada minuto
  setInterval(() => {
    cancelExpiredBookings();
  }, 60 * 1000); // 1 minuto

  console.log('✓ Limpieza automática activada');
};

export default {
  cancelExpiredBookings,
  startExpiredBookingCleanup,
};
