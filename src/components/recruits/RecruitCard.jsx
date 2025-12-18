import { useGame } from "../../context/GameContext";
import EquipModal from "./EquipModal";

export default function RecruitCard({ recruit, index }) {
  const { byId, unequipWeapon, addAmmo, removeAmmo, unequipHelmet, unequipVest, unequipConsumable, team, addToTeam, removeFromTeam } = useGame();

  const weapon = recruit.weapon ? byId.get(recruit.weapon) : null;
  const helmet = recruit.helmet ? byId.get(recruit.helmet) : null;
  const vest = recruit.vest ? byId.get(recruit.vest) : null;
  const consumable = recruit.consumable ? byId.get(recruit.consumable) : null;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
      <h3>{recruit.name}</h3>
      {team.includes(index) ? (
        <button onClick={() => removeFromTeam(index)}>Quitar del Equipo</button>
      ) : (
        <button onClick={() => addToTeam(index)} disabled={team.length >= 3}>Agregar al Equipo</button>
      )}
      <div>
        <strong>Arma:</strong> {weapon ? weapon.name : "Ninguna"}
        {weapon && (
          <>
            <button onClick={() => unequipWeapon(index)}>Quitar</button>
            <div>Munición: {recruit.ammo} <button onClick={() => removeAmmo(index, 1)} disabled={recruit.ammo === 0}>-</button> <button onClick={() => addAmmo(index, `amm-${recruit.weapon}`, 1)}>+</button></div>
          </>
        )}
        {!weapon && <EquipModal recruitIndex={index} type="weapon" />}
      </div>
      <div>
        <strong>Casco:</strong> {helmet ? helmet.name : "Ninguno"}
        {helmet && <button onClick={() => unequipHelmet(index)}>Quitar</button>}
        {!helmet && <EquipModal recruitIndex={index} type="helmet" />}
      </div>
      <div>
        <strong>Chaleco:</strong> {vest ? vest.name : "Ninguno"}
        {vest && <button onClick={() => unequipVest(index)}>Quitar</button>}
        {!vest && <EquipModal recruitIndex={index} type="vest" />}
      </div>
      <div>
        <strong>Consumible:</strong> {consumable ? consumable.name : "Ninguno"}
        {consumable && <button onClick={() => unequipConsumable(index)}>Quitar</button>}
        {!consumable && <EquipModal recruitIndex={index} type="consumable" />}
      </div>
    </div>
  );
}