import { useState } from "react";
import { ChevronDown, ChevronUp, Building2, Briefcase } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { AnalysisCard } from "./AnalysisCard";
import { updateScan, getStatusColor, getStatusLabel, formatDate } from "../lib/api";
import type { Scan, ApplicationStatus } from "../types";

interface ScanCardProps {
  scan: Scan;
  onUpdate: (id: string, updates: Partial<Scan>) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = ["pending", "got_a_call", "no_response"];

export function ScanCard({ scan, onUpdate }: ScanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [company, setCompany] = useState(scan.company_name ?? "");
  const [role, setRole] = useState(scan.role_title ?? "");
  const [saving, setSaving] = useState(false);

  function handleExpand() {
    setExpanded((prev) => !prev);
  }

  async function handleFieldBlur(field: "company_name" | "role_title", value: string) {
    const trimmed = value.trim();
    const prev = field === "company_name" ? scan.company_name : scan.role_title;
    if (trimmed === (prev ?? "")) return;
    setSaving(true);
    try {
      await updateScan(scan.id, { [field]: trimmed || null });
      onUpdate(scan.id, { [field]: trimmed || null });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: ApplicationStatus) {
    setSaving(true);
    try {
      await updateScan(scan.id, { status });
      onUpdate(scan.id, { status });
    } finally {
      setSaving(false);
    }
  }

  function handleCoverLetterSaved(text: string) {
    onUpdate(scan.id, { cover_letter: text });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-200">
      <div className="p-4 flex items-center gap-4">
        <ScoreRing score={scan.fit_score} size="sm" />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onBlur={() => handleFieldBlur("company_name", company)}
                placeholder="Company name"
                className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-600 transition-colors min-w-0 w-32"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => handleFieldBlur("role_title", role)}
                placeholder="Role title"
                className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-zinc-600 transition-colors min-w-0 w-32"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">{formatDate(scan.created_at)}</span>
            <span className="text-zinc-700">·</span>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-all font-medium ${
                    scan.status === s
                      ? getStatusColor(s)
                      : "text-zinc-600 border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleExpand}
          className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 p-4">
          <AnalysisCard
            result={{
              fitScore: scan.fit_score,
              strengths: scan.strengths,
              gaps: scan.gaps,
              pitch: scan.pitch,
            }}
            scanContext={{
              jobDescription: scan.job_description,
              resume: scan.resume,
              strengths: scan.strengths,
              gaps: scan.gaps,
              pitch: scan.pitch,
            }}
            scanId={scan.id}
            savedCoverLetter={scan.cover_letter}
            onCoverLetterSaved={handleCoverLetterSaved}
          />
        </div>
      )}
    </div>
  );
}
