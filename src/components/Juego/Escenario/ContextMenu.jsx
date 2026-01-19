/**
 * ContextMenu.jsx - Menú de click derecho para acciones en celdas
 */

import { theme } from '../../../game/state/theme';
import { canRun, canShoot } from '../../../game/state/battleRules';
import { useInventory } from '../../../context/InventoryContext';

const computePlannedCoverState = (baseCovered, plannedActions) => {
  let covered = Boolean(baseCovered);
  if (!Array.isArray(plannedActions)) return covered;
  plannedActions.forEach((action) => {
    if (!action || !action.type) return;
    if (['MOVE', 'SHOOT', 'RUN', 'USE_OBJECT'].includes(action.type)) {
      covered = false;
    } else if (action.type === 'COVER') {
      covered = true;
    }
  });
  return covered;
};

const computePlannedObjectItem = (baseObjectItem, plannedActions) => {
  let objectItem = baseObjectItem || null;
  if (!Array.isArray(plannedActions)) return objectItem;
  plannedActions.forEach((action) => {
    if (action?.type === 'USE_OBJECT') {
      objectItem = null;
    }
  });
  return objectItem;
};

const computePlannedWeaponState = (unit, plannedActions) => {
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

export default function ContextMenu({
  position,
  r,
  c,
  unit,
  selectedUnit,
  board,
  plannedActions,
  validMoves,
  ghostPosition,
  onAction,
  onClose,
}) {
  if (!position) return null;

  const { porId } = useInventory();

  const actions = [];
  const lastAction = plannedActions?.[plannedActions.length - 1];
  const lastActionWasReload = lastAction?.type === 'RELOAD';
  const ghost = ghostPosition || (selectedUnit ? { r: selectedUnit.r, c: selectedUnit.c } : null);
  const isSameCell = ghost ? ghost.r === r && ghost.c === c : false;
  const occupiedByOtherUnit = selectedUnit && unit && unit.alive && unit.id !== selectedUnit.id;
  const plannedWeapon = computePlannedWeaponState(selectedUnit, plannedActions);
  const plannedObjectItem = computePlannedObjectItem(selectedUnit?.objectItem, plannedActions);
  const equippedObject = plannedObjectItem ? porId.get(plannedObjectItem) : null;
  const isValidMove = Array.isArray(validMoves)
    ? validMoves.some((pos) => pos.r === r && pos.c === c)
    : false;
  const canMoveNow =
    selectedUnit &&
    selectedUnit.ap >= 1 &&
    !selectedUnit.movementLock &&
    isValidMove &&
    !occupiedByOtherUnit;
  const canReloadInPlace =
    plannedWeapon.weapon &&
    plannedWeapon.ammo > 0 &&
    !plannedWeapon.loaded &&
    !plannedWeapon.weaponNoReload &&
    !plannedWeapon.weaponInstantShot &&
    selectedUnit.ap >= 1 &&
    isSameCell;
  const canShootHere =
    selectedUnit &&
    selectedUnit.ap >= 1 &&
    isSameCell &&
    plannedWeapon.weapon &&
    canShoot({ ...selectedUnit, ...plannedWeapon }, lastActionWasReload);
  const canUseObject =
    selectedUnit &&
    selectedUnit.ap >= 1 &&
    isSameCell &&
    plannedObjectItem;
  const coverAtGhost = ghost ? Boolean(board.cover?.[ghost.r]?.[ghost.c]) : false;
  const plannedIsCovered = computePlannedCoverState(selectedUnit?.isCovered, plannedActions);

  // Opción: Mover
  if (canMoveNow) {
    actions.push({
      label: `Mover`,
      action: () => onAction('MOVE', { to: { r, c } }),
    });
  }

  // Opción: Huir (solo en columnas de seguridad 0-1)
  if (
    selectedUnit &&
    isSameCell &&
    !selectedUnit.movementLock &&
    canRun({ ...selectedUnit, ...ghost }, board) &&
    selectedUnit.ap >= 1
  ) {
    actions.push({
      label: `Huir`,
      action: () => onAction('RUN'),
    });
  }

  // Opción: Recargar
  if (canReloadInPlace) {
    actions.push({
      label: `Recargar`,
      action: () => onAction('RELOAD'),
    });
  }

  // Opción: Disparar (desde posición actual)
  if (canShootHere) {
    const shotRow = ghost ? ghost.r : selectedUnit.r;
    actions.push({
      label: 'Disparar',
      action: () => onAction('SHOOT', { row: shotRow }),
    });
  }

  // Opción: Cobrirse (si hay cobertura en la celda actual)
  if (
    selectedUnit &&
    coverAtGhost &&
    selectedUnit.ap >= 1 &&
    isSameCell &&
    !plannedIsCovered
  ) {
    actions.push({
      label: `Cobrirse`,
      action: () => onAction('COVER'),
    });
  }

  // Opción: Usar objeto
  if (canUseObject) {
    const objectRow = ghost ? ghost.r : selectedUnit.r;
    actions.push({
      label: `Usar objeto${equippedObject ? ` (${equippedObject.name})` : ''}`,
      action: () => onAction('USE_OBJECT', { row: objectRow }),
    });
  }

  const styles = {
    container: {
      position: 'fixed',
      top: position.y,
      left: position.x,
      backgroundColor: theme.colors.panel,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 1000,
      minWidth: '180px',
    },
    item: {
      padding: '8px 12px',
      color: theme.colors.text,
      fontSize: '11px',
      borderBottom: `1px solid ${theme.colors.border}`,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      userSelect: 'none',
    },
    itemHover: {
      backgroundColor: theme.colors.allyTeam,
    },
  };

  return (
    <>
      {/* Overlay invisible para cerrar al clickear fuera */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Menú */}
      <div style={styles.container}>
        {actions.length === 0 ? (
          <div style={{ ...styles.item, cursor: 'default', color: '#666' }}>
            Sin acciones disponibles
          </div>
        ) : (
          actions.map((actionObj, idx) => (
            <div
              key={idx}
              style={styles.item}
              onClick={() => {
                actionObj.action();
                onClose();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.allyTeam;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {actionObj.label}
            </div>
          ))
        )}
      </div>
    </>
  );
}
