"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ClassSession, ChangelogEntry } from "./data";
import { generateDummyData, computeChangelog } from "./data";
import { parseCSV } from "./csv-parser";

export type DataSource = "dummy" | "csv";

interface DatasetState {
  sessions: ClassSession[];
  changelog: ChangelogEntry[];
  source: DataSource;
  csvFilename: string | null;
  skippedRows: number;
  parseErrors: string[];
}

interface DatasetContextValue extends DatasetState {
  loadCSV: (file: File) => Promise<void>;
  useDummy: () => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

function makeDummyState(): DatasetState {
  const sessions = generateDummyData(42);
  return {
    sessions,
    changelog: computeChangelog(sessions),
    source: "dummy",
    csvFilename: null,
    skippedRows: 0,
    parseErrors: [],
  };
}

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DatasetState>(makeDummyState);

  const loadCSV = useCallback(async (file: File) => {
    const text = await file.text();
    const result = parseCSV(text);

    if (result.errors.length > 0) {
      setState((s) => ({ ...s, parseErrors: result.errors }));
      return;
    }

    const { sessions, skipped } = result;
    setState({
      sessions,
      changelog: computeChangelog(sessions),
      source: "csv",
      csvFilename: file.name,
      skippedRows: skipped,
      parseErrors: [],
    });
  }, []);

  const useDummy = useCallback(() => {
    setState(makeDummyState());
  }, []);

  return (
    <DatasetContext.Provider value={{ ...state, loadCSV, useDummy }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within DatasetProvider");
  return ctx;
}
