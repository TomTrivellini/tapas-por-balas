import { Link } from "react-router-dom";

function formatSub(entry) {
  if (entry.kind === "recruit") return "Recluta (compra directa)";
  if (entry.type === "weapon") return `Daño +${entry.effect.value} · Cap ${entry.ammoCapacity}`;
  if (entry.type === "gear") return `${entry.effect.stat.toUpperCase()} +${entry.effect.value}`;
  if (entry.type === "consumable") return `HP +${entry.effect.value}`;
  if (entry.type === "ammo") return "Munición";
  return entry.type;
}

export default function ItemCard({ entry }) {
  return (
    <article className="card">
      <div className="card__top">
        <h3 className="card__title">{entry.name}</h3>
        <div className="tag">{entry.category}</div>
      </div>

      <p className="card__sub">{formatSub(entry)}</p>

      <div className="card__bottom">
        <span className="price">${entry.price}</span>
        <Link className="link" to={`/shop/item/${entry.id}`}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
