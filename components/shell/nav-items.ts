// Shared navigation model for sidebar (desktop) + dock (mobile).
export type NavItem = { href: string; label: string; icon: string; dock?: boolean };

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Mission", icon: "◈", dock: true },
  { href: "/workflow",  label: "Work",    icon: "⚡", dock: true },
  { href: "/evidence",  label: "Analyze", icon: "⚖", dock: true },
  { href: "/compare",   label: "Compare", icon: "⇄", dock: true },
  { href: "/more",      label: "More",    icon: "⋯", dock: true },
];

// Extra desktop-sidebar destinations (not in the mobile dock)
export const SIDEBAR_EXTRA: NavItem[] = [
  { href: "/library",         label: "Library",       icon: "⊟" },
  { href: "/portfolio",       label: "Portfolio",     icon: "◉" },
  { href: "/executive",       label: "Executive",     icon: "▣" },
  { href: "/board-brief",     label: "Board Brief",   icon: "▤" },
  { href: "/risk-map",        label: "Risk Map",      icon: "⊛" },
  { href: "/workspace",       label: "Workspace",     icon: "⊕" },
  { href: "/templates",       label: "Templates",     icon: "⊞" },
  { href: "/reports/weekly",  label: "Weekly Report", icon: "⊿" },
  { href: "/memory",          label: "Timeline",      icon: "⟳" },
  { href: "/premortem",       label: "Premortem",     icon: "⚑" },
  { href: "/cases",           label: "Case Studies",  icon: "⊡" },
  { href: "/audit",           label: "Audit",         icon: "⌗" },
  { href: "/vault",           label: "Vault",         icon: "⊞" },
  { href: "/import",          label: "Import",        icon: "↑" },
  { href: "/export",          label: "Export",        icon: "↗" },
  { href: "/analytics",       label: "Analytics",     icon: "⊿" },
  { href: "/settings",        label: "Settings",      icon: "⚙" },
];

// Paths that should highlight a given dock/sidebar item (prefix match)
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
