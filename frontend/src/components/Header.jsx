import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { obtenerSesion, cerrarSesion } from "../Services/AuthService";
import { useTema } from "../Context/ThemeContext";
import logo from "../img/logo/logoPixel.png";
import Login from "./Login";

function Header() {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const { tema, alternarTema } = useTema();

  const navigate = useNavigate();

  // SESIÓN
  useEffect(() => {
    const cargarSesion = () => {
      const sesion = obtenerSesion();
      setUsuario(sesion);
    };

    cargarSesion();
  }, [mostrarLogin]);

  // CERRAR SESIÓN Y MOSTRAR LOGIN DE INMEDIATO
  const manejarCerrarSesion = () => {
    cerrarSesion();
    setUsuario(null);
    setMenuAbierto(false);
    setDropdownAbierto(false);
    navigate("/");
    setMostrarLogin(true); // Abre el modal de login inmediatamente tras cerrar sesión
  };

  // ESTILO NAVLINK
  const estiloNavLink = ({ isActive }) => `
    text-lg
    text-texto
    transition
    hover:text-cyan-400
    ${isActive ? "border-b-2 border-cyan-400 pb-1 text-cyan-400" : ""}
  `;

  return (
    <>
      <header className="sticky top-0 z-[1000] w-full bg-fondo shadow-lg">
        <nav className="flex items-center justify-between px-4 py-3 md:px-[70px] md:py-4">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Logo Pixel Store"
              className="h-12 w-12 object-contain md:h-[70px] md:w-[70px]"
            />
            <span className="text-xl font-bold text-cyan-400 md:text-[38px]">
              Pixel Store
            </span>
          </div>

          {/* BOTÓN HAMBURGUESA (SÓLO PANTALLAS PEQUEÑAS) */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="text-texto focus:outline-none md:hidden"
            aria-label="Abrir Menú"
          >
            <svg
              className="h-8 w-8 text-texto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuAbierto ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* NAVEGACIÓN EN PANTALLAS MEDIANAS/GRANDES */}
          <ul className="hidden items-center gap-5 md:flex md:gap-10">
            <li>
              <NavLink to="/" className={estiloNavLink}>
                Inicio
              </NavLink>
            </li>

            <li>
              <NavLink to="/quienes-somos" className={estiloNavLink}>
                Quiénes Somos
              </NavLink>
            </li>

            <li>
              <NavLink to="/productos" className={estiloNavLink}>
                Productos
              </NavLink>
            </li>

             <li>
              <NavLink to="/Servicios" className={estiloNavLink}>
                Servicios
              </NavLink>
            </li>
            <li>
              <NavLink to="/contacto" className={estiloNavLink}>
                Contacto
              </NavLink>
            </li>

            {/* DROPDOWN DE USUARIO (Perfil / Panel / Salir) */}
            {usuario ? (
              <li className="relative flex items-center gap-2">
                <button
                  onClick={() => setDropdownAbierto((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-texto transition hover:bg-hover"
                >
                  <span className="text-2xl">👤</span>
                  <span>{usuario.nombre}</span>
                  <span className="text-xs text-texto-tenue">▼</span>
                </button>

                {dropdownAbierto && (
                  <div className="absolute right-0 top-full z-[1200] mt-2 w-52 overflow-hidden rounded-xl border border-borde bg-superficie shadow-2xl">
                    <p className="border-b border-borde px-4 py-3 text-xs capitalize text-texto-tenue">
                      Rol: {usuario.rol}
                    </p>
                    <button
                      onClick={() => {
                        setDropdownAbierto(false);
                        navigate("/perfil");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-texto transition hover:bg-hover"
                    >
                      👤 Mi Perfil
                    </button>
                    <button
                      onClick={() => {
                        setDropdownAbierto(false);
                        navigate("/panel");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-texto transition hover:bg-hover"
                    >
                      📊 Mi Panel
                    </button>
                    <button
                      onClick={manejarCerrarSesion}
                      className="flex w-full items-center gap-3 border-t border-borde px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li>
                <button
                  onClick={() => setMostrarLogin(true)}
                  className="rounded-lg border border-cyan-400 px-4 py-2 text-texto transition hover:bg-cyan-400 hover:text-[#06202e]"
                >
                  Login
                </button>
              </li>
            )}

            {/* TOGGLE DE TEMA */}
            <li>
              <button
                onClick={alternarTema}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-borde text-texto transition hover:bg-hover"
                aria-label={tema === "claro" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                title={tema === "claro" ? "Modo claro" : "Modo oscuro"}
              >
                {tema === "claro" ? <FaSun className="text-xl text-yellow-400" /> : <FaMoon className="text-xl text-cyan-400" />}
              </button>
            </li>
          </ul>
        </nav>

        {/* MENÚ DESPLEGABLE MÓVIL (PANTALLAS PEQUEÑAS) */}
        {menuAbierto && (
          <div className="border-t border-borde bg-fondo px-6 py-4 md:hidden">
            <ul className="flex flex-col gap-4">
              <li>
                <NavLink
                  to="/"
                  className={estiloNavLink}
                  onClick={() => setMenuAbierto(false)}
                >
                  Inicio
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/quienes-somos"
                  className={estiloNavLink}
                  onClick={() => setMenuAbierto(false)}
                >
                  Quiénes Somos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/productos"
                  className={estiloNavLink}
                  onClick={() => setMenuAbierto(false)}
                >
                  Productos
                </NavLink>
              </li>
              {usuario?.rol === "cliente" && (
                <li>
                  <NavLink
                    to="/pedido"
                    className={estiloNavLink}
                    onClick={() => setMenuAbierto(false)}
                  >
                    Pedidos
                  </NavLink>
                </li>
              )}
             
             
              {(usuario?.rol === "administrador" ||
                usuario?.rol === "empleado") && (
                <li>
                  <NavLink
                    to="/Panel"
                    className={estiloNavLink}
                    onClick={() => setMenuAbierto(false)}
                  >
                    Panel
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/contacto"
                  className={estiloNavLink}
                  onClick={() => setMenuAbierto(false)}
                >
                  Contacto
                </NavLink>
              </li>

              <li className="pt-2">
                {usuario ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setMenuAbierto(false);
                        navigate("/perfil");
                      }}
                      className="flex items-center gap-2 text-texto"
                    >
                      <span className="text-xl">👤</span>
                      <span>{usuario.nombre} (Mi Perfil)</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuAbierto(false);
                        navigate("/panel");
                      }}
                      className="flex items-center gap-2 text-cyan-400"
                    >
                      <span className="text-xl">📊</span>
                      <span>Mi Panel</span>
                    </button>
                    <button
                      onClick={manejarCerrarSesion}
                      className="w-full rounded-lg bg-red-500/20 py-2 text-center text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      setMostrarLogin(true);
                    }}
                    className="w-full rounded-lg border border-cyan-400 py-2 text-texto hover:bg-cyan-400 hover:text-[#06202e]"
                  >
                    Login
                  </button>
                )}
              </li>

              {/* TOGGLE DE TEMA (MÓVIL) */}
              <li className="border-t border-borde pt-3">
                <button
                  onClick={() => {
                    setMenuAbierto(false);
                    alternarTema();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-borde py-2 text-texto transition hover:bg-hover"
                >
                  {tema === "claro" ? (
                    <FaSun className="text-yellow-400" />
                  ) : (
                    <FaMoon className="text-cyan-400" />
                  )}
                  {tema === "claro" ? "Modo claro" : "Modo oscuro"}
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* LOGIN MODAL */}
      <Login
        abierto={mostrarLogin}
        cerrar={() => setMostrarLogin(false)}
      />
    </>
  );
}

export default Header;