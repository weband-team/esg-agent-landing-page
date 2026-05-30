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
