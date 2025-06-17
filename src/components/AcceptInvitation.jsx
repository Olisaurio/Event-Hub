import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AcceptInvitation = () => {
  const { token } = useParams(); // Token de la invitación desde la URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Obtener información de la invitación
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        setIsLoading(true);
        
        // Aquí podrías hacer una llamada para obtener detalles de la invitación
        // Por ahora, simularemos que tenemos la información básica
        const mockInvitation = {
          id: "inv_abc123",
          evento: {
            id: "evento123",
            title: "Evento de Networking Privado",
            start: "2025-06-15T18:00:00Z",
            description: "Un evento exclusivo para networking profesional"
          },
          invitadoPor: {
            username: "organizador_user",
            email: "organizador@ejemplo.com"
          },
          estado: "pendiente",
          fechaExpiracion: "2025-06-11T21:45:00Z",
          mensaje: "¡Te invito a mi evento privado de networking! Será una gran oportunidad para conocer gente nueva."
        };
        
        setInvitation(mockInvitation);
      } catch (err) {
        console.error('Error obteniendo detalles de invitación:', err);
        setError('No se pudo cargar la información de la invitación');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvitationDetails();
    } else {
      setError('Token de invitación no válido');
      setIsLoading(false);
    }
  }, [token]);

  // Aceptar invitación
  const handleAcceptInvitation = async () => {
    try {
      setIsProcessing(true);
      
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        setError('Debes iniciar sesión para aceptar la invitación');
        return;
      }

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

      setActionResult({
        type: 'success',
        message: response.data.message || 'Invitación aceptada correctamente',
        data: response.data
      });

      // Redirigir al evento después de 3 segundos
      setTimeout(() => {
        navigate(`/event/${invitation.evento.id}`);
      }, 3000);

    } catch (error) {
      console.error('Error aceptando invitación:', error);
      setActionResult({
        type: 'error',
        message: error.response?.data?.message || 'Error al aceptar la invitación'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Rechazar invitación
  const handleRejectInvitation = async () => {
    try {
      setIsProcessing(true);
      
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        setError('Debes iniciar sesión para rechazar la invitación');
        return;
      }

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

      setActionResult({
        type: 'success',
        message: response.data.message || 'Invitación rechazada',
        data: response.data
      });

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        navigate('/EventHub');
      }, 3000);

    } catch (error) {
      console.error('Error rechazando invitación:', error);
      setActionResult({
        type: 'error',
        message: error.response?.data?.message || 'Error al rechazar la invitación'
      });
    } finally {
      setIsProcessing(false);
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
  const isExpired = () => {
    if (!invitation?.fechaExpiracion) return false;
    return new Date() > new Date(invitation.fechaExpiracion);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Cargando invitación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mx-4">
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
    );
  }

  if (actionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              actionResult.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`material-symbols-outlined text-2xl ${
                actionResult.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {actionResult.type === 'success' ? 'check_circle' : 'error'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {actionResult.type === 'success' ? '¡Éxito!' : 'Error'}
            </h2>
            <p className="text-gray-600 mb-6">{actionResult.message}</p>
            {actionResult.type === 'success' && (
              <p className="text-sm text-gray-500">Redirigiendo automáticamente...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center mb-4">
              <span className="material-symbols-outlined text-3xl mr-3">mail</span>
              <h1 className="text-2xl font-bold">Invitación a Evento</h1>
            </div>
            <p className="text-blue-100">Has sido invitado a un evento privado</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Event Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {invitation.evento.title}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <span className="material-symbols-outlined mr-2">schedule</span>
                {formatDate(invitation.evento.start)}
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <span className="material-symbols-outlined mr-2">person</span>
                Invitado por: {invitation.invitadoPor.username}
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Mensaje del organizador:</h3>
              <p className="text-gray-600 italic">"{invitation.mensaje}"</p>
            </div>

            {/* Expiration Warning */}
            {isExpired() ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-red-500 mr-2">warning</span>
                  <span className="text-red-700 font-medium">Esta invitación ha expirado</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Expiró el {formatDate(invitation.fechaExpiracion)}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-yellow-500 mr-2">schedule</span>
                  <span className="text-yellow-700 font-medium">Invitación válida hasta:</span>
                </div>
                <p className="text-yellow-600 text-sm mt-1">
                  {formatDate(invitation.fechaExpiracion)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!isExpired() && (
              <div className="flex gap-4">
                <button
                  onClick={handleAcceptInvitation}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">check</span>
                      Aceptar Invitación
                    </>
                  )}
                </button>

                <button
                  onClick={handleRejectInvitation}
                  disabled={isProcessing}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">close</span>
                      Rechazar Invitación
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Login prompt if not authenticated */}
            {!localStorage.getItem('token') && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-blue-500 mr-2">info</span>
                  <span className="text-blue-700 font-medium">Inicia sesión para responder</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Debes iniciar sesión en tu cuenta para aceptar o rechazar esta invitación.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;

