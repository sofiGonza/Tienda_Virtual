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
        text-white
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
            bg-gray-900
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
                <h3 className="mb-[5px] text-white font-bold">
                  SENA Medellín – Avenida El Ferrocarril
                </h3>

                <p className="text-[#aeb4c0] leading-relaxed">
                  Av. del Ferrocarril #51-23, La Candelaria, Medellín,
                  Antioquia
                </p>
              </div>
            </div>

            <div className="mt-[22px] overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-inner">
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
                  text-white
                  font-bold
                "
              >
                Teléfono
              </h3>

              <p className="text-[#aeb4c0]">
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
                  text-white
                  font-bold
                "
              >
                Correo electrónico
              </h3>

              <p className="text-[#aeb4c0]">
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
                  text-white
                  font-bold
                "
              >
                Horario de atención
              </h3>

              <p className="text-[#aeb4c0]">
                Lunes a viernes: 8:00 AM - 6:00 PM
              </p>

            </div>

          </div>

        </div> 


        {/* ==================== FORMULARIO ==================== */}

        <div
          className="
            bg-gray-900
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
                text-gray-200
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
                border-gray-700
                rounded-lg
                bg-gray-800
                text-white
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-gray-400
              "
            />


            {/* CORREO */}

            <label
              className="
                mb-2
                text-gray-200
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
                border-gray-700
                rounded-lg
                bg-gray-800
                text-white
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-gray-400
              "
            />


            {/* ASUNTO */}

            <label
              className="
                mb-2
                text-gray-200
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
                border-gray-700
                rounded-lg
                bg-gray-800
                text-white
                text-[15px]
                font-[Arial,Helvetica,sans-serif]

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-gray-400
              "
            />


            {/* MENSAJE */}

            <label
              className="
                mb-2
                text-gray-200
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
                border-gray-700
                rounded-lg
                bg-gray-800
                text-white
                text-[15px]
                font-[Arial,Helvetica,sans-serif]
                resize-y

                focus:outline-none
                focus:border-cyan-400

                placeholder:text-gray-400
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