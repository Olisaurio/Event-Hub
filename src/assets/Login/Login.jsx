import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../../Styles/Login-styles.css";
 // Corregido: import correcto

export const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
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
            localStorage.setItem("token", token);
            const decodedToken = parseJwt(token);
            console.log("Decoded Token:", decodedToken);
            const { sub: username, role } = decodedToken;
            localStorage.setItem("userName", username);
            localStorage.setItem("role", role);
            console.log(role);
            if (role === "ROLE_ADMINISTRADOR") {
                navigate("/admin/home");
            } else if (role === "ROLE_USUARIO") {
                navigate("/EventHub");  
            } else {
                console.error("Rol desconocido:", role);
                alert("Rol desconocido:", role);
            }
        } catch (error) {
            console.error("Error en la solicitud:", error.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">Iniciar sesión</h1>
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="userName">Nombre de usuario</label>
                        <input
                            id="userName"
                            type="text"
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Username"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="form-input"
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
        return JSON.parse(atob(base64));
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};