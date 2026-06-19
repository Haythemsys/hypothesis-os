// SVG progress ring (health). Amber arc on a graphite track.
export function Ring({ value, size = 72, stroke = 7, label, sublabel }: {
  value: number; size?: number; stroke?: number; label?: string; sublabel?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262B35" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8A23D" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && <span className="data text-lg font-semibold text-ivory">{label}</span>}
        {sublabel != null && <span className="text-[9px] uppercase tracking-wide text-slate">{sublabel}</span>}
      </div>
    </div>
  );
}
