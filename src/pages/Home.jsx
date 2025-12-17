import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <h1 className="hero__title">Tapas por balas</h1>
      <p className="muted">
        Reclutá personajes y comprá equipo. Todo simple por ahora: daño, escudo y HP (sin stats duplicadas).
      </p>

      <div className="hero__actions">
        <Link className="btn btn--primary" to="/shop">
          Ir a la tienda
        </Link>
        <Link className="btn" to="/inventory">
          Ver inventario
        </Link>
      </div>
    </div>
  );
}
