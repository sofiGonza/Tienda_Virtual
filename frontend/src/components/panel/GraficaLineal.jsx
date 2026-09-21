// Gráfica lineal SVG para los dashboards.
// Recibe: items = [{ label?, fecha?, total?, value? }]

function GraficaLineal({ items }) {
  const datos = items.map((i) => Number(i.total ?? i.value ?? 0));
  const max = Math.max(...datos, 1);
  const width = 560;
  const height = 180;
  const padX = 40;
  const padY = 24;

  if (!items.length) {
    return <p className="text-sm text-gray-500">Sin datos para mostrar.</p>;
  }

  const puntos = items.map((item, idx) => {
    const x = padX + (idx * (width - padX * 2)) / Math.max(items.length - 1, 1);
    const y = height - padY - (Number(item.total ?? item.value ?? 0) / max) * (height - padY * 2);
    return { ...item, x, y };
  });

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padX},${height - padY} ${linea} ${width - padX},${height - padY}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfica lineal">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={height - padY - f * (height - padY * 2)}
            y2={height - padY - f * (height - padY * 2)}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
        ))}
        <polygon points={area} fill="#22d3ee" opacity="0.15" />
        <polyline points={linea} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0ea5e9" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#94a3b8">
              {p.total ?? p.value ?? 0}
            </text>
            <text x={p.x} y={height - 6} textAnchor="middle" fontSize="10" fill="#64748b">
              {p.fecha ?? p.label ?? ""}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default GraficaLineal;
