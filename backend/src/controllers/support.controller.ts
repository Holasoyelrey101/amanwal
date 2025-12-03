import { Request, Response } from 'express';
import { prisma } from '../server';
import { sendEmail, getTicketCreatedTemplate, getTicketResponseTemplate } from '../services/emailService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Generar número de ticket único
const generateTicketNumber = () => `TK-${Date.now()}`;

// Obtener todos los tickets (para admin y soporte)
export const getAllTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, search } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { ticketNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        assignedTo: {
          select: { id: true, email: true, name: true }
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, email: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

// Obtener tickets del usuario actual
export const getUserTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        assignedTo: {
          select: { id: true, email: true, name: true }
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, email: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tus tickets' });
  }
};

// Obtener un ticket específico
export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        assignedTo: {
          select: { id: true, email: true, name: true }
        },
        messages: {
          include: {
            user: { select: { id: true, email: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

// Crear nuevo ticket
export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, description, priority = 'normal', category = 'general' } = req.body;

    if (!userId || !title || !description) {
      res.status(400).json({ error: 'Título y descripción son requeridos' });
      return;
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        title,
        description,
        priority,
        category,
        userId
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });

    // Enviar email de confirmación
    if (ticket.user?.email) {
      const emailTemplate = getTicketCreatedTemplate(
        ticket.ticketNumber,
        ticket.title,
        ticket.user.email,
        process.env.FRONTEND_URL || 'http://localhost:5173'
      );
      
      const emailResult = await sendEmail({
        to: ticket.user.email,
        subject: `✅ Ticket Creado: ${ticket.ticketNumber}`,
        html: emailTemplate
      });
      
      if (emailResult.success) {
        console.log(`📧 Email de confirmación enviado a ${ticket.user.email}`);
      } else {
        console.error(`⚠️ Error al enviar email a ${ticket.user.email}:`, emailResult.error);
      }
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

// Agregar mensaje a un ticket
export const addMessageToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId || !content) {
      res.status(400).json({ error: 'Contenido del mensaje requerido' });
      return;
    }

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        content,
        ticketId,
        userId
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });

    // Enviar email si es una respuesta del soporte (no del usuario que creó el ticket)
    if (userId !== ticket.userId && ['admin', 'soporte', 'developer'].includes(req.user?.role || '')) {
      const ticketWithUser = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { user: { select: { email: true, name: true } } }
      });

      if (ticketWithUser?.user?.email) {
        const senderName = message.user?.name || 'Equipo de Soporte Amanwal';
        const emailTemplate = getTicketResponseTemplate(
          ticket.ticketNumber,
          senderName,
          content,
          process.env.FRONTEND_URL || 'http://localhost:5173'
        );

        const emailResult = await sendEmail({
          to: ticketWithUser.user.email,
          subject: `📨 Nueva respuesta en ticket ${ticket.ticketNumber}`,
          html: emailTemplate
        });

        if (emailResult.success) {
          console.log(`📧 Email de respuesta enviado a ${ticketWithUser.user.email}`);
        } else {
          console.error(`⚠️ Error al enviar email a ${ticketWithUser.user.email}:`, emailResult.error);
        }
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar mensaje' });
  }
};

// Actualizar estado del ticket
export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'closed', 'resolved'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
      include: {
        user: { select: { id: true, email: true, name: true } },
        assignedTo: { select: { id: true, email: true, name: true } },
        messages: { include: { user: { select: { id: true, email: true, name: true } } } }
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
};

// Asignar ticket a un soporte
export const assignTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { assignedToId } = req.body;

    if (!assignedToId) {
      res.status(400).json({ error: 'ID del usuario requerido' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        assignedTo: { select: { id: true, email: true, name: true } },
        messages: { include: { user: { select: { id: true, email: true, name: true } } } }
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al asignar ticket' });
  }
};

// Eliminar un ticket (solo para admin/soporte, y solo si está cerrado o resuelto)
export const deleteTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketId } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      res.status(404).json({ error: 'Ticket no encontrado' });
      return;
    }

    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      res.status(400).json({ 
        error: 'Solo puedes eliminar tickets cerrados o resueltos' 
      });
      return;
    }

    // Eliminar primero los mensajes asociados
    await prisma.message.deleteMany({
      where: { ticketId }
    });

    // Luego eliminar el ticket
    await prisma.ticket.delete({
      where: { id: ticketId }
    });

    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar ticket' });
  }
};
