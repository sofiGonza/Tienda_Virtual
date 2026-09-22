import { useState } from "react";
import { enviarMensaje } from "../Services/chatbot";
import { obtenerSesion } from "../Services/AuthService";
import WhatsAppButton from "./WhatsAppButton";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  // Las preguntas sugeridas se despliegan desde su titulito; al enviar
  // una pregunta se repliegan y el titulito queda para volver a abrirlas.
  const [sugeridasAbiertas, setSugeridasAbiertas] = useState(true);
  const [messages, setMessages] = useState([
    { rol: "assistant", contenido: "Hola. Puedo orientarte sobre productos, pedidos, facturas y PQR." },
  ]);

  const sesion = obtenerSesion();

  const PREGUNTAS_SUGERIDAS = [
    "¿Cuál es el producto más barato?",
    "¿Cuál es el producto más caro?",
    "¿Cuál es el producto con más stock?",
    "¿Cuál es el producto con menos stock?",
    "¿Cuál es el mejor servicio?",
    "Mi computador está lento, ¿qué me recomiendas?",
    "¿Qué servicios ofrecen?",
    "¿Cómo registro una PQR?",
    "¿Cuáles son sus horarios?",
    "¿Dónde se encuentra la tienda?",
  ];

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !sesion) return;
    const value = text;
    setText("");
    // Al enviar, las preguntas sugeridas se repliegan (el titulito queda
    // para que el usuario las vuelva a desplegar).
    setSugeridasAbiertas(false);
    setMessages((m) => [...m, { rol: "user", contenido: value }]);
    setEscribiendo(true);
    try {
      const r = await enviarMensaje({ mensaje: value });
      setMessages((m) => [...m, { rol: r.rol, contenido: r.contenido }]);
    } catch (err) {
      setMessages((m) => [...m, { rol: "assistant", contenido: `⚠️ No pude responder: ${err.message || "error de conexión"}. Verifica que el backend esté activo e inténtalo de nuevo.` }]);
    } finally {
      setEscribiendo(false);
    }
  };

  const sugerir = (pregunta) => {
    if (!sesion) return;
    setText(pregunta);
    setSugeridasAbiertas(false);
    setOpen(true);
    setTimeout(() => send({ preventDefault: () => {} }), 50);
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[9999] flex flex-col items-end gap-3 sm:left-auto sm:right-6">
      {open && (
        <div
          className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-cyan-400/40 bg-slate-900 text-white shadow-2xl sm:w-80"
          role="dialog"
          aria-label="Chatbot Pixel Store"
        >
          <div className="flex items-center justify-between border-b border-gray-800 bg-[#0f172a] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-400" />
              <b>Asistente Pixel Store</b>
            </div>
            <button
              aria-label="Cerrar chatbot"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 text-gray-400 transition hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="max-h-72 flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.rol === "user" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={
                    m.rol === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-cyan-400 px-3 py-2 text-sm text-gray-900"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-800 px-3 py-2 text-sm text-gray-100"
                  }
                >
                  {m.contenido}
                </p>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-sm bg-gray-800 px-3 py-2 text-sm text-gray-400">Escribiendo...</p>
              </div>
            )}
          </div>

          {sesion && (
            <div className="border-t border-gray-800 p-3">
              <button
                type="button"
                onClick={() => setSugeridasAbiertas(!sugeridasAbiertas)}
                aria-expanded={sugeridasAbiertas}
                aria-controls="preguntas-sugeridas-lista"
                className="flex w-full items-center justify-between text-[11px] uppercase tracking-wide text-gray-400 transition hover:text-cyan-300"
              >
                <span>Preguntas sugeridas</span>
                <span aria-hidden="true" className="text-base leading-none">{sugeridasAbiertas ? "−" : "+"}</span>
              </button>
              {sugeridasAbiertas && (
                <div id="preguntas-sugeridas-lista" className="mt-2 flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
                  {PREGUNTAS_SUGERIDAS.map((pregunta) => (
                    <button
                      key={pregunta}
                      type="button"
                      onClick={() => sugerir(pregunta)}
                      className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 transition hover:bg-cyan-400/20"
                    >
                      {pregunta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {sesion ? (
            <form onSubmit={send} className="flex gap-2 border-t border-gray-800 p-3">
              <input
                className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                aria-label="Mensaje para el asistente"
              />
              <button className="rounded-lg bg-cyan-400 px-4 text-sm font-bold text-gray-900 transition hover:bg-cyan-300">
                Enviar
              </button>
            </form>
          ) : (
            <div className="border-t border-gray-800 p-3 text-center text-sm text-gray-400">
              🔒 Inicia sesión para chatear con el asistente.
            </div>
          )}
          <small className="bg-[#0f172a] px-4 py-2 text-[11px] text-gray-500">
            IA externa opcional; fallback FAQ activo.
          </small>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="group relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-2xl text-gray-900 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/50"
            aria-label={open ? "Cerrar chatbot" : "Abrir chatbot"}
          >
            <span aria-hidden="true">💬</span>
          </button>
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            Chat
          </span>
        </div>
        <WhatsAppButton />
      </div>
    </div>
  );
}

export default Chatbot;
