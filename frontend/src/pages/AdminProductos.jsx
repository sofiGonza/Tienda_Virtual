import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { obtenerSesion } from "../Services/AuthService";
import API_URL from "../Services/api";

import laptop from "../img/laptop.jpg";
import smartphone from "../img/smartphone.jpg";
import audifonos from "../img/audifonos.jpg";
import setup from "../img/setup.jpg";
import reloj from "../img/reloj.png";
import ordenador from "../img/ordenador.png";
import mouse from "../img/mouse1.jfif";
import teclado from "../img/teclado.webp";

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

function AdminProductos() {
  const navigate = useNavigate();

  // ESTADOS
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [rolUsuario, setRolUsuario] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imagen: ""
  });

  // OBTENER SESIÓN / TOKEN
  const obtenerToken = () => {
    const sesion = obtenerSesion();

    if (
      !sesion ||
      (sesion.rol !== "administrador" && sesion.rol !== "empleado")
    ) {
      navigate("/");
      return null;
    }

    setRolUsuario(sesion.rol);
    return sesion.token;
  };

  // VERIFICAR SESIÓN AL CARGAR
  useEffect(() => {
    const sesion = obtenerSesion();

    if (
      !sesion ||
      (sesion.rol !== "administrador" && sesion.rol !== "empleado")
    ) {
      navigate("/");
      return;
    }

    setRolUsuario(sesion.rol);
    cargarProductos();
  }, []);

  // OBTENER PRODUCTOS
  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await fetch(`${API_URL}/productos`);
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudieron obtener los productos"
        );
      }

      const productosConImagen = datos.map((producto, index) => ({
        ...producto,
        imagen: producto.imagen || imagenes[index % imagenes.length]
      }));

      setProductos(productosConImagen);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // CAMBIAR CAMPO DEL FORMULARIO
  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }));
  };

  // ABRIR FORMULARIO AGREGAR
  const abrirAgregar = () => {
    setProductoEditar(null);
    setFormulario({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      imagen: ""
    });
    setMostrarFormulario(true);
  };

  // ABRIR FORMULARIO EDITAR
  const abrirEditar = (producto) => {
    setProductoEditar(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      imagen: producto.imagen || ""
    });
    setMostrarFormulario(true);
  };

  // GUARDAR PRODUCTO (CREAR / EDITAR)
  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      const token = obtenerToken();
      if (!token) return;

      const url = productoEditar
        ? `${API_URL}/productos/${productoEditar.id}`
        : `${API_URL}/productos`;

      const metodo = productoEditar ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formulario.nombre,
          descripcion: formulario.descripcion,
          precio: Number(formulario.precio),
          stock: Number(formulario.stock),
          imagen: formulario.imagen
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.detail || "No se pudo guardar el producto");
      }

      alert(
        productoEditar
          ? "Producto actualizado correctamente"
          : "Producto creado correctamente"
      );

      setMostrarFormulario(false);
      setProductoEditar(null);
      cargarProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert(error.message);
    }
  };

  // ELIMINAR PRODUCTO (SOLO ADMIN)
  const eliminarProducto = async (id) => {
    if (rolUsuario !== "administrador") {
      alert("Los empleados no pueden eliminar productos.");
      return;
    }

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este producto?"
    );
    if (!confirmar) return;

    try {
      const token = obtenerToken();
      if (!token) return;

      const respuesta = await fetch(
        `${API_URL}/productos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.detail || "No se pudo eliminar el producto");
      }

      alert("Producto eliminado correctamente");
      cargarProductos();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert(error.message);
    }
  };

  // FORMATO PRECIO
  const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(precio);
  };

  if (rolUsuario !== "administrador" && rolUsuario !== "empleado") {
    return null;
  }

  return (
    <section className="min-h-full bg-gray-950 p-8">
      <div className="mx-auto max-w-[1300px]">
        {/* ENCABEZADO */}
        <div className="mb-8 flex flex-col gap-4 border-b border-gray-700 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {rolUsuario === "administrador"
                ? "Administración"
                : "Panel del empleado"}
            </p>
            <h1 className="mt-2 text-4xl font-bold text-white">📦 Productos</h1>
            <p className="mt-2 text-gray-400">
              {rolUsuario === "administrador"
                ? "Administra el catálogo de productos."
                : "Consulta, agrega y edita productos."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={abrirAgregar}
              className="rounded-lg bg-cyan-400 px-5 py-3 font-bold text-gray-900 transition hover:bg-cyan-300"
            >
              + Agregar producto
            </button>
          </div>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* CARGANDO / LISTA */}
        {cargando ? (
          <p className="py-10 text-center text-white">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <div className="rounded-2xl bg-[#111827] p-12 text-center">
            <p className="text-5xl">📦</p>
            <p className="mt-4 text-xl text-gray-400">
              No hay productos registrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <article
                key={producto.id}
                className="overflow-hidden rounded-2xl border border-gray-700 bg-[#1b2740e0] transition hover:-translate-y-1 hover:border-cyan-400/50"
              >
                {/* IMAGEN CORREGIDA */}
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="h-[200px] w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = laptop;
                  }}
                />

                <div className="p-5">
                  <h2 className="text-xl font-bold text-white">
                    {producto.nombre}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-400">
                    {producto.descripcion}
                  </p>
                  <p className="mt-4 text-xl font-bold text-cyan-400">
                    {formatoPrecio(producto.precio)}
                  </p>

                  <div className="mt-3 rounded-lg bg-gray-900 px-3 py-2">
                    <p className="text-sm text-gray-400">Stock</p>
                    <p
                      className={`font-bold ${
                        producto.stock === 0
                          ? "text-red-400"
                          : producto.stock <= 5
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {producto.stock} unidades
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => abrirEditar(producto)}
                      className="flex-1 rounded-lg bg-blue-500 px-3 py-2 font-bold text-white transition hover:bg-blue-400"
                    >
                      ✏️ Editar
                    </button>

                    {rolUsuario === "administrador" && (
                      <button
                        onClick={() => eliminarProducto(producto.id)}
                        className="flex-1 rounded-lg bg-red-500 px-3 py-2 font-bold text-white transition hover:bg-red-400"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={guardarProducto}
            className="w-full max-w-xl rounded-2xl bg-[#111827] p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {productoEditar
                  ? "✏️ Editar producto"
                  : "➕ Agregar producto"}
              </h2>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="text-2xl text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                placeholder="Nombre"
                required
                maxLength="100"
                className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={cambiarCampo}
                placeholder="Descripción"
                required
                rows="3"
                className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                name="precio"
                type="number"
                min="0"
                value={formulario.precio}
                onChange={cambiarCampo}
                placeholder="Precio"
                required
                className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                name="stock"
                type="number"
                min="0"
                value={formulario.stock}
                onChange={cambiarCampo}
                placeholder="Stock"
                required
                className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                name="imagen"
                value={formulario.imagen}
                onChange={cambiarCampo}
                placeholder="URL de imagen (opcional)"
                className="w-full rounded-lg bg-gray-800 p-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 rounded-lg border border-gray-600 px-4 py-3 font-bold text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 font-bold text-gray-900 hover:bg-cyan-300"
              >
                {productoEditar ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default AdminProductos;