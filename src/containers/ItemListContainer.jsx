import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopList } from "../data/api.js";
import ItemList from "../components/ItemList.jsx";

export default function ItemListContainer() {
  const { categoryId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getShopList(categoryId)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{categoryId ? `Tienda · ${categoryId}` : "Tienda"}</h1>
      <ItemList entries={entries} />
    </div>
  );
}
