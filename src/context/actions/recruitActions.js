// recruitActions.js - Funciones puras para manejar reclutas

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

export function equipWeapon(recruits, inventario, recruitIndex, weaponId, byId) {
  const weapon = byId.get(weaponId);
  if (!weapon || weapon.type !== "weapon") return { recruits, inventario };

  let newInventario = upsertQty(inventario, weaponId, -1);
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].weapon) {
    newInventario = upsertQty(newInventario, newRecruits[recruitIndex].weapon, 1);
  }
  newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], weapon: weaponId, ammo: 0 };
  return { recruits: newRecruits, inventario: newInventario };
}

export function unequipWeapon(recruits, inventario, recruitIndex) {
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].weapon) {
    const newInventario = upsertQty(inventario, newRecruits[recruitIndex].weapon, 1);
    newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], weapon: null, ammo: 0 };
    return { recruits: newRecruits, inventario: newInventario };
  }
  return { recruits, inventario };
}

export function addAmmo(recruits, inventario, recruitIndex, ammoId, qty, byId) {
  const ammo = byId.get(ammoId);
  if (!ammo || ammo.type !== "ammo") return { recruits, inventario };
  const recruit = recruits[recruitIndex];
  if (!recruit.weapon || ammo.ammoFor !== recruit.weapon) return { recruits, inventario };

  const newInventario = upsertQty(inventario, ammoId, -qty);
  const newRecruits = [...recruits];
  newRecruits[recruitIndex] = { ...recruit, ammo: recruit.ammo + qty };
  return { recruits: newRecruits, inventario: newInventario };
}

export function removeAmmo(recruits, inventario, recruitIndex, qty) {
  const recruit = recruits[recruitIndex];
  if (recruit.ammo <= 0) return { recruits, inventario };

  const ammoId = `amm-${recruit.weapon}`;
  const newInventario = upsertQty(inventario, ammoId, qty);
  const newRecruits = [...recruits];
  newRecruits[recruitIndex] = { ...recruit, ammo: Math.max(0, recruit.ammo - qty) };
  return { recruits: newRecruits, inventario: newInventario };
}

export function equipHelmet(recruits, inventario, recruitIndex, helmetId, byId) {
  const helmet = byId.get(helmetId);
  if (!helmet || helmet.id !== "mask") return { recruits, inventario };

  let newInventario = upsertQty(inventario, helmetId, -1);
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].helmet) {
    newInventario = upsertQty(newInventario, newRecruits[recruitIndex].helmet, 1);
  }
  newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], helmet: helmetId };
  return { recruits: newRecruits, inventario: newInventario };
}

export function unequipHelmet(recruits, inventario, recruitIndex) {
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].helmet) {
    const newInventario = upsertQty(inventario, newRecruits[recruitIndex].helmet, 1);
    newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], helmet: null };
    return { recruits: newRecruits, inventario: newInventario };
  }
  return { recruits, inventario };
}

export function equipVest(recruits, inventario, recruitIndex, vestId, byId) {
  const vest = byId.get(vestId);
  if (!vest || vest.id !== "vest") return { recruits, inventario };

  let newInventario = upsertQty(inventario, vestId, -1);
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].vest) {
    newInventario = upsertQty(newInventario, newRecruits[recruitIndex].vest, 1);
  }
  newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], vest: vestId };
  return { recruits: newRecruits, inventario: newInventario };
}

export function unequipVest(recruits, inventario, recruitIndex) {
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].vest) {
    const newInventario = upsertQty(inventario, newRecruits[recruitIndex].vest, 1);
    newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], vest: null };
    return { recruits: newRecruits, inventario: newInventario };
  }
  return { recruits, inventario };
}

export function equipConsumable(recruits, inventario, recruitIndex, consumableId, byId) {
  const consumable = byId.get(consumableId);
  if (!consumable || consumable.type !== "consumable") return { recruits, inventario };

  let newInventario = upsertQty(inventario, consumableId, -1);
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].consumable) {
    newInventario = upsertQty(newInventario, newRecruits[recruitIndex].consumable, 1);
  }
  newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], consumable: consumableId };
  return { recruits: newRecruits, inventario: newInventario };
}

export function unequipConsumable(recruits, inventario, recruitIndex) {
  const newRecruits = [...recruits];
  if (newRecruits[recruitIndex].consumable) {
    const newInventario = upsertQty(inventario, newRecruits[recruitIndex].consumable, 1);
    newRecruits[recruitIndex] = { ...newRecruits[recruitIndex], consumable: null };
    return { recruits: newRecruits, inventario: newInventario };
  }
  return { recruits, inventario };
}