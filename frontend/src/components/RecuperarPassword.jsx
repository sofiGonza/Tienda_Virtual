import { useState } from "react";
import API_URL from "../Services/api";

function RecuperarPassword({
  abierto,
  cerrar
}) {

  const [paso, setPaso] =
    useState(1);

  const [correo, setCorreo] =
    useState("");

  const [codigo, setCodigo] =
    useState("");

  const [nuevaPassword, setNuevaPassword] =
    useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);


  // =====================================================
  // CERRAR Y LIMPIAR
  // =====================================================

  const cerrarModal = () => {

    setPaso(1);

    setCorreo("");

    setCodigo("");

    setNuevaPassword("");

    setConfirmarPassword("");

    setMensaje("");

    setError("");

    cerrar();

  };


  // =====================================================
  // SOLICITAR CÓDIGO
  // =====================================================

  const solicitarCodigo = async (e) => {

    e.preventDefault();

    setError("");

    setMensaje("");


    if (!correo.trim()) {

      setError(
        "Ingresa tu correo electrónico."
      );

      return;

    }


    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!correoValido.test(correo)) {

      setError(
        "Ingresa un correo electrónico válido."
      );

      return;

    }


    setCargando(true);


    try {

      const respuesta =
        await fetch(
          `${API_URL}/auth/forgot-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              correo:
                correo.trim()
            })

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudo solicitar el código."
        );

      }


      setMensaje(
        "Si el correo existe, recibirás un código de recuperación. " +
        "Revisa tu bandeja de entrada y la carpeta de spam."
      );

      setPaso(2);


    } catch (error) {

      console.error(
        error
      );

      setError(
        error.message
      );

    } finally {

      setCargando(false);

    }

  };


  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================

  const cambiarPassword = async (e) => {

    e.preventDefault();

    setError("");

    setMensaje("");


    if (!codigo.trim()) {

      setError(
        "Ingresa el código de recuperación."
      );

      return;

    }


    if (!/^\d{6}$/.test(codigo)) {

      setError(
        "El código debe tener 6 números."
      );

      return;

    }


    const tieneMayuscula =
      /[A-Z]/.test(
        nuevaPassword
      );

    const tieneEspecial =
      /[^A-Za-z0-9]/.test(
        nuevaPassword
      );

    const longitudCorrecta =
      nuevaPassword.length >= 6 &&
      nuevaPassword.length <= 10;


    if (!longitudCorrecta) {

      setError(
        "La contraseña debe tener entre 6 y 10 caracteres."
      );

      return;

    }


    if (!tieneMayuscula) {

      setError(
        "La contraseña debe contener una mayúscula."
      );

      return;

    }


    if (!tieneEspecial) {

      setError(
        "La contraseña debe contener un carácter especial."
      );

      return;

    }


    if (
      nuevaPassword !==
      confirmarPassword
    ) {

      setError(
        "Las contraseñas no coinciden."
      );

      return;

    }


    setCargando(true);


    try {

      const respuesta =
        await fetch(
          `${API_URL}/auth/reset-password`,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                correo:
                  correo.trim(),

                codigo:
                  codigo.trim(),

                nuevaPassword

              })

          }
        );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        throw new Error(
          datos.detail ||
          "No se pudo cambiar la contraseña."
        );

      }


      setMensaje(
        "✅ Contraseña actualizada correctamente."
      );


      setTimeout(() => {

        cerrarModal();

      }, 1800);


    } catch (error) {

      console.error(
        error
      );

      setError(
        error.message
      );

    } finally {

      setCargando(false);

    }

  };


  if (!abierto) {

    return null;

  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[4000]
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
          max-w-md
          rounded-2xl
          bg-[#111827]
          p-7
          shadow-2xl
        "
      >

        {/* CERRAR */}

        <button
          type="button"
          onClick={cerrarModal}
          className="
            absolute
            right-5
            top-4
            text-2xl
            text-gray-400
            hover:text-cyan-400
          "
        >
          ✕
        </button>


        {/* TÍTULO */}

        <div className="mb-7 text-center">

          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-cyan-400/10
              text-3xl
            "
          >
            🔐
          </div>

          <h2
            className="
              text-2xl
              font-bold
              text-white
            "
          >
            Recuperar contraseña
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-400
            "
          >
            {paso === 1
              ? "Ingresa tu correo para recibir un código."
              : "Ingresa el código y crea tu nueva contraseña."
            }
          </p>

        </div>


        {/* MENSAJE */}

        {mensaje && (

          <div
            className="
              mb-5
              rounded-lg
              border
              border-green-500/40
              bg-green-500/10
              p-3
              text-center
              text-sm
              text-green-400
            "
          >
            {mensaje}
          </div>

        )}


        {/* ERROR */}

        {error && (

          <div
            className="
              mb-5
              rounded-lg
              border
              border-red-500/40
              bg-red-500/10
              p-3
              text-center
              text-sm
              text-red-400
            "
          >
            {error}
          </div>

        )}


        {/* =================================================
            PASO 1
        ================================================= */}

        {paso === 1 && (

          <form
            onSubmit={
              solicitarCodigo
            }
            className="space-y-5"
          >

            <div>

              <label
                className="
                  mb-2
                  block
                  font-semibold
                  text-gray-200
                "
              >
                Correo electrónico
              </label>

              <input
                type="email"
                value={correo}
                onChange={(e) => {

                  setCorreo(
                    e.target.value
                  );

                  setError("");

                }}
                placeholder="correo@ejemplo.com"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-[#1f2937]
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-cyan-400
                "
              />

            </div>


            <button
              type="submit"
              disabled={cargando}
              className="
                w-full
                rounded-lg
                bg-cyan-400
                px-4
                py-3
                font-bold
                text-[#111827]
                hover:bg-cyan-300
                disabled:opacity-50
              "
            >
              {cargando
                ? "Enviando..."
                : "Enviar código"
              }
            </button>

          </form>

        )}


        {/* =================================================
            PASO 2
        ================================================= */}

        {paso === 2 && (

          <form
            onSubmit={
              cambiarPassword
            }
            className="space-y-5"
          >

            {/* CÓDIGO */}

            <div>

              <label
                className="
                  mb-2
                  block
                  font-semibold
                  text-gray-200
                "
              >
                Código de recuperación
              </label>

              <input
                type="text"
                value={codigo}
                maxLength={6}
                inputMode="numeric"
                onChange={(e) => {

                  setCodigo(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  );

                  setError("");

                }}
                placeholder="123456"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-[#1f2937]
                  px-4
                  py-3
                  text-center
                  text-xl
                  tracking-[0.5em]
                  text-white
                  outline-none
                  focus:border-cyan-400
                "
              />

            </div>


            {/* NUEVA CONTRASEÑA */}

            <div>

              <label
                className="
                  mb-2
                  block
                  font-semibold
                  text-gray-200
                "
              >
                Nueva contraseña
              </label>

              <input
                type="password"
                value={
                  nuevaPassword
                }
                onChange={(e) => {

                  setNuevaPassword(
                    e.target.value
                  );

                  setError("");

                }}
                placeholder="Nueva contraseña"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-[#1f2937]
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-cyan-400
                "
              />

              <p
                className="
                  mt-2
                  text-xs
                  text-gray-500
                "
              >
                6-10 caracteres, una mayúscula
                y un carácter especial.
              </p>

            </div>


            {/* CONFIRMAR */}

            <div>

              <label
                className="
                  mb-2
                  block
                  font-semibold
                  text-gray-200
                "
              >
                Confirmar contraseña
              </label>

              <input
                type="password"
                value={
                  confirmarPassword
                }
                onChange={(e) => {

                  setConfirmarPassword(
                    e.target.value
                  );

                  setError("");

                }}
                placeholder="Repite la contraseña"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-600
                  bg-[#1f2937]
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-cyan-400
                "
              />

            </div>


            <button
              type="submit"
              disabled={cargando}
              className="
                w-full
                rounded-lg
                bg-cyan-400
                px-4
                py-3
                font-bold
                text-[#111827]
                hover:bg-cyan-300
                disabled:opacity-50
              "
            >
              {cargando
                ? "Actualizando..."
                : "Cambiar contraseña"
              }
            </button>


            <button
              type="button"
              onClick={() => {

                setPaso(1);

                setCodigo("");

                setNuevaPassword("");

                setConfirmarPassword("");

                setError("");

                setMensaje("");

              }}
              className="
                w-full
                text-sm
                text-cyan-400
                hover:text-cyan-300
              "
            >
              ← Cambiar correo
            </button>

          </form>

        )}

      </div>

    </div>

  );

}

export default RecuperarPassword;