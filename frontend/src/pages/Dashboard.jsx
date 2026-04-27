import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [nombre, setNombre] = useState('');
  const [generando, setGenerando] = useState(false);
  const [rutina, setRutina] = useState(null);
  const [diaExpandido, setDiaExpandido] = useState(null);
  const navigate = useNavigate();

  const cargarRutina = async () => {
    try {
      const response = await api.get('/entrenamiento/mi-rutina');
      if (response.data) {
        setRutina(response.data);
        if (response.data.dias?.length > 0) {
          setDiaExpandido(response.data.dias[0].id);
        }
      }
    } catch (error) {
      console.error("Error al cargar la rutina", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario_nombre');

    if (!token) {
      navigate('/login');
    } else {
      setNombre(usuarioGuardado || 'Atleta');
      cargarRutina();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    navigate('/login');
  };

  const handleGenerarRutina = async () => {
    try {
      setGenerando(true);
      await api.post('/entrenamiento/generar');
      alert("¡Rutina generada con éxito basándonos en tu nivel y objetivo!");
      cargarRutina(); // Recarga la nueva rutina al instante
    } catch (error) {
      alert("Error al generar: " + (error.response?.data || error.message));
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">

      <nav className="bg-gray-800 p-4 px-6 flex justify-between items-center shadow-2xl border-b border-gray-700 sticky top-0 z-50">
        <h1 className="text-2xl md:text-3xl font-black text-red-600 italic uppercase tracking-tighter drop-shadow-md">
          No Excuses
        </h1>
        <div className="flex items-center gap-6">
          <span className="text-gray-300 hidden md:inline text-sm">
            Bienvenido, <span className="font-bold text-white text-base">{nombre}</span>
          </span>
          <button onClick={handleLogout} className="border border-gray-600 text-gray-300 hover:bg-red-600 hover:border-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg">
            Salir
          </button>
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* COLUMNA IZQUIERDA: CALENDARIO */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-white">Tu Progreso Mensual</h2>
          </div>

          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl min-h-[500px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-50"></div>
            <h3 className="text-2xl text-gray-600 font-bold z-10 flex flex-col items-center gap-4">
              <span className="text-5xl">📅</span>
              Próximamente: Tu Calendario
            </h3>
          </div>
        </div>

        {/* COLUMNA DERECHA: RUTINA */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <h2 className="text-2xl font-bold text-white">Plan de Entrenamiento</h2>
          </div>

          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800"></div>

            {rutina ? (
              <div className="flex flex-col h-full">

                {/* 🚀 NUEVO: Cabecera con Botón de Regenerar */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                  <h3 className="text-lg md:text-xl font-black uppercase italic text-white drop-shadow-md">
                    {rutina.nombre}
                  </h3>
                  <button
                    onClick={handleGenerarRutina}
                    disabled={generando}
                    className={`text-xs md:text-sm font-bold py-2 px-3 md:px-4 rounded-lg transition-all shadow-md flex items-center gap-2 ${generando ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-red-600 text-white hover:shadow-red-600/40'}`}
                  >
                    <span className={generando ? "animate-spin" : ""}>↻</span>
                    {generando ? 'Creando...' : 'Regenerar'}
                  </button>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar pb-10">
                  {rutina.dias.map((dia) => (
                    <div key={dia.id} className="bg-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden transition-all duration-300">

                      <button
                        onClick={() => setDiaExpandido(diaExpandido === dia.id ? null : dia.id)}
                        className="w-full flex justify-between items-center p-4 bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 transition-all focus:outline-none"
                      >
                        <h4 className="font-bold text-lg text-white text-left">{dia.nombreDia}</h4>
                        <span className={`transform transition-transform text-red-500 font-bold ${diaExpandido === dia.id ? 'rotate-180' : 'rotate-0'}`}>
                          ▼
                        </span>
                      </button>

                      {diaExpandido === dia.id && (
                        <div className="p-4 pt-0 flex flex-col gap-3 bg-gray-900 border-t border-gray-700 mt-2">
                          {dia.ejerciciosDelDia.map((ejDia) => (
                            <div key={ejDia.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors group">

                              <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-lg bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center p-1 relative">
                                  <img
                                    // 🚀 EL TRUCO: Pasamos la URL por un proxy gratuito para saltar el bloqueo
                                    src={ejDia.ejercicio.gifUrl ? `https://corsproxy.io/?${encodeURIComponent(ejDia.ejercicio.gifUrl)}` : ''}
                                    alt={ejDia.ejercicio.nombre}
                                    className="w-full h-full object-cover rounded bg-white"
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png';
                                      e.target.className = "w-10 h-10 opacity-50";
                                    }}
                                  />
                                </div>

                                <div className="flex-1">
                                  <p className="font-bold text-white text-sm md:text-base capitalize leading-tight mb-1">{ejDia.ejercicio.nombre}</p>
                                  <span className="inline-block bg-red-600/20 text-red-400 text-xs font-bold px-2 py-1 rounded">
                                    {ejDia.series} x {ejDia.repeticiones} reps
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-400 mt-2 hidden group-hover:block px-1 pb-1 transition-all italic border-t border-gray-700 pt-2">
                                {ejDia.ejercicio.descripcion.length > 100 ? ejDia.ejercicio.descripcion.substring(0, 100) + '...' : ejDia.ejercicio.descripcion}
                              </p>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full text-center my-auto py-10">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-700">
                  <span className="text-5xl">🏋️‍♂️</span>
                </div>
                <h3 className="text-2xl text-white font-bold mb-2">Sin rutina activa</h3>
                <p className="text-gray-400 mb-8 text-sm px-4">Genera un plan de entrenamiento adaptado a tu nivel y objetivo en segundos.</p>
                <button onClick={handleGenerarRutina} disabled={generando} className={`w-full max-w-[250px] font-bold py-4 px-6 rounded-xl transition-all transform shadow-xl text-white text-lg ${generando ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:-translate-y-1 hover:shadow-red-600/40'}`}>
                  {generando ? 'Creando magia...' : 'Generar Automática'}
                </button>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}