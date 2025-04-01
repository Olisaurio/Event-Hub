import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
SubEventsComponent
import "../../Styles/EventDetail.css";
import SubEventsComponent from '../../components/SubEvents';

const EventDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventFromState = location.state?.event;

        if (eventFromState) {
          setEvent(eventFromState);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/events/${id}`);

        if (!response.ok) {
          throw new Error('No se pudieron obtener los detalles del evento');
        }

        const eventData = await response.json();

        setEvent(eventData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error al obtener detalles del evento:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, location.state]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';

    const date = new Date(dateString);
    const formatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return date.toLocaleDateString('es-ES', formatOptions);
  };

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!event) return <div className="not-found">Evento no encontrado</div>;

  // Placeholder image if no image is provided
  const eventImage = event.image || "https://placehold.co/600x400?text=Evento+Sin+Imagen";

  return (
    <div className="event-detail-container">
      {/* Main Event Image and Title Section */}
      <div className="event-hero">
        <div className="event-hero-image">
          <img 
            src={eventImage} 
            alt={event.eventName} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Imagen+No+Disponible";
            }}
          />
        </div>
        <div className="event-hero-title">
          <h1>{event.eventName}</h1>
        </div>
      </div>

      <div className="event-main-details">
        <div className="event-info-card">
          <h2>Información del Evento</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Tipo de Evento:</span>
              <span className="info-value">{event.type || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo de Entrada:</span>
              <span className="info-value">{event.ticketType || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Precio:</span>
              <span className="info-value">
                {event.price.amount} {event.price.currency}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Ubicación:</span>
              <span className="info-value">
                {event.location?.address || 'No especificado'}
              </span>
            </div>
          </div>
        </div>

        <div className="event-dates-card">
          <h2>Fechas del Evento</h2>
          <div className="dates-info">
            <div className="date-item">
              <span className="date-label">Inicio:</span>
              <span className="date-value">
                {formatDate(event.date.start)}
              </span>
            </div>
            <div className="date-item">
              <span className="date-label">Fin:</span>
              <span className="date-value">
                {formatDate(event.date.end)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="event-description">
        <h2>Descripción</h2>
        <p>{event.description|| 'Sin descripción disponible'}</p>
      </div>

      {/* Render SubEventsComponent */}
      <SubEventsComponent subEvents={event.subEvents} />
    </div>
  );
};

export default EventDetail;