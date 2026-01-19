import { theme } from '../../../game/state/theme';

export default function Botonera({
  onNextAction,
  onPreviousAction,
  onPassTurn,
  disableNext,
  disablePrevious,
  disablePass,
}) {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    button: (disabled = false) => ({
      padding: '12px 20px',
      backgroundColor: disabled ? '#1a1a1a' : '#1a3a1a',
      border: `1px solid ${theme.colors.border}`,
      color: disabled ? '#666' : '#0f0',
      borderRadius: '4px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      fontWeight: 'bold',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
      width: '100%',
    }),
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.button(disableNext)}
        onClick={onNextAction}
        disabled={disableNext}
      >
        Siguiente acción
      </button>
      <button
        style={styles.button(disablePrevious)}
        onClick={onPreviousAction}
        disabled={disablePrevious}
      >
        Acción anterior
      </button>
      <button
        style={styles.button(disablePass)}
        onClick={onPassTurn}
        disabled={disablePass}
      >
        Pasar turno
      </button>
    </div>
  );
}
