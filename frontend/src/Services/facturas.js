import { api } from './api';
import API_URL from './api';
import { obtenerSesion } from './AuthService';

export const listarFacturas = (params = {}) => api(`/facturas?${new URLSearchParams(params)}`);
export const obtenerFactura = (id) => api(`/facturas/${id}`);
export const crearFactura = (ventaId) => api(`/facturas/venta/${ventaId}`, { method: 'POST' });

export const urlFacturaPdf = (id) => `${API_URL}/facturas/${id}/pdf`;
export const urlFacturaExcel = (id) => `${API_URL}/facturas/${id}/excel`;

async function descargar(url, nombrePorDefecto) {
  const sesion = obtenerSesion();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${sesion?.token || ''}` },
  });
  if (!response.ok) throw new Error('No se pudo descargar el archivo');
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const nombre = match?.[1] || nombrePorDefecto;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

export async function descargarFacturaPdf(id) {
  await descargar(urlFacturaPdf(id), `factura-${id}.pdf`);
}

export async function descargarFacturaExcel(id) {
  await descargar(urlFacturaExcel(id), `factura-${id}.xlsx`);
}
