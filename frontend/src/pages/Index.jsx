import Carrusel from "../components/Carrusel";
import SectionTitle from "../components/SectionTitle";
import InfoCard from "../components/InfoCard";
import Button from "../components/Button";

import apple from "../img/marcas/apple.png";
import samsung from "../img/marcas/samsung.png";
import hp from "../img/marcas/hp.png";
import lenovo from "../img/marcas/lenovo.png";
import asus from "../img/marcas/asus.png";

import tecnologia from "../img/tecnologia.png";
import oficina from "../img/oficina.png";
import perifericos from "../img/perifericos.png";
import bateria from "../img/bateria.png";


function Index() {

  return (
    <>

      <Carrusel />


      {/* ================= PRESENTACIÓN ================= */}

      <section
        className="
          py-[80px]
          px-6
          text-center
          bg-gray-950
        "
      >

        <SectionTitle
          eyebrow="Bienvenido a Pixel Store"
          title="Tecnología que transforma tu día"
          subtitle="En Pixel Store encontrarás tecnología diseñada para acompañarte en cada momento. Descubre computadores, dispositivos inteligentes, accesorios y soluciones tecnológicas para estudiar, trabajar, jugar y disfrutar."
        />

      </section>


      {/* ================= CATEGORÍAS ================= */}

      <section
        className="
          py-[80px]
          px-6
          bg-gray-900
        "
      >

        <SectionTitle
          eyebrow="Explora nuestra tienda"
          title="Encuentra lo que necesitas"
          subtitle="Tenemos diferentes categorías para que encuentres fácilmente la tecnología perfecta para ti."
        />


        <div
          className="
            max-w-[1200px]
            mx-auto

            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4

            gap-6
          "
        >

          {[
            {
              imagen: tecnologia,
              titulo: "Tecnología",
              texto: "Descubre los últimos dispositivos."
            },
            {
              imagen: oficina,
              titulo: "Oficina",
              texto: "Todo para estudiar y trabajar."
            },
            {
              imagen: perifericos,
              titulo: "Periféricos",
              texto: "Mejora tu experiencia."
            },
            {
              imagen: bateria,
              titulo: "Energía",
              texto: "Mantén tus dispositivos funcionando."
            }
          ].map((categoria) => (

            <div
              key={categoria.titulo}
              className="
                group
                relative
                h-[280px]
                overflow-hidden
                rounded-2xl
              "
            >

              <img
                src={categoria.imagen}
                alt={categoria.titulo}
                className="
                  w-full
                  h-full
                  object-cover
                  transition
                  duration-500
                  group-hover:scale-110
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-black/55

                  flex
                  flex-col
                  justify-end

                  p-6
                "
              >

                <h3
                  className="
                    text-white
                    text-2xl
                    font-bold
                  "
                >
                  {categoria.titulo}
                </h3>

                <p className="text-gray-200 mt-2">
                  {categoria.texto}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* ================= BENEFICIOS ================= */}

      <section
        className="
          py-[90px]
          px-6
          bg-gray-950
        "
      >

        <SectionTitle
          eyebrow="Nuestra diferencia"
          title="¿Por qué elegirnos?"
          subtitle="Queremos que tu experiencia de compra sea sencilla, segura y confiable."
        />


        <div
          className="
            max-w-[1100px]
            mx-auto

            grid
            grid-cols-1
            md:grid-cols-3

            gap-[30px]
          "
        >

          <InfoCard
            icon="🚚"
            title="Envíos a todo el país"
            text="Realizamos entregas rápidas y seguras para que recibas tus productos donde estés."
          />

          <InfoCard
            icon="🔒"
            title="Pago seguro"
            text="Protegemos tus compras para que puedas adquirir tus productos con tranquilidad."
          />

          <InfoCard
            icon="⭐"
            title="Garantía oficial"
            text="Productos originales respaldados por garantía y calidad."
          />

        </div>

      </section>


      {/* ================= MARCAS ================= */}

      <section
        className="
          py-[80px]
          px-6
          text-center
          bg-gray-900
        "
      >

        <SectionTitle
          eyebrow="Trabajamos con las mejores"
          title="Marcas reconocidas"
          subtitle="Seleccionamos marcas reconocidas por su innovación, calidad y confiabilidad."
        />


        <div
          className="
            max-w-[1000px]
            mx-auto

            flex
            justify-center
            items-center
            gap-[60px]
            flex-wrap
          "
        >

          {[apple, samsung, hp, lenovo, asus].map(
            (marca, index) => (

              <img
                key={index}
                src={marca}
                alt="Marca tecnológica"
                className="
                  w-[120px]
                  transition
                  duration-300
                  hover:scale-110
                "
              />

            )
          )}

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section
        className="
          py-[90px]
          px-6
          text-center
          bg-gradient-to-r
          from-[#111827]
          via-[#1b2740]
          to-[#111827]
        "
      >

        <SectionTitle
          title="¿Listo para llevar tu tecnología al siguiente nivel?"
          subtitle="Explora nuestro catálogo y encuentra el equipo perfecto para tus necesidades."
        />

        <div className="max-w-[220px] mx-auto">

          <Button
            onClick={() =>
              window.location.href = "/productos"
            }
          >
            Ver productos
          </Button>

        </div>

      </section>

    </>
  );
}

export default Index;