import Logo from './Logo.jsx';
import NavLinks from './NavLinks.jsx';
import StatusIndicators from './StatusIndicators.jsx';

export default function NavBar() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <Logo />
        <NavLinks />
        <StatusIndicators />
      </div>
    </header>
  );
}