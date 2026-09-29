import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Paginador, { usePaginacion } from "../components/panel/Paginador";
import TarjetaNotificacion from "../components/TarjetaNotificacion";
import TarjetaConfirmacion from "../components/TarjetaConfirmacion";

import {
  obtenerSesion
} from "../Services/AuthService";

import API_URL from "../Services/api";


function AdminUsuarios() {

  const navigate = useNavigate();


  const [usuarios, setUsuarios] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [usuarioEditar, setUsuarioEditar] =
    useState(null);

  const [notificacion, setNotificacion] =
    useState(null);

  const [confirmarEliminar, setConfirmarEliminar] =
    useState(null);

  const [avisoDesactivar, setAvisoDesactivar] =
    useState(null);

  const mostrarNotificacion = (titulo, mensaje = "", emoji = "✅") =>
    setNotificacion({ titulo, mensaje, emoji });


  const [formulario, setFormulario] =
    useState({

      nombre: "",
      apellido: "",
      tipoDocumento: "CC",
      numeroDocumento: "",
      direccion: "",
      telefono: "",
      correo: "",
      password: "",
      rol: "cliente"

    });


  // =====================================================
  // TOKEN
  // =====================================================

  const obtenerTokenAdmin = () => {

    const sesion =
      obtenerSesion();


    if (
      !sesion ||
      sesion.rol !== "administrador"
    ) {

      navigate("/");

      return null;

    }


    return sesion.token;

  };


  // =====================================================
  // OBTENER USUARIOS
  // =====================================================

  const cargarUsuarios = async () => {

    try {

      setCargando(true);


      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      const respuesta =
        await fetch(
          `${API_URL}/usuarios`,
          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudieron obtener los usuarios"
        );

      }


      setUsuarios(
        datos
      );


    } catch (error) {

      console.error(
        error
      );

      mostrarNotificacion(
        "Error",
        error.message,
        "❌"
      );

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarUsuarios();

  }, []);


  // =====================================================
  // CAMBIAR FORMULARIO
  // =====================================================

  const cambiarCampo = (e) => {

    setFormulario(
      anterior => ({

        ...anterior,

        [e.target.name]:
          e.target.value

      })
    );

  };


  // =====================================================
  // NUEVO
  // =====================================================

  const nuevoUsuario = () => {

    setUsuarioEditar(null);


    setFormulario({

      nombre: "",
      apellido: "",
      tipoDocumento: "CC",
      numeroDocumento: "",
      direccion: "",
      telefono: "",
      correo: "",
      password: "",
      rol: "cliente"

    });


    setMostrarFormulario(true);

  };


  // =====================================================
  // EDITAR
  // =====================================================

  const editarUsuario = (usuario) => {

    setUsuarioEditar(
      usuario
    );


    setFormulario({

      nombre:
        usuario.nombre,

      apellido:
        usuario.apellido,

      tipoDocumento:
        usuario.tipoDocumento,

      numeroDocumento:
        usuario.numeroDocumento,

      direccion:
        usuario.direccion,

      telefono:
        usuario.telefono,

      correo:
        usuario.correo,

      password: "",

      rol:
        usuario.rol?.nombre ||
        "cliente"

    });


    setMostrarFormulario(true);

  };


  // =====================================================
  // VALIDACIÓN PREVIA (mismos límites que el backend)
  // =====================================================

  const validarFormularioUsuario = () => {
    const v = formulario;

    const camposObligatorios = [
      ["nombre", "Nombre"],
      ["apellido", "Apellido"],
      ["tipoDocumento", "Tipo de documento"],
      ["numeroDocumento", "Número de documento"],
      ["direccion", "Dirección"],
      ["telefono", "Teléfono"],
      ["correo", "Correo electrónico"],
      ["password", "Contraseña"],
    ];

    for (const [campo, etiqueta] of camposObligatorios) {
      if (!v[campo] || !String(v[campo]).trim()) {
        return `El campo "${etiqueta}" es obligatorio.`;
      }
    }

    if (v.nombre.length < 2) return "El nombre debe tener al menos 2 caracteres.";
    if (v.apellido.length < 2) return "El apellido debe tener al menos 2 caracteres.";
    if (!/^\d+$/.test(v.numeroDocumento)) return "El número de documento solo debe contener números.";
    if (v.numeroDocumento.length < 5) return "El número de documento debe tener al menos 5 números.";
    if (v.direccion.length < 5) return "La dirección debe tener al menos 5 caracteres.";
    if (!/^\d+$/.test(v.telefono)) return "El teléfono solo debe contener números.";
    if (v.telefono.length < 7) return "El teléfono debe tener al menos 7 números.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) return "Ingresa un correo electrónico válido.";
    if (v.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";

    return "";
  };


  // =====================================================
  // GUARDAR
  // =====================================================

  const guardarUsuario = async (e) => {

    e.preventDefault();


    try {

      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      // =====================================================
      // VALIDACIÓN PREVIA (mismos límites que el backend)
      // =====================================================

      const errorValidacion = validarFormularioUsuario();

      if (errorValidacion) {
        mostrarNotificacion(
          "Faltan datos",
          errorValidacion,
          "⚠️"
        );
        return;
      }


      let respuesta;


      if (usuarioEditar) {

        respuesta =
          await fetch(

            `${API_URL}/usuarios/${usuarioEditar.id}`,

            {

              method:
                "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

                  nombre:
                    formulario.nombre,

                  apellido:
                    formulario.apellido,

                  tipo_documento:
                    formulario.tipoDocumento,

                  numero_documento:
                    formulario.numeroDocumento,

                  direccion:
                    formulario.direccion,

                  telefono:
                    formulario.telefono,

                  correo:
                    formulario.correo

                })

            }

          );


      } else {

        respuesta =
          await fetch(

            `${API_URL}/usuarios`,

            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

                  nombre:
                    formulario.nombre,

                  apellido:
                    formulario.apellido,

                  tipo_documento:
                    formulario.tipoDocumento,

                  numero_documento:
                    formulario.numeroDocumento,

                  direccion:
                    formulario.direccion,

                  telefono:
                    formulario.telefono,

                  correo:
                    formulario.correo,

                  password:
                    formulario.password,

                  rol:
                    formulario.rol,

                  estado: true

                })

            }

          );

      }


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        // En un 422, FastAPI devuelve detail como ARRAY de errores.
        // Convertimos a texto legible en vez de "[object Object]".

        const detalle = Array.isArray(datos.detail)
          ? datos.detail
              .map((d) => d.msg || JSON.stringify(d))
              .join(" · ")
          : datos.detail;

        throw new Error(
          detalle ||
          "No se pudo guardar el usuario"
        );

      }


      // Si estamos editando y cambió el rol
      if (
        usuarioEditar &&
        formulario.rol !==
          usuarioEditar.rol?.nombre
      ) {

        const respuestaRol =
          await fetch(

            `${API_URL}/usuarios/${usuarioEditar.id}/rol`,

            {

              method:
                "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`

              },

              body:
                JSON.stringify({

                  rol:
                    formulario.rol

                })

            }

          );


        if (!respuestaRol.ok) {

          const datosRol =
            await respuestaRol.json();

          throw new Error(
            datosRol.detail ||
            "No se pudo actualizar el rol"
          );

        }

      }


      mostrarNotificacion(
        usuarioEditar
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente",
        usuarioEditar ? "Los cambios se guardaron." : "El usuario se añadió al sistema."
      );

      setMostrarFormulario(
        false
      );

      cargarUsuarios();


    } catch (error) {

      console.error(
        error
      );

      mostrarNotificacion(
        "Error",
        error.message,
        "❌"
      );

    }

  };


  // =====================================================
  // ESTADO
  // =====================================================

  const cambiarEstado = async (
    usuario
  ) => {

    try {

      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      const respuesta =
        await fetch(

          `${API_URL}/usuarios/${usuario.id}/estado`,

          {

            method:
              "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify({

                estado:
                  !usuario.estado

              })

          }

        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail
        );

      }


      cargarUsuarios();


    } catch (error) {

      mostrarNotificacion(
        "Error",
        error.message,
        "❌"
      );

    }

  };


  // =====================================================
  // ELIMINAR
  // =====================================================

  const eliminarUsuario = async (
    usuario
  ) => {

    // Si el usuario está activo, primero hay que desactivarlo.
    if (usuario.estado) {
      setAvisoDesactivar(usuario);
      return;
    }

    // Ya está inactivo: se puede eliminar directamente.
    setConfirmarEliminar(usuario);

  };


  // Desactiva al usuario desde la primera tarjeta y
  // pasa directamente a la confirmación de eliminación.
  const desactivarYPreguntarEliminar = async () => {

    if (!avisoDesactivar) return;

    try {

      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      const respuesta =
        await fetch(

          `${API_URL}/usuarios/${avisoDesactivar.id}/estado`,

          {

            method:
              "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify({

                estado: false

              })

          }

        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail
        );

      }


      // Pasa a la tarjeta de confirmación de eliminación.
      const usuarioDesactivado = {
        ...avisoDesactivar,
        estado: false,
      };
      setAvisoDesactivar(null);
      setConfirmarEliminar(usuarioDesactivado);
      cargarUsuarios();


    } catch (error) {

      setAvisoDesactivar(null);
      mostrarNotificacion(
        "Error",
        error.message,
        "❌"
      );

    }

  };


  const confirmarEliminarUsuario = async () => {

    if (!confirmarEliminar) return;

    try {

      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      const respuesta =
        await fetch(

          `${API_URL}/usuarios/${confirmarEliminar.id}`,

          {

            method:
              "DELETE",

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail
        );

      }


      mostrarNotificacion(
        "Usuario eliminado",
        `Se desactivó a ${confirmarEliminar.nombre} ${confirmarEliminar.apellido}.`
      );


      setConfirmarEliminar(null);
      cargarUsuarios();


    } catch (error) {

      setConfirmarEliminar(null);
      mostrarNotificacion(
        "Error",
        error.message,
        "❌"
      );

    }

  };


  // =====================================================
  // FILTRAR
  // =====================================================

  const usuariosFiltrados =
    usuarios.filter(
      usuario => {

        const texto =
          busqueda
            .toLowerCase()
            .trim();


        return (

          usuario.nombre
            .toLowerCase()
            .includes(texto)

          ||

          usuario.apellido
            .toLowerCase()
            .includes(texto)

          ||

          usuario.correo
            .toLowerCase()
            .includes(texto)

          ||

          usuario.numeroDocumento
            .includes(texto)

        );

      }
    );

  // =====================================================
  // PAGINACIÓN (máximo 7 tarjetas por página)
  // =====================================================
  const {
    pagina,
    totalPaginas,
    inicio,
    fin,
    irA,
  } = usePaginacion(usuariosFiltrados.length, 7);


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
          max-w-[1300px]
        "
      >

        {/* ENCABEZADO */}

        <div
          className="
            mb-8
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
              Administración
            </p>


            <h1
              className="
                mt-2
                text-4xl
                font-bold
                text-texto
              "
            >
              👥 Usuarios
            </h1>

          </div>


          <div className="flex gap-3">

            <button
              onClick={
                nuevoUsuario
              }
              className="
                rounded-lg
                bg-cyan-400
                px-5
                py-3
                font-bold
                text-[#06202e]
              "
            >
              + Agregar usuario
            </button>

          </div>

        </div>


        {/* BUSCADOR */}

        <input
          type="text"
          placeholder="
            Buscar por nombre, correo o documento...
          "
          value={
            busqueda
          }
          onChange={
            e =>
              setBusqueda(
                e.target.value
              )
          }
          className="
            mb-8
            w-full
            rounded-xl
            border
            border-borde
            bg-fondo
            p-4
            text-texto
            outline-none
            focus:border-cyan-400
          "
        />


        {/* USUARIOS */}

        {cargando ? (

          <p className="text-center text-texto">
            Cargando usuarios...
          </p>

        ) : (

          <>

          <div className="space-y-4">

            {usuariosFiltrados
              .slice(inicio, fin)
              .map(
              usuario => (

                <article
                  key={
                    usuario.id
                  }

                  className="
                    rounded-2xl
                    border
                    border-borde
                    bg-superficie
                    p-5
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    <div>

                      <h2
                        className="
                          text-xl
                          font-bold
                          text-texto
                        "
                      >
                        {usuario.nombre}
                        {" "}
                        {usuario.apellido}
                      </h2>


                      <p
                        className="
                          mt-1
                          text-texto-tenue
                        "
                      >
                        {usuario.correo}
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
                        {usuario.numeroDocumento}
                      </p>

                    </div>


                    <div>

                      <span
                        className="
                          rounded-full
                          bg-blue-500/20
                          px-4
                          py-2
                          text-sm
                          font-bold
                          text-blue-400
                        "
                      >
                        {usuario.rol?.nombre}
                      </span>


                      <span
                        className={`
                          ml-2
                          rounded-full
                          px-4
                          py-2
                          text-sm
                          font-bold
                          ${
                            usuario.estado
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        `}
                      >
                        {usuario.estado
                          ? "Activo"
                          : "Inactivo"}
                      </span>

                    </div>


                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          editarUsuario(
                            usuario
                          )
                        }
                        className="
                          rounded-lg
                          bg-blue-500
                          px-4
                          py-2
                          font-bold
                          text-white
                        "
                      >
                        ✏️ Editar
                      </button>


                      <button
                        onClick={() =>
                          cambiarEstado(
                            usuario
                          )
                        }
                        className="
                          rounded-lg
                          bg-yellow-500
                          px-4
                          py-2
                          font-bold
                          text-[#06202e]
                        "
                      >
                        {usuario.estado
                          ? "🚫 Desactivar"
                          : "✅ Activar"}
                      </button>


                      <button
                        onClick={() =>
                          eliminarUsuario(
                            usuario
                          )
                        }
                        className="
                          rounded-lg
                          bg-red-500
                          px-4
                          py-2
                          font-bold
                          text-white
                        "
                      >
                        🗑️ Eliminar
                      </button>

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


      {/* MODAL USUARIO */}

    {/* =====================================================
    MODAL AGREGAR / EDITAR USUARIO
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
  >

    <div
      className="
        relative
        w-full
        max-w-3xl
        max-h-[90vh]
        overflow-y-auto
        rounded-2xl
        bg-fondo
        p-6
        shadow-2xl
      "
    >

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >

        <h2
          className="
            text-3xl
            font-bold
            text-texto
          "
        >
          ➕{" "}
          {usuarioEditar
            ? "Editar usuario"
            : "Agregar usuario"}
        </h2>


        {/* BOTÓN CERRAR */}

        <button
          type="button"
          onClick={() =>
            setMostrarFormulario(false)
          }
          className="
            text-3xl
            font-light
            text-texto-tenue
            transition
            hover:text-cyan-400
          "
        >
          ✕
        </button>

      </div>


      {/* =================================================
          FORMULARIO
      ================================================= */}

      <form
        onSubmit={guardarUsuario}
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        "
      >

        {/* =================================================
            NOMBRE
        ================================================= */}

        <div>

          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={cambiarCampo}
            placeholder="Nombre"
            maxLength={30}
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            APELLIDO
        ================================================= */}

        <div>

          <input
            type="text"
            name="apellido"
            value={formulario.apellido}
            onChange={cambiarCampo}
            placeholder="Apellido"
            maxLength={30}
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            TIPO DOCUMENTO
        ================================================= */}

        <div>

          <select
            name="tipoDocumento"
            value={formulario.tipoDocumento}
            onChange={cambiarCampo}
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          >

            <option value="">
              Selecciona tipo de documento
            </option>

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


        {/* =================================================
            NÚMERO DOCUMENTO
        ================================================= */}

        <div>

          <input
            type="text"
            name="numeroDocumento"
            value={formulario.numeroDocumento}
            onChange={cambiarCampo}
            placeholder="Número de documento"
            maxLength={15}
            inputMode="numeric"
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            TELÉFONO
        ================================================= */}

        <div>

          <input
            type="tel"
            name="telefono"
            value={formulario.telefono}
            onChange={cambiarCampo}
            placeholder="Teléfono"
            maxLength={15}
            inputMode="numeric"
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            CORREO
        ================================================= */}

        <div>

          <input
            type="email"
            name="correo"
            value={formulario.correo}
            onChange={cambiarCampo}
            placeholder="Correo electrónico"
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            DIRECCIÓN
        ================================================= */}

        <div>

          <input
            type="text"
            name="direccion"
            value={formulario.direccion}
            onChange={cambiarCampo}
            placeholder="Dirección"
            maxLength={100}
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            CONTRASEÑA
        ================================================= */}

        <div>

          <input
            type="password"
            name="password"
            value={formulario.password}
            onChange={cambiarCampo}
            placeholder={
              usuarioEditar
                ? "Nueva contraseña (opcional)"
                : "Contraseña"
            }
            required={!usuarioEditar}
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              placeholder-gray-400
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
            "
          />

        </div>


        {/* =================================================
            ROL
        ================================================= */}

        <div className="md:col-span-2">

          <select
            name="rol"
            value={formulario.rol}
            onChange={cambiarCampo}
            required
            className="
              w-full
              rounded-xl
              border
              border-borde
              bg-superficie-2
              px-4
              py-4
              text-base
              text-texto
              outline-none
              transition
              focus:border-cyan-400
              focus:ring-2
              focus:ring-cyan-400/20
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


        {/* =================================================
            ESTADO
        ================================================= */}

        {usuarioEditar && (

          <div className="md:col-span-2">

            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                border
                border-borde
                bg-superficie-2
                px-4
                py-4
                text-texto
              "
            >

              <input
                type="checkbox"
                name="estado"
                checked={formulario.estado}
                onChange={(e) =>
                  setFormulario((anterior) => ({
                    ...anterior,
                    estado: e.target.checked
                  }))
                }
                className="
                  h-5
                  w-5
                  accent-cyan-400
                "
              />

              <span className="font-semibold">
                Usuario activo
              </span>

            </label>

          </div>

        )}


        {/* =================================================
            BOTONES
        ================================================= */}

        <div
          className="
            mt-3
            flex
            gap-4
            md:col-span-2
          "
        >

          {/* CANCELAR */}

          <button
            type="button"
            onClick={() =>
              setMostrarFormulario(false)
            }
            className="
              flex-1
              rounded-xl
              border
              border-borde
              px-4
              py-4
              text-lg
              font-bold
              text-texto-suave
              transition
              hover:bg-superficie-2
              hover:text-texto
            "
          >
            Cancelar
          </button>


          {/* GUARDAR */}

          <button
            type="submit"
            className="
              flex-1
              rounded-xl
              bg-cyan-400
              px-4
              py-4
              text-lg
              font-bold
              text-[#06202e]
              transition
              hover:bg-cyan-300
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {usuarioEditar
              ? "Guardar cambios"
              : "Guardar"}
          </button>

        </div>

      </form>

    </div>

  </div>

)}

    {/* TARJETA DE NOTIFICACIÓN */}
      {notificacion && (
        <TarjetaNotificacion
          abierto={!!notificacion}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          emoji={notificacion.emoji}
          onCerrar={() => setNotificacion(null)}
        />
      )}

      {/* TARJETA DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <TarjetaConfirmacion
        abierto={!!confirmarEliminar}
        titulo="¿Eliminar usuario?"
        mensaje={confirmarEliminar
          ? `¿Seguro que quieres eliminar a ${confirmarEliminar.nombre} ${confirmarEliminar.apellido}?`
          : ""}
        confirmarTexto="Confirmar"
        cancelarTexto="Cancelar"
        onConfirmar={confirmarEliminarUsuario}
        onCancelar={() => setConfirmarEliminar(null)}
      />

      {/* TARJETA: DEBES DESACTIVAR ANTES DE ELIMINAR */}
      <TarjetaConfirmacion
        abierto={!!avisoDesactivar}
        titulo="Desactiva primero"
        mensaje={avisoDesactivar
          ? `Debes desactivar a ${avisoDesactivar.nombre} ${avisoDesactivar.apellido} antes de eliminarlo.`
          : ""}
        confirmarTexto="Desactivar"
        cancelarTexto="Cancelar"
        onConfirmar={desactivarYPreguntarEliminar}
        onCancelar={() => setAvisoDesactivar(null)}
      />

    </section>

  );

}


export default AdminUsuarios;