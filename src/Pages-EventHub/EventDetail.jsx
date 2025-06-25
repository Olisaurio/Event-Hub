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
import { EventCreatorUtils } from "../Utils/EventCreatorUtils";
import InvitationComponent from "../components/InvitationComponent";

import SubEventsComponent from "../components/SubEvents";
import { withCheckAuth } from "../Utils/CheckAuth";

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
    <div className="flex flex-wrap gap-3">
      {categories.map((category, index) => (
        <span
          key={index}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            backgroundColor: categoryColors[category] || "#3b82f6",
            borderColor: categoryColors[category] || "#2563eb",
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
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
        Ubicación
        <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
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
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
          Galería
          <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
        </h2>
        <div className="min-w-[300px] w-[300px] rounded-xl overflow-hidden shadow-md h-56">
          <img
            src="https://placehold.co/800x500?text=Evento+Sin+Medios"
            alt="Evento sin medios"
            className="w-full h-full object-cover"
          />
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
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
        Galería
        <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
      </h2>
      <div className="relative w-full mt-4">
        <button
          className="absolute top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-md border-0 cursor-pointer text-blue-500 flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 hover:text-blue-600 w-12 h-12 left-[-25px]"
          onClick={scrollLeft}
        >
          <span className="material-symbols-outlined">chevron_backward</span>
        </button>
        <button
          className="absolute top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-md rounded-full p-3 shadow-md border-0 cursor-pointer text-blue-500 flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 hover:text-blue-600 w-12 h-12 right-[-25px]"
          onClick={scrollRight}
        >
          <span className="material-symbols-outlined">chevron_forward</span>
        </button>

        <div
          className="flex overflow-x-auto gap-5 py-4 scroll-smooth scrollbar-hide w-full"
          ref={galleryRef}
        >
          {allMedia.map((media, index) => (
            <div
              key={index}
              className="min-w-[300px] w-[300px] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl h-56 cursor-pointer"
              onClick={() => onMediaClick(index)}
            >
              <img
                src={media.src}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/800x500?text=Media+${
                    index + 1
                  }+Error`;
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
    const baseStyles =
      "fixed top-5 right-5 min-w-[250px] max-w-[350px] p-4 rounded-lg shadow-lg z-[9999] flex items-center justify-between text-white font-medium animate-slide-in";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-500 border-l-4 border-green-700`;
      case "error":
        return `${baseStyles} bg-red-500 border-l-4 border-red-700`;
      case "warning":
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
          // Verificar si es creador usando la función de debug
          const creatorStatus =
            EventCreatorUtils.debugValidation(eventFromState);
          setIsCreator(creatorStatus);
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
          // Verificar si es creador usando la función de debug
          const creatorStatus =
            EventCreatorUtils.debugValidation(processedEvent);
          setIsCreator(creatorStatus);
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

  // Debug adicional cuando cambia el estado
  useEffect(() => {
    if (event) {
      console.group("🔍 Debug Componente de Invitaciones");
      console.log("📝 Evento cargado:", event);
      console.log("👤 Datos en localStorage:");
      console.log(
        "  - token:",
        localStorage.getItem("token") ? "Presente" : "Ausente"
      );
      console.log("  - userName:", localStorage.getItem("userName"));
      console.log("  - role:", localStorage.getItem("role"));

      if (event.creator) {
        console.log("👨‍💼 Creador del evento:", event.creator);
        console.log("🔗 Comparación:");
        console.log("  - Usuario actual:", localStorage.getItem("userName"));
        console.log("  - Creador evento:", event.creator.userName);
        console.log(
          "  - ¿Coinciden?:",
          localStorage.getItem("userName") === event.creator.userName
        );
      }

      console.log("🔐 ¿Sesión activa?:", EventCreatorUtils.hasActiveSession());
      console.log("✅ ¿Es creador?:", isCreator);
      console.log(
        "🎯 ¿Mostrar componente?:",
        isCreator && EventCreatorUtils.hasActiveSession()
      );
      console.groupEnd();
    }
  }, [event, isCreator]);

  // Componente de debug temporal

  // Función para inscripción a eventos
  const registerForEvent = async (
    eventoId,
    tipoInscripcion = "evento_principal"
  ) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token en localStorage al intentar inscribirse:", token); // <-- Añade esta línea

      if (!token) {
        showToast(
          "No hay sesión activa. Inicia sesión para inscribirte.",
          "error"
        );
        throw new Error("No hay token de autenticación");
      }
      // ... el resto del código

      const response = await axios.post(
        "https://backendeventhub.onrender.com/api/inscriptions/register",
        {
          eventoId: id,
          tipoInscripcion,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Inscripción exitosa:", response.data);
      showToast(
        response.data.message || "Te has inscrito exitosamente al evento",
        "success"
      );

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
    } else {
      processedEvent.categories = [];
    }

    if (processedEvent.currentAttendees !== undefined) {
      processedEvent.occupiedTickets = processedEvent.currentAttendees;
    }

    if (processedEvent.privacy === "public") {
      processedEvent.privacy = "Público";
    } else if (processedEvent.privacy === "private") {
      processedEvent.privacy = "Privado";
    }

    return processedEvent;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Fecha inválida";
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const getDisplayPrice = (event) => {
    if (!event) return "Gratuito";

    if (
      (event.ticketType === "Pago" || event.ticketType === "paid") &&
      event.price &&
      typeof event.price.amount === "number" &&
      event.price.amount > 0
    ) {
      try {
        return Number(event.price.amount).toLocaleString("es-CO", {
          style: "currency",
          currency: event.price.currency || "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      } catch (e) {
        console.error("Error formateando precio:", e);
        return `COP ${event.price.amount} (Error formato)`;
      }
    }
    return "Gratuito";
  };

  const calculateRemainingTickets = (event) => {
    if (!event) return null;

    if (
      event.maxAttendees == null ||
      typeof event.maxAttendees !== "number" ||
      event.maxAttendees <= 0
    ) {
      return null;
    }

    const occupied =
      typeof event.occupiedTickets === "number"
        ? event.occupiedTickets
        : typeof event.currentAttendees === "number"
        ? event.currentAttendees
        : 0;

    const remaining = event.maxAttendees - occupied;
    return remaining >= 0 ? remaining : 0;
  };

  // Callback para cuando se envía una invitación
  const handleInvitationSent = (invitationData) => {
    console.log("Invitación enviada:", invitationData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <div className="border-4 border-blue-200 rounded-full border-t-blue-500 w-12 h-12 animate-spin mb-6"></div>
        <p className="text-gray-600">Cargando evento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 text-red-500 font-medium text-lg">
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-96 text-red-500 font-medium text-lg">
        Evento no encontrado
      </div>
    );
  }

  const mainMediaUrls = event.mainImages
    ? event.mainImages.map((img) => img.url)
    : [];
  const galleryMediaUrls = event.galleryImages
    ? event.galleryImages.map((img) => img.url)
    : [];
  const allMedia = [
    ...mainMediaUrls.map((src) => ({ src, type: "image" })),
    ...galleryMediaUrls.map((src) => ({ src, type: "image" })),
  ];

  const backgroundImage =
    mainMediaUrls.length > 0
      ? mainMediaUrls[0]
      : "https://placehold.co/1200x400?text=Evento";

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Event Header */}
      <div
        className="relative h-96 mb-8 w-full mx-auto bg-cover bg-center bg-no-repeat overflow-hidden rounded-2xl"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Overlay gradientes */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/20 to-black/60 z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3/5 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-20"></div>

        <div className="w-full max-w-6xl mx-auto px-6 h-full flex items-end relative z-30">
          <div className="pb-10 w-full">
            {/* Event Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5">
                <i className="fas fa-calendar mr-2"></i>
                {event.type || "Evento"}
              </span>
              <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-300 hover:bg-white/25 hover:-translate-y-0.5">
                <i className="fas fa-users mr-2"></i>
                {event.privacy || "Público"}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight max-w-[90%] text-white">
              {event.title}
            </h1>

            {/* Event Meta */}
            <div className="flex flex-wrap items-center gap-6 mt-4 text-white/95 text-base">
              <div className="flex items-center bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
                <i className="fas fa-calendar-alt text-blue-400 mr-2"></i>
                {formatDate(event.start)}
              </div>
              <div className="flex items-center bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm">
                <i className="fas fa-map-marker-alt text-blue-400 mr-2"></i>
                {event.location?.address || "Ubicación no especificada"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full mx-auto px-6 box-border">
        <div className="flex flex-col gap-8 w-full mx-auto mb-4">
          {/* Componente de Debug - REMOVER EN PRODUCCIÓN */}

          {/* Componente de Invitaciones - Solo visible para el creador */}
          {/* Componente de Invitaciones - Solo visible para el creador y si el evento es privado */}
          {isCreator &&
            EventCreatorUtils.hasActiveSession() &&
            event.privacy === "private" && ( // <-- CAMBIO AQUÍ
              <InvitationComponent
                eventId={event.id}
                onInvitationSent={handleInvitationSent}
                showToast={showToast}
              />
            )}

          {/* Description Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
              Descripción
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
            </h2>
            <p className="text-gray-600 leading-relaxed text-base">
              {event.description ||
                "No hay descripción disponible para este evento."}
            </p>

            {/* Categories */}
            {event.categories && event.categories.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-50">
                <h3 className="text-lg font-medium mb-4 text-gray-700">
                  Categorías
                </h3>
                <CategoryTags categories={event.categories} />
              </div>
            )}
          </div>

          {/* Media Gallery */}
          <MediaGallery
            mainImages={event.mainImages}
            galleryImages={event.galleryImages}
            onMediaClick={openLightbox}
          />

          {/* Event Map */}
          <EventMap position={event.location} />

          {/* Ticket Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
              Información del Evento
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
            </h2>

            <div className="flex flex-col w-full gap-2">
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-gray-50">
                <span className="text-gray-500 font-medium">Precio</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {getDisplayPrice(event)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-gray-50">
                <span className="text-gray-500 font-medium">
                  Fecha de inicio
                </span>
                <span className="font-semibold text-gray-800">
                  {formatDate(event.start)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-gray-50">
                <span className="text-gray-500 font-medium">Fecha de fin</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(event.end)}
                </span>
              </div>

              {calculateRemainingTickets(event) !== null && (
                <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-gray-50">
                  <span className="text-gray-500 font-medium">
                    Cupos disponibles
                  </span>
                  <span className="font-semibold text-gray-800">
                    {calculateRemainingTickets(event)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => registerForEvent(event.id)}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg text-center border-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:from-blue-600 hover:to-blue-700 shadow-md mt-6"
            >
              Inscribirse al Evento
            </button>
          </div>

          {/* Organizer Information */}
          {event.creator && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-50 w-full box-border mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 relative pb-2">
                Organizador
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></span>
              </h2>

              <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center text-blue-500 text-2xl shadow-md">
                  <i className="fas fa-user"></i>
                </div>
                <div className="ml-6">
                  <h3 className="font-semibold text-xl text-gray-800">
                    {event.creator.userName ||
                      event.creator.name ||
                      "Organizador"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Organizador del evento
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {event.creator.email && (
                  <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <i className="fas fa-envelope text-blue-500 mt-1 mr-4"></i>
                    <div>
                      <p className="font-medium text-gray-800">Email</p>
                      <p className="text-gray-600">{event.creator.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-events Section */}
          {event.subeventIds && event.subeventIds.length > 0 && (
            <div className="mt-12 w-full">
              <h2 className="text-3xl font-semibold mb-8 text-gray-800 text-center">
                Sub-eventos
              </h2>
              <SubEventsComponent eventId={event.id} />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={closeLightbox}
        index={lightboxIndex}
        slides={allMedia}
        plugins={[Video]}
      />

      <Footer />

      {/* Estilos adicionales para animaciones */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default withCheckAuth(EventDetail);
