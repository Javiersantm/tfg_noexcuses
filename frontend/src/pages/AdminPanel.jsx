import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [pestaña, setPestaña] = useState('PANEL'); // 'PANEL' o 'EJERCICIOS'

  // Estados Globales
  const [usuarios, setUsuarios] = useState([]);
  const [totalEntrenos, setTotalEntrenos] = useState(0);
  const [datosGrafica, setDatosGrafica] = useState([]);

  // Estados de Ejercicios
  const [ejercicios, setEjercicios] = useState([]);
  const [busquedaEj, setBusquedaEj] = useState('');
  const [modalEditando, setModalEditando] = useState(null);

  // 🚀 ESTADOS DEL MEGÁFONO
  const [aviso, setAviso] = useState({ mensaje: '', activo: false });

  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const rol = localStorage.getItem('usuario_rol');
    if (rol !== 'ADMIN') { navigate('/dashboard'); return; }
    cargarDatos();
  }, [navigate]);

  const cargarDatos = async () => {
    try {
      // Cargamos todo a la vez para que sea súper rápido
      const [resUsr, resEnt, resEj, resAv] = await Promise.all([
        api.get('/admin/usuarios'),
        api.get('/admin/entrenamientos/count'),
        api.get('/admin/ejercicios'),
        api.get('/admin/aviso')
      ]);

      setUsuarios(resUsr.data);
      setTotalEntrenos(resEnt.data);
      setEjercicios(resEj.data);

      // Si no hay aviso en BBDD, evitamos errores
      if (resAv.data) {
        setAviso(resAv.data);
      }

      procesarGrafica(resUsr.data);
    } catch (error) {
      console.error("Error cargando panel:", error);
    } finally {
      setCargando(false);
    }
  };

  const procesarGrafica = (listaUsuarios) => {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const conteoMeses = Array(12).fill(0);
    listaUsuarios.forEach(u => {
      const fecha = u.fechaRegistro ? new Date(u.fechaRegistro) : new Date();
      if (fecha.getFullYear() === new Date().getFullYear()) { conteoMeses[fecha.getMonth()]++; }
    });
    setDatosGrafica(nombresMeses.map((mes, index) => ({ name: mes, registros: conteoMeses[index] })));
  };

  const alternarEstadoUsr = async (id) => {
    if (!window.confirm("¿Seguro que quieres cambiar el estado de este usuario?")) return;
    try {
      await api.post(`/admin/usuarios/${id}/toggle-status`);
      cargarDatos();
    } catch (error) { alert("Error: " + error.message); }
  };

  const guardarEjercicio = async () => {
    try {
      await api.put(`/admin/ejercicios/${modalEditando.id}`, {
        nombre: modalEditando.nombre,
        descripcion: modalEditando.descripcion,
        activo: modalEditando.activo
      });
      setModalEditando(null);
      cargarDatos();
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // 🚀 PUBLICAR AVISO
  const publicarAviso = async () => {
    try {
      await api.post('/admin/aviso', aviso);
      alert("¡Megáfono actualizado! Todos los usuarios verán el mensaje al recargar.");
    } catch (err) { alert("Error al publicar aviso: " + err.message); }
  };

  // 🚀 DESCARGAR DATOS A CSV
  const exportarA_CSV = (datos, nombreArchivo) => {
    if (!datos || !datos.length) {
      alert("No hay datos para exportar.");
      return;
    }
    // Cogemos las cabeceras (keys del primer objeto)
    const cabeceras = Object.keys(datos[0]).join(",");
    // Convertimos cada objeto en una fila separada por comas
    const filas = datos.map(obj => Object.values(obj).map(val => `"${val !== null ? val : ''}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [cabeceras, ...filas].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${nombreArchivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-xl">
          <p className="text-gray-300 font-bold mb-1">{`Mes: ${label}`}</p>
          <p className="text-blue-500 font-black text-lg">{`${payload[0].value} Nuevos usuarios`}</p>
        </div>
      );
    }
    return null;
  };

  const ejerciciosFiltrados = ejercicios.filter(ej =>
    ej.nombre.toLowerCase().includes(busquedaEj.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0 relative">

        <header className="p-6 md:p-8 pb-0 max-w-7xl mx-auto">
          <p className="text-gray-400 font-bold mb-1 uppercase tracking-widest text-xs">Modo Dios Activado</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Panel de <span className="text-red-500">Control</span> 👑</h2>

          {/* PESTAÑAS NAVEGADORAS */}
          <div className="flex gap-4 border-b border-gray-800 pb-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setPestaña('PANEL')}
              className={`whitespace-nowrap px-6 py-3 font-bold rounded-xl transition-all ${pestaña === 'PANEL' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
            >
              📊 Métricas y Usuarios
            </button>
            <button
              onClick={() => setPestaña('EJERCICIOS')}
              className={`whitespace-nowrap px-6 py-3 font-bold rounded-xl transition-all ${pestaña === 'EJERCICIOS' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
            >
              📚 Traductor de Ejercicios
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">

          {pestaña === 'PANEL' && (
            <>
              {/* 🚀 MEGÁFONO DEL ADMIN */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 rounded-3xl border border-yellow-500/30 shadow-xl flex flex-col md:flex-row gap-4 items-center animate-fade-in">
                <div className="text-3xl">📢</div>
                <div className="flex-1 w-full text-center md:text-left">
                  <h4 className="text-yellow-500 font-black uppercase text-xs tracking-widest mb-2">Megáfono Global</h4>
                  <input
                    type="text"
                    placeholder="Escribe un aviso para todos los usuarios (ej: Servidor en mantenimiento hoy a las 02:00)..."
                    className="w-full bg-gray-950/50 border border-yellow-500/30 rounded-xl p-3 text-white font-bold outline-none focus:border-yellow-500 transition-all placeholder-yellow-800/50"
                    value={aviso.mensaje}
                    onChange={e => setAviso({...aviso, mensaje: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-950/50 px-4 py-3 rounded-xl border border-yellow-500/30">
                    <input type="checkbox" checked={aviso.activo} onChange={e => setAviso({...aviso, activo: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                    <span className="text-xs font-bold text-gray-300 uppercase">Activo</span>
                  </label>
                  <button onClick={publicarAviso} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wider text-sm">Publicar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full pointer-events-none"></div><span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Usuarios</span><div className="text-4xl font-black text-white mt-2 flex items-center gap-2"><span>👥</span> {usuarios.length}</div></div>
                <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full pointer-events-none"></div><span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Entrenos</span><div className="text-4xl font-black text-white mt-2 flex items-center gap-2"><span>🔥</span> {totalEntrenos}</div></div>
                <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full pointer-events-none"></div><span className="text-green-500 text-xs font-bold uppercase tracking-widest">Activos</span><div className="text-4xl font-black text-white mt-2 flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></span> {usuarios.filter(u => u.activo).length}</div></div>
                <div className="bg-gray-900 p-6 rounded-3xl border border-red-900/50 shadow-xl relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-bl-full pointer-events-none"></div><span className="text-red-500 text-xs font-bold uppercase tracking-widest">Baneados</span><div className="text-4xl font-black text-white mt-2 flex items-center gap-2"><span>⛔</span> {usuarios.filter(u => !u.activo).length}</div></div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                <div className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden h-[450px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-800 to-blue-500"></div>
                  <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Nuevos Usuarios (Este Año)</h3>
                  <div className="w-full flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={datosGrafica} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} /><XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} /><YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} /><Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} /><Bar dataKey="registros" fill="#3B82F6" radius={[6, 6, 0, 0]} animationDuration={1500} /></BarChart></ResponsiveContainer></div>
                </div>

                <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col h-[450px]">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500"></div>

                  <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Gestión Directa</h3>
                    {/* 🚀 BOTÓN DE EXPORTAR CSV */}
                    <button onClick={() => exportarA_CSV(usuarios, "usuarios_noexcuses")} className="text-xs bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-bold text-blue-400 border border-blue-500/30 transition-all active:scale-95 shadow-lg">
                      📥 Exportar CSV
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {cargando ? <div className="p-10 text-center text-gray-500 font-bold">Cargando...</div> : (
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-900 shadow-md">
                          <tr className="bg-gray-950/50 text-gray-500 text-xs uppercase tracking-widest"><th className="p-4 font-bold">Usuario</th><th className="p-4 font-bold">Rol</th><th className="p-4 font-bold">Estado</th><th className="p-4 font-bold text-center">Acciones</th></tr>
                        </thead>
                        <tbody className="text-sm">
                          {usuarios.map((user) => (
                            <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                              <td className="p-4"><div className="font-bold text-white">@{user.username}</div><div className="text-gray-500 text-xs">{user.correo}</div></td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${user.rol === 'ADMIN' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-800 text-gray-400'}`}>{user.rol}</span></td>
                              <td className="p-4">{user.activo ? <span className="text-green-500 font-bold flex items-center gap-1">Activo</span> : <span className="text-red-500 font-bold flex items-center gap-1">Baneado</span>}</td>
                              <td className="p-4 text-center">{user.username !== 'javi_admin' && <button onClick={() => alternarEstadoUsr(user.id)} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${user.activo ? 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30' : 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white border border-green-600/30'}`}>{user.activo ? 'Banear' : 'Reactivar'}</button>}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {pestaña === 'EJERCICIOS' && (
            <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative flex flex-col h-[70vh] animate-fade-in">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-800 to-purple-500"></div>

              <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-950/30">
                <h3 className="text-xl font-bold text-white whitespace-nowrap">Biblioteca ({ejercicios.length})</h3>
                <div className="flex w-full sm:w-auto gap-4">
                  <input
                    type="text"
                    placeholder="Buscar ejercicio..."
                    value={busquedaEj}
                    onChange={e => setBusquedaEj(e.target.value)}
                    className="w-full sm:w-64 bg-gray-950 border border-gray-700 text-white px-4 py-2 rounded-xl focus:border-purple-500 outline-none transition-colors"
                  />
                  {/* 🚀 BOTÓN DE EXPORTAR CSV EJERCICIOS */}
                  <button onClick={() => exportarA_CSV(ejercicios, "biblioteca_ejercicios")} className="whitespace-nowrap text-xs bg-purple-900/30 hover:bg-purple-600 px-4 py-2 rounded-xl font-bold text-purple-400 hover:text-white border border-purple-500/50 transition-all active:scale-95 shadow-lg">
                    📥 Descargar CSV
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {cargando ? <div className="p-10 text-center text-gray-500 font-bold">Cargando base de datos...</div> : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-900 shadow-md z-10">
                      <tr className="bg-gray-950/50 text-gray-500 text-xs uppercase tracking-widest">
                        <th className="p-4 font-bold w-20">Imagen</th>
                        <th className="p-4 font-bold">Nombre y Desc</th>
                        <th className="p-4 font-bold text-center">Estado</th>
                        <th className="p-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {ejerciciosFiltrados.map((ej) => (
                        <tr key={ej.id} className={`border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${!ej.activo ? 'opacity-50' : ''}`}>
                          <td className="p-4">
                            <img src={`https://exercisedb.p.rapidapi.com/image?exerciseId=${ej.apiId}&resolution=180&rapidapi-key=75e4927375mshb3c58f8659d6bbbp18e009jsn22c1a78c5dc1`} alt="ej" className="w-16 h-16 object-contain bg-white rounded-lg" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png'; }} />
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="font-black text-white text-base mb-1 capitalize">{ej.nombre}</div>
                            <div className="text-gray-400 text-xs line-clamp-2">{ej.descripcion || 'Sin descripción'}</div>
                          </td>
                          <td className="p-4 text-center">
                            {ej.activo ? <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs font-bold">Visible</span> : <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">Oculto</span>}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setModalEditando({ ...ej })}
                              className="px-4 py-2 bg-gray-800 hover:bg-purple-600 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors border border-gray-700 hover:border-purple-500"
                            >
                              Editar ✏️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>

        {/* MODAL DE EDICIÓN DE EJERCICIOS */}
        {modalEditando && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gray-900 rounded-3xl p-6 md:p-8 w-full max-w-lg border border-gray-700 shadow-2xl flex flex-col gap-6">

              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Editar <span className="text-purple-500">Ejercicio</span></h2>
                <img src={`https://exercisedb.p.rapidapi.com/image?exerciseId=${modalEditando.apiId}&resolution=180&rapidapi-key=75e4927375mshb3c58f8659d6bbbp18e009jsn22c1a78c5dc1`} alt="ej" className="w-16 h-16 object-contain bg-white rounded-lg border-2 border-gray-700" />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nombre en Español</label>
                  <input type="text" value={modalEditando.nombre} onChange={e => setModalEditando({...modalEditando, nombre: e.target.value})} className="w-full bg-gray-950 border border-gray-800 text-white font-bold p-3 rounded-xl outline-none focus:border-purple-500 transition-colors" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descripción o Instrucciones</label>
                  <textarea rows="4" value={modalEditando.descripcion || ''} onChange={e => setModalEditando({...modalEditando, descripcion: e.target.value})} className="w-full bg-gray-950 border border-gray-800 text-gray-300 p-3 rounded-xl outline-none focus:border-purple-500 transition-colors custom-scrollbar resize-none"></textarea>
                </div>

                <div className="flex items-center gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
                  <input type="checkbox" id="activo" checked={modalEditando.activo} onChange={e => setModalEditando({...modalEditando, activo: e.target.checked})} className="w-5 h-5 accent-purple-600 cursor-pointer" />
                  <label htmlFor="activo" className="text-sm font-bold text-gray-300 cursor-pointer">Visible para los usuarios (La IA puede asignarlo)</label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setModalEditando(null)} className="px-6 py-4 rounded-xl font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Cancelar</button>
                <button onClick={guardarEjercicio} className="flex-1 py-4 rounded-xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 shadow-lg shadow-purple-600/30 active:scale-95 transition-all">Guardar Cambios</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}