"use client";

import { useState, useCallback } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ChatPanel } from "@/components/ChatPanel";

export default function Home() {
  const [regenerating, setRegenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      await fetch("/api/regenerate", { method: "POST" });
      setRefreshKey((k) => k + 1);
    } finally {
      setRegenerating(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Studio Revenue Copilot
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Dashboard and AI copilot for class revenue and fill rates
        </p>
      </header>

      <div className="flex flex-col gap-6 p-6 lg:flex-row">
        <main className="min-w-0 flex-1" key={refreshKey}>
          <Dashboard onRegenerate={handleRegenerate} regenerating={regenerating} />
        </main>
        <aside className="w-full lg:w-[380px] lg:min-w-[380px] lg:sticky lg:top-6">
          <div className="h-[600px] lg:h-[calc(100vh-8rem)]">
            <ChatPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
