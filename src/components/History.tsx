import { ClipboardList } from "lucide-react";
import { ScanCard } from "./ScanCard";
import type { Scan } from "../types";

interface HistoryProps {
  scans: Scan[];
  onUpdate: (id: string, updates: Partial<Scan>) => void;
}

export function History({ scans, onUpdate }: HistoryProps) {
  if (scans.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-zinc-600" />
        </div>
        <div>
          <p className="text-zinc-400 font-medium">No scans yet</p>
          <p className="text-sm text-zinc-600 mt-1">
            Run your first analysis in the Scanner tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          {scans.length} {scans.length === 1 ? "Scan" : "Scans"}
        </h2>
      </div>
      {scans.map((scan) => (
        <ScanCard key={scan.id} scan={scan} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
