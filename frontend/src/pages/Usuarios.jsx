import { useEffect, useMemo, useState } from "react";
import { obtenerSesion } from "../Services/AuthService";
import API_URL from "../Services/api";

function Usuarios() {

  // =====================================================
  // ESTADOS
  // =====================================================

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Modal agregar / editar
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Modal pedidos
  const [mostrarPedidos, setMostrarPedidos] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  // =====================================================
  // FORMULARIO
  // =====================================================

  const formularioInicial = {
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    correo: "",
    password: "",
    rol: "cliente",
    estado: true
  };

  const [formulario, setFormulario] =
    useState(formularioInicial);

  // =====================================================
  // OBTENER TOKEN
  // =====================================================

  const obtenerToken = () => {

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No existe una sesión activa");
    }

    return token;
  };

  // =====================================================
  // HEADERS
  // =====================================================

  const headersAutenticados = () => {

    const token = obtenerToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  };

  // =====================================================
  // OBTENER USUARIOS
  // =====================================================

  const obtenerUsuarios = async () => {

    try {

      setCargando(true);
      setError("");

      const respuesta = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "GET",
          headers: headersAutenticados()
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          datos.mensaje ||
          "No fue posible obtener los usuarios"
        );

      }

      setUsuarios(datos);

    } catch (error) {

      console.error("Error obteniendo usuarios:", error);

      setError(error.message);

    } finally {

      setCargando(false);

    }
  };

  // =====================================================
  // CARGAR AL INICIAR
  // =====================================================

  useEffect(() => {

    const sesion = obtenerSesion();

    if (!sesion || sesion.rol !== "administrador") {

      setError(
        "No tienes permisos para acceder a esta sección."
      );

      setCargando(false);

      return;
    }

    obtenerUsuarios();

  }, []);

  // =====================================================
  // BUSCADOR
  // =====================================================

  const usuariosFiltrados = useMemo(() => {

    const texto = busqueda
      .toLowerCase()
      .trim();

    if (!texto) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {

      return (
        usuario.nombre?.toLowerCase().includes(texto) ||
        usuario.apellido?.toLowerCase().includes(texto) ||
        usuario.correo?.toLowerCase().includes(texto) ||
        obtenerNombreRol(usuario.rol)
          .toLowerCase()
          .includes(texto)
      );

    });

  }, [usuarios, busqueda]);

  // =====================================================
  // OBTENER NOMBRE DEL ROL
  // =====================================================

  function obtenerNombreRol(rol) {

    if (!rol) {
      return "Sin rol";
    }

    if (typeof rol === "string") {
      return rol;
    }

    return rol.nombre || "Sin rol";
  }

  // =====================================================
  // CAMBIAR CAMPOS
  // =====================================================

  const manejarCambio = (e) => {

    const { name, value, type, checked } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

  };

  // =====================================================
  // ABRIR AGREGAR
  // =====================================================

  const abrirAgregar = () => {

    setModoEdicion(false);

    setUsuarioSeleccionado(null);

    setFormulario(formularioInicial);

    setMostrarFormulario(true);

  };

  // =====================================================
  // ABRIR EDITAR
  // =====================================================

  const abrirEditar = (usuario) => {

    setModoEdicion(true);

    setUsuarioSeleccionado(usuario);

    setFormulario({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      tipoDocumento:
        usuario.tipoDocumento || "CC",
      numeroDocumento:
        usuario.numeroDocumento || "",
      direccion:
        usuario.direccion || "",
      telefono:
        usuario.telefono || "",
      correo:
        usuario.correo || "",
      password: "",
      rol: obtenerNombreRol(usuario.rol),
      estado:
        usuario.estado !== false
    });

    setMostrarFormulario(true);

  };

  // =====================================================
  // GUARDAR USUARIO
  // =====================================================

  const guardarUsuario = async (e) => {

    e.preventDefault();

    try {

      const datos = {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        tipoDocumento: formulario.tipoDocumento,
        numeroDocumento: formulario.numeroDocumento,
        direccion: formulario.direccion,
        telefono: formulario.telefono,
        correo: formulario.correo,
        rol: formulario.rol,
        estado: formulario.estado
      };

      // Solo enviar password al crear
      // o si el administrador escribió una nueva
      if (
        !modoEdicion ||
        formulario.password.trim() !== ""
      ) {

        datos.password = formulario.password;

      }

      const url = modoEdicion
        ? `${API_URL}/usuarios/${usuarioSeleccionado._id}`
        : `${API_URL}/usuarios`;

      const respuesta = await fetch(
        url,
        {
          method: modoEdicion
            ? "PUT"
            : "POST",

          headers:
            headersAutenticados(),

          body: JSON.stringify(datos)
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          "No fue posible guardar el usuario"
        );

      }

      alert(
        modoEdicion
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );

      setMostrarFormulario(false);

      setFormulario(formularioInicial);

      setUsuarioSeleccionado(null);

      await obtenerUsuarios();

    } catch (error) {

      console.error(
        "Error guardando usuario:",
        error
      );

      alert(error.message);

    }
  };

  // =====================================================
  // CAMBIAR ROL
  // =====================================================

  const cambiarRol = async (
    usuario,
    nuevoRol
  ) => {

    try {

      if (
        obtenerNombreRol(usuario.rol) ===
        nuevoRol
      ) {
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/usuarios/${usuario._id}/rol`,
        {
          method: "PUT",
          headers:
            headersAutenticados(),

          body: JSON.stringify({
            rol: nuevoRol
          })
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          "Error al cambiar el rol"
        );

      }

      await obtenerUsuarios();

    } catch (error) {

      console.error(
        "Error cambiando rol:",
        error
      );

      alert(error.message);

      await obtenerUsuarios();

    }
  };

  // =====================================================
  // ACTIVAR / DESACTIVAR
  // =====================================================

  const cambiarEstado = async (usuario) => {

    const nuevoEstado =
      usuario.estado === false;

    const accion =
      nuevoEstado
        ? "activar"
        : "desactivar";

    const confirmar =
      window.confirm(
        `¿Seguro que deseas ${accion} a ${usuario.nombre} ${usuario.apellido}?`
      );

    if (!confirmar) {
      return;
    }

    try {

      const respuesta = await fetch(
        `${API_URL}/usuarios/${usuario._id}/estado`,
        {
          method: "PUT",

          headers:
            headersAutenticados(),

          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          "No fue posible cambiar el estado"
        );

      }

      await obtenerUsuarios();

    } catch (error) {

      console.error(
        "Error cambiando estado:",
        error
      );

      alert(error.message);

    }
  };

  // =====================================================
  // VER PEDIDOS
  // =====================================================

  const verPedidos = async (usuario) => {

    try {

      setClienteSeleccionado(usuario);

      setMostrarPedidos(true);

      setCargandoPedidos(true);

      setPedidos([]);

      const respuesta = await fetch(
        `${API_URL}/pedidos/cliente/${usuario._id}`,
        {
          method: "GET",
          headers:
            headersAutenticados()
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          "No fue posible obtener los pedidos"
        );

      }

      setPedidos(resultado);

    } catch (error) {

      console.error(
        "Error obteniendo pedidos:",
        error
      );

      alert(error.message);

    } finally {

      setCargandoPedidos(false);

    }
  };

  // =====================================================
  // CAMBIAR ESTADO PEDIDO
  // =====================================================

  const cambiarEstadoPedido = async (
    pedido,
    nuevoEstado
  ) => {

    try {

      const respuesta = await fetch(
        `${API_URL}/pedidos/${pedido._id}/estado`,
        {
          method: "PUT",

          headers:
            headersAutenticados(),

          body: JSON.stringify({
            estado: nuevoEstado
          })
        }
      );

      const resultado =
        await respuesta.json();

      if (!respuesta.ok) {

        throw new Error(
          resultado.mensaje ||
          "No fue posible cambiar el estado"
        );

      }

      // Actualizar inmediatamente
      setPedidos((anteriores) =>
        anteriores.map((item) =>
          item._id === pedido._id
            ? {
                ...item,
                estado: nuevoEstado
              }
            : item
        )
      );

    } catch (error) {

      console.error(
        "Error cambiando estado del pedido:",
        error
      );

      alert(error.message);

    }
  };

  // =====================================================
  // FORMATO DE PRECIO
  // =====================================================

  const formatoPrecio = (precio) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }
    ).format(precio || 0);

  };

  // =====================================================
  // COLOR ESTADO PEDIDO
  // =====================================================

  const claseEstadoPedido = (estado) => {

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
  // RENDER
  // =====================================================

  return (

    <section
      className="
        min-h-screen
        w-full
        bg-[#0f172a]
        px-5
        py-10
        text-white
        md:px-10
      "
    >

      <div
        className="
          mx-auto
          max-w-[1400px]
        "
      >

        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-5
            border-b
            border-gray-700
            pb-6
            md:flex-row
            md:items-center
            md:justify-between
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
              Administración
            </p>

            <h1
              className="
                text-3xl
                font-bold
                md:text-4xl
              "
            >
              👥 Gestión de Usuarios
            </h1>

            <p
              className="
                mt-2
                text-gray-400
              "
            >
              Administra usuarios, roles, estados y pedidos.
            </p>

          </div>

          <button
            onClick={abrirAgregar}
            className="
              rounded-xl
              bg-cyan-400
              px-5
              py-3
              font-bold
              text-gray-900
              transition
              hover:scale-105
              hover:bg-cyan-300
            "
          >
            ➕ Agregar usuario
          </button>

        </div>

        {/* =================================================
            BUSCADOR
        ================================================= */}

        <div
          className="
            mb-6
            rounded-xl
            border
            border-gray-700
            bg-[#111827]
            p-4
          "
        >

          <input
            type="text"
            placeholder="🔎 Buscar usuario por nombre, correo o rol..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
            className="
              w-full
              rounded-lg
              border
              border-gray-700
              bg-[#1b2740]
              px-4
              py-3
              text-white
              outline-none
              transition
              focus:border-cyan-400
            "
          />

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
              border-red-500/30
              bg-red-500/10
              p-4
              text-red-400
            "
          >
            ❌ {error}
          </div>

        )}

        {/* =================================================
            CARGANDO
        ================================================= */}

        {cargando ? (

          <div className="py-20 text-center">

            <p className="text-xl text-gray-400">
              Cargando usuarios...
            </p>

          </div>

        ) : (

          <div
            className="
              overflow-x-auto
              rounded-xl
              border
              border-gray-700
              bg-[#111827]
            "
          >

            <table
              className="
                w-full
                min-w-[950px]
                text-left
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-gray-700
                    bg-[#1b2740]
                  "
                >

                  <th className="px-5 py-4">
                    Usuario
                  </th>

                  <th className="px-5 py-4">
                    Correo
                  </th>

                  <th className="px-5 py-4">
                    Rol
                  </th>

                  <th className="px-5 py-4">
                    Estado
                  </th>

                  <th className="px-5 py-4 text-center">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {usuariosFiltrados.map(
                  (usuario) => {

                    const rol =
                      obtenerNombreRol(
                        usuario.rol
                      );

                    const esCliente =
                      rol === "cliente";

                    const activo =
                      usuario.estado !== false;

                    return (

                      <tr
                        key={usuario._id}
                        className="
                          border-b
                          border-gray-800
                          transition
                          hover:bg-[#1b2740]
                        "
                      >

                        {/* USUARIO */}

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-bold">
                              {usuario.nombre}{" "}
                              {usuario.apellido}
                            </p>

                            <p className="text-sm text-gray-500">
                              {usuario.numeroDocumento}
                            </p>

                          </div>

                        </td>

                        {/* CORREO */}

                        <td className="px-5 py-4 text-gray-300">

                          {usuario.correo}

                        </td>

                        {/* ROL */}

                        <td className="px-5 py-4">

                          <select
                            value={rol}
                            onChange={(e) =>
                              cambiarRol(
                                usuario,
                                e.target.value
                              )
                            }
                            className="
                              rounded-lg
                              border
                              border-gray-600
                              bg-[#1b2740]
                              px-3
                              py-2
                              text-white
                              outline-none
                              focus:border-cyan-400
                            "
                          >

                            <option value="cliente">
                              Cliente
                            </option>

                            <option value="empleado">
                              Empleado
                            </option>

                            <option value="administrador">
                              Administrador
                            </option>

                          </select>

                        </td>

                        {/* ESTADO */}

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              cambiarEstado(
                                usuario
                              )
                            }
                            className={`
                              rounded-full
                              px-3
                              py-1
                              text-sm
                              font-bold
                              transition
                              ${
                                activo
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              }
                            `}
                          >

                            {activo
                              ? "🟢 Activo"
                              : "🔴 Inactivo"}

                          </button>

                        </td>

                        {/* ACCIONES */}

                        <td className="px-5 py-4">

                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                            "
                          >

                            {/* EDITAR */}

                            <button
                              onClick={() =>
                                abrirEditar(
                                  usuario
                                )
                              }
                              title="Editar usuario"
                              className="
                                rounded-lg
                                bg-blue-500/20
                                px-3
                                py-2
                                text-blue-400
                                transition
                                hover:bg-blue-500/30
                              "
                            >
                              ✏️
                            </button>

                            {/* ACTIVAR / DESACTIVAR */}

                            <button
                              onClick={() =>
                                cambiarEstado(
                                  usuario
                                )
                              }
                              title={
                                activo
                                  ? "Desactivar usuario"
                                  : "Activar usuario"
                              }
                              className="
                                rounded-lg
                                bg-gray-500/20
                                px-3
                                py-2
                                transition
                                hover:bg-gray-500/30
                              "
                            >
                              🔐
                            </button>

                            {/* PEDIDOS */}

                            {esCliente && (

                              <button
                                onClick={() =>
                                  verPedidos(
                                    usuario
                                  )
                                }
                                title="Ver pedidos"
                                className="
                                  rounded-lg
                                  bg-cyan-500/20
                                  px-3
                                  py-2
                                  text-cyan-400
                                  transition
                                  hover:bg-cyan-500/30
                                "
                              >
                                📦
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

            {/* SIN USUARIOS */}

            {usuariosFiltrados.length === 0 && (

              <div
                className="
                  py-16
                  text-center
                  text-gray-400
                "
              >
                No se encontraron usuarios.
              </div>

            )}

          </div>

        )}

      </div>

      {/* =====================================================
          MODAL AGREGAR / EDITAR
      ===================================================== */}

      {mostrarFormulario && (

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
            setMostrarFormulario(false)
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-3xl
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

              <h2 className="text-2xl font-bold">

                {modoEdicion
                  ? "✏️ Editar usuario"
                  : "➕ Agregar usuario"}

              </h2>

              <button
                onClick={() =>
                  setMostrarFormulario(false)
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

            <form
              onSubmit={guardarUsuario}
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >

              {/* NOMBRE */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Nombre
                </label>

                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  required
                  maxLength={30}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* APELLIDO */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Apellido
                </label>

                <input
                  name="apellido"
                  value={formulario.apellido}
                  onChange={manejarCambio}
                  required
                  maxLength={30}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* TIPO DOCUMENTO */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Tipo de documento
                </label>

                <select
                  name="tipoDocumento"
                  value={
                    formulario.tipoDocumento
                  }
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                >

                  <option value="CC">
                    Cédula de ciudadanía
                  </option>

                  <option value="TI">
                    Tarjeta de identidad
                  </option>

                  <option value="CE">
                    Cédula de extranjería
                  </option>

                  <option value="Pasaporte">
                    Pasaporte
                  </option>

                </select>

              </div>

              {/* DOCUMENTO */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Número de documento
                </label>

                <input
                  name="numeroDocumento"
                  value={
                    formulario.numeroDocumento
                  }
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* DIRECCIÓN */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Dirección
                </label>

                <input
                  name="direccion"
                  value={
                    formulario.direccion
                  }
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* TELÉFONO */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Teléfono
                </label>

                <input
                  name="telefono"
                  value={
                    formulario.telefono
                  }
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* CORREO */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Correo
                </label>

                <input
                  type="email"
                  name="correo"
                  value={
                    formulario.correo
                  }
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">

                  Contraseña
                  {modoEdicion && (
                    <span className="ml-2 text-gray-500">
                      (opcional)
                    </span>
                  )}

                </label>

                <input
                  type="password"
                  name="password"
                  value={
                    formulario.password
                  }
                  onChange={manejarCambio}
                  required={!modoEdicion}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                />

              </div>

              {/* ROL */}

              <div>

                <label className="mb-2 block text-sm text-gray-300">
                  Rol
                </label>

                <select
                  name="rol"
                  value={formulario.rol}
                  onChange={manejarCambio}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-700
                    bg-[#1b2740]
                    px-4
                    py-3
                    text-white
                    outline-none
                    focus:border-cyan-400
                  "
                >

                  <option value="cliente">
                    Cliente
                  </option>

                  <option value="empleado">
                    Empleado
                  </option>

                  <option value="administrador">
                    Administrador
                  </option>

                </select>

              </div>

              {/* ESTADO */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  bg-[#1b2740]
                  p-4
                "
              >

                <input
                  id="estado"
                  type="checkbox"
                  name="estado"
                  checked={
                    formulario.estado
                  }
                  onChange={manejarCambio}
                  className="
                    h-5
                    w-5
                    accent-cyan-400
                  "
                />

                <label
                  htmlFor="estado"
                  className="cursor-pointer"
                >
                  Usuario activo
                </label>

              </div>

              {/* BOTONES */}

              <div
                className="
                  mt-4
                  flex
                  gap-3
                  md:col-span-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                  className="
                    flex-1
                    rounded-lg
                    border
                    border-gray-600
                    px-4
                    py-3
                    font-bold
                    text-gray-300
                    transition
                    hover:bg-gray-700
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
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

                  {modoEdicion
                    ? "Guardar cambios"
                    : "Crear usuario"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL PEDIDOS
      ===================================================== */}

      {mostrarPedidos && (

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
            setMostrarPedidos(false)
          }
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-4xl
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

            {/* CABECERA */}

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

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                  "
                >
                  📦 Pedidos
                </h2>

                {clienteSeleccionado && (

                  <p className="mt-1 text-gray-400">

                    Cliente:{" "}
                    <span className="text-cyan-400">

                      {clienteSeleccionado.nombre}{" "}
                      {clienteSeleccionado.apellido}

                    </span>

                  </p>

                )}

              </div>

              <button
                onClick={() =>
                  setMostrarPedidos(false)
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

            {/* CARGANDO */}

            {cargandoPedidos ? (

              <div className="py-12 text-center">

                <p className="text-gray-400">
                  Cargando pedidos...
                </p>

              </div>

            ) : pedidos.length === 0 ? (

              <div
                className="
                  rounded-xl
                  bg-[#1b2740]
                  py-12
                  text-center
                "
              >

                <p className="text-5xl">
                  📦
                </p>

                <p className="mt-4 text-gray-400">
                  Este cliente no tiene pedidos.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {pedidos.map((pedido) => (

                  <div
                    key={pedido._id}
                    className="
                      rounded-xl
                      border
                      border-gray-700
                      bg-[#1b2740]
                      p-5
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

                        <p className="font-bold text-white">

                          Pedido #
                          {pedido.numero ||
                            pedido._id
                              ?.slice(-6)
                              .toUpperCase()}

                        </p>

                        <p className="mt-1 text-sm text-gray-400">

                          {pedido.createdAt
                            ? new Date(
                                pedido.createdAt
                              ).toLocaleDateString(
                                "es-CO"
                              )
                            : "Fecha no disponible"}

                        </p>

                        {pedido.total !==
                          undefined && (

                          <p className="mt-2 font-bold text-cyan-400">

                            {formatoPrecio(
                              pedido.total
                            )}

                          </p>

                        )}

                      </div>

                      {/* ESTADO */}

                      <div>

                        <label className="mb-2 block text-sm text-gray-400">
                          Estado del pedido
                        </label>

                        <select
                          value={
                            pedido.estado ||
                            "Pendiente"
                          }
                          onChange={(e) =>
                            cambiarEstadoPedido(
                              pedido,
                              e.target.value
                            )
                          }
                          className={`
                            rounded-lg
                            border
                            border-gray-600
                            px-4
                            py-2
                            font-bold
                            outline-none
                            ${claseEstadoPedido(
                              pedido.estado
                            )}
                          `}
                        >

                          <option value="Pendiente">
                            Pendiente
                          </option>

                          <option value="Procesando">
                            Procesando
                          </option>

                          <option value="Enviado">
                            Enviado
                          </option>

                          <option value="Entregado">
                            Entregado
                          </option>

                          <option value="Cancelado">
                            Cancelado
                          </option>

                        </select>

                      </div>

                    </div>

                    {/* PRODUCTOS DEL PEDIDO */}

                    {pedido.productos &&
                      pedido.productos.length >
                        0 && (

                        <div
                          className="
                            mt-4
                            border-t
                            border-gray-700
                            pt-4
                          "
                        >

                          <p className="mb-3 font-semibold">
                            Productos
                          </p>

                          <div className="space-y-2">

                            {pedido.productos.map(
                              (producto, index) => (

                                <div
                                  key={
                                    producto._id ||
                                    index
                                  }
                                  className="
                                    flex
                                    justify-between
                                    text-sm
                                    text-gray-400
                                  "
                                >

                                  <span>
                                    {producto.nombre ||
                                      "Producto"}{" "}
                                    x{" "}
                                    {producto.cantidad ||
                                      1}
                                  </span>

                                  {producto.precio !==
                                    undefined && (

                                    <span>
                                      {formatoPrecio(
                                        producto.precio *
                                          (producto.cantidad ||
                                            1)
                                      )}
                                    </span>

                                  )}

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )}

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      )}

    </section>

  );
}

export default Usuarios;