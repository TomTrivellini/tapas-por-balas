import { useInventory } from "../../context/InventoryContext";
import { useTeam } from "../../context/TeamContext";
import RecruitInventory from "./RecruitInventory";

export default function RecruitCard({ recruit, index }) {
  const { porId, desequiparArma, agregarMunicion, removerMunicion, desequiparCasco, desequiparChaleco, desequiparConsumible, inventario } = useInventory();
  const { equipo, agregarAlEquipo, removerDelEquipo } = useTeam();

  const weapon = recruit.weapon ? porId.get(recruit.weapon) : null;
  const helmet = recruit.helmet ? porId.get(recruit.helmet) : null;
  const vest = recruit.vest ? porId.get(recruit.vest) : null;
  const consumable = recruit.consumable ? porId.get(recruit.consumable) : null;

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "4px" }}>
      <h3>{recruit.name}</h3>
      {equipo.includes(index) ? (
        <button onClick={() => removerDelEquipo(index)}>Quitar del Equipo</button>
      ) : (
        <button onClick={() => agregarAlEquipo(index)} disabled={equipo.length >= 3}>Agregar al Equipo</button>
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
        {helmet && <button onClick={() => desequiparCasco(index)}>Quitar</button>}
        {!helmet && <RecruitInventory recruitIndex={index} type="casco" />}
      </div>
      <div>
        <strong>Chaleco:</strong> {vest ? vest.name : "Ninguno"}
        {vest && <button onClick={() => desequiparChaleco(index)}>Quitar</button>}
        {!vest && <RecruitInventory recruitIndex={index} type="chaleco" />}
      </div>
      <div>
        <strong>Consumible:</strong> {consumable ? consumable.name : "Ninguno"}
        {consumable && <button onClick={() => desequiparConsumible(index)}>Quitar</button>}
        {!consumable && <RecruitInventory recruitIndex={index} type="consumible" />}
      </div>
    </div>
  );
}