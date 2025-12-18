import { useGame } from "../../context/GameContext";

export default function CartRow({ row }) {
  const { byId, sumCart, resCart, removeFromCart } = useGame();
  const entry = byId.get(row.id);
  if (!entry) return null;

  const subtotal = entry.price * row.qty;

  return (
    <div className="cartRow">
      <div className="cartRow__left">
        <div className="cartRow__name">{entry.name}</div>
        <div className="cartRow__meta muted">
          ${entry.price} c/u · {entry.category}
        </div>
      </div>

      <div className="cartRow__mid">
        <button className="btn btn--ghost" onClick={() => resCart(row.id)}>
          –
        </button>
        <span className="cartRow__qty">{row.qty}</span>
        <button className="btn btn--ghost" onClick={() => sumCart(row.id)}>
          +
        </button>
      </div>

      <div className="cartRow__right">
        <div className="cartRow__subtotal">${subtotal}</div>
        <button className="btn btn--danger" onClick={() => removeFromCart(row.id)} title="Eliminar">
          X
        </button>
      </div>
    </div>
  );
}
