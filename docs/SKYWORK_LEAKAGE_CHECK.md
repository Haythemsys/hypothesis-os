# SKYWORK LEAKAGE CHECK

**Document:** Phase 4  
**Date:** 2026-06-19  
**Method:** Automated scan of `evidence_available_at_time` and `decision_taken` for outcome-leaking terms

---

## Scan Terms

```
failed, succeeded, collapsed, bankrupt, retracted, proven false, later shown,
shut down, went under, acquired for, ipo pulled, fraud, liquidated, never launched,
discontinued, was wrong, turned out, it turned out, ultimately
```

## Results

**Total cases scanned:** 125  
**Cases with potential leakage:** 1  
**Cases excluded:** 0

---

## Case Detail

| Case ID | Flag Term | Field | Text excerpt | Classification |
|---------|-----------|-------|-------------|----------------|
| BS_016 | "failed" | evidence_available_at_time | "Poor treatment of Macs in 'big box' retailers; low market share (~3%); Gateway's **failed** retail experiment." | **CLEAN** |

**Reasoning for BS_016:** The word "failed" refers to Gateway's prior retail expansion attempt (Gateway Country stores, 1990s–early 2000s), which was publicly known and documented before Apple's May 2001 decision to open its own stores. This is legitimate historical context, not a leak of Apple's future outcome. Expected verdict is GO (Apple succeeded) — the presence of "Gateway's failed experiment" is an argument against Apple's hypothesis at the time, making it if anything a conservative input. No information about Apple's outcome is present.

---

## Additional Leakage Found — Sources URLs and data_quality_notes

**Source URLs (16 cases):** Many URLs contain outcome-revealing path segments (e.g., "quibi-shutting-down-6-months", "how-google-glass-failed", "ltcm-near-failure"). These were identified in a second pass.

**data_quality_notes (20 cases):** Notes written by the Skywork pipeline describe outcomes (e.g., "Extensively documented failure with public statements from founders", "Retracted for fraud").

**Resolution:** Both `sources` and `data_quality_notes` fields were **removed entirely** from `blinded_cases.jsonl`. Only these 7 fields are present in the blinded file:
- case_id, domain, hypothesis, decision_date, decision_maker, evidence_available_at_time, decision_taken, confounds

## Leakage in Blinded File

Blinded `blinded_cases.jsonl` was programmatically verified to contain none of the following fields:
- `known_outcome` — ABSENT
- `expected_verdict` — ABSENT  
- `why_expected_verdict` — ABSENT
- `outcome_date` — ABSENT
- `failure_mode` — ABSENT
- `success_mode` — ABSENT

---

## Classification Summary

| Status | Count | Action |
|--------|-------|--------|
| CLEAN (evidence text) | 124 | Kept |
| AMBIGUOUS (context-dependent, kept) | 1 (BS_016) | Kept — leakage is Gateway's prior failure, not Apple's outcome |
| LEAK in sources URLs | 16 | sources field removed from blinded_cases.jsonl |
| LEAK in data_quality_notes | 20 | data_quality_notes field removed from blinded_cases.jsonl |
| EXCLUDED | 0 | None excluded — field removal sufficient |

**Usable cases for blind evaluation: 125/125**  
**Fields stripped from blinded file: sources, data_quality_notes**
