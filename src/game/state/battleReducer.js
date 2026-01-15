/**
 * Reducer del juego táctico.
 * Maneja todas las transiciones de estado.
 */

import {
  validMoveCells,
  pickShotTarget,
  resolveMovesSimultaneous,
  canShoot,
  getTotalAmmo,
  isTeamEliminated,
} from './battleRules';

export const BATTLE_ACTIONS = {
  SELECT_UNIT: 'SELECT_UNIT',
  SET_VALID_MOVES: 'SET_VALID_MOVES',
  PLAN_MOVE: 'PLAN_MOVE',
  PLAN_SHOOT: 'PLAN_SHOOT',
  PLAN_COVER: 'PLAN_COVER',
  PLAN_RELOAD: 'PLAN_RELOAD',
  PLAN_RUN: 'PLAN_RUN',
  CLEAR_ORDER: 'CLEAR_ORDER',
  RESOLVE_TURN: 'RESOLVE_TURN',
  NEXT_ROUND: 'NEXT_ROUND',
  ADD_LOG: 'ADD_LOG',
  SET_GAME_OVER: 'SET_GAME_OVER',
  RESET_BOARD: 'RESET_BOARD',
  UPDATE_COVER: 'UPDATE_COVER',
};

export const battleReducer = (state, action) => {
  switch (action.type) {
    case BATTLE_ACTIONS.SELECT_UNIT: {
      const unit = state.units.find((u) => u.id === action.payload);
      const moves = unit && unit.alive ? validMoveCells(unit, state.board, state.units) : [];
      return {
        ...state,
        selectedUnitId: action.payload,
        validMoves: moves,
      };
    }

    case BATTLE_ACTIONS.SET_VALID_MOVES: {
      return {
        ...state,
        validMoves: action.payload,
      };
    }

    case BATTLE_ACTIONS.PLAN_MOVE: {
      const { unitId, to } = action.payload;
      const newOrders = { ...state.orders };
      if (!newOrders[unitId]) newOrders[unitId] = { ap1: null, ap2: null };
      newOrders[unitId][`ap${state.currentAP}`] = { type: 'MOVE', to };
      return {
        ...state,
        orders: newOrders,
        validMoves: [],
      };
    }

    case BATTLE_ACTIONS.PLAN_SHOOT: {
      const { unitId, row } = action.payload;
      const newOrders = { ...state.orders };
      if (!newOrders[unitId]) newOrders[unitId] = { ap1: null, ap2: null };
      newOrders[unitId][`ap${state.currentAP}`] = { type: 'SHOOT', row };
      return {
        ...state,
        orders: newOrders,
      };
    }

    case BATTLE_ACTIONS.PLAN_COVER: {
      const { unitId } = action.payload;
      const newOrders = { ...state.orders };
      if (!newOrders[unitId]) newOrders[unitId] = { ap1: null, ap2: null };
      newOrders[unitId][`ap${state.currentAP}`] = { type: 'COVER' };
      return {
        ...state,
        orders: newOrders,
      };
    }

    case BATTLE_ACTIONS.PLAN_RELOAD: {
      const { unitId } = action.payload;
      const newOrders = { ...state.orders };
      if (!newOrders[unitId]) newOrders[unitId] = { ap1: null, ap2: null };
      newOrders[unitId][`ap${state.currentAP}`] = { type: 'RELOAD' };
      return {
        ...state,
        orders: newOrders,
      };
    }

    case BATTLE_ACTIONS.PLAN_RUN: {
      return {
        ...state,
        gameOver: {
          active: true,
          winner: null,
          reason: '¡El jugador ha huido!',
        },
      };
    }

    case BATTLE_ACTIONS.CLEAR_ORDER: {
      const { unitId } = action.payload;
      const newOrders = { ...state.orders };
      if (newOrders[unitId]) {
        newOrders[unitId][`ap${state.currentAP}`] = null;
      }
      return {
        ...state,
        orders: newOrders,
      };
    }

    case BATTLE_ACTIONS.RESOLVE_TURN: {
      // Resolver todas las órdenes del turno actual
      let newUnits = [...state.units];
      let newLog = [...state.log];
      let gameOverState = { ...state.gameOver };

      // 1. Resolver movimientos
      const movedUnits = {};
      newUnits.forEach((unit) => {
        const orders = state.orders[unit.id];
        const apKey = `ap${state.currentAP}`;
        if (orders && orders[apKey] && orders[apKey].type === 'MOVE') {
          movedUnits[unit.id] = orders[apKey].to;
        }
      });

      const resolvedMoves = resolveMovesSimultaneous(movedUnits, newUnits);
      newUnits = newUnits.map((unit) => {
        if (resolvedMoves[unit.id]) {
          return { ...unit, r: resolvedMoves[unit.id].r, c: resolvedMoves[unit.id].c };
        }
        return unit;
      });

      // 2. Resolver disparos
      newUnits.forEach((shooter) => {
        const orders = state.orders[shooter.id];
        const apKey = `ap${state.currentAP}`;
        if (orders && orders[apKey] && orders[apKey].type === 'SHOOT') {
          if (!canShoot(shooter)) {
            newLog.push(`${shooter.name} intentó disparar pero no tiene munición`);
            return;
          }

          const target = pickShotTarget(shooter.team, orders[apKey].row, state.board, newUnits);
          if (target) {
            const dmg = 3; // daño fijo
            newUnits = newUnits.map((u) => {
              if (u.id === target.id) {
                const newHp = Math.max(0, u.hp - dmg);
                const alive = newHp > 0;
                if (!alive) newLog.push(`¡${u.name} fue eliminado!`);
                return { ...u, hp: newHp, alive };
              }
              return u;
            });

            // Gastar munición
            newUnits = newUnits.map((u) => {
              if (u.id === shooter.id) {
                return { ...u, ammo: u.ammo - 1 };
              }
              return u;
            });

            newLog.push(`${shooter.name} disparó a ${target.name} (-${dmg} HP)`);
          } else {
            newLog.push(`${shooter.name} disparó pero no hay objetivo`);
          }
        }
      });

      // 3. Resolver recargas
      newUnits = newUnits.map((unit) => {
        const orders = state.orders[unit.id];
        const apKey = `ap${state.currentAP}`;
        if (orders && orders[apKey] && orders[apKey].type === 'RELOAD') {
          newLog.push(`${unit.name} recargó (+2 munición)`);
          return { ...unit, ammo: unit.ammo + 2 };
        }
        return unit;
      });

      // Verificar condiciones de fin de juego
      if (isTeamEliminated('A', newUnits)) {
        gameOverState = { active: true, winner: 'B', reason: '¡Equipo A eliminado! Enemigos ganaron.' };
      } else if (isTeamEliminated('B', newUnits)) {
        gameOverState = { active: true, winner: 'A', reason: '¡Equipo B eliminado! ¡Victoria!' };
      } else if (getTotalAmmo('A', newUnits) === 0) {
        gameOverState = { active: true, winner: null, reason: 'No hay munición. ¡Derrota!' };
      }

      // Siguiente AP o siguiente ronda
      let newPhase = state.phase;
      let newCurrentAP = state.currentAP;
      let newRound = state.round;

      if (state.currentAP === 1) {
        newCurrentAP = 2;
      } else {
        // Fin de turno, volver a planning y siguiente ronda
        newPhase = 'planning';
        newRound = state.round + 1;
        newCurrentAP = 1;
      }

      return {
        ...state,
        units: newUnits,
        log: newLog,
        gameOver: gameOverState,
        phase: newPhase,
        currentAP: newCurrentAP,
        round: newRound,
        selectedUnitId: null,
      };
    }

    case BATTLE_ACTIONS.ADD_LOG: {
      return {
        ...state,
        log: [...state.log, action.payload],
      };
    }

    case BATTLE_ACTIONS.SET_GAME_OVER: {
      return {
        ...state,
        gameOver: action.payload,
      };
    }

    case BATTLE_ACTIONS.UPDATE_COVER: {
      const { r, c, value } = action.payload;
      const newCover = state.board.cover.map((row) => [...row]);
      newCover[r][c] = value;
      return {
        ...state,
        board: { ...state.board, cover: newCover },
      };
    }

    case BATTLE_ACTIONS.RESET_BOARD: {
      return action.payload; // Estado nuevo completo
    }

    default:
      return state;
  }
};
