import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);
const CLAVE_LOCAL = "pixel-store-tema";

// El valor inicial coincide con el script anti-flash de index.html.
function obtenerTemaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE_LOCAL);
    if (guardado === "claro" || guardado === "oscuro" || guardado === "sistema") {
      return guardado;
    }
  } catch (error) {
    console.error(error);
  }
  return "oscuro";
}

function resolverTema(tema, sistemaOscuro) {
  if (tema === "sistema") {
    return sistemaOscuro ? "oscuro" : "claro";
  }
  return tema;
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(obtenerTemaInicial);
  const [sistemaOscuro, setSistemaOscuro] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Sigue los cambios del sistema cuando el usuario elige "sistema".
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const manejarCambio = (e) => setSistemaOscuro(e.matches);
    mq.addEventListener("change", manejarCambio);
    return () => mq.removeEventListener("change", manejarCambio);
  }, []);

  // Aplica la clase y guarda la preferencia.
  useEffect(() => {
    const activo = resolverTema(tema, sistemaOscuro);
    const root = document.documentElement;
    root.classList.toggle("dark", activo === "oscuro");
    root.classList.toggle("light", activo === "claro");
    root.style.colorScheme = activo;
    try {
      localStorage.setItem(CLAVE_LOCAL, tema);
    } catch (error) {
      console.error(error);
    }
  }, [tema, sistemaOscuro]);

  const cambiarTema = useCallback((nuevo) => setTema(nuevo), []);

  // Ciclo: oscuro -> claro -> sistema (sigue al dispositivo) -> oscuro...
  const alternarTema = useCallback(() => {
    setTema((actual) =>
      actual === "oscuro" ? "claro" : actual === "claro" ? "sistema" : "oscuro"
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ tema, sistemaOscuro, cambiarTema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de <ThemeProvider>");
  }
  return contexto;
}