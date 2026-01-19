import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ItemCount from "./ItemCount";

function detailLine(entry) {
  if (entry.kind === "recluta") return "";
  if (entry.type === "arma") return `Daño ${entry.damage ?? 0}`;
  if (entry.type === "equipo") {
    const parts = [];
    if (typeof entry.shield === "number" && entry.shield > 0) {
      parts.push(`Escudo +${entry.shield}`);
    }
    if (typeof entry.apBonusValue === "number" && entry.apBonusValue > 0) {
      parts.push(`AP +${entry.apBonusValue}`);
    }
    if (entry.effect === "chupasangre") {
      parts.push("Chupasangre");
    }
    return parts.length > 0 ? parts.join(" · ") : "Equipo";
  }
  if (entry.type === "object") {
    if (entry.heal) return `Recupera +${entry.heal} HP`;
    if (entry.apBonusValue) {
      return `Gana +${entry.apBonusValue} AP por ${entry.apBonusRounds ?? 0} rondas`;
    }
    if (entry.immobilizeRounds) return `Inmoviliza ${entry.immobilizeRounds} rondas`;
    if (entry.damage) return `Daño ${entry.damage}`;
    return "Objeto";
  }
  if (entry.type === "ammo" || entry.type === "munición") {
    return `Municion para ${entry.ammoFor || "arma"}`;
  }
  return entry.type || "";
}

export default function ItemDetail({ entry }) {
  const { agregarAlCarrito } = useCart();
  const [msg, setMsg] = useState("");
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const info = useMemo(() => detailLine(entry), [entry]);
  const description = entry?.description || "";
  const stock = Number.isFinite(entry?.stock) ? entry.stock : 99;
  const total = entry?.price ? entry.price * qty : 0;
  const isOutOfStock = stock <= 0;

  useEffect(() => {
    setMsg("");
    setAdded(false);
    setQty(1);
  }, [entry?.id]);

  function onAdd(qty) {
    agregarAlCarrito(entry.id, qty);
    setMsg(`Agregado al carrito: ${qty} x ${entry.name}`);
    setAdded(true);
  }

  return (
    <section className="detail">
      <div style={{ marginBottom: "12px" }}>
        <Link className="btn btn--ghost" to="/shop">
          ← Volver a la tienda
        </Link>
      </div>
      <div className="detail__head">
        <div>
          <div className="detail__meta">
            <span className="tag">{entry.category}</span>
          </div>
          <h1 className="detail__title">{entry.name}</h1>
          {description && <p className="detail__desc">{description}</p>}
        </div>
      </div>

      {info && <p className="detail__info">{info}</p>}

      {isOutOfStock ? (
        <div className="detail__buy">
          <span className="notice">Producto sin stock.</span>
        </div>
      ) : added ? (
        <div className="detail__buy">
          <span className="muted">Producto agregado al carrito.</span>
        </div>
      ) : (
        <div className="detail__buy">
          <ItemCount
            stock={stock}
            initial={1}
            onAdd={onAdd}
            onCountChange={setQty}
            ctaLabel="Agregar al carrito"
          />
          <div className="detail__price-line">Precio: ${entry.price}</div>
          <div className="detail__total">Total: ${total}</div>
        </div>
      )}

      {msg && <p className="notice">{msg}</p>}
    </section>
  );
}
