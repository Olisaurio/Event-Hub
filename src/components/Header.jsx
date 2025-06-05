import React from 'react';
import "../Components-styles/Header.css"; // Actualizado

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-4 sm:space-x-8 w-full sm:w-auto justify-between sm:justify-start">
            <h1 className="text-2xl font-bold text-primary-600">EventHub</h1>
            <div className="relative w-full sm:w-auto mt-4 sm:mt-0 order-3 sm:order-2">
              <input
                type="text"
                placeholder="Buscar eventos..."
                className="w-full sm:w-64 md:w-80 lg:w-96 pl-12 pr-4 py-2 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 order-2 sm:order-3">
            <span className="material-symbols-outlined text-gray-600 cursor-pointer hover:text-primary-600 transition-colors duration-200">
              notifications
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                <span className="text-white text-sm font-semibold">JD</span>
              </div>
              <span className="text-gray-700 font-medium hidden sm:inline">
                Juan Pérez
              </span>
            </div>
          </div>
        </header>
  );
};

export default Header;
