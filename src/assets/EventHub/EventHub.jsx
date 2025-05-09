import React, { useState, useEffect, useMemo } from "react";
import { Link } from 'react-router-dom';
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";
import VerticalRecommendationsCarousel from "../../components/VerticalRecommendationsCarousel";
import './EventHub.css';

const availableCategories = [
    "Música", "Arte y Cultura", "Comida y Bebida", "Deportes", 
    "Negocios", "Tecnología", "Aire Libre", "Comunidad", "Familia", 
    "Cine", "Moda", "Educación", "Salud y Bienestar", "Otros"
];

const EventHub = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDateSort, setSelectedDateSort] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      let url = "http://localhost:3001/events"; 

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        const formattedEvents = data.map(event => ({
          id: event.id,
          eventName: event.eventName,
          date: event.date, 
          location: event.location?.address || 'Ubicación no especificada',
          image: event.mainImages && event.mainImages.length > 0 && event.mainImages[0].startsWith('data:') ? event.mainImages[0] : (event.mainImages && event.mainImages.length > 0 ? event.mainImages[0] : 'https://placehold.co/600x400?text=Evento'),
          categories: event.categories || [],
          originalEvent: event 
        }));

        setAllEvents(formattedEvents);
        setRecommendations(formattedEvents.slice(0, 5));

      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
        setAllEvents([]);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleDateSortChange = (event) => {
    setSelectedDateSort(event.target.value);
  };

  const handleSearchTermChange = (event) => { // New handler for search term
    setSearchTerm(event.target.value);
  };

  const filteredAndSortedEvents = useMemo(() => {
    let processedEvents = [...allEvents];

    // 1. Filter by Category
    if (selectedCategory) {
      processedEvents = processedEvents.filter(event => 
        event.categories && event.categories.includes(selectedCategory)
      );
    }

    // 2. Filter by Search Term (flexible search)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedEvents = processedEvents.filter(event => 
        event.eventName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // 3. Sort/Filter by Date
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (selectedDateSort) {
      case 'closest':
        processedEvents.sort((a, b) => {
          const dateA = new Date(a.date.start);
          const dateB = new Date(b.date.start);
          if (dateA < now && dateB < now) return dateA - dateB;
          if (dateA < now) return 1;
          if (dateB < now) return -1;
          return dateA - dateB;
        });
        processedEvents = processedEvents.filter(event => new Date(event.date.start) >= now);
        break;
      case 'this_month':
        processedEvents = processedEvents.filter(event => {
          const eventStartDate = new Date(event.date.start);
          return eventStartDate.getMonth() === currentMonth && eventStartDate.getFullYear() === currentYear;
        });
        processedEvents.sort((a,b) => new Date(a.date.start) - new Date(b.date.start));
        break;
      case 'next_month':
        const nextMonth = (currentMonth + 1) % 12;
        const yearForNextMonth = nextMonth === 0 ? currentYear + 1 : currentYear;
        processedEvents = processedEvents.filter(event => {
          const eventStartDate = new Date(event.date.start);
          return eventStartDate.getMonth() === nextMonth && eventStartDate.getFullYear() === yearForNextMonth;
        });
        processedEvents.sort((a,b) => new Date(a.date.start) - new Date(b.date.start));
        break;
      case 'default':
      default:
        processedEvents.sort((a, b) => new Date(a.date.start) - new Date(b.date.start));
        break;
    }
    return processedEvents;
  }, [allEvents, selectedCategory, selectedDateSort, searchTerm]); // Added searchTerm to dependencies


  const formatDateRange = (dateObj) => {
    if (!dateObj || !dateObj.start) return 'Fecha no disponible';
    const startDate = new Date(dateObj.start);
    let dateText = startDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    if (dateObj.end) {
        const endDate = new Date(dateObj.end);
        if (startDate.toDateString() !== endDate.toDateString()) {
             dateText += ` - ${endDate.toLocaleDateString('es-ES', { day: 'numeric' })}`;
        }
    }
    return dateText;
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="loading-container"><div className="loading-spinner"></div>Cargando eventos...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="error-container">Error al cargar eventos: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content event-hub-page">
        <Header />
        
        <div className="event-hub-banner">
          <h1 className="banner-title">Organiza y Descubre Eventos con Facilidad</h1>
          <p className="banner-subtitle">Una plataforma para conectar, gestionar y disfrutar eventos.</p>
        </div>

        <div className="filters-container">
          <div className="filter-item search-filter-container">
            <label htmlFor="searchFilter">Buscar Evento:</label>
            <input 
              type="text"
              id="searchFilter"
              placeholder="Nombre del evento..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="search-input filter-input"
            />
          </div>
          <div className="filter-item category-filter-container">
            <label htmlFor="categoryFilter">Categoría:</label>
            <select 
              id="categoryFilter" 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="category-select filter-select"
            >
              <option value="">Todas</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-item date-sort-container">
            <label htmlFor="dateSortFilter">Fecha:</label>
            <select 
              id="dateSortFilter" 
              value={selectedDateSort} 
              onChange={handleDateSortChange}
              className="date-sort-select filter-select"
            >
              <option value="default">Todas las Fechas</option>
              <option value="closest">Más Cercanos</option>
              <option value="this_month">Este Mes</option>
              <option value="next_month">Próximo Mes</option>
            </select>
          </div>
        </div>

        <div className="event-hub-main-content-area">
          <div className="featured-events-column">
            <h2 className="featured-events-title">Eventos Destacados</h2>
            {filteredAndSortedEvents.length > 0 ? (
              filteredAndSortedEvents.map(event => (
                <div key={event.id} className="featured-event-card">
                  <div className="featured-event-info">
                    <h3>{event.eventName}</h3>
                    <p className="featured-event-meta">
                      {event.location} <br />
                      {formatDateRange(event.date)}
                    </p>
                    <Link to={`/event/${event.id}`} className="view-more-btn">Ver Más</Link>
                  </div>
                  <div className="featured-event-image-container">
                    <img src={event.image} alt={event.eventName} className="featured-event-image" />
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events-message">
                No se encontraron eventos con los filtros seleccionados.
              </div>
            )}
          </div>

          <div className="recommendations-column">
            <VerticalRecommendationsCarousel similarEvents={recommendations} />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EventHub;

