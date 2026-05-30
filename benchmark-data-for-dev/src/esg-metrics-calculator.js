/**
 * ESG Metrics Calculator
 * Calculates quantitative ESG indicators based on document data
 */

/**
 * Metrics configuration directory
 * Contains formulas, required fields, units, and keywords for each metric
 */
const METRICS_CONFIG = {
    // Environmental (E) metrics
    carbon_roi: {
        sphere: 'E',
        name: {
            en: 'Carbon ROI',
            pl: 'Carbon ROI'
        },
        description: {
            en: 'Return on investment for carbon reduction initiatives',
            pl: 'Zwrot z inwestycji w inicjatywy redukcji emisji'
        },
        formula: (data) => {
            // Carbon ROI = (Cost Savings from Carbon Reduction) / (Investment in Carbon Reduction)
            const savings = data.carbon_reduction_savings || 0;
            const investment = data.carbon_reduction_investment || 0;
            if (investment <= 0) return null;
            return savings / investment;
        },
        requiredFields: ['carbon_reduction_savings', 'carbon_reduction_investment'],
        fieldKeywords: {
            carbon_reduction_savings: ['carbon savings', 'emission savings', 'co2 savings', 'cost savings', 'savings from carbon', 'savings from emission', 'savings amount', 'oszczędności'],
            carbon_reduction_investment: ['carbon investment', 'emission investment', 'co2 investment', 'reduction investment', 'invested in carbon', 'invested in emission', 'carbon reduction initiatives', 'emission reduction initiatives', 'inwestycje']
        },
        units: {
            carbon_reduction_savings: ['USD', 'USD'],
            carbon_reduction_investment: ['USD', 'USD']
        },
        outputUnit: 'ratio',
        threshold: 1.0 // ROI > 1 means positive return
    },
    
    water_efficiency_index: {
        sphere: 'E',
        name: {
            en: 'Water Efficiency Index',
            pl: 'Wskaźnik Efektywności Wodnej'
        },
        description: {
            en: 'Water consumption per unit of production',
            pl: 'Zużycie wody na jednostkę produkcji'
        },
        formula: (data) => {
            // Water Efficiency Index = Water Consumption / Production Volume
            const waterConsumption = data.water_consumption || 0;
            const productionVolume = data.production_volume || 0;
            if (productionVolume <= 0) return null;
            return waterConsumption / productionVolume;
        },
        requiredFields: ['water_consumption', 'production_volume'],
        fieldKeywords: {
            water_consumption: ['water consumption', 'water usage', 'water use', 'water', 'zużycie wody', 'm³'],
            production_volume: ['production volume', 'production', 'output', 'volume', 'wielkość produkcji', 'units']
        },
        units: {
            water_consumption: ['m³', 'cubic meters', 'cubic metres'],
            production_volume: ['units', 'pieces']
        },
        outputUnit: 'm³/units',
        threshold: null // Lower is better
    },
    
    energy_intensity: {
        sphere: 'E',
        name: {
            en: 'Energy Intensity',
            pl: 'Intensywność Energetyczna'
        },
        description: {
            en: 'Energy consumption per unit of production',
            pl: 'Zużycie energii na jednostkę produkcji'
        },
        formula: (data) => {
            // Energy Intensity = Energy Consumption / Production Volume
            const energyConsumption = data.energy_consumption || 0;
            const productionVolume = data.production_volume || 0;
            if (productionVolume <= 0) return null;
            return energyConsumption / productionVolume;
        },
        requiredFields: ['energy_consumption', 'production_volume'],
        fieldKeywords: {
            energy_consumption: ['energy consumption', 'energy usage', 'energy use', 'electricity', 'power', 'zużycie energii', 'MWh'],
            production_volume: ['production volume', 'production', 'output', 'volume', 'wielkość produkcji', 'units']
        },
        units: {
            energy_consumption: ['MWh', 'MW·h', 'megawatt hours'],
            production_volume: ['units', 'pieces']
        },
        outputUnit: 'MWh/units',
        threshold: null // Lower is better
    },
    
    // Social (S) metrics
    diversity_index: {
        sphere: 'S',
        name: {
            en: 'Diversity Index',
            pl: 'Wskaźnik Różnorodności'
        },
        description: {
            en: 'Measure of workforce diversity',
            pl: 'Miara różnorodności siły roboczej'
        },
        formula: (data) => {
            // Diversity Index = (Women + Minorities) / Total Employees
            const women = data.women_count || 0;
            const minorities = data.minorities_count || 0;
            const totalEmployees = data.total_employees || 0;
            if (totalEmployees <= 0) return null;
            return (women + minorities) / totalEmployees;
        },
        requiredFields: ['women_count', 'total_employees', 'minorities_count'],
        fieldKeywords: {
            women_count: ['women', 'female employees', 'female', 'kobiety', 'people'],
            minorities_count: ['minorities', 'minority', 'minority employees', 'mniejszości'],
            total_employees: ['total employees', 'employees', 'workforce', 'staff', 'pracownicy', 'people']
        },
        units: {
            women_count: ['people', 'employees', 'pracownicy'],
            minorities_count: ['people', 'employees', 'pracownicy'],
            total_employees: ['people', 'employees', 'pracownicy']
        },
        outputUnit: 'ratio',
        threshold: 0.3 // 30% is considered good
    },
    
    social_impact_ratio: {
        sphere: 'S',
        name: {
            en: 'Social Impact Ratio',
            pl: 'Wskaźnik Wpływu Społecznego'
        },
        description: {
            en: 'Social investment relative to revenue',
            pl: 'Inwestycje społeczne w stosunku do przychodów'
        },
        formula: (data) => {
            // Social Impact Ratio = Social Investment / Revenue
            const socialInvestment = data.social_investment || 0;
            const revenue = data.revenue || 0;
            if (revenue <= 0) return null;
            return socialInvestment / revenue;
        },
        requiredFields: ['social_investment', 'revenue'],
        fieldKeywords: {
            social_investment: ['social investment', 'social spending', 'community investment', 'inwestycje społeczne', 'USD'],
            revenue: ['revenue', 'sales', 'income', 'przychody', 'USD']
        },
        units: {
            social_investment: ['USD', 'USD'],
            revenue: ['USD', 'USD']
        },
        outputUnit: 'ratio',
        threshold: 0.01 // 1% is considered good
    },
    
    // Governance (G) metrics
    governance_compliance_score: {
        sphere: 'G',
        name: {
            en: 'Governance Compliance Score',
            pl: 'Wynik Zgodności Zarządzania'
        },
        description: {
            en: 'Compliance with governance standards',
            pl: 'Zgodność ze standardami zarządzania'
        },
        formula: (data) => {
            // Governance Compliance Score = (Compliant Policies / Total Policies) * 100
            const compliantPolicies = data.compliant_policies || 0;
            const totalPolicies = data.total_policies || 0;
            if (totalPolicies <= 0) return null;
            return (compliantPolicies / totalPolicies) * 100;
        },
        requiredFields: ['compliant_policies', 'total_policies'],
        fieldKeywords: {
            compliant_policies: ['compliant policies', 'compliant', 'policies compliant', 'zgodne polityki', 'count'],
            total_policies: ['total policies', 'policies', 'all policies', 'wszystkie polityki', 'count']
        },
        units: {
            compliant_policies: ['count', 'number', 'policies'],
            total_policies: ['count', 'number', 'policies']
        },
        outputUnit: '%',
        threshold: 80 // 80% is considered good
    },
    
    board_independence_pct: {
        sphere: 'G',
        name: {
            en: 'Board Independence Percentage',
            pl: 'Procent Niezależności Zarządu'
        },
        description: {
            en: 'Percentage of independent board members',
            pl: 'Procent niezależnych członków zarządu'
        },
        formula: (data) => {
            // Board Independence % = (Independent Members / Total Members) * 100
            const independentMembers = data.independent_members || 0;
            const totalMembers = data.total_board_members || 0;
            if (totalMembers <= 0) return null;
            return (independentMembers / totalMembers) * 100;
        },
        requiredFields: ['independent_members', 'total_board_members'],
        fieldKeywords: {
            independent_members: ['independent members', 'independent directors', 'independent board', 'niezależni członkowie', 'people'],
            total_board_members: ['total board members', 'board members', 'directors', 'członkowie zarządu', 'people']
        },
        units: {
            independent_members: ['people', 'members', 'członkowie'],
            total_board_members: ['people', 'members', 'członkowie']
        },
        outputUnit: '%',
        threshold: 50 // 50% is considered good
    }
};

/**
 * Valid units of measurement
 */
const VALID_UNITS = {
    't CO₂e': ['t CO2e', 'tCO2e', 'tonnes CO2e', 'tons CO2e'],
    'm³': ['m³', 'cubic meters', 'cubic metres', 'm3'],
    'MWh': ['MWh', 'MW·h', 'megawatt hours'],
    'USD': ['USD', '$', 'dollars', 'usd'],
    'units': ['units', 'pieces', 'count', 'number'],
    'people': ['people', 'employees', 'persons', 'pracownicy']
};

/**
 * Extract numerical values from document text
 * @param {string} documentText - Extracted text from document
 * @param {string} fieldName - Name of the field to extract
 * @param {Array} keywords - Keywords to search for
 * @param {Array} validUnits - Valid units for this field
 * @returns {Object|null} Extracted value with number and unit, or null if not found
 */
function extractValueFromDocument(documentText, fieldName, keywords, validUnits) {
    if (!documentText || typeof documentText !== 'string') {
        return null;
    }
    
    const text = documentText.toLowerCase();
    const normalizedUnits = validUnits.map(u => u.toLowerCase());
    
    // Try to find value near keywords
    for (const keyword of keywords) {
        const keywordLower = keyword.toLowerCase();
        const keywordIndex = text.indexOf(keywordLower);
        
        if (keywordIndex !== -1) {
            // Look for numbers both before and after the keyword (within 50 chars before, 100 after)
            const keywordEnd = keywordIndex + keyword.length;
            const searchStart = Math.max(0, keywordIndex - 50);
            const searchEnd = Math.min(text.length, keywordEnd + 100);
            const context = text.substring(searchStart, searchEnd);
            const keywordOffsetInContext = keywordIndex - searchStart; // Position of keyword in context
            
            // Try to match number patterns: "$500,000", "123,456.78", "123 456", "123.45", "123"
            // Use word boundaries to avoid partial matches (e.g., "100" in "1000")
            // Match: $500,000 or 500,000 or 123.45 or 1234
            const numberPattern = /(?:^|\s|:|=|>|<|\(|\[|,|;)\s*[\$]?\s*(\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?|\d+\.\d+|\d{4,}|\d{1,3})(?=\s|$|,|;|\)|\]|\.|%|USD|usd|m³|MWh|units|people|employees)/g;
            
            let bestMatch = null;
            let closestDistance = Infinity;
            let match;
            
            while ((match = numberPattern.exec(context)) !== null) {
                const fullMatch = match[0]; // Full match including $ and spaces
                const matchValue = match[1]; // Just the number part
                const matchIndex = match.index;
                const matchEnd = matchIndex + fullMatch.length;
                
                // Calculate distance: prefer numbers immediately before or after keyword
                let distance;
                if (matchEnd <= keywordOffsetInContext) {
                    // Number is before keyword - prefer closer ones
                    distance = keywordOffsetInContext - matchEnd;
                } else {
                    // Number is after keyword - prefer closer ones, but add small penalty
                    distance = matchIndex - keywordOffsetInContext + 10;
                }
                
                // Skip if this looks like a partial match (e.g., "100" when we want "1000")
                // Check if there's a longer number right after this one
                const afterMatch = context.substring(matchIndex + fullMatch.length, matchIndex + fullMatch.length + 10);
                if (/^\d/.test(afterMatch.trim())) {
                    continue; // Skip partial matches
                }
                
                // Check if there's a unit nearby
                const unitContext = context.substring(Math.max(0, matchIndex - 10), matchIndex + fullMatch.length + 50);
                
                // Find unit in context
                let foundUnit = null;
                for (const unit of normalizedUnits) {
                    if (unitContext.toLowerCase().includes(unit)) {
                        foundUnit = unit;
                        break;
                    }
                }
                
                // Parse number (handle both comma and dot)
                // Remove $ and spaces first
                let numberValue = matchValue.replace(/\$/g, '').replace(/\s/g, '');
                
                // Determine if comma is thousands separator or decimal separator
                // If number has both comma and dot, comma is thousands separator
                if (numberValue.includes(',') && numberValue.includes('.')) {
                    numberValue = numberValue.replace(/,/g, '');
                } else if (numberValue.includes(',') && numberValue.split(',')[1]?.length === 3) {
                    // If comma followed by 3 digits, it's likely thousands separator
                    numberValue = numberValue.replace(/,/g, '');
                } else if (numberValue.includes(',')) {
                    // Otherwise comma might be decimal separator
                    numberValue = numberValue.replace(',', '.');
                }
                
                numberValue = parseFloat(numberValue);
                
                if (!isNaN(numberValue) && numberValue >= 0 && distance < closestDistance) {
                    closestDistance = distance;
                    bestMatch = {
                        value: numberValue,
                        unit: foundUnit || validUnits[0], // Default to first valid unit
                        field: fieldName
                    };
                }
            }
            
            if (bestMatch) {
                return bestMatch;
            }
        }
    }
    
    return null;
}

/**
 * Validate extracted value
 * @param {Object} extractedValue - Extracted value object
 * @param {Array} validUnits - Valid units for this field
 * @param {boolean} isDivisor - Whether this field is used as divisor (must be > 0)
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateValue(extractedValue, validUnits, isDivisor = false) {
    if (!extractedValue) {
        return {
            isValid: false,
            error: 'Value not found'
        };
    }
    
    const { value, unit } = extractedValue;
    
    // Check if value is a number
    if (typeof value !== 'number' || isNaN(value)) {
        return {
            isValid: false,
            error: 'Value is not a valid number'
        };
    }
    
    // Check if value is non-negative
    if (value < 0) {
        return {
            isValid: false,
            error: 'Value must be non-negative'
        };
    }
    
    // Check if divisor is strictly positive
    if (isDivisor && value <= 0) {
        return {
            isValid: false,
            error: 'Divisor must be strictly greater than zero'
        };
    }
    
    // Check unit
    const normalizedUnits = validUnits.map(u => u.toLowerCase());
    const normalizedUnit = unit ? unit.toLowerCase() : '';
    
    if (unit && !normalizedUnits.some(u => normalizedUnit.includes(u.toLowerCase()) || u.toLowerCase().includes(normalizedUnit))) {
        return {
            isValid: false,
            error: `Invalid unit. Expected one of: ${validUnits.join(', ')}`
        };
    }
    
    return {
        isValid: true,
        error: null
    };
}

/**
 * Calculate metric value
 * @param {string} metricKey - Key of the metric in METRICS_CONFIG
 * @param {string} documentText - Extracted text from document
 * @param {string} language - Language code ('en', 'pl')
 * @returns {Object} Calculation result with value, status, and missing fields
 */
function calculateMetric(metricKey, documentText, language = 'en') {
    const config = METRICS_CONFIG[metricKey];
    
    if (!config) {
        return {
            metricKey,
            status: 'error',
            value: null,
            error: `Metric ${metricKey} not found in configuration`,
            missingFields: []
        };
    }
    
    // Extract all required fields
    const extractedData = {};
    const missingFields = [];
    
    for (const fieldName of config.requiredFields) {
        const keywords = config.fieldKeywords[fieldName] || [];
        const validUnits = config.units[fieldName] || [];
        
        const extractedValue = extractValueFromDocument(documentText, fieldName, keywords, validUnits);
        
        if (extractedValue) {
            // Determine if this field is a divisor (check formula to see if it divides by this field)
            const isDivisor = config.formula.toString().includes(`data.${fieldName}`) && 
                             config.formula.toString().includes('/');
            
            const validation = validateValue(extractedValue, validUnits, isDivisor);
            
            if (validation.isValid) {
                extractedData[fieldName] = extractedValue.value;
            } else {
                missingFields.push({
                    field: fieldName,
                    reason: validation.error
                });
            }
        } else {
            missingFields.push({
                field: fieldName,
                reason: 'Field not found in document'
            });
        }
    }
    
    // Check if all required fields are present
    if (missingFields.length > 0) {
        return {
            metricKey,
            metricName: config.name[language] || config.name.en,
            status: 'insufficient_data',
            value: null,
            missingFields: missingFields.map(mf => mf.field),
            missingFieldsDetails: missingFields
        };
    }
    
    // Calculate metric using formula
    try {
        const calculatedValue = config.formula(extractedData);
        
        if (calculatedValue === null || calculatedValue === undefined) {
            return {
                metricKey,
                metricName: config.name[language] || config.name.en,
                status: 'insufficient_data',
                value: null,
                missingFields: [],
                error: 'Calculation returned null (likely division by zero)'
            };
        }
        
        return {
            metricKey,
            metricName: config.name[language] || config.name.en,
            description: config.description[language] || config.description.en,
            status: 'calculated',
            value: calculatedValue,
            unit: config.outputUnit,
            threshold: config.threshold,
            extractedData,
            missingFields: []
        };
    } catch (error) {
        return {
            metricKey,
            metricName: config.name[language] || config.name.en,
            status: 'error',
            value: null,
            error: error.message,
            missingFields: []
        };
    }
}

/**
 * Get metrics for a specific ESG sphere
 * @param {string} sphere - ESG sphere ('E', 'S', or 'G')
 * @returns {Array} Array of metric keys for the sphere
 */
function getMetricsForSphere(sphere) {
    return Object.keys(METRICS_CONFIG).filter(key => METRICS_CONFIG[key].sphere === sphere);
}

/**
 * Calculate all metrics for a specific ESG sphere
 * @param {string} sphere - ESG sphere ('E', 'S', or 'G')
 * @param {string} documentText - Extracted text from document
 * @param {string} language - Language code ('en', 'pl')
 * @returns {Array} Array of calculation results
 */
function calculateMetricsForSphere(sphere, documentText, language = 'en') {
    const metricKeys = getMetricsForSphere(sphere);
    return metricKeys.map(key => calculateMetric(key, documentText, language));
}

/**
 * Generate recommendations for metrics
 * @param {Array} metricResults - Array of metric calculation results
 * @param {string} language - Language code ('en', 'pl')
 * @returns {Array} Array of recommendation strings
 */
function generateRecommendations(metricResults, language = 'en') {
    const recommendations = [];
    
    const templates = {
        en: {
            insufficient_data: (metricName, missingField) =>
                `Unable to calculate ${metricName} - please specify ${missingField} in the reporting period`,
            low_value: (metricName, value, threshold) =>
                `${metricName} is ${value.toFixed(2)}, which is below the recommended threshold of ${threshold}. Consider improving this metric.`
        },
        pl: {
            insufficient_data: (metricName, missingField) =>
                `Nie można obliczyć ${metricName} - podaj ${missingField} w okresie sprawozdawczym`,
            low_value: (metricName, value, threshold) =>
                `${metricName} wynosi ${value.toFixed(2)}, co jest poniżej zalecanego progu ${threshold}. Rozważ poprawę tego wskaźnika.`
        }
    };
    
    const t = templates[language] || templates.en;
    
    for (const result of metricResults) {
        if (result.status === 'insufficient_data' && result.missingFields && result.missingFields.length > 0) {
            const missingField = result.missingFields[0];
            // Get field name from config
            const config = METRICS_CONFIG[result.metricKey];
            if (config && config.fieldKeywords[missingField]) {
                const fieldDisplayName = config.fieldKeywords[missingField][0];
                recommendations.push(t.insufficient_data(result.metricName, fieldDisplayName));
            } else {
                recommendations.push(t.insufficient_data(result.metricName, missingField));
            }
        } else if (result.status === 'calculated' && result.threshold !== null) {
            // Check if value is below threshold
            if (result.value < result.threshold) {
                recommendations.push(t.low_value(result.metricName, result.value, result.threshold));
            }
        }
    }
    
    return recommendations;
}

/**
 * Format metric value for display
 * @param {Object} metricResult - Metric calculation result
 * @param {string} language - Language code ('en', 'pl')
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

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        METRICS_CONFIG,
        calculateMetric,
        calculateMetricsForSphere,
        getMetricsForSphere,
        generateRecommendations,
        formatMetricValue,
        extractValueFromDocument,
        validateValue
    };
}

