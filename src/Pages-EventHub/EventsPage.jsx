import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import Header from '../components/Header';
import '../EventHub-Styles/EventsPage.css';
import { withCheckAuth } from "../Utils/CheckAuth";


// Función para parsear query params de la URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EventsPage = () => {
  const query = useQuery();
  const navigateCategory = query.get('category');

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [locations, setLocations] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citiesForSelectedDepartment, setCitiesForSelectedDepartment] = useState([]);

  // Efecto para cargar las ubicaciones (departamentos y ciudades)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('https://backendeventhub.onrender.com/api/locations', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include' // Incluir cookies si las hay
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLocations(data);
        if (data.length > 0) {
          // setSelectedDepartment(data[0].department); 
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  // Efecto para actualizar las ciudades cuando cambia el departamento seleccionado
  useEffect(() => {
    if (selectedDepartment) {
      const departmentData = locations.find(loc => loc.department === selectedDepartment);
      setCitiesForSelectedDepartment(departmentData ? departmentData.cities : []);
      setSelectedCity(''); 
    } else {
      setCitiesForSelectedDepartment([]);
      setSelectedCity('');
    }
  }, [selectedDepartment, locations]);

  // Efecto para cargar eventos basado en filtros
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      // Crear URL con parámetros de consulta
      let urlObj = new URL("https://backendeventhub.onrender.com/api/events");
      
      if (navigateCategory) {
        urlObj.searchParams.append('category', navigateCategory);
      }
      if (selectedDepartment) {
        urlObj.searchParams.append('department', selectedDepartment);
      }
      if (selectedCity) {
        urlObj.searchParams.append('city', selectedCity);
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          console.error('Error en la petición:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const formattedEvents = data.map(event => ({
          id: event.id,
          title: event.title || event.eventName,
          start: event.start,
          end: event.end,
          location: event.location,
          department: event.location?.department,
          city: event.location?.city,
          mainImages: event.mainImages || [],
          image: event.mainImages && event.mainImages.length > 0 ? event.mainImages[0].url : 'https://placehold.co/600x400?text=Evento',
          categories: event.categories || [],
          price: event.price,
          privacy: event.privacy
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [navigateCategory, selectedDepartment, selectedCity]);

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const formatDateRange = (start, end) => {
    if (!start) return 'Fecha no disponible';
    const startDate = new Date(start);
    let dateText = startDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    if (end) {
        const endDate = new Date(end);
        if (startDate.toDateString() !== endDate.toDateString()) {
             dateText += ` - ${endDate.toLocaleDateString('es-ES', { day: 'numeric' })}`;
        }
    }
    return dateText;
  };

  if (isLoading && events.length === 0) { 
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

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content events-page-content">
        <Header />
        <h1 className="events-page-title">
          Eventos {navigateCategory ? `en ${navigateCategory}` : ''} 
          {selectedCity ? `en ${selectedCity}` : selectedDepartment ? `en ${selectedDepartment}` : 'Cercanos'}
        </h1>

        <div className="location-filters-container">
          <div className="filter-group">
            <label htmlFor="department-select">Departamento:</label>
            <select id="department-select" value={selectedDepartment} onChange={handleDepartmentChange}>
              <option value="">Todos los departamentos</option>
              {locations.map(loc => (
                <option key={loc.department} value={loc.department}>{loc.department}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="city-select">Ciudad:</label>
            <select id="city-select" value={selectedCity} onChange={handleCityChange} disabled={!selectedDepartment || citiesForSelectedDepartment.length === 0}>
              <option value="">Todas las ciudades</option>
              {citiesForSelectedDepartment.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <div className="loading-inline">Actualizando eventos...</div>}
        {error && <div className="error-container">Error al cargar eventos: {error}</div>}

        <div className="events-grid">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image-container">
                    <img src={event.image} alt={event.eventName || event.title} className="event-image" />
                </div>
                <div className="event-info">
                  <h3>{event.eventName || event.title}</h3>
                  <p className="event-meta">
                    {event.location?.address} {event.city && `(${event.city}`}{event.department && `, ${event.department})`}<br />
                    {formatDateRange(event.start, event.end)}
                  </p>
                  <p className="event-categories">
                    {event.categories && event.categories.length > 0 
                      ? `Categorías: ${event.categories.join(', ')}` 
                      : 'Sin categorías'}
                  </p>
                  <Link to={`/event/${event.id}`} className="view-more-btn">Ver Más</Link>
                </div>
              </div>
            ))
          ) : (
            !isLoading && <div className="no-events-message">No se encontraron eventos con los filtros seleccionados.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withCheckAuth(EventsPage);
