/**
 * HUD.jsx - Información de encabezado (ronda, AP, munición)
 */

import { useBattle } from '../../state/BattleContext';
import { getTotalAmmo } from '../../state/battleRules';
import { theme } from '../../state/theme';

export default function HUD() {
  const { state } = useBattle();
  const { round, currentAP, units } = state;

  const totalAmmoA = getTotalAmmo('A', units);
  const aliveA = units.filter((u) => u.team === 'A' && u.alive).length;
  const aliveB = units.filter((u) => u.team === 'B' && u.alive).length;

  const styles = {
    container: {
      display: 'flex',
      gap: '20px',
      backgroundColor: theme.colors.panel,
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '15px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '13px',
      color: theme.colors.text,
    },
    item: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: '10px',
      color: '#888',
      fontWeight: 'bold',
    },
    value: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <span style={styles.label}>RONDA</span>
        <span style={styles.value}>{round}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.label}>AP ACTUAL</span>
        <span style={styles.value}>{currentAP}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.label}>MUNICIÓN (A)</span>
        <span style={styles.value}>{totalAmmoA}</span>
      </div>
      <div style={styles.item}>
        <span style={styles.label}>VIVOS (A/B)</span>
        <span style={styles.value}>
          {aliveA}/{aliveB}
        </span>
      </div>
    </div>
  );
}
