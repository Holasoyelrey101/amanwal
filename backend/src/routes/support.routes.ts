import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  addMessageToTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket
} from '../controllers/support.controller';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = Router();

// Middleware para verificar que el usuario sea admin o soporte
const isSupportOrAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role && ['admin', 'soporte'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'No tienes permiso para acceder' });
  }
};

// Middleware para verificar que sea admin
const isAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Solo administradores pueden hacer esto' });
  }
};

// Aplicar auth middleware a todas las rutas
router.use(authMiddleware);

// Rutas de tickets
router.get('/tickets', isSupportOrAdmin, getAllTickets);
router.get('/my-tickets', getUserTickets);
router.get('/tickets/:ticketId', getTicketById);
router.post('/tickets', createTicket);
router.patch('/tickets/:ticketId/status', isSupportOrAdmin, updateTicketStatus);
router.patch('/tickets/:ticketId/assign', isAdmin, assignTicket);
router.delete('/tickets/:ticketId', isSupportOrAdmin, deleteTicket);

// Rutas de mensajes
router.post('/tickets/:ticketId/messages', addMessageToTicket);

export default router;
