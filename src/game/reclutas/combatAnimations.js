const DEFAULT_FRAME_DURATION = 1000;

const buildMovementPath = (from, to) => {
  const steps = [];
  const current = { ...from };
  while (current.r !== to.r) {
    current.r += Math.sign(to.r - current.r);
    steps.push({ r: current.r, c: current.c });
  }
  while (current.c !== to.c) {
    current.c += Math.sign(to.c - current.c);
    steps.push({ r: current.r, c: current.c });
  }
  return steps;
};

const getTotalCols = (board) => board.totalCols || board.colsPerSide * 2;

export const getMissDestination = (unit, board) => {
  const totalCols = getTotalCols(board);
  return unit.team === 'A' ? { r: unit.r, c: totalCols } : { r: unit.r, c: -1 };
};

export const buildMoveEvent = ({
  id,
  unitId,
  team,
  name,
  from,
  to,
  duration = DEFAULT_FRAME_DURATION,
}) => ({
  id,
  type: 'move',
  unitId,
  team,
  name,
  path: [from, ...buildMovementPath(from, to)],
  duration,
});

export const buildShotEvent = ({
  id,
  unitId,
  team,
  name,
  from,
  to,
  duration = DEFAULT_FRAME_DURATION,
  result = 'hit',
}) => ({
  id,
  type: 'shot',
  unitId,
  team,
  name,
  from,
  to,
  duration,
  result,
});

export const buildProjectile = ({ id, from, to }) => ({
  id,
  from,
  to,
});

export { DEFAULT_FRAME_DURATION };
