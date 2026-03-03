"use client";

import { useRef, type ChangeEvent } from "react";
import { Dashboard } from "@/components/Dashboard";
import { ChatPanel } from "@/components/ChatPanel";
import { DatasetProvider, useDataset } from "@/lib/dataset-context";
import { Activity, Upload, Download, Database } from "lucide-react";

function DataSourceControl() {
  const { source, csvFilename, skippedRows, parseErrors, loadCSV, useDummy } = useDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadCSV(file);
    // Reset so the same file can be re-uploaded if needed
    e.target.value = "";
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Download sample */}
      <a
        href="/sample_studio_data.csv"
        download="sample_studio_data.csv"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        <Download className="h-3.5 w-3.5" />
        Download sample CSV
      </a>

      {/* Upload CSV */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
      >
        <Upload className="h-3.5 w-3.5" />
        Upload CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload CSV file"
      />

      {/* Status badge */}
      <div className="flex items-center gap-2">
        {source === "csv" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Using CSV: {csvFilename}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Database className="h-3 w-3" />
            Using dummy data
          </span>
        )}

        {skippedRows > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {skippedRows} row{skippedRows !== 1 ? "s" : ""} skipped
          </span>
        )}
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <p className="w-full text-xs text-red-600 dark:text-red-400">
          {parseErrors.join(" · ")}
        </p>
      )}

      {/* Use dummy data fallback (only visible when CSV is active) */}
      {source === "csv" && (
        <button
          type="button"
          onClick={useDummy}
          className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          Use dummy data
        </button>
      )}
    </div>
  );
}

function AppShell() {
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
        <main className="min-w-0 flex-1 space-y-6">
          {/* Data source control bar */}
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Overview
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Upload your own data or explore with the sample dataset
                </p>
              </div>
            </div>
            <DataSourceControl />
          </div>

          <Dashboard />
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

export default function Home() {
  return (
    <DatasetProvider>
      <AppShell />
    </DatasetProvider>
  );
}
