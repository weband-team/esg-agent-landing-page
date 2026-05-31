// ──────────────────────────────────────────────────────────────────────────
// Carbon Footprint Calculator — client-side PDF report generator (jsPDF)
//
// Builds the 7-section report defined in the technical spec (§7) programmatically
// with jsPDF primitives (no html2canvas / Chart.js). jsPDF is loaded lazily from
// a CDN (same approach as the Benchmark module) via ensureJsPdf().
// ──────────────────────────────────────────────────────────────────────────

import {
  CompanyProfile,
  CalculationResults,
  BreakdownSlice,
  EMISSION_FACTORS,
} from './engine';

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

declare global {
  interface Window {
    jspdf?: { jsPDF: new (opts?: any) => any };
  }
}

/** Lazily inject the jsPDF UMD bundle; resolves once window.jspdf is available. */
export function ensureJsPdf(): Promise<{ jsPDF: new (opts?: any) => any }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('PDF generation is only available in the browser.'));
      return;
    }
    if (window.jspdf?.jsPDF) {
      resolve(window.jspdf);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${JSPDF_CDN}"]`);
    const onLoad = () => {
      if (window.jspdf?.jsPDF) resolve(window.jspdf);
      else reject(new Error('jsPDF failed to initialise.'));
    };
    if (existing) {
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', () => reject(new Error('Failed to load jsPDF.')));
      return;
    }
    const s = document.createElement('script');
    s.src = JSPDF_CDN;
    s.async = true;
    s.onload = onLoad;
    s.onerror = () => reject(new Error('Failed to load jsPDF.'));
    document.head.appendChild(s);
  });
}

// ── Unicode font embedding ───────────────────────────────────────────────────
// jsPDF's built-in Helvetica only supports Latin-1 (WinAnsi), which mangles
// Polish characters (ą, ł, ń, ś, ż, ź, ó, ę, ć). We embed DejaVu Sans (full
// Polish + ₂ subscript coverage), fetched once from a CORS-enabled CDN and
// cached as base64, then registered on each jsPDF document.
const FONT_FAMILY = 'DejaVuSans';
const FONT_URLS = {
  regular: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',
  bold: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',
};
let fontCache: { regular: string; bold: string } | null = null;

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

/**
 * Registers DejaVu Sans (normal + bold) on the given jsPDF document and returns
 * the font family name. Throws if the font cannot be fetched — callers should
 * fall back to 'helvetica' so PDF generation still succeeds offline.
 */
async function ensureUnicodeFont(doc: any): Promise<string> {
  if (!fontCache) {
    const [regBuf, boldBuf] = await Promise.all([
      fetch(FONT_URLS.regular).then((r) => {
        if (!r.ok) throw new Error(`font fetch failed: ${r.status}`);
        return r.arrayBuffer();
      }),
      fetch(FONT_URLS.bold).then((r) => {
        if (!r.ok) throw new Error(`font fetch failed: ${r.status}`);
        return r.arrayBuffer();
      }),
    ]);
    fontCache = { regular: arrayBufferToBase64(regBuf), bold: arrayBufferToBase64(boldBuf) };
  }
  doc.addFileToVFS('DejaVuSans.ttf', fontCache.regular);
  doc.addFont('DejaVuSans.ttf', FONT_FAMILY, 'normal');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', fontCache.bold);
  doc.addFont('DejaVuSans-Bold.ttf', FONT_FAMILY, 'bold');
  return FONT_FAMILY;
}

// Brand palette (spec design tokens)
const GREEN = '#16a34a';
const GREEN_LIGHT = '#dcfce7';
const TEXT = '#2C3E50';
const MUTED = '#6C757D';
const BORDER = '#DEE2E6';

const SCOPE_COLORS: Record<BreakdownSlice['key'], string> = {
  stationary: '#16a34a',
  mobile: '#0ea5e9',
  fugitive: '#f59e0b',
  scope2: '#8b5cf6',
};

const fmt = (n: number, dp = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

interface PdfInput {
  profile: CompanyProfile;
  results: CalculationResults;
  slices: BreakdownSlice[];
  lang: 'pl' | 'en';
  generatedAt?: string; // ISO date; defaults to today
}

export interface GeneratedPdf {
  blob: Blob;
  base64: string;       // raw base64 (no data: prefix) — ready for the email route
  filename: string;
  save: () => void;     // triggers a browser download
}

const T = (lang: 'pl' | 'en', pl: string, en: string) => (lang === 'pl' ? pl : en);

export async function generateCarbonPdf(input: PdfInput): Promise<GeneratedPdf> {
  const { profile, results, slices, lang } = input;
  const { jsPDF } = await ensureJsPdf();
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  // Embed a Unicode font so Polish characters render correctly; fall back to
  // Helvetica if the font cannot be loaded (offline) so generation still works.
  let FONT = 'helvetica';
  try {
    FONT = await ensureUnicodeFont(doc);
  } catch (e) {
    FONT = 'helvetica';
  }
  doc.setFont(FONT, 'normal');

  const PW = doc.internal.pageSize.getWidth();   // 210
  const PH = doc.internal.pageSize.getHeight();  // 297
  const MX = 16;                                 // left/right margin
  const CW = PW - MX * 2;                         // content width
  let y = 0;

  const dateStr = (input.generatedAt ? new Date(input.generatedAt) : new Date()).toLocaleDateString(
    lang === 'pl' ? 'pl-PL' : 'en-GB'
  );

  const setFill = (hex: string) => doc.setFillColor(hex);
  const setText = (hex: string) => doc.setTextColor(hex);

  const footer = () => {
    doc.setFont(FONT, 'normal');
    doc.setFontSize(8);
    setText(MUTED);
    doc.text(
      T(lang, 'Kalkulator Śladu Węglowego — F-Suite', 'Carbon Footprint Calculator — F-Suite'),
      MX,
      PH - 8
    );
    doc.text('info@f-suite.com', PW - MX, PH - 8, { align: 'right' });
  };

  const sectionHeader = (title: string) => {
    if (y > PH - 40) { footer(); doc.addPage(); y = 20; }
    doc.setFont(FONT, 'bold');
    doc.setFontSize(13);
    setText(TEXT);
    doc.text(title, MX, y);
    y += 2.5;
    setFill(GREEN);
    doc.rect(MX, y, 26, 1.1, 'F');
    y += 7;
  };

  const paragraph = (text: string, size = 9.5, color = MUTED) => {
    doc.setFont(FONT, 'normal');
    doc.setFontSize(size);
    setText(color);
    const lines = doc.splitTextToSize(text, CW);
    for (const ln of lines) {
      if (y > PH - 18) { footer(); doc.addPage(); y = 20; }
      doc.text(ln, MX, y);
      y += size * 0.52;
    }
    y += 2;
  };

  // ── 1. COVER PAGE ──────────────────────────────────────────────────────────
  setFill('#052e16');
  doc.rect(0, 0, PW, PH, 'F');
  setFill(GREEN);
  doc.rect(0, 86, PW, 0.8, 'F');

  doc.setFont(FONT, 'bold');
  doc.setFontSize(11);
  setText('#86efac');
  doc.text('GHG PROTOCOL · SCOPE 1 & 2', MX, 40);

  doc.setFontSize(30);
  setText('#ffffff');
  doc.text(T(lang, 'Raport Śladu', 'Carbon Footprint'), MX, 60);
  doc.text(T(lang, 'Węglowego', 'Report'), MX, 74);

  doc.setFont(FONT, 'normal');
  doc.setFontSize(12);
  setText('#cbd5e1');
  doc.text(profile.name || T(lang, 'Twoja firma', 'Your company'), MX, 104);

  doc.setFontSize(10);
  setText('#94a3b8');
  doc.text(`${T(lang, 'Rok sprawozdawczy', 'Reporting year')}: ${profile.reportingYear}`, MX, 116);
  doc.text(`${T(lang, 'Data wygenerowania', 'Generated')}: ${dateStr}`, MX, 124);
  if (profile.industry) doc.text(`${T(lang, 'Branża', 'Industry')}: ${profile.industry}`, MX, 132);

  // Headline KPI on the cover
  setFill('#0f2d1e');
  doc.roundedRect(MX, 150, CW, 34, 3, 3, 'F');
  doc.setFont(FONT, 'normal');
  doc.setFontSize(10);
  setText('#86efac');
  doc.text(T(lang, 'Emisje całkowite (location-based)', 'Total emissions (location-based)'), MX + 8, 162);
  doc.setFont(FONT, 'bold');
  doc.setFontSize(26);
  setText('#ffffff');
  doc.text(`${fmt(results.totalLB)} tCO₂e/${T(lang, 'rok', 'yr')}`, MX + 8, 176);

  doc.setFont(FONT, 'normal');
  doc.setFontSize(8);
  setText('#64748b');
  doc.text(
    T(
      lang,
      'Dokument poufny · Metodyka GHG Protocol Corporate Standard · Wskaźniki KOBiZE 2023 / IPCC AR6 / AIB 2023',
      'Confidential · GHG Protocol Corporate Standard · KOBiZE 2023 / IPCC AR6 / AIB 2023 factors'
    ),
    MX,
    PH - 14,
    { maxWidth: CW }
  );

  // ── 2. EXECUTIVE SUMMARY (KPI boxes) ─────────────────────────────────────────
  doc.addPage();
  y = 22;
  sectionHeader(T(lang, '1. Podsumowanie wykonawcze', '1. Executive summary'));

  const kpis = [
    { label: T(lang, 'Zakres 1 (bezpośrednie)', 'Scope 1 (direct)'), value: results.scope1.total },
    { label: T(lang, 'Zakres 2 — LB', 'Scope 2 — LB'), value: results.scope2LB },
    { label: T(lang, 'Zakres 2 — MB', 'Scope 2 — MB'), value: results.scope2MB },
  ];
  const gap = 4;
  const boxW = (CW - gap * 2) / 3;
  const boxH = 26;
  kpis.forEach((k, i) => {
    const x = MX + i * (boxW + gap);
    setFill('#f8fafc');
    doc.setDrawColor(BORDER);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'FD');
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7.5);
    setText(MUTED);
    doc.text(doc.splitTextToSize(k.label, boxW - 6), x + 4, y + 7);
    doc.setFont(FONT, 'bold');
    doc.setFontSize(16);
    setText(GREEN);
    doc.text(fmt(k.value), x + 4, y + 20);
    doc.setFont(FONT, 'normal');
    doc.setFontSize(7);
    setText(MUTED);
    doc.text('tCO₂e', x + 4, y + 24);
  });
  y += boxH + 8;

  // Totals row
  setFill(GREEN_LIGHT);
  doc.roundedRect(MX, y, CW, 18, 2, 2, 'F');
  doc.setFont(FONT, 'bold');
  doc.setFontSize(10);
  setText(TEXT);
  doc.text(
    `${T(lang, 'Razem (LB)', 'Total (LB)')}: ${fmt(results.totalLB)} tCO₂e   ·   ${T(lang, 'Razem (MB)', 'Total (MB)')}: ${fmt(results.totalMB)} tCO₂e`,
    MX + 6,
    y + 11
  );
  y += 26;
  if (results.scope1.biogenic > 0) {
    paragraph(
      T(
        lang,
        `Emisje biogeniczne (memorandum, poza Zakresem 1): ${fmt(results.scope1.biogenic)} tCO₂e.`,
        `Biogenic emissions (memorandum item, excluded from Scope 1): ${fmt(results.scope1.biogenic)} tCO₂e.`
      ),
      8.5
    );
  }

  // ── 3. EMISSIONS BREAKDOWN (horizontal bars) ─────────────────────────────────
  sectionHeader(T(lang, '2. Struktura emisji wg źródła', '2. Emissions breakdown by source'));
  const totalForPct = slices.reduce((s, sl) => s + Math.max(0, sl.value), 0) || 1;
  const barH = 8;
  const barGap = 7;
  const labelW = 62;
  const trackW = CW - labelW - 26;
  slices.forEach((sl) => {
    if (y > PH - 24) { footer(); doc.addPage(); y = 20; }
    const pct = (Math.max(0, sl.value) / totalForPct) * 100;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(8.5);
    setText(TEXT);
    doc.text(doc.splitTextToSize(T(lang, sl.labelPl, sl.labelEn), labelW - 2), MX, y + barH - 2.5);
    // track
    setFill('#eef2f5');
    doc.roundedRect(MX + labelW, y, trackW, barH, 1, 1, 'F');
    // fill
    setFill(SCOPE_COLORS[sl.key]);
    const w = Math.max(0.5, (pct / 100) * trackW);
    doc.roundedRect(MX + labelW, y, w, barH, 1, 1, 'F');
    // value + pct
    doc.setFontSize(8);
    setText(MUTED);
    doc.text(`${fmt(sl.value)} tCO₂e (${fmt(pct, 1)}%)`, MX + labelW + trackW + 2, y + barH - 2.5);
    y += barH + barGap;
  });
  y += 4;

  // ── 4. INTENSITY METRICS (table) ─────────────────────────────────────────────
  sectionHeader(T(lang, '3. Wskaźniki intensywności', '3. Intensity metrics'));
  const rows: Array<[string, string, string]> = [
    [
      T(lang, 'na pracownika (FTE)', 'per employee (FTE)'),
      results.intensityPerFTE_LB !== null ? fmt(results.intensityPerFTE_LB, 3) : '—',
      results.intensityPerFTE_MB !== null ? fmt(results.intensityPerFTE_MB, 3) : '—',
    ],
    [
      T(lang, 'na m² powierzchni', 'per m² of floor area'),
      results.intensityPerM2_LB !== null ? fmt(results.intensityPerM2_LB, 4) : '—',
      results.intensityPerM2_MB !== null ? fmt(results.intensityPerM2_MB, 4) : '—',
    ],
    [
      T(lang, 'na 1000 PLN przychodu', 'per 1000 PLN revenue'),
      results.intensityPerRevenueLB !== null ? fmt(results.intensityPerRevenueLB, 5) : '—',
      results.intensityPerRevenueMB !== null ? fmt(results.intensityPerRevenueMB, 5) : '—',
    ],
  ];
  const c1 = CW * 0.5, c2 = CW * 0.25, c3 = CW * 0.25;
  // header
  setFill('#0f172a');
  doc.rect(MX, y, CW, 8, 'F');
  doc.setFont(FONT, 'bold');
  doc.setFontSize(8.5);
  setText('#ffffff');
  doc.text(T(lang, 'Wskaźnik', 'Metric'), MX + 3, y + 5.5);
  doc.text(T(lang, 'LB (tCO₂e)', 'LB (tCO₂e)'), MX + c1 + 3, y + 5.5);
  doc.text(T(lang, 'MB (tCO₂e)', 'MB (tCO₂e)'), MX + c1 + c2 + 3, y + 5.5);
  y += 8;
  rows.forEach((r, i) => {
    setFill(i % 2 ? '#f8fafc' : '#ffffff');
    doc.rect(MX, y, CW, 8, 'F');
    doc.setFont(FONT, 'normal');
    doc.setFontSize(8.5);
    setText(TEXT);
    doc.text(r[0], MX + 3, y + 5.5);
    doc.text(r[1], MX + c1 + 3, y + 5.5);
    doc.text(r[2], MX + c1 + c2 + 3, y + 5.5);
    y += 8;
  });
  doc.setDrawColor(BORDER);
  doc.rect(MX, y - rows.length * 8 - 8, CW, rows.length * 8 + 8);
  y += 8;

  // ── 5. REDUCTION LEVERS (top contributing sources) ───────────────────────────
  sectionHeader(T(lang, '4. Dźwignie redukcji', '4. Reduction levers'));
  const levers: Record<BreakdownSlice['key'], { pl: string; en: string }> = {
    stationary: {
      pl: 'Spalanie stacjonarne: zmodernizuj źródła ciepła (pompy ciepła, kotły kondensacyjne), popraw izolację budynków i rozważ zakup biogazu/ciepła z OZE.',
      en: 'Stationary combustion: modernise heat sources (heat pumps, condensing boilers), improve building insulation, and consider renewable heat/biogas procurement.',
    },
    mobile: {
      pl: 'Flota: elektryfikuj pojazdy, optymalizuj trasy i wprowadź politykę eco-drivingu oraz limitów zużycia paliwa.',
      en: 'Fleet: electrify vehicles, optimise routing, and introduce an eco-driving policy with fuel-consumption limits.',
    },
    fugitive: {
      pl: 'Czynniki chłodnicze: przejdź na czynniki o niskim GWP, wdroż regularne przeglądy szczelności i napraw wycieki.',
      en: 'Refrigerants: switch to low-GWP refrigerants, schedule regular leak-tightness inspections, and repair leaks promptly.',
    },
    scope2: {
      pl: 'Energia zakupiona: kup gwarancje pochodzenia (GO) / zieloną energię, zainstaluj PV oraz podpisz umowę PPA.',
      en: 'Purchased energy: buy Guarantees of Origin (GOs) / green tariffs, install on-site PV, and sign a PPA.',
    },
  };
  const top = [...slices].filter((s) => s.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);
  if (top.length === 0) {
    paragraph(T(lang, 'Nie wprowadzono jeszcze danych emisyjnych.', 'No emission data has been entered yet.'));
  } else {
    top.forEach((s, i) => {
      const lev = levers[s.key];
      doc.setFont(FONT, 'bold');
      doc.setFontSize(9.5);
      setText(TEXT);
      if (y > PH - 24) { footer(); doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${T(lang, s.labelPl, s.labelEn)} — ${fmt(s.value)} tCO₂e`, MX, y);
      y += 5;
      paragraph(T(lang, lev.pl, lev.en), 9);
    });
  }

  // ── 6. WHAT NEXT (CTA) ───────────────────────────────────────────────────────
  sectionHeader(T(lang, '5. Co dalej?', '5. What next?'));
  paragraph(
    T(
      lang,
      'Skonsultuj wyniki z ekspertem ESG, zaplanuj strategię dekarbonizacji i wyznacz cele redukcyjne (np. zgodne z SBTi). Zespół F-Suite pomoże przełożyć ten raport na konkretny plan działań i raportowanie CSRD.',
      'Consult the results with an ESG expert, plan a decarbonisation strategy, and set reduction targets (e.g. aligned with SBTi). The F-Suite team can turn this report into a concrete action plan and CSRD-ready reporting.'
    )
  );
  paragraph(T(lang, 'Kontakt: info@f-suite.com', 'Contact: info@f-suite.com'), 9, GREEN);

  // ── 7. METHODOLOGY ───────────────────────────────────────────────────────────
  sectionHeader(T(lang, '6. Metodyka', '6. Methodology'));
  const consolidation = {
    operational: T(lang, 'kontrola operacyjna', 'operational control'),
    financial: T(lang, 'kontrola finansowa', 'financial control'),
    equity: T(lang, 'udział kapitałowy', 'equity share'),
  }[profile.consolidationMethod];
  paragraph(
    T(
      lang,
      `Obliczenia wykonano zgodnie z GHG Protocol Corporate Accounting and Reporting Standard według wzoru: Emisje (tCO₂e) = dane o aktywności × wskaźnik emisji. Metoda konsolidacji: ${consolidation}.`,
      `Calculations follow the GHG Protocol Corporate Accounting and Reporting Standard using: Emissions (tCO₂e) = activity data × emission factor. Consolidation method: ${consolidation}.`
    )
  );
  paragraph(
    T(
      lang,
      `Źródła wskaźników (${EMISSION_FACTORS.version}): ${EMISSION_FACTORS.sources.join(', ')}. Zakres 2 raportowany metodą location-based (sieć PL 0,7249 tCO₂e/MWh) oraz market-based (miks rezydualny 0,7855 tCO₂e/MWh lub wskaźnik dostawcy; gwarancje pochodzenia 0 tCO₂e/MWh).`,
      `Emission factor sources (${EMISSION_FACTORS.version}): ${EMISSION_FACTORS.sources.join(', ')}. Scope 2 is reported location-based (PL grid 0.7249 tCO₂e/MWh) and market-based (residual mix 0.7855 tCO₂e/MWh or supplier factor; Guarantees of Origin at 0 tCO₂e/MWh).`
    ),
    9
  );
  paragraph(
    T(
      lang,
      'Ograniczenia: biogeniczny CO₂ ze spalania biomasy raportowany jest odrębnie i nie wchodzi do Zakresu 1. Wynik zależy od jakości danych wejściowych. Zakres 3 nie jest objęty tą wersją.',
      'Limitations: biogenic CO₂ from biomass combustion is reported separately and excluded from Scope 1. Results depend on input data quality. Scope 3 is not covered in this version.'
    ),
    9
  );

  footer();

  // ── Output ────────────────────────────────────────────────────────────────
  const safeCompany = (profile.name || 'Company').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40);
  const filename = `Carbon_Footprint_Report_${safeCompany}_${profile.reportingYear}.pdf`;
  const blob: Blob = doc.output('blob');
  const dataUri: string = doc.output('datauristring');
  const base64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

  return {
    blob,
    base64,
    filename,
    save: () => doc.save(filename),
  };
}
