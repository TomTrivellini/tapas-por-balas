import {
  handleSelectUnit,
  handleSetValidMoves,
  handlePlanAction,
  handleNextApAction,
  handlePreviousApAction,
  handleConfirmUnitPlanning,
  handleResetUnitActions,
  handleResetPlannedActions,
} from './battleReducerPlanning';
import {
  handleClearUnitsKilled,
  handleNextRound,
  handleAddLog,
  handleSetGameOver,
  handleUpdateCover,
  handleRenameUnit,
  handleResetBoard,
  handleAdvanceFrame,
} from './battleReducerResolution';

export const BATTLE_ACTIONS = {
  SELECT_UNIT: 'SELECT_UNIT',
  SET_VALID_MOVES: 'SET_VALID_MOVES',
  PLAN_ACTION: 'PLAN_ACTION',
  NEXT_AP_ACTION: 'NEXT_AP_ACTION',
  PREVIOUS_AP_ACTION: 'PREVIOUS_AP_ACTION',
  RUN: 'RUN',
  USE_OBJECT: 'USE_OBJECT',
  CONFIRM_UNIT_PLANNING: 'CONFIRM_UNIT_PLANNING',
  NEXT_ROUND: 'NEXT_ROUND',
  ADD_LOG: 'ADD_LOG',
  SET_GAME_OVER: 'SET_GAME_OVER',
  RESET_BOARD: 'RESET_BOARD',
  UPDATE_COVER: 'UPDATE_COVER',
  RENAME_UNIT: 'RENAME_UNIT',
  RESET_PLANNED_ACTIONS: 'RESET_PLANNED_ACTIONS',
  RESET_UNIT_ACTIONS: 'RESET_UNIT_ACTIONS',
  CLEAR_UNITS_KILLED: 'CLEAR_UNITS_KILLED',
  ADVANCE_FRAME: 'ADVANCE_FRAME',
};

export const battleReducer = (state, action) => {
  switch (action.type) {
    case BATTLE_ACTIONS.SELECT_UNIT: {
      return handleSelectUnit(state, action);
    }

    case BATTLE_ACTIONS.SET_VALID_MOVES: {
      return handleSetValidMoves(state, action);
    }

    case BATTLE_ACTIONS.PLAN_ACTION: {
      return handlePlanAction(state, action);
    }

    case BATTLE_ACTIONS.NEXT_AP_ACTION: {
      return handleNextApAction(state, action);
    }

    case BATTLE_ACTIONS.PREVIOUS_AP_ACTION: {
      return handlePreviousApAction(state, action);
    }

    case BATTLE_ACTIONS.CONFIRM_UNIT_PLANNING: {
      return handleConfirmUnitPlanning(state, action);
    }

    case BATTLE_ACTIONS.RESET_UNIT_ACTIONS: {
      return handleResetUnitActions(state, action);
    }

    case BATTLE_ACTIONS.RESET_PLANNED_ACTIONS: {
      return handleResetPlannedActions(state, action);
    }

    case BATTLE_ACTIONS.CLEAR_UNITS_KILLED: {
      return handleClearUnitsKilled(state, action);
    }

    case BATTLE_ACTIONS.NEXT_ROUND: {
      return handleNextRound(state, action);
    }

    case BATTLE_ACTIONS.ADD_LOG: {
      return handleAddLog(state, action);
    }

    case BATTLE_ACTIONS.SET_GAME_OVER: {
      return handleSetGameOver(state, action);
    }

    case BATTLE_ACTIONS.UPDATE_COVER: {
      return handleUpdateCover(state, action);
    }

    case BATTLE_ACTIONS.RENAME_UNIT: {
      return handleRenameUnit(state, action);
    }

    case BATTLE_ACTIONS.RESET_BOARD: {
      return handleResetBoard(state, action);
    }

    case BATTLE_ACTIONS.ADVANCE_FRAME: {
      return handleAdvanceFrame(state, action);
    }

    default:
      return state;
  }
};
