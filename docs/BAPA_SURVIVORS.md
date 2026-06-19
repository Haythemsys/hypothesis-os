# BAPA_SURVIVORS.md — What Survived from BAPA into HypothesisOS (K11)

**Date:** 2026-06-19
**Method:** Direct inspection of lib/bapa-benchmark.mjs, lib/graph.mjs, lib/core.ts, lib/engine.mjs (referenced), docs/ARCHITECTURE.md, docs/COULD_IT_HAVE_CAUGHT_IT_EARLIER.md, docs/RESEARCH_CORPUS_USAGE_AUDIT.md, and docs/CONTRADICTION_ENGINE.md. No speculation. Only what is in the code and files.

---

## 1. The Evidence Framework — Origin

**Survived: Yes. Framework concepts come directly from BAPA research failure modes.**

The eight evidence dimensions in HypothesisOS are not generic scientific methodology concepts bolted on post-hoc. The ARCHITECTURE.md is explicit about the causal chain:

> "KILL gates run first. A confounded or non-generalizing claim cannot be rescued by a large effect — exactly the failure mode that kept the BAPA identity hypothesis alive too long."

The specific kill gates (confound control < 0.20, hostile survival < 0.34, generalization < 0.34 when required) were set to catch the exact failure modes BAPA experienced:

| Kill gate | BAPA failure it encodes |
|-----------|------------------------|
| `confoundControl < 0.20` | identity_static: author == genre confound, uncontrolled — Phase 0/1 |
| `hostileSurvival < 0.34` | identity_static: domain-shift destroyed separation (survival 0.10) — Phase 2 |
| `generalization < 0.34` when `claimRequiresGeneralization` | portable_register: cross-context re-ID at chance — R18/R20 |
| `effect < 0.15` | portable_register: cross-context re-ID effect was 0.10 |

The evidence dimensions (`effect`, `replication`, `hostileSurvival`, `confoundControl`, `generalization`, `power`, `ciExcludesNull`, `claimRequiresGeneralization`) were not independently derived from general evidence-based medicine frameworks. They encode what BAPA measured and what BAPA failed to measure. The conditional generalization flag (`claimRequiresGeneralization`) is specifically designed so that within-context claims (like `temporal_stability`) are not penalized for failing a cross-context test they never claimed — a distinction that required seeing BAPA's `context_dominance` and `temporal_stability` as separate hypotheses.

---

## 2. The Benchmark Hypotheses — Provenance

**Survived: All 8 BAPA hypotheses are in the codebase as the primary validation corpus.**

`lib/bapa-benchmark.mjs` encodes 8 hypotheses with R-numbered phases (R10, R11, R13, R16, R17, R18, R19, R20) and quantitative evidence values derived from BAPA experimental outcomes:

| Hypothesis | Expected | Evidence values — key entries |
|------------|----------|-------------------------------|
| identity_static | KILL | effect 0.40, hostileSurvival 0.10, confoundControl 0.10, generalization 0.05 |
| cognitive_fingerprint | KILL | effect 0.35, hostileSurvival 0.15 |
| model_fingerprint | KILL | effect 0.20 (~chance over lexical baseline) |
| portable_register | KILL | effect 0.10, generalization 0.05 (cross-context re-ID at chance) |
| context_dominance | GO | effect 0.85 (register predicts community 2.79× chance), replication 1.0 |
| temporal_stability | GO | effect 0.72 (ICC ~0.67–0.72), replication 1.0 |
| within_context_person | UNRESOLVED | effect 0.50 (re-ID 2.6–7× chance, ~13% absolute, but not cross-context) |
| adaptation_layer | UNRESOLVED | effect 0.30, replication 0.0 (substrate validated; product value untested) |

These are real research findings encoded as evidence profiles. The five "major" hypotheses (`MAJOR_IDS`) form the success criterion the engine must pass.

The benchmark serves dual purpose: it validates the engine against known outcomes, and it documents what BAPA actually found as opposed to what it claimed. The engine passes 8/8 (5/5 major) from evidence values alone, without seeing the expected labels.

**Provenance of the evidence values:** As documented in `docs/RESEARCH_CORPUS_USAGE_AUDIT.md`, these values did not come from the haythemv11 archive (19 ML papers + KTS framework documents). They came from the 218-file BAPA download archive (which includes `BAPA_MASTER_RESEARCH_REPORT.txt`, phase reports R1–R20, and result files) and/or conversational description of BAPA findings. The exact source within that archive is not traceable from the current codebase.

---

## 3. Methods, Datasets, and Protocols Directly Reusable

**What carried over:**

**The hypothesis taxonomy (R-phase structure).** BAPA's research was structured as R-numbered phases (R10=RAID model fingerprinting, R13=static identity, R16=temporal stability, R17=within-context personal signal, R18/R20=portable register and context dominance, R19=adaptation layer). These phase labels are preserved verbatim in the benchmark as the `phase` field. The taxonomy shows which findings built on which earlier findings.

**The dependency graph.** `lib/graph.mjs` encodes 8 explicit causal/logical edges between the BAPA hypotheses:
- `identity_static` contradicted-by `context_dominance` (the apparent separation was the context confound)
- `cognitive_fingerprint` depends-on `identity_static` (both fall together)
- `portable_register` contradicted-by `context_dominance` (cross-context re-ID at chance)
- `model_fingerprint` analogous-to `identity_static` (same failure: dynamics add nothing over lexical baseline)
- `temporal_stability` supports `context_dominance` (stable within context = consistent with context-as-driver)
- `within_context_person` bounds `portable_register` (weak signal within context, doesn't survive cross-context)
- `within_context_person` depends-on `temporal_stability`
- `adaptation_layer` builds-on `context_dominance` (if context drives register, AI adaptation is the live hypothesis)

This graph is not synthetic — it represents the actual epistemic structure of BAPA's research program as it unfolded. It is directly used in the `/graph` page of the app.

**The insight about confound timing.** `docs/COULD_IT_HAVE_CAUGHT_IT_EARLIER.md` documents that HypothesisOS would have KILL-gated `identity_static` at Phase 0/1 (on `confoundControl 0.10`) — before the expensive Phase 2 domain-shift tests. This is a reusable protocol insight: run the confound check before the generalization test, and run the cheap hostile test first. The Experiment Engine implements this as three tiers: cheap kill → strong estimate → hostile.

**What did not carry over from BAPA:**

The corpora (Enron email, StackExchange data) that BAPA used to measure register effects. HypothesisOS contains no data, no datasets, no text samples. It encodes the outcomes (effect sizes, ICC values) but not the underlying measurements.

The 56 engine implementations that BAPA apparently built (referenced in the haythemv11 BAPA UI analysis as a claimed feature). None of those engines, their code, or their specific algorithms appear in HypothesisOS. The only BAPA "engine" that survived is the conceptual one: classify evidence using kill gates.

---

## 4. BAPA Concepts Refuted or Abandoned

**identity_static (KILL):** The core BAPA claim — that writing identifies the author across contexts — is encoded as a KILL-class hypothesis. It is not abandoned from the codebase; it is the anchor example of what the engine correctly kills.

**cognitive_fingerprint (KILL):** The multi-dimensional personal signature claim falls with `identity_static` (dependency edge). Also encoded as KILL.

**portable_register (KILL):** The portability claim (register travels with the person across contexts) is encoded as KILL based on cross-context re-ID at chance.

**model_fingerprint (KILL):** AI model fingerprinting via adaptation dynamics adds nothing over a lexical baseline. Encoded as KILL.

These four killed hypotheses are not "abandoned" in the sense of being removed from the codebase — they are preserved as the documented failures that motivated HypothesisOS's design. Their failure modes are the engine's kill gates.

**The adaptation_layer hypothesis (UNRESOLVED):** BAPA's 2.0 direction — an AI that adapts to a user from accumulated preferences — is encoded as UNRESOLVED, not KILL. The substrate (context drives register) is validated; the product value is untested. This is the only BAPA hypothesis that remains genuinely open, and it is the one HypothesisOS itself is positioned as a downstream application of.

---

## 5. BAPA Verdict: Net Contribution

**VERDICT: Core Foundation**

BAPA is not a research parallel that was mined for data. It is the founding case that:

1. Defined the evidence dimensions (by having those specific dimensions fail)
2. Set the kill gate thresholds (calibrated to BAPA's specific failure severities)
3. Provided the primary benchmark corpus (8 hypotheses with known outcomes)
4. Supplied the hypothesis dependency graph (the BAPA cluster contradictions are the Contradiction Engine's headline example)
5. Generated the architectural insight that confound gates must run first, and cheap hostile tests must run before expensive confirmatory ones

Without BAPA, there is no benchmark. Without the benchmark, there is no self-validation. Without the specific BAPA failure modes (identity vs. context confound, generalization collapse under domain shift), the kill gate design is arbitrary rather than empirically calibrated.

The 24 multi-domain benchmarks (psychology, science, business, marketing, AI) are teaching fixtures derived from general scientific consensus. They test the engine's generality. But the engine's structure — what to gate on, at what thresholds, in what order — comes from BAPA.

HypothesisOS is, in a precise sense, a formalization of what BAPA should have done at Phase 0.

---

*Written from direct code inspection. No claims about BAPA content that is not visible in the HypothesisOS repository.*
