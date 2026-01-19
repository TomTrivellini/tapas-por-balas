import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import ItemListContainer from "../containers/ItemListContainer";
import { getShopCategories } from "../data/shopItems";
import SellInventoryList from "../components/items/SellInventoryList";

export default function Shop() {
  const { categoryId } = useParams();
  const categories = getShopCategories();
  const [mode, setMode] = useState("buy");

  const isBuying = mode === "buy";

  return (
    <div>
      <h1 className="page__title">{categoryId ? `Tienda · ${categoryId}` : "Tienda"}</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn btn--big ${isBuying ? "btn--primary" : ""}`}
          onClick={() => setMode("buy")}
        >
          Comprar
        </button>
        <button
          className={`btn btn--big ${!isBuying ? "btn--primary" : ""}`}
          onClick={() => setMode("sell")}
        >
          Vender
        </button>
      </div>

      {isBuying ? (
        <>
          <div className="subnav">
            <NavLink className="subnav__link" to="/shop">
              Todo
            </NavLink>

            {categories.map((c) => (
              <NavLink key={c} className="subnav__link" to={`/shop/category/${c}`}>
                {c}
              </NavLink>
            ))}
          </div>

          <ItemListContainer key={categoryId || "all"} />
        </>
      ) : (
        <SellInventoryList />
      )}
    </div>
  );
}
