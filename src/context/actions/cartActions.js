// cartActions.js - Funciones puras para manejar el carrito

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

export function addToCart(cart, id, qty = 1) {
  return upsertQty(cart, id, qty);
}

export function incCart(cart, id) {
  return addToCart(cart, id, 1);
}

export function decCart(cart, id) {
  return addToCart(cart, id, -1);
}

export function removeFromCart(cart, id) {
  return cart.filter((x) => x.id !== id);
}

export function checkout(cart, caps, inventario, inventoryRecruits, byId) {
  if (cart.length === 0) return { ok: false, reason: "empty" };

  const cartTotal = cart.reduce((acc, row) => {
    const entry = byId.get(row.id);
    if (!entry) return acc;
    return acc + entry.price * row.qty;
  }, 0);

  if (caps < cartTotal) return { ok: false, reason: "no-caps" };

  let newInventario = inventario;
  let newInventoryRecruits = [...inventoryRecruits];

  for (const row of cart) {
    const entry = byId.get(row.id);
    if (entry.kind === "item") {
      newInventario = upsertQty(newInventario, row.id, row.qty);
    } else if (entry.kind === "recluta") {
      for (let i = 0; i < row.qty; i++) {
        newInventoryRecruits.push({ id: entry.id, name: entry.name, weapon: null, ammo: 0, helmet: null, vest: null, consumable: null });
      }
    }
  }

  return {
    ok: true,
    newCaps: caps - cartTotal,
    newInventario,
    newInventoryRecruits,
    newCart: []
  };
}