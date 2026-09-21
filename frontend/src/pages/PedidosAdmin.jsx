import { useEffect, useState } from "react";

import {
  obtenerSesion
} from "../Services/AuthService";
import API_URL from "../Services/api";


const API = API_URL;


function PedidosAdmin({
  esAdministrador
}) {

  const [pedidos, setPedidos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // OBTENER PEDIDOS
  // =====================================================

  const obtenerPedidos = async () => {

    try {

      setCargando(true);

      const sesion =
        obtenerSesion();


      const respuesta =
        await fetch(
          `${API}/pedidos`,
          {

            headers: {

              Authorization:
                `Bearer ${sesion.token}`

            }

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.mensaje ||
          "No se pudieron obtener los pedidos"
        );

      }


      setPedidos(datos);


    } catch (error) {

      console.error(error);

      setError(
        error.message
      );

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    obtenerPedidos();

  }, []);


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  const cambiarEstado = async (
    id,
    estado
  ) => {

    try {

      const sesion =
        obtenerSesion();


      const respuesta =
        await fetch(
          `${API}/pedidos/${id}/estado`,
          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${sesion.token}`

            },

            body:
              JSON.stringify({
                estado
              })

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.mensaje ||
          "No se pudo cambiar el estado"
        );

      }


      alert(
        "Estado actualizado correctamente"
      );


      obtenerPedidos();


    } catch (error) {

      alert(
        error.message
      );

    }

  };


  // =====================================================
  // CANCELAR
  // SOLO ADMINISTRADOR
  // =====================================================

  const cancelarPedido = async (
    id
  ) => {

    const confirmar =
      window.confirm(
        "¿Deseas cancelar este pedido?"
      );


    if (!confirmar) {
      return;
    }


    try {

      const sesion =
        obtenerSesion();


      const respuesta =
        await fetch(
          `${API}/pedidos/${id}`,
          {

            method: "DELETE",

            headers: {

              Authorization:
                `Bearer ${sesion.token}`

            }

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.mensaje ||
          "No se pudo cancelar"
        );

      }


      alert(
        "Pedido cancelado"
      );


      obtenerPedidos();


    } catch (error) {

      alert(
        error.message
      );

    }

  };


  // =====================================================
  // SIGUIENTE ESTADO
  // =====================================================

  const obtenerSiguienteEstado = (
    estado
  ) => {

    const siguientes = {

      Pendiente:
        "Procesando",

      Procesando:
        "Enviado",

      Enviado:
        "Entregado"

    };


    return siguientes[estado];

  };


  // =====================================================
  // COLOR
  // =====================================================

  const colorEstado = (
    estado
  ) => {

    const colores = {

      Pendiente:
        "bg-yellow-500/20 text-yellow-400",

      Procesando:
        "bg-blue-500/20 text-blue-400",

      Enviado:
        "bg-purple-500/20 text-purple-400",

      Entregado:
        "bg-green-500/20 text-green-400",

      Cancelado:
        "bg-red-500/20 text-red-400"

    };


    return (
      colores[estado] ||
      "bg-gray-500/20 text-gray-400"
    );

  };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {

    return (

      <p className="text-white">
        Cargando pedidos...
      </p>

    );

  }


  return (

    <div>

      {/* ===============================================
          ENCABEZADO
      =============================================== */}

      <div className="mb-8">

        <h1
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          📦 Pedidos
        </h1>


        <p
          className="
            mt-2
            text-gray-400
          "
        >
          Consulta y gestiona los pedidos realizados.
        </p>

      </div>


      {/* ERROR */}

      {error && (

        <div
          className="
            mb-6
            rounded-lg
            bg-red-500/10
            p-4
            text-red-400
          "
        >
          {error}
        </div>

      )}


      {/* ===============================================
          PEDIDOS
      =============================================== */}

      <div className="space-y-6">

        {pedidos.length === 0 ? (

          <div
            className="
              rounded-2xl
              border
              border-gray-700
              bg-[#1b2740e0]
              p-10
              text-center
              text-gray-400
            "
          >
            No hay pedidos registrados.
          </div>

        ) : (

          pedidos.map(
            (pedido, index) => (

              <article
                key={pedido._id}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-700
                  bg-[#1b2740e0]
                  shadow-xl
                "
              >

                {/* =====================================
                    CABECERA
                ===================================== */}

                <div
                  className="
                    border-b
                    border-gray-700
                    p-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          text-gray-400
                        "
                      >
                        Pedido #
                        {String(
                          index + 1
                        ).padStart(3, "0")}
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
                        rounded-full
                        px-4
                        py-2
                        text-sm
                        font-bold
                        ${colorEstado(
                          pedido.estado
                        )}
                      `}
                    >
                      {pedido.estado}
                    </span>

                  </div>

                </div>


                {/* =====================================
                    CLIENTE
                ===================================== */}

                <div
                  className="
                    border-b
                    border-gray-700
                    p-6
                  "
                >

                  <h2
                    className="
                      mb-4
                      text-xl
                      font-bold
                      text-cyan-400
                    "
                  >
                    👤 Cliente
                  </h2>


                  {pedido.usuario ? (

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        md:grid-cols-2
                      "
                    >

                      <p className="text-gray-300">

                        <span className="text-gray-500">
                          Nombre:
                        </span>{" "}

                        {pedido.usuario.nombre}{" "}
                        {pedido.usuario.apellido}

                      </p>


                      <p className="text-gray-300">

                        <span className="text-gray-500">
                          Correo:
                        </span>{" "}

                        {pedido.usuario.correo}

                      </p>


                      <p className="text-gray-300">

                        <span className="text-gray-500">
                          Teléfono:
                        </span>{" "}

                        {pedido.usuario.telefono}

                      </p>

                    </div>

                  ) : (

                    <p className="text-red-400">
                      Cliente no disponible
                    </p>

                  )}

                </div>


                {/* =====================================
                    PRODUCTOS
                ===================================== */}

                <div className="p-6">

                  <h2
                    className="
                      mb-4
                      text-xl
                      font-bold
                      text-cyan-400
                    "
                  >
                    🛒 Productos
                  </h2>


                  <div className="space-y-3">

                    {pedido.productos.map(
                      (producto, productoIndex) => (

                        <div
                          key={
                            producto._id ||
                            productoIndex
                          }
                          className="
                            flex
                            flex-col
                            gap-3
                            rounded-xl
                            bg-gray-800
                            p-4
                            md:flex-row
                            md:items-center
                            md:justify-between
                          "
                        >

                          <div>

                            <p
                              className="
                                font-bold
                                text-white
                              "
                            >
                              {producto.nombre}
                            </p>


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
                              font-bold
                              text-cyan-400
                            "
                          >
                            $
                            {Number(
                              producto.subtotal
                            ).toLocaleString(
                              "es-CO"
                            )}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* =====================================
                    TOTAL
                ===================================== */}

                <div
                  className="
                    border-t
                    border-gray-700
                    p-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "
                  >

                    <p
                      className="
                        text-2xl
                        font-bold
                        text-white
                      "
                    >
                      Total:
                      {" "}
                      <span
                        className="
                          text-cyan-400
                        "
                      >
                        $
                        {Number(
                          pedido.total
                        ).toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </p>


                    {/* =================================
                        CAMBIAR ESTADO
                    ================================= */}

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                      "
                    >

                      {obtenerSiguienteEstado(
                        pedido.estado
                      ) && (

                        <button
                          onClick={() =>
                            cambiarEstado(
                              pedido._id,
                              obtenerSiguienteEstado(
                                pedido.estado
                              )
                            )
                          }
                          className="
                            rounded-lg
                            bg-cyan-400
                            px-5
                            py-3
                            font-bold
                            text-gray-900
                            transition
                            hover:bg-cyan-300
                          "
                        >
                          →
                          {" "}
                          {obtenerSiguienteEstado(
                            pedido.estado
                          )}
                        </button>

                      )}


                      {/* CANCELAR SOLO ADMIN */}

                      {esAdministrador &&
                        (
                          pedido.estado ===
                            "Pendiente" ||
                          pedido.estado ===
                            "Procesando"
                        ) && (

                        <button
                          onClick={() =>
                            cancelarPedido(
                              pedido._id
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
                            hover:bg-red-500/10
                          "
                        >
                          🗑️ Cancelar
                        </button>

                      )}

                    </div>

                  </div>

                </div>

              </article>

            )
          )

        )}

      </div>

    </div>

  );

}


export default PedidosAdmin;