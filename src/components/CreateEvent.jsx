// notion de endpoints https://www.notion.so/Gu-a-Completa-de-Endpoints-EventHub-API-206b8d1bc34080e7ba68cf1798e4367c#207b8d1bc340804484aedbb08ee6e2ff

import React, { useState, useRef, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { withCheckAuth } from "../Utils/CheckAuth";
import { useNavigate } from "react-router-dom";

// Solución al problema de iconos en Leaflet con React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono personalizado
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Componente del mapa
const MapSelector = ({ onLocationSelect, initialPosition }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [position, setPosition] = useState(
    initialPosition || [4.541196, -75.668346] // Default a Armenia, Quindío
  );

  useEffect(() => {
    // Inicializar el mapa
    if (!mapRef.current) {
      const map = L.map("map").setView(position, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Añadir marcador si hay posición inicial
      if (position[0] && position[1]) {
        markerRef.current = L.marker(position, { icon: customIcon }).addTo(map);
      }

      // Evento de clic en el mapa
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        // Actualizar o crear marcador
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(
            map
          );
        }

        // Notificar al componente padre
        onLocationSelect(lat, lng);
      });

      mapRef.current = map;
    }

    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Ejecutar solo una vez al montar

  // Actualizar marcador si cambia la posición desde props
  useEffect(() => {
    if (
      mapRef.current &&
      initialPosition &&
      initialPosition[0] &&
      initialPosition[1]
    ) {
      setPosition(initialPosition);

      if (markerRef.current) {
        markerRef.current.setLatLng(initialPosition);
      } else {
        markerRef.current = L.marker(initialPosition, {
          icon: customIcon,
        }).addTo(mapRef.current);
      }
      // Centrar el mapa en la nueva posición
      mapRef.current.setView(initialPosition, mapRef.current.getZoom());
    }
  }, [initialPosition]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

// Constantes para Cloudinary
const CLOUDINARY_CLOUD_NAME = "diy0flmyp";
const CLOUDINARY_UPLOAD_PRESET = "EventHub";

// Función para comprimir imágenes antes de subirlas
const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const scale = maxWidth / width;
          width = maxWidth;
          height = height * scale;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir la imagen."));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para comprimir."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
};

// Función para subir archivos a Cloudinary
const uploadToCloudinary = async (file, resourceType = "image") => {
  try {
    let fileToUpload = file;

    // Solo comprimir si es imagen
    if (resourceType === "image" && file.type.startsWith("image/")) {
      try {
        fileToUpload = await compressImage(file);
      } catch (compressionError) {
        console.warn("Error al comprimir imagen, subiendo original:", compressionError);
        // Si falla la compresión, subir el archivo original
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error data:", errorData);
      throw new Error(
        errorData.error?.message || "Error al subir a Cloudinary"
      );
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error en la subida a Cloudinary:", error);
    throw error;
  }
};

// Función para procesar y almacenar archivos
const processAndStoreFile = (
  file,
  isVideoOnly = false,
  isImageOnly = false
) => {
  return new Promise((resolve, reject) => {
    const fileType = file.type;
    if (isVideoOnly && !fileType.startsWith("video/mp4"))
      return reject("Solo se permiten videos MP4.");
    if (isImageOnly && !fileType.startsWith("image/"))
      return reject("Solo se permiten imágenes.");
    if (
      !isVideoOnly &&
      !isImageOnly &&
      !fileType.startsWith("image/") &&
      !fileType.startsWith("video/mp4")
    ) {
      return reject("Tipo de archivo no válido (solo imagen o video MP4).");
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize)
      return reject(`Archivo demasiado grande (Max 50MB).`);

    const localPreviewUrl = URL.createObjectURL(file);
    resolve({ file, localPreviewUrl, type: fileType });
  });
};

const CreateEvent = () => {
  const navigate = useNavigate();
  
  // Estados para controlar el paso actual y la barra de progreso
  const [currentStep, setCurrentStep] = useState(1);
  const [progressWidth, setProgressWidth] = useState(14.28); // 100% / 7 pasos
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const user = localStorage.getItem("userName") || "Usuario";
  const [userName, setUserName] = useState(user);
  const [subEventProgress, setSubEventProgress] = useState(null); // Estado para progreso de sub-eventos

  // Estados para las categorías
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Consumo api categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://backendeventhub.onrender.com/api/categories",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const categoriesData = await response.json();

        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter((cat) => cat.activa);
        setCategories(activeCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    eventName: "",
    eventDescription: "",
    eventCategory: "",
    eventType: "",

    // Paso 2: Imágenes principales
    mainImageFiles: [null, null],

    // Paso 3: Galería de imágenes y video
    galleryImageFiles: [],
    eventVideo: null,

    // Paso 4: Ubicación
    eventLocation: "",
    eventStartDate: "",
    eventStartTime: "",
    eventEndDate: "",
    eventEndTime: "",
    latitude: null,
    longitude: null,

    // Paso 5: Información adicional
    eventOrganizer: userName, // Usar el nombre de usuario por defecto
    contactEmail: "",
    contactPhone: "",
    additionalNotes: "",

    // Paso 6: Entradas y capacidad
    ticketType: "free",
    ticketPrice: "",
    ticketCurrency: "COP", // Default a COP
    capacity: "",
    subEvents: [],
  });

  // Referencia para el contenedor de la galería de imágenes
  const imageGalleryPreviewRef = useRef(null);
  const videoPreviewContainerRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const videoNameRef = useRef(null);
  const paidTicketsSectionRef = useRef(null);
  const subEventsContainerRef = useRef(null);

  // Efecto para actualizar la barra de progreso cuando cambia el paso
  useEffect(() => {
    setProgressWidth(currentStep * 14.28);

    // Mostrar/ocultar sección de entradas de pago
    if (paidTicketsSectionRef.current) {
      if (formData.ticketType === "paid") {
        paidTicketsSectionRef.current.classList.remove("hidden");
      } else {
        paidTicketsSectionRef.current.classList.add("hidden");
      }
    }
  }, [currentStep, formData.ticketType]);

  // Efecto para limpiar URLs de objetos al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar URLs de objetos para evitar fugas de memoria
      if (formData.mainImageFiles) {
        formData.mainImageFiles.forEach((item) => {
          if (item && item.localPreviewUrl) {
            URL.revokeObjectURL(item.localPreviewUrl);
          }
        });
      }

      if (formData.galleryImageFiles) {
        formData.galleryImageFiles.forEach((item) => {
          if (item && item.localPreviewUrl) {
            URL.revokeObjectURL(item.localPreviewUrl);
          }
        });
      }

      if (formData.eventVideo && formData.eventVideo.localPreviewUrl) {
        URL.revokeObjectURL(formData.eventVideo.localPreviewUrl);
      }
    };
  }, [
    formData.mainImageFiles,
    formData.galleryImageFiles,
    formData.eventVideo,
  ]);

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      alert(
        "Por favor, complete todos los campos obligatorios marcados con * y corrija los errores antes de continuar."
      );
    }
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para manejar la selección de ubicación en el mapa
  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Limpiar errores relacionados con la ubicación
    if (errors.latitude || errors.longitude) {
      setErrors((prev) => ({
        ...prev,
        latitude: undefined,
        longitude: undefined,
      }));
    }
  };

  // Función para validar el paso actual
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1: // Información básica
        if (!formData.eventName.trim())
          newErrors.eventName = "El nombre del evento es requerido.";
        if (!formData.eventDescription.trim())
          newErrors.eventDescription = "La descripción es requerida.";
        if (!formData.eventCategory)
          newErrors.eventCategory = "La categoría es requerida.";
        if (!formData.eventType)
          newErrors.eventType = "El tipo de evento es requerido.";
        break;

      case 2: // Imágenes principales
        const hasMainImage = formData.mainImageFiles.some(
          (img) => img !== null
        );
        if (!hasMainImage)
          newErrors.mainImages = "Al menos una imagen principal es requerida.";
        break;

      case 3: // Galería de imágenes
        if (formData.galleryImageFiles.length < 5) {
          newErrors.galleryImages =
            "Se requieren al menos 5 imágenes para la galería.";
        }
        break;

      case 4: // Ubicación
        if (!formData.eventLocation.trim())
          newErrors.eventLocation = "La dirección del evento es requerida.";
        if (!formData.eventStartDate)
          newErrors.eventStartDate = "La fecha de inicio es requerida.";
        if (!formData.eventStartTime)
          newErrors.eventStartTime = "La hora de inicio es requerida.";
        if (!formData.eventEndDate)
          newErrors.eventEndDate = "La fecha de fin es requerida.";
        if (!formData.eventEndTime)
          newErrors.eventEndTime = "La hora de fin es requerida.";

        // Validar que la fecha de fin no sea anterior a la de inicio
        if (formData.eventStartDate && formData.eventEndDate) {
          const startDateTime = new Date(
            `${formData.eventStartDate}T${formData.eventStartTime || "00:00"}`
          );
          const endDateTime = new Date(
            `${formData.eventEndDate}T${formData.eventEndTime || "00:00"}`
          );

          if (endDateTime < startDateTime) {
            newErrors.eventEndDate =
              "La fecha de fin no puede ser anterior a la fecha de inicio.";
          }
        }
        break;

      case 5: // Información adicional
        if (!formData.eventOrganizer.trim())
          newErrors.eventOrganizer = "El organizador es requerido.";
        if (!formData.contactEmail.trim())
          newErrors.contactEmail = "El email de contacto es requerido.";

        // Validar formato de email
        if (
          formData.contactEmail &&
          !/\S+@\S+\.\S+/.test(formData.contactEmail)
        ) {
          newErrors.contactEmail = "Ingrese un email válido.";
        }
        break;

      case 6: // Entradas y capacidad
        if (
          formData.ticketType === "paid" &&
          (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0)
        ) {
          newErrors.ticketPrice =
            "El precio debe ser mayor a cero para eventos de pago.";
        }

        if (!formData.capacity || parseInt(formData.capacity) <= 0) {
          newErrors.capacity =
            "La capacidad máxima debe ser un número positivo.";
        }
        
        // Validar sub-eventos si existen
        if (formData.subEvents && formData.subEvents.length > 0) {
          for (const subEvent of formData.subEvents) {
            if (!subEvent.name || !subEvent.name.trim()) {
              newErrors.subEvents = "Todos los sub-eventos deben tener un nombre";
              break;
            }
            
            if (!subEvent.startDate || !subEvent.startTime) {
              newErrors.subEvents = "Todos los sub-eventos deben tener fecha y hora de inicio";
              break;
            }
            
            // Validar que las fechas del sub-evento estén dentro del rango del evento principal
            if (formData.eventStartDate && formData.eventStartTime && formData.eventEndDate && formData.eventEndTime) {
              const subEventStart = new Date(`${subEvent.startDate}T${subEvent.startTime}`);
              const subEventEnd = subEvent.endDate && subEvent.endTime ? new Date(`${subEvent.endDate}T${subEvent.endTime}`) : subEventStart; // Si no hay fin, usar inicio
              const mainEventStart = new Date(`${formData.eventStartDate}T${formData.eventStartTime}`);
              const mainEventEnd = new Date(`${formData.eventEndDate}T${formData.eventEndTime}`);
              
              if (subEventStart < mainEventStart || subEventEnd > mainEventEnd) {
                newErrors.subEvents = "Las fechas de los sub-eventos deben estar dentro del rango del evento principal";
                break;
              }
            }
          }
        }
        break;

      case 7: // Vista previa - No hay validaciones adicionales aquí, se validan en handleSubmit
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para validar todo el formulario antes de enviar
  const validateForm = () => {
    let allErrors = {};
    // Ejecutar validación para cada paso para acumular todos los errores
    for (let step = 1; step <= 6; step++) {
      const stepErrors = {};
      switch (step) {
        case 1: // Información básica
          if (!formData.eventName.trim()) stepErrors.eventName = "El nombre del evento es requerido.";
          if (!formData.eventDescription.trim()) stepErrors.eventDescription = "La descripción es requerida.";
          if (!formData.eventCategory) stepErrors.eventCategory = "La categoría es requerida.";
          if (!formData.eventType) stepErrors.eventType = "El tipo de evento es requerido.";
          break;
        case 2: // Imágenes principales
          const hasMainImage = formData.mainImageFiles.some(img => img !== null);
          if (!hasMainImage) stepErrors.mainImages = "Al menos una imagen principal es requerida.";
          break;
        case 3: // Galería de imágenes
          if (formData.galleryImageFiles.length < 5) stepErrors.galleryImages = "Se requieren al menos 5 imágenes para la galería.";
          break;
        case 4: // Ubicación
          if (!formData.eventLocation.trim()) stepErrors.eventLocation = "La dirección del evento es requerida.";
          if (!formData.eventStartDate) stepErrors.eventStartDate = "La fecha de inicio es requerida.";
          if (!formData.eventStartTime) stepErrors.eventStartTime = "La hora de inicio es requerida.";
          if (!formData.eventEndDate) stepErrors.eventEndDate = "La fecha de fin es requerida.";
          if (!formData.eventEndTime) stepErrors.eventEndTime = "La hora de fin es requerida.";
          if (formData.eventStartDate && formData.eventEndDate) {
            const startDateTime = new Date(`${formData.eventStartDate}T${formData.eventStartTime || "00:00"}`);
            const endDateTime = new Date(`${formData.eventEndDate}T${formData.eventEndTime || "00:00"}`);
            if (endDateTime < startDateTime) stepErrors.eventEndDate = "La fecha de fin no puede ser anterior a la fecha de inicio.";
          }
          break;
        case 5: // Información adicional
          if (!formData.eventOrganizer.trim()) stepErrors.eventOrganizer = "El organizador es requerido.";
          if (!formData.contactEmail.trim()) stepErrors.contactEmail = "El email de contacto es requerido.";
          if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) stepErrors.contactEmail = "Ingrese un email válido.";
          break;
        case 6: // Entradas y capacidad
          if (formData.ticketType === "paid" && (!formData.ticketPrice || parseFloat(formData.ticketPrice) <= 0)) stepErrors.ticketPrice = "El precio debe ser mayor a cero para eventos de pago.";
          if (!formData.capacity || parseInt(formData.capacity) <= 0) stepErrors.capacity = "La capacidad máxima debe ser un número positivo.";
          // Validar sub-eventos
          if (formData.subEvents && formData.subEvents.length > 0) {
            for (const subEvent of formData.subEvents) {
              if (!subEvent.name || !subEvent.name.trim()) {
                stepErrors.subEvents = "Todos los sub-eventos deben tener un nombre"; break;
              }
              if (!subEvent.startDate || !subEvent.startTime) {
                stepErrors.subEvents = "Todos los sub-eventos deben tener fecha y hora de inicio"; break;
              }
              if (formData.eventStartDate && formData.eventStartTime && formData.eventEndDate && formData.eventEndTime) {
                const subEventStart = new Date(`${subEvent.startDate}T${subEvent.startTime}`);
                const subEventEnd = subEvent.endDate && subEvent.endTime ? new Date(`${subEvent.endDate}T${subEvent.endTime}`) : subEventStart;
                const mainEventStart = new Date(`${formData.eventStartDate}T${formData.eventStartTime}`);
                const mainEventEnd = new Date(`${formData.eventEndDate}T${formData.eventEndTime}`);
                if (subEventStart < mainEventStart || subEventEnd > mainEventEnd) {
                  stepErrors.subEvents = "Las fechas de los sub-eventos deben estar dentro del rango del evento principal"; break;
                }
              }
            }
          }
          break;
        default: break;
      }
      allErrors = { ...allErrors, ...stepErrors };
    }
    
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Limpiar error específico cuando el usuario modifica el campo
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  // Función para manejar cambios en los radio buttons
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error específico
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Función para manejar la subida de imágenes principales
  const handleMainImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const processed = await processAndStoreFile(file, false, true); // Solo imágenes

      setFormData((prev) => {
        const newMainImageFiles = [...prev.mainImageFiles];
        // Limpiar URL anterior si existe
        if (newMainImageFiles[index] && newMainImageFiles[index].localPreviewUrl) {
          URL.revokeObjectURL(newMainImageFiles[index].localPreviewUrl);
        }
        newMainImageFiles[index] = processed;
        return { ...prev, mainImageFiles: newMainImageFiles };
      });

      // Limpiar errores relacionados
      setErrors((prev) => ({
        ...prev,
        [`mainImage${index}`]: undefined,
        mainImages: undefined,
      }));
    } catch (errorMsg) {
      setErrors((prev) => ({
        ...prev,
        [`mainImage${index}`]: String(errorMsg),
        mainImages: String(errorMsg),
      }));
    }
  };

  // Función para eliminar imágenes principales
  const handleMainImageRemove = (index) => {
    setFormData((prev) => {
      const newMainImageFiles = [...prev.mainImageFiles];

      if (
        newMainImageFiles[index] &&
        newMainImageFiles[index].localPreviewUrl
      ) {
        URL.revokeObjectURL(newMainImageFiles[index].localPreviewUrl);
      }

      newMainImageFiles[index] = null;
      return { ...prev, mainImageFiles: newMainImageFiles };
    });
  };

  // Función para manejar la subida de múltiples imágenes para la galería
  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar límite de imágenes
    if (formData.galleryImageFiles.length + files.length > 12) {
      setErrors((prev) => ({
        ...prev,
        galleryImages:
          "No puede subir más de 12 imágenes en total para la galería.",
      }));
      return;
    }

    let galleryError = null;
    const newImageFiles = [];

    for (const file of files) {
      try {
        const processed = await processAndStoreFile(file, false, true); // Solo imágenes
        newImageFiles.push(processed);
      } catch (errorMsg) {
        galleryError = galleryError
          ? `${galleryError}\n${String(errorMsg)}`
          : String(errorMsg);
      }
    }

    setFormData((prev) => ({
      ...prev,
      galleryImageFiles: [...prev.galleryImageFiles, ...newImageFiles],
    }));

    if (galleryError) {
      setErrors((prev) => ({
        ...prev,
        galleryImages: galleryError,
      }));
    } else if (errors.galleryImages) {
      // Limpiar error si se subieron imágenes y antes había error de cantidad
      if (formData.galleryImageFiles.length + newImageFiles.length >= 5) {
        setErrors((prev) => ({ ...prev, galleryImages: undefined }));
      }
    }
  };

  // Función para eliminar imágenes de la galería
  const handleGalleryImageRemove = (index) => {
    setFormData((prev) => {
      const newGalleryImageFiles = [...prev.galleryImageFiles];

      if (
        newGalleryImageFiles[index] &&
        newGalleryImageFiles[index].localPreviewUrl
      ) {
        URL.revokeObjectURL(newGalleryImageFiles[index].localPreviewUrl);
      }

      newGalleryImageFiles.splice(index, 1);
      // Revalidar si ahora hay menos de 5 imágenes
      if (newGalleryImageFiles.length < 5 && currentStep >= 3) {
        setErrors(prevErrors => ({ ...prevErrors, galleryImages: "Se requieren al menos 5 imágenes para la galería." }));
      }
      return { ...prev, galleryImageFiles: newGalleryImageFiles };
    });
  };

  // Función para manejar la subida de video
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const processed = await processAndStoreFile(file, true); // Solo video

      setFormData((prev) => ({
        ...prev,
        eventVideo: processed,
      }));

      // Limpiar errores relacionados
      setErrors((prev) => ({
        ...prev,
        video: undefined,
      }));
    } catch (errorMsg) {
      setErrors((prev) => ({
        ...prev,
        video: String(errorMsg),
      }));
    }
  };

  // Función para eliminar video
  const handleVideoRemove = () => {
    setFormData((prev) => {
      if (prev.eventVideo && prev.eventVideo.localPreviewUrl) {
        URL.revokeObjectURL(prev.eventVideo.localPreviewUrl);
      }

      return {
        ...prev,
        eventVideo: null,
      };
    });
  };

  // Función para añadir un sub-evento
  const addSubEvent = () => {
    const newSubEvent = {
      id: Date.now(),
      name: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    };

    setFormData({
      ...formData,
      subEvents: [...formData.subEvents, newSubEvent],
    });
  };

  // Función para eliminar un sub-evento
  const removeSubEvent = (id) => {
    setFormData({
      ...formData,
      subEvents: formData.subEvents.filter((subEvent) => subEvent.id !== id),
    });
  };

  // Función para actualizar un sub-evento
  const updateSubEvent = (id, field, value) => {
    setFormData({
      ...formData,
      subEvents: formData.subEvents.map((subEvent) =>
        subEvent.id === id ? { ...subEvent, [field]: value } : subEvent
      ),
    });
    // Limpiar error general de sub-eventos al modificar uno
    if (errors.subEvents) {
      setErrors(prev => ({ ...prev, subEvents: undefined }));
    }
  };

  // Función para enviar el formulario (handleSubmit con integración de sub-eventos)
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert(
        "Por favor, revise el formulario. Hay campos obligatorios sin completar o con errores."
      );
      // Opcional: llevar al usuario al primer paso con errores
      const firstErrorStep = Object.keys(errors).length > 0 ? 
        Object.keys(errors).map(key => {
          if (['eventName', 'eventDescription', 'eventCategory', 'eventType'].includes(key)) return 1;
          if (key === 'mainImages') return 2;
          if (key === 'galleryImages' || key === 'video') return 3;
          if (['eventLocation', 'eventStartDate', 'eventStartTime', 'eventEndDate', 'eventEndTime'].includes(key)) return 4;
          if (['eventOrganizer', 'contactEmail', 'contactPhone'].includes(key)) return 5;
          if (['ticketType', 'ticketPrice', 'capacity', 'subEvents'].includes(key)) return 6;
          return 7;
        }).reduce((min, step) => Math.min(min, step), 7)
        : currentStep;
      setCurrentStep(firstErrorStep);
      return;
    }

    setIsLoading(true);
    setSubEventProgress(null); // Resetear progreso de sub-eventos

    try {
      // Preparar datos para enviar a la API
      const eventData = {
        title: formData.eventName,
        description: formData.eventDescription,
        location: {
          address: formData.eventLocation,
          type:
            formData.eventType === "inPerson"
              ? "presencial"
              : formData.eventType === "online"
              ? "online"
              : "híbrido",
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        start: `${formData.eventStartDate}T${formData.eventStartTime}:00Z`,
        end: `${formData.eventEndDate}T${formData.eventEndTime}:00Z`,
        type: "conferencia", // Ajustar según los tipos disponibles en la API
        privacy: "public",
        ticketType: formData.ticketType === "paid" ? "paid" : "free",
        price: {
          amount:
            formData.ticketType === "paid"
              ? parseFloat(formData.ticketPrice)
              : 0,
          currency:
            formData.ticketType === "paid" ? formData.ticketCurrency : "COP",
        },
        maxAttendees: parseInt(formData.capacity),
        categoriaId: formData.eventCategory,
        mainImages: [], // Se llenará después con las imágenes subidas
        galleryImages: [], // Se llenará después con las imágenes subidas
        videos: [], // Se llenará después con los videos subidos
        documents: [],
        otherData: {
          organizer: formData.eventOrganizer,
          contact: formData.contactPhone || "",
          email: formData.contactEmail || "",
          notes: formData.additionalNotes || "",
        },
        destacado: false,
        permitirInscripciones: true,
        fechaLimiteInscripcion: formData.eventEndDate ? `${formData.eventEndDate}T23:59:59Z` : null,
        tags: [] // Añadir lógica para tags si es necesario
      };
      console.log("Datos iniciales a enviar:", eventData);

      // Subir imágenes principales a Cloudinary
      const mainImagesData = [];
      for (const imgData of formData.mainImageFiles) {
        if (imgData) {
          try {
            const imageUrl = await uploadToCloudinary(imgData.file);
            mainImagesData.push({
              url: imageUrl,
              description: "Imagen principal del evento",
              uploadedAt: new Date().toISOString(),
              mediaType: "image",
            });
          } catch (uploadError) {
            console.error("Error subiendo imagen principal:", uploadError);
            throw new Error(`Error al subir una imagen principal: ${uploadError.message}`);
          }
        }
      }
      eventData.mainImages = mainImagesData;

      // Subir imágenes de galería a Cloudinary
      const galleryImagesData = [];
      for (const imgData of formData.galleryImageFiles) {
        try {
          const imageUrl = await uploadToCloudinary(imgData.file);
          galleryImagesData.push({
            url: imageUrl,
            description: "Vista del lugar",
            uploadedAt: new Date().toISOString(),
            mediaType: "image",
          });
        } catch (uploadError) {
          console.error("Error subiendo imagen de galería:", uploadError);
          throw new Error(`Error al subir una imagen de galería: ${uploadError.message}`);
        }
      }
      eventData.galleryImages = galleryImagesData;

      // Subir video a Cloudinary si existe
      const videosData = [];
      if (formData.eventVideo) {
        try {
          const videoUrl = await uploadToCloudinary(
            formData.eventVideo.file,
            "video"
          );
          videosData.push({
            url: videoUrl,
            description: "Video promocional del evento",
            uploadedAt: new Date().toISOString(),
            mediaType: "video",
          });
        } catch (uploadError) {
          console.error("Error subiendo video:", uploadError);
          throw new Error(`Error al subir el video: ${uploadError.message}`);
        }
      }
      eventData.videos = videosData;

      // Mostrar todos los datos que se enviarán a la API
      console.log("Datos finales a enviar a la API:", eventData);
      
      const token = localStorage.getItem("token");

      // Enviar datos a la API
      const response = await fetch(
        "https://backendeventhub.onrender.com/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Respuesta exitosa del evento principal:", result);
      
      // Obtener el ID del evento principal creado
      const eventoPrincipalId = result.id;
      
      // Crear sub-eventos si existen
      if (formData.subEvents && formData.subEvents.length > 0) {
        console.log(`Creando ${formData.subEvents.length} sub-eventos para el evento principal ${eventoPrincipalId}`);
        
        // Mostrar indicador de progreso para sub-eventos
        setSubEventProgress({
          total: formData.subEvents.length,
          current: 0,
          completed: 0,
          failed: 0
        });
        
        // Array para almacenar resultados de sub-eventos
        const subEventResults = [];
        const subEventErrors = [];
        
        // Crear cada sub-evento
        for (let i = 0; i < formData.subEvents.length; i++) {
          const subEvent = formData.subEvents[i];
          
          setSubEventProgress(prev => ({
            ...prev,
            current: i + 1
          }));
          
          try {
            // Validar que el sub-evento tenga los campos requeridos
            if (!subEvent.name || !subEvent.startDate || !subEvent.startTime) {
              console.warn(`Sub-evento ${subEvent.id} incompleto, saltando...`);
              subEventErrors.push({
                id: subEvent.id,
                name: subEvent.name || 'Sin nombre',
                error: "Sub-evento incompleto (falta nombre o fechas)"
              });
              setSubEventProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
              continue;
            }
            
            // Preparar datos del sub-evento
            const subEventData = {
              title: subEvent.name,
              description: subEvent.description || `Sub-evento de ${formData.eventName}`,
              eventoPrincipalId: eventoPrincipalId,
              location: {
                address: formData.eventLocation, // Usar la misma ubicación del evento principal por defecto
                type: formData.eventType === "inPerson" ? "presencial" : formData.eventType === "online" ? "online" : "híbrido",
                latitude: formData.latitude,
                longitude: formData.longitude
              },
              start: `${subEvent.startDate}T${subEvent.startTime}:00Z`,
              end: subEvent.endDate && subEvent.endTime ? `${subEvent.endDate}T${subEvent.endTime}:00Z` : `${subEvent.startDate}T${subEvent.startTime}:00Z`, // Si no hay fin, usar inicio
              type: "workshop", // Tipo por defecto para sub-eventos, ajustar si es necesario
              privacy: "public",
              ticketType: "free", // Por defecto gratuito, ajustar si es necesario
              maxAttendees: Math.floor(parseInt(formData.capacity) / 2) || 10, // Default: mitad de capacidad o 10
              mainImages: eventData.mainImages.slice(0, 1), // Usar la primera imagen del evento principal
              otherData: {
                organizer: formData.eventOrganizer,
                contact: formData.contactPhone || "",
                notes: `Sub-evento de ${formData.eventName}`
              }
              // Añadir otros campos necesarios para sub-eventos según la API
            };
            
            // Enviar sub-evento a la API
            const subEventResponse = await fetch(
              "https://backendeventhub.onrender.com/api/events", // Asumiendo que el mismo endpoint crea sub-eventos si tiene eventoPrincipalId
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(subEventData),
              }
            );
            
            if (!subEventResponse.ok) {
              const subErrorText = await subEventResponse.text();
              console.error(`Error al crear sub-evento ${subEvent.id}:`, subErrorText);
              subEventErrors.push({
                id: subEvent.id,
                name: subEvent.name,
                error: `Error ${subEventResponse.status}: ${subEventResponse.statusText}`
              });
              setSubEventProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
              continue;
            }
            
            const subEventResult = await subEventResponse.json();
            console.log(`Sub-evento ${subEvent.name} creado exitosamente:`, subEventResult);
            subEventResults.push(subEventResult);
            setSubEventProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
            
          } catch (subError) {
            console.error(`Error al procesar sub-evento ${subEvent.id}:`, subError);
            subEventErrors.push({
              id: subEvent.id,
              name: subEvent.name,
              error: subError.message
            });
            setSubEventProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
          }
        }
        
        // Mostrar resumen de creación de sub-eventos
        console.log(`Resumen de sub-eventos: ${subEventResults.length} creados, ${subEventErrors.length} con errores`);
        
        // Si hay errores en sub-eventos pero el evento principal se creó, mostrar advertencia
        if (subEventErrors.length > 0) {
          console.warn("Algunos sub-eventos no pudieron ser creados:", subEventErrors);
          alert(`El evento principal se creó correctamente, pero ${subEventErrors.length} sub-eventos no pudieron ser creados. Consulte la consola para más detalles.`);
        }
      }

      // Redirigir a la página de detalles del evento principal
      alert("¡Evento creado exitosamente!");
      navigate(`/events/${eventoPrincipalId}`);
      
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert(`Error al crear el evento: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">
              Información básica del evento
            </h2>

            <div className="mb-6">
              <label
                htmlFor="eventName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del evento *
              </label>
              <input
                type="text"
                id="eventName"
                className={`w-full p-3 border rounded-lg ${
                  errors.eventName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej. Concierto de rock en vivo"
                value={formData.eventName}
                onChange={handleInputChange}
              />
              {errors.eventName && (
                <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="eventDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descripción del evento *
              </label>
              <textarea
                id="eventDescription"
                rows="4"
                className={`w-full p-3 border rounded-lg ${
                  errors.eventDescription ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe tu evento en detalle..."
                value={formData.eventDescription}
                onChange={handleInputChange}
              ></textarea>
              {errors.eventDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.eventDescription}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventCategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Categoría *
                </label>
                <select
                  id="eventCategory"
                  className={`w-full p-3 border rounded-lg ${
                    errors.eventCategory ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.eventCategory}
                  onChange={handleInputChange}
                  disabled={isLoadingCategories}
                >
                  <option value="">
                    {isLoadingCategories
                      ? "Cargando categorías..."
                      : "Selecciona una categoría"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombreCategoria}
                    </option>
                  ))}
                </select>
                {errors.eventCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventCategory}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de evento *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="inPerson"
                      name="eventType"
                      value="inPerson"
                      checked={formData.eventType === "inPerson"}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="inPerson"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Presencial
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="online"
                      name="eventType"
                      value="online"
                      checked={formData.eventType === "online"}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="online"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Online
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="hybrid"
                      name="eventType"
                      value="hybrid"
                      checked={formData.eventType === "hybrid"}
                      onChange={handleRadioChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="hybrid"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Híbrido
                    </label>
                  </div>
                </div>
                {errors.eventType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventType}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">Imágenes principales</h2>
            <p className="text-gray-600 mb-6">
              Sube hasta 2 imágenes principales que se mostrarán en la cabecera
              de tu evento (al menos 1 es obligatoria *).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((index) => (
                <div key={index} className="image-upload-container">
                  {formData.mainImageFiles[index] ? (
                    <div className="relative">
                      <img
                        src={formData.mainImageFiles[index].localPreviewUrl}
                        alt={`Imagen principal ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleMainImageRemove(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        {/* Icono de eliminar */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {/* Icono de subir */}
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Haz clic para subir</span>
                        </p>
                        <p className="text-xs text-gray-500">Imagen {index + 1}</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleMainImageUpload(e, index)}
                      />
                    </label>
                  )}
                  {errors[`mainImage${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`mainImage${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
            {errors.mainImages && (
              <p className="text-red-500 text-sm mt-4">{errors.mainImages}</p>
            )}
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">Galería y video</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                Galería de imágenes (mínimo 5) *
              </h3>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {/* Icono de subir */}
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="text-sm text-gray-500">
                    Haz clic para subir múltiples imágenes
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesUpload}
                />
              </label>

              {errors.galleryImages && (
                <p className="text-red-500 text-sm mb-4">
                  {errors.galleryImages}
                </p>
              )}

              <div
                ref={imageGalleryPreviewRef}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {formData.galleryImageFiles.map((imgData, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imgData.localPreviewUrl}
                      alt={`Imagen de galería ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleGalleryImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      {/* Icono de eliminar */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">
                Video promocional (opcional)
              </h3>

              <div
                ref={videoPreviewContainerRef}
                className={`mb-4 ${formData.eventVideo ? "block" : "hidden"}`}
              >
                <div className="relative">
                  <video
                    ref={videoPreviewRef}
                    src={formData.eventVideo?.localPreviewUrl}
                    className="w-full h-auto rounded-lg"
                    controls
                  ></video>
                  <button
                    type="button"
                    onClick={handleVideoRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    {/* Icono de eliminar */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <p ref={videoNameRef} className="mt-2 text-sm text-gray-500">
                    {formData.eventVideo?.file.name}
                  </p>
                </div>
              </div>

              <div className={formData.eventVideo ? "hidden" : "block"}>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {/* Icono de video */}
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        Haz clic para subir un video
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Solo MP4 (máx. 50MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/mp4"
                    onChange={handleVideoUpload}
                  />
                </label>
              </div>

              {errors.video && (
                <p className="text-red-500 text-sm mt-2">{errors.video}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">Ubicación y fechas</h2>

            <div className="mb-6">
              <label
                htmlFor="eventLocation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dirección del evento *
              </label>
              <input
                type="text"
                id="eventLocation"
                className={`w-full p-3 border rounded-lg ${
                  errors.eventLocation ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej. Calle Principal 123, Ciudad"
                value={formData.eventLocation}
                onChange={handleInputChange}
              />
              {errors.eventLocation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.eventLocation}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona en el mapa (opcional)
              </label>
              <div
                className="map-container"
                style={{ height: "300px", backgroundColor: "#f0f0f0" }}
              >
                <MapSelector
                  onLocationSelect={handleLocationSelect}
                  initialPosition={
                    formData.latitude && formData.longitude
                      ? [formData.latitude, formData.longitude]
                      : null
                  }
                />
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-sm text-gray-500 mt-2">
                  Ubicación seleccionada: {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="eventStartDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  id="eventStartDate"
                  className={`w-full p-3 border rounded-lg ${
                    errors.eventStartDate ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.eventStartDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.eventStartDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventStartDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="eventStartTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  id="eventStartTime"
                  className={`w-full p-3 border rounded-lg ${
                    errors.eventStartTime ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.eventStartTime}
                  onChange={handleInputChange}
                />
                {errors.eventStartTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventStartTime}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventEndDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Fecha de fin *
                </label>
                <input
                  type="date"
                  id="eventEndDate"
                  className={`w-full p-3 border rounded-lg ${
                    errors.eventEndDate ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.eventEndDate}
                  onChange={handleInputChange}
                  min={
                    formData.eventStartDate ||
                    new Date().toISOString().split("T")[0]
                  }
                />
                {errors.eventEndDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventEndDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="eventEndTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hora de fin *
                </label>
                <input
                  type="time"
                  id="eventEndTime"
                  className={`w-full p-3 border rounded-lg ${
                    errors.eventEndTime ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.eventEndTime}
                  onChange={handleInputChange}
                />
                {errors.eventEndTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.eventEndTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">
              Información adicional
            </h2>

            <div className="mb-6">
              <label
                htmlFor="eventOrganizer"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Organizador *
              </label>
              <input
                type="text"
                id="eventOrganizer"
                className={`w-full p-3 border rounded-lg bg-gray-100 border-gray-300`}
                value={formData.eventOrganizer}
                readOnly
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email de contacto *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  className={`w-full p-3 border rounded-lg ${
                    errors.contactEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="email@ejemplo.com"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.contactEmail}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Teléfono de contacto (opcional)
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="+57 123 456 7890"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="additionalNotes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notas adicionales (opcional)
              </label>
              <textarea
                id="additionalNotes"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Información adicional sobre el evento..."
                value={formData.additionalNotes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">Entradas y capacidad</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de entrada *
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="free"
                    name="ticketType"
                    value="free"
                    checked={formData.ticketType === "free"}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="free" className="ml-2 text-sm text-gray-700">
                    Gratuita
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paid"
                    name="ticketType"
                    value="paid"
                    checked={formData.ticketType === "paid"}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="paid" className="ml-2 text-sm text-gray-700">
                    De pago
                  </label>
                </div>
              </div>
            </div>

            <div
              ref={paidTicketsSectionRef}
              className={`mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 ${formData.ticketType === 'paid' ? '' : 'hidden'}`}
            >
              <div>
                <label
                  htmlFor="ticketPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Precio *
                </label>
                <input
                  type="number"
                  id="ticketPrice"
                  className={`w-full p-3 border rounded-lg ${
                    errors.ticketPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej. 50000"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  min="0"
                />
                {errors.ticketPrice && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ticketCurrency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Moneda *
                </label>
                <select
                  id="ticketCurrency"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.ticketCurrency}
                  onChange={handleInputChange}
                >
                  <option value="COP">COP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Capacidad máxima *
              </label>
              <input
                type="number"
                id="capacity"
                className={`w-full p-3 border rounded-lg ${
                  errors.capacity ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej. 100"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Sección de Sub-eventos */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Sub-eventos (opcional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Añade sesiones, talleres o actividades dentro de tu evento principal.
              </p>
              
              {errors.subEvents && (
                <p className="text-red-500 text-sm mb-4">{errors.subEvents}</p>
              )}

              <div ref={subEventsContainerRef} className="space-y-4">
                {formData.subEvents.map((subEvent, index) => (
                  <div
                    key={subEvent.id}
                    className="p-4 border border-gray-200 rounded-lg relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeSubEvent(subEvent.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      {/* Icono de eliminar */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>

                    <h4 className="font-medium mb-2">Sub-evento #{index + 1}</h4>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del sub-evento *
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Ej. Taller de IA"
                        value={subEvent.name}
                        onChange={(e) =>
                          updateSubEvent(subEvent.id, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        rows="2"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Describe el sub-evento..."
                        value={subEvent.description}
                        onChange={(e) =>
                          updateSubEvent(
                            subEvent.id,
                            "description",
                            e.target.value
                          )
                        }
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de inicio *
                        </label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={subEvent.startDate}
                          onChange={(e) =>
                            updateSubEvent(
                              subEvent.id,
                              "startDate",
                              e.target.value
                            )
                          }
                          min={formData.eventStartDate}
                          max={formData.eventEndDate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora de inicio *
                        </label>
                        <input
                          type="time"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={subEvent.startTime}
                          onChange={(e) =>
                            updateSubEvent(
                              subEvent.id,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de fin (opcional)
                        </label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={subEvent.endDate}
                          onChange={(e) =>
                            updateSubEvent(
                              subEvent.id,
                              "endDate",
                              e.target.value
                            )
                          }
                          min={subEvent.startDate || formData.eventStartDate}
                          max={formData.eventEndDate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora de fin (opcional)
                        </label>
                        <input
                          type="time"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          value={subEvent.endTime}
                          onChange={(e) =>
                            updateSubEvent(
                              subEvent.id,
                              "endTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSubEvent}
                className="mt-4 px-4 py-2 border border-dashed border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
              >
                + Añadir sub-evento
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <h2 className="text-xl font-semibold mb-4">
              Vista previa y confirmación
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Resumen del evento</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Nombre:</p>
                  <p className="text-sm text-gray-900">{formData.eventName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Categoría:
                  </p>
                  <p className="text-sm text-gray-900">
                    {categories.find(cat => cat.id === formData.eventCategory)?.nombreCategoria || formData.eventCategory}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Tipo:</p>
                  <p className="text-sm text-gray-900">
                    {formData.eventType === "inPerson"
                      ? "Presencial"
                      : formData.eventType === "online"
                      ? "Online"
                      : "Híbrido"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Organizador:
                  </p>
                  <p className="text-sm text-gray-900">
                    {formData.eventOrganizer}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Ubicación:
                  </p>
                  <p className="text-sm text-gray-900">
                    {formData.eventLocation}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Fechas:</p>
                  <p className="text-sm text-gray-900">
                    Del {formData.eventStartDate} a las{" "}
                    {formData.eventStartTime}
                    <br />
                    al {formData.eventEndDate} a las {formData.eventEndTime}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Entradas:</p>
                  <p className="text-sm text-gray-900">
                    {formData.ticketType === "free"
                      ? "Gratuitas"
                      : `${formData.ticketPrice} ${formData.ticketCurrency}`}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Capacidad:
                  </p>
                  <p className="text-sm text-gray-900">
                    {formData.capacity} personas
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700">
                    Descripción:
                  </p>
                  <p className="text-sm text-gray-900">
                    {formData.eventDescription}
                  </p>
                </div>

                {formData.additionalNotes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700">
                      Notas adicionales:
                    </p>
                    <p className="text-sm text-gray-900">
                      {formData.additionalNotes}
                    </p>
                  </div>
                )}

                {formData.latitude && formData.longitude && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700">
                      Coordenadas:
                    </p>
                    <p className="text-sm text-gray-900">
                      Latitud: {formData.latitude.toFixed(6)}, Longitud:{" "}
                      {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                Imágenes y multimedia
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {formData.mainImageFiles.map(
                  (imgData, index) =>
                    imgData && (
                      <div key={`main-${index}`} className="relative">
                        <img
                          src={imgData.localPreviewUrl}
                          alt={`Imagen principal ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                    )
                )}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {formData.galleryImageFiles.map((imgData, index) => (
                  <div key={`gallery-${index}`} className="relative">
                    <img
                      src={imgData.localPreviewUrl}
                      alt={`Imagen de galería ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {formData.eventVideo && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Video promocional:
                  </p>
                  <video
                    src={formData.eventVideo.localPreviewUrl}
                    className="w-full h-auto rounded-lg"
                    controls
                  ></video>
                </div>
              )}
            </div>

            {formData.subEvents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">
                  Sub-eventos ({formData.subEvents.length})
                </h3>

                <div className="space-y-4">
                  {formData.subEvents.map((subEvent, index) => (
                    <div
                      key={subEvent.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <h4 className="font-medium mb-2">
                        {subEvent.name || `Sub-evento #${index + 1}`}
                      </h4>

                      {subEvent.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {subEvent.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        {subEvent.startDate && subEvent.startTime
                          ? `Desde: ${subEvent.startDate} ${subEvent.startTime}`
                          : "Fecha de inicio no especificada"}
                        <br />
                        {subEvent.endDate && subEvent.endTime
                          ? `Hasta: ${subEvent.endDate} ${subEvent.endTime}`
                          : "Fecha de fin no especificada"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indicador de progreso de sub-eventos */}
            {isLoading && subEventProgress && (
              <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  Creando sub-eventos... ({subEventProgress.current}/{subEventProgress.total})
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(subEventProgress.current / subEventProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Completados: {subEventProgress.completed}, Fallidos: {subEventProgress.failed}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-event-page bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">
              Crear nuevo evento
            </h1>

            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                <span>Info</span>
                <span>Imágenes</span>
                <span>Galería</span>
                <span>Lugar</span>
                <span>Detalles</span>
                <span>Entradas</span>
                <span>Confirmar</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
            </div>

            {/* Contenido del paso actual */}
            <div className="mb-6 md:mb-8">
              {renderStep()}
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  currentStep === 1 || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={currentStep === 1 || isLoading}
              >
                Anterior
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {subEventProgress ? 'Creando sub-eventos...' : 'Creando evento...'}
                    </div>
                  ) : "Crear evento"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withCheckAuth(CreateEvent);

