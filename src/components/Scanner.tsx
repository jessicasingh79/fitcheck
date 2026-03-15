import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { analyzeJobFit, saveScan } from "../lib/api";
import { AnalysisCard } from "./AnalysisCard";
import type { AnalysisResult, Scan } from "../types";

interface ScannerProps {
  onScanSaved: (scan: Scan) => void;
  onScanUpdate?: (id: string, updates: Partial<Scan>) => void;
}

export function Scanner({ onScanSaved, onScanUpdate }: ScannerProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedScanId, setSavedScanId] = useState<string | null>(null);

  const canSubmit = jobDescription.trim().length > 20 && resume.trim().length > 20 && !loading;

  async function handleAnalyze() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeJobFit(jobDescription, resume, additionalContext);
      setResult(analysis);
      const saved = await saveScan(jobDescription, resume, analysis, companyName, roleTitle, additionalContext);
      setSavedScanId(saved.id);
      onScanSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!result && (
        <div className="text-center pt-4 pb-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
            Stop guessing. Know if a job is worth applying to&nbsp;—&nbsp;before you write a single word.
          </h1>
          <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Paste a job description and your resume. Get an honest fit score, gap analysis, and a ready-to-use cover letter.
          </p>
        </div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Company Name <span className="text-zinc-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Role Title <span className="text-zinc-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Engineer"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Your Resume / Background
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume, LinkedIn summary, or describe your experience..."
            rows={8}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Additional context <span className="text-zinc-600 normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Projects, volunteer work, publications, or anything your resume doesn't capture."
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-y focus:outline-none focus:border-zinc-600 transition-colors leading-relaxed"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze My Fit
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-center py-4">
            <div className="w-32 h-32 rounded-full bg-zinc-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 rounded-xl h-40" />
            <div className="bg-zinc-900 rounded-xl h-40" />
          </div>
          <div className="bg-zinc-900 rounded-xl h-20" />
        </div>
      )}

      {result && !loading && (
        <AnalysisCard
          result={result}
          scanContext={{
            jobDescription,
            resume,
            strengths: result.strengths,
            gaps: result.gaps,
            pitch: result.pitch,
          }}
          scanId={savedScanId ?? undefined}
          onCoverLetterSaved={(text) => {
            if (savedScanId) onScanUpdate?.(savedScanId, { cover_letter: text });
          }}
        />
      )}
    </div>
  );
}
