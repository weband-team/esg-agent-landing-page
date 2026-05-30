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
exports.LookupService = void 0;
const common_1 = require("@nestjs/common");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const nip_validator_1 = require("./nip-validator");
const prisma_service_1 = require("../../database/prisma.service");
let LookupService = class LookupService {
    prisma;
    mockCompanies = [];
    constructor(prisma) {
        this.prisma = prisma;
        this.loadMockCompanies();
    }
    loadMockCompanies() {
        try {
            let filePath = path.join(__dirname, '..', '..', 'database', 'mock_companies.json');
            if (!fs.existsSync(filePath)) {
                filePath = path.join(__dirname, '..', '..', '..', 'database', 'mock_companies.json');
            }
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            this.mockCompanies = JSON.parse(fileContent);
        }
        catch (error) {
            console.error('Failed to load mock companies database:', error);
            this.mockCompanies = [];
        }
    }
    ensureMockCompaniesLoaded() {
        if (this.mockCompanies.length === 0) {
            this.loadMockCompanies();
        }
    }
    validate(nip) {
        return (0, nip_validator_1.validateNip)(nip);
    }
    inferPkdAndMockFlags(name, legalForm) {
        const cleanName = name.toUpperCase();
        let pkd = ['62.01.Z'];
        let employees = 12;
        let revenue = 3500000;
        let assets = 1500000;
        let flags = {
            has_contractors: true,
            processes_personal_data: true,
            processes_sensitive_data_large_scale: false,
            monitors_subjects_large_scale: false,
            has_combustion: false,
            has_company_vehicles: true,
            has_boilers: false,
            has_process_emissions: false,
            has_energy_activities: false,
            has_telecom_activities: false,
            has_payment_services: false,
            has_foreign_workers: false,
            introduces_packaged_goods: false,
            generates_hazardous_waste: false,
            has_cross_border_payments: false,
            has_related_party_transactions: false,
        };
        if (cleanName.includes('METAL') ||
            cleanName.includes('PRODUKC') ||
            cleanName.includes('HUTA') ||
            cleanName.includes('FABRYK') ||
            cleanName.includes('STAL') ||
            cleanName.includes('BUDOW')) {
            pkd = ['24.10.Z', '25.11.Z'];
            employees = 150;
            revenue = 45000000;
            assets = 20000000;
            flags.has_combustion = true;
            flags.has_boilers = true;
            flags.has_process_emissions = true;
            flags.introduces_packaged_goods = true;
            flags.generates_hazardous_waste = true;
            flags.has_cross_border_payments = true;
            flags.has_related_party_transactions = true;
        }
        else if (cleanName.includes('RESTAUR') ||
            cleanName.includes('CAFE') ||
            cleanName.includes('BAR') ||
            cleanName.includes('SMAK') ||
            cleanName.includes('JEDZENIE') ||
            cleanName.includes('GASTRON') ||
            cleanName.includes('SPOŻYW')) {
            pkd = ['56.10.A'];
            employees = 6;
            revenue = 950000;
            assets = 300000;
        }
        else if (cleanName.includes('TRANSPORT') ||
            cleanName.includes('LOGISTY') ||
            cleanName.includes('CARGO') ||
            cleanName.includes('SPEDY') ||
            cleanName.includes('SHIPPING') ||
            cleanName.includes('AUTO')) {
            pkd = ['49.41.Z'];
            employees = 45;
            revenue = 18000000;
            assets = 8000000;
            flags.has_company_vehicles = true;
            flags.has_foreign_workers = true;
            flags.has_cross_border_payments = true;
        }
        else if (legalForm === 'sa') {
            employees = 180;
            revenue = 65000000;
            assets = 35000000;
        }
        else if (legalForm === 'sole_trader') {
            employees = 1;
            revenue = 180000;
            assets = 50000;
            flags.has_contractors = false;
            flags.has_company_vehicles = false;
        }
        return { pkd, employees, revenue, assets, flags };
    }
    async findByNip(nip, customEmployees, customRevenue, customAssets) {
        this.ensureMockCompaniesLoaded();
        const validation = this.validate(nip);
        if (!validation.isValid) {
            throw new common_1.BadRequestException({
                message: 'Invalid NIP format or foreign prefix',
                validation,
            });
        }
        const cleanNip = validation.cleanNip;
        let company = null;
        try {
            const dbComp = await this.prisma.company.findUnique({
                where: { nip: cleanNip },
            });
            if (dbComp) {
                const localMock = this.mockCompanies.find((c) => c.nip === cleanNip);
                if (localMock) {
                    company = localMock;
                }
                else {
                    const inferred = this.inferPkdAndMockFlags(dbComp.name, dbComp.legal_form);
                    company = {
                        nip: dbComp.nip,
                        name: dbComp.name,
                        legal_form: dbComp.legal_form,
                        krs: dbComp.krs || '',
                        regon: dbComp.regon || '',
                        registration_date: '2015-01-01',
                        address: dbComp.address,
                        pkd: dbComp.pkd_codes,
                        is_registered_in_poland: true,
                        is_vat_taxpayer: true,
                        revenue_pln: dbComp.revenue_pln,
                        assets_pln: dbComp.assets_pln,
                        employee_count: dbComp.employee_count,
                        is_sole_trader: dbComp.legal_form === 'sole_trader',
                        ...inferred.flags,
                    };
                }
            }
        }
        catch (err) {
            console.warn('Database query failed in LookupService, falling back to JSON storage:', err.message);
        }
        if (!company) {
            company = this.mockCompanies.find((c) => c.nip === cleanNip);
        }
        let companyObj;
        if (!company) {
            try {
                const now = new Date();
                const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                const dateStr = yesterday.toISOString().split('T')[0];
                const url = `https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${dateStr}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Government API responded with status ${response.status}`);
                }
                const data = await response.json();
                if (!data || !data.result || !data.result.subject) {
                    throw new common_1.NotFoundException({
                        message: 'Podmiot o podanym numerze NIP nie został odnaleziony w oficjalnym wykazie podatników Ministerstwa Finansów.',
                        enMessage: 'The company with the provided NIP was not found in the official registry of the Ministry of Finance.',
                    });
                }
                const subject = data.result.subject;
                const name = subject.name || 'Unknown Company';
                const nameUpper = name.toUpperCase();
                let legalForm = 'sole_trader';
                if (nameUpper.includes('SPÓŁKA Z OGRANICZONĄ') || nameUpper.includes('SP. Z O.O.')) {
                    legalForm = 'sp_z_o_o';
                }
                else if (nameUpper.includes('SPÓŁKA AKCYJNA') || nameUpper.includes('S.A.')) {
                    legalForm = 'sa';
                }
                else if (nameUpper.includes('SPÓŁKA JAWNA') || nameUpper.includes('SP. J.')) {
                    legalForm = 'sp_j';
                }
                else if (nameUpper.includes('SPÓŁKA KOMANDYTOWA') || nameUpper.includes('SP. K.')) {
                    legalForm = 'sp_k';
                }
                const addrStr = subject.workingAddress || subject.residenceAddress || '';
                let address = {
                    street: 'Brak adresu / Street not found',
                    city: 'Warszawa',
                    postal_code: '00-001',
                    country: 'Polska',
                };
                if (addrStr) {
                    const parts = addrStr.split(',');
                    if (parts.length >= 2) {
                        const street = parts[0].trim();
                        const rest = parts[1].trim();
                        const zipCityMatch = rest.match(/^(\d{2}-\d{3})\s+(.+)$/);
                        if (zipCityMatch) {
                            address = {
                                street,
                                postal_code: zipCityMatch[1],
                                city: zipCityMatch[2].trim(),
                                country: 'Polska',
                            };
                        }
                        else {
                            address = {
                                street,
                                city: rest,
                                postal_code: '00-001',
                                country: 'Polska',
                            };
                        }
                    }
                    else {
                        address.street = addrStr;
                    }
                }
                const inferred = this.inferPkdAndMockFlags(name, legalForm);
                companyObj = {
                    nip: cleanNip,
                    name,
                    legal_form: legalForm,
                    krs: subject.krs || '',
                    regon: subject.regon || '',
                    registration_date: subject.registrationLegalDate || '2015-01-01',
                    address,
                    pkd: inferred.pkd,
                    is_registered_in_poland: true,
                    is_vat_taxpayer: subject.statusVat === 'Czynny',
                    revenue_pln: inferred.revenue,
                    assets_pln: inferred.assets,
                    employee_count: inferred.employees,
                    is_sole_trader: legalForm === 'sole_trader',
                    ...inferred.flags,
                };
            }
            catch (err) {
                console.error('Error querying wl-api.mf.gov.pl:', err);
                if (err instanceof common_1.NotFoundException) {
                    throw err;
                }
                throw new common_1.BadRequestException({
                    message: `Wyszukiwanie NIP nie powiodło się: ${err.message}`,
                    enMessage: `NIP lookup failed: ${err.message}`,
                });
            }
        }
        else {
            companyObj = JSON.parse(JSON.stringify(company));
        }
        if (customEmployees !== undefined && !isNaN(customEmployees)) {
            companyObj.employee_count = customEmployees;
        }
        if (customRevenue !== undefined && !isNaN(customRevenue)) {
            companyObj.revenue_pln = customRevenue;
        }
        if (customAssets !== undefined && !isNaN(customAssets)) {
            companyObj.assets_pln = customAssets;
        }
        return companyObj;
    }
    getAllMockNips() {
        this.ensureMockCompaniesLoaded();
        return this.mockCompanies.map((c) => c.nip);
    }
};
exports.LookupService = LookupService;
exports.LookupService = LookupService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LookupService);
//# sourceMappingURL=lookup.service.js.map