/**
 * Juego.jsx - Contenedor principal del juego táctico
 * 
 * Flujo:
 * 1. Planning phase: jugador planifica acciones (AP1)
 * 2. Resolve AP1: se ejecutan todas las órdenes de AP1
 * 3. Planning phase: planifica acciones (AP2)
 * 4. Resolve AP2: se ejecutan todas las órdenes de AP2
 * 5. Next Round: vuelve a paso 1
 */

import { useBattle } from '../state/BattleContext';
import { BATTLE_ACTIONS } from '../state/battleReducer';
import { theme } from '../state/theme';
import HUD from './components/UI/HUD';
import LogPanel from './components/UI/LogPanel';
import Escenario from './components/Escenario/Escenario';
import ReclutasPanel from './components/Reclutas/ReclutasPanel';
import EnemigosPanel from './components/Enemigos/EnemigosPanel';
import EditorEscenario from '../editor/EditorEscenario';

export default function Juego() {
  const { state, dispatch } = useBattle();
  const { gameOver, phase } = state;

  const handleResolveTurn = () => {
    dispatch({ type: BATTLE_ACTIONS.RESOLVE_TURN });
  };

  const styles = {
    container: {
      backgroundColor: theme.colors.bg,
      padding: '20px',
      borderRadius: '8px',
      color: theme.colors.text,
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      color: '#0f0',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '20px',
      marginBottom: '20px',
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#1a3a1a',
      border: `1px solid ${theme.colors.border}`,
      color: '#0f0',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 'bold',
      transition: 'all 0.2s',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    gameOverModal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: theme.colors.panel,
      padding: '30px',
      borderRadius: '8px',
      border: `2px solid ${theme.colors.border}`,
      textAlign: 'center',
      zIndex: 1000,
      maxWidth: '400px',
    },
    gameOverOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 999,
    },
    gameOverTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: gameOver.winner === 'A' ? '#0f0' : '#f00',
    },
    gameOverText: {
      fontSize: '14px',
      marginBottom: '20px',
      color: '#ccc',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>⚔️ JUEGO TÁCTICO POR TURNOS</div>

      <HUD />

      <div style={styles.mainLayout}>
        <div style={styles.leftColumn}>
          <Escenario />

          <button
            style={{
              ...styles.button,
              ...(phase === 'resolving' ? styles.buttonDisabled : {}),
            }}
            onClick={handleResolveTurn}
            disabled={phase === 'resolving' || gameOver.active}
          >
            {phase === 'planning'
              ? `Resolver AP${state.currentAP}`
              : `AP${state.currentAP} en progreso...`}
          </button>

          <EditorEscenario />
        </div>

        <div style={styles.rightColumn}>
          <ReclutasPanel />
          <EnemigosPanel />
          <LogPanel />
        </div>
      </div>

      {gameOver.active && (
        <>
          <div style={styles.gameOverOverlay}></div>
          <div style={styles.gameOverModal}>
            <div style={styles.gameOverTitle}>
              {gameOver.winner === 'A' ? '¡VICTORIA!' : '¡DERROTA!'}
            </div>
            <div style={styles.gameOverText}>{gameOver.reason}</div>
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Reiniciar Juego
            </button>
          </div>
        </>
      )}
    </div>
  );
}
