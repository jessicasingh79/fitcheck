import { BarChart2 } from "lucide-react";
import { getScoreColor } from "../lib/api";
import type { Scan } from "../types";

interface DashboardProps {
  scans: Scan[];
}

function DonutChart({ got, noResponse, pending }: { got: number; noResponse: number; pending: number }) {
  const total = got + noResponse + pending;
  if (total === 0) return null;

  const radius = 52;
  const cx = 68;
  const cy = 68;
  const circumference = 2 * Math.PI * radius;

  const gotPct = got / total;
  const noPct = noResponse / total;
  const pendPct = pending / total;

  const gotDash = gotPct * circumference;
  const noDash = noPct * circumference;
  const pendDash = pendPct * circumference;

  const gotOffset = 0;
  const noOffset = -(gotDash);
  const pendOffset = -(gotDash + noDash);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={136} height={136} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#27272a" strokeWidth={14} />
        {got > 0 && (
          <circle
            cx={cx} cy={cy} r={radius} fill="none"
            stroke="#34d399" strokeWidth={14}
            strokeDasharray={`${gotDash} ${circumference}`}
            strokeDashoffset={gotOffset}
            strokeLinecap="butt"
          />
        )}
        {noResponse > 0 && (
          <circle
            cx={cx} cy={cy} r={radius} fill="none"
            stroke="#f87171" strokeWidth={14}
            strokeDasharray={`${noDash} ${circumference}`}
            strokeDashoffset={noOffset}
            strokeLinecap="butt"
          />
        )}
        {pending > 0 && (
          <circle
            cx={cx} cy={cy} r={radius} fill="none"
            stroke="#52525b" strokeWidth={14}
            strokeDasharray={`${pendDash} ${circumference}`}
            strokeDashoffset={pendOffset}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-zinc-400">Got a Call ({got})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-zinc-400">No Response ({noResponse})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          <span className="text-zinc-400">Pending ({pending})</span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  score,
  roleTitle,
  companyName,
  fallbackLabel,
}: {
  score: number;
  roleTitle?: string | null;
  companyName?: string | null;
  fallbackLabel: string;
}) {
  const colorClass = getScoreColor(score);
  const barColor = score >= 75 ? "bg-emerald-400" : score >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          {roleTitle ? (
            <>
              <p className="text-sm font-medium text-zinc-200 truncate leading-snug">{roleTitle}</p>
              {companyName && (
                <p className="text-xs text-zinc-500 truncate leading-snug">{companyName}</p>
              )}
            </>
          ) : companyName ? (
            <p className="text-sm font-medium text-zinc-200 truncate leading-snug">{companyName}</p>
          ) : (
            <p className="text-xs text-zinc-400 truncate leading-snug">{fallbackLabel}</p>
          )}
        </div>
        <span className={`text-sm font-bold shrink-0 ${colorClass}`}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard({ scans }: DashboardProps) {
  if (scans.length === 0) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-zinc-600" />
        </div>
        <div>
          <p className="text-zinc-400 font-medium">No data yet</p>
          <p className="text-sm text-zinc-600 mt-1">
            Your dashboard will populate as you run scans.
          </p>
        </div>
      </div>
    );
  }

  const total = scans.length;
  const got = scans.filter((s) => s.status === "got_a_call").length;
  const noResponse = scans.filter((s) => s.status === "no_response").length;
  const pending = scans.filter((s) => s.status === "pending").length;
  const responded = got + noResponse;
  const responseRate = responded > 0 ? Math.round((got / responded) * 100) : 0;

  const highFitScans = scans.filter((s) => s.fit_score >= 75);
  const topSkill = (() => {
    if (highFitScans.length < 2) return null;
    const stopWords = new Set([
      "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","as","is","was","are","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used","you","your","i","my","we","our","they","their","it","its","that","this","these","those","which","who","what","how","when","where","why","not","no","nor","so","yet","both","either","neither","each","few","more","most","other","some","such","than","too","very","just","also","well","able","experience","strong","proven","including","using","across","within","through","skills","skill","ability","work","working","team","role","role-specific","years","background","knowledge","understanding",
    ]);
    const counts = new Map<string, number>();
    for (const scan of highFitScans) {
      for (const phrase of scan.strengths) {
        const tokens = phrase.toLowerCase().match(/\b[a-z][a-z0-9.+#-]{1,}\b/g) ?? [];
        for (const token of tokens) {
          if (!stopWords.has(token)) {
            counts.set(token, (counts.get(token) ?? 0) + 1);
          }
        }
      }
    }
    if (counts.size === 0) return null;
    let best = "";
    let bestCount = 0;
    for (const [term, count] of counts) {
      if (count > bestCount) { bestCount = count; best = term; }
    }
    return best || null;
  })();

  const recentScans = [...scans].slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Scans" value={total} />
        <StatCard
          label="Top Matched Skill"
          value={topSkill ?? "Scan more roles to see trends"}
          valueColor={topSkill ? "text-emerald-400" : "text-zinc-500"}
          small={!topSkill}
        />
        <StatCard label="Interviews" value={got} valueColor="text-emerald-400" />
        <StatCard
          label="Interview Rate"
          value={`${responseRate}%`}
          valueColor={responseRate >= 30 ? "text-emerald-400" : responseRate >= 10 ? "text-amber-400" : "text-zinc-300"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
            Application Breakdown
          </h3>
          <DonutChart got={got} noResponse={noResponse} pending={pending} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-5">
            Recent Fit Scores
          </h3>
          <div className="space-y-4">
            {recentScans.map((scan) => (
              <ScoreBar
                key={scan.id}
                score={scan.fit_score}
                roleTitle={scan.role_title}
                companyName={scan.company_name}
                fallbackLabel={new Date(scan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = "text-white",
  small = false,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-black leading-tight ${small ? "text-sm" : "text-2xl"} ${valueColor}`}>{value}</p>
    </div>
  );
}
