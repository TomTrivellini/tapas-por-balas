import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useInventory } from '../../context/InventoryContext.jsx';

export default function NavLinks() {
  const {
    cantidadCarrito,
    carrito,
    removerDelCarrito,
    totalCarrito,
    incrementarCarrito,
    decrementarCarrito,
  } = useCart();
  const { porId } = useInventory();
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
          <span className="nav__cart-icon" aria-hidden="true">🛒</span>
          Carrito <span className="badge">{cantidadCarrito}</span>
        </button>
        {isCartOpen && (
          <div className="cart-dropdown">
            {carrito.length === 0 ? (
              <p>Carrito vacío</p>
            ) : (
              <>
                <ul className="cart-items">
                  {carrito.map((item) => {
                    const entry = porId.get(item.id);
                    if (!entry) return null;
                    const disableDecrement = item.qty <= 0;
                    return (
                      <li key={item.id} className="cart-item">
                        <span className="cart-item__name">{entry.name}</span>
                        <div className="cart-item__controls" aria-label="Cantidad">
                          <button
                            className="cart-item__btn"
                            onClick={() => decrementarCarrito(item.id)}
                            disabled={disableDecrement}
                            aria-label="Restar"
                          >
                            -
                          </button>
                          <span className="cart-item__qty" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            className="cart-item__btn"
                            onClick={() => incrementarCarrito(item.id)}
                            aria-label="Sumar"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-item__remove"
                          onClick={() => removerDelCarrito(item.id)}
                          title="Quitar"
                          aria-label="Quitar"
                        >
                          x
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-total">Total: ${totalCarrito}</div>
                <NavLink to="/cart" onClick={() => setIsCartOpen(false)}>
                  Ver carrito completo
                </NavLink>
                <NavLink
                  className="btn btn--primary"
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                >
                  Finalizar compra
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
