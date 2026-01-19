/**
 * Battle rules.
 */

export const getUnitPlanningPosition = (unit, unitGhosts = {}) => {
  if (!unit) return null;
  if (unitGhosts && typeof unitGhosts === 'object') {
    const ghost = unitGhosts[unit.id];
    if (ghost && typeof ghost.r === 'number' && typeof ghost.c === 'number') {
      return ghost;
    }
  }
  return { r: unit.r, c: unit.c };
};

const getBoardLimits = (board) => {
  const colsPerSide = board.colsPerSide;
  const totalCols = board.totalCols ?? colsPerSide * 2 + 1;
  const middleColumn = board.middleColumn ?? colsPerSide;
  return { totalCols, middleColumn };
};

const isWithinTeamBounds = (team, column, board) => {
  const { middleColumn, totalCols } = getBoardLimits(board);
  if (team === 'A') {
    return column >= 0 && column < middleColumn;
  }
  return column > middleColumn && column < totalCols;
};

const manhattanDistance = (from, to) =>
  Math.abs(from.r - to.r) + Math.abs(from.c - to.c);

const isFriendlyOccupied = (r, c, units, team, unitGhosts, selfId) =>
  units.some((unit) => {
    if (!unit.alive || unit.team !== team) return false;
    if (unit.id === selfId) return false;
    if (unit.r !== r || unit.c !== c) return false;
    const ghost = unitGhosts[unit.id];
    if (ghost && (ghost.r !== unit.r || ghost.c !== unit.c)) {
      return false;
    }
    return true;
  });

const isReservedByGhost = (r, c, unitGhosts, selfId) =>
  Object.entries(unitGhosts).some(([id, ghost]) => {
    if (id === selfId || !ghost) return false;
    return ghost.r === r && ghost.c === c;
  });

export const validMoveCells = (unit, board, units, unitGhosts = {}) => {
  if (!unit || !board || unit.ap <= 0) return [];
  const ghostMap = unitGhosts && typeof unitGhosts === 'object' ? unitGhosts : {};
  const base = getUnitPlanningPosition(unit, ghostMap);
  if (!base) return [];

  const cells = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const distance = Math.abs(dr) + Math.abs(dc);
      if (distance !== 1) continue;
      const candidate = { r: base.r + dr, c: base.c + dc };
      if (candidate.r < 0 || candidate.r >= board.rows) continue;
      if (!isWithinTeamBounds(unit.team, candidate.c, board)) continue;
      if (isFriendlyOccupied(candidate.r, candidate.c, units, unit.team, ghostMap, unit.id)) continue;
      if (isReservedByGhost(candidate.r, candidate.c, ghostMap, unit.id)) continue;
      cells.push(candidate);
    }
  }
  return cells;
};

export const pickShotTarget = (shooterTeam, row, board, units) => {
  const candidates = units.filter(
    (unit) => unit.team !== shooterTeam && unit.alive && unit.r === row && !unit.isCovered
  );
  if (candidates.length === 0) return null;
  if (shooterTeam === 'A') {
    return candidates.reduce((best, current) =>
      current.c > best.c ? current : best
    );
  }
  return candidates.reduce((best, current) =>
    current.c < best.c ? current : best
  );
};

export const resolveMovesSimultaneous = (movedUnits, units) => {
  const priority = (id) => (id && id.charAt(0) === 'A' ? 0 : 1);
  const sorted = Object.keys(movedUnits).sort((a, b) => {
    const pa = priority(a);
    const pb = priority(b);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b);
  });

  const occupied = new Set();
  units.forEach((unit) => {
    if (!movedUnits[unit.id]) {
      occupied.add(`${unit.r},${unit.c}`);
    }
  });

  const resolved = {};
  sorted.forEach((unitId) => {
    const dest = movedUnits[unitId];
    const slot = `${dest.r},${dest.c}`;
    if (!occupied.has(slot)) {
      resolved[unitId] = dest;
      occupied.add(slot);
    } else {
      const unit = units.find((u) => u.id === unitId);
      resolved[unitId] = unit ? { r: unit.r, c: unit.c } : dest;
    }
  });

  return resolved;
};

export const calculateMovementAPCost = (from, to) => manhattanDistance(from, to);

export const canRun = (unit, board = null) => {
  if (!unit) return false;
  if (unit.team === 'A') {
    return unit.c === 0;
  }
  const { totalCols } = board ? getBoardLimits(board) : { totalCols: 7 };
  return unit.c === totalCols - 1;
};

export const canShoot = (unit, lastActionWasReload = false) =>
  Boolean(
    unit?.weapon &&
    (unit.loaded || lastActionWasReload || unit.weaponInstantShot || unit.weaponNoReload)
  );

export const hasCover = (unit, board) => {
  if (!unit || !board) return false;
  const { totalCols } = getBoardLimits(board);
  if (unit.r < 0 || unit.r >= board.rows) return false;
  if (unit.c < 0 || unit.c >= totalCols) return false;
  return Boolean(board.cover?.[unit.r]?.[unit.c]);
};

export const isTeamEliminated = (team, units) =>
  !units.some((unit) => unit.team === team && unit.alive);

export const getTotalAmmo = (team, units) =>
  units.reduce((total, unit) => {
    if (unit.team !== team || !unit.alive) return total;
    const loadedAmmo = unit.loaded ? 1 : 0;
    return total + (unit.ammo || 0) + loadedAmmo;
  }, 0);
