import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import { useCart } from "../../context/CartContext";
import ItemCount from "./ItemCount";

export default function SellItemCard({ inventoryItem }) {
  const { porId, removerItemDelInventario } = useInventory();
  const { agregarTapas } = useCart();
  const [msg, setMsg] = useState("");

  const itemData = porId.get(inventoryItem.id);
  if (!itemData) {
    return null;
  }

  const sellPrice = Math.floor((itemData.price || 0) / 2);
  const canSell = sellPrice > 0 && inventoryItem.qty > 0;

  const handleSell = (qty) => {
    if (!canSell) return;
    const amount = Math.min(qty, inventoryItem.qty);
    if (amount <= 0) return;
    removerItemDelInventario(inventoryItem.id, amount);
    agregarTapas(sellPrice * amount);
    setMsg(`Vendiste ${amount} x ${itemData.name} (+${sellPrice * amount} tapas)`);
  };

  return (
    <article className="card">
      <div className="card__top">
        <h3 className="card__title">{itemData.name}</h3>
        <div className="tag">Cantidad: {inventoryItem.qty}</div>
      </div>

      <p className="card__sub">{itemData.category || itemData.type || ""}</p>

      <div className="card__bottom">
        <span className="price">+${sellPrice}</span>
        <ItemCount
          stock={inventoryItem.qty}
          initial={1}
          onAdd={handleSell}
          ctaLabel="Vender"
          disabled={!canSell}
        />
      </div>

      {msg && <p className="notice">{msg}</p>}
      {!canSell && <p className="muted">No se puede vender este objeto.</p>}
    </article>
  );
}
