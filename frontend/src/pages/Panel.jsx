import {
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  obtenerSesion
} from "../Services/AuthService";


function Panel() {

  const navigate =
    useNavigate();


  const sesion =
    obtenerSesion();


  useEffect(
    () => {

      if (!sesion) {

        navigate("/");

      }

    },
    []
  );


  if (!sesion) {

    return null;

  }


  const rol =
    String(
      sesion.rol
    ).toLowerCase();


  const esAdministrador =
    rol === "administrador";


  const esEmpleado =
    rol === "empleado";


  return (

    <section
      className="
        min-h-[75vh]
        bg-gray-950
        px-6
        py-16
      "
    >

      <div
        className="
          mx-auto
          max-w-[1200px]
        "
      >

        {/* ==========================================
            ENCABEZADO
        ========================================== */}

        <div
          className="
            mb-10
            border-b
            border-gray-700
            pb-6
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
            Panel de gestión
          </p>


          <h1
            className="
              mt-2
              text-4xl
              font-bold
              text-white
            "
          >
            Bienvenido,{" "}
            {sesion.nombre || "usuario"}
          </h1>


          <p
            className="
              mt-2
              text-gray-400
            "
          >
            Rol:{" "}
            <span
              className="
                font-bold
                text-cyan-400
              "
            >
              {sesion.rol}
            </span>
          </p>

        </div>


        {/* ==========================================
            OPCIONES
        ========================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            md:grid-cols-2
            lg:grid-cols-3
          "
        >

          {/* ========================================
              PRODUCTOS
          ======================================== */}

          {(esAdministrador ||
            esEmpleado) && (

            <button
              onClick={() =>
                navigate(
                  "/panel/productos"
                )
              }

              className="
                rounded-2xl
                border
                border-gray-700
                bg-[#1b2740e0]
                p-8
                text-left
                transition
                hover:-translate-y-1
                hover:border-cyan-400
              "
            >

              <div
                className="
                  text-5xl
                "
              >
                📦
              </div>


              <h2
                className="
                  mt-5
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Productos
              </h2>


              <p
                className="
                  mt-2
                  text-gray-400
                "
              >
                {esAdministrador

                  ? "Agregar, editar y eliminar productos."

                  : "Consultar, agregar y editar productos."

                }
              </p>

            </button>

          )}


          {/* ========================================
              PEDIDOS
          ======================================== */}

          {(esAdministrador ||
            esEmpleado) && (

            <button
              onClick={() =>
                navigate(
                  "/panel/pedidos"
                )
              }

              className="
                rounded-2xl
                border
                border-gray-700
                bg-[#1b2740e0]
                p-8
                text-left
                transition
                hover:-translate-y-1
                hover:border-cyan-400
              "
            >

              <div
                className="
                  text-5xl
                "
              >
                🛒
              </div>


              <h2
                className="
                  mt-5
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Pedidos
              </h2>


              <p
                className="
                  mt-2
                  text-gray-400
                "
              >
                Ver pedidos, clientes,
                productos y estados.
              </p>

            </button>

          )}


          {/* ========================================
              USUARIOS
              SOLO ADMINISTRADOR
          ======================================== */}

          {esAdministrador && (

            <button
              onClick={() =>
                navigate(
                  "/panel/usuarios"
                )
              }

              className="
                rounded-2xl
                border
                border-gray-700
                bg-[#1b2740e0]
                p-8
                text-left
                transition
                hover:-translate-y-1
                hover:border-cyan-400
              "
            >

              <div
                className="
                  text-5xl
                "
              >
                👥
              </div>


              <h2
                className="
                  mt-5
                  text-2xl
                  font-bold
                  text-white
                "
              >
                Usuarios
              </h2>


              <p
                className="
                  mt-2
                  text-gray-400
                "
              >
                Crear, editar, eliminar y
                administrar usuarios.
              </p>

            </button>

          )}

        </div>

      </div>

    </section>

  );

}


export default Panel;