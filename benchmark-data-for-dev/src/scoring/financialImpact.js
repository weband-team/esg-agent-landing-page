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
