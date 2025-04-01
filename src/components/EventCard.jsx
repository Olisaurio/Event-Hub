import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// EventCard Component
const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const formatDateRange = (dateObj) => {
    if (!dateObj || !dateObj.start) return 'Date not specified';
    try {
      const startDate = new Date(dateObj.start);
      const endDate = dateObj.end ? new Date(dateObj.end) : null;
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
      return 'Invalid Date';
    }
  };

  const formatPrice = (priceObj) => {
    if (!priceObj || !priceObj.amount) return 'Free';
    return `${priceObj.amount} ${priceObj.currency}`;
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`, {
      state: { event: event }
    });
  };

  // Fallback image with consistent dimensions
  const imageUrl = event.image || "https://placehold.co/300x150";

  return (
    <div 
      className="event-card" 
      onClick={handleCardClick}
      style={{
        width: '250px',
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
          fontWeight: 'bold' 
        }}>
          {event.eventName || 'Untitled Event'}
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
            {formatDateRange(event.date)}
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
          fontSize: '12px' 
        }}>
          {event.type || 'Uncategorized'}
        </p>
      </div>
      
      {event.status === 'draft' && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'orange',
          color: 'white',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Draft
        </div>
      )}
    </div>
  );
};

export default EventCard;