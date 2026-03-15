import { useState } from "react";
import { CheckCircle, XCircle, MessageSquare, FileText, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { generateCoverLetter, updateScan } from "../lib/api";
import type { AnalysisResult } from "../types";

interface ScanContext {
  jobDescription: string;
  resume: string;
  strengths: string[];
  gaps: string[];
  pitch: string;
}

interface AnalysisCardProps {
  result: AnalysisResult;
  scanContext?: ScanContext;
  scanId?: string;
  savedCoverLetter?: string | null;
  onCoverLetterSaved?: (text: string) => void;
}

export function AnalysisCard({
  result,
  scanContext,
  scanId,
  savedCoverLetter,
  onCoverLetterSaved,
}: AnalysisCardProps) {
  const [coverLetter, setCoverLetter] = useState<string | null>(savedCoverLetter ?? null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerateCoverLetter() {
    if (!scanContext) return;
    setGenerating(true);
    setGenError(null);
    try {
      const text = await generateCoverLetter(scanContext);
      setCoverLetter(text);
      if (scanId) {
        await updateScan(scanId, { cover_letter: text });
        onCoverLetterSaved?.(text);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-center py-4">
        <ScoreRing score={result.fitScore} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Strengths
            </h3>
          </div>
          <ul className="space-y-3">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Gaps
            </h3>
          </div>
          <ul className="space-y-3">
            {result.gaps.map((g, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Lead with this in your cover letter
          </h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed italic">
          "{result.pitch}"
        </p>
      </div>

      {scanContext && (
        <div className="space-y-4">
          {!coverLetter && result.fitScore < 50 && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300 leading-relaxed">
                This role scored below 50 (Hard No). Generating a cover letter is not recommended — but you can still do it.
              </p>
            </div>
          )}

          {!coverLetter && (
            <button
              onClick={handleGenerateCoverLetter}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-200 bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating cover letter...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Cover Letter
                </>
              )}
            </button>
          )}

          {genError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {genError}
            </div>
          )}

          {coverLetter && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Cover Letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generating}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40"
                  >
                    {generating ? "Regenerating..." : "Regenerate"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-zinc-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={coverLetter}
                rows={14}
                className="w-full bg-transparent px-5 py-4 text-sm text-zinc-300 leading-relaxed resize-none focus:outline-none font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
