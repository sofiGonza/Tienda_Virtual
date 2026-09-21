import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { obtenerSesion, cerrarSesion } from "../../Services/AuthService";
import logo from "../../img/logo/logoPixel.png";


// ==========================================================
// SIDEBAR (menú lateral por rol)
// ==========================================================

function Sidebar({ sesion, rol, cerrar, abierta, cerrarSidebar }) {
  const navigate = useNavigate();

  const enlaces = [];

  if (rol === "administrador" || rol === "empleado" || rol === "cliente") {
    enlaces.push({ to: "/panel", label: "📊 Dashboard", end: true });
  }
  if (rol === "administrador" || rol === "empleado") {
    enlaces.push({ to: "/panel/productos", label: "📦 Productos" });
    enlaces.push({ to: "/panel/pedidos", label: "🛒 Pedidos" });
    enlaces.push({ to: "/panel/ventas", label: "💰 Ventas" });
    enlaces.push({ to: "/panel/historial-ventas", label: "📋 Historial" });
    enlaces.push({ to: "/panel/pqr", label: "📝 PQR" });
    enlaces.push({ to: "/panel/servicios-admin", label: "🛠 Servicios" });
  }
  if (rol === "administrador") {
    enlaces.push({ to: "/panel/usuarios", label: "👥 Usuarios" });
  }
  if (rol === "cliente") {
    enlaces.push({ to: "/panel/mis-pedidos", label: "🧾 Mis Pedidos" });
    enlaces.push({ to: "/panel/facturas", label: "📄 Facturas" });
    enlaces.push({ to: "/panel/pqr", label: "📝 PQR" });
    enlaces.push({ to: "/panel/cuenta", label: "💳 Mi cuenta" });
  }

  const irPagina = () => {
    navigate("/");
  };

  return (
    <>
      {abierta && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={cerrarSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 transform flex-col border-r border-gray-800 bg-[#0f172a] transition-transform duration-300 md:static md:translate-x-0 ${
          abierta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
          <img src={logo} alt="Pixel Store" className="h-11 w-11 object-contain" />
          <div>
            <p className="text-lg font-bold text-cyan-400">Pixel Store</p>
            <p className="text-xs text-gray-500">Panel de gestión</p>
          </div>
        </div>

        {/* USUARIO */}
        <div className="border-b border-gray-800 px-5 py-4">
          <p className="truncate text-sm font-semibold text-white">
            👤 {sesion.nombre} {sesion.apellido}
          </p>
          <p className="mt-1 text-xs capitalize text-cyan-400">
            Rol: {sesion.rol}
          </p>
          <p className={`mt-0.5 text-xs ${sesion.estado ? "text-green-400" : "text-red-400"}`}>
            {sesion.estado ? "● Activo" : "● Inactivo"}
          </p>
        </div>

        {/* NAV */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {enlaces.map((en) => (
            <NavLink
              key={en.to}
              to={en.to}
              end={en.end}
              onClick={cerrarSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              {en.label}
            </NavLink>
          ))}
        </nav>

        {/* ACCIONES FINALES */}
        <div className="space-y-2 border-t border-gray-800 px-3 py-4">
          <button
            onClick={irPagina}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
          >
            🌐 Ir a la página
          </button>
          <button
            onClick={cerrar}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}


// ==========================================================
// PANEL LAYOUT (ventana completa, sin header/footer)
// ==========================================================

function PanelLayout() {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState(null);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      navigate("/", { replace: true });
      return;
    }
    setSesion(s);
  }, [navigate]);

  if (!sesion) {
    return null;
  }

  const rol = String(sesion.rol).toLowerCase();

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950">
      <Sidebar
        sesion={sesion}
        rol={rol}
        cerrar={manejarCerrarSesion}
        abierta={sidebarAbierta}
        cerrarSidebar={() => setSidebarAbierta(false)}
      />
      <main className="relative flex-1 overflow-y-auto bg-gray-950">
        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <button
          onClick={() => setSidebarAbierta(true)}
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-700 bg-[#0f172a] text-white shadow-lg md:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="p-4 pt-16 md:p-8 md:pt-8">
          <Outlet context={{ sesion, rol }} />
        </div>
      </main>
    </div>
  );
}

export default PanelLayout;
