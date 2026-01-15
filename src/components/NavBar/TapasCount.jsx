import { useCart } from '../../context/CartContext.jsx';

export default function TapasCount() {
  const { tapas } = useCart();

  return (
    <div className="nav__caps">
      <span className="caps__label">Tapas</span>
      <span className="caps__value">{tapas}</span>
    </div>
  );
}