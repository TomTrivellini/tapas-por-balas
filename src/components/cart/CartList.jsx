import { useCart } from "../../context/CartContext";
import CartRow from "./CartRow";

export default function CartList() {
  const { carrito } = useCart();

  if (carrito.length === 0) {
    return <p className="muted">No hay objetos en el carrito.</p>;
  }

  return (
    <div className="cart">
      {carrito.map((row) => (
        <CartRow key={row.id} row={row} />
      ))}
    </div>
  );
}
