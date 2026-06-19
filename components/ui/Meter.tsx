// Horizontal meter with amber→kill gradient by fill %. Used for evidence debt / health.
export function Meter({ value, tone = "debt", className = "" }: { value: number; tone?: "debt" | "amber" | "go"; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(100, value)));
  const bg =
    tone === "go" ? "bg-go"
    : tone === "amber" ? "bg-amber"
    : pct >= 60 ? "bg-kill" : pct >= 30 ? "bg-amber" : "bg-go"; // debt: low debt = green
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-white/8 ${className}`}>
      <div className={`h-full rounded-full ${bg} transition-[width] duration-500 ease-signal`} style={{ width: `${pct}%` }} />
    </div>
  );
}
