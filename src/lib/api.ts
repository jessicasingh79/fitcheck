import { supabase, getSessionId } from "./supabase";
import type { AnalysisResult, Scan, ApplicationStatus } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function analyzeJobFit(
  jobDescription: string,
  resume: string,
  additionalContext?: string
): Promise<AnalysisResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-fit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ jobDescription, resume, additionalContext: additionalContext?.trim() || undefined }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Analysis failed");
  }

  return response.json();
}

export async function saveScan(
  jobDescription: string,
  resume: string,
  result: AnalysisResult,
  companyName?: string,
  roleTitle?: string,
  additionalContext?: string
): Promise<Scan> {
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from("scans")
    .insert({
      job_description: jobDescription,
      resume,
      fit_score: result.fitScore,
      strengths: result.strengths,
      gaps: result.gaps,
      pitch: result.pitch,
      session_id: sessionId,
      status: "pending",
      company_name: companyName?.trim() || null,
      role_title: roleTitle?.trim() || null,
      additional_context: additionalContext?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Scan;
}

export async function fetchScans(): Promise<Scan[]> {
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Scan[];
}

export async function updateScan(
  id: string,
  updates: Partial<Pick<Scan, "company_name" | "role_title" | "status" | "cover_letter">>
): Promise<void> {
  const { error } = await supabase.from("scans").update(updates).eq("id", id);
  if (error) throw error;
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export function getScoreBorderColor(score: number): string {
  if (score >= 75) return "border-emerald-400";
  if (score >= 50) return "border-amber-400";
  return "border-red-400";
}

export function getScoreBgColor(score: number): string {
  if (score >= 75) return "bg-emerald-400";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-400";
}

export function getScoreLabel(score: number): string {
  if (score >= 75) return "Your Lane";
  if (score >= 50) return "Stretch";
  return "Hard No";
}

export function getStatusLabel(status: ApplicationStatus): string {
  if (status === "got_a_call") return "Got a Call";
  if (status === "no_response") return "No Response";
  return "Pending";
}

export function getStatusColor(status: ApplicationStatus): string {
  if (status === "got_a_call") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  if (status === "no_response") return "text-red-400 bg-red-400/10 border-red-400/30";
  return "text-zinc-400 bg-zinc-400/10 border-zinc-400/30";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateCoverLetter(context: {
  jobDescription: string;
  resume: string;
  strengths: string[];
  gaps: string[];
  pitch: string;
}): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-cover-letter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Cover letter generation failed");
  }

  const data = await response.json();
  return (data as { coverLetter: string }).coverLetter;
}
