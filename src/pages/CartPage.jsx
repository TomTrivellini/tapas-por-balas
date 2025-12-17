import { useGame } from "../context/GameContext.jsx";
import CartList from "../components/CartList.jsx";

export default function CartPage() {
  const { cart, cartTotal, caps, checkout } = useGame();

  function onCheckout() {
    const r = checkout();
    if (r.ok) alert("Compra realizada. Se agregó todo al inventario.");
    else if (r.reason === "no-caps") alert("No te alcanzan las tapas.");
    else alert("El carrito está vacío.");
  }

  return (
    <div className="page">
      <h1 className="page__title">Carrito</h1>

      <CartList />

      <div className="cart__summary">
        <div className="cart__row">
          <span className="muted">Tapas disponibles</span>
          <b>{caps}</b>
        </div>
        <div className="cart__row">
          <span className="muted">Total</span>
          <b>${cartTotal}</b>
        </div>

        <button className="btn btn--primary btn--big" onClick={onCheckout} disabled={cart.length === 0}>
          Comprar
        </button>
      </div>
    </div>
  );
}
