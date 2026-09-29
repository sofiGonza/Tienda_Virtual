function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false
}) {

  const variants = {

    primary: `
      bg-cyan-400
      text-[#06202e]
      hover:bg-cyan-300
    `,

    secondary: `
      bg-superficie
      text-texto
      border
      border-cyan-400
      hover:bg-cyan-400
      hover:text-[#06202e]
    `,

    danger: `
      bg-red-500
      text-texto
      hover:bg-red-600
    `

  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full

        px-5
        py-3

        rounded-lg

        font-bold

        transition
        duration-300

        ${variants[variant]}

        disabled:opacity-50
        disabled:cursor-not-allowed

        ${className}
      `}
    >
      {children}
    </button>
  );
}

export default Button;