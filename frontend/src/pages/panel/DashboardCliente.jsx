import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import API_URL from "../../Services/api";
import { obtenerSesion } from "../../Services/AuthService";
import GraficaBarras from "../../components/panel/GraficaBarras";
import GraficaLineal from "../../components/panel/GraficaLineal";
import GraficaDona from "../../components/panel/GraficaDona";

const COLORES_ESTADO = {
  pendiente: "#facc15",
  procesando: "#3b82f6",
  enviado: "#a855f7",
  entregado: "#22c55e",
  cancelado: "#ef4444",
};

function formatearTiempo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function DashboardCliente() {
  const navigate = useNavigate();
  const { sesion } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tiempo, setTiempo] = useState(0);

  // Tiempo en la página (acumulado por sesión)
  useEffect(() => {
    const guardado = Number(sessionStorage.getItem("tiempo_panel") || 0);
    const inicio = Date.now();
    const id = setInterval(() => {
      const segundos = guardado + Math.floor((Date.now() - inicio) / 1000);
      setTiempo(segundos);
      sessionStorage.setItem("tiempo_panel", String(segundos));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const token = obtenerSesion()?.token;
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    fetch(`${API_URL}/estadisticas/cliente`, {
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

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Panel de cliente</p>
        <h1 className="mt-1 text-3xl font-bold text-white">
          Hola, {sesion.nombre} 👋
        </h1>
        <p className="mt-2 flex items-center gap-3 text-sm text-gray-400">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 capitalize text-cyan-400">Rol: cliente</span>
          <span className={`rounded-full px-3 py-1 ${sesion.estado ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
            {sesion.estado ? "● Activo" : "● Inactivo"}
          </span>
        </p>
      </header>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">⏱ Tiempo en la página</p>
          <p className="mt-1 font-mono text-3xl font-bold text-cyan-400">{formatearTiempo(tiempo)}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">🧾 Total de pedidos</p>
          <p className="mt-1 text-4xl font-bold text-white">{data.total_pedidos}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <p className="text-sm text-gray-400">🛒 En curso</p>
          <p className="mt-1 text-4xl font-bold text-blue-400">
            {(data.pedidos_por_estado.pendiente || 0) + (data.pedidos_por_estado.procesando || 0) + (data.pedidos_por_estado.enviado || 0)}
          </p>
        </div>
      </div>

      {/* PROGRESO */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">📈 Progreso de tus pedidos</h2>
        <GraficaBarras items={progreso} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/panel/mis-pedidos")}
          className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-cyan-300"
        >
          🧾 Ver mis pedidos
        </button>
        <button
          onClick={() => navigate("/panel/facturas")}
          className="rounded-xl border border-gray-600 px-6 py-3 font-bold text-gray-300 transition hover:bg-gray-800"
        >
          📄 Ver facturas
        </button>
      </div>

      {/* GRÁFICOS ADICIONALES */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">🥧 Distribución de tus pedidos</h2>
          <GraficaDona items={progreso} />
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold text-white">📊 Distribución por estados</h2>
          <GraficaLineal items={progreso} />
        </div>
      </div>
    </div>
  );
}

export default DashboardCliente;
