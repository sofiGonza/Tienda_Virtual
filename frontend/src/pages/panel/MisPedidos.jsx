import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../Services/api";
import { obtenerSesion } from "../../Services/AuthService";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const COLORES = {
  pendiente: "bg-yellow-500/20 text-yellow-400",
  procesando: "bg-blue-500/20 text-blue-400",
  enviado: "bg-purple-500/20 text-purple-400",
  entregado: "bg-green-500/20 text-green-400",
  cancelado: "bg-red-500/20 text-red-400",
  realizado: "bg-green-500/20 text-green-400",
};

function MisPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const token = obtenerSesion()?.token;
      const r = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "Error al cargar pedidos");
      setPedidos(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cancelar = async (id) => {
    if (!window.confirm("¿Cancelar este pedido?")) return;
    try {
      const token = obtenerSesion()?.token;
      const r = await fetch(`${API_URL}/pedidos/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: "cancelado" }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "No se pudo cancelar");
      cargar();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">🧾 Mis Pedidos</h1>
        <p className="mt-1 text-sm text-gray-400">Consulta el estado de tus pedidos y su detalle.</p>
      </header>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-400">{error}</p>}
      {cargando ? (
        <p className="text-white">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] p-12 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-4 text-xl text-gray-400">No tienes pedidos todavía</p>
          <button
            onClick={() => navigate("/productos")}
            className="mt-6 rounded-lg bg-cyan-400 px-6 py-3 font-bold text-gray-900"
          >
            Ver productos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => (
            <div key={p.id} className="rounded-2xl border border-gray-800 bg-[#111827] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Pedido #{String(p.id).padStart(3, "0")} ·{" "}
                    {p.fecha ? new Date(p.fecha).toLocaleDateString("es-CO") : ""}
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">{formatoPrecio(p.total)}</p>
                </div>
                <span className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${COLORES[p.estado] || "bg-gray-500/20 text-gray-400"}`}>
                  {p.estado}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {(p.detalles || []).map((d) => (
                  <div key={d.id} className="rounded-lg bg-gray-900 px-4 py-2 text-sm">
                    <span className="font-semibold text-white">{d.nombre || "Producto"}</span>
                    {d.servicio_id ? (
                      <span className="ml-2 text-cyan-300">🛠 {d.horas} horas × {formatoPrecio(d.precio_unitario)}</span>
                    ) : (
                      <span className="ml-2 text-gray-400">× {d.cantidad}</span>
                    )}
                    <span className="float-right font-bold text-cyan-400">{formatoPrecio(d.subtotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate(`/panel/detalle-pedido/${p.id}`)}
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-cyan-300"
                >
                  🔍 Ver detalle
                </button>
                {p.estado !== "entregado" && p.estado !== "cancelado" && p.estado !== "realizado" && (
                  <button
                    onClick={() => cancelar(p.id)}
                    className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10"
                  >
                    ✖ Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisPedidos;
