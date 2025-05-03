import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import '../Styles/CreateEvent_updated.css'; 
import Header from './Header';

// Icono SVG para el placeholder de imagen
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="upload-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

// Componente reutilizable para carga de imagen
const ImageUploader = ({ index, imagePreview, onImageUpload, onImageRemove, error }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    onImageUpload(e, index);
  };

  const handleRemoveClick = (e) => {
      e.stopPropagation(); // Evitar que el click active el input
      onImageRemove(index);
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Resetear el valor del input
      }
  }

  return (
    <div className={`image-upload-slot ${error ? 'error' : ''}`}>
      <label htmlFor={`imageUploadInput-${index}`}>Imagen Principal {index + 1}*</label>
      <div className="image-preview-container" onClick={handleButtonClick}> 
        {imagePreview ? (
          <>
            <img 
              src={imagePreview} 
              alt={`Vista previa Imagen ${index + 1}`} 
              className="uploaded-image" 
            />
            <button 
                type="button" 
                className="remove-image-btn" 
                onClick={handleRemoveClick}
                aria-label={`Eliminar Imagen ${index + 1}`}
            >
                &times; {/* Simple X icon */}
            </button>
          </>
        ) : (
          <div className="placeholder-image">
            <UploadIcon />
            <span>Seleccionar Imagen {index + 1} (Max 5MB)</span>
          </div>
        )}
      </div>
      <input
        id={`imageUploadInput-${index}`}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};


const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    eventName: '',
    description: '',
    location: { address: '', type: 'presencial' },
    date: { start: '', end: '' },
    type: 'simple',
    maxAttendees: '',
    privacy: 'public',
    ticketType: 'free',
    price: { amount: '', currency: 'USD' },
    subEvents: [],
    categories: [],
    // *** Nuevo estado para imágenes ***
    mainImages: [null, null], // Array para almacenar base64 de las 2 imágenes
    galleryImages: [], // Se implementará después
  });

  // *** Nuevo estado para previsualizaciones ***
  const [mainImagePreviews, setMainImagePreviews] = useState([null, null]);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', time: '', location: '', duration: '' });

  // --- Handlers --- 

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const targetValue = type === 'checkbox' ? checked : value;

    // Limpiar error específico
    const errorKey = name.includes('.') ? name.split('.')[1] : name;
    if (errors[errorKey]) {
      setErrors(prev => { 
          const newErrors = {...prev};
          delete newErrors[errorKey];
          if(name === 'price.amount') delete newErrors.amount;
          if(name === 'date.start') delete newErrors.start;
          if(name === 'location.address') delete newErrors.address;
          return newErrors;
       });
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: targetValue } }));
    } else {
      setEventData(prev => ({ ...prev, [name]: targetValue }));
    }
  };

  const handleSubEventInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubEvent(prev => ({ ...prev, [name]: value }));
  };

  // --- Sub-Event Logic (sin cambios) --- 
  const addSubEvent = () => {
    const subEventErrors = {};
    if (!newSubEvent.name.trim()) subEventErrors.subName = 'Nombre requerido.';
    if (!newSubEvent.date) subEventErrors.subDate = 'Fecha requerida.';
    if (!newSubEvent.time) subEventErrors.subTime = 'Hora requerida.';
    if (!newSubEvent.location.trim()) subEventErrors.subLocation = 'Ubicación requerida.';
    if (!newSubEvent.duration.trim()) subEventErrors.subDuration = 'Duración requerida.';

    if (Object.keys(subEventErrors).length > 0) {
        alert(`Errores en el sub-evento:\n${Object.values(subEventErrors).join('\n')}`);
        return;
    }
    
    try {
        const mainEventStart = eventData.date.start ? new Date(eventData.date.start) : null;
        const mainEventEnd = eventData.date.end ? new Date(eventData.date.end) : null;
        const subEventDateTime = new Date(`${newSubEvent.date}T${newSubEvent.time}`);

        if (mainEventStart && subEventDateTime < mainEventStart) {
            alert('La fecha y hora del sub-evento no puede ser anterior al inicio del evento principal.');
            return;
        }
        if (mainEventEnd && subEventDateTime > mainEventEnd) {
            alert('La fecha y hora del sub-evento no puede ser posterior al fin del evento principal.');
            return;
        }
    } catch (e) {
        console.error("Error validando fechas de sub-evento: ", e);
        alert("Error al validar las fechas del sub-evento. Verifica los formatos.");
        return;
    }

    setEventData(prev => ({ ...prev, subEvents: [...prev.subEvents, { ...newSubEvent, id: Date.now() }] }));
    setNewSubEvent({ name: '', date: '', time: '', location: '', duration: '' });
  };

  const removeSubEvent = (id) => {
    setEventData(prev => ({ ...prev, subEvents: prev.subEvents.filter(subEvent => subEvent.id !== id) }));
  };

  // --- *** Image Handling Actualizado *** ---
  const handleMainImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona un archivo de imagen.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // Límite 5MB
            alert('La imagen es demasiado grande (Max 5MB).');
            return;
        }

        // Limpiar error de imagen para este slot
        if (errors.mainImages && errors.mainImages[index]) {
            setErrors(prev => {
                const newImgErrors = [...(prev.mainImages || [])];
                newImgErrors[index] = undefined;
                // Si ya no hay errores de imagen, quitar el array de errores
                const hasOtherImgErrors = newImgErrors.some(err => !!err);
                return { ...prev, mainImages: hasOtherImgErrors ? newImgErrors : undefined };
            });
        }
        if (errors.mainImagesRequired) {
             setErrors(prev => { 
                const newErrors = {...prev};
                delete newErrors.mainImagesRequired;
                return newErrors;
            });
        }

      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result;
        // Actualizar preview
        setMainImagePreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = previewUrl;
            return newPreviews;
        });

        // Comprimir y guardar base64
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 1200;
          const maxHeight = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
          } else {
            if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          
          // Actualizar estado de eventData con la imagen comprimida
          setEventData(prev => {
              const newMainImages = [...prev.mainImages];
              newMainImages[index] = compressedImage;
              return { ...prev, mainImages: newMainImages };
          });
        };
        img.onerror = () => {
            console.error("Error al cargar imagen para comprimir.");
            alert("Hubo un error al procesar la imagen.");
            // Resetear solo este slot si falla
            setMainImagePreviews(prev => {
                const newPreviews = [...prev];
                newPreviews[index] = null;
                return newPreviews;
            });
             setEventData(prev => {
              const newMainImages = [...prev.mainImages];
              newMainImages[index] = null;
              return { ...prev, mainImages: newMainImages };
            });
        }
        img.src = previewUrl;
      };
      reader.onerror = () => {
          console.error("Error al leer archivo.");
          alert("Hubo un error al leer el archivo.");
      }
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMainImage = (index) => {
      setMainImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = null;
          return newPreviews;
      });
      setEventData(prev => {
          const newMainImages = [...prev.mainImages];
          newMainImages[index] = null;
          return { ...prev, mainImages: newMainImages };
      });
       // Limpiar error de imagen para este slot si existía
        if (errors.mainImages && errors.mainImages[index]) {
            setErrors(prev => {
                const newImgErrors = [...(prev.mainImages || [])];
                newImgErrors[index] = undefined;
                const hasOtherImgErrors = newImgErrors.some(err => !!err);
                return { ...prev, mainImages: hasOtherImgErrors ? newImgErrors : undefined };
            });
        }
  };

  // --- Form Validation & Submission Actualizado --- 

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.eventName.trim()) newErrors.eventName = 'El nombre del evento es obligatorio.';
    if (!eventData.description.trim()) newErrors.description = 'La descripción es obligatoria.';
    if (!eventData.date.start) {
        newErrors.start = 'La fecha de inicio es obligatoria.';
    } else if (eventData.date.end && new Date(eventData.date.end) < new Date(eventData.date.start)) {
        newErrors.end = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }
    if (!eventData.location.address.trim()) newErrors.address = 'La ubicación es obligatoria.';
    
    // *** Validación Imágenes Principales ***
    const mainImageErrors = [null, null];
    let mainImagesValid = true;
    if (!eventData.mainImages[0]) {
        mainImageErrors[0] = 'Imagen principal 1 requerida.';
        mainImagesValid = false;
    }
    if (!eventData.mainImages[1]) {
        mainImageErrors[1] = 'Imagen principal 2 requerida.';
        mainImagesValid = false;
    }
    if (!mainImagesValid) {
        // Podríamos usar un error general o uno por cada imagen
        // newErrors.mainImagesRequired = 'Se requieren 2 imágenes principales.';
        newErrors.mainImages = mainImageErrors; // Array de errores
    }

    // *** Validación Galería (se añadirá después) ***
    // if (eventData.galleryImages.length < 5) {
    //     newErrors.galleryImages = 'Se requieren al menos 5 imágenes en la galería.';
    // }

    if (eventData.ticketType === 'paid') {
        if (!eventData.price.amount || Number(eventData.price.amount) <= 0) {
            newErrors.amount = 'El precio debe ser mayor que cero.';
        } else if (isNaN(Number(eventData.price.amount))) {
            newErrors.amount = 'El precio debe ser un número.';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    setErrors({});

    // Asegurarse que mainImages contenga solo los base64 válidos
    const validMainImages = eventData.mainImages.filter(img => img !== null);
    if (validMainImages.length !== 2) {
        // Esto no debería pasar si validateForm funciona, pero es una doble verificación
        setErrors({ mainImagesRequired: 'Se requieren exactamente 2 imágenes principales.' });
        setIsLoading(false);
        return;
    }

    const finalEventData = {
      ...eventData,
      mainImages: validMainImages, // Enviar el array con las 2 imágenes base64
      // galleryImages: [], // Se añadirá después
      price: {
          ...eventData.price,
          amount: eventData.ticketType === 'paid' ? Number(eventData.price.amount) : 0 
      },
      date: {
        start: eventData.date.start ? new Date(eventData.date.start).toISOString() : null,
        end: eventData.date.end ? new Date(eventData.date.end).toISOString() : null
      },
      subEvents: eventData.subEvents.map(({ id, ...rest }) => rest)
    };

    // Limpiar campos no aplicables
    if (finalEventData.ticketType === 'free') delete finalEventData.price;
    if (finalEventData.subEvents.length === 0) delete finalEventData.subEvents;
    // delete finalEventData.image; // Eliminar campo legado si existiera

    console.log("Enviando datos a la API (mainImages omitido por tamaño):", JSON.stringify({ ...finalEventData, mainImages: ['<base64_1>', '<base64_2>'] }, null, 2));

    try {
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEventData)
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Evento creado:', responseData);
        alert('¡Evento creado exitosamente!');
        navigate('/EventHub');
      } else {
        const errorMessages = responseData.errors
          ? responseData.errors.join('\n')
          : responseData.message || `Error ${response.status}.`;
        console.error('Error del servidor:', errorMessages);
        alert(`Error al crear el evento:\n${errorMessages}`);
        
        // Mapear errores del backend
        if (responseData.errors) {
            const backendErrors = {};
            responseData.errors.forEach(err => {
                if (err.toLowerCase().includes('imágenes principales')) {
                    // Marcar ambos campos de imagen como erróneos
                    backendErrors.mainImages = [err, err]; 
                }
                else if (err.toLowerCase().includes('name')) backendErrors.eventName = err;
                else if (err.toLowerCase().includes('description')) backendErrors.description = err;
                // ... otros mapeos
                else {
                    if (!backendErrors.general) backendErrors.general = [];
                    backendErrors.general.push(err);
                }
            });
            setErrors(prev => ({ ...prev, ...backendErrors }));
        } else {
             setErrors(prev => ({ ...prev, general: [responseData.message || 'Error desconocido.'] }));
        }
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de red o conexión. Inténtalo de nuevo.');
      setErrors(prev => ({ ...prev, general: ['No se pudo conectar.'] }));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render --- 

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="create-event-container">
          <h1>Crear un Evento</h1>
          {errors.general && (
            <div className="general-error-message">{errors.general.join('\n')}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Sección Información Básica (sin cambios) */}
            <div className="form-section">
              {/* ... eventName y description ... */} 
               <div className="form-group">
                <label htmlFor="eventName">Nombre del Evento*</label>
                <input id="eventName" type="text" name="eventName" value={eventData.eventName} onChange={handleInputChange} placeholder="Ej: Conferencia Anual" required aria-invalid={!!errors.eventName} className={errors.eventName ? 'error' : ''}/>
                {errors.eventName && <span className="error-message">{errors.eventName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="description">Descripción*</label>
                <textarea id="description" name="description" value={eventData.description} onChange={handleInputChange} placeholder="Describe tu evento..." required rows={4} aria-invalid={!!errors.description} className={errors.description ? 'error' : ''}/>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* *** Sección Imágenes Principales (Actualizada) *** */}
            <div className="form-section">
                <h2>Imágenes Principales*</h2>
                <p className="section-description">Sube exactamente 2 imágenes que representen tu evento.</p>
                {/* Mostrar error general para imágenes principales si existe */} 
                {errors.mainImagesRequired && <p className="error-message general-image-error">{errors.mainImagesRequired}</p>}
                
                <div className="main-images-container"> {/* Contenedor para las 2 imágenes */} 
                    <ImageUploader 
                        index={0} 
                        imagePreview={mainImagePreviews[0]} 
                        onImageUpload={handleMainImageUpload} 
                        onImageRemove={handleRemoveMainImage}
                        error={errors.mainImages?.[0]} // Pasar error específico
                    />
                    <ImageUploader 
                        index={1} 
                        imagePreview={mainImagePreviews[1]} 
                        onImageUpload={handleMainImageUpload} 
                        onImageRemove={handleRemoveMainImage}
                        error={errors.mainImages?.[1]} // Pasar error específico
                    />
                </div>
            </div>

            {/* Sección Fecha y Hora (sin cambios) */}
            <div className="form-section">
              {/* ... date.start y date.end ... */} 
               <div className="form-group">
                <label htmlFor="dateStart">Fecha y Hora de Inicio*</label>
                <input id="dateStart" type="datetime-local" name="date.start" value={eventData.date.start} onChange={handleInputChange} required aria-invalid={!!errors.start} className={errors.start ? 'error' : ''}/>
                 {errors.start && <span className="error-message">{errors.start}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dateEnd">Fecha y Hora de Fin (Opcional)</label>
                <input id="dateEnd" type="datetime-local" name="date.end" value={eventData.date.end} onChange={handleInputChange} min={eventData.date.start || ''} aria-invalid={!!errors.end} className={errors.end ? 'error' : ''}/>
                 {errors.end && <span className="error-message">{errors.end}</span>}
              </div>
            </div>
            
            {/* Sección Ubicación (sin cambios) */}
            <div className="form-section">
              {/* ... location.address ... */} 
               <div className="form-group">
                <label htmlFor="locationAddress">Ubicación*</label>
                <input id="locationAddress" type="text" name="location.address" value={eventData.location.address} onChange={handleInputChange} placeholder="Ej: Centro de Convenciones" required aria-invalid={!!errors.address} className={errors.address ? 'error' : ''}/>
                 {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            </div>

            {/* Sección Tickets (sin cambios) */}
            <div className="form-section">
             {/* ... ticketType y price ... */} 
              <div className="form-group">
                <label>Tipo de Entrada</label>
                <div className="radio-group">
                  <label><input type="radio" name="ticketType" value="free" checked={eventData.ticketType === 'free'} onChange={handleInputChange}/><span>Gratuita</span></label>
                  <label><input type="radio" name="ticketType" value="paid" checked={eventData.ticketType === 'paid'} onChange={handleInputChange}/><span>De Pago</span></label>
                </div>
              </div>
              {eventData.ticketType === 'paid' && (
                <div className="form-group">
                  <label htmlFor="priceAmount">Precio de la Entrada*</label>
                  <div className="price-input">
                    <input id="priceAmount" type="number" name="price.amount" value={eventData.price.amount} onChange={handleInputChange} placeholder="0.00" min="0.01" step="0.01" required={eventData.ticketType === 'paid'} aria-invalid={!!errors.amount} className={errors.amount ? 'error' : ''}/>
                    <select name="price.currency" value={eventData.price.currency} onChange={handleInputChange} aria-label="Moneda"><option value="USD">USD</option><option value="COP">COP</option></select>
                  </div>
                   {errors.amount && <span className="error-message">{errors.amount}</span>}
                </div>
              )}
            </div>

            {/* Sección de Sub-Eventos (sin cambios) */}
            <div className="sub-events-section form-section">
              {/* ... sub-event form y list ... */} 
               <h2>Sub-Eventos (Opcional)</h2>
              <p className="section-description">Añade sesiones o actividades dentro de tu evento.</p>
              <div className="sub-event-form">
                <input type="text" name="name" value={newSubEvent.name} onChange={handleSubEventInputChange} placeholder="Nombre" aria-label="Nombre Sub-Evento" />
                <input type="date" name="date" value={newSubEvent.date} onChange={handleSubEventInputChange} aria-label="Fecha Sub-Evento" />
                <input type="time" name="time" value={newSubEvent.time} onChange={handleSubEventInputChange} aria-label="Hora Sub-Evento" />
                <input type="text" name="location" value={newSubEvent.location} onChange={handleSubEventInputChange} placeholder="Ubicación" aria-label="Ubicación Sub-Evento" />
                <input type="text" name="duration" value={newSubEvent.duration} onChange={handleSubEventInputChange} placeholder="Duración (ej: 2h)" aria-label="Duración Sub-Evento" />
                <button type="button" onClick={addSubEvent} className="add-sub-event-btn">Añadir</button>
              </div>
              {eventData.subEvents.length > 0 && (
                <div className="sub-event-list">
                  {eventData.subEvents.map((subEvent) => (
                    <div key={subEvent.id} className="sub-event-item">
                      <div className="sub-event-details"><span>{subEvent.name}</span><span>{subEvent.date} {subEvent.time} - {subEvent.location} ({subEvent.duration})</span></div>
                      <button type="button" onClick={() => removeSubEvent(subEvent.id)} className="remove-sub-event-btn" aria-label={`Eliminar ${subEvent.name}`}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
              {eventData.subEvents.length === 0 && (<p className="no-sub-events">No hay sub-eventos.</p>)}
            </div>

            {/* Botón de Envío */}
            <button type="submit" className="save-event-btn" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

