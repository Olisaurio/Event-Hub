import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";

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
                const token = localStorage.getItem("token"); // Recuperar token

                const eventFromState = location.state?.event;
                if (eventFromState && eventFromState._id === id) {
                    console.log("Usando evento desde estado");
                    setEvent(eventFromState);
                } else {
                    console.log(`Fetching event ID: ${id}`);
                    const response = await fetch(`https://backendeventhub.onrender.com/api/events/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` // Autorización con token
                        }
                    });

                    if (!response.ok) throw new Error(response.status === 404 ? 'Evento no encontrado.' : `Error ${response.status}`);
                    const eventData = await response.json();
                    setEvent(eventData);
                }
            } catch (err) { 
                setError(err.message); 
            } finally { 
                setIsLoading(false); 
            }
        };

        fetchEventDetails();
    }, [id, location.state]);

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
        if (event?.ticketType === 'Pago' && event.price && typeof event.price.amount === 'number' && event.price.amount > 0) {
            try {
                return Number(event.price.amount).toLocaleString('es-CO', { 
                    style: 'currency', 
                    currency: event.price.currency || 'COP', 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 2 
                });
            } catch (e) { 
                return `COP ${event.price.amount} (Error formato)`; 
            }
        }
        return 'Gratuito';
    };

    const calculateRemainingTickets = (event) => {
        if (event?.maxAttendees == null || typeof event.maxAttendees !== 'number' || event.maxAttendees <= 0) {
            return null;
        }
        const occupied = typeof event.occupiedTickets === 'number' ? event.occupiedTickets : 0;
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

    // Preparar slides para el lightbox
    const mainMediaUrls = event.mainImages ? event.mainImages.map(img => img.url) : [];
    const galleryMediaUrls = event.galleryImages ? event.galleryImages.map(img => img.url) : [];
    
    const allMediaSources = [
        ...mainMediaUrls.map(src => ({ src, type: 'image' })),
        ...galleryMediaUrls.map(src => ({ src, type: 'image' }))
    ];
    
    const lightboxSlides = allMediaSources.map(media => ({ src: media.src }));

    // Imagen principal para el encabezado
    const headerImage = event.mainImages && event.mainImages.length > 0 
        ? event.mainImages[0].url 
        : "https://placehold.co/1200x300?text=Sin+Imagen+Principal";

    return (
        <div>
        <Header/>
            <Sidebar/>

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
                                    <span className="ticket-info-label">Disponibilidad</span>
                                    <span className="ticket-info-value">{event.maxAttendees} lugares</span>
                                </div>
                            )}
                            
                            <div className="ticket-info-item">
                                <span className="ticket-info-label">Fecha de inicio</span>
                                <span className="ticket-info-value">{formatShortDate(event.start)}</span>
                            </div>
                            
                            {event.end && (
                                <div className="ticket-info-item">
                                    <span className="ticket-info-label">Fecha de fin</span>
                                    <span className="ticket-info-value">{formatShortDate(event.end)}</span>
                                </div>
                            )}
                        </div>
                        
                        <button className="subscribe-btn">
                            Suscribirse al evento
                        </button>
                    </div>
                    
                    {/* Organizer Info Card */}
                    {event.otherData && (
                        <div className="card">
                            <h2 className="card-title">Organizador</h2>
                            
                            <div className="organizer-header">
                                <div className="organizer-avatar">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <div className="organizer-info">
                                    <h3 className="organizer-name">{event.otherData.organizer || 'No especificado'}</h3>
                                    <p className="organizer-role">Organizador</p>
                                </div>
                            </div>
                            
                            <div className="organizer-details">
                                {event.otherData.contact && (
                                    <div className="organizer-detail">
                                        <i className="fas fa-phone-alt"></i>
                                        <span>{event.otherData.contact}</span>
                                    </div>
                                )}
                                {event.otherData.notes && (
                                    <div className="organizer-detail">
                                        <i className="fas fa-sticky-note"></i>
                                        <span>{event.otherData.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Sub-events Section */}
                    {event.subeventIds && event.subeventIds.length > 0 && (
                        <div className="subevents-section">
                            <h2 className="subevents-title">Sub-eventos</h2>
                            
                            <div className="carousel-container">
                                <button className="carousel-nav-button carousel-prev" onClick={scrollSubeventsLeft}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button className="carousel-nav-button carousel-next" onClick={scrollSubeventsRight}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                                
                                <div className="carousel-wrapper" ref={subeventsCarouselRef}>
                                    <SubEventsComponent 
                                        subEvents={event.subeventIds} 
                                        customRender={(subEvent) => (
                                            <div className="subevent-card">
                                                <div className="subevent-images">
                                                    <div className="subevent-images-container">
                                                        {subEvent.mainImages && subEvent.mainImages.length > 0 ? (
                                                            <>
                                                                <img 
                                                                    src={subEvent.mainImages[0].url} 
                                                                    alt={subEvent.title} 
                                                                    className="subevent-image"
                                                                    onError={(e) => { 
                                                                        e.target.onerror = null; 
                                                                        e.target.src = "https://placehold.co/400x300?text=Imagen+No+Disponible"; 
                                                                    }}
                                                                />
                                                                {subEvent.mainImages.length > 1 ? (
                                                                    <img 
                                                                        src={subEvent.mainImages[1].url} 
                                                                        alt={subEvent.title} 
                                                                        className="subevent-image"
                                                                        onError={(e) => { 
                                                                            e.target.onerror = null; 
                                                                            e.target.src = "https://placehold.co/400x300?text=Imagen+No+Disponible"; 
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <img 
                                                                        src={subEvent.mainImages[0].url} 
                                                                        alt={subEvent.title} 
                                                                        className="subevent-image"
                                                                        onError={(e) => { 
                                                                            e.target.onerror = null; 
                                                                            e.target.src = "https://placehold.co/400x300?text=Imagen+No+Disponible"; 
                                                                        }}
                                                                    />
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <img 
                                                                    src="https://placehold.co/400x300?text=Imagen+No+Disponible" 
                                                                    alt="Imagen no disponible" 
                                                                    className="subevent-image"
                                                                />
                                                                <img 
                                                                    src="https://placehold.co/400x300?text=Imagen+No+Disponible" 
                                                                    alt="Imagen no disponible" 
                                                                    className="subevent-image"
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="subevent-content">
                                                    <h3 className="subevent-title">{subEvent.title}</h3>
                                                    <p className="subevent-description">{subEvent.description || 'Sin descripción'}</p>
                                                    <div className="subevent-meta">
                                                        <div className="subevent-meta-item">
                                                            <i className="far fa-calendar-alt"></i>
                                                            <span>{formatShortDate(subEvent.start)}</span>
                                                        </div>
                                                        <div className="subevent-meta-item">
                                                            <i className="fas fa-map-marker-alt"></i>
                                                            <span>{subEvent.location?.address || 'Ubicación no especificada'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <Lightbox 
                open={lightboxOpen} 
                close={closeLightbox} 
                slides={lightboxSlides} 
                index={lightboxIndex} 
                plugins={[Video]} 
            />
        </div>
    );
};

export default withCheckAuth(EventDetail);
