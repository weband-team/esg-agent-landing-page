/**
 * Unit tests for ROI Proof Module (Krok 4)
 */

const {
    ANSWER_VALUES,
    setFeatureFlag,
    ROI_PROOF_VERSION,
    BUSINESS_NARRATIVES,
    selectTop2,
    getBusinessNarrative,
    generateROIProof,
    createUniformAnswers
} = require('../../src/scoring');

describe('ROI Proof Module (Krok 4)', () => {

    beforeEach(() => {
        setFeatureFlag('industry_lookup_enabled', false);
        setFeatureFlag('roi_proof_enabled', false);
        setFeatureFlag('whatif_and_exports_enabled', false);
    });

    describe('BUSINESS_NARRATIVES', () => {
        test('should have narratives for all pillars', () => {
            ['E', 'S', 'G', 'SC'].forEach(pillar => {
                expect(BUSINESS_NARRATIVES[pillar]).toBeDefined();
                expect(BUSINESS_NARRATIVES[pillar].risk).toBeDefined();
                expect(BUSINESS_NARRATIVES[pillar].opportunity).toBeDefined();
            });
        });

        test('E narratives should mention environmental topics', () => {
            expect(BUSINESS_NARRATIVES.E.risk).toContain('środowisk');
            expect(BUSINESS_NARRATIVES.E.opportunity).toContain('środowisk');
        });

        test('G narratives should mention governance topics', () => {
            expect(BUSINESS_NARRATIVES.G.risk).toContain('zarządzanie');
        });
    });

    describe('selectTop2', () => {
        test('should select top 2 tasks by Task_ERRS', () => {
            const answers = {
                g1: 0, g2: 0, g3: 5, g4: 5, g5: 5, g6: 5, g7: 5, g8: 5, g9: 5,
                s1: 5, s2: 5, s3: 5, s4: 5, s5: 5, s6: 5, s7: 5, s8: 5, s9: 5,
                e1: 5, e2: 5, e3: 5, e4: 5, e4a: 5, e5: 5, e5a: 5, e6: 5, e7: 5, e8: 5, e9: 5,
                sc1: 5, sc2: 5, sc3: 5, sc4: 5, sc5: 5, sc6: 5, sc7: 5, sc8: 5, sc9: 5
            };
            const ms = { E: 50, S: 50, G: 80, SC: 50 };

            const top2 = selectTop2(answers, ms);

            expect(top2.length).toBe(2);
            // g1 and g2 have highest ERRS (gap=100, ms=80)
            expect(top2[0].questionId).toBe('g1');
            expect(top2[1].questionId).toBe('g2');
        });

        test('should return empty array when all answers are TAK', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK);
            const ms = { E: 50, S: 50, G: 50, SC: 50 };

            const top2 = selectTop2(answers, ms);
            expect(top2.length).toBe(0);
        });

        test('should return 1 task if only 1 has gap', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK);
            answers.e1 = 0; // Only one NIE
            const ms = { E: 50, S: 50, G: 50, SC: 50 };

            const top2 = selectTop2(answers, ms);
            expect(top2.length).toBe(1);
            expect(top2[0].questionId).toBe('e1');
        });
    });

    describe('getBusinessNarrative', () => {
        test('should return risk narrative', () => {
            const narrative = getBusinessNarrative('E', 'risk');
            expect(narrative).toBe(BUSINESS_NARRATIVES.E.risk);
        });

        test('should return opportunity narrative', () => {
            const narrative = getBusinessNarrative('G', 'opportunity');
            expect(narrative).toBe(BUSINESS_NARRATIVES.G.opportunity);
        });

        test('should return empty string for unknown pillar', () => {
            const narrative = getBusinessNarrative('X', 'risk');
            expect(narrative).toBe('');
        });

        test('should default to risk if type not specified', () => {
            const narrative = getBusinessNarrative('S');
            expect(narrative).toBe(BUSINESS_NARRATIVES.S.risk);
        });
    });

    describe('generateROIProof', () => {
        test('should return disabled message when flag is off', () => {
            setFeatureFlag('roi_proof_enabled', false);
            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            const coreScores = { e_percent: 0, s_percent: 0, g_percent: 0, sc_percent: 0 };

            const result = generateROIProof(answers, coreScores, {});

            expect(result.enabled).toBe(false);
            expect(result.message).toBeDefined();
        });

        test('should generate full report when flag is on', () => {
            setFeatureFlag('roi_proof_enabled', true);
            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            const coreScores = { e_percent: 0, s_percent: 0, g_percent: 0, sc_percent: 0 };

            const result = generateROIProof(answers, coreScores, { industry: 'finance' });

            expect(result.enabled).toBe(true);
            expect(result.version).toBe(ROI_PROOF_VERSION);
            expect(result.executiveSummary).toBeDefined();
            expect(result.top2).toBeDefined();
            expect(result.top2.length).toBeLessThanOrEqual(2);
            expect(result.quickWins).toBeDefined();
            expect(result.strategicTasks).toBeDefined();
            expect(result.materialityComments).toBeDefined();
        });

        test('TOP2 tasks should have business narratives', () => {
            setFeatureFlag('roi_proof_enabled', true);
            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            const coreScores = { e_percent: 0, s_percent: 0, g_percent: 0, sc_percent: 0 };

            const result = generateROIProof(answers, coreScores, {});

            if (result.top2.length > 0) {
                expect(result.top2[0].riskNarrative).toBeDefined();
                expect(result.top2[0].opportunityNarrative).toBeDefined();
                expect(result.top2[0].timelineLabel).toBeDefined();
            }
        });

        test('executiveSummary should contain key metrics', () => {
            setFeatureFlag('roi_proof_enabled', true);
            const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE);
            const coreScores = { e_percent: 60, s_percent: 60, g_percent: 60, sc_percent: 60 };

            const result = generateROIProof(answers, coreScores, { industry: 'it_software' });

            expect(result.executiveSummary.weightedScore).toBeDefined();
            expect(result.executiveSummary.weightedScoreComment).toBeDefined();
            expect(result.executiveSummary.criticalTasksCount).toBeDefined();
            expect(result.executiveSummary.strategicTasksCount).toBeDefined();
        });

        test('should use industry lookup when enabled', () => {
            setFeatureFlag('roi_proof_enabled', true);
            setFeatureFlag('industry_lookup_enabled', true);

            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            const coreScores = { e_percent: 0, s_percent: 0, g_percent: 0, sc_percent: 0 };

            const result = generateROIProof(answers, coreScores, { industry: 'construction', R: 10, C: 5 });

            // Should work without errors
            expect(result.enabled).toBe(true);
            expect(result.top2).toBeDefined();
        });
    });
});
