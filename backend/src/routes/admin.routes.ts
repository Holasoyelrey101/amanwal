import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUser,
  getAllCabinsAdmin,
  deleteCabinAdmin,
  createCabinAsAdmin,
  updateCabinAsAdmin,
  getAllBookingsAdmin,
  confirmBookingAdmin,
  updateBookingAdmin,
} from '../controllers/admin.controller';

const router = Router();

// Aplicar autenticación y verificación de admin a todas las rutas
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Usuarios
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Cabañas
router.get('/cabins', getAllCabinsAdmin);
router.post('/cabins', createCabinAsAdmin);
router.put('/cabins/:cabinId', updateCabinAsAdmin);
router.delete('/cabins/:cabinId', deleteCabinAdmin);

// Reservas
router.get('/bookings', getAllBookingsAdmin);
router.patch('/bookings/:bookingId/confirm', confirmBookingAdmin);
router.patch('/bookings/:bookingId', updateBookingAdmin);

export default router;
