import InventoryList from "../components/inventory/InventoryList";
import RecruitList from "../components/inventory/RecruitList";
import DeceasedRecruits from "../components/inventory/muertos/DeceasedRecruits";
import { useTeam } from "../context/TeamContext";

export default function InventoryPage() {
  const { fallecidos } = useTeam();

  return (
    <div>
      <h1 className="page__title">Inventario</h1>
      <InventoryList />
      <RecruitList />
      
      {fallecidos.length > 0 && (
        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ color: "#f00" }}>⚰️ Fallecidos ({fallecidos.length})</h2>
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Aquí están tus reclutas caídos en batalla. Puedes recuperar su equipamiento.
          </p>
          <DeceasedRecruits />
        </section>
      )}
    </div>
  );
}
