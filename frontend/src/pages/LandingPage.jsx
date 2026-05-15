import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-red-500 selection:text-white overflow-x-hidden">

      {/* 🚀 NAVBAR FIJO Y TRANSPARENTE */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <span className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
            No<span className="text-red-600">Excuses</span>
          </span>
          <Link to="/login" className="text-sm md:text-base font-bold text-gray-400 hover:text-white transition-colors">
            Iniciar Sesión →
          </Link>
        </div>
      </nav>

      {/* 🚀 SECCIÓN PRINCIPAL (HERO) */}
      <main className="pt-40 pb-20 px-6 relative flex flex-col items-center text-center min-h-[85vh] justify-center">

        {/* Efecto de resplandor rojo de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600/20 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>

        <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase mb-8 z-10 animate-fade-in">
          Tu Entrenador Personal Inteligente
        </span>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-6 uppercase italic leading-tight z-10">
          Forja tu físico. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Cero Excusas.</span>
        </h1>

        <p className="text-lg md:text-2xl text-gray-400 mb-10 font-light max-w-2xl z-10 leading-relaxed">
          Rutinas inteligentes, registro de marcas en tiempo real y análisis visual de tu evolución. Todo lo que necesitas para alcanzar tu mejor versión.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <Link
            to="/registro"
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 px-10 rounded-xl text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-red-600/30 text-center uppercase tracking-wider"
          >
            Empezar la Acción
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-gray-900 border-2 border-gray-700 hover:border-gray-500 text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors text-center"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </main>

      {/* 🚀 SECCIÓN DE CARACTERÍSTICAS (FEATURES) */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10 border-t border-gray-800">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic">
            Entrena como un <span className="text-red-500">profesional</span>
          </h2>
          <p className="text-gray-400 mt-4 text-lg">Olvídate del papel y boli. Lleva el control total en tu bolsillo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Tarjeta 1 */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-red-500/50 transition-colors group shadow-2xl">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
              🧠
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Rutinas IA</h3>
            <p className="text-gray-400 leading-relaxed">
              Algoritmos avanzados que diseñan la rutina perfecta adaptada a tus días, nivel y objetivos, utilizando más de 100 ejercicios reales.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-red-500/50 transition-colors group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full pointer-events-none"></div>
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
              ⏱️
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Modo Focus</h3>
            <p className="text-gray-400 leading-relaxed">
              Entrena sin distracciones. Cronómetro integrado, animaciones visuales de los ejercicios y registro rápido de kilos y repeticiones.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl hover:border-red-500/50 transition-colors group shadow-2xl">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">
              📸
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Evolución Visual</h3>
            <p className="text-gray-400 leading-relaxed">
              Sube fotos tras cada entrenamiento, registra tu peso corporal y observa tu cambio físico real en el calendario interactivo.
            </p>
          </div>

        </div>
      </section>

      {/* 🚀 FOOTER */}
      <footer className="border-t border-gray-800 py-12 text-center bg-gray-950">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter opacity-50 mb-2">
          No<span className="text-red-600">Excuses</span>
        </h2>
        <p className="text-gray-500 font-bold text-sm">© {new Date().getFullYear()} - Proyecto TFG</p>
        <p className="text-gray-600 text-xs mt-1">Elevando el fitness al siguiente nivel.</p>
      </footer>

    </div>
  );
}