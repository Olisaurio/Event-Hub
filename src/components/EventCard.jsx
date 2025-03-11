import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <div 
        className="event-image"
        style={{ backgroundImage: `url(${event.image})` }}
      ></div>
      <div className="event-info">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date">{event.date}</p>
        <p className="event-category">{event.category}</p>
      </div>
    </div>
  );
};

export default EventCard;