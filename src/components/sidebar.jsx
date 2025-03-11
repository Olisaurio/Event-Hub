import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', active: true },
    { id: 'events', icon: '📅', label: 'Events' },
    { id: 'venues', icon: '📍', label: 'Venues' },
    { id: 'organizers', icon: '👥', label: 'Organizers' },
    { id: 'create', icon: '➕', label: 'Create Event' },
    { id: 'help', icon: '❓', label: 'Help' },
  ];

  return (
    <div className="sidebar">
      {menuItems.map(item => (
        <div
          key={item.id}
          className={`sidebar-item ${item.active ? 'active' : ''}`}
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <div className="sidebar-login">
        <div className="sidebar-item">
          <span className="sidebar-icon">👤</span>
          <span>Log in or sign up</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;