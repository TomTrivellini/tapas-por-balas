import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ItemDetailPage from "./pages/ItemDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app">
      <NavBar />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* catálogo principal */}
          <Route path="/shop" element={<Shop />} />

          {/* catálogo filtrado por categoría (1 sola ruta paramétrica) */}
          <Route path="/shop/category/:categoryId" element={<Shop />} />

          {/* detalle */}
          <Route path="/shop/item/:itemId" element={<ItemDetailPage />} />

          {/* páginas extra del juego */}
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* atajo opcional */}
          <Route path="/category/:categoryId" element={<Navigate to="/shop" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
