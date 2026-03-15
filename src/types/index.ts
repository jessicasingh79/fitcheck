export type ApplicationStatus = "pending" | "got_a_call" | "no_response";

export interface Scan {
  id: string;
  created_at: string;
  job_description: string;
  resume: string;
  fit_score: number;
  strengths: string[];
  gaps: string[];
  pitch: string;
  company_name: string | null;
  role_title: string | null;
  status: ApplicationStatus;
  session_id: string;
  cover_letter: string | null;
  additional_context: string | null;
}

export interface AnalysisResult {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  pitch: string;
}

export type View = "scanner" | "history" | "dashboard";
