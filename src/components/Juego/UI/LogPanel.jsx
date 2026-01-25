/**
 * LogPanel.jsx - Panel de eventos del juego
 */

import { useBattle } from '../../../game2/BattleContext';

export default function LogPanel() {
  const { state } = useBattle();
  const { log } = state;

  return (
    <div className="log-panel">
      {log.map((entry, idx) => (
        <div
          key={idx}
          className={`log-panel__entry${
            typeof entry === "object" && entry?.team === "B" ? " log-panel__entry--enemy" : ""
          }`}
        >
          {typeof entry === "string" ? entry : entry?.text}
        </div>
      ))}
    </div>
  );
}
