import React from 'react';
import { useNavigate } from 'react-router-dom';

// EventCard Component
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formatDateRange = (start, end) => {
    if (!start) return 'Fecha no especificada';
    try {
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : null;
      const formatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      
      if (endDate && startDate.toDateString() !== endDate.toDateString()) {
        return `${startDate.toLocaleDateString('es-ES', formatOptions)} - 
                ${endDate.toLocaleDateString('es-ES', formatOptions)}`;
      }
     
      return startDate.toLocaleDateString('es-ES', formatOptions);
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
    : "https://placehold.co/300x150";

  return (
    <div 
      className="event-card" 
      onClick={handleCardClick}
      style={{
        width: '100%',
        maxWidth: '300px',
        margin: '10px',
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        position: 'relative'
      }}
    >
      <div 
        className="event-image"
        style={{
          height: '150px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="event-info" style={{ padding: '15px' }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {event.title || 'Evento sin título'}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <p style={{ 
            margin: '0 0 5px 0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            {formatDateRange(event.start, event.end)}
          </p>
          
          <p style={{ 
            margin: '0 0 5px 0', 
            color: '#1890ff', 
            fontSize: '14px', 
            fontWeight: 'bold' 
          }}>
            {formatPrice(event.price)}
          </p>
        </div>
        
        <p style={{ 
          margin: '0', 
          color: '#888', 
          fontSize: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {event.location?.address || 'Ubicación no especificada'}
        </p>

        {event.categories && event.categories.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: '8px',
            gap: '4px'
          }}>
            {event.categories.slice(0, 2).map((category, index) => (
              <span key={index} style={{
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px'
              }}>
                {category}
              </span>
            ))}
            {event.categories.length > 2 && (
              <span style={{
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px'
              }}>
                +{event.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
      
      {event.privacy === 'Privado' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Privado
        </div>
      )}
    </div>
  );
};

export default EventCard;
