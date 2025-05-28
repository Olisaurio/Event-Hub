import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EventCard from '../components/EventCard';
import '../EventHub-Styles/EventsListPage.css';
import { withCheckAuth } from "../Utils/CheckAuth";// Importar el HOC de autenticación

// Función para parsear query params de la URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EventsListPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Categoría seleccionada desde la URL o 'all' por defecto
  const [activeCategory, setActiveCategory] = useState(query.get('category') || 'all');
  
  // Lista de categorías disponibles
  const categories = [
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

  // Cargar eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // Verificar si el token existe antes de hacer la petición
        if (!token) {
          console.error("No hay token disponible");
          setError("No hay sesión activa. Por favor inicie sesión.");
          setLoading(false);
          return;
        }
        
        console.log("Intentando fetch con token:", token.substring(0, 10) + "...");
        
        const response = await fetch('https://backendeventhub.onrender.com/api/events', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include' // Incluir cookies si las hay
        });
        
        console.log("Respuesta de la API:", response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Datos recibidos:", data.length, "eventos");
        
        // Formatear los datos para su uso en la UI
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title || event.eventName,
          start: event.start,
          end: event.end,
          location: event.location,
          locationText: event.location ? 
            `${event.location.address || ''}${event.location.city ? `, ${event.location.city}` : ''}${event.location.department ? `, ${event.location.department}` : ''}` 
            : 'Ubicación no especificada',
          mainImages: event.mainImages || [],
          image: event.mainImages && event.mainImages.length > 0 ? event.mainImages[0].url : 'https://placehold.co/600x400?text=Evento',
          categories: event.categories || [],
          price: event.price,
          privacy: event.privacy,
          originalEvent: event
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filtrar eventos cuando cambia la categoría activa o la lista de eventos
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => 
        event.categories && event.categories.includes(activeCategory)
      ));
    }
  }, [activeCategory, events]);

  // Manejar cambio de categoría
  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    
    // Actualizar la URL sin recargar la página
    if (categoryId === 'all') {
      navigate('/events');
    } else {
      navigate(`/events?category=${encodeURIComponent(categoryId)}`);
    }
  };

  // Actualizar categoría activa cuando cambia la URL
  useEffect(() => {
    const categoryParam = query.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('all');
    }
  }, [location, query]);

  if (loading) {
    return (
      <div className="events-list-page">
        <div className="events-list-header">
          <h1>Eventos</h1>
          <CategoryFilterBar 
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-list-page">
        <div className="events-list-header">
          <h1>Eventos</h1>
          <CategoryFilterBar 
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
        <div className="error-container">
          <h2>Error al cargar eventos</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-list-page">
      <div className="events-list-header">
        <h1>Eventos</h1>
        <CategoryFilterBar 
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>
      
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard 
              key={event.id}
              event={event}
            />
          ))
        ) : (
          <div className="no-events-message">
            <p>No hay eventos disponibles para la categoría seleccionada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Exportar el componente envuelto con el HOC de autenticación
export default withCheckAuth(EventsListPage);
