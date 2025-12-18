import ItemCard from "./ItemCard";

export default function ItemList({ entries }) {
  return (
    <div className="grid">
      {entries.map((e) => (
        <ItemCard key={e.id} entry={e} />
      ))}
    </div>
  );
}
