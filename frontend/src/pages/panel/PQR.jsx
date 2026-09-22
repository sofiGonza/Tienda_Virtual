import { useEffect, useState } from "react";
import { listarPQR, crearPQR, actualizarPQR } from "../../Services/pqr";
import { obtenerSesion } from "../../Services/AuthService";
import Paginador, { usePaginacion } from "../../components/panel/Paginador";

const ESTADOS = ["pendiente", "en_proceso", "respondida", "cerrada"];

const COLORS = {
  pendiente: "#facc15",
  en_proceso: "#3b82f6",
  respondida: "#22c55e",
  cerrada: "#94a3b8",
};

function PQR() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ asunto: "", tipo: "peticion", descripcion: "" });
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [cargando, setCargando] = useState(true);
  const sesion = obtenerSesion();
  const rol = sesion?.rol?.toLowerCase();
  const { pagina, totalPaginas, inicio, fin, irA, reset } = usePaginacion(items.length);

  const cargar = () => {
    setCargando(true);
    listarPQR()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setMsg({ tipo: "error", texto: e.message }))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      await crearPQR(form);
      setForm({ asunto: "", tipo: "peticion", descripcion: "" });
      setMsg({ tipo: "ok", texto: "✅ PQR registrada correctamente." });
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  const gestionar = async (id, cambios) => {
    try {
      await actualizarPQR(id, cambios);
      setMsg({ tipo: "ok", texto: "✅ PQR actualizada." });
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  return (
    <section className="p-8 text-white">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">PQR</p>
        <h1 className="mt-1 text-3xl font-bold">Peticiones, quejas y reclamos</h1>
      </header>

      {rol === "cliente" && (
        <form onSubmit={enviar} className="mb-8 grid max-w-xl gap-3 rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="text-lg font-bold">➕ Nueva PQR</h2>
          <input
            className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
            placeholder="Asunto"
            value={form.asunto}
            onChange={(e) => setForm({ ...form, asunto: e.target.value })}
            required
          />
          <select
            className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          >
            <option value="peticion">Petición</option>
            <option value="queja">Queja</option>
            <option value="reclamo">Reclamo</option>
          </select>
          <textarea
            className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
            placeholder="Descripción"
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
          />
          <button className="rounded-lg bg-cyan-400 px-4 py-3 font-bold text-gray-900 transition hover:bg-cyan-300">
            Registrar PQR
          </button>
        </form>
      )}

      {msg.texto && (
        <p className={`mb-4 rounded-xl border p-4 text-sm ${msg.tipo === "ok" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {msg.texto}
        </p>
      )}

      {cargando ? (
        <p className="text-gray-400">Cargando PQR...</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-10 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 text-gray-400">No hay PQR registradas.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(inicio, fin).map((x) => (
            <article key={x.id} className="rounded-2xl border border-gray-800 bg-[#111827] p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold">{x.asunto}</h3>
                  {x.usuario_nombre && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                      <span aria-hidden="true">👤</span>
                      <span className="truncate">{x.usuario_nombre}</span>
                    </p>
                  )}
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ color: COLORS[x.estado] || "#94a3b8", backgroundColor: `${COLORS[x.estado] || "#94a3b8"}1a` }}
                >
                  {x.estado}
                </span>
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-cyan-400">{x.tipo}</p>
              <p className="mt-3 text-sm text-gray-300">{x.descripcion}</p>
              {x.respuesta && (
                <p className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                  💬 {x.respuesta}
                </p>
              )}

              {rol !== "cliente" && (
                <div className="mt-4 space-y-2">
                  {x.estado === "cerrada" ? (
                    <p className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-xs text-gray-400">
                      🔒 Esta PQR está cerrada y ya no puede modificarse.
                    </p>
                  ) : (
                    <>
                      <select
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
                        value={x.estado}
                        onChange={(e) => gestionar(x.id, { estado: e.target.value })}
                        aria-label={`Estado PQR ${x.id}`}
                      >
                        {ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {est}
                          </option>
                        ))}
                      </select>
                      <textarea
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                        placeholder="Escribe la respuesta (opcional)"
                        rows={2}
                        defaultValue={x.respuesta || ""}
                        onBlur={(e) => {
                          const valor = e.target.value.trim();
                          if (valor && valor !== x.respuesta) gestionar(x.id, { respuesta: valor });
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </article>
          ))}
          </div>
          <Paginador pagina={pagina} totalPaginas={totalPaginas} irA={irA} />
        </>
      )}
    </section>
  );
}

export default PQR;
