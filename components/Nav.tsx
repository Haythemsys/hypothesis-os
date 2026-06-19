"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Primary bottom nav — 5 thumb-reachable destinations. Everything else lives in "More".
const TABS = [
  { href: "/", label: "Home", icon: "▦" },
  { href: "/workflow", label: "Workflow", icon: "⚡" },
  { href: "/evidence", label: "Analyze", icon: "⚖" },
  { href: "/benchmark", label: "Bench", icon: "✓" },
  { href: "/more", label: "More", icon: "⋯" },
];
const MORE_PATHS = ["/lab", "/experiments", "/audit", "/graph", "/memory", "/archive", "/settings", "/governance", "/more", "/dashboard", "/compare", "/report"];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 py-1">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/"
            : t.href === "/more" ? MORE_PATHS.some((p) => path.startsWith(p))
            : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} aria-current={active ? "page" : undefined}
                className={`flex min-h-[54px] select-none flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] active:bg-white/10 ${
                  active ? "text-white" : "text-gray-500"}`}>
                <span className="text-xl leading-none">{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
