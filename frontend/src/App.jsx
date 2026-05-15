import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Estadisticas from './pages/Estadisticas';
import Evolucion from './pages/Evolucion';
import AdminPanel from './pages/AdminPanel';
import Ajustes from './pages/Ajustes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/evolucion" element={<Evolucion />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/ajustes" element={<Ajustes />} />
      </Routes>
    </Router>
  );
}

export default App;