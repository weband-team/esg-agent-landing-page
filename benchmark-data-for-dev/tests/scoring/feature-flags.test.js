/**
 * Unit tests for Feature Flags Module
 */

const {
    SCORING_VERSION,
    ENGINE_VERSION,
    INDUSTRY_LOOKUP_VERSION,
    ROI_PROOF_VERSION,
    VENDOR_EXPORT_VERSION,
    FEATURE_FLAGS,
    setFeatureFlag,
    getFeatureFlag
} = require('../../src/scoring');

describe('Feature Flags Module', () => {

    // Reset flags before each test
    beforeEach(() => {
        setFeatureFlag('industry_lookup_enabled', false);
        setFeatureFlag('roi_proof_enabled', false);
        setFeatureFlag('whatif_and_exports_enabled', false);
    });

    describe('Version Constants', () => {
        test('SCORING_VERSION should be defined', () => {
            expect(SCORING_VERSION).toBeDefined();
            expect(typeof SCORING_VERSION).toBe('string');
        });

        test('ENGINE_VERSION should be defined', () => {
            expect(ENGINE_VERSION).toBeDefined();
            expect(typeof ENGINE_VERSION).toBe('string');
        });

        test('INDUSTRY_LOOKUP_VERSION should be defined', () => {
            expect(INDUSTRY_LOOKUP_VERSION).toBeDefined();
            expect(typeof INDUSTRY_LOOKUP_VERSION).toBe('string');
        });

        test('ROI_PROOF_VERSION should be defined', () => {
            expect(ROI_PROOF_VERSION).toBeDefined();
            expect(typeof ROI_PROOF_VERSION).toBe('string');
        });

        test('VENDOR_EXPORT_VERSION should be defined', () => {
            expect(VENDOR_EXPORT_VERSION).toBeDefined();
            expect(typeof VENDOR_EXPORT_VERSION).toBe('string');
        });
    });

    describe('FEATURE_FLAGS structure', () => {
        test('should have industry_lookup_enabled flag', () => {
            expect(FEATURE_FLAGS).toHaveProperty('industry_lookup_enabled');
        });

        test('should have roi_proof_enabled flag', () => {
            expect(FEATURE_FLAGS).toHaveProperty('roi_proof_enabled');
        });

        test('should have whatif_and_exports_enabled flag', () => {
            expect(FEATURE_FLAGS).toHaveProperty('whatif_and_exports_enabled');
        });
    });

    describe('Flag Management', () => {
        test('all flags should be disabled by default', () => {
            expect(getFeatureFlag('industry_lookup_enabled')).toBe(false);
            expect(getFeatureFlag('roi_proof_enabled')).toBe(false);
            expect(getFeatureFlag('whatif_and_exports_enabled')).toBe(false);
        });

        test('setFeatureFlag should enable flags', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            expect(getFeatureFlag('industry_lookup_enabled')).toBe(true);
        });

        test('setFeatureFlag should disable flags', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            setFeatureFlag('industry_lookup_enabled', false);
            expect(getFeatureFlag('industry_lookup_enabled')).toBe(false);
        });

        test('getFeatureFlag should return false for unknown flags', () => {
            expect(getFeatureFlag('unknown_flag')).toBe(false);
            expect(getFeatureFlag('')).toBe(false);
            expect(getFeatureFlag(null)).toBe(false);
        });

        test('setFeatureFlag should ignore unknown flags', () => {
            setFeatureFlag('unknown_flag', true);
            expect(getFeatureFlag('unknown_flag')).toBe(false);
        });

        test('flags should be independent', () => {
            setFeatureFlag('roi_proof_enabled', true);

            expect(getFeatureFlag('roi_proof_enabled')).toBe(true);
            expect(getFeatureFlag('industry_lookup_enabled')).toBe(false);
            expect(getFeatureFlag('whatif_and_exports_enabled')).toBe(false);
        });

        test('all flags can be enabled simultaneously', () => {
            setFeatureFlag('industry_lookup_enabled', true);
            setFeatureFlag('roi_proof_enabled', true);
            setFeatureFlag('whatif_and_exports_enabled', true);

            expect(getFeatureFlag('industry_lookup_enabled')).toBe(true);
            expect(getFeatureFlag('roi_proof_enabled')).toBe(true);
            expect(getFeatureFlag('whatif_and_exports_enabled')).toBe(true);
        });
    });
});
