import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    console.log("Navigating to event:", event);
    navigate(`/event/${event.id}`, { 
      state: { event: event }
    });
  };
  
  return (
    <div className="event-card" onClick={handleCardClick} style={{
      cursor: 'pointer',
      border: '1px solid #eee',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      width: '250px',
      margin: '10px',
      transition: 'transform 0.3s'
    }}>
      <div
        className="event-image"
        style={{ 
          backgroundImage: `url(${event.image || "https://placehold.co/300x150"})`,
          height: '150px',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="event-info" style={{ padding: '15px' }}>
        <h3 className="event-title" style={{ margin: '0 0 8px 0' }}>{event.title}</h3>
        <p className="event-date" style={{ margin: '0 0 5px 0', color: '#666' }}>{event.date}</p>
        <p className="event-category" style={{ margin: '0', color: '#1890ff' }}>{event.category}</p>
      </div>
    </div>
  );
};

export default EventCard;