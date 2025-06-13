import React, { useState } from 'react';
import axios from 'axios';

const EventRegistration = ({ eventId, onRegistrationSuccess, showToast }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  // Función para inscribirse al evento
  const handleEventRegistration = async (tipoInscripcion = "evento_principal") => {
    try {
      setIsRegistering(true);
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("No hay sesión activa. Inicia sesión para inscribirte.", "error");
        throw new Error("No hay token de autenticación");
      }

      const response = await axios.post(
        "https://backendeventhub.onrender.com/api/inscriptions/register",
        {
          eventoId: eventId,
          tipoInscripcion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Inscripción exitosa:", response.data);
      
      const successMessage = response.data.message || "Te has inscrito exitosamente al evento";
      showToast(successMessage, "success");
      
      setRegistrationResult({
        success: true,
        data: response.data,
        message: successMessage,
      });

      // Llamar callback si existe
      if (onRegistrationSuccess) {
        onRegistrationSuccess(response.data);
      }

      return {
        success: true,
        data: response.data,
        message: successMessage,
      };
    } catch (error) {
      console.error("Error en la inscripción:", error);

      let errorMessage = "Error al inscribirse al evento";

      if (error.response) {
        errorMessage = error.response.data?.message || "Error al inscribirse";

        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || "Datos de inscripción inválidos";
            break;
          case 401:
            errorMessage = "Sesión expirada. Inicia sesión nuevamente";
            break;
          case 403:
            errorMessage = "No tienes permisos para inscribirte a este evento";
            break;
          case 404:
            errorMessage = "El evento no existe";
            break;
          case 409:
            errorMessage = "Ya estás inscrito en este evento";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          default:
            errorMessage = error.response.data?.message || "Error al inscribirse";
        }
      } else if (error.request) {
        errorMessage = "Error de conexión. Verifica tu internet";
      }

      showToast(errorMessage, "error");
      
      setRegistrationResult({
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-50">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="material-symbols-outlined mr-2 text-blue-500">confirmation_number</span>
        Inscripción al Evento
      </h3>
      
      {registrationResult?.success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-green-500 mr-2">check_circle</span>
            <div>
              <h4 className="font-medium text-green-800">¡Inscripción Exitosa!</h4>
              <p className="text-green-600 text-sm mt-1">{registrationResult.message}</p>
            </div>
          </div>
        </div>
      ) : registrationResult?.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-red-500 mr-2">error</span>
            <div>
              <h4 className="font-medium text-red-800">Error en la Inscripción</h4>
              <p className="text-red-600 text-sm mt-1">{registrationResult.error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Confirma tu inscripción a este evento. Una vez inscrito, recibirás todas las actualizaciones y podrás participar.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="material-symbols-outlined text-blue-500 mr-2 mt-0.5">info</span>
              <div>
                <h4 className="font-medium text-blue-800">Información de Inscripción</h4>
                <ul className="text-blue-600 text-sm mt-1 space-y-1">
                  <li>• Tu inscripción será confirmada inmediatamente</li>
                  <li>• Recibirás notificaciones sobre el evento</li>
                  <li>• Podrás acceder a información exclusiva para asistentes</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleEventRegistration()}
            disabled={isRegistering}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg text-center border-0 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:from-blue-600 hover:to-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isRegistering ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando Inscripción...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2">person_add</span>
                Inscribirse al Evento
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventRegistration;

