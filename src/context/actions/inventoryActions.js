import { getShieldValue } from "../../data/shopItems";

// inventoryActions.js - Funciones puras para manejar reclutas

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

export function equiparArma(reclutas, inventario, indiceRecluta, idArma, porId) {
  const arma = porId.get(idArma);
  if (!arma || arma.type !== "arma") return { reclutas, inventario };

  let nuevoInventario = upsertQty(inventario, idArma, -1);
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].weapon) {
    nuevoInventario = upsertQty(nuevoInventario, nuevosReclutas[indiceRecluta].weapon, 1);
  }
  nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], weapon: idArma, ammo: 0 };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function desequiparArma(reclutas, inventario, indiceRecluta) {
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].weapon) {
    const nuevoInventario = upsertQty(inventario, nuevosReclutas[indiceRecluta].weapon, 1);
    nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], weapon: null, ammo: 0 };
    return { reclutas: nuevosReclutas, inventario: nuevoInventario };
  }
  return { reclutas, inventario };
}

export function agregarMunicion(reclutas, inventario, indiceRecluta, idMunicion, cantidad, porId) {
  const municion = porId.get(idMunicion);
  if (!municion || municion.type !== "ammo") return { reclutas, inventario };
  const recluta = reclutas[indiceRecluta];
  if (!recluta.weapon || municion.ammoFor !== recluta.weapon) return { reclutas, inventario };

  const nuevoInventario = upsertQty(inventario, idMunicion, -cantidad);
  const nuevosReclutas = [...reclutas];
  nuevosReclutas[indiceRecluta] = { ...recluta, ammo: recluta.ammo + cantidad };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function removerMunicion(reclutas, inventario, indiceRecluta, cantidad) {
  const recluta = reclutas[indiceRecluta];
  if (recluta.ammo <= 0) return { reclutas, inventario };

  const idMunicion = `amm-${recluta.weapon}`;
  const nuevoInventario = upsertQty(inventario, idMunicion, cantidad);
  const nuevosReclutas = [...reclutas];
  nuevosReclutas[indiceRecluta] = { ...recluta, ammo: Math.max(0, recluta.ammo - cantidad) };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function equiparCasco(reclutas, inventario, indiceRecluta, idCasco, porId) {
  const casco = porId.get(idCasco);
  if (!casco || casco.type !== "equipo" || casco.slot !== "helmet") return { reclutas, inventario };

  let nuevoInventario = upsertQty(inventario, idCasco, -1);
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].helmet) {
    nuevoInventario = upsertQty(nuevoInventario, nuevosReclutas[indiceRecluta].helmet, 1);
  }
  nuevosReclutas[indiceRecluta] = {
    ...nuevosReclutas[indiceRecluta],
    helmet: idCasco,
    helmetHp: getShieldValue(idCasco),
  };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function desequiparCasco(reclutas, inventario, indiceRecluta) {
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].helmet) {
    const nuevoInventario = upsertQty(inventario, nuevosReclutas[indiceRecluta].helmet, 1);
    nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], helmet: null, helmetHp: 0 };
    return { reclutas: nuevosReclutas, inventario: nuevoInventario };
  }
  return { reclutas, inventario };
}

export function equiparChaleco(reclutas, inventario, indiceRecluta, idChaleco, porId) {
  const chaleco = porId.get(idChaleco);
  if (!chaleco || chaleco.type !== "equipo" || chaleco.slot !== "vest") return { reclutas, inventario };

  let nuevoInventario = upsertQty(inventario, idChaleco, -1);
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].vest) {
    nuevoInventario = upsertQty(nuevoInventario, nuevosReclutas[indiceRecluta].vest, 1);
  }
  nuevosReclutas[indiceRecluta] = {
    ...nuevosReclutas[indiceRecluta],
    vest: idChaleco,
    vestHp: getShieldValue(idChaleco),
  };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function desequiparChaleco(reclutas, inventario, indiceRecluta) {
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].vest) {
    const nuevoInventario = upsertQty(inventario, nuevosReclutas[indiceRecluta].vest, 1);
    nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], vest: null, vestHp: 0 };
    return { reclutas: nuevosReclutas, inventario: nuevoInventario };
  }
  return { reclutas, inventario };
}

export function equiparObjeto(reclutas, inventario, indiceRecluta, idObjeto, porId) {
  const objeto = porId.get(idObjeto);
  if (!objeto || objeto.type !== "object") return { reclutas, inventario };

  let nuevoInventario = upsertQty(inventario, idObjeto, -1);
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].objectItem) {
    nuevoInventario = upsertQty(nuevoInventario, nuevosReclutas[indiceRecluta].objectItem, 1);
  }
  nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], objectItem: idObjeto };
  return { reclutas: nuevosReclutas, inventario: nuevoInventario };
}

export function desequiparObjeto(reclutas, inventario, indiceRecluta) {
  const nuevosReclutas = [...reclutas];
  if (nuevosReclutas[indiceRecluta].objectItem) {
    const nuevoInventario = upsertQty(inventario, nuevosReclutas[indiceRecluta].objectItem, 1);
    nuevosReclutas[indiceRecluta] = { ...nuevosReclutas[indiceRecluta], objectItem: null };
    return { reclutas: nuevosReclutas, inventario: nuevoInventario };
  }
  return { reclutas, inventario };
}
