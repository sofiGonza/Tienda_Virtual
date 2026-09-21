import { api } from './api';
export const listarVentas=(params={})=>api(`/ventas?${new URLSearchParams(params)}`);
export const obtenerVenta=(id)=>api(`/ventas/${id}`);
export const crearVenta=(data)=>api('/ventas',{method:'POST',body:JSON.stringify(data)});

export const anularVenta = (id) => api(`/ventas/${id}/anular`, { method: 'PUT' });
