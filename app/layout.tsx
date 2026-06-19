import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { Logo } from "@/components/logo/Logo";

export const metadata: Metadata = {
  title: "HypothesisOS — Decision Falsification Platform",
  description: "Stop bad decisions before they cost you money. Encode evidence, get a deterministic GO / KILL / UNRESOLVED verdict with kill gates, calibration, and a path to GO.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#0A0C10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-obsidian text-ivory">
        <header className="sticky top-0 z-40 border-b border-border-hair bg-obsidian/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <Logo size={22} />
            <span className="label ml-auto">decision engine</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-32 pt-4">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
