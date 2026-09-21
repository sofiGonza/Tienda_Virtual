import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
};

function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = obtenerSesion()?.token;
    fetch(`${API_URL}/pedidos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) throw new Error(d.detail);
        setPedido(d);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="p-10 text-red-400">{error}</p>;
  if (!pedido) return <p className="p-10 text-white">Cargando detalle...</p>;

  const detalles = pedido.detalles || [];

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 hover:bg-gray-800"
      >
        ← Volver
      </button>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">🧾 Detalle del pedido</h1>
        <p className="mt-1 text-sm text-gray-400">
          Pedido #{String(pedido.id).padStart(3, "0")} ·{" "}
          {pedido.fecha ? new Date(pedido.fecha).toLocaleString("es-CO") : ""}
        </p>
      </header>

      {/* ESTADO */}
      <div className="mb-6 rounded-2xl border border-gray-800 bg-[#111827] p-5">
        <p className="text-sm text-gray-400">Estado</p>
        <span className={`mt-2 inline-block rounded-full px-4 py-2 text-sm font-bold capitalize ${COLORES[pedido.estado] || "bg-gray-500/20 text-gray-400"}`}>
          {pedido.estado}
        </span>
      </div>

      {/* PRODUCTOS */}
      <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
        <h2 className="mb-4 text-lg font-bold text-white">🛍 Productos del pedido</h2>
        {detalles.length === 0 ? (
          <p className="text-sm text-gray-500">Sin productos registrados.</p>
        ) : (
          <div className="space-y-3">
            {detalles.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">
                    {d.producto?.nombre || d.nombre || `Producto #${d.producto_id}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {d.cantidad} × {formatoPrecio(d.precio_unitario)}
                  </p>
                </div>
                <p className="font-bold text-cyan-400">{formatoPrecio(d.subtotal)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-gray-800 pt-4">
          <span className="text-gray-400">Total</span>
          <span className="text-2xl font-bold text-cyan-400">{formatoPrecio(pedido.total)}</span>
        </div>
      </div>
    </div>
  );
}

export default DetallePedido;
