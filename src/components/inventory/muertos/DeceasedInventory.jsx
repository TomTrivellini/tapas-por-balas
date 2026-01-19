import { useState } from "react";
import { useTeam } from "../../../context/TeamContext";
import { useInventory } from "../../../context/InventoryContext";

export default function DeceasedInventory({ deceasedIndex, deceased }) {
  const { removerDeFallecidos } = useTeam();
  const { agregarAlInventario } = useInventory();
  const [isOpen, setIsOpen] = useState(false);

  const handleRecoverAll = () => {
    // Recuperar todas las armas, cascos, chalecos y consumibles
    const itemsToRecover = [];
    
    if (deceased.weapon) {
      itemsToRecover.push({ id: deceased.weapon, qty: 1 });
    }
    if (deceased.helmet) {
      itemsToRecover.push({ id: deceased.helmet, qty: 1 });
    }
    if (deceased.vest) {
      itemsToRecover.push({ id: deceased.vest, qty: 1 });
    }
    if (deceased.objectItem) {
      itemsToRecover.push({ id: deceased.objectItem, qty: 1 });
    }
    if (deceased.ammo > 0 && deceased.weapon) {
      // Devolver munición
      const ammoId = `amm-${deceased.weapon}`;
      itemsToRecover.push({ id: ammoId, qty: deceased.ammo });
    }

    // Agregar items al inventario global
    if (itemsToRecover.length > 0) {
      agregarAlInventario(itemsToRecover, []);
      alert("Equipamiento recuperado y agregado al inventario.");
    }

    // Remover del lista de fallecidos
    removerDeFallecidos(deceasedIndex);
    setIsOpen(false);
  };

  return (
    <>
      <button
        style={{
          padding: "8px 12px",
          backgroundColor: "#3a1a1a",
          border: "1px solid #888",
          color: "#f88",
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "11px",
          fontWeight: "bold",
          width: "100%",
        }}
        onClick={() => setIsOpen(true)}
      >
        Recuperar Equipamiento
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "black",
              color: "white",
              padding: "1rem",
              borderRadius: "4px",
              border: "1px solid white",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h4>Recuperar Equipamiento de {deceased.name}</h4>
            <p style={{ fontSize: "12px", color: "#ccc", marginBottom: "1rem" }}>
              Se recuperarán todos los items y la munición restante.
            </p>

            <div style={{ marginBottom: "1rem", fontSize: "12px" }}>
              {deceased.weapon && <p>🔫 {deceased.weapon}</p>}
              {deceased.helmet && <p>🪖 {deceased.helmet}</p>}
              {deceased.vest && <p>🦺 {deceased.vest}</p>}
              {deceased.objectItem && <p>🍖 {deceased.objectItem}</p>}
              {deceased.ammo > 0 && deceased.weapon && <p>💣 Munición x{deceased.ammo}</p>}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#1a3a1a",
                  border: "1px solid #0f0",
                  color: "#0f0",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                onClick={handleRecoverAll}
              >
                Confirmar
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #888",
                  color: "#ccc",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
