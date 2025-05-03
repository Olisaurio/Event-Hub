import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import EventCarousel from "../../components/EventCarousel";
import Header from "../../components/Header";

// *** Lista de Categorías (igual que en CreateEvent) ***
const availableCategories = [
    "Música", "Arte y Cultura", "Comida y Bebida", "Deportes", 
    "Negocios", "Tecnología", "Aire Libre", "Comunidad", "Familia", 
    "Cine", "Moda", "Educación", "Salud y Bienestar", "Otros"
];

const EventHub = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Estado para la categoría seleccionada

  // --- Fetch Events (Actualizado para filtrar por categoría) ---
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      let url = "http://localhost:3001/events";
      
      // Añadir parámetro de categoría si está seleccionada
      if (selectedCategory) {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
        console.log(`Fetching events for category: ${selectedCategory}`);
      } else {
        console.log("Fetching all events");
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Mapeo simple (asumiendo que la API devuelve datos consistentes ahora)
        const formattedEvents = data.map(event => ({
          id: event.id,
          eventName: event.eventName,
          date: event.date, 
          type: event.type, // Podríamos usar categories[0] si quisiéramos mostrar una
          // Usar la primera imagen principal como imagen del carrusel
          image: event.mainImages && event.mainImages.length > 0 ? event.mainImages[0] : "https://placehold.co/300x150?text=Sin+Imagen", 
          price: event.price, 
          originalEvent: event 
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
        setEvents([]); // Limpiar eventos en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory]); // *** Re-ejecutar fetch cuando selectedCategory cambie ***

  // Handler para cambiar la categoría seleccionada
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Componente de carga y error (sin cambios)
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
      <div className="main-content">
        <Header />
        <h1 className="page-title">Descubre los mejores eventos</h1>

        {/* *** Filtro de Categorías *** */}
        <div className="category-filter-container">
          <label htmlFor="categoryFilter">Filtrar por Categoría:</label>
          <select 
            id="categoryFilter" 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">Todas las Categorías</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Carrusel de Eventos */}
        {events.length > 0 ? (
          <EventCarousel events={events} />
        ) : (
          <div className="no-events-message">
            No se encontraron eventos {selectedCategory ? `para la categoría "${selectedCategory}"` : ""}.
          </div>
        )}
        
      </div>
    </div>
  );
};

export default EventHub;

