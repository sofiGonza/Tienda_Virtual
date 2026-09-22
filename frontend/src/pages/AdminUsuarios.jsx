import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Paginador, { usePaginacion } from "../components/panel/Paginador";

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

      alert(
        error.message
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

        throw new Error(
          datos.detail ||
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


      alert(
        usuarioEditar
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );


      setMostrarFormulario(
        false
      );


      cargarUsuarios();


    } catch (error) {

      console.error(
        error
      );

      alert(
        error.message
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

      alert(
        error.message
      );

    }

  };


  // =====================================================
  // ELIMINAR
  // =====================================================

  const eliminarUsuario = async (
    usuario
  ) => {

    if (
      !window.confirm(
        `¿Eliminar a ${usuario.nombre} ${usuario.apellido}?`
      )
    ) {

      return;

    }


    try {

      const token =
        obtenerTokenAdmin();


      if (!token) {
        return;
      }


      const respuesta =
        await fetch(

          `${API_URL}/usuarios/${usuario.id}`,

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


      alert(
        "Usuario eliminado correctamente"
      );


      cargarUsuarios();


    } catch (error) {

      alert(
        error.message
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
        bg-gray-950
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
                text-white
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
                text-gray-900
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
            border-gray-700
            bg-[#111827]
            p-4
            text-white
            outline-none
            focus:border-cyan-400
          "
        />


        {/* USUARIOS */}

        {cargando ? (

          <p className="text-center text-white">
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
                    border-gray-700
                    bg-[#1b2740e0]
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
                          text-white
                        "
                      >
                        {usuario.nombre}
                        {" "}
                        {usuario.apellido}
                      </h2>


                      <p
                        className="
                          mt-1
                          text-gray-400
                        "
                      >
                        {usuario.correo}
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
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
                          text-gray-900
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
        bg-[#111827]
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
            text-white
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
            text-gray-400
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
              border-gray-700
              bg-[#1f2937]
              px-4
              py-4
              text-base
              text-white
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
                border-gray-700
                bg-[#1f2937]
                px-4
                py-4
                text-white
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
              border-gray-600
              px-4
              py-4
              text-lg
              font-bold
              text-gray-300
              transition
              hover:bg-gray-800
              hover:text-white
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
              text-gray-900
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

    </section>

  );

}


export default AdminUsuarios;