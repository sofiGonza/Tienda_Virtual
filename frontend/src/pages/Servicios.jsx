import { useEffect, useState } from "react";
import { listarServicios } from "../Services/servicios";
import { obtenerSesion } from "../Services/AuthService";
import { obtenerCuenta, guardarCuenta } from "../Services/usuarios";
import { api } from "../Services/api";

const ICONOS = ["💻", "⬇️", "⚙️", "💡", "🛠️"];

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [horas, setHoras] = useState(1);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarServicios()
      .then((data) => setServicios(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const abrirModal = (servicio) => {
    setHoras(1);
    setMsg({ tipo: "", texto: "" });
    setModal(servicio);
  };

  const contratar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMsg({ tipo: "", texto: "" });
    try {
      const sesion = obtenerSesion();
      if (!sesion) {
        setMsg({ tipo: "error", texto: "Debes iniciar sesión para contratar un servicio." });
        return;
      }
      let cuenta = null;
      try {
        cuenta = await obtenerCuenta();
      } catch {
        cuenta = null;
      }
      if (!cuenta || !cuenta.cuenta_bancaria) {
        const numero = window.prompt("Para contratar necesitas una cuenta bancaria.\n\nNúmero de cuenta:");
        if (!numero || !numero.trim()) {
          setMsg({ tipo: "error", texto: "Debes vincular una cuenta bancaria para contratar." });
          return;
        }
        const banco = window.prompt("Banco:");
        if (!banco || !banco.trim()) {
          setMsg({ tipo: "error", texto: "Debes indicar el banco." });
          return;
        }
        const titular = window.prompt("Titular de la cuenta:");
        if (!titular || !titular.trim()) {
          setMsg({ tipo: "error", texto: "Debes indicar el titular." });
          return;
        }
        await guardarCuenta({
          cuenta_bancaria: numero.trim(),
          banco: banco.trim(),
          titular_cuenta: titular.trim(),
        });
      }

      const total = horas * Number(modal.precio || 0);
      const pedido = await api("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          servicios: [{ servicio_id: modal.id, horas: Number(horas) }],
        }),
      });
      setMsg({ tipo: "ok", texto: `✅ Servicio contratado. Pedido #${pedido.id} · Total ${formatoPrecio(total)}. Se generó tu factura.` });
      setModal(null);
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="mx-auto w-[90%] max-w-[1200px] py-20">
      <div className="mb-10 border-b border-gray-700 pb-6 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-400">Pixel Store</p>
        <h1 className="text-4xl font-bold text-white">Nuestros Servicios</h1>
        <p className="mt-2 text-gray-400">
          Además de ofrecer productos tecnológicos, contamos con servicios especializados. Contrata por horas y paga según el tiempo.
        </p>
      </div>

      {error && <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</p>}
      {msg.texto && (
        <p className={`mb-6 rounded-xl border p-4 ${msg.tipo === "ok" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {msg.texto}
        </p>
      )}

      {cargando ? (
        <p className="text-center text-white">Cargando servicios...</p>
      ) : (
        <div className="grid grid-cols-1 gap-7 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio, idx) => (
            <div
              key={servicio.id}
              className="w-full rounded-[15px] bg-[#1b2740e0] p-8 text-center shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,212,255,0.15)]"
            >
              <div className="mb-5 flex items-center justify-center text-[55px] text-cyan-400">
                {ICONOS[idx % ICONOS.length]}
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">{servicio.nombre}</h3>
              <p className="text-[15px] leading-relaxed text-gray-300">{servicio.descripcion}</p>
              <p className="mt-4 text-2xl font-bold text-cyan-400">{formatoPrecio(servicio.precio)}<span className="text-sm text-gray-400"> /hora</span></p>
              <button
                onClick={() => abrirModal(servicio)}
                className="mt-6 rounded-lg bg-cyan-400 px-6 py-3 font-bold text-gray-900 transition duration-300 hover:scale-105 hover:bg-cyan-300"
              >
                Contratar
              </button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-[#0f172a] p-8 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-cyan-400">Contratar: {modal.nombre}</h2>
            <p className="mt-2 text-sm text-gray-400">{modal.descripcion}</p>
            <p className="mt-4 text-lg">
              Valor hora: <span className="font-bold text-cyan-400">{formatoPrecio(modal.precio)}</span>
            </p>
            <form onSubmit={contratar} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-gray-400">Horas</span>
                <input
                  type="number"
                  min="1"
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <p className="rounded-xl bg-gray-900 px-4 py-3 text-center text-xl font-bold text-cyan-400">
                Total: {formatoPrecio(Number(horas || 0) * Number(modal.precio || 0))}
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-lg bg-cyan-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enviando ? "Contratando..." : "✅ Confirmar contratación"}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-full rounded-lg border border-gray-600 px-6 py-2 text-gray-300 transition hover:bg-gray-800"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Servicios;
