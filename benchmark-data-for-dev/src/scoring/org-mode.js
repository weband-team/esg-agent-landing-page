/**
 * Organization Mode Classification Module
 * Determines SME vs LARGE enterprise mode based on employees, revenue, and balance sheet.
 *
 * Based on EU SME definition criteria:
 * - Employees >= 251 -> LARGE (hard threshold)
 * - Revenue > 250M PLN -> LARGE (hard threshold)
 * - Revenue 50-250M PLN + Balance Sheet > 230M PLN -> LARGE
 * - Revenue 50-250M PLN + Balance Sheet 180-230M PLN -> LARGE (conservative)
 * - Otherwise -> SME
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const ORG_MODES = {
  SME: 'SME',
  LARGE: 'LARGE'
};

const MODE_REASONS = {
  EMPLOYEES: 'EMPLOYEES',
  REVENUE: 'REVENUE',
  BALANCE_SHEET: 'BALANCE_SHEET',
  DEFAULT_SME: 'DEFAULT_SME'
};

const MESSAGE_CODES = {
  EXTENDED_AVAILABLE_BY_EMPLOYEES: 'EXTENDED_AVAILABLE_BY_EMPLOYEES',
  EXTENDED_AVAILABLE_BY_REVENUE_HARD: 'EXTENDED_AVAILABLE_BY_REVENUE_HARD',
  REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS: 'REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS',
  BALANCE_SHEET_TRIGGERED_LARGE: 'BALANCE_SHEET_TRIGGERED_LARGE',
  BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE: 'BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE'
};

const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  HARD: 'hard'
};

// Message texts in Polish (as specified in requirements)
const MESSAGE_TEXTS = {
  [MESSAGE_CODES.EXTENDED_AVAILABLE_BY_EMPLOYEES]:
    'Dla organizacji tej wielkości dostępny jest typ rozszerzony. Doda kilka pytań o uporządkowanie zarządzania danych, wynik jest liczony osobno i nie zmienia wyniku głównego.',

  [MESSAGE_CODES.EXTENDED_AVAILABLE_BY_REVENUE_HARD]:
    'Na podstawie poziomu obrotów analiza jest prowadzona w trybie dużego przedsiębiorstwa. Dostępny jest typ rozszerzony — wynik liczony osobno, bez wpływu na wynik główny.',

  [MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS]:
    'Przy tym poziomie obrotów klasyfikacja może zależeć od sumy bilansowej. Jeśli znasz tę wartość, możesz ją podać, aby doprecyzować tryb analizy (opcjonalnie).',

  [MESSAGE_CODES.BALANCE_SHEET_TRIGGERED_LARGE]:
    'Na podstawie sumy bilansowej analiza jest prowadzona w trybie dużego przedsiębiorstwa. Dostępny jest typ rozszerzony — wynik liczony osobno, bez wpływu na wynik główny.',

  [MESSAGE_CODES.BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE]:
    'Podana suma bilansowa jest blisko progu klasyfikacji. Dla spójności analizy zastosowano tryb dużego przedsiębiorstwa.'
};

// Balance sheet range enum values
const BALANCE_SHEET_RANGES = {
  BELOW_180M: '<=180m',
  BETWEEN_180_230M: '180m-230m',
  ABOVE_230M: '>=230m'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if employees count indicates LARGE enterprise (251+)
 * @param {string} employeesRange - e.g. "1–10", "251–500", "500+"
 * @returns {boolean}
 */
function isLargeByEmployees(employeesRange) {
  if (!employeesRange) return false;

  // Handle "251–500" and "500+" cases
  if (employeesRange.includes('251') ||
      employeesRange.includes('500+') ||
      employeesRange === 'Powyżej 500') {
    return true;
  }
  return false;
}

/**
 * Check if revenue indicates LARGE enterprise (above 250M PLN)
 * @param {string} revenueRange - e.g. "50 mln – 250 mln PLN", "powyżej 250 mln PLN"
 * @returns {boolean}
 */
function isLargeByRevenue(revenueRange) {
  if (!revenueRange) return false;

  // Check for "powyżej 250 mln" or "250m+" patterns
  const normalized = revenueRange.toLowerCase();
  return normalized.includes('powyżej 250') ||
         normalized.includes('250m+') ||
         normalized.includes('> 250') ||
         normalized.includes('>250');
}

/**
 * Check if revenue is in the "gray zone" (50-250M PLN) where balance sheet matters
 * @param {string} revenueRange
 * @returns {boolean}
 */
function isRevenueInGrayZone(revenueRange) {
  if (!revenueRange) return false;

  // Don't count as gray zone if it's already LARGE by revenue
  if (isLargeByRevenue(revenueRange)) return false;

  const normalized = revenueRange.toLowerCase();
  // Check for "50 mln – 250 mln" pattern (the dash separates the range)
  return normalized.includes('50 mln') && normalized.includes('250 mln');
}

/**
 * Determine org mode based on balance sheet range
 * @param {string} balanceSheetRange - one of BALANCE_SHEET_RANGES values
 * @param {string} currentMode - current org mode before balance sheet check
 * @returns {{ isLarge: boolean, isAmbiguous: boolean }}
 */
function evaluateBalanceSheet(balanceSheetRange, currentMode) {
  if (!balanceSheetRange) {
    return { isLarge: false, isAmbiguous: false };
  }

  switch (balanceSheetRange) {
    case BALANCE_SHEET_RANGES.ABOVE_230M:
      return { isLarge: true, isAmbiguous: false };

    case BALANCE_SHEET_RANGES.BETWEEN_180_230M:
      // Gray zone - assume LARGE for safety (conservative approach)
      return { isLarge: true, isAmbiguous: true };

    case BALANCE_SHEET_RANGES.BELOW_180M:
      // Don't downgrade if already LARGE from employees
      return { isLarge: currentMode === ORG_MODES.LARGE, isAmbiguous: false };

    default:
      return { isLarge: false, isAmbiguous: false };
  }
}

// ============================================================================
// MAIN CLASSIFICATION FUNCTION
// ============================================================================

/**
 * Determine organization mode (SME vs LARGE) based on company profile
 *
 * @param {Object} profile - Company profile data
 * @param {string} profile.employees - Employee range (e.g. "51–250", "251–500")
 * @param {string} profile.revenue - Revenue range (e.g. "50 mln – 250 mln PLN")
 * @param {boolean|null} profile.knowsBalanceSheet - Whether user knows balance sheet
 * @param {string|null} profile.balanceSheetRangePLN - Balance sheet range if known
 *
 * @returns {Object} Classification result
 * @returns {string} result.orgMode - "SME" or "LARGE"
 * @returns {boolean} result.extendedEligible - Whether extended type is available
 * @returns {boolean} result.showExtendedPrompt - Whether to show extended prompt
 * @returns {boolean} result.showBalanceSheetPrompt - Whether to show balance sheet question
 * @returns {Array} result.messages - Array of {code, severity, text} objects
 * @returns {string} result.modeReason - Internal reason for mode (EMPLOYEES/REVENUE/BALANCE_SHEET/DEFAULT_SME)
 * @returns {boolean} result.balanceSheetUsed - Whether balance sheet was used in decision
 */
function determineOrgMode(profile) {
  const { employees, revenue, knowsBalanceSheet, balanceSheetRangePLN } = profile;

  // Initialize result
  const result = {
    orgMode: ORG_MODES.SME,
    extendedEligible: false,
    showExtendedPrompt: false,
    showBalanceSheetPrompt: false,
    messages: [],
    // Internal fields (not for UI)
    modeReason: MODE_REASONS.DEFAULT_SME,
    balanceSheetUsed: false
  };

  // =========================================================================
  // STEP 1: Check employees (hard threshold - highest priority)
  // =========================================================================
  if (isLargeByEmployees(employees)) {
    result.orgMode = ORG_MODES.LARGE;
    result.extendedEligible = true;
    result.showExtendedPrompt = true;
    result.modeReason = MODE_REASONS.EMPLOYEES;
    result.messages.push({
      code: MESSAGE_CODES.EXTENDED_AVAILABLE_BY_EMPLOYEES,
      severity: SEVERITY.HARD,
      text: MESSAGE_TEXTS[MESSAGE_CODES.EXTENDED_AVAILABLE_BY_EMPLOYEES]
    });

    // No need to check revenue or balance sheet - employees is definitive
    return result;
  }

  // =========================================================================
  // STEP 2: Check revenue (employees < 251)
  // =========================================================================
  if (isLargeByRevenue(revenue)) {
    // Hard threshold: revenue > 250M PLN
    result.orgMode = ORG_MODES.LARGE;
    result.extendedEligible = true;
    result.showExtendedPrompt = true;
    result.modeReason = MODE_REASONS.REVENUE;
    result.messages.push({
      code: MESSAGE_CODES.EXTENDED_AVAILABLE_BY_REVENUE_HARD,
      severity: SEVERITY.HARD,
      text: MESSAGE_TEXTS[MESSAGE_CODES.EXTENDED_AVAILABLE_BY_REVENUE_HARD]
    });

    return result;
  }

  // =========================================================================
  // STEP 3: Check gray zone (50-250M PLN revenue)
  // =========================================================================
  if (isRevenueInGrayZone(revenue)) {
    // Show balance sheet prompt
    result.showBalanceSheetPrompt = true;

    // Add warning message about balance sheet
    result.messages.push({
      code: MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS,
      severity: SEVERITY.WARNING,
      text: MESSAGE_TEXTS[MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS]
    });

    // =========================================================================
    // STEP 3a: If user provided balance sheet, evaluate it
    // =========================================================================
    if (knowsBalanceSheet === true && balanceSheetRangePLN) {
      result.balanceSheetUsed = true;

      const bsEvaluation = evaluateBalanceSheet(balanceSheetRangePLN, result.orgMode);

      if (bsEvaluation.isLarge) {
        result.orgMode = ORG_MODES.LARGE;
        result.extendedEligible = true;
        result.showExtendedPrompt = true;
        result.modeReason = MODE_REASONS.BALANCE_SHEET;

        // Remove the warning message (no longer needed)
        result.messages = result.messages.filter(
          m => m.code !== MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS
        );

        if (bsEvaluation.isAmbiguous) {
          // 180-230M range - ambiguous
          result.messages.push({
            code: MESSAGE_CODES.BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE,
            severity: SEVERITY.WARNING,
            text: MESSAGE_TEXTS[MESSAGE_CODES.BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE]
          });
        } else {
          // > 230M - clear LARGE
          result.messages.push({
            code: MESSAGE_CODES.BALANCE_SHEET_TRIGGERED_LARGE,
            severity: SEVERITY.HARD,
            text: MESSAGE_TEXTS[MESSAGE_CODES.BALANCE_SHEET_TRIGGERED_LARGE]
          });
        }
      }
      // If balance sheet <= 180M, stay SME (keep warning message)
    }
    // If user doesn't know balance sheet or hasn't answered - stay SME with warning
  }

  // =========================================================================
  // STEP 4: Default - SME
  // =========================================================================
  // If we get here without setting LARGE, company is SME

  return result;
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR UI
// ============================================================================

/**
 * Check if balance sheet question should be shown based on current profile values
 * @param {string} employees - Employee range
 * @param {string} revenue - Revenue range
 * @returns {boolean}
 */
function shouldShowBalanceSheetQuestion(employees, revenue) {
  // Don't show if already LARGE by employees
  if (isLargeByEmployees(employees)) {
    return false;
  }

  // Don't show if already LARGE by revenue
  if (isLargeByRevenue(revenue)) {
    return false;
  }

  // Show only in gray zone
  return isRevenueInGrayZone(revenue);
}

/**
 * Get balance sheet question visibility and warning message for UI
 * @param {string} employees
 * @param {string} revenue
 * @returns {{ show: boolean, warningMessage: string|null }}
 */
function getBalanceSheetUIState(employees, revenue) {
  const show = shouldShowBalanceSheetQuestion(employees, revenue);

  return {
    show,
    warningMessage: show
      ? MESSAGE_TEXTS[MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS]
      : null
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main function
  determineOrgMode,

  // Helper functions
  shouldShowBalanceSheetQuestion,
  getBalanceSheetUIState,
  isLargeByEmployees,
  isLargeByRevenue,
  isRevenueInGrayZone,

  // Constants
  ORG_MODES,
  MODE_REASONS,
  MESSAGE_CODES,
  MESSAGE_TEXTS,
  SEVERITY,
  BALANCE_SHEET_RANGES
};
