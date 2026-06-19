# FIRST_CUSTOMER_BLUEPRINT.md — HypothesisOS (K10)

**Date:** 2026-06-19
**Product description:** HypothesisOS is a decision falsification platform. It takes a claim and structured evidence (effect size, replication, hostile survival, confound control, generalization, power, CI) and returns a GO / KILL / UNRESOLVED verdict with calibration, explanation, and self-critique. The verdict is deterministic and reproducible. The LLM, if used, only writes a decorative summary — it cannot change the verdict.

---

## Ideal Customer Profile — Three Archetypes

### Archetype 1: The Growth-Stage Product Manager

**Who:** Senior PM or Head of Product at a Series B/C startup (20–150 people). Runs 2–5 product bets concurrently. Reports to a C-suite that wants evidence-based decisions but has no formal research ops.

**Decision they face weekly:** "Should we build Feature X? The user interview data looks good, the A/B test was positive, but I don't trust it — the experiment ran during a promo period and our power was weak." They need to say GO or KILL to an engineering team in the next sprint planning.

**Cost of a false GO:** 6–8 weeks of engineering at ~$15–25K loaded cost per engineer, delayed roadmap, a feature shipped that underperforms, and credibility loss with the team when they realize the bet was poorly justified. In aggregate, 2–3 false GOs per quarter is a career risk.

**Why they'd pay for structured falsification:** They are already doing informal falsification in their heads. They want a tool that forces them to answer "what would kill this?" before committing resources, and produces a document they can show leadership. They are not researchers — they need the structure, not the education.

**What they'd compare HypothesisOS to:** Notion or Confluence templates ("we have a decision doc template"), Dovetail or Maze ("we use these for research"), their own spreadsheet scoring. The comparison is weak — none of those produce a verdict, they just store evidence.

---

### Archetype 2: The VC Analyst Screening Deals

**Who:** Associate or Senior Associate at a seed or Series A fund. Evaluates 5–15 deals per month. The fund's thesis requires structured diligence on product-market fit hypotheses — "does the market really exist at the scale they claim?"

**Decision they face monthly:** "Is the core market hypothesis for this deal falsified yet? They have 3 reference customers and a Letter of Intent. Is that evidence of market pull, or survivorship bias?" They need to pass or kill the deal for the next partner meeting.

**Cost of a false GO:** A deal that passes initial screening consumes ~40–80 hours of senior partner time, legal, and technical diligence before it gets killed — or worse, gets funded and underperforms. A $2M seed check on a KILL-worthy market hypothesis is an expensive false GO.

**Why they'd pay for structured falsification:** Funds are moving toward evidence-based investment memos. A VC analyst who can produce a calibrated falsification scorecard for each deal's core hypothesis stands out internally and in co-investor communication. It is a differentiation tool as much as a decision tool.

**What they'd compare HypothesisOS to:** Their fund's internal memos, Airtable deal tracking, asking ChatGPT to summarize the thesis. Again, none of these produce a structured verdict with kill gates.

---

### Archetype 3: The Applied Research Team Lead

**Who:** Team lead managing 3–6 researchers in an applied science context — pharma, behavioral science consultancy, market research agency, or an in-house research team at a large tech company. Responsible for research quality and delivery speed.

**Decision they face monthly:** "We have three studies on this claim. Two replicated, one didn't. One of the positive ones had confound issues we spotted after launch. Is this claim GO, KILL, or do we need another study?" The decision is worth 6–18 months of future research budget allocation.

**Cost of a false GO:** Commissioning a follow-on study on a KILL-worthy hypothesis costs $50K–$500K depending on scope, plus the opportunity cost of not studying something that matters. A false GO on a confounded behavioral effect can produce years of downstream investment in interventions that don't work.

**Why they'd pay for structured falsification:** They are the closest archetype to the tool's design. The evidence framework (effect, replication, hostile survival, confound control, generalization, power) is exactly what they reason about. They would use it to formalize decisions that are currently made in research team meetings, introduce consistency across team members, and produce client-facing decision rationales.

**What they'd compare HypothesisOS to:** Internal spreadsheets, their existing GRADE-like evidence synthesis frameworks, or custom Python tooling. HypothesisOS is simpler and immediately usable without custom setup.

---

## Ranked Segments (by pain x WTP x urgency)

**1. PMs at growth-stage startups**
Highest pain and urgency. They make GO/KILL decisions weekly with money on the line. WTP is moderate — they spend on tools freely (Figma, Linear, Dovetail) and would expense a $50–150/month tool without procurement. The friction risk is highest here too (see adoption risks), but the decision frequency keeps them engaged.

**2. VC analysts**
High WTP (fund expense accounts, no personal cost), high-value decisions, but lower frequency — one deal per week rather than one feature decision per day. The falsification use case maps cleanly but the workflow integration is less obvious. Early adopters here are status-motivated (producing better memos).

**3. Research team leads**
Highest conceptual fit to the tool's design, moderate WTP (team budget, not personal), lower urgency. Research teams move slowly. The buy cycle is longer (team approval, IT, procurement at larger orgs). But if one team lead adopts it, they can institutionalize it across the team. Best channel: bottom-up from individual researchers who find it.

**4. Solo founders**
High urgency, but WTP is low and erratic. Solo founders are the easiest to get using the tool (no approval needed) but the hardest to convert to paying. The product has direct value for founders deciding whether to pivot, but the free tier risk is high.

**5. Enterprise strategy analysts**
Low urgency, high friction. Enterprise procurement cycles kill early-stage tools. Strategy analysts at large firms have established decision frameworks (McKinsey, BCG methodologies) and significant internal inertia. Do not target first.

---

## First Revenue Path

**Simplest commercial version:** A hosted deployment with a single paid tier. The current codebase is deployable to Railway or Vercel today with SQLite on a mounted volume. No marketplace, no multi-tenant isolation guarantee, no enterprise SSO.

**Price point:** $29–49/month individual. Justifiable as "less than one hour of an engineer's time, and it structures decisions that involve weeks of engineering time."

**Who signs the first check:** A PM or research lead who has been burned by a false GO in the last 12 months. They do not need to be convinced that structured evaluation is valuable — they already believe it. They need to see the tool work on a real decision they currently face.

**First revenue path in steps:**
1. Ship a hosted instance. The current app, deployed on Railway with a custom domain, is the product.
2. Share the BAPA benchmark results as the credibility story: "this engine reproduced known research verdicts from evidence alone, with a 0% false GO rate on 10 KILL cases."
3. Find 3–5 target PMs or research leads. Have them run one real hypothesis through the tool. Do not charge for this.
4. After they get a verdict they find useful, ask for $29/month. One of those 5 will pay.

The first check comes from direct outreach to a known contact who makes evidence-based product decisions, not from inbound marketing.

---

## What Would Kill Adoption

### Risk 1: Evidence encoding is too much friction

The workflow requires the user to produce six numeric scores (0–1) for each evidence dimension. A PM who has a qualitative user interview and an A/B test cannot easily translate those into `replication: 0.5, hostileSurvival: 0.3`. They will not guess — they will abandon the tool at step 3 of the workflow.

The current UI uses sliders, which helps, but does not solve the translation problem. If users cannot encode their evidence in under 5 minutes without reference documentation, they will not complete a workflow. This is the most likely adoption killer.

### Risk 2: LLM tools feel good enough for the use case

A PM asking GPT-4 "should I build this feature based on these research findings?" gets a plausible-sounding structured answer. It does not have kill gates, calibration, or reproducible verdicts — but it feels like it does. The product thesis depends on users experiencing the cost of a false GO first-hand before they understand why structured falsification is different. Users who have not yet been burned by a bad LLM recommendation will not see the value.

### Risk 3: The output is a verdict, not a recommendation

HypothesisOS tells you KILL. It does not tell you what to do instead. A PM whose feature hypothesis just got KILLed wants the next step: what experiment should I run, what variant should I try, what's the revised hypothesis? The current Experiment Engine generates test designs but does not connect them to the verdict. If users experience the tool as stopping at the bad news without offering a path forward, churn will be high after the first KILL verdict.

---

*No speculation about potential customers or future capabilities. This blueprint reflects the current product as implemented and the user segments most likely to pay for structured falsification.*
