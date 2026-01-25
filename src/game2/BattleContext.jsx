/**
 * BattleContext v2 (XState)
 * Provee el estado del juego y sus acciones a toda la app.
 */

import { createContext, useContext, useMemo } from "react";
import { useMachine } from "@xstate/react";
import { createBattleState } from "../game/state/battleInitialState";
import { battleMachine } from "./battleMachine";

const BattleContext = createContext(null);

export function BattleProvider({
  children,
  initialTeamA = [],
  initialTeamB = [],
  initialCover = null,
  onUnitKilled = null,
  catalogItems = [],
}) {
  const initialState = useMemo(
    () => createBattleState(initialTeamA, initialTeamB, initialCover, catalogItems),
    [initialTeamA, initialTeamB, initialCover, catalogItems]
  );
  const [machineState, send] = useMachine(battleMachine, { input: initialState });

  const value = { state: machineState.context, dispatch: send, onUnitKilled };

  return <BattleContext.Provider value={value}>{children}</BattleContext.Provider>;
}

export function useBattle() {
  const ctx = useContext(BattleContext);
  if (!ctx) {
    throw new Error("useBattle debe usarse dentro de <BattleProvider>");
  }
  return ctx;
}
