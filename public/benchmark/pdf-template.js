/**
 * PDF Template Generator for ESG Assessment
 * This file contains the HTML template generation logic for PDF creation
 */

/**
 * Version constants for tracking calculation logic changes
 */
const ESG_ENGINE_VERSION = '1.0.0';  // Version of scoring/calculation engine
const ESG_CORE_VERSION = '1.0.0';    // Version of core question set

/**
 * Maps new 4-level system to old 3-level for backward compatibility with content
 * NEW levels: critical (0-30), elevated (31-50), moderate (51-80), good (81-100)
 * OLD levels: low, medium, high
 * @param {string} newLevel - New 4-state level
 * @returns {string} Old 3-state level for content compatibility
 */
function mapLevelToContent(newLevel) {
    const mapping = {
        'critical': 'low',     // 0-30 → low
        'elevated': 'low',     // 31-50 → low (conservative mapping)
        'moderate': 'medium',  // 51-80 → medium
        'good': 'high'         // 81-100 → high
    };
    return mapping[newLevel] || 'medium';
}

/**
 * Determines ESG level based on score percentage
 * NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
 * Thresholds: 81/51/31
 * @param {number} percent - ESG score percentage
 * @returns {string} ESG level ('critical', 'elevated', 'moderate', 'good')
 */
function getEsgLevel(percent) {
    if (percent >= 81) return 'good';       // 81-100: DOBRY
    if (percent >= 51) return 'moderate';   // 51-80: UMIARKOWANY
    if (percent >= 31) return 'elevated';   // 31-50: PODWYŻSZONE RYZYKO
    return 'critical';                       // 0-30: KRYTYCZNY
}

/**
 * Gets color and emoji for a state (green/yellow/orange/critical)
 * Used for TOP 3-based ES state
 * @param {string} state - State from TOP 3 ('green', 'yellow', 'orange', 'critical')
 * @returns {Object} Object with color and emoji
 */
function getColorAndEmojiForState(state) {
    const stateMap = {
        'green': { color: '#22c55e', emoji: '🟢' },
        'yellow': { color: '#eab308', emoji: '🟡' },
        'orange': { color: '#f97316', emoji: '🟠' },  // Orange distinct from yellow for better visual differentiation
        'critical': { color: '#ef4444', emoji: '🔴' }
    };
    return stateMap[state] || stateMap['green'];
}

/**
 * Gets color and risk level for ESG score
 * NEW: Uses TOP 3 state if available (per TOP 3 spec p. 3)
 * Falls back to percent-based calculation if TOP 3 not available
 * @param {number} percent - ESG score percentage (0-100)
 * @param {Object} relevance - Optional relevance object with executive.state from TOP 3
 * @returns {Object} Object with color, riskLevel, riskLabel, state, and emoji
 */
function getEsgScoreColorAndRisk(percent, relevance = null) {
    // Determine state from percent
    let percentState;
    if (percent >= 81) {
        percentState = 'green';
    } else if (percent >= 51) {
        percentState = 'yellow';
    } else if (percent >= 31) {
        percentState = 'orange';
    } else {
        percentState = 'critical';
    }

    // CRITICAL: Use TOP 3 state if available, but never show better than percent state
    let finalState = percentState;
    if (relevance && relevance.executive && relevance.executive.state && relevance.executive.source === 'TOP3') {
        const top3State = relevance.executive.state;

        // State severity ranking (worse is higher)
        const stateSeverity = {
            'green': 1,
            'yellow': 2,
            'orange': 3,
            'critical': 4
        };

        // Use the worse of the two states
        if (stateSeverity[top3State] > stateSeverity[percentState]) {
            finalState = top3State;
        }
    }

    const state = finalState;
    const colorEmoji = getColorAndEmojiForState(state);

    // Map state to risk level and labels
    const stateConfig = {
        'green': {
            riskLevel: 'low',
            riskLabel: { pl: 'niski', en: 'low' },
            stateLabel: { pl: 'Dobry', en: 'Good' }
        },
        'yellow': {
            riskLevel: 'moderate',
            riskLabel: { pl: 'umiarkowany', en: 'moderate' },
            stateLabel: { pl: 'Umiarkowany', en: 'Moderate' }
        },
        'orange': {
            riskLevel: 'elevated',
            riskLabel: { pl: 'podwyższony', en: 'elevated' },
            stateLabel: { pl: 'Podwyższone ryzyko', en: 'Elevated Risk' }
        },  // Note: orange state now displays with yellow color per color scheme requirements
        'critical': {
            riskLevel: 'critical',
            riskLabel: { pl: 'krytyczny', en: 'critical' },
            stateLabel: { pl: 'Krytyczny', en: 'Critical' }
        }
    };

    const config = stateConfig[state] || stateConfig['green'];
    return {
        color: colorEmoji.color,
        emoji: colorEmoji.emoji,
        riskLevel: config.riskLevel,
        riskLabel: config.riskLabel,
        state: state.toUpperCase(),
        stateCode: state,  // lowercase state code for logic
        stateLabel: config.stateLabel
    };

    // Fallback: Use percent-based calculation (old logic)
    if (percent >= 81) {
        // DOBRY (Good) - Green
        return {
            color: '#22c55e',
            emoji: '🟢',
            riskLevel: 'low',
            riskLabel: { pl: 'niski', en: 'low' },
            state: 'DOBRY',
            stateCode: 'green',
            stateLabel: { pl: 'Dobry', en: 'Good' }
        };
    } else if (percent >= 51) {
        // UMIARKOWANY (Moderate) - Yellow
        return {
            color: '#eab308',
            emoji: '🟡',
            riskLevel: 'moderate',
            riskLabel: { pl: 'umiarkowany', en: 'moderate' },
            state: 'UMIARKOWANY',
            stateCode: 'yellow',
            stateLabel: { pl: 'Umiarkowany', en: 'Moderate' }
        };
    } else if (percent >= 31) {
        // PODWYŻSZONE RYZYKO (Elevated Risk) - Orange
        return {
            color: '#f97316',
            emoji: '🟠',
            riskLevel: 'elevated',
            riskLabel: { pl: 'podwyższony', en: 'elevated' },
            state: 'PODWYZSZONE_RYZYKO',
            stateCode: 'orange',
            stateLabel: { pl: 'Podwyższone ryzyko', en: 'Elevated Risk' }
        };
    } else {
        // KRYTYCZNY (Critical) - Red
        return {
            color: '#ef4444',
            emoji: '🔴',
            riskLevel: 'critical',
            riskLabel: { pl: 'krytyczny', en: 'critical' },
            state: 'KRYTYCZNY',
            stateCode: 'critical',
            stateLabel: { pl: 'Krytyczny', en: 'Critical' }
        };
    }
}

/**
 * Determines company type from clientDetails for PLAN comments
 * Types: MSP (micro/small/medium), SUPPLIER, LARGE
 * @param {Object} clientDetails - Client details object
 * @returns {string} Company type code ('MSP', 'SUPPLIER', or 'LARGE')
 */
function getCompanyType(clientDetails) {
    // If company type is explicitly provided, use it
    if (clientDetails?.companyType) {
        const type = clientDetails.companyType.toUpperCase();
        if (['MSP', 'SUPPLIER', 'LARGE'].includes(type)) {
            return type;
        }
    }

    // Determine from employees count
    const employees = clientDetails?.employees;
    if (typeof employees === 'string') {
        // Parse employee ranges like "50-249", "250+", "1-49"
        const match = employees.match(/(\d+)/);
        if (match) {
            const count = parseInt(match[1]);
            if (count >= 250) return 'LARGE';
            if (count >= 50) return 'MSP';  // Medium
            return 'MSP';  // Small/Micro
        }
    } else if (typeof employees === 'number') {
        if (employees >= 250) return 'LARGE';
        return 'MSP';
    }

    // Default to MSP for unknown/small companies
    return 'MSP';
}

/**
 * Gets PLAN comment for specific company type and horizon
 * @param {string} companyType - MSP, SUPPLIER, or LARGE
 * @param {number} horizon - 30
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Plan comment text or empty string
 */
function getPlanCommentForType(companyType, horizon, language) {
    if (typeof ESGScoring !== 'undefined' && ESGScoring.getPlanComment) {
        return ESGScoring.getPlanComment(companyType, horizon, language) || '';
    }
    return '';
}

/**
 * Maps ESG level to state color for financial impact
 * @param {string} esgLevel - ESG level ('good', 'moderate', 'elevated', 'critical')
 * @returns {string} State color ('green', 'yellow', 'orange', 'critical')
 */
function mapLevelToState(esgLevel) {
    const mapping = {
        'good': 'green',
        'moderate': 'yellow',
        'elevated': 'orange',
        'critical': 'critical'
    };
    return mapping[esgLevel] || 'yellow';
}

/**
 * Generates financial impact HTML section for PDF
 * @param {string} revenueRange - Revenue range from clientDetails
 * @param {string} state - ESG state ('green', 'yellow', 'orange', 'critical')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} HTML string for financial impact section
 */
function generateFinancialImpactSection(revenueRange, state, language) {
    if (!revenueRange || !state) return '';

    // Normalize Polish EUR revenue ranges to English EUR range keys so ESGScoring.getFinancialImpact parses them correctly
    let normalizedRevenue = revenueRange;
    if (typeof revenueRange === 'string') {
        const cleaned = revenueRange.replace(/\s+/g, ' ').trim();
        // Replace en-dash with standard hyphen if needed, or handle both
        const unified = cleaned.replace(/–/g, '-');
        if (unified === '< 1 mln EUR' || unified.includes('< 1 mln') || unified.includes('< 1m')) {
            normalizedRevenue = '< 1M EUR';
        } else if (unified === '1-10 mln EUR' || unified.includes('1-10 mln') || unified.includes('1-10m')) {
            normalizedRevenue = '1–10M EUR'; // uses en-dash
        } else if (unified === '10-50 mln EUR' || unified.includes('10-50 mln') || unified.includes('10-50m')) {
            normalizedRevenue = '10–50M EUR'; // uses en-dash
        } else if (unified === '50-100 mln EUR' || unified.includes('50-100 mln') || unified.includes('50-100m')) {
            normalizedRevenue = '50–100M EUR'; // uses en-dash
        } else if (unified === '100-250 mln EUR' || unified.includes('100-250 mln') || unified.includes('100-250m')) {
            normalizedRevenue = '100–250M EUR'; // uses en-dash
        } else if (unified === 'powyżej 250 mln EUR' || unified.includes('250 mln EUR') || unified.includes('powyżej 250') || unified.includes('250m')) {
            normalizedRevenue = '250M EUR+';
        }
    }

    if (typeof ESGScoring !== 'undefined' && ESGScoring.getFinancialImpact) {
        const impact = ESGScoring.getFinancialImpact(normalizedRevenue, state, language);

        if (!impact) return '';

        const title = language === 'pl' ? 'Potencjalny wpływ finansowy' : 'Potential Financial Impact';
        const rangeLabel = language === 'pl' ? 'Potencjalny zakres finansowy' : 'Potential financial scope';

        return `
            <div style="margin-top: 25px; padding: 20px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                <div style="font-weight: bold; color: #475569; margin-bottom: 12px; font-size: 16px;">💰 ${title}</div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                    ${impact.text}
                </p>
                <div style="background: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
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
    return '';
}

/**
 * Gets explanation text for ESG score based on color zone
 * NEW: Uses methodology-based comments from COMMENT_TEXTS.EXECUTIVE_SUMMARY
 * @param {number} percent - ESG score percentage (0-100)
 * @param {string} language - Language code ('pl' or 'en')
 * @param {Object} relevance - Relevance object (optional, contains TOP3 state)
 * @returns {string} Explanation text for the score
 */
function getEsgScoreExplanation(percent, language, relevance = null) {
    // Try to use new methodology-based comments if ESGScoring is available
    if (typeof ESGScoring !== 'undefined' && ESGScoring.getCommentText) {
        // Determine state from percent
        const percentState = ESGScoring.getExecutiveSummaryState(percent);

        // Use worse of TOP3 state and percent state
        let state = percentState;
        if (relevance && relevance.executive && relevance.executive.state && relevance.executive.source === 'TOP3') {
            const top3State = relevance.executive.state;
            const stateSeverity = { 'green': 1, 'yellow': 2, 'orange': 3, 'critical': 4 };
            if (stateSeverity[top3State] > stateSeverity[percentState]) {
                state = top3State;
            }
        }

        const text = ESGScoring.getCommentText('EXECUTIVE_SUMMARY', state, language);
        if (text) return text;
    }

    // Fallback to original texts
    const isPolish = language === 'pl';

    if (percent >= 81) {
        // DOBRY (Good) - Green zone (81-100)
        return isPolish
            ? 'Twoja firma jest w dobrej kondycji i działa w sposób przewidywalny. Widać, że kluczowe obszary są opisane i spójne, dzięki czemu rozmowy z klientami i partnerami zwykle przebiegają bez napięć i zbędnych wyjaśnień. Ryzyka, które pojawiają się w tym momencie, są naturalne dla skali Twojego biznesu i pozostają pod kontrolą. Nie blokują działań ani decyzji - raczej wskazują miejsca, które warto mieć na oku.'
            : 'Your company is in good condition and operates predictably. Key areas are documented and consistent, which means conversations with clients and partners typically proceed without tension or unnecessary explanations. The risks that appear at this stage are natural for your business scale and remain under control.';
    } else if (percent >= 51) {
        // UMIARKOWANY (Moderate) - Yellow zone (51-80)
        return isPolish
            ? 'Twoja firma funkcjonuje stabilnie, ale nie wszystkie elementy są jeszcze jednakowo czytelne dla otoczenia. Część obszarów jest dobrze opisana, inne działają bardziej "z rozpędu" niż na jasno ustalonych zasadach. Pojawiające się ryzyka nie są alarmujące, ale mogą powodować dodatkowe pytania lub drobne opóźnienia w rozmowach biznesowych.'
            : 'Your company operates stably, but not all elements are equally clear to external stakeholders yet. Some areas are well documented, others operate more "by momentum" than on clearly established rules. Emerging risks are not alarming, but may cause additional questions or minor delays in business conversations.';
    } else if (percent >= 31) {
        // PODWYŻSZONE RYZYKO (Elevated Risk) - Orange zone (31-50)
        return isPolish
            ? 'Twoja firma działa i ma realną wartość, ale część informacji nie jest dziś wystarczająco jasna dla osób z zewnątrz. To powoduje, że rozmowy mogą się przeciągać, a decyzje po drugiej stronie zapadają wolniej. Ryzyka w tym momencie zaczynają mieć znaczenie operacyjne.'
            : 'Your company operates and has real value, but some information is not clear enough today for external parties. This causes conversations to drag on and decisions on the other side to be made more slowly. Risks at this point begin to have operational significance.';
    } else {
        // KRYTYCZNY (Critical) - Red zone (0-30)
        return isPolish
            ? 'Na tym etapie Twoja firma jest trudna do odczytania dla klientów, instytucji lub partnerów. Nie chodzi o brak kompetencji, ale o brak jasnych punktów odniesienia, które pozwalają innym podjąć decyzje. Ryzyka nie są tu abstrakcyjne - mogą realnie blokować rozmowy, finansowanie albo podpisywanie umów.'
            : 'At this stage, your company is difficult to read for clients, institutions, or partners. It is not about lack of competence, but about lack of clear reference points that allow others to make decisions. Risks here are not abstract - they can actually block conversations, financing, or signing contracts.';
    }
}

/**
 * Gets risk narrative text based on state (inherited from exec_summary)
 * Per Page 1 spec: risks section inherits state_id from exec_summary
 * NEW: Uses methodology-based comments from COMMENT_TEXTS.RISKS
 * @param {number} percent - ESG score percentage (0-100)
 * @param {string} language - Language code ('pl' or 'en')
 * @param {Object} relevance - Relevance object (optional, contains TOP3 state)
 * @returns {Object} Object with title and text for risks section
 */
function getRiskNarrative(percent, language, relevance = null) {
    const isPolish = language === 'pl';
    const title = isPolish ? 'Ryzyko ESG' : 'ESG Risk';

    // Determine state from percent
    let percentState;
    if (percent >= 81) {
        percentState = 'green';
    } else if (percent >= 51) {
        percentState = 'yellow';
    } else if (percent >= 31) {
        percentState = 'orange';
    } else {
        percentState = 'critical';
    }

    // Use worse of TOP3 state and percent state
    let state = percentState;
    if (relevance && relevance.executive && relevance.executive.state && relevance.executive.source === 'TOP3') {
        const top3State = relevance.executive.state;
        const stateSeverity = { 'green': 1, 'yellow': 2, 'orange': 3, 'critical': 4 };
        if (stateSeverity[top3State] > stateSeverity[percentState]) {
            state = top3State;
        }
    }

    const colorEmoji = getColorAndEmojiForState(state);
    const emoji = colorEmoji.emoji;

    // Map state to risk label
    const riskLabels = {
        'green': isPolish ? 'Niskie ryzyko' : 'Low risk',
        'yellow': isPolish ? 'Umiarkowane ryzyko' : 'Moderate risk',
        'orange': isPolish ? 'Podwyższone ryzyko' : 'Elevated risk',
        'critical': isPolish ? 'Krytyczne ryzyko' : 'Critical risk'
    };
    const label = riskLabels[state] || (isPolish ? 'Niskie ryzyko' : 'Low risk');

    // Try to use new methodology-based comments if ESGScoring is available
    let text = '';
    if (typeof ESGScoring !== 'undefined' && ESGScoring.getCommentText) {
        text = ESGScoring.getCommentText('RISKS', state, language);
    }

    // Fallback texts if ESGScoring not available
    if (!text) {
        if (state === 'green') {
            text = isPolish
                ? 'Ryzyka wynikają głównie z naturalnej złożoności działalności i zmieniających się oczekiwań rynku. Na tym etapie nie wpływają one negatywnie na codzienne funkcjonowanie firmy. Masz przestrzeń, żeby reagować spokojnie i z wyprzedzeniem.'
                : 'Risks arise mainly from the natural complexity of operations and changing market expectations. At this stage, they do not negatively affect the company\'s daily functioning. You have space to react calmly and in advance.';
        } else if (state === 'yellow') {
            text = isPolish
                ? 'Ryzyka pojawiają się tam, gdzie informacje nie są jeszcze w pełni spójne lub jednoznaczne. Nie blokują działań, ale mogą generować dodatkowe pytania lub wydłużać procesy. Ich identyfikacja pozwala Ci zdecydować, co doprecyzować w pierwszej kolejności.'
                : 'Risks appear where information is not yet fully consistent or unambiguous. They do not block actions but may generate additional questions or lengthen processes. Their identification allows you to decide what to clarify first.';
        } else if (state === 'orange') {
            text = isPolish
                ? 'Ryzyka wynikają głównie z braków w czytelności i powtarzalności informacji. Zaczynają wpływać na tempo rozmów i decyzji po stronie klientów lub partnerów. Działania naprawcze są możliwe i jasno wskazane w raporcie.'
                : 'Risks arise mainly from gaps in clarity and repeatability of information. They begin to affect the pace of conversations and decisions on the part of clients or partners. Corrective actions are possible and clearly indicated in the report.';
        } else {
            text = isPolish
                ? 'Ryzyka mają charakter blokujący - utrudniają przechodzenie do kolejnych etapów rozmów. Nie wynikają z jednego błędu, ale z nagromadzenia niejasności. Uporządkowanie kluczowych obszarów znacząco zmniejsza ten efekt.'
                : 'Risks are blocking in nature - they hinder progression to further stages of conversations. They do not result from a single error but from accumulated ambiguities. Organizing key areas significantly reduces this effect.';
        }
    }

    return { title, emoji, label, text };
}

/**
 * Generates TOP risk areas display
 * Per TOP 3 spec (PDF p. 3-5): System always calculates TOP 3 but displays:
 * - Green ES -> shows TOP 3
 * - Yellow ES -> shows TOP 2
 * - Orange/Red ES -> shows TOP 1
 *
 * Each area shows: horizon (30 days) and 3 parallel risk comments
 * (business, reputation, operational). All inherit color/emoji from ES.
 *
 * @param {Object} relevance - Relevance object from scores.relevance
 * @param {string} language - Language code ('pl' or 'en')
 * @param {string} esColor - ES color (for visual consistency)
 * @param {string} esEmoji - ES emoji (for visual consistency)
 * @returns {string} HTML string for TOP display
 */
function generateTop3Display(relevance, language, esColor, esEmoji, clientDetails = {}) {
    // Check if TOP 3 data is available
    if (!relevance || !relevance.top3Areas || relevance.top3Areas.length === 0) {
        return '';  // No TOP 3 data, return empty string
    }

    const isPolish = language === 'pl';

    // Task #3 from Korekta.pdf: Get industry for risk introductions
    const industry = clientDetails?.industry || '';

    // Map industry to industry code for Task #7 (horizon examples)
    const industryCodeMapping = {
        // English names
        'Construction': 'construction',
        'Energy': 'energy_resources',
        'Fintech': 'finance_fintech',
        'Retail': 'retail_trade',
        'IT / Software': 'it_software',
        'IT': 'it_software',
        'Software': 'it_software',
        'Logistics': 'logistics_transport',
        'Transport': 'logistics_transport',
        'Manufacturing': 'industrial_production',
        'Services': 'services_other',
        // Polish names (exact match from survey dropdown)
        'Budownictwo': 'construction',
        'Energetyka i surowce': 'energy_resources',
        'Produkcja przemysłowa': 'industrial_production',
        'Logistyka i transport': 'logistics_transport',
        'Handel i detalika': 'retail_trade',
        'IT i oprogramowanie': 'it_software',
        'Finanse (w tym fintech)': 'finance_fintech',
        'Usługi (inne)': 'services_other',
        // Legacy Polish names (for backwards compatibility)
        'Energetyka': 'energy_resources',
        'Fintech': 'finance_fintech',
        'Handel i detal': 'retail_trade',
        'Handel (retail)': 'retail_trade',
        'IT / Oprogramowanie': 'it_software',
        'Logistyka': 'logistics_transport',
        'Transport': 'logistics_transport',
        'Produkcja': 'industrial_production',
        'Usługi': 'services_other'
    };
    const industryCode = industryCodeMapping[industry] || 'services_other';

    // Get ES state for determining display count
    const esState = relevance.executive ? relevance.executive.state : 'green';

    // Determine how many TOP areas to display based on ES state
    // Per spec: green -> 3, yellow -> 2, orange/critical -> 1
    const displayCountMap = {
        'green': 3,
        'yellow': 2,
        'orange': 1,
        'critical': 1
    };
    const displayCount = displayCountMap[esState] || 1;

    // Use displayedTop3Areas if available, otherwise filter top3Areas
    const top3Areas = relevance.displayedTop3Areas
        ? relevance.displayedTop3Areas
        : relevance.top3Areas.slice(0, displayCount);

    // Area name translations
    const areaNames = {
        E: isPolish ? 'Środowisko (E)' : 'Environment (E)',
        S: isPolish ? 'Społeczeństwo (S)' : 'Social (S)',
        G: isPolish ? 'Zarządzanie (G)' : 'Governance (G)',
        SC: isPolish ? 'Łańcuch dostaw (SC)' : 'Supply Chain (SC)'
    };

    // Timeline label translations
    const timelineLabels = {
        30: isPolish ? '30 dni' : '30 days'
    };

    // Risk type labels
    const riskTypeLabels = {
        business: isPolish ? 'Ryzyko biznesowe' : 'Business Risk',
        reputation: isPolish ? 'Ryzyko reputacyjne' : 'Reputation Risk',
        operational: isPolish ? 'Ryzyko operacyjne' : 'Operational Risk'
    };

    // Helper function to format questions in text as a list
    const formatQuestionsAsList = (text) => {
        if (!text) return text;

        // Find questions in quotes: „Question?" or "Question?"
        const questionPattern = /[„""]([^"„"]+\?)["""](?:,\s*)?/g;
        const questions = [];
        let match;

        while ((match = questionPattern.exec(text)) !== null) {
            questions.push(match[1].trim());
        }

        // If we found questions, replace them with a list
        if (questions.length > 1) {
            // Remove all quoted questions from text
            let formattedText = text.replace(questionPattern, '').trim();

            // Clean up extra punctuation and spaces
            formattedText = formattedText.replace(/[,;]\s*$/, '').replace(/\s{2,}/g, ' ').trim();

            // Add questions as list without bullets
            const questionsList = '<ul style="margin: 8px 0 0 0; padding-left: 0; list-style-type: none;">' +
                questions.map(q => '<li style="margin-bottom: 4px;">' + q + '</li>').join('') +
                '</ul>';

            return formattedText + questionsList;
        }

        return text;
    };

    // Helper to get horizon comment
    const getHorizonComment = (horizon) => {
        if (typeof ESGScoring !== 'undefined' && ESGScoring.getHorizonComment) {
            return ESGScoring.getHorizonComment(horizon, language);
        }
        return null;
    };

    // Generate HTML for each TOP area (count determined by ES state)
    let areasHTML = '';
    top3Areas.forEach((areaData, index) => {
        const areaName = areaNames[areaData.area] || areaData.area;
        const timeline = timelineLabels[areaData.timeline] || `${areaData.timeline} dni`;
        const errsValue = Math.round(areaData.errs * 10) / 10;  // Round to 1 decimal

        // Task #4 from Korekta.pdf: Get risk comments for THIS specific pillar
        // Structure: topRiskComments[pillar][state][riskType][lang]
        let riskComments = { business: '', reputation: '', operational: '' };
        if (typeof ESGScoring !== 'undefined' && ESGScoring.getTop3RiskComments) {
            riskComments = ESGScoring.getTop3RiskComments(areaData.area, esState, language, industryCode);
        }

        // Get horizon comment for this area's timeline
        const horizonComment = getHorizonComment(areaData.timeline);
        const horizonTitle = horizonComment ? horizonComment.title : '';
        const horizonDescription = horizonComment ? horizonComment.description : '';

        areasHTML += `
            <div style="margin-top: ${index === 0 ? '0' : '10px'}; padding: 10px; background: rgba(255, 255, 255, 0.7); border-radius: 10px; border-left: 3px solid ${esColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 15px; color: #1e293b; font-weight: 700;">
                        ${esEmoji} ${areaName}
                    </div>
                    <div style="font-size: 12px; color: #64748b; font-weight: 600; padding: 3px 10px; background: rgba(100, 116, 139, 0.1); border-radius: 6px;">
                        ${timeline}
                    </div>
                </div>

                ${(() => {
                    // Task #3 from Korekta.pdf: Add industry-specific context intro
                    let industryIntro = '';
                    if (typeof window !== 'undefined' && window.IndustryRiskIntro && industryCode) {
                        industryIntro = window.IndustryRiskIntro.getIndustryRiskIntro(industryCode, areaData.area, language);
                    }

                    return industryIntro ? `
                    <!-- Industry-specific context introduction -->
                    <div style="margin-top: 8px; padding: 8px 10px; background: rgba(163, 204, 75, 0.08); border-radius: 8px; border-left: 2px solid rgba(163, 204, 75, 0.6);">
                        <div style="font-size: 10px; color: #475569; line-height: 1.5; font-style: italic;">
                            ${industryIntro}
                        </div>
                    </div>
                    ` : '';
                })()}

                <!-- 3 parallel risk comments - Task #9 from Korekta.pdf: improved readability -->
                <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                    <!-- Business Risk -->
                    <div style="padding: 8px 10px; background: rgba(163, 204, 75, 0.05); border-radius: 6px; border-left: 3px solid rgba(163, 204, 75, 0.6);">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
                            📊 ${riskTypeLabels.business}
                        </div>
                        <div style="font-size: 11px; color: #475569; line-height: 1.8;">
                            ${formatQuestionsAsList(riskComments.business || (isPolish ? 'Brak opisu ryzyka biznesowego.' : 'No business risk description.'))}
                        </div>
                    </div>

                    <!-- Reputation Risk -->
                    <div style="padding: 8px 10px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid rgba(59, 130, 246, 0.6);">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
                            👥 ${riskTypeLabels.reputation}
                        </div>
                        <div style="font-size: 11px; color: #475569; line-height: 1.8;">
                            ${formatQuestionsAsList(riskComments.reputation || (isPolish ? 'Brak opisu ryzyka reputacyjnego.' : 'No reputation risk description.'))}
                        </div>
                    </div>

                    <!-- Operational Risk -->
                    <div style="padding: 8px 10px; background: rgba(251, 146, 60, 0.05); border-radius: 6px; border-left: 3px solid rgba(251, 146, 60, 0.6);">
                        <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">
                            ⚙️ ${riskTypeLabels.operational}
                        </div>
                        <div style="font-size: 11px; color: #475569; line-height: 1.8;">
                            ${formatQuestionsAsList(riskComments.operational || (isPolish ? 'Brak opisu ryzyka operacyjnego.' : 'No operational risk description.'))}
                        </div>
                    </div>
                </div>

                <!-- Horizon Comment (Layer 2) -->
                ${horizonComment ? `
                <div style="margin-top: 8px; padding: 8px 10px; background: rgba(59, 130, 246, 0.05); border-radius: 8px; border-left: 2px solid rgba(59, 130, 246, 0.5);">
                    <div style="font-size: 11px; color: #3b82f6; font-weight: 600; margin-bottom: 4px;">
                        🎯 ${horizonTitle}
                    </div>
                    <div style="font-size: 10px; color: #475569; line-height: 1.4; margin-bottom: 6px;">
                        ${horizonDescription}
                    </div>
                    ${(() => {
                        // Task #7 from Korekta.pdf: Add industry-specific example
                        let industryExample = '';
                        if (typeof window !== 'undefined' && window.IndustryHorizonExamples && industryCode) {
                            industryExample = window.IndustryHorizonExamples.getIndustryHorizonExample(industryCode, areaData.timeline, language);
                        }
                        return industryExample ? `
                        <div style="font-size: 10px; color: #3b82f6; line-height: 1.4; margin-bottom: ${horizonComment.actions ? '6px' : '0'}; font-style: italic; padding: 6px; background: rgba(163, 204, 75, 0.08); border-radius: 6px;">
                            ${industryExample}
                        </div>
                        ` : '';
                    })()}
                    ${horizonComment.actions && horizonComment.actions.length > 0 ? `
                    <ul style="margin: 0; padding-left: 16px; font-size: 10px; line-height: 1.5;">
                        ${horizonComment.actions.map(action => `<li style="margin-bottom: 4px; color: #475569;">${action}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        `;
    });

    // Return complete TOP 3 section (without title - added on page level)
    return areasHTML;
}

/**
 * Generates Control Questions page for 30 days horizon
 * Per system1.pdf specification: Shows control questions for client self-assessment
 *
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} HTML string for control questions page
 */
function generateControlQuestionsPage(language) {
    const isPolish = language === 'pl';

    // Get control questions from ESGScoring if available
    const getControlQuestions = (horizon) => {
        if (typeof ESGScoring !== 'undefined' && ESGScoring.getControlQuestions) {
            return ESGScoring.getControlQuestions(horizon, language);
        }
        // Fallback to hardcoded questions
        const fallbacks = {
            30: isPolish ? [
                'Czy mamy jedną osobę, która odpowiada za spójność działań i odpowiedzi na zewnątrz?',
                'Czy mamy spisane podstawowe zasady: etyka działania, warunki pracy i bezpieczeństwo?',
                'Czy ludzie wiedzą, gdzie zgłaszać problemy?',
                'Czy mamy minimum działań BHP?',
                'Czy od kluczowych dostawców wymagamy minimum standardu?'
            ] : [
                'Do we have one person responsible for consistency of external actions?',
                'Do we have written basic rules: ethics, working conditions and safety?',
                'Do people know where to report problems?',
                'Do we have minimum OHS activities?',
                'Do we require minimum standard from key suppliers?'
            ]
        };
        return fallbacks[horizon] || [];
    };

    const horizons = [
        { days: 30, emoji: '🟢', color: '#22c55e', bgColor: '#f0fdf4', title: isPolish ? '30 dni' : '30 days' }
    ];

    let sectionsHTML = '';
    horizons.forEach(horizon => {
        const questions = getControlQuestions(horizon.days);
        const questionsListHTML = questions.map(q =>
            `<li style="margin-bottom: 6px; color: #475569;">${q}</li>`
        ).join('');

        sectionsHTML += `
            <div style="margin-bottom: 20px; padding: 15px; background: ${horizon.bgColor}; border-radius: 12px; border-left: 4px solid ${horizon.color};">
                <div style="font-weight: 700; color: ${horizon.color}; font-size: 16px; margin-bottom: 10px;">
                    ${horizon.emoji} ${horizon.title}
                </div>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.5;">
                    ${questionsListHTML}
                </ul>
            </div>
        `;
    });

    return `
        <div style="width: 794px; padding: 40px; min-height: 1131px; box-sizing: border-box; position: relative; background: white;">
            <h1 style="color: #A3CC4B; margin: 0 0 20px 0; font-size: 32px; text-align: center;">
                ✅ ${isPolish ? 'Pytania kontrolne' : 'Control Questions'}
            </h1>
            <p style="color: #64748b; text-align: center; font-size: 14px; margin-bottom: 30px; line-height: 1.5;">
                ${isPolish
                    ? 'Te pytania pomogą Ci ocenić gotowość firmy na każdym etapie. Użyj ich jako checklisty do samooceny.'
                    : 'These questions will help you assess your company\'s readiness at each stage. Use them as a self-assessment checklist.'}
            </p>

            ${sectionsHTML}

            <!-- Footer -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                <div style="font-size: 14px; font-weight: 500;">${isPolish ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
            </div>

            <!-- Page Break -->
            <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
        </div>
    `;
}

/**
 * Generates detailed PLAN comments pages based on company type
 * Full text split across multiple pages if needed
 * @param {string} companyType - Company type ('MSP', 'SUPPLIER', or 'LARGE')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} HTML string for PLAN comments pages
 */
function generatePlanCommentsPage(companyType, language) {
    const isPolish = language === 'pl';

    // Get PLAN comments for 30 days
    const plan30 = getPlanCommentForType(companyType, 30, language);

    // If no PLAN comments available, return empty string
    if (!plan30) {
        return '';
    }

    // Company type labels
    const companyTypeLabels = {
        MSP: { pl: 'Małe i Średnie Przedsiębiorstwa', en: 'Small and Medium Enterprises' },
        SUPPLIER: { pl: 'Dostawcy', en: 'Suppliers' },
        LARGE: { pl: 'Duże Przedsiębiorstwa', en: 'Large Enterprises' }
    };
    const typeLabel = companyTypeLabels[companyType]?.[language] || companyType;

    // Split text into chunks that fit on a page (~2500 chars per page at font-size 10px)
    const CHARS_PER_PAGE = 2500;

    const splitTextIntoChunks = (text) => {
        if (!text) return [];

        const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
        const chunks = [];
        let currentChunk = [];
        let currentLength = 0;

        for (const para of paragraphs) {
            if (currentLength + para.length > CHARS_PER_PAGE && currentChunk.length > 0) {
                chunks.push(currentChunk.join('\n\n'));
                currentChunk = [para];
                currentLength = para.length;
            } else {
                currentChunk.push(para);
                currentLength += para.length;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n\n'));
        }

        return chunks;
    };

    // Format text with proper styling
    const formatText = (text) => {
        if (!text) return '';

        return text
            .split(/\n/)
            .map(line => {
                const trimmed = line.trim();
                if (!trimmed) return '';

                // Bullet points
                if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                    return `<div style="margin: 3px 0 3px 15px; padding-left: 10px; border-left: 2px solid #cbd5e1;">${trimmed.substring(1).trim()}</div>`;
                }
                // Numbered items with emoji
                if (/^\d+[⃣]/.test(trimmed)) {
                    return `<div style="margin: 8px 0 4px 0; font-weight: 600; color: #1e293b;">${trimmed}</div>`;
                }
                // Regular paragraph
                return `<div style="margin: 6px 0;">${trimmed}</div>`;
            })
            .join('');
    };

    // Generate page HTML
    const generatePage = (horizon, color, bgColor, borderColor, emoji, chunks, chunkIndex, totalChunks) => {
        const horizonLabel = horizon === 30
            ? (isPolish ? 'Pierwsze 30 dni' : 'First 30 days')
            : (isPolish ? 'Do 90 dni' : 'Up to 90 days');

        const pageIndicator = totalChunks > 1
            ? ` <span style="font-size: 12px; font-weight: normal;">(${chunkIndex + 1}/${totalChunks})</span>`
            : '';

        return `
        <!-- PLAN Comments - ${horizon} Days Page ${chunkIndex + 1} -->
        <div style="width: 794px; padding: 35px 30px; min-height: 1131px; box-sizing: border-box; position: relative; background: white;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="color: #1e293b; margin: 0 0 6px 0; font-size: 24px; color: #A3CC4B;">
                    📘 ${isPolish ? 'Szczegółowy Plan Działań' : 'Detailed Action Plan'}
                </h1>
                <div style="font-size: 11px; color: #64748b;">
                    ${isPolish ? 'Rekomendacje dla:' : 'Recommendations for:'} <strong>${typeLabel}</strong>
                </div>
            </div>

            <div style="background: ${color}15; padding: 10px 14px; border-radius: 10px; border-left: 4px solid ${color}; margin-bottom: 12px;">
                <h2 style="margin: 0; color: ${color}; font-size: 16px; font-weight: 700;">
                    ${emoji} ${horizonLabel}${pageIndicator}
                </h2>
            </div>

            <div style="background: ${bgColor}; padding: 12px 14px; border-radius: 10px; border: 1px solid ${borderColor};">
                <div style="color: #1e293b; line-height: 1.4; font-size: 9px;">
                    ${formatText(chunks[chunkIndex])}
                </div>
            </div>

            <!-- Footer -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                <div style="font-size: 14px; font-weight: 500;">${isPolish ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
            </div>

            <!-- Page Break -->
            <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
        </div>
        `;
    };

    let pages = '';

    // Generate pages for 30 days
    if (plan30) {
        const chunks30 = splitTextIntoChunks(plan30);
        for (let i = 0; i < chunks30.length; i++) {
            pages += generatePage(30, '#22c55e', '#f0fdf4', '#bbf7d0', '🟢', chunks30, i, chunks30.length);
        }
    }

    return pages;
}

/**
 * Gets pillar performance level based on score percentage
 * NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
 * @param {number} score - Pillar score
 * @param {number} max - Maximum possible score for the pillar
 * @returns {string} Performance level ('critical', 'elevated', 'moderate', 'good')
 */
function getPillarPerformanceLevel(score, max) {
    const percentage = (score / max) * 100;
    if (percentage >= 81) return 'good';       // 81-100: DOBRY
    if (percentage >= 51) return 'moderate';   // 51-80: UMIARKOWANY
    if (percentage >= 31) return 'elevated';   // 31-50: PODWYŻSZONE RYZYKO
    return 'critical';                          // 0-30: KRYTYCZNY
}

/**
 * Gets pillar insights and recommendations based on performance level
 * NEW: Uses EXTENDED_PILLAR_COMMENTS from comments.js for descriptions
 * @param {string} pillar - Pillar code ('E', 'S', 'G', or 'Supply')
 * @param {string} level - Performance level ('critical', 'elevated', 'moderate', 'good')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Object with emoji, performance label, description, and recommended focus
 */
function getPillarInsightsAndRecommendations(pillar, level, language) {
    const isPolish = language === 'pl';

    // Map performance levels to EXT states
    const levelToStateMap = {
        'good': 'green',
        'moderate': 'yellow',
        'elevated': 'orange',
        'critical': 'critical'
    };

    // Map pillar codes (Supply -> SC for comments)
    const pillarCode = pillar === 'Supply' ? 'SC' : pillar;
    const state = levelToStateMap[level] || 'yellow';

    // Get description from EXTENDED_PILLAR_COMMENTS
    let description = '';
    if (typeof ESGScoring !== 'undefined' && ESGScoring.getExtendedPillarComment) {
        description = ESGScoring.getExtendedPillarComment(pillarCode, state, language);
    }

    // Performance labels and emojis
    const performanceLabels = {
        critical: { emoji: '🔴', label: isPolish ? 'Krytyczny' : 'Critical' },
        elevated: { emoji: '🟠', label: isPolish ? 'Podwyższone ryzyko' : 'Elevated Risk' },
        moderate: { emoji: '🟡', label: isPolish ? 'Umiarkowany' : 'Moderate' },
        good: { emoji: '🟢', label: isPolish ? 'Dobry' : 'Good' }
    };

    // Recommended focus by pillar and level
    const recommendedFocus = {
        E: {
            critical: isPolish
                ? 'Natychmiast wdróż podstawowy monitoring emisji i zużycia energii. Wyznacz odpowiedzialną osobę.'
                : 'Immediately implement basic emissions and energy monitoring. Designate a responsible person.',
            elevated: isPolish
                ? 'Priorytetyzuj śledzenie emisji, środki efektywności energetycznej i zgodność środowiskową.'
                : 'Prioritize emissions tracking, energy efficiency measures, and environmental compliance.',
            moderate: isPolish
                ? 'Wzmocnij monitoring, ustal cele redukcji i zoptymalizuj wykorzystanie zasobów.'
                : 'Strengthen monitoring, set reduction targets, and optimize resource use.',
            good: isPolish
                ? 'Utrzymaj wyniki i wykorzystaj osiągnięcia środowiskowe w raportowaniu i partnerstwach.'
                : 'Maintain performance and leverage environmental achievements in reporting and partnerships.'
        },
        S: {
            critical: isPolish
                ? 'Natychmiast wdróż podstawowe polityki BHP i standardy pracy. Wyznacz odpowiedzialną osobę.'
                : 'Immediately implement basic H&S policies and labor standards. Designate a responsible person.',
            elevated: isPolish
                ? 'Popraw bezpieczeństwo w miejscu pracy, standardy pracy i polityki dotyczące pracowników.'
                : 'Improve workplace safety, labor standards, and employee policies.',
            moderate: isPolish
                ? 'Wzmocnij zaangażowanie pracowników, szkolenia i komunikację wewnętrzną.'
                : 'Enhance employee engagement, training, and internal communication.',
            good: isPolish
                ? 'Utrzymaj najlepsze praktyki i podkreśl wpływ społeczny dla interesariuszy.'
                : 'Maintain best practices and highlight social impact to stakeholders.'
        },
        G: {
            critical: isPolish
                ? 'Natychmiast ustanów podstawowe struktury zarządzania i odpowiedzialność. Wyznacz osobę odpowiedzialną za ESG.'
                : 'Immediately establish basic governance structures and accountability. Designate ESG responsible person.',
            elevated: isPolish
                ? 'Ustanów jasne struktury zarządzania, polityki i odpowiedzialność.'
                : 'Establish clear governance structures, policies, and accountability.',
            moderate: isPolish
                ? 'Popraw zarządzanie ryzykiem, procesy zgodności i przejrzystość zarządzania.'
                : 'Improve risk management, compliance processes, and management transparency.',
            good: isPolish
                ? 'Utrzymaj najlepsze praktyki zarządzania i wykorzystaj wiarygodność wobec inwestorów i partnerów.'
                : 'Maintain governance best practices and leverage credibility with investors and partners.'
        },
        Supply: {
            critical: isPolish
                ? 'Natychmiast ustanów system weryfikacji dostawców i podstawowe wymagania dla łańcucha dostaw.'
                : 'Immediately establish supplier verification system and basic supply chain requirements.',
            elevated: isPolish
                ? 'Wdróż formalne wymagania dla dostawców i regularny monitoring.'
                : 'Implement formal supplier requirements and regular monitoring.',
            moderate: isPolish
                ? 'Wzmocnij dokumentację wymagań dla dostawców i rozważ programy współpracy.'
                : 'Strengthen supplier requirements documentation and consider partnership programs.',
            good: isPolish
                ? 'Utrzymaj wyniki i wykorzystaj osiągnięcia łańcucha dostaw w raportowaniu i relacjach z partnerami.'
                : 'Maintain performance and leverage supply chain achievements in reporting and partner relations.'
        }
    };

    const labelData = performanceLabels[level] || { emoji: '⚪', label: 'N/A' };
    const focus = recommendedFocus[pillar]?.[level] || '';

    return {
        emoji: labelData.emoji,
        performanceLabel: labelData.label,
        description: description || '',
        recommendedFocus: focus
    };
}

/**
 * Gets priority actions for the next 30 days based on ESG color zone
 * NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
 * @param {number} percent - ESG score percentage (0-100)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Object with goal, zone name, and three priority actions
 */
function getPriorityActions(percent, language) {
    const isPolish = language === 'pl';

    if (percent >= 81) {
        // Green Zone — Good (81-100)
        return {
            zoneName: isPolish ? '🟢 Strefa zielona — Dobry' : '🟢 Green Zone — Good',
            goal: isPolish
                ? 'Cel: Wykorzystanie ESG jako przewagi konkurencyjnej.'
                : 'Goal: Leverage ESG as a competitive advantage.',
            actions: [
                {
                    title: isPolish ? 'Sformalizuj najlepsze praktyki' : 'Formalize best practices',
                    description: isPolish
                        ? 'Udokumentuj istniejące procesy ESG i ustaw kluczowe wskaźniki wydajności (KPI) do monitorowania osiągnięć. Stwórz dokumentację procedur, wyznacz odpowiedzialne osoby i wprowadź regularne przeglądy.'
                        : 'Document existing ESG processes and set key performance indicators (KPIs) to monitor achievements. Create procedure documentation, assign responsible parties, and implement regular reviews.'
                },
                {
                    title: isPolish ? 'Zintegruj ESG ze strategią wzrostu' : 'Integrate ESG into growth strategy',
                    description: isPolish
                        ? 'Wykorzystaj wyniki ESG jako strategiczny atut w przetargach, negocjacjach partnerskich i dyskusjach o finansowaniu. Włącz kryteria ESG do procesów decyzyjnych i wykorzystaj certyfikaty jako przewagę konkurencyjną.'
                        : 'Leverage ESG results as a strategic asset in tenders, partnership negotiations, and financing discussions. Integrate ESG criteria into decision-making processes and use certifications as competitive advantages.'
                },
                {
                    title: isPolish ? 'Zwiększ transparentność' : 'Increase transparency',
                    description: isPolish
                        ? 'Opublikuj profil ESG lub podsumowanie wyników pokazujące postępy w zrównoważonym rozwoju. Udostępnij raporty publicznie i komunikuj osiągnięcia ESG w kanałach marketingowych.'
                        : 'Publish an ESG profile or performance summary demonstrating sustainability progress. Share reports publicly and communicate ESG achievements through marketing channels.'
                }
            ]
        };
    } else if (percent >= 51) {
        // Yellow Zone — Moderate (51-80)
        return {
            zoneName: isPolish ? '🟡 Strefa żółta — Umiarkowany' : '🟡 Yellow Zone — Moderate',
            goal: isPolish
                ? 'Cel: Systematyczna poprawa i standaryzacja procesów ESG.'
                : 'Goal: Systematic improvement and ESG process standardization.',
            actions: [
                {
                    title: isPolish ? 'Zaktualizuj procesy wewnętrzne' : 'Update internal processes',
                    description: isPolish
                        ? 'Przeprowadź przegląd i modernizację procedur zakupów, zgodności oraz zarządzania personelem. Wprowadź kryteria ESG do procesów decyzyjnych i zoptymalizuj przepływy pracy.'
                        : 'Review and modernize procurement, compliance, and people-management procedures. Integrate ESG criteria into decision-making processes and optimize workflows.'
                },
                {
                    title: isPolish ? 'Komunikuj postępy' : 'Communicate progress',
                    description: isPolish
                        ? 'Przygotuj przejrzyste podsumowanie postępów ESG z osiągnięciami, wyzwaniami i planami. Udostępnij informacje partnerom, klientom i instytucjom finansowym poprzez raporty i prezentacje.'
                        : 'Prepare transparent ESG progress summaries with achievements, challenges, and plans. Share information with partners, clients, and financial institutions through reports and presentations.'
                }
            ]
        };
    } else if (percent >= 31) {
        // Yellow Zone — Elevated Risk (31-50)
        return {
            zoneName: isPolish ? '🟡 Strefa żółta — Podwyższone ryzyko' : '🟡 Yellow Zone — Elevated Risk',
            goal: isPolish
                ? 'Cel: Usunięcie systemowych luk i wzmocnienie pozycji rynkowej.'
                : 'Goal: Address systemic gaps and strengthen market position.',
            actions: [
                {
                    title: isPolish ? 'Zidentyfikuj i priorytetyzuj luki' : 'Identify and prioritize gaps',
                    description: isPolish
                        ? 'Przeprowadź analizę luk ESG w organizacji. Zidentyfikuj 3–5 kluczowych obszarów wymagających natychmiastowej poprawy. Przypisz odpowiedzialność i ustal terminy.'
                        : 'Conduct ESG gap analysis across the organization. Identify 3–5 key areas requiring immediate improvement. Assign responsibility and set deadlines.'
                },
                {
                    title: isPolish ? 'Wdroż podstawowe polityki' : 'Implement basic policies',
                    description: isPolish
                        ? 'Wprowadź brakujące polityki dotyczące BHP, etyki, środowiska i zarządzania. Zapewnij podstawowe szkolenia i ustanów procedury monitoringu zgodności.'
                        : 'Introduce missing policies on H&S, ethics, environment, and governance. Provide basic training and establish compliance monitoring procedures.'
                },
                {
                    title: isPolish ? 'Ustanów regularne raportowanie' : 'Establish regular reporting',
                    description: isPolish
                        ? 'Wprowadź kwartalne przeglądy postępów ESG. Stwórz dashboardy dla kluczowych wskaźników i regularnie informuj zarząd o statusie.'
                        : 'Introduce quarterly ESG progress reviews. Create dashboards for key indicators and regularly inform management about status.'
                }
            ]
        };
    } else {
        // Red Zone — Critical (0-30)
        return {
            zoneName: isPolish ? '🔴 Strefa czerwona — Krytyczny' : '🔴 Red Zone — Critical',
            goal: isPolish
                ? 'Cel: Pilne zbudowanie podstaw zarządczych i zmniejszenie krytycznych ryzyk.'
                : 'Goal: Urgently build management foundations and reduce critical risks.',
            actions: [
                {
                    title: isPolish ? 'Wyznacz odpowiedzialną osobę za ESG' : 'Designate ESG responsible person',
                    description: isPolish
                        ? 'Natychmiast wyznacz osobę odpowiedzialną za ESG w organizacji. Określ zakres odpowiedzialności, budżet i uprawnienia do podejmowania decyzji.'
                        : 'Immediately designate a person responsible for ESG in the organization. Define scope of responsibility, budget, and decision-making authority.'
                },
                {
                    title: isPolish ? 'Wprowadź podstawowe polityki ESG' : 'Implement core ESG policies',
                    description: isPolish
                        ? 'Wprowadź podstawowe polityki dotyczące zdrowia i bezpieczeństwa, etyki biznesowej, wpływu na środowisko oraz ładu korporacyjnego. To absolutne minimum dla funkcjonowania.'
                        : 'Introduce basic policies on health & safety, business ethics, environmental impact, and corporate governance. This is the absolute minimum for functioning.'
                },
                {
                    title: isPolish ? 'Stwórz plan awaryjny' : 'Create emergency plan',
                    description: isPolish
                        ? 'Stwórz 3-miesięczny plan awaryjny z priorytetami, kamieniami milowymi i odpowiedzialnościami. Skoncentruj się na najwyższych ryzykach i podstawowej zgodności.'
                        : 'Create a 3-month emergency plan with priorities, milestones, and responsibilities. Focus on highest risks and basic compliance.'
                }
            ]
        };
    }
}

/**
 * Gets industry-specific ESG comment based on industry and risk level
 * @param {string} industry - Industry name
 * @param {string} riskLevel - Risk level ('high', 'medium', 'low')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry-specific comment or empty string if no match
 */
function getIndustryEsgComment(industry, riskLevel, language) {
    const isPolish = language === 'pl';
    const normalizedIndustry = industry ? industry.trim().toLowerCase() : '';
    
    // Industry-specific comments
    const comments = {
        construction: {
            high: {
                en: 'High ESG risk. Limited access to tenders, increased regulatory scrutiny, and higher financing barriers.',
                pl: 'Wysokie ryzyko ESG. Ograniczony dostęp do przetargów, zwiększona kontrola regulacyjna i wyższe bariery finansowe.'
            },
            medium: {
                en: 'Moderate ESG risk. Market access is possible, but clients expect improvements in environmental and safety practices.',
                pl: 'Umiarkowane ryzyko ESG. Dostęp do rynku jest możliwy, ale klienci oczekują poprawy w praktykach środowiskowych i bezpieczeństwa.'
            },
            low: {
                en: 'Low ESG risk. Strong position in tenders and partnerships with ESG-oriented clients.',
                pl: 'Niskie ryzyko ESG. Silna pozycja w przetargach i partnerstwa z klientami zorientowanymi na ESG.'
            }
        },
        energy: {
            high: {
                en: 'High ESG risk. Increased regulatory pressure and limited access to capital and long-term investments.',
                pl: 'Wysokie ryzyko ESG. Zwiększona presja regulacyjna i ograniczony dostęp do kapitału i inwestycji długoterminowych.'
            },
            medium: {
                en: 'Moderate ESG risk. Business stability depends on progress in emissions reduction and transparency.',
                pl: 'Umiarkowane ryzyko ESG. Stabilność biznesu zależy od postępów w redukcji emisji i transparentności.'
            },
            low: {
                en: 'Low ESG risk. Attractive to investors and aligned with energy transition requirements.',
                pl: 'Niskie ryzyko ESG. Atrakcyjne dla inwestorów i zgodne z wymaganiami transformacji energetycznej.'
            }
        },
        fintech: {
            high: {
                en: 'High ESG risk. Reduced trust from clients, partners, and regulators.',
                pl: 'Wysokie ryzyko ESG. Zmniejszone zaufanie ze strony klientów, partnerów i regulatorów.'
            },
            medium: {
                en: 'Moderate ESG risk. Core operations are stable, but stronger governance and transparency are expected.',
                pl: 'Umiarkowane ryzyko ESG. Podstawowe operacje są stabilne, ale oczekuje się silniejszego zarządzania i transparentności.'
            },
            low: {
                en: 'Low ESG risk. High level of trust and improved access to partnerships and funding.',
                pl: 'Niskie ryzyko ESG. Wysoki poziom zaufania i lepszy dostęp do partnerstw i finansowania.'
            }
        },
        retail: {
            high: {
                en: 'High ESG risk. Reputational challenges and pressure from partners and consumers.',
                pl: 'Wysokie ryzyko ESG. Wyzwania reputacyjne i presja ze strony partnerów i konsumentów.'
            },
            medium: {
                en: 'Moderate ESG risk. Compliance with basic standards, with expectations to improve supply chain practices.',
                pl: 'Umiarkowane ryzyko ESG. Zgodność z podstawowymi standardami, z oczekiwaniami poprawy praktyk w łańcuchu dostaw.'
            },
            low: {
                en: 'Low ESG risk. Strong brand perception and alignment with consumer and partner expectations.',
                pl: 'Niskie ryzyko ESG. Silna percepcja marki i zgodność z oczekiwaniami konsumentów i partnerów.'
            }
        },
        'it / software': {
            high: {
                en: 'High ESG risk. Weakened trust from enterprise clients and international partners.',
                pl: 'Wysokie ryzyko ESG. Osłabione zaufanie ze strony klientów korporacyjnych i międzynarodowych partnerów.'
            },
            medium: {
                en: 'Moderate ESG risk. Competitive position remains stable, but governance improvements are needed.',
                pl: 'Umiarkowane ryzyko ESG. Pozycja konkurencyjna pozostaje stabilna, ale potrzebne są ulepszenia w zarządzaniu.'
            },
            low: {
                en: 'Low ESG risk. Attractive for global clients, investors, and long-term projects.',
                pl: 'Niskie ryzyko ESG. Atrakcyjne dla globalnych klientów, inwestorów i projektów długoterminowych.'
            }
        },
        logistics: {
            high: {
                en: 'High ESG risk. Pressure due to emissions, labor conditions, and client sustainability requirements.',
                pl: 'Wysokie ryzyko ESG. Presja z powodu emisji, warunków pracy i wymagań dotyczących zrównoważonego rozwoju klientów.'
            },
            medium: {
                en: 'Moderate ESG risk. Operations are viable with a clear plan to reduce environmental impact.',
                pl: 'Umiarkowane ryzyko ESG. Operacje są opłacalne z jasnym planem redukcji wpływu na środowisko.'
            },
            low: {
                en: 'Low ESG risk. Strong fit for sustainable supply chains and long-term contracts.',
                pl: 'Niskie ryzyko ESG. Silne dopasowanie do zrównoważonych łańcuchów dostaw i umów długoterminowych.'
            }
        },
        manufacturing: {
            high: {
                en: 'High ESG risk. Barriers to exports, financing, and increased compliance costs.',
                pl: 'Wysokie ryzyko ESG. Bariery w eksporcie, finansowaniu i zwiększone koszty zgodności.'
            },
            medium: {
                en: 'Moderate ESG risk. Meets minimum requirements but requires process modernization.',
                pl: 'Umiarkowane ryzyko ESG. Spełnia minimalne wymagania, ale wymaga modernizacji procesów.'
            },
            low: {
                en: 'Low ESG risk. Meets international standards and client sustainability expectations.',
                pl: 'Niskie ryzyko ESG. Spełnia międzynarodowe standardy i oczekiwania klientów dotyczące zrównoważonego rozwoju.'
            }
        },
        transport: {
            high: {
                en: 'High ESG risk. Contract limitations and rising regulatory and environmental requirements.',
                pl: 'Wysokie ryzyko ESG. Ograniczenia kontraktowe i rosnące wymagania regulacyjne i środowiskowe.'
            },
            medium: {
                en: 'Moderate ESG risk. Continued access to contracts with investments in safety and emissions reduction.',
                pl: 'Umiarkowane ryzyko ESG. Kontynuowany dostęp do kontraktów z inwestycjami w bezpieczeństwo i redukcję emisji.'
            },
            low: {
                en: 'Low ESG risk. Competitive advantage in long-term and ESG-driven contracts.',
                pl: 'Niskie ryzyko ESG. Przewaga konkurencyjna w kontraktach długoterminowych i napędzanych ESG.'
            }
        },
        services: {
            high: {
                en: 'High ESG risk. Reputational exposure and declining client confidence.',
                pl: 'Wysokie ryzyko ESG. Narażenie reputacyjne i spadające zaufanie klientów.'
            },
            medium: {
                en: 'Moderate ESG risk. Stable operations with room to strengthen corporate practices.',
                pl: 'Umiarkowane ryzyko ESG. Stabilne operacje z możliwością wzmocnienia praktyk korporacyjnych.'
            },
            low: {
                en: 'Low ESG risk. High client trust and strong partnership potential.',
                pl: 'Niskie ryzyko ESG. Wysokie zaufanie klientów i silny potencjał partnerstwa.'
            }
        }
    };
    
    // Map industry names to keys
    const industryMap = {
        'construction': 'construction',
        'budownictwo': 'construction',
        'energia': 'energy',
        'energetyka': 'energy',
        'energy': 'energy',
        'fintech': 'fintech',
        'retail': 'retail',
        'handel i detalika': 'retail',
        'handel i detal': 'retail',
        'handel': 'retail',
        'detalika': 'retail',
        'detal': 'retail',
        'trade': 'retail',
        'it': 'it / software',
        'software': 'it / software',
        'oprogramowanie': 'it / software',
        'logistics': 'logistics',
        'logistyka': 'logistics',
        'manufacturing': 'manufacturing',
        'produkcja': 'manufacturing',
        'production': 'manufacturing',
        'transport': 'transport',
        'services': 'services',
        'usługi': 'services'
    };
    
    // Find matching industry
    let industryKey = null;
    for (const [key, value] of Object.entries(industryMap)) {
        if (normalizedIndustry.includes(key)) {
            industryKey = value;
            break;
        }
    }
    
    // If no match found, return empty string
    if (!industryKey || !comments[industryKey] || !comments[industryKey][riskLevel]) {
        return '';
    }
    
    return comments[industryKey][riskLevel][isPolish ? 'pl' : 'en'];
}

/**
 * Selects text variants using AI through backend API
 * @param {string} level - ESG level ('low', 'medium', 'high')
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Promise<Object>} Object with selected variants {summary, nextSteps, cta, premiumTeaser}
 */
async function selectTextVariantsWithAI(level, language) {
    try {
        const response = await fetch(`${typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : ''}/api/esg-variants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ level, language })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse AI response
        let variants;
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            
            // Try to parse JSON from response
            try {
                variants = JSON.parse(content);
            } catch (e) {
                variants = generateFallbackVariants();
            }
        } else {
            variants = generateFallbackVariants();
        }

        // Validate variants
        const validVariants = ['A', 'B', 'C'];
        const isValid = 
            variants.summary && validVariants.includes(variants.summary) &&
            variants.nextSteps && validVariants.includes(variants.nextSteps) &&
            variants.cta && validVariants.includes(variants.cta) &&
            variants.premiumTeaser && validVariants.includes(variants.premiumTeaser);

        if (!isValid) {
            variants = generateFallbackVariants();
        }

        return variants;
        
    } catch (error) {
        return generateFallbackVariants();
    }
}

/**
 * Generates fallback variants when AI is unavailable
 * @returns {Object} Object with random variants
 */
function generateFallbackVariants() {
    const versions = ['A', 'B', 'C'];
    return {
        summary: versions[Math.floor(Math.random() * 3)],
        nextSteps: versions[Math.floor(Math.random() * 3)],
        cta: versions[Math.floor(Math.random() * 3)],
        premiumTeaser: versions[Math.floor(Math.random() * 3)]
    };
}

/**
 * Gets AI recommendation for user comment
 * @param {string} comment - User comment text
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Promise<string>} AI recommendation text
 */
async function getCommentRecommendation(comment, language) {
    try {
        if (!comment || !comment.trim()) {
            return language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
        }
        
        const response = await fetch(`${typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : ''}/api/comment-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment, language })
        });

        if (!response.ok) {
            // Handle rate limiting gracefully
            if (response.status === 429) {
                console.warn('Rate limit exceeded. Using fallback message.');
                return language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse AI response
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content || (language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.');
        }
        
        return language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
        
    } catch (error) {
        console.error('Error fetching comment recommendation:', error);
        // Return fallback message instead of throwing
        return language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
    }
}

/**
 * Generates document verification results HTML
 * @param {Array} documentVerifications - Document verification results array
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} HTML content for document verification results
 */
// Convert numeric answer to text
function convertAnswerToText(answer, language = 'en') {
    const isPolish = language === 'pl';
    
    switch(answer) {
        case '5':
            return isPolish ? 'Tak' : 'Yes';
        case '3':
            return isPolish ? 'Częściowo' : 'Partial';
        case '1':
            return isPolish ? 'W trakcie' : 'In Progress';
        case '0':
            return isPolish ? 'Nie' : 'No';
        default:
            return answer; // Return as-is if not a numeric answer
    }
}

function generateDocumentVerificationResults(documentVerifications, language) {
    const isPolish = language === 'pl';
    
    if (documentVerifications.length === 0) {
        return `
            <div style="background: #f1f5f9; padding: 30px; border-radius: 15px; text-align: center; border: 2px dashed #cbd5e1;">
                <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                <div style="font-weight: bold; color: #64748b; margin-bottom: 10px; font-size: 18px;">
                    ${isPolish ? 'Brak dokumentów do weryfikacji' : 'No documents to verify'}
                </div>
                <div style="color: #94a3b8; font-size: 16px;">
                    ${isPolish ? 'Użytkownik nie załączył żadnych dokumentów do weryfikacji.' : 'User did not attach any documents for verification.'}
                </div>
            </div>
        `;
    }
    
    let html = '';
    
    documentVerifications.forEach((verification, index) => {
        const statusIcon = verification.isConsistent ? '✅' : '⚠️';
        const statusColor = verification.isConsistent ? '#10b981' : '#f59e0b';
        const statusText = verification.isConsistent ? 
            (isPolish ? 'Zgodne' : 'Consistent') : 
            (isPolish ? 'Wymaga korekty' : 'Requires correction');
        
        html += `
            <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; border-left: 5px solid ${statusColor};">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 10px;">${statusIcon}</span>
                    <div>
                        <div style="font-weight: bold; color: #1e293b; font-size: 18px;">
                            ${verification.questionText || (isPolish ? 'Pytanie' : 'Question')}
                        </div>
                        <div style="color: ${statusColor}; font-weight: 500; font-size: 14px;">
                            ${statusText}
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151; margin-bottom: 8px; font-size: 14px;">
                        ${isPolish ? 'Odpowiedź użytkownika:' : 'User Response:'}
                    </div>
                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; color: #475569; font-size: 14px;">
                        ${convertAnswerToText(verification.userAnswer, language) || (isPolish ? 'Brak odpowiedzi' : 'No answer')}
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #374151; margin-bottom: 8px; font-size: 14px;">
                        ${isPolish ? 'Informacja z dokumentu:' : 'Document Information:'}
                    </div>
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; color: #1e40af; font-size: 14px;">
                        ${verification.documentInfo || (isPolish ? 'Brak informacji' : 'No information')}
                    </div>
                </div>
                
                ${!verification.isConsistent ? `
                    <div style="margin-bottom: 15px;">
                        <div style="font-weight: bold; color: #dc2626; margin-bottom: 8px; font-size: 14px;">
                            ${isPolish ? 'Sugerowana korekta:' : 'Suggested Correction:'}
                        </div>
                        <div style="background: #fef2f2; padding: 12px; border-radius: 8px; color: #dc2626; font-size: 14px; border-left: 3px solid #fca5a5;">
                            ${verification.suggestedCorrection || (isPolish ? 'Wymagana weryfikacja ręczna' : 'Manual verification required')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #374151; margin-bottom: 8px; font-size: 14px;">
                        ${isPolish ? 'Załączony dokument:' : 'Attached Document:'}
                    </div>
                    <div style="color: #6b7280; font-size: 14px;">
                        ${verification.documentName || (isPolish ? 'Nieznany plik' : 'Unknown file')}
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #9ca3af; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                    ${isPolish ? 'Weryfikacja automatyczna' : 'Automated verification'} •
                    ${new Date().toLocaleDateString(isPolish ? 'pl-PL' : 'en-US')}
                </div>
            </div>
        `;
    });
    
    return html;
}


/**
 * Gets ESG content with AI-selected variants for each text section
 * @param {string} level - ESG level (low, medium, high)
 * @param {Object} variants - Object with selected variants for each section
 * @param {string} language - Language ('pl' or 'en')
 * @returns {Object} ESG content object with selected variants
 */
function getEsgContentWithVariants(level, variants, language) {
    const content = {
        low: {
            A: {
                summary: language === 'pl' 
                    ? 'Twój wynik plasuje firmę na początkowym etapie dojrzałości ESG. Oznacza to, że brakuje kluczowych polityk, kontroli i procesów. Takie luki tworzą realne ryzyka – od trudności w wygrywaniu nowych kontraktów, po wykluczenie z przetargów, po negatywną percepcję wśród inwestorów. To nie jest stan, który możesz utrzymać długo, jeśli myślisz o wzroście.'
                    : 'Your score places the company at the initial stage of ESG maturity. This means that key policies, controls, and processes are missing. Such gaps create real risks – from difficulties in winning new contracts, to exclusion from tenders, to negative perception among investors. This is not a state you can maintain for long if you are thinking about growth.',
                nextSteps: language === 'pl' 
                    ? ['Utwórz podstawowe polityki ESG (środowisko, BHP, sygnalizowanie).', 'Ustal minimalne pomiary – zużycie energii, emisje Scope 1 i 2, rotacja pracowników.', 'Wyznacz właściciela ESG w firmie i wprowadź coroczny przegląd ryzyka.']
                    : ['Create basic ESG policies (environment, OHS, whistleblowing).', 'Establish minimum measurements – energy consumption, Scope 1 and 2 emissions, employee turnover.', 'Appoint an ESG owner within the company and introduce an annual risk review.'],
                cta: language === 'pl'
                    ? 'Czy chcesz szybko zbudować fundament i uniknąć niepowodzeń podczas audytu? Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Do you want to quickly build a foundation and avoid failures during an audit? Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Premium wersja raportu pokaże Ci dokładnie, które polityki i KPI wdrożyć oraz jak przygotować firmę do wymagań CSRD.'
                    : 'The premium version of the report will show you exactly which policies and KPIs to implement and how to prepare your company for CSRD requirements.'
            },
            B: {
                summary: language === 'pl'
                    ? 'Niski wynik oznacza, że firma działa bez spójnego fundamentu ESG. Nawet proste mechanizmy, takie jak monitoring energii czy polityka antykorupcyjna, są nieobecne, co bezpośrednio przekłada się na ryzyko finansowe i reputacyjne. Jeśli nie działasz teraz, w ciągu roku Twoja firma może być uznana za wysokiego ryzyka partnera w łańcuchu dostaw.'
                    : 'A low score means the company operates without a coherent ESG foundation. Even simple mechanisms, such as energy monitoring or an anti-corruption policy, are missing, which directly translates into financial and reputational risk. If you don\'t act now, within a year your company may be considered a high-risk partner in the supply chain.',
                nextSteps: language === 'pl'
                    ? ['Ustaw 3-miesięczny plan działania: dane → kontrole → raport.', 'Wprowadź zasadę czterech oczu dla raportowania danych ESG.', 'Zacznij od corocznego zbierania danych ESG, następnie zwiększ częstotliwość.']
                    : ['Set up a 3-month action plan: data → controls → report.', 'Introduce a four-eyes principle for ESG data reporting.', 'Start with annual ESG data collection, then increase frequency.'],
                cta: language === 'pl'
                    ? 'Twoja firma pilnie potrzebuje uporządkować podstawy ESG. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Your company urgently needs to put ESG basics in order. Reach out to us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Premium wersja raportu zawiera 12-miesięczny plan działania i gotowe szablony polityk ESG – oszczędzając Ci miesiące pracy.'
                    : 'The premium report version includes a 12-month action plan and ready-made ESG policy templates – saving you months of work.'
            },
            C: {
                summary: language === 'pl'
                    ? 'Niski wynik to czerwona flaga. Brakuje niezbędnych fundamentów, co czyni firmę nieprzygotowaną na wymagania CSRD lub oczekiwania klientów i partnerów. Każde kwartalne opóźnienie zwiększa ryzyko utraty kontraktów i reputacji.'
                    : 'A low score is a red flag. Essential foundations are missing, which makes the company unprepared for CSRD requirements or customer and partner expectations. Every quarter of delay increases the risk of losing contracts and reputation.',
                nextSteps: language === 'pl'
                    ? ['Uczyń ESG priorytetem zarządu.', 'Zdefiniuj minimalne KPI: emisje Scope 1–2, rotacja, wskaźnik wypadków.', 'Przygotuj pierwszą politykę ESG i raport do końca roku.']
                    : ['Make ESG a management board priority.', 'Define minimum KPIs: Scope 1–2 emissions, turnover, accident rate.', 'Prepare your first ESG policy and report by year-end.'],
                cta: language === 'pl'
                    ? 'To ostatni moment na wprowadzenie podstaw ESG. Zarezerwuj konsultację z ESGSyncPRO: esgsync.pro | esgsync@protonmail.com'
                    : 'This is the last moment to introduce ESG basics. Book a consultation with ESGSyncPRO: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Z wersją premium otrzymasz benchmark branżowy i konkretne szablony polityk – gotowe do natychmiastowego wdrożenia.'
                    : 'With the premium version, you\'ll receive an industry benchmark and concrete policy templates – ready for immediate implementation.'
            }
        },
        medium: {
            A: {
                summary: language === 'pl'
                    ? 'Średni poziom ESG oznacza, że masz fundament, ale procesy są rozfragmentowane. Nie ma spójności między działami, jasnych celów ani rytmu raportowania. Jeśli pozostaniesz na tym etapie, rynek i Twoja konkurencja szybko Cię wyprzedzą.'
                    : 'A medium ESG level means you have a foundation, but processes are fragmented. There is no consistency between departments, no clear goals, and no reporting rhythm. If you stay at this stage, the market and your competition will quickly overtake you.',
                nextSteps: language === 'pl'
                    ? ['Skonsoliduj źródła danych (jedna tabela "źródło prawdy").', 'Dodaj cele redukcji emisji i KPI HR.', 'Wprowadź kwartalny rytm raportowania do zarządu.']
                    : ['Consolidate data sources (one single "source of truth" table).', 'Add emission reduction targets and HR KPIs.', 'Introduce quarterly reporting rhythm to the board.'],
                cta: language === 'pl'
                    ? 'Nie pozwól, aby średni wynik stał się Twoim sufitem. Zarezerwuj rozmowę z ESGSyncPRO: esgsync.pro | esgsync@protonmail.com'
                    : 'Don\'t let an average score become your ceiling. Schedule a call with ESGSyncPRO: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Wersja premium zawiera porównanie z konkurencją i szczegółowy plan osiągnięcia 80% w ciągu 12 miesięcy.'
                    : 'The premium version includes competitor comparison and a detailed plan to reach 80% within 12 months.'
            },
            B: {
                summary: language === 'pl'
                    ? 'Masz solidne fundamenty, ale Twoje ESG działa jak silnik pracujący z połową mocy. Polityki istnieją, niektóre pomiary istnieją, ale brakuje pełnego obrazu. Tu leżą szybkie wygrane – decyzje wdrożone teraz mogą radykalnie poprawić wyniki w przyszłym roku.'
                    : 'You have solid foundations, but your ESG works like an engine running at half power. Policies exist, some measurements exist, but the full picture is missing. This is where quick wins lie – decisions implemented now can radically improve results in the next year.',
                nextSteps: language === 'pl'
                    ? ['Rozszerz monitoring emisji na Scope 1–2 (ostatecznie Scope 3).', 'Wdróż sygnalizowanie i politykę antykorupcyjną.', 'Przygotuj dashboard ESG dla zarządu.']
                    : ['Expand emission monitoring to Scope 1–2 (ultimately Scope 3).', 'Implement whistleblowing and an anti-corruption policy.', 'Prepare an ESG dashboard for the management board.'],
                cta: language === 'pl'
                    ? 'Masz potencjał osiągnięcia wysokiego poziomu ESG w ciągu 6–12 miesięcy. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'You have the potential to reach a high ESG level within 6–12 months. Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Premium wersja raportu daje Ci precyzyjny benchmark branżowy i priorytety działań krok po kroku.'
                    : 'The premium version of the report gives you a precise industry benchmark and step-by-step action priorities.'
            },
            C: {
                summary: language === 'pl'
                    ? 'Twój wynik pokazuje, że ESG istnieje w Twojej firmie, ale nadal jest traktowane jako "dodatkowy projekt". Brakuje systematyzacji i integracji z kluczowymi procesami biznesowymi. Bez tego nie zbudujesz przewagi rynkowej.'
                    : 'Your score shows that ESG exists in your company, but it is still treated as an "additional project". There is a lack of systematization and integration with key business processes. Without this, you will not build a market advantage.',
                nextSteps: language === 'pl'
                    ? ['Zintegruj ESG z procesami biznesowymi (budżet, KPI, bonusy).', 'Wprowadź automatyczne raportowanie ESG do zarządu.', 'Przygotuj strategię ESG na 3 lata z konkretnymi celami.']
                    : ['Integrate ESG with business processes (budget, KPIs, bonuses).', 'Introduce automatic ESG reporting to the board.', 'Prepare a 3-year ESG strategy with specific goals.'],
                cta: language === 'pl'
                    ? 'Przekształć ESG z projektu w przewagę konkurencyjną. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Transform ESG from a project into a competitive advantage. Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Wersja premium pokaże Ci, jak zintegrować ESG z procesami biznesowymi i osiągnąć wysoki poziom dojrzałości w ciągu 18 miesięcy.'
                    : 'The premium version will show you how to integrate ESG with business processes and achieve high maturity level within 18 months.'
            }
        },
        high: {
            A: {
                summary: language === 'pl'
                    ? 'Wysoki wynik ESG to świetny fundament, ale nie gwarantuje utrzymania pozycji. Rynek się zmienia, wymagania rosną, a konkurencja nie śpi. Bez ciągłego rozwoju Twoja przewaga może zniknąć w ciągu 2-3 lat.'
                    : 'A high ESG score is a great foundation, but it doesn\'t guarantee maintaining position. The market is changing, requirements are growing, and competition doesn\'t sleep. Without continuous development, your advantage may disappear within 2-3 years.',
                nextSteps: language === 'pl'
                    ? ['Wprowadź monitoring Scope 3 i zaawansowane KPI ESG.', 'Przygotuj się do raportowania CSRD i TCFD.', 'Rozwijaj innowacje ESG i nowe modele biznesowe.']
                    : ['Introduce Scope 3 monitoring and advanced ESG KPIs.', 'Prepare for CSRD and TCFD reporting.', 'Develop ESG innovations and new business models.'],
                cta: language === 'pl'
                    ? 'Utrzymaj przewagę ESG i zostań liderem w branży. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Maintain your ESG advantage and become an industry leader. Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Wersja premium zawiera benchmark z liderami branży i plan utrzymania pozycji na 3 lata.'
                    : 'The premium version includes a benchmark with industry leaders and a 3-year position maintenance plan.'
            },
            B: {
                summary: language === 'pl'
                    ? 'Twój wynik plasuje Cię w gronie liderów ESG, ale to dopiero początek. Prawdziwa przewaga polega na ciągłym doskonaleniu, innowacjach i wyprzedzaniu trendów. Bez tego szybko stracisz pozycję na rzecz bardziej dynamicznych konkurentów.'
                    : 'Your score places you among ESG leaders, but this is just the beginning. True advantage lies in continuous improvement, innovation, and staying ahead of trends. Without this, you will quickly lose position to more dynamic competitors.',
                nextSteps: language === 'pl'
                    ? ['Wprowadź zaawansowane analizy ESG i predykcyjne modele.', 'Rozwijaj partnerstwa strategiczne w obszarze ESG.', 'Przygotuj strategię ESG na 5 lat z celami science-based.']
                    : ['Introduce advanced ESG analytics and predictive models.', 'Develop strategic partnerships in the ESG area.', 'Prepare a 5-year ESG strategy with science-based goals.'],
                cta: language === 'pl'
                    ? 'Zostań wzorcem ESG w branży. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Become an ESG role model in the industry. Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Wersja premium daje Ci dostęp do najlepszych praktyk globalnych i plan budowania przewagi ESG na dekadę.'
                    : 'The premium version gives you access to global best practices and a plan to build ESG advantage for a decade.'
            },
            C: {
                summary: language === 'pl'
                    ? 'Doskonały wynik ESG to nie koniec, ale początek nowej ery. Masz szansę zostać wzorcem dla całej branży i kształtować standardy ESG. To wymaga strategicznego myślenia i odważnych decyzji, ale nagrody są ogromne.'
                    : 'An excellent ESG score is not the end, but the beginning of a new era. You have a chance to become a role model for the entire industry and shape ESG standards. This requires strategic thinking and bold decisions, but the rewards are enormous.',
                nextSteps: language === 'pl'
                    ? ['Stwórz własne standardy ESG i certyfikaty branżowe.', 'Rozwijaj technologie ESG i rozwiązania dla innych firm.', 'Przygotuj strategię wpływu na politykę ESG w regionie.']
                    : ['Create your own ESG standards and industry certifications.', 'Develop ESG technologies and solutions for other companies.', 'Prepare a strategy to influence ESG policy in the region.'],
                cta: language === 'pl'
                    ? 'Kształtuj przyszłość ESG w branży. Skontaktuj się z nami: esgsync.pro | esgsync@protonmail.com'
                    : 'Shape the future of ESG in the industry. Contact us: esgsync.pro | esgsync@protonmail.com',
                premiumTeaser: language === 'pl'
                    ? 'Wersja premium zawiera plan budowania ekosystemu ESG i strategię wpływu na całą branżę.'
                    : 'The premium version includes a plan to build an ESG ecosystem and a strategy to influence the entire industry.'
            }
        }
    };
    
    // Return content with AI-selected variants
    return {
        summary: content[level][variants.summary].summary,
        nextSteps: content[level][variants.nextSteps].nextSteps,
        cta: content[level][variants.cta].cta,
        premiumTeaser: content[level][variants.premiumTeaser].premiumTeaser
    };
}

/**
 * Generates ESG metrics section HTML
 * @param {Array} documentVerifications - Document verification results with documentContent
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Promise<string>} HTML content for metrics section
 */
async function generateEsgMetricsSection(documentVerifications, language) {
    if (!documentVerifications || documentVerifications.length === 0) {
        return `
            <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #A3CC4B; margin: 0 0 40px 0; font-size: 36px; text-align: center;">📊 ${language === 'pl' ? 'Kluczowe wskaźniki ESG' : 'Key ESG Indicators'}</h1>
                <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 30px 0; border: 3px solid #e5e7eb;">
                    <div style="color: #9ca3af; line-height: 1.8; font-size: 18px; text-align: center; padding: 40px; font-style: italic;">
                        ${language === 'pl' ? 'Dane nie zostały dostarczone' : 'Data not provided'}
                    </div>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${language === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>
        `;
    }
    
    // Extract all document content and group by ESG sphere
    const documentsBySphere = {
        E: [],
        S: [],
        G: []
    };
    
    for (const verification of documentVerifications) {
        if (verification.documentContent && verification.questionId) {
            const sphere = verification.questionId.charAt(0).toUpperCase();
            if (['E', 'S', 'G'].includes(sphere)) {
                documentsBySphere[sphere].push(verification.documentContent);
            }
        }
    }
    
    // Combine all document content
    const allDocumentText = Object.values(documentsBySphere)
        .flat()
        .join('\n\n');
    
    // Calculate metrics for each sphere
    const allMetrics = [];
    const allRecommendations = [];
    
    for (const sphere of ['E', 'S', 'G']) {
        if (documentsBySphere[sphere].length > 0) {
            try {
                // Use relative URL or detect from current location
                let apiBaseUrl = 'http://localhost:3001'; // Default
                if (typeof window !== 'undefined' && window.location) {
                    apiBaseUrl = window.location.origin.includes('localhost') 
                        ? 'http://localhost:3001' 
                        : window.location.origin;
                }
                const response = await fetch(`${apiBaseUrl}/api/calculate-esg-metrics`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        documentText: documentsBySphere[sphere].join('\n\n'),
                        esgSphere: sphere,
                        language: language === 'pl' ? 'pl' : 'en'
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.metrics) {
                        allMetrics.push(...data.metrics.map(m => ({ ...m, sphere })));
                        if (data.recommendations) {
                            allRecommendations.push(...data.recommendations);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error calculating metrics for sphere ${sphere}:`, error);
            }
        }
    }
    
    // Generate HTML for metrics display
    let metricsHtml = '';
    let recommendationsHtml = '';
    
    if (allMetrics.length > 0) {
        // Group metrics by sphere
        const metricsBySphere = {
            E: allMetrics.filter(m => m.sphere === 'E'),
            S: allMetrics.filter(m => m.sphere === 'S'),
            G: allMetrics.filter(m => m.sphere === 'G')
        };
        
        const sphereNames = {
            E: language === 'pl' ? 'Środowisko (E)' : 'Environment (E)',
            S: language === 'pl' ? 'Społeczne (S)' : 'Social (S)',
            G: language === 'pl' ? 'Zarządzanie (G)' : 'Governance (G)'
        };
        
        for (const sphere of ['E', 'S', 'G']) {
            const metrics = metricsBySphere[sphere];
            if (metrics.length > 0) {
                metricsHtml += `
                    <div style="margin-bottom: 40px;">
                        <h2 style="color: #A3CC4B; font-size: 24px; margin-bottom: 20px;">${sphereNames[sphere]}</h2>
                        <div style="display: grid; gap: 15px;">
                `;
                
                for (const metric of metrics) {
                    const statusColor = metric.status === 'calculated' ? '#10b981' : 
                                      metric.status === 'insufficient_data' ? '#f59e0b' : '#ef4444';
                    const statusIcon = metric.status === 'calculated' ? '✅' : 
                                      metric.status === 'insufficient_data' ? '⚠️' : '❌';
                    const statusText = metric.status === 'calculated' ? 
                        (language === 'pl' ? 'Obliczone' : 'Calculated') :
                        metric.status === 'insufficient_data' ?
                        (language === 'pl' ? 'Niewystarczające dane' : 'Insufficient data') :
                        (language === 'pl' ? 'Błąd' : 'Error');
                    
                    const valueDisplay = metric.status === 'calculated' && metric.value !== null ?
                        formatMetricValue(metric, language) : '-';
                    
                    metricsHtml += `
                        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ${statusColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <div>
                                    <div style="font-weight: bold; color: #1e293b; font-size: 18px; margin-bottom: 5px;">
                                        ${statusIcon} ${metric.metricName || metric.metricKey}
                                    </div>
                                    ${metric.description ? `<div style="color: #64748b; font-size: 14px;">${metric.description}</div>` : ''}
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 24px; font-weight: bold; color: ${statusColor};">
                                        ${valueDisplay}
                                    </div>
                                    <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
                                        ${statusText}
                                    </div>
                                </div>
                            </div>
                            ${metric.status === 'insufficient_data' && metric.missingFields && metric.missingFields.length > 0 ? `
                                <div style="background: #fef3c7; padding: 10px; border-radius: 8px; margin-top: 10px;">
                                    <div style="font-size: 12px; color: #92400e;">
                                        <strong>${language === 'pl' ? 'Brakujące pola:' : 'Missing fields:'}</strong> ${metric.missingFields.join(', ')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }
                
                metricsHtml += `
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Generate recommendations HTML
    if (allRecommendations.length > 0) {
        recommendationsHtml = `
            <div style="background: #f0f9ff; padding: 30px; border-radius: 15px; border: 2px solid #0ea5e9; margin-top: 40px;">
                <h3 style="color: #0c4a6e; font-size: 20px; margin-bottom: 20px;">💡 ${language === 'pl' ? 'Rekomendacje' : 'Recommendations'}</h3>
                <ul style="color: #075985; line-height: 1.8; padding-left: 20px;">
                    ${allRecommendations.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    return `
        <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
            <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">📊 ${language === 'pl' ? 'Kluczowe wskaźniki ESG' : 'Key ESG Indicators'}</h1>
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 30px 0; border: 3px solid #A3CC4B;">
                ${metricsHtml || `
                    <div style="color: #475569; line-height: 1.8; font-size: 18px; text-align: center; padding: 40px;">
                        ${language === 'pl'
                            ? 'Kluczowe wskaźniki ESG wyodrębnione z przesłanego dokumentu i przedstawione w ustrukturyzowanej formie.'
                            : 'Key ESG indicators extracted from uploaded document and presented in structured format.'}
                    </div>
                `}
                ${recommendationsHtml}
                <div style="color: #64748b; font-size: 14px; text-align: center; margin-top: 20px; font-style: italic;">
                    ${language === 'pl'
                        ? 'Wskaźniki obejmują metryki dotyczące środowiska (E), aspektów społecznych (S) i zarządzania (G).'
                        : 'Indicators include metrics for Environment (E), Social (S), and Governance (G).'}
                </div>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                <div style="font-size: 14px; font-weight: 500;">${language === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
            </div>
            <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
        </div>
    `;
}

/**
 * Format metric value for display
 * @param {Object} metricResult - Metric calculation result
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Formatted value string
 */
function formatMetricValue(metricResult, language = 'en') {
    if (metricResult.status !== 'calculated' || metricResult.value === null) {
        return '-';
    }
    
    const value = metricResult.value;
    const unit = metricResult.unit || '';
    
    // Format based on unit type
    if (unit === 'ratio' || unit === '%') {
        if (unit === '%') {
            return `${value.toFixed(2)}%`;
        }
        return value.toFixed(3);
    } else if (unit.includes('/')) {
        // Composite unit like "m³/units"
        return `${value.toFixed(2)} ${unit}`;
    } else {
        return `${value.toFixed(2)} ${unit}`;
    }
}

/**
 * Generates HTML content for PDF based on assessment scores and language
 * @param {Object} scores - Assessment scores object
 * @param {string} currentLanguage - Current language ('pl' or 'en')
 * @param {Function} t - Translation function
 * @param {Object} recommendations - Recommendations object
 * @param {Object} clientDetails - Client details from survey form
 * @param {Array} documentVerifications - Document verification results
 * @param {boolean} hasEsgDocument - Whether ESG document was uploaded
 * @returns {Promise<string>} HTML content string
 */
/**
 * Generates automatic peer companies for comparison when user hasn't selected any companies
 * @param {string} industry - Industry name
 * @param {string} language - Language code ('pl' or 'en')
 * @param {Object} industryAvg - Industry average data (optional)
 * @param {Object} benchmarkData - Existing benchmark data from database (optional)
 * @returns {Object} Object with peer company names as keys and ESG metrics as values
 */
function generateAutoPeerCompanies(industry, language = 'en', industryAvg = null, benchmarkData = {}) {
    // Default number of peers to generate
    const numPeers = 5;
    
    // Generate neutral peer names
    const peerNames = [];
    const peerLabel = language === 'pl' ? 'Peer' : 'Peer';
    for (let i = 1; i <= numPeers; i++) {
        peerNames.push(`${peerLabel} ${i}`);
    }
    
    // Industry-specific default metrics (based on typical industry patterns)
    // These serve as base values when no industry average is available
    const industryDefaults = {
        'Manufacturing': { scope1: 3500, ren: 28, paygap: 22 },
        'Service': { scope1: 1200, ren: 35, paygap: 18 },
        'IT / Software': { scope1: 800, ren: 65, paygap: 12 },
        'Fintech': { scope1: 600, ren: 70, paygap: 10 },
        'Retail': { scope1: 2500, ren: 30, paygap: 20 },
        'Transport / Logistic': { scope1: 4500, ren: 15, paygap: 25 },
        'Global (Inne)': { scope1: 2500, ren: 35, paygap: 18 }
    };
    
    // Find matching industry defaults
    let baseMetrics = { scope1: 2500, ren: 35, paygap: 18 }; // Global default
    for (const key in industryDefaults) {
        if (industry && industry.toLowerCase().includes(key.toLowerCase().replace(' / ', ' ').replace('(', '').replace(')', ''))) {
            baseMetrics = industryDefaults[key];
            break;
        }
    }
    
    // Use industry average if available, otherwise use defaults
    const avgScope1 = (industryAvg && typeof industryAvg.scope1 === 'number') ? industryAvg.scope1 : baseMetrics.scope1;
    const avgRen = (industryAvg && typeof industryAvg.ren === 'number') ? industryAvg.ren : baseMetrics.ren;
    const avgPaygap = (industryAvg && typeof industryAvg.paygap === 'number') ? industryAvg.paygap : baseMetrics.paygap;
    
    // Generate peer companies with realistic variation
    // Variation: ±30% for scope1, ±15% for ren, ±10% for paygap
    const peers = {};
    
    peerNames.forEach((peerName, index) => {
        // Create variation based on index to ensure diversity
        // Use a deterministic approach so same industry always generates same peers
        const variationFactor = (index % 3) - 1; // -1, 0, or 1
        const scope1Variation = 1 + (variationFactor * 0.25); // ±25%
        const renVariation = 1 + (variationFactor * 0.12); // ±12%
        const paygapVariation = 1 + (variationFactor * 0.08); // ±8%
        
        // Add small random component for more natural variation
        const randomScope1 = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const randomRen = 0.92 + Math.random() * 0.16; // 0.92 to 1.08
        const randomPaygap = 0.94 + Math.random() * 0.12; // 0.94 to 1.06
        
        peers[peerName] = {
            scope1: Math.round(avgScope1 * scope1Variation * randomScope1),
            ren: Math.max(0, Math.min(100, Math.round(avgRen * renVariation * randomRen * 10) / 10)), // Round to 1 decimal, clamp 0-100
            paygap: Math.max(0, Math.min(100, Math.round(avgPaygap * paygapVariation * randomPaygap * 10) / 10)) // Round to 1 decimal, clamp 0-100
        };
    });
    
    return peers;
}

/**
 * Gets Istotność (Materiality) label and comment based on MS score
 * Per system1.pdf specification:
 * MS >= 81: Priorytet Strategiczny / Krytyczna Ekspozycja (Critical)
 * MS 46-80: Istotny Wpływ Operacyjny (High)
 * MS 0-45: Standardowa Odpowiedzialność (Moderate)
 * @param {number} msValue - Materiality Score (0-100)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {Object} Object with label and comment
 */
function getIstotnoscLabel(msValue, language) {
    // Try to use new methodology-based comments if ESGScoring is available
    if (typeof ESGScoring !== 'undefined' && ESGScoring.getMaterialityComment) {
        const result = ESGScoring.getMaterialityComment(msValue, language);
        return {
            label: `[${result.label.toUpperCase()}]`,
            color: result.color === 'red' ? '#ef4444' : (result.color === 'orange' ? '#f97316' : '#22c55e'),
            comment: result.text
        };
    }

    // Fallback: Use hardcoded values per system1.pdf specification
    if (msValue >= 81) {
        // Critical (red) - MS 81-100
        return {
            label: language === 'pl' ? '[PRIORYTET STRATEGICZNY / KRYTYCZNA EKSPOZYCJA]' : '[STRATEGIC PRIORITY / CRITICAL EXPOSURE]',
            color: '#ef4444',
            comment: language === 'pl'
                ? 'Filar o czerwonej barwie jest w Twojej branży kluczowy, bo to właśnie w tym obszarze banki, leasingodawcy i najwięksi klienci najczęściej sprawdzają, czy firma jest przewidywalna i dobrze zarządzana. W praktyce padają tu trzy podstawowe pytania: kto jest za to odpowiedzialny, jak firma działa w tym temacie na co dzień oraz czy są dowody, że to nie są tylko deklaracje. Dlatego braki w tym filarze są zwykle traktowane jako ryzyko wysokiej wagi, nawet jeśli firma operacyjnie działa poprawnie.'
                : 'The red pillar is key in your industry because this is the area where banks, lessors and largest clients most often check whether the company is predictable and well-managed. In practice, three basic questions arise here: who is responsible, how the company operates daily, and whether there is evidence that these are not just declarations.'
        };
    } else if (msValue >= 46) {
        // High (orange) - MS 46-80
        return {
            label: language === 'pl' ? '[ISTOTNY WPŁYW OPERACYJNY]' : '[SIGNIFICANT OPERATIONAL IMPACT]',
            color: '#f59e0b',
            comment: language === 'pl'
                ? 'Filar o pomarańczowej barwie ma w Twojej branży duże znaczenie dla sprawności działania firmy i tego, jak jesteś oceniany w przetargach oraz w rozmowach o finansowaniu. To nie zawsze jest ryzyko „na już", ale dojrzałość w tym obszarze często decyduje o tym, czy przechodzisz dalej bez dodatkowych pytań i dodatkowych warunków. Uporządkowanie tego filaru daje praktyczną przewagę i zmniejsza tarcie w łańcuchu współpracy.'
                : 'The orange pillar has great importance for operational efficiency and how you are assessed in tenders and financing conversations. It is not always an immediate risk, but maturity in this area often determines whether you proceed without follow-up questions and additional conditions.'
        };
    } else {
        // Moderate (green) - MS 0-45
        return {
            label: language === 'pl' ? '[STANDARDOWA ODPOWIEDZIALNOŚĆ]' : '[STANDARD RESPONSIBILITY]',
            color: '#22c55e',
            comment: language === 'pl'
                ? 'Filar o zielonej barwie ma w Twojej branży umiarkowane znaczenie i zwykle nie jest pierwszym powodem dodatkowych pytań ze strony rynku. Wystarczy utrzymać podstawowy porządek i minimum praktyk, żeby temat był "zamknięty" i nie wracał w rozmowach. Warto traktować to jako element budowania stabilnego wizerunku i kultury działania firmy, ale bez presji natychmiastowych zmian.'
                : 'The green pillar has moderate importance in your industry and is usually not the first reason for additional questions from the market. It is enough to maintain basic order and minimum practices for the topic to be "closed" and not return in conversations.'
        };
    }
}

async function generatePdfHtmlContent(scores, currentLanguage, t, recommendations, clientDetails, documentVerifications = [], hasEsgDocument = false, esgDocumentAnalysis = null) {
    // Task #8 from Korekta.pdf: Unified product name throughout the report
    const REPORT_TITLE = {
        'pl': 'Raport oceny ESG',
        'en': 'ESG Assessment Report'
    };

    // Task #2 from Korekta.pdf: Dynamic report generation date
    // Use clientDetails.generatedAt if available, otherwise current date
    const reportGeneratedAt = clientDetails?.generatedAt
        ? new Date(clientDetails.generatedAt)
        : new Date();

    // Determine ESG level (NEW 4-state system) and content level (OLD 3-state for backward compat)
    const esgLevel = getEsgLevel(scores.percent);
    const contentLevel = mapLevelToContent(esgLevel); // Map to low/medium/high for content functions

    // Use AI to select random variants for each text section
    let selectedVariants;
    if (typeof selectTextVariantsWithAI === 'function') {
        selectedVariants = await selectTextVariantsWithAI(contentLevel, currentLanguage);
    } else {
        // Fallback if AI function is not available
        const variants = ['A', 'B', 'C'];
        selectedVariants = {
            summary: variants[Math.floor(Math.random() * 3)],
            nextSteps: variants[Math.floor(Math.random() * 3)],
            cta: variants[Math.floor(Math.random() * 3)],
            premiumTeaser: variants[Math.floor(Math.random() * 3)]
        };
    }
    
    // Get AI recommendation for client comment if it exists
    let aiRecommendation = '';
    if (clientDetails && clientDetails.comment && clientDetails.comment.trim() !== '') {
        // Detect language from comment or use currentLanguage
        const polishChars = /[ąćęłńóśźż]/i;
        const commentLanguage = polishChars.test(clientDetails.comment) ? 'pl' : currentLanguage;
        
        try {
            aiRecommendation = await getCommentRecommendation(clientDetails.comment, commentLanguage);
            // Ensure we always have a recommendation (fallback if empty)
            if (!aiRecommendation || aiRecommendation.trim() === '') {
                aiRecommendation = commentLanguage === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
            }
        } catch (error) {
            console.error('Error getting comment recommendation:', error);
            aiRecommendation = commentLanguage === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
        }
    }
    
    const esgContent = getEsgContentWithVariants(contentLevel, selectedVariants, currentLanguage);
    
    // Calculate ESG metrics section if documents are available
    let esgMetricsSectionHtml = '';
    if (hasEsgDocument && documentVerifications && documentVerifications.length > 0) {
        try {
            esgMetricsSectionHtml = await generateEsgMetricsSection(documentVerifications, currentLanguage);
        } catch (error) {
            console.error('Error generating ESG metrics section:', error);
            esgMetricsSectionHtml = `
                <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                    <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">📊 ${currentLanguage === 'pl' ? 'Kluczowe wskaźniki ESG' : 'Key ESG Indicators'}</h1>
                    <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 30px 0; border: 3px solid #e5e7eb;">
                        <div style="color: #9ca3af; line-height: 1.8; font-size: 18px; text-align: center; padding: 40px; font-style: italic;">
                            ${currentLanguage === 'pl' ? 'Błąd podczas obliczania wskaźników' : 'Error calculating indicators'}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // NEW: 4-state system per "_system punktacji i progów przejścia.pdf"
    const levels = {
        critical: t('survey.level.critical', currentLanguage === 'pl' ? 'Krytyczny' : 'Critical'),
        elevated: t('survey.level.elevated', currentLanguage === 'pl' ? 'Podwyższone ryzyko' : 'Elevated Risk'),
        moderate: t('survey.level.moderate', currentLanguage === 'pl' ? 'Umiarkowany' : 'Moderate'),
        good: t('survey.level.good', currentLanguage === 'pl' ? 'Dobry' : 'Good')
    };

    // Thresholds: 81/51/31 per spec
    // Determine state from percent
    let percentState;
    if (scores.percent >= 81) {
        percentState = 'green';
    } else if (scores.percent >= 51) {
        percentState = 'yellow';
    } else if (scores.percent >= 31) {
        percentState = 'orange';
    } else {
        percentState = 'critical';
    }

    // Use worse of TOP3 state and percent state
    let finalState = percentState;
    if (scores.relevance && scores.relevance.executive && scores.relevance.executive.state && scores.relevance.executive.source === 'TOP3') {
        const top3State = scores.relevance.executive.state;
        const stateSeverity = { 'green': 1, 'yellow': 2, 'orange': 3, 'critical': 4 };
        if (stateSeverity[top3State] > stateSeverity[percentState]) {
            finalState = top3State;
        }
    }

    const stateToInterp = {
        'green': levels.good,
        'yellow': levels.moderate,
        'orange': levels.elevated,
        'critical': levels.critical
    };
    const interp = stateToInterp[finalState] || levels.good;
    
    const supplyLabel = t('survey.result.cat.sup','Supply');
    const overallLabel = t('survey.result.overall','Score');
    const logobase64 = "PHN2ZyB3aWR0aD0iNzEiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA3MSA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yNS4yNDQgOS4wODA4QzI3LjQzOTMgMTAuNzg0OCAyOC42NjQ2IDEzLjUwNTggMjkuMDE3NiAxNi4xNTEzQzI5LjQ1NDIgMjAuMDI3MyAyNy44NDEyIDIyLjk1NTkgMjUuNjkwNSAyNi4wNDg4QzI0LjgyMTUgMjcuMzA0MSAyNC4wNzYxIDI4LjQwNTUgMjMuOTA3IDI5LjkyNkMyMy43OCAzMC43NTI4IDIzLjY1IDMxLjM4NDIgMjIuOTk5MSAzMS45ODAxQzIxLjA4MTMgMzMuMjYwNSAxOC44MTEyIDMzLjY2NjEgMTYuNTM4OCAzMy4yNzFDMTUuMTE4NCAzMi45NTU2IDEzLjc0MDggMzIuNDU0IDEyLjgwMjkgMzEuMzI4NUMxMi41Mzg1IDMwLjkxOTUgMTIuNDg1NSAzMC40NzMxIDEyLjQyMzkgMzAuMDA0QzEyLjA5NDYgMjguMDMxMSAxMS4wMDEgMjYuNDg5NyA5LjgzNjcxIDI0Ljg3QzcuNzM3NjIgMjEuOTQyOCA2LjgzMDU5IDE4LjgzOTUgNy40Mzk4IDE1LjI3MDVDNy45MDkxNiAxMi43NTQ0IDkuMjc5OTMgMTAuNDA2OSAxMS4zOTQ2IDguODM5QzE1LjcyMjYgNS45OTUyNyAyMS4wMjQ4IDYuMDk5NTMgMjUuMjQ0IDkuMDgwOFpNMTAuOTI5MiAxMS4xMDNDOS4wNDA3MiAxMy4yODc2IDguNDEyNTMgMTUuOTQ2NCA4LjYzNzk0IDE4LjczNjNDOC45ODk4MSAyMS4zMzIzIDEwLjMzNTUgMjMuMzQxNiAxMS44ODY5IDI1LjQxNTRDMTIuMjk0MyAyNS45NzI0IDEyLjY0MjMgMjYuNTUxMyAxMi45Nzg4IDI3LjE1MDJDMTMuMDI3MiAyNy4yMzQ5IDEzLjA3NTYgMjcuMzE5NSAxMy4xMjU1IDI3LjQwNjdDMTMuNTY2MSAyOC4yMTExIDEzLjgwODEgMjkuMDE2NiAxMy44MjkxIDI5LjkzNDZDMTMuODgyNiAzMC40Mzc0IDEzLjkyNTUgMzAuNTIxMiAxNC4yOTQ1IDMwLjkyMzVDMTUuODcxIDMxLjk3NiAxNy42NTU0IDMyLjIyMDMgMTkuNTIxNCAzMS45MjFDMjAuNjI5MyAzMS42NTEzIDIxLjcyNzYgMzEuMzUwOCAyMi4zODU1IDMwLjM5NDRDMjIuNDMzIDMwLjEyMSAyMi40NzA1IDI5Ljg0NTkgMjIuNTAxOCAyOS41NzAzQzIyLjc1NzEgMjcuODU2IDIzLjU4NzkgMjYuNTI1OCAyNC41ODcyIDI1LjEyMTRDMjYuNjc5NSAyMi4xOCAyNy45NTU1IDE5LjQ5MjUgMjcuNDY4NyAxNS44MzQ3QzI3LjAwMDQgMTMuNDkwNiAyNS44NjY3IDExLjIyODEgMjMuODEwOCA5LjgzNTk5QzE5LjY4MjIgNy4yODU4NyAxNC4zNjgyIDcuNTI0NjYgMTAuOTI5MiAxMS4xMDNaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNNjkuNDEgMy40NTIzNEM3MC4zMDY5IDQuMTU1MDcgNzAuNjAxNCA0Ljg5NDk4IDcwLjc4ODMgNS45Njc4NUM3MC4yODY5IDYuMDU0MyA2OS44NTM2IDYuMDg4MzQgNjkuMzU2MyA1Ljk2Nzg1QzY5LjA3NzggNS42NDAzMyA2OC45MDY4IDUuMzA0NjUgNjguNzExOSA0LjkyNTMyQzY4LjMyOTUgNC4zMTA2IDY3Ljc0NDUgNC4xMzE5MSA2Ny4wNTg5IDMuOTQ1MTRDNjUuOTg3NSAzLjcxOTIzIDY1LjAyMjIgNC4wMDc4OSA2NC4wOTM2IDQuNTE5MjZDNjIuOTU0NyA1LjcxNDk5IDYyLjg0NyA3LjExNTYzIDYyLjg3MTkgOC42NjMzNkM2Mi45MTQgOS42NTg0NyA2My4xODYzIDEwLjQ1OTggNjMuODI1MSAxMS4yNDE4QzY0LjU4NDUgMTEuODAyNiA2NS4yMzY4IDEyLjAxMzUgNjYuMTg3OSAxMi4wMDUxQzY2LjI4OTEgMTIuMDA0NSA2Ni4zOTAzIDEyLjAwMzkgNjYuNDk0NiAxMi4wMDMzQzY3LjU3NjEgMTEuOTY5MSA2OC4xMTcxIDExLjYyOTQgNjguODM3MiAxMC44OTQ4QzY5LjMwMDUgMTAuMjA0IDY5LjM3NDggOS43MjgxNSA2OS40OTk1IDguODgyMzhDNjguNDEyNiA4Ljg4MjM4IDY3LjMyNTcgOC44ODIzOCA2Ni4yMDU4IDguODgyMzhDNjYuMjA1OCA4LjQyNDM4IDY2LjIwNTggNy45NjYzOSA2Ni4yMDU4IDcuNDk0NTFDNjcuNzY1MyA3LjQ5NDUxIDY5LjMyNDggNy40OTQ1MSA3MC45MzE1IDcuNDk0NTFDNzAuOTMxNSA5LjM3MjMgNzAuOTMxNSAxMS4yNTAxIDcwLjkzMTUgMTMuMTg0OEM3MC42MDA3IDEzLjE4NDggNzAuMjY5OSAxMy4xODQ4IDY5LjkyOTEgMTMuMTg0OEM2OS43ODczIDEyLjgxODQgNjkuNjQ1NiAxMi40NTIgNjkuNDk5NSAxMi4wNzQ1QzY5LjM2OTYgMTIuMjAwNCA2OS4yMzk2IDEyLjMyNjQgNjkuMTA1NyAxMi40NTYyQzY4LjE2NDEgMTMuMjM0MiA2Ni45MjM0IDEzLjU2MjggNjUuNjk2OCAxMy41MDc0QzY0LjE3NzcgMTMuMzEyMiA2My4wMzIzIDEyLjY1NTYgNjIuMDUyOSAxMS41MTkzQzYxLjAxMTggOS45MzI0IDYwLjk1MzggNy45NjQ3IDYxLjI4NzEgNi4xNTQzNUM2MS43MTQ1IDQuNzc0OTEgNjIuNjE2NiAzLjYyOTQ0IDYzLjkxNDYgMi45MTQ1NEM2NS43Njc1IDIuMDg3MTggNjcuNzY5OSAyLjM0MTk5IDY5LjQxIDMuNDUyMzRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNNTguMDc5IDMuMDE4NjJDNTguNzE1OCAzLjUyMzU5IDU5LjI1NjUgNC4wNjczNiA1OS40NzUyIDQuODU3NTVDNTkuNDg2MiA1LjE4MTIxIDU5LjQ4ODMgNS41MDU0NyA1OS40NzUyIDUuODI5MDZDNTkuMDAyNyA1LjgyOTA2IDU4LjUzMDEgNS44MjkwNiA1OC4wNDMyIDUuODI5MDZDNTcuOTkgNS42MzQ0MSA1Ny45MzY5IDUuNDM5NzYgNTcuODgyMSA1LjIzOTIxQzU3LjcwOTYgNC43MzU0IDU3LjYyNjkgNC41OTA5OCA1Ny4xOTI5IDQuMjMzMDFDNTYuMzM0NiAzLjgyNTU4IDU1LjM4MjkgMy43MzA4NyA1NC40NDg2IDMuOTU5NzdDNTMuOTI0OSA0LjE1ODQ2IDUzLjU0OSA0LjM1NjA5IDUzLjMxNzUgNC44NTc1NUM1My4yMDIgNS42MjcxMiA1My4yMDIgNS42MjcxMiA1My40ODA5IDYuMzE4NjFDNTMuODQzOCA2LjU5NzIzIDU0LjE3NTMgNi42NTcxNyA1NC42MjU5IDYuNzU2NjZDNTQuODAwMiA2Ljc5NjY0IDU0Ljk3NDYgNi44MzY2MyA1NS4xNTQyIDYuODc3ODJDNTUuNDI3OSA2LjkzODM0IDU1LjQyNzkgNi45MzgzNCA1NS43MDcyIDcuMDAwMDhDNTguNzUyNSA3LjY3NDY0IDU4Ljc1MjUgNy42NzQ2NCA1OS40NzkyIDguNjE5OThDNTkuOTI5MSA5LjQ2NzU4IDYwLjAxMDggMTAuNDU5NiA1OS43NDQ5IDExLjM3MTNDNTkuMzc5NiAxMi4xOTk5IDU4Ljc1NzcgMTIuNzE3MyA1Ny45MTg1IDEzLjA3NjlDNTYuNTMwMyAxMy41NjgxIDU1LjAxMzIgMTMuNjU5IDUzLjYwMzkgMTMuMTg0OEM1Mi42MTgzIDEyLjczNjEgNTEuODU4MSAxMi4wNjcxIDUxLjQwMjEgMTEuMTAzQzUxLjMwMDYgMTAuNjMwNiA1MS4yOTI4IDEwLjE5NjMgNTEuMzEyNiA5LjcxNTFDNTEuNzg1MiA5LjcxNTEgNTIuMjU3OCA5LjcxNTEgNTIuNzQ0NyA5LjcxNTFDNTIuNzkzNCAxMC4wMDI4IDUyLjc5MzQgMTAuMDAyOCA1Mi44NDMxIDEwLjI5NjNDNTIuOTg5NSAxMC45MzE2IDUzLjIwMzUgMTEuMjUzOCA1My43NDcxIDExLjY1ODFDNTQuMzQ3MyAxMS45NTM3IDU0LjkxMTQgMTEuOTg0MiA1NS41NzI5IDExLjk3OTFDNTUuNjc0MSAxMS45Nzg1IDU1Ljc3NTMgMTEuOTc3OSA1NS44Nzk1IDExLjk3NzNDNTYuNjkwMSAxMS45NjA0IDU3LjMxNjIgMTEuODY1NCA1OC4wNDMyIDExLjUxOTNDNTguMjQ3NyAxMC45OTExIDU4LjI4MjIgMTAuNDA4OSA1OC4xODY0IDkuODUzODlDNTcuNTU5NSA4Ljk0MjU5IDU2LjQ4NTUgOC44MzY2MiA1NS40NDkzIDguNjE5NDRDNTIuODcwOSA4LjA3MzYzIDUyLjg3MDkgOC4wNzM2MyA1MS45NTcgNy4xMjE1MkM1MS41NjgyIDYuMjg5MjIgNTEuNDkyIDUuNDk1MjYgNTEuNzYwMSA0LjYxNDY3QzUyLjEzNjUgMy42ODcyNiA1Mi42OTIgMy4xNTk3MyA1My42MDg5IDIuNzQyNjdDNTQuOTg2OCAyLjIyNDk4IDU2Ljc4MTcgMi4zNDE1OSA1OC4wNzkgMy4wMTg2MloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik01MS40NTU4IDI3LjIwMjNDNTIuOTAwMSAyNy4xODA4IDUyLjkwMDEgMjcuMTgwOCA1NC4zNzM2IDI3LjE1ODlDNTQuODI1MSAyNy4xNDk0IDU0LjgyNTEgMjcuMTQ5NCA1NS4yODU2IDI3LjEzOThDNTcuOTI3MSAyNy4xMDczIDU3LjkyNzEgMjcuMTA3MyA1OC45MDI0IDI3Ljg5NjJDNTkuNDc1NiAyOC41MzE5IDU5LjY1MzIgMjkuMjgxNSA1OS42MTg1IDMwLjExNjhDNTkuNDUwOSAzMS4wNDc0IDU5LjAwNzggMzEuNjc1OSA1OC4zMjk2IDMyLjMzNzRDNTguNDE1MyAzMi4zNjg5IDU4LjUwMDkgMzIuNDAwNCA1OC41ODkyIDMyLjQzMjhDNTkuMDIxOSAzMi42ODQ1IDU5LjEzMjMgMzIuODUzMyA1OS4zMzIgMzMuMzA4OUM1OS40MTczIDMzLjg0MTggNTkuNDUxNCAzNC4zNzU2IDU5LjQ4NDIgMzQuOTEzNkM1OS41MDI3IDM1LjIwMDEgNTkuNTIyMiAzNS40ODY2IDU5LjU0MjkgMzUuNzcyOUM1OS41NTQ2IDM1Ljk2MjUgNTkuNTU0NiAzNS45NjI1IDU5LjU2NjUgMzYuMTU2QzU5LjYwNzEgMzYuNTUxNCA1OS42MDcxIDM2LjU1MTQgNTkuOTA0OSAzNy4wNTYyQzU5LjMzNzggMzcuMDU2MiA1OC43NzA3IDM3LjA1NjIgNTguMTg2NCAzNy4wNTYyQzU4LjA1NDIgMzYuNjcxNyA1OC4wMTEgMzYuMzgxNCA1Ny45ODE3IDM1Ljk4MTFDNTcuOTcxMiAzNS44NTM1IDU3Ljk2MDYgMzUuNzI1OCA1Ny45NDk4IDM1LjU5NDNDNTcuOTI4NiAzNS4zMjYyIDU3LjkwODQgMzUuMDU4IDU3Ljg4OTQgMzQuNzg5OEM1Ny44Nzg1IDM0LjY2MTkgNTcuODY3NiAzNC41MzQxIDU3Ljg1NjQgMzQuNDAyNEM1Ny44NDMxIDM0LjIyNzYgNTcuODQzMSAzNC4yMjc2IDU3LjgyOTYgMzQuMDQ5MkM1Ny43NDI0IDMzLjY2MSA1Ny42MDYxIDMzLjQ1OTEgNTcuMzI3MiAzMy4xNzAxQzU2Ljg1NDMgMzMuMDE3NCA1Ni40NzY0IDMzLjAwMjcgNTUuOTc4NSAzMi45ODc0QzU1LjczNTkgMzIuOTc5NSA1NS43MzU5IDMyLjk3OTUgNTUuNDg4NCAzMi45NzE0QzU1LjI4MyAzMi45NjU0IDU1LjA3NzUgMzIuOTU5NCA1NC44NjU5IDMyLjk1MzNDNTQuMjEzMSAzMi45MzMyIDUzLjU2MDQgMzIuOTEzMiA1Mi44ODc5IDMyLjg5MjZDNTIuODg3OSAzNC4yNjY1IDUyLjg4NzkgMzUuNjQwNSA1Mi44ODc5IDM3LjA1NjJDNTIuNDE1MyAzNy4wNTYyIDUxLjk0MjcgMzcuMDU2MiA1MS40NTU4IDM3LjA1NjJDNTEuNDU1OCAzMy44MDQ0IDUxLjQ1NTggMzAuNTUyNiA1MS40NTU4IDI3LjIwMjNaTTUyLjg4NzkgMjguMzEyNkM1Mi44ODc5IDI5LjQxMTggNTIuODg3OSAzMC41MTEgNTIuODg3OSAzMS42NDM1QzUzLjUxNzQgMzEuNjUxIDU0LjE0NjggMzEuNjU2NSA1NC43NzY0IDMxLjY2MDhDNTUuMDQ0IDMxLjY2NDMgNTUuMDQ0IDMxLjY2NDMgNTUuMzE3IDMxLjY2NzlDNTUuNDg5MiAzMS42Njg4IDU1LjY2MTMgMzEuNjY5NyA1NS44Mzg3IDMxLjY3MDZDNTUuOTk2OSAzMS42NzIgNTYuMTU1MSAzMS42NzM1IDU2LjMxODIgMzEuNjc1QzU2LjkzOSAzMS42MzAxIDU3LjMzMTkgMzEuNDgyIDU3LjgwMTYgMzEuMDg4M0M1OC4xNDQyIDMwLjQ5NzkgNTguMTM5MSAyOS45NDg0IDU4LjA0MzIgMjkuMjg0MUM1Ny45MDU5IDI4Ljg0ODcgNTcuNzg0MyAyOC43NDQ5IDU3LjM3NTIgMjguNTA3QzU2Ljg1MjIgMjguMjk0MSA1Ni41MDA4IDI4LjI2NDQgNTUuOTM2NiAyOC4yNzE5QzU1LjY2OTMgMjguMjczOSA1NS42NjkzIDI4LjI3MzkgNTUuMzk2NyAyOC4yNzZDNTUuMTIwNyAyOC4yODEyIDU1LjEyMDcgMjguMjgxMiA1NC44MzkgMjguMjg2NkM1NC42NTE3IDI4LjI4ODQgNTQuNDY0MyAyOC4yOTAzIDU0LjI3MTIgMjguMjkyMkM1My44MTAxIDI4LjI5NzEgNTMuMzQ5IDI4LjMwNDYgNTIuODg3OSAyOC4zMTI2WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTY4LjU2NTkgMjcuNDA1QzY5LjgwNDQgMjguMTM4MyA3MC4zNSAyOS4xODgxIDcwLjgzMzEgMzAuNDgxMUM3MS4yMTkzIDMyLjI3MjggNzAuOTM2MSAzMy45Mzk3IDY5Ljk3MzkgMzUuNTAzNUM2OS4yNTI2IDM2LjQ4NTMgNjguMTM5NSAzNy4xMTM1IDY2LjkyMTggMzcuMzMzN0M2NS4zNjk0IDM3LjQ3IDYzLjk3MTIgMzcuMzAzMSA2Mi43NDIxIDM2LjMyMzJDNjEuNDc4NSAzNS4xNjIgNjAuOTg1NyAzMy43NDQ3IDYwLjkwMjMgMzIuMDc4OEM2MC45MTk2IDMwLjU3NzEgNjEuNDM2NCAyOS4yNDU1IDYyLjQ5MzIgMjguMTQ0NUM2NC4xMzI2IDI2LjY2ODQgNjYuNTgzNCAyNi40NjQxIDY4LjU2NTkgMjcuNDA1Wk02My4zNTkxIDI5LjE1NzhDNjIuNDA2NSAzMC40NTkxIDYyLjMwMjEgMzEuODcyNyA2Mi41NDQxIDMzLjQyNjZDNjIuODE1OCAzNC40NzgzIDYzLjQxNyAzNS4yMzY0IDY0LjM3MSAzNS43OTg0QzY1LjQ0NTkgMzYuMTkxOSA2Ni40MDE0IDM2LjE5MTIgNjcuNDc5NiAzNS44MDI3QzY4LjQxMDcgMzUuMzg3NSA2OC44NTc3IDM0Ljc1NjYgNjkuMjEzMSAzMy44NjQxQzY5LjY4MTEgMzIuNTM2NyA2OS41NTM0IDMxLjI4ODggNjkuMDY5OSAyOS45NzhDNjguNjE1NyAyOS4xNTY0IDY4LjA2NTYgMjguNzEyMSA2Ny4yMDgyIDI4LjMxMjZDNjcuMTEzNyAyOC4yNjY4IDY3LjAxOTIgMjguMjIxIDY2LjkyMTggMjguMTczOEM2NS41NjMzIDI4LjAzOTggNjQuMzE3IDI4LjEyNTIgNjMuMzU5MSAyOS4xNTc4WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTQyLjAwNDQgMi43NzU3NEM0NC41NTYzIDIuNzc1NzQgNDcuMTA4MiAyLjc3NTc0IDQ5LjczNzQgMi43NzU3NEM0OS43Mzc0IDMuMTg3OTQgNDkuNzM3NCAzLjYwMDE0IDQ5LjczNzQgNC4wMjQ4M0M0Ny42NTgxIDQuMDI0ODMgNDUuNTc4OCA0LjAyNDgzIDQzLjQzNjQgNC4wMjQ4M0M0My40MzY0IDUuMDc4MjIgNDMuNDM2NCA2LjEzMTYxIDQzLjQzNjQgNy4yMTY5M0M0NS4zNzQgNy4yMTY5MyA0Ny4zMTE1IDcuMjE2OTMgNDkuMzA3OCA3LjIxNjkzQzQ5LjMwNzggNy42MjkxMyA0OS4zMDc4IDguMDQxMzMgNDkuMzA3OCA4LjQ2NjAxQzQ3LjM3MDIgOC40NjYwMSA0NS40MzI3IDguNDY2MDEgNDMuNDM2NCA4LjQ2NjAxQzQzLjQzNjQgOS41NjUyMSA0My40MzY0IDEwLjY2NDQgNDMuNDM2NCAxMS43OTY5QzQ1LjU2MyAxMS43OTY5IDQ3LjY4OTYgMTEuNzk2OSA0OS44ODA2IDExLjc5NjlDNDkuODgwNiAxMi4yNTQ5IDQ5Ljg4MDYgMTIuNzEyOSA0OS44ODA2IDEzLjE4NDhDNDcuMjgxNSAxMy4xODQ4IDQ0LjY4MjMgMTMuMTg0OCA0Mi4wMDQ0IDEzLjE4NDhDNDIuMDA0NCA5Ljc0OTc5IDQyLjAwNDQgNi4zMTQ4MSA0Mi4wMDQ0IDIuNzc1NzRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNNDIuMDA0NCAyNy4yMDIzQzQyLjg3ODcgMjcuMTkwOCA0My43NTI5IDI3LjE3OTQgNDQuNjUzNyAyNy4xNjc2QzQ0LjkyNzMgMjcuMTYyNSA0NS4yMDEgMjcuMTU3NSA0NS40ODMgMjcuMTUyM0M0NS43MDMzIDI3LjE1MDYgNDUuOTIzNiAyNy4xNDkyIDQ2LjE0MzkgMjcuMTQ4MUM0Ni4yNTU1IDI3LjE0NTIgNDYuMzY3MSAyNy4xNDI0IDQ2LjQ4MjIgMjcuMTM5NUM0Ny4zNzkgMjcuMTM4OSA0OC4xMzk2IDI3LjM1MyA0OC44MTA5IDI3Ljk1MzRDNDkuNDg0NiAyOC42OTQgNDkuNjYyNyAyOS4zNDE4IDQ5LjYzODkgMzAuMzA3MUM0OS41NDIxIDMxLjA5NjQgNDkuMjI3NSAzMS43ODc3IDQ4LjYxODYgMzIuMzI4N0M0Ny41NDU0IDMzLjAwMTcgNDYuNDc2NSAzMi45MjY4IDQ1LjIzNTQgMzIuOTA5OUM0NC42NDE4IDMyLjkwNDIgNDQuMDQ4MSAzMi44OTg0IDQzLjQzNjQgMzIuODkyNUM0My40MzY0IDM0LjI2NjUgNDMuNDM2NCAzNS42NDA1IDQzLjQzNjQgMzcuMDU2MkM0Mi45NjM5IDM3LjA1NjIgNDIuNDkxMyAzNy4wNTYyIDQyLjAwNDQgMzcuMDU2MkM0Mi4wMDQ0IDMzLjgwNDQgNDIuMDA0NCAzMC41NTI2IDQyLjAwNDQgMjcuMjAyM1pNNDMuNDM2NCAyOC4zMTI2QzQzLjQzNjQgMjkuNDU3NiA0My40MzY0IDMwLjYwMjYgNDMuNDM2NCAzMS43ODIyQzQzLjg4NTQgMzEuNzg4IDQ0LjMzNDMgMzEuNzkzNyA0NC43OTY5IDMxLjc5OTZDNDQuOTM2IDMxLjgwMjEgNDUuMDc1MSAzMS44MDQ2IDQ1LjIxODQgMzEuODA3M0M0Ni4xMzAyIDMxLjgxMjggNDcuMDUzMyAzMS44MDczIDQ3Ljc5NTIgMzEuMjM1OEM0OC4yMjI5IDMwLjY4ODYgNDguMjU0IDMwLjA4NiA0OC4xNjIyIDI5LjQyMjlDNDcuOTE4OCAyOC45MzMxIDQ3Ljc1NDIgMjguNjY2OSA0Ny4yNDQ4IDI4LjQyOTdDNDYuNTA0MSAyOC4yNjExIDQ1Ljc4NzEgMjguMjgzNiA0NS4wMjk2IDI4LjI5NTJDNDQuMjQxIDI4LjMwMzggNDQuMjQxIDI4LjMwMzggNDMuNDM2NCAyOC4zMTI2WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTIyLjYwOTMgMTUuNjkxNkMyMi45NTgzIDE1LjgyMTcgMjIuOTU4MyAxNS44MjE3IDIzLjE1NjMgMTYuMDkwNkMyMy4yOTc5IDE2Ljc3MTUgMjIuOTk0NyAxNy4yNzEzIDIyLjcxNjcgMTcuODk0OUMyMi42NTQ2IDE4LjAzOTIgMjIuNTkyNSAxOC4xODM2IDIyLjUyODYgMTguMzMyNEMyMi4zODEyIDE4LjY3NTIgMjIuMjMyOCAxOS4wMTc2IDIyLjA4MzYgMTkuMzU5N0MyMS43NjIgMjAuMDk5NSAyMS40NDkyIDIwLjg0MjcgMjEuMTM1OCAyMS41ODU3QzIwLjg5MzIgMjIuMTU5NyAyMC42NTA0IDIyLjczMzYgMjAuNDA3NSAyMy4zMDc2QzIwLjM0OCAyMy40NDgyIDIwLjI4ODYgMjMuNTg4OSAyMC4yMjczIDIzLjczMzlDMjAuMDU0MyAyNC4xNDI2IDE5Ljg4MDYgMjQuNTUxMSAxOS43MDY2IDI0Ljk1OTRDMTkuNjU1MyAyNS4wODA5IDE5LjYwNCAyNS4yMDI0IDE5LjU1MTIgMjUuMzI3NkMxOS4xOTY3IDI2LjE1NzEgMTguOCAyNi45NTkzIDE4LjM3NTggMjcuNzU3NEMxNy44MDI0IDI3LjgyNDMgMTcuNTc2NCAyNy44MDAxIDE3LjEwMzUgMjcuNDYyN0MxNi45NjAzIDI3LjMyODQgMTYuODE5NSAyNy4xOTE4IDE2LjY4MDggMjcuMDUzMkMxNi42MDU4IDI2Ljk4MDkgMTYuNTMwNyAyNi45MDg2IDE2LjQ1MzQgMjYuODM0MUMxNi4yOTU2IDI2LjY4MTIgMTYuMTM5IDI2LjUyNzMgMTUuOTgzNCAyNi4zNzI0QzE1Ljc0NDkgMjYuMTM1OCAxNS41MDI2IDI1LjkwMzYgMTUuMjU5NCAyNS42NzE1QzE1LjEwNjUgMjUuNTIyMiAxNC45NTM3IDI1LjM3MjcgMTQuODAxMyAyNS4yMjI5QzE0LjcyODggMjUuMTUzNiAxNC42NTYzIDI1LjA4NDQgMTQuNTgxNiAyNS4wMTNDMTQuMjY2MiAyNC42OTQ3IDE0LjA5IDI0LjQ4ODQgMTQuMDE2NyAyNC4wNDcxQzE0LjA3OTcgMjMuNzMyNiAxNC4wNzk3IDIzLjczMjYgMTQuMzY2MSAyMy40NTVDMTQuODA1IDIzLjM5NCAxNS4wMDYzIDIzLjQwMTggMTUuMzY5MiAyMy42NTY3QzE1LjQ1OTYgMjMuNzQ4OCAxNS41NSAyMy44NDEgMTUuNjQzMiAyMy45MzU5QzE1Ljc0MjkgMjQuMDM1NSAxNS44NDI3IDI0LjEzNSAxNS45NDU1IDI0LjIzNzZDMTYuMDQ3NSAyNC4zNDI5IDE2LjE0OTUgMjQuNDQ4MiAxNi4yNTQ2IDI0LjU1NjZDMTYuNDU5MiAyNC43NjM1IDE2LjY2NDEgMjQuOTcgMTYuODY5NCAyNS4xNzYzQzE2Ljk1OTMgMjUuMjY4NiAxNy4wNDkyIDI1LjM2MDkgMTcuMTQxOSAyNS40NTZDMTcuMzYzMiAyNS42ODg0IDE3LjM2MzIgMjUuNjg4NCAxNy42NTk4IDI1LjgxNDRDMTcuNjg0MiAyNS43Mzk3IDE3LjcwODcgMjUuNjY1IDE3LjczMzkgMjUuNTg4MUMxOC4wMDI3IDI0Ljc4NDggMTguMzE1NSAyNC4wMDggMTguNjU0OSAyMy4yMzA2QzE4LjcwODggMjMuMTA2MSAxOC43NjI3IDIyLjk4MTcgMTguODE4MiAyMi44NTM1QzE4Ljk4OTUgMjIuNDU4MiAxOS4xNjE1IDIyLjA2MzIgMTkuMzMzNSAyMS42NjgxQzE5LjQ0NiAyMS40MDg2IDE5LjU1ODYgMjEuMTQ5MSAxOS42NzExIDIwLjg4OTZDMTkuODM4MSAyMC41MDQyIDIwLjAwNTQgMjAuMTE4OSAyMC4xNzM0IDE5LjczMzlDMjAuNDUgMTkuMSAyMC43MjM1IDE4LjQ2NTIgMjAuOTkwNyAxNy44Mjc1QzIxLjA0MjMgMTcuNzA1NyAyMS4wOTM4IDE3LjU4MzggMjEuMTQ2OSAxNy40NTgzQzIxLjI0NDEgMTcuMjI4MSAyMS4zNDA0IDE2Ljk5NzQgMjEuNDM1NCAxNi43NjYzQzIxLjg5OSAxNS42NzQ4IDIxLjg5OSAxNS42NzQ4IDIyLjYwOTMgMTUuNjkxNloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik01Ni42MTEyIDE2LjM3NjlDNTcuOSAxNi4zNzY5IDU3LjkgMTYuMzc2OSA1OC4yMjczIDE2LjY3NTFDNTguMzExMiAxNi44MjI4IDU4LjM5NTIgMTYuOTcwNiA1OC40ODE4IDE3LjEyMjlDNTguNTg2MiAxNy4yOTgyIDU4LjY5MDggMTcuNDczNSA1OC43OTU2IDE3LjY0ODdDNTguODU0OSAxNy43NTEzIDU4LjkxNDEgMTcuODUzOCA1OC45NzUyIDE3Ljk1OTVDNTkuMjMyMiAxOC4zOTMgNTkuNTAyMyAxOC44MTggNTkuNzc0NSAxOS4yNDI2QzU5LjgyNjIgMTkuMzIzMyA1OS44NzggMTkuNDA0MSA1OS45MzEzIDE5LjQ4NzJDNjAuMDM2NyAxOS42NTE4IDYwLjE0MjIgMTkuODE2NCA2MC4yNDc4IDE5Ljk4MDlDNjAuNTAzMiAyMC4zNzk5IDYwLjc1NjggMjAuNzggNjEuMDEwMiAyMS4xODAyQzYxLjA5NzMgMjEuMzE3NiA2MS4xODQzIDIxLjQ1NDkgNjEuMjc0IDIxLjU5NjRDNjEuNDgwMSAyMS45Mjg0IDYxLjQ4MDEgMjEuOTI4NCA2MS42MjMzIDIyLjIwNTlDNjEuNjcwNiAyMC4yODIzIDYxLjcxNzggMTguMzU4OCA2MS43NjY1IDE2LjM3NjlDNjIuMDk3MyAxNi4zNzY5IDYyLjQyODEgMTYuMzc2OSA2Mi43Njg5IDE2LjM3NjlDNjIuNzY4OSAxOC44OTU5IDYyLjc2ODkgMjEuNDE0OCA2Mi43Njg5IDI0LjAxMDJDNjEuNjIzMyAyNC4wMTAyIDYxLjYyMzMgMjQuMDEwMiA2MS4zMzA4IDIzLjc2NjNDNjEuMjYxIDIzLjY1MjkgNjEuMTkxMiAyMy41Mzk0IDYxLjExOTMgMjMuNDIyNUM2MC45OTczIDIzLjIzMjEgNjAuOTk3MyAyMy4yMzIxIDYwLjg3MjggMjMuMDM3OEM2MC43NDgxIDIyLjgzMjEgNjAuNzQ4MSAyMi44MzIxIDYwLjYyMDkgMjIuNjIyM0M2MC40Mzg3IDIyLjM0MzggNjAuMjU2MSAyMi4wNjU1IDYwLjA3MzIgMjEuNzg3NEM1OS44ODg0IDIxLjQ5OTIgNTkuNzA0IDIxLjIxMDggNTkuNTIgMjAuOTIyMkM1OS4zMzQ2IDIwLjYzMjIgNTkuMTQ5MSAyMC4zNDI0IDU4Ljk2MzQgMjAuMDUyNkM1OC44ODI4IDE5LjkyNjIgNTguODAyMiAxOS43OTk5IDU4LjcxOTEgMTkuNjY5N0M1OC40NTMxIDE5LjI2MTEgNTguMTc4MSAxOC44NTk3IDU3LjkgMTguNDU4N0M1Ny44OTY0IDE4LjYyMTkgNTcuODkyOCAxOC43ODUyIDU3Ljg4OTEgMTguOTUzM0M1Ny44NzU3IDE5LjU1NjggNTcuODYxMyAyMC4xNjAyIDU3Ljg0NjcgMjAuNzYzNkM1Ny44NDA1IDIxLjAyNTIgNTcuODM0NSAyMS4yODY4IDU3LjgyODggMjEuNTQ4NEM1Ny44MjA2IDIxLjkyMzUgNTcuODExNCAyMi4yOTg3IDU3LjgwMjEgMjIuNjczOEM1Ny43OTg1IDIyLjg1MDMgNTcuNzk4NSAyMi44NTAzIDU3Ljc5NDkgMjMuMDMwNEM1Ny43NzMxIDIzLjg1NTYgNTcuNzczMSAyMy44NTU2IDU3LjYxMzYgMjQuMDEwMkM1Ny4yODI4IDI0LjAxMDIgNTYuOTUyIDI0LjAxMDIgNTYuNjExMiAyNC4wMTAyQzU2LjYxMTIgMjEuNDkxMiA1Ni42MTEyIDE4Ljk3MjIgNTYuNjExMiAxNi4zNzY5WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTEzLjIyMDUgMzUuMzkwN0MxMy45MjY2IDM1LjQxODEgMTQuNDMxIDM1LjYwMDIgMTUuMDI3MyAzNS45NDFDMTUuOTY4IDM2LjMzNzEgMTYuOTU4NCAzNi40MTI1IDE3Ljk3MyAzNi40MDU2QzE4LjA5MDYgMzYuNDA1IDE4LjIwODEgMzYuNDA0NCAxOC4zMjkyIDM2LjQwMzhDMTkuODA3NSAzNi4zNzc2IDIxLjExNTIgMzYuMTUwMyAyMi4zODU1IDM1LjM5MDdDMjIuNzg4MyAzNS4zMzg3IDIyLjc4ODMgMzUuMzM4NyAyMy4xMDE1IDM1LjM5MDdDMjMuMzg3OSAzNS42NjgzIDIzLjM4NzkgMzUuNjY4MyAyMy40MzI3IDM2LjExOTNDMjMuMTcxOCAzNi44NDE4IDIyLjc0OTYgMzYuOTc5NiAyMi4wNjUgMzcuMzExQzIxLjY2OTUgMzcuNDcyNSAyMS42Njk1IDM3LjQ3MjUgMjEuMzUzNCAzNy41MjM1QzIxLjA2NDcgMzcuNTkyNiAyMS4wNjQ3IDM3LjU5MjYgMjAuOTE0MyAzNy45MDQxQzIwLjg2MjIgMzguMDI1IDIwLjgxMDIgMzguMTQ1OSAyMC43NTY2IDM4LjI3MDVDMjAuMzcxNyAzOS4wNzE1IDE5Ljk4NDMgMzkuNDQ1MiAxOS4xODEzIDM5Ljg3NTNDMTguMjMyOSA0MC4xMTYgMTcuNTEyNiA0MC4wMDc5IDE2LjY1NzMgMzkuNTU0M0MxNi4xMjMgMzkuMTA3MSAxNS41NzMzIDM4LjU5MDYgMTUuNDcwOSAzNy44ODUxQzE1LjM5MzMgMzcuNTgzMSAxNS4zOTMzIDM3LjU4MzEgMTUuMDcxNSAzNy40NTUyQzE0Ljk0OCAzNy40MTUxIDE0LjgyNDUgMzcuMzc1IDE0LjY5NzIgMzcuMzMzN0MxNC4wMzcgMzcuMTAxOCAxMy40MzkzIDM2Ljg1MTkgMTIuOTM0IDM2LjM2MjJDMTIuOTA3MiAzNi4wMjM5IDEyLjkwNzIgMzYuMDIzOSAxMi45MzQgMzUuNjY4M0MxMy4wMjg2IDM1LjU3NjcgMTMuMTIzMSAzNS40ODUxIDEzLjIyMDUgMzUuMzkwN1pNMTYuOTQzOCAzNy44ODg5QzE3LjU1MzYgMzguNjEyMiAxNy41NTM2IDM4LjYxMjIgMTguMTYxIDM4LjY2OTZDMTguNzY4MyAzOC42MTIyIDE4Ljc2ODMgMzguNjEyMiAxOS4zNzgyIDM3Ljg4ODlDMTguNTc0OCAzNy44ODg5IDE3Ljc3MTUgMzcuODg4OSAxNi45NDM4IDM3Ljg4ODlaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNNDYuODczMyAxNi42NTQ1QzQ3LjMyMjkgMTcuMDE2IDQ3LjY4OSAxNy4zNjA1IDQ3Ljg3NTggMTcuOTAzNUM0Ny44OTM3IDE4LjM1NDYgNDcuODkzNyAxOC4zNTQ2IDQ3Ljg3NTggMTguNzM2M0M0Ny41OTIyIDE4LjczNjMgNDcuMzA4NyAxOC43MzYzIDQ3LjAxNjUgMTguNzM2M0M0Ni45ODE4IDE4LjY1OTMgNDYuOTQ3MSAxOC41ODI0IDQ2LjkxMTQgMTguNTAzMUM0Ni44NjM0IDE4LjQwMjYgNDYuODE1NCAxOC4zMDIxIDQ2Ljc2NTkgMTguMTk4NUM0Ni42OTYyIDE4LjA0ODcgNDYuNjk2MiAxOC4wNDg3IDQ2LjYyNSAxNy44OTU5QzQ2LjQwMiAxNy41NjM4IDQ2LjI1NjIgMTcuNDc3MiA0NS44NzA5IDE3LjM0ODRDNDUuMDYzNCAxNy4yNDYxIDQ0LjM4MDMgMTcuMjA0IDQzLjY4NzEgMTcuNjQzM0M0My4zOTM3IDE4LjExMDMgNDMuMzI4MiAxOC4zMzg3IDQzLjQzNjQgMTguODc1QzQzLjkzNjIgMTkuMzgzNiA0NC41ODExIDE5LjQyOTcgNDUuMjYyMyAxOS41NTE2QzQ2LjM5NTkgMTkuNzc2OCA0Ny4zMTkxIDE5Ljk3NzEgNDguMDE5IDIwLjkzMDhDNDguMjYxMSAyMS42Nzg3IDQ4LjI5ODggMjIuMzAxIDQ3LjkzODQgMjMuMDA0QzQ3LjU1IDIzLjU5MDcgNDcuMDA4MiAyMy44NzkgNDYuMzI1NyAyNC4wOTE1QzQ1LjA5OTIgMjQuMzE3NyA0My45NDg5IDI0LjI1NjUgNDIuOTA5NSAyMy41NzQ4QzQyLjQyNjkgMjMuMjIwMSA0Mi4xNDgxIDIyLjkxNTcgNDIuMDA0NCAyMi4zNDQ3QzQxLjk4NjUgMjEuODg1IDQxLjk4NjUgMjEuODg1IDQyLjAwNDQgMjEuNTEyQzQyLjMzNTIgMjEuNTEyIDQyLjY2NiAyMS41MTIgNDMuMDA2OCAyMS41MTJDNDMuMDQzNCAyMS42MjUgNDMuMDQzNCAyMS42MjUgNDMuMDgwNyAyMS43NDAyQzQzLjM1MDEgMjIuNTMyNyA0My4zNTAxIDIyLjUzMjcgNDQuMDA5MyAyMy4wMzg3QzQ0Ljg0MzEgMjMuMzQ1MiA0NS43ODAyIDIzLjIxNTYgNDYuNTg2OSAyMi44OTk5QzQ2Ljk1MTYgMjIuNTAyMyA0Ny4wMTg2IDIyLjMwNDIgNDcuMDA3NiAyMS43NzIyQzQ2Ljg0OTMgMjEuMzAxOSA0Ni43MjQzIDIxLjIxNDggNDYuMzAwNSAyMC45NTY5QzQ1Ljk4NTYgMjAuODQ4MiA0NS45ODU2IDIwLjg0ODIgNDUuNjQ4MyAyMC43ODM5QzQ1LjUyNDggMjAuNzU2NCA0NS40MDEzIDIwLjcyOSA0NS4yNzQgMjAuNzAwN0M0NS4wMTY4IDIwLjY0NjIgNDQuNzU5NSAyMC41OTIgNDQuNTAyMSAyMC41MzgxQzQzLjY2NTEgMjAuMzUxMyA0Mi45MDA5IDIwLjE1OTMgNDIuMzgzNyAxOS40Mzc4QzQyLjE0NDEgMTguNzAyMiA0Mi4xODA2IDE3Ljk4NjYgNDIuNTIzNSAxNy4yOTYzQzQzLjcwMjIgMTYuMDMzOCA0NS4zMzI1IDE1LjkyMzggNDYuODczMyAxNi42NTQ1WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTY5LjM4MjYgMTYuNDkxOEM3MC4wNzk3IDE2LjkyNzcgNzAuNjE4NCAxNy41NDQzIDcwLjg1MSAxOC4zMTk5QzcwLjg3NzYgMTguNDU3MyA3MC45MDQyIDE4LjU5NDcgNzAuOTMxNiAxOC43MzYzQzcwLjU1MzUgMTguNzM2MyA3MC4xNzU1IDE4LjczNjMgNjkuNzg1OSAxOC43MzYzQzY5LjcxMjEgMTguNTg0NSA2OS42MzgzIDE4LjQzMjggNjkuNTYyMiAxOC4yNzY1QzY5LjIyMTYgMTcuNzA0MyA2OC44NzM0IDE3LjUzMDQgNjguMjEwNyAxNy4zNDg0QzY3LjQ0NzkgMTcuMjQ2OSA2Ni44NDY1IDE3LjMzNyA2Ni4yMDU4IDE3Ljc2NDdDNjUuMzY5NiAxOC42NzE2IDY1LjMwMzQgMTkuNDQ3NCA2NS4zMTU5IDIwLjY0MjRDNjUuMzcwOCAyMS40NTEyIDY1LjU4MzQgMjEuOTg2MyA2Ni4xMzQyIDIyLjYxMzZDNjYuNzI0MSAyMy4wODUyIDY3LjI1OSAyMy4wODYgNjcuOTk0OCAyMy4wNzc3QzY4LjUyNjggMjMuMDE5OSA2OC44MiAyMi44MjczIDY5LjIxMzEgMjIuNDgzNUM2OS41MzUzIDIyLjA0ODYgNjkuNzM3MiAyMS41OTY0IDY5LjkyOTEgMjEuMDk1NkM3MC4yNTk5IDIxLjA5NTYgNzAuNTkwNyAyMS4wOTU2IDcwLjkzMTYgMjEuMDk1NkM3MC44OTUxIDIyLjA2ODYgNzAuNjIgMjIuNzM2MyA2OS45MjkxIDIzLjQ1NUM2OS4wNjQgMjQuMTA1OCA2OC4xNzA3IDI0LjI2MjYgNjcuMDkxNCAyNC4yMTQ2QzY2LjIxNjkgMjQuMDg4NyA2NS41MzE0IDIzLjgwODUgNjQuOTM0NCAyMy4xNjVDNjQuMDAxOCAyMS44OTA5IDYzLjkzMjggMjAuNTIwOCA2NC4wNTc4IDE5LjAxMzhDNjQuMTc4MiAxOC41Mzk3IDY0LjM1MjkgMTguMTcwNSA2NC42MzA2IDE3Ljc2NDdDNjQuNjkxMyAxNy42NzUzIDY0Ljc1MjEgMTcuNTg1OCA2NC44MTQ2IDE3LjQ5MzdDNjUuODY4NiAxNi4xMzk0IDY3Ljc5ODYgMTUuODEyNCA2OS4zODI2IDE2LjQ5MThaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTMuNzAyMSAzMy4wNjIyQzE0LjEwMiAzMy4xNzY1IDE0LjQ0OTQgMzMuMzI4NCAxNC44MjI2IDMzLjUwODRDMTYuNzg4MiAzNC4zODYxIDE5LjA1MTQgMzQuMzk4MyAyMS4wOTY3IDMzLjcyNTNDMjEuNDQ2NSAzMy41NTYyIDIxLjc3MzMgMzMuMzc3NiAyMi4wOTkxIDMzLjE2ODVDMjIuNDU4OSAzMi45OTYyIDIyLjcwNSAzMi45ODc3IDIzLjEwMTUgMzMuMDMxM0MyMy4zODc5IDMzLjMwODkgMjMuMzg3OSAzMy4zMDg5IDIzLjQ4NjQgMzMuNjkwNkMyMy4zNzIyIDM0LjIxMzUgMjMuMjkyMyAzNC4yNzI5IDIyLjg1OTkgMzQuNTc1M0MyMC42OTkyIDM1LjgzNTcgMTguMDI5IDM1LjkyNjEgMTUuNjIyNSAzNS40MDUzQzE0LjczMTMgMzUuMTUyMyAxMy44MDczIDM0Ljg0NzIgMTMuMDc3MyAzNC4yODA0QzEyLjk1MDggMzMuNzYyMSAxMi45NTA4IDMzLjc2MjEgMTIuOTM0MSAzMy4zMDg5QzEzLjM2MzcgMzMuMDMxMyAxMy4zNjM3IDMzLjAzMTMgMTMuNzAyMSAzMy4wNjIyWiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTQ4Ljg3ODIgMTYuMzc2OUM0OS41NzEzIDE2LjIyNjkgNDkuNTcxMyAxNi4yMjY5IDUwLjAyMzggMTYuMzc2OUM1MC40OTkzIDE2Ljg5OTYgNTAuODI3OCAxNy41MDIxIDUxLjE2OTQgMTguMTExN0M1MS4yNjczIDE4LjI3OTEgNTEuMzY1NiAxOC40NDYzIDUxLjQ2NDIgMTguNjEzMkM1MS43MDQgMTkuMDIyNCA1MS45Mzk2IDE5LjQzMzMgNTIuMTcxOSAxOS44NDY2QzUyLjcxMjYgMTkuMDczMSA1My4yMzA5IDE4LjI5MiA1My43MjAyIDE3LjQ4NzJDNTQuMzAyIDE2LjUzMyA1NC4zMDIgMTYuNTMzIDU0LjQ2MzEgMTYuMzc2OUM1NC44NDU2IDE2LjM1NzMgNTUuMjI1NiAxNi4zNzEgNTUuNjA4NyAxNi4zNzY5QzU1LjM5NjMgMTcuMTM3MSA1NS4wMTY0IDE3LjcxNjMgNTQuNTcwNSAxOC4zNjMzQzU0LjUwMzkgMTguNDYxNiA1NC40MzcyIDE4LjU1OTkgNTQuMzY4NiAxOC42NjEyQzU0LjMwMTYgMTguNzU5OCA1NC4yMzQ2IDE4Ljg1ODUgNTQuMTY1NSAxOC45NjAyQzU0LjA5NzkgMTkuMDYwNiA1NC4wMzAzIDE5LjE2MTEgNTMuOTYwNiAxOS4yNjQ3QzUzLjgxNyAxOS40NjkzIDUzLjY2NiAxOS42NjkxIDUzLjUwODUgMTkuODYzOEM1Mi44Mzg0IDIwLjcyMiA1Mi43NTk4IDIxLjQzMjIgNTIuNzYyNiAyMi40OTIyQzUyLjc1OTYgMjIuNjM4OCA1Mi43NTY3IDIyLjc4NTQgNTIuNzUzNiAyMi45MzY1QzUyLjc0NjkgMjMuMjk0NSA1Mi43NDQgMjMuNjUyMSA1Mi43NDQ3IDI0LjAxMDJDNTIuNDEzOSAyNC4wMTAyIDUyLjA4MzEgMjQuMDEwMiA1MS43NDIyIDI0LjAxMDJDNTEuNzQ2OSAyMy45MzIyIDUxLjc1MTYgMjMuODU0MiA1MS43NTY0IDIzLjc3MzlDNTEuODUzNCAyMS42MDY3IDUxLjM3NjggMjAuMjM4NSA1MC4wOTQ0IDE4LjQ3NTRDNDkuODA2MyAxOC4wNzg4IDQ5LjUzOTQgMTcuNjcxNyA0OS4yNzIgMTcuMjYxNkM0OS4xOTQ1IDE3LjE0ODIgNDkuMTE2OSAxNy4wMzQ4IDQ5LjAzNyAxNi45MTc5QzQ4Ljg3ODIgMTYuNjU0NCA0OC44NzgyIDE2LjY1NDQgNDguODc4MiAxNi4zNzY5WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTE3LjUxNjYgOS40Mzc1MkMxNy42MTUgOS44Mjc4NiAxNy42MTUgOS44Mjc4NiAxNy42NTk4IDEwLjI3MDJDMTcuMzMwNCAxMC43Mjk5IDE2LjkwMTYgMTAuODAxNiAxNi4zNjIgMTAuOTM4MkMxNC43Nzk0IDExLjM5MzQgMTMuODAzOSAxMi4xMzgxIDEyLjcyNTQgMTMuMzFDMTIuMzYxMiAxMy42MDExIDEyLjM2MTIgMTMuNjAxMSAxMS45NjU3IDEzLjU4NDNDMTEuNjQ1MiAxMy40NjIzIDExLjY0NTIgMTMuNDYyMyAxMS41MDIgMTMuMzIzNkMxMS40NDUxIDEyLjgyNDcgMTEuNDUxMiAxMi41Njc4IDExLjczMzYgMTIuMTQwMUMxMy4yMDEyIDEwLjYyMTggMTUuMjI5OSA4Ljk3NTgyIDE3LjUxNjYgOS40Mzc1MloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0zMS45ODkxIDE4Ljk3OTFDMzIuMTI3OSAxOS4wMzY0IDMyLjI2NjcgMTkuMDkzNiAzMi40MDk3IDE5LjE1MjZDMzIuNDU3IDE5LjI5IDMyLjUwNDMgMTkuNDI3NCAzMi41NTI5IDE5LjU2OUMzMi42MjY4IDE5LjQ5NzQgMzIuNzAwNiAxOS40MjU5IDMyLjc3NjcgMTkuMzUyMUMzMy4yNzUzIDE5LjA2NzEgMzMuNTc4NyAxOS4xNTU5IDM0LjEyODIgMTkuMjkxNEMzNC40MDU2IDE5LjUwODMgMzQuNDA1NiAxOS41MDgzIDM0LjU1NzggMTkuNzA3OEMzNC42OTk2IDE5LjYxNjIgMzQuODQxMyAxOS41MjQ2IDM0Ljk4NzQgMTkuNDMwMkMzNS4zMzY1IDE5LjM2OTUgMzUuMzM2NSAxOS4zNjk1IDM1LjcwMzQgMTkuNDMwMkMzNi4wNDM1IDE5LjcyNTEgMzYuMDQzNSAxOS43MjUxIDM2LjI3NjIgMjAuMTI0MUMzNi4yNzYyIDIwLjYyMSAzNi4yMjc1IDIwLjg1NTUgMzUuODgyNCAyMS4yMjU4QzM1LjU2MDIgMjEuMzczMiAzNS41NjAyIDIxLjM3MzIgMzUuMjAyMiAyMS4zNjQ1QzM0Ljc3OTMgMjEuMjEwOCAzNC41NjU2IDIxLjAwNjYgMzQuMjcxNCAyMC42NzkzQzM0LjE3NjkgMjAuNzcwOSAzNC4wODI0IDIwLjg2MjUgMzMuOTg1IDIwLjk1NjlDMzMuNDE1OSAyMS4wMzA0IDMzLjE5MTQgMjEuMDAxMSAzMi43MTQgMjAuNjc5M0MzMi42MTM2IDIwLjU4NzcgMzIuNTEzMiAyMC40OTYxIDMyLjQwOTcgMjAuNDAxN0MzMi4zMTUyIDIwLjQ5MzMgMzIuMjIwNyAyMC41ODQ5IDMyLjEyMzMgMjAuNjc5M0MzMS42Nzg5IDIwLjcyNTEgMzEuMzg0NyAyMC43NDk0IDMwLjk5NTYgMjAuNTIzMUMzMC43NTg4IDIwLjE0MDcgMzAuNzc4MSAxOS44NjczIDMwLjgzNDUgMTkuNDMwMkMzMS4xODM1IDE4Ljk4NDMgMzEuNDE2MyAxOC44NDMyIDMxLjk4OTEgMTguOTc5MVoiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0xOC4zMTMxIDAuMDI2MDE0NUMxOC44MDU0IDAuMTM4Nzc5IDE4LjgwNTQgMC4xMzg3NzkgMTkuMDkxOCAwLjU1NTE0QzE5LjAyNyAxLjQ1MDcxIDE5LjAyNyAxLjQ1MDcxIDE4LjY2MjIgMS44MDQyMkMxOC43MzYgMS44NzU3OSAxOC44MDk5IDEuOTQ3MzUgMTguODg2IDIuMDIxMDhDMTkuMTc3NiAyLjUwMDQgMTkuMDc5OSAyLjgwMjE1IDE4Ljk0ODYgMy4zMzA4OEMxOC44NTQxIDMuNDIyNDggMTguNzU5NiAzLjUxNDA4IDE4LjY2MjIgMy42MDg0NkMxOC43NzMgMy42ODE0NSAxOC43NzMgMy42ODE0NSAxOC44ODYgMy43NTU5MkMxOS4wOTE4IDQuMDI0ODIgMTkuMDkxOCA0LjAyNDgyIDE5LjA2NSA0LjUxOTI1QzE4Ljk0ODYgNC45OTYzMyAxOC45NDg2IDQuOTk2MzMgMTguNjYyMiA1LjI3MzlDMTguMTQyIDUuMzM5NjYgMTcuODk1NSA1LjMzNzYzIDE3LjQ2MjkgNS4wMzk3QzE3LjIzMDIgNC43MTg3NSAxNy4yMzAyIDQuNzE4NzUgMTcuMTY3NSA0LjM3MTc5QzE3LjI0MDEgMy45Njk1MiAxNy4zODI1IDMuNzcxOTcgMTcuNjU5OCAzLjQ2OTY3QzE3LjU4ODkgMy40MTgxNSAxNy41MTggMy4zNjY2MiAxNy40NDUgMy4zMTM1M0MxNy4yMzAyIDMuMDUzMzEgMTcuMjMwMiAzLjA1MzMxIDE3LjE3NjUgMi42NDU2MkMxNy4yMzQ1IDIuMTg1OTEgMTcuMzQwMyAyLjAwMDg0IDE3LjY1OTggMS42NjU0NEMxNy41ODU5IDEuNjE2NzggMTcuNTEyMSAxLjU2ODExIDE3LjQzNiAxLjUxNzk4QzE3LjIzMDIgMS4yNDkwOCAxNy4yMzAyIDEuMjQ5MDggMTcuMjQ4MSAwLjc1NDY0N0MxNy40MjI2IDAuMDkwMTEyNCAxNy42MTMyIC0wLjAwOTY5MDQyIDE4LjMxMzEgMC4wMjYwMTQ1WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTM0LjAwMjkgOS45MjMyOEMzNC40MTQ2IDkuOTkyNjcgMzQuNDE0NiA5Ljk5MjY3IDM0LjY3NDEgMTAuMTY2MkMzNC44Njk4IDEwLjQ0NTcgMzQuOTU1OCAxMC42MjY4IDM0Ljk4NzQgMTAuOTY0MkMzNC44Njc2IDExLjMyMzEgMzQuNzU3MSAxMS40Nzk5IDM0LjQ0MTQgMTEuNzAxNUMzNC4wNTA2IDExLjgyMDUgMzMuODAyMSAxMS43NjMxIDMzLjQxMjIgMTEuNjU4MUMzMy4zMTE3IDExLjc5ODQgMzMuMjExMyAxMS45Mzg2IDMzLjEwNzkgMTIuMDgzMkMzMi45MTI2IDEyLjMxNDYgMzIuOTEyNiAxMi4zMTQ2IDMyLjY5NjEgMTIuNDkwOEMzMi4yMjE4IDEyLjQ3MzUgMzIuMjIxOCAxMi40NzM1IDMxLjgzNjkgMTIuMzUyMUMzMS43NjAxIDEyLjQ2MzcgMzEuNjgzMyAxMi41NzUzIDMxLjYwNDIgMTIuNjkwM0MzMS4yNjQxIDEzLjA0NiAzMS4yNjQxIDEzLjA0NiAzMC44MzQ1IDEzLjE5MzVDMzAuNDA0OSAxMy4xODQ4IDMwLjQwNDkgMTMuMTg0OCAzMC4wNjQ4IDEyLjk2NzlDMjkuNzY0MyAxMi41MzEyIDI5LjczMjQgMTIuMzEyIDI5LjgzMjEgMTEuNzk2OUMzMC4xNDUzIDExLjQ1ODYgMzAuMTQ1MyAxMS40NTg2IDMwLjU0ODEgMTEuMjQxOEMzMC45NTA4IDExLjI3NjUgMzAuOTUwOCAxMS4yNzY1IDMxLjI2NDEgMTEuMzgwNUMzMS4zMzc5IDExLjI2NiAzMS40MTE4IDExLjE1MTUgMzEuNDg3OSAxMS4wMzM2QzMxLjYwMyAxMC45MTkxIDMxLjcxODIgMTAuODA0NiAzMS44MzY5IDEwLjY4NjZDMzIuMTcxMSAxMC42ODY2IDMyLjUwNTIgMTAuNjg2NiAzMi44MzkzIDEwLjY4NjZDMzMuNTc2OCA5Ljk4OTM1IDMzLjU3NjggOS45ODkzNSAzNC4wMDI5IDkuOTIzMjhaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMjcuNjkzIDIuNjQ1NjRDMjguMzQwOSAyLjg0NjA0IDI4LjM0MDkgMi44NDYwNCAyOC41NDMyIDMuMTkyMTFDMjguNTUyMiAzLjY2OTE5IDI4LjU1MjIgMy42NjkxOSAyOC40IDQuMTYzNjJDMjguMTE0NSA0LjM0OTk3IDI3LjgyODIgNC41MzUwOSAyNy41NDA4IDQuNzE4NzdDMjcuNTA1IDUuMTQwOTQgMjcuNTA1IDUuMTQwOTQgMjcuNTQwOCA1LjU1MTQ5QzI3LjMxNzkgNS44NjQ3OSAyNy4xNzE5IDUuOTQ5MzcgMjYuNzk3OSA2LjA2MzI3QzI2LjcxMjMgNi4wNzc1OCAyNi42MjY2IDYuMDkxODkgMjYuNTM4NCA2LjEwNjY0QzI2LjU0NzIgNi4yMzU0NSAyNi41NTYxIDYuMzY0MjYgMjYuNTY1MiA2LjQ5Njk4QzI2LjUzODQgNi45MzkzNiAyNi41Mzg0IDYuOTM5MzYgMjYuMzU5NCA3LjE5MDkxQzI2LjA2NCA3LjM4NTE1IDI1Ljg5NDcgNy40NzQwNiAyNS41MzYgNy40OTQ1MUMyNS4xNTExIDcuMzQ3MDUgMjUuMTUxMSA3LjM0NzA1IDI0LjgxOTkgNy4wNzgxNUMyNC42Njc4IDYuNjcwNDYgMjQuNjY3OCA2LjY3MDQ2IDI0LjY3NjcgNi4yNDU0M0MyNC45NDYyIDUuODg3NTYgMjUuMTM3OSA1LjcyNjM0IDI1LjU3MTggNS41ODYxOUMyNS42OTU4IDUuNTY5MDEgMjUuNjk1OCA1LjU2OTAxIDI1LjgyMjQgNS41NTE0OUMyNS43NzUxIDUuNTA1NjkgMjUuNzI3OSA1LjQ1OTg5IDI1LjY3OTIgNS40MTI3QzI1LjYyNTUgNS4wOTE3NiAyNS42MjU1IDUuMDkxNzYgMjUuNjc5MiA0LjcxODc3QzI1Ljk5NzYgNC40MjY0IDI2LjI5IDQuMjE0NjEgMjYuNjgxNiA0LjAyNDgzQzI2LjY2OTggMy44OTg4OCAyNi42NTggMy43NzI5NCAyNi42NDU4IDMuNjQzMTdDMjYuNjgxNiAzLjE5MjExIDI2LjY4MTYgMy4xOTIxMSAyNi45MTQzIDIuODUzODJDMjcuMjU0NCAyLjYzNjk2IDI3LjI1NDQgMi42MzY5NiAyNy42OTMgMi42NDU2NFoiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik00LjYzNzE4IDE4Ljg4MzdDNS4yODUxMSAxOS4wODQxIDUuMjg1MTEgMTkuMDg0MSA1LjQ4NzQ1IDE5LjQzMDJDNS40Njk1NSAxOS45MjQ2IDUuNDY5NTUgMTkuOTI0NiA1LjM0NDI1IDIwLjQwMTdDNC44NDk4NCAyMC43MjExIDQuNjM1NzYgMjAuNzI3MSA0LjA1NTQyIDIwLjY3OTNDMy45NjA5IDIwLjU4NzcgMy44NjYzOSAyMC40OTYxIDMuNzY5MDEgMjAuNDAxN0MzLjY5MjIxIDIwLjQ5MzMgMy42MTU0MiAyMC41ODQ5IDMuNTM2MyAyMC42NzkzQzMuMTk2MTkgMjAuOTU2OSAzLjE5NjE5IDIwLjk1NjkgMi43NTc2MyAyMS4wMDg5QzIuMzM2OTcgMjAuOTU2OSAyLjMzNjk3IDIwLjk1NjkgMS45MDczNiAyMC42NzkzQzEuODU3MTUgMjAuNzcwOSAxLjgwNjk0IDIwLjg2MjUgMS43NTUyMSAyMC45NTY5QzEuNDc3NzUgMjEuMjM0NCAxLjQ3Nzc1IDIxLjIzNDQgMC45NzY1MzUgMjEuMjk1MUMwLjQ3NTMyMiAyMS4yMzQ0IDAuNDc1MzIyIDIxLjIzNDQgMC4xOTc4NjUgMjEuMDc4M0MtMC4wMzMwMDE4IDIwLjY4MzQgLTAuMDI5MzExNCAyMC40MzA3IDAuMDQ1NzExMSAxOS45ODUzQzAuMzU4OTY5IDE5LjY0NzEgMC4zNTg5NjkgMTkuNjQ3MSAwLjc2MTczIDE5LjQzMDJDMS4yNTE5NiAxOS40NTIzIDEuNDE1MTkgMTkuNTA4NCAxLjc2NDE2IDE5Ljg0NjZDMS44NjQ1OCAxOS43MjkyIDEuOTY1IDE5LjYxMTggMi4wNjg0NiAxOS40OTA5QzIuNDgwMTcgMTkuMTUyNiAyLjQ4MDE3IDE5LjE1MjYgMi45MzY2NCAxOS4xN0MzLjMzOTQgMTkuMjkxNCAzLjMzOTQgMTkuMjkxNCAzLjYyNTggMTkuNDMwMkMzLjcwMjYgMTkuMzM1NyAzLjc3OTM5IDE5LjI0MTMgMy44NTg1MSAxOS4xNDM5QzQuMTk4NjIgMTguODc1IDQuMTk4NjIgMTguODc1IDQuNjM3MTggMTguODgzN1oiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yLjQwODU3IDkuOTkyNjdDMi45MDk3OCAxMC4xMzE1IDIuOTA5NzggMTAuMTMxNSAzLjE4NzI0IDEwLjQ4NzFDMy4yMzc0NSAxMC41OTg3IDMuMjg3NjYgMTAuNzEwNCAzLjMzOTM5IDEwLjgyNTRDMy40NjkzNSAxMC43OTM5IDMuNTk5MzEgMTAuNzYyNCAzLjczMzIgMTAuNzNDNC4xOTg2MSAxMC42ODY2IDQuMTk4NjEgMTAuNjg2NiA0LjUyMDgyIDEwLjg2MDFDNC43NzE0MyAxMS4xMDMgNC43NzE0MyAxMS4xMDMgNS4wNTc4NCAxMS41MTkzQzUuMTA1MDkgMTEuNDczNSA1LjE1MjM1IDExLjQyNzcgNS4yMDEwNCAxMS4zODA1QzUuNjkzMyAxMS40MTUyIDUuNjkzMyAxMS40MTUyIDYuMjAzNDcgMTEuNTE5M0M2LjUzNDY3IDEyLjAwMDggNi41NTA3IDEyLjIwMjQgNi40ODk4NyAxMi43Njg0QzYuMzI4NzcgMTMuMDI4NiA2LjMyODc3IDEzLjAyODYgNi4wNjAyNiAxMy4xODQ4QzUuNjM5NiAxMy4yNDU1IDUuNjM5NiAxMy4yNDU1IDUuMjAxMDQgMTMuMTg0OEM0Ljg3MTI4IDEyLjkyNTYgNC42NzQzIDEyLjcxODkgNC40ODUwMiAxMi4zNTIxQzQuNDM3NzYgMTIuMzk3OSA0LjM5MDUxIDEyLjQ0MzcgNC4zNDE4MiAxMi40OTA4QzMuODU4NTEgMTIuNDczNSAzLjg1ODUxIDEyLjQ3MzUgMy4zMzkzOSAxMi4zNTIxQzMuMDYxOTQgMTEuOTk2NCAzLjA2MTk0IDExLjk5NjQgMi45MDk3OCAxMS42NTgxQzIuNjc5NCAxMS43MTM5IDIuNjc5NCAxMS43MTM5IDIuNDQ0MzcgMTEuNzcwOUMxLjkwNzM2IDExLjc5NjkgMS45MDczNiAxMS43OTY5IDEuNTQ5MzUgMTEuNTAyQzEuMzM0NTQgMTEuMTAzIDEuMzM0NTQgMTEuMTAzIDEuMzQzNDkgMTAuNzM4N0MxLjU4OTkzIDEwLjEzMzYgMS43MTE0NyA5Ljk5MjY3IDIuNDA4NTcgOS45OTI2N1oiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yOC40ODA2IDI1LjY5M0MyOC44NjA2IDI1LjgyNTIgMjkuMDMyOCAyNS45MDczIDI5LjI1OTMgMjYuMjMwOEMyOS4yODYxIDI2LjYwMzggMjkuMjg2MSAyNi42MDM4IDI5LjI1OTMgMjYuOTI0N0MyOS40MTU4IDI2LjkxMzIgMjkuNTcyMyAyNi45MDE4IDI5LjczMzYgMjYuODlDMzAuMjYxNyAyNi45MjQ3IDMwLjI2MTcgMjYuOTI0NyAzMC41MzAyIDI3LjE2NzZDMzAuNjgxIDI3LjQ1OTkgMzAuNzc1NCAyNy43MTQxIDMwLjgzNDUgMjguMDM1QzMwLjk3MDQgMjguMDUyMiAzMS4xMDYyIDI4LjA2OTMgMzEuMjQ2MiAyOC4wODdDMzEuNjkzNyAyOC4xNzM4IDMxLjY5MzcgMjguMTczOCAzMS45ODAxIDI4LjQ1MTRDMzIuMDQ4IDI4Ljk1NTUgMzIuMDQ1OSAyOS4xOTQ0IDMxLjczODUgMjkuNjEzN0MzMS40MDczIDI5LjgzOTIgMzEuNDA3MyAyOS44MzkyIDMxLjA0OTMgMjkuOTE3M0MzMC42OTEzIDI5LjgzOTIgMzAuNjkxMyAyOS44MzkyIDMwLjM2MDEgMjkuNTI3QzMwLjExODUgMjkuMTQ1MyAzMC4xMTg1IDI5LjE0NTMgMzAuMTE4NSAyOC41OTAxQzMwLjAzODcgMjguNjI0NSAyOS45NTkgMjguNjU4OCAyOS44NzY4IDI4LjY5NDJDMjkuNTQ1NyAyOC43Mjg5IDI5LjU0NTcgMjguNzI4OSAyOS4xNTE5IDI4LjUwMzRDMjguODI5NyAyOC4xNzM4IDI4LjgyOTcgMjguMTczOCAyOC43ODQ5IDI3Ljc5MjFDMjguNzk5NyAyNy42ODkxIDI4LjgxNDQgMjcuNTg2IDI4LjgyOTcgMjcuNDc5OEMyOC42OTk3IDI3LjQ5NDIgMjguNTY5NyAyNy41MDg1IDI4LjQzNTggMjcuNTIzMkMyNy45NzA0IDI3LjQ3OTggMjcuOTcwNCAyNy40Nzk4IDI3LjYyMTQgMjcuMTc2M0MyNy4zOTc2IDI2Ljc4NTkgMjcuMzk3NiAyNi43ODU5IDI3LjM5NzYgMjYuNDIxNkMyNy42MjYxIDI1Ljg5NTYgMjcuODc4NCAyNS42NjQ1IDI4LjQ4MDYgMjUuNjkzWiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTguMzUxNTIgMjUuODE0NEM4LjcwMDU4IDI2LjExOCA4LjcwMDU4IDI2LjExOCA4LjkyNDMzIDI2LjUwODNDOC45MjQzMyAyNi45NTg4IDguODUyOTEgMjcuMTMwMiA4LjUzMDUyIDI3LjQ1MzhDOC4xNTUxMSAyNy42NDU4IDcuOTEwOTIgMjcuNjUyNCA3LjQ5MjMgMjcuNjE4NkM3LjUwMTE2IDI3LjcyNDUgNy41MTAwMiAyNy44MzA1IDcuNTE5MTUgMjcuOTM5NkM3LjQ5MjMgMjguMzEyNiA3LjQ5MjMgMjguMzEyNiA3LjMzMTE5IDI4LjU2NDFDNi45NTE2NSAyOC43OTcxIDYuNjQyNzUgMjguNzU3MyA2LjIwMzQ2IDI4LjcyODlDNi4xOTc1NiAyOC44NTc3IDYuMTkxNjUgMjguOTg2NiA2LjE4NTU2IDI5LjExOTNDNi4wNjAyNiAyOS41NjE3IDYuMDYwMjYgMjkuNTYxNyA1LjY2NjQ1IDI5Ljg0NzlDNS4yMDEwNCAyOS45NzggNS4yMDEwNCAyOS45NzggNC43OTgyOCAyOS44MDQ1QzQuNDg1MDIgMjkuNTYxNyA0LjQ4NTAyIDI5LjU2MTcgNC4zNDE4MSAyOS40MjI5QzQuMjc2NTYgMjguNjk1NiA0LjI3NjU2IDI4LjY5NTYgNC41MDI5MiAyOC4zMjk5QzQuODgzMTggMjguMTA4OCA1LjE5NjQ0IDI4LjE0NTcgNS42MzA2NSAyOC4xNzM4QzUuNjQyNDYgMjguMDQ1IDUuNjU0MjggMjcuOTE2MiA1LjY2NjQ1IDI3Ljc4MzRDNS43NzM4NSAyNy4zNDExIDUuNzczODUgMjcuMzQxMSA2LjAzMzQxIDI3LjA4MDhDNi4zNDY2NyAyNi45MjQ3IDYuMzQ2NjcgMjYuOTI0NyA2LjkxOTQ4IDI2LjkyNDdDNi45NjA4MyAyNi43NjczIDcuMDAyMTggMjYuNjA5OCA3LjA0NDc4IDI2LjQ0NzZDNy4wOTc5NSAyNi4yODQ1IDcuMTUxMTEgMjYuMTIxMyA3LjIwNTg5IDI1Ljk1MzJDNy42MTc1NiAyNS43NTM3IDcuODk1OTggMjUuNzYxNCA4LjM1MTUyIDI1LjgxNDRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNOS4yMTA3NSAyLjc3NTc0QzkuNDk3MTUgMi45MjMyIDkuNDk3MTUgMi45MjMyIDkuNjQwMzYgMy4xOTIxQzkuNTk1NjEgMy43MDM4OCA5LjU5NTYxIDMuNzAzODggOS40OTcxNSA0LjE2MzYxQzkuNjA2NDQgNC4xNzUwNiA5LjcxNTcyIDQuMTg2NTEgOS44MjgzMSA0LjE5ODMxQzEwLjIxMzIgNC4zMDI0IDEwLjIxMzIgNC4zMDI0IDEwLjQ4MTcgNC41NDUyOEMxMC42ODU0IDQuOTQwMDkgMTAuNjMwMSA1LjEzNzM2IDEwLjQ5OTYgNS41NTE0OEMxMC42MzU0IDUuNTg4NyAxMC43NzEzIDUuNjI1OTEgMTAuOTExMyA1LjY2NDI1QzExLjM1ODggNS44MjkwNiAxMS4zNTg4IDUuODI5MDYgMTEuNjQ1MiA2LjI0NTQyQzExLjYzNjMgNi42NjE3OCAxMS42MzYzIDYuNjYxNzggMTEuNTAyIDcuMDc4MTRDMTEuMTc5OCA3LjM1NTcyIDExLjE3OTggNy4zNTU3MiAxMC43ODYgNy40OTQ1QzEwLjMzMTQgNy4zODE4IDEwLjExNTUgNy4yNjEwOSA5Ljc4MzU2IDYuOTM5MzVDOS43NjU2NiA2LjUwNTY0IDkuNzY1NjYgNi41MDU2NCA5Ljc4MzU2IDYuMTA2NjNDOS42NDQ3NCA2LjA0MDc5IDkuNTA1OTIgNS45NzQ5NiA5LjM2MjkgNS45MDcxMkM4LjkyNDM0IDUuNjkwMjcgOC45MjQzNCA1LjY5MDI3IDguNzgxMTQgNS41NTE0OEM4Ljc3NTI3IDUuMjI3NyA4Ljc3NTA2IDQuOTAzNzYgOC43ODExNCA0LjU3OTk3QzguNjY4OSA0LjU0Mjc2IDguNTU2NjYgNC41MDU1NSA4LjQ0MTAzIDQuNDY3MjFDOC4wNjUxMiA0LjMwMjQgOC4wNjUxMiA0LjMwMjQgNy43Nzg3MSAzLjg4NjA0QzcuNzI4NjcgMy40OTgwOSA3LjcyNTM5IDMuMjgwMjUgNy45MzA4NiAyLjk0MDU1QzguMzY0OTUgMi42ODI3IDguNzE0NDMgMi43MjQyIDkuMjEwNzUgMi43NzU3NFoiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0zNC40MTQ2IDkuOTkyNjhDMzQuNzE4MyAxMC4xOTU3IDM0LjgxODggMTAuMzUwNCAzNC45NjA2IDEwLjY3NzlDMzQuOTk1NiAxMS4wNTE3IDM0LjkyMjIgMTEuMjEzMSAzNC43MDEgMTEuNTE5M0MzNC4zMzcxIDExLjc3NDggMzQuMTg0MiAxMS44MDQzIDMzLjczNDQgMTEuNzQ0OUMzMy42MjggMTEuNzE2MiAzMy41MjE3IDExLjY4NzYgMzMuNDEyMiAxMS42NTgxQzMzLjMyMzYgMTEuNzcyNiAzMy4yMzUgMTEuODg3MSAzMy4xNDM3IDEyLjAwNTFDMzIuOTkzIDEyLjE3NjggMzIuOTkzIDEyLjE3NjggMzIuODM5NCAxMi4zNTIxQzMyLjc0NDggMTIuMzUyMSAzMi42NTAzIDEyLjM1MjEgMzIuNTUyOSAxMi4zNTIxQzMyLjU1MjkgMTEuODk0MSAzMi41NTI5IDExLjQzNjEgMzIuNTUyOSAxMC45NjQyQzMyLjY5NDcgMTAuOTE4NCAzMi44MzY1IDEwLjg3MjYgMzIuOTgyNiAxMC44MjU0QzMzLjA4MzEgMTAuNTk2MSAzMy4xNzg3IDEwLjM2NDcgMzMuMjY5IDEwLjEzMTVDMzMuNjY5OCA5LjkzNzI2IDMzLjk3MTQgOS45NTc2MiAzNC40MTQ2IDkuOTkyNjhaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNOS4yMTA3NSAyLjc3NTc0QzkuNDk3MTUgMi45MjMyIDkuNDk3MTUgMi45MjMyIDkuNjQwMzYgMy4xOTIxQzkuNTk1NjEgMy43MDM4OCA5LjU5NTYxIDMuNzAzODggOS40OTcxNSA0LjE2MzYxQzkuNjM4OTMgNC4yMDk0MSA5Ljc4MDcgNC4yNTUyMSA5LjkyNjc2IDQuMzAyNEM5LjczNzc0IDQuMzAyNCA5LjU0ODcxIDQuMzAyNCA5LjM1Mzk1IDQuMzAyNEM5LjM1Mzk1IDQuODA2MiA5LjM1Mzk1IDUuMzA5OTkgOS4zNTM5NSA1LjgyOTA2QzkuMTY0OTIgNS43Mzc0NiA4Ljk3NTg5IDUuNjQ1ODYgOC43ODExNCA1LjU1MTQ4QzguNzgxMTQgNS4yMzA4OCA4Ljc4MTE0IDQuOTEwMjkgOC43ODExNCA0LjU3OTk3QzguNjY4OSA0LjU0Mjc2IDguNTU2NjYgNC41MDU1NSA4LjQ0MTAzIDQuNDY3MjFDOC4wNjUxMiA0LjMwMjQgOC4wNjUxMiA0LjMwMjQgNy43Nzg3MSAzLjg4NjA0QzcuNzI4NjcgMy40OTgwOSA3LjcyNTM5IDMuMjgwMjUgNy45MzA4NiAyLjk0MDU1QzguMzY0OTUgMi42ODI3IDguNzE0NDMgMi43MjQyIDkuMjEwNzUgMi43NzU3NFoiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yNi4yNTIgNC4zMDI0QzI2LjI1MiA0LjgwNjIgMjYuMjUyIDUuMzEgMjYuMjUyIDUuODI5MDZDMjYuMzQ2NSA1Ljg3NDg2IDI2LjQ0MSA1LjkyMDY2IDI2LjUzODQgNS45Njc4NUMyNi41OTA3IDYuODYzMzIgMjYuNTkwNyA2Ljg2MzMyIDI2LjM1OTQgNy4xOTk1OEMyNi4wNjM1IDcuMzgzOTUgMjUuODg5OSA3LjQ3NDMzIDI1LjUzNiA3LjQ5NDVDMjUuMTUxMSA3LjM0NzA0IDI1LjE1MTEgNy4zNDcwNCAyNC44MTk5IDcuMDc4MTRDMjQuNjY3OCA2LjY3MDQ2IDI0LjY2NzggNi42NzA0NiAyNC42NzY3IDYuMjQ1NDJDMjQuOTQ2MiA1Ljg4NzU2IDI1LjEzNzkgNS43MjYzMyAyNS41NzE4IDUuNTg2MThDMjUuNjk1OCA1LjU2OTAxIDI1LjY5NTggNS41NjkwMSAyNS44MjI0IDUuNTUxNDhDMjUuNzc1MSA1LjUwNTY4IDI1LjcyNzkgNS40NTk4OSAyNS42NzkyIDUuNDEyN0MyNS42MzQ0IDUuMDAwNzggMjUuNjE0NCA0Ljc5Nzk0IDI1Ljg4NSA0LjQ2NzIxQzI2LjEwODggNC4zMDI0IDI2LjEwODggNC4zMDI0IDI2LjI1MiA0LjMwMjRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMi40MDg1NyA5Ljk5MjY3QzIuOTA5NzggMTAuMTMxNSAyLjkwOTc4IDEwLjEzMTUgMy4xNjkzNCAxMC40Nzg0QzMuMjI1NDYgMTAuNTkyOSAzLjI4MTU3IDEwLjcwNzQgMy4zMzkzOSAxMC44MjU0QzMuNDMzOTEgMTAuODcxMiAzLjUyODQyIDEwLjkxNyAzLjYyNTggMTAuOTY0MkMzLjUzMTI5IDExLjM3NjQgMy40MzY3NyAxMS43ODg2IDMuMzM5MzkgMTIuMjEzM0MzLjE5NzYyIDEyLjAzMDEgMy4wNTU4NSAxMS44NDY5IDIuOTA5NzggMTEuNjU4MUMyLjY3OTQgMTEuNzEzOSAyLjY3OTQgMTEuNzEzOSAyLjQ0NDM3IDExLjc3MDlDMS45MDczNiAxMS43OTY5IDEuOTA3MzYgMTEuNzk2OSAxLjU0OTM1IDExLjUwMkMxLjMzNDU0IDExLjEwMyAxLjMzNDU0IDExLjEwMyAxLjM0MzQ5IDEwLjczODdDMS41ODk5MyAxMC4xMzM2IDEuNzExNDcgOS45OTI2NyAyLjQwODU3IDkuOTkyNjdaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTcuOTQ2MiAwQzE3Ljk0NjIgMS43NDAzOSAxNy45NDYyIDMuNDgwNzggMTcuOTQ2MiA1LjI3MzkxQzE3Ljc1NzEgNS4xODIzMSAxNy41NjgxIDUuMDkwNzEgMTcuMzczNCA0Ljk5NjM0QzE3LjIzOTEgNC41Mjc5MyAxNy4yMzkxIDQuNTI3OTMgMTcuMjMwMiA0LjAyNDgzQzE3LjQzNiAzLjY4NjUzIDE3LjQzNiAzLjY4NjUzIDE3LjY1OTggMy40Njk2OEMxNy41ODg5IDMuNDE4MTUgMTcuNTE4IDMuMzY2NjMgMTcuNDQ1IDMuMzEzNTRDMTcuMjMwMiAzLjA1MzMyIDE3LjIzMDIgMy4wNTMzMiAxNy4xNzY1IDIuNjQ1NjNDMTcuMjM0NSAyLjE4NTkyIDE3LjM0MDMgMi4wMDA4NSAxNy42NTk4IDEuNjY1NDVDMTcuNTg1OSAxLjYxNjc4IDE3LjUxMjEgMS41NjgxMiAxNy40MzYgMS41MTc5OEMxNy4yMzAyIDEuMjQ5MDggMTcuMjMwMiAxLjI0OTA4IDE3LjI0ODEgMC43NTQ2NTVDMTcuNDQ2MyAwIDE3LjQ0NjMgMCAxNy45NDYyIDBaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNNS42MzA2NSAyNy42MTg2QzUuOTU1MjMgMjguMTgwNCA2LjI4NTEzIDI4LjgxOTkgNi4xMjI5MSAyOS40NjYyQzUuODM3ODkgMjkuNzkwNSA1LjYzMTUgMjkuODkwNyA1LjIwMTA0IDI5Ljk3OEM0Ljg2NTcgMjkuODIyOSA0LjYwNDg1IDI5LjY3NzggNC4zNDE4MSAyOS40MjI5QzQuMjc2NTYgMjguNjk1NiA0LjI3NjU2IDI4LjY5NTYgNC41MDI5MiAyOC4zMjk5QzQuODgzMTggMjguMTA4OCA1LjE5NjQ0IDI4LjE0NTcgNS42MzA2NSAyOC4xNzM4QzUuNjMwNjUgMjcuOTkwNiA1LjYzMDY1IDI3LjgwNzQgNS42MzA2NSAyNy42MTg2WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTMwLjg3OTMgMjguMDAwM0MzMS40MDczIDI4LjAzNSAzMS40MDczIDI4LjAzNSAzMS43NTY0IDI4LjE5MTFDMzEuOTgwMSAyOC40NTE0IDMxLjk4MDEgMjguNDUxNCAzMi4wNTE3IDI4Ljg1OUMzMS45ODAxIDI5LjI4NDEgMzEuOTgwMSAyOS4yODQxIDMxLjczODUgMjkuNjEzN0MzMS40MDczIDI5LjgzOTIgMzEuNDA3MyAyOS44MzkyIDMxLjA0MDQgMjkuODk5OUMzMC42MjM2IDI5LjgyNzUgMzAuNTE3OCAyOS43NDM2IDMwLjI2MTcgMjkuNDIyOUMzMC4yMTQ3IDI5LjExMzkgMzAuMjE0NyAyOS4xMTM5IDMwLjIyNTkgMjguNzgxQzMwLjIyODEgMjguNjcwNCAzMC4yMzAzIDI4LjU1OTkgMzAuMjMyNiAyOC40NDU5QzMwLjI4MjUgMjcuOTc5IDMwLjM3NjkgMjguMDM3IDMwLjg3OTMgMjguMDAwM1oiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yOC40ODk1IDI1LjcwMTZDMjguODI5NyAyNS44MTQ0IDI4LjgyOTcgMjUuODE0NCAyOS4xMTYxIDI2LjA5MkMyOS4wMjE1IDI2LjA5MiAyOC45MjcgMjYuMDkyIDI4LjgyOTcgMjYuMDkyQzI4Ljg3NjkgMjYuNzc5IDI4LjkyNDIgMjcuNDY2IDI4Ljk3MjkgMjguMTczOEMyOC45MjU2IDI4LjE3MzggMjguODc4MyAyOC4xNzM4IDI4LjgyOTcgMjguMTczOEMyOC44Mjk3IDI3Ljk0NDggMjguODI5NyAyNy43MTU4IDI4LjgyOTcgMjcuNDc5OEMyOC42OTk3IDI3LjQ5NDIgMjguNTY5NyAyNy41MDg1IDI4LjQzNTggMjcuNTIzMkMyNy45NzA0IDI3LjQ3OTggMjcuOTcwNCAyNy40Nzk4IDI3LjYyMTQgMjcuMTc2M0MyNy4zOTc2IDI2Ljc4NTkgMjcuMzk3NiAyNi43ODU5IDI3LjM5NzYgMjYuNDIxNkMyNy42Mjg1IDI1Ljg5MDEgMjcuODgxNSAyNS42NTk1IDI4LjQ4OTUgMjUuNzAxNloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0xOC4yMzI2IDEuODA0MjNDMTguNTg3IDEuOTQxNjMgMTguNTg3IDEuOTQxNjMgMTguOTQ4NiAyLjA4MTgxQzE5LjE0MjUgMi45NzAwNSAxOS4xNDI1IDIuOTcwMDUgMTguODg1OSAzLjM5MTYxQzE4LjgxMjEgMy40NjMxNyAxOC43MzgzIDMuNTM0NzQgMTguNjYyMiAzLjYwODQ3QzE4LjczNiAzLjY1NzEzIDE4LjgwOTkgMy43MDU3OSAxOC44ODU5IDMuNzU1OTNDMTkuMDkxOCA0LjAyNDgzIDE5LjA5MTggNC4wMjQ4MyAxOS4wNDcxIDQuNTM2NkMxOS4wMTQ2IDQuNjg4MzIgMTguOTgyMSA0Ljg0MDAzIDE4Ljk0ODYgNC45OTYzNEMxOC43NTk2IDUuMDQyMTQgMTguNTcwNSA1LjA4Nzk0IDE4LjM3NTggNS4xMzUxMkMxOC4yNDY4IDQuMDIxNTkgMTguMjE2IDIuOTI0MjkgMTguMjMyNiAxLjgwNDIzWiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTcuNjM1NTEgMjUuODE0NEM3Ljk1NzcxIDI1Ljc3MSA3Ljk1NzcxIDI1Ljc3MSA4LjM1MTUyIDI1LjgxNDRDOC42OTE2MyAyNi4xMTggOC42OTE2MyAyNi4xMTggOC45MjQzNCAyNi41MDgzQzguOTAxNTQgMjYuOTgzNSA4Ljg0MzcgMjcuMTQxNiA4LjQ5NDczIDI3LjQ3OThDNy45NzU2MSAyNy40OTcyIDcuOTc1NjEgMjcuNDk3MiA3LjQ5MjMgMjcuNDc5OEM3LjQ4ODQ0IDI3LjI1NDMgNy40ODU2NiAyNy4wMjg4IDcuNDgzMzUgMjYuODAzM0M3LjQ4MTY5IDI2LjY3NzcgNy40ODAwMyAyNi41NTIxIDcuNDc4MzIgMjYuNDIyN0M3LjQ5MjMgMjYuMDkyIDcuNDkyMyAyNi4wOTIgNy42MzU1MSAyNS44MTQ0WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTEwLjM1NjQgNS42OTAyN0MxMS4yMTU2IDUuNjkwMjcgMTEuMjE1NiA1LjY5MDI3IDExLjQ5MzEgNS45MTU4QzExLjcwMzEgNi4zNzA4NiAxMS42NjY4IDYuNjA5MDUgMTEuNTAyIDcuMDc4MTRDMTEuMTYxOSA3LjM0NzA0IDExLjE2MTkgNy4zNDcwNCAxMC43ODYgNy40OTQ1MUMxMC42NDQyIDcuNDQ4NzEgMTAuNTAyNCA3LjQwMjkxIDEwLjM1NjQgNy4zNTU3MkMxMC4zNTY0IDYuODA2MTIgMTAuMzU2NCA2LjI1NjUyIDEwLjM1NjQgNS42OTAyN1oiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yNy4zOTc2IDIuNzc1NzRDMjguMTEzNiAyLjc3NTc0IDI4LjExMzYgMi43NzU3NCAyOC4zODIxIDIuOTIzMkMyOC42NDA3IDMuMzU0NzggMjguNTE0NSAzLjY5NDE1IDI4LjQgNC4xNjM2MUMyOC4zMDU1IDQuMjU1MjEgMjguMjExIDQuMzQ2ODEgMjguMTEzNiA0LjQ0MTE5QzI3Ljg3NzMgNC40NDExOSAyNy42NDExIDQuNDQxMTkgMjcuMzk3NiA0LjQ0MTE5QzI3LjM5NzYgMy44OTE1OSAyNy4zOTc2IDMuMzQxOTkgMjcuMzk3NiAyLjc3NTc0WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTYuOTE5NDkgMjcuMDYzNUM2Ljg3MjI0IDI3LjU2NzMgNi44MjQ5OCAyOC4wNzExIDYuNzc2MjkgMjguNTkwMUM2Ljg3MDggMjguNjM1OSA2Ljk2NTMyIDI4LjY4MTcgNy4wNjI3IDI4LjcyODlDNi42NTk5NCAyOC43NjM2IDYuNjU5OTQgMjguNzYzNiA2LjIwMzQ3IDI4LjcyODlDNS44MzMyNiAyOC40MTggNS43ODA0NyAyOC4yMTg2IDUuNzExMjEgMjcuNzQ4N0M1Ljc3Mzg2IDI3LjM0MTEgNS43NzM4NiAyNy4zNDExIDYuMDI0NDcgMjcuMDcyMkM2LjM0NjY4IDI2LjkyNDcgNi4zNDY2OCAyNi45MjQ3IDYuOTE5NDkgMjcuMDYzNVoiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0yNy41NzY2IDIuNjcxNjVDMjcuNjU5MyAyLjcwNiAyNy43NDIgMi43NDAzNSAyNy44MjcyIDIuNzc1NzRDMjcuNzEyIDIuODIxNTQgMjcuNTk2OSAyLjg2NzM0IDI3LjQ3ODIgMi45MTQ1M0MyNy4wOTM0IDMuMTQ4OTcgMjcuMDkzNCAzLjE0ODk3IDI3LjAzMTggMy40NjY5N0MyNi45OTg0IDMuNzQ0MzIgMjYuOTgyMiA0LjAyMzUgMjYuOTY4IDQuMzAyNEMyNi44NzM1IDQuMzAyNCAyNi43NzkgNC4zMDI0IDI2LjY4MTYgNC4zMDI0QzI2LjY4MTYgNC44MDYyIDI2LjY4MTYgNS4zMSAyNi42ODE2IDUuODI5MDZDMjYuODIzNCA1Ljg3NDg2IDI2Ljk2NTEgNS45MjA2NiAyNy4xMTEyIDUuOTY3ODVDMjYuODI3NyA1LjkyMjA1IDI2LjU0NDEgNS44NzYyNSAyNi4yNTIgNS44MjkwNkMyNi4yNDA0IDUuNTgwNSAyNi4yMzIxIDUuMzMxOCAyNi4yMjUxIDUuMDgzMDhDMjYuMjIwMiA0Ljk0NDYxIDI2LjIxNTIgNC44MDYxMyAyNi4yMSA0LjY2MzQ3QzI2LjIyMzkgNC41NDQzMSAyNi4yMzc3IDQuNDI1MTYgMjYuMjUyIDQuMzAyNEMyNi4zOTM4IDQuMjEwOCAyNi41MzU1IDQuMTE5MiAyNi42ODE2IDQuMDI0ODNDMjYuNjc4NiAzLjg5MzE1IDI2LjY3NTcgMy43NjE0OCAyNi42NzI3IDMuNjI1ODJDMjYuNjgxNiAzLjE5MjExIDI2LjY4MTYgMy4xOTIxMSAyNi45MzIyIDIuODUzODFDMjcuMjU0NCAyLjYzNjk2IDI3LjI1NDQgMi42MzY5NiAyNy41NzY2IDIuNjcxNjVaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMzEuMTIwOSAyOC4xNzM4QzMxLjgzNjkgMjguMzEyNiAzMS44MzY5IDI4LjMxMjYgMzEuOTgwMSAyOC40NTE0QzMyLjAxNzggMjkuMDEwOSAzMi4wMjIyIDI5LjIyMjkgMzEuNjkzNyAyOS43MDA0QzMxLjUwNDcgMjkuNzAwNCAzMS4zMTU3IDI5LjcwMDQgMzEuMTIwOSAyOS43MDA0QzMxLjEyMDkgMjkuMTk2NiAzMS4xMjA5IDI4LjY5MjggMzEuMTIwOSAyOC4xNzM4WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTguNjM3OTMgMi43NzU3NEM4LjYzNzkzIDMuMzI1MzQgOC42Mzc5MyAzLjg3NDk0IDguNjM3OTMgNC40NDExOUM4LjA2NTEyIDQuMzAyNCA4LjA2NTEyIDQuMzAyNCA3Ljc3ODcxIDMuODg2MDRDNy43MjYwNCAzLjQ3NzY2IDcuNzE0NjIgMy4yNzc4OCA3Ljk2NjY2IDIuOTQwNTVDOC4yMDgzMiAyLjc3NTc0IDguMjA4MzIgMi43NzU3NCA4LjYzNzkzIDIuNzc1NzRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMjUuNTM2IDUuNjkwMjdDMjUuNTM2IDYuMjM5ODcgMjUuNTM2IDYuNzg5NDcgMjUuNTM2IDcuMzU1NzJDMjQuOTYzMiA3LjIxNjkzIDI0Ljk2MzIgNy4yMTY5MyAyNC42NzY4IDYuODAwNTdDMjQuNzAzNiA2LjM3NTUzIDI0LjcwMzYgNi4zNzU1MyAyNC44MiA1Ljk2Nzg1QzI1LjI0OTYgNS42OTAyNyAyNS4yNDk2IDUuNjkwMjcgMjUuNTM2IDUuNjkwMjdaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTAuMDcgNC40NDExOUMxMC4yMTE3IDQuNDg2OTkgMTAuMzUzNSA0LjUzMjc5IDEwLjQ5OTYgNC41Nzk5N0MxMC42NjA3IDUuMjM5MjEgMTAuNjYwNyA1LjIzOTIxIDEwLjQ5OTYgNS41NTE0OEMxMC40NjY3IDUuODU3NDIgMTAuNDQwOCA2LjE2NDA4IDEwLjQxOSA2LjQ3MDk1QzEwLjQwNyA2LjYzNTkgMTAuMzk1IDYuODAwODUgMTAuMzgyNyA2Ljk3MDhDMTAuMzc0IDcuMDk3ODIgMTAuMzY1MyA3LjIyNDg0IDEwLjM1NjQgNy4zNTU3MkMxMC4yMTQ2IDcuMjY0MTIgMTAuMDcyOCA3LjE3MjUyIDkuOTI2NzYgNy4wNzgxNEM5Ljg5MTEzIDYuODA0NTcgOS44OTExMyA2LjgwNDU3IDkuOTE2MTMgNi40NzQyQzkuOTIzOTggNi4zNTYxMiA5LjkzMTgyIDYuMjM4MDUgOS45Mzk5MSA2LjExNjM5QzkuOTUwMzQgNS45OTI5NSA5Ljk2MDc3IDUuODY5NSA5Ljk3MTUxIDUuNzQyMzJDOS45ODAyOCA1LjYxNzggOS45ODkwNSA1LjQ5MzI4IDkuOTk4MDggNS4zNjQ5OUMxMC4wMjAxIDUuMDU2ODcgMTAuMDQ0MSA0Ljc0OTAyIDEwLjA3IDQuNDQxMTlaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTguMzc1OCAwLjEzODc4NkMxOC41NjQ4IDAuMTg0NTg2IDE4Ljc1MzkgMC4yMzAzODYgMTguOTQ4NiAwLjI3NzU3M0MxOS4xMjc2IDEuMTk3MDQgMTkuMTI3NiAxLjE5NzA0IDE4LjgwNTQgMS42NjU0NEMxOC42NjM2IDEuNjY1NDQgMTguNTIxOSAxLjY2NTQ0IDE4LjM3NTggMS42NjU0NEMxOC4zNzU4IDEuMTYxNjUgMTguMzc1OCAwLjY1Nzg1IDE4LjM3NTggMC4xMzg3ODZaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTAuMzU2NCA1LjY5MDI3QzEwLjQ5ODEgNS42OTAyNyAxMC42Mzk5IDUuNjkwMjcgMTAuNzg2IDUuNjkwMjdDMTAuNzg2IDYuMjg1NjcgMTAuNzg2IDYuODgxMDcgMTAuNzg2IDcuNDk0NTFDMTAuNjQ0MiA3LjQ0ODcxIDEwLjUwMjQgNy40MDI5MSAxMC4zNTY0IDcuMzU1NzJDMTAuMzU2NCA2LjgwNjEyIDEwLjM1NjQgNi4yNTY1MiAxMC4zNTY0IDUuNjkwMjdaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMjUuNTM2IDUuNjkwMjdDMjUuNjc3OCA1LjY5MDI3IDI1LjgxOTUgNS42OTAyNyAyNS45NjU2IDUuNjkwMjdDMjUuOTY1NiA2LjIzOTg3IDI1Ljk2NTYgNi43ODk0NyAyNS45NjU2IDcuMzU1NzJDMjUuODIzOCA3LjQwMTUyIDI1LjY4MiA3LjQ0NzMyIDI1LjUzNiA3LjQ5NDUxQzI1LjUzNiA2Ljg5OTExIDI1LjUzNiA2LjMwMzcxIDI1LjUzNiA1LjY5MDI3WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTE4LjUxOSAxLjk0MzAyQzE4LjY2MDggMS45ODg4MiAxOC44MDI1IDIuMDM0NjIgMTguOTQ4NiAyLjA4MTgxQzE5LjEwOTcgMy4wMTg2MiAxOS4xMDk3IDMuMDE4NjIgMTguOTQ4NiAzLjMzMDg5QzE4LjgwNjggMy4zMzA4OSAxOC42NjUxIDMuMzMwODkgMTguNTE5IDMuMzMwODlDMTguNTE5IDIuODcyODkgMTguNTE5IDIuNDE0OSAxOC41MTkgMS45NDMwMloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0xOC41MTkgMy43NDcyNUMxOC44MDI1IDMuODg0NjUgMTguODAyNSAzLjg4NDY1IDE5LjA5MTggNC4wMjQ4M0MxOS4wNDQ2IDQuMzQ1NDIgMTguOTk3MyA0LjY2NjAyIDE4Ljk0ODYgNC45OTYzNEMxOC44MDY4IDUuMDQyMTQgMTguNjY1MSA1LjA4Nzk0IDE4LjUxOSA1LjEzNTEyQzE4LjUxOSA0LjY3NzEzIDE4LjUxOSA0LjIxOTEzIDE4LjUxOSAzLjc0NzI1WiIgZmlsbD0iIzc5QjUyQSIvPg0KPHBhdGggZD0iTTI3Ljk3MDQgMi45MTQ1M0MyOC4yNTQgMy4wNTE5MyAyOC4yNTQgMy4wNTE5MyAyOC41NDMyIDMuMTkyMUMyOC40OTYgMy41MTI3IDI4LjQ0ODcgMy44MzMzIDI4LjQgNC4xNjM2MUMyOC4yNTgzIDQuMjA5NDEgMjguMTE2NSA0LjI1NTIxIDI3Ljk3MDQgNC4zMDI0QzI3Ljk3MDQgMy44NDQ0IDI3Ljk3MDQgMy4zODY0MSAyNy45NzA0IDIuOTE0NTNaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMjcuODI3MiAyNS44MTQ0QzI3LjkyMTcgMjUuODYwMiAyOC4wMTYzIDI1LjkwNiAyOC4xMTM2IDI1Ljk1MzJDMjguMDY2NCAyNi4zNjU0IDI4LjAxOTEgMjYuNzc3NiAyNy45NzA0IDI3LjIwMjNDMjcuODI4NyAyNy4xNTY1IDI3LjY4NjkgMjcuMTEwNyAyNy41NDA4IDI3LjA2MzVDMjcuNDQyNCAyNi43NTEyIDI3LjQ0MjQgMjYuNzUxMiAyNy4zOTc2IDI2LjM2OTZDMjcuNjAzNSAyNi4wNDg2IDI3LjYwMzUgMjYuMDQ4NiAyNy44MjcyIDI1LjgxNDRaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTcuNTE2NiAwLjEzODc4NkMxNy42MTExIDAuMTg0NTg2IDE3LjcwNTYgMC4yMzAzODYgMTcuODAzIDAuMjc3NTczQzE3Ljc1NTcgMC42ODk3NzEgMTcuNzA4NSAxLjEwMTk3IDE3LjY1OTggMS41MjY2NkMxNy41NjUyIDEuNTI2NjYgMTcuNDcwNyAxLjUyNjY2IDE3LjM3MzQgMS41MjY2NkMxNy4xOTQ0IDAuNjA3MTkzIDE3LjE5NDQgMC42MDcxOTMgMTcuNTE2NiAwLjEzODc4NloiIGZpbGw9IiM3OUI1MkEiLz4NCjxwYXRoIGQ9Ik0xNy41MTY2IDMuNzQ3MjVDMTcuNTYzOCAzLjc0NzI1IDE3LjYxMTEgMy43NDcyNSAxNy42NTk4IDMuNzQ3MjVDMTcuNjU5OCA0LjIwNTI1IDE3LjY1OTggNC42NjMyNSAxNy42NTk4IDUuMTM1MTJDMTcuMjMwMiA0LjcxODc2IDE3LjIzMDIgNC43MTg3NiAxNy4xODU0IDQuMzYzMTJDMTcuMjMwMiA0LjAyNDgzIDE3LjIzMDIgNC4wMjQ4MyAxNy41MTY2IDMuNzQ3MjVaIiBmaWxsPSIjNzlCNTJBIi8+DQo8cGF0aCBkPSJNMTguODA1NCAwLjQxNjM2MUMxOC44OTk5IDAuNDYyMTYxIDE4Ljk5NDQgMC41MDc5NiAxOS4wOTE4IDAuNTU1MTQ4QzE5LjA0NDUgMC44NzU3NDYgMTguOTk3MyAxLjE5NjM0IDE4Ljk0ODYgMS41MjY2NkMxOC44NTQxIDEuNTI2NjYgMTguNzU5NiAxLjUyNjY2IDE4LjY2MjIgMS41MjY2NkMxOC42NTYxIDEuMjAyODcgMTguNjU2MyAwLjg3ODkzNSAxOC42NjIyIDAuNTU1MTQ4QzE4LjcwOTQgMC41MDkzNDggMTguNzU2NyAwLjQ2MzU0OCAxOC44MDU0IDAuNDE2MzYxWiIgZmlsbD0iIzc5QjUyQSIvPg0KPC9zdmc+DQo="
    const interpretLabel = t('survey.result.interpretationLabel','Interpretation');
    
    // Get recommendations
    const rec = recommendations;
    const recTitle = templateString(rec.title, { score_overall: String(scores.percent) });
    const recHow = templateString(rec.how, { score_overall: String(scores.percent) });
    const logo = `data:image/svg+xml;base64,${logobase64}`;
    const recWhy = templateString(rec.why, { score_overall: String(scores.percent) });
    const recHeader = currentLanguage === 'pl' ? 'Rekomendacje' : 'Recommendations';

    // Get color and risk for overall ESG score
    // CRITICAL: Uses TOP 3 state if available (per TOP 3 spec p. 3)
    const overallEsgColorAndRisk = getEsgScoreColorAndRisk(scores.percent, scores.relevance);
    
    // Get gradient colors based on score color
    const getGradientColors = (color) => {
        if (color === '#ef4444') {
            // Red gradient
            return { from: '#fef2f2', to: '#fee2e2' };
        } else if (color === '#eab308') {
            // Yellow gradient (for Umiarkowany)
            return { from: '#fefce8', to: '#fef9c3' };
        } else if (color === '#f97316' || color === '#f59e0b') {
            // Orange gradient (for Podwyższone ryzyko)
            return { from: '#fff7ed', to: '#ffedd5' };
        } else {
            // Green gradient (default)
            return { from: '#f0fdf4', to: '#dcfce7' };
        }
    };
    const gradientColors = getGradientColors(overallEsgColorAndRisk.color);
    
    // Calculate color based on score percentage (for radar chart E, S, G, Supply - NOT overall score)
    // Uses 4-state thresholds per "_system punktacji i progów przejścia.pdf"
    // Colors: Green (good), Yellow (moderate), Orange (elevated), Red (critical)
    const getScoreColor = (score, max) => {
        const percentage = (score / max) * 100;
        if (percentage >= 81) return '#22c55e'; // Green - Dobry (81-100%)
        if (percentage >= 51) return '#eab308'; // Yellow - Umiarkowany (51-80%)
        if (percentage >= 31) return '#f97316'; // Orange - Podwyższone ryzyko (31-50%)
        return '#ef4444'; // Red - Krytyczny (0-30%)
    };

    // Calculate color for importance/MS values (0-100 scale)
    // Uses same 4-state thresholds for consistency
    // Colors: Green (good), Yellow (moderate), Orange (elevated), Red (critical)
    const getImportanceColor = (importanceValue) => {
        if (importanceValue >= 81) return '#22c55e'; // Green - Dobry
        if (importanceValue >= 51) return '#eab308'; // Yellow - Umiarkowany
        if (importanceValue >= 31) return '#f97316'; // Orange - Podwyższone ryzyko
        return '#ef4444'; // Red - Krytyczny
    };

    // Table of initial values (Bᵢ) for each industry
    const industryBaselineValues = {
        'Energy': { e: 95, s: 70, g: 80, sup: 60 },
        'Fintech': { e: 30, s: 60, g: 95, sup: 40 },
        'Retail': { e: 70, s: 75, g: 65, sup: 90 },
        'IT / Software': { e: 30, s: 70, g: 85, sup: 35 },
        'IT': { e: 30, s: 70, g: 85, sup: 35 },
        'Software': { e: 30, s: 70, g: 85, sup: 35 },
        'Logistics': { e: 85, s: 80, g: 65, sup: 90 },
        'Transport': { e: 90, s: 80, g: 65, sup: 70 },
        'Manufacturing': { e: 90, s: 80, g: 70, sup: 85 },
        'Services': { e: 40, s: 75, g: 80, sup: 45 },
        'Construction': { e: 90, s: 80, g: 70, sup: 85 }
    };
    
    // Mapping from form values and display names to baseline keys
    // Form values: construction, energy, fintech, retail, it, logistics, manufacturing, transport, services
    // Display names can be in different languages: "Budownictwo", "Energetyka", "IT / Software", etc.
    const industryMapping = {
        // Form values (from select option data-value)
        'construction': 'Construction',
        'energy_raw_materials': 'Energy',
        'industrial_production': 'Manufacturing',
        'logistics_transport': 'Logistics',
        'trade_retail': 'Retail',
        'it_software': 'IT / Software',
        'finance': 'Fintech',
        'services_other': 'Services',
        // Legacy form values
        'energy': 'Energy',
        'fintech': 'Fintech',
        'retail': 'Retail',
        'it': 'IT / Software',
        'logistics': 'Logistics',
        'manufacturing': 'Manufacturing',
        'transport': 'Transport',
        'services': 'Services',
        // Display names (English)
        'Construction': 'Construction',
        'Energy': 'Energy',
        'Fintech': 'Fintech',
        'Retail': 'Retail',
        'IT / Software': 'IT / Software',
        'IT': 'IT / Software',
        'Software': 'IT / Software',
        'Logistics': 'Logistics',
        'Manufacturing': 'Manufacturing',
        'Transport': 'Transport',
        'Services': 'Services',
        // Polish names (exact match from survey dropdown)
        'Budownictwo': 'Construction',
        'Energetyka i surowce': 'Energy',
        'Produkcja przemysłowa': 'Manufacturing',
        'Logistyka i transport': 'Logistics',
        'Handel i detalika': 'Retail',
        'IT i oprogramowanie': 'IT / Software',
        'Finanse (w tym fintech)': 'Fintech',
        'Usługi (inne)': 'Services',
        // Legacy Polish names
        'Energetyka': 'Energy',
        'Handel (retail)': 'Retail',
        'Handel i detal': 'Retail',
        'IT / Oprogramowanie': 'IT / Software',
        'Logistyka': 'Logistics',
        'Produkcja': 'Manufacturing',
        'Usługi': 'Services'
    };
    
    // Get industry from clientDetails (can be form value, English name, or Polish name)
    const industryInput = clientDetails?.industry || '';
    // Try to find mapping, fallback to direct lookup, then to 'Services'
    const industryKey = industryMapping[industryInput] || 
                       (industryBaselineValues[industryInput] ? industryInput : null) || 
                       'Services';
    const baselineValues = industryBaselineValues[industryKey] || industryBaselineValues['Services'];

    // Format industry name for display in importance label
    const industryDisplayName = industryKey || 'niche';

    // Mapping from industryKey to industry code for INDUSTRY_COMMENTS
    const industryCodeMapping = {
        // English names
        'Construction': 'construction',
        'Energy': 'energy_resources',
        'Fintech': 'finance_fintech',
        'Retail': 'retail_trade',
        'IT / Software': 'it_software',
        'IT': 'it_software',
        'Software': 'it_software',
        'Logistics': 'logistics_transport',
        'Transport': 'logistics_transport',
        'Manufacturing': 'industrial_production',
        'Services': 'services_other',
        // Polish names (exact match from survey dropdown)
        'Budownictwo': 'construction',
        'Energetyka i surowce': 'energy_resources',
        'Produkcja przemysłowa': 'industrial_production',
        'Logistyka i transport': 'logistics_transport',
        'Handel i detalika': 'retail_trade',
        'IT i oprogramowanie': 'it_software',
        'Finanse (w tym fintech)': 'finance_fintech',
        'Usługi (inne)': 'services_other',
        // Legacy Polish names (for backwards compatibility)
        'Energetyka': 'energy_resources',
        'Fintech': 'finance_fintech',
        'Handel i detal': 'retail_trade',
        'Handel (retail)': 'retail_trade',
        'IT / Oprogramowanie': 'it_software',
        'Logistyka': 'logistics_transport',
        'Transport': 'logistics_transport',
        'Produkcja': 'industrial_production',
        'Usługi': 'services_other'
    };
    const industryCode = industryCodeMapping[industryKey] || 'services_other';

    // Helper function to get MS (Materiality Score) label based on value
    const getMSLabel = (msValue, lang) => {
        if (msValue >= 81) {
            return lang === 'pl' ? 'Strategiczny priorytet' : 'Strategic Priority';
        } else if (msValue >= 46) {
            return lang === 'pl' ? 'Istotny wpływ operacyjny' : 'Significant Operational Impact';
        } else {
            return lang === 'pl' ? 'Standardowa odpowiedzialność' : 'Standard Responsibility';
        }
    };

    // Helper function to get industry comment
    const getIndustryCommentText = (pillar, lang) => {
        if (typeof ESGScoring !== 'undefined' && ESGScoring.getIndustryComment) {
            return ESGScoring.getIndustryComment(industryCode, pillar, lang);
        }
        return '';
    };

    // Helper function to get industry risk intro for TOP 3
    const getIndustryRiskIntroText = (pillar, lang) => {
        if (typeof ESGScoring !== 'undefined' && ESGScoring.getIndustryRiskIntro) {
            return ESGScoring.getIndustryRiskIntro(industryCode, pillar, lang);
        }
        return '';
    };

    // Helper function to get industry profile for "Szczegółowe wyniki ESG" section (Task #5 from Korekta.pdf)
    const getIndustryProfileText = (pillar, lang) => {
        // Use window.IndustryProfile which exports the correct 3-parameter function
        if (typeof window !== 'undefined' && window.IndustryProfile && window.IndustryProfile.getIndustryProfileText) {
            return window.IndustryProfile.getIndustryProfileText(industryCode, pillar, lang);
        }
        return '';
    };

    // Helper function to generate linking sentence (Task #6 from Korekta.pdf)
    // Connects overall state with pillar states and explains TOP 3 priorities
    const generateLinkingSentence = (overallStateCode, pillarStates, top3Areas, lang) => {
        if (!top3Areas || top3Areas.length === 0) return '';

        const isPolish = lang === 'pl';

        // Map state codes to labels
        const stateLabels = {
            'pl': {
                'green': 'dobry',
                'yellow': 'umiarkowany',
                'orange': 'podwyższony',
                'critical': 'krytyczny'
            },
            'en': {
                'green': 'good',
                'yellow': 'moderate',
                'orange': 'elevated',
                'critical': 'critical'
            }
        };

        // Map pillar codes to names
        const pillarNames = {
            'pl': { 'E': 'E', 'S': 'S', 'G': 'G', 'SC': 'SC' },
            'en': { 'E': 'E', 'S': 'S', 'G': 'G', 'SC': 'SC' }
        };

        const overallLabel = stateLabels[isPolish ? 'pl' : 'en'][overallStateCode] || overallStateCode;

        // Find pillars in problematic states (orange or critical)
        const problematicPillars = [];
        Object.keys(pillarStates).forEach(pillar => {
            const state = pillarStates[pillar];
            if (state === 'critical' || state === 'orange') {
                problematicPillars.push({
                    pillar: pillar,
                    state: state,
                    name: pillarNames[isPolish ? 'pl' : 'en'][pillar]
                });
            }
        });

        // Extract TOP 3 pillar names
        const top3Pillars = top3Areas.slice(0, 3).map(area =>
            pillarNames[isPolish ? 'pl' : 'en'][area.area]
        );

        // Generate sentence
        if (problematicPillars.length === 0) {
            // No problematic pillars
            if (isPolish) {
                return `Wynik ogólny jest ${overallLabel}. Priorytety koncentrują się na obszarach ${top3Pillars.join(', ')}, aby dalej rozwijać standardy ESG.`;
            } else {
                return `The overall result is ${overallLabel}. Priorities focus on areas ${top3Pillars.join(', ')} to further develop ESG standards.`;
            }
        } else if (problematicPillars.length === 1) {
            const pillar = problematicPillars[0];
            const stateLabel = stateLabels[isPolish ? 'pl' : 'en'][pillar.state];
            if (isPolish) {
                return `Wynik ogólny jest ${overallLabel}, jednak filar ${pillar.name} znajduje się w stanie ${stateLabel} – dlatego priorytety koncentrują się na tym obszarze.`;
            } else {
                return `The overall result is ${overallLabel}, however pillar ${pillar.name} is in ${stateLabel} state – therefore priorities focus on this area.`;
            }
        } else {
            // Multiple problematic pillars
            const pillarList = problematicPillars.map(p => p.name).join(isPolish ? ' i ' : ' and ');
            const worstState = problematicPillars.some(p => p.state === 'critical') ? 'critical' : 'orange';
            const stateLabel = stateLabels[isPolish ? 'pl' : 'en'][worstState];
            if (isPolish) {
                return `Wynik ogólny jest ${overallLabel}, jednak filary ${pillarList} znajdują się w stanie ${stateLabel} – dlatego priorytety koncentrują się na tych obszarach.`;
            } else {
                return `The overall result is ${overallLabel}, however pillars ${pillarList} are in ${stateLabel} state – therefore priorities focus on these areas.`;
            }
        }
    };
    
    // Calculate user percentages for each section
    const userPercentages = {
        e: (scores.e / 30) * 100,
        s: (scores.s / 25) * 100,
        g: (scores.g / 20) * 100,
        sup: (scores.sup / 15) * 100
    };

    // Calculate MS (Materiality Score) for each pillar
    // Formula: MSᵢ = min(100, (Bᵢ × 0.6) + (R × 0.2) + (C × 0.2))
    // Where:
    //   Bᵢ = baseline value for industry/section (from industryBaselineValues)
    //   R = user's score percentage for that section
    //   C = user's Supply Chain score percentage
    const calculateMS = (sectionBaseline, userSectionPercent, userSupplyChainPercent) => {
        const ms = (sectionBaseline * 0.6) + (userSectionPercent * 0.2) + (userSupplyChainPercent * 0.2);
        return Math.min(100, Math.max(0, ms));
    };

    // Calculate MS for each pillar using the formula
    // R = userPercentages for that section, C = userPercentages.sup (Supply Chain)
    const pillarMS = {
        e: calculateMS(baselineValues.e, userPercentages.e, userPercentages.sup),
        s: calculateMS(baselineValues.s, userPercentages.s, userPercentages.sup),
        g: calculateMS(baselineValues.g, userPercentages.g, userPercentages.sup),
        sup: calculateMS(baselineValues.sup, userPercentages.sup, userPercentages.sup)
    };

    const importanceValues = {
        e: pillarMS.e,
        s: pillarMS.s,
        g: pillarMS.g,
        sup: pillarMS.sup
    };

    // Calculate user average MS (excluding Supply Chain as per example)
    const userMSAvg = Math.round((pillarMS.e + pillarMS.s + pillarMS.g) / 3);

    // Get R and C values for industry average calculation (if available)
    const relevanceR = (scores.relevance && scores.relevance.R !== undefined) ? scores.relevance.R : userPercentages.e;
    const relevanceC = (scores.relevance && scores.relevance.C !== undefined) ? scores.relevance.C : userPercentages.sup;

    // Calculate industry average MS for comparison
    const industryMS = {
        e: calculateMS(baselineValues.e, relevanceR, relevanceC),
        s: calculateMS(baselineValues.s, relevanceR, relevanceC),
        g: calculateMS(baselineValues.g, relevanceR, relevanceC)
    };

    // Calculate industry average MS
    const industryMSAvg = Math.round((industryMS.e + industryMS.s + industryMS.g) / 3);

    // Get color for industry average (neutral gray to avoid conflict with user score)
    const industryColorAndRisk = getEsgScoreColorAndRisk(industryMSAvg);

    // Calculate pillar states for linking sentence (Task #6 from Korekta.pdf)
    const pillarStates = {
        'E': getEsgScoreColorAndRisk(userPercentages.e, scores.relevance).stateCode,
        'S': getEsgScoreColorAndRisk(userPercentages.s, scores.relevance).stateCode,
        'G': getEsgScoreColorAndRisk(userPercentages.g, scores.relevance).stateCode,
        'SC': getEsgScoreColorAndRisk(userPercentages.sup, scores.relevance).stateCode
    };
    
    // Determine comparison text
    const diff = Math.abs(userMSAvg - industryMSAvg);
    let comparisonText;
    if (userMSAvg > industryMSAvg) {
        comparisonText = diff <= 5 
            ? (currentLanguage === 'pl' ? 'Nieznacznie powyżej średniej' : 'Slightly above average')
            : (currentLanguage === 'pl' ? 'Powyżej średniej' : 'Above average');
    } else if (userMSAvg < industryMSAvg) {
        comparisonText = diff <= 5
            ? (currentLanguage === 'pl' ? 'Nieznacznie poniżej średniej' : 'Slightly below average')
            : (currentLanguage === 'pl' ? 'Poniżej średniej' : 'Below average');
    } else {
        comparisonText = currentLanguage === 'pl' ? 'Na poziomie średniej' : 'At average level';
    }
    
    // Create radar chart data
    const radarChartData = {
        e: { score: scores.e, max: 30, color: getScoreColor(scores.e, 30) },
        s: { score: scores.s, max: 25, color: getScoreColor(scores.s, 25) },
        g: { score: scores.g, max: 20, color: getScoreColor(scores.g, 20) },
        sup: { score: scores.sup, max: 15, color: getScoreColor(scores.sup, 15) }
    };

    // Create importance colors based on MS values (0-100 scale)
    const importanceColors = {
        e: getImportanceColor(importanceValues.e),
        s: getImportanceColor(importanceValues.s),
        g: getImportanceColor(importanceValues.g),
        sup: getImportanceColor(importanceValues.sup)
    };

    // Function to create radar chart SVG
    function createRadarChart(scores) {
        const centerX = 250;
        const centerY = 250;
        const radius = 120;
        
        // Calculate angles for each axis (E, S, G, Supply)
        const angles = {
            e: -Math.PI / 2, // Top
            s: 0, // Right
            g: Math.PI / 2, // Bottom
            sup: Math.PI // Left
        };
        
        // Calculate points for the radar polygon
        const points = [];
        Object.keys(angles).forEach(key => {
            const angle = angles[key];
            const score = scores[key];
            const max = radarChartData[key].max;
            const ratio = score / max;
            const x = centerX + radius * ratio * Math.cos(angle);
            const y = centerY + radius * ratio * Math.sin(angle);
            points.push(`${x},${y}`);
        });
        
        // Create SVG
        return `
            <svg viewBox="0 80 500 420" style="display: block; margin: 0; max-width: 100%; height: auto; width: 100%; aspect-ratio: 1 / 1; overflow: hidden;">
                <!-- Background circles -->
                <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#94a3b8" stroke-width="3" opacity="0.8"/>
                <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.75}" fill="none" stroke="#94a3b8" stroke-width="3" opacity="0.8"/>
                <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.5}" fill="none" stroke="#94a3b8" stroke-width="3" opacity="0.8"/>
                <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.25}" fill="none" stroke="#94a3b8" stroke-width="3" opacity="0.8"/>
                
                <!-- Axes -->
                <line x1="${centerX}" y1="${centerY - radius}" x2="${centerX}" y2="${centerY + radius}" stroke="#64748b" stroke-width="3" opacity="0.9"/>
                <line x1="${centerX - radius}" y1="${centerY}" x2="${centerX + radius}" y2="${centerY}" stroke="#64748b" stroke-width="3" opacity="0.9"/>
                
                <!-- Radar polygon -->
                <polygon points="${points.join(' ')}" fill="rgba(163, 204, 75, 0.4)" stroke="#A3CC4B" stroke-width="4"/>
                
                <!-- Data points -->
                ${Object.keys(angles).map(key => {
                    const angle = angles[key];
                    const score = scores[key];
                    const max = radarChartData[key].max;
                    const ratio = score / max;
                    const x = centerX + radius * ratio * Math.cos(angle);
                    const y = centerY + radius * ratio * Math.sin(angle);
                    return `<circle cx="${x}" cy="${y}" r="8" fill="${radarChartData[key].color}" stroke="white" stroke-width="4"/>`;
                }).join('')}
                
                <!-- Labels -->
                <text x="${centerX}" y="${centerY - radius - 15}" text-anchor="middle" fill="#374151" font-size="16" font-weight="bold">E</text>
                <text x="${centerX + radius + 25}" y="${centerY}" text-anchor="middle" fill="#374151" font-size="16" font-weight="bold">S</text>
                <text x="${centerX}" y="${centerY + radius + 20}" text-anchor="middle" fill="#374151" font-size="16" font-weight="bold">G</text>
                <text x="${centerX - radius - 30}" y="${centerY}" text-anchor="middle" fill="#374151" font-size="16" font-weight="bold">${currentLanguage === 'pl' ? 'Dostawcy' : 'Supply'}</text>
            </svg>
        `;
    }

    // Unified benchmark source - Task #1 from Korekta.pdf
    // Use industryMSAvg as single source of truth for industry comparison
    // This ensures consistency across page 1, comparison page, and comments
    const benchmarkAverage = industryMSAvg; // Industry average (mean, not median)
    const benchmarkTop25 = Math.min(100, industryMSAvg + 15); // Top 25% as average + 15 points
    const benchmarkSampleSize = 150; // Sample size for benchmark calculation (placeholder)

    // Industry-specific reporting texts (restored from original implementation)
    const industryReportingTexts = {
        'construction': {
            pl: '75% firm budowlanych raportuje ESG',
            en: '75% of construction companies report ESG'
        },
        'energy_resources': {
            pl: '82% firm energetycznych raportuje ESG',
            en: '82% of energy companies report ESG'
        },
        'finance_fintech': {
            pl: '88% firm finansowych raportuje ESG',
            en: '88% of financial companies report ESG'
        },
        'retail_trade': {
            pl: '70% firm detalicznych raportuje ESG',
            en: '70% of retail companies report ESG'
        },
        'it_software': {
            pl: '84% firm technologicznych raportuje ESG',
            en: '84% of technology companies report ESG'
        },
        'logistics_transport': {
            pl: '67% firm transportowych raportuje ESG',
            en: '67% of transport companies report ESG'
        },
        'industrial_production': {
            pl: '80% firm produkcyjnych raportuje ESG',
            en: '80% of manufacturing companies report ESG'
        },
        'services_other': {
            pl: '72% firm usługowych raportuje ESG',
            en: '72% of service companies report ESG'
        }
    };
    const benchmarkReportingText = industryReportingTexts[industryCode]?.[currentLanguage] ||
        (currentLanguage === 'pl' ? 'Średnia globalna wszystkich branż' : 'Global average across all industries');

    // Create benchmark object for backward compatibility
    const benchmark = {
        average: benchmarkAverage,
        top25: benchmarkTop25,
        sampleSize: benchmarkSampleSize,
        reporting: benchmarkReportingText
    };

    // Create HTML template with full-page cover and proper page breaks
    const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>ESGSyncPRO Report</title>
</head>
<body style="margin: 0; padding: 0;">
        <div style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; width: 794px; background: #ffffff;">
            <!-- Cover Page - Full A4 -->
            <div style="width: 794px; height: 1131px; padding: 40px 40px 30px 40px; box-sizing: border-box; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); position: relative; overflow: hidden;">
                <!-- Background pattern -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23A3CC4B" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg></div>
                
                <!-- Logo and branding -->
                <div style="text-align: center; margin-bottom: 30px; position: relative; z-index: 2;">
                    <div style="margin-bottom: 10px; display: flex; justify-content: center;">
                        <img src="${logo}" alt="ESGSyncPRO" style="margin-bottom: 0; width: 120px; right: 0px; left: 0px;">
                    </div>
                    <div style="font-size: 38px; font-weight: bold; color: #A3CC4B; margin-bottom: 5px; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">ESGSyncPRO</div>
                    <div style="font-size: 18px; color: #64748b; font-weight: 500; line-height: 1.3;">${REPORT_TITLE[currentLanguage]}</div>
                </div>
                
                <!-- ESG Assessment Results -->
                <div style="position: relative; z-index: 2; margin-top: 40px;">
                    <!-- Overall Score -->
                    <div style="background: linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%); border: 4px solid ${overallEsgColorAndRisk.color}; border-radius: 25px; padding: 40px 30px 30px 30px; margin: 20px 0; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div style="font-size: 56px; font-weight: bold; color: ${overallEsgColorAndRisk.color}; margin-bottom: 20px; line-height: 1.1;">${scores.percent}%</div>
                        <div style="font-size: 24px; color: #374151; margin-bottom: 12px; line-height: 1.2;">${overallLabel}</div>
                        <div style="font-size: 20px; color: #6b7280; font-weight: 500; line-height: 1.3;">${interpretLabel}: ${interp}</div>
                                                
                        <!-- Industry Comparison -->
                        <div style="margin-top: 15px; padding: 12px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                            <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 0;">
                                <div style="display: table-row;">
                                    <!-- Current Result -->
                                    <div style="display: table-cell; padding-right: 15px; vertical-align: top; width: 50%;">
                                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 600;">
                                            ${currentLanguage === 'pl' ? 'Obecny wynik' : 'Current result'}
                                        </div>
                                        <div style="font-size: 26px; font-weight: bold; color: ${overallEsgColorAndRisk.color}; margin-bottom: 4px;">
                                            ${scores.percent}%
                                        </div>
                                        <div style="font-size: 14px; color: #374151; margin-bottom: 2px;">${interp}</div>
                                        <div style="font-size: 13px; color: #6b7280;">${overallEsgColorAndRisk.riskLabel[currentLanguage] === 'krytyczny'
                                            ? (currentLanguage === 'pl' ? 'Wysokie ryzyko' : 'High risk')
                                            : overallEsgColorAndRisk.riskLabel[currentLanguage] === 'podwyższony'
                                            ? (currentLanguage === 'pl' ? 'Podwyższone ryzyko' : 'Elevated risk')
                                            : overallEsgColorAndRisk.riskLabel[currentLanguage] === 'umiarkowany'
                                            ? (currentLanguage === 'pl' ? 'Umiarkowane ryzyko' : 'Moderate risk')
                                            : (currentLanguage === 'pl' ? 'Niskie ryzyko' : 'Low risk')}</div>
                                    </div>
                                    
                                    <!-- Divider -->
                                    <div style="display: table-cell; width: 2px; padding: 0 15px; vertical-align: top;">
                                        <div style="width: 1px; height: 100%; background: #d1d5db; margin: 0 auto;"></div>
                                    </div>
                                    
                                    <!-- Niche Result -->
                                    <div style="display: table-cell; padding-left: 15px; vertical-align: top; width: 50%;">
                                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 600;">
                                            ${currentLanguage === 'pl' ? 'Wynik w branży' : 'Result by niche'}
                                        </div>
                                        <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">
                                            ${currentLanguage === 'pl' ? 'Średnia w branży:' : 'Niche average:'} <span style="font-size: 20px; font-weight: bold; color: ${industryColorAndRisk.color}; opacity: 0.7;">${industryMSAvg}%</span>
                                        </div>
                                        <div style="font-size: 14px; color: #374151; margin-bottom: 2px;">${comparisonText}</div>
                                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                                            ${currentLanguage === 'pl' ? 'Rekomendacje: Porównaj swój wynik ze średnią branżową, aby lepiej zrozumieć swoją pozycję.' : 'Recommendations: Compare your result with the industry average to better understand your position.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Score Explanation -->
                        <div style="margin-top: 12px; padding: 10px 12px; background: rgba(255, 255, 255, 0.7); border-radius: 12px; border-left: 4px solid ${overallEsgColorAndRisk.color}; text-align: left;">
                            <div style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 6px; line-height: 1.2;">
                                ${currentLanguage === 'pl' ? 'Co oznacza Twój wynik?' : 'What does your score mean?'}
                            </div>
                            <div style="font-size: 13px; color: #475569; line-height: 1.4;">
                                ${getEsgScoreExplanation(scores.percent, currentLanguage, scores.relevance)}
                            </div>
                        </div>
                        ${(() => {
                            // Risks section - inherits state from exec_summary (per Page 1 spec)
                            const riskNarrative = getRiskNarrative(scores.percent, currentLanguage, scores.relevance);
                            return `
                                <div style="margin-top: 12px; padding: 10px 12px; background: rgba(255, 255, 255, 0.7); border-radius: 12px; border-left: 4px solid ${overallEsgColorAndRisk.color}; text-align: left;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 6px; line-height: 1.2;">
                                        ${riskNarrative.emoji} ${riskNarrative.label}
                                    </div>
                                    <div style="font-size: 13px; color: #475569; line-height: 1.4;">
                                        ${riskNarrative.text}
                                    </div>
                                </div>
                            `;
                        })()}
                        ${(() => {
                            // Task #6 from Korekta.pdf: Linking sentence between overall and pillar states
                            if (!scores.relevance || !scores.relevance.top3Areas || scores.relevance.top3Areas.length === 0) {
                                return '';
                            }
                            const linkingSentence = generateLinkingSentence(
                                overallEsgColorAndRisk.stateCode,
                                pillarStates,
                                scores.relevance.top3Areas,
                                currentLanguage
                            );
                            if (!linkingSentence) return '';
                            return `
                                <div style="margin-top: 12px; padding: 10px 12px; background: linear-gradient(135deg, rgba(163, 204, 75, 0.08) 0%, rgba(163, 204, 75, 0.04) 100%); border-radius: 12px; border-left: 4px solid #A3CC4B; text-align: left;">
                                    <div style="font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 6px; line-height: 1.2;">
                                        🎯 ${currentLanguage === 'pl' ? 'Priorytety działania' : 'Action Priorities'}
                                    </div>
                                    <div style="font-size: 13px; color: #475569; line-height: 1.4; font-style: italic;">
                                        ${linkingSentence}
                                    </div>
                                </div>
                            `;
                        })()}
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 12px 20px;">
                    <div style="font-size: 13px; font-weight: 500; line-height: 1.3;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>
                
                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>

            ${(() => {
                // TOP 3 Risks Pages - shows 3 areas with highest ERRS
                // Per TOP 3 spec: displays area name, horizon, and 3 risk types
                // All areas inherit same color/emoji from ES
                // Split across 2 pages: first 2 areas on page 2, third area on page 3
                if (scores.relevance && scores.relevance.top3Areas && scores.relevance.top3Areas.length > 0) {
                    const top3Areas = scores.relevance.top3Areas;
                    const isPolish = currentLanguage === 'pl';

                    // Helper function to format questions in text as a list within the paragraph
                    const formatQuestionsAsList = (text) => {
                        if (!text) return '';

                        // Find questions in Polish quotes „..." or regular quotes "..."
                        const questionPattern = /[„""]([^"„"]+\?)["""]/g;
                        const questions = [];
                        let match;

                        while ((match = questionPattern.exec(text)) !== null) {
                            questions.push(match[1].trim());
                        }

                        // If we found multiple questions, format them as a list
                        if (questions.length > 1) {
                            // Find where questions start (look for "typu:" or similar intro)
                            const introPatterns = [
                                /(.+?typu:\s*)[„""]/i,
                                /(.+?pytania:\s*)[„""]/i,
                                /(.+?np\.:\s*)[„""]/i
                            ];

                            let textBefore = '';
                            let textAfter = '';

                            for (const pattern of introPatterns) {
                                const introMatch = text.match(pattern);
                                if (introMatch) {
                                    textBefore = introMatch[1];
                                    break;
                                }
                            }

                            // If no intro pattern found, find text before first quote
                            if (!textBefore) {
                                const firstQuoteIdx = text.search(/[„""]/);
                                if (firstQuoteIdx > 0) {
                                    textBefore = text.substring(0, firstQuoteIdx).trim() + ' ';
                                }
                            }

                            // Find text after the last question
                            const lastQuestionEnd = text.lastIndexOf('?');
                            if (lastQuestionEnd !== -1) {
                                // Find the closing quote after the last ?
                                const afterLastQuestion = text.substring(lastQuestionEnd + 1);
                                const closingQuoteMatch = afterLastQuestion.match(/^["""]\s*(.*)/);
                                if (closingQuoteMatch && closingQuoteMatch[1]) {
                                    textAfter = closingQuoteMatch[1].trim();
                                }
                            }

                            // Build the formatted text with questions as plain list (no bullets/numbers)
                            const questionsList = '<div style="margin: 6px 0; padding-left: 0;">' +
                                questions.map(q => '<div style="margin-bottom: 3px;">„' + q + '"</div>').join('') +
                                '</div>';

                            return textBefore + questionsList + (textAfter ? ' ' + textAfter : '');
                        }

                        return text;
                    };

                    // Helper function to generate HTML for specific areas
                    const generateAreasHTML = (areas, esColor, esEmoji) => {
                        const areaNames = {
                            E: isPolish ? 'Środowisko (E)' : 'Environment (E)',
                            S: isPolish ? 'Społeczeństwo (S)' : 'Social (S)',
                            G: isPolish ? 'Zarządzanie (G)' : 'Governance (G)',
                            SC: isPolish ? 'Łańcuch dostaw (SC)' : 'Supply Chain (SC)'
                        };
                        const timelineLabels = {
                            30: isPolish ? '30 dni' : '30 days'
                        };
                        const riskTypeLabels = {
                            business: isPolish ? 'Ryzyko biznesowe' : 'Business Risk',
                            reputation: isPolish ? 'Ryzyko reputacyjne' : 'Reputation Risk',
                            operational: isPolish ? 'Ryzyko operacyjne' : 'Operational Risk'
                        };
                        // Use corrected state from overallEsgColorAndRisk (worst of TOP3 and percent)
                        const esState = overallEsgColorAndRisk.stateCode || 'green';

                        return areas.map((areaData, idx) => {
                            const areaName = areaNames[areaData.area] || areaData.area;
                            const timeline = timelineLabels[areaData.timeline] || (areaData.timeline + ' dni');

                            // Task #4 from Korekta.pdf: Get risk comments for THIS specific pillar
                            let riskComments = { business: '', reputation: '', operational: '' };
                            if (typeof ESGScoring !== 'undefined' && ESGScoring.getTop3RiskComments) {
                                riskComments = ESGScoring.getTop3RiskComments(areaData.area, esState, currentLanguage, industryCode);
                            }

                            // Get industry risk intro for this pillar
                            const industryIntro = getIndustryRiskIntroText(areaData.area, currentLanguage);

                            return '<div style="margin-top: ' + (idx === 0 ? '0' : '10px') + '; padding: 10px; background: rgba(255, 255, 255, 0.7); border-radius: 10px; border-left: 3px solid ' + esColor + ';">' +
                                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
                                    '<div style="font-size: 15px; color: #1e293b; font-weight: 700;">' +
                                        esEmoji + ' ' + areaName +
                                    '</div>' +
                                    '<div style="font-size: 12px; color: #64748b; font-weight: 600; padding: 3px 10px; background: rgba(100, 116, 139, 0.1); border-radius: 6px;">' +
                                        timeline +
                                    '</div>' +
                                '</div>' +
                                (industryIntro ? '<div style="margin: 8px 0; padding: 8px 10px; background: rgba(163, 204, 75, 0.08); border-radius: 8px; font-size: 11px; color: #475569; line-height: 1.4; font-style: italic;">' + industryIntro + '</div>' : '') +
                                '<div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">' +
                                    '<div style="padding: 8px 10px; background: rgba(163, 204, 75, 0.05); border-radius: 6px; border-left: 3px solid rgba(163, 204, 75, 0.6);">' +
                                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">' +
                                            '📊 ' + riskTypeLabels.business +
                                        '</div>' +
                                        '<div style="font-size: 11px; color: #475569; line-height: 1.8;">' +
                                            formatQuestionsAsList(riskComments.business || (isPolish ? 'Brak opisu ryzyka biznesowego.' : 'No business risk description.')) +
                                        '</div>' +
                                    '</div>' +
                                    '<div style="padding: 8px 10px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border-left: 3px solid rgba(59, 130, 246, 0.6);">' +
                                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">' +
                                            '👥 ' + riskTypeLabels.reputation +
                                        '</div>' +
                                        '<div style="font-size: 11px; color: #475569; line-height: 1.8;">' +
                                            formatQuestionsAsList(riskComments.reputation || (isPolish ? 'Brak opisu ryzyka reputacyjnego.' : 'No reputation risk description.')) +
                                        '</div>' +
                                    '</div>' +
                                    '<div style="padding: 8px 10px; background: rgba(251, 146, 60, 0.05); border-radius: 6px; border-left: 3px solid rgba(251, 146, 60, 0.6);">' +
                                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">' +
                                            '⚙️ ' + riskTypeLabels.operational +
                                        '</div>' +
                                        '<div style="font-size: 11px; color: #475569; line-height: 1.8;">' +
                                            formatQuestionsAsList(riskComments.operational || (isPolish ? 'Brak opisu ryzyka operacyjnego.' : 'No operational risk description.')) +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                        }).join('');
                    };

                    // Each area on separate page
                    let result = '';

                    top3Areas.forEach((area, index) => {
                        const areaHTML = generateAreasHTML([area], overallEsgColorAndRisk.color, overallEsgColorAndRisk.emoji);
                        const pageTitle = index === 0
                            ? (isPolish ? 'TOP 3 Ryzyka' : 'TOP 3 Risks')
                            : (isPolish ? 'TOP 3 Ryzyka (cd.)' : 'TOP 3 Risks (cont.)');

                        result += `
                        <!-- TOP 3 Risks Page ${index + 1} - Area ${index + 1} -->
                        <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); margin: 20px 0; position: relative; z-index: 2; border: 2px solid ${overallEsgColorAndRisk.color};">
                                <h1 style="color: ${overallEsgColorAndRisk.color}; margin: 0 0 30px 0; font-size: 32px; text-align: center;">
                                    ${overallEsgColorAndRisk.emoji} ${pageTitle}
                                </h1>
                                ${areaHTML}
                            </div>
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                                <div style="font-size: 14px; font-weight: 500;">${isPolish ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                            </div>
                        </div>
                        <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
                        `;
                    });

                    return result;
                }
                return '';  // No TOP 3 data available
            })()}

            <!-- ESG Quick Assessment Page (Page 4) -->
            <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <!-- Main content box -->
                <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); margin: 20px 0; position: relative; z-index: 2; border: 2px solid #A3CC4B;">
                    <h1 style="color: #1e293b; margin: 0 0 30px 0; font-size: 32px; text-align: center; color: #A3CC4B;">${t('survey.title', currentLanguage==='pl' ? 'Szybka ocena ESG' : 'ESG Quick Assessment Report')}</h1>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; text-align: left; margin: 30px 0;">
                        <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 8px; font-size: 16px;">🌿 ${currentLanguage === 'pl' ? 'Branża' : 'Industry'}</div>
                            <div style="color: #1e293b; font-size: 18px;">${clientDetails.industry || 'N/A'}</div>
                        </div>
                        <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 8px; font-size: 16px;">👥 ${currentLanguage === 'pl' ? 'Pracownicy' : 'Employees'}</div>
                            <div style="color: #1e293b; font-size: 18px;">${clientDetails.employees || 'N/A'}</div>
                        </div>
                        <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 8px; font-size: 16px;">🏛️ ${currentLanguage === 'pl' ? 'Kraj' : 'Country'}</div>
                            <div style="color: #1e293b; font-size: 18px;">${
                                clientDetails.countryTranslated
                                    ? (currentLanguage === 'pl' ? clientDetails.countryTranslated.pl : clientDetails.countryTranslated.en)
                                    : (clientDetails.country || 'N/A')
                            }</div>
                        </div>
                        <div style="padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 8px; font-size: 16px;">📦 ${currentLanguage === 'pl' ? 'Przychód' : 'Revenue'}</div>
                            <div style="color: #1e293b; font-size: 18px;">${clientDetails.revenue || 'N/A'}</div>
                        </div>
                    </div>

                    <div style="margin-top: 25px; padding: 15px; background: #f8fafc; border-radius: 10px; border-left: 4px solid #A3CC4B;">
                        <div style="font-weight: bold; color: #475569; margin-bottom: 8px; font-size: 16px;">🔖 ${currentLanguage === 'pl' ? 'ID Raportu' : 'Report ID'}</div>
                        <div style="color: #1e293b; font-size: 18px; font-family: monospace; letter-spacing: 1px;">${(() => {
                            const rawId = clientDetails.reportId || clientDetails.id || clientDetails._id || 'N/A';
                            if (rawId === 'N/A') return rawId;
                            const year = reportGeneratedAt.getFullYear();
                            const month = String(reportGeneratedAt.getMonth() + 1).padStart(2, '0');
                            const day = String(reportGeneratedAt.getDate()).padStart(2, '0');
                            const hash = String(rawId).slice(-6).toUpperCase().padStart(6, '0');
                            return `ESG-${year}-${month}-${day}-${hash}`;
                        })()}</div>
                    </div>

                    <!-- Financial Impact Section -->
                    ${generateFinancialImpactSection(clientDetails.revenue, mapLevelToState(esgLevel), currentLanguage)}
                </div>

                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${reportGeneratedAt.toLocaleDateString(currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</div>
                </div>
            </div>

            <!-- Page Break -->
            <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>

            <!-- Detailed Scores Page (Page 5) -->
            <div style="width: 794px; padding: 40px 40px 180px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #A3CC4B; margin: 0 0 20px 0; font-size: 32px; text-align: center;">📋 ${currentLanguage === 'pl' ? 'Szczegółowe wyniki ESG' : 'Detailed ESG Scores'}</h1>

                <!-- Detailed Scores Grid -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin: 15px 0 12px 0;">
                    <!-- Row 1: E + S combined card -->
                    <div style="background: linear-gradient(135deg, #fef7ee 0%, #f0f9ff 100%); padding: 12px; border-radius: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.06);">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                            <!-- E block -->
                            <div style="border-left: 4px solid ${radarChartData.e.color}; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; margin-bottom: 6px; font-size: 15px;">🌿 ${t('survey.result.cat.e', 'E')} - ${currentLanguage === 'pl' ? 'Środowisko' : 'Environment'}</div>
                                <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Wynik testu' : 'Test Result'}</div>
                                <div style="font-size: 20px; color: ${radarChartData.e.color}; font-weight: bold;">${Math.round((scores.e / 30) * 100)}%</div>
                                <div style="margin-top: 6px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: ${radarChartData.e.color}; height: 100%; width: ${Math.min((scores.e / 30) * 100, 100)}%; transition: width 0.3s ease;"></div>
                                </div>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Profil branżowy' : 'Industry Profile'}</div>
                                    <div style="margin-top: 4px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div id="importance-bar-e" style="background: ${importanceColors.e}; height: 100%; width: ${Math.min(importanceValues.e, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: ${importanceColors.e};">
                                        ${getMSLabel(importanceValues.e, currentLanguage)}
                                    </div>
                                    <div style="margin-top: 4px; font-size: 10px; color: #475569; line-height: 1.3;">
                                        ${getIndustryProfileText('E', currentLanguage)}
                                    </div>
                                </div>
                            </div>

                            <!-- S block -->
                            <div style="border-left: 4px solid ${radarChartData.s.color}; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; margin-bottom: 6px; font-size: 15px;">👥 ${t('survey.result.cat.s', 'S')} - ${currentLanguage === 'pl' ? 'Społeczne' : 'Social'}</div>
                                <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Wynik testu' : 'Test Result'}</div>
                                <div style="font-size: 20px; color: ${radarChartData.s.color}; font-weight: bold;">${Math.round((scores.s / 25) * 100)}%</div>
                                <div style="margin-top: 6px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: ${radarChartData.s.color}; height: 100%; width: ${(scores.s / 25) * 100}%; transition: width 0.3s ease;"></div>
                                </div>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Profil branżowy' : 'Industry Profile'}</div>
                                    <div style="margin-top: 4px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div id="importance-bar-s" style="background: ${importanceColors.s}; height: 100%; width: ${Math.min(importanceValues.s, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: ${importanceColors.s};">
                                        ${getMSLabel(importanceValues.s, currentLanguage)}
                                    </div>
                                    <div style="margin-top: 4px; font-size: 10px; color: #475569; line-height: 1.3;">
                                        ${getIndustryProfileText('S', currentLanguage)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Row 2: G + SC combined card -->
                    <div style="background: linear-gradient(135deg, #fef2f2 0%, #f0fdf4 100%); padding: 12px; border-radius: 14px; box-shadow: 0 3px 10px rgba(0,0,0,0.06);">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                            <!-- G block -->
                            <div style="border-left: 4px solid ${radarChartData.g.color}; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; margin-bottom: 6px; font-size: 15px;">🏛️ ${t('survey.result.cat.g', 'G')} - ${currentLanguage === 'pl' ? 'Ład korporacyjny' : 'Governance'}</div>
                                <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Wynik testu' : 'Test Result'}</div>
                                <div style="font-size: 20px; color: ${radarChartData.g.color}; font-weight: bold;">${Math.round((scores.g / 20) * 100)}%</div>
                                <div style="margin-top: 6px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: ${radarChartData.g.color}; height: 100%; width: ${(scores.g / 20) * 100}%; transition: width 0.3s ease;"></div>
                                </div>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Profil branżowy' : 'Industry Profile'}</div>
                                    <div style="margin-top: 4px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div id="importance-bar-g" style="background: ${importanceColors.g}; height: 100%; width: ${Math.min(importanceValues.g, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: ${importanceColors.g};">
                                        ${getMSLabel(importanceValues.g, currentLanguage)}
                                    </div>
                                    <div style="margin-top: 4px; font-size: 10px; color: #475569; line-height: 1.3;">
                                        ${getIndustryProfileText('G', currentLanguage)}
                                    </div>
                                </div>
                            </div>

                            <!-- SC block -->
                            <div style="border-left: 4px solid ${radarChartData.sup.color}; padding-left: 10px;">
                                <div style="font-weight: bold; color: #1e293b; margin-bottom: 6px; font-size: 15px;">📦 ${supplyLabel}</div>
                                <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Wynik testu' : 'Test Result'}</div>
                                <div style="font-size: 20px; color: ${radarChartData.sup.color}; font-weight: bold;">${Math.round((scores.sup / 15) * 100)}%</div>
                                <div style="margin-top: 6px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="background: ${radarChartData.sup.color}; height: 100%; width: ${(scores.sup / 15) * 100}%; transition: width 0.3s ease;"></div>
                                </div>
                                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                                    <div style="font-size: 13px; color: #1e293b; margin-bottom: 3px; font-weight: 500;">${currentLanguage === 'pl' ? 'Profil branżowy' : 'Industry Profile'}</div>
                                    <div style="margin-top: 4px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                                        <div id="importance-bar-sup" style="background: ${importanceColors.sup}; height: 100%; width: ${Math.min(importanceValues.sup, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: ${importanceColors.sup};">
                                        ${getMSLabel(importanceValues.sup, currentLanguage)}
                                    </div>
                                    <div style="margin-top: 4px; font-size: 10px; color: #475569; line-height: 1.3;">
                                        ${getIndustryProfileText('SC', currentLanguage)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    <!-- Radar Chart -->
                    <div style="background: white; padding: 12px; border-radius: 16px; box-shadow: 0 6px 15px rgba(0,0,0,0.08); margin: 8px auto 0 auto; text-align: center; max-width: 400px; box-sizing: border-box;">
                        ${createRadarChart(scores)}
                    </div>

                    <!-- Footer -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                        <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                    </div>

                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>

            <!-- Readiness Indices Page (only shown if EXTENDED questions were answered) -->
            ${(() => {
                if (!scores.relevance || !scores.relevance.readinessIndices) return '';

                const ri = scores.relevance.readinessIndices;

                // Check if EXTENDED questions were actually answered (at least one index > 0)
                // Note: credibility check removed - Comment 6 is DEPRECATED
                const hasExtendedData = (ri.marketReadiness.index > 0) ||
                                        (ri.orgReadiness.index > 0);
                if (!hasExtendedData) return '';

                // Helper function to get color based on readiness state
                const getReadinessColor = (state) => {
                    if (state === 'HIGH') return '#22c55e';
                    if (state === 'PARTIAL') return '#eab308';
                    return '#ef4444';
                };

                // Helper function to get emoji
                const getReadinessEmoji = (state) => {
                    if (state === 'HIGH') return '🟢';
                    if (state === 'PARTIAL') return '🟡';
                    return '🔴';
                };

                // Helper to map old state to new state for comments
                const mapStateToCommentState = (state) => {
                    if (state === 'HIGH') return 'green';
                    if (state === 'PARTIAL') return 'yellow';
                    return 'red';
                };

                // Helper to get full comment text from ESGScoring module
                const getFullCommentText = (commentType, state, lang) => {
                    if (typeof ESGScoring !== 'undefined' && ESGScoring.getCommentText) {
                        const commentState = mapStateToCommentState(state);
                        return ESGScoring.getCommentText(commentType, commentState, lang);
                    }
                    return null;
                };

                // Market Readiness
                const market = ri.marketReadiness;
                const marketColor = getReadinessColor(market.state);
                const marketEmoji = getReadinessEmoji(market.state);
                const marketLabel = currentLanguage === 'pl'
                    ? (market.state === 'HIGH' ? 'Dobra' : market.state === 'PARTIAL' ? 'Umiarkowana' : 'Wymagająca wzmocnienia')
                    : (market.state === 'HIGH' ? 'Good' : market.state === 'PARTIAL' ? 'Moderate' : 'Needs strengthening');
                const marketDescription = getFullCommentText('MARKET_READINESS', market.state, currentLanguage) || (currentLanguage === 'pl'
                    ? (market.state === 'HIGH' ? 'Twoja firma spełnia obecne oczekiwania rynku. Rozmowy z klientami i partnerami mają solidne oparcie w faktach.' : market.state === 'PARTIAL' ? 'Część oczekiwań rynku jest spełniona, inne wymagają doprecyzowania. Rozmowy są możliwe, ale czasem wymagają dodatkowych wyjaśnień.' : 'Rynek stawia wymagania, których dziś nie zawsze możesz jasno spełnić. To utrudnia rozmowy i wydłuża procesy decyzyjne.')
                    : (market.state === 'HIGH' ? 'Your company meets current market expectations. Conversations with clients and partners have solid factual support.' : market.state === 'PARTIAL' ? 'Some market expectations are met, others require clarification. Conversations are possible but sometimes require additional explanations.' : 'The market sets requirements that you cannot always clearly meet today. This hinders conversations and lengthens decision-making processes.'));

                // Org Readiness
                const org = ri.orgReadiness;
                const orgColor = getReadinessColor(org.state);
                const orgEmoji = getReadinessEmoji(org.state);
                const orgLabel = currentLanguage === 'pl'
                    ? (org.state === 'HIGH' ? 'Dobrze poukładane' : org.state === 'PARTIAL' ? 'Częściowo poukładane' : 'Wymaga uporządkowania')
                    : (org.state === 'HIGH' ? 'Well organized' : org.state === 'PARTIAL' ? 'Partially organized' : 'Needs organizing');
                const orgDescription = getFullCommentText('ORG_READINESS', org.state, currentLanguage) || (currentLanguage === 'pl'
                    ? (org.state === 'HIGH' ? 'W Twojej firmie widać jasny podział odpowiedzialności i logiczny sposób działania. Wiadomo, kto za co odpowiada i jak podejmowane są decyzje.' : org.state === 'PARTIAL' ? 'Część procesów działa sprawnie, inne opierają się bardziej na doświadczeniu ludzi niż na ustalonych zasadach.' : 'Sposób działania firmy nie zawsze jest czytelny nawet wewnątrz zespołu. To zwiększa obciążenie operacyjne.')
                    : (org.state === 'HIGH' ? 'Your company shows a clear division of responsibilities and logical way of operating. It is clear who is responsible for what.' : org.state === 'PARTIAL' ? 'Some processes work efficiently, others rely more on people\'s experience than on established rules.' : 'The company\'s way of operating is not always clear even within the team. This increases operational burden.'));

                // Comment 6 (Credibility) - DEPRECATED: Document verification module removed
                // Not rendered per developer spec

                // Data quality (comment 2A from methodology)
                const dataState = market.state; // Data uses same questions as market (X6, X10, X11)
                const dataColor = getReadinessColor(dataState);
                const dataEmoji = getReadinessEmoji(dataState);
                const dataLabel = currentLanguage === 'pl'
                    ? (dataState === 'HIGH' ? 'Kompletne' : dataState === 'PARTIAL' ? 'Częściowe' : 'Wstępne')
                    : (dataState === 'HIGH' ? 'Complete' : dataState === 'PARTIAL' ? 'Partial' : 'Preliminary');
                const dataDescription = getFullCommentText('DATA', dataState, currentLanguage) || (currentLanguage === 'pl'
                    ? (dataState === 'HIGH' ? 'Dane są spójne i wystarczające do wyciągania wiarygodnych wniosków. Można na nich bezpiecznie opierać decyzje.' : dataState === 'PARTIAL' ? 'Dane dają ogólny obraz, ale nie zawsze pozwalają na pełną pewność. Wnioski są kierunkowe.' : 'Dane pokazują jedynie zarys sytuacji. Wnioski wymagają ostrożności i dalszego uzupełniania.')
                    : (dataState === 'HIGH' ? 'Data is consistent and sufficient for drawing reliable conclusions. Decisions can be safely based on it.' : dataState === 'PARTIAL' ? 'Data provides a general picture but does not always allow for full certainty.' : 'Data shows only an outline of the situation. Conclusions require caution.'));

                const pageTitle = currentLanguage === 'pl' ? 'Indeksy gotowości' : 'Readiness Indices';
                const pageSubtitle = currentLanguage === 'pl'
                    ? 'Ocena gotowości firmy na podstawie pytań rozszerzonych (EXTENDED). Skala: 0-1, progi: 0.75 (wysoki) / 0.40 (niski).'
                    : 'Company readiness assessment based on extended questions (EXTENDED). Scale: 0-1, thresholds: 0.75 (high) / 0.40 (low).';
                const marketTitle = currentLanguage === 'pl' ? 'Gotowość rynkowa (bank / klient)' : 'Market Readiness (bank / client)';
                const marketSource = currentLanguage === 'pl' ? 'Źródło: X6, X10, X11' : 'Source: X6, X10, X11';
                const orgTitle = currentLanguage === 'pl' ? 'Gotowość organizacyjna' : 'Organizational Readiness';
                const orgSource = currentLanguage === 'pl' ? 'Źródło: X1, X3, X7' : 'Source: X1, X3, X7';
                const dataTitle = currentLanguage === 'pl' ? 'Dane' : 'Data';
                const dataSource = currentLanguage === 'pl' ? 'Źródło: X6, X10, X11' : 'Source: X6, X10, X11';
                const thresholdsTitle = currentLanguage === 'pl' ? 'Progi stanów' : 'State Thresholds';
                const highLabel = currentLanguage === 'pl' ? 'Wysoki' : 'High';
                const partialLabel = currentLanguage === 'pl' ? 'Częściowy' : 'Partial';
                const lowLabel = currentLanguage === 'pl' ? 'Niski' : 'Low';
                const footerText = currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO';

                return '<div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">' +
                    '<h1 style="color: #A3CC4B; margin: 0 0 40px 0; font-size: 36px; text-align: center;">📊 ' + pageTitle + '</h1>' +
                    '<p style="color: #64748b; text-align: center; font-size: 16px; margin-bottom: 40px;">' + pageSubtitle + '</p>' +

                    '<!-- Market Readiness -->' +
                    '<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px 25px; border-radius: 16px; border-left: 5px solid ' + marketColor + '; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 15px;">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                            '<div style="font-weight: bold; color: #1e293b; font-size: 18px;">🏦 ' + marketTitle + '</div>' +
                            '<div style="font-size: 12px; color: #64748b;">' + marketSource + '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">' +
                            '<div style="font-size: 36px; font-weight: bold; color: ' + marketColor + ';">' + market.index.toFixed(2) + '</div>' +
                            '<div style="flex: 1;">' +
                                '<div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">' +
                                    '<div style="background: ' + marketColor + '; height: 100%; width: ' + Math.min(market.index * 100, 100) + '%;"></div>' +
                                '</div>' +
                                '<div style="font-size: 16px; font-weight: 600; color: ' + marketColor + ';">' + marketEmoji + ' ' + marketLabel + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="font-size: 12px; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 10px;">' + marketDescription + '</div>' +
                    '</div>' +

                    '<!-- Organizational Readiness -->' +
                    '<div style="background: linear-gradient(135deg, #fef7ee 0%, #fef3c7 100%); padding: 20px 25px; border-radius: 16px; border-left: 5px solid ' + orgColor + '; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 15px;">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                            '<div style="font-weight: bold; color: #1e293b; font-size: 18px;">🏢 ' + orgTitle + '</div>' +
                            '<div style="font-size: 12px; color: #64748b;">' + orgSource + '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">' +
                            '<div style="font-size: 36px; font-weight: bold; color: ' + orgColor + ';">' + org.index.toFixed(2) + '</div>' +
                            '<div style="flex: 1;">' +
                                '<div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">' +
                                    '<div style="background: ' + orgColor + '; height: 100%; width: ' + Math.min(org.index * 100, 100) + '%;"></div>' +
                                '</div>' +
                                '<div style="font-size: 16px; font-weight: 600; color: ' + orgColor + ';">' + orgEmoji + ' ' + orgLabel + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="font-size: 12px; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 10px;">' + orgDescription + '</div>' +
                    '</div>' +

                    '<!-- Data -->' +
                    '<div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); padding: 20px 25px; border-radius: 16px; border-left: 5px solid ' + dataColor + '; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 15px;">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">' +
                            '<div style="font-weight: bold; color: #1e293b; font-size: 18px;">📊 ' + dataTitle + '</div>' +
                            '<div style="font-size: 12px; color: #64748b;">' + dataSource + '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">' +
                            '<div style="font-size: 36px; font-weight: bold; color: ' + dataColor + ';">' + market.index.toFixed(2) + '</div>' +
                            '<div style="flex: 1;">' +
                                '<div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 6px;">' +
                                    '<div style="background: ' + dataColor + '; height: 100%; width: ' + Math.min(market.index * 100, 100) + '%;"></div>' +
                                '</div>' +
                                '<div style="font-size: 16px; font-weight: 600; color: ' + dataColor + ';">' + dataEmoji + ' ' + dataLabel + '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="font-size: 12px; color: #475569; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 10px;">' + dataDescription + '</div>' +
                    '</div>' +

                    '<!-- Footer -->' +
                    '<div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">' +
                        '<div style="font-size: 14px; font-weight: 500;">' + footerText + ' | v' + ESG_ENGINE_VERSION + ' | esgsync.pro</div>' +
                    '</div>' +

                    '<!-- Page Break -->' +
                    '<div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>' +
                '</div>';
            })()}

            <!-- ESG Pillar Insights & Recommendations - Environmental (E) Page -->
            <div style="width: 794px; padding: 50px 40px 75px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">
                    ${currentLanguage === 'pl' ? '📊 Wglądy i rekomendacje dotyczące filarów ESG' : 'ESG Pillar Insights & Recommendations'}
                </h1>

                ${(() => {
                    // Calculate performance level for Environmental
                    const eLevel = getPillarPerformanceLevel(scores.e, 30);
                    const eInsights = getPillarInsightsAndRecommendations('E', eLevel, currentLanguage);

                    // Get background color based on performance level
                    const getBackgroundColor = (level) => {
                        if (level === 'low') return '#fef2f2'; // Light red
                        if (level === 'medium') return '#fef7ee'; // Light orange
                        return '#f0fdf4'; // Light green
                    };

                    return `
                        <!-- Environmental (E) Section -->
                        <div style="background: ${getBackgroundColor(eLevel)}; padding: 12px 20px; border-radius: 15px; border-left: 5px solid ${radarChartData.e.color}; box-shadow: 0 3px 10px rgba(0,0,0,0.06); margin: 10px 0; page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; display: block;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 20px;">
                                🌿 ${currentLanguage === 'pl' ? 'Środowisko (E)' : 'Environmental (E)'}
                            </div>
                            <div style="margin-bottom: 8px;">
                                <div style="font-size: 16px; font-weight: 600; color: ${radarChartData.e.color}; margin-bottom: 6px;">
                                    ${eInsights.emoji} ${eInsights.performanceLabel}
                                </div>
                                <div style="color: #475569; line-height: 1.5; font-size: 14px; margin-bottom: 8px;">
                                    ${eInsights.description}
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${radarChartData.e.color}; page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Zalecany obszar działania:' : 'Recommended focus:'}
                                    </div>
                                    <div style="color: #475569; line-height: 1.4; font-size: 13px;">
                                        ${eInsights.recommendedFocus}
                                    </div>
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${importanceColors.e}; page-break-inside: avoid; break-inside: avoid;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Profil branżowy (waga sektora)' : 'Industry Profile (sector weight)'}
                                    </div>
                                    <div style="margin-top: 6px; background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                        <div style="background: ${importanceColors.e}; height: 100%; width: ${Math.min(importanceValues.e, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; color: #64748b; line-height: 1.4; font-style: italic;">
                                        ${currentLanguage === 'pl'
                                            ? 'Pokazujemy, jak istotny jest dany obszar zrównoważonego rozwoju w wybranej przez Ciebie branży, niezależnie od wyniku Twojej firmy.'
                                            : 'We show how important this area of sustainable development is in your chosen industry, regardless of your company\'s performance.'}
                                    </div>
                                    ${(() => {
                                        const istotnosc = getIstotnoscLabel(importanceValues.e, currentLanguage);
                                        return `
                                            <div style="margin-top: 8px; padding: 8px; background: ${istotnosc.color}15; border-radius: 6px; border: 1px solid ${istotnosc.color};">
                                                <div style="font-weight: 700; color: ${istotnosc.color}; font-size: 12px; margin-bottom: 4px;">
                                                    ${istotnosc.label}
                                                </div>
                                                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                                                    ${istotnosc.comment}
                                                </div>
                                            </div>
                                        `;
                                    })()}
                                </div>
                            </div>
                        </div>
                    `;
                })()}

                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>

                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>

            <!-- ESG Pillar Insights & Recommendations - Social (S) Page -->
            <div style="width: 794px; padding: 50px 40px 75px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">
                    ${currentLanguage === 'pl' ? '📊 Wglądy i rekomendacje dotyczące filarów ESG' : 'ESG Pillar Insights & Recommendations'}
                </h1>

                ${(() => {
                    // Calculate performance level for Social
                    const sLevel = getPillarPerformanceLevel(scores.s, 25);
                    const sInsights = getPillarInsightsAndRecommendations('S', sLevel, currentLanguage);

                    // Get background color based on performance level
                    const getBackgroundColor = (level) => {
                        if (level === 'low') return '#fef2f2'; // Light red
                        if (level === 'medium') return '#fef7ee'; // Light orange
                        return '#f0fdf4'; // Light green
                    };

                    return `
                        <!-- Social (S) Section -->
                        <div style="background: ${getBackgroundColor(sLevel)}; padding: 12px 20px; border-radius: 15px; border-left: 5px solid ${radarChartData.s.color}; box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin: 10px 0; page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; display: block;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 20px;">
                                👥 ${currentLanguage === 'pl' ? 'Społeczne (S)' : 'Social (S)'}
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 16px; font-weight: 600; color: ${radarChartData.s.color}; margin-bottom: 6px;">
                                    ${sInsights.emoji} ${sInsights.performanceLabel}
                                </div>
                                <div style="color: #475569; line-height: 1.7; font-size: 14px; margin-bottom: 8px;">
                                    ${sInsights.description}
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${radarChartData.s.color}; page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Zalecany obszar działania:' : 'Recommended focus:'}
                                    </div>
                                    <div style="color: #475569; line-height: 1.4; font-size: 13px;">
                                        ${sInsights.recommendedFocus}
                                    </div>
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${importanceColors.s}; page-break-inside: avoid; break-inside: avoid;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Profil branżowy (waga sektora)' : 'Industry Profile (sector weight)'}
                                    </div>
                                    <div style="margin-top: 6px; background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                        <div style="background: ${importanceColors.s}; height: 100%; width: ${Math.min(importanceValues.s, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; color: #64748b; line-height: 1.4; font-style: italic;">
                                        ${currentLanguage === 'pl'
                                            ? 'Pokazujemy, jak istotny jest dany obszar zrównoważonego rozwoju w wybranej przez Ciebie branży, niezależnie od wyniku Twojej firmy.'
                                            : 'We show how important this area of sustainable development is in your chosen industry, regardless of your company\'s performance.'}
                                    </div>
                                    ${(() => {
                                        const istotnosc = getIstotnoscLabel(importanceValues.s, currentLanguage);
                                        return `
                                            <div style="margin-top: 8px; padding: 8px; background: ${istotnosc.color}15; border-radius: 6px; border: 1px solid ${istotnosc.color};">
                                                <div style="font-weight: 700; color: ${istotnosc.color}; font-size: 12px; margin-bottom: 4px;">
                                                    ${istotnosc.label}
                                                </div>
                                                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                                                    ${istotnosc.comment}
                                                </div>
                                            </div>
                                        `;
                                    })()}
                                </div>
                            </div>
                        </div>
                    `;
                })()}
                
                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>
                
                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>
            
            <!-- ESG Pillar Insights & Recommendations - Governance (G) Page -->
            <div style="width: 794px; padding: 50px 40px 75px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">
                    ${currentLanguage === 'pl' ? '📊 Wglądy i rekomendacje dotyczące filarów ESG' : 'ESG Pillar Insights & Recommendations'}
                </h1>

                ${(() => {
                    // Calculate performance level for Governance
                    const gLevel = getPillarPerformanceLevel(scores.g, 20);
                    const gInsights = getPillarInsightsAndRecommendations('G', gLevel, currentLanguage);
                    
                    // Get background color based on performance level
                    const getBackgroundColor = (level) => {
                        if (level === 'low') return '#fef2f2'; // Light red
                        if (level === 'medium') return '#fef7ee'; // Light orange
                        return '#f0fdf4'; // Light green
                    };
                    
                    return `
                        <!-- Governance (G) Section -->
                        <div style="background: ${getBackgroundColor(gLevel)}; padding: 12px 20px; border-radius: 15px; border-left: 5px solid ${radarChartData.g.color}; box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin: 10px 0; page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; display: block;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 20px;">
                                🏛️ ${currentLanguage === 'pl' ? 'Zarządzanie (G)' : 'Governance (G)'}
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 16px; font-weight: 600; color: ${radarChartData.g.color}; margin-bottom: 6px;">
                                    ${gInsights.emoji} ${gInsights.performanceLabel}
                                </div>
                                <div style="color: #475569; line-height: 1.7; font-size: 14px; margin-bottom: 8px;">
                                    ${gInsights.description}
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${radarChartData.g.color}; page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Zalecany obszar działania:' : 'Recommended focus:'}
                                    </div>
                                    <div style="color: #475569; line-height: 1.4; font-size: 13px;">
                                        ${gInsights.recommendedFocus}
                                    </div>
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${importanceColors.g}; page-break-inside: avoid; break-inside: avoid;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Profil branżowy (waga sektora)' : 'Industry Profile (sector weight)'}
                                    </div>
                                    <div style="margin-top: 6px; background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                        <div style="background: ${importanceColors.g}; height: 100%; width: ${Math.min(importanceValues.g, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; color: #64748b; line-height: 1.4; font-style: italic;">
                                        ${currentLanguage === 'pl'
                                            ? 'Pokazujemy, jak istotny jest dany obszar zrównoważonego rozwoju w wybranej przez Ciebie branży, niezależnie od wyniku Twojej firmy.'
                                            : 'We show how important this area of sustainable development is in your chosen industry, regardless of your company\'s performance.'}
                                    </div>
                                    ${(() => {
                                        const istotnosc = getIstotnoscLabel(importanceValues.g, currentLanguage);
                                        return `
                                            <div style="margin-top: 8px; padding: 8px; background: ${istotnosc.color}15; border-radius: 6px; border: 1px solid ${istotnosc.color};">
                                                <div style="font-weight: 700; color: ${istotnosc.color}; font-size: 12px; margin-bottom: 4px;">
                                                    ${istotnosc.label}
                                                </div>
                                                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                                                    ${istotnosc.comment}
                                                </div>
                                            </div>
                                        `;
                                    })()}
                                </div>
                            </div>
                        </div>
                    `;
                })()}

                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>

                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>

            <!-- ESG Pillar Insights & Recommendations - Supply Chain (SC) Page -->
            <div style="width: 794px; padding: 50px 40px 75px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #1e293b; margin: 0 0 40px 0; font-size: 36px; text-align: center; color: #A3CC4B;">
                    ${currentLanguage === 'pl' ? '📊 Wglądy i rekomendacje dotyczące filarów ESG' : 'ESG Pillar Insights & Recommendations'}
                </h1>

                ${(() => {
                    // Calculate performance level for Supply Chain
                    const supLevel = getPillarPerformanceLevel(scores.sup, 15);
                    const supInsights = getPillarInsightsAndRecommendations('Supply', supLevel, currentLanguage);

                    // Get background color based on performance level
                    const getBackgroundColor = (level) => {
                        if (level === 'low') return '#fef2f2'; // Light red
                        if (level === 'medium') return '#fef7ee'; // Light orange
                        return '#f0fdf4'; // Light green
                    };

                    return `
                        <!-- Supply Chain Section -->
                        <div style="background: ${getBackgroundColor(supLevel)}; padding: 12px 20px; border-radius: 15px; border-left: 5px solid ${radarChartData.sup.color}; box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin: 10px 0; page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; display: block;">
                            <div style="font-weight: bold; color: #1e293b; margin-bottom: 8px; font-size: 20px;">
                                📦 ${currentLanguage === 'pl' ? 'Łańcuch Dostaw' : 'Supply Chain'}
                            </div>
                            <div style="margin-bottom: 12px;">
                                <div style="font-size: 16px; font-weight: 600; color: ${radarChartData.sup.color}; margin-bottom: 6px;">
                                    ${supInsights.emoji} ${supInsights.performanceLabel}
                                </div>
                                <div style="color: #475569; line-height: 1.7; font-size: 14px; margin-bottom: 8px;">
                                    ${supInsights.description}
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${radarChartData.sup.color}; page-break-inside: avoid; break-inside: avoid; margin-bottom: 8px;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Zalecany obszar działania:' : 'Recommended focus:'}
                                    </div>
                                    <div style="color: #475569; line-height: 1.4; font-size: 13px;">
                                        ${supInsights.recommendedFocus}
                                    </div>
                                </div>
                                <div style="background: white; padding: 8px 10px; border-radius: 8px; border-left: 3px solid ${importanceColors.sup}; page-break-inside: avoid; break-inside: avoid;">
                                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 14px;">
                                        ${currentLanguage === 'pl' ? 'Profil branżowy (waga sektora)' : 'Industry Profile (sector weight)'}
                                    </div>
                                    <div style="margin-top: 6px; background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                                        <div style="background: ${importanceColors.sup}; height: 100%; width: ${Math.min(importanceValues.sup, 100)}%; transition: width 0.3s ease;"></div>
                                    </div>
                                    <div style="margin-top: 6px; font-size: 11px; color: #64748b; line-height: 1.4; font-style: italic;">
                                        ${currentLanguage === 'pl'
                                            ? 'Pokazujemy, jak istotny jest dany obszar zrównoważonego rozwoju w wybranej przez Ciebie branży, niezależnie od wyniku Twojej firmy.'
                                            : 'We show how important this area of sustainable development is in your chosen industry, regardless of your company\'s performance.'}
                                    </div>
                                    ${(() => {
                                        const istotnosc = getIstotnoscLabel(importanceValues.sup, currentLanguage);
                                        return `
                                            <div style="margin-top: 8px; padding: 8px; background: ${istotnosc.color}15; border-radius: 6px; border: 1px solid ${istotnosc.color};">
                                                <div style="font-weight: 700; color: ${istotnosc.color}; font-size: 12px; margin-bottom: 4px;">
                                                    ${istotnosc.label}
                                                </div>
                                                <div style="font-size: 11px; color: #475569; line-height: 1.4;">
                                                    ${istotnosc.comment}
                                                </div>
                                            </div>
                                        `;
                                    })()}
                                </div>
                            </div>
                        </div>
                    `;
                })()}

                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>

                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>


            <!-- Industry Comparison Page - Fifth Page -->
            <div style="width: 794px; padding: 40px 40px; min-height: 1131px; box-sizing: border-box; position: relative;">
                <h1 style="color: #1e293b; margin: 0 0 25px 0; font-size: 32px; text-align: center; color: #A3CC4B;">🏭 ${currentLanguage === 'pl' ? 'Pozycja na tle branży' : 'Industry Benchmark Position'}</h1>
                
                <!-- Benchmark Table -->
                <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 15px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center; margin-bottom: 20px;">
                        <div style="padding: 20px; background: #f0fdf4; border-radius: 15px; border: 2px solid #A3CC4B;">
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: 500;">${currentLanguage === 'pl' ? 'Twoja firma' : 'Your Company'}</div>
                            <div style="font-size: 32px; color: #A3CC4B; font-weight: bold;">${scores.percent}%</div>
                        </div>
                        <div style="padding: 20px; background: #fef3c7; border-radius: 15px; border: 2px solid #f59e0b;">
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: 500;">${currentLanguage === 'pl' ? 'Średnia branży' : 'Industry Average'}</div>
                            <div style="font-size: 32px; color: #d97706; font-weight: bold;">${benchmark.average}%</div>
                        </div>
                        <div style="padding: 20px; background: #fef2f2; border-radius: 15px; border: 2px solid #ef4444;">
                            <div style="font-size: 14px; color: #64748b; margin-bottom: 8px; font-weight: 500;">${currentLanguage === 'pl' ? 'Top 25%' : 'Top 25%'}</div>
                            <div style="font-size: 32px; color: #dc2626; font-weight: bold;">${benchmark.top25}%</div>
                        </div>
                    </div>
                    
                    <!-- How to Read This Comparison (Jak czytać to porównanie) - moved here -->
                    <div style="background: #f8fafc; padding: 12px 15px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 15px 0 15px 0;">
                        <div style="color: #475569; font-size: 13px; line-height: 1.6;">
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px; font-size: 14px;">
                                ${currentLanguage === 'pl' ? 'Jak czytać to porównanie:' : 'How to read this comparison:'}
                            </div>
                            <div style="margin-bottom: 6px;">
                                <span style="color: #A3CC4B; font-weight: 600;">${currentLanguage === 'pl' ? `Twoja firma (${scores.percent}%)` : `Your company (${scores.percent}%)`}</span>
                                – ${currentLanguage === 'pl'
                                    ? 'Twój wynik gotowości na podstawie ankiety. Im wyższy wynik, tym bardziej uporządkowane są działania.'
                                    : 'Your readiness score based on the survey. The higher the score, the more organized your actions are.'}
                            </div>
                            <div style="margin-bottom: 6px;">
                                <span style="color: #d97706; font-weight: 600;">${currentLanguage === 'pl' ? `Średnia branży (${benchmark.average}%)` : `Industry average (${benchmark.average}%)`}</span>
                                – ${currentLanguage === 'pl'
                                    ? 'Średni wynik firm w Twojej branży.'
                                    : 'Average score of companies in your industry.'}
                            </div>
                            <div style="margin-bottom: 6px;">
                                <span style="color: #dc2626; font-weight: 600;">${currentLanguage === 'pl' ? `Liderzy (${benchmark.top25}%)` : `Leaders (${benchmark.top25}%)`}</span>
                                – ${currentLanguage === 'pl'
                                    ? 'Poziom najlepszej ćwiartki firm — jako inspiracja.'
                                    : 'Level of the best quarter of companies — as inspiration.'}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bar Chart -->
                    <div style="background: white; padding: 15px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin: 15px 0; text-align: center;">
                        <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px; color: #A3CC4B;">📊 ${currentLanguage === 'pl' ? 'Wizualne porównanie' : 'Visual Comparison'}</h3>

                        <!-- SVG Bar Chart -->
                        <div style="display: flex; justify-content: center; margin: 10px 0;">
                            <svg width="600" height="300" style="background: #f8fafc; border-radius: 10px; padding: 20px;">
                                <!-- Y-axis labels -->
                                <text x="30" y="30" font-family="Inter, Arial" font-size="12" fill="#64748b">100%</text>
                                <text x="30" y="80" font-family="Inter, Arial" font-size="12" fill="#64748b">75%</text>
                                <text x="30" y="130" font-family="Inter, Arial" font-size="12" fill="#64748b">50%</text>
                                <text x="30" y="180" font-family="Inter, Arial" font-size="12" fill="#64748b">25%</text>
                                <text x="15" y="100" font-family="Inter, Arial" font-size="14" fill="#1e293b" text-anchor="middle" font-weight="bold" transform="rotate(-90, 15, 100)">${currentLanguage === 'pl' ? 'Procent' : 'Percentage'}</text>
                                
                                <!-- Y-axis grid lines -->
                                <line x1="60" y1="30" x2="580" y2="30" stroke="#e2e8f0" stroke-width="1"/>
                                <line x1="60" y1="80" x2="580" y2="80" stroke="#e2e8f0" stroke-width="1"/>
                                <line x1="60" y1="130" x2="580" y2="130" stroke="#e2e8f0" stroke-width="1"/>
                                <line x1="60" y1="180" x2="580" y2="180" stroke="#e2e8f0" stroke-width="1"/>
                                
                                <!-- X-axis -->
                                <line x1="60" y1="180" x2="580" y2="180" stroke="#1e293b" stroke-width="2"/>
                                
                                <!-- Bars -->
                                <!-- Your Company Bar -->
                                <rect x="80" y="${180 - (scores.percent / 100) * 150}" width="120" height="${(scores.percent / 100) * 150}" fill="#A3CC4B" stroke="#1e293b" stroke-width="2"/>
                                <text x="140" y="${180 - (scores.percent / 100) * 150 - 10}" font-family="Inter, Arial" font-size="14" fill="#1e293b" text-anchor="middle" font-weight="bold">${scores.percent}%</text>
                                <text x="140" y="200" font-family="Inter, Arial" font-size="12" fill="#64748b" text-anchor="middle">${currentLanguage === 'pl' ? 'Twoja firma' : 'Your Company'}</text>
                                
                                <!-- Industry Average Bar -->
                                <rect x="220" y="${180 - (benchmark.average / 100) * 150}" width="120" height="${(benchmark.average / 100) * 150}" fill="#f59e0b" stroke="#1e293b" stroke-width="2"/>
                                <text x="280" y="${180 - (benchmark.average / 100) * 150 - 10}" font-family="Inter, Arial" font-size="14" fill="#1e293b" text-anchor="middle" font-weight="bold">${benchmark.average}%</text>
                                <text x="280" y="200" font-family="Inter, Arial" font-size="12" fill="#64748b" text-anchor="middle">${currentLanguage === 'pl' ? 'Średnia branży' : 'Industry Avg'}</text>
                                
                                <!-- Top 25% Bar -->
                                <rect x="360" y="${180 - (benchmark.top25 / 100) * 150}" width="120" height="${(benchmark.top25 / 100) * 150}" fill="#ef4444" stroke="#1e293b" stroke-width="2"/>
                                <text x="420" y="${180 - (benchmark.top25 / 100) * 150 - 10}" font-family="Inter, Arial" font-size="14" fill="#1e293b" text-anchor="middle" font-weight="bold">${benchmark.top25}%</text>
                                <text x="420" y="200" font-family="Inter, Arial" font-size="12" fill="#64748b" text-anchor="middle">${currentLanguage === 'pl' ? 'Top 25%' : 'Top 25%'}</text>
                                
                                <!-- Legend -->
                                <rect x="60" y="220" width="12" height="12" fill="#A3CC4B"/>
                                <text x="80" y="230" font-family="Inter, Arial" font-size="12" fill="#1e293b">${currentLanguage === 'pl' ? 'Twoja firma' : 'Your Company'}</text>
                                
                                <rect x="200" y="220" width="12" height="12" fill="#f59e0b"/>
                                <text x="220" y="230" font-family="Inter, Arial" font-size="12" fill="#1e293b">${currentLanguage === 'pl' ? 'Średnia branży' : 'Industry Average'}</text>
                                
                                <rect x="340" y="220" width="12" height="12" fill="#ef4444"/>
                                <text x="360" y="230" font-family="Inter, Arial" font-size="12" fill="#1e293b">${currentLanguage === 'pl' ? 'Top 25%' : 'Top 25%'}</text>
                            </svg>
                        </div>

                        <!-- Benchmark source label (Task #1 from Korekta.pdf) -->
                        <div style="text-align: center; margin: 8px 0 15px 0;">
                            <div style="font-size: 11px; color: #64748b; font-style: italic;">
                                ${currentLanguage === 'pl'
                                    ? `Benchmark branżowy (średnia, N=${benchmark.sampleSize})`
                                    : `Industry benchmark (average, N=${benchmark.sampleSize})`}
                            </div>
                        </div>

                        <!-- Chart description -->
                        <div style="color: #64748b; font-size: 14px; line-height: 1.5; margin-top: 15px;">
                            ${currentLanguage === 'pl' ?
                                `Wykres pokazuje pozycję Twojej firmy (${scores.percent}%) w porównaniu ze średnią branżową (${benchmark.average}%) i liderami (${benchmark.top25}%)` :
                                `The chart shows your company's position (${scores.percent}%) compared to industry average (${benchmark.average}%) and leaders (${benchmark.top25}%)`
                            }
                        </div>
                    </div>
                </div>

                <!-- Industry Comparison Additional Info (moved from separate page) -->
                <div style="margin-top: 10px; padding: 12px; background: #f8fafc; border-radius: 8px;">
                    <div style="color: #1e293b; font-size: 14px; line-height: 1.5; text-align: center;">
                        <div style="margin-bottom: 8px;">
                            <span style="font-weight: 600;">${benchmark.reporting}</span>
                        </div>
                        <div>
                            ${currentLanguage === 'pl' ?
                                `Twój wynik ${scores.percent}% jest o ${Math.abs(scores.percent - benchmark.average)} punktów procentowych ${scores.percent >= benchmark.average ? 'powyżej' : 'poniżej'} średniej (${benchmark.average}%).` :
                                `Your score of ${scores.percent}% is ${Math.abs(scores.percent - benchmark.average)} percentage points ${scores.percent >= benchmark.average ? 'above' : 'below'} the average (${benchmark.average}%).`
                            }
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                    <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                </div>

                <!--COMPARISON_TABLE_ANCHOR_BEFORE_ESG-->
                <!-- Page Break -->
                <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
            </div>
                   
                   <!-- Priority Actions Plan (30 days) - All on one page -->
                   <div style="width: 794px; padding: 35px 30px; min-height: 1131px; box-sizing: border-box; position: relative; background: white;">
                       ${(() => {
                           const priorityActions = getPriorityActions(scores.percent, currentLanguage);
                           const zoneColor = scores.percent < 40 ? '#ef4444' : (scores.percent < 70 ? '#fbbf24' : '#22c55e');
                           const zoneBgColor = scores.percent < 40 ? '#fef2f2' : (scores.percent < 70 ? '#fff7ed' : '#f0fdf4');

                           return `
                               <div style="text-align: center; margin-bottom: 20px;">
                                   <h1 style="color: #1e293b; margin: 0 0 15px 0; font-size: 36px; color: #A3CC4B; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                       📋 ${currentLanguage==='pl' ? 'Plan działań 30 dni' : '30 Day Action Plan'}
                                   </h1>
                               </div>

                               <!-- Intro Section (Comment 4 - direction and priorities) -->
                               <div style="background: #f8fafc; padding: 10px 14px; border-radius: 10px; border-left: 3px solid #A3CC4B; margin: 0 0 14px 0;">
                                   <div style="color: #475569; line-height: 1.5; font-size: 13px;">
                                       ${currentLanguage==='pl'
                                           ? 'Ten plan pokazuje, od czego zacząć i w jakiej kolejności działać, aby realnie zmniejszyć ryzyko biznesowe związane z ESG. System automatycznie wskazał obszary, w których braki mogą mieć największe znaczenie dla kontraktów, finansowania lub relacji z kluczowymi partnerami. Rekomendacje zostały podzielone na horyzonty 30 / 90 dni, abyś mógł skupić się najpierw na tym, co jest najpilniejsze, a pozostałe działania zaplanować w bezpieczny i realistyczny sposób. Nie musisz wdrażać wszystkiego naraz — wystarczy zacząć od pierwszych kroków.'
                                           : 'This plan shows where to start and in what order to act to effectively reduce ESG-related business risk. The system automatically identified areas where gaps may have the greatest impact on contracts, financing, or relationships with key partners. Recommendations are divided into 30 / 90 day horizons so you can focus first on what is most urgent, and plan the remaining actions in a safe and realistic way. You do not have to implement everything at once — just start with the first steps.'}
                                   </div>
                               </div>

                               <!-- Zone Header -->
                               <div style="background: ${zoneBgColor}; padding: 12px 14px; border-radius: 10px; border: 2px solid ${zoneColor}; box-shadow: 0 3px 10px rgba(0,0,0,0.05); margin: 0 0 14px 0;">
                                   <div style="font-weight: bold; color: ${zoneColor}; margin-bottom: 6px; font-size: 17px; text-align: center;">
                                       ${priorityActions.zoneName}
                                   </div>
                                   <div style="color: #1e293b; line-height: 1.4; font-size: 13px; text-align: center; font-weight: 500;">
                                       ${priorityActions.goal}
                                   </div>
                               </div>

                               <!-- Priority Phases with Methodology Comments -->
                               ${(() => {
                                   // Get PRIORITIES comments from ESGScoring if available
                                   const getPriorityComment = (phase, lang) => {
                                       if (typeof ESGScoring !== 'undefined' && ESGScoring.COMMENT_TEXTS && ESGScoring.COMMENT_TEXTS.PRIORITIES) {
                                           return ESGScoring.COMMENT_TEXTS.PRIORITIES[phase]?.[lang] || '';
                                       }
                                       // Fallback texts from methodology
                                       const fallbacks = {
                                           now: {
                                               pl: 'To działania, które najszybciej poprawią klarowność i spokój w rozmowach. Ich wykonanie od razu zmniejsza liczbę pytań i niepewności.',
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
                                       };
                                       return fallbacks[phase]?.[lang] || '';
                                   };

                                   const phases = [
                                       { key: 'now', emoji: '🟢', labelPl: 'TERAZ', labelEn: 'NOW', color: '#22c55e', bgColor: '#f0fdf4', days: 30 }
                                   ];

                                   const renderPhase = (phase, index, action) => {
                                       const phaseLabel = currentLanguage === 'pl' ? phase.labelPl : phase.labelEn;
                                       const phaseComment = getPriorityComment(phase.key, currentLanguage);
                                       const dayLabel = currentLanguage === 'pl' ? `${phase.days} DNI` : `${phase.days} DAYS`;

                                       // Task #7 from Korekta.pdf: Get industry-specific example for this horizon
                                       let industryExample = '';
                                       if (typeof window !== 'undefined' && window.IndustryHorizonExamples) {
                                           industryExample = window.IndustryHorizonExamples.getIndustryHorizonExample(industryCode, phase.days, currentLanguage);
                                       }

                                       return `
                                           <!-- Section Header for ${phase.days} Days -->
                                           <div style="margin-top: ${index > 0 ? '10px' : '0'};">
                                               <div style="background: ${phase.color}20; padding: 7px 10px; border-radius: 8px; border-left: 3px solid ${phase.color}; margin-bottom: 8px;">
                                                   <h3 style="margin: 0; color: ${phase.color}; font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                                                       ${phase.emoji} ${dayLabel} — ${phaseLabel}
                                                   </h3>
                                               </div>
                                               <div style="background: ${phase.bgColor}; padding: 10px 14px; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); border-left: 4px solid ${phase.color};">
                                                   <div style="font-weight: bold; color: #1e293b; margin-bottom: 6px; font-size: 14px; line-height: 1.3;">
                                                       ${action.title}
                                                   </div>
                                                   <div style="color: #475569; line-height: 1.4; font-size: 12px; margin-bottom: 8px;">
                                                       ${action.description}
                                                   </div>
                                                   ${industryExample ? `
                                                   <div style="font-size: 11px; color: #3b82f6; line-height: 1.4; margin-bottom: 8px; padding: 6px 8px; background: rgba(163, 204, 75, 0.08); border-radius: 6px; font-style: italic;">
                                                       ${industryExample}
                                                   </div>
                                                   ` : ''}
                                                   <div style="font-size: 10px; color: #64748b; line-height: 1.3; font-style: italic; padding-top: 6px; border-top: 1px dashed #d1d5db;">
                                                       ${phaseComment}
                                                   </div>
                                               </div>
                                           </div>
                                       `;
                                   };

                                   return `<div style="display: flex; flex-direction: column; gap: 12px; margin: 14px 0;">
                                       ${phases.map((phase, index) => {
                                           const action = priorityActions.actions[index] || { title: '', description: '' };
                                           return renderPhase(phase, index, action);
                                       }).join('')}
                                   </div>`;
                               })()}

                               <!-- Footer -->
                               <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                                   <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                               </div>

                               <!-- Page Break -->
                               <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
                           `;
                       })()}
                   </div>

                   <!-- Control Questions Page -->
                   ${generateControlQuestionsPage(currentLanguage)}

                   <!-- Detailed PLAN Comments Page (Company-type specific) -->
                   ${generatePlanCommentsPage(getCompanyType(clientDetails), currentLanguage)}

                   <!-- Client Comment and Future Modules Page (Penultimate Page) -->
                   <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">

                       <!-- Client Comment Section - Only shown if client left a comment -->
                       ${clientDetails && clientDetails.comment && clientDetails.comment.trim() !== '' ? `
                           <!-- Page Header -->
                           <div style="text-align: center; margin-bottom: 50px;">
                               <h1 style="color: #1e293b; margin: 0; font-size: 38px; font-weight: 700; letter-spacing: -0.5px;">
                                   ${currentLanguage === 'pl' ? 'Komentarz klienta' : 'Client Comment'}
                               </h1>
                               <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #A3CC4B 0%, #8ab93f 100%); margin: 15px auto 0; border-radius: 2px;"></div>
                           </div>
                           <div style="margin: 0 0 40px 0;">
                               <!-- Section Title -->
                               <h2 style="color: #A3CC4B; margin: 0 0 25px 0; font-size: 28px; font-weight: 700; text-align: center;">
                                   ${currentLanguage === 'pl' ? 'Uwagi i kontekst' : 'Notes and Context'}
                               </h2>
                               
                               <!-- Subtitle -->
                               <p style="color: #64748b; text-align: center; font-size: 15px; margin: 0 0 30px 0; line-height: 1.6;">
                                   ${currentLanguage === 'pl' 
                                       ? 'Dodatkowe informacje przekazane podczas oceny ESG' 
                                       : 'Additional information provided during ESG assessment'}
                               </p>

                               <!-- Comment Block -->
                               <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px 35px; border-radius: 16px; border-left: 5px solid #A3CC4B; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                                   <!-- Comment Content -->
                                   <div style="color: #1e293b; line-height: 1.8; font-size: 16px; text-align: left; font-weight: 400;">
                                       ${clientDetails.comment}
                                   </div>
                               </div>
                           </div>
                       ` : ''}

                       <!-- Future Modules Section -->
                       <div style="margin: 40px 0;">
                           <!-- Section Header -->
                           <div style="text-align: center; margin-bottom: 30px;">
                               <div style="display: inline-block; background: #fef3c7; padding: 6px 16px; border-radius: 6px; margin-bottom: 15px;">
                                   <span style="color: #d97706; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                       ${currentLanguage === 'pl' ? 'Wkrótce' : 'Coming Soon'}
                                   </span>
                               </div>
                               <h3 style="color: #1e293b; margin: 0; font-size: 24px; font-weight: 700;">
                                   ${currentLanguage === 'pl' ? 'Kolejne moduły raportu' : 'Next Report Modules'}
                               </h3>
                           </div>

                           <!-- Modules List -->
                           <div style="margin: 20px 0;">
                               <!-- Module Card -->
                               <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px 30px; border-radius: 16px; border-left: 5px solid #A3CC4B; box-shadow: 0 4px 12px rgba(0,0,0,0.06); margin-bottom: 20px;">
                                   <h4 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px; font-weight: 700;">
                                       ${currentLanguage === 'pl' ? 'Rozszerzona analiza (Noise-to-Signal Engine™)' : 'Extended Analysis (Noise-to-Signal Engine™)'}
                                   </h4>
                                   <p style="color: #475569; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
                                       ${currentLanguage === 'pl' ? 'Ten raport pokazuje, gdzie masz braki.' : 'This report shows where you have gaps.'}
                                   </p>
                                   <p style="color: #1e293b; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                                       ${currentLanguage === 'pl' ? 'Wersja rozszerzona pokazuje:' : 'The extended version shows:'}
                                   </p>
                                   <ul style="list-style: none; padding-left: 0; margin: 0;">
                                       <li style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; position: relative;">
                                           <span style="position: absolute; left: 0; color: #A3CC4B;">✓</span>
                                           ${currentLanguage === 'pl' ? 'które wymagania możesz bezpiecznie zignorować,' : 'which requirements you can safely ignore,'}
                                       </li>
                                       <li style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; position: relative;">
                                           <span style="position: absolute; left: 0; color: #A3CC4B;">✓</span>
                                           ${currentLanguage === 'pl' ? 'które inicjatywy są tylko szumem rynkowym,' : 'which initiatives are just market noise,'}
                                       </li>
                                       <li style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; position: relative;">
                                           <span style="position: absolute; left: 0; color: #A3CC4B;">✓</span>
                                           ${currentLanguage === 'pl' ? 'gdzie presja regulacyjna jest realna, a gdzie tylko marketingowa,' : 'where regulatory pressure is real and where it\'s just marketing,'}
                                       </li>
                                       <li style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; position: relative;">
                                           <span style="position: absolute; left: 0; color: #A3CC4B;">✓</span>
                                           ${currentLanguage === 'pl' ? 'które luki najszybciej wpłyną na decyzje klientów, banków lub partnerów.' : 'which gaps will most quickly affect client, bank, or partner decisions.'}
                                       </li>
                                   </ul>
                               </div>
                           </div>

                           <!-- Info Footer -->
                           <div style="margin-top: 25px; padding: 18px; background: #f8fafc; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;">
                               <div style="color: #64748b; font-size: 13px; line-height: 1.6; font-weight: 500;">
                                   ${currentLanguage === 'pl' ? 'Te moduły będą dostępne w przyszłych wersjach raportu' : 'These modules will be available in future report versions'}
                               </div>
                           </div>
                       </div>

                       <!-- Footer -->
                       <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                           <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
                       </div>

                       <!-- Page Break -->
                       <div style="page-break-before: always; height: 0; margin: 0; padding: 0;"></div>
                   </div>

                   <!-- Next Step - Final Page (CARD_NEXT_STEP) -->
                   <div style="width: 794px; padding: 50px 40px; min-height: 1131px; box-sizing: border-box; position: relative; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
                       <div style="text-align: center; margin-bottom: 50px;">
                           <h1 style="color: #1e293b; margin: 0 0 30px 0; font-size: 42px; color: #A3CC4B; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                               ${currentLanguage==='pl' ? 'Następny krok' : 'Next Step'}
                           </h1>
                       </div>

                       <!-- What's Next Section -->
                       <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); padding: 40px; border-radius: 25px; border: 3px solid #A3CC4B; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin: 0 0 40px 0;">
                           <div style="text-align: center;">
                               <div style="font-size: 24px; color: #A3CC4B; margin-bottom: 20px; font-weight: bold;">
                                   ${currentLanguage==='pl' ? 'Co dalej?' : "What's next?"}
                               </div>
                               <div style="color: #1e293b; line-height: 1.8; font-size: 20px;">
                                   ${currentLanguage==='pl'
                                       ? 'Kolejnym krokiem jest przejście od diagnozy do działania — w tempie dopasowanym do Twojej organizacji i jej realnych priorytetów biznesowych.'
                                       : 'The next step is to move from diagnosis to action — at a pace aligned with your organisation\'s real business priorities.'}
                               </div>
                           </div>
                       </div>

                       <!-- How to Use the Plan Section -->
                       <div style="background: white; padding: 40px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin: 0 0 40px 0;">
                           <div style="font-size: 24px; color: #A3CC4B; margin-bottom: 30px; font-weight: bold; text-align: center;">
                               ${currentLanguage==='pl' ? 'Jak korzystać z planu?' : 'How to use the plan?'}
                           </div>
                           <div style="display: flex; flex-direction: column; gap: 25px;">
                               <div style="display: flex; align-items: flex-start; gap: 20px;">
                                   <div style="color: #A3CC4B; font-weight: bold; font-size: 24px; flex-shrink: 0; width: 30px;">1.</div>
                                   <div style="color: #1e293b; line-height: 1.6; font-size: 18px;">
                                       ${currentLanguage==='pl'
                                           ? 'Zacznij od działań 30-dniowych — to obszary o najwyższym priorytecie biznesowym.'
                                           : 'Start with the 30-day actions — these are the areas with the highest business priority.'}
                                   </div>
                               </div>
                           </div>
                       </div>

                       <!-- Reassuring Close Section -->
                       <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 40px; border-radius: 25px; border: 2px solid #A3CC4B; margin: 0 0 40px 0;">
                           <div style="text-align: center;">
                               <div style="font-size: 48px; margin-bottom: 20px;">🌱</div>
                               <div style="color: #1e293b; line-height: 1.8; font-size: 18px; font-style: italic;">
                                   ${currentLanguage==='pl'
                                       ? 'Każdy krok, nawet najmniejszy, przybliża Cię do celu. Nie musisz robić wszystkiego naraz - ważne, żeby iść do przodu.'
                                       : 'Every step, even the smallest one, brings you closer to your goal. You don\'t have to do everything at once - what matters is moving forward.'}
                               </div>
                           </div>
                       </div>

                       <!-- Footer with Contact -->
                       <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #64748b; padding: 20px 20px;">
                           <div style="font-size: 14px; margin-bottom: 8px;">
                               ${currentLanguage==='pl' ? 'Kontakt:' : 'Contact:'} esgsync@protonmail.com | esgsync.pro
                           </div>
                           <div style="font-size: 14px; font-weight: 500; color: #A3CC4B;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION}</div>
                       </div>

                   </div>

               </div>
               
               <script>
                   // Baseline values (Bᵢ) for the industry
                   const baselineValues = {
                       e: ${baselineValues.e},
                       s: ${baselineValues.s},
                       g: ${baselineValues.g},
                       sup: ${baselineValues.sup}
                   };

                   // User score percentages (R for each section, C = Supply Chain)
                   const userPercentages = {
                       e: ${userPercentages.e.toFixed(2)},
                       s: ${userPercentages.s.toFixed(2)},
                       g: ${userPercentages.g.toFixed(2)},
                       sup: ${userPercentages.sup.toFixed(2)}
                   };

                   // Function to calculate MSᵢ = min(100, (Bᵢ × 0.6) + (R × 0.2) + (C × 0.2))
                   // R = user's score for that section, C = user's Supply Chain score
                   function calculateImportanceValue(section) {
                       const Bi = baselineValues[section];
                       const R = userPercentages[section];
                       const C = userPercentages.sup; // Supply Chain result
                       const MSi = Math.min(100, (Bi * 0.6) + (R * 0.2) + (C * 0.2));
                       return Math.round(MSi * 100) / 100; // Round to 2 decimal places
                   }
                   
                   // Function to update importance value display
                   function updateImportanceValue(section) {
                       const barElement = document.getElementById('importance-bar-' + section);
                       
                       if (barElement) {
                           // Calculate MSᵢ using the formula
                           const calculatedValue = calculateImportanceValue(section);
                           // Set progress bar width to calculated value (as percentage)
                           barElement.style.width = calculatedValue + '%';
                       }
                   }
                   
                   // Initialize values on page load
                   window.addEventListener('DOMContentLoaded', function() {
                       const sections = ['e', 's', 'g', 'sup'];
                       sections.forEach(function(section) {
                           updateImportanceValue(section);
                       });
                   });
               </script>
        </div>
</body>
</html>
    `;

    return htmlContent;
}

/**
 * Builds comparison table HTML with proper data mapping
 * @param {Object} options - Configuration object
 * @param {boolean} options.compareEnabled - Whether comparison is enabled
 * @param {Array<string>} options.selectedCompanies - Array of selected company names
 * @param {Object} options.benchmarkData - Benchmark data object (keyed by company name)
 * @param {string} options.userCompanyName - User's company name
 * @param {string|number} options.userScope1 - User's Scope 1 emissions
 * @param {string|number} options.userRen - User's renewable energy percentage
 * @param {string|number} options.userPaygap - User's pay gap percentage
 * @param {string} options.currentLanguage - Current language ('pl' or 'en')
 * @param {Object} options.clientDetails - Client details object
 * @returns {string} HTML string for comparison table
 */
function buildComparisonTable(options) {
    const {
        compareEnabled = false,
        selectedCompanies = [],
        benchmarkData = {},
        userCompanyName = '',
        userScope1 = '',
        userRen = '',
        userPaygap = '',
        currentLanguage = 'en',
        clientDetails = {}
    } = options;

    if (!compareEnabled || selectedCompanies.length === 0) return '';

    // Validate benchmarkData structure
    if (!benchmarkData || typeof benchmarkData !== 'object' || Array.isArray(benchmarkData)) {
        // If benchmarkData is invalid, return empty string or a message
        return '';
    }

    // Filter out invalid company names
    const validSelectedCompanies = selectedCompanies.filter(name => 
        name && typeof name === 'string' && name.trim().length > 0
    );

    if (validSelectedCompanies.length === 0) return '';

    // Debug: Log available data (only in development)
    if (typeof window !== 'undefined' && window.console && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')) {
        console.log('[buildComparisonTable] Selected companies:', validSelectedCompanies);
        console.log('[buildComparisonTable] Benchmark data keys:', Object.keys(benchmarkData));
        console.log('[buildComparisonTable] Benchmark data sample:', Object.keys(benchmarkData).slice(0, 3).reduce((acc, key) => {
            acc[key] = benchmarkData[key];
            return acc;
        }, {}));
    }

    // Normalize company names for matching (trim, lowercase, remove extra spaces)
    const normalizeName = (name) => {
        if (!name || typeof name !== 'string') return '';
        return name.trim().replace(/\s+/g, ' ').toLowerCase();
    };

    // Create a normalized lookup map for benchmark data with multiple normalization strategies
    const normalizedBenchmarkMap = {};
    const exactKeyMap = {}; // Map normalized -> original key for exact matching
    
    Object.keys(benchmarkData).forEach(key => {
        if (!key || typeof key !== 'string') return;
        const normalizedKey = normalizeName(key);
        if (normalizedKey) {
            // Store normalized -> data mapping
            if (!normalizedBenchmarkMap[normalizedKey]) {
                normalizedBenchmarkMap[normalizedKey] = benchmarkData[key];
                exactKeyMap[normalizedKey] = key; // Keep original key for reference
            }
        }
    });

    // Helper function to find company data with improved matching
    const getCompanyData = (companyName) => {
        if (!companyName || typeof companyName !== 'string') return null;
        
        const trimmedName = companyName.trim();
        const normalized = normalizeName(companyName);
        
        if (!normalized) return null;
        
        let matchedKey = null;
        let matchStrategy = null;
        
        // Strategy 1: Exact match (case-sensitive, original key)
        if (benchmarkData[trimmedName]) {
            matchedKey = trimmedName;
            matchStrategy = 'exact';
        }
        // Strategy 2: Exact match (case-sensitive, with original key from map)
        else if (exactKeyMap[normalized] && benchmarkData[exactKeyMap[normalized]]) {
            matchedKey = exactKeyMap[normalized];
            matchStrategy = 'exact-normalized-key';
        }
        // Strategy 3: Normalized exact match (case-insensitive)
        else if (normalizedBenchmarkMap[normalized]) {
            matchedKey = exactKeyMap[normalized] || Object.keys(benchmarkData).find(k => normalizeName(k) === normalized);
            matchStrategy = 'normalized-exact';
        }
        // Strategy 4: Partial match - check if normalized name contains or is contained in any key
        else {
            for (const key in benchmarkData) {
                if (!key || typeof key !== 'string') continue;
                const keyNormalized = normalizeName(key);
                if (!keyNormalized) continue;
                
                // Check if one contains the other (bidirectional)
                if (keyNormalized === normalized || 
                    keyNormalized.includes(normalized) || 
                    normalized.includes(keyNormalized)) {
                    matchedKey = key;
                    matchStrategy = 'partial';
                    break;
                }
            }
        }
        
        // Strategy 5: Fuzzy match - remove common words and try again (only if no match found)
        if (!matchedKey) {
            const removeCommonWords = (str) => {
                const commonWords = ['ltd', 'limited', 'inc', 'incorporated', 'corp', 'corporation', 'llc', 'group', 'company', 'co', 'and', 'the'];
                return str.split(' ').filter(word => !commonWords.includes(word)).join(' ').trim();
            };
            
            const normalizedWithoutCommon = removeCommonWords(normalized);
            if (normalizedWithoutCommon && normalizedWithoutCommon !== normalized && normalizedWithoutCommon.length > 0) {
                for (const key in benchmarkData) {
                    if (!key || typeof key !== 'string') continue;
                    const keyNormalized = removeCommonWords(normalizeName(key));
                    if (keyNormalized && keyNormalized.length > 0 && (keyNormalized === normalizedWithoutCommon || 
                        keyNormalized.includes(normalizedWithoutCommon) || 
                        normalizedWithoutCommon.includes(keyNormalized))) {
                        matchedKey = key;
                        matchStrategy = 'fuzzy';
                        break;
                    }
                }
            }
        }
        
        // Debug logging
        if (typeof window !== 'undefined' && window.console && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1')) {
            if (!matchedKey) {
                console.warn(`[getCompanyData] No match found for: "${companyName}" (normalized: "${normalized}")`);
            } else {
                console.log(`[getCompanyData] Matched "${companyName}" -> "${matchedKey}" (strategy: ${matchStrategy})`);
            }
        }
        
        return matchedKey ? benchmarkData[matchedKey] : null;
    };

    const kpiLabel = currentLanguage === 'pl' ? 'KPI' : 'KPI';
    const yourCompany = currentLanguage === 'pl' ? 'Twoja firma' : 'Your company';
    const avgMeta = (window.INDUSTRY_AVG && clientDetails.industry && window.INDUSTRY_AVG[clientDetails.industry]) || null;
    const avgLabel = avgMeta ? (currentLanguage === 'pl' ? (avgMeta.label_pl || ('Średnia ' + clientDetails.industry)) : (avgMeta.label_en || (clientDetails.industry + ' average'))) : (currentLanguage === 'pl' ? 'Średnia' : 'Average');
    const scope1Label = currentLanguage === 'pl' ? 'Emisje Zakresu 1 (tCO₂e)' : 'Emissions Scope 1 (tCO₂e)';
    const renLabel = currentLanguage === 'pl' ? '% energii odnawialnej' : '% energy from RES';
    const paygapLabel = currentLanguage === 'pl' ? 'Różnica w wynagrodzeniach (%)' : 'Pay Gap (%)';

    // Helper function to safely extract numeric value from company data
    const extractNumericValue = (data, field) => {
        if (!data || typeof data !== 'object') return null;
        const value = data[field];
        // Handle null, undefined, empty string
        if (value === null || value === undefined || value === '') return null;
        // Handle number (including 0, which is valid)
        if (typeof value === 'number') {
            return isNaN(value) ? null : value;
        }
        // Handle string that can be converted to number
        if (typeof value === 'string') {
            const num = Number(value.trim());
            return isNaN(num) ? null : num;
        }
        return null;
    };

    // Compute simple average from selected companies that have data
    const companies = validSelectedCompanies.slice(0, 5);
    
    const formatNumber = (n) => {
        try { return new Intl.NumberFormat(currentLanguage === 'pl' ? 'pl-PL' : 'en-US', { useGrouping: true }).format(Number(n)); } catch(_) { return String(n); }
    };
    
    const collect = (field) => {
        const vals = companies
            .map(c => {
                const data = getCompanyData(c);
                return extractNumericValue(data, field);
            })
            .filter(v => v !== null && v !== undefined && typeof v === 'number' && !isNaN(v));
        if (!vals.length) return 'N/D';
        const avg = vals.reduce((a,b)=>a+b,0) / vals.length;
        // For scope1, return as number; for percentages, round to 1 decimal
        if (field === 'scope1') {
            return Math.round(avg * 100) / 100; // Round to 2 decimals
        }
        return Math.round(avg * 10) / 10; // Round to 1 decimal for percentages
    };
    
    const avgScope1 = (avgMeta && typeof avgMeta.scope1 === 'number') ? avgMeta.scope1 : collect('scope1');
    const avgRen = (avgMeta && typeof avgMeta.ren === 'number') ? avgMeta.ren : collect('ren');
    const avgPaygap = (avgMeta && typeof avgMeta.paygap === 'number') ? avgMeta.paygap : collect('paygap');

    function formatVal(v, suffix='') {
        if (v === '' || v === undefined || v === null) return 'N/D';
        if (typeof v === 'number') {
            if (isNaN(v)) return 'N/D';
            return `${v}${suffix}`;
        }
        const num = Number(v);
        return isNaN(num) ? 'N/D' : `${num}${suffix}`;
    }
    
    function formatPercent(v) {
        if (v === '' || v === undefined || v === null) return 'N/D';
        const num = Number(v);
        if (isNaN(num)) return 'N/D';
        return `${num.toFixed(1)}%`;
    }
    
    const formatScope1 = (v) => {
        if (v === '' || v === undefined || v === null) return 'N/D';
        const num = Number(v);
        if (isNaN(num)) return 'N/D';
        try {
            // Force dot as decimal separator and up to 3 decimals
            return new Intl.NumberFormat('en-US', { useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(num);
        } catch (_) {
            const s = num.toFixed(3);
            return s.replace(/\.0{1,3}$/,'').replace(/(\.[0-9]*?)0+$/,'$1');
        }
    };
    
    // Enforce one decimal for user-entered % values
    let formattedUserRen = userRen;
    let formattedUserPaygap = userPaygap;
    if (userRen !== '' && !isNaN(Number(userRen))) formattedUserRen = Number(userRen).toFixed(1);
    if (userPaygap !== '' && !isNaN(Number(userPaygap))) formattedUserPaygap = Number(userPaygap).toFixed(1);
    
    // CARD DESIGN (selected option)
    // Each company in a separate card with full name and data
    // This solves the problem with long company names
    const companyCards = companies.map(companyName => {
        const companyData = getCompanyData(companyName);
        const scope1Value = extractNumericValue(companyData, 'scope1');
        const renValue = extractNumericValue(companyData, 'ren');
        const paygapValue = extractNumericValue(companyData, 'paygap');
        
        return `
            <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 12px; line-height: 1.4; word-break: break-word;">${companyName}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px;">
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${scope1Label}</div>
                        <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${scope1Value !== null ? formatScope1(scope1Value) : 'N/D'}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${renLabel}</div>
                        <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${renValue !== null ? formatPercent(renValue) : 'N/D'}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${paygapLabel}</div>
                        <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${paygapValue !== null ? formatPercent(paygapValue) : 'N/D'}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Card for "Your company" (highlighted in green)
    const yourCompanyCard = `
        <div style="background: #f0fdf4; border: 3px solid #A3CC4B; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: 18px; color: #1f2937; margin-bottom: 12px;">
                ${userCompanyName ? `${yourCompany}: ${userCompanyName}` : yourCompany}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px;">
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${scope1Label}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #A3CC4B;">${formatScope1(userScope1)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${renLabel}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #A3CC4B;">${formatPercent(formattedUserRen)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${paygapLabel}</div>
                    <div style="font-size: 20px; font-weight: 700; color: #A3CC4B;">${formatPercent(formattedUserPaygap)}</div>
                </div>
            </div>
        </div>
    `;
    
    // Card for average value (highlighted in yellow)
    const averageCard = `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 12px;">${avgLabel}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px;">
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${scope1Label}</div>
                    <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${avgScope1 !== 'N/D' ? formatScope1(avgScope1) : 'N/D'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${renLabel}</div>
                    <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${avgRen !== 'N/D' ? formatPercent(avgRen) : 'N/D'}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${paygapLabel}</div>
                    <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${avgPaygap !== 'N/D' ? formatPercent(avgPaygap) : 'N/D'}</div>
                </div>
            </div>
        </div>
    `;

    return `
        <div style="width: 794px; padding: 40px 40px; min-height: 1131px; box-sizing: border-box; position: relative; background:#ffffff;">
            <div style="font-size:32px; font-weight:800; color:#1f2937; margin: 30px 0 24px 0; text-align:center; color:#A3CC4B;">${currentLanguage==='pl'?'Porównanie KPI z wybranymi firmami':'KPI comparison with selected companies'}</div>
            <div style="margin: 0 0 24px 0;">
                ${yourCompanyCard}
                ${companyCards}
                ${averageCard}
            </div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; text-align: center; color: #A3CC4B; padding: 15px 20px;">
                <div style="font-size: 14px; font-weight: 500;">${currentLanguage === 'pl' ? 'Raport wygenerowany przez ESGSyncPRO' : 'Report generated by ESGSyncPRO'} | v${ESG_ENGINE_VERSION} | esgsync.pro</div>
            </div>
        </div>`;
}

/**
 * Helper function for template string replacement
 * @param {string} str - Template string
 * @param {Object} map - Replacement values
 * @returns {string} Processed string
 */
function templateString(str, map) {
    if (!str) return '';
    return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (k in map ? String(map[k]) : ''));
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAutoPeerCompanies,
        generatePdfHtmlContent,
        templateString,
        getEsgContentWithVariants,
        selectTextVariantsWithAI,
        generateFallbackVariants,
        generateDocumentVerificationResults,
        getCommentRecommendation,
        generateEsgMetricsSection,
        formatMetricValue,
        buildComparisonTable,
        ESG_ENGINE_VERSION,
        ESG_CORE_VERSION
    };
} else {
    // Make functions available globally in browser
    window.generatePdfHtmlContent = generatePdfHtmlContent;
    window.generateAutoPeerCompanies = generateAutoPeerCompanies;
    window.templateString = templateString;
    window.getEsgContentWithVariants = getEsgContentWithVariants;
    window.selectTextVariantsWithAI = selectTextVariantsWithAI;
    window.generateFallbackVariants = generateFallbackVariants;
    window.generateDocumentVerificationResults = generateDocumentVerificationResults;
    window.getCommentRecommendation = getCommentRecommendation;
    window.generateEsgMetricsSection = generateEsgMetricsSection;
    window.formatMetricValue = formatMetricValue;
    window.buildComparisonTable = buildComparisonTable;
    window.ESG_ENGINE_VERSION = ESG_ENGINE_VERSION;
    window.ESG_CORE_VERSION = ESG_CORE_VERSION;
}
