import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Evolucion() {
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const cargarFotos = async () => {
      try {
        const res = await api.get('/perfil/historial');
        // Filtramos solo los días que tienen foto
        setFotos(res.data.filter(entreno => entreno.fotoUrl));
      } catch (error) {
        console.error("Error cargando fotos", error);
      }
    };
    cargarFotos();
  }, []);

  return (
      // 🚀 PARCHE: flex-col en móvil, flex-row en PC. Fondo más oscuro.
      <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
        <Sidebar />
        {/* 🚀 PARCHE: pb-24 añade margen abajo en móvil para que el menú no tape nada */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        <header className="p-6 md:p-8 pb-0 max-w-7xl mx-auto">
          <p className="text-gray-400 font-bold mb-1">Visualiza tus resultados</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">Mi <span className="text-red-500">Evolución</span> 📸</h2>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          {fotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {fotos.map(f => (
                <div key={f.id} className="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-xl group hover:border-red-500 transition-all">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-900">
                                      <img
                                        // 🚀 EL PARCHE: Cambiamos el puerto al 8083, que es donde está tu backend
                                        src={`http://localhost:8083${f.fotoUrl}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt="Progreso"
                                      />
                                    </div>
                  <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <p className="text-white font-bold">{new Date(f.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                    {/* 🚀 PARCHE: Solo mostramos el peso si realmente hay un número guardado */}
                    {f.pesoCorporal && f.pesoCorporal > 0 && (
                      <p className="text-red-500 text-xs font-black uppercase tracking-widest mt-1">
                        {f.pesoCorporal} KG
                      </p>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700">
              <span className="text-6xl">📸</span>
              <h3 className="text-xl font-bold mt-4 text-gray-400">Aún no hay fotos de progreso</h3>
              <p className="text-gray-500 text-sm mt-2">Sube una foto al finalizar tu entrenamiento para verla aquí.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}