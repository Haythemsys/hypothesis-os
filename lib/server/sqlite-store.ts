// HypothesisOS — SQLite-backed persistent store.
// Replaces the ephemeral in-memory Map with a real database.
// DB path: HYPOS_DB env var (set to a Railway volume path like /data/hypothesisos.db)
// or falls back to .data/hypothesisos.db relative to cwd.

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type {
  Project, Hypothesis, Experiment, EvidenceRecord, VerdictRecord, Report,
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
};
