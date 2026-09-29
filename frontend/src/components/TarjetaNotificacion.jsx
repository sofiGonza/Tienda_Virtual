// =========================================================
// TarjetaNotificacion — tarjeta modal de éxito (como la del
// pedido realizado) reutilizable para ventas, usuarios y
// productos. Se usa en lugar de alert().
// =========================================================

function TarjetaNotificacion({
  abierto,
  titulo,
  mensaje,
  emoji = "✅",
  onCerrar,
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
      onClick={onCerrar}
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
            from-[#111827]
            via-[#1b2740]
            to-[#111827]
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
              bg-green-500/15
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

        {/* ACCIÓN */}
        <div className="p-6">
          <button
            type="button"
            onClick={onCerrar}
            className="
              w-full
              rounded-lg
              bg-cyan-400
              px-4
              py-3
              font-bold
              text-[#06202e]
              transition
              hover:bg-cyan-300
            "
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarjetaNotificacion;