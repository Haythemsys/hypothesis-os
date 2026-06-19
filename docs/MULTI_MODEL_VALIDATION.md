# MULTI_MODEL_VALIDATION.md — Phase K3 — HypothesisOS

**Date:** 2026-06-19  
**Purpose:** Understand where HypothesisOS's deterministic layer creates value relative to LLM-style reasoning, and where it does not  
**Study basis:** n=20 outcome study (85% accuracy, 0% false GO vs. baseline 80% / 9.1% false GO)

---

## Design

The same five representative cases are evaluated across four reasoning styles. Each style is simulated based on its actual characteristics — not caricatured. If two styles would reach the same verdict for honest reasons, this document says so.

**Cases selected:**

| # | Case | Expected verdict | Why selected |
|---|------|-----------------|--------------|
| 1 | sugar_hyperactivity | KILL | Null effect replicated many times; effect = 0.02 |
| 2 | ego_depletion | KILL | Failed hostile replication; hostileSurvival = 0.15 |
| 3 | neural_scaling_laws | GO | Strong evidence, replication confirmed, CI excludes null |
| 4 | bitcoin_store_of_value | UNRESOLVED | Genuinely contested; mixed evidence across domains |
| 5 | social_media_teen_depression | UNRESOLVED | Over-killed by HypothesisOS in the n=20 study |

**Four reasoning styles:**

| Style | Core characteristic |
|-------|-------------------|
| **HypothesisOS** | Deterministic kill gates, pre-registered thresholds, structured evidence packet |
| **Claude-style LLM** | Careful, uncertainty-acknowledging, strong at nuance and caveats, hedges toward UNRESOLVED |
| **DeepSeek-style LLM** | Chain-of-thought intensive, systematic step-by-step, explicit probabilistic reasoning |
| **Gemini-style LLM** | Breadth-first, references multiple sources and consensus, comprehensive coverage |

---

## Case 1 — sugar_hyperactivity

**Claim:** Sugar causes hyperactivity in children  
**Evidence packet:** effect = 0.02, replication = 0.90, hostileSurvival = 0.85, confoundControl = 0.80, power = 0.85  
**Expected verdict: KILL**

| Style | Verdict | Reasoning | Key failure mode |
|-------|---------|-----------|-----------------|
| **HypothesisOS** | **KILL** | Effect = 0.02 fires the effect-size kill gate (floor: 0.15) immediately. No other dimensions are consulted. The verdict is reached in one step regardless of replication quality. | None on this case. The gate exists precisely for this structure: high-quality evidence of zero effect. |
| **Claude-style LLM** | **KILL** | Would note that the double-blind trials are plentiful and well-controlled, identify the near-zero effect size as decisive, and likely state the consensus clearly. Would probably add nuance about parental expectation effects, but would not let that nuance flip the verdict. | Nuance framing ("parental perception is real even if physiological effect is not") could slightly soften the KILL, but a well-prompted Claude response should reach KILL correctly. |
| **DeepSeek-style LLM** | **KILL** | Would walk through each dimension explicitly: enumerate the Wolraich et al. meta-analyses, compute or acknowledge the d ≈ 0 effect, note that replication is high, and conclude that high replication of null findings = KILL, not GO. The step-by-step process makes the logic transparent. | Verbose reasoning process is not a failure mode here — it reaches the correct answer. No structural failure. |
| **Gemini-style LLM** | **KILL** | Would cite NIH, WHO, and major pediatric health bodies, all of which explicitly debunk the claim. Consensus is unambiguous. Would likely cite the 1995 JAMA meta-analysis and the Wolraich studies. | Consensus-deferral is safe here because the consensus is correct and well-established. No failure mode on this case. |

**Analysis:** All four styles reach KILL correctly. This is the clearest case in the set — the structure is: many high-quality studies, all finding the same null. Any competent evaluator, structured or not, converges here. HypothesisOS does not add value through reasoning quality; it adds speed and reproducibility. An LLM with a bad day or bad prompt could theoretically confuse "high replication" with "strong evidence FOR," but a careful LLM would not.

**Where HypothesisOS adds value here:** Consistency across thousands of evaluations. An LLM might produce KILL 19 times and UNRESOLVED once due to prompt variation. HypothesisOS produces KILL every time the same evidence packet is submitted.

---

## Case 2 — ego_depletion

**Claim:** Willpower is a depletable resource (ego depletion)  
**Evidence packet:** effect = 0.35, replication = 0.30, hostileSurvival = 0.15, confoundControl = 0.55, power = 0.40  
**Expected verdict: KILL**

| Style | Verdict | Reasoning | Key failure mode |
|-------|---------|-----------|-----------------|
| **HypothesisOS** | **KILL** | hostileSurvival = 0.15 fires the hostile-survival kill gate (floor: 0.34) immediately. The 2016 Hagger et al. pre-registered multi-lab replication failure is structurally captured here. Effect size is moderate but above the effect kill floor — the hostile survival gate decides alone. | None on this case. This is the exact failure mode the gate was designed for: an effect that looks moderate in original studies but collapses under methodological scrutiny. |
| **Claude-style LLM** | **UNRESOLVED (likely)** | Would acknowledge the Hagger et al. replication failure, the Inzlicht critiques, and the Carter et al. meta-analysis showing effect near zero after correcting for publication bias. But would also note that Baumeister's original findings were not fabricated, that glucose mechanisms have some support, and that the construct may be real in some contexts. The result: probably UNRESOLVED, or a carefully hedged KILL with heavy qualifications. | This is where Claude-style reasoning fails. The nuance is real — but in a decision context, "real in some contexts but failed systematic replication" is a KILL. Hedging to UNRESOLVED is too generous to a hypothesis that failed a pre-registered hostile test. |
| **DeepSeek-style LLM** | **KILL (likely)** | Would enumerate: original Baumeister effect sizes, Hagger multi-lab failure (d ≈ 0.04 in the registered replication), Carter and McCullough meta-analysis corrected estimates. The chain-of-thought process would likely surface the hostile replication as decisive and conclude KILL. More confident than Claude-style because the reasoning process forces explicit treatment of each study. | Lower failure probability than Claude-style. But if the reasoning chain dwells too long on "some real-world validity" it might also soften to UNRESOLVED. The explicit probabilistic framing reduces but does not eliminate this risk. |
| **Gemini-style LLM** | **UNRESOLVED (possible)** | Would cite the original positive studies, the Hagger replication failure, ongoing research into glucose and decision fatigue. Breadth-first coverage gives roughly equal weight to supporting and challenging evidence. The APA and popular science sources still partially support the construct, which could pull toward UNRESOLVED or a soft KILL. | Consensus-seeking is harmful here because the "consensus" in popular psychology still partially endorses ego depletion. Academic consensus post-2016 is KILL, but the breadth of sources may dilute this. |

**Analysis:** This is the first case where structure demonstrably helps. Claude-style and Gemini-style reasoning are genuinely at risk of UNRESOLVED because the nuance is real and the popular framing still treats the construct as viable. DeepSeek-style reasoning does better due to explicit step-by-step weighting. HypothesisOS fires the kill gate on a single dimension that directly captures the failure mode (hostile test failure) and reaches KILL deterministically.

**HypothesisOS adds clear value here.** The advantage is not that LLMs are dumb — it is that the structure forces a decision on the hostile survival dimension specifically, rather than averaging it with other dimensions that look more positive.

---

## Case 3 — neural_scaling_laws

**Claim:** Neural network performance scales predictably with compute, data, and parameters  
**Evidence packet:** effect = 0.92, replication = 0.88, hostileSurvival = 0.80, confoundControl = 0.75, power = 0.90  
**Expected verdict: GO**

| Style | Verdict | Reasoning | Key failure mode |
|-------|---------|-----------|-----------------|
| **HypothesisOS** | **GO** | All dimensions clear all kill floors. Support score ≈ 0.87. Threshold for GO is 0.65. Verdict reached: GO. Clean case. | None. When evidence is uniformly strong, the deterministic layer confirms GO and adds no distortion. |
| **Claude-style LLM** | **GO** | Would confirm the Kaplan et al. findings, note the consistent replication across modalities (language, vision, coding, multimodal), mention the emergent behavior debate but correctly frame that as a refinement question rather than a refutation. Would reach GO with appropriate caveats about compute efficiency and architectural variations. | The caveat framing (emergent behavior debates, efficiency curves, architectural dependence) is accurate and not a failure mode — it is honest GO with proper uncertainty bounds. |
| **DeepSeek-style LLM** | **GO** | Would enumerate the OpenAI, DeepMind, and Anthropic scaling studies, note consistency across independent labs, address the Hoffmann et al. compute-optimal refinement (which confirms rather than refutes scaling), and reach GO with high confidence. | No failure mode. The systematic approach reinforces GO rather than undermining it. |
| **Gemini-style LLM** | **GO** | Would cite Chinchilla, GPT-4 technical report, PaLM, and Gemini scaling data. Breadth-first coverage here is advantageous because the evidence is genuinely broad and consistent. Consensus across major AI labs is unambiguous. | No failure mode. Consensus-deferral is safe because the consensus is correct and backed by primary data. |

**Analysis:** All four styles reach GO correctly. This is the inverse of sugar_hyperactivity — strong evidence is strong evidence, and every evaluator reads it that way. HypothesisOS adds no reasoning value here, only the same consistency benefit as in Case 1.

**Honest finding:** When evidence is uniformly strong, LLM reasoning is equally good. The deterministic layer confirms but does not rescue the verdict.

---

## Case 4 — bitcoin_store_of_value

**Claim:** Bitcoin functions as a reliable store of value  
**Evidence packet:** effect = 0.45, replication = 0.40, hostileSurvival = 0.45, confoundControl = 0.38, power = 0.42  
**Expected verdict: UNRESOLVED**

| Style | Verdict | Reasoning | Key failure mode |
|-------|---------|-----------|-----------------|
| **HypothesisOS** | **UNRESOLVED** | No kill floor is breached (all dimensions above their respective floors of 0.15, 0.34, 0.20). Support score ≈ 0.42 — below GO threshold (0.65) and above KILL ceiling (0.35). Returns UNRESOLVED correctly. | None on this case. The thresholds correctly carve out the middle territory. |
| **Claude-style LLM** | **UNRESOLVED** | Would note: (a) gold-standard store-of-value properties (portability, divisibility, scarcity) are technically satisfied; (b) volatility of 80%+ drawdowns undermines the "reliable" qualifier; (c) institutional adoption trend is positive but incomplete; (d) regulatory uncertainty is a live variable. Would reach UNRESOLVED explicitly with a strong framing of what would move the verdict either direction. | No failure mode. Claude-style reasoning handles genuinely contested, multi-axis claims well. This is the case type where LLM reasoning adds value over a deterministic system — articulating the structure of the contestation clearly. |
| **DeepSeek-style LLM** | **UNRESOLVED** | Would walk through volatility data, supply cap mechanics, Grayscale and MicroStrategy institutional holdings, correlation with risk assets in drawdowns, and regulatory frameworks by jurisdiction. Would likely assign rough probability estimates to each factor and conclude UNRESOLVED with explicit uncertainty range. | No failure mode. May over-quantify in a domain where the uncertainty is structural rather than statistical, but the verdict is correct. |
| **Gemini-style LLM** | **UNRESOLVED (with KILL risk)** | Breadth-first coverage would surface the 2022 bear market, the FTX collapse context, and skeptical economist consensus (Roubini, Krugman, etc.). This could pull the verdict toward KILL. But would also surface institutional adoption and inflation-hedge arguments. More likely to produce UNRESOLVED, but KILL is a real risk depending on source weighting. | If the response weights economist consensus over market data and technical properties, it may reach a harder KILL than the evidence warrants. Consensus on Bitcoin is genuinely split by domain (economists vs. technologists vs. investors), and breadth-first coverage without domain weighting can produce the wrong result. |

**Analysis:** HypothesisOS and Claude-style LLM both handle this well. The interesting finding is that Claude-style reasoning may actually add value here over HypothesisOS — articulating *why* this is UNRESOLVED and *what would move the verdict* is more useful to a decision-maker than "verdict: UNRESOLVED." Gemini-style has a real failure risk due to unweighted consensus-deferral in a domain where expert opinion is split by background.

---

## Case 5 — social_media_teen_depression

**Claim:** Social media use causally increases depression in teenagers  
**Evidence packet:** effect = 0.35, replication = 0.45, hostileSurvival = 0.20, confoundControl = 0.18, power = 0.55  
**Expected verdict: UNRESOLVED (HypothesisOS returned KILL — this is the documented over-kill)**

| Style | Verdict | Reasoning | Key failure mode |
|-------|---------|-----------|-----------------|
| **HypothesisOS** | **KILL (incorrect)** | confoundControl = 0.18 fires the confound-control kill gate (floor: 0.20). hostileSurvival = 0.20 is right at the floor. The engine treats "poor confound control on the causal claim" as equivalent to "claim is refuted." But "the causal evidence is weak" and "the causal claim is false" are different epistemic states. | This is the engine's documented failure mode: it cannot distinguish "the evidence base is immature and confounded" from "hostile tests ran and failed." The causal link may still be real — just not yet demonstrated cleanly. KILL overstates the refutation. |
| **Claude-style LLM** | **UNRESOLVED** | Would note: (a) large observational studies show correlation; (b) Haidt and Twenge vs. Orben and Przybylski debate is live and ongoing; (c) pre-registered trials (Allcott et al. Facebook deactivation study) show modest effects; (d) directionality is contested (depressed teens may use social media more); (e) effect sizes vary hugely by platform, use type, and demographic. Would likely reach UNRESOLVED and frame the open questions precisely. | No failure mode. This is exactly the type of case where acknowledging structured uncertainty is the right answer. Claude-style reasoning handles it better than HypothesisOS. |
| **DeepSeek-style LLM** | **UNRESOLVED** | Would enumerate the Haidt et al. causal arguments, the Orben and Przybylski specification curve showing effect sizes range from -0.05 to +0.15 depending on analytical choices, and the experimental evidence from social media deactivation studies. Would likely conclude the causal direction has some support but is not established, reaching UNRESOLVED with explicit confidence intervals. | No failure mode. The systematic enumeration of contradictory findings leads correctly to UNRESOLVED. |
| **Gemini-style LLM** | **UNRESOLVED** | Would surface the CDC depression trend data, the major academic debate (Haidt vs. Orben), the platform-specific effects (Instagram vs. TikTok vs. passive consumption), and the ongoing Congressional hearings and regulatory discussions. Breadth-first coverage actually helps here — the controversy is real and widely documented. | No failure mode. Breadth-first coverage of a genuinely contested topic produces UNRESOLVED correctly. |

**Analysis:** This is the clearest case where the deterministic layer fails and LLM reasoning succeeds. All three LLM styles reach the correct verdict (UNRESOLVED). HypothesisOS fires a kill gate on confound control that correctly identifies weak causal evidence but incorrectly treats this as a refutation rather than an evidence gap.

**Root cause of HypothesisOS failure:** The kill gates cannot distinguish between:
- "confoundControl = 0.18 because hostile tests ran and found unmeasured confounds sinking the effect" (KILL-eligible)
- "confoundControl = 0.18 because observational studies dominate and RCTs have not been run at scale" (UNRESOLVED-eligible)

The evidence packet encodes a number but not its provenance. This is a structural limitation of the current architecture, documented as Fix 1 in OUTCOME_STUDY_V1_REPORT.md.

---

## Comparison Matrix

| Case | Expected | HypothesisOS | Claude-style | DeepSeek-style | Gemini-style |
|------|----------|:------------:|:------------:|:--------------:|:------------:|
| sugar_hyperactivity | KILL | **KILL ✓** | **KILL ✓** | **KILL ✓** | **KILL ✓** |
| ego_depletion | KILL | **KILL ✓** | UNRESOLVED ✗ | **KILL ✓** | UNRESOLVED ✗ |
| neural_scaling_laws | GO | **GO ✓** | **GO ✓** | **GO ✓** | **GO ✓** |
| bitcoin_store_of_value | UNRESOLVED | **UNRESOLVED ✓** | **UNRESOLVED ✓** | **UNRESOLVED ✓** | UNRESOLVED / KILL risk |
| social_media_teen_depression | UNRESOLVED | KILL ✗ | **UNRESOLVED ✓** | **UNRESOLVED ✓** | **UNRESOLVED ✓** |
| **Correct verdicts (of 5)** | | **4/5** | **4/5** | **5/5** | **3.5/5** |

*Gemini-style receives 0.5 credit on bitcoin due to the real KILL risk from unweighted consensus-deferral in a split-expert domain.*

---

## Does the Deterministic Layer Create Value?

**Yes — in a specific, important case class. No — in others. The answer is not uniform.**

### Where HypothesisOS creates clear value

**Case type: Single-dimension failures hidden by aggregate evidence quality.**

Sugar hyperactivity and ego depletion share the same structure: the evidence base is substantial, some dimensions look strong, but one dimension is decisive. HypothesisOS fires the relevant kill gate immediately. LLM-style reasoning is at risk of averaging across dimensions and reaching a verdict that matches neither the strong dimensions nor the decisive weak one.

Ego depletion is the clearest demonstration. Claude-style reasoning is genuinely likely to return UNRESOLVED because the nuance is real — there are real studies, the effect is not fabricated, the construct has some popular-psychological validity. The kill gate on hostileSurvival cuts through this and names the precise failure mode: the effect collapsed under pre-registered hostile replication. This is a better answer for a decision-maker than "contested."

**Consistency across scale.** LLM verdicts vary with prompt phrasing, temperature, and context window. HypothesisOS produces identical output for identical evidence packets. For a product that evaluates hypotheses at scale, this reproducibility is a feature with standalone value independent of reasoning quality.

**Auditability.** The kill gate that fired, the dimension that triggered it, and the pre-registered threshold are all in the output. An LLM's reasoning is not auditable in the same way — it cannot be checked against a pre-registered protocol.

### Where LLM reasoning is equally good or better

**Strong evidence cases (neural_scaling_laws, sugar_hyperactivity).** When evidence is uniformly strong or uniformly null, all evaluators converge. The deterministic layer adds speed and consistency, not reasoning quality.

**Genuinely contested cases requiring structured uncertainty (bitcoin, social_media_teen_depression).** This is the harder finding. Claude-style and DeepSeek-style reasoning handle these better than HypothesisOS because they can distinguish between "evidence base is immature" and "claim is refuted." The UNRESOLVED verdict from an LLM often carries more epistemic information than UNRESOLVED from HypothesisOS — it comes with a structured explanation of what is contested and what evidence would move the verdict.

Social media and teen depression is the clearest case: HypothesisOS returns KILL incorrectly. All three LLM styles return UNRESOLVED correctly. The LLM reasoning is better here — not because it is more sophisticated in general, but because the kill-gate architecture cannot represent the epistemic state "evidence is weak for reasons other than refutation."

### Summary

| Where deterministic layer helps | Where it does not |
|--------------------------------|-------------------|
| Single-dimension failures masked by high aggregate quality | Uniformly strong or null evidence (all evaluators converge anyway) |
| Cases requiring pre-registered hostile test thresholds | Genuinely contested domains requiring structured uncertainty |
| Scale and consistency across many evaluations | Cases where distinguishing "evidence gap" from "refutation" matters |
| Auditability and reproducibility | Cases where articulating the reason for uncertainty adds decision value |

**Bottom line:** The deterministic layer solves a real problem — it prevents high-quality evidence of null effects from being misread as evidence for the claim, and it prevents hospitable-sounding overall evidence from obscuring a single decisive failure. It does not solve the harder problem of distinguishing immature evidence from refuted evidence, and it is not better than careful LLM reasoning on cases where the contestation itself is the signal.

The five-case comparison shows each approach getting 4/5 correct (HypothesisOS) or 4-5/5 correct (LLM styles), with complementary failure modes. HypothesisOS wins on ego_depletion; all three LLM styles win on social_media_teen_depression. This suggests a hybrid architecture — deterministic gates for kill-eligible failure modes, structured LLM reasoning for ambiguous epistemic states — would outperform either approach alone.

---

## What This Validation Does and Does NOT Prove

### What it proves

**1. Kill gates add value on the specific case class they were designed for.**  
The ego depletion case demonstrates that a pre-registered threshold on hostile survival, applied deterministically, catches a failure that LLM-style averaging misses. This is not a trivial result — it shows the architecture has a valid theory of failure modes.

**2. The false GO rate advantage from the n=20 study is structurally explained.**  
The baseline LLM's false GO on sugar_hyperactivity is not a random error — it is a predictable consequence of averaging logic that cannot distinguish "high-quality null" from "high-quality positive." The kill gate on effect size eliminates this failure mode entirely, and the mechanism is now understood.

**3. LLM-style reasoning is competitive on most case types.**  
This is an honest finding that the validation was designed to surface. On 3 of 5 cases in this set, LLM styles perform as well as HypothesisOS. The deterministic layer is not uniformly better.

**4. Gemini-style consensus-deferral has a specific failure risk on contested expert domains.**  
When expert consensus is split by background (technologists vs. economists on Bitcoin; quantitative vs. qualitative researchers on social media effects), breadth-first source aggregation without domain weighting produces unreliable verdicts. This is a structurally predictable failure mode, not a random one.

### What it does NOT prove

**1. These LLM simulations are not live model outputs.**  
"Claude-style," "DeepSeek-style," and "Gemini-style" reasoning is modeled based on documented characteristics, not live queries to each model. Actual model outputs vary with prompt engineering, system prompts, context, and model version. Real models might perform better or worse than simulated here on individual cases.

**2. n=5 is not a statistical finding.**  
The five cases were selected to be representative, not random. The 4/5 vs. 5/5 vs. 3.5/5 comparison matrix above is illustrative, not a statistically valid comparison of the reasoning approaches. The n=20 outcome study in OUTCOME_STUDY_V1_REPORT.md provides the statistical basis; this document explains mechanism.

**3. This does not show HypothesisOS beats optimally prompted LLMs.**  
A carefully prompted frontier LLM with a structured evidence packet, explicit kill-gate instructions, and pre-registered thresholds might reproduce most of what HypothesisOS does. The comparison here is against default LLM reasoning patterns. HypothesisOS's advantage is that the structure is baked in and reproducible — not that it is unreplicable by a sufficiently engineered prompt chain.

**4. The failure mode on social_media_teen_depression is documented, not fixed.**  
The over-kill rate (40% on UNRESOLVED cases in the n=20 study) is a real limitation. This validation documents the mechanism but does not resolve it. The recommended fix — distinguishing "no hostile tests attempted" from "hostile tests failed" — is proposed in OUTCOME_STUDY_V1_REPORT.md Fix 1 and is not yet implemented.

**5. This does not address the evidence encoding problem.**  
Every result in this validation depends on the accuracy of the structured evidence packet. If the evidence packet is wrong — wrong effect size, missing studies, incorrect domain flags — every evaluator produces the wrong answer. HypothesisOS does not solve the evidence encoding problem; it assumes a correctly populated packet. The Netflix streaming miss in the n=20 study is a reminder that this assumption is not always met.

---

*Related documents: OUTCOME_STUDY_V1_REPORT.md (n=20 study), ARCHITECTURE.md (kill gate specifications), CALIBRATION_SYSTEM.md (threshold rationale)*  
*Phase K3 — Multi-model validation layer*
