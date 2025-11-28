import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './booking-calendar.css';

interface BookingCalendarProps {
  cabinId: string;
  price: number;
  onClose: () => void;
}

interface Booking {
  checkIn: string;
  checkOut: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ cabinId, price, onClose }) => {
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

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
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

  const handleReserve = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Selecciona fechas de entrada y salida');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cabinId,
          checkIn: checkInDate.toISOString().split('T')[0],
          checkOut: checkOutDate.toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        alert('¡Reserva realizada exitosamente!');
        onClose();
        window.location.reload();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (err) {
      console.error('Error al reservar:', err);
      alert('Error al realizar la reserva');
    }
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

        <h2>Selecciona tus fechas</h2>

        {!isLoggedIn && (
          <div className="warning-box">
            Debes estar logueado para reservar. 
            <button onClick={() => navigate('/login')} className="link-btn">Inicia sesión aquí</button>
          </div>
        )}

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
            <h3>{currentMonth} {currentDate.getFullYear()}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
          </div>

          <div className="calendar-weekdays">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="calendar-days">
            {days.map((day, idx) => {
              if (day === null) return <div key={idx} className="empty"></div>;

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
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

              return (
                <button
                  key={idx}
                  className={className}
                  onClick={() => handleDateClick(day)}
                  disabled={isPast || isOccupied}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="booking-summary">
          <p><strong>Entrada:</strong> {checkInDate?.toLocaleDateString('es-ES') || 'No seleccionada'}</p>
          <p><strong>Salida:</strong> {checkOutDate?.toLocaleDateString('es-ES') || 'No seleccionada'}</p>
          {nights > 0 && (
            <>
              <p><strong>Noches:</strong> {nights}</p>
              <p><strong>Total:</strong> ${totalPrice.toLocaleString('es-ES')}</p>
            </>
          )}
        </div>

        <button 
          className="reserve-btn" 
          onClick={handleReserve}
          disabled={!checkInDate || !checkOutDate || !isLoggedIn}
        >
          {isLoggedIn ? 'Reservar ahora' : 'Inicia sesión para reservar'}
        </button>
      </div>
    </div>
  );
};
