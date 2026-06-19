"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./nav-items";

// Mobile bottom dock — thumb-reachable, 5 zones, amber active marker.
export function BottomDock({ onCommand }: { onCommand: () => void }) {
  const path = usePathname();
  const items = NAV_ITEMS.filter((i) => i.dock);
  return (
    <nav
      data-shell
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-hair bg-obsidian/95 pb-[max(env(safe-area-inset-bottom),4px)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-2 py-1">
        {items.map((t) => {
          const active = isActive(path, t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[56px] select-none flex-col items-center justify-center gap-0.5 rounded-btn text-[10px] transition-colors active:bg-white/10 ${
                  active ? "text-ivory" : "text-slate"
                }`}
              >
                {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-amber" />}
                <span className={`text-xl leading-none ${active ? "text-amber" : ""}`}>{t.icon}</span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
