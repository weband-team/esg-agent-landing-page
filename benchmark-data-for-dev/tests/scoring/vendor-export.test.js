/**
 * Unit tests for Vendor Template Export Module (Krok 5)
 */

const {
    ANSWER_VALUES,
    setFeatureFlag,
    VENDOR_EXPORT_VERSION,
    VENDOR_TEMPLATE_NAMESPACE,
    EXPORT_ANSWER_VALUES,
    getExternalQuestionId,
    mapAnswerToExport,
    generateVendorTemplate,
    exportAnswersForVendor,
    importAnswersFromVendor,
    createUniformAnswers
} = require('../../src/scoring');

describe('Vendor Template Export Module (Krok 5)', () => {

    beforeEach(() => {
        setFeatureFlag('industry_lookup_enabled', false);
        setFeatureFlag('roi_proof_enabled', false);
        setFeatureFlag('whatif_and_exports_enabled', false);
    });

    describe('Constants', () => {
        test('VENDOR_TEMPLATE_NAMESPACE should be defined', () => {
            expect(VENDOR_TEMPLATE_NAMESPACE).toBe('ESGSYNC');
        });

        test('EXPORT_ANSWER_VALUES should map all answer types', () => {
            expect(EXPORT_ANSWER_VALUES[5]).toBe('TAK');
            expect(EXPORT_ANSWER_VALUES[3]).toBe('W_TRAKCIE');
            expect(EXPORT_ANSWER_VALUES[0]).toBe('NIE');
            expect(EXPORT_ANSWER_VALUES[null]).toBe('BRAK_DANYCH');
        });
    });

    describe('getExternalQuestionId', () => {
        test('should generate correct external ID', () => {
            expect(getExternalQuestionId('e1')).toBe('TPL_ESGSYNC.e1');
            expect(getExternalQuestionId('G3')).toBe('TPL_ESGSYNC.g3');
        });

        test('should use custom namespace', () => {
            expect(getExternalQuestionId('e1', 'CUSTOM')).toBe('TPL_CUSTOM.e1');
        });

        test('should lowercase the question ID', () => {
            expect(getExternalQuestionId('SC1')).toBe('TPL_ESGSYNC.sc1');
        });
    });

    describe('mapAnswerToExport', () => {
        test('should map TAK', () => {
            expect(mapAnswerToExport(5)).toBe('TAK');
        });

        test('should map W_TRAKCIE', () => {
            expect(mapAnswerToExport(3)).toBe('W_TRAKCIE');
        });

        test('should map NIE', () => {
            expect(mapAnswerToExport(0)).toBe('NIE');
        });

        test('should map null to BRAK_DANYCH', () => {
            expect(mapAnswerToExport(null)).toBe('BRAK_DANYCH');
            expect(mapAnswerToExport(undefined)).toBe('BRAK_DANYCH');
        });

        test('should map unknown values to BRAK_DANYCH', () => {
            expect(mapAnswerToExport(99)).toBe('BRAK_DANYCH');
        });
    });

    describe('generateVendorTemplate', () => {
        test('should return disabled message when flag is off', () => {
            setFeatureFlag('whatif_and_exports_enabled', false);

            const result = generateVendorTemplate();

            expect(result.enabled).toBe(false);
            expect(result.message).toBeDefined();
        });

        test('should generate template when flag is on', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);

            const result = generateVendorTemplate({ templateId: 'TEST_001' });

            expect(result.enabled).toBe(true);
            expect(result.version).toBe(VENDOR_EXPORT_VERSION);
            expect(result.template.id).toBe('TEST_001');
            expect(result.template.namespace).toBe('ESGSYNC');
            expect(result.template.questions.length).toBe(38); // CORE questions
        });

        test('should include EXTENDED questions when requested', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);

            const result = generateVendorTemplate({ includeExtended: true });

            expect(result.template.questions.length).toBe(50); // 38 CORE + 12 EXTENDED
        });

        test('each question should have required fields', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);

            const result = generateVendorTemplate();

            result.template.questions.forEach(q => {
                expect(q.external_id).toBeDefined();
                expect(q.internal_id).toBeDefined();
                expect(q.pillar).toBeDefined();
                expect(q.type).toBeDefined();
                expect(q.allowed_values).toContain('TAK');
                expect(q.allowed_values).toContain('NIE');
                expect(q.allowed_values).toContain('BRAK_DANYCH');
            });
        });

        test('should use custom namespace', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);

            const result = generateVendorTemplate({ namespace: 'CUSTOM' });

            expect(result.template.namespace).toBe('CUSTOM');
            expect(result.template.questions[0].external_id).toContain('TPL_CUSTOM.');
        });
    });

    describe('exportAnswersForVendor', () => {
        test('should return disabled message when flag is off', () => {
            setFeatureFlag('whatif_and_exports_enabled', false);

            const result = exportAnswersForVendor({});

            expect(result.enabled).toBe(false);
        });

        test('should export answers in vendor format', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const answers = { e1: 5, e2: 0, e3: null, g1: 3 };

            const result = exportAnswersForVendor(answers);

            expect(result.enabled).toBe(true);
            expect(result.answers.length).toBe(38); // All CORE questions

            const e1Answer = result.answers.find(a => a.internal_id === 'e1');
            expect(e1Answer.external_id).toBe('TPL_ESGSYNC.e1');
            expect(e1Answer.value).toBe('TAK');

            const e2Answer = result.answers.find(a => a.internal_id === 'e2');
            expect(e2Answer.value).toBe('NIE');
        });

        test('should exclude nulls when includeNulls is false', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const answers = { e1: 5, e2: 0 }; // Only 2 answered

            const result = exportAnswersForVendor(answers, { includeNulls: false });

            expect(result.answers.length).toBe(2);
        });

        test('should include metadata', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);

            const result = exportAnswersForVendor({ e1: 5 });

            expect(result.version).toBe(VENDOR_EXPORT_VERSION);
            expect(result.exportedAt).toBeDefined();
            expect(result.namespace).toBe('ESGSYNC');
            expect(result.answers_count).toBeDefined();
        });
    });

    describe('importAnswersFromVendor', () => {
        test('should return disabled message when flag is off', () => {
            setFeatureFlag('whatif_and_exports_enabled', false);

            const result = importAnswersFromVendor([]);

            expect(result.enabled).toBe(false);
        });

        test('should import valid answers', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_ESGSYNC.e1', value: 'TAK' },
                { external_id: 'TPL_ESGSYNC.g1', value: 'NIE' },
                { external_id: 'TPL_ESGSYNC.s1', value: 'W_TRAKCIE' }
            ];

            const result = importAnswersFromVendor(vendorAnswers);

            expect(result.enabled).toBe(true);
            expect(result.answers.e1).toBe(5);
            expect(result.answers.g1).toBe(0);
            expect(result.answers.s1).toBe(3);
            expect(result.summary.imported).toBe(3);
        });

        test('should skip answers with wrong namespace', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_OTHER.e1', value: 'TAK' }
            ];

            const result = importAnswersFromVendor(vendorAnswers);

            expect(result.summary.skipped).toBe(1);
            expect(result.details.skipped[0].reason).toBe('wrong_namespace');
        });

        test('should error on unknown questions', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_ESGSYNC.unknown99', value: 'TAK' }
            ];

            const result = importAnswersFromVendor(vendorAnswers);

            expect(result.summary.errors).toBe(1);
            expect(result.details.errors[0].reason).toBe('unknown_question');
        });

        test('should error on invalid values', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_ESGSYNC.e1', value: 'INVALID' }
            ];

            const result = importAnswersFromVendor(vendorAnswers);

            expect(result.summary.errors).toBe(1);
            expect(result.details.errors[0].reason).toBe('invalid_value');
        });

        test('should handle BRAK_DANYCH as null', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_ESGSYNC.e1', value: 'BRAK_DANYCH' }
            ];

            const result = importAnswersFromVendor(vendorAnswers);

            expect(result.answers.e1).toBeNull();
        });

        test('round-trip: export then import should preserve data', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const originalAnswers = {
                e1: 5, e2: 0, e3: 3, g1: 5, g2: 0, s1: 3
            };

            // Export
            const exported = exportAnswersForVendor(originalAnswers, { includeNulls: false });

            // Import
            const imported = importAnswersFromVendor(exported.answers);

            // Verify round-trip
            expect(imported.answers.e1).toBe(5);
            expect(imported.answers.e2).toBe(0);
            expect(imported.answers.e3).toBe(3);
            expect(imported.answers.g1).toBe(5);
            expect(imported.answers.g2).toBe(0);
            expect(imported.answers.s1).toBe(3);
        });

        test('should support custom namespace', () => {
            setFeatureFlag('whatif_and_exports_enabled', true);
            const vendorAnswers = [
                { external_id: 'TPL_CUSTOM.e1', value: 'TAK' }
            ];

            const result = importAnswersFromVendor(vendorAnswers, { namespace: 'CUSTOM' });

            expect(result.answers.e1).toBe(5);
            expect(result.summary.imported).toBe(1);
        });
    });
});
