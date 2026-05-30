import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import * as path from 'path';
import * as fs from 'fs';
import { MatchingResult, Regulation } from '../matching/matching-engine.service';

@Injectable()
export class PdfReportService {
  private fontRegularPath: string;
  private fontBoldPath: string;

  constructor() {
    let fontRegular = path.join(__dirname, '..', '..', 'database', 'fonts', 'Roboto-Regular.ttf');
    if (!fs.existsSync(fontRegular)) {
      fontRegular = path.join(__dirname, '..', '..', '..', 'database', 'fonts', 'Roboto-Regular.ttf');
    }
    this.fontRegularPath = fontRegular;

    let fontBold = path.join(__dirname, '..', '..', 'database', 'fonts', 'Roboto-Bold.ttf');
    if (!fs.existsSync(fontBold)) {
      fontBold = path.join(__dirname, '..', '..', '..', 'database', 'fonts', 'Roboto-Bold.ttf');
    }
    this.fontBoldPath = fontBold;
  }

  public generateReport(matchingResult: MatchingResult): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 30, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Register and load custom fonts that support Polish diacritics
      if (fs.existsSync(this.fontRegularPath)) {
        doc.registerFont('CustomRegular', this.fontRegularPath);
        doc.font('CustomRegular');
      } else {
        doc.font('Helvetica');
        console.warn('Roboto-Regular font not found, falling back to Helvetica. Polish characters may not render correctly.');
      }

      if (fs.existsSync(this.fontBoldPath)) {
        doc.registerFont('CustomBold', this.fontBoldPath);
      }

      const { company, analysis_summary, matched_regulations } = matchingResult;

      // ==========================================
      // HEADER SECTION (Cover style)
      // ==========================================
      doc.fillColor('#0f172a'); // Slate 900
      this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
      doc.fontSize(24).text('REGULATORY COMPLIANCE REPORT', { align: 'center' });
      doc.fontSize(14).text('Raport Zgodności Regulacyjnej i Obowiązków Prawnych', { align: 'center' });
      doc.moveDown(1.5);

      // Draw a sleek line / divider
      doc.strokeColor('#38bdf8').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Company and Metadata block (Two columns)
      const startY = doc.y;
      
      // Column 1: Company details
      doc.fillColor('#1e293b');
      this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
      doc.fontSize(10).text('PODMIOT / COMPANY PROFILE:', 55, startY);
      this.useFont(doc, 'CustomRegular', 'Helvetica');
      doc.fontSize(9);
      doc.moveDown(0.3);
      doc.text(`Nazwa / Name: ${company.name}`);
      doc.text(`NIP / Tax ID: PL${company.nip}`);
      doc.text(`KRS / Registry: ${company.krs || 'N/A'}`);
      doc.text(`REGON: ${company.regon}`);
      doc.text(`Forma prawna / Legal: ${company.legal_form.toUpperCase()}`);
      doc.text(`Adres / Address: ${company.address.street}, ${company.address.postal_code} ${company.address.city}`);

      // Column 2: Audit summary details
      this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
      doc.fontSize(10).text('PODSUMOWANIE / SUMMARY:', 310, startY);
      this.useFont(doc, 'CustomRegular', 'Helvetica');
      doc.fontSize(9);
      doc.moveDown(0.3);
      doc.text(`Data analizy / Date: ${new Date(matchingResult.match_timestamp).toLocaleString('pl-PL')}`);
      doc.text(`Analizowane wymogi / Inspected: ${analysis_summary.total_regulations_checked}`);
      doc.text(`Dopasowane obowiązki / Matched: ${analysis_summary.matched_count}`);
      
      this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
      doc.fillColor('#0284c7'); // Blue
      doc.text(`Pewne / Certain: ${analysis_summary.by_confidence.certain || 0}`);
      doc.fillColor('#eab308'); // Amber
      doc.text(`Prawdopodobne / Likely: ${analysis_summary.by_confidence.likely || 0}`);
      doc.fillColor('#94a3b8'); // Gray
      doc.text(`Możliwe / Possible: ${analysis_summary.by_confidence.possible || 0}`);

      doc.moveDown(2);

      // Restore position below the boxes
      doc.y = Math.max(doc.y, startY + 110);

      // ==========================================
      // DETAILED MATCHED OBLIGATIONS SECTION
      // ==========================================
      doc.fillColor('#0f172a');
      this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
      doc.fontSize(14).text('Dopasowane Obowiązki Prawne / Matched Legal Obligations', 50, doc.y);
      doc.moveDown(0.5);

      // Helper to calculate exact row height
      const getRowHeight = (labelText: string, valueText: string) => {
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        const labelH = doc.fontSize(8).heightOfString(labelText, { width: 95 });
        this.useFont(doc, 'CustomRegular', 'Helvetica');
        const valueH = doc.fontSize(8).heightOfString(valueText, { width: 375 });
        return Math.max(labelH, valueH);
      };

      // Helper to render a row with precise alignments and bounding
      const renderRow = (label: string, value: string, currentGridY: number, textColor = '#1e293b', valueTextColor = '#1e293b') => {
        doc.fillColor(textColor);
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        doc.fontSize(8).text(label, 60, currentGridY, { width: 95 });
        const labelEndY = doc.y;

        doc.fillColor(valueTextColor);
        this.useFont(doc, 'CustomRegular', 'Helvetica');
        doc.fontSize(8).text(value, 160, currentGridY, { width: 375 });
        const valueEndY = doc.y;

        doc.y = Math.max(labelEndY, valueEndY);
        return doc.y;
      };

      let counter = 1;
      for (const reg of matched_regulations) {
        // --- 1. CALCULATE EXACT CARD HEIGHT ---
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        const titleHeight = doc.fontSize(10).heightOfString(
          `${counter}. ${reg.name.pl} / ${reg.name.en}`,
          { width: 475 }
        );

        const hObligation = getRowHeight('Obowiązek / Obligation:', `${reg.obligation_name.pl} / ${reg.obligation_name.en}`);
        const hBasis = getRowHeight('Podstawa prawna / Basis:', `${reg.legal_basis.pl} / ${reg.legal_basis.en}`);
        const hAuthority = getRowHeight('Organ / Authority:', `${reg.authority.pl} / ${reg.authority.en}`);
        const hDeadline = getRowHeight('Termin / Deadline:', `${reg.deadline.pl} / ${reg.deadline.en} (${reg.frequency.toUpperCase()})`);
        const hPenalties = getRowHeight('Kary / Penalties:', `${reg.penalty_description.pl} / ${reg.penalty_description.en}`);
        const hSource = getRowHeight('Link źródłowy / Official Source:', reg.official_source);

        // Calculate card height using our exact math:
        // 58 is the total vertical padding + badges height + field spacings + extra safety buffer
        const totalCardHeight = titleHeight + hObligation + hBasis + hAuthority + hDeadline + hPenalties + hSource + 58;

        // --- 2. PAGINATION INTEGRITY CHECK ---
        // If the entire card cannot fit on the current page, add a page first.
        // We set a conservative threshold of 760 to guarantee no automatic page breaks occur mid-card.
        if (doc.y + totalCardHeight > 760) {
          doc.addPage();
        } else {
          doc.moveDown(1);
        }

        const currentY = doc.y;

        // --- 3. DRAW CARD BACKGROUND AND LEFT ACCENT BAR ---
        // Draw card background container with exact computed height
        doc.fillColor('#f8fafc') // Slate 50
          .rect(50, currentY, 495, totalCardHeight)
          .fill();

        // Draw left risk accent bar with exact computed height
        const riskColors = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };
        const accentColor = riskColors[reg.penalty_risk] || '#94a3b8';
        doc.fillColor(accentColor)
          .rect(50, currentY, 4, totalCardHeight)
          .fill();

        // --- 4. RENDER TEXT CONTENT ON TOP OF BACKGROUND ---
        // Render Title
        doc.fillColor('#0f172a');
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        doc.fontSize(10).text(
          `${counter}. ${reg.name.pl} / ${reg.name.en}`,
          60,
          currentY + 5,
          { width: 475 }
        );

        // Render Badges
        let badgeX = 60;
        const badgeY = doc.y + 3;

        // Area badge
        this.drawBadge(doc, reg.area.replace('_', ' ').toUpperCase(), badgeX, badgeY, '#38bdf8', '#0369a1');
        badgeX += 130;

        // Confidence badge
        const confColors = { certain: '#22c55e', likely: '#f59e0b', possible: '#94a3b8' };
        this.drawBadge(doc, (reg.confidence_level || 'likely').toUpperCase(), badgeX, badgeY, confColors[reg.confidence_level || 'likely'] || '#94a3b8', '#ffffff');
        badgeX += 80;

        // Risk badge
        this.drawBadge(doc, `RISK: ${reg.penalty_risk.toUpperCase()}`, badgeX, badgeY, accentColor, '#ffffff');

        doc.y = badgeY + 18;
        doc.moveDown(0.2);

        // Render Fields Grid
        let currentGridY = doc.y;

        currentGridY = renderRow('Obowiązek / Obligation:', `${reg.obligation_name.pl} / ${reg.obligation_name.en}`, currentGridY);
        doc.moveDown(0.3);
        currentGridY = doc.y;

        currentGridY = renderRow('Podstawa prawna / Basis:', `${reg.legal_basis.pl} / ${reg.legal_basis.en}`, currentGridY);
        doc.moveDown(0.3);
        currentGridY = doc.y;

        currentGridY = renderRow('Organ / Authority:', `${reg.authority.pl} / ${reg.authority.en}`, currentGridY);
        doc.moveDown(0.3);
        currentGridY = doc.y;

        currentGridY = renderRow('Termin / Deadline:', `${reg.deadline.pl} / ${reg.deadline.en} (${reg.frequency.toUpperCase()})`, currentGridY);
        doc.moveDown(0.3);
        currentGridY = doc.y;

        currentGridY = renderRow('Kary / Penalties:', `${reg.penalty_description.pl} / ${reg.penalty_description.en}`, currentGridY, '#1e293b', '#7f1d1d');
        doc.moveDown(0.3);
        currentGridY = doc.y;

        // For the source link, we want to make it clickable
        doc.fillColor('#1e293b');
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        doc.fontSize(8).text('Link źródłowy / Official Source:', 60, currentGridY, { width: 95 });
        const labelEndY = doc.y;

        doc.fillColor('#0284c7'); // Blue for clickable links
        this.useFont(doc, 'CustomRegular', 'Helvetica');
        doc.fontSize(8).text(reg.official_source, 160, currentGridY, {
          width: 375,
          link: reg.official_source,
          underline: true,
        });
        const valueEndY = doc.y;

        doc.y = Math.max(labelEndY, valueEndY);

        doc.moveDown(0.6);
        counter++;
      }

      // ==========================================
      // PAGE NUMBERS FOOTER
      // ==========================================
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        
        // Temporarily disable the bottom margin constraint to prevent PDFKit from triggering 
        // a premature, automatic page break during footer rendering.
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc.fillColor('#94a3b8');
        this.useFont(doc, 'CustomRegular', 'Helvetica');
        doc.fontSize(8);
        doc.text(
          `Strona / Page ${i + 1} z / of ${range.count} | ESG Compliance Checker Addon | Anonymous Statless Report`,
          50,
          805, // Render footer neatly lower on the page (within the 30pt bottom margin)
          { align: 'center', width: 495 }
        );

        // Restore bottom margin
        doc.page.margins.bottom = oldBottomMargin;
      }

      doc.end();
    });
  }

  private useFont(doc: PDFKit.PDFDocument, customName: string, fallbackName: string) {
    if (fs.existsSync(this.fontRegularPath) || fs.existsSync(this.fontBoldPath)) {
      doc.font(customName);
    } else {
      doc.font(fallbackName);
    }
  }

  private drawBadge(
    doc: PDFKit.PDFDocument,
    text: string,
    x: number,
    y: number,
    bgColor: string,
    textColor: string,
  ) {
    doc.save();
    
    // Draw rounded background rectangle
    doc.fillColor(bgColor);
    const textWidth = doc.fontSize(7).widthOfString(text) + 12;
    doc.roundedRect(x, y, textWidth, 12, 3).fill();

    // Draw text inside
    doc.fillColor(textColor);
    this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
    doc.text(text, x + 6, y + 2.5);

    doc.restore();
  }
}
