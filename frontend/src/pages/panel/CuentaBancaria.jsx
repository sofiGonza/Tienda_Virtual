import { useEffect, useState } from "react";
import { obtenerCuenta, guardarCuenta } from "../../Services/usuarios";

function CuentaBancaria() {
  const [cuenta, setCuenta] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({ cuenta_bancaria: "", banco: "", titular_cuenta: "" });
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });

  const cargar = () => {
    setCargando(true);
    obtenerCuenta()
      .then((data) => {
        setCuenta(data);
        setForm({
          cuenta_bancaria: data.cuenta_bancaria || "",
          banco: data.banco || "",
          titular_cuenta: data.titular_cuenta || "",
        });
        setModoEdicion(false);
      })
      .catch((e) => setMsg({ tipo: "error", texto: e.message }))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.cuenta_bancaria.trim() || !form.banco.trim() || !form.titular_cuenta.trim()) {
      setMsg({ tipo: "error", texto: "Completa los tres campos para vincular tu cuenta." });
      return;
    }
    try {
      await guardarCuenta({
        cuenta_bancaria: form.cuenta_bancaria.trim(),
        banco: form.banco.trim(),
        titular_cuenta: form.titular_cuenta.trim(),
      });
      setMsg({ tipo: "ok", texto: "✅ Cuenta bancaria guardada correctamente." });
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  const desvincular = async () => {
    if (!window.confirm("¿Desvincular tu cuenta bancaria? Ya no será obligatoria para tus próximos pedidos.")) return;
    try {
      await guardarCuenta({ cuenta_bancaria: "", banco: "", titular_cuenta: "" });
      setMsg({ tipo: "ok", texto: "✅ Cuenta desvinculada." });
      cargar();
    } catch (x) {
      setMsg({ tipo: "error", texto: x.message });
    }
  };

  if (cargando) return <p className="p-8 text-white">Cargando cuenta...</p>;

  const tieneCuenta = Boolean(cuenta?.cuenta_bancaria);

  return (
    <section className="p-8 text-white">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Mi cuenta</p>
        <h1 className="mt-1 text-3xl font-bold">💳 Cuenta bancaria</h1>
        <p className="mt-2 text-sm text-gray-400">
          {tieneCuenta
            ? "Así se usará tu cuenta para devoluciones y pagos."
            : "Vincula la cuenta donde recibirás tus devoluciones o pagos."}
        </p>
      </header>

      {msg.texto && (
        <p className={`mb-4 rounded-xl border p-4 text-sm ${msg.tipo === "ok" ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {msg.texto}
        </p>
      )}

      {!tieneCuenta && !modoEdicion ? (
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-10 text-center">
          <p className="text-5xl">🏦</p>
          <p className="mt-4 text-lg font-semibold">Aún no tienes una cuenta vinculada</p>
          <p className="mt-2 text-sm text-gray-400">Para hacer pedidos necesitas vincular una cuenta bancaria.</p>
          <button
            onClick={() => setModoEdicion(true)}
            className="mt-6 rounded-lg bg-cyan-400 px-6 py-3 font-bold text-gray-900 transition hover:bg-cyan-300"
          >
            ➕ Vincular cuenta
          </button>
        </div>
      ) : tieneCuenta && !modoEdicion ? (
        <div className="max-w-xl rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">🏦 Cuenta vinculada</h2>
            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">● Vinculada</span>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <dt className="text-gray-400">Número de cuenta</dt>
              <dd className="font-semibold">{cuenta.cuenta_bancaria}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <dt className="text-gray-400">Banco</dt>
              <dd className="font-semibold">{cuenta.banco}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-3">
              <dt className="text-gray-400">Titular</dt>
              <dd className="font-semibold">{cuenta.titular_cuenta}</dd>
            </div>
          </dl>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setModoEdicion(true); setMsg({ tipo: "", texto: "" }); }}
              className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 font-bold text-gray-900 transition hover:bg-cyan-300"
            >
              ✏️ Editar
            </button>
            <button
              onClick={desvincular}
              className="flex-1 rounded-lg border border-red-500/40 px-4 py-3 font-bold text-red-400 transition hover:bg-red-500/10"
            >
              🚫 Desvincular
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={guardar} className="grid max-w-xl gap-4 rounded-2xl border border-gray-800 bg-[#111827] p-6">
          <h2 className="text-lg font-bold">✏️ {tieneCuenta ? "Editar cuenta" : "Vincular cuenta"}</h2>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Número de cuenta</span>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              value={form.cuenta_bancaria}
              onChange={(e) => setForm({ ...form, cuenta_bancaria: e.target.value })}
              placeholder="Ej: 1234567890"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Banco</span>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              value={form.banco}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
              placeholder="Ej: Bancolombia"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">Titular de la cuenta</span>
            <input
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white outline-none focus:border-cyan-400"
              value={form.titular_cuenta}
              onChange={(e) => setForm({ ...form, titular_cuenta: e.target.value })}
              placeholder="Nombre del titular"
              required
            />
          </label>
          <div className="flex gap-3">
            <button className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 font-bold text-gray-900 transition hover:bg-cyan-300">
              💾 Guardar
            </button>
            <button
              type="button"
              onClick={() => { setModoEdicion(false); setMsg({ tipo: "", texto: "" }); }}
              className="flex-1 rounded-lg border border-gray-600 px-4 py-3 font-bold text-gray-300 transition hover:bg-gray-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default CuentaBancaria;
