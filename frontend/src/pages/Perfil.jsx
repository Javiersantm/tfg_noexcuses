import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    peso: '', altura: '', objetivo: '', nivel: '', diasEntreno: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resPerfil = await api.get('/perfil');
      setPerfil(resPerfil.data);
      setFormData({
        peso: resPerfil.data.peso || '',
        altura: resPerfil.data.altura || '',
        objetivo: resPerfil.data.objetivo || 'CONSEGUIR_MUSCULO',
        nivel: resPerfil.data.nivel || 'PRINCIPIANTE',
        diasEntreno: resPerfil.data.diasEntreno || 3
      });

      const resHistorial = await api.get('/perfil/historial');
      setHistorial(resHistorial.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
         navigate('/login');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 SUBIR FOTO DE PERFIL
  const handleCambiarFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Control de tamaño
    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 5MB");
      return;
    }

    const fd = new FormData();
    fd.append('foto', archivo);

    try {
      setGuardando(true);
      const res = await api.post('/perfil/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPerfil(res.data);
      alert("¡Foto de perfil actualizada!");
      window.location.reload(); // Recargar para que el Sidebar se actualice
    } catch (err) {
      alert("Error al subir foto");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardar = async (e) => {
      e.preventDefault();
      setGuardando(true);
      try {
        const datosLimpios = {
          ...formData,
          peso: parseFloat(formData.peso),
          altura: parseFloat(formData.altura),
          diasEntreno: parseInt(formData.diasEntreno)
        };

        const res = await api.put('/perfil/editar', datosLimpios);
        setPerfil(res.data);
        setEditando(false);
        alert("¡Perfil actualizado con éxito!");
      } catch (error) {
        alert("Error al actualizar: " + (error.response?.data || error.message));
      } finally {
        setGuardando(false);
      }
    };

  if (!perfil) return <div className="min-h-screen bg-gray-950 flex justify-center items-center font-bold text-white">Cargando perfil...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        <header className="p-6 md:p-8 pb-0 max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-gray-400 font-bold mb-1">Ajustes y progreso</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Tu <span className="text-red-500">Perfil</span> ⚙️</h2>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* COLUMNA IZQUIERDA: DATOS Y EDICIÓN */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h2 className="text-2xl font-bold text-white">Datos Personales</h2>
              <button
                onClick={() => setEditando(!editando)}
                className={`text-sm px-4 py-2 rounded-lg text-white font-bold transition-colors ${editando ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' : 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30'}`}
              >
                {editando ? 'Cancelar' : '✏️ Editar Datos'}
              </button>
            </div>

            <div className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl">
              {editando ? (
                <form onSubmit={handleGuardar} className="flex flex-col gap-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Peso (kg)</label>
                      <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} className="w-full bg-gray-950 text-white rounded-xl p-3 border border-gray-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Altura (m)</label>
                      <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleChange} className="w-full bg-gray-950 text-white rounded-xl p-3 border border-gray-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Objetivo Físico</label>
                    <select name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full bg-gray-950 text-white rounded-xl p-3 border border-gray-800 focus:border-red-500 focus:outline-none cursor-pointer">
                      <option value="PERDER_PESO">Perder Peso</option>
                      <option value="MANTENERSE">Mantenerse</option>
                      <option value="CONSEGUIR_MUSCULO">Conseguir Músculo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Nivel de Experiencia</label>
                    <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full bg-gray-950 text-white rounded-xl p-3 border border-gray-800 focus:border-red-500 focus:outline-none cursor-pointer">
                      <option value="PRINCIPIANTE">Principiante</option>
                      <option value="INTERMEDIO">Intermedio</option>
                      <option value="AVANZADO">Avanzado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">Días de entreno (Semana)</label>
                    <input type="number" min="1" max="7" name="diasEntreno" value={formData.diasEntreno} onChange={handleChange} className="w-full bg-gray-950 text-white rounded-xl p-3 border border-gray-800 focus:border-red-500 focus:outline-none" />
                  </div>

                  <button type="submit" disabled={guardando} className="mt-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95">
                    {guardando ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-6 animate-fade-in">

                  {/* 🚀 ZONA DEL AVATAR FOTO DE PERFIL */}
                  <div className="flex flex-col items-center gap-4 mb-4">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-red-600 overflow-hidden shadow-2xl bg-gray-800 flex items-center justify-center text-5xl">
                        {perfil.fotoPerfil ? (
                          <img src={`http://localhost:8083/uploads/${perfil.fotoPerfil}`} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-red-600 p-3 rounded-full cursor-pointer hover:scale-110 transition-all shadow-lg border-2 border-gray-900">
                        📷
                        <input type="file" className="hidden" onChange={handleCambiarFoto} accept="image/*" />
                      </label>
                    </div>

                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white capitalize">{perfil.nombre} {perfil.apellidos}</h3>
                      <p className="text-gray-400 font-bold">@{perfil.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-col items-center justify-center">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Peso</span>
                      <span className="text-2xl font-black text-white">{perfil.peso || '--'} <span className="text-sm text-gray-400 font-normal">kg</span></span>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-col items-center justify-center">
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Altura</span>
                      <span className="text-2xl font-black text-white">{perfil.altura || '--'} <span className="text-sm text-gray-400 font-normal">m</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-sm mt-2">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider font-bold text-xs">Objetivo Físico</span>
                      <span className="font-bold text-red-400">{perfil.objetivo ? perfil.objetivo.replace('_', ' ') : 'Sin definir'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider font-bold text-xs">Nivel</span>
                      <span className="font-bold text-white">{perfil.nivel || 'Sin definir'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                      <span className="text-gray-400 uppercase tracking-wider font-bold text-xs">Frecuencia</span>
                      <span className="font-bold text-white">{perfil.diasEntreno || '-'} días / semana</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: HISTORIAL */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h2 className="text-2xl font-bold text-white">Tu Historial 🔥</h2>
              <span className="bg-red-600/20 text-red-500 font-bold px-3 py-1 rounded-full text-sm">
                {historial.length} Entrenos
              </span>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500"></div>

              {historial.length > 0 ? (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar mt-2">
                  {historial.map((entreno) => (
                    <div key={entreno.id} className="flex justify-between items-center bg-gray-950 p-4 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-xl shadow-inner border border-gray-800">
                          🏋️‍♂️
                        </div>
                        <div>
                          <p className="font-bold text-white">Entrenamiento Completado</p>
                          <p className="text-xs text-gray-400 capitalize mt-1">
                            {new Date(entreno.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <span className="text-green-500 font-bold">✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center text-gray-500 my-auto">
                  <span className="text-6xl mb-4 opacity-50">📭</span>
                  <p className="text-xl font-bold text-gray-400">Sin historial</p>
                  <p className="text-sm mt-2 max-w-[250px]">Aún no tienes entrenamientos registrados. ¡Ve al Dashboard y dale caña!</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}