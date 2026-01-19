import { useInventory } from "../../context/InventoryContext";
import RecruitCard from "./RecruitCard";

export default function RecruitList() {
  const { reclutasInventario } = useInventory();
  const reclutasVivos = reclutasInventario
    .map((recruit, index) => ({ recruit, index }))
    .filter(({ recruit }) => recruit && !recruit.muerto);

  return (
    <div>
      <h2>Reclutas</h2>
      {reclutasVivos.length === 0 ? (
        <p>No hay reclutas.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {reclutasVivos.map(({ recruit, index }) => (
            <RecruitCard key={index} recruit={recruit} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
