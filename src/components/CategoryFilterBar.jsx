import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Components-styles/CategoryFilterBar.css'; // Asegúrate de crear este archivo CSS

// Asumiendo que las categorías vienen de alguna parte, por ejemplo, props o un contexto/API
// Por ahora, usaremos un array de ejemplo similar al de la imagen de referencia.
const defaultCategories = [
  { name: 'Todos', id: 'all' }, // Opción para mostrar todos los eventos
  { name: 'Para ti', id: 'foryou' }, // Placeholder, la lógica de "Para ti" puede ser compleja
  { name: 'Online', id: 'online' },
  { name: 'Hoy', id: 'today' },
  { name: 'Este fin de semana', id: 'weekend' },
  { name: 'Gratis', id: 'free' }, // Esto podría ser parte del filtro de precio también
  { name: 'Música', id: 'musica' },
  { name: 'Gastronomía', id: 'gastronomia' },
  { name: 'Solidaridad', id: 'solidaridad' },
  // ... puedes añadir más categorías según tu db.json o necesidades
];

const CategoryFilterBar = ({ categories = defaultCategories, onCategorySelect, activeCategory }) => {
  const navigate = useNavigate();

  const handleSelectCategory = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category.id);
    } else {
      // Si no hay un manejador onCategorySelect, asumimos que queremos navegar
      // a una página de eventos filtrada por esta categoría.
      // La ruta /events/:categoryName es un ejemplo, ajústala a tu enrutamiento.
      navigate(`/events?category=${category.id}`);
    }
  };

  return (
    <div className="category-filter-bar-container">
      <nav className="category-filter-bar">
        <ul className="category-list">
          {categories.map((category) => (
            <li 
              key={category.id} 
              className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleSelectCategory(category)}
            >
              {category.name}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default CategoryFilterBar;

