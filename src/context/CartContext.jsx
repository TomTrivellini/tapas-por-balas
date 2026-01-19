import { createContext, useContext, useMemo, useState } from "react";
import { getShopItems } from "../data/shopItems";
import { createOrder } from "../data/shopService";
import { agregarAlCarrito as agregarAlCarritoAction, incrementarCarrito as incrementarCarritoAction, decrementarCarrito as decrementarCarritoAction, removerDelCarrito as removerDelCarritoAction, realizarCompra as realizarCompraAction } from "./actions/cartActions";
import { useInventory } from "./InventoryContext";
import { useTeam } from "./TeamContext";

const CartContext = createContext(null);

const tapasIniciales = 100;

function sumarTotal(list) {
  return list.reduce((acc, x) => acc + x.qty, 0);
}

export function CartProvider({ children }) {
  const [tapas, setTapas] = useState(tapasIniciales);
  const [carrito, setCarrito] = useState([]);
  const { reclutasInventario, agregarAlInventario } = useInventory();
  const { equipo } = useTeam();

  const catalogo = useMemo(() => getShopItems(), []);
  const porId = useMemo(() => {
    const m = new Map();
    for (const x of catalogo) m.set(x.id, x);
    return m;
  }, [catalogo]);

  const exposedCarrito = useMemo(() => {
    // 1. Obtener las armas del equipo activo
    const equippedWeapons = equipo
      .map(idx => reclutasInventario[idx])
      .filter(r => r && !r.muerto && r.weapon)
      .map(r => r.weapon);
    
    const uniqueWeapons = [...new Set(equippedWeapons)];
    
    // 2. Determinar la munición necesaria
    const requiredAmmoIds = uniqueWeapons.map(weaponId => `amm-${weaponId}`);

    // 3. Inyectar munición faltante al carrito visible
    let newCarrito = [...carrito];
    const cartIds = new Set(newCarrito.map(item => item.id));

    requiredAmmoIds.forEach(ammoId => {
      if (!cartIds.has(ammoId) && porId.has(ammoId)) {
        newCarrito.push({ id: ammoId, qty: 0 });
      }
    });

    return newCarrito;

  }, [carrito, equipo, reclutasInventario, porId]);

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
    // Prevenir que la munición fijada se vaya a -1 si está en 0
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
    carrito: exposedCarrito, // Exponer el carrito 'memoizado'
    cantidadCarrito,
    totalCarrito,
    porId,
    catalogo,
    agregarTapas,
    reiniciarCarrito,
    agregarAlCarrito,
    sumarCarrito: incrementarCarrito, // Alias para el componente CartRow
    restarCarrito: decrementarCarrito, // Alias para el componente CartRow
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
