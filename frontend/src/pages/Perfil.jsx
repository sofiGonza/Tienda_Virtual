import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerSesion,
  cerrarSesion
} from "../Services/AuthService";

import API_URL from "../Services/api";


function Perfil() {

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);

  const [passwordActual, setPasswordActual] =
    useState("");

  const [passwordNueva, setPasswordNueva] =
    useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  const [cargandoPassword, setCargandoPassword] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [errorPassword, setErrorPassword] =
    useState("");


  // ==========================================
  // CARGAR USUARIO
  // ==========================================

  useEffect(() => {

    const sesion = obtenerSesion();

    if (!sesion) {

      navigate("/");

      return;

    }

    setUsuario(sesion);

  }, [navigate]);


  // ==========================================
  // CERRAR SESIÓN (MUESTRA EL LOGIN INMEDIATAMENTE)
  // ==========================================

  const manejarCerrarSesion = () => {

    cerrarSesion();

    setUsuario(null);

    // Redirige al inicio indicando que debe mostrarse el modal de login
    navigate("/", { state: { abrirLogin: true } });

  };


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  const cambiarPassword = async (e) => {

    e.preventDefault();

    setMensaje("");
    setErrorPassword("");


    // ==========================================
    // VALIDAR CAMPOS
    // ==========================================

    if (
      !passwordActual ||
      !passwordNueva ||
      !confirmarPassword
    ) {

      setErrorPassword(
        "Todos los campos son obligatorios."
      );

      return;

    }


    // ==========================================
    // CONFIRMAR CONTRASEÑA
    // ==========================================

    if (
      passwordNueva !== confirmarPassword
    ) {

      setErrorPassword(
        "Las nuevas contraseñas no coinciden."
      );

      return;

    }


    // ==========================================
    // VALIDAR LONGITUD
    // ==========================================

    if (passwordNueva.length < 6) {

      setErrorPassword(
        "La nueva contraseña debe tener mínimo 6 caracteres."
      );

      return;

    }


    // ==========================================
    // MAYÚSCULA
    // ==========================================

    if (!/[A-Z]/.test(passwordNueva)) {

      setErrorPassword(
        "La nueva contraseña debe contener al menos una mayúscula."
      );

      return;

    }


    // ==========================================
    // CARÁCTER ESPECIAL
    // ==========================================

    if (
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=;']/.test(
        passwordNueva
      )
    ) {

      setErrorPassword(
        "La nueva contraseña debe contener al menos un carácter especial."
      );

      return;

    }


    try {

      setCargandoPassword(true);


      const sesion = obtenerSesion();


      const respuesta = await fetch(
        `${API_URL}/usuarios/${usuario.id}/password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${sesion.token}`
          },

          body: JSON.stringify({

            passwordActual,

            passwordNueva

          })

        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudo cambiar la contraseña"
        );

      }


      // ==========================================
      // ÉXITO
      // ==========================================

      setMensaje(
        "Contraseña actualizada correctamente."
      );


      setPasswordActual("");
      setPasswordNueva("");
      setConfirmarPassword("");


    } catch (error) {

      console.error(
        "Error cambiando contraseña:",
        error
      );

      setErrorPassword(
        error.message
      );


    } finally {

      setCargandoPassword(false);

    }

  };


  // ==========================================
  // CARGANDO
  // ==========================================

  if (!usuario) {

    return (

      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
          bg-gray-950
          text-white
        "
      >

        <p>
          Cargando perfil...
        </p>

      </div>

    );

  }


  // ==========================================
  // PERFIL
  // ==========================================

  return (

    <section
      className="
        min-h-screen
        bg-gray-950
        px-6
        py-16
      "
    >

      <div
        className="
          mx-auto
          max-w-4xl
        "
      >

        {/* ENCABEZADO */}

        <div
          className="
            mb-10
            text-center
          "
        >

          <div
            className="
              mx-auto
              mb-5
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-cyan-400/10
              text-5xl
              shadow-[0_0_30px_rgba(34,211,238,0.15)]
            "
          >
            👤
          </div>


          <h1
            className="
              text-4xl
              font-bold
              text-white
            "
          >
            Mi Perfil
          </h1>


          <p
            className="
              mt-2
              text-gray-400
            "
          >
            Administra la información de tu cuenta
          </p>

        </div>


        {/* DATOS PERSONALES */}

        <div
          className="
            mb-8
            rounded-2xl
            border
            border-gray-700
            bg-[#1b2740e0]
            p-8
            shadow-xl
          "
        >

          <div
            className="
              mb-8
              border-b
              border-gray-700
              pb-5
            "
          >

            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-widest
                text-cyan-400
              "
            >
              Mi cuenta
            </p>


            <h2
              className="
                mt-1
                text-2xl
                font-bold
                text-white
              "
            >
              Datos personales
            </h2>

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
            "
          >

            {/* NOMBRE */}

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-400
                "
              >
                Nombre completo
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {usuario.nombre} {usuario.apellido}
              </p>

            </div>


            {/* TIPO DOCUMENTO */}

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-400
                "
              >
                Tipo de documento
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {usuario.tipoDocumento || "No disponible"}
              </p>

            </div>


            {/* DOCUMENTO */}

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-400
                "
              >
                Número de documento
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {usuario.numeroDocumento || "No disponible"}
              </p>

            </div>


            {/* CORREO */}

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-400
                "
              >
                Correo electrónico
              </p>

              <p
                className="
                  mt-1
                  break-all
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {usuario.correo}
              </p>

            </div>


            {/* ROL */}

            <div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-400
                "
              >
                Rol
              </p>

              <span
                className="
                  mt-2
                  inline-block
                  rounded-full
                  bg-cyan-400/10
                  px-4
                  py-2
                  font-semibold
                  capitalize
                  text-cyan-400
                "
              >
                {usuario.rol}
              </span>

            </div>

          </div>

        </div>


        {/* CAMBIAR CONTRASEÑA */}

        <div
          className="
            mb-8
            rounded-2xl
            border
            border-gray-700
            bg-[#1b2740e0]
            p-8
            shadow-xl
          "
        >

          <div
            className="
              mb-6
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
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
                Seguridad
              </p>


              <h2
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Cambiar contraseña
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-gray-400
                "
              >
                Actualiza la contraseña de tu cuenta.
              </p>

            </div>


            <span
              className="
                text-3xl
              "
            >
              🔐
            </span>

          </div>


          {/* MENSAJE DE ÉXITO */}

          {mensaje && (

            <div
              className="
                mb-5
                rounded-lg
                border
                border-green-500/40
                bg-green-500/10
                p-4
                text-green-400
              "
            >
              ✅ {mensaje}
            </div>

          )}


          {/* MENSAJE DE ERROR */}

          {errorPassword && (

            <div
              className="
                mb-5
                rounded-lg
                border
                border-red-500/40
                bg-red-500/10
                p-4
                text-red-400
              "
            >
              ⚠️ {errorPassword}
            </div>

          )}


          <form
            onSubmit={cambiarPassword}
            className="
              space-y-5
            "
          >

            {/* CONTRASEÑA ACTUAL */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-300
                "
              >
                Contraseña actual
              </label>

              <input
                type="password"
                value={passwordActual}
                onChange={(e) =>
                  setPasswordActual(
                    e.target.value
                  )
                }
                placeholder="Ingresa tu contraseña actual"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-gray-900
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                  focus:ring-2
                  focus:ring-cyan-400/20
                "
              />

            </div>


            {/* NUEVA CONTRASEÑA */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-300
                "
              >
                Nueva contraseña
              </label>

              <input
                type="password"
                value={passwordNueva}
                onChange={(e) =>
                  setPasswordNueva(
                    e.target.value
                  )
                }
                placeholder="Ingresa tu nueva contraseña"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-gray-900
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                  focus:ring-2
                  focus:ring-cyan-400/20
                "
              />

            </div>


            {/* CONFIRMAR */}

            <div>

              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-gray-300
                "
              >
                Confirmar nueva contraseña
              </label>

              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) =>
                  setConfirmarPassword(
                    e.target.value
                  )
                }
                placeholder="Repite tu nueva contraseña"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-gray-900
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400
                  focus:ring-2
                  focus:ring-cyan-400/20
                "
              />

            </div>


            {/* REQUISITOS */}

            <div
              className="
                rounded-xl
                border
                border-gray-700
                bg-gray-900/60
                p-4
              "
            >

              <p
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-gray-300
                "
              >
                La nueva contraseña debe tener:
              </p>

              <ul
                className="
                  space-y-1
                  text-sm
                  text-gray-400
                "
              >

                <li>
                  {passwordNueva.length >= 6
                    ? "✅"
                    : "○"}{" "}
                  Mínimo 6 caracteres
                </li>

                <li>
                  {/[A-Z]/.test(passwordNueva)
                    ? "✅"
                    : "○"}{" "}
                  Una letra mayúscula
                </li>

                <li>
                  {/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=;']/.test(passwordNueva)
                    ? "✅"
                    : "○"}{" "}
                  Un carácter especial
                </li>

                <li>
                  {passwordNueva &&
                  confirmarPassword &&
                  passwordNueva === confirmarPassword
                    ? "✅"
                    : "○"}{" "}
                  Las contraseñas coinciden
                </li>

              </ul>

            </div>


            {/* BOTÓN */}

            <button
              type="submit"
              disabled={cargandoPassword}
              className="
                w-full
                rounded-lg
                bg-cyan-400
                px-5
                py-3
                font-bold
                text-gray-900
                transition
                hover:bg-cyan-300
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {cargandoPassword
                ? "Actualizando..."
                : "🔐 Cambiar contraseña"}

            </button>

          </form>

        </div>


        {/* IR AL PANEL */}

        <button
          onClick={() => navigate("/panel")}
          className="
            w-full
            rounded-xl
            bg-cyan-400
            px-5
            py-4
            font-bold
            text-gray-900
            transition
            hover:bg-cyan-300
          "
        >
          📊 Ir a mi Panel
        </button>


        {/* CERRAR SESIÓN */}

        <button
          onClick={manejarCerrarSesion}
          className="
            mt-4
            w-full
            rounded-xl
            border
            border-red-500/50
            bg-red-500/10
            px-5
            py-4
            font-bold
            text-red-400
            transition
            hover:bg-red-500/20
          "
        >
          🚪 Cerrar sesión
        </button>

      </div>

    </section>

  );

}


export default Perfil;