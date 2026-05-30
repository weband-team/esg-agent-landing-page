"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingEngineService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const prisma_service_1 = require("../../database/prisma.service");
let MatchingEngineService = class MatchingEngineService {
    prisma;
    regulations = [];
    constructor(prisma) {
        this.prisma = prisma;
        this.loadRegulations();
    }
    async onModuleInit() {
        await this.loadRegulationsFromDb();
    }
    loadRegulations() {
        try {
            let filePath = path.join(__dirname, '..', '..', 'database', 'regulations_db.json');
            if (!fs.existsSync(filePath)) {
                filePath = path.join(__dirname, '..', '..', '..', 'database', 'regulations_db.json');
            }
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            this.regulations = JSON.parse(fileContent);
        }
        catch (error) {
            console.error('Failed to load regulations JSON database:', error);
            this.regulations = [];
        }
    }
    async loadRegulationsFromDb() {
        try {
            const dbRegs = await this.prisma.regulation.findMany();
            if (dbRegs && dbRegs.length > 0) {
                this.regulations = dbRegs.map((reg) => ({
                    regulation_id: reg.regulation_id,
                    area: reg.area,
                    name: reg.name,
                    obligation_name: reg.obligation_name,
                    legal_level: reg.legal_level,
                    legal_basis: reg.legal_basis,
                    authority: reg.authority,
                    official_source: reg.official_source,
                    trigger_logic: reg.trigger_logic,
                    trigger_data_fields: reg.trigger_data_fields,
                    thresholds: reg.thresholds,
                    obligation_type: reg.obligation_type,
                    output_required: reg.output_required,
                    portal_or_submission: reg.portal_or_submission,
                    frequency: reg.frequency,
                    deadline: reg.deadline,
                    evidence_to_keep: reg.evidence_to_keep,
                    penalty_risk: reg.penalty_risk,
                    penalty_description: reg.penalty_description,
                    owner_role: reg.owner_role,
                    confidence_level: reg.confidence_level,
                    pkd_codes: reg.pkd_codes,
                }));
                console.log(`Successfully loaded ${this.regulations.length} regulations from Prisma database.`);
            }
        }
        catch (err) {
            console.warn('Database query failed in MatchingEngineService, falling back to JSON catalogue:', err.message);
        }
    }
    ensureRegulationsLoaded() {
        if (this.regulations.length === 0) {
            this.loadRegulations();
        }
    }
    matchCompany(company) {
        this.ensureRegulationsLoaded();
        const matchedRegulations = [];
        for (const reg of this.regulations) {
            let isMatch = false;
            let matchedConfidence = 'certain';
            if (reg.trigger_data_fields?.includes('is_registered_in_poland') &&
                reg.trigger_data_fields.length === 1 &&
                !reg.pkd_codes?.length &&
                !reg.legal_forms?.length) {
                isMatch = true;
                matchedConfidence = 'certain';
            }
            if (reg.legal_forms && reg.legal_forms.length > 0) {
                const formMatch = reg.legal_forms.includes(company.legal_form);
                if (formMatch) {
                    isMatch = true;
                    matchedConfidence = reg.confidence_level || 'certain';
                }
                else if (reg.trigger_data_fields?.includes('legal_form')) {
                    continue;
                }
            }
            const regPkds = reg.pkd_codes;
            if (regPkds && regPkds.length > 0) {
                const pkdMatch = company.pkd.some((compPkd) => {
                    return regPkds.some((regPkd) => {
                        const cleanRegPkd = regPkd.replace(/\.$/, '');
                        return compPkd.startsWith(cleanRegPkd);
                    });
                });
                if (pkdMatch) {
                    isMatch = true;
                    matchedConfidence = 'certain';
                }
            }
            if (reg.trigger_data_fields && reg.trigger_data_fields.length > 0) {
                for (const field of reg.trigger_data_fields) {
                    if (field === 'is_registered_in_poland' || field === 'legal_form') {
                        continue;
                    }
                    if (typeof company[field] === 'boolean' && company[field] === true) {
                        isMatch = true;
                        matchedConfidence = reg.confidence_level || 'likely';
                    }
                    if (field === 'employee_count') {
                        if (reg.regulation_id === 'PL_HR_LABOUR' && company.employee_count >= 1) {
                            isMatch = true;
                            matchedConfidence = 'certain';
                        }
                        if (reg.regulation_id === 'PL_WHISTLEBLOWER' && company.employee_count >= 50) {
                            isMatch = true;
                            matchedConfidence = 'certain';
                        }
                        if (reg.regulation_id === 'PL_ZUS_IWA' && company.employee_count >= 10) {
                            isMatch = true;
                            matchedConfidence = 'certain';
                        }
                    }
                    if (field === 'revenue_pln' || field === 'assets_pln') {
                        if (reg.regulation_id === 'EU_CSRD_ESG') {
                            if (company.employee_count > 250 &&
                                (company.revenue_pln > 110000000 || company.assets_pln > 55000000)) {
                                isMatch = true;
                                matchedConfidence = 'certain';
                            }
                            else if (company.employee_count > 50) {
                                isMatch = true;
                                matchedConfidence = 'possible';
                            }
                        }
                    }
                }
            }
            if (isMatch) {
                const mappedReg = {
                    ...reg,
                    confidence_level: matchedConfidence,
                };
                matchedRegulations.push(mappedReg);
            }
        }
        const confidenceOrder = { certain: 0, likely: 1, possible: 2 };
        const penaltyOrder = { high: 0, medium: 1, low: 2 };
        matchedRegulations.sort((a, b) => {
            const confA = confidenceOrder[a.confidence_level || 'likely'];
            const confB = confidenceOrder[b.confidence_level || 'likely'];
            if (confA !== confB)
                return confA - confB;
            const penA = penaltyOrder[a.penalty_risk || 'medium'];
            const penB = penaltyOrder[b.penalty_risk || 'medium'];
            if (penA !== penB)
                return penA - penB;
            return a.area.localeCompare(b.area);
        });
        const byArea = {};
        const byConfidence = { certain: 0, likely: 0, possible: 0 };
        for (const reg of matchedRegulations) {
            byArea[reg.area] = (byArea[reg.area] || 0) + 1;
            const conf = reg.confidence_level || 'likely';
            byConfidence[conf] = (byConfidence[conf] || 0) + 1;
        }
        return {
            company,
            match_timestamp: new Date().toISOString(),
            analysis_summary: {
                total_regulations_checked: this.regulations.length,
                matched_count: matchedRegulations.length,
                by_area: byArea,
                by_confidence: byConfidence,
            },
            matched_regulations: matchedRegulations,
        };
    }
};
exports.MatchingEngineService = MatchingEngineService;
exports.MatchingEngineService = MatchingEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchingEngineService);
//# sourceMappingURL=matching-engine.service.js.map