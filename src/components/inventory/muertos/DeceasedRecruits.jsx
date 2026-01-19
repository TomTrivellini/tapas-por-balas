import { useTeam } from "../../../context/TeamContext";
import { useInventory } from "../../../context/InventoryContext";
import DeceasedInventory from "./DeceasedInventory";

export default function DeceasedRecruits() {
  const { fallecidos } = useTeam();
  const { porId } = useInventory();

  if (fallecidos.length === 0) {
    return <p className="muted">No hay reclutas fallecidos.</p>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
      {fallecidos.map((deceased, index) => {
        const weapon = deceased.weapon ? porId.get(deceased.weapon) : null;
        const helmet = deceased.helmet ? porId.get(deceased.helmet) : null;
        const vest = deceased.vest ? porId.get(deceased.vest) : null;
        const objectEntry = deceased.objectItem ? porId.get(deceased.objectItem) : null;

        return (
          <div key={index} style={{ border: "1px solid #999", padding: "1rem", borderRadius: "4px", backgroundColor: "#1a0a0a" }}>
            <h3 style={{ color: "#f00" }}>☠️ {deceased.name}</h3>
            
            <div style={{ marginBottom: "1rem", fontSize: "12px", color: "#888" }}>
              <p>Munición restante: {deceased.ammo}</p>
            </div>

            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Arma:</strong> {weapon ? weapon.name : "Ninguna"}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Casco:</strong> {helmet ? helmet.name : "Ninguno"}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Chaleco:</strong> {vest ? vest.name : "Ninguno"}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Objeto:</strong> {objectEntry ? objectEntry.name : "Ninguno"}
            </div>

            <DeceasedInventory deceasedIndex={index} deceased={deceased} />
          </div>
        );
      })}
    </div>
  );
}
