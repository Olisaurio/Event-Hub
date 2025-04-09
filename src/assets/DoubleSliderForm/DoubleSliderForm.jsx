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
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
      if (!passwordRegex.test(registerPassword)) {
        setPasswordError("Password must be 8-20 characters and include uppercase, lowercase, numbers, and special characters.");
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
      setConfirmPasswordError("Passwords don't match");
    } else {
      setConfirmPasswordError("");
    }
  }, [registerPassword, confirmPassword]);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    const data = { userName, password: loginPassword };
    
    try {
      const response = await fetch("http://localhost:8070/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Incorrect credentials");
      
      const token = await response.text();
      console.log("Token received:", token);
      
      if (!token.includes(".")) throw new Error("Invalid token");
      
      // Save token in localStorage
      localStorage.setItem("token", token);
      
      // Decode token
      const decodedToken = parseJwt(token);
      console.log("Decoded Token:", decodedToken);
      
      // Extract relevant information
      const username = decodedToken.sub;
      
      // Extract role from roles array
      let userRole = "";
      if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
        // Look for role in format "Role(id=X, nombreRol=ROLE_XXX)"
        const roleInfo = decodedToken.roles.find(role => typeof role === 'string' && role.includes("nombreRol="));
        if (roleInfo) {
          // Extract nombreRol value
          const rolMatch = roleInfo.match(/nombreRol=([^)]+)/);
          if (rolMatch && rolMatch[1]) {
            userRole = rolMatch[1];
          }
        }
      }
      
      console.log("Username:", username);
      console.log("Role:", userRole);
      
      // Save user info in localStorage
      localStorage.setItem("userName", username);
      localStorage.setItem("role", userRole);
      
      // Role-based redirection
      if (userRole === "ROLE_ADMINISTRADOR") {
        window.location.href = "/admin/home";
      } else if (userRole === "ROLE_USUARIO") {
        window.location.href = "/EventHub";
      } else {
        console.error("Unknown role:", userRole);
        setLoginError(`Unknown role: ${userRole}`);
      }
    } catch (error) {
      console.error("Request error:", error.message);
      setLoginError(error.message);
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate password before sending
    if (passwordError || confirmPasswordError || registerPassword !== confirmPassword) {
      return;
    }

    setRegisterError("");
    const data = { 
      userName: fullName, 
      email, 
      password: registerPassword, 
      role: "ROLE_USUARIO"
    };

    try {
      const response = await fetch("http://localhost:8070/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not register user");
      }
      
      console.log("Registration successful");
      window.location.href = "/EventHub";
      // Switch to login panel after successful registration
      // Clear register form
      setFullName("");
      setEmail("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Registration error:", error.message);
      setRegisterError(error.message);
    }
  };

  // Social login handler
  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic if needed
  };

  return (
    <div className="DoubleSliderForm">
    <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
      {/* Login Form */}
      <div className="form-container login-container">
        <form onSubmit={handleLogin}>
          <h1>Login here.</h1>
          {loginError && <div className="error-message">{loginError}</div>}
          <input 
            type="text" 
            placeholder="Username" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
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
              <label htmlFor="checkbox">Remember me</label>
            </div>
            <div className="pass-link">
              <a href="#">Forgot password?</a>
            </div>
          </div>
          <button type="submit">Login</button>
          <span>or use your account</span>
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
          <h1>Register here.</h1>
          {registerError && <div className="error-message">{registerError}</div>}
          <input 
            type="text" 
            placeholder="Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
            className={passwordError ? 'input-error' : ''}
          />
          {passwordError && <div className="error-message">{passwordError}</div>}
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={confirmPasswordError ? 'input-error' : ''}
          />
          {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
          <button 
            type="submit"
            disabled={!!passwordError || !!confirmPasswordError}
          >Register</button>
          <span>or use your account</span>
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
            <h1 className="title">Hello <br/> friends</h1>
            <p>If you have an account, login here and have fun</p>
            <button className="ghost" id="login" onClick={handleLoginClick}>
              Login
              <i className="lni lni-arrow-left login"></i>
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1 className="title">Start your <br/> journey now</h1>
            <p>If you don't have an account yet, join us and start your journey.</p>
            <button className="ghost" id="register" onClick={handleRegisterClick}>
              Register
              <i className="lni lni-arrow-right register"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

// Function to decode JWT
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
    console.error("Error decoding token:", error);
    return null;
  }
};

export default DoubleSliderForm;