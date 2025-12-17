import { createContext, useContext, useMemo, useState } from "react";
import { getAllShopEntries } from "../data/seed";

const GameContext = createContext(null);

const initialCaps = 100;

function sumQty(list) {
  return list.reduce((acc, x) => acc + x.qty, 0);
}

function upsertQty(list, id, delta) {
  const next = list.map((x) => ({ ...x }));
  const idx = next.findIndex((x) => x.id === id);

  if (idx === -1) {
    if (delta > 0) next.push({ id, qty: delta });
    return next;
  }

  next[idx].qty += delta;
  if (next[idx].qty <= 0) return next.filter((x) => x.id !== id);
  return next;
}

export function GameProvider({ children }) {
  const [caps, setCaps] = useState(initialCaps);
  const [cart, setCart] = useState([]); // [{id, qty}] SOLO items
  const [inventoryItems, setInventoryItems] = useState([]); // [{id, qty}]
  const [inventoryRecruits, setInventoryRecruits] = useState([]); // [{id, name}]

  const catalog = useMemo(() => getAllShopEntries(), []);
  const byId = useMemo(() => {
    const m = new Map();
    for (const x of catalog) m.set(x.id, x);
    return m;
  }, [catalog]);

  const cartCount = useMemo(() => sumQty(cart), [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, row) => {
      const entry = byId.get(row.id);
      if (!entry) return acc;
      return acc + entry.price * row.qty;
    }, 0);
  }, [cart, byId]);

  function addCaps(amount) {
    setCaps((c) => c + amount);
  }

  function reset() {
    setCaps(initialCaps);
    setCart([]);
    setInventoryItems([]);
    setInventoryRecruits([]);
  }

  // Carrito (solo objetos)
  function addToCart(id, qty = 1) {
    const entry = byId.get(id);
    if (!entry || entry.kind !== "item") return;
    setCart((prev) => upsertQty(prev, id, qty));
  }

  function incCart(id) {
    addToCart(id, 1);
  }

  function decCart(id) {
    const entry = byId.get(id);
    if (!entry || entry.kind !== "item") return;
    setCart((prev) => upsertQty(prev, id, -1));
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }

  function checkout() {
    if (cart.length === 0) return { ok: false, reason: "empty" };
    if (caps < cartTotal) return { ok: false, reason: "no-caps" };

    setCaps((c) => c - cartTotal);
    setInventoryItems((inv) => {
      let next = inv;
      for (const row of cart) next = upsertQty(next, row.id, row.qty);
      return next;
    });
    setCart([]);
    return { ok: true };
  }

  // Reclutas (compra directa)
  function recruitNow(id) {
    const entry = byId.get(id);
    if (!entry || entry.kind !== "recruit") return { ok: false, reason: "not-recruit" };
    if (caps < entry.price) return { ok: false, reason: "no-caps" };

    setCaps((c) => c - entry.price);
    setInventoryRecruits((prev) => [...prev, { id: entry.id, name: entry.name }]);
    return { ok: true };
  }

  const value = {
    caps,
    cart,
    cartCount,
    cartTotal,
    inventoryItems,
    inventoryRecruits,
    byId,

    addCaps,
    reset,

    addToCart,
    incCart,
    decCart,
    removeFromCart,
    checkout,

    recruitNow,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return ctx;
}
