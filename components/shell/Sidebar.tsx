"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SIDEBAR_EXTRA, isActive, type NavItem } from "./nav-items";
import { Mark } from "@/components/logo/Mark";

// Desktop sidebar — 64px icon strip, expands to 220px on hover (overlay, no push).
export function Sidebar({ onCommand }: { onCommand: () => void }) {
  const path = usePathname();
  return (
    <aside
      data-shell
      className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-border-hair bg-obsidian transition-[width] duration-200 ease-signal hover:w-[220px] lg:flex"
    >
      {/* Logo — always returns to home (landing) */}
      <Link href="/" aria-label="HypothesisOS home" className="flex h-12 items-center gap-2 px-[18px]">
        <Mark size={24} />
        <span className="whitespace-nowrap text-sm font-bold tracking-tight text-ivory opacity-0 transition-opacity group-hover:opacity-100">
          Hypothesis<span className="text-amber">OS</span>
        </span>
      </Link>

      <div className="mt-2 flex flex-1 flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((t) => <Item key={t.href} t={t} active={isActive(path, t.href)} />)}
        <div className="my-2 h-px bg-border-hair" />
        {SIDEBAR_EXTRA.map((t) => <Item key={t.href} t={t} active={isActive(path, t.href)} />)}
      </div>

      {/* Command palette trigger */}
      <button
        onClick={onCommand}
        className="m-2 flex min-h-11 items-center gap-3 rounded-btn px-3 text-slate transition-colors hover:bg-white/5 hover:text-ivory"
      >
        <span className="w-6 shrink-0 text-center text-lg">⌘</span>
        <span className="whitespace-nowrap text-sm opacity-0 transition-opacity group-hover:opacity-100">Command</span>
      </button>
    </aside>
  );
}

function Item({ t, active }: { t: NavItem; active: boolean }) {
  return (
    <Link
      href={t.href}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-h-11 items-center gap-3 rounded-btn px-3 transition-colors ${
        active ? "bg-white/5 text-ivory" : "text-slate hover:bg-white/5 hover:text-ivory"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber" />}
      <span className={`w-6 shrink-0 text-center text-lg ${active ? "text-amber" : ""}`}>{t.icon}</span>
      <span className="whitespace-nowrap text-sm opacity-0 transition-opacity group-hover:opacity-100">{t.label}</span>
    </Link>
  );
}
