import { Router } from 'express';
import * as cabinController from '../controllers/cabin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', cabinController.getAllCabins);
router.get('/:id', cabinController.getCabinById);
router.post('/', authMiddleware, cabinController.createCabin);
router.put('/:id', authMiddleware, cabinController.updateCabin);
router.delete('/:id', authMiddleware, cabinController.deleteCabin);

export default router;
