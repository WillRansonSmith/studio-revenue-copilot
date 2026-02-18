"use client";

import { useState, useCallback } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ChatPanel } from "@/components/ChatPanel";
import { Activity } from "lucide-react";

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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Studio Revenue Copilot
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time analytics and AI-powered revenue insights
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:flex-row">
        <main className="min-w-0 flex-1" key={refreshKey}>
          <Dashboard onRegenerate={handleRegenerate} regenerating={regenerating} />
        </main>
        <aside className="w-full lg:sticky lg:top-[4.5rem] lg:w-[400px] lg:min-w-[400px] lg:self-start">
          <div className="h-[600px] lg:h-[calc(100vh-6rem)]">
            <ChatPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
