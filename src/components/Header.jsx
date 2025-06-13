import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Components-styles/Header.css";

const Header = () => {
  const user = localStorage.getItem("userName") || "Usuario";
  const [userName, setUserName] = useState(user);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Función para formatear el rango de fechas
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options = { 
      day: 'numeric', 
      month: 'short',
      year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('es-ES', options);
    }
    
    return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
  };

  // Función para formatear el precio
  const formatPrice = (esPago, precio, moneda) => {
    if (!esPago || !precio || precio === 0) return 'Gratis';
    
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda || 'COP',
      minimumFractionDigits: 0,
    });
    
    return formatter.format(precio);
  };

  // Función para truncar descripción
  const truncateDescription = (description, maxLength = 100) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  // Función para buscar eventos
  const searchEvents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('https://backendeventhub.onrender.com/api/events/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchText: query.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setSearchError('Error al buscar eventos');
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEvents(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Manejar click en un evento
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
    setShowResults(false);
    setSearchText('');
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between flex-wrap relative">
      <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-between sm:justify-start">
        <h1 className="text-2xl font-bold">EventHub</h1>
        
        {/* Contenedor de búsqueda */}
        <div className="relative w-full sm:w-auto mt-4 sm:mt-0 order-3 sm:order-2" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full sm:w-64 md:w-80 lg:w-96 pl-12 pr-10 py-2 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              search
            </span>
            
            {/* Botón limpiar búsqueda */}
            {searchText && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
            
            {/* Indicador de carga */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchError ? (
                <div className="p-4 text-center text-red-600">
                  <span className="material-symbols-outlined text-red-400 text-2xl mb-2 block">error</span>
                  {searchError}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Imagen del evento */}
                        <div className="flex-shrink-0">
                          <img
                            src={event.imagenPrincipal || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=60&fit=crop'}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=60&fit=crop';
                            }}
                          />
                        </div>
                        
                        {/* Información del evento */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">
                            {event.title}
                          </h4>
                          
                          <p className="text-xs text-gray-600 mt-1">
                            {truncateDescription(event.description)}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-4">
                              {/* Fechas */}
                              <span className="text-xs text-gray-500 flex items-center">
                                <span className="material-symbols-outlined text-xs mr-1">calendar_today</span>
                                {formatDateRange(event.fechaInicio, event.fechaFin)}
                              </span>
                              
                              {/* Precio */}
                              <span className={`text-xs font-medium ${
                                event.esPago ? 'text-primary-600' : 'text-green-600'
                              }`}>
                                {formatPrice(event.esPago, event.precio, event.moneda)}
                              </span>
                            </div>
                            
                            {/* Categoría */}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {event.categoria}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchText.trim() && !isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <span className="material-symbols-outlined text-gray-400 text-2xl mb-2 block">search_off</span>
                  No se encontraron eventos para "{searchText}"
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4 order-2 sm:order-3">
        <span className="material-symbols-outlined text-gray-600 cursor-pointer hover:text-primary-600 transition-colors duration-200">
          notifications
        </span>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
            <span className="text-white text-sm font-semibold">JD</span>
          </div>
          <span className="text-gray-700 font-medium hidden sm:inline">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;