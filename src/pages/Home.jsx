import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useInventory } from "../context/InventoryContext";
import { useTeam } from "../context/TeamContext";
import { BattleProvider } from "../game/state/BattleContext";
import { generateDefaultEnemyTeam } from "../game/state/battleInitialState";
import Juego from "../components/Juego/Juego";

export default function Home() {
  const { reclutasInventario } = useInventory();
  const { equipo } = useTeam();
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [battleTeam, setBattleTeam] = useState([]);

  // Usamos useMemo para evitar recalcular equipoData en cada render
  const equipoData = useMemo(() => 
    equipo
      .map((idx) => {
        const recruit = reclutasInventario[idx];
        if (!recruit || recruit.muerto) return null;
        return { ...recruit, inventoryIndex: idx };
      })
      .filter(Boolean),
    [equipo, reclutasInventario]
  );

  const handleStartBattle = useCallback(() => {
    if (equipoData.length > 0) {
      setBattleTeam(equipoData); // "Congela" el equipo para la batalla
      setEnemyTeam(generateDefaultEnemyTeam());
      setIsBattleActive(true);
    }
  }, [equipoData]);

  const handleEndBattle = useCallback(() => {
    setIsBattleActive(false);
    setBattleTeam([]);
    setEnemyTeam([]);
  }, []);

  return (
    <div>
      {equipo.length > 0 ? (
        <>
          <section style={{ marginTop: "2rem", marginBottom: "3rem" }}>
            {isBattleActive ? (
              <BattleProvider initialTeamA={battleTeam} initialTeamB={enemyTeam}>
                <Juego onBattleEnd={handleEndBattle} />
              </BattleProvider>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333" }}>
                <h2 style={{ marginBottom: "1rem" }}>Listo para la acción</h2>
                <p className="muted" style={{ marginBottom: "1.5rem" }}>
                  Tu equipo está formado por {equipoData.length} recluta(s).
                </p>
                <button className="btn btn--primary" onClick={handleStartBattle} disabled={equipoData.length === 0}>
                  Iniciar Batalla
                </button>
              </div>
            )}
          </section>

        </>
      ) : (
        <section style={{ marginTop: "3rem", padding: "2rem", backgroundColor: "#1a1a1a", borderRadius: "8px", border: "1px solid #333", textAlign: "center" }}>
          <h2 style={{ color: "#888", marginBottom: "1rem" }}>⚔️ Sin Equipo</h2>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Necesitas reclutar personajes para comenzar una batalla. Ve a la tienda y compra al menos un recluta.
          </p>
          <Link className="btn btn--primary" to="/shop">
            Ir a la tienda a reclutar
          </Link>
        </section>
      )}
    </div>
  );
}
