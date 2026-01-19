import { resolveActionsByPhase } from '../reclutas/combatResolver';
import { ensureEnemyActions } from '../enemigo/enemyAI';
import { COVER_MAX_HITS } from './battleConstants';
import { isTeamEliminated } from './battleRules';
import {
  computePlanningOrder,
  computeValidMovesForUnit,
  getUnitById,
  getUnitBaseMaxAp,
} from './battleReducerUtils';
import { applyFrameToState, finalizePendingResolution } from './battleReducerFrames';

export const handleClearUnitsKilled = (state) => {
  if (!state.unitsKilled || state.unitsKilled.length === 0) return state;
  return {
    ...state,
    unitsKilled: [],
  };
};

export const handleNextRound = (state, action) => {
  if (state.isAnimating || state.gameOver.active) return state;
  const { itemsById } = action.payload || {};
  const roundLogSeed = [`=== RONDA ${state.round} ===`];
  const previousUnitsById = new Map(state.units.map((unit) => [unit.id, unit]));
  const actionsToResolve = ensureEnemyActions(state, itemsById);
  const resolutionResult = resolveActionsByPhase(
    actionsToResolve,
    state.units,
    state.board,
    roundLogSeed,
    itemsById
  );
  let newUnits = [...resolutionResult.units];
  let newBoard = resolutionResult.board || state.board;
  let gameOverState = resolutionResult.gameOver;
  const unitsKilled = resolutionResult.killed ? [...resolutionResult.killed] : [];

  if (!gameOverState.active) {
    if (isTeamEliminated('A', newUnits)) {
      gameOverState = { active: true, winner: 'B', reason: 'No quedan reclutas del Equipo A.' };
    } else if (isTeamEliminated('B', newUnits)) {
      gameOverState = { active: true, winner: 'A', reason: 'No quedan reclutas del Equipo B.' };
    }
  }

  if (gameOverState.active && gameOverState.winner === 'A') {
    newUnits = newUnits.map((unit) =>
      unit.team === 'A' && unit.loaded
        ? { ...unit, ammo: unit.ammo + 1, loaded: false }
        : unit
    );
  }

  newUnits = newUnits.map((unit) => {
    const previousLock = previousUnitsById.get(unit.id)?.movementLock || 0;
    const currentLock = unit.movementLock || 0;
    const shouldDecrement = currentLock > 0 && currentLock <= previousLock;
    const nextLock = shouldDecrement ? Math.max(0, currentLock - 1) : currentLock;

    const baseMaxAp = getUnitBaseMaxAp(unit);
    const bonusRounds = unit.apBonusRounds || 0;
    const bonusValue =
      bonusRounds > 0
        ? typeof unit.apBonusValue === 'number'
          ? unit.apBonusValue
          : 1
        : 0;
    const nextBonusRounds = bonusRounds > 0 ? bonusRounds - 1 : 0;
    const nextMaxAp = baseMaxAp + bonusValue;

    if (unit.alive) {
      return {
        ...unit,
        ap: nextMaxAp,
        currentMaxAp: nextMaxAp,
        apBonusRounds: nextBonusRounds,
        movementLock: nextLock,
      };
    }
    return {
      ...unit,
      currentMaxAp: nextMaxAp,
      apBonusRounds: nextBonusRounds,
      movementLock: nextLock,
    };
  });

  const nextRound = state.round + 1;
  const nextPlanningOrder = computePlanningOrder(newUnits);
  const nextSelectedUnitId = nextPlanningOrder[0] || null;
  const nextUnit = nextSelectedUnitId ? getUnitById(newUnits, nextSelectedUnitId) : null;
  const nextValidMoves = computeValidMovesForUnit(
    nextUnit,
    newBoard,
    newUnits,
    {}
  );

  const pendingResolution = {
    units: newUnits,
    board: newBoard,
    round: nextRound,
    selectedUnitId: nextSelectedUnitId,
    planningOrder: nextPlanningOrder,
    currentPlanningIndex: 0,
    validMoves: nextValidMoves,
    log: resolutionResult.log,
    gameOver: gameOverState,
    unitsKilled,
  };

  if (!resolutionResult.frames || resolutionResult.frames.length === 0) {
    return finalizePendingResolution({
      ...state,
      pendingResolution,
    });
  }

  return {
    ...state,
    animationQueue: resolutionResult.frames,
    isAnimating: true,
    pendingResolution,
    actions: {},
    unitGhosts: {},
    selectedUnitId: null,
    validMoves: [],
    activeProjectiles: [],
    awaitingNextAction: false,
  };
};

export const handleAddLog = (state, action) => ({
  ...state,
  log: [...state.log, action.payload],
});

export const handleSetGameOver = (state, action) => ({
  ...state,
  gameOver: action.payload,
});

export const handleUpdateCover = (state, action) => {
  const { r, c, value } = action.payload;
  const newCover = state.board.cover.map((row) => [...row]);
  newCover[r][c] = value;
  const baseCoverHp = state.board.coverHp
    ? state.board.coverHp.map((row) => [...row])
    : state.board.cover.map((row) => row.map((cell) => (cell ? COVER_MAX_HITS : 0)));
  baseCoverHp[r][c] = value ? COVER_MAX_HITS : 0;
  return {
    ...state,
    board: { ...state.board, cover: newCover, coverHp: baseCoverHp },
  };
};

export const handleRenameUnit = (state, action) => {
  const { unitId, newName } = action.payload;
  const units = state.units.map((unit) =>
    unit.id === unitId ? { ...unit, name: newName } : unit
  );
  return {
    ...state,
    units,
  };
};

export const handleResetBoard = (_state, action) => action.payload;

export const handleAdvanceFrame = (state) => {
  if (!state.isAnimating) return state;
  if (!state.animationQueue || state.animationQueue.length === 0) {
    return finalizePendingResolution(state);
  }
  const [currentFrame, ...rest] = state.animationQueue;
  let nextState = applyFrameToState({
    ...state,
    animationQueue: rest,
  }, currentFrame);
  if (rest.length === 0) {
    nextState = finalizePendingResolution(nextState);
  }
  return nextState;
};
