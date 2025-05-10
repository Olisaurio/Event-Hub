import React from 'react';
import { Link } from 'react-router-dom';
import "../Components-styles/Sidebar.css"; // Actualizado

const Sidebar = () => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/EventHub', active: true },
    { id: 'events', icon: '📅', label: 'Events', path: '/events' },
    { id: 'venues', icon: '📍', label: 'Venues', path: '/venues' },
    { id: 'organizers', icon: '👥', label: 'Organizers', path: '/organizers' },
    { id: 'create', icon: '➕', label: 'Create Event', path: '/create-event' },
    { id: 'help', icon: '❓', label: 'Help', path: '/help' },
  ];

  return (
    <div className="sidebar">
      {menuItems.map(item => (
        <Link 
          to={item.path} 
          key={item.id} 
          className="sidebar-item-link"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            className={`sidebar-item ${item.active ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
      <div className="sidebar-login">
        <Link 
          to="/login" 
          className="sidebar-item-link"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="sidebar-item">
            <span className="sidebar-icon">👤</span>
            <span>Log in or sign up</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
