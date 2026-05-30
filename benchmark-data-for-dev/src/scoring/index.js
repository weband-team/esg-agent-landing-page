/**
 * ESG Scoring Module + Relevance Engine v1
 * Main entry point - re-exports all modules
 */

const featureFlags = require('./feature-flags');
const core = require('./core');
const relevance = require('./relevance');
const industryLookup = require('./industry-lookup');
const roiProof = require('./roi-proof');
const vendorExport = require('./vendor-export');
const thresholds = require('./thresholds');
const comments = require('./comments');
const industryRiskIntro = require('./industry-risk-intro');
const industryProfile = require('./industry-profile');
const industryHorizonExamples = require('./industry-horizon-examples');
const financialImpact = require('./financialImpact');

module.exports = {
    // Feature Flags
    ...featureFlags,

    // Core
    ...core,

    // Relevance Engine
    ...relevance,

    // Industry Lookup (Krok 3)
    ...industryLookup,

    // ROI Proof (Krok 4)
    ...roiProof,

    // Vendor Export (Krok 5)
    ...vendorExport,

    // Thresholds (Krok 6 - State transitions)
    ...thresholds,

    // Comments (Methodology-based comment generation)
    ...comments,

    // Industry Risk Introductions (Task #3 from Korekta.pdf)
    ...industryRiskIntro,

    // Industry Profiles (Task #5 from Korekta.pdf)
    ...industryProfile,

    // Industry Horizon Examples (Task #7 from Korekta.pdf)
    ...industryHorizonExamples,

    // Financial Impact (Revenue-based impact calculation)
    ...financialImpact
};

// Also export for browser if needed
if (typeof window !== 'undefined') {
    window.ESGScoring = module.exports;
}
