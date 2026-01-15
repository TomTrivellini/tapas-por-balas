/**
 * ReclutasPanel.jsx - Panel de control de aliados
 */

import { useBattle } from '../../state/BattleContext';
import { BATTLE_ACTIONS } from '../../state/battleReducer';
import { canShoot, isOnCover } from '../../state/battleRules';
import { theme } from '../../state/theme';

export default function ReclutasPanel() {
  const { state, dispatch } = useBattle();
  const { units, selectedUnitId, board } = state;

  const selectedUnit = units.find((u) => u.id === selectedUnitId && u.team === 'A');
  const alliesUnits = units.filter((u) => u.team === 'A' && u.alive);

  const handleAction = (actionType) => {
    if (!selectedUnit) return;

    switch (actionType) {
      case 'RELOAD':
        dispatch({
          type: BATTLE_ACTIONS.PLAN_RELOAD,
          payload: { unitId: selectedUnit.id },
        });
        break;
      case 'COVER':
        dispatch({
          type: BATTLE_ACTIONS.PLAN_COVER,
          payload: { unitId: selectedUnit.id },
        });
        break;
      case 'RUN':
        dispatch({
          type: BATTLE_ACTIONS.PLAN_RUN,
        });
        break;
      default:
        break;
    }
  };

  const handleShoot = (row) => {
    dispatch({
      type: BATTLE_ACTIONS.PLAN_SHOOT,
      payload: { unitId: selectedUnit.id, row },
    });
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.panel,
      padding: '15px',
      borderRadius: '4px',
      border: `1px solid ${theme.colors.border}`,
      marginBottom: '15px',
    },
    title: {
      color: theme.colors.text,
      marginBottom: '10px',
      fontSize: '13px',
      fontWeight: 'bold',
    },
    unitsList: {
      display: 'flex',
      gap: '8px',
      marginBottom: '15px',
      flexWrap: 'wrap',
    },
    unitBtn: (isSelected) => ({
      padding: '6px 10px',
      backgroundColor: isSelected ? theme.colors.allyTeam : '#333',
      border: isSelected ? `2px solid ${theme.colors.selected}` : `1px solid ${theme.colors.border}`,
      color: '#fff',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 'bold',
    }),
    selectedInfo: {
      backgroundColor: '#1a1a1a',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '10px',
      fontSize: '11px',
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '5px',
      marginBottom: '10px',
      fontSize: '10px',
    },
    stat: {
      padding: '5px',
      backgroundColor: '#0a0a0a',
      borderRadius: '2px',
      textAlign: 'center',
    },
    actions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      marginBottom: '10px',
    },
    btn: {
      padding: '8px',
      backgroundColor: '#1a3a1a',
      border: `1px solid ${theme.colors.border}`,
      color: '#0f0',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 'bold',
    },
    shootButtons: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
    },
    shootBtn: {
      padding: '5px 8px',
      backgroundColor: '#3a1a1a',
      border: `1px solid ${theme.colors.border}`,
      color: '#f88',
      borderRadius: '2px',
      cursor: 'pointer',
      fontSize: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>🎯 RECLUTAS (ALIADOS)</div>

      <div style={styles.unitsList}>
        {alliesUnits.map((unit) => (
          <button
            key={unit.id}
            style={styles.unitBtn(unit.id === selectedUnitId)}
            onClick={() =>
              dispatch({
                type: BATTLE_ACTIONS.SELECT_UNIT,
                payload: unit.id,
              })
            }
          >
            {unit.id} ({unit.hp})
          </button>
        ))}
      </div>

      {selectedUnit && (
        <div style={styles.selectedInfo}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            {selectedUnit.name} (ID: {selectedUnit.id})
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={{ fontSize: '9px', color: '#888' }}>HP</div>
              <div>{selectedUnit.hp}/{selectedUnit.maxHp}</div>
            </div>
            <div style={styles.stat}>
              <div style={{ fontSize: '9px', color: '#888' }}>MUNICIÓN</div>
              <div>{selectedUnit.ammo}</div>
            </div>
            <div style={styles.stat}>
              <div style={{ fontSize: '9px', color: '#888' }}>POS</div>
              <div>({selectedUnit.r},{selectedUnit.c})</div>
            </div>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.btn}
              onClick={() => handleAction('RELOAD')}
            >
              Recargar (+2)
            </button>
            <button
              style={styles.btn}
              onClick={() => handleAction('COVER')}
              disabled={!isOnCover(selectedUnit, board)}
            >
              Cobertura
            </button>
            <button
              style={{ ...styles.btn, backgroundColor: '#3a1a1a' }}
              onClick={() => handleAction('RUN')}
            >
              Huir
            </button>
          </div>

          <div style={{ fontSize: '10px', marginBottom: '5px', color: '#888' }}>
            Disparar a fila:
          </div>
          <div style={styles.shootButtons}>
            {[0, 1, 2].map((row) => (
              <button
                key={row}
                style={styles.shootBtn}
                onClick={() => handleShoot(row)}
                disabled={!canShoot(selectedUnit)}
              >
                Fila {row}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
