import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ENDPOINT TEMPORAL: Solo usar UNA VEZ para crear el primer admin
// ⚠️ ELIMINAR DESPUÉS DE USAR
router.get('/make-admin/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    res.json({
      message: 'Usuario actualizado a admin',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

export default router;
