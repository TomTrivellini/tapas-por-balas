import { useGame } from "../context/GameContext.jsx";

export default function InventoryList() {
  const { inventoryItems, inventoryRecruits, byId } = useGame();

  return (
    <div className="inv">
      <section className="inv__section">
        <h2 className="inv__title">Reclutas</h2>
        {inventoryRecruits.length === 0 ? (
          <p className="muted">Todavía no reclutaste a nadie.</p>
        ) : (
          <ul className="list">
            {inventoryRecruits.map((r, idx) => (
              <li key={`${r.id}-${idx}`} className="list__item">
                {r.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="inv__section">
        <h2 className="inv__title">Objetos</h2>
        {inventoryItems.length === 0 ? (
          <p className="muted">Todavía no compraste objetos.</p>
        ) : (
          <ul className="list">
            {inventoryItems.map((row) => {
              const entry = byId.get(row.id);
              if (!entry) return null;
              return (
                <li key={row.id} className="list__item">
                  <span>{entry.name}</span>
                  <span className="badge">x{row.qty}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
