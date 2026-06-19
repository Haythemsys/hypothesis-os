import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Tone = "primary" | "ghost" | "quiet" | "danger";
const CLS: Record<Tone, string> = {
  primary: "btn-primary", ghost: "btn-ghost", quiet: "btn-quiet", danger: "btn-danger",
};

export function Button({
  tone = "primary", className = "", children, ...rest
}: { tone?: Tone; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${CLS[tone]} ${className}`} {...rest}>{children}</button>;
}

export function ButtonLink({
  tone = "primary", className = "", href, children,
}: { tone?: Tone; className?: string; href: string; children: ReactNode }) {
  return <Link href={href} className={`${CLS[tone]} ${className}`}>{children}</Link>;
}
