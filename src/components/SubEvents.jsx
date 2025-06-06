import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SubEventsComponent = ({ eventId }) => {
  const [subEvents, setSubEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubEvents = async () => {
      if (!eventId) {
        setError("No se proporcionó ID de evento principal");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Paso 1: Obtener el evento principal para extraer los IDs de sub-eventos
        const token = localStorage.getItem("token") || '';
        
        const eventResponse = await fetch(`https://backendeventhub.onrender.com/api/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });
        
        if (!eventResponse.ok) {
          throw new Error(`Error al obtener evento principal: ${eventResponse.status}`);
        }
        
        const eventData = await eventResponse.json();
        
        // Verificar si el evento tiene sub-eventos
        if (!eventData.subeventIds || !Array.isArray(eventData.subeventIds) || eventData.subeventIds.length === 0) {
          console.log("El evento no tiene sub-eventos asociados");
          setSubEvents([]);
          setLoading(false);
          return;
        }
        
        console.log(`Encontrados ${eventData.subeventIds.length} sub-eventos para el evento ${eventId}`);
        
        // Paso 2: Obtener los detalles de cada sub-evento
        const fetchedSubEvents = [];
        
        for (const subEventId of eventData.subeventIds) {
          try {
            // Usar la URL correcta para sub-eventos
            const subEventResponse = await fetch(`https://backendeventhub.onrender.com/api/subevents/${subEventId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              }
            });
            
            if (subEventResponse.ok) {
              const subEventData = await subEventResponse.json();
              
              // Solo extraer los campos requeridos
              const simplifiedSubEvent = {
                id: subEventId,
                title: subEventData.title,
                description: subEventData.description,
                start: subEventData.start,
                end: subEventData.end
              };
              
              fetchedSubEvents.push(simplifiedSubEvent);
            } else {
              console.error(`Error al obtener sub-evento ${subEventId}: ${subEventResponse.status}`);
            }
          } catch (err) {
            console.error(`Error al procesar sub-evento ${subEventId}:`, err);
          }
        }
        
        setSubEvents(fetchedSubEvents);
      } catch (err) {
        setError(`Error al cargar los sub-eventos: ${err.message}`);
        console.error('Error al cargar sub-eventos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubEvents();
  }, [eventId]);

  // Helper function to format date
  const formatSubEventDate = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Fecha inválida';
      
      const formatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };

      return date.toLocaleDateString('es-ES', formatOptions);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Cargando sub-eventos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  // Si no hay sub-eventos, mostrar mensaje informativo
  if (!subEvents || subEvents.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg text-center">
        Este evento no tiene actividades asociadas
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subEvents.map((subEvent, index) => (
          <div 
            key={subEvent.id || index} 
            className="bg-white rounded-2xl p-8 shadow-md border border-gray-50 w-full box-border transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-6 relative pb-2">
              <h3 className="text-2xl font-semibold text-gray-800">
                {subEvent.title || `Actividad ${index + 1}`}
              </h3>
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
            </div>
            
            <div className="space-y-4">
              {subEvent.description && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 mb-1">Descripción:</span>
                  <span className="text-gray-700">
                    {subEvent.description}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 mb-1">Fecha de inicio:</span>
                <span className="text-gray-700">
                  {formatSubEventDate(subEvent.start)}
                </span>
              </div>
              
              {subEvent.end && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 mb-1">Fecha de fin:</span>
                  <span className="text-gray-700">
                    {formatSubEventDate(subEvent.end)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

SubEventsComponent.propTypes = {
  eventId: PropTypes.string.isRequired
};

export default SubEventsComponent;
