import { createContext, useContext, useMemo, useState } from "react";
import { getAllShopEntries } from "../data/gameData";
import { addToCart as addToCartAction, incCart as incCartAction, decCart as decCartAction, removeFromCart as removeFromCartAction, checkout as checkoutAction } from "./actions/cartActions";
import { equipWeapon as equipWeaponAction, unequipWeapon as unequipWeaponAction, addAmmo as addAmmoAction, removeAmmo as removeAmmoAction, equipHelmet as equipHelmetAction, unequipHelmet as unequipHelmetAction, equipVest as equipVestAction, unequipVest as unequipVestAction, equipConsumable as equipConsumableAction, unequipConsumable as unequipConsumableAction } from "./actions/recruitActions";

const GameContext = createContext(null);

const initialCaps = 100;

function sumTotal(list) {
  return list.reduce((acc, x) => acc + x.qty, 0);
}

export function GameProvider({ children }) {
  const [caps, setCaps] = useState(initialCaps);
  const [cart, setCart] = useState([]); 
  const [inventario, setInventario] = useState([]);
  const [inventoryRecruits, setInventoryRecruits] = useState([]); 
  const [team, setTeam] = useState([]); 

  const catalog = useMemo(() => getAllShopEntries(), []);
  const byId = useMemo(() => {
    const m = new Map();
    for (const x of catalog) m.set(x.id, x);
    return m;
  }, [catalog]);

  const contCarrito = useMemo(() => sumTotal(cart), [cart]);

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
    setInventario([]);
    setInventoryRecruits([]);
  }

  
  function addTapas(id, qty = 1) {
    const entry = byId.get(id);
    if (!entry) return;
    setCart((prev) => addToCartAction(prev, id, qty));
  }

  function sumCart(id) {
    setCart((prev) => incCartAction(prev, id));
  }

  function resCart(id) {
    const entry = byId.get(id);
    if (!entry) return;
    setCart((prev) => decCartAction(prev, id));
  }

  function removeFromCart(id) {
    setCart((prev) => removeFromCartAction(prev, id));
  }

  function checkout() {
    const result = checkoutAction(cart, caps, inventario, inventoryRecruits, byId);
    if (!result.ok) return result;
    setCaps(result.newCaps);
    setInventario(result.newInventario);
    setInventoryRecruits(result.newInventoryRecruits);
    setCart(result.newCart);
    return { ok: true };
  }



 
  function equipWeapon(recruitIndex, weaponId) {
    const result = equipWeaponAction(inventoryRecruits, inventario, recruitIndex, weaponId, byId);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function unequipWeapon(recruitIndex) {
    const result = unequipWeaponAction(inventoryRecruits, inventario, recruitIndex);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function addAmmo(recruitIndex, ammoId, qty = 1) {
    const result = addAmmoAction(inventoryRecruits, inventario, recruitIndex, ammoId, qty, byId);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function removeAmmo(recruitIndex, qty = 1) {
    const result = removeAmmoAction(inventoryRecruits, inventario, recruitIndex, qty);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function equipHelmet(recruitIndex, helmetId) {
    const result = equipHelmetAction(inventoryRecruits, inventario, recruitIndex, helmetId, byId);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function unequipHelmet(recruitIndex) {
    const result = unequipHelmetAction(inventoryRecruits, inventario, recruitIndex);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function equipVest(recruitIndex, vestId) {
    const result = equipVestAction(inventoryRecruits, inventario, recruitIndex, vestId, byId);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function unequipVest(recruitIndex) {
    const result = unequipVestAction(inventoryRecruits, inventario, recruitIndex);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function equipConsumable(recruitIndex, consumableId) {
    const result = equipConsumableAction(inventoryRecruits, inventario, recruitIndex, consumableId, byId);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  function unequipConsumable(recruitIndex) {
    const result = unequipConsumableAction(inventoryRecruits, inventario, recruitIndex);
    setInventoryRecruits(result.recruits);
    setInventario(result.inventario);
  }

  // Gestionar equipo
  function addToTeam(recruitIndex) {
    if (team.length >= 3 || team.includes(recruitIndex)) return;
    setTeam((prev) => [...prev, recruitIndex]);
  }

  function removeFromTeam(recruitIndex) {
    setTeam((prev) => prev.filter((idx) => idx !== recruitIndex));
  }

  const value = {
    caps,
    cart,
    contCarrito,
    cartTotal,
    inventario,
    inventoryRecruits,
    team,
    byId,

    addCaps,
    reset,

    addTapas,
    sumCart,
    resCart,
    removeFromCart,
    checkout,

    equipWeapon,
    unequipWeapon,
    addAmmo,
    removeAmmo,
    equipHelmet,
    unequipHelmet,
    equipVest,
    unequipVest,
    equipConsumable,
    unequipConsumable,

    addToTeam,
    removeFromTeam,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame debe usarse dentro de <GameProvider>");
  return ctx;
}
