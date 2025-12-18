import { useState } from "react";

export default function ItemCount({ stock, initial = 1, onAdd }) {
  const [count, setCount] = useState(initial);

  return (
    <div className="count">
      <button className="btn btn--ghost" onClick={() => setCount((c) => Math.max(1, c - 1))}>
        –
      </button>

      <span className="count__value">{count}</span>

      <button className="btn btn--ghost" onClick={() => setCount((c) => Math.min(stock, c + 1))}>
        +
      </button>

      <button className="btn btn--primary" onClick={() => onAdd(count)}>
        Agregar al carrito
      </button>
    </div>
  );
}
