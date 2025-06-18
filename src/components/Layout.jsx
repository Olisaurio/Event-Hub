import React from 'react';
import Header from './Header.jsx';
import Sidebar from './sidebar.jsx';
import { Outlet } from 'react-router-dom';
import Footer from './footer.jsx';


export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
          <Outlet /> {/* Aquí se renderizan las subrutas */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
