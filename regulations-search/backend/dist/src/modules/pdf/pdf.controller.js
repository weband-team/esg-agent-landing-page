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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const lookup_service_1 = require("../lookup/lookup.service");
const matching_engine_service_1 = require("../matching/matching-engine.service");
const pdf_report_service_1 = require("./pdf-report.service");
let PdfController = class PdfController {
    lookupService;
    matchingEngineService;
    pdfReportService;
    constructor(lookupService, matchingEngineService, pdfReportService) {
        this.lookupService = lookupService;
        this.matchingEngineService = matchingEngineService;
        this.pdfReportService = pdfReportService;
    }
    async downloadReport(nip, employees, revenue, assets, res) {
        try {
            const customEmployees = employees ? parseInt(employees, 10) : undefined;
            const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
            const customAssets = assets ? parseInt(assets, 10) : undefined;
            const company = await this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets);
            const results = this.matchingEngineService.matchCompany(company);
            const pdfBuffer = await this.pdfReportService.generateReport(results);
            const today = new Date().toISOString().split('T')[0];
            const filename = `Compliance_Report_${company.nip}_${today}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.end(pdfBuffer);
        }
        catch (error) {
            console.error('Failed to generate PDF download:', error);
            res.status(error.status || 500).json({
                message: error.message || 'An error occurred during PDF generation',
                error: error.response || 'Internal Server Error',
            });
        }
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Get)('download/:nip'),
    __param(0, (0, common_1.Param)('nip')),
    __param(1, (0, common_1.Query)('employees')),
    __param(2, (0, common_1.Query)('revenue')),
    __param(3, (0, common_1.Query)('assets')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "downloadReport", null);
exports.PdfController = PdfController = __decorate([
    (0, common_1.Controller)('pdf'),
    __metadata("design:paramtypes", [lookup_service_1.LookupService,
        matching_engine_service_1.MatchingEngineService,
        pdf_report_service_1.PdfReportService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map