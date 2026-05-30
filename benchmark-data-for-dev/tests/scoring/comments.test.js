/**
 * Unit tests for Comments Module
 * Based on methodology document: "ZASADY NADRZEDNE (obowiazuja wszystkie pytania)"
 */

const {
    // Constants
    NORMALIZED_ANSWER_VALUES,
    COMMENT_QUESTION_GROUPS,
    READINESS_THRESHOLDS,
    ES_SCORE_THRESHOLDS,
    STATE_LABELS,

    // Functions
    normalizeAnswer,
    calculateGap,
    calculateReadiness,
    getReadinessColorState,
    getExecutiveSummaryState,
    calculateCommentState,
    calculateAllCommentStates,
    getStateLabel
} = require('../../src/scoring/comments');

describe('Comments Module', () => {

    // ========================================================================
    // SECTION 0: Answer Normalization Tests
    // ========================================================================

    describe('Answer Normalization (Section 0.1)', () => {

        describe('NORMALIZED_ANSWER_VALUES constants', () => {
            test('TAK should be 1.0', () => {
                expect(NORMALIZED_ANSWER_VALUES.TAK).toBe(1.0);
            });

            test('W_TRAKCIE should be 0.5', () => {
                expect(NORMALIZED_ANSWER_VALUES.W_TRAKCIE).toBe(0.5);
            });

            test('NIE should be 0.0', () => {
                expect(NORMALIZED_ANSWER_VALUES.NIE).toBe(0.0);
            });

            test('NIE_WIEM should be 0.0', () => {
                expect(NORMALIZED_ANSWER_VALUES.NIE_WIEM).toBe(0.0);
            });

            test('NIE_DOTYCZY should be null (excluded)', () => {
                expect(NORMALIZED_ANSWER_VALUES.NIE_DOTYCZY).toBeNull();
            });
        });

        describe('normalizeAnswer()', () => {
            test('should normalize TAK to 1.0', () => {
                const result = normalizeAnswer('TAK');
                expect(result.value).toBe(1.0);
                expect(result.isNotKnown).toBe(false);
                expect(result.isNotApplicable).toBe(false);
            });

            test('should normalize W_TRAKCIE to 0.5', () => {
                const result = normalizeAnswer('W_TRAKCIE');
                expect(result.value).toBe(0.5);
            });

            test('should normalize NIE to 0.0', () => {
                const result = normalizeAnswer('NIE');
                expect(result.value).toBe(0.0);
            });

            test('should normalize NIE_WIEM to 0.0 with flag', () => {
                const result = normalizeAnswer('NIE_WIEM');
                expect(result.value).toBe(0.0);
                expect(result.isNotKnown).toBe(true);
            });

            test('should mark NIE_DOTYCZY as not applicable', () => {
                const result = normalizeAnswer('NIE_DOTYCZY');
                expect(result.value).toBeNull();
                expect(result.isNotApplicable).toBe(true);
            });

            test('should handle lowercase answers', () => {
                const result = normalizeAnswer('tak');
                expect(result.value).toBe(1.0);
            });

            test('should handle undefined/null answers', () => {
                const result = normalizeAnswer(undefined);
                expect(result.value).toBe(0.0);
            });
        });

        describe('calculateGap()', () => {
            test('should return 0 for value 1.0 (TAK)', () => {
                expect(calculateGap(1.0)).toBe(0);
            });

            test('should return 0.5 for value 0.5 (W_TRAKCIE)', () => {
                expect(calculateGap(0.5)).toBe(0.5);
            });

            test('should return 1.0 for value 0.0 (NIE)', () => {
                expect(calculateGap(0.0)).toBe(1.0);
            });

            test('should return null for null value', () => {
                expect(calculateGap(null)).toBeNull();
            });
        });
    });

    // ========================================================================
    // SECTION 1: Question Groupings Tests
    // ========================================================================

    describe('Question Groupings (COMMENT_QUESTION_GROUPS)', () => {

        test('EXECUTIVE_SUMMARY should use X2, X4, X9, X10 for context', () => {
            expect(COMMENT_QUESTION_GROUPS.EXECUTIVE_SUMMARY.extended).toEqual(['x2', 'x4', 'x9', 'x10']);
            expect(COMMENT_QUESTION_GROUPS.EXECUTIVE_SUMMARY.usesCore).toBe(true);
        });

        test('DATA should use X6, X10, X11', () => {
            expect(COMMENT_QUESTION_GROUPS.DATA.extended).toEqual(['x6', 'x10', 'x11']);
            expect(COMMENT_QUESTION_GROUPS.DATA.usesCore).toBe(false);
        });

        test('MARKET_READINESS should use X6, X10, X11', () => {
            expect(COMMENT_QUESTION_GROUPS.MARKET_READINESS.extended).toEqual(['x6', 'x10', 'x11']);
        });

        test('ORG_READINESS should use X1, X3, X7', () => {
            expect(COMMENT_QUESTION_GROUPS.ORG_READINESS.extended).toEqual(['x1', 'x3', 'x7']);
        });

        test('PRIORITIES should use X2, X4, X8, X12', () => {
            expect(COMMENT_QUESTION_GROUPS.PRIORITIES.extended).toEqual(['x2', 'x4', 'x8', 'x12']);
        });

        test('RISKS should use X5, X8, X9, X11 and inherit state from ES', () => {
            expect(COMMENT_QUESTION_GROUPS.RISKS.extended).toEqual(['x5', 'x8', 'x9', 'x11']);
            expect(COMMENT_QUESTION_GROUPS.RISKS.inheritsState).toBe('EXECUTIVE_SUMMARY');
        });

        test('CREDIBILITY should use X5, X6, X11, X12', () => {
            expect(COMMENT_QUESTION_GROUPS.CREDIBILITY.extended).toEqual(['x5', 'x6', 'x11', 'x12']);
        });
    });

    // ========================================================================
    // SECTION 2: Readiness Calculation Tests
    // ========================================================================

    describe('Readiness Calculation', () => {

        describe('calculateReadiness()', () => {
            test('should return 1.0 for all TAK answers', () => {
                const answers = { x1: 'TAK', x3: 'TAK', x7: 'TAK' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(1.0);
                expect(result.gap).toBe(0);
            });

            test('should return 0.0 for all NIE answers', () => {
                const answers = { x1: 'NIE', x3: 'NIE', x7: 'NIE' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(0);
                expect(result.gap).toBe(1.0);
            });

            test('should return 0.5 for all W_TRAKCIE answers', () => {
                const answers = { x1: 'W_TRAKCIE', x3: 'W_TRAKCIE', x7: 'W_TRAKCIE' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(0.5);
                expect(result.gap).toBe(0.5);
            });

            test('should calculate mixed answers correctly', () => {
                // TAK (1.0) + W_TRAKCIE (0.5) + NIE (0.0) = 1.5 / 3 = 0.5
                const answers = { x1: 'TAK', x3: 'W_TRAKCIE', x7: 'NIE' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(0.5);
            });

            test('should exclude NIE_DOTYCZY from calculation', () => {
                // TAK (1.0) + TAK (1.0) + NIE_DOTYCZY (excluded) = 2.0 / 2 = 1.0
                const answers = { x1: 'TAK', x3: 'TAK', x7: 'NIE_DOTYCZY' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(1.0);
                expect(result.applicableCount).toBe(2);
            });

            test('should track NIE_WIEM count', () => {
                const answers = { x1: 'TAK', x3: 'NIE_WIEM', x7: 'NIE' };
                const result = calculateReadiness(answers, ['x1', 'x3', 'x7']);
                expect(result.notKnownCount).toBe(1);
            });

            test('should return 0 for empty answers', () => {
                const result = calculateReadiness({}, ['x1', 'x3', 'x7']);
                expect(result.readiness).toBe(0);
            });
        });

        describe('getReadinessColorState()', () => {
            test('should return green for R >= 0.75', () => {
                expect(getReadinessColorState(0.75)).toBe('green');
                expect(getReadinessColorState(0.80)).toBe('green');
                expect(getReadinessColorState(1.0)).toBe('green');
            });

            test('should return yellow for 0.40 <= R < 0.75', () => {
                expect(getReadinessColorState(0.40)).toBe('yellow');
                expect(getReadinessColorState(0.50)).toBe('yellow');
                expect(getReadinessColorState(0.74)).toBe('yellow');
            });

            test('should return red for R < 0.40', () => {
                expect(getReadinessColorState(0)).toBe('red');
                expect(getReadinessColorState(0.20)).toBe('red');
                expect(getReadinessColorState(0.39)).toBe('red');
            });

            test('boundary values should be correct', () => {
                expect(getReadinessColorState(0.75)).toBe('green');
                expect(getReadinessColorState(0.749)).toBe('yellow');
                expect(getReadinessColorState(0.40)).toBe('yellow');
                expect(getReadinessColorState(0.399)).toBe('red');
            });
        });
    });

    // ========================================================================
    // SECTION 3: Executive Summary State Tests
    // ========================================================================

    describe('Executive Summary State', () => {

        describe('ES_SCORE_THRESHOLDS constants', () => {
            test('GREEN should be 81-100', () => {
                expect(ES_SCORE_THRESHOLDS.GREEN.min).toBe(81);
                expect(ES_SCORE_THRESHOLDS.GREEN.max).toBe(100);
            });

            test('YELLOW should be 51-80', () => {
                expect(ES_SCORE_THRESHOLDS.YELLOW.min).toBe(51);
                expect(ES_SCORE_THRESHOLDS.YELLOW.max).toBe(80);
            });

            test('ORANGE should be 31-50', () => {
                expect(ES_SCORE_THRESHOLDS.ORANGE.min).toBe(31);
                expect(ES_SCORE_THRESHOLDS.ORANGE.max).toBe(50);
            });

            test('CRITICAL should be 0-30', () => {
                expect(ES_SCORE_THRESHOLDS.CRITICAL.min).toBe(0);
                expect(ES_SCORE_THRESHOLDS.CRITICAL.max).toBe(30);
            });
        });

        describe('getExecutiveSummaryState()', () => {
            test('should return green for scores >= 81', () => {
                expect(getExecutiveSummaryState(81)).toBe('green');
                expect(getExecutiveSummaryState(90)).toBe('green');
                expect(getExecutiveSummaryState(100)).toBe('green');
            });

            test('should return yellow for scores 51-80', () => {
                expect(getExecutiveSummaryState(51)).toBe('yellow');
                expect(getExecutiveSummaryState(65)).toBe('yellow');
                expect(getExecutiveSummaryState(80)).toBe('yellow');
            });

            test('should return orange for scores 31-50', () => {
                expect(getExecutiveSummaryState(31)).toBe('orange');
                expect(getExecutiveSummaryState(40)).toBe('orange');
                expect(getExecutiveSummaryState(50)).toBe('orange');
            });

            test('should return critical for scores 0-30', () => {
                expect(getExecutiveSummaryState(0)).toBe('critical');
                expect(getExecutiveSummaryState(15)).toBe('critical');
                expect(getExecutiveSummaryState(30)).toBe('critical');
            });

            test('boundary values should be correct', () => {
                expect(getExecutiveSummaryState(81)).toBe('green');
                expect(getExecutiveSummaryState(80)).toBe('yellow');
                expect(getExecutiveSummaryState(51)).toBe('yellow');
                expect(getExecutiveSummaryState(50)).toBe('orange');
                expect(getExecutiveSummaryState(31)).toBe('orange');
                expect(getExecutiveSummaryState(30)).toBe('critical');
            });
        });
    });

    // ========================================================================
    // SECTION 4: Comment State Calculation Tests
    // ========================================================================

    describe('Comment State Calculation', () => {

        describe('calculateCommentState()', () => {

            test('EXECUTIVE_SUMMARY state should come from CORE SCORE', () => {
                const answers = { x2: 'TAK', x4: 'TAK', x9: 'TAK', x10: 'TAK' };
                const result = calculateCommentState('EXECUTIVE_SUMMARY', answers, 85);
                expect(result.state).toBe('green');
                expect(result.stateSource).toBe('CORE_SCORE');
            });

            test('EXECUTIVE_SUMMARY should be critical for low score', () => {
                const answers = { x2: 'TAK', x4: 'TAK', x9: 'TAK', x10: 'TAK' };
                const result = calculateCommentState('EXECUTIVE_SUMMARY', answers, 20);
                expect(result.state).toBe('critical');
            });

            test('DATA state should come from EXTENDED readiness', () => {
                const answers = { x6: 'TAK', x10: 'TAK', x11: 'TAK' };
                const result = calculateCommentState('DATA', answers, 50);
                expect(result.state).toBe('green');
                expect(result.stateSource).toBe('EXTENDED_READINESS');
            });

            test('DATA should be red for all NIE', () => {
                const answers = { x6: 'NIE', x10: 'NIE', x11: 'NIE' };
                const result = calculateCommentState('DATA', answers, 50);
                expect(result.state).toBe('red');
            });

            test('ORG_READINESS should use X1, X3, X7', () => {
                const answers = { x1: 'TAK', x3: 'TAK', x7: 'TAK' };
                const result = calculateCommentState('ORG_READINESS', answers, 50);
                expect(result.state).toBe('green');
                expect(result.extendedQuestions).toEqual(['x1', 'x3', 'x7']);
            });

            test('RISKS should inherit state from ES', () => {
                const answers = { x5: 'TAK', x8: 'TAK', x9: 'TAK', x11: 'TAK' };

                // High CORE score = green state (inherited)
                const result1 = calculateCommentState('RISKS', answers, 85);
                expect(result1.state).toBe('green');
                expect(result1.stateSource).toBe('INHERITED_FROM_ES');

                // Low CORE score = critical state (inherited)
                const result2 = calculateCommentState('RISKS', answers, 20);
                expect(result2.state).toBe('critical');
            });

            test('CREDIBILITY should use X5, X6, X11, X12', () => {
                const answers = { x5: 'TAK', x6: 'TAK', x11: 'TAK', x12: 'TAK' };
                const result = calculateCommentState('CREDIBILITY', answers, 50);
                expect(result.state).toBe('green');
                expect(result.readiness).toBe(1.0);
            });

            test('should throw error for unknown comment type', () => {
                expect(() => {
                    calculateCommentState('UNKNOWN', {}, 50);
                }).toThrow('Unknown comment type: UNKNOWN');
            });
        });

        describe('calculateAllCommentStates()', () => {
            test('should calculate all 7 comment states', () => {
                const answers = {
                    x1: 'TAK', x2: 'TAK', x3: 'TAK', x4: 'TAK',
                    x5: 'TAK', x6: 'TAK', x7: 'TAK', x8: 'TAK',
                    x9: 'TAK', x10: 'TAK', x11: 'TAK', x12: 'TAK'
                };
                const result = calculateAllCommentStates(answers, 85);

                expect(result.EXECUTIVE_SUMMARY).toBeDefined();
                expect(result.DATA).toBeDefined();
                expect(result.MARKET_READINESS).toBeDefined();
                expect(result.ORG_READINESS).toBeDefined();
                expect(result.PRIORITIES).toBeDefined();
                expect(result.RISKS).toBeDefined();
                expect(result.CREDIBILITY).toBeDefined();
            });

            test('all states should be green for all TAK and high score', () => {
                const answers = {
                    x1: 'TAK', x2: 'TAK', x3: 'TAK', x4: 'TAK',
                    x5: 'TAK', x6: 'TAK', x7: 'TAK', x8: 'TAK',
                    x9: 'TAK', x10: 'TAK', x11: 'TAK', x12: 'TAK'
                };
                const result = calculateAllCommentStates(answers, 85);

                expect(result.EXECUTIVE_SUMMARY.state).toBe('green');
                expect(result.DATA.state).toBe('green');
                expect(result.MARKET_READINESS.state).toBe('green');
                expect(result.ORG_READINESS.state).toBe('green');
                expect(result.RISKS.state).toBe('green');
                expect(result.CREDIBILITY.state).toBe('green');
            });
        });
    });

    // ========================================================================
    // SECTION 5: State Labels Tests
    // ========================================================================

    describe('State Labels', () => {

        describe('STATE_LABELS constants', () => {
            test('DATA labels should be correct', () => {
                expect(STATE_LABELS.DATA.green).toBe('Kompletne');
                expect(STATE_LABELS.DATA.yellow).toBe('Czesciowe');
                expect(STATE_LABELS.DATA.red).toBe('Wstepne');
            });

            test('CREDIBILITY labels should be correct', () => {
                expect(STATE_LABELS.CREDIBILITY.green).toBe('Wysoka');
                expect(STATE_LABELS.CREDIBILITY.yellow).toBe('Srednia');
                expect(STATE_LABELS.CREDIBILITY.red).toBe('Niska');
            });
        });

        describe('getStateLabel()', () => {
            test('should return correct label for DATA', () => {
                expect(getStateLabel('DATA', 'green')).toBe('Kompletne');
                expect(getStateLabel('DATA', 'yellow')).toBe('Czesciowe');
                expect(getStateLabel('DATA', 'red')).toBe('Wstepne');
            });

            test('should return state value if label not found', () => {
                expect(getStateLabel('UNKNOWN', 'green')).toBe('green');
            });
        });
    });

    // ========================================================================
    // Integration Tests
    // ========================================================================

    describe('Integration Tests', () => {

        test('realistic scenario: medium-performing company', () => {
            const answers = {
                x1: 'TAK',         // Org readiness
                x3: 'W_TRAKCIE',
                x7: 'TAK',
                x2: 'TAK',         // ES context / Priorities
                x4: 'W_TRAKCIE',
                x8: 'NIE',
                x12: 'W_TRAKCIE',
                x5: 'TAK',         // Risks / Credibility
                x6: 'TAK',         // Data / Market
                x9: 'NIE',         // ES context / Risks
                x10: 'TAK',        // Data / Market / ES
                x11: 'W_TRAKCIE'   // Data / Market / Risks / Credibility
            };

            const result = calculateAllCommentStates(answers, 65);

            // ES state comes from score 65 = yellow
            expect(result.EXECUTIVE_SUMMARY.state).toBe('yellow');

            // ORG: (1 + 0.5 + 1) / 3 = 0.833 = green
            expect(result.ORG_READINESS.readiness).toBeCloseTo(0.833, 2);
            expect(result.ORG_READINESS.state).toBe('green');

            // DATA: x6=1, x10=1, x11=0.5 = 2.5/3 = 0.833 = green
            expect(result.DATA.readiness).toBeCloseTo(0.833, 2);
            expect(result.DATA.state).toBe('green');

            // RISKS inherits from ES = yellow
            expect(result.RISKS.state).toBe('yellow');
        });

        test('realistic scenario: low-performing company', () => {
            const answers = {
                x1: 'NIE', x2: 'NIE', x3: 'NIE', x4: 'NIE',
                x5: 'NIE', x6: 'W_TRAKCIE', x7: 'NIE', x8: 'NIE',
                x9: 'NIE', x10: 'NIE', x11: 'NIE', x12: 'NIE'
            };

            const result = calculateAllCommentStates(answers, 25);

            expect(result.EXECUTIVE_SUMMARY.state).toBe('critical');
            expect(result.RISKS.state).toBe('critical'); // Inherited
            expect(result.ORG_READINESS.state).toBe('red');
            expect(result.CREDIBILITY.state).toBe('red');
        });
    });
});
