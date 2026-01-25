import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import UnitSprite from "../Sprites/UnitSprite";

const MOVE_PHASE_MS = 1000;
const SHOT_PHASE_MS = 1000;
const SHOT_TRAVEL_MS = SHOT_PHASE_MS;

const getCellPosition = (r, c) => ({
  top: `calc(var(--cell-size) * ${r} + var(--cell-half))`,
  left: c === -1
    ? "calc(var(--cell-half) * -1)"
    : `calc(var(--cell-size) * ${c} + var(--cell-half))`,
});

const resolveOverlayPhase = (objectKind) => (
  objectKind === "secondary" ? "shot" : "hit"
);

export default function AnimationLayer({ frame, isAnimating, units = [] }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [phase, setPhase] = useState("move");

  useEffect(() => {
    if (!frame || !isAnimating) return;
    setRefreshKey((value) => value + 1);
  }, [frame?.id, isAnimating]);

  useEffect(() => {
    if (!frame || !isAnimating) return;
    setPhase("move");
    const shotTimer = setTimeout(() => setPhase("shot"), MOVE_PHASE_MS);
    const hitTimer = setTimeout(() => setPhase("hit"), MOVE_PHASE_MS + SHOT_PHASE_MS);
    return () => {
      clearTimeout(shotTimer);
      clearTimeout(hitTimer);
    };
  }, [isAnimating, frame?.id]);

  if (!frame || !isAnimating) {
    return null;
  }

  const events = frame.events || [];
  const moveEvents = events.filter((event) => event.type === "move");
  const shotEvents = events.filter((event) => event.type === "shot");
  const objectEvents = events.filter((event) => event.type === "object");
  const coverEvents = events.filter((event) => event.type === "cover");

  const moveByUnit = new Map(moveEvents.map((event) => [event.unitId, event]));
  const objectByUnit = new Map(objectEvents.map((event) => [event.unitId, event]));
  const coverByUnit = new Map(coverEvents.map((event) => [event.unitId, event]));
  const hitUnitIds = new Set(
    shotEvents
      .filter((event) => event.result === "hit" && event.hitType === "hp" && event.targetId)
      .map((event) => event.targetId)
  );

  const liveUnits = units.filter((unit) => unit && unit.alive);

  return (
    <div className="anim-layer">
      {liveUnits.map((unit) => (
        <AnimatedUnit
          key={unit.id}
          unit={unit}
          moveEvent={moveByUnit.get(unit.id)}
          overlayEvent={objectByUnit.get(unit.id)}
          coverEvent={coverByUnit.get(unit.id)}
          phase={phase}
          refreshKey={refreshKey}
          isHit={phase === "hit" && hitUnitIds.has(unit.id)}
        />
      ))}
      {shotEvents.map((event) => (
        <ShotProjectile key={event.id} event={event} phase={phase} />
      ))}
    </div>
  );
}

function AnimatedUnit({ unit, moveEvent, overlayEvent, coverEvent, phase, refreshKey, isHit }) {
  const fromPos = moveEvent?.from ? { ...moveEvent.from } : { r: unit.r, c: unit.c };
  const toPos = moveEvent?.to ? { ...moveEvent.to } : { r: unit.r, c: unit.c };
  const teamClass = unit.team === "B" ? "anim-layer__unit--enemy" : "anim-layer__unit--ally";
  const shouldMove = phase === "move" && Boolean(moveEvent);
  const overlayKind = overlayEvent?.objectKind || "secondary";
  const overlayPhase = resolveOverlayPhase(overlayKind);
  const showOverlay = phase === overlayPhase && overlayEvent;
  const overlayItem = showOverlay
    ? { objectId: overlayEvent.objectId, visual: overlayEvent.visual }
    : null;
  const hideWeapon = showOverlay && overlayKind === "secondary";
  const isCovering = phase === "move" && Boolean(coverEvent);

  return (
    <motion.div
      key={`${unit.id}-${refreshKey}`}
      className={`anim-layer__unit ${teamClass}`}
      initial={getCellPosition(fromPos.r, fromPos.c)}
      animate={getCellPosition(toPos.r, toPos.c)}
      transition={
        shouldMove
          ? { duration: MOVE_PHASE_MS / 1000, ease: "easeInOut" }
          : { duration: 0 }
      }
    >
      <UnitSprite
        unit={unit}
        overlayItem={overlayItem}
        hideWeapon={hideWeapon}
        isHit={isHit}
        className={isCovering ? "unit-sprite--covering" : ""}
      />
    </motion.div>
  );
}

function ShotProjectile({ event, phase }) {
  if (phase !== "shot") return null;
  const shotClass = event.projectile === "net" ? "anim-layer__shot--net" : "anim-layer__shot--bullet";
  const flipClass = event.team === "B" ? "anim-layer__shot--flip" : "";
  const from = getCellPosition(event.from.r, event.from.c);
  const to = getCellPosition(event.to.r, event.to.c);

  return (
    <motion.div
      className={`anim-layer__shot ${shotClass} ${flipClass}`}
      initial={from}
      animate={to}
      transition={{ duration: SHOT_TRAVEL_MS / 1000, ease: "linear" }}
    />
  );
}
