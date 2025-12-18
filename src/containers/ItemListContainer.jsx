import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShopList } from "../data/gameServices";
import ItemList from "../components/items/ItemList";

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
      <div>
        <p className="muted">Cargando catálogo...</p>
      </div>
    );
  }

  return <ItemList entries={entries} />;
}
