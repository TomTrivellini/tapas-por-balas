import { createContext, useContext, useMemo, useState } from "react";
import { createOrder } from "../data/shopService";
import { agregarAlCarrito as agregarAlCarritoAction, incrementarCarrito as incrementarCarritoAction, decrementarCarrito as decrementarCarritoAction, removerDelCarrito as removerDelCarritoAction, realizarCompra as realizarCompraAction } from "./actions/cartActions";
import { useInventory } from "./InventoryContext";
import { useCatalog } from "./CatalogContext";

const CartContext = createContext(null);

const tapasIniciales = 100;

function sumarTotal(list) {
  return list.reduce((acc, x) => acc + x.qty, 0);
}

export function CartProvider({ children }) {
  const [tapas, setTapas] = useState(tapasIniciales);
  const [carrito, setCarrito] = useState([]);
  const { agregarAlInventario } = useInventory();
  const { items, itemsById } = useCatalog();
  const catalogo = useMemo(() => items, [items]);
  const porId = itemsById;

  const cantidadCarrito = useMemo(() => sumarTotal(carrito), [carrito]);

  const totalCarrito = useMemo(() => {
    return carrito.reduce((acc, row) => {
      const entry = porId.get(row.id);
      if (!entry) return acc;
      return acc + entry.price * row.qty;
    }, 0);
  }, [carrito, porId]);

  function agregarTapas(cantidad) {
    setTapas((c) => c + cantidad);
  }

  function reiniciarCarrito() {
    setTapas(tapasIniciales);
    setCarrito([]);
  }

  function agregarAlCarrito(id, qty = 1) {
    const entry = porId.get(id);
    if (!entry) return;
    setCarrito((prev) => agregarAlCarritoAction(prev, id, qty));
  }

  function incrementarCarrito(id) {
    setCarrito((prev) => incrementarCarritoAction(prev, id));
  }

  function decrementarCarrito(id) {
    const entry = porId.get(id);
    if (!entry) return;

    const itemInCart = carrito.find(item => item.id === id);
    if (!itemInCart || itemInCart.qty <= 0) return;
    setCarrito((prev) => decrementarCarritoAction(prev, id));
  }

  function removerDelCarrito(id) {
    setCarrito((prev) => removerDelCarritoAction(prev, id));
  }

  function realizarCompra() {
    const result = realizarCompraAction(carrito, tapas, [], [], porId);
    if (!result.ok) return result;
    setTapas(result.nuevasTapas);
    setCarrito(result.nuevoCarrito);
    agregarAlInventario(result.nuevoInventario, result.nuevosReclutasInventario);
    return { ok: true };
  }

  async function confirmarCompra(buyer) {
    if (!carrito.length) return { ok: false, reason: "empty" };
    if (tapas < totalCarrito) return { ok: false, reason: "no-caps" };

    const result = realizarCompraAction(carrito, tapas, [], [], porId);
    if (!result.ok) return result;

    const items = carrito
      .filter((row) => row.qty > 0)
      .map((row) => {
        const entry = porId.get(row.id);
        const price = entry?.price ?? 0;
        return {
          id: row.id,
          name: entry?.name || row.id,
          qty: row.qty,
          price,
          subtotal: price * row.qty,
        };
      });

    try {
      const orderId = await createOrder({
        buyer,
        items,
        total: totalCarrito,
        currency: "tapas",
      });

      setTapas(result.nuevasTapas);
      setCarrito(result.nuevoCarrito);
      agregarAlInventario(result.nuevoInventario, result.nuevosReclutasInventario);
      return { ok: true, orderId };
    } catch (error) {
      return { ok: false, reason: "firestore", error };
    }
  }

  const value = {
    tapas,
    carrito,
    cantidadCarrito,
    totalCarrito,
    porId,
    catalogo,
    agregarTapas,
    reiniciarCarrito,
    agregarAlCarrito,
    sumarCarrito: incrementarCarrito,
    restarCarrito: decrementarCarrito,
    incrementarCarrito,
    decrementarCarrito,
    removerDelCarrito,
    realizarCompra,
    confirmarCompra,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
