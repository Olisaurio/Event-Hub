import React, { useState } from 'react';
import axios from 'axios';

const InvitationComponent = ({ eventId, onInvitationSent, showToast }) => {
  const [invitationType, setInvitationType] = useState('individual'); // 'individual' o 'bulk'
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState(['']);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Agregar campo de email para invitaciones masivas
  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  // Remover campo de email
  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  // Actualizar email en posición específica
  const updateEmail = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enviar invitación individual
  const sendIndividualInvitation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('No hay sesión activa', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Por favor ingresa un email válido', 'error');
        return;
      }

      setIsLoading(true);

      const response = await axios.post(
        'https://backendeventhub.onrender.com/api/attendee-invitations/invite',
        {
          eventoId: eventId,
          emailInvitado: email,
          mensaje: message || '¡Te invito a mi evento! Será una gran experiencia.'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast('Invitación enviada correctamente', 'success');
      setEmail('');
      setMessage('');
      
      if (onInvitationSent) {
        onInvitationSent(response.data);
      }

    } catch (error) {
      console.error('Error enviando invitación:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar la invitación';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar invitaciones masivas
  const sendBulkInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('No hay sesión activa', 'error');
        return;
      }

      // Filtrar emails válidos y no vacíos
      const validEmails = emails.filter(email => email.trim() && isValidEmail(email.trim()));
      
      if (validEmails.length === 0) {
        showToast('Por favor ingresa al menos un email válido', 'error');
        return;
      }

      setIsLoading(true);

      const response = await axios.post(
        'https://backendeventhub.onrender.com/api/attendee-invitations/invite-bulk',
        {
          eventoId: eventId,
          emails: validEmails,
          mensaje: message || 'Invitación especial para nuestro evento exclusivo'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast(`${response.data.count} invitaciones enviadas correctamente`, 'success');
      setEmails(['']);
      setMessage('');
      
      if (onInvitationSent) {
        onInvitationSent(response.data);
      }

    } catch (error) {
      console.error('Error enviando invitaciones:', error);
      const errorMessage = error.response?.data?.message || 'Error al enviar las invitaciones';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (invitationType === 'individual') {
      sendIndividualInvitation();
    } else {
      sendBulkInvitations();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <span className="material-symbols-outlined mr-2 text-blue-600">mail</span>
        Enviar Invitaciones
      </h3>

      {/* Toggle para tipo de invitación */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setInvitationType('individual')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            invitationType === 'individual'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Invitación Individual
        </button>
        <button
          type="button"
          onClick={() => setInvitationType('bulk')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            invitationType === 'bulk'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Invitaciones Masivas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos de email */}
        {invitationType === 'individual' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del invitado
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emails de los invitados
            </label>
            {emails.map((emailValue, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmailField(index)}
                    className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEmailField}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
            >
              <span className="material-symbols-outlined mr-1">add</span>
              Agregar otro email
            </button>
          </div>
        )}

        {/* Campo de mensaje */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje personalizado (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje personalizado para la invitación..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined mr-2">send</span>
              {invitationType === 'individual' ? 'Enviar Invitación' : 'Enviar Invitaciones'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InvitationComponent;

