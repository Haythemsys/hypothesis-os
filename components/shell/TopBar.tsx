"use client";
// Desktop top bar — hairline header with command hint. Verdict/debt context is
// injected per-page via the #topbar-slot portal target when a hypothesis is active.
export function TopBar({ onCommand }: { onCommand: () => void }) {
  return (
    <header
      data-shell
      className="sticky top-0 z-30 hidden h-12 items-center gap-3 border-b border-border-hair bg-obsidian/90 px-5 backdrop-blur lg:flex"
    >
      <div id="topbar-slot" className="flex min-w-0 flex-1 items-center gap-3" />
      <button
        onClick={onCommand}
        className="flex items-center gap-2 rounded-btn border border-border-hair px-2.5 py-1 text-xs text-slate transition-colors hover:text-ivory"
      >
        <span className="text-sm">⌘</span> K
      </button>
    </header>
  );
}
