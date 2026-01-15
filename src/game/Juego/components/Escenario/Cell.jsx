/**
 * Cell.jsx - Celda individual del tablero
 */

import { theme } from '../../state/theme';

export default function Cell({ r, c, unit, cover, isValidMove, isSelected, onClick }) {
  const styles = {
    cell: {
      width: '50px',
      height: '50px',
      border: `1px solid ${theme.colors.border}`,
      borderRight: c === 2 ? `2px solid ${theme.colors.text}` : `1px solid ${theme.colors.border}`,
      backgroundColor: isValidMove ? theme.colors.validMove : theme.colors.panel,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: '12px',
      color: theme.colors.text,
    },
    unit: {
      width: '40px',
      height: '40px',
      borderRadius: '4px',
      backgroundColor: unit.team === 'A' ? theme.colors.allyTeam : theme.colors.enemyTeam,
      border: isSelected ? `2px solid ${theme.colors.selected}` : `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '10px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    cover: {
      position: 'absolute',
      fontSize: '16px',
      top: '2px',
      left: '2px',
    },
    hp: {
      position: 'absolute',
      fontSize: '8px',
      bottom: '2px',
      right: '2px',
      color: unit.hp > 5 ? '#0f0' : '#f00',
    },
  };

  return (
    <div style={styles.cell} onClick={onClick} title={`(${r}, ${c})`}>
      {cover && <span style={styles.cover}>🧱</span>}
      {unit && unit.alive && (
        <div style={styles.unit}>
          <div>
            <div>{unit.id}</div>
            <div style={styles.hp}>{unit.hp}/{unit.maxHp}</div>
          </div>
        </div>
      )}
    </div>
  );
}
