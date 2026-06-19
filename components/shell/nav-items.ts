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
  { href: "/audit",       label: "Audit",       icon: "⌗" },
  { href: "/lab",         label: "Lab",         icon: "⚗" },
  { href: "/experiments", label: "Experiments", icon: "⚙" },
  { href: "/settings",    label: "Settings",    icon: "⚙" },
];

// Paths that should highlight a given dock/sidebar item (prefix match)
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
