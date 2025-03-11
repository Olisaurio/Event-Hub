import React from 'react';
import EventCard from './EventCard';

const EventCarousel = ({ events }) => {
  return (
    <>
      <div className="event-carousel">
      <div className="event-list">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
    <div className="event-carousel">
      <div className="event-list">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
    <div className="event-carousel">
      <div className="event-list">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
    </>
  );
};

export default EventCarousel;