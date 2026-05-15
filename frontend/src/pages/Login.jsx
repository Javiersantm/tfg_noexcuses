import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ identificador: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // 🚀 BLINDAJE 1: Quitamos espacios al principio y al final del usuario/correo
    const identLimpio = credenciales.identificador.trim();
    // 🚀 BLINDAJE 2: Las contraseñas NO se limpian (un espacio es un carácter válido en una contraseña)
    const passReal = credenciales.contrasena;

    if (!identLimpio || !passReal) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    setCargando(true);

    // Limpiamos rastros antiguos ANTES de hacer la petición
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_rol');

    // Usamos el identificador limpio para crear el token
    const token = 'Basic ' + btoa(identLimpio + ':' + passReal);

    try {
      // 🚀 HACEMOS LA PETICIÓN AL SERVIDOR
      const response = await api.get('/perfil', {
        headers: { Authorization: token }
      });

      // 🚀 SI TODO VA BIEN, AHORA SÍ GUARDAMOS LOS DATOS (Porque 'response' ya existe)
      localStorage.setItem('token', token);
      localStorage.setItem('usuario_nombre', response.data.nombre);
      localStorage.setItem('usuario_rol', response.data.rol); // Guardamos el rol para ver la coronita

      // Redirigimos al panel de control
      navigate('/dashboard');

    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      // Pase lo que pase, dejamos de mostrar "Accediendo..."
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4 relative selection:bg-red-500 selection:text-white">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-white font-bold transition-colors flex items-center gap-2 cursor-pointer z-10">
        <span>←</span> Volver
      </Link>

      <div className="bg-gray-900 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-800 z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tighter">
            Iniciar <span className="text-red-500">Sesión</span>
          </h2>
          <p className="text-gray-400 mt-2 font-bold text-sm">Bienvenido de nuevo a la acción.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-center font-bold text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Usuario o Correo</label>
            <input
              type="text"
              name="identificador"
              value={credenciales.identificador}
              onChange={handleChange}
              placeholder="tu_usuario o correo@email.com"
              className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={credenciales.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-4 bg-gray-950 text-white rounded-xl outline-none border border-gray-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-700 font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black py-4 rounded-xl text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
          >
            {cargando ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 font-bold text-sm">
          ¿Aún no tienes cuenta? <Link to="/registro" className="text-red-500 hover:text-red-400 transition-colors cursor-pointer">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}