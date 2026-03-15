import { getScoreColor, getScoreBorderColor, getScoreLabel } from "../lib/api";

interface ScoreRingProps {
  score: number;
  size?: "lg" | "sm";
}

export function ScoreRing({ score, size = "lg" }: ScoreRingProps) {
  const radius = size === "lg" ? 54 : 28;
  const stroke = size === "lg" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const dim = (radius + stroke) * 2;

  const colorClass = getScoreColor(score);
  const borderColorClass = getScoreBorderColor(score);

  const strokeColor =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`font-bold text-sm ${colorClass}`}>{score}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative rounded-full border-2 ${borderColorClass} p-1`}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${colorClass}`}>{score}</span>
          <span className="text-xs text-zinc-500 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold uppercase tracking-widest ${colorClass}`}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
