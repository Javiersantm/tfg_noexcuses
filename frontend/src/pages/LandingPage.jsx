import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      
      {/* Contenedor principal */}
      <div className="max-w-3xl text-center">
        
        {/* Título de la App */}
        <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter mb-6 uppercase italic">
          No Excuses
        </h1>
        
        {/* Descripción */}
        <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
          Tu aplicación definitiva para generar rutinas, registrar tus marcas y llevar tu físico al siguiente nivel. El momento de empezar es ahora.
        </p>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
         to="/registro" 
         className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg shadow-red-600/30 text-center cursor-pointer"
       >
         Comenzar
       </Link>
          
          <button className="w-full sm:w-auto bg-transparent border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors">
            Iniciar Sesión
          </button>
        </div>

      </div>
    </div>
  );
}