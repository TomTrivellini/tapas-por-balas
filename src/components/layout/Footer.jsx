import { useCart } from "../../context/CartContext";

export default function Footer() {
  const { agregarTapas, reiniciarCarrito } = useCart();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__block">
          <div className="footer__title">Radio del refugio</div>
          
        </div>

        <div className="footer__actions">
          <button className="btn" onClick={() => agregarTapas(25)}>
            +25 tapas
          </button>
          <button className="btn btn--danger" onClick={reiniciarCarrito}>
            Reiniciar
          </button>
        </div>
      </div>
    </footer>
  );
}
