function InfoCard({
  icon,
  title,
  text,
  className = ""
}) {
  return (
    <div
      className={`
        bg-[#1b2740e0]
        p-[30px]
        rounded-[15px]

        text-center

        shadow-[0_10px_25px_rgba(0,0,0,0.15)]

        transition
        duration-300

        hover:-translate-y-2

        ${className}
      `}
    >

      <div
        className="
          text-[#0d6efd]
          text-[50px]

          flex
          justify-center

          mb-5
        "
      >
        {icon}
      </div>

      <h3
        className="
          text-white
          text-xl
          font-bold
          mb-4
        "
      >
        {title}
      </h3>

      {text && (
        <p
          className="
            text-gray-300
            leading-relaxed
          "
        >
          {text}
        </p>
      )}

    </div>
  );
}

export default InfoCard;