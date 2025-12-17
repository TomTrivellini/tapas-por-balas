import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';

export default function NavBar() {
  const { caps, cartCount } = useGame();

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__logo">
          Tapas por balas
        </NavLink>

        <nav className="nav__links">
          <NavLink to="/shop" className="nav__link">
            Tienda
          </NavLink>
          <NavLink to="/inventory" className="nav__link">
            Inventario
          </NavLink>
          <NavLink to="/cart" className="nav__link nav__cart">
            Carrito <span className="badge">{cartCount}</span>
          </NavLink>
        </nav>

        <div className="nav__caps">
          <span className="caps__label">Tapas</span>
          <span className="caps__value">{caps}</span>
        </div>
      </div>
    </header>
  );
}
