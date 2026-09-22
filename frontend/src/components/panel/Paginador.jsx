// Paginador reutilizable para listas de tarjetas.
// Recibe: total (número de elementos) y opcional porPagina (default 12).
import { useState } from "react";

const POR_PAGINA_DEFAULT = 12;

function usePaginacion(total, porPagina = POR_PAGINA_DEFAULT) {
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  const fin = inicio + porPagina;
  return {
    pagina: paginaActual,
    totalPaginas,
    inicio,
    fin,
    porPagina,
    irA: (p) => setPagina(Math.min(Math.max(1, p), totalPaginas)),
    reset: () => setPagina(1),
  };
}

function Paginador({ pagina, totalPaginas, irA }) {
  if (totalPaginas <= 1) return null;
  const nums = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginación"
    >
      <button
        type="button"
        onClick={() => irA(pagina - 1)}
        disabled={pagina <= 1}
        className="rounded-lg border border-gray-700 bg-[#111827] px-3 py-2 text-sm font-bold text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        ‹
      </button>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => irA(n)}
          aria-current={n === pagina ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
            n === pagina
              ? "bg-cyan-400 text-gray-900"
              : "border border-gray-700 bg-[#111827] text-gray-300 hover:bg-gray-800"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => irA(pagina + 1)}
        disabled={pagina >= totalPaginas}
        className="rounded-lg border border-gray-700 bg-[#111827] px-3 py-2 text-sm font-bold text-gray-300 transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>
  );
}

export default Paginador;
export { usePaginacion, POR_PAGINA_DEFAULT as POR_PAGINA };