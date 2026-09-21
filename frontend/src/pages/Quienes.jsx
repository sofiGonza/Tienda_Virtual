import {
  FaBullseye,
  FaEye,
  FaHandshake,
  FaLightbulb,
  FaUsers,
  FaLaptop
} from "react-icons/fa";

import SectionTitle from "../components/SectionTitle";
import InfoCard from "../components/InfoCard";


function Quienes() {

  return (

    <div className="font-[Arial,Helvetica,sans-serif]">


      {/* ================= BANNER ================= */}

      <section
        className="
          h-[380px]

          bg-[url('/src/img/quienes1.jpg')]
          bg-cover
          bg-center

          flex
          flex-col
          justify-center
          items-center

          text-white
          text-center

          [text-shadow:2px_2px_5px_black]
        "
      >

        <h1
          className="
            text-5xl
            md:text-[60px]
            font-bold
          "
        >
          ¿Quiénes Somos?
        </h1>

        <p className="text-lg">
          Innovando el futuro de la tecnología.
        </p>

      </section>


      {/* ================= HISTORIA ================= */}

      <section
        className="
          w-[80%]
          max-w-[1100px]
          mx-auto
          py-[70px]
        "
      >

        <SectionTitle
          title="Nuestra Historia"
          centered={false}
        />

        <p
          className="
            text-[#edf4fe]
            leading-[1.8]
          "
        >
          Pixel Store nació con el objetivo de acercar la mejor
          tecnología a nuestros clientes. Nos especializamos en
          computadores, accesorios y dispositivos inteligentes,
          ofreciendo productos de calidad, asesoría personalizada
          y un excelente servicio.
        </p>

      </section>


      {/* ================= MISIÓN Y VISIÓN ================= */}

      <section
        className="
          py-[60px]
          px-6

          grid
          grid-cols-1
          md:grid-cols-2

          gap-[40px]

          max-w-[900px]
          mx-auto
        "
      >

        <InfoCard
          icon={<FaBullseye />}
          title="Misión"
          text="Brindar soluciones tecnológicas innovadoras mediante productos de alta calidad y una atención excepcional que satisfaga las necesidades de nuestros clientes."
        />

        <InfoCard
          icon={<FaEye />}
          title="Visión"
          text="Ser la tienda de tecnología líder en innovación, confianza y servicio, reconocida por ofrecer las mejores experiencias de compra."
        />

      </section>


      {/* ================= VALORES ================= */}

      <section
        className="
          py-[60px]
          px-6
          text-center
        "
      >

        <SectionTitle
          title="Valores"
        />


        <div
          className="
            max-w-[1100px]
            mx-auto

            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4

            gap-[30px]
          "
        >

          <InfoCard
            icon={<FaHandshake />}
            title="Compromiso"
          />

          <InfoCard
            icon={<FaUsers />}
            title="Trabajo en Equipo"
          />

          <InfoCard
            icon={<FaLightbulb />}
            title="Innovación"
          />

          <InfoCard
            icon={<FaLaptop />}
            title="Calidad"
          />

        </div>

      </section>

    </div>
  );
}

export default Quienes;