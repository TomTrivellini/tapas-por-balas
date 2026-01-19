import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopById } from "../data/shopService";
import ItemDetail from "../components/items/ItemDetail";

export default function ItemDetailContainer() {
  const { itemId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getShopById(itemId)
      .then(setEntry)
      .catch(() => setError("No se pudo cargar el detalle."))
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return (
      <div>
        <p className="muted">Cargando detalle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="notice">{error}</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div>
        <p className="muted">Producto no encontrado.</p>
      </div>
    );
  }

  return <ItemDetail entry={entry} />;
}
