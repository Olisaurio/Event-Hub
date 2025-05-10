import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import chroma from 'chroma-js';
import Sidebar from './sidebar';
import '../Components-styles/CreateEvent.css'; // Actualizado
import Header from './Header';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

const GalleryImageUploader = ({ images, previews, onImagesUpload, onImageRemove, error }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current?.click();
    return (
        <div className={`gallery-uploader form-group ${error ? 'error' : ''}`}>
            <label htmlFor="galleryUploadInput">Imágenes de Galería* (Mínimo 5)</label>
            <p className="section-description">Sube al menos 5 imágenes adicionales para mostrar en la galería del evento.</p>
            <div className="gallery-previews-container">
                {previews.map((preview, index) => (
                    <div key={index} className="gallery-preview-item">
                        <img src={preview} alt={`Galería ${index + 1}`} className="gallery-image-preview" />
                        <button
                            type="button"
                            className="remove-gallery-image-btn"
                            onClick={() => onImageRemove(index)}
                            aria-label={`Eliminar imagen de galería ${index + 1}`}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" className="add-gallery-image-btn button-secondary" onClick={handleButtonClick}>
                <PlusIcon />
                <span>Añadir Imagen(es)</span>
            </button>
            <input
                id="galleryUploadInput"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onImagesUpload}
                style={{ display: 'none' }}
            />
            {error && <span className="error-message">{error}</span>}
            <span className="image-count-indicator">{images.length} imagen(es) subida(s)</span>
        </div>
    );
};

const categoryColors = {
    "Música": "#88C0D0", "Arte y Cultura": "#EBCB8B", "Comida y Bebida": "#A3BE8C",
    "Deportes": "#D08770", "Negocios": "#5E81AC", "Tecnología": "#B48EAD",
    "Aire Libre": "#A3BE8C", "Comunidad": "#EBCB8B", "Familia": "#88C0D0",
    "Cine": "#BF616A", "Moda": "#B48EAD", "Educación": "#5E81AC",
    "Salud y Bienestar": "#A3BE8C", "Otros": "#D8DEE9"
};

const categoryOptions = Object.keys(categoryColors).map(category => ({
    value: category, label: category, color: categoryColors[category] || '#ECEFF4'
}));

const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white', borderColor: '#D8DEE9' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled ? null : isSelected ? data.color : isFocused ? color.alpha(0.1).css() : null,
      color: isDisabled ? '#ccc' : isSelected ? (chroma.contrast(color, 'white') > 2 ? 'white' : 'black') : data.color,
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':active': { ...styles[':active'], backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()) },
    };
  },
  multiValue: (styles, { data }) => ({ ...styles, backgroundColor: chroma(data.color).alpha(0.1).css() }),
  multiValueLabel: (styles, { data }) => ({ ...styles, color: data.color }),
  multiValueRemove: (styles, { data }) => ({ ...styles, color: data.color, ':hover': { backgroundColor: data.color, color: 'white' } }),
};

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

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    eventName: '', description: '',
    location: { department: '', city: '', address: '', type: 'presencial', latitude: null, longitude: null }, 
    date: { start: '', end: '' },
    type: 'simple', privacy: 'public',
    ticketType: 'free', price: { amount: '', currency: 'USD' },
    maxAttendees: '', occupiedTickets: '', 
    subEvents: [], categories: [],
    mainImages: [null, null], galleryImages: [], 
  });

  const [mainMediaPreviews, setMainMediaPreviews] = useState([null, null]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', time: '', location: '', duration: '' });
  const [mapPosition, setMapPosition] = useState(null);

  const [locationsData, setLocationsData] = useState([]);
  const [citiesForSelectedDepartment, setCitiesForSelectedDepartment] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:3001/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        setLocationsData(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setErrors(prev => ({ ...prev, general: ['Error al cargar datos de ubicación.'] }));
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (eventData.location.department) {
      const department = locationsData.find(loc => loc.department === eventData.location.department);
      setCitiesForSelectedDepartment(department ? department.cities : []);
    } else {
      setCitiesForSelectedDepartment([]);
    }
  }, [eventData.location.department, locationsData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const targetValue = type === 'checkbox' ? checked : value;
    const errorKey = name.includes('.') ? name.split('.')[0] : name;
    
    if (errors[errorKey] || (name.includes('.') && errors[name.split('.')[1]])) {
      setErrors(prev => { 
          const newErrors = {...prev};
          delete newErrors[errorKey];
          if(name === 'price.amount') delete newErrors.amount;
          if(name === 'date.start') delete newErrors.start;
          if(name === 'location.address') delete newErrors.address;
          if(name === 'location.department') delete newErrors.department;
          if(name === 'location.city') delete newErrors.city;
          if (errorKey === 'mainImages') delete newErrors.mainImages;
          if (errorKey === 'galleryImages') delete newErrors.galleryImages;
          if (name === 'maxAttendees') delete newErrors.maxAttendees;
          if (name === 'occupiedTickets') delete newErrors.occupiedTickets;
          return newErrors;
      });
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEventData(prev => {
        const updatedParent = { ...prev[parent], [child]: targetValue };
        if (name === 'location.department') {
          updatedParent.city = ''; 
        }
        return { ...prev, [parent]: updatedParent };
      });
    } else {
      setEventData(prev => ({ ...prev, [name]: targetValue }));
    }
  };

  const handleReactSelectCategoryChange = (selectedOptions) => {
      const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
      if (errors.categories) setErrors(prev => ({ ...prev, categories: undefined }));
      setEventData(prev => ({ ...prev, categories: selectedValues }));
  };

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

  const processMediaFile = (file) => {
      return new Promise((resolve, reject) => {
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');
          if (!isImage && !isVideo) return reject('Tipo de archivo no válido (solo imagen o video).');
          const maxSize = 50 * 1024 * 1024;
          if (file.size > maxSize) return reject(`Archivo demasiado grande (Max 50MB).`);
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
                      resolve({ type: 'image', url: compressedBase64, originalFile: file });
                  };
                  img.onerror = () => reject('Error al cargar la imagen para compresión.');
                  img.src = dataUrl;
              } else if (isVideo) {
                  resolve({ type: 'video', url: dataUrl, originalFile: file });
              }
          };
          reader.onerror = () => reject('Error al leer el archivo.');
          reader.readAsDataURL(file);
      });
  };

  const handleMainMediaUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const processedMedia = await processMediaFile(file);
      setMainMediaPreviews(prev => prev.map((item, i) => i === index ? { url: processedMedia.url, type: processedMedia.type } : item));
      setEventData(prev => ({ ...prev, mainImages: prev.mainImages.map((item, i) => i === index ? processedMedia.url : item) }));
      setErrors(prev => ({ ...prev, [`mainImage${index}`]: undefined, mainImages: undefined }));
    } catch (errorMsg) {
      setErrors(prev => ({ ...prev, [`mainImage${index}`]: errorMsg, mainImages: errorMsg }));
      setMainMediaPreviews(prev => prev.map((item, i) => i === index ? null : item));
      setEventData(prev => ({ ...prev, mainImages: prev.mainImages.map((item, i) => i === index ? null : item) }));
    }
  };

  const handleMainMediaRemove = (index) => {
    setMainMediaPreviews(prev => prev.map((item, i) => i === index ? null : item));
    setEventData(prev => ({ ...prev, mainImages: prev.mainImages.map((item, i) => i === index ? null : item) }));
  };

  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = [];
    const newImageData = [];
    let galleryError = null;

    for (const file of files) {
        try {
            const processedMedia = await processMediaFile(file);
            if (processedMedia.type !== 'image') {
                galleryError = 'Solo se permiten imágenes en la galería.';
                continue; // Saltar videos para la galería
            }
            newPreviews.push(processedMedia.url);
            newImageData.push(processedMedia.url);
        } catch (errorMsg) {
            galleryError = errorMsg;
            // No añadir si hay error con este archivo
        }
    }

    setGalleryImagePreviews(prev => [...prev, ...newPreviews]);
    setEventData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newImageData] }));
    if (galleryError) {
        setErrors(prev => ({ ...prev, galleryImages: galleryError }));
    } else if (errors.galleryImages) {
        setErrors(prev => ({ ...prev, galleryImages: undefined }));
    }
  };

  const handleGalleryImageRemove = (index) => {
    setGalleryImagePreviews(prev => prev.filter((_, i) => i !== index));
    setEventData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.eventName.trim()) newErrors.eventName = 'El nombre del evento es requerido.';
    if (!eventData.description.trim()) newErrors.description = 'La descripción es requerida.';
    if (!eventData.location.department) newErrors.department = 'El departamento es requerido.';
    if (!eventData.location.city) newErrors.city = 'La ciudad es requerida.';
    if (!eventData.location.address.trim()) newErrors.address = 'La dirección es requerida.';
    if (!eventData.date.start) newErrors.start = 'La fecha de inicio es requerida.';
    if (eventData.date.end && new Date(eventData.date.end) < new Date(eventData.date.start)) newErrors.end = 'La fecha de fin no puede ser anterior a la de inicio.';
    if (eventData.ticketType === 'paid' && (!eventData.price.amount || parseFloat(eventData.price.amount) <= 0)) newErrors.amount = 'El precio debe ser mayor a cero para eventos de pago.';
    if (eventData.maxAttendees && (isNaN(parseInt(eventData.maxAttendees)) || parseInt(eventData.maxAttendees) < 0)) newErrors.maxAttendees = 'La capacidad máxima debe ser un número positivo.';
    if (eventData.occupiedTickets && (isNaN(parseInt(eventData.occupiedTickets)) || parseInt(eventData.occupiedTickets) < 0)) newErrors.occupiedTickets = 'Las entradas ocupadas deben ser un número positivo.';
    if (eventData.occupiedTickets && eventData.maxAttendees && parseInt(eventData.occupiedTickets) > parseInt(eventData.maxAttendees)) newErrors.occupiedTickets = 'Las entradas ocupadas no pueden exceder la capacidad máxima.';
    if (eventData.categories.length === 0) newErrors.categories = 'Seleccione al menos una categoría.';
    if (!eventData.mainImages[0] && !eventData.mainImages[1]) newErrors.mainImages = 'Suba al menos un medio principal (imagen o video).';
    else if (!eventData.mainImages[0] && eventData.mainImages[1]) newErrors.mainImages = 'El primer medio principal es obligatorio si se sube el segundo.';
    if (eventData.galleryImages.length < 5) newErrors.galleryImages = 'Suba al menos 5 imágenes para la galería.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Por favor, corrija los errores en el formulario.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = { ...eventData };
      // Asegurar que los campos numéricos sean números
      if (payload.price.amount) payload.price.amount = parseFloat(payload.price.amount);
      if (payload.maxAttendees) payload.maxAttendees = parseInt(payload.maxAttendees);
      if (payload.occupiedTickets) payload.occupiedTickets = parseInt(payload.occupiedTickets);
      else payload.occupiedTickets = 0; // Default a 0 si está vacío

      // Filtrar mainImages nulos antes de enviar
      payload.mainImages = payload.mainImages.filter(img => img !== null);

      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status} al crear el evento.`);
      }
      const createdEvent = await response.json();
      alert('Evento creado exitosamente!');
      navigate(`/event/${createdEvent.id}`);
    } catch (error) {
      console.error("Error al crear evento:", error);
      setErrors(prev => ({ ...prev, general: [error.message] }));
      alert(`Error al crear el evento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content create-event-page">
        <Header />
        <form onSubmit={handleSubmit} className="create-event-form" noValidate>
          <h1>Crear Nuevo Evento</h1>
          {errors.general && errors.general.map((err, i) => <p key={i} className="error-message general-error">{err}</p>)}

          <div className="form-section">
            <h2>Información Principal</h2>
            <div className="form-group">
              <label htmlFor="eventName">Nombre del Evento*</label>
              <input type="text" id="eventName" name="eventName" value={eventData.eventName} onChange={handleInputChange} required />
              {errors.eventName && <span className="error-message">{errors.eventName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción*</label>
              <textarea id="description" name="description" value={eventData.description} onChange={handleInputChange} rows="5" required></textarea>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          <div className="form-section media-section">
            <h2>Medios del Evento</h2>
            <p className="section-description">Sube al menos una imagen o video principal y 5 imágenes para la galería.</p>
            <div className="main-media-grid">
                <MainMediaUploader index={0} mediaPreview={mainMediaPreviews[0]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleMainMediaRemove} error={errors.mainImage0 || errors.mainImages} />
                <MainMediaUploader index={1} mediaPreview={mainMediaPreviews[1]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleMainMediaRemove} error={errors.mainImage1} />
            </div>
            <GalleryImageUploader images={eventData.galleryImages} previews={galleryImagePreviews} onImagesUpload={handleGalleryImagesUpload} onImageRemove={handleGalleryImageRemove} error={errors.galleryImages} />
          </div>

          <div className="form-section">
            <h2>Categorías*</h2>
            <Select
              isMulti name="categories" options={categoryOptions} className="basic-multi-select" classNamePrefix="select"
              onChange={handleReactSelectCategoryChange} styles={colourStyles} placeholder="Seleccione categorías..."
              value={categoryOptions.filter(option => eventData.categories.includes(option.value))}
            />
            {errors.categories && <span className="error-message">{errors.categories}</span>}
          </div>

          <div className="form-section">
            <h2>Fecha y Hora*</h2>
            <div className="form-group-inline">
              <div className="form-group">
                <label htmlFor="date.start">Inicio del Evento*</label>
                <input type="datetime-local" id="date.start" name="date.start" value={eventData.date.start} onChange={handleInputChange} required />
                {errors.start && <span className="error-message">{errors.start}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="date.end">Fin del Evento (Opcional)</label>
                <input type="datetime-local" id="date.end" name="date.end" value={eventData.date.end} onChange={handleInputChange} min={eventData.date.start} />
                {errors.end && <span className="error-message">{errors.end}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Ubicación*</h2>
            <div className="form-group">
                <label htmlFor="location.type">Tipo de Ubicación*</label>
                <select id="location.type" name="location.type" value={eventData.location.type} onChange={handleInputChange}>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                    <option value="hibrido">Híbrido</option>
                </select>
            </div>
            {eventData.location.type !== 'online' && (
                <>
                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="location.department">Departamento*</label>
                            <select id="location.department" name="location.department" value={eventData.location.department} onChange={handleInputChange} required>
                                <option value="">Seleccione un departamento</option>
                                {locationsData.map(loc => <option key={loc.department} value={loc.department}>{loc.department}</option>)}
                            </select>
                            {errors.department && <span className="error-message">{errors.department}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="location.city">Ciudad*</label>
                            <select id="location.city" name="location.city" value={eventData.location.city} onChange={handleInputChange} required disabled={!eventData.location.department || citiesForSelectedDepartment.length === 0}>
                                <option value="">Seleccione una ciudad</option>
                                {citiesForSelectedDepartment.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                            {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="location.address">Dirección / Enlace*</label>
                        <input type="text" id="location.address" name="location.address" value={eventData.location.address} onChange={handleInputChange} required placeholder={eventData.location.type === 'online' ? 'Enlace del evento online' : 'Dirección del lugar'} />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>
                    <div className="form-group map-group">
                        <label>Marcar en el Mapa (Opcional)</label>
                        <button type="button" className="button-secondary geolocate-btn" onClick={handleGeolocate} disabled={isLoading}><LocationIcon /> Usar mi ubicación actual</button>
                        <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={mapPosition} />
                    </div>
                </>
            )}
            {eventData.location.type === 'online' && (
                 <div className="form-group">
                    <label htmlFor="location.address">Enlace del Evento Online*</label>
                    <input type="url" id="location.address" name="location.address" value={eventData.location.address} onChange={handleInputChange} required placeholder="https://ejemplo.com/evento" />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
            )}
          </div>

          <div className="form-section">
            <h2>Entradas y Capacidad</h2>
            <div className="form-group-inline">
                <div className="form-group">
                    <label htmlFor="ticketType">Tipo de Entrada*</label>
                    <select id="ticketType" name="ticketType" value={eventData.ticketType} onChange={handleInputChange}>
                        <option value="free">Gratuita</option>
                        <option value="paid">De Pago</option>
                    </select>
                </div>
                {eventData.ticketType === 'paid' && (
                    <div className="form-group">
                        <label htmlFor="price.amount">Precio*</label>
                        <input type="number" id="price.amount" name="price.amount" value={eventData.price.amount} onChange={handleInputChange} placeholder="Ej: 10000" min="0.01" step="0.01" />
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                    </div>
                )}
            </div>
            <div className="form-group-inline">
                <div className="form-group">
                    <label htmlFor="maxAttendees">Capacidad Máxima (Opcional)</label>
                    <input type="number" id="maxAttendees" name="maxAttendees" value={eventData.maxAttendees} onChange={handleInputChange} placeholder="Ej: 100" min="0" />
                    {errors.maxAttendees && <span className="error-message">{errors.maxAttendees}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="occupiedTickets">Entradas Ocupadas (Opcional)</label>
                    <input type="number" id="occupiedTickets" name="occupiedTickets" value={eventData.occupiedTickets} onChange={handleInputChange} placeholder="Ej: 20" min="0" />
                    {errors.occupiedTickets && <span className="error-message">{errors.occupiedTickets}</span>}
                </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Detalles Adicionales</h2>
            <div className="form-group-inline">
                <div className="form-group">
                    <label htmlFor="type">Tipo de Evento*</label>
                    <select id="type" name="type" value={eventData.type} onChange={handleInputChange}>
                        <option value="simple">Simple</option>
                        <option value="conferencia">Conferencia</option>
                        <option value="taller">Taller</option>
                        <option value="concierto">Concierto</option>
                        <option value="festival">Festival</option>
                        <option value="deportivo">Deportivo</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="privacy">Privacidad*</label>
                    <select id="privacy" name="privacy" value={eventData.privacy} onChange={handleInputChange}>
                        <option value="public">Público</option>
                        <option value="private">Privado</option>
                    </select>
                </div>
            </div>
          </div>

          {eventData.type !== 'simple' && (
            <div className="form-section sub-events-section">
              <h2>Agenda / Sub-Eventos (Opcional)</h2>
              <p className="section-description">Añade los diferentes segmentos o actividades de tu evento si es complejo (ej. charlas de una conferencia).</p>
              {eventData.subEvents.map((sub, index) => (
                <div key={sub.id || index} className="sub-event-item">
                  <span>{sub.name} - {sub.date} {sub.time} @ {sub.location} ({sub.duration})</span>
                  <button type="button" onClick={() => removeSubEvent(sub.id || index)} className="remove-sub-event-btn">&times;</button>
                </div>
              ))}
              <div className="add-sub-event-form">
                <input type="text" placeholder="Nombre del Sub-Evento" value={newSubEvent.name} onChange={(e) => setNewSubEvent(prev => ({ ...prev, name: e.target.value }))} />
                <input type="date" value={newSubEvent.date} onChange={(e) => setNewSubEvent(prev => ({ ...prev, date: e.target.value }))} />
                <input type="time" value={newSubEvent.time} onChange={(e) => setNewSubEvent(prev => ({ ...prev, time: e.target.value }))} />
                <input type="text" placeholder="Ubicación (ej. Salón A)" value={newSubEvent.location} onChange={(e) => setNewSubEvent(prev => ({ ...prev, location: e.target.value }))} />
                <input type="text" placeholder="Duración (ej. 45 min)" value={newSubEvent.duration} onChange={(e) => setNewSubEvent(prev => ({ ...prev, duration: e.target.value }))} />
                <button type="button" onClick={addSubEvent} className="button-secondary add-sub-event-btn">Añadir Sub-Evento</button>
              </div>
            </div>
          )}

          <button type="submit" className="submit-event-btn button-primary" disabled={isLoading}>
            {isLoading ? <div className="loading-spinner-small"></div> : null}
            {isLoading ? "Creando Evento..." : "Crear Evento"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

