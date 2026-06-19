# Customer Discovery — HypothesisOS

**Phase P validation document**
**Date:** 2026-06-19
**Status:** Pre-revenue. No paying users. All WTP estimates are hypotheses, not validated data.

---

## The central validation question

Five segments are named below. For each, the core question is not "would they find this interesting?" — they will always say yes to a free tool in a conversation. The question is: **would they pay $40/month without being asked twice, and would they use it again the week after?** No current evidence for any segment.

---

## Segment 1 — Startup Founders

### Core pain
A founder has user interview data, early traction metrics, and maybe one A/B test. They need to decide whether to build, pivot, or kill a bet before the next funding round. The evidence is real but chaotically structured: anecdotes, screenshots, spreadsheet rows. The decision is made in a narrative meeting. The outcome is GO because the team wants it to be GO.

The cost of that false GO: 6–18 months of runway, sometimes the company.

### Existing solution
- Notion "thesis document" with pros/cons columns
- Asking ChatGPT to "review my PMF evidence"
- Founder instinct with post-hoc rationalization
- YC-style framework ("talk to 100 users")

### Switching cost
**Low friction to try, high friction to rely on.** Founders already have the evidence; encoding it into 8 structured dimensions is the friction point. Many will abandon at the encoding step. Those who complete a workflow and get a KILL verdict they already suspected will return. Those who get a KILL verdict on something they believed in will not return.

### HypothesisOS value proposition
Converts unstructured founder evidence into a reproducible verdict with explicit kill gates. The engine kills hypotheses that the founder was going to keep alive on narrative momentum. Most valuable 30 days before a board meeting or a fundraising conversation — a moment where a defensible falsification record is worth something.

### Willingness to pay
**$29/month individual tier** — plausible but unconfirmed. Solo founders expense tools reluctantly. The strongest version of this: a founder who has been burned by a bad pivot (previously committed resources to a KILL-worthy hypothesis) and wants structural protection against it happening again. They exist. Finding them is the distribution problem.

**WTP signal to watch for:** Does the founder mention the tool unprompted to another founder within 30 days? If yes, WTP is real. If they say "interesting tool" and don't return, it isn't.

---

## Segment 2 — VC Analysts

### Core pain
An analyst evaluates 8–15 deals per month. Each deal has a core thesis: "founders believe X market wants Y solution at Z price point." The analyst's job is to kill bad theses before they waste senior partner time. The current process is mostly heuristic: team quality, market size, comparable exits. The actual market hypothesis — "does this customer actually change behavior for this product?" — is rarely falsified formally before the term sheet discussion.

### Existing solution
- Internal investment memo templates (Word/Notion)
- Airtable deal tracking
- Conversational due diligence via reference calls
- ChatGPT for thesis summarization

### Switching cost
**Low to try** (no approval needed, personal tool for an analyst). **Medium to institutionalize** (partner buy-in needed to make it part of the fund's process). The individual analyst adoption path is realistic. The fund-wide adoption path is not realistic without a champion at the partner level.

### HypothesisOS value proposition
Produces a structured verdict on the core market hypothesis for each deal. The analyst submits the deal's evidence (customer interviews encoded, pilot metrics encoded, comparable company data encoded) and gets a calibrated GO/KILL/UNRESOLVED with documented kill gates. This becomes an addendum to the investment memo. The differentiation is not the verdict — it's the audit trail. When a deal goes wrong, the fund can trace back to what evidence was encoded and what kill gates were missed.

### Willingness to pay
**$79–149/month** — most plausible segment for early revenue because analysts expense tools on fund accounts with minimal friction. The risk: analysts may use the tool for a deal or two and then not return because deal flow is lumpy and encoding is slow. The conversion opportunity is building the habit of encoding every deal's core hypothesis, not just using it once.

**WTP signal to watch for:** Does the analyst encode a second deal within two weeks of the first? If yes, the habit is forming.

---

## Segment 3 — Startup Studios

### Core pain
A startup studio runs 4–12 new ventures simultaneously. Each venture starts from a market hypothesis. The studio has limited bandwidth to validate each hypothesis before committing resources — engineering, design, legal. They need a triage system: which hypotheses are GO (commit resources), UNRESOLVED (do one more experiment), KILL (stop now). Currently this triage is done in weekly portfolio reviews based on founder self-reporting. The self-reporting is unreliable.

### Existing solution
- Portfolio tracking in Airtable/Notion
- Weekly check-in calls with venture leads
- Internal scorecard templates (often not used consistently)
- Decision-by-committee in portfolio review meetings

### Switching cost
**Medium.** A studio needs the tool to be part of the intake process — every new venture hypothesis gets encoded before resources are committed. This is an institutional change, not a personal habit. It requires a partner or head of portfolio to mandate the process. If the studio has experienced false GO pain (invested 6 months in a venture that died on a knowable kill-gate violation), the motivation to mandate a structured process is high.

### HypothesisOS value proposition
A consistent falsification gate for every new venture before resource commitment. The studio encodes the market hypothesis for Venture A, B, C. Verdicts inform portfolio prioritization. Documented verdicts become part of the post-mortem analysis: "Venture A got KILL with calibration 72 in week 2 — why did we continue for 4 more months?" 

### Willingness to pay
**$299–499/month team tier.** Studios have real budgets. The value proposition maps cleanly to the cost of one bad venture (typically $100K–$500K in resources). A tool that kills one false GO per year pays for itself at any price point below $50K/year.

**WTP signal to watch for:** Does the studio head encode hypotheses across multiple ventures in the first month? Does the studio bring HypothesisOS into the venture intake process without being asked?

---

## Segment 4 — Academic Researchers

### Core pain
A researcher has pilot data suggesting a behavioral effect. The pilot was n=40, single lab, no replication. The researcher needs to decide: is this worth a multi-year grant application and a 200-person study? The cost of a false GO is 3–5 years of a research program that fails to replicate. The cost of a false KILL is missing a real effect.

Currently this decision is made in a research group meeting based on statistical significance of the pilot (which is insufficient — p < 0.05 in a small pilot is barely meaningful) and the enthusiasm of the PI.

### Existing solution
- Internal research group discussion
- Power analysis (handles only one dimension of the problem — sample size for power)
- Pre-registration (addresses HARKing but not the multi-dimensional falsification question)
- Peer review (happens too late — after the large study is done)

### Switching cost
**High institutional friction, low individual friction.** An individual researcher can use HypothesisOS to structure their own pilot evaluation. An institution cannot mandate it — no IT approval is needed for a personal tool, but a department-wide adoption would require process change and buy-in.

### HypothesisOS value proposition
A structured pre-study decision framework. Before applying for the large grant, the researcher encodes the pilot evidence into 8 dimensions and gets a calibrated verdict. If the verdict is KILL with calibration 70+, the pilot failed to meet the GO criteria — the large study is not justified by the evidence. The go/no-go framework maps directly onto the GRADE evidence quality system that researchers already use.

### Willingness to pay
**$29–49/month individual, $199/month lab tier.** Academic WTP is the weakest of all five segments. Researchers expect free tools or grant-funded tools. A researcher who is personally funded and has real career risk around a go/no-go decision is the exception. The path to academic revenue is institutional licensing, which requires a sales cycle the product cannot support yet.

**WTP signal to watch for:** Does the researcher use the tool to encode evidence from a paper they're writing, not just a demo hypothesis? If they bring real research data, the tool is in their workflow.

---

## Segment 5 — Corporate R&D Teams

### Core pain
A corporate R&D team at a large firm (pharma, tech, FMCG) runs 5–20 innovation hypotheses simultaneously. Each hypothesis represents a potential product line or market entry. Resources are allocated by senior leadership based on internal champion advocacy — whoever tells the best story gets the budget. Structural falsification of the underlying evidence rarely happens before a $5M commitment.

### Existing solution
- McKinsey/BCG strategy frameworks (market size, competitive positioning — not evidence-based falsification)
- Internal stage-gate processes (often compliance theater)
- PowerPoint decks with selectively chosen evidence
- Innovation portfolio tracking in Salesforce/internal tools

### Switching cost
**Very high.** Corporate R&D teams operate in institutional risk-aversion mode. A new tool needs IT approval, security review, legal review, procurement, and a pilot program. Individual employees cannot expense $40/month tools without approval in most large corps. The buying cycle is 6–18 months.

### HypothesisOS value proposition
If the tool is embedded in the stage-gate process as a required falsification step before Stage 2/3 approval, it becomes a structural check on false GOs. The value is not in individual use — it's in institutional mandating. One prevented false GO on a $5M commitment pays for 10 years of enterprise licenses.

### Willingness to pay
**$2,000–10,000/month enterprise.** WTP is the highest but the buying cycle is the longest. This segment is a year 3 opportunity, not year 1. Do not target first.

**WTP signal to watch for:** A senior director or VP inside a large firm personally using the tool and pushing for a team license. Bottom-up adoption from a power user is the only realistic entry path.

---

## Ranked Opportunity Summary

| Segment | Pain Severity | WTP | Urgency | Adoption Friction | Priority |
|---------|--------------|-----|---------|-------------------|----------|
| Startup Studios | HIGH | HIGH | HIGH | MEDIUM | **#1** |
| VC Analysts | HIGH | HIGH | MEDIUM | LOW | **#2** |
| Startup Founders | MEDIUM | MEDIUM | HIGH | MEDIUM | **#3** |
| Researchers | MEDIUM | LOW | MEDIUM | LOW | **#4** |
| Corporate R&D | HIGH | VERY HIGH | LOW | VERY HIGH | **Year 3** |

---

## The Adoption Killer (Honest Assessment)

**Evidence encoding is the #1 barrier for every segment.**

All five segments will face the same friction: translating their actual evidence (qualitative interviews, spreadsheet metrics, lab results) into 8 structured numeric fields. This translation requires judgment, domain knowledge, and time. For a founder with 20 minutes before a pitch meeting, it won't happen. For an analyst with 15 deals in the pipeline, it won't happen consistently.

The product's value is real, but it is front-loaded behind an encoding wall that most users won't clear without motivation from prior pain. That prior pain — having made an expensive false GO — is the prerequisite for genuine adoption.

**Translation:** the best early users are people who have already lost money on a decision they should have killed earlier. They are not looking for HypothesisOS; they do not know it exists. Finding them requires direct outreach, not SEO or product-led growth.
