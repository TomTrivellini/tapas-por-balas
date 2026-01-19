export const pickAllShotTargets = (shooterTeam, row, units) =>
  units.filter(
    (unit) =>
      unit.alive &&
      unit.team !== shooterTeam &&
      unit.r === row &&
      !unit.isCovered
  );

export const pickCoverOnlyTarget = (shooterTeam, row, units) => {
  const enemiesInRow = units.filter(
    (unit) => unit.alive && unit.team !== shooterTeam && unit.r === row
  );
  if (enemiesInRow.length === 0) return null;
  const uncovered = enemiesInRow.filter((unit) => !unit.isCovered);
  if (uncovered.length > 0) return null;
  const coveredOnly = enemiesInRow.filter((unit) => unit.isCovered);
  if (coveredOnly.length === 0) return null;
  if (shooterTeam === 'A') {
    return coveredOnly.reduce((closest, current) =>
      current.c > closest.c ? current : closest
    );
  }
  return coveredOnly.reduce((closest, current) =>
    current.c < closest.c ? current : closest
  );
};
