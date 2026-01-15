import { useCart } from "../context/CartContext.jsx";
import CartList from "../components/cart/CartList";

export default function CartPage() {
  const { carrito, totalCarrito, tapas, realizarCompra } = useCart();

  function onCheckout() {
    const r = realizarCompra();
    if (r.ok) alert("Compra realizada. Se agregó todo al inventario.");
    else if (r.reason === "no-caps") alert("No te alcanzan las tapas.");
    else alert("El carrito está vacío.");
  }

  return (
    <div>
      <h1 className="page__title">Carrito</h1>

      <CartList />

      <div className="cart__summary">
        <div className="cart__row">
          <span className="muted">Tapas disponibles</span>
          <b>{tapas}</b>
        </div>
        <div className="cart__row">
          <span className="muted">Total</span>
          <b>${totalCarrito}</b>
        </div>

        <button className="btn btn--primary btn--big" onClick={onCheckout} disabled={carrito.length === 0}>
          Comprar
        </button>
      </div>
    </div>
  );
}
