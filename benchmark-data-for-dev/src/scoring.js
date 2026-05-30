/**
 * ESG Scoring Module + Relevance Engine v1
 *
 * BACKWARD COMPATIBILITY WRAPPER
 * This file re-exports everything from the new modular structure.
 * For new code, prefer importing directly from './scoring/index.js'
 */

module.exports = require('./scoring/index');

// Browser export
if (typeof window !== 'undefined') {
    window.ESGScoring = module.exports;
}

