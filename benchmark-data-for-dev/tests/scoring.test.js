/**
 * ESG Scoring Module - Test Suite
 *
 * BACKWARD COMPATIBILITY WRAPPER
 * This file imports all modular test suites.
 * Tests are now organized in tests/scoring/ directory.
 *
 * Test files:
 * - tests/scoring/core.test.js - CORE scoring tests
 * - tests/scoring/relevance.test.js - Relevance Engine tests
 * - tests/scoring/feature-flags.test.js - Feature Flags tests
 * - tests/scoring/industry-lookup.test.js - Industry Lookup (Krok 3) tests
 * - tests/scoring/roi-proof.test.js - ROI Proof (Krok 4) tests
 * - tests/scoring/vendor-export.test.js - Vendor Export (Krok 5) tests
 */

// Import all test modules - Jest will run them automatically
require('./scoring/core.test');
require('./scoring/relevance.test');
require('./scoring/feature-flags.test');
require('./scoring/industry-lookup.test');
require('./scoring/roi-proof.test');
require('./scoring/vendor-export.test');
require('./scoring/integration.test');
require('./scoring/thresholds.test');

// Backward compatibility: verify main module exports work
const scoring = require('../src/scoring');

describe('Backward Compatibility', () => {
    test('main scoring module should export all functions', () => {
        // Core
        expect(scoring.ANSWER_VALUES).toBeDefined();
        expect(scoring.QUESTIONS).toBeDefined();
        expect(scoring.computeScores).toBeDefined();

        // Relevance
        expect(scoring.computeMS).toBeDefined();
        expect(scoring.computeRelevance).toBeDefined();
        expect(scoring.simulateWhatIf).toBeDefined();

        // Feature Flags
        expect(scoring.FEATURE_FLAGS).toBeDefined();
        expect(scoring.setFeatureFlag).toBeDefined();
        expect(scoring.getFeatureFlag).toBeDefined();

        // Industry Lookup (Krok 3)
        expect(scoring.INDUSTRY_LOOKUP).toBeDefined();
        expect(scoring.getIndustryLookup).toBeDefined();
        expect(scoring.computeAllMSWithLookup).toBeDefined();

        // ROI Proof (Krok 4)
        expect(scoring.BUSINESS_NARRATIVES).toBeDefined();
        expect(scoring.selectTop2).toBeDefined();
        expect(scoring.generateROIProof).toBeDefined();

        // Vendor Export (Krok 5)
        expect(scoring.VENDOR_TEMPLATE_NAMESPACE).toBeDefined();
        expect(scoring.generateVendorTemplate).toBeDefined();
        expect(scoring.exportAnswersForVendor).toBeDefined();
        expect(scoring.importAnswersFromVendor).toBeDefined();
    });
});
