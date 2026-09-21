import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerSesion
} from "../Services/AuthService";

import API_URL from "../Services/api";


// =====================================================
// AYUDANTES DE CONTRATO (FastAPI)
// =====================================================

const capitalizar = (texto) => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};


// Mapea un pedido de FastAPI al formato que usa la vista:
// - id            (en vez de _id)
// - createdAt     (desde fecha)
// - productos     (desde detalles[], con nombre/cantidad/subtotal)
// - estado        (Capitalize)

const mapearPedido = (pedido) => {

  const productos =
    (pedido.detalles || []).map(
      (detalle) => ({
        nombre:
          detalle.producto?.nombre ||
          detalle.nombre ||
          "Producto",

        cantidad:
          detalle.cantidad ?? 0,

        subtotal:
          detalle.subtotal ?? 0,

        id:
          detalle.id
      })
    );

  return {
    id: pedido.id,
    total: pedido.total,
    estado: capitalizar(pedido.estado),
    createdAt: pedido.fecha || pedido.createdAt,
    productos
  };

};


function Pedidos() {

  const [pedidos, setPedidos] = useState([]);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();


  // =====================================================
  // OBTENER PEDIDOS
  // =====================================================

  const obtenerPedidos = async () => {

    try {

      setCargando(true);

      setError("");


      const sesion = obtenerSesion();

      if (!sesion) {

        navigate("/");

        return;

      }


      const token = sesion.token;


      if (!token) {

        setError(
          "La sesión ha expirado. Inicia sesión nuevamente."
        );

        return;

      }


      const respuesta = await fetch(
        `${API_URL}/pedidos/mis-pedidos`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudieron obtener los pedidos"
        );

      }


      setPedidos(
        datos.map(mapearPedido)
      );


    } catch (error) {

      console.error(
        "Error obteniendo pedidos:",
        error
      );

      setError(error.message);


    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    obtenerPedidos();

  }, []);


  // =====================================================
  // CANCELAR PEDIDO
  // =====================================================

  const cancelarPedido = async (id) => {

    const confirmar = window.confirm(
      "¿Estás seguro de cancelar este pedido?"
    );


    if (!confirmar) {
      return;
    }


    try {

      const sesion = obtenerSesion();

      if (!sesion?.token) {

        alert(
          "Tu sesión ha expirado."
        );

        return;

      }


      const respuesta = await fetch(
        `${API_URL}/pedidos/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${sesion.token}`
          }
        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudo cancelar el pedido"
        );

      }


      alert(
        "Pedido cancelado correctamente"
      );


      obtenerPedidos();


    } catch (error) {

      console.error(
        "Error cancelando pedido:",
        error
      );

      alert(error.message);

    }

  };


  // =====================================================
  // FORMATO PRECIO
  // =====================================================

  const formatoPrecio = (precio) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }
    ).format(precio);

  };


  // =====================================================
  // COLOR DEL ESTADO
  // =====================================================

  const obtenerColorEstado = (estado) => {

    switch (estado) {

      case "Pendiente":
        return "bg-yellow-500/20 text-yellow-400";

      case "Procesando":
        return "bg-blue-500/20 text-blue-400";

      case "Enviado":
        return "bg-purple-500/20 text-purple-400";

      case "Entregado":
        return "bg-green-500/20 text-green-400";

      case "Cancelado":
        return "bg-red-500/20 text-red-400";

      default:
        return "bg-gray-500/20 text-gray-400";

    }

  };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {

    return (

      <section
        className="
          min-h-[70vh]
          flex
          items-center
          justify-center
        "
      >

        <p className="text-xl text-white">
          Cargando tus pedidos...
        </p>

      </section>

    );

  }


  return (

    <section
      className="
        mx-auto
        my-[60px]
        w-[90%]
        max-w-[1200px]
      "
    >

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div
        className="
          mb-10
          border-b
          border-gray-700
          pb-6
        "
      >

        <p
          className="
            mb-2
            text-sm
            font-semibold
            uppercase
            tracking-widest
            text-cyan-400
          "
        >
          Mi cuenta
        </p>


        <h1
          className="
            text-4xl
            font-bold
            text-white
          "
        >
          📦 Mis Pedidos
        </h1>


        <p className="mt-2 text-gray-400">

          Consulta tus pedidos y revisa el estado
          de cada compra.

        </p>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-500/40
            bg-red-500/10
            p-4
            text-red-400
          "
        >

          {error}

        </div>

      )}


      {/* =================================================
          SIN PEDIDOS
      ================================================= */}

      {!error && pedidos.length === 0 && (

        <div
          className="
            rounded-2xl
            border
            border-gray-700
            bg-[#111827]
            p-12
            text-center
          "
        >

          <p className="text-6xl">
            📦
          </p>


          <h2
            className="
              mt-5
              text-2xl
              font-bold
              text-white
            "
          >
            No tienes pedidos todavía
          </h2>


          <p
            className="
              mt-2
              text-gray-400
            "
          >
            Cuando realices una compra,
            aparecerá aquí.
          </p>


          <button
            onClick={() =>
              navigate("/productos")
            }
            className="
              mt-6
              rounded-lg
              bg-cyan-400
              px-6
              py-3
              font-bold
              text-gray-900
              transition
              hover:bg-cyan-300
            "
          >
            Ver productos
          </button>

        </div>

      )}


      {/* =================================================
          PEDIDOS
      ================================================= */}

      <div className="space-y-6">

        {pedidos.map((pedido, index) => (

          <article
            key={pedido.id}
            className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-700
              bg-[#111827]
              shadow-xl
            "
          >

            {/* CABECERA */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-gray-700
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-400
                  "
                >
                  Pedido #{String(index + 1).padStart(3, "0")}
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  {new Date(
                    pedido.createdAt
                  ).toLocaleDateString(
                    "es-CO"
                  )}
                </p>

              </div>


              <span
                className={`
                  w-fit
                  rounded-full
                  px-4
                  py-2
                  text-sm
                  font-bold
                  ${obtenerColorEstado(
                    pedido.estado
                  )}
                `}
              >
                {pedido.estado}
              </span>

            </div>


            {/* PRODUCTOS */}

            <div className="space-y-3 p-5">

              {pedido.productos.map(
                (producto, productoIndex) => (

                  <div
                    key={
                      producto.id ||
                      productoIndex
                    }
                    className="
                      flex
                      items-center
                      gap-4
                      rounded-xl
                      bg-[#1b2740]
                      p-4
                    "
                  >

                    <div className="flex-1">

                      <h3
                        className="
                          font-bold
                          text-white
                        "
                      >
                        {producto.nombre}
                      </h3>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-400
                        "
                      >
                        Cantidad:
                        {" "}
                        {producto.cantidad}
                      </p>

                    </div>


                    <p
                      className="
                        font-semibold
                        text-cyan-400
                      "
                    >
                      {formatoPrecio(
                        producto.subtotal
                      )}
                    </p>

                  </div>

                )
              )}

            </div>


            {/* TOTAL Y ACCIONES */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-t
                border-gray-700
                p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <span
                  className="
                    text-gray-400
                  "
                >
                  Total:
                </span>


                <span
                  className="
                    ml-3
                    text-2xl
                    font-bold
                    text-cyan-400
                  "
                >
                  {formatoPrecio(
                    pedido.total
                  )}
                </span>

              </div>


              {/* SOLO PENDIENTE Y PROCESANDO */}

              {(pedido.estado === "Pendiente" ||
                pedido.estado === "Procesando") && (

                <button
                  onClick={() =>
                    cancelarPedido(
                      pedido.id
                    )
                  }
                  className="
                    rounded-lg
                    border
                    border-red-500
                    px-5
                    py-3
                    font-bold
                    text-red-400
                    transition
                    hover:bg-red-500/10
                  "
                >
                  Cancelar pedido
                </button>

              )}

            </div>

          </article>

        ))}

      </div>

    </section>

  );

}


export default Pedidos;