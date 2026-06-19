# HypothesisOS Positioning V2

**Document:** K5  
**Date:** 2026-06-19  
**Replaces:** All "Research OS / Operating System" language from earlier documentation.

---

## The Position

**HypothesisOS is a decision falsification platform.**

It takes a claim and a structured evidence packet. It returns a defensible go/no-go verdict with documented reasoning and a calibration score. It does not replace research. It forces explicit encoding of what is known and unknown before a decision is made — and then kills hypotheses that the evidence does not support.

The core bet is that most bad decisions persist not because of missing evidence, but because people with good evidence fail to draw the hard conclusion from it. The engine is designed to draw that conclusion.

---

## What It Is

**A structured evidence encoding tool.**

Before the engine runs, a human must encode the evidence into 8 fields: effect size, replication, hostile survival, confound control, generalization, power, whether the interval excludes null, whether generalization is claimed. This encoding step is where vague impressions become auditable inputs. It is the product's highest-friction step and its most important contribution: it forces the decision-maker to articulate what they actually know.

**A kill-gate based verdict engine.**

The engine runs kill gates before computing support. A single measured dimension below its floor kills the hypothesis regardless of all other evidence. This is intentional. A claim with a 0.02 effect size that replicated 10 times is still a claim about nothing. Averaging 10 replications of a null with other strong dimensions produces a false positive; kill gates do not.

**A calibration layer.**

Alongside the verdict, the engine computes a calibration score (0–100) that measures how much evidence was actually gathered, how many dimensions were tested, and how adversarially. A KILL verdict with calibration 30 means "we killed it on thin evidence — run more tests before treating this as final." A KILL verdict with calibration 80 means "this claim was thoroughly tested and failed."

**An audit trail.**

Every verdict is accompanied by a reasons array listing which kill gates fired or which GO criteria were met, an explanation of why alternatives were rejected, and a list of what evidence was missing. A decision made with HypothesisOS can be interrogated: "why KILL?" produces a specific answer. This is distinct from a verdict produced by intuition, committee discussion, or averaging.

---

## What It Is Not

**It is not a research tool.**

HypothesisOS does not find evidence, retrieve papers, run analyses, or generate data. It evaluates evidence that humans have already assembled and encoded. Users who expect it to tell them what the literature says about their claim will be disappointed.

**It is not an AI assistant.**

The verdict engine is deterministic. The same evidence packet returns the same verdict every time. The LLM layer (explanation, experiment design suggestions) is confined to the Explanation Layer and cannot change verdicts or values. This is a design constraint, not a limitation.

**It is not a replacement for domain expertise.**

Encoding evidence requires knowing what was measured, what the study design was, and what confounds were controlled. A non-expert who cannot read the studies cannot populate the fields correctly. The engine amplifies good encoding; it does not compensate for bad encoding.

**It is not a belief confirmation tool.**

The engine is designed to kill hypotheses. Its default posture is skeptical. A user who wants to confirm that their idea is correct will find the engine unhelpful: if the evidence is not strong enough to meet all GO criteria, the verdict is not GO. This is a feature of the design, but it is worth stating clearly to avoid misaligned expectations.

---

## Who Pays

Segments ranked by pain severity, willingness to pay, and decision urgency. These are hypotheses, not validated demand curves.

**1. Product managers deciding whether to build a feature.**

Decision cadence: weekly to monthly. Cost of false GO: typically weeks to months of engineering time plus opportunity cost of the features not built. The problem is well-defined: they have access to user research, A/B test results, and market data, but need a structured way to distinguish "users said they want this" from "users actually changed behavior when we built it." Urgency is high because decisions are continuous.

**2. Startup founders evaluating whether a market hypothesis holds.**

Decision stakes: raise/pivot/kill the company. Founders routinely have evidence — customer interviews, usage data, unit economics — but make the GO call based on narrative momentum rather than evidence structure. The kill-gate architecture is valuable precisely because it forces the founder to separately encode effect size (are users actually paying/using differently?) from replication (has this happened in more than one cohort?) from hostile survival (does this hold when the enthusiast early adopters are excluded?).

**3. VC and strategy analysts evaluating investment theses.**

Decision stakes: capital allocation. Pre-investment due diligence is already structured (market size, team, competition, product), but the hypothesis structure of investment theses (does X market want Y solution?) maps directly onto the engine's inputs. Analysts who currently perform this evaluation informally benefit from a system that makes the kill criteria explicit and auditable. Secondary use: post-investment thesis tracking.

**4. Research teams deciding whether to run a large study.**

Decision stakes: budget, time, and professional risk. The biggest version of this problem is pharmaceutical clinical trial design, but the everyday version is an academic team deciding whether the pilot data justifies a multi-year study. The engine's value is clarifying whether the pilot actually crossed the thresholds needed to proceed — or whether it is being interpreted charitably because the team wants to proceed.

**5. Enterprise strategy teams evaluating acquisition or market entry hypotheses.**

Decision stakes: large capital, strategic direction. The problem here is that these decisions are made with extensive analysis that reaches a conclusion, then that conclusion is presented with the analysis that supports it. A falsification platform that was part of the process before the conclusion was reached would surface the kill-gate violations before they are buried in the slide deck. Lower urgency than 1–3 because these teams have internal analytical resources; higher potential contract size.

---

## What Risk It Reduces

**False GO on a well-liked hypothesis.**

The primary failure mode in hypothesis evaluation is committing to a dead end because the hypothesis was compelling, the team liked it, and the evidence was interpreted charitably. The kill-gate architecture is a structural intervention against this failure mode. The zero false GO rate in the V1 outcome study (0% vs. 9.1% for naive averaging) is evidence that the architecture works on the class of hypotheses in that study.

**Missing a key confound that explains away the effect.**

Confound control is a kill-gate dimension. A confound control score below 0.20 kills the hypothesis. This forces the question: "Is the measured effect actually explained by a confound we haven't controlled?" before a GO decision is made.

**Ignoring replication failure and proceeding anyway.**

The GO verdict requires replication >= 0.5 (at least one independent replication). A single study, however well-run, cannot produce a GO. This is a structural check that cannot be bypassed.

**Making a confident decision on a single data point.**

The calibration score penalizes incomplete evidence. A verdict reached with half the fields unmeasured will have calibration below 40 (LOW CONFIDENCE band). The system explicitly labels its own uncertainty.

---

## What It Does Not Claim

- It does not claim to be correct in all cases. The V1 study showed two over-confident KILL verdicts on genuinely UNRESOLVED cases.
- It does not claim to work without good evidence encoding. Garbage in, confident garbage out.
- It does not claim to replace human judgment. It structures and disciplines it.
- It does not claim product-market fit. That remains unvalidated.
