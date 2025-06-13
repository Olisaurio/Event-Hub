
import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    nombre: 'Helen',
    apellido: 'Zhou',
    correo: 'helen@acmeco.com',
    identificacion: '1234567890',
    numero: '+57 300 123 4567',
    direccion: 'Calle 123 #45-67',
    fechaNacimiento: '1990-05-15',
    pais: 'Colombia',
    ciudad: 'Armenia',
    foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b804?w=150&h=150&fit=crop&crop=face',
    role: 'Participant'
  });
  
  const [isEditing, setIsEditing] = useState({
    personalInfo: false,
    contact: false,
    location: false
  });
  
  const [notifications, setNotifications] = useState({
    eventHubUpdates: true,
    pushNotifications: false
  });

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (section) => {
    // Aquí enviarías los datos a la API
    console.log('Saving profile data:', userProfile);
    
    // Simular guardado exitoso
    alert('Perfil actualizado correctamente');
    
    setIsEditing(prev => ({
      ...prev,
      [section]: false
    }));
  };

  const handleCancel = (section) => {
    setIsEditing(prev => ({
      ...prev,
      [section]: false
    }));
    // En una aplicación real, aquí recargarías los datos originales
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile(prev => ({
          ...prev,
          foto: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={userProfile.foto}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b804?w=150&h=150&fit=crop&crop=face';
                }}
              />
              <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-sm">camera_alt</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {userProfile.nombre} {userProfile.apellido}
            </h2>
            <p className="text-gray-600">{userProfile.correo}</p>
            <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {userProfile.role}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Información Personal</h3>
            {!isEditing.personalInfo ? (
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, personalInfo: true }))}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => handleSave('personalInfo')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => handleCancel('personalInfo')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              {isEditing.personalInfo ? (
                <input
                  type="text"
                  value={userProfile.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
              {isEditing.personalInfo ? (
                <input
                  type="text"
                  value={userProfile.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.apellido}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Identificación</label>
              {isEditing.personalInfo ? (
                <input
                  type="text"
                  value={userProfile.identificacion}
                  onChange={(e) => handleInputChange('identificacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.identificacion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
              {isEditing.personalInfo ? (
                <input
                  type="date"
                  value={userProfile.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{formatDate(userProfile.fechaNacimiento)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Información de Contacto</h3>
            {!isEditing.contact ? (
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, contact: true }))}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => handleSave('contact')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => handleCancel('contact')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              {isEditing.contact ? (
                <input
                  type="email"
                  value={userProfile.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.correo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número de Teléfono</label>
              {isEditing.contact ? (
                <input
                  type="tel"
                  value={userProfile.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.numero}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Ubicación</h3>
            {!isEditing.location ? (
              <button
                onClick={() => setIsEditing(prev => ({ ...prev, location: true }))}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={() => handleSave('location')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => handleCancel('location')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              {isEditing.location ? (
                <input
                  type="text"
                  value={userProfile.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.direccion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
              {isEditing.location ? (
                <input
                  type="text"
                  value={userProfile.pais}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.pais}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
              {isEditing.location ? (
                <input
                  type="text"
                  value={userProfile.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{userProfile.ciudad}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">EventHub updates</p>
                <p className="text-sm text-gray-600">Enviarme emails con actualizaciones y recordatorios</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.eventHubUpdates}
                  onChange={(e) => setNotifications(prev => ({ ...prev, eventHubUpdates: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push notifications</p>
                <p className="text-sm text-gray-600">Enviarme notificaciones push para recordatorios de eventos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Cambiar contraseña</p>
                <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente para mantener tu cuenta segura</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 font-medium">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Dispositivos activos y sesiones</p>
                <p className="text-sm text-gray-600">Gestiona los dispositivos donde has iniciado sesión</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 font-medium">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center py-6 border-t border-gray-200">
          <div className="space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Política de Privacidad</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Soporte</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
