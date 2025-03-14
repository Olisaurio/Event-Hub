import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/sidebar';

const EventDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  
  // Usa useEffect para cargar los datos del evento cuando se monta el componente
  useEffect(() => {
    // Intenta obtener datos del evento del estado de navegación
    const eventFromState = location.state?.event;
    
    if (eventFromState) {
      setEvent(eventFromState);
    } else {
      // Si no hay datos en el estado, podríamos:
      // 1. Usar un fallback predeterminado
      // 2. Cargar los datos basados en el ID (para un escenario real con API)
      
      // Opción 1: Fallback predeterminado
      console.log("No event data in state, using fallback for ID:", id);
      
      // Simulamos obtener el evento por ID
      const fallbackEvents = [
        {
          id: "1",
          title: "Summer Music Festival",
          date: "Jun 15 - 17, 2022",
          category: "Music",
          image: "https://placehold.co/600x300/orange/white?text=Music+Festival",
          description: "Join us for three days of amazing music from top artists across multiple genres.",
          isOnline: false,
          address: "Sunset Park, 1234 Festival Ave, Austin, TX",
          website: "www.summerfestival.com"
        },
        {
          id: "2",
          title: "Tech Conference",
          date: "Jul 8, 2022",
          category: "Technology",
          image: "https://placehold.co/600x300/blue/white?text=Tech+Conference",
          description: "The premier tech conference bringing together innovators and developers.",
          isOnline: true,
          website: "www.techconf2022.com"
        },
        {
          id: "3",
          title: "Farmers Market",
          date: "Every Sunday",
          category: "Food & Drink",
          image: "https://placehold.co/600x300/green/white?text=Farmers+Market",
          description: "Local farmers selling fresh produce and homemade goods.",
          isOnline: false,
          address: "Downtown Square, 567 Market St",
          website: "www.localfarmersmarket.com"
        },
        {
          id: "4",
          title: "Comedy Show",
          date: "Aug 2, 2022",
          category: "Arts",
          image: "https://placehold.co/600x300/purple/white?text=Comedy+Show",
          description: "An evening of laughter with top comedians from around the country.",
          isOnline: false,
          address: "Laugh Factory, 789 Comedy Lane",
          website: "www.laughfactory.com"
        }
      ];
      
      // Buscar el evento por ID
      const foundEvent = fallbackEvents.find(e => e.id === id);
      
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        // Si no se encuentra, usa un evento genérico
        setEvent({
          id: id || "unknown",
          title: "Event Details",
          date: "Date not available",
          category: "Category not available",
          image: "https://placehold.co/600x300/gray/white?text=Event+Details",
          description: "No description available for this event.",
          isOnline: false,
          address: "Address not available",
          website: ""
        });
      }
      
      // Para un escenario real, podrías hacer una llamada a API:
      // fetch(`/api/events/${id}`)
      //   .then(response => response.json())
      //   .then(data => setEvent(data))
      //   .catch(error => console.error("Error fetching event:", error));
    }
  }, [id, location.state]);
  
  // Muestra un estado de carga mientras obtenemos los datos
  if (!event) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="event-detail-container">
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="event-detail-container">
          <div className="event-header">
            <button className="back-button" onClick={() => navigate('/')}>
              ← Back to Events Feed
            </button>
          </div>
          
          <div 
            className="event-banner"
            style={{ 
              backgroundImage: `url(${event.image})`,
              height: "300px",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "8px",
              position: "relative",
              marginBottom: "20px"
            }}
          >
            <div className="event-banner-overlay" style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              padding: "20px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              color: "white",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px"
            }}>
              <h1 className="event-banner-title" style={{
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "5px"
              }}>{event.title}</h1>
              <p>{event.category}</p>
            </div>
          </div>
          
          <div className="event-info-grid" style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px"
          }}>
            <div className="event-description" style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}>
              <h2 style={{ marginBottom: "15px" }}>About this event</h2>
              <p>{event.description}</p>
            </div>
            
            <div className="event-sidebar" style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}>
              <div className="event-info-section" style={{ marginBottom: "15px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "5px", color: "#666" }}>Date and time</h3>
                <p style={{ fontSize: "16px", color: "#333" }}>{event.date}</p>
              </div>
              
              {event.isOnline ? (
                <div className="event-info-section" style={{ marginBottom: "15px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "5px", color: "#666" }}>Location</h3>
                  <p style={{ fontSize: "16px", color: "#333" }}>Online event</p>
                </div>
              ) : (
                <div className="event-info-section" style={{ marginBottom: "15px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "5px", color: "#666" }}>Address</h3>
                  <p style={{ fontSize: "16px", color: "#333" }}>{event.address || "No address provided"}</p>
                </div>
              )}
              
              {event.website && (
                <div className="event-info-section" style={{ marginBottom: "15px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "5px", color: "#666" }}>Official website</h3>
                  <p style={{ fontSize: "16px", color: "#333" }}>{event.website}</p>
                </div>
              )}
              
              <button style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}>Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;