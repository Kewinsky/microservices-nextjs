import { ItemsManager } from "@/components/items-manager";

export default function ItemsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Items Management</h1>
      <ItemsManager />
    </div>
  );
}

