import React from "react";

const iconMap = {
  Todos: {
    icon: "apps",
    bgClass: "bg-gray-100",
    iconClass: "text-gray-500",
  },
  Cultura: {
    icon: "theater_comedy",
    bgClass: "bg-purple-100",
    iconClass: "text-purple-500",
  },
  Tecnología: {
    icon: "developer_mode",
    bgClass: "bg-yellow-100",
    iconClass: "text-yellow-600",
  },
  Deporte: {
    icon: "sports_soccer",
    bgClass: "bg-red-100",
    iconClass: "text-red-500",
  },
  Educación: {
    icon: "school",
    bgClass: "bg-indigo-100",
    iconClass: "text-indigo-500",
  },
  Negocios: {
    icon: "business_center",
    bgClass: "bg-emerald-100",
    iconClass: "text-emerald-500",
  },
};


const CategoryGridSection = ({ categories = [], onCategorySelect }) => {
  return (
    <section className="mb-8 md:mb-12 px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">
        Explorar por Categoría
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {categories.map((category) => {
          const {
            icon = "category",
            bgClass = "bg-gray-100",
            iconClass = "text-gray-500",
          } = iconMap[category.name] || {};

          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="group p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl text-left flex flex-col justify-start items-start"
            >
              <div
                className={`w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <span className={`material-symbols-outlined ${iconClass}`}>
                  {icon}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {category.name}
              </h4>
              <p className="text-sm text-gray-600">{category.descripcion}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGridSection;
