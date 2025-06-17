import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import axios from "axios";
import Footer from "../components/footer.jsx";

// Leaflet Imports for Map
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Importar utilidades y componentes nuevos
import { EventCreatorUtils } from "../Utils/EventCreatorUtils"; // Importar el objeto completo
import InvitationComponent from "../components/InvitationComponent";

import SubEventsComponent from "../components/SubEvents";
import { withCheckAuth } from "../Utils/CheckAuth";

// Importar estilos mejorados
import "../EventHub-Styles/EventDetail.css";

// Fix Default Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// --- Category Colors ---
const categoryColors = {
  Música: "#88C0D0",
  "Arte y Cultura": "#EBCB8B",
  "Comida y Bebida": "#A3BE8C",
  Deportes: "#D08770",
  Negocios: "#5E81AC",
  Tecnología: "#B48EAD",
  "Aire Libre": "#A3BE8C",
  Comunidad: "#EBCB8B",
  Familia: "#88C0D0",
  Cine: "#BF616A",
  Moda: "#B48EAD",
  Educación: "#5E81AC",
  "Salud y Bienestar": "#A3BE8C",
  Otros: "#D8DEE9",
};

// --- Componente Etiquetas de Categoría ---
const CategoryTags = ({ categories }) => {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="category-tags-container">
      {categories.map((category, index) => (
        <span
          key={index}
          className="category-tag"
          style={{
            backgroundColor: categoryColors[category] || "#007bff",
            borderColor: categoryColors[category] || "#007bff",
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
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  };

  return (
    <div className="event-map-card">
      <h2 className="section-title">
        <span className="material-symbols-outlined">location_on</span>
        Ubicación
      </h2>
      <p className="text-gray-600 mb-6 flex items-center text-base font-medium">
        <i className="fas fa-map-marker-alt text-blue-500 mr-3"></i>
        {position.address || "No especificada"}
      </p>
      <div className="h-80 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-50">
        <MapContainer
          center={mapPosition}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
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

  const mainMediaUrls = mainImages ? mainImages.map((img) => img.url) : [];
  const galleryMediaUrls = galleryImages
    ? galleryImages.map((img) => img.url)
    : [];

  const allMedia = [
    ...mainMediaUrls.map((src) => ({ src, type: "image" })),
    ...galleryMediaUrls.map((src) => ({ src, type: "image" })),
  ];

  if (allMedia.length === 0) {
    return (
      <div className="media-gallery-card">
        <h2 className="section-title">
          <span className="material-symbols-outlined">image</span>
          Galería
        </h2>
        <div className="no-media-placeholder">
          <img
            src="https://placehold.co/800x500?text=Evento+Sin+Medios"
            alt="Evento sin medios"
            className="no-media-image"
          />
          <p>No hay imágenes ni videos disponibles para este evento.</p>
        </div>
      </div>
    );
  }

  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="media-gallery-card">
      <h2 className="section-title">
        <span className="material-symbols-outlined">image</span>
        Galería
      </h2>
      <div className="gallery-carousel-wrapper">
        <button
          className="gallery-nav-button left"
          onClick={scrollLeft}
        >
          <span className="material-symbols-outlined">chevron_backward</span>
        </button>
        <button
          className="gallery-nav-button right"
          onClick={scrollRight}
        >
          <span className="material-symbols-outlined">chevron_forward</span>
        </button>

        <div className="gallery-scroll-container" ref={galleryRef}>
          {allMedia.map((media, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => onMediaClick(index)}
            >
              <img
                src={media.src}
                alt={`Media ${index + 1}`}
                className="gallery-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/800x500?text=Media+Error`;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Componente Toast Simple ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-5 right-5 min-w-[250px] max-w-[350px] p-4 rounded-lg shadow-lg z-[9999] flex items-center justify-between text-white font-medium animate-slide-in";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 border-l-4 border-green-700`;
      case 'error':
        return `${baseStyles} bg-red-500 border-l-4 border-red-700`;
      case 'warning':
        return `${baseStyles} bg-orange-500 border-l-4 border-orange-700`;
      default:
        return `${baseStyles} bg-blue-500 border-l-4 border-blue-700`;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex-grow">{message}</div>
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
  const [toast, setToast] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const subeventsCarouselRef = useRef(null);

  // Función para mostrar el toast
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token") || "";
        const eventFromState = location.state?.event;
        
        if (eventFromState && eventFromState.id === id) {
          console.log("Usando evento desde estado");
          setEvent(eventFromState);
          // Verificar si es creador usando la función isEventCreator
          setIsCreator(EventCreatorUtils.isEventCreator(eventFromState));
        } else {
          console.log(`Fetching event ID: ${id}`);
          const response = await fetch(
            `https://backendeventhub.onrender.com/api/events/${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            }
          );

          if (!response.ok)
            throw new Error(
              response.status === 404
                ? "Evento no encontrado."
                : `Error ${response.status}`
            );
          
          const eventData = await response.json();
          const processedEvent = processEventData(eventData);
          setEvent(processedEvent);
          // Verificar si es creador usando la función isEventCreator
          setIsCreator(EventCreatorUtils.isEventCreator(processedEvent));
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

  // Debug adicional cuando cambia el estado (eliminado para producción)
  /*
  useEffect(() => {
    if (event) {
      console.group(\'🔍 Debug Componente de Invitaciones\');
      console.log(\'📝 Evento cargado:\', event);
      console.log(\'👤 Datos en localStorage:\');
      console.log(\'  - token:\', localStorage.getItem(\'token\') ? \'Presente\' : \'Ausente\');
      console.log(\'  - userName:\', localStorage.getItem(\'userName\'));
      console.log(\'  - role:\', localStorage.getItem(\'role\'));
      
      if (event.creator) {
        console.log(\'👨‍💼 Creador del evento:\', event.creator);
        console.log(\'🔗 Comparación:\');
        console.log(\'  - Usuario actual:\', localStorage.getItem(\'userName\'));
        console.log(\'  - Creador evento:\', event.creator.userName);
        console.log(\'  - ¿Coinciden?:\', localStorage.getItem(\'userName\') === event.creator.userName);
      }
      
      console.log(\'🔐 ¿Sesión activa?:\', EventCreatorUtils.hasActiveSession());
      console.log(\'✅ ¿Es creador?:\', isCreator);
      console.log(\'🎯 ¿Mostrar componente?:\', isCreator && EventCreatorUtils.hasActiveSession());
      console.groupEnd();
    }
  }, [event, isCreator]);
  */

  // Función para inscripción a eventos
  const registerForEvent = async (eventoId, tipoInscripcion = "evento_principal") => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("No hay sesión activa. Inicia sesión para inscribirte.", "error");
        throw new Error("No hay token de autenticación");
      }

      const response = await axios.post(
        "https://backendeventhub.onrender.com/api/inscriptions/register",
        {
          eventoId: id,
          tipoInscripcion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Inscripción exitosa:", response.data);
      showToast(response.data.message || "Te has inscrito exitosamente al evento", "success");

      return {
        success: true,
        data: response.data,
        message: "Te has inscrito exitosamente al evento",
      };
    } catch (error) {
      console.error("Error en la inscripción:", error);

      let errorMessage = "Error al inscribirse al evento";

      if (error.response) {
        errorMessage = error.response.data?.message || "Error al inscribirse";

        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "Datos de inscripción inválidos";
            break;
          case 401:
            errorMessage = "Sesión expirada. Inicia sesión nuevamente";
            break;
          case 403:
            errorMessage = "No tienes permisos para inscribirte a este evento";
            break;
          case 404:
            errorMessage = "El evento no existe";
            break;
          case 409:
            errorMessage = "Ya estás inscrito en este evento";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          default:
            errorMessage = error.response.data?.message || "Error al inscribirse";
        }
      } else if (error.request) {
        errorMessage = "Error de conexión. Verifica tu internet";
      }

      showToast(errorMessage, "error");

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Función para procesar y adaptar los datos del evento
  const processEventData = (eventData) => {
    const processedEvent = { ...eventData };

    if (processedEvent.ticketType === "paid") {
      processedEvent.ticketType = "Pago";
    }

    if (processedEvent.categoria && processedEvent.categoria.nombreCategoria) {
      processedEvent.categories = [processedEvent.categoria.nombreCategoria];
    }

    // Asegurar que mainImages y galleryImages sean arrays
    processedEvent.mainImages = Array.isArray(processedEvent.mainImages)
      ? processedEvent.mainImages
      : [];
    processedEvent.galleryImages = Array.isArray(processedEvent.galleryImages)
      ? processedEvent.galleryImages
      : [];

    // Si no hay mainImages, usar una imagen por defecto
    if (processedEvent.mainImages.length === 0) {
      processedEvent.mainImages.push({
        url: "https://placehold.co/1200x600?text=Imagen+Principal+No+Disponible",
      });
    }

    return processedEvent;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Fecha/Hora no disponible";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando detalles del evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="material-symbols-outlined">error</span>
        <p>Error al cargar el evento: {error}</p>
        <p>Por favor, intenta de nuevo más tarde.</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="no-event-found">
        <span className="material-symbols-outlined">sentiment_dissatisfied</span>
        <h2>Evento no encontrado</h2>
        <p>El evento que buscas no existe o ha sido eliminado.</p>
      </div>
    );
  }

  const allMediaForLightbox = [
    ...event.mainImages.map((img) => ({ src: img.url, type: "image" })),
    ...event.galleryImages.map((img) => ({ src: img.url, type: "image" })),
  ];

  return (
    <div className="event-detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sección de imagen principal y título */}
      <div
        className="main-image-section"
        style={{ backgroundImage: `url(${event.mainImages[0]?.url || "https://placehold.co/1200x600?text=Imagen+Principal+No+Disponible"})` }}
      >
        <div className="overlay"></div>
        <div className="event-header-content">
          <h1 className="event-title">{event.title || event.eventName}</h1>
          <p className="event-subtitle">{event.tagline || "Descubre un evento increíble"}</p>
          <div className="event-meta-badges">
            {event.categories && event.categories.length > 0 && (
              <CategoryTags categories={event.categories} />
            )}
            <span className="event-badge">
                <i className="fas fa-ticket-alt"></i>{" "}
                {event.ticketType || "Gratuito"}
              </span>
          </div>
        </div>
      </div>

      <div className="event-content-wrapper">
        <div className="event-main-content">
          {/* Sección de descripción */}
          <div className="event-description-card">
            <h2 className="section-title">
              <span className="material-symbols-outlined">description</span>
              Descripción del Evento
            </h2>
            <p className="event-description-text">{event.description}</p>
          </div>

          {/* Sección de detalles */}
          <div className="event-details-card">
            <h2 className="section-title">
              <span className="material-symbols-outlined">info</span>
              Detalles del Evento
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="material-symbols-outlined">calendar_today</span>
                <div>
                  <p className="detail-label">Fecha de Inicio</p>
                  <p className="detail-value">{formatDateTime(event.start)}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="material-symbols-outlined">event_end</span>
                <div>
                  <p className="detail-label">Fecha de Fin</p>
                  <p className="detail-value">{formatDateTime(event.end)}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="material-symbols-outlined">schedule</span>
                <div>
                  <p className="detail-label">Hora</p>
                  <p className="detail-value">{new Date(event.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="material-symbols-outlined">public</span>
                <div>
                  <p className="detail-label">Privacidad</p>
                  <p className="detail-value">{event.privacy}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="material-symbols-outlined">person</span>
                <div>
                  <p className="detail-label">Organizador</p>
                  <p className="detail-value">{event.creator?.userName || "N/A"}</p>
                </div>
              </div>
              <div className="detail-item">
                <span className="material-symbols-outlined">confirmation_number</span>
                <div>
                  <p className="detail-label">Tipo de Entrada</p>
                  <p className="detail-value">{event.ticketType}</p>
                </div>
              </div>
            </div>
            <button onClick={() => registerForEvent(event.id)} className="register-button">
              <span className="material-symbols-outlined">how_to_reg</span>
              Inscribirme
            </button>
          </div>

          {/* Sección de SubEventos */}
          {event.subeventIds && event.subeventIds.length > 0 && (
            <div className="subevents-section-card">
              <h2 className="section-title">
                <span className="material-symbols-outlined">event_note</span>
                Actividades del Evento
              </h2>
              <SubEventsComponent eventId={event.id} />
            </div>
          )}

          {/* Sección de Galería de Medios */}
          <MediaGallery
            mainImages={event.mainImages}
            galleryImages={event.galleryImages}
            onMediaClick={openLightbox}
          />

          {/* Sección de Ubicación (Mapa) */}
          <EventMap position={event.location} />
        </div>

        <div className="event-sidebar-content">
          {isCreator && EventCreatorUtils.hasActiveSession() && (
            <InvitationComponent eventId={event.id} showToast={showToast} />
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        slides={allMediaForLightbox}
        index={lightboxIndex}
        plugins={[Video]}
      />
      <Footer />
    </div>
  );
};

export default withCheckAuth(EventDetail);


