import {
  calculateMovementAPCost,
  hasCover,
  canRun,
  canShoot,
  pickShotTarget,
  validMoveCells,
} from '../state/battleRules';

export function ensureEnemyActions(state, itemsById = null) {
  const actions = { ...state.actions };
  const enemyFinalPositions = new Map();

  state.units.forEach((unit) => {
    if (unit.team === 'B' && unit.alive) {
      enemyFinalPositions.set(unit.id, { r: unit.r, c: unit.c });
    }
  });

  state.units.forEach((unit) => {
    if (unit.team !== 'B' || !unit.alive || unit.ap <= 0) {
      return;
    }
    if (actions[unit.id] && actions[unit.id].length > 0) {
      const finalPos = predictFinalPosition(unit, actions[unit.id]);
      enemyFinalPositions.set(unit.id, finalPos);
      return;
    }
    const planResult = buildEnemyPlan(unit, state, enemyFinalPositions, itemsById);
    if (planResult.actions.length > 0) {
      actions[unit.id] = planResult.actions;
      enemyFinalPositions.set(unit.id, planResult.finalPosition);
    }
  });
  return actions;
}

function buildEnemyPlan(unit, state, enemyFinalPositions, itemsById) {
  let apRemaining = unit.ap;
  if (apRemaining <= 0) {
    return { actions: [], finalPosition: { r: unit.r, c: unit.c } };
  }
  const plan = [];
  const simulatedUnit = { ...unit };

  while (apRemaining > 0) {
    const next = chooseEnemyAction(simulatedUnit, state, apRemaining, enemyFinalPositions, itemsById);
    if (!next) break;
    const entry = {
      type: next.action.type,
      cost: next.cost,
    };
    if (next.action.row !== undefined) {
      entry.row = next.action.row;
    }
    if (next.action.to) {
      entry.to = next.action.to;
    }
    plan.push(entry);
    apRemaining -= next.cost;
    if (next.action.type === 'RUN') {
      break;
    }
    if (next.action.type === 'MOVE' && next.action.to) {
      enemyFinalPositions.set(unit.id, { r: next.action.to.r, c: next.action.to.c });
    }
  }

  return { actions: plan, finalPosition: { r: simulatedUnit.r, c: simulatedUnit.c } };
}

function chooseEnemyAction(simulatedUnit, state, apRemaining, enemyFinalPositions, itemsById) {
  if (apRemaining <= 0) return null;
  const board = state.board;

  const canShootNow = canShoot(simulatedUnit);

  const options = [];
  const targetForShot = pickShotTarget(simulatedUnit.team, simulatedUnit.r, board, state.units);
  if (canShootNow && targetForShot) {
    options.push({
      type: 'SHOOT',
      cost: 1,
      apply: () => {
        simulatedUnit.loaded = false;
      },
    });
  }

  if (
    simulatedUnit.weapon &&
    simulatedUnit.ammo > 0 &&
    !simulatedUnit.loaded &&
    !simulatedUnit.weaponNoReload &&
    !simulatedUnit.weaponInstantShot
  ) {
    options.push({
      type: 'RELOAD',
      cost: 1,
      apply: () => {
        simulatedUnit.ammo = Math.max(0, simulatedUnit.ammo - 1);
        simulatedUnit.loaded = true;
      },
    });
  }

  if (hasCover(simulatedUnit, board) && !simulatedUnit.isCovered) {
    options.push({
      type: 'COVER',
      cost: 1,
      apply: () => {
        simulatedUnit.isCovered = true;
      },
    });
  }

  const moveOptions = getMoveOptions(simulatedUnit, state, apRemaining, enemyFinalPositions);
  options.push(...moveOptions);

  const objectOption = chooseEnemyObjectAction(simulatedUnit, state, itemsById);
  if (objectOption) {
    options.push(objectOption);
  }

  if (simulatedUnit.ammo <= 0 && !canShootNow && !simulatedUnit.movementLock && canRun(simulatedUnit, board)) {
    options.push({
      type: 'RUN',
      cost: 1,
      apply: () => {
        simulatedUnit.alive = false;
      },
    });
  }

  if (options.length === 0) return null;
  const choice = options[Math.floor(Math.random() * options.length)];

  if (choice.type === 'MOVE') {
    if (choice.cost > apRemaining) return null;
    simulatedUnit.r = choice.to.r;
    simulatedUnit.c = choice.to.c;
    simulatedUnit.isCovered = false;
    return {
      action: { type: 'MOVE', to: choice.to },
      cost: choice.cost,
    };
  }

  choice.apply();
  if (choice.type === 'SHOOT') {
    return { action: { type: 'SHOOT', row: simulatedUnit.r }, cost: 1 };
  }
  if (choice.type === 'RELOAD') {
    return { action: { type: 'RELOAD' }, cost: 1 };
  }
  if (choice.type === 'USE_OBJECT') {
    if (choice.cost > apRemaining) return null;
    choice.apply();
    return { action: { type: 'USE_OBJECT', row: simulatedUnit.r }, cost: 1 };
  }
  if (choice.type === 'COVER') {
    return { action: { type: 'COVER' }, cost: 1 };
  }
  if (choice.type === 'RUN') {
    return { action: { type: 'RUN' }, cost: 1 };
  }
  return null;
}

function selectEscapeMove(simulatedUnit, state, apRemaining, enemyFinalPositions) {
  const moveOptions = getMoveOptions(simulatedUnit, state, apRemaining, enemyFinalPositions);
  if (!moveOptions.length) return null;
  const totalCols = state.board.totalCols || state.board.colsPerSide * 2;
  const targetColumn = totalCols - 1;
  const scored = moveOptions
    .map((option) => ({
      ...option,
      priority: Math.abs(targetColumn - option.to.c),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.to.c - a.to.c;
    });
  return scored[0] || null;
}

function getMoveOptions(unit, state, apRemaining, enemyFinalPositions) {
  if (apRemaining <= 0) return [];
  if (unit.movementLock) return [];
  const ghostMap = buildEnemyGhostMap(enemyFinalPositions);
  const reachable = validMoveCells(unit, state.board, state.units, ghostMap);
  if (!reachable || reachable.length === 0) return [];
  return reachable
    .filter((cell) => !isCellOccupied(cell.r, cell.c, state.units, unit.id))
    .filter((cell) => !isCellReservedByOtherEnemy(cell.r, cell.c, enemyFinalPositions, unit.id))
    .map((cell) => {
      const cost = calculateMovementAPCost({ r: unit.r, c: unit.c }, cell);
      if (cost > apRemaining || cost <= 0) return null;
      return { type: 'MOVE', to: cell, cost };
    })
    .filter(Boolean);
}

function isCellOccupied(r, c, units, movingUnitId) {
  return units.some((u) => u.alive && u.id !== movingUnitId && u.r === r && u.c === c);
}

function isCellReservedByOtherEnemy(r, c, enemyFinalPositions, unitId) {
  for (const [otherId, pos] of enemyFinalPositions.entries()) {
    if (otherId === unitId) continue;
    if (pos && pos.r === r && pos.c === c) {
      return true;
    }
  }
  return false;
}

function chooseEnemyObjectAction(simulatedUnit, state, itemsById) {
  if (!simulatedUnit.objectItem || !itemsById) {
    return null;
  }
  const objectEntry = itemsById.get(simulatedUnit.objectItem);
  if (!objectEntry) {
    return null;
  }
  const healValue = objectEntry?.heal || 0;
  const apBonusValue = objectEntry?.apBonusValue || 0;
  const apBonusRounds = objectEntry?.apBonusRounds || 0;
  const maxHp = simulatedUnit.maxHp && simulatedUnit.maxHp > 0 ? simulatedUnit.maxHp : null;
  const healCap = maxHp !== null ? maxHp : simulatedUnit.hp + healValue;

  if (healValue > 0 && simulatedUnit.hp < healCap) {
    return {
      type: 'USE_OBJECT',
      cost: 1,
      apply: () => {
        const cap = maxHp !== null ? maxHp : simulatedUnit.hp + healValue;
        simulatedUnit.hp = Math.min(cap, simulatedUnit.hp + healValue);
        simulatedUnit.objectItem = null;
      },
    };
  }

  if (apBonusValue > 0 && apBonusRounds > 0) {
    return {
      type: 'USE_OBJECT',
      cost: 1,
      apply: () => {
        simulatedUnit.objectItem = null;
        simulatedUnit.apBonusRounds = Math.max(simulatedUnit.apBonusRounds || 0, apBonusRounds);
        simulatedUnit.apBonusValue = Math.max(simulatedUnit.apBonusValue || 0, apBonusValue);
      },
    };
  }

  const damageValue = objectEntry?.damage || 0;
  const immobilizeRounds = objectEntry?.immobilizeRounds || 0;
  if (damageValue <= 0 && immobilizeRounds <= 0) {
    return null;
  }

  const target = pickShotTarget(simulatedUnit.team, simulatedUnit.r, state.board, state.units);
  if (!target) {
    return null;
  }

  return {
    type: 'USE_OBJECT',
    cost: 1,
    apply: () => {
      simulatedUnit.objectItem = null;
    },
  };
}

function buildEnemyGhostMap(enemyFinalPositions) {
  if (!enemyFinalPositions || typeof enemyFinalPositions.entries !== 'function') {
    return {};
  }
  const ghostMap = {};
  enemyFinalPositions.forEach((pos, unitId) => {
    if (pos) {
      ghostMap[unitId] = pos;
    }
  });
  return ghostMap;
}

function predictFinalPosition(unit, plannedActions) {
  let finalRow = unit.r;
  let finalCol = unit.c;
  plannedActions.forEach((action) => {
    if (action.type === 'MOVE' && action.to) {
      finalRow = action.to.r;
      finalCol = action.to.c;
    }
  });
  return { r: finalRow, c: finalCol };
}
