import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import VerticalRecommendationsCarousel from "../components/VerticalRecommendationsCarousel";
import CategoryFilterBar from "../components/CategoryFilterBar"; // Importar CategoryFilterBar
import '../EventHub-Styles/EventHub.css';

// Lista completa de categorías disponibles (puede venir de la API o ser constante)
const allAvailableCategories = [
    { name: 'Todos', id: 'all' },
    { name: 'Música', id: 'Música' },
    { name: 'Arte y Cultura', id: 'Arte y Cultura' },
    { name: 'Comida y Bebida', id: 'Comida y Bebida' },
    { name: 'Deportes', id: 'Deportes' },
    { name: 'Negocios', id: 'Negocios' },
    { name: 'Tecnología', id: 'Tecnología' },
    { name: 'Aire Libre', id: 'Aire Libre' },
    { name: 'Comunidad', id: 'Comunidad' },
    { name: 'Familia', id: 'Familia' },
    { name: 'Cine', id: 'Cine' },
    { name: 'Moda', id: 'Moda' },
    { name: 'Educación', id: 'Educación' },
    { name: 'Salud y Bienestar', id: 'Salud y Bienestar' },
    { name: 'Otros', id: 'Otros' }
];

// Mapeo de categorías a iconos (placeholders) - ESTO SE DEBE CENTRALIZAR SI SE USA EN OTROS SITIOS
const categoryIcons = {
    "Música": "🎵",
    "Arte y Cultura": "🎨",
    "Comida y Bebida": "🍔",
    "Deportes": "⚽",
    "Negocios": "💼",
    "Tecnología": "💻",
    "Aire Libre": "🌳",
    "Comunidad": "🤝",
    "Familia": "👨‍👩‍👧‍👦",
    "Cine": "🎬",
    "Moda": "👗",
    "Educación": "📚",
    "Salud y Bienestar": "🧘",
    "Otros": "✨"
};

// Seleccionar las primeras 6 categorías para mostrar en la UI, o las que se deseen
const displayCategoriesForUI = allAvailableCategories.slice(1, 7).map(cat => ({
    ...cat,
    icon: categoryIcons[cat.name] || "🌟" // Icono por defecto
}));

const EventHub = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

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
          // Asegurarse de que location es un objeto y tiene address, department y city
          location: event.location ? 
            `${event.location.address || ''}${event.location.city ? `, ${event.location.city}` : ''}${event.location.department ? `, ${event.location.department}` : ''}` 
            : 'Ubicación no especificada',
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

  const featuredEvents = useMemo(() => {
    const now = new Date();
    return [...allEvents]
      .filter(event => new Date(event.date.start) >= now)
      .sort((a, b) => new Date(a.date.start) - new Date(b.date.start))
      .slice(0, 6);
  }, [allEvents]);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'all') {
        navigate('/events'); // Navegar a la página de todos los eventos
    } else {
        navigate(`/events?category=${encodeURIComponent(categoryId)}`);
    }
  };

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

        {/* Barra de Categorías integrada aquí */}
        <div className="eventhub-category-bar-container">
            <h2>Explora por Categoría</h2>
            <CategoryFilterBar 
                categories={allAvailableCategories} // Usar todas las categorías para la barra principal
                onCategorySelect={handleCategoryClick} 
                // activeCategory podría manejarse si se quiere resaltar la categoría actual en EventHub
            />
        </div>



        <div className="event-hub-main-content-area">
          <div className="featured-events-column">
            <h2 className="featured-events-title">Eventos Destacados</h2>
            {featuredEvents.length > 0 ? (
              featuredEvents.map(event => (
                <div key={event.id} className="featured-event-card">
                  <div className="featured-event-info">
                    <h3>{event.eventName}</h3>
                    <p className="featured-event-meta">
                      {/* Mostrar ubicación completa aquí */}
                      {event.originalEvent?.location?.department && event.originalEvent?.location?.city ? 
                        `${event.originalEvent.location.city}, ${event.originalEvent.location.department}` 
                        : event.location} <br />
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
                No hay eventos destacados disponibles en este momento.
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

