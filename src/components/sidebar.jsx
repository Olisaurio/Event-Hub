import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../Components-styles/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-100";
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar token y datos de usuario del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");

    // Redirigir al login
    navigate("/");
  };

  return (
    <aside className="w-full md:w-64 bg-white shadow-sm md:h-screen md:sticky top-0 border-b md:border-b-0 md:border-r border-gray-200 md:flex">
      <nav className="p-4 md:p-6 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal">
        <ul className="flex md:flex-col md:space-y-2 space-x-2 md:space-x-0">
          <li>
            <Link
              to="/EventHub"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/EventHub")}`}
            >
              <span className="material-symbols-outlined">home</span>
              <span className="font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/my-events"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/my-events")}`}
            >
              <span className="material-symbols-outlined">event</span>
              <span className="font-medium">Mis Eventos</span>
            </Link>
          </li>
          <li>
            <Link
              to="/assistance"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/assistance")}`}
            >
              <span className="material-symbols-outlined">token</span>
              <span className="font-medium">Participo</span>
            </Link>
          </li>
          <li>
            <Link
              to="/invitations"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/invitations")}`}
            >
              <span className="material-symbols-outlined">mail</span>
              <span className="font-medium">Invitaciones</span>
            </Link>
          </li>
          <li>
            <Link
              to="/sub-creator"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/sub-creator")}`}
            >
              <span className="material-symbols-outlined">filter_list</span>
              <span className="font-medium">SubCreador</span>
            </Link>
          </li>
          <li>
            <Link
              to="/create-event"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/create-event")}`}
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-medium">Crear Evento</span>
            </Link>
          </li>
          <li>
            <Link
              to="/agenda"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 min-w-[120px] md:min-w-0 ${isActive("/agenda")}`}
            >
              <span className="material-symbols-outlined">calendar_month</span>
              <span className="font-medium">Agenda</span>
            </Link>
          </li>
        </ul>
        <div className="md:mt-auto md:pt-8 hidden md:block">
          <div
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Cerrar Sesión</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;