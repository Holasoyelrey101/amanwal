import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/cabin/:cabinId', bookingController.getCabinBookings);
router.get('/', authMiddleware, bookingController.getMyBookings);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.patch('/:id/confirm', authMiddleware, bookingController.confirmUserBooking);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

export default router;
