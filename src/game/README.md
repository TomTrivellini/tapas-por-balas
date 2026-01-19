# 🎮 Sistema de Juego Táctico por Turnos

## Descripción General

Sistema modular y escalable de juego táctico por turnos embebido en React/Vite. Permite batallar entre dos equipos en un tablero táctico 3x6 con mecánicas de movimiento simultáneo, disparos con línea de visión y manejo de recursos (munición).

## Estructura del Proyecto

```
src/game/
├── Juego/                          # Componente principal
│   ├── Juego.jsx                   # Contenedor y orquestador del juego
│   └── components/
│       ├── Escenario/              # Renderizado del tablero
│       │   ├── Escenario.jsx       # Board principal
│       │   └── Cell.jsx            # Celda individual
│       ├── Enemigos/               # Panel de info de enemigos
│       │   └── EnemigosPanel.jsx
│       └── UI/                     # Componentes de interfaz
│           ├── HUD.jsx             # Info de ronda, AP, munición
│           └── LogPanel.jsx        # Registro de eventos
├── editor/                         # Editor de escenarios
│   └── EditorEscenario.jsx        # Pintar/borrar coberturas y export/import
├── state/                          # Lógica y estado del juego
│   ├── battleInitialState.js       # Estado inicial y tipos
│   ├── battleRules.js              # Reglas puras del juego
│   ├── battleReducer.js            # Reducer para transiciones de estado
│   ├── BattleContext.jsx           # Context API + hook useBattle
│   └── theme.js                    # Colores y estilos
└── README.md                       # Este archivo
```

## Flujo de Juego

### Ciclo de Turno

1. **Planning Phase (AP1)**
   - Jugador selecciona unidad aliada (click en el tablero)
   - Planifica acción: MOVE, SHOOT, COVER, RELOAD, RUN
   - Sistema muestra celdas válidas en verde

2. **Resolve AP1**
   - Click en botón "Resolver AP1"
   - Se ejecutan todas las órdenes simultaneamente:
     - Movimientos resueltos con regla de prioridad
     - Disparos impactan objetivo más cercano a frontera
     - Recargas suma +2 munición

3. **Planning Phase (AP2)**
   - Mismo flujo que AP1

4. **Resolve AP2**
   - Mismo proceso que Resolve AP1

5. **Next Round**
   - Vuelve a Planning Phase (AP1) con ronda++

### Condiciones de Fin de Juego

- Equipo eliminado (todos muertos) → **victoria/derrota**
- Munición total = 0 → **derrota** (sin forma de atacar)
- Jugador elige "Huir" → **derrota**

## Mecánicas Principales

### Movimiento

- **Rango**: 1 casillero ortogonal (arriba, abajo, izq, der)
- **Restricción**: No cruzar frontera entre mitades
- **Colisión**: No puede ocupar misma celda que aliado vivo
- **Simultaneidad**: Si A abandona su slot, B puede ocuparlo en mismo turno
- **Conflictos**: Resuelta con prioridad → Team A primero, luego por ID (A1 < A2)

### Disparo

- **Alcance**: Toda la fila (línea recta)
- **Visión**: Ignora aliados, impacta **solo el enemigo más cercano a la frontera**
- **Costo**: -1 munición
- **Daño**: 3 HP
- **Futuro**: Armas "piercing" atraviesan y dañan a todos (modelo preparado)

### Cobertura

- **Requisito**: Unidad debe estar sobre celda con cobertura (🧱)
- **Efecto**: En futuras versiones reducirá daño
- **Actual**: Solo registra la acción

### Recarga

- **Efecto**: +2 munición a la unidad
- **Costo**: 1 AP

### Huida (RUN)

- **Efecto**: Termina batalla inmediatamente
- **Resultado**: Derrota del jugador

## Estado del Juego

### Estructura Principal

```javascript
{
  units: [
    {
      id: 'A1',              // ID único
      team: 'A' | 'B',       // Equipo
      name: 'Recluta 1',     // Nombre
      hp: 10,                // HP actual
      maxHp: 10,             // HP máximo
      ammo: 6,               // Munición
      r: 0, c: 1,            // Posición (fila, columna)
      alive: true            // ¿Vivo?
    },
    ...
  ],
  board: {
    rows: 3,
    colsPerSide: 3,          // 3 por lado = 6 columnas total
    cover: [                 // Mapa de coberturas [r][c]
      [false, true, false, false, true, false],
      [false, false, false, true, false, true],
      [true, false, false, false, false, false]
    ]
  },
  orders: {
    'A1': {
      ap1: { type: 'MOVE', to: { r: 0, c: 2 } },
      ap2: { type: 'SHOOT', row: 0 }
    },
    ...
  },
  round: 1,
  phase: 'planning' | 'resolving',
  currentAP: 1 | 2,
  selectedUnitId: 'A1',      // Unidad actualmente seleccionada
  validMoves: [              // Celdas válidas para mover la seleccionada
    { r: 0, c: 2 },
    { r: 1, c: 1 }
  ],
  log: [                      // Historial de eventos
    '=== Iniciando Batalla ===',
    'A1 disparó a B2 (-3 HP)',
    '...'
  ],
  gameOver: {
    active: false,
    winner: 'A' | 'B' | null,
    reason: 'Descripción del resultado'
  }
}
```

## Acciones Disponibles

### ACTION_TYPES (en `battleInitialState.js`)

```javascript
MOVE: 'MOVE'      // { to: {r, c} }
SHOOT: 'SHOOT'    // { row: number }
COVER: 'COVER'    // (sin payload)
RELOAD: 'RELOAD'  // (sin payload)
RUN: 'RUN'        // (termina batalla)
```

### BATTLE_ACTIONS (en `battleReducer.js`)

- `SELECT_UNIT`: Seleccionar unidad (actualiza validMoves)
- `PLAN_MOVE`: Planificar movimiento
- `PLAN_SHOOT`: Planificar disparo
- `PLAN_COVER`: Planificar cobertura
- `PLAN_RELOAD`: Planificar recarga
- `PLAN_RUN`: Huir (fin de batalla)
- `CLEAR_ORDER`: Limpiar orden de AP actual
- `RESOLVE_TURN`: Ejecutar todas las órdenes del AP actual
- `UPDATE_COVER`: Editar cobertura en editor
- `RESET_BOARD`: Reiniciar tablero completo
- `ADD_LOG`: Agregar evento al log

## Uso en Componentes

### Hook `useBattle()`

```javascript
import { useBattle } from '../state/BattleContext';
import { BATTLE_ACTIONS } from '../state/battleReducer';

export default function MyComponent() {
  const { state, dispatch } = useBattle();
  
  const { units, board, orders, round, phase } = state;
  
  const handleAction = () => {
    dispatch({
      type: BATTLE_ACTIONS.SELECT_UNIT,
      payload: 'A1'
    });
  };
  
  return <div>...</div>;
}
```

### Provider Setup

```javascript
import { BattleProvider } from '../state/BattleContext';
import Juego from './Juego/Juego';

export default function Home() {
  return (
    <BattleProvider>
      <Juego />
    </BattleProvider>
  );
}
```

## Extensibilidad

### Agregar Nueva Acción

1. Agregar tipo en `battleInitialState.js` → `ACTION_TYPES`
2. Agregar case en `battleReducer.js` → `BATTLE_ACTIONS`
3. Crear función auxiliar en `battleRules.js` si es necesario
4. Llamar desde componentes con `dispatch()`

### Armas "Piercing" (Ejemplo Futuro)

```javascript
// En battleRules.js
export const pickAllTargetsInRow = (shooterTeam, row, board, units, piercing = false) => {
  if (piercing) {
    // Retorna todos los enemigos en la fila
  } else {
    // Retorna solo el más cercano
  }
};
```

### Estadísticas Adicionales

- Agregar propiedades a `units` (armadura, velocidad, etc.)
- Extender `pickShotTarget()` para calcular daño variable
- Agregar `modifyDamage()` en las reglas

## Colores (tema.js)

```javascript
bg: '#060606'              // Fondo principal
panel: '#0b0b0b'           // Paneles
border: '#333'             // Bordes
allyTeam: '#1d3a6b'        // Azul (aliados)
enemyTeam: '#6b1d1d'       // Rojo (enemigos)
cover: '#8a8a8a'           // Cobertura
validMove: '#133a22'       // Verde (movimiento válido)
selected: '#fff'           // Blanco (seleccionado)
text: '#ccc'               // Texto general
```

## Editor de Escenarios

### Funcionalidad

- Click en celdas para pintar/borrar cobertura (🧱)
- **Exportar**: Descarga `escenario.json` con estructura del board
- **Importar**: Carga escenario desde JSON

### Formato JSON

```json
{
  "rows": 3,
  "colsPerSide": 3,
  "cover": [
    [false, true, false, false, true, false],
    [false, false, false, true, false, true],
    [true, false, false, false, false, false]
  ]
}
```

## Próximas Características (Roadmap)

- [ ] IA enemiga (minimax, heurísticas)
- [ ] Efectos de status (quemado, aturdido)
- [ ] Diferentes tipos de arma
- [ ] Terreno que afecta movimiento/precisión
- [ ] Sistema de habilidades especiales
- [ ] Multiplayer (si es posible)

## Notas de Desarrollo

- **Sin librerías externas**: Solo React (hooks + context)
- **Lógica pura**: Reglas en `battleRules.js` sin side effects
- **Componentes sin lógica**: UI en componentes, lógica en reducer
- **Escalabilidad**: Agregar nuevas acciones/reglas sin tocar componentes existentes
- **Performance**: Grid 3x6 = 18 celdas, sin renders innecesarios

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0 MVP
