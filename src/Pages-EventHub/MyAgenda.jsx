import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import '../Styles/MyAgenda.css';

const MyAgenda = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nuevos estados para el modal de eventos del día
    const [showEventsModal, setShowEventsModal] = useState(false);
    const [currentDayEvents, setCurrentDayEvents] = useState([]);
    const [modalDate, setModalDate] = useState('');
    const [eventsByDay, setEventsByDay] = useState(new Map());

    // Nuevos estados para el tooltip
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Función para verificar si una fecha está seleccionada
    const isDateSelected = (day) => {
        return selectedDates.includes(day);
    };

    // Función para mapear el estado de la API a un formato local legible
    const mapApiStatusToLocal = (apiStatus) => {
        const statusMap = {
            'confirmed': 'Confirmado',
            'pending': 'Pendiente',
            'cancelled': 'Cancelado',
            'canceled': 'Cancelado',
        };
        return statusMap[apiStatus?.toLowerCase()] || 'Pendiente';
    };

    // Función para mapear el estado local a un formato de API
    const mapLocalStatusToApi = (localStatus) => {
        const statusMap = {
            'Confirmado': 'confirmed',
            'Pendiente': 'pending',
            'Cancelado': 'cancelled'
        };
        return statusMap[localStatus] || 'pending';
    };

    // Función para formatear la fecha de registro
    const formatRegistrationDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    };

    // Función principal para obtener mis inscripciones y los detalles de los eventos
    const fetchMyRegistrations = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
            }
            
            // Paso 1: Obtener todas mis inscripciones
            const registrationsResponse = await axios.get(
                'https://backendeventhub.onrender.com/api/inscriptions/my-registrations',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
             );
            
            console.log('Inscripciones obtenidas:', registrationsResponse.data);
            
            const inscriptionsArray = registrationsResponse.data.data; 
            
            // Validar que inscriptionsArray sea un array
            if (!Array.isArray(inscriptionsArray)) {
                console.error('La respuesta no contiene un array de inscripciones:', inscriptionsArray);
                setMyRegistrations([]);
                return;
            }
            
            // Paso 2: Filtrar inscripciones que tengan eventId válido
            const validInscriptions = inscriptionsArray.filter(inscription => {
                if (!inscription.eventId) {
                    console.warn('Inscripción sin eventId encontrada:', inscription);
                    return false;
                }
                return true;
            });

            console.log('Inscripciones válidas (con eventId):', validInscriptions);
            
            // Paso 3: Para cada inscripción válida, obtener los detalles completos del evento
            const eventDetailsPromises = validInscriptions.map(async (inscription) => {
                try {
                    const eventResponse = await axios.get(
                        `https://backendeventhub.onrender.com/api/events/${inscription.eventId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                     );
                    return {
                        ...inscription,
                        eventDetails: eventResponse.data
                    };
                } catch (eventError) {
                    console.warn(`No se pudieron obtener detalles para el evento ${inscription.eventId} (inscripción ${inscription.id}):`, eventError);
                    return null;
                }
            });

            const results = await Promise.all(eventDetailsPromises);
            const validRegisteredEvents = results.filter(item => item !== null);

            console.log('Eventos válidos obtenidos:', validRegisteredEvents);

            // Paso 4: Transformar los datos al formato que el componente necesita
            const transformedData = validRegisteredEvents.map((item, index) => {
                const userEmail = localStorage.getItem('userEmail') || 'N/A'; 
                const userName = localStorage.getItem('userName') || 'Usuario'; 

                // Validar que eventDetails y eventDetails.start existan
                if (!item.eventDetails || !item.eventDetails.start) {
                    console.warn('Evento sin fecha de inicio:', item);
                    return null;
                }

                return {
                    id: item.id || `reg-${index}`,
                    fullName: userName,
                    email: userEmail,
                    status: mapApiStatusToLocal(item.status),
                    registrationDate: formatRegistrationDate(item.createdAt),
                    eventDate: new Date(item.eventDetails.start),
                    eventTitle: item.eventDetails.title || 'Sin título',
                    eventId: item.eventDetails.id
                };
            }).filter(item => item !== null); // Filtrar elementos nulos
            
            console.log('Mis inscripciones transformadas:', transformedData);
            setMyRegistrations(transformedData);

            // Paso 5: Construir el mapa de eventos por día para el calendario
            const eventsMap = new Map();
            transformedData.forEach(reg => {
                const dateKey = reg.eventDate.toISOString().split('T')[0];
                if (!eventsMap.has(dateKey)) {
                    eventsMap.set(dateKey, []);
                }
                eventsMap.get(dateKey).push({
                    eventTitle: reg.eventTitle,
                    eventId: reg.eventId,
                    registrationId: reg.id,
                    status: reg.status
                });
            });
            setEventsByDay(eventsMap);
            
        } catch (err) {
            console.error('Error al cargar mis inscripciones:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else if (err.response.status === 404) {
                    setError('No se encontraron inscripciones para tu usuario.');
                } else {
                    setError(`Error del servidor: ${err.response.status} - ${err.response.data?.message || 'Error desconocido'}`);
                }
            } else if (err.request) {
                setError('Error de conexión. Verifica tu conexión a internet.');
            } else {
                setError(`Error inesperado: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar el cambio de estado de una inscripción
    const handleStatusChange = async (registrationId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiStatus = mapLocalStatusToApi(newStatus);
            
            await axios.put(
                `https://backendeventhub.onrender.com/api/inscriptions/${registrationId}/status`,
                { status: apiStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
             );

            setMyRegistrations(prevRegistrations => prevRegistrations.map(reg =>
                reg.id === registrationId ? { ...reg, status: newStatus } : reg
            ));

        } catch (err) {
            console.error('Error al actualizar el estado de la inscripción:', err);
            alert('Error al actualizar el estado de tu inscripción. Por favor, inténtalo de nuevo.');
        }
    };

    // Efecto para cargar las inscripciones al montar el componente
    useEffect(() => {
        fetchMyRegistrations();
    }, []);

    // Efecto para actualizar las fechas seleccionadas en el calendario
    useEffect(() => {
        updateSelectedDatesFromEvents();
    }, [myRegistrations, currentMonth]);

    // Función para actualizar las fechas seleccionadas en el calendario
    const updateSelectedDatesFromEvents = () => {
        const eventDaysInMonth = [];
        const currentYear = currentMonth.getFullYear();
        const currentMonthIndex = currentMonth.getMonth();

        myRegistrations.forEach(registration => {
            if (registration.eventDate) {
                const eventYear = registration.eventDate.getFullYear();
                const eventMonth = registration.eventDate.getMonth();
                const eventDay = registration.eventDate.getDate();

                if (eventYear === currentYear && eventMonth === currentMonthIndex) {
                    eventDaysInMonth.push(eventDay);
                }
            }
        });
        setSelectedDates([...new Set(eventDaysInMonth)].sort((a, b) => a - b));
    };

    // Función para centrar el calendario en el próximo evento
    const setCurrentMonthToNextEvent = () => {
        const now = new Date();
        const upcomingEvents = myRegistrations
            .filter(reg => reg.eventDate && reg.eventDate >= now)
            .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime()); // CORREGIDO: era 'reg' ahora es 'a'

        if (upcomingEvents.length > 0) {
            const nextEventDate = upcomingEvents[0].eventDate;
            setCurrentMonth(new Date(nextEventDate.getFullYear(), nextEventDate.getMonth(), 1));
        }
    };

    // Efecto para centrar el calendario en el próximo evento
    useEffect(() => {
        if (myRegistrations.length > 0) {
            setCurrentMonthToNextEvent();
        }
    }, [myRegistrations]);

    // Función para obtener los días de un mes para el calendario
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; 

        for (let i = 0; i < adjustedStartingDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    // Navegación del calendario
    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    // Función para obtener la clase CSS del día del calendario
    const getEventDayClass = (day, monthOffset = 0) => {
        if (!day) return '';
        const checkDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + monthOffset,
            day
        );
        const dateKey = checkDate.toISOString().split('T')[0];
        const eventsOnDay = eventsByDay.get(dateKey);

        if (!eventsOnDay || eventsOnDay.length === 0) {
            return '';
        } else if (eventsOnDay.length === 1) {
            return 'has-one-event';
        } else {
            return 'has-multiple-events';
        }
    };

    // Función para manejar hover en los días del calendario
    const handleDayHover = (event, day, monthOffset = 0) => {
        if (!day) return;

        const checkDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + monthOffset,
            day
        );
        const dateKey = checkDate.toISOString().split('T')[0];
        const eventsOnDay = eventsByDay.get(dateKey);

        if (eventsOnDay && eventsOnDay.length > 0) {
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });

            let tooltipText = '';
            if (eventsOnDay.length === 1) {
                tooltipText = `1 evento: ${eventsOnDay[0].eventTitle}`;
            } else {
                tooltipText = `${eventsOnDay.length} eventos este día`;
            }
            
            setTooltipContent(tooltipText);
            setShowTooltip(true);
        }
    };

    // Función para ocultar el tooltip
    const handleDayLeave = () => {
        setShowTooltip(false);
    };

    // Manejar clic en una fecha del calendario
    const handleCalendarDayClick = (day, monthOffset = 0) => {
        if (!day) return;

        const clickedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + monthOffset,
            day
        );
        const dateKey = clickedDate.toISOString().split('T')[0];
        const eventsOnClickedDay = eventsByDay.get(dateKey);

        if (eventsOnClickedDay && eventsOnClickedDay.length > 0) {
            setCurrentDayEvents(eventsOnClickedDay);
            setModalDate(clickedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }));
            setShowEventsModal(true);
        }
    };

    // Filtrar las inscripciones para la tabla
    const filteredRegistrations = myRegistrations.filter(reg => {
        const matchesSearch = reg.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              reg.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || reg.status.toLowerCase() === statusFilter.toLowerCase();

        const isDateFiltered = selectedDates.length === 0 || (
            reg.eventDate && 
            selectedDates.includes(reg.eventDate.getDate()) &&
            reg.eventDate.getMonth() === currentMonth.getMonth() &&
            reg.eventDate.getFullYear() === currentMonth.getFullYear()
        );

        return matchesSearch && matchesStatus && isDateFiltered;
    });

    // Componente Modal para mostrar eventos de un día
    const DayEventsModal = ({ date, events, onClose }) => {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Eventos para el {date}</h2>
                        <button className="close-button" onClick={onClose}>&times;</button>
                    </div>
                    <div className="modal-body">
                        {events.length > 0 ? (
                            <ul>
                                {events.map((event, index) => (
                                    <li key={index} className="event-item">
                                        <p className="event-title">{event.eventTitle}</p>
                                        <p className="event-status">Estado: {event.status}</p>
                                        <button 
                                            className="view-event-button" 
                                            onClick={() => {
                                                onClose();
                                                navigate(`/event/${event.eventId}`);
                                            }}
                                        >
                                            Ver Evento
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay eventos para este día.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Componente Tooltip
    const Tooltip = ({ show, content, position }) => {
        if (!show) return null;

        return (
            <div 
                className="calendar-tooltip"
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    transform: 'translateX(-50%) translateY(-100%)',
                    zIndex: 1000
                }}
            >
                {content}
            </div>
        );
    };

    // Renderizado condicional para estados de carga y error
    if (loading) {
        return (
            <div className="my-agenda">
                <div className="agenda-header">
                    <h1>Mi Agenda de Eventos</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando mis inscripciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-agenda">
                <div className="agenda-header">
                    <h1>Mi Agenda de Eventos</h1>
                </div>
                <div className="error-container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button 
                            onClick={fetchMyRegistrations}
                            className="retry-button"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-agenda">
            <div className="agenda-header">
                <h1>Mi Agenda de Eventos</h1>
            </div>

            <div className="filters-section">
                <h3>Filtrar mis inscripciones</h3>

                <div className="search-container">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por título de evento, nombre o email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="status-filters">
                    <button
                        className={statusFilter === 'all' ? 'active' : ''}
                        onClick={() => setStatusFilter('all')}
                    >
                        Todo
                    </button>
                    <button
                        className={statusFilter === 'confirmado' ? 'active' : ''}
                        onClick={() => setStatusFilter('confirmado')}
                    >
                        Confirmados
                    </button>
                    <button
                        className={statusFilter === 'pendiente' ? 'active' : ''}
                        onClick={() => setStatusFilter('pendiente')}
                    >
                        Pendientes
                    </button>
                    <button
                        className={statusFilter === 'cancelado' ? 'active' : ''}
                        onClick={() => setStatusFilter('cancelado')}
                    >
                        Cancelados
                    </button>
                </div>

                <div className="registration-date-section">
                    <h4>Fechas de mis eventos</h4>
                    
                    {/* Leyenda de colores */}
                    <div className="calendar-legend">
                        <div className="legend-item">
                            <span className="legend-color single-event"></span>
                            <span>1 evento</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color multiple-events"></span>
                            <span>Múltiples eventos</span>
                        </div>
                    </div>

                    <div className="calendar-container">
                        {/* Calendario del mes actual */}
                        <div className="calendar">
                            <div className="calendar-header">
                                <button onClick={handlePrevMonth} className="nav-button">
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="month-year">
                                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </span>
                                <button onClick={handleNextMonth} className="nav-button">
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="calendar-grid">
                                <div className="days-header">
                                    {daysOfWeek.map((day, index) => (
                                        <div key={`day-header-${index}`} className="day-header">{day}</div>
                                    ))}
                                </div>

                                <div className="days-grid">
                                    {getDaysInMonth(currentMonth).map((day, index) => (
                                        <button
                                            key={`day-${index}`}
                                            className={`day ${day ? 'clickable' : 'empty'} ${
                                                isDateSelected(day) ? 'selected' : ''
                                            } ${getEventDayClass(day)}`}
                                            onClick={() => handleCalendarDayClick(day)}
                                            onMouseEnter={(e) => handleDayHover(e, day)}
                                            onMouseLeave={handleDayLeave}
                                            disabled={!day}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Calendario del próximo mes */}
                        <div className="calendar">
                            <div className="calendar-header">
                                <span className="month-year">
                                    {months[(currentMonth.getMonth() + 1) % 12]} {
                                        currentMonth.getMonth() === 11 ? 
                                        currentMonth.getFullYear() + 1 : 
                                        currentMonth.getFullYear()
                                    }
                                </span>
                            </div>

                            <div className="calendar-grid">
                                <div className="days-header">
                                    {daysOfWeek.map((day, index) => (
                                        <div key={`day-header-2-${index}`} className="day-header">{day}</div>
                                    ))}
                                </div>

                                <div className="days-grid">
                                    {getDaysInMonth(new Date(
                                        currentMonth.getFullYear(), 
                                        currentMonth.getMonth() + 1,
                                        1
                                    )).map((day, index) => (
                                        <button
                                            key={`day-2-${index}`}
                                            className={`day ${day ? 'clickable' : 'empty'} ${
                                                getEventDayClass(day, 1)
                                            }`}
                                            onClick={() => handleCalendarDayClick(day, 1)}
                                            onMouseEnter={(e) => handleDayHover(e, day, 1)}
                                            onMouseLeave={handleDayLeave}
                                            disabled={!day}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="registrations-table">
                <div className="table-header">
                    <div className="col-event-title">Evento</div>
                    <div className="col-name">Mi Nombre</div>
                    <div className="col-email">Mi Email</div>
                    <div className="col-status">Estado de Inscripción</div>
                    <div className="col-date">Fecha de Inscripción</div>
                    <div className="col-actions">Acción</div>
                </div>

                <div className="table-body">
                    {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map(registration => (
                            <div key={registration.id} className="table-row">
                                <div className="col-event-title">{registration.eventTitle}</div>
                                <div className="col-name">{registration.fullName}</div>
                                <div className="col-email">{registration.email}</div>
                                <div className="col-status">
                                    <span className={`status-badge ${registration.status.toLowerCase().replace(' ', '-')}`}>
                                        {registration.status}
                                    </span>
                                </div>
                                <div className="col-date">{registration.registrationDate}</div>
                                <div className="col-actions">
                                    <select
                                        value={registration.status}
                                        onChange={(e) => handleStatusChange(registration.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Confirmado">Confirmado</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-attendees">
                            <p>No se encontraron inscripciones que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Eventos del Día */}
            {showEventsModal && (
                <DayEventsModal 
                    date={modalDate} 
                    events={currentDayEvents} 
                    onClose={() => setShowEventsModal(false)} 
                />
            )}

            {/* Tooltip */}
            <Tooltip 
                show={showTooltip} 
                content={tooltipContent} 
                position={tooltipPosition} 
            />
        </div>
    );
};

export default MyAgenda;