import { assign, createMachine } from "xstate";
import {
  handleSelectUnit,
  handleSetValidMoves,
  handlePlanAction,
  handleNextApAction,
  handlePreviousApAction,
  handleConfirmUnitPlanning,
  handleResetUnitActions,
  handleResetPlannedActions,
} from "../game/state/battleReducerPlanning";
import {
  handleClearUnitsKilled,
  handleNextRound,
  handleAddLog,
  handleSetGameOver,
  handleUpdateCover,
  handleRenameUnit,
  handleResetBoard,
  handleAdvanceFrame,
} from "../game/state/battleReducerResolution";
import { BATTLE_ACTIONS } from "./battleActions";

const applyHandler = (handler) =>
  assign(({ context, event }) => handler(context, event));

const hasAnimation = (context) =>
  Array.isArray(context.animationQueue) && context.animationQueue.length > 0;

const animationDone = (context) => !context.isAnimating;

const isGameOver = (context) => Boolean(context.gameOver?.active);

export const battleMachine = createMachine({
  id: "battle",
  initial: "planning",
  context: ({ input }) => input,
  states: {
    planning: {
      on: {
        [BATTLE_ACTIONS.SELECT_UNIT]: { actions: applyHandler(handleSelectUnit) },
        [BATTLE_ACTIONS.SET_VALID_MOVES]: { actions: applyHandler(handleSetValidMoves) },
        [BATTLE_ACTIONS.PLAN_ACTION]: { actions: applyHandler(handlePlanAction) },
        [BATTLE_ACTIONS.NEXT_AP_ACTION]: { actions: applyHandler(handleNextApAction) },
        [BATTLE_ACTIONS.PREVIOUS_AP_ACTION]: { actions: applyHandler(handlePreviousApAction) },
        [BATTLE_ACTIONS.CONFIRM_UNIT_PLANNING]: {
          actions: applyHandler(handleConfirmUnitPlanning),
        },
        [BATTLE_ACTIONS.RESET_UNIT_ACTIONS]: {
          actions: applyHandler(handleResetUnitActions),
        },
        [BATTLE_ACTIONS.RESET_PLANNED_ACTIONS]: {
          actions: applyHandler(handleResetPlannedActions),
        },
        [BATTLE_ACTIONS.NEXT_ROUND]: {
          target: "resolving",
          actions: applyHandler(handleNextRound),
        },
      },
    },
    resolving: {
      always: [
        { guard: hasAnimation, target: "animating" },
        { target: "roundEnd" },
      ],
    },
    animating: {
      on: {
        [BATTLE_ACTIONS.ADVANCE_FRAME]: {
          actions: applyHandler(handleAdvanceFrame),
          target: "animating",
        },
      },
      always: [{ guard: animationDone, target: "roundEnd" }],
    },
    roundEnd: {
      always: [
        { guard: isGameOver, target: "gameOver" },
        { target: "planning" },
      ],
    },
    gameOver: {
      type: "final",
    },
  },
  on: {
    [BATTLE_ACTIONS.ADD_LOG]: { actions: applyHandler(handleAddLog) },
    [BATTLE_ACTIONS.SET_GAME_OVER]: { actions: applyHandler(handleSetGameOver) },
    [BATTLE_ACTIONS.UPDATE_COVER]: { actions: applyHandler(handleUpdateCover) },
    [BATTLE_ACTIONS.RENAME_UNIT]: { actions: applyHandler(handleRenameUnit) },
    [BATTLE_ACTIONS.RESET_BOARD]: { actions: applyHandler(handleResetBoard) },
    [BATTLE_ACTIONS.CLEAR_UNITS_KILLED]: {
      actions: applyHandler(handleClearUnitsKilled),
    },
  },
});
