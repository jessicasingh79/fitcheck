import { Zap, ClipboardList, BarChart2 } from "lucide-react";
import type { View } from "../types";

interface NavProps {
  current: View;
  onChange: (view: View) => void;
}

const TABS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "scanner", label: "Scanner", icon: <Zap className="w-4 h-4" /> },
  { id: "history", label: "History", icon: <ClipboardList className="w-4 h-4" /> },
  { id: "dashboard", label: "Dashboard", icon: <BarChart2 className="w-4 h-4" /> },
];

export function Nav({ current, onChange }: NavProps) {
  return (
    <nav className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
            current === tab.id
              ? "bg-white text-zinc-900"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
