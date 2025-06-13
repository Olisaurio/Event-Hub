import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyInvitations = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingInvitation, setProcessingInvitation] = useState(null);
  const [toast, setToast] = useState(null);

  // Función para mostrar toast
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cargar invitaciones pendientes
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Debes iniciar sesión para ver tus invitaciones');
          return;
        }

        const response = await axios.get(
          'https://backendeventhub.onrender.com/api/attendee-invitations/my-pending',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setInvitations(response.data.data || []);
      } catch (err) {
        console.error('Error cargando invitaciones:', err);
        setError(err.response?.data?.message || 'Error al cargar las invitaciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingInvitations();
  }, []);

  // Aceptar invitación directamente desde la lista
  const handleAcceptInvitation = async (invitationId, token) => {
    try {
      setProcessingInvitation(invitationId);
      
      const userToken = localStorage.getItem('token');
      const response = await axios.post(
        `https://backendeventhub.onrender.com/api/attendee-invitations/accept/${token}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast('Invitación aceptada correctamente', 'success');
      
      // Remover la invitación de la lista
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
    } catch (error) {
      console.error('Error aceptando invitación:', error);
      showToast(error.response?.data?.message || 'Error al aceptar la invitación', 'error');
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Rechazar invitación directamente desde la lista
  const handleRejectInvitation = async (invitationId, token) => {
    try {
      setProcessingInvitation(invitationId);
      
      const userToken = localStorage.getItem('token');
      const response = await axios.post(
        `https://backendeventhub.onrender.com/api/attendee-invitations/reject/${token}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast('Invitación rechazada', 'success');
      
      // Remover la invitación de la lista
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
    } catch (error) {
      console.error('Error rechazando invitación:', error);
      showToast(error.response?.data?.message || 'Error al rechazar la invitación', 'error');
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha no válida';
    }
  };

  // Verificar si la invitación ha expirado
  const isExpired = (fechaExpiracion) => {
    return new Date() > new Date(fechaExpiracion);
  };

  // Componente Toast
  const Toast = ({ message, type }) => (
    <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 text-white font-medium ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`}>
      {message}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Cargando invitaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/EventHub')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 text-white">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-3xl mr-3">mail</span>
              <div>
                <h1 className="text-2xl font-bold">Mis Invitaciones</h1>
                <p className="text-purple-100">Gestiona las invitaciones a eventos que has recibido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invitations List */}
        {invitations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-2xl">mail_outline</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No tienes invitaciones pendientes</h2>
              <p className="text-gray-600 mb-6">Cuando recibas invitaciones a eventos privados, aparecerán aquí.</p>
              <button
                onClick={() => navigate('/EventHub')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Explorar Eventos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Event Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="material-symbols-outlined text-white">event</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {invitation.evento.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <span className="material-symbols-outlined text-xs mr-1">schedule</span>
                            {formatDate(invitation.evento.start)}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <span className="material-symbols-outlined text-xs mr-1">person</span>
                            Invitado por: {invitation.invitadoPor.username}
                          </div>
                          
                          {/* Message */}
                          {invitation.mensaje && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                              <p className="text-gray-700 text-sm italic">"{invitation.mensaje}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col lg:flex-row gap-3 lg:ml-6">
                      {/* Expiration Status */}
                      <div className="text-center lg:text-right mb-3 lg:mb-0">
                        {isExpired(invitation.fechaExpiracion) ? (
                          <div className="text-red-500 text-sm font-medium">
                            <span className="material-symbols-outlined text-xs mr-1">warning</span>
                            Expirada
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            <div>Expira el:</div>
                            <div className="font-medium">{formatDate(invitation.fechaExpiracion)}</div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {!isExpired(invitation.fechaExpiracion) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.token)}
                            disabled={processingInvitation === invitation.id}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {processingInvitation === invitation.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                <span className="hidden sm:inline">Procesando...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm mr-1">check</span>
                                <span className="hidden sm:inline">Aceptar</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleRejectInvitation(invitation.id, invitation.token)}
                            disabled={processingInvitation === invitation.id}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {processingInvitation === invitation.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                <span className="hidden sm:inline">Procesando...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm mr-1">close</span>
                                <span className="hidden sm:inline">Rechazar</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => navigate(`/event/${invitation.evento.id}`)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                          >
                            <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                            <span className="hidden sm:inline">Ver Evento</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/EventHub')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyInvitations;

