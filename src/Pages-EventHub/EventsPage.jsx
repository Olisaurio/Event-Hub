import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/sidebar'; // Actualizado
import Header from '../components/Header'; // Actualizado
import '../EventHub-Styles/EventsPage.css'; // Actualizado

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
        const response = await fetch('http://localhost:3001/locations');
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
      let url = new URL('http://localhost:3001/events');
      
      if (navigateCategory) {
        url.searchParams.append('category', navigateCategory);
      }
      if (selectedDepartment) {
        url.searchParams.append('department', selectedDepartment);
      }
      if (selectedCity) {
        url.searchParams.append('city', selectedCity);
      }

      try {
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedEvents = data.map(event => ({
          id: event.id,
          eventName: event.eventName,
          date: event.date, 
          location: event.location?.address || 'Ubicación no especificada',
          department: event.location?.department,
          city: event.location?.city,
          image: event.mainImages && event.mainImages.length > 0 ? event.mainImages[0] : 'https://placehold.co/600x400?text=Evento',
          categories: event.categories || [],
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
                    <img src={event.image} alt={event.eventName} className="event-image" />
                </div>
                <div className="event-info">
                  <h3>{event.eventName}</h3>
                  <p className="event-meta">
                    {event.location} ({event.city}, {event.department})<br />
                    {formatDateRange(event.date)}
                  </p>
                  <p className="event-categories">Categorías: {event.categories.join(', ')}</p>
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

export default EventsPage;

