import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Calendario from '../components/Calendario';
import Sidebar from '../components/Sidebar';

// 🚀 SOLUCIÓN: Aislamos el Slider para que no congele el Dashboard al arrastrar
const SliderAislado = ({ label, max = 10, initialValue, onFinalChange }) => {
  // Estado local solo para la animación fluida de la bolita
  const [localValue, setLocalValue] = useState(initialValue);
  const porcentaje = (localValue / max) * 100;

  const handleChange = (e) => {
    const val = Number(e.target.value);
    setLocalValue(val); // Actualiza la UI al instante
    onFinalChange(val); // Notifica al Dashboard del cambio
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        <span className="text-white text-2xl font-black">{localValue}<span className="text-gray-500 text-base">/{max}</span></span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={localValue}
        onChange={handleChange}
        className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none shadow-inner border border-gray-800
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-red-500 [&::-webkit-slider-thumb]:shadow-lg
                   [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7
                   [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-red-500 [&::-moz-range-thumb]:shadow-lg"
        style={{
          background: `linear-gradient(to right, #EF4444 ${porcentaje}%, #111827 ${porcentaje}%)`
        }}
      />
    </div>
  );
};


export default function Dashboard() {
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [nombre, setNombre] = useState('');
  const [generando, setGenerando] = useState(false);
  const [rutina, setRutina] = useState(null);
  const [refrescoCalendario, setRefrescoCalendario] = useState(0);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [diasCompletadosIds, setDiasCompletadosIds] = useState([]);
  const [entrenoHoyFinalizado, setEntrenoHoyFinalizado] = useState(false);

  const [avisoAdmin, setAvisoAdmin] = useState(null);
  const navigate = useNavigate();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [feedback, setFeedback] = useState({ sensacion: 5, eficiencia: 5, pesoCorporal: '' });
  const [archivoFoto, setArchivoFoto] = useState(null);

  const [modoEntrenando, setModoEntrenando] = useState(false);
  const [cuentaAtras, setCuentaAtras] = useState(null);
  const [diaEntrenoActivo, setDiaEntrenoActivo] = useState(null);
  const [ejercicioActualIndex, setEjercicioActualIndex] = useState(0);
  const [registroSeries, setRegistroSeries] = useState({});

  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [descansoActivo, setDescansoActivo] = useState(false);

  const cargarTodo = async () => {
    try {
      const [resPerfil, resRutina, resHistorial, resEstadoSemana] = await Promise.all([
        api.get('/perfil'),
        api.get('/entrenamiento/mi-rutina'),
        api.get('/perfil/historial'),
        api.get('/entrenamientos/estado-semana').catch(() => ({ data: [] }))
      ]);

      setPerfilUsuario(resPerfil.data);
      if(resPerfil.data.peso) {
        setFeedback(prev => ({ ...prev, pesoCorporal: resPerfil.data.peso }));
      }

      if (resRutina.data) {
        setRutina(resRutina.data);
      } else {
        setRutina(null);
      }

      setDiasCompletadosIds(resEstadoSemana.data || []);

      if (resHistorial.data && resHistorial.data.length > 0) {
        const ultimaFecha = new Date(resHistorial.data[0].fecha).toLocaleDateString('es-ES');
        const hoy = new Date().toLocaleDateString('es-ES');
        setEntrenoHoyFinalizado(ultimaFecha === hoy);
      } else {
        setEntrenoHoyFinalizado(false);
      }

    } catch (error) {
      console.error("Error al cargar la información principal", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario_nombre');

    if (!token) {
      navigate('/login');
    } else {
      setNombre(usuarioGuardado || 'Atleta');
      cargarTodo();

      api.get('/admin/aviso').then(res => {
        if (res.data && res.data.activo && res.data.mensaje.trim() !== '') {
          setAvisoAdmin(res.data.mensaje);
        }
      }).catch(e => console.log("Sin avisos del sistema"));
    }
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    if (descansoActivo && tiempoDescanso > 0) {
      interval = setInterval(() => setTiempoDescanso(t => t - 1), 1000);
    } else if (tiempoDescanso === 0) {
      setDescansoActivo(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [descansoActivo, tiempoDescanso]);

  const iniciarDescanso = (segundos) => {
    setTiempoDescanso(segundos);
    setDescansoActivo(true);
  };

  const handleGenerarRutina = async () => {
      try {
        setGenerando(true);
        await api.post('/entrenamiento/generar');
        alert("¡Rutina generada con éxito!");

        await cargarTodo();
        setDiaSeleccionado(null);

      } catch (error) {
        alert("Error al generar: " + (error.response?.data || error.message));
      } finally {
        setGenerando(false);
      }
  };

  const comenzarEntrenamiento = (dia) => {
    setDiaEntrenoActivo(dia);
    setEjercicioActualIndex(0);
    setRegistroSeries({});
    setModoEntrenando(true);

    setCuentaAtras(3);
    let contador = 3;

    const interval = setInterval(() => {
      contador--;
      if (contador > 0) {
        setCuentaAtras(contador);
      } else if (contador === 0) {
        setCuentaAtras('¡YA!');
      } else {
        setCuentaAtras(null);
        clearInterval(interval);
      }
    }, 1000);
  };

  const manejarCambioSerie = (ejDiaId, serieIndex, campo, valor) => {
    const key = `${ejDiaId}-${serieIndex}`;
    setRegistroSeries(prev => ({
      ...prev,
      [key]: { ...prev[key], [campo]: valor }
    }));
  };

  const completarSerie = (ejDiaId, serieIndex) => {
    manejarCambioSerie(ejDiaId, serieIndex, 'completada', true);

    if (perfilUsuario && perfilUsuario.cronometroAutomatico !== false) {
      iniciarDescanso(90);
    }
  };

  const siguienteEjercicio = () => {
    if (ejercicioActualIndex < diaEntrenoActivo.ejerciciosDelDia.length - 1) {
      setEjercicioActualIndex(prev => prev + 1);
      setDescansoActivo(false);
    } else {
      setMostrarModal(true);
    }
  };

  const anteriorEjercicio = () => {
    if (ejercicioActualIndex > 0) {
      setEjercicioActualIndex(prev => prev - 1);
      setDescansoActivo(false);
    }
  };

  const enviarEntrenamiento = async () => {
      if (archivoFoto && archivoFoto.size > 5 * 1024 * 1024) {
            alert("La imagen es demasiado grande. El tamaño máximo es 5MB.");
            return;
          }
    try {
      const arraySeries = Object.keys(registroSeries).map(key => {
        const [ejercicioId, serieIndex] = key.split('-');
        return {
          ejercicioId: parseInt(ejercicioId),
          numeroSerie: parseInt(serieIndex) + 1,
          peso: parseFloat(registroSeries[key].peso),
          repeticiones: parseInt(registroSeries[key].reps)
        };
      });

      const payload = {
        sensacion: feedback.sensacion,
        eficiencia: feedback.eficiencia,
        pesoCorporal: feedback.pesoCorporal === '' ? null : parseFloat(feedback.pesoCorporal),
        diaRutinaId: diaEntrenoActivo.id,
        series: arraySeries.filter(s => !isNaN(s.peso))
      };

      const formData = new FormData();
      formData.append('datos', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (archivoFoto) formData.append('foto', archivoFoto);

      const response = await api.post('/entrenamientos/completar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(response.data);

      setRefrescoCalendario(prev => prev + 1);
      setMostrarModal(false);
      setModoEntrenando(false);
      setArchivoFoto(null);
      setDiaSeleccionado(null);

      await cargarTodo();

    } catch (error) {
      alert("Error al guardar: " + (error.response?.data || error.message));
    }
  };

  if (modoEntrenando && diaEntrenoActivo) {
    if (cuentaAtras !== null) {
      return (
        <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center text-white z-[200]">
          <h1 className="text-[150px] md:text-[250px] font-black italic tracking-tighter drop-shadow-2xl animate-pulse">
            {cuentaAtras}
          </h1>
          <p className="text-xl md:text-2xl font-bold uppercase tracking-widest opacity-80 mt-4">Prepárate para sufrir</p>
        </div>
      );
    }

    const ejDia = diaEntrenoActivo.ejerciciosDelDia[ejercicioActualIndex];
    const esUltimo = ejercicioActualIndex === diaEntrenoActivo.ejerciciosDelDia.length - 1;

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col relative overflow-x-hidden">

        <header className="sticky top-0 p-4 md:p-6 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800 flex justify-between items-center shadow-lg z-50">
          <div>
            <h2 className="text-lg md:text-2xl font-black text-white leading-tight">{diaEntrenoActivo.nombreDia}</h2>
            <p className="text-red-500 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
              Ejercicio {ejercicioActualIndex + 1} de {diaEntrenoActivo.ejerciciosDelDia.length}
            </p>
          </div>
          <button onClick={() => setModoEntrenando(false)} className="text-gray-400 hover:text-white font-bold px-3 py-2 border border-gray-700 hover:border-red-500 rounded-xl transition-colors text-sm md:text-base">
            Salir
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto w-full pb-24">

          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-1 md:p-2 rounded-3xl shadow-xl border-4 border-gray-800 flex justify-center">
              <img
                src={`https://exercisedb.p.rapidapi.com/image?exerciseId=${ejDia.ejercicio.apiId}&resolution=180&rapidapi-key=75e4927375mshb3c58f8659d6bbbp18e009jsn22c1a78c5dc1`}
                alt={ejDia.ejercicio.nombre}
                className="w-auto h-auto max-h-[25vh] md:max-h-[400px] object-contain rounded-2xl"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png';
                  e.target.className = "w-16 h-16 opacity-50 m-auto py-8";
                }}
              />
            </div>

            <div className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-800 text-center flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-red-600/30">
                 <div className={`h-full bg-red-500 transition-all ${descansoActivo ? 'w-full animate-pulse' : 'w-0'}`}></div>
              </div>
              <h3 className="text-gray-500 font-black uppercase tracking-widest mb-2 text-xs md:text-sm">
                Descanso {perfilUsuario?.cronometroAutomatico !== false && <span className="text-red-500 ml-1">(Auto)</span>}
              </h3>
              <div className={`text-6xl md:text-7xl font-black font-mono mb-6 tracking-tighter ${descansoActivo ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {Math.floor(tiempoDescanso / 60)}:{(tiempoDescanso % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex gap-2 w-full max-w-sm">
                <button onClick={() => iniciarDescanso(60)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 md:py-4 rounded-2xl font-black transition-all border border-gray-700 text-lg md:text-xl active:scale-95 shadow-md">+60s</button>
                <button onClick={() => iniciarDescanso(90)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 md:py-4 rounded-2xl font-black transition-all border border-gray-700 text-lg md:text-xl active:scale-95 shadow-md">+90s</button>
                <button onClick={() => setTiempoDescanso(0)} className="flex-1 bg-red-600/10 text-red-500 hover:bg-red-600/20 py-3 md:py-4 rounded-2xl font-black transition-all border border-red-500/20 text-lg md:text-xl active:scale-95">Parar</button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl md:text-4xl font-black text-white capitalize leading-tight">
              {ejDia.ejercicio.nombre}
            </h1>

            <div className="flex gap-2 mb-2">
               <span className="inline-block bg-red-600/20 text-red-400 text-xs md:text-sm font-black px-3 py-1.5 rounded-lg border border-red-500/30">
                 🎯 Objetivo: {ejDia.series} series x {ejDia.repeticiones} reps
               </span>
            </div>

            <div className="bg-gray-900 p-4 md:p-6 rounded-3xl border border-gray-800 shadow-lg flex flex-col gap-3">
              <div className="grid grid-cols-12 gap-2 text-gray-500 font-bold text-[10px] md:text-xs uppercase tracking-widest text-center px-1">
                <div className="col-span-2">Nº</div>
                <div className="col-span-4">KG</div>
                <div className="col-span-4">Reps</div>
                <div className="col-span-2">Hecho</div>
              </div>

              {Array.from({ length: ejDia.series }).map((_, i) => {
                const valKey = `${ejDia.ejercicio.id}-${i}`;
                const vals = registroSeries[valKey] || { peso: '', reps: ejDia.repeticiones, completada: false };

                return (
                  <div key={i} className={`grid grid-cols-12 gap-2 md:gap-3 items-center group p-2 md:p-3 rounded-2xl border transition-all ${vals.completada ? 'bg-green-900/10 border-green-500/30' : 'bg-gray-950 border-gray-800'}`}>
                    <div className="col-span-2 flex justify-center">
                      <span className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl font-black ${vals.completada ? 'bg-green-600/20 text-green-500' : 'bg-gray-800 text-gray-400'}`}>{i + 1}</span>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={vals.peso}
                        disabled={vals.completada}
                        onChange={(e) => manejarCambioSerie(ejDia.ejercicio.id, i, 'peso', e.target.value)}
                        placeholder="Ej: 20"
                        className="w-full bg-transparent text-white font-black text-xl md:text-2xl p-2 rounded-lg border-2 border-transparent focus:border-red-500 focus:bg-gray-800 outline-none text-center disabled:opacity-50 transition-all"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        value={vals.reps}
                        disabled={vals.completada}
                        onChange={(e) => manejarCambioSerie(ejDia.ejercicio.id, i, 'reps', e.target.value)}
                        className="w-full bg-transparent text-white font-black text-xl md:text-2xl p-2 rounded-lg border-2 border-transparent focus:border-red-500 focus:bg-gray-800 outline-none text-center disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => vals.completada ? manejarCambioSerie(ejDia.ejercicio.id, i, 'completada', false) : completarSerie(ejDia.ejercicio.id, i)}
                        className={`w-full h-full min-h-[40px] rounded-xl font-black text-lg flex items-center justify-center transition-all active:scale-95 border ${vals.completada ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-600/30' : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-white border-gray-700'}`}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={anteriorEjercicio}
                disabled={ejercicioActualIndex === 0}
                className="flex-[0.8] py-5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-2xl transition-all border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base active:scale-95"
              >
                ← Atrás
              </button>

              <button
                onClick={siguienteEjercicio}
                className={`flex-[2] py-5 rounded-2xl font-black text-white text-lg md:text-xl uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                  esUltimo
                    ? 'bg-gradient-to-r from-red-600 to-red-800 shadow-red-600/40 border border-red-500'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500'
                }`}
              >
                {esUltimo ? 'Finalizar 🏆' : 'Siguiente →'}
              </button>
            </div>
          </div>
        </main>

        {mostrarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-gray-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-gray-700 shadow-2xl flex flex-col gap-8 max-h-[90vh] overflow-y-auto custom-scrollbar">

              <div className="text-center">
                <span className="text-5xl block mb-3 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">🔥</span>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Entreno Superado</h2>
                <p className="text-gray-400 font-bold text-sm mt-1">Registra tu progreso para las estadísticas</p>
              </div>

              <div className="flex flex-col gap-6">

                {/* 🚀 USANDO EL SLIDER AISLADO PARA EVITAR LAG */}
                <SliderAislado
                  label="Sensación del Entreno"
                  initialValue={feedback.sensacion}
                  onFinalChange={(val) => setFeedback({...feedback, sensacion: val})}
                />

                <SliderAislado
                  label="Eficiencia / Ritmo"
                  initialValue={feedback.eficiencia}
                  onFinalChange={(val) => setFeedback({...feedback, eficiencia: val})}
                />

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Peso Hoy (Opcional)</label>
                  <div className="relative w-full max-w-[200px] mx-auto">
                    <input
                      type="number"
                      step="0.1"
                      value={feedback.pesoCorporal}
                      onChange={e => setFeedback({...feedback, pesoCorporal: e.target.value})}
                      className="w-full bg-gray-950 border-2 border-gray-800 text-white font-black text-3xl py-4 rounded-2xl outline-none text-center focus:border-red-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">KG</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-800">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Foto de progreso (Opcional)</label>
                   <div className="flex gap-3">
                     <label className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-950 border border-gray-800 rounded-2xl cursor-pointer hover:border-red-500 hover:bg-red-500/10 active:scale-95 transition-all group">
                       <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</span>
                       <span className="text-xs font-bold text-gray-400 group-hover:text-red-400">Galería</span>
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => setArchivoFoto(e.target.files[0])} />
                     </label>
                     <label className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-950 border border-gray-800 rounded-2xl cursor-pointer hover:border-red-500 hover:bg-red-500/10 active:scale-95 transition-all group">
                       <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📷</span>
                       <span className="text-xs font-bold text-gray-400 group-hover:text-red-400">Cámara</span>
                       <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setArchivoFoto(e.target.files[0])} />
                     </label>
                   </div>
                   {archivoFoto && <p className="text-xs text-green-500 font-bold text-center bg-green-500/10 py-2 rounded-lg border border-green-500/20">✅ Archivo seleccionado: {archivoFoto.name}</p>}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setMostrarModal(false)} className="px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Cancelar</button>
                <button onClick={enviarEntrenamiento} className="flex-1 py-4 rounded-2xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-lg shadow-red-600/30 active:scale-95 transition-all">Terminar y Guardar 🚀</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden relative">

      <Sidebar />

      {/* 🚀 EL AVISO DEL ADMIN DENTRO DEL CONTENEDOR */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {avisoAdmin && (
          <div className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 p-3 text-center shadow-md border-b border-yellow-500/50 flex-shrink-0 animate-slide-down">
             <p className="text-white font-black text-sm uppercase tracking-tighter flex items-center justify-center gap-2">
               <span>⚠️</span> <span>AVISO: <span className="font-bold">{avisoAdmin}</span></span> <span>⚠️</span>
             </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
          <header className="p-6 md:p-8 pb-0 max-w-7xl mx-auto flex justify-between items-end">
            <div>
              <p className="text-gray-400 font-bold mb-1">Bienvenido de nuevo,</p>
              <h2 className="text-3xl md:text-4xl font-black text-white">Atleta <span className="text-red-500">{nombre}</span> 👋</h2>
            </div>
          </header>

          <main className="p-6 md:p-8 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">Tu Progreso Mensual</h2>
              <Calendario refresco={refrescoCalendario} />
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">Plan de Entrenamiento</h2>

              <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col relative h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-800"></div>

                {rutina ? (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
                      <h3 className="text-lg md:text-xl font-black uppercase italic text-white drop-shadow-md">{rutina.nombre}</h3>
                      <button onClick={handleGenerarRutina} disabled={generando} className={`text-xs md:text-sm font-bold py-2 px-3 md:px-4 rounded-lg transition-all shadow-md flex items-center gap-2 ${generando ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-red-600 text-white hover:shadow-red-600/40 border border-gray-700'}`}>
                        <span className={generando ? "animate-spin" : ""}>↻</span> Regenerar
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 pb-4 flex-1">
                      {rutina.dias.map((dia) => {
                        const completado = diasCompletadosIds.includes(dia.id);
                        const seleccionado = diaSeleccionado?.id === dia.id;

                        return (
                          <div
                            key={dia.id}
                            onClick={() => !completado && !entrenoHoyFinalizado && setDiaSeleccionado(dia)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                              completado
                                ? 'bg-green-900/20 border-green-500/50 text-green-400 cursor-default'
                                : seleccionado
                                  ? 'bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20'
                                  : entrenoHoyFinalizado
                                    ? 'bg-gray-950 border-gray-800 opacity-50 cursor-not-allowed'
                                    : 'bg-gray-950 border-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{completado ? '✅' : '💪'}</span>
                              <h4 className={`font-bold text-lg ${completado ? 'text-green-500' : 'text-white'}`}>
                                {dia.nombreDia}
                              </h4>
                            </div>
                            {completado && <span className="text-xs font-bold uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1 rounded-lg">Hecho</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t border-gray-800 pt-6">
                      {entrenoHoyFinalizado ? (
                        <button disabled className="w-full bg-green-600/20 border border-green-500/50 text-green-500 font-black py-4 rounded-xl flex justify-center items-center gap-2 uppercase tracking-widest text-sm cursor-not-allowed shadow-lg shadow-green-500/10">
                          <span className="text-xl">🏆</span> Entreno de hoy finalizado
                        </button>
                      ) : (
                        <button
                          onClick={() => comenzarEntrenamiento(diaSeleccionado)}
                          disabled={!diaSeleccionado}
                          className={`w-full font-black py-4 rounded-xl flex justify-center items-center gap-2 uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95 ${
                            diaSeleccionado
                              ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-600/30'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          }`}
                        >
                          <span className="text-xl">🏋️‍♂️</span> {diaSeleccionado ? 'Empezar Entreno' : 'Selecciona un día'}
                        </button>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-center my-auto py-10">
                    <div className="w-24 h-24 bg-gray-950 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-800"><span className="text-5xl">🏋️‍♂️</span></div>
                    <h3 className="text-2xl text-white font-bold mb-2">Sin rutina activa</h3>
                    <button onClick={handleGenerarRutina} disabled={generando} className="w-full max-w-[250px] font-bold py-4 px-6 bg-red-600 rounded-xl text-white mt-4 hover:bg-red-500 shadow-lg shadow-red-600/30">Generar Automática</button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}