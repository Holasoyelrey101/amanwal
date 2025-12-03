import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShield, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './role-assignment-modal.css';

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentRole: string;
  onRoleUpdated: () => void;
  token: string;
}

const ROLES = [
  {
    name: 'admin',
    label: 'Admin',
    color: '#ef4444',
    description: 'Acceso total al sistema'
  },
  {
    name: 'developer',
    label: 'Developer',
    color: '#6366f1',
    description: 'Acceso técnico y datos'
  },
  {
    name: 'soporte',
    label: 'Soporte',
    color: '#22c55e',
    description: 'Gestión de reservas y soporte'
  },
  {
    name: 'user',
    label: 'Usuario',
    color: '#3b82f6',
    description: 'Usuario estándar'
  }
];

const PERMISSIONS = {
  admin: [
    'Acceso total al sistema',
    'Gestión de usuarios',
    'Gestión de cabañas',
    'Gestión de reservas',
    'Asignar roles y permisos'
  ],
  developer: [
    'Acceso a datos del sistema',
    'Gestión de cabañas',
    'Acceso a logs',
    'Configuración técnica',
    'Análisis de errores'
  ],
  soporte: [
    'Gestión de reservas',
    'Soporte a usuarios',
    'Ver reseñas',
    'Responder consultas',
    'Generar reportes'
  ],
  user: [
    'Ver cabañas',
    'Hacer reservas',
    'Dejar reseñas',
    'Gestionar mi perfil',
    'Historial de reservas'
  ]
};

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currentRole,
  onRoleUpdated,
  token
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAssignRole = async () => {
    if (selectedRole === currentRole) {
      setError('Debes seleccionar un rol diferente al actual');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(
        `http://localhost:3000/api/admin/users/${userId}/role`,
        { role: selectedRole },
        { headers }
      );

      setSuccess(true);
      setTimeout(() => {
        onRoleUpdated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar el rol');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedRoleData = ROLES.find(r => r.name === selectedRole);

  return (
    <div className="role-modal-overlay" onClick={onClose}>
      <div className="role-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="role-modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="role-modal-header">
          <FontAwesomeIcon icon={faShield} className="role-modal-icon" />
          <h2>Asignar Rango a {userName}</h2>
          <p>Rango actual: <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{currentRole.toUpperCase()}</span></p>
        </div>

        <div className="role-modal-body">
          {/* Role Selection Grid */}
          <div className="role-selection-grid">
            {ROLES.map((role) => (
              <div
                key={role.name}
                className={`role-selection-card ${selectedRole === role.name ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.name)}
                style={{
                  borderColor: selectedRole === role.name ? role.color : 'rgba(59, 130, 246, 0.2)',
                }}
              >
                <div className="role-selection-header">
                  <div
                    className="role-selection-icon"
                    style={{
                      background: `linear-gradient(135deg, ${role.color} 0%, ${role.color}dd 100%)`,
                      boxShadow: `0 8px 20px ${role.color}40`
                    }}
                  >
                    <FontAwesomeIcon icon={faShield} />
                  </div>
                  {selectedRole === role.name && (
                    <div className="role-selection-check">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>
                <h4>{role.label}</h4>
                <p>{role.description}</p>
              </div>
            ))}
          </div>

          {/* Permissions for Selected Role */}
          {selectedRoleData && (
            <div className="role-permissions-display">
              <h3>Permisos para {selectedRoleData.label}</h3>
              <ul className="permissions-list">
                {PERMISSIONS[selectedRole as keyof typeof PERMISSIONS]?.map((perm, idx) => (
                  <li key={idx}>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="role-modal-error">
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="role-modal-success">
              <FontAwesomeIcon icon={faCheck} />
              <p>¡Rol asignado correctamente!</p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="role-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading || success}>
            Cancelar
          </button>
          <button
            className="btn-assign"
            onClick={handleAssignRole}
            disabled={loading || success || selectedRole === currentRole}
            style={{
              opacity: selectedRole === currentRole ? 0.5 : 1,
              cursor: selectedRole === currentRole ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Asignando...' : success ? '✓ Asignado' : 'Asignar Rango'}
          </button>
        </div>
      </div>
    </div>
  );
};
