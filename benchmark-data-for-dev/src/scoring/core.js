/**
 * CORE Scoring Module
 * Basic ESG scoring logic for questionnaire answers
 *
 * CORE Scoring system:
 * - TAK (YES) = 5 points
 * - W TRAKCIE (IN PROGRESS) = 3 points
 * - NIE (NO) = 0 points
 * - NIE WIEM (DON'T KNOW) = 0 points
 * - NIE DOTYCZY (NOT APPLICABLE) = null (excluded from calculation)
 *
 * Max scores (90-point scale):
 * - E (Environment): 30 points (11 questions)
 * - S (Social): 25 points (9 questions)
 * - G (Governance): 20 points (9 questions)
 * - SC (Supply Chain): 15 points (9 questions)
 * - Total: 90 points (38 CORE questions)
 */

/**
 * Answer value constants
 */
const { SCORING_VERSION } = require('./feature-flags');

/**
 * Answer value constants
 */
const ANSWER_VALUES = {
    TAK: 5,
    W_TRAKCIE: 3,
    NIE: 0,
    NIE_WIEM: 0,
    NIE_DOTYCZY: null  // excluded from calculation
};

/**
 * Question definitions for each pillar
 */
const QUESTIONS = {
    G: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'],  // 9 questions
    S: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'],  // 9 questions
    E: ['e1', 'e2', 'e3', 'e4', 'e4a', 'e5', 'e5a', 'e6', 'e7', 'e8', 'e9'],  // 11 questions
    SC: ['sc1', 'sc2', 'sc3', 'sc4', 'sc5', 'sc6', 'sc7', 'sc8', 'sc9'],  // 9 questions
    X: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12'],  // 12 EXTENDED questions
    C: ['c1', 'c2', 'c3'],  // 3 CONTRACT/CLIENT PRESSURE questions
    R: ['r1', 'r2', 'r3']   // 3 REGULATION PRESSURE questions
};

/**
 * EXTENDED questions metadata with impact_type
 * impact_type ∈ {context, task, evidence, none}
 * - context: Affects priority calculation but not CORE Score
 * - task: Adds actions to implementation plan
 * - evidence: Only affects readiness flag, not numeric scores
 * - none: Informational only, no impact on calculations
 */
const EXTENDED_QUESTIONS_META = {
    x1:  { id: 'x1',  impact_type: 'context',  pillar: 'E',  description: 'Environmental management system' },
    x2:  { id: 'x2',  impact_type: 'context',  pillar: 'E',  description: 'Carbon footprint measurement' },
    x3:  { id: 'x3',  impact_type: 'task',     pillar: 'E',  description: 'Emissions reduction targets' },
    x4:  { id: 'x4',  impact_type: 'evidence', pillar: 'E',  description: 'Environmental certifications' },
    x5:  { id: 'x5',  impact_type: 'context',  pillar: 'S',  description: 'DEI policy' },
    x6:  { id: 'x6',  impact_type: 'task',     pillar: 'S',  description: 'Employee training programs' },
    x7:  { id: 'x7',  impact_type: 'evidence', pillar: 'S',  description: 'Social certifications' },
    x8:  { id: 'x8',  impact_type: 'context',  pillar: 'G',  description: 'Board ESG oversight' },
    x9:  { id: 'x9',  impact_type: 'task',     pillar: 'G',  description: 'ESG reporting frequency' },
    x10: { id: 'x10', impact_type: 'evidence', pillar: 'G',  description: 'Governance certifications' },
    x11: { id: 'x11', impact_type: 'context',  pillar: 'SC', description: 'Supply chain ESG assessment' },
    x12: { id: 'x12', impact_type: 'task',     pillar: 'SC', description: 'Supplier ESG requirements' }
};

/**
 * Valid impact types for EXTENDED questions
 */
const IMPACT_TYPES = ['context', 'task', 'evidence', 'none'];

/**
 * Get impact_type for an EXTENDED question
 * @param {string} questionId - Question ID (x1-x12)
 * @returns {string|null} impact_type or null if not found
 */
function getExtendedImpactType(questionId) {
    const meta = EXTENDED_QUESTIONS_META[questionId.toLowerCase()];
    return meta ? meta.impact_type : null;
}

/**
 * Get all EXTENDED questions by impact_type
 * @param {string} impactType - One of: context, task, evidence, none
 * @returns {string[]} Array of question IDs with that impact_type
 */
function getExtendedByImpactType(impactType) {
    return Object.entries(EXTENDED_QUESTIONS_META)
        .filter(([_, meta]) => meta.impact_type === impactType)
        .map(([id, _]) => id);
}

/**
 * Max points for each pillar in 90-point scale
 */
const MAX_POINTS = {
    E: 30,
    S: 25,
    G: 20,
    SC: 15,
    TOTAL: 90
};

/**
 * Industry-specific base weights (B_i) for E/S/G/SC pillars
 * Used in Relevance Engine for calculating Materiality Score (MS)
 * B_i ∈ [0, 100] - base importance of pillar i for the industry
 * Formula: MS_i = min(100, 0.6 * B_i + 0.2 * R + 0.2 * C)
 *
 * Source: info.md - Baseline Industry Materiality values (2024 update)
 */
const INDUSTRY_B = {
    'construction':           { E: 35, S: 25, G: 20, SC: 20 },  // No data in info.md, kept legacy values
    'energy_resources':       { E: 95, S: 70, G: 80, SC: 60 },  // Energy from info.md
    'finance_fintech':        { E: 30, S: 60, G: 95, SC: 40 },  // Fintech from info.md
    'retail_trade':           { E: 70, S: 75, G: 65, SC: 90 },  // Retail from info.md
    'it_software':            { E: 30, S: 70, G: 85, SC: 35 },  // IT (Software) from info.md
    'logistics_transport':    { E: 85, S: 80, G: 65, SC: 90 },  // Logistics from info.md (Transport same)
    'industrial_production':  { E: 90, S: 80, G: 70, SC: 85 },  // Manufacturing from info.md
    'services_other':         { E: 40, S: 75, G: 80, SC: 45 },  // Services from info.md

    // Legacy aliases for backward compatibility (deprecated, will be removed)
    'energy_raw_materials':   { E: 95, S: 70, G: 80, SC: 60 },  // Alias for energy_resources
    'trade_retail':           { E: 70, S: 75, G: 65, SC: 90 },  // Alias for retail_trade
    'finance':                { E: 30, S: 60, G: 95, SC: 40 }   // Alias for finance_fintech
};

// Alias for backward compatibility
const INDUSTRY_WEIGHTS = INDUSTRY_B;

/**
 * Calculate percentage for a block of questions
 * Converts 0-5 scale to 0-100 percentage
 *
 * @param {Object} answers - Object with question names as keys and answer values (0, 3, 5, or null)
 * @param {string[]} questionNames - Array of question names to include in calculation
 * @returns {number} Percentage (0-100)
 */
function calcBlockPercent(answers, questionNames) {
    let sum = 0;
    let count = 0;

    questionNames.forEach(name => {
        const val = answers[name];
        if (val !== null && val !== undefined) {
            sum += val;
            count++;
        }
    });

    if (count === 0) return 0;

    const avgScore = sum / count;  // Average score (0-5)
    const rawPercent = (avgScore / 5) * 100;   // Convert to percentage (0-100)
    return Math.round(rawPercent * 10) / 10;   // Round to at most 1 decimal place
}

/**
 * Convert percentage to points in 85-point scale
 *
 * @param {number} percent - Percentage (0-100)
 * @param {number} maxPoints - Maximum points for this pillar
 * @returns {number} Points (rounded)
 */
function percentToPoints(percent, maxPoints) {
    return Math.round((percent / 100) * maxPoints);
}

/**
 * Get interpretation level based on core percentage
 * NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
 *
 * Thresholds:
 * - 81-100: DOBRY (good) - rare maturity level
 * - 51-80: UMIARKOWANY (moderate) - largest natural SME basket
 * - 31-50: PODWYZSZONE_RYZYKO (elevated risk) - real systemic gaps
 * - 0-30: KRYTYCZNY (critical) - lack of management foundations
 *
 * @param {number} corePercent - Core percentage (0-100)
 * @returns {string} Interpretation level (Polish label)
 */
function getInterpretation(corePercent) {
    if (corePercent >= 81) return 'Dobry';
    if (corePercent >= 51) return 'Umiarkowany';
    if (corePercent >= 31) return 'Podwyższone ryzyko';
    return 'Krytyczny';
}

/**
 * Convert answer value to compliance score
 * 5 (TAK) → 2 (YES), 3 (W TRAKCIE) → 1 (PARTIAL), 0/null → 0 (NO)
 *
 * @param {number|null} val - Answer value
 * @returns {number} Compliance score (0, 1, or 2)
 */
function toComplianceScore(val) {
    if (val === null || val === undefined) return 0;
    if (val === 5) return 2;  // TAK = YES
    if (val === 3) return 1;  // W TRAKCIE = PARTIAL
    return 0;  // NIE/NIE WIEM = NO
}

/**
 * Main scoring function
 *
 * @param {Object} answers - Object with question names as keys and answer values
 * @param {Object} context - Context object with profile and industry properties
 * @returns {Object} Scores object
 */
function computeScores(answers, context = {}) {
    // Calculate percentages for each pillar
    const g_percent = calcBlockPercent(answers, QUESTIONS.G);
    const s_percent = calcBlockPercent(answers, QUESTIONS.S);
    const e_percent = calcBlockPercent(answers, QUESTIONS.E);
    const sc_percent = calcBlockPercent(answers, QUESTIONS.SC);

    // Calculate CORE result as average of all blocks
    const core_percent = Math.round((g_percent + s_percent + e_percent + sc_percent) / 4);

    // Calculate EXTENDED percentage
    const extended_percent = calcBlockPercent(answers, QUESTIONS.X);

    // Block weights - prioritize industry weights, then profile weights, then default
    let weights = { g: 25, s: 25, e: 25, sc: 25 };  // Default equal weights

    // Use industry-specific weights if industry is provided
    if (context.industry && INDUSTRY_B[context.industry]) {
        const iw = INDUSTRY_B[context.industry];
        weights = { g: iw.G, s: iw.S, e: iw.E, sc: iw.SC };
    } else if (context.profile === 'MSP') {
        weights = { g: 20, s: 30, e: 30, sc: 20 };
    } else if (context.profile === 'SUPPLIER') {
        weights = { g: 15, s: 25, e: 25, sc: 35 };
    } else if (context.profile === 'LARGE') {
        weights = { g: 30, s: 25, e: 30, sc: 15 };
    }

    // Weighted score for contextual interpretation
    const weighted_percent = Math.round(
        (g_percent * weights.g + s_percent * weights.s +
         e_percent * weights.e + sc_percent * weights.sc) / 100
    );

    // Convert to 85-point scale
    const g = percentToPoints(g_percent, MAX_POINTS.G);
    const s = percentToPoints(s_percent, MAX_POINTS.S);
    const e = percentToPoints(e_percent, MAX_POINTS.E);
    const sup = percentToPoints(sc_percent, MAX_POINTS.SC);
    const total = g + s + e + sup;

    // Get interpretation
    const interpret = getInterpretation(core_percent);

    // Compliance calculation
    const complianceAnswers = {
        esrs: toComplianceScore(answers.g3),
        doubleMateriality: 0,
        taxonomy: toComplianceScore(answers.e6),
        dnsh: toComplianceScore(answers.g6),
        sfdr: 0,
        assurance: toComplianceScore(answers.sc3)
    };

    const compliance = Object.values(complianceAnswers).reduce((sum, v) => sum + v, 0);

    return {
        // Version for comparability
        scoring_version: SCORING_VERSION,

        // PDF compatibility fields (85-point scale)
        e,
        s,
        g,
        sup,
        total,

        // Main results
        percent: core_percent,
        interpret,

        // Block percentages (CORE)
        g_percent,
        s_percent,
        e_percent,
        sc_percent,

        // EXTENDED result
        extended_percent,
        g_ext_percent: 0,
        s_ext_percent: 0,
        e_ext_percent: 0,
        sc_ext_percent: 0,

        // Weighted result
        weighted_percent,
        weights,

        // Compliance
        compliance,
        complianceAnswers
    };
}

/**
 * Create answers object with all questions set to a specific value
 *
 * @param {number|null} value - Answer value to set for all questions
 * @param {string[]} questionSets - Array of question set names ('G', 'S', 'E', 'SC', 'X')
 * @returns {Object} Answers object
 */
function createUniformAnswers(value, questionSets = ['G', 'S', 'E', 'SC']) {
    const answers = {};
    questionSets.forEach(set => {
        if (QUESTIONS[set]) {
            QUESTIONS[set].forEach(q => {
                answers[q] = value;
            });
        }
    });
    return answers;
}

/**
 * Compute R (Regulation Pressure) from R questions
 * Per TOP 3 spec (PDF p. 12):
 * - R ∈ {0, 10, 20} - switches, not accumulative scores
 * - R = max(R1, R2, R3) where each R_i ∈ {0, 10, 20}
 * - R = 0 if all questions = NIE
 * - R activated if at least 1 question = TAK or CZASAMI
 *
 * Mapping:
 * - TAK → 20
 * - CZASAMI → 10
 * - NIE / NIE_WIEM / NIE_DOTYCZY → 0
 *
 * @param {Object} answers - All answers including R questions
 * @returns {number} R value (0, 10, or 20)
 */
function computeR(answers) {
    const rQuestions = QUESTIONS.R || ['r1', 'r2', 'r3'];
    const candidates = [];

    rQuestions.forEach(qId => {
        const answer = answers[qId];
        const normalizedAnswer = answer?.toUpperCase?.() || answer;

        if (normalizedAnswer === 'TAK' || normalizedAnswer === 5) {
            candidates.push(20);
        } else if (normalizedAnswer === 'CZASAMI' || normalizedAnswer === 'W_TRAKCIE' || normalizedAnswer === 3) {
            candidates.push(10);
        } else {
            candidates.push(0);  // NIE, NIE_WIEM, NIE_DOTYCZY, null, undefined
        }
    });

    // R = max(candidates)
    return Math.max(...candidates);
}

/**
 * Compute C (Contract/Client Pressure) from C questions
 * Per TOP 3 spec (PDF p. 12):
 * - C ∈ {0, 10, 15} - switches, not accumulative scores
 * - C = max(C1, C2, C3) where each C_i ∈ {0, 10, 15}
 * - C = 0 if all questions = NIE
 * - C activated if at least 1 question = TAK or CZASAMI
 *
 * Mapping:
 * - TAK → 15
 * - CZASAMI → 10
 * - NIE / NIE_WIEM / NIE_DOTYCZY → 0
 *
 * @param {Object} answers - All answers including C questions
 * @returns {number} C value (0, 10, or 15)
 */
function computeC(answers) {
    const cQuestions = QUESTIONS.C || ['c1', 'c2', 'c3'];
    const candidates = [];

    cQuestions.forEach(qId => {
        const answer = answers[qId];
        const normalizedAnswer = answer?.toUpperCase?.() || answer;

        if (normalizedAnswer === 'TAK' || normalizedAnswer === 5) {
            candidates.push(15);
        } else if (normalizedAnswer === 'CZASAMI' || normalizedAnswer === 'W_TRAKCIE' || normalizedAnswer === 3) {
            candidates.push(10);
        } else {
            candidates.push(0);  // NIE, NIE_WIEM, NIE_DOTYCZY, null, undefined
        }
    });

    // C = max(candidates)
    return Math.max(...candidates);
}

module.exports = {
    ANSWER_VALUES,
    QUESTIONS,
    MAX_POINTS,
    EXTENDED_QUESTIONS_META,
    IMPACT_TYPES,
    INDUSTRY_B,
    INDUSTRY_WEIGHTS,
    getExtendedImpactType,
    getExtendedByImpactType,
    calcBlockPercent,
    percentToPoints,
    getInterpretation,
    toComplianceScore,
    computeScores,
    createUniformAnswers,
    computeR,
    computeC
};