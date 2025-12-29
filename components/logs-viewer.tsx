"use client";

import { useState, useEffect } from "react";
import { apiClient, type Log } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LogsViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLogs(limit, offset);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'auth-service': 'bg-blue-100 text-blue-800',
      'crud-service': 'bg-green-100 text-green-800',
      'logging-service': 'bg-purple-100 text-purple-800',
      'api-gateway': 'bg-orange-100 text-orange-800',
    };
    return colors[service] || 'bg-gray-100 text-gray-800';
  };

  if (loading && logs.length === 0) {
    return <div className="p-4">Loading logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Logs</CardTitle>
        <CardDescription>View activity logs from all services</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        
        <div className="space-y-2 mb-4">
          {logs.map((log) => (
            <div key={log.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getServiceColor(log.service)}`}>
                    {log.service}
                  </span>
                  <span className="font-medium">{log.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </div>
              {log.details && (
                <p className="text-sm text-muted-foreground">{log.details}</p>
              )}
              {log.user_id && (
                <p className="text-xs text-muted-foreground">User ID: {log.user_id}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} logs
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

