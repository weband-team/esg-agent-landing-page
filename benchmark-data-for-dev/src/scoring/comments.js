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
