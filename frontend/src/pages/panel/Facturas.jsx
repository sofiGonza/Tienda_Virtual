import { useEffect, useState } from "react";
import { listarFacturas, descargarFacturaPdf, descargarFacturaExcel } from "../../Services/facturas";
import Paginador, { usePaginacion } from "../../components/panel/Paginador";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const OPCIONES_ESTADO = ["emitida", "anulada"];

function Facturas() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const { pagina, totalPaginas, inicio, fin, irA, reset } = usePaginacion(items.length);

  useEffect(() => {
    setCargando(true);
    setError("");
    const params = {};
    if (q) params.numero = q;
    if (estado) params.estado = estado;
    if (fecha) params.fecha = fecha;
    listarFacturas(params)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [q, estado, fecha]);

  // Volver a la primera página al cambiar filtros.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado, fecha]);

  return (
    <section className="p-8 text-white">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Facturación</p>
          <h1 className="mt-1 text-3xl font-bold">Facturas</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <input
            className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white outline-none focus:border-cyan-400"
            placeholder="Buscar por número"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar factura por número"
          />
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
        </div>
      </header>

      {error && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</p>}
      {cargando ? (
        <p className="text-gray-400">Cargando facturas...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-10 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 text-gray-400">No hay facturas que coincidan con los filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(inicio, fin).map((f) => (
            <article key={f.id} className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-[#111827] p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-cyan-400">{f.numero}</p>
                  <p className="mt-1 text-xs text-gray-500">{f.fecha ? new Date(f.fecha).toLocaleString("es-CO") : "—"}</p>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">{f.estado}</span>
              </div>
              {f.cliente_nombre && (
                <p className="text-sm text-gray-400">
                  👤 {f.cliente_nombre}
                </p>
              )}
              {f.estado_origen && (
                <span className="w-fit rounded-full px-3 py-1 text-xs font-bold capitalize" style={{ color: "#94a3b8", backgroundColor: "#94a3b81a" }}>
                  {f.tipo === "venta" ? "Venta" : "Pedido"}: {f.estado_origen}
                </span>
              )}
              <p className="text-2xl font-bold">{formatoPrecio(f.total)}</p>
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                <p className="flex justify-between"><span>Subtotal</span><span>{formatoPrecio(f.subtotal)}</span></p>
                <p className="flex justify-between"><span>Impuesto</span><span>{formatoPrecio(f.impuestos)}</span></p>
                <p className="flex justify-between border-t border-gray-700 pt-1 font-semibold text-white"><span>Total</span><span>{formatoPrecio(f.total)}</span></p>
                {f.operador ? (
                  <p className="mt-2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-300">
                    🧑‍💼 Añadida por: {f.operador.nombre} {f.operador.apellido}
                  </p>
                ) : (
                  <p className="mt-2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-gray-400">
                    🛒 Factura de pedido
                  </p>
                )}
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => descargarFacturaPdf(f.id).catch((e) => setError(e.message))}
                  className="flex-1 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-gray-900 transition hover:bg-cyan-300"
                >
                  ⬇️ PDF
                </button>
                <button
                  onClick={() => descargarFacturaExcel(f.id).catch((e) => setError(e.message))}
                  className="flex-1 rounded-lg border border-cyan-400/40 px-3 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  ⬇️ Excel
                </button>
              </div>
            </article>
          ))}
          </div>
          <Paginador pagina={pagina} totalPaginas={totalPaginas} irA={irA} />
        </>
      )}
    </section>
  );
}

export default Facturas;
