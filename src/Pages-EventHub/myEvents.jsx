import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/footer.jsx';

const MyEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Función para obtener el color de la categoría
  const getCategoryColor = (categoria) => {
    const colors = {
      'Tecnología': 'bg-blue-100 text-blue-800',
      'Música': 'bg-purple-100 text-purple-800',
      'Gastronomía': 'bg-green-100 text-green-800',
      'Arte': 'bg-pink-100 text-pink-800',
      'Deportes': 'bg-orange-100 text-orange-800',
      'Educación': 'bg-indigo-100 text-indigo-800',
      'Cultura': 'bg-yellow-100 text-yellow-800',
      'Deporte': 'bg-orange-100 text-orange-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  // Función para formatear el precio
  const formatPrice = (precio, moneda) => {
    if (!precio || precio === 0) return 'Gratis';
    
    const formatter = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda || 'COP',
      minimumFractionDigits: 0,
    });
    
    return formatter.format(precio);
  };

  // Consumir la API
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        
        // Obtener el token del localStorage o donde lo tengas guardado
        const token = localStorage.getItem('token'); // o sessionStorage.getItem('token')
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        
        const response = await axios.get(
          'https://backendeventhub.onrender.com/api/events/my-created',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos
          }
        );
        
        console.log('Eventos obtenidos:', response.data);
        setMyEvents(response.data);
        setError(null);
        
      } catch (err) {
        console.error('Error fetching featured events:', err);
        
        if (err.response) {
          // Error de respuesta del servidor
          if (err.response.status === 401) {
            setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            // Opcional: redirigir al login
            // navigate('/login');
          } else if (err.response.status === 404) {
            setError('No se encontraron eventos.');
          } else {
            setError(`Error del servidor: ${err.response.status}`);
          }
        } else if (err.request) {
          // Error de red
          setError('Error de conexión. Verifica tu internet.');
        } else {
          // Otros errores
          setError('No se pudieron cargar los eventos destacados');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <section className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Eventos Creados
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
              <div className="w-full h-48 bg-gray-300 rounded-t-xl"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
                  <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="bg-gray-200 h-6 w-full mb-2 rounded"></div>
                <div className="bg-gray-200 h-4 w-full mb-4 rounded"></div>
                <div className="flex items-center justify-between">
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                  <div className="bg-gray-200 h-8 w-20 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Eventos Creados
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="bg-red-50 rounded-xl p-8">
            <span className="material-symbols-outlined text-red-400 text-4xl mb-4 block">
              error
            </span>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Eventos Creados
        </h3>
        <div className="flex space-x-2">
          <button className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600">
              chevron_left
            </span>
          </button>
          <button className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-600">
              chevron_right
            </span>
          </button>
        </div>
      </div>
      
      {myEvents && myEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((event) => (
            <Link 
              key={event.id} 
              to={`/event/${event.id}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group block mb-8"
            >
              <div className="w-full h-48 overflow-hidden rounded-t-xl">
                <img
                  src={event.mainImages && event.mainImages.length > 0 ? event.mainImages[0].url : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop';
                  }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.categoria?.nombreCategoria || 'Otros')}`}>
                    {event.categoria?.nombreCategoria || 'Otros'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDateRange(event.start, event.end)}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-2 line-clamp-2">
                  {event.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="material-symbols-outlined text-gray-400 text-sm flex-shrink-0">
                      location_on
                    </span>
                    <span className="text-gray-600 text-sm truncate">
                      {event.location?.address || 'Sin ubicación'}
                    </span>
                  </div>
                  <span className="font-bold text-primary-600 text-lg ml-4">
                    {event.ticketType === 'free' || event.ticketType === 'Gratis' ? 'Gratis' : formatPrice(event.price?.amount, event.price?.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium group-hover:bg-primary-700 w-full text-center">
                    Ver Detalles del Evento
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-xl p-8">
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-4 block">
              event_busy
            </span>
            <p className="text-gray-600 text-lg">
              aun no tienes eventos creados
            </p>
          </div>
        </div>
      )}

      <Footer />
    </section>


  );
};

export default MyEvents;
