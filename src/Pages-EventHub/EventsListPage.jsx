import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CategoryFilterBar from '../components/CategoryFilterBar';
import EventCard from '../components/EventCard';
import '../EventHub-Styles/EventsListPage.css';

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
  const [selectedType, setSelectedType] = useState('');

  // Cargar eventos desde la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://backendeventhub.onrender.com/api/events');
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

    fetchEvents();
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
      tempEvents = tempEvents.filter(event => event.ticketType === 'Gratis' || (event.price && event.price.amount === 0));
    } else if (priceFilter === 'paid') {
      tempEvents = tempEvents.filter(event => event.ticketType === 'Pago' && event.price && event.price.amount > 0);
      if (maxPrice && !isNaN(parseFloat(maxPrice))) {
        tempEvents = tempEvents.filter(event => event.price.amount <= parseFloat(maxPrice));
      }
    }

    if (selectedType) {
      tempEvents = tempEvents.filter(event => event.type === selectedType);
    }

    setFilteredEvents(tempEvents);
  }, [events, selectedCategory, priceFilter, maxPrice, selectedType]);

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

  const eventTypes = ['simple', 'recurrente', 'multi-sesión'];

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
                  placeholder="Ej: 50000"
                />
              </div>
            )}
          </div>

          <div className="filter-group type-filter">
            <h4>Tipo de Evento</h4>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="type-select"
            >
              <option value="">Todos</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
        </aside>

        <main className="events-grid-container">
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <EventCard key={event._id} event={event} /> 
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
