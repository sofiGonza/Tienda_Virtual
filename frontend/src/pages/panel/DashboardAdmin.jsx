import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import API_URL from "../../Services/api";
import { obtenerSesion } from "../../Services/AuthService";
import GraficaBarras from "../../components/panel/GraficaBarras";
import GraficaLineal from "../../components/panel/GraficaLineal";
import GraficaDona from "../../components/panel/GraficaDona";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const COLORES_ESTADO = {
  pendiente: "#facc15",
  procesando: "#3b82f6",
  enviado: "#a855f7",
  entregado: "#22c55e",
  cancelado: "#ef4444",
};

function DashboardAdmin() {
  const navigate = useNavigate();
  const { sesion } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = obtenerSesion()?.token;
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    fetch(`${API_URL}/estadisticas/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) throw new Error(d.detail);
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [navigate]);

  if (error) return <p className="p-10 text-red-400">{error}</p>;
  if (!data) return <p className="p-10 text-white">Cargando dashboard...</p>;

  const progreso = Object.entries(data.pedidos_por_estado).map(([k, v]) => ({
    label: k,
    value: v,
    color: COLORES_ESTADO[k],
  }));

  const ventas = [
    { label: "Hoy", value: data.ventas_dia, color: "#22d3ee" },
    { label: "Semana", value: data.ventas_semana, color: "#38bdf8" },
    { label: "Mes", value: data.ventas_mes, color: "#818cf8" },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Panel de administrador</p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          Hola, {sesion.nombre} 👋
        </h1>
        <p className="mt-2 flex items-center gap-3 text-sm text-gray-400">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 capitalize text-cyan-400">Rol: administrador</span>
          <span className="rounded-full bg-green-400/10 px-3 py-1 text-green-400">● Activo</span>
        </p>
      </header>

      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">Productos agotados</p>
          <p className="mt-1 text-4xl font-bold text-red-400">{data.productos_agotados.length}</p>
          <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto text-xs text-gray-400">
            {data.productos_agotados.length === 0 && <li>Ninguno ✅</li>}
            {data.productos_agotados.map((p) => (
              <li key={p.id}>• {p.nombre}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">Usuarios registrados</p>
          <p className="mt-1 text-4xl font-bold text-cyan-400">{data.total_usuarios}</p>
          <p className="mt-2 text-xs text-gray-500">Cuentas en la plataforma</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">Pedidos por estado</p>
          <p className="mt-1 text-4xl font-bold text-white">
            {Object.values(data.pedidos_por_estado).reduce((a, b) => a + b, 0)}
          </p>
          <p className="mt-2 text-xs text-gray-500">Total de pedidos</p>
        </div>
      </div>

      {/* VENTAS + MÁS VENDIDOS */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">💰 Ventas del día, semana y mes</h2>
          <GraficaBarras items={ventas} formato={formatoPrecio} />
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">🏆 Productos más vendidos</h2>
          {data.productos_mas_vendidos.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay ventas registradas.</p>
          ) : (
            <ul className="space-y-3">
              {data.productos_mas_vendidos.map((p, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
                  <span className="text-sm text-gray-300">
                    <span className="mr-2 font-bold text-cyan-400">#{i + 1}</span> {p.nombre}
                  </span>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-400">
                    {p.vendidos} vendidos
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* PROGRESO DE PEDIDOS */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">📈 Progreso de pedidos por estado</h2>
        <GraficaBarras items={progreso} />
      </div>

      {/* GRÁFICOS ADICIONALES */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">📉 Distribución de estados</h2>
          <GraficaDona items={progreso} />
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">📊 Tendencia de ventas</h2>
          <GraficaLineal items={[
            { label: "Hoy", value: data.ventas_dia },
            { label: "Semana", value: data.ventas_semana },
            { label: "Mes", value: data.ventas_mes },
          ]} />
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;
