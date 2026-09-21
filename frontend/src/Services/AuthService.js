// src/Services/AuthService.js

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

// ==========================================
// GUARDAR SESIÓN
// ==========================================
// El backend FastAPI devuelve `access_token`.
// Lo guardamos en la clave "token" para que
// el resto del frontend (Navbar, paneles, etc.)
// siga funcionando con obtenerToken()/obtenerHeaders().

export const guardarSesion = (datos) => {
  const token = datos.access_token || datos.token;
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(datos.usuario));
  return token;
};


// ==========================================
// OBTENER TOKEN
// ==========================================

export const obtenerToken = () => {
  return localStorage.getItem("token");
};


// ==========================================
// OBTENER SESIÓN
// ==========================================

export const obtenerSesion = () => {

  const token = localStorage.getItem("token");
  const usuario = localStorage.getItem("usuario");

  if (!token || !usuario) {
    return null;
  }

  try {

    return {
      token,
      ...JSON.parse(usuario)
    };

  } catch (error) {

    console.error(
      "Error leyendo sesión:",
      error
    );

    return null;

  }
};


// ==========================================
// CERRAR SESIÓN
// ==========================================

export const cerrarSesion = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

};


// ==========================================
// HEADERS AUTENTICADOS
// ==========================================

export const obtenerHeaders = () => {

  const token = obtenerToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

};


export default API_URL;
