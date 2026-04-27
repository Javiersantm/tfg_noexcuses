import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ username: '', contrasena: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');

    // Codificamos las credenciales en formato Basic Auth (Base64)
    const token = 'Basic ' + btoa(credenciales.username + ':' + credenciales.contrasena);

    try {
      // Intentamos acceder a tu perfil protegido con esta llave
      const response = await api.get('/perfil', {
        headers: { Authorization: token }
      });

      // Si responde OK, guardamos el token en el almacenamiento del navegador
      localStorage.setItem('token', token);

      // También podemos guardar el nombre del usuario para mostrarlo luego
      localStorage.setItem('usuario_nombre', response.data.nombre);

      // Redirigimos al Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
      <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
        ← Volver
      </Link>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-black text-center mb-6 uppercase italic text-red-600">
          Iniciar Sesión
        </h2>

        {/* Mensaje de error en rojo si falla el login */}
        {error && <div className="bg-red-600 text-white p-3 rounded mb-4 text-center font-bold">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            value={credenciales.username}
            onChange={handleChange}
            placeholder="Nombre de usuario"
            className="w-full p-4 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition"
            required
          />
          <input
            type="password"
            name="contrasena"
            value={credenciales.contrasena}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full p-4 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition"
            required
          />

          <button type="submit" className="mt-4 px-6 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-red-600/30">
            Entrar a la acción
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          ¿No tienes cuenta? <Link to="/registro" className="text-red-500 hover:underline font-bold">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}