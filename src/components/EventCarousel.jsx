import React, { useState, useEffect, useRef } from 'react';
import EventCard from './EventCard';
import { useNavigate } from 'react-router-dom';
import "../Styles-EventHub/Carousel.css"

const EventCarousel = ({ events }) => {
  // Asegúrate de que events es un array y tiene elementos
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.log("No events provided to carousel");
    return <div>No events available</div>;
  }
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const itemsPerView = 4; // Adjust based on screen size
  const maxIndex = Math.max(0, events.length - itemsPerView);
  
  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!transitioning) {
        handleNext();
      }
    }, 3000); // Change slides every 3 seconds
    
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
      // Reset to beginning when reached the end
      setTransitioning(true);
      setCurrentIndex(0);
      setTimeout(() => setTransitioning(false), 500);
    }
  };
  
  // Calculate translation for smooth scrolling
  const translateX = -currentIndex * (260 + 15); // card width + gap
  
  return (
    <div className="event-carousel">
      <div className="carousel-controls">
        <button className="carousel-button" onClick={handlePrev}>
          &lt;
        </button>
        <button className="carousel-button" onClick={handleNext}>
          &gt;
        </button>
      </div>
      
      <div className="event-list" ref={carouselRef} style={{
        transform: `translateX(${translateX}px)`,
      }}>
        {events.map(event => {
          // Asegurarnos de que cada evento tiene un id y una imagen
          if (!event.id) console.warn("Event missing ID:", event);
          if (!event.image) console.warn("Event missing image:", event.id);
          
          return <EventCard key={event.id} event={event} />
        })}
      </div>
    </div>
  );
};

export default EventCarousel;