import InventoryList from "../components/inventory/InventoryList";
import RecruitList from "../components/recruits/RecruitList";

export default function InventoryPage() {
  return (
    <div>
      <h1 className="page__title">Inventario</h1>
      <InventoryList />
      <RecruitList />
    </div>
  );
}
