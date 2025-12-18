import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/NavBar/index.jsx";
import Footer from "./components/layout/Footer";
import Layout from "./components/layout/Layout";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ItemDetailPage from "./pages/ItemDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/category/:categoryId" element={<Shop />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/category/:categoryId" element={<Navigate to="/shop" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      <Footer />
    </div>
  );
}
