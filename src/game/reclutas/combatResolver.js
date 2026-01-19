import {
  isTeamEliminated,
  resolveMovesSimultaneous,
} from '../state/battleRules';
import { resolveSupportActions, resolveShootActions } from './combatPhases';
import { DEFAULT_FRAME_DURATION, buildMoveEvent } from './combatAnimations';

const FRAME_DURATION = DEFAULT_FRAME_DURATION;


export function resolveActionsByPhase(actionsByUnit, units, board, log, itemsById = null) {
  let newUnits = [...units];
  let newBoard = board;
  let newLog = [...log];
  let gameOver = { active: false, winner: null, reason: '' };
  const killed = [];
  const frames = [];
  let frameCounter = 0;
  const nextFrameId = () => `frame-${frameCounter++}`;

  const maxActions = Object.values(actionsByUnit).reduce(
    (max, queue) => Math.max(max, queue ? queue.length : 0),
    0
  );

  for (let actionIndex = 0; actionIndex < maxActions; actionIndex++) {
    const participants = [];
    newUnits.forEach((unit) => {
      const queue = actionsByUnit[unit.id];
      if (!queue || queue.length <= actionIndex) return;
      const action = queue[actionIndex];
      if (!action) return;
      participants.push({ unitId: unit.id, action, snapshot: { ...unit } });
    });

    if (participants.length === 0) {
      continue;
    }

    const phaseFrame = {
      id: nextFrameId(),
      duration: FRAME_DURATION,
      unitUpdates: [],
      boardUpdates: [],
      projectiles: [],
      logs: [],
      events: [],
    };
    frames.push(phaseFrame);
    const suffix = `[Accion ${actionIndex + 1}]`;

    const recordLog = (message) => {
      if (!message) return;
      newLog.push(message);
      phaseFrame.logs.push(message);
    };

    const applyUnitUpdates = (unitId, changes) => {
      newUnits = newUnits.map((unit) =>
        unit.id === unitId ? { ...unit, ...changes } : unit
      );
      phaseFrame.unitUpdates.push({ unitId, changes });
    };

    const registerEvent = (event) => {
      if (!event) return;
      phaseFrame.events.push(event);
    };

    const pushProjectile = (projectile) => {
      if (projectile) {
        phaseFrame.projectiles.push(projectile);
      }
    };

    const runActions = participants.filter(
      (entry) => entry.action.type === 'RUN' && entry.snapshot.alive
    );
    runActions.forEach(({ unitId, snapshot }) => {
      applyUnitUpdates(unitId, { alive: false, isCovered: false });
      recordLog(`${snapshot.name} huyo del combate ${suffix}`);
    });

    const moveActions = participants.filter(
      (entry) => entry.action.type === 'MOVE' && entry.snapshot.alive
    );
    if (moveActions.length > 0) {
      const moveMap = moveActions.reduce((acc, entry) => {
        if (entry.action.to) {
          acc[entry.unitId] = entry.action.to;
        }
        return acc;
      }, {});
      const resolved = resolveMovesSimultaneous(moveMap, newUnits);
      moveActions.forEach(({ unitId, snapshot }) => {
        const destination = resolved[unitId];
        if (!destination) return;
        const startPos = { r: snapshot.r, c: snapshot.c };
        applyUnitUpdates(unitId, { r: destination.r, c: destination.c, isCovered: false });
        registerEvent(
          buildMoveEvent({
            id: `move-${unitId}-${actionIndex}`,
            unitId,
            team: snapshot.team,
            name: snapshot.name,
            from: startPos,
            to: destination,
            duration: FRAME_DURATION,
          })
        );
        if (destination.r === startPos.r && destination.c === startPos.c) {
          recordLog(`${snapshot.name} intento moverse pero fue bloqueado ${suffix}`);
        } else {
          recordLog(`${snapshot.name} se movio a (${destination.r}, ${destination.c}) ${suffix}`);
        }
      });
    }

    resolveSupportActions({
      participants,
      actionIndex,
      itemsById,
      board: newBoard,
      getUnits: () => newUnits,
      applyUnitUpdates,
      recordLog,
      pushProjectile,
      registerEvent,
      killed,
      frameDuration: FRAME_DURATION,
      suffix,
    });

    const shootResult = resolveShootActions({
      participants,
      actionIndex,
      itemsById,
      board: newBoard,
      getUnits: () => newUnits,
      applyUnitUpdates,
      recordLog,
      pushProjectile,
      registerEvent,
      boardUpdates: phaseFrame.boardUpdates,
      killed,
      frameDuration: FRAME_DURATION,
      suffix,
    });
    newBoard = shootResult.board;
  }

  if (isTeamEliminated('A', newUnits)) {
    gameOver = { active: true, winner: 'B', reason: 'No quedan reclutas del Equipo A.' };
  } else if (isTeamEliminated('B', newUnits)) {
    gameOver = { active: true, winner: 'A', reason: 'No quedan reclutas del Equipo B.' };
  }

  return { units: newUnits, log: newLog, board: newBoard, gameOver, killed, frames };
}
