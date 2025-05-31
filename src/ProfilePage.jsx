import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileDetails from './components/ProfileDetails';

const ProfilePage = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <div className="content-wrapper">
            <h1 className="page-title">My Profile</h1>
            <ProfileDetails />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;