import { createContext, useContext, useMemo, useState } from "react";
import { getShopItems } from "../data/shopItems";
import { equiparArma as equiparArmaAction, desequiparArma as desequiparArmaAction, agregarMunicion as agregarMunicionAction, removerMunicion as removerMunicionAction, equiparCasco as equiparCascoAction, desequiparCasco as desequiparCascoAction, equiparChaleco as equiparChalecoAction, desequiparChaleco as desequiparChalecoAction, equiparObjeto as equiparObjetoAction, desequiparObjeto as desequiparObjetoAction } from "./actions/inventoryActions";

const InventoryContext = createContext(null);

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

export function InventoryProvider({ children }) {
  const [inventario, setInventario] = useState([]);
  const [reclutasInventario, setReclutasInventario] = useState([]);

  const catalogo = useMemo(() => getShopItems(), []);
  const porId = useMemo(() => {
    const m = new Map();
    for (const x of catalogo) m.set(x.id, x);
    return m;
  }, [catalogo]);

  function agregarAlInventario(nuevosItems, nuevosReclutas) {
    setInventario((prev) => {
      let result = [...prev];
      for (const item of nuevosItems) {
        result = upsertQty(result, item.id, item.qty);
      }
      return result;
    });
    setReclutasInventario((prev) => [...prev, ...nuevosReclutas]);
  }

  function equiparArma(indiceRecluta, idArma) {
    const result = equiparArmaAction(reclutasInventario, inventario, indiceRecluta, idArma, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function desequiparArma(indiceRecluta) {
    const result = desequiparArmaAction(reclutasInventario, inventario, indiceRecluta);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function agregarMunicion(indiceRecluta, idMunicion, qty = 1) {
    const result = agregarMunicionAction(reclutasInventario, inventario, indiceRecluta, idMunicion, qty, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function removerMunicion(indiceRecluta, qty = 1) {
    const result = removerMunicionAction(reclutasInventario, inventario, indiceRecluta, qty);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function equiparCasco(indiceRecluta, idCasco) {
    const result = equiparCascoAction(reclutasInventario, inventario, indiceRecluta, idCasco, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function desequiparCasco(indiceRecluta) {
    const result = desequiparCascoAction(reclutasInventario, inventario, indiceRecluta);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function equiparChaleco(indiceRecluta, idChaleco) {
    const result = equiparChalecoAction(reclutasInventario, inventario, indiceRecluta, idChaleco, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function desequiparChaleco(indiceRecluta) {
    const result = desequiparChalecoAction(reclutasInventario, inventario, indiceRecluta);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function equiparObjeto(indiceRecluta, idObjeto) {
    const result = equiparObjetoAction(reclutasInventario, inventario, indiceRecluta, idObjeto, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function desequiparObjeto(indiceRecluta) {
    const result = desequiparObjetoAction(reclutasInventario, inventario, indiceRecluta);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function removerItemDelInventario(idItem, qty = 1) {
    if (!idItem || qty <= 0) return;
    setInventario((prev) => upsertQty(prev, idItem, -qty));
  }

  function renombrarRecluta(indiceRecluta, nuevoNombre) {
    setReclutasInventario((prev) => {
      const nuevos = [...prev];
      if (nuevos[indiceRecluta]) {
        nuevos[indiceRecluta] = { ...nuevos[indiceRecluta], name: nuevoNombre };
      }
      return nuevos;
    });
  }

  function actualizarEquipoRecluta(indiceRecluta, cambios) {
    setReclutasInventario((prev) => {
      if (!prev[indiceRecluta]) return prev;
      const recluta = prev[indiceRecluta];
      const nextValues = {
        helmet: cambios.helmet ?? recluta.helmet ?? null,
        helmetHp: cambios.helmetHp ?? recluta.helmetHp ?? 0,
        vest: cambios.vest ?? recluta.vest ?? null,
        vestHp: cambios.vestHp ?? recluta.vestHp ?? 0,
      };

      const hasChanges =
        recluta.helmet !== nextValues.helmet ||
        (recluta.helmetHp ?? 0) !== (nextValues.helmetHp ?? 0) ||
        recluta.vest !== nextValues.vest ||
        (recluta.vestHp ?? 0) !== (nextValues.vestHp ?? 0);

      if (!hasChanges) return prev;

      const nuevos = [...prev];
      nuevos[indiceRecluta] = {
        ...recluta,
        ...nextValues,
      };
      return nuevos;
    });
  }

  function marcarReclutaComoFallecido(indiceRecluta) {
    setReclutasInventario((prev) => {
      if (!prev[indiceRecluta]) return prev;
      if (prev[indiceRecluta].muerto) return prev;
      const nuevos = [...prev];
      nuevos[indiceRecluta] = { ...nuevos[indiceRecluta], muerto: true };
      return nuevos;
    });
  }

  function sincronizarRecluta(indiceRecluta, cambios) {
    setReclutasInventario((prev) => {
      if (!prev[indiceRecluta]) return prev;
      const recluta = prev[indiceRecluta];
      const actualizado = { ...recluta, ...cambios };
      const hasChanges = Object.keys(cambios).some(
        (key) => recluta[key] !== actualizado[key]
      );
      if (!hasChanges) return prev;
      const nuevos = [...prev];
      nuevos[indiceRecluta] = actualizado;
      return nuevos;
    });
  }

  const value = {
    inventario,
    reclutasInventario,
    porId,
    agregarAlInventario,
    equiparArma,
    desequiparArma,
    agregarMunicion,
    removerMunicion,
    equiparCasco,
    desequiparCasco,
    equiparChaleco,
    desequiparChaleco,
    equiparObjeto,
    desequiparObjeto,
    removerItemDelInventario,
    renombrarRecluta,
    actualizarEquipoRecluta,
    marcarReclutaComoFallecido,
    sincronizarRecluta,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory debe usarse dentro de <InventoryProvider>");
  return ctx;
}
