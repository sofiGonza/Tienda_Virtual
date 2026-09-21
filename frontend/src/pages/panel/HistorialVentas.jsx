import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listarVentas, anularVenta } from "../../Services/ventas";
import { api } from "../../Services/api";
import { descargarHistorial } from "../../Services/reportes";
import { obtenerSesion } from "../../Services/AuthService";
import GraficaBarras from "../../components/panel/GraficaBarras";
import GraficaLineal from "../../components/panel/GraficaLineal";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const COLORES_ESTADO = {
  registrada: "#22d3ee",
  anulada: "#ef4444",
  pendiente: "#facc15",
  procesando: "#3b82f6",
  enviado: "#a855f7",
  entregado: "#22c55e",
  cancelado: "#ef4444",
};

const OPCIONES_ESTADO = [
  "registrada",
  "anulada",
  "pendiente",
  "procesando",
  "enviado",
  "entregado",
  "cancelado",
];

function HistorialVentas() {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("tabla");
  const [periodo, setPeriodo] = useState("dia");
  const [fechaGrafica, setFechaGrafica] = useState("");
  const rol = obtenerSesion()?.rol?.toLowerCase();

  // Agrupa ventas/pedidos por día, semana (ISO) o mes y suma totales.
  const agruparPorPeriodo = (lista, per) => {
    const mapa = new Map();
    for (const item of lista || []) {
      if (!item.fecha) continue;
      const d = new Date(item.fecha);
      if (Number.isNaN(d.getTime())) continue;
      let clave;
      let label;
      if (per === "mes") {
        clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = clave;
      } else if (per === "año" || per === "anio" || per === "año") {
        clave = `${d.getFullYear()}`;
        label = clave;
      } else if (per === "semana") {
        const inicio = new Date(d);
        inicio.setHours(0, 0, 0, 0);
        inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7)); // lunes
        const semana = Math.ceil(((inicio - new Date(inicio.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
        clave = `${inicio.getFullYear()}-S${String(semana).padStart(2, "0")}`;
        label = `${inicio.getDate()}/${inicio.getMonth() + 1}`;
      } else {
        clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        label = clave;
      }
      const actual = mapa.get(clave) || { clave, label, total: 0 };
      actual.total += Number(item.total || 0);
      mapa.set(clave, actual);
    }
    return Array.from(mapa.values()).sort((a, b) => (a.clave < b.clave ? -1 : 1));
  };

  const cargar = () => {
    const params = {};
    if (estado) params.estado = estado;
    if (fecha) params.fecha_desde = `${fecha}T00:00:00`;
    setCargando(true);
    Promise.all([
      listarVentas(params).catch(() => []),
      api("/pedidos").catch(() => []),
    ])
      .then(([ventas, pedidos]) => {
        const itemsVentas = (Array.isArray(ventas) ? ventas : []).map((v) => ({ ...v, tipo: "Venta" }));
        const itemsPedidos = (Array.isArray(pedidos) ? pedidos : []).map((p) => ({ ...p, tipo: "Pedido", cliente_id: p.usuario_id }));
        let combinados = [...itemsVentas, ...itemsPedidos];
        if (estado) {
          combinados = combinados.filter((x) => String(x.estado).toLowerCase() === estado);
        }
        combinados = combinados.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
        setItems(combinados);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [estado, fecha]);

  const anular = async (id) => {
    if (!window.confirm("¿Anular esta venta? Se devolverá el stock y la factura quedará anulada.")) return;
    try {
      await anularVenta(id);
      setError("");
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const descargar = async (tipo) => {
    try {
      const filtros = vista === "graficas" ? { estado, fecha: fechaGrafica } : { estado, fecha };
      await descargarHistorial(tipo, filtros);
    } catch (e) {
      setError(e.message);
    }
  };

  // ===== VISTA GRÁFICAS =====
  const datosGrafica = useMemo(() => {
    if (!fechaGrafica) return items;
    const d = new Date(`${fechaGrafica}T00:00:00`);
    if (Number.isNaN(d.getTime())) return items;
    const fin = new Date(d);
    fin.setDate(fin.getDate() + 1);
    return items.filter((x) => {
      const f = new Date(x.fecha);
      return f >= d && f < fin;
    });
  }, [items, fechaGrafica]);
  const series = useMemo(() => agruparPorPeriodo(datosGrafica, periodo), [datosGrafica, periodo]);
  const seriesBarras = series.map((s) => ({ label: s.label, value: s.total }));
  const seriesLineal = series.map((s) => ({ label: s.label, value: s.total }));

  const indicadores = useMemo(() => {
    const ingresos = datosGrafica.reduce((acc, x) => acc + Number(x.total || 0), 0);
    return {
      total_ventas: datosGrafica.length,
      ingresos_totales: ingresos,
      promedio: datosGrafica.length ? ingresos / datosGrafica.length : 0,
      anuladas: datosGrafica.filter((x) => ["anulada", "cancelado"].includes(String(x.estado).toLowerCase())).length,
      pedidos_servicios: datosGrafica.filter((x) => x.tipo === "Pedido" || x.servicio_id).length,
    };
  }, [datosGrafica]);

  const Cards = [
    { label: "🧾 Total de ventas", valor: indicadores.total_ventas, esMoneda: false },
    { label: "💰 Ingresos totales", valor: indicadores.ingresos_totales, esMoneda: true },
    { label: "📈 Promedio por venta", valor: indicadores.promedio, esMoneda: true },
    { label: "❌ Anuladas/Canceladas", valor: indicadores.anuladas, esMoneda: false },
    { label: "🛠 Pedidos/Servicios", valor: indicadores.pedidos_servicios, esMoneda: false },
  ];

  return (
    <section className="p-8 text-white">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Ventas</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold">Historial de ventas</h1>
            <div className="flex gap-1 rounded-lg border border-gray-700 bg-[#111827] p-1">
              <button
                onClick={() => setVista("tabla")}
                className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${
                  vista === "tabla" ? "bg-cyan-400 text-gray-900" : "border border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                📋 Ventas
              </button>
              <button
                onClick={() => setVista("graficas")}
                className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${
                  vista === "graficas" ? "bg-cyan-400 text-gray-900" : "border border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                📊 Gráficas
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => descargar("pdf")}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-cyan-300"
            >
              ⬇️ PDF
            </button>
            <button
              onClick={() => descargar("excel")}
              className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/10"
            >
              ⬇️ Excel
            </button>
          </div>
          {vista === "tabla" && (
            <>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                {OPCIONES_ESTADO.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                aria-label="Filtrar por fecha"
              />
            </>
          )}
        </div>
      </header>

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</p>}

      {vista === "graficas" ? (
        <div className="space-y-6">
          {/* Selector periodo + fecha */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              aria-label="Periodo"
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="año">Año</option>
            </select>
            <input
              type="date"
              value={fechaGrafica}
              onChange={(e) => setFechaGrafica(e.target.value)}
              className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              aria-label="Filtrar gráficas por fecha"
            />
            <div className="flex gap-2">
              <button
                onClick={() => descargar("pdf")}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-cyan-300"
              >
                ⬇️ PDF
              </button>
              <button
                onClick={() => descargar("excel")}
                className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                ⬇️ Excel
              </button>
            </div>
          </div>

          {/* Cards de indicadores */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-gray-800 bg-[#111827] p-5">
                <p className="text-sm text-gray-400">{c.label}</p>
                <p className="mt-1 text-2xl font-bold text-cyan-400">
                  {c.esMoneda ? formatoPrecio(c.valor) : c.valor}
                </p>
              </div>
            ))}
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">📊 Ingresos por {periodo}</h2>
              <GraficaBarras items={seriesBarras} formato={formatoPrecio} />
            </div>
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">📈 Tendencia de ventas</h2>
              <GraficaLineal items={seriesLineal} />
            </div>
          </div>
        </div>
      ) : cargando ? (
        <p className="text-gray-400">Cargando ventas...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-10 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-3 text-gray-400">Aún no hay ventas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((v) => {
            const fechaTexto = v.fecha ? new Date(v.fecha).toLocaleString("es-CO") : "—";
            return (
              <article key={v.id} className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-[#111827] p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link to={v.tipo === "Pedido" ? `/panel/detalle-pedido/${v.id}` : `/panel/ventas/${v.id}`} className="font-bold transition hover:text-cyan-300">
                    {v.tipo} #{v.id}
                  </Link>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      color: COLORES_ESTADO[v.estado] || "#94a3b8",
                      backgroundColor: `${COLORES_ESTADO[v.estado] || "#94a3b8"}1a`,
                    }}
                  >
                    {v.estado}
                  </span>
                </div>
                <p className="text-2xl font-bold text-cyan-400">{formatoPrecio(v.total)}</p>
                <p className="text-sm text-gray-400">{fechaTexto}</p>
                <p className="text-sm text-gray-500">Cliente #{v.cliente_id}</p>
                {rol !== "cliente" && v.tipo !== "Pedido" && v.estado !== "anulada" && (
                  <button
                    onClick={() => anular(v.id)}
                    className="mt-auto rounded-lg border border-red-500/40 px-3 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/10"
                  >
                    ❌ Anular
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HistorialVentas;
