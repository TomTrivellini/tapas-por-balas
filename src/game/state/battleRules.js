/**
 * Reglas del juego táctico.
 * 
 * Funciones puras para validar y calcular acciones del juego.
 */

/**
 * Obtener todas las celdas válidas para mover una unidad.
 * - 1 casillero ortogonal (arriba, abajo, izquierda, derecha)
 * - Misma mitad del tablero (no cruzar frontera c=2/c=3)
 * - Celda no ocupada por aliado (sí ocupada por enemigo es invalid)
 */
export const validMoveCells = (unit, board, units) => {
  const { r, c, team } = unit;
  const colsPerSide = board.colsPerSide;
  const rows = board.rows;

  // Límites de la mitad del tablero
  const minCol = team === 'A' ? 0 : colsPerSide;
  const maxCol = team === 'A' ? colsPerSide - 1 : colsPerSide * 2 - 1;

  const directions = [
    { r: r - 1, c }, // arriba
    { r: r + 1, c }, // abajo
    { r, c: c - 1 }, // izquierda
    { r, c: c + 1 }, // derecha
  ];

  return directions.filter((pos) => {
    // Dentro de los límites del tablero
    if (pos.r < 0 || pos.r >= rows) return false;
    // Dentro de los límites de la mitad
    if (pos.c < minCol || pos.c > maxCol) return false;
    // No ocupada por otro aliado
    const occupant = units.find((u) => u.r === pos.r && u.c === pos.c && u.alive);
    if (occupant && occupant.team === team) return false;
    return true;
  });
};

/**
 * Obtener el objetivo de un disparo en una fila.
 * - Busca el enemigo más cercano a la frontera (hacia la mitad opuesta)
 * - Ignora aliados
 */
export const pickShotTarget = (shooterTeam, row, board, units) => {
  // Enemigos vivos en esa fila
  const enemiesInRow = units.filter(
    (u) => u.r === row && u.alive && u.team !== shooterTeam
  );

  if (enemiesInRow.length === 0) return null;

  // Enemigo más cercano a la frontera
  if (shooterTeam === 'A') {
    // Aliados disparan hacia derecha (frontera en c=3), buscamos el más cercano a c=3
    return enemiesInRow.reduce((closest, curr) =>
      curr.c > closest.c ? curr : closest
    );
  } else {
    // Enemigos disparan hacia izquierda (frontera en c=2), buscamos el más cercano a c=2
    return enemiesInRow.reduce((closest, curr) =>
      curr.c < closest.c ? curr : closest
    );
  }
};

/**
 * Resolver movimientos simultáneos.
 * - Si una unidad abandona un slot, ese slot está disponible en el mismo turno
 * - Prohibir terminar con 2 unidades en mismo slot
 * - Conflictos: prioridad = Team A primero, luego por id (A1 < A2 < A3)
 */
export const resolveMovesSimultaneous = (movedUnits, units) => {
  /**
   * movedUnits: {unitId: {r, c}} destinos planificados
   * units: array original de unidades
   * return: {unitId: {r, c}} destinos finales resueltos
   */

  const sortPriority = (id1, id2) => {
    const team1 = id1.charAt(0);
    const team2 = id2.charAt(0);
    if (team1 !== team2) return team1 === 'A' ? -1 : 1;
    return id1.localeCompare(id2);
  };

  const sortedIds = Object.keys(movedUnits).sort(sortPriority);
  const result = {};
  const occupiedSlots = new Set();

  // Unidades que NO se mueven también ocupan slots
  units.forEach((u) => {
    if (!movedUnits[u.id]) {
      occupiedSlots.add(`${u.r},${u.c}`);
    }
  });

  // Procesar movimientos en orden de prioridad
  sortedIds.forEach((unitId) => {
    const destination = movedUnits[unitId];
    const slot = `${destination.r},${destination.c}`;

    if (!occupiedSlots.has(slot)) {
      result[unitId] = destination;
      occupiedSlots.add(slot);
    } else {
      // Conflicto: mantener posición original
      const unit = units.find((u) => u.id === unitId);
      result[unitId] = { r: unit.r, c: unit.c };
    }
  });

  return result;
};

/**
 * Validar si una unidad tiene suficiente munición para disparar.
 */
export const canShoot = (unit) => unit.ammo > 0;

/**
 * Validar si una unidad está sobre cobertura.
 */
export const isOnCover = (unit, board) => {
  if (unit.r < 0 || unit.r >= board.rows) return false;
  if (unit.c < 0 || unit.c >= board.colsPerSide * 2) return false;
  return board.cover[unit.r][unit.c];
};

/**
 * Calcular ammo total de un equipo.
 */
export const getTotalAmmo = (team, units) => {
  return units
    .filter((u) => u.team === team && u.alive)
    .reduce((sum, u) => sum + u.ammo, 0);
};

/**
 * Verificar si un equipo está eliminado.
 */
export const isTeamEliminated = (team, units) => {
  return !units.some((u) => u.team === team && u.alive);
};
