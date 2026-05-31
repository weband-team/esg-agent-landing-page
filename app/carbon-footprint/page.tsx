'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../lib/theme';
import {
  Nav,
  NavLogo,
  NavMenu,
  NavMenuLink,
  LangToggle,
  LangBtn,
  NavCta,
  NavSecondaryCta,
  GradientText,
  Container,
  Footer,
} from '../styles';
import {
  EMISSION_FACTORS,
  calculate,
  breakdown,
  sanityWarnings,
  CalculatorState,
  CompanyProfile,
  CalculationResults,
  SanityWarning,
  StationaryFuel,
  MobileFuel,
  Refrigerant,
  ConsolidationMethod,
} from './engine';
import { generateCarbonPdf } from './pdf';

type Lang = 'pl' | 'en';
const CURRENT_YEAR = 2026;

// ─── ANIMATIONS ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── LAYOUT ───
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-top: 6rem;
  padding-bottom: 3rem;
  background-color: ${theme.colors.slate950};
  background-image: ${theme.gradients.bgGradient};
  background-attachment: fixed;
  color: ${theme.colors.slate200};
`;

const BgDecoration = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 12%, rgba(34, 197, 94, 0.12) 0%, transparent 60%);
  z-index: 0;
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: linear-gradient(${theme.colors.green500} 1px, transparent 1px),
    linear-gradient(90deg, ${theme.colors.green500} 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
`;

const Shell = styled.div`
  max-width: 880px;
  margin: 0 auto;
  padding: 0 1.25rem;
  position: relative;
  z-index: 1;
`;

const Heading = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${theme.colors.white};
    margin-bottom: 0.6rem;
  }
  p {
    color: ${theme.colors.slate400};
    font-size: 1rem;
    max-width: 620px;
    margin: 0 auto;
  }
`;

const Card = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 22px;
  padding: 2.25rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  animation: ${fadeIn} 0.4s ease both;

  @media (max-width: 768px) {
    padding: 1.5rem 1.25rem;
  }
`;

// ─── PROGRESS ───
const ProgressWrap = styled.div`
  margin-bottom: 1.75rem;
`;

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.6rem;
  font-size: 0.8rem;
  color: ${theme.colors.slate400};

  strong {
    color: ${theme.colors.green400};
    font-weight: 700;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  border-radius: 4px;
  background: ${theme.gradients.primaryBtn};
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
`;

// ─── STEP CONTENT ───
const StepTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${theme.colors.white};
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
`;

const StepSub = styled.p`
  color: ${theme.colors.slate400};
  font-size: 0.92rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.1rem 1.25rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div<{ $full?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  ${(p) => (p.$full ? 'grid-column: 1 / -1;' : '')}
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${theme.colors.slate300};
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;

  .opt {
    font-weight: 500;
    color: ${theme.colors.slate500};
    font-size: 0.74rem;
  }
`;

const Hint = styled.span`
  font-size: 0.72rem;
  color: ${theme.colors.slate500};
  line-height: 1.4;
`;

const inputStyles = `
  width: 100%;
  background: rgba(2, 6, 23, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.72rem 0.9rem;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  }
  &::placeholder { color: ${theme.colors.slate500}; }
`;

const Input = styled.input`
  ${inputStyles}
`;
const Select = styled.select`
  ${inputStyles}
  appearance: none;
  cursor: pointer;
  option { color: #0f172a; }
`;

const UnitInput = styled.div`
  position: relative;
  .unit {
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.78rem;
    color: ${theme.colors.slate500};
    pointer-events: none;
  }
  input { padding-right: 3.2rem; }
`;

// ─── DYNAMIC ENTRY ROWS ───
const EntryRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.25);
  margin-bottom: 0.85rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MobileRow = styled.div`
  padding: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.25);
  margin-bottom: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const RemoveBtn = styled.button`
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 9px;
  padding: 0.6rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover { background: rgba(239, 68, 68, 0.2); }
`;

const AddBtn = styled.button`
  background: rgba(34, 197, 94, 0.08);
  border: 1px dashed rgba(34, 197, 94, 0.4);
  color: ${theme.colors.green400};
  border-radius: 11px;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 0.25rem;
  &:hover { background: rgba(34, 197, 94, 0.14); }
`;

const SegToggle = styled.div`
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  overflow: hidden;
`;
const SegBtn = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? 'rgba(34,197,94,0.18)' : 'transparent')};
  color: ${(p) => (p.$active ? theme.colors.green300 : theme.colors.slate400)};
  border: none;
  padding: 0.5rem 0.9rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const EmptyNote = styled.div`
  font-size: 0.82rem;
  color: ${theme.colors.slate500};
  padding: 0.5rem 0 1rem;
  font-style: italic;
`;

// ─── NAV / BUTTONS ───
const NavRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
`;

const GhostBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: ${theme.colors.slate300};
  border-radius: 12px;
  padding: 0.85rem 1.6rem;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { border-color: rgba(255, 255, 255, 0.35); color: #fff; }
  &:disabled { opacity: 0.35; cursor: not-allowed; }
`;

const PrimaryBtn = styled.button`
  background: ${theme.gradients.primaryBtn};
  border: none;
  color: #fff;
  border-radius: 12px;
  padding: 0.85rem 1.9rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 25px rgba(34, 197, 94, 0.3);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(34, 197, 94, 0.42); }
  &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
`;

const ErrorMsg = styled.div`
  color: #fca5a5;
  font-size: 0.85rem;
  margin-top: 0.9rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  padding: 0.7rem 0.9rem;
  border-radius: 9px;
`;

const WarnBanner = styled.div`
  color: #fcd34d;
  font-size: 0.83rem;
  line-height: 1.5;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.28);
  padding: 0.7rem 0.9rem;
  border-radius: 9px;
  margin-bottom: 0.7rem;
`;

// ─── REVIEW ───
const ReviewBlock = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  background: rgba(2, 6, 23, 0.35);

  h4 {
    font-size: 0.95rem;
    color: ${theme.colors.green400};
    font-weight: 700;
    margin-bottom: 0.6rem;
  }
`;
const ReviewRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
  font-size: 0.85rem;
  &:last-child { border-bottom: none; }
  span:first-child { color: ${theme.colors.slate400}; }
  span:last-child { color: ${theme.colors.slate200}; font-weight: 600; text-align: right; }
`;

// ─── RESULTS ───
const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const KpiBox = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.1rem 1.2rem;
  background: rgba(2, 6, 23, 0.4);
  .lbl { font-size: 0.74rem; color: ${theme.colors.slate400}; margin-bottom: 0.4rem; }
  .val { font-size: 1.7rem; font-weight: 800; color: ${theme.colors.green400}; line-height: 1; }
  .unit { font-size: 0.72rem; color: ${theme.colors.slate500}; margin-top: 0.25rem; }
`;
const TotalBanner = styled.div`
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  background: ${theme.gradients.pilotBannerGradient};
  border: 1px solid rgba(34, 197, 94, 0.25);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  .item .l { font-size: 0.74rem; color: ${theme.colors.slate400}; }
  .item .v { font-size: 1.15rem; font-weight: 800; color: #fff; }
`;

const SectionLabel = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${theme.colors.white};
  margin: 1.5rem 0 0.9rem;
`;

const BarRow = styled.div`
  margin-bottom: 0.85rem;
  .top { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.35rem; }
  .top .name { color: ${theme.colors.slate300}; }
  .top .val { color: ${theme.colors.slate400}; }
`;
const BarTrack = styled.div`
  height: 9px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`;
const BarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${(p) => Math.max(1.5, p.$pct)}%;
  background: ${(p) => p.$color};
  border-radius: 5px;
  transition: width 0.5s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  th, td { padding: 0.6rem 0.7rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
  th { color: ${theme.colors.slate400}; font-weight: 600; font-size: 0.78rem; }
  td { color: ${theme.colors.slate200}; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
`;

const LeverItem = styled.div`
  border-left: 3px solid ${theme.colors.green500};
  padding: 0.4rem 0 0.4rem 0.9rem;
  margin-bottom: 0.9rem;
  .h { font-weight: 700; color: ${theme.colors.white}; font-size: 0.9rem; margin-bottom: 0.2rem; }
  .d { color: ${theme.colors.slate400}; font-size: 0.84rem; line-height: 1.5; }
`;

const ActionsWrap = styled.div`
  margin-top: 1.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;
const ActionCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.4rem;
  background: rgba(2, 6, 23, 0.35);
  h4 { font-size: 1rem; color: #fff; font-weight: 700; margin-bottom: 0.4rem; }
  p { font-size: 0.84rem; color: ${theme.colors.slate400}; line-height: 1.5; margin-bottom: 1rem; }
`;
const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;
const SuccessNote = styled.div`
  color: ${theme.colors.green300};
  font-size: 0.88rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 0.9rem 1rem;
  border-radius: 10px;
  line-height: 1.5;
`;

const WelcomeList = styled.ul`
  list-style: none;
  display: grid;
  gap: 0.75rem;
  margin: 1.25rem 0 1.75rem;
  li {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    font-size: 0.92rem;
    color: ${theme.colors.slate300};
    .ic { color: ${theme.colors.green400}; flex-shrink: 0; }
  }
`;

// ─── i18n + factor labels ───
const FUEL_LABELS: Record<StationaryFuel, { pl: string; en: string; unit: string }> = {
  natural_gas: { pl: 'Gaz ziemny', en: 'Natural gas', unit: 'm³' },
  lpg: { pl: 'LPG (propan-butan)', en: 'LPG (propane-butane)', unit: 'kg' },
  light_oil: { pl: 'Olej opałowy lekki', en: 'Light fuel oil', unit: 'L' },
  hard_coal: { pl: 'Węgiel kamienny', en: 'Hard coal', unit: 't' },
  biomass: { pl: 'Biomasa (pellet)', en: 'Biomass (wood pellet)', unit: 't' },
};
const MOBILE_LABELS: Record<MobileFuel, { pl: string; en: string }> = {
  petrol: { pl: 'Benzyna', en: 'Petrol' },
  diesel: { pl: 'Diesel (ON)', en: 'Diesel' },
  lpg: { pl: 'LPG (auto)', en: 'LPG (auto)' },
};
const REFRIGERANTS: Refrigerant[] = ['R-32', 'R-134a', 'R-410A', 'R-404A'];
const INDUSTRIES: { key: string; pl: string; en: string }[] = [
  { key: 'services', pl: 'Usługi', en: 'Services' },
  { key: 'manufacturing', pl: 'Produkcja / przemysł', en: 'Manufacturing / industry' },
  { key: 'construction', pl: 'Budownictwo', en: 'Construction' },
  { key: 'retail', pl: 'Handel detaliczny', en: 'Retail' },
  { key: 'transport', pl: 'Transport i logistyka', en: 'Transport & logistics' },
  { key: 'it', pl: 'IT i telekomunikacja', en: 'IT & telecom' },
  { key: 'energy', pl: 'Energetyka', en: 'Energy & utilities' },
  { key: 'agriculture', pl: 'Rolnictwo', en: 'Agriculture' },
  { key: 'other', pl: 'Inne', en: 'Other' },
];

// ─── form state shapes (strings for inputs) ───
interface SForm { fuel: StationaryFuel; quantity: string }
interface MForm { fuel: MobileFuel; method: 'liters' | 'distance'; liters: string; km: string; litersPer100km: string }
interface RForm { type: Refrigerant; topUpKg: string }

const SCOPE_BAR_COLORS: Record<string, string> = {
  stationary: '#22c55e',
  mobile: '#0ea5e9',
  fugitive: '#f59e0b',
  scope2: '#8b5cf6',
};

const toNum = (s: string): number | null => {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t.replace(',', '.'));
  return isFinite(n) ? n : null;
};
const fmt = (n: number, dp = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

const STEP_TITLES = [
  null,
  { pl: 'Profil firmy', en: 'Company profile' },
  { pl: 'Zakres 1 — spalanie stacjonarne', en: 'Scope 1 — stationary combustion' },
  { pl: 'Zakres 1 — flota i czynniki chłodnicze', en: 'Scope 1 — fleet & refrigerants' },
  { pl: 'Zakres 2 — energia zakupiona', en: 'Scope 2 — purchased energy' },
  { pl: 'Podsumowanie i obliczenie', en: 'Review & calculate' },
  { pl: 'Wyniki i raport', en: 'Results & report' },
];

export default function CarbonFootprintPage() {
  const [lang, setLang] = useState<Lang>('pl');
  const t = (pl: string, en: string) => (lang === 'pl' ? pl : en);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — company
  const [company, setCompany] = useState({
    name: '',
    industry: '',
    employees: '',
    revenuePLN: '',
    floorM2: '',
    reportingYear: String(CURRENT_YEAR - 1),
    consolidationMethod: 'operational' as ConsolidationMethod,
  });

  // Step 2 — stationary
  const [stationary, setStationary] = useState<SForm[]>([{ fuel: 'natural_gas', quantity: '' }]);
  // Step 3 — mobile + refrigerants
  const [mobile, setMobile] = useState<MForm[]>([]);
  const [refrigerants, setRefrigerants] = useState<RForm[]>([]);
  // Step 4 — scope 2
  const [scope2, setScope2] = useState({
    electricityKWh: '',
    supplierEFperMWh: '',
    districtHeatGJ: '',
    goCertificatesMWh: '',
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  // results actions
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const industryLabel = () => {
    const i = INDUSTRIES.find((x) => x.key === company.industry);
    return i ? t(i.pl, i.en) : '';
  };

  const buildProfile = (): CompanyProfile => ({
    name: company.name.trim(),
    industry: industryLabel(),
    employees: toNum(company.employees),
    revenuePLN: toNum(company.revenuePLN),
    floorM2: toNum(company.floorM2),
    reportingYear: parseInt(company.reportingYear, 10) || CURRENT_YEAR - 1,
    consolidationMethod: company.consolidationMethod,
  });

  const buildState = (): CalculatorState => ({
    company: buildProfile(),
    scope1Stationary: stationary.map((s) => ({ fuel: s.fuel, quantity: toNum(s.quantity) })),
    scope1Mobile: mobile.map((m) => ({
      fuel: m.fuel,
      method: m.method,
      liters: toNum(m.liters),
      km: toNum(m.km),
      litersPer100km: toNum(m.litersPer100km),
    })),
    scope1Refrigerants: refrigerants.map((r) => ({ type: r.type, topUpKg: toNum(r.topUpKg) })),
    scope2: {
      electricityKWh: toNum(scope2.electricityKWh),
      supplierEFperMWh: toNum(scope2.supplierEFperMWh),
      districtHeatGJ: toNum(scope2.districtHeatGJ),
      goCertificatesMWh: toNum(scope2.goCertificatesMWh),
    },
  });

  // ── validation per step ──
  const validateStep = (): string | null => {
    if (step === 1) {
      if (!company.name.trim()) return t('Podaj nazwę firmy.', 'Please enter the company name.');
      if (!company.industry) return t('Wybierz branżę.', 'Please select an industry.');
      const yr = parseInt(company.reportingYear, 10);
      if (!yr || yr < 2000 || yr > CURRENT_YEAR)
        return t(`Rok sprawozdawczy musi mieścić się w zakresie 2000–${CURRENT_YEAR}.`, `Reporting year must be between 2000 and ${CURRENT_YEAR}.`);
      for (const f of ['employees', 'revenuePLN', 'floorM2'] as const) {
        const v = (company as any)[f] as string;
        if (v.trim() !== '' && (toNum(v) === null || (toNum(v) as number) < 0))
          return t('Pola liczbowe muszą być dodatnimi liczbami.', 'Numeric fields must be positive numbers.');
      }
    }
    if (step === 2) {
      for (const s of stationary) {
        if (s.quantity.trim() !== '' && (toNum(s.quantity) === null || (toNum(s.quantity) as number) < 0))
          return t('Ilości paliwa muszą być dodatnimi liczbami.', 'Fuel quantities must be positive numbers.');
      }
    }
    if (step === 3) {
      for (const m of mobile) {
        if (m.method === 'liters') {
          if (m.liters.trim() !== '' && (toNum(m.liters) === null || (toNum(m.liters) as number) < 0))
            return t('Zużycie paliwa musi być dodatnią liczbą.', 'Fuel consumption must be a positive number.');
        } else {
          for (const f of ['km', 'litersPer100km'] as const) {
            if (m[f].trim() !== '' && (toNum(m[f]) === null || (toNum(m[f]) as number) < 0))
              return t('Wartości muszą być dodatnie.', 'Values must be positive.');
          }
        }
      }
      for (const r of refrigerants) {
        if (r.topUpKg.trim() !== '' && (toNum(r.topUpKg) === null || (toNum(r.topUpKg) as number) < 0))
          return t('Uzupełnienie czynnika musi być dodatnią liczbą.', 'Refrigerant top-up must be a positive number.');
      }
    }
    if (step === 4) {
      const e = toNum(scope2.electricityKWh);
      if (e === null || e <= 0)
        return t('Podaj roczne zużycie energii elektrycznej (kWh).', 'Please enter annual electricity consumption (kWh).');
      if (scope2.supplierEFperMWh.trim() !== '' && (toNum(scope2.supplierEFperMWh) === null || (toNum(scope2.supplierEFperMWh) as number) < 0))
        return t('Wskaźnik dostawcy musi być liczbą ≥ 0.', 'Supplier factor must be a number ≥ 0.');
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step === 5) {
      setResults(calculate(buildState()));
    }
    setStep((s) => Math.min(6, s + 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── results actions ──
  const handleDownload = async () => {
    if (!results) return;
    setPdfDownloading(true);
    try {
      const profile = buildProfile();
      const gen = await generateCarbonPdf({ profile, results, slices: breakdown(results), lang });
      gen.save();
    } catch (e: any) {
      alert(t('Nie udało się wygenerować PDF: ', 'Could not generate the PDF: ') + (e?.message || ''));
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!results) return;
    setEmailSubmitting(true);
    setEmailError(null);
    try {
      const profile = buildProfile();
      const gen = await generateCarbonPdf({ profile, results, slices: breakdown(results), lang });
      const res = await fetch('/api/carbon-footprint/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          email: leadEmail.trim(),
          company: profile.name,
          totalLB: results.totalLB,
          totalMB: results.totalMB,
          scope1: results.scope1.total,
          scope2LB: results.scope2LB,
          reportingYear: profile.reportingYear,
          pdfBase64: gen.base64,
          lang,
          filename: gen.filename,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
      setEmailSuccess(true);
    } catch (err: any) {
      setEmailError(
        t('Błąd wysyłania e-maila: ', 'Email dispatch error: ') + (err?.message || 'unknown')
      );
    } finally {
      setEmailSubmitting(false);
    }
  };

  const warnings: SanityWarning[] = step === 5 ? sanityWarnings(buildState(), calculate(buildState())) : [];

  // ─── RENDER STEPS ───
  const renderWelcome = () => (
    <Card>
      <StepTitle>{t('Oblicz ślad węglowy swojej firmy', 'Calculate your company’s carbon footprint')}</StepTitle>
      <StepSub>
        {t(
          'Ten kreator przeprowadzi Cię przez 6 prostych kroków zgodnych z metodyką GHG Protocol (Zakres 1 i 2). Na końcu otrzymasz wynik w tonach CO₂e oraz gotowy raport PDF do pobrania lub wysłania na e-mail. Szacowany czas: ok. 5 minut.',
          'This wizard guides you through 6 simple steps following the GHG Protocol methodology (Scope 1 & 2). At the end you get your result in tonnes of CO₂e plus a ready-made PDF report to download or receive by email. Estimated time: ~5 minutes.'
        )}
      </StepSub>
      <WelcomeList>
        <li><span className="ic">▸</span>{t('Dane firmy: liczba pracowników, przychód, powierzchnia.', 'Company details: headcount, revenue, floor area.')}</li>
        <li><span className="ic">▸</span>{t('Zużycie paliw (ogrzewanie, flota) — z faktur lub liczników.', 'Fuel usage (heating, fleet) — from invoices or meters.')}</li>
        <li><span className="ic">▸</span>{t('Roczne zużycie energii elektrycznej i ciepła (kWh/GJ z rachunków).', 'Annual electricity and heat consumption (kWh/GJ from your bills).')}</li>
      </WelcomeList>
      <NavRow style={{ justifyContent: 'flex-end' }}>
        <PrimaryBtn onClick={goNext}>{t('Rozpocznij →', 'Get started →')}</PrimaryBtn>
      </NavRow>
    </Card>
  );

  const renderCompany = () => (
    <FormGrid>
      <Field $full>
        <Label htmlFor="cf-name">{t('Nazwa firmy', 'Company name')}</Label>
        <Input id="cf-name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })}
          placeholder={t('np. Przykład Sp. z o.o.', 'e.g. Example Ltd.')} />
      </Field>
      <Field>
        <Label htmlFor="cf-industry">{t('Branża', 'Industry')}</Label>
        <Select id="cf-industry" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })}>
          <option value="">{t('— wybierz —', '— select —')}</option>
          {INDUSTRIES.map((i) => (
            <option key={i.key} value={i.key}>{t(i.pl, i.en)}</option>
          ))}
        </Select>
      </Field>
      <Field>
        <Label htmlFor="cf-year">{t('Rok sprawozdawczy', 'Reporting year')}</Label>
        <Input id="cf-year" type="number" value={company.reportingYear} min={2000} max={CURRENT_YEAR}
          onChange={(e) => setCompany({ ...company, reportingYear: e.target.value })} />
      </Field>
      <Field>
        <Label htmlFor="cf-emp">{t('Liczba pracowników (FTE)', 'Employees (FTE)')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
        <Input id="cf-emp" type="number" value={company.employees} min={0}
          onChange={(e) => setCompany({ ...company, employees: e.target.value })} placeholder="—" />
        <Hint>{t('Potrzebne do wskaźnika tCO₂e na pracownika.', 'Used for the tCO₂e-per-employee metric.')}</Hint>
      </Field>
      <Field>
        <Label htmlFor="cf-rev">{t('Roczny przychód (PLN)', 'Annual revenue (PLN)')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
        <Input id="cf-rev" type="number" value={company.revenuePLN} min={0}
          onChange={(e) => setCompany({ ...company, revenuePLN: e.target.value })} placeholder="—" />
      </Field>
      <Field>
        <Label htmlFor="cf-area">{t('Powierzchnia użytkowa (m²)', 'Usable floor area (m²)')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
        <Input id="cf-area" type="number" value={company.floorM2} min={0}
          onChange={(e) => setCompany({ ...company, floorM2: e.target.value })} placeholder="—" />
      </Field>
      <Field>
        <Label htmlFor="cf-cons">{t('Metoda konsolidacji', 'Consolidation method')}</Label>
        <Select id="cf-cons" value={company.consolidationMethod}
          onChange={(e) => setCompany({ ...company, consolidationMethod: e.target.value as ConsolidationMethod })}>
          <option value="operational">{t('Kontrola operacyjna', 'Operational control')}</option>
          <option value="financial">{t('Kontrola finansowa', 'Financial control')}</option>
          <option value="equity">{t('Udział kapitałowy', 'Equity share')}</option>
        </Select>
      </Field>
    </FormGrid>
  );

  const renderStationary = () => (
    <>
      <StepSub>
        {t(
          'Paliwa spalane w instalacjach stacjonarnych (ogrzewanie, generatory). Dodaj wiersz dla każdego paliwa i podaj roczne zużycie. Jeśli nie dotyczy — usuń wszystkie wiersze.',
          'Fuels burned in fixed installations (heating, generators). Add a row per fuel and enter the annual quantity. If none apply, remove all rows.'
        )}
      </StepSub>
      {stationary.length === 0 && <EmptyNote>{t('Brak źródeł spalania stacjonarnego.', 'No stationary combustion sources.')}</EmptyNote>}
      {stationary.map((row, idx) => {
        const f = EMISSION_FACTORS.stationary[row.fuel];
        const meta = FUEL_LABELS[row.fuel];
        return (
          <EntryRow key={idx}>
            <Field>
              <Label>{t('Paliwo', 'Fuel')}</Label>
              <Select value={row.fuel} onChange={(e) => {
                const next = [...stationary]; next[idx] = { ...row, fuel: e.target.value as StationaryFuel }; setStationary(next);
              }}>
                {(Object.keys(FUEL_LABELS) as StationaryFuel[]).map((k) => (
                  <option key={k} value={k}>{t(FUEL_LABELS[k].pl, FUEL_LABELS[k].en)} ({FUEL_LABELS[k].unit})</option>
                ))}
              </Select>
              <Hint>EF: {f.ef} tCO₂e/{meta.unit}{('biogenic' in f && f.biogenic) ? t(' (biogeniczne — poza Zakresem 1)', ' (biogenic — excl. Scope 1)') : ''}</Hint>
            </Field>
            <Field>
              <Label>{t('Roczne zużycie', 'Annual quantity')}</Label>
              <UnitInput>
                <Input type="number" min={0} value={row.quantity} placeholder="0"
                  onChange={(e) => { const next = [...stationary]; next[idx] = { ...row, quantity: e.target.value }; setStationary(next); }} />
                <span className="unit">{meta.unit}</span>
              </UnitInput>
            </Field>
            <Field>
              <Label aria-hidden style={{ visibility: 'hidden' }}>&nbsp;</Label>
              <RemoveBtn type="button" onClick={() => setStationary(stationary.filter((_, i) => i !== idx))}>
                {t('Usuń', 'Remove')}
              </RemoveBtn>
            </Field>
          </EntryRow>
        );
      })}
      <AddBtn type="button" onClick={() => setStationary([...stationary, { fuel: 'natural_gas', quantity: '' }])}>
        + {t('Dodaj paliwo', 'Add fuel')}
      </AddBtn>
    </>
  );

  const renderMobileRefrigerants = () => (
    <>
      <SectionLabel style={{ marginTop: 0 }}>{t('Flota pojazdów', 'Company fleet')}</SectionLabel>
      <StepSub style={{ marginBottom: '1rem' }}>
        {t(
          'Dla każdej kategorii pojazdów podaj roczne zużycie paliwa (w litrach) lub przebieg i średnie spalanie.',
          'For each vehicle category, enter annual fuel use (in liters) or distance and average consumption.'
        )}
      </StepSub>
      {mobile.length === 0 && <EmptyNote>{t('Brak pojazdów we flocie.', 'No fleet vehicles.')}</EmptyNote>}
      {mobile.map((row, idx) => (
        <MobileRow key={idx}>
          <RowGrid>
            <Field>
              <Label>{t('Paliwo', 'Fuel')}</Label>
              <Select value={row.fuel} onChange={(e) => { const next = [...mobile]; next[idx] = { ...row, fuel: e.target.value as MobileFuel }; setMobile(next); }}>
                {(Object.keys(MOBILE_LABELS) as MobileFuel[]).map((k) => (
                  <option key={k} value={k}>{t(MOBILE_LABELS[k].pl, MOBILE_LABELS[k].en)}</option>
                ))}
              </Select>
              <Hint>EF: {EMISSION_FACTORS.mobile[row.fuel].ef} tCO₂e/L</Hint>
            </Field>
            <Field>
              <Label>{t('Metoda', 'Method')}</Label>
              <SegToggle>
                <SegBtn type="button" $active={row.method === 'liters'} onClick={() => { const next = [...mobile]; next[idx] = { ...row, method: 'liters' }; setMobile(next); }}>
                  {t('Litry', 'Liters')}
                </SegBtn>
                <SegBtn type="button" $active={row.method === 'distance'} onClick={() => { const next = [...mobile]; next[idx] = { ...row, method: 'distance' }; setMobile(next); }}>
                  {t('Przebieg', 'Distance')}
                </SegBtn>
              </SegToggle>
            </Field>
          </RowGrid>
          {row.method === 'liters' ? (
            <Field>
              <Label>{t('Roczne zużycie paliwa', 'Annual fuel consumption')}</Label>
              <UnitInput>
                <Input type="number" min={0} value={row.liters} placeholder="0"
                  onChange={(e) => { const next = [...mobile]; next[idx] = { ...row, liters: e.target.value }; setMobile(next); }} />
                <span className="unit">L</span>
              </UnitInput>
            </Field>
          ) : (
            <RowGrid>
              <Field>
                <Label>{t('Roczny przebieg', 'Annual distance')}</Label>
                <UnitInput>
                  <Input type="number" min={0} value={row.km} placeholder="0"
                    onChange={(e) => { const next = [...mobile]; next[idx] = { ...row, km: e.target.value }; setMobile(next); }} />
                  <span className="unit">km</span>
                </UnitInput>
              </Field>
              <Field>
                <Label>{t('Średnie spalanie', 'Avg. consumption')}</Label>
                <UnitInput>
                  <Input type="number" min={0} value={row.litersPer100km} placeholder="0"
                    onChange={(e) => { const next = [...mobile]; next[idx] = { ...row, litersPer100km: e.target.value }; setMobile(next); }} />
                  <span className="unit">L/100km</span>
                </UnitInput>
              </Field>
            </RowGrid>
          )}
          <RemoveBtn type="button" style={{ alignSelf: 'flex-start' }} onClick={() => setMobile(mobile.filter((_, i) => i !== idx))}>
            {t('Usuń pojazd', 'Remove vehicle')}
          </RemoveBtn>
        </MobileRow>
      ))}
      <AddBtn type="button" onClick={() => setMobile([...mobile, { fuel: 'diesel', method: 'liters', liters: '', km: '', litersPer100km: '' }])}>
        + {t('Dodaj kategorię pojazdów', 'Add vehicle category')}
      </AddBtn>

      <SectionLabel>{t('Czynniki chłodnicze (emisje ulotne)', 'Refrigerants (fugitive emissions)')}</SectionLabel>
      <StepSub style={{ marginBottom: '1rem' }}>
        {t('Opcjonalne. Podaj roczne uzupełnienie czynnika (metoda dopełnień).', 'Optional. Enter annual top-up amount (refill method).')}
      </StepSub>
      {refrigerants.length === 0 && <EmptyNote>{t('Brak czynników chłodniczych.', 'No refrigerants.')}</EmptyNote>}
      {refrigerants.map((row, idx) => (
        <EntryRow key={idx}>
          <Field>
            <Label>{t('Czynnik', 'Refrigerant')}</Label>
            <Select value={row.type} onChange={(e) => { const next = [...refrigerants]; next[idx] = { ...row, type: e.target.value as Refrigerant }; setRefrigerants(next); }}>
              {REFRIGERANTS.map((k) => (
                <option key={k} value={k}>{k} (GWP {EMISSION_FACTORS.refrigerants[k].gwp100})</option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{t('Roczne uzupełnienie', 'Annual top-up')}</Label>
            <UnitInput>
              <Input type="number" min={0} value={row.topUpKg} placeholder="0"
                onChange={(e) => { const next = [...refrigerants]; next[idx] = { ...row, topUpKg: e.target.value }; setRefrigerants(next); }} />
              <span className="unit">kg</span>
            </UnitInput>
          </Field>
          <Field>
            <Label aria-hidden style={{ visibility: 'hidden' }}>&nbsp;</Label>
            <RemoveBtn type="button" onClick={() => setRefrigerants(refrigerants.filter((_, i) => i !== idx))}>
              {t('Usuń', 'Remove')}
            </RemoveBtn>
          </Field>
        </EntryRow>
      ))}
      <AddBtn type="button" onClick={() => setRefrigerants([...refrigerants, { type: 'R-410A', topUpKg: '' }])}>
        + {t('Dodaj czynnik chłodniczy', 'Add refrigerant')}
      </AddBtn>
    </>
  );

  const renderScope2 = () => (
    <>
      <StepSub>
        {t(
          'Emisje z energii zakupionej. Energia elektryczna jest raportowana metodą location-based (sieć krajowa) oraz market-based (wskaźnik dostawcy lub miks rezydualny).',
          'Emissions from purchased energy. Electricity is reported location-based (national grid) and market-based (supplier factor or residual mix).'
        )}
      </StepSub>
      <FormGrid>
        <Field>
          <Label htmlFor="s2-el">{t('Zużycie energii elektrycznej', 'Electricity consumption')}</Label>
          <UnitInput>
            <Input id="s2-el" type="number" min={0} value={scope2.electricityKWh} placeholder="0"
              onChange={(e) => setScope2({ ...scope2, electricityKWh: e.target.value })} />
            <span className="unit">kWh/{t('rok', 'yr')}</span>
          </UnitInput>
          <Hint>{t('Sprawdź roczne kWh na rachunku za prąd.', 'Check the annual kWh on your electricity bill.')}</Hint>
        </Field>
        <Field>
          <Label htmlFor="s2-sup">{t('Wskaźnik dostawcy (market-based)', 'Supplier factor (market-based)')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
          <UnitInput>
            <Input id="s2-sup" type="number" min={0} step="0.0001" value={scope2.supplierEFperMWh} placeholder={String(EMISSION_FACTORS.scope2.poland_residual_mb.ef)}
              onChange={(e) => setScope2({ ...scope2, supplierEFperMWh: e.target.value })} />
            <span className="unit">tCO₂e/MWh</span>
          </UnitInput>
          <Hint>{t(`Domyślnie miks rezydualny ${EMISSION_FACTORS.scope2.poland_residual_mb.ef}.`, `Defaults to residual mix ${EMISSION_FACTORS.scope2.poland_residual_mb.ef}.`)}</Hint>
        </Field>
        <Field>
          <Label htmlFor="s2-heat">{t('Ciepło sieciowe', 'District heating')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
          <UnitInput>
            <Input id="s2-heat" type="number" min={0} value={scope2.districtHeatGJ} placeholder="0"
              onChange={(e) => setScope2({ ...scope2, districtHeatGJ: e.target.value })} />
            <span className="unit">GJ/{t('rok', 'yr')}</span>
          </UnitInput>
        </Field>
        <Field>
          <Label htmlFor="s2-go">{t('Gwarancje pochodzenia (GO)', 'Guarantees of Origin (GO)')}<span className="opt">{t('opcjonalne', 'optional')}</span></Label>
          <UnitInput>
            <Input id="s2-go" type="number" min={0} value={scope2.goCertificatesMWh} placeholder="0"
              onChange={(e) => setScope2({ ...scope2, goCertificatesMWh: e.target.value })} />
            <span className="unit">MWh</span>
          </UnitInput>
          <Hint>{t('Każda GO kompensuje 1 MWh do 0 tCO₂e (tylko market-based).', 'Each GO offsets 1 MWh to 0 tCO₂e (market-based only).')}</Hint>
        </Field>
      </FormGrid>
    </>
  );

  const renderReview = () => {
    const p = buildProfile();
    const optY = (v: number | null, unit = '') => (v !== null ? `${fmt(v, 0)}${unit}` : '—');
    return (
      <>
        <StepSub>{t('Sprawdź wprowadzone dane i kliknij „Oblicz”, aby zobaczyć wyniki.', 'Review your inputs and click “Calculate” to see the results.')}</StepSub>
        {warnings.map((w, i) => (
          <WarnBanner key={i}>⚠ {t(w.pl, w.en)}</WarnBanner>
        ))}
        <ReviewBlock>
          <h4>{t('Profil firmy', 'Company profile')}</h4>
          <ReviewRow><span>{t('Nazwa', 'Name')}</span><span>{p.name}</span></ReviewRow>
          <ReviewRow><span>{t('Branża', 'Industry')}</span><span>{p.industry || '—'}</span></ReviewRow>
          <ReviewRow><span>{t('Rok', 'Year')}</span><span>{p.reportingYear}</span></ReviewRow>
          <ReviewRow><span>{t('Pracownicy / Przychód / Powierzchnia', 'Employees / Revenue / Area')}</span>
            <span>{optY(p.employees)} · {optY(p.revenuePLN, ' PLN')} · {optY(p.floorM2, ' m²')}</span></ReviewRow>
        </ReviewBlock>
        <ReviewBlock>
          <h4>{t('Zakres 1', 'Scope 1')}</h4>
          {stationary.filter((s) => toNum(s.quantity)).length === 0 && mobile.length === 0 && refrigerants.length === 0 && (
            <EmptyNote style={{ padding: 0 }}>{t('Brak danych Zakresu 1.', 'No Scope 1 data.')}</EmptyNote>
          )}
          {stationary.filter((s) => toNum(s.quantity)).map((s, i) => (
            <ReviewRow key={`s${i}`}><span>{t(FUEL_LABELS[s.fuel].pl, FUEL_LABELS[s.fuel].en)}</span><span>{fmt(toNum(s.quantity) as number, 0)} {FUEL_LABELS[s.fuel].unit}</span></ReviewRow>
          ))}
          {mobile.map((m, i) => (
            <ReviewRow key={`m${i}`}><span>{t(MOBILE_LABELS[m.fuel].pl, MOBILE_LABELS[m.fuel].en)} ({t('flota', 'fleet')})</span>
              <span>{m.method === 'liters' ? `${m.liters || 0} L` : `${m.km || 0} km · ${m.litersPer100km || 0} L/100km`}</span></ReviewRow>
          ))}
          {refrigerants.map((r, i) => (
            <ReviewRow key={`r${i}`}><span>{r.type}</span><span>{r.topUpKg || 0} kg</span></ReviewRow>
          ))}
        </ReviewBlock>
        <ReviewBlock>
          <h4>{t('Zakres 2', 'Scope 2')}</h4>
          <ReviewRow><span>{t('Energia elektryczna', 'Electricity')}</span><span>{scope2.electricityKWh || 0} kWh</span></ReviewRow>
          <ReviewRow><span>{t('Ciepło sieciowe', 'District heat')}</span><span>{scope2.districtHeatGJ || 0} GJ</span></ReviewRow>
          <ReviewRow><span>{t('Gwarancje pochodzenia', 'Guarantees of Origin')}</span><span>{scope2.goCertificatesMWh || 0} MWh</span></ReviewRow>
          <ReviewRow><span>{t('Wskaźnik dostawcy', 'Supplier factor')}</span><span>{scope2.supplierEFperMWh ? `${scope2.supplierEFperMWh} tCO₂e/MWh` : t('miks rezydualny', 'residual mix')}</span></ReviewRow>
        </ReviewBlock>
      </>
    );
  };

  const renderResults = () => {
    if (!results) return null;
    const slices = breakdown(results);
    const totalForPct = slices.reduce((s, sl) => s + Math.max(0, sl.value), 0) || 1;
    const top = [...slices].filter((s) => s.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);
    const leverText: Record<string, { pl: string; en: string }> = {
      stationary: { pl: 'Zmodernizuj źródła ciepła (pompy ciepła, kotły kondensacyjne) i popraw izolację budynków.', en: 'Modernise heat sources (heat pumps, condensing boilers) and improve building insulation.' },
      mobile: { pl: 'Elektryfikuj flotę, optymalizuj trasy i wprowadź politykę eco-drivingu.', en: 'Electrify the fleet, optimise routing, and adopt an eco-driving policy.' },
      fugitive: { pl: 'Przejdź na czynniki o niskim GWP i wdroż regularne przeglądy szczelności.', en: 'Switch to low-GWP refrigerants and run regular leak-tightness checks.' },
      scope2: { pl: 'Kup gwarancje pochodzenia / zieloną energię, zainstaluj PV lub podpisz PPA.', en: 'Buy Guarantees of Origin / green energy, install PV, or sign a PPA.' },
    };
    return (
      <>
        <StepTitle>{t('Twój ślad węglowy', 'Your carbon footprint')}</StepTitle>
        <StepSub>{t('Wyniki zgodne z GHG Protocol (Zakres 1 i 2), w tonach CO₂e rocznie.', 'Results per the GHG Protocol (Scope 1 & 2), in tonnes of CO₂e per year.')}</StepSub>

        <KpiGrid>
          <KpiBox><div className="lbl">{t('Zakres 1 (bezpośrednie)', 'Scope 1 (direct)')}</div><div className="val">{fmt(results.scope1.total)}</div><div className="unit">tCO₂e</div></KpiBox>
          <KpiBox><div className="lbl">{t('Zakres 2 — Location-Based', 'Scope 2 — Location-Based')}</div><div className="val">{fmt(results.scope2LB)}</div><div className="unit">tCO₂e</div></KpiBox>
          <KpiBox><div className="lbl">{t('Zakres 2 — Market-Based', 'Scope 2 — Market-Based')}</div><div className="val">{fmt(results.scope2MB)}</div><div className="unit">tCO₂e</div></KpiBox>
        </KpiGrid>
        <TotalBanner>
          <div className="item"><div className="l">{t('Razem (Location-Based)', 'Total (Location-Based)')}</div><div className="v">{fmt(results.totalLB)} tCO₂e</div></div>
          <div className="item"><div className="l">{t('Razem (Market-Based)', 'Total (Market-Based)')}</div><div className="v">{fmt(results.totalMB)} tCO₂e</div></div>
          {results.scope1.biogenic > 0 && (
            <div className="item"><div className="l">{t('Biogeniczne (memo)', 'Biogenic (memo)')}</div><div className="v">{fmt(results.scope1.biogenic)} tCO₂e</div></div>
          )}
        </TotalBanner>

        <SectionLabel>{t('Struktura emisji wg źródła', 'Emissions breakdown by source')}</SectionLabel>
        {slices.map((sl) => {
          const pct = (Math.max(0, sl.value) / totalForPct) * 100;
          return (
            <BarRow key={sl.key}>
              <div className="top">
                <span className="name">{t(sl.labelPl, sl.labelEn)}</span>
                <span className="val">{fmt(sl.value)} tCO₂e · {fmt(pct, 1)}%</span>
              </div>
              <BarTrack><BarFill $pct={pct} $color={SCOPE_BAR_COLORS[sl.key]} /></BarTrack>
            </BarRow>
          );
        })}

        <SectionLabel>{t('Wskaźniki intensywności', 'Intensity metrics')}</SectionLabel>
        <Table>
          <thead>
            <tr>
              <th>{t('Wskaźnik', 'Metric')}</th>
              <th className="num">{t('LB (tCO₂e)', 'LB (tCO₂e)')}</th>
              <th className="num">{t('MB (tCO₂e)', 'MB (tCO₂e)')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t('na pracownika (FTE)', 'per employee (FTE)')}</td>
              <td className="num">{results.intensityPerFTE_LB !== null ? fmt(results.intensityPerFTE_LB, 3) : '—'}</td>
              <td className="num">{results.intensityPerFTE_MB !== null ? fmt(results.intensityPerFTE_MB, 3) : '—'}</td>
            </tr>
            <tr>
              <td>{t('na m² powierzchni', 'per m² of area')}</td>
              <td className="num">{results.intensityPerM2_LB !== null ? fmt(results.intensityPerM2_LB, 4) : '—'}</td>
              <td className="num">{results.intensityPerM2_MB !== null ? fmt(results.intensityPerM2_MB, 4) : '—'}</td>
            </tr>
            <tr>
              <td>{t('na 1000 PLN przychodu', 'per 1000 PLN revenue')}</td>
              <td className="num">{results.intensityPerRevenueLB !== null ? fmt(results.intensityPerRevenueLB, 5) : '—'}</td>
              <td className="num">{results.intensityPerRevenueMB !== null ? fmt(results.intensityPerRevenueMB, 5) : '—'}</td>
            </tr>
          </tbody>
        </Table>

        {top.length > 0 && (
          <>
            <SectionLabel>{t('Dźwignie redukcji (najwięksi emitenci)', 'Reduction levers (top contributors)')}</SectionLabel>
            {top.map((s, i) => (
              <LeverItem key={s.key}>
                <div className="h">{i + 1}. {t(s.labelPl, s.labelEn)} — {fmt(s.value)} tCO₂e</div>
                <div className="d">{t(leverText[s.key].pl, leverText[s.key].en)}</div>
              </LeverItem>
            ))}
          </>
        )}

        <ActionsWrap>
          <ActionCard>
            <h4>📄 {t('Pobierz raport PDF', 'Download PDF report')}</h4>
            <p>{t('Kompletny raport z wynikami, wskaźnikami, rekomendacjami i metodyką.', 'A complete report with results, metrics, recommendations, and methodology.')}</p>
            <PrimaryBtn onClick={handleDownload} disabled={pdfDownloading}>
              {pdfDownloading ? t('Generowanie…', 'Generating…') : t('Pobierz PDF', 'Download PDF')}
            </PrimaryBtn>
          </ActionCard>
          <ActionCard>
            <h4>✉ {t('Wyślij raport na e-mail', 'Email the report')}</h4>
            {emailSuccess ? (
              <SuccessNote>{t('Gotowe! Raport PDF został wysłany na podany adres e-mail.', 'Done! The PDF report has been sent to your email address.')}</SuccessNote>
            ) : (
              <EmailForm onSubmit={handleEmail}>
                <Input required value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder={t('Imię i nazwisko', 'Full name')} />
                <Input required type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder={t('Adres e-mail', 'Email address')} />
                <PrimaryBtn as="button" type="submit" disabled={emailSubmitting}>
                  {emailSubmitting ? t('Wysyłanie…', 'Sending…') : t('Wyślij raport', 'Send report')}
                </PrimaryBtn>
                {emailError && <ErrorMsg>{emailError}</ErrorMsg>}
              </EmailForm>
            )}
          </ActionCard>
        </ActionsWrap>

        <NavRow>
          <GhostBtn onClick={goBack}>← {t('Wstecz', 'Back')}</GhostBtn>
          <GhostBtn onClick={() => { setStep(0); setResults(null); setEmailSuccess(false); }}>
            {t('Nowe obliczenie', 'New calculation')}
          </GhostBtn>
        </NavRow>
      </>
    );
  };

  const renderStepBody = () => {
    switch (step) {
      case 1: return renderCompany();
      case 2: return renderStationary();
      case 3: return renderMobileRefrigerants();
      case 4: return renderScope2();
      case 5: return renderReview();
      default: return null;
    }
  };

  const pct = step === 0 ? 0 : Math.round((step / 6) * 100);

  return (
    <>
      <Nav>
        <NavLogo href="/">🌿 <span>ESG</span> Compliance Agent</NavLogo>
        <NavMenu>
          <NavMenuLink href="/">{t('Strona główna', 'Home')}</NavMenuLink>
          <NavMenuLink href="/benchmark">{t('Benchmark', 'Benchmark')}</NavMenuLink>
          <NavMenuLink href="/carbon-footprint">{t('Ślad Węglowy', 'Carbon Footprint')}</NavMenuLink>
          <NavMenuLink href="/regulations-search">{t('Wyszukiwarka Regulacji', 'Regulations Search')}</NavMenuLink>
        </NavMenu>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LangToggle>
            <LangBtn className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</LangBtn>
            <LangBtn className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangBtn>
          </LangToggle>
          <NavSecondaryCta href="https://app.esgsyncpro.qirelab.com" target="_blank">
            {t('Uruchom wersję testową (Pilot) ↗', 'Launch Pilot App ↗')}
          </NavSecondaryCta>
          <NavCta href="/#join">{t('Odbierz darmowy dostęp →', 'Get free access →')}</NavCta>
        </div>
      </Nav>

      <PageWrapper>
        <BgDecoration />
        <GridOverlay />
        <Shell>
          <Heading>
            <h1>{t('Kalkulator ', 'Carbon Footprint ')}<GradientText>{t('Śladu Węglowego', 'Calculator')}</GradientText></h1>
            <p>{t('Zmierz emisje GHG (Zakres 1 i 2) wg GHG Protocol i pobierz raport.', 'Measure your GHG emissions (Scope 1 & 2) per the GHG Protocol and download a report.')}</p>
          </Heading>

          {step === 0 ? (
            renderWelcome()
          ) : step === 6 ? (
            <Card>{renderResults()}</Card>
          ) : (
            <Card>
              <ProgressWrap>
                <ProgressMeta>
                  <span>{t('Krok', 'Step')} <strong>{step}</strong> {t('z', 'of')} 6</span>
                  <span>{STEP_TITLES[step] ? t(STEP_TITLES[step]!.pl, STEP_TITLES[step]!.en) : ''}</span>
                </ProgressMeta>
                <ProgressTrack><ProgressFill $pct={pct} /></ProgressTrack>
              </ProgressWrap>

              <StepTitle>{STEP_TITLES[step] ? t(STEP_TITLES[step]!.pl, STEP_TITLES[step]!.en) : ''}</StepTitle>
              <div style={{ marginTop: '1rem' }}>{renderStepBody()}</div>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <NavRow>
                <GhostBtn onClick={goBack}>← {t('Wstecz', 'Back')}</GhostBtn>
                <PrimaryBtn onClick={goNext}>
                  {step === 5 ? t('Oblicz →', 'Calculate →') : t('Dalej →', 'Next →')}
                </PrimaryBtn>
              </NavRow>
            </Card>
          )}
        </Shell>
      </PageWrapper>

      <Footer>
        <Container>
          <p style={{ textAlign: 'center', color: theme.colors.slate400, fontSize: '0.85rem' }}>
            © {CURRENT_YEAR} ESG Compliance Agent · {t('Metodyka GHG Protocol · Wskaźniki KOBiZE 2023 / IPCC AR6 / AIB 2023', 'GHG Protocol methodology · KOBiZE 2023 / IPCC AR6 / AIB 2023 factors')}
          </p>
        </Container>
      </Footer>
    </>
  );
}
