import React, { useState, useEffect } from 'react';
import './DoubleSliderForm.css';

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

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Crear el objeto de datos para la API según la estructura solicitada
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
      
      const token = await response.text();
      console.log("Token recibido:", token);
      
      if (!token.includes(".")) throw new Error("Token inválido");
      
      // Guardar token en localStorage
      localStorage.setItem("token", token);
      
      // Decodificar token
      const decodedToken = parseJwt(token);
      console.log("Token decodificado:", decodedToken);
      
      // Extraer información relevante
      const username = decodedToken.sub;
      
      // Extraer rol del array de roles
      let userRole = "";
      if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
        // Buscar rol en formato "Role(id=X, nombreRol=ROLE_XXX)"
        const roleInfo = decodedToken.roles.find(role => typeof role === 'string' && role.includes("nombreRol="));
        if (roleInfo) {
          // Extraer valor de nombreRol
          const rolMatch = roleInfo.match(/nombreRol=([^)]+)/);
          if (rolMatch && rolMatch[1]) {
            userRole = rolMatch[1];
          }
        }
      }
      
      console.log("Usuario:", username);
      console.log("Rol:", userRole);
      console.log("Token:", token);
      
      // Guardar info de usuario en localStorage
      localStorage.setItem("userName", username);
      localStorage.setItem("role", userRole);
      localStorage.setItem("role", userRole);


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
    <div className="DoubleSliderForm">
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        {/* Login Form */}
        <div className="form-container login-container">
          <form onSubmit={handleLogin}>
            <h1>Iniciar sesión</h1>
            {loginError && <div className="error-message">{loginError}</div>}
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <div className="content">
              <div className="checkbox">
                <input 
                  type="checkbox" 
                  name="checkbox" 
                  id="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="checkbox">Recordarme</label>
              </div>
              <div className="pass-link">
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            <button type="submit">Iniciar sesión</button>
            <span>o usa tu cuenta</span>
            <div className="social-container">
              <a href="#" className="social" onClick={() => handleSocialLogin("Facebook")}>
                <i className="lni lni-facebook-fill"></i>
              </a>
              <a href="#" className="social" onClick={() => handleSocialLogin("Google")}>
                <i className="lni lni-google"></i>
              </a>
              <a href="#" className="social" onClick={() => handleSocialLogin("LinkedIn")}>
                <i className="lni lni-linkedin-original"></i>
              </a>
            </div>
          </form>
        </div>
        
        {/* Register Form */}
        <div className="form-container register-container">
          <form onSubmit={handleRegister}>
            <h1>Regístrate aquí</h1>
            {registerError && <div className="error-message">{registerError}</div>}
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              className={passwordError ? 'input-error' : ''}
            />
            {passwordError && <div className="error-message">{passwordError}</div>}
            <input 
              type="password" 
              placeholder="Confirmar contraseña" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={confirmPasswordError ? 'input-error' : ''}
            />
            {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
            <button 
              type="submit"
              disabled={!!passwordError || !!confirmPasswordError}
            >Registrarse</button>
            <span>o usa tu cuenta</span>
            <div className="social-container">
              <a href="#" className="social" onClick={() => handleSocialLogin("Facebook")}>
                <i className="lni lni-facebook-fill"></i>
              </a>
              <a href="#" className="social" onClick={() => handleSocialLogin("Google")}>
                <i className="lni lni-google"></i>
              </a>
              <a href="#" className="social" onClick={() => handleSocialLogin("LinkedIn")}>
                <i className="lni lni-linkedin-original"></i>
              </a>
            </div>
          </form>
        </div>
        
        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="title">Hola <br/> amigos</h1>
              <p>Si tienes una cuenta, inicia sesión aquí y diviértete</p>
              <button className="ghost" id="login" onClick={handleLoginClick}>
                Iniciar sesión
                <i className="lni lni-arrow-left login"></i>
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="title">Comienza tu <br/> viaje ahora</h1>
              <p>Si aún no tienes una cuenta, únete a nosotros y comienza tu viaje.</p>
              <button className="ghost" id="register" onClick={handleRegisterClick}>
                Registrarse
                <i className="lni lni-arrow-right register"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default DoubleSliderForm;