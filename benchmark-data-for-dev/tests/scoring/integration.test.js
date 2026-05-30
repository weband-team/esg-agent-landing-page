/**
 * Integration Tests for ESG Scoring System
 *
 * Test cases from "zadania sprawdzające.pdf":
 * - TC-CORE-001 to TC-CORE-004: CORE scoring tests
 * - TC-EXT-001 to TC-EXT-004: EXTENDED questions tests
 * - TC-X-001 to TC-X-003: Cross-module integration tests
 *
 * Minimum CI/CD gating tests (P0):
 * 1. TC-CORE-001 - EXTENDED doesn't affect CORE
 * 2. TC-EXT-001 - Every EXTENDED has impact_type
 * 3. TC-EXT-002 - EXTENDED-context changes priorities, not CORE
 * 4. TC-EXT-004 - EXTENDED-evidence only affects flag, not numbers
 * 5. TC-X-002 - Threshold boundaries 20/21/45/46
 */

const {
    ANSWER_VALUES,
    QUESTIONS,
    SCORING_VERSION,
    ENGINE_VERSION,
    EXTENDED_QUESTIONS_META,
    IMPACT_TYPES,
    computeScores,
    createUniformAnswers,
    getExtendedImpactType,
    getExtendedByImpactType,
    computeRelevance,
    computeReadinessFlag,
    getExtendedTaskGaps,
    bucketize,
    simulateWhatIf
} = require('../../src/scoring');

// ============================================================================
// SECTION A: CORE Tests (TC-CORE-001 to TC-CORE-004)
// ============================================================================

describe('TC-CORE-001: CORE score depends only on CORE (EXTENDED cannot change it)', () => {
    /**
     * Priority: P0 (blocking release)
     * Type: Integration
     * Goal: Ensure base score (E/S/G/SC + overall) doesn't depend on EXTENDED
     */

    const coreAnswers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);

    test('GIVEN same CORE answers, WHEN EXTENDED changes, THEN CORE score is identical', () => {
        // Variant A: all EXTENDED = TAK
        const variantA = { ...coreAnswers };
        QUESTIONS.X.forEach(q => { variantA[q] = ANSWER_VALUES.TAK; });

        // Variant B: all EXTENDED = NIE
        const variantB = { ...coreAnswers };
        QUESTIONS.X.forEach(q => { variantB[q] = ANSWER_VALUES.NIE; });

        // Variant C: mixed EXTENDED
        const variantC = { ...coreAnswers };
        QUESTIONS.X.forEach((q, i) => {
            variantC[q] = i % 2 === 0 ? ANSWER_VALUES.TAK : ANSWER_VALUES.NIE;
        });

        // Variant D: all EXTENDED = null (NIE_DOTYCZY)
        const variantD = { ...coreAnswers };
        QUESTIONS.X.forEach(q => { variantD[q] = ANSWER_VALUES.NIE_DOTYCZY; });

        const resultA = computeScores(variantA);
        const resultB = computeScores(variantB);
        const resultC = computeScores(variantC);
        const resultD = computeScores(variantD);

        // THEN: All CORE results must be identical
        expect(resultA.total).toBe(resultB.total);
        expect(resultA.total).toBe(resultC.total);
        expect(resultA.total).toBe(resultD.total);

        expect(resultA.e_percent).toBe(resultB.e_percent);
        expect(resultA.e_percent).toBe(resultC.e_percent);
        expect(resultA.e_percent).toBe(resultD.e_percent);

        expect(resultA.s_percent).toBe(resultB.s_percent);
        expect(resultA.g_percent).toBe(resultB.g_percent);
        expect(resultA.sc_percent).toBe(resultB.sc_percent);

        expect(resultA.percent).toBe(resultB.percent);
        expect(resultA.interpret).toBe(resultB.interpret);
    });

    test('EXTENDED percent varies while CORE remains constant', () => {
        const variantA = { ...coreAnswers };
        QUESTIONS.X.forEach(q => { variantA[q] = ANSWER_VALUES.TAK; });

        const variantB = { ...coreAnswers };
        QUESTIONS.X.forEach(q => { variantB[q] = ANSWER_VALUES.NIE; });

        const resultA = computeScores(variantA);
        const resultB = computeScores(variantB);

        // EXTENDED percent should differ
        expect(resultA.extended_percent).toBe(100);
        expect(resultB.extended_percent).toBe(0);

        // But CORE remains identical
        expect(resultA.total).toBe(resultB.total);
    });
});

describe('TC-CORE-002: Missing CORE answers cannot pretend to be "0" or "NIE"', () => {
    /**
     * Priority: P0
     * Type: Integration
     * Goal: Missing data must be handled explicitly, not silently converted to values
     */

    test('GIVEN missing CORE answers, WHEN computing scores, THEN they are excluded not treated as 0', () => {
        // Complete answers: all TAK
        const complete = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);

        // Incomplete: remove some answers
        const incomplete = { ...complete };
        delete incomplete.e1;
        delete incomplete.g1;
        delete incomplete.s1;

        const completeResult = computeScores(complete);
        const incompleteResult = computeScores(incomplete);

        // If missing was treated as 0, the score would be lower
        // But since missing is excluded, percentage should remain 100%
        // (calculated only from answered questions)
        expect(incompleteResult.e_percent).toBe(100); // e1 excluded, rest are TAK
        expect(incompleteResult.g_percent).toBe(100); // g1 excluded, rest are TAK
        expect(incompleteResult.s_percent).toBe(100); // s1 excluded, rest are TAK
    });

    test('NIE_DOTYCZY (null) answers are excluded from calculation', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
        answers.e1 = ANSWER_VALUES.NIE_DOTYCZY; // null

        const result = computeScores(answers);

        // e1 should be excluded, so E percent should still be 100%
        expect(result.e_percent).toBe(100);
    });

    test('undefined answers are excluded, not treated as NIE', () => {
        const answers = { g1: ANSWER_VALUES.TAK }; // Only one answer

        const result = computeScores(answers);

        // Only g1 is answered with TAK, so g_percent should be 100%
        expect(result.g_percent).toBe(100);

        // Other areas have no answers, should be 0% (fallback for empty)
        expect(result.e_percent).toBe(0);
    });
});

describe('TC-CORE-003: Result stability - same data = same result', () => {
    /**
     * Priority: P1
     * Type: Integration
     * Goal: Results must not "float" between runs; scoring_version must be included
     */

    test('GIVEN same answers, WHEN computing twice, THEN results are identical', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);

        const result1 = computeScores(answers);
        const result2 = computeScores(answers);

        expect(result1.total).toBe(result2.total);
        expect(result1.percent).toBe(result2.percent);
        expect(result1.e_percent).toBe(result2.e_percent);
        expect(result1.s_percent).toBe(result2.s_percent);
        expect(result1.g_percent).toBe(result2.g_percent);
        expect(result1.sc_percent).toBe(result2.sc_percent);
        expect(result1.interpret).toBe(result2.interpret);
    });

    test('scoring_version is included in output', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
        const result = computeScores(answers);

        expect(result.scoring_version).toBeDefined();
        expect(result.scoring_version).toBe(SCORING_VERSION);
    });
});

describe('TC-CORE-004: Every CORE question has area assignment', () => {
    /**
     * Priority: P1
     * Type: Configuration/Smoke
     * Goal: No "homeless" CORE questions
     */

    test('all CORE questions are assigned to areas', () => {
        const allCoreQuestions = [
            ...QUESTIONS.G,
            ...QUESTIONS.S,
            ...QUESTIONS.E,
            ...QUESTIONS.SC
        ];

        // Each question must exist in exactly one area
        expect(QUESTIONS.G.length).toBe(9);
        expect(QUESTIONS.S.length).toBe(9);
        expect(QUESTIONS.E.length).toBe(11);
        expect(QUESTIONS.SC.length).toBe(9);

        // Total CORE questions should be 38
        expect(allCoreQuestions.length).toBe(38);

        // No duplicates
        const uniqueQuestions = new Set(allCoreQuestions);
        expect(uniqueQuestions.size).toBe(38);
    });

    test('QUESTIONS structure has all required areas', () => {
        expect(QUESTIONS.G).toBeDefined();
        expect(QUESTIONS.S).toBeDefined();
        expect(QUESTIONS.E).toBeDefined();
        expect(QUESTIONS.SC).toBeDefined();
        expect(QUESTIONS.X).toBeDefined(); // EXTENDED
    });
});

// ============================================================================
// SECTION B: EXTENDED Tests (TC-EXT-001 to TC-EXT-004)
// ============================================================================

describe('TC-EXT-001: Every EXTENDED question has defined impact_type', () => {
    /**
     * Priority: P0
     * Type: Configuration
     * Goal: Zero guessing - each EXTENDED must have a predetermined role
     */

    test('all EXTENDED questions have impact_type in EXTENDED_QUESTIONS_META', () => {
        QUESTIONS.X.forEach(qId => {
            const meta = EXTENDED_QUESTIONS_META[qId];
            expect(meta).toBeDefined();
            expect(meta.impact_type).toBeDefined();
            expect(IMPACT_TYPES).toContain(meta.impact_type);
        });
    });

    test('no EXTENDED question has null or undefined impact_type', () => {
        Object.values(EXTENDED_QUESTIONS_META).forEach(meta => {
            expect(meta.impact_type).not.toBeNull();
            expect(meta.impact_type).not.toBeUndefined();
            expect(meta.impact_type).not.toBe('');
        });
    });

    test('getExtendedImpactType returns correct values', () => {
        // Test known values
        expect(getExtendedImpactType('x1')).toBe('context');
        expect(getExtendedImpactType('x3')).toBe('task');
        expect(getExtendedImpactType('x4')).toBe('evidence');

        // Unknown returns null
        expect(getExtendedImpactType('unknown')).toBeNull();
    });
});

describe('TC-EXT-002: EXTENDED (context) changes priorities but NOT CORE score', () => {
    /**
     * Priority: P0
     * Type: Integration
     * Goal: Context affects urgency, not base assessment
     */

    test('GIVEN fixed CORE, WHEN R/C context changes, THEN CORE score unchanged but priorities change', () => {
        const coreAnswers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(coreAnswers);

        // Low pressure context
        const lowPressure = computeRelevance(coreAnswers, coreScores, {
            industry: 'construction',
            R: 0,
            C: 0
        });

        // High pressure context
        const highPressure = computeRelevance(coreAnswers, coreScores, {
            industry: 'construction',
            R: 20,
            C: 15
        });

        // CORE scores should remain identical (they're inputs, not computed here)
        // But MS and ERRS should differ
        expect(highPressure.ms.E).toBeGreaterThan(lowPressure.ms.E);
        expect(highPressure.ms.S).toBeGreaterThan(lowPressure.ms.S);
        expect(highPressure.ms.G).toBeGreaterThan(lowPressure.ms.G);
        expect(highPressure.ms.SC).toBeGreaterThan(lowPressure.ms.SC);
    });

    test('computeScores output is same regardless of context parameter', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);

        // Different contexts should not affect computeScores
        const result1 = computeScores(answers, { industry: 'construction' });
        const result2 = computeScores(answers, { industry: 'finance' });

        // CORE results identical (context only affects weights, not base percentages)
        expect(result1.e_percent).toBe(result2.e_percent);
        expect(result1.s_percent).toBe(result2.s_percent);
        expect(result1.g_percent).toBe(result2.g_percent);
        expect(result1.sc_percent).toBe(result2.sc_percent);
    });
});

describe('TC-EXT-003: EXTENDED (task) adds actions to list and can change TOP3', () => {
    /**
     * Priority: P1
     * Type: Integration
     * Goal: EXTENDED-task questions feed the action list
     */

    test('EXTENDED-task gaps are computed separately', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);

        // Set EXTENDED-task questions to NIE (gaps)
        const taskQuestions = getExtendedByImpactType('task');
        taskQuestions.forEach(q => { answers[q] = ANSWER_VALUES.NIE; });

        const ms = { E: 50, S: 50, G: 50, SC: 50 };
        const extendedGaps = getExtendedTaskGaps(answers, ms);

        expect(extendedGaps.length).toBe(taskQuestions.length);
        extendedGaps.forEach(task => {
            expect(task.isExtended).toBe(true);
            expect(task.impactType).toBe('task');
            expect(task.gap).toBe(100); // NIE = 100% gap
        });
    });

    test('EXTENDED-task questions appear in allTasks when context.includeExtendedTasks=true', () => {
        const coreAnswers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(coreAnswers);

        // All CORE = TAK (no gaps), but EXTENDED-task = NIE
        const answers = { ...coreAnswers };
        const taskQuestions = getExtendedByImpactType('task');
        taskQuestions.forEach(q => { answers[q] = ANSWER_VALUES.NIE; });

        const result = computeRelevance(answers, coreScores, {
            industry: 'construction',
            R: 10,
            C: 5
        });

        // extendedTaskGaps should contain the EXTENDED-task gaps
        expect(result.extendedTaskGaps.length).toBe(taskQuestions.length);

        // All tasks should include EXTENDED-task questions
        const allTaskIds = [
            ...result.plan30.map(t => t.questionId),
            ...result.plan90.map(t => t.questionId),
            ...result.plan180.map(t => t.questionId)
        ];

        taskQuestions.forEach(q => {
            expect(allTaskIds).toContain(q);
        });
    });
});

describe('TC-EXT-004: EXTENDED (evidence) affects ONLY flag/message, NOT numbers', () => {
    /**
     * Priority: P0
     * Type: Integration
     * Goal: Avoid hidden multipliers that break comparability
     */

    test('readiness flag changes based on EXTENDED-evidence, but numbers stay same', () => {
        const coreAnswers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(coreAnswers);

        // Variant A: all evidence = TAK (complete)
        const answersComplete = { ...coreAnswers };
        const evidenceQuestions = getExtendedByImpactType('evidence');
        evidenceQuestions.forEach(q => { answersComplete[q] = ANSWER_VALUES.TAK; });

        // Variant B: all evidence = NIE (incomplete)
        const answersIncomplete = { ...coreAnswers };
        evidenceQuestions.forEach(q => { answersIncomplete[q] = ANSWER_VALUES.NIE; });

        const resultComplete = computeRelevance(answersComplete, coreScores, {
            industry: 'construction',
            R: 10,
            C: 5
        });

        const resultIncomplete = computeRelevance(answersIncomplete, coreScores, {
            industry: 'construction',
            R: 10,
            C: 5
        });

        // Readiness flag should differ
        expect(resultComplete.readiness.flag).toBe('confirmed');
        expect(resultIncomplete.readiness.flag).toBe('preliminary');

        // BUT all numerical values should be identical
        expect(resultComplete.weightedScore).toBe(resultIncomplete.weightedScore);
        expect(resultComplete.ms.E).toBe(resultIncomplete.ms.E);
        expect(resultComplete.ms.S).toBe(resultIncomplete.ms.S);
        expect(resultComplete.errs.E).toBe(resultIncomplete.errs.E);
        expect(resultComplete.errs.S).toBe(resultIncomplete.errs.S);
    });

    test('computeReadinessFlag returns correct structure', () => {
        const answers = {};
        const evidenceQuestions = getExtendedByImpactType('evidence');

        // All TAK
        evidenceQuestions.forEach(q => { answers[q] = ANSWER_VALUES.TAK; });
        const readinessComplete = computeReadinessFlag(answers);

        expect(readinessComplete.flag).toBe('confirmed');
        expect(readinessComplete.evidenceCount).toBe(evidenceQuestions.length);
        expect(readinessComplete.evidenceComplete).toBe(evidenceQuestions.length);

        // Some NIE
        answers[evidenceQuestions[0]] = ANSWER_VALUES.NIE;
        const readinessPartial = computeReadinessFlag(answers);

        expect(readinessPartial.flag).toBe('preliminary');
        expect(readinessPartial.evidenceComplete).toBe(evidenceQuestions.length - 1);
    });
});

// ============================================================================
// SECTION C: Cross-Module Tests (TC-X-001 to TC-X-003)
// ============================================================================

describe('TC-X-001: TOP3 always selected from gaps only (never from "done" items)', () => {
    /**
     * Priority: P0
     * Type: Integration
     * Goal: TOP3 shows most urgent gaps, not best scores
     */

    test('TOP3 only contains items with gap > 0', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
        // Create some gaps
        answers.e1 = ANSWER_VALUES.NIE;
        answers.g1 = ANSWER_VALUES.NIE;
        answers.s1 = ANSWER_VALUES.W_TRAKCIE;

        const coreScores = computeScores(answers);
        const result = computeRelevance(answers, coreScores, {
            industry: 'construction',
            R: 10,
            C: 5
        });

        // TOP3 should only have gaps
        result.top3.forEach(task => {
            expect(task.gap).toBeGreaterThan(0);
        });

        // TOP3 should be sorted by taskERRS descending
        for (let i = 1; i < result.top3.length; i++) {
            expect(result.top3[i - 1].taskERRS).toBeGreaterThanOrEqual(result.top3[i].taskERRS);
        }
    });

    test('TOP3 is empty when all answers are TAK', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.TAK, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(answers);
        const result = computeRelevance(answers, coreScores, {});

        expect(result.top3.length).toBe(0);
    });

    test('TOP3 never contains completed items', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.NIE, ['G', 'S', 'E', 'SC']);
        // Mark some as complete
        answers.e1 = ANSWER_VALUES.TAK;
        answers.g1 = ANSWER_VALUES.TAK;

        const coreScores = computeScores(answers);
        const result = computeRelevance(answers, coreScores, { industry: 'construction' });

        // e1 and g1 should NOT be in TOP3
        const top3Ids = result.top3.map(t => t.questionId);
        expect(top3Ids).not.toContain('e1');
        expect(top3Ids).not.toContain('g1');
    });
});

describe('TC-X-002: Thresholds 30/90/180 work identically at boundaries', () => {
    /**
     * Priority: P0
     * Type: Integration
     * Goal: No discrepancies between UI/API/report on boundary values
     */

    test('exact boundary values: 20→180, 21→90, 45→90, 46→30', () => {
        expect(bucketize(20)).toBe(180);
        expect(bucketize(21)).toBe(90);
        expect(bucketize(45)).toBe(90);
        expect(bucketize(46)).toBe(30);
    });

    test('values below and above boundaries', () => {
        // Below 20
        expect(bucketize(0)).toBe(180);
        expect(bucketize(19)).toBe(180);

        // Between 21 and 45
        expect(bucketize(30)).toBe(90);

        // Above 46
        expect(bucketize(50)).toBe(30);
        expect(bucketize(100)).toBe(30);
    });

    test('boundary consistency in timeline grouping', () => {
        // Create data that produces exact boundary values
        // Task_ERRS = Gap * (MS / 100)
        // For Gap=100 and MS=20: Task_ERRS = 20 → 180 days
        // For Gap=100 and MS=21: Task_ERRS = 21 → 90 days
        // For Gap=100 and MS=46: Task_ERRS = 46 → 30 days

        const answers = createUniformAnswers(ANSWER_VALUES.NIE, ['G']); // Gap=100 for G
        QUESTIONS.S.forEach(q => { answers[q] = ANSWER_VALUES.TAK; });
        QUESTIONS.E.forEach(q => { answers[q] = ANSWER_VALUES.TAK; });
        QUESTIONS.SC.forEach(q => { answers[q] = ANSWER_VALUES.TAK; });

        const coreScores = computeScores(answers);

        // With MS_G = 20, all G tasks should be in plan180
        const result20 = computeRelevance(answers, coreScores, {
            industry: 'services_other', // Low G base
            R: 0,
            C: 0
        });

        // All G tasks with Task_ERRS ≤ 20 should be in plan180
        const gTasksIn180 = result20.plan180.filter(t => t.pillar === 'G');
        expect(gTasksIn180.length).toBeGreaterThan(0);
    });
});

describe('TC-X-003: Simulation (what-if) without changes gives identical result as report', () => {
    /**
     * Priority: P1
     * Type: Integration
     * Goal: Simulation uses same rules as report
     */

    test('simulation with same context returns identical results', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(answers);
        const context = { industry: 'construction', R: 10, C: 5 };

        // Generate report
        const report = computeRelevance(answers, coreScores, context);

        // Run simulation with no changes
        const simulation = simulateWhatIf(answers, coreScores, context, { R: 10, C: 5 });

        // Results should be identical
        expect(simulation.original.weightedScore).toBe(report.weightedScore);
        expect(simulation.simulated.weightedScore).toBe(report.weightedScore);
        expect(simulation.diff.weightedScore).toBe(0);

        // MS should be identical
        expect(simulation.original.ms.E).toBe(report.ms.E);
        expect(simulation.original.ms.S).toBe(report.ms.S);
        expect(simulation.original.ms.G).toBe(report.ms.G);
        expect(simulation.original.ms.SC).toBe(report.ms.SC);
    });

    test('simulation uses same functions as computeRelevance', () => {
        const answers = createUniformAnswers(ANSWER_VALUES.NIE, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(answers);
        const context = { industry: 'finance', R: 0, C: 0 };

        const report = computeRelevance(answers, coreScores, context);
        const simulation = simulateWhatIf(answers, coreScores, context, { R: 20 });

        // Verify simulation.original matches report
        expect(simulation.original.errs.E).toBeCloseTo(report.errs.E, 5);
        expect(simulation.original.errs.S).toBeCloseTo(report.errs.S, 5);
        expect(simulation.original.errs.G).toBeCloseTo(report.errs.G, 5);
        expect(simulation.original.errs.SC).toBeCloseTo(report.errs.SC, 5);

        // Verify diff is calculated correctly
        expect(simulation.diff.R).toBe(20);
        expect(simulation.diff.ms.E).toBeGreaterThan(0);
    });
});

// ============================================================================
// Additional regression tests
// ============================================================================

describe('Regression: Same inputs must produce identical outputs everywhere', () => {
    test('deterministic output for given B, R, C, Score', () => {
        const testCases = [
            { industry: 'construction', R: 0, C: 0 },
            { industry: 'finance', R: 20, C: 15 },
            { industry: 'it_software', R: 10, C: 5 },
        ];

        const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE, ['G', 'S', 'E', 'SC']);
        const coreScores = computeScores(answers);

        testCases.forEach(context => {
            const result1 = computeRelevance(answers, coreScores, context);
            const result2 = computeRelevance(answers, coreScores, context);

            expect(result1.weightedScore).toBe(result2.weightedScore);
            expect(result1.ms).toEqual(result2.ms);
            expect(result1.errs).toEqual(result2.errs);
            expect(result1.top3.length).toBe(result2.top3.length);
        });
    });
});
