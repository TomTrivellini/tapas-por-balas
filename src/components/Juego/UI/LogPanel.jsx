/**
 * LogPanel.jsx - Panel de eventos del juego
 */

import { useBattle } from '../../../game/state/BattleContext';
import { theme } from '../../../game/state/theme';

export default function LogPanel() {
  const { state } = useBattle();
  const { log } = state;

  const styles = {
    container: {
      backgroundColor: theme.colors.panel,
      padding: '12px',
      borderRadius: '4px',
      border: `1px solid ${theme.colors.border}`,
      height: '150px',
      overflow: 'auto',
      fontSize: '12px',
      color: '#999',
      lineHeight: '1.5',
    },
    entry: {
      marginBottom: '4px',
      paddingBottom: '4px',
      borderBottom: `1px solid ${theme.colors.border}`,
    },
  };

  return (
    <div style={styles.container}>
      {log.map((entry, idx) => (
        <div key={idx} style={styles.entry}>
          {entry}
        </div>
      ))}
    </div>
  );
}
