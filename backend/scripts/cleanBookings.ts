import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanBookings() {
  try {
    console.log('🗑️  Eliminando todas las reservas...');
    const result = await prisma.booking.deleteMany({});
    console.log(`✅ Se eliminaron ${result.count} reservas`);
  } catch (error) {
    console.error('❌ Error al eliminar reservas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanBookings();
