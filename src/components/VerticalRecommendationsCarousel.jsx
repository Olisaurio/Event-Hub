import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../Components-styles/VerticalRecommendationsCarousel.css'; // Actualizado

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
          <div key={event.id} className="recommendation-item-wrapper"> {/* Wrapper para el Link */}
            <Link to={`/event/${event.id}`} className="recommendation-item-link">
              <div className="recommendation-item">
                <img src={event.image || 'https://placehold.co/300x200?text=Evento'} alt={event.eventName} className="recommendation-image" />
                <div className="recommendation-info">
                  <p className="recommendation-name">{event.eventName}</p>
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

