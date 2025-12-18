import { useGame } from '../../context/GameContext.jsx';

export default function StatusIndicators() {
  const { caps } = useGame();

  return (
    <div className="nav__caps">
      <span className="caps__label">Tapas</span>
      <span className="caps__value">{caps}</span>
    </div>
  );
}