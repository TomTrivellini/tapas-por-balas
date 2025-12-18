import { useGame } from "../../context/GameContext";

export default function InventoryList() {
  const { inventario, byId } = useGame();

  return (
    <div className="inv">
      <section className="inv__section">
        <h2 className="inv__title">Objetos</h2>
        {inventario.length === 0 ? (
          <p className="muted">Todavía no compraste objetos.</p>
        ) : (
          <ul className="list">
            {inventario.map((row) => {
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
