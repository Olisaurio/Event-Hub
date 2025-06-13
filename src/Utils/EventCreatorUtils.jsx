// Utilidades para validación de creador de eventos
export const EventCreatorUtils = {
  /**
   * Valida si el usuario actual es el creador del evento
   * @param {Object} event - Objeto del evento con información del creador
   * @returns {boolean} - true si el usuario es el creador, false en caso contrario
   */
  isEventCreator: (event) => {
    try {
      // Obtener datos del usuario desde localStorage (estructura actual del proyecto)
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const role = localStorage.getItem('role');
      
      // Verificar que hay sesión activa
      if (!token || !userName) {
        console.log('No hay sesión activa - token o userName faltante');
        return false;
      }
      
      // Verificar que el evento tiene información del creador
      if (!event || !event.creator) {
        console.log('Evento o creador no encontrado');
        return false;
      }
      
      console.log('Validando creador:');
      console.log('- Usuario actual (localStorage):', userName);
      console.log('- Creador del evento:', event.creator.userName);
      console.log('- ID del creador:', event.creator.id);
      
      // Comparar por userName (método principal basado en tu estructura)
      if (userName && event.creator.userName) {
        const isCreator = userName === event.creator.userName;
        console.log('¿Es creador por userName?', isCreator);
        return isCreator;
      }
      
      // Si no hay userName en el creador, intentar con email
      if (event.creator.email) {
        // Decodificar token para obtener más información si es necesario
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token decodificado:', tokenPayload);
          
          // Comparar con el subject del token si coincide con el email
          if (tokenPayload.sub === event.creator.email) {
            console.log('¿Es creador por email en token?', true);
            return true;
          }
        } catch (tokenError) {
          console.error('Error decodificando token:', tokenError);
        }
      }
      
      console.log('No se pudo validar como creador');
      return false;
    } catch (error) {
      console.error('Error validando creador del evento:', error);
      return false;
    }
  },

  /**
   * Obtiene los datos del usuario actual desde localStorage
   * @returns {Object|null} - Datos del usuario o null si no hay sesión
   */
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      const userName = localStorage.getItem('userName');
      const role = localStorage.getItem('role');
      
      if (!token || !userName) {
        return null;
      }
      
      return {
        token,
        userName,
        role,
        // Intentar obtener más datos del token
        ...EventCreatorUtils.getTokenData()
      };
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  },

  /**
   * Decodifica el token JWT para obtener información adicional
   * @returns {Object|null} - Datos del token o null si hay error
   */
  getTokenData: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: tokenPayload.sub, // El subject del token
        email: tokenPayload.email || null,
        exp: tokenPayload.exp,
        iat: tokenPayload.iat
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean} - true si hay sesión activa
   */
  hasActiveSession: () => {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
      console.log('No hay sesión activa - faltan datos básicos');
      return false;
    }
    
    // Verificar si el token ha expirado
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp && currentTime > tokenPayload.exp) {
        console.log('Token expirado');
        return false;
      }
      
      console.log('Sesión activa válida');
      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  },

  /**
   * Función de debug para mostrar información del usuario y evento
   * @param {Object} event - Evento a validar
   */
  debugValidation: (event) => {
    console.group('🔍 Debug Validación de Creador');
    
    const currentUser = EventCreatorUtils.getCurrentUser();
    console.log('👤 Usuario actual:', currentUser);
    
    if (event && event.creator) {
      console.log('📝 Creador del evento:', event.creator);
      console.log('🔗 Comparación userName:', {
        usuario: currentUser?.userName,
        creador: event.creator.userName,
        coincide: currentUser?.userName === event.creator.userName
      });
    } else {
      console.log('❌ No hay información del creador en el evento');
    }
    
    const hasSession = EventCreatorUtils.hasActiveSession();
    console.log('🔐 Sesión activa:', hasSession);
    
    const isCreator = EventCreatorUtils.isEventCreator(event);
    console.log('✅ ¿Es creador?:', isCreator);
    
    console.groupEnd();
    
    return isCreator;
  }
};

