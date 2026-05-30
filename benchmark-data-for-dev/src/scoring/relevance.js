/**
 * Relevance Engine v1
 * Business-relevance scoring based on materiality
 *
 * Formulas:
 * - MS_i = min(100, 0.6 * B_i + 0.2 * R + 0.2 * C)  -- Materiality Score
 * - ERRS_i = (100 - Score_i) * (MS_i / 100)         -- Risk Score
 * - WeightedScore = Σ(Score_i * MS_i) / Σ(MS_i)    -- Weighted Business Score
 * - Task_ERRS = Gap_t * (MS_area / 100)            -- Task Risk Score
 * - Timeline: All tasks assigned to 30 days horizon
 */

const { ENGINE_VERSION } = require('./feature-flags');
const { INDUSTRY_B, EXTENDED_QUESTIONS_META, QUESTIONS } = require('./core');
const {
    getExecutiveState,
    getExecutiveStateLabel,
    computeAllReadiness,
    READINESS_QUESTIONS
} = require('./thresholds');

const {
    getTopDisplayCount,
    filterTop3ForDisplay,
    getHorizonComment,
    getControlQuestions,
    getDataQualityComment,
    getMarketReadinessComment,
    getAllMaterialityComments,
    generateReportComments,
    getTop3RiskComments,
    getExecutiveSummaryState
} = require('./comments');

/**
 * Regulation pressure levels (R) - from survey metryczka
 * R ∈ {0, 10, 20} based on regulatory exposure
 */
const REGULATION_LEVELS = {
    LOW: 0,
    MEDIUM: 10,
    HIGH: 20
};

/**
 * Contract/Financial pressure levels (C) - from survey metryczka
 * C is max of pressure points from clients, banks, tenders (NOT summed)
 * Per TOP 3 spec: C ∈ {0, 10, 15} - switches, not accumulative scores
 * Typical values: 0, 10, 15
 */
const CONTRACT_PRESSURE = {
    NONE: 0,
    MEDIUM: 10,
    HIGH: 15
};

/**
 * Task_ERRS thresholds for timeline bucketing
 * Frozen thresholds - do not modify without version change
 */
const TIMELINE_THRESHOLDS = {
    CRITICAL_30: 46,   // Task_ERRS >= 46 → 30 days (critical)
    STRATEGIC_90: 0    // Task_ERRS < 46 → 90 days (strategic)
};

/**
 * MS comment thresholds
 */
const MS_THRESHOLDS = {
    CRITICAL: 81,    // 81-100: critical materiality
    HIGH: 46,        // 46-80: high materiality
    MODERATE: 0      // 0-45: moderate materiality
};

/**
 * WeightedScore comment thresholds
 */
const WEIGHTED_SCORE_THRESHOLDS = {
    LEADER: 80,        // >= 80: leader
    SOLID: 51,         // 51-80: solid
    HIGH_RISK: 31,     // 31-50: high risk
    CRITICAL_GAP: 0    // < 30: critical gap
};

/**
 * Compute Materiality Score (MS) for a pillar
 * Formula v1 (canonical): MS_i = min(100, 0.6 * B_i + 0.2 * R + 0.2 * C)
 *
 * @param {number} B_i - Industry base weight for pillar (0-100)
 * @param {number} R - Regulation pressure (0, 10, or 20)
 * @param {number} C - Contract/financial pressure (0-15 typically)
 * @returns {number} MS_i in range [0, 100]
 */
function computeMS(B_i, R, C) {
    const raw = 0.6 * B_i + 0.2 * R + 0.2 * C;
    // Safety bounds: MS must be in [0, 100]
    return Math.min(100, Math.max(0, raw));
}

/**
 * Compute all MS values for all pillars given industry and context
 *
 * @param {string} industry - Industry key from INDUSTRY_B
 * @param {number} R - Regulation pressure
 * @param {number} C - Contract pressure
 * @returns {Object} { E: MS_E, S: MS_S, G: MS_G, SC: MS_SC }
 */
function computeAllMS(industry, R, C) {
    const B = INDUSTRY_B[industry] || INDUSTRY_B['services_other'];
    return {
        E: computeMS(B.E, R, C),
        S: computeMS(B.S, R, C),
        G: computeMS(B.G, R, C),
        SC: computeMS(B.SC, R, C)
    };
}

/**
 * Compute ERRS (ESG-adjusted Risk Rating Score) for a pillar
 * Formula: ERRS_i = (100 - Score_i) * (MS_i / 100)
 * ERRS represents the risk level considering both gap and materiality
 *
 * @param {number} score - Pillar score in percentage (0-100)
 * @param {number} ms - Materiality Score for the pillar (0-100)
 * @returns {number} ERRS_i in range [0, 100]
 */
function computeERRS(score, ms) {
    const gap = 100 - score;
    const errs = gap * (ms / 100);
    // Result guaranteed in [0, 100] if inputs are valid
    return Math.min(100, Math.max(0, errs));
}

/**
 * Compute all ERRS values for all pillars
 *
 * @param {Object} scores - { E: score_E, S: score_S, G: score_G, SC: score_SC } (percentages 0-100)
 * @param {Object} ms - { E: MS_E, S: MS_S, G: MS_G, SC: MS_SC }
 * @returns {Object} { E: ERRS_E, S: ERRS_S, G: ERRS_G, SC: ERRS_SC }
 */
function computeAllERRS(scores, ms) {
    return {
        E: computeERRS(scores.E, ms.E),
        S: computeERRS(scores.S, ms.S),
        G: computeERRS(scores.G, ms.G),
        SC: computeERRS(scores.SC, ms.SC)
    };
}

/**
 * Compute WeightedScore - business-relevant score weighted by materiality
 * Formula: WeightedScore = Σ(Score_i * MS_i) / Σ(MS_i)
 *
 * @param {Object} scores - { E: score_E, S: score_S, G: score_G, SC: score_SC }
 * @param {Object} ms - { E: MS_E, S: MS_S, G: MS_G, SC: MS_SC }
 * @returns {number|null} WeightedScore in [0, 100], or null if all MS are 0
 */
function computeWeightedScore(scores, ms) {
    const pillars = ['E', 'S', 'G', 'SC'];
    let numerator = 0;
    let denominator = 0;

    pillars.forEach(p => {
        numerator += scores[p] * ms[p];
        denominator += ms[p];
    });

    // Edge case: if all MS are 0, return null (undefined weighted score)
    if (denominator === 0) {
        return null;
    }

    return Math.round(numerator / denominator);
}

/**
 * Compute task gap for a single task/question
 * Binary: NIE → Gap = 100, TAK → Gap = 0
 * Partial: Gap = 100 - TaskScore
 *
 * @param {number|null} answerValue - Answer value (5=TAK, 3=W_TRAKCIE, 0=NIE, null=N/A)
 * @returns {number} Gap in [0, 100]
 */
function computeTaskGap(answerValue) {
    if (answerValue === null || answerValue === undefined) {
        return 0;  // N/A questions have no gap
    }
    // Convert 0-5 scale to 0-100 percentage
    const taskScore = (answerValue / 5) * 100;
    return 100 - taskScore;
}

/**
 * Compute Task_ERRS for a single task
 * Formula: Task_ERRS = Gap_t * (MS_area / 100)
 *
 * @param {number} gap - Task gap (0-100)
 * @param {number} ms - MS of the pillar this task belongs to
 * @returns {number} Task_ERRS in [0, 100]
 */
function computeTaskERRS(gap, ms) {
    return gap * (ms / 100);
}

/**
 * Get pillar for a question (E, S, G, SC, or X)
 *
 * @param {string} questionId - Question ID like 'e1', 's5', 'g3'
 * @returns {string} Pillar key (E, S, G, SC, X) or null
 */
function getPillarForQuestion(questionId) {
    const prefix = questionId.toLowerCase().replace(/[0-9a]/g, '');
    const mapping = { 'e': 'E', 's': 'S', 'g': 'G', 'sc': 'SC', 'x': 'X' };
    return mapping[prefix] || null;
}

/**
 * Bucketize Task_ERRS into timeline (30 days only)
 * All tasks are assigned to 30 days horizon
 *
 * @param {number} taskERRS - Task_ERRS value
 * @returns {number} Timeline in days (always 30)
 */
function bucketize(taskERRS) {
    // Always return 30 days - all tasks are prioritized for immediate action
    return 30;
}

/**
 * Select TOP3 areas (pillars) with highest ERRS
 * Per TOP 3 spec: TOP 3 is based on pillar-level ERRS, not individual tasks
 *
 * @param {Object} errs - ERRS values { E, S, G, SC }
 * @returns {Array} Top 3 areas sorted by ERRS descending
 *   Each item: { area, errs, timeline }
 */
function selectTop3Areas(errs) {
    const areas = [];

    for (const [area, errsValue] of Object.entries(errs)) {
        areas.push({
            area,
            errs: errsValue,
            timeline: bucketize(errsValue)
        });
    }

    // Sort by ERRS descending and take top 3
    areas.sort((a, b) => b.errs - a.errs);
    return areas.slice(0, 3);
}

/**
 * Determine Executive Summary state from TOP 3 areas
 * Based on ERRS values:
 * - If ANY area has ERRS >= 46 → ES = critical (🔴)
 * - If ALL areas have ERRS <= 20 → ES = green (🟢)
 * - If mix of low (<=20) and medium (21-45) → ES = orange (🟠)
 * - If ALL areas have ERRS 21-45 → ES = yellow (🟡)
 *
 * @param {Array} top3Areas - Result from selectTop3Areas()
 * @returns {string} State: 'green', 'yellow', 'orange', or 'critical'
 */
function getExecutiveStateFromTop3(top3Areas) {
    if (!top3Areas || top3Areas.length === 0) {
        return 'green'; // Default if no TOP 3
    }

    const errsValues = top3Areas.map(area => area.errs);
    const maxERRS = Math.max(...errsValues);

    // Critical: any area with ERRS >= 46
    if (maxERRS >= 46) {
        return 'critical';
    }

    // Green: all areas with ERRS <= 20 (low risk)
    const allLowRisk = errsValues.every(errs => errs <= 20);
    if (allLowRisk) {
        return 'green';
    }

    // Check for mix of low and medium risk
    const hasLowRisk = errsValues.some(errs => errs <= 20);
    const hasMediumRisk = errsValues.some(errs => errs > 20 && errs < 46);

    // Orange: mix of low (<=20) and medium (21-45) risk
    if (hasLowRisk && hasMediumRisk) {
        return 'orange';
    }

    // Yellow: all areas in medium risk range (21-45)
    return 'yellow';
}

/**
 * Select TOP3 tasks with highest Task_ERRS (missing/gap tasks only)
 * Legacy function - kept for backward compatibility
 * New code should use selectTop3Areas() instead
 *
 * @param {Object} answers - All answers { questionId: value }
 * @param {Object} ms - MS values { E, S, G, SC }
 * @returns {Array} Top 3 tasks sorted by Task_ERRS descending
 *   Each item: { questionId, pillar, gap, taskERRS, timeline }
 */
function selectTop3(answers, ms) {
    const tasks = [];
    const coreQuestions = [
        ...QUESTIONS.G,
        ...QUESTIONS.S,
        ...QUESTIONS.E,
        ...QUESTIONS.SC
    ];

    coreQuestions.forEach(qId => {
        const answer = answers[qId];
        const gap = computeTaskGap(answer);

        // Only include tasks with gap > 0 (missing or partial)
        if (gap > 0) {
            const pillar = getPillarForQuestion(qId);
            const pillarMS = ms[pillar] || 0;
            const taskERRS = computeTaskERRS(gap, pillarMS);

            tasks.push({
                questionId: qId,
                pillar,
                gap,
                taskERRS,
                timeline: bucketize(taskERRS)
            });
        }
    });

    // Sort by Task_ERRS descending and take top 3
    tasks.sort((a, b) => b.taskERRS - a.taskERRS);
    return tasks.slice(0, 3);
}

/**
 * Get timeline bucket label
 *
 * @param {number} days - Timeline days (always 30)
 * @returns {string} Label
 */
function getTimelineLabel(days) {
    // All tasks are critical and assigned to 30 days
    return 'krytyczne';
}

/**
 * Get MS comment based on materiality value
 *
 * @param {number} ms - Materiality Score (0-100)
 * @returns {string} Comment
 */
function getMSComment(ms) {
    if (ms >= MS_THRESHOLDS.CRITICAL) {
        return 'krytyczny';     // critical materiality (81-100)
    } else if (ms >= MS_THRESHOLDS.HIGH) {
        return 'wysoki';        // high materiality (46-80)
    } else {
        return 'umiarkowany';   // moderate materiality (0-45)
    }
}

/**
 * Get WeightedScore comment based on value
 *
 * @param {number} weightedScore - Weighted Score (0-100)
 * @returns {string} Comment
 */
function getWeightedScoreComment(weightedScore) {
    if (weightedScore === null) {
        return 'nie wyznaczono';  // not determined
    }
    if (weightedScore >= WEIGHTED_SCORE_THRESHOLDS.LEADER) {
        return 'lider';           // leader (>= 80)
    } else if (weightedScore >= WEIGHTED_SCORE_THRESHOLDS.SOLID) {
        return 'solidny';         // solid (51-80)
    } else if (weightedScore >= WEIGHTED_SCORE_THRESHOLDS.HIGH_RISK) {
        return 'wysokie ryzyko';  // high risk (31-50)
    } else {
        return 'krytyczny brak';  // critical gap (< 30)
    }
}

/**
 * Group tasks by timeline bucket
 *
 * @param {Array} tasks - Array of task objects with timeline property
 * @returns {Object} { 30: [...], 90: [...] }
 */
function groupByTimeline(tasks) {
    const groups = { 30: [], 90: [] };
    tasks.forEach(task => {
        if (groups[task.timeline]) {
            groups[task.timeline].push(task);
        }
    });
    return groups;
}

/**
 * Get EXTENDED questions by impact_type
 * @param {string} impactType - One of: context, task, evidence, none
 * @returns {string[]} Array of question IDs
 */
function getExtendedQuestionsByImpactType(impactType) {
    return Object.entries(EXTENDED_QUESTIONS_META)
        .filter(([_, meta]) => meta.impact_type === impactType)
        .map(([id, _]) => id);
}

/**
 * Compute Data Readiness R index for Data & Market Readiness section
 * Source: EXTENDED (X6, X10, X11)
 * R(S) = average of normalized answers (TAK=1, W_TRAKCIE=0.5, NIE/NIE_WIEM=0, NIE_DOTYCZY=excluded)
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {number} R index in [0, 1]
 */
function computeDataReadinessR(answers) {
    const dataQuestions = READINESS_QUESTIONS.MARKET; // ['x6', 'x10', 'x11']
    let sum = 0;
    let count = 0;

    dataQuestions.forEach(qId => {
        const answer = answers[qId];

        // Skip NIE_DOTYCZY (null, undefined, or explicit N/A)
        if (answer === null || answer === undefined || answer === 'NIE_DOTYCZY' || answer === 'N/A') {
            return;
        }

        // Normalize answer to 0-1 scale
        let normalizedValue = 0;
        if (answer === 5 || answer === 'TAK') {
            normalizedValue = 1.0;
        } else if (answer === 3 || answer === 'W_TRAKCIE') {
            normalizedValue = 0.5;
        }
        // NIE, NIE_WIEM = 0

        sum += normalizedValue;
        count++;
    });

    if (count === 0) return 0;
    return sum / count;
}

/**
 * Compute readiness flag based on EXTENDED-evidence questions
 * Evidence questions: x4, x7, x10 (environmental, social, governance certifications)
 *
 * Returns:
 * - 'confirmed' if all evidence questions are TAK (5)
 * - 'preliminary' if any evidence question is not TAK or missing
 *
 * This flag affects ONLY the status label, NOT numerical scores.
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {Object} { flag: 'confirmed'|'preliminary', evidenceCount: number, evidenceComplete: number }
 */
function computeReadinessFlag(answers) {
    const evidenceQuestions = getExtendedQuestionsByImpactType('evidence');

    let completeCount = 0;
    let totalCount = evidenceQuestions.length;

    evidenceQuestions.forEach(qId => {
        const answer = answers[qId];
        if (answer === 5) { // TAK
            completeCount++;
        }
    });

    return {
        flag: completeCount === totalCount && totalCount > 0 ? 'confirmed' : 'preliminary',
        evidenceCount: totalCount,
        evidenceComplete: completeCount
    };
}

/**
 * Get EXTENDED-task questions with gaps as additional tasks for action list
 * These are EXTENDED questions with impact_type='task' that can add to TOP3/action list
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @param {Object} ms - MS values { E, S, G, SC }
 * @returns {Array} Array of task objects for EXTENDED-task questions
 */
function getExtendedTaskGaps(answers, ms) {
    const taskQuestions = getExtendedQuestionsByImpactType('task');
    const tasks = [];

    taskQuestions.forEach(qId => {
        const answer = answers[qId];
        const gap = computeTaskGap(answer);

        if (gap > 0) {
            // Get pillar from EXTENDED_QUESTIONS_META
            const meta = EXTENDED_QUESTIONS_META[qId];
            const pillar = meta ? meta.pillar : 'X';
            const pillarMS = ms[pillar] || 0;
            const taskERRS = computeTaskERRS(gap, pillarMS);

            tasks.push({
                questionId: qId,
                pillar,
                gap,
                taskERRS,
                timeline: bucketize(taskERRS),
                isExtended: true,
                impactType: 'task'
            });
        }
    });

    return tasks;
}

/**
 * Main Relevance Engine function
 * Computes all relevance metrics given CORE scores and context
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @param {Object} coreScores - CORE percentages { e_percent, s_percent, g_percent, sc_percent }
 * @param {Object} context - { industry, R, C, includeExtendedTasks }
 * @returns {Object} Relevance Engine results
 */
function computeRelevance(answers, coreScores, context = {}) {
    const { industry = 'services_other', R = 0, C = 0, includeExtendedTasks = false } = context;

    // 1. Compute MS for all pillars
    const ms = computeAllMS(industry, R, C);

    // 2. Prepare scores object
    const scores = {
        E: coreScores.e_percent || 0,
        S: coreScores.s_percent || 0,
        G: coreScores.g_percent || 0,
        SC: coreScores.sc_percent || 0
    };

    // 3. Compute ERRS for all pillars
    const errs = computeAllERRS(scores, ms);

    // 4. Compute WeightedScore
    const weightedScore = computeWeightedScore(scores, ms);

    // 5. Compute readiness flag based on EXTENDED-evidence questions
    // This ONLY affects the status flag, NOT numerical scores
    const readiness = computeReadinessFlag(answers);

    // 6. Select TOP3 priority tasks (CORE only)
    const top3Core = selectTop3(answers, ms);

    // 7. Get EXTENDED-task gaps (optional, for extended action list)
    const extendedTaskGaps = getExtendedTaskGaps(answers, ms);

    // 8. Combined TOP3 with EXTENDED-task questions (if enabled)
    let top3 = top3Core;
    if (includeExtendedTasks && extendedTaskGaps.length > 0) {
        // Merge CORE and EXTENDED tasks, sort by taskERRS, take top 3
        const allTasksForTop3 = [...top3Core, ...extendedTaskGaps];
        allTasksForTop3.sort((a, b) => b.taskERRS - a.taskERRS);
        top3 = allTasksForTop3.slice(0, 3);
    }

    // 9. Group all missing tasks by timeline (CORE + EXTENDED-task)
    const allTasks = [];
    const coreQuestions = [
        ...QUESTIONS.G,
        ...QUESTIONS.S,
        ...QUESTIONS.E,
        ...QUESTIONS.SC
    ];

    coreQuestions.forEach(qId => {
        const answer = answers[qId];
        const gap = computeTaskGap(answer);
        if (gap > 0) {
            const pillar = getPillarForQuestion(qId);
            const pillarMS = ms[pillar] || 0;
            const taskERRS = computeTaskERRS(gap, pillarMS);
            allTasks.push({
                questionId: qId,
                pillar,
                gap,
                taskERRS,
                timeline: bucketize(taskERRS),
                isExtended: false
            });
        }
    });

    // Add EXTENDED-task gaps to allTasks
    allTasks.push(...extendedTaskGaps);

    const tasksByTimeline = groupByTimeline(allTasks);

    // 10. NEW: Select TOP 3 areas based on ERRS (pillar-level, not task-level)
    const top3Areas = selectTop3Areas(errs);

    // 11. NEW: Determine Executive state from TOP 3 (not from CORE score)
    // Per TOP 3 spec: ES inherits state from most urgent horizon in TOP 3
    const executiveStateFromTop3 = getExecutiveStateFromTop3(top3Areas);
    const corePercent = Math.round((scores.E + scores.S + scores.G + scores.SC) / 4);

    // Use TOP 3-based state (new logic)
    const executiveState = executiveStateFromTop3;
    const executiveLabel = getExecutiveStateLabel(executiveState);

    // 12. Compute all readiness indices (Market, Org, Credibility)
    const readinessIndices = computeAllReadiness(answers);

    // 13. Compute Data Readiness R for Data & Market Readiness section
    const dataReadinessR = computeDataReadinessR(answers);

    // 14. Determine TOP display count based on ES state
    // Per spec: green -> TOP3, yellow -> TOP2, orange/red -> TOP1
    const topDisplayCount = getTopDisplayCount(executiveState);
    const displayedTop3Areas = filterTop3ForDisplay(top3Areas, executiveState);

    // 15. Generate comments
    // NOTE: ERRS state is INHERITED from Executive Summary (which now comes from TOP 3)
    const comments = {
        ms: {
            E: getMSComment(ms.E),
            S: getMSComment(ms.S),
            G: getMSComment(ms.G),
            SC: getMSComment(ms.SC)
        },
        weightedScore: getWeightedScoreComment(weightedScore),
        // ERRS inherits state from Executive Summary (which is determined by TOP 3)
        errs: {
            state: executiveState,
            label: executiveLabel,
            note: 'Inherited from Executive Summary (determined by TOP 3)'
        },
        // Data & Market Readiness comments
        dataQuality: getDataQualityComment(dataReadinessR),
        marketReadiness: getMarketReadinessComment(dataReadinessR),
        // Materiality comments per pillar
        materiality: getAllMaterialityComments(ms)
    };

    // 16. Generate TOP 3 risk comments for each displayed area
    const top3AreaComments = displayedTop3Areas.map(area => ({
        ...area,
        riskComments: getTop3RiskComments(area.area, executiveState, 'pl')
    }));

    return {
        // Engine metadata
        engine_version: ENGINE_VERSION,

        // Input context
        industry,
        R,
        C,

        // Executive Summary state (TOP 3-based, not CORE-based)
        executive: {
            corePercent,  // Still computed for reference
            state: executiveState,  // From TOP 3, not CORE
            label: executiveLabel,
            source: 'TOP3'  // Indicates state comes from TOP 3
        },

        // Materiality Scores
        ms,

        // ERRS (risk scores) - state inherited from Executive
        errs,

        // Weighted business score
        weightedScore,

        // Readiness flag (based on EXTENDED-evidence) - affects ONLY status, NOT numbers
        readiness,

        // NEW: Readiness indices (Market, Org, Credibility)
        readinessIndices,

        // NEW: Data Readiness R for Data & Market Readiness section
        dataReadinessR,

        // NEW: TOP display count and logic (Layer 1 presentation)
        topDisplay: {
            count: topDisplayCount,
            esState: executiveState,
            note: 'System always calculates TOP3, display count is presentation layer only'
        },

        // NEW: TOP 3 areas (pillar-level) - all 3 calculated
        top3Areas,

        // NEW: Displayed TOP areas (filtered by ES state)
        displayedTop3Areas,

        // NEW: TOP 3 area comments (with risk comments)
        top3AreaComments,

        // TOP3 priority tasks (legacy, task-level)
        top3,

        // EXTENDED-task gaps (separate from CORE)
        extendedTaskGaps,

        // All tasks grouped by timeline
        tasksByTimeline,
        plan30: tasksByTimeline[30],
        plan90: tasksByTimeline[90],

        // Deterministic comments
        comments
    };
}

/**
 * Simulation Mode ("What-if?") - Section 6 of Relevance Engine spec
 *
 * Simulates changes to R (regulation) and/or C (contract pressure) context
 * WITHOUT modifying CORE answers. Recalculates:
 * MS → ERRS → TOP3 → 30/90 → comments
 *
 * Returns both original and simulated results for comparison.
 *
 * @param {Object} answers - Raw answers (NOT modified)
 * @param {Object} coreScores - CORE percentages (NOT modified)
 * @param {Object} originalContext - Original { industry, R, C }
 * @param {Object} simulatedContext - New { R?, C? } values to simulate
 * @returns {Object} { original, simulated, diff }
 */
function simulateWhatIf(answers, coreScores, originalContext, simulatedContext) {
    // Compute original results
    const original = computeRelevance(answers, coreScores, originalContext);

    // Merge contexts - simulated values override original
    const newContext = {
        industry: originalContext.industry || 'services_other',
        R: simulatedContext.R !== undefined ? simulatedContext.R : (originalContext.R || 0),
        C: simulatedContext.C !== undefined ? simulatedContext.C : (originalContext.C || 0)
    };

    // Compute simulated results (in-memory, no side effects)
    const simulated = computeRelevance(answers, coreScores, newContext);

    // Compute differences
    const diff = {
        R: newContext.R - (originalContext.R || 0),
        C: newContext.C - (originalContext.C || 0),
        ms: {
            E: simulated.ms.E - original.ms.E,
            S: simulated.ms.S - original.ms.S,
            G: simulated.ms.G - original.ms.G,
            SC: simulated.ms.SC - original.ms.SC
        },
        errs: {
            E: simulated.errs.E - original.errs.E,
            S: simulated.errs.S - original.errs.S,
            G: simulated.errs.G - original.errs.G,
            SC: simulated.errs.SC - original.errs.SC
        },
        weightedScore: (simulated.weightedScore || 0) - (original.weightedScore || 0),
        // Timeline changes
        plan30CountDiff: simulated.plan30.length - original.plan30.length,
        plan90CountDiff: simulated.plan90.length - original.plan90.length
    };

    return {
        original,
        simulated,
        diff,
        // Metadata
        simulation: {
            originalContext: { R: originalContext.R || 0, C: originalContext.C || 0 },
            simulatedContext: { R: newContext.R, C: newContext.C },
            engine_version: ENGINE_VERSION
        }
    };
}

module.exports = {
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
    selectTop3Areas,
    getExecutiveStateFromTop3,
    bucketize,
    getTimelineLabel,
    getMSComment,
    getWeightedScoreComment,
    groupByTimeline,
    getExtendedQuestionsByImpactType,
    computeReadinessFlag,
    getExtendedTaskGaps,
    computeDataReadinessR,
    computeRelevance,
    simulateWhatIf
};
