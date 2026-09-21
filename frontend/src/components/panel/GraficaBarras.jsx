// Gráfica de barras horizontales simple (CSS) para los dashboards.
// Recibe: items = [{ label, value, color? }], y opcional maxValue.

function GraficaBarras({ items, maxValue, formato }) {
  const max = maxValue || Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const ancho = Math.max(2, Math.round((item.value / max) * 100));
        const color = item.color || "#22d3ee";
        return (
          <div key={idx}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="capitalize text-gray-300">{item.label}</span>
              <span className="font-semibold text-white">
                {formato ? formato(item.value) : item.value}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${ancho}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GraficaBarras;
