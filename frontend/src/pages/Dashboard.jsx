import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Calendario from '../components/Calendario';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [perfilUsuario, setPerfilUsuario] = useState(null); // Guardamos el perfil para leer los ajustes
  const [nombre, setNombre] = useState('');
  const [generando, setGenerando] = useState(false);
  const [rutina, setRutina] = useState(null);
  const [refrescoCalendario, setRefrescoCalendario] = useState(0);

  // 🚀 ESTADOS DE SELECCIÓN Y FINALIZACIÓN (BASADOS EN BACKEND)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [diasCompletadosIds, setDiasCompletadosIds] = useState([]); // Ahora guarda un array de IDs de la BD
  const [entrenoHoyFinalizado, setEntrenoHoyFinalizado] = useState(false);

  const [avisoAdmin, setAvisoAdmin] = useState(null);
  const navigate = useNavigate();

  // 🚀 ESTADOS DEL MODAL DE FEEDBACK
  const [mostrarModal, setMostrarModal] = useState(false);
  const [feedback, setFeedback] = useState({ sensacion: 5, eficiencia: 5, pesoCorporal: '' });
  const [archivoFoto, setArchivoFoto] = useState(null);

  // 🏋️‍♂️ ESTADOS DEL MODO ENTRENANDO (FOCUS)
  const [modoEntrenando, setModoEntrenando] = useState(false);
  const [cuentaAtras, setCuentaAtras] = useState(null); // Estado para la pantalla "3, 2, 1, ¡YA!"
  const [diaEntrenoActivo, setDiaEntrenoActivo] = useState(null);
  const [ejercicioActualIndex, setEjercicioActualIndex] = useState(0);
  const [registroSeries, setRegistroSeries] = useState({});

  // ⏱️ ESTADOS DEL CRONÓMETRO DE DESCANSO
  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [descansoActivo, setDescansoActivo] = useState(false);

  // 🚀 NUEVA FUNCIÓN MAESTRA QUE CARGA TODA LA VERDAD DESDE EL SERVIDOR
  const cargarTodo = async () => {
    try {
      // Pedimos todo a la vez para que sea rápido
      const [resPerfil, resRutina, resHistorial, resEstadoSemana] = await Promise.all([
        api.get('/perfil'),
        api.get('/entrenamiento/mi-rutina'),
        api.get('/perfil/historial'),
        api.get('/entrenamientos/estado-semana').catch(() => ({ data: [] })) // El nuevo endpoint
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

      // 1. Array de IDs de días completados (del Backend)
      setDiasCompletadosIds(resEstadoSemana.data || []);

      // 2. Comprobamos si el último entreno del historial tiene fecha de hoy
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
      cargarTodo(); // Llamamos a la función maestra

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

        await cargarTodo(); // 🚀 Recargamos todo del backend para ver los cambios
        setDiaSeleccionado(null);

      } catch (error) {
        alert("Error al generar: " + (error.response?.data || error.message));
      } finally {
        setGenerando(false);
      }
  };

  // 🚀 LÓGICA DE LA CUENTA ATRÁS Y EMPEZAR
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

  // 🚀 LÓGICA DEL BOTÓN DE COMPLETAR SERIE (✓)
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
        diaRutinaId: diaEntrenoActivo.id, // 🚀 ENVIAMOS QUÉ DÍA SE COMPLETÓ
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

      // 🚀 UNA VEZ ENVIADO, LE PEDIMOS AL SERVIDOR QUE NOS ACTUALICE LA VISTA
      await cargarTodo();

    } catch (error) {
      alert("Error al guardar: " + (error.response?.data || error.message));
    }
  };

  if (modoEntrenando && diaEntrenoActivo) {
    // 🚀 PANTALLA ROJA DE CUENTA ATRÁS
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

                    {/* 🚀 BOTÓN DE CHECK PARA MARCAR SERIE Y ACTIVAR CRONO */}
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
            <div className="bg-gray-900 rounded-3xl p-6 md:p-8 w-full max-w-md border border-gray-700 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">

              <div className="text-center">
                <span className="text-4xl block mb-2">🔥</span>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Entreno Superado</h2>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                  Sensación <span className="text-white text-lg">{feedback.sensacion}/10</span>
                </label>
                <input type="range" min="0" max="10" value={feedback.sensacion} onChange={e => setFeedback({...feedback, sensacion: Number(e.target.value)})} className="w-full h-3 bg-gray-800 rounded-full appearance-none cursor-pointer accent-red-500" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex justify-between items-center">
                  Eficiencia <span className="text-white text-lg">{feedback.eficiencia}/10</span>
                </label>
                <input type="range" min="0" max="10" value={feedback.eficiencia} onChange={e => setFeedback({...feedback, eficiencia: Number(e.target.value)})} className="w-full h-3 bg-gray-800 rounded-full appearance-none cursor-pointer accent-red-500" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Peso Hoy (KG)</label>
                  <input type="number" step="0.1" value={feedback.pesoCorporal} onChange={e => setFeedback({...feedback, pesoCorporal: e.target.value})} className="w-full bg-gray-950 border border-gray-800 text-white font-black text-xl p-4 rounded-2xl outline-none text-center focus:border-red-500" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Foto de progreso</label>
                 <div className="flex gap-3">
                   <label className="flex-1 flex items-center justify-center p-4 bg-gray-950 border border-gray-800 rounded-2xl cursor-pointer hover:border-red-500 active:scale-95 transition-all">
                     <span className="text-2xl mr-2">🖼️</span> <span className="text-sm font-bold text-gray-400">Galería</span>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => setArchivoFoto(e.target.files[0])} />
                   </label>
                   <label className="flex-1 flex items-center justify-center p-4 bg-gray-950 border border-gray-800 rounded-2xl cursor-pointer hover:border-red-500 active:scale-95 transition-all">
                     <span className="text-2xl mr-2">📷</span> <span className="text-sm font-bold text-gray-400">Cámara</span>
                     <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setArchivoFoto(e.target.files[0])} />
                   </label>
                 </div>
                 {archivoFoto && <p className="text-xs text-green-500 font-bold text-center mt-2">✅ Foto lista para subir</p>}
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setMostrarModal(false)} className="px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors">Atrás</button>
                <button onClick={enviarEntrenamiento} className="flex-1 py-4 rounded-2xl font-black text-white uppercase tracking-widest bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-lg shadow-red-600/30 active:scale-95 transition-all">Guardar 🔥</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">

      {avisoAdmin && (
        <div className="absolute top-0 left-0 w-full z-[100] bg-gradient-to-r from-yellow-600 to-orange-600 p-3 text-center shadow-lg animate-fade-in">
           <p className="text-white font-black text-sm uppercase tracking-tighter">
             ⚠️ AVISO: <span className="font-bold">{avisoAdmin}</span>
           </p>
        </div>
      )}

      <Sidebar />

      <div className={`flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0 ${avisoAdmin ? 'pt-12' : ''}`}>
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
                      // 🚀 VERIFICAMOS CON EL ARRAY DE IDs DEL BACKEND
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
  );
}