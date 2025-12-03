import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import './my-tickets.css';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'closed' | 'resolved';
  category: string;
  user: User;
  assignedTo?: User;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const MyTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed' | 'resolved'>('all');
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: 'general'
  });

  useEffect(() => {
    fetchTickets();
    
    // Polling automático cada 5 segundos para actualizar tickets
    const interval = setInterval(() => {
      fetchTickets();
      
      // Si hay un ticket seleccionado, también actualizar sus detalles
      if (selectedTicket) {
        updateSelectedTicket(selectedTicket.id);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [filter, selectedTicket?.id]);

  const updateSelectedTicket = async (ticketId: string) => {
    try {
      const response = await apiClient.get(`/support/tickets/${ticketId}`);
      const updatedTicket = response.data;
      setSelectedTicket(updatedTicket);
      
      // Actualizar en la lista también
      setTickets(tickets.map(t => t.id === ticketId ? updatedTicket : t));
    } catch (error) {
      console.error('Error al actualizar ticket:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/support/my-tickets');
      
      let filtered = response.data;
      if (filter !== 'all') {
        filtered = filtered.filter((t: Ticket) => t.status === filter);
      }
      
      setTickets(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await apiClient.post('/support/tickets', formData);
      
      const newTicket = response.data;
      setTickets([newTicket, ...tickets]);
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        category: 'general'
      });
      setShowForm(false);
      setSuccessModal({
        isOpen: true,
        title: '✅ Ticket creado exitosamente',
        message: `Se ha enviado una confirmación a tu correo con el número de ticket ${newTicket.ticketNumber} y detalles.\n\nNuestro equipo de soporte responderá pronto.`,
        icon: '🎫'
      });
      setTimeout(() => {
        setSuccessModal({ ...successModal, isOpen: false });
      }, 4000);
    } catch (error) {
      console.error(error);
      alert('Error al crear el ticket');
    }
  };

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const response = await apiClient.post(
        `/support/tickets/${selectedTicket.id}/messages`,
        { content: newMessage }
      );
      
      const message = response.data;
      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, message]
      });
      setNewMessage('');
      setSuccessModal({
        isOpen: true,
        title: '✅ Mensaje enviado',
        message: 'Se ha notificado al equipo de soporte sobre tu respuesta.\n\nEstaremos atentos a continuar con tu consulta.',
        icon: '💬'
      });
      setTimeout(() => {
        setSuccessModal({ ...successModal, isOpen: false });
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('Error al agregar el mensaje');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': '#4ade80',
      'normal': '#60a5fa',
      'high': '#fbbf24',
      'urgent': '#ef4444'
    };
    return colors[priority] || '#60a5fa';
  };

  const getStatusText = (status: string) => {
    const statusEmojis: Record<string, string> = {
      'open': '🟢 Abierto',
      'in-progress': '🔵 En progreso',
      'closed': '⚫ Cerrado',
      'resolved': '✅ Resuelto'
    };
    return statusEmojis[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'open': 'rgba(74, 222, 128, 0.2)',
      'in-progress': 'rgba(96, 165, 250, 0.2)',
      'closed': 'rgba(209, 213, 219, 0.2)',
      'resolved': 'rgba(34, 197, 94, 0.2)'
    };
    return colors[status] || 'rgba(96, 165, 250, 0.2)';
  };

  return (
    <div className="my-tickets-container">
      <div className="my-tickets-content">
        {/* Header */}
        <div className="my-tickets-header">
          <div>
            <h1>🎫 Mis Tickets de Soporte</h1>
            <p>Gestiona tus solicitudes de soporte y mantén la conversación con nuestro equipo</p>
          </div>
          <button 
            className="btn-create-ticket"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '✚ Nuevo Ticket'}
          </button>
        </div>

        {/* Crear nuevo ticket */}
        {showForm && (
          <div className="create-ticket-form">
            <h3>📝 Crear Nuevo Ticket de Soporte</h3>
            <form onSubmit={handleCreateTicket}>
              <input
                type="text"
                placeholder="Título de tu problema"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="form-input"
              />
              <textarea
                placeholder="Describe el problema en detalle. Cuanto más específico seas, más rápido podremos ayudarte"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea"
              />
              <div className="form-row">
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="form-select"
                >
                  <option value="low">🟢 Baja Prioridad</option>
                  <option value="normal">🔵 Normal</option>
                  <option value="high">🟡 Alta Prioridad</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-select"
                >
                  <option value="general">❓ General</option>
                  <option value="tecnico">🔧 Técnico</option>
                  <option value="facturacion">💳 Facturación</option>
                  <option value="reserva">📅 Reserva</option>
                </select>
              </div>
              <button type="submit" className="btn-submit">Crear Ticket</button>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="my-tickets-filters">
          <div className="filter-buttons">
            {(['all', 'open', 'in-progress', 'closed', 'resolved'] as const).map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? '📊 Todos' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="my-tickets-grid">
          {/* Lista de tickets */}
          <div className="tickets-list">
            <h2>Tus Tickets ({tickets.length})</h2>
            {loading ? (
              <div className="loading">Cargando...</div>
            ) : tickets.length === 0 ? (
              <div className="no-tickets">
                <div className="no-tickets-icon">📭</div>
                <p>No tienes tickets aún</p>
                <small>Crea uno para comunicarte con nuestro equipo de soporte</small>
              </div>
            ) : (
              <div className="tickets-container">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`ticket-card ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{ borderLeft: `4px solid ${getPriorityColor(ticket.priority)}` }}
                  >
                    <div className="ticket-header">
                      <div className="ticket-number">{ticket.ticketNumber}</div>
                      <div 
                        className={`ticket-status-badge status-${ticket.status}`}
                      >
                        {getStatusText(ticket.status)}
                      </div>
                    </div>
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <p className="ticket-description">{ticket.description.substring(0, 60)}...</p>
                    <div className="ticket-footer">
                      <span className="ticket-date">
                        {new Date(ticket.createdAt).toLocaleDateString('es-CL')}
                      </span>
                      <span className="ticket-messages">
                        💬 {ticket.messages?.length || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detalles del ticket seleccionado */}
          {selectedTicket && (
            <div className="ticket-details">
              <div className="details-header">
                <div>
                  <h2>{selectedTicket.title}</h2>
                  <div className="details-meta">
                    <span className="badge">{selectedTicket.ticketNumber}</span>
                    <span className="badge" style={{backgroundColor: getPriorityColor(selectedTicket.priority)}}>
                      {selectedTicket.priority.toUpperCase()}
                    </span>
                    <span className="badge">{selectedTicket.category}</span>
                  </div>
                </div>
              </div>

              {/* Información del ticket */}
              <div className="ticket-info">
                <div className="info-group">
                  <label>📅 Fecha de creación:</label>
                  <p>{new Date(selectedTicket.createdAt).toLocaleString('es-CL')}</p>
                </div>
                <div className="info-group">
                  <label>📊 Estado:</label>
                  <p>{getStatusText(selectedTicket.status)}</p>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="info-group">
                    <label>👤 Asignado a:</label>
                    <p>{selectedTicket.assignedTo.name || selectedTicket.assignedTo.email}</p>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="ticket-description-full">
                <h3>📋 Descripción</h3>
                <p>{selectedTicket.description}</p>
              </div>

              {/* Thread de mensajes */}
              <div className="messages-thread">
                <h3>💬 Conversación ({selectedTicket.messages?.length || 0} mensajes)</h3>
                
                {!selectedTicket.messages || selectedTicket.messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="no-messages-icon">📪</div>
                    <p>No hay respuestas aún</p>
                    <small>Nuestro equipo está revisando tu solicitud</small>
                  </div>
                ) : (
                  <div className="messages-list">
                    {selectedTicket.messages.map(message => {
                      const isYou = message.user.id === user?.id;
                      return (
                        <div key={message.id} className={`message ${isYou ? 'user-message' : 'support-message'}`}>
                          <div className="message-header">
                            <strong>
                              {isYou ? '👤 Tú' : '🎧 ' + (message.user.name || 'Soporte')}
                            </strong>
                            <span className="message-time">
                              {new Date(message.createdAt).toLocaleString('es-CL')}
                            </span>
                          </div>
                          <p className="message-content">{message.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Formulario de nuevo mensaje */}
                {selectedTicket.status === 'closed' || selectedTicket.status === 'resolved' ? (
                  <div className="ticket-closed-message">
                    <div className="closed-icon">🔒</div>
                    <p>Este ticket está <strong>{selectedTicket.status === 'closed' ? 'cerrado' : 'resuelto'}</strong></p>
                    <small>No puedes agregar más respuestas a este ticket</small>
                  </div>
                ) : (
                  <form onSubmit={handleAddMessage} className="new-message-form">
                    <textarea
                      placeholder="Escribe tu respuesta aquí..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="message-input"
                    />
                    <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                      📤 Enviar Respuesta
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Éxito Premium */}
      {successModal.isOpen && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-content">
              <div className="success-icon">{successModal.icon}</div>
              <h2>{successModal.title}</h2>
              <p className="success-message">{successModal.message}</p>
              <button 
                className="success-modal-btn"
                onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
