import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// Leaflet Imports for Map
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import '../EventHub-Styles/EventDetail.css';
import SubEventsComponent from '../components/SubEvents';

import { withCheckAuth } from "../Utils/CheckAuth";

// Fix Default Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Category Colors ---
const categoryColors = {
    "Música": "#88C0D0", "Arte y Cultura": "#EBCB8B", "Comida y Bebida": "#A3BE8C", 
    "Deportes": "#D08770", "Negocios": "#5E81AC", "Tecnología": "#B48EAD", 
    "Aire Libre": "#A3BE8C", "Comunidad": "#EBCB8B", "Familia": "#88C0D0", 
    "Cine": "#BF616A", "Moda": "#B48EAD", "Educación": "#5E81AC", 
    "Salud y Bienestar": "#A3BE8C", "Otros": "#D8DEE9"
};

// --- Componente Etiquetas de Categoría ---
const CategoryTags = ({ categories }) => {
    if (!categories || categories.length === 0) return null;
    return (
        <div className="categories-list">
            {categories.map((category, index) => (
                <span 
                    key={index} 
                    className="category-pill"
                    style={{ 
                        backgroundColor: categoryColors[category] || '#3b82f6',
                        borderColor: categoryColors[category] || '#2563eb'
                    }}
                >
                    {category}
                </span>
            ))}
        </div>
    );
};

// --- Componente Mapa Simple ---
const EventMap = ({ position }) => {
    if (!position || !position.latitude || !position.longitude) return null;
    const mapPosition = [position.latitude, position.longitude];

    const ChangeView = ({ center, zoom }) => {
        const map = useMap();
        useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
        return null;
    };

    return (
        <div className="card">
            <h2 className="card-title">Ubicación</h2>
            <p className="location-address">
                <i className="fas fa-map-marker-alt"></i> {position.address || 'No especificada'}
            </p>
            <div className="map-container">
                <MapContainer center={mapPosition} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <ChangeView center={mapPosition} zoom={15} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapPosition}></Marker>
                </MapContainer>
            </div>
        </div>
    );
};

// --- Componente Galería de Medios ---
const MediaGallery = ({ mainImages, galleryImages, onMediaClick }) => {
    const galleryRef = useRef(null);
    
    // Procesar las imágenes para obtener las URLs
    const mainMediaUrls = mainImages ? mainImages.map(img => img.url) : [];
    const galleryMediaUrls = galleryImages ? galleryImages.map(img => img.url) : [];
    
    const allMedia = [
        ...mainMediaUrls.map(src => ({ src, type: 'image' })),
        ...galleryMediaUrls.map(src => ({ src, type: 'image' }))
    ];
    
    if (allMedia.length === 0) {
        return (
            <div className="card">
                <h2 className="card-title">Galería</h2>
                <div className="gallery-item">
                    <img src="https://placehold.co/800x500?text=Evento+Sin+Medios" alt="Evento sin medios" />
                </div>
            </div>
        );
    }

    const scrollLeft = () => {
        if (galleryRef.current) {
            galleryRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (galleryRef.current) {
            galleryRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };
    
    return (
        <div className="card">
            <h2 className="card-title">Galería</h2>
            <div className="gallery-section">
                <button className="gallery-nav-button gallery-prev" onClick={scrollLeft}>
                    <i className="fas fa-chevron-left"></i>
                </button>
                <button className="gallery-nav-button gallery-next" onClick={scrollRight}>
                    <i className="fas fa-chevron-right"></i>
                </button>
                
                <div className="gallery-container" ref={galleryRef}>
                    {allMedia.map((media, index) => (
                        <div key={index} className="gallery-item" onClick={() => onMediaClick(index)}>
                            <img 
                                src={media.src} 
                                alt={`Media ${index + 1}`} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = `https://placehold.co/800x500?text=Media+${index + 1}+Error`; 
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal EventDetail --- 
const EventDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const subeventsCarouselRef = useRef(null);

    const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
    const closeLightbox = () => { setLightboxOpen(false); };

    useEffect(() => {
        const fetchEventDetails = async () => {
            setIsLoading(true); 
            setError(null);
            try {
                // Recuperar token (con manejo de caso donde no existe)
                const token = localStorage.getItem("token") || '';

                const eventFromState = location.state?.event;
                // Corregido: Verificar el id del evento usando la propiedad correcta
                if (eventFromState && eventFromState.id === id) {
                    console.log("Usando evento desde estado");
                    setEvent(eventFromState);
                } else {
                    console.log(`Fetching event ID: ${id}`);
                    const response = await fetch(`https://backendeventhub.onrender.com/api/events/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // Solo incluir Authorization si hay token
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        }
                    });

                    if (!response.ok) throw new Error(response.status === 404 ? 'Evento no encontrado.' : `Error ${response.status}`);
                    const eventData = await response.json();
                    
                    // Procesar datos para adaptarlos al formato esperado por el frontend
                    const processedEvent = processEventData(eventData);
                    setEvent(processedEvent);
                }
            } catch (err) { 
                console.error("Error fetching event:", err);
                setError(err.message); 
            } finally { 
                setIsLoading(false); 
            }
        };

        fetchEventDetails();
    }, [id, location.state]);

    // Función para procesar y adaptar los datos del evento
    const processEventData = (eventData) => {
        // Crear una copia para no mutar el original
        const processedEvent = { ...eventData };
        
        // Mapear ticketType de "paid" a "Pago"
        if (processedEvent.ticketType === "paid") {
            processedEvent.ticketType = "Pago";
        }
        
        // Crear array de categorías a partir del objeto categoria
        if (processedEvent.categoria && processedEvent.categoria.nombreCategoria) {
            processedEvent.categories = [processedEvent.categoria.nombreCategoria];
        } else {
            processedEvent.categories = [];
        }
        
        // Mapear currentAttendees a occupiedTickets si existe
        if (processedEvent.currentAttendees !== undefined) {
            processedEvent.occupiedTickets = processedEvent.currentAttendees;
        }
        
        // Asegurar que privacy esté en español
        if (processedEvent.privacy === "public") {
            processedEvent.privacy = "Público";
        } else if (processedEvent.privacy === "private") {
            processedEvent.privacy = "Privado";
        }
        
        return processedEvent;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } catch (e) { 
            return 'Fecha inválida'; 
        }
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return 'No especificada';
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
            });
        } catch (e) { 
            return 'Fecha inválida'; 
        }
    };
    
    const getDisplayPrice = (event) => {
        // Verificar si el evento existe y tiene las propiedades necesarias
        if (!event) return 'Gratuito';
        
        // Verificar si es un evento de pago con precio válido
        if (
            (event.ticketType === 'Pago' || event.ticketType === 'paid') && 
            event.price && 
            typeof event.price.amount === 'number' && 
            event.price.amount > 0
        ) {
            try {
                return Number(event.price.amount).toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: event.price.currency || 'COP', 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 2 
                });
            } catch (e) { 
                console.error("Error formateando precio:", e);
                return `COP ${event.price.amount} (Error formato)`; 
            }
        }
        return 'Gratuito';
    };

    const calculateRemainingTickets = (event) => {
        if (!event) return null;
        
        if (event.maxAttendees == null || typeof event.maxAttendees !== 'number' || event.maxAttendees <= 0) {
            return null;
        }
        
        // Usar occupiedTickets o currentAttendees, lo que esté disponible
        const occupied = typeof event.occupiedTickets === 'number' 
            ? event.occupiedTickets 
            : (typeof event.currentAttendees === 'number' ? event.currentAttendees : 0);
            
        const remaining = event.maxAttendees - occupied;
        return remaining >= 0 ? remaining : 0;
    };

    const scrollSubeventsLeft = () => {
        if (subeventsCarouselRef.current) {
            subeventsCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollSubeventsRight = () => {
        if (subeventsCarouselRef.current) {
            subeventsCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    if (isLoading) return <div className="loading-container"><div className="loading-spinner"></div>Cargando...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;
    if (!event) return <div className="not-found-container">Evento no encontrado.</div>;

    const displayPrice = getDisplayPrice(event);
    const remainingTickets = calculateRemainingTickets(event);

    // Preparar slides para el lightbox con validación
    const mainMediaUrls = event.mainImages && Array.isArray(event.mainImages) 
        ? event.mainImages.map(img => img?.url).filter(Boolean) 
        : [];
        
    const galleryMediaUrls = event.galleryImages && Array.isArray(event.galleryImages) 
        ? event.galleryImages.map(img => img?.url).filter(Boolean) 
        : [];
    
    const allMediaSources = [
        ...mainMediaUrls.map(src => ({ src, type: 'image' })),
        ...galleryMediaUrls.map(src => ({ src, type: 'image' }))
    ];
    
    const lightboxSlides = allMediaSources.map(media => ({ src: media.src }));

    // Imagen principal para el encabezado con validación
    const headerImage = event.mainImages && Array.isArray(event.mainImages) && event.mainImages.length > 0 && event.mainImages[0]?.url
        ? event.mainImages[0].url 
        : "https://placehold.co/1200x300?text=Sin+Imagen+Principal";

    return (
        <div>

            {/* Event Header */}
            <div className="event-header" style={{
                backgroundImage: `linear-gradient(to right, rgba(191, 215, 255, 0.9), rgba(186, 208, 255, 0.9)), url(${headerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="event-header-container">
                    <div className="event-header-content">
                        <div className="event-badges">
                            <span className="event-badge">
                                <i className="fas fa-ticket-alt"></i> {event.ticketType || 'Gratuito'}
                            </span>
                            <span className="event-badge">
                                <i className="fas fa-globe"></i> {event.privacy || 'Público'}
                            </span>
                        </div>
                        <h1 className="event-title">{event.title}</h1>
                        <div className="event-meta">
                            <div className="event-meta-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{event.location?.address || 'No especificada'} {event.location?.type ? `(${event.location.type})` : ''}</span>
                            </div>
                            <div className="event-meta-item">
                                <i className="far fa-calendar-alt"></i>
                                <span>
                                    {formatShortDate(event.start)} 
                                    {event.end ? ` - ${formatShortDate(event.end)}` : ''}
                                </span>
                            </div>
                            {event.maxAttendees && (
                                <div className="event-meta-item">
                                    <i className="fas fa-users"></i>
                                    <span>{event.maxAttendees} asistentes máx.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Una sola columna vertical */}
            <div className="main-container">
                <div className="content-column">
                    {/* Description Section */}
                    <div className="card">
                        <h2 className="card-title">Acerca del evento</h2>
                        <p className="description-text">{event.description || 'No hay descripción disponible.'}</p>
                        
                        {/* Categories */}
                        {event.categories && event.categories.length > 0 && (
                            <div className="categories-container">
                                <h3 className="categories-title">Categorías</h3>
                                <CategoryTags categories={event.categories} />
                            </div>
                        )}
                        
                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="tags-container">
                                <h3 className="tags-title">Etiquetas</h3>
                                <div className="tags-list">
                                    {event.tags.map((tag, index) => (
                                        <span key={index} className="tag-item">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Gallery Section */}
                    <MediaGallery 
                        mainImages={event.mainImages}
                        galleryImages={event.galleryImages}
                        onMediaClick={openLightbox}
                    />
                    
                    {/* Location Section */}
                    <EventMap position={event.location} />
                    
                    {/* Ticket Info Card */}
                    <div className="card">
                        <h2 className="card-title">Información de Tickets</h2>
                        
                        <div className="ticket-info-list">
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">Precio</span>
                                <span className="ticket-info-value ticket-price">{displayPrice}</span>
                            </div>
                            
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">Tipo</span>
                                <span className="ticket-info-value">{event.ticketType || 'Gratuito'}</span>
                            </div>
                            
                            {event.maxAttendees && (
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Capacidad máxima</span>
                                    <span className="ticket-info-value">{event.maxAttendees} personas</span>
                                </div>
                            )}
                            
                            {remainingTickets !== null && (
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Tickets disponibles</span>
                                    <span className="ticket-info-value">{remainingTickets} tickets</span>
                                </div>
                            )}
                            
                            {event.permitirInscripciones && event.fechaLimiteInscripcion && (
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Fecha límite de inscripción</span>
                                    <span className="ticket-info-value">{formatShortDate(event.fechaLimiteInscripcion)}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="ticket-actions">
                            {event.permitirInscripciones !== false && (
                                <button className="btn-primary">
                                    <i className="fas fa-ticket-alt"></i> Inscribirse
                                </button>
                            )}
                            <button className="btn-secondary">
                                <i className="far fa-calendar-plus"></i> Añadir al calendario
                            </button>
                        </div>
                    </div>
                    
                    {/* Organizer Info */}
                    {event.creator && (
                        <div className="card">
                            <h2 className="card-title">Organizador</h2>
                            <div className="organizer-info">
                                <div className="organizer-avatar">
                                    {event.creator.photo ? (
                                        <img src={event.creator.photo} alt="Organizador" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {event.creator.userName ? event.creator.userName.charAt(0).toUpperCase() : 'O'}
                                        </div>
                                    )}
                                </div>
                                <div className="organizer-details">
                                    <h3>{event.creator.userName || 'Organizador'}</h3>
                                    {event.creator.email && <p><i className="far fa-envelope"></i> {event.creator.email}</p>}
                                    {event.otherData?.contact && <p><i className="fas fa-phone"></i> {event.otherData.contact}</p>}
                                    {event.otherData?.organizer && <p><i className="fas fa-users"></i> {event.otherData.organizer}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Additional Info */}
                    {event.otherData && Object.keys(event.otherData).length > 0 && (
                        <div className="card">
                            <h2 className="card-title">Información adicional</h2>
                            <div className="additional-info">
                                {event.otherData.notes && (
                                    <div className="info-item">
                                        <h3><i className="fas fa-clipboard"></i> Notas</h3>
                                        <p>{event.otherData.notes}</p>
                                    </div>
                                )}
                                {/* Agregar más campos de otherData según sea necesario */}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox para galería */}
            {lightboxOpen && (
                <Lightbox
                    open={lightboxOpen}
                    close={closeLightbox}
                    slides={lightboxSlides}
                    index={lightboxIndex}
                    plugins={[Video]}
                />
            )}
        </div>
    );
};

export default withCheckAuth(EventDetail);
