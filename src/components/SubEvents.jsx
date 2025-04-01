import React from 'react';
import PropTypes from 'prop-types';

const SubEventsComponent = ({ subEvents }) => {
  // Helper function to format date
  const formatSubEventDate = (date, time) => {
    if (!date || !time) return 'Fecha no especificada';

    const combinedDateTime = new Date(`${date}T${time}`);

    const formatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return combinedDateTime.toLocaleDateString('es-ES', formatOptions);
  };

  // If no sub-events, return null
  if (!subEvents || subEvents.length === 0) {
    return null;
  }

  return (
    <div className="sub-events-section">
      <h2>Programa del Evento</h2>
      <div className="sub-events-grid">
        {subEvents.map((subEvent, index) => (
          <div key={subEvent.id || index} className="sub-event-card">
            <div className="sub-event-header">
              <h3>{subEvent.name || `Actividad ${index + 1}`}</h3>
            </div>
            <div className="sub-event-details">
              <div className="sub-event-detail-item">
                <span className="sub-event-label">Fecha:</span>
                <span className="sub-event-value">
                  {formatSubEventDate(subEvent.date, subEvent.time)}
                </span>
              </div>
              <div className="sub-event-detail-item">
                <span className="sub-event-label">Ubicación:</span>
                <span className="sub-event-value">
                  {subEvent.location || 'No especificado'}
                </span>
              </div>
              <div className="sub-event-detail-item">
                <span className="sub-event-label">Duración:</span>
                <span className="sub-event-value">
                  {subEvent.duration || 'No especificado'}
                </span>
              </div>
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
  subEvents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      date: PropTypes.string,
      time: PropTypes.string,
      location: PropTypes.string,
      duration: PropTypes.string,
      description: PropTypes.string
    })
  )
};

export default SubEventsComponent;