import Swal from 'sweetalert2';

// Configuramos una instancia base de SweetAlert2 con los colores de tu App (Dark Mode + Red)
const MySwal = Swal.mixin({
  background: '#111827', // bg-gray-900 de Tailwind
  color: '#f3f4f6',      // text-gray-100
  confirmButtonColor: '#DC2626', // bg-red-600
  cancelButtonColor: '#374151',  // bg-gray-700
  customClass: {
    popup: 'border border-gray-800 rounded-3xl shadow-2xl',
    title: 'font-black text-2xl tracking-tighter',
    confirmButton: 'font-bold uppercase tracking-wider rounded-xl px-6 py-3 shadow-lg active:scale-95 transition-transform',
    cancelButton: 'font-bold rounded-xl px-6 py-3 active:scale-95 transition-transform'
  }
});

export const alertaExito = (mensaje, titulo = '¡Completado!') => {
  return MySwal.fire({
    title: titulo,
    text: mensaje,
    icon: 'success',
    iconColor: '#10B981', // Verde esmeralda de Tailwind
    confirmButtonText: 'Aceptar'
  });
};

export const alertaError = (mensaje, titulo = 'Error') => {
  return MySwal.fire({
    title: titulo,
    text: mensaje,
    icon: 'error',
    iconColor: '#EF4444', // Rojo
    confirmButtonText: 'Entendido'
  });
};

export const alertaConfirmacion = async (mensaje, titulo = '¿Estás seguro?', textoBoton = 'Sí, continuar') => {
  const result = await MySwal.fire({
    title: titulo,
    text: mensaje,
    icon: 'warning',
    iconColor: '#F59E0B', // Amarillo warning
    showCancelButton: true,
    confirmButtonText: textoBoton,
    cancelButtonText: 'Cancelar',
    reverseButtons: true // Pone el botón de cancelar a la izquierda (mejor UX)
  });
  return result.isConfirmed;
};