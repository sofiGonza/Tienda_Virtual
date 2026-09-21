import { useEffect, useState } from "react";
import { listarServicios, crearServicio, actualizarServicio, eliminarServicio } from "../../Services/servicios";
import { obtenerSesion } from "../../Services/AuthService";

const formatoPrecio = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

const formVacio = { nombre: "", descripcion: "", precio: "", icono: "" };

function AdminServicios() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const [cargando, setCargando] = useState(true);
  const rol = obtenerSesion()?.rol?.toLowerCase();
  const esAdmin = rol === "administrador";

  const cargar = () => {
    setCargando(true);
    listarServicios()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setMsg({ tipo: "error", texto: e.message }))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const guardar = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      icono: form.icono.trim() || null,
      estado: true,
    };
    try {
      if (editando) {
        await actualizarServicio(editando, payload);
        setMsg({ tipo: "ok", texto: "✅ Servicio actualizado." });
      } else {
        await crearServicio(payload);
        setMsg({ tipo: "ok", texto: "✅ Servicio creado." });
      }
      setForm(formVacio);
      setEditando(null);
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  const editar = (servicio) => {
    setEditando(servicio.id);
    setForm({ nombre: servicio.nombre, descripcion: servicio.descripcion, precio: servicio.precio, icono: servicio.icono || "" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este servicio?")) return;
    try {
      await eliminarServicio(id);
      setMsg({ tipo: "ok", texto: "✅ Servicio eliminado." });
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  return (
    <section className="p-8 text-white">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Panel</p>
        <h1 className="mt-1 text-3xl font-bold">🛠 Servicios</h1>
      </header>

      {msg.texto && (
        <p className={`mb-4 rounded-xl border p-4 text-sm ${msg.tipo === "ok" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {msg.texto}
        </p>
      )}

      <form onSubmit={guardar} className="mb-8 grid max-w-3xl gap-3 rounded-2xl border border-gray-800 bg-[#111827] p-6 md:grid-cols-2">
        <h2 className="text-lg font-bold md:col-span-2">{editando ? "✏️ Editar servicio" : "➕ Nuevo servicio"}</h2>
        <input
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
          placeholder="Precio por hora"
          type="number"
          min="0"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          required
        />
        <input
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400 md:col-span-2"
          placeholder="Icono (ej: laptop, download, cog)"
          value={form.icono}
          onChange={(e) => setForm({ ...form, icono: e.target.value })}
        />
        <textarea
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400 md:col-span-2"
          placeholder="Descripción"
          rows={3}
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          required
        />
        <div className="flex gap-3 md:col-span-2">
          <button className="rounded-lg bg-cyan-400 px-5 py-2 font-bold text-gray-900 transition hover:bg-cyan-300">
            {editando ? "💾 Guardar cambios" : "➕ Crear servicio"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => { setEditando(null); setForm(formVacio); }}
              className="rounded-lg border border-gray-600 px-5 py-2 text-gray-300 transition hover:bg-gray-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargando ? (
        <p className="text-gray-400">Cargando servicios...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No hay servicios.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Precio/hora</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((s) => (
                <tr key={s.id} className="bg-[#111827]">
                  <td className="px-4 py-3 font-semibold">{s.nombre}</td>
                  <td className="max-w-[280px] px-4 py-3 text-gray-400">{s.descripcion}</td>
                  <td className="px-4 py-3 font-bold text-cyan-400">{formatoPrecio(s.precio)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.estado ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {s.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => editar(s)} className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20">
                        ✏️ Editar
                      </button>
                      {esAdmin && (
                        <button onClick={() => eliminar(s.id)} className="rounded-lg bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 transition hover:bg-red-500/20">
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminServicios;
