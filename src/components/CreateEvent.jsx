import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import chroma from 'chroma-js';
import Sidebar from './sidebar';
import '../Components-styles/CreateEvent.css';
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

const CLOUDINARY_CLOUD_NAME = 'diyOflmyp';
const CLOUDINARY_UPLOAD_PRESET = 'EventHub';

const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const uploadToCloudinary = async (file, resourceType = "image") => {
  try {
    let fileToUpload = file;

    // Solo comprimir si es imagen
    if (resourceType === "image") {
      fileToUpload = await compressImage(file);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", "EventHub");

    const response = await fetch(`https://api.cloudinary.com/v1_1/diy0flmyp/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error data:", errorData);
      throw new Error(errorData.error.message || "Error al subir a Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error en la subida a Cloudinary:", error);
    throw error;
  }
};

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

const MainMediaUploader = ({ index, mediaFile, onMediaUpload, onMediaRemove, error }) => {
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
      <label htmlFor={`mainMediaUploadInput-${index}`}>Medio Principal {index + 1}* (Imagen o Video MP4)</label>
      <div className="media-preview-container" onClick={handleButtonClick}>
        {mediaFile && mediaFile.localPreviewUrl ? (
          <>
            {mediaFile.type.startsWith('image/') ? (
              <img src={mediaFile.localPreviewUrl} alt={`Vista previa ${index + 1}`} className="uploaded-media" />
            ) : mediaFile.type.startsWith('video/') ? (
              <video src={mediaFile.localPreviewUrl} controls className="uploaded-media" />
            ) : null}
            <button type="button" className="remove-media-btn" onClick={handleRemoveClick} aria-label={`Eliminar ${index + 1}`}>&times;</button>
          </>
        ) : (
          <div className="placeholder-media">
            <UploadIcon />
            <span>Seleccionar Imagen o Video MP4 {index + 1}*</span>
          </div>
        )}
      </div>
      <input 
        id={`mainMediaUploadInput-${index}`} 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,video/mp4" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

const GalleryImageUploader = ({ galleryFiles, onImagesUpload, onImageRemove, error }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current?.click();
    return (
        <div className={`gallery-uploader form-group ${error ? 'error' : ''}`}>
            <label htmlFor="galleryUploadInput">Imágenes de Galería* (Mínimo 5, Máximo 12)</label>
            <p className="section-description">Sube entre 5 y 12 imágenes adicionales para mostrar en la galería del evento.</p>
            <div className="gallery-previews-container">
                {galleryFiles.map((file, index) => (
                    file.localPreviewUrl && (
                        <div key={index} className="gallery-preview-item">
                            <img src={file.localPreviewUrl} alt={`Galería ${index + 1}`} className="gallery-image-preview" />
                            <button
                                type="button"
                                className="remove-gallery-image-btn"
                                onClick={() => onImageRemove(index)}
                                aria-label={`Eliminar imagen de galería ${index + 1}`}
                            >
                                &times;
                            </button>
                        </div>
                    )
                ))}
            </div>
            <button type="button" className="add-gallery-image-btn button-secondary" onClick={handleButtonClick}  disabled={galleryFiles.length >= 12}>
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
            <span className="image-count-indicator">{galleryFiles.length} imagen(es) subida(s)</span>
        </div>
    );
};

const OptionalVideoUploader = ({ videoFile, onVideoUpload, onVideoRemove, error }) => {
    const fileInputRef = useRef(null);
    const handleButtonClick = () => fileInputRef.current?.click();
    const handleFileChange = (e) => onVideoUpload(e);
    const handleRemoveClick = (e) => {
        e.stopPropagation();
        onVideoRemove();
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className={`media-upload-slot video-slot ${error ? 'error' : ''}`}>
            <label htmlFor="optionalVideoUploadInput">Video Promocional (Opcional, MP4)</label>
            <div className="media-preview-container" onClick={handleButtonClick}>
                {videoFile && videoFile.localPreviewUrl ? (
                    <>
                        <video src={videoFile.localPreviewUrl} controls className="uploaded-media" />
                        <button type="button" className="remove-media-btn" onClick={handleRemoveClick} aria-label="Eliminar video">&times;</button>
                    </>
                ) : (
                    <div className="placeholder-media">
                        <UploadIcon />
                        <span>Seleccionar Video MP4</span>
                    </div>
                )}
            </div>
            <input 
                id="optionalVideoUploadInput" 
                ref={fileInputRef} 
                type="file" 
                accept="video/mp4" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
            />
            {error && <span className="error-message">{error}</span>}
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
const categoryOptions = Object.keys(categoryColors).map(category => ({ value: category, label: category, color: categoryColors[category] || '#ECEFF4' }));
const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white', borderColor: '#D8DEE9' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return { ...styles, backgroundColor: isDisabled ? null : isSelected ? data.color : isFocused ? color.alpha(0.1).css() : null, color: isDisabled ? '#ccc' : isSelected ? (chroma.contrast(color, 'white') > 2 ? 'white' : 'black') : data.color, cursor: isDisabled ? 'not-allowed' : 'default', ':active': { ...styles[':active'], backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css()) }, };
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
    const ChangeView = ({ center, zoom }) => { const map = useMap(); useEffect(() => { if (center) map.setView(center, zoom); }, [center, zoom, map]); return null; };
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
    title: '', description: '',
    location: { address: '', type: 'Presencial', latitude: null, longitude: null }, 
    start: '', end: '',
    type: 'simple', 
    privacy: 'Público',
    ticketType: 'free', price: { amount: '', currency: 'COP' }, 
    maxAttendees: '', 
    categories: [],
    mainImageFiles: [null, null], 
    galleryImageFiles: [], 
    videoFile: null, 
    subEvents: [],
    otherData: { organizer: '', contact: '', notes: '' },
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSubEvent, setNewSubEvent] = useState({ name: '', date: '', time: '', location: '', duration: '' });
  const [mapPosition, setMapPosition] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const targetValue = type === 'checkbox' ? checked : value;
    const keys = name.split('.');
    
    setErrors(prev => {
        const newErrors = {...prev};
        if (keys.length === 1) delete newErrors[keys[0]];
        else if (keys.length === 2 && newErrors[keys[0]]) delete newErrors[keys[0]][keys[1]]; 
        else if (keys.length === 2) delete newErrors[keys[0]];
        return newErrors;
    });

    if (keys.length > 1) {
        setEventData(prev => {
            const newEventData = { ...prev };
            let currentLevel = newEventData;
            for (let i = 0; i < keys.length - 1; i++) {
                currentLevel[keys[i]] = { ...currentLevel[keys[i]] }; 
                currentLevel = currentLevel[keys[i]];
            }
            currentLevel[keys[keys.length - 1]] = targetValue;
            return newEventData;
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

  const processAndStoreFile = (file, isVideoOnly = false, isImageOnly = false) => {
    return new Promise((resolve, reject) => {
        const fileType = file.type;
        if (isVideoOnly && !fileType.startsWith('video/mp4')) return reject('Solo se permiten videos MP4.');
        if (isImageOnly && !fileType.startsWith('image/')) return reject('Solo se permiten imágenes.');
        if (!isVideoOnly && !isImageOnly && !fileType.startsWith('image/') && !fileType.startsWith('video/mp4')) {
            return reject('Tipo de archivo no válido (solo imagen o video MP4).');
        }
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) return reject(`Archivo demasiado grande (Max 50MB).`);
        
        const localPreviewUrl = URL.createObjectURL(file);
        resolve({ file, localPreviewUrl, type: fileType });
    });
  };

  const handleMainMediaUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const processed = await processAndStoreFile(file);
      setEventData(prev => {
        const newMainImageFiles = [...prev.mainImageFiles];
        newMainImageFiles[index] = processed;
        return { ...prev, mainImageFiles: newMainImageFiles };
      });
      setErrors(prev => ({ ...prev, [`mainImage${index}`]: undefined, mainImages: undefined }));
    } catch (errorMsg) {
      setErrors(prev => ({ ...prev, [`mainImage${index}`]: String(errorMsg), mainImages: String(errorMsg) }));
    }
  };

  const handleMainMediaRemove = (index) => {
    setEventData(prev => {
      const newMainImageFiles = [...prev.mainImageFiles];
      if(newMainImageFiles[index] && newMainImageFiles[index].localPreviewUrl) {
        URL.revokeObjectURL(newMainImageFiles[index].localPreviewUrl);
      }
      newMainImageFiles[index] = null;
      return { ...prev, mainImageFiles: newMainImageFiles };
    });
  };

  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (eventData.galleryImageFiles.length + files.length > 12) {
        setErrors(prev => ({ ...prev, galleryImages: 'No puede subir más de 12 imágenes en total para la galería.' }));
        return;
    }
    let galleryError = null;
    const newImageFiles = [];
    for (const file of files) {
        try {
            const processed = await processAndStoreFile(file, false, true); // Image only
            newImageFiles.push(processed);
        } catch (errorMsg) {
            galleryError = galleryError ? `${galleryError}\n${String(errorMsg)}` : String(errorMsg);
        }
    }
    setEventData(prev => ({ ...prev, galleryImageFiles: [...prev.galleryImageFiles, ...newImageFiles] }));
    if (galleryError) setErrors(prev => ({ ...prev, galleryImages: galleryError }));
    else if (errors.galleryImages) setErrors(prev => ({ ...prev, galleryImages: undefined }));
  };

  const handleGalleryImageRemove = (index) => {
    setEventData(prev => {
      const newGalleryImageFiles = [...prev.galleryImageFiles];
      if(newGalleryImageFiles[index] && newGalleryImageFiles[index].localPreviewUrl) {
        URL.revokeObjectURL(newGalleryImageFiles[index].localPreviewUrl);
      }
      newGalleryImageFiles.splice(index, 1);
      return { ...prev, galleryImageFiles: newGalleryImageFiles };
    });
  };

  const handleOptionalVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const processed = await processAndStoreFile(file, true); // Video only (MP4)
      setEventData(prev => ({ ...prev, videoFile: processed }));
      setErrors(prev => ({ ...prev, video: undefined }));
    } catch (errorMsg) {
      setErrors(prev => ({ ...prev, video: String(errorMsg) }));
    }
  };

  const handleOptionalVideoRemove = () => {
    setEventData(prev => {
      if (prev.videoFile && prev.videoFile.localPreviewUrl) {
        URL.revokeObjectURL(prev.videoFile.localPreviewUrl);
      }
      return { ...prev, videoFile: null };
    });
  };

  useEffect(() => {
    return () => {
        eventData.mainImageFiles.forEach(item => item && item.localPreviewUrl && URL.revokeObjectURL(item.localPreviewUrl));
        eventData.galleryImageFiles.forEach(item => item.localPreviewUrl && URL.revokeObjectURL(item.localPreviewUrl));
        if (eventData.videoFile && eventData.videoFile.localPreviewUrl) {
            URL.revokeObjectURL(eventData.videoFile.localPreviewUrl);
        }
    };
  }, [eventData.mainImageFiles, eventData.galleryImageFiles, eventData.videoFile]);

  const validateForm = () => {
    const newErrors = {};
    if (!eventData.title.trim()) newErrors.title = 'El nombre del evento es requerido.';
    if (!eventData.description.trim()) newErrors.description = 'La descripción es requerida.';
    if (!eventData.location.address.trim()) newErrors.address = 'La dirección es requerida.';
    // Validation for location.type removed as the input is removed and it defaults to 'Presencial'
    if (!eventData.start) newErrors.start = 'La fecha de inicio es requerida.';
    if (eventData.end && new Date(eventData.end) < new Date(eventData.start)) newErrors.end = 'La fecha de fin no puede ser anterior a la de inicio.';
    if (eventData.ticketType === 'Pago' && (!eventData.price.amount || parseFloat(eventData.price.amount) <= 0)) newErrors.amount = 'El precio debe ser mayor a cero para eventos de pago.';
    if (eventData.maxAttendees && (isNaN(parseInt(eventData.maxAttendees)) || parseInt(eventData.maxAttendees) < 0)) newErrors.maxAttendees = 'La capacidad máxima debe ser un número positivo.';
    if (eventData.categories.length === 0) newErrors.categories = 'Seleccione al menos una categoría.';
    
    const activeMainImages = eventData.mainImageFiles.filter(img => img !== null && img.file);
    if (activeMainImages.length === 0) newErrors.mainImages = 'Suba al menos un medio principal (imagen o video MP4).';

    if (eventData.galleryImageFiles.length < 5) newErrors.galleryImages = 'Suba al menos 5 imágenes para la galería.';
    else if (eventData.galleryImageFiles.length > 12) newErrors.galleryImages = 'No puede subir más de 12 imágenes para la galería.';
    
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
      const uploadedMainImages = [];
      for (const item of eventData.mainImageFiles) {
        if (item && item.file) {
          const resourceType = item.type.startsWith('image/') ? 'image' : 'video';
          const url = await uploadToCloudinary(item.file, resourceType);
          uploadedMainImages.push({
            url: url,
            description: "Imagen principal del evento",
            uploadedAt: new Date().toISOString(),
            mediaType: resourceType
          });
        }
      }

      const uploadedGalleryImages = [];
      for (const item of eventData.galleryImageFiles) {
        if (item.file) {
          const url = await uploadToCloudinary(item.file, 'image');
          uploadedGalleryImages.push({
            url: url,
            description: "Vista del lugar",
            uploadedAt: new Date().toISOString(),
            mediaType: 'image'
          });
        }
      }

      const uploadedVideos = [];
      if (eventData.videoFile && eventData.videoFile.file) {
        const url = await uploadToCloudinary(eventData.videoFile.file, 'video');
        uploadedVideos.push({
          url: url,
          description: "Video promocional",
          uploadedAt: new Date().toISOString(),
          mediaType: 'video'
        });
      }

      const payload = {
        title: eventData.title,
        description: eventData.description,
        location: {
            address: eventData.location.address,
            type: eventData.location.type, // Will be 'Presencial' by default
            latitude: eventData.location.latitude,
            longitude: eventData.location.longitude,
        },
        start: eventData.start ? new Date(eventData.start).toISOString() : null,
        end: eventData.end ? new Date(eventData.end).toISOString() : null,
        ticketType: eventData.ticketType,
        type: eventData.type, 
        privacy: eventData.privacy,
        price: eventData.ticketType === 'Pago' ? { 
            amount: parseFloat(eventData.price.amount),
            currency: eventData.price.currency 
        } : undefined,
        maxAttendees: eventData.maxAttendees ? parseInt(eventData.maxAttendees) : undefined,
        categories: eventData.categories,
        mainImages: uploadedMainImages,
        galleryImages: uploadedGalleryImages,
        videos: uploadedVideos,
        otherData: eventData.otherData,
        subeventIds: eventData.subEvents.map(sub => sub.id) 
      };
      
      if (!payload.price) delete payload.price;
      if (payload.maxAttendees === undefined) delete payload.maxAttendees;

      console.log("Payload to send:", JSON.stringify(payload, null, 2));

      const response = await fetch('http://localhost:8070/api/events', { 
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
      setErrors(prev => ({ ...prev, general: [String(error.message)] }));
      alert(`Error al crear el evento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addSubEvent = () => { /* ... existing code ... */ };
  const removeSubEvent = (id) => { /* ... existing code ... */ };

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
              <label htmlFor="title">Nombre del Evento*</label>
              <input type="text" id="title" name="title" value={eventData.title} onChange={handleInputChange} required />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="description">Descripción*</label>
              <textarea id="description" name="description" value={eventData.description} onChange={handleInputChange} rows="5" required></textarea>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
             <div className="form-group">
              <label htmlFor="type">Tipo de Evento* (ej: Concierto, Conferencia)</label>
              <input type="text" id="type" name="type" value={eventData.type} onChange={handleInputChange} required />
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>
          </div>

          <div className="form-section media-section">
            <h2>Medios del Evento</h2>
            <p className="section-description">Sube al menos una imagen o video MP4 principal y entre 5 y 12 imágenes para la galería.</p>
            <div className="main-media-grid">
                <MainMediaUploader index={0} mediaFile={eventData.mainImageFiles[0]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleMainMediaRemove} error={errors.mainImage0 || errors.mainImages} />
                <MainMediaUploader index={1} mediaFile={eventData.mainImageFiles[1]} onMediaUpload={handleMainMediaUpload} onMediaRemove={handleMainMediaRemove} error={errors.mainImage1} />
            </div>
            <GalleryImageUploader galleryFiles={eventData.galleryImageFiles} onImagesUpload={handleGalleryImagesUpload} onImageRemove={handleGalleryImageRemove} error={errors.galleryImages} />
            <OptionalVideoUploader videoFile={eventData.videoFile} onVideoUpload={handleOptionalVideoUpload} onVideoRemove={handleOptionalVideoRemove} error={errors.video} />
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
                <label htmlFor="start">Inicio del Evento*</label>
                <input type="datetime-local" id="start" name="start" value={eventData.start} onChange={handleInputChange} required />
                {errors.start && <span className="error-message">{errors.start}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="end">Fin del Evento (Opcional)</label>
                <input type="datetime-local" id="end" name="end" value={eventData.end} onChange={handleInputChange} min={eventData.start} />
                {errors.end && <span className="error-message">{errors.end}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Ubicación*</h2>
            {/* Input for location.type removed, it defaults to 'Presencial' and is sent in payload */}
            <div className="form-group">
                <label htmlFor="location.address">Dirección Completa*</label>
                <input type="text" id="location.address" name="location.address" value={eventData.location.address} onChange={handleInputChange} required placeholder="Ej: Plaza Central, Calle 1 # 2-3, Ciudad XYZ" />
                {errors.address && <span className="error-message">{errors.address}</span>}
            </div>
            <div className="form-group map-group">
                <label>Marcar en el Mapa (Opcional para Lat/Lng)</label>
                <button type="button" className="button-secondary geolocate-btn" onClick={handleGeolocate} disabled={isLoading}><LocationIcon /> Usar mi ubicación actual</button>
                <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={mapPosition} />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Información Adicional (Organizador)</h2>
            <div className="form-group">
              <label htmlFor="otherData.organizer">Organizador</label>
              <input type="text" id="otherData.organizer" name="otherData.organizer" value={eventData.otherData.organizer} onChange={handleInputChange} />
              {errors.organizer && <span className="error-message">{errors.organizer}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="otherData.contact">Contacto (Email o Teléfono)</label>
              <input type="text" id="otherData.contact" name="otherData.contact" value={eventData.otherData.contact} onChange={handleInputChange} />
              {errors.contact && <span className="error-message">{errors.contact}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="otherData.notes">Notas Adicionales</label>
              <textarea id="otherData.notes" name="otherData.notes" value={eventData.otherData.notes} onChange={handleInputChange} rows="3"></textarea>
              {errors.notes && <span className="error-message">{errors.notes}</span>}
            </div>
          </div>

          <div className="form-section">
            <h2>Entradas y Privacidad</h2>
            <div className="form-group-inline">
                <div className="form-group">
                    <label htmlFor="ticketType">Tipo de Entrada*</label>
                    <select id="ticketType" name="ticketType" value={eventData.ticketType} onChange={handleInputChange}>
                        <option value="free">Gratuita</option>
                        <option value="Pago">De Pago</option>
                    </select>
                </div>
                {eventData.ticketType === 'Pago' && (
                    <>
                        <div className="form-group">
                            <label htmlFor="price.amount">Precio*</label>
                            <input type="number" id="price.amount" name="price.amount" value={eventData.price.amount} onChange={handleInputChange} min="0.01" step="0.01" required />
                            {errors.amount && <span className="error-message">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="price.currency">Moneda*</label>
                            <select id="price.currency" name="price.currency" value={eventData.price.currency} onChange={handleInputChange}>
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </>
                )}
            </div>
            <div className="form-group-inline">
                 <div className="form-group">
                    <label htmlFor="maxAttendees">Capacidad Máxima (Opcional)</label>
                    <input type="number" id="maxAttendees" name="maxAttendees" value={eventData.maxAttendees} onChange={handleInputChange} min="0" />
                    {errors.maxAttendees && <span className="error-message">{errors.maxAttendees}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="privacy">Privacidad*</label>
                    <select id="privacy" name="privacy" value={eventData.privacy} onChange={handleInputChange}>
                        <option value="Público">Público</option>
                        <option value="Privado">Privado</option>
                    </select>
                </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Sub-Eventos (Opcional)</h2>
            <p className="section-description">Añada los diferentes componentes o etapas de su evento.</p>
            {eventData.subEvents.map((sub, index) => (
              <div key={sub.id || index} className="sub-event-item">
                <p><strong>{sub.name}</strong> - {sub.date} {sub.time} ({sub.duration}) @ {sub.location}</p>
                <button type="button" onClick={() => removeSubEvent(sub.id)} className="button-danger-small">Eliminar</button>
              </div>
            ))}
            <div className="sub-event-form">
              <input type="text" placeholder="Nombre del Sub-Evento" value={newSubEvent.name} onChange={(e) => setNewSubEvent({ ...newSubEvent, name: e.target.value })} />
              <input type="date" value={newSubEvent.date} onChange={(e) => setNewSubEvent({ ...newSubEvent, date: e.target.value })} />
              <input type="time" value={newSubEvent.time} onChange={(e) => setNewSubEvent({ ...newSubEvent, time: e.target.value })} />
              <input type="text" placeholder="Ubicación" value={newSubEvent.location} onChange={(e) => setNewSubEvent({ ...newSubEvent, location: e.target.value })} />
              <input type="text" placeholder="Duración (ej: 2 horas)" value={newSubEvent.duration} onChange={(e) => setNewSubEvent({ ...newSubEvent, duration: e.target.value })} />
              <button type="button" onClick={addSubEvent} className="button-secondary">Añadir Sub-Evento</button>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={isLoading}>{isLoading ? 'Creando Evento...' : 'Crear Evento'}</button>
            <button type="button" className="button-secondary" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

