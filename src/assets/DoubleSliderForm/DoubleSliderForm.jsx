import React, { useState, useEffect } from 'react';
import './DoubleSliderForm.css';

// Función para decodificar JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
};

// Función auxiliar para verificar si el token ha expirado
const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");
  
  if (!token || !expiry) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime > parseInt(expiry);
};

// Función para limpiar datos de autenticación
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");
  localStorage.removeItem("tokenExpiry");
};

// Función para obtener datos del usuario autenticado
const getAuthenticatedUser = () => {
  if (isTokenExpired()) {
    clearAuthData();
    return null;
  }
  
  return {
    token: localStorage.getItem("token"),
    userName: localStorage.getItem("userName"),
    role: localStorage.getItem("role")
  };
};

const DoubleSliderForm = () => {
  // State for panel animation
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  
  // Login states
  const [userName, setUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // Panel toggle handlers
  const handleRegisterClick = () => {
    setIsRightPanelActive(true);
  };
  
  const handleLoginClick = () => {
    setIsRightPanelActive(false);
  };

  // Password validation
  useEffect(() => {
    if (registerPassword) {
      // Expresión regular para validar contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\-_#])[A-Za-z\d@$!%*?&+\-_#]{8,20}$/;
      
      if (!passwordRegex.test(registerPassword)) {
        setPasswordError("La contraseña debe tener entre 8-20 caracteres e incluir mayúsculas, minúsculas, números y caracteres especiales.");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [registerPassword]);

  // Confirm password validation
  useEffect(() => {
    if (confirmPassword && registerPassword !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
    } else {
      setConfirmPasswordError("");
    }
  }, [registerPassword, confirmPassword]);

  // Login handler mejorado
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    const data = { 
      userName, 
      password: loginPassword 
    };
    
    try {
      const response = await fetch("https://backendeventhub.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Credenciales incorrectas");
      }
      
      const responseData = await response.json();
console.log("Token recibido:", responseData);

const token = responseData.token;
if (!token || !token.includes(".")) throw new Error("Token inválido");


      
      
      if (!token.includes(".")) throw new Error("Token inválido");
      
      // Decodificar token
      const decodedToken = parseJwt(token);
      console.log("Token decodificado:", decodedToken);
      
      if (!decodedToken) {
        throw new Error("No se pudo decodificar el token");
      }
      
      // Extraer información del token basado en la estructura mostrada en tu imagen
      const username = decodedToken.sub; // "user0ne"
      const userRole = decodedToken.role || ""; // "ROLE_USUARIO"
      
      // Si el rol no está directamente en 'role', intentar extraerlo del array 'roles'
      let finalRole = userRole;
      if (!finalRole && decodedToken.roles && Array.isArray(decodedToken.roles)) {
        // Buscar rol en formato "Role(id=X, nombreRol=ROLE_XXX)"
        const roleInfo = decodedToken.roles.find(role => typeof role === 'string' && role.includes("nombreRol="));
        if (roleInfo) {
          const rolMatch = roleInfo.match(/nombreRol=([^)]+)/);
          if (rolMatch && rolMatch[1]) {
            finalRole = rolMatch[1];
          }
        }
      }
      
      console.log("Usuario:", username);
      console.log("Rol:", finalRole);
      
      // Guardar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userName", username);
      localStorage.setItem("role", finalRole);
      
      // Opcional: también guardar la fecha de expiración
      if (decodedToken.exp) {
        localStorage.setItem("tokenExpiry", decodedToken.exp.toString());
      }
      
      console.log("Datos guardados en localStorage:");
      console.log("- Token:", localStorage.getItem("token"));
      console.log("- Username:", localStorage.getItem("userName"));
      console.log("- Role:", localStorage.getItem("role"));
      
      // Redirigir después del login exitoso
      window.location.href = "/EventHub";
      
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
      setLoginError(error.message);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validar contraseña antes de enviar
    if (passwordError || confirmPasswordError || registerPassword !== confirmPassword) {
      return;
    }

    setRegisterError("");
    
    // Crear el objeto de datos para la API según la estructura solicitada
    const data = { 
      userName: fullName, 
      email, 
      password: registerPassword, 
    };

    console.log("Enviando datos al backend:", JSON.stringify(data));

    try {
      const response = await fetch("https://backendeventhub.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo registrar el usuario");
      }
      
      console.log("Registro exitoso");
      
      // Limpiar formulario después del registro exitoso
      setFullName("");
      setEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
      
      // Cambiar al panel de login después del registro exitoso
      setIsRightPanelActive(false);
      
      // Mostrar mensaje de éxito
      alert("Registro exitoso. Por favor inicia sesión.");
    } catch (error) {
      console.error("Error de registro:", error.message);
      setRegisterError(error.message);
    }
  };

  // Social login handler
  const handleSocialLogin = (provider) => {
    console.log(`Iniciando sesión con ${provider}`);
    // Implementar lógica de inicio de sesión social si es necesario
  };

  return (
    <div id="webcrumbs">
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[800px] relative perspective-1000">
          <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${isRightPanelActive ? 'rotate-y-180' : ''}`}>
            
            {/* Login Side (Front) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="flex h-full">
                {/* Left Panel - Login Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="max-w-sm mx-auto w-full">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
                      <p className="text-white/70">Inicia sesión en tu cuenta</p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleLogin}>
                      {loginError && <div className="p-3 bg-red-500/30 border border-red-500/50 text-white rounded-xl text-sm">{loginError}</div>}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Nombre de usuario</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                          placeholder="Tu nombre de usuario"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Contraseña</label>
                        <input 
                          type="password" 
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-400"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <span className="ml-2 text-white/70 text-sm">Recordarme</span>
                        </label>
                        <a href="recovery-password" className="text-purple-300 hover:text-purple-200 text-sm transition-colors duration-300">¿Olvidaste tu contraseña?</a>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                      >
                        Iniciar Sesión
                      </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                      <p className="text-white/70">O inicia sesión con</p>
                      <div className="flex justify-center space-x-4 mt-3">
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("Facebook")}
                        >
                          <i className="lni lni-facebook-fill"></i>
                        </a>
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("Google")}
                        >
                          <i className="lni lni-google"></i>
                        </a>
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("LinkedIn")}
                        >
                          <i className="lni lni-linkedin-original"></i>
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-white/70">¿No tienes cuenta?</p>
                      <button 
                        className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-300 mt-1"
                        onClick={handleRegisterClick}
                      >
                        Regístrate aquí
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Right Panel - Welcome */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-white">login</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">¡Hola de nuevo!</h3>
                    <p className="text-white/80 leading-relaxed">Nos alegra verte. Inicia sesión para acceder a todas las funcionalidades de tu cuenta.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Register Side (Back) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl shadow-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 rotate-y-180">
              <div className="flex h-full">
                {/* Left Panel - Welcome */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-600/30 to-purple-600/30 backdrop-blur-sm items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-6xl text-white">person_add</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">¡Únete a nosotros!</h3>
                    <p className="text-white/80 leading-relaxed">Crea tu cuenta y descubre todas las increíbles funcionalidades que tenemos para ti.</p>
                  </div>
                </div>
                
                {/* Right Panel - Register Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="max-w-sm mx-auto w-full">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
                      <p className="text-white/70">Regístrate para comenzar</p>
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleRegister}>
                      {registerError && <div className="p-3 bg-red-500/30 border border-red-500/50 text-white rounded-xl text-sm">{registerError}</div>}
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Nombre de usuario</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                          placeholder="Tu nombre de usuario"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Correo electrónico</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                          placeholder="tu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Contraseña</label>
                        <input 
                          type="password" 
                          className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${passwordError ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300`}
                          placeholder="••••••••"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                        />
                        {passwordError && <div className="mt-1 text-red-300 text-xs">{passwordError}</div>}
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">Confirmar Contraseña</label>
                        <input 
                          type="password" 
                          className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${confirmPasswordError ? 'border-red-400' : 'border-white/20'} text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300`}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        {confirmPasswordError && <div className="mt-1 text-red-300 text-xs">{confirmPasswordError}</div>}
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-70 disabled:transform-none"
                        disabled={!!passwordError || !!confirmPasswordError}
                      >
                        Crear Cuenta
                      </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                      <p className="text-white/70">O regístrate con</p>
                      <div className="flex justify-center space-x-4 mt-3">
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("Facebook")}
                        >
                          <i className="lni lni-facebook-fill"></i>
                        </a>
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("Google")}
                        >
                          <i className="lni lni-google"></i>
                        </a>
                        <a 
                          href="#" 
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => handleSocialLogin("LinkedIn")}
                        >
                          <i className="lni lni-linkedin-original"></i>
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                      <p className="text-white/70">Ya tienes cuenta?</p>
                      <button 
                        className="text-purple-300 hover:text-purple-200 font-semibold transition-colors duration-300 mt-1"
                        onClick={handleLoginClick}
                      >
                        Inicia sesión aquí
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `
      }} />
    </div>
  );
};

export default DoubleSliderForm;