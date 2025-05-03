import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

// Leaflet Imports for Map
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import '../../Styles/EventDetail_responsive.css';
import SubEventsComponent from '../../components/SubEvents'; // Adjusted path assuming SubEvents is in components

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Fix Default Leaflet Icon (Same as CreateEvent)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Category Colors (Should ideally be in a shared constants file) ---
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
        <div className="category-tags-container">
            {categories.map(category => (
                <span 
                    key={category} 
                    className="category-tag"
                    style={{ 
                        backgroundColor: (categoryColors[category] || '#ECEFF4') + '33', // Add alpha for background
                        color: categoryColors[category] || '#4C566A', 
                        borderColor: categoryColors[category] || '#D8DEE9'
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

    // Componente para centrar el mapa cuando cambie la posición
    const ChangeView = ({ center, zoom }) => {
        const map = useMap();
        useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
        return null;
    };

    return (
        <div className="event-map-container">
            <h3>Ubicación en el Mapa</h3>
            <MapContainer center={mapPosition} zoom={15} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
                <ChangeView center={mapPosition} zoom={15} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapPosition}></Marker>
            </MapContainer>
        </div>
    );
};

// --- Componente Carrusel (Sin cambios funcionales) ---
const MediaCarousel = ({ mainMedia, galleryImages, onMediaClick }) => {
  const allMedia = [
      ...(mainMedia || []).map(src => ({ src, type: src.startsWith('data:video') ? 'video' : 'image' })),
      ...(galleryImages || []).map(src => ({ src, type: 'image' }))
  ];
  if (allMedia.length === 0) {
    return (
      <div className="image-carousel-placeholder">
        <img src="https://placehold.co/800x500?text=Evento+Sin+Medios" alt="Evento sin medios" />
      </div>
    );
  }
  const settings = {
    dots: true, arrows: true, infinite: allMedia.length > 1, speed: 500,
    slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000,
    pauseOnHover: true, adaptiveHeight: true,
  };
  return (
    <div className="media-carousel-container">
      <Slider {...settings}>
        {allMedia.map((media, index) => (
          <div key={index} className="carousel-slide" onClick={() => onMediaClick(index)}>
            {media.type === 'image' ? (
              <img src={media.src} alt={`Media ${index + 1}`} onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x500?text=Media+${index + 1}+Error`; }}/>
            ) : media.type === 'video' ? (
              <video src={media.src} controls onError={(e) => console.error("Error video carrusel:", e)}/>
            ) : null}
          </div>
        ))}
      </Slider>
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

  const openLightbox = (index) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => { setLightboxOpen(false); };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true); setError(null);
      try {
        const eventFromState = location.state?.event;
        if (eventFromState && eventFromState.id === id && eventFromState.mainImages && eventFromState.galleryImages) {
            console.log("Usando evento desde estado");
            setEvent(eventFromState);
        } else {
            console.log(`Fetching event ID: ${id}`);
            const response = await fetch(`http://localhost:3001/events/${id}`);
            if (!response.ok) throw new Error(response.status === 404 ? 'Evento no encontrado.' : `Error ${response.status}`);
            const eventData = await response.json();
            setEvent(eventData);
        }
      } catch (err) { setError(err.message); }
      finally { setIsLoading(false); }
    };
    fetchEventDetails();
  }, [id, location.state]);

  // Funciones de formato (sin cambios)
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) { return 'Fecha inválida'; }
  };
  const getDisplayPrice = (event) => {
    if (event?.ticketType === 'paid' && event.price && typeof event.price.amount === 'number' && event.price.amount > 0) {
      try {
        return Number(event.price.amount).toLocaleString('es-CO', { style: 'currency', currency: event.price.currency || 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
      } catch (e) { return `COP ${event.price.amount} (Error formato)`; }
    }
    return 'Gratuito';
  };

  // Calcular entradas restantes
  const calculateRemainingTickets = (event) => {
      if (event?.maxAttendees == null || typeof event.maxAttendees !== 'number' || event.maxAttendees <= 0) {
          return null; // No mostrar si no hay capacidad definida o es inválida
      }
      const occupied = typeof event.occupiedTickets === 'number' ? event.occupiedTickets : 0;
      const remaining = event.maxAttendees - occupied;
      return remaining >= 0 ? remaining : 0; // No mostrar negativo
  };

  if (isLoading) return <div className="loading-container"><div className="loading-spinner"></div>Cargando...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!event) return <div className="not-found-container">Evento no encontrado.</div>;

  const displayPrice = getDisplayPrice(event);
  const remainingTickets = calculateRemainingTickets(event);

  // Preparar slides para Lightbox (sin cambios)
  const allMediaSources = [
      ...(event.mainImages || []).map(src => ({ src, type: src.startsWith('data:video') ? 'video' : 'image' })),
      ...(event.galleryImages || []).map(src => ({ src, type: 'image' }))
  ];
  const lightboxSlides = allMediaSources.map(media => {
      if (media.type === 'video') {
          return { type: 'video', sources: [{ src: media.src, type: media.src.substring(media.src.indexOf(':') + 1, media.src.indexOf(';')) }] };
      } else { return { src: media.src }; }
  });

  return (
    <div className="event-detail-page">
      <MediaCarousel 
        mainMedia={event.mainImages}
        galleryImages={event.galleryImages}
        onMediaClick={openLightbox}
      />

      <div className="event-content-container">
        <div className="event-title-section"><h1>{event.eventName}</h1></div>
        
        {/* Mostrar Categorías como etiquetas */} 
        <CategoryTags categories={event.categories} />

        <div className="event-primary-info">
          <div className="info-block date-block"><span className="info-icon">📅</span><div className="info-text"><span className="info-label">Fecha y Hora</span><span className="info-value">{formatDate(event.date?.start)}</span>{event.date?.end && <span className="info-value end-date">Hasta: {formatDate(event.date.end)}</span>}</div></div>
          <div className="info-block location-block"><span className="info-icon">📍</span><div className="info-text"><span className="info-label">Ubicación</span><span className="info-value">{event.location?.address || 'No especificada'}</span>{event.location?.type && event.location.type !== 'presencial' && <span className="location-type">({event.location.type})</span>}</div></div>
          <div className="info-block price-block"><span className="info-icon">🎟️</span><div className="info-text"><span className="info-label">Entrada</span><span className={`info-value price-value ${event?.ticketType !== 'paid' || !event.price || event.price.amount <= 0 ? 'free' : 'paid'}`}>{displayPrice}</span></div></div>
          {/* Mostrar Capacidad y Restantes si aplica */} 
          {event.maxAttendees != null && (
              <div className="info-block capacity-block"><span className="info-icon">👥</span><div className="info-text"><span className="info-label">Capacidad</span><span className="info-value">{event.maxAttendees}</span></div></div>
          )}
          {remainingTickets !== null && (
              <div className="info-block remaining-block"><span className="info-icon">📊</span><div className="info-text"><span className="info-label">Entradas Restantes</span><span className="info-value">{remainingTickets}</span></div></div>
          )}
        </div>
        
        <div className="event-description-section"><h2>Acerca del Evento</h2><p>{event.description || 'No hay descripción disponible.'}</p></div>
        
        {/* Detalles Adicionales (Simplificado, ya que capacidad y categorías están arriba) */} 
        <div className="event-secondary-info"><h2>Detalles Adicionales</h2><div className="details-grid">
            <div className="detail-item"><span className="detail-label">Tipo:</span><span className="detail-value">{event.type || 'N/A'}</span></div>
            <div className="detail-item"><span className="detail-label">Privacidad:</span><span className="detail-value">{event.privacy || 'N/A'}</span></div>
            {/* Otros detalles si los hubiera */} 
        </div></div>
        
        {/* Sub-Eventos */} 
        {event.subEvents && event.subEvents.length > 0 && (
          <div className="event-subevents-section"><h2>Agenda / Sub-Eventos</h2><SubEventsComponent subEvents={event.subEvents} /></div>
        )}

        {/* Mapa de Ubicación */} 
        <EventMap position={event.location} />

      </div>
      
      <Lightbox open={lightboxOpen} close={closeLightbox} slides={lightboxSlides} index={lightboxIndex} plugins={[Video]} />

    </div>
  );
};

export default EventDetail;

