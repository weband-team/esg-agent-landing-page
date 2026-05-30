"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const lookup_service_1 = require("./lookup.service");
const matching_engine_service_1 = require("../matching/matching-engine.service");
let LookupController = class LookupController {
    lookupService;
    matchingEngineService;
    constructor(lookupService, matchingEngineService) {
        this.lookupService = lookupService;
        this.matchingEngineService = matchingEngineService;
    }
    validateNip(nip) {
        return this.lookupService.validate(nip);
    }
    async directLookup(nip, employees, revenue, assets) {
        const customEmployees = employees ? parseInt(employees, 10) : undefined;
        const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
        const customAssets = assets ? parseInt(assets, 10) : undefined;
        const company = await this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets);
        return this.matchingEngineService.matchCompany(company);
    }
    streamProgress(nip, employees, revenue, assets) {
        const customEmployees = employees ? parseInt(employees, 10) : undefined;
        const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
        const customAssets = assets ? parseInt(assets, 10) : undefined;
        const validation = this.lookupService.validate(nip);
        if (!validation.isValid) {
            return (0, rxjs_1.of)({
                type: 'error',
                data: {
                    message: 'Invalid NIP format or foreign prefix',
                    errorType: validation.errorType,
                    prefix: validation.prefix,
                },
            });
        }
        const step1$ = (0, rxjs_1.of)({
            type: 'step',
            data: {
                step: 1,
                title: {
                    pl: 'Rozpoczynanie weryfikacji NIP...',
                    en: 'Starting NIP validation...',
                },
                status: 'success',
            },
        });
        const lookupAndRemainingSteps$ = (0, rxjs_1.from)(this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets)).pipe((0, operators_1.mergeMap)((company) => {
            const matchingResult = this.matchingEngineService.matchCompany(company);
            const remainingSteps = [
                {
                    step: 2,
                    title: {
                        pl: 'Pobieranie danych rejestrowych CEIDG/KRS...',
                        en: 'Retrieving CEIDG/KRS registry data...',
                    },
                    status: 'success',
                    meta: {
                        name: company.name,
                        krs: company.krs,
                        regon: company.regon,
                        address: `${company.address.street}, ${company.address.city}`,
                    },
                },
                {
                    step: 3,
                    title: {
                        pl: 'Uruchamianie 7-stopniowego silnika dopasowania PKD...',
                        en: 'Running 7-step PKD matching engine...',
                    },
                    status: 'success',
                },
                {
                    step: 4,
                    title: {
                        pl: 'Sprawdzanie progów wielkościowych, finansowych i zatrudnienia...',
                        en: 'Checking size, financial, and employment thresholds...',
                    },
                    status: 'success',
                    meta: {
                        employees: company.employee_count,
                        revenue: company.revenue_pln,
                    },
                },
                {
                    step: 5,
                    title: {
                        pl: 'Nakładanie unijnych regulacji sektorowych (ESG/CSRD/GDPR)...',
                        en: 'Applying EU sector-specific overlays (ESG/CSRD/GDPR)...',
                    },
                    status: 'success',
                },
                {
                    step: 6,
                    title: {
                        pl: 'Kategoryzacja obowiązków i generowanie rejestru...',
                        en: 'Categorizing obligations and generating registry...',
                    },
                    status: 'success',
                },
            ];
            const stepObservables = remainingSteps.map((stepData, index) => {
                return (0, rxjs_1.of)({
                    type: 'step',
                    data: stepData,
                }).pipe((0, operators_1.delay)((index + 1) * 600));
            });
            const resultObservable = (0, rxjs_1.of)({
                type: 'result',
                data: matchingResult,
            }).pipe((0, operators_1.delay)((remainingSteps.length + 1) * 600));
            return (0, rxjs_1.concat)(...stepObservables, resultObservable);
        }), (0, operators_1.catchError)((err) => {
            console.error('SSE Lookup or Matching Error:', err);
            return (0, rxjs_1.of)({
                type: 'error',
                data: { message: err.message || 'Analysis error occurred.' },
            });
        }));
        return (0, rxjs_1.concat)(step1$, lookupAndRemainingSteps$);
    }
};
exports.LookupController = LookupController;
__decorate([
    (0, common_1.Get)('validate/:nip'),
    __param(0, (0, common_1.Param)('nip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LookupController.prototype, "validateNip", null);
__decorate([
    (0, common_1.Get)('direct/:nip'),
    __param(0, (0, common_1.Param)('nip')),
    __param(1, (0, common_1.Query)('employees')),
    __param(2, (0, common_1.Query)('revenue')),
    __param(3, (0, common_1.Query)('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], LookupController.prototype, "directLookup", null);
__decorate([
    (0, common_1.Sse)('progress/:nip'),
    __param(0, (0, common_1.Param)('nip')),
    __param(1, (0, common_1.Query)('employees')),
    __param(2, (0, common_1.Query)('revenue')),
    __param(3, (0, common_1.Query)('assets')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", rxjs_1.Observable)
], LookupController.prototype, "streamProgress", null);
exports.LookupController = LookupController = __decorate([
    (0, common_1.Controller)('lookup'),
    __metadata("design:paramtypes", [lookup_service_1.LookupService,
        matching_engine_service_1.MatchingEngineService])
], LookupController);
//# sourceMappingURL=lookup.controller.js.map