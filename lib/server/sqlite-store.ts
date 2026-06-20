// HypothesisOS — SQLite-backed persistent store.
// Replaces the ephemeral in-memory Map with a real database.
// DB path: HYPOS_DB env var (set to a Railway volume path like /data/hypothesisos.db)
// or falls back to .data/hypothesisos.db relative to cwd.

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type {
  Project, Hypothesis, Experiment, EvidenceRecord, VerdictRecord, Report,
  Comment, Approval, WorkspaceMember,
  IngestDocument, KnowledgeItem, IntelligenceSnapshot,
  BetaSignup, AnalyticsEvent,
} from "../models";
import { canSee, type Identity } from "./identity";

function getDbPath(): string {
  if (process.env.HYPOS_DB) return process.env.HYPOS_DB;
  const dir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "hypothesisos.db");
}

type Entity = Project | Hypothesis | Experiment | EvidenceRecord | VerdictRecord | Report;

// Singleton: survive HMR in dev by caching on globalThis
const g = globalThis as unknown as { __HYPOS_SQL__?: Database.Database };
function getDb(): Database.Database {
  if (g.__HYPOS_SQL__) return g.__HYPOS_SQL__;
  const db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  g.__HYPOS_SQL__ = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hypotheses (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      kinds TEXT NOT NULL DEFAULT '[]',
      requiresGeneralization INTEGER NOT NULL DEFAULT 0,
      assumptions TEXT NOT NULL DEFAULT '[]',
      confounds TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      tier TEXT NOT NULL,
      purpose TEXT NOT NULL,
      cost TEXT NOT NULL,
      steps TEXT NOT NULL DEFAULT '[]',
      source TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      label TEXT NOT NULL,
      evidence TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verdicts (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      evidenceId TEXT NOT NULL,
      verdict TEXT NOT NULL,
      finalVerdict TEXT NOT NULL,
      support REAL NOT NULL,
      calibration REAL NOT NULL,
      band TEXT NOT NULL,
      reasons TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      verdictId TEXT NOT NULL,
      title TEXT NOT NULL,
      markdown TEXT NOT NULL,
      aiAssisted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_hypotheses_project ON hypotheses(projectId);
    CREATE INDEX IF NOT EXISTS idx_experiments_hypothesis ON experiments(hypothesisId);
    CREATE INDEX IF NOT EXISTS idx_evidence_hypothesis ON evidence(hypothesisId);
    CREATE INDEX IF NOT EXISTS idx_verdicts_hypothesis ON verdicts(hypothesisId);
    CREATE INDEX IF NOT EXISTS idx_reports_hypothesis ON reports(hypothesisId);

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      authorId TEXT NOT NULL,
      authorName TEXT NOT NULL DEFAULT 'Member',
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      parentId TEXT,
      createdAt TEXT NOT NULL,
      resolvedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      hypothesisId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      submittedBy TEXT NOT NULL,
      reviewerId TEXT,
      executiveId TEXT,
      reviewerNotes TEXT,
      executiveNotes TEXT,
      submittedAt TEXT,
      reviewedAt TEXT,
      executiveAt TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workspace_members (
      id TEXT PRIMARY KEY,
      workspaceId TEXT NOT NULL,
      userId TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      displayName TEXT NOT NULL DEFAULT 'Member',
      invitedBy TEXT,
      joinedAt TEXT NOT NULL,
      UNIQUE(workspaceId, userId)
    );

    CREATE INDEX IF NOT EXISTS idx_comments_hypothesis ON comments(hypothesisId);
    CREATE INDEX IF NOT EXISTS idx_approvals_hypothesis ON approvals(hypothesisId);
    CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspaceId);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'txt',
      size INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL DEFAULT '',
      claims TEXT NOT NULL DEFAULT '[]',
      metrics TEXT NOT NULL DEFAULT '[]',
      dates TEXT NOT NULL DEFAULT '[]',
      entities TEXT NOT NULL DEFAULT '[]',
      summary TEXT NOT NULL DEFAULT '',
      uploadedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      ownerId TEXT NOT NULL,
      hypothesisId TEXT,
      type TEXT NOT NULL DEFAULT 'lesson',
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS intelligence_snapshots (
      id TEXT PRIMARY KEY,
      orgId TEXT NOT NULL,
      decisionQuality REAL NOT NULL DEFAULT 0,
      evidenceQuality REAL NOT NULL DEFAULT 0,
      riskDiscipline REAL NOT NULL DEFAULT 0,
      learningVelocity REAL NOT NULL DEFAULT 0,
      consistency REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      recordedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(orgId);
    CREATE INDEX IF NOT EXISTS idx_knowledge_org ON knowledge_items(orgId);
    CREATE INDEX IF NOT EXISTS idx_intel_org ON intelligence_snapshots(orgId);

    CREATE TABLE IF NOT EXISTS beta_signups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      useCase TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      decisionType TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      properties TEXT NOT NULL DEFAULT '{}',
      orgId TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(name);
    CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(createdAt);
  `);
}

// Serialize arrays/objects to JSON strings for storage
function toRow(obj: any): any {
  const row: any = { ...obj };
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (Array.isArray(v) || (v && typeof v === "object")) row[k] = JSON.stringify(v);
    if (typeof v === "boolean") row[k] = v ? 1 : 0;
  }
  return row;
}

// Deserialize row back to typed object
function fromRow<T>(table: string, row: any): T {
  if (!row) return null as any;
  const obj = { ...row };
  const JSON_FIELDS: Record<string, string[]> = {
    hypotheses: ["kinds", "assumptions", "confounds"],
    experiments: ["steps"],
    evidence: ["evidence"],
    verdicts: ["reasons"],
  };
  const BOOL_FIELDS: Record<string, string[]> = {
    hypotheses: ["requiresGeneralization"],
    reports: ["aiAssisted"],
  };
  for (const f of JSON_FIELDS[table] || []) {
    try { obj[f] = JSON.parse(obj[f] || "[]"); } catch { obj[f] = []; }
  }
  for (const f of BOOL_FIELDS[table] || []) {
    obj[f] = !!obj[f];
  }
  return obj as T;
}

function scopedList<T extends Entity>(
  db: Database.Database,
  table: string,
  id: Identity,
  where = "",
  params: any[] = []
): T[] {
  const clause = where ? `AND ${where}` : "";
  const rows = db
    .prepare(`SELECT * FROM ${table} WHERE (ownerId = ? OR orgId = ?) ${clause} ORDER BY createdAt DESC`)
    .all(id.ownerId, id.orgId, ...params) as any[];
  return rows.map((r) => fromRow<T>(table, r));
}

function scopedGet<T extends Entity>(
  db: Database.Database,
  table: string,
  id: Identity,
  key: string
): T | null {
  const row = db
    .prepare(`SELECT * FROM ${table} WHERE id = ? AND (ownerId = ? OR orgId = ?)`)
    .get(key, id.ownerId, id.orgId) as any;
  return row ? fromRow<T>(table, row) : null;
}

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  const rnd = Math.abs((Date.now() ^ (counter * 2654435761)) >>> 0).toString(36);
  return `${prefix}_${rnd}${counter.toString(36)}`;
}

export const store = {
  createProject(p: Project) {
    const db = getDb();
    db.prepare(`INSERT OR REPLACE INTO projects (id,ownerId,orgId,name,description,createdAt) VALUES (?,?,?,?,?,?)`)
      .run(p.id, p.ownerId, p.orgId, p.name, p.description, p.createdAt);
    return p;
  },
  listProjects(id: Identity) { return scopedList<Project>(getDb(), "projects", id); },
  getProject(id: Identity, key: string) { return scopedGet<Project>(getDb(), "projects", id, key); },

  createHypothesis(h: Hypothesis) {
    const db = getDb();
    const r = toRow(h);
    db.prepare(`INSERT OR REPLACE INTO hypotheses (id,ownerId,orgId,projectId,title,kinds,requiresGeneralization,assumptions,confounds,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(r.id, r.ownerId, r.orgId, r.projectId, r.title, r.kinds, r.requiresGeneralization, r.assumptions, r.confounds, r.createdAt, r.updatedAt);
    return h;
  },
  updateHypothesis(h: Hypothesis) {
    const db = getDb();
    const r = toRow(h);
    db.prepare(`UPDATE hypotheses SET title=?,kinds=?,requiresGeneralization=?,assumptions=?,confounds=?,updatedAt=? WHERE id=?`)
      .run(r.title, r.kinds, r.requiresGeneralization, r.assumptions, r.confounds, r.updatedAt, r.id);
    return h;
  },
  listHypotheses(id: Identity, projectId?: string) {
    if (projectId) return scopedList<Hypothesis>(getDb(), "hypotheses", id, "projectId = ?", [projectId]);
    return scopedList<Hypothesis>(getDb(), "hypotheses", id);
  },
  getHypothesis(id: Identity, key: string) { return scopedGet<Hypothesis>(getDb(), "hypotheses", id, key); },

  createExperiment(e: Experiment) {
    const db = getDb();
    const r = toRow(e);
    db.prepare(`INSERT OR REPLACE INTO experiments (id,ownerId,orgId,hypothesisId,tier,purpose,cost,steps,source,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .run(r.id, r.ownerId, r.orgId, r.hypothesisId, r.tier, r.purpose, r.cost, r.steps, r.source, r.createdAt);
    return e;
  },
  listExperiments(id: Identity, hypothesisId: string) {
    return scopedList<Experiment>(getDb(), "experiments", id, "hypothesisId = ?", [hypothesisId]);
  },

  createEvidence(e: EvidenceRecord) {
    const db = getDb();
    const r = toRow(e);
    db.prepare(`INSERT OR REPLACE INTO evidence (id,ownerId,orgId,hypothesisId,label,evidence,createdAt) VALUES (?,?,?,?,?,?,?)`)
      .run(r.id, r.ownerId, r.orgId, r.hypothesisId, r.label, r.evidence, r.createdAt);
    return e;
  },
  getEvidence(id: Identity, key: string) { return scopedGet<EvidenceRecord>(getDb(), "evidence", id, key); },
  listEvidence(id: Identity, hypothesisId: string) {
    return scopedList<EvidenceRecord>(getDb(), "evidence", id, "hypothesisId = ?", [hypothesisId]);
  },

  createVerdict(v: VerdictRecord) {
    const db = getDb();
    const r = toRow(v);
    db.prepare(`INSERT OR REPLACE INTO verdicts (id,ownerId,orgId,hypothesisId,evidenceId,verdict,finalVerdict,support,calibration,band,reasons,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(r.id, r.ownerId, r.orgId, r.hypothesisId, r.evidenceId, r.verdict, r.finalVerdict, r.support, r.calibration, r.band, r.reasons, r.createdAt);
    return v;
  },
  listVerdicts(id: Identity, hypothesisId: string) {
    return scopedList<VerdictRecord>(getDb(), "verdicts", id, "hypothesisId = ?", [hypothesisId]);
  },

  createReport(r: Report) {
    const db = getDb();
    const row = toRow(r);
    getDb().prepare(`INSERT OR REPLACE INTO reports (id,ownerId,orgId,hypothesisId,verdictId,title,markdown,aiAssisted,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(row.id, row.ownerId, row.orgId, row.hypothesisId, row.verdictId, row.title, row.markdown, row.aiAssisted, row.createdAt);
    return r;
  },
  getReport(id: Identity, key: string) { return scopedGet<Report>(getDb(), "reports", id, key); },
  listReports(id: Identity, hypothesisId?: string) {
    if (hypothesisId) return scopedList<Report>(getDb(), "reports", id, "hypothesisId = ?", [hypothesisId]);
    return scopedList<Report>(getDb(), "reports", id);
  },

  // ── Comments ────────────────────────────────────────────────────────────────
  createComment(c: Comment) {
    const db = getDb();
    db.prepare(`INSERT INTO comments (id,orgId,hypothesisId,authorId,authorName,text,status,parentId,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(c.id, c.orgId, c.hypothesisId, c.authorId, c.authorName, c.text, c.status, c.parentId ?? null, c.createdAt);
    return c;
  },
  listComments(orgId: string, hypothesisId: string): Comment[] {
    const rows = getDb().prepare(`SELECT * FROM comments WHERE orgId=? AND hypothesisId=? ORDER BY createdAt ASC`).all(orgId, hypothesisId) as any[];
    return rows.map((r) => ({ ...r, parentId: r.parentId ?? undefined, resolvedAt: r.resolvedAt ?? undefined }));
  },
  resolveComment(orgId: string, commentId: string, status: string) {
    const now = new Date().toISOString();
    getDb().prepare(`UPDATE comments SET status=?, resolvedAt=? WHERE id=? AND orgId=?`).run(status, now, commentId, orgId);
  },

  // ── Approvals ───────────────────────────────────────────────────────────────
  upsertApproval(a: Approval) {
    const db = getDb();
    db.prepare(`INSERT OR REPLACE INTO approvals (id,orgId,hypothesisId,status,submittedBy,reviewerId,executiveId,reviewerNotes,executiveNotes,submittedAt,reviewedAt,executiveAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(a.id, a.orgId, a.hypothesisId, a.status, a.submittedBy, a.reviewerId ?? null, a.executiveId ?? null, a.reviewerNotes ?? null, a.executiveNotes ?? null, a.submittedAt ?? null, a.reviewedAt ?? null, a.executiveAt ?? null, a.createdAt);
    return a;
  },
  getApproval(orgId: string, hypothesisId: string): Approval | null {
    const row = getDb().prepare(`SELECT * FROM approvals WHERE orgId=? AND hypothesisId=? ORDER BY createdAt DESC LIMIT 1`).get(orgId, hypothesisId) as any;
    if (!row) return null;
    return { ...row, reviewerId: row.reviewerId ?? undefined, executiveId: row.executiveId ?? undefined, reviewerNotes: row.reviewerNotes ?? undefined, executiveNotes: row.executiveNotes ?? undefined, submittedAt: row.submittedAt ?? undefined, reviewedAt: row.reviewedAt ?? undefined, executiveAt: row.executiveAt ?? undefined };
  },
  listApprovals(orgId: string): Approval[] {
    const rows = getDb().prepare(`SELECT * FROM approvals WHERE orgId=? ORDER BY createdAt DESC`).all(orgId) as any[];
    return rows.map((r) => ({ ...r, reviewerId: r.reviewerId ?? undefined, executiveId: r.executiveId ?? undefined, reviewerNotes: r.reviewerNotes ?? undefined, executiveNotes: r.executiveNotes ?? undefined }));
  },

  // ── Workspace members ───────────────────────────────────────────────────────
  upsertMember(m: WorkspaceMember) {
    const db = getDb();
    db.prepare(`INSERT OR REPLACE INTO workspace_members (id,workspaceId,userId,role,displayName,invitedBy,joinedAt) VALUES (?,?,?,?,?,?,?)`)
      .run(m.id, m.workspaceId, m.userId, m.role, m.displayName, m.invitedBy ?? null, m.joinedAt);
    return m;
  },
  listMembers(workspaceId: string): WorkspaceMember[] {
    const rows = getDb().prepare(`SELECT * FROM workspace_members WHERE workspaceId=? ORDER BY joinedAt ASC`).all(workspaceId) as any[];
    return rows.map((r) => ({ ...r, invitedBy: r.invitedBy ?? undefined }));
  },
  getMember(workspaceId: string, userId: string): WorkspaceMember | null {
    const row = getDb().prepare(`SELECT * FROM workspace_members WHERE workspaceId=? AND userId=?`).get(workspaceId, userId) as any;
    if (!row) return null;
    return { ...row, invitedBy: row.invitedBy ?? undefined };
  },
  removeMember(workspaceId: string, userId: string) {
    getDb().prepare(`DELETE FROM workspace_members WHERE workspaceId=? AND userId=?`).run(workspaceId, userId);
  },

  // ── Ingest Documents (VI-2) ─────────────────────────────────────────────────
  createDocument(doc: IngestDocument) {
    const db = getDb();
    db.prepare(`INSERT OR REPLACE INTO documents (id,orgId,ownerId,name,type,size,content,claims,metrics,dates,entities,summary,uploadedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(doc.id, doc.orgId, doc.ownerId, doc.name, doc.type, doc.size, doc.content, JSON.stringify(doc.claims), JSON.stringify(doc.metrics), JSON.stringify(doc.dates), JSON.stringify(doc.entities), doc.summary, doc.uploadedAt);
    return doc;
  },
  listDocuments(orgId: string): IngestDocument[] {
    const rows = getDb().prepare(`SELECT * FROM documents WHERE orgId=? ORDER BY uploadedAt DESC`).all(orgId) as any[];
    return rows.map(r => ({ ...r, claims: JSON.parse(r.claims || "[]"), metrics: JSON.parse(r.metrics || "[]"), dates: JSON.parse(r.dates || "[]"), entities: JSON.parse(r.entities || "[]") }));
  },
  deleteDocument(orgId: string, id: string) {
    getDb().prepare(`DELETE FROM documents WHERE id=? AND orgId=?`).run(id, orgId);
  },

  // ── Knowledge Items (VI-7) ──────────────────────────────────────────────────
  createKnowledgeItem(item: KnowledgeItem) {
    const db = getDb();
    db.prepare(`INSERT OR REPLACE INTO knowledge_items (id,orgId,ownerId,hypothesisId,type,title,body,tags,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(item.id, item.orgId, item.ownerId, item.hypothesisId ?? null, item.type, item.title, item.body, JSON.stringify(item.tags), item.createdAt);
    return item;
  },
  listKnowledgeItems(orgId: string): KnowledgeItem[] {
    const rows = getDb().prepare(`SELECT * FROM knowledge_items WHERE orgId=? ORDER BY createdAt DESC`).all(orgId) as any[];
    return rows.map(r => ({ ...r, hypothesisId: r.hypothesisId ?? undefined, tags: JSON.parse(r.tags || "[]") }));
  },
  deleteKnowledgeItem(orgId: string, id: string) {
    getDb().prepare(`DELETE FROM knowledge_items WHERE id=? AND orgId=?`).run(id, orgId);
  },

  // ── Beta Signups (X4) ──────────────────────────────────────────────────────
  createBetaSignup(s: BetaSignup) {
    const db = getDb();
    db.prepare(`INSERT OR IGNORE INTO beta_signups (id,name,email,role,useCase,company,decisionType,createdAt) VALUES (?,?,?,?,?,?,?,?)`)
      .run(s.id, s.name, s.email, s.role, s.useCase, s.company, s.decisionType, s.createdAt);
    return s;
  },
  listBetaSignups(): BetaSignup[] {
    return getDb().prepare(`SELECT * FROM beta_signups ORDER BY createdAt DESC`).all() as BetaSignup[];
  },
  countBetaSignups(): number {
    const row = getDb().prepare(`SELECT COUNT(*) as n FROM beta_signups`).get() as { n: number };
    return row.n;
  },

  // ── Analytics Events (X7) ──────────────────────────────────────────────────
  createEvent(e: AnalyticsEvent) {
    const db = getDb();
    db.prepare(`INSERT INTO analytics_events (id,name,properties,orgId,createdAt) VALUES (?,?,?,?,?)`)
      .run(e.id, e.name, e.properties, e.orgId, e.createdAt);
    return e;
  },
  listEvents(limit = 500): AnalyticsEvent[] {
    return getDb().prepare(`SELECT * FROM analytics_events ORDER BY createdAt DESC LIMIT ?`).all(limit) as AnalyticsEvent[];
  },
  countEventsByName(): Record<string, number> {
    const rows = getDb().prepare(`SELECT name, COUNT(*) as n FROM analytics_events GROUP BY name ORDER BY n DESC`).all() as { name: string; n: number }[];
    const out: Record<string, number> = {};
    for (const r of rows) out[r.name] = r.n;
    return out;
  },

  // ── Intelligence Snapshots (VI-10) ──────────────────────────────────────────
  createSnapshot(snap: IntelligenceSnapshot) {
    const db = getDb();
    db.prepare(`INSERT INTO intelligence_snapshots (id,orgId,decisionQuality,evidenceQuality,riskDiscipline,learningVelocity,consistency,total,recordedAt) VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(snap.id, snap.orgId, snap.decisionQuality, snap.evidenceQuality, snap.riskDiscipline, snap.learningVelocity, snap.consistency, snap.total, snap.recordedAt);
    return snap;
  },
  listSnapshots(orgId: string): IntelligenceSnapshot[] {
    return getDb().prepare(`SELECT * FROM intelligence_snapshots WHERE orgId=? ORDER BY recordedAt ASC`).all(orgId) as IntelligenceSnapshot[];
  },
};
