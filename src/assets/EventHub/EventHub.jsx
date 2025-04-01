import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import EventCarousel from "../../components/EventCarousel";
import Header from "../../components/Header";

const EventHub = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const timeFilters = [
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "weekend", label: "This weekend" },
    { id: "next-week", label: "Next week" },
    { id: "month", label: "This month" },
  ];

  const [activeFilter, setActiveFilter] = useState("today");
  const [activePage, setActivePage] = useState(1);

  const formatEventDate = (dateObj) => {
    if (!dateObj || !dateObj.start) return 'Fecha no especificada';
    
    try {
      const startDate = new Date(dateObj.start);
      const formatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      return startDate.toLocaleDateString('es-ES', formatOptions);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/events', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Debugging: Log raw event data
        console.log('Raw Events:', data);

        // More comprehensive event mapping
        const formattedEvents = data.map(event => {
          console.log('Processing event:', event); // Log each event for inspection

          return {
            id: event.id || Math.random().toString(), // Fallback ID
            eventName: event.eventName || 'Untitled Event', // Fallback name
            date: event.date || { start: null }, // Fallback date
            type: event.type || 'Uncategorized', // Fallback type
            image: event.image || "https://placehold.co/300x150", // Fallback image
            price: event.price || { amount: 0, currency: 'COP' }, // Fallback price
            originalEvent: event // Keep original event data
          };
        });

        console.log('Formatted Events:', formattedEvents); // Log formatted events

        setEvents(formattedEvents);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div>Cargando eventos...</div>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurre
  if (error) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <h1 className="page-title">Discover the best events in your city</h1>

        <div className="time-filters">
          {timeFilters.map((filter) => (
            <button
              key={filter.id}
              className={`time-filter-button ${
                activeFilter === filter.id ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
          <button className="see-all-button">See all</button>
        </div>

        {/* Pasar eventos cargados de la API */}
        <EventCarousel events={events} />
      </div>
    </div>
  );
};

export default EventHub;