import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  const numeroWhatsApp = "573001234567";
  const mensaje = "Hola, estoy interesado en los productos de Pixel Store.";

  const abrirWhatsApp = () => {
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={abrirWhatsApp}
      aria-label="Contactar por WhatsApp"
      title="Contáctanos por WhatsApp"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300/50"
    >
      <FaWhatsapp className="text-2xl" />
    </button>
  );
}

export default WhatsAppButton;
