import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../Components-styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar token y datos de usuario del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    
    // Redirigir al login
    navigate('/');
  };

  const menuItems = [
    { id: 'home', label: 'Home', path: '/EventHub' },
    { id: 'myEvents', label: 'Mis Eventos', path: '/my-events' },
    { id: 'invitations', label: 'Invitaciones', path: '/invitations' },
    { id: 'create', label: 'Crear Evento', path: '/create-event' },
    { id: 'agenda', label: 'Mi Agenda', path: '/agenda' },
  ];

  return (
    // <div className="sidebar">
    //   {menuItems.map(item => (
    //     <Link 
    //       to={item.path} 
    //       key={item.id} 
    //       className="sidebar-item-link"
    //       style={{ textDecoration: 'none', color: 'inherit' }}
    //     >
    //       <div className="sidebar-item">
    //         <span className="sidebar-icon">{item.icon}</span>
    //         <span>{item.label}</span>
    //       </div>
    //     </Link>
    //   ))}
      
    //   {/* Botón de cerrar sesión en la parte inferior */}
    //   <div className="sidebar-logout">
    //     <div 
    //       className="sidebar-item"
    //       onClick={handleLogout}
    //       style={{ cursor: 'pointer' }}
    //     >
    //       <span className="sidebar-icon">🚪</span>
    //       <span>Cerrar Sesión</span>
    //     </div>
    //   </div>
    // </div>

    <aside className="w-full md:w-64 bg-white shadow-sm md:h-screen md:sticky top-0 border-b md:border-b-0 md:border-r border-gray-200 md:flex">
            <nav className="p-4 md:p-6 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal">
              <ul className="flex md:flex-col md:space-y-2 space-x-2 md:space-x-0">
                <li>
                  <a
                    href="/EventHub"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors duration-200 min-w-[120px] md:min-w-0"
                  >
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-medium">Home</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 min-w-[120px] md:min-w-0"
                  >
                    <span className="material-symbols-outlined">event</span>
                    <span className="font-medium">Mis Eventos</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 min-w-[120px] md:min-w-0"
                  >
                    <span className="material-symbols-outlined">mail</span>
                    <span className="font-medium">Invitaciones</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/create-event"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 min-w-[120px] md:min-w-0"
                  >
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                    <span className="font-medium">Crear Evento</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 min-w-[120px] md:min-w-0"
                  >
                    <span className="material-symbols-outlined">
                      calendar_month
                    </span>
                    <span className="font-medium">Agenda</span>
                  </a>
                </li>
              </ul>
              <div className="md:mt-auto md:pt-8 hidden md:block">
                <a
                  href="#"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-medium">Cerrar Sesión</span>
                </a>
              </div>
            </nav>
          </aside>
  );
};

export default Sidebar;
