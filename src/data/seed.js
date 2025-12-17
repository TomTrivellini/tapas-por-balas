export const items = [
  { id: "rev", name: "Pistola", type: "weapon", category: "armas", price: 30, ammoCapacity: 6, effect: { stat: "damage", value: 10 } },
  { id: "shg", name: "Escopeta", type: "weapon", category: "armas", price: 45, ammoCapacity: 2, effect: { stat: "damage", value: 18 } },
  { id: "rif", name: "Rifle", type: "weapon", category: "armas", price: 55, ammoCapacity: 1, effect: { stat: "damage", value: 25 } },

  { id: "amm-rev", name: "Munición Pistola", type: "ammo", category: "municion", price: 8, ammoFor: "rev" },
  { id: "amm-shg", name: "Munición Escopeta", type: "ammo", category: "municion", price: 10, ammoFor: "shg" },
  { id: "amm-rif", name: "Munición Rifle", type: "ammo", category: "municion", price: 12, ammoFor: "rif" },

  { id: "mask", name: "Máscara", type: "gear", category: "equipo", price: 20, effect: { stat: "shield", value: 5 } },
  { id: "vest", name: "Chaleco antibalas", type: "gear", category: "equipo", price: 35, effect: { stat: "shield", value: 10 } },

  { id: "med", name: "Medkit", type: "consumable", category: "curacion", price: 15, effect: { stat: "hp", value: 25 } },
  { id: "chick", name: "Pollo asado", type: "consumable", category: "curacion", price: 18, effect: { stat: "hp", value: 50 } },
];

export const recruits = [
  { id: "r1", name: "Recluta Alfa", kind: "recruit", category: "reclutas", price: 40, parts: { head: 0, body: 0, legs: 0 } },
  { id: "r2", name: "Recluta Beta", kind: "recruit", category: "reclutas", price: 40, parts: { head: 0, body: 0, legs: 0 } },
  { id: "r3", name: "Recluta Gamma", kind: "recruit", category: "reclutas", price: 40, parts: { head: 0, body: 0, legs: 0 } },
];

export function getAllShopEntries() {
  const asItems = items.map((x) => ({ ...x, kind: "item" }));
  return [...asItems, ...recruits];
}

export function getCategories() {
  return ["reclutas", "armas", "municion", "equipo", "curacion"];
}
