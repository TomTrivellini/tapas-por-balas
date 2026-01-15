/**
 * Escenario.jsx - Tablero del juego
 */

import { useBattle } from '../../state/BattleContext';
import { BATTLE_ACTIONS } from '../../state/battleReducer';
import { theme } from '../../state/theme';
import Cell from './Cell';

export default function Escenario() {
  const { state, dispatch } = useBattle();
  const { board, units, validMoves, selectedUnitId } = state;

  const handleCellClick = (r, c) => {
    const isValidMove = validMoves.some((pos) => pos.r === r && pos.c === c);
    const unit = units.find((u) => u.r === r && u.c === c && u.alive);

    // Si es un movimiento válido y tenemos unidad seleccionada
    if (isValidMove && selectedUnitId) {
      dispatch({
        type: BATTLE_ACTIONS.PLAN_MOVE,
        payload: { unitId: selectedUnitId, to: { r, c } },
      });
      return;
    }

    // Si hay unidad y es aliada, seleccionarla
    if (unit && unit.team === 'A') {
      dispatch({
        type: BATTLE_ACTIONS.SELECT_UNIT,
        payload: unit.id,
      });
    }
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.bg,
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    title: {
      color: theme.colors.text,
      marginBottom: '10px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: `repeat(6, 50px)`,
      gap: '0',
      border: `2px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.panel,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        TABLERO (Ronda {state.round} - Fase: {state.phase})
      </div>
      <div style={styles.board}>
        {Array.from({ length: board.rows }).map((_, r) =>
          Array.from({ length: board.colsPerSide * 2 }).map((_, c) => {
            const unit = units.find((u) => u.r === r && u.c === c);
            const cover = board.cover[r][c];
            const isValidMove = validMoves.some((pos) => pos.r === r && pos.c === c);
            const isSelected = selectedUnitId && unit && unit.id === selectedUnitId;

            return (
              <Cell
                key={`${r}-${c}`}
                r={r}
                c={c}
                unit={unit}
                cover={cover}
                isValidMove={isValidMove}
                isSelected={isSelected}
                onClick={() => handleCellClick(r, c)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
