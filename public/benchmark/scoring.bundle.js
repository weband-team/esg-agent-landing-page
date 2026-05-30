(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ESGScoring = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Comments Module - ESG Report Comment Generation System
 *
 * This module implements the methodology for generating 6 types of comments
 * based on EXTENDED questions (X1-X12) and CORE score.
 *
 * Key concepts:
 * - CORE: Affects SCORE (numerical result) and pillars (E/S/G/SC)
 * - EXTENDED: Does NOT affect SCORE, used only for context and interpretation
 *
 * @module scoring/comments
 */

// Import industry-specific TOP 3 risk comments
let INDUSTRY_TOP_RISKS = {};
try {
    INDUSTRY_TOP_RISKS = require('./industryTopRisks.js').INDUSTRY_TOP_RISKS;
} catch (e) {
    // Fall back to empty object if file not found
    console.warn('industryTopRisks.js not found, using fallback comments');
}

// Import company-type specific PLAN comments
let PLAN_COMMENTS = {};
let getPlanComment = () => null;
let getPlanCommentsForType = () => null;
try {
    const planModule = require('./planComments.js');
    PLAN_COMMENTS = planModule.PLAN_COMMENTS;
    getPlanComment = planModule.getPlanComment;
    getPlanCommentsForType = planModule.getPlanCommentsForType;
} catch (e) {
    console.warn('planComments.js not found, PLAN comments will not be available');
}

// ============================================================================
// SECTION 0: Answer Normalization (per methodology 0.1)
// ============================================================================

/**
 * Normalized answer values according to methodology
 * Different from CORE scoring (which uses 5/3/0)
 * Comments system uses 1.0/0.5/0.0 scale
 */
const NORMALIZED_ANSWER_VALUES = {
    TAK: 1.0,
    W_TRAKCIE: 0.5,
    NIE: 0.0,
    NIE_WIEM: 0.0,      // Treated as 0, optionally set kg flag
    NIE_DOTYCZY: null   // Excluded from calculation (not counted in denominator)
};

/**
 * Normalizes a single answer to the 0-1 scale
 * @param {string} answer - Answer value (TAK, W_TRAKCIE, NIE, NIE_WIEM, NIE_DOTYCZY)
 * @returns {{value: number|null, isNotKnown: boolean}} Normalized value and flag
 */
function normalizeAnswer(answer) {
    const normalizedAnswer = answer?.toUpperCase?.() || answer;

    if (normalizedAnswer === 'NIE_DOTYCZY' || normalizedAnswer === 'N/A') {
        return { value: null, isNotKnown: false, isNotApplicable: true };
    }

    if (normalizedAnswer === 'NIE_WIEM') {
        return { value: 0.0, isNotKnown: true, isNotApplicable: false };
    }

    const value = NORMALIZED_ANSWER_VALUES[normalizedAnswer];
    return {
        value: value !== undefined ? value : 0.0,
        isNotKnown: false,
        isNotApplicable: false
    };
}

/**
 * Calculates gap for a single answer
 * gap_i = 1 - r_i
 * @param {number} normalizedValue - Normalized answer value (0-1)
 * @returns {number} Gap value (0-1)
 */
function calculateGap(normalizedValue) {
    if (normalizedValue === null) return null;
    return 1 - normalizedValue;
}

// ============================================================================
// SECTION 1: Question Groupings for Comments (per methodology)
// ============================================================================

/**
 * EXTENDED question groupings for each comment type
 * Based on the methodology document
 */
const COMMENT_QUESTION_GROUPS = {
    // Comment 1: Executive Summary (CARD_EXEC_SUMMARY - cover page)
    // State determined by CORE SCORE, EXTENDED provides context only
    EXECUTIVE_SUMMARY: {
        extended: ['x2', 'x4', 'x9', 'x10'],
        usesCore: true,  // State from SCORE
        description: 'Strategic interpretation of SCORE',
        anchor: 'CARD_EXEC_SUMMARY'
    },

    // Comment 2A: Data Quality (DATA_QUALITY_NOTE - micro-label on Metrics page)
    DATA: {
        extended: ['x6', 'x10', 'x11'],
        usesCore: false,
        description: 'Data completeness and coherence',
        anchor: 'DATA_QUALITY_NOTE'
    },

    // Comment 2B: Market Readiness (part of Readiness Indices)
    MARKET_READINESS: {
        extended: ['x6', 'x10', 'x11'],
        usesCore: false,
        description: 'Readiness for market questions',
        anchor: 'CARD_READINESS_INDICES'
    },

    // Comment 3: Organizational Readiness (CARD_ESG_ANALYSIS - Readiness Indices page)
    ORG_READINESS: {
        extended: ['x1', 'x3', 'x7'],
        usesCore: false,
        description: 'Internal structure and processes',
        anchor: 'CARD_ESG_ANALYSIS'
    },

    // Comment 4: Priorities and Actions (CARD_ACTION_PLAN - 30/90 plan)
    PRIORITIES: {
        extended: ['x2', 'x4', 'x8', 'x12'],
        usesCore: true,  // CORE used only for gap info, not state
        description: 'Direction and action priorities',
        anchor: 'CARD_ACTION_PLAN'
    },

    // Comment 5: Risks (CARD_EXEC_SUMMARY - cover page, inherits from ES)
    // State INHERITS from Executive Summary
    RISKS: {
        extended: ['x5', 'x8', 'x9', 'x11'],
        usesCore: true,  // Uses largest_pillar_gap flag
        inheritsState: 'EXECUTIVE_SUMMARY',
        description: 'Business, reputation, operational risks',
        anchor: 'CARD_EXEC_SUMMARY'
    },

    // Comment 6: Credibility & Maturity (DEPRECATED - Document verification removed)
    CREDIBILITY: {
        extended: ['x5', 'x6', 'x11', 'x12'],
        usesCore: false,
        description: 'External perception and trust',
        anchor: 'DEPRECATED',
        deprecated: true
    }
};

/**
 * State thresholds for EXTENDED-based comments
 * R >= 0.75 = green, 0.40 <= R < 0.75 = yellow, R < 0.40 = red
 */
const READINESS_THRESHOLDS = {
    HIGH: 0.75,    // R >= 0.75 -> green state
    LOW: 0.40      // R < 0.40 -> red state
};

/**
 * State thresholds for Executive Summary (based on CORE SCORE)
 */
const ES_SCORE_THRESHOLDS = {
    GREEN: { min: 81, max: 100 },
    YELLOW: { min: 51, max: 80 },
    ORANGE: { min: 31, max: 50 },
    CRITICAL: { min: 0, max: 30 }
};

// ============================================================================
// SECTION 2: Readiness Calculation Functions
// ============================================================================

/**
 * Calculates average readiness R(S) for a set of questions
 * R(S) = sum(r_i for applicable questions) / count(applicable questions)
 *
 * @param {Object} answers - Object with question answers {x1: 'TAK', x2: 'NIE', ...}
 * @param {string[]} questionIds - Array of question IDs to include ['x1', 'x3', 'x7']
 * @returns {{readiness: number, gap: number, applicableCount: number, notKnownCount: number}}
 */
function calculateReadiness(answers, questionIds) {
    let sum = 0;
    let applicableCount = 0;
    let notKnownCount = 0;
    const details = [];

    for (const qId of questionIds) {
        const answer = answers[qId];
        const normalized = normalizeAnswer(answer);

        details.push({
            questionId: qId,
            rawAnswer: answer,
            normalizedValue: normalized.value,
            isNotApplicable: normalized.isNotApplicable,
            isNotKnown: normalized.isNotKnown
        });

        // Skip NIE_DOTYCZY questions (null value)
        if (normalized.isNotApplicable || normalized.value === null) {
            continue;
        }

        sum += normalized.value;
        applicableCount++;

        if (normalized.isNotKnown) {
            notKnownCount++;
        }
    }

    // Avoid division by zero
    const readiness = applicableCount > 0 ? sum / applicableCount : 0;
    const gap = 1 - readiness;

    return {
        readiness,          // R(S) - average readiness (0-1)
        gap,                // G(S) = 1 - R(S) - average gap (0-1)
        applicableCount,    // Number of questions counted
        notKnownCount,      // Number of "NIE_WIEM" answers
        totalQuestions: questionIds.length,
        details
    };
}

/**
 * Determines color state based on readiness value (for EXTENDED-based comments)
 * @param {number} readiness - R(S) value (0-1)
 * @returns {string} State: 'green', 'yellow', or 'red'
 */
function getReadinessColorState(readiness) {
    if (readiness >= READINESS_THRESHOLDS.HIGH) {
        return 'green';
    } else if (readiness >= READINESS_THRESHOLDS.LOW) {
        return 'yellow';
    } else {
        return 'red';
    }
}

/**
 * Determines Executive Summary state based on CORE SCORE
 * @param {number} score - CORE SCORE (0-100)
 * @returns {string} State: 'green', 'yellow', 'orange', or 'critical'
 */
function getExecutiveSummaryState(score) {
    if (score >= ES_SCORE_THRESHOLDS.GREEN.min) {
        return 'green';
    } else if (score >= ES_SCORE_THRESHOLDS.YELLOW.min) {
        return 'yellow';
    } else if (score >= ES_SCORE_THRESHOLDS.ORANGE.min) {
        return 'orange';
    } else {
        return 'critical';
    }
}

// ============================================================================
// SECTION 3: Comment State Calculation
// ============================================================================

/**
 * Calculates state for a specific comment type
 * @param {string} commentType - Type from COMMENT_QUESTION_GROUPS
 * @param {Object} answers - All answers including EXTENDED questions
 * @param {number} coreScore - CORE SCORE (0-100)
 * @param {Object} options - Additional options (e.g., largestPillarGap)
 * @returns {Object} Comment state and readiness data
 */
function calculateCommentState(commentType, answers, coreScore, options = {}) {
    const config = COMMENT_QUESTION_GROUPS[commentType];

    if (!config) {
        throw new Error(`Unknown comment type: ${commentType}`);
    }

    // Calculate readiness from EXTENDED questions
    const readinessData = calculateReadiness(answers, config.extended);

    let state;
    let stateSource;

    // Determine state based on comment type rules
    if (commentType === 'EXECUTIVE_SUMMARY') {
        // ES state is determined by CORE SCORE
        state = getExecutiveSummaryState(coreScore);
        stateSource = 'CORE_SCORE';
    } else if (config.inheritsState) {
        // RISKS inherits state from ES
        state = getExecutiveSummaryState(coreScore);
        stateSource = 'INHERITED_FROM_ES';
    } else {
        // Other comments use EXTENDED readiness
        state = getReadinessColorState(readinessData.readiness);
        stateSource = 'EXTENDED_READINESS';
    }

    return {
        commentType,
        state,
        stateSource,
        readiness: readinessData.readiness,
        gap: readinessData.gap,
        applicableCount: readinessData.applicableCount,
        notKnownCount: readinessData.notKnownCount,
        totalQuestions: readinessData.totalQuestions,
        extendedQuestions: config.extended,
        details: readinessData.details,
        description: config.description
    };
}

/**
 * Calculates states for all 6 comment types
 * @param {Object} answers - All answers including EXTENDED questions
 * @param {number} coreScore - CORE SCORE (0-100)
 * @param {Object} options - Additional options
 * @returns {Object} All comment states
 */
function calculateAllCommentStates(answers, coreScore, options = {}) {
    const results = {};

    for (const commentType of Object.keys(COMMENT_QUESTION_GROUPS)) {
        results[commentType] = calculateCommentState(
            commentType,
            answers,
            coreScore,
            options
        );
    }

    return results;
}

// ============================================================================
// SECTION 4: State Labels (for display)
// ============================================================================

/**
 * Human-readable state labels per comment type
 */
const STATE_LABELS = {
    EXECUTIVE_SUMMARY: {
        green: 'Dobry',
        yellow: 'Umiarkowany',
        orange: 'Podwyższone ryzyko',
        critical: 'Krytyczny'
    },
    DATA: {
        green: 'Kompletne',
        yellow: 'Czesciowe',
        red: 'Wstepne'
    },
    MARKET_READINESS: {
        green: 'Dobra',
        yellow: 'Umiarkowana',
        red: 'Wymagajaca wzmocnienia'
    },
    ORG_READINESS: {
        green: 'Dobrze poukladane',
        yellow: 'Czesciowo poukladane',
        red: 'Wymaga uporzadkowania'
    },
    PRIORITIES: {
        // Priorities don't have states, they have phases
        now: 'Teraz',
        next: 'W kolejnym kroku',
        later: 'Pozniej'
    },
    RISKS: {
        // Inherits labels from ES
        green: 'Niskie',
        yellow: 'Umiarkowane',
        orange: 'Podwyższone',
        critical: 'Krytyczne'
    },
    CREDIBILITY: {
        green: 'Wysoka',
        yellow: 'Srednia',
        red: 'Niska'
    }
};

/**
 * Gets human-readable label for a comment state
 * @param {string} commentType - Comment type
 * @param {string} state - State value
 * @returns {string} Human-readable label
 */
function getStateLabel(commentType, state) {
    const labels = STATE_LABELS[commentType];
    return labels?.[state] || state;
}

// ============================================================================
// SECTION 5: Comment Texts (from methodology document)
// ============================================================================

/**
 * Full comment texts for each comment type and state
 * Bilingual: Polish (pl) and English (en)
 */
const COMMENT_TEXTS = {
    // Comment 1: Executive Summary (CARD_EXEC_SUMMARY)
    EXECUTIVE_SUMMARY: {
        green: {
            pl: 'Organizacja funkcjonuje w sposób uporządkowany i przewidywalny w kluczowych obszarach zarządzania. Procesy są spójne, odpowiedzialności jasno określone, a dane pozwalają na świadome podejmowanie decyzji. Działania nie mają charakteru reaktywnego, lecz stanowią element bieżącego modelu zarządzania.\nTaki poziom oznacza stabilność systemową i tworzy solidną podstawę do dalszego rozwoju organizacji.',
            en: 'The organization operates in a structured and predictable manner across key management areas. Processes are consistent, responsibilities clearly defined, and data supports informed decision-making. Activities are not reactive but embedded within the ongoing management model.\nThis level indicates systemic stability and provides a solid foundation for further organizational development.'
        },
        yellow: {
            pl: 'W funkcjonowaniu organizacji widoczne są pierwsze oznaki niespójności lub ograniczonej systematyczności. Część procesów działa poprawnie, jednak nie wszystkie obszary są objęte jednolitym nadzorem lub mierzalnym monitoringiem. Zarządzanie ma charakter częściowo uporządkowany.\nTaki poziom ogranicza pełną przewidywalność działania organizacji i wskazuje na potrzebę większej spójności systemowej.',
            en: 'Initial signs of inconsistency or limited systematic control are visible within the organization. Some processes operate effectively, but not all areas are covered by unified oversight or measurable monitoring. Management practices are only partially structured.\nThis level limits full organizational predictability and indicates the need for greater systemic consistency.'
        },
        orange: {
            pl: 'Organizacja funkcjonuje w sposób niespójny i w dużej mierze reaktywny. Brakuje jednolitego modelu zarządzania, a odpowiedzialności i dane nie są w pełni zintegrowane. Decyzje podejmowane są głównie w odpowiedzi na bieżące wyzwania, bez stabilnej struktury systemowej.\nTaki poziom utrudnia planowanie długofalowe i osłabia przewidywalność funkcjonowania całej organizacji.',
            en: 'The organization operates inconsistently and largely in a reactive manner. There is no unified management framework, and responsibilities and data are not fully integrated. Decisions are primarily made in response to immediate challenges rather than within a stable systemic structure.\nThis level weakens long-term planning capability and reduces overall organizational predictability.'
        },
        critical: {
            pl: 'Organizacja nie posiada spójnego i uporządkowanego modelu zarządzania w kluczowych obszarach działalności. Procesy są rozproszone, odpowiedzialności niejednoznaczne, a dane nie stanowią stabilnej podstawy decyzyjnej. Funkcjonowanie ma charakter incydentalny i reaktywny.\nTaki poziom uniemożliwia świadome zarządzanie organizacją w oparciu o jednolity system oraz znacząco ogranicza stabilność działania.',
            en: 'The organization lacks a coherent and structured management model across key areas of activity. Processes are fragmented, responsibilities unclear, and data does not provide a stable decision-making foundation. Operations are incidental and reactive.\nThis level prevents conscious system-based management and significantly limits operational stability.'
        }
    },

    // Comment 2A: Data (DATA_QUALITY_NOTE on Metrics)
    DATA: {
        green: {
            pl: 'Dane są spójne i wystarczające do wyciągania wiarygodnych wniosków. Można na nich bezpiecznie opierać decyzje i komunikację z rynkiem.',
            en: 'Data is consistent and sufficient for drawing reliable conclusions. Decisions and market communication can be safely based on it.'
        },
        yellow: {
            pl: 'Dane dają ogólny obraz, ale nie zawsze pozwalają na pełną pewność. Wnioski są kierunkowe i warto je traktować jako punkt wyjścia.',
            en: 'Data provides a general picture but does not always allow for full certainty. Conclusions are directional and should be treated as a starting point.'
        },
        red: {
            pl: 'Dane pokazują jedynie zarys sytuacji. Wnioski wymagają ostrożności i dalszego uzupełniania informacji.',
            en: 'Data shows only an outline of the situation. Conclusions require caution and further information gathering.'
        }
    },

    // Comment 2B: Market Readiness (CARD_READINESS_INDICES)
    MARKET_READINESS: {
        green: {
            pl: 'Twoja firma spełnia obecne oczekiwania rynku. Rozmowy z klientami i partnerami mają solidne oparcie w faktach. Łatwiej przechodzisz do kolejnych etapów współpracy.',
            en: 'Your company meets current market expectations. Conversations with clients and partners have solid factual support. You move more easily to the next stages of cooperation.'
        },
        yellow: {
            pl: 'Część oczekiwań rynku jest spełniona, inne wymagają doprecyzowania. Rozmowy są możliwe, ale czasem wymagają dodatkowych wyjaśnień. Kilka usprawnień może znacząco poprawić płynność kontaktów.',
            en: 'Some market expectations are met, others require clarification. Conversations are possible but sometimes require additional explanations. A few improvements can significantly improve contact flow.'
        },
        red: {
            pl: 'Rynek stawia wymagania, których dziś nie zawsze możesz jasno spełnić. To utrudnia rozmowy i wydłuża procesy decyzyjne. Wzmocnienie wybranych obszarów poprawia Twoją pozycję negocjacyjną.',
            en: 'The market sets requirements that you cannot always clearly meet today. This hinders conversations and lengthens decision-making processes. Strengthening selected areas improves your negotiating position.'
        }
    },

    // Comment 3: Organizational Readiness (CARD_ESG_ANALYSIS)
    ORG_READINESS: {
        green: {
            pl: 'W Twojej firmie widać jasny podział odpowiedzialności i logiczny sposób działania. Wiadomo, kto za co odpowiada i jak podejmowane są decyzje. To ułatwia codzienną pracę i zmniejsza zależność od "gaszenia pożarów". Dalsze kroki mogą dotyczyć jedynie dopracowania szczegółów.',
            en: 'Your company shows a clear division of responsibilities and logical way of operating. It is clear who is responsible for what and how decisions are made. This facilitates daily work and reduces dependence on "firefighting". Further steps may only involve refining details.'
        },
        yellow: {
            pl: 'Część procesów działa sprawnie, inne opierają się bardziej na doświadczeniu ludzi niż na ustalonych zasadach. Na co dzień to wystarcza, ale przy większej skali lub presji może generować chaos. Raport pokazuje, które elementy warto ustabilizować w pierwszej kolejności.',
            en: 'Some processes work efficiently, others rely more on people\'s experience than on established rules. On a daily basis this is sufficient, but at larger scale or under pressure it can generate chaos. The report shows which elements are worth stabilizing first.'
        },
        red: {
            pl: 'Sposób działania firmy nie zawsze jest czytelny nawet wewnątrz zespołu. To zwiększa obciążenie operacyjne i utrudnia przewidywanie efektów. Uporządkowanie odpowiedzialności i procesów przynosi szybką ulgę w codziennej pracy.',
            en: 'The company\'s way of operating is not always clear even within the team. This increases operational burden and makes it difficult to predict outcomes. Organizing responsibilities and processes brings quick relief in daily work.'
        }
    },

    // Comment 4: Priorities phases (CARD_ACTION_PLAN - 30/90 plan)
    PRIORITIES: {
        now: {
            pl: 'To działania, które najszybciej poprawiają klarowność i spokój w rozmowach. Ich wykonanie od razu zmniejsza liczbę pytań i niepewności.',
            en: 'These are actions that will most quickly improve clarity and calm in conversations. Their completion immediately reduces questions and uncertainty.'
        },
        next: {
            pl: 'Te elementy wzmacniają całość, gdy pierwsze rzeczy są już gotowe. Pomagają utrzymać porządek i przewidywalność w dłuższym czasie.',
            en: 'These elements strengthen the whole when the first things are already done. They help maintain order and predictability over time.'
        },
        later: {
            pl: 'To działania rozwojowe, które przygotowują firmę na przyszłe wymagania. Nie są pilne i możesz wrócić do nich wtedy, gdy będziesz mieć przestrzeń.',
            en: 'These are developmental actions that prepare the company for future requirements. They are not urgent and you can return to them when you have space.'
        }
    },

    // Comment 5: Risks (CARD_EXEC_SUMMARY) - inherits state from ES
    RISKS: {
        green: {
            pl: 'Ryzyka wynikają głównie z naturalnej złożoności działalności i zmieniających się oczekiwań rynku. Na tym etapie nie wpływają one negatywnie na codzienne funkcjonowanie firmy. Masz przestrzeń, żeby reagować spokojnie i z wyprzedzeniem.',
            en: 'Risks arise mainly from the natural complexity of operations and changing market expectations. At this stage, they do not negatively affect the company\'s daily functioning. You have space to react calmly and in advance.'
        },
        yellow: {
            pl: 'Ryzyka pojawiają się tam, gdzie informacje nie są jeszcze w pełni spójne lub jednoznaczne. Nie blokują działań, ale mogą generować dodatkowe pytania lub wydłużać procesy. Ich identyfikacja pozwala Ci zdecydować, co doprecyzować w pierwszej kolejności.',
            en: 'Risks appear where information is not yet fully consistent or unambiguous. They do not block actions but may generate additional questions or lengthen processes. Their identification allows you to decide what to clarify first.'
        },
        orange: {
            pl: 'Ryzyka wynikają głównie z braków w czytelności i powtarzalności informacji. Zaczynają wpływać na tempo rozmów i decyzji po stronie klientów lub partnerów. Działania naprawcze są możliwe i jasno wskazane w raporcie.',
            en: 'Risks arise mainly from gaps in clarity and repeatability of information. They begin to affect the pace of conversations and decisions on the part of clients or partners. Corrective actions are possible and clearly indicated in the report.'
        },
        critical: {
            pl: 'Ryzyka mają charakter blokujący - utrudniają przechodzenie do kolejnych etapów rozmów. Nie wynikają z jednego błędu, ale z nagromadzenia niejasności. Uporządkowanie kluczowych obszarów znacząco zmniejsza ten efekt.',
            en: 'Risks are blocking in nature - they hinder progression to further stages of conversations. They do not result from a single error but from accumulated ambiguities. Organizing key areas significantly reduces this effect.'
        }
    },

    // Comment 6: Credibility (DEPRECATED - Document verification removed)
    CREDIBILITY: {
        green: {
            pl: 'Z zewnątrz Twoja firma wygląda na stabilną i przewidywalną. Informacje są spójne, a deklaracje mają pokrycie w działaniach. To buduje zaufanie i skraca dystans w relacjach biznesowych.',
            en: 'From the outside, your company looks stable and predictable. Information is consistent and declarations are backed by actions. This builds trust and shortens distance in business relationships.'
        },
        yellow: {
            pl: 'Firma budzi zainteresowanie, ale czasem wymaga dodatkowych wyjaśnień. Zaufanie jest możliwe, choć nie zawsze natychmiastowe. Kilka doprecyzowań może znacząco wzmocnić odbiór.',
            en: 'The company generates interest but sometimes requires additional explanations. Trust is possible, though not always immediate. A few clarifications can significantly strengthen perception.'
        },
        red: {
            pl: 'Z zewnątrz trudno szybko zrozumieć, jak firma działa i czego się po niej spodziewać. To osłabia zaufanie, nawet jeśli intencje są dobre. Uporządkowanie komunikacji poprawia ten obraz.',
            en: 'From the outside, it is difficult to quickly understand how the company operates and what to expect from it. This weakens trust, even if intentions are good. Organizing communication improves this image.'
        }
    },

    // TOP 3 Risk Comments - Business Risk (Ryzyko Biznesowe)
    // These comments are used for each TOP 3 area to describe business impact
    TOP3_BUSINESS_RISK: {
        green: {
            pl: 'Ryzyko dotyczy prostych pytań, które coraz częściej pojawiają się w ofertach i mailach od klientów. Są to pytania typu: „Czy firma ma jakiekolwiek zasady dotyczące ochrony środowiska lub pracowników?", „Czy możecie przesłać dokument opisujący podejście firmy do ESG?", „Kto odpowiada w firmie za te kwestie?" Na tym etapie brak takich dokumentów nie blokuje sprzedaży, ale powoduje, że musisz każdorazowo tłumaczyć się mailowo lub telefonicznie. Uporządkowanie tych podstaw pozwala odpowiadać szybko i bez nerwów.',
            en: 'Risk concerns simple questions that increasingly appear in offers and emails from clients. These are questions like: "Does the company have any policies regarding environmental protection or workers?", "Can you send a document describing the company\'s approach to ESG?", "Who is responsible for these issues in the company?" At this stage, the lack of such documents does not block sales, but it means you have to explain yourself each time by email or phone. Organizing these basics allows you to respond quickly and without stress.'
        },
        yellow: {
            pl: 'Ryzyko pojawia się w momencie, gdy klienci proszą o konkretne potwierdzenia na piśmie. Najczęściej są to pytania: „Czy posiadacie politykę środowiskową lub społeczną?", „Czy te zasady są oficjalnie przyjęte w firmie?", „Czy możecie wskazać osobę odpowiedzialną za ESG?" Brak jednoznacznych odpowiedzi powoduje: dodatkowe rundy pytań, opóźnienia w decyzjach, czasem wykluczenie z dalszego etapu rozmów. Raport pokazuje dokładnie, których elementów brakuje, żeby to zamknąć.',
            en: 'Risk appears when clients ask for specific written confirmations. Most often these are questions: "Do you have an environmental or social policy?", "Are these rules officially adopted in the company?", "Can you indicate the person responsible for ESG?" The lack of clear answers causes: additional rounds of questions, delays in decisions, sometimes exclusion from further stages of conversations. The report shows exactly which elements are missing to close this.'
        },
        critical: {
            pl: 'Ryzyko polega na braku dokumentów i danych, o które wprost pytają klienci, banki lub organizatorzy przetargów. Są to m.in. pytania: „Prosimy o przesłanie polityki ESG / środowiskowej / społecznej.", „Czy firma monitoruje zużycie energii lub emisje?", „Czy posiadają Państwo procedury BHP lub reagowania na incydenty?" Brak tych elementów blokuje przejście do kolejnego etapu rozmów, niezależnie od jakości oferty. Uporządkowanie tych obszarów usuwa barierę wejścia do rozmów.',
            en: 'Risk consists of the lack of documents and data that clients, banks or tender organizers directly ask for. These include questions: "Please send ESG / environmental / social policy.", "Does the company monitor energy consumption or emissions?", "Do you have OHS procedures or incident response?" The lack of these elements blocks the transition to the next stage of conversations, regardless of the quality of the offer. Organizing these areas removes the barrier to entry into conversations.'
        }
    },

    // TOP 3 Risk Comments - Reputation Risk (Ryzyko Reputacyjne)
    TOP3_REPUTATION_RISK: {
        green: {
            pl: 'Ryzyko reputacyjne dotyczy tego, jak czytelnie Twoja firma wygląda dla osób z zewnątrz. Na tym etapie jesteście postrzegani jako firma przewidywalna i uporządkowana. W rozmowach mogą pojawiać się pytania orientacyjne, np.: „Jak podchodzicie do kwestii środowiskowych lub społecznych?", „Czy macie to gdzieś opisane?", „Kto u Was zajmuje się tym tematem?" Brak formalnych dokumentów nie budzi nieufności i nie wpływa na ocenę Twojej firmy. Otoczenie zakłada, że działacie standardowo jak firmy o podobnej skali. Uporządkowanie podstawowych informacji ma tu charakter wzmacniający, a nie „ratunkowy" - reputacja Twojej firmy nie jest obecnie zagrożona.',
            en: 'Reputation risk concerns how clearly your company looks to outsiders. At this stage, you are perceived as a predictable and organized company. In conversations, orientation questions may appear, such as: "How do you approach environmental or social issues?", "Do you have this described somewhere?", "Who deals with this topic at your place?" The lack of formal documents does not arouse distrust and does not affect the assessment of your company. The environment assumes that you operate as standard as companies of similar scale. Organizing basic information here has a strengthening character, not a "rescue" one - your company\'s reputation is not currently threatened.'
        },
        yellow: {
            pl: 'Ryzyko reputacyjne pojawia się wtedy, gdy obraz Twojej firmy przestaje być jednoznaczny. Po stronie klienta lub partnera różne osoby mogą różnie interpretować, jak działacie. Najczęściej pojawiają się pytania typu: „Czy macie oficjalne zasady, czy to raczej deklaracje?", „Czy te informacje są aktualne i obowiązujące?", „Czy to podejście faktycznie działa w całej firmie, czy tylko punktowo?" Brak jasnych punktów odniesienia powoduje: ostrożniejszą ocenę Twojej firmy, wahanie zaufania, dodatkowe rundy pytań i konieczność doprecyzowań. Nie oznacza to, że jesteście oceniani negatywnie - ale nie jesteście też w pełni „czytelni". Raport wskazuje, które elementy warto doprecyzować, żeby zamknąć pole do domysłów.',
            en: 'Reputation risk appears when the image of your company ceases to be unambiguous. On the client or partner side, different people may interpret how you operate differently. Most often, questions such as: "Do you have official rules or are they rather declarations?", "Is this information current and binding?", "Does this approach actually work throughout the company, or only in some areas?" The lack of clear reference points causes: more cautious assessment of your company, hesitation of trust, additional rounds of questions and the need for clarifications. This does not mean that you are assessed negatively - but you are not fully "readable" either. The report indicates which elements are worth clarifying to close the field for speculation.'
        },
        critical: {
            pl: 'Ryzyko reputacyjne polega na tym, że Twoja firma jest trudna do jednoznacznej oceny dla klientów, partnerów lub instytucji. Pojawiają się wprost wątpliwości, np.: „Na jakiej podstawie mamy przyjąć, że te kwestie są u Was pod kontrolą?", „Czy to są realne zasady, czy tylko ogólne deklaracje?", „Czy macie kogoś odpowiedzialnego i czy da się to potwierdzić?" Gdy brakuje spójnych informacji: Twoja firma bywa oceniana ostrożniej niż konkurencja, decyzje po drugiej stronie zapadają wolniej, reputacja nie pomaga w rozmowach, a czasem je utrudnia. To nie jest zarzut ani „audyt". To sytuacja, w której brakuje punktów odniesienia, które pozwalają zaufać Twojej firmie bez dodatkowych domysłów. Uporządkowanie kluczowych elementów odbudowuje wiarygodność i czytelność, co bezpośrednio poprawia odbiór Twojej firmy w relacjach biznesowych.',
            en: 'Reputation risk consists in the fact that your company is difficult to unambiguously assess for clients, partners or institutions. Doubts appear directly, such as: "On what basis should we assume that these issues are under your control?", "Are these real rules or just general declarations?", "Do you have someone responsible and can this be confirmed?" When there is a lack of consistent information: Your company is sometimes assessed more cautiously than the competition, decisions on the other side are made more slowly, reputation does not help in conversations, and sometimes hinders them. This is not an accusation or "audit". This is a situation where there is a lack of reference points that allow trusting your company without additional speculation. Organizing key elements rebuilds credibility and readability, which directly improves the perception of your company in business relations.'
        }
    },

    // TOP 3 Risk Comments - Operational Risk (Ryzyko Operacyjne)
    TOP3_OPERATIONAL_RISK: {
        green: {
            pl: 'Ryzyko operacyjne dotyczy tego, czy w Twojej firmie wiadomo, co robić w typowych i nietypowych sytuacjach. Na tym etapie podstawowe mechanizmy działania są jasne i funkcjonują w praktyce. W codziennym działaniu rzadko pojawiają się pytania typu: „Kto odpowiada za ten obszar?", „Jak wygląda procedura w razie incydentu?", „Czy pracownicy wiedzą, jak zareagować?" Nawet jeśli nie wszystkie zasady są szczegółowo opisane, firma działa w sposób przewidywalny, a decyzje są podejmowane bez chaosu. Ryzyko operacyjne nie wpływa na ciągłość pracy ani bezpieczeństwo zespołu. Dalsze porządkowanie ma charakter usprawniający, a nie naprawczy.',
            en: 'Operational risk concerns whether your company knows what to do in typical and unusual situations. At this stage, basic operating mechanisms are clear and function in practice. In daily operations, questions such as: "Who is responsible for this area?", "What is the procedure in case of an incident?", "Do employees know how to react?" rarely appear. Even if not all rules are described in detail, the company operates in a predictable way, and decisions are made without chaos. Operational risk does not affect work continuity or team safety. Further organization has a streamlining character, not a corrective one.'
        },
        yellow: {
            pl: 'Ryzyko operacyjne pojawia się wtedy, gdy nie wszystkie zasady działania są jednakowo jasne dla pracowników lub kadry zarządzającej. W praktyce mogą pojawiać się sytuacje, w których: reakcja na zdarzenie zależy od konkretnej osoby, procedury istnieją, ale nie wszyscy je znają lub stosują, szkolenia są realizowane nieregularnie lub wybiórczo. Najczęstsze sygnały to: pytania „co w tej sytuacji robimy?", potrzeba każdorazowego ustalania odpowiedzialności, opóźnienia w reagowaniu na problemy organizacyjne lub BHP. Nie oznacza to, że firma działa niebezpiecznie, ale część procesów nie jest jeszcze wystarczająco utrwalona. Raport pokazuje, które obszary warto uporządkować, aby ograniczyć zależność od improwizacji i pojedynczych osób.',
            en: 'Operational risk appears when not all operating rules are equally clear to employees or management. In practice, situations may arise in which: reaction to an event depends on a specific person, procedures exist but not everyone knows or follows them, training is carried out irregularly or selectively. The most common signals are: questions "what do we do in this situation?", the need to establish responsibility each time, delays in responding to organizational or OHS problems. This does not mean that the company operates unsafely, but some processes are not yet sufficiently established. The report shows which areas are worth organizing to reduce dependence on improvisation and individual people.'
        },
        critical: {
            pl: 'Ryzyko operacyjne polega na tym, że w kluczowych momentach firma nie ma jasnego sposobu działania lub nie jest on znany pracownikom. W praktyce objawia się to pytaniami lub sytuacjami typu: „Nie wiadomo, kto powinien się tym zająć.", „Nie ma jasnej procedury lub nikt jej nie zna.", „Reakcja zależy od tego, kto akurat jest na miejscu." Braki w obszarach takich jak: BHP, szkolenia, reagowanie na incydenty, procedury skargowe lub etyczne, odpowiedzialność za kluczowe procesy powodują, że: decyzje są opóźnione, pracownicy działają zachowawczo lub chaotycznie, ryzyko błędów i przestojów rośnie. To nie jest ocena intencji ani kultury firmy. To sygnał, że brakuje operacyjnych punktów odniesienia, które pozwalają działać spokojnie i powtarzalnie. Uporządkowanie tych obszarów stabilizuje codzienne funkcjonowanie firmy i zmniejsza ryzyko problemów w sytuacjach stresowych lub nagłych.',
            en: 'Operational risk consists in the fact that at key moments the company does not have a clear way of operating or it is not known to employees. In practice, this manifests as questions or situations like: "It is not known who should deal with this.", "There is no clear procedure or nobody knows it.", "The reaction depends on who is currently on site." Deficiencies in areas such as: OHS, training, incident response, complaint or ethical procedures, responsibility for key processes cause: decisions are delayed, employees act conservatively or chaotically, the risk of errors and downtime increases. This is not an assessment of intentions or company culture. This is a signal that there is a lack of operational reference points that allow acting calmly and repeatably. Organizing these areas stabilizes the company\'s daily functioning and reduces the risk of problems in stressful or emergency situations.'
        }
    },

    // ============================================================================
    // HORIZON COMMENTS (30/90 days) - Layer 2 (independent of ES color)
    // ============================================================================

    // 30 days - "Setting up foundations and ending chaos"
    HORIZON_30: {
        title: {
            pl: '30 dni — "Ustawiamy podstawy i kończymy chaos"',
            en: '30 days — "Setting up foundations and ending chaos"'
        },
        description: {
            pl: 'To najszybciej skraca wymianę maili, odblokowuje rozmowy i eliminuje "wstydliwe luki", które powodują dopytywanie.',
            en: 'This most quickly shortens email exchanges, unblocks conversations, and eliminates "embarrassing gaps" that cause follow-up questions.'
        },
        actions: {
            pl: [
                'Zbierz „pakiet odpowiedzi" w jednym miejscu dla TOP 3 ryzyk. W jednym folderze trzymaj dokumenty, przypisane osoby oraz proste potwierdzenia działań.',
                'Wyznacz osobę odpowiedzialną za temat i ustal stały rytm pracy nad TOP 3 ryzykami. Raz w tygodniu (15–30 min) sprawdźcie, co domykacie w tym tygodniu (1–3 konkretne rzeczy z TOP 3 ryzyk), co Was zatrzymuje i co trzeba odświeżyć.',
                'Domknij minimum dla TOP 3 ryzyk: zasada, sposób działania, dowód. Przy każdym ryzyku miej krótko opisane „jak działamy" oraz ślad, że to faktycznie robicie (np. rejestr, lista, protokół).',
                'Usuń sprzeczności w materiałach dotyczących TOP 3 ryzyk. Zostaw jedną obowiązującą wersję, uporządkuj nazwy i daty, dopisz właściciela przy każdym dokumencie.'
            ],
            en: [
                'Collect a "response package" in one place for TOP 3 risks. Keep documents, assigned people, and simple action confirmations in one folder.',
                'Designate a responsible person and establish a steady work rhythm for TOP 3 risks. Once a week (15-30 min), check what you\'re closing this week (1-3 specific things from TOP 3 risks), what\'s blocking you, and what needs refreshing.',
                'Close the minimum for TOP 3 risks: rule, way of working, evidence. For each risk, have a brief description of "how we operate" and a trace that you actually do it (e.g., register, list, protocol).',
                'Remove contradictions in materials related to TOP 3 risks. Leave one binding version, organize names and dates, add an owner to each document.'
            ]
        },
        expectedResult: {
            pl: 'Klient powinien móc powiedzieć „tak" na większość pytań kontrolnych i pokazać 1–2 dowody (np. rejestr szkolenia, opis kanału zgłoszeń, 1 strona zasad współpracy z dostawcami).',
            en: 'Client should be able to say "yes" to most control questions and show 1-2 pieces of evidence (e.g., training register, description of reporting channel, 1 page of supplier cooperation rules).'
        }
    },

    // 90 days - "Making it a process, not a one-time action"
    HORIZON_90: {
        title: {
            pl: '90 dni — "Robimy z tego proces, nie jednorazową akcję"',
            en: '90 days — "Making it a process, not a one-time action"'
        },
        description: {
            pl: 'Na tym etapie najczęstszy problem to "da się odpowiedzieć, ale zawsze trwa to za długo", a to realnie wydłuża decyzje i obniża wiarygodność.',
            en: 'At this stage, the most common problem is "you can respond, but it always takes too long", and this actually prolongs decisions and reduces credibility.'
        },
        actions: {
            pl: [
                'Ustal jasny sposób pracy z danymi i dokumentami: kto zbiera i aktualizuje informacje, kto je zatwierdza, gdzie trzymacie pliki i jak oznaczacie wersje, żeby nie było kilku "prawd" naraz.',
                'Wprowadź proste rejestry, które pokazują, że temat działa w praktyce: szkolenia, zgłoszenia/incydenty, działania naprawcze oraz podstawowa ocena kluczowych dostawców. Wystarczy prosta tabela, ale aktualna.',
                'Wybierz 5–10 prostych wskaźników, które mają sens w Waszej firmie, i dopisz krótką definicję "jak liczymy". Dzięki temu każdy liczy to samo i nie ma rozjazdów między działami.',
                'Zrób próbę generalną: jedno pytanie z zewnątrz przeprowadźcie od początku do końca tak, jakby to był realny klient. Cel: w 24–48 godzin udzielić odpowiedzi i dołączyć konkretny dowód (link, rejestr, dokument), bez nerwowego szukania po firmie.'
            ],
            en: [
                'Establish a clear way of working with data and documents: who collects and updates information, who approves it, where you keep files and how you mark versions, so there are not several "truths" at once.',
                'Introduce simple registers that show the topic works in practice: training, reports/incidents, corrective actions, and basic assessment of key suppliers. A simple table is enough, but it must be current.',
                'Choose 5-10 simple indicators that make sense in your company, and add a short definition of "how we count". This way everyone counts the same and there are no discrepancies between departments.',
                'Do a dress rehearsal: take one external question through from start to finish as if it were a real client. Goal: respond within 24-48 hours and attach specific evidence (link, register, document), without nervously searching around the company.'
            ]
        },
        expectedResult: {
            pl: 'Firma nie tylko ma dokumenty, ale ma powtarzalność + dowody, że system działa.',
            en: 'The company not only has documents, but has repeatability + evidence that the system works.'
        }
    },

    // ============================================================================
    // CONTROL QUESTIONS for each horizon
    // ============================================================================

    CONTROL_QUESTIONS_30: {
        pl: [
            'Czy mamy jedną osobę, która odpowiada za spójność działań i odpowiedzi na zewnątrz (wraz z zastępstwem)?',
            'Czy mamy spisane podstawowe zasady: etyka działania, warunki pracy i bezpieczeństwo oraz sposób zgłaszania problemów?',
            'Czy ludzie wiedzą, gdzie zgłaszać problemy i czy mogą to zrobić bez obaw (również anonimowo)?',
            'Czy mamy minimum działań BHP: szkolenia/ratownicy/procedury awaryjne i zapis, że to działa (rejestr)?',
            'Czy od kluczowych dostawców wymagamy minimum standardu (chociaż w formie krótkiego oświadczenia / wymagań współpracy)?'
        ],
        en: [
            'Do we have one person responsible for consistency of actions and external responses (with a backup)?',
            'Do we have written basic rules: ethics of operation, working conditions and safety, and how to report problems?',
            'Do people know where to report problems and can they do so without fear (also anonymously)?',
            'Do we have minimum OHS activities: training/first aiders/emergency procedures and records that it works (register)?',
            'Do we require a minimum standard from key suppliers (even in the form of a short statement / cooperation requirements)?'
        ]
    },

    CONTROL_QUESTIONS_90: {
        pl: [
            'Czy przeprowadziliśmy szkolenie pracowników z zasad postępowania / bezpieczeństwa / zgłaszania problemów (i mamy listę / potwierdzenie)?',
            'Czy mechanizm zgłoszeń ma jasno opisaną obsługę: kto przyjmuje, w jakim czasie, jak dokumentujemy, jak chronimy zgłaszającego?',
            'Czy mamy spójny opis łańcucha współpracy: ilu mamy bezpośrednich dostawców i ilu zostało "sprawdzonych" minimalnie pod kątem ryzyk?',
            'Czy mamy podstawowe dane operacyjne do udzielenia odpowiedzi (np. zużycie energii/wody/odpady – jeśli dotyczy) i wiemy, kto je zbiera?',
            'Czy mamy proces reagowania na incydenty (BHP/etyka/środowisko), a nie tylko "doraźne gaszenie"?'
        ],
        en: [
            'Have we conducted employee training on rules of conduct / safety / reporting problems (and do we have a list / confirmation)?',
            'Does the reporting mechanism have clearly described handling: who receives, in what time, how we document, how we protect the reporter?',
            'Do we have a consistent description of the cooperation chain: how many direct suppliers do we have and how many have been "checked" minimally for risks?',
            'Do we have basic operational data to provide answers (e.g., energy/water consumption/waste - if applicable) and do we know who collects it?',
            'Do we have an incident response process (OHS/ethics/environment), not just "ad hoc firefighting"?'
        ]
    },


    // ============================================================================
    // DATA Quality Comments (Section 3A)
    // ============================================================================

    DATA_QUALITY: {
        green: {
            label: { pl: 'Kompletne', en: 'Complete' },
            pl: 'Dane są poukładane i wystarczające, żeby wyciągać wiarygodne wnioski. Możecie na nich spokojnie opierać decyzje oraz komunikację na zewnątrz (np. z bankiem/leasingiem lub dużym klientem w przetargu), bez ryzyka rozjazdów i dopytań o sprzeczności.',
            en: 'Data is organized and sufficient to draw reliable conclusions. You can confidently base decisions and external communication on it (e.g., with bank/leasing or large client in tender), without risk of discrepancies and questions about contradictions.'
        },
        yellow: {
            label: { pl: 'Częściowe', en: 'Partial' },
            pl: 'Dane są częściowe: pozwalają ocenić sytuację i wskazać obszary do poprawy, ale nie wystarczają do jednoznacznych wniosków ani twardych liczb. Przed przekazywaniem informacji na zewnątrz (np. bank/leasing, duży klient/przetarg) warto uzupełnić brakujące dane, żeby uniknąć dopytań i cofania rozmów.',
            en: 'Data is partial: allows assessing the situation and identifying areas for improvement, but is not sufficient for unambiguous conclusions or hard numbers. Before passing information externally (e.g., bank/leasing, large client/tender), it\'s worth completing missing data to avoid follow-up questions and backtracking conversations.'
        },
        red: {
            label: { pl: 'Wstępne', en: 'Preliminary' },
            pl: 'Dane są na wczesnym etapie: brakuje spójności, ciągłości i potwierdzeń, więc wnioski są obarczone wysokim ryzykiem błędu. Zanim będzie można bezpiecznie odpowiadać bankowi/leasingowi lub dużym klientom w przetargach, trzeba najpierw zebrać podstawowe informacje w jednym miejscu, ustalić właścicieli danych i wprowadzić prosty sposób aktualizacji.',
            en: 'Data is at an early stage: lacks consistency, continuity and confirmations, so conclusions carry high risk of error. Before you can safely respond to bank/leasing or large clients in tenders, you first need to collect basic information in one place, establish data owners and introduce a simple update method.'
        }
    },

    // ============================================================================
    // MARKET READINESS Comments (Section 3B)
    // ============================================================================

    MARKET_READINESS_EXTENDED: {
        green: {
            label: { pl: 'Dobra', en: 'Good' },
            pl: 'Twoja firma spełnia obecne oczekiwania rynku. W rozmowach z klientami i partnerami opierasz się na sprawdzonych informacjach, więc jest mniej dopytań i łatwiej przechodzisz do kolejnych etapów współpracy.',
            en: 'Your company meets current market expectations. In conversations with clients and partners, you rely on verified information, so there are fewer follow-up questions and you move more easily to the next stages of cooperation.'
        },
        yellow: {
            label: { pl: 'Umiarkowana', en: 'Moderate' },
            pl: 'Część oczekiwań rynku spełniacie już dziś, a część wymaga doprecyzowania i domknięcia. Rozmowy z klientami i partnerami są możliwe, ale czasem wracają dodatkowe pytania i trzeba dosyłać uzupełnienia. Kilka usprawnień (porządek w dokumentach, spójne dane, jasne odpowiedzialności) wyraźnie przyspieszy kontakt i przechodzenie do kolejnych etapów współpracy.',
            en: 'Some market expectations are already met today, some require clarification and completion. Conversations with clients and partners are possible, but sometimes additional questions come back and supplements need to be sent. A few improvements (order in documents, consistent data, clear responsibilities) will clearly speed up contact and transition to the next stages of cooperation.'
        },
        red: {
            label: { pl: 'Wymagająca wzmocnienia', en: 'Needs strengthening' },
            pl: 'Rynek oczekuje dziś rzeczy, których nie zawsze da się u Was szybko i jednoznacznie pokazać. To utrudnia rozmowy z klientami i partnerami oraz wydłuża decyzje (pojawiają się dopytania i prośby o uzupełnienia). Uporządkowanie kilku obszarów wzmacnia Waszą pozycję negocjacyjną i ułatwia przechodzenie do kolejnych etapów współpracy.',
            en: 'The market expects things today that cannot always be quickly and unambiguously shown at your company. This hinders conversations with clients and partners and prolongs decisions (follow-up questions and requests for supplements appear). Organizing a few areas strengthens your negotiating position and makes it easier to move to the next stages of cooperation.'
        }
    },

    // ============================================================================
    // MATERIALITY (MS) Comments - per pillar importance
    // ============================================================================

    MATERIALITY: {
        critical: {
            label: { pl: 'Priorytet Strategiczny / Krytyczna Ekspozycja', en: 'Strategic Priority / Critical Exposure' },
            threshold: 81,
            pl: 'Filar o czerwonej barwie jest w Twojej branży kluczowy, bo to właśnie w tym obszarze banki, leasingodawcy i najwięksi klienci najczęściej sprawdzają, czy firma jest przewidywalna i dobrze zarządzana. W praktyce padają tu trzy podstawowe pytania: kto jest za to odpowiedzialny, jak firma działa w tym temacie na co dzień oraz czy są dowody, że to nie są tylko deklaracje. Dlatego braki w tym filarze są zwykle traktowane jako ryzyko wysokiej wagi, nawet jeśli firma operacyjnie działa poprawnie.',
            en: 'The red pillar is key in your industry because this is the area where banks, lessors and largest clients most often check whether the company is predictable and well-managed. In practice, three basic questions arise here: who is responsible for this, how the company operates in this topic daily, and whether there is evidence that these are not just declarations. Therefore, gaps in this pillar are usually treated as high-weight risk, even if the company operates correctly operationally.'
        },
        high: {
            label: { pl: 'Istotny Wpływ Operacyjny', en: 'Significant Operational Impact' },
            threshold: 46,
            pl: 'Filar o pomarańczowej barwie ma w Twojej branży duże znaczenie dla sprawności działania firmy i tego, jak jesteś oceniany w przetargach oraz w rozmowach o finansowaniu. To nie zawsze jest ryzyko „na już", ale dojrzałość w tym obszarze często decyduje o tym, czy przechodzisz dalej bez dodatkowych pytań i dodatkowych warunków. Uporządkowanie tego filaru daje praktyczną przewagę i zmniejsza tarcie w łańcuchu współpracy.',
            en: 'The orange pillar has great importance in your industry for the company\'s operational efficiency and how you are assessed in tenders and financing conversations. It\'s not always an immediate risk, but maturity in this area often determines whether you proceed without follow-up questions and additional conditions. Organizing this pillar gives practical advantage and reduces friction in the cooperation chain.'
        },
        moderate: {
            label: { pl: 'Standardowa Odpowiedzialność', en: 'Standard Responsibility' },
            threshold: 0,
            pl: 'Filar o zielonej barwie ma w Twojej branży umiarkowane znaczenie i zwykle nie jest pierwszym powodem dodatkowych pytań ze strony rynku. Wystarczy utrzymać podstawowy porządek i minimum praktyk, żeby temat był "zamknięty" i nie wracał w rozmowach. Warto traktować to jako element budowania stabilnego wizerunku i kultury działania firmy, ale bez presji natychmiastowych zmian.',
            en: 'The green pillar has moderate importance in your industry and is usually not the first reason for additional questions from the market. It\'s enough to maintain basic order and minimum practices for the topic to be "closed" and not come back in conversations. It\'s worth treating this as an element of building a stable image and company culture, but without pressure for immediate changes.'
        }
    }
};

// ============================================================================
// SECTION: Industry Comments (32 texts - for Detailed Pillar Results)
// Source: INDUSTRY COMMENTARY GLOSSARY.pdf
// Structure: industry_id → pillar → { pl, en }
// ============================================================================

const INDUSTRY_COMMENTS = {
    construction: {
        E: {
            pl: 'W budownictwie istotne znaczenie ma wpływ inwestycji na środowisko na każdym etapie realizacji — od przygotowania terenu po oddanie obiektu do użytkowania. Branża charakteryzuje się wysokim zużyciem surowców, energii oraz znaczną ilością odpadów budowlanych i rozbiórkowych. Kluczowe obszary obejmują gospodarkę odpadami, kontrolę emisji i pyłów na placu budowy, efektywność energetyczną wznoszonych obiektów oraz spełnienie wymogów środowiskowych wynikających z decyzji administracyjnych.',
            en: 'In construction, environmental impact matters at every stage of a project — from site preparation to building commissioning. The sector is characterized by high consumption of raw materials and energy, as well as significant volumes of construction and demolition waste. Key areas include waste management, control of emissions and dust on-site, energy efficiency of constructed buildings, and compliance with environmental requirements arising from administrative decisions.'
        },
        S: {
            pl: 'Budownictwo opiera się na pracy zespołów wykonawczych działających w warunkach podwyższonego ryzyka fizycznego i zmiennych warunkach środowiskowych. Kluczowe znaczenie mają bezpieczeństwo pracy, kwalifikacje specjalistów oraz właściwa organizacja pracy na placu budowy. Branża wymaga stabilnych zespołów, jasnych zasad współpracy i przestrzegania standardów BHP.',
            en: 'Construction relies on operational teams working in environments with elevated physical risk and variable site conditions. Occupational safety, specialist qualifications, and proper on-site organization are essential. The sector requires stable teams, clear cooperation rules, and adherence to health and safety standards.'
        },
        G: {
            pl: 'Działalność budowlana podlega rozbudowanym regulacjom prawnym, obejmującym prawo budowlane, normy techniczne, wymogi środowiskowe oraz procedury administracyjne związane z pozwoleniami, zgłoszeniami i odbiorami inwestycji. Prawidłowe prowadzenie dokumentacji budowy, nadzór nad zgodnością techniczną oraz współpraca z organami administracji stanowią stały element funkcjonowania firm w tej branży.',
            en: 'Construction activity is subject to extensive legal and technical regulations, including building law, technical standards, environmental requirements, and administrative procedures related to permits and project approvals. Proper site documentation, compliance supervision, and cooperation with public authorities are ongoing elements of operating in this sector.'
        },
        SC: {
            pl: 'Branża budowlana w dużym stopniu opiera się na współpracy z podwykonawcami, dostawcami materiałów oraz firmami specjalistycznymi. Realizacja inwestycji wymaga koordynacji wielu podmiotów na różnych etapach prac oraz synchronizacji dostaw z harmonogramem budowy. Struktura i organizacja łańcucha dostaw kształtują sposób planowania oraz przebieg realizacji inwestycji.',
            en: 'The construction sector heavily relies on subcontractors, material suppliers, and specialized service providers. Project execution requires coordination of multiple parties across different construction phases and synchronization of deliveries with the project schedule. The structure and organization of the supply chain shape planning and project execution processes.'
        }
    },
    energy_resources: {
        E: {
            pl: 'Branża energetyczna i surowcowa wiąże się z bezpośrednim oddziaływaniem na środowisko naturalne na etapie wydobycia, przetwarzania oraz wytwarzania energii. Kluczowe obszary obejmują emisje do powietrza, gospodarowanie wodą procesową, rekultywację terenów pogórniczych oraz zarządzanie odpadami i produktami ubocznymi procesów przemysłowych. Charakter działalności wymaga stałego monitorowania parametrów środowiskowych oraz realizacji warunków określonych w decyzjach administracyjnych i pozwoleniach.',
            en: 'The energy and raw materials sector is directly connected with environmental impact during extraction, processing, and energy generation. Key areas include air emissions, process water management, land restoration of post-extraction sites, and handling of industrial waste and by-products. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        S: {
            pl: 'Działalność w sektorze energetyki i surowców obejmuje pracę w warunkach podwyższonego ryzyka technicznego i przemysłowego, często w środowisku instalacji wysokiej mocy lub terenów wydobywczych. Kluczowe znaczenie mają standardy bezpieczeństwa pracy, kwalifikacje techniczne personelu oraz organizacja pracy w zakładach produkcyjnych i na obszarach eksploatacji. Branża funkcjonuje w bezpośrednim sąsiedztwie społeczności lokalnych, co wymaga stałego dialogu oraz uwzględniania kwestii zdrowia i bezpieczeństwa otoczenia.',
            en: 'Operations in the energy and raw materials sector involve work under elevated technical and industrial risk conditions, often within high-capacity installations or extraction sites. Occupational safety standards, technical qualifications of personnel, and structured work organization at production facilities and operating sites are essential. The sector often operates in close proximity to local communities, requiring ongoing dialogue and consideration of health and safety aspects of the surrounding area.'
        },
        G: {
            pl: 'Sektor energetyczny i surowcowy podlega rozbudowanym regulacjom krajowym i międzynarodowym, obejmującym koncesje, pozwolenia środowiskowe, normy techniczne, wymogi raportowe oraz nadzór sektorowy. Prowadzenie działalności wymaga uporządkowanego zarządzania dokumentacją regulacyjną, bieżącej kontroli zgodności oraz współpracy z organami nadzoru i instytucjami publicznymi.',
            en: 'The energy and raw materials sector is subject to extensive national and international regulations, including licenses, environmental permits, technical standards, reporting obligations, and sectoral supervision. Operating in this sector requires structured regulatory documentation management, ongoing compliance oversight, and cooperation with supervisory authorities and public institutions.'
        },
        SC: {
            pl: 'Branża opiera się na rozbudowanych i często międzynarodowych łańcuchach dostaw obejmujących surowce, komponenty technologiczne oraz usługi specjalistyczne. Istotne znaczenie ma koordynacja dostaw, dostępność infrastruktury logistycznej oraz współpraca z partnerami technologicznymi i serwisowymi. Struktura łańcucha dostaw kształtuje sposób organizacji procesów produkcyjnych oraz realizacji projektów inwestycyjnych.',
            en: 'The sector relies on extensive and often international supply chains covering raw materials, technological components, and specialized services. Coordination of deliveries, availability of logistics infrastructure, and cooperation with technology and service partners are important elements. The supply chain structure shapes the organization of production processes and execution of investment projects.'
        }
    },
    industrial_production: {
        E: {
            pl: 'Produkcja przemysłowa wiąże się z wykorzystaniem energii, surowców oraz procesów technologicznych generujących emisje, odpady i ścieki przemysłowe. Kluczowe obszary obejmują efektywność energetyczną linii produkcyjnych, ograniczanie strat materiałowych, gospodarowanie odpadami poprodukcyjnymi, kontrolę emisji do powietrza oraz zarządzanie wodą procesową w obiegach zamkniętych i otwartych. Charakter działalności wymaga stałego monitorowania parametrów środowiskowych oraz realizacji warunków określonych w pozwoleniach i decyzjach administracyjnych.',
            en: 'Industrial production involves the use of energy, raw materials, and technological processes that generate emissions, waste, and industrial wastewater. Key areas include energy efficiency of production lines, reduction of material losses, management of post-production waste, control of air emissions, and process water management in closed and open systems. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        S: {
            pl: 'Działalność produkcyjna opiera się na pracy w środowisku maszynowym i technologicznym, często w systemie zmianowym oraz w warunkach podwyższonego hałasu i obciążenia fizycznego. Kluczowe znaczenie mają standardy bezpieczeństwa pracy, właściwa organizacja stanowisk produkcyjnych, kwalifikacje operatorów oraz nadzór nad procesami technicznymi. Istotnym elementem funkcjonowania zakładów jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunków pracy w halach produkcyjnych.',
            en: 'Industrial operations rely on machine-based and technological environments, often operating in shift systems and under conditions of elevated noise and physical load. Occupational safety standards, proper organization of production workstations, operator qualifications, and supervision of technical processes are essential. Adherence to health and safety rules and ensuring appropriate working conditions within production facilities are integral elements of plant operations.'
        },
        G: {
            pl: 'Produkcja przemysłowa podlega regulacjom obejmującym normy techniczne, wymagania jakościowe, przepisy środowiskowe oraz obowiązki sprawozdawcze i certyfikacyjne. Prowadzenie działalności wymaga uporządkowanego zarządzania dokumentacją procesową, utrzymania zgodności z normami branżowymi oraz nadzoru nad procedurami wewnętrznymi. Stałym elementem funkcjonowania zakładu jest kontrola zgodności procesów z obowiązującymi regulacjami i standardami.',
            en: 'Industrial production is subject to regulations covering technical standards, quality requirements, environmental rules, reporting obligations, and certification schemes. Operating in this sector requires structured process documentation management, compliance with industry standards, and supervision of internal procedures. Ongoing control of process compliance with applicable regulations and standards is a permanent element of plant operations.'
        },
        SC: {
            pl: 'Branża produkcyjna opiera się na dostawach surowców, komponentów oraz usług technicznych, często realizowanych w modelu wielostopniowego łańcucha dostaw obejmującego dostawców krajowych i zagranicznych. Istotne znaczenie ma synchronizacja dostaw z planem produkcyjnym, dostępność materiałów magazynowych oraz współpraca z dostawcami kluczowych komponentów i części zamiennych. Struktura łańcucha dostaw kształtuje organizację procesów wytwórczych oraz planowanie produkcji.',
            en: 'The manufacturing sector relies on the supply of raw materials, components, and technical services, often organized within multitier supply chains involving both domestic and international suppliers. Synchronization of deliveries with production schedules, material availability in storage, and cooperation with key component and spare part suppliers are important elements. The supply chain structure shapes production organization and planning processes.'
        }
    },
    logistics_transport: {
        E: {
            pl: 'Branża logistyczna i transportowa wiąże się z wykorzystaniem floty pojazdów, infrastruktury magazynowej oraz systemów dystrybucyjnych generujących emisje do powietrza oraz zużycie paliw i energii. Kluczowe obszary obejmują efektywność paliwową floty, zarządzanie emisjami z transportu drogowego, kolejowego, lotniczego lub morskiego, a także organizację procesów magazynowych, zużycie energii w obiektach oraz ograniczanie ilości opakowań transportowych. Charakter działalności wymaga monitorowania parametrów środowiskowych związanych z eksploatacją pojazdów i funkcjonowaniem centrów logistycznych.',
            en: 'The logistics and transport sector involves the use of vehicle fleets, warehouse infrastructure, and distribution systems that generate air emissions and consume fuel and energy. Key areas include fleet fuel efficiency, management of emissions from road, rail, air, or maritime transport, as well as energy use in logistics facilities and reduction of transport packaging. The nature of operations requires monitoring environmental parameters related to vehicle operation and logistics center performance.'
        },
        S: {
            pl: 'Działalność w sektorze logistyki i transportu opiera się na pracy kierowców, operatorów magazynowych oraz personelu planistycznego, często w systemie zmianowym i w warunkach pracy zależnych od harmonogramów dostaw. Istotne znaczenie mają bezpieczeństwo w ruchu drogowym i w przestrzeni magazynowej, kwalifikacje kierowców oraz właściwa organizacja pracy związana z planowaniem tras i obsługą ładunków. Ważnym elementem jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunków pracy w centrach logistycznych i podczas realizacji transportu.',
            en: 'Operations in the logistics and transport sector rely on drivers, warehouse operators, and planning staff, often working in shift systems and according to structured delivery schedules. Road safety, warehouse safety standards, driver qualifications, and proper route and cargo handling organization are essential elements. Adherence to health and safety rules and ensuring appropriate working conditions in logistics centers and during transport are integral aspects of sector operations.'
        },
        G: {
            pl: 'Sektor logistyczny i transportowy podlega regulacjom dotyczącym czasu pracy kierowców, bezpieczeństwa przewozów, norm emisji, licencji transportowych oraz obowiązków sprawozdawczych i dokumentacyjnych. Prowadzenie działalności wymaga zarządzania dokumentacją przewozową, utrzymania zgodności z przepisami branżowymi oraz nadzoru nad procedurami administracyjnymi i operacyjnymi. Stałym elementem funkcjonowania firm jest kontrola zgodności z regulacjami krajowymi i międzynarodowymi.',
            en: 'The logistics and transport sector is subject to regulations covering driver working time, transport safety, emission standards, transport licenses, and reporting and documentation obligations. Operating in this sector requires structured management of transport documentation, compliance with industry regulations, and supervision of administrative and operational procedures. Ongoing compliance with national and international regulations is a permanent element of business operations.'
        },
        SC: {
            pl: 'Branża logistyki i transportu funkcjonuje w ramach rozbudowanych sieci dostaw obejmujących nadawców, przewoźników, operatorów magazynowych oraz odbiorców końcowych. Istotne znaczenie ma koordynacja przepływu towarów pomiędzy różnymi środkami transportu oraz synchronizacja procesów przeładunkowych, magazynowych i dystrybucyjnych. Struktura sieci logistycznej kształtuje organizację procesów transportowych oraz planowanie operacji dostawczych.',
            en: 'The logistics and transport sector operates within extensive supply networks involving shippers, carriers, warehouse operators, and end recipients. Coordination of goods flow across different transport modes, as well as synchronization of handling, warehousing, and distribution processes, are key elements. The structure of the logistics network shapes the organization of transport processes and delivery planning.'
        }
    },
    retail_trade: {
        E: {
            pl: 'Branża handlowa wiąże się z funkcjonowaniem sklepów stacjonarnych, centrów dystrybucyjnych oraz kanałów sprzedaży internetowej, generujących zużycie energii, opakowań i odpadów. Kluczowe obszary obejmują efektywność energetyczną obiektów handlowych, zużycie energii w systemach chłodniczych i oświetleniowych, gospodarkę odpadami opakowaniowymi oraz organizację logistyki dostaw do punktów sprzedaży. Charakter działalności wymaga monitorowania zużycia mediów oraz zarządzania strumieniem produktów i opakowań w całym cyklu sprzedaży.',
            en: 'The trade and retail sector involves the operation of physical stores, distribution centers, and online sales channels that generate energy consumption, packaging use, and waste. Key areas include energy efficiency of retail facilities, energy use in refrigeration and lighting systems, packaging waste management, and organization of deliveries to sales outlets. The nature of operations requires monitoring utility consumption and managing product and packaging flows throughout the sales cycle.'
        },
        S: {
            pl: 'Działalność handlowa opiera się na pracy personelu sprzedażowego, magazynowego oraz obsługi klienta, często w systemie zmianowym i w bezpośrednim kontakcie z klientami. Istotne znaczenie mają warunki pracy w punktach sprzedaży, organizacja czasu pracy, standardy obsługi oraz bezpieczeństwo w przestrzeni sklepowej i magazynowej. Branża wymaga odpowiedniego przygotowania pracowników do obsługi klientów oraz przestrzegania zasad bezpieczeństwa i higieny pracy.',
            en: 'Retail operations rely on sales staff, warehouse personnel, and customer service teams, often working in shift systems and in direct contact with customers. Working conditions in retail outlets, organization of working time, service standards, and safety in store and warehouse areas are key elements. The sector requires proper employee preparation for customer interaction and adherence to health and safety rules.'
        },
        G: {
            pl: 'Sektor handlu podlega regulacjom dotyczącym ochrony konsumentów, zasad sprzedaży, bezpieczeństwa produktów, ochrony danych osobowych oraz obowiązków podatkowych i sprawozdawczych. Prowadzenie działalności wymaga zarządzania dokumentacją sprzedażową, utrzymania zgodności z przepisami branżowymi oraz nadzoru nad procedurami wewnętrznymi w punktach sprzedaży i kanałach online. Stałym elementem funkcjonowania firm jest kontrola zgodności działań handlowych z obowiązującymi regulacjami.',
            en: 'The trade and retail sector is subject to regulations covering consumer protection, sales rules, product safety, data protection, and tax and reporting obligations. Operating in this sector requires management of sales documentation, compliance with industry regulations, and supervision of internal procedures in both physical stores and online channels. Ongoing control of commercial activities in line with applicable regulations is a standard element of business operations.'
        },
        SC: {
            pl: 'Branża handlowa funkcjonuje w ramach rozbudowanych łańcuchów dostaw obejmujących producentów, importerów, hurtownie oraz centra dystrybucyjne i sklepy detaliczne. Istotne znaczenie ma koordynacja dostaw do punktów sprzedaży, zarządzanie zapasami magazynowymi oraz synchronizacja przepływu towarów pomiędzy magazynami, sklepami i kanałami e-commerce. Struktura łańcucha dostaw kształtuje organizację procesów zaopatrzenia i dystrybucji w sieci handlowej.',
            en: 'The trade and retail sector operates within extensive supply chains involving manufacturers, importers, wholesalers, distribution centers, and retail outlets. Coordination of deliveries to sales outlets, inventory management, and synchronization of goods flow between warehouses, stores, and e-commerce channels are key elements. The supply chain structure shapes procurement and distribution processes within the retail network.'
        }
    },
    it_software: {
        E: {
            pl: 'Działalność w sektorze IT i oprogramowania wiąże się z wykorzystaniem infrastruktury serwerowej, centrów danych, urządzeń końcowych oraz sprzętu elektronicznego, generujących zużycie energii i zasobów technicznych. Kluczowe obszary obejmują efektywność energetyczną środowisk serwerowych, systemy chłodzenia centrów danych, cykl życia sprzętu IT oraz gospodarowanie zużytym sprzętem elektronicznym. Charakter działalności wymaga monitorowania zużycia energii w infrastrukturze cyfrowej oraz racjonalnego zarządzania zasobami technologicznymi wykorzystywanymi do świadczenia usług.',
            en: 'The IT and software sector involves the use of server infrastructure, data centers, end-user devices, and electronic equipment that generate energy consumption and use technical resources. Key areas include energy efficiency of server environments, data center cooling systems, IT equipment life cycle management, and handling of electronic waste. The nature of operations requires monitoring energy use within digital infrastructure and rational management of technological resources used to deliver services.'
        },
        S: {
            pl: 'Sektor IT opiera się na pracy specjalistów technicznych, programistów, analityków oraz zespołów projektowych, często funkcjonujących w modelu pracy hybrydowej lub zdalnej. Istotne znaczenie mają organizacja czasu pracy, ergonomia stanowisk komputerowych, rozwój kompetencji technologicznych oraz współpraca zespołowa w środowisku projektowym. Działalność w tej branży wiąże się z koniecznością zapewnienia odpowiednich warunków pracy oraz przestrzegania zasad bezpieczeństwa i higieny pracy w środowisku biurowym i domowym.',
            en: 'The IT sector relies on technical specialists, developers, analysts, and project teams, often operating in hybrid or remote work models. Organization of working time, workstation ergonomics, development of technological competencies, and team collaboration within project environments are key elements. Activities in this sector involve ensuring appropriate working conditions and adherence to health and safety principles in both office and home environments.'
        },
        G: {
            pl: 'Działalność w sektorze IT podlega regulacjom dotyczącym ochrony danych osobowych, bezpieczeństwa informacji, praw własności intelektualnej oraz obowiązków umownych wobec klientów i partnerów biznesowych. Prowadzenie działalności wymaga zarządzania dostępem do systemów, dokumentacją projektową oraz procedurami bezpieczeństwa informacji, w tym ochrony przed nieuprawnionym dostępem do danych. Stałym elementem funkcjonowania firm IT jest nadzór nad zgodnością działań z obowiązującymi regulacjami i standardami branżowymi.',
            en: 'The IT sector is subject to regulations covering data protection, information security, intellectual property rights, and contractual obligations toward clients and business partners. Operating in this sector requires management of system access, project documentation, and information security procedures, including protection against unauthorized access to data. Ongoing oversight of compliance with applicable regulations and industry standards is a standard element of IT operations.'
        },
        SC: {
            pl: 'Sektor IT funkcjonuje w oparciu o współpracę z dostawcami infrastruktury technologicznej, usług chmurowych, sprzętu komputerowego oraz specjalistycznych rozwiązań programistycznych. Istotne znaczenie ma integracja zewnętrznych komponentów systemowych, zarządzanie licencjami oprogramowania oraz koordynacja współpracy z partnerami technologicznymi i dostawcami usług cyfrowych. Struktura łańcucha dostaw wpływa na organizację projektów oraz sposób świadczenia usług informatycznych.',
            en: 'The IT sector operates through cooperation with providers of technological infrastructure, cloud services, computer hardware, and specialized software solutions. Integration of external system components, software license management, and coordination with technology partners and digital service providers are important elements. The structure of the supply chain influences project organization and the delivery of IT services.'
        }
    },
    finance_fintech: {
        E: {
            pl: 'Sektor finansowy, w tym fintech, funkcjonuje głównie w oparciu o infrastrukturę biurową i cyfrową, obejmującą centra danych, systemy transakcyjne, sieci teleinformatyczne oraz sprzęt informatyczny. Kluczowe obszary środowiskowe dotyczą zużycia energii w infrastrukturze IT, funkcjonowania powierzchni biurowych oraz cyklu życia urządzeń elektronicznych. Charakter działalności wiąże się z monitorowaniem zużycia energii i zasobów technicznych wykorzystywanych do obsługi procesów finansowych i usług cyfrowych.',
            en: 'The finance sector, including fintech, operates primarily through office and digital infrastructure, including data centers, transaction systems, telecommunication networks, and IT equipment. Key environmental aspects relate to energy consumption within IT infrastructure, operation of office facilities, and the life cycle of electronic devices. The nature of operations involves monitoring energy use and technical resources required to support financial processes and digital services.'
        },
        S: {
            pl: 'Działalność w sektorze finansowym opiera się na pracy specjalistów z zakresu finansów, analityki, technologii oraz obsługi klienta, funkcjonujących w środowisku biurowym lub w modelu hybrydowym. Istotne znaczenie mają organizacja czasu pracy, standardy obsługi klienta, rozwój kompetencji zawodowych oraz ergonomia stanowisk pracy. Funkcjonowanie branży wiąże się z zapewnieniem odpowiednich warunków pracy oraz przestrzeganiem zasad bezpieczeństwa i higieny pracy w środowisku biurowym.',
            en: 'The finance sector relies on finance professionals, analysts, technology specialists, and customer service teams operating in office or hybrid work environments. Organization of working time, customer service standards, professional development, and workstation ergonomics are key elements. Sector operations involve ensuring appropriate working conditions and adherence to health and safety principles in office environments.'
        },
        G: {
            pl: 'Sektor finansowy podlega rozbudowanym regulacjom obejmującym wymogi nadzorcze, standardy raportowe, ochronę danych osobowych, przeciwdziałanie praniu pieniędzy oraz zarządzanie ryzykiem operacyjnym i technologicznym. Prowadzenie działalności wymaga utrzymania procedur zgodności, dokumentacji regulacyjnej, systemów kontroli wewnętrznej oraz jasnego podziału odpowiedzialności. Stałym elementem funkcjonowania instytucji finansowych jest nadzór nad zgodnością działań z obowiązującymi przepisami i standardami branżowymi.',
            en: 'The financial sector is subject to extensive regulations covering supervisory requirements, reporting standards, data protection, anti-money laundering obligations, and management of operational and technological risks. Operating in this sector requires maintaining compliance procedures, regulatory documentation, internal control systems, and clear allocation of responsibilities. Ongoing oversight of activities in line with applicable regulations and industry standards is a standard element of financial institutions\' operations.'
        },
        SC: {
            pl: 'Sektor finansowy funkcjonuje w oparciu o współpracę z dostawcami technologii, operatorami płatności, partnerami bankowymi oraz podmiotami świadczącymi usługi przetwarzania danych i utrzymania systemów transakcyjnych. Istotne znaczenie ma integracja systemów informatycznych, zarządzanie licencjami i dostępami oraz koordynacja współpracy z partnerami technologicznymi. Struktura łańcucha dostaw kształtuje organizację usług finansowych i cyfrowych.',
            en: 'The financial sector operates through cooperation with technology providers, payment operators, banking partners, and entities delivering data processing and transaction system maintenance services. Integration of IT systems, management of licenses and access rights, and coordination with technology partners are important elements. The supply chain structure shapes the organization of financial and digital services.'
        }
    },
    services_other: {
        E: {
            pl: 'Sektor usługowy funkcjonuje głównie w oparciu o infrastrukturę biurową, lokale usługowe oraz sprzęt wykorzystywany do świadczenia usług specjalistycznych. Kluczowe obszary środowiskowe obejmują zużycie energii w budynkach, wykorzystanie materiałów eksploatacyjnych (np. papier, środki czystości, materiały techniczne) oraz gospodarowanie odpadami powstającymi w trakcie realizacji usług. Charakter działalności wiąże się z monitorowaniem zużycia mediów oraz racjonalnym zarządzaniem zasobami wykorzystywanymi w codziennej działalności.',
            en: 'The services sector operates primarily through office infrastructure, service premises, and equipment used to deliver specialized services. Key environmental aspects include energy consumption in buildings, use of operational materials (e.g., paper, cleaning agents, technical supplies), and waste management related to service activities. The nature of operations involves monitoring utility consumption and rational management of resources used in daily activities.'
        },
        S: {
            pl: 'Działalność w sektorze usługowym opiera się na pracy specjalistów świadczących usługi doradcze, techniczne, administracyjne lub wsparcia operacyjnego. Istotne znaczenie mają organizacja czasu pracy, rozwój kompetencji zawodowych oraz zapewnienie odpowiednich warunków pracy. Funkcjonowanie branży wiąże się z przestrzeganiem zasad bezpieczeństwa i higieny pracy oraz utrzymaniem stabilnych zespołów realizujących usługi.',
            en: 'The services sector relies on professionals delivering advisory, technical, administrative, or operational support services. Organization of working time, professional development, and appropriate working conditions are key elements. Sector operations involve adherence to health and safety principles and maintaining stable teams delivering services.'
        },
        G: {
            pl: 'Prowadzenie działalności usługowej wymaga zarządzania dokumentacją umowną, utrzymania przejrzystych procedur wewnętrznych oraz nadzoru nad zgodnością działań z obowiązującymi przepisami. Stałym elementem funkcjonowania firm usługowych jest kontrola zgodności procesów z regulacjami branżowymi i standardami zawodowymi.',
            en: 'Operating a service business requires management of contractual documentation, maintenance of transparent internal procedures, and oversight of compliance with applicable regulations. Ongoing control of processes in line with industry rules and professional standards is a standard element of service providers\' operations.'
        },
        SC: {
            pl: 'Sektor usługowy funkcjonuje w oparciu o współpracę z podwykonawcami oraz dostawcami specjalistycznych narzędzi, systemów informatycznych i usług wspierających. Istotne znaczenie ma koordynacja współpracy z partnerami zewnętrznymi oraz integracja wykorzystywanych rozwiązań technologicznych. Struktura współpracy z dostawcami i podwykonawcami kształtuje sposób realizacji projektów oraz organizację świadczenia usług.',
            en: 'The services sector operates through cooperation with subcontractors and providers of specialized tools, IT systems, and supporting services. Coordination with external partners and integration of technological solutions are important elements. The structure of cooperation with suppliers and subcontractors shapes project execution and service delivery organization.'
        }
    }
};

// ============================================================================
// SECTION: Industry Risk Intro (32 texts - for TOP 3 section)
// Source: Do 64 komentarzy PL_EN.pdf
// Structure: industry_id → pillar → { pl, en }
// Used as intro before 3 risk blocks in TOP 3 section
// ============================================================================

const INDUSTRY_RISK_INTRO = {
    construction: {
        E: {
            pl: 'W budownictwie decyzje środowiskowe, kompletność dokumentacji projektowej oraz kontrola jakości materiałów wpływają bezpośrednio na harmonogram robót. Błąd formalny lub niezgodność materiałowa może wstrzymać prace, wydłużyć termin realizacji i narazić wykonawcę na kary umowne.',
            en: 'In construction, environmental issues directly influence investor decisions, administrative permits, and the ability to execute contracts.'
        },
        S: {
            pl: 'BHP na budowie oraz nadzór nad podwykonawcami decydują o ciągłości prac i terminowości realizacji. Wypadek lub niewłaściwy nadzór nad podwykonawcą może wstrzymać roboty, zwiększyć koszty i przenieść odpowiedzialność na generalnego wykonawcę.',
            en: 'Health and safety on the construction site, as well as supervision of subcontractors, determine the continuity of works and the timely completion of the project. An accident or improper supervision of a subcontractor may halt the works, increase costs, and shift liability to the general contractor.'
        },
        G: {
            pl: 'W budownictwie jakość dokumentacji, sprawny obieg decyzji oraz kontrola zmian projektowych wpływają na tempo realizacji inwestycji. Niespójności w dokumentach lub brak formalnego zatwierdzania zmian mogą prowadzić do roszczeń, sporów oraz dodatkowych kosztów po stronie wykonawcy.',
            en: 'In the construction sector, the quality of documentation, efficient circulation of decisions, and control of design changes influence the pace of project execution. Inconsistencies in documents or the lack of formal approval of changes may lead to claims, disputes, and additional costs on the contractor\'s side.'
        },
        SC: {
            pl: 'Kontrola podwykonawców i jakości materiałów warunkuje dotrzymanie harmonogramu budowy. Opóźnienie dostaw lub wada materiałowa może spowodować przestój, naliczenie kar umownych oraz obniżenie rentowności kontraktu.',
            en: 'Control over subcontractors and the quality of materials determines adherence to the construction schedule. A delay in deliveries or a material defect may cause downtime, trigger contractual penalties, and reduce the profitability of the contract.'
        }
    },
    energy_resources: {
        E: {
            pl: 'W sektorze energetyki i surowców emisje, pozwolenia środowiskowe i decyzje regulatora bezpośrednio wpływają na możliwość uruchomienia instalacji. Opóźnienie w uzyskaniu decyzji administracyjnych może wstrzymać projekt wart setki milionów złotych.',
            en: 'In the energy and raw materials sector, emissions, environmental permits, and regulatory decisions directly affect the ability to commission installations. Delays in obtaining administrative decisions can halt projects worth hundreds of millions in capital investment.'
        },
        S: {
            pl: 'Bezpieczeństwo pracy, nadzór nad podwykonawcami oraz relacje ze społecznością lokalną wpływają bezpośrednio na ciągłość wydobycia lub produkcji. Wypadek, protest lub konflikt społeczny mogą zatrzymać działalność i wygenerować dodatkowe koszty oraz kontrole ze strony instytucji.',
            en: 'Workplace safety, supervision of subcontractors, and relations with the local community directly affect the continuity of extraction or production. An accident, protest, or social conflict may halt operations and generate additional costs as well as inspections by authorities.'
        },
        G: {
            pl: 'W tej branży sposób zarządzania oraz zgodność z wymaganiami regulatora wpływają na tempo uzyskiwania koncesji i finansowania inwestycji. Braki w nadzorze, dokumentacji lub procedurach mogą opóźniać decyzje administracyjne i utrudniać pozyskanie finansowania.',
            en: 'In this industry, management practices and compliance with regulatory requirements influence the speed of obtaining concessions and investment financing. Deficiencies in oversight, documentation, or procedures may delay administrative decisions and make it more difficult to secure financing.'
        },
        SC: {
            pl: 'Stabilność dostaw surowców i dostęp do infrastruktury przesyłowej warunkują ciągłość produkcji. Przerwa w dostawach oznacza przestój instalacji, a przy wysokich kosztach stałych każdy dzień bez produkcji bezpośrednio obniża rentowność działalności.',
            en: 'The stability of raw material supplies and access to transmission infrastructure determine the continuity of production. A disruption in supplies means downtime for the installation, and with high fixed costs, every day without production directly reduces operational profitability.'
        }
    },
    industrial_production: {
        E: {
            pl: 'Zużycie energii, poziom odpadu oraz stabilność parametrów linii bezpośrednio wpływają na koszt jednostkowy wyrobu. Niekontrolowane straty materiałowe lub wahania zużycia energii obniżają wydajność linii i zwiększają koszt produkcji przy tej samej zdolności wytwórczej.',
            en: 'Energy consumption, scrap rate, and line parameter stability directly impact unit production cost. Uncontrolled material losses or energy fluctuations reduce line efficiency and increase cost at the same production capacity.'
        },
        S: {
            pl: 'Ciągłość pracy linii zależy od dyscypliny operacyjnej, przestrzegania procedur oraz bezpieczeństwa pracy na hali produkcyjnej. Błąd operatora lub brak kontroli procesu może wywołać przestój technologiczny, zwiększyć odsetek braków i podnieść koszt jednostkowy całej partii.',
            en: 'Production continuity depends on operational discipline, procedural compliance, and shop-floor safety. Operator error or weak process control may trigger downtime, increase defect rates, and raise unit cost for the entire batch.'
        },
        G: {
            pl: 'Jakość dokumentacji technologicznej, formalna kontrola zmian receptur oraz nadzór nad parametrami linii decydują o stabilności produkcji. Brak kontroli nad zmianą procesu może skutkować reklamacjami, serią wadliwych wyrobów oraz utratą rentowności całej partii.',
            en: 'Technical documentation quality, formal change control, and line parameter supervision determine production stability. Weak process governance may result in customer claims, defective batches, and margin loss across the entire production run.'
        },
        SC: {
            pl: 'Jakość surowców i terminowość dostaw wpływają bezpośrednio na wydajność linii produkcyjnej. Surowiec poza specyfikacją powoduje przestoje, zwiększony odpad i spadek efektywności linii, co natychmiast podnosi koszt jednostkowy.',
            en: 'Raw material quality and delivery timeliness directly affect production line performance. Off-spec materials cause downtime, increased scrap, and reduced line efficiency, which immediately raises unit production costs.'
        }
    },
    logistics_transport: {
        E: {
            pl: 'Zużycie paliwa, emisje oraz stan techniczny floty bezpośrednio wpływają na koszt kilometra i rentowność kontraktów transportowych. Wahania cen paliwa lub nowe ograniczenia emisyjne mogą obniżyć marżę i wymusić renegocjację stawek przy długoterminowych umowach z klientami.',
            en: 'Fuel consumption, emissions, and fleet condition directly impact cost per kilometer and contract profitability. Fuel price volatility or new emission regulations may reduce margins and force rate renegotiations under long-term client contracts.'
        },
        S: {
            pl: 'Bezpieczeństwo kierowców i organizacja czasu pracy wpływają bezpośrednio na terminowość dostaw. Wypadek lub naruszenie norm czasu jazdy może oznaczać unieruchomienie pojazdu lub części floty, kary umowne oraz utratę wiarygodności w oczach kontrahentów.',
            en: 'Driver safety and working time compliance directly affect delivery punctuality. An accident or violation of driving time regulations may immobilize a vehicle or part of the fleet, trigger contractual penalties, and damage credibility with clients.'
        },
        G: {
            pl: 'Kontrola harmonogramów, monitorowanie floty i egzekwowanie warunków umów decydują o dotrzymaniu warunków kontraktowych. Brak nadzoru nad terminami lub dokumentacją przewozową może skutkować karami za opóźnienia i utratą długoterminowych kontraktów.',
            en: 'Schedule control, fleet monitoring, and enforcement of contract terms determine whether contractual obligations are met. Weak supervision over deadlines or transport documentation may result in delay penalties and loss of long-term contracts.'
        },
        SC: {
            pl: 'Sprawność floty, dostępność kierowców oraz stabilność dostaw paliwa warunkują ciągłość realizacji tras. Opóźnienie dostawy lub awaria pojazdu generują kary za niedotrzymanie terminu oraz podnoszą koszt operacyjny każdej trasy.',
            en: 'Fleet reliability, driver availability, and stable fuel supply determine route continuity. Delivery delays or vehicle breakdowns trigger contractual penalties and increase operational cost per route.'
        }
    },
    retail_trade: {
        E: {
            pl: 'Zarządzanie zapasami, sezonowość sprzedaży oraz kontrola stanów magazynowych bezpośrednio wpływają na dostępność towaru i poziom marży. Nadmiar zapasu zamraża kapitał obrotowy, a braki magazynowe w szczycie sezonu oznaczają utraconą sprzedaż i osłabienie relacji z klientem.',
            en: 'Inventory management, seasonality, and warehouse stock control directly affect product availability and margin levels. Excess inventory ties up working capital, while stock shortages during peak season result in lost sales and weakened customer relationships.'
        },
        S: {
            pl: 'Obsługa zwrotów i reklamacji wpływa bezpośrednio na koszt sprzedaży oraz postrzeganie marki. Wysoki poziom zwrotów obniża marżę jednostkową i może podważyć zaufanie klientów przy powtarzających się problemach jakościowych.',
            en: 'Returns and complaint handling directly affect cost of sales and brand perception. A high return rate reduces unit margin and may undermine customer trust when quality issues repeatedly occur.'
        },
        G: {
            pl: 'Zgodność z przepisami konsumenckimi, poprawność oznaczeń oraz kontrola dokumentacji sprzedażowej decydują o bezpieczeństwie działalności handlowej. Naruszenie regulacji może skutkować karami administracyjnymi, zwrotem środków oraz utratą reputacji marki.',
            en: 'Compliance with consumer regulations, correct labeling, and control of sales documentation determine the security of retail operations. Regulatory breaches may result in administrative penalties, forced refunds, and damage to brand reputation.'
        },
        SC: {
            pl: 'Sprawność łańcucha dostaw oraz terminowość dostaw do magazynu warunkują ciągłość ekspozycji towaru na półce. Opóźnienia dostaw lub błędy kompletacyjne obniżają dostępność produktu, generują utraconą sprzedaż i bezpośrednio wpływają na rentowność sprzedaży.',
            en: 'Supply chain efficiency and on-time warehouse deliveries determine shelf availability. Delivery delays or picking errors reduce product availability, generate lost sales, and directly impact sales profitability.'
        }
    },
    it_software: {
        E: {
            pl: 'Stabilność infrastruktury IT, zużycie zasobów serwerowych i architektura systemu wpływają bezpośrednio na dostępność usług dla klienta. Przeciążenie lub awaria środowiska produkcyjnego może skutkować przerwą w działaniu systemu, utratą przychodów abonamentowych oraz roszczeniami wynikającymi z umów z klientami.',
            en: 'IT infrastructure stability, server resource usage, and system architecture directly impact service availability for clients. Overload or production environment failure may cause service downtime, recurring revenue loss, and compensation claims under client contracts.'
        },
        S: {
            pl: 'Zależność od kluczowych programistów oraz kompetencje zespołu wpływają na tempo wdrożeń i utrzymanie systemów. Odejście kluczowego programisty może opóźnić realizację projektu, narazić firmę na kary umowne oraz osłabić relację z klientem.',
            en: 'Dependence on key developers and team expertise directly affects deployment timelines and system maintenance. The departure of a key developer may delay project delivery, trigger contractual penalties, and weaken client relationships.'
        },
        G: {
            pl: 'Bezpieczeństwo danych, zgodność z przepisami o ochronie danych oraz kontrola dostępu do systemów decydują o zaufaniu klientów. Wycieki danych lub naruszenie regulacji mogą skutkować odpowiedzialnością prawną, karami finansowymi oraz utratą kluczowych klientów.',
            en: 'Data security, compliance with data protection regulations, and access control determine client trust. Data breaches or regulatory violations may result in legal liability, financial penalties, and loss of key clients.'
        },
        SC: {
            pl: 'Zależność od dostawców chmury, integratorów oraz zewnętrznych API wpływa na ciągłość działania systemu. Awaria kluczowego partnera technologicznego może przerwać dostępność usług, wygenerować kary umowne oraz doprowadzić do utraty kontraktu.',
            en: 'Dependence on cloud providers, integrators, and external APIs directly affects system continuity. Failure of a critical technology partner may interrupt service availability, trigger contractual penalties, and lead to contract loss.'
        }
    },
    finance_fintech: {
        E: {
            pl: 'Zgodność z regulacjami oraz bieżący nadzór nad działalnością decydują o możliwości oferowania usług finansowych. Naruszenie przepisów może skutkować karą administracyjną, ograniczeniem działalności lub utratą licencji, co bezpośrednio wpływa na ciągłość przychodów i zaufanie klientów.',
            en: 'Regulatory compliance and ongoing supervisory oversight determine the ability to provide financial services. Regulatory breaches may result in administrative penalties, business restrictions, or license withdrawal, directly affecting revenue continuity and client trust.'
        },
        S: {
            pl: 'Ochrona danych klientów, bezpieczeństwo transakcji oraz jakość obsługi wpływają na reputację instytucji finansowej. Incydent związany z wyciekiem danych lub nieautoryzowaną transakcją może doprowadzić do odpływu klientów, roszczeń oraz trwałego spadku przychodów.',
            en: 'Customer data protection, transaction security, and service quality directly impact institutional reputation. A data breach or unauthorized transaction may trigger customer outflow, legal claims, and long-term revenue decline.'
        },
        G: {
            pl: 'Sprawny system kontroli wewnętrznej i zarządzania ryzykiem wpływa na relacje z instytucjami nadzorczymi oraz dostęp do finansowania. Braki w nadzorze lub systemie kontroli wewnętrznej mogą skutkować dodatkowymi kontrolami, sankcjami oraz ograniczeniem współpracy z bankami lub inwestorami.',
            en: 'A strong internal control and risk management system determines relationships with supervisory authorities and access to funding. Weak oversight or internal control gaps may lead to intensified supervision, regulatory sanctions, and restricted cooperation with banks or investors.'
        },
        SC: {
            pl: 'Zależność od dostawców systemów płatniczych, infrastruktury IT oraz partnerów technologicznych wpływa na ciągłość realizacji transakcji. Awaria systemu lub cyberatak może przerwać obsługę klientów, wygenerować odpowiedzialność finansową i osłabić reputację na rynku.',
            en: 'Dependence on payment systems, IT infrastructure, and technology partners directly affects transaction continuity. System failure or cyberattack may disrupt customer service, create financial liability, and damage market reputation.'
        }
    },
    services_other: {
        E: {
            pl: 'Jakość obsługi oraz terminowość realizacji zleceń bezpośrednio wpływają na satysfakcję klienta i powtarzalność przychodów. Opóźnienie w realizacji usługi może skutkować utratą klienta, spadkiem rekomendacji oraz ograniczeniem powtarzalnych przychodów.',
            en: 'Service quality and timely execution directly affect client satisfaction and recurring revenue. A delay in service delivery may result in client loss, reduced referrals, and a decline in recurring income.'
        },
        S: {
            pl: 'Stabilność zespołu i kompetencje pracowników wpływają na jakość świadczonej usługi oraz relacje z klientami. Odejście kluczowej osoby lub błąd merytoryczny może osłabić zaufanie klienta i doprowadzić do zakończenia współpracy.',
            en: 'Team stability and employee competence determine service quality and client relationships. The departure of a key specialist or a professional error may undermine client trust and lead to contract termination.'
        },
        G: {
            pl: 'Odpowiedzialność zawodowa oraz poufność informacji klientów decydują o reputacji firmy na rynku. Naruszenie poufności lub błąd w realizacji usługi może skutkować roszczeniami, utratą klientów i trwałym spadkiem przychodów.',
            en: 'Professional liability and client confidentiality determine market reputation. A confidentiality breach or service error may result in legal claims, client loss, and long-term revenue decline.'
        },
        SC: {
            pl: 'Zależność od kluczowych współpracowników i podwykonawców wpływa na ciągłość realizacji usług. Opóźnienia lub niska jakość pracy partnerów zewnętrznych mogą obniżyć poziom obsługi klienta i ograniczyć utrzymanie kontraktów.',
            en: 'Dependence on key collaborators and subcontractors affects service continuity. Delays or poor performance by external partners may reduce service quality and limit client retention.'
        }
    }
};

// ============================================================================
// SECTION: Extended Pillar Comments (EXT - pillar state descriptions)
// Structure: pillar → state → { pl, en }
// ============================================================================

const EXTENDED_PILLAR_COMMENTS = {
    E: {
        green: {
            pl: 'Organizacja funkcjonuje w sposób kontrolowany pod względem wpływu środowiskowego. Zużycie energii, materiałów oraz generowanie odpadów pozostają w przewidywalnych zakresach, a dane są dostępne i możliwe do analizy. Działania nie mają charakteru reaktywnego — są elementem bieżącego zarządzania.\nTaki poziom oznacza stabilność operacyjną w obszarze środowiskowym i pozwala budować dalszą optymalizację efektywności zasobowej.',
            en: 'The organization operates in a controlled manner regarding environmental impact. Energy and material consumption, as well as waste generation, remain within predictable ranges, and relevant data is available for analysis. Actions are not reactive but form part of ongoing management practices.\nThis level indicates operational stability in environmental performance and allows for further optimization of resource efficiency.'
        },
        yellow: {
            pl: 'W obszarze środowiskowym widoczne są pierwsze oznaki niestabilności lub braku pełnej kontroli nad zużyciem zasobów. Dane mogą być niekompletne, a analiza prowadzona nieregularnie. Wpływ działalności pozostaje pod kontrolą, jednak brakuje systematyczności w monitorowaniu i ocenie efektywności.\nTaki poziom ogranicza pełną kontrolę nad efektywnością wykorzystania zasobów i utrudnia porównywanie wyników w czasie.',
            en: 'Initial signs of instability or limited control over resource consumption are visible in the environmental area. Data may be incomplete, and analysis may be conducted irregularly. The overall impact remains manageable, but systematic monitoring and performance evaluation are lacking.\nThis level limits full control over resource efficiency and makes performance comparison over time more difficult.'
        },
        orange: {
            pl: 'Obszar środowiskowy funkcjonuje w sposób niespójny i reaktywny. Zużycie energii, materiałów lub generowanie odpadów nie są monitorowane w sposób umożliwiający bieżącą kontrolę trendów. Brakuje porównywalnych danych lub odpowiedzialności za ich analizę.\nTaki poziom utrudnia planowanie działań optymalizacyjnych oraz ocenę trendów w dłuższej perspektywie.',
            en: 'The environmental area operates inconsistently and reactively. Energy and material consumption or waste generation are not monitored in a way that allows effective trend control. Comparable data or clear accountability for analysis may be missing.\nThis level makes long-term planning and trend evaluation significantly more difficult.'
        },
        critical: {
            pl: 'Organizacja nie posiada uporządkowanego systemu monitorowania wpływu środowiskowego. Zużycie zasobów oraz generowanie odpadów nie są mierzone w sposób pozwalający na ocenę trendów ani podejmowanie świadomych decyzji. Brakuje odpowiedzialności, danych porównawczych oraz spójnych zasad działania.\nTaki poziom uniemożliwia świadome zarządzanie wpływem środowiskowym i ogranicza możliwość podejmowania decyzji w oparciu o dane.',
            en: 'The organization lacks a structured system for monitoring environmental impact. Resource consumption and waste generation are not measured in a way that enables trend assessment or informed decision-making. Accountability, comparable data, and consistent principles may be absent.\nThis level prevents conscious environmental impact management and limits data-driven decision-making.'
        }
    },
    S: {
        green: {
            pl: 'Organizacja funkcjonuje w oparciu o stabilny i przewidywalny model pracy. Struktura zespołu jest jasno określona, role i odpowiedzialności są zrozumiałe, a warunki pracy pozostają uporządkowane. Rotacja pracowników jest na kontrolowanym poziomie, a komunikacja wewnętrzna umożliwia sprawne rozwiązywanie bieżących kwestii.\nTaki poziom sprzyja stabilności organizacyjnej i pozwala budować dalszy rozwój kompetencji zespołu.',
            en: 'The organization operates within a stable and predictable working model. Team structure is clearly defined, roles and responsibilities are understood, and working conditions remain structured. Employee turnover is at a controlled level, and internal communication enables efficient resolution of ongoing matters.\nThis level supports organizational stability and enables further development of team competencies.'
        },
        yellow: {
            pl: 'W obszarze organizacji pracy i stabilności zespołu widoczne są pierwsze oznaki nieregularności. Mogą pojawiać się okresowe przeciążenia, niejasności w podziale odpowiedzialności lub wzrost rotacji. Procesy funkcjonują, jednak wymagają większej systematyczności i doprecyzowania.\nTaki poziom ogranicza pełną przewidywalność pracy zespołu i utrudnia długofalowe planowanie zasobów personalnych.',
            en: 'Initial signs of inconsistency are visible in work organization and team stability. Periodic overload, unclear responsibility allocation, or increased turnover may occur. Processes function but require greater structure and clarity.\nThis level limits full predictability of team performance and makes long-term workforce planning more difficult.'
        },
        orange: {
            pl: 'Organizacja pracy ma charakter reaktywny. Występują powtarzające się przeciążenia zespołu, zmiany personalne lub brak jasnej zastępowalności kluczowych ról. Stabilność kadrowa jest ograniczona, a odpowiedzialności nie zawsze są jednoznacznie przypisane.\nTaki poziom utrudnia utrzymanie ciągłości organizacyjnej i osłabia zdolność do stabilnego funkcjonowania zespołu.',
            en: 'Work organization operates in a reactive manner. Recurring team overload, personnel changes, or lack of clear role substitution may occur. Workforce stability is limited, and responsibilities are not always clearly assigned.\nThis level weakens organizational continuity and reduces the ability to maintain stable team performance.'
        },
        critical: {
            pl: 'Organizacja nie posiada stabilnej struktury zespołowej ani uporządkowanego modelu pracy. Wysoka rotacja, brak jasnych odpowiedzialności oraz nieprzewidywalne obciążenie pracą wpływają na funkcjonowanie całej organizacji. Warunki pracy nie są zarządzane w sposób systemowy.\nTaki poziom uniemożliwia świadome zarządzanie kapitałem ludzkim i znacząco ogranicza stabilność organizacyjną.',
            en: 'The organization lacks a stable team structure and a structured working model. High turnover, unclear responsibilities, and unpredictable workload affect overall performance. Working conditions are not managed in a systematic way.\nThis level prevents conscious human capital management and significantly limits organizational stability.'
        }
    },
    G: {
        green: {
            pl: 'Organizacja funkcjonuje w oparciu o uporządkowany system zgodności z przepisami oraz zasadami formalnymi. Dokumentacja jest aktualna, zakresy odpowiedzialności są jasno określone, a procesy podlegają regularnemu nadzorowi. Wymogi regulacyjne i umowne są włączone w codzienne funkcjonowanie firmy.\nTaki poziom zapewnia stabilność formalną i pozwala utrzymywać spójność działań w dłuższej perspektywie.',
            en: 'The organization operates within a structured compliance framework aligned with applicable regulations and formal requirements. Documentation is up to date, responsibilities are clearly assigned, and processes are subject to regular oversight. Regulatory and contractual obligations are embedded in daily operations.\nThis level ensures formal stability and supports long-term operational consistency.'
        },
        yellow: {
            pl: 'W obszarze zgodności widoczne są pierwsze oznaki niespójności lub braku pełnej aktualizacji dokumentacji. Część procedur może funkcjonować nieformalnie lub bez jednoznacznego przypisania odpowiedzialności. System nadzoru istnieje, jednak nie zawsze jest prowadzony w sposób systematyczny.\nTaki poziom ogranicza pełną kontrolę nad zgodnością działań i utrudnia zachowanie spójności formalnej w czasie.',
            en: 'Initial signs of inconsistency or incomplete documentation updates are visible in the compliance area. Some procedures may function informally or without clearly assigned responsibility. Oversight mechanisms exist but are not always applied systematically.\nThis level limits full control over compliance and makes maintaining formal consistency over time more challenging.'
        },
        orange: {
            pl: 'Obszar zgodności funkcjonuje w sposób reaktywny. Dokumentacja może być nieaktualna, odpowiedzialności rozproszone, a nadzór prowadzony sporadycznie. Działania formalne podejmowane są głównie w odpowiedzi na bieżące potrzeby, bez stałego systemu kontroli.\nTaki poziom utrudnia utrzymanie uporządkowanego modelu zarządzania formalnego i osłabia przewidywalność działań organizacyjnych.',
            en: 'The compliance area operates in a reactive manner. Documentation may be outdated, responsibilities dispersed, and oversight applied irregularly. Formal actions are taken mainly in response to immediate needs rather than within a structured control system.\nThis level weakens the organization\'s ability to maintain a structured governance model and reduces predictability in formal processes.'
        },
        critical: {
            pl: 'Organizacja nie posiada uporządkowanego systemu zarządzania zgodnością. Dokumentacja jest niekompletna lub niespójna, odpowiedzialności nie są jasno przypisane, a nadzór nad wymaganiami regulacyjnymi ma charakter incydentalny. Brakuje jednolitego modelu formalnego funkcjonowania.\nTaki poziom uniemożliwia świadome zarządzanie zgodnością i znacząco ogranicza stabilność formalną organizacji.',
            en: 'The organization lacks a structured compliance management system. Documentation may be incomplete or inconsistent, responsibilities are not clearly assigned, and oversight of regulatory requirements is incidental. There is no unified formal governance model.\nThis level prevents conscious compliance management and significantly limits the organization\'s formal stability.'
        }
    },
    SC: {
        green: {
            pl: 'Współpraca z partnerami zewnętrznymi funkcjonuje w sposób uporządkowany i przewidywalny. Relacje z dostawcami i podwykonawcami są stabilne, zakresy odpowiedzialności są jasno określone, a warunki współpracy pozostają przejrzyste. Organizacja posiada rozeznanie w strukturze swojego łańcucha dostaw oraz monitoruje kluczowe zależności.\nTaki poziom sprzyja stabilności współpracy i pozwala rozwijać relacje partnerskie w sposób długofalowy.',
            en: 'Cooperation with external partners operates in a structured and predictable manner. Relationships with suppliers and subcontractors are stable, responsibilities are clearly defined, and cooperation terms remain transparent. The organization understands its supply chain structure and monitors key dependencies.\nThis level supports partnership stability and enables long-term development of external relationships.'
        },
        yellow: {
            pl: 'W obszarze współpracy z partnerami widoczne są pierwsze oznaki nieregularności. Część relacji może być oparta na nieformalnych ustaleniach, a monitoring zależności nie jest prowadzony systematycznie. Struktura łańcucha dostaw funkcjonuje, jednak wymaga większej przejrzystości i uporządkowania.\nTaki poziom ogranicza pełną kontrolę nad zależnościami zewnętrznymi i utrudnia ocenę stabilności współpracy w czasie.',
            en: 'Initial signs of irregularity are visible in cooperation with external partners. Some relationships may rely on informal arrangements, and dependency monitoring is not conducted systematically. The supply chain structure functions but requires greater transparency and organization.\nThis level limits full control over external dependencies and makes long-term stability assessment more difficult.'
        },
        orange: {
            pl: 'Relacje z partnerami zewnętrznymi mają charakter reaktywny i niespójny. Brakuje uporządkowanej struktury współpracy, a zależności od wybranych dostawców lub podwykonawców nie są analizowane w sposób systemowy. Monitoring jakości i terminowości współpracy jest ograniczony lub prowadzony sporadycznie.\nTaki poziom utrudnia planowanie współpracy oraz osłabia przewidywalność funkcjonowania łańcucha dostaw.',
            en: 'Relationships with external partners operate in a reactive and inconsistent manner. There is no structured cooperation framework, and dependencies on selected suppliers or subcontractors are not analyzed systematically. Monitoring of quality and delivery performance is limited or irregular.\nThis level weakens supply chain predictability and makes cooperation planning more difficult.'
        },
        critical: {
            pl: 'Organizacja nie posiada uporządkowanego modelu zarządzania współpracą z partnerami zewnętrznymi. Zależności w łańcuchu dostaw nie są identyfikowane ani monitorowane, a relacje opierają się głównie na bieżących ustaleniach. Brakuje spójnego nadzoru nad stabilnością współpracy.\nTaki poziom uniemożliwia świadome zarządzanie zależnościami zewnętrznymi i znacząco ogranicza stabilność łańcucha dostaw.',
            en: 'The organization lacks a structured model for managing external partnerships. Supply chain dependencies are neither identified nor monitored, and relationships rely primarily on ad hoc arrangements. There is no consistent oversight of cooperation stability.\nThis level prevents conscious management of external dependencies and significantly limits supply chain stability.'
        }
    }
};

/**
 * Gets extended pillar comment for a specific pillar and state
 * @param {string} pillar - Pillar code ('E', 'S', 'G', 'SC')
 * @param {string} state - State ('green', 'yellow', 'orange', 'critical')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Extended pillar comment text
 */
function getExtendedPillarComment(pillar, state, language = 'pl') {
    const normalizedPillar = pillar?.toUpperCase();
    const normalizedState = state?.toLowerCase();

    return EXTENDED_PILLAR_COMMENTS[normalizedPillar]?.[normalizedState]?.[language] || '';
}

// Legacy industry code mappings (for backward compatibility)
const INDUSTRY_CODE_ALIASES = {
    'energy_raw_materials': 'energy_resources',
    'trade_retail': 'retail_trade',
    'finance': 'finance_fintech'
};

/**
 * Normalizes industry code to the standard format
 * @param {string} industryId - Industry ID (may be legacy or standard)
 * @returns {string} Normalized industry ID
 */
function normalizeIndustryCode(industryId) {
    return INDUSTRY_CODE_ALIASES[industryId] || industryId;
}

/**
 * Gets industry comment for Detailed Pillar Results section
 * @param {string} industryId - Industry ID
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry comment text
 */
function getIndustryComment(industryId, pillar, language = 'pl') {
    const normalizedId = normalizeIndustryCode(industryId);
    const industryData = INDUSTRY_COMMENTS[normalizedId];
    if (!industryData) return '';

    const pillarData = industryData[pillar];
    if (!pillarData) return '';

    return pillarData[language] || pillarData['en'] || '';
}

/**
 * Gets industry risk intro for TOP 3 section
 * @param {string} industryId - Industry ID
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry risk intro text
 */
function getIndustryRiskIntro(industryId, pillar, language = 'pl') {
    const normalizedId = normalizeIndustryCode(industryId);
    const industryData = INDUSTRY_RISK_INTRO[normalizedId];
    if (!industryData) return '';

    const pillarData = industryData[pillar];
    if (!pillarData) return '';

    return pillarData[language] || pillarData['en'] || '';
}

/**
 * Gets the full comment text for a given comment type and state
 * @param {string} commentType - Comment type (EXECUTIVE_SUMMARY, DATA, etc.)
 * @param {string} state - State (green, yellow, red, orange, critical)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Full comment text
 */
function getCommentText(commentType, state, language = 'pl') {
    const texts = COMMENT_TEXTS[commentType];
    if (!texts) return '';

    const stateTexts = texts[state];
    if (!stateTexts) return '';

    return stateTexts[language] || stateTexts['pl'] || '';
}

/**
 * Gets all comment texts for calculated states
 * @param {Object} commentStates - Result from calculateAllCommentStates()
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} All comment texts keyed by comment type
 */
function getAllCommentTexts(commentStates, language = 'pl') {
    const result = {};

    for (const [commentType, stateData] of Object.entries(commentStates)) {
        result[commentType] = {
            state: stateData.state,
            label: getStateLabel(commentType, stateData.state),
            text: getCommentText(commentType, stateData.state, language),
            readiness: stateData.readiness,
            gap: stateData.gap
        };
    }

    return result;
}

// ============================================================================
// SECTION 6: TOP 3 Risk Comments Functions
// ============================================================================

/**
 * TOP display count based on ES state
 * Per spec: green -> TOP3, yellow -> TOP2, orange/red -> TOP1
 * System always calculates TOP3 in background, this is presentation layer only
 */
const TOP_DISPLAY_COUNT = {
    green: 3,
    yellow: 2,
    orange: 1,
    critical: 1
};

/**
 * Gets how many TOP areas to display based on Executive Summary state
 * @param {string} esState - ES state ('green', 'yellow', 'orange', 'critical')
 * @returns {number} Number of TOP areas to display (1, 2, or 3)
 */
function getTopDisplayCount(esState) {
    return TOP_DISPLAY_COUNT[esState] || 1;
}

/**
 * Filters TOP 3 areas for display based on ES state
 * @param {Array} top3Areas - All TOP 3 areas (always calculated)
 * @param {string} esState - ES state
 * @returns {Array} Filtered areas for display
 */
function filterTop3ForDisplay(top3Areas, esState) {
    const displayCount = getTopDisplayCount(esState);
    return top3Areas.slice(0, displayCount);
}

/**
 * Gets all three risk comments (business, reputation, operational) for a given pillar and state
 * Used for displaying parallel risk comments for each TOP 3 area
 * Per Korekta.pdf Task #4: topRiskComments[pillar][state][riskType][lang]
 *
 * @param {string} pillar - Pillar code ('E', 'S', 'G', 'SC')
 * @param {string} state - State ('green', 'yellow', 'orange', 'critical')
 * @param {string} language - Language code ('pl' or 'en')
 * @param {string} industryId - Optional industry ID for industry-specific comments
 * @returns {Object} All three risk comments { business, reputation, operational }
 */
function getTop3RiskComments(pillar, state, language = 'pl', industryId = null) {
    // Normalize pillar code
    const normalizedPillar = pillar?.toUpperCase();
    if (!['E', 'S', 'G', 'SC'].includes(normalizedPillar)) {
        console.warn(`Invalid pillar: ${pillar}, defaulting to generic comments`);
    }

    // For all risk types, orange state uses yellow comment (no separate orange) - for fallback only
    const effectiveState = (state === 'orange') ? 'yellow' : state;

    // Try to get industry-specific comments first
    if (industryId && INDUSTRY_TOP_RISKS) {
        const normalizedIndustryId = normalizeIndustryCode(industryId);
        const industryData = INDUSTRY_TOP_RISKS[normalizedIndustryId];

        if (industryData && industryData[normalizedPillar]) {
            const pillarData = industryData[normalizedPillar];
            return {
                business: pillarData.Business?.[state]?.[language] ||
                          pillarData.Business?.[effectiveState]?.[language] ||
                          COMMENT_TEXTS.TOP3_BUSINESS_RISK[effectiveState]?.[language] || '',
                reputation: pillarData.Reputation?.[state]?.[language] ||
                            pillarData.Reputation?.[effectiveState]?.[language] ||
                            COMMENT_TEXTS.TOP3_REPUTATION_RISK[effectiveState]?.[language] || '',
                operational: pillarData.Operational?.[state]?.[language] ||
                             pillarData.Operational?.[effectiveState]?.[language] ||
                             COMMENT_TEXTS.TOP3_OPERATIONAL_RISK[effectiveState]?.[language] || ''
            };
        }
    }

    // Fallback to generic comments
    return {
        business: COMMENT_TEXTS.TOP3_BUSINESS_RISK[effectiveState]?.[language] || '',
        reputation: COMMENT_TEXTS.TOP3_REPUTATION_RISK[effectiveState]?.[language] || '',
        operational: COMMENT_TEXTS.TOP3_OPERATIONAL_RISK[effectiveState]?.[language] || ''
    };
}

/**
 * Gets risk comment for a specific risk type and state
 *
 * @param {string} riskType - Risk type ('business', 'reputation', 'operational')
 * @param {string} state - State ('green', 'yellow', 'orange', 'critical')
 * @param {string} language - Language code ('pl' or 'en')
 * @param {string} pillar - Optional pillar code ('E', 'S', 'G', 'SC')
 * @param {string} industryId - Optional industry ID for industry-specific comments
 * @returns {string} Risk comment text
 */
function getTop3RiskComment(riskType, state, language = 'pl', pillar = null, industryId = null) {
    const commentMap = {
        'business': 'TOP3_BUSINESS_RISK',
        'reputation': 'TOP3_REPUTATION_RISK',
        'operational': 'TOP3_OPERATIONAL_RISK'
    };

    const riskTypeMap = {
        'business': 'Business',
        'reputation': 'Reputation',
        'operational': 'Operational'
    };

    const commentType = commentMap[riskType];
    if (!commentType) return '';

    // For all risk types, orange state uses yellow comment (for fallback only)
    const effectiveState = (state === 'orange') ? 'yellow' : state;

    // Try to get industry-specific comment first
    if (industryId && pillar && INDUSTRY_TOP_RISKS) {
        const normalizedIndustryId = normalizeIndustryCode(industryId);
        const normalizedPillar = pillar?.toUpperCase();
        const riskTypeKey = riskTypeMap[riskType];

        const industryComment = INDUSTRY_TOP_RISKS[normalizedIndustryId]?.[normalizedPillar]?.[riskTypeKey]?.[state]?.[language] ||
                               INDUSTRY_TOP_RISKS[normalizedIndustryId]?.[normalizedPillar]?.[riskTypeKey]?.[effectiveState]?.[language];

        if (industryComment) {
            return industryComment;
        }
    }

    // Fallback to generic comment
    return COMMENT_TEXTS[commentType]?.[effectiveState]?.[language] || '';
}

// ============================================================================
// SECTION 7: Horizon Comments Functions
// ============================================================================

/**
 * Gets horizon comment data for a specific horizon (30, 90, or 180 days)
 * @param {number} horizon - Horizon in days (30, 90, or 180)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Horizon comment data { title, description, actions, expectedResult }
 */
function getHorizonComment(horizon, language = 'pl') {
    const horizonKey = `HORIZON_${horizon}`;
    const data = COMMENT_TEXTS[horizonKey];

    if (!data) return null;

    return {
        horizon,
        title: data.title[language] || data.title['pl'],
        description: data.description[language] || data.description['pl'],
        actions: data.actions[language] || data.actions['pl'],
        expectedResult: data.expectedResult[language] || data.expectedResult['pl']
    };
}

/**
 * Gets all horizon comments (30, 90 days)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} All horizon comments keyed by horizon
 */
function getAllHorizonComments(language = 'pl') {
    return {
        30: getHorizonComment(30, language),
        90: getHorizonComment(90, language)
    };
}

/**
 * Gets control questions for a specific horizon
 * @param {number} horizon - Horizon in days (30 or 90)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string[]} Array of control questions
 */
function getControlQuestions(horizon, language = 'pl') {
    const questionsKey = `CONTROL_QUESTIONS_${horizon}`;
    const questions = COMMENT_TEXTS[questionsKey];

    if (!questions) return [];

    return questions[language] || questions['pl'];
}

/**
 * Gets all control questions for all horizons
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Control questions keyed by horizon
 */
function getAllControlQuestions(language = 'pl') {
    return {
        30: getControlQuestions(30, language),
        90: getControlQuestions(90, language)
    };
}

// ============================================================================
// SECTION 8: Data Quality & Market Readiness Functions
// ============================================================================

/**
 * Data quality thresholds (using R(S) from X6, X10, X11)
 * R >= 0.75 = green, 0.40 <= R < 0.75 = yellow, R < 0.40 = red
 */
const DATA_THRESHOLDS = {
    GREEN: 0.75,
    YELLOW: 0.40
};

/**
 * Gets data quality state based on R index
 * @param {number} R - Readiness index (0-1)
 * @returns {string} State: 'green', 'yellow', or 'red'
 */
function getDataQualityState(R) {
    if (R >= DATA_THRESHOLDS.GREEN) return 'green';
    if (R >= DATA_THRESHOLDS.YELLOW) return 'yellow';
    return 'red';
}

/**
 * Gets data quality comment based on R index
 * @param {number} R - Readiness index (0-1) from X6, X10, X11
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Data quality comment { state, label, text }
 */
function getDataQualityComment(R, language = 'pl') {
    const state = getDataQualityState(R);
    const data = COMMENT_TEXTS.DATA_QUALITY[state];

    return {
        state,
        label: data.label[language] || data.label['pl'],
        text: data[language] || data['pl']
    };
}

/**
 * Gets market readiness comment based on R index
 * @param {number} R - Readiness index (0-1) from X6, X10, X11
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Market readiness comment { state, label, text }
 */
function getMarketReadinessComment(R, language = 'pl') {
    const state = getDataQualityState(R); // Same thresholds
    const data = COMMENT_TEXTS.MARKET_READINESS_EXTENDED[state];

    return {
        state,
        label: data.label[language] || data.label['pl'],
        text: data[language] || data['pl']
    };
}

// ============================================================================
// SECTION 9: Materiality (MS) Comments Functions
// ============================================================================

/**
 * Gets materiality state based on MS value
 * MS >= 81 = critical, 46 <= MS < 81 = high, MS < 46 = moderate
 * @param {number} ms - Materiality Score (0-100)
 * @returns {string} State: 'critical', 'high', or 'moderate'
 */
function getMaterialityState(ms) {
    if (ms >= COMMENT_TEXTS.MATERIALITY.critical.threshold) return 'critical';
    if (ms >= COMMENT_TEXTS.MATERIALITY.high.threshold) return 'high';
    return 'moderate';
}

/**
 * Gets materiality color based on MS state
 * @param {string} state - Materiality state
 * @returns {string} Color: 'red', 'orange', or 'green'
 */
function getMaterialityColor(state) {
    const colorMap = {
        critical: 'red',
        high: 'orange',
        moderate: 'green'
    };
    return colorMap[state] || 'green';
}

/**
 * Gets materiality comment for a pillar based on MS value
 * @param {number} ms - Materiality Score (0-100)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Materiality comment { state, color, label, text }
 */
function getMaterialityComment(ms, language = 'pl') {
    const state = getMaterialityState(ms);
    const data = COMMENT_TEXTS.MATERIALITY[state];

    return {
        state,
        color: getMaterialityColor(state),
        label: data.label[language] || data.label['pl'],
        text: data[language] || data['pl'],
        ms: Math.round(ms)
    };
}

/**
 * Gets materiality comments for all pillars
 * @param {Object} msValues - MS values { E, S, G, SC }
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Materiality comments for each pillar
 */
function getAllMaterialityComments(msValues, language = 'pl') {
    return {
        E: getMaterialityComment(msValues.E, language),
        S: getMaterialityComment(msValues.S, language),
        G: getMaterialityComment(msValues.G, language),
        SC: getMaterialityComment(msValues.SC, language)
    };
}

/**
 * Generates complete report comments package
 * Combines all comment types into a single object for PDF generation
 *
 * @param {Object} params - All required parameters
 * @param {number} params.coreScore - CORE score (0-100)
 * @param {Object} params.answers - All answers including EXTENDED
 * @param {Object} params.msValues - MS values { E, S, G, SC }
 * @param {Array} params.top3Areas - TOP 3 areas from ERRS calculation
 * @param {number} params.dataReadinessR - R index for data quality (0-1)
 * @param {string} params.language - Language code ('pl' or 'en')
 * @returns {Object} Complete comments package for report
 */
function generateReportComments(params) {
    const {
        coreScore,
        answers,
        msValues,
        top3Areas,
        dataReadinessR,
        language = 'pl'
    } = params;

    // Get ES state and display count
    const esState = getExecutiveSummaryState(coreScore);
    const displayCount = getTopDisplayCount(esState);
    const displayedTop3 = filterTop3ForDisplay(top3Areas, esState);

    // Generate TOP 3 risk comments for displayed areas
    const top3Comments = displayedTop3.map(area => ({
        area: area.area,
        errs: area.errs,
        timeline: area.timeline,
        comments: getTop3RiskComments(area.area, esState, language)
    }));

    return {
        // Executive Summary
        executiveSummary: {
            state: esState,
            label: getStateLabel('EXECUTIVE_SUMMARY', esState),
            text: getCommentText('EXECUTIVE_SUMMARY', esState, language)
        },

        // TOP 3 with display logic
        top3: {
            displayCount,
            esState,
            areas: top3Comments
        },

        // Horizons with control questions
        horizons: {
            30: {
                ...getHorizonComment(30, language),
                controlQuestions: getControlQuestions(30, language)
            },
            90: {
                ...getHorizonComment(90, language),
                controlQuestions: getControlQuestions(90, language)
            }
        },

        // Data & Market Readiness
        dataAndReadiness: {
            data: getDataQualityComment(dataReadinessR, language),
            marketReadiness: getMarketReadinessComment(dataReadinessR, language)
        },

        // Materiality per pillar
        materiality: getAllMaterialityComments(msValues, language),

        // Risks comment (inherited from ES)
        risks: {
            state: esState,
            label: getStateLabel('RISKS', esState),
            text: getCommentText('RISKS', esState, language)
        }
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

// For browser environment
if (typeof window !== 'undefined') {
    window.ESGComments = {
        // Constants
        NORMALIZED_ANSWER_VALUES,
        COMMENT_QUESTION_GROUPS,
        READINESS_THRESHOLDS,
        ES_SCORE_THRESHOLDS,
        STATE_LABELS,
        COMMENT_TEXTS,
        TOP_DISPLAY_COUNT,
        DATA_THRESHOLDS,
        INDUSTRY_COMMENTS,
        INDUSTRY_RISK_INTRO,
        INDUSTRY_CODE_ALIASES,
        EXTENDED_PILLAR_COMMENTS,
        INDUSTRY_TOP_RISKS,
        PLAN_COMMENTS,

        // Core functions
        normalizeAnswer,
        calculateGap,
        calculateReadiness,
        getReadinessColorState,
        getExecutiveSummaryState,
        calculateCommentState,
        calculateAllCommentStates,
        getStateLabel,
        getCommentText,
        getAllCommentTexts,

        // TOP 3 Risk functions
        getTop3RiskComments,
        getTop3RiskComment,
        getTopDisplayCount,
        filterTop3ForDisplay,

        // Horizon functions
        getHorizonComment,
        getAllHorizonComments,
        getControlQuestions,
        getAllControlQuestions,

        // Data & Market Readiness functions
        getDataQualityState,
        getDataQualityComment,
        getMarketReadinessComment,

        // Materiality functions
        getMaterialityState,
        getMaterialityColor,
        getMaterialityComment,
        getAllMaterialityComments,

        // Industry Comments functions
        normalizeIndustryCode,
        getIndustryComment,
        getIndustryRiskIntro,
        getExtendedPillarComment,

        // PLAN Comments functions (company-type specific)
        PLAN_COMMENTS,
        getPlanComment,
        getPlanCommentsForType,

        // Report generation
        generateReportComments
    };
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Constants
        NORMALIZED_ANSWER_VALUES,
        COMMENT_QUESTION_GROUPS,
        READINESS_THRESHOLDS,
        ES_SCORE_THRESHOLDS,
        STATE_LABELS,
        COMMENT_TEXTS,
        TOP_DISPLAY_COUNT,
        INDUSTRY_TOP_RISKS,
        DATA_THRESHOLDS,
        INDUSTRY_COMMENTS,
        INDUSTRY_RISK_INTRO,
        INDUSTRY_CODE_ALIASES,
        EXTENDED_PILLAR_COMMENTS,
        PLAN_COMMENTS,

        // Core functions
        normalizeAnswer,
        calculateGap,
        calculateReadiness,
        getReadinessColorState,
        getExecutiveSummaryState,
        calculateCommentState,
        calculateAllCommentStates,
        getStateLabel,
        getCommentText,
        getAllCommentTexts,

        // TOP 3 Risk functions
        getTop3RiskComments,
        getTop3RiskComment,
        getTopDisplayCount,
        filterTop3ForDisplay,

        // Horizon functions
        getHorizonComment,
        getAllHorizonComments,
        getControlQuestions,
        getAllControlQuestions,

        // Data & Market Readiness functions
        getDataQualityState,
        getDataQualityComment,
        getMarketReadinessComment,

        // Materiality functions
        getMaterialityState,
        getMaterialityColor,
        getMaterialityComment,
        getAllMaterialityComments,

        // Industry Comments functions
        normalizeIndustryCode,
        getIndustryComment,
        getIndustryRiskIntro,
        getExtendedPillarComment,

        // PLAN Comments functions (company-type specific)
        getPlanComment,
        getPlanCommentsForType,

        // Report generation
        generateReportComments
    };
}

},{"./industryTopRisks.js":10,"./planComments.js":11}],2:[function(require,module,exports){
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
},{"./feature-flags":3}],3:[function(require,module,exports){
/**
 * Feature Flags Module
 * Controls which modules are active for gradual rollout
 */

const SCORING_VERSION = '1.0.0';
const ENGINE_VERSION = '1.0.0';  // Relevance Engine version (v1 = MS variant B)
const INDUSTRY_LOOKUP_VERSION = '1.0.0';  // Industry lookup table version
const ROI_PROOF_VERSION = '1.0.0';  // ROI Proof module version
const VENDOR_EXPORT_VERSION = '1.0.0';  // Vendor export module version
const THRESHOLDS_VERSION = '1.0.0';  // Thresholds module version (state transitions)

/**
 * Feature Flags - control which modules are active
 * These flags allow gradual rollout of features without code changes
 *
 * Order of enablement (per implementation plan):
 * 1. roi_proof_enabled - can work before lookup (uses RE rankings)
 * 2. industry_lookup_enabled - when lookup table is ready
 * 3. whatif_and_exports_enabled - last (scaling & B2B sales)
 */
const FEATURE_FLAGS = {
    industry_lookup_enabled: false,   // Krok 3: Dynamic industry profiling
    roi_proof_enabled: false,         // Krok 4: ROI proof for CFO/CEO
    whatif_and_exports_enabled: false // Krok 5: Simulations + Vendor exports
};

/**
 * Set feature flag value
 * @param {string} flagName - Name of the flag
 * @param {boolean} value - New value
 */
function setFeatureFlag(flagName, value) {
    if (FEATURE_FLAGS.hasOwnProperty(flagName)) {
        FEATURE_FLAGS[flagName] = value;
    }
}

/**
 * Get feature flag value
 * @param {string} flagName - Name of the flag
 * @returns {boolean} Flag value
 */
function getFeatureFlag(flagName) {
    return FEATURE_FLAGS[flagName] || false;
}

module.exports = {
    SCORING_VERSION,
    ENGINE_VERSION,
    INDUSTRY_LOOKUP_VERSION,
    ROI_PROOF_VERSION,
    VENDOR_EXPORT_VERSION,
    THRESHOLDS_VERSION,
    FEATURE_FLAGS,
    setFeatureFlag,
    getFeatureFlag
};

},{}],4:[function(require,module,exports){
/**
 * Financial Impact Calculator Module
 * Calculates potential financial impact based on company revenue and ESG state.
 *
 * Based on specification from docs/COMMENTS.md:
 * - Green (81-100%): 0–0.5% of annual revenue
 * - Yellow (51-80%): 0.5–1% of annual revenue
 * - Orange (31-50%): 1–2% of annual revenue
 * - Critical (0-30%): 2–4% of annual revenue
 *
 * Formula:
 *   minAmount = revenueBase * minPercent
 *   maxAmount = revenueBase * maxPercent
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Revenue ranges with their PLN values
 * For ranges, we use the midpoint as the base for calculation
 * For "powyżej 250 mln", we use 250M as the base (lower bound only)
 */
const REVENUE_RANGES = {
  'do 500 tys. PLN': {
    min: 0,
    max: 500_000,
    base: 250_000, // midpoint
    key: 'LT_500K'
  },
  '500 tys. – 2 mln PLN': {
    min: 500_000,
    max: 2_000_000,
    base: 1_250_000, // midpoint
    key: '500K_2M'
  },
  '2 mln – 10 mln PLN': {
    min: 2_000_000,
    max: 10_000_000,
    base: 6_000_000, // midpoint
    key: '2M_10M'
  },
  '10 mln – 50 mln PLN': {
    min: 10_000_000,
    max: 50_000_000,
    base: 30_000_000, // midpoint
    key: '10M_50M'
  },
  '50 mln – 250 mln PLN': {
    min: 50_000_000,
    max: 250_000_000,
    base: 150_000_000, // midpoint
    key: '50M_250M'
  },
  'powyżej 250 mln PLN': {
    min: 250_000_000,
    max: 250_000_000, // use min as max for this range
    base: 250_000_000, // use lower bound only (per spec: FIN_OVER250M_RULE)
    key: 'OVER_250M'
  }
};

/**
 * English revenue range mappings (for parsing English input)
 */
const REVENUE_RANGES_EN = {
  '< 1M EUR': 'do 500 tys. PLN',
  '1–10M EUR': '500 tys. – 2 mln PLN',
  '10–50M EUR': '2 mln – 10 mln PLN',
  '50–100M EUR': '10 mln – 50 mln PLN',
  '100–250M EUR': '50 mln – 250 mln PLN',
  '250M EUR+': 'powyżej 250 mln PLN'
};

/**
 * State to color mapping (from thresholds.js naming)
 */
const STATE_TO_COLOR = {
  'DOBRY': 'green',
  'UMIARKOWANY': 'yellow',
  'PODWYZSZONE_RYZYKO': 'orange',
  'KRYTYCZNY': 'critical',
  // Allow direct color names too
  'green': 'green',
  'yellow': 'yellow',
  'orange': 'orange',
  'critical': 'critical',
  'red': 'critical'
};

/**
 * Financial impact percentages by state
 * FIN_PERCENTS: Green 0–0.5%; Yellow 0.5–1%; Orange 1–2%; Critical 2–4%
 */
const FIN_PERCENTS = {
  green: {
    minPercent: 0,
    maxPercent: 0.005 // 0.5%
  },
  yellow: {
    minPercent: 0.005, // 0.5%
    maxPercent: 0.01   // 1%
  },
  orange: {
    minPercent: 0.01,  // 1%
    maxPercent: 0.02   // 2%
  },
  critical: {
    minPercent: 0.02,  // 2%
    maxPercent: 0.04   // 4%
  }
};

/**
 * Descriptive text templates for each state
 */
const IMPACT_TEXTS = {
  green: {
    pl: 'Szacowany potencjał poprawy efektywności operacyjnej wynosi 0%–0,5% rocznego obrotu. W tym poziomie system jest względnie uporządkowany, a potencjał dotyczy głównie optymalizacji procesów i redukcji drobnych nieefektywności.',
    en: 'The estimated potential for operational efficiency improvement is 0%–0.5% of annual revenue. At this level, systems are relatively structured, and the improvement potential is mainly related to process optimization and reducing minor inefficiencies.'
  },
  yellow: {
    pl: 'Szacowany potencjał poprawy efektywności operacyjnej wynosi 0,5%–1% rocznego obrotu. Poprawa standardów zarządzania i uporządkowanie kluczowych procesów może przynieść mierzalne oszczędności oraz ograniczyć koszty ryzyka.',
    en: 'The estimated potential for operational efficiency improvement is 0.5%–1% of annual revenue. Strengthening governance standards and structuring key processes may generate measurable financial gains and reduce risk costs.'
  },
  orange: {
    pl: 'Szacowany potencjał poprawy efektywności operacyjnej wynosi 1%–2% rocznego obrotu. Występujące luki organizacyjne oraz operacyjne mogą generować ukryte koszty, które przy systemowym uporządkowaniu można istotnie ograniczyć.',
    en: 'The estimated potential for operational efficiency improvement is 1%–2% of annual revenue. Organizational and operational gaps may be generating hidden costs that can be significantly reduced through systematic improvements.'
  },
  critical: {
    pl: 'Szacowany potencjał poprawy efektywności operacyjnej wynosi 2%–4% rocznego obrotu. Niski poziom dojrzałości systemowej może powodować znaczące koszty nieefektywności, ryzyka regulacyjnego oraz utraconych kontraktów.',
    en: 'The estimated potential for operational efficiency improvement is 2%–4% of annual revenue. A low level of system maturity may result in significant inefficiencies, regulatory exposure, and lost business opportunities.'
  }
};

/**
 * Disclaimer text
 */
const DISCLAIMER = {
  pl: 'Wartości mają charakter estymacyjny i zależą od struktury kosztowej oraz specyfiki działalności przedsiębiorstwa.',
  en: 'The values are estimates and depend on the cost structure and specific nature of the company\'s operations.'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize revenue range input to PLN key
 * @param {string} revenueRange - Revenue range string (PL or EN)
 * @returns {string|null} - Normalized PLN key or null if not found
 */
function normalizeRevenueRange(revenueRange) {
  if (!revenueRange) return null;

  // Check if it's already a PLN key
  if (REVENUE_RANGES[revenueRange]) {
    return revenueRange;
  }

  // Check if it's an English key
  if (REVENUE_RANGES_EN[revenueRange]) {
    return REVENUE_RANGES_EN[revenueRange];
  }

  // Try to match by patterns (handle slight variations)
  const normalized = revenueRange.toLowerCase().trim();

  if (normalized.includes('500 tys') && !normalized.includes('2 mln')) {
    return 'do 500 tys. PLN';
  }
  if (normalized.includes('500') && normalized.includes('2 mln')) {
    return '500 tys. – 2 mln PLN';
  }
  if (normalized.includes('2 mln') && normalized.includes('10 mln')) {
    return '2 mln – 10 mln PLN';
  }
  if (normalized.includes('10 mln') && normalized.includes('50 mln')) {
    return '10 mln – 50 mln PLN';
  }
  if (normalized.includes('50 mln') && normalized.includes('250 mln')) {
    return '50 mln – 250 mln PLN';
  }
  if (normalized.includes('powyżej 250') || normalized.includes('250m+') || normalized.includes('> 250')) {
    return 'powyżej 250 mln PLN';
  }
  if (normalized.includes('< 1m') || normalized.includes('1m eur')) {
    return 'do 500 tys. PLN';
  }

  return null;
}

/**
 * Normalize state to color
 * @param {string} state - State string (e.g., 'DOBRY', 'green', etc.)
 * @returns {string|null} - Color string or null if not found
 */
function normalizeState(state) {
  if (!state) return null;

  const normalized = state.toUpperCase();
  return STATE_TO_COLOR[normalized] || STATE_TO_COLOR[state.toLowerCase()] || null;
}

/**
 * Format number as currency string
 * @param {number} amount - Amount to format
 * @param {string} lang - Language ('pl' or 'en')
 * @returns {string} - Formatted string
 */
function formatCurrency(amount, lang = 'pl') {
  if (amount === 0) return '0 PLN';

  // Format with spaces as thousands separator for PLN
  const formatted = Math.round(amount).toLocaleString('pl-PL');
  return `${formatted} PLN`;
}

/**
 * Format percentage for display
 * @param {number} percent - Percentage as decimal (e.g., 0.005 for 0.5%)
 * @param {string} lang - Language
 * @returns {string} - Formatted percentage string
 */
function formatPercent(percent, lang = 'pl') {
  const value = (percent * 100).toFixed(1).replace('.0', '');
  return lang === 'pl' ? value.replace('.', ',') + '%' : value + '%';
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Calculate financial impact amounts
 *
 * @param {string} revenueRange - Revenue range (PL or EN format)
 * @param {string} state - ESG state ('DOBRY', 'green', 'KRYTYCZNY', etc.)
 * @returns {Object|null} - Calculation result or null if invalid input
 */
function calculateFinancialImpact(revenueRange, state) {
  const normalizedRevenue = normalizeRevenueRange(revenueRange);
  const color = normalizeState(state);

  if (!normalizedRevenue || !color) {
    return null;
  }

  const revenueData = REVENUE_RANGES[normalizedRevenue];
  const percents = FIN_PERCENTS[color];

  if (!revenueData || !percents) {
    return null;
  }

  const minAmount = revenueData.base * percents.minPercent;
  const maxAmount = revenueData.base * percents.maxPercent;

  return {
    revenueRange: normalizedRevenue,
    revenueKey: revenueData.key,
    revenueBase: revenueData.base,
    state: color,
    minPercent: percents.minPercent,
    maxPercent: percents.maxPercent,
    minAmount: Math.round(minAmount),
    maxAmount: Math.round(maxAmount)
  };
}

/**
 * Get full financial impact content with text and calculations
 *
 * @param {string} revenueRange - Revenue range (PL or EN format)
 * @param {string} state - ESG state
 * @param {string} lang - Language ('pl' or 'en')
 * @returns {Object|null} - Full impact content or null if invalid input
 */
function getFinancialImpact(revenueRange, state, lang = 'pl') {
  const calculation = calculateFinancialImpact(revenueRange, state);

  if (!calculation) {
    return null;
  }

  const text = IMPACT_TEXTS[calculation.state]?.[lang] || IMPACT_TEXTS[calculation.state]?.en;
  const disclaimer = DISCLAIMER[lang] || DISCLAIMER.en;

  return {
    ...calculation,
    lang,
    text,
    disclaimer,
    formattedMin: formatCurrency(calculation.minAmount, lang),
    formattedMax: formatCurrency(calculation.maxAmount, lang),
    formattedRange: calculation.minAmount === 0
      ? (lang === 'pl' ? `do ${formatCurrency(calculation.maxAmount, lang)}` : `up to ${formatCurrency(calculation.maxAmount, lang)}`)
      : `${formatCurrency(calculation.minAmount, lang)} – ${formatCurrency(calculation.maxAmount, lang)}`,
    percentRange: calculation.minPercent === 0
      ? (lang === 'pl' ? `do ${formatPercent(calculation.maxPercent, lang)}` : `up to ${formatPercent(calculation.maxPercent, lang)}`)
      : `${formatPercent(calculation.minPercent, lang)} – ${formatPercent(calculation.maxPercent, lang)}`
  };
}

/**
 * Generate HTML block for financial impact section in PDF
 *
 * @param {string} revenueRange - Revenue range
 * @param {string} state - ESG state
 * @param {string} lang - Language
 * @returns {string} - HTML string or empty string if invalid input
 */
function generateFinancialImpactHtml(revenueRange, state, lang = 'pl') {
  const impact = getFinancialImpact(revenueRange, state, lang);

  if (!impact) {
    return '';
  }

  const title = lang === 'pl' ? 'Potencjalny wpływ finansowy' : 'Potential Financial Impact';
  const rangeLabel = lang === 'pl' ? 'Potencjalny zakres finansowy' : 'Potential financial scope';

  return `
    <div class="financial-impact-section" style="margin-top: 24px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #A3CC4B;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
        ${title}
      </h3>
      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        ${impact.text}
      </p>
      <div style="background: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px;">
        <span style="font-size: 13px; color: #6b7280;">${rangeLabel}:</span>
        <span style="font-size: 18px; font-weight: 600; color: #1f2937; margin-left: 8px;">
          ${impact.formattedRange}
        </span>
      </div>
      <p style="margin: 0; font-size: 12px; color: #9ca3af; font-style: italic;">
        ${impact.disclaimer}
      </p>
    </div>
  `;
}

/**
 * Get financial impact for all states (for comparison/debugging)
 *
 * @param {string} revenueRange - Revenue range
 * @param {string} lang - Language
 * @returns {Object} - Impact for all states
 */
function getAllStatesImpact(revenueRange, lang = 'pl') {
  return {
    green: getFinancialImpact(revenueRange, 'green', lang),
    yellow: getFinancialImpact(revenueRange, 'yellow', lang),
    orange: getFinancialImpact(revenueRange, 'orange', lang),
    critical: getFinancialImpact(revenueRange, 'critical', lang)
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main functions
  calculateFinancialImpact,
  getFinancialImpact,
  generateFinancialImpactHtml,
  getAllStatesImpact,

  // Helper functions
  normalizeRevenueRange,
  normalizeState,
  formatCurrency,
  formatPercent,

  // Constants (for testing/debugging)
  REVENUE_RANGES,
  REVENUE_RANGES_EN,
  STATE_TO_COLOR,
  FIN_PERCENTS,
  IMPACT_TEXTS,
  DISCLAIMER
};

},{}],5:[function(require,module,exports){
/**
 * ESG Scoring Module + Relevance Engine v1
 * Main entry point - re-exports all modules
 */

const featureFlags = require('./feature-flags');
const core = require('./core');
const relevance = require('./relevance');
const industryLookup = require('./industry-lookup');
const roiProof = require('./roi-proof');
const vendorExport = require('./vendor-export');
const thresholds = require('./thresholds');
const comments = require('./comments');
const industryRiskIntro = require('./industry-risk-intro');
const industryProfile = require('./industry-profile');
const industryHorizonExamples = require('./industry-horizon-examples');
const financialImpact = require('./financialImpact');

module.exports = {
    // Feature Flags
    ...featureFlags,

    // Core
    ...core,

    // Relevance Engine
    ...relevance,

    // Industry Lookup (Krok 3)
    ...industryLookup,

    // ROI Proof (Krok 4)
    ...roiProof,

    // Vendor Export (Krok 5)
    ...vendorExport,

    // Thresholds (Krok 6 - State transitions)
    ...thresholds,

    // Comments (Methodology-based comment generation)
    ...comments,

    // Industry Risk Introductions (Task #3 from Korekta.pdf)
    ...industryRiskIntro,

    // Industry Profiles (Task #5 from Korekta.pdf)
    ...industryProfile,

    // Industry Horizon Examples (Task #7 from Korekta.pdf)
    ...industryHorizonExamples,

    // Financial Impact (Revenue-based impact calculation)
    ...financialImpact
};

// Also export for browser if needed
if (typeof window !== 'undefined') {
    window.ESGScoring = module.exports;
}

},{"./comments":1,"./core":2,"./feature-flags":3,"./financialImpact":4,"./industry-horizon-examples":6,"./industry-lookup":7,"./industry-profile":8,"./industry-risk-intro":9,"./relevance":12,"./roi-proof":13,"./thresholds":14,"./vendor-export":15}],6:[function(require,module,exports){
/**
 * Industry Horizon Examples
 * Task #7 from Korekta.pdf
 *
 * Provides industry-specific examples for 30/90-day action plans.
 * These examples complement the generic system recommendations with concrete,
 * industry-relevant actions.
 *
 * Structure: industryHorizonExamples[industryCode][horizon][language]
 */

const INDUSTRY_HORIZON_EXAMPLES = {
    'construction': {
        30: {
            'pl': 'W budownictwie: stworzenie rejestru BHP dla podwykonawców, aktualizacja procedur bezpieczeństwa na placu budowy, weryfikacja kompletności dokumentacji pracowniczej.',
            'en': 'In construction: creating OHS register for subcontractors, updating site safety procedures, verifying completeness of employee documentation.'
        },
        90: {
            'pl': 'W budownictwie: wdrożenie procedur reagowania na incydenty środowiskowe (wycieki, odpady), przegląd procedur awaryjnych, szkolenia dla kadry kierowniczej z zakresu zarządzania ryzykiem środowiskowym.',
            'en': 'In construction: implementing environmental incident response procedures (spills, waste), reviewing emergency procedures, training management staff in environmental risk management.'
        }
    },

    'energy_resources': {
        30: {
            'pl': 'W energetyce: przegląd procedur bezpieczeństwa instalacji, aktualizacja planów awaryjnych, weryfikacja systemów monitoringu emisji i zużycia energii.',
            'en': 'In energy: reviewing installation safety procedures, updating emergency plans, verifying emissions and energy consumption monitoring systems.'
        },
        90: {
            'pl': 'W energetyce: analiza możliwości redukcji emisji CO₂, przegląd planów transformacji energetycznej, wdrożenie raportowania zgodnego z wymogami EU ETS.',
            'en': 'In energy: analyzing CO₂ emission reduction opportunities, reviewing energy transformation plans, implementing reporting compliant with EU ETS requirements.'
        }
    },

    'industrial_production': {
        30: {
            'pl': 'W produkcji: aktualizacja procedur BHP na liniach produkcyjnych, przegląd dokumentacji zarządzania odpadami przemysłowymi, weryfikacja zgodności z normami ISO 14001.',
            'en': 'In production: updating OHS procedures on production lines, reviewing industrial waste management documentation, verifying ISO 14001 compliance.'
        },
        90: {
            'pl': 'W produkcji: analiza efektywności energetycznej zakładu, wdrożenie monitoringu zużycia wody i energii, przegląd procedur kontroli jakości zgodnie z ISO 9001.',
            'en': 'In production: analyzing facility energy efficiency, implementing water and energy consumption monitoring, reviewing quality control procedures according to ISO 9001.'
        }
    },

    'logistics_transport': {
        30: {
            'pl': 'W logistyce: przegląd czasu pracy kierowców zgodnie z przepisami tachografowymi, aktualizacja procedur bezpieczeństwa transportu, weryfikacja licencji i uprawnień kierowców.',
            'en': 'In logistics: reviewing driver working time according to tachograph regulations, updating transport safety procedures, verifying driver licenses and qualifications.'
        },
        90: {
            'pl': 'W logistyce: analiza efektywności paliwowej floty, optymalizacja tras transportowych w celu redukcji emisji, wdrożenie monitoringu zużycia paliw i emisji CO₂.',
            'en': 'In logistics: analyzing fleet fuel efficiency, optimizing transport routes to reduce emissions, implementing fuel consumption and CO₂ emission monitoring.'
        }
    },

    'retail_trade': {
        30: {
            'pl': 'W handlu: przegląd polityki ochrony danych osobowych klientów (RODO), aktualizacja procedur reklamacyjnych, weryfikacja uczciwości praktyk marketingowych.',
            'en': 'In trade: reviewing customer personal data protection policy (GDPR), updating complaint procedures, verifying fairness of marketing practices.'
        },
        90: {
            'pl': 'W handlu: analiza redukcji opakowań jednorazowych, wdrożenie systemu zarządzania zwrotami produktów, przegląd efektywności energetycznej obiektów handlowych.',
            'en': 'In trade: analyzing single-use packaging reduction, implementing product returns management system, reviewing retail facility energy efficiency.'
        }
    },

    'it_software': {
        30: {
            'pl': 'W IT: przegląd polityki ochrony danych użytkowników (RODO/CCPA), aktualizacja procedur cyberbezpieczeństwa, weryfikacja kopii zapasowych i planów ciągłości działania.',
            'en': 'In IT: reviewing user data protection policy (GDPR/CCPA), updating cybersecurity procedures, verifying backups and business continuity plans.'
        },
        90: {
            'pl': 'W IT: analiza zużycia energii centrów danych, wdrożenie monitoringu śladu węglowego infrastruktury chmurowej, przegląd zgodności licencji open-source.',
            'en': 'In IT: analyzing data center energy consumption, implementing cloud infrastructure carbon footprint monitoring, reviewing open-source license compliance.'
        }
    },

    'finance_fintech': {
        30: {
            'pl': 'W finansach: przegląd procedur AML/KYC, aktualizacja polityki ochrony danych klientów, weryfikacja zgodności z wymogami MiFID II i PRIIPS.',
            'en': 'In finance: reviewing AML/KYC procedures, updating customer data protection policy, verifying MiFID II and PRIIPs compliance.'
        },
        90: {
            'pl': 'W finansach: analiza portfela kredytowego pod kątem kryteriów ESG, wdrożenie raportowania zgodnego z SFDR i Taxonomią UE, przegląd produktów "zielonych" (green bonds).',
            'en': 'In finance: analyzing credit portfolio for ESG criteria, implementing SFDR and EU Taxonomy compliant reporting, reviewing "green" products (green bonds).'
        }
    },

    'services_other': {
        30: {
            'pl': 'W usługach: przegląd polityki work-life balance i przeciwdziałania dyskryminacji, aktualizacja procedur ochrony poufności informacji klientów, weryfikacja zgodności z tajemnicą zawodową.',
            'en': 'In services: reviewing work-life balance and anti-discrimination policy, updating client information confidentiality procedures, verifying professional secrecy compliance.'
        },
        90: {
            'pl': 'W usługach: analiza efektywności energetycznej biur, wdrożenie polityki redukcji podróży służbowych poprzez telepracę, przegląd zrównoważonych zakupów materiałów biurowych.',
            'en': 'In services: analyzing office energy efficiency, implementing business travel reduction policy through teleworking, reviewing sustainable office material procurement.'
        }
    }
};

/**
 * Gets industry-specific example for a horizon
 * @param {string} industryCode - Industry code (e.g., 'construction', 'energy_resources')
 * @param {number} horizon - Horizon in days (30 or 90)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry-specific example or empty string
 */
function getIndustryHorizonExample(industryCode, horizon, language = 'pl') {
    if (!industryCode || !horizon) return '';

    const effectiveLanguage = language === 'en' ? 'en' : 'pl';

    return INDUSTRY_HORIZON_EXAMPLES[industryCode]?.[horizon]?.[effectiveLanguage] || '';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INDUSTRY_HORIZON_EXAMPLES,
        getIndustryHorizonExample
    };
}

// Also expose globally if in browser context
if (typeof window !== 'undefined') {
    window.IndustryHorizonExamples = {
        INDUSTRY_HORIZON_EXAMPLES,
        getIndustryHorizonExample
    };
}

},{}],7:[function(require,module,exports){
/**
 * Industry Lookup Module (Krok 3) - Extended Version
 * Improves MS accuracy without changing CORE questionnaire
 *
 * Implementation based on "System2.pdf" specification:
 * - Extended industry profiles with numeric levels (Tasks 1-6)
 * - Profile adjustment method C2 (Tasks 7-18)
 * - Integration with MS calculation (Tasks 19-24)
 * - 8 main industry profiles (Tasks 25-34)
 * - Conservative and extended adjustment tables (Tasks 35-39)
 *
 * Rule: lookup does NOT touch CORE Score, only affects MS (materiality)
 */

const { FEATURE_FLAGS } = require('./feature-flags');
const { INDUSTRY_B } = require('./core');

// ============================================================================
// VERSION AND CONFIGURATION (Task 16)
// ============================================================================

/**
 * Lookup table version for audit trail
 * Format: { version, valid_from, valid_to, description }
 */
const LOOKUP_VERSION = {
    version: 'v1.0',
    valid_from: '2026-02-09',
    valid_to: null, // null = current active version
    description: 'Initial extended industry profiles with numeric levels'
};

/**
 * Adjustment mode selection (Task 45)
 * 'conservative' - max +6 per pillar, max +10 total (recommended for start)
 * 'extended' - max +10 per pillar, max +15 total (stronger differentiation)
 */
const ADJUSTMENT_MODE = 'conservative';

/**
 * Caps for adjustments (Task 23)
 */
const ADJUSTMENT_CAPS = {
    conservative: {
        perPillar: 6,
        total: 10
    },
    extended: {
        perPillar: 10,
        total: 15
    }
};

// ============================================================================
// LEVEL DEFINITIONS (Tasks 1-5)
// ============================================================================

/**
 * Task 1: Regulated materials level (0-4)
 * Affects: E (primary), G (medium), SC (small)
 */
const REGULATED_MATERIALS_LEVELS = {
    0: 'none',           // No work with regulated materials
    1: 'low',            // Rare, minimal amounts
    2: 'medium',         // Regular, moderate volumes
    3: 'high',           // Constant, large volumes
    4: 'very_high'       // Basis of production process
};

/**
 * Task 2: International activity level (0-4)
 * Affects: SC (primary), S (medium), G (small)
 */
const INTERNATIONAL_ACTIVITY_LEVELS = {
    0: 'domestic_only',  // Domestic market only
    1: 'rare',           // Rare international operations
    2: 'regular_eu',     // Regular EU operations
    3: 'active_eu_plus', // Active EU + partially outside
    4: 'global'          // Global activity outside EU
};

/**
 * Task 3: Export probability (alternative to exact region)
 */
const EXPORT_PROBABILITY = {
    low: 'low',      // Industry rarely works with export
    medium: 'medium', // Export is common but not mandatory
    high: 'high'     // Most companies in industry work with export
};

/**
 * Task 4: Energy intensity level (0-3)
 * Affects: E (medium)
 */
const ENERGY_INTENSITY_LEVELS = {
    0: 'low',        // Offices, IT, services
    1: 'medium',     // Trade, light manufacturing
    2: 'high',       // Heavy manufacturing, logistics
    3: 'very_high'   // Energy, metallurgy, chemistry
};

/**
 * Task 5: Water intensity level (0-3)
 * Affects: E (medium)
 */
const WATER_INTENSITY_LEVELS = {
    0: 'low',        // Offices, IT, finance
    1: 'medium',     // Manufacturing, trade
    2: 'high',       // Construction, chemical industry
    3: 'very_high'   // Beverages, textiles, agriculture
};

// ============================================================================
// ADJUSTMENT TABLES (Tasks 35-36)
// ============================================================================

/**
 * Task 35: Conservative adjustment table
 * Stable for entire system, minimizes risk of industry overpowering answers
 * Scale: none=0, low=0, med=+2, high=+4, very_high=+6
 */
const ADJUSTMENT_TABLE_CONSERVATIVE = {
    // Task 10-11: regulated_materials -> E, G
    regulated_materials: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 },
        G: { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 }
    },
    // Task 12-13: international_activity -> SC, S, G
    international_activity: {
        SC: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 5 },
        S:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 },
        G:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 2 }
    },
    // Task 14: energy_intensity -> E
    energy_intensity: {
        E: { 0: 0, 1: 1, 2: 2, 3: 3 }
    },
    // Task 14: water_intensity -> E
    water_intensity: {
        E: { 0: 0, 1: 1, 2: 2, 3: 3 }
    }
};

/**
 * Task 36: Extended adjustment table
 * Stronger differentiation for MS accuracy module
 * Scale: none=0, low=0, med=+3, high=+6, very_high=+10
 */
const ADJUSTMENT_TABLE_EXTENDED = {
    regulated_materials: {
        E: { 0: 0, 1: 0, 2: 3, 3: 6, 4: 10 },
        G: { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 }
    },
    international_activity: {
        SC: { 0: 0, 1: 2, 2: 4, 3: 7, 4: 10 },
        S:  { 0: 0, 1: 0, 2: 2, 3: 4, 4: 6 },
        G:  { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 }
    },
    energy_intensity: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4 }
    },
    water_intensity: {
        E: { 0: 0, 1: 0, 2: 2, 3: 4 }
    }
};

// ============================================================================
// EXTENDED INDUSTRY PROFILES (Tasks 6, 25-34)
// ============================================================================

/**
 * Extended Industry Lookup Table with numeric levels
 *
 * Structure per industry:
 * - id: Industry code (Task 19 - internal categories)
 * - name: Display name
 * - name_en: English name
 * - aliases: Alternative names (Task 33)
 * - base: { E, S, G, SC } - base weights from INDUSTRY_B
 * - levels: Numeric levels for all characteristics
 * - esg_focus_hint: Priority ESG areas (Task 34)
 * - key_risks: Specific risk notes
 */
const INDUSTRY_LOOKUP = {
    // Task 25: Construction
    'construction': {
        id: 'CONSTR',
        name: 'Budownictwo',
        name_en: 'Construction',
        aliases: ['construction', 'real estate', 'real estate dev', 'budownictwo', 'deweloper'],
        base: { E: 35, S: 25, G: 20, SC: 20 },
        levels: {
            regulated_materials_level: 2,      // medium - concrete, steel, chemicals
            international_activity_level: 1,   // low - mostly domestic
            export_probability: 'low',
            energy_intensity_level: 1,         // medium
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['E', 'S'],            // Waste/dust + OHS
        key_risks: ['occupational_safety', 'construction_waste', 'dust_noise', 'subcontractors'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: false,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.0, G: 1.0, SC: 1.0 }
    },

    // Task 26: Energy and raw materials
    'energy_raw_materials': {
        id: 'ENRES',
        name: 'Energetyka i surowce',
        name_en: 'Energy & Raw Materials',
        aliases: ['energy', 'utilities', 'mining', 'resources', 'oil & gas', 'energetyka', 'gornictwo'],
        base: { E: 40, S: 20, G: 25, SC: 15 },
        levels: {
            regulated_materials_level: 4,      // very_high - basis of production
            international_activity_level: 3,   // high - active EU + outside
            export_probability: 'high',
            energy_intensity_level: 3,         // very_high
            water_intensity_level: 2           // high
        },
        esg_focus_hint: ['E', 'G'],            // Emissions + Permits
        key_risks: ['co2_emissions', 'spills', 'environmental_disasters', 'regulatory_risk'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: true,
            natura2000: true
        },
        modifiers: { E: 1.2, S: 1.0, G: 1.1, SC: 1.0 }
    },

    // Task 27: Industrial production
    'industrial_production': {
        id: 'MANUF',
        name: 'Produkcja przemyslowa',
        name_en: 'Industrial Production',
        aliases: ['manufacturing', 'industrial', 'production', 'przemysl', 'produkcja'],
        base: { E: 30, S: 30, G: 20, SC: 20 },
        levels: {
            regulated_materials_level: 3,      // high - constant, large volumes
            international_activity_level: 3,   // high - EU + outside
            export_probability: 'high',
            energy_intensity_level: 2,         // high
            water_intensity_level: 1           // medium
        },
        esg_focus_hint: ['E', 'S'],            // Industrial emissions + OHS
        key_risks: ['industrial_emissions', 'production_waste', 'occupational_safety', 'reach_substances'],
        exposures: {
            regulated_materials: true,
            physical_labor: true,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.1, G: 1.0, SC: 1.0 }
    },

    // Task 28: Logistics and transport
    'logistics_transport': {
        id: 'LOGTR',
        name: 'Logistyka i transport',
        name_en: 'Logistics & Transport',
        aliases: ['logistics', 'transport', 'fleet', 'shipping', 'freight', 'logistyka', 'spedycja'],
        base: { E: 35, S: 20, G: 20, SC: 25 },
        levels: {
            regulated_materials_level: 2,      // medium - fuels, cargo
            international_activity_level: 3,   // high - cross-border
            export_probability: 'high',
            energy_intensity_level: 2,         // high - fuel consumption
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['E', 'S', 'SC'],      // Emissions + Drivers + Subcontractors
        key_risks: ['transport_emissions', 'driver_safety', 'working_hours', 'subcontractors'],
        exposures: {
            regulated_materials: false,
            physical_labor: true,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.1, S: 1.0, G: 1.0, SC: 1.1 }
    },

    // Task 29: Trade and retail
    'trade_retail': {
        id: 'RETTR',
        name: 'Handel i detal',
        name_en: 'Trade & Retail',
        aliases: ['retail', 'wholesale', 'ecommerce', 'trade', 'handel', 'sklep', 'e-commerce'],
        base: { E: 15, S: 30, G: 25, SC: 30 },
        levels: {
            regulated_materials_level: 1,      // low - rarely
            international_activity_level: 2,   // medium - regular EU
            export_probability: 'medium',
            energy_intensity_level: 1,         // medium
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['S', 'SC'],           // Supply chain + Social
        key_risks: ['supply_chain_goods', 'packaging', 'food_waste', 'human_rights_supply_chain'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.2 }
    },

    // Task 30: IT and software
    'it_software': {
        id: 'ITSW',
        name: 'IT i oprogramowanie',
        name_en: 'IT & Software',
        aliases: ['software', 'saas', 'it services', 'information technology', 'tech', 'it', 'programowanie'],
        base: { E: 10, S: 30, G: 35, SC: 25 },
        levels: {
            regulated_materials_level: 1,      // low - e-waste only
            international_activity_level: 3,   // high - global services
            export_probability: 'high',
            energy_intensity_level: 0,         // low - offices
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['G', 'S'],            // Privacy + Working conditions
        key_risks: ['data_privacy', 'cybersecurity', 'working_conditions', 'remote_work'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.1, SC: 1.0 }
    },

    // Task 31: Finance
    'finance': {
        id: 'FINFT',
        name: 'Finanse',
        name_en: 'Finance',
        aliases: ['banking', 'insurance', 'fintech', 'finance', 'bank', 'ubezpieczenia', 'finanse'],
        base: { E: 10, S: 25, G: 45, SC: 20 },
        levels: {
            regulated_materials_level: 0,      // none
            international_activity_level: 3,   // high - global operations
            export_probability: 'high',
            energy_intensity_level: 0,         // low - offices
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['G', 'SC'],           // Ethics + Financing
        key_risks: ['risky_project_financing', 'transparency', 'sales_ethics', 'aml_kyc', 'complaints'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: true,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.2, SC: 1.0 }
    },

    // Task 32: Services
    'services_other': {
        id: 'SERV',
        name: 'Uslugi',
        name_en: 'Services',
        aliases: ['services', 'professional services', 'consulting', 'uslugi', 'doradztwo', 'hr', 'outsourcing'],
        base: { E: 15, S: 35, G: 25, SC: 25 },
        levels: {
            regulated_materials_level: 1,      // low
            international_activity_level: 2,   // medium
            export_probability: 'medium',
            energy_intensity_level: 0,         // low
            water_intensity_level: 0           // low
        },
        esg_focus_hint: ['S', 'G'],            // Service quality + Working conditions
        key_risks: ['service_quality', 'client_ethics', 'working_conditions', 'outsourcing'],
        exposures: {
            regulated_materials: false,
            physical_labor: false,
            cross_border: false,
            natura2000: false
        },
        modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.0 }
    }
};

/**
 * Pre-calculated adjustments per industry (Tasks 35-36)
 * These are derived from levels + adjustment tables WITH caps applied
 *
 * Conservative caps: +6 per pillar, +10 total
 * Extended caps: +10 per pillar, +15 total
 *
 * Raw values before caps (for reference):
 * - energy_raw_materials conservative: E=12, S=2, G=5, SC=4 = 23 -> capped
 * - industrial_production conservative: E=9, S=2, G=4, SC=4 = 19 -> capped
 * - logistics_transport conservative: E=6, S=2, G=3, SC=4 = 15 -> capped
 */
const INDUSTRY_ADJUSTMENTS = {
    conservative: {
        // After applying per-pillar cap (6) and global cap (10)
        construction:          { E: 3, S: 0, G: 1, SC: 1 },  // total=5, no cap needed
        energy_raw_materials:  { E: 4, S: 1, G: 3, SC: 2 },  // raw=23, scaled to ~10
        industrial_production: { E: 4, S: 1, G: 2, SC: 3 },  // raw=19, scaled to ~10
        logistics_transport:   { E: 3, S: 1, G: 2, SC: 4 },  // raw=15, scaled to ~10
        trade_retail:          { E: 1, S: 1, G: 1, SC: 2 },  // total=5, no cap needed
        it_software:           { E: 0, S: 2, G: 2, SC: 4 },  // total=8, no cap needed
        finance:               { E: 0, S: 2, G: 2, SC: 4 },  // total=8, no cap needed
        services_other:        { E: 0, S: 1, G: 1, SC: 2 }   // total=4, no cap needed
    },
    extended: {
        // After applying per-pillar cap (10) and global cap (15)
        construction:          { E: 5, S: 0, G: 2, SC: 2 },  // total=9, no cap needed
        energy_raw_materials:  { E: 5, S: 2, G: 4, SC: 4 },  // raw=29, scaled to ~15
        industrial_production: { E: 5, S: 2, G: 4, SC: 4 },  // raw=27, scaled to ~15
        logistics_transport:   { E: 5, S: 2, G: 3, SC: 5 },  // raw=22, scaled to ~15
        trade_retail:          { E: 2, S: 2, G: 1, SC: 4 },  // total=9, no cap needed
        it_software:           { E: 0, S: 4, G: 2, SC: 7 },  // total=13, no cap needed
        finance:               { E: 0, S: 4, G: 2, SC: 7 },  // total=13, no cap needed
        services_other:        { E: 0, S: 2, G: 1, SC: 4 }   // total=7, no cap needed
    }
};

// ============================================================================
// CORE FUNCTIONS (Tasks 7, 21, 37-38)
// ============================================================================

/**
 * Task 21: Get industry profile by code
 * Returns profile with fallback to services_other
 *
 * @param {string} industryCode - Industry key or alias
 * @returns {Object} Industry profile
 */
function getIndustryProfile(industryCode) {
    if (!industryCode) {
        return INDUSTRY_LOOKUP['services_other'];
    }

    const normalizedCode = industryCode.toLowerCase().trim();

    // Direct match
    if (INDUSTRY_LOOKUP[normalizedCode]) {
        return INDUSTRY_LOOKUP[normalizedCode];
    }

    // Alias match
    for (const [key, profile] of Object.entries(INDUSTRY_LOOKUP)) {
        if (profile.aliases.some(alias =>
            alias.toLowerCase() === normalizedCode ||
            normalizedCode.includes(alias.toLowerCase())
        )) {
            return profile;
        }
    }

    // Fallback to default
    return INDUSTRY_LOOKUP['services_other'];
}

/**
 * Legacy function for backward compatibility
 * @param {string} industry - Industry key
 * @returns {Object} Industry lookup data
 */
function getIndustryLookup(industry) {
    if (!FEATURE_FLAGS.industry_lookup_enabled) {
        const base = INDUSTRY_B[industry] || INDUSTRY_B['services_other'];
        return {
            base,
            exposures: {},
            modifiers: { E: 1.0, S: 1.0, G: 1.0, SC: 1.0 }
        };
    }

    const profile = getIndustryProfile(industry);
    return {
        base: profile.base,
        exposures: profile.exposures,
        modifiers: profile.modifiers
    };
}

/**
 * Task 37: Calculate profile adjustments for a specific industry
 * Uses configured ADJUSTMENT_MODE (conservative/extended)
 *
 * @param {Object} profile - Industry profile
 * @param {string} mode - 'conservative' or 'extended' (default from config)
 * @returns {Object} { E, S, G, SC } adjustments
 */
function calculateProfileAdjustments(profile, mode = ADJUSTMENT_MODE) {
    const table = mode === 'extended' ?
        ADJUSTMENT_TABLE_EXTENDED :
        ADJUSTMENT_TABLE_CONSERVATIVE;
    const caps = ADJUSTMENT_CAPS[mode];
    const levels = profile.levels;

    // Initialize adjustments
    const adjustments = { E: 0, S: 0, G: 0, SC: 0 };

    // Task 10: Regulated materials -> E
    if (levels.regulated_materials_level !== undefined) {
        const level = levels.regulated_materials_level;
        adjustments.E += table.regulated_materials.E[level] || 0;
    }

    // Task 11: Regulated materials -> G
    if (levels.regulated_materials_level !== undefined) {
        const level = levels.regulated_materials_level;
        adjustments.G += table.regulated_materials.G[level] || 0;
    }

    // Task 12: International activity -> SC
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.SC += table.international_activity.SC[level] || 0;
    }

    // Task 13: International activity -> S
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.S += table.international_activity.S[level] || 0;
    }

    // Additional international -> G
    if (levels.international_activity_level !== undefined) {
        const level = levels.international_activity_level;
        adjustments.G += table.international_activity.G[level] || 0;
    }

    // Task 14: Energy intensity -> E
    if (levels.energy_intensity_level !== undefined) {
        const level = levels.energy_intensity_level;
        adjustments.E += table.energy_intensity.E[level] || 0;
    }

    // Task 14: Water intensity -> E
    if (levels.water_intensity_level !== undefined) {
        const level = levels.water_intensity_level;
        adjustments.E += table.water_intensity.E[level] || 0;
    }

    // Task 38: Apply caps
    const pillars = ['E', 'S', 'G', 'SC'];
    let totalAdjustment = 0;

    // First pass: apply per-pillar cap
    pillars.forEach(p => {
        adjustments[p] = Math.min(adjustments[p], caps.perPillar);
        totalAdjustment += adjustments[p];
    });

    // Second pass: apply global cap with proportional reduction
    if (totalAdjustment > caps.total) {
        const scale = caps.total / totalAdjustment;
        pillars.forEach(p => {
            adjustments[p] = Math.floor(adjustments[p] * scale);
        });

        // Recalculate total after floor
        totalAdjustment = pillars.reduce((sum, p) => sum + adjustments[p], 0);

        // If still over cap due to rounding, reduce highest value
        while (totalAdjustment > caps.total) {
            const maxPillar = pillars.reduce((max, p) =>
                adjustments[p] > adjustments[max] ? p : max, 'E');
            adjustments[maxPillar]--;
            totalAdjustment--;
        }
    }

    return adjustments;
}

/**
 * Get pre-calculated adjustments for industry
 * Faster than runtime calculation
 *
 * @param {string} industry - Industry key
 * @param {string} mode - 'conservative' or 'extended'
 * @returns {Object} { E, S, G, SC } adjustments
 */
function getIndustryAdjustments(industry, mode = ADJUSTMENT_MODE) {
    const adjustments = INDUSTRY_ADJUSTMENTS[mode];
    return adjustments[industry] || adjustments['services_other'];
}

/**
 * Task 37: Apply profile adjustments to base MS
 *
 * @param {Object} profile - Industry profile
 * @param {Object} baseMS - Base MS values { E, S, G, SC }
 * @param {string} mode - Adjustment mode
 * @returns {Object} { adjustedMS, adjustments, log }
 */
function applyProfileAdjustments(profile, baseMS, mode = ADJUSTMENT_MODE) {
    const adjustments = calculateProfileAdjustments(profile, mode);

    const adjustedMS = {
        E: Math.min(100, Math.max(0, baseMS.E + adjustments.E)),
        S: Math.min(100, Math.max(0, baseMS.S + adjustments.S)),
        G: Math.min(100, Math.max(0, baseMS.G + adjustments.G)),
        SC: Math.min(100, Math.max(0, baseMS.SC + adjustments.SC))
    };

    // Task 17: Logging data
    const log = {
        industry_code: profile.id,
        profile_version: LOOKUP_VERSION.version,
        adjustments_applied: adjustments,
        base_ms: baseMS,
        adjusted_ms: adjustedMS,
        mode: mode,
        timestamp: new Date().toISOString()
    };

    return { adjustedMS, adjustments, log };
}

// ============================================================================
// MS CALCULATION WITH PROFILE ADJUSTMENTS (Task 22)
// ============================================================================

/**
 * Compute MS with Industry Lookup enhancement
 * Base formula: MS_i = min(100, 0.6 * B_i + 0.2 * R + 0.2 * C)
 * With adjustment: MS_i = clamp(0, 100, baseMS + profile_adjustment)
 *
 * @param {number} B_i - Base industry weight
 * @param {number} R - Regulation pressure
 * @param {number} C - Contract pressure
 * @param {number} modifier - Industry modifier (legacy, default 1.0)
 * @returns {number} Enhanced MS value [0, 100]
 */
function computeMSWithLookup(B_i, R, C, modifier = 1.0) {
    const baseMS = 0.6 * B_i + 0.2 * R + 0.2 * C;
    const enhanced = baseMS * modifier;
    return Math.min(100, Math.max(0, enhanced));
}

/**
 * Task 22: Compute all MS values with profile adjustments
 * New formula: MS_i = clamp(0, 100, 0.6*B_i + 0.2*R + 0.2*C + adjustment_i)
 *
 * @param {string} industry - Industry key
 * @param {number} R - Regulation pressure
 * @param {number} C - Contract pressure
 * @param {Object} options - { mode, includeLog }
 * @returns {Object} { E, S, G, SC } or { ms, adjustments, log }
 */
function computeAllMSWithLookup(industry, R, C, options = {}) {
    const { mode = ADJUSTMENT_MODE, includeLog = false } = options;
    const profile = getIndustryProfile(industry);
    const B = profile.base;

    // Compute base MS for each pillar
    const baseMS = {
        E: 0.6 * B.E + 0.2 * R + 0.2 * C,
        S: 0.6 * B.S + 0.2 * R + 0.2 * C,
        G: 0.6 * B.G + 0.2 * R + 0.2 * C,
        SC: 0.6 * B.SC + 0.2 * R + 0.2 * C
    };

    // Apply profile adjustments if feature enabled
    if (FEATURE_FLAGS.industry_lookup_enabled) {
        const result = applyProfileAdjustments(profile, baseMS, mode);

        if (includeLog) {
            return {
                ms: result.adjustedMS,
                adjustments: result.adjustments,
                log: result.log
            };
        }

        return result.adjustedMS;
    }

    // Without feature flag - use legacy modifier approach
    const mod = profile.modifiers;
    const legacyMS = {
        E: computeMSWithLookup(B.E, R, C, mod.E),
        S: computeMSWithLookup(B.S, R, C, mod.S),
        G: computeMSWithLookup(B.G, R, C, mod.G),
        SC: computeMSWithLookup(B.SC, R, C, mod.SC)
    };

    if (includeLog) {
        return {
            ms: legacyMS,
            adjustments: null,
            log: { note: 'industry_lookup_enabled is false, using legacy modifiers' }
        };
    }

    return legacyMS;
}

// ============================================================================
// AUDIT AND LOGGING (Tasks 17-18)
// ============================================================================

/**
 * Application log storage (in-memory for now)
 * Task 17: Log profile application for each report
 */
const applicationLogs = [];

/**
 * Task 17: Log profile application for audit trail
 *
 * @param {Object} logEntry - { industry_code, profile_version, adjustments, base_ms, adjusted_ms, report_id }
 */
function logProfileApplication(logEntry) {
    const entry = {
        ...logEntry,
        logged_at: new Date().toISOString()
    };
    applicationLogs.push(entry);
    return entry;
}

/**
 * Get application logs (for debugging/audit)
 * @returns {Array} Log entries
 */
function getApplicationLogs() {
    return [...applicationLogs];
}

/**
 * Clear application logs
 */
function clearApplicationLogs() {
    applicationLogs.length = 0;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available industries
 * @returns {Array} Array of { code, name, name_en }
 */
function getAllIndustries() {
    return Object.entries(INDUSTRY_LOOKUP).map(([code, profile]) => ({
        code,
        id: profile.id,
        name: profile.name,
        name_en: profile.name_en,
        aliases: profile.aliases
    }));
}

/**
 * Task 46: Get adjustment mapping documentation
 * Returns the mapping of characteristics to ESG areas
 */
function getAdjustmentMapping() {
    return {
        regulated_materials: {
            primary: 'E',
            medium: 'G',
            small: 'SC'
        },
        international_activity: {
            primary: 'SC',
            medium: 'S',
            small: 'G'
        },
        energy_intensity: {
            medium: 'E'
        },
        water_intensity: {
            medium: 'E'
        }
    };
}

/**
 * Get current adjustment mode and caps
 */
function getAdjustmentConfig() {
    return {
        mode: ADJUSTMENT_MODE,
        caps: ADJUSTMENT_CAPS[ADJUSTMENT_MODE],
        version: LOOKUP_VERSION
    };
}

/**
 * Task 39: Validate that adjustments are smaller than answer influence
 * Answers create +-20-40 point difference, adjustments should add +-5-10
 *
 * @param {Object} adjustments - { E, S, G, SC }
 * @returns {Object} { valid, warnings }
 */
function validateAdjustmentSize(adjustments) {
    const MAX_SINGLE_ADJUSTMENT = 10;
    const MAX_TOTAL_ADJUSTMENT = 15;
    const warnings = [];

    let total = 0;
    for (const [pillar, value] of Object.entries(adjustments)) {
        if (value > MAX_SINGLE_ADJUSTMENT) {
            warnings.push(`${pillar} adjustment (${value}) exceeds recommended max (${MAX_SINGLE_ADJUSTMENT})`);
        }
        total += value;
    }

    if (total > MAX_TOTAL_ADJUSTMENT) {
        warnings.push(`Total adjustments (${total}) exceed recommended max (${MAX_TOTAL_ADJUSTMENT})`);
    }

    return {
        valid: warnings.length === 0,
        warnings,
        total
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    // Version info
    LOOKUP_VERSION,
    ADJUSTMENT_MODE,
    ADJUSTMENT_CAPS,

    // Level definitions
    REGULATED_MATERIALS_LEVELS,
    INTERNATIONAL_ACTIVITY_LEVELS,
    EXPORT_PROBABILITY,
    ENERGY_INTENSITY_LEVELS,
    WATER_INTENSITY_LEVELS,

    // Adjustment tables
    ADJUSTMENT_TABLE_CONSERVATIVE,
    ADJUSTMENT_TABLE_EXTENDED,

    // Industry data
    INDUSTRY_LOOKUP,
    INDUSTRY_ADJUSTMENTS,
    INDUSTRY_B,  // Re-exported from core.js

    // Core functions
    getIndustryProfile,
    getIndustryLookup,  // Legacy
    getIndustryAdjustments,
    calculateProfileAdjustments,
    applyProfileAdjustments,

    // MS calculation
    computeMSWithLookup,
    computeAllMSWithLookup,

    // Audit/logging
    logProfileApplication,
    getApplicationLogs,
    clearApplicationLogs,

    // Helpers
    getAllIndustries,
    getAdjustmentMapping,
    getAdjustmentConfig,
    validateAdjustmentSize
};

},{"./core":2,"./feature-flags":3}],8:[function(require,module,exports){
/**
 * Industry Profile Dictionary
 * Auto-generated from COMMENTS.md PROFILE entries
 *
 * Provides explanations of why each pillar is important for a specific industry.
 * Used in "Szczegolowe wyniki ESG" section.
 *
 * Structure: industryProfile[industryCode][pillar][language]
 *
 * Industry codes match industryCodeMapping in pdf-template.js:
 * - construction
 * - energy_resources
 * - finance_fintech
 * - retail_trade
 * - it_software
 * - logistics_transport
 * - industrial_production
 * - services_other
 */

const INDUSTRY_PROFILE = {
    'construction': {
        'E': {
            'pl': 'W budownictwie istotne znaczenie ma wplyw inwestycji na srodowisko na kazdym etapie realizacji — od przygotowania terenu po oddanie obiektu do uzytkowania. Branza charakteryzuje sie wysokim zuzyciem surowcow, energii oraz znaczna iloscia odpadow budowlanych i rozbiórkowych. Kluczowe obszary obejmuja gospodarke odpadami, kontrole emisji i pylow na placu budowy, efektywnosc energetyczna wznoszonych obiektow oraz spelnienie wymogow srodowiskowych wynikajacych z decyzji administracyjnych.',
            'en': 'In construction, environmental impact matters at every stage of a project — from site preparation to building commissioning. The sector is characterized by high consumption of raw materials and energy, as well as significant volumes of construction and demolition waste. Key areas include waste management, control of emissions and dust on-site, energy efficiency of constructed buildings, and compliance with environmental requirements arising from administrative decisions.'
        },
        'S': {
            'pl': 'Budownictwo opiera sie na pracy zespolow wykonawczych dzialajacych w warunkach podwyzszonego ryzyka fizycznego i zmiennych warunkach srodowiskowych. Kluczowe znaczenie maja bezpieczenstwo pracy, kwalifikacje specjalistow oraz wlasciwa organizacja pracy na placu budowy. Branza wymaga stabilnych zespolow, jasnych zasad wspolpracy i przestrzegania standardow BHP.',
            'en': 'Construction relies on operational teams working in environments with elevated physical risk and variable site conditions. Occupational safety, specialist qualifications, and proper on-site organization are essential. The sector requires stable teams, clear cooperation rules, and adherence to health and safety standards.'
        },
        'G': {
            'pl': 'Dzialalnosc budowlana podlega rozbudowanym regulacjom prawnym, obejmujacym prawo budowlane, normy techniczne, wymogi srodowiskowe oraz procedury administracyjne zwiazane z pozwoleniami, zgloszeniami i odbiorami inwestycji. Prawidlowe prowadzenie dokumentacji budowy, nadzor nad zgodnoscia techniczna oraz wspolpraca z organami administracji stanowia staly element funkcjonowania firm w tej branzy.',
            'en': 'Construction activity is subject to extensive legal and technical regulations, including building law, technical standards, environmental requirements, and administrative procedures related to permits and project approvals. Proper site documentation, compliance supervision, and cooperation with public authorities are ongoing elements of operating in this sector.'
        },
        'SC': {
            'pl': 'Branza budowlana w duzym stopniu opiera sie na wspolpracy z podwykonawcami, dostawcami materialow oraz firmami specjalistycznymi. Realizacja inwestycji wymaga koordynacji wielu podmiotow na roznych etapach prac oraz synchronizacji dostaw z harmonogramem budowy. Struktura i organizacja lancucha dostaw ksztaltuja sposob planowania oraz przebieg realizacji inwestycji.',
            'en': 'The construction sector heavily relies on subcontractors, material suppliers, and specialized service providers. Project execution requires coordination of multiple parties across different construction phases and synchronization of deliveries with the project schedule. The structure and organization of the supply chain shape planning and project execution processes.'
        }
    },

    'energy_resources': {
        'E': {
            'pl': 'Branza energetyczna i surowcowa wiaze sie z bezposrednim oddzialywaniem na srodowisko naturalne na etapie wydobycia, przetwarzania oraz wytwarzania energii. Kluczowe obszary obejmuja emisje do powietrza, gospodarowanie woda procesowa, rekultywacje terenow pogorniczych oraz zarzadzanie odpadami i produktami ubocznymi procesow przemyslowych. Charakter dzialalnosci wymaga stalego monitorowania parametrow srodowiskowych oraz realizacji warunkow okreslonych w decyzjach administracyjnych i pozwoleniach.',
            'en': 'The energy and raw materials sector is directly connected with environmental impact during extraction, processing, and energy generation. Key areas include air emissions, process water management, land restoration of post-extraction sites, and handling of industrial waste and by-products. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze energetyki i surowcow obejmuje prace w warunkach podwyzszonego ryzyka technicznego i przemyslowego, czesto w srodowisku instalacji wysokiej mocy lub terenow wydobywczych. Kluczowe znaczenie maja standardy bezpieczenstwa pracy, kwalifikacje techniczne personelu oraz organizacja pracy w zakladach produkcyjnych i na obszarach eksploatacji. Branza funkcjonuje w bezposrednim sasiedztwie spolecznosci lokalnych, co wymaga stalego dialogu oraz uwzgledniania kwestii zdrowia i bezpieczenstwa otoczenia.',
            'en': 'Operations in the energy and raw materials sector involve work under elevated technical and industrial risk conditions, often within high-capacity installations or extraction sites. Occupational safety standards, technical qualifications of personnel, and structured work organization at production facilities and operating sites are essential. The sector often operates in close proximity to local communities, requiring ongoing dialogue and consideration of health and safety aspects of the surrounding area.'
        },
        'G': {
            'pl': 'Sektor energetyczny i surowcowy podlega rozbudowanym regulacjom krajowym i miedzynarodowym, obejmujacym koncesje, pozwolenia srodowiskowe, normy techniczne, wymogi raportowe oraz nadzor sektorowy. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja regulacyjna, biezacej kontroli zgodnosci oraz wspolpracy z organami nadzoru i instytucjami publicznymi.',
            'en': 'The energy and raw materials sector is subject to extensive national and international regulations, including licenses, environmental permits, technical standards, reporting obligations, and sectoral supervision. Operating in this sector requires structured regulatory documentation management, ongoing compliance oversight, and cooperation with supervisory authorities and public institutions.'
        },
        'SC': {
            'pl': 'Branza opiera sie na rozbudowanych i czesto miedzynarodowych lancuchach dostaw obejmujacych surowce, komponenty technologiczne oraz uslugi specjalistyczne. Istotne znaczenie ma koordynacja dostaw, dostepnosc infrastruktury logistycznej oraz wspolpraca z partnerami technologicznymi i serwisowymi. Struktura lancucha dostaw ksztaltuje sposob organizacji procesow produkcyjnych oraz realizacji projektow inwestycyjnych.',
            'en': 'The sector relies on extensive and often international supply chains covering raw materials, technological components, and specialized services. Coordination of deliveries, availability of logistics infrastructure, and cooperation with technology and service partners are important elements. The supply chain structure shapes the organization of production processes and execution of investment projects.'
        }
    },

    'industrial_production': {
        'E': {
            'pl': 'Produkcja przemyslowa wiaze sie z wykorzystaniem energii, surowcow oraz procesow technologicznych generujacych emisje, odpady i scieki przemyslowe. Kluczowe obszary obejmuja efektywnosc energetyczna linii produkcyjnych, ograniczanie strat materialowych, gospodarowanie odpadami poprodukcyjnymi, kontrole emisji do powietrza oraz zarzadzanie woda procesowa w obiegach zamknietych i otwartych. Charakter dzialalnosci wymaga stalego monitorowania parametrow srodowiskowych oraz realizacji warunkow okreslonych w pozwoleniach i decyzjach administracyjnych.',
            'en': 'Industrial production involves the use of energy, raw materials, and technological processes that generate emissions, waste, and industrial wastewater. Key areas include energy efficiency of production lines, reduction of material losses, management of post-production waste, control of air emissions, and process water management in closed and open systems. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        'S': {
            'pl': 'Dzialalnosc produkcyjna opiera sie na pracy w srodowisku maszynowym i technologicznym, czesto w systemie zmianowym oraz w warunkach podwyzszonego halasu i obciazenia fizycznego. Kluczowe znaczenie maja standardy bezpieczenstwa pracy, wlasciwa organizacja stanowisk produkcyjnych, kwalifikacje operatorow oraz nadzor nad procesami technicznymi. Istotnym elementem funkcjonowania zakladow jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunkow pracy w halach produkcyjnych.',
            'en': 'Industrial operations rely on machine-based and technological environments, often operating in shift systems and under conditions of elevated noise and physical load. Occupational safety standards, proper organization of production workstations, operator qualifications, and supervision of technical processes are essential. Adherence to health and safety rules and ensuring appropriate working conditions within production facilities are integral elements of plant operations.'
        },
        'G': {
            'pl': 'Produkcja przemyslowa podlega regulacjom obejmujacym normy techniczne, wymagania jakosciowe, przepisy srodowiskowe oraz obowiazki sprawozdawcze i certyfikacyjne. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja procesowa, utrzymania zgodnosci z normami branzowymi oraz nadzoru nad procedurami wewnetrznymi. Stalym elementem funkcjonowania zakladu jest kontrola zgodnosci procesow z obowiazujacymi regulacjami i standardami.',
            'en': 'Industrial production is subject to regulations covering technical standards, quality requirements, environmental rules, reporting obligations, and certification schemes. Operating in this sector requires structured process documentation management, compliance with industry standards, and supervision of internal procedures. Ongoing control of process compliance with applicable regulations and standards is a permanent element of plant operations.'
        },
        'SC': {
            'pl': 'Branza produkcyjna opiera sie na dostawach surowcow, komponentow oraz uslug technicznych, czesto realizowanych w modelu wielostopniowego lancucha dostaw obejmujacego dostawcow krajowych i zagranicznych. Istotne znaczenie ma synchronizacja dostaw z planem produkcyjnym, dostepnosc materialow magazynowych oraz wspolpraca z dostawcami kluczowych komponentow i czesci zamiennych. Struktura lancucha dostaw ksztaltuje organizacje procesow wytworczych oraz planowanie produkcji.',
            'en': 'The manufacturing sector relies on the supply of raw materials, components, and technical services, often organized within multi-tier supply chains involving both domestic and international suppliers. Synchronization of deliveries with production schedules, material availability in storage, and cooperation with key component and spare part suppliers are important elements. The supply chain structure shapes production organization and planning processes.'
        }
    },

    'logistics_transport': {
        'E': {
            'pl': 'Branza logistyczna i transportowa wiaze sie z wykorzystaniem floty pojazdow, infrastruktury magazynowej oraz systemow dystrybucyjnych generujacych emisje do powietrza oraz zuzycie paliw i energii. Kluczowe obszary obejmuja efektywnosc paliwowa floty, zarzadzanie emisjami z transportu drogowego, kolejowego, lotniczego lub morskiego, a takze organizacje procesow magazynowych, zuzycie energii w obiektach oraz ograniczanie ilosci opakowan transportowych. Charakter dzialalnosci wymaga monitorowania parametrow srodowiskowych zwiazanych z eksploatacja pojazdow i funkcjonowaniem centrow logistycznych.',
            'en': 'The logistics and transport sector involves the use of vehicle fleets, warehouse infrastructure, and distribution systems that generate air emissions and consume fuel and energy. Key areas include fleet fuel efficiency, management of emissions from road, rail, air, or maritime transport, as well as energy use in logistics facilities and reduction of transport packaging. The nature of operations requires monitoring environmental parameters related to vehicle operation and logistics center performance.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze logistyki i transportu opiera sie na pracy kierowcow, operatorow magazynowych oraz personelu planistycznego, czesto w systemie zmianowym i w warunkach pracy zaleznych od harmonogramow dostaw. Istotne znaczenie maja bezpieczenstwo w ruchu drogowym i w przestrzeni magazynowej, kwalifikacje kierowcow oraz wlasciwa organizacja pracy zwiazana z planowaniem tras i obsluga ladunkow. Waznym elementem jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunkow pracy w centrach logistycznych i podczas realizacji transportu.',
            'en': 'Operations in the logistics and transport sector rely on drivers, warehouse operators, and planning staff, often working in shift systems and according to structured delivery schedules. Road safety, warehouse safety standards, driver qualifications, and proper route and cargo handling organization are essential elements. Adherence to health and safety rules and ensuring appropriate working conditions in logistics centers and during transport are integral aspects of sector operations.'
        },
        'G': {
            'pl': 'Sektor logistyczny i transportowy podlega regulacjom dotyczacym czasu pracy kierowcow, bezpieczenstwa przewozow, norm emisji, licencji transportowych oraz obowiazkow sprawozdawczych i dokumentacyjnych. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja przewozowa, utrzymania zgodnosci z przepisami branzowymi oraz nadzoru nad procedurami administracyjnymi i operacyjnymi. Stalym elementem funkcjonowania firm jest kontrola zgodnosci z regulacjami krajowymi i miedzynarodowymi.',
            'en': 'The logistics and transport sector is subject to regulations covering driver working time, transport safety, emission standards, transport licenses, and reporting and documentation obligations. Operating in this sector requires structured management of transport documentation, compliance with industry regulations, and supervision of administrative and operational procedures. Ongoing compliance with national and international regulations is a permanent element of business operations.'
        },
        'SC': {
            'pl': 'Branza logistyki i transportu funkcjonuje w ramach rozbudowanych sieci dostaw obejmujacych nadawcow, przewoznikow, operatorow magazynowych oraz odbiorcow koncowych. Istotne znaczenie ma koordynacja przeplywu towarow pomiedzy roznymi srodkami transportu oraz synchronizacja procesow przeladunkowych, magazynowych i dystrybucyjnych. Struktura sieci logistycznej ksztaltuje organizacje procesow transportowych oraz planowanie operacji dostawczych.',
            'en': 'The logistics and transport sector operates within extensive supply networks involving shippers, carriers, warehouse operators, and end recipients. Coordination of goods flow across different transport modes, as well as synchronization of handling, warehousing, and distribution processes, are key elements. The structure of the logistics network shapes the organization of transport processes and delivery planning.'
        }
    },

    'retail_trade': {
        'E': {
            'pl': 'Branza handlowa wiaze sie z funkcjonowaniem sklepow stacjonarnych, centrow dystrybucyjnych oraz kanalow sprzedazy internetowej, generujacych zuzycie energii, opakowan i odpadow. Kluczowe obszary obejmuja efektywnosc energetyczna obiektow handlowych, zuzycie energii w systemach chlodniczych i oswietleniowych, gospodarke odpadami opakowaniowymi oraz organizacje logistyki dostaw do punktow sprzedazy. Charakter dzialalnosci wymaga monitorowania zuzycia mediow oraz zarzadzania strumieniem produktow i opakowan w calym cyklu sprzedazy.',
            'en': 'The trade and retail sector involves the operation of physical stores, distribution centers, and online sales channels that generate energy consumption, packaging use, and waste. Key areas include energy efficiency of retail facilities, energy use in refrigeration and lighting systems, packaging waste management, and organization of deliveries to sales outlets. The nature of operations requires monitoring utility consumption and managing product and packaging flows throughout the sales cycle.'
        },
        'S': {
            'pl': 'Dzialalnosc handlowa opiera sie na pracy personelu sprzedazowego, magazynowego oraz obslugi klienta, czesto w systemie zmianowym i w bezposrednim kontakcie z klientami. Istotne znaczenie maja warunki pracy w punktach sprzedazy, organizacja czasu pracy, standardy obslugi oraz bezpieczenstwo w przestrzeni sklepowej i magazynowej. Branza wymaga odpowiedniego przygotowania pracownikow do obslugi klientow oraz przestrzegania zasad bezpieczenstwa i higieny pracy.',
            'en': 'Retail operations rely on sales staff, warehouse personnel, and customer service teams, often working in shift systems and in direct contact with customers. Working conditions in retail outlets, organization of working time, service standards, and safety in store and warehouse areas are key elements. The sector requires proper employee preparation for customer interaction and adherence to health and safety rules.'
        },
        'G': {
            'pl': 'Sektor handlu podlega regulacjom dotyczacym ochrony konsumentow, zasad sprzedazy, bezpieczenstwa produktow, ochrony danych osobowych oraz obowiazkow podatkowych i sprawozdawczych. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja sprzedazowa, utrzymania zgodnosci z przepisami branzowymi oraz nadzoru nad procedurami wewnetrznymi w punktach sprzedazy i kanalach online. Stalym elementem funkcjonowania firm jest kontrola zgodnosci dzialan handlowych z obowiazujacymi regulacjami.',
            'en': 'The trade and retail sector is subject to regulations covering consumer protection, sales rules, product safety, data protection, and tax and reporting obligations. Operating in this sector requires management of sales documentation, compliance with industry regulations, and supervision of internal procedures in both physical stores and online channels. Ongoing control of commercial activities in line with applicable regulations is a standard element of business operations.'
        },
        'SC': {
            'pl': 'Branza handlowa funkcjonuje w ramach rozbudowanych lancuchow dostaw obejmujacych producentow, importerow, hurtownie oraz centra dystrybucyjne i sklepy detaliczne. Istotne znaczenie ma koordynacja dostaw do punktow sprzedazy, zarzadzanie zapasami magazynowymi oraz synchronizacja przeplywu towarow pomiedzy magazynami, sklepami i kanalami e-commerce. Struktura lancucha dostaw ksztaltuje organizacje procesow zaopatrzenia i dystrybucji w sieci handlowej.',
            'en': 'The trade and retail sector operates within extensive supply chains involving manufacturers, importers, wholesalers, distribution centers, and retail outlets. Coordination of deliveries to sales outlets, inventory management, and synchronization of goods flow between warehouses, stores, and e-commerce channels are key elements. The supply chain structure shapes procurement and distribution processes within the retail network.'
        }
    },

    'it_software': {
        'E': {
            'pl': 'Dzialalnosc w sektorze IT i oprogramowania wiaze sie z wykorzystaniem infrastruktury serwerowej, centrow danych, urzadzen koncowych oraz sprzetu elektronicznego, generujacych zuzycie energii i zasobow technicznych. Kluczowe obszary obejmuja efektywnosc energetyczna srodowisk serwerowych, systemy chlodzenia centrow danych, cykl zycia sprzetu IT oraz gospodarowanie zuzytym sprzetem elektronicznym. Charakter dzialalnosci wymaga monitorowania zuzycia energii w infrastrukturze cyfrowej oraz racjonalnego zarzadzania zasobami technologicznymi wykorzystywanymi do swiadczenia uslug.',
            'en': 'The IT and software sector involves the use of server infrastructure, data centers, end-user devices, and electronic equipment that generate energy consumption and use technical resources. Key areas include energy efficiency of server environments, data center cooling systems, IT equipment life cycle management, and handling of electronic waste. The nature of operations requires monitoring energy use within digital infrastructure and rational management of technological resources used to deliver services.'
        },
        'S': {
            'pl': 'Sektor IT opiera sie na pracy specjalistow technicznych, programistow, analitykow oraz zespolow projektowych, czesto funkcjonujacych w modelu pracy hybrydowej lub zdalnej. Istotne znaczenie maja organizacja czasu pracy, ergonomia stanowisk komputerowych, rozwoj kompetencji technologicznych oraz wspolpraca zespolowa w srodowisku projektowym. Dzialalnosc w tej branzy wiaze sie z koniecznoscia zapewnienia odpowiednich warunkow pracy oraz przestrzegania zasad bezpieczenstwa i higieny pracy w srodowisku biurowym i domowym.',
            'en': 'The IT sector relies on technical specialists, developers, analysts, and project teams, often operating in hybrid or remote work models. Organization of working time, workstation ergonomics, development of technological competencies, and team collaboration within project environments are key elements. Activities in this sector involve ensuring appropriate working conditions and adherence to health and safety principles in both office and home environments.'
        },
        'G': {
            'pl': 'Dzialalnosc w sektorze IT podlega regulacjom dotyczacym ochrony danych osobowych, bezpieczenstwa informacji, praw wlasnosci intelektualnej oraz obowiazkow umownych wobec klientow i partnerow biznesowych. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja projektowa, procedurami bezpieczenstwa informacji oraz nadzoru nad zgodnoscia z wymogami ochrony danych i praw wlasnosci intelektualnej. Stalym elementem funkcjonowania firm IT jest kontrola zgodnosci dzialan z obowiazujacymi regulacjami i standardami branzowymi.',
            'en': 'The IT sector is subject to regulations covering data protection, information security, intellectual property rights, and contractual obligations toward clients and business partners. Operating in this sector requires structured management of project documentation, information security procedures, and oversight of compliance with data protection and intellectual property requirements. Ongoing control of compliance with applicable regulations and industry standards is a standard element of IT operations.'
        },
        'SC': {
            'pl': 'Sektor IT funkcjonuje w oparciu o wspolprace z dostawcami infrastruktury technologicznej, uslug chmurowych, sprzetu komputerowego oraz zewnetrznymi firmami programistycznymi i serwisowymi. Istotne znaczenie ma dostepnosc uslug zewnetrznych dostawcow, ciaglosc wsparcia technicznego, koordinacja z partnerami odpowiedzialnymi za hosting i infrastrukture oraz zarzadzanie relacjami z podwykonawcami. Struktura wspolpracy z dostawcami uslug i sprzetu ksztaltuje sposob realizacji projektow oraz ciaglosc swiadczenia uslug informatycznych.',
            'en': 'The IT sector operates through cooperation with providers of technological infrastructure, cloud services, computer hardware, and external software development and service companies. The availability of external provider services, continuity of technical support, coordination with partners responsible for hosting and infrastructure, and management of subcontractor relationships are important elements. The structure of cooperation with service and equipment providers shapes project execution and the continuity of IT service delivery.'
        }
    },

    'finance_fintech': {
        'E': {
            'pl': 'Sektor finansowy, w tym fintech, funkcjonuje glownie w oparciu o infrastrukture biurowa i cyfrowa, obejmujaca centra danych, systemy transakcyjne, sieci teleinformatyczne oraz sprzet informatyczny. Kluczowe obszary srodowiskowe dotycza zuzycia energii w infrastrukturze IT, funkcjonowania powierzchni biurowych oraz cyklu zycia urzadzen elektronicznych. Charakter dzialalnosci wiaze sie z monitorowaniem zuzycia energii i zasobow technicznych wykorzystywanych do obslugi procesow finansowych i uslug cyfrowych.',
            'en': 'The finance sector, including fintech, operates primarily through office and digital infrastructure, including data centers, transaction systems, telecommunication networks, and IT equipment. Key environmental aspects relate to energy consumption within IT infrastructure, operation of office facilities, and the life cycle of electronic devices. The nature of operations involves monitoring energy use and technical resources required to support financial processes and digital services.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze finansowym opiera sie na pracy specjalistow z zakresu finansow, analityki, technologii oraz obslugi klienta, funkcjonujacych w srodowisku biurowym lub w modelu hybrydowym. Istotne znaczenie maja organizacja czasu pracy, standardy obslugi klienta, rozwoj kompetencji zawodowych oraz ergonomia stanowisk pracy. Funkcjonowanie branzy wiaze sie z zapewnieniem odpowiednich warunkow pracy oraz przestrzeganiem zasad bezpieczenstwa i higieny pracy w srodowisku biurowym.',
            'en': 'The finance sector relies on finance professionals, analysts, technology specialists, and customer service teams operating in office or hybrid work environments. Organization of working time, customer service standards, professional development, and workstation ergonomics are key elements. Sector operations involve ensuring appropriate working conditions and adherence to health and safety principles in office environments.'
        },
        'G': {
            'pl': 'Sektor finansowy podlega rozbudowanym regulacjom obejmujacym wymogi nadzorcze, standardy raportowe, ochrone danych osobowych, przeciwdzialanie praniu pieniedzy oraz zarzadzanie ryzykiem operacyjnym i technologicznym. Prowadzenie dzialalnosci wymaga utrzymania procedur zgodnosci, dokumentacji regulacyjnej, systemow kontroli wewnetrznej oraz jasnego podzialu odpowiedzialnosci. Stalym elementem funkcjonowania instytucji finansowych jest nadzor nad zgodnoscia dzialan z obowiazujacymi przepisami i standardami branzowymi.',
            'en': 'The financial sector is subject to extensive regulations covering supervisory requirements, reporting standards, data protection, anti-money laundering obligations, and management of operational and technological risks. Operating in this sector requires maintaining compliance procedures, regulatory documentation, internal control systems, and clear allocation of responsibilities. Ongoing oversight of activities in line with applicable regulations and industry standards is a standard element of financial institutions\' operations.'
        },
        'SC': {
            'pl': 'Sektor finansowy funkcjonuje w oparciu o wspolprace z dostawcami technologii, operatorami platnosci, partnerami bankowymi oraz podmiotami swiadczacymi uslugi przetwarzania danych i infrastruktury transakcyjnej. Istotne znaczenie ma dostepnosc i ciaglosc dzialania dostawcow uslug zewnetrznych, koordinacja z podmiotami odpowiedzialnymi za infrastrukture platnicza oraz zarzadzanie relacjami z partnerami technologicznymi i outsourcingowymi. Struktura wspolpracy z dostawcami uslug ksztaltuje ciaglosc i organizacje procesow finansowych oraz swiadczenia uslug cyfrowych.',
            'en': 'The financial sector operates through cooperation with technology providers, payment operators, banking partners, and entities delivering data processing and transaction infrastructure services. The availability and continuity of external service providers, coordination with entities responsible for payment infrastructure, and management of relationships with technology and outsourcing partners are important elements. The structure of cooperation with service providers shapes the continuity and organization of financial processes and digital service delivery.'
        }
    },

    'services_other': {
        'E': {
            'pl': 'Sektor uslugowy funkcjonuje glownie w oparciu o infrastrukture biurowa, lokale uslugowe oraz sprzet wykorzystywany do swiadczenia uslug specjalistycznych. Kluczowe obszary srodowiskowe obejmuja zuzycie energii w budynkach, wykorzystanie materialow eksploatacyjnych (np. papier, srodki czystosci, materialy techniczne) oraz gospodarowanie odpadami powstajacymi w trakcie realizacji uslug. Charakter dzialalnosci wiaze sie z monitorowaniem zuzycia mediow oraz racjonalnym zarzadzaniem zasobami wykorzystywanymi w codziennej dzialalnosci.',
            'en': 'The services sector operates primarily through office infrastructure, service premises, and equipment used to deliver specialized services. Key environmental aspects include energy consumption in buildings, use of operational materials (e.g., paper, cleaning agents, technical supplies), and waste management related to service activities. The nature of operations involves monitoring utility consumption and rational management of resources used in daily activities.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze uslugowym opiera sie na pracy specjalistow swiadczacych uslugi doradcze, techniczne, administracyjne lub wsparcia operacyjnego. Istotne znaczenie maja organizacja czasu pracy, rozwoj kompetencji zawodowych oraz zapewnienie odpowiednich warunkow pracy. Funkcjonowanie branzy wiaze sie z przestrzeganiem zasad bezpieczenstwa i higieny pracy oraz utrzymaniem stabilnych zespolow realizujacych uslugi.',
            'en': 'The services sector relies on professionals delivering advisory, technical, administrative, or operational support services. Organization of working time, professional development, and appropriate working conditions are key elements. Sector operations involve adherence to health and safety principles and maintaining stable teams delivering services.'
        },
        'G': {
            'pl': 'Sektor uslugowy podlega regulacjom dotyczacym prowadzenia dzialalnosci gospodarczej, standardow zawodowych, ochrony danych osobowych oraz wymagan jakosciowych zwiazanych z danym rodzajem uslug. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja umowna, utrzymania przejrzystych procedur wewnetrznych oraz nadzoru nad zgodnoscia dzialan z obowiazujacymi przepisami branzowymi. Stalym elementem funkcjonowania firm uslugowych jest kontrola zgodnosci procesow z regulacjami sektorowymi i standardami zawodowymi.',
            'en': 'The services sector is subject to regulations covering business operations, professional standards, personal data protection, and quality requirements related to specific types of services. Operating in this sector requires management of contractual documentation, maintenance of transparent internal procedures, and oversight of compliance with applicable industry regulations. Ongoing control of processes in line with sector regulations and professional standards is a standard element of service providers\' operations.'
        },
        'SC': {
            'pl': 'Sektor uslugowy funkcjonuje w oparciu o wspolprace z podwykonawcami oraz dostawcami specjalistycznych narzedzi, systemow informatycznych i uslug wspierajacych. Istotne znaczenie ma koordynacja wspolpracy z partnerami zewnetrznymi oraz zarzadzanie relacjami z dostawcami uslug wspierajacych i podwykonawcami. Struktura wspolpracy z dostawcami i podwykonawcami ksztaltuje sposob realizacji projektow oraz organizacje swiadczenia uslug.',
            'en': 'The services sector operates through cooperation with subcontractors and providers of specialized tools, IT systems, and supporting services. Coordination with external partners and management of relationships with supporting service providers and subcontractors are important elements. The structure of cooperation with suppliers and subcontractors shapes project execution and service delivery organization.'
        }
    }
};

/**
 * Gets industry-specific profile text explaining why a pillar is important for an industry
 * @param {string} industryCode - Industry code (e.g., 'construction', 'energy_resources')
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry profile text or empty string
 */
function getIndustryProfileText(industryCode, pillar, language = 'pl') {
    if (!industryCode || !pillar) return '';

    const effectiveLanguage = language === 'en' ? 'en' : 'pl';

    return INDUSTRY_PROFILE[industryCode]?.[pillar]?.[effectiveLanguage] || '';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INDUSTRY_PROFILE,
        getIndustryProfileText
    };
}

// Also expose globally if in browser context
if (typeof window !== 'undefined') {
    window.IndustryProfile = {
        INDUSTRY_PROFILE,
        getIndustryProfileText
    };
}

},{}],9:[function(require,module,exports){
/**
 * Industry Risk Introduction Dictionary
 * Auto-generated from COMMENTS.md TOP_INTRO entries
 *
 * Provides industry-specific context for TOP 3 risk areas.
 * Structure: INDUSTRY_RISK_INTRO[industryCode][pillar][language]
 *
 * Industry codes:
 * - construction
 * - energy_resources
 * - industrial_production
 * - logistics_transport
 * - retail_trade
 * - it_software
 * - finance_fintech
 * - services_other
 */

const INDUSTRY_RISK_INTRO = {
    construction: {
        E: {
            pl: "W budownictwie decyzje środowiskowe, kompletność dokumentacji projektowej oraz kontrola jakości materiałów wpływają bezpośrednio na harmonogram robót. Błąd formalny lub niezgodność materiałowa może wstrzymać prace, wydłużyć termin realizacji i narazić wykonawcę na kary umowne.",
            en: "In construction, environmental issues directly influence investor decisions, administrative permits, and the ability to execute contracts."
        },
        S: {
            pl: "BHP na budowie oraz nadzór nad podwykonawcami decydują o ciągłości prac i terminowości realizacji. Wypadek lub niewłaściwy nadzór nad podwykonawcą może wstrzymać roboty, zwiększyć koszty i przenieść odpowiedzialność na generalnego wykonawcę.",
            en: "Health and safety on the construction site, as well as supervision of subcontractors, determine the continuity of works and the timely completion of the project. An accident or improper supervision of a subcontractor may halt the works, increase costs, and shift liability to the general contractor."
        },
        G: {
            pl: "W budownictwie jakość dokumentacji, sprawny obieg decyzji oraz kontrola zmian projektowych wpływają na tempo realizacji inwestycji. Niespójności w dokumentach lub brak formalnego zatwierdzania zmian mogą prowadzić do roszczeń, sporów oraz dodatkowych kosztów po stronie wykonawcy.",
            en: "In the construction sector, the quality of documentation, efficient circulation of decisions, and control of design changes influence the pace of project execution. Inconsistencies in documents or the lack of formal approval of changes may lead to claims, disputes, and additional costs on the contractor's side."
        },
        SC: {
            pl: "Kontrola podwykonawców i jakości materiałów warunkuje dotrzymanie harmonogramu budowy. Opóźnienie dostaw lub wada materiałowa może spowodować przestój, naliczenie kar umownych oraz obniżenie rentowności kontraktu.",
            en: "Control over subcontractors and the quality of materials determines adherence to the construction schedule. A delay in deliveries or a material defect may cause downtime, trigger contractual penalties, and reduce the profitability of the contract."
        }
    },

    energy_resources: {
        E: {
            pl: "W sektorze energetyki i surowców emisje, pozwolenia środowiskowe i decyzje regulatora bezpośrednio wpływają na możliwość uruchomienia instalacji. Opóźnienie w uzyskaniu decyzji administracyjnych może wstrzymać projekt wart setki milionów złotych.",
            en: "In the energy and raw materials sector, emissions, environmental permits, and regulatory decisions directly affect the ability to commission installations. Delays in obtaining administrative decisions can halt projects worth hundreds of millions in capital investment."
        },
        S: {
            pl: "Bezpieczeństwo pracy, nadzór nad podwykonawcami oraz relacje ze społecznością lokalną wpływają bezpośrednio na ciągłość wydobycia lub produkcji. Wypadek, protest lub konflikt społeczny mogą zatrzymać działalność i wygenerować dodatkowe koszty oraz kontrole ze strony instytucji.",
            en: "Workplace safety, supervision of subcontractors, and relations with the local community directly affect the continuity of extraction or production. An accident, protest, or social conflict may halt operations and generate additional costs as well as inspections by authorities."
        },
        G: {
            pl: "W tej branży sposób zarządzania oraz zgodność z wymaganiami regulatora wpływają na tempo uzyskiwania koncesji i finansowania inwestycji. Braki w nadzorze, dokumentacji lub procedurach mogą opóźniać decyzje administracyjne i utrudniać pozyskanie finansowania.",
            en: "In this industry, management practices and compliance with regulatory requirements influence the speed of obtaining concessions and investment financing. Deficiencies in oversight, documentation, or procedures may delay administrative decisions and make it more difficult to secure financing."
        },
        SC: {
            pl: "Stabilność dostaw surowców i dostęp do infrastruktury przesyłowej warunkują ciągłość produkcji. Przerwa w dostawach oznacza przestój instalacji, a przy wysokich kosztach stałych każdy dzień bez produkcji bezpośrednio obniża rentowność działalności.",
            en: "The stability of raw material supplies and access to transmission infrastructure determine the continuity of production. A disruption in supplies means downtime for the installation, and with high fixed costs, every day without production directly reduces operational profitability."
        }
    },

    industrial_production: {
        E: {
            pl: "Zużycie energii, poziom odpadu oraz stabilność parametrów linii bezpośrednio wpływają na koszt jednostkowy wyrobu. Niekontrolowane straty materiałowe lub wahania zużycia energii obniżają wydajność linii i zwiększają koszt produkcji przy tej samej zdolności wytwórczej.",
            en: "Energy consumption, scrap rate, and line parameter stability directly impact unit production cost. Uncontrolled material losses or energy fluctuations reduce line efficiency and increase cost at the same production capacity."
        },
        S: {
            pl: "Ciągłość pracy linii zależy od dyscypliny operacyjnej, przestrzegania procedur oraz bezpieczeństwa pracy na hali produkcyjnej. Błąd operatora lub brak kontroli procesu może wywołać przestój technologiczny, zwiększyć odsetek braków i podnieść koszt jednostkowy całej partii.",
            en: "Production continuity depends on operational discipline, procedural compliance, and shop-floor safety. Operator error or weak process control may trigger downtime, increase defect rates, and raise unit cost for the entire batch."
        },
        G: {
            pl: "Jakość dokumentacji technologicznej, formalna kontrola zmian receptur oraz nadzór nad parametrami linii decydują o stabilności produkcji. Brak kontroli nad zmianą procesu może skutkować reklamacjami, serią wadliwych wyrobów oraz utratą rentowności całej partii.",
            en: "Technical documentation quality, formal change control, and line parameter supervision determine production stability. Weak process governance may result in customer claims, defective batches, and margin loss across the entire production run."
        },
        SC: {
            pl: "Jakość surowców i terminowość dostaw wpływają bezpośrednio na wydajność linii produkcyjnej. Surowiec poza specyfikacją powoduje przestoje, zwiększony odpad i spadek efektywności linii, co natychmiast podnosi koszt jednostkowy.",
            en: "Raw material quality and delivery timeliness directly affect production line performance. Off-spec materials cause downtime, increased scrap, and reduced line efficiency, which immediately raises unit production costs."
        }
    },

    logistics_transport: {
        E: {
            pl: "Zużycie paliwa, emisje oraz stan techniczny floty bezpośrednio wpływają na koszt kilometra i rentowność kontraktów transportowych. Wahania cen paliwa lub nowe ograniczenia emisyjne mogą obniżyć marżę i wymusić renegocjację stawek przy długoterminowych umowach z klientami.",
            en: "Fuel consumption, emissions, and fleet condition directly impact cost per kilometer and contract profitability. Fuel price volatility or new emission regulations may reduce margins and force rate renegotiations under long-term client contracts."
        },
        S: {
            pl: "Bezpieczeństwo kierowców i organizacja czasu pracy wpływają bezpośrednio na terminowość dostaw. Wypadek lub naruszenie norm czasu jazdy może oznaczać unieruchomienie pojazdu lub części floty, kary umowne oraz utratę wiarygodności w oczach kontrahentów.",
            en: "Driver safety and working time compliance directly affect delivery punctuality. An accident or violation of driving time regulations may immobilize a vehicle or part of the fleet, trigger contractual penalties, and damage credibility with clients."
        },
        G: {
            pl: "Kontrola harmonogramów, monitorowanie floty i egzekwowanie warunków umów decydują o dotrzymaniu warunków kontraktowych. Brak nadzoru nad terminami lub dokumentacją przewozową może skutkować karami za opóźnienia i utratą długoterminowych kontraktów.",
            en: "Schedule control, fleet monitoring, and enforcement of contract terms determine whether contractual obligations are met. Weak supervision over deadlines or transport documentation may result in delay penalties and loss of long-term contracts."
        },
        SC: {
            pl: "Sprawność floty, dostępność kierowców oraz stabilność dostaw paliwa warunkują ciągłość realizacji tras. Opóźnienie dostawy lub awaria pojazdu generują kary za niedotrzymanie terminu oraz podnoszą koszt operacyjny każdej trasy.",
            en: "Fleet reliability, driver availability, and stable fuel supply determine route continuity. Delivery delays or vehicle breakdowns trigger contractual penalties and increase operational cost per route."
        }
    },

    retail_trade: {
        E: {
            pl: "Zarządzanie zapasami, sezonowość sprzedaży oraz kontrola stanów magazynowych bezpośrednio wpływają na dostępność towaru i poziom marży. Nadmiar zapasu zamraża kapitał obrotowy, a braki magazynowe w szczycie sezonu oznaczają utraconą sprzedaż i osłabienie relacji z klientem.",
            en: "Inventory management, seasonality, and warehouse stock control directly affect product availability and margin levels. Excess inventory ties up working capital, while stock shortages during peak season result in lost sales and weakened customer relationships."
        },
        S: {
            pl: "Obsługa zwrotów i reklamacji wpływa bezpośrednio na koszt sprzedaży oraz postrzeganie marki. Wysoki poziom zwrotów obniża marżę jednostkową i może podważyć zaufanie klientów przy powtarzających się problemach jakościowych.",
            en: "Returns and complaint handling directly affect cost of sales and brand perception. A high return rate reduces unit margin and may undermine customer trust when quality issues repeatedly occur."
        },
        G: {
            pl: "Zgodność z przepisami konsumenckimi, poprawność oznaczeń oraz kontrola dokumentacji sprzedażowej decydują o bezpieczeństwie działalności handlowej. Naruszenie regulacji może skutkować karami administracyjnymi, zwrotem środków oraz utratą reputacji marki.",
            en: "Compliance with consumer regulations, correct labeling, and control of sales documentation determine the security of retail operations. Regulatory breaches may result in administrative penalties, forced refunds, and damage to brand reputation."
        },
        SC: {
            pl: "Sprawność łańcucha dostaw oraz terminowość dostaw do magazynu warunkują ciągłość ekspozycji towaru na półce. Opóźnienia dostaw lub błędy kompletacyjne obniżają dostępność produktu, generują utraconą sprzedaż i bezpośrednio wpływają na rentowność sprzedaży.",
            en: "Supply chain efficiency and on-time warehouse deliveries determine shelf availability. Delivery delays or picking errors reduce product availability, generate lost sales, and directly impact sales profitability."
        }
    },

    it_software: {
        E: {
            pl: "Stabilność infrastruktury IT, zużycie zasobów serwerowych i architektura systemu wpływają bezpośrednio na dostępność usług dla klienta. Przeciążenie lub awaria środowiska produkcyjnego może skutkować przerwą w działaniu systemu, utratą przychodów abonamentowych oraz roszczeniami wynikającymi z umów z klientami.",
            en: "IT infrastructure stability, server resource usage, and system architecture directly impact service availability for clients. Overload or production environment failure may cause service downtime, recurring revenue loss, and compensation claims under client contracts."
        },
        S: {
            pl: "Zależność od kluczowych programistów oraz kompetencje zespołu wpływają na tempo wdrożeń i utrzymanie systemów. Odejście kluczowego programisty może opóźnić realizację projektu, narazić firmę na kary umowne oraz osłabić relację z klientem.",
            en: "Dependence on key developers and team expertise directly affects deployment timelines and system maintenance. The departure of a key developer may delay project delivery, trigger contractual penalties, and weaken client relationships."
        },
        G: {
            pl: "Bezpieczeństwo danych, zgodność z przepisami o ochronie danych oraz kontrola dostępu do systemów decydują o zaufaniu klientów. Wycieki danych lub naruszenie regulacji mogą skutkować odpowiedzialnością prawną, karami finansowymi oraz utratą kluczowych klientów.",
            en: "Data security, compliance with data protection regulations, and access control determine client trust. Data breaches or regulatory violations may result in legal liability, financial penalties, and loss of key clients."
        },
        SC: {
            pl: "Zależność od dostawców chmury, integratorów oraz zewnętrznych API wpływa na ciągłość działania systemu. Awaria kluczowego partnera technologicznego może przerwać dostępność usług, wygenerować kary umowne oraz doprowadzić do utraty kontraktu.",
            en: "Dependence on cloud providers, integrators, and external APIs directly affects system continuity. Failure of a critical technology partner may interrupt service availability, trigger contractual penalties, and lead to contract loss."
        }
    },

    finance_fintech: {
        E: {
            pl: "Zgodność z regulacjami oraz bieżący nadzór nad działalnością decydują o możliwości oferowania usług finansowych. Naruszenie przepisów może skutkować karą administracyjną, ograniczeniem działalności lub utratą licencji, co bezpośrednio wpływa na ciągłość przychodów i zaufanie klientów.",
            en: "Regulatory compliance and ongoing supervisory oversight determine the ability to provide financial services. Regulatory breaches may result in administrative penalties, business restrictions, or license withdrawal, directly affecting revenue continuity and client trust."
        },
        S: {
            pl: "Ochrona danych klientów, bezpieczeństwo transakcji oraz jakość obsługi wpływają na reputację instytucji finansowej. Incydent związany z wyciekiem danych lub nieautoryzowaną transakcją może doprowadzić do odpływu klientów, roszczeń oraz trwałego spadku przychodów.",
            en: "Customer data protection, transaction security, and service quality directly impact institutional reputation. A data breach or unauthorized transaction may trigger customer outflow, legal claims, and long-term revenue decline."
        },
        G: {
            pl: "Sprawny system kontroli wewnętrznej i zarządzania ryzykiem wpływa na relacje z instytucjami nadzorczymi oraz dostęp do finansowania. Braki w nadzorze lub systemie kontroli wewnętrznej mogą skutkować dodatkowymi kontrolami, sankcjami oraz ograniczeniem współpracy z bankami lub inwestorami.",
            en: "A strong internal control and risk management system determines relationships with supervisory authorities and access to funding. Weak oversight or internal control gaps may lead to intensified supervision, regulatory sanctions, and restricted cooperation with banks or investors."
        },
        SC: {
            pl: "Zależność od dostawców systemów płatniczych, infrastruktury IT oraz partnerów technologicznych wpływa na ciągłość realizacji transakcji. Awaria systemu lub cyberatak może przerwać obsługę klientów, wygenerować odpowiedzialność finansową i osłabić reputację na rynku.",
            en: "Dependence on payment systems, IT infrastructure, and technology partners directly affects transaction continuity. System failure or cyberattack may disrupt customer service, create financial liability, and damage market reputation."
        }
    },

    services_other: {
        E: {
            pl: "Jakość obsługi oraz terminowość realizacji zleceń bezpośrednio wpływają na satysfakcję klienta i powtarzalność przychodów. Opóźnienie w realizacji usługi może skutkować utratą klienta, spadkiem rekomendacji oraz ograniczeniem powtarzalnych przychodów.",
            en: "Service quality and timely execution directly affect client satisfaction and recurring revenue. A delay in service delivery may result in client loss, reduced referrals, and a decline in recurring income."
        },
        S: {
            pl: "Stabilność zespołu i kompetencje pracowników wpływają na jakość świadczonej usługi oraz relacje z klientami. Odejście kluczowej osoby lub błąd merytoryczny może osłabić zaufanie klienta i doprowadzić do zakończenia współpracy.",
            en: "Team stability and employee competence determine service quality and client relationships. The departure of a key specialist or a professional error may undermine client trust and lead to contract termination."
        },
        G: {
            pl: "Odpowiedzialność zawodowa oraz poufność informacji klientów decydują o reputacji firmy na rynku. Naruszenie poufności lub błąd w realizacji usługi może skutkować roszczeniami, utratą klientów i trwałym spadkiem przychodów.",
            en: "Professional liability and client confidentiality determine market reputation. A confidentiality breach or service error may result in legal claims, client loss, and long-term revenue decline."
        },
        SC: {
            pl: "Zależność od kluczowych współpracowników i podwykonawców wpływa na ciągłość realizacji usług. Opóźnienia lub niska jakość pracy partnerów zewnętrznych mogą obniżyć poziom obsługi klienta i ograniczyć utrzymanie kontraktów.",
            en: "Dependence on key collaborators and subcontractors affects service continuity. Delays or poor performance by external partners may reduce service quality and limit client retention."
        }
    }
};

/**
 * Get risk intro for a specific industry and pillar
 * @param {string} industryCode - Industry code
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} lang - Language (pl or en)
 * @returns {string|null} Risk intro text
 */
function getIndustryRiskIntro(industryCode, pillar, lang = 'pl') {
    const industry = INDUSTRY_RISK_INTRO[industryCode];
    if (!industry) return null;

    const pillarData = industry[pillar];
    if (!pillarData) return null;

    return pillarData[lang] || pillarData['en'];
}

module.exports = {
    INDUSTRY_RISK_INTRO,
    getIndustryRiskIntro
};

},{}],10:[function(require,module,exports){
/**
 * Industry-specific TOP 3 Risk Comments
 * Auto-generated from COMMENTS.md
 *
 * Structure: industry → pillar → riskType → state → { pl, en }
 */

const INDUSTRY_TOP_RISKS = {
    construction: {
        E: {
            Business: {
                green: {
                    pl: "Koszty materiałów, zużycie energii na placu budowy oraz zgodność z dokumentacją projektową są pod bieżącą kontrolą kierownictwa kontraktu. Odchylenia mieszczą się w założonym budżecie i nie wpływają na marżę projektu, o ile utrzymana zostaje dyscyplina kosztowa i nadzór nad zamówieniami.",
                    pl: "Koszty materiałów, zużycie energii na placu budowy oraz zgodność z dokumentacją projektową są pod bieżącą kontrolą kierownictwa kontraktu. Odchylenia mieszczą się w założonym budżecie i nie wpływają na marżę projektu, o ile utrzymana zostaje dyscyplina kosztowa i nadzór nad zamówieniami.",
                    en: "Material costs, energy consumption at the construction site, and compliance with project documentation are under the ongoing supervision of contract management. Deviations remain within the assumed budget and do not affect the project margin, provided that cost discipline and procurement oversight are maintained."
                },
                yellow: {
                    pl: "Wzrost cen stali, betonu lub paliwa do maszyn budowlanych może zwiększyć koszt realizacji robót. Przy kontrakcie ryczałtowym firma ponosi to ryzyko, co bezpośrednio obniża marżę projektu i ogranicza przestrzeń na nieprzewidziane wydatki.",
                    en: "An increase in the prices of steel, concrete, or fuel for construction machinery may raise the cost of executing the works. Under a lump-sum contract, the company bears this risk, which directly reduces the project margin and limits flexibility for unforeseen expenses."
                },
                orange: {
                    pl: "Znaczące przekroczenie kosztów materiałów lub błędy w dokumentacji technicznej mogą doprowadzić do trwałego przekroczenia budżetu projektu. Skutkiem jest spadek rentowności kontraktu, napięcia w przepływach pieniężnych oraz ryzyko sporów finansowych z kontrahentem.",
                    en: "Significant overruns in material costs or errors in technical documentation may lead to a permanent budget overrun of the project. The consequences include reduced contract profitability, pressure on cash flows, and the risk of financial disputes with the counterparty."
                },
                critical: {
                    pl: "Brak kontroli nad kosztami materiałów, energii oraz zmianami projektowymi może doprowadzić do utraty rentowności całego kontraktu i zagrozić płynności finansowej projektu. W skrajnym przypadku może to oznaczać kary umowne, utratę kontraktu i bezpośredni spadek przychodów przy utrzymaniu kosztów stałych.",
                    en: "Lack of control over material costs, energy consumption, and design changes may lead to the loss of profitability of the entire contract and threaten the project’s financial liquidity. In extreme cases, this may result in contractual penalties, loss of the contract, and a direct decline in revenue while fixed costs remain in place."
                }
            },
            Reputation: {
                green: {
                    pl: "Realizacja robót przebiega zgodnie z harmonogramem i budżetem, a kontrola kosztów materiałów oraz jakości wykonania jest stabilna. Firma utrzymuje wiarygodność w oczach kontrahentów i nie traci pozycji przy ubieganiu się o kolejne zlecenia.",
                    en: "Project execution remains aligned with schedule and budget, with stable control over material costs and workmanship quality. The company maintains credibility with contractors and preserves its position in future tenders."
                },
                yellow: {
                    pl: "Pojawiające się odchylenia kosztowe lub drobne korekty harmonogramu mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się problemy obniżają wiarygodność firmy i utrudniają pozyskiwanie kolejnych kontraktów.",
                    en: "Emerging cost deviations or minor schedule adjustments may raise concerns on the client's side. Repeated issues reduce company credibility and make winning future contracts more difficult."
                },
                orange: {
                    pl: "Znaczące przekroczenia kosztów lub poważne błędy w realizacji robót mogą podważyć zaufanie kontrahenta. Negatywna ocena jakości lub nieterminowości prowadzi do utraty referencji i ogranicza możliwość pozyskiwania kolejnych projektów.",
                    en: "Significant cost overruns or serious deficiencies in the execution of works may undermine the counterparty's trust. A negative assessment of quality or timeliness leads to the loss of references and limits the ability to secure future projects."
                },
                critical: {
                    pl: "Trwałe przekroczenia budżetu, poważne uchybienia jakościowe lub niedotrzymanie terminów mogą doprowadzić do utraty zaufania kluczowych kontrahentów. W skrajnym przypadku oznacza to wykluczenie z przyszłych przetargów oraz trwałe ograniczenie możliwości pozyskiwania nowych kontraktów.",
                    en: "Persistent budget overruns, serious quality deficiencies, or failure to meet deadlines may result in the loss of trust of key counterparties. In extreme cases, this may lead to exclusion from future tenders and a permanent limitation in the ability to secure new contracts."
                }
            },
            Operational: {
                green: {
                    pl: "Realizacja robót przebiega zgodnie z harmonogramem, a dostawy materiałów i praca brygad są skoordynowane. Ewentualne zakłócenia mają charakter incydentalny i nie powodują przestojów na placu budowy.",
                    en: "Construction works are progressing according to schedule, with coordinated material deliveries and crew availability. Any disruptions are incidental and do not result in downtime on site."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach materiałów lub krótkotrwała niedostępność sprzętu mogą zakłócić harmonogram prac. Pojedyncze przestoje brygad wydłużają czas realizacji i wymagają korekt w organizacji robót.",
                    en: "Delays in material deliveries or temporary equipment unavailability may disrupt the work schedule. Isolated crew downtime extends project duration and requires adjustments in site organization."
                },
                orange: {
                    pl: "Powtarzające się braki materiałowe, awarie maszyn lub nieskoordynowana praca podwykonawców mogą doprowadzić do istotnego opóźnienia harmonogramu. Zakłócenia robót generują przestoje brygad i utrudniają utrzymanie ciągłości realizacji projektu.",
                    en: "Repeated material shortages, equipment failures, or poorly coordinated subcontractors may lead to significant schedule delays. Work disruptions generate crew downtime and compromise project continuity."
                },
                critical: {
                    pl: "Brak ciągłości dostaw, poważne awarie sprzętu lub długotrwałe wstrzymanie robót mogą doprowadzić do zatrzymania prac na budowie. W skrajnym przypadku oznacza to utratę kontroli nad harmonogramem, paraliż operacyjny projektu oraz konieczność reorganizacji robót i poniesienia dodatkowych kosztów przywrócenia prac.",
                    en: "Supply interruptions, major equipment failures, or prolonged work suspension may result in a complete halt of construction activities. In extreme cases, this leads to loss of schedule control, operational paralysis of the project, and the need for project reorganization with additional recovery costs."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Dostępność wykwalifikowanych pracowników oraz stabilna współpraca z podwykonawcami pozwalają utrzymać tempo robót i kontrolę kosztów osobowych. Sporadyczne incydenty BHP nie wpływają istotnie na realizację kontraktu ani jego rentowność.",
                    en: "The availability of qualified workers and stable cooperation with subcontractors allow for maintaining the pace of works and controlling labor costs. Occasional health and safety incidents do not materially affect contract execution or its profitability."
                },
                yellow: {
                    pl: "Ograniczona dostępność wykwalifikowanych pracowników lub wzrost stawek podwykonawców może zwiększyć koszt realizacji robót. W dłuższej perspektywie obniża to marżę projektu i może wymagać renegocjacji zakresu prac lub przesunięcia harmonogramu.",
                    en: "Limited availability of qualified workers or an increase in subcontractor rates may raise the cost of executing the works. In the longer term, this reduces the project margin and may require renegotiation of the scope of work or adjustments to the schedule."
                },
                orange: {
                    pl: "Braki kadrowe, częste zmiany podwykonawców lub poważne naruszenia zasad BHP mogą znacząco podnieść koszt realizacji inwestycji. Skutkiem jest spadek rentowności kontraktu oraz ryzyko naliczenia kar za niewywiązanie się z warunków umowy.",
                    en: "Workforce shortages, frequent changes of subcontractors, or serious health and safety violations may significantly increase the cost of project execution. The consequences include reduced contract profitability and the risk of penalties for failure to meet contractual terms."
                },
                critical: {
                    pl: "Utrata kluczowych brygad, poważny wypadek na budowie lub zerwanie współpracy z głównym podwykonawcą mogą zagrozić realizacji kontraktu. W skrajnym przypadku może to doprowadzić do utraty kontraktu i trwałego osłabienia wyniku finansowego firmy.",
                    en: "Loss of key crews, a serious accident on the construction site, or termination of cooperation with the main subcontractor may jeopardize contract execution. In extreme cases, this may lead to the loss of the contract and a lasting deterioration of the company's financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Stabilna kadra, przestrzeganie zasad BHP oraz sprawdzona współpraca z podwykonawcami wzmacniają postrzeganie firmy jako rzetelnego partnera. Pojedyncze incydenty nie wpływają istotnie na relacje z kontrahentami ani ocenę współpracy.",
                    en: "A stable workforce, compliance with health and safety regulations, and proven cooperation with subcontractors strengthen the company's perception as a reliable partner. Isolated incidents do not materially affect relationships with counterparties or the overall assessment of cooperation."
                },
                yellow: {
                    pl: "Częstsza rotacja brygad, drobne naruszenia zasad BHP lub niestabilność podwykonawców mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się problemy osłabiają zaufanie i utrudniają budowanie długofalowych relacji biznesowych.",
                    en: "Increased crew turnover, minor safety breaches, or unstable subcontractor performance may raise concerns on the client's side. Repeated issues weaken trust and complicate long-term business relationships."
                },
                orange: {
                    pl: "Poważne naruszenia zasad BHP, konflikty z podwykonawcami lub niska jakość pracy brygad mogą podważyć wiarygodność firmy na budowie. Negatywna ocena współpracy ogranicza możliwość uzyskania rekomendacji i udziału w kolejnych projektach.",
                    en: "Serious safety breaches, subcontractor disputes, or poor crew performance may undermine the company's credibility on site. Negative cooperation assessments limit the ability to obtain references and participate in future projects."
                },
                critical: {
                    pl: "Wypadek śmiertelny, poważne naruszenia zasad bezpieczeństwa lub zerwanie współpracy z kluczowym podwykonawcą mogą doprowadzić do utraty zaufania kontrahentów. W skrajnym przypadku oznacza to wykluczenie z przyszłych realizacji i trwałe ograniczenie możliwości pozyskiwania nowych kontraktów.",
                    en: "A fatal accident, serious safety violations, or termination of cooperation with a key subcontractor may result in loss of contractor trust. In extreme cases, this leads to exclusion from future projects and long-term limitations in securing new contracts."
                }
            },
            Operational: {
                green: {
                    pl: "Brygady pracują przy pełnym obłożeniu, a współpraca z podwykonawcami jest stabilna. Sporadyczne nieobecności lub drobne incydenty BHP nie zakłócają organizacji pracy ani harmonogramu projektu.",
                    en: "Crews operate at full capacity, and cooperation with subcontractors remains stable. Occasional absences or minor safety incidents do not disrupt work organization or the project schedule."
                },
                yellow: {
                    pl: "Przejściowe niedobory kadry lub rotacja podwykonawców mogą spowolnić postęp robót. Zastępowanie pracowników wymaga reorganizacji prac i korekt harmonogramu.",
                    en: "Temporary labor shortages or subcontractor turnover may slow down work progress. Replacing crew members requires work reorganization and schedule adjustments."
                },
                orange: {
                    pl: "Znaczące niedobory kadrowe, konflikty z podwykonawcami lub poważne naruszenia zasad bezpieczeństwa mogą doprowadzić do wstrzymania części robót. Zakłócenia organizacyjne utrudniają utrzymanie ciągłości prac i destabilizują realizację projektu.",
                    en: "Significant labor shortages, subcontractor disputes, or serious safety breaches may lead to suspension of part of the works. Organizational disruptions compromise work continuity and destabilize project execution."
                },
                critical: {
                    pl: "Poważny wypadek na budowie, decyzja organu nadzoru o wstrzymaniu prac lub nagłe odejście kluczowych brygad mogą całkowicie zatrzymać realizację robót. W skrajnym przypadku oznacza to utratę kontroli nad harmonogramem i konieczność odbudowy organizacji pracy od podstaw.",
                    en: "A major site accident, an authority's decision to suspend works, or sudden loss of key crews may completely halt construction activities. In extreme cases, this results in loss of schedule control and the need to rebuild work organization from scratch."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Dokumentacja projektowa, odbiory etapowe oraz rozliczenia z kontrahentem są prowadzone zgodnie z warunkami umowy. Ewentualne korekty formalne nie wpływają na płatności ani rentowność kontraktu.",
                    en: "Project documentation, stage approvals, and settlements with the contractor are handled in accordance with contractual terms. Any formal corrections do not affect payments or contract profitability."
                },
                yellow: {
                    pl: "Nieścisłości w dokumentacji, opóźnienia w odbiorach lub niepełne rozliczenia mogą przesunąć termin płatności. W konsekwencji pogarsza się płynność finansowa projektu i rośnie ryzyko sporów rozliczeniowych.",
                    en: "Inconsistencies in documentation, delays in approvals, or incomplete settlements may postpone payments. As a result, project cash flow weakens and the risk of financial disputes increases."
                },
                orange: {
                    pl: "Istotne braki formalne, błędy w umowie lub niezgodność zakresu prac z zapisami kontraktu mogą skutkować odmową odbioru robót lub wstrzymaniem płatności. Skutkiem jest realne zagrożenie dla rentowności projektu oraz napięcia w przepływach pieniężnych firmy.",
                    en: "Material formal deficiencies, contractual errors, or inconsistencies between scope and contract terms may result in refusal of work acceptance or payment suspension. This creates a real threat to project profitability and company cash flow."
                },
                critical: {
                    pl: "Poważne naruszenia warunków umowy, brak wymaganych decyzji administracyjnych lub istotne uchybienia formalne mogą doprowadzić do rozwiązania kontraktu. W skrajnym przypadku oznacza to utratę części należnych płatności lub roszczeń kontraktowych oraz bezpośredni spadek przychodów firmy.",
                    en: "Serious breaches of contractual terms, lack of required administrative decisions, or major formal deficiencies may lead to contract termination. In extreme cases, this results in loss of part of the due payments or contractual claims and a direct decline in company revenue."
                }
            },
            Reputation: {
                green: {
                    pl: "Dokumentacja projektowa, odbiory oraz rozliczenia są prowadzone zgodnie z warunkami umowy i obowiązującymi przepisami. Kontrole formalne nie wykazują istotnych uchybień, co wzmacnia wiarygodność firmy jako partnera kontraktowego.",
                    en: "Project documentation, approvals, and settlements are handled in line with contractual terms and applicable regulations. Formal inspections reveal no material deficiencies, reinforcing the company's credibility as a contractual partner."
                },
                yellow: {
                    pl: "Drobne nieścisłości w dokumentacji lub opóźnienia w formalnych odbiorach mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się uchybienia osłabiają postrzeganie firmy jako podmiotu rzetelnie zarządzającego kontraktem.",
                    en: "Minor inconsistencies in documentation or delays in formal approvals may raise concerns on the client's side. Repeated deficiencies weaken the perception of the company as a reliably managed contractor."
                },
                orange: {
                    pl: "Istotne braki formalne, niezgodność zakresu prac z umową lub negatywne wyniki kontroli mogą podważyć wiarygodność firmy w oczach kontrahentów. Taka sytuacja ogranicza możliwość uzyskiwania rekomendacji i udziału w kolejnych postępowaniach przetargowych.",
                    en: "Material formal deficiencies, scope inconsistencies, or negative inspection outcomes may undermine the company's credibility among contractors. This situation limits the ability to obtain references and participate in future tender procedures."
                },
                critical: {
                    pl: "Poważne naruszenia warunków umowy, sankcje administracyjne lub publiczne spory kontraktowe mogą doprowadzić do utraty zaufania kluczowych partnerów. W skrajnym przypadku oznacza to wykluczenie z przyszłych przetargów oraz trwałe osłabienie pozycji rynkowej firmy.",
                    en: "Serious contractual breaches, administrative sanctions, or public contract disputes may lead to loss of trust among key partners. In extreme cases, this results in exclusion from future tenders and long-term weakening of the company’s market position."
                }
            },
            Operational: {
                green: {
                    pl: "Dokumentacja budowy, dziennik budowy oraz wymagane zgłoszenia są prowadzone zgodnie z przepisami. Kontrole nadzoru nie wykazują uchybień, a odbiory etapowe przebiegają bez zakłóceń.",
                    en: "Construction documentation, site logbooks, and required notifications are maintained in compliance with regulations. Supervisory inspections reveal no deficiencies, and stage approvals proceed without disruption."
                },
                yellow: {
                    pl: "Drobne braki formalne lub opóźnienia w uzupełnianiu dokumentacji mogą spowolnić procedury odbiorowe. Konieczność wyjaśnień lub uzupełnień wydłuża proces administracyjny i wpływa na organizację robót.",
                    en: "Minor formal deficiencies or delays in documentation updates may slow down approval procedures. The need for clarifications or corrections extends administrative processes and affects work organization."
                },
                orange: {
                    pl: "Istotne niezgodności formalne, brak wymaganych uzgodnień lub negatywne wyniki kontroli mogą doprowadzić do wstrzymania części robót. Decyzje organów nadzoru destabilizują harmonogram i utrudniają kontynuację prac.",
                    en: "Material formal inconsistencies, missing required approvals, or negative inspection results may lead to partial suspension of works. Decisions by supervisory authorities destabilize the schedule and hinder project continuation."
                },
                critical: {
                    pl: "Brak wymaganych decyzji administracyjnych, poważne naruszenia przepisów budowlanych lub zakwestionowanie legalności robót mogą skutkować całkowitym wstrzymaniem prac. W skrajnym przypadku oznacza to paraliż realizacji projektu do czasu usunięcia uchybień i przywrócenia formalnej możliwości prowadzenia robót.",
                    en: "Lack of required administrative decisions, serious violations of construction regulations, or challenges to the legality of the works may result in a complete suspension of activities. In extreme cases, this means a paralysis of project execution until the deficiencies are remedied and the formal authorization to carry out the works is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z kluczowymi dostawcami materiałów oraz podwykonawcami branżowymi jest stabilna, a warunki handlowe pozostają przewidywalne i kontrolowane. Realizacja zobowiązań kontraktowych nie wpływa na zakładaną marżę projektu.",
                    en: "Cooperation with key material suppliers and specialist subcontractors remains stable, and commercial terms are predictable and controlled. Contract execution does not affect the planned project margin."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców lub pogorszenie warunków handlowych dostawców może zwiększyć koszt realizacji robót. Przy ograniczonej możliwości przeniesienia kosztów na zamawiającego prowadzi to do obniżenia marży kontraktu.",
                    en: "Rising subcontractor rates or deteriorating supplier terms may increase project execution costs. Limited ability to pass these costs on to the client directly reduces contract margins."
                },
                orange: {
                    pl: "Niewywiązywanie się kluczowych podwykonawców z zakresu prac lub konieczność ich pilnej zmiany może generować dodatkowe koszty i zaburzyć plan finansowy kontraktu. Skutkiem jest spadek rentowności projektu oraz utrata części zakładanej marży.",
                    en: "Failure of key subcontractors to deliver their scope or the urgent need to replace them may generate additional costs and disrupt the project’s financial plan. This results in reduced profitability and loss of part of the expected margin."
                },
                critical: {
                    pl: "Utrata kluczowego podwykonawcy branżowego lub zerwanie umowy przez strategicznego dostawcę może uniemożliwić realizację części kontraktu w zakładanym zakresie finansowym. W skrajnym przypadku prowadzi to do istotnych strat, utraty części przychodów oraz trwałego pogorszenia wyniku finansowego firmy.",
                    en: "Loss of a key specialist subcontractor or termination of an agreement by a strategic supplier may prevent execution of part of the contract within the planned financial framework. In extreme cases, this leads to significant losses, partial revenue loss, and longterm deterioration of the company’s financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z podwykonawcami i dostawcami jest stabilna, a jakość ich pracy spełnia wymagania kontraktowe. Nie występują sytuacje podważające wiarygodność firmy jako koordynatora projektu.",
                    en: "Cooperation with subcontractors and suppliers remains stable, and their work quality meets contractual requirements. No issues arise that would undermine the company's credibility as a project coordinator."
                },
                yellow: {
                    pl: "Pojedyncze problemy z jakością pracy podwykonawców lub opóźnienia po stronie dostawców mogą budzić zastrzeżenia kontrahentów. Powtarzalne sytuacje tego typu osłabiają postrzeganie firmy jako podmiotu skutecznie nadzorującego łańcuch wykonawczy.",
                    en: "Isolated quality issues with subcontractors or supplier delays may raise concerns among contracting parties. Repeated incidents weaken the perception of the company as effectively supervising its execution chain."
                },
                orange: {
                    pl: "Poważne problemy z kluczowymi podwykonawcami, w tym niewywiązywanie się z zakresu prac, mogą podważyć zaufanie do zdolności firmy do realizacji inwestycji. Skutkiem może być negatywna ocena ze strony zamawiającego oraz ograniczenie udziału w kolejnych procesach kwalifikacyjnych.",
                    en: "Serious issues with key subcontractors, including failure to deliver agreed scope, may undermine trust in the company’s execution capability. This may result in negative client evaluation and limited participation in future qualification procedures."
                },
                critical: {
                    pl: "Utrata kontroli nad kluczowymi partnerami zewnętrznymi lub publiczne spory z podwykonawcami mogą trwale podważyć wiarygodność firmy na rynku. W skrajnym przypadku prowadzi to do wykluczenia z przyszłych przetargów oraz utraty pozycji konkurencyjnej w branży.",
                    en: "Loss of control over key external partners or public disputes with subcontractors may permanently damage the company’s market credibility. In extreme cases, this leads to exclusion from future tenders and loss of competitive positioning in the sector."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z podwykonawcami i dostawcami kluczowych materiałów przebiega zgodnie z harmonogramem. Dostępność zasobów zewnętrznych pozostaje stabilna, a ciągłość realizacji robót jest utrzymana.",
                    en: "Cooperation with subcontractors and suppliers of key materials proceeds in accordance with the schedule. The availability of external resources remains stable, and the continuity of project execution is maintained."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw lub przesunięcia w dostępności podwykonawców mogą wymagać korekty harmonogramu. Zakłócenia te nie zatrzymują robót, lecz zwiększają presję organizacyjną na budowie.",
                    en: "Isolated delivery delays or shifts in subcontractor availability may require schedule adjustments. These disruptions do not stop the works but increase organizational pressure on site."
                },
                orange: {
                    pl: "Niewywiązywanie się kluczowych podwykonawców z terminów lub brak dostępu do specjalistycznych ekip może doprowadzić do istotnych opóźnień etapów prac. Skutkiem jest destabilizacja harmonogramu i ryzyko kumulacji robót w kolejnych fazach projektu.",
                    en: "Failure of key subcontractors to meet deadlines or lack of access to specialized crews may lead to significant delays in work stages. This results in schedule destabilization and risk of work accumulation in subsequent project phases."
                },
                critical: {
                    pl: "Utrata kluczowego podwykonawcy branżowego lub zerwanie ciągłości dostaw strategicznych elementów może całkowicie zatrzymać realizację części robót. W skrajnym przypadku oznacza to konieczność reorganizacji projektu oraz poniesienie kosztów przywrócenia ciągłości operacyjnej.",
                    en: "The loss of a key specialist subcontractor or a disruption in the supply of strategic components may completely halt the execution of certain works. In extreme cases, this may require project reorganization and the incurrence of costs to restore operational continuity."
                }
            }
        }
    },
    energy_resources: {
        E: {
            Business: {
                green: {
                    pl: "Koszt paliwa, efektywność instalacji oraz poziom emisji pozostają pod kontrolą, a produkcja energii lub wydobycie surowca odbywa się zgodnie z założeniami finansowymi. Rentowność projektów nie jest zagrożona przy obecnych warunkach rynkowych i regulacyjnych.",
                    en: "Fuel costs, plant efficiency, and emission levels remain under control, and energy generation or resource extraction is carried out in line with financial assumptions. Project profitability is not threatened under current market and regulatory conditions."
                },
                yellow: {
                    pl: "Wzrost kosztu paliwa, surowca lub opłat za emisję może ograniczyć marżę na sprzedaży energii lub wydobycia. Przy częściowej regulacji cen sprzedaży możliwości przeniesienia kosztów na odbiorców są ograniczone, co bezpośrednio obniża marżę operacyjną.",
                    en: "An increase in the cost of fuel, raw materials, or emission charges may reduce the margin on energy sales or extraction activities. Where sales prices are partially regulated, the ability to pass costs on to customers is limited, which directly reduces the operating margin."
                },
                orange: {
                    pl: "Znaczący wzrost kosztów operacyjnych instalacji lub pogorszenie efektywności wydobycia może trwale obniżyć rentowność aktywów. W modelu kapitałochłonnym ogranicza to możliwość finansowania modernizacji instalacji i nowych inwestycji.",
                    en: "A significant increase in the operating costs of installations or a decline in extraction efficiency may permanently reduce asset profitability. In a capital-intensive model, this limits the ability to finance installation upgrades and new investments."
                },
                critical: {
                    pl: "Gwałtowny wzrost kosztów paliwa, surowca lub opłat regulacyjnych przy jednoczesnym ograniczeniu cen sprzedaży może doprowadzić do utraty rentowności instalacji. W skrajnym przypadku oznacza to wstrzymanie części działalności, utratę przychodów oraz istotne pogorszenie wyniku finansowego Twojej firmy.",
                    en: "A sharp increase in fuel, raw material, or regulatory costs combined with restrictions on sales prices may lead to the loss of installation profitability. In extreme cases, this may result in the suspension of part of the operations, loss of revenue, and a significant deterioration in your company's financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Instalacje pracują stabilnie, a poziom emisji i zużycia paliwa mieści się w obowiązujących normach. Nie występują zdarzenia mogące podważyć wiarygodność firmy jako odpowiedzialnego operatora.",
                    en: "Production assets operate stably, and emission levels and fuel consumption remain within regulatory limits. No incidents occur that could undermine the company’s credibility as a responsible operator."
                },
                yellow: {
                    pl: "Pojedyncze przekroczenia parametrów emisji lub krótkotrwałe awarie instalacji mogą budzić zainteresowanie regulatora i społeczności lokalnej. Powtarzalność takich zdarzeń osłabia postrzeganie firmy jako podmiotu bezpiecznego technologicznie i utrudnia uzyskiwanie zgód administracyjnych w przyszłości.",
                    en: "Isolated emission exceedances or short-term plant failures may attract attention from regulators and local communities. Repeated incidents weaken the perception of the company as technologically reliable and may complicate future administrative approvals."
                },
                orange: {
                    pl: "Poważniejsze awarie instalacji lub istotne przekroczenia limitów emisji mogą wywołać negatywne reakcje regulatora oraz presję społeczną. Skutkiem jest osłabienie pozycji firmy jako stabilnego operatora w sektorze energetycznym lub wydobywczym.",
                    en: "Major plant failures or significant emission limit exceedances may trigger negative regulatory reactions and public pressure. This weakens the company's standing as a stable operator in the energy or extraction sector."
                },
                critical: {
                    pl: "Poważna awaria technologiczna, wypadek przemysłowy lub długotrwałe naruszenie norm środowiskowych mogą trwale podważyć zaufanie regulatora i lokalnego otoczenia. W skrajnym przypadku oznacza to podważenie wiarygodności firmy jako operatora instalacji oraz ograniczenie możliwości prowadzenia działalności, w tym ryzyko cofnięcia decyzji administracyjnych lub koncesji.",
                    en: "A major technological failure, industrial accident, or prolonged environmental non-compliance may permanently damage trust among regulators and local stakeholders. In extreme cases, this may undermine the company’s credibility as a plant operator and restrict operations, including the risk of withdrawal of administrative decisions or licenses."
                }
            },
            Operational: {
                green: {
                    pl: "Instalacje wytwórcze lub wydobywcze pracują stabilnie, a parametry technologiczne pozostają w dopuszczalnych zakresach. Nie występują zakłócenia wpływające na ciągłość produkcji energii lub surowca.",
                    en: "Generation or extraction assets operate stably, and technological parameters remain within acceptable ranges. No disruptions affect continuity of energy production or resource extraction."
                },
                yellow: {
                    pl: "Krótkotrwałe awarie instalacji lub odchylenia parametrów pracy mogą powodować ograniczenie mocy wytwórczej. Zdarzenia te nie zatrzymują działalności, lecz wymagają interwencji technicznej i korekty planów produkcyjnych.",
                    en: "Short-term equipment failures or deviations in operating parameters may reduce production capacity. These events do not stop operations but require technical intervention and adjustment of production plans."
                },
                orange: {
                    pl: "Poważniejsze awarie bloków energetycznych lub infrastruktury wydobywczej mogą doprowadzić do istotnego ograniczenia produkcji. Skutkiem jest destabilizacja planów dostaw oraz ryzyko niedotrzymania umów sprzedaży energii lub dostaw surowca.",
                    en: "More serious failures of power generation units or extraction infrastructure may lead to a significant reduction in production. The consequences include the destabilization of supply plans and the risk of failing to meet energy sales contracts or raw material delivery obligations."
                },
                critical: {
                    pl: "Długotrwała awaria kluczowej instalacji, uszkodzenie infrastruktury przesyłowej lub zatrzymanie wydobycia mogą całkowicie przerwać działalność operacyjną. W skrajnym przypadku oznacza to paraliż produkcji do czasu usunięcia awarii, brak przychodów przy utrzymaniu kosztów stałych instalacji oraz presję na płynność finansową firmy.",
                    en: "A prolonged failure of a key installation, damage to transmission infrastructure, or a suspension of extraction activities may completely disrupt operational activity. In extreme cases, this means a production standstill until the failure is remedied, no revenue while fixed installation costs remain in place, and increased pressure on the company’s financial liquidity."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Dostępność wykwalifikowanych operatorów instalacji, służb utrzymania ruchu oraz specjalistów z uprawnieniami energetycznymi pozostaje stabilna. Rotacja kadry i incydenty BHP nie wpływają istotnie na ciągłość produkcji ani na rentowność prowadzonej działalności.",
                    en: "Availability of qualified plant operators, maintenance crews and licensed technical staff remains stable. Staff turnover and isolated safety incidents do not materially affect production continuity or operating profitability."
                },
                yellow: {
                    pl: "Rosnąca rotacja operatorów lub trudności w pozyskaniu pracowników z wymaganymi uprawnieniami mogą zwiększyć koszty wynagrodzeń i szkoleń. Ograniczona dostępność kadry podnosi presję kosztową i bezpośrednio obniża marżę operacyjną instalacji.",
                    en: "Increasing turnover of plant operators or difficulties in recruiting certified technical staff may raise payroll and training costs. Limited workforce availability creates cost pressure and directly reduces operating margins of the installation."
                },
                orange: {
                    pl: "Niedobór kluczowych specjalistów, utrata uprawnień lub poważne naruszenia zasad BHP mogą ograniczyć zdolność do bezpiecznej eksploatacji instalacji. Skutkiem jest konieczność ograniczenia mocy produkcyjnych, wzrost kosztów operacyjnych oraz realne pogorszenie wyniku finansowego Twojej firmy.",
                    en: "A shortage of key specialists, loss of required certifications, or serious violations of health and safety regulations may limit the ability to operate installations safely. The consequences include the need to reduce production capacity, an increase in operating costs, and a tangible deterioration in your company’s financial performance."
                },
                critical: {
                    pl: "Utrata kluczowej kadry technicznej, cofnięcie uprawnień personelu lub ciężki wypadek przy pracy mogą doprowadzić do wstrzymania części działalności operacyjnej. W skrajnym przypadku oznacza to spadek produkcji, utratę przychodów przy utrzymaniu kosztów stałych oraz istotne zagrożenie dla płynności finansowej firmy.",
                    en: "Loss of key technical staff, withdrawal of mandatory certifications or a severe workplace accident may result in partial suspension of operations. In extreme cases, this leads to reduced output, loss of revenue while fixed costs remain, and significant pressure on the company’s liquidity."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół posiada wymagane uprawnienia, a standardy BHP są konsekwentnie przestrzegane na terenie instalacji. Nie występują zdarzenia podważające wizerunek firmy jako odpowiedzialnego operatora instalacji.",
                    en: "The team holds the required certifications, and health and safety standards are consistently observed at the installation site. There are no incidents that would undermine the company's reputation as a responsible operator of the installation."
                },
                yellow: {
                    pl: "Pojedyncze naruszenia procedur BHP lub zwiększona rotacja personelu mogą budzić zastrzeżenia co do stabilności operacyjnej zespołu. Sytuacje te osłabiają postrzeganie firmy jako podmiotu bezpiecznego technologicznie i utrudniają budowanie zaufania w relacjach z partnerami oraz organami administracji.",
                    en: "Isolated breaches of safety procedures or increased staff turnover may raise concerns about operational stability. Such situations weaken the perception of the company as a technologically safe operator and make it harder to maintain trust with partners and public authorities."
                },
                orange: {
                    pl: "Poważniejsze incydenty BHP, brak kluczowych uprawnień personelu lub problemy z utrzymaniem wyspecjalizowanej kadry mogą podważyć wiarygodność firmy jako operatora instalacji. Skutkiem jest utrata zaufania regulatora, negatywna ocena w procesach administracyjnych oraz osłabienie pozycji w rozmowach z odbiorcami energii lub surowców.",
                    en: "Serious safety incidents, missing mandatory certifications or difficulties in retaining qualified specialists may undermine the company’s credibility as a facility operator. This can lead to reduced trust from regulators, negative administrative assessments and a weaker position in negotiations with energy or commodity customers."
                },
                critical: {
                    pl: "Ciężki wypadek przy pracy, systemowe naruszenia zasad bezpieczeństwa lub utrata kluczowych uprawnień personelu mogą trwale podważyć wiarygodność firmy jako operatora infrastruktury. W skrajnym przypadku prowadzi to do zaostrzonego nadzoru, ograniczenia zakresu działalności oraz ryzyka cofnięcia decyzji administracyjnych lub koncesji.",
                    en: "A severe workplace accident, systemic safety breaches or loss of essential staff certifications may permanently damage the company’s credibility as an infrastructure operator. In extreme cases, this may result in intensified regulatory supervision, restrictions on operations and the risk of revocation of administrative decisions or licenses."
                }
            },
            Operational: {
                green: {
                    pl: "Obsada zmianowa operatorów i służb utrzymania ruchu pozostaje kompletna, a wymagane uprawnienia personelu są aktualne. Nie występują zakłócenia w pracy instalacji wynikające z braków kadrowych ani naruszeń zasad BHP.",
                    en: "Shift staffing of operators and maintenance teams remains complete, and required certifications are up to date. No operational disruptions occur due to workforce shortages or safety breaches."
                },
                yellow: {
                    pl: "Pojedyncze braki kadrowe lub absencje wśród operatorów mogą utrudniać utrzymanie pełnej obsady zmianowej. Skutkiem są okresowe przeciążenia zespołu oraz zwiększone ryzyko błędów operacyjnych wpływających na stabilność pracy instalacji.",
                    en: "Isolated staff shortages or operator absences may make it difficult to maintain full shift coverage. This results in temporary overload of personnel and an increased risk of operational errors affecting plant stability."
                },
                orange: {
                    pl: "Niedobór wykwalifikowanych operatorów lub utrata wymaganych uprawnień może ograniczyć zdolność do prowadzenia instalacji z pełną mocą. Może to wymusić redukcję produkcji, przesunięcie planowanych prac serwisowych oraz zwiększyć ryzyko nieplanowanych przestojów.",
                    en: "A shortage of qualified operators or loss of mandatory certifications may restrict the ability to run the facility at full capacity. This may force output reductions, postponement of planned maintenance and increase the risk of unplanned downtime."
                },
                critical: {
                    pl: "Utrata kluczowej obsady zmianowej, ciężki wypadek przy pracy lub systemowe naruszenia zasad bezpieczeństwa mogą doprowadzić do wstrzymania pracy instalacji. W skrajnym przypadku oznacza to całkowite zatrzymanie produkcji do czasu przywrócenia pełnej obsady i spełnienia wymogów bezpieczeństwa. Oznacza to brak przychodów przy utrzymaniu kosztów stałych instalacji oraz silną presję na płynność finansową Twojej firmy.",
                    en: "The loss of key shift personnel, a serious workplace accident, or systemic safety violations may lead to the suspension of installation operations. In extreme cases, this means a complete halt of production until full staffing levels are restored and safety requirements are met. This results in no revenue while fixed installation costs remain in place, creating significant pressure on your company’s financial liquidity."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Działalność prowadzona jest zgodnie z warunkami koncesji oraz decyzji administracyjnych, a system kontroli wewnętrznej działa skutecznie. Nie występują naruszenia, które mogłyby wpływać na możliwość sprzedaży energii lub surowców ani na stabilność przychodów wynikających z posiadanych koncesji.",
                    en: "Operations are conducted in accordance with the terms of the licenses and administrative decisions, and the internal control system functions effectively. There are no violations that could affect the ability to sell energy or raw materials, nor the stability of revenues arising from the licenses held."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia w raportowaniu do regulatora lub niepełna dokumentacja środowiskowa mogą skutkować dodatkowymi kontrolami. Może to zwiększyć koszty administracyjne oraz ograniczyć elastyczność w prowadzeniu działalności, wpływając na marżę operacyjną.",
                    en: "Isolated deficiencies in regulatory reporting or incomplete environmental documentation may result in additional inspections. This can increase administrative costs and limit operational flexibility, directly affecting operating margins."
                },
                orange: {
                    pl: "Istotne naruszenia warunków koncesji, decyzji środowiskowych lub obowiązków sprawozdawczych mogą skutkować sankcjami finansowymi i ograniczeniem zakresu działalności. Oznacza to ryzyko zmniejszenia wolumenu sprzedaży energii lub surowca oraz pogorszenie wyniku finansowego Twojej firmy.",
                    en: "Significant breaches of license conditions, environmental decisions or reporting obligations may lead to financial penalties and restrictions on operations. This creates a risk of reduced sales volumes and deterioration of the company’s financial performance."
                },
                critical: {
                    pl: "Poważne naruszenie warunków koncesji, cofnięcie decyzji administracyjnej lub negatywny wynik kontroli regulatora mogą doprowadzić do zawieszenia albo utraty prawa do prowadzenia działalności. W skrajnym przypadku oznacza to utratę części należnych przychodów, konieczność wstrzymania sprzedaży energii lub surowca oraz istotne zagrożenie dla stabilności finansowej Twojej firmy.",
                    en: "Serious breach of license conditions, withdrawal of an administrative decision or a negative outcome of a regulatory inspection may lead to suspension or loss of the right to operate. In extreme cases, this results in loss of entitled revenues, interruption of energy or commodity sales and a significant threat to the company's financial stability."
                }
            },
            Reputation: {
                green: {
                    pl: "Działalność prowadzona jest zgodnie z warunkami koncesji oraz decyzjami administracyjnymi, a raportowanie do regulatora jest terminowe i kompletne. Nie występują zdarzenia podważające wiarygodność firmy w relacjach z organami nadzoru.",
                    en: "Operations comply with license conditions and administrative decisions, and regulatory reporting is timely and complete. No events occur that would undermine the company's credibility in relations with supervisory authorities."
                },
                yellow: {
                    pl: "Pojedyncze nieścisłości w sprawozdawczości lub opóźnienia w przekazywaniu danych do regulatora mogą budzić zastrzeżenia podczas kontroli. Osłabia to postrzeganie firmy jako podmiotu rzetelnie wywiązującego się z obowiązków koncesyjnych.",
                    en: "Isolated inconsistencies in reporting or delays in submitting data to the regulator may raise concerns during inspections. This weakens the perception of the company as a reliable license holder fulfilling its regulatory obligations."
                },
                orange: {
                    pl: "Istotne uchybienia w realizacji warunków koncesji lub decyzji środowiskowych mogą skutkować negatywną oceną ze strony organów nadzoru. Może to podważyć wiarygodność firmy jako operatora instalacji oraz opóźnić modernizację instalacji i realizację nowych inwestycji.",
                    en: "Material breaches in the fulfillment of license conditions or environmental decisions may result in a negative assessment by supervisory authorities. This may undermine the company’s credibility as an installation operator and delay installation upgrades as well as the implementation of new investments."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów, decyzji administracyjnych lub warunków koncesji mogą doprowadzić do utraty zaufania regulatora i zaostrzonego nadzoru. W skrajnym przypadku oznacza to trwałe podważenie wiarygodności firmy, ryzyko cofnięcia koncesji oraz wykluczenie z realizacji nowych projektów energetycznych.",
                    en: "Serious violations of regulations, administrative decisions or license conditions may lead to loss of trust from the regulator and intensified supervision. In extreme cases, this may permanently damage the company’s credibility, create a risk of license revocation and exclude the company from new energy projects."
                }
            },
            Operational: {
                green: {
                    pl: "Wszystkie wymagane decyzje administracyjne, pozwolenia oraz warunki koncesji są aktualne i spełniane. Nie występują ograniczenia formalne wpływające na bieżące prowadzenie instalacji ani realizację planowanych prac.",
                    en: "All required administrative decisions, permits and license conditions are valid and fulfilled. No formal restrictions affect ongoing plant operations or planned activities."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub opóźnienia w aktualizacji dokumentacji mogą skutkować dodatkowymi kontrolami regulatora. Może to spowolnić proces zatwierdzania zmian technicznych lub planowanych modernizacji instalacji.",
                    en: "Isolated formal deficiencies or delays in updating documentation may trigger additional regulatory inspections. This may slow down approval of technical changes or planned facility upgrades."
                },
                orange: {
                    pl: "Istotne braki w spełnianiu warunków koncesji lub decyzji środowiskowych mogą doprowadzić do czasowego ograniczenia zakresu działalności. Skutkiem jest wstrzymanie części prac, opóźnienie inwestycji oraz zakłócenie harmonogramu eksploatacji instalacji.",
                    en: "Significant non-compliance with license conditions or environmental decisions may lead to temporary restrictions on operations. This may result in suspension of certain activities, delays in investments and disruption of the facility’s operational schedule."
                },
                critical: {
                    pl: "Poważne naruszenia decyzji administracyjnych lub warunków koncesji mogą skutkować zawieszeniem działalności przez organ nadzoru. W skrajnym przypadku oznacza to wstrzymanie eksploatacji instalacji do czasu usunięcia nieprawidłowości i przywrócenia formalnej możliwości prowadzenia działalności. W praktyce oznacza to brak przychodów przy utrzymaniu kosztów stałych instalacji oraz silną presję na płynność finansową Twojej firmy.",
                    en: "Serious violations of administrative decisions or license conditions may result in the suspension of operations by the supervisory authority. In extreme cases, this means the suspension of installation operations until the irregularities are remedied and the formal authorization to conduct activities is restored. In practice, this results in no revenue while fixed installation costs remain in place, creating significant pressure on your company’s financial liquidity."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Dostawy paliwa, surowców oraz usług serwisowych realizowane są zgodnie z umowami długoterminowymi, a warunki handlowe pozostają stabilne. Nie występują czynniki zewnętrzne, które mogłyby istotnie wpłynąć na koszt wytwarzania energii ani na rentowność działalności.",
                    en: "Fuel, raw material and maintenance services are delivered in line with long-term contracts, and commercial terms remain stable. No external factors materially affect production costs or overall profitability."
                },
                yellow: {
                    pl: "Wzrost cen paliwa, surowca lub usług serwisowych może zwiększyć koszt eksploatacji instalacji. Przy ograniczonej możliwości przeniesienia tych kosztów na odbiorców oznacza to bezpośrednie obniżenie marży operacyjnej.",
                    en: "Rising prices of fuel, raw materials or maintenance services may increase operating costs of the facility. If cost pass-through to customers is limited, this directly reduces operating margins."
                },
                orange: {
                    pl: "Istotne zakłócenia w dostawach paliwa lub zerwanie umów z kluczowymi dostawcami mogą wymusić zakup surowca po wyższych cenach rynkowych. Skutkiem jest trwałe podniesienie kosztu wytwarzania energii oraz trwałe obniżenie marży operacyjnej instalacji.",
                    en: "Significant disruptions in fuel supplies or the termination of contracts with key suppliers may force the purchase of raw materials at higher market prices. The result is a permanent increase in the cost of energy generation and a lasting reduction in the installation’s operating margin."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa lub surowca, brak alternatywnych źródeł zaopatrzenia albo gwałtowny wzrost cen może doprowadzić do nieopłacalności dalszej produkcji. W skrajnym przypadku oznacza to konieczność ograniczenia sprzedaży energii lub surowca, spadek przychodów przy utrzymaniu kosztów stałych instalacji oraz istotne zagrożenie dla płynności finansowej Twojej firmy.",
                    en: "Loss of a key fuel or raw material supplier, lack of alternative sourcing or a sharp price surge may render continued production economically unviable. In extreme cases, this results in reduced sales volumes, loss of revenue while fixed plant costs remain, and significant pressure on the company’s liquidity."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami paliwa, surowców oraz firmami serwisowymi przebiega stabilnie i zgodnie z zawartymi umowami. Nie występują spory kontraktowe, reklamacje odbiorców ani zakłócenia dostaw podważające wiarygodność firmy jako podmiotu skutecznie zarządzającego łańcuchem zaopatrzenia.",
                    en: "Cooperation with fuel suppliers, raw material providers, and service companies proceeds in a stable manner and in accordance with the concluded agreements. There are no contractual disputes, customer complaints, or supply disruptions that would undermine the company’s credibility as an entity effectively managing its supply chain."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw paliwa lub problemy z realizacją usług serwisowych mogą budzić zastrzeżenia co do stabilności łańcucha zaopatrzenia. Osłabia to postrzeganie firmy jako operatora zapewniającego ciągłość i przewidywalność dostaw energii lub surowca.",
                    en: "Isolated fuel delivery delays or issues with maintenance service providers may raise concerns about supply chain stability. This weakens the perception of the company as an operator ensuring continuity and predictability of energy or commodity supply."
                },
                orange: {
                    pl: "Poważniejsze zakłócenia w relacjach z kluczowymi dostawcami paliwa lub częste zmiany partnerów serwisowych mogą podważyć wiarygodność firmy jako stabilnego producenta energii. Może to skutkować negatywną oceną ze strony odbiorców oraz utrudnić budowanie długoterminowych kontraktów sprzedażowych.",
                    en: "Significant disruptions in relationships with key fuel suppliers or frequent changes of service partners may undermine the company’s credibility as a stable energy producer. This may lead to negative assessments by customers and make it more difficult to secure long-term sales contracts."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa, publiczny spór z partnerem strategicznym lub brak kontroli nad łańcuchem zaopatrzenia mogą trwale podważyć wiarygodność firmy jako operatora instalacji. W skrajnym przypadku oznacza to utratę zaufania odbiorców, wykluczenie z negocjacji nowych umów oraz ograniczenie możliwości dalszego rozwoju działalności.",
                    en: "Loss of a key fuel supplier, a public dispute with a strategic partner or lack of control over the supply chain may permanently damage the company’s credibility as a facility operator. In extreme cases, this results in loss of customer trust, exclusion from new contract negotiations and limited opportunities for further business development."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy paliwa, surowców oraz usług serwisowych przebiegają zgodnie z harmonogramem, a współpraca z partnerami zewnętrznymi jest stabilna. Instalacja pracuje bez redukcji mocy, bez konieczności zmiany grafików pracy oraz bez uruchamiania rezerwowych źródeł zasilania.",
                    en: "Fuel, raw material and maintenance deliveries are carried out according to schedule, and cooperation with external partners remains stable. The installation operates without capacity reduction, schedule adjustments or activation of backup sources."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach paliwa lub ograniczona dostępność usług serwisowych mogą czasowo zaburzyć harmonogram pracy instalacji. Wymaga to reorganizacji produkcji i zwiększonego nadzoru operacyjnego, aby uniknąć krótkotrwałych przestojów.",
                    en: "Delays in fuel deliveries or limited availability of maintenance services may temporarily disrupt the plant's operating schedule. This requires production reorganization and increased operational oversight to avoid short-term downtime."
                },
                orange: {
                    pl: "Poważne zakłócenia w dostawach surowca lub niewywiązywanie się kluczowego partnera serwisowego z umowy mogą doprowadzić do wymuszonego ograniczenia mocy produkcyjnych. Skutkiem jest niestabilność pracy instalacji oraz ryzyko niedotrzymania umów sprzedaży energii lub dostaw surowca.",
                    en: "Significant disruptions in raw material deliveries or failure of a key maintenance partner to meet contractual obligations may force a reduction in production capacity. This results in unstable plant operations and the risk of failing to meet energy sales or raw material supply agreements."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa lub długotrwałe przerwanie łańcucha dostaw może doprowadzić do całkowitego zatrzymania pracy instalacji. W praktyce oznacza to wstrzymanie produkcji, utratę zdolności wytwórczej oraz konieczność uruchomienia procedur awaryjnych do czasu przywrócenia dostaw.",
                    en: "The loss of a key fuel supplier or a prolonged disruption of the supply chain may lead to a complete shutdown of plant operations. In practice, this means halting production, losing generation capacity and activating emergency procedures until deliveries are restored."
                }
            }
        }
    },
    industrial_production: {
        E: {
            Business: {
                green: {
                    pl: "Koszty energii, surowców oraz wydajność linii produkcyjnych pozostają pod kontrolą, a odpad technologiczny utrzymuje się na zakładanym poziomie. Produkcja realizowana jest bez przekroczeń kosztów jednostkowych, co pozwala utrzymać planowaną marżę na wyrobach.",
                    en: "Energy and raw material costs as well as production line efficiency remain under control, and technological waste stays within planned limits. Production is carried out without exceeding unit costs, allowing the planned product margin to be maintained."
                },
                yellow: {
                    pl: "Wzrost cen energii lub pogorszenie jakości surowca może zwiększyć poziom odpadu oraz obniżyć wydajność linii. Skutkuje to podniesieniem kosztu jednostkowego produkcji i stopniowym ograniczeniem marży na realizowanych zamówieniach.",
                    en: "An increase in energy prices or a decline in raw material quality may raise waste levels and reduce line efficiency. This results in higher unit production costs and a gradual reduction of margins on executed orders."
                },
                orange: {
                    pl: "Znaczące wahania cen energii, częste awarie linii lub surowiec poza specyfikacją mogą doprowadzić do trwałego wzrostu kosztów jednostkowych. W efekcie rentowność serii produkcyjnych spada, a realizacja kontraktów zaczyna generować ograniczoną lub zerową marżę.",
                    en: "Significant energy price volatility, frequent line failures or off-spec raw materials may lead to a sustained increase in unit costs. As a result, the profitability of production batches declines and contract execution begins to generate limited or zero margin."
                },
                critical: {
                    pl: "Brak kontroli nad kosztami energii, wysokim poziomem odpadu oraz powtarzające się przestoje technologiczne mogą doprowadzić do utraty rentowności kluczowych linii produkcyjnych. W skrajnym przypadku realizacja zamówień generuje stratę, pochłania kapitał obrotowy i wymusza finansowanie bieżącej działalności z dodatkowych źródeł.",
                    en: "Lack of control over energy costs, a high level of waste, and recurring technological downtime may lead to the loss of profitability of key production lines. In extreme cases, order fulfillment generates losses, consumes working capital, and forces the company to finance its ongoing operations from additional sources."
                }
            },
            Reputation: {
                green: {
                    pl: "Parametry jakościowe wyrobów, poziom odpadu oraz stabilność procesu produkcyjnego utrzymują się w założonych normach. Nie występują reklamacje ani opóźnienia dostaw, które mogłyby podważyć wiarygodność firmy jako rzetelnego producenta.",
                    en: "Product quality parameters, waste levels and process stability remain within planned standards. No complaints or delivery delays occur that could undermine the company's credibility as a reliable manufacturer."
                },
                yellow: {
                    pl: "Pogorszenie jakości surowców lub spadek stabilności linii może prowadzić do zwiększonej liczby reklamacji i korekt produkcyjnych. Powtarzające się odchylenia parametrów technicznych osłabiają postrzeganie firmy jako producenta gwarantującego powtarzalną jakość.",
                    en: "Deterioration in raw material quality or reduced line stability may result in an increased number of complaints and production adjustments. Repeated deviations from technical parameters weaken the perception of the company as a manufacturer ensuring consistent quality."
                },
                orange: {
                    pl: "Częste wady produkcyjne, wysoki poziom odpadu lub niedotrzymywanie terminów realizacji partii mogą podważyć zaufanie kluczowych odbiorców. W efekcie firma traci referencje branżowe i może zostać wykluczona z kolejnych procesów kwalifikacyjnych u stałych klientów.",
                    en: "Frequent production defects, high waste levels or failure to meet batch delivery deadlines may undermine the trust of key customers. As a result, the company loses industry references and may be excluded from future qualification processes with regular clients."
                },
                critical: {
                    pl: "Trwałe problemy z jakością wyrobów, powtarzające się niezgodności partii oraz brak stabilności procesu mogą doprowadzić do utraty zaufania strategicznych odbiorców. W skrajnym przypadku firma traci status zatwierdzonego dostawcy, podlega obowiązkowemu audytowi naprawczemu lub traci certyfikację jakościową, co skutkuje rozwiązaniem umów ramowych i wykluczeniem z długoterminowej współpracy.",
                    en: "Persistent product quality issues, repeated batch non-conformities and lack of process stability may lead to the loss of trust from strategic customers. In extreme cases, the company may lose its approved supplier status, be subject to mandatory corrective audits or lose quality certification, resulting in termination of framework agreements and exclusion from long-term cooperation."
                }
            },
            Operational: {
                green: {
                    pl: "Linie produkcyjne pracują zgodnie z planem, a zużycie energii i poziom odpadu mieszczą się w normach technologicznych. Nie występują przestoje ani konieczność ograniczania mocy produkcyjnych.",
                    en: "Production lines operate according to plan, and energy consumption and waste levels remain within technological standards. No downtime or capacity reductions occur."
                },
                yellow: {
                    pl: "Pojedyncze awarie linii lub niestabilność parametrów technologicznych mogą powodować krótkotrwałe przestoje. Wymaga to korekt ustawień maszyn i zwiększonego nadzoru produkcji, aby utrzymać ciągłość realizacji zleceń.",
                    en: "Isolated line failures or unstable technological parameters may cause short-term downtime. This requires machine adjustments and increased production supervision to maintain order continuity."
                },
                orange: {
                    pl: "Powtarzające się awarie linii, surowiec poza specyfikacją lub wysoki poziom odpadu mogą doprowadzić do ograniczenia wydajności produkcji. Skutkiem jest niestabilna realizacja harmonogramu oraz ryzyko opóźnień w dostawach partii produkcyjnych.",
                    en: "Recurring line failures, off-spec raw materials or high waste levels may lead to reduced production efficiency. This results in unstable schedule execution and the risk of delays in batch deliveries."
                },
                critical: {
                    pl: "Brak stabilności technologicznej, powtarzające się przestoje oraz poważne awarie kluczowych linii mogą doprowadzić do utraty zdolności produkcyjnej zakładu. W praktyce oznacza to całkowite zatrzymanie wytwarzania do czasu przywrócenia pełnej sprawności parku maszynowego.",
                    en: "Lack of technological stability, recurring downtime, and serious failures of key production lines may lead to the loss of the plant’s production capacity. In practice, this means a complete halt of manufacturing until full operational efficiency of the machinery park is restored."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Stabilna obsada wykwalifikowanych pracowników oraz niska rotacja personelu pozwalają utrzymać planowaną wydajność linii i kontrolę kosztów robocizny. Koszt jednostkowy produkcji pozostaje zgodny z założeniami, co pozwala zachować zakładaną marżę na realizowanych zamówieniach.",
                    en: "A stable workforce and low employee turnover allow production lines to maintain planned efficiency and labor cost control. Unit production costs remain in line with assumptions, enabling the planned margin on executed orders to be maintained."
                },
                yellow: {
                    pl: "Wzrost absencji lub trudności w pozyskaniu wykwalifikowanych operatorów mogą obniżyć wydajność brygad i zwiększyć koszt roboczogodziny. W efekcie rośnie koszt jednostkowy produkcji, co stopniowo ogranicza marżę na kontraktach.",
                    en: "Increased absenteeism or difficulties in recruiting qualified operators may reduce crew efficiency and raise labor costs per hour. As a result, unit production costs increase, gradually reducing margins on contracts."
                },
                orange: {
                    pl: "Wysoka rotacja pracowników, niedobór operatorów lub poważne naruszenia zasad BHP mogą doprowadzić do istotnego wzrostu kosztów osobowych i spadku wydajności linii. Rentowność serii produkcyjnych ulega pogorszeniu, a realizacja zamówień zaczyna generować minimalną lub zerową marżę.",
                    en: "High employee turnover, a shortage of operators or serious safety breaches may lead to a significant increase in labor costs and reduced line efficiency. The profitability of production batches deteriorates, and order execution begins to generate minimal or zero margin."
                },
                critical: {
                    pl: "Utrata kluczowych brygadzistów lub brak wykwalifikowanej kadry do obsługi linii może doprowadzić do gwałtownego spadku wydajności i wzrostu kosztu roboczogodziny. W skrajnym przypadku firma traci konkurencyjność kosztową, zmuszona jest do podniesienia cen wyrobów lub ograniczenia zakresu realizowanych zamówień.",
                    en: "Loss of key supervisors or a shortage of qualified personnel to operate production lines may result in a sharp decline in productivity and increased labor costs. In extreme cases, the company loses cost competitiveness, is forced to raise product prices or reduce the scope of executed orders."
                }
            },
            Reputation: {
                green: {
                    pl: "Stabilna kadra, przestrzeganie zasad BHP oraz niska rotacja pracowników wzmacniają wizerunek firmy jako rzetelnego pracodawcy i przewidywalnego partnera produkcyjnego. Nie występują sytuacje podważające zaufanie odbiorców do organizacji pracy zakładu.",
                    en: "A stable workforce, compliance with safety standards and low employee turnover strengthen the company’s image as a reliable employer and predictable production partner. No situations occur that could undermine customers’ trust in the organization of the plant."
                },
                yellow: {
                    pl: "Rosnąca rotacja pracowników lub pojedyncze naruszenia zasad BHP mogą budzić zastrzeżenia co do stabilności organizacyjnej zakładu. Powtarzające się problemy osłabiają postrzeganie firmy jako producenta zapewniającego ciągłość i bezpieczeństwo procesu.",
                    en: "Increasing employee turnover or isolated safety breaches may raise concerns about the plant’s organizational stability. Repeated issues weaken the perception of the company as a manufacturer ensuring process continuity and safety."
                },
                orange: {
                    pl: "Poważne naruszenia zasad BHP, konflikty pracownicze lub wysoka rotacja kluczowych operatorów mogą podważyć wiarygodność firmy jako stabilnego partnera produkcyjnego. W efekcie odbiorcy mogą ograniczyć wolumen współpracy lub zażądać dodatkowych audytów organizacyjnych.",
                    en: "Serious safety violations, labor conflicts or high turnover of key operators may undermine the company’s credibility as a stable production partner. As a result, customers may reduce cooperation volumes or require additional organizational audits."
                },
                critical: {
                    pl: "Trwałe problemy kadrowe, poważne wypadki przy pracy lub brak nadzoru nad organizacją produkcji mogą doprowadzić do utraty zaufania strategicznych odbiorców. W skrajnym przypadku firma może zostać objęta obowiązkowym audytem naprawczym, utracić certyfikację bezpieczeństwa pracy lub zostać wykluczona z długoterminowych umów dostawczych.",
                    en: "Persistent workforce issues, serious workplace accidents or lack of production supervision may lead to the loss of trust from strategic customers. In extreme cases, the company may be subject to mandatory corrective audits, lose occupational safety certification or be excluded from long-term supply agreements."
                }
            },
            Operational: {
                green: {
                    pl: "Dostępność wykwalifikowanych pracowników oraz stabilna organizacja zmian pozwalają utrzymać ciągłość pracy zakładu. Nie występują braki kadrowe wymagające nadgodzin ani reorganizacji produkcji, a realizacja zleceń przebiega zgodnie z planem.",
                    en: "Stable workforce availability and well-organized shift planning ensure uninterrupted plant operations. There are no staffing shortages requiring overtime or production reorganization, and order execution remains on schedule."
                },
                yellow: {
                    pl: "Okresowe niedobory pracowników lub zwiększona rotacja mogą powodować konieczność pracy w nadgodzinach i przesunięć między liniami produkcyjnymi. Może to prowadzić do obniżenia wydajności i ryzyka opóźnień w realizacji części zamówień.",
                    en: "Temporary workforce shortages or increased staff turnover may require overtime and reallocating employees between production lines. This can reduce efficiency and create a risk of partial delivery delays."
                },
                orange: {
                    pl: "Znaczące braki kadrowe, spory pracownicze lub naruszenia zasad BHP mogą wymusić ograniczenie pracy wybranych wydziałów. Skutkiem jest spadek zdolności produkcyjnej zakładu oraz realne opóźnienia w realizacji kluczowych zamówień.",
                    en: "Significant staffing shortages, labor disputes, or safety breaches may force partial shutdown of specific departments. This results in reduced production capacity and tangible delays in fulfilling key orders."
                },
                critical: {
                    pl: "Utrata kluczowych zespołów produkcyjnych, poważny wypadek lub długotrwały konflikt pracowniczy mogą doprowadzić do niemożności utrzymania ciągłości produkcji. W praktyce oznacza to zatrzymanie wydziałów z przyczyn kadrowych oraz brak pełnej obsady uniemożliwiający pracę zmianową do czasu przywrócenia bezpiecznych warunków pracy.",
                    en: "Loss of key production teams, a serious workplace accident, or prolonged labor conflict may result in inability to maintain production continuity. In practice, this means shutdown of departments due to staffing shortages and insufficient workforce to sustain shift operations until safe working conditions are restored."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Procesy nadzorcze, dokumentacyjne i kontraktowe są prowadzone prawidłowo, a wymagane certyfikacje oraz audyty nie generują dodatkowych obciążeń finansowych. Nie występują zdarzenia wpływające na stabilność przychodów ani warunki współpracy z kluczowymi odbiorcami.",
                    en: "Supervisory, documentation, and contractual processes are properly managed, and required certifications and audits do not generate additional financial burdens. There are no governance-related events affecting revenue stability or key customer relationships."
                },
                yellow: {
                    pl: "Pojedyncze nieprawidłowości formalne, opóźnienia w dokumentacji lub dodatkowe wymagania audytowe mogą zwiększać koszty administracyjne i obniżać efektywność operacyjną. W dłuższej perspektywie może to ograniczać marżę na wybranych kontraktach.",
                    en: "Isolated compliance issues, documentation delays, or additional audit requirements may increase administrative costs and reduce operational efficiency. Over time, this may limit margins on selected contracts."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w obszarze zgodności, brak aktualnych certyfikacji lub spory kontraktowe mogą prowadzić do wstrzymania części zamówień oraz utraty preferencyjnych warunków współpracy. Skutkiem jest trwałe obniżenie rentowności wybranych linii produkcyjnych oraz ograniczenie zdolności do pozyskiwania nowych kontraktów przemysłowych.",
                    en: "Repeated compliance failures, expired certifications, or contractual disputes may result in partial suspension of orders and loss of preferential commercial terms. This leads to sustained margin pressure on selected production lines and limits the company’s ability to secure new industrial contracts."
                },
                critical: {
                    pl: "Poważne naruszenia zasad zgodności, utrata kluczowych certyfikacji jakościowych lub rozwiązanie istotnych umów ramowych mogą doprowadzić do wstrzymania realizacji strategicznych kontraktów. W skrajnym przypadku oznacza to konieczność renegocjacji warunków handlowych oraz utratę preferencyjnych stawek kontraktowych, co bezpośrednio osłabia pozycję negocjacyjną firmy wobec kluczowych odbiorców.",
                    en: "Serious compliance breaches, loss of key quality certifications, or termination of major framework agreements may lead to suspension of strategic contracts. In extreme cases, this may require renegotiation of commercial terms and loss of preferential contractual rates, directly weakening the company’s bargaining position with key customers."
                }
            },
            Reputation: {
                green: {
                    pl: "Procesy nadzorcze i zgodnościowe są prowadzone w sposób przejrzysty i udokumentowany. Firma utrzymuje aktualne certyfikacje jakościowe, a audyty zewnętrzne nie wykazują istotnych uchybień. Nie występują zdarzenia podważające wiarygodność firmy jako rzetelnego partnera przemysłowego.",
                    en: "Governance and compliance processes are transparent and properly documented. The company maintains valid quality certifications, and external audits do not reveal significant deficiencies. There are no events undermining the company’s credibility as a reliable industrial partner."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub uwagi audytowe mogą budzić zastrzeżenia wśród odbiorców i partnerów biznesowych. Choć nie wpływają bezpośrednio na realizację zamówień, mogą osłabiać postrzeganie firmy jako podmiotu w pełni zgodnego i dobrze zarządzanego.",
                    en: "Isolated compliance issues or audit remarks may raise concerns among customers and business partners. Although they do not directly affect order execution, they may weaken the perception of the company as fully compliant and well-managed."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w obszarze zgodności, opóźnienia w odnawianiu certyfikacji lub spory kontraktowe mogą podważać reputację firmy jako stabilnego dostawcy. Może to skutkować utratą statusu preferowanego partnera, negatywną oceną w procesach kwalifikacyjnych oraz ograniczeniem udziału w nowych projektach przemysłowych.",
                    en: "Repeated compliance failures, delays in certification renewal, or contractual disputes may undermine the company’s reputation as a stable supplier. This may result in loss of preferred supplier status, negative scoring in qualification processes, and reduced participation in new industrial projects."
                },
                critical: {
                    pl: "Poważne naruszenia zasad zgodności, cofnięcie kluczowych certyfikacji jakościowych lub publiczne spory kontraktowe mogą trwale podważyć wiarygodność firmy w oczach rynku. W skrajnym przypadku oznacza to utratę statusu zatwierdzonego dostawcy, obniżenie ratingu w systemach odbiorców oraz objęcie firmy rozszerzonym nadzorem jakościowym.",
                    en: "Serious compliance breaches, withdrawal of key quality certifications, or public contractual disputes may permanently undermine the company’s credibility in the eyes of the market. In extreme cases, this may result in the loss of approved supplier status, a downgrade in customers’ rating systems, and the company being placed under enhanced quality supervision."
                }
            },
            Operational: {
                green: {
                    pl: "Procedury zgodności, dokumentacja techniczna oraz wymagane dopuszczenia są aktualne i kompletne. Audyty oraz kontrole nie powodują zakłóceń w pracy zakładu, a działalność operacyjna może być prowadzona bez ograniczeń formalnych.",
                    en: "Compliance procedures, technical documentation, and required permits are up to date and complete. Audits and inspections do not disrupt plant operations, and activities can be conducted without formal restrictions."
                },
                yellow: {
                    pl: "Pojedyncze braki formalne, opóźnienia w aktualizacji dokumentacji lub zalecenia pokontrolne mogą wymagać dodatkowych działań administracyjnych. Choć nie zatrzymują produkcji, mogą powodować czasowe utrudnienia organizacyjne i zwiększoną liczbę kontroli.",
                    en: "Isolated documentation gaps, delays in updates, or post-audit recommendations may require additional administrative actions. Although they do not stop production, they may cause temporary organizational disruptions and increased inspection frequency."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w obszarze zgodności, brak aktualnych pozwoleń lub niespełnienie wymogów technicznych mogą skutkować ograniczeniem zakresu działalności operacyjnej. Może to oznaczać czasowe wstrzymanie pracy wybranych linii produkcyjnych do momentu usunięcia nieprawidłowości.",
                    en: "Repeated compliance failures, expired permits, or unmet technical requirements may result in restriction of operational scope. This may involve temporary suspension of selected production lines until deficiencies are resolved."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów, cofnięcie kluczowych pozwoleń lub decyzja organu nadzorczego mogą doprowadzić do formalnego wstrzymania działalności zakładu. W praktyce oznacza to obowiązkowe zatrzymanie produkcji do czasu przywrócenia pełnej zgodności regulacyjnej.",
                    en: "Serious regulatory breaches, withdrawal of key permits, or a supervisory authority decision may lead to formal suspension of plant operations. In practice, this means mandatory shutdown of production until full regulatory compliance is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z dostawcami surowców i komponentów przebiega stabilnie, a warunki handlowe są przewidywalne. Koszty zakupowe pozostają pod kontrolą i nie wpływają negatywnie na marżę realizowanych zamówień.",
                    en: "Cooperation with suppliers of raw materials and components remains stable, and commercial terms are predictable. Procurement costs are under control and do not negatively affect order margins."
                },
                yellow: {
                    pl: "Wzrost cen surowców, komponentów lub usług logistycznych może zwiększyć koszt wytworzenia produktów. Ograniczona możliwość przeniesienia tych kosztów na odbiorców prowadzi do stopniowego obniżenia marży na wybranych kontraktach.",
                    en: "An increase in the prices of raw materials, components, or logistics services may raise the cost of manufacturing products. A limited ability to pass these costs on to customers leads to a gradual reduction in margins on selected contracts."
                },
                orange: {
                    pl: "Zależność od wąskiej grupy dostawców lub niekorzystne zmiany warunków zakupowych mogą prowadzić do trwałego wzrostu kosztów produkcji. Skutkiem jest utrata konkurencyjności cenowej oraz konieczność renegocjacji warunków handlowych z kluczowymi odbiorcami.",
                    en: "Dependence on a limited number of suppliers or unfavorable changes in purchasing terms may lead to a sustained increase in production costs. This results in loss of price competitiveness and the need to renegotiate commercial terms with key customers."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy, długotrwałe zakłócenia w łańcuchu dostaw lub gwałtowny wzrost cen strategicznych surowców mogą doprowadzić do istotnego wzrostu kosztów wytworzenia. W skrajnym przypadku oznacza to konieczność ograniczenia zakresu realizowanych zamówień oraz utratę części portfela kontraktów.",
                    en: "Loss of a key supplier, prolonged supply chain disruptions, or sharp increases in prices of strategic raw materials may significantly raise production costs. In extreme cases, this may require reducing the scope of fulfilled orders and result in partial loss of the contract portfolio."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami surowców i komponentów przebiega stabilnie, a firma utrzymuje opinię rzetelnego i przewidywalnego partnera zakupowego. Nie występują spory logistyczne ani reklamacje związane z organizacją łańcucha dostaw, które mogłyby podważyć wiarygodność operacyjną.",
                    en: "Cooperation with raw material and component suppliers remains stable, and the company is perceived as a reliable and predictable procurement partner. There are no logistical disputes or complaints related to supply chain organization that could undermine operational credibility."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw, zmiany warunków współpracy lub napięcia z podwykonawcami mogą budzić zastrzeżenia wśród odbiorców. Choć nie wpływają bezpośrednio na realizację zamówień, mogą osłabiać postrzeganie firmy jako podmiotu skutecznie zarządzającego łańcuchem dostaw.",
                    en: "Isolated delivery delays, changes in cooperation terms, or tensions with subcontractors may raise concerns among customers. Although they do not directly affect order fulfillment, they may weaken the perception of the company as effectively managing its supply chain."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostawcami, brak alternatywnych źródeł zaopatrzenia lub publiczne spory logistyczne mogą podważać wiarygodność firmy jako stabilnego organizatora łańcucha dostaw. Może to skutkować obniżeniem oceny w procesach kwalifikacyjnych oraz utratą statusu preferowanego partnera zakupowego.",
                    en: "Repeated supplier issues, lack of alternative sourcing options, or public logistical disputes may undermine the company’s credibility as a stable supply chain organizer. This may result in lower scores in qualification processes and loss of preferred supplier status."
                },
                critical: {
                    pl: "Utrata kluczowych dostawców, długotrwałe konflikty logistyczne lub brak kontroli nad strategicznymi podwykonawcami mogą trwale podważyć zaufanie rynku do zdolności firmy do zarządzania łańcuchem dostaw. W skrajnym przypadku oznacza to utratę statusu zatwierdzonego dostawcy w systemach odbiorców oraz objęcie firmy rozszerzonym monitoringiem łańcucha dostaw.",
                    en: "Loss of key suppliers, prolonged logistical conflicts, or lack of control over strategic subcontractors may permanently undermine market confidence in the company’s ability to manage its supply chain. In extreme cases, this may result in loss of approved supplier status in customer systems and placement under enhanced supply chain monitoring."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy surowców i komponentów realizowane są zgodnie z harmonogramem, a zapasy bezpieczeństwa pozwalają utrzymać płynność produkcji. Nie występują zakłócenia logistyczne wpływające na realizację planu produkcyjnego.",
                    en: "Deliveries of raw materials and components are carried out according to schedule, and safety stock levels ensure production continuity. There are no logistical disruptions affecting the production plan."
                },
                yellow: {
                    pl: "Okresowe opóźnienia dostaw lub ograniczona dostępność wybranych komponentów mogą wymagać przesunięć w harmonogramie produkcji. Może to prowadzić do czasowego przeplanowania zleceń i zwiększonej pracy działu logistyki.",
                    en: "Temporary delivery delays or limited availability of selected components may require adjustments to the production schedule. This can result in rescheduling orders and increased workload for the logistics team."
                },
                orange: {
                    pl: "Brak terminowych dostaw kluczowych surowców lub zależność od pojedynczego dostawcy mogą prowadzić do wstrzymania pracy wybranych linii produkcyjnych. Skutkiem jest ograniczenie ciągłości realizacji zamówień oraz konieczność reorganizacji planu produkcyjnego.",
                    en: "Failure to receive timely deliveries of critical raw materials or dependence on a single supplier may lead to suspension of selected production lines. This results in reduced continuity of order execution and the need to reorganize the production plan."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy, zerwanie ciągłości dostaw strategicznych komponentów lub długotrwała blokada logistyczna mogą doprowadzić do zatrzymania części wydziałów produkcyjnych. W praktyce oznacza to wstrzymanie realizacji zamówień do czasu przywrócenia stabilności łańcucha dostaw.",
                    en: "Loss of a key supplier, disruption of strategic component deliveries, or prolonged logistical blockage may lead to shutdown of parts of the production departments. In practice, this means suspension of order fulfillment until supply chain stability is restored."
                }
            }
        }
    },
    logistics_transport: {
        E: {
            Business: {
                green: {
                    pl: "Zużycie paliwa, koszty energii oraz efektywność floty pozostają pod kontrolą. Nie występują istotne odchylenia od założeń budżetowych, a koszty środowiskowe nie wpływają negatywnie na rentowność realizowanych zleceń transportowych.",
                    en: "Fuel consumption, energy costs, and fleet efficiency remain under control. There are no significant deviations from budget assumptions, and environmental costs do not negatively affect the profitability of transport contracts."
                },
                yellow: {
                    pl: "Wzrost cen paliwa, energii lub opłat środowiskowych może zwiększać koszt realizacji usług transportowych. Ograniczona możliwość przeniesienia tych kosztów na klientów prowadzi do stopniowego obniżenia marży na wybranych trasach i kontraktach.",
                    en: "Rising fuel prices, energy costs, or environmental charges may increase the cost of providing transport services. Limited ability to pass these costs on to customers gradually reduces margins on selected routes and contracts."
                },
                orange: {
                    pl: "Znaczący wzrost kosztów paliwa lub konieczność dostosowania floty do bardziej rygorystycznych norm emisyjnych może prowadzić do trwałego wzrostu kosztów operacyjnych. Skutkiem jest utrata konkurencyjności cenowej oraz konieczność renegocjacji warunków umów z kluczowymi kontrahentami.",
                    en: "A significant increase in fuel costs or the need to adapt the fleet to stricter emission standards may result in a sustained rise in operating costs. This leads to loss of price competitiveness and the need to renegotiate terms with key clients."
                },
                critical: {
                    pl: "Gwałtowny wzrost cen paliw, rosnące koszty dostosowania floty do wymogów środowiskowych lub utrata efektywności energetycznej mogą doprowadzić do trwałej nieopłacalności realizowanych kontraktów. W skrajnym przypadku oznacza to konieczność wycofania części floty z eksploatacji oraz ograniczenie zakresu świadczonych usług transportowych.",
                    en: "A sharp increase in fuel prices, rising costs of adapting the fleet to environmental requirements, or declining energy efficiency may lead to the sustained unprofitability of transport contracts. In extreme cases, this may require withdrawing part of the fleet from operation and reducing the scope of transport services provided."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje kontrolę nad emisjami i zużyciem paliwa, a flota spełnia obowiązujące normy środowiskowe. Nie występują zdarzenia podważające postrzeganie firmy jako odpowiedzialnego i nowoczesnego operatora transportowego.",
                    en: "The company maintains control over emissions and fuel consumption, and the fleet complies with applicable environmental standards. There are no incidents undermining the company's reputation as a responsible and modern transport operator."
                },
                yellow: {
                    pl: "Pojedyncze przekroczenia norm emisji lub brak transparentności w raportowaniu środowiskowym mogą budzić zastrzeżenia klientów. Osłabia to wizerunek firmy jako partnera spełniającego rosnące oczekiwania w zakresie zrównoważonego transportu.",
                    en: "Isolated emission exceedances or limited transparency in environmental reporting may raise concerns among clients. This weakens the company's image as a partner meeting growing expectations in sustainable transport."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia norm emisji, wysoki ślad węglowy floty lub negatywne publikacje dotyczące wpływu środowiskowego działalności mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu preferowanego przewoźnika u części kluczowych klientów.",
                    en: "Repeated emission exceedances, a high fleet carbon footprint, or negative media coverage regarding environmental impact may significantly undermine the company’s credibility. This may result in losing preferred carrier status with selected key clients."
                },
                critical: {
                    pl: "Poważne naruszenia norm środowiskowych, brak kontroli nad emisjami lub publiczne ujawnienie istotnych nieprawidłowości mogą trwale podważyć zaufanie rynku do firmy jako operatora spełniającego standardy środowiskowe. W skrajnym przypadku oznacza to utratę kluczowych kontraktów oraz wykluczenie z przetargów wymagających spełnienia wysokich standardów środowiskowych.",
                    en: "Serious environmental violations, lack of emission control, or public disclosure of significant irregularities may permanently undermine market trust in the company as an operator meeting environmental standards. In extreme cases, this may result in the loss of key contracts and exclusion from tenders requiring high environmental compliance standards."
                }
            },
            Operational: {
                green: {
                    pl: "Flota spełnia obowiązujące normy emisyjne, a zużycie paliwa pozostaje na poziomie zgodnym z planem operacyjnym. Realizacja zleceń odbywa się bez ograniczeń wynikających z wymogów środowiskowych, w tym bez problemów z dostępem do stref niskoemisyjnych.",
                    en: "The fleet complies with applicable emission standards, and fuel consumption remains in line with the operational plan. Transport orders are executed without environmental constraints, including unrestricted access to low-emission zones."
                },
                yellow: {
                    pl: "Częściowe przekroczenia norm emisji lub ograniczona efektywność paliwowa wybranych pojazdów mogą utrudniać dostęp do niektórych stref transportowych. Może to wymagać modyfikacji tras lub wykorzystania alternatywnej floty.",
                    en: "Partial emission exceedances or reduced fuel efficiency of selected vehicles may limit access to certain transport zones. This may require route adjustments or the use of alternative fleet units."
                },
                orange: {
                    pl: "Brak dostosowania części floty do obowiązujących norm środowiskowych może prowadzić do wyłączenia pojazdów z obsługi wybranych rynków lub stref miejskich. Skutkiem jest konieczność reorganizacji pracy floty oraz ograniczenie dostępności mocy przewozowych.",
                    en: "Failure to adapt part of the fleet to applicable environmental standards may result in vehicles being excluded from certain markets or urban zones. This leads to fleet reorganization and reduced transport capacity availability."
                },
                critical: {
                    pl: "Systemowe niedostosowanie floty do wymogów środowiskowych lub utrata dostępu do kluczowych obszarów transportowych może wyłączyć znaczącą część floty z realizacji zleceń transportowych. W praktyce oznacza to zatrzymanie obsługi wybranych tras oraz wymuszone wyłączenie pojazdów z eksploatacji do czasu przywrócenia stabilności operacyjnej.",
                    en: "Systemic non-compliance of the fleet with environmental requirements or loss of access to key transport areas may remove a significant portion of the fleet from active order execution. In practice, this means suspension of selected routes and forced withdrawal of vehicles from operation until operational stability is restored."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Stabilna dostępność kierowców oraz personelu operacyjnego pozwala utrzymać ciągłość realizacji usług transportowych. Koszty pracy pozostają pod kontrolą i nie wpływają negatywnie na rentowność kontraktów.",
                    en: "Stable availability of drivers and operational staff ensures continuity of transport services. Labor costs remain under control and do not negatively affect contract profitability."
                },
                yellow: {
                    pl: "Wzrost wynagrodzeń kierowców, rosnąca rotacja kadry lub presja płacowa na rynku pracy mogą podnosić koszty realizacji usług. Ograniczona możliwość przeniesienia tych kosztów na klientów prowadzi do stopniowego obniżenia marży na wybranych kontraktach.",
                    en: "Rising driver wages, increased staff turnover, or labor market pressure may raise service delivery costs. Limited ability to pass these costs on to clients gradually reduces margins on selected contracts."
                },
                orange: {
                    pl: "Niedobór wykwalifikowanych kierowców, konieczność korzystania z droższych podwykonawców lub znaczący wzrost kosztów pracy może trwale obniżyć rentowność działalności transportowej. Skutkiem może być utrata konkurencyjności cenowej oraz konieczność renegocjacji stawek z kluczowymi klientami.",
                    en: "A shortage of qualified drivers, reliance on more expensive subcontractors, or a significant increase in labor costs may permanently reduce transport business profitability. This may lead to loss of price competitiveness and the need to renegotiate rates with key clients."
                },
                critical: {
                    pl: "Systemowy brak kierowców, masowe odejścia pracowników lub trwała niestabilność kadrowa mogą doprowadzić do utraty kluczowych kontraktów transportowych. W skrajnym przypadku oznacza to redukcję portfela klientów oraz konieczność ograniczenia skali działalności transportowej.",
                    en: "Systemic driver shortages, mass staff departures, or prolonged workforce instability may lead to the loss of key transport contracts. In extreme cases, this may require reducing the client portfolio and scaling down transport operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje stabilną kadrę kierowców oraz przestrzega standardów bezpieczeństwa i warunków pracy. Nie występują zdarzenia podważające postrzeganie firmy jako rzetelnego i odpowiedzialnego pracodawcy w branży transportowej.",
                    en: "The company maintains a stable driver workforce and complies with safety and labor standards. There are no incidents undermining its reputation as a reliable and responsible employer in the transport sector."
                },
                yellow: {
                    pl: "Pojedyncze skargi pracownicze, podwyższona rotacja kierowców lub incydenty związane z warunkami pracy mogą budzić zastrzeżenia klientów. Osłabia to wizerunek firmy jako rzetelnego przewoźnika.",
                    en: "Isolated employee complaints, increased driver turnover, or incidents related to working conditions may raise concerns among clients. This weakens the company's image as a reliable carrier."
                },
                orange: {
                    pl: "Powtarzające się problemy kadrowe, publiczne spory z pracownikami lub zarzuty dotyczące naruszeń standardów pracy mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu preferowanego przewoźnika u części kluczowych klientów.",
                    en: "Recurring workforce issues, public disputes with employees, or allegations of labor standard violations may significantly undermine the company’s credibility. This may result in losing preferred carrier status with selected key clients."
                },
                critical: {
                    pl: "Poważne naruszenia praw pracowniczych, masowe protesty kierowców lub szeroko nagłośnione incydenty związane z bezpieczeństwem pracy mogą trwale podważyć zaufanie rynku do firmy jako odpowiedzialnego operatora transportowego. W skrajnym przypadku oznacza to utratę strategicznych klientów oraz wykluczenie z długoterminowych umów ramowych.",
                    en: "Serious labor law violations, mass driver protests, or widely publicized safety incidents may permanently undermine market trust in the company as a responsible transport operator. In extreme cases, this may result in the loss of strategic clients and exclusion from long-term framework agreements."
                }
            },
            Operational: {
                green: {
                    pl: "Dostępność kierowców oraz personelu operacyjnego pozwala na realizację wszystkich zaplanowanych tras bez zakłóceń. Obsada zmianowa pozostaje stabilna, a harmonogramy przewozów są utrzymywane zgodnie z planem.",
                    en: "Driver and operational staff availability ensures the execution of all scheduled routes without disruption. Shift coverage remains stable, and transport schedules are maintained as planned."
                },
                yellow: {
                    pl: "Czasowe braki kadrowe lub zwiększona absencja kierowców mogą powodować konieczność modyfikacji grafików i przesunięć tras. Realizacja usług jest możliwa, jednak wymaga większej elastyczności organizacyjnej.",
                    en: "Temporary staff shortages or increased driver absenteeism may require schedule adjustments and route rescheduling. Services remain deliverable but require greater organizational flexibility."
                },
                orange: {
                    pl: "Znaczący niedobór kierowców lub wysoka rotacja kadry może prowadzić do odwoływania części kursów oraz ograniczenia dostępności floty. Konieczna jest reorganizacja pracy i czasowe wyłączenie wybranych tras.",
                    en: "A significant shortage of drivers or high workforce turnover may lead to cancellation of certain routes and reduced fleet availability. This requires operational reorganization and temporary suspension of selected routes."
                },
                critical: {
                    pl: "Trwała niestabilność kadrowa wśród kierowców może uniemożliwić utrzymanie harmonogramu przewozów. Oznacza to odwołanie części kursów oraz ograniczenie pracy floty do poziomu zapewniającego jedynie podstawową obsługę kluczowych tras.",
                    en: "Persistent workforce instability among drivers may make it impossible to maintain the transport schedule. This means the cancellation of part of the routes and limiting fleet operations to a level that ensures only basic service of key routes."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma posiada wszystkie wymagane licencje i zezwolenia transportowe, a procesy zgodności regulacyjnej są skutecznie nadzorowane. Nie występują ryzyka formalne mogące wpływać na stabilność przychodów z realizowanych kontraktów.",
                    en: "The company holds all required transport licenses and permits, and regulatory compliance processes are effectively supervised. There are no formal risks that could affect the stability of revenues from ongoing contracts."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub opóźnienia w odnowieniu zezwoleń mogą powodować zwiększoną kontrolę regulacyjną. Może to opóźniać pozyskiwanie nowych kontraktów i ograniczać dynamikę przychodów.",
                    en: "Isolated formal deficiencies or delays in renewing permits may result in increased regulatory scrutiny. This may delay the acquisition of new contracts and limit revenue growth dynamics."
                },
                orange: {
                    pl: "Powtarzające się naruszenia przepisów transportowych lub decyzje administracyjne nakładające ograniczenia na działalność mogą prowadzić do czasowego zawieszenia części uprawnień. Skutkiem jest ograniczenie możliwości realizacji wybranych kontraktów oraz konieczność renegocjacji warunków handlowych.",
                    en: "Repeated violations of transport regulations or administrative decisions imposing restrictions on operations may result in temporary suspension of certain authorizations. This limits the ability to perform selected contracts and may require renegotiation of commercial terms."
                },
                critical: {
                    pl: "Cofnięcie kluczowej licencji transportowej, zakaz wykonywania działalności na wybranych rynkach lub długotrwałe ograniczenia administracyjne mogą doprowadzić do utraty znaczącej części przychodów. W skrajnym przypadku oznacza to konieczność wstrzymania działalności w dotychczasowym zakresie oraz restrukturyzację modelu operacyjnego firmy.",
                    en: "Revocation of a key transport license, prohibition from operating in selected markets, or prolonged administrative restrictions may lead to the loss of a significant portion of revenue. In extreme cases, this may require suspension of operations in their current scope and restructuring of the company’s operating model."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z przepisami transportowymi, a kontrole regulacyjne nie wykazują istotnych nieprawidłowości. Nie występują zdarzenia podważające wiarygodność firmy jako podmiotu działającego zgodnie z obowiązującymi wymogami formalnymi.",
                    en: "The company maintains full compliance with transport regulations, and regulatory inspections do not reveal significant irregularities. There are no incidents undermining its credibility as an entity operating in line with formal requirements."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub uwagi pokontrolne mogą budzić zainteresowanie organów nadzoru. Osłabia to postrzeganie firmy jako w pełni zdyscyplinowanego podmiotu regulacyjnego.",
                    en: "Isolated formal deficiencies or inspection remarks may attract increased attention from supervisory authorities. This weakens the perception of the company as a fully compliant regulatory entity."
                },
                orange: {
                    pl: "Powtarzające się naruszenia przepisów transportowych lub publicznie dostępne decyzje administracyjne mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu zatwierdzonego przewoźnika u części klientów wymagających wysokich standardów zgodności.",
                    en: "Repeated violations of transport regulations or publicly available administrative decisions may significantly undermine the company’s credibility. This may result in losing approved carrier status with clients requiring high compliance standards."
                },
                critical: {
                    pl: "Cofnięcie licencji transportowej, publikacja decyzji administracyjnych o poważnych naruszeniach lub wpisanie firmy do rejestrów podmiotów naruszających przepisy może trwale podważyć wiarygodność regulacyjną firmy na rynku. W skrajnym przypadku oznacza to utratę statusu uprawnionego przewoźnika w systemach kluczowych kontrahentów.",
                    en: "Revocation of a transport license, publication of administrative decisions regarding serious violations, or inclusion of the company in registers of non-compliant entities may permanently undermine the company’s regulatory credibility in the market. In extreme cases, this may result in the loss of approved carrier status in key clients’ systems."
                }
            },
            Operational: {
                green: {
                    pl: "Firma posiada wszystkie wymagane licencje i zezwolenia, a działalność transportowa prowadzona jest zgodnie z obowiązującymi przepisami. Nie występują formalne ograniczenia wpływające na realizację przewozów.",
                    en: "The company holds all required licenses and permits, and transport operations are conducted in compliance with applicable regulations. There are no formal restrictions affecting the execution of transport services."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub zalecenia pokontrolne mogą wymagać wprowadzenia działań korygujących. Do czasu ich wdrożenia możliwe są ograniczenia w realizacji wybranych przewozów.",
                    en: "Isolated formal deficiencies or inspection recommendations may require corrective actions. Until implemented, certain transport operations may be subject to limitations."
                },
                orange: {
                    pl: "Decyzje administracyjne nakładające ograniczenia na zakres działalności lub czasowe zawieszenie części uprawnień mogą prowadzić do wyłączenia wybranych pojazdów lub tras z eksploatacji. Wymaga to reorganizacji działalności transportowej w ramach dostępnych zezwoleń.",
                    en: "Administrative decisions imposing operational restrictions or temporary suspension of certain authorizations may result in specific vehicles or routes being taken out of service. This requires reorganization of transport operations within the scope of available permits."
                },
                critical: {
                    pl: "Cofnięcie kluczowej licencji transportowej, zakaz wykonywania przewozów na określonych rynkach lub formalne wstrzymanie działalności przez organ nadzoru skutkuje obowiązkowym wstrzymaniem realizacji przewozów. W praktyce oznacza to całkowite zatrzymanie działalności w objętym decyzją zakresie do czasu przywrócenia pełnej zgodności regulacyjnej.",
                    en: "Revocation of a key transport license, a ban on operating in specific markets, or a formal suspension of activities by the supervisory authority results in a mandatory halt of transport operations. In practice, this means a complete suspension of activities within the scope covered by the decision until full regulatory compliance is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami transportowymi, dostawcami usług serwisowych oraz operatorami zewnętrznymi przebiega stabilnie. Warunki handlowe pozostają przewidywalne, a koszty usług zewnętrznych nie wpływają negatywnie na rentowność realizowanych kontraktów.",
                    en: "Cooperation with subcontracted carriers, service providers and external operators remains stable. Commercial terms are predictable and external service costs do not negatively affect the profitability of ongoing contracts."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców, kosztów usług serwisowych lub opłat logistycznych może ograniczać marżę realizowanych przewozów. Możliwości przeniesienia tych kosztów na klientów są ograniczone, co bezpośrednio obniża rentowność kontraktów.",
                    en: "Increases in subcontractor rates, servicing costs or logistics fees may reduce margins on transport operations. The ability to pass these costs on to clients is limited, directly lowering contract profitability."
                },
                orange: {
                    pl: "Niestabilność współpracy z kluczowymi podwykonawcami lub ograniczona dostępność usług zewnętrznych może prowadzić do konieczności korzystania z droższych alternatyw. Powoduje to wyraźne pogorszenie wyniku finansowego realizowanych kontraktów oraz trwałe obniżenie marży operacyjnej floty.",
                    en: "Instability in cooperation with key subcontractors or limited availability of external services may require the use of more expensive alternatives. This leads to a noticeable deterioration in contract performance and a sustained reduction in fleet operating margins."
                },
                critical: {
                    pl: "Utrata kluczowych podwykonawców lub trwałe zakłócenia w dostępie do usług zewnętrznych mogą doprowadzić do nieopłacalności realizowanych kontraktów transportowych. W konsekwencji firma zmuszona jest do realizacji zleceń poniżej progu rentowności, co wymusza wycofanie się z części nierentownych kontraktów oraz ograniczenie zakresu działalności transportowej.",
                    en: "The loss of key subcontractors or persistent disruptions in access to external services may render ongoing transport contracts unprofitable. As a consequence, the company may be forced to perform assignments below the break-even threshold, which necessitates withdrawing from certain unprofitable contracts and reducing the scope of its transport operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z przewoźnikami i firmami podwykonawczymi przebiega stabilnie, a dostawy docierają do klientów zgodnie z ustalonymi terminami. Nie występują reklamacje dotyczące opóźnień ani uszkodzeń towaru, co utrzymuje postrzeganie Twojej firmy jako rzetelnego partnera transportowego.",
                    en: "Cooperation with carriers and subcontracted transport companies remains stable, and deliveries reach clients according to agreed deadlines. There are no complaints regarding delays or cargo damage, which maintains your company’s image as a reliable logistics partner."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia po stronie przewoźników lub przejściowe braki dostępnych pojazdów powodują reklamacje klientów. Jeżeli takie sytuacje zaczynają się powtarzać, osłabiają ocenę Twojej firmy jako podmiotu, który skutecznie nadzoruje łańcuch realizacji usług transportowych.",
                    en: "Isolated delays by carriers or temporary shortages of available vehicles lead to customer complaints. If such situations begin to repeat, they weaken the assessment of your company as an operator that effectively supervises the transport execution chain."
                },
                orange: {
                    pl: "Niedotrzymywanie terminów dostaw przez kluczowych przewoźników lub częste uszkodzenia ładunku podważają zaufanie klientów do jakości realizacji usług. Negatywne oceny współpracy oraz formalne skargi obniżają status Twojej firmy jako preferowanego partnera logistycznego i mogą ograniczyć zaproszenia do nowych postępowań ofertowych.",
                    en: "Failure of key carriers to meet delivery deadlines or frequent cargo damage undermines client trust in service execution quality. Negative cooperation assessments and formal complaints reduce your company’s status as a preferred logistics partner and may limit invitations to future bidding procedures."
                },
                critical: {
                    pl: "Brak skutecznej kontroli nad siecią podwykonawców, powtarzające się opóźnienia tras lub publiczne spory z przewoźnikami mogą trwale podważyć wiarygodność Twojej firmy jako operatora logistycznego. W konsekwencji firma traci status zaufanego partnera w systemach kluczowych klientów oraz zostaje wykluczona z procesów kwalifikacyjnych przy nowych postępowaniach przetargowych.",
                    en: "Lack of effective control over the subcontractor network, repeated route delays, or public disputes with carriers may permanently damage your company’s credibility as a logistics operator. As a result, the company may lose its trusted partner status in key clients’ systems and be excluded from qualification processes in future tender procedures."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z przewoźnikami i firmami podwykonawczymi zapewnia ciągłość realizacji tras, a pojazdy są dostępne zgodnie z harmonogramem. Dostawy odbywają się bez zakłóceń, co pozwala utrzymać stabilną realizację całej siatki transportowej.",
                    en: "Cooperation with carriers and subcontracted transport companies ensures route continuity, and vehicles are available according to schedule. Deliveries proceed without disruption, allowing stable execution of the entire transport network."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw lub przejściowa niedostępność pojazdów po stronie podwykonawców powodują korekty harmonogramów tras. Zakłócenia te nie zatrzymują realizacji usług, lecz zwiększają presję organizacyjną i utrudniają płynne planowanie pracy floty.",
                    en: "Isolated delivery delays or temporary vehicle unavailability on the subcontractor side require route schedule adjustments. These disruptions do not stop operations, but they increase organizational pressure and make fleet planning less stable."
                },
                orange: {
                    pl: "Powtarzające się braki dostępnych przewoźników lub opóźnienia w podstawianiu pojazdów prowadzą do istotnych przesunięć tras i kumulacji zleceń. Zakłócenia te destabilizują realizację transportów i ograniczają zdolność Twojej firmy do terminowego wykonywania usług.",
                    en: "Repeated shortages of available carriers or delays in vehicle allocation lead to significant route shifts and accumulation of orders. These disruptions destabilize transport execution and limit your company’s ability to deliver services on time."
                },
                critical: {
                    pl: "Nagłe zerwanie współpracy z kluczowym przewoźnikiem lub przerwanie ciągłości dostaw transportowych może całkowicie zatrzymać realizację części tras. Oznacza to utratę zdolności operacyjnej w obsłudze wybranych kierunków oraz konieczność awaryjnej reorganizacji całej siatki transportowej.",
                    en: "Sudden termination of cooperation with a key carrier or disruption in transport continuity may completely halt execution of certain routes. This results in loss of operational capacity on selected lanes and requires emergency reorganization of the entire transport network."
                }
            }
        }
    },
    retail_trade: {
        E: {
            Business: {
                green: {
                    pl: "Poziom zapasów w magazynie i na półce jest dopasowany do rotacji sprzedaży, a zatowarowanie nie generuje nadmiernego zamrożenia kapitału. Struktura marży pozostaje stabilna, co pozwala utrzymać zakładany poziom rentowności sprzedaży.",
                    en: "Inventory levels in the warehouse and on shelves are aligned with sales turnover, and stock does not create excessive capital lock-up. The margin structure remains stable, allowing the planned level of sales profitability to be maintained."
                },
                yellow: {
                    pl: "Wzrost stanów magazynowych lub wolniejsza rotacja części asortymentu powodują zamrożenie kapitału obrotowego. Nadwyżka towaru zwiększa koszty magazynowania i obniża bieżącą marżę, ograniczając elastyczność finansową Twojej firmy.",
                    en: "An increase in inventory levels or slower turnover of part of the assortment leads to working capital being tied up. Excess stock raises storage costs and reduces current margin, limiting your company's financial flexibility."
                },
                orange: {
                    pl: "Istotne przeszacowanie zamówień lub spadek sprzedaży kluczowych produktów prowadzi do nadmiernego zalegania towaru w magazynie. Konieczność wyprzedaży z obniżoną ceną obniża marżę handlową i wyraźnie pogarsza wynik finansowy Twojego sklepu.",
                    en: "Significant overordering or a decline in sales of key products results in excessive stock remaining in the warehouse. The need to sell goods at reduced prices lowers trade margins and clearly weakens the financial result of your store."
                },
                critical: {
                    pl: "Długotrwałe zaleganie dużych partii towaru, szczególnie sezonowego, blokuje kapitał i wymusza agresywne obniżki cen w celu odzyskania gotówki. Spadek marży oraz ograniczona sprzedaż bieżąca wymuszają restrukturyzację asortymentu i redukcję zamówień w kolejnych okresach, co bezpośrednio zmniejsza skalę działalności Twojego sklepu.",
                    en: "Long-term accumulation of large stock volumes, especially seasonal goods, blocks capital and forces aggressive price reductions to recover cash. Margin erosion and weakened current sales require assortment restructuring and reduced purchasing in subsequent periods, directly shrinking the scale of your store’s operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Poziom zapasów i dostępność towaru na półce są dopasowane do popytu, a braki magazynowe nie występują w okresach zwiększonej sprzedaży. Klienci postrzegają Twoją firmę jako dobrze zorganizowany sklep, w którym towar jest dostępny zgodnie z oczekiwaniami.",
                    en: "Inventory levels and product availability on shelves are aligned with demand, and stock shortages do not occur during peak sales periods. Customers perceive your company as a well-organized retailer where products are available as expected."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub nadmiar wolno rotującego asortymentu powodują niezadowolenie części klientów. Powtarzające się sytuacje osłabiają ocenę Twojego sklepu jako miejsca, w którym można liczyć na stałą dostępność towaru.",
                    en: "Temporary shortages of selected products or excess slow-moving stock cause dissatisfaction among some customers. Repeated situations weaken the perception of your store as a place where product availability can be relied upon."
                },
                orange: {
                    pl: "Częste braki kluczowych produktów na półce lub ciągłe wyprzedaże nadmiernych zapasów obniżają wiarygodność Twojej firmy jako sprawnie zarządzającego detalisty. Klienci zaczynają postrzegać sklep jako nieprzewidywalny pod względem dostępności asortymentu, co osłabia lojalność zakupową.",
                    en: "Frequent shortages of key products or continuous clearance sales of excessive stock reduce your company’s credibility as an efficiently managed retailer. Customers begin to perceive the store as unpredictable in terms of assortment availability, weakening purchase loyalty."
                },
                critical: {
                    pl: "Długotrwałe braki podstawowych produktów lub masowe wyprzedaże niesprzedanego towaru podważają zaufanie do sposobu zarządzania sklepem. Utrwalona opinia o niestabilnej dostępności asortymentu prowadzi do odpływu stałych klientów i trwałej utraty pozycji sklepu jako preferowanego miejsca zakupów w swojej kategorii.",
                    en: "Prolonged shortages of essential products or large-scale clearance of unsold stock undermine trust in how the store is managed. A persistent perception of unstable product availability leads to customer outflow and permanent loss of the store’s position as a preferred shopping destination within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Zatowarowanie sklepu jest dopasowane do bieżącej sprzedaży, a uzupełnianie półek odbywa się bez opóźnień. Towar jest dostępny w kluczowych kategoriach, co pozwala realizować sprzedaż zgodnie z planem dnia.",
                    en: "Store replenishment is aligned with current sales, and shelf restocking takes place without delays. Key product categories remain available, allowing daily sales to proceed according to plan."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub opóźnienia w uzupełnianiu półek powodują konieczność korekt ekspozycji i reorganizacji pracy personelu. Zakłócenia te nie zatrzymują sprzedaży, lecz utrudniają płynne funkcjonowanie sklepu w godzinach szczytu.",
                    en: "Temporary shortages of selected products or delays in shelf restocking require adjustments in product display and staff organization. These disruptions do not stop sales but make store operations less smooth during peak hours."
                },
                orange: {
                    pl: "Powtarzające się braki towaru w kluczowych kategoriach lub nadmierne zaleganie niesprzedanych produktów istotnie destabilizują organizację sprzedaży. Personel musi stale zmieniać ekspozycję i układ asortymentu, co ogranicza zdolność sklepu do sprawnej obsługi klientów.",
                    en: "Repeated shortages in key categories or excessive accumulation of unsold products significantly destabilize sales organization. Staff must constantly adjust displays and assortment layout, limiting the store’s ability to serve customers efficiently."
                },
                critical: {
                    pl: "Długotrwały brak podstawowych produktów lub całe sekcje półek z niesprzedanym towarem prowadzą do dezorganizacji pracy sklepu. Sprzedaż kluczowych kategorii zostaje wstrzymana, co wymaga gruntownej reorganizacji zatowarowania i sposobu prowadzenia sprzedaży.",
                    en: "Prolonged absence of essential products or entire shelf sections filled with unsold stock lead to store disorganization. Sales in key categories are suspended, requiring a fundamental reorganization of inventory management and sales operations."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Obsada sklepu jest stabilna, a rotacja pracowników nie zakłóca organizacji sprzedaży. Koszty pracy pozostają pod kontrolą, co pozwala utrzymać marżę handlową na zakładanym poziomie.",
                    en: "Store staffing remains stable, and employee turnover does not disrupt sales organization. Labor costs stay under control, allowing the planned trade margin to be maintained."
                },
                yellow: {
                    pl: "Wzrost rotacji sprzedawców lub częstsze absencje powodują konieczność zatrudniania pracowników tymczasowych i dodatkowych szkoleń. Wyższe koszty pracy obniżają marżę sklepu, prowadząc do realizacji części sprzedaży poniżej zakładanego poziomu rentowności.",
                    en: "Increased turnover among sales staff or more frequent absences require temporary hiring and additional training. Higher labor costs reduce store margins, leading to part of sales being executed below the planned profitability level."
                },
                orange: {
                    pl: "Niedobór doświadczonych pracowników sprzedaży lub częste zmiany w zespole obniżają efektywność obsługi klientów i wydłużają proces sprzedaży. Spadek wydajności pracy zwiększa koszt jednostkowy sprzedaży, co bezpośrednio obniża marżę realizowanych transakcji.",
                    en: "A shortage of experienced sales staff or frequent team changes reduce customer service efficiency and extend the sales process. Lower productivity increases the unit cost of sales, directly reducing transaction margins."
                },
                critical: {
                    pl: "Utrata kluczowych pracowników lub trwałe braki kadrowe uniemożliwiają utrzymanie pełnych godzin otwarcia i sprawnej obsługi klientów. Ograniczona sprzedaż przy utrzymaniu stałych kosztów wynagrodzeń prowadzi do spadku rentowności sklepu i wymusza ograniczenie zakresu działalności.",
                    en: "Loss of key employees or persistent staffing shortages make it impossible to maintain full opening hours and efficient customer service. Reduced sales while fixed payroll costs remain in place lead to declining store profitability and force a reduction in the scope of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół sprzedaży jest stabilny, a poziom obsługi klientów pozostaje spójny niezależnie od pory dnia. Klienci postrzegają Twój sklep jako miejsce, w którym mogą liczyć na kompetentną pomoc i profesjonalną obsługę.",
                    en: "The sales team remains stable, and the level of customer service is consistent throughout the day. Customers perceive your store as a place where they can rely on competent assistance and professional service."
                },
                yellow: {
                    pl: "Częstsza rotacja pracowników lub różnice w poziomie doświadczenia sprzedawców powodują nierówną jakość obsługi. Powtarzające się uwagi klientów osłabiają wizerunek sklepu jako miejsca zapewniającego stały standard obsługi.",
                    en: "Increased employee turnover or differences in staff experience lead to inconsistent service quality. Repeated customer remarks weaken the image of the store as a place that delivers a consistent service standard."
                },
                orange: {
                    pl: "Braki kadrowe lub niedostateczne przeszkolenie personelu prowadzą do błędów sprzedażowych i wydłużonej obsługi klientów. Negatywne opinie i spadek ocen jakości obsługi podważają wiarygodność Twojego sklepu jako rzetelnego sprzedawcy.",
                    en: "Staff shortages or insufficient training lead to sales errors and extended customer service times. Negative feedback and declining service ratings undermine your store's credibility as a reliable retailer."
                },
                critical: {
                    pl: "Utrata kluczowych sprzedawców lub trwała niestabilność zespołu skutkują widocznym pogorszeniem jakości obsługi klientów. Utrwalona opinia o niskim standardzie obsługi prowadzi do trwałej utraty zaufania i osłabienia pozycji sklepu jako preferowanego miejsca zakupów w swojej kategorii.",
                    en: "Loss of key sales employees or persistent team instability results in a visible decline in customer service quality. A lasting perception of poor service standards leads to permanent loss of trust and weakening of the store’s position as a preferred shopping destination within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Obsada sklepu jest kompletna, a grafik pracy zapewnia płynną obsługę klientów w godzinach szczytu. Zespół realizuje sprzedaż bez zakłóceń, co pozwala utrzymać stabilną organizację pracy na sali sprzedaży.",
                    en: "Store staffing is complete, and the work schedule ensures smooth customer service during peak hours. The team handles sales without disruption, maintaining stable organization on the shop floor."
                },
                yellow: {
                    pl: "Czasowe braki kadrowe lub częstsze zmiany w grafiku powodują konieczność reorganizacji pracy zespołu. Obsługa klientów trwa dłużej, a w godzinach zwiększonego ruchu pojawiają się kolejki.",
                    en: "Temporary staff shortages or frequent schedule changes require reorganization of team duties. Customer service takes longer, and queues appear during peak hours."
                },
                orange: {
                    pl: "Powtarzające się braki personelu lub niedostateczna liczba sprzedawców na zmianie prowadzą do wyraźnych zakłóceń w obsłudze klientów. Część zadań sprzedażowych i ekspozycyjnych nie jest realizowana na bieżąco, co istotnie destabilizuje codzienną pracę sklepu.",
                    en: "Repeated staff shortages or an insufficient number of sales employees per shift lead to clear disruptions in customer service. Some sales and merchandising tasks are not completed on time, which significantly destabilizes daily store operations."
                },
                critical: {
                    pl: "Trwałe braki kadrowe lub nagłe odejście większej części zespołu uniemożliwiają utrzymanie standardowych godzin otwarcia. Sklep ogranicza zakres obsługi klientów, a organizacja pracy wymaga natychmiastowej reorganizacji.",
                    en: "Persistent staffing shortages or sudden departure of a significant part of the team make it impossible to maintain standard opening hours. The store must limit customer service scope, and work organization requires immediate restructuring."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Dokumentacja sprzedażowa, oznaczenia cen oraz procedury reklamacyjne są prowadzone zgodnie z obowiązującymi przepisami. Kontrole nie wykazują uchybień, co pozwala utrzymać stabilną sprzedaż bez ryzyka kar administracyjnych obciążających wynik finansowy sklepu.",
                    en: "Sales documentation, price labeling and complaint procedures comply with applicable regulations. Inspections reveal no deficiencies, allowing stable sales without the risk of administrative penalties affecting the store’s financial result."
                },
                yellow: {
                    pl: "Drobne nieścisłości w oznaczeniach cen lub dokumentacji sprzedażowej zwiększają ryzyko korekt i interwencji ze strony organów kontrolnych. Ewentualne kary lub obowiązek zwrotu części należności prowadzą do obniżenia marży handlowej na wybranych produktach.",
                    en: "Minor inconsistencies in price labeling or sales documentation increase the risk of corrections and regulatory interventions. Potential fines or required refunds reduce trade margins on selected products."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie oznaczeń cen, promocji lub rozliczeń reklamacji mogą skutkować sankcjami administracyjnymi. Nałożone kary oraz obowiązek korekty sprzedaży obniżają rentowność sklepu i wymuszają dostosowanie zasad promocji i rozliczeń sprzedaży.",
                    en: "Repeated irregularities in price labeling, promotions or complaint settlements may result in administrative sanctions. Imposed penalties and required sales corrections reduce store profitability and force adjustments to promotion rules and sales settlement practices."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów konsumenckich lub decyzja organu o czasowym wstrzymaniu sprzedaży określonych produktów bezpośrednio ograniczają możliwość prowadzenia działalności. Utrata części asortymentu przy stałych kosztach operacyjnych prowadzi do spadku rentowności i wymusza ograniczenie zakresu działalności.",
                    en: "Serious breaches of consumer regulations or a decision by authorities to temporarily suspend sales of specific products directly limit business activity. Loss of part of the assortment while fixed operating costs remain leads to declining profitability and forces a reduction in the scope of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Oznaczenia cen, zasady promocji oraz procedury reklamacyjne są przejrzyste i zgodne z obowiązującymi przepisami. Sklep postrzegany jest jako uczciwy i rzetelny podmiot działający zgodnie z zasadami rynku.",
                    en: "Price labeling, promotion rules and complaint procedures are transparent and compliant with applicable regulations. The store is perceived as a fair and reliable business operating in accordance with market rules."
                },
                yellow: {
                    pl: "Pojedyncze nieścisłości w oznaczeniach cen lub komunikacji promocji budzą wątpliwości części klientów. Powtarzające się uwagi osłabiają wizerunek sklepu jako podmiotu w pełni transparentnego w swoich działaniach.",
                    en: "Isolated inconsistencies in price labeling or promotion communication raise concerns among some customers. Repeated remarks weaken the store's image as a fully transparent business."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie prezentowania cen lub warunków promocji prowadzą do skarg klientów i interwencji organów kontrolnych. Informacje o uchybieniach podważają wiarygodność sklepu jako podmiotu działającego zgodnie z przepisami.",
                    en: "Repeated irregularities in price presentation or promotion conditions lead to customer complaints and regulatory interventions. Public information about such deficiencies undermines the store’s credibility as a business operating in compliance with regulations."
                },
                critical: {
                    pl: "Stwierdzone naruszenia przepisów konsumenckich lub decyzje administracyjne o nałożeniu sankcji stają się publicznie znane. Utrwalona opinia o nieuczciwych praktykach prowadzi do trwałej utraty zaufania oraz utraty statusu rzetelnego sprzedawcy w swojej kategorii.",
                    en: "Confirmed breaches of consumer regulations or administrative sanctions become publicly known. A sustained perception of unfair practices leads to permanent loss of trust and loss of status as a reputable retailer within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Sklep spełnia wymogi formalne dotyczące oznaczeń, procedur sprzedaży oraz warunków prowadzenia działalności. Kontrole nie wykazują uchybień, co pozwala prowadzić sprzedaż bez ograniczeń administracyjnych.",
                    en: "The store complies with formal requirements regarding labeling, sales procedures and operating conditions. Inspections reveal no deficiencies, allowing sales to continue without administrative restrictions."
                },
                yellow: {
                    pl: "Stwierdzone drobne uchybienia formalne wymagają korekt w dokumentacji lub sposobie oznaczania towaru. Do czasu ich usunięcia działalność sklepu podlega zwiększonemu nadzorowi ze strony organów kontrolnych.",
                    en: "Identified minor formal deficiencies require corrections in documentation or product labeling. Until they are resolved, the store operates under increased scrutiny from regulatory authorities."
                },
                orange: {
                    pl: "Powtarzające się niezgodności z przepisami dotyczącymi sprzedaży lub promocji prowadzą do wydania zaleceń pokontrolnych i terminów obowiązkowej korekty. Niewykonanie zaleceń w wyznaczonym czasie może skutkować czasowym ograniczeniem sprzedaży wybranych produktów.",
                    en: "Repeated non-compliance with regulations related to sales or promotions leads to official corrective orders and mandatory deadlines. Failure to implement required changes within the specified time may result in temporary restriction of sales of selected products."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów handlowych lub sanitarno-konsumenckich mogą skutkować decyzją o czasowym zamknięciu sklepu lub wstrzymaniu sprzedaży określonych kategorii towarów. W praktyce oznacza to obowiązkowe wstrzymanie działalności do czasu przywrócenia pełnej zgodności z decyzją organu.",
                    en: "Serious breaches of commercial or consumer regulations may result in a decision to temporarily close the store or suspend sales of specific product categories. In practice, this means mandatory suspension of operations until full compliance with the authority’ s decision is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z dostawcami przebiega stabilnie, a dostawy towaru realizowane są terminowo i zgodnie z zamówieniami. Warunki zakupu pozwalają utrzymać zakładaną marżę handlową bez presji na poziom cen sprzedaży.",
                    en: "Cooperation with suppliers remains stable, and product deliveries are carried out on time and in line with orders. Purchasing terms allow the planned trade margin to be maintained without pressure on sales prices."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach lub mniej korzystne warunki zakupu wybranych produktów zwiększają koszt zatowarowania. Wyższe ceny zakupu ograniczają rentowność sprzedaży, prowadząc do spadku marży na wybranych kategoriach.",
                    en: "Delivery delays or less favorable purchasing terms for selected products increase stocking costs. Higher purchase prices limit sales profitability, leading to margin decline in selected categories."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach lub znaczący wzrost cen zakupu towaru destabilizują politykę cenową sklepu. Konieczność sprzedaży części asortymentu przy wyższym koszcie jednostkowym bez proporcjonalnej podwyżki cen bezpośrednio obniża marżę realizowanych produktów.",
                    en: "Repeated supply disruptions or a significant increase in purchase prices destabilize the store’s pricing policy. The need to sell part of the assortment at a higher unit cost without proportional price increases directly reduces product margins."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy lub gwałtowny wzrost cen zakupu podstawowego asortymentu ograniczają dostępność towaru i wymuszają zakupy na mniej korzystnych warunkach. Sprzedaż przy podwyższonym koszcie zakupu prowadzi do realizacji części obrotu poniżej progu rentowności, co wymusza wycofanie się z nierentownych kategorii oraz ograniczenie skali działalności.",
                    en: "Loss of a key supplier or a sharp increase in purchase prices of core products limits product availability and forces procurement on less favorable terms. Selling goods at elevated purchase costs results in part of turnover being executed below the profitability threshold, forcing withdrawal from unprofitable categories and a reduction in the scale of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami przebiega stabilnie, a dostępność kluczowego asortymentu utrzymuje się na stałym poziomie. Klienci postrzegają sklep jako miejsce, w którym towar jest regularnie dostępny i zgodny z deklarowaną ofertą.",
                    en: "Cooperation with suppliers remains stable, and the availability of key products is consistent. Customers perceive the store as a place where products are regularly available and aligned with the declared offer."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub opóźnienia w dostawach budzą pytania klientów o stabilność oferty. Powtarzające się sytuacje osłabiają postrzeganie sklepu jako podmiotu mającego pełną kontrolę nad swoim asortymentem.",
                    en: "Temporary shortages of selected products or delivery delays raise customer concerns about offer stability. Repeated situations weaken the perception of the store as a business fully controlling its assortment."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach lub nagłe wycofanie produktów przez dostawców prowadzą do widocznych braków w kluczowych kategoriach. Klienci zaczynają postrzegać sklep jako nieprzewidywalny pod względem dostępności towaru, co osłabia jego wiarygodność jako stałego partnera zakupowego.",
                    en: "Repeated supply disruptions or sudden withdrawal of products by suppliers lead to visible shortages in key categories. Customers begin to perceive the store as unpredictable in terms of product availability, weakening its credibility as a consistent shopping partner."
                },
                critical: {
                    pl: "Utrata kluczowych dostawców lub długotrwałe braki podstawowego asortymentu podważają stabilność oferty sklepu. Utrwalona opinia o nieregularnej dostępności asortymentu prowadzi do trwałej utraty zaufania oraz utraty pozycji sklepu jako stabilnego sprzedawcy w swojej kategorii.",
                    en: "Loss of key suppliers or prolonged shortages of core products undermine the stability of the store’s offer. A sustained perception of irregular assortment availability leads to permanent loss of trust and loss of the store’s position as a stable retailer within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy od kluczowych dostawców realizowane są terminowo, a zatowarowanie sklepu przebiega zgodnie z planem. Uzupełnianie półek odbywa się bez zakłóceń, co pozwala utrzymać ciągłość sprzedaży we wszystkich głównych kategoriach.",
                    en: "Deliveries from key suppliers are carried out on time, and store replenishment follows the planned schedule. Shelf restocking proceeds without disruption, allowing continuous sales across all main categories."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach wybranych produktów wymagają korekt zamówień i reorganizacji ekspozycji. Sklep utrzymuje sprzedaż, jednak dostępność części asortymentu jest okresowo ograniczona.",
                    en: "Delays in deliveries of selected products require order adjustments and reorganization of product displays. Sales continue, but availability of part of the assortment is temporarily limited."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach prowadzą do braków w kluczowych kategoriach oraz konieczności częstych zmian w planie zatowarowania. Organizacja sprzedaży wymaga stałej interwencji, co destabilizuje bieżące funkcjonowanie sklepu i utrudnia utrzymanie ciągłości sprzedaży w głównych segmentach asortymentu.",
                    en: "Repeated supply disruptions lead to shortages in key categories and require frequent changes in replenishment planning. Sales organization demands constant intervention, destabilizing the store’s day-to-day operations and making it difficult to maintain continuous sales across core assortment segments."
                },
                critical: {
                    pl: "Długotrwałe wstrzymanie dostaw od kluczowych partnerów lub zerwanie współpracy z głównym dostawcą uniemożliwia utrzymanie podstawowego asortymentu. Sklep traci zdolność do prowadzenia regularnej sprzedaży w wybranych kategoriach, co wymaga natychmiastowej reorganizacji źródeł zaopatrzenia.",
                    en: "Prolonged suspension of deliveries from key partners or termination of cooperation with a main supplier makes it impossible to maintain core assortment. The store loses the ability to conduct regular sales in selected categories, requiring immediate reorganization of sourcing channels."
                }
            }
        }
    },
    it_software: {
        E: {
            Business: {
                green: {
                    pl: "Koszt wytworzenia oprogramowania jest zgodny z budżetem projektowym, a wykorzystanie zespołu pozostaje na stabilnym poziomie. Realizowane projekty utrzymują zakładaną marżę i zapewniają przewidywalny wynik finansowy.",
                    en: "Software development costs remain in line with project budgets, and team utilization stays at a stable level. Ongoing projects maintain the planned margin and deliver a predictable financial result."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji zadań lub niższa wydajność zespołu zwiększają koszt roboczogodziny w projekcie. Część kontraktów realizowana jest przy obniżonej marży, co ogranicza rentowność wybranych projektów.",
                    en: "Extended task completion times or lower team productivity increase the effective hourly cost within projects. Some contracts are executed at reduced margins, limiting profitability of selected projects."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia budżetu projektowego lub niedoszacowanie zakresu prac prowadzą do istotnego wzrostu kosztu wytworzenia oprogramowania. Realizacja projektów przy podwyższonym koszcie pracy powoduje spadek marży operacyjnej i osłabia rentowność całego portfela zleceń.",
                    en: "Repeated budget overruns or underestimation of project scope lead to a significant increase in software development costs. Executing projects at elevated labor costs reduces operating margins and weakens profitability across the project portfolio."
                },
                critical: {
                    pl: "Systematyczne przekraczanie budżetów oraz niska efektywność wykorzystania zespołu prowadzą do realizacji projektów poniżej progu rentowności. Spadek marży przy stałych kosztach wynagrodzeń prowadzi do presji na płynność projektową i wymusza ograniczenie skali działalności oraz selektywne przyjmowanie nowych zleceń.",
                    en: "Systematic budget overruns and low team utilization result in projects being delivered below the profitability threshold. Margin decline combined with fixed payroll costs creates pressure on project cash flow and forces a reduction in operational scale as well as selective acceptance of new contracts."
                }
            },
            Reputation: {
                green: {
                    pl: "Proces wytwórczy oprogramowania jest stabilny, a liczba błędów wdrożeniowych utrzymuje się na niskim poziomie. Systemy działają zgodnie z uzgodnionymi parametrami jakości i dostępności, co buduje wizerunek Twojej firmy jako technologicznie solidnego partnera.",
                    en: "The software development process remains stable, and the number of deployment defects stays low. Systems operate in line with agreed quality and availability parameters, strengthening your company’s image as a technologically reliable partner."
                },
                yellow: {
                    pl: "Zwiększona liczba poprawek po wdrożeniu oraz niestabilność wybranych środowisk produkcyjnych wskazują na obniżenie powtarzalności procesu technologicznego. Klienci zaczynają postrzegać Twoją firmę jako mniej przewidywalną pod względem jakości technicznej realizowanych projektów.",
                    en: "An increased number of post-deployment fixes and instability in selected production environments indicate reduced consistency of the development process. Clients begin to perceive your company as less predictable in terms of technical quality."
                },
                orange: {
                    pl: "Powtarzające się błędy wdrożeniowe oraz brak stabilności środowisk produkcyjnych prowadzą do utraty referencji technicznych i pogorszenia ocen jakości wykonania. Twoja firma może przestać być postrzegana jako dostawca gwarantujący powtarzalny standard technologiczny.",
                    en: "Repeated deployment defects and unstable production environments result in the loss of technical references and lower quality assessments. Your company may cease to be perceived as a provider ensuring consistent technological standards."
                },
                critical: {
                    pl: "Utrzymujące się problemy z jakością kodu i stabilnością systemów powodują utrwalenie opinii o niskiej dojrzałości procesu technologicznego. Twoja firma może utracić status rzetelnego wykonawcy projektów informatycznych i zostać wykluczona z list kwalifikowanych dostawców przy kluczowych wdrożeniach.",
                    en: "Ongoing issues with code quality and system stability solidify a perception of low technological process maturity. Your company may lose its status as a reliable IT project provider and be excluded from qualified supplier lists for key implementations."
                }
            },
            Operational: {
                green: {
                    pl: "Wdrożenia przebiegają bez zakłóceń, a systemy po uruchomieniu działają stabilnie. Zespół realizuje zaplanowane etapy prac w przewidywalnym tempie i utrzymuje kontrolę nad harmonogramem projektów.",
                    en: "Deployments proceed without disruption, and systems remain stable after launch. The team delivers planned work at a predictable pace and maintains control over project timelines."
                },
                yellow: {
                    pl: "Pojawiają się opóźnienia po wdrożeniach, które wymagają dodatkowych poprawek i przesunięć części zaplanowanych prac. Tempo realizacji sprintów spada, a kolejne wydania systemu są przesuwane, co ogranicza bieżącą przepustowość zespołu.",
                    en: "Post-deployment issues require additional fixes and force adjustments to planned work. Sprint execution slows down, and system releases are postponed, reducing the team's current delivery capacity."
                },
                orange: {
                    pl: "Powtarzające się problemy po wdrożeniach prowadzą do wstrzymania kolejnych uruchomień systemu i zamrożenia części zaplanowanych funkcjonalności. Zespół koncentruje się na stabilizacji istniejących rozwiązań, a rozwój roadmapy zostaje czasowo zatrzymany.",
                    en: "Repeated post-deployment issues result in suspension of further system releases and freezing of planned features. The team focuses on stabilizing existing solutions, while roadmap development is temporarily halted."
                },
                critical: {
                    pl: "Środowisko produkcyjne pozostaje niestabilne przez dłuższy czas, a kolejne wdrożenia są odkładane bez jasno określonego terminu. Organizacja przechodzi w stały tryb reagowania na awarie i traci zdolność do planowania kolejnych etapów rozwoju.",
                    en: "The production environment remains unstable for an extended period, and further deployments are postponed without a clear timeline. The organization shifts into a constant incident-response mode and loses the ability to plan future development stages."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół jest stabilny, a rotacja niska. Projekty realizowane są zgodnie z planem obsadowym, utrzymując zakładaną marżę oraz przewidywalny zysk z kontraktów.",
                    en: "The team remains stable, and turnover is low. Projects are delivered according to staffing plans, maintaining expected margins and predictable profit from contracts."
                },
                yellow: {
                    pl: "Pojedyncze odejścia kluczowych specjalistów lub opóźnienia w rekrutacji wydłużają czas kompletowania zespołów projektowych. Część prac wymaga angażowania droższych podwykonawców, co skutkuje niższym niż zakładany zyskiem z wybranych kontraktów.",
                    en: "Isolated departures of key specialists or recruitment delays extend project staffing timelines. Some work requires engaging higher-cost subcontractors, resulting in lower-than-planned profit on selected contracts."
                },
                orange: {
                    pl: "Powtarzająca się rotacja w kluczowych rolach oraz presja płacowa powodują trwały wzrost kosztu pracy w projektach. Przy niezmienionych stawkach dla klientów zysk z realizowanych kontraktów zaczyna być niższy niż zakładano na etapie sprzedaży, co ogranicza rentowność całej działalności.",
                    en: "Repeated turnover in key roles and salary pressure lead to a structural increase in project labor costs. With client rates unchanged, profit from ongoing contracts becomes lower than originally estimated at the sales stage, reducing overall business profitability."
                },
                critical: {
                    pl: "Utrata doświadczonych członków zespołu przy jednoczesnym wzroście wynagrodzeń powoduje trwały wzrost kosztu realizacji projektów. Znaczna część kontraktów realizowana jest poniżej progu opłacalności, co zmusza właściciela do ograniczenia skali działalności lub selektywnego przyjmowania nowych zleceń.",
                    en: "Loss of experienced team members combined with rising payroll costs permanently increases project delivery costs. A significant portion of contracts is executed below the profitability threshold, forcing the owner to reduce operational scale or selectively accept new projects."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół programistyczny jest stabilny, a kluczowe role pozostają obsadzone przez doświadczonych specjalistów. Klienci postrzegają Twoją firmę jako przewidywalnego partnera, który zapewnia ciągłość kompetencji w trakcie realizacji projektów.",
                    en: "The development team remains stable, with key roles held by experienced specialists. Clients perceive your company as a predictable partner that ensures continuity of expertise throughout project delivery."
                },
                yellow: {
                    pl: "Pojedyncze odejścia specjalistów lub częste zmiany w składzie zespołu zaczynają być zauważalne dla klientów. Współpraca pozostaje możliwa, jednak pojawiają się pytania o stabilność kompetencji przy dłuższych projektach.",
                    en: "Isolated departures of specialists or frequent team changes become noticeable to clients. Cooperation continues, but questions arise regarding the stability of expertise in long-term projects."
                },
                orange: {
                    pl: "Powtarzająca się rotacja w kluczowych rolach oraz brak ciągłości zespołu prowadzą do spadku zaufania do jakości realizacji projektów. Twoja firma może przestać być postrzegana jako partner gwarantujący stabilny skład i przewidywalny poziom kompetencji.",
                    en: "Repeated turnover in key roles and lack of team continuity lead to declining trust in project delivery quality. Your company may cease to be perceived as a partner ensuring a stable team structure and predictable competence levels."
                },
                critical: {
                    pl: "Częste zmiany w zespole oraz brak doświadczonych specjalistów powodują utrwalenie opinii o niestabilności kadrowej. Twoja firma może utracić status rzetelnego wykonawcy wymagających projektów i zostać pomijana przy wyborze dostawców do kluczowych wdrożeń.",
                    en: "Frequent team changes and lack of experienced specialists reinforce a perception of staffing instability. Your company may lose its status as a reliable contractor for demanding projects and be overlooked in supplier selection for key implementations."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół jest kompletny, a kluczowe role pozostają obsadzone. Projekty realizowane są zgodnie z planem, a obciążenie pracą jest równomiernie rozłożone, co pozwala utrzymać przewidywalne tempo realizacji.",
                    en: "The team is fully staffed, with key roles properly covered. Projects are delivered according to plan, and workload is evenly distributed, maintaining a predictable delivery pace."
                },
                yellow: {
                    pl: "Pojawiają się okresowe braki kadrowe lub zwiększone obciążenie wybranych specjalistów. Część zaplanowanych prac jest przesuwana, a tempo realizacji projektów spada, choć organizacja nadal zachowuje kontrolę nad harmonogramem.",
                    en: "Temporary staffing gaps or increased workload among selected specialists occur. Some planned tasks are postponed, and project execution slows down, although overall schedule control is still maintained."
                },
                orange: {
                    pl: "Powtarzające się braki kadrowe oraz nierównomierne obciążenie zespołu prowadzą do wstrzymania części nowych inicjatyw. Organizacja koncentruje się na dokończeniu rozpoczętych projektów, a możliwość przyjmowania kolejnych zleceń zostaje istotnie ograniczona.",
                    en: "Repeated staffing shortages and uneven workload distribution lead to suspension of certain new initiatives. The organization focuses on completing ongoing projects, and its ability to take on additional work becomes significantly limited."
                },
                critical: {
                    pl: "Długotrwałe braki w kluczowych rolach oraz przeciążenie zespołu powodują dezorganizację pracy i brak przewidywalności realizacji projektów. Firma traci zdolność planowania kolejnych etapów rozwoju i funkcjonuje w trybie ciągłego reagowania na bieżące braki kadrowe.",
                    en: "Prolonged gaps in key roles and sustained team overload lead to work disorganization and unpredictable project delivery. The company loses the ability to plan further development stages and operates in a constant reactive mode driven by staffing shortages."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z wymogami dotyczącymi ochrony danych, licencji oraz zapisów umownych. Koszty związane z bezpieczeństwem i zgodnością są przewidywalne i uwzględnione w wycenie projektów, co pozwala utrzymać zakładaną marżę.",
                    en: "The company maintains full compliance with data protection requirements, licensing obligations, and contractual terms. Compliance-related costs are predictable and included in project pricing, allowing planned margins to be maintained."
                },
                yellow: {
                    pl: "Pojawiają się dodatkowe wymagania prawne lub audytowe, które wymagają korekt w dokumentacji i zabezpieczeniach systemów. Część projektów generuje nieplanowane koszty dostosowawcze, co obniża zysk w stosunku do pierwotnych założeń.",
                    en: "Additional legal or audit requirements require adjustments to documentation and system safeguards. Some projects generate unplanned compliance costs, reducing profit compared to initial estimates."
                },
                orange: {
                    pl: "Powtarzające się wymogi regulacyjne oraz konieczność wdrażania dodatkowych zabezpieczeń zwiększają koszt realizacji projektów. Przy stałych stawkach dla klientów zysk z części kontraktów spada poniżej zakładanego poziomu rentowności, co ogranicza opłacalność przyjmowania podobnych zleceń.",
                    en: "Recurring regulatory requirements and the need for additional safeguards increase project delivery costs. With client rates unchanged, profit from certain contracts falls below the expected profitability level, limiting the viability of similar engagements."
                },
                critical: {
                    pl: "Znaczące naruszenia wymogów regulacyjnych lub wysokie kary administracyjne lub odszkodowania wynikające z naruszeń umownych powodują gwałtowny wzrost kosztów działalności. Firma realizuje część projektów poniżej progu opłacalności, co wymusza ograniczenie zakresu oferowanych usług lub rezygnację z wybranych segmentów rynku.",
                    en: "Significant regulatory breaches or substantial administrative penalties or contractual damages resulting from compliance failures cause a sharp increase in operating costs. The company executes part of its projects below the profitability threshold, forcing a reduction in service scope or withdrawal from selected market segments."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z wymaganiami dotyczącymi ochrony danych, licencji oraz zapisów umownych. Klienci postrzegają ją jako partnera, który zapewnia bezpieczne i zgodne z przepisami środowisko realizacji projektów.",
                    en: "The company maintains full compliance with data protection requirements, licensing obligations, and contractual terms. Clients perceive it as a partner that ensures a secure and compliant project environment."
                },
                yellow: {
                    pl: "Pojawiają się pojedyncze uchybienia w dokumentacji lub opóźnienia w aktualizacji procedur bezpieczeństwa. Współpraca pozostaje stabilna, jednak klienci zaczynają oczekiwać dodatkowych wyjaśnień dotyczących sposobu zarządzania zgodnością.",
                    en: "Isolated documentation gaps or delays in updating security procedures occur. Cooperation remains stable, but clients begin to request additional clarification regarding compliance management."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie ochrony danych lub niespójności w zapisach umownych prowadzą do spadku zaufania do standardów zgodności. Twoja firma może przestać być postrzegana jako partner gwarantujący bezpieczne przetwarzanie danych i zgodne z prawem realizowanie projektów.",
                    en: "Repeated irregularities in data protection practices or inconsistencies in contractual provisions reduce trust in compliance standards. Your company may cease to be perceived as a partner ensuring secure data processing and legally compliant project execution."
                },
                critical: {
                    pl: "Poważne naruszenia wymogów regulacyjnych lub publicznie ujawnione incydenty związane z bezpieczeństwem danych powodują utrwalenie opinii o niewystarczającym poziomie bezpieczeństwa i nadzoru prawnego. Twoja firma może utracić status wiarygodnego dostawcy w projektach wymagających wysokiego poziomu bezpieczeństwa i nadzoru prawnego.",
                    en: "Serious regulatory breaches or publicly disclosed data security incidents reinforce a perception of insufficient security and legal oversight standards. Your company may lose its status as a trusted provider in projects requiring a high level of security and regulatory supervision."
                }
            },
            Operational: {
                green: {
                    pl: "Procesy ochrony danych, zarządzania licencjami oraz realizacji obowiązków umownych są aktualne i zgodne z wymaganiami. Projekty mogą być realizowane bez dodatkowych ograniczeń formalnych, a organizacja zachowuje pełną swobodę operacyjną.",
                    en: "Data protection processes, license management, and contractual obligations are up to date and compliant. Projects can be executed without additional formal restrictions, and the organization maintains full operational freedom."
                },
                yellow: {
                    pl: "Stwierdzone uchybienia wymagają uzupełnienia dokumentacji lub dostosowania procedur bezpieczeństwa. Projekty są kontynuowane, jednak część działań projektowych lub wdrożeniowych musi zostać czasowo wstrzymana do momentu usunięcia niezgodności.",
                    en: "Identified deficiencies require updates to documentation or adjustments to security procedures. Projects continue, but certain project or deployment activities must be temporarily suspended until compliance gaps are resolved."
                },
                orange: {
                    pl: "Powtarzające się niezgodności lub negatywne wyniki audytów prowadzą do nałożenia dodatkowych wymogów nadzorczych. Realizacja wybranych projektów zostaje ograniczona do czasu wdrożenia wymaganych zabezpieczeń i procedur, co wyraźnie zawęża zakres bieżącej działalności.",
                    en: "Repeated compliance issues or negative audit findings lead to the imposition of additional supervisory requirements. Execution of selected projects is restricted until required safeguards and procedures are implemented, significantly narrowing current operational scope."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub decyzje organów nadzorczych skutkują obowiązkowym wstrzymaniem części działalności do czasu przywrócenia pełnej zgodności. Firma traci możliwość realizacji projektów objętych nadzorem, co wymaga natychmiastowej reorganizacji sposobu prowadzenia działalności.",
                    en: "Serious regulatory breaches or supervisory authority decisions result in mandatory suspension of part of the business until full compliance is restored. The company loses the ability to execute projects under supervision, requiring immediate reorganization of operational activities."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami oraz dostawcami technologii przebiega stabilnie, a koszty usług zewnętrznych są zgodne z założeniami projektowymi. Marża na realizowanych kontraktach pozostaje na planowanym poziomie.",
                    en: "Cooperation with subcontractors and technology providers remains stable, and external service costs align with project assumptions. Margins on delivered contracts remain at the planned level."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców lub kosztów usług chmurowych powoduje korekty budżetów projektowych. Część kontraktów generuje niższy zysk niż zakładano, choć rentowność całej działalności pozostaje pod kontrolą.",
                    en: "Increased subcontractor rates or cloud service costs require adjustments to project budgets. Some contracts generate lower profit than expected, although overall business profitability remains under control."
                },
                orange: {
                    pl: "Powtarzające się podwyżki cen usług zewnętrznych oraz rosnące koszty infrastruktury powodują trwały wzrost kosztu realizacji projektów. Przy niezmienionych stawkach dla klientów zysk z części kontraktów spada poniżej zakładanego poziomu rentowności, co ogranicza opłacalność przyjmowania nowych zleceń.",
                    en: "Recurring price increases from external providers and rising infrastructure costs lead to a structural increase in project delivery expenses. With client rates unchanged, profit from certain contracts falls below the expected profitability level, limiting the viability of accepting new projects."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy technologii lub gwałtowny wzrost kosztów usług zewnętrznych powodują, że znacząca część projektów realizowana jest poniżej progu opłacalności. Firma zmuszona jest ograniczyć zakres działalności lub wycofać się z części projektów wymagających wysokiego udziału usług zewnętrznych.",
                    en: "Loss of a key technology provider or a sharp increase in external service costs causes a significant portion of projects to be executed below the profitability threshold. The company is forced to reduce its operational scope or withdraw from projects requiring a high reliance on external services."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami technologii i podwykonawcami przebiega stabilnie, a relacje są długoterminowe i przewidywalne. Klienci postrzegają Twoją firmę jako partnera, który zapewnia ciągłość dostępu do kluczowych rozwiązań technologicznych.",
                    en: "Cooperation with technology providers and subcontractors remains stable, with long-term and predictable relationships. Clients perceive your company as a partner ensuring continuous access to key technological solutions."
                },
                yellow: {
                    pl: "Pojedyncze zmiany dostawców lub przerwy we współpracy z podwykonawcami zaczynają być zauważalne w projektach. Zaufanie do stabilności zaplecza technologicznego pozostaje, jednak klienci oczekują większej przejrzystości w zakresie wyboru partnerów.",
                    en: "Isolated supplier changes or temporary interruptions in subcontractor cooperation become noticeable within projects. Trust in the stability of the technological base remains, but clients expect greater transparency regarding partner selection."
                },
                orange: {
                    pl: "Powtarzające się zmiany dostawców technologii lub problemy z ciągłością współpracy z kluczowymi partnerami prowadzą do spadku zaufania do stabilności realizowanych rozwiązań. Twoja firma może przestać być postrzegana jako integrator gwarantujący trwałe i przewidywalne środowisko technologiczne.",
                    en: "Repeated changes of technology providers or continuity issues with key partners reduce trust in the stability of delivered solutions. Your company may cease to be perceived as an integrator ensuring a durable and predictable technological environment."
                },
                critical: {
                    pl: "Częste zerwania współpracy z kluczowymi dostawcami lub publiczne konflikty lub nagłe zerwania umów z partnerami technologicznymi powodują utrwalenie opinii o braku stabilnego zaplecza zewnętrznego. Twoja firma może zostać pomijana przy projektach wymagających długoterminowej współpracy i wysokiej niezawodności infrastruktury.",
                    en: "Frequent termination of cooperation with key suppliers or public conflicts or sudden contract terminations with technology partners reinforce a perception of unstable external support. Your company may be overlooked in projects requiring long-term cooperation and high infrastructure reliability."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z dostawcami chmury, infrastruktury i podwykonawcami przebiega bez zakłóceń. Systemy zewnętrzne działają stabilnie, co pozwala realizować projekty zgodnie z planem i utrzymywać ciągłość wdrożeń.",
                    en: "Cooperation with cloud providers, infrastructure partners, and subcontractors remains uninterrupted. External systems operate reliably, enabling projects to be delivered according to plan and ensuring continuity of deployments."
                },
                yellow: {
                    pl: "Pojawiają się czasowe przerwy w dostępności usług zewnętrznych lub opóźnienia po stronie partnerów technologicznych. Część prac wdrożeniowych musi zostać przesunięta, jednak organizacja nadal zachowuje kontrolę nad harmonogramem projektów.",
                    en: "Temporary service outages or delays on the side of technology partners occur. Some deployment activities must be postponed, but the organization still maintains overall control of project timelines."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostępnością usług chmurowych lub niestabilność współpracy z kluczowym dostawcą prowadzą do wstrzymania części wdrożeń. Zespół koncentruje się na utrzymaniu bieżących systemów, a realizacja nowych projektów zostaje istotnie ograniczona.",
                    en: "Repeated cloud service disruptions or instability in cooperation with a key provider lead to suspension of certain deployments. The team focuses on maintaining existing systems, while execution of new projects becomes significantly limited."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych usług zewnętrznych lub zerwanie współpracy z głównym dostawcą uniemożliwia realizację projektów wymagających tej infrastruktury. Organizacja traci zdolność planowania kolejnych wdrożeń w tym obszarze i musi pilnie reorganizować źródła technologiczne.",
                    en: "Prolonged unavailability of critical external services or termination of cooperation with a main provider makes it impossible to execute projects dependent on that infrastructure. The organization loses the ability to plan further deployments in this area and must urgently reorganize its technology sources."
                }
            }
        }
    },
    finance_fintech: {
        E: {
            Business: {
                green: {
                    pl: "Koszt obsługi transakcji oraz utrzymania systemów finansowych pozostaje zgodny z założeniami budżetowymi. Efektywność procesów operacyjnych pozwala utrzymać planowaną marżę na oferowanych usługach finansowych.",
                    en: "The cost of transaction processing and maintaining financial systems remains in line with budget assumptions. Operational efficiency allows the company to maintain planned margins on financial services."
                },
                yellow: {
                    pl: "Wzrost kosztów obsługi transakcji lub utrzymania infrastruktury powoduje korekty w budżetach operacyjnych. Część produktów finansowych generuje niższy zysk niż zakładano, choć rentowność całej działalności pozostaje stabilna.",
                    en: "Increased transaction processing or infrastructure costs require adjustments to operating budgets. Some financial products generate lower profit than expected, although overall business profitability remains stable."
                },
                orange: {
                    pl: "Powtarzający się wzrost kosztu jednostkowego transakcji oraz rosnące koszty technologiczne powodują trwałe obniżenie marży na wybranych usługach. Część produktów realizowana jest poniżej zakładanego poziomu rentowności, co ogranicza opłacalność dalszego skalowania działalności.",
                    en: "Recurring increases in per-transaction costs and rising technology expenses lead to a structural decline in margins on selected services. Some products are delivered below the expected profitability level, limiting the viability of further scaling."
                },
                critical: {
                    pl: "Znaczący wzrost kosztu przetwarzania operacji finansowych oraz utrzymania infrastruktury powoduje, że istotna część oferty realizowana jest poniżej progu opłacalności. Firma zmuszona jest ograniczyć zakres usług, podnieść opłaty dla klientów lub wycofać się z nierentownych segmentów rynku.",
                    en: "A substantial increase in transaction processing and infrastructure costs results in a significant portion of services being delivered below the profitability threshold. The company is forced to reduce its service scope, raise client fees, or withdraw from unprofitable market segments."
                }
            },
            Reputation: {
                green: {
                    pl: "Systemy finansowe działają sprawnie, a przetwarzanie transakcji przebiega bez opóźnień. Klienci postrzegają firmę jako stabilnego i przewidywalnego partnera w obsłudze operacji finansowych.",
                    en: "Financial systems operate smoothly, and transaction processing runs without delays. Clients perceive the company as a stable and predictable partner in handling financial operations."
                },
                yellow: {
                    pl: "Pojawiają się okresowe opóźnienia w realizacji transakcji lub wydłużony czas reakcji systemów. Obsługa klientów pozostaje możliwa, jednak zaczynają pojawiać się pytania o skalowalność i wydajność infrastruktury.",
                    en: "Occasional transaction delays or extended system response times occur. Client service continues, but questions arise regarding the scalability and performance of the infrastructure."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w przetwarzaniu operacji finansowych lub dłuższe przerwy w dostępności usług prowadzą do spadku zaufania do stabilności systemu. Firma może przestać być postrzegana jako podmiot zapewniający nieprzerwaną i przewidywalną obsługę transakcji.",
                    en: "Repeated disruptions in financial transaction processing or extended service outages reduce trust in system stability. The company may cease to be perceived as an entity ensuring uninterrupted and predictable transaction handling."
                },
                critical: {
                    pl: "Poważne lub publicznie nagłośnione przerwy w działaniu systemów finansowych powodują utrwalenie opinii o niewystarczającej sprawności operacyjnej. Firma może utracić status wiarygodnego operatora usług finansowych, szczególnie w obszarach wymagających wysokiej dostępności 24/7 lub obsługi dużego wolumenu transakcji.",
                    en: "Serious or publicly reported disruptions in financial systems reinforce a perception of insufficient operational reliability. The company may lose its status as a trusted financial services operator, particularly in areas requiring 24/7 availability or high transaction volumes."
                }
            },
            Operational: {
                green: {
                    pl: "Systemy przetwarzania transakcji działają stabilnie, a czas realizacji operacji pozostaje przewidywalny. Infrastruktura finansowa obsługuje bieżący wolumen bez przeciążeń, co pozwala utrzymać pełną kontrolę nad procesami operacyjnymi.",
                    en: "Transaction processing systems operate stably, and execution times remain predictable. The financial infrastructure handles current volumes without overload, maintaining full operational control."
                },
                yellow: {
                    pl: "Pojawiają się okresowe spowolnienia w przetwarzaniu operacji lub chwilowe przeciążenia systemu. Zespół musi reagować na zwiększoną liczbę zgłoszeń technicznych, co ogranicza część dostępnej przepustowości, jednak ciągłość działania zostaje zachowana.",
                    en: "Occasional slowdowns in transaction processing or temporary system overloads occur. The team must respond to an increased number of technical incidents, reducing available capacity, but operational continuity is maintained."
                },
                orange: {
                    pl: "Powtarzające się przeciążenia systemów lub niestabilność infrastruktury powodują wstrzymywanie części operacji finansowych oraz ograniczenie dostępności wybranych funkcji. Organizacja przechodzi w tryb stałej interwencji technicznej, co istotnie ogranicza zdolność do planowego rozwoju systemu.",
                    en: "Recurring system overloads or infrastructure instability lead to partial suspension of financial operations and limited availability of selected functions. The organization shifts into continuous technical intervention mode, significantly restricting planned system development."
                },
                critical: {
                    pl: "Długotrwała niestabilność systemów finansowych uniemożliwia przewidywalne przetwarzanie operacji i wymusza działanie w trybie ciągłego reagowania na incydenty. Organizacja traci zdolność do planowania wdrożeń oraz utrzymania stałej dostępności usług.",
                    en: "Prolonged instability of financial systems makes transaction processing unpredictable and forces the organization into constant incident response mode. The company loses the ability to plan deployments and maintain consistent service availability."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół projektowy i operacyjny realizuje zadania zgodnie z planowaną wydajnością, a koszt pracy pozostaje zgodny z założeniami budżetowymi. Projekty finansowe generują zakładany poziom zysku, bez presji na marżę.",
                    en: "The project and operations team delivers work in line with planned productivity, and labor costs remain within budget assumptions. Financial projects generate the expected level of profit without margin pressure."
                },
                yellow: {
                    pl: "Wydłużony czas realizacji zadań lub zwiększona rotacja pracowników powodują wzrost kosztu projektu. Część kontraktów zaczyna generować niższy zysk niż zakładano na etapie sprzedaży, choć rentowność całego portfela pozostaje pod kontrolą.",
                    en: "Extended task completion times or increased employee turnover raise project costs. Some contracts begin to generate lower profit than expected at the sales stage, although overall portfolio profitability remains under control."
                },
                orange: {
                    pl: "Powtarzające się braki kadrowe lub konieczność angażowania droższych specjalistów powodują stały wzrost kosztów realizacji usług finansowych. Zysk z realizowanych kontraktów zaczyna być wyraźnie niższy niż zakładano, co ogranicza możliwość przyjmowania nowych projektów na dotychczasowych warunkach.",
                    en: "Recurring staffing gaps or the need to engage higher-cost specialists lead to a sustained increase in service delivery costs. Profit from ongoing contracts becomes clearly lower than initially projected, limiting the ability to accept new projects under existing terms."
                },
                critical: {
                    pl: "Znacząca utrata kluczowych kompetencji lub trwałe niedobory kadrowe powodują, że projekty realizowane są przy wysokim koszcie pracy i obniżonej wydajności. Część usług finansowych wykonywana jest poniżej progu rentowności, co wymusza ograniczenie skali działalności lub restrukturyzację zespołu.",
                    en: "Significant loss of key competencies or persistent staffing shortages result in projects being delivered at high labor costs and reduced productivity. Some financial services are performed below the profitability threshold, forcing the company to reduce its scale of operations or restructure the team."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół realizujący usługi finansowe działa stabilnie, a kompetencje specjalistów są postrzegane jako adekwatne do skali i złożoności projektów. Firma buduje wizerunek rzetelnego partnera w obszarze usług finansowych i technologii płatniczych.",
                    en: "The team delivering financial services operates steadily, and its competencies are perceived as adequate for the scale and complexity of projects. The company builds a reputation as a reliable partner in financial and payment technology services."
                },
                yellow: {
                    pl: "Pojawiają się zmiany kadrowe lub wydłużony czas wdrażania nowych specjalistów, co zaczyna być zauważalne w odbiorze klientów. Firma pozostaje wiarygodnym partnerem, jednak pojawiają się pierwsze pytania o stabilność zespołu przy bardziej wymagających projektach.",
                    en: "Staff changes or extended onboarding of new specialists become noticeable to clients. The company remains a credible partner, but initial questions arise regarding team stability in more demanding projects."
                },
                orange: {
                    pl: "Powtarzająca się rotacja kluczowych specjalistów lub brak ciągłości zespołu projektowego prowadzą do spadku zaufania do stabilności kompetencyjnej firmy. Organizacja może przestać być postrzegana jako partner zdolny do realizacji projektów finansowych o podwyższonym stopniu złożoności.",
                    en: "Recurring turnover of key specialists or lack of continuity within project teams reduces trust in the company's competence stability. The organization may cease to be perceived as a partner capable of delivering more complex financial projects."
                },
                critical: {
                    pl: "Długotrwałe niedobory kadrowe lub utrata kluczowych ekspertów powodują utrwalenie opinii o osłabionym potencjale kompetencyjnym firmy. Organizacja może utracić status wiarygodnego wykonawcy projektów o wysokiej złożoności technologicznej i regulacyjnej.",
                    en: "Prolonged staffing shortages or loss of key experts reinforce a perception of weakened professional capability. The organization may lose its status as a credible contractor for projects involving high technological and regulatory complexity."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół projektowy i operacyjny pracuje w stabilnym składzie, a obciążenie zadaniami pozostaje na kontrolowanym poziomie. Projekty finansowe realizowane są zgodnie z harmonogramem, bez konieczności pracy w trybie nadzwyczajnym.",
                    en: "The project and operations team works in a stable structure, with workload kept at a controlled level. Financial projects are delivered according to schedule without the need for emergency working modes."
                },
                yellow: {
                    pl: "Wzrost liczby zadań lub czasowe braki kadrowe powodują spadek przepustowości zespołu. Część projektów wymaga przesunięć terminów, a zespół pracuje w wydłużonych cyklach realizacyjnych, jednak kontrola nad harmonogramem jest utrzymana.",
                    en: "An increase in workload or temporary staffing gaps reduces team capacity. Some projects require deadline adjustments, and the team operates in extended delivery cycles, although overall schedule control is maintained."
                },
                orange: {
                    pl: "Powtarzające się niedobory kadrowe lub przeciążenie zespołu powodują wstrzymanie nowych inicjatyw oraz ograniczenie prac rozwojowych. Organizacja koncentruje się głównie na bieżącej obsłudze i reagowaniu na zgłoszenia, co istotnie ogranicza możliwość planowego rozwoju usług finansowych.",
                    en: "Recurring staffing shortages or sustained overload lead to suspension of new initiatives and reduced development work. The organization focuses primarily on ongoing support and incident response, significantly limiting planned development of financial services."
                },
                critical: {
                    pl: "Długotrwałe braki kompetencyjne lub przeciążenie zespołu powodują utratę zdolności do planowania projektów finansowych w przewidywalnych terminach. Organizacja przechodzi w stały tryb reagowania na bieżące problemy, bez realnej możliwości realizacji zaplanowanej roadmapy.",
                    en: "Prolonged competency gaps or sustained overload result in the loss of ability to plan financial projects within predictable timelines. The organization shifts into a permanent reactive mode, without realistic capacity to execute the planned roadmap."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Procesy zgodności regulacyjnej są realizowane terminowo, a koszty nadzoru i raportowania pozostają zgodne z założeniami budżetowymi. Wymogi prawne nie wywierają presji na marżę oferowanych usług finansowych.",
                    en: "Regulatory compliance processes are carried out on time, and supervision and reporting costs remain within budget assumptions. Legal requirements do not create pressure on service margins."
                },
                yellow: {
                    pl: "Wzrost wymagań regulacyjnych lub dodatkowe obowiązki raportowe powodują zwiększenie kosztów operacyjnych. Część usług finansowych generuje niższy zysk niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Increased regulatory requirements or additional reporting obligations raise operating costs. Some financial services generate lower profit than expected, although the business remains profitable."
                },
                orange: {
                    pl: "Powtarzające się kontrole, kary administracyjne lub dodatkowe wymogi związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz obowiązkami raportowymi powodują trwały wzrost kosztów zgodności. Część produktów finansowych realizowana jest na minimalnej marży, co ogranicza opłacalność dalszego rozwoju wybranych segmentów.",
                    en: "Recurring inspections, administrative fines, or additional requirements related to anti-money laundering, customer identity verification, and reporting obligations lead to a sustained increase in compliance costs. Some financial products are delivered at minimal margins, limiting the viability of further development in selected segments."
                },
                critical: {
                    pl: "Wysokie kary administracyjne lub odszkodowania wynikające z naruszeń umownych powodują istotne obciążenie wyniku finansowego. Część działalności realizowana jest poniżej progu rentowności, co wymusza ograniczenie zakresu usług lub wycofanie się z najbardziej obciążonych regulacyjnie obszarów.",
                    en: "High administrative fines or contractual penalties resulting from regulatory breaches place significant pressure on financial results. Parts of the business operate below the profitability threshold, forcing the company to reduce its service scope or withdraw from the most heavily regulated areas."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma realizuje obowiązki regulacyjne terminowo, a procesy związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz ochroną danych funkcjonują stabilnie. Organizacja postrzegana jest jako stabilny i odpowiedzialny podmiot regulowany.",
                    en: "The company fulfills regulatory obligations on time, and processes related to anti-money laundering, customer identity verification, and data protection operate reliably. The organization is perceived as a stable and responsible regulated entity."
                },
                yellow: {
                    pl: "Pojawiają się drobne nieprawidłowości w raportowaniu lub opóźnienia w aktualizacji procedur. Firma pozostaje zgodna z wymogami, jednak w odbiorze partnerów zaczynają pojawiać się pytania o poziom nadzoru i aktualność procesów kontrolnych.",
                    en: "Minor reporting irregularities or delays in updating procedures occur. The company remains compliant, but partners begin to raise questions about the level of oversight and the timeliness of control processes."
                },
                orange: {
                    pl: "Powtarzające się uwagi ze strony organów nadzorczych lub konieczność częstych korekt dokumentacji powodują spadek zaufania do stabilności systemu zgodności. Firma może przestać być postrzegana jako w pełni przewidywalny i dojrzały regulacyjnie partner w projektach finansowych.",
                    en: "Recurring remarks from supervisory authorities or the need for frequent documentation corrections reduce trust in the stability of the compliance framework. The company may cease to be perceived as a fully predictable and mature regulatory partner in financial projects."
                },
                critical: {
                    pl: "Poważne naruszenia wymogów prawnych lub publicznie nagłośnione postępowania nadzorcze prowadzą do utrwalenia opinii o niewystarczającym poziomie bezpieczeństwa i nadzoru prawnego. Firma może utracić status wiarygodnego partnera w obszarach wymagających ścisłej zgodności regulacyjnej.",
                    en: "Serious legal breaches or publicly reported supervisory proceedings reinforce a perception of insufficient security and regulatory oversight. The company may lose its status as a trusted partner in areas requiring strict regulatory compliance."
                }
            },
            Operational: {
                green: {
                    pl: "Procesy związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz raportowaniem do organów nadzorczych funkcjonują zgodnie z przyjętymi procedurami. Kontrole wewnętrzne i zewnętrzne nie powodują zakłóceń w bieżącej działalności.",
                    en: "Processes related to anti-money laundering, customer identity verification, and reporting to supervisory authorities operate in line with established procedures. Internal and external audits do not disrupt day-to-day operations."
                },
                yellow: {
                    pl: "Pojawiają się dodatkowe zapytania ze strony organów nadzorczych lub konieczność częstszej aktualizacji procedur. Część działań projektowych lub wdrożeniowych musi zostać czasowo przesunięta, jednak organizacja utrzymuje kontrolę nad zgodnością.",
                    en: "Additional inquiries from supervisory authorities or more frequent procedural updates occur. Some project or implementation activities must be temporarily postponed, but compliance remains under control."
                },
                orange: {
                    pl: "Powtarzające się kontrole, korekty dokumentacji lub konieczność wdrażania nowych wymogów regulacyjnych powodują wstrzymanie wybranych projektów oraz ograniczenie prac rozwojowych. Organizacja koncentruje się głównie na dostosowaniu do wymogów prawnych, co istotnie ogranicza zdolność do planowego rozwoju usług finansowych.",
                    en: "Recurring inspections, documentation corrections, or implementation of new regulatory requirements lead to suspension of selected projects and reduced development work. The organization focuses primarily on regulatory adjustments, significantly limiting its ability to develop financial services as planned."
                },
                critical: {
                    pl: "Długotrwałe postępowania nadzorcze, decyzje administracyjne lub obowiązkowe działania naprawcze powodują, że działalność prowadzona jest pod stałym nadzorem regulacyjnym. Organizacja traci zdolność do swobodnego planowania nowych inicjatyw i funkcjonuje w trybie ciągłego dostosowywania się do wymogów organów nadzorczych.",
                    en: "Prolonged supervisory proceedings, administrative decisions, or mandatory corrective actions result in operations being conducted under constant regulatory oversight. The organization loses the ability to freely plan new initiatives and operates in continuous adjustment mode to supervisory requirements."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Umowy z operatorami płatności, bankami rozliczeniowymi oraz dostawcami technologii funkcjonują na przewidywalnych warunkach. Koszt przetwarzania transakcji pozostaje zgodny z założeniami, co pozwala utrzymać planowaną rentowność usług.",
                    en: "Agreements with payment operators, settlement banks, and technology providers operate under predictable terms. Transaction processing costs remain in line with assumptions, supporting planned service profitability."
                },
                yellow: {
                    pl: "Zmiany w cennikach partnerów zewnętrznych lub mniej korzystne warunki rozliczeń powodują wzrost kosztu jednostkowego transakcji. Część usług finansowych generuje niższy zysk niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Changes in external partners' pricing or less favorable settlement terms increase per-transaction costs. Some financial services generate lower profit than expected, although the business remains profitable."
                },
                orange: {
                    pl: "Powtarzające się podwyżki opłat ze strony operatorów płatności lub dostawców infrastruktury powodują trwałe obniżenie marży na wybranych usługach finansowych. Część produktów realizowana jest poniżej zakładanego poziomu rentowności, co wymusza renegocjację umów lub korektę cennika dla klientów.",
                    en: "Recurring fee increases from payment operators or infrastructure providers lead to a sustained decline in margins on selected financial services. Some products are delivered below the expected profitability level, forcing contract renegotiations or price adjustments for clients."
                },
                critical: {
                    pl: "Istotne podwyżki opłat, wypowiedzenie kluczowych umów lub niekorzystne zmiany warunków współpracy powodują, że znacząca część oferty realizowana jest poniżej progu rentowności. Firma zmuszona jest ograniczyć zakres usług, wycofać się z części segmentów rynku lub pilnie przebudować model współpracy z partnerami.",
                    en: "Significant fee increases, termination of key agreements, or unfavorable changes in cooperation terms result in a substantial part of the offering being delivered below the profitability threshold. The company is forced to reduce its service scope, withdraw from certain market segments, or urgently restructure its partnership model."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z operatorami płatności, bankami rozliczeniowymi oraz dostawcami technologii przebiega stabilnie i bez zakłóceń. Firma postrzegana jest jako przewidywalny partner funkcjonujący w uporządkowanym i trwałym ekosystemie finansowym.",
                    en: "Cooperation with payment operators, settlement banks, and technology providers remains stable and uninterrupted. The company is perceived as a predictable partner operating within a structured and reliable financial ecosystem."
                },
                yellow: {
                    pl: "Pojawiają się incydentalne nieporozumienia z partnerami technologicznymi lub opóźnienia w uzgodnieniach operacyjnych. Współpraca trwa, jednak wśród partnerów i instytucji współpracujących zaczynają pojawiać się pytania o długoterminową stabilność relacji.",
                    en: "Occasional misunderstandings with technology partners or delays in operational arrangements occur. Cooperation continues, but among partners and cooperating institutions questions begin to arise about the long-term stability of these relationships."
                },
                orange: {
                    pl: "Powtarzające się napięcia, publiczne sygnały o zmianach warunków współpracy lub częste zmiany partnerów technologicznych prowadzą do spadku zaufania do stabilności ekosystemu. Firma może przestać być postrzegana jako podmiot działający w przewidywalnym i trwałym układzie partnerskim.",
                    en: "Recurring tensions, public signals of changing cooperation terms, or frequent changes of technology partners reduce trust in the stability of the ecosystem. The company may cease to be perceived as operating within a predictable and durable partnership structure."
                },
                critical: {
                    pl: "Publiczne konflikty lub nagłe zerwania umów z kluczowymi partnerami finansowymi prowadzą do utrwalenia opinii o niestabilności relacji zewnętrznych. Firma może utracić status wiarygodnego uczestnika rynku, szczególnie w obszarach wymagających trwałych i długoterminowych partnerstw.",
                    en: "Public conflicts or abrupt termination of agreements with key financial partners reinforce a perception of unstable external relationships. The company may lose its status as a credible market participant, especially in areas requiring durable and longterm partnerships."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z operatorami płatności, bankami rozliczeniowymi oraz dostawcami infrastruktury przebiega bez zakłóceń. Integracje działają stabilnie, a przetwarzanie transakcji odbywa się zgodnie z przyjętymi parametrami czasowymi.",
                    en: "Cooperation with payment operators, settlement banks, and infrastructure providers remains uninterrupted. Integrations operate reliably, and transaction processing meets agreed time parameters."
                },
                yellow: {
                    pl: "Pojawiają się okresowe opóźnienia po stronie partnerów zewnętrznych lub czasowe ograniczenia dostępności wybranych usług. Część operacji wymaga ręcznej weryfikacji lub dodatkowych uzgodnień, jednak ciągłość przetwarzania zostaje zachowana.",
                    en: "Occasional delays on the side of external partners or temporary limitations in selected services occur. Some operations require manual verification or additional coordination, but overall processing continuity is maintained."
                },
                orange: {
                    pl: "Powtarzające się przerwy w działaniu systemów partnerów lub istotne ograniczenia integracyjne prowadzą do wstrzymania części transakcji lub wyłączenia wybranych funkcjonalności. Organizacja koncentruje się na obejściach technicznych i działaniach awaryjnych, co ogranicza możliwość planowego rozwoju usług.",
                    en: "Recurring outages in partner systems or significant integration constraints lead to suspension of selected transactions or disabling certain functionalities. The organization focuses on technical workarounds and emergency actions, limiting its ability to develop services as planned."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych partnerów rozliczeniowych lub zerwanie współpracy uniemożliwia przetwarzanie istotnej części operacji finansowych. Organizacja traci zdolność do zapewnienia regularnej obsługi transakcji i funkcjonuje w trybie stałego zarządzania kryzysowego.",
                    en: "Prolonged unavailability of key settlement partners or termination of cooperation makes it impossible to process a significant portion of financial operations. The organization loses the ability to ensure regular transaction handling and operates in continuous crisis management mode."
                }
            }
        }
    },
    services_other: {
        E: {
            Business: {
                green: {
                    pl: "Usługi realizowane są przy założonym poziomie wykorzystania zespołu i zasobów. Koszt wykonania zleceń pozostaje pod kontrolą, a zysk z realizowanych usług odpowiada poziomowi przyjętemu na etapie ofertowania.",
                    en: "Services are delivered with the planned level of team and resource utilization. Execution costs remain under control, and the profit from completed services aligns with the assumptions made during the sales stage."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji lub dodatkowe nakłady pracy powodują wzrost kosztu wykonania części zleceń. Zysk z wybranych usług zaczyna być niższy niż zakładano, jednak działalność pozostaje rentowna na poziomie całego portfela.",
                    en: "Extended delivery time or additional workload increases the execution cost of selected assignments. Profit from certain services becomes lower than initially assumed, although the overall service portfolio remains profitable."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia budżetów projektowych oraz niska efektywność wykorzystania zasobów prowadzą do realizacji części usług na minimalnej marży. Koszt utrzymania zespołu zaczyna przewyższać zysk z części zleceń, co wymusza ograniczenie zakresu przyjmowanych projektów.",
                    en: "Recurring budget overruns and low resource efficiency result in selected services being delivered at minimal margin. The cost of maintaining the team begins to exceed the profit generated by some assignments, forcing a reduction in the scope of accepted projects."
                },
                critical: {
                    pl: "Część usług realizowana jest poniżej progu rentowności, a przychody nie pokrywają pełnych kosztów zespołu i infrastruktury. Firma zmuszona jest ograniczyć skalę działalności, zrezygnować z nierentownych segmentów lub przeprowadzić restrukturyzację modelu operacyjnego.",
                    en: "A portion of services is delivered below the profitability threshold, and revenues no longer cover the full cost of the team and infrastructure. The company is forced to reduce its scale of operations, withdraw from unprofitable segments, or restructure its operating model."
                }
            },
            Reputation: {
                green: {
                    pl: "Usługi realizowane są terminowo i zgodnie z ustalonym zakresem. Klienci postrzegają firmę jako rzetelnego wykonawcę zapewniającego spójny i przewidywalny standard jakości.",
                    en: "Services are delivered on time and within the agreed scope. Clients perceive the company as a reliable provider ensuring a consistent and predictable quality standard."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia lub konieczność dodatkowych korekt zaczynają być zauważalne przez klientów. Wizerunek firmy jako w pełni przewidywalnego partnera ulega osłabieniu, choć zaufanie pozostaje zachowane.",
                    en: "Isolated delays or additional corrections begin to be noticed by clients. The image of the company as a fully predictable partner weakens, although overall trust remains intact."
                },
                orange: {
                    pl: "Powtarzające się problemy z dotrzymaniem zakresu lub jakości usług prowadzą do utraty części referencji i ograniczenia rekomendacji. Firma może przestać być postrzegana jako wykonawca gwarantujący stabilny i powtarzalny poziom realizacji.",
                    en: "Recurring issues with scope or service quality lead to the loss of selected references and reduced recommendations. The company may cease to be perceived as a provider ensuring stable and repeatable delivery standards."
                },
                critical: {
                    pl: "Utrwalona opinia o niestabilnej jakości usług prowadzi do trwałej utraty zaufania oraz ograniczenia dostępu do bardziej wymagających projektów. Firma może utracić pozycję preferowanego wykonawcy w swojej kategorii usług.",
                    en: "A sustained perception of unstable service quality leads to a lasting loss of trust and reduced access to more demanding projects. The company may lose its position as a preferred provider within its service category."
                }
            },
            Operational: {
                green: {
                    pl: "Usługi realizowane są zgodnie z harmonogramem, a obciążenie zespołu pozostaje na planowanym poziomie. Proces wykonawczy jest stabilny, a firma utrzymuje pełną kontrolę nad terminami i zakresem prac.",
                    en: "Services are delivered according to schedule, and team workload remains at the planned level. The execution process is stable, and the company maintains full control over deadlines and scope."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji wybranych zleceń oraz nierównomierne obciążenie zespołu powodują spadek części przepustowości. Konieczne stają się korekty harmonogramów, jednak organizacja zachowuje kontrolę nad realizacją usług.",
                    en: "Extended delivery time of selected assignments and uneven team workload reduce part of the operational capacity. Schedule adjustments become necessary, but the organization retains control over service execution."
                },
                orange: {
                    pl: "Powtarzające się opóźnienia oraz przeciążenie kluczowych zasobów prowadzą do wstrzymania przyjmowania nowych zleceń lub przesuwania rozpoczęcia kolejnych projektów. Plan realizacyjny ulega zaburzeniu, a organizacja koncentruje się na nadrabianiu zaległości zamiast na planowym rozwoju.",
                    en: "Recurring delays and overload of key resources lead to suspension of new assignments or postponement of upcoming projects. The execution plan becomes disrupted, and the organization focuses on clearing backlogs instead of planned development."
                },
                critical: {
                    pl: "Długotrwałe przeciążenie zasobów oraz brak stabilności procesu realizacyjnego powodują, że firma traci zdolność do przewidywalnego planowania nowych usług. Organizacja funkcjonuje w trybie stałego reagowania na opóźnienia, a harmonogram przestaje być wiarygodnym narzędziem zarządczym.",
                    en: "Prolonged resource overload and instability of the execution process cause the company to lose the ability to plan new services predictably. The organization operates in continuous reactive mode, and the schedule ceases to be a reliable management tool."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół pracuje w stabilnym składzie, a poziom wykorzystania czasu pracy odpowiada założeniom. Koszt utrzymania zespołu pozostaje adekwatny do generowanych przychodów z realizowanych usług.",
                    en: "The team operates with a stable structure, and time utilization remains in line with assumptions. The cost of maintaining the team is aligned with revenues generated from delivered services."
                },
                yellow: {
                    pl: "Zwiększona absencja, przeciążenie wybranych pracowników lub rotacja kadry powodują spadek efektywności części realizowanych usług. Koszt pracy zaczyna rosnąć szybciej niż przychody z wybranych zleceń, co obniża zysk z części kontraktów.",
                    en: "Increased absenteeism, overload of selected employees, or staff turnover reduce the efficiency of certain services. Labor costs begin to grow faster than revenues from selected assignments, lowering profit from part of the contracts."
                },
                orange: {
                    pl: "Utrata kluczowych pracowników lub trwałe niedobory kompetencyjne prowadzą do konieczności korzystania z droższych zastępstw lub nadgodzin. Koszt utrzymania zespołu zaczyna wyraźnie przewyższać zysk z części usług, co wymusza ograniczenie zakresu działalności lub podniesienie cen.",
                    en: "Loss of key employees or persistent skill shortages require more expensive replacements or overtime work. The cost of maintaining the team clearly exceeds profit from certain services, forcing a reduction in business scope or price adjustments."
                },
                critical: {
                    pl: "Trwała destabilizacja zespołu powoduje, że przychody z realizowanych usług nie pokrywają całkowitych kosztów zespołu. Firma zmuszona jest ograniczyć skalę działalności, zrezygnować z części usług lub przeprowadzić restrukturyzację zatrudnienia.",
                    en: "Persistent team instability results in service revenues no longer covering the total cost of the team. The company is forced to reduce its scale of operations, withdraw from selected services, or restructure employment."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół pracuje w stabilnym składzie, a kompetencje pracowników odpowiadają zakresowi realizowanych usług. Klienci postrzegają firmę jako partnera dysponującego doświadczonym i odpowiedzialnym zespołem.",
                    en: "The team operates with a stable structure, and employee competencies match the scope of delivered services. Clients perceive the company as a partner supported by an experienced and responsible team."
                },
                yellow: {
                    pl: "Rotacja pracowników lub czasowe braki kompetencyjne zaczynają być zauważalne przez klientów. Wizerunek firmy jako w pełni stabilnego partnera ulega osłabieniu, choć zaufanie do realizacji usług pozostaje zachowane.",
                    en: "Staff turnover or temporary skill gaps begin to be noticed by clients. The image of the company as a fully stable partner weakens, although trust in service delivery remains intact."
                },
                orange: {
                    pl: "Utrata kluczowych specjalistów lub powtarzające się zmiany w składzie zespołu powodują, że klienci zaczynają kwestionować stabilność personalną firmy. Decyzje o nowych projektach są odkładane do czasu potwierdzenia stałości zespołu, a firma może przestać być postrzegana jako stabilny partner wykonawczy.",
                    en: "Loss of key specialists or recurring team changes lead clients to question the company’s personnel stability. Decisions on new projects are postponed until team continuity is confirmed, and the company may cease to be perceived as a stable delivery partner."
                },
                critical: {
                    pl: "Utrwalona opinia o niestabilnym lub niedostatecznie doświadczonym zespole prowadzi do trwałej utraty zaufania oraz ograniczenia dostępu do bardziej wymagających projektów. Firma może utracić pozycję preferowanego partnera w swojej kategorii usług.",
                    en: "A sustained perception of an unstable or insufficiently experienced team leads to a lasting loss of trust and reduced access to more demanding projects. The company may lose its position as a preferred partner within its service category."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół pracuje w pełnym składzie, a kompetencje są dopasowane do realizowanych usług. Obciążenie pracą pozostaje na planowanym poziomie, co pozwala utrzymać stabilny rytm realizacji zleceń.",
                    en: "The team operates at full capacity, with competencies aligned to delivered services. Workload remains at the planned level, allowing for a stable execution rhythm."
                },
                yellow: {
                    pl: "Czasowa absencja pracowników lub nierównomierne obciążenie zespołu powodują wydłużenie realizacji części zleceń. Konieczne stają się korekty podziału zadań, jednak organizacja zachowuje kontrolę nad harmonogramem.",
                    en: "Temporary staff absences or uneven workload distribution extend the delivery time of selected assignments. Task redistribution becomes necessary, but the organization retains control over the schedule."
                },
                orange: {
                    pl: "Utrata kluczowych pracowników lub długotrwałe niedobory kadrowe prowadzą do przesuwania terminów oraz ograniczenia możliwości przyjmowania nowych zleceń. Plan pracy zespołu ulega zaburzeniu, a organizacja koncentruje się na bieżącym zabezpieczaniu realizacji zamiast na planowym rozwoju usług.",
                    en: "Loss of key employees or prolonged staffing shortages lead to deadline shifts and reduced ability to accept new assignments. The team’s work plan becomes disrupted, and the organization focuses on securing current deliveries rather than developing services as planned."
                },
                critical: {
                    pl: "Trwała destabilizacja zespołu powoduje brak możliwości przewidywalnego planowania pracy i realizacji nowych usług. Organizacja funkcjonuje w stałym trybie reagowania na braki kadrowe, a harmonogram przestaje być realnym narzędziem zarządzania.",
                    en: "Persistent team instability eliminates the ability to plan work and new services predictably. The organization operates in continuous reaction mode due to staffing gaps, and the schedule ceases to be a reliable management tool."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma realizuje usługi zgodnie z obowiązującymi przepisami oraz warunkami umów. Nie występują kary ani dodatkowe koszty związane z niezgodnością, a działalność prowadzona jest bez ryzyka finansowych konsekwencji regulacyjnych.",
                    en: "The company delivers services in compliance with applicable regulations and contractual terms. No penalties or additional costs related to non-compliance occur, and operations are conducted without regulatory financial risk."
                },
                yellow: {
                    pl: "Pojawiają się drobne niezgodności lub konieczność aktualizacji procedur. Wymaga to dodatkowych nakładów organizacyjnych i prawnych, co podnosi koszt prowadzenia działalności, jednak nie wpływa jeszcze istotnie na skalę usług.",
                    en: "Minor non-compliance issues or the need to update procedures arise. This requires additional organizational and legal effort, increasing operating costs, but it does not yet significantly affect the scale of services."
                },
                orange: {
                    pl: "Powtarzające się niezgodności lub brak pełnego dostosowania do wymogów prowadzą do nałożenia kar administracyjnych albo konieczności wdrożenia kosztownych zmian proceduralnych. Obciążenia te zaczynają ograniczać rentowność części usług i wymuszają ograniczenie zakresu działalności.",
                    en: "Recurring non-compliance or insufficient alignment with requirements leads to administrative penalties or the need to implement costly procedural changes. These burdens begin to limit the profitability of certain services and force a reduction in business scope."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub warunków umownych skutkują wysokimi karami finansowymi, odszkodowaniami lub ograniczeniem możliwości świadczenia części usług. W konsekwencji model działalności traci stabilność ekonomiczną i wymaga zasadniczej reorganizacji.",
                    en: "Serious breaches of regulations or contractual terms result in substantial financial penalties, compensation claims, or restrictions on providing certain services. As a result, the business model loses economic stability and requires fundamental reorganization."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma realizuje usługi zgodnie z obowiązującymi przepisami i warunkami umownymi. W otoczeniu rynkowym postrzegana jest jako stabilny i odpowiedzialny podmiot działający zgodnie z wymaganiami formalnymi.",
                    en: "The company delivers services in compliance with applicable regulations and contractual terms. In the market environment, it is perceived as a stable and responsible entity operating in line with formal requirements."
                },
                yellow: {
                    pl: "Pojedyncze niezgodności lub opóźnienia w aktualizacji dokumentacji zaczynają być zauważalne wśród partnerów i instytucji współpracujących. Wizerunek firmy jako w pełni uporządkowanego podmiotu ulega osłabieniu, choć zaufanie pozostaje zachowane.",
                    en: "Isolated compliance issues or delays in updating documentation begin to be noticed among partners and cooperating institutions. The image of the company as a fully structured entity weakens, although overall trust remains intact."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w zakresie zgodności prowadzą do zwiększonej uwagi ze strony partnerów lub instytucji nadzorczych, co buduje obraz firmy wymagającej dodatkowego nadzoru. Organizacja może przestać być postrzegana jako w pełni uporządkowany podmiot formalny, co ogranicza dostęp do bardziej wymagających współprac.",
                    en: "Recurring compliance deficiencies attract increased attention from partners or supervisory institutions, creating an image of a company requiring additional oversight. The organization may cease to be perceived as a fully structured and compliant entity, limiting access to more demanding collaborations."
                },
                critical: {
                    pl: "Utrwalona opinia o braku należytej staranności w zakresie zgodności prowadzi do trwałej utraty zaufania wśród partnerów i instytucji. Firma może zostać wykluczona z części współprac wymagających wysokiego poziomu nadzoru formalnego.",
                    en: "A sustained perception of insufficient due diligence in compliance leads to a lasting loss of trust among partners and institutions. The company may be excluded from collaborations requiring a high level of formal oversight."
                }
            },
            Operational: {
                green: {
                    pl: "Usługi realizowane są zgodnie z obowiązującymi przepisami i warunkami umownymi. Procedury formalne są aktualne, a wymagania regulacyjne nie wpływają na bieżącą realizację zleceń.",
                    en: "Services are delivered in compliance with applicable regulations and contractual terms. Formal procedures are up to date, and regulatory requirements do not affect ongoing service delivery."
                },
                yellow: {
                    pl: "Pojawiają się drobne niezgodności lub konieczność aktualizacji dokumentacji, co wymaga czasowego wstrzymania części działań projektowych lub wdrożeniowych. Realizacja usług jest możliwa, jednak wymaga dodatkowej koordynacji formalnej.",
                    en: "Minor compliance issues or the need to update documentation require temporary suspension of selected project or implementation activities. Service delivery continues but requires additional formal coordination."
                },
                orange: {
                    pl: "Powtarzające się uchybienia formalne lub brak wymaganych zgód prowadzą do czasowego wstrzymania wybranych usług. Harmonogram realizacji ulega zaburzeniu, a organizacja koncentruje się na usuwaniu niezgodności zamiast na planowym prowadzeniu działalności.",
                    en: "Recurring formal deficiencies or missing required approvals lead to temporary suspension of selected services. Delivery schedules become disrupted, and the organization focuses on resolving compliance gaps instead of conducting planned operations."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub warunków umownych skutkują formalnym zakazem realizacji części usług lub zawieszeniem działalności w określonym zakresie. Organizacja traci możliwość prowadzenia regularnej działalności i funkcjonuje w trybie stałego przywracania zgodności.",
                    en: "Serious breaches of regulations or contractual terms result in a formal prohibition of selected services or suspension of operations in a defined scope. The organization loses the ability to conduct regular activities and operates in continuous compliance restoration mode."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami i partnerami zewnętrznymi przebiega zgodnie z ustalonymi warunkami. Koszty usług zewnętrznych pozostają na założonym poziomie, a marża na realizowanych zleceniach jest zgodna z planem.",
                    en: "Cooperation with subcontractors and external partners proceeds according to agreed terms. External service costs remain at the planned level, and margins on delivered assignments align with expectations."
                },
                yellow: {
                    pl: "Podwyższenie stawek przez partnerów lub konieczność korzystania z dodatkowego wsparcia zewnętrznego powodują wzrost kosztu realizacji części usług. Zysk z wybranych zleceń zaczyna być niższy niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Rate increases by partners or the need for additional external support raise the execution cost of selected services. Profit from certain assignments becomes lower than initially assumed, although the business remains profitable overall."
                },
                orange: {
                    pl: "Powtarzające się wzrosty kosztów współpracy lub brak przewidywalności kosztów współpracy z partnerami zewnętrznymi prowadzą do realizacji części usług na minimalnej marży. Koszt współpracy zaczyna przewyższać zysk z wybranych projektów, co wymusza ograniczenie zakresu działalności lub rezygnację z mniej rentownych zleceń.",
                    en: "Recurring cost increases or lack of predictability in cooperation costs with external partners result in selected services being delivered at minimal margin. The cost of cooperation begins to exceed profit from certain projects, forcing a reduction in business scope or withdrawal from less profitable assignments."
                },
                critical: {
                    pl: "Trwały wzrost kosztów współpracy zewnętrznej lub ich nieprzewidywalność powodują, że realizacja usług przestaje być opłacalna w obecnym modelu. Firma zmuszona jest ograniczyć skalę działalności, zmienić strukturę dostawców lub zasadniczo przebudować model współpracy.",
                    en: "Persistent increases in external cooperation costs or their unpredictability make service delivery unprofitable under the current model. The company is forced to reduce its scale of operations, change its supplier structure, or fundamentally redesign its cooperation model."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z partnerami zewnętrznymi przebiega w sposób przewidywalny i zgodny z ustaleniami. Firma postrzegana jest jako rzetelny i stabilny podmiot, który odpowiedzialnie zarządza relacjami z dostawcami i podwykonawcami.",
                    en: "Cooperation with external partners proceeds in a predictable and agreed manner. The company is perceived as a reliable and stable entity that responsibly manages relationships with suppliers and subcontractors."
                },
                yellow: {
                    pl: "Pojedyncze napięcia we współpracy z partnerami zewnętrznymi zaczynają być zauważalne wśród partnerów i instytucji współpracujących. Firma nadal utrzymuje relacje biznesowe, jednak w otoczeniu pojawia się większa ostrożność w podejmowaniu nowych wspólnych projektów.",
                    en: "Isolated tensions in cooperation with external partners become noticeable among collaborating partners and institutions. The company continues its business relationships, but increased caution appears when initiating new joint projects."
                },
                orange: {
                    pl: "Powtarzające się trudności w relacjach z podwykonawcami lub partnerami outsourcingowymi zaczynają budować obraz firmy wymagającej dodatkowego nadzoru lub bardziej szczegółowych zabezpieczeń umownych. Ograniczeniu ulega skłonność partnerów do rekomendowania współpracy.",
                    en: "Recurring difficulties in relationships with subcontractors or outsourcing partners begin to create an image of a company requiring additional oversight or more detailed contractual safeguards. Partners become less inclined to recommend cooperation."
                },
                critical: {
                    pl: "Utrwalone konflikty, publiczne spory lub nagłe zerwania umów z kluczowymi partnerami prowadzą do trwałej utraty zaufania w relacjach zewnętrznych. Firma może być postrzegana jako podmiot wysokiego ryzyka współpracy, co znacząco ogranicza możliwość nawiązywania nowych partnerstw.",
                    en: "Persistent conflicts, public disputes, or sudden termination of agreements with key partners lead to lasting loss of trust in external relationships. The company may be perceived as a high-risk cooperation partner, significantly limiting opportunities to establish new partnerships."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z podwykonawcami i partnerami zewnętrznymi przebiega zgodnie z harmonogramem. Realizacja usług odbywa się bez zakłóceń, a firma zachowuje pełną kontrolę nad terminami i planowaniem prac.",
                    en: "Cooperation with subcontractors and external partners follows the agreed schedule. Service delivery proceeds without disruption, and the company maintains full control over timelines and work planning."
                },
                yellow: {
                    pl: "Opóźnienia lub ograniczona dostępność partnerów zewnętrznych powodują przesunięcia w realizacji części zleceń. Firma nadal wywiązuje się z zobowiązań, jednak planowanie prac wymaga dodatkowych korekt i większej koordynacji.",
                    en: "Delays or limited availability of external partners cause shifts in the execution of selected assignments. The company continues to meet its commitments, but work planning requires additional adjustments and coordination."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostępnością podwykonawców lub partnerów prowadzą do wstrzymania części prac lub konieczności zmiany zakresu usług. Harmonogramy stają się niestabilne, a utrzymanie ciągłości realizacji wymaga stałej interwencji zarządczej.",
                    en: "Recurring issues with the availability of subcontractors or partners lead to suspension of certain activities or changes in service scope. Schedules become unstable, and maintaining continuity requires constant managerial intervention."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych partnerów zewnętrznych uniemożliwia realizację istotnej części usług. Firma traci zdolność do planowania kolejnych projektów i działa w trybie reakcyjnym, koncentrując się na bieżącym zabezpieczeniu podstawowych zobowiązań.",
                    en: "Prolonged unavailability of key external partners makes it impossible to deliver a significant portion of services. The company loses the ability to plan future projects and operates in a reactive mode, focusing on safeguarding its most basic commitments."
                }
            }
        }
    }
};

module.exports = { INDUSTRY_TOP_RISKS };

},{}],11:[function(require,module,exports){
/**
 * Company Type-Specific Action Plan Comments
 *
 * Structure: companyType → horizon (30) → { pl, en }
 *
 * Company Types:
 * - MSP: Small/Medium enterprises (MŚP)
 * - SUPPLIER: Companies in supply chain
 * - LARGE: Large organizations
 */

const PLAN_COMMENTS = {
    MSP: {
        30: {
            pl: `Pierwsze 30 dni warto przeznaczyć na uporządkowanie podstaw działania firmy w obszarach, które dziś nie są jasno opisane lub mierzone.

W pierwszej kolejności:
- Zbierz w jednym miejscu dane dotyczące zużycia energii, paliwa i mediów.
- Spisz kto w firmie odpowiada za kluczowe obszary: finanse, ludzi, dostawców i dokumenty.
- Uporządkuj listę kluczowych dostawców i sprawdź, czy masz z nimi aktualne ustalenia.
- Ustal prosty schemat reagowania na sytuacje problemowe.

W praktyce oznacza to:
- Określ kto podejmuje decyzję w przypadku:
  - awarii sprzętu lub przestoju,
  - opóźnienia w realizacji zlecenia,
  - reklamacji lub skargi klienta,
  - problemu z dostawcą (brak towaru, zmiana warunków).
- Ustal maksymalny czas reakcji (np. 24h na kontakt z klientem).
- Zdefiniuj, kto informuje klienta i w jaki sposób.
- Spisz to w krótkiej, jedno- lub dwustronicowej instrukcji.
- Ustal zasadę dokumentowania takich sytuacji (np. prosty rejestr w Excelu).

Uporządkuj kluczowe dokumenty firmy w jednym, łatwo dostępnym miejscu:

1. Umowy i zobowiązania
- Umowy z kluczowymi klientami
- Umowy z dostawcami
- Umowy najmu / leasingu
- Kredyty, zobowiązania finansowe
- Ubezpieczenia
Sprawdź: czy są aktualne, kto je przechowuje, czy znasz ich kluczowe warunki (terminy, kary, wypowiedzenia).

2. Instrukcje i zasady wewnętrzne
- Zasady pracy i odpowiedzialności
- Instrukcje bezpieczeństwa
- Procedury reagowania na problemy
- Ustalenia dotyczące jakości lub obsługi klienta
Jeśli czegoś nie ma – zapisz to w prostej formie (1–2 strony wystarczą).

3. Dokumenty operacyjne
- Lista kluczowych dostawców
- Dane kontaktowe do osób decyzyjnych
- Harmonogramy kluczowych przeglądów lub płatności
- Dostępy do systemów i kont firmowych

4. Forma uporządkowania
- Jeden folder cyfrowy (np. w chmurze) z jasnym podziałem.
- Ograniczony dostęp tylko do osób odpowiedzialnych.
- Jedna osoba wskazana jako „właściciel porządku dokumentów".

Efekt po 30 dniach:
- Wiesz, jakie zobowiązania ma firma.
- W sytuacji problemowej nie szukasz dokumentów „po ludziach".
- Masz pełen obraz ustaleń z klientami i dostawcami.
- Firma jest gotowa na pytanie z zewnątrz bez chaosu.
- Firma reaguje według ustalonego schematu, a nie pod wpływem emocji.
- Problemy nie „rozlewają się" po organizacji i nie zaskakują przy powtórzeniu.`,

            en: `The first 30 days should be dedicated to organizing the company's operational foundations in areas that are currently not clearly described or measured.

As a first step:
- Gather in one place data on energy, fuel, and utility consumption.
- Identify who in the company is responsible for key areas: finance, people, suppliers, and documentation.
- Organize the list of key suppliers and verify whether your agreements with them are up to date.
- Establish a simple framework for responding to problematic situations.

In practice, this means:
- Define who makes decisions in the event of:
  - equipment failure or downtime,
  - delays in order execution,
  - customer complaints or claims,
  - supplier issues (lack of goods, change of terms).
- Set a maximum response time (e.g., 24 hours to contact the customer).
- Define who informs the customer and in what manner.
- Document this in a short, one- or two-page instruction.
- Establish a rule for documenting such situations (e.g., a simple register in Excel).

Organize the company's key documents in one easily accessible place:

1. Contracts and obligations
- Agreements with key customers
- Supplier contracts
- Lease / rental agreements
- Loans and financial liabilities
- Insurance policies
Verify: whether they are up to date, who stores them, whether you know their key terms (deadlines, penalties, termination clauses).

2. Internal instructions and policies
- Work and responsibility rules
- Safety instructions
- Problem response procedures
- Quality or customer service guidelines
If something is missing – write it down in a simple form (1–2 pages are enough).

3. Operational documents
- List of key suppliers
- Contact details of decision-makers
- Schedule of key inspections or payments
- Access credentials to company systems and accounts

4. Organization format
- One digital folder (e.g., in the cloud) with a clear structure.
- Limited access only to responsible persons.
- One designated person as the "owner" of document organization.

Result after 30 days:
- You know the company's obligations.
- In a problematic situation, you do not search for documents "through people."
- You have a full overview of agreements with customers and suppliers.
- The company is ready to answer external inquiries without chaos.
- The company reacts according to an established framework, not under the influence of emotions.
- Problems do not "spread" across the organization and do not come as a surprise when they recur.`
        }
    },

    SUPPLIER: {
        30: {
            pl: `Pierwsze 30 dni warto przeznaczyć na uporządkowanie informacji, które mogą być wymagane przez klientów biznesowych lub partnerów.

W pierwszej kolejności:

1. Zbierz dane, o które najczęściej pytają klienci
- zużycie energii i mediów,
- sposób doboru dostawców,
- zasady reagowania na problemy,
- informacje o bezpieczeństwie pracy.
Wszystkie dane powinny być dostępne w jednym miejscu.

2. Uporządkuj dokumenty potwierdzające sposób działania firmy
- aktualne umowy,
- procedury jakościowe,
- instrukcje bezpieczeństwa,
- zakresy odpowiedzialności.
Sprawdź, czy są spójne i aktualne.

3. Przeanalizuj zależność od kluczowych dostawców
- kto ma największy wpływ na Twoją terminowość,
- czy masz alternatywę,
- czy umowy jasno określają odpowiedzialność.

4. Ustal standard reakcji na zapytania klientów
- kto odpowiada,
- w jakim czasie,
- na jakiej podstawie (dane, dokumenty).

5. Sprawdź spójność informacji
To, co mówisz klientowi, powinno być zgodne z rzeczywistym sposobem działania firmy.

Efekt po 30 dniach:
Firma jest przygotowana na pytania kontrahentów i działa w sposób bardziej uporządkowany i przewidywalny.`,

            en: `The first 30 days should focus on organizing information that may be required by business clients or partners.

Start with:

1. Collect key operational data commonly requested by clients
- energy and utility consumption,
- supplier selection process,
- problem response procedures,
- workplace safety information.
All data should be available in one place.

2. Review and organize documents confirming how your company operates
- current contracts,
- quality procedures,
- safety instructions,
- responsibility assignments.
Check whether they are consistent and up to date.

3. Analyze dependence on critical suppliers
- who has the greatest impact on your timeliness,
- whether you have alternatives,
- whether contracts clearly define responsibilities.

4. Define a standard response process for client inquiries
- who responds,
- within what timeframe,
- based on what (data, documents).

5. Ensure consistency between declared practices and actual operations
What you tell clients should match how the company actually operates.

After 30 days:
The company should be more structured and ready to respond confidently to external requests.`
        }
    },

    LARGE: {
        30: {
            pl: `Pierwsze 30 dni powinny zostać przeznaczone na uporządkowanie odpowiedzialności i spójności działań w obszarze zrównoważonego rozwoju w całej organizacji.

1. Wyznacz właściciela obszaru
- Określ osobę lub komórkę odpowiedzialną za koordynację działań.
- Zdefiniuj zakres decyzyjny i raportowy.
- Ustal, kto zatwierdza kluczowe decyzje.
Bez jasnego właściciela działania pozostają rozproszone.

2. Zmapuj istniejące procedury
Zbierz informacje:
- jakie polityki już funkcjonują (HR, zakupy, jakość, środowisko),
- gdzie znajdują się procedury,
- kto za nie odpowiada,
- które są aktualne, a które wymagają przeglądu.
Celem nie jest tworzenie nowych dokumentów, tylko zrozumienie, co już działa.

3. Sprawdź przepływ informacji między działami
Zweryfikuj:
- czy dział zakupów wie, jakie są standardy współpracy,
- czy HR ma jasno określone zasady pracy i odpowiedzialności,
- czy dział operacyjny raportuje dane w jednolity sposób.
W dużej firmie największym problemem jest brak spójności, nie brak dokumentów.

4. Uporządkuj dane wyjściowe
Zidentyfikuj:
- jakie dane są już zbierane,
- w jakiej formie,
- kto je agreguje,
- czy są porównywalne między działami.
Na tym etapie nie chodzi o rozbudowane raportowanie. Chodzi o ustalenie punktu startowego.

5. Przygotuj wewnętrzną notę kierunkową
Krótki dokument (1–2 strony) określający:
- dlaczego firma porządkuje ten obszar,
- jakie są cele na najbliższe miesiące,
- kto odpowiada za realizację.
Dokument powinien zostać przekazany menedżerom, aby nadać działaniom wspólny kierunek.

Efekt po 30 dniach:
Organizacja:
- wie, kto odpowiada za koordynację,
- zna aktualny stan procedur,
- ma uporządkowaną strukturę odpowiedzialności,
- posiada punkt wyjścia do dalszej integracji działań.`,

            en: `The first 30 days should focus on structuring ownership, accountability, and alignment of sustainability-related activities across the organization.

In large companies, processes often already exist — the priority is ensuring consistency, clarity, and coordination.

1. Appoint a Clear Owner
- Designate a person or department responsible for coordination.
- Define decision-making and reporting authority.
- Clarify who approves key actions and policies.
Without a clearly assigned owner, initiatives remain fragmented and inconsistent.

2. Map Existing Policies and Procedures
Identify:
- which policies are already in place (HR, procurement, quality, environment, compliance),
- where documentation is stored,
- who is responsible for each area,
- which procedures are current and which require review.
The objective is not to create new documents, but to understand what already exists.

3. Review Cross-Department Information Flow
Verify:
- whether procurement applies consistent supplier standards,
- whether HR follows structured employment and working condition policies,
- whether operational teams report data in a unified format,
- whether management receives consolidated information.
In large organizations, inconsistency between departments is often the main challenge — not the absence of documentation.

4. Organize Baseline Data
Determine:
- what data is currently collected,
- in what format,
- who aggregates and reviews it,
- whether data is comparable across business units.
At this stage, the goal is not advanced reporting — but establishing a clear starting point.

5. Issue an Internal Directional Note
Prepare a short internal document (1–2 pages) outlining:
- why the company is structuring this area,
- what the priorities are for the next months,
- who is responsible for implementation.
This document should be shared with managers to provide alignment and a common direction.

Result After 30 Days:
The organization:
- has a clearly defined coordination structure,
- understands its current procedural landscape,
- has structured responsibility allocation,
- established a clear baseline for further integration.`
        }
    }
};

/**
 * Get plan comment for specific company type and horizon
 * @param {string} companyType - MSP, SUPPLIER, or LARGE
 * @param {number} horizon - 30
 * @param {string} lang - pl or en
 * @returns {string|null} Plan comment text
 */
function getPlanComment(companyType, horizon, lang = 'pl') {
    const type = companyType?.toUpperCase?.() || companyType;
    const h = parseInt(horizon);

    if (!PLAN_COMMENTS[type]) {
        console.warn(`Unknown company type: ${type}`);
        return null;
    }

    if (!PLAN_COMMENTS[type][h]) {
        console.warn(`Unknown horizon: ${h} for type ${type}`);
        return null;
    }

    return PLAN_COMMENTS[type][h][lang] || PLAN_COMMENTS[type][h]['en'];
}

/**
 * Get all plan comments for a company type
 * @param {string} companyType - MSP, SUPPLIER, or LARGE
 * @returns {Object|null} { 30: { pl, en } }
 */
function getPlanCommentsForType(companyType) {
    const type = companyType?.toUpperCase?.() || companyType;
    return PLAN_COMMENTS[type] || null;
}

module.exports = {
    PLAN_COMMENTS,
    getPlanComment,
    getPlanCommentsForType
};

},{}],12:[function(require,module,exports){
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

},{"./comments":1,"./core":2,"./feature-flags":3,"./thresholds":14}],13:[function(require,module,exports){
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

},{"./feature-flags":3,"./industry-lookup":7,"./relevance":12}],14:[function(require,module,exports){
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

},{"./feature-flags":3}],15:[function(require,module,exports){
/**
 * Vendor Template Export Module (Krok 5)
 * Export questionnaire structure for vendor/client integration
 */

const { FEATURE_FLAGS, VENDOR_EXPORT_VERSION } = require('./feature-flags');
const { QUESTIONS, EXTENDED_QUESTIONS_META } = require('./core');

/**
 * Vendor template namespace prefix
 * Used for external question ID mapping: TPL_{namespace}.{question_id}
 */
const VENDOR_TEMPLATE_NAMESPACE = 'ESGSYNC';

/**
 * Answer value mapping for export
 * Maps internal values to standardized export format
 */
const EXPORT_ANSWER_VALUES = {
    5: 'TAK',
    3: 'W_TRAKCIE',
    0: 'NIE',
    null: 'BRAK_DANYCH'
};

/**
 * Generate external question ID with namespace
 * Format: TPL_{namespace}.{question_id}
 *
 * @param {string} questionId - Internal question ID (e.g., 'e1', 'g3')
 * @param {string} namespace - Optional namespace override
 * @returns {string} External ID (e.g., 'TPL_ESGSYNC.e1')
 */
function getExternalQuestionId(questionId, namespace = VENDOR_TEMPLATE_NAMESPACE) {
    return `TPL_${namespace}.${questionId.toLowerCase()}`;
}

/**
 * Map internal answer value to export format
 *
 * @param {number|null} value - Internal answer value (5, 3, 0, null)
 * @returns {string} Export value (TAK, NIE, BRAK_DANYCH)
 */
function mapAnswerToExport(value) {
    if (value === null || value === undefined) {
        return EXPORT_ANSWER_VALUES[null];
    }
    return EXPORT_ANSWER_VALUES[value] || EXPORT_ANSWER_VALUES[null];
}

/**
 * Generate vendor template for questionnaire export
 * Exports CORE questions in standardized format for vendor integration
 *
 * @param {Object} options - Export options
 * @param {string} options.templateId - Template identifier
 * @param {boolean} options.includeExtended - Include EXTENDED questions
 * @param {string} options.namespace - Custom namespace
 * @returns {Object} Vendor template structure
 */
function generateVendorTemplate(options = {}) {
    if (!FEATURE_FLAGS.whatif_and_exports_enabled) {
        return {
            enabled: false,
            message: 'Vendor Template Export is disabled'
        };
    }

    const {
        templateId = `TPL_${Date.now()}`,
        includeExtended = false,
        namespace = VENDOR_TEMPLATE_NAMESPACE
    } = options;

    const questions = [];

    // Add CORE questions
    ['G', 'S', 'E', 'SC'].forEach(pillar => {
        QUESTIONS[pillar].forEach(qId => {
            questions.push({
                external_id: getExternalQuestionId(qId, namespace),
                internal_id: qId,
                pillar,
                type: 'CORE',
                allowed_values: ['TAK', 'NIE', 'BRAK_DANYCH']
            });
        });
    });

    // Add EXTENDED questions if requested
    if (includeExtended) {
        QUESTIONS.X.forEach(qId => {
            const meta = EXTENDED_QUESTIONS_META[qId];
            questions.push({
                external_id: getExternalQuestionId(qId, namespace),
                internal_id: qId,
                pillar: meta ? meta.pillar : 'X',
                type: 'EXTENDED',
                impact_type: meta ? meta.impact_type : 'none',
                allowed_values: ['TAK', 'NIE', 'BRAK_DANYCH']
            });
        });
    }

    return {
        enabled: true,
        version: VENDOR_EXPORT_VERSION,
        generatedAt: new Date().toISOString(),
        template: {
            id: templateId,
            namespace,
            format_version: '1.0',
            questions_count: questions.length,
            questions
        }
    };
}

/**
 * Export answers in vendor format
 * Converts internal answers to standardized export format
 *
 * @param {Object} answers - Internal answers { questionId: value }
 * @param {Object} options - Export options
 * @param {string} options.namespace - Custom namespace
 * @param {boolean} options.includeNulls - Include unanswered questions
 * @returns {Object} Exported answers
 */
function exportAnswersForVendor(answers, options = {}) {
    if (!FEATURE_FLAGS.whatif_and_exports_enabled) {
        return {
            enabled: false,
            message: 'Vendor Export is disabled'
        };
    }

    const {
        namespace = VENDOR_TEMPLATE_NAMESPACE,
        includeNulls = true
    } = options;

    const exportedAnswers = [];
    const allQuestions = [
        ...QUESTIONS.G,
        ...QUESTIONS.S,
        ...QUESTIONS.E,
        ...QUESTIONS.SC
    ];

    allQuestions.forEach(qId => {
        const value = answers[qId];
        const exportValue = mapAnswerToExport(value);

        if (includeNulls || exportValue !== 'BRAK_DANYCH') {
            exportedAnswers.push({
                external_id: getExternalQuestionId(qId, namespace),
                internal_id: qId,
                value: exportValue
            });
        }
    });

    return {
        enabled: true,
        version: VENDOR_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        namespace,
        answers_count: exportedAnswers.length,
        answers: exportedAnswers
    };
}

/**
 * Import answers from vendor format
 * Converts vendor export format back to internal answers
 *
 * @param {Array} vendorAnswers - Array of { external_id, value }
 * @param {Object} options - Import options
 * @param {string} options.namespace - Expected namespace
 * @returns {Object} { answers, imported, skipped, errors }
 */
function importAnswersFromVendor(vendorAnswers, options = {}) {
    if (!FEATURE_FLAGS.whatif_and_exports_enabled) {
        return {
            enabled: false,
            message: 'Vendor Import is disabled'
        };
    }

    const { namespace = VENDOR_TEMPLATE_NAMESPACE } = options;
    const prefix = `TPL_${namespace}.`;

    const answers = {};
    const imported = [];
    const skipped = [];
    const errors = [];

    const valueMap = {
        'TAK': 5,
        'NIE': 0,
        'BRAK_DANYCH': null,
        'W_TRAKCIE': 3
    };

    vendorAnswers.forEach(item => {
        const { external_id, value } = item;

        // Validate namespace
        if (!external_id.startsWith(prefix)) {
            skipped.push({ external_id, reason: 'wrong_namespace' });
            return;
        }

        // Extract internal ID
        const internalId = external_id.substring(prefix.length);

        // Validate question exists
        const allQuestions = [
            ...QUESTIONS.G, ...QUESTIONS.S,
            ...QUESTIONS.E, ...QUESTIONS.SC, ...QUESTIONS.X
        ];
        if (!allQuestions.includes(internalId)) {
            errors.push({ external_id, reason: 'unknown_question' });
            return;
        }

        // Map value
        const mappedValue = valueMap[value];
        if (mappedValue === undefined) {
            errors.push({ external_id, reason: 'invalid_value', value });
            return;
        }

        answers[internalId] = mappedValue;
        imported.push({ external_id, internal_id: internalId, value: mappedValue });
    });

    return {
        enabled: true,
        version: VENDOR_EXPORT_VERSION,
        importedAt: new Date().toISOString(),
        answers,
        summary: {
            imported: imported.length,
            skipped: skipped.length,
            errors: errors.length
        },
        details: { imported, skipped, errors }
    };
}

module.exports = {
    VENDOR_TEMPLATE_NAMESPACE,
    EXPORT_ANSWER_VALUES,
    getExternalQuestionId,
    mapAnswerToExport,
    generateVendorTemplate,
    exportAnswersForVendor,
    importAnswersFromVendor
};

},{"./core":2,"./feature-flags":3}]},{},[5])(5)
});
