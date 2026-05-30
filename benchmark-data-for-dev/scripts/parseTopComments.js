/**
 * Script to parse TOP comments from COMMENTS.md and generate industryTopRisks.js
 */
const fs = require('fs');
const path = require('path');

// Industry name mappings (Polish/English -> code)
const INDUSTRY_MAP = {
    'Budownictwo': 'construction',
    'Construction': 'construction',
    'Energetyka i surowce': 'energy_resources',
    'Energy and raw materials': 'energy_resources',
    'Produkcja przemysłowa': 'industrial_production',
    'Industrial production': 'industrial_production',
    'Logistyka i Transport': 'logistics_transport',
    'Logistics and Transport': 'logistics_transport',
    'Handel i detalika': 'retail_trade',
    'Trade and retail': 'retail_trade',
    'IT i oprogramowanie': 'it_software',
    'IT and software': 'it_software',
    'Finanse w tym fintech': 'finance_fintech',
    'Finance (including fintech)': 'finance_fintech',
    'Usługi (inne)': 'services_other',
    'Services (other)': 'services_other'
};

// Language mapping
const LANG_MAP = {
    'PL': 'pl',
    'EN': 'en'
};

// State mapping
const STATE_MAP = {
    'Green': 'green',
    'Yellow': 'yellow',
    'Orange': 'orange',
    'Critical': 'critical'
};

function parseCommentsMd(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const result = {};
    let currentEntry = null;
    let textBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if this is a TOP entry line
        const topMatch = line.match(/^TOP\s+(.+?)\s+(E|S|G|SC)\s+(Business|Reputation|Operational)\s+(Green|Yellow|Orange|Critical)\s+(PL|EN)(?:\s+(.*))?$/);

        if (topMatch) {
            // Save previous entry if exists
            if (currentEntry) {
                saveEntry(result, currentEntry, textBuffer.join('\n').trim());
            }

            const [, industryName, pillar, riskType, state, lang, inlineText] = topMatch;
            const industryCode = INDUSTRY_MAP[industryName.trim()];

            if (!industryCode) {
                console.warn(`Unknown industry: "${industryName}" at line ${i + 1}`);
                currentEntry = null;
                textBuffer = [];
                continue;
            }

            currentEntry = {
                industry: industryCode,
                pillar: pillar,
                riskType: riskType,
                state: STATE_MAP[state],
                lang: LANG_MAP[lang]
            };

            textBuffer = inlineText ? [inlineText] : [];
        } else if (currentEntry) {
            // Skip empty lines at the start of text buffer
            if (textBuffer.length === 0 && line.trim() === '') {
                continue;
            }
            // Skip lines that look like section markers
            if (line.match(/^filar\s/i) || line.match(/^TYPE\s/i) || line.match(/^Industry\s/i)) {
                continue;
            }
            // Add to text buffer if not a new entry
            if (!line.match(/^TOP\s/) && !line.match(/^TOP_INTRO\s/) && !line.match(/^PROFILE\s/) && !line.match(/^EXT\s/) && !line.match(/^SPEC\s/) && !line.match(/^ES\s/)) {
                textBuffer.push(line);
            }
        }
    }

    // Save last entry
    if (currentEntry) {
        saveEntry(result, currentEntry, textBuffer.join('\n').trim());
    }

    return result;
}

function saveEntry(result, entry, text) {
    const { industry, pillar, riskType, state, lang } = entry;

    if (!text) return;

    // Clean up text - remove extra whitespace and join multi-line text
    text = text.replace(/\s+/g, ' ').trim();

    // Initialize nested structure
    if (!result[industry]) result[industry] = {};
    if (!result[industry][pillar]) result[industry][pillar] = {};
    if (!result[industry][pillar][riskType]) result[industry][pillar][riskType] = {};
    if (!result[industry][pillar][riskType][state]) result[industry][pillar][riskType][state] = {};

    result[industry][pillar][riskType][state][lang] = text;
}

function generateJsFile(data, outputPath) {
    let output = `/**
 * Industry-specific TOP 3 Risk Comments
 * Auto-generated from COMMENTS.md
 *
 * Structure: industry → pillar → riskType → state → { pl, en }
 */

const INDUSTRY_TOP_RISKS = `;

    output += JSON.stringify(data, null, 4);
    output += ';\n\nmodule.exports = { INDUSTRY_TOP_RISKS };\n';

    // Fix JSON to JS object notation (remove quotes from keys where possible)
    output = output.replace(/"(\w+)":/g, '$1:');

    fs.writeFileSync(outputPath, output);
    console.log(`Generated ${outputPath}`);
}

// Main
const commentsPath = path.join(__dirname, '..', 'COMMENTS.md');
const outputPath = path.join(__dirname, '..', 'src', 'scoring', 'industryTopRisks.js');

console.log('Parsing COMMENTS.md...');
const data = parseCommentsMd(commentsPath);

// Count entries
let count = 0;
for (const ind of Object.keys(data)) {
    for (const pil of Object.keys(data[ind])) {
        for (const risk of Object.keys(data[ind][pil])) {
            for (const state of Object.keys(data[ind][pil][risk])) {
                count += Object.keys(data[ind][pil][risk][state]).length;
            }
        }
    }
}
console.log(`Found ${count} TOP entries`);

generateJsFile(data, outputPath);
