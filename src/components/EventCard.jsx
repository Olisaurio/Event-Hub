import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components-styles/EventCard.css';

// EventCard Component
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formatDateRange = (start, end) => {
    if (!start) return 'Fecha no especificada';
    try {
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : null;
      
      // Formatear hora
      const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      };
      
      if (endDate && startDate.toDateString() === endDate.toDateString()) {
        return `Hoy • ${formatTime(startDate)} - ${formatTime(endDate)}`;
      }
     
      return `Hoy • ${formatTime(startDate)}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  const formatPrice = (priceObj) => {
    if (!priceObj || !priceObj.amount) return 'Gratis';
    return `${priceObj.amount} ${priceObj.currency}`;
  };

  const handleCardClick = () => {
    navigate(`/event/${event._id}`, {
      state: { event: event }
    });
  };

  // Obtener la primera imagen principal si existe
  const imageUrl = event.mainImages && event.mainImages.length > 0 
    ? event.mainImages[0].url 
    : null;

  return (
    <div className="event-card">
      {formatPrice(event.price) === 'Gratis' && (
        <div className="event-badge">Gratis</div>
      )}
      
      <div className="event-image">
        {imageUrl ? (
          <img src={imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="event-icon">♫</div>
        )}
      </div>
      
      <div className="event-info">
        <h3 className="event-title">
          {event.title || 'Concierto en el Parque'}
        </h3>
        
        <div className="event-date">
          {formatDateRange(event.start, event.end) || 'Hoy • 18:00 - 22:00'}
        </div>
        
        <div className="event-location">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          {event.location?.address || 'Parque Central'}
        </div>
        
        <div className="event-button">Ver detalles</div>
      </div>
    </div>
  );
};

export default EventCard;
