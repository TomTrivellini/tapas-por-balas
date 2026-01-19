import { getShieldValue, items } from '../../data/shopItems';
import { getRandomBattleName } from '../../data/battleNames';
import { validMoveCells } from './battleRules';
import { COVER_MAX_HITS } from './battleConstants';

const BOARD_ROWS = 3;
const COLS_PER_SIDE = 4;
const MIDDLE_COLUMN = COLS_PER_SIDE;
const TOTAL_COLS = COLS_PER_SIDE * 2 + 1; // agrega la columna neutral
const ENEMY_START_COLUMN = MIDDLE_COLUMN + 1;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const ITEM_MAP = new Map(items.map((item) => [item.id, item]));
const OBJECT_ITEMS = items.filter((item) => item.type === 'object');

const enemySpawnTemplates = [
  { id: 'B1', name: 'Enemigo 1', r: 0, c: ENEMY_START_COLUMN },
  { id: 'B2', name: 'Enemigo 2', r: 1, c: ENEMY_START_COLUMN + 1 },
  { id: 'B3', name: 'Enemigo 3', r: 2, c: ENEMY_START_COLUMN + 2 },
];

const enemyWeaponPool = ['rev', 'shg', 'rif'];

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const generateEnemyUnit = (template) => {
  const weapon = pickRandom(enemyWeaponPool);
  const weaponEntry = weapon ? ITEM_MAP.get(weapon) : null;
  const ammo = randomInt(1, 6);
  const hasHelmet = Math.random() < 0.5;
  const hasVest = Math.random() < 0.4;
  const hasObject = OBJECT_ITEMS.length > 0 && Math.random() < 0.5;
  const objectItem = hasObject ? pickRandom(OBJECT_ITEMS).id : null;
  const randomName = getRandomBattleName(template.name);

  return {
    id: template.id,
    team: 'B',
    name: randomName,
    hp: 1,
    ammo,
    r: template.r,
    c: template.c,
    alive: true,
    ap: 2,
    weapon,
    loaded: Boolean(weaponEntry?.instantShot),
    isCovered: false,
    helmet: hasHelmet ? 'mask' : null,
    helmetHp: hasHelmet ? getShieldValue('mask') : 0,
    vest: hasVest ? 'vest' : null,
    vestHp: hasVest ? getShieldValue('vest') : 0,
    objectItem,
    movementLock: 0,
    weaponInstantShot: Boolean(weaponEntry?.instantShot),
    weaponDisposable: Boolean(weaponEntry?.disposable),
    weaponNoReload: Boolean(weaponEntry?.noReload),
    maxHp: 3,
    maxAp: 2,
    currentMaxAp: 2,
    apBonusRounds: 0,
    apBonusValue: 1,
    tapasDrop: randomInt(15, 70),
  };
};

export const generateDefaultEnemyTeam = () => enemySpawnTemplates.map((template) => generateEnemyUnit(template));

/**
 * Estado inicial del juego táctico.
 * 
 * Estructura:
 * - units: array de unidades con {id, team, name, hp, ammo, r, c, alive, ap, maxAp}
 * - board: tablero con rows, colsPerSide, coberturas
 * - actions: acciones planificadas {unitId: [Action, Action, ...]}
 * - round: número de ronda actual
 * - phase: 'planning' | 'resolving'
 * - selectedUnitId: unidad seleccionada en UI
 * - log: historial de eventos
 * - gameOver: {active: bool, winner: 'teamA' | 'teamB' | null, reason: string}
 * 
 * Sistema de AP:
 * - Cada unidad inicia cada ronda con 2 AP
 * - Mover 1 celda = 1 AP
 * - Disparar = 1 AP
 * - Cubrirse = 1 AP
 * - Recargar = 1 AP
 * - Cuando AP se agota, se resuelven todas las acciones simultáneamente
 */

export const createBattleState = (teamA = [], teamB = [], coverMap = null) => {
  // Convertir reclutas a unidades de batalla
  const convertRecruitToUnit = (recruit, index, team) => {
    const inventoryIndex =
      typeof recruit.inventoryIndex === 'number' ? recruit.inventoryIndex : null;
    const weapon = recruit.weapon ? recruit.weapon : null;
    const weaponEntry = weapon ? ITEM_MAP.get(weapon) : null;
    const helmet = recruit.helmet || null;
    const vest = recruit.vest || null;
    const allyRow = index % BOARD_ROWS;
    const enemyRow = index % BOARD_ROWS;
    const allyColBase = Math.min(COLS_PER_SIDE - 1, index % COLS_PER_SIDE);
    const enemyColBase = ENEMY_START_COLUMN + (index % COLS_PER_SIDE);
    
    const instantShot = Boolean(weaponEntry?.instantShot);
    const disposableWeapon = Boolean(weaponEntry?.disposable);
    const noReloadWeapon = Boolean(weaponEntry?.noReload);
    const maxHp = recruit.maxHp || 3;
    const baseMaxAp = typeof recruit.maxAp === 'number' ? recruit.maxAp : 2;
    const helmetEntry = helmet ? ITEM_MAP.get(helmet) : null;
    const vestEntry = vest ? ITEM_MAP.get(vest) : null;
    const equipmentApBonus =
      (typeof helmetEntry?.apBonusValue === 'number' ? helmetEntry.apBonusValue : 0) +
      (typeof vestEntry?.apBonusValue === 'number' ? vestEntry.apBonusValue : 0);
    const maxAp = baseMaxAp + equipmentApBonus;

    return {
      id: `${team}${index + 1}`,
      team,
      name: recruit.name,
      hp: 1,
      ammo: recruit.ammo || 0,
      r: team === 'A' ? allyRow : enemyRow,
      c: team === 'A' ? allyColBase : enemyColBase,
      alive: true,
      ap: maxAp,
      weapon: recruit.weapon || null,
      loaded: instantShot, // Arma siempre comienza descargada (o instantánea)
      isCovered: false,
      helmet,
      helmetHp:
        recruit.helmetHp !== undefined
          ? recruit.helmetHp
          : helmet
            ? getShieldValue(helmet)
            : 0,
      vest,
      vestHp:
        recruit.vestHp !== undefined
          ? recruit.vestHp
          : vest
            ? getShieldValue(vest)
            : 0,
      objectItem: recruit.objectItem || null,
      movementLock: 0,
      weaponInstantShot: instantShot,
      weaponDisposable: disposableWeapon,
      weaponNoReload: noReloadWeapon,
      maxHp,
      maxAp,
      currentMaxAp: maxAp,
      apBonusRounds: 0,
      apBonusValue: 1,
      tapasDrop:
        recruit.tapasDrop !== undefined
          ? recruit.tapasDrop
          : team === 'B'
            ? randomInt(15, 70)
            : 0,
      inventoryIndex,
    };
  };

  const defaultTeamB = generateDefaultEnemyTeam();

  // Si tenemos equipos del TeamContext, usarlos; si no, quedar sin aliados.
  let units = [];
  
  if (teamA.length > 0) {
    units = [
      ...teamA.map((recruit, idx) => convertRecruitToUnit(recruit, idx, 'A')),
      ...(teamB.length > 0
        ? teamB.map((recruit, idx) => convertRecruitToUnit(recruit, idx, 'B'))
        : defaultTeamB),
    ];
  } else if (teamB.length > 0) {
    units = teamB.map((recruit, idx) => convertRecruitToUnit(recruit, idx, 'B'));
  }

  // Crear mapa de coberturas: true = hay cobertura, false = no
  const createCoverMap = () => {
    if (coverMap) return coverMap;
    
    const cover = Array(BOARD_ROWS)
      .fill(null)
      .map(() => Array(TOTAL_COLS).fill(false));
    
    // Generar 3 coberturas aleatorias en campo aliado (sin casillas de salida)
    const allyCoverColumns = Array.from(
      { length: Math.max(0, COLS_PER_SIDE - 1) },
      (_, index) => index + 1
    );
    let coversA = 0;
    while (coversA < 3) {
      const r = Math.floor(Math.random() * BOARD_ROWS);
      const c = allyCoverColumns[Math.floor(Math.random() * allyCoverColumns.length)];
      if (!cover[r][c]) {
        cover[r][c] = true;
        coversA++;
      }
    }
    
    // Generar 3 coberturas aleatorias en campo enemigo (sin casillas de salida)
    const enemyCoverColumns = Array.from(
      { length: Math.max(0, COLS_PER_SIDE - 1) },
      (_, index) => ENEMY_START_COLUMN + index
    );
    let coversB = 0;
    while (coversB < 3) {
      const r = Math.floor(Math.random() * BOARD_ROWS);
      const c = enemyCoverColumns[Math.floor(Math.random() * enemyCoverColumns.length)];
      if (!cover[r][c]) {
        cover[r][c] = true;
        coversB++;
      }
    }
    
    return cover;
  };

  const coverLayout = createCoverMap();
  const coverHp = coverLayout.map((row) =>
    row.map((cell) => (cell ? COVER_MAX_HITS : 0))
  );

  const board = {
    rows: BOARD_ROWS,
    colsPerSide: COLS_PER_SIDE,
    middleColumn: MIDDLE_COLUMN,
    totalCols: TOTAL_COLS,
    cover: coverLayout,
    coverHp,
  };

  const planningOrder = units
    .filter((u) => u.team === 'A' && u.alive)
    .map((u) => u.id);
  const initialSelectedUnitId = planningOrder[0] || null;
  const initialSelectedUnit = initialSelectedUnitId
    ? units.find((u) => u.id === initialSelectedUnitId)
    : null;
  const initialValidMoves =
    initialSelectedUnit && initialSelectedUnit.ap > 0
      ? validMoveCells(initialSelectedUnit, board, units, {})
      : [];

  return {
    units,
    board,
    actions: {}, // {unitId: [Action, Action, ...]}
    round: 1,
    selectedUnitId: initialSelectedUnitId,
    validMoves: initialValidMoves, // celdas válidas para movimiento
    unitGhosts: {}, // {unitId: {r, c}} - posición final predicha
    log: ['=== Iniciando Batalla ==='],
    gameOver: { active: false, winner: null, reason: '' },
    unitsKilled: [],
    planningOrder,
    currentPlanningIndex: 0,
    animationQueue: [],
    isAnimating: false,
    pendingResolution: null,
    activeProjectiles: [],
    awaitingNextAction: false,
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
  USE_OBJECT: 'USE_OBJECT', // {row: number}
};
