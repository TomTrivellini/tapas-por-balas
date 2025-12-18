import { NavLink, useParams } from "react-router-dom";
import ItemListContainer from "../containers/ItemListContainer";
import { getCategories } from "../data/gameData";

export default function Shop() {
  const { categoryId } = useParams();
  const categories = getCategories();

  return (
    <div>
      <h1 className="page__title">{categoryId ? `Tienda · ${categoryId}` : "Tienda"}</h1>

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
    </div>
  );
}
