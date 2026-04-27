import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Registro() {
  const [paso, setPaso] = useState(1);

  const [formData, setFormData] = useState({
    nombre: '', apellidos: '', username: '', correo: '', contrasena: '',
    edad: '', peso: '', altura: '', objetivo: 'GANAR_PESO', nivel: 'PRINCIPIANTE', diasEntreno: 3
  });

  const siguientePaso = () => setPaso(paso + 1);
  const pasoAnterior = () => setPaso(paso - 1);

  // Función mágica que actualiza el estado cada vez que el usuario escribe
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
      
      <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors">
        ← Volver
      </Link>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
        
        {/* Indicador de Pasos */}
        <div className="flex justify-between items-center mb-8">
          <div className={`h-2 w-1/3 rounded ${paso >= 1 ? 'bg-red-600' : 'bg-gray-600'} transition-colors duration-500`}></div>
          <div className={`h-2 w-1/3 rounded mx-2 ${paso >= 2 ? 'bg-red-600' : 'bg-gray-600'} transition-colors duration-500`}></div>
          <div className={`h-2 w-1/3 rounded ${paso >= 3 ? 'bg-red-600' : 'bg-gray-600'} transition-colors duration-500`}></div>
        </div>

        <h2 className="text-3xl font-black text-center mb-6 uppercase italic">
          {paso === 1 && "Datos de Cuenta"}
          {paso === 2 && "Tu Físico"}
          {paso === 3 && "Tus Objetivos"}
        </h2>

        {/* =========================================
            ZONA DEL FORMULARIO (LOS 3 PASOS)
            ========================================= */}
        <div className="min-h-[250px] flex flex-col gap-4">
          
          {/* PASO 1: Datos de Cuenta */}
          {paso === 1 && (
            <>
              <div className="flex gap-4">
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="w-1/2 p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" className="w-1/2 p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
              </div>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de usuario" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Correo electrónico" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
              <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} placeholder="Contraseña" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
            </>
          )}

          {/* PASO 2: Tu Físico */}
          {paso === 2 && (
            <>
              <label className="text-sm text-gray-400">Edad (años)</label>
              <input type="number" name="edad" value={formData.edad} onChange={handleChange} placeholder="Ej: 24" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition mb-2" />
              
              <label className="text-sm text-gray-400">Peso (kg)</label>
              <input type="number" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 75.5" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition mb-2" />
              
              <label className="text-sm text-gray-400">Altura (metros)</label>
              <input type="number" step="0.01" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 1.80" className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
            </>
          )}

          {/* PASO 3: Objetivos */}
          {paso === 3 && (
            <>
              <label className="text-sm text-gray-400">Objetivo principal</label>
              <select name="objetivo" value={formData.objetivo} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition mb-2">
                <option value="GANAR_PESO">Ganar Peso (Volumen)</option>
                <option value="CONSEGUIR_MUSCULO">Conseguir Músculo (Recomposición)</option>
                <option value="DEFINIR">Definir (Pérdida de grasa)</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>

              <label className="text-sm text-gray-400">Tu nivel actual</label>
              <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition mb-2">
                <option value="PRINCIPIANTE">Principiante (Menos de 6 meses)</option>
                <option value="INTERMEDIO">Intermedio (1 a 2 años)</option>
                <option value="PROFESIONAL">Profesional (Más de 2 años)</option>
              </select>

              <label className="text-sm text-gray-400">Días de entreno por semana</label>
              <input type="number" name="diasEntreno" min="1" max="7" value={formData.diasEntreno} onChange={handleChange} className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-red-600 transition" />
            </>
          )}

        </div>

        {/* Botones de Navegación */}
        <div className="flex justify-between mt-8">
          {paso > 1 ? (
            <button onClick={pasoAnterior} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors">
              Atrás
            </button>
          ) : <div></div>}

          {paso < 3 ? (
            <button onClick={siguientePaso} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors shadow-lg shadow-red-600/30">
              Siguiente
            </button>
          ) : (
            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors shadow-lg shadow-green-600/30">
              Finalizar
            </button>
          )}
        </div>

      </div>
    </div>
  );

  const finalizarRegistro = async () => {
  try {
    const response = await api.post('/auth/registro', formData);
    alert("¡Registro completado! Ya no hay excusas.");
    // Aquí podrías usar useNavigate de react-router-dom para mandarlo al Login
  } catch (error) {
    alert("Error en el registro: " + (error.response?.data || error.message));
  }
};

// Y en el botón de Finalizar:
<button 
  onClick={finalizarRegistro}
  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors shadow-lg shadow-green-600/30"
>
  Finalizar
</button>
}