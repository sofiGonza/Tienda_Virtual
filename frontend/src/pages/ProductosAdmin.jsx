import { useEffect, useState } from "react";

import {
  obtenerSesion
} from "../Services/AuthService";
import API_URL from "../Services/api";


const API = API_URL;


function ProductosAdmin({
  esAdministrador
}) {

  const [productos, setProductos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [productoEditar, setProductoEditar] =
    useState(null);


  const [formulario, setFormulario] =
    useState({

      nombre: "",

      imagen: "",

      descripcion: "",

      precio: "",

      stock: ""

    });


  // =====================================================
  // OBTENER PRODUCTOS
  // =====================================================

  const obtenerProductos = async () => {

    try {

      setCargando(true);

      setError("");


      const sesion =
        obtenerSesion();


      const respuesta =
        await fetch(
          `${API}/productos/admin`,
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
          "Error obteniendo productos"
        );

      }


      setProductos(datos);


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

    obtenerProductos();

  }, []);


  // =====================================================
  // CAMBIAR INPUT
  // =====================================================

  const manejarCambio = (e) => {

    setFormulario({

      ...formulario,

      [e.target.name]:
        e.target.value

    });

  };


  // =====================================================
  // ABRIR CREAR
  // =====================================================

  const abrirCrear = () => {

    setProductoEditar(null);

    setFormulario({

      nombre: "",

      imagen: "",

      descripcion: "",

      precio: "",

      stock: ""

    });

    setMostrarFormulario(true);

  };


  // =====================================================
  // ABRIR EDITAR
  // =====================================================

  const abrirEditar = (producto) => {

    setProductoEditar(producto);

    setFormulario({

      nombre:
        producto.nombre,

      imagen:
        producto.imagen || "",

      descripcion:
        producto.descripcion,

      precio:
        producto.precio,

      stock:
        producto.stock

    });

    setMostrarFormulario(true);

  };


  // =====================================================
  // GUARDAR
  // =====================================================

  const guardarProducto = async (e) => {

    e.preventDefault();


    try {

      const sesion =
        obtenerSesion();


      const url =
        productoEditar

          ? `${API}/productos/${productoEditar._id}`

          : `${API}/productos`;


      const metodo =
        productoEditar
          ? "PUT"
          : "POST";


      const respuesta =
        await fetch(
          url,
          {

            method: metodo,

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${sesion.token}`

            },

            body:
              JSON.stringify({

                ...formulario,

                precio:
                  Number(formulario.precio),

                stock:
                  Number(formulario.stock)

              })

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.mensaje ||
          "No se pudo guardar el producto"
        );

      }


      alert(
        productoEditar
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );


      setMostrarFormulario(false);

      setProductoEditar(null);

      obtenerProductos();


    } catch (error) {

      alert(
        error.message
      );

    }

  };


  // =====================================================
  // ELIMINAR
  // SOLO ADMINISTRADOR
  // =====================================================

  const eliminarProducto = async (id) => {

    if (!esAdministrador) {
      return;
    }


    const confirmar =
      window.confirm(
        "¿Estás seguro de eliminar este producto?"
      );


    if (!confirmar) {
      return;
    }


    try {

      const sesion =
        obtenerSesion();


      const respuesta =
        await fetch(
          `${API}/productos/${id}`,
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
          "No se pudo eliminar"
        );

      }


      alert(
        "Producto eliminado correctamente"
      );


      obtenerProductos();


    } catch (error) {

      alert(
        error.message
      );

    }

  };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {

    return (

      <p className="text-white">
        Cargando productos...
      </p>

    );

  }


  return (

    <div>

      {/* ===============================================
          ENCABEZADO
      =============================================== */}

      <div
        className="
          mb-8
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <h1
            className="
              text-3xl
              font-bold
              text-white
            "
          >
            🛒 Productos
          </h1>


          <p
            className="
              mt-2
              text-gray-400
            "
          >
            Consulta y administra los productos.
          </p>

        </div>


        <button
          onClick={abrirCrear}
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
          + Agregar producto
        </button>

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
          FORMULARIO
      =============================================== */}

      {mostrarFormulario && (

        <form
          onSubmit={guardarProducto}
          className="
            mb-8
            rounded-2xl
            border
            border-gray-700
            bg-[#1b2740e0]
            p-6
          "
        >

          <h2
            className="
              mb-6
              text-2xl
              font-bold
              text-cyan-400
            "
          >
            {productoEditar
              ? "Editar producto"
              : "Agregar producto"}
          </h2>


          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >

            <input
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Nombre"
              required
              className="
                rounded-lg
                bg-gray-800
                p-3
                text-white
                outline-none
                focus:ring-2
                focus:ring-cyan-400
              "
            />


            <input
              name="imagen"
              value={formulario.imagen}
              onChange={manejarCambio}
              placeholder="URL de imagen"
              className="
                rounded-lg
                bg-gray-800
                p-3
                text-white
                outline-none
                focus:ring-2
                focus:ring-cyan-400
              "
            />


            <input
              name="precio"
              type="number"
              min="0"
              value={formulario.precio}
              onChange={manejarCambio}
              placeholder="Precio"
              required
              className="
                rounded-lg
                bg-gray-800
                p-3
                text-white
              "
            />


            <input
              name="stock"
              type="number"
              min="0"
              value={formulario.stock}
              onChange={manejarCambio}
              placeholder="Stock"
              required
              className="
                rounded-lg
                bg-gray-800
                p-3
                text-white
              "
            />

          </div>


          <textarea
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
            placeholder="Descripción"
            required
            rows="4"
            className="
              mt-4
              w-full
              rounded-lg
              bg-gray-800
              p-3
              text-white
            "
          />


          <div
            className="
              mt-5
              flex
              gap-3
            "
          >

            <button
              type="submit"
              className="
                rounded-lg
                bg-green-500
                px-5
                py-3
                font-bold
                text-white
                hover:bg-green-400
              "
            >
              Guardar
            </button>


            <button
              type="button"
              onClick={() =>
                setMostrarFormulario(false)
              }
              className="
                rounded-lg
                bg-gray-700
                px-5
                py-3
                font-bold
                text-white
                hover:bg-gray-600
              "
            >
              Cancelar
            </button>

          </div>

        </form>

      )}


      {/* ===============================================
          LISTADO
      =============================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >

        {productos.map(
          (producto) => (

            <article
              key={producto._id}
              className="
                overflow-hidden
                rounded-2xl
                border
                border-gray-700
                bg-[#1b2740e0]
                shadow-xl
              "
            >

              <div
                className="
                  h-[220px]
                  bg-gray-800
                "
              >

                {producto.imagen ? (

                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-6xl
                    "
                  >
                    🖥️
                  </div>

                )}

              </div>


              <div className="p-5">

                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  {producto.nombre}
                </h2>


                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  {producto.descripcion}
                </p>


                <p
                  className="
                    mt-4
                    text-xl
                    font-bold
                    text-cyan-400
                  "
                >
                  $
                  {Number(
                    producto.precio
                  ).toLocaleString("es-CO")}
                </p>


                <p
                  className="
                    mt-2
                    text-gray-300
                  "
                >
                  Stock:
                  {" "}
                  <span className="font-bold">
                    {producto.stock}
                  </span>
                </p>


                <p
                  className={`
                    mt-2
                    font-semibold
                    ${
                      producto.estado
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  `}
                >
                  {producto.estado
                    ? "Activo"
                    : "Inactivo"}
                </p>


                {/* ACCIONES */}

                <div
                  className="
                    mt-5
                    flex
                    gap-2
                  "
                >

                  <button
                    onClick={() =>
                      abrirEditar(producto)
                    }
                    className="
                      flex-1
                      rounded-lg
                      bg-blue-500
                      px-3
                      py-2
                      font-bold
                      text-white
                      hover:bg-blue-400
                    "
                  >
                    ✏️ Editar
                  </button>


                  {esAdministrador && (

                    <button
                      onClick={() =>
                        eliminarProducto(
                          producto._id
                        )
                      }
                      className="
                        flex-1
                        rounded-lg
                        bg-red-500
                        px-3
                        py-2
                        font-bold
                        text-white
                        hover:bg-red-400
                      "
                    >
                      🗑️ Eliminar
                    </button>

                  )}

                </div>

              </div>

            </article>

          )
        )}

      </div>

    </div>

  );

}


export default ProductosAdmin;