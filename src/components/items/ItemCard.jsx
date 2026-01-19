import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { items } from "../../data/shopItems";
import ItemCount from "./ItemCount";

const itemsById = new Map(items.map((item) => [item.id, item]));

function formatSub(entry) {
  if (entry.kind === "recluta") return "Recluta";
  if (entry.type === "arma") return `daño ${entry.damage ?? 0}`;
  if (entry.type === "equipo") {
    const parts = [];
    if (typeof entry.shield === "number" && entry.shield > 0) {
      parts.push(`escudo +${entry.shield}`);
    }
    if (typeof entry.apBonusValue === "number" && entry.apBonusValue > 0) {
      parts.push(`ap +${entry.apBonusValue}`);
    }
    if (entry.effect === "chupasangre") {
      parts.push("chupasangre");
    }
    return parts.length > 0 ? parts.join(" · ") : "equipo";
  }
  if (entry.type === "object") {
    if (entry.heal) return `vida +${entry.heal}`;
    if (entry.apBonusValue) return `ap +${entry.apBonusValue}`;
    if (entry.immobilizeRounds) return `inmoviliza ${entry.immobilizeRounds}`;
    if (entry.damage) return `daño ${entry.damage}`;
  }
  if (entry.type === "ammo" || entry.type === "munición") {
    const weaponName = itemsById.get(entry.ammoFor)?.name || entry.ammoFor || "arma";
    return `municion para ${weaponName}`;
  }
  return entry.type || entry.category || "";
}

export default function ItemCard({ entry }) {
  const { agregarAlCarrito } = useCart();
  const [msg, setMsg] = useState("");
  const subtitle = entry.subtitle ?? formatSub(entry);

  function onAdd(qty) {
    agregarAlCarrito(entry.id, qty);
    setMsg(`Agregado: ${qty} x ${entry.name}`);
  }

  const stock = Number.isFinite(entry?.stock) ? entry.stock : 99;
  const initial = 1;

  return (
    <article className="card">
      <div className="card__top">
        <div className="card__title-wrap">
          <h3 className="card__title">{entry.name}</h3>
          <span className="price">${entry.price}</span>
        </div>
        <div className="tag">{entry.category}</div>
      </div>

      <p className="card__sub">{subtitle}</p>

      <div className="card__bottom">
        <ItemCount stock={stock} initial={initial} onAdd={onAdd} />
      </div>

      <div className="card__bottom">
        <Link className="btn btn--ghost" to={`/item/${entry.id}`}>
          Ver detalle
        </Link>
      </div>

      {msg && <p className="notice">{msg}</p>}
    </article>
  );
}
