function SectionTitle({
  title,
  subtitle,
  eyebrow,
  centered = true
}) {
  return (
    <div
      className={`
        ${centered ? "text-center" : "text-left"}
        mb-10
      `}
    >

      {eyebrow && (
        <p
          className="
            text-cyan-400
            uppercase
            tracking-[3px]
            text-sm
            font-semibold
            mb-3
          "
        >
          {eyebrow}
        </p>
      )}

      <h2
        className="
          text-white
          text-3xl
          md:text-4xl
          font-bold
          mb-4
        "
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="
            text-gray-400
            text-base
            md:text-lg
            leading-relaxed
            max-w-[750px]
            mx-auto
          "
        >
          {subtitle}
        </p>
      )}

    </div>
  );
}

export default SectionTitle;