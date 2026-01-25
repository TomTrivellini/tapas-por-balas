import { useCatalog } from "../../../context/CatalogContext";

const FACE_COUNT = 33;
const HELMET_COUNT = 3;

const hashString = (value) => {
  if (!value) return 0;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash;
};

const resolveFaceIndex = (unit) => {
  if (!unit) return 0;
  if (Number.isInteger(unit.faceIndex)) {
    return ((unit.faceIndex % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;
  }
  return hashString(unit.id || unit.name) % FACE_COUNT;
};

const resolveBodyIndex = (unit, itemsById) => {
  if (!unit?.vest) return 0;
  const entry = itemsById?.get(unit.vest);
  if (Number.isInteger(entry?.bodyIndex)) {
    const idx = entry.bodyIndex;
    return Math.max(0, Math.min(4, idx));
  }
  const label = `${entry?.name || ""} ${entry?.id || ""}`.toLowerCase();
  if (
    label.includes("liviano") ||
    label.includes("ligero") ||
    label.includes("light") ||
    label.includes("barata")
  ) {
    return 1;
  }
  if (label.includes("sang") || label.includes("sanguin")) return 3;
  return 2;
};

const resolveHelmetIndex = (unit, itemsById) => {
  if (!unit?.helmet) return null;
  const entry = itemsById?.get(unit.helmet);
  if (Number.isInteger(entry?.helmetIndex)) {
    return Math.max(0, Math.min(HELMET_COUNT - 1, entry.helmetIndex));
  }
  if (Number.isInteger(entry?.maskIndex)) {
    return Math.max(0, Math.min(HELMET_COUNT - 1, entry.maskIndex));
  }
  const label = `${entry?.name || ""} ${entry?.id || ""}`.toLowerCase();
  if (label.includes("rambo") || label.includes("banda") || label.includes("bandana")) return 1;
  if (label.includes("masc") || label.includes("mask")) return 2;
  return 0;
};

const resolveObjectIndex = (objectId) => {
  if (!objectId) return null;
  const label = `${objectId}`.toLowerCase();
  if (label.includes("cig")) return 0;
  if (label.includes("tumbera")) return 1;
  if (label.includes("lanza") || label.includes("red")) return 2;
  if (label.includes("pollo")) return 3;
  if (label.includes("med")) return 4;
  return null;
};

export default function UnitSprite({
  unit,
  isGhost = false,
  className = "",
  hideWeapon = false,
  hideObjects = false,
  overlayItem = null,
  isHit = false,
}) {
  const { itemsById } = useCatalog();
  if (!unit) return null;

  const faceIndex = resolveFaceIndex(unit);
  const baseBodyIndex = resolveBodyIndex(unit, itemsById);
  const bodyIndex = unit.movementLock && unit.movementLock > 0 ? 4 : baseBodyIndex;
  const helmetIndex = resolveHelmetIndex(unit, itemsById);
  const weaponEntry = unit.weapon ? itemsById.get(unit.weapon) : null;
  const weaponLabel = `${weaponEntry?.name || unit.weapon || ""}`.toLowerCase();
  const weaponIndex = Number.isInteger(weaponEntry?.weaponIndex)
    ? weaponEntry.weaponIndex
    : weaponLabel.includes("revolver") || weaponLabel === "rev"
      ? 0
      : weaponLabel.includes("escopeta") || weaponLabel === "shg"
        ? 1
        : weaponLabel.includes("rifle") || weaponLabel === "rif"
          ? 2
          : null;
  const spriteClasses = ["unit-sprite"];
  if (isGhost) spriteClasses.push("unit-sprite--ghost");
  if (unit.isCovered) spriteClasses.push("unit-sprite--covered");
  if (unit.team === "B") spriteClasses.push("unit-sprite--flip");
  if (isHit) spriteClasses.push("unit-sprite--hit");
  if (className) spriteClasses.push(className);

  const showWeapon = unit.weapon && unit.loaded && weaponIndex !== null && !hideWeapon;
  const overlayIndex = overlayItem ? resolveObjectIndex(overlayItem.objectId) : null;
  const showOverlay = !hideObjects && overlayIndex !== null && overlayItem;
  const showCig =
    !hideObjects &&
    ((unit.smokeRounds ?? 0) > 0 ||
      (unit.apBonusRounds ?? 0) > 0);

  return (
    <div className={spriteClasses.join(" ")}>
      <span className={`unit-sprite__layer unit-sprite__body body-${bodyIndex}`} />
      {helmetIndex === null ? (
        <span className={`unit-sprite__layer unit-sprite__face face-${faceIndex}`} />
      ) : (
        <span className={`unit-sprite__layer unit-sprite__helmet helmet-${helmetIndex}`} />
      )}
      {showWeapon && (
        <span className={`unit-sprite__layer unit-sprite__weapon weapon-${weaponIndex}`} />
      )}
      {showOverlay && (
        <span
          className={`unit-sprite__layer unit-sprite__object unit-object-${overlayIndex} unit-object--${overlayItem.visual}`}
        />
      )}
      {showCig && (
        <span className="unit-sprite__layer unit-sprite__object unit-object-0 unit-object--cig" />
      )}
    </div>
  );
}
