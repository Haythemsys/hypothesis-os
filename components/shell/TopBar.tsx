"use client";
import Link from "next/link";
import { Mark } from "@/components/logo/Mark";

export function TopBar({ onCommand }: { onCommand: () => void }) {
  return (
    <header
      data-shell
      className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border-hair bg-obsidian/95 px-4 backdrop-blur lg:h-14 lg:gap-3 lg:px-5"
    >
      {/* Mobile brand — always returns to landing */}
      <Link
        href="/"
        aria-label="HypothesisOS home"
        className="flex shrink-0 items-center gap-2 lg:hidden"
      >
        <Mark size={20} />
        <span className="text-sm font-bold tracking-tight text-ivory">
          Hypothesis<span className="text-amber">OS</span>
        </span>
      </Link>

      {/* Desktop: per-page context injection slot */}
      <div id="topbar-slot" className="hidden min-w-0 flex-1 items-center gap-3 lg:flex" />

      {/* Mobile spacer */}
      <div className="flex-1 lg:hidden" />

      {/* Action cluster */}
      <div className="flex shrink-0 items-center gap-1 lg:gap-1.5">
        {/* Global Search */}
        <button
          onClick={onCommand}
          aria-label="Global search (⌘K)"
          title="Search (⌘K)"
          className="flex h-8 items-center gap-1.5 rounded-btn border border-border-hair px-2.5 text-xs text-slate transition-colors hover:border-amber/40 hover:text-ivory"
        >
          <span className="hidden text-[11px] sm:inline">Search</span>
          <span className="font-mono text-xs opacity-70">⌘K</span>
        </button>

        {/* New Decision */}
        <Link
          href="/workflow"
          className="hidden h-8 items-center rounded-btn bg-amber px-3 text-xs font-semibold text-obsidian transition-colors hover:bg-amber-bright sm:flex"
        >
          + New Decision
        </Link>

        {/* Export Center */}
        <Link
          href="/export"
          aria-label="Export Center"
          title="Export Center"
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-border-hair text-slate transition-colors hover:border-amber/40 hover:text-ivory"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 1v9M5 7l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Profile / Settings */}
        <Link
          href="/settings"
          aria-label="Profile & Settings"
          title="Profile & Settings"
          className="flex h-8 w-8 items-center justify-center rounded-btn border border-border-hair text-slate transition-colors hover:border-amber/40 hover:text-ivory"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M3 14c.6-2.2 2.6-3.5 5-3.5s4.4 1.3 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </Link>
      </div>
    </header>
  );
}
