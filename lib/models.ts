// HypothesisOS — product data models (Phase 3 & 5).
// Clean, owner-scoped entities. Every record carries ownerId + orgId so isolation is
// structural: a query is ALWAYS scoped to the caller's identity. Single-user, team, and
// organization all use the same shape — only the scope of `ownerId`/`orgId` changes.

import type { Evidence, Verdict } from "./core";

export type ID = string;

export interface User {
  id: ID;
  handle: string;
  orgId: ID;          // every user belongs to an org (a solo user gets a personal org)
  role: "owner" | "member";
  createdAt: string;
}

export interface Organization {
  id: ID;
  name: string;
  plan: "solo" | "team" | "org";
  createdAt: string;
}

// The scope attached to every owned entity. Isolation is enforced on this.
export interface Scope {
  ownerId: ID;        // the user who created it
  orgId: ID;          // the org it belongs to (team/org visibility)
}

export interface Project extends Scope {
  id: ID;
  name: string;
  description: string;
  createdAt: string;
}

export interface Hypothesis extends Scope {
  id: ID;
  projectId: ID;
  title: string;
  kinds: string[];
  requiresGeneralization: boolean;
  assumptions: string[];
  confounds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Experiment extends Scope {
  id: ID;
  hypothesisId: ID;
  tier: "CHEAP KILL" | "STRONG TEST" | "HOSTILE TEST";
  purpose: string;
  cost: string;
  steps: string[];
  source: "engine" | "llm-assisted";
  createdAt: string;
}

export interface EvidenceRecord extends Scope {
  id: ID;
  hypothesisId: ID;
  label: string;       // human note: where this evidence came from
  evidence: Evidence;  // the numeric evidence vector fed to the engine
  createdAt: string;
}

export interface VerdictRecord extends Scope {
  id: ID;
  hypothesisId: ID;
  evidenceId: ID;
  verdict: Verdict;        // the DETERMINISTIC engine verdict (constitutional)
  finalVerdict: Verdict;   // after self-critique (may downgrade)
  support: number;
  calibration: number;
  band: string;
  reasons: string[];
  createdAt: string;
}

export interface Report extends Scope {
  id: ID;
  hypothesisId: ID;
  verdictId: ID;
  title: string;
  markdown: string;        // engine-derived; LLM prose is clearly attributed inside
  aiAssisted: boolean;
  createdAt: string;
}

// Archive items are NOT owner-scoped — they index real on-disk research files (shared reference).
export interface ArchiveItem {
  name: string;
  ext: string;
  bytes: number;
  category: string;
}

export type CommentStatus = "open" | "resolved" | "needs_evidence" | "escalated";

export interface Comment {
  id: ID;
  orgId: ID;
  hypothesisId: ID;
  authorId: ID;
  authorName: string;
  text: string;
  status: CommentStatus;
  parentId?: ID;
  createdAt: string;
  resolvedAt?: string;
}

export type ApprovalStatus = "draft" | "under_review" | "approved" | "rejected" | "archived";

export interface Approval {
  id: ID;
  orgId: ID;
  hypothesisId: ID;
  status: ApprovalStatus;
  submittedBy: ID;
  reviewerId?: ID;
  executiveId?: ID;
  reviewerNotes?: string;
  executiveNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  executiveAt?: string;
  createdAt: string;
}

export type WorkspaceRole = "owner" | "executive" | "researcher" | "reviewer" | "viewer";

export interface WorkspaceMember {
  id: ID;
  workspaceId: ID;
  userId: ID;
  role: WorkspaceRole;
  displayName: string;
  invitedBy?: ID;
  joinedAt: string;
}

// VI-2: Ingested evidence documents
export interface IngestDocument {
  id: ID;
  orgId: ID;
  ownerId: ID;
  name: string;
  type: string; // pdf | docx | txt | md | csv | json
  size: number;
  content: string; // extracted text
  claims: string[];
  metrics: string[];
  dates: string[];
  entities: string[];
  summary: string;
  uploadedAt: string;
}

// VI-7: Organizational knowledge items
export type KnowledgeItemType = "principle" | "lesson" | "pattern" | "checklist";

export interface KnowledgeItem {
  id: ID;
  orgId: ID;
  ownerId: ID;
  hypothesisId?: ID;
  type: KnowledgeItemType;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
}

// VI-10: Intelligence score snapshots
export interface IntelligenceSnapshot {
  id: ID;
  orgId: ID;
  decisionQuality: number;
  evidenceQuality: number;
  riskDiscipline: number;
  learningVelocity: number;
  consistency: number;
  total: number;
  recordedAt: string;
}

// X4: Beta signup
export interface BetaSignup {
  id: ID;
  name: string;
  email: string;
  role: string;
  useCase: string;
  company: string;
  decisionType: string;
  createdAt: string;
}

// X7: Product analytics event
export interface AnalyticsEvent {
  id: ID;
  name: string;
  properties: string; // JSON
  orgId: string;
  createdAt: string;
}
