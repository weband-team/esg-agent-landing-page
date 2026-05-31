'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../../lib/theme';
import {
  Building2,
  Search,
  Download,
  RefreshCw,
  Globe2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Coins,
  Users,
  Scale,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  BadgeAlert,
  MapPin,
  Calendar,
  AlertCircle,
  Sliders,
  ChevronDown,
  Mail
} from 'lucide-react';
import {
  Nav,
  NavLogo,
  NavMenu,
  NavMenuLink,
  LangToggle,
  LangBtn,
  NavCta,
  NavSecondaryCta,
  Container,
  Tag,
  SectionTitle,
  SectionSub,
  GradientText,
  Divider,
  ButtonPrimary,
  ButtonSecondary,
  Footer
} from '../styles';

// ─── BACKEND API BASE URL ───
// Base URL of the NestJS regulations backend (lookup SSE + PDF endpoints).
// Leave NEXT_PUBLIC_REGULATIONS_API_URL empty to use the same origin as the
// page (recommended in production, where Nginx proxies /api/lookup and
// /api/pdf to the backend). In local development the backend runs on :3001.
const REGULATIONS_API_BASE =
  process.env.NEXT_PUBLIC_REGULATIONS_API_URL ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

// ─── KEYFRAMES & ANIMATIONS ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

// ─── LOCAL STYLED COMPONENTS ───
const PageWrapper = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-top: 6rem;
  padding-bottom: 2rem;
  background-color: ${theme.colors.slate950};
  background-image: ${theme.gradients.bgGradient};
  background-attachment: fixed;
  color: ${theme.colors.slate200};
`;

const BgDecoration = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 15%, rgba(34, 197, 94, 0.12) 0%, transparent 60%);
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

const GlassPanel = styled.div`
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 2.25rem;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${theme.colors.slate300};
`;

const Input = styled.input`
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  color: ${theme.colors.white};
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  }

  &::placeholder {
    color: ${theme.colors.slate500};
  }
`;

const BigSearchInput = styled.input`
  width: 100%;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 1.1rem 1rem 1.1rem 3rem;
  color: ${theme.colors.white};
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.green500};
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
  }

  &::placeholder {
    color: ${theme.colors.slate500};
  }
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
`;

const DemoCardButton = styled.button`
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: left;
  width: 100%;

  &:hover {
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.25);
    transform: translateY(-2px);
  }

  .icon-wrap {
    padding: 0.75rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    color: ${theme.colors.slate400};
    transition: all 0.2s ease;
  }

  &:hover .icon-wrap {
    background: rgba(34, 197, 94, 0.1);
    color: ${theme.colors.green400};
  }
`;

const TerminalConsole = styled.div`
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 1.25rem;
  height: 180px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.6;
  color: ${theme.colors.green400};
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
  margin-top: 1rem;
`;

const StepperItem = styled.div<{ $status: 'idle' | 'active' | 'completed' }>`
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  opacity: ${props => props.$status === 'idle' ? '0.45' : '1'};
  transition: opacity 0.3s ease;
`;

const StepIconCircle = styled.div<{ $status: 'idle' | 'active' | 'completed' }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid ${props => 
    props.$status === 'completed' ? theme.colors.green500 : 
    props.$status === 'active' ? theme.colors.green400 : 'rgba(255, 255, 255, 0.15)'
  };
  background: ${props => 
    props.$status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 
    props.$status === 'active' ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.$status === 'completed' ? theme.colors.green400 : theme.colors.slate400};
  
  &::after {
    content: '';
    display: ${props => props.$status === 'active' ? 'block' : 'none'};
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${theme.colors.green400};
    animation: ${pulseGlow} 1.5s infinite;
  }
`;

const StepMetaBox = styled.div`
  margin-top: 0.5rem;
  font-size: 0.72rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  color: ${theme.colors.slate300};
`;

const TabScroller = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 1.5rem;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(34, 197, 94, 0.12)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(34, 197, 94, 0.3)' : 'transparent'};
  color: ${props => props.$active ? theme.colors.green300 : theme.colors.slate400};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${theme.colors.white};
    background: ${props => !props.$active ? 'rgba(255, 255, 255, 0.03)' : ''};
  }

  span.badge {
    background: ${props => props.$active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    color: ${props => props.$active ? theme.colors.green400 : theme.colors.slate500};
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 100px;
  }
`;

const ObligationWrapper = styled.div<{ $confidence: string }>`
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid ${props => 
    props.$confidence === 'certain' ? theme.colors.green500 :
    props.$confidence === 'likely' ? '#6366f1' : '#f59e0b'
  };
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.6);
    transform: translateY(-2px);
  }
`;

const DetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  .title {
    font-size: 0.68rem;
    font-family: monospace;
    text-transform: uppercase;
    color: ${theme.colors.slate500};
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${theme.colors.slate200};
    line-height: 1.4;
  }
`;

const EmailLeadBlock = styled.div`
  background: rgba(5, 46, 22, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  margin-top: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinLoader = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-top: 2px solid ${theme.colors.green500};
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 1.25rem auto;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
  width: 100%;
  max-width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: 350px minmax(0, 1fr);
  }
`;

const OfficialSourceLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${theme.colors.green400};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SearchScreenContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ProcessingScreenContainer = styled.div`
  max-width: 750px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease-out;
`;

const ResultsScreenContainer = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const DialogueBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 99999;
  animation: ${fadeIn} 0.3s ease-out;
`;

// ─── TRANSLATIONS DICTIONARY ───
const t = {
  pl: {
    title: 'Centrum Regulacji Przedsiębiorstw',
    subtitle: 'Zautomatyzowany Silnik Dopasowania Regulacyjnego ESG & Compliance',
    desc: 'Wpisz NIP dowolnego polskiego podmiotu, aby uruchomić 7-stopniowy algorytm weryfikacyjny. Przeskanujemy ponad 40 krajowych i unijnych aktów prawnych pod kątem Twoich obowiązków.',
    placeholder: 'Wpisz 10-cyfrowy numer NIP (np. 5252625123)...',
    searchBtn: 'Uruchom Analizę',
    validating: 'Weryfikacja podmiotu...',
    invalidNip: 'Wprowadzony numer NIP jest niepoprawny (błąd sumy kontrolnej modulo-11).',
    wrongLength: 'NIP musi składać się dokładnie z 10 cyfr.',
    foreignBlockTitle: 'Ograniczenie Terytorialne',
    foreignBlockDesc: 'Wykryto zagraniczny prefiks VAT EU ({prefix}). Bieżąca wersja systemu obsługuje wyłącznie podmioty zarejestrowane na terytorium Rzeczypospolitej Polskiej.',
    foreignBlockClose: 'Zrozumiałem, zmień',
    demoTitle: 'Szybki start: Wybierz profil demonstracyjny',
    demoSaaS: 'Tech SaaS (Mała Sp. z o.o.)',
    demoMetal: 'Huta & Metal (Duża S.A.)',
    demoRestaurant: 'Restauracja (Mikro Sp. j.)',
    demoTransport: 'Spółka Transportowa (Średnia Sp. z o.o.)',
    analysisProgress: 'Postęp analizy regulacyjnej',
    liveLogs: 'Dziennik zdarzeń silnika RegTech (SSE)',
    resultsTitle: 'Raport Zgodności Regulacyjnej',
    downloadReport: 'Pobierz Raport PDF',
    newSearch: 'Nowe Wyszukiwanie',
    companyDetails: 'Metadane Podmiotu',
    krs: 'KRS',
    regon: 'REGON',
    legalForm: 'Forma prawna',
    registeredDate: 'Data rejestracji',
    address: 'Siedziba',
    pkd: 'Kody PKD',
    summaryTitle: 'Podsumowanie Dopasowań',
    matchedCount: 'Dopasowane przepisy',
    totalChecked: 'Przeanalizowano bazę',
    confidence: 'Poziom pewności',
    certain: 'Pewny (Bezpośredni trigger)',
    likely: 'Prawdopodobny',
    possible: 'Potencjalny (PKD / Branża)',
    tabs: {
      all: 'Wszystkie',
      environmental_ehs: 'Środowisko & EHS',
      tax_finance: 'Podatki & Finanse',
      employment_social: 'Zatrudnienie & ZUS',
      data_privacy: 'Prywatność & RODO',
      consumer_competition: 'Konsument & Konkurencja',
      corporate_registration: 'Rejestry & Spółka',
      sector_specific: 'Branżowe & KNF',
      eu_compliance: 'Standardy UE & ESG'
    },
    obligations: 'Szczegóły obowiązku',
    legalBasis: 'Podstawa prawna',
    authority: 'Organ nadzorczy',
    frequency: 'Częstotliwość',
    deadline: 'Termin złożenia',
    evidence: 'Dowody do archiwizacji',
    penalty: 'Ryzyko sankcji / kary',
    penaltyBadge: 'Ryzyko',
    triggerReason: 'Dlaczego dopasowano?',
    officialLink: 'Strona urzędowa / Zgłoszenie',
    confidenceLevel: 'Pewność dopasowania',
    noObligations: 'Brak zidentyfikowanych specyficznych obowiązków w tej kategorii.',
    downloading: 'Generowanie PDF...',
    revenue: 'Roczny obrót',
    employees: 'Zatrudnienie',
    advancedTitle: 'Zaawansowane kryteria wielkościowe (opcjonalnie)',
    advancedEmployeesLabel: 'Liczba pracowników',
    advancedEmployeesPlaceholder: 'np. 0',
    advancedRevenueLabel: 'Roczny obrót (PLN)',
    advancedRevenuePlaceholder: 'np. 50000',
    advancedAssetsLabel: 'Suma bilansowa (PLN)',
    advancedAssetsPlaceholder: 'np. 20000',
    advancedHint: 'Wprowadź rzeczywiste dane podmiotu, aby nadpisać domyślne oszacowania heurystyczne systemu.',
    emailSectionTitle: 'Wyślij kompletny audyt na skrzynkę pocztową',
    emailLabelName: 'Twoje imię i nazwisko',
    emailLabelCompany: 'Nazwa Twojej firmy',
    emailLabelEmail: 'Twój adres e-mail',
    emailSubmitBtn: 'Wyślij raport PDF na e-mail',
    emailSubmitting: 'Generowanie i wysyłanie...',
    emailSuccessMsg: '🎉 Dziękujemy! Skompilowany raport PDF został wygenerowany, zapisany w rejestrze i pomyślnie wysłany na Twój adres e-mail.',
    orDownload: 'Lub pobierz dokument bezpośrednio:',
    directDownload: 'Skompiluj i pobierz PDF'
  },
  en: {
    title: 'Corporate Compliance Centre',
    subtitle: 'Automated ESG & Compliance Regulatory Matching Engine',
    desc: 'Enter the NIP of any Polish company to execute the 7-step validation algorithm. We cross-reference over 40 national and EU regulations against your legal profile.',
    placeholder: 'Enter 10-digit NIP number (e.g. 5252625123)...',
    searchBtn: 'Run Compliance Scan',
    validating: 'Validating entity...',
    invalidNip: 'The entered NIP is invalid (failed modulo-11 checksum verification).',
    wrongLength: 'The NIP must consist of exactly 10 digits.',
    foreignBlockTitle: 'Territorial Limitation',
    foreignBlockDesc: 'Foreign EU VAT prefix detected ({prefix}). The current version of the system only supports legal entities registered in the Republic of Poland.',
    foreignBlockClose: 'Understood, change',
    demoTitle: 'Quick Start: Choose a Sandbox Profile',
    demoSaaS: 'Tech SaaS (Small Sp. z o.o.)',
    demoMetal: 'Metal Manufacturing (Large S.A.)',
    demoRestaurant: 'Restaurant (Micro Sp. j.)',
    demoTransport: 'Transport Logistics (Medium Sp. z o.o.)',
    analysisProgress: 'Regulatory Analysis Progress',
    liveLogs: 'RegTech Engine Event Log (SSE)',
    resultsTitle: 'Regulatory Compliance Report',
    downloadReport: 'Download PDF Report',
    newSearch: 'New Search',
    companyDetails: 'Entity Metadata',
    krs: 'KRS Registry',
    regon: 'REGON',
    legalForm: 'Legal form',
    registeredDate: 'Registration date',
    address: 'Registered address',
    pkd: 'PKD Industry Codes',
    summaryTitle: 'Match Summary',
    matchedCount: 'Matched regulations',
    totalChecked: 'Total catalog checked',
    confidence: 'Confidence Level',
    certain: 'Certain (Direct trigger)',
    likely: 'Likely',
    possible: 'Possible (PKD / Sector)',
    tabs: {
      all: 'All',
      environmental_ehs: 'EHS & Environment',
      tax_finance: 'Taxes & Finance',
      employment_social: 'Employment & Social',
      data_privacy: 'RODO & GDPR',
      consumer_competition: 'Consumer & Antitrust',
      corporate_registration: 'Corporate Registries',
      sector_specific: 'Sector Regulatory',
      eu_compliance: 'EU ESG Standards'
    },
    obligations: 'Obligation details',
    legalBasis: 'Legal basis',
    authority: 'Regulatory authority',
    frequency: 'Frequency',
    deadline: 'Filing deadline',
    evidence: 'Evidence to maintain',
    penalty: 'Sanction / penalty risk',
    penaltyBadge: 'Risk',
    triggerReason: 'Why did this match?',
    officialLink: 'Official portal / submission',
    confidenceLevel: 'Match confidence',
    noObligations: 'No specific obligations identified in this category.',
    downloading: 'Generating PDF...',
    revenue: 'Annual revenue',
    employees: 'Employees count',
    advancedTitle: 'Advanced sizing criteria (optional)',
    advancedEmployeesLabel: 'Employees count',
    advancedEmployeesPlaceholder: 'e.g. 0',
    advancedRevenueLabel: 'Annual revenue (PLN)',
    advancedRevenuePlaceholder: 'e.g. 50000',
    advancedAssetsLabel: 'Balance sheet assets (PLN)',
    advancedAssetsPlaceholder: 'e.g. 20000',
    advancedHint: 'Enter the actual entity data to override the system\'s default heuristic estimations.',
    emailSectionTitle: 'Receive Audit Report in Your Mailbox',
    emailLabelName: 'Your Full Name',
    emailLabelCompany: 'Your Company Name',
    emailLabelEmail: 'Your Email Address',
    emailSubmitBtn: 'Send PDF Report to Mailbox',
    emailSubmitting: 'Generating & sending...',
    emailSuccessMsg: '🎉 Thank you! The compiled PDF report has been generated, logged in our security system, and successfully dispatched to your email address.',
    orDownload: 'Or download the document directly:',
    directDownload: 'Compile & Download PDF'
  }
};

interface StepData {
  step: number;
  title: { pl: string; en: string };
  status: 'idle' | 'active' | 'completed';
  meta?: any;
}

export default function RegulationsSearch() {
  const [lang, setLang] = useState<'pl' | 'en'>('pl');
  const [nipInput, setNipInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Custom sizing overrides
  const [customEmployees, setCustomEmployees] = useState('');
  const [customRevenue, setCustomRevenue] = useState('');
  const [customAssets, setCustomAssets] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Email form states
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Foreign EU VAT dialog
  const [foreignBlock, setForeignBlock] = useState<{ active: boolean; prefix: string } | null>(null);

  // App state: 'search' | 'processing' | 'results'
  const [appState, setAppState] = useState<'search' | 'processing' | 'results'>('search');

  // SSE tracking states
  const [steps, setSteps] = useState<StepData[]>([
    { step: 1, title: { pl: 'Rozpoczynanie weryfikacji NIP...', en: 'Starting NIP validation...' }, status: 'idle' },
    { step: 2, title: { pl: 'Pobieranie danych rejestrowych CEIDG/KRS...', en: 'Retrieving CEIDG/KRS registry data...' }, status: 'idle' },
    { step: 3, title: { pl: 'Uruchamianie 7-stopniowego silnika dopasowania PKD...', en: 'Running 7-step PKD matching engine...' }, status: 'idle' },
    { step: 4, title: { pl: 'Sprawdzanie progów wielkościowych i zatrudnienia...', en: 'Checking size and employment thresholds...' }, status: 'idle' },
    { step: 5, title: { pl: 'Nakładanie unijnych regulacji ESG/CSRD/GDPR...', en: 'Applying EU ESG/CSRD/GDPR overlays...' }, status: 'idle' },
    { step: 6, title: { pl: 'Kategoryzacja obowiązków i generowanie rejestru...', en: 'Categorizing obligations and generating registry...' }, status: 'idle' },
  ]);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  // Auto scroll logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Clean EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Client-side NIP Checksum Validation (Modulo-11)
  const validateNipModulo11 = (nip: string): boolean => {
    const cleanNip = nip.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleanNip)) return false;

    // Bypass strict checksum for preset sandbox NIPs
    const sandboxNips = ['5252625123', '7251892345', '1234567890', '9012345678'];
    if (sandboxNips.includes(cleanNip)) return true;

    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNip[i], 10) * weights[i];
    }
    const control = sum % 11;
    return control === parseInt(cleanNip[9], 10);
  };

  // Main search action
  const handleSearch = (nipToSubmit?: string) => {
    const targetNip = (nipToSubmit || nipInput).trim();
    setError(null);
    setForeignBlock(null);

    if (!targetNip) return;

    // Detect Foreign EU prefix (e.g. DE, FR, GB)
    const prefixMatch = targetNip.match(/^([A-Za-z]{2})/);
    if (prefixMatch) {
      const detectedPrefix = prefixMatch[1].toUpperCase();
      if (detectedPrefix !== 'PL') {
        setForeignBlock({ active: true, prefix: detectedPrefix });
        return;
      }
    }

    const cleanNip = targetNip.replace(/[^0-9]/g, '');

    if (cleanNip.length !== 10) {
      setError(t[lang].wrongLength);
      return;
    }

    if (!validateNipModulo11(cleanNip)) {
      setError(t[lang].invalidNip);
      return;
    }

    // Initialize progress view
    setSteps(prev => prev.map(s => ({ ...s, status: s.step === 1 ? 'active' : 'idle', meta: null })));
    setTerminalLogs([
      `[SYS] ${lang === 'pl' ? 'Inicjalizacja wyszukiwania dla NIP: ' : 'Initializing lookup for NIP: '}${cleanNip}`,
      `[SYS] ${lang === 'pl' ? 'Nawiązywanie połączenia Server-Sent Events...' : 'Establishing Server-Sent Events connection...'}`
    ]);
    setAppState('processing');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Connect to Nest.js SSE Progress Endpoint (backend; see REGULATIONS_API_BASE)
    let sseUrl = `${REGULATIONS_API_BASE}/api/lookup/progress/${cleanNip}`;
    const queryParams: string[] = [];
    if (customEmployees.trim() !== '') {
      queryParams.push(`employees=${encodeURIComponent(customEmployees.trim())}`);
    }
    if (customRevenue.trim() !== '') {
      queryParams.push(`revenue=${encodeURIComponent(customRevenue.trim())}`);
    }
    if (customAssets.trim() !== '') {
      queryParams.push(`assets=${encodeURIComponent(customAssets.trim())}`);
    }
    if (queryParams.length > 0) {
      sseUrl += `?${queryParams.join('&')}`;
    }

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;
    hasCompletedRef.current = false;

    es.onopen = () => {
      setTerminalLogs(prev => [...prev, `[SYS] ${lang === 'pl' ? 'Połączenie SSE otwarte pomyślnie.' : 'SSE Connection successfully opened.'}`]);
    };

    es.addEventListener('step', (e: any) => {
      try {
        const eventData = JSON.parse(e.data);
        const stepNum = eventData.step;

        // Update step status
        setSteps(prevSteps => prevSteps.map(s => {
          if (s.step === stepNum) {
            return { ...s, status: 'completed', meta: eventData.meta };
          } else if (s.step === stepNum + 1) {
            return { ...s, status: 'active' };
          }
          return s;
        }));

        const plLog = eventData.title.pl;
        const enLog = eventData.title.en;
        const activeLog = lang === 'pl' ? plLog : enLog;

        setTerminalLogs(prev => [
          ...prev,
          `[STEP-${stepNum}] ${activeLog}`,
          ...(eventData.meta ? Object.entries(eventData.meta).map(([k, v]) => `  -> ${k.toUpperCase()}: ${v}`) : [])
        ]);

      } catch (err) {
        console.error('Failed to parse step SSE', err);
      }
    });

    es.addEventListener('result', (e: any) => {
      try {
        hasCompletedRef.current = true;
        es.close();

        const resultPayload = JSON.parse(e.data);
        setTerminalLogs(prev => [
          ...prev,
          `[SYS] ${lang === 'pl' ? 'Analiza zakończona sukcesem. Przekierowanie do wyników...' : 'Analysis completed successfully. Redirecting to dashboard...'}`
        ]);

        // Prefill lead company with company name from results
        if (resultPayload?.company?.name) {
          setLeadCompany(resultPayload.company.name);
        }

        setTimeout(() => {
          setResultsData(resultPayload);
          setAppState('results');
        }, 800);

      } catch (err) {
        console.error('Failed to parse final result payload', err);
      }
    });

    es.addEventListener('error', (e: any) => {
      if (hasCompletedRef.current || es.readyState === EventSource.CLOSED) {
        return;
      }

      console.error('SSE stream error:', e);

      let errorMsg = lang === 'pl'
        ? 'Wystąpił błąd podczas analizy. Podany NIP może nie istnieć w bazie demonstracyjnej.'
        : 'An error occurred during analysis. The provided NIP might not exist in our sandbox database.';

      if (e && e.data) {
        try {
          const errParsed = JSON.parse(e.data);
          if (errParsed.message) errorMsg = errParsed.message;
        } catch (_) {}
      }

      setTerminalLogs(prev => [...prev, `[ERROR] ${errorMsg}`]);
      setError(errorMsg);
      es.close();

      setTimeout(() => {
        setAppState('search');
      }, 4000);
    });
  };

  const handleQuickDemo = (nip: string) => {
    setNipInput(nip);
    handleSearch(nip);
  };

  // Direct PDF Download (backend; see REGULATIONS_API_BASE)
  const handleDownloadPdf = async () => {
    if (!resultsData?.company?.nip) return;
    setPdfDownloading(true);
    try {
      const nip = resultsData.company.nip;
      let downloadUrl = `${REGULATIONS_API_BASE}/api/pdf/download/${nip}`;
      const queryParams: string[] = [];
      if (customEmployees.trim() !== '') queryParams.push(`employees=${encodeURIComponent(customEmployees.trim())}`);
      if (customRevenue.trim() !== '') queryParams.push(`revenue=${encodeURIComponent(customRevenue.trim())}`);
      if (customAssets.trim() !== '') queryParams.push(`assets=${encodeURIComponent(customAssets.trim())}`);
      
      if (queryParams.length > 0) {
        downloadUrl += `?${queryParams.join('&')}`;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to compile report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compliance_Report_${nip}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(lang === 'pl' ? 'Generowanie PDF nie powiodło się.' : 'PDF report compilation failed.');
    } finally {
      setPdfDownloading(false);
    }
  };

  // Email submission handler calling our custom local API endpoint
  const handleEmailSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultsData?.company?.nip || isEmailSubmitting) return;

    setIsEmailSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/regulations-search/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: leadName,
          company: leadCompany,
          email: leadEmail,
          nip: resultsData.company.nip,
          employees: customEmployees || undefined,
          revenue: customRevenue || undefined,
          assets: customAssets || undefined,
          lang: lang
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server dispatch failed');
      }

      setEmailSuccess(true);
    } catch (err: any) {
      console.error('Email pipeline failed:', err);
      alert(lang === 'pl' ? `Błąd wysyłania e-maila: ${err.message}` : `Email dispatch error: ${err.message}`);
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const resetSearch = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setNipInput('');
    setCustomEmployees('');
    setCustomRevenue('');
    setCustomAssets('');
    setLeadName('');
    setLeadCompany('');
    setLeadEmail('');
    setEmailSuccess(false);
    setIsAdvancedOpen(false);
    setResultsData(null);
    setError(null);
    setAppState('search');
    setActiveTab('all');
  };

  const getFilteredRegulations = () => {
    if (!resultsData) return [];
    if (activeTab === 'all') return resultsData.matched_regulations;
    return resultsData.matched_regulations.filter((reg: any) => reg.area === activeTab);
  };

  const getTabCount = (areaKey: string) => {
    if (!resultsData) return 0;
    if (areaKey === 'all') return resultsData.matched_regulations.length;
    return resultsData.matched_regulations.filter((reg: any) => reg.area === areaKey).length;
  };

  return (
    <>
      {/* GLOBAL NAVBAR */}
      <Nav className="no-print">
        <NavLogo href="/">
          🌿 <span>ESG</span> Compliance Agent
        </NavLogo>
        <NavMenu>
          <NavMenuLink href="/">{lang === 'pl' ? 'Strona główna' : 'Home'}</NavMenuLink>
          <NavMenuLink href="/benchmark">{lang === 'pl' ? 'Benchmark' : 'Benchmark'}</NavMenuLink>
          <NavMenuLink href="/carbon-footprint">{lang === 'pl' ? 'Ślad Węglowy' : 'Carbon Footprint'}</NavMenuLink>
          <NavMenuLink href="/regulations-search">{lang === 'pl' ? 'Wyszukiwarka Regulacji' : 'Regulations Search'}</NavMenuLink>
        </NavMenu>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LangToggle>
            <LangBtn className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</LangBtn>
            <LangBtn className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangBtn>
          </LangToggle>
          <NavSecondaryCta href="https://app.esgsyncpro.qirelab.com" target="_blank">
            {lang === 'pl' ? 'Uruchom wersję testową (Pilot) ↗' : 'Launch Pilot App ↗'}
          </NavSecondaryCta>
          <NavCta href="/#join">
            {lang === 'pl' ? 'Odbierz darmowy dostęp →' : 'Get free access →'}
          </NavCta>
        </div>
      </Nav>

      <PageWrapper>
        <BgDecoration />
        <GridOverlay />

        {/* CONTAINER FOR VIEWS */}
        <Container style={{ position: 'relative', zIndex: 1, marginTop: '2rem' }}>

          {/* VIEW 1: SEARCH SCREEN */}
          {appState === 'search' && (
            <SearchScreenContainer>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '100px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: theme.colors.green400, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
                  <Sparkles size={13} />
                  <span>Sandbox Engine v1.2</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: theme.colors.white, marginBottom: '0.75rem' }}>
                  {t[lang].title}
                </h1>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.colors.green400, marginBottom: '1rem' }}>
                  {t[lang].subtitle}
                </p>
                <p style={{ color: theme.colors.slate400, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto' }}>
                  {t[lang].desc}
                </p>
              </div>

              {/* Central Search Form Panel */}
              <GlassPanel style={{ marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: theme.colors.slate400, display: 'flex', alignItems: 'center' }}>
                    <Search size={20} />
                  </div>
                  <BigSearchInput
                    type="text"
                    value={nipInput}
                    onChange={(e) => setNipInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t[lang].placeholder}
                  />
                </div>

                {/* Sizing Overrides Accordion */}
                <div style={{ background: 'rgba(2, 6, 23, 0.25)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: theme.colors.slate300 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Sliders size={16} style={{ color: theme.colors.green400, transform: isAdvancedOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t[lang].advancedTitle}</span>
                    </div>
                    <ChevronDown size={16} style={{ transform: isAdvancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: theme.colors.slate500 }} />
                  </button>

                  {isAdvancedOpen && (
                    <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: theme.colors.slate400, lineHeight: 1.5, marginBottom: '1rem' }}>
                        {t[lang].advancedHint}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <FormRow>
                          <Label htmlFor="adv-employees">{t[lang].advancedEmployeesLabel}</Label>
                          <Input
                            id="adv-employees"
                            type="number"
                            min="0"
                            placeholder={t[lang].advancedEmployeesPlaceholder}
                            value={customEmployees}
                            onChange={(e) => setCustomEmployees(e.target.value)}
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor="adv-revenue">{t[lang].advancedRevenueLabel}</Label>
                          <Input
                            id="adv-revenue"
                            type="number"
                            min="0"
                            placeholder={t[lang].advancedRevenuePlaceholder}
                            value={customRevenue}
                            onChange={(e) => setCustomRevenue(e.target.value)}
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor="adv-assets">{t[lang].advancedAssetsLabel}</Label>
                          <Input
                            id="adv-assets"
                            type="number"
                            min="0"
                            placeholder={t[lang].advancedAssetsPlaceholder}
                            value={customAssets}
                            onChange={(e) => setCustomAssets(e.target.value)}
                          />
                        </FormRow>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <ButtonPrimary
                  onClick={() => handleSearch()}
                  style={{ width: '100%', justifyContent: 'center', padding: '1.1rem 2rem', fontSize: '1.05rem' }}
                >
                  <span>{t[lang].searchBtn}</span>
                  <ChevronRight size={18} />
                </ButtonPrimary>
              </GlassPanel>

              {/* Quick Preset Selector */}
              <div>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.slate400, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Layers size={14} style={{ color: theme.colors.green400 }} />
                  <span>{t[lang].demoTitle}</span>
                </h3>

                <DemoGrid>
                  <DemoCardButton onClick={() => handleQuickDemo('5252625123')}>
                    <div className="icon-wrap">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.colors.white }}>F-Suite Sp. z o.o.</div>
                      <div style={{ fontSize: '0.78rem', color: theme.colors.slate400, marginTop: '0.25rem' }}>{t[lang].demoSaaS}</div>
                    </div>
                  </DemoCardButton>

                  <DemoCardButton onClick={() => handleQuickDemo('7251892345')}>
                    <div className="icon-wrap">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.colors.white }}>PolMetal S.A.</div>
                      <div style={{ fontSize: '0.78rem', color: theme.colors.slate400, marginTop: '0.25rem' }}>{t[lang].demoMetal}</div>
                    </div>
                  </DemoCardButton>

                  <DemoCardButton onClick={() => handleQuickDemo('1234567890')}>
                    <div className="icon-wrap">
                      <Coins size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.colors.white }}>Restauracja Smak Sp. j.</div>
                      <div style={{ fontSize: '0.78rem', color: theme.colors.slate400, marginTop: '0.25rem' }}>{t[lang].demoRestaurant}</div>
                    </div>
                  </DemoCardButton>

                  <DemoCardButton onClick={() => handleQuickDemo('9012345678')}>
                    <div className="icon-wrap">
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.colors.white }}>TransLogistic Sp. z o.o.</div>
                      <div style={{ fontSize: '0.78rem', color: theme.colors.slate400, marginTop: '0.25rem' }}>{t[lang].demoTransport}</div>
                    </div>
                  </DemoCardButton>
                </DemoGrid>
              </div>
            </SearchScreenContainer>
          )}

          {/* VIEW 2: PROGRESS FEED CONSOLE (SSE ACTIVE) */}
          {appState === 'processing' && (
            <ProcessingScreenContainer>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <SpinLoader />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.colors.white, marginBottom: '0.25rem' }}>
                  {t[lang].validating}
                </h2>
                <p style={{ fontSize: '0.88rem', color: theme.colors.slate400 }}>
                  {t[lang].analysisProgress}
                </p>
              </div>

              {/* Progress Steps List */}
              <GlassPanel style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {steps.map((s) => (
                  <StepperItem key={s.step} $status={s.status}>
                    <StepIconCircle $status={s.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 700, 
                          color: s.status === 'completed' ? theme.colors.green400 : s.status === 'active' ? theme.colors.white : theme.colors.slate500,
                          textShadow: s.status === 'active' ? '0 0 10px rgba(74, 222, 128, 0.3)' : 'none'
                        }}>
                          {lang === 'pl' ? s.title.pl : s.title.en}
                        </h4>
                        {s.status === 'completed' && <CheckCircle2 size={16} style={{ color: theme.colors.green400 }} />}
                      </div>

                      {s.status === 'completed' && s.meta && (
                        <StepMetaBox>
                          {Object.entries(s.meta).map(([k, v]: any) => (
                            <div key={k} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <span style={{ color: theme.colors.slate500, fontFamily: 'monospace', fontWeight: 700, marginRight: '0.25rem' }}>{k.toUpperCase()}:</span>
                              <span>{v}</span>
                            </div>
                          ))}
                        </StepMetaBox>
                      )}
                    </div>
                  </StepperItem>
                ))}
              </GlassPanel>

              {/* Live Terminal Log Stream Console */}
              <div>
                <h3 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: theme.colors.slate400, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Globe2 size={14} style={{ color: theme.colors.green400, animation: 'pulse 2s infinite' }} />
                  <span>{t[lang].liveLogs}</span>
                </h3>
                <TerminalConsole>
                  {terminalLogs.map((log, i) => {
                    let logColor = theme.colors.green400;
                    let isBold = false;
                    if (log.startsWith('[ERROR]')) { logColor = '#ef4444'; isBold = true; }
                    else if (log.startsWith('[STEP')) { logColor = '#818cf8'; }
                    
                    return (
                      <div key={i} style={{ color: logColor, fontWeight: isBold ? 700 : 500, whiteSpace: 'pre-wrap' }}>
                        {log}
                      </div>
                    );
                  })}
                  <div ref={terminalBottomRef} />
                </TerminalConsole>
              </div>
            </ProcessingScreenContainer>
          )}

          {/* VIEW 3: COMPLIANCE RESULTS DASHBOARD */}
          {appState === 'results' && resultsData && (
            <ResultsScreenContainer>
              
              {/* Back / Export Toolbar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                <ButtonSecondary onClick={resetSearch} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                  <RefreshCw size={14} />
                  <span>{t[lang].newSearch}</span>
                </ButtonSecondary>

                <ButtonPrimary onClick={handleDownloadPdf} disabled={pdfDownloading} style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}>
                  {pdfDownloading ? (
                    <>
                      <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>{t[lang].downloading}</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>{t[lang].downloadReport}</span>
                    </>
                  )}
                </ButtonPrimary>
              </div>

              {/* Main Grid: Left Profile (4 cols equivalent) | Right Obligations Catalogue (8 cols equivalent) */}
              <DashboardGrid>

                {/* LEFT PROFILE PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Entity Metadata Card */}
                  <GlassPanel style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: theme.colors.green400 }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.colors.white }}>{t[lang].companyDetails}</h2>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: theme.colors.slate500, marginTop: '0.1rem' }}>NIP: {resultsData.company.nip}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>
                          {lang === 'pl' ? 'Nazwa firmy' : 'Company name'}
                        </div>
                        <div style={{ fontWeight: 800, color: theme.colors.white, fontSize: '0.95rem', lineHeight: 1.3, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {resultsData.company.name}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>{t[lang].krs}</div>
                          <div style={{ fontWeight: 600, color: theme.colors.slate300 }}>{resultsData.company.krs || '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>{t[lang].regon}</div>
                          <div style={{ fontWeight: 600, color: theme.colors.slate300 }}>{resultsData.company.regon}</div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>{t[lang].legalForm}</div>
                        <div style={{ fontWeight: 700, color: theme.colors.green400 }}>
                          {resultsData.company.legal_form === 'sp_z_o_o' ? 'Sp. z o.o. (LLC)' : 
                           resultsData.company.legal_form === 'sa' ? 'S.A. (Joint-Stock)' :
                           resultsData.company.legal_form === 'sp_j' ? 'Sp. j. (Partnership)' : 'CEIDG (Sole Trader)'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>{t[lang].registeredDate}</div>
                        <div style={{ fontWeight: 600, color: theme.colors.slate300, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} style={{ color: theme.colors.slate500 }} />
                          <span>{resultsData.company.registration_date}</span>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.25rem' }}>{t[lang].address}</div>
                        <div style={{ fontWeight: 600, color: theme.colors.slate300, display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: 1.4, minWidth: 0 }}>
                          <MapPin size={14} style={{ color: theme.colors.slate500, marginTop: '0.15rem', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {resultsData.company.address.street}, {resultsData.company.address.postal_code} {resultsData.company.address.city}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.slate500, marginBottom: '0.5rem' }}>{t[lang].pkd}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {resultsData.company.pkd.map((code: string) => (
                            <span key={code} style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: theme.colors.green400 }}>
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassPanel>

                  {/* Summary & Metrics Card */}
                  <GlassPanel style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: theme.colors.green400 }}>
                        <Scale size={18} />
                      </div>
                      <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.colors.white }}>{t[lang].summaryTitle}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '1rem 0.5rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.colors.green400 }}>{resultsData.analysis_summary.matched_count}</div>
                        <div style={{ fontSize: '0.65rem', color: theme.colors.slate400, marginTop: '0.25rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center' }}>{t[lang].matchedCount}</div>
                      </div>
                      <div style={{ padding: '1rem 0.5rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.colors.slate300 }}>{resultsData.analysis_summary.total_regulations_checked}</div>
                        <div style={{ fontSize: '0.65rem', color: theme.colors.slate400, marginTop: '0.25rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center' }}>{t[lang].totalChecked}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.slate400 }}>
                          <Users size={14} style={{ color: theme.colors.green400 }} />
                          <span>{t[lang].employees}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: theme.colors.white }}>{resultsData.company.employee_count}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.slate400 }}>
                          <Coins size={14} style={{ color: theme.colors.green400 }} />
                          <span>{t[lang].revenue}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: theme.colors.white }}>
                          {resultsData.company.revenue_pln.toLocaleString('pl-PL')} PLN
                        </span>
                      </div>
                    </div>

                    {/* Confidence score breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: theme.colors.slate500, fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {t[lang].confidence}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: theme.colors.green400, fontWeight: 600 }}>{t[lang].certain}</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'rgba(34, 197, 94, 0.1)', color: theme.colors.green400, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {resultsData.analysis_summary.by_confidence.certain || 0}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>{t[lang].likely}</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {resultsData.analysis_summary.by_confidence.likely || 0}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{t[lang].possible}</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {resultsData.analysis_summary.by_confidence.possible || 0}
                        </span>
                      </div>
                    </div>
                  </GlassPanel>

                </div>

                {/* RIGHT OBLIGATIONS CATALOGUE */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Category Filter Tabs Scroll */}
                  <TabScroller>
                    {Object.entries(t[lang].tabs).map(([key, label]) => {
                      const count = getTabCount(key);
                      return (
                        <TabButton
                          key={key}
                          $active={activeTab === key}
                          onClick={() => setActiveTab(key)}
                        >
                          <span>{label}</span>
                          <span className="badge">{count}</span>
                        </TabButton>
                      );
                    })}
                  </TabScroller>

                  {/* Obligations list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {getFilteredRegulations().length > 0 ? (
                      getFilteredRegulations().map((reg: any) => (
                        <ObligationWrapper
                          key={reg.regulation_id}
                          $confidence={reg.confidence_level}
                        >
                          {/* Header section with categories & identifiers */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.05)', color: theme.colors.green400 }}>
                              {t[lang].tabs[reg.area as keyof typeof t.pl.tabs]}
                            </span>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: theme.colors.slate500 }}>
                                {reg.regulation_id}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', background: reg.penalty_risk === 'high' ? 'rgba(239, 68, 68, 0.15)' : reg.penalty_risk === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: reg.penalty_risk === 'high' ? '#fca5a5' : reg.penalty_risk === 'medium' ? '#fcd34d' : '#a7f3d0', padding: '0.15rem 0.4rem', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                {t[lang].penaltyBadge}: {reg.penalty_risk.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Obligation Titles */}
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.colors.white, lineHeight: 1.3, marginBottom: '0.25rem' }}>
                              {lang === 'pl' ? reg.obligation_name.pl : reg.obligation_name.en}
                            </h3>
                            <div style={{ fontSize: '0.75rem', color: theme.colors.slate400, fontWeight: 600 }}>
                              {lang === 'pl' ? reg.name.pl : reg.name.en}
                            </div>
                          </div>

                          {/* Why Matched Logic Explanation Box */}
                          <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)', fontSize: '0.75rem' }}>
                            <div style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', color: theme.colors.green400, marginBottom: '0.25rem' }}>
                              {t[lang].triggerReason}
                            </div>
                            <div style={{ color: theme.colors.slate300, lineHeight: 1.4 }}>
                              {lang === 'pl' ? reg.trigger_logic.pl : reg.trigger_logic.en}
                            </div>
                          </div>

                          {/* Obligation Grid Parameters */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', width: '100%' }}>
                            <DetailField>
                              <span className="title">{t[lang].legalBasis}</span>
                              <span className="value">{lang === 'pl' ? reg.legal_basis.pl : reg.legal_basis.en}</span>
                            </DetailField>
                            <DetailField>
                              <span className="title">{t[lang].authority}</span>
                              <span className="value">{lang === 'pl' ? reg.authority.pl : reg.authority.en}</span>
                            </DetailField>
                            <DetailField>
                              <span className="title">{t[lang].frequency} / {t[lang].deadline}</span>
                              <span className="value" style={{ textTransform: 'capitalize' }}>
                                {reg.frequency} • {lang === 'pl' ? reg.deadline.pl : reg.deadline.en}
                              </span>
                            </DetailField>
                            <DetailField>
                              <span className="title">{t[lang].evidence}</span>
                              <span className="value" style={{ fontStyle: 'italic', fontWeight: 500, color: theme.colors.slate300 }}>
                                {lang === 'pl' ? reg.evidence_to_keep.pl : reg.evidence_to_keep.en}
                              </span>
                            </DetailField>
                          </div>

                          {/* Sanction risk warning & Link at bottom */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.75rem', fontSize: '0.75rem', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#fca5a5', flex: '1 1 300px', minWidth: 0 }}>
                              <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                              <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                <strong style={{ textTransform: 'uppercase', fontSize: '0.68rem', marginRight: '0.25rem' }}>{t[lang].penalty}:</strong>
                                {lang === 'pl' ? reg.penalty_description.pl : reg.penalty_description.en}
                              </span>
                            </div>

                            {reg.official_source && (
                              <OfficialSourceLink
                                href={reg.official_source}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>{t[lang].officialLink}</span>
                                <ExternalLink size={12} />
                              </OfficialSourceLink>
                            )}
                          </div>
                        </ObligationWrapper>
                      ))
                    ) : (
                      <GlassPanel style={{ padding: '3rem', textAlign: 'center' }}>
                        <BadgeAlert size={36} style={{ color: theme.colors.slate500, margin: '0 auto 1rem auto' }} />
                        <p style={{ color: theme.colors.slate400, fontWeight: 600, fontSize: '0.9rem' }}>
                          {t[lang].noObligations}
                        </p>
                      </GlassPanel>
                    )}
                  </div>

                  {/* PREMIUM DISPATCH BLOCK (EMAIL PIPELINE) */}
                  <EmailLeadBlock>
                    <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: theme.colors.green400, marginBottom: '1rem' }}>
                      <Mail size={22} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.colors.white, marginBottom: '0.5rem' }}>
                      {t[lang].emailSectionTitle}
                    </h3>
                    
                    {!emailSuccess ? (
                      <form onSubmit={handleEmailSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '450px', margin: '1.5rem auto 0 auto', textAlign: 'left' }}>
                        <FormRow>
                          <Label htmlFor="lead-name">{t[lang].emailLabelName}</Label>
                          <Input
                            id="lead-name"
                            type="text"
                            required
                            placeholder="Jan Kowalski"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor="lead-company">{t[lang].emailLabelCompany}</Label>
                          <Input
                            id="lead-company"
                            type="text"
                            required
                            placeholder="Moja Sp. z o.o."
                            value={leadCompany}
                            onChange={(e) => setLeadCompany(e.target.value)}
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor="lead-email">{t[lang].emailLabelEmail}</Label>
                          <Input
                            id="lead-email"
                            type="email"
                            required
                            placeholder="jan@kowalski.pl"
                            value={leadEmail}
                            onChange={(e) => setLeadEmail(e.target.value)}
                          />
                        </FormRow>

                        <ButtonPrimary
                          type="submit"
                          disabled={isEmailSubmitting}
                          style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                        >
                          {isEmailSubmitting ? (
                            <>
                              <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                              <span>{t[lang].emailSubmitting}</span>
                            </>
                          ) : (
                            <span>{t[lang].emailSubmitBtn}</span>
                          )}
                        </ButtonPrimary>
                      </form>
                    ) : (
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', color: theme.colors.green400, fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {t[lang].emailSuccessMsg}
                      </div>
                    )}

                    <Divider style={{ margin: '1.75rem 0' }} />

                    <div>
                      <span style={{ fontSize: '0.8rem', color: theme.colors.slate400, display: 'block', marginBottom: '0.75rem' }}>
                        {t[lang].orDownload}
                      </span>
                      <ButtonSecondary onClick={handleDownloadPdf} disabled={pdfDownloading} style={{ fontSize: '0.82rem', padding: '0.6rem 1.25rem' }}>
                        <Download size={13} />
                        <span>{t[lang].directDownload}</span>
                      </ButtonSecondary>
                    </div>
                  </EmailLeadBlock>

                </div>
              </DashboardGrid>
            </ResultsScreenContainer>
          )}

        </Container>

        {/* PAGE FOOTER */}
        <Footer style={{ marginTop: '5rem' }} className="no-print" />
      </PageWrapper>

      {/* TERRITORIAL DIALOGUE BLOC */}
      {foreignBlock && foreignBlock.active && (
        <DialogueBackdrop>
          <GlassPanel style={{ maxWidth: '420px', width: '100%', padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.25)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)' }}>
            <button
              onClick={() => setForeignBlock(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: theme.colors.slate500, fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>
            <div style={{ width: '48px', height: '42px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.colors.white, marginBottom: '0.5rem' }}>
              {t[lang].foreignBlockTitle}
            </h3>
            <p style={{ fontSize: '0.85rem', color: theme.colors.slate300, lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {t[lang].foreignBlockDesc.replace('{prefix}', foreignBlock.prefix)}
            </p>
            <ButtonPrimary onClick={() => setForeignBlock(null)} style={{ width: '100%', justifyContent: 'center' }}>
              <span>{t[lang].foreignBlockClose}</span>
            </ButtonPrimary>
          </GlassPanel>
        </DialogueBackdrop>
      )}
    </>
  );
}
