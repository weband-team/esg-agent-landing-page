# Industry Lookup System - Technical Documentation

## Overview

The Industry Lookup System improves MS (Materiality Score) accuracy without changing the CORE questionnaire. It automatically differentiates companies based on their industry profile.

**Implementation based on**: `system2.pdf` specification (Tasks 1-47)

## Architecture

```
Form/CRM -> (industry_code) -> Lookup Table -> (profile P) -> Scoring MS -> ERRS -> PDF/XLSX
```

## Key Decisions (Tasks 43, 45)

### Task 43: Industry Code Source
**Decision**: Internal categories (not PKD/NACE)

8 internal industry categories:
| Code | ID | Name (PL) | Name (EN) |
|------|-------|-----------|-----------|
| construction | CONSTR | Budownictwo | Construction |
| energy_raw_materials | ENRES | Energetyka i surowce | Energy & Raw Materials |
| industrial_production | MANUF | Produkcja przemyslowa | Industrial Production |
| logistics_transport | LOGTR | Logistyka i transport | Logistics & Transport |
| trade_retail | RETTR | Handel i detal | Trade & Retail |
| it_software | ITSW | IT i oprogramowanie | IT & Software |
| finance | FINFT | Finanse | Finance |
| services_other | SERV | Uslugi | Services |

### Task 45: Adjustment Scale
**Decision**: Conservative scale for start

| Mode | Per-pillar cap | Total cap | Use case |
|------|---------------|-----------|----------|
| conservative | +6 | +10 | Production system (recommended) |
| extended | +10 | +15 | Stronger differentiation |

## Profile Characteristics (Tasks 1-5)

### regulated_materials_level (0-4)
- 0: none - No work with regulated materials
- 1: low - Rare, minimal amounts
- 2: medium - Regular, moderate volumes
- 3: high - Constant, large volumes
- 4: very_high - Basis of production process

### international_activity_level (0-4)
- 0: domestic_only - Domestic market only
- 1: rare - Rare international operations
- 2: regular_eu - Regular EU operations
- 3: active_eu_plus - Active EU + partially outside
- 4: global - Global activity outside EU

### energy_intensity_level (0-3)
- 0: low - Offices, IT, services
- 1: medium - Trade, light manufacturing
- 2: high - Heavy manufacturing, logistics
- 3: very_high - Energy, metallurgy, chemistry

### water_intensity_level (0-3)
- 0: low - Offices, IT, finance
- 1: medium - Manufacturing, trade
- 2: high - Construction, chemical industry
- 3: very_high - Beverages, textiles, agriculture

## Task 46: Adjustment Mapping

```
Characteristic -> ESG Area (Impact Level)
---------------------------------------
regulated_materials     -> E (primary), G (medium), SC (small)
international_activity  -> SC (primary), S (medium), G (small)
energy_intensity        -> E (medium)
water_intensity         -> E (medium)
```

## Adjustment Tables

### Conservative (Task 35)

| Driver | Pillar | none | low | med | high | very_high |
|--------|--------|------|-----|-----|------|-----------|
| regulated_materials | E | 0 | 0 | +2 | +4 | +6 |
| regulated_materials | G | 0 | 0 | +1 | +2 | +3 |
| international_activity | SC | 0 | +1 | +2 | +4 | +5 |
| international_activity | S | 0 | 0 | +1 | +2 | +3 |
| international_activity | G | 0 | 0 | +1 | +2 | +2 |
| energy_intensity | E | 0 | +1 | +2 | +3 | - |
| water_intensity | E | 0 | +1 | +2 | +3 | - |

### Extended (Task 36)

| Driver | Pillar | none | low | med | high | very_high |
|--------|--------|------|-----|-----|------|-----------|
| regulated_materials | E | 0 | 0 | +3 | +6 | +10 |
| regulated_materials | G | 0 | 0 | +2 | +4 | +6 |
| international_activity | SC | 0 | +2 | +4 | +7 | +10 |
| international_activity | S | 0 | 0 | +2 | +4 | +6 |
| international_activity | G | 0 | 0 | +1 | +2 | +3 |
| energy_intensity | E | 0 | 0 | +2 | +4 | - |
| water_intensity | E | 0 | 0 | +2 | +4 | - |

## Pre-calculated Industry Adjustments (Task 44)

### Conservative Mode

| Industry | E | S | G | SC | Total |
|----------|---|---|---|----|----|
| construction | +3 | 0 | +1 | +1 | 5 |
| energy_raw_materials | +6 | +2 | +5 | +4 | 17->10* |
| industrial_production | +6 | +2 | +4 | +4 | 16->10* |
| logistics_transport | +4 | +2 | +3 | +4 | 13->10* |
| trade_retail | +1 | +1 | +1 | +2 | 5 |
| it_software | 0 | +2 | +2 | +4 | 8 |
| finance | 0 | +2 | +2 | +4 | 8 |
| services_other | 0 | +1 | +1 | +2 | 4 |

*Total capped at 10, values proportionally reduced

### Extended Mode

| Industry | E | S | G | SC | Total |
|----------|---|---|---|----|----|
| construction | +5 | 0 | +2 | +2 | 9 |
| energy_raw_materials | +10 | +4 | +8 | +7 | 29->15* |
| industrial_production | +10 | +4 | +6 | +7 | 27->15* |
| logistics_transport | +7 | +4 | +4 | +7 | 22->15* |
| trade_retail | +2 | +2 | +1 | +4 | 9 |
| it_software | 0 | +4 | +2 | +7 | 13 |
| finance | 0 | +4 | +2 | +7 | 13 |
| services_other | 0 | +2 | +1 | +4 | 7 |

## MS Calculation Formula (Task 22)

```
MS_i = clamp(0, 100, 0.6*B_i + 0.2*R + 0.2*C + adjustment_i)
```

Where:
- `B_i` = Base industry weight for pillar i
- `R` = Regulation pressure (0, 10, 20)
- `C` = Contract/financial pressure (0, 10, 15)
- `adjustment_i` = Profile adjustment from lookup table

## Task 15: Rule - Adjustments DO NOT change questionnaire

Profile adjustments affect ONLY:
- MS calculation
- ERRS calculation
- TOP3 priorities
- Comments/simulations

Profile adjustments DO NOT affect:
- Questions in questionnaire
- CORE scores (E, S, G, SC percentages)
- Executive State determination logic

## Task 47: Versioning and Logging

### Version Structure
```javascript
{
    version: 'v1.0',
    valid_from: '2026-02-09',
    valid_to: null,  // null = current active version
    description: 'Initial extended industry profiles'
}
```

### Audit Log Entry
```javascript
{
    industry_code: 'CONSTR',
    profile_version: 'v1.0',
    adjustments_applied: { E: 3, S: 0, G: 1, SC: 1 },
    base_ms: { E: 30, S: 25, G: 20, SC: 20 },
    adjusted_ms: { E: 33, S: 25, G: 21, SC: 21 },
    mode: 'conservative',
    report_id: 'report-123',
    timestamp: '2026-02-09T12:00:00Z'
}
```

## API Functions

### getIndustryProfile(industryCode)
Returns profile with fallback to `services_other`.
Supports aliases (e.g., "software" -> "it_software").

### computeAllMSWithLookup(industry, R, C, options)
Computes MS for all pillars with profile adjustments.
```javascript
// Basic usage
const ms = computeAllMSWithLookup('construction', 10, 5);
// { E: 33, S: 25, G: 21, SC: 21 }

// With logging
const result = computeAllMSWithLookup('construction', 10, 5, { includeLog: true });
// { ms: {...}, adjustments: {...}, log: {...} }
```

### calculateProfileAdjustments(profile, mode)
Calculates adjustments from profile levels.
Applies per-pillar and global caps.

### applyProfileAdjustments(profile, baseMS, mode)
Applies adjustments to base MS values.
Returns adjusted MS and audit log.

## Feature Flag

Enable industry lookup:
```javascript
const { setFeatureFlag } = require('./feature-flags');
setFeatureFlag('industry_lookup_enabled', true);
```

## Testing Checklist (Tasks 40-42)

- [ ] Energy/Production: High E and G with average answers
- [ ] IT/Finance: Low E (no artificial inflation)
- [ ] Logistics: Balanced E+S+SC boost
- [ ] All industries: Adjustments < answer influence (+-5-10 vs +-20-40)

## Files

| File | Purpose |
|------|---------|
| `src/scoring/industry-lookup.js` | Main module with profiles and functions |
| `src/scoring/feature-flags.js` | Feature flag control |
| `tests/scoring/industry-lookup.test.js` | Unit tests |
| `docs/industry-lookup-system.md` | This documentation |

## Changelog

### v1.0 (2026-02-09)
- Initial implementation of extended industry profiles
- 8 industry profiles with 5 characteristic levels
- Conservative and extended adjustment tables
- Versioning and audit logging
- Unit tests for all tasks (1-47)
