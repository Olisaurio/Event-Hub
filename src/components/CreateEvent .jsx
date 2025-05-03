import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Import react-select
import chroma from 'chroma-js'; // Import chroma-js
import Sidebar from './sidebar';
import '../Styles/CreateEvent.css';
import Header from './Header';

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Default Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Icons --- 
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="upload-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="plus-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="location-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

// --- Componente Uploader Principal (Imagen o Video) --- (Sin cambios)
const MainMediaUploader = ({ index, mediaPreview, onMediaUpload, onMediaRemove, error }) => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => onMediaUpload(e, index);
  const handleRemoveClick = (e) => {
      e.stopPropagation();
      onMediaRemove(index);
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className={`media-upload-slot main-media-slot ${error ? 'error' : ''}`}>
      <label htmlFor={`mainMediaUploadInput-${index}`}>Medio Principal {index + 1}* (Imagen o Video)</label>
      <div className="media-preview-container" onClick={handleButtonClick}>
        {mediaPreview ? (
          <>
            {mediaPreview.type === 'image' ? (
              <img src={mediaPreview.url} alt={`Vista previa ${index + 1}`} className="uploaded-media" />
            ) : mediaPreview.type === 'video' ? (
              <video src={mediaPreview.url} controls className="uploaded-media" />
            ) : null}
            <button type="button" className="remove-media-btn" onClick={handleRemoveClick} aria-label={`Eliminar ${index + 1}`}>&times;</button>
          </>
        ) : (
          <div className="placeholder-media">
            <UploadIcon />
            <span>Seleccionar Imagen o Video {index + 1}*</span>
          </div>
        )}
      </div>
      <input 
        id={`mainMediaUploadInput-${index}`} 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,video/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

// --- Componente Uploader Galería (Solo Imágenes - sin cambios) --- 
const GalleryImageUploader = ({ images, previews, onImagesUpload, onImageRemove, error }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current?.click();
    return (
        <div className={`gallery-uploader ${error ? 'error' : ''}`}>
            <label htmlFor="galleryUploadInput">Imágenes de Galería* (Mínimo 5)</label>
            <p className="section-description">Sube al menos 5 imágenes adicionales.</p>
            <div className="gallery-previews-container">
                {previews.map((preview, index) => (
                    <div key={index} className="gallery-preview-item">
                        <img src={preview} alt={`Galería ${index + 1}`} className="uploaded-image" />
                        <button type="button" className="remove-image-btn" onClick={() => onImageRemove(index)} aria-label={`Eliminar Galería ${index + 1}`}>&times;</button>
                    </div>
                ))}
                <button type="button" className="add-gallery-image-btn button-primary" onClick={handleButtonClick}>
                    <PlusIcon />
                    <span>Añadir Imagen</span>
                </button>
            </div>
            <input id="galleryUploadInput" ref={fileInputRef} type="file" accept="image/*" multiple onChange={onImagesUpload} style={{ display: 'none' }} />
             {error && <span className="error-message">{error}</span>}
             <span className="image-count-indicator">{images.length} imágenes subidas</span>
        </div>
    );
};

// --- Opciones y Estilos para react-select --- 
const categoryColors = {
    "Música": "#88C0D0", // Light Blue
    "Arte y Cultura": "#EBCB8B", // Yellow
    "Comida y Bebida": "#A3BE8C", // Green
    "Deportes": "#D08770", // Orange
    "Negocios": "#5E81AC", // Blue
    "Tecnología": "#B48EAD", // Purple
    "Aire Libre": "#A3BE8C", // Green
    "Comunidad": "#EBCB8B", // Yellow
    "Familia": "#88C0D0", // Light Blue
    "Cine": "#BF616A", // Red
    "Moda": "#B48EAD", // Purple
    "Educación": "#5E81AC", // Blue
    "Salud y Bienestar": "#A3BE8C", // Green
    "Otros": "#D8DEE9" // Light Gray
};

const categoryOptions = Object.keys(categoryColors).map(category => ({
    value: category,
    label: category,
    color: categoryColors[category] || '#ECEFF4'
}));

const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white', borderColor: '#D8DEE9' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.1).css()
        : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? chroma.contrast(color, 'white') > 2
          ? 'white'
          : 'black'
        : data.color,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor:
          !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()),
      },
    };
  },
  multiValue: (styles, { data }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: data.color,
      color: 'white',
    },
  }),
};
// --- Fin Opciones y Estilos react-select ---

// --- Componente Mapa (sin cambios) --- 
const LocationPicker = ({ onLocationSelect, initialPosition }) => {
    const [markerPosition, setMarkerPosition] = useState(initialPosition);
    const mapRef = useRef(null);
    const MapEvents = () => {
        useMapEvents({ click(e) { const { lat, lng } = e.latlng; setMarkerPosition([lat, lng]); onLocationSelect({ latitude: lat, longitude: lng }); } });
        return null;
    };
    const ChangeView = ({ center, zoom }) => {
        const map = useMap();
        useEffect(() => { if (center) map.setView(center, zoom); }, [center, zoom, map]);
        return null;
    };
    useEffect(() => { setMarkerPosition(initialPosition); }, [initialPosition]);
    return (
        <MapContainer center={markerPosition || [4.60971, -74.08175]} zoom={markerPosition ? 15 : 10} scrollWheelZoom={true} style={{ height: '300px', width: '100%', borderRadius: '8px', marginTop: '10px' }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
            <ChangeView center={markerPosition} zoom={markerPosition ? 15 : 10} />
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerPosition && <Marker position={markerPosition}></Marker>}
            <MapEvents />
        </MapContainer>
    );
};

// --- Componente Principal --- 
const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    eventName: '', description: '',
    location: { address: '', type: 'presencial', latitude: null, longitude: null }, 
    date: { start: '', end: '' },
    type: 'simple', privacy: 'public',
    ticketType: 'free', price: { amount: '', currency: 'USD' },
    maxAttendees: '', 
    occupiedTickets: '', 
    subEvents: [], categories: [], // Sigue siendo un array de strings
    mainImages: [null, null], 
    galleryImages: [], 
  });

  const [mainMediaPreviews, setMainMediaPreviews] = useState([null, null]); 
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', time: '', location: '', duration: '' });
  const [mapPosition, setMapPosition] = useState(null);

  // --- Handlers Generales --- 
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const targetValue = type === 'checkbox' ? checked : value;
    const errorKey = name.includes('.') ? name.split('.')[0] : name;
    // Limpiar errores al modificar campo
    if (errors[errorKey] || (name.includes('.') && errors[name.split('.')[1]])) {
      setErrors(prev => { 
          const newErrors = {...prev};
          delete newErrors[errorKey];
          if(name === 'price.amount') delete newErrors.amount;
          if(name === 'date.start') delete newErrors.start;
          if(name === 'location.address') delete newErrors.address;
          // No necesitamos limpiar categories aquí, se hace en su handler
          if (errorKey === 'mainImages') delete newErrors.mainImages;
          if (errorKey === 'galleryImages') delete newErrors.galleryImages;
          if (name === 'maxAttendees') delete newErrors.maxAttendees;
          if (name === 'occupiedTickets') delete newErrors.occupiedTickets;
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

  // --- Handler Categorías (react-select) --- 
  const handleReactSelectCategoryChange = (selectedOptions) => {
      // selectedOptions es un array de objetos { value, label, color } o null
      const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
      if (errors.categories) setErrors(prev => ({ ...prev, categories: undefined }));
      setEventData(prev => ({ ...prev, categories: selectedValues }));
  };

  // --- Handlers Ubicación (sin cambios) --- 
  const handleLocationSelect = ({ latitude, longitude }) => {
      setEventData(prev => ({ ...prev, location: { ...prev.location, latitude, longitude } }));
      setMapPosition([latitude, longitude]);
  };
  const handleGeolocate = () => {
      if (!navigator.geolocation) return alert("Geolocalización no soportada.");
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              setEventData(prev => ({ ...prev, location: { ...prev.location, latitude, longitude } }));
              setMapPosition([latitude, longitude]);
              setIsLoading(false);
          },
          (error) => { alert(`Error geolocalización: ${error.message}`); setIsLoading(false); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  // --- Lógica Sub-Eventos (sin cambios funcionales) --- 
  const addSubEvent = () => {
    const subEventErrors = {};
    if (!newSubEvent.name.trim()) subEventErrors.subName = 'Nombre requerido.';
    if (!newSubEvent.date) subEventErrors.subDate = 'Fecha requerida.';
    if (!newSubEvent.time) subEventErrors.subTime = 'Hora requerida.';
    if (!newSubEvent.location.trim()) subEventErrors.subLocation = 'Ubicación requerida.';
    if (!newSubEvent.duration.trim()) subEventErrors.subDuration = 'Duración requerida.';
    if (Object.keys(subEventErrors).length > 0) { alert(`Errores:\n${Object.values(subEventErrors).join('\n')}`); return; }
    try {
        const mainStart = eventData.date.start ? new Date(eventData.date.start) : null;
        const mainEnd = eventData.date.end ? new Date(eventData.date.end) : null;
        const subDateTime = new Date(`${newSubEvent.date}T${newSubEvent.time}`);
        if (mainStart && subDateTime < mainStart) { alert('Sub-evento antes del inicio.'); return; }
        if (mainEnd && subDateTime > mainEnd) { alert('Sub-evento después del fin.'); return; }
    } catch (e) { alert("Error validando fechas."); return; }
    setEventData(prev => ({ ...prev, subEvents: [...prev.subEvents, { ...newSubEvent, id: Date.now() }] }));
    setNewSubEvent({ name: '', date: '', time: '', location: '', duration: '' });
  };
  const removeSubEvent = (id) => {
    setEventData(prev => ({ ...prev, subEvents: prev.subEvents.filter(sub => sub.id !== id) }));
  };

  // --- Procesamiento de Medios (Imagen o Video) --- (Sin cambios)
  const processMediaFile = (file) => {
      return new Promise((resolve, reject) => {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          if (!isImage && !isVideo) return reject('Tipo de archivo no válido (solo imagen o video).');
          const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
          if (file.size > maxSize) return reject(`Archivo demasiado grande (Max ${isImage ? '5MB' : '100MB'}).`);
          const reader = new FileReader();
          reader.onloadend = () => {
              const dataUrl = reader.result;
              if (isImage) {
                  const img = new Image();
                  img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const maxWidth = 1200, maxHeight = 900;
                      let { width, height } = img;
                      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
                      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
                      canvas.width = width; canvas.height = height;
                      ctx.drawImage(img, 0, 0, width, height);
                      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                      resolve({ type: 'image', previewUrl: dataUrl, base64: compressedBase64 });
                  };
                  img.onerror = () => reject('Error al cargar imagen para compresión.');
                  img.src = dataUrl;
              } else if (isVideo) {
                  resolve({ type: 'video', previewUrl: dataUrl, base64: dataUrl });
              }
          };
          reader.onerror = () => reject('Error al leer archivo.');
          reader.readAsDataURL(file);
      });
  };

  // --- Handlers Medios Principales (Imagen o Video) --- (Sin cambios)
  const handleMainMediaUpload = async (e, index) => {
    const file = e.target.files[0]; if (!file) return;
    if (errors.mainImages?.[index]) {
        setErrors(prev => {
            const upd = [...(prev.mainImages || [])]; upd[index] = undefined; 
            const hasOtherErrors = upd.some(err => !!err);
            return { ...prev, mainImages: hasOtherErrors ? upd : undefined }; 
        });
    }
    try {
        setIsLoading(true);
        const { type, previewUrl, base64 } = await processMediaFile(file);
        setMainMediaPreviews(prev => { const upd = [...prev]; upd[index] = { url: previewUrl, type: type }; return upd; });
        setEventData(prev => { const upd = [...prev.mainImages]; upd[index] = base64; return { ...prev, mainImages: upd }; });
    } catch (error) {
        alert(`Error al procesar archivo: ${error}`);
        setMainMediaPreviews(prev => { const upd = [...prev]; upd[index] = null; return upd; });
        setEventData(prev => { const upd = [...prev.mainImages]; upd[index] = null; return { ...prev, mainImages: upd }; });
        if (e.target) e.target.value = '';
    } finally {
        setIsLoading(false);
    }
  };
  const handleRemoveMainMedia = (index) => {
      setMainMediaPreviews(prev => { const upd = [...prev]; upd[index] = null; return upd; });
      setEventData(prev => { const upd = [...prev.mainImages]; upd[index] = null; return { ...prev, mainImages: upd }; });
      if (errors.mainImages?.[index]) {
          setErrors(prev => {
              const upd = [...(prev.mainImages || [])]; upd[index] = undefined; 
              const hasOtherErrors = upd.some(err => !!err);
              return { ...prev, mainImages: hasOtherErrors ? upd : undefined }; 
          });
      }
  };

  // --- Handlers Galería (Solo Imágenes - sin cambios) ---
  const handleGalleryImagesUpload = async (e) => {
      const files = Array.from(e.target.files); if (!files.length) return;
      if (errors.galleryImages) setErrors(prev => ({ ...prev, galleryImages: undefined }));
      const newPreviews = [...galleryImagePreviews]; const newBase64s = [...eventData.galleryImages]; let processingErrors = [];
      setIsLoading(true);
      for (const file of files) {
          if (!file.type.startsWith('image/')) { processingErrors.push(`${file.name}: Solo imágenes permitidas en galería.`); continue; }
          try {
              const { previewUrl, base64 } = await processMediaFile(file);
              if (!newBase64s.includes(base64)) { newPreviews.push(previewUrl); newBase64s.push(base64); }
          } catch (error) { processingErrors.push(`${file.name}: ${error}`); }
      }
      setIsLoading(false);
      setGalleryImagePreviews(newPreviews); setEventData(prev => ({ ...prev, galleryImages: newBase64s }));
      if (processingErrors.length > 0) alert(`Errores al subir a galería:\n${processingErrors.join('\n')}`);
      if (e.target) e.target.value = ''; 
  };
  const handleRemoveGalleryImage = (index) => {
      setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
      setEventData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
      if (errors.galleryImages && (eventData.galleryImages.length - 1) >= 5) setErrors(prev => ({ ...prev, galleryImages: undefined }));
  };

  // --- Validación y Envío --- 
  const validateForm = () => {
    const newErrors = {};
    if (!eventData.eventName.trim()) newErrors.eventName = 'Nombre obligatorio.';
    if (!eventData.description.trim()) newErrors.description = 'Descripción obligatoria.';
    if (!eventData.date.start) newErrors.start = 'Fecha inicio obligatoria.';
    else if (eventData.date.end && new Date(eventData.date.end) < new Date(eventData.date.start)) newErrors.end = 'Fecha fin inválida.';
    if (!eventData.location.address.trim()) newErrors.address = 'Dirección obligatoria.';
    
    // Validar Medios Principales
    const mainMediaErrors = [null, null];
    if (!eventData.mainImages[0]) mainMediaErrors[0] = 'Requerido.';
    if (!eventData.mainImages[1]) mainMediaErrors[1] = 'Requerido.';
    if (mainMediaErrors.some(err => !!err)) newErrors.mainImages = mainMediaErrors;

    // Validar Galería
    if (eventData.galleryImages.length < 5) newErrors.galleryImages = `Mínimo 5 imágenes (actual: ${eventData.galleryImages.length}).`;
    
    // Validar Categorías (react-select)
    if (!Array.isArray(eventData.categories) || eventData.categories.length === 0) {
        newErrors.categories = 'Selecciona al menos una categoría.';
    }

    // Validar Precio
    if (eventData.ticketType === 'paid') {
        if (!eventData.price.amount || Number(eventData.price.amount) <= 0) newErrors.amount = 'Precio > 0 requerido.';
        else if (isNaN(Number(eventData.price.amount))) newErrors.amount = 'Precio inválido.';
    }

    // Validar Capacidad y Ocupados
    const maxAttendeesNum = eventData.maxAttendees !== '' ? Number(eventData.maxAttendees) : null;
    const occupiedTicketsNum = eventData.occupiedTickets !== '' ? Number(eventData.occupiedTickets) : 0; 

    if (maxAttendeesNum !== null) {
        if (isNaN(maxAttendeesNum)) {
            newErrors.maxAttendees = 'Capacidad debe ser un número.';
        } else if (maxAttendeesNum <= 0) {
            newErrors.maxAttendees = 'Capacidad debe ser mayor que 0.';
        }
    } 

    if (isNaN(occupiedTicketsNum)) {
        newErrors.occupiedTickets = 'Ocupadas debe ser un número.';
    } else if (occupiedTicketsNum < 0) {
        newErrors.occupiedTickets = 'Ocupadas no puede ser negativo.';
    }

    if (maxAttendeesNum !== null && !isNaN(maxAttendeesNum) && maxAttendeesNum > 0 && !isNaN(occupiedTicketsNum) && occupiedTicketsNum >= 0) {
        if (occupiedTicketsNum > maxAttendeesNum) {
            newErrors.occupiedTickets = 'Ocupadas no puede exceder la capacidad.';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        console.log("Validation failed:", errors);
        // Scroll to the first error field (optional enhancement)
        const firstErrorKey = Object.keys(errors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorKey}"], #${firstErrorKey}`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        alert("Por favor, corrige los errores marcados en el formulario.");
        return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setErrors({});

    const finalEventData = {
      ...eventData,
      mainImages: eventData.mainImages.filter(media => !!media),
      galleryImages: eventData.galleryImages.filter(img => !!img),
      categories: Array.isArray(eventData.categories) ? eventData.categories : [],
      location: {
          ...eventData.location,
          latitude: eventData.location.latitude ?? undefined,
          longitude: eventData.location.longitude ?? undefined,
      },
      price: {
          ...eventData.price,
          amount: eventData.ticketType === 'paid' ? Number(eventData.price.amount) : 0 
      },
      date: {
        start: eventData.date.start ? new Date(eventData.date.start).toISOString() : null,
        end: eventData.date.end ? new Date(eventData.date.end).toISOString() : null
      },
      subEvents: eventData.subEvents.length > 0 ? eventData.subEvents.map(({ id, ...rest }) => rest) : undefined,
      maxAttendees: eventData.maxAttendees !== '' ? Number(eventData.maxAttendees) : undefined,
      occupiedTickets: eventData.occupiedTickets !== '' ? Number(eventData.occupiedTickets) : 0, 
    };

    if (finalEventData.ticketType === 'free') delete finalEventData.price;
    if (!finalEventData.subEvents) delete finalEventData.subEvents;

    console.log("Enviando datos (medios omitidos):", JSON.stringify({ 
        ...finalEventData, 
        mainImages: `[${finalEventData.mainImages.length} medios]`, 
        galleryImages: `[${finalEventData.galleryImages.length} imágenes]` 
    }, null, 2));

    try {
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalEventData)
      });
      const responseData = await response.json();

      if (response.ok) {
        alert('¡Evento creado exitosamente!');
        navigate('/EventHub');
      } else {
        const errorMessages = responseData.errors?.join('\n') || responseData.message || `Error ${response.status}.`;
        console.error("API Error:", responseData);
        alert(`Error al crear el evento:\n${errorMessages}`);
        const backendErrors = {};
        if (responseData.errors) {
             responseData.errors.forEach(err => {
                if (err.includes('nombre')) backendErrors.eventName = err;
                else if (err.includes('descripción')) backendErrors.description = err;
                else if (err.includes('fecha de inicio')) backendErrors.start = err;
                else if (err.includes('fecha de fin')) backendErrors.end = err;
                else if (err.includes('dirección') || err.includes('ubicación')) backendErrors.address = err;
                else if (err.includes('categoría')) backendErrors.categories = err;
                else if (err.includes('medios principales')) {
                    if (!eventData.mainImages[0] && !eventData.mainImages[1]) backendErrors.mainImages = ['Requerido.', 'Requerido.'];
                    else if (!eventData.mainImages[0]) backendErrors.mainImages = ['Requerido.', null];
                    else if (!eventData.mainImages[1]) backendErrors.mainImages = [null, 'Requerido.'];
                    else backendErrors.mainImages = [err, err]; 
                }
                else if (err.includes('galería')) backendErrors.galleryImages = err;
                else if (err.includes('precio')) backendErrors.amount = err;
                else if (err.toLowerCase().includes('capacidad')) backendErrors.maxAttendees = err;
                else if (err.toLowerCase().includes('ocupadas')) backendErrors.occupiedTickets = err;
                else { 
                    if (!backendErrors.general) backendErrors.general = []; 
                    backendErrors.general.push(err); 
                }
            });
        } else {
             backendErrors.general = [responseData.message || 'Error desconocido del servidor.'];
        }
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }
    } catch (error) {
      console.error('Error de red o fetch:', error);
      alert('Error de red o conexión al servidor. Inténtalo de nuevo.');
      setErrors(prev => ({ ...prev, general: ['No se pudo conectar con el servidor.'] }));
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
          {errors.general && <div className="general-error-message">{errors.general.join('\n')}</div>}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Info Básica */}
            <div className="form-section">
               <div className="form-group">
                <label htmlFor="eventName">Nombre*</label>
                <input id="eventName" type="text" name="eventName" value={eventData.eventName} onChange={handleInputChange} required aria-invalid={!!errors.eventName} className={errors.eventName ? 'error' : ''}/>
                {errors.eventName && <span className="error-message">{errors.eventName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="description">Descripción*</label>
                <textarea id="description" name="description" value={eventData.description} onChange={handleInputChange} required rows={4} aria-invalid={!!errors.description} className={errors.description ? 'error' : ''}/>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Categorías (react-select) */}
            <div className="form-section">
                <h2>Categorías*</h2>
                <p className="section-description">Selecciona una o más categorías.</p>
                <div className={`form-group ${errors.categories ? 'error' : ''}`}>
                    <label htmlFor="categoriesSelect">Categorías</label>
                    <Select
                        id="categoriesSelect"
                        instanceId="categoriesSelect-id" // Unique ID for SSR/testing
                        isMulti
                        name="categories"
                        options={categoryOptions}
                        styles={colourStyles}
                        className={`react-select-container ${errors.categories ? 'error' : ''}`}
                        classNamePrefix="react-select"
                        placeholder="Selecciona categorías..."
                        value={categoryOptions.filter(option => eventData.categories.includes(option.value))}
                        onChange={handleReactSelectCategoryChange}
                        aria-invalid={!!errors.categories}
                    />
                    {errors.categories && <span className="error-message">{errors.categories}</span>}
                </div>
            </div>

            {/* Medios Principales */}
            <div className="form-section">
                <h2>Medios Principales*</h2>
                <p className="section-description">Sube exactamente 2 archivos (imagen o video).</p>
                <div className="main-media-container">
                    <MainMediaUploader index={0} mediaPreview={mainMediaPreviews[0]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleRemoveMainMedia} error={errors.mainImages?.[0]} />
                    <MainMediaUploader index={1} mediaPreview={mainMediaPreviews[1]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleRemoveMainMedia} error={errors.mainImages?.[1]} />
                </div>
            </div>
            {/* Galería */}
            <div className="form-section">
                <GalleryImageUploader images={eventData.galleryImages} previews={galleryImagePreviews} onImagesUpload={handleGalleryImagesUpload} onImageRemove={handleRemoveGalleryImage} error={errors.galleryImages}/>
            </div>

            {/* Fecha y Hora */}
            <div className="form-section">
               <div className="form-group">
                <label htmlFor="dateStart">Inicio*</label>
                <input id="dateStart" type="datetime-local" name="date.start" value={eventData.date.start} onChange={handleInputChange} required aria-invalid={!!errors.start} className={errors.start ? 'error' : ''}/>
                 {errors.start && <span className="error-message">{errors.start}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="dateEnd">Fin (Opcional)</label>
                <input id="dateEnd" type="datetime-local" name="date.end" value={eventData.date.end} onChange={handleInputChange} min={eventData.date.start || ''} aria-invalid={!!errors.end} className={errors.end ? 'error' : ''}/>
                 {errors.end && <span className="error-message">{errors.end}</span>}
              </div>
            </div>
            
            {/* Ubicación con Mapa */}
            <div className="form-section">
               <h2>Ubicación*</h2>
               <div className="form-group">
                <label htmlFor="locationAddress">Dirección*</label>
                <input id="locationAddress" type="text" name="location.address" value={eventData.location.address} onChange={handleInputChange} required aria-invalid={!!errors.address} className={errors.address ? 'error' : ''}/>
                 {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              <div className="location-map-section">
                  <p className="section-description">Opcional: Selecciona la ubicación exacta en el mapa o usa tu ubicación actual.</p>
                  <button type="button" onClick={handleGeolocate} className="geolocate-btn button-secondary" disabled={isLoading}>
                      <LocationIcon />
                      {isLoading ? 'Buscando...' : 'Usar mi Ubicación Actual'}
                  </button>
                  <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={mapPosition} />
                  {eventData.location.latitude && eventData.location.longitude && (
                      <p className="coords-display">Coordenadas: {eventData.location.latitude.toFixed(5)}, {eventData.location.longitude.toFixed(5)}</p>
                  )}
              </div>
            </div>

            {/* Tickets y Capacidad */}
            <div className="form-section">
              <h2>Tickets y Capacidad</h2>
              <div className="form-group-inline">
                  <div className="form-group">
                    <label>Tipo Entrada</label>
                    <div className="radio-group">
                      <label><input type="radio" name="ticketType" value="free" checked={eventData.ticketType === 'free'} onChange={handleInputChange}/><span>Gratuita</span></label>
                      <label><input type="radio" name="ticketType" value="paid" checked={eventData.ticketType === 'paid'} onChange={handleInputChange}/><span>De Pago</span></label>
                    </div>
                  </div>
                  {eventData.ticketType === 'paid' && (
                    <div className="form-group">
                      <label htmlFor="priceAmount">Precio*</label>
                      <div className="price-input">
                        <input id="priceAmount" type="number" name="price.amount" value={eventData.price.amount} onChange={handleInputChange} placeholder="0.00" min="0.01" step="0.01" required aria-invalid={!!errors.amount} className={errors.amount ? 'error' : ''}/>
                        <select name="price.currency" value={eventData.price.currency} onChange={handleInputChange}><option value="USD">USD</option><option value="COP">COP</option></select>
                      </div>
                       {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>
                  )}
              </div>
              <div className="form-group-inline">
                  <div className="form-group">
                      <label htmlFor="maxAttendees">Capacidad Máxima (Opcional)</label>
                      <input id="maxAttendees" type="number" name="maxAttendees" value={eventData.maxAttendees} onChange={handleInputChange} placeholder="Ej: 1000" min="1" step="1" aria-invalid={!!errors.maxAttendees} className={errors.maxAttendees ? 'error' : ''}/>
                      {errors.maxAttendees && <span className="error-message">{errors.maxAttendees}</span>}
                  </div>
                  <div className="form-group">
                      <label htmlFor="occupiedTickets">Entradas Ya Ocupadas (Opcional)</label>
                      <input id="occupiedTickets" type="number" name="occupiedTickets" value={eventData.occupiedTickets} onChange={handleInputChange} placeholder="Ej: 15" min="0" step="1" aria-invalid={!!errors.occupiedTickets} className={errors.occupiedTickets ? 'error' : ''}/>
                      {errors.occupiedTickets && <span className="error-message">{errors.occupiedTickets}</span>}
                  </div>
              </div>
            </div>

            {/* Sub-Eventos */}
            <div className="form-section sub-events-section">
              <h2>Agenda / Sub-Eventos (Opcional)</h2>
              <p className="section-description">Añade actividades o partes específicas dentro de tu evento principal.</p>
              {eventData.subEvents.length > 0 && (
                <div className="sub-events-list">
                  <h3>Sub-Eventos Añadidos:</h3>
                  {eventData.subEvents.map((sub) => (
                    <div key={sub.id} className="sub-event-item">
                      <div className="sub-event-details">
                        <strong>{sub.name}</strong>
                        <span>{sub.date} {sub.time}</span>
                        <span>@{sub.location} ({sub.duration})</span>
                      </div>
                      <button type="button" onClick={() => removeSubEvent(sub.id)} className="remove-sub-event-btn" aria-label={`Eliminar sub-evento ${sub.name}`}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="add-sub-event-form">
                <h3>Añadir Nuevo Sub-Evento:</h3>
                <div className="form-group">
                  <label htmlFor="subEventName">Nombre*</label>
                  <input id="subEventName" type="text" placeholder="Nombre del sub-evento" value={newSubEvent.name} onChange={(e) => setNewSubEvent({...newSubEvent, name: e.target.value})} />
                </div>
                <div className="form-group-inline">
                  <div className="form-group">
                    <label htmlFor="subEventDate">Fecha*</label>
                    <input id="subEventDate" type="date" value={newSubEvent.date} onChange={(e) => setNewSubEvent({...newSubEvent, date: e.target.value})} min={eventData.date.start?.split('T')[0]} max={eventData.date.end?.split('T')[0]}/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subEventTime">Hora*</label>
                    <input id="subEventTime" type="time" value={newSubEvent.time} onChange={(e) => setNewSubEvent({...newSubEvent, time: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subEventLocation">Ubicación*</label>
                  <input id="subEventLocation" type="text" placeholder="Lugar específico (ej. Sala B)" value={newSubEvent.location} onChange={(e) => setNewSubEvent({...newSubEvent, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label htmlFor="subEventDuration">Duración*</label>
                  <input id="subEventDuration" type="text" placeholder="Ej: 1h 30m, 45min" value={newSubEvent.duration} onChange={(e) => setNewSubEvent({...newSubEvent, duration: e.target.value})} />
                </div>
                <button type="button" onClick={addSubEvent} className="button-secondary add-sub-event-btn">
                  <PlusIcon /> Añadir Sub-Evento
                </button>
              </div>
            </div>

            {/* Botón Guardar */}
            <button type="submit" className="save-event-btn button-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;

