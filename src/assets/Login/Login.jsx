import { useState } from "react";
import { useNavigate } from "react";  // 👈 Para redirigir después del login

export const Login = () => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate;

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

            const token = await response.text(); // 🔹 Recibimos el token en texto
            console.log("Token recibido:", token);

            if (!token.includes(".")) throw new Error("Token inválido");

            localStorage.setItem("token", token); // 🔹 Guardamos el token en localStorage

            // 🔹 Decodificamos el token para obtener el rol
            const decodedToken = parseJwt(token);
            console.log("Decoded Token:", decodedToken);

            const { sub: username, role } = decodedToken; // 🔹 `sub` es el username en JWT
            localStorage.setItem("userName", username);
            localStorage.setItem("role", role);

            console.log(role);

            // 🔹 Redirigir según el rol
            if (role === "ROLE_ADMINISTRADOR") {
                navigate("/admin/home");
            } else if (role === "ROLE_USUARIO") {
                navigate("/home");
            } else {
                console.error("Rol desconocido:", role);
            }

        } catch (error) {
            console.error("Error en la solicitud:", error.message);
        }
    };

    return (
        <div className="form-login">
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

// 🔹 Función para decodificar el JWT
const parseJwt = (token) => {
    try {
        const base64Url = token.split(".")[1]; // Extraemos la parte del payload
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Reemplazamos caracteres para compatibilidad
        return JSON.parse(atob(base64)); // Decodificamos el JSON
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return null;
    }
};
