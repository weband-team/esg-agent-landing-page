/**
 * Unit tests for Industry Lookup Module (Krok 3) - Extended Version
 * Tests for Tasks 1-47 from "System2.pdf" specification
 */

const {
    FEATURE_FLAGS,
    setFeatureFlag,
    getFeatureFlag
} = require('../../src/scoring/feature-flags');

const {
    INDUSTRY_LOOKUP,
    INDUSTRY_ADJUSTMENTS,
    LOOKUP_VERSION,
    ADJUSTMENT_MODE,
    ADJUSTMENT_CAPS,
    REGULATED_MATERIALS_LEVELS,
    INTERNATIONAL_ACTIVITY_LEVELS,
    ENERGY_INTENSITY_LEVELS,
    WATER_INTENSITY_LEVELS,
    ADJUSTMENT_TABLE_CONSERVATIVE,
    ADJUSTMENT_TABLE_EXTENDED,
    getIndustryProfile,
    getIndustryLookup,
    getIndustryAdjustments,
    calculateProfileAdjustments,
    applyProfileAdjustments,
    computeMSWithLookup,
    computeAllMSWithLookup,
    getAllIndustries,
    getAdjustmentMapping,
    getAdjustmentConfig,
    validateAdjustmentSize,
    logProfileApplication,
    getApplicationLogs,
    clearApplicationLogs,
    INDUSTRY_B
} = require('../../src/scoring/industry-lookup');

describe('Industry Lookup Module (Krok 3) - Extended', () => {

    beforeEach(() => {
        setFeatureFlag('industry_lookup_enabled', false);
        clearApplicationLogs();
    });

    // =========================================================================
    // Tasks 1-5: Level Definitions
    // =========================================================================
    describe('Tasks 1-5: Level Definitions', () => {
        test('Task 1: regulated_materials_level should have 5 levels (0-4)', () => {
            expect(Object.keys(REGULATED_MATERIALS_LEVELS).length).toBe(5);
            expect(REGULATED_MATERIALS_LEVELS[0]).toBe('none');
            expect(REGULATED_MATERIALS_LEVELS[4]).toBe('very_high');
        });

        test('Task 2: international_activity_level should have 5 levels (0-4)', () => {
            expect(Object.keys(INTERNATIONAL_ACTIVITY_LEVELS).length).toBe(5);
            expect(INTERNATIONAL_ACTIVITY_LEVELS[0]).toBe('domestic_only');
            expect(INTERNATIONAL_ACTIVITY_LEVELS[4]).toBe('global');
        });

        test('Task 4: energy_intensity_level should have 4 levels (0-3)', () => {
            expect(Object.keys(ENERGY_INTENSITY_LEVELS).length).toBe(4);
            expect(ENERGY_INTENSITY_LEVELS[0]).toBe('low');
            expect(ENERGY_INTENSITY_LEVELS[3]).toBe('very_high');
        });

        test('Task 5: water_intensity_level should have 4 levels (0-3)', () => {
            expect(Object.keys(WATER_INTENSITY_LEVELS).length).toBe(4);
            expect(WATER_INTENSITY_LEVELS[0]).toBe('low');
            expect(WATER_INTENSITY_LEVELS[3]).toBe('very_high');
        });
    });

    // =========================================================================
    // Task 6: Industry Profiles for 8 Industries
    // =========================================================================
    describe('Task 6: Industry Profiles', () => {
        const industries = [
            'construction', 'energy_raw_materials', 'industrial_production',
            'logistics_transport', 'trade_retail', 'it_software', 'finance', 'services_other'
        ];

        test('should have entries for all 8 industries', () => {
            industries.forEach(industry => {
                expect(INDUSTRY_LOOKUP[industry]).toBeDefined();
            });
        });

        test('each industry should have extended structure', () => {
            industries.forEach(industry => {
                const profile = INDUSTRY_LOOKUP[industry];
                expect(profile.id).toBeDefined();
                expect(profile.name).toBeDefined();
                expect(profile.name_en).toBeDefined();
                expect(profile.aliases).toBeInstanceOf(Array);
                expect(profile.base).toBeDefined();
                expect(profile.levels).toBeDefined();
                expect(profile.esg_focus_hint).toBeInstanceOf(Array);
                expect(profile.key_risks).toBeInstanceOf(Array);
                expect(profile.exposures).toBeDefined();
                expect(profile.modifiers).toBeDefined();
            });
        });

        test('each industry should have E/S/G/SC in base and modifiers', () => {
            industries.forEach(industry => {
                const profile = INDUSTRY_LOOKUP[industry];
                ['E', 'S', 'G', 'SC'].forEach(pillar => {
                    expect(profile.base[pillar]).toBeDefined();
                    expect(typeof profile.base[pillar]).toBe('number');
                    expect(profile.modifiers[pillar]).toBeDefined();
                    expect(typeof profile.modifiers[pillar]).toBe('number');
                });
            });
        });

        test('each industry should have all level fields', () => {
            industries.forEach(industry => {
                const levels = INDUSTRY_LOOKUP[industry].levels;
                expect(levels.regulated_materials_level).toBeDefined();
                expect(levels.international_activity_level).toBeDefined();
                expect(levels.export_probability).toBeDefined();
                expect(levels.energy_intensity_level).toBeDefined();
                expect(levels.water_intensity_level).toBeDefined();
            });
        });
    });

    // =========================================================================
    // Tasks 25-32: Specific Industry Profiles
    // =========================================================================
    describe('Tasks 25-32: Specific Industry Profiles', () => {
        test('Task 25: Construction profile', () => {
            const profile = INDUSTRY_LOOKUP['construction'];
            expect(profile.id).toBe('CONSTR');
            expect(profile.levels.regulated_materials_level).toBe(2); // medium
            expect(profile.levels.international_activity_level).toBe(1); // low
            expect(profile.levels.energy_intensity_level).toBe(1); // medium
            expect(profile.levels.water_intensity_level).toBe(0); // low
            expect(profile.esg_focus_hint).toContain('E');
            expect(profile.esg_focus_hint).toContain('S');
        });

        test('Task 26: Energy & Raw Materials profile', () => {
            const profile = INDUSTRY_LOOKUP['energy_raw_materials'];
            expect(profile.id).toBe('ENRES');
            expect(profile.levels.regulated_materials_level).toBe(4); // very_high
            expect(profile.levels.international_activity_level).toBe(3); // high
            expect(profile.levels.energy_intensity_level).toBe(3); // very_high
            expect(profile.levels.water_intensity_level).toBe(2); // high
            expect(profile.esg_focus_hint).toContain('E');
            expect(profile.esg_focus_hint).toContain('G');
        });

        test('Task 27: Industrial Production profile', () => {
            const profile = INDUSTRY_LOOKUP['industrial_production'];
            expect(profile.id).toBe('MANUF');
            expect(profile.levels.regulated_materials_level).toBe(3); // high
            expect(profile.levels.international_activity_level).toBe(3); // high
        });

        test('Task 28: Logistics & Transport profile', () => {
            const profile = INDUSTRY_LOOKUP['logistics_transport'];
            expect(profile.id).toBe('LOGTR');
            expect(profile.levels.regulated_materials_level).toBe(2); // medium
            expect(profile.levels.international_activity_level).toBe(3); // high
            expect(profile.levels.energy_intensity_level).toBe(2); // high
        });

        test('Task 29: Trade & Retail profile', () => {
            const profile = INDUSTRY_LOOKUP['trade_retail'];
            expect(profile.id).toBe('RETTR');
            expect(profile.levels.regulated_materials_level).toBe(1); // low
            expect(profile.levels.international_activity_level).toBe(2); // medium
            expect(profile.esg_focus_hint).toContain('S');
            expect(profile.esg_focus_hint).toContain('SC');
        });

        test('Task 30: IT & Software profile', () => {
            const profile = INDUSTRY_LOOKUP['it_software'];
            expect(profile.id).toBe('ITSW');
            expect(profile.levels.regulated_materials_level).toBe(1); // low
            expect(profile.levels.international_activity_level).toBe(3); // high
            expect(profile.levels.energy_intensity_level).toBe(0); // low
            expect(profile.esg_focus_hint).toContain('G');
            expect(profile.esg_focus_hint).toContain('S');
        });

        test('Task 31: Finance profile', () => {
            const profile = INDUSTRY_LOOKUP['finance'];
            expect(profile.id).toBe('FINFT');
            expect(profile.levels.regulated_materials_level).toBe(0); // none
            expect(profile.levels.international_activity_level).toBe(3); // high
            expect(profile.esg_focus_hint).toContain('G');
            expect(profile.esg_focus_hint).toContain('SC');
        });

        test('Task 32: Services profile', () => {
            const profile = INDUSTRY_LOOKUP['services_other'];
            expect(profile.id).toBe('SERV');
            expect(profile.levels.regulated_materials_level).toBe(1); // low
            expect(profile.levels.international_activity_level).toBe(2); // medium
        });
    });

    // =========================================================================
    // Task 33: Aliases
    // =========================================================================
    describe('Task 33: Industry Aliases', () => {
        test('construction should have aliases', () => {
            const profile = INDUSTRY_LOOKUP['construction'];
            expect(profile.aliases).toContain('construction');
            expect(profile.aliases).toContain('real estate');
            expect(profile.aliases).toContain('budownictwo');
        });

        test('IT should have aliases', () => {
            const profile = INDUSTRY_LOOKUP['it_software'];
            expect(profile.aliases).toContain('software');
            expect(profile.aliases).toContain('saas');
            expect(profile.aliases).toContain('tech');
        });

        test('getIndustryProfile should find by alias', () => {
            setFeatureFlag('industry_lookup_enabled', true);

            expect(getIndustryProfile('software').id).toBe('ITSW');
            expect(getIndustryProfile('banking').id).toBe('FINFT');
            expect(getIndustryProfile('manufacturing').id).toBe('MANUF');
            expect(getIndustryProfile('energy').id).toBe('ENRES');
        });
    });

    // =========================================================================
    // Tasks 35-36: Adjustment Tables
    // =========================================================================
    describe('Tasks 35-36: Adjustment Tables', () => {
        test('Task 35: Conservative table should have correct values', () => {
            // regulated_materials -> E
            expect(ADJUSTMENT_TABLE_CONSERVATIVE.regulated_materials.E[0]).toBe(0);
            expect(ADJUSTMENT_TABLE_CONSERVATIVE.regulated_materials.E[2]).toBe(2);
            expect(ADJUSTMENT_TABLE_CONSERVATIVE.regulated_materials.E[4]).toBe(6);

            // international_activity -> SC
            expect(ADJUSTMENT_TABLE_CONSERVATIVE.international_activity.SC[1]).toBe(1);
            expect(ADJUSTMENT_TABLE_CONSERVATIVE.international_activity.SC[4]).toBe(5);
        });

        test('Task 36: Extended table should have stronger values', () => {
            // regulated_materials -> E
            expect(ADJUSTMENT_TABLE_EXTENDED.regulated_materials.E[2]).toBe(3);
            expect(ADJUSTMENT_TABLE_EXTENDED.regulated_materials.E[4]).toBe(10);

            // international_activity -> SC
            expect(ADJUSTMENT_TABLE_EXTENDED.international_activity.SC[4]).toBe(10);
        });

        test('Pre-calculated adjustments should be within caps', () => {
            // Conservative construction: E=3, S=0, G=1, SC=1 (total=5, no cap)
            expect(INDUSTRY_ADJUSTMENTS.conservative.construction).toEqual({ E: 3, S: 0, G: 1, SC: 1 });

            // Conservative energy: total capped at 10
            const energyConservative = INDUSTRY_ADJUSTMENTS.conservative.energy_raw_materials;
            const energyTotal = energyConservative.E + energyConservative.S + energyConservative.G + energyConservative.SC;
            expect(energyTotal).toBeLessThanOrEqual(10);
            expect(energyConservative.E).toBeGreaterThan(0); // Energy should have E boost

            // Extended energy: total capped at 15
            const energyExtended = INDUSTRY_ADJUSTMENTS.extended.energy_raw_materials;
            const energyExtTotal = energyExtended.E + energyExtended.S + energyExtended.G + energyExtended.SC;
            expect(energyExtTotal).toBeLessThanOrEqual(15);
        });
    });

    // =========================================================================
    // Task 37-38: Calculate and Apply Adjustments
    // =========================================================================
    describe('Tasks 37-38: Adjustment Calculation', () => {
        test('Task 37: calculateProfileAdjustments should work correctly', () => {
            const profile = INDUSTRY_LOOKUP['construction'];
            const adjustments = calculateProfileAdjustments(profile, 'conservative');

            expect(adjustments.E).toBe(3);
            expect(adjustments.S).toBe(0);
            expect(adjustments.G).toBe(1);
            expect(adjustments.SC).toBe(1);
        });

        test('Task 38: Adjustments should respect per-pillar cap', () => {
            const profile = INDUSTRY_LOOKUP['energy_raw_materials'];
            const adjustments = calculateProfileAdjustments(profile, 'conservative');

            // E should be capped at 6
            expect(adjustments.E).toBeLessThanOrEqual(6);
        });

        test('Task 38: Adjustments should respect global cap', () => {
            const profile = INDUSTRY_LOOKUP['energy_raw_materials'];
            const adjustments = calculateProfileAdjustments(profile, 'conservative');

            const total = adjustments.E + adjustments.S + adjustments.G + adjustments.SC;
            expect(total).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.total);
        });

        test('applyProfileAdjustments should return adjusted MS', () => {
            const profile = INDUSTRY_LOOKUP['construction'];
            const baseMS = { E: 30, S: 25, G: 20, SC: 20 };
            const result = applyProfileAdjustments(profile, baseMS, 'conservative');

            expect(result.adjustedMS.E).toBe(33); // 30 + 3
            expect(result.adjustedMS.S).toBe(25); // 25 + 0
            expect(result.adjustedMS.G).toBe(21); // 20 + 1
            expect(result.adjustedMS.SC).toBe(21); // 20 + 1
            expect(result.log).toBeDefined();
            expect(result.log.profile_version).toBe(LOOKUP_VERSION.version);
        });
    });

    // =========================================================================
    // Task 39: Adjustments vs Answers
    // =========================================================================
    describe('Task 39: Adjustments should be smaller than answer influence', () => {
        test('All industries should have valid adjustment sizes', () => {
            Object.keys(INDUSTRY_LOOKUP).forEach(industry => {
                const profile = INDUSTRY_LOOKUP[industry];
                const adjustments = calculateProfileAdjustments(profile, 'extended');
                const validation = validateAdjustmentSize(adjustments);

                // Extended mode allows up to +10 per pillar and +15 total
                // This test just verifies no industry produces invalid values
                expect(validation.total).toBeLessThanOrEqual(15);
            });
        });

        test('Conservative mode calculated adjustments should be limited', () => {
            // Test actual calculated adjustments (with caps applied)
            Object.keys(INDUSTRY_LOOKUP).forEach(industry => {
                const profile = INDUSTRY_LOOKUP[industry];
                const adjustments = calculateProfileAdjustments(profile, 'conservative');
                const total = adjustments.E + adjustments.S + adjustments.G + adjustments.SC;

                expect(total).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.total);
                expect(adjustments.E).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.perPillar);
                expect(adjustments.S).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.perPillar);
                expect(adjustments.G).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.perPillar);
                expect(adjustments.SC).toBeLessThanOrEqual(ADJUSTMENT_CAPS.conservative.perPillar);
            });
        });
    });

    // =========================================================================
    // Tasks 40-42: Profile Testing
    // =========================================================================
    describe('Task 40: Test Energy & Production profiles', () => {
        test('Energy with 60% E score should have high MS(E)', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('energy_raw_materials', 20, 15, { includeLog: true });

            // Base E = 40, R=20, C=15
            // Base MS = 0.6*40 + 0.2*20 + 0.2*15 = 24 + 4 + 3 = 31
            // With caps applied, E adjustment is positive
            expect(result.ms.E).toBeGreaterThan(30);
            expect(result.adjustments.E).toBeGreaterThan(0);
            // E should be the highest adjusted pillar for energy
            expect(result.adjustments.E).toBeGreaterThanOrEqual(result.adjustments.S);
        });

        test('Production with average G score should have boosted MS(G)', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('industrial_production', 10, 10, { includeLog: true });

            // G adjustment should be positive for production (high regulated materials)
            expect(result.adjustments.G).toBeGreaterThan(0);
        });
    });

    describe('Task 41: Test IT & Finance profiles', () => {
        test('IT should NOT get artificially high E', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('it_software', 0, 0, { includeLog: true });

            // IT E adjustment should be 0
            expect(result.adjustments.E).toBe(0);
            // Base E = 10, so MS(E) should be low
            expect(result.ms.E).toBeLessThanOrEqual(10);
        });

        test('Finance should NOT get artificially high E', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('finance', 0, 0, { includeLog: true });

            // Finance E adjustment should be 0
            expect(result.adjustments.E).toBe(0);
            // Base E = 10, so MS(E) should be low
            expect(result.ms.E).toBeLessThanOrEqual(10);
        });

        test('IT should get boost in G and SC', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('it_software', 10, 10, { includeLog: true });

            expect(result.adjustments.G).toBe(2);
            expect(result.adjustments.SC).toBe(4);
        });
    });

    describe('Task 42: Test Logistics profile', () => {
        test('Logistics should get E+S+SC boost', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('logistics_transport', 10, 10, { includeLog: true });

            // Logistics should have positive adjustments for E, S, and SC
            // due to medium regulated_materials, high international activity, and high energy
            expect(result.adjustments.E).toBeGreaterThan(0);
            expect(result.adjustments.S).toBeGreaterThan(0);
            expect(result.adjustments.SC).toBeGreaterThan(0);
            // SC should be highest due to international activity
            expect(result.adjustments.SC).toBeGreaterThanOrEqual(result.adjustments.S);
        });
    });

    // =========================================================================
    // Task 16: Versioning
    // =========================================================================
    describe('Task 16: Versioning', () => {
        test('LOOKUP_VERSION should have required fields', () => {
            expect(LOOKUP_VERSION.version).toBeDefined();
            expect(LOOKUP_VERSION.valid_from).toBeDefined();
            expect(LOOKUP_VERSION.valid_to).toBe(null); // current version
            expect(LOOKUP_VERSION.description).toBeDefined();
        });
    });

    // =========================================================================
    // Task 17: Logging
    // =========================================================================
    describe('Task 17: Logging', () => {
        test('logProfileApplication should store entries', () => {
            const entry = logProfileApplication({
                industry_code: 'CONSTR',
                profile_version: 'v1.0',
                adjustments: { E: 3, S: 0, G: 1, SC: 1 },
                base_ms: { E: 30, S: 25, G: 20, SC: 20 },
                adjusted_ms: { E: 33, S: 25, G: 21, SC: 21 },
                report_id: 'test-123'
            });

            expect(entry.logged_at).toBeDefined();
            expect(getApplicationLogs().length).toBe(1);
        });

        test('clearApplicationLogs should clear all entries', () => {
            logProfileApplication({ test: true });
            expect(getApplicationLogs().length).toBe(1);
            clearApplicationLogs();
            expect(getApplicationLogs().length).toBe(0);
        });
    });

    // =========================================================================
    // Task 21: getIndustryProfile
    // =========================================================================
    describe('Task 21: getIndustryProfile', () => {
        test('should return profile for valid industry', () => {
            const profile = getIndustryProfile('construction');
            expect(profile.id).toBe('CONSTR');
        });

        test('should return services_other for unknown industry', () => {
            const profile = getIndustryProfile('unknown_xyz');
            expect(profile.id).toBe('SERV');
        });

        test('should handle null input', () => {
            const profile = getIndustryProfile(null);
            expect(profile.id).toBe('SERV');
        });
    });

    // =========================================================================
    // Legacy: getIndustryLookup
    // =========================================================================
    describe('getIndustryLookup (Legacy)', () => {
        test('should return basic structure when flag is disabled', () => {
            setFeatureFlag('industry_lookup_enabled', false);
            const lookup = getIndustryLookup('construction');

            expect(lookup.base).toBeDefined();
            expect(lookup.exposures).toEqual({});
            expect(lookup.modifiers).toEqual({ E: 1.0, S: 1.0, G: 1.0, SC: 1.0 });
        });

        test('should return full lookup when flag is enabled', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const lookup = getIndustryLookup('construction');

            expect(lookup.base).toBeDefined();
            expect(lookup.exposures.regulated_materials).toBe(true);
            expect(lookup.modifiers.E).toBe(1.1);
        });
    });

    // =========================================================================
    // computeMSWithLookup
    // =========================================================================
    describe('computeMSWithLookup', () => {
        test('should compute MS with modifier', () => {
            const B_i = 35;
            const R = 10;
            const C = 5;
            const modifier = 1.1;

            const ms = computeMSWithLookup(B_i, R, C, modifier);
            const expected = (0.6 * B_i + 0.2 * R + 0.2 * C) * modifier;

            expect(ms).toBe(expected);
        });

        test('should cap MS at 100', () => {
            const ms = computeMSWithLookup(100, 100, 100, 2.0);
            expect(ms).toBe(100);
        });

        test('should not go below 0', () => {
            const ms = computeMSWithLookup(0, 0, 0, 1.0);
            expect(ms).toBe(0);
        });
    });

    // =========================================================================
    // computeAllMSWithLookup
    // =========================================================================
    describe('computeAllMSWithLookup', () => {
        test('should compute MS with adjustments when enabled', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const ms = computeAllMSWithLookup('construction', 10, 5);

            expect(ms.E).toBeDefined();
            expect(ms.S).toBeDefined();
            expect(ms.G).toBeDefined();
            expect(ms.SC).toBeDefined();
        });

        test('should return log when includeLog=true', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            const result = computeAllMSWithLookup('construction', 10, 5, { includeLog: true });

            expect(result.ms).toBeDefined();
            expect(result.adjustments).toBeDefined();
            expect(result.log).toBeDefined();
        });

        test('should use legacy modifiers when flag is disabled', () => {
            setFeatureFlag('industry_lookup_enabled', false);
            const result = computeAllMSWithLookup('construction', 10, 5, { includeLog: true });

            expect(result.adjustments).toBe(null);
            expect(result.log.note).toContain('legacy modifiers');
        });
    });

    // =========================================================================
    // Helper Functions
    // =========================================================================
    describe('Helper Functions', () => {
        test('getAllIndustries should return all 8 industries', () => {
            const industries = getAllIndustries();
            expect(industries.length).toBe(8);
            expect(industries[0].code).toBeDefined();
            expect(industries[0].name).toBeDefined();
            expect(industries[0].name_en).toBeDefined();
        });

        test('getAdjustmentMapping should return correct mapping', () => {
            const mapping = getAdjustmentMapping();
            expect(mapping.regulated_materials.primary).toBe('E');
            expect(mapping.international_activity.primary).toBe('SC');
        });

        test('getAdjustmentConfig should return current config', () => {
            const config = getAdjustmentConfig();
            expect(config.mode).toBe(ADJUSTMENT_MODE);
            expect(config.caps).toBeDefined();
            expect(config.version).toBe(LOOKUP_VERSION);
        });
    });
});
