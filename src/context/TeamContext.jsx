import { createContext, useContext, useState } from "react";

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [equipo, setEquipo] = useState([]); // Índices de reclutas vivos en el equipo
  const [fallecidos, setFallecidos] = useState([]); // Reclutas muertos con su equipamiento

  function agregarAlEquipo(indiceRecluta) {
    if (equipo.length >= 3 || equipo.includes(indiceRecluta)) return;
    setEquipo((prev) => [...prev, indiceRecluta]);
  }

  function removerDelEquipo(indiceRecluta) {
    setEquipo((prev) => prev.filter((idx) => idx !== indiceRecluta));
  }

  function marcarMuerto(recruitData) {
    // Agregar recluta a fallecidos con su equipo actual
    setFallecidos((prev) => [...prev, { ...recruitData, muerto: true }]);
  }

  function removerDeFallecidos(indiceReclutaMuerto) {
    setFallecidos((prev) => prev.filter((_, idx) => idx !== indiceReclutaMuerto));
  }

  const value = {
    equipo,
    agregarAlEquipo,
    removerDelEquipo,
    fallecidos,
    marcarMuerto,
    removerDeFallecidos,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam debe usarse dentro de <TeamProvider>");
  return ctx;
}