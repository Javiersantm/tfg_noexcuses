import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Recibimos un "aviso" (refresco) desde el Dashboard por si hay que recargar
export default function Calendario({ refresco }) {
  const [fechaVisor, setFechaVisor] = useState(new Date());
  const [diasEntrenados, setDiasEntrenados] = useState([]); // <--- Ahora empieza vacío

  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const año = fechaVisor.getFullYear();
  const mes = fechaVisor.getMonth();

  // 🚀 Cargar los datos REALES desde tu Backend
  const cargarDiasEntrenados = async () => {
    try {
      // Pedimos los días pasando el año y el mes (sumamos 1 porque JS empieza los meses en 0)
      const response = await api.get(`/entrenamientos/calendario?year=${año}&month=${mes + 1}`);
      setDiasEntrenados(response.data);
    } catch (error) {
      console.error("Error al cargar calendario", error);
    }
  };

  // Cada vez que cambiemos de mes, o desde el Dashboard nos avisen de un cambio, recargamos
  useEffect(() => {
    cargarDiasEntrenados();
  }, [fechaVisor, refresco]);

  const mesAnterior = () => setFechaVisor(new Date(año, mes - 1, 1));
  const mesSiguiente = () => setFechaVisor(new Date(año, mes + 1, 1));

  const diasEnMes = new Date(año, mes + 1, 0).getDate();

  let primerDiaMes = new Date(año, mes, 1).getDay();
  primerDiaMes = primerDiaMes === 0 ? 6 : primerDiaMes - 1;

  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === año && hoy.getMonth() === mes;
  const diaActual = hoy.getDate();

  const huecosBlancos = Array.from({ length: primerDiaMes }).map((_, i) => (
    <div key={`empty-${i}`} className="p-2"></div>
  ));

  const bloquesDias = Array.from({ length: diasEnMes }).map((_, i) => {
    const numeroDia = i + 1;
    const esHoy = esMesActual && numeroDia === diaActual;
    const haEntrenado = diasEntrenados.includes(numeroDia);

    return (
      <div
        key={`dia-${numeroDia}`}
        className={`
          relative flex flex-col items-center justify-center p-2 md:p-3 rounded-xl min-h-[60px] md:min-h-[80px] border transition-all
          ${esHoy ? 'bg-red-600/20 border-red-500 shadow-lg shadow-red-600/20' : 'bg-gray-800 border-gray-700'}
        `}
      >
        <span className={`text-sm md:text-lg font-bold ${esHoy ? 'text-red-500' : 'text-gray-300'}`}>
          {numeroDia}
        </span>

        {haEntrenado && (
          <span className="absolute bottom-1 md:bottom-2 text-sm md:text-xl drop-shadow-md animate-bounce-short">
            🔥
          </span>
        )}
      </div>
    );
  });

  return (
    <div className="bg-gray-900 p-4 md:p-6 rounded-3xl border border-gray-700 shadow-2xl w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <button onClick={mesAnterior} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-600">←</button>
        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
          {meses[mes]} <span className="text-red-500">{año}</span>
        </h3>
        <button onClick={mesSiguiente} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-600">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {diasSemana.map(dia => <div key={dia} className="text-xs md:text-sm font-bold text-gray-500 uppercase">{dia}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {huecosBlancos}
        {bloquesDias}
      </div>
    </div>
  );
}