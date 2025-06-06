import React, { useState } from "react";

const RecoveryPassword = () => {
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");

    // Get the button element and set loading state
    const button = e.target.querySelector("button");
    const buttonText = button.querySelector("span > span:first-child");
    const buttonIcon = button.querySelector("span > span.material-symbols-outlined");
    const originalText = buttonText.textContent;

    // Clear previous messages
    setMessage(null);
    setMessageType('');

    // Show loading state
    buttonText.textContent = "Enviando...";
    buttonIcon.textContent = "hourglass_top";
    buttonIcon.classList.add("animate-spin");
    button.disabled = true;
    button.classList.add("opacity-75");

    try {
      const response = await fetch("https://backendeventhub.onrender.com/password/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const responseText = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Password recovery email sent:", data);
          setMessage("Se ha enviado un correo con las instrucciones de recuperación. Revisa tu bandeja de entrada y spam.");
          setMessageType('success');
          
          // Reset the form
          e.target.reset();
        } catch (jsonError) {
          console.log("Response text:", responseText);
          setMessage("Se ha enviado un correo con las instrucciones de recuperación. Revisa tu bandeja de entrada y spam.");
          setMessageType('success');
          
          // Reset the form
          e.target.reset();
        }
      } else {
        throw new Error(`Error ${response.status}: ${responseText}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error al enviar el correo de recuperación. Por favor, verifica tu email e inténtalo nuevamente.");
      setMessageType('error');
      console.log("Email attempted:", email);
    } finally {
      // Reset button state
      buttonText.textContent = originalText;
      buttonIcon.textContent = "send";
      buttonIcon.classList.remove("animate-spin");
      button.disabled = false;
      button.classList.remove("opacity-75");
    }
  };

  return (
    <div id="webcrumbs">
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center p-4">
        <div className="text-center mb-8 w-full max-w-md mx-auto p-6 rounded-lg shadow-lg bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-white-500 to-violet-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">
              lock_reset
            </span>
          </div>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-white hover:text-white text-sm font-medium hover:underline transition-colors duration-200"
            >
              ¿Recordaste tu contraseña? Iniciar Sesión
            </a>
          </div>

          {/* Message Display Area */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
              messageType === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-.1">
                <span className={`material-symbols-outlined mt-0.5 ${
                  messageType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {messageType === 'success' ? 'check_circle' : 'error'}
                </span>
                <div className={`text-sm ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  <p className="font-medium mb-1">
                    {messageType === 'success' ? '¡Éxito!' : 'Error'}
                  </p>
                  <p>{message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-black mt-1">
                security
              </span>
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Información de Seguridad</p>
                <p>
                  El enlace de recuperación expirará en 24 horas por tu
                  seguridad.
                </p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 column items-center mt-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-purple-50/70 backdrop-blur-sm"
                  placeholder="ejemplo@correo.com"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-black">
                  email
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-75 disabled:transform-none disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Enviar Instrucciones</span>
                <span className="material-symbols-outlined">send</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPassword;