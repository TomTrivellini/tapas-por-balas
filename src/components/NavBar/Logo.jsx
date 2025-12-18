import { NavLink } from 'react-router-dom';

export default function Logo() {
  return (
    <NavLink to="/" className="nav__logo">
      Tapas por balas
    </NavLink>
  );
}