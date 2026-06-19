import type { ReactNode } from "react";

type Variant = "base" | "flat" | "raised" | "accent";
const CLS: Record<Variant, string> = {
  base: "card", flat: "card-flat", raised: "card-raised", accent: "card-accent",
};

export function Card({
  variant = "base", className = "", children, as: As = "section",
}: {
  variant?: Variant; className?: string; children: ReactNode; as?: any;
}) {
  return <As className={`${CLS[variant]} ${className}`}>{children}</As>;
}

export function CardLabel({ children }: { children: ReactNode }) {
  return <div className="label">{children}</div>;
}
