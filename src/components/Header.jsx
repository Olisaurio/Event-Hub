import React from 'react';
import "../Styles-EventHub/Header.css"

const Header = () => {
  return (
    <div className="header">
      <div className="header-logo">
        <span className="header-menu-icon">≡</span>
        <span>EventHub</span>
      </div>
      <div className="header-right">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            />
          
        </div>
        <button className="notification-button">🔔</button>
        <div className="profile-button">
          <img 
            src="/images/profile.jpg" 
            alt="Profile" 
            className="profile-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;