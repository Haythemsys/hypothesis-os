// Verdict + Bar primitives. Glyph system: GO ◆ · UNRESOLVED ◇ · KILL ✕
// Verdict is always communicated by three channels (color + glyph + label).

const GLYPH: Record<string, string> = { GO: "◆", UNRESOLVED: "◇", KILL: "✕" };

export function VerdictPill({ verdict, size = "sm" }: { verdict: string; size?: "sm" | "md" }) {
  const g = GLYPH[verdict] ?? "·";
  const cls = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span className={`pill verdict-${verdict} ${cls}`} aria-label={`Verdict: ${verdict}`}>
      <span aria-hidden>{g}</span>
      {verdict}
    </span>
  );
}

export function Bar({ value, label, tone = "neutral" }: { value: number; label?: string; tone?: "neutral" | "amber" | "go" | "kill" }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const fill =
    tone === "amber" ? "bg-amber" : tone === "go" ? "bg-go" : tone === "kill" ? "bg-kill" : "bg-steel";
  return (
    <div className="space-y-1">
      {label != null && label !== "" && (
        <div className="flex justify-between text-xs text-steel">
          <span>{label}</span>
          <span className="data">{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${fill} transition-[width] duration-300 ease-signal`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
