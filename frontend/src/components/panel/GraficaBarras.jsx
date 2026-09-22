// Gráfica de barras horizontales simple (CSS) para los dashboards.
// Recibe: items = [{ label, value, color? }], y opcional maxValue.
// Los valores negativos se consideran pérdidas y se pintan en rojo
// hacia la izquierda (ancho proporcional a la magnitud).
function GraficaBarras({ items, maxValue, formato }) {
  const valores = items.map((i) => i.value);
  const maxAbs = Math.max(1, ...valores.map((v) => Math.abs(v)));

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const esPerdida = item.value < 0;
        const ancho = Math.max(2, Math.round((Math.abs(item.value) / maxAbs) * 100));
        const color = item.color || (esPerdida ? "#ef4444" : "#22d3ee");
        return (
          <div key={idx}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="capitalize text-gray-300">{item.label}</span>
              <span className={`font-semibold ${esPerdida ? "text-red-400" : "text-white"}`}>
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
