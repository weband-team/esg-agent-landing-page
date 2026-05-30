/**
 * Industry Lookup Module (Krok 3) - Extended Version
 * Improves MS accuracy without changing CORE questionnaire
 *
 * Implementation based on "System2.pdf" specification:
 * - Extended industry profiles with numeric levels (Tasks 1-6)
 * - Profile adjustment method C2 (Tasks 7-18)
 * - Integration with MS calculation (Tasks 19-24)
 * - 8 main industry profiles (Tasks 25-34)
 * - Conservative and extended adjustment tables (Tasks 35-39)
 *
 * Rule: lookup does NOT touch CORE Score, only affects MS (materiality)
 */

const { FEATURE_FLAGS } = require('./feature-flags');
const { INDUSTRY_B } = require('./core');

// ============================================================================
// VERSION AND CONFIGURATION (Task 16)
// ============================================================================

/**
 * Lookup table version for audit trail
 * Format: { version, valid_from, valid_to, description }
 */
const LOOKUP_VERSION = {
    version: 'v1.0',
    valid_from: '2026-02-09',
    valid_to: null, // null = current active version
    description: 'Initial extended industry profiles with numeric levels'
};

/**
 * Adjustment mode selection (Task 45)
 * 'conservative' - max +6 per pillar, max +10 total (recommended for start)
 * 'extended' - max +10 per pillar, max +15 total (stronger differentiation)
 */
const ADJUSTMENT_MODE = 'conservative';

/**
 * Caps for adjustments (Task 23)
 */
const ADJUSTMENT_CAPS = {
    conservative: {
        perPillar: 6,
        total: 10
    },
    extended: {
        perPillar: 10,
        total: 15
    }
};

// ============================================================================
// LEVEL DEFINITIONS (Tasks 1-5)
// ============================================================================

/**
 * Task 1: Regulated materials level (0-4)
 * Affects: E (primary), G (medium), SC (small)
 */
const REGULATED_MATERIALS_LEVELS = {
    0: 'none',           // No work with regulated materials
    1: 'low',            // Rare, minimal amounts
    2: 'medium',         // Regular, moderate volumes
    3: 'high',           // Constant, large volumes
    4: 'very_high'       // Basis of production process
};

/**
 * Task 2: International activity level (0-4)
 * Affects: SC (primary), S (medium), G (small)
 */
const INTERNATIONAL_ACTIVITY_LEVELS = {
    0: 'domestic_only',  // Domestic market only
    1: 'rare',           // Rare international operations
    2: 'regular_eu',     // Regular EU operations
    3: 'active_eu_plus', // Active EU + partially outside
    4: 'global'          // Global activity outside EU
};

/**
 * Task 3: Export probability (alternative to exact region)
 */
const EXPORT_PROBABILITY = {
    low: 'low',      // Industry rarely works with export
    medium: 'medium', // Export is common but not mandatory
    high: 'high'     // Most companies in industry work with export
};

/**
 * Task 4: Energy intensity level (0-3)
 * Affects: E (medium)
 */
const ENERGY_INTENSITY_LEVELS = {
    0: 'low',        // Offices, IT, services
    1: 'medium',     // Trade, light manufacturing
    2: 'high',       // Heavy manufacturing, logistics
    3: 'very_high'   // Energy, metallurgy, chemistry
};

/**
 * Task 5: Water intensity level (0-3)
 * Affects: E (medium)
 */
const WATER_INTENSITY_LEVELS = {
    0: 'low',        // Offices, IT, finance
    1: 'medium',     // Manufacturing, trade
    2: 'high',       // Construction, chemical industry
    3: 'very_high'   // Beverages, textiles, agriculture
};

// ============================================================================
// ADJUSTMENT TABLES (Tasks 35-36)
// ============================================================================

/**
 * Task 35: Conservative adjustment table
 * Stable for entire system, minimizes risk of industry overpowering answers
 * Scale: none=0, low=0, med=+2, high=+4, very_high=+6
 */
const ADJUSTMENT_TABLE_CONSERVATIVE = {
    // Task 10-11: regulated_materials -> E, G
    regulated_materials: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 },
        G: { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 }
    },
    // Task 12-13: international_activity -> SC, S, G
    international_activity: {
        SC: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5 },
        S:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 },
        G:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 2 }
    },
    // Task 14: energy_intensity -> E
    energy_intensity: {
        E: { 0: 0, 1: 1, 2: 2, 3: 3 }
    },
    // Task 14: water_intensity -> E
    water_intensity: {
        E: { 0: 0, 1: 1, 2: 2, 3: 3 }
    }
};

/**
 * Task 36: Extended adjustment table
 * Stronger differentiation for MS accuracy module
 * Scale: none=0, low=0, med=+3, high=+6, very_high=+10
 */
const ADJUSTMENT_TABLE_EXTENDED = {
    regulated_materials: {
        E: { 0: 0, 1: 0, 2: 3, 3: 6, 4: 10 },
        G: { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 }
    },
    international_activity: {
        SC: { 0: 0, 1: 2, 2: 4, 3: 7, 4: 10 },
        S:  { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 },
        G:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 }
    },
    energy_intensity: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4 }
    },
    water_intensity: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4 }
    }
};

// ============================================================================
// EXTENDED INDUSTRY PROFILES (Tasks 6, 25-34)
// ============================================================================

/**
 * Extended Industry Lookup Table with numeric levels
 *
 * Structure per industry:
 * - id: Industry code (Task 19 - internal categories)
 * - name: Display name
 * - name_en: English name
 * - aliases: Alternative names (Task 33)
 * - base: { E, S, G, SC } - base weights from INDUSTRY_B
 * - levels: Numeric levels for all characteristics
 * - esg_focus_hint: Priority ESG areas (Task 34)
 * - key_risks: Specific risk notes
 */
const INDUSTRY_LOOKUP = {
    // Task 25: Construction
    'construction': {
        id: 'CONSTR',
        name: 'Budownictwo',
        name_en: 'Construction',
        aliases: ['construction', 'real estate', 'real estate dev', 'budownictwo', 'deweloper'],
        base: { E: 35, S: 25, G: 20, SC: 20 },
        levels: {
            regulated_materials_level: 2,      // medium - concrete, steel, chemicals
            international_activity_level: 1,   // low - mostly domestic
            export_probability: 'low',
            energy_intensity_level: 1,         // medium
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['E', 'S'],            // Waste/dust + OHS
        key_risks: ['occupational_safety', 'construction_waste', 'dust_noise', 'subcontractors'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: false,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.0, G: 1.0, SC: 1.0 }
    },

    // Task 26: Energy and raw materials
    'energy_raw_materials': {
        id: 'ENRES',
        name: 'Energetyka i surowce',
        name_en: 'Energy & Raw Materials',
        aliases: ['energy', 'utilities', 'mining', 'resources', 'oil & gas', 'energetyka', 'gornictwo'],
        base: { E: 40, S: 20, G: 25, SC: 15 },
        levels: {
            regulated_materials_level: 4,      // very_high - basis of production
            international_activity_level: 3,   // high - active EU + outside
            export_probability: 'high',
            energy_intensity_level: 3,         // very_high
            water_intensity_level: 2           // high
        },
        esg_focus_hint: ['E', 'G'],            // Emissions + Permits
        key_risks: ['co2_emissions', 'spills', 'environmental_disasters', 'regulatory_risk'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: true,
            natura2000: true
        },
        modifiers: { E: 1.2, S: 1.0, G: 1.1, SC: 1.0 }
    },

    // Task 27: Industrial production
    'industrial_production': {
        id: 'MANUF',
        name: 'Produkcja przemyslowa',
        name_en: 'Industrial Production',
        aliases: ['manufacturing', 'industrial', 'production', 'przemysl', 'produkcja'],
        base: { E: 30, S: 30, G: 20, SC: 20 },
        levels: {
            regulated_materials_level: 3,      // high - constant, large volumes
            international_activity_level: 3,   // high - EU + outside
            export_probability: 'high',
            energy_intensity_level: 2,         // high
            water_intensity_level: 1           // medium
        },
        esg_focus_hint: ['E', 'S'],            // Industrial emissions + OHS
        key_risks: ['industrial_emissions', 'production_waste', 'occupational_safety', 'reach_substances'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.1, G: 1.0, SC: 1.0 }
    },

    // Task 28: Logistics and transport
    'logistics_transport': {
        id: 'LOGTR',
        name: 'Logistyka i transport',
        name_en: 'Logistics & Transport',
        aliases: ['logistics', 'transport', 'fleet', 'shipping', 'freight', 'logistyka', 'spedycja'],
        base: { E: 35, S: 20, G: 20, SC: 25 },
        levels: {
            regulated_materials_level: 2,      // medium - fuels, cargo
            international_activity_level: 3,   // high - cross-border
            export_probability: 'high',
            energy_intensity_level: 2,         // high - fuel consumption
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['E', 'S', 'SC'],      // Emissions + Drivers + Subcontractors
        key_risks: ['transport_emissions', 'driver_safety', 'working_hours', 'subcontractors'],
        exposures: {
            regulated_materials: false,
            physical_labor: true,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.0, G: 1.0, SC: 1.1 }
    },

    // Task 29: Trade and retail
    'trade_retail': {
        id: 'RETTR',
        name: 'Handel i detal',
        name_en: 'Trade & Retail',
        aliases: ['retail', 'wholesale', 'ecommerce', 'trade', 'handel', 'sklep', 'e-commerce'],
        base: { E: 15, S: 30, G: 25, SC: 30 },
        levels: {
            regulated_materials_level: 1,      // low - rarely
            international_activity_level: 2,   // medium - regular EU
            export_probability: 'medium',
            energy_intensity_level: 1,         // medium
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['S', 'SC'],           // Supply chain + Social
        key_risks: ['supply_chain_goods', 'packaging', 'food_waste', 'human_rights_supply_chain'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.2 }
    },

    // Task 30: IT and software
    'it_software': {
        id: 'ITSW',
        name: 'IT i oprogramowanie',
        name_en: 'IT & Software',
        aliases: ['software', 'saas', 'it services', 'information technology', 'tech', 'it', 'programowanie'],
        base: { E: 10, S: 30, G: 35, SC: 25 },
        levels: {
            regulated_materials_level: 1,      // low - e-waste only
            international_activity_level: 3,   // high - global services
            export_probability: 'high',
            energy_intensity_level: 0,         // low - offices
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['G', 'S'],            // Privacy + Working conditions
        key_risks: ['data_privacy', 'cybersecurity', 'working_conditions', 'remote_work'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.1, SC: 1.0 }
    },

    // Task 31: Finance
    'finance': {
        id: 'FINFT',
        name: 'Finanse',
        name_en: 'Finance',
        aliases: ['banking', 'insurance', 'fintech', 'finance', 'bank', 'ubezpieczenia', 'finanse'],
        base: { E: 10, S: 25, G: 45, SC: 20 },
        levels: {
            regulated_materials_level: 0,      // none
            international_activity_level: 3,   // high - global operations
            export_probability: 'high',
            energy_intensity_level: 0,         // low - offices
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['G', 'SC'],           // Ethics + Financing
        key_risks: ['risky_project_financing', 'transparency', 'sales_ethics', 'aml_kyc', 'complaints'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.2, SC: 1.0 }
    },

    // Task 32: Services
    'services_other': {
        id: 'SERV',
        name: 'Uslugi',
        name_en: 'Services',
        aliases: ['services', 'professional services', 'consulting', 'uslugi', 'doradztwo', 'hr', 'outsourcing'],
        base: { E: 15, S: 35, G: 25, SC: 25 },
        levels: {
            regulated_materials_level: 1,      // low
            international_activity_level: 2,   // medium
            export_probability: 'medium',
            energy_intensity_level: 0,         // low
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['S', 'G'],            // Service quality + Working conditions
        key_risks: ['service_quality', 'client_ethics', 'working_conditions', 'outsourcing'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: false,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.0 }
    }
};

/**
 * Pre-calculated adjustments per industry (Tasks 35-36)
 * These are derived from levels + adjustment tables WITH caps applied
 *
 * Conservative caps: +6 per pillar, +10 total
 * Extended caps: +10 per pillar, +15 total
 *
 * Raw values before caps (for reference):
 * - energy_raw_materials conservative: E=12, S=2, G=5, SC=4 = 23 -> capped
 * - industrial_production conservative: E=9, S=2, G=4, SC=4 = 19 -> capped
 * - logistics_transport conservative: E=6, S=2, G=3, SC=4 = 15 -> capped
 */
const INDUSTRY_ADJUSTMENTS = {
    conservative: {
        // After applying per-pillar cap (6) and global cap (10)
        construction:          { E: 3, S: 0, G: 1, SC: 1 },  // total=5, no cap needed
        energy_raw_materials:  { E: 4, S: 1, G: 3, SC: 2 },  // raw=23, scaled to ~10
        industrial_production: { E: 4, S: 1, G: 2, SC: 3 },  // raw=19, scaled to ~10
        logistics_transport:   { E: 3, S: 1, G: 2, SC: 4 },  // raw=15, scaled to ~10
        trade_retail:          { E: 1, S: 1, G: 1, SC: 2 },  // total=5, no cap needed
        it_software:           { E: 0, S: 2, G: 2, SC: 4 },  // total=8, no cap needed
        finance:               { E: 0, S: 2, G: 2, SC: 4 },  // total=8, no cap needed
        services_other:        { E: 0, S: 1, G: 1, SC: 2 }   // total=4, no cap needed
    },
    extended: {
        // After applying per-pillar cap (10) and global cap (15)
        construction:          { E: 5, S: 0, G: 2, SC: 2 },  // total=9, no cap needed
        energy_raw_materials:  { E: 5, S: 2, G: 4, SC: 4 },  // raw=29, scaled to ~15
        industrial_production: { E: 5, S: 2, G: 4, SC: 4 },  // raw=27, scaled to ~15
        logistics_transport:   { E: 5, S: 2, G: 3, SC: 5 },  // raw=22, scaled to ~15
        trade_retail:          { E: 2, S: 2, G: 1, SC: 4 },  // total=9, no cap needed
        it_software:           { E: 0, S: 4, G: 2, SC: 7 },  // total=13, no cap needed
        finance:               { E: 0, S: 4, G: 2, SC: 7 },  // total=13, no cap needed
        services_other:        { E: 0, S: 2, G: 1, SC: 4 }   // total=7, no cap needed
    }
};

// ============================================================================
// CORE FUNCTIONS (Tasks 7, 21, 37-38)
// ============================================================================

/**
 * Task 21: Get industry profile by code
 * Returns profile with fallback to services_other
 *
 * @param {string} industryCode - Industry key or alias
 * @returns {Object} Industry profile
 */
function getIndustryProfile(industryCode) {
    if (!industryCode) {
        return INDUSTRY_LOOKUP['services_other'];
    }

    const normalizedCode = industryCode.toLowerCase().trim();

    // Direct match
    if (INDUSTRY_LOOKUP[normalizedCode]) {
        return INDUSTRY_LOOKUP[normalizedCode];
    }

    // Alias match
    for (const [key, profile] of Object.entries(INDUSTRY_LOOKUP)) {
        if (profile.aliases.some(alias =>
            alias.toLowerCase() === normalizedCode ||
            normalizedCode.includes(alias.toLowerCase())
        )) {
            return profile;
        }
    }

    // Fallback to default
    return INDUSTRY_LOOKUP['services_other'];
}

/**
 * Legacy function for backward compatibility
 * @param {string} industry - Industry key
 * @returns {Object} Industry lookup data
 */
function getIndustryLookup(industry) {
    if (!FEATURE_FLAGS.industry_lookup_enabled) {
        const base = INDUSTRY_B[industry] || INDUSTRY_B['services_other'];
        return {
            base,
            exposures: {},
            modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.0 }
        };
    }

    const profile = getIndustryProfile(industry);
    return {
        base: profile.base,
        exposures: profile.exposures,
        modifiers: profile.modifiers
    };
}

/**
 * Task 37: Calculate profile adjustments for a specific industry
 * Uses configured ADJUSTMENT_MODE (conservative/extended)
 *
 * @param {Object} profile - Industry profile
 * @param {string} mode - 'conservative' or 'extended' (default from config)
 * @returns {Object} { E, S, G, SC } adjustments
 */
function calculateProfileAdjustments(profile, mode = ADJUSTMENT_MODE) {
    const table = mode === 'extended' ?
        ADJUSTMENT_TABLE_EXTENDED :
        ADJUSTMENT_TABLE_CONSERVATIVE;
    const caps = ADJUSTMENT_CAPS[mode];
    const levels = profile.levels;

    // Initialize adjustments
    const adjustments = { E: 0, S: 0, G: 0, SC: 0 };

    // Task 10: Regulated materials -> E
    if (levels.regulated_materials_level !== undefined) {
        const level = levels.regulated_materials_level;
        adjustments.E += table.regulated_materials.E[level] || 0;
    }

    // Task 11: Regulated materials -> G
    if (levels.regulated_materials_level !== undefined) {
        const level = levels.regulated_materials_level;
        adjustments.G += table.regulated_materials.G[level] || 0;
    }

    // Task 12: International activity -> SC
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.SC += table.international_activity.SC[level] || 0;
    }

    // Task 13: International activity -> S
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.S += table.international_activity.S[level] || 0;
    }

    // Additional international -> G
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.G += table.international_activity.G[level] || 0;
    }

    // Task 14: Energy intensity -> E
    if (levels.energy_intensity_level !== undefined) {
        const level = levels.energy_intensity_level;
        adjustments.E += table.energy_intensity.E[level] || 0;
    }

    // Task 14: Water intensity -> E
    if (levels.water_intensity_level !== undefined) {
        const level = levels.water_intensity_level;
        adjustments.E += table.water_intensity.E[level] || 0;
    }

    // Task 38: Apply caps
    const pillars = ['E', 'S', 'G', 'SC'];
    let totalAdjustment = 0;

    // First pass: apply per-pillar cap
    pillars.forEach(p => {
        adjustments[p] = Math.min(adjustments[p], caps.perPillar);
        totalAdjustment += adjustments[p];
    });

    // Second pass: apply global cap with proportional reduction
    if (totalAdjustment > caps.total) {
        const scale = caps.total / totalAdjustment;
        pillars.forEach(p => {
            adjustments[p] = Math.floor(adjustments[p] * scale);
        });

        // Recalculate total after floor
        totalAdjustment = pillars.reduce((sum, p) => sum + adjustments[p], 0);

        // If still over cap due to rounding, reduce highest value
        while (totalAdjustment > caps.total) {
            const maxPillar = pillars.reduce((max, p) =>
                adjustments[p] > adjustments[max] ? p : max, 'E');
            adjustments[maxPillar]--;
            totalAdjustment--;
        }
    }

    return adjustments;
}

/**
 * Get pre-calculated adjustments for industry
 * Faster than runtime calculation
 *
 * @param {string} industry - Industry key
 * @param {string} mode - 'conservative' or 'extended'
 * @returns {Object} { E, S, G, SC } adjustments
 */
function getIndustryAdjustments(industry, mode = ADJUSTMENT_MODE) {
    const adjustments = INDUSTRY_ADJUSTMENTS[mode];
    return adjustments[industry] || adjustments['services_other'];
}

/**
 * Task 37: Apply profile adjustments to base MS
 *
 * @param {Object} profile - Industry profile
 * @param {Object} baseMS - Base MS values { E, S, G, SC }
 * @param {string} mode - Adjustment mode
 * @returns {Object} { adjustedMS, adjustments, log }
 */
function applyProfileAdjustments(profile, baseMS, mode = ADJUSTMENT_MODE) {
    const adjustments = calculateProfileAdjustments(profile, mode);

    const adjustedMS = {
        E: Math.min(100, Math.max(0, baseMS.E + adjustments.E)),
        S: Math.min(100, Math.max(0, baseMS.S + adjustments.S)),
        G: Math.min(100, Math.max(0, baseMS.G + adjustments.G)),
        SC: Math.min(100, Math.max(0, baseMS.SC + adjustments.SC))
    };

    // Task 17: Logging data
    const log = {
        industry_code: profile.id,
        profile_version: LOOKUP_VERSION.version,
        adjustments_applied: adjustments,
        base_ms: baseMS,
        adjusted_ms: adjustedMS,
        mode: mode,
        timestamp: new Date().toISOString()
    };

    return { adjustedMS, adjustments, log };
}

// ============================================================================
// MS CALCULATION WITH PROFILE ADJUSTMENTS (Task 22)
// ============================================================================

/**
 * Compute MS with Industry Lookup enhancement
 * Base formula: MS_i = min(100, 0.6 * B_i + 0.2 * R + 0.2 * C)
 * With adjustment: MS_i = clamp(0, 100, baseMS + profile_adjustment)
 *
 * @param {number} B_i - Base industry weight
 * @param {number} R - Regulation pressure
 * @param {number} C - Contract pressure
 * @param {number} modifier - Industry modifier (legacy, default 1.0)
 * @returns {number} Enhanced MS value [0, 100]
 */
function computeMSWithLookup(B_i, R, C, modifier = 1.0) {
    const baseMS = 0.6 * B_i + 0.2 * R + 0.2 * C;
    const enhanced = baseMS * modifier;
    return Math.min(100, Math.max(0, enhanced));
}

/**
 * Task 22: Compute all MS values with profile adjustments
 * New formula: MS_i = clamp(0, 100, 0.6*B_i + 0.2*R + 0.2*C + adjustment_i)
 *
 * @param {string} industry - Industry key
 * @param {number} R - Regulation pressure
 * @param {number} C - Contract pressure
 * @param {Object} options - { mode, includeLog }
 * @returns {Object} { E, S, G, SC } or { ms, adjustments, log }
 */
function computeAllMSWithLookup(industry, R, C, options = {}) {
    const { mode = ADJUSTMENT_MODE, includeLog = false } = options;
    const profile = getIndustryProfile(industry);
    const B = profile.base;

    // Compute base MS for each pillar
    const baseMS = {
        E: 0.6 * B.E + 0.2 * R + 0.2 * C,
        S: 0.6 * B.S + 0.2 * R + 0.2 * C,
        G: 0.6 * B.G + 0.2 * R + 0.2 * C,
        SC: 0.6 * B.SC + 0.2 * R + 0.2 * C
    };

    // Apply profile adjustments if feature enabled
    if (FEATURE_FLAGS.industry_lookup_enabled) {
        const result = applyProfileAdjustments(profile, baseMS, mode);

        if (includeLog) {
            return {
                ms: result.adjustedMS,
                adjustments: result.adjustments,
                log: result.log
            };
        }

        return result.adjustedMS;
    }

    // Without feature flag - use legacy modifier approach
    const mod = profile.modifiers;
    const legacyMS = {
        E: computeMSWithLookup(B.E, R, C, mod.E),
        S: computeMSWithLookup(B.S, R, C, mod.S),
        G: computeMSWithLookup(B.G, R, C, mod.G),
        SC: computeMSWithLookup(B.SC, R, C, mod.SC)
    };

    if (includeLog) {
        return {
            ms: legacyMS,
            adjustments: null,
            log: { note: 'industry_lookup_enabled is false, using legacy modifiers' }
        };
    }

    return legacyMS;
}

// ============================================================================
// AUDIT AND LOGGING (Tasks 17-18)
// ============================================================================

/**
 * Application log storage (in-memory for now)
 * Task 17: Log profile application for each report
 */
const applicationLogs = [];

/**
 * Task 17: Log profile application for audit trail
 *
 * @param {Object} logEntry - { industry_code, profile_version, adjustments, base_ms, adjusted_ms, report_id }
 */
function logProfileApplication(logEntry) {
    const entry = {
        ...logEntry,
        logged_at: new Date().toISOString()
    };
    applicationLogs.push(entry);
    return entry;
}

/**
 * Get application logs (for debugging/audit)
 * @returns {Array} Log entries
 */
function getApplicationLogs() {
    return [...applicationLogs];
}

/**
 * Clear application logs
 */
function clearApplicationLogs() {
    applicationLogs.length = 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available industries
 * @returns {Array} Array of { code, name, name_en }
 */
function getAllIndustries() {
    return Object.entries(INDUSTRY_LOOKUP).map(([code, profile]) => ({
        code,
        id: profile.id,
        name: profile.name,
        name_en: profile.name_en,
        aliases: profile.aliases
    }));
}

/**
 * Task 46: Get adjustment mapping documentation
 * Returns the mapping of characteristics to ESG areas
 */
function getAdjustmentMapping() {
    return {
        regulated_materials: {
            primary: 'E',
            medium: 'G',
            small: 'SC'
        },
        international_activity: {
            primary: 'SC',
            medium: 'S',
            small: 'G'
        },
        energy_intensity: {
            medium: 'E'
        },
        water_intensity: {
            medium: 'E'
        }
    };
}

/**
 * Get current adjustment mode and caps
 */
function getAdjustmentConfig() {
    return {
        mode: ADJUSTMENT_MODE,
        caps: ADJUSTMENT_CAPS[ADJUSTMENT_MODE],
        version: LOOKUP_VERSION
    };
}

/**
 * Task 39: Validate that adjustments are smaller than answer influence
 * Answers create +-20-40 point difference, adjustments should add +-5-10
 *
 * @param {Object} adjustments - { E, S, G, SC }
 * @returns {Object} { valid, warnings }
 */
function validateAdjustmentSize(adjustments) {
    const MAX_SINGLE_ADJUSTMENT = 10;
    const MAX_TOTAL_ADJUSTMENT = 15;
    const warnings = [];

    let total = 0;
    for (const [pillar, value] of Object.entries(adjustments)) {
        if (value > MAX_SINGLE_ADJUSTMENT) {
            warnings.push(`${pillar} adjustment (${value}) exceeds recommended max (${MAX_SINGLE_ADJUSTMENT})`);
        }
        total += value;
    }

    if (total > MAX_TOTAL_ADJUSTMENT) {
        warnings.push(`Total adjustments (${total}) exceed recommended max (${MAX_TOTAL_ADJUSTMENT})`);
    }

    return {
        valid: warnings.length === 0,
        warnings,
        total
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Version info
    LOOKUP_VERSION,
    ADJUSTMENT_MODE,
    ADJUSTMENT_CAPS,

    // Level definitions
    REGULATED_MATERIALS_LEVELS,
    INTERNATIONAL_ACTIVITY_LEVELS,
    EXPORT_PROBABILITY,
    ENERGY_INTENSITY_LEVELS,
    WATER_INTENSITY_LEVELS,

    // Adjustment tables
    ADJUSTMENT_TABLE_CONSERVATIVE,
    ADJUSTMENT_TABLE_EXTENDED,

    // Industry data
    INDUSTRY_LOOKUP,
    INDUSTRY_ADJUSTMENTS,
    INDUSTRY_B,  // Re-exported from core.js

    // Core functions
    getIndustryProfile,
    getIndustryLookup,  // Legacy
    getIndustryAdjustments,
    calculateProfileAdjustments,
    applyProfileAdjustments,

    // MS calculation
    computeMSWithLookup,
    computeAllMSWithLookup,

    // Audit/logging
    logProfileApplication,
    getApplicationLogs,
    clearApplicationLogs,

    // Helpers
    getAllIndustries,
    getAdjustmentMapping,
    getAdjustmentConfig,
    validateAdjustmentSize
};
