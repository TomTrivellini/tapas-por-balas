import { useState } from "react";
import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { useTeam } from "../context/TeamContext";
import RecruitCard from "../components/recruits/RecruitCard";
import { BattleProvider } from "../game/state/BattleContext";
import Juego from "../game/Juego/Juego";

export default function Home() {
  const { reclutasInventario } = useInventory();
  const { equipo } = useTeam();
  const [showBattle, setShowBattle] = useState(false);

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
        <button className="btn" onClick={() => setShowBattle(!showBattle)}>
          {showBattle ? "Cerrar Batalla" : "Iniciar Batalla"}
        </button>
      </div>

      {showBattle && (
        <section style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <BattleProvider>
            <Juego />
          </BattleProvider>
        </section>
      )}

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
