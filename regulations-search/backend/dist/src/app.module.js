"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const lookup_service_1 = require("./modules/lookup/lookup.service");
const lookup_controller_1 = require("./modules/lookup/lookup.controller");
const matching_engine_service_1 = require("./modules/matching/matching-engine.service");
const pdf_report_service_1 = require("./modules/pdf/pdf-report.service");
const pdf_controller_1 = require("./modules/pdf/pdf.controller");
const prisma_service_1 = require("./database/prisma.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [app_controller_1.AppController, lookup_controller_1.LookupController, pdf_controller_1.PdfController],
        providers: [app_service_1.AppService, lookup_service_1.LookupService, matching_engine_service_1.MatchingEngineService, pdf_report_service_1.PdfReportService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map