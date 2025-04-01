import React, { useState, useEffect, useRef } from 'react';
import EventCard from './EventCard';
import { useNavigate } from 'react-router-dom';
import "../Styles-EventHub/Carousel.css"

const EventCarousel = ({ events }) => {
  // Validate events prop
  if (!events || !Array.isArray(events) || events.length === 0) {
    return <div>No events available</div>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const carouselRef = useRef(null);
  
  const itemsPerView = 4;  // Adjust based on screen size
  const maxIndex = Math.max(0, events.length - itemsPerView);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!transitioning) {
        handleNext();
      }
    }, 5000);  // Changed to 5 seconds for smoother experience
   
    return () => clearInterval(interval);
  }, [currentIndex, transitioning]);

  const handlePrev = () => {
    if (currentIndex > 0 && !transitioning) {
      setTransitioning(true);
      setCurrentIndex(prevIndex => prevIndex - 1);
      setTimeout(() => setTransitioning(false), 500);
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex && !transitioning) {
      setTransitioning(true);
      setCurrentIndex(prevIndex => prevIndex + 1);
      setTimeout(() => setTransitioning(false), 500);
    } else if (currentIndex >= maxIndex && !transitioning) {
      setTransitioning(true);
      setCurrentIndex(0);
      setTimeout(() => setTransitioning(false), 500);
    }
  };

  // Calculate translation for smooth scrolling
  const translateX = -currentIndex * (260);  // Adjusted for better performance

  return (
    <div 
      className="event-carousel" 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        width: '100%' 
      }}
    >
      <div 
        className="carousel-controls" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          position: 'absolute', 
          top: '50%', 
          width: '100%', 
          zIndex: 10 
        }}
      >
        <button 
          onClick={handlePrev}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            padding: '10px',
            cursor: 'pointer'
          }}
        >
          &lt;
        </button>
        <button 
          onClick={handleNext}
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            padding: '10px',
            cursor: 'pointer'
          }}
        >
          &gt;
        </button>
      </div>
     
      <div 
        ref={carouselRef} 
        style={{
          display: 'flex',
          transition: 'transform 0.5s ease',
          transform: `translateX(${translateX}px)`
        }}
      >
        {events.map(event => (
          <EventCard 
            key={event.id || Math.random()} 
            event={event} 
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;