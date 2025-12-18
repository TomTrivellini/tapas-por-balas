import { Link } from "react-router-dom";
import { useGame } from "../context/GameContext";
import RecruitCard from "../components/recruits/RecruitCard";

export default function Home() {
  const { inventoryRecruits, team } = useGame();

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

      {team.length > 0 && (
        <section>
          <h2>Equipo Actual</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {team.map((index) => (
              <RecruitCard key={index} recruit={inventoryRecruits[index]} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
