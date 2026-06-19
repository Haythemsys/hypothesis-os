# Competitor Map — HypothesisOS

**Phase P validation document**
**Date:** 2026-06-19
**Scope:** Decision intelligence tools, ACH tools, research evaluation platforms, due diligence products.

The question this document tries to answer: in a competitive landscape where a decision-maker already has tools, why would they pay for HypothesisOS? The answer must survive honest assessment, not marketing comparison.

---

## Category 1 — AI General-Purpose Assistants

### Claude / ChatGPT / Gemini

**What they do for this use case:**
A user describes their hypothesis and evidence in natural language. The AI produces a plausible structured assessment — "based on the evidence you've described, this looks promising but has the following weaknesses..." The AI can list objections, suggest what's missing, and produce a narrative verdict.

**Strengths:**
- Zero friction: no encoding required
- Conversational: user can iterate in seconds
- Appears comprehensive: produces confident-sounding structured output
- Already in every professional's workflow

**Weaknesses:**
- Non-deterministic: same evidence produces different verdicts in different sessions
- No kill gates: low effect size can be averaged away by strong replication
- No calibration: the AI does not tell you how much evidence is missing
- No audit trail: the verdict is not reproducible or traceable
- Sycophantic by design: tends to validate the user's framing rather than falsify it
- Cannot distinguish "evidence is strong" from "the story is compelling"

**The gap HypothesisOS exploits:**
The LLM will tell you the hypothesis is UNRESOLVED when the evidence is weak. It will also tell you it's promising. It will not fire a kill gate when confound control is 0.10 — it will note the limitation and then continue to evaluate. The difference is structural: kill gates are unconditional; LLM caveats are not.

**Real risk:** Users who have not experienced a false GO driven by LLM assessment will not feel this gap. Users who have been burned will feel it viscerally. The market for HypothesisOS is specifically the people who've learned this lesson.

---

## Category 2 — ACH (Analysis of Competing Hypotheses) Tools

### PARC ACH / Analyst's Notebook / Patterned

**What they do:**
ACH is an intelligence analysis methodology for evaluating competing hypotheses against diagnostic evidence. Tools implement an ACH matrix: hypotheses across the top, evidence along the side, consistency/inconsistency scored in cells.

**Strengths:**
- Structured: forces explicit encoding of evidence-hypothesis relationships
- Multiple hypotheses simultaneously: not just GO/KILL on one claim
- Established methodology with credibility in intelligence/security analysis
- Handles contradictory evidence explicitly

**Weaknesses:**
- Designed for intelligence analysis, not product/business decisions
- No calibration layer: does not weight evidence quality
- No kill gates: if evidence is consistent with the hypothesis, it's consistent — no floor below which the claim is killed regardless
- UI is complex and specialist-facing: requires training to use correctly
- Not available as a simple web tool
- Static: no navigation toward GO, no path-to-evidence recommendations

**The gap HypothesisOS exploits:**
ACH tools handle ambiguous intelligence scenarios where the question is "which of several hypotheses best explains the evidence?" HypothesisOS handles a different question: "does this single hypothesis meet the evidentiary standard for action?" The kill-gate architecture is purpose-built for go/no-go decisions, not for comparative hypothesis ranking.

**Overlap risk:** Low. ACH users are intelligence/national security professionals. Different ICP.

---

## Category 3 — Research Quality & Evaluation Tools

### Cochrane / GRADE / ROBIS / Evidence-Based Practice Tools

**What they do:**
Systematic frameworks for evaluating the quality of clinical and scientific evidence. GRADE (Grading of Recommendations, Assessment, Development, and Evaluations) is the gold standard for evidence synthesis in medicine — it rates evidence on a 4-level scale (high/moderate/low/very low) based on study design, risk of bias, inconsistency, indirectness, imprecision.

**Strengths:**
- Rigorously validated: the gold standard in medicine and public health
- Comprehensive: accounts for all dimensions HypothesisOS covers (effect, replication/consistency, confound/bias, generalization/indirectness, power/imprecision)
- Trusted by institutions: WHO, Cochrane, major health ministries
- Domain-appropriate: designed for clinical evidence

**Weaknesses:**
- Requires expert raters: cannot be used by a non-specialist without extensive training
- Slow: a formal GRADE evaluation takes days to weeks
- Produces a recommendation level, not a GO/KILL decision
- No product/business adaptation: designed for clinical guidelines, not startup decisions
- No real-time interactive UI: not a tool, it's a methodology
- No navigation: tells you the evidence level, not what to do to improve it

**The gap HypothesisOS exploits:**
HypothesisOS is a simplified, real-time GRADE equivalent for non-expert decision-makers. The trade-off is that it's less rigorous than GRADE (numeric inputs vs. formal meta-analysis) but more accessible (a PM can use it in 10 minutes). For the research segment, HypothesisOS is not competing with GRADE — it's offering GRADE-like structure to people who would never run a formal GRADE evaluation.

---

## Category 4 — Decision Intelligence Platforms

### Decision Intelligence by Quantellia / Analytica / Causality Link

**What they do:**
Decision intelligence tools model causal relationships between variables and simulate outcomes under different evidence scenarios. Analytica, for example, is an influence diagram tool that maps uncertain variables and propagates probability distributions.

**Strengths:**
- Causal modeling: explicitly represents cause-effect structure
- Uncertainty quantification: Bayesian in many cases
- Scenario simulation: shows what happens if assumptions change
- High expressiveness: can model complex multi-variable decisions

**Weaknesses:**
- Steep learning curve: requires understanding of causal graphical models or probability theory
- Time-intensive: building a model for a single decision takes hours
- Requires a modeler: not self-serve for a PM or founder
- Poor UX for real-time decisions: these are planning tools, not workflow tools
- Expensive: enterprise pricing, not individual SaaS

**The gap HypothesisOS exploits:**
Decision intelligence platforms are for strategic planning with weeks of lead time. HypothesisOS is for a go/no-go decision that needs to be made today. The encoding overhead is radically lower (8 fields vs. a full causal model). The trade-off is expressiveness — HypothesisOS cannot model complex causal chains.

---

## Category 5 — Due Diligence Platforms

### Visible / Paperwork / Diligent / Datasite

**What they do:**
Due diligence platforms facilitate the data exchange and workflow for investment transactions. They store documents, manage Q&A processes, track information requests, and produce review summaries.

**Strengths:**
- Purpose-built for M&A and investment workflows
- Strong access control and audit trail
- Document management at scale
- Established in legal and financial workflows

**Weaknesses:**
- Do not evaluate evidence: they store and share documents, not assess what the documents mean
- No verdict: a due diligence platform surfaces all the evidence; it does not tell you whether the evidence supports the investment thesis
- Expensive: designed for law firms and banks, not startups
- Irrelevant for early-stage falsification: most useful after a deal is in term sheet, not for pre-investment thesis evaluation

**The gap HypothesisOS exploits:**
Diligence platforms are post-decision workflow tools. HypothesisOS is a pre-decision evidence evaluation tool. They are adjacent but not competitive: a VC analyst could use HypothesisOS to produce the investment thesis verdict before using a diligence platform to process the deal.

---

## Category 6 — Research Management & Knowledge Base Tools

### Notion / Confluence / Roam / Obsidian

**What they do:**
Flexible knowledge bases where researchers and decision-makers document their evidence, hypotheses, and reasoning. Many organizations have built custom "decision doc" templates in Notion that structure the pre-decision evidence review.

**Strengths:**
- Extremely flexible: any workflow can be implemented
- Already adopted: no new tool to introduce
- Low cost and high familiarity
- Can be extended with databases, AI integrations, etc.

**Weaknesses:**
- No verdict engine: documents hypotheses but does not evaluate them
- No kill gates: any evidence structure is equally valid
- No calibration: does not tell you how complete the evidence is
- No reproducibility: two people evaluating the same evidence differently produce different outcomes
- Confirmation bias: the person documenting controls the framing

**The gap HypothesisOS exploits:**
This is the most common alternative — not because it's better, but because it's already there. The hypothesis document in Notion looks like structured falsification but is actually structured advocacy. The critical difference: HypothesisOS can kill a hypothesis that Notion will let you keep alive by documenting it sympathetically.

**This is the primary competitive context for most users.** Most users will compare HypothesisOS to "our current Notion template." The switching cost question is whether users will maintain two systems (Notion for documentation, HypothesisOS for verdict) or whether HypothesisOS replaces the Notion template entirely. The latter requires deeper integration into existing workflows.

---

## Gap Summary — Where HypothesisOS Wins

| Capability | Claude/GPT | ACH | GRADE | DI Platforms | Notion |
|-----------|-----------|-----|-------|-------------|--------|
| Kill gates | ✗ | ✗ | Partial | ✗ | ✗ |
| Reproducible verdict | ✗ | Partial | ✓ | ✗ | ✗ |
| Calibration (evidence completeness) | ✗ | ✗ | Partial | ✓ | ✗ |
| Self-serve, 10-minute workflow | ✓ | ✗ | ✗ | ✗ | ✓ |
| Navigation to GO | ✗ | ✗ | ✗ | Partial | ✗ |
| Audit trail | ✗ | Partial | ✓ | ✓ | Partial |
| Non-expert accessible | ✓ | ✗ | ✗ | ✗ | ✓ |
| Free to try | ✓ | Partial | ✓ | ✗ | ✓ |

**HypothesisOS's defensible position:** Kill gates + reproducible verdicts + non-expert accessible + navigation to GO. No other tool in this landscape combines all four.

**HypothesisOS's vulnerability:** Claude/ChatGPT provides 70% of the perceived value with 0% of the encoding friction. Users who experience a false GO from an LLM assessment will seek the difference; users who haven't will not.

---

## The Honest Competitive Assessment

HypothesisOS is not competing with AI assistants on intelligence — it will lose that comparison. It is competing on **structural rigor that cannot be socially negotiated away**. The kill gate is unconditional; the LLM's caveat is a suggestion.

The market is people who have felt the cost of a suggestion that should have been a KILL. Finding them before HypothesisOS reaches them is the distribution problem. The product is correct. The audience is narrow and not yet aggregated anywhere.
