// Gráfica lineal SVG para los dashboards.
// Recibe: items = [{ label?, fecha?, total?, value? }]
// Considera valores negativos (pérdidas): la escala va del mínimo
// al máximo absoluto y los puntos negativos se muestran debajo del eje.
function GraficaLineal({ items }) {
  const datos = items.map((i) => Number(i.total ?? i.value ?? 0));
  const maxAbs = Math.max(1, ...datos.map((v) => Math.abs(v)));
  const width = 560;
  const height = 180;
  const padX = 40;
  const padY = 24;

  if (!items.length) {
    return <p className="text-sm text-gray-500">Sin datos para mostrar.</p>;
  }

  // Rango: [-maxAbs, maxAbs]; y=0 en el centro vertical.
  const rango = maxAbs * 2 || 2;
  const yDe = (valor) => height - padY - ((valor + maxAbs) / rango) * (height - padY * 2);
  const yCero = yDe(0);

  const puntos = items.map((item, idx) => {
    const x = padX + (idx * (width - padX * 2)) / Math.max(items.length - 1, 1);
    const valor = Number(item.total ?? item.value ?? 0);
    return { ...item, x, y: yDe(valor), valor };
  });

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(" ");
  const hayPerdidas = puntos.some((p) => p.valor < 0);
  // Área bajo la curva: solo tiene sentido cuando no hay pérdidas.
  const area = hayPerdidas
    ? ""
    : `${padX},${yCero} ${linea} ${width - padX},${yCero}`;

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
        {/* Eje cero (marcado) */}
        <line
          x1={padX}
          x2={width - padX}
          y1={yCero}
          y2={yCero}
          stroke="#475569"
          strokeWidth="1.5"
        />
        {area && <polygon points={area} fill="#22d3ee" opacity="0.15" />}
        <polyline points={linea} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {puntos.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill={p.valor < 0 ? "#ef4444" : "#0ea5e9"} />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill={p.valor < 0 ? "#ef4444" : "#94a3b8"}>
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
