import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopList } from "../data/shopService";
import ItemList from "../components/items/ItemList";

export default function ItemListContainer() {
  const { categoryId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getShopList(categoryId)
      .then(setEntries)
      .catch(() => setError("No se pudo cargar el catálogo."))
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div>
        <p className="muted">Cargando catálogo...</p>
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

  return <ItemList entries={entries} />;
}
