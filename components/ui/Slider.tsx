"use client";
// Touch-optimized evidence slider with live monospace value.
export function Slider({ label, value, onChange, hint }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string;
}) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-ivory">{label}</span>
        <span className="data text-sm text-amber">{value.toFixed(2)}</span>
      </div>
      {hint && <p className="text-[11px] text-slate-dim">{hint}</p>}
      <div className="relative mt-1.5 h-9 w-full">
        {/* track */}
        <div className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-amber/70" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range" min={0} max={1} step={0.01} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent accent-amber"
        />
      </div>
    </div>
  );
}

export function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-between rounded-btn border border-border-hair px-3 py-2 text-left text-sm text-ivory transition-colors active:bg-white/5"
    >
      <span className="pr-2 leading-snug">{label}</span>
      <span className={`pill shrink-0 ${on ? "verdict-GO" : "bg-white/10 text-slate"}`}>{on ? "YES" : "NO"}</span>
    </button>
  );
}
