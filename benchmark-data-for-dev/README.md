# ESGSyncPRO Landing Page

A modern ESG assessment platform with automated content generation, multilingual support, industry-specific personalization, and comprehensive backend API.

## 🚀 Features

- **Automated Content Generation** - Dynamic ESG reports with unique text variants
- **Industry-Specific Personalization** - Customized content for 8 industries (construction, energy, finance, IT, logistics, production, retail, services)
- **Backend API Server** - Express.js server with proxy functionality
- **Multilingual Support** - English and Polish languages
- **Responsive Design** - Mobile-first approach for all screen sizes
- **ESG Assessment Tool** - Interactive questionnaire with intelligent scoring
- **PDF Export** - Automated PDF generation with personalized, industry-specific content
- **TOP 3 Risk Prioritization** - Intelligent identification of highest-impact areas
- **Multiple API Endpoints** - Content generation, analysis, and text variant selection
- **4-State Risk System** - Green/Yellow/Orange/Critical states with threshold-based transitions
- **Relevance Engine** - Contextual relevance scoring (R×C matrix) for personalized recommendations

## 📊 ESG Scoring System

The system uses a sophisticated **Relevance Engine v1** that combines:

### Core Components
- **Base Scoring** - Four pillars: Environment (E), Social (S), Governance (G), Supply Chain (SC)
- **Relevance Matrix** - R (Relevance) × C (Completeness) calculation for each risk
- **ERRS Scoring** - Expected Risk-Reduction Speed (0-100 scale)
- **State Transitions** - 4-state system with defined thresholds (Green: 81-100%, Yellow: 51-80%, Orange: 31-50%, Critical: 0-30%)

### TOP 3 Risk Areas
- Automatically identifies the 3 highest-priority areas based on ERRS scores
- Assigns action horizons (30/90/180 days) based on risk severity
- Provides industry-specific recommendations for each horizon

### Industry-Specific Content
- **Industry Risk Introductions** - Context for why each pillar matters to specific industries
- **Industry Profiles** - Detailed explanations per pillar per industry (8 × 4 = 32 profiles)
- **Industry Horizon Examples** - Concrete action examples for 30/90/180-day plans
- **64-Comment Library** - Risk comments covering 4 pillars × 4 states × 3 risk types × 2 languages

## 🛠️ Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Build the scoring bundle (required for browser):
```bash
npm run build:scoring
```

3. Set up environment variables (optional):
Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

4. Start the server:
```bash
# Using npm
npm start

# Using the provided scripts
./start-server.sh    # Linux/Mac
start-server.bat     # Windows

# Development mode with auto-reload
npm run dev
```

5. Open your browser to `http://localhost:3001`

## 📁 Project Structure

```
esgsyncprolanding/
├── server/
│   └── server.js                  # Express.js backend server
├── src/
│   ├── pdf-template.js            # PDF generation with industry-specific content
│   └── scoring/                   # ESG Scoring & Relevance Engine v1
│       ├── index.js               # Main entry point, exports all modules
│       ├── core.js                # Core scoring calculations
│       ├── relevance.js           # Relevance engine (R×C matrix, TOP 3)
│       ├── comments.js            # 64-comment library + comment generation
│       ├── industry-risk-intro.js # Industry-specific introductions (8×4×2)
│       ├── industry-profile.js    # Industry profiles for pillars (8×4×2)
│       ├── industry-horizon-examples.js # Action examples (8×3×2)
│       ├── industry-lookup.js     # Industry code mapping
│       ├── thresholds.js          # State transition thresholds
│       ├── roi-proof.js           # ROI calculations
│       ├── vendor-export.js       # Vendor-specific exports
│       └── feature-flags.js       # Feature flag system
├── tasks/                         # Project documentation
│   ├── KorrektaOtchetaESG.md     # Detailed task specification
│   └── Linear_Issues_KorrektaOtchetaESG.md # Linear issues (simplified)
├── pdfs/                          # PDF specifications
│   └── todo/
│       └── Korekta.pdf            # Report improvement specification
├── package.json                   # Node.js dependencies and scripts
├── index.html                     # Frontend application
└── start-server.bat/sh            # Server startup scripts
```

## 📊 Features & API Endpoints

The system includes a comprehensive backend with multiple endpoints:

### Core Functionality
- **Text Variant Selection** - Intelligent selection of content variants (A/B/C) based on ESG level and language
- **ESG Content Generation** - Dynamic report content creation with industry context
- **PDF Content Generation** - Structured PDF report content with 64-comment library
- **ESG Data Analysis** - Automated analysis with scoring and recommendations
- **Fallback System** - Works without API key using smart fallbacks

### Available API Endpoints
- `POST /api/esg-variants` - Get text variants for reports
- `POST /api/generate-esg-content` - Generate comprehensive ESG content
- `POST /api/generate-pdf-content` - Create structured PDF content
- `POST /api/analyze-esg-data` - Analyze ESG data with insights
- `GET /api/health` - Check API status and configuration

## 🎯 Report Improvements (Korekta.pdf Implementation)

The system implements 10 critical improvements from `pdfs/todo/Korekta.pdf`:

### Critical Priority
1. ✅ **Unified Benchmark** - Single source of truth for industry average (średnia) across all pages
2. ✅ **Industry Risk Introductions** - 1-2 sentence context for each TOP 3 block (8 industries × 4 pillars × 2 languages)
3. ✅ **64-Comment Library** - Professional risk comments (4 pillars × 4 states × 3 risk types × 2 languages)

### High Priority
4. ✅ **Dynamic Date** - Report generation date from `report.generatedAt` in "DD month YYYY" format
5. ✅ **Industry Profiles** - Explanatory text under each pillar in "Szczegółowe wyniki ESG" section
6. ✅ **Linking Sentence** - Connects overall result to TOP 3 priorities on page 1
7. ✅ **Horizon Examples** - Industry-specific concrete actions for 30/90/180-day plans

### Medium Priority
8. ✅ **Unified Product Name** - "Raport oceny ESG" / "ESG Assessment Report" throughout
9. ✅ **TOP 3 Readability** - Visual separation of 3 risk types with increased line-height (1.8)
10. ⚠️ **Pre-Generation Validation** - QA layer to check data consistency (planned)

## 🔧 Technical Implementation

### State Management
```javascript
// 4-state system with thresholds
Green:    81-100% (low risk)
Yellow:   51-80%  (moderate risk)
Orange:   31-50%  (elevated risk)
Critical: 0-30%   (critical risk)
```

### Relevance Calculation
```javascript
MS = Baseline × R × C
where:
  Baseline = Core importance (0-100)
  R = Relevance to company (0-1)
  C = Completeness of data (0-1)
```

### ERRS Formula
```javascript
ERRS = MS × (1 - current_maturity) × ease_of_implementation
```

## 🌐 Development vs Production

### Development Mode
```bash
npm run dev  # Auto-reload with nodemon
```

### Production Mode
```bash
npm start    # Standard production server
```

### Building Scoring Bundle
```bash
npm run build:scoring  # Creates src/scoring.bundle.js for browser
```

## 🔒 Security & Environment

- **Environment variables supported** - use `OPENAI_API_KEY` in `.env` file
- **Secure API proxy** - Frontend never exposes API keys
- **Fallback system** - Works without API key for development
- **CORS enabled** - Secure cross-origin requests
- Never commit real API keys to version control

## 🚀 Deployment

The application runs on Node.js and can be deployed to any platform supporting Express.js:

- **Heroku**: `git push heroku main`
- **Vercel**: Deploy with serverless functions
- **Railway**: Connect GitHub repository
- **Local**: Use provided startup scripts

## 🎯 Usage

1. **Start the server** using one of the methods above
2. **Access the application** at `http://localhost:3001`
3. **Complete the ESG assessment** using the interactive form
4. **Select company industry** (construction, energy, finance, IT, logistics, production, retail, services)
5. **Generate reports** with automated, industry-specific content
6. **Review TOP 3 priorities** with concrete action plans
7. **Export to PDF** with personalized recommendations

## 🔧 Troubleshooting

- **Port already in use**: Change `PORT` in `.env` file
- **Features not working**: Check API key configuration
- **CORS errors**: Ensure server is running on correct port
- **PDF generation fails**: Verify all dependencies are installed
- **Scoring not working**: Run `npm run build:scoring` to rebuild bundle
- **Industry content missing**: Check that `scoring.bundle.js` includes all modules

## 🙏 Acknowledgments

- Built with Express.js and Node.js
- Frontend powered by HTML5 and Tailwind CSS
- ESG methodology based on industry best practices
- Scoring system designed for Polish/EU market compliance
- Browserify for client-side module bundling
