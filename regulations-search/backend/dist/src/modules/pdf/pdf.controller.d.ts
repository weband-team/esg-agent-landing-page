import * as express from 'express';
import { LookupService } from '../lookup/lookup.service';
import { MatchingEngineService } from '../matching/matching-engine.service';
import { PdfReportService } from './pdf-report.service';
export declare class PdfController {
    private readonly lookupService;
    private readonly matchingEngineService;
    private readonly pdfReportService;
    constructor(lookupService: LookupService, matchingEngineService: MatchingEngineService, pdfReportService: PdfReportService);
    downloadReport(nip: string, employees: string, revenue: string, assets: string, res: express.Response): Promise<void>;
}
