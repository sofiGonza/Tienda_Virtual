import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../../Services/api";
import { crearVenta } from "../../Services/ventas";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

function Ventas() {
  const { rol } = useOutletContext();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [lineas, setLineas] = useState([{ producto_id: "", cantidad: 1, descuento: 0 }]);
  const [clienteId, setClienteId] = useState("");
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState(0);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api("/productos")
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((e) => setMsg({ tipo: "error", texto: e.message }));
    if (rol === "administrador") {
      api("/usuarios")
        .then((data) => setClientes(Array.isArray(data) ? data.filter((u) => u.rol?.nombre === "cliente") : []))
        .catch(() => setClientes([]));
    }
  }, [rol]);

  const agregarLinea = () => setLineas((ls) => [...ls, { producto_id: "", cantidad: 1, descuento: 0 }]);
  const quitarLinea = (idx) => setLineas((ls) => ls.filter((_, i) => i !== idx));

  const actualizarLinea = (idx, campo, valor) =>
    setLineas((ls) => ls.map((l, i) => (i === idx ? { ...l, [campo]: valor } : l)));

  const calcular = () => {
    let subtotal = 0;
    for (const linea of lineas) {
      const producto = productos.find((p) => p.id === Number(linea.producto_id));
      if (!producto) continue;
      const bruto = Number(producto.precio) * Number(linea.cantidad || 0);
      const descuento = Math.min(Number(linea.descuento || 0), bruto);
      subtotal += bruto - descuento;
    }
    const impuestos = (subtotal * Number(impuestoPorcentaje || 0)) / 100;
    return { subtotal, impuestos, total: subtotal + impuestos };
  };

  const { subtotal, impuestos, total } = calcular();

  const enviar = async (e) => {
    e.preventDefault();
    const items = lineas
      .filter((l) => l.producto_id)
      .map((l) => ({
        producto_id: Number(l.producto_id),
        cantidad: Number(l.cantidad),
        descuento: Number(l.descuento || 0),
      }));
    if (!items.length) {
      setMsg({ tipo: "error", texto: "Agrega al menos un producto." });
      return;
    }
    setEnviando(true);
    setMsg({ tipo: "", texto: "" });
    try {
      await crearVenta({
        cliente_id: clienteId ? Number(clienteId) : null,
        items,
        impuesto_porcentaje: Number(impuestoPorcentaje || 0),
      });
      setMsg({ tipo: "ok", texto: "✅ Venta registrada correctamente." });
      setLineas([{ producto_id: "", cantidad: 1, descuento: 0 }]);
      setClienteId("");
      setImpuestoPorcentaje(0);
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="p-8 text-white">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Ventas</p>
        <h1 className="mt-1 text-3xl font-bold">Registrar venta</h1>
      </header>

      <form onSubmit={enviar} className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🛍️ Líneas de venta</h2>
            <button type="button" onClick={agregarLinea} className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-bold text-gray-900 transition hover:bg-cyan-300">
              + Agregar producto
            </button>
          </div>

          {lineas.map((linea, idx) => {
            const producto = productos.find((p) => p.id === Number(linea.producto_id));
            return (
              <div key={idx} className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_90px_110px_auto]">
                  <select
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                    value={linea.producto_id}
                    onChange={(e) => actualizarLinea(idx, "producto_id", e.target.value)}
                    aria-label={`Producto línea ${idx + 1}`}
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {formatoPrecio(p.precio)} (stock {p.stock})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={linea.cantidad}
                    onChange={(e) => actualizarLinea(idx, "cantidad", e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                    aria-label={`Cantidad línea ${idx + 1}`}
                  />
                  <input
                    type="number"
                    min="0"
                    value={linea.descuento}
                    onChange={(e) => actualizarLinea(idx, "descuento", e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                    aria-label={`Descuento línea ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => quitarLinea(idx)}
                    className="rounded-lg bg-red-500/10 px-3 py-2 text-red-400 transition hover:bg-red-500/20"
                    aria-label={`Quitar línea ${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>
                {producto && (
                  <p className="mt-2 text-xs text-gray-400">
                    Subtotal línea: {formatoPrecio(Math.max(0, Number(producto.precio) * Number(linea.cantidad || 0) - Number(linea.descuento || 0)))}
                  </p>
                )}
              </div>
            );
          })}

              <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-gray-400">Impuesto (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={impuestoPorcentaje}
                onChange={(e) => setImpuestoPorcentaje(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              />
            </label>
            {rol === "administrador" && (
              <label className="block">
                <span className="mb-1 block text-sm text-gray-400">Cliente</span>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                >
                  <option value="">Sin cliente (sesión actual)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} — {c.correo}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
            <h2 className="mb-4 text-lg font-bold">🧾 Resumen</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Subtotal</dt><dd className="font-semibold">{formatoPrecio(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Impuestos</dt><dd className="font-semibold">{formatoPrecio(impuestos)}</dd></div>
              <div className="flex justify-between border-t border-gray-700 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="text-2xl font-bold text-cyan-400">{formatoPrecio(total)}</dd></div>
            </dl>
          </div>
          {msg.texto && (
            <p className={`rounded-xl border p-4 text-sm ${msg.tipo === "ok" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
              {msg.texto}
            </p>
          )}
          <button type="submit" disabled={enviando} className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">
            {enviando ? "Guardando..." : "💾 Guardar venta"}
          </button>
        </aside>
      </form>
    </section>
  );
}

export default Ventas;
