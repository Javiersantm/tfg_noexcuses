import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Ajustes() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/perfil')
      .then(res => { setPerfil(res.data); setCargando(false); })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const toggleCronometro = async () => {
    const nuevoEstado = !perfil.cronometroAutomatico;
    setPerfil({ ...perfil, cronometroAutomatico: nuevoEstado }); // Actualizamos UI rápido
    try {
      // Mandamos al backend la actualización
      await api.put('/perfil/editar', { ...perfil, cronometroAutomatico: nuevoEstado });
    } catch (error) {
      alert("Error al guardar ajuste");
      setPerfil({ ...perfil, cronometroAutomatico: !nuevoEstado }); // Revertimos si falla
    }
  };

  if (cargando) return <div className="bg-gray-950 h-screen flex justify-center items-center text-white">Cargando...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        <header className="p-6 md:p-8 pb-0 max-w-4xl mx-auto">
          <p className="text-gray-400 font-bold mb-1">Personaliza tu experiencia</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Tus <span className="text-red-500">Ajustes</span> 🎛️</h2>
        </header>

        <main className="p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">

          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl flex items-center justify-between hover:border-gray-700 transition-all cursor-pointer" onClick={toggleCronometro}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-950 rounded-full flex items-center justify-center text-2xl border border-gray-800 shadow-inner">
                ⏱️
              </div>
              <div>
                <h3 className="font-black text-white text-lg">Cronómetro Automático</h3>
                <p className="text-gray-400 text-sm max-w-xs mt-1">El descanso (90s) se iniciará automáticamente al marcar una serie como completada.</p>
              </div>
            </div>

            {/* Toggle Switch (Interruptor visual) */}
            <div className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${perfil.cronometroAutomatico ? 'bg-red-600' : 'bg-gray-700'}`}>
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${perfil.cronometroAutomatico ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
          </div>

          <div className="bg-gray-950/50 p-6 rounded-3xl border border-gray-800/50 flex flex-col items-center justify-center text-center opacity-50 mt-4">
             <span className="text-3xl mb-2">🚧</span>
             <p className="font-bold text-gray-400">Próximamente más ajustes...</p>
             <p className="text-xs text-gray-500">Modo oscuro/claro, notificaciones, etc.</p>
          </div>

        </main>
      </div>
    </div>
  );
}