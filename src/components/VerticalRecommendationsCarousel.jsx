import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../Components-styles/VerticalRecommendationsCarousel.css';

const formatDateTime = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-ES', options);
};

const formatPrice = (priceData) => {
  if (!priceData || !priceData.amount) return 'Gratis';
     
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: priceData.currency || 'COP'
  }).format(priceData.amount);
};

const isEventFree = (event) => {
  // Verificar si es gratis por ticketType
  if (event.ticketType === 'Gratis' || event.ticketType === 'Free') {
    return true;
  }
  
  // Verificar si es gratis por precio
  if (!event.price || !event.price.amount || event.price.amount === 0) {
    return true;
  }
  
  return false;
};

const VerticalRecommendationsCarousel = ({ similarEvents }) => {
  if (!similarEvents || similarEvents.length === 0) {
    return <div className="recommendations-placeholder">No hay recomendaciones por ahora.</div>;
  }

  const settings = {
    dots: false,
    infinite: similarEvents.length > 3,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <div className="vertical-carousel-container">
      <h3 className="recommendations-title">Te podría interesar</h3>
      <Slider {...settings}>
        {similarEvents.map(event => (
          <div key={event.id} className="recommendation-item-wrapper">
            <Link to={`/event/${event.id}`} className="recommendation-item-link">
              <div className="recommendation-item">
                <img
                  src={event.mainImages?.[0]?.url || 'https://placehold.co/300x200?text=Evento'}
                  alt={event.title || 'Evento'}
                  className="recommendation-image"
                />
                <div className="recommendation-content">
                  {/* TÍTULO DEL EVENTO */}
                  <h4 className="event-title">
                    {event.title || 'Evento sin título'}
                  </h4>
                  
                  <div className="event-categories">
                    {event.categories?.map((category, index) => (
                      <span key={index} className="event-category-tag">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="event-date-container">
                    <div className="event-date">
                      {formatDateTime(event.start)} - {formatDateTime(event.end)}
                    </div>
                  </div>
                  
                  <div className="event-location">
                    {event.location?.address || 'Ubicación no especificada'}
                  </div>
                  
                  {/* PRECIO CON VALIDACIÓN MEJORADA */}
                  <div className="event-price">
                    {isEventFree(event) ? (
                      <span className="event-free">Gratis</span>
                    ) : (
                      <span className="event-paid">{formatPrice(event.price)}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default VerticalRecommendationsCarousel;