import { applyUnitChanges, applyBoardUpdates } from './battleReducerBoard';

export const applyFrameToState = (state, frame) => {
  const updatedUnits = applyUnitChanges(state.units, frame.unitUpdates);
  const updatedBoard = applyBoardUpdates(state.board, frame.boardUpdates);
  const activeProjectiles = Array.isArray(frame.projectiles)
    ? frame.projectiles.map((projectile, idx) => ({
        ...projectile,
        id: projectile.id || `${frame.id}-proj-${idx}`,
      }))
    : frame.projectile
      ? [{ ...frame.projectile, id: frame.id }]
      : [];

  return {
    ...state,
    units: updatedUnits,
    board: updatedBoard,
    activeProjectiles,
  };
};

export const finalizePendingResolution = (state) => {
  if (!state.pendingResolution) {
    return {
      ...state,
      isAnimating: false,
      animationQueue: [],
      activeProjectiles: [],
    };
  }

  const pending = state.pendingResolution;
  return {
    ...state,
    units: pending.units || state.units,
    board: pending.board || state.board,
    round: pending.round ?? state.round,
    selectedUnitId: pending.selectedUnitId ?? state.selectedUnitId,
    planningOrder: pending.planningOrder ?? state.planningOrder,
    currentPlanningIndex: pending.currentPlanningIndex ?? state.currentPlanningIndex,
    validMoves: pending.validMoves ?? state.validMoves,
    log: pending.log || state.log,
    gameOver: pending.gameOver || state.gameOver,
    unitsKilled: pending.unitsKilled || [],
    actions: {},
    unitGhosts: {},
    animationQueue: [],
    isAnimating: false,
    pendingResolution: null,
    activeProjectiles: [],
    awaitingNextAction: false,
  };
};
