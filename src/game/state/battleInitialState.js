/**
 * Estado inicial del juego táctico.
 * 
 * Estructura:
 * - units: array de unidades con {id, team, name, hp, ammo, r, c, alive}
 * - board: tablero con rows, colsPerSide, coberturas
 * - orders: acciones planificadas por turno
 * - round: número de ronda actual
 * - phase: 'planning' | 'resolving'
 * - currentAP: 1 | 2 (punto de acción actual)
 * - selectedUnitId: unidad seleccionada en UI
 * - log: historial de eventos
 * - gameOver: {active: bool, winner: 'teamA' | 'teamB' | null, reason: string}
 */

export const createBattleState = (teamA = [], teamB = [], coverMap = null) => {
  const defaultTeamA = [
    { id: 'A1', team: 'A', name: 'Recluta 1', hp: 10, maxHp: 10, ammo: 6, r: 0, c: 1, alive: true },
    { id: 'A2', team: 'A', name: 'Recluta 2', hp: 10, maxHp: 10, ammo: 6, r: 1, c: 0, alive: true },
    { id: 'A3', team: 'A', name: 'Recluta 3', hp: 10, maxHp: 10, ammo: 6, r: 2, c: 2, alive: true },
  ];

  const defaultTeamB = [
    { id: 'B1', team: 'B', name: 'Enemigo 1', hp: 8, maxHp: 8, ammo: 5, r: 0, c: 4, alive: true },
    { id: 'B2', team: 'B', name: 'Enemigo 2', hp: 8, maxHp: 8, ammo: 5, r: 1, c: 5, alive: true },
    { id: 'B3', team: 'B', name: 'Enemigo 3', hp: 8, maxHp: 8, ammo: 5, r: 2, c: 3, alive: true },
  ];

  const units = [...(teamA.length > 0 ? teamA : defaultTeamA), ...(teamB.length > 0 ? teamB : defaultTeamB)];

  // Crear mapa de coberturas: true = hay cobertura, false = no
  const createCoverMap = () => {
    if (coverMap) return coverMap;
    return Array(3)
      .fill(null)
      .map(() => Array(6).fill(false));
  };

  const board = {
    rows: 3,
    colsPerSide: 3, // 3 para aliados, 3 para enemigos = 6 total
    cover: createCoverMap(),
  };

  return {
    units,
    board,
    orders: {}, // {unitId: {ap1: Action|null, ap2: Action|null}}
    round: 1,
    phase: 'planning', // 'planning' o 'resolving'
    currentAP: 1, // 1 o 2
    selectedUnitId: null,
    validMoves: [], // celdas válidas para movimiento
    log: ['=== Iniciando Batalla ==='],
    gameOver: { active: false, winner: null, reason: '' },
  };
};

/**
 * Acción base para órdenes
 */
export const createAction = (type, payload = {}) => ({
  type,
  ...payload,
});

/**
 * Tipos de acciones
 */
export const ACTION_TYPES = {
  MOVE: 'MOVE',      // {to: {r, c}}
  SHOOT: 'SHOOT',    // {row: number}
  COVER: 'COVER',    // sin payload
  RELOAD: 'RELOAD',  // sin payload
  RUN: 'RUN',        // termina batalla
};
