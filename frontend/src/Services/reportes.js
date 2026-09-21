import API_URL from './api';
import { obtenerSesion } from './AuthService';

export const urlReporte = (tipo, fecha = '') => `${API_URL}/reportes/ventas-diarias/${tipo}${fecha ? `?fecha=${fecha}` : ''}`;

export async function descargarReporte(tipo, fecha = '') {
  const sesion = obtenerSesion();
  const response = await fetch(urlReporte(tipo, fecha), {
    headers: { Authorization: `Bearer ${sesion?.token || ''}` },
  });
  if (!response.ok) throw new Error('No se pudo descargar el reporte');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const extension = tipo === 'pdf' ? 'pdf' : 'xlsx';
  const nombre = match?.[1] || `reporte-ventas.${extension}`;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

export async function descargarHistorial(tipo, filtros = {}) {
  const sesion = obtenerSesion();
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.fecha) params.set('fecha', filtros.fecha);
  const query = params.toString();
  const url = `${API_URL}/reportes/ventas-historial/${tipo}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${sesion?.token || ''}` },
  });
  if (!response.ok) throw new Error('No se pudo descargar el historial');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const extension = tipo === 'pdf' ? 'pdf' : 'xlsx';
  const nombre = match?.[1] || `historial-ventas.${extension}`;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
