/**
 * Unit tests for Relevance Engine Module
 */

const {
    ANSWER_VALUES,
    QUESTIONS,
    ENGINE_VERSION,
    INDUSTRY_B,
    REGULATION_LEVELS,
    CONTRACT_PRESSURE,
    TIMELINE_THRESHOLDS,
    MS_THRESHOLDS,
    WEIGHTED_SCORE_THRESHOLDS,
    computeMS,
    computeAllMS,
    computeERRS,
    computeAllERRS,
    computeWeightedScore,
    computeTaskGap,
    computeTaskERRS,
    getPillarForQuestion,
    selectTop3,
    bucketize,
    getTimelineLabel,
    getMSComment,
    getWeightedScoreComment,
    computeRelevance,
    simulateWhatIf,
    createUniformAnswers
} = require('../../src/scoring');

describe('Relevance Engine Module', () => {

    describe('Constants', () => {
        test('ENGINE_VERSION should be defined', () => {
            expect(ENGINE_VERSION).toBeDefined();
            expect(typeof ENGINE_VERSION).toBe('string');
        });

        test('INDUSTRY_B should have all industries', () => {
            const industries = [
                'construction', 'energy_raw_materials', 'industrial_production',
                'logistics_transport', 'trade_retail', 'it_software', 'finance', 'services_other'
            ];
            industries.forEach(industry => {
                expect(INDUSTRY_B[industry]).toBeDefined();
            });
        });

        test('TIMELINE_THRESHOLDS should be frozen values', () => {
            expect(TIMELINE_THRESHOLDS.CRITICAL_30).toBe(46);
            expect(TIMELINE_THRESHOLDS.STRATEGIC_90).toBe(21);
            expect(TIMELINE_THRESHOLDS.OPERATIONAL_180).toBe(20);
        });
    });

    describe('computeMS', () => {
        test('MS formula: min(100, 0.6*B + 0.2*R + 0.2*C)', () => {
            // B=35, R=10, C=5 → 0.6*35 + 0.2*10 + 0.2*5 = 21 + 2 + 1 = 24
            expect(computeMS(35, 10, 5)).toBe(24);
        });

        test('MS should not exceed 100', () => {
            expect(computeMS(200, 100, 100)).toBe(100);
        });

        test('MS should not go below 0', () => {
            expect(computeMS(0, 0, 0)).toBe(0);
        });

        test('MS with high regulation (R=20)', () => {
            // B=40, R=20, C=10 → 0.6*40 + 0.2*20 + 0.2*10 = 24 + 4 + 2 = 30
            expect(computeMS(40, 20, 10)).toBe(30);
        });
    });

    describe('computeAllMS', () => {
        test('should compute MS for all pillars', () => {
            const ms = computeAllMS('construction', 10, 5);
            expect(ms.E).toBeDefined();
            expect(ms.S).toBeDefined();
            expect(ms.G).toBeDefined();
            expect(ms.SC).toBeDefined();
        });

        test('should fallback to services_other for unknown industry', () => {
            const ms = computeAllMS('unknown_industry', 10, 5);
            const expected = computeAllMS('services_other', 10, 5);
            expect(ms).toEqual(expected);
        });
    });

    describe('computeERRS', () => {
        test('ERRS formula: (100 - Score) * (MS / 100)', () => {
            // Score=60, MS=40 → (100-60) * (40/100) = 40 * 0.4 = 16
            expect(computeERRS(60, 40)).toBe(16);
        });

        test('ERRS with perfect score should be 0', () => {
            expect(computeERRS(100, 50)).toBe(0);
        });

        test('ERRS with zero score and high MS', () => {
            // Score=0, MS=80 → (100-0) * (80/100) = 100 * 0.8 = 80
            expect(computeERRS(0, 80)).toBe(80);
        });
    });

    describe('computeWeightedScore', () => {
        test('should compute weighted average by MS', () => {
            const scores = { E: 80, S: 60, G: 40, SC: 20 };
            const ms = { E: 40, S: 30, G: 20, SC: 10 };
            // (80*40 + 60*30 + 40*20 + 20*10) / (40+30+20+10)
            // (3200 + 1800 + 800 + 200) / 100 = 6000/100 = 60
            expect(computeWeightedScore(scores, ms)).toBe(60);
        });

        test('should return null if all MS are 0', () => {
            const scores = { E: 80, S: 60, G: 40, SC: 20 };
            const ms = { E: 0, S: 0, G: 0, SC: 0 };
            expect(computeWeightedScore(scores, ms)).toBeNull();
        });
    });

    describe('computeTaskGap', () => {
        test('TAK (5) should have gap 0', () => {
            expect(computeTaskGap(5)).toBe(0);
        });

        test('NIE (0) should have gap 100', () => {
            expect(computeTaskGap(0)).toBe(100);
        });

        test('W_TRAKCIE (3) should have gap 40', () => {
            expect(computeTaskGap(3)).toBe(40);
        });

        test('null should have gap 0', () => {
            expect(computeTaskGap(null)).toBe(0);
        });
    });

    describe('computeTaskERRS', () => {
        test('Task_ERRS formula: Gap * (MS / 100)', () => {
            expect(computeTaskERRS(100, 50)).toBe(50);
            expect(computeTaskERRS(40, 80)).toBe(32);
        });
    });

    describe('getPillarForQuestion', () => {
        test('should identify E questions', () => {
            expect(getPillarForQuestion('e1')).toBe('E');
            expect(getPillarForQuestion('e4a')).toBe('E');
        });

        test('should identify S questions', () => {
            expect(getPillarForQuestion('s5')).toBe('S');
        });

        test('should identify G questions', () => {
            expect(getPillarForQuestion('g3')).toBe('G');
        });

        test('should identify SC questions', () => {
            expect(getPillarForQuestion('sc1')).toBe('SC');
        });

        test('should identify X questions', () => {
            expect(getPillarForQuestion('x10')).toBe('X');
        });
    });

    describe('bucketize', () => {
        test('Task_ERRS >= 46 should be 30 days (critical)', () => {
            expect(bucketize(46)).toBe(30);
            expect(bucketize(100)).toBe(30);
        });

        test('Task_ERRS 21-45 should be 90 days (strategic)', () => {
            expect(bucketize(21)).toBe(90);
            expect(bucketize(45)).toBe(90);
        });

        test('Task_ERRS <= 20 should be 180 days (operational)', () => {
            expect(bucketize(20)).toBe(180);
            expect(bucketize(0)).toBe(180);
        });
    });

    describe('getTimelineLabel', () => {
        test('30 days should be "krytyczne"', () => {
            expect(getTimelineLabel(30)).toBe('krytyczne');
        });

        test('90 days should be "strategiczne"', () => {
            expect(getTimelineLabel(90)).toBe('strategiczne');
        });

        test('180 days should be "operacyjne"', () => {
            expect(getTimelineLabel(180)).toBe('operacyjne');
        });
    });

    describe('getMSComment', () => {
        test('MS >= 81 should be "krytyczny"', () => {
            expect(getMSComment(81)).toBe('krytyczny');
            expect(getMSComment(100)).toBe('krytyczny');
        });

        test('MS 46-80 should be "wysoki"', () => {
            expect(getMSComment(46)).toBe('wysoki');
            expect(getMSComment(80)).toBe('wysoki');
        });

        test('MS 0-45 should be "umiarkowany"', () => {
            expect(getMSComment(0)).toBe('umiarkowany');
            expect(getMSComment(45)).toBe('umiarkowany');
        });
    });

    describe('getWeightedScoreComment', () => {
        test('null should be "nie wyznaczono"', () => {
            expect(getWeightedScoreComment(null)).toBe('nie wyznaczono');
        });

        test('>= 80 should be "lider"', () => {
            expect(getWeightedScoreComment(80)).toBe('lider');
        });

        test('51-79 should be "solidny"', () => {
            expect(getWeightedScoreComment(51)).toBe('solidny');
        });

        test('31-50 should be "wysokie ryzyko"', () => {
            expect(getWeightedScoreComment(31)).toBe('wysokie ryzyko');
        });

        test('< 31 should be "krytyczny brak"', () => {
            expect(getWeightedScoreComment(30)).toBe('krytyczny brak');
        });
    });

    describe('selectTop3', () => {
        test('should select top 3 tasks by Task_ERRS', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.NIE);
            const ms = { E: 50, S: 40, G: 30, SC: 20 };

            const top3 = selectTop3(answers, ms);

            expect(top3.length).toBe(3);
            // Should be sorted by taskERRS descending
            expect(top3[0].taskERRS).toBeGreaterThanOrEqual(top3[1].taskERRS);
            expect(top3[1].taskERRS).toBeGreaterThanOrEqual(top3[2].taskERRS);
        });

        test('should return empty array when all answers are TAK', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK);
            const ms = { E: 50, S: 50, G: 50, SC: 50 };

            const top3 = selectTop3(answers, ms);

            expect(top3.length).toBe(0);
        });
    });

    describe('computeRelevance', () => {
        test('should return complete relevance data', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE);
            const coreScores = { e_percent: 60, s_percent: 60, g_percent: 60, sc_percent: 60 };
            const context = { industry: 'construction', R: 10, C: 5 };

            const result = computeRelevance(answers, coreScores, context);

            expect(result.engine_version).toBe(ENGINE_VERSION);
            expect(result.ms).toBeDefined();
            expect(result.errs).toBeDefined();
            expect(result.weightedScore).toBeDefined();
            expect(result.top3).toBeDefined();
            expect(result.plan30).toBeDefined();
            expect(result.plan90).toBeDefined();
            expect(result.plan180).toBeDefined();
            expect(result.comments).toBeDefined();
        });

        test('should use default values when context is empty', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.TAK);
            const coreScores = { e_percent: 100, s_percent: 100, g_percent: 100, sc_percent: 100 };

            const result = computeRelevance(answers, coreScores, {});

            expect(result.industry).toBe('services_other');
            expect(result.R).toBe(0);
            expect(result.C).toBe(0);
        });
    });

    describe('simulateWhatIf', () => {
        test('should return original, simulated, and diff', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE);
            const coreScores = { e_percent: 60, s_percent: 60, g_percent: 60, sc_percent: 60 };
            const context = { industry: 'construction', R: 0, C: 0 };

            const result = simulateWhatIf(answers, coreScores, context, { R: 20, C: 15 });

            expect(result.original).toBeDefined();
            expect(result.simulated).toBeDefined();
            expect(result.diff).toBeDefined();
            expect(result.simulation).toBeDefined();
        });

        test('with no changes should return identical results', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE);
            const coreScores = { e_percent: 60, s_percent: 60, g_percent: 60, sc_percent: 60 };
            const context = { industry: 'construction', R: 10, C: 5 };

            const result = simulateWhatIf(answers, coreScores, context, { R: 10, C: 5 });

            expect(result.original.weightedScore).toBe(result.simulated.weightedScore);
            expect(result.diff.weightedScore).toBe(0);
        });

        test('increasing R should increase MS', () => {
            const answers = createUniformAnswers(ANSWER_VALUES.W_TRAKCIE);
            const coreScores = { e_percent: 60, s_percent: 60, g_percent: 60, sc_percent: 60 };
            const context = { industry: 'construction', R: 0, C: 0 };

            const result = simulateWhatIf(answers, coreScores, context, { R: 20 });

            expect(result.diff.ms.E).toBeGreaterThan(0);
            expect(result.diff.ms.S).toBeGreaterThan(0);
            expect(result.diff.ms.G).toBeGreaterThan(0);
            expect(result.diff.ms.SC).toBeGreaterThan(0);
        });
    });
});
