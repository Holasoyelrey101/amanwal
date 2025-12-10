import { Router, Request, Response } from 'express';
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
  createManualBooking,
} from '../controllers/admin.controller';
import {
  getMaintenanceStatus,
  enableMaintenance,
  disableMaintenance,
} from '../middleware/maintenance.middleware';

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
router.post('/bookings', createManualBooking);
router.patch('/bookings/:bookingId/confirm', confirmBookingAdmin);
router.patch('/bookings/:bookingId', updateBookingAdmin);

// Mantenimiento (permite acceso con token especial incluso en mantenimiento)
router.get('/maintenance', (req: Request, res: Response) => {
  const status = getMaintenanceStatus();
  res.json({
    success: true,
    maintenance: status,
  });
});

router.post(
  '/maintenance/enable',
  (req: Request, res: Response) => {
    const { message } = req.body;
    enableMaintenance(message || 'Sistema en mantenimiento');

    res.json({
      success: true,
      message: 'Modo mantenimiento activado',
      maintenance: getMaintenanceStatus(),
    });
  }
);

router.post(
  '/maintenance/disable',
  (req: Request, res: Response) => {
    disableMaintenance();

    res.json({
      success: true,
      message: 'Modo mantenimiento desactivado',
      maintenance: getMaintenanceStatus(),
    });
  }
);

export default router;
