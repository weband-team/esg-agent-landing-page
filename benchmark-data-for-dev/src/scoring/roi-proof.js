/**
 * ROI Proof Module (Krok 4)
 * Executive-friendly output for CFO/CEO with business narratives
 */

const { FEATURE_FLAGS, ROI_PROOF_VERSION } = require('./feature-flags');
const { selectTop3, getTimelineLabel, computeRelevance, computeAllMS } = require('./relevance');
const { computeAllMSWithLookup } = require('./industry-lookup');

/**
 * Business narrative templates for ROI Proof
 * Used to generate executive-friendly explanations for TOP2 tasks
 * Keyed by pillar (E/S/G/SC) with risk and opportunity narratives
 */
const BUSINESS_NARRATIVES = {
    E: {
        risk: 'Niespełnienie wymagań środowiskowych może skutkować karami regulacyjnymi i utratą dostępu do zielonych finansów.',
        opportunity: 'Poprawa w obszarze E zwiększa szanse na certyfikaty środowiskowe i dostęp do ESG-świadomych inwestorów.'
    },
    S: {
        risk: 'Braki w obszarze społecznym mogą prowadzić do problemów z retencją pracowników i reputacją.',
        opportunity: 'Inwestycje w S budują employer branding i zwiększają lojalność klientów.'
    },
    G: {
        risk: 'Słabe zarządzanie ESG to ryzyko compliance i potencjalne problemy z due diligence partnerów.',
        opportunity: 'Silne G usprawnia procesy decyzyjne i buduje zaufanie inwestorów.'
    },
    SC: {
        risk: 'Brak kontroli łańcucha dostaw grozi przerwami operacyjnymi i ryzykiem reputacyjnym.',
        opportunity: 'Odpowiedzialny łańcuch dostaw to przewaga w przetargach i relacjach B2B.'
    }
};

/**
 * Select TOP2 tasks with highest Task_ERRS for ROI Proof
 * More focused than TOP3 for executive presentations
 *
 * @param {Object} answers - All answers { questionId: value }
 * @param {Object} ms - MS values { E, S, G, SC }
 * @returns {Array} Top 2 tasks sorted by Task_ERRS descending
 */
function selectTop2(answers, ms) {
    const top3 = selectTop3(answers, ms);
    return top3.slice(0, 2);
}

/**
 * Get business narrative for a pillar
 * @param {string} pillar - E, S, G, or SC
 * @param {string} type - 'risk' or 'opportunity'
 * @returns {string} Narrative text
 */
function getBusinessNarrative(pillar, type = 'risk') {
    const narratives = BUSINESS_NARRATIVES[pillar];
    if (!narratives) return '';
    return narratives[type] || '';
}

/**
 * Generate ROI Proof report for executives
 * Provides TOP2 tasks with business context and quick-win recommendations
 *
 * @param {Object} answers - Raw answers
 * @param {Object} coreScores - CORE percentages
 * @param {Object} context - { industry, R, C }
 * @returns {Object} ROI Proof report
 */
function generateROIProof(answers, coreScores, context = {}) {
    if (!FEATURE_FLAGS.roi_proof_enabled) {
        return {
            enabled: false,
            message: 'ROI Proof module is disabled'
        };
    }

    const { industry = 'services_other', R = 0, C = 0 } = context;
    const ms = FEATURE_FLAGS.industry_lookup_enabled
        ? computeAllMSWithLookup(industry, R, C)
        : computeAllMS(industry, R, C);

    const top2 = selectTop2(answers, ms);

    // Generate executive summary for each TOP2 task
    const executiveTasks = top2.map((task, index) => ({
        rank: index + 1,
        questionId: task.questionId,
        pillar: task.pillar,
        taskERRS: Math.round(task.taskERRS * 10) / 10,
        timeline: task.timeline,
        timelineLabel: getTimelineLabel(task.timeline),
        riskNarrative: getBusinessNarrative(task.pillar, 'risk'),
        opportunityNarrative: getBusinessNarrative(task.pillar, 'opportunity')
    }));

    // Quick wins - tasks from plan30 that can show immediate ROI
    const relevance = computeRelevance(answers, coreScores, context);
    const quickWins = relevance.plan30.slice(0, 3).map(task => ({
        questionId: task.questionId,
        pillar: task.pillar,
        impact: 'HIGH',
        timeline: '30 dni'
    }));

    // Strategic tasks for 90-day planning
    const strategicTasks = relevance.plan90.slice(0, 3).map(task => ({
        questionId: task.questionId,
        pillar: task.pillar,
        impact: 'MEDIUM',
        timeline: '90 dni'
    }));

    return {
        enabled: true,
        version: ROI_PROOF_VERSION,
        generatedAt: new Date().toISOString(),

        // Executive summary
        executiveSummary: {
            weightedScore: relevance.weightedScore,
            weightedScoreComment: relevance.comments.weightedScore,
            criticalTasksCount: relevance.plan30.length,
            strategicTasksCount: relevance.plan90.length
        },

        // TOP2 with narratives
        top2: executiveTasks,

        // Action plans
        quickWins,
        strategicTasks,

        // Pillar-level MS comments (without raw numbers)
        materialityComments: relevance.comments.ms
    };
}

module.exports = {
    BUSINESS_NARRATIVES,
    selectTop2,
    getBusinessNarrative,
    generateROIProof
};
