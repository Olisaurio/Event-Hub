import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import CategoryGridSection from "../components/CategoryGridSection";
import "../EventHub-Styles/EventHub.css";
import Footer from "../components/footer";
import { withCheckAuth } from "../Utils/CheckAuth";
import FeaturedEvents from "../components/FeaturedEvents";

// Datos del carrusel - aquí puedes cambiar las URLs de las imágenes
const carouselSlides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1700&q=80",
    title: "Organiza y Descubre Eventos con Facilidad",
    subtitle: "Una plataforma para conectar, gestionar y disfrutar eventos.",
  },
  {
    id: 2,
    image:
      "https://imgs.search.brave.com/QEN90DWJh0_rFRRbpmc5OqgHKbYbGYRklnIOB6QgXfU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdDIu/ZGVwb3NpdHBob3Rv/cy5jb20vMTA1MzY0/Ni81NzU1L2kvNDUw/L2RlcG9zaXRwaG90/b3NfNTc1NTE4NjMt/c3RvY2stcGhvdG8t/cm9jay1jb25jZXJ0/LmpwZw",
    title: "Crea Eventos Únicos",
    subtitle: "Herramientas intuitivas para organizar experiencias memorables.",
  },
  {
    id: 3,
    image:
      "https://imgs.search.brave.com/-_j2Outmi_EPPIRLSSXtbKkXtqLQdOZxjg5jABv7NNo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90by1ncmF0aXMv/cGVyc29uYXMtcXVl/LXBhcnRpY2lwYW4t/ZXZlbnRvLWFsdG8t/cHJvdG9jb2xvXzIz/LTIxNTA5NTEyNDMu/anBnP3NlbXQ9YWlz/X2h5YnJpZCZ3PTc0/MA",
    title: "Únete a la Comunidad",
    subtitle: "Descubre eventos increíbles y conecta con personas afines.",
  },
];

const EventHub = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [allAvailableCategories, setAllAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  // Fetch de categorías desde la API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://backendeventhub.onrender.com/api/categories",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categoriesData = await response.json();

        // Formatear las categorías para que coincidan con la estructura esperada
        const formattedCategories = [
          {
            name: "Todos",
            id: "all",
            descripcion: "Mostrar todos los eventos",
          },
          ...categoriesData
            .filter((cat) => cat.activa) // Solo categorías activas
            .map((cat) => ({
              name: cat.nombreCategoria,
              id: cat.nombreCategoria,
              descripcion: cat.descripcion,
            })),
        ];

        setAllAvailableCategories(formattedCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Fallback a categorías por defecto en caso de error
        setAllAvailableCategories([
          {
            name: "Todos",
            id: "all",
            descripcion: "Mostrar todos los eventos",
          },
        ]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      let url = "https://backendeventhub.onrender.com/api/events/recent";

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.title || event.eventName,
          start: event.start,
          end: event.end,
          location: event.location,
          locationText: event.location
            ? `${event.location.address || ""}${
                event.location.city ? `, ${event.location.city}` : ""
              }${
                event.location.department
                  ? `, ${event.location.department}`
                  : ""
              }`
            : "Ubicación no especificada",
          mainImages: event.mainImages || [],
          image:
            event.mainImages && event.mainImages.length > 0
              ? event.mainImages[0].url
              : "https://placehold.co/600x400?text=Evento",
          categories: event.categories || [],
          price: event.price,
          privacy: event.privacy,
          originalEvent: event,
        }));

        setAllEvents(formattedEvents);
        setRecommendations(formattedEvents.slice(0, 5));
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message);
        setAllEvents([]);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const featuredEvents = useMemo(() => {
    const now = new Date();
    return [...allEvents]
      .filter((event) => event.start && new Date(event.start) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 6);
  }, [allEvents]);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "all") {
      navigate("/events");
    } else {
      navigate(`/events?category=${encodeURIComponent(categoryId)}`);
    }
  };

  const formatDateRange = (start, end) => {
    if (!start) return "Fecha no disponible";
    const startDate = new Date(start);
    let dateText = startDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (end) {
      const endDate = new Date(end);
      if (startDate.toDateString() !== endDate.toDateString()) {
        dateText += ` - ${endDate.toLocaleDateString("es-ES", {
          day: "numeric",
        })}`;
      }
    }
    return dateText;
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>Cargando eventos...
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="error-container">
            Error al cargar eventos: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content event-hub-page">
        {/* Carrusel Automático */}
        <div className="carousel-container">
          <div className="carousel-wrapper">
            {carouselSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="carousel-content">
                  <h1 className="banner-title">{slide.title}</h1>
                  <p className="banner-subtitle">{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Indicadores del carrusel */}
          <div className="carousel-indicators">
            {carouselSlides.map((_, index) => (
              <div
                key={index}
                className={`indicator ${
                  index === currentSlide ? "active" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Barra de Categorías */}
        <section className="mb-8 md:mb-12">
          <CategoryGridSection
            categories={allAvailableCategories}
            onCategorySelect={handleCategoryClick}
          />
        </section>

        <FeaturedEvents events={featuredEvents} />
        <Footer />
      </div>
    </div>
  );
};

export default withCheckAuth(EventHub);
