import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import '../Styles/CreateEvent.css';
import Header from './Header';

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
      currency: 'USD'  // Moneda por defecto
    },
    subEvents: [], // Nuevo campo para sub-eventos
    categories: [],
  });

  const [image, setImage] = useState(null);
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

    // Manejar cambios en campos anidados
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
      // Manejo de categorías
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
    // Validar que el sub-evento tenga todos los campos
    if (!newSubEvent.name || !newSubEvent.date || !newSubEvent.time || 
        !newSubEvent.location || !newSubEvent.duration) {
      alert('Por favor complete todos los campos del sub-evento');
      return;
    }

    // Verificar que la fecha del sub-evento esté dentro del rango del evento principal
    const mainEventStart = new Date(eventData.date.start);
    const subEventDate = new Date(newSubEvent.date);

    if (subEventDate < mainEventStart || 
        (eventData.date.end && subEventDate > new Date(eventData.date.end))) {
      alert('La fecha del sub-evento debe estar dentro de las fechas del evento principal');
      return;
    }

    setEventData(prev => ({
      ...prev,
      subEvents: [...prev.subEvents, {...newSubEvent, id: Date.now()}]
    }));

    // Resetear formulario de sub-evento
    setNewSubEvent({
      name: '',
      date: '',
      time: '',
      location: '',
      duration: ''
    });
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
        // Comprimir imagen
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
          setImage(compressedImage);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!eventData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    
    if (!eventData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!eventData.date.start) {
      newErrors.dateStart = 'Start date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones previas
    if (!validateForm()) return;

    // Preparar datos finales
    const finalEventData = {
      ...eventData,
      image: image,
      date: {
        start: eventData.date.start 
          ? new Date(eventData.date.start).toISOString() 
          : null,
        end: eventData.date.end 
          ? new Date(eventData.date.end).toISOString() 
          : null
      }
    };

    try {
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalEventData)
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Event created:', responseData);
        navigate('/EventHub');
      } else {
        const errorMessages = responseData.errors 
          ? responseData.errors.join(', ') 
          : responseData.message || 'Failed to create event';
        
        alert(errorMessages);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      alert('Network or server error. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="create-event-container">
          <h1>Create an event</h1>
          <form onSubmit={handleSubmit}>
            {/* Campos de evento principal */}
            <div className="form-group">
              <label>Event name*</label>
              <input
                type="text"
                name="eventName"
                value={eventData.eventName}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description*</label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                required
              />
            </div>

            <div className="form-group">
              <label>Image gallery</label>
              <div className="image-upload">
                {image ? (
                  <img 
                    src={image} 
                    alt="Event" 
                    className="uploaded-image" 
                  />
                ) : (
                  <div className="placeholder-image">
                    No image uploaded
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="datetime-local"
                name="date.start"
                value={eventData.date.start}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="datetime-local"
                name="date.end"
                value={eventData.date.end}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location.address"
                value={eventData.location.address}
                onChange={handleInputChange}
                placeholder="Online, San Francisco etc."
              />
            </div>

            {/* Tickets */}
            <div className="form-group">
              <label>Tickets</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="ticketType"
                    value="free"
                    checked={eventData.ticketType === 'free'}
                    onChange={handleInputChange}
                  />
                  Free
                </label>
                <label>
                  <input
                    type="radio"
                    name="ticketType"
                    value="paid"
                    checked={eventData.ticketType === 'paid'}
                    onChange={handleInputChange}
                  />
                  Paid
                </label>
              </div>
            </div>

            {/* Mostrar precio solo si es un ticket de pago */}
            {eventData.ticketType === 'paid' && (
              <div className="form-group">
                <label>Ticket Price</label>
                <div className="price-input">
                  <input
                    type="number"
                    name="price.amount"
                    value={eventData.price.amount}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    min="0"
                  />
                  <select
                    name="price.currency"
                    value={eventData.price.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="COP">COP (Colombian Peso)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Sección de Sub-Eventos */}
            <div className="sub-events-section">
              <h2>Sub Events</h2>
              
              {/* Lista de Sub-Eventos Añadidos */}
              {eventData.subEvents.map((subEvent) => (
                <div key={subEvent.id} className="sub-event-item">
                  <span>{subEvent.name} - {subEvent.location}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSubEvent(subEvent.id)}
                    className="remove-sub-event-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Formulario para Añadir Sub-Evento */}
              <div className="sub-event-form">
                <input
                  type="text"
                  name="name"
                  value={newSubEvent.name}
                  onChange={handleSubEventInputChange}
                  placeholder="Sub Event Name"
                />
                <input
                  type="date"
                  name="date"
                  value={newSubEvent.date}
                  onChange={handleSubEventInputChange}

                />
                <input
                  type="time"
                  name="time"
                  value={newSubEvent.time}
                  onChange={handleSubEventInputChange}

                />
                <input
                  type="text"
                  name="location"
                  value={newSubEvent.location}
                  onChange={handleSubEventInputChange}
                  placeholder="Location"

                />
                <input
                  type="text"
                  name="duration"
                  value={newSubEvent.duration}
                  onChange={handleSubEventInputChange}
                  placeholder="Duration (e.g., 2 hours)"

                />
                <button 
                  type="button" 
                  onClick={addSubEvent}
                  className="add-sub-event-btn"
                >
                  Add Sub Event
                </button>
              </div>
            </div>

            <button type="submit" className="save-event-btn">
              Save and continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;