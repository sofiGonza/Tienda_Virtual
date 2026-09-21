import { api } from './api';

export const obtenerCuenta = () => api('/usuarios/me/cuenta');
export const guardarCuenta = (data) => api('/usuarios/me/cuenta', {
  method: 'PUT',
  body: JSON.stringify(data),
});
