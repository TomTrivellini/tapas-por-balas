/**
 * EditorEscenario.jsx - Editor para pintar/borrar coberturas
 */

import { useState } from 'react';
import { useBattle } from '../../state/BattleContext';
import { BATTLE_ACTIONS } from '../../state/battleReducer';
import { theme } from '../../state/theme';

export default function EditorEscenario() {
  const { state, dispatch } = useBattle();
  const { board } = state;
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCover = (r, c) => {
    dispatch({
      type: BATTLE_ACTIONS.UPDATE_COVER,
      payload: { r, c, value: !board.cover[r][c] },
    });
  };

  const handleExport = () => {
    const data = {
      rows: board.rows,
      colsPerSide: board.colsPerSide,
      cover: board.cover,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escenario.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result || '');
        // Validar estructura básica
        if (data.cover && Array.isArray(data.cover)) {
          dispatch({
            type: BATTLE_ACTIONS.RESET_BOARD,
            payload: {
              ...state,
              board: {
                rows: data.rows || board.rows,
                colsPerSide: data.colsPerSide || board.colsPerSide,
                cover: data.cover,
              },
            },
          });
        }
      } catch {
        alert('Error al importar escenario');
      }
    };
    reader.readAsText(file);
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.panel,
      padding: '15px',
      borderRadius: '4px',
      border: `1px solid ${theme.colors.border}`,
      marginTop: '15px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    title: {
      color: theme.colors.text,
      fontSize: '13px',
      fontWeight: 'bold',
    },
    toggle: {
      padding: '6px 12px',
      backgroundColor: '#333',
      border: `1px solid ${theme.colors.border}`,
      color: '#ccc',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '11px',
    },
    content: {
      display: isOpen ? 'block' : 'none',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: `repeat(6, 40px)`,
      gap: '0',
      marginBottom: '15px',
      backgroundColor: theme.colors.bg,
    },
    cell: (hasCover) => ({
      width: '40px',
      height: '40px',
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: hasCover ? '#8a8a8a' : theme.colors.panel,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
    }),
    buttons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    btn: {
      padding: '8px 12px',
      backgroundColor: '#1a3a1a',
      border: `1px solid ${theme.colors.border}`,
      color: '#0f0',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 'bold',
    },
    input: {
      display: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🎨 EDITOR DE ESCENARIO</div>
        <button style={styles.toggle} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Cerrar' : 'Abrir'}
        </button>
      </div>

      {isOpen && (
        <div style={styles.content}>
          <div style={{ marginBottom: '15px', fontSize: '11px', color: '#888' }}>
            Click en celdas para pintar/borrar cobertura 🧱
          </div>

          <div style={styles.board}>
            {Array.from({ length: board.rows }).map((_, r) =>
              Array.from({ length: board.colsPerSide * 2 }).map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  style={styles.cell(board.cover[r][c])}
                  onClick={() => handleToggleCover(r, c)}
                >
                  {board.cover[r][c] ? '🧱' : ''}
                </div>
              ))
            )}
          </div>

          <div style={styles.buttons}>
            <button style={styles.btn} onClick={handleExport}>
              📥 Exportar JSON
            </button>
            <label style={{ ...styles.btn, margin: 0, padding: 0 }}>
              📤 Importar JSON
              <input
                style={styles.input}
                type="file"
                accept=".json"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
