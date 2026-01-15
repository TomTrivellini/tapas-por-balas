/**
 * EnemigosPanel.jsx - Panel de información de enemigos (solo lectura)
 */

import { useBattle } from '../../state/BattleContext';
import { theme } from '../../state/theme';

export default function EnemigosPanel() {
  const { state } = useBattle();
  const { units } = state;

  const enemiesUnits = units.filter((u) => u.team === 'B' && u.alive);

  const styles = {
    container: {
      backgroundColor: theme.colors.panel,
      padding: '15px',
      borderRadius: '4px',
      border: `1px solid ${theme.colors.border}`,
    },
    title: {
      color: theme.colors.text,
      marginBottom: '10px',
      fontSize: '13px',
      fontWeight: 'bold',
    },
    unitList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    unit: {
      backgroundColor: '#1a0a0a',
      padding: '8px',
      borderRadius: '3px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '11px',
      color: '#ccc',
    },
    stats: {
      display: 'flex',
      gap: '10px',
      marginTop: '4px',
      fontSize: '10px',
      color: '#888',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>👾 ENEMIGOS</div>

      {enemiesUnits.length === 0 ? (
        <div style={{ color: '#888', fontSize: '12px' }}>Todos los enemigos eliminados</div>
      ) : (
        <div style={styles.unitList}>
          {enemiesUnits.map((unit) => (
            <div key={unit.id} style={styles.unit}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {unit.id} - {unit.name}
              </div>
              <div style={styles.stats}>
                <span>HP: {unit.hp}/{unit.maxHp}</span>
                <span>Munición: {unit.ammo}</span>
                <span>Pos: ({unit.r},{unit.c})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
