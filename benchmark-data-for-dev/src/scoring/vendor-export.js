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
