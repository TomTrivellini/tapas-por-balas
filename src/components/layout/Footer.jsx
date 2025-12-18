import { useGame } from "../../context/GameContext";

export default function Footer() {
  const { addCaps, reset } = useGame();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__block">
          <div className="footer__title">Radio del refugio</div>
          
        </div>

        <div className="footer__actions">
          <button className="btn" onClick={() => addCaps(25)}>
            +25 tapas
          </button>
          <button className="btn btn--danger" onClick={reset}>
            Reiniciar
          </button>
        </div>
      </div>
    </footer>
  );
}
