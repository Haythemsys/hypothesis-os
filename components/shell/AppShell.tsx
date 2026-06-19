"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomDock } from "./BottomDock";
import { CommandPalette } from "./CommandPalette";

// Composes the OS shell: desktop sidebar + top bar, mobile dock, ⌘K palette.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [cmd, setCmd] = useState(false);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setCmd((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Sidebar onCommand={() => setCmd(true)} />
      <div className="lg:pl-16">
        <TopBar onCommand={() => setCmd(true)} />
        <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 lg:max-w-5xl lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomDock onCommand={() => setCmd(true)} />
      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    </>
  );
}
