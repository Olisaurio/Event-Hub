import React from "react";
import { useNavigate } from "react-router-dom";
import "./purpleTheme.css"; // Importamos nuestro archivo de estilos

const LandingPage = () => {
  // Usamos el hook useNavigate para la navegación
  const navigate = useNavigate();

  // Función para navegar a la página de login/register
  const handleNavigateToLogin = () => {
    navigate("/loginAndRegister");
  };

  return (
    <div id="webcrumbs"> 
      <div className="w-full min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 purple-gradient-animation">
        <header className="relative bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">event</span>
                </div>
                <span className="text-2xl font-bold text-primary-800">EventHub</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors duration-300">Características</a>
                <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors duration-300">Acerca de</a>
                <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors duration-300">Contacto</a>
                {/* Botón "Comenzar" con función de navegación */}
                <button 
                  className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-all duration-300 hover:scale-105"
                  onClick={handleNavigateToLogin}
                >
                  Comenzar
                </button>
              </div>
              <div className="md:hidden">
                <span className="material-symbols-outlined text-gray-700 text-2xl">menu</span>
              </div>
            </div>
          </nav>
        </header>
      
        <main>
          <section className="relative py-20 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Crea, Promociona y
                    <span className="text-primary-600 block">Conecta Eventos</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    EventHub es la plataforma integral que revoluciona la forma en que organizas eventos. 
                    Desde la creación hasta la promoción y participación, todo en un solo lugar.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button 
                      className="bg-primary-600 text-white px-8 py-4 rounded-full hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg"
                      onClick={handleNavigateToLogin}
                    >
                      Crear Evento Gratis
                    </button>
                    <button className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-105">
                      Ver Demo
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-transform duration-500">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 mb-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary-600 text-xl">celebration</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">Conferencia Tech 2024</h3>
                          <p className="text-primary-100 text-sm">15 Mar 2024 • 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-green-400 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-blue-400 rounded-full border-2 border-white"></div>
                          <div className="w-8 h-8 bg-white rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-primary-600 font-bold">+50</span>
                          </div>
                        </div>
                        <span className="text-white text-sm font-medium">250 participantes</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="material-symbols-outlined text-primary-600">location_on</span>
                        <span className="text-gray-700">Centro de Convenciones</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="material-symbols-outlined text-primary-600">share</span>
                        <span className="text-gray-700">Compartir en redes sociales</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </section>
      
          <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Características Principales
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Descubre todas las herramientas que necesitas para crear eventos excepcionales
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">event_available</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Creación Intuitiva</h3>
                  <p className="text-gray-600">
                    Crea eventos en minutos con nuestro editor visual intuitivo. Personaliza cada detalle con arrastrar y soltar.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">campaign</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Marketing Automatizado</h3>
                  <p className="text-gray-600">
                    Promociona tus eventos con herramientas de marketing integradas. Email, redes sociales y más.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">analytics</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Análisis Detallado</h3>
                  <p className="text-gray-600">
                    Obtén insights valiosos sobre tus eventos con reportes en tiempo real y métricas avanzadas.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">payments</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pagos Seguros</h3>
                  <p className="text-gray-600">
                    Procesa pagos de manera segura con múltiples métodos de pago y protección contra fraudes.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">group</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Gestión de Asistentes</h3>
                  <p className="text-gray-600">
                    Administra registros, envía recordatorios y mantén comunicación directa con los participantes.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-white text-2xl">video_call</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Eventos Híbridos</h3>
                  <p className="text-gray-600">
                    Combina eventos presenciales y virtuales con nuestra plataforma de streaming integrada.
                  </p>
                </div>
              </div>
            </div>
          </section>
      
          <section id="about" className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-12 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary-600 text-3xl">visibility</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Nuestra Visión</h3>
                  <p className="text-primary-100 leading-relaxed">
                    Ser la plataforma líder mundial que democratice la creación de eventos, 
                    conectando personas y comunidades a través de experiencias memorables e impactantes.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary-600 text-3xl">rocket_launch</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Nuestra Misión</h3>
                  <p className="text-primary-100 leading-relaxed">
                    Empoderar a organizadores de eventos con herramientas innovadoras y accesibles, 
                    simplificando cada aspecto desde la planificación hasta la ejecución exitosa.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary-600 text-3xl">diversity_3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Nuestros Valores</h3>
                  <p className="text-primary-100 leading-relaxed">
                    Innovación constante, transparencia total, inclusividad universal y 
                    compromiso inquebrantable con el éxito de cada evento creado en nuestra plataforma.
                  </p>
                </div>
              </div>
            </div>
          </section>
      
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                  ¿Por qué elegir EventHub?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Más que una plataforma, somos tu socio estratégico para el éxito
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white">speed</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Implementación Rápida</h3>
                      <p className="text-gray-600">
                        Configura tu primer evento en menos de 15 minutos. Sin complicaciones técnicas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white">support_agent</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Soporte 24/7</h3>
                      <p className="text-gray-600">
                        Nuestro equipo de expertos está disponible las 24 horas para ayudarte.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white">security</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Máxima Seguridad</h3>
                      <p className="text-gray-600">
                        Certificaciones ISO y encriptación de nivel bancario para proteger tus datos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white">trending_up</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Escalabilidad Total</h3>
                      <p className="text-gray-600">
                        Desde eventos íntimos hasta conferencias masivas. Crecemos contigo.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                      <span className="material-symbols-outlined text-primary-600 text-2xl">dashboard</span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">Eventos Activos</span>
                          <span className="text-2xl font-bold">24</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">Participantes</span>
                          <span className="text-2xl font-bold">1,847</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">Ingresos</span>
                          <span className="text-2xl font-bold">$45,290</span>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600">Sistema operativo al 100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary-200 rounded-full opacity-50 animate-pulse"></div>
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary-300 rounded-full opacity-50 animate-bounce"></div>
                </div>
              </div>
            </div>
          </section>
      
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Testimonios de Clientes
                </h2>
                <p className="text-xl text-gray-600">
                  Descubre lo que dicen nuestros usuarios sobre EventHub
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center space-x-1 mb-4">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "EventHub transformó completamente la manera en que organizamos nuestras conferencias. 
                    La facilidad de uso es increíble y el soporte es excepcional."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">MR</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">María Rodríguez</h4>
                      <p className="text-sm text-gray-600">Directora de Eventos, TechCorp</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center space-x-1 mb-4">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "Como organizador de bodas, necesitaba una plataforma que fuera elegante y funcional. 
                    EventHub superó todas mis expectativas."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">CL</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Carlos López</h4>
                      <p className="text-sm text-gray-600">Wedding Planner, Eventos Únicos</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-center space-x-1 mb-4">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "La herramienta de análisis de EventHub nos ayudó a aumentar la asistencia en un 300%. 
                    Los insights son invaluables."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">AS</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Ana Sánchez</h4>
                      <p className="text-sm text-gray-600">Coordinadora, Universidad Central</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
      
          <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Comienza tu próximo evento hoy
              </h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Únete a miles de organizadores que ya confían en EventHub para crear experiencias extraordinarias. 
                Prueba gratis durante 30 días, sin compromisos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="bg-white text-primary-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg font-semibold"
                  onClick={handleNavigateToLogin}
                >
                  Iniciar Prueba Gratuita
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105">
                  Agendar Demo
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center space-x-8 text-primary-200">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Soporte completo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Cancelación fácil</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl">event</span>
                  </div>
                  <span className="text-2xl font-bold">EventHub</span>
                </div>
                <p className="text-gray-400 mb-6">
                  La plataforma que conecta eventos excepcionales con audiencias globales.
                </p>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <i className="fa-brands fa-facebook text-white"></i>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <i className="fa-brands fa-twitter text-white"></i>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <i className="fa-brands fa-instagram text-white"></i>
                  </div>
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <i className="fa-brands fa-linkedin text-white"></i>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6">Producto</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Características</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Precios</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Integraciones</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">API</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6">Recursos</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Guías</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Webinars</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Centro de Ayuda</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6">Empresa</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Acerca de</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors duration-300">Careers</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div> 
    </div>
  );
};

export default LandingPage;

