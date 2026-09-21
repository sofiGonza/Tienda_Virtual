// URL configurable para desarrollo y despliegue.
// En producción define VITE_API_URL, por ejemplo:
// VITE_API_URL=https://tu-backend.onrender.com/api
const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

const obtenerToken = () => localStorage.getItem("token");

export const api = async (endpoint, opciones = {}) => {
  const token = obtenerToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers,
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    throw new Error(datos?.detail || `Error en la petición (${respuesta.status})`);
  }

  return datos;
};

export default API_URL;
