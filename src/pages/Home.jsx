import { useState, useMemo, useCallback } from "react";
import { useInventory } from "../context/InventoryContext";
import { useTeam } from "../context/TeamContext";
import { useCatalog } from "../context/CatalogContext";
import { BattleProvider } from "../game2/BattleContext";
import { generateDefaultEnemyTeam } from "../game/state/battleInitialState";
import Juego from "../components/Juego/Juego";
import { createAlphaRecruit } from "../context/actions/cartActions";
import { HISTORIAS } from "../data/historias";
import { ZONAS } from "../data/zonas";

export default function Home() {
  const { reclutasInventario, agregarAlInventario } = useInventory();
  const { equipo, agregarAlEquipo } = useTeam();
  const { items, loading: catalogLoading } = useCatalog();
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [enemyTeam, setEnemyTeam] = useState([]);
  const [battleTeam, setBattleTeam] = useState([]);
  const previewEnemies = useMemo(() => {
    if (catalogLoading || items.length === 0) return [];
    return generateDefaultEnemyTeam(items);
  }, [catalogLoading, items]);

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
    if (equipoData.length > 0 && !catalogLoading) {
      setBattleTeam(equipoData); // "Congela" el equipo para la batalla
      setEnemyTeam(previewEnemies.length > 0 ? previewEnemies : generateDefaultEnemyTeam(items));
      setIsBattleActive(true);
    }
  }, [equipoData, catalogLoading, items, previewEnemies]);

  const handleEndBattle = useCallback(() => {
    setIsBattleActive(false);
    setBattleTeam([]);
    setEnemyTeam([]);
  }, []);

  const handleCreateAlphaTeam = useCallback(() => {
    if (catalogLoading || !items.length) return;
    if (equipo.length >= 3) return;
    const baseIndex = reclutasInventario.length;
    const recruits = [
      createAlphaRecruit(items),
      createAlphaRecruit(items),
      createAlphaRecruit(items),
    ];
    agregarAlInventario([], recruits);
    recruits.forEach((_, idx) => agregarAlEquipo(baseIndex + idx));
  }, [catalogLoading, items, agregarAlInventario, agregarAlEquipo, reclutasInventario.length, equipo.length]);

  const alliesList = useMemo(
    () => equipoData.map((recluta) => recluta.name).filter(Boolean),
    [equipoData]
  );
  const enemiesList = useMemo(
    () => previewEnemies.map((enemy) => enemy.name).filter(Boolean),
    [previewEnemies]
  );

  const story = useMemo(() => {
    if (catalogLoading) return null;
    const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
    const safePick = (list, fallback) => (list.length > 0 ? pickRandom(list) : fallback);

    const zone = safePick(ZONAS, "Zona desconocida");
    const objectItems = items.filter((item) => item.category === "objetos");
    const objectName = safePick(
      objectItems.map((item) => item.name).filter(Boolean),
      "un botín"
    );
    const allyName = safePick(alliesList, "Un recluta");
    const enemyName = safePick(enemiesList, "El enemigo");
    const template = safePick(HISTORIAS, HISTORIAS[0]);
    const replaceTokens = (text) =>
      text
        .replace(/\{Enemigo\}/g, enemyName)
        .replace(/\{Aliado\}/g, allyName)
        .replace(/\{Zona\}/g, zone)
        .replace(/\{Objeto\}/g, objectName);
    return {
      title: replaceTokens(template.title),
      subtitle: replaceTokens(template.subtitle),
      zone,
    };
  }, [catalogLoading, items, alliesList, enemiesList]);

  return (
    <div>
      {equipo.length > 0 ? (
        <>
          <section className="home__battle">
            {isBattleActive ? (
              <BattleProvider
                initialTeamA={battleTeam}
                initialTeamB={enemyTeam}
                catalogItems={items}
              >
                <Juego onBattleEnd={handleEndBattle} />
              </BattleProvider>
            ) : (
              <div className="home__panel">
                <div className="home__story-grid">
                  <div className="home__story-card">
                    <span className="home__story-label">Aliados</span>
                    <span className="home__story-value">
                      {alliesList.length > 0 ? alliesList.join(" · ") : "-"}
                    </span>
                  </div>
                  <div className="home__story-card">
                    <span className="home__story-label">Enemigos</span>
                    <span className="home__story-value">
                      {enemiesList.length > 0 ? enemiesList.join(" · ") : "-"}
                    </span>
                  </div>
                  <div className="home__story-card">
                    <span className="home__story-label">Zona</span>
                    <span className="home__story-value">{story?.zone || "-"}</span>
                  </div>
                </div>
                <h2 className="home__story-title">{story?.title || "Listo para la acción"}</h2>
                <p className="muted home__story-desc">
                  {story?.subtitle || "Las armas ya están cargadas."}
                </p>
                <button
                  className="btn btn--primary"
                  onClick={handleStartBattle}
                  disabled={equipoData.length === 0 || catalogLoading}
                >
                  {catalogLoading ? "Cargando catálogo..." : "Pelear"}
                </button>
              </div>
            )}
          </section>

        </>
      ) : (
        <section className="home__empty">
          <h2 className="home__empty-title">Felicidades</h2>
          <p className="muted home__empty-desc">
             Eres de los pocos seres pensantes en este mundo destruido. cualquier idiota seguira tus ordenes asi que sal y diviertete. Te regalo estos tres reclutas, no dejes que mueran tan rapido.
          </p>
          <button
            className="btn btn--primary"
            onClick={handleCreateAlphaTeam}
            disabled={catalogLoading}
          >
            Descubre el mundo
          </button>
        </section>
      )}
    </div>
  );
}
