import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useInventory } from '../../context/InventoryContext.jsx';

export default function NavLinks() {
  const { cantidadCarrito, carrito, removerDelCarrito, totalCarrito, realizarCompra } = useCart();
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
                    return (
                      <li key={item.id} className="cart-item">
                        <span>{entry.name} x{item.qty}</span>
                        <button onClick={() => removerDelCarrito(item.id)}>Quitar</button>
                      </li>
                    );
                  })}
                </ul>
                <div className="cart-total">Total: ${totalCarrito}</div>
                <NavLink to="/cart" onClick={() => setIsCartOpen(false)}>
                  Ver carrito completo
                </NavLink>
                <button 
                  className="btn btn--primary" 
                  onClick={() => { 
                    const r = realizarCompra(); 
                    if (r.ok) alert("Compra realizada. Se agregó todo al inventario."); 
                    else if (r.reason === "no-caps") alert("No te alcanzan las tapas."); 
                    setIsCartOpen(false); 
                  }}
                >
                  Comprar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}