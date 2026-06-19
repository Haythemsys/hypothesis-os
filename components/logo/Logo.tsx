import Link from "next/link";
import { Mark } from "./Mark";

// Full logo: Signal Vertex mark + wordmark. "Hypothesis" ivory, "OS" amber.
export function Logo({ size = 24, href = "/", className = "", showWord = true }: {
  size?: number; href?: string; className?: string; showWord?: boolean;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark size={size} />
      {showWord && (
        <span className="text-[15px] font-bold tracking-tight text-ivory">
          Hypothesis<span className="text-amber">OS</span>
        </span>
      )}
    </span>
  );
  return href ? <Link href={href} aria-label="HypothesisOS home">{inner}</Link> : inner;
}
