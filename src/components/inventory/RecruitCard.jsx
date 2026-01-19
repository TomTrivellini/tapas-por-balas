import { useEffect, useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import { useTeam } from "../../context/TeamContext";
import RecruitInventory from "./RecruitInventory";

export default function RecruitCard({ recruit, index }) {
  const {
    porId,
    desequiparArma,
    agregarMunicion,
    removerMunicion,
    desequiparCasco,
    desequiparChaleco,
    desequiparObjeto,
    inventario,
    renombrarRecluta,
  } = useInventory();
  const { equipo, agregarAlEquipo, removerDelEquipo } = useTeam();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(recruit?.name || "");

  useEffect(() => {
    setEditedName(recruit?.name || "");
  }, [recruit?.name]);

  if (!recruit || recruit.muerto) {
    return null;
  }

  const weapon = recruit.weapon ? porId.get(recruit.weapon) : null;
  const helmet = recruit.helmet ? porId.get(recruit.helmet) : null;
  const vest = recruit.vest ? porId.get(recruit.vest) : null;
  const equipedObject = recruit.objectItem ? porId.get(recruit.objectItem) : null;
  const isInTeam = equipo.includes(index);
  const isTeamFull = equipo.length >= 3 && !isInTeam;
  const trimmedName = editedName.trim();
  const helmetShield = helmet?.shield ?? 0;
  const vestShield = vest?.shield ?? 0;

  const handleSaveName = () => {
    if (!trimmedName || trimmedName === recruit.name) {
      setIsEditingName(false);
      setEditedName(recruit.name);
      return;
    }
    renombrarRecluta(index, trimmedName);
    setIsEditingName(false);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
        {isEditingName ? (
          <>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              style={{
                flex: 1,
                padding: "4px 6px",
                borderRadius: "4px",
                border: "1px solid #555",
                background: "#111",
                color: "#fff",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setIsEditingName(false);
                  setEditedName(recruit.name);
                }
              }}
              autoFocus
            />
            <button
              onClick={handleSaveName}
              disabled={!trimmedName}
              style={{ padding: "4px 8px", marginLeft: "4px" }}
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setIsEditingName(false);
                setEditedName(recruit.name);
              }}
              style={{ padding: "4px 8px" }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0, flex: 1 }}>{recruit.name}</h3>
            <button
              onClick={() => setIsEditingName(true)}
              title="Renombrar recluta"
              style={{ padding: "2px 6px" }}
            >
              ✎
            </button>
          </>
        )}
      </div>
      {isInTeam ? (
        <button onClick={() => removerDelEquipo(index)}>Quitar del equipo</button>
      ) : (
        <button 
          onClick={() => agregarAlEquipo(index)} 
          disabled={isTeamFull}
          title={isTeamFull ? "El equipo está lleno (máximo 3)" : ""}
          style={{ opacity: isTeamFull ? 0.5 : 1, cursor: isTeamFull ? "not-allowed" : "pointer" }}
        >
          {isTeamFull ? "❌ Equipo Lleno" : "Agregar al Equipo"}
        </button>
      )}
      <div>
        <strong>Arma:</strong> {weapon ? weapon.name : "Ninguna"}
        {weapon && (
          <>
            <button onClick={() => desequiparArma(index)}>Quitar</button>
            <div>Munición: {recruit.ammo} <button onClick={() => removerMunicion(index, 1)} disabled={recruit.ammo === 0}>-</button> <button onClick={() => agregarMunicion(index, `amm-${recruit.weapon}`, 1)} disabled={(inventario.find(item => item.id === `amm-${recruit.weapon}`)?.qty || 0) === 0}>+</button></div>
          </>
        )}
        {!weapon && <RecruitInventory recruitIndex={index} type="arma" />}
      </div>
      <div>
        <strong>Casco:</strong> {helmet ? helmet.name : "Ninguno"}
        {helmet && (
          <>
            <span style={{ marginLeft: "6px", fontSize: "12px", color: "#aaa" }}>
              Escudo: {(recruit.helmetHp ?? helmetShield)}/{helmetShield}
            </span>
            <button onClick={() => desequiparCasco(index)}>Quitar</button>
          </>
        )}
        {!helmet && <RecruitInventory recruitIndex={index} type="casco" />}
      </div>
      <div>
        <strong>Chaleco:</strong> {vest ? vest.name : "Ninguno"}
        {vest && (
          <>
            <span style={{ marginLeft: "6px", fontSize: "12px", color: "#aaa" }}>
              Escudo: {(recruit.vestHp ?? vestShield)}/{vestShield}
            </span>
            <button onClick={() => desequiparChaleco(index)}>Quitar</button>
          </>
        )}
        {!vest && <RecruitInventory recruitIndex={index} type="chaleco" />}
      </div>
      <div>
        <strong>Objeto:</strong> {equipedObject ? equipedObject.name : "Ninguno"}
        {equipedObject && <button onClick={() => desequiparObjeto(index)}>Quitar</button>}
        {!equipedObject && <RecruitInventory recruitIndex={index} type="objeto" />}
      </div>
    </div>
  );
}
