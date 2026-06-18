export function VerdictPill({ verdict }: { verdict: string }) {
  return <span className={`pill verdict-${verdict}`}>{verdict}</span>;
}

export function Bar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-black/40">
        <div className="h-2 rounded-full bg-white/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
