import SectionTitle from "../components/SectionTitle";
import Button from "../components/Button";


function Contacto() {
  return (
    <section
      className="
        w-[90%]
        max-w-[1200px]
        mx-auto
        my-[50px]
        text-texto
      "
    >

      {/* ==================== ENCABEZADO ==================== */}
<SectionTitle
  title="Contáctanos"
  subtitle="¿Tienes alguna pregunta? Estamos aquí para ayudarte."
/>
     


      {/* ==================== CONTENIDO ==================== */}

      <div
        className="
          grid
          grid-cols-1
          min-[801px]:grid-cols-[1fr_1.3fr]
          gap-[40px]
          items-stretch
          max-w-10xl
        "
      >

        {/* ==================== INFORMACIÓN ==================== */}

        <div
          className="
            bg-fondo
            rounded-[15px]
            p-[35px]
            shadow-[0_8px_20px_rgba(0,0,0,0.2)]
          "
        >

          <h2
            className="
              text-cyan-400
              mb-[30px]
              text-2xl
              font-bold
            "
          >
            Información de contacto
          </h2> <br /> 


          {/* UBICACIÓN */}

          <div className="mb-[28px]">
            <div className="flex items-start gap-[18px]">
              <span className="text-[30px]" aria-hidden="true">
                📍
              </span>

              <div>
                <h3 className="mb-[5px] text-texto font-bold">
                  SENA Medellín – Avenida El Ferrocarril
                </h3>

                <p className="text-texto-tenue leading-relaxed">
                  Av. del Ferrocarril #51-23, La Candelaria, Medellín,
                  Antioquia
                </p>
              </div>
            </div>

            <div className="mt-[22px] overflow-hidden rounded-xl border border-borde bg-superficie-2 shadow-inner">
              <iframe
                title="Mapa de la ubicación del SENA Medellín"
                src="https://www.google.com/maps?q=SENA%20Medell%C3%ADn%20Avenida%20El%20Ferrocarril%20La%20Candelaria%20Medell%C3%ADn&output=embed"
                className="h-[260px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=SENA+Medell%C3%ADn+Av.+del+Ferrocarril+%2351-23+La+Candelaria+Medell%C3%ADn"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Ver indicaciones en Google Maps ↗
            </a>
          </div>


          {/* TELÉFONO */}

          <div
            className="
              flex
              items-center
              gap-[18px]
              mb-[25px]
            "
          >

            <span className="text-[30px]">
              📞
            </span>

            <div>

              <h3
                className="
                  mb-[5px]
                  text-texto
                  font-bold
                "
              >
                Teléfono
              </h3>

              <p className="text-texto-tenue">
                +57 300 000 0000
              </p>

            </div>

          </div> <br /> 


          {/* CORREO */}

          <div
            className="
              flex
              items-center
              gap-[18px]
              mb-[25px]
            "
          >

            <span className="text-[30px]">
              ✉️
            </span>

            <div>

              <h3
                className="
                  mb-[5px]
                  text-texto
                  font-bold
                "
              >
                Correo electrónico
              </h3>

              <p className="text-texto-tenue">
                contacto@pixelstore.com
              </p>

            </div>

          </div> <br /> <br />


          {/* HORARIO */}

          <div
            className="
              flex
              items-center
              gap-[18px]
              mb-[25px]
            "
          >

            <span className="text-[30px]">
              🕐
            </span>

            <div>

              <h3
                className="
                  mb-[5px]
                  text-texto
                  font-bold
                "
              >
                Horario de atención
              </h3>

              <p className="text-texto-tenue">
                Lunes a viernes: 8:00 AM - 6:00 PM
              </p>

            </div>

          </div>

        </div> 


        {/* ==================== FORMULARIO ==================== */}

        <div
          className="
            bg-fondo
            rounded-[15px]
            p-[35px]
            shadow-[0_8px_20px_rgba(0,0,0,0.2)]
          "
        >

          <h2
            className="
              text-cyan-400
              mb-[30px]
              text-2xl
              font-bold
            "
          >
            Envíanos un mensaje
          </h2>


          <form
            className="
              flex
              flex-col
            "
          >

            {/* NOMBRE */}

            <label
              className="
                mb-2
                text-texto
                font-bold
              "
            >
              Nombre
            </label>

            <input
              type="text"
              placeholder="Ingresa tu nombre"
              className="
                p-[13px]
                mb-5
                border
                border-borde
                rounded-lg
                bg-superficie-2
                text-texto
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-texto-tenue
              "
            />


            {/* CORREO */}

            <label
              className="
                mb-2
                text-texto
                font-bold
              "
            >
              Correo Electrónico
            </label>

            <input
              type="email"
              placeholder="Ingresa tu correo"
              className="
                p-[13px]
                mb-5
                border
                border-borde
                rounded-lg
                bg-superficie-2
                text-texto
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-texto-tenue
              "
            />


            {/* ASUNTO */}

            <label
              className="
                mb-2
                text-texto
                font-bold
              "
            >
              Asunto
            </label>

            <input
              type="text"
              placeholder="¿En qué podemos ayudarte?"
              className="
                p-[13px]
                mb-5
                border
                border-borde
                rounded-lg
                bg-superficie-2
                text-texto
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-texto-tenue
              "
            />


            {/* MENSAJE */}

            <label
              className="
                mb-2
                text-texto
                font-bold
              "
            >
              Mensaje
            </label>

            <textarea
              rows="5"
              placeholder="Escribe tu mensaje..."
              className="
                p-[13px]
                mb-5
                border
                border-borde
                rounded-lg
                bg-superficie-2
                text-texto
                text-[15px]
                font-[Arial,Helvetica,sans-serif]
                resize-y

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-texto-tenue
              "
            ></textarea> <br />


            {/* BOTÓN */}
<Button type="submit">
  Enviar mensaje
</Button>

          </form> <br /><br />

        </div>

      </div> <br /><br /> <br />

    </section>
  );
}

export default Contacto;