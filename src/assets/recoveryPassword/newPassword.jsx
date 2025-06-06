import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Función para decodificar JWT manualmente sin dependencias externas
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    throw new Error('Token inválido');
  }
};

const NewPassword = () => {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordError, setPasswordError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Capturar el token de la URL al cargar el componente
  useEffect(() => {
    // Extraer el token de los parámetros de consulta
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      
      // Intentar decodificar el token para obtener el nombre de usuario
      try {
        const decodedToken = decodeJWT(tokenFromUrl);
        
        // Verificar que el token es de tipo recovery
        if (decodedToken.type !== 'recovery') {
          setTokenValid(false);
          setMessage({
            type: 'error',
            text: 'El token no es válido para restablecer la contraseña.'
          });
          return;
        }
        
        // Verificar si el token ha expirado
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          setTokenValid(false);
          setMessage({
            type: 'error',
            text: 'El token ha expirado. Por favor, solicita un nuevo enlace de recuperación.'
          });
          return;
        }
        
        // Extraer el nombre de usuario del token
        setUsername(decodedToken.sub);
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        setTokenValid(false);
        setMessage({
          type: 'error',
          text: 'El token proporcionado no es válido.'
        });
      }
    } else {
      setTokenValid(false);
      setMessage({
        type: 'error',
        text: 'No se proporcionó un token de recuperación.'
      });
    }
  }, [location]);

  // Validar la contraseña
  const validatePassword = (password) => {
    // Mínimo 8 caracteres, al menos una letra mayúscula, una minúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!password) {
      return 'La contraseña es obligatoria.';
    }
    
    if (!passwordRegex.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial.';
    }
    
    return '';
  };

  // Manejar cambios en el campo de contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordError(validatePassword(value));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Las contraseñas no coinciden.'
      });
      return;
    }
    
    // Validar la contraseña
    const error = validatePassword(newPassword);
    if (error) {
      setPasswordError(error);
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://backendeventhub.onrender.com/api/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Contraseña restablecida con éxito. Serás redirigido a la página de inicio de sesión.'
        });
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.'
        });
      }
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      setMessage({
        type: 'error',
        text: 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="webcrumbs">
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4">
        <div className="text-center mb-8 w-full max-w-md mx-auto p-6 rounded-lg shadow-lg bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-white-500 to-violet-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">
              lock_reset
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Restablecer contraseña
          </h2>
          
          {username && tokenValid && (
            <p className="text-white text-sm mb-4">
              Usuario recuperado: <span className="font-medium text-purple-200">{username}</span>
            </p>
          )}

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-white hover:text-white text-sm font-medium hover:underline transition-colors duration-200"
            >
              ¿Recordaste tu contraseña? Iniciar Sesión
            </a>
          </div>

          {/* Message Display Area */}
          {message.text && (
            <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`material-symbols-outlined mt-0.5 ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <div className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  <p className="font-medium mb-1">
                    {message.type === 'success' ? '¡Éxito!' : 'Error'}
                  </p>
                  <p>{message.text}</p>
                </div>
              </div>
            </div>
          )}

          {tokenValid && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-black mt-1">
                  security
                </span>
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">Información de Seguridad</p>
                  <p>
                    Por tu seguridad, crea una contraseña fuerte con al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tokenValid ? (
            <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      required
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-purple-50/70 backdrop-blur-sm"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={handlePasswordChange}
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                      password
                    </span>
                  </div>
                </div>
                
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-purple-50/70 backdrop-blur-sm"
                      placeholder="Confirmar contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                      password
                    </span>
                  </div>
                </div>
              </div>
              
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-700">{passwordError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !!passwordError}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-75 disabled:transform-none disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <span>Procesando...</span>
                      <span className="material-symbols-outlined animate-spin">
                        hourglass_top
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Restablecer Contraseña</span>
                      <span className="material-symbols-outlined">
                        lock_reset
                      </span>
                    </>
                  )}
                </span>
              </button>
            </form>
          ) : (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <button
                onClick={() => navigate('/recovery-password')}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Solicitar nuevo enlace</span>
                  <span className="material-symbols-outlined">
                    refresh
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
