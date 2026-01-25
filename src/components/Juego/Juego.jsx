import { useEffect, useState } from 'react';
import { useBattle } from '../../game2/BattleContext';
import { BATTLE_ACTIONS } from '../../game2/battleActions';
import { DEFAULT_FRAME_DURATION } from '../../game/reclutas/combatAnimations';
import { useTeam } from '../../context/TeamContext';
import { useInventory } from '../../context/InventoryContext';
import { useCart } from '../../context/CartContext';
import { findAmmoIdForWeapon } from '../../data/catalogUtils';
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
          const ammoId = findAmmoIdForWeapon(deadUnit.weapon, porId);
          if (ammoId) {
            lootItems.push({ id: ammoId, qty: deadUnit.ammo });
          }
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
    }, DEFAULT_FRAME_DURATION);
    return () => clearTimeout(timer);
  }, [state.isAnimating, state.animationQueue ? state.animationQueue.length : 0, dispatch]);

  return (
    <div className="game">
      <div className="game__layout">
        <div className="game__side">
          <div className="game__side-title">Equipo</div>
          <div className="game__card-list">
            {alliedUnits.length === 0 ? (
              <div className="game__empty">Sin aliados</div>
            ) : (
              alliedUnits.map((unit) => (
                <TeamCard key={unit.id} unit={unit} />
              ))
            )}
          </div>
        </div>

        <div className="game__center">
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

        <div className="game__side">
          <div className="game__side-title">Enemigos</div>
          <div className="game__card-list">
            {enemyUnits.length === 0 ? (
              <div className="game__empty">Sin enemigos</div>
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
          <div className="game__overlay"></div>
          <div className="game__modal">
            <div className="game__modal-title">
              Termino la batalla
            </div>
            <div className="game__modal-text">
              Recolectaste {battleStats.tapas} tapas.
            </div>
            <div className="game__modal-stat">
              Murieron {totalFallen} {totalFallenText}.
            </div>
            <div className="game__modal-list">
              {totalFallen === 0 ? (
                <div className="game__modal-text">Sin fallecidos.</div>
              ) : (
                <>
                  <div className="game__modal-label">Aliados</div>
                  <div className="game__modal-row">
                    {battleStats.fallenAllies.length === 0 ? (
                      <span className="game__modal-text">Ninguno</span>
                    ) : (
                      battleStats.fallenAllies.map((unit) => (
                        <span key={unit.id} className="game__fallen-ally">
                          {unit.name}
                        </span>
                      ))
                    )}
                  </div>
                  <div className="game__modal-label">Enemigos</div>
                  <div className="game__modal-row">
                    {battleStats.fallenEnemies.length === 0 ? (
                      <span className="game__modal-text">Ninguno</span>
                    ) : (
                      battleStats.fallenEnemies.map((unit) => (
                        <span key={unit.id} className="game__fallen-enemy">
                          {unit.name}
                        </span>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
            <button
              className="game__button"
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
