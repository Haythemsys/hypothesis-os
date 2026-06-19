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
import { navigate as _navigate } from "./navigation.mjs";
// @ts-ignore
import {
  evidenceDebt as _debt, decisionEffort as _effort, pathToGo as _path,
  confidenceBreakdown as _confBreakdown, executiveSummary as _execSummary,
} from "./decision-intelligence.mjs";
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

export interface NavigationDimensionGain {
  dimension: string; label: string; current: number; weight: number; maxGain: number;
}
export interface UnmetCriterionDetail {
  criterion: string; current: number | boolean; required: number | boolean;
}
export interface Navigation {
  verdict: Verdict;
  currentSupport: number;
  goThreshold: number;
  supportGap: number;
  navigable: boolean;
  distanceToGo: string | null;
  highestLeverageDimension: string | null;
  highestLeverageLabel: string | null;
  highestLeverageGain: number | null;
  unmetGoCriteria: string[] | null;
  unmetGoCriteriaDetail: UnmetCriterionDetail[] | null;
  recommendedAction: string | null;
  explanation: string;
  impossibleReason: string | null;
  dimensionGains: NavigationDimensionGain[];
  killedBy?: { gate: string; value: number; floor: number; action: string }[];
}
export const navigate = _navigate as (e: Partial<Evidence>, verdict: Verdict) => Navigation;

// ── Decision Intelligence types & exports ────────────────────────────────────
export interface EvidenceDebt { pct: number; band: string; debt: number; }
export interface DecisionEffort { level: "LOW" | "MEDIUM" | "HIGH"; studyCycles: number | null; }
export interface PathStep { dimension: string; label: string; action: string; maxGain: number | null; }
export interface ConfidenceBreakdown { score: number; contributors: string[]; penalties: string[]; }
export interface ExecutiveSummary {
  verdict: Verdict; reason: string; fastestRoute: string | null;
  effort: string | null; studyCycles: number | null;
  debtPct: number | null; debtBand: string | null;
}

export const evidenceDebt      = _debt         as (e: Partial<Evidence>, nav: Navigation) => EvidenceDebt;
export const decisionEffort    = _effort        as (nav: Navigation) => DecisionEffort;
export const pathToGo          = _path          as (nav: Navigation) => PathStep[];
export const confidenceBreakdown = _confBreakdown as (e: Partial<Evidence>, score: number) => ConfidenceBreakdown;
export const executiveSummary  = _execSummary   as (verdict: Verdict, nav: Navigation, debt: EvidenceDebt, effort: DecisionEffort) => ExecutiveSummary;
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
