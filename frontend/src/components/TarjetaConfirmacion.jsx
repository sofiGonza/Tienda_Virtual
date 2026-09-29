// =========================================================
// TarjetaConfirmacion — tarjeta modal de confirmación
// reutilizable (eliminar producto, usuario, servicio, etc.).
// Reemplaza a window.confirm() con una tarjeta estilizada
// que muestra el mensaje y los botones Cancelar / Confirmar.
// =========================================================

function TarjetaConfirmacion({
  abierto,
  titulo,
  mensaje,
  confirmarTexto = "Confirmar",
  cancelarTexto = "Cancelar",
  emoji = "🗑️",
  onConfirmar,
  onCancelar,
}) {
  if (!abierto) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
      "
      onClick={onCancelar}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="
          w-full
          max-w-sm
          overflow-hidden
          rounded-2xl
          border
          border-cyan-400/20
          bg-fondo
          text-center
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA */}
        <div
          className="
            border-b
            border-borde
            bg-gradient-to-r
            from-fondo
            via-superficie
            to-fondo
            px-6
            py-8
          "
        >
          <span
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-500/15
              text-4xl
            "
            aria-hidden="true"
          >
            {emoji}
          </span>
          <h3
            className="
              mt-4
              text-2xl
              font-bold
              text-texto
            "
          >
            {titulo}
          </h3>
          {mensaje && (
            <p
              className="
                mt-2
                text-sm
                text-texto-tenue
              "
            >
              {mensaje}
            </p>
          )}
        </div>

        {/* ACCIONES */}
        <div className="flex gap-3 p-6">
          <button
            type="button"
            onClick={onCancelar}
            className="
              flex-1
              rounded-lg
              border
              border-borde
              px-4
              py-3
              font-bold
              text-texto-suave
              transition
              hover:bg-superficie-2
              hover:text-texto
            "
          >
            {cancelarTexto}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="
              flex-1
              rounded-lg
              bg-red-500
              px-4
              py-3
              font-bold
              text-white
              transition
              hover:bg-red-600
            "
          >
            {confirmarTexto}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaConfirmacion;
