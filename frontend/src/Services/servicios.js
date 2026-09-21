import { api } from './api';

export const listarServicios = () => api('/servicios');
export const crearServicio = (data) => api('/servicios', { method: 'POST', body: JSON.stringify(data) });
export const actualizarServicio = (id, data) => api(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarServicio = (id) => api(`/servicios/${id}`, { method: 'DELETE' });
