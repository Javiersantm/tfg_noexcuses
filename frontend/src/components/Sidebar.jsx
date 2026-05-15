import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🚀 ESTADO PARA LA FOTO DEL SIDEBAR
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/perfil').then(res => {
        if (res.data.fotoPerfil) {
          setFotoUrl(`http://localhost:8083/uploads/${res.data.fotoPerfil}`);
        }
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_rol');
    navigate('/login');
  };

  const menuItems = [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/estadisticas', icon: '📈', label: 'Estadísticas' },
      { path: '/evolucion', icon: '📸', label: 'Evolución' },
      { path: '/perfil', icon: '👤', label: 'Perfil' },
      { path: '/ajustes', icon: '⚙️', label: 'Ajustes' }
    ];

    const rolUsuario = localStorage.getItem('usuario_rol');

    if (rolUsuario === 'ADMIN') {
      menuItems.push({ path: '/admin', icon: '👑', label: 'Panel Admin' });
    }

  return (
    <>
      {/* 🖥️ VERSIÓN ORDENADOR */}
      <aside className="hidden md:flex w-64 h-full bg-gray-950 border-r border-gray-800 flex-col shadow-2xl z-50 transition-all duration-300">

        {/* 🚀 CABECERA CON AVATAR Y LOGO */}
        <div className="h-24 flex items-center justify-center border-b border-gray-800 gap-3 px-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center text-xl shadow-lg border-2 border-red-600 flex-shrink-0">
            {fotoUrl ? <img src={fotoUrl} className="w-full h-full object-cover" alt="pfp" /> : "👤"}
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter drop-shadow-md">
            No<span className="text-red-600">Excuses</span>
          </h1>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-4">
          {menuItems.map((item) => {
            const activo = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                  activo
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 border border-gray-700 text-gray-400 hover:bg-red-600 hover:border-red-600 hover:text-white py-4 rounded-2xl font-bold transition-all shadow-lg cursor-pointer"
          >
            <span className="text-xl">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 📱 VERSIÓN MÓVIL (BOTTOM NAVIGATION BAR) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 flex items-center justify-around px-2 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {menuItems.map((item) => {
          const activo = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${
                activo ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className={`text-2xl mb-1 transition-transform ${activo ? 'scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}