// Typed bridge over the dependency-free .mjs engine so the app and the Node benchmark
// share ONE implementation. The .mjs files are the source of truth.
// @ts-ignore - JS module, types declared here
import { classify as _classify, supportScore as _support, VERDICT, THRESHOLDS } from "./engine.mjs";
// @ts-ignore
import { decompose as _decompose, experiments as _experiments, blankEvidence as _blank } from "./generate.mjs";
// @ts-ignore
import { BAPA_HYPOTHESES as _BAPA, MAJOR_IDS as _MAJOR } from "./bapa-benchmark.mjs";
// @ts-ignore
import { explain as _explain } from "./explain.mjs";
// @ts-ignore
import { calibrate as _calibrate } from "./calibrate.mjs";
// @ts-ignore
import { selfCritique as _selfCritique } from "./critique.mjs";
// @ts-ignore
import { detectContradictions as _detect } from "./contradict.mjs";
// @ts-ignore
import { ALL_BENCHMARKS as _ALL, DOMAINS as _DOMAINS } from "./benchmarks/index.mjs";
// @ts-ignore
import { newHypothesis as _newH, commitRevision as _commit, finalVerdict as _final, verdictFlipped as _flipped, STORE_KEY as _SK } from "./memory.mjs";

export type Verdict = "GO" | "KILL" | "UNRESOLVED";

export interface Evidence {
  effect: number; replication: number; hostileSurvival: number; confoundControl: number;
  generalization: number; power: number; ciExcludesNull: boolean;
  claimRequiresGeneralization: boolean;
}
export interface Classification {
  verdict: Verdict; confidence: number; support: number; reasons: string[];
}
export interface BapaHypothesis {
  id: string; title: string; phase: string; expected: Verdict; evidence: Evidence;
}

export const classify = _classify as (e: Partial<Evidence>) => Classification;
export const supportScore = _support as (e: Partial<Evidence>) => number;
export const decompose = _decompose as (t: string) => any;
export const experiments = _experiments as (t: string) => any;
export const blankEvidence = _blank as (g?: boolean) => Evidence;
export const BAPA_HYPOTHESES = _BAPA as BapaHypothesis[];
export const MAJOR_IDS = _MAJOR as string[];

export interface Explanation {
  verdict: Verdict; support: number; confidence: number; reasons: string[];
  supporting: string[]; against: string[]; missing: string[];
  assumptions: string[]; confounds: string[];
  confidenceExplanation: string;
  rejectedAlternatives: { verdict: string; why: string }[];
}
export interface Calibration {
  score: number; band: string;
  components: { evidenceCompleteness: number; confoundCoverage: number; contradictionCoverage: number; benchmarkConfidence: number };
  limitingFactor: string; recommendation: string;
}
export interface Critique {
  baseVerdict: Verdict; finalVerdict: Verdict; downgrade: string | null;
  calibration: Calibration; landed: number; survived: number;
  reasons: string[];
  attacks: { target: string; attack: string; survives: boolean; note: string }[];
}
export interface Contradiction {
  a: string; b: string; variable: string; aClaim: string; bClaim: string;
  severity: "hard" | "soft"; resolution: string;
}

export const explain = _explain as (e: Partial<Evidence>, hypothesis?: string) => Explanation;
export const calibrate = _calibrate as (e: Partial<Evidence>) => Calibration;
export const selfCritique = _selfCritique as (e: Partial<Evidence>) => Critique;
export const detectContradictions = _detect as (hs: any[]) => Contradiction[];
export interface Benchmark {
  id: string; title: string; expected: Verdict; evidence: Evidence; note?: string;
  domain?: string; implications?: { var: string; sign: number }[];
}
export const ALL_BENCHMARKS = _ALL as (Benchmark & { domain: string })[];
export const DOMAINS = _DOMAINS as Record<string, Benchmark[]>;

export interface Revision {
  rev: number; at: string; evidence: Evidence; experiment: string; result: string;
  note: string; verdict: Verdict; calibration: number; band: string;
}
export interface HypothesisRecord {
  id: string; title: string; createdAt: string; updatedAt: string; versions: Revision[];
}
export const newHypothesis = _newH as (title: string) => HypothesisRecord;
export const commitRevision = _commit as (
  r: HypothesisRecord, input: { evidence: Evidence; experiment?: string; result?: string; note?: string }
) => HypothesisRecord;
export const finalVerdict = _final as (r: HypothesisRecord) => { verdict: Verdict; calibration: number; band: string; rev: number } | null;
export const verdictFlipped = _flipped as (r: HypothesisRecord) => boolean;
export const STORE_KEY = _SK as string;
export { VERDICT, THRESHOLDS };
