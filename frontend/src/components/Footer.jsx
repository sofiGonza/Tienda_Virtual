import logo from "../img/logo/logoPixel.png";

import {
  FaWhatsapp,
  FaLinkedin,
  FaFacebook,
  FaInstagram
} from "react-icons/fa";

function Footer() {
  return (
    <footer
      className="
        bg-gray-900
        text-white
        border-t-[3px]
        border-cyan-400
        mt-auto
      "
    >

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}

      <div
        className="
          max-w-[1200px]
          mx-auto
          px-8
          py-[50px]

          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4

          gap-[40px]
        "
      >

        {/* ==================== LOGO ==================== */}

        <div
          className="
            flex
            flex-col
            items-start
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              mb-5
            "
          >

            <img
              src={logo}
              alt="Logo Pixel Store"
              className="
                w-[70px]
                h-[70px]
                object-contain
              "
            />

            <h2
              className="
                text-[28px]
                font-bold
                text-cyan-400
              "
            >
              Pixel Store
            </h2>

          </div>

          <p
            className="
              text-gray-300
              leading-relaxed
              text-[15px]
              max-w-[280px]
            "
          >
            Tecnología, innovación y calidad al alcance de todos.
            Encuentra los mejores productos tecnológicos para tu
            hogar, estudio, trabajo y entretenimiento.
          </p>

          {/* REDES SOCIALES */}

<div className="mt-6">

  <h3
    className="
      text-cyan-400
      text-xl
      font-bold
      mb-4
    "
  >
    Síguenos
  </h3>

  <div className="flex items-center gap-4">

    {/* WHATSAPP */}

    <a
      href="#"
      aria-label="WhatsApp"
      className="
        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-gray-800
        text-white

        transition
        duration-300

        hover:bg-green-500
        hover:scale-110
      "
    >
      <FaWhatsapp className="text-xl" />
    </a>


    {/* LINKEDIN */}

    <a
      href="#"
      aria-label="LinkedIn"
      className="
        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-gray-800
        text-white

        transition
        duration-300

        hover:bg-blue-600
        hover:scale-110
      "
    >
      <FaLinkedin className="text-xl" />
    </a>


    {/* FACEBOOK */}

    <a
      href="#"
      aria-label="Facebook"
      className="
        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-gray-800
        text-white

        transition
        duration-300

        hover:bg-blue-500
        hover:scale-110
      "
    >
      <FaFacebook className="text-xl" />
    </a>


    {/* INSTAGRAM */}

    <a
      href="#"
      aria-label="Instagram"
      className="
        w-10
        h-10

        flex
        items-center
        justify-center

        rounded-full

        bg-gray-800
        text-white

        transition
        duration-300

        hover:bg-pink-500
        hover:scale-110
      "
    >
      <FaInstagram className="text-xl" />
    </a>

  </div>

</div>

        </div>
        


        {/* ==================== ENLACES ==================== */}

        <div>

          <h3
            className="
              text-cyan-400
              text-xl
              font-bold
              mb-5
            "
          >
            Enlaces rápidos
          </h3>

          <ul
            className="
              list-none
              p-0
              m-0
              space-y-3
            "
          >

            <li>
              <a
                href="/"
                className="
                  text-gray-300
                  no-underline
                  transition
                  duration-300
                  hover:text-cyan-400
                "
              >
                Inicio
              </a>
            </li>

            <li>
              <a
                href="/quienes-somos"
                className="
                  text-gray-300
                  no-underline
                  transition
                  duration-300
                  hover:text-cyan-400
                "
              >
                Quiénes Somos
              </a>
            </li>

            <li>
              <a
                href="/productos"
                className="
                  text-gray-300
                  no-underline
                  transition
                  duration-300
                  hover:text-cyan-400
                "
              >
                Productos
              </a>
            </li>

            <li>
              <a
                href="/contacto"
                className="
                  text-gray-300
                  no-underline
                  transition
                  duration-300
                  hover:text-cyan-400
                "
              >
                Contacto
              </a>
            </li>

          </ul>

        </div>


        {/* ==================== SERVICIOS ==================== */}

        <div>

          <h3
            className="
              text-cyan-400
              text-xl
              font-bold
              mb-5
            "
          >
            Servicios
          </h3>

          <ul
            className="
              list-none
              p-0
              m-0
              space-y-3
            "
          >

            <li className="text-gray-300">
              🚚 Envíos a todo el país
            </li>

            <li className="text-gray-300">
              🔒 Pagos seguros
            </li>

            <li className="text-gray-300">
              ⭐ Garantía oficial
            </li>

            <li className="text-gray-300">
              💻 Asesoría tecnológica
            </li>

          </ul>

        </div>


        {/* ==================== CONTACTO ==================== */}

        <div>

          <h3
            className="
              text-cyan-400
              text-xl
              font-bold
              mb-5
            "
          >
            Contáctanos
          </h3>

          <div
            className="
              flex
              flex-col
              gap-4
            "
          >

            <div className="text-gray-300">
              <p className="m-0 font-semibold text-white">
                📍 SENA Medellín – Avenida El Ferrocarril
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                Av. del Ferrocarril #51-23, La Candelaria, Medellín, Antioquia
              </p>

              <div className="mt-3 overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                <iframe
                  title="Mapa del SENA Medellín en el footer"
                  src="https://www.google.com/maps?q=SENA%20Medell%C3%ADn%20Avenida%20El%20Ferrocarril%20La%20Candelaria%20Medell%C3%ADn&output=embed"
                  className="h-40 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=SENA+Medell%C3%ADn+Av.+del+Ferrocarril+%2351-23+La+Candelaria+Medell%C3%ADn"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Ver en Google Maps ↗
              </a>
            </div>

            <p className="text-gray-300 m-0">
              📞 +57 300 000 0000
            </p>

            <p className="text-gray-300 m-0 break-all">
              ✉️ contacto@pixelstore.com
            </p>

            <p className="text-gray-300 m-0">
              🕐 Lunes a viernes
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;8:00 AM - 6:00 PM
            </p>

          </div>

        </div>
        

      </div>


      {/* ==================== PARTE INFERIOR ==================== */}

      <div
        className="
          border-t
          border-gray-700
          py-5
          px-5
          text-center
        "
      >

        <p
          className="
            text-gray-400
            text-sm
            m-0
          "
        >
          © 2026 Pixel Store. Todos los derechos reservados.
        </p>

      </div>

    </footer>
  );
}

export default Footer;