import { useGame } from "../../context/GameContext";
import RecruitCard from "./RecruitCard";

export default function RecruitList() {
  const { inventoryRecruits } = useGame();

  return (
    <div>
      <h2>Reclutas</h2>
      {inventoryRecruits.length === 0 ? (
        <p>No hay reclutas.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {inventoryRecruits.map((recruit, index) => (
            <RecruitCard key={index} recruit={recruit} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}