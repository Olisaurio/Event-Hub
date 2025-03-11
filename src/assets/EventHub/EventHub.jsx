import React, { useState } from 'react';
import Sidebar from '../../components/sidebar';
import EventCarousel from '../../components/EventCarousel';
import Header from '../../components/Header';


const EventHub = () => {
  // Datos de ejemplo para los eventos
  const events = [
    {
      id: 1,
      title: 'Summer Music Festival',
      date: 'Jun 15 - 17, 2022',
      category: 'Music',
      image: '/images/summer-festival.jpg'
    },
    {
      id: 2,
      title: 'Tech Conference',
      date: 'Jul 8, 2022',
      category: 'Technology',
      image: '/images/tech-conference.jpg'
    },
    {
      id: 3,
      title: 'Farmers Market',
      date: 'Every Sunday',
      category: 'Food & Drink',
      image: '/images/farmers-market.jpg'
    },
    {
      id: 4,
      title: 'Comedy Show',
      date: 'Aug 2, 2022',
      category: 'Arts',
      image: '/images/comedy-show.jpg'
    },
    {
      id: 5,
      title: 'Wine Tasting',
      date: 'Sep 12, 2022',
      category: 'Health & Wellness',
      image: '/images/wine-tasting.jpg'
    },{
      id: 6,
      title: 'Summer Music Festival',
      date: 'Jun 15 - 17, 2022',
      category: 'Music',
      image: '/images/summer-festival.jpg'
    },
    {
      id: 7,
      title: 'Tech Conference',
      date: 'Jul 8, 2022',
      category: 'Technology',
      image: '/images/tech-conference.jpg'
    },
    {
      id: 8,
      title: 'Farmers Market',
      date: 'Every Sunday',
      category: 'Food & Drink',
      image: '/images/farmers-market.jpg'
    },
    {
      id: 9,
      title: 'Comedy Show',
      date: 'Aug 2, 2022',
      category: 'Arts',
      image: '/images/comedy-show.jpg'
    },
    {
      id: 10,
      title: 'Wine Tasting',
      date: 'Sep 12, 2022',
      category: 'Health & Wellness',
      image: '/images/wine-tasting.jpg'
    }
  ];

  // Filtros de tiempo disponibles
  const timeFilters = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'weekend', label: 'This weekend' },
    { id: 'next-week', label: 'Next week' },
    { id: 'month', label: 'This month' }
  ];

  const [activeFilter, setActiveFilter] = useState('today');
  const [activePage, setActivePage] = useState(1);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="main-content">
        {/* Header */}
        <Header />
        
        {/* Page Title */}
        <h1 className="page-title">Discover the best events in your city</h1>
        
        {/* Time Filters */}
        <div className="time-filters">
          {timeFilters.map(filter => (
            <button
              key={filter.id}
              className={`time-filter-button ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
          <button className="see-all-button">See all</button>
        </div>
        
        {/* Event Carousel Component */}
        <EventCarousel events={events} />
        
        {/* Pagination */}
        <div className="pagination">
          <button className="pagination-arrow">&lt;</button>
          {[1, 2, 3, 4, 5].map(page => (
            <button
              key={page}
              className={`pagination-button ${activePage === page ? 'active' : ''}`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
          <button className="pagination-arrow">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default EventHub;

