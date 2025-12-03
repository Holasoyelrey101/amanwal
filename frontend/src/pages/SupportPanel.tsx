import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import '../styles/support-panel.css';

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

export const SupportPanel: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    ticketId: ''
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: 'general'
  });

  // Cargar tickets
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
  }, [filter, search, selectedTicket?.id]);

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
      
      let url = '/support/tickets';
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);
      
      const response = await apiClient.get(url, { params });
      setTickets(response.data);
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
      alert('Ticket creado exitosamente');
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
    } catch (error) {
      console.error(error);
      alert('Error al agregar el mensaje');
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await apiClient.patch(
        `/support/tickets/${ticketId}/status`,
        { status: newStatus }
      );
      
      const updated = response.data;
      setTickets(tickets.map(t => t.id === ticketId ? updated : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updated);
      }
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await apiClient.delete(`/support/tickets/${ticketId}`);
      
      setTickets(tickets.filter(t => t.id !== ticketId));
      setSelectedTicket(null);
      setDeleteConfirmModal({ isOpen: false, ticketId: '' });
      setNotification({
        isOpen: true,
        message: 'Ticket eliminado correctamente',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ ...notification, isOpen: false });
      }, 3000);
    } catch (error) {
      console.error(error);
      setNotification({
        isOpen: true,
        message: 'Error al eliminar el ticket',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ ...notification, isOpen: false });
      }, 3000);
    }
  };

  const confirmDelete = (ticketId: string) => {
    setDeleteConfirmModal({ isOpen: true, ticketId });
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
    const texts: Record<string, string> = {
      'open': 'Abierto',
      'in-progress': 'En progreso',
      'closed': 'Cerrado',
      'resolved': 'Resuelto'
    };
    return texts[status] || status;
  };

  return (
    <div className="support-panel">
      <div className="support-container">
        {/* Header */}
        <div className="support-header">
          <div>
            <h1>🎧 Panel de Soporte</h1>
            <p>Gestiona tickets de soporte y resuelve problemas</p>
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
            <h3>Crear Nuevo Ticket</h3>
            <form onSubmit={handleCreateTicket}>
              <input
                type="text"
                placeholder="Título del ticket"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="form-input"
              />
              <textarea
                placeholder="Descripción del problema"
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
                  <option value="low">Baja Prioridad</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta Prioridad</option>
                  <option value="urgent">Urgente</option>
                </select>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-select"
                >
                  <option value="general">General</option>
                  <option value="tecnico">Técnico</option>
                  <option value="facturacion">Facturación</option>
                  <option value="reserva">Reserva</option>
                </select>
              </div>
              <button type="submit" className="btn-submit">Crear Ticket</button>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="support-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Buscar tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            {(['all', 'open', 'in-progress', 'closed'] as const).map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'Todos' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="support-content">
          {/* Lista de tickets */}
          <div className="tickets-list">
            <h2>Tickets ({tickets.length})</h2>
            {loading ? (
              <div className="loading">Cargando...</div>
            ) : tickets.length === 0 ? (
              <div className="no-tickets">No hay tickets que mostrar</div>
            ) : (
              <div className="tickets-container">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className={`ticket-card ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="ticket-header">
                      <div className="ticket-number">{ticket.ticketNumber}</div>
                      <div 
                        className="ticket-priority"
                        style={{backgroundColor: getPriorityColor(ticket.priority)}}
                      >
                        {ticket.priority.toUpperCase()}
                      </div>
                    </div>
                    <h3 className="ticket-title">{ticket.title}</h3>
                    <p className="ticket-description">{ticket.description.substring(0, 100)}...</p>
                    <div className="ticket-footer">
                      <span className="ticket-status">{getStatusText(ticket.status)}</span>
                      <span className="ticket-date">
                        {new Date(ticket.createdAt).toLocaleDateString()}
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
                <div className="header-actions">
                  {user?.role === 'admin' && (
                    <select 
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="open">Abierto</option>
                      <option value="in-progress">En progreso</option>
                      <option value="closed">Cerrado</option>
                      <option value="resolved">Resuelto</option>
                    </select>
                  )}
                  {user?.role === 'soporte' && (
                    <div className="status-display">{getStatusText(selectedTicket.status)}</div>
                  )}
                  {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && user?.role === 'admin' && (
                    <button 
                      className="btn-delete"
                      onClick={() => confirmDelete(selectedTicket.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>

              {/* Información del usuario */}
              <div className="ticket-info">
                <div className="info-group">
                  <label>Reportado por:</label>
                  <p>{selectedTicket.user.name || selectedTicket.user.email}</p>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="info-group">
                    <label>Asignado a:</label>
                    <p>{selectedTicket.assignedTo.name || selectedTicket.assignedTo.email}</p>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="ticket-description-full">
                <h3>Descripción</h3>
                <p>{selectedTicket.description}</p>
              </div>

              {/* Thread de mensajes */}
              <div className="messages-thread">
                <h3>💬 Mensajes ({selectedTicket.messages.length})</h3>
                <div className="messages-list">
                  {selectedTicket.messages.length === 0 ? (
                    <div className="no-messages">No hay mensajes aún</div>
                  ) : (
                    selectedTicket.messages.map(message => (
                      <div key={message.id} className="message">
                        <div className="message-header">
                          <strong>{message.user.name || message.user.email}</strong>
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="message-content">{message.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario de nuevo mensaje */}
                <form onSubmit={handleAddMessage} className="new-message-form">
                  <textarea
                    placeholder="Escribe tu respuesta aquí..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="message-input"
                  />
                  <button type="submit" className="btn-send">
                    📤 Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-content">
              <div className="confirm-icon">⚠️</div>
              <h2>¿Eliminar este ticket?</h2>
              <p>Esta acción <strong>no se puede deshacer</strong>. El ticket y todos sus mensajes serán eliminados permanentemente.</p>
              <div className="confirm-modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, ticketId: '' })}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-confirm-delete"
                  onClick={() => handleDeleteTicket(deleteConfirmModal.ticketId)}
                >
                  🗑️ Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de Éxito/Error */}
      {notification.isOpen && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' && <span className="notification-icon">✓</span>}
          {notification.type === 'error' && <span className="notification-icon">✕</span>}
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
    </div>
  );
};
