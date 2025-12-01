import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshUser?: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Tiempo de inactividad (ms). Ajusta según necesidad.
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
  const inactivityTimerRef = useRef<number | null>(null);

  const refreshUser = async () => {
    try {
      if (!token) return;
      
      const response = await axios.get('/api/auth/current-role', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.role && user) {
        const updatedUser = { ...user, role: response.data.role };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user role:', error);
    }
  };

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Cerrar sesión solo en el PRIMER cargue de la aplicación
  useEffect(() => {
    // Verifica si es la primera carga del navegador (no una recarga del usuario)
    if (sessionStorage.getItem('app_loaded') === null) {
      // Primera carga: limpia sesión previa
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      // Marca que la app ya ha cargado
      sessionStorage.setItem('app_loaded', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validar y sincronizar el rol del usuario en el cargue de la app
  useEffect(() => {
    if (token && user) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejador para resetear el temporizador de inactividad
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = window.setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  // Activar seguimiento de inactividad sólo cuando hay sesión activa
  useEffect(() => {
    if (!token) {
      // Si no hay sesión, no escuchamos eventos
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer, { passive: true }));
    // Inicia el temporizador al montar con sesión activa
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
