import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/MyAgenda.css';

const MyAgenda = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    const fetchAttendees = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            
            const eventsResponse = await axios.get(
                'https://backendeventhub.onrender.com/api/events/my-created',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                }
            );
            
            console.log('Eventos obtenidos:', eventsResponse.data);
            
            const allAttendees = [];
            
            for (const event of eventsResponse.data) {
                try {
                    const attendeesResponse = await axios.get(
                        `https://backendeventhub.onrender.com/api/events/${event.id}/attendees`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    
                    const eventAttendees = attendeesResponse.data.map(attendee => ({
                        ...attendee,
                        event: event
                    }));
                    
                    allAttendees.push(...eventAttendees);
                } catch (attendeeError) {
                    console.warn(`No se pudieron obtener attendees para evento ${event.id}:`, attendeeError);
                }
            }
            
            console.log('Todos los attendees:', allAttendees);
            
            const transformedAttendees = allAttendees.map((attendee, index) => ({
                id: attendee.id || `attendee-${index}`,
                fullName: attendee.user?.name || attendee.fullName || 'Sin nombre',
                email: attendee.user?.email || attendee.email || 'Sin email',
                status: mapApiStatusToLocal(attendee.status),
                registrationDate: formatRegistrationDate(attendee.createdAt || attendee.registrationDate),
                eventDate: new Date(attendee.event?.start || attendee.eventDate),
                eventTitle: attendee.event?.title || attendee.eventTitle || 'Sin título',
                eventId: attendee.event?.id || attendee.eventId
            }));
            
            setAttendees(transformedAttendees);
            setError(null);
            
        } catch (err) {
            console.error('Error fetching attendees:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else if (err.response.status === 404) {
                    setError('No se encontraron asistentes.');
                } else {
                    setError(`Error del servidor: ${err.response.status}`);
                }
            } else if (err.request) {
                setError('Error de conexión. Verifica tu internet.');
            } else {
                setError('No se pudieron cargar los asistentes');
            }
        } finally {
            setLoading(false);
        }
    };

    const mapApiStatusToLocal = (apiStatus) => {
        const statusMap = {
            'confirmed': 'Confirmado',
            'pending': 'Pendiente',
            'cancelled': 'Cancelado',
            'canceled': 'Cancelado',
        };
        return statusMap[apiStatus?.toLowerCase()] || 'Pendiente';
    };

    const formatRegistrationDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('es-ES', options);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const apiStatus = mapLocalStatusToApi(newStatus);
            
            await axios.put(
                `https://backendeventhub.onrender.com/api/attendees/${id}/status`,
                { status: apiStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            setAttendees(attendees.map(attendee =>
                attendee.id === id ? { ...attendee, status: newStatus } : attendee
            ));

        } catch (err) {
            console.error('Error updating attendee status:', err);
            alert('Error al actualizar el estado del asistente');
        }
    };

    const mapLocalStatusToApi = (localStatus) => {
        const statusMap = {
            'Confirmado': 'confirmed',
            'Pendiente': 'pending',
            'Cancelado': 'cancelled'
        };
        return statusMap[localStatus] || 'pending';
    };

    useEffect(() => {
        fetchAttendees();
    }, []);

    useEffect(() => {
        updateSelectedDatesFromEvents();
    }, [attendees, currentMonth]);

    const updateSelectedDatesFromEvents = () => {
        const eventDates = [];
        const currentYear = currentMonth.getFullYear();
        const currentMonthIndex = currentMonth.getMonth();
        const nextMonthIndex = currentMonthIndex + 1;

        attendees.forEach(attendee => {
            if (attendee.eventDate) {
                const eventYear = attendee.eventDate.getFullYear();
                const eventMonth = attendee.eventDate.getMonth();
                const eventDay = attendee.eventDate.getDate();

                if (eventYear === currentYear && eventMonth === currentMonthIndex) {
                    eventDates.push(eventDay);
                }
                else if (eventYear === currentYear && eventMonth === nextMonthIndex) {
                    eventDates.push(eventDay + 100); 
                }
            }
        });

        setSelectedDates(eventDates);
    };

    const setCurrentMonthToNextEvent = () => {
        const now = new Date();
        const upcomingEvents = attendees
            .filter(attendee => attendee.eventDate && attendee.eventDate >= now)
            .sort((a, b) => a.eventDate - b.eventDate);

        if (upcomingEvents.length > 0) {
            const nextEventDate = upcomingEvents[0].eventDate;
            setCurrentMonth(new Date(nextEventDate.getFullYear(), nextEventDate.getMonth(), 1));
        }
    };

    useEffect(() => {
        if (attendees.length > 0) {
            setCurrentMonthToNextEvent();
        }
    }, [attendees]);

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

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
        setCurrentMonth(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
        setCurrentMonth(newMonth);
    };

    const handleDateClick = (day) => {
        if (!day) return;

        const dateKey = currentMonth.getMonth() === new Date().getMonth() ? day : day + 100;

        if (selectedDates.includes(dateKey)) {
            setSelectedDates(selectedDates.filter(d => d !== dateKey));
        } else {
            setSelectedDates([...selectedDates, dateKey]);
        }
    };

    const isDateSelected = (day) => {
        if (!day) return false;
        const dateKey = currentMonth.getMonth() === new Date().getMonth() ? day : day + 100;
        return selectedDates.includes(dateKey);
    };

    const hasEvent = (day, monthOffset = 0) => {
        if (!day) return false;
        
        const checkDate = new Date(
            currentMonth.getFullYear(), 
            currentMonth.getMonth() + monthOffset, 
            day
        );
        
        return attendees.some(attendee => 
            attendee.eventDate && 
            attendee.eventDate.getFullYear() === checkDate.getFullYear() &&
            attendee.eventDate.getMonth() === checkDate.getMonth() &&
            attendee.eventDate.getDate() === checkDate.getDate()
        );
    };

    const filteredAttendees = attendees.filter(attendee => {
        const matchesSearch = attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attendee.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'all') return matchesSearch;
        return matchesSearch && attendee.status.toLowerCase() === statusFilter.toLowerCase();
    });

    // Renderizado con estados de loading y error
    if (loading) {
        return (
            <div className="my-agenda">
                <div className="agenda-header">
                    <h1>Eventos agendados</h1>
                </div>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando asistentes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-agenda">
                <div className="agenda-header">
                    <h1>Eventos agendados</h1>
                </div>
                <div className="error-container">
                    <div className="error-message">
                        <p>{error}</p>
                        <button 
                            onClick={fetchAttendees}
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
                <h1>Eventos agendados</h1>
            </div>

            <div className="filters-section">
                <h3>Filtrar</h3>

                <div className="search-container">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        placeholder="Search"
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
                    <h4>Fecha de eventos</h4>

                    <div className="calendar-container">
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
                                            } ${hasEvent(day) ? 'has-event' : ''}`}
                                            onClick={() => handleDateClick(day)}
                                            disabled={!day}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

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
                                        currentMonth.getMonth() === 11 ? 
                                        currentMonth.getFullYear() + 1 : 
                                        currentMonth.getFullYear(), 
                                        (currentMonth.getMonth() + 1) % 12
                                    )).map((day, index) => (
                                        <button
                                            key={`day-2-${index}`}
                                            className={`day ${day ? 'clickable' : 'empty'} ${
                                                isDateSelected(day) ? 'selected' : ''
                                            } ${hasEvent(day, 1) ? 'has-event' : ''}`}
                                            onClick={() => handleDateClick(day)}
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

            <div className="attendees-table">
                <div className="table-header">
                    <div className="col-name">Nombre completo</div>
                    <div className="col-email">Email</div>
                    <div className="col-status">Estado</div>
                    <div className="col-date">Fecha registrada</div>
                    <div className="col-actions">Acción</div>
                </div>

                <div className="table-body">
                    {filteredAttendees.length > 0 ? (
                        filteredAttendees.map(attendee => (
                            <div key={attendee.id} className="table-row">
                                <div className="col-name">{attendee.fullName}</div>
                                <div className="col-email">{attendee.email}</div>
                                <div className="col-status">
                                    <span className={`status-badge ${attendee.status.toLowerCase()}`}>
                                        {attendee.status}
                                    </span>
                                </div>
                                <div className="col-date">{attendee.registrationDate}</div>
                                <div className="col-actions">
                                    <select
                                        value={attendee.status}
                                        onChange={(e) => handleStatusChange(attendee.id, e.target.value)}
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
                            <p>No se encontraron asistentes que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAgenda;