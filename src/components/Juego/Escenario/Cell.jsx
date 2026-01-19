/**
 * Cell.jsx - Celda individual del tablero
 * Muestra unidades, coberturas y fantasmas (posiciones predichas)
 */

import { theme } from '../../../game/state/theme';

export default function Cell({
  r,
  c,
  unit,
  cover,
  ghost,
  isValidMove,
  isOccupiedByAlly,
  isSelected,
  isFrontier,
  onClick,
  onContextMenu,
}) {
  const unitColor = unit
    ? unit.team === 'A'
      ? (unit.isCovered ? theme.colors.allyCovered : theme.colors.allyTeam)
      : (unit.isCovered ? theme.colors.enemyCovered : theme.colors.enemyTeam)
    : 'transparent';

  const unitStyles = unit ? {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    backgroundColor: unitColor,
    border: isSelected ? `2px solid ${theme.colors.selected}` : `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flexDirection: 'column',
    zIndex: 5, // Debajo del ghost
  } : {};

  const ghostStyles = ghost ? {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0f0',
    opacity: 0.7,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10, // Mostrar sobre la unidad
  } : {};

  const styles = {
    cell: {
      width: '100%',
      aspectRatio: '1 / 1',
      border: `1px solid ${theme.colors.border}`,
      borderLeft: isFrontier ? `4px solid ${theme.colors.frontier}` : undefined,
      borderRight: isFrontier ? `4px solid ${theme.colors.frontier}` : undefined,
      backgroundColor: isFrontier
        ? '#330000'
        : isValidMove 
          ? (isOccupiedByAlly ? '#b8a600' : theme.colors.validMove)
          : theme.colors.panel,
      cursor: isFrontier ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontSize: '12px',
      color: theme.colors.text,
    },
    unit: unitStyles,
    cover: {
      position: 'absolute',
      fontSize: '16px',
      top: '2px',
      left: '2px',
    },
    ap: unit ? {
      position: 'absolute',
      fontSize: '8px',
      top: '2px',
      right: '2px',
      backgroundColor: theme.colors.selected,
      padding: '1px 3px',
      borderRadius: '2px',
    } : {},
    ghost: ghostStyles,
  };

  return (
    <div style={styles.cell} onClick={onClick} onContextMenu={onContextMenu} title={`(${r}, ${c})`}>
      {cover && <span style={styles.cover}>🧱</span>}
      {unit && unit.alive && (
        <div style={styles.unit}>
          <div>{unit.name.substring(0, 10)}</div>
          <div style={styles.ap}>{unit.ap}AP</div>
        </div>
      )}
      {ghost && <div style={styles.ghost}>👻</div>}
    </div>
  );
}
