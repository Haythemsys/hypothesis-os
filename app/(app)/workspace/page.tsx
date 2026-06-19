"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, getIdentity, setOrg } from "@/lib/client";

type WorkspaceRole = "owner" | "executive" | "researcher" | "reviewer" | "viewer";

type Member = {
  id: string; workspaceId: string; userId: string; role: WorkspaceRole;
  displayName: string; invitedBy?: string; joinedAt: string;
};

const ROLE_STYLES: Record<WorkspaceRole, string> = {
  owner:      "bg-amber/20 text-amber",
  executive:  "bg-go/15 text-go",
  researcher: "bg-white/10 text-ivory",
  reviewer:   "bg-amber/10 text-unresolved",
  viewer:     "bg-white/5 text-slate",
};

const ROLE_CAPS: Record<WorkspaceRole, string[]> = {
  owner:      ["Full access", "Manage members", "All decisions"],
  executive:  ["View all decisions", "Approve decisions", "Board briefs"],
  researcher: ["Create decisions", "Add evidence", "Run workflow"],
  reviewer:   ["Comment & challenge", "Request evidence", "Escalate"],
  viewer:     ["Read-only access", "View reports"],
};

export default function Workspace() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [self, setSelf] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<{ userId: string; orgId: string } | null>(null);

  // Join form
  const [joinName, setJoinName] = useState("");
  const [joinRole, setJoinRole] = useState<WorkspaceRole>("researcher");
  const [newOrgId, setNewOrgId] = useState("");

  // Invite form
  const [inviteId, setInviteId] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("viewer");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ workspaceId: string; members: Member[]; self: Member | null }>("/api/workspace")
      .then((r) => {
        setWorkspaceId(r.workspaceId);
        setMembers(r.members || []);
        setSelf(r.self);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = getIdentity();
    setIdentity(id);
    setNewOrgId(id.orgId || "");
    load();
  }, [load]);

  const joinWorkspace = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await api("/api/workspace", { method: "POST", body: { action: "join", role: joinRole, displayName: joinName || identity?.userId?.slice(0, 8) } });
      load();
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const inviteMember = async () => {
    if (!inviteId.trim() || busy) return;
    setBusy(true);
    try {
      await api("/api/workspace", { method: "POST", body: { action: "invite", userId: inviteId.trim(), role: inviteRole, displayName: inviteName || inviteId.trim() } });
      setInviteId(""); setInviteName("");
      load();
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const setRole = async (userId: string, role: WorkspaceRole) => {
    await api("/api/workspace", { method: "POST", body: { action: "set_role", userId, role } });
    load();
  };

  const changeWorkspace = () => {
    if (!newOrgId.trim()) return;
    setOrg(newOrgId.trim());
    window.location.reload();
  };

  const selfRole = self?.role;
  const canManage = selfRole === "owner" || selfRole === "executive";

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Organization</div>
        <h1 className="text-2xl font-bold tracking-tight">Workspace</h1>
        <p className="mt-1 text-sm text-slate">Manage your team, roles, and collaboration settings.</p>
      </div>

      {/* Current workspace */}
      <div className="card space-y-4">
        <div className="label">Current Workspace</div>
        <div className="rounded-inner bg-white/3 px-4 py-3 space-y-1">
          <div className="text-[10px] text-slate uppercase tracking-wide">Workspace ID (Org)</div>
          <div className="data text-sm text-ivory break-all">{workspaceId || "—"}</div>
          {self && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`pill text-[10px] ${ROLE_STYLES[self.role]}`}>{self.role}</span>
              <span className="text-xs text-slate">{self.displayName}</span>
            </div>
          )}
        </div>

        {/* Change workspace */}
        <div className="space-y-2">
          <div className="label">Switch Workspace</div>
          <p className="text-xs text-slate">Enter an org ID to join a different workspace. Users with the same org ID share decisions.</p>
          <div className="flex gap-2">
            <input
              value={newOrgId}
              onChange={(e) => setNewOrgId(e.target.value)}
              placeholder="org:team-name or custom ID"
              className="input flex-1"
            />
            <button onClick={changeWorkspace} disabled={!newOrgId.trim()} className="btn-ghost shrink-0 disabled:opacity-40">Switch</button>
          </div>
        </div>
      </div>

      {/* Join current workspace */}
      {!self && (
        <div className="card space-y-3">
          <div className="label text-amber">Join This Workspace</div>
          <div className="flex gap-2">
            <input value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="Your display name" className="input flex-1" />
            <select value={joinRole} onChange={(e) => setJoinRole(e.target.value as WorkspaceRole)} className="input w-36">
              {(["owner", "executive", "researcher", "reviewer", "viewer"] as WorkspaceRole[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button onClick={joinWorkspace} disabled={busy} className="btn-primary text-sm disabled:opacity-40">
            {busy ? "…" : "Join Workspace"}
          </button>
        </div>
      )}

      {/* Members list */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="label">Team Members</div>
          <span className="text-xs text-slate">{members.length} member{members.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="h-24 animate-pulse rounded-inner bg-white/3" />
        ) : members.length === 0 ? (
          <p className="text-sm text-slate text-center py-4">No members yet. Join or invite below.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-inner border border-border-hair px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/15 text-sm font-bold text-amber">
                  {m.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-ivory">{m.displayName}</div>
                  <div className="data text-[10px] text-slate truncate">{m.userId}</div>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && m.userId !== identity?.userId ? (
                    <select
                      value={m.role}
                      onChange={(e) => setRole(m.userId, e.target.value as WorkspaceRole)}
                      className="rounded-btn border border-border-hair bg-obsidian px-2 py-1 text-xs text-steel"
                    >
                      {(["owner", "executive", "researcher", "reviewer", "viewer"] as WorkspaceRole[]).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`pill text-[10px] ${ROLE_STYLES[m.role]}`}>{m.role}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite form */}
        {canManage && (
          <div className="border-t border-border-hair pt-4 space-y-3">
            <div className="label">Invite Member</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input value={inviteId} onChange={(e) => setInviteId(e.target.value)} placeholder="User ID" className="input text-sm" />
              <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Display name" className="input text-sm" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)} className="input text-sm">
                {(["executive", "researcher", "reviewer", "viewer"] as WorkspaceRole[]).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button onClick={inviteMember} disabled={!inviteId.trim() || busy} className="btn-primary text-sm disabled:opacity-40">
              {busy ? "…" : "Add Member"}
            </button>
          </div>
        )}
      </div>

      {/* Roles capability matrix */}
      <div className="card space-y-4">
        <div className="label">Role Capabilities</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(ROLE_CAPS) as [WorkspaceRole, string[]][]).map(([role, caps]) => (
            <div key={role} className="rounded-inner border border-border-hair p-3 space-y-2">
              <span className={`pill text-xs ${ROLE_STYLES[role]}`}>{role}</span>
              <ul className="space-y-1">
                {caps.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs text-steel">
                    <span className="text-go">✓</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/portfolio" className="text-steel hover:text-ivory">Portfolio →</Link>
        <Link href="/executive" className="text-steel hover:text-ivory">Executive View →</Link>
        <Link href="/board-brief" className="text-steel hover:text-ivory">Board Brief →</Link>
      </div>
    </div>
  );
}
