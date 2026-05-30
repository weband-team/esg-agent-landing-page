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
exports.PdfReportService = void 0;
const common_1 = require("@nestjs/common");
const PDFDocument = require("pdfkit");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let PdfReportService = class PdfReportService {
    fontRegularPath;
    fontBoldPath;
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
    generateReport(matchingResult) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 30, left: 50, right: 50 },
                bufferPages: true,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            if (fs.existsSync(this.fontRegularPath)) {
                doc.registerFont('CustomRegular', this.fontRegularPath);
                doc.font('CustomRegular');
            }
            else {
                doc.font('Helvetica');
                console.warn('Roboto-Regular font not found, falling back to Helvetica. Polish characters may not render correctly.');
            }
            if (fs.existsSync(this.fontBoldPath)) {
                doc.registerFont('CustomBold', this.fontBoldPath);
            }
            const { company, analysis_summary, matched_regulations } = matchingResult;
            doc.fillColor('#0f172a');
            this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
            doc.fontSize(24).text('REGULATORY COMPLIANCE REPORT', { align: 'center' });
            doc.fontSize(14).text('Raport Zgodności Regulacyjnej i Obowiązków Prawnych', { align: 'center' });
            doc.moveDown(1.5);
            doc.strokeColor('#38bdf8').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);
            const startY = doc.y;
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
            this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
            doc.fontSize(10).text('PODSUMOWANIE / SUMMARY:', 310, startY);
            this.useFont(doc, 'CustomRegular', 'Helvetica');
            doc.fontSize(9);
            doc.moveDown(0.3);
            doc.text(`Data analizy / Date: ${new Date(matchingResult.match_timestamp).toLocaleString('pl-PL')}`);
            doc.text(`Analizowane wymogi / Inspected: ${analysis_summary.total_regulations_checked}`);
            doc.text(`Dopasowane obowiązki / Matched: ${analysis_summary.matched_count}`);
            this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
            doc.fillColor('#0284c7');
            doc.text(`Pewne / Certain: ${analysis_summary.by_confidence.certain || 0}`);
            doc.fillColor('#eab308');
            doc.text(`Prawdopodobne / Likely: ${analysis_summary.by_confidence.likely || 0}`);
            doc.fillColor('#94a3b8');
            doc.text(`Możliwe / Possible: ${analysis_summary.by_confidence.possible || 0}`);
            doc.moveDown(2);
            doc.y = Math.max(doc.y, startY + 110);
            doc.fillColor('#0f172a');
            this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
            doc.fontSize(14).text('Dopasowane Obowiązki Prawne / Matched Legal Obligations', 50, doc.y);
            doc.moveDown(0.5);
            const getRowHeight = (labelText, valueText) => {
                this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
                const labelH = doc.fontSize(8).heightOfString(labelText, { width: 95 });
                this.useFont(doc, 'CustomRegular', 'Helvetica');
                const valueH = doc.fontSize(8).heightOfString(valueText, { width: 375 });
                return Math.max(labelH, valueH);
            };
            const renderRow = (label, value, currentGridY, textColor = '#1e293b', valueTextColor = '#1e293b') => {
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
                this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
                const titleHeight = doc.fontSize(10).heightOfString(`${counter}. ${reg.name.pl} / ${reg.name.en}`, { width: 475 });
                const hObligation = getRowHeight('Obowiązek / Obligation:', `${reg.obligation_name.pl} / ${reg.obligation_name.en}`);
                const hBasis = getRowHeight('Podstawa prawna / Basis:', `${reg.legal_basis.pl} / ${reg.legal_basis.en}`);
                const hAuthority = getRowHeight('Organ / Authority:', `${reg.authority.pl} / ${reg.authority.en}`);
                const hDeadline = getRowHeight('Termin / Deadline:', `${reg.deadline.pl} / ${reg.deadline.en} (${reg.frequency.toUpperCase()})`);
                const hPenalties = getRowHeight('Kary / Penalties:', `${reg.penalty_description.pl} / ${reg.penalty_description.en}`);
                const hSource = getRowHeight('Link źródłowy / Official Source:', reg.official_source);
                const totalCardHeight = titleHeight + hObligation + hBasis + hAuthority + hDeadline + hPenalties + hSource + 58;
                if (doc.y + totalCardHeight > 760) {
                    doc.addPage();
                }
                else {
                    doc.moveDown(1);
                }
                const currentY = doc.y;
                doc.fillColor('#f8fafc')
                    .rect(50, currentY, 495, totalCardHeight)
                    .fill();
                const riskColors = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };
                const accentColor = riskColors[reg.penalty_risk] || '#94a3b8';
                doc.fillColor(accentColor)
                    .rect(50, currentY, 4, totalCardHeight)
                    .fill();
                doc.fillColor('#0f172a');
                this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
                doc.fontSize(10).text(`${counter}. ${reg.name.pl} / ${reg.name.en}`, 60, currentY + 5, { width: 475 });
                let badgeX = 60;
                const badgeY = doc.y + 3;
                this.drawBadge(doc, reg.area.replace('_', ' ').toUpperCase(), badgeX, badgeY, '#38bdf8', '#0369a1');
                badgeX += 130;
                const confColors = { certain: '#22c55e', likely: '#f59e0b', possible: '#94a3b8' };
                this.drawBadge(doc, (reg.confidence_level || 'likely').toUpperCase(), badgeX, badgeY, confColors[reg.confidence_level || 'likely'] || '#94a3b8', '#ffffff');
                badgeX += 80;
                this.drawBadge(doc, `RISK: ${reg.penalty_risk.toUpperCase()}`, badgeX, badgeY, accentColor, '#ffffff');
                doc.y = badgeY + 18;
                doc.moveDown(0.2);
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
                doc.fillColor('#1e293b');
                this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
                doc.fontSize(8).text('Link źródłowy / Official Source:', 60, currentGridY, { width: 95 });
                const labelEndY = doc.y;
                doc.fillColor('#0284c7');
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
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                const oldBottomMargin = doc.page.margins.bottom;
                doc.page.margins.bottom = 0;
                doc.fillColor('#94a3b8');
                this.useFont(doc, 'CustomRegular', 'Helvetica');
                doc.fontSize(8);
                doc.text(`Strona / Page ${i + 1} z / of ${range.count} | ESG Compliance Checker Addon | Anonymous Statless Report`, 50, 805, { align: 'center', width: 495 });
                doc.page.margins.bottom = oldBottomMargin;
            }
            doc.end();
        });
    }
    useFont(doc, customName, fallbackName) {
        if (fs.existsSync(this.fontRegularPath) || fs.existsSync(this.fontBoldPath)) {
            doc.font(customName);
        }
        else {
            doc.font(fallbackName);
        }
    }
    drawBadge(doc, text, x, y, bgColor, textColor) {
        doc.save();
        doc.fillColor(bgColor);
        const textWidth = doc.fontSize(7).widthOfString(text) + 12;
        doc.roundedRect(x, y, textWidth, 12, 3).fill();
        doc.fillColor(textColor);
        this.useFont(doc, 'CustomBold', 'Helvetica-Bold');
        doc.text(text, x + 6, y + 2.5);
        doc.restore();
    }
};
exports.PdfReportService = PdfReportService;
exports.PdfReportService = PdfReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfReportService);
//# sourceMappingURL=pdf-report.service.js.map