import { useState } from "react";
import { useNavigate } from "react-router-dom";


export const Register = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        const data = { userName, email, password, role: "ROLE_USUARIO" };

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
            navigate("/Home"); 

        } catch (error) {
            console.error("Error en el registro:", error.message);
            setError(error.message);
        }
    };

    return (
        <div>
            <h1>Registro</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                />
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};
