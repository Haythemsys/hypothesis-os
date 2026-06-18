// Typed bridge over the dependency-free .mjs engine so the app and the Node benchmark
// share ONE implementation. The .mjs files are the source of truth.
// @ts-ignore - JS module, types declared here
import { classify as _classify, supportScore as _support, VERDICT, THRESHOLDS } from "./engine.mjs";
// @ts-ignore
import { decompose as _decompose, experiments as _experiments, blankEvidence as _blank } from "./generate.mjs";
// @ts-ignore
import { BAPA_HYPOTHESES as _BAPA, MAJOR_IDS as _MAJOR } from "./bapa-benchmark.mjs";

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
export { VERDICT, THRESHOLDS };
