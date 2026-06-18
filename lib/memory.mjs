// HypothesisOS v2 — Phase C: Research Memory.
// Persistent, versioned hypothesis store. "Git for research": every hypothesis keeps an
// append-only history of revisions, each capturing the evidence, the resulting verdict, the
// calibration, and a note. Nothing is overwritten — revisions accumulate and are traceable.
// Pure data helpers; the UI provides the storage (localStorage in the browser).

import { classify } from "./engine.mjs";
import { calibrate } from "./calibrate.mjs";

export const STORE_KEY = "hypothesisos.memory.v1";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID().slice(0, 8)
    : "h" + Math.abs(hashString(String(Date.now()))).toString(36);

function hashString(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

/** Create a new hypothesis record (no revisions yet). */
export function newHypothesis(title, now = nowISO()) {
  return { id: uid(), title: title.trim(), createdAt: now, updatedAt: now, versions: [] };
}

/** Append a revision. Verdict + calibration are computed, never hand-entered. */
export function commitRevision(record, { evidence, experiment = "", result = "", note = "" }, now = nowISO()) {
  const verdict = classify(evidence).verdict;
  const cal = calibrate(evidence);
  const version = {
    rev: record.versions.length + 1,
    at: now,
    evidence,
    experiment,   // what was tested
    result,       // what came back
    note,         // why this revision
    verdict,
    calibration: cal.score,
    band: cal.band,
  };
  return { ...record, updatedAt: now, versions: [...record.versions, version] };
}

/** The current (latest) verdict for a hypothesis, or null if never revised. */
export function finalVerdict(record) {
  const v = record.versions[record.versions.length - 1];
  return v ? { verdict: v.verdict, calibration: v.calibration, band: v.band, rev: v.rev } : null;
}

/** Has the verdict flipped across its history? (a traceability signal) */
export function verdictHistory(record) {
  return record.versions.map((v) => v.verdict);
}
export function verdictFlipped(record) {
  const h = verdictHistory(record);
  return new Set(h).size > 1;
}

function nowISO() {
  // browser/runtime only; callers in pure tests pass `now` explicitly.
  return new Date().toISOString();
}
