/**
 * Unit tests for CORE Scoring Module
 */

const {
    ANSWER_VALUES,
    QUESTIONS,
    MAX_POINTS,
    EXTENDED_QUESTIONS_META,
    IMPACT_TYPES,
    calcBlockPercent,
    percentToPoints,
    getInterpretation,
    toComplianceScore,
    computeScores,
    createUniformAnswers,
    getExtendedImpactType,
    getExtendedByImpactType
} = require('../../src/scoring');

describe('CORE Scoring Module', () => {

    describe('ANSWER_VALUES constants', () => {
        test('TAK should equal 5', () => {
            expect(ANSWER_VALUES.TAK).toBe(5);
        });

        test('W_TRAKCIE should equal 3', () => {
            expect(ANSWER_VALUES.W_TRAKCIE).toBe(3);
        });

        test('NIE should equal 0', () => {
            expect(ANSWER_VALUES.NIE).toBe(0);
        });

        test('NIE_WIEM should equal 0', () => {
            expect(ANSWER_VALUES.NIE_WIEM).toBe(0);
        });

        test('NIE_DOTYCZY should be null', () => {
            expect(ANSWER_VALUES.NIE_DOTYCZY).toBeNull();
        });
    });

    describe('QUESTIONS structure', () => {
        test('G (Governance) should have 9 questions', () => {
            expect(QUESTIONS.G).toHaveLength(9);
        });

        test('S (Social) should have 9 questions', () => {
            expect(QUESTIONS.S).toHaveLength(9);
        });

        test('E (Environment) should have 11 questions', () => {
            expect(QUESTIONS.E).toHaveLength(11);
        });

        test('SC (Supply Chain) should have 9 questions', () => {
            expect(QUESTIONS.SC).toHaveLength(9);
        });

        test('Total CORE questions should be 38', () => {
            const totalCore = QUESTIONS.G.length + QUESTIONS.S.length +
                             QUESTIONS.E.length + QUESTIONS.SC.length;
            expect(totalCore).toBe(38);
        });

        test('X (Extended) should have 12 questions', () => {
            expect(QUESTIONS.X).toHaveLength(12);
        });
    });

    describe('MAX_POINTS constraints', () => {
        test('E max should be 30', () => {
            expect(MAX_POINTS.E).toBe(30);
        });

        test('S max should be 25', () => {
            expect(MAX_POINTS.S).toBe(25);
        });

        test('G max should be 20', () => {
            expect(MAX_POINTS.G).toBe(20);
        });

        test('SC max should be 15', () => {
            expect(MAX_POINTS.SC).toBe(15);
        });

        test('TOTAL max should be 90', () => {
            expect(MAX_POINTS.TOTAL).toBe(90);
            expect(MAX_POINTS.E + MAX_POINTS.S + MAX_POINTS.G + MAX_POINTS.SC).toBe(90);
        });
    });

    describe('calcBlockPercent', () => {
        test('All TAK (5) should return 100%', () => {
            const answers = { q1: 5, q2: 5, q3: 5 };
            expect(calcBlockPercent(answers, ['q1', 'q2', 'q3'])).toBe(100);
        });

        test('All NIE (0) should return 0%', () => {
            const answers = { q1: 0, q2: 0, q3: 0 };
            expect(calcBlockPercent(answers, ['q1', 'q2', 'q3'])).toBe(0);
        });

        test('All W_TRAKCIE (3) should return 60%', () => {
            const answers = { q1: 3, q2: 3, q3: 3 };
            expect(calcBlockPercent(answers, ['q1', 'q2', 'q3'])).toBe(60);
        });

        test('All NIE_DOTYCZY (null) should return 0% (no valid answers)', () => {
            const answers = { q1: null, q2: null, q3: null };
            expect(calcBlockPercent(answers, ['q1', 'q2', 'q3'])).toBe(0);
        });

        test('Mixed: 1 TAK + 1 NIE should return 50%', () => {
            const answers = { q1: 5, q2: 0 };
            expect(calcBlockPercent(answers, ['q1', 'q2'])).toBe(50);
        });

        test('NIE_DOTYCZY should be excluded from calculation', () => {
            const answers = { q1: 5, q2: null };
            expect(calcBlockPercent(answers, ['q1', 'q2'])).toBe(100);
        });

        test('Missing questions should be excluded', () => {
            const answers = { q1: 5 };
            expect(calcBlockPercent(answers, ['q1', 'q2', 'q3'])).toBe(100);
        });
    });

    describe('percentToPoints', () => {
        test('100% of 30 should be 30', () => {
            expect(percentToPoints(100, 30)).toBe(30);
        });

        test('0% of 30 should be 0', () => {
            expect(percentToPoints(0, 30)).toBe(0);
        });

        test('50% of 30 should be 15', () => {
            expect(percentToPoints(50, 30)).toBe(15);
        });

        test('60% of 25 should be 15', () => {
            expect(percentToPoints(60, 25)).toBe(15);
        });

        test('should round correctly', () => {
            expect(percentToPoints(33.33, 30)).toBe(10);
        });
    });

    describe('getInterpretation', () => {
        // NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
        test('0-30% should be "Krytyczny"', () => {
            expect(getInterpretation(0)).toBe('Krytyczny');
            expect(getInterpretation(15)).toBe('Krytyczny');
            expect(getInterpretation(30)).toBe('Krytyczny');
        });

        test('31-50% should be "Podwyższone ryzyko"', () => {
            expect(getInterpretation(31)).toBe('Podwyższone ryzyko');
            expect(getInterpretation(40)).toBe('Podwyższone ryzyko');
            expect(getInterpretation(50)).toBe('Podwyższone ryzyko');
        });

        test('51-80% should be "Umiarkowany"', () => {
            expect(getInterpretation(51)).toBe('Umiarkowany');
            expect(getInterpretation(65)).toBe('Umiarkowany');
            expect(getInterpretation(80)).toBe('Umiarkowany');
        });

        test('81-100% should be "Dobry"', () => {
            expect(getInterpretation(81)).toBe('Dobry');
            expect(getInterpretation(90)).toBe('Dobry');
            expect(getInterpretation(100)).toBe('Dobry');
        });
    });

    describe('toComplianceScore', () => {
        test('TAK (5) should return 2', () => {
            expect(toComplianceScore(5)).toBe(2);
        });

        test('W_TRAKCIE (3) should return 1', () => {
            expect(toComplianceScore(3)).toBe(1);
        });

        test('NIE (0) should return 0', () => {
            expect(toComplianceScore(0)).toBe(0);
        });

        test('null should return 0', () => {
            expect(toComplianceScore(null)).toBe(0);
        });

        test('undefined should return 0', () => {
            expect(toComplianceScore(undefined)).toBe(0);
        });
    });

    describe('computeScores - All TAK answers', () => {
        let result;

        beforeAll(() => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK);
            result = computeScores(answers);
        });

        test('total should be 90 points (maximum)', () => {
            expect(result.total).toBe(90);
        });

        test('E should be 30 points (maximum)', () => {
            expect(result.e).toBe(30);
        });

        test('S should be 25 points (maximum)', () => {
            expect(result.s).toBe(25);
        });

        test('G should be 20 points (maximum)', () => {
            expect(result.g).toBe(20);
        });

        test('SC (sup) should be 15 points (maximum)', () => {
            expect(result.sup).toBe(15);
        });

        test('percent should be 100%', () => {
            expect(result.percent).toBe(100);
        });

        test('all pillar percentages should be 100%', () => {
            expect(result.e_percent).toBe(100);
            expect(result.s_percent).toBe(100);
            expect(result.g_percent).toBe(100);
            expect(result.sc_percent).toBe(100);
        });

        test('interpretation should be "Dobry" (100% = top tier)', () => {
            expect(result.interpret).toBe('Dobry');
        });
    });

    describe('computeScores - All NIE answers', () => {
        let result;

        beforeAll(() => {
            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            result = computeScores(answers);
        });

        test('total should be 0 points', () => {
            expect(result.total).toBe(0);
        });

        test('percent should be 0%', () => {
            expect(result.percent).toBe(0);
        });

        test('interpretation should be "Krytyczny" (0% = critical)', () => {
            expect(result.interpret).toBe('Krytyczny');
        });
    });

    describe('computeScores - Weights by profile', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK);

        test('default profile should have equal weights', () => {
            const result = computeScores(answers, {});
            expect(result.weights).toEqual({ g: 25, s: 25, e: 25, sc: 25 });
        });

        test('MSP profile should have specific weights', () => {
            const result = computeScores(answers, { profile: 'MSP' });
            expect(result.weights).toEqual({ g: 20, s: 30, e: 30, sc: 20 });
        });

        test('SUPPLIER profile should have specific weights', () => {
            const result = computeScores(answers, { profile: 'SUPPLIER' });
            expect(result.weights).toEqual({ g: 15, s: 25, e: 25, sc: 35 });
        });

        test('LARGE profile should have specific weights', () => {
            const result = computeScores(answers, { profile: 'LARGE' });
            expect(result.weights).toEqual({ g: 30, s: 25, e: 30, sc: 15 });
        });
    });

    describe('EXTENDED questions isolation', () => {
        test('EXTENDED questions should be calculated separately', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
            QUESTIONS.X.forEach(q => { answers[q] = ANSWER_VALUES.TAK; });

            const result = computeScores(answers);

            expect(result.extended_percent).toBe(100);
        });

        test('EXTENDED should not affect CORE total score', () => {
            const coreOnly = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
            const withExtended = { ...coreOnly };
            QUESTIONS.X.forEach(q => { withExtended[q] = ANSWER_VALUES.NIE; });

            const coreResult = computeScores(coreOnly);
            const extResult = computeScores(withExtended);

            expect(extResult.total).toBe(coreResult.total);
            expect(extResult.percent).toBe(coreResult.percent);
            expect(extResult.extended_percent).toBe(0);
        });
    });

    describe('EXTENDED_QUESTIONS_META', () => {
        test('should have 12 questions defined', () => {
            expect(Object.keys(EXTENDED_QUESTIONS_META)).toHaveLength(12);
        });

        test('each question should have id, impact_type, pillar, description', () => {
            Object.values(EXTENDED_QUESTIONS_META).forEach(meta => {
                expect(meta).toHaveProperty('id');
                expect(meta).toHaveProperty('impact_type');
                expect(meta).toHaveProperty('pillar');
                expect(meta).toHaveProperty('description');
            });
        });

        test('impact_types should be valid', () => {
            Object.values(EXTENDED_QUESTIONS_META).forEach(meta => {
                expect(IMPACT_TYPES).toContain(meta.impact_type);
            });
        });
    });

    describe('getExtendedImpactType', () => {
        test('should return correct impact_type for x1', () => {
            expect(getExtendedImpactType('x1')).toBe('context');
        });

        test('should return correct impact_type for x3', () => {
            expect(getExtendedImpactType('x3')).toBe('task');
        });

        test('should return correct impact_type for x4', () => {
            expect(getExtendedImpactType('x4')).toBe('evidence');
        });

        test('should be case-insensitive', () => {
            expect(getExtendedImpactType('X1')).toBe('context');
        });

        test('should return null for unknown question', () => {
            expect(getExtendedImpactType('x99')).toBeNull();
        });
    });

    describe('getExtendedByImpactType', () => {
        test('should return context questions', () => {
            const contextQuestions = getExtendedByImpactType('context');
            expect(contextQuestions).toContain('x1');
            expect(contextQuestions).toContain('x2');
            expect(contextQuestions).toContain('x5');
        });

        test('should return task questions', () => {
            const taskQuestions = getExtendedByImpactType('task');
            expect(taskQuestions).toContain('x3');
            expect(taskQuestions).toContain('x6');
        });

        test('should return evidence questions', () => {
            const evidenceQuestions = getExtendedByImpactType('evidence');
            expect(evidenceQuestions).toContain('x4');
            expect(evidenceQuestions).toContain('x7');
        });

        test('should return empty array for none type', () => {
            const noneQuestions = getExtendedByImpactType('none');
            expect(noneQuestions).toHaveLength(0);
        });
    });
});
