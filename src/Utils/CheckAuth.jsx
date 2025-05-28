import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckAuth.css';

/**
 * Hook personalizado para verificar la autenticación del usuario
 * Valida si el token está vigente haciendo una petición a la API
 * Si el token no es válido, muestra un mensaje y redirecciona al login
 */
const useCheckAuth = () => {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const validateToken = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Si no hay token, redirigir inmediatamente
      if (!token) {
        redirectToLogin('No hay sesión activa. Por favor inicie sesión.');
        return;
      }

      // Hacer la petición a la API para validar el token
      const response = await fetch('https://backendeventhub.onrender.com/auth/check-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include' // Incluir cookies si las hay
      });

      // Si la respuesta no es exitosa, el token no es válido
      if (!response.ok) {
        console.error('Error de autenticación:', response.status, response.statusText);
        redirectToLogin('Su sesión ha caducado. Por favor inicie sesión nuevamente.');
      } else {
        console.log('Autenticación exitosa');
      }
    } catch (error) {
      console.error('Error al validar el token:', error);
      redirectToLogin('Error al validar su sesión. Por favor inicie sesión nuevamente.');
    }
  };

  const redirectToLogin = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    
    // Después de 3 segundos, redirigir al login
    setTimeout(() => {
      localStorage.removeItem('token'); // Eliminar el token caducado
      navigate('/'); // Redirigir a la página de login (ruta raíz)
    }, 3000);
  };

  // Componente para mostrar el mensaje emergente
  const AuthMessage = () => {
    if (!showMessage) return null;
    
    return (
      <div className="auth-message-overlay">
        <div className="auth-message-container">
          <p>{message}</p>
        </div>
      </div>
    );
  };

  return { validateToken, AuthMessage };
};

/**
 * Componente de orden superior (HOC) para proteger rutas
 * @param {Component} WrappedComponent - Componente a proteger
 * @returns {Component} - Componente protegido con validación de autenticación
 */
export const withCheckAuth = (WrappedComponent) => {
  return (props) => {
    const { validateToken, AuthMessage } = useCheckAuth();
    
    useEffect(() => {
      validateToken();
    }, []);

    return (
      <>
        <AuthMessage />
        <WrappedComponent {...props} />
      </>
    );
  };
};

export default useCheckAuth;
