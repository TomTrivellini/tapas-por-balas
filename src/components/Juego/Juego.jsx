import { useEffect, useState } from 'react';
import { useBattle } from '../../game/state/BattleContext';
import { BATTLE_ACTIONS } from '../../game/state/battleReducer';
import { useTeam } from '../../context/TeamContext';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';
import { theme } from '../../game/state/theme';
import LogPanel from './UI/LogPanel';
import Escenario from './Escenario/Escenario';
import Botonera from './UI/Botonera';
import TeamCard from './UI/TeamCard';
import EnemyCard from './UI/EnemyCard';

const resolveInventoryIndex = (unit) => {
  if (typeof unit?.inventoryIndex === 'number') {
    return unit.inventoryIndex;
  }
  const fallback = parseInt(unit?.id?.substring(1) || '', 10) - 1;
  return Number.isNaN(fallback) ? null : fallback;
};

const addUniqueFallen = (list, unit) => {
  if (list.some((entry) => entry.id === unit.id)) return list;
  return [...list, { id: unit.id, name: unit.name }];
};

export default function Juego({ onBattleEnd }) {
  const { state, dispatch } = useBattle();
  const { gameOver, planningOrder, currentPlanningIndex } = state;
  const { marcarMuerto, removerDelEquipo } = useTeam();
  const {
    reclutasInventario,
    renombrarRecluta,
    actualizarEquipoRecluta,
    agregarAlInventario,
    marcarReclutaComoFallecido,
    sincronizarRecluta,
    porId,
  } = useInventory();
  const { agregarTapas } = useCart();
  const [battleStats, setBattleStats] = useState({
    tapas: 0,
    fallenAllies: [],
    fallenEnemies: [],
  });

  // --- Penalización por Abandono (Temporalmente Desactivada) ---
  // const unmountPenaltyRef = useRef();
  // unmountPenaltyRef.current = {
  //   state,
  //   reclutasInventario,
  //   marcarMuerto,
  //   removerDelEquipo,
  //   marcarReclutaComoFallecido,
  // };

  // useEffect(() => {
  //   return () => {
  //     // Esta función se ejecuta solo cuando el componente se desmonta
  //     const {
  //       state: lastState,
  //       reclutasInventario: lastReclutas,
  //       marcarMuerto: lastMarcarMuerto,
  //       removerDelEquipo: lastRemover,
  //       marcarReclutaComoFallecido: lastMarcarFallecido,
  //     } = unmountPenaltyRef.current;

  //     if (!lastState.gameOver.active) {
  //       // La partida no ha terminado, el usuario abandonó.
  //       const livingTeamMembers = lastState.units.filter(u => u.team === 'A' && u.alive);
  //
  //       livingTeamMembers.forEach(deadUnit => {
  //         const inventoryIndex = resolveInventoryIndex(deadUnit);
  //         if (inventoryIndex === null) return;
  //         const recruitData = lastReclutas[inventoryIndex];
  //         if (recruitData) {
  //           lastMarcarMuerto(recruitData);
  //           lastMarcarFallecido(inventoryIndex);
  //           lastRemover(inventoryIndex);
  //         }
  //       });
  //     }
  //   };
  // }, []);
  // ---------------------------------

  const activeUnitId =
    planningOrder && planningOrder.length > 0
      ? planningOrder[currentPlanningIndex] || null
      : null;
  const isLastUnit =
    !!activeUnitId && currentPlanningIndex === planningOrder.length - 1;
  const selectedUnitActions =
    (state.actions && state.actions[activeUnitId]) || [];
  const awaitingNextAction = state.awaitingNextAction;
  const activeUnit = state.units.find((u) => u.id === activeUnitId);
  const canAdvanceAction = awaitingNextAction && activeUnit && activeUnit.ap > 0;
  const canRevertAction = selectedUnitActions.length > 0;
  const alliedUnits = state.units.filter((unit) => unit.team === 'A' && unit.alive);
  const enemyUnits = state.units.filter((unit) => unit.team === 'B' && unit.alive);
  const totalFallen = battleStats.fallenAllies.length + battleStats.fallenEnemies.length;
  const totalFallenText = totalFallen === 1 ? 'persona' : 'personas';

  const handleNextAction = () => {
    if (!canAdvanceAction) return;
    dispatch({ type: BATTLE_ACTIONS.NEXT_AP_ACTION });
  };

  const handlePreviousAction = () => {
    if (!canRevertAction) return;
    dispatch({ type: BATTLE_ACTIONS.PREVIOUS_AP_ACTION });
  };

  const handlePassTurn = () => {
    if (!activeUnitId || gameOver.active || state.isAnimating) return;
    dispatch({ type: BATTLE_ACTIONS.CONFIRM_UNIT_PLANNING });
    if (isLastUnit) {
      dispatch({ type: BATTLE_ACTIONS.NEXT_ROUND, payload: { itemsById: porId } });
    }
  };

  // Detectar cuando se matan aliados y reportar a TeamContext
  useEffect(() => {
    const killed = state.unitsKilled;
    if (!killed || killed.length === 0) return;

    setBattleStats((prev) => {
      let nextTapas = prev.tapas;
      let nextAllies = prev.fallenAllies;
      let nextEnemies = prev.fallenEnemies;

      killed.forEach((deadUnit) => {
        if (deadUnit.team === 'A') {
          nextAllies = addUniqueFallen(nextAllies, deadUnit);
        } else if (deadUnit.team === 'B') {
          nextEnemies = addUniqueFallen(nextEnemies, deadUnit);
          const tapasReward = deadUnit.tapasDrop || 0;
          if (tapasReward > 0) {
            nextTapas += tapasReward;
          }
        }
      });

      if (
        nextTapas === prev.tapas &&
        nextAllies === prev.fallenAllies &&
        nextEnemies === prev.fallenEnemies
      ) {
        return prev;
      }

      return {
        tapas: nextTapas,
        fallenAllies: nextAllies,
        fallenEnemies: nextEnemies,
      };
    });

    killed.forEach((deadUnit) => {
      if (deadUnit.team === 'A') {
        const inventoryIndex = resolveInventoryIndex(deadUnit);
        if (inventoryIndex === null) return;
        const recruitData = reclutasInventario[inventoryIndex];
        if (recruitData) {
          marcarMuerto(recruitData);
          marcarReclutaComoFallecido(inventoryIndex);
          removerDelEquipo(inventoryIndex);
        }
      } else if (deadUnit.team === 'B') {
        const tapasReward = deadUnit.tapasDrop || 0;
        if (tapasReward > 0) {
          agregarTapas(tapasReward);
        }

        const lootItems = [];
        if (deadUnit.weapon) {
          lootItems.push({ id: deadUnit.weapon, qty: 1 });
        }
        if (deadUnit.ammo > 0 && deadUnit.weapon) {
          lootItems.push({ id: `amm-${deadUnit.weapon}`, qty: deadUnit.ammo });
        }
        if (deadUnit.helmet) {
          lootItems.push({ id: deadUnit.helmet, qty: 1 });
        }
        if (deadUnit.vest) {
          lootItems.push({ id: deadUnit.vest, qty: 1 });
        }
        if (deadUnit.objectItem) {
          lootItems.push({ id: deadUnit.objectItem, qty: 1 });
        }

        if (lootItems.length > 0) {
          agregarAlInventario(lootItems, []);
        }

        if (tapasReward > 0 || lootItems.length > 0) {
          const lootSummary = [
            tapasReward > 0 ? `${tapasReward} tapas` : null,
            lootItems.length > 0 ? 'botín' : null,
          ]
            .filter(Boolean)
            .join(' y ');
          dispatch({
            type: BATTLE_ACTIONS.ADD_LOG,
            payload: `Recolectaste ${lootSummary} de ${deadUnit.name}.`,
          });
        }
      }
    });

    dispatch({ type: BATTLE_ACTIONS.CLEAR_UNITS_KILLED });
  }, [
    state.unitsKilled,
    marcarMuerto,
    reclutasInventario,
    agregarTapas,
    agregarAlInventario,
    dispatch,
    marcarReclutaComoFallecido,
    removerDelEquipo,
  ]);

  // Sincronizar nombres editados en batalla con inventario
  useEffect(() => {
    state.units.forEach((unit) => {
      if (unit.team !== 'A') return;
      const inventoryIndex = resolveInventoryIndex(unit);
      if (inventoryIndex === null) return;
      const recruitData = reclutasInventario[inventoryIndex];
      if (!recruitData) return;

      if (recruitData.muerto) return;

      if (recruitData.name !== unit.name) {
        renombrarRecluta(inventoryIndex, unit.name);
      }

      const normalizedHelmet = unit.helmet || null;
      const normalizedVest = unit.vest || null;
      const normalizedHelmetHp = unit.helmetHp || 0;
      const normalizedVestHp = unit.vestHp || 0;

      if (
        recruitData.helmet !== normalizedHelmet ||
        (recruitData.helmetHp || 0) !== normalizedHelmetHp ||
        recruitData.vest !== normalizedVest ||
        (recruitData.vestHp || 0) !== normalizedVestHp
      ) {
        actualizarEquipoRecluta(inventoryIndex, {
          helmet: normalizedHelmet,
          helmetHp: normalizedHelmetHp,
          vest: normalizedVest,
          vestHp: normalizedVestHp,
        });
      }

      if (
        (recruitData.ammo ?? 0) !== unit.ammo ||
        Boolean(recruitData.loaded) !== Boolean(unit.loaded)
      ) {
        sincronizarRecluta(inventoryIndex, {
          ammo: unit.ammo,
          loaded: unit.loaded,
        });
      }
    });
  }, [
    state.units,
    reclutasInventario,
    renombrarRecluta,
    actualizarEquipoRecluta,
    sincronizarRecluta,
  ]);

  useEffect(() => {
    if (!state.isAnimating) return;
    if (!state.animationQueue || state.animationQueue.length === 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: BATTLE_ACTIONS.ADVANCE_FRAME });
    }, 1000);
    return () => clearTimeout(timer);
  }, [state.isAnimating, state.animationQueue ? state.animationQueue.length : 0, dispatch]);

  const styles = {
    container: {
      backgroundColor: theme.colors.bg,
      padding: '20px',
      borderRadius: '8px',
      color: theme.colors.text,
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr 260px',
      gap: '20px',
      marginBottom: '20px',
    },
    centerColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    sideColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    sideTitle: {
      color: theme.colors.text,
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: '4px',
    },
    cardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    emptyText: {
      color: '#888',
      fontSize: '12px',
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
      color: '#fff',
    },
    gameOverText: {
      fontSize: '14px',
      marginBottom: '8px',
      color: '#ccc',
    },
    gameOverStat: {
      fontSize: '14px',
      marginBottom: '8px',
      color: '#ccc',
    },
    gameOverList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '20px',
    },
    gameOverListRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      justifyContent: 'center',
    },
    gameOverListLabel: {
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      color: '#777',
    },
    fallenAlly: {
      color: '#ffffff',
    },
    fallenEnemy: {
      color: '#ff0000',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainLayout}>
        <div style={styles.sideColumn}>
          <div style={styles.sideTitle}>Equipo</div>
          <div style={styles.cardList}>
            {alliedUnits.length === 0 ? (
              <div style={styles.emptyText}>Sin aliados</div>
            ) : (
              alliedUnits.map((unit) => (
                <TeamCard key={unit.id} unit={unit} />
              ))
            )}
          </div>
        </div>

        <div style={styles.centerColumn}>
          <Escenario />

          <Botonera
            onNextAction={handleNextAction}
            onPreviousAction={handlePreviousAction}
            onPassTurn={handlePassTurn}
            disableNext={!canAdvanceAction || gameOver.active || state.isAnimating}
            disablePrevious={!canRevertAction || gameOver.active || state.isAnimating}
            disablePass={!activeUnitId || gameOver.active || state.isAnimating}
          />
          <LogPanel />
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.sideTitle}>Enemigos</div>
          <div style={styles.cardList}>
            {enemyUnits.length === 0 ? (
              <div style={styles.emptyText}>Sin enemigos</div>
            ) : (
              enemyUnits.map((unit) => (
                <EnemyCard key={unit.id} unit={unit} />
              ))
            )}
          </div>
        </div>
      </div>

      {gameOver.active && (
        <>
          <div style={styles.gameOverOverlay}></div>
          <div style={styles.gameOverModal}>
            <div style={styles.gameOverTitle}>
              Termino la batalla
            </div>
            <div style={styles.gameOverText}>
              Recolectaste {battleStats.tapas} tapas.
            </div>
            <div style={styles.gameOverStat}>
              Murieron {totalFallen} {totalFallenText}.
            </div>
            <div style={styles.gameOverList}>
              {totalFallen === 0 ? (
                <div style={styles.gameOverText}>Sin fallecidos.</div>
              ) : (
                <>
                  <div style={styles.gameOverListLabel}>Aliados</div>
                  <div style={styles.gameOverListRow}>
                    {battleStats.fallenAllies.length === 0 ? (
                      <span style={styles.gameOverText}>Ninguno</span>
                    ) : (
                      battleStats.fallenAllies.map((unit) => (
                        <span key={unit.id} style={styles.fallenAlly}>
                          {unit.name}
                        </span>
                      ))
                    )}
                  </div>
                  <div style={styles.gameOverListLabel}>Enemigos</div>
                  <div style={styles.gameOverListRow}>
                    {battleStats.fallenEnemies.length === 0 ? (
                      <span style={styles.gameOverText}>Ninguno</span>
                    ) : (
                      battleStats.fallenEnemies.map((unit) => (
                        <span key={unit.id} style={styles.fallenEnemy}>
                          {unit.name}
                        </span>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              style={styles.button()}
              onClick={onBattleEnd}
            >
              Finalizar Batalla
            </button>
          </div>
        </>
      )}
    </div>
  );
}
