import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import API_URL from "../../Services/api";
import { obtenerSesion } from "../../Services/AuthService";
import GraficaBarras from "../../components/panel/GraficaBarras";
import GraficaLineal from "../../components/panel/GraficaLineal";
import GraficaDona from "../../components/panel/GraficaDona";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function DashboardEmpleado() {
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
    fetch(`${API_URL}/estadisticas/empleado`, {
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

  const meta = data.metas_mensuales;
  const progresoMeta = Math.min(100, meta.porcentaje);

  const ventasSemana = (data.ventas_semana || []).map((v, i) => ({
    label: DIAS[i] || `D${i + 1}`,
    value: v,
  }));

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Panel de empleado</p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          Hola, {sesion.nombre} 👋
        </h1>
        <p className="mt-2 flex items-center gap-3 text-sm text-gray-400">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 capitalize text-cyan-400">Rol: empleado</span>
          <span className={`rounded-full px-3 py-1 ${sesion.estado ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
            {sesion.estado ? "● Activo" : "● Inactivo"}
          </span>
        </p>
      </header>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">💰 Ventas del día</p>
          <p className="mt-1 text-2xl font-bold text-cyan-400">{formatoPrecio(data.ventas_dia)}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">📦 Productos entregados</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{data.productos_entregados}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">💵 Comisiones (5% mes)</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">{formatoPrecio(data.comisiones)}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">⚠️ Stock bajo</p>
          <p className="mt-1 text-2xl font-bold text-red-400">{data.productos_stock_bajo.length}</p>
        </div>
      </div>

      {/* META MENSUAL */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">🎯 Meta mensual</h2>
          <p className="text-sm text-gray-400">
            {formatoPrecio(meta.logrado)} de {formatoPrecio(meta.meta)}
          </p>
        </div>
        <div className="h-5 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
            style={{ width: `${progresoMeta}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-400">{meta.porcentaje}% de la meta</p>
      </div>

      {/* VENTAS SEMANA */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">📊 Ventas de la semana</h2>
        <GraficaBarras items={ventasSemana} formato={formatoPrecio} />
      </div>

      {/* STOCK BAJO */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">⚠️ Productos con stock bajo</h2>
        {data.productos_stock_bajo.length === 0 ? (
          <p className="text-sm text-gray-500">Todos los productos tienen stock suficiente ✅</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.productos_stock_bajo.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
                <span className="text-sm text-gray-300">{p.nombre}</span>
                <span className="rounded-full bg-red-400/10 px-3 py-1 text-sm font-bold text-red-400">
                  {p.stock} uds
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* GRÁFICOS ADICIONALES */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">📊 Distribución de ventas de la semana</h2>
          <GraficaDona items={ventasSemana.map((v, i) => ({ ...v, color: ["#22d3ee", "#38bdf8", "#818cf8", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"][i % 7] }))} />
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">📈 Tendencia de la semana</h2>
          <GraficaLineal items={ventasSemana} />
        </div>
      </div>
    </div>
  );
}

export default DashboardEmpleado;
