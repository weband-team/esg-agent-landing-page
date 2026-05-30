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
