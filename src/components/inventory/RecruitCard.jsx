import { useEffect, useState } from "react";
import { useInventory } from "../../context/InventoryContext";
import { findAmmoIdForWeapon } from "../../data/catalogUtils";
import { useTeam } from "../../context/TeamContext";
import RecruitInventory from "./RecruitInventory";
import UnitSprite from "../Juego/Sprites/UnitSprite";
import { getItemSpriteClass } from "../items/itemSprite";

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
  const ammoId = weapon ? findAmmoIdForWeapon(weapon.id, porId) : null;
  const ammoStock = ammoId
    ? (inventario.find((item) => item.id === ammoId)?.qty || 0)
    : 0;
  const weaponSpriteClass = weapon ? getItemSpriteClass(weapon) : null;
  const objectSpriteClass = equipedObject ? getItemSpriteClass(equipedObject) : null;

  const handleSaveName = () => {
    const nextName = trimmedName.slice(0, 10);
    if (!nextName || nextName === recruit.name) {
      setIsEditingName(false);
      setEditedName(recruit.name);
      return;
    }
    renombrarRecluta(index, nextName);
    setIsEditingName(false);
  };

  return (
    <div className="recruit-card">
      <div className="recruit-card__preview">
        <div className="recruit-card__preview-grid">
          <UnitSprite unit={recruit} className="recruit-card__sprite" hideWeapon hideObjects />
          {objectSpriteClass && (
            <span
              className={`${objectSpriteClass} recruit-card__equip-icon recruit-card__equip-icon--object`}
              aria-hidden="true"
            />
          )}
          {weaponSpriteClass && (
            <span
              className={`${weaponSpriteClass} recruit-card__equip-icon recruit-card__equip-icon--weapon`}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      <div className="recruit-card__header">
        {isEditingName ? (
          <>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              maxLength={10}
              className="recruit-card__input"
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
              className="recruit-card__btn recruit-card__btn--save"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setIsEditingName(false);
                setEditedName(recruit.name);
              }}
              className="recruit-card__btn recruit-card__btn--cancel"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <h3 className="recruit-card__name">{recruit.name}</h3>
            <button
              onClick={() => setIsEditingName(true)}
              title="Renombrar recluta"
              className="recruit-card__btn recruit-card__btn--icon"
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
          className="recruit-card__team-btn"
        >
          {isTeamFull ? " Equipo Lleno" : "Agregar al Equipo"}
        </button>
      )}
      <div>
        <strong>Arma:</strong> {weapon ? weapon.name : "Ninguna"}
        {weapon && (
          <>
            <button onClick={() => desequiparArma(index)}>Quitar</button>
            <div>
              Munición: {recruit.ammo}
              <button onClick={() => removerMunicion(index, 1)} disabled={recruit.ammo === 0}>
                -
              </button>
              <button
                onClick={() => ammoId && agregarMunicion(index, ammoId, 1)}
                disabled={!ammoId || ammoStock === 0}
              >
                +
              </button>
            </div>
          </>
        )}
        {!weapon && <RecruitInventory recruitIndex={index} type="arma" />}
      </div>
      <div>
        <strong>Casco:</strong> {helmet ? helmet.name : "Ninguno"}
        {helmet && (
          <>
            <span className="recruit-card__shield">
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
            <span className="recruit-card__shield">
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
