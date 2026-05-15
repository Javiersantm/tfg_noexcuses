import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Estadisticas() {
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [datosPeso, setDatosPeso] = useState([]);
  const [totalEntrenos, setTotalEntrenos] = useState(0);
  const [promedios, setPromedios] = useState({ sensacion: 0, eficiencia: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else cargarEstadisticas();
  }, [navigate]);

  const cargarEstadisticas = async () => {
    try {
      const resHistorial = await api.get('/perfil/historial');
      const historial = resHistorial.data;

      setTotalEntrenos(historial.length);
      procesarDatosGrafica(historial);
      procesarDatosPeso(historial);
    } catch (error) {
      console.error("Error al cargar estadísticas", error);
    }
  };

  const procesarDatosGrafica = (historial) => {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const conteoMeses = Array(12).fill(0);

    let sumaSensacion = 0;
    let sumaEficiencia = 0;
    let feedbackValido = 0;

    historial.forEach(entreno => {
      const fecha = new Date(entreno.fecha);
      if (fecha.getFullYear() === new Date().getFullYear()) {
        conteoMeses[fecha.getMonth()]++;
      }
      if (entreno.sensacion !== null && entreno.eficiencia !== null) {
        sumaSensacion += entreno.sensacion;
        sumaEficiencia += entreno.eficiencia;
        feedbackValido++;
      }
    });

    const datosProcesados = nombresMeses.map((mes, index) => ({ name: mes, entrenos: conteoMeses[index] }));
    setDatosGrafica(datosProcesados);

    setPromedios({
      sensacion: feedbackValido > 0 ? (sumaSensacion / feedbackValido).toFixed(1) : '-',
      eficiencia: feedbackValido > 0 ? (sumaEficiencia / feedbackValido).toFixed(1) : '-'
    });
  };

  const procesarDatosPeso = (historial) => {
    const historialPesos = historial
      .filter(entreno => entreno.pesoCorporal && entreno.pesoCorporal > 0)
      .map(entreno => ({
        fechaStr: new Date(entreno.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        fechaOriginal: new Date(entreno.fecha),
        peso: parseFloat(entreno.pesoCorporal)
      }))
      .sort((a, b) => a.fechaOriginal - b.fechaOriginal);

    setDatosPeso(historialPesos);
  };

  const CustomTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-xl">
          <p className="text-gray-300 font-bold mb-1">{`Mes: ${label}`}</p>
          <p className="text-red-500 font-black text-lg">{`${payload[0].value} entrenamientos`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipLine = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-700 rounded-lg shadow-xl">
          <p className="text-gray-300 font-bold mb-1">{label}</p>
          <p className="text-orange-500 font-black text-lg">{`${payload[0].value} KG`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
        <header className="p-6 md:p-8 pb-0 max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-gray-400 font-bold mb-1">Mide tu progreso</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Tus <span className="text-red-500">Estadísticas</span> 📈</h2>
          </div>
        </header>

        <main className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">

          {/* TARJETAS RESUMEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col gap-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Entrenos</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <span className="text-4xl font-black text-white">{totalEntrenos}</span>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col gap-2">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Año Actual</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <span className="text-4xl font-black text-white">{new Date().getFullYear()}</span>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl border border-red-500/30 shadow-xl flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-bl-full pointer-events-none"></div>
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Sensación Media</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{promedios.sensacion}</span>
                <span className="text-gray-500 font-bold mb-1">/ 10</span>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl border border-orange-500/30 shadow-xl flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/10 rounded-bl-full pointer-events-none"></div>
              <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Eficiencia Media</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{promedios.eficiencia}</span>
                <span className="text-gray-500 font-bold mb-1">/ 10</span>
              </div>
            </div>
          </div>

          {/* 🚀 CONTENEDOR GRID: 1 columna en móvil, 2 columnas en PC */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* GRÁFICA 1: ENTRENAMIENTOS POR MES */}
            <div className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-800 to-red-500"></div>
              <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Entrenamientos por Mes</h3>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafica} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltipBar />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
                    <Bar dataKey="entrenos" fill="#EF4444" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICA 2: EVOLUCIÓN DEL PESO CORPORAL */}
            <div className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-800 to-orange-500"></div>
              <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-4">Evolución de Peso Corporal (KG)</h3>

              {datosPeso.length > 0 ? (
                <div className="w-full h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosPeso} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="fechaStr" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip content={<CustomTooltipLine />} cursor={{ stroke: '#374151', strokeWidth: 2 }} />
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#F97316"
                        strokeWidth={4}
                        dot={{ r: 6, fill: '#F97316', stroke: '#111827', strokeWidth: 2 }}
                        activeDot={{ r: 8 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                  <span className="text-4xl mb-2 opacity-50">⚖️</span>
                  <p className="font-bold">Aún no hay datos de peso</p>
                  <p className="text-sm">Registra tu peso al finalizar un entreno.</p>
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}