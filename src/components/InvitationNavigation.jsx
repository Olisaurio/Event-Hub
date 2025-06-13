import React from 'react';
import { useNavigate } from 'react-router-dom';

const InvitationNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="material-symbols-outlined mr-2 text-purple-500">mail</span>
        Gestión de Invitaciones
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/my-invitations')}
          className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <span className="material-symbols-outlined mr-2 text-sm">inbox</span>
          Ver Mis Invitaciones
        </button>
        
        <div className="flex items-center text-gray-600 text-sm">
          <span className="material-symbols-outlined mr-1 text-xs">info</span>
          Gestiona las invitaciones que has recibido
        </div>
      </div>
    </div>
  );
};

export default InvitationNavigation;

