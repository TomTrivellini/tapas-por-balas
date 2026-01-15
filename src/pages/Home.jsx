import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { useTeam } from "../context/TeamContext";
import RecruitCard from "../components/recruits/RecruitCard";

export default function Home() {
  const { reclutasInventario } = useInventory();
  const { equipo } = useTeam();

  return (
    <div>
      <h1 className="intro__title">Tapas por balas</h1>
      <p className="muted">
        Reclutá personajes y comprá equipo. Lucha y muere por tapas.
      </p>

      <div className="intro__actions">
        <Link className="btn btn--primary" to="/shop">
          Ir a la tienda
        </Link>
        <Link className="btn" to="/inventory">
          Ver inventario
        </Link>
      </div>

      {equipo.length > 0 && (
        <section>
          <h2>Equipo Actual</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {equipo.map((index) => (
              <RecruitCard key={index} recruit={reclutasInventario[index]} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
