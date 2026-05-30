import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LookupService } from './modules/lookup/lookup.service';
import { LookupController } from './modules/lookup/lookup.controller';
import { MatchingEngineService } from './modules/matching/matching-engine.service';
import { PdfReportService } from './modules/pdf/pdf-report.service';
import { PdfController } from './modules/pdf/pdf.controller';
import { PrismaService } from './database/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, LookupController, PdfController],
  providers: [AppService, LookupService, MatchingEngineService, PdfReportService, PrismaService],
})
export class AppModule {}
