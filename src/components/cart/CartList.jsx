import { useGame } from "../../context/GameContext";
import CartRow from "./CartRow";

export default function CartList() {
  const { cart } = useGame();

  if (cart.length === 0) {
    return <p className="muted">No hay objetos en el carrito.</p>;
  }

  return (
    <div className="cart">
      {cart.map((row) => (
        <CartRow key={row.id} row={row} />
      ))}
    </div>
  );
}
