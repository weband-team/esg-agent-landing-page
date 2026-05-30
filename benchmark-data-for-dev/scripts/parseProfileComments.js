/**
 * Script to parse PROFILE comments from COMMENTS.md and update INDUSTRY_COMMENTS
 */
const fs = require('fs');
const path = require('path');

// Industry name mappings
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

const LANG_MAP = { 'PL': 'pl', 'EN': 'en' };

function parseCommentsMd(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const result = {};
    let currentEntry = null;
    let textBuffer = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // PROFILE with all fields on one line
        const profileMatch = line.match(/^PROFILE\s+(.+?)\s+(E|S|G|SC)\s+NULL\s+NULL\s+(PL|EN)(?:\s+(.*))?$/);

        // PROFILE with industry only (pillar on next line)
        const profilePartialMatch = line.match(/^PROFILE\s+(.+?)$/);

        if (profileMatch) {
            if (currentEntry) {
                saveEntry(result, currentEntry, textBuffer.join('\n').trim());
            }

            const [, industryName, pillar, lang, inlineText] = profileMatch;
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
                lang: LANG_MAP[lang]
            };
            textBuffer = inlineText ? [inlineText] : [];
        } else if (profilePartialMatch && !profileMatch) {
            // Check if next line has pillar info
            const nextLine = lines[i + 1];
            if (nextLine) {
                const pillarMatch = nextLine.match(/^(E|S|G|SC)\s+NULL\s+NULL\s+(PL|EN)/);
                if (pillarMatch) {
                    if (currentEntry) {
                        saveEntry(result, currentEntry, textBuffer.join('\n').trim());
                    }

                    const industryName = profilePartialMatch[1].trim();
                    const industryCode = INDUSTRY_MAP[industryName];

                    if (!industryCode) {
                        console.warn(`Unknown industry: "${industryName}" at line ${i + 1}`);
                        currentEntry = null;
                        textBuffer = [];
                        continue;
                    }

                    currentEntry = {
                        industry: industryCode,
                        pillar: pillarMatch[1],
                        lang: LANG_MAP[pillarMatch[2]]
                    };
                    textBuffer = [];
                    i++; // Skip the pillar line
                }
            }
        } else if (currentEntry) {
            // Skip empty lines at the start
            if (textBuffer.length === 0 && line.trim() === '') continue;
            // Skip marker lines
            if (line.match(/^(filar|TYPE|PROFILE|TOP|EXT|SPEC|ES)\s/i)) continue;
            if (line.match(/^\d+\s+records/i)) continue;
            if (line.match(/^Pillar\s*\+\s*State/i)) continue;
            if (line.match(/^Industry\s*\+\s*Pillar/i)) continue;

            textBuffer.push(line);
        }
    }

    if (currentEntry) {
        saveEntry(result, currentEntry, textBuffer.join('\n').trim());
    }

    return result;
}

function saveEntry(result, entry, text) {
    const { industry, pillar, lang } = entry;
    if (!text) return;

    text = text.replace(/\s+/g, ' ').trim();

    if (!result[industry]) result[industry] = {};
    if (!result[industry][pillar]) result[industry][pillar] = {};

    result[industry][pillar][lang] = text;
}

function generateOutput(data) {
    let output = `/**
 * Industry Profile Comments (INDUSTRY_COMMENTS)
 * Auto-generated from COMMENTS.md PROFILE entries
 *
 * Structure: industry → pillar → { pl, en }
 */

const INDUSTRY_COMMENTS = `;

    output += JSON.stringify(data, null, 4);
    output += ';\n\nmodule.exports = { INDUSTRY_COMMENTS };\n';
    output = output.replace(/"(\w+)":/g, '$1:');

    return output;
}

// Main
const commentsPath = path.join(__dirname, '..', 'COMMENTS.md');
console.log('Parsing PROFILE comments from COMMENTS.md...');
const data = parseCommentsMd(commentsPath);

// Count
let count = 0;
for (const ind of Object.keys(data)) {
    for (const pil of Object.keys(data[ind])) {
        count += Object.keys(data[ind][pil]).length;
    }
}
console.log(`Found ${count} PROFILE entries`);
console.log('Industries:', Object.keys(data));

// Output to console for review
console.log('\n--- Generated INDUSTRY_COMMENTS ---\n');
console.log(generateOutput(data));
