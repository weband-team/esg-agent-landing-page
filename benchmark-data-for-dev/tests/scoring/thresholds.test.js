/**
 * Unit tests for Thresholds Module
 * Based on specification: "_system punktacji i progów przejścia.pdf"
 */

const {
    // Constants
    EXECUTIVE_THRESHOLDS,
    EXECUTIVE_STATES,
    READINESS_THRESHOLDS,
    READINESS_STATES,
    MARKET_READINESS_LABELS,
    ORG_READINESS_LABELS,
    CREDIBILITY_LABELS,
    READINESS_QUESTIONS,
    THRESHOLDS_VERSION,

    // Functions
    getExecutiveState,
    getExecutiveStateLabel,
    getReadinessState,
    getRiskState,
    computeReadinessIndex,
    computeMarketReadiness,
    computeOrgReadiness,
    computeCredibility,
    computeAllReadiness,
    getStateSummary
} = require('../../src/scoring');

describe('Thresholds Module', () => {

    describe('Version', () => {
        test('THRESHOLDS_VERSION should be defined', () => {
            expect(THRESHOLDS_VERSION).toBeDefined();
            expect(typeof THRESHOLDS_VERSION).toBe('string');
        });
    });

    describe('Executive Thresholds Constants', () => {
        test('EXECUTIVE_THRESHOLDS should have correct values', () => {
            expect(EXECUTIVE_THRESHOLDS.DOBRY).toBe(81);
            expect(EXECUTIVE_THRESHOLDS.UMIARKOWANY).toBe(51);
            expect(EXECUTIVE_THRESHOLDS.PODWYZSZONE_RYZYKO).toBe(31);
        });

        test('EXECUTIVE_STATES should have 4 states', () => {
            expect(EXECUTIVE_STATES.DOBRY).toBe('DOBRY');
            expect(EXECUTIVE_STATES.UMIARKOWANY).toBe('UMIARKOWANY');
            expect(EXECUTIVE_STATES.PODWYZSZONE_RYZYKO).toBe('PODWYZSZONE_RYZYKO');
            expect(EXECUTIVE_STATES.KRYTYCZNY).toBe('KRYTYCZNY');
        });
    });

    describe('Readiness Thresholds Constants', () => {
        test('READINESS_THRESHOLDS should have correct values', () => {
            expect(READINESS_THRESHOLDS.HIGH).toBe(0.75);
            expect(READINESS_THRESHOLDS.LOW).toBe(0.40);
        });

        test('READINESS_STATES should have 3 states', () => {
            expect(READINESS_STATES.HIGH).toBe('HIGH');
            expect(READINESS_STATES.PARTIAL).toBe('PARTIAL');
            expect(READINESS_STATES.LOW).toBe('LOW');
        });
    });

    describe('Question Mappings', () => {
        test('READINESS_QUESTIONS should have correct question sets', () => {
            expect(READINESS_QUESTIONS.MARKET).toEqual(['x6', 'x10', 'x11']);
            expect(READINESS_QUESTIONS.ORG).toEqual(['x1', 'x3', 'x7']);
            expect(READINESS_QUESTIONS.CREDIBILITY).toEqual(['x5', 'x6', 'x11', 'x12']);
        });
    });

    describe('getExecutiveState()', () => {
        test('should return DOBRY for scores >= 81', () => {
            expect(getExecutiveState(81)).toBe('DOBRY');
            expect(getExecutiveState(90)).toBe('DOBRY');
            expect(getExecutiveState(100)).toBe('DOBRY');
        });

        test('should return UMIARKOWANY for scores 51-80', () => {
            expect(getExecutiveState(51)).toBe('UMIARKOWANY');
            expect(getExecutiveState(65)).toBe('UMIARKOWANY');
            expect(getExecutiveState(80)).toBe('UMIARKOWANY');
        });

        test('should return PODWYZSZONE_RYZYKO for scores 31-50', () => {
            expect(getExecutiveState(31)).toBe('PODWYZSZONE_RYZYKO');
            expect(getExecutiveState(40)).toBe('PODWYZSZONE_RYZYKO');
            expect(getExecutiveState(50)).toBe('PODWYZSZONE_RYZYKO');
        });

        test('should return KRYTYCZNY for scores 0-30', () => {
            expect(getExecutiveState(0)).toBe('KRYTYCZNY');
            expect(getExecutiveState(15)).toBe('KRYTYCZNY');
            expect(getExecutiveState(30)).toBe('KRYTYCZNY');
        });

        test('boundary values should be correct', () => {
            // Exact boundaries
            expect(getExecutiveState(81)).toBe('DOBRY');
            expect(getExecutiveState(80)).toBe('UMIARKOWANY');
            expect(getExecutiveState(51)).toBe('UMIARKOWANY');
            expect(getExecutiveState(50)).toBe('PODWYZSZONE_RYZYKO');
            expect(getExecutiveState(31)).toBe('PODWYZSZONE_RYZYKO');
            expect(getExecutiveState(30)).toBe('KRYTYCZNY');
        });
    });

    describe('getExecutiveStateLabel()', () => {
        test('should return Polish labels for each state', () => {
            expect(getExecutiveStateLabel('DOBRY')).toBe('Dobry');
            expect(getExecutiveStateLabel('UMIARKOWANY')).toBe('Umiarkowany');
            expect(getExecutiveStateLabel('PODWYZSZONE_RYZYKO')).toBe('Podwyższone ryzyko');
            expect(getExecutiveStateLabel('KRYTYCZNY')).toBe('Krytyczny');
        });
    });

    describe('getReadinessState()', () => {
        test('should return HIGH for R >= 0.75', () => {
            expect(getReadinessState(0.75)).toBe('HIGH');
            expect(getReadinessState(0.80)).toBe('HIGH');
            expect(getReadinessState(1.0)).toBe('HIGH');
        });

        test('should return PARTIAL for 0.40 <= R < 0.75', () => {
            expect(getReadinessState(0.40)).toBe('PARTIAL');
            expect(getReadinessState(0.50)).toBe('PARTIAL');
            expect(getReadinessState(0.74)).toBe('PARTIAL');
        });

        test('should return LOW for R < 0.40', () => {
            expect(getReadinessState(0)).toBe('LOW');
            expect(getReadinessState(0.20)).toBe('LOW');
            expect(getReadinessState(0.39)).toBe('LOW');
        });

        test('boundary values should be correct', () => {
            expect(getReadinessState(0.75)).toBe('HIGH');
            expect(getReadinessState(0.749)).toBe('PARTIAL');
            expect(getReadinessState(0.40)).toBe('PARTIAL');
            expect(getReadinessState(0.399)).toBe('LOW');
        });
    });

    describe('getRiskState()', () => {
        test('should inherit state from Executive Summary', () => {
            // Risk state = Executive state (single source of truth)
            expect(getRiskState(85)).toBe('DOBRY');
            expect(getRiskState(60)).toBe('UMIARKOWANY');
            expect(getRiskState(40)).toBe('PODWYZSZONE_RYZYKO');
            expect(getRiskState(20)).toBe('KRYTYCZNY');
        });
    });

    describe('computeReadinessIndex()', () => {
        test('should return 0 for empty answers', () => {
            expect(computeReadinessIndex({}, ['x1', 'x2'])).toBe(0);
        });

        test('should return 1 for all TAK answers', () => {
            const answers = { x1: 5, x2: 5, x3: 5 };
            expect(computeReadinessIndex(answers, ['x1', 'x2', 'x3'])).toBe(1);
        });

        test('should return 0 for all NIE answers', () => {
            const answers = { x1: 0, x2: 0, x3: 0 };
            expect(computeReadinessIndex(answers, ['x1', 'x2', 'x3'])).toBe(0);
        });

        test('should calculate partial index correctly', () => {
            const answers = { x1: 5, x2: 0, x3: 5 }; // 2/3 TAK
            const index = computeReadinessIndex(answers, ['x1', 'x2', 'x3']);
            expect(index).toBeCloseTo(0.67, 1);
        });

        test('should ignore null/undefined answers', () => {
            const answers = { x1: 5, x2: null, x3: 5 }; // 2/2 valid TAK
            const index = computeReadinessIndex(answers, ['x1', 'x2', 'x3']);
            expect(index).toBe(1);
        });
    });

    describe('computeMarketReadiness()', () => {
        test('should use questions X6, X10, X11', () => {
            const answers = { x6: 5, x10: 5, x11: 5 };
            const result = computeMarketReadiness(answers);
            expect(result.questions).toEqual(['x6', 'x10', 'x11']);
        });

        test('should return GOTOWA for all TAK', () => {
            const answers = { x6: 5, x10: 5, x11: 5 };
            const result = computeMarketReadiness(answers);
            expect(result.index).toBe(1);
            expect(result.state).toBe('HIGH');
            expect(result.label).toBe('GOTOWA');
        });

        test('should return NIEGOTOWA for all NIE', () => {
            const answers = { x6: 0, x10: 0, x11: 0 };
            const result = computeMarketReadiness(answers);
            expect(result.index).toBe(0);
            expect(result.state).toBe('LOW');
            expect(result.label).toBe('NIEGOTOWA');
        });

        test('should return CZESCIOWA for partial answers', () => {
            const answers = { x6: 5, x10: 5, x11: 0 }; // 2/3 = 0.67
            const result = computeMarketReadiness(answers);
            expect(result.state).toBe('PARTIAL');
            expect(result.label).toBe('CZESCIOWA');
        });
    });

    describe('computeOrgReadiness()', () => {
        test('should use questions X1, X3, X7', () => {
            const answers = { x1: 5, x3: 5, x7: 5 };
            const result = computeOrgReadiness(answers);
            expect(result.questions).toEqual(['x1', 'x3', 'x7']);
        });

        test('should return USTAWIONA for all TAK', () => {
            const answers = { x1: 5, x3: 5, x7: 5 };
            const result = computeOrgReadiness(answers);
            expect(result.index).toBe(1);
            expect(result.state).toBe('HIGH');
            expect(result.label).toBe('USTAWIONA');
        });

        test('should return NIEUPORZADKOWANA for all NIE', () => {
            const answers = { x1: 0, x3: 0, x7: 0 };
            const result = computeOrgReadiness(answers);
            expect(result.index).toBe(0);
            expect(result.state).toBe('LOW');
            expect(result.label).toBe('NIEUPORZADKOWANA');
        });
    });

    describe('computeCredibility()', () => {
        test('should use questions X5, X6, X11, X12', () => {
            const answers = { x5: 5, x6: 5, x11: 5, x12: 5 };
            const result = computeCredibility(answers);
            expect(result.questions).toEqual(['x5', 'x6', 'x11', 'x12']);
        });

        test('should return WYSOKA for all TAK', () => {
            const answers = { x5: 5, x6: 5, x11: 5, x12: 5 };
            const result = computeCredibility(answers);
            expect(result.index).toBe(1);
            expect(result.state).toBe('HIGH');
            expect(result.label).toBe('WYSOKA');
        });

        test('should return NISKA for all NIE', () => {
            const answers = { x5: 0, x6: 0, x11: 0, x12: 0 };
            const result = computeCredibility(answers);
            expect(result.index).toBe(0);
            expect(result.state).toBe('LOW');
            expect(result.label).toBe('NISKA');
        });

        test('should return SREDNIA for partial answers', () => {
            const answers = { x5: 5, x6: 5, x11: 0, x12: 0 }; // 2/4 = 0.5
            const result = computeCredibility(answers);
            expect(result.state).toBe('PARTIAL');
            expect(result.label).toBe('SREDNIA');
        });
    });

    describe('computeAllReadiness()', () => {
        test('should compute all three readiness indices', () => {
            const answers = {
                x1: 5, x3: 5, x7: 5,     // Org: 1.0
                x5: 5, x6: 5, x11: 5, x12: 5,  // Credibility: 1.0
                x10: 5                    // Market uses x6, x10, x11
            };
            const result = computeAllReadiness(answers);

            expect(result.marketReadiness).toBeDefined();
            expect(result.orgReadiness).toBeDefined();
            expect(result.credibility).toBeDefined();
        });
    });

    describe('getStateSummary()', () => {
        test('should return complete state summary', () => {
            const answers = {
                x1: 5, x3: 5, x7: 5,
                x5: 5, x6: 5, x10: 5, x11: 5, x12: 5
            };
            const result = getStateSummary(85, answers);

            expect(result.version).toBe(THRESHOLDS_VERSION);
            expect(result.executive.score).toBe(85);
            expect(result.executive.state).toBe('DOBRY');
            expect(result.executive.label).toBe('Dobry');
            expect(result.risk.state).toBe('DOBRY');
            expect(result.risk.note).toBe('Inherited from Executive Summary');
            expect(result.marketReadiness).toBeDefined();
            expect(result.orgReadiness).toBeDefined();
            expect(result.credibility).toBeDefined();
        });
    });

    describe('Integration with CORE', () => {
        const { getInterpretation } = require('../../src/scoring');

        test('getInterpretation should use new 4-state thresholds', () => {
            expect(getInterpretation(85)).toBe('Dobry');
            expect(getInterpretation(65)).toBe('Umiarkowany');
            expect(getInterpretation(40)).toBe('Podwyższone ryzyko');
            expect(getInterpretation(20)).toBe('Krytyczny');
        });

        test('getInterpretation boundary values', () => {
            expect(getInterpretation(81)).toBe('Dobry');
            expect(getInterpretation(80)).toBe('Umiarkowany');
            expect(getInterpretation(51)).toBe('Umiarkowany');
            expect(getInterpretation(50)).toBe('Podwyższone ryzyko');
            expect(getInterpretation(31)).toBe('Podwyższone ryzyko');
            expect(getInterpretation(30)).toBe('Krytyczny');
        });
    });
});
