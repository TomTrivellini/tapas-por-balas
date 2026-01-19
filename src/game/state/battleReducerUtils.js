import { validMoveCells, canShoot } from './battleRules';

export const getActivePlanningUnitId = (state) =>
  state.planningOrder?.[state.currentPlanningIndex] || null;

export const getUnitById = (units, unitId) =>
  units.find((unit) => unit.id === unitId) || null;

export const getUnitBaseMaxAp = (unit) =>
  typeof unit?.maxAp === 'number' ? unit.maxAp : 2;

export const getUnitMaxAp = (unit) =>
  typeof unit?.currentMaxAp === 'number' ? unit.currentMaxAp : getUnitBaseMaxAp(unit);

export const computePlanningOrder = (units) =>
  units.filter((unit) => unit.team === 'A' && unit.alive).map((unit) => unit.id);

export const computeGhostPosition = (unit, actions = []) => {
  if (!unit) return null;
  let point = { r: unit.r, c: unit.c };
  actions.forEach((action) => {
    if (action.type === 'MOVE' && action.to) {
      point = { ...action.to };
    }
  });
  return point;
};

export const computeValidMovesForUnit = (unit, board, units, unitGhosts) => {
  if (!unit || !unit.alive || unit.ap <= 0) return [];
  return validMoveCells(unit, board, units, unitGhosts);
};

export const computePlannedWeaponState = (unit, plannedActions = []) => {
  if (!unit) {
    return {
      weapon: null,
      ammo: 0,
      loaded: false,
      weaponInstantShot: false,
      weaponNoReload: false,
      weaponDisposable: false,
    };
  }
  const state = {
    weapon: unit.weapon || null,
    ammo: unit.ammo ?? 0,
    loaded: Boolean(unit.loaded),
    weaponInstantShot: Boolean(unit.weaponInstantShot),
    weaponNoReload: Boolean(unit.weaponNoReload),
    weaponDisposable: Boolean(unit.weaponDisposable),
  };
  if (!Array.isArray(plannedActions)) return state;
  plannedActions.forEach((action) => {
    if (!action || !action.type) return;
    if (action.type === 'RELOAD') {
      if (
        state.weapon &&
        !state.weaponNoReload &&
        !state.weaponInstantShot &&
        !state.loaded &&
        state.ammo > 0
      ) {
        state.ammo -= 1;
        state.loaded = true;
      }
    }
    if (action.type === 'SHOOT') {
      if (!state.weapon) return;
      const canShootNow = canShoot({ ...unit, ...state }, false);
      if (!canShootNow) return;
      state.loaded = false;
      if (state.weaponDisposable) {
        state.weapon = null;
        state.ammo = 0;
      }
    }
  });
  return state;
};

export const computePlannedObjectItem = (baseObjectItem, plannedActions = []) => {
  let objectItem = baseObjectItem || null;
  if (!Array.isArray(plannedActions)) return objectItem;
  plannedActions.forEach((action) => {
    if (action?.type === 'USE_OBJECT') {
      objectItem = null;
    }
  });
  return objectItem;
};
