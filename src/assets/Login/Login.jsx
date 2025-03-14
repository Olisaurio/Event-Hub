import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../Styles/Login-styles.css";

export const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        const data = { userName, password };
        try {
            const response = await fetch("http://localhost:8070/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Credenciales incorrectas");
            const token = await response.text();
            console.log("Token recibido:", token);
            if (!token.includes(".")) throw new Error("Token inválido");
            
            // Guardar el token en localStorage
            localStorage.setItem("token", token);
            
            // Decodificar el token
            const decodedToken = parseJwt(token);
            console.log("Decoded Token:", decodedToken);
            
            // Extraer información relevante
            const username = decodedToken.sub;
            
            // Extraer el rol del array de roles
            let userRole = "";
            if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
                // Buscar el rol en el formato "Role(id=X, nombreRol=ROLE_XXX)"
                const roleInfo = decodedToken.roles.find(role => typeof role === 'string' && role.includes("nombreRol="));
                if (roleInfo) {
                    // Extraer el valor de nombreRol
                    const rolMatch = roleInfo.match(/nombreRol=([^)]+)/);
                    if (rolMatch && rolMatch[1]) {
                        userRole = rolMatch[1];
                    }
                }
            }
            
            console.log("Username:", username);
            console.log("Role:", userRole);
            
            // Guardar información del usuario en localStorage
            localStorage.setItem("userName", username);
            localStorage.setItem("role", userRole);
            
            // Redirección basada en el rol
            if (userRole === "ROLE_ADMINISTRADOR") {
                navigate("/admin/home");
            } else if (userRole === "ROLE_USUARIO") {
                navigate("/EventHub");  
            } else {
                console.error("Rol desconocido:", userRole);
                setError(`Rol desconocido: ${userRole}`);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error.message);
            setError(error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">Iniciar sesión</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="userName">Nombre de usuario</label>
                        <input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Username"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="form-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">Iniciar sesión</button>
                </form>
                <div className="auth-divider">
                    <span>O conectar con</span>
                </div>
                <div className="social-login">
                    <button className="social-button google">Google</button>
                    <button className="social-button facebook">Facebook</button>
                </div>
            </div>
        </div>
    );
};

// Función para decodificar el JWT
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
        console.error("Error al decodificar el token:", error);
        return null;
    }
};