import { createContext, useContext, useMemo, useState } from "react";
import { getAllShopEntries } from "../data/gameData";
import { equiparArma as equiparArmaAction, desequiparArma as desequiparArmaAction, agregarMunicion as agregarMunicionAction, removerMunicion as removerMunicionAction, equiparCasco as equiparCascoAction, desequiparCasco as desequiparCascoAction, equiparChaleco as equiparChalecoAction, desequiparChaleco as desequiparChalecoAction, equiparConsumible as equiparConsumibleAction, desequiparConsumible as desequiparConsumibleAction } from "./actions/recruitActions";

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [inventario, setInventario] = useState([]);
  const [reclutasInventario, setReclutasInventario] = useState([]);

  const catalogo = useMemo(() => getAllShopEntries(), []);
  const porId = useMemo(() => {
    const m = new Map();
    for (const x of catalogo) m.set(x.id, x);
    return m;
  }, [catalogo]);

  function agregarAlInventario(nuevosItems, nuevosReclutas) {
    setInventario((prev) => [...prev, ...nuevosItems]);
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

  function equiparConsumible(indiceRecluta, idConsumible) {
    const result = equiparConsumibleAction(reclutasInventario, inventario, indiceRecluta, idConsumible, porId);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
  }

  function desequiparConsumible(indiceRecluta) {
    const result = desequiparConsumibleAction(reclutasInventario, inventario, indiceRecluta);
    setReclutasInventario(result.reclutas);
    setInventario(result.inventario);
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
    equiparConsumible,
    desequiparConsumible,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory debe usarse dentro de <InventoryProvider>");
  return ctx;
}