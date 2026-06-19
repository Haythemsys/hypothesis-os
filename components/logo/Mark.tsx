// Signal Vertex — evidence flows in, reaches a decision node, branches.
// GO ray rises (amber), KILL ray falls (steel). mono = single currentColor.
export function Mark({ size = 24, variant = "color", className = "" }: {
  size?: number; variant?: "color" | "mono"; className?: string;
}) {
  const go = variant === "mono" ? "currentColor" : "#E8A23D";
  const kill = variant === "mono" ? "currentColor" : "#A4ADBC";
  const node = variant === "mono" ? "currentColor" : "#F2EFE9";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      className={className} aria-hidden role="img"
      style={variant === "mono" ? { opacity: 1 } : undefined}>
      {/* incoming evidence path */}
      <path d="M3 16 H13" stroke={kill} strokeWidth="2.4" strokeLinecap="round" opacity={variant === "mono" ? 0.7 : 0.9} />
      {/* KILL ray (falls) */}
      <path d="M13 16 L28 23" stroke={kill} strokeWidth="2.4" strokeLinecap="round" opacity={variant === "mono" ? 0.5 : 1} />
      {/* GO ray (rises) — the chosen/emphasized direction */}
      <path d="M13 16 L28 9" stroke={go} strokeWidth="2.6" strokeLinecap="round" />
      {/* decision node */}
      <circle cx="13" cy="16" r="3.1" fill={node} />
    </svg>
  );
}
