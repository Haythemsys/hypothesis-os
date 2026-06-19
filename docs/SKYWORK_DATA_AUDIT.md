# SKYWORK DATA AUDIT

**Document:** Phase 1  
**Date:** 2026-06-19  
**Auditor:** HypothesisOS blind validation pipeline

---

## Exact Path Found

```
/sdcard/Download/Skywork/Hypo data/2067783826771238912/v1/HYPOTHESISOS_DECISION.zip
/sdcard/Download/Skywork/Hypo data/98f638c2-9dbb-42b7-a4b9-3ba92f6ac4d9/2067790114082357248/v1/HYPOTHESISOS_FORTIFIC.zip
```

Primary dataset used: `HYPOTHESISOS_DECISION.zip` (contains cases.jsonl)  
Supplementary dataset: `HYPOTHESISOS_FORTIFIC.zip` (contains phase reports + same corpus copy)

---

## File List and Sizes

**HYPOTHESISOS_DECISION.zip (114K)**

| File | Size | Description |
|------|------|-------------|
| data/cases.jsonl | 139,436 bytes | Primary case dataset (125 records) |
| data/cases.csv | 96,449 bytes | CSV mirror of cases.jsonl |
| data/sources.json | 26,718 bytes | Source reference list |
| reports/CORPUS_AUDIT.md | 3,446 bytes | Corpus summary from Skywork pipeline |
| reports/TOP_100_HIGH_CONFIDENCE_CASES.md | 54,236 bytes | Top 100 cases narrative |
| reports/FAILURE_MODES_TAXONOMY.md | 20,369 bytes | Failure taxonomy |
| reports/SUCCESS_MODES_TAXONOMY.md | 14,657 bytes | Success taxonomy |
| reports/DATA_GAPS.md | 5,262 bytes | Data gaps report |

**HYPOTHESISOS_FORTIFIC.zip (128K)**

| File | Size | Description |
|------|------|-------------|
| phase01–phase12 MD reports | 8K–15K each | Design and governance docs |
| corpus/cases.jsonl | 139,436 bytes | Identical copy of primary cases |
| corpus/cases.csv | 96,449 bytes | Identical copy of CSV |
| corpus/sources.json | 26,718 bytes | Identical copy of sources |

---

## Record Counts

- **Total records:** 125
- **Unique case IDs:** 125 (no duplicates)
- **Malformed records:** 0

---

## Schema Detected

Fields present in every record:

| Field | Type | Notes |
|-------|------|-------|
| `case_id` | string | e.g. SP_001, AI_025, BS_012 |
| `domain` | string | 5 domains |
| `hypothesis` | string | The claim under evaluation |
| `decision_date` | string | YYYY-MM format |
| `decision_maker` | string | Person/org making the decision |
| `evidence_available_at_time` | string | Raw text — no numeric encoding |
| `decision_taken` | string | What action was actually taken |
| `known_outcome` | string | **OUTCOME FIELD — excluded from blinding** |
| `outcome_date` | string | **OUTCOME FIELD — excluded from blinding** |
| `expected_verdict` | string | **LABEL FIELD — excluded from blinding** |
| `why_expected_verdict` | string | **LABEL FIELD — excluded from blinding** |
| `sources` | array | URLs |
| `confidence` | string | high/medium |
| `data_quality_notes` | string | Quality assessment |
| `confounds` | array | Known confounds |
| `failure_mode` | string/null | Taxonomy label |
| `success_mode` | string/null | Taxonomy label |

**Critical finding:** No pre-encoded numeric evidence fields exist (effect, replication, hostileSurvival, confoundControl, generalization, power, ciExcludesNull). Evidence is raw text only. This forces **Mode B — Blind Evidence Encoding** for all 125 cases.

---

## Source Count

`sources.json`: 125 case entries × 1–2 URLs each. Source types: Wikipedia, SEC filings, news outlets (Verge, Bloomberg, Reuters), academic papers. All URLs reference publicly available historical records.

---

## Domain Distribution

| Domain | Cases | KILL | GO | UNRESOLVED |
|--------|-------|------|----|-----------|
| ai_technology_predictions | 25 | 13 | 12 | 0 |
| business_strategy | 25 | 13 | 12 | 0 |
| finance_market_theses | 25 | 13 | 12 | 0 |
| science_replication | 25 | 14 | 10 | 1 |
| startups_products | 25 | 12 | 13 | 0 |
| **TOTAL** | **125** | **65** | **59** | **1** |

Label distribution: 52% KILL, 47.2% GO, 0.8% UNRESOLVED. Near-balanced binary classification with one edge case.

---

## Missing Fields

None. All 125 records contain all required fields.

---

## Duplicate Cases

None. All 125 case_ids are unique.

---

## Malformed Records

None.

---

## Leakage Assessment (Evidence Field)

One candidate identified:

| Case | Flag | Evidence text excerpt | Classification |
|------|------|-----------------------|---------------|
| BS_016 | "failed" in evidence | "…Gateway's **failed** retail experiment." | **CLEAN** — refers to Gateway's historical failure (known before Apple's 2001 decision), not Apple's outcome |

**Verdict:** 0 cases require exclusion due to leakage in evidence_available_at_time. BS_016 is clean — "Gateway's failed retail experiment" is legitimate historical context available before Apple's decision.

---

## Majority-Class Baseline

- KILL: 65/125 = 52.0%
- GO: 59/125 = 47.2%
- Majority-class classifier (always predict KILL): 52.0% accuracy
