import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext.jsx';

export default function NavLinks() {
  const { CartCount, cart, byId, removeFromCart, cartTotal } = useGame();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav className="nav__links">
      <NavLink to="/shop" className="nav__link">
        Tienda
      </NavLink>
      <NavLink to="/inventory" className="nav__link">
        Inventario
      </NavLink>
      <div className="nav__cart-widget">
        <button
          className="nav__cart-button"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          Carrito <span className="badge">{CartCount}</span>
        </button>
        {isCartOpen && (
          <div className="cart-dropdown">
            {cart.length === 0 ? (
              <p>Carrito vacío</p>
            ) : (
              <>
                <ul className="cart-items">
                  {cart.map((item) => {
                    const entry = byId.get(item.id);
                    return (
                      <li key={item.id} className="cart-item">
                        <span>{entry.name} x{item.qty}</span>
                        <button onClick={() => removeFromCart(item.id)}>Quitar</button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-total">Total: ${cartTotal}</div>
                <NavLink to="/cart" onClick={() => setIsCartOpen(false)}>
                  Ver carrito completo
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}