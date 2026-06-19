# Use Case Library — HypothesisOS

**Phase P validation document**
**Date:** 2026-06-19
**25 real-world decisions structured as falsification problems**

Each use case describes: the decision at stake, the evidence typically available, the common mistake, and how structured falsification changes the outcome. These are representative scenarios, not documented case studies — no specific organizations or individuals are named.

---

## Category A — Product & Startup Decisions

### UC-01: Launch a SaaS product
**Decision:** Launch publicly vs. continue in private beta.
**Evidence typically available:** 50–200 beta users, NPS data, 2–3 interviews, usage analytics, early churn rate.
**Typical mistake:** Interpret high NPS (e.g., 70) as PMF signal without testing hostile conditions — does NPS hold when the free trial ends and pricing is shown? Does it hold across customer segments or only among early enthusiasts?
**How HypothesisOS helps:** Encodes NPS as replication signal (0.4 if single cohort), forces hostile survival score (did you test with paying users?), surfaces the confound that early adopters are self-selected. A KILL verdict here means "the evidence does not yet justify a public launch" — not that the product is bad.

---

### UC-02: Hire a key executive
**Decision:** Offer VP of Sales role to an internal candidate vs. external search.
**Evidence typically available:** Internal candidate's revenue track record (2 data points), culture fit signals, 360 feedback from 3 colleagues.
**Typical mistake:** Two positive quarters is not replication — it's one data point in two time periods with shared confounds (same market, same product, same team). Hostile survival (how did they perform in a difficult quarter?) is rarely asked.
**How HypothesisOS helps:** Forces the question: what would kill this hire hypothesis? The calibration score will be low (few data points, limited hostile testing) — meaning the verdict will be UNRESOLVED with low confidence, which is honest. The decision can proceed but the evidence doesn't support confident GO.

---

### UC-03: Pivot to a new target customer
**Decision:** Abandon the current ICP and pivot to an adjacent segment.
**Evidence typically available:** 5–10 conversations with prospective customers in the new segment, one LOI or verbal commitment, enthusiasm in demos.
**Typical mistake:** Confuse "they said they'd pay" with "they paid." Verbal commitments survive hostile conditions poorly. Replication is 0 (one segment, one set of conversations). Confound: the conversations were led by a founder who is highly charismatic.
**How HypothesisOS helps:** Hostile survival dimension forces encoding of counter-evidence — what happened when you showed them the actual price, the actual UX, the actual onboarding complexity? If hostile survival is 0.2, the hypothesis is KILL or UNRESOLVED.

---

### UC-04: Double down on a paid acquisition channel
**Decision:** Scale ad spend on a channel with positive ROAS over 3 months.
**Evidence typically available:** 3 months of ROAS data, creative performance breakdown, cohort LTV (immature — 90-day LTV only).
**Typical mistake:** Scale on positive ROAS before testing whether the signal replicates at higher spend (common failure: channel saturates, CAC doubles at 3x budget), and before LTV is mature enough to confirm profitability.
**How HypothesisOS helps:** Effect dimension = measured ROAS delta (small to medium). Replication = 0.3 (3 months, single channel). Generalization = low if not tested across geographies or audiences. The verdict will be UNRESOLVED — scale carefully, don't bet the budget.

---

### UC-05: Kill a product feature
**Decision:** Remove a feature that shows low usage but has vocal advocates.
**Evidence typically available:** Usage data (5% of users use it), qualitative feedback from those users ("I'd leave without it"), no churn attribution study.
**Typical mistake:** Conflate "vocal users love it" with "losing this causes churn." The two are not the same. No hostile test has been run: would those users actually leave, or just complain?
**How HypothesisOS helps:** Hypothesis is "removing Feature X increases churn." Effect: unmeasured. Hostile survival: low (no actual removal test). Confound control: moderate (these users are power users who use everything). Verdict will be UNRESOLVED — run a controlled removal experiment before deciding.

---

### UC-06: Enter a new geographic market
**Decision:** Expand a US SaaS product to the UK market.
**Evidence typically available:** 12 inbound UK signups last month, 2 customer interviews, competitor analysis showing gaps.
**Typical mistake:** Treat inbound demand from a new geography as a signal of scalable demand without testing whether the UK market has the same buying behavior, compliance requirements, and willingness to pay at your current price point.
**How HypothesisOS helps:** Replication = 0.1 (2 interviews). Generalization = 0.2 (different regulatory context, no behavioral data in the new market). KILL or UNRESOLVED — the evidence does not support an expansion decision.

---

### UC-07: Price increase on an existing product
**Decision:** Raise pricing by 40% for existing customers.
**Evidence typically available:** Churn rate (3% monthly), NPS (65), competitive pricing analysis, finance model showing need for higher revenue.
**Typical mistake:** Conflate current retention (which may be sticky) with post-price-increase retention. No hostile test: what happens when you tell the bottom 30% of your customer base that the price is going up?
**How HypothesisOS helps:** Forces encoding of hostile survival — did you test price sensitivity on a segment? If not, the score is 0.0 and the hypothesis gets killed. A price increase test on 10% of the base, tracked for 60 days, would raise the score. Without it, the verdict is KILL on evidence grounds.

---

### UC-08: Acquire a startup
**Decision:** Proceed to term sheet for a $5M acqui-hire.
**Evidence typically available:** Founder interviews, 3 customer references, ARR ($200K), 6-month growth rate, technical due diligence report.
**Typical mistake:** Weight founder quality and growth trajectory without asking the falsification question: what kills the investment thesis? If the thesis is "their technology accelerates our roadmap by 12 months," that hypothesis needs to be encoded and checked against the technical DD.
**How HypothesisOS helps:** Separate the acquisition thesis from the company metrics. Encode the technology hypothesis specifically: effect = acceleration claim (medium confidence), replication = 0 (one technical review), hostile survival = low (not tested against your actual codebase). Verdict: UNRESOLVED. The acquisition decision cannot be justified by the technology thesis alone.

---

### UC-09: Raise a Series A
**Decision:** Go to market for a Series A on current traction.
**Evidence typically available:** $800K ARR, 140% net revenue retention, 3 enterprise customers, 8-month runway.
**Typical mistake:** Assume that strong unit economics + revenue retention = Series A ready. The investor hypothesis is different: "this company can deploy $5–10M efficiently to 10x ARR." The evidence for that hypothesis is much thinner than the ARR evidence.
**How HypothesisOS helps:** Forces the founder to encode evidence for the growth hypothesis, not just the current metrics. Replication: how many growth experiments have scaled? Generalization: does the current GTM motion translate to new segments? Calibration will be low — the verdict will be UNRESOLVED, meaning "you have strong early evidence but the growth hypothesis hasn't been proven."

---

### UC-10: Shut down a product line
**Decision:** Kill a product that generates $50K ARR but consumes 40% of engineering.
**Evidence typically available:** Revenue data, engineering cost estimate, 2 customers who use it heavily, 1 customer request to expand it.
**Typical mistake:** Frame the decision as "revenue vs. cost" rather than as a hypothesis test. The hypothesis should be "investing more in this product line produces returns that justify the opportunity cost." Tested that way, the evidence is thin: effect is unproven, replication is 0 (have you ever tried to grow it?).
**How HypothesisOS helps:** Converts the sunset decision into a falsification of the growth hypothesis for that product line. If the verdict is KILL, the shutdown is evidence-justified. If UNRESOLVED, consider a 90-day experiment before shutting down.

---

## Category B — Investment & Due Diligence

### UC-11: Pre-seed investment decision
**Decision:** Lead a $250K pre-seed round for a consumer app.
**Evidence typically available:** 500 beta users, 22% week-2 retention, founder's 2 relevant exits, 10 user interviews.
**Typical mistake:** Weight founder quality as the primary signal without testing the consumer hypothesis. 22% week-2 retention in a consumer app is thin — what's week-8? Do the retained users represent the target segment or the broadest possible audience?
**How HypothesisOS helps:** Encodes the consumer hypothesis separately from the founder evaluation. Replication = 0.2 (one cohort, one acquisition channel). Power = low (n=500 is small for a consumer hypothesis). Verdict: UNRESOLVED. Invest if you have conviction on the team, but document that the market hypothesis is not proven.

---

### UC-12: Real estate investment hypothesis
**Decision:** Buy a multi-unit property in an emerging neighborhood.
**Evidence available:** 18-month price appreciation data, 2 new development permits nearby, rental yield comparison to adjacent neighborhood, 1 conversation with a local realtor.
**Typical mistake:** Treat one realtor's opinion as expert evidence and interpret recent appreciation as evidence of future appreciation (classic recency bias in investment).
**How HypothesisOS helps:** Effect = measured appreciation delta (moderate). Replication = 0.3 (one 18-month window). Hostile survival = low (was the appreciation tested against rising interest rate scenarios?). Confound control = low (the appreciation may be explained by a single development project). Verdict: UNRESOLVED.

---

### UC-13: Market entry thesis (VC perspective)
**Decision:** Thesis update: the European legal tech market is ready for US-style SaaS disruption.
**Evidence available:** 3 European legal tech deals in the last 12 months, growth of US legal tech comparables, one European founder's pitch with 15 European law firm LOIs.
**Typical mistake:** Let the US comparable's success pattern-match into a geographic generalization. European legal procurement, regulatory environment, and fee structures are meaningfully different.
**How HypothesisOS helps:** Generalization dimension directly captures this — the US pattern doesn't transfer without evidence that European law firms buy in the same way. Score: 0.2. Verdict: UNRESOLVED. The thesis needs direct European validation before fund capital is deployed.

---

## Category C — Research & Academic

### UC-14: Publish a behavioral economics paper
**Decision:** Submit a paper based on a lab study (n=120) showing a novel framing effect.
**Evidence available:** p=0.03 in the main analysis, effect size d=0.31, one failed internal replication (attributed to a protocol difference), no pre-registration.
**Typical mistake:** Rationalize the failed internal replication as a protocol artifact and submit anyway. The replication failure is evidence that deserves weight.
**How HypothesisOS helps:** Replication = 0.1 (one internal failure, zero external). Confound control = 0.3 (no pre-registration, possible HARKing). Verdict: KILL or low-confidence UNRESOLVED. This is a hard output to accept, but it correctly identifies that the evidence does not yet support publication.

---

### UC-15: Proceed to a Phase 2 clinical trial
**Decision:** Advance a therapeutic intervention from Phase 1 to Phase 2 based on pilot data.
**Evidence available:** 24-patient Phase 1 trial, 40% response rate (vs. 15% expected), no serious adverse events, early biomarker data.
**Typical mistake:** Anchor on the response rate without adequately checking whether the patient selection in Phase 1 was representative (likely not — Phase 1 patients are typically the best-case candidates).
**How HypothesisOS helps:** Generalization dimension: Phase 1 patients are not representative of the Phase 2 population — generalization is 0.2. Hostile survival: untested (were any patients treated who subsequently failed?). Effect = moderate, plausible. Verdict: UNRESOLVED. Proceed to Phase 2 with an explicit plan to address generalization.

---

### UC-16: Hire a postdoc based on a single impressive paper
**Decision:** Offer a postdoc position based on one high-impact Nature paper.
**Evidence available:** One paper (n=1 study), strong journal, high citation count, 2 reference letters.
**Typical mistake:** Citation count and journal prestige are not evidence of experimental ability — they are evidence of a good story in a competitive journal. One unreplicated paper is weak evidence.
**How HypothesisOS helps:** Effect = high (the paper itself is the effect). Replication = 0 (one study). Generalization = unknown (have they worked in your research domain?). Calibration will be LOW CONFIDENCE. Verdict: UNRESOLVED. Add a trial experiment before offering a multi-year position.

---

## Category D — Corporate & Organizational

### UC-17: Adopt a new project management methodology (e.g., OKRs)
**Decision:** Roll out OKRs company-wide after a successful pilot in one team.
**Evidence available:** One team (8 people) ran OKRs for one quarter. Velocity metrics improved by 15%. Team satisfaction score went up.
**Typical mistake:** Generalize from one team in one quarter to a company-wide mandate. Confound: the team that piloted OKRs was self-selected (they volunteered), highly motivated, and had a strong manager.
**How HypothesisOS helps:** Effect = small (15% velocity). Replication = 0 (one team). Generalization = 0.1 (self-selected team, not representative). Confound control = 0.1 (self-selection bias). Verdict: KILL. The evidence does not support a company-wide rollout. Run a second pilot with a random team.

---

### UC-18: Outsource a core function
**Decision:** Outsource customer support to a BPO after a 3-month pilot.
**Evidence available:** CSAT held at 78% during the pilot (vs. 80% internal baseline), cost per ticket dropped 35%, 2 escalations from enterprise customers about response quality.
**Typical mistake:** Treat aggregate CSAT as the success metric while ignoring the 2 escalations. Enterprise customers (highest-value) may tolerate BPO support worse than the CSAT average suggests.
**How HypothesisOS helps:** Hostile survival dimension captures the escalation signal. Confound control: BPO operated during a low-volume month. Effect: moderate on cost, small on quality. Verdict: UNRESOLVED. Extend the pilot with specific monitoring of enterprise customer CSAT separately.

---

### UC-19: Launch an internal innovation program
**Decision:** Invest $500K in a 6-month internal innovation sprint across 5 teams.
**Evidence available:** One previous innovation sprint (3 years ago) generated one product that became a $2M ARR product line. Executive sponsor enthusiasm. 40 employee applications.
**Typical mistake:** One successful case from 3 years ago with a different market context is not reliable evidence for the innovation hypothesis.
**How HypothesisOS helps:** Effect = one data point from a single prior case. Replication = 0 (that's it). Hostile survival: did any of the 3-year-ago ideas fail? Calibration will be very low. Verdict: UNRESOLVED. The investment can be justified on strategic grounds, but not on evidence of ROI.

---

### UC-20: Change the sales compensation structure
**Decision:** Move from commission-heavy to base-heavy compensation for the sales team.
**Evidence available:** 2 sales reps who left citing compensation stress, a survey showing 60% of the team is "open to change," benchmarking data showing competitors have base-heavy structures.
**Typical mistake:** Interpret survey openness to change as evidence that base-heavy compensation will improve retention and performance.
**How HypothesisOS helps:** Effect = 0 (no actual performance data on the alternative). Replication = 0. Hostile survival: have you tested whether the high performers (who set the pace) would actually prefer lower variable compensation? Verdict: KILL the current evidence base. The decision may be right but the evidence is not sufficient to justify a structural change.

---

## Category E — Personal & Individual High-Stakes

### UC-21: Accept a new job offer (role/company switch)
**Decision:** Accept a VP role at a Series B startup vs. staying at a larger company.
**Evidence available:** 3 hours of interviews, 1 Glassdoor review, public revenue data, founder LinkedIn history.
**Typical mistake:** Treat interview performance as evidence of company culture and trajectory. Interview processes are designed to sell the role, not reveal the company's true state.
**How HypothesisOS helps:** Hostile survival = 0 (no adverse condition testing — did you talk to anyone who left?). Replication = 0 (you've met the team once). Confound control = low (the founder is unusually good at pitching). Verdict: UNRESOLVED. Accept if risk tolerance is appropriate, but document that the evidence is thin.

---

### UC-22: Start an MBA program
**Decision:** Enroll in a top-10 MBA program at $200K cost.
**Evidence available:** 4 alumni conversations (all positive), career section statistics (median salary outcome), personal career model, admission offer.
**Typical mistake:** Selection bias in alumni conversations — alumni who speak at recruitment events are not representative of the median outcome.
**How HypothesisOS helps:** Replication: all 4 conversations are positive (survivorship bias — did you talk to anyone for whom it did not work?). Confound: the people who share their MBA story are systematically different from average MBA graduates. Verdict: UNRESOLVED. The investment may be right but the evidence is survivor-biased.

---

### UC-23: Publish a non-fiction book
**Decision:** Invest 18 months in writing and publishing a book on behavioral economics for practitioners.
**Evidence available:** 2,000 newsletter subscribers, 12% open rate, 5 people who said "you should write a book," 1 agent expressing informal interest.
**Typical mistake:** Interpret newsletter engagement as evidence of book demand. Newsletter subscribers read for free; book buyers pay $25–30 and must decide to allocate time.
**How HypothesisOS helps:** Effect = newsletter engagement (medium). Hostile survival = 0 (no test of willingness to pay). Replication = 0 (one newsletter, one niche). Verdict: KILL on this evidence. A pre-order or paid workshop would change the hypothesis.

---

### UC-24: Run for a board position (non-profit or corporate)
**Decision:** Pursue a board seat at a non-profit that aligns with your expertise.
**Evidence available:** 3 conversations with board members who expressed interest, 1 informal offer, your own track record in the domain.
**Typical mistake:** Treat informal interest as a reliable leading indicator of a formal offer.
**How HypothesisOS helps:** Effect = self-assessed domain relevance (high, but self-reported). Hostile survival = 0 (did you ask what concerns exist about your candidacy?). Replication: one process, no prior board experience. Verdict: UNRESOLVED. Proceed with appropriate expectation-setting.

---

### UC-25: Launch a creator business (substack, podcast, course)
**Decision:** Quit a job and go full-time on a creator business currently generating $2K/month.
**Evidence available:** 6 months of growth (from $0 to $2K), 300 paying subscribers, 40% annual renewal rate, 5 positive messages from subscribers.
**Typical mistake:** Project $2K/month at 6 months into a stable full-time income. The early growth curve in creator businesses often flattens after the initial network effect exhausts itself. $2K/month is also well below a sustainable replacement income for most.
**How HypothesisOS helps:** Effect = real ($2K MRR). Replication = 0 (one 6-month window). Hostile survival = 0 (has not tested with a price increase, has not tested what happens at month 10 when novelty fades). Verdict: KILL on the "quit the job" hypothesis. Continue building evidence while employed.

---

## Summary Patterns

Across all 25 use cases, three failure modes appear repeatedly:

1. **Replication = 0.** Single data points dressed up as patterns. The engine forces this to the surface.
2. **Hostile survival not tested.** Every positive result was gathered under favorable conditions; no adversarial test was run. The engine requires encoding this dimension.
3. **Generalization assumed, not tested.** Results in one context (one team, one cohort, one geography) are projected onto a much broader claim. Kill gate fires.

HypothesisOS does not prevent these decisions. It makes the weakness of the evidence explicit before the commitment is made.
