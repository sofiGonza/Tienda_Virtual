
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import {
  obtenerSesion
} from "../Services/AuthService";
import API_URL from "../Services/api";
import { obtenerCuenta, guardarCuenta } from "../Services/usuarios";

import laptop from "../img/laptop.jpg";
import smartphone from "../img/smartphone.jpg";
import audifonos from "../img/audifonos.jpg";
import setup from "../img/setup.jpg";
import reloj from "../img/reloj.png";
import ordenador from "../img/ordenador.png";
import mouse from "../img/mouse1.jfif";
import teclado from "../img/teclado.webp";


function Productos() {

  const navigate = useNavigate();


  // =====================================================
  // PRODUCTOS
  // =====================================================

  const [productos, setProductos] = useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  // FILTRO POR CATEGORÍA
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");


  // =====================================================
  // CARRITO
  // =====================================================

  const [carrito, setCarrito] =
    useState([]);

  const [mostrarCarrito, setMostrarCarrito] =
    useState(false);


  // =====================================================
  // OBTENER PRODUCTOS DESDE FASTAPI
  // =====================================================

  useEffect(() => {

    const obtenerProductos = async () => {

      try {

        setCargando(true);
        setError("");


        const respuesta = await fetch(
          `${API_URL}/productos`
        );


        if (!respuesta.ok) {

          throw new Error(
            "No se pudieron obtener los productos"
          );

        }


        const datos =
          await respuesta.json();


        const imagenes = [
          laptop,
          smartphone,
          audifonos,
          setup,
          reloj,
          ordenador,
          mouse,
          teclado
        ];


        const productosConImagen =
          datos.map(
            (producto, index) => ({

              ...producto,

              imagen:
                producto.imagen ||
                imagenes[
                  index % imagenes.length
                ]

            })
          );


        setProductos(
          productosConImagen
        );

        // Derivar categorías únicas para el filtro
        const unicas = [
          ...new Set(
            datos
              .map((p) => p.categoria)
              .filter(Boolean)
          ),
        ];
        setCategorias(unicas);


      } catch (error) {

        console.error(
          "Error obteniendo productos:",
          error
        );


        setError(
          "No fue posible conectar con el servidor."
        );


      } finally {

        setCargando(false);

      }

    };


    obtenerProductos();

  }, []);


  // =====================================================
  // AGREGAR AL CARRITO
  // =====================================================

  const agregarAlCarrito = (producto) => {

    if (
      producto.stock === undefined ||
      producto.stock <= 0
    ) {

      alert(
        "Este producto no tiene stock disponible."
      );

      return;

    }


    setCarrito(
      (carritoAnterior) => {

        const productoExistente =
          carritoAnterior.find(
            (item) =>
              item.id === producto.id
          );


        if (productoExistente) {

          if (
            productoExistente.cantidad >=
            producto.stock
          ) {

            alert(
              `Solo hay ${producto.stock} unidades disponibles de este producto.`
            );

            return carritoAnterior;

          }


          return carritoAnterior.map(
            (item) =>

              item.id === producto.id

                ? {
                    ...item,

                    cantidad:
                      item.cantidad + 1
                  }

                : item
          );

        }


        return [

          ...carritoAnterior,

          {
            ...producto,
            cantidad: 1
          }

        ];

      }
    );

  };


  // =====================================================
  // AUMENTAR CANTIDAD
  // =====================================================

  const aumentarCantidad = (id) => {

    setCarrito(
      (carritoAnterior) =>

        carritoAnterior.map(
          (item) => {

            if (
              item.id !== id
            ) {

              return item;

            }


            if (
              item.cantidad >=
              item.stock
            ) {

              alert(
                `Solo hay ${item.stock} unidades disponibles de este producto.`
              );

              return item;

            }


            return {

              ...item,

              cantidad:
                item.cantidad + 1

            };

          }
        )
    );

  };


  // =====================================================
  // DISMINUIR CANTIDAD
  // =====================================================

  const disminuirCantidad = (id) => {

    setCarrito(
      (carritoAnterior) =>

        carritoAnterior

          .map(
            (item) =>

              item.id === id

                ? {
                    ...item,

                    cantidad:
                      item.cantidad - 1
                  }

                : item
          )

          .filter(
            (item) =>
              item.cantidad > 0
          )
    );

  };


  // =====================================================
  // ELIMINAR DEL CARRITO
  // =====================================================

  const eliminarProducto = (id) => {

    setCarrito(
      (carritoAnterior) =>

        carritoAnterior.filter(
          (item) =>
            item.id !== id
        )
    );

  };


  // =====================================================
  // VACIAR CARRITO
  // =====================================================

  const vaciarCarrito = () => {

    setCarrito([]);

  };


  // =====================================================
  // CANTIDAD TOTAL
  // =====================================================

  const cantidadTotal =
    carrito.reduce(
      (total, producto) =>

        total +
        producto.cantidad,

      0
    );


  // =====================================================
  // PRECIO TOTAL
  // =====================================================

  const precioTotal =
    carrito.reduce(
      (total, producto) =>

        total +
        Number(producto.precio) *
        producto.cantidad,

      0
    );


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
  // REALIZAR PEDIDO
  // =====================================================

  const realizarPedido = async () => {

    try {

      // -------------------------------------------------
      // VERIFICAR CARRITO
      // -------------------------------------------------

      if (carrito.length === 0) {

        alert(
          "Tu carrito está vacío."
        );

        return;

      }


      // -------------------------------------------------
      // OBTENER SESIÓN
      // -------------------------------------------------

      const sesion =
        obtenerSesion();


      console.log(
        "Sesión obtenida:",
        sesion
      );


      // -------------------------------------------------
      // VERIFICAR SESIÓN
      // -------------------------------------------------

      if (!sesion) {

        alert(
          "Debes iniciar sesión para realizar un pedido."
        );

        return;

      }


      // -------------------------------------------------
      // OBTENER TOKEN
      // -------------------------------------------------

      const token =
        sesion.token;


      if (!token) {

        alert(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;

      }


      // -------------------------------------------------
      // OBTENER USUARIO
      // -------------------------------------------------

      const usuario =
        sesion.usuario || sesion;


      console.log(
        "Usuario:",
        usuario
      );


      // -------------------------------------------------
      // VERIFICAR ROL
      // -------------------------------------------------

      if (
        usuario &&
        usuario.rol &&
        usuario.rol !== "cliente"
      ) {

        alert(
          "Solo los clientes pueden realizar pedidos."
        );

        return;

      }


      // -------------------------------------------------
      // VERIFICAR CUENTA BANCARIA
      // -------------------------------------------------

      let cuenta = null;
      try {
        cuenta = await obtenerCuenta();
      } catch {
        cuenta = null;
      }

      if (!cuenta || !cuenta.cuenta_bancaria) {
        const cuentaBancaria = window.prompt("Para realizar tu pedido necesitas vincular una cuenta bancaria.\n\nNúmero de cuenta:");
        if (!cuentaBancaria || !cuentaBancaria.trim()) {
          alert("Debes registrar tu cuenta bancaria para continuar.");
          return;
        }
        const banco = window.prompt("Banco:");
        if (!banco || !banco.trim()) {
          alert("Debes indicar el banco.");
          return;
        }
        const titular = window.prompt("Titular de la cuenta:");
        if (!titular || !titular.trim()) {
          alert("Debes indicar el titular de la cuenta.");
          return;
        }
        try {
          await guardarCuenta({
            cuenta_bancaria: cuentaBancaria.trim(),
            banco: banco.trim(),
            titular_cuenta: titular.trim(),
          });
        } catch (e) {
          alert("No se pudo guardar la cuenta bancaria: " + (e.message || "error"));
          return;
        }
      }


      // -------------------------------------------------
      // PREPARAR PRODUCTOS
      // -------------------------------------------------
      //
      // FastAPI espera:
      //
      // {
      //   "productos": [
      //     {
      //       "producto_id": 1,
      //       "cantidad": 2
      //     }
      //   ]
      // }
      //
      // El usuario se obtiene mediante el JWT.
      // -------------------------------------------------

      const productosPedido =
        carrito.map(
          (producto) => ({

            producto_id:
              producto.id,

            cantidad:
              Number(producto.cantidad)

          })
        );


      console.log(
        "Productos enviados:",
        productosPedido
      );


      // -------------------------------------------------
      // ENVIAR PEDIDO A FASTAPI
      // -------------------------------------------------

      const respuesta =
        await fetch(
          `${API_URL}/pedidos`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify({

                productos:
                  productosPedido

              })

          }
        );


      const datos =
        await respuesta.json();


      console.log(
        "Respuesta pedidos:",
        datos
      );


      // -------------------------------------------------
      // TOKEN INVÁLIDO
      // -------------------------------------------------

      if (
        respuesta.status === 401
      ) {

        alert(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );

        return;

      }


      // -------------------------------------------------
      // ERROR
      // -------------------------------------------------

      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudo crear el pedido"
        );

      }


      // -------------------------------------------------
      // PEDIDO CREADO
      // -------------------------------------------------

      console.log(
        "Pedido creado correctamente:",
        datos
      );


      // -------------------------------------------------
      // ACTUALIZAR STOCK LOCAL
      // -------------------------------------------------

      setProductos(
        (productosAnteriores) =>

          productosAnteriores.map(
            (producto) => {

              const itemCarrito =
                carrito.find(
                  (item) =>
                    item.id === producto.id
                );


              if (!itemCarrito) {

                return producto;

              }


              return {

                ...producto,

                stock:
                  producto.stock -
                  itemCarrito.cantidad

              };

            }
          )
      );


      // -------------------------------------------------
      // LIMPIAR CARRITO
      // -------------------------------------------------

      setCarrito([]);


      // -------------------------------------------------
      // CERRAR CARRITO
      // -------------------------------------------------

      setMostrarCarrito(false);


      // -------------------------------------------------
      // MENSAJE
      // -------------------------------------------------

      alert(
        "¡Pedido realizado correctamente!"
      );


      // -------------------------------------------------
      // IR A PEDIDOS
      // -------------------------------------------------

      navigate("/pedido");


    } catch (error) {

      console.error(
        "Error realizando pedido:",
        error
      );


      alert(
        error.message ||
        "No se pudo realizar el pedido."
      );

    }

  };


  // =====================================================
  // JSX
  // =====================================================

  const productosFiltrados =
    categoriaActiva === "Todas"
      ? productos
      : productos.filter(
          (p) => p.categoria === categoriaActiva
        );

  return (

    <section
      className="
        relative
        w-[90%]
        max-w-[1400px]
        mx-auto
        my-[60px]
      "
    >

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div
        className="
          mb-10
          flex
          items-center
          justify-between
          border-b
          border-gray-700
          pb-5
        "
      >

        <div>

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
            Nuestra tienda
          </p>


          <h1
            className="
              text-4xl
              font-bold
              text-white
            "
          >
            Nuestros Productos
          </h1>


          <p
            className="
              mt-2
              text-gray-400
            "
          >
            Descubre la mejor tecnología
            para tu hogar, estudio o trabajo.
          </p>

        </div>

        {/* =================================================
            FILTRO POR CATEGORÍA
        ================================================= */}

        {categorias.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoriaActiva("Todas")}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                categoriaActiva === "Todas"
                  ? "bg-cyan-400 text-gray-900"
                  : "border border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaActiva(cat)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  categoriaActiva === cat
                    ? "bg-cyan-400 text-gray-900"
                    : "border border-gray-600 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* =================================================
            BOTÓN CARRITO
        ================================================= */}

        <button
          type="button"

          onClick={() =>
            setMostrarCarrito(true)
          }

          className="
            relative
            flex
            items-center
            justify-center
            rounded-xl
            border
            border-gray-600
            bg-[#1b2740e0]
            px-5
            py-4
            text-3xl
            transition
            duration-300
            hover:border-cyan-400
            hover:bg-[#243452]
            hover:scale-105
          "
        >

          🛒


          {cantidadTotal > 0 && (

            <span
              className="
                absolute
                -right-2
                -top-2
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-cyan-400
                text-xs
                font-bold
                text-gray-900
              "
            >
              {cantidadTotal}
            </span>

          )}

        </button>

      </div>


      {/* =================================================
          CARGANDO
      ================================================= */}

      {cargando && (

        <p
          className="
            text-center
            text-xl
            text-white
          "
        >
          Cargando productos...
        </p>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <p
          className="
            text-center
            text-xl
            text-red-400
          "
        >
          {error}
        </p>

      )}


      {/* =================================================
          SIN PRODUCTOS
      ================================================= */}

      {!cargando &&
        !error &&
        productos.length === 0 && (
          <p
            className="
              text-center
              text-gray-400
            "
          >
            No hay productos disponibles.
          </p>

        )}


      {/* =================================================
          PRODUCTOS
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-[25px]
          text-left
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >

        {productosFiltrados.map(
          (producto) => (

            <ProductCard

              key={
                producto.id
              }

              producto={
                producto
              }

              formatoPrecio={
                formatoPrecio
              }

              onAgregar={
                agregarAlCarrito
              }

            />

          )
        )}

      </div>


      {/* =================================================
          MODAL CARRITO
      ================================================= */}

      {mostrarCarrito && (

        <div
          className="
            fixed
            inset-0
            z-[3000]
            flex
            items-center
            justify-center
            bg-black/70
            p-4
          "

          onClick={() =>
            setMostrarCarrito(false)
          }
        >

          <div
            className="
              relative
              w-full
              max-w-2xl
              max-h-[85vh]
              overflow-y-auto
              rounded-2xl
              bg-[#111827]
              p-6
              shadow-2xl
            "

            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =========================================
                CABECERA
            ========================================= */}

            <div
              className="
                mb-6
                flex
                items-center
                justify-between
                border-b
                border-gray-700
                pb-4
              "
            >

              <h2
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                🛒 Mi carrito
              </h2>


              <button
                type="button"

                onClick={() =>
                  setMostrarCarrito(false)
                }

                className="
                  text-2xl
                  text-gray-400
                  hover:text-cyan-400
                "
              >
                ✕
              </button>

            </div>


            {/* =========================================
                CARRITO VACÍO
            ========================================= */}

            {carrito.length === 0 ? (

              <div
                className="
                  py-12
                  text-center
                "
              >

                <p
                  className="
                    text-5xl
                  "
                >
                  🛒
                </p>


                <p
                  className="
                    mt-4
                    text-lg
                    text-gray-400
                  "
                >
                  Tu carrito está vacío.
                </p>

              </div>

            ) : (

              <>

                {/* =====================================
                    PRODUCTOS
                ===================================== */}

                <div
                  className="
                    space-y-4
                  "
                >

                  {carrito.map(
                    (producto) => (

                      <div
                        key={
                          producto.id
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

                        {/* IMAGEN */}

                        <img
                          src={
                            producto.imagen
                          }

                          alt={
                            producto.nombre
                          }

                          className="
                            h-20
                            w-20
                            rounded-lg
                            object-cover
                          "
                        />


                        {/* INFORMACIÓN */}

                        <div
                          className="
                            flex-1
                          "
                        >

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
                              font-semibold
                              text-cyan-400
                            "
                          >
                            {formatoPrecio(
                              producto.precio
                            )}
                          </p>


                          {/* STOCK */}

                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            Stock disponible:{" "}
                            {producto.stock}
                          </p>

                        </div>


                        {/* CANTIDAD */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <button
                            type="button"

                            onClick={() =>
                              disminuirCantidad(
                                producto.id
                              )
                            }

                            className="
                              h-8
                              w-8
                              rounded-lg
                              bg-gray-700
                              text-white
                              hover:bg-gray-600
                            "
                          >
                            −
                          </button>


                          <span
                            className="
                              min-w-[25px]
                              text-center
                              font-bold
                              text-white
                            "
                          >
                            {producto.cantidad}
                          </span>


                          <button
                            type="button"

                            onClick={() =>
                              aumentarCantidad(
                                producto.id
                              )
                            }

                            className="
                              h-8
                              w-8
                              rounded-lg
                              bg-cyan-400
                              font-bold
                              text-gray-900
                              hover:bg-cyan-300
                            "
                          >
                            +
                          </button>

                        </div>


                        {/* ELIMINAR */}

                        <button
                          type="button"

                          onClick={() =>
                            eliminarProducto(
                              producto.id
                            )
                          }

                          className="
                            text-xl
                            text-red-400
                            hover:text-red-300
                          "

                          title="Eliminar"
                        >
                          🗑️
                        </button>

                      </div>

                    )
                  )}

                </div>


                {/* =====================================
                    TOTAL
                ===================================== */}

                <div
                  className="
                    mt-6
                    border-t
                    border-gray-700
                    pt-5
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      text-lg
                      text-gray-300
                    "
                  >

                    <span>
                      Productos:
                    </span>

                    <span>
                      {cantidadTotal}
                    </span>

                  </div>


                  <div
                    className="
                      mt-2
                      flex
                      justify-between
                      text-2xl
                      font-bold
                    "
                  >

                    <span
                      className="
                        text-white
                      "
                    >
                      Total:
                    </span>


                    <span
                      className="
                        text-cyan-400
                      "
                    >
                      {formatoPrecio(
                        precioTotal
                      )}
                    </span>

                  </div>


                  {/* =================================
                      BOTONES
                  ================================= */}

                  <div
                    className="
                      mt-5
                      flex
                      gap-3
                    "
                  >

                    {/* VACIAR */}

                    <button
                      type="button"

                      onClick={
                        vaciarCarrito
                      }

                      className="
                        flex-1
                        rounded-lg
                        border
                        border-red-500
                        px-4
                        py-3
                        font-bold
                        text-red-400
                        transition
                        hover:bg-red-500/10
                      "
                    >
                      Vaciar carrito
                    </button>


                    {/* REALIZAR PEDIDO */}

                    <button
                      type="button"

                      onClick={
                        realizarPedido
                      }

                      className="
                        flex-1
                        rounded-lg
                        bg-cyan-400
                        px-4
                        py-3
                        font-bold
                        text-gray-900
                        transition
                        hover:bg-cyan-300
                      "
                    >
                      Realizar pedido
                    </button>

                  </div>

                </div>

              </>

            )}

          </div>

        </div>

      )}

    </section>

  );

}


export default Productos;
