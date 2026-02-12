"use client";

import { useEffect, useState } from "react";

interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export default function AdminQueuePage() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/queue/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleObliterate = async () => {
    if (!confirm("This will destroy all queue data. Continue?")) return;
    await fetch("/api/queue/obliterate", { method: "POST" });
    fetchStatus();
  };

  if (loading) {
    return <div className="animate-pulse">Loading queue status...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl poem-title">Queue Monitor</h1>
        <button
          onClick={handleObliterate}
          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Obliterate Queue
        </button>
      </div>

      {status && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(status).map(([key, value]) => (
            <div key={key} className="card p-4 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-charcoal-light capitalize">{key}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
