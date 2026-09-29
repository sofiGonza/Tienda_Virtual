import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import Paginador, { usePaginacion } from "../components/panel/Paginador";

import {
  obtenerSesion
} from "../Services/AuthService";

import API_URL from "../Services/api";


// =====================================================
// AYUDANTES DE CONTRATO (FastAPI)
// =====================================================

// Convierte un estado en minúscula (pendiente) a
// Capitalize (Pendiente) para el select y las etiquetas.

const capitalizar = (texto) => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};


// Mapea un pedido de FastAPI al formato que usa la vista:
// - id            (en vez de _id)
// - usuario       (objeto cliente)
// - productos     (desde detalles[], con nombre/precio/cantidad/subtotal)
// - estado        (Capitalize)

const mapearPedido = (pedido) => {

  const productos =
    (pedido.detalles || []).map(
      (detalle) => ({
        nombre:
          detalle.producto?.nombre ||
          detalle.nombre ||
          "Producto",

        precio:
          detalle.producto?.precio ??
          detalle.precio_unitario ??
          detalle.precio ??
          0,

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
    usuario: pedido.usuario || null,
    productos
  };

};


function AdminPedidos() {

  const navigate =
    useNavigate();


  const [pedidos, setPedidos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  // =====================================================
  // PAGINACIÓN (máximo 7 tarjetas por página)
  // =====================================================
  const {
    pagina,
    totalPaginas,
    inicio,
    fin,
    irA,
  } = usePaginacion(pedidos.length, 7);

  // =====================================================
  // MODAL AGREGAR PEDIDO (SOLO ADMIN)
  // =====================================================

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [nuevoPedido, setNuevoPedido] = useState({
    usuario_id: "",
    items: [],
  });
  const [crearError, setCrearError] = useState("");
  const [crearCargando, setCrearCargando] = useState(false);

  const abrirCrear = async () => {
    setCrearError("");
    setNuevoPedido({ usuario_id: "", items: [] });
    setMostrarCrear(true);
    try {
      const token = obtenerSesion()?.token;
      const [rCli, rPro] = await Promise.all([
        fetch(`${API_URL}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/productos`),
      ]);
      const dCli = await rCli.json();
      const dPro = await rPro.json();
      setClientes(
        Array.isArray(dCli) ? dCli.filter((u) => u.rol?.nombre === "cliente") : []
      );
      setProductos(Array.isArray(dPro) ? dPro : []);
    } catch (e) {
      setCrearError("No se pudieron cargar clientes/productos");
    }
  };

  const agregarItem = (productoId) => {
    const prod = productos.find((p) => p.id === Number(productoId));
    if (!prod) return;
    setNuevoPedido((prev) => {
      const existe = prev.items.find((i) => i.producto_id === prod.id);
      if (existe) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.producto_id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { producto_id: prod.id, cantidad: 1, nombre: prod.nombre }],
      };
    });
  };

  const quitarItem = (productoId) => {
    setNuevoPedido((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.producto_id !== productoId),
    }));
  };

  const guardarPedido = async () => {
    setCrearError("");
    if (!nuevoPedido.usuario_id) {
      setCrearError("Selecciona un cliente");
      return;
    }
    if (nuevoPedido.items.length === 0) {
      setCrearError("Agrega al menos un producto");
      return;
    }
    setCrearCargando(true);
    try {
      const token = obtenerSesion()?.token;
      const r = await fetch(
        `${API_URL}/pedidos?usuario_id=${nuevoPedido.usuario_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productos: nuevoPedido.items.map((i) => ({
              producto_id: i.producto_id,
              cantidad: i.cantidad,
            })),
          }),
        }
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail || "No se pudo crear el pedido");
      setMostrarCrear(false);
      cargarPedidos();
    } catch (e) {
      setCrearError(e.message);
    } finally {
      setCrearCargando(false);
    }
  };


  // =====================================================
  // SESIÓN
  // =====================================================

  const obtenerToken =
    () => {

      const sesion =
        obtenerSesion();


      if (!sesion) {

        navigate("/");

        return null;

      }


      const rol =
        String(
          sesion.rol
        ).toLowerCase();


      if (
        rol !== "administrador" &&
        rol !== "empleado"
      ) {

        navigate("/");

        return null;

      }


      return {

        token:
          sesion.token,

        rol

      };

    };


  // =====================================================
  // OBTENER PEDIDOS
  // =====================================================

  const cargarPedidos =
    async () => {

      try {

        setCargando(true);


        const sesion =
          obtenerToken();


        if (!sesion) {

          return;

        }


        const respuesta =
          await fetch(
            `${API_URL}/pedidos`,
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

            datos.detail ||
            "No se pudieron obtener los pedidos"

          );

        }


        setPedidos(
          datos.map(mapearPedido)
        );


      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );


      } finally {

        setCargando(false);

      }

    };


  useEffect(
    () => {

      cargarPedidos();

    },
    []
  );


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  const cambiarEstado =
    async (
      id,
      estado
    ) => {

      try {

        const sesion =
          obtenerToken();


        if (!sesion) {

          return;

        }


        // ===============================================
        // EMPLEADO NO PUEDE CANCELAR
        // ===============================================

        if (
          sesion.rol === "empleado" &&
          estado === "Cancelado"
        ) {

          alert(
            "El empleado no puede cancelar pedidos"
          );

          return;

        }


        const respuesta =
          await fetch(

            `${API_URL}/pedidos/${id}/estado`,

            {

              method:
                "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${sesion.token}`

              },

              body:
                JSON.stringify({

                  // FastAPI guarda el estado en minúscula
                  estado:
                    estado.toLowerCase()

                })

            }

          );


        const datos =
          await respuesta.json();


        if (!respuesta.ok) {

          throw new Error(

            datos.detail ||
            "No se pudo cambiar el estado"

          );

        }


        setPedidos(
          pedidosAnteriores =>

            pedidosAnteriores.map(
              pedido =>

                pedido.id === id

                  ? mapearPedido(datos)

                  : pedido

            )

        );


      } catch (error) {

        console.error(
          error
        );

        alert(
          error.message
        );

        cargarPedidos();

      }

    };


  // =====================================================
  // PRECIO
  // =====================================================

  const formatoPrecio =
    precio => {

      return new Intl.NumberFormat(

        "es-CO",

        {

          style:
            "currency",

          currency:
            "COP",

          maximumFractionDigits:
            0

        }

      ).format(
        precio || 0
      );

    };


  // =====================================================
  // ESTADO
  // =====================================================

  const colorEstado =
    estado => {

      switch (
        estado
      ) {

        case "Pendiente":

          return (
            "bg-yellow-500/20 text-yellow-400"
          );


        case "Procesando":

          return (
            "bg-blue-500/20 text-blue-400"
          );


        case "Enviado":

          return (
            "bg-purple-500/20 text-purple-400"
          );


        case "Entregado":

          return (
            "bg-green-500/20 text-green-400"
          );


        case "Cancelado":

          return (
            "bg-red-500/20 text-red-400"
          );


        default:

          return (
            "bg-gray-500/20 text-texto-tenue"
          );

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <section
      className="
        min-h-full
        bg-fondo
        p-8
      "
    >

      <div
        className="
          mx-auto
          max-w-[1200px]
        "
      >

        {/* =============================================
            ENCABEZADO
        ============================================= */}

        <div
          className="
            mb-10
            flex
            flex-col
            gap-4
            border-b
            border-borde
            pb-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-widest
                text-cyan-400
              "
            >
              Gestión
            </p>


            <h1
              className="
                mt-2
                text-4xl
                font-bold
                text-texto
              "
            >
              🛒 Pedidos
            </h1>

          </div>

          {obtenerSesion()?.rol === "administrador" && (
            <button
              onClick={abrirCrear}
              className="
                w-fit
                rounded-lg
                bg-cyan-400
                px-5
                py-3
                font-bold
                text-[#06202e]
                hover:bg-cyan-300
              "
            >
              ＋ Agregar pedido
            </button>
          )}

        </div>


        {/* =============================================
            CARGANDO
        ============================================= */}

        {cargando ? (

          <p
            className="
              text-center
              text-texto
            "
          >
            Cargando pedidos...
          </p>

        ) : pedidos.length === 0 ? (

          <div
            className="
              rounded-2xl
              bg-fondo
              p-12
              text-center
            "
          >

            <p
              className="
                text-5xl
              "
            >
              📦
            </p>


            <p
              className="
                mt-4
                text-xl
                text-texto-tenue
              "
            >
              No hay pedidos registrados.
            </p>

          </div>

        ) : (

          <>

          <div
            className="
              space-y-6
            "
          >

            {pedidos
              .slice(inicio, fin)
              .map(
              (
                pedido,
                index
              ) => (

                <article
                  key={
                    pedido.id
                  }

                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-borde
                    bg-fondo
                  "
                >

                  {/* ===================================
                      CLIENTE
                  =================================== */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      border-b
                      border-borde
                      p-6
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          text-texto-tenue
                        "
                      >
                        Pedido #
                        {String(
                          inicio + index + 1
                        ).padStart(
                          3,
                          "0"
                        )}
                      </p>


                      <h2
                        className="
                          mt-1
                          text-xl
                          font-bold
                          text-texto
                        "
                      >
                        👤{" "}

                        {pedido.usuario?.nombre}

                        {" "}

                        {pedido.usuario?.apellido}

                      </h2>


                      <p
                        className="
                          mt-1
                          text-texto-tenue
                        "
                      >
                        {pedido.usuario?.correo}
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-texto-tenue
                        "
                      >
                        Documento:
                        {" "}
                        {pedido.usuario?.numeroDocumento}
                      </p>

                    </div>


                    <span
                      className={`
                        w-fit
                        rounded-full
                        px-4
                        py-2
                        font-bold
                        ${colorEstado(
                          pedido.estado
                        )}
                      `}
                    >
                      {pedido.estado}
                    </span>

                  </div>


                  {/* ===================================
                      PRODUCTOS
                  =================================== */}

                  <div
                    className="
                      space-y-3
                      p-6
                    "
                  >

                    {pedido.productos?.map(
                      (
                        producto,
                        productoIndex
                      ) => (

                        <div
                          key={

                            producto.id ||
                            productoIndex

                          }

                          className="
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            bg-superficie
                            p-4
                          "
                        >

                          <div>

                            <h3
                              className="
                                font-bold
                                text-texto
                              "
                            >
                              {producto.nombre}
                            </h3>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-texto-tenue
                              "
                            >
                              Cantidad:
                              {" "}
                              {producto.cantidad}
                            </p>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-texto-tenue
                              "
                            >
                              Precio:
                              {" "}
                              {formatoPrecio(
                                producto.precio
                              )}
                            </p>

                          </div>


                          <p
                            className="
                              font-bold
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


                  {/* ===================================
                      TOTAL + ESTADO
                  =================================== */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      border-t
                      border-borde
                      p-6
                      md:flex-row
                      md:items-center
                      md:justify-between
                    "
                  >

                    <div>

                      <span
                        className="
                          text-texto-tenue
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


                    {/* =================================
                        ESTADO
                    ================================= */}

                    <div>

                      <select
                        value={
                          pedido.estado
                        }

                        disabled={
                          pedido.estado ===
                            "Entregado" ||
                          pedido.estado ===
                            "Cancelado"
                        }

                        onChange={
                          e =>
                            cambiarEstado(
                              pedido.id,
                              e.target.value
                            )
                        }

                        className="
                          rounded-lg
                          border
                          border-borde
                          bg-superficie-2
                          px-4
                          py-3
                          font-semibold
                          text-texto
                          outline-none
                          focus:ring-2
                          focus:ring-cyan-400
                        "
                      >

                        <option
                          value="Pendiente"
                        >
                          Pendiente
                        </option>


                        <option
                          value="Procesando"
                        >
                          Procesando
                        </option>


                        <option
                          value="Enviado"
                        >
                          Enviado
                        </option>


                        <option
                          value="Entregado"
                        >
                          Entregado
                        </option>


                        {obtenerSesion()?.rol ===
                          "administrador" && (

                          <option
                            value="Cancelado"
                          >
                            Cancelado
                          </option>

                        )}

                      </select>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

          <Paginador
            pagina={pagina}
            totalPaginas={totalPaginas}
            irA={irA}
          />

          </>

        )}

      </div>

      {/* =================================================
          MODAL AGREGAR PEDIDO (ADMIN)
      ================================================= */}

      {mostrarCrear && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-fondo p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-texto">＋ Agregar pedido</h2>
              <button
                onClick={() => setMostrarCrear(false)}
                className="text-2xl text-texto-tenue hover:text-texto"
              >
                ✕
              </button>
            </div>

            {crearError && (
              <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {crearError}
              </p>
            )}

            {/* CLIENTE */}
            <label className="mb-1 block text-sm font-semibold text-texto-suave">
              Cliente
            </label>
            <select
              value={nuevoPedido.usuario_id}
              onChange={(e) =>
                setNuevoPedido((prev) => ({ ...prev, usuario_id: e.target.value }))
              }
              className="mb-4 w-full rounded-lg bg-superficie-2 p-3 text-texto outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">Selecciona un cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellido} — {c.correo}
                </option>
              ))}
            </select>

            {/* PRODUCTO */}
            <label className="mb-1 block text-sm font-semibold text-texto-suave">
              Producto
            </label>
            <div className="mb-4 flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) agregarItem(e.target.value);
                  e.target.value = "";
                }}
                className="flex-1 rounded-lg bg-superficie-2 p-3 text-texto outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Agregar producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.stock} uds
                  </option>
                ))}
              </select>
            </div>

            {/* ITEMS */}
            {nuevoPedido.items.length > 0 && (
              <div className="mb-4 space-y-2">
                {nuevoPedido.items.map((item) => (
                  <div
                    key={item.producto_id}
                    className="flex items-center justify-between rounded-xl bg-fondo px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-texto">{item.nombre}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() =>
                            setNuevoPedido((prev) => ({
                              ...prev,
                              items: prev.items.map((i) =>
                                i.producto_id === item.producto_id
                                  ? { ...i, cantidad: Math.max(1, i.cantidad - 1) }
                                  : i
                              ),
                            }))
                          }
                          className="rounded bg-superficie-2 px-2 text-texto"
                        >
                          −
                        </button>
                        <span className="text-sm text-texto-suave">{item.cantidad}</span>
                        <button
                          onClick={() =>
                            setNuevoPedido((prev) => ({
                              ...prev,
                              items: prev.items.map((i) =>
                                i.producto_id === item.producto_id
                                  ? { ...i, cantidad: i.cantidad + 1 }
                                  : i
                              ),
                            }))
                          }
                          className="rounded bg-superficie-2 px-2 text-texto"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => quitarItem(item.producto_id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMostrarCrear(false)}
                className="flex-1 rounded-lg border border-borde px-4 py-3 font-bold text-texto-suave hover:bg-superficie-2"
              >
                Cancelar
              </button>
              <button
                onClick={guardarPedido}
                disabled={crearCargando}
                className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 font-bold text-[#06202e] hover:bg-cyan-300 disabled:opacity-50"
              >
                {crearCargando ? "Creando..." : "Crear pedido"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>

  );

}


export default AdminPedidos;