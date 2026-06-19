import type { ReactNode } from "react";

type Tone = "neutral" | "go" | "kill" | "amber" | "muted";
const CLS: Record<Tone, string> = {
  neutral: "bg-white/10 text-ivory",
  go: "verdict-GO",
  kill: "verdict-KILL",
  amber: "bg-amber/15 text-amber",
  muted: "bg-white/5 text-slate",
};

export function Pill({ tone = "neutral", className = "", children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={`pill ${CLS[tone]} ${className}`}>{children}</span>;
}

// Risk level → pill tone
export function RiskPill({ level }: { level: string }) {
  const tone: Tone = level === "LOW" ? "go" : level === "MEDIUM" ? "amber" : "kill";
  return <Pill tone={tone}>{level}</Pill>;
}
