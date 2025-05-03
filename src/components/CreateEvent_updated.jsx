import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
// Importar el nuevo archivo CSS
import '../Styles/CreateEvent_updated.css'; 
import Header from './Header';

// Icono SVG para el placeholder de imagen (ejemplo)
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    eventName: '',
    description: '',
    location: {
      address: '',
      type: 'presencial'
    },
    date: {
      start: '',
      end: ''
    },
    type: 'simple',
    maxAttendees: '',
    privacy: 'public',
    ticketType: 'free',
    price: {
      amount: 0,
      currency: 'USD'
    },
    subEvents: [],
    categories: [],
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Para la vista previa
  const [errors, setErrors] = useState({});
  const [newSubEvent, setNewSubEvent] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    duration: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Limpiar error específico cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (name.includes('.') && errors[name.split('.')[1]]) {
       const [, child] = name.split('.');
       setErrors(prev => ({ ...prev, [child]: undefined }));
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'categories') {
      setEventData(prev => ({
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter(cat => cat !== value)
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSubEvent = () => {
    // Validaciones simples para sub-evento (se pueden mejorar)
    if (!newSubEvent.name || !newSubEvent.date || !newSubEvent.time || !newSubEvent.location || !newSubEvent.duration) {
      alert('Por favor complete todos los campos del sub-evento.');
      return;
    }

    // Validación de fecha (opcional, pero buena práctica)
    try {
        const mainEventStart = eventData.date.start ? new Date(eventData.date.start) : null;
        const mainEventEnd = eventData.date.end ? new Date(eventData.date.end) : null;
        const subEventDateTime = new Date(`${newSubEvent.date}T${newSubEvent.time}`);

        if (mainEventStart && subEventDateTime < mainEventStart) {
            alert('La fecha y hora del sub-evento no puede ser anterior a la fecha de inicio del evento principal.');
            return;
        }
        if (mainEventEnd && subEventDateTime > mainEventEnd) {
            alert('La fecha y hora del sub-evento no puede ser posterior a la fecha de fin del evento principal.');
            return;
        }
    } catch (e) {
        console.error("Error parsing dates for validation: ", e);
        // Considerar si mostrar un error al usuario o no
    }

    setEventData(prev => ({
      ...prev,
      subEvents: [...prev.subEvents, { ...newSubEvent, id: Date.now() }]
    }));
    setNewSubEvent({ name: '', date: '', time: '', location: '', duration: '' }); // Reset form
  };

  const removeSubEvent = (id) => {
    setEventData(prev => ({
      ...prev,
      subEvents: prev.subEvents.filter(subEvent => subEvent.id !== id)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Mostrar vista previa inmediatamente
        // Comprimir imagen (opcional, se mantiene la lógica anterior)
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setImage(compressedImage); // Guardar imagen comprimida para enviar
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.eventName.trim()) newErrors.eventName = 'El nombre del evento es obligatorio.';
    if (!eventData.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!eventData.date.start) newErrors.start = 'La fecha de inicio es obligatoria.';
    // Añadir más validaciones si es necesario (ubicación, etc.)
    if (eventData.ticketType === 'paid' && (!eventData.price.amount || eventData.price.amount <= 0)) {
        newErrors.amount = 'El precio es obligatorio para entradas pagas.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalEventData = {
      ...eventData,
      image: image, // Enviar la imagen comprimida (base64)
      date: {
        start: eventData.date.start ? new Date(eventData.date.start).toISOString() : null,
        end: eventData.date.end ? new Date(eventData.date.end).toISOString() : null
      },
      // Asegurarse que los subeventos no tengan el id temporal
      subEvents: eventData.subEvents.map(({ id, ...rest }) => rest)
    };

    console.log("Enviando datos:", JSON.stringify(finalEventData, null, 2));

    try {
      // Asegúrate que la URL de la API sea correcta
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalEventData)
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Evento creado:', responseData);
        alert('¡Evento creado exitosamente!');
        navigate('/EventHub'); // Redirigir después de crear
      } else {
        // Mostrar errores de validación del backend si existen
        const errorMessages = responseData.errors
          ? responseData.errors.join('\n')
          : responseData.message || 'Error al crear el evento.';
        console.error('Error del servidor:', errorMessages);
        alert(`Error al crear el evento:\n${errorMessages}`);
        // Opcional: mapear errores del backend a `errors` state
        if (responseData.errors) {
            const backendErrors = {};
            // Aquí necesitarías mapear los mensajes de error del backend
            // a los nombres de campo correspondientes en tu estado `errors`.
            // Ejemplo simple:
            responseData.errors.forEach(err => {
                if (err.toLowerCase().includes('name')) backendErrors.eventName = err;
                if (err.toLowerCase().includes('description')) backendErrors.description = err;
                // ... mapear otros errores
            });
            setErrors(prev => ({ ...prev, ...backendErrors }));
        }
      }
    } catch (error) {
      console.error('Error de red o conexión:', error);
      alert('Error de red o al conectar con el servidor. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="create-event-container">
          <h1>Crear un Evento</h1>
          <form onSubmit={handleSubmit} noValidate>
            
            {/* Sección Información Básica */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="eventName">Nombre del Evento*</label>
                <input
                  id="eventName"
                  type="text"
                  name="eventName"
                  value={eventData.eventName}
                  onChange={handleInputChange}
                  placeholder="Ej: Conferencia Anual de Tecnología"
                  required
                  className={errors.eventName ? 'error' : ''}
                />
                {errors.eventName && <span className="error-message">{errors.eventName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción*</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  placeholder="Describe los detalles principales de tu evento..."
                  required
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Sección Imagen */}
            <div className="form-section">
                 <div className="form-group">
                    <label>Imagen del Evento</label>
                    <div className="image-upload">
                        <div className="image-preview-container">
                        {imagePreview ? (
                            <img 
                            src={imagePreview} 
                            alt="Vista previa del evento" 
                            className="uploaded-image" 
                            />
                        ) : (
                            <div className="placeholder-image">
                            <UploadIcon />
                            <span>Arrastra una imagen o haz clic para seleccionar</span>
                            </div>
                        )}
                        </div>
                        <label htmlFor="imageUploadInput" className="image-upload-input">
                            {imagePreview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        </label>
                        <input
                            id="imageUploadInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>
            </div>

            {/* Sección Fecha y Hora */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="dateStart">Fecha y Hora de Inicio*</label>
                <input
                  id="dateStart"
                  type="datetime-local"
                  name="date.start"
                  value={eventData.date.start}
                  onChange={handleInputChange}
                  required
                  className={errors.start ? 'error' : ''}
                />
                 {errors.start && <span className="error-message">{errors.start}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateEnd">Fecha y Hora de Fin (Opcional)</label>
                <input
                  id="dateEnd"
                  type="datetime-local"
                  name="date.end"
                  value={eventData.date.end}
                  onChange={handleInputChange}
                  min={eventData.date.start} // Evitar fecha fin anterior a inicio
                />
              </div>
            </div>
            
            {/* Sección Ubicación */}
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="locationAddress">Ubicación</label>
                <input
                  id="locationAddress"
                  type="text"
                  name="location.address"
                  value={eventData.location.address}
                  onChange={handleInputChange}
                  placeholder="Ej: Centro de Convenciones, Online, etc."
                  className={errors.address ? 'error' : ''}
                />
                 {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
               {/* Aquí podrías añadir más opciones de ubicación como tipo (presencial/online) si es necesario */}
            </div>

            {/* Sección Tickets */}
            <div className="form-section">
              <div className="form-group">
                <label>Tipo de Entrada</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="ticketType"
                      value="free"
                      checked={eventData.ticketType === 'free'}
                      onChange={handleInputChange}
                    />
                    <span>Gratuita</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="ticketType"
                      value="paid"
                      checked={eventData.ticketType === 'paid'}
                      onChange={handleInputChange}
                    />
                    <span>De Pago</span>
                  </label>
                </div>
              </div>

              {eventData.ticketType === 'paid' && (
                <div className="form-group">
                  <label htmlFor="priceAmount">Precio de la Entrada</label>
                  <div className="price-input">
                    <input
                      id="priceAmount"
                      type="number"
                      name="price.amount"
                      value={eventData.price.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0.01" // Precio mínimo si es de pago
                      step="0.01"
                      required
                      className={errors.amount ? 'error' : ''}
                    />
                    <select
                      name="price.currency"
                      value={eventData.price.currency}
                      onChange={handleInputChange}
                    >
                      <option value="USD">USD</option>
                      <option value="COP">COP</option>
                      {/* Añadir más monedas si es necesario */}
                    </select>
                  </div>
                   {errors.amount && <span className="error-message">{errors.amount}</span>}
                </div>
              )}
            </div>

            {/* Sección de Sub-Eventos */}
            <div className="sub-events-section form-section">
              <h2>Sub-Eventos (Opcional)</h2>
              <p>Añade sesiones, talleres o actividades dentro de tu evento principal.</p>
              
              {/* Formulario para Añadir Sub-Evento */}
              <div className="sub-event-form">
                <input
                  type="text"
                  name="name"
                  value={newSubEvent.name}
                  onChange={handleSubEventInputChange}
                  placeholder="Nombre Sub-Evento"
                />
                 <input
                  type="date"
                  name="date"
                  value={newSubEvent.date}
                  onChange={handleSubEventInputChange}
                  placeholder="Fecha"
                />
                <input
                  type="time"
                  name="time"
                  value={newSubEvent.time}
                  onChange={handleSubEventInputChange}
                  placeholder="Hora"
                />
                <input
                  type="text"
                  name="location"
                  value={newSubEvent.location}
                  onChange={handleSubEventInputChange}
                  placeholder="Ubicación"
                />
                <input
                  type="text"
                  name="duration"
                  value={newSubEvent.duration}
                  onChange={handleSubEventInputChange}
                  placeholder="Duración (ej: 2h)"
                />
                <button
                  type="button"
                  onClick={addSubEvent}
                  className="add-sub-event-btn"
                >
                  Añadir Sub-Evento
                </button>
              </div>

              {/* Lista de Sub-Eventos Añadidos */}
              {eventData.subEvents.length > 0 && (
                <div className="sub-event-list">
                  {eventData.subEvents.map((subEvent) => (
                    <div key={subEvent.id} className="sub-event-item">
                      <div className="sub-event-details">
                        <span>{subEvent.name}</span>
                        <span>{subEvent.date} {subEvent.time} - {subEvent.location} ({subEvent.duration})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubEvent(subEvent.id)}
                        className="remove-sub-event-btn"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="save-event-btn">
              Guardar Evento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

