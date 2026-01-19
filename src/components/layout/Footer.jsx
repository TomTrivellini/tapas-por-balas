import { useCart } from "../../context/CartContext";
import { useInventory } from "../../context/InventoryContext";

export default function Footer() {
  const { agregarTapas, reiniciarCarrito } = useCart();
  const { agregarAlInventario, inventario } = useInventory();

  /**
   * Crear un recluta con arma y munición
   * Parámetros editables:
   * - name: nombre del recluta
   * - weapon: ID del arma (ej: 'rev' para pistola, 'shg' para escopeta, 'rif' para rifle)
   * - ammoQty: cantidad de munición
   */
  const crearReclutaEquipado = (
    name = "Recluta de Prueba",
    weapon = "rev",
    ammoQty = 6
  ) => {
    const recruit = {
      id: `test-${Date.now()}`,
      name,
      weapon,
      ammo: ammoQty,
      helmet: null,
      helmetHp: 0,
      vest: null,
      vestHp: 0,
      objectItem: null,
    };
    
    const itemsToAdd = [{ id: weapon, qty: 1 }];
    if (ammoQty > 0) {
      itemsToAdd.push({ id: `amm-${weapon}`, qty: ammoQty });
    }
    
    agregarAlInventario(itemsToAdd, [recruit]);
    alert(`✓ Recluta "${name}" agregado con ${weapon} y ${ammoQty} balas`);
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__block">
          <div className="footer__title">Radio del refugio</div>
          
        </div>

        <div className="footer__actions">
          <button className="btn" onClick={() => agregarTapas(1000)}>
            +1000 tapas
          </button>
          <button 
            className="btn" 
            onClick={() => crearReclutaEquipado("Recluta con Pistola", "rev", 6)}
            title="Agrega un recluta con pistola y 6 balas. Edita crearReclutaEquipado() para customizar"
          >
            + Recluta (Pistola)
          </button>
          <button className="btn btn--danger" onClick={reiniciarCarrito}>
            Reiniciar
          </button>
        </div>
      </div>
    </footer>
  );
}
