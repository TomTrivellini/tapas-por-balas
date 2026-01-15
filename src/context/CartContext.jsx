import { createContext, useContext, useMemo, useState } from "react";
import { getAllShopEntries } from "../data/gameData";
import { agregarAlCarrito as agregarAlCarritoAction, incrementarCarrito as incrementarCarritoAction, decrementarCarrito as decrementarCarritoAction, removerDelCarrito as removerDelCarritoAction, realizarCompra as realizarCompraAction } from "./actions/cartActions";
import { useInventory } from "./InventoryContext";

const CartContext = createContext(null);

const tapasIniciales = 100;

function sumarTotal(list) {
  return list.reduce((acc, x) => acc + x.qty, 0);
}

export function CartProvider({ children }) {
  const [tapas, setTapas] = useState(tapasIniciales);
  const [carrito, setCarrito] = useState([]);
  const { agregarAlInventario } = useInventory();

  const catalogo = useMemo(() => getAllShopEntries(), []);
  const porId = useMemo(() => {
    const m = new Map();
    for (const x of catalogo) m.set(x.id, x);
    return m;
  }, [catalogo]);

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
    incrementarCarrito,
    decrementarCarrito,
    removerDelCarrito,
    realizarCompra,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}