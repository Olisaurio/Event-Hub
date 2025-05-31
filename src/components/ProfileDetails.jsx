import React, { useState } from "react";
import './ProfileDetails.css';

const MiPerfil = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState("santi RH");
  const [direccion, setDireccion] = useState("123 Main St, San Francisco, CA");
  const [telefono, setTelefono] = useState("(555) 123-4567");
  const [email, setEmail] = useState("helen.zhou@acme.co");
  const [redes, setRedes] = useState("@helenzhou");
  const [descripcion, setDescripcion] = useState("Gerente de Producto con más de 5 años de experiencia");
  const [foto, setFoto] = useState("https://i.imgur.com/yXOvdOSs.jpg"); // o la imagen que tengas por defecto

  const [notifCorreo, setNotifCorreo] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  const handleGuardar = () => {
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFoto(imageUrl);
    }
  };

  return (
    <div className="mi-perfil">
      <h2>Mi perfil</h2>
      <div className="perfil-container">
        <div className="perfil-header">
          <img src={foto} alt="Foto de perfil" className="foto-perfil" />
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="input-foto"
            />
          )}
          <div>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            ) : (
              <>
                <h3>{nombre}</h3>
                <p>{email}</p>
              </>
            )}
            <p>Partícipe</p>
          </div>
        </div>

        <button onClick={() => isEditing ? handleGuardar() : setIsEditing(true)}>
          {isEditing ? "Guardar" : "Editar información"}
        </button>

        <div className="perfil-info">
          <p><strong>Dirección</strong><br />
            {isEditing ? (
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            ) : (
              direccion
            )}
          </p>
          <p><strong>Teléfono</strong><br />
            {isEditing ? (
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            ) : (
              telefono
            )}
          </p>
          <p><strong>Redes</strong><br />
            {isEditing ? (
              <input
                type="text"
                value={redes}
                onChange={(e) => setRedes(e.target.value)}
              />
            ) : (
              redes
            )}
          </p>
          <p><strong>Descripción</strong><br />
            {isEditing ? (
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            ) : (
              descripcion
            )}
          </p>
        </div>

        <div className="seccion">
          <h4>Notificaciones</h4>
          <label>
            <strong>Notificaciones por correo electrónico</strong><br />
            <span>Recibir correos electrónicos y recomendaciones</span>
            <input
              type="checkbox"
              checked={notifCorreo}
              onChange={() => setNotifCorreo(!notifCorreo)}
            />
          </label>
          <label>
            <strong>Notificaciones push</strong><br />
            <span>Reciba alertas de nuevos mensajes y recordatorios</span>
            <input
              type="checkbox"
              checked={notifPush}
              onChange={() => setNotifPush(!notifPush)}
            />
          </label>
        </div>

        <div className="seccion">
          <h4>Seguridad</h4>
          <p>Cambiar la contraseña</p>
          <p>Sesiones activas</p>
        </div>

        <div className="seccion">
          <h4>Datos y privacidad</h4>
          <p>Política de privacidad</p>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;