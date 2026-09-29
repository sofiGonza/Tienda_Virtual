function ProductCard({
  producto,
  onAgregar,
  formatoPrecio,
  esAdministrador = false,
  esEmpleado = false,
  onEditar,
  onEliminar,
}) {

  // ==========================================
  // VALIDACIÓN DEL PRODUCTO
  // ==========================================

  if (!producto) {
    return null;
  }


  // ==========================================
  // IMAGEN
  // ==========================================

  const imagenProducto =
    producto.imagen && producto.imagen.trim() !== ""
      ? producto.imagen
      : null;


  return (

    <div
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-borde/50
        bg-superficie
        shadow-[0_10px_20px_rgba(0,0,0,0.2)]
        transition
        duration-300
        hover:-translate-y-2
        hover:shadow-[0_15px_30px_rgba(0,212,255,0.15)]
      "
    >

      {/* ==========================================
          IMAGEN
      ========================================== */}

      <div
        className="
          relative
          h-[220px]
          w-full
          overflow-hidden
          bg-superficie-2
        "
      >

        {imagenProducto ? (

          <img
            src={imagenProducto}
            alt={producto.nombre || "Producto"}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-110
            "
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

        ) : (

          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-6xl
            "
          >
            🖥️
          </div>

        )}

      </div>


      {/* ==========================================
          INFORMACIÓN
      ========================================== */}

      <div className="p-5">

        <h2
          className="
            mb-3
            text-xl
            font-bold
            text-texto
          "
        >
          {producto.nombre}
        </h2>


        <p
          className="
            mb-4
            min-h-[65px]
            text-sm
            leading-relaxed
            text-texto-suave
          "
        >
          {producto.descripcion}
        </p>


        {/* ==========================================
            PRECIO
        ========================================== */}

        <h3
          className="
            mb-2
            text-2xl
            font-bold
            text-cyan-400
          "
        >
          {formatoPrecio(producto.precio)}
        </h3>


        {/* ==========================================
            STOCK
        ========================================== */}

        <span
          className="
            mb-4
            block
            text-sm
            font-semibold
            text-texto-tenue
          "
        >
          Stock disponible: {producto.stock}
        </span>


        {/* ==========================================
            CARRITO
            SOLO SE MUESTRA SI EXISTE onAgregar
        ========================================== */}

        {onAgregar && (

          <button
            onClick={() => onAgregar(producto)}
            className="
              w-full
              rounded-lg
              bg-cyan-400
              py-3
              text-base
              font-bold
              text-[#06202e]
              transition
              duration-300
              hover:scale-[1.02]
              hover:bg-cyan-300
            "
          >
            🛒 Agregar al carrito
          </button>

        )}


        {/* ==========================================
            ADMINISTRADOR
            EDITAR + ELIMINAR
        ========================================== */}

        {esAdministrador && (

          <div className="mt-3 flex gap-2">

            {onEditar && (

              <button
                onClick={() => onEditar(producto)}
                className="
                  flex-1
                  rounded-lg
                  bg-blue-500
                  px-3
                  py-2
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-400
                "
              >
                ✏️ Editar
              </button>

            )}


            {onEliminar && (

              <button
                onClick={() => onEliminar(producto)}
                className="
                  flex-1
                  rounded-lg
                  bg-red-500
                  px-3
                  py-2
                  font-bold
                  text-white
                  transition
                  hover:bg-red-400
                "
              >
                🗑️ Eliminar
              </button>

            )}

          </div>

        )}


        {/* ==========================================
            EMPLEADO
            SOLO EDITAR
        ========================================== */}

        {esEmpleado && (

          <div className="mt-3">

            {onEditar && (

              <button
                onClick={() => onEditar(producto)}
                className="
                  w-full
                  rounded-lg
                  bg-blue-500
                  px-3
                  py-2
                  font-bold
                  text-white
                  transition
                  hover:bg-blue-400
                "
              >
                ✏️ Editar producto
              </button>

            )}

          </div>

        )}

      </div>

    </div>

  );

}


export default ProductCard;