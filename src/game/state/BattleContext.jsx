/**
 * BattleContext y hook useBattle
 * Provee el estado del juego y sus acciones a toda la app.
 */

import { createContext, useContext, useReducer } from 'react';
import { createBattleState } from './battleInitialState';
import { battleReducer } from './battleReducer';

const BattleContext = createContext(null);

export function BattleProvider({ children, initialTeamA = [], initialTeamB = [], initialCover = null }) {
  const initialState = createBattleState(initialTeamA, initialTeamB, initialCover);
  const [state, dispatch] = useReducer(battleReducer, initialState);

  const value = { state, dispatch };

  return (
    <BattleContext.Provider value={value}>
      {children}
    </BattleContext.Provider>
  );
}

export function useBattle() {
  const ctx = useContext(BattleContext);
  if (!ctx) {
    throw new Error('useBattle debe usarse dentro de <BattleProvider>');
  }
  return ctx;
}
