import { createContext, useContext, useState } from "react";

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const [equipo, setEquipo] = useState([]);

  function agregarAlEquipo(indiceRecluta) {
    if (equipo.length >= 3 || equipo.includes(indiceRecluta)) return;
    setEquipo((prev) => [...prev, indiceRecluta]);
  }

  function removerDelEquipo(indiceRecluta) {
    setEquipo((prev) => prev.filter((idx) => idx !== indiceRecluta));
  }

  const value = {
    equipo,
    agregarAlEquipo,
    removerDelEquipo,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam debe usarse dentro de <TeamProvider>");
  return ctx;
}