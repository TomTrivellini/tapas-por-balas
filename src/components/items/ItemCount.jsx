import { useEffect, useState } from "react";

export default function ItemCount({
  stock = Number.POSITIVE_INFINITY,
  initial = 1,
  onAdd,
  onCountChange,
  ctaLabel = "Agregar al carrito",
  disabled = false,
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    setCount((c) => {
      if (stock <= 0) return 1;
      return Math.min(stock, Math.max(1, c));
    });
  }, [stock]);

  useEffect(() => {
    if (typeof onCountChange === "function") {
      onCountChange(count);
    }
  }, [count, onCountChange]);

  const isActionDisabled = disabled || stock <= 0;

  return (
    <div className="count">
      <button
        className="btn btn--ghost"
        onClick={() => setCount((c) => Math.max(1, c - 1))}
        disabled={count <= 1}
      >
        –
      </button>

      <span className="count__value">{count}</span>

      <button
        className="btn btn--ghost"
        onClick={() => setCount((c) => Math.min(stock, c + 1))}
        disabled={count >= stock}
      >
        +
      </button>

      <button
        className="btn btn--primary"
        onClick={() => onAdd(count)}
        disabled={isActionDisabled}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
