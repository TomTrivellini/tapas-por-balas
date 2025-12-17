import { NavLink, useParams } from "react-router-dom";
import ItemListContainer from "../containers/ItemListContainer.jsx";
import { getCategories } from "../data/seed";

export default function Shop() {
  const { categoryId } = useParams();
  const categories = getCategories();

  return (
    <div className="page">
      <h1 className="page__title">Tienda</h1>

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

      {/* El contenedor lee useParams() y hace el fetch con retardo */}
      <ItemListContainer key={categoryId || "all"} />
    </div>
  );
}
