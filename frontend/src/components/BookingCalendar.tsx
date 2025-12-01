import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './booking-calendar.css';

interface BookingCalendarProps {
  cabinId: string;
  price: number;
  onClose: () => void;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
}

interface Booking {
  checkIn: string;
  checkOut: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ cabinId, price, onClose, onSelectDates }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [occupiedDates, setOccupiedDates] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Obtener reservas existentes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/bookings/cabin/${cabinId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await response.json();
        setOccupiedDates(data || []);
      } catch (err) {
        console.error('Error cargando reservas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [cabinId]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateOccupied = (date: Date): boolean => {
    return occupiedDates.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const isDateBetweenSelection = (date: Date): boolean => {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today || isDateOccupied(date)) return;

    if (!checkInDate) {
      setCheckInDate(date);
      setCheckOutDate(null);
    } else if (!checkOutDate) {
      if (date > checkInDate) {
        setCheckOutDate(date);
      } else {
        setCheckInDate(date);
        setCheckOutDate(null);
      }
    } else {
      setCheckInDate(date);
      setCheckOutDate(null);
    }
  };

  const handleReserve = () => {
    if (!checkInDate || !checkOutDate) {
      alert('Selecciona fechas de entrada y salida');
      return;
    }

    // Guardar las fechas en el formato adecuado
    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    // Llamar al callback si existe para guardar las fechas en el componente padre
    if (onSelectDates) {
      onSelectDates(checkInStr, checkOutStr);
    }

    // Cerrar el modal
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonth = monthNames[currentDate.getMonth()];

  const nights = checkInDate && checkOutDate ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights * price;

  return (
    <div className="booking-calendar-overlay" onClick={onClose}>
      <div className="booking-calendar-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="calendar-header-section">
          <button 
            className="month-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            ←
          </button>
          <div className="date-range-display">
            {checkInDate && checkOutDate && (
              <>
                <span className="date-label">{checkInDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                <span className="arrow">→</span>
                <span className="date-label">{checkOutDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              </>
            )}
            {(!checkInDate || !checkOutDate) && (
              <span className="select-dates-hint">Selecciona tus fechas</span>
            )}
          </div>
          <button 
            className="month-nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            →
          </button>
        </div>

        {!isLoggedIn && (
          <div className="warning-box">
            Debes estar logueado para reservar. 
            <button onClick={() => navigate('/login')} className="link-btn">Inicia sesión aquí</button>
          </div>
        )}

        <div className="dual-calendar-container">
          {[0, 1].map((offset) => {
            const displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
            const daysInMonth = getDaysInMonth(displayDate);
            const firstDay = getFirstDayOfMonth(displayDate);
            const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
            const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const displayMonth = monthNames[displayDate.getMonth()];

            return (
              <div key={offset} className="single-calendar">
                <div className="calendar-month-header">
                  <h3>{displayMonth} de {displayDate.getFullYear()}</h3>
                </div>

                <div className="calendar-weekdays">
                  <div>L</div>
                  <div>M</div>
                  <div>M</div>
                  <div>J</div>
                  <div>V</div>
                  <div>S</div>
                  <div>D</div>
                </div>

                <div className="calendar-days">
                  {days.map((day, idx) => {
                    if (day === null) return <div key={idx} className="empty"></div>;

                    const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    const isOccupied = isDateOccupied(date);
                    const isCheckIn = checkInDate?.toDateString() === date.toDateString();
                    const isCheckOut = checkOutDate?.toDateString() === date.toDateString();
                    const isBetween = isDateBetweenSelection(date);

                    let className = 'calendar-day';
                    if (isPast) className += ' past';
                    if (isOccupied) className += ' occupied';
                    if (isCheckIn || isCheckOut) className += ' selected';
                    if (isBetween) className += ' between';
                    if (isToday) className += ' today';
                    if (!isPast && !isOccupied) className += ' available';

                    return (
                      <button
                        key={idx}
                        className={className}
                        onClick={() => handleDateClick(day, displayDate.getMonth(), displayDate.getFullYear())}
                        disabled={isPast || isOccupied}
                        title={isOccupied ? 'Ocupado' : !isPast ? 'Disponible' : 'Pasado'}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available-dot"></span>
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot occupied-dot"></span>
            <span>Ocupado</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot selected-dot"></span>
            <span>Seleccionado</span>
          </div>
        </div>

        <div className="booking-summary">
          {checkInDate && checkOutDate ? (
            <>
              <div className="summary-row">
                <span>Entrada: {checkInDate.toLocaleDateString('es-ES')}</span>
              </div>
              <div className="summary-row">
                <span>Salida: {checkOutDate.toLocaleDateString('es-ES')}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span><strong>Noches:</strong> {nights}</span>
                <span><strong>${totalPrice.toLocaleString('es-ES')}</strong></span>
              </div>
            </>
          ) : (
            <div className="summary-placeholder">Selecciona fechas de entrada y salida</div>
          )}
        </div>

        <div className="calendar-actions">
          <button className="clear-dates-btn" onClick={() => { setCheckInDate(null); setCheckOutDate(null); }}>
            Borrar fechas
          </button>
          <button 
            className="reserve-btn" 
            onClick={handleReserve}
            disabled={!checkInDate || !checkOutDate || !isLoggedIn}
          >
            {isLoggedIn ? 'Enviar' : 'Inicia sesión para reservar'}
          </button>
        </div>
      </div>
    </div>
  );
};
