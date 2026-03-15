import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import { Nav } from "./components/Nav";
import { Scanner } from "./components/Scanner";
import { History } from "./components/History";
import { Dashboard } from "./components/Dashboard";
import { fetchScans } from "./lib/api";
import type { View, Scan } from "./types";

export default function App() {
  const [view, setView] = useState<View>("scanner");
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    fetchScans()
      .then(setScans)
      .catch(console.error)
      .finally(() => setLoadingScans(false));
  }, []);

  function handleScanSaved(scan: Scan) {
    setScans((prev) => [scan, ...prev]);
  }

  function handleScanUpdate(id: string, updates: Partial<Scan>) {
    setScans((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              FitCheck
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">AI-powered job fit analyzer</p>
          </div>
        </header>

        <Nav current={view} onChange={setView} />

        <main>
          {view === "scanner" && (
            <Scanner onScanSaved={handleScanSaved} onScanUpdate={handleScanUpdate} />
          )}
          {view === "history" && (
            loadingScans ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl h-20" />
                ))}
              </div>
            ) : (
              <History scans={scans} onUpdate={handleScanUpdate} />
            )
          )}
          {view === "dashboard" && (
            loadingScans ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-zinc-900 rounded-xl h-20" />
                ))}
              </div>
            ) : (
              <Dashboard scans={scans} />
            )
          )}
        </main>
      </div>
    </div>
  );
}
