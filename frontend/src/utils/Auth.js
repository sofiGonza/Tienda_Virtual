export const obtenerToken = () => {
  return localStorage.getItem("token");
};


export const obtenerUsuario = () => {

  const usuario =
    localStorage.getItem("usuario");

  if (!usuario) {
    return null;
  }

  try {

    return JSON.parse(usuario);

  } catch {

    return null;

  }

};


export const esAdministrador = () => {

  const usuario = obtenerUsuario();

  return usuario?.rol === "administrador";

};