require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { query, getClient } = require('../database/database');
const {
    calculateMetricsForSphere,
    generateRecommendations,
    formatMetricValue,
    METRICS_CONFIG
} = require('../src/esg-metrics-calculator');


const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased for large PDF files
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increased for large PDF files

// Static files - paths relative to project root (server is in server/ folder)
const projectRoot = path.join(__dirname, '..');
app.use(express.static(path.join(projectRoot, 'public')));
app.use(express.static(projectRoot));
app.use('/public', express.static(path.join(projectRoot, 'public')));
app.use('/pages', express.static(path.join(projectRoot, 'pages')));

// Clean URL routes (without .html extension)
// Language routes for main page: /en, /pl
app.get('/en', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});
app.get('/pl', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});

// Clean URLs for pages (without .html)
app.get('/about', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'about.html'));
});
app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'privacy-policy.html'));
});
app.get('/articles', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'articles.html'));
});
app.get('/article', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'article.html'));
});

// Explicit routes for header and footer (for fetch requests)
app.get('/pages/header', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'header.html'));
});
app.get('/pages/footer', (req, res) => {
    res.sendFile(path.join(projectRoot, 'pages', 'footer.html'));
});

// Root redirects to default language or serves index
app.get('/', (req, res) => {
    res.sendFile(path.join(projectRoot, 'index.html'));
});

// Get API key from environment variables
const USE_OPENROUTER = process.env.USE_OPENROUTER === 'true';
const OPENAI_API_KEY = USE_OPENROUTER
    ? (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
    : process.env.OPENAI_API_KEY;
const API_ENDPOINT = USE_OPENROUTER
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
const MODEL_NAME = USE_OPENROUTER
    ? 'openai/gpt-4o-mini'
    : 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
    // API key not found, using fallback mode
}

// ==================== ISO STANDARDS MODELS ====================
// Structured models for ISO standards requirements

const ISO_STANDARDS = {
    'ISO_14001': {
        name: 'ISO 14001 - Environmental Management Systems',
        domain: 'E',
        requirements: [
            {
                id: 'ISO_14001_4.1',
                title: 'Understanding the organization and its context',
                pattern: /(understanding|context|organization|environmental.*context|external.*internal.*factors)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_4.2',
                title: 'Understanding the needs and expectations of interested parties',
                pattern: /(interested.*parties|stakeholders|expectations|needs|requirements.*parties)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_4.3',
                title: 'Determining the scope of the environmental management system',
                pattern: /(scope|environmental.*management.*system|boundaries|applicability)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_4.4',
                title: 'Environmental management system',
                pattern: /(environmental.*management.*system|EMS|establish|implement|maintain|continual.*improvement)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_5.1',
                title: 'Leadership and commitment',
                pattern: /(leadership|commitment|top.*management|environmental.*policy|accountability)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_5.2',
                title: 'Environmental policy',
                pattern: /(environmental.*policy|policy.*environment|commitment.*protection|prevention.*pollution)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_5.3',
                title: 'Organizational roles, responsibilities and authorities',
                pattern: /(roles|responsibilities|authorities|organizational.*structure|environmental.*responsibilities)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_6.1.1',
                title: 'General - Actions to address risks and opportunities',
                pattern: /(risks|opportunities|environmental.*aspects|environmental.*impacts|life.*cycle|perspective)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_6.1.2',
                title: 'Environmental aspects',
                pattern: /(environmental.*aspects|aspects.*environment|activities|products|services|significant.*aspects)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_6.1.3',
                title: 'Compliance obligations',
                pattern: /(compliance|obligations|legal.*requirements|regulatory|applicable.*requirements)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_6.1.4',
                title: 'Planning action',
                pattern: /(planning|actions|objectives|environmental.*objectives|targets|programs)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_6.2',
                title: 'Environmental objectives and planning to achieve them',
                pattern: /(environmental.*objectives|targets|planning|measurable|monitoring|review)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_7.1',
                title: 'Resources',
                pattern: /(resources|personnel|infrastructure|competence|awareness|communication)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_7.2',
                title: 'Competence',
                pattern: /(competence|training|education|skills|knowledge|awareness|qualifications)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_7.3',
                title: 'Awareness',
                pattern: /(awareness|environmental.*policy|environmental.*aspects|environmental.*impacts|roles)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_7.4',
                title: 'Communication',
                pattern: /(communication|internal.*communication|external.*communication|information.*exchange)/i,
                mandatory: false
            },
            {
                id: 'ISO_14001_7.5',
                title: 'Documented information',
                pattern: /(documented.*information|documents|records|control.*documents|documentation)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_8.1',
                title: 'Operational planning and control',
                pattern: /(operational.*planning|control|processes|operational.*controls|procedures)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_8.2',
                title: 'Emergency preparedness and response',
                pattern: /(emergency|preparedness|response|emergency.*procedures|incident|accident)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_9.1',
                title: 'Monitoring, measurement, analysis and evaluation',
                pattern: /(monitoring|measurement|analysis|evaluation|performance|indicators|metrics)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_9.2',
                title: 'Internal audit',
                pattern: /(internal.*audit|audit.*program|audit.*plan|audit.*criteria|auditors)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_9.3',
                title: 'Management review',
                pattern: /(management.*review|review.*meeting|top.*management|review.*input|review.*output)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_10.1',
                title: 'General - Nonconformity and corrective action',
                pattern: /(nonconformity|non.*conformity|corrective.*action|preventive.*action)/i,
                mandatory: true
            },
            {
                id: 'ISO_14001_10.2',
                title: 'Continual improvement',
                pattern: /(continual.*improvement|improvement|enhancement|better.*performance|sustainability)/i,
                mandatory: true
            }
        ]
    },
    'ISO_26000': {
        name: 'ISO 26000 - Social Responsibility',
        domain: 'S',
        requirements: [
            {
                id: 'ISO_26000_4.1',
                title: 'Understanding social responsibility',
                pattern: /(social.*responsibility|SR|understanding|principles|core.*subjects)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_4.2',
                title: 'Principles of social responsibility',
                pattern: /(principles|accountability|transparency|ethical.*behavior|respect|rule.*of.*law|human.*rights)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_5.2',
                title: 'Recognizing social responsibility and engaging stakeholders',
                pattern: /(recognizing|stakeholders|engagement|dialogue|consultation|participation)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.2',
                title: 'Organizational governance',
                pattern: /(organizational.*governance|governance|decision.*making|accountability|transparency)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.3',
                title: 'Human rights',
                pattern: /(human.*rights|rights|due.*diligence|avoid.*complicity|resolve.*grievances|discrimination)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.3.3',
                title: 'Civil and political rights',
                pattern: /(civil.*rights|political.*rights|freedom|expression|assembly|association|participation)/i,
                mandatory: false
            },
            {
                id: 'ISO_26000_6.3.4',
                title: 'Economic, social and cultural rights',
                pattern: /(economic.*rights|social.*rights|cultural.*rights|education|health|housing|food)/i,
                mandatory: false
            },
            {
                id: 'ISO_26000_6.3.5',
                title: 'Fundamental principles and rights at work',
                pattern: /(fundamental.*principles|rights.*work|freedom.*association|collective.*bargaining|forced.*labor|child.*labor)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.4',
                title: 'Labor practices',
                pattern: /(labor.*practices|employment|working.*conditions|social.*dialogue|health.*safety|development|training)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.4.3',
                title: 'Employment and employment relationships',
                pattern: /(employment|employment.*relationships|contracts|job.*security|termination|redundancy)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.4.4',
                title: 'Conditions of work and social protection',
                pattern: /(conditions.*work|social.*protection|wages|working.*hours|leave|benefits|social.*security)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.4.5',
                title: 'Social dialogue',
                pattern: /(social.*dialogue|collective.*bargaining|consultation|information|participation|trade.*unions)/i,
                mandatory: false
            },
            {
                id: 'ISO_26000_6.4.6',
                title: 'Health and safety at work',
                pattern: /(health.*safety|occupational.*health|safety|workplace|accidents|injuries|prevention)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.4.7',
                title: 'Human development and training in the workplace',
                pattern: /(human.*development|training|education|skills|competence|career.*development|learning)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.5',
                title: 'The environment',
                pattern: /(environment|environmental|pollution|resource.*use|climate.*change|biodiversity|restoration)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.6',
                title: 'Fair operating practices',
                pattern: /(fair.*operating|practices|anti.*corruption|responsible.*political|fair.*competition|promoting|respect.*property)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.6.3',
                title: 'Anti-corruption',
                pattern: /(anti.*corruption|corruption|bribery|fraud|embezzlement|extortion|conflicts.*interest)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.6.4',
                title: 'Responsible political involvement',
                pattern: /(political.*involvement|lobbying|political.*contributions|transparency|accountability)/i,
                mandatory: false
            },
            {
                id: 'ISO_26000_6.6.5',
                title: 'Fair competition',
                pattern: /(fair.*competition|competition|anti.*trust|monopoly|pricing|market.*behavior)/i,
                mandatory: true
            },
            {
                id: 'ISO_26000_6.7',
                title: 'Consumer issues',
                pattern: /(consumer|issues|fair.*marketing|consumer.*safety|sustainable.*consumption|dispute.*resolution)/i,
                mandatory: false
            },
            {
                id: 'ISO_26000_6.8',
                title: 'Community involvement and development',
                pattern: /(community|involvement|development|investment|employment|technology|wealth|creation|education|culture|health)/i,
                mandatory: true
            }
        ]
    },
    'ISO_37001': {
        name: 'ISO 37001 - Anti-bribery Management Systems',
        domain: 'G',
        requirements: [
            {
                id: 'ISO_37001_4.1',
                title: 'Understanding the organization and its context',
                pattern: /(understanding|context|organization|external.*internal.*factors|bribery.*risks)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_4.2',
                title: 'Understanding the needs and expectations of interested parties',
                pattern: /(interested.*parties|stakeholders|expectations|needs|requirements|bribery.*prevention)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_4.3',
                title: 'Determining the scope of the anti-bribery management system',
                pattern: /(scope|anti.*bribery|management.*system|boundaries|applicability)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_4.4',
                title: 'Anti-bribery management system',
                pattern: /(anti.*bribery|management.*system|ABMS|establish|implement|maintain|continual.*improvement)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_5.1',
                title: 'Leadership and commitment',
                pattern: /(leadership|commitment|top.*management|anti.*bribery.*policy|accountability)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_5.2',
                title: 'Anti-bribery policy',
                pattern: /(anti.*bribery.*policy|policy|bribery|zero.*tolerance|commitment.*prevention)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_5.3',
                title: 'Organizational roles, responsibilities and authorities',
                pattern: /(roles|responsibilities|authorities|organizational.*structure|anti.*bribery.*responsibilities|compliance.*officer)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_6.1',
                title: 'Actions to address risks and opportunities',
                pattern: /(risks|opportunities|bribery.*risks|risk.*assessment|risk.*analysis)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_6.2',
                title: 'Bribery risk assessment',
                pattern: /(bribery.*risk|assessment|analysis|identification|evaluation|likelihood|impact)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_6.3',
                title: 'Anti-bribery objectives and planning to achieve them',
                pattern: /(anti.*bribery.*objectives|objectives|targets|planning|measurable|monitoring|review)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_7.1',
                title: 'Resources',
                pattern: /(resources|personnel|infrastructure|competence|awareness|communication|financial.*resources)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_7.2',
                title: 'Competence',
                pattern: /(competence|training|education|skills|knowledge|awareness|qualifications|anti.*bribery.*training)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_7.3',
                title: 'Awareness',
                pattern: /(awareness|anti.*bribery.*policy|bribery.*risks|roles|responsibilities|consequences)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_7.4',
                title: 'Communication',
                pattern: /(communication|internal.*communication|external.*communication|whistleblowing|reporting.*mechanism)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_7.5',
                title: 'Documented information',
                pattern: /(documented.*information|documents|records|control.*documents|documentation|anti.*bribery.*procedures)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.1',
                title: 'Operational planning and control',
                pattern: /(operational.*planning|control|processes|operational.*controls|procedures|due.*diligence)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.2',
                title: 'Due diligence',
                pattern: /(due.*diligence|diligence|business.*partners|associates|third.*parties|screening|assessment)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.3',
                title: 'Controls',
                pattern: /(controls|financial.*controls|non.*financial.*controls|gifts|hospitality|sponsorships|donations|facilitation.*payments)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.4',
                title: 'Implemented business relationships',
                pattern: /(business.*relationships|contracts|agreements|terms.*conditions|monitoring|review)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.5',
                title: 'Raising concerns',
                pattern: /(raising.*concerns|whistleblowing|reporting|concerns|suspected.*bribery|protection|confidentiality)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_8.6',
                title: 'Investigation process',
                pattern: /(investigation|process|suspected.*bribery|allegations|evidence|documentation|disciplinary.*action)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_9.1',
                title: 'Monitoring, measurement, analysis and evaluation',
                pattern: /(monitoring|measurement|analysis|evaluation|performance|indicators|metrics|compliance)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_9.2',
                title: 'Internal audit',
                pattern: /(internal.*audit|audit.*program|audit.*plan|audit.*criteria|auditors|independence)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_9.3',
                title: 'Management review',
                pattern: /(management.*review|review.*meeting|top.*management|review.*input|review.*output)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_10.1',
                title: 'Nonconformity and corrective action',
                pattern: /(nonconformity|non.*conformity|corrective.*action|preventive.*action|root.*cause|recurrence)/i,
                mandatory: true
            },
            {
                id: 'ISO_37001_10.2',
                title: 'Continual improvement',
                pattern: /(continual.*improvement|improvement|enhancement|better.*performance|effectiveness)/i,
                mandatory: true
            }
        ]
    }
};

// ==================== ISO STANDARDS COMPLIANCE CHECKING ====================

/**
 * Match document against applicable ISO standards based on ESG domain
 * @param {string} text - Full document text
 * @param {Array} domains - ESG domains (['E', 'S', 'G'])
 * @returns {Object} Compliance analysis results
 */
function matchDocumentAgainstISOStandards(text, domains) {
    const content = text.toLowerCase();
    const results = {
        applicableStandards: [],
        complianceResults: {},
        coveragePercent: 0,
        totalRequirements: 0,
        coveredRequirements: 0
    };
    
    // Determine applicable standards based on domains
    const standardMapping = {
        'E': ['ISO_14001'],
        'S': ['ISO_26000'],
        'G': ['ISO_37001']
    };
    
    const applicableStandards = [];
    domains.forEach(domain => {
        if (standardMapping[domain]) {
            applicableStandards.push(...standardMapping[domain]);
        }
    });
    
    results.applicableStandards = applicableStandards;
    
    // Process each applicable standard
    applicableStandards.forEach(standardKey => {
        const standard = ISO_STANDARDS[standardKey];
        if (!standard) return;
        
        const standardResults = {
            standardId: standardKey,
            standardName: standard.name,
            requirements: [],
            coveragePercent: 0,
            totalMandatory: 0,
            coveredMandatory: 0
        };
        
        // Process each requirement
        standard.requirements.forEach(req => {
            const requirementResult = {
                requirementId: req.id,
                title: req.title,
                status: 'not_found',
                textFragments: [],
                mandatory: req.mandatory
            };
            
            // Search for pattern matches
            const matches = [];
            let match;
            const regex = new RegExp(req.pattern.source, 'gi');
            
            while ((match = regex.exec(text)) !== null) {
                const matchIndex = match.index;
                const matchText = match[0];
                
                // Extract context (50 characters before and after)
                const contextStart = Math.max(0, matchIndex - 50);
                const contextEnd = Math.min(text.length, matchIndex + matchText.length + 50);
                const context = text.substring(contextStart, contextEnd);
                
                matches.push({
                    text: matchText,
                    context: context,
                    position: matchIndex
                });
            }
            
            if (matches.length > 0) {
                requirementResult.textFragments = matches.slice(0, 5); // Limit to 5 fragments
                
                // Determine status based on content analysis
                const combinedText = matches.map(m => m.text + ' ' + m.context).join(' ').toLowerCase();
                
                // Check for quantitative data (numbers, percentages, dates)
                const hasQuantitativeData = /\d+/.test(combinedText) || 
                    /(\d+%|\d+\s*(tonnes?|kg|kwh|mwh|co2|emissions?|reduction|increase|target|goal|objective))/i.test(combinedText);
                
                // Check for negative indicators
                const negativeIndicators = /(not|no|lack|absence|missing|without|fail|failure|non.*compliant|does.*not|did.*not|will.*not)/i;
                const hasNegative = negativeIndicators.test(combinedText);
                
                // Check for strong positive indicators
                const positiveIndicators = /(implemented|established|achieved|completed|verified|audited|certified|compliant|meets|satisfies|fulfills|in.*place|active|operational)/i;
                const hasPositive = positiveIndicators.test(combinedText);
                
                if (hasNegative && !hasPositive) {
                    requirementResult.status = 'non_compliant';
                } else if (hasQuantitativeData && hasPositive) {
                    requirementResult.status = 'compliant';
                } else if (hasPositive || matches.length >= 2) {
                    requirementResult.status = 'partial';
                } else {
                    requirementResult.status = 'partial'; // Mention found but weak evidence
                }
            } else {
                requirementResult.status = 'not_found';
            }
            
            standardResults.requirements.push(requirementResult);
            
            // Count mandatory requirements
            if (req.mandatory) {
                standardResults.totalMandatory++;
                if (requirementResult.status === 'compliant' || requirementResult.status === 'partial') {
                    standardResults.coveredMandatory++;
                }
            }
        });
        
        // Calculate coverage for this standard
        const totalMandatory = standardResults.totalMandatory;
        const coveredMandatory = standardResults.coveredMandatory;
        standardResults.coveragePercent = totalMandatory > 0 
            ? Math.round((coveredMandatory / totalMandatory) * 100) 
            : 0;
        
        results.complianceResults[standardKey] = standardResults;
        results.totalRequirements += totalMandatory;
        results.coveredRequirements += coveredMandatory;
    });
    
    // Calculate overall coverage
    results.coveragePercent = results.totalRequirements > 0
        ? Math.round((results.coveredRequirements / results.totalRequirements) * 100)
        : 0;
    
    return results;
}

// OpenAI API proxy endpoint
app.post('/api/openai', async (req, res) => {
    try {
        const { prompt, level, language, type = 'text-selection' } = req.body;
        
        if (!OPENAI_API_KEY) {
            // Fallback response when no API key
            const fallbackResponse = generateFallbackResponse(level, language, type);
            return res.json(fallbackResponse);
        }
        
        let systemPrompt, userPrompt;
        
        if (type === 'text-selection') {
            systemPrompt = `You are an AI assistant that selects text variants for ESG reports. 
            For each stage (summary, nextSteps, cta, premiumTeaser), select one variant (A, B, or C) based on the ESG level and language.
            
            Return ONLY a JSON object with this exact structure:
            {
                "summary": "A",
                "nextSteps": "B", 
                "cta": "C",
                "premiumTeaser": "A"
            }
            
            Each value must be exactly "A", "B", or "C". No other text or explanation.`;
            
            userPrompt = `ESG Level: ${level}, Language: ${language}. Select appropriate text variants.`;
        } else if (type === 'content-generation') {
            systemPrompt = `You are an AI assistant that generates ESG report content. 
            Generate professional, accurate content based on the provided context and requirements.`;
            userPrompt = prompt || `Generate ESG content for level: ${level}, language: ${language}`;
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: type === 'text-selection' ? 100 : 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const openaiResult = await response.json();
        res.json(openaiResult);
    } catch (error) {
        // Return fallback response on error
        const fallbackResponse = generateFallbackResponse(req.body.level, req.body.language, req.body.type);
        res.json(fallbackResponse);
    }
});

// Generate ESG report content
app.post('/api/generate-esg-content', async (req, res) => {
    try {
        const { level, language, companyName, industry } = req.body;
        
        if (!OPENAI_API_KEY) {
            return res.json(generateFallbackESGContent(level, language, companyName, industry));
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: `You are an ESG expert that generates comprehensive ESG reports. 
                        Create professional, data-driven content appropriate for the specified ESG level and language.`
                    },
                    {
                        role: 'user',
                        content: `Generate an ESG report for:
                        - Company: ${companyName || 'Sample Company'}
                        - Industry: ${industry || 'Technology'}
                        - ESG Level: ${level}
                        - Language: ${language}
                        
                        Include sections for Environmental, Social, and Governance factors with specific metrics and recommendations.`
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        const esgContent = await response.json();
        res.json(esgContent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate ESG content' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        apiKeyConfigured: !!OPENAI_API_KEY,
        timestamp: new Date().toISOString()
    });
});

// Config endpoint for frontend
app.get('/api/config', (req, res) => {
    res.json({
        enableTestMode: process.env.ENABLE_TEST_MODE === 'true'
    });
});

// Simple cache for comment recommendations (to avoid duplicate API calls)
const commentCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get AI recommendation for user comment
app.post('/api/comment-recommendation', async (req, res) => {
    try {
        const { comment, language } = req.body;
        
        if (!comment || !comment.trim()) {
            return res.json({
                choices: [{
                    message: {
                        content: language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.'
                    }
                }]
            });
        }
        
        // Check cache first
        const cacheKey = `${comment.trim().toLowerCase()}_${language || 'en'}`;
        const cached = commentCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return res.json(cached.data);
        }
        
        if (!OPENAI_API_KEY) {
            // Fallback response
            const fallbackMessage = language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
            const fallbackResponse = {
                choices: [{
                    message: {
                        content: fallbackMessage
                    }
                }]
            };
            return res.json(fallbackResponse);
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };
        
        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }
        
        // Detect language from comment if not provided
        const detectedLanguage = language || detectCommentLanguage(comment);
        const isPolish = detectedLanguage === 'pl';
        
        const systemPrompt = `You are an ESG expert AI assistant. Your task is to provide concise, focused recommendations for user comments related to ESG (Environmental, Social, and Governance) topics.

CRITICAL RULES:
1. You MUST respond in the SAME language the user wrote in (${isPolish ? 'Polish' : 'English'}).
2. If the user's comment is nonsense, off-topic, or not related to ESG, you MUST respond with EXACTLY one of these phrases:
   - In English: "There are no recommendations for this message."
   - In Polish: "Brak rekomendacji dla tej wiadomości."
3. If the comment IS related to ESG, provide a SHORT, CONCISE answer (2-4 sentences maximum, 50-100 words).
4. Focus ONLY on the specific ESG topic mentioned. Be direct and actionable.
5. Do NOT provide lengthy explanations or multiple paragraphs. Keep it brief and to the point.
6. Focus on ESG topics: environmental impact, social responsibility, governance, sustainability, corporate responsibility, etc.

LENGTH REQUIREMENT:
- Maximum 100 words
- 2-4 sentences
- No bullet points unless absolutely necessary
- Get straight to the point

Examples of nonsense/off-topic comments:
- Random characters: "ggggg", "asdf", "12345"
- Completely unrelated topics: "What's the weather?", "How to cook pasta?"
- Empty or meaningless text

Examples of valid ESG comments and expected response length:
- "How can we reduce our carbon footprint?" → Short answer (2-3 sentences) about carbon reduction strategies
- "What are best practices for diversity and inclusion?" → Brief answer (2-3 sentences) about key DEI practices
- "How do we implement ESG reporting?" → Concise answer (2-3 sentences) about ESG reporting steps`;

        const userPrompt = `User comment: "${comment}"

${isPolish ? 'Odpowiedz po polsku KROTKO i konkretnie (2-4 zdania, maksymalnie 100 słów). Jeśli komentarz jest bezsensowny lub nie dotyczy ESG, odpowiedz dokładnie: "Brak rekomendacji dla tej wiadomości."' : 'Respond in English BRIEFLY and concisely (2-4 sentences, maximum 100 words). If the comment is nonsense or not related to ESG, respond exactly: "There are no recommendations for this message."'}`;

        // Retry logic for rate limiting (429 errors)
        let retries = 3;
        let delay = 1000; // Start with 1 second delay
        let lastError;
        
        while (retries > 0) {
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        max_tokens: 150,
                        temperature: 0.7
                    })
                });

                if (response.status === 429) {
                    // Rate limited - wait and retry
                    const retryAfter = response.headers.get('Retry-After');
                    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay;
                    
                    console.warn(`Rate limited (429). Waiting ${waitTime}ms before retry. Retries left: ${retries - 1}`);
                    
                    if (retries > 1) {
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        delay *= 2; // Exponential backoff
                        retries--;
                        continue;
                    } else {
                        throw new Error('Rate limit exceeded. Please try again later.');
                    }
                }

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
                }

                const aiResult = await response.json();
                
                // Cache the result
                commentCache.set(cacheKey, {
                    data: aiResult,
                    timestamp: Date.now()
                });
                
                // Clean old cache entries (keep cache size manageable)
                if (commentCache.size > 100) {
                    const oldestKey = Array.from(commentCache.keys())[0];
                    commentCache.delete(oldestKey);
                }
                
                res.json(aiResult);
                return;
                
            } catch (error) {
                lastError = error;
                if (error.message.includes('Rate limit') && retries > 1) {
                    retries--;
                    continue;
                }
                throw error;
            }
        }
        
        throw lastError || new Error('Failed to get AI recommendation after retries');
        
    } catch (error) {
        console.error('Comment recommendation error:', error);
        const fallbackMessage = req.body.language === 'pl' ? 'Brak rekomendacji dla tej wiadomości.' : 'There are no recommendations for this message.';
        res.json({
            choices: [{
                message: {
                    content: fallbackMessage
                }
            }]
        });
    }
});

// Helper function to detect comment language
function detectCommentLanguage(comment) {
    // Simple detection: check for Polish-specific characters
    const polishChars = /[ąćęłńóśźż]/i;
    if (polishChars.test(comment)) {
        return 'pl';
    }
    // Default to English
    return 'en';
}

// Get ESG text variants
app.post('/api/esg-variants', async (req, res) => {
    try {
        const { level, language } = req.body;
        
        if (!OPENAI_API_KEY) {
            const fallbackResponse = generateFallbackResponse(level, language, 'text-selection');
            return res.json(fallbackResponse);
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI assistant that selects text variants for ESG reports. 
                        For each stage (summary, nextSteps, cta, premiumTeaser), select one variant (A, B, or C) based on the ESG level and language.
                        
                        Return ONLY a JSON object with this exact structure:
                        {
                            "summary": "A",
                            "nextSteps": "B", 
                            "cta": "C",
                            "premiumTeaser": "A"
                        }
                        
                        Each value must be exactly "A", "B", or "C". No other text or explanation.`
                    },
                    {
                        role: 'user',
                        content: `ESG Level: ${level}, Language: ${language}. Select appropriate text variants.`
                    }
                ],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const variantsResult = await response.json();
        res.json(variantsResult);
    } catch (error) {
        console.error('⚠️  OpenAI API error:', error.message);
        const fallbackResponse = generateFallbackResponse(req.body.level, req.body.language, 'text-selection');
        res.json(fallbackResponse);
    }
});

// Generate PDF content
app.post('/api/generate-pdf-content', async (req, res) => {
    try {
        const { level, language, companyName, industry, customData } = req.body;
        
        if (!OPENAI_API_KEY) {
            return res.json(generateFallbackPDFContent(level, language, companyName, industry));
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: `You are an ESG expert that generates comprehensive PDF report content. 
                        Create professional, structured content for ESG reports with specific sections and metrics.`
                    },
                    {
                        role: 'user',
                        content: `Generate PDF content for ESG report:
                        - Company: ${companyName || 'Sample Company'}
                        - Industry: ${industry || 'Technology'}
                        - ESG Level: ${level}
                        - Language: ${language}
                        - Custom Data: ${JSON.stringify(customData || {})}
                        
                        Include:
                        1. Executive Summary
                        2. Environmental Impact
                        3. Social Responsibility
                        4. Governance Structure
                        5. Key Metrics and KPIs
                        6. Recommendations
                        7. Next Steps
                        
                        Format as structured JSON with sections and content.`
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        const pdfContent = await response.json();
        res.json(pdfContent);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate PDF content' });
    }
});

// Analyze ESG data
app.post('/api/analyze-esg-data', async (req, res) => {
    try {
        const { data, level, language } = req.body;
        
        if (!OPENAI_API_KEY) {
            return res.json(generateFallbackAnalysis(data, level, language));
        }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };

        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: `You are an ESG data analyst. Analyze the provided ESG data and provide insights, recommendations, and scoring.`
                    },
                    {
                        role: 'user',
                        content: `Analyze this ESG data:
                        Level: ${level}
                        Language: ${language}
                        Data: ${JSON.stringify(data)}
                        
                        Provide:
                        1. Overall ESG Score (1-100)
                        2. Strengths and Weaknesses
                        3. Key Recommendations
                        4. Priority Actions
                        5. Risk Assessment`
                    }
                ],
                max_tokens: 800,
                temperature: 0.6
            })
        });

        const analysisResult = await response.json();
        res.json(analysisResult);
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze ESG data' });
    }
});

// Save ISO compliance results to database
async function saveISOComplianceResults(documentId, benchmarkId, isoComplianceResults, fullText, structuredContent) {
    const client = await getClient();
    try {
        await client.query('BEGIN');
        
        // Save compliance results for each standard
        for (const [standardKey, standardResult] of Object.entries(isoComplianceResults.complianceResults)) {
            // Insert compliance result
            const complianceResult = await client.query(
                `INSERT INTO iso_compliance_results 
                 (document_id, benchmark_id, standard_id, standard_name, coverage_percent, 
                  total_mandatory_requirements, covered_mandatory_requirements, applicable_standards)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id`,
                [
                    documentId,
                    benchmarkId,
                    standardKey,
                    standardResult.standardName,
                    standardResult.coveragePercent,
                    standardResult.totalMandatory,
                    standardResult.coveredMandatory,
                    isoComplianceResults.applicableStandards
                ]
            );
            
            const complianceResultId = complianceResult.rows[0].id;
            
            // Insert requirement compliance details
            for (const requirement of standardResult.requirements) {
                await client.query(
                    `INSERT INTO iso_requirement_compliance 
                     (compliance_result_id, requirement_id, requirement_title, status, mandatory, text_fragments)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        complianceResultId,
                        requirement.requirementId,
                        requirement.title,
                        requirement.status,
                        requirement.mandatory,
                        JSON.stringify(requirement.textFragments)
                    ]
                );
            }
        }
        
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error saving ISO compliance results:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Analyze ESG document endpoint (for benchmark question 8)
app.post('/api/analyze-esg-document', async (req, res) => {
    try {
        const { documentFile, language = 'en', benchmarkId = null, sessionId = null } = req.body;
        
        if (!documentFile || !documentFile.data) {
            return res.status(400).json({ 
                error: 'Document file is required',
                message: language === 'pl' ? 'Plik dokumentu jest wymagany' : 'Document file is required'
            });
        }
        
        // Extract full text
        const fullText = await extractDocumentContent(documentFile);
        
        // Extract structured content (tables)
        const structuredContent = await extractStructuredContent(documentFile);
        
        // Classify ESG domain
        const classification = classifyESGDomain(fullText);
        
        // If AI is available, enhance classification with AI
        let enhancedClassification = classification;
        if (OPENAI_API_KEY) {
            try {
                const headers = {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                };
                
                if (USE_OPENROUTER) {
                    headers['HTTP-Referer'] = 'https://esgsyncpro.com';
                    headers['X-Title'] = 'ESG Sync PRO';
                }
                
                const isPolish = language === 'pl';
                const systemPrompt = `You are an ESG expert. Analyze the provided document text and determine its primary ESG domain(s): Environmental (E), Social (S), Governance (G), or combinations.

Return ONLY a JSON object with this exact structure:
{
    "domains": ["E", "S"],
    "confidence": "high",
    "explanation": "Brief explanation in ${isPolish ? 'Polish' : 'English'}"
}

Domains should be an array of one or more of: "E", "S", "G".
Confidence should be "high", "medium", or "low".
Explanation should be 1-2 sentences explaining why these domains were identified.`;

                const userPrompt = `Document text (first 5000 characters):
${fullText.substring(0, 5000)}

${isPolish ? 'Przeanalizuj dokument i określ jego główne domeny ESG (E, S, G). Odpowiedz TYLKO w formacie JSON.' : 'Analyze the document and determine its primary ESG domains (E, S, G). Return ONLY JSON format.'}`;

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        max_tokens: 200,
                        temperature: 0.3
                    })
                });

                if (response.ok) {
                    const aiResult = await response.json();
                    const content = aiResult.choices?.[0]?.message?.content;
                    
                    if (content) {
                        try {
                            // Try to extract JSON from markdown if present
                            let jsonContent = content;
                            if (content.includes('```json')) {
                                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                                if (jsonMatch) jsonContent = jsonMatch[1];
                            } else if (content.includes('```')) {
                                const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
                                if (jsonMatch) jsonContent = jsonMatch[1];
                            }
                            
                            const aiClassification = JSON.parse(jsonContent);
                            
                            // Merge AI classification with keyword-based classification
                            enhancedClassification = {
                                domains: aiClassification.domains || classification.domains,
                                scores: classification.scores,
                                confidence: aiClassification.confidence || classification.confidence,
                                explanation: aiClassification.explanation || null,
                                method: 'ai-enhanced'
                            };
                        } catch (parseError) {
                            // If AI response is not valid JSON, use keyword-based classification
                            enhancedClassification.method = 'keyword-based';
                        }
                    }
                }
            } catch (aiError) {
                console.error('AI classification error:', aiError);
                // Fall back to keyword-based classification
                enhancedClassification.method = 'keyword-based';
            }
        } else {
            enhancedClassification.method = 'keyword-based';
        }
        
        // Match document against ISO standards
        const domains = enhancedClassification.domains.filter(d => d !== 'Unknown');
        const isoComplianceResults = matchDocumentAgainstISOStandards(fullText, domains);
        
        // Save document and results to database if benchmarkId or sessionId provided
        let documentId = null;
        if (benchmarkId || sessionId) {
            try {
                // Save document
                const docResult = await query(
                    `INSERT INTO esg_documents 
                     (document_name, file_type, file_size, uploaded_by_session_id, benchmark_id, 
                      esg_domains, full_text, text_length, tables_count)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     RETURNING id`,
                    [
                        documentFile.name || 'Unknown',
                        documentFile.type || 'Unknown',
                        documentFile.size || 0,
                        sessionId,
                        benchmarkId,
                        domains,
                        fullText.substring(0, 100000), // Limit stored text to 100KB
                        fullText.length,
                        structuredContent.tables.length
                    ]
                );
                
                documentId = docResult.rows[0].id;
                
                // Save ISO compliance results
                await saveISOComplianceResults(documentId, benchmarkId, isoComplianceResults, fullText, structuredContent);
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Continue even if DB save fails
            }
        }
        
        // Prepare response
        const result = {
            success: true,
            documentId: documentId,
            documentName: documentFile.name || 'Unknown',
            fileType: documentFile.type || 'Unknown',
            fullText: fullText.substring(0, 10000), // Limit text length in response
            textLength: fullText.length,
            structuredContent: {
                tablesCount: structuredContent.tables.length,
                tables: structuredContent.tables.slice(0, 10), // Limit to first 10 tables
                hasTables: structuredContent.tables.length > 0
            },
            esgClassification: enhancedClassification,
            isoCompliance: {
                applicableStandards: isoComplianceResults.applicableStandards,
                complianceResults: isoComplianceResults.complianceResults,
                coveragePercent: isoComplianceResults.coveragePercent,
                totalRequirements: isoComplianceResults.totalRequirements,
                coveredRequirements: isoComplianceResults.coveredRequirements
            },
            extractedAt: new Date().toISOString()
        };
        
        res.json(result);
        
    } catch (error) {
        console.error('ESG document analysis error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to analyze ESG document',
            details: error.message
        });
    }
});

// Document verification endpoint
app.post('/api/verify-documents', async (req, res) => {
    try {
        const { formData, language = 'pl' } = req.body;
        
        if (!OPENAI_API_KEY) {
            const fallbackResult = await generateFallbackDocumentVerification(formData, language);
            return res.json({
                success: true,
                documentVerifications: fallbackResult
            });
        }
        
        // Extract document verification data from form data
        const documentVerifications = await processDocumentVerifications(formData, language);
        
        // Process each document verification separately to avoid confusion
        const verificationResults = [];
        
        for (const verification of documentVerifications) {
            
            // Add small delay between requests to ensure complete isolation
            if (verificationResults.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        
        const headers = {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        };
        
        if (USE_OPENROUTER) {
            headers['HTTP-Referer'] = 'https://esgsyncpro.com';
            headers['X-Title'] = 'ESG Sync PRO';
        }
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                            content: `You are an expert ESG document verification specialist. Your task is to analyze ONE specific document and compare it with ONE specific user survey response to determine accuracy and consistency.

                            ANALYSIS ID: ${verification.questionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}
                            RANDOM CONTEXT: ${Math.random().toString(36).substr(2, 15)}
                            LANGUAGE: ${language === 'pl' ? 'Polish' : 'English'}
                            
                            CRITICAL: This is a SINGLE, INDEPENDENT analysis. Do NOT consider any other documents or questions. Focus ONLY on the specific document and question provided.
                            
                            LANGUAGE REQUIREMENT: You MUST respond in ${language === 'pl' ? 'Polish' : 'English'}. All text in your response must be in ${language === 'pl' ? 'Polish' : 'English'}.
                            
                            IMPORTANT: This analysis is completely isolated from any other analyses. Do NOT be influenced by:
                            - Previous document analyses
                            - Other questions in the survey
                            - Patterns from other documents
                            - Any external context
                            
                            Make your decision based ONLY on the content of THIS specific document and THIS specific question.

                            ANALYSIS PROCESS:
                            1. Read ONLY the provided document content
                            2. Focus ONLY on the specific question being asked
                            3. Compare ONLY what the user answered vs what THIS document contains
                            4. Make an INDEPENDENT decision based ONLY on this document

                            IMPORTANT: Return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text.

                            Return ONLY a JSON object with this exact structure:
                            {
                                "questionId": "question_identifier",
                                "userAnswer": "${language === 'pl' ? 'Odpowiedź użytkownika' : 'User\'s response'}",
                                "documentInfo": "${language === 'pl' ? 'Szczegółowy opis tego, co zawiera TEN KONKRETNY dokument dotyczący tego konkretnego pytania' : 'Detailed description of what THIS SPECIFIC document contains regarding this specific question'}",
                                "isConsistent": true,
                                "suggestedCorrection": null,
                                "documentName": "${language === 'pl' ? 'Nazwa pliku dokumentu' : 'Name of the document file'}"
                            }

                        CONSISTENCY DETERMINATION RULES:

                        ✅ CONSISTENT (isConsistent: true):
                        - Document contains clear evidence supporting the user's answer
                        - For "Yes" answers: Document shows implementation, policies, or evidence
                        - For "No" answers: Document shows absence or explicit statement of non-implementation
                        - For "Partial" answers: Document shows incomplete or ongoing implementation
                        - For "In Progress" answers: Document shows work in progress or planning stages

                        ❌ INCONSISTENT (isConsistent: false):
                        - Document contradicts the user's answer
                        - Document shows opposite of what user claimed
                        - User said "Yes" but document shows no evidence or explicit "No"
                        - User said "No" but document shows clear evidence of "Yes"
                        - User said "Partial" but document shows full implementation
                        - User said "In Progress" but document shows completed work

                        📋 NO RELEVANT INFORMATION (isConsistent: false):
                        - Document contains no information about the specific question
                        - Document discusses other topics but not the question asked
                        - Document is too vague or general to determine relevance

                        CORRECTION SUGGESTIONS:
                        - Be specific about what the document actually shows
                        - Suggest the most accurate answer based on document content
                        - Explain why the current answer doesn't match the document
                        - Use clear, actionable language

                        ANALYSIS QUALITY STANDARDS:
                        - Be thorough but focused on the specific question
                        - Quote or reference specific parts of the document when possible
                        - Distinguish between "no information" and "contradictory information"
                        - Consider the context and completeness of information
                            - Provide detailed explanations for your decisions

                        ${language === 'pl' ? `
                        PRZYKŁADY ODPOWIEDZI W JĘZYKU POLSKIM:
                        
                        ✅ SPÓJNE (isConsistent: true):
                        - "Dokument zawiera jasne dowody potwierdzające odpowiedź użytkownika"
                        - "Dokument pokazuje wdrożenie polityki monitorowania zużycia energii"
                        - "Dokument potwierdza brak implementacji zgodnie z odpowiedzią użytkownika"
                        
                        ❌ NIESPÓJNE (isConsistent: false):
                        - "Dokument zawiera informacje sprzeczne z odpowiedzią użytkownika"
                        - "Użytkownik odpowiedział 'Tak', ale dokument nie zawiera żadnych dowodów"
                        - "Użytkownik odpowiedział 'Nie', ale dokument pokazuje jasne dowody implementacji"
                        
                        📋 BRAK ISTOTNYCH INFORMACJI (isConsistent: false):
                        - "Dokument nie zawiera żadnych istotnych informacji dotyczących tego konkretnego pytania"
                        - "Dokument omawia inne tematy, ale nie to konkretne pytanie"
                        - "Dokument jest zbyt ogólny lub niejasny, aby określić spójność"
                        
                        SUGESTIE KOREKCJI:
                        - "Użytkownik powinien rozważyć zmianę odpowiedzi na 'Nie' ponieważ dokument nie zawiera żadnych dowodów"
                        - "Na podstawie dokumentu odpowiedź powinna być 'Tak'"
                        - "Brak informacji w dokumencie na ten temat"
                        ` : ''}

                            RESPONSE FORMAT: Return ONLY the JSON object, no additional text or formatting.`
                    },
                    {
                        role: 'user',
                            content: `ANALYZE THIS SINGLE DOCUMENT-ANSWER PAIR INDEPENDENTLY:
                            
                            ANALYSIS CONTEXT: ${Math.random().toString(36).substr(2, 20)}
                        Language: ${language}
                            Question: ${verification.questionText}
                            User Answer: ${verification.userAnswer}
                            Document Name: ${verification.documentName}
                            Document Content: ${verification.documentContent}
                            
                            ${language === 'pl' ? 'WAŻNE: Odpowiadaj TYLKO w języku polskim. Wszystkie teksty w Twojej odpowiedzi muszą być w języku polskim.' : 'IMPORTANT: Respond ONLY in English. All text in your response must be in English.'}
                            
                            CRITICAL INSTRUCTIONS:
                            1. This is an INDEPENDENT analysis - ignore any other documents or questions
                            2. Focus ONLY on THIS specific document and THIS specific question
                            3. Read the document content carefully and look for specific information related to THIS question
                            4. Compare what the user answered vs what THIS document actually says
                            5. Make your decision based ONLY on what you find in THIS document
                            6. Do NOT be influenced by any other documents or previous analyses
                            
                            DECISION RULES FOR THIS DOCUMENT ONLY:
                            - If THIS document contains information that supports the user's answer → CONSISTENT
                            - If THIS document contains information that contradicts the user's answer → INCONSISTENT  
                            - If THIS document contains no relevant information about the question → INCONSISTENT (no relevant info)
                            
                            ${language === 'pl' ? `
                            Przykład analizy dla TEGO dokumentu:
                            - Użytkownik odpowiedział "Tak" i TEN dokument mówi "Monitorujemy zużycie energii codziennie" → SPÓJNE
                            - Użytkownik odpowiedział "Nie" ale TEN dokument mówi "Wdrożyliśmy monitoring energii" → NIESPÓJNE
                            - Użytkownik odpowiedział "Tak" ale TEN dokument mówi tylko o innych tematach → NIESPÓJNE (brak istotnych informacji)
                            
                            Pamiętaj: Analizuj TYLKO ten dokument, ignoruj wszystko inne.
                            ` : `
                            Example analysis for THIS document:
                            - User answered "Yes" and THIS document says "We monitor energy consumption daily" → CONSISTENT
                            - User answered "No" but THIS document says "We have implemented energy monitoring" → INCONSISTENT
                            - User answered "Yes" but THIS document only talks about other topics → INCONSISTENT (no relevant info)
                            
                            Remember: Analyze ONLY this document, ignore everything else.
                            `}`
                        }
                    ],
                    max_tokens: 1000,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const verificationResult = await response.json();
        
            // Parse AI response for this single verification
        try {
            const content = verificationResult.choices?.[0]?.message?.content;
                
                // Try to extract JSON from markdown code blocks if present
                let jsonContent = content;
                if (content.includes('```json')) {
                    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch) {
                        jsonContent = jsonMatch[1];
                    }
                } else if (content.includes('```')) {
                    const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
                    if (jsonMatch) {
                        jsonContent = jsonMatch[1];
                    }
                }
                
                const singleVerification = JSON.parse(jsonContent);
                
                // Use the original verification data but update with AI analysis
                const result = {
                    questionId: verification.questionId,
                    questionText: verification.questionText,
                    userAnswer: verification.userAnswer,
                    documentInfo: singleVerification.documentInfo || 'Analysis completed',
                    isConsistent: singleVerification.isConsistent || false,
                    suggestedCorrection: singleVerification.suggestedCorrection || null,
                    documentName: verification.documentName
                };
                
                verificationResults.push(result);
                
        } catch (e) {
                // AI response not valid JSON, using fallback analysis
                
                // Use fallback analysis for this single verification
                const fallbackAnalysis = analyzeDocumentContent(
                    verification.documentContent, 
                    verification.questionId, 
                    verification.userAnswer, 
                    language
                );
                
                const result = {
                    questionId: verification.questionId,
                    questionText: verification.questionText,
                    userAnswer: verification.userAnswer,
                    documentInfo: fallbackAnalysis.documentInfo,
                    isConsistent: fallbackAnalysis.isConsistent,
                    suggestedCorrection: fallbackAnalysis.suggestedCorrection,
                    documentName: verification.documentName
                };
                
                verificationResults.push(result);
            }
        }
        
        res.json({
            success: true,
            documentVerifications: verificationResults
        });
    } catch (error) {
        console.error('Document verification error:', error);
        const fallbackResult = await generateFallbackDocumentVerification(req.body.formData, req.body.language);
        res.status(500).json({ 
            success: false,
            error: 'Failed to verify documents',
            documentVerifications: fallbackResult
        });
    }
});

// Replace AI-generated question IDs with correct ones based on actual file uploads
function replaceQuestionIdsWithCorrectOnes(verificationData, formData) {
    if (!Array.isArray(verificationData)) {
        return verificationData;
    }
    
    // Get the actual question IDs that have file uploads
    // Updated to new question IDs: G (9), S (9), E (11), SC (9), X (12)
    const actualQuestionIds = [];
    const questionIds = [
        // Governance (G1-G9)
        'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9',
        // Social (S1-S9)
        's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
        // Environment (E1-E9, E4a, E5a)
        'e1', 'e2', 'e3', 'e4', 'e4a', 'e5', 'e5a', 'e6', 'e7', 'e8', 'e9',
        // Supply Chain (SC1-SC9)
        'sc1', 'sc2', 'sc3', 'sc4', 'sc5', 'sc6', 'sc7', 'sc8', 'sc9',
        // Extended (X1-X12)
        'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12'
    ];
    
    questionIds.forEach(questionId => {
        const checkboxId = `${questionId}_doc_check`;
        const filesInputId = `${questionId}_files`;
        
        if (formData[checkboxId] === 'on' && formData[filesInputId]) {
            actualQuestionIds.push(questionId);
        }
    });
    
    
    // Map AI-generated verifications to actual question IDs
    return verificationData.map((verification, index) => {
        const actualQuestionId = actualQuestionIds[index];
        
        if (actualQuestionId) {
            return {
                ...verification,
                questionId: actualQuestionId
            };
        }
        
        return verification;
    });
}

// Replace AI-generated document names with real user file names
function replaceDocumentNamesWithRealOnes(verificationData, formData) {
    if (!Array.isArray(verificationData)) {
        return verificationData;
    }
    
    return verificationData.map(verification => {
        const questionId = verification.questionId;
        const filesInputId = `${questionId}_files`;
        
        if (formData[filesInputId]) {
            const documentFiles = formData[filesInputId];
            const realDocumentName = Array.isArray(documentFiles) ? documentFiles[0].name : documentFiles.name || 'Unknown file';
            
            return {
                ...verification,
                documentName: realDocumentName
            };
        }
        
        return verification;
    });
}

// Add correct question texts from our data (AI doesn't generate questionText anymore)
function addCorrectQuestionTexts(verificationData, language) {
    if (!Array.isArray(verificationData)) {
        return verificationData;
    }
    
    const isPolish = language === 'pl';
    
    // Map of question IDs to their EXACT text from the survey (index.html)
    // Updated to new question structure from PDFs (49 questions total)
    const questionTexts = {
        // Governance (G) questions - 9 questions
        'g1': isPolish ? 'Czy w firmie jest jasno określone, kto podejmuje kluczowe decyzje i za jakie obszary odpowiada?' : 'Is it clearly defined who makes key decisions and is responsible for which areas?',
        'g2': isPolish ? 'Czy firma posiada podstawowe zasady lub reguły określające, jak prowadzi działalność?' : 'Does the company have basic principles or rules that define how it conducts business?',
        'g3': isPolish ? 'Czy firma dba o przestrzeganie obowiązujących przepisów i warunków umów?' : 'Does the company ensure compliance with applicable laws and contract terms?',
        'g4': isPolish ? 'Czy firma identyfikuje najważniejsze ryzyka i podejmuje działania, aby je ograniczać?' : 'Does the company identify the most important risks and take steps to mitigate them?',
        'g5': isPolish ? 'Czy firma prowadzi kontrolę finansową, taką jak prosty budżet lub śledzenie kosztów?' : 'Does the company maintain financial control, such as a simple budget or cost tracking?',
        'g6': isPolish ? 'Czy firma posiada procesy zapobiegające łapówkarstwu, korupcji lub konfliktom interesów?' : 'Does the company have processes to prevent bribery, corruption, or conflicts of interest?',
        'g7': isPolish ? 'Czy kierownictwo lub właściciel okresowo przegląda działalność firmy?' : 'Does management or the owner periodically review the company\'s performance?',
        'g8': isPolish ? 'Czy firma monitoruje kluczowe obszary, takie jak finanse, jakość, satysfakcja klientów?' : 'Does the company monitor key areas such as finance, quality, customer satisfaction?',
        'g9': isPolish ? 'Czy firma zbiera i przechowuje dokumenty niezbędne do jej funkcjonowania?' : 'Does the company collect and store documents essential for its operations?',

        // Social (S) questions - 9 questions
        's1': isPolish ? 'Czy firma zapewnia podstawowe bezpieczne i higieniczne warunki pracy?' : 'Does the company ensure basic safe and hygienic working conditions?',
        's2': isPolish ? 'Czy firma informuje pracowników o ich podstawowych prawach i zasadach pracy?' : 'Does the company inform employees about their basic rights and work rules?',
        's3': isPolish ? 'Czy firma posiada procedury, do których pracownicy mogą się zwrócić z problemami?' : 'Does the company have procedures employees can turn to with problems?',
        's4': isPolish ? 'Czy firma traktuje wszystkich pracowników sprawiedliwie?' : 'Does the company treat all employees fairly?',
        's5': isPolish ? 'Czy firma dba o rozwój swoich pracowników?' : 'Does the company take care of its employees\' development?',
        's6': isPolish ? 'Czy firma wspiera równowagę między życiem zawodowym a prywatnym?' : 'Does the company support work-life balance?',
        's7': isPolish ? 'Czy firma śledzi dane dotyczące swoich pracowników?' : 'Does the company track data related to its employees?',
        's8': isPolish ? 'Czy firma wypłaca wynagrodzenie na czas i zgodnie z prawem?' : 'Does the company pay remuneration on time and in accordance with law?',
        's9': isPolish ? 'Czy firma angażuje się w lokalną społeczność lub wspiera lokalne inicjatywy?' : 'Does the company engage with the local community or support local initiatives?',

        // Environment (E) questions - 11 questions
        'e1': isPolish ? 'Czy firma wie, jakie rodzaje energii zużywa i w przybliżeniu ile?' : 'Does the company know what types of energy it uses and approximately how much?',
        'e2': isPolish ? 'Czy firma stara się ograniczać zużycie energii?' : 'Does the company try to reduce energy consumption?',
        'e3': isPolish ? 'Czy firma segreguje odpady i utylizuje je zgodnie z przepisami?' : 'Does the company segregate waste and dispose of it in accordance with regulations?',
        'e4': isPolish ? 'Czy firma stara się zmniejszać ilość generowanych odpadów?' : 'Does the company try to reduce the amount of waste it generates?',
        'e4a': isPolish ? 'Czy firma wie, czy wytwarza odpady niebezpieczne?' : 'Does the company know if it generates hazardous waste?',
        'e5': isPolish ? 'Czy firma wykorzystuje wodę w swojej działalności?' : 'Does the company use water in its operations?',
        'e5a': isPolish ? 'Czy firma monitoruje zużycie wody lub stara się je ograniczać?' : 'Does the company monitor water consumption or try to reduce it?',
        'e6': isPolish ? 'Czy firma przestrzega podstawowych przepisów środowiskowych?' : 'Does the company comply with basic environmental regulations?',
        'e7': isPolish ? 'Czy firma minimalizuje swój negatywny wpływ na lokalne środowisko?' : 'Does the company minimize its negative impact on the local environment?',
        'e8': isPolish ? 'Czy firma korzysta z odnawialnych źródeł energii?' : 'Does the company use renewable energy sources?',
        'e9': isPolish ? 'Czy firma uwzględnia wpływ środowiskowy przy decyzjach zakupowych?' : 'Does the company consider environmental impact in purchase decisions?',

        // Supply Chain (SC) questions - 9 questions
        'sc1': isPolish ? 'Czy firma identyfikuje swoich kluczowych dostawców?' : 'Does the company identify its key suppliers?',
        'sc2': isPolish ? 'Czy firma posiada procedury wyboru nowych dostawców?' : 'Does the company have procedures for selecting new suppliers?',
        'sc3': isPolish ? 'Czy firma weryfikuje, czy dostawcy spełniają podstawowe standardy?' : 'Does the company verify whether suppliers meet basic standards?',
        'sc4': isPolish ? 'Czy firma posiada procedury reagowania na zakłócenia dostaw?' : 'Does the company have procedures for responding to supply disruptions?',
        'sc5': isPolish ? 'Czy firma monitoruje jakość produktów od dostawców?' : 'Does the company monitor the quality of products from suppliers?',
        'sc6': isPolish ? 'Czy firma utrzymuje regularną komunikację z kluczowymi dostawcami?' : 'Does the company maintain regular communication with key suppliers?',
        'sc7': isPolish ? 'Czy firma uwzględnia wpływ środowiskowy przy wyborze dostawców?' : 'Does the company consider environmental impact when choosing suppliers?',
        'sc8': isPolish ? 'Czy firma wie, jakie oczekiwania mają jej kluczowi klienci?' : 'Does the company know what expectations its key clients have?',
        'sc9': isPolish ? 'Czy firma wie, kim są jej podwykonawcy w łańcuchu dostaw?' : 'Does the company know who its subcontractors are in the supply chain?',

        // Extended (X) questions - 12 questions
        'x1': isPolish ? 'Czy wyznaczono osobę odpowiedzialną za koordynację zrównoważonego rozwoju?' : 'Has someone been designated to coordinate sustainability?',
        'x2': isPolish ? 'Czy firma określiła najważniejsze obszary z punktu widzenia ryzyk i wpływu?' : 'Has the company determined the most important areas in terms of risks and impact?',
        'x3': isPolish ? 'Czy działania firmy są spójne z określonymi priorytetami?' : 'Are the company\'s actions consistent with identified priorities?',
        'x4': isPolish ? 'Czy firma posiada określone cele dotyczące poprawy działalności?' : 'Does the company have defined goals for improving operations?',
        'x5': isPolish ? 'Czy firma monitoruje postępy realizacji swoich działań lub celów?' : 'Does the company monitor progress in implementing its actions or goals?',
        'x6': isPolish ? 'Czy dane są zbierane w sposób uporządkowany i możliwy do porównania?' : 'Is data collected in an organized and comparable manner?',
        'x7': isPolish ? 'Czy informacje są komunikowane wewnątrz firmy w jasny sposób?' : 'Is information communicated internally in a clear manner?',
        'x8': isPolish ? 'Czy firma posiada ustalone sposoby reagowania na problemy lub ryzyka?' : 'Does the company have established ways of responding to problems or risks?',
        'x9': isPolish ? 'Czy firma analizuje ryzyka związane z partnerami lub dostawcami?' : 'Does the company analyze risks related to partners or suppliers?',
        'x10': isPolish ? 'Czy firma jest przygotowana do odpowiadania na pytania klientów i partnerów?' : 'Is the company prepared to answer questions from clients and partners?',
        'x11': isPolish ? 'Czy informacje przekazywane na zewnątrz są spójne z działaniami?' : 'Is information communicated externally consistent with actions?',
        'x12': isPolish ? 'Czy firma jest gotowa rozwijać działania w bardziej uporządkowany sposób?' : 'Is the company ready to develop operations in a more organized manner?',
    };
    
    return verificationData.map(verification => {
        const questionId = verification.questionId;
        const correctQuestionText = questionTexts[questionId];
        
        // Always add the correct question text from our survey data
        return {
            ...verification,
            questionText: correctQuestionText || (isPolish ? 'Pytanie' : 'Question')
        };
    });
}

// Analyze document content for verification
function analyzeDocumentContent(documentContent, questionId, userAnswer, language) {
    const isPolish = language === 'pl';
    const content = documentContent.toLowerCase();
    
    // Define keywords for each question type
    const questionKeywords = {
        'e_energy': {
            positive: ['monitor', 'monitoring', 'energy', 'consumption', 'usage', 'tracking', 'measurement', 'monitorowanie', 'zużycie', 'energii', 'pomiar'],
            negative: ['no monitoring', 'not monitoring', 'brak monitorowania', 'nie monitorujemy'],
            implementation: ['implemented', 'active', 'running', 'zaimplementowane', 'aktywne', 'działa']
        },
        'e_co2': {
            positive: ['co2', 'emission', 'greenhouse', 'gas', 'carbon', 'footprint', 'emisje', 'gazów', 'cieplarnianych', 'ślad', 'węglowy'],
            negative: ['no co2', 'not measuring', 'brak pomiaru', 'nie mierzymy'],
            implementation: ['measured', 'tracked', 'reported', 'mierzone', 'śledzone', 'raportowane']
        },
        'e_scopes': {
            positive: ['scope 1', 'scope 2', 'scope 3', 'zakres 1', 'zakres 2', 'zakres 3'],
            negative: ['no scope', 'not reporting', 'brak zakresu', 'nie raportujemy'],
            implementation: ['reported', 'included', 'raportowane', 'uwzględnione']
        },
        'e_res': {
            positive: ['renewable', 'solar', 'wind', 'hydro', 'green energy', 'odnawialna', 'słoneczna', 'wiatrowa', 'zielona'],
            negative: ['no renewable', 'not using', 'brak odnawialnej', 'nie używamy'],
            implementation: ['using', 'installed', 'generating', 'używamy', 'zainstalowane', 'generujemy']
        },
        'e_targets': {
            positive: ['target', 'goal', 'reduction', 'objective', 'cel', 'redukcja', 'obiektyw'],
            negative: ['no target', 'no goal', 'brak celu', 'brak celu'],
            implementation: ['set', 'established', 'defined', 'ustawione', 'ustanowione', 'zdefiniowane']
        },
        'e_policy': {
            positive: ['policy', 'environmental', 'sustainability', 'polityka', 'środowiskowa', 'zrównoważony'],
            negative: ['no policy', 'not having', 'brak polityki', 'nie mamy'],
            implementation: ['adopted', 'approved', 'in place', 'przyjęta', 'zatwierdzona', 'wdrożona']
        },
        's_dei': {
            positive: ['diversity', 'inclusion', 'equity', 'dei', 'różnorodność', 'inkluzja', 'równość'],
            negative: ['no diversity', 'not promoting', 'brak różnorodności', 'nie promujemy'],
            implementation: ['promoting', 'supporting', 'implemented', 'promujemy', 'wspieramy', 'zaimplementowane']
        },
        's_hr': {
            positive: ['women', 'leadership', 'board', 'management', 'kobiety', 'przywództwo', 'zarząd', 'kierownictwo'],
            negative: ['no women', 'not promoting', 'brak kobiet', 'nie promujemy'],
            implementation: ['included', 'represented', 'promoted', 'uwzględnione', 'reprezentowane', 'promowane']
        },
        's_incidents': {
            positive: ['incident', 'safety', 'accident', 'ltifr', 'trir', 'incydent', 'bezpieczeństwo', 'wypadek'],
            negative: ['no incidents', 'not monitoring', 'brak incydentów', 'nie monitorujemy'],
            implementation: ['monitored', 'tracked', 'reported', 'monitorowane', 'śledzone', 'raportowane']
        },
        's_whistle': {
            positive: ['whistleblowing', 'whistle', 'reporting', 'zgłaszanie', 'anonimowe', 'zgłoszenia'],
            negative: ['no whistleblowing', 'not having', 'brak zgłaszania', 'nie mamy'],
            implementation: ['system', 'process', 'mechanism', 'system', 'proces', 'mechanizm']
        },
        's_training': {
            positive: ['training', 'education', 'development', 'hours', 'szkolenia', 'edukacja', 'rozwój', 'godziny'],
            negative: ['no training', 'not providing', 'brak szkoleń', 'nie zapewniamy'],
            implementation: ['provided', 'offered', 'conducted', 'zapewniane', 'oferowane', 'prowadzone']
        },
        'g_risk': {
            positive: ['risk', 'assessment', 'esg risk', 'ryzyko', 'ocena', 'ryzyko esg'],
            negative: ['no risk assessment', 'not assessing', 'brak oceny ryzyka', 'nie oceniamy'],
            implementation: ['assessed', 'evaluated', 'reviewed', 'oceniane', 'ewaluowane', 'przeglądane']
        },
        'g_pay': {
            positive: ['pay', 'compensation', 'salary', 'kpi', 'wynagrodzenie', 'płaca', 'kpi'],
            negative: ['no pay link', 'not linked', 'brak powiązania', 'nie powiązane'],
            implementation: ['linked', 'tied', 'connected', 'powiązane', 'związane', 'połączone']
        }
    };
    
    const keywords = questionKeywords[questionId];
    if (!keywords) {
        return {
            isConsistent: false,
            documentInfo: isPolish ? 'Nie można przeanalizować tego typu pytania' : 'Cannot analyze this question type',
            suggestedCorrection: null
        };
    }
    
    // Check for positive indicators
    const hasPositiveKeywords = keywords.positive.some(keyword => content.includes(keyword));
    const hasNegativeKeywords = keywords.negative.some(keyword => content.includes(keyword));
    const hasImplementationKeywords = keywords.implementation.some(keyword => content.includes(keyword));
    
    // Determine consistency based on user answer and document content
    let isConsistent = false;
    let documentInfo = '';
    let suggestedCorrection = null;
    
    if (userAnswer === 'Tak' || userAnswer === 'Yes') {
        if (hasPositiveKeywords && hasImplementationKeywords) {
            isConsistent = true;
            documentInfo = isPolish ? 
                `Dokument zawiera informacje potwierdzające implementację zgodnie z odpowiedzią "${userAnswer}". Znaleziono kluczowe słowa i dowody implementacji.` :
                `Document contains information confirming implementation as per response "${userAnswer}". Found key keywords and implementation evidence.`;
        } else if (hasNegativeKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument zawiera informacje przeczące odpowiedzi "${userAnswer}". Znaleziono negatywne wskazówki.` :
                `Document contains information contradicting response "${userAnswer}". Found negative indicators.`;
            suggestedCorrection = isPolish ? 'Sprawdź dokument - może odpowiedź powinna być "Nie"' : 'Check document - answer might should be "No"';
        } else if (!hasPositiveKeywords && !hasImplementationKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument nie zawiera informacji potwierdzających odpowiedź "${userAnswer}". Brak dowodów implementacji.` :
                `Document does not contain information confirming response "${userAnswer}". No implementation evidence found.`;
            suggestedCorrection = isPolish ? 'Brak informacji w dokumencie na ten temat' : 'No information in document on this topic';
        }
    } else if (userAnswer === 'Nie' || userAnswer === 'No') {
        if (hasNegativeKeywords) {
            isConsistent = true;
            documentInfo = isPolish ? 
                `Dokument potwierdza brak implementacji zgodnie z odpowiedzią "${userAnswer}". Znaleziono negatywne wskazówki.` :
                `Document confirms no implementation as per response "${userAnswer}". Found negative indicators.`;
        } else if (hasPositiveKeywords && hasImplementationKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument zawiera informacje o implementacji, co przeczy odpowiedzi "${userAnswer}".` :
                `Document contains implementation information, which contradicts response "${userAnswer}".`;
            suggestedCorrection = isPolish ? 'Na podstawie dokumentu odpowiedź powinna być "Tak"' : 'Based on document, answer should be "Yes"';
        } else if (!hasPositiveKeywords && !hasNegativeKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument nie zawiera informacji na ten temat. Nie można potwierdzić odpowiedzi "${userAnswer}".` :
                `Document does not contain information on this topic. Cannot confirm response "${userAnswer}".`;
            suggestedCorrection = isPolish ? 'Brak informacji w dokumencie na ten temat' : 'No information in document on this topic';
        }
    } else if (userAnswer === 'Częściowo' || userAnswer === 'Partial') {
        if (hasPositiveKeywords && !hasImplementationKeywords) {
            isConsistent = true;
            documentInfo = isPolish ? 
                `Dokument pokazuje częściową implementację zgodnie z odpowiedzią "${userAnswer}". Znaleziono wskazówki ale brak pełnej implementacji.` :
                `Document shows partial implementation as per response "${userAnswer}". Found indicators but no full implementation.`;
        } else if (hasImplementationKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument pokazuje pełną implementację, co nie odpowiada odpowiedzi "${userAnswer}".` :
                `Document shows full implementation, which doesn't match response "${userAnswer}".`;
            suggestedCorrection = isPolish ? 'Na podstawie dokumentu odpowiedź powinna być "Tak"' : 'Based on document, answer should be "Yes"';
        } else if (!hasPositiveKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument nie zawiera informacji potwierdzających częściową implementację.` :
                `Document does not contain information confirming partial implementation.`;
            suggestedCorrection = isPolish ? 'Brak informacji w dokumencie na ten temat' : 'No information in document on this topic';
        }
    } else if (userAnswer === 'W trakcie' || userAnswer === 'In Progress') {
        if (hasPositiveKeywords && !hasImplementationKeywords) {
            isConsistent = true;
            documentInfo = isPolish ? 
                `Dokument pokazuje pracę w toku zgodnie z odpowiedzią "${userAnswer}". Znaleziono wskazówki planowania/realizacji.` :
                `Document shows work in progress as per response "${userAnswer}". Found planning/implementation indicators.`;
        } else if (hasImplementationKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument pokazuje zakończoną implementację, co nie odpowiada odpowiedzi "${userAnswer}".` :
                `Document shows completed implementation, which doesn't match response "${userAnswer}".`;
            suggestedCorrection = isPolish ? 'Na podstawie dokumentu odpowiedź powinna być "Tak"' : 'Based on document, answer should be "Yes"';
        } else if (!hasPositiveKeywords) {
            isConsistent = false;
            documentInfo = isPolish ? 
                `Dokument nie zawiera informacji o pracy w toku.` :
                `Document does not contain information about work in progress.`;
            suggestedCorrection = isPolish ? 'Brak informacji w dokumencie na ten temat' : 'No information in document on this topic';
        }
    }
    
    return {
        isConsistent,
        documentInfo,
        suggestedCorrection
    };
}

// Convert numeric answer to text based on question context
function convertAnswerToText(answer, language = 'en', questionId = null) {
    const isPolish = language === 'pl';

    // Simplified answer mapping for new question structure from PDFs
    // All new questions (G1-G9, S1-S9, E1-E11, SC1-SC9, X1-X12) use the same answer format:
    // TAK (YES) = 5 points
    // W TRAKCIE (IN PROGRESS) = 3 points
    // NIE (NO) = 0 points
    // NIE WIEM (DON'T KNOW) = 0 points
    // NIE DOTYCZY (NOT APPLICABLE) = 'na' (excluded from calculation)

    const answerMapping = {
        '5': isPolish ? 'Tak' : 'Yes',
        '3': isPolish ? 'W trakcie' : 'In Progress',
        '0': isPolish ? 'Nie' : 'No',
        'na': isPolish ? 'Nie dotyczy' : 'Not Applicable'
    };

    // Return the mapped answer or the original answer if not found
    return answerMapping[String(answer)] || answer;
}

// Process document verifications from form data
// Classify ESG domain (E, S, G) based on keywords
function classifyESGDomain(text) {
    const content = text.toLowerCase();
    
    // Environmental (E) keywords
    const eKeywords = [
        // Emissions and climate
        'emission', 'co2', 'co₂', 'greenhouse', 'gas', 'carbon', 'footprint', 'climate',
        'emisje', 'gazów', 'cieplarnianych', 'ślad', 'węglowy', 'klimat',
        // Energy
        'energy', 'consumption', 'renewable', 'solar', 'wind', 'hydro', 'green energy',
        'energia', 'zużycie', 'odnawialna', 'słoneczna', 'wiatrowa', 'zielona',
        // Water and resources
        'water', 'waste', 'recycling', 'resource', 'efficiency', 'pollution',
        'woda', 'odpady', 'recykling', 'zasoby', 'efektywność', 'zanieczyszczenie',
        // Biodiversity and environment
        'biodiversity', 'environmental', 'sustainability', 'environment', 'ecological',
        'bioróżnorodność', 'środowiskowy', 'zrównoważony', 'środowisko', 'ekologiczny'
    ];
    
    // Social (S) keywords
    const sKeywords = [
        // Diversity and inclusion
        'diversity', 'inclusion', 'equity', 'dei', 'gender', 'women', 'minority',
        'różnorodność', 'inkluzja', 'równość', 'płeć', 'kobiety', 'mniejszości',
        // Human rights and labor
        'human rights', 'labor', 'employee', 'workforce', 'training', 'development',
        'prawa człowieka', 'praca', 'pracownik', 'siła robocza', 'szkolenia', 'rozwój',
        // Safety and health
        'safety', 'health', 'accident', 'incident', 'ltifr', 'trir', 'occupational',
        'bezpieczeństwo', 'zdrowie', 'wypadek', 'incydent', 'zawodowe',
        // Community and social impact
        'community', 'social', 'stakeholder', 'engagement', 'philanthropy', 'charity',
        'społeczność', 'społeczny', 'interesariusz', 'zaangażowanie', 'filantropia',
        // Whistleblowing
        'whistleblowing', 'whistle', 'reporting', 'zgłaszanie', 'anonimowe'
    ];
    
    // Governance (G) keywords
    const gKeywords = [
        // Board and management
        'board', 'director', 'governance', 'management', 'executive', 'leadership',
        'zarząd', 'dyrektor', 'zarządzanie', 'kierownictwo', 'przywództwo',
        // Risk and compliance
        'risk', 'compliance', 'audit', 'internal control', 'oversight', 'supervision',
        'ryzyko', 'zgodność', 'audyt', 'kontrola wewnętrzna', 'nadzór',
        // Ethics and anti-corruption
        'ethics', 'corruption', 'anti-corruption', 'bribery', 'fraud', 'integrity',
        'etyka', 'korupcja', 'antycorupcja', 'łapówka', 'oszustwo', 'uczciwość',
        // Data protection and privacy
        'gdpr', 'privacy', 'data protection', 'personal data', 'rodo', 'ochrona danych',
        // ESG ownership
        'esg owner', 'esg committee', 'esg responsibility', 'właściciel esg', 'komitet esg',
        // Remuneration
        'remuneration', 'compensation', 'pay', 'salary', 'kpi', 'wynagrodzenie', 'płaca'
    ];
    
    // Count keyword matches
    let eScore = 0;
    let sScore = 0;
    let gScore = 0;
    
    eKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
            eScore++;
        }
    });
    
    sKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
            sScore++;
        }
    });
    
    gKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
            gScore++;
        }
    });
    
    // Determine domain(s)
    const domains = [];
    const threshold = 2; // Minimum keyword matches to classify
    
    if (eScore >= threshold) domains.push('E');
    if (sScore >= threshold) domains.push('S');
    if (gScore >= threshold) domains.push('G');
    
    // If no domain meets threshold, use the highest score
    if (domains.length === 0) {
        const maxScore = Math.max(eScore, sScore, gScore);
        if (maxScore > 0) {
            if (eScore === maxScore) domains.push('E');
            if (sScore === maxScore) domains.push('S');
            if (gScore === maxScore) domains.push('G');
        }
    }
    
    return {
        domains: domains.length > 0 ? domains : ['Unknown'],
        scores: {
            E: eScore,
            S: sScore,
            G: gScore
        },
        confidence: domains.length > 0 ? 'high' : 'low'
    };
}

// Extract structured content (tables) from documents
async function extractStructuredContent(documentFiles) {
    try {
        const file = Array.isArray(documentFiles) ? documentFiles[0] : documentFiles;
        
        if (!file || !file.data) {
            return { tables: [], text: '' };
        }
        
        const fileBuffer = Buffer.from(file.data, 'base64');
        const structured = { tables: [], text: '' };
        
        if (file.type === 'application/pdf') {
            try {
                const pdfData = await pdfParse(fileBuffer);
                structured.text = pdfData.text || '';
                
                // Try to extract tables from PDF (basic approach)
                // Note: pdf-parse doesn't extract tables well, but we can look for table-like patterns
                const lines = structured.text.split('\n');
                const potentialTables = [];
                let currentTable = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    // Look for lines with multiple tab-separated or space-separated values
                    if (line.includes('\t') || (line.split(/\s{2,}/).length >= 3)) {
                        currentTable.push(line);
                    } else if (currentTable.length > 0) {
                        if (currentTable.length >= 2) {
                            potentialTables.push(currentTable);
                        }
                        currentTable = [];
                    }
                }
                if (currentTable.length >= 2) {
                    potentialTables.push(currentTable);
                }
                
                structured.tables = potentialTables.map((table, idx) => ({
                    id: idx + 1,
                    rows: table.length,
                    data: table
                }));
                
            } catch (pdfError) {
                structured.text = fileBuffer.toString('utf8');
            }
            
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.type === 'application/msword') {
            try {
                // Extract text
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                structured.text = result.value.trim();
                
                // Mammoth doesn't extract tables well, but we can try
                // For better table extraction, would need a different library
                const lines = structured.text.split('\n');
                const potentialTables = [];
                let currentTable = [];
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.includes('\t') || (line.split(/\s{2,}/).length >= 3)) {
                        currentTable.push(line);
                    } else if (currentTable.length > 0) {
                        if (currentTable.length >= 2) {
                            potentialTables.push(currentTable);
                        }
                        currentTable = [];
                    }
                }
                if (currentTable.length >= 2) {
                    potentialTables.push(currentTable);
                }
                
                structured.tables = potentialTables.map((table, idx) => ({
                    id: idx + 1,
                    rows: table.length,
                    data: table
                }));
                
            } catch (mammothError) {
                structured.text = fileBuffer.toString('utf8');
            }
            
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.type === 'application/vnd.ms-excel') {
            // Excel files - extract tables properly
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            
            workbook.SheetNames.forEach((sheetName, sheetIdx) => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                
                if (jsonData.length > 0) {
                    structured.tables.push({
                        id: sheetIdx + 1,
                        name: sheetName,
                        rows: jsonData.length,
                        columns: jsonData[0] ? jsonData[0].length : 0,
                        data: jsonData
                    });
                }
                
                // Add sheet content to text
                const textContent = jsonData.map(row => row.join('\t')).join('\n');
                structured.text += `\nSheet: ${sheetName}\n${textContent}\n`;
            });
            
        } else if (file.type === 'text/plain') {
            structured.text = fileBuffer.toString('utf8');
            
            // Try to detect tables in plain text
            const lines = structured.text.split('\n');
            const potentialTables = [];
            let currentTable = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.includes('\t') || (line.split(/\s{2,}/).length >= 3)) {
                    currentTable.push(line);
                } else if (currentTable.length > 0) {
                    if (currentTable.length >= 2) {
                        potentialTables.push(currentTable);
                    }
                    currentTable = [];
                }
            }
            if (currentTable.length >= 2) {
                potentialTables.push(currentTable);
            }
            
            structured.tables = potentialTables.map((table, idx) => ({
                id: idx + 1,
                rows: table.length,
                data: table
            }));
        }
        
        return structured;
        
    } catch (error) {
        console.error('Error extracting structured content:', error);
        return { tables: [], text: '', error: error.message };
    }
}

// Function to extract text content from uploaded documents
async function extractDocumentContent(documentFiles) {
    try {
        const file = Array.isArray(documentFiles) ? documentFiles[0] : documentFiles;
        
        if (!file || !file.data) {
            return 'Document content not available for analysis';
        }
        
        // Convert base64 data to buffer
        const fileBuffer = Buffer.from(file.data, 'base64');
        
        // Extract text based on file type
        if (file.type === 'application/pdf') {
            try {
                const pdfData = await pdfParse(fileBuffer);
                return `PDF Content from ${file.name}:\n${pdfData.text || 'No text content found in PDF'}`;
            } catch (pdfError) {
                // Fallback: try to extract as text
                const textContent = fileBuffer.toString('utf8');
                return `PDF Content from ${file.name} (fallback text extraction):\n${textContent}`;
            }
            
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.type === 'application/msword') {
            try {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
                const text = result.value.trim();
                if (text.length < 10) {
                    // If text extraction failed, try alternative method
                    const altResult = await mammoth.extractRawText({ 
                        buffer: fileBuffer,
                        includeEmbeddedStyleMap: true,
                        includeDefaultStyleMap: true
                    });
                    return `Word Document Content from ${file.name}:\n${altResult.value || 'Unable to extract text content from Word document'}`;
                }
                return `Word Document Content from ${file.name}:\n${text}`;
            } catch (mammothError) {
                // Fallback: try to extract as text
                const textContent = fileBuffer.toString('utf8');
                return `Word Document Content from ${file.name} (fallback extraction):\n${textContent}`;
            }
            
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.type === 'application/vnd.ms-excel') {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const textContent = jsonData.map(row => row.join('\t')).join('\n');
            return `Excel Content from ${file.name}:\n${textContent}`;
            
        } else if (file.type === 'text/plain') {
            return `Text Content from ${file.name}:\n${fileBuffer.toString('utf8')}`;
            
        } else {
            // For unsupported file types, try to extract as text
            try {
                const textContent = fileBuffer.toString('utf8');
                return `Text Content from ${file.name} (${file.type}):\n${textContent}`;
            } catch (textError) {
                return `Document: ${file.name} (${file.type}) - Content extraction not supported for this file type.`;
            }
        }
        
    } catch (error) {
        console.error('Error extracting document content:', error);
        return `Error extracting content from document: ${error.message}`;
    }
}

async function processDocumentVerifications(formData, language) {
    const verifications = [];
    
    // Process document verifications
    
    // Use the same question texts as in addCorrectQuestionTexts function
    // Updated to new question structure from PDFs (49 questions total)
    const isPolish = language === 'pl';
    const questionTexts = {
        // Governance (G) questions - 9 questions
        'g1': isPolish ? 'Czy w firmie jest jasno określone, kto podejmuje kluczowe decyzje i za jakie obszary odpowiada?' : 'Is it clearly defined who makes key decisions and is responsible for which areas?',
        'g2': isPolish ? 'Czy firma posiada podstawowe zasady lub reguły określające, jak prowadzi działalność?' : 'Does the company have basic principles or rules that define how it conducts business?',
        'g3': isPolish ? 'Czy firma dba o przestrzeganie obowiązujących przepisów i warunków umów?' : 'Does the company ensure compliance with applicable laws and contract terms?',
        'g4': isPolish ? 'Czy firma identyfikuje najważniejsze ryzyka i podejmuje działania, aby je ograniczać?' : 'Does the company identify the most important risks and take steps to mitigate them?',
        'g5': isPolish ? 'Czy firma prowadzi kontrolę finansową, taką jak prosty budżet lub śledzenie kosztów?' : 'Does the company maintain financial control, such as a simple budget or cost tracking?',
        'g6': isPolish ? 'Czy firma posiada procesy zapobiegające łapówkarstwu, korupcji lub konfliktom interesów?' : 'Does the company have processes to prevent bribery, corruption, or conflicts of interest?',
        'g7': isPolish ? 'Czy kierownictwo lub właściciel okresowo przegląda działalność firmy?' : 'Does management or the owner periodically review the company\'s performance?',
        'g8': isPolish ? 'Czy firma monitoruje kluczowe obszary, takie jak finanse, jakość, satysfakcja klientów?' : 'Does the company monitor key areas such as finance, quality, customer satisfaction?',
        'g9': isPolish ? 'Czy firma zbiera i przechowuje dokumenty niezbędne do jej funkcjonowania?' : 'Does the company collect and store documents essential for its operations?',

        // Social (S) questions - 9 questions
        's1': isPolish ? 'Czy firma zapewnia podstawowe bezpieczne i higieniczne warunki pracy?' : 'Does the company ensure basic safe and hygienic working conditions?',
        's2': isPolish ? 'Czy firma informuje pracowników o ich podstawowych prawach i zasadach pracy?' : 'Does the company inform employees about their basic rights and work rules?',
        's3': isPolish ? 'Czy firma posiada procedury, do których pracownicy mogą się zwrócić z problemami?' : 'Does the company have procedures employees can turn to with problems?',
        's4': isPolish ? 'Czy firma traktuje wszystkich pracowników sprawiedliwie?' : 'Does the company treat all employees fairly?',
        's5': isPolish ? 'Czy firma dba o rozwój swoich pracowników?' : 'Does the company take care of its employees\' development?',
        's6': isPolish ? 'Czy firma wspiera równowagę między życiem zawodowym a prywatnym?' : 'Does the company support work-life balance?',
        's7': isPolish ? 'Czy firma śledzi dane dotyczące swoich pracowników?' : 'Does the company track data related to its employees?',
        's8': isPolish ? 'Czy firma wypłaca wynagrodzenie na czas i zgodnie z prawem?' : 'Does the company pay remuneration on time and in accordance with law?',
        's9': isPolish ? 'Czy firma angażuje się w lokalną społeczność lub wspiera lokalne inicjatywy?' : 'Does the company engage with the local community or support local initiatives?',

        // Environment (E) questions - 11 questions
        'e1': isPolish ? 'Czy firma wie, jakie rodzaje energii zużywa i w przybliżeniu ile?' : 'Does the company know what types of energy it uses and approximately how much?',
        'e2': isPolish ? 'Czy firma stara się ograniczać zużycie energii?' : 'Does the company try to reduce energy consumption?',
        'e3': isPolish ? 'Czy firma segreguje odpady i utylizuje je zgodnie z przepisami?' : 'Does the company segregate waste and dispose of it in accordance with regulations?',
        'e4': isPolish ? 'Czy firma stara się zmniejszać ilość generowanych odpadów?' : 'Does the company try to reduce the amount of waste it generates?',
        'e4a': isPolish ? 'Czy firma wie, czy wytwarza odpady niebezpieczne?' : 'Does the company know if it generates hazardous waste?',
        'e5': isPolish ? 'Czy firma wykorzystuje wodę w swojej działalności?' : 'Does the company use water in its operations?',
        'e5a': isPolish ? 'Czy firma monitoruje zużycie wody lub stara się je ograniczać?' : 'Does the company monitor water consumption or try to reduce it?',
        'e6': isPolish ? 'Czy firma przestrzega podstawowych przepisów środowiskowych?' : 'Does the company comply with basic environmental regulations?',
        'e7': isPolish ? 'Czy firma minimalizuje swój negatywny wpływ na lokalne środowisko?' : 'Does the company minimize its negative impact on the local environment?',
        'e8': isPolish ? 'Czy firma korzysta z odnawialnych źródeł energii?' : 'Does the company use renewable energy sources?',
        'e9': isPolish ? 'Czy firma uwzględnia wpływ środowiskowy przy decyzjach zakupowych?' : 'Does the company consider environmental impact in purchase decisions?',

        // Supply Chain (SC) questions - 9 questions
        'sc1': isPolish ? 'Czy firma identyfikuje swoich kluczowych dostawców?' : 'Does the company identify its key suppliers?',
        'sc2': isPolish ? 'Czy firma posiada procedury wyboru nowych dostawców?' : 'Does the company have procedures for selecting new suppliers?',
        'sc3': isPolish ? 'Czy firma weryfikuje, czy dostawcy spełniają podstawowe standardy?' : 'Does the company verify whether suppliers meet basic standards?',
        'sc4': isPolish ? 'Czy firma posiada procedury reagowania na zakłócenia dostaw?' : 'Does the company have procedures for responding to supply disruptions?',
        'sc5': isPolish ? 'Czy firma monitoruje jakość produktów od dostawców?' : 'Does the company monitor the quality of products from suppliers?',
        'sc6': isPolish ? 'Czy firma utrzymuje regularną komunikację z kluczowymi dostawcami?' : 'Does the company maintain regular communication with key suppliers?',
        'sc7': isPolish ? 'Czy firma uwzględnia wpływ środowiskowy przy wyborze dostawców?' : 'Does the company consider environmental impact when choosing suppliers?',
        'sc8': isPolish ? 'Czy firma wie, jakie oczekiwania mają jej kluczowi klienci?' : 'Does the company know what expectations its key clients have?',
        'sc9': isPolish ? 'Czy firma wie, kim są jej podwykonawcy w łańcuchu dostaw?' : 'Does the company know who its subcontractors are in the supply chain?',

        // Extended (X) questions - 12 questions
        'x1': isPolish ? 'Czy wyznaczono osobę odpowiedzialną za koordynację zrównoważonego rozwoju?' : 'Has someone been designated to coordinate sustainability?',
        'x2': isPolish ? 'Czy firma określiła najważniejsze obszary z punktu widzenia ryzyk i wpływu?' : 'Has the company determined the most important areas in terms of risks and impact?',
        'x3': isPolish ? 'Czy działania firmy są spójne z określonymi priorytetami?' : 'Are the company\'s actions consistent with identified priorities?',
        'x4': isPolish ? 'Czy firma posiada określone cele dotyczące poprawy działalności?' : 'Does the company have defined goals for improving operations?',
        'x5': isPolish ? 'Czy firma monitoruje postępy realizacji swoich działań lub celów?' : 'Does the company monitor progress in implementing its actions or goals?',
        'x6': isPolish ? 'Czy dane są zbierane w sposób uporządkowany i możliwy do porównania?' : 'Is data collected in an organized and comparable manner?',
        'x7': isPolish ? 'Czy informacje są komunikowane wewnątrz firmy w jasny sposób?' : 'Is information communicated internally in a clear manner?',
        'x8': isPolish ? 'Czy firma posiada ustalone sposoby reagowania na problemy lub ryzyka?' : 'Does the company have established ways of responding to problems or risks?',
        'x9': isPolish ? 'Czy firma analizuje ryzyka związane z partnerami lub dostawcami?' : 'Does the company analyze risks related to partners or suppliers?',
        'x10': isPolish ? 'Czy firma jest przygotowana do odpowiadania na pytania klientów i partnerów?' : 'Is the company prepared to answer questions from clients and partners?',
        'x11': isPolish ? 'Czy informacje przekazywane na zewnątrz są spójne z działaniami?' : 'Is information communicated externally consistent with actions?',
        'x12': isPolish ? 'Czy firma jest gotowa rozwijać działania w bardziej uporządkowany sposób?' : 'Is the company ready to develop operations in a more organized manner?',
    };
    
    // Check each question for document attachments
    for (const questionId of Object.keys(questionTexts)) {
        const checkboxId = `${questionId}_doc_check`;
        const filesInputId = `${questionId}_files`;
        
        // Check if document checkbox is checked
        if (formData[checkboxId] === 'on' || formData[checkboxId] === true) {
            const userAnswer = formData[questionId];
            const documentFiles = formData[filesInputId];
            
            if (userAnswer && documentFiles) {
                const convertedAnswer = convertAnswerToText(userAnswer, language, questionId);
                
                // Get document content for AI analysis
                const documentContent = await extractDocumentContent(documentFiles);
                
                verifications.push({
                    questionId: questionId,
                    questionText: questionTexts[questionId],
                    userAnswer: convertedAnswer,
                    documentFiles: documentFiles,
                    documentName: Array.isArray(documentFiles) ? documentFiles[0].name : documentFiles.name || 'Unknown file',
                    documentContent: documentContent // Add actual document content for AI analysis
                });
            }
        }
    }
    
    
    return verifications;
}

// Fallback response generator
function generateFallbackResponse(level, language, type) {
    if (type === 'text-selection') {
        // Smart fallback - random but consistent selection for variety
        const versions = ['A', 'B', 'C'];
        
        // Map ESG levels to variant preferences
        const levelMapping = {
            'low': ['A', 'B', 'C'],      // More urgent variants
            'medium': ['B', 'C', 'A'],   // Balanced variants
            'high': ['C', 'A', 'B']      // Advanced variants
        };
        
        const preferredOrder = levelMapping[level] || ['B', 'A', 'C'];
        
        // Generate smart random selection with slight preference for level
        const smartRandom = (preferredIndex) => {
            // 50% chance for preferred variant, 50% for random
            return Math.random() < 0.5 
                ? preferredOrder[preferredIndex % 3]
                : versions[Math.floor(Math.random() * 3)];
        };
        
        const selectedVariants = {
            summary: smartRandom(0),
            nextSteps: smartRandom(1),
            cta: smartRandom(2),
            premiumTeaser: smartRandom(0)
        };
        
        return {
            choices: [{
                message: {
                    content: JSON.stringify(selectedVariants)
                }
            }]
        };
    }
    
    return {
        choices: [{
            message: {
                content: 'Fallback response generated'
            }
        }]
    };
}

function generateFallbackESGContent(level, language, companyName, industry) {
    return {
        choices: [{
            message: {
                content: `ESG Report for ${companyName || 'Sample Company'}\n\nThis is a fallback ESG report. Please configure your API key for full functionality.`
            }
        }]
    };
}

function generateFallbackPDFContent(level, language, companyName, industry) {
    return {
        choices: [{
            message: {
                content: JSON.stringify({
                    executiveSummary: `Executive Summary for ${companyName || 'Sample Company'} - ESG Level: ${level}`,
                    environmentalImpact: `Environmental impact analysis for ${industry || 'Technology'} sector`,
                    socialResponsibility: `Social responsibility initiatives and community engagement`,
                    governanceStructure: `Corporate governance framework and board structure`,
                    keyMetrics: `Key ESG metrics and performance indicators`,
                    recommendations: `Strategic recommendations for ESG improvement`,
                    nextSteps: `Next steps and action plan for ESG development`
                })
            }
        }]
    };
}

function generateFallbackAnalysis(data, level, language) {
    return {
        choices: [{
            message: {
                content: JSON.stringify({
                    overallScore: 75,
                    strengths: ['Good governance structure', 'Environmental initiatives'],
                    weaknesses: ['Limited social impact reporting', 'Need for better metrics'],
                    recommendations: ['Implement comprehensive ESG reporting', 'Set measurable targets'],
                    priorityActions: ['Develop ESG strategy', 'Engage stakeholders'],
                    riskAssessment: 'Medium risk - requires attention to social factors'
                })
            }
        }]
    };
}

// ==================== DATABASE ENDPOINTS ====================
// IMPORTANT: When working with database, markdown files are NOT created
// All data is saved only in PostgreSQL database

// Database initialization
app.post('/api/init-db', async (req, res) => {
    try {
        const schema = fs.readFileSync('../database/database-schema.sql', 'utf8');
        await query(schema);
        res.json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize database' });
    }
});

// Save user data
app.post('/api/save-user-data', async (req, res) => {
    try {
        const { sessionId, companyName, industry, esgLevel, language, customData } = req.body;
        
        const result = await query(
            `INSERT INTO user_data (session_id, company_name, industry, esg_level, language, custom_data) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT (session_id) 
             DO UPDATE SET 
                company_name = EXCLUDED.company_name,
                industry = EXCLUDED.industry,
                esg_level = EXCLUDED.esg_level,
                language = EXCLUDED.language,
                custom_data = EXCLUDED.custom_data,
                updated_at = CURRENT_TIMESTAMP
             RETURNING id`,
            [sessionId, companyName, industry, esgLevel, language, JSON.stringify(customData)]
        );
        
        res.json({ id: result.rows[0].id, message: 'User data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save user data' });
    }
});

// Get user data
app.get('/api/user-data/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const result = await query(
            'SELECT * FROM user_data WHERE session_id = $1',
            [sessionId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User data not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user data' });
    }
});

// Save ESG report
app.post('/api/save-esg-report', async (req, res) => {
    try {
        const { companyId, title, language, esgLevel, content, status = 'draft' } = req.body;
        
        const result = await query(
            `INSERT INTO esg_reports (company_id, title, language, esg_level, content, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id`,
            [companyId, title, language, esgLevel, JSON.stringify(content), status]
        );
        
        res.json({ id: result.rows[0].id, message: 'ESG report saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save ESG report' });
    }
});

// Get ESG reports
app.get('/api/esg-reports/:companyId', async (req, res) => {
    try {
        const { companyId } = req.params;
        
        const result = await query(
            'SELECT * FROM esg_reports WHERE company_id = $1 ORDER BY created_at DESC',
            [companyId]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ESG reports' });
    }
});

// Save ESG metrics
app.post('/api/save-esg-metrics', async (req, res) => {
    try {
        const { reportId, metrics } = req.body;
        
        const client = await getClient();
        try {
            await client.query('BEGIN');
            
            // Delete old metrics for this report
            await client.query('DELETE FROM esg_metrics WHERE report_id = $1', [reportId]);
            
            // Insert new metrics
            for (const metric of metrics) {
                await client.query(
                    `INSERT INTO esg_metrics (report_id, category, metric_name, value, unit, description) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [reportId, metric.category, metric.metricName, metric.value, metric.unit, metric.description]
                );
            }
            
            await client.query('COMMIT');
            res.json({ message: 'ESG metrics saved successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save ESG metrics' });
    }
});

// Get ESG metrics
app.get('/api/esg-metrics/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        
        const result = await query(
            'SELECT * FROM esg_metrics WHERE report_id = $1 ORDER BY category, metric_name',
            [reportId]
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get ESG metrics' });
    }
});

// Log API requests
app.post('/api/log-ai-request', async (req, res) => {
    try {
        const { userDataId, requestType, prompt, response, tokensUsed, processingTimeMs } = req.body;

        await query(
            `INSERT INTO ai_requests (user_data_id, request_type, prompt, response, tokens_used, processing_time_ms)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userDataId, requestType, prompt, response, tokensUsed, processingTimeMs]
        );

        res.json({ message: 'Request logged successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log request' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM companies) as total_companies,
                (SELECT COUNT(*) FROM esg_reports) as total_reports,
                (SELECT COUNT(*) FROM user_data) as total_users,
                (SELECT COUNT(*) FROM ai_requests) as total_ai_requests,
                (SELECT COUNT(*) FROM ai_requests WHERE created_at >= CURRENT_DATE) as today_ai_requests
        `);
        
        res.json(stats.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Search companies
app.get('/api/companies/search', async (req, res) => {
    try {
        const { q, industry, esgLevel } = req.query;
        
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramCount = 0;
        
        if (q) {
            paramCount++;
            whereClause += ` AND name ILIKE $${paramCount}`;
            params.push(`%${q}%`);
        }
        
        if (industry) {
            paramCount++;
            whereClause += ` AND industry = $${paramCount}`;
            params.push(industry);
        }
        
        if (esgLevel) {
            paramCount++;
            whereClause += ` AND esg_level = $${paramCount}`;
            params.push(esgLevel);
        }
        
        const result = await query(
            `SELECT * FROM companies ${whereClause} ORDER BY name LIMIT 50`,
            params
        );
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search companies' });
    }
});

// Load company data for comparison (bulk load)
app.post('/api/company-benchmarks', async (req, res) => {
    try {
        const { companies } = req.body; // Array of companies: [{ company_name, industry, scope1, ren, paygap }, ...]
        
        if (!Array.isArray(companies) || companies.length === 0) {
            return res.status(400).json({ error: 'Companies array is required and must not be empty' });
        }
        
        const client = await getClient();
        try {
            await client.query('BEGIN');
            
            const results = [];
            
            for (const company of companies) {
                const { company_name, industry, scope1, ren, paygap } = company;
                
                if (!company_name || !industry) {
                    continue;
                }
                
                // Use INSERT ... ON CONFLICT to update existing records
                const result = await client.query(
                    `INSERT INTO company_benchmarks (company_name, industry, scope1, ren, paygap)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (company_name, industry)
                     DO UPDATE SET
                         scope1 = EXCLUDED.scope1,
                         ren = EXCLUDED.ren,
                         paygap = EXCLUDED.paygap,
                         updated_at = CURRENT_TIMESTAMP
                     RETURNING *`,
                    [
                        company_name,
                        industry,
                        scope1 !== null && scope1 !== undefined ? parseFloat(scope1) : null,
                        ren !== null && ren !== undefined ? parseFloat(ren) : null,
                        paygap !== null && paygap !== undefined ? parseFloat(paygap) : null
                    ]
                );
                
                results.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: `Successfully processed ${results.length} companies`,
                companies: results
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save company benchmarks', details: error.message });
    }
});

// Get company data by industry
app.get('/api/company-benchmarks/:industry', async (req, res) => {
    try {
        const { industry } = req.params;
        // Warm up connection before query (important for Neon DB)
        const { warmupConnection } = require('../database/database');
        await warmupConnection();
        
        const result = await query(
            `SELECT company_name, industry, scope1, ren, paygap, created_at, updated_at
             FROM company_benchmarks
             WHERE industry = $1
             ORDER BY company_name`,
            [industry]
        );
        
        // Convert to format for window.COMPANY_BENCHMARKS
        const benchmarks = {};
        result.rows.forEach(row => {
            benchmarks[row.company_name] = {
                scope1: row.scope1 !== null ? parseFloat(row.scope1) : null,
                ren: row.ren !== null ? parseFloat(row.ren) : null,
                paygap: row.paygap !== null ? parseFloat(row.paygap) : null
            };
        });
        
        res.json(benchmarks);
    } catch (error) {
        console.error(`Error fetching benchmarks for industry "${req.params.industry}":`, error);
        res.status(500).json({ 
            error: 'Failed to get company benchmarks', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all companies (for administration)
app.get('/api/company-benchmarks', async (req, res) => {
    try {
        const { industry } = req.query;
        
        let sql = `SELECT company_name, industry, scope1, ren, paygap, created_at, updated_at
                   FROM company_benchmarks`;
        const params = [];
        
        if (industry) {
            sql += ` WHERE industry = $1`;
            params.push(industry);
        }
        
        sql += ` ORDER BY industry, company_name`;
        
        const result = await query(sql, params);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get company benchmarks', details: error.message });
    }
});

// Delete company from benchmarks
app.delete('/api/company-benchmarks', async (req, res) => {
    try {
        const { company_name, industry } = req.body;
        
        if (!company_name || !industry) {
            return res.status(400).json({ error: 'company_name and industry are required' });
        }
        
        const result = await query(
            `DELETE FROM company_benchmarks 
             WHERE company_name = $1 AND industry = $2 
             RETURNING *`,
            [company_name, industry]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        
        res.json({
            success: true,
            message: `Company ${company_name} deleted from ${industry} industry`,
            deleted: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete company benchmark', details: error.message });
    }
});

// Calculate ESG metrics from document
app.post('/api/calculate-esg-metrics', async (req, res) => {
    try {
        const { documentText, esgSphere, language = 'en' } = req.body;
        
        if (!documentText) {
            return res.status(400).json({ error: 'Document text is required' });
        }
        
        if (!esgSphere || !['E', 'S', 'G'].includes(esgSphere)) {
            return res.status(400).json({ error: 'ESG sphere must be E, S, or G' });
        }
        
        // Calculate metrics for the specified sphere
        const metricResults = calculateMetricsForSphere(esgSphere, documentText, language);
        
        // Generate recommendations
        const recommendations = generateRecommendations(metricResults, language);
        
        res.json({
            success: true,
            sphere: esgSphere,
            metrics: metricResults,
            recommendations,
            language
        });
    } catch (error) {
        console.error('Error calculating ESG metrics:', error);
        res.status(500).json({ 
            error: 'Failed to calculate ESG metrics',
            details: error.message 
        });
    }
});

// Send PDF to email
app.post('/api/send-pdf-email', async (req, res) => {
    try {
        const { email, pdfBase64, lang, filename: fname } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!pdfBase64) {
            return res.status(400).json({ error: 'PDF data is required' });
        }

        const filename = fname || `ESG_Assessment_${Date.now()}.pdf`;

        // Check for Google Apps Script URL for sending
        const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL ||
            'https://script.google.com/macros/s/AKfycbzUFrWH0Q2N7OiSzsy14zQQ2cAt_XDXMScKBe7SqPrDs2NvkQ8A-xYmEsgtLymOAhGh/exec';

        // Send request to Google Apps Script
        try {
            const formData = new URLSearchParams();
            formData.append('action', 'email_pdf');
            formData.append('email', email.trim());
            formData.append('pdfBase64', pdfBase64);
            formData.append('lang', lang);
            formData.append('filename', filename);

            // Dynamic timeout based on PDF size
            const pdfSizeMB = parseFloat((pdfBase64.length * 3 / 4 / 1024 / 1024).toFixed(2));
            let timeoutMs = 60000;
            if (pdfSizeMB > 5) {
                timeoutMs = 120000;
            } else if (pdfSizeMB > 2) {
                timeoutMs = 90000;
            }

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    const timeoutError = new Error(`Request timeout after ${timeoutMs / 1000} seconds`);
                    timeoutError.code = 'ETIMEDOUT';
                    timeoutError.type = 'timeout';
                    reject(timeoutError);
                }, timeoutMs);
            });

            const fetchPromise = fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            }).catch(err => {
                console.error('❌ Fetch promise rejected:', err.message);
                err.code = err.code || 'FETCH_ERROR';
                err.type = err.type || 'network';
                throw err;
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]).catch(fetchError => {
                console.error('❌ Network error:', fetchError.message);
                throw fetchError;
            });

            if (response && response.ok) {
                const result = await response.text();
                res.json({
                    success: true,
                    message: 'PDF sent successfully',
                    email: email.trim()
                });
            } else if (response) {
                const errorText = await response.text().catch(() => 'Unable to read error response');
                console.error('❌ Google Apps Script error:', response.status, errorText.substring(0, 200));
                res.status(500).json({
                    error: 'Failed to send email via Google Apps Script',
                    details: errorText.substring(0, 500)
                });
            } else {
                throw new Error('No response from Google Apps Script');
            }
        } catch (fetchError) {
            console.error('❌ Error sending PDF email:', fetchError.message);

            let errorMessage = fetchError.message;
            if (fetchError.code === 'ENOTFOUND' || fetchError.message.includes('getaddrinfo')) {
                errorMessage = 'DNS resolution failed. Check internet connection and Google Apps Script URL.';
            } else if (fetchError.code === 'ETIMEDOUT' || fetchError.message.includes('timeout')) {
                errorMessage = 'Request timeout. Google Apps Script may be slow or unavailable.';
            } else if (fetchError.code === 'ECONNREFUSED') {
                errorMessage = 'Connection refused. Google Apps Script may be down.';
            }

            res.status(500).json({
                error: 'Failed to send email',
                details: errorMessage,
                code: fetchError.code || 'UNKNOWN'
            });
        }
    } catch (error) {
        console.error('❌ Error in send-pdf-email endpoint:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.listen(PORT, async () => {
    // Check and "warm up" database connection
    try {
        const { warmupConnection } = require('../database/database');
        await warmupConnection();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
});
