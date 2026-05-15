import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Registro() {
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
      nombre: '', apellidos: '', username: '', correo: '', contrasena: '',
      fechaNacimiento: '', peso: '', altura: '', objetivo: 'GANAR_PESO', nivel: 'PRINCIPIANTE', diasEntreno: 3
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpiamos el error en cuanto el usuario empiece a escribir
  };

  // 🛡️ LÓGICA DE SEGURIDAD Y VALIDACIÓN
  const validarPaso = () => {
      if (paso === 1) {
        if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.username.trim() || !formData.correo.trim() || !formData.contrasena) {
          setError('Por favor, rellena todos los campos de texto.'); return false;
        }

        // 🚀 BLINDAJE 3: El username no puede tener espacios
        if (formData.username.includes(' ')) {
          setError('El nombre de usuario no puede contener espacios.'); return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo)) {
          setError('El formato del correo electrónico no es válido.'); return false;
        }
        if (formData.contrasena.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.'); return false;
        }
      }
    if (paso === 2) {
      if (!formData.fechaNacimiento || !formData.peso || !formData.altura) {
        setError('Rellena tus datos físicos para poder adaptar tu rutina.'); return false;
      }
      if (formData.peso <= 20 || formData.altura <= 0.5) {
        setError('Por favor, introduce valores de peso y altura reales.'); return false;
      }
    }
    return true; // Si pasa todos los if, es que todo está correcto
  };

  const siguientePaso = () => {
    if (validarPaso()) {
      setError('');
      setPaso(paso + 1);
    }
  };

  const pasoAnterior = () => {
    setError('');
    setPaso(paso - 1);
  };

  const finalizarRegistro = async () => {
      if (!validarPaso()) return;

      setCargando(true);
      try {
        const datosLimpios = {
          ...formData,
          // 🚀 BLINDAJE 4: Normalizamos nombres de usuario y correos
          username: formData.username.trim().toLowerCase(),
          correo: formData.correo.trim().toLowerCase(),
          nombre: formData.nombre.trim(),
          apellidos: formData.apellidos.trim(),
          peso: parseFloat(formData.peso),
          altura: parseFloat(formData.altura),
          diasEntreno: parseInt(formData.diasEntreno)
        };

      const response = await api.post('/auth/registro', datosLimpios);
      alert("¡Registro completado! Ya no hay excusas.");
      navigate('/login');
    } catch (error) {
      const mensajeReal = typeof error.response?.data === 'string'
        ? error.response.data
        : error.response?.data?.message || "Error al conectar con el servidor.";
      setError(mensajeReal);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4 relative selection:bg-red-500 selection:text-white">

      {/* Efecto de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-white font-bold transition-colors flex items-center gap-2 cursor-pointer z-10">
        <span>←</span> Volver
      </Link>

      <div className="bg-gray-900 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-800 z-10 relative overflow-hidden">

        {/* Barra de progreso */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
          <div className={`h-full bg-red-600 transition-all duration-500`} style={{ width: `${(paso / 3) * 100}%` }}></div>
        </div>

        <div className="text-center mb-8 mt-2">
          <span className="text-red-500 font-black text-sm tracking-widest uppercase mb-1 block">Paso {paso} de 3</span>
          <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
            {paso === 1 && "Crea tu cuenta"}
            {paso === 2 && "Tu Físico"}
            {paso === 3 && "Tus Objetivos"}
          </h2>
        </div>

        {/* Caja de Errores */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-center font-bold text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <div className="min-h-[280px] flex flex-col gap-4">
          {paso === 1 && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div className="flex gap-4">
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="w-1/2 p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" className="w-1/2 p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
              </div>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Correo electrónico" className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="Contraseña (mínimo 6 caracteres)" className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
            </div>
          )}

          {paso === 2 && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="w-full p-4 bg-gray-950 text-gray-300 rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold cursor-pointer" />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Peso (kg)</label>
                  <input type="number" step="0.1" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 75.5" className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Altura (m)</label>
                  <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 1.80" className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="animate-fade-in flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Objetivo principal</label>
                <select name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold cursor-pointer">
                  <option value="GANAR_PESO">Ganar Peso (Volumen)</option>
                  <option value="CONSEGUIR_MUSCULO">Conseguir Músculo (Recomposición)</option>
                  <option value="DEFINIR">Definir (Pérdida de grasa)</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nivel actual</label>
                <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold cursor-pointer">
                  <option value="PRINCIPIANTE">Principiante (Menos de 6 meses)</option>
                  <option value="INTERMEDIO">Intermedio (1 a 2 años)</option>
                  <option value="PROFESIONAL">Profesional (Más de 2 años)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Días de entreno por semana</label>
                <input type="number" name="diasEntreno" min="1" max="7" value={formData.diasEntreno} onChange={handleChange} className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 transition-all font-bold" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-6 border-t border-gray-800">
          {paso > 1 ? (
            <button onClick={pasoAnterior} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-colors text-white cursor-pointer border border-gray-700">
              Atrás
            </button>
          ) : <div></div>}

          {paso < 3 ? (
            <button onClick={siguientePaso} className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-white/10">
              Siguiente →
            </button>
          ) : (
            <button onClick={finalizarRegistro} disabled={cargando} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black uppercase tracking-wider transition-all transform hover:-translate-y-1 cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50">
              {cargando ? 'Creando...' : 'Finalizar 🔥'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}