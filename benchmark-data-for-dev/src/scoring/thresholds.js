/**
 * Thresholds Module v1
 *
 * Scoring thresholds and state classification system.
 * Based on specification: "_system punktacji i progów przejścia.pdf"
 *
 * PRINCIPLE: Each layer has its own scale and thresholds:
 * - CORE SCORE: 0-100 (points)
 * - Readiness indices (EXTENDED): 0-1 (readiness index)
 * - ERRS (risk): 0-100 (derived, inherits state from Executive Summary)
 * - Comments: STATES (not points)
 */

const { THRESHOLDS_VERSION } = require('./feature-flags');

/**
 * Executive Summary (CORE SCORE) thresholds
 * Scale: 0-100
 * States: DOBRY, UMIARKOWANY, PODWYZSZONE_RYZYKO, KRYTYCZNY
 */
const EXECUTIVE_THRESHOLDS = {
    DOBRY: 81,              // 81-100: good (rare maturity level)
    UMIARKOWANY: 51,        // 51-80: moderate (largest natural SME basket)
    PODWYZSZONE_RYZYKO: 31  // 31-50: elevated risk (real systemic gaps)
    // 0-30: critical (lack of management foundations)
};

/**
 * Executive state enum values
 */
const EXECUTIVE_STATES = {
    DOBRY: 'DOBRY',
    UMIARKOWANY: 'UMIARKOWANY',
    PODWYZSZONE_RYZYKO: 'PODWYZSZONE_RYZYKO',
    KRYTYCZNY: 'KRYTYCZNY'
};

/**
 * Executive Summary state descriptions (from PDF specification)
 * Polish descriptions explaining each state's meaning
 */
const EXECUTIVE_DESCRIPTIONS = {
    pl: {
        DOBRY: 'Poziom dojrzałości, który realnie występuje rzadko',
        UMIARKOWANY: 'Największy, naturalny koszyk MŚP',
        PODWYZSZONE_RYZYKO: 'Realne luki systemowe',
        KRYTYCZNY: 'Brak podstaw zarządczych'
    },
    en: {
        DOBRY: 'Maturity level that rarely occurs in practice',
        UMIARKOWANY: 'Largest natural SME basket',
        PODWYZSZONE_RYZYKO: 'Real systemic gaps',
        KRYTYCZNY: 'Lack of management foundations'
    }
};

/**
 * Readiness index thresholds (for all EXTENDED-based indices)
 * Scale: 0-1
 * Same thresholds for: Market Readiness, Org Readiness, Credibility
 */
const READINESS_THRESHOLDS = {
    HIGH: 0.75,   // R >= 0.75: ready/high
    LOW: 0.40     // R < 0.40: not ready/low
    // 0.40 <= R < 0.75: partial/medium
};

/**
 * Readiness state enum values (generic for all 0-1 indices)
 */
const READINESS_STATES = {
    HIGH: 'HIGH',       // R >= 0.75
    PARTIAL: 'PARTIAL', // 0.40 <= R < 0.75
    LOW: 'LOW'          // R < 0.40
};

/**
 * Market Readiness state labels (bank/client context)
 * Source: EXTENDED (X6, X10, X11)
 */
const MARKET_READINESS_LABELS = {
    HIGH: 'GOTOWA',         // firm can respond to bank without chaos
    PARTIAL: 'CZESCIOWA',   // can respond, but manually
    LOW: 'NIEGOTOWA'        // high friction, rejection risk
};

/**
 * Organizational Readiness state labels
 * Source: EXTENDED (X1, X3, X7)
 */
const ORG_READINESS_LABELS = {
    HIGH: 'USTAWIONA',          // decisions can be implemented
    PARTIAL: 'CZESCIOWA',       // point actions only
    LOW: 'NIEUPORZADKOWANA'     // no owners and rhythm
};

/**
 * Credibility/Maturity state labels
 * Source: EXTENDED (X5, X6, X11, X12)
 */
const CREDIBILITY_LABELS = {
    HIGH: 'WYSOKA',     // report can be trusted
    PARTIAL: 'SREDNIA', // picture correct but incomplete
    LOW: 'NISKA'        // indicative result only
};

/**
 * Questions used for each readiness index
 */
const READINESS_QUESTIONS = {
    MARKET: ['x6', 'x10', 'x11'],      // Data and Market Readiness
    ORG: ['x1', 'x3', 'x7'],           // Organizational Readiness
    CREDIBILITY: ['x5', 'x6', 'x11', 'x12']  // Credibility and Maturity
};

/**
 * Get Executive Summary state based on CORE percentage
 *
 * Thresholds (stable, verified):
 * - 81-100: DOBRY (good)
 * - 51-80: UMIARKOWANY (moderate)
 * - 31-50: PODWYZSZONE_RYZYKO (elevated risk)
 * - 0-30: KRYTYCZNY (critical)
 *
 * @param {number} corePercent - CORE score percentage (0-100)
 * @returns {string} Executive state
 */
function getExecutiveState(corePercent) {
    if (corePercent >= EXECUTIVE_THRESHOLDS.DOBRY) {
        return EXECUTIVE_STATES.DOBRY;
    } else if (corePercent >= EXECUTIVE_THRESHOLDS.UMIARKOWANY) {
        return EXECUTIVE_STATES.UMIARKOWANY;
    } else if (corePercent >= EXECUTIVE_THRESHOLDS.PODWYZSZONE_RYZYKO) {
        return EXECUTIVE_STATES.PODWYZSZONE_RYZYKO;
    } else {
        return EXECUTIVE_STATES.KRYTYCZNY;
    }
}

/**
 * Get Executive Summary state label (Polish)
 *
 * @param {string} state - Executive state
 * @returns {string} Polish label
 */
function getExecutiveStateLabel(state) {
    const labels = {
        [EXECUTIVE_STATES.DOBRY]: 'Dobry',
        [EXECUTIVE_STATES.UMIARKOWANY]: 'Umiarkowany',
        [EXECUTIVE_STATES.PODWYZSZONE_RYZYKO]: 'Podwyższone ryzyko',
        [EXECUTIVE_STATES.KRYTYCZNY]: 'Krytyczny'
    };
    return labels[state] || state;
}

/**
 * Get generic readiness state based on R index (0-1)
 *
 * Thresholds (same for all EXTENDED indices):
 * - R >= 0.75: HIGH
 * - 0.40 <= R < 0.75: PARTIAL
 * - R < 0.40: LOW
 *
 * @param {number} R - Readiness index (0-1)
 * @returns {string} Readiness state (HIGH, PARTIAL, LOW)
 */
function getReadinessState(R) {
    if (R >= READINESS_THRESHOLDS.HIGH) {
        return READINESS_STATES.HIGH;
    } else if (R >= READINESS_THRESHOLDS.LOW) {
        return READINESS_STATES.PARTIAL;
    } else {
        return READINESS_STATES.LOW;
    }
}

/**
 * Compute readiness index from EXTENDED answers
 * R = count(TAK answers) / count(total questions)
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @param {string[]} questionIds - Array of question IDs to use
 * @returns {number} Readiness index R in [0, 1]
 */
function computeReadinessIndex(answers, questionIds) {
    if (!questionIds || questionIds.length === 0) {
        return 0;
    }

    let takCount = 0;
    let validCount = 0;

    questionIds.forEach(qId => {
        const answer = answers[qId];
        // Count only answered questions (not null/undefined)
        if (answer !== null && answer !== undefined) {
            validCount++;
            if (answer === 5) { // TAK = 5
                takCount++;
            }
        }
    });

    // If no valid answers, return 0
    if (validCount === 0) {
        return 0;
    }

    return takCount / validCount;
}

/**
 * Compute Market Readiness (bank/client readiness)
 * Source: EXTENDED (X6, X10, X11)
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {Object} { index, state, label }
 */
function computeMarketReadiness(answers) {
    const index = computeReadinessIndex(answers, READINESS_QUESTIONS.MARKET);
    const state = getReadinessState(index);
    const label = MARKET_READINESS_LABELS[state];

    return {
        index: Math.round(index * 100) / 100, // Round to 2 decimal places
        state,
        label,
        questions: READINESS_QUESTIONS.MARKET
    };
}

/**
 * Compute Organizational Readiness
 * Source: EXTENDED (X1, X3, X7)
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {Object} { index, state, label }
 */
function computeOrgReadiness(answers) {
    const index = computeReadinessIndex(answers, READINESS_QUESTIONS.ORG);
    const state = getReadinessState(index);
    const label = ORG_READINESS_LABELS[state];

    return {
        index: Math.round(index * 100) / 100,
        state,
        label,
        questions: READINESS_QUESTIONS.ORG
    };
}

/**
 * Compute Credibility and Maturity
 * Source: EXTENDED (X5, X6, X11, X12)
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {Object} { index, state, label }
 */
function computeCredibility(answers) {
    const index = computeReadinessIndex(answers, READINESS_QUESTIONS.CREDIBILITY);
    const state = getReadinessState(index);
    const label = CREDIBILITY_LABELS[state];

    return {
        index: Math.round(index * 100) / 100,
        state,
        label,
        questions: READINESS_QUESTIONS.CREDIBILITY
    };
}

/**
 * Get Risk state - INHERITED from Executive Summary
 * Rule: Risk state = Executive Summary state
 *
 * @param {number} corePercent - CORE score percentage (0-100)
 * @returns {string} Risk state (same as Executive state)
 */
function getRiskState(corePercent) {
    // Risk state inherits from Executive Summary - single source of truth
    return getExecutiveState(corePercent);
}

/**
 * Compute all readiness indices at once
 *
 * @param {Object} answers - Raw answers { questionId: value }
 * @returns {Object} { marketReadiness, orgReadiness, credibility }
 */
function computeAllReadiness(answers) {
    return {
        marketReadiness: computeMarketReadiness(answers),
        orgReadiness: computeOrgReadiness(answers),
        credibility: computeCredibility(answers)
    };
}

/**
 * Get full state summary for a company
 *
 * @param {number} corePercent - CORE score percentage (0-100)
 * @param {Object} answers - Raw answers for EXTENDED questions
 * @returns {Object} Complete state summary
 */
function getStateSummary(corePercent, answers) {
    const executiveState = getExecutiveState(corePercent);
    const readiness = computeAllReadiness(answers);

    return {
        version: THRESHOLDS_VERSION,
        executive: {
            score: corePercent,
            state: executiveState,
            label: getExecutiveStateLabel(executiveState)
        },
        risk: {
            state: getRiskState(corePercent),
            label: getExecutiveStateLabel(getRiskState(corePercent)),
            note: 'Inherited from Executive Summary'
        },
        marketReadiness: readiness.marketReadiness,
        orgReadiness: readiness.orgReadiness,
        credibility: readiness.credibility
    };
}

module.exports = {
    // Constants
    EXECUTIVE_THRESHOLDS,
    EXECUTIVE_STATES,
    READINESS_THRESHOLDS,
    READINESS_STATES,
    MARKET_READINESS_LABELS,
    ORG_READINESS_LABELS,
    CREDIBILITY_LABELS,
    READINESS_QUESTIONS,

    // Core functions
    getExecutiveState,
    getExecutiveStateLabel,
    getReadinessState,
    getRiskState,

    // Readiness computation
    computeReadinessIndex,
    computeMarketReadiness,
    computeOrgReadiness,
    computeCredibility,
    computeAllReadiness,

    // Summary
    getStateSummary
};
