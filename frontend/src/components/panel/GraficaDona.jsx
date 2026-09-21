// Gráfica de dona (CSS conic-gradient) para los dashboards.
// Recibe: items = [{ label, value, color? }]

function GraficaDona({ items, formato }) {
  const total = items.reduce((acc, i) => acc + Number(i.value || 0), 0);
  if (!total) {
    return <p className="text-sm text-gray-500">Sin datos para mostrar.</p>;
  }

  let acumulado = 0;
  const segmentos = items.map((i) => {
    const desde = (acumulado / total) * 360;
    acumulado += Number(i.value || 0);
    const hasta = (acumulado / total) * 360;
    return { ...i, desde, hasta };
  });

  const fondo = segmentos
    .map((s) => `${s.color || "#22d3ee"} ${s.desde}deg ${s.hasta}deg`)
    .join(", ");

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div
        role="img"
        aria-label="Gráfica de dona"
        className="h-44 w-44 rounded-full"
        style={{ background: `conic-gradient(${fondo})`, WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 34px), #000 calc(100% - 34px))", mask: "radial-gradient(farthest-side, transparent calc(100% - 34px), #000 calc(100% - 34px))" }}
      />
      <ul className="space-y-2 text-sm">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: i.color || "#22d3ee" }} />
            <span className="capitalize text-gray-300">{i.label}</span>
            <span className="font-semibold text-white">{formato ? formato(i.value) : i.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GraficaDona;
