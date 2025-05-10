import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EventCard from '../components/EventCard';
import '../EventHub-Styles/EventsListPage.css'; // Actualizado

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

  // Estados de los filtros
  const [selectedCategory, setSelectedCategory] = useState(query.get('category') || 'all');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'free', 'paid'
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);

  // Cargar eventos y datos de ubicación iniciales
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:3001/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        setDepartments(data.map(dep => dep.department));
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchEvents();
    fetchLocations();
  }, []);

  useEffect(() => {
    setSelectedCategory(query.get('category') || 'all');
  }, [location.search, query]);

  useEffect(() => {
    let tempEvents = [...events];

    if (selectedCategory && selectedCategory !== 'all') {
      tempEvents = tempEvents.filter(event => 
        event.categories && event.categories.map(c => c.toLowerCase()).includes(selectedCategory.toLowerCase())
      );
    }

    if (priceFilter === 'free') {
      tempEvents = tempEvents.filter(event => event.ticketType === 'free' || (event.price && event.price.amount === 0));
    } else if (priceFilter === 'paid') {
      tempEvents = tempEvents.filter(event => event.ticketType === 'paid' && event.price && event.price.amount > 0);
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        tempEvents = tempEvents.filter(event => event.price.amount <= parseFloat(maxPrice));
      }
    }

    if (selectedDepartment) {
      tempEvents = tempEvents.filter(event => event.location && event.location.department === selectedDepartment);
    }

    if (selectedCity) {
      tempEvents = tempEvents.filter(event => event.location && event.location.city === selectedCity);
    }

    setFilteredEvents(tempEvents);
  }, [events, selectedCategory, priceFilter, maxPrice, selectedDepartment, selectedCity]);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchCitiesForDepartment = async () => {
        try {
          const response = await fetch('http://localhost:3001/locations');
          const allLocations = await response.json();
          const departmentData = allLocations.find(dep => dep.department === selectedDepartment);
          setCities(departmentData ? departmentData.cities : []);
        } catch (err) {
          console.error("Error fetching cities for department:", err);
          setCities([]);
        }
      };
      fetchCitiesForDepartment();
    } else {
      setCities([]);
    }
    setSelectedCity('');
  }, [selectedDepartment]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`${location.pathname}?category=${encodeURIComponent(category)}`);
  };

  const handlePriceTypeChange = (e) => {
    setPriceFilter(e.target.value);
    if (e.target.value === 'free') setMaxPrice('');
  };
  
  const categoriesForBar = [
    { name: 'Todos', id: 'all' },
    { name: 'Música', id: 'Música' },
    { name: 'Arte y Cultura', id: 'Arte y Cultura' },
    { name: 'Comida y Bebida', id: 'Comida y Bebida' },
    { name: 'Deportes', id: 'Deportes' },
    { name: 'Negocios', id: 'Negocios' },
    { name: 'Tecnología', id: 'Tecnología' },
  ];

  if (loading) return <div className="events-list-page-loading">Cargando eventos...</div>;
  if (error) return <div className="events-list-page-error">Error al cargar eventos: {error}</div>;

  return (
    <div className="events-list-page-container">
      <CategoryFilterBar 
        categories={categoriesForBar} 
        onCategorySelect={handleCategorySelect} 
        activeCategory={selectedCategory} 
      />
      
      <div className="filters-and-events">
        <aside className="filters-sidebar">
          <h3>Filtrar Eventos</h3>
          
          <div className="filter-group price-filter">
            <h4>Precio</h4>
            <label>
              <input type="radio" name="priceType" value="all" checked={priceFilter === 'all'} onChange={handlePriceTypeChange} />
              Todos
            </label>
            <label>
              <input type="radio" name="priceType" value="free" checked={priceFilter === 'free'} onChange={handlePriceTypeChange} />
              Gratis
            </label>
            <label>
              <input type="radio" name="priceType" value="paid" checked={priceFilter === 'paid'} onChange={handlePriceTypeChange} />
              De Pago
            </label>
            {priceFilter === 'paid' && (
              <div className="max-price-input">
                <label htmlFor="maxPrice">Precio Máx.:</label>
                <input 
                  type="number" 
                  id="maxPrice" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)} 
                  placeholder="Ej: 50"
                />
              </div>
            )}
          </div>

          <div className="filter-group location-filter">
            <h4>Ubicación</h4>
            <label htmlFor="departmentFilter">Departamento:</label>
            <select id="departmentFilter" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">Todos</option>
              {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>

            {selectedDepartment && cities.length > 0 && (
              <>
                <label htmlFor="cityFilter">Ciudad:</label>
                <select id="cityFilter" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">Todas</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </>
            )}
          </div>
        </aside>

        <main className="events-grid-container">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} /> 
              ))}
            </div>
          ) : (
            <p className="no-events-message">No se encontraron eventos con los filtros seleccionados.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default EventsListPage;

