import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SubEventsComponent = ({ subEvents }) => {
  const [subEventDetails, setSubEventDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubEventDetails = async () => {
      if (!subEvents || subEvents.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        const fetchedSubEvents = [];
        
        // Para cada ID de subevento, obtener los detalles
        for (const subEventId of subEvents) {
          try {
            const response = await fetch(`https://backendeventhub.onrender.com/api/events/${subEventId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              fetchedSubEvents.push(data);
            } else {
              console.error(`Error al obtener subevento ${subEventId}: ${response.status}`);
            }
          } catch (err) {
            console.error(`Error al procesar subevento ${subEventId}:`, err);
          }
        }
        
        setSubEventDetails(fetchedSubEvents);
      } catch (err) {
        setError('Error al cargar los subeventos');
        console.error('Error al cargar subeventos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubEventDetails();
  }, [subEvents]);

  // Helper function to format date
  const formatSubEventDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Fecha inválida';
      
      const formatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return date.toLocaleDateString('es-ES', formatOptions);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return <div className="sub-events-loading">Cargando subeventos...</div>;
  }

  if (error) {
    return <div className="sub-events-error">Error: {error}</div>;
  }

  // If no sub-events, return null
  if (!subEventDetails || subEventDetails.length === 0) {
    return null;
  }

  return (
    <div className="sub-events-section">
      <div className="sub-events-grid">
        {subEventDetails.map((subEvent, index) => (
          <div key={subEvent._id || index} className="sub-event-card">
            <div className="sub-event-header">
              <h3>{subEvent.title || `Actividad ${index + 1}`}</h3>
            </div>
            <div className="sub-event-details">
              <div className="sub-event-detail-item">
                <span className="sub-event-label">Fecha:</span>
                <span className="sub-event-value">
                  {formatSubEventDate(subEvent.start)}
                </span>
              </div>
              {subEvent.end && (
                <div className="sub-event-detail-item">
                  <span className="sub-event-label">Hasta:</span>
                  <span className="sub-event-value">
                    {formatSubEventDate(subEvent.end)}
                  </span>
                </div>
              )}
              {subEvent.location && (
                <div className="sub-event-detail-item">
                  <span className="sub-event-label">Ubicación:</span>
                  <span className="sub-event-value">
                    {subEvent.location.address || 'No especificado'}
                  </span>
                </div>
              )}
              {subEvent.description && (
                <div className="sub-event-detail-item">
                  <span className="sub-event-label">Descripción:</span>
                  <span className="sub-event-value">
                    {subEvent.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SubEventsComponent.propTypes = {
  subEvents: PropTypes.array
};

export default SubEventsComponent;
