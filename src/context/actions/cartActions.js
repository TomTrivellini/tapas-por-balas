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

export function agregarAlCarrito(carrito, id, qty = 1) {
  return upsertQty(carrito, id, qty);
}

export function incrementarCarrito(carrito, id) {
  return agregarAlCarrito(carrito, id, 1);
}

export function decrementarCarrito(carrito, id) {
  return agregarAlCarrito(carrito, id, -1);
}

export function removerDelCarrito(carrito, id) {
  return carrito.filter((x) => x.id !== id);
}

export function realizarCompra(carrito, tapas, inventario, reclutasInventario, porId) {
  if (carrito.length === 0) return { ok: false, reason: "empty" };

  const totalCarrito = carrito.reduce((acc, row) => {
    const entry = porId.get(row.id);
    if (!entry) return acc;
    return acc + entry.price * row.qty;
  }, 0);

  if (tapas < totalCarrito) return { ok: false, reason: "no-caps" };

  let nuevoInventario = inventario;
  let nuevosReclutasInventario = [...reclutasInventario];

  for (const row of carrito) {
    const entry = porId.get(row.id);
    if (entry.kind === "item") {
      nuevoInventario = upsertQty(nuevoInventario, row.id, row.qty);
    } else if (entry.kind === "recluta") {
      for (let i = 0; i < row.qty; i++) {
        nuevosReclutasInventario.push({ id: entry.id, name: entry.name, weapon: null, ammo: 0, helmet: null, vest: null, consumable: null });
      }
    }
  }

  return {
    ok: true,
    nuevasTapas: tapas - totalCarrito,
    nuevoInventario,
    nuevosReclutasInventario,
    nuevoCarrito: []
  };
}