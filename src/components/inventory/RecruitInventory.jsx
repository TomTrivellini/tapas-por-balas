import { useState } from "react";
import { useInventory } from "../../context/InventoryContext";

export default function RecruitInventory({ recruitIndex, type }) {
  const { inventario, reclutasInventario, porId, equiparArma, equiparCasco, equiparChaleco, equiparObjeto, agregarMunicion } = useInventory();
  const recruit = reclutasInventario[recruitIndex];
  if (!recruit || recruit.muerto) {
    return null;
  }

  const getTypeName = (type) => {
    switch (type) {
      case "arma": return "arma";
      case "casco": return "casco";
      case "chaleco": return "chaleco";
    case "objeto": return "objeto";
      case "munición": return "munición";
      default: return type;
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const getAvailableItems = () => {
    switch (type) {
      case "arma":
        return inventario.filter(item => porId.get(item.id)?.type === "arma");
      case "casco":
        return inventario.filter(item => porId.get(item.id)?.slot === "helmet");
      case "chaleco":
        return inventario.filter(item => porId.get(item.id)?.slot === "vest");
      case "objeto":
        return inventario.filter(item => porId.get(item.id)?.type === "object");
      case "munición": {
        // Para munición, filtrar por el arma equipada
        if (!recruit.weapon) return [];
        const ammoId = `amm-${recruit.weapon}`;
        return inventario.filter(item => item.id === ammoId);
      }
      default:
        return [];
    }
  };

  const handleEquip = (itemId) => {
    switch (type) {
      case "arma":
        equiparArma(recruitIndex, itemId);
        break;
      case "casco":
        equiparCasco(recruitIndex, itemId);
        break;
      case "chaleco":
        equiparChaleco(recruitIndex, itemId);
        break;
      case "objeto":
        equiparObjeto(recruitIndex, itemId);
        break;
      case "munición":
        agregarMunicion(recruitIndex, itemId, 1);
        break;
    }
    setIsOpen(false);
  };

  const availableItems = getAvailableItems();

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Equipar</button>
      {isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "black", color: "white", padding: "1rem", borderRadius: "4px", border: "1px solid white", maxWidth: "400px", width: "90%" }}>
            <h4>Seleccionar {getTypeName(type)}</h4>
            {availableItems.length === 0 ? (
              <p>No hay items disponibles.</p>
            ) : (
              <ul>
                {availableItems.map(item => {
                  const entry = porId.get(item.id);
                  return (
                    <li key={item.id}>
                      {entry.name} (restan: {item.qty})
                      <button onClick={() => handleEquip(item.id)}>Equipar</button>
                    </li>
                  );
                })}
              </ul>
            )}
            <button onClick={() => setIsOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
