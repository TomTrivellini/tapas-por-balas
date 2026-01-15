import { useState } from "react";
import { useCart } from "../../context/CartContext";
import ItemCount from "./ItemCount";

function formatSub(entry) {
  if (entry.kind === "recluta") return "Recluta";
  if (entry.type === "arma") return `Daño +${entry.effect.value} · Capacidad ${entry.ammoCapacity}`;
  if (entry.type === "equipo") return `${entry.effect.stat} +${entry.effect.value}`;
  if (entry.type === "consumible") return `Vida +${entry.effect.value}`;
  if (entry.type === "munición") return "Munición";
  return entry.type;
}

export default function ItemCard({ entry }) {
  const { agregarAlCarrito } = useCart();
  const [msg, setMsg] = useState("");

  function onAdd(qty) {
    agregarAlCarrito(entry.id, qty);
    setMsg(`Agregado: ${qty} x ${entry.name}`);
  }

  const stock = entry.kind === "recluta" ? 1 : 99;
  const initial = entry.kind === "recluta" ? 1 : 1;

  return (
    <article className="card">
      <div className="card__top">
        <h3 className="card__title">{entry.name}</h3>
        <div className="tag">{entry.category}</div>
      </div>

      <p className="card__sub">{formatSub(entry)}</p>

      <div className="card__bottom">
        <span className="price">${entry.price}</span>
        <ItemCount stock={stock} initial={initial} onAdd={onAdd} />
      </div>

      {msg && <p className="notice">{msg}</p>}
    </article>
  );
}
