import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body className="min-h-dvh bg-obsidian text-ivory antialiased">{children}</body>
    </html>
  );
}
