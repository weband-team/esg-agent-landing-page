import { MatchingResult } from '../matching/matching-engine.service';
export declare class PdfReportService {
    private fontRegularPath;
    private fontBoldPath;
    constructor();
    generateReport(matchingResult: MatchingResult): Promise<Buffer>;
    private useFont;
    private drawBadge;
}
