"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "▦" },
  { href: "/lab", label: "Lab", icon: "⚗" },
  { href: "/experiments", label: "Tests", icon: "⚙" },
  { href: "/evidence", label: "Evidence", icon: "⚖" },
  { href: "/graph", label: "Graph", icon: "◉" },
  { href: "/archive", label: "Archive", icon: "▤" },
  { href: "/benchmark", label: "Bench", icon: "✓" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-ink/95 backdrop-blur">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between overflow-x-auto px-1 py-1">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] ${
                  active ? "text-white" : "text-gray-500"}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
