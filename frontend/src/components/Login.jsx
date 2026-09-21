
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../img/logo/logoPixel.png";
import RecuperarPassword from "./RecuperarPassword";
import API_URL from "../Services/api";

function Login({ abierto, cerrar }) {
  const navigate = useNavigate();

  // ==========================================
  // ESTADO: LOGIN / REGISTRO
  // ==========================================

  const [modo, setModo] = useState("login");

  // ==========================================
  // MODAL RECUPERAR CONTRASEÑA
  // ==========================================

  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);

  // ==========================================
  // ESTADO DEL FORMULARIO
  // ==========================================

  const formularioInicial = {
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    correo: "",
    password: "",
    confirmarPassword: "",
    rol: "cliente",
  };

  const [formulario, setFormulario] = useState(formularioInicial);

  // ==========================================
  // ESTADO DE MENSAJES
  // ==========================================

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // ==========================================
  // CAMBIAR DATOS
  // ==========================================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMensaje("");
    setError("");
  };

  // ==========================================
  // VALIDACIÓN CORREO
  // ==========================================

  const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  // ==========================================
  // VALIDACIÓN PASSWORD
  // ==========================================

  const validarPassword = (password) => {
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneEspecial = /[^A-Za-z0-9]/.test(password);

    const tieneLongitud =
      password.length >= 6 && password.length <= 10;

    return {
      tieneMayuscula,
      tieneEspecial,
      tieneLongitud,
    };
  };

  // ==========================================
  // VALIDACIONES LOGIN
  // ==========================================

  const validarCorreoLogin = () => {
    if (!formulario.correo) {
      return "Ingresa tu correo electrónico.";
    }

    if (!validarCorreo(formulario.correo)) {
      return "Ingresa un correo electrónico válido.";
    }

    return "";
  };

  const validarPasswordLogin = () => {
    if (!formulario.password) {
      return "Ingresa tu contraseña.";
    }

    return "";
  };

  // ==========================================
  // VALIDACIONES REGISTRO
  // ==========================================

  const obtenerErroresRegistro = () => {
    const errores = {};

    // NOMBRE
    if (!formulario.nombre.trim()) {
      errores.nombre = "Ingresa tu nombre.";
    } else if (formulario.nombre.length > 30) {
      errores.nombre =
        "El nombre no puede tener más de 30 caracteres.";
    }

    // APELLIDO
    if (!formulario.apellido.trim()) {
      errores.apellido = "Ingresa tu apellido.";
    } else if (formulario.apellido.length > 30) {
      errores.apellido =
        "El apellido no puede tener más de 30 caracteres.";
    }

    // TIPO DOCUMENTO
    if (!formulario.tipoDocumento) {
      errores.tipoDocumento =
        "Selecciona el tipo de documento.";
    }

    // NÚMERO DOCUMENTO
    if (!formulario.numeroDocumento) {
      errores.numeroDocumento =
        "Ingresa tu número de documento.";
    } else if (!/^\d+$/.test(formulario.numeroDocumento)) {
      errores.numeroDocumento =
        "Solo debe contener números.";
    } else if (
      formulario.numeroDocumento.length < 10 ||
      formulario.numeroDocumento.length > 15
    ) {
      errores.numeroDocumento =
        "Debe tener entre 10 y 15 números.";
    }

    // DIRECCIÓN
    if (!formulario.direccion.trim()) {
      errores.direccion = "Ingresa tu dirección.";
    } else if (formulario.direccion.length > 30 && direccion.length <6) {
      errores.direccion =
        "La dirección no puede tener más de 30 caracteres.";
    }

    // TELÉFONO
    if (!formulario.telefono) {
      errores.telefono =
        "Ingresa tu número de teléfono.";
    } else if (!/^\d+$/.test(formulario.telefono)) {
      errores.telefono =
        "Solo debe contener números.";
    } else if (
      formulario.telefono.length < 7 ||
      formulario.telefono.length > 15
    ) {
      errores.telefono =
        "Debe tener entre 7 y 15 números.";
    }

    // CORREO
    if (!formulario.correo) {
      errores.correo =
        "Ingresa tu correo electrónico.";
    } else if (!validarCorreo(formulario.correo)) {
      errores.correo =
        "Ingresa un correo electrónico válido.";
    }

    // CONTRASEÑA
    const password = validarPassword(formulario.password);

    if (!formulario.password) {
      errores.password =
        "Ingresa una contraseña.";
    } else if (!password.tieneLongitud) {
      errores.password =
        "Debe tener entre 6 y 10 caracteres.";
    } else if (!password.tieneMayuscula) {
      errores.password =
        "Debe contener al menos una mayúscula.";
    } else if (!password.tieneEspecial) {
      errores.password =
        "Debe contener al menos un carácter especial.";
    }

    // CONFIRMAR PASSWORD
    if (!formulario.confirmarPassword) {
      errores.confirmarPassword =
        "Confirma tu contraseña.";
    } else if (
      formulario.password !==
      formulario.confirmarPassword
    ) {
      errores.confirmarPassword =
        "Las contraseñas no coinciden.";
    }

    return errores;
  };

  // ==========================================
  // REGISTRAR USUARIO
  // ==========================================

  const registrarUsuario = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    const errores = obtenerErroresRegistro();

    if (Object.keys(errores).length > 0) {
      setError(
        "Corrige los campos marcados antes de continuar."
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/usuarios/registro`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nombre: formulario.nombre.trim(),
            apellido: formulario.apellido.trim(),
            tipo_documento: formulario.tipoDocumento,
            numero_documento: formulario.numeroDocumento,
            direccion: formulario.direccion.trim(),
            telefono: formulario.telefono,
            correo: formulario.correo.trim(),
            password: formulario.password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(
          datos.detail ||
            "No fue posible registrar el usuario."
        );
        return;
      }

      setMensaje(
        "✅ ¡Registro exitoso! Ahora puedes iniciar sesión."
      );

      setFormulario(formularioInicial);

      setTimeout(() => {
        setModo("login");
        setMensaje("");
      }, 1500);
    } catch (error) {
      console.error(error);

      setError(
        "❌ No se pudo conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    const errorCorreo = validarCorreoLogin();
    const errorPassword = validarPasswordLogin();

    if (errorCorreo || errorPassword) {
      setError("Corrige los campos marcados.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            correo: formulario.correo.trim(),
            password: formulario.password,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(
          datos.detail ||
            "Correo o contraseña incorrectos."
        );
        return;
      }

      // GUARDAR SESIÓN (access_token de FastAPI)

      localStorage.setItem("token", datos.access_token);

      localStorage.setItem(
        "usuario",
        JSON.stringify(datos.usuario)
      );

      setMensaje(
        `✅ Bienvenido/a ${datos.usuario.nombre}`
      );

      setFormulario(formularioInicial);

      setTimeout(() => {
        cerrar();
        setMensaje("");
        navigate("/panel");
      }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        "❌ No se pudo conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // CAMBIAR LOGIN / REGISTRO
  // ==========================================

  const cambiarModo = () => {
    setModo(
      modo === "login" ? "registro" : "login"
    );

    setError("");
    setMensaje("");
    setFormulario(formularioInicial);
  };

  // ==========================================
  // NO MOSTRAR
  // ==========================================

  if (!abierto) {
    return null;
  }

  // ==========================================
  // CLASE DINÁMICA DE INPUT
  // ==========================================

  const claseInput = (campo, valido) => {
    if (!formulario[campo]) {
      return `
        w-full
        rounded-lg
        border
        border-gray-600
        bg-[#1f2937]
        px-4
        py-3
        text-white
        outline-none
        transition
        focus:border-cyan-400
      `;
    }

    return `
      w-full
      rounded-lg
      border
      ${valido ? "border-green-500" : "border-red-500"}
      bg-[#1f2937]
      px-4
      py-3
      text-white
      outline-none
      transition
      focus:ring-1
      ${
        valido
          ? "focus:ring-green-500"
          : "focus:ring-red-500"
      }
    `;
  };

  // ==========================================
  // VARIABLES DE VALIDACIÓN
  // ==========================================

  const LIMITES = {
    nombre: 30,
    apellido: 30,
    numeroDocumento: 15,
    direccion: 30,
    telefono: 15,
    correo: 150,
    password: 10,
    confirmarPassword: 10,
  };

  const contador = (campo) => {
    const valor = formulario[campo] || "";
    const max = LIMITES[campo] || 0;
    return `${valor.length}/${max}`;
  };

  const passwordValidacion = validarPassword(
    formulario.password
  );

  const nombreValido =
    formulario.nombre.trim() !== "" &&
    formulario.nombre.length <= 30;

  const apellidoValido =
    formulario.apellido.trim() !== "" &&
    formulario.apellido.length <= 30;

  const documentoValido =
    /^\d+$/.test(formulario.numeroDocumento) &&
    formulario.numeroDocumento.length >= 10 &&
    formulario.numeroDocumento.length <= 15;

  const direccionValida =
    formulario.direccion.trim() !== "" &&
    formulario.direccion.length <= 30 &&
     formulario.direccion.length >=7 ;

  const telefonoValido =
    /^\d+$/.test(formulario.telefono) &&
    formulario.telefono.length >= 7 &&
    formulario.telefono.length <= 15;

  const passwordValida =
    passwordValidacion.tieneLongitud &&
    passwordValidacion.tieneMayuscula &&
    passwordValidacion.tieneEspecial;

  const confirmarPasswordValida =
    formulario.confirmarPassword !== "" &&
    formulario.password === formulario.confirmarPassword;

  // ==========================================
  // JSX
  // ==========================================

  return (
    <>
      {/* MODAL LOGIN / REGISTRO */}

      <div
        className="
          fixed
          inset-0
          z-[2000]
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
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            bg-[#111827]
            p-8
            shadow-2xl
          "
        >
          {/* CERRAR */}

          <button
            type="button"
            onClick={cerrar}
            className="
              absolute
              right-5
              top-4
              text-2xl
              text-gray-400
              transition
              hover:text-cyan-400
            "
          >
            ✕
          </button>

          {/* LOGO */}

          <div className="mb-5 text-center">
            <div className="mb-6 flex justify-center">
              <img
                src={logo}
                alt="Logo Pixel Store"
                className="
                  h-24
                  w-30
                  object-contain
                "
              />
            </div>

            <h2
              className="
                mt-2
                text-3xl
                font-bold
                text-cyan-400
              "
            >
              Pixel Store
            </h2>
          </div>

          {/* TÍTULO */}

          <h1
            className="
              mb-6
              text-center
              text-3xl
              font-bold
              text-white
            "
          >
            {modo === "login"
              ? "Iniciar sesión"
              : "Registrarse"}
          </h1>

          {/* MENSAJE ÉXITO */}

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
                text-green-400
              "
            >
              {mensaje}
            </div>
          )}

          {/* MENSAJE ERROR */}

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
                text-red-400
              "
            >
              {error}
            </div>
          )}

          {/* ==========================================
              LOGIN
          ========================================== */}

          {modo === "login" ? (
            <form
              onSubmit={iniciarSesion}
              className="flex flex-col gap-5"
            >
              {/* CORREO */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="correo"
                  value={formulario.correo}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu correo"
                  className={claseInput(
                    "correo",
                    validarCorreo(formulario.correo)
                  )}
                />

                {formulario.correo && (
                  <p
                    className={`
                      mt-2
                      text-sm
                      ${
                        validarCorreo(formulario.correo)
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {validarCorreo(formulario.correo)
                      ? "✓ Correo válido"
                      : "✕ Ingresa un correo válido"}
                  </p>
                )}
              </div>

              {/* CONTRASEÑA */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Contraseña
                </label>

                <input
                  type="password"
                  name="password"
                  value={formulario.password}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu contraseña"
                  className={claseInput(
                    "password",
                    formulario.password.length > 0
                  )}
                />

                {formulario.password && (
                  <p className="mt-2 text-sm text-green-400">
                    ✓ Contraseña ingresada
                  </p>
                )}
              </div>

              {/* OLVIDÉ CONTRASEÑA */}

              <div className="-mt-2 text-right">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarRecuperar(true)
                  }
                  className="
                    text-sm
                    font-semibold
                    text-cyan-400
                    transition
                    hover:text-cyan-300
                    hover:underline
                  "
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* LOGIN */}

              <button
                type="submit"
                disabled={cargando}
                className="
                  rounded-lg
                  bg-cyan-400
                  px-4
                  py-3
                  font-bold
                  text-[#111827]
                  transition
                  hover:bg-cyan-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {cargando
                  ? "Iniciando sesión..."
                  : "Iniciar sesión"}
              </button>
            </form>
          ) : (
            /* ==========================================
               REGISTRO
            ========================================== */

            <form
              onSubmit={registrarUsuario}
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              {/* NOMBRE */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Nombre
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu nombre"
                  maxLength={30}
                  className={claseInput(
                    "nombre",
                    nombreValido
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("nombre")} {formulario.nombre.length >= 30 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.nombre && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        nombreValido
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {nombreValido
                      ? "✓ Nombre válido"
                      : "✕ Ingresa un nombre válido."}
                  </p>
                )}
              </div>

              {/* APELLIDO */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Apellido
                </label>

                <input
                  type="text"
                  name="apellido"
                  value={formulario.apellido}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu apellido"
                  maxLength={30}
                  className={claseInput(
                    "apellido",
                    apellidoValido
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("apellido")} {formulario.apellido.length >= 30 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.apellido && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        apellidoValido
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {apellidoValido
                      ? "✓ Apellido válido"
                      : "✕ Ingresa un apellido válido."}
                  </p>
                )}
              </div>

              {/* TIPO DOCUMENTO */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Tipo de documento
                </label>

                <select
                  name="tipoDocumento"
                  value={formulario.tipoDocumento}
                  onChange={manejarCambio}
                  className={claseInput(
                    "tipoDocumento",
                    formulario.tipoDocumento !== ""
                  )}
                >
                  <option value="">
                    Selecciona una opción
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

                {formulario.tipoDocumento ? (
                  <p className="mt-1 text-sm text-green-400">
                    ✓ Tipo de documento seleccionado
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-red-400">
                    ✕ Selecciona el tipo de documento.
                  </p>
                )}
              </div>

              {/* ROL */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Rol
                </label>

                <select
                  value="cliente"
                  disabled
                  className="
                    w-full
                    cursor-not-allowed
                    rounded-lg
                    border
                    border-gray-600
                    bg-[#1f2937]
                    px-4
                    py-3
                    text-gray-400
                  "
                >
                  <option value="cliente">
                    Cliente
                  </option>
                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Los nuevos usuarios se registran como clientes.
                </p>
              </div>

              {/* NÚMERO DOCUMENTO */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Número de documento
                </label>

                <input
                  type="text"
                  name="numeroDocumento"
                  value={formulario.numeroDocumento}
                  onChange={manejarCambio}
                  placeholder="Número de documento"
                  maxLength={15}
                  inputMode="numeric"
                  className={claseInput(
                    "numeroDocumento",
                    documentoValido
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("numeroDocumento")} {formulario.numeroDocumento.length >= 15 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.numeroDocumento && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        documentoValido
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {documentoValido
                      ? "✓ Número de documento válido"
                      : !/^\d+$/.test(
                          formulario.numeroDocumento
                        )
                      ? "✕ Solo se permiten números."
                      : formulario.numeroDocumento.length < 10
                      ? "✕ Debe tener mínimo 10 números."
                      : "✕ Debe tener máximo 15 números."}
                  </p>
                )}
              </div>

              {/* DIRECCIÓN */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Dirección
                </label>

                <input
                  type="text"
                  name="direccion"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu dirección"
                  maxLength={30}
                  className={claseInput(
                    "direccion",
                    direccionValida
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("direccion")} {formulario.direccion.length >= 30 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.direccion && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        direccionValida
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {direccionValida
                      ? "✓ Dirección válida"
                      : "✕ Ingresa una dirección válida."}
                  </p>
                )}
              </div>

              {/* TELÉFONO */}

              <div>
                <label className="mb-2 block font-semibold text-gray-200">
                  Teléfono
                </label>

                <input
                  type="tel"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  placeholder="Número de teléfono"
                  maxLength={15}
                  inputMode="numeric"
                  className={claseInput(
                    "telefono",
                    telefonoValido
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("telefono")} {formulario.telefono.length >= 15 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.telefono && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        telefonoValido
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {telefonoValido
                      ? "✓ Teléfono válido"
                      : !/^\d+$/.test(
                          formulario.telefono
                        )
                      ? "✕ Solo se permiten números."
                      : formulario.telefono.length < 7
                      ? "✕ Debe tener mínimo 7 números."
                      : "✕ Debe tener máximo 15 números."}
                  </p>
                )}
              </div>

              {/* CORREO */}

              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-200">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="correo"
                  value={formulario.correo}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu correo"
                  className={claseInput(
                    "correo",
                    validarCorreo(formulario.correo)
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("correo")} {formulario.correo.length >= 150 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.correo && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        validarCorreo(formulario.correo)
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {validarCorreo(formulario.correo)
                      ? "✓ Correo válido"
                      : "✕ Correo electrónico inválido"}
                  </p>
                )}
              </div>

              {/* CONTRASEÑA */}

              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-200">
                  Contraseña
                </label>

                <input
                  type="password"
                  name="password"
                  value={formulario.password}
                  onChange={manejarCambio}
                  placeholder="Ingresa tu contraseña"
                  className={claseInput(
                    "password",
                    passwordValida
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("password")} {formulario.password.length >= 10 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.password && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p
                      className={
                        passwordValidacion.tieneLongitud
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {passwordValidacion.tieneLongitud
                        ? "✓"
                        : "✕"}{" "}
                      Entre 6 y 10 caracteres
                    </p>

                    <p
                      className={
                        passwordValidacion.tieneMayuscula
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {passwordValidacion.tieneMayuscula
                        ? "✓"
                        : "✕"}{" "}
                      Una letra mayúscula
                    </p>

                    <p
                      className={
                        passwordValidacion.tieneEspecial
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {passwordValidacion.tieneEspecial
                        ? "✓"
                        : "✕"}{" "}
                      Un carácter especial
                    </p>
                  </div>
                )}
              </div>

              {/* CONFIRMAR PASSWORD */}

              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-200">
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  name="confirmarPassword"
                  value={formulario.confirmarPassword}
                  onChange={manejarCambio}
                  placeholder="Confirma tu contraseña"
                  className={claseInput(
                    "confirmarPassword",
                    confirmarPasswordValida
                  )}
                />

                <p className="mt-1 text-right text-xs text-gray-500">
                  {contador("confirmarPassword")} {formulario.confirmarPassword.length >= 10 && <span className="text-red-400">· alcanzó el límite</span>}
                </p>

                {formulario.confirmarPassword && (
                  <p
                    className={`
                      mt-1
                      text-sm
                      ${
                        confirmarPasswordValida
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {confirmarPasswordValida
                      ? "✓ Las contraseñas coinciden"
                      : "✕ Las contraseñas no coinciden"}
                  </p>
                )}
              </div>

              {/* REGISTRAR */}

              <button
                type="submit"
                disabled={cargando}
                className="
                  md:col-span-2
                  rounded-lg
                  bg-cyan-400
                  px-4
                  py-3
                  font-bold
                  text-[#111827]
                  transition
                  hover:bg-cyan-500
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {cargando
                  ? "Registrando..."
                  : "Registrarse"}
              </button>
            </form>
          )}

          {/* CAMBIAR LOGIN / REGISTRO */}

          <div
            className="
              mt-6
              text-center
              text-gray-400
            "
          >
            {modo === "login"
              ? "¿No tienes una cuenta?"
              : "¿Ya tienes una cuenta?"}

            <button
              type="button"
              onClick={cambiarModo}
              className="
                ml-2
                font-semibold
                text-cyan-400
                transition
                hover:text-cyan-300
              "
            >
              {modo === "login"
                ? "Registrarse"
                : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL RECUPERAR CONTRASEÑA */}

      <RecuperarPassword
        abierto={mostrarRecuperar}
        cerrar={() => setMostrarRecuperar(false)}
      />
    </>
  );
}

export default Login;
