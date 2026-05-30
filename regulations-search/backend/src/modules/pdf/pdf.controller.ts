import { Controller, Get, Param, Res, Header, Query } from '@nestjs/common';
import * as express from 'express';
import { LookupService } from '../lookup/lookup.service';
import { MatchingEngineService } from '../matching/matching-engine.service';
import { PdfReportService } from './pdf-report.service';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly lookupService: LookupService,
    private readonly matchingEngineService: MatchingEngineService,
    private readonly pdfReportService: PdfReportService,
  ) {}

  @Get('download/:nip')
  async downloadReport(
    @Param('nip') nip: string,
    @Query('employees') employees: string,
    @Query('revenue') revenue: string,
    @Query('assets') assets: string,
    @Res() res: express.Response,
  ) {
    try {
      const customEmployees = employees ? parseInt(employees, 10) : undefined;
      const customRevenue = revenue ? parseInt(revenue, 10) : undefined;
      const customAssets = assets ? parseInt(assets, 10) : undefined;

      // 1. Fetch company and match regulations
      const company = await this.lookupService.findByNip(nip, customEmployees, customRevenue, customAssets);
      const results = this.matchingEngineService.matchCompany(company);

      // 2. Generate PDF report
      const pdfBuffer = await this.pdfReportService.generateReport(results);

      // 3. Format filename: Compliance_Report_[NIP]_[YYYY-MM-DD].pdf
      const today = new Date().toISOString().split('T')[0];
      const filename = `Compliance_Report_${company.nip}_${today}.pdf`;

      // 4. Configure response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // 5. Send PDF buffer
      res.end(pdfBuffer);
    } catch (error) {
      console.error('Failed to generate PDF download:', error);
      res.status(error.status || 500).json({
        message: error.message || 'An error occurred during PDF generation',
        error: error.response || 'Internal Server Error',
      });
    }
  }
}
