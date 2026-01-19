/**
 * Escenario.jsx - Tablero del juego
 * Click izquierdo: seleccionar/mover
 * Click derecho: abrir menú de acciones
 */

import { useState } from 'react';
import { useBattle } from '../../../game/state/BattleContext';
import { BATTLE_ACTIONS } from '../../../game/state/battleReducer';
import { theme } from '../../../game/state/theme';
import Cell from './Cell';
import ContextMenu from './ContextMenu';
import AnimationLayer from './AnimationLayer';
import ContadorAp from '../UI/ContadorAp';

export default function Escenario() {
  const { state, dispatch } = useBattle();
  const {
    board,
    units,
    validMoves,
    selectedUnitId,
    unitGhosts,
    actions,
    isAnimating,
    awaitingNextAction,
  } = state;
  const [contextMenu, setContextMenu] = useState(null);

  const handleCellClick = (e, r, c) => {
    if (isAnimating) {
      return;
    }
    if (awaitingNextAction) {
      return;
    }
    if (board.middleColumn !== undefined && c === board.middleColumn) {
      setContextMenu(null);
      return;
    }
    if (!selectedUnitId) {
      const unit = units.find((u) => u.r === r && u.c === c && u.alive);
      if (unit && unit.team === 'A') dispatch({ type: BATTLE_ACTIONS.SELECT_UNIT, payload: unit.id });
      return;
    }

    const unit = units.find((u) => u.r === r && u.c === c && u.alive);
    setContextMenu({ r, c, x: e.clientX, y: e.clientY, unit });
  };

  const handleCellRightClick = (e, r, c) => {
    e.preventDefault();
    if (isAnimating) return;
    if (awaitingNextAction) return;
    if (board.middleColumn !== undefined && c === board.middleColumn) return;
    if (!selectedUnitId) return;
    const unit = units.find((u) => u.r === r && u.c === c && u.alive);
    setContextMenu({ r, c, x: e.clientX, y: e.clientY, unit });
  };

  const handleAction = (actionType, payload = {}) => {
    if (!selectedUnitId) return;
    if (awaitingNextAction) return;
    dispatch({ type: BATTLE_ACTIONS.PLAN_ACTION, payload: { unitId: selectedUnitId, actionType, payload } });
  };

  const selectedUnit = units.find((u) => u.id === selectedUnitId);
  const plannedActions = selectedUnit ? (actions[selectedUnit.id] || []) : [];
  const ghostPosition =
    selectedUnit && unitGhosts[selectedUnit.id]
      ? unitGhosts[selectedUnit.id]
      : selectedUnit
        ? { r: selectedUnit.r, c: selectedUnit.c }
        : null;
  const apMax = selectedUnit
    ? Math.max(0, selectedUnit.currentMaxAp ?? selectedUnit.maxAp ?? 2)
    : 0;
  const apRemaining =
    selectedUnit && apMax > 0
      ? Math.max(0, Math.min(selectedUnit.ap ?? 0, apMax))
      : 0;
  const showApIndicator = Boolean(selectedUnit && apMax > 0);

  const totalCols = board.totalCols || board.colsPerSide * 2;

  const styles = {
    container: {
      backgroundColor: theme.colors.bg,
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    boardWrapper: {
      position: 'relative',
      width: '100%',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
      gap: '0',
      border: `2px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.panel,
      width: '100%',
    },
  };

  const currentFrame =
    isAnimating && state.animationQueue && state.animationQueue.length > 0
      ? state.animationQueue[0]
      : null;

  return (
    <div style={styles.container}>
      <div style={styles.boardWrapper}>
        {showApIndicator && (
          <ContadorAp
            label={`AP · ${selectedUnit?.name}`}
            apMax={apMax}
            apRemaining={apRemaining}
          />
        )}
        <div style={styles.board}>
          {Array.from({ length: board.rows }).map((_, r) =>
            Array.from({ length: totalCols }).map((_, c) => {
              const unit = units.find((u) => u.r === r && u.c === c);
              const cover = board.cover[r][c];
              const isValidMove = validMoves.some((pos) => pos.r === r && pos.c === c);
              const isSelected = selectedUnitId && unit && unit.id === selectedUnitId;
              const isOccupiedByAlly = isValidMove && unit && unit.team === 'A' && unit.alive;
              let ghostUnit = null;
              Object.entries(unitGhosts).forEach(([unitId, ghostPos]) => { if (ghostPos.r === r && ghostPos.c === c) ghostUnit = units.find((u) => u.id === unitId); });
              const isFrontier = c === (board.middleColumn ?? board.colsPerSide);

              return (
                <Cell
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  unit={unit}
                  cover={cover}
                  ghost={ghostUnit ? ghostUnit.id : null}
                  isValidMove={isValidMove}
                  isOccupiedByAlly={isOccupiedByAlly}
                  isSelected={isSelected}
                  isFrontier={isFrontier}
                  onClick={(e) => handleCellClick(e, r, c)}
                  onContextMenu={(e) => handleCellRightClick(e, r, c)}
                />
              );
            })
          )}
        </div>
        <AnimationLayer
          board={board}
          frame={currentFrame}
          isAnimating={isAnimating}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          r={contextMenu.r}
          c={contextMenu.c}
          unit={contextMenu.unit}
          selectedUnit={selectedUnit}
          board={board}
          plannedActions={plannedActions}
          validMoves={validMoves}
          ghostPosition={ghostPosition}
          onAction={handleAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
