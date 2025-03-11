import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Register-styles.css";

export const Register = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const navigate = useNavigate();

    // Validación de contraseña
    useEffect(() => {
        if (password) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
            if (!passwordRegex.test(password)) {
                setPasswordError("La contraseña debe tener entre 8 y 12 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.");
            } else {
                setPasswordError("");
            }
        } else {
            setPasswordError("");
        }
    }, [password]);

    // Validación de coincidencia de contraseñas
    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError("Las contraseñas no coinciden");
        } else {
            setConfirmPasswordError("");
        }
    }, [password, confirmPassword]);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validar contraseña antes de enviar
        if (passwordError || confirmPasswordError || password !== confirmPassword) {
            return;
        }

        setError("");
        const data = { 
            userName: fullName, 
            email, 
            password, 
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
                throw new Error(errorData.message || "No se pudo registrar el usuario");
            }
            
            console.log("Registro exitoso");
            navigate("/EventHub");
        } catch (error) {
            console.error("Error en el registro:", error.message);
            setError(error.message);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Iniciando sesión con ${provider}`);
        // Implementar lógica de inicio de sesión social
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h2 className="register-title">Create an account</h2>
                
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full name</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Smith"
                            required
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.com"
                            required
                            className="form-input"
                        />
                    </div>
                    
                    <div className="password-container">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="(8+ characters)"
                                required
                                className={`form-input ${passwordError ? 'input-error' : ''}`}
                            />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="(8+ characters)"
                                required
                                className={`form-input ${confirmPasswordError ? 'input-error' : ''}`}
                            />
                            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={!!passwordError || !!confirmPasswordError}
                    >
                        Register
                    </button>
                    <p>Already have an account? <a href="/">Login</a></p>
                </form>
                
                <div className="social-login">
                    <p>Or connect with</p>
                    <div className="social-buttons">
                        <button 
                            onClick={() => handleSocialLogin("Google")}
                            className="social-button google-button"
                        >
                            Google
                        </button>
                        <button 
                            onClick={() => handleSocialLogin("Facebook")}
                            className="social-button facebook-button"
                        >
                            Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};