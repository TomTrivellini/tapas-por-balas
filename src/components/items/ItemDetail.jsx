import { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import ItemCount from "./ItemCount";

function detailLine(entry) {
  if (entry.kind === "recluta") return "Recluta sin stats (por ahora).";
  if (entry.type === "arma") return `Daño +${entry.effect.value} · Capacidad ${entry.ammoCapacity}`;
  if (entry.type === "equipo") return `+${entry.effect.value} ${entry.effect.stat}`;
  if (entry.type === "consumible") return `Recupera +${entry.effect.value} HP`;
  if (entry.type === "munición") return "Munición para arma";
  return entry.type;
}

export default function ItemDetail({ entry }) {
  const { agregarAlCarrito } = useCart();
  const [msg, setMsg] = useState("");

  const info = useMemo(() => detailLine(entry), [entry]);

  function onAdd(qty) {
    agregarAlCarrito(entry.id, qty);
    setMsg(`Agregado al carrito: ${qty} x ${entry.name}`);
  }

  function onRecruit() {
    agregarAlCarrito(entry.id, 1);
    setMsg(`Reclutaste a ${entry.name}`);
  }

  return (
    <section className="detail">
      <div className="detail__head">
        <div>
          <h1 className="detail__title">{entry.name}</h1>
          <div className="detail__meta">
            <span className="tag">{entry.category}</span>
            <span className="price">${entry.price}</span>
          </div>
        </div>
      </div>

      <p className="detail__info">{info}</p>

      {entry.kind === "recluta" ? (
        <button className="btn btn--primary" onClick={onRecruit}>
          Reclutar (compra directa)
        </button>
      ) : (
        <div className="detail__buy">
          <ItemCount stock={99} initial={1} onAdd={onAdd} />
        </div>
      )}

      {msg && <p className="notice">{msg}</p>}
    </section>
  );
}
