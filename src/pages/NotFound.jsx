import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h1 className="page__title">404</h1>
      <p className="muted">Esa ruta no existe.</p>
      <Link className="btn" to="/">
        Volver al inicio
      </Link>
    </div>
  );
}
