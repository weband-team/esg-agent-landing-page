// ──────────────────────────────────────────────────────────────────────────
// Carbon Footprint Calculator — calculation engine & emission factors
//
// Implements the GHG Protocol Corporate Standard (Scope 1 & 2). All emission
// factors are taken verbatim from the technical specification v1.0:
//   • Stationary / mobile fuels & grid/heat: KOBiZE 2023
//   • Refrigerant GWP100: IPCC AR6
//   • Residual electricity mix: AIB 2023
// Core formula throughout:  Emissions (tCO₂e) = Activity Data × Emission Factor
// ──────────────────────────────────────────────────────────────────────────

export const EF_VERSION = '2023-KOBiZE';

export const EMISSION_FACTORS = {
  version: EF_VERSION,
  updated: '2024-03',
  sources: ['KOBiZE 2023', 'IPCC AR6 GWP100', 'AIB 2023 Residual Mix'],
  // tCO₂e per native unit
  stationary: {
    natural_gas: { ef: 0.001870, unit: 'm³' },
    lpg:         { ef: 0.002984, unit: 'kg' },
    light_oil:   { ef: 0.002736, unit: 'L' },
    hard_coal:   { ef: 2.2340,   unit: 't' },
    // Biogenic CO₂ is reported separately as a memorandum item and is NOT
    // added to the Scope 1 total per the GHG Protocol Corporate Standard.
    biomass:     { ef: 0,        unit: 't', biogenic: true },
  },
  // tCO₂e per liter
  mobile: {
    petrol: { ef: 0.002316, unit: 'L' },
    diesel: { ef: 0.002660, unit: 'L' },
    lpg:    { ef: 0.001615, unit: 'L' },
  },
  // GWP100 multipliers (kg refrigerant → kgCO₂e)
  refrigerants: {
    'R-32':   { gwp100: 771 },
    'R-134a': { gwp100: 1530 },
    'R-410A': { gwp100: 2088 },
    'R-404A': { gwp100: 3922 },
  },
  // tCO₂e per MWh
  scope2: {
    poland_grid_lb:     { ef: 0.7249, year: 2023 }, // location-based national grid
    poland_residual_mb: { ef: 0.7855, year: 2023 }, // market-based residual mix (default when no supplier factor)
    district_heat_lb:   { ef: 0.3088 },
  },
} as const;

export type StationaryFuel = keyof typeof EMISSION_FACTORS.stationary;
export type MobileFuel = keyof typeof EMISSION_FACTORS.mobile;
export type Refrigerant = keyof typeof EMISSION_FACTORS.refrigerants;
export type ConsolidationMethod = 'operational' | 'financial' | 'equity';

// GJ → MWh conversion factor (district heat is entered in GJ)
export const GJ_TO_MWH = 1 / 3.6;

// ─── State shapes ───────────────────────────────────────────────────────────

export interface CompanyProfile {
  name: string;
  industry: string;
  employees: number | null;
  revenuePLN: number | null;
  floorM2: number | null;
  reportingYear: number;
  consolidationMethod: ConsolidationMethod;
}

export interface FuelEntry {
  fuel: StationaryFuel;
  quantity: number | null; // native unit
}

export interface VehicleFuelEntry {
  fuel: MobileFuel;
  method: 'liters' | 'distance';
  liters: number | null;          // method 'liters'
  km: number | null;              // method 'distance'
  litersPer100km: number | null;  // method 'distance'
}

export interface RefrigerantEntry {
  type: Refrigerant;
  topUpKg: number | null;
}

export interface Scope2Data {
  electricityKWh: number | null;     // annual electricity consumption (kWh)
  supplierEFperMWh: number | null;   // market-based supplier-specific factor (tCO₂e/MWh); null → residual mix
  districtHeatGJ: number | null;     // annual district heat (GJ)
  goCertificatesMWh: number | null;  // Guarantees of Origin purchased (MWh)
}

export interface CalculatorState {
  company: CompanyProfile;
  scope1Stationary: FuelEntry[];
  scope1Mobile: VehicleFuelEntry[];
  scope1Refrigerants: RefrigerantEntry[];
  scope2: Scope2Data;
}

export interface CalculationResults {
  scope1: { stationary: number; mobile: number; fugitive: number; total: number; biogenic: number };
  scope2LB: number;
  scope2MB: number;
  totalLB: number;
  totalMB: number;
  intensityPerFTE_LB: number | null;
  intensityPerFTE_MB: number | null;
  intensityPerM2_LB: number | null;
  intensityPerM2_MB: number | null;
  intensityPerRevenueLB: number | null;
  intensityPerRevenueMB: number | null;
}

const num = (v: number | null | undefined): number =>
  typeof v === 'number' && isFinite(v) && v > 0 ? v : 0;

// ─── Scope 1 ─────────────────────────────────────────────────────────────────

/** Stationary combustion: Σ (quantity × EF). Biogenic CO₂ tracked separately. */
export function calcStationary(entries: FuelEntry[]): { fossil: number; biogenic: number } {
  let fossil = 0;
  let biogenic = 0;
  for (const e of entries) {
    const f = EMISSION_FACTORS.stationary[e.fuel];
    if (!f) continue;
    const emissions = num(e.quantity) * f.ef;
    if ('biogenic' in f && f.biogenic) {
      // biomass EF is 0; report the activity as a memorandum item using light-oil-free accounting.
      biogenic += emissions;
    } else {
      fossil += emissions;
    }
  }
  return { fossil, biogenic };
}

/** Annual liters consumed for a vehicle entry (method A direct, method B km × L/100km). */
export function vehicleLiters(v: VehicleFuelEntry): number {
  if (v.method === 'liters') return num(v.liters);
  return (num(v.km) * num(v.litersPer100km)) / 100;
}

/** Mobile combustion: Σ (liters × EF). */
export function calcMobile(entries: VehicleFuelEntry[]): number {
  let total = 0;
  for (const v of entries) {
    const f = EMISSION_FACTORS.mobile[v.fuel];
    if (!f) continue;
    total += vehicleLiters(v) * f.ef;
  }
  return total;
}

/** Fugitive (refrigerant) emissions: Σ (kg × GWP100) / 1000 → tCO₂e. */
export function calcFugitive(entries: RefrigerantEntry[]): number {
  let total = 0;
  for (const r of entries) {
    const f = EMISSION_FACTORS.refrigerants[r.type];
    if (!f) continue;
    total += (num(r.topUpKg) * f.gwp100) / 1000;
  }
  return total;
}

// ─── Scope 2 ─────────────────────────────────────────────────────────────────

const heatMWh = (s: Scope2Data) => num(s.districtHeatGJ) * GJ_TO_MWH;
const electricityMWh = (s: Scope2Data) => num(s.electricityKWh) / 1000;

/** Location-based: electricity × grid EF + heat × heat EF. */
export function calcScope2LB(s: Scope2Data): number {
  return (
    electricityMWh(s) * EMISSION_FACTORS.scope2.poland_grid_lb.ef +
    heatMWh(s) * EMISSION_FACTORS.scope2.district_heat_lb.ef
  );
}

/**
 * Market-based: (electricity − GO certificates) × supplier EF + heat × heat EF.
 * Supplier EF defaults to the residual mix when not provided. GOs offset at 0 tCO₂e/MWh.
 */
export function calcScope2MB(s: Scope2Data): number {
  const supplierEF =
    s.supplierEFperMWh !== null && isFinite(s.supplierEFperMWh) && s.supplierEFperMWh >= 0
      ? s.supplierEFperMWh
      : EMISSION_FACTORS.scope2.poland_residual_mb.ef;
  const nonRenewableMWh = Math.max(0, electricityMWh(s) - num(s.goCertificatesMWh));
  return (
    nonRenewableMWh * supplierEF +
    heatMWh(s) * EMISSION_FACTORS.scope2.district_heat_lb.ef
  );
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

const intensity = (total: number, denom: number | null): number | null =>
  denom && denom > 0 ? total / denom : null;

export function calculate(state: CalculatorState): CalculationResults {
  const { fossil: stationary, biogenic } = calcStationary(state.scope1Stationary);
  const mobile = calcMobile(state.scope1Mobile);
  const fugitive = calcFugitive(state.scope1Refrigerants);
  const scope1Total = stationary + mobile + fugitive;

  const scope2LB = calcScope2LB(state.scope2);
  const scope2MB = calcScope2MB(state.scope2);

  const totalLB = scope1Total + scope2LB;
  const totalMB = scope1Total + scope2MB;

  const { employees, floorM2, revenuePLN } = state.company;

  return {
    scope1: { stationary, mobile, fugitive, total: scope1Total, biogenic },
    scope2LB,
    scope2MB,
    totalLB,
    totalMB,
    intensityPerFTE_LB: intensity(totalLB, employees),
    intensityPerFTE_MB: intensity(totalMB, employees),
    intensityPerM2_LB: intensity(totalLB, floorM2),
    intensityPerM2_MB: intensity(totalMB, floorM2),
    // per 1000 PLN revenue
    intensityPerRevenueLB: intensity(totalLB, revenuePLN ? revenuePLN / 1000 : null),
    intensityPerRevenueMB: intensity(totalMB, revenuePLN ? revenuePLN / 1000 : null),
  };
}

// ─── Breakdown helper (for charts / PDF bars) ────────────────────────────────

export interface BreakdownSlice {
  key: 'stationary' | 'mobile' | 'fugitive' | 'scope2';
  labelPl: string;
  labelEn: string;
  value: number; // tCO₂e (uses location-based Scope 2)
}

export function breakdown(results: CalculationResults): BreakdownSlice[] {
  return [
    { key: 'stationary', labelPl: 'Spalanie stacjonarne', labelEn: 'Stationary combustion', value: results.scope1.stationary },
    { key: 'mobile', labelPl: 'Spalanie mobilne (flota)', labelEn: 'Mobile combustion (fleet)', value: results.scope1.mobile },
    { key: 'fugitive', labelPl: 'Czynniki chłodnicze', labelEn: 'Refrigerants (fugitive)', value: results.scope1.fugitive },
    { key: 'scope2', labelPl: 'Energia zakupiona (Zakres 2)', labelEn: 'Purchased energy (Scope 2)', value: results.scope2LB },
  ];
}

// ─── Sanity-check warnings (non-blocking, spec §8.2) ─────────────────────────

export interface SanityWarning {
  pl: string;
  en: string;
}

export function sanityWarnings(state: CalculatorState, results: CalculationResults): SanityWarning[] {
  const w: SanityWarning[] = [];
  const { electricityKWh } = state.scope2;
  const { floorM2, employees, revenuePLN } = state.company;

  if (electricityKWh && floorM2 && floorM2 > 0 && electricityKWh / floorM2 > 500) {
    w.push({
      pl: 'Zużycie energii elektrycznej > 500 kWh/m²/rok znacznie przekracza średnią dla biur (150–300 kWh/m²). Sprawdź odczyt.',
      en: 'Electricity use > 500 kWh/m²/year is well above the office average (150–300 kWh/m²). Please double-check your reading.',
    });
  }
  if (employees && employees > 0 && results.scope1.total / employees > 500) {
    w.push({
      pl: 'Zakres 1 > 500 tCO₂e na pracownika jest wysoki dla usług. Zweryfikuj, czy dotyczy zakładu przemysłowego.',
      en: 'Scope 1 > 500 tCO₂e per FTE is high for a service industry. Verify if correct for a manufacturing/industrial site.',
    });
  }
  for (const r of state.scope1Refrigerants) {
    if (num(r.topUpKg) > 50) {
      w.push({
        pl: 'Uzupełnienie czynnika chłodniczego > 50 kg/rok może wskazywać na wyciek. Rozważ audyt instalacji.',
        en: 'Refrigerant top-up > 50 kg/year may indicate a leak. Consider an audit.',
      });
      break;
    }
  }
  if (revenuePLN !== null && revenuePLN > 0 && revenuePLN < 1000) {
    w.push({
      pl: 'Przychód wygląda na podany w PLN, a nie w tysiącach PLN. Zweryfikuj jednostkę.',
      en: 'Revenue appears to be in PLN, not thousands of PLN. Please verify the unit.',
    });
  }
  return w;
}
