import { LogsViewer } from "@/components/logs-viewer";

export default function LogsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Logs</h1>
      <LogsViewer />
    </div>
  );
}

