import { theme } from '../../../game/state/theme';

export default function ContadorAp({ label, apMax, apRemaining }) {
  if (!apMax || apMax <= 0) return null;
  const remaining = Math.max(0, Math.min(apRemaining ?? 0, apMax));

  const styles = {
    apRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px',
    },
    apLabel: {
      color: theme.colors.text,
      fontSize: '12px',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
    },
    apDots: {
      display: 'flex',
      gap: '6px',
    },
    apDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#2d2d2d',
      border: `1px solid ${theme.colors.border}`,
      transition: 'background-color 0.2s',
    },
  };

  return (
    <div style={styles.apRow}>
      <span style={styles.apLabel}>{label}</span>
      <div style={styles.apDots}>
        {Array.from({ length: apMax }).map((_, index) => {
          const isActive = index < remaining;
          return (
            <span
              key={`ap-${index}`}
              style={{
                ...styles.apDot,
                backgroundColor: isActive ? '#ff5a5a' : '#2d2d2d',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
