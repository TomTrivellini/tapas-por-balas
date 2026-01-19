import { useInventory } from '../../../context/InventoryContext';
export default function TeamCard({ unit }) {
  const { porId } = useInventory();

  if (!unit || unit.muerto || unit.alive === false) {
    return null;
  }

  const weapon = unit.weapon ? porId.get(unit.weapon) : null;
  const helmet = unit.helmet ? porId.get(unit.helmet) : null;
  const vest = unit.vest ? porId.get(unit.vest) : null;
  const equipedObject = unit.objectItem ? porId.get(unit.objectItem) : null;
  const currentHp = unit.hp ?? 1;
  const maxAp = unit.currentMaxAp ?? unit.maxAp ?? 2;
  const currentAp = unit.ap ?? maxAp;
  const helmetShield = helmet?.shield ?? 0;
  const vestShield = vest?.shield ?? 0;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, flex: 1 }}>{unit.name}</h3>
        <span style={{ fontSize: '12px', color: '#aaa' }}>
          HP: {currentHp} · AP: {currentAp}
        </span>
      </div>

      <div>
        <strong>Arma:</strong> {weapon ? weapon.name : 'Ninguna'}
        {weapon && (
          <span style={{ marginLeft: '6px', fontSize: '12px', color: '#aaa' }}>
            Municion: {unit.ammo ?? 0}
          </span>
        )}
      </div>

      <div>
        <strong>Casco:</strong> {helmet ? helmet.name : 'Ninguno'}
        {helmet && (
          <span style={{ marginLeft: '6px', fontSize: '12px', color: '#aaa' }}>
            Escudo: {(unit.helmetHp ?? helmetShield)}/{helmetShield}
          </span>
        )}
      </div>

      <div>
        <strong>Chaleco:</strong> {vest ? vest.name : 'Ninguno'}
        {vest && (
          <span style={{ marginLeft: '6px', fontSize: '12px', color: '#aaa' }}>
            Escudo: {(unit.vestHp ?? vestShield)}/{vestShield}
          </span>
        )}
      </div>

      <div>
        <strong>Objeto:</strong> {equipedObject ? equipedObject.name : 'Ninguno'}
      </div>
    </div>
  );
}
