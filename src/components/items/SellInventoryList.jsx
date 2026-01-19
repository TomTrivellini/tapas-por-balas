import SellItemCard from "./SellItemCard";
import { useInventory } from "../../context/InventoryContext";

export default function SellInventoryList() {
  const { inventario, porId } = useInventory();

  const sellable = inventario.filter((row) => row.qty > 0 && porId.get(row.id));

  if (sellable.length === 0) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <p className="muted">No tenés objetos para vender.</p>
      </div>
    );
  }

  return (
    <div className="grid" style={{ marginTop: "2rem" }}>
      {sellable.map((row) => (
        <SellItemCard key={row.id} inventoryItem={row} />
      ))}
    </div>
  );
}
