import React from "react";
import '../Components-styles/footer.css'; // Importa el archivo CSS

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main content */}
        <div className="footer-grid">
          {/* Brand section */}
          <div className="footer-brand">
            <div>
              <h2>EventHub</h2>
              <p>
                Descubre, conecta y disfruta de los mejores eventos en tu ciudad. 
                ¡Haz que cada experiencia cuente!
              </p>
            </div>
            
            {/* Contact info */}
            <div className="contact-info">
              <div className="contact-item">
                <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>hola@eventhub.com</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Ciudad de México, México</span>
              </div>
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="nav-section">
            <h3>Explorar</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#" className="nav-link">Eventos populares</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Categorías</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Calendario</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Crear evento</a>
              </li>
            </ul>
          </div>
          
          <div className="nav-section">
            <h3>Empresa</h3>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#" className="nav-link">Acerca de nosotros</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Contacto</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Blog</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Ayuda</a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <div className="newsletter-text">
              <h3>¡No te pierdas nada!</h3>
              <p>Suscríbete para recibir los mejores eventos en tu email.</p>
            </div>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="newsletter-input"
              />
              <button className="newsletter-button">
                Suscribirse
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="footer-bottom">
          <div className="footer-info">
            <p className="copyright">
              © 2025 EventHub. Todos los derechos reservados.
            </p>
            <div className="legal-links">
              <a href="#" className="legal-link">Términos</a>
              <a href="#" className="legal-link">Privacidad</a>
              <a href="#" className="legal-link">Cookies</a>
            </div>
          </div>
          
          {/* Social media */}
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Twitter">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.987 11.988 11.987s11.987-5.366 11.987-11.987C24.014 5.367 18.648 0 12.017 0zm7.624 18.611c-.24.479-.547.878-.997 1.042-.45.164-.928.164-1.378 0-.45-.164-.758-.563-.997-1.042-.239-.479-.239-.997 0-1.476.24-.479.547-.878.997-1.042.45-.164.928-.164 1.378 0 .45.164.758.563.997 1.042.239.479.239.997 0 1.476z"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;