import {
  validMoveCells,
  canRun,
  canShoot,
  calculateMovementAPCost,
  getUnitPlanningPosition,
} from './battleRules';
import {
  getActivePlanningUnitId,
  getUnitById,
  getUnitMaxAp,
  computeGhostPosition,
  computeValidMovesForUnit,
  computePlannedWeaponState,
  computePlannedObjectItem,
  computePlanningOrder,
} from './battleReducerUtils';

export const handleSelectUnit = (state, action) => {
  if (state.isAnimating) return state;
  const unit = getUnitById(state.units, action.payload);
  const activeUnitId = getActivePlanningUnitId(state);
  if (unit && unit.team === 'A' && activeUnitId && unit.id !== activeUnitId) {
    return state;
  }
  const moves = computeValidMovesForUnit(
    unit,
    state.board,
    state.units,
    state.unitGhosts
  );
  return {
    ...state,
    selectedUnitId: action.payload,
    validMoves: moves,
    awaitingNextAction: false,
  };
};

export const handleSetValidMoves = (state, action) => ({
  ...state,
  validMoves: action.payload,
});

export const handlePlanAction = (state, action) => {
  if (state.isAnimating || state.awaitingNextAction) return state;
  const { unitId, actionType, payload } = action.payload || {};
  if (!unitId || !actionType) return state;
  const activeUnitId = getActivePlanningUnitId(state);
  if (activeUnitId && unitId !== activeUnitId) return state;

  const selectedUnit = getUnitById(state.units, unitId);
  if (!selectedUnit || selectedUnit.ap <= 0) return state;

  const currentQueue = state.actions[unitId] || [];
  const plannedWeapon = computePlannedWeaponState(selectedUnit, currentQueue);
  const plannedObjectItem = computePlannedObjectItem(selectedUnit.objectItem, currentQueue);

  const basePosition =
    getUnitPlanningPosition(selectedUnit, state.unitGhosts) ||
    { r: selectedUnit.r, c: selectedUnit.c };

  if ((actionType === 'MOVE' || actionType === 'RUN') && (selectedUnit.movementLock || 0) > 0) {
    return state;
  }

  let apCost = 1;
  if (actionType === 'MOVE') {
    if (!payload?.to) return state;
    const distance = calculateMovementAPCost(basePosition, payload.to);
    if (distance !== 1) return state;
    const validTargets = validMoveCells(selectedUnit, state.board, state.units, state.unitGhosts);
    const isValidTarget = validTargets.some(
      (cell) => cell.r === payload.to.r && cell.c === payload.to.c
    );
    if (!isValidTarget) return state;
  }

  if (selectedUnit.ap < apCost) return state;

  if (actionType === 'SHOOT') {
    const canShootNow =
      plannedWeapon.weapon &&
      canShoot({ ...selectedUnit, ...plannedWeapon }, false);
    if (!canShootNow) return state;
  }

  if (actionType === 'RELOAD') {
    if (
      !plannedWeapon.weapon ||
      plannedWeapon.weaponNoReload ||
      plannedWeapon.weaponInstantShot ||
      plannedWeapon.loaded ||
      plannedWeapon.ammo <= 0
    ) {
      return state;
    }
  }

  if (actionType === 'COVER') {
    const hasCover = state.board.cover[basePosition.r]?.[basePosition.c];
    if (!hasCover) return state;
  }

  if (actionType === 'RUN' && !canRun({ ...selectedUnit, ...basePosition }, state.board)) {
    return state;
  }

  if (actionType === 'USE_OBJECT' && !plannedObjectItem) {
    return state;
  }

  const updatedActions = { ...state.actions };
  const queue = [...(updatedActions[unitId] || [])];
  queue.push({ type: actionType, cost: apCost, ...payload });
  updatedActions[unitId] = queue;

  const updatedUnits = state.units.map((unit) =>
    unit.id === unitId ? { ...unit, ap: unit.ap - apCost } : unit
  );

  const newGhosts = {
    ...state.unitGhosts,
    [unitId]: computeGhostPosition(selectedUnit, queue),
  };

  return {
    ...state,
    units: updatedUnits,
    actions: updatedActions,
    unitGhosts: newGhosts,
    validMoves: [],
    selectedUnitId: unitId,
    awaitingNextAction: true,
  };
};

export const handleNextApAction = (state) => {
  if (state.isAnimating || !state.awaitingNextAction) return state;
  const unitId = state.selectedUnitId;
  if (!unitId) return state;
  const unit = getUnitById(state.units, unitId);
  if (!unit) return state;
  if (unit.ap <= 0) {
    return {
      ...state,
      awaitingNextAction: false,
      validMoves: [],
    };
  }
  const moves = computeValidMovesForUnit(
    unit,
    state.board,
    state.units,
    state.unitGhosts
  );
  return {
    ...state,
    awaitingNextAction: false,
    validMoves: moves,
  };
};

export const handlePreviousApAction = (state) => {
  if (state.isAnimating) return state;
  const unitId = state.selectedUnitId || getActivePlanningUnitId(state);
  if (!unitId) return state;
  const queue = [...(state.actions[unitId] || [])];
  if (queue.length === 0) return state;
  const lastAction = queue.pop();
  const updatedActions = { ...state.actions };
  if (queue.length === 0) {
    delete updatedActions[unitId];
  } else {
    updatedActions[unitId] = queue;
  }
  const updatedUnits = state.units.map((unit) =>
    unit.id === unitId
      ? { ...unit, ap: Math.min(getUnitMaxAp(unit), unit.ap + (lastAction?.cost || 1)) }
      : unit
  );
  const newGhosts = {
    ...state.unitGhosts,
    [unitId]: computeGhostPosition(getUnitById(updatedUnits, unitId), queue),
  };
  const moves = computeValidMovesForUnit(
    getUnitById(updatedUnits, unitId),
    state.board,
    updatedUnits,
    newGhosts
  );
  return {
    ...state,
    units: updatedUnits,
    actions: updatedActions,
    unitGhosts: newGhosts,
    validMoves: moves,
    awaitingNextAction: false,
  };
};

export const handleConfirmUnitPlanning = (state) => {
  if (state.isAnimating) return state;
  const activeUnitId = getActivePlanningUnitId(state);
  if (!activeUnitId) return state;
  const nextIndex = Math.min(
    state.currentPlanningIndex + 1,
    state.planningOrder.length
  );
  const nextUnitId = state.planningOrder[nextIndex] || null;
  const nextUnit = nextUnitId ? getUnitById(state.units, nextUnitId) : null;
  const moves = computeValidMovesForUnit(
    nextUnit,
    state.board,
    state.units,
    state.unitGhosts
  );
  return {
    ...state,
    currentPlanningIndex: nextIndex,
    selectedUnitId: nextUnitId,
    validMoves: moves,
    awaitingNextAction: false,
  };
};

export const handleResetUnitActions = (state, action) => {
  if (state.isAnimating) return state;
  const { unitId } = action.payload || {};
  if (!unitId) return state;
  if (!state.units.some((unit) => unit.id === unitId)) return state;
  const actions = { ...state.actions };
  delete actions[unitId];
  const units = state.units.map((unit) =>
    unit.id === unitId && unit.alive ? { ...unit, ap: getUnitMaxAp(unit) } : unit
  );
  const unitGhosts = { ...state.unitGhosts };
  delete unitGhosts[unitId];
  const moves = computeValidMovesForUnit(
    getUnitById(units, state.selectedUnitId),
    state.board,
    units,
    unitGhosts
  );
  return {
    ...state,
    actions,
    units,
    unitGhosts,
    validMoves: moves,
    awaitingNextAction: false,
  };
};

export const handleResetPlannedActions = (state) => {
  if (state.isAnimating) return state;
  const units = state.units.map((unit) =>
    unit.alive ? { ...unit, ap: getUnitMaxAp(unit) } : unit
  );
  const planningOrder = computePlanningOrder(units);
  const selectedUnitId = planningOrder[0] || null;
  const moves = computeValidMovesForUnit(
    getUnitById(units, selectedUnitId),
    state.board,
    units,
    {}
  );
  return {
    ...state,
    actions: {},
    selectedUnitId,
    validMoves: moves,
    unitGhosts: {},
    units,
    planningOrder,
    currentPlanningIndex: 0,
    awaitingNextAction: false,
  };
};
