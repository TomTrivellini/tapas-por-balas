import { useInventory } from "../../context/InventoryContext";
import RecruitCard from "./RecruitCard";

export default function RecruitList() {
  const { reclutasInventario } = useInventory();

  return (
    <div>
      <h2>Reclutas</h2>
      {reclutasInventario.length === 0 ? (
        <p>No hay reclutas.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {reclutasInventario.map((recruit, index) => (
            <RecruitCard key={index} recruit={recruit} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}