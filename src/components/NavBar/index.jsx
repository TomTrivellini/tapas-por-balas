import Logo from './Logo.jsx';
import NavLinks from './NavLinks.jsx';
import TapasCount from './TapasCount.jsx';

export default function NavBar() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Logo />
        <NavLinks />
        <TapasCount />
      </div>
    </header>
  );
}