/**
 * Test suite for Organization Mode (SME vs LARGE) classification logic
 *
 * Test scenarios from requirements:
 * 1. Employees 251-500 + any revenue/balance -> LARGE + EXTENDED_AVAILABLE_BY_EMPLOYEES
 * 2. Employees <251, revenue 250m+ -> LARGE + revenue message
 * 3. Employees <251, revenue 50-250m, knowsBalanceSheet=false -> SME + warning
 * 4. Employees <251, revenue 50-250m, balance >=230m -> LARGE + balance message
 * 5. Employees <251, revenue <50m, any balance -> ignore balance
 */

const {
  determineOrgMode,
  shouldShowBalanceSheetQuestion,
  isLargeByEmployees,
  isLargeByRevenue,
  isRevenueInGrayZone,
  ORG_MODES,
  MESSAGE_CODES,
  BALANCE_SHEET_RANGES
} = require('../src/scoring/org-mode.js');

describe('OrgMode Classification', () => {

  // =========================================================================
  // Helper function tests
  // =========================================================================

  describe('isLargeByEmployees', () => {
    test('returns true for 251-500 employees', () => {
      expect(isLargeByEmployees('251–500')).toBe(true);
    });

    test('returns true for 500+ employees', () => {
      expect(isLargeByEmployees('500+')).toBe(true);
      expect(isLargeByEmployees('Powyżej 500')).toBe(true);
    });

    test('returns false for less than 251 employees', () => {
      expect(isLargeByEmployees('1–10')).toBe(false);
      expect(isLargeByEmployees('11–50')).toBe(false);
      expect(isLargeByEmployees('51–250')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isLargeByEmployees(null)).toBe(false);
      expect(isLargeByEmployees(undefined)).toBe(false);
      expect(isLargeByEmployees('')).toBe(false);
    });
  });

  describe('isLargeByRevenue', () => {
    test('returns true for revenue above 250M PLN', () => {
      expect(isLargeByRevenue('powyżej 250 mln PLN')).toBe(true);
    });

    test('returns false for revenue 50-250M PLN', () => {
      expect(isLargeByRevenue('50 mln – 250 mln PLN')).toBe(false);
    });

    test('returns false for revenue below 50M PLN', () => {
      expect(isLargeByRevenue('10 mln – 50 mln PLN')).toBe(false);
      expect(isLargeByRevenue('do 500 tys. PLN')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isLargeByRevenue(null)).toBe(false);
      expect(isLargeByRevenue(undefined)).toBe(false);
    });
  });

  describe('isRevenueInGrayZone', () => {
    test('returns true for revenue 50-250M PLN', () => {
      expect(isRevenueInGrayZone('50 mln – 250 mln PLN')).toBe(true);
    });

    test('returns false for revenue above 250M', () => {
      expect(isRevenueInGrayZone('powyżej 250 mln PLN')).toBe(false);
    });

    test('returns false for revenue below 50M', () => {
      expect(isRevenueInGrayZone('10 mln – 50 mln PLN')).toBe(false);
    });
  });

  // =========================================================================
  // Main classification tests - Test Scenarios from requirements
  // =========================================================================

  describe('Test Scenario 1: Employees 251-500 + any revenue/balance -> LARGE', () => {
    test('LARGE mode with EXTENDED_AVAILABLE_BY_EMPLOYEES message', () => {
      const result = determineOrgMode({
        employees: '251–500',
        revenue: '10 mln – 50 mln PLN',
        knowsBalanceSheet: false,
        balanceSheetRangePLN: null
      });

      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.extendedEligible).toBe(true);
      expect(result.showExtendedPrompt).toBe(true);
      expect(result.modeReason).toBe('EMPLOYEES');
      expect(result.messages[0].code).toBe(MESSAGE_CODES.EXTENDED_AVAILABLE_BY_EMPLOYEES);
    });

    test('LARGE mode regardless of high revenue', () => {
      const result = determineOrgMode({
        employees: '500+',
        revenue: 'powyżej 250 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.ABOVE_230M
      });

      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.modeReason).toBe('EMPLOYEES'); // Employees takes priority
    });
  });

  describe('Test Scenario 2: Employees <251, revenue 250m+ -> LARGE', () => {
    test('LARGE mode with revenue hard message', () => {
      const result = determineOrgMode({
        employees: '51–250',
        revenue: 'powyżej 250 mln PLN',
        knowsBalanceSheet: false,
        balanceSheetRangePLN: null
      });

      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.extendedEligible).toBe(true);
      expect(result.modeReason).toBe('REVENUE');
      expect(result.messages[0].code).toBe(MESSAGE_CODES.EXTENDED_AVAILABLE_BY_REVENUE_HARD);
    });
  });

  describe('Test Scenario 3: Employees <251, revenue 50-250m, knowsBalanceSheet=false -> SME', () => {
    test('SME mode with balance sheet warning', () => {
      const result = determineOrgMode({
        employees: '51–250',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: false,
        balanceSheetRangePLN: null
      });

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.showBalanceSheetPrompt).toBe(true);
      expect(result.messages[0].code).toBe(MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS);
    });

    test('SME mode when user answers "no" to balance sheet question', () => {
      const result = determineOrgMode({
        employees: '11–50',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: null, // User hasn't answered
        balanceSheetRangePLN: null
      });

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.showBalanceSheetPrompt).toBe(true);
    });
  });

  describe('Test Scenario 4: Employees <251, revenue 50-250m, balance >=230m -> LARGE', () => {
    test('LARGE mode when balance sheet is above 230M', () => {
      const result = determineOrgMode({
        employees: '51–250',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.ABOVE_230M
      });

      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.extendedEligible).toBe(true);
      expect(result.modeReason).toBe('BALANCE_SHEET');
      expect(result.messages[0].code).toBe(MESSAGE_CODES.BALANCE_SHEET_TRIGGERED_LARGE);
    });

    test('LARGE mode (ambiguous) when balance sheet is 180-230M', () => {
      const result = determineOrgMode({
        employees: '51–250',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.BETWEEN_180_230M
      });

      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.extendedEligible).toBe(true);
      expect(result.messages[0].code).toBe(MESSAGE_CODES.BALANCE_SHEET_AMBIGUOUS_ASSUME_LARGE);
    });

    test('SME mode when balance sheet is below 180M', () => {
      const result = determineOrgMode({
        employees: '51–250',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.BELOW_180M
      });

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.showBalanceSheetPrompt).toBe(true);
      // Warning message should still be present
      expect(result.messages[0].code).toBe(MESSAGE_CODES.REVENUE_MAY_TRIGGER_LARGE_NEEDS_BS);
    });
  });

  describe('Test Scenario 5: Employees <251, revenue <50m, any balance -> ignore balance', () => {
    test('SME mode, balance sheet question not shown', () => {
      const result = determineOrgMode({
        employees: '11–50',
        revenue: '10 mln – 50 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.ABOVE_230M
      });

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.showBalanceSheetPrompt).toBe(false);
      expect(result.messages.length).toBe(0);
    });

    test('SME mode for small companies', () => {
      const result = determineOrgMode({
        employees: '1–10',
        revenue: 'do 500 tys. PLN',
        knowsBalanceSheet: false,
        balanceSheetRangePLN: null
      });

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.extendedEligible).toBe(false);
      expect(result.showBalanceSheetPrompt).toBe(false);
    });
  });

  // =========================================================================
  // shouldShowBalanceSheetQuestion tests
  // =========================================================================

  describe('shouldShowBalanceSheetQuestion', () => {
    test('returns true for gray zone revenue and small employees', () => {
      expect(shouldShowBalanceSheetQuestion('51–250', '50 mln – 250 mln PLN')).toBe(true);
    });

    test('returns false when already LARGE by employees', () => {
      expect(shouldShowBalanceSheetQuestion('251–500', '50 mln – 250 mln PLN')).toBe(false);
    });

    test('returns false when already LARGE by revenue', () => {
      expect(shouldShowBalanceSheetQuestion('51–250', 'powyżej 250 mln PLN')).toBe(false);
    });

    test('returns false for small revenue', () => {
      expect(shouldShowBalanceSheetQuestion('51–250', '10 mln – 50 mln PLN')).toBe(false);
    });
  });

  // =========================================================================
  // Edge cases
  // =========================================================================

  describe('Edge cases', () => {
    test('handles empty profile gracefully', () => {
      const result = determineOrgMode({});

      expect(result.orgMode).toBe(ORG_MODES.SME);
      expect(result.extendedEligible).toBe(false);
    });

    test('balance sheet never downgrades LARGE from employees', () => {
      // This case shouldn't happen in practice (UI won't show balance sheet question)
      // but the logic should handle it safely
      const result = determineOrgMode({
        employees: '251–500',
        revenue: '50 mln – 250 mln PLN',
        knowsBalanceSheet: true,
        balanceSheetRangePLN: BALANCE_SHEET_RANGES.BELOW_180M
      });

      // Should still be LARGE because of employees
      expect(result.orgMode).toBe(ORG_MODES.LARGE);
      expect(result.modeReason).toBe('EMPLOYEES');
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running org-mode tests...');
  // For manual testing without Jest
  const testCases = [
    {
      name: 'Scenario 1: Large by employees',
      profile: { employees: '251–500', revenue: '10 mln – 50 mln PLN' },
      expected: { orgMode: 'LARGE', modeReason: 'EMPLOYEES' }
    },
    {
      name: 'Scenario 2: Large by revenue',
      profile: { employees: '51–250', revenue: 'powyżej 250 mln PLN' },
      expected: { orgMode: 'LARGE', modeReason: 'REVENUE' }
    },
    {
      name: 'Scenario 3: SME with gray zone',
      profile: { employees: '51–250', revenue: '50 mln – 250 mln PLN', knowsBalanceSheet: false },
      expected: { orgMode: 'SME', showBalanceSheetPrompt: true }
    },
    {
      name: 'Scenario 4: Large by balance sheet',
      profile: { employees: '51–250', revenue: '50 mln – 250 mln PLN', knowsBalanceSheet: true, balanceSheetRangePLN: '>=230m' },
      expected: { orgMode: 'LARGE', modeReason: 'BALANCE_SHEET' }
    },
    {
      name: 'Scenario 5: SME small company',
      profile: { employees: '1–10', revenue: 'do 500 tys. PLN' },
      expected: { orgMode: 'SME', showBalanceSheetPrompt: false }
    }
  ];

  testCases.forEach(tc => {
    const result = determineOrgMode(tc.profile);
    const passed = Object.keys(tc.expected).every(key => result[key] === tc.expected[key]);
    console.log(`${passed ? '✓' : '✗'} ${tc.name}`);
    if (!passed) {
      console.log('  Expected:', tc.expected);
      console.log('  Got:', { orgMode: result.orgMode, modeReason: result.modeReason, showBalanceSheetPrompt: result.showBalanceSheetPrompt });
    }
  });
}
