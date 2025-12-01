const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const email = 'sir.uk101@gmail.com';
    
    // Buscar si el usuario existe
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Si existe, actualizar a admin
      user = await prisma.user.update({
        where: { email },
        data: { role: 'admin', isEmailVerified: true },
      });
      console.log(`✓ Usuario existente actualizado a admin:`, user.email, user.role);
    } else {
      // Si no existe, crear como admin
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      user = await prisma.user.create({
        data: {
          email,
          name: 'Admin Amanwal',
          password: hashedPassword,
          role: 'admin',
          isEmailVerified: true,
        },
      });
      console.log(`✓ Usuario admin creado:`, user.email, user.role);
      console.log(`  Contraseña temporal: Admin@123456`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
