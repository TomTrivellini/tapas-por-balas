import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import CartList from "../components/cart/CartList";
import CheckoutForm from "../components/cart/CheckoutForm";

export default function CartPage() {
  const { totalCarrito, tapas, confirmarCompra, cantidadCarrito } = useCart();
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onCheckout(buyer) {
    setIsSubmitting(true);
    setErrorMsg("");
    const r = await confirmarCompra(buyer);
    if (r.ok) {
      setOrderId(r.orderId);
    } else if (r.reason === "no-caps") {
      setErrorMsg("No te alcanzan las tapas.");
    } else if (r.reason === "empty") {
      setErrorMsg("El carrito está vacío.");
    } else {
      setErrorMsg("No se pudo crear la orden. Intenta de nuevo.");
    }
    setIsSubmitting(false);
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

        {errorMsg && <p className="notice">{errorMsg}</p>}
        {orderId ? (
          <div className="order__success">
            Orden generada: <span className="order__id">{orderId}</span>
          </div>
        ) : (
          <CheckoutForm onSubmit={onCheckout} disabled={isSubmitting || cantidadCarrito === 0} />
        )}
      </div>
    </div>
  );
}
