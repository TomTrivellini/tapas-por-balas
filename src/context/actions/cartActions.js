// cartActions.js - Funciones puras para manejar el carrito
import { getRandomBattleName } from "../../data/battleNames";

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

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const resolveRecruitTier = (entry) => {
  const name = entry?.name?.toLowerCase() || "";
  if (name.includes("alfa") || name.includes("alpha")) return "alfa";
  if (name.includes("gamma")) return "gamma";
  if (name.includes("beta") || name.includes("betta")) return "beta";
  return "beta";
};

const buildRecruitLoadout = (tier, items) => {
  const weapons = items.filter((item) => item.type === "arma");
  const objects = items.filter((item) => item.type === "object");
  const helmetItems = items.filter((item) => item.slot === "helmet");
  const vestItems = items.filter((item) => item.slot === "vest");

  const loadout = {
    weapon: null,
    ammo: 0,
    helmet: null,
    vest: null,
    objectItem: null,
  };

  const giveWeapon = () => {
    if (loadout.weapon || weapons.length === 0) return;
    loadout.weapon = pickRandom(weapons).id;
  };

  const giveAmmo = () => {
    if (!loadout.weapon) {
      giveWeapon();
    }
    if (loadout.weapon) {
      loadout.ammo = 5;
    }
  };

  const giveObject = () => {
    if (loadout.objectItem || objects.length === 0) return;
    loadout.objectItem = pickRandom(objects).id;
  };

  const giveHelmet = () => {
    if (loadout.helmet || helmetItems.length === 0) return;
    loadout.helmet = pickRandom(helmetItems).id;
  };

  const giveVest = () => {
    if (loadout.vest || vestItems.length === 0) return;
    loadout.vest = pickRandom(vestItems).id;
  };

  if (tier === "beta") {
    return loadout;
  }

  if (tier === "gamma") {
    const slots = ["weapon", "ammo", "object", "helmet", "vest"];
    const count = randomInt(1, 3);
    for (let i = 0; i < count && slots.length > 0; i += 1) {
      const idx = Math.floor(Math.random() * slots.length);
      const choice = slots.splice(idx, 1)[0];
      if (choice === "weapon") giveWeapon();
      if (choice === "ammo") giveAmmo();
      if (choice === "object") giveObject();
      if (choice === "helmet") giveHelmet();
      if (choice === "vest") giveVest();
    }
    return loadout;
  }

  // alfa: todo equipado
  giveWeapon();
  giveAmmo();
  giveHelmet();
  giveVest();
  giveObject();
  return loadout;
};

const buildRecruit = (entry, items) => {
  const tier = resolveRecruitTier(entry);
  const loadout = buildRecruitLoadout(tier, items);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const helmetShield = loadout.helmet
    ? itemById.get(loadout.helmet)?.shield || 0
    : 0;
  const vestShield = loadout.vest
    ? itemById.get(loadout.vest)?.shield || 0
    : 0;
  const randomName = getRandomBattleName(entry.name);
  return {
    id: entry.id,
    name: randomName,
    weapon: loadout.weapon,
    ammo: loadout.ammo,
    helmet: loadout.helmet,
    helmetHp: helmetShield,
    vest: loadout.vest,
    vestHp: vestShield,
    objectItem: loadout.objectItem,
  };
};

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

  const allItems = Array.from(porId.values()).filter((entry) => entry.kind === "item");

  for (const row of carrito) {
    const entry = porId.get(row.id);
    if (entry.kind === "item") {
      nuevoInventario = upsertQty(nuevoInventario, row.id, row.qty);
    } else if (entry.kind === "recluta") {
      for (let i = 0; i < row.qty; i++) {
        nuevosReclutasInventario.push(buildRecruit(entry, allItems));
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
