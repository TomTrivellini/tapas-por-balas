import { useGame } from "../context/GameContext.jsx";

export default function Footer() {
  const { addCaps, reset } = useGame();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__block">
          <div className="footer__title">Radio del refugio</div>
          <audio controls className="footer__audio">
            {/* Podés agregar un src local después (por ahora queda vacío a propósito). */}
          </audio>
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
