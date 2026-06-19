import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Phase Q identity — obsidian field / amber signal / ivory-steel-slate ──
        obsidian: "#0A0C10",
        graphite: "#13161C",
        "graphite-2": "#1A1E26",
        "border-hair": "#262B35",
        "border-soft": "#323845",
        amber: "#E8A23D",
        "amber-bright": "#F4B860",
        "amber-dim": "#8A6326",
        ivory: "#F2EFE9",
        steel: "#A4ADBC",
        slate: "#6B7382",
        "slate-dim": "#454C58",
        // ── Verdict semantics (retuned to palette; consumers update centrally) ──
        go: "#3FB67A",
        kill: "#E5544B",
        unresolved: "#E8A23D",
        // ── Back-compat tokens (kept so un-migrated components still build) ──
        ink: "#0A0C10",
        panel: "#13161C",
        line: "#262B35",
      },
      fontFamily: {
        sans: ['var(--font-sans)', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ['var(--font-mono)', "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { card: "16px", btn: "12px", inner: "8px" },
      transitionTimingFunction: { signal: "cubic-bezier(.2,.8,.2,1)" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in": { from: { opacity: "0", transform: "translateX(12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.97)" }, to: { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "fade-up": "fade-up .2s ease-out both",
        "slide-in": "slide-in .2s cubic-bezier(.2,.8,.2,1) both",
        "scale-in": "scale-in .12s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
