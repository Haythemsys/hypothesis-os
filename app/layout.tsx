import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "HypothesisOS",
  description: "A research operating system: evaluate hypotheses → GO / KILL / UNRESOLVED, from evidence.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#0b0f17",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <header className="sticky top-0 z-40 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <span className="text-lg font-black tracking-tight">Hypothesis<span className="text-go">OS</span></span>
            <span className="label ml-auto">decision engine</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-32 pt-4">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
