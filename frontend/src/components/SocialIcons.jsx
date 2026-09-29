import {
  FaWhatsapp,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

function SocialIcons() {
  return (
    <div className="flex items-center gap-4">

      {/* WhatsApp */}

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

          bg-superficie-2
          text-texto

          transition
          duration-300

          hover:bg-green-500 hover:text-white
          hover:scale-110
        "
      >
        <FaWhatsapp className="text-xl" />
      </a>


      {/* LinkedIn */}

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

          bg-superficie-2
          text-texto

          transition
          duration-300

          hover:bg-blue-600 hover:text-white
          hover:scale-110
        "
      >
        <FaLinkedin className="text-xl" />
      </a>


      {/* Facebook */}

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

          bg-superficie-2
          text-texto

          transition
          duration-300

          hover:bg-blue-500 hover:text-white
          hover:scale-110
        "
      >
        <FaFacebook className="text-xl" />
      </a>


      {/* Instagram */}

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

          bg-superficie-2
          text-texto

          transition
          duration-300

          hover:bg-pink-500 hover:text-white
          hover:scale-110
        "
      >
        <FaInstagram className="text-xl" />
      </a>

    </div>
  );
}

export default SocialIcons;