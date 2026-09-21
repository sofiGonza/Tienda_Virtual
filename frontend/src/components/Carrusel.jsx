import { useEffect, useState } from "react";

import laptop from "../img/laptop.jpg";
import smartphone from "../img/smartphone.jpg";
import audifonos from "../img/audifonos.jpg";
import setup from "../img/setup.jpg";
import reloj from "../img/reloj.png";
import bateria from "../img/bateria.png";
import oficina from "../img/oficina.png";
import perifericos from "../img/perifericos.png";
import tecnologia from "../img/tecnologia.png";
import ordenador from "../img/ordenador.png";

const slides = [
  {
    imagen: laptop,
    titulo: "Las mejores laptops",
    texto: "Potencia para estudiar, trabajar y jugar."
  },
  {
    imagen: smartphone,
    titulo: "Tecnología para todos",
    texto: "Descubre los mejores equipos al mejor precio."
  },
  {
    imagen: reloj,
    titulo: "Relojes inteligentes",
    texto: "Mide tu salud y actividad con estilo."
  },
  {
    imagen: oficina,
    titulo: "Oficina y productividad",
    texto: "Todo lo que necesitas para trabajar desde casa."
  },
  {
    imagen: audifonos,
    titulo: "Accesorios inteligentes",
    texto: "Haz tu vida más fácil."
  },
  {
    imagen: perifericos,
    titulo: "Periféricos de última generación",
    texto:
      "Mejora tu experiencia de juego con los mejores periféricos."
  },
  {
    imagen: setup,
    titulo: "Setup Gamer",
    texto:
      "Equipa tu espacio con tecnología diseñada para obtener el máximo rendimiento en cada partida."
  },
  {
    imagen: ordenador,
    titulo: "Ordenadores de alto rendimiento",
    texto: "Equipos potentes para todas tus necesidades."
  },
  {
    imagen: bateria,
    titulo: "Baterías de alta capacidad",
    texto:
      "Potencia tu dispositivo con baterías de última generación."
  },
  {
    imagen: tecnologia,
    titulo: "Tecnología para todos",
    texto:
      "Descubre los mejores equipos al mejor precio."
  }
];

function Carrusel() {

  const [actual, setActual] = useState(0);

  useEffect(() => {

    const intervalo = setInterval(() => {

      setActual((prev) => (prev + 1) % slides.length);

    }, 5000);

    return () => clearInterval(intervalo);

  }, []);

  const siguiente = () => {
    setActual((prev) => (prev + 1) % slides.length);
  };

  const anterior = () => {
    setActual(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  return (

    <section
      className="
        relative
        w-full
        h-[700px]
        overflow-hidden
      "
    >

      {/* ==================== SLIDES ==================== */}

      {slides.map((slide, index) => (

        <div
          key={index}
          className={`
            absolute
            top-0
            left-0
            w-full
            h-full
            transition-opacity
            duration-1000
            ${index === actual ? "opacity-100" : "opacity-0"}
          `}
        >

          {/* IMAGEN */}

          <img
            src={slide.imagen}
            alt={slide.titulo}
            className="
              w-full
              h-full
              object-cover
              margin-10%
              padding-30%
            "
          />


          {/* ==================== OVERLAY ==================== */}

          <div
            className="
              absolute
              inset-0
              bg-black/45
              flex
              flex-col
              justify-center
              items-center
              text-white
              text-center
              px-5
            "
          >

            <h1
              className="
                text-[60px]
                font-bold
                mb-5
              "
            >
              {slide.titulo}
            </h1>

            <p
              className="
                text-[24px]
              "
            >
              {slide.texto}
            </p>

          </div>

        </div>

      ))}


      {/* ==================== FLECHA IZQUIERDA ==================== */}

      <button
        onClick={anterior}
        className="
          absolute
          top-1/2
          left-[25px]
          -translate-y-1/2

          w-[55px]
          h-[55px]

          border-none
          rounded-full

          bg-black/45
          text-white

          text-[28px]

          cursor-pointer

          transition
          duration-300

          z-10

          hover:bg-cyan-400
          hover:text-gray-900
        "
      >
        ❮
      </button>


      {/* ==================== FLECHA DERECHA ==================== */}

      <button
        onClick={siguiente}
        className="
          absolute
          top-1/2
          right-[25px]
          -translate-y-1/2

          w-[55px]
          h-[55px]

          border-none
          rounded-full

          bg-black/45
          text-white

          text-[28px]

          cursor-pointer

          transition
          duration-300

          z-10

          hover:bg-cyan-400
          hover:text-gray-900
        "
      >
        ❯
      </button>


      {/* ==================== INDICADORES ==================== */}

      <div
        className="
          absolute
          bottom-[25px]
          left-1/2
          -translate-x-1/2

          flex
          gap-3

          z-10
        "
      >

        {slides.map((_, index) => (

          <span
            key={index}
            onClick={() => setActual(index)}
            className={`
              w-[14px]
              h-[14px]
              rounded-full
              cursor-pointer
              transition-all
              duration-300

              ${
                index === actual
                  ? "bg-cyan-400 scale-125"
                  : "bg-white/50 hover:bg-white"
              }
            `}
          ></span>

        ))}

      </div>

    </section>
  );
}

export default Carrusel;