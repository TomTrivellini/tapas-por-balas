import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopById } from "../data/gameServices";
import ItemDetail from "../components/items/ItemDetail";

export default function ItemDetailContainer() {
  const { itemId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getShopById(itemId)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [itemId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Cargando detalle...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="page">
        <h1 className="page__title">No existe</h1>
        <p className="muted">Ese item/recluta no se encontró.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <ItemDetail entry={entry} />
    </div>
  );
}
