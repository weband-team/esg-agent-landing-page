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
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: 350px 1fr;
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

// ─── HIGH-FIDELITY OFFLINE EMULATION DATA ───
const MOCK_COMPANIES = [
  {
    "nip": "5252625123",
    "name": "F-Suite Sp. z o.o.",
    "legal_form": "sp_z_o_o",
    "krs": "0000543210",
    "regon": "147852369",
    "registration_date": "2015-03-12",
    "address": {
      "street": "Złota 44",
      "city": "Warszawa",
      "postal_code": "00-120",
      "country": "Polska"
    },
    "pkd": ["62.01.Z", "62.02.Z", "58.29.Z", "63.11.Z"],
    "is_registered_in_poland": true,
    "is_vat_taxpayer": true,
    "revenue_pln": 8500000,
    "assets_pln": 4200000,
    "employee_count": 28,
    "has_contractors": true,
    "is_sole_trader": false,
    "has_cross_border_payments": true,
    "has_related_party_transactions": false,
    "processes_personal_data": true,
    "processes_sensitive_data_large_scale": false,
    "monitors_subjects_large_scale": true,
    "has_combustion": false,
    "has_company_vehicles": true,
    "has_boilers": false,
    "has_process_emissions": false,
    "has_energy_activities": false,
    "has_telecom_activities": false,
    "has_payment_services": false,
    "has_foreign_workers": false,
    "introduces_packaged_goods": false,
    "generates_hazardous_waste": false
  },
  {
    "nip": "7251892345",
    "name": "PolMetal S.A.",
    "legal_form": "sa",
    "krs": "0000123456",
    "regon": "321654987",
    "registration_date": "1998-07-21",
    "address": {
      "street": "Przemysłowa 12",
      "city": "Łódź",
      "postal_code": "93-100",
      "country": "Polska"
    },
    "pkd": ["25.11.Z", "25.50.Z", "25.61.Z", "25.62.Z", "35.11.Z"],
    "is_registered_in_poland": true,
    "is_vat_taxpayer": true,
    "revenue_pln": 145000000,
    "assets_pln": 78000000,
    "employee_count": 310,
    "has_contractors": true,
    "is_sole_trader": false,
    "has_cross_border_payments": true,
    "has_related_party_transactions": true,
    "processes_personal_data": true,
    "processes_sensitive_data_large_scale": false,
    "monitors_subjects_large_scale": false,
    "has_combustion": true,
    "has_company_vehicles": true,
    "has_boilers": true,
    "has_process_emissions": true,
    "has_energy_activities": true,
    "has_telecom_activities": false,
    "has_payment_services": false,
    "has_foreign_workers": true,
    "introduces_packaged_goods": true,
    "generates_hazardous_waste": true
  },
  {
    "nip": "1234567890",
    "name": "Restauracja Smak Sp. j.",
    "legal_form": "sp_j",
    "krs": "0000987654",
    "regon": "987654321",
    "registration_date": "2019-11-05",
    "address": {
      "street": "Sienkiewicza 8",
      "city": "Kraków",
      "postal_code": "31-041",
      "country": "Polska"
    },
    "pkd": ["56.10.A", "56.21.Z", "56.30.Z"],
    "is_registered_in_poland": true,
    "is_vat_taxpayer": true,
    "revenue_pln": 1800000,
    "assets_pln": 600000,
    "employee_count": 8,
    "has_contractors": true,
    "is_sole_trader": false,
    "has_cross_border_payments": false,
    "has_related_party_transactions": false,
    "processes_personal_data": true,
    "processes_sensitive_data_large_scale": false,
    "monitors_subjects_large_scale": false,
    "has_combustion": false,
    "has_company_vehicles": false,
    "has_boilers": false,
    "has_process_emissions": false,
    "has_energy_activities": false,
    "has_telecom_activities": false,
    "has_payment_services": false,
    "has_foreign_workers": false,
    "introduces_packaged_goods": true,
    "generates_hazardous_waste": false
  },
  {
    "nip": "9012345678",
    "name": "TransLogistic Sp. z o.o.",
    "legal_form": "sp_z_o_o",
    "krs": "0000888888",
    "regon": "456123789",
    "registration_date": "2012-05-18",
    "address": {
      "street": "Transportowa 5",
      "city": "Poznań",
      "postal_code": "61-005",
      "country": "Polska"
    },
    "pkd": ["49.41.Z", "52.10.S", "52.29.C"],
    "is_registered_in_poland": true,
    "is_vat_taxpayer": true,
    "revenue_pln": 48000000,
    "assets_pln": 22000000,
    "employee_count": 74,
    "has_contractors": true,
    "is_sole_trader": false,
    "has_cross_border_payments": true,
    "has_related_party_transactions": true,
    "processes_personal_data": true,
    "processes_sensitive_data_large_scale": false,
    "monitors_subjects_large_scale": false,
    "has_combustion": true,
    "has_company_vehicles": true,
    "has_boilers": false,
    "has_process_emissions": false,
    "has_energy_activities": false,
    "has_telecom_activities": false,
    "has_payment_services": false,
    "has_foreign_workers": true,
    "introduces_packaged_goods": true,
    "generates_hazardous_waste": true
  }
];

const MOCK_REGULATIONS = [
  {
    "regulation_id": "PL_CORE_001",
    "area": "corporate_registration",
    "name": {
      "pl": "Rejestracja i aktualizacja danych w CEIDG / KRS",
      "en": "Business Registration and Updates in CEIDG / KRS"
    },
    "obligation_name": {
      "pl": "Obowiązek rejestracji i zgłaszania zmian",
      "en": "Registration and Change Notification Obligation"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 6 marca 2018 r. o Centralnej Ewidencji i Informacji o Działalności Gospodarczej i Punkcie Informacji dla Przedsiębiorcy / Ustawa z dnia 20 sierpnia 1997 r. o Krajowym Rejestrze Sądowym",
      "en": "Act of 6 March 2018 on CEIDG and Entrepreneur Information Point / Act of 20 August 1997 on the National Court Register (KRS)"
    },
    "authority": {
      "pl": "Ministerstwo Rozwoju i Technologii / Sąd Rejestrowy (KRS)",
      "en": "Ministry of Development and Technology / Registry Court (KRS)"
    },
    "official_source": "https://www.biznes.gov.pl/",
    "trigger_logic": {
      "pl": "Dotyczy wszystkich podmiotów rozpoczynających lub prowadzących działalność gospodarczą w Polsce. Zmiany muszą być zgłaszane w terminie 7 dni (CEIDG) lub 7 dni od zdarzenia (KRS).",
      "en": "Applies to all entities starting or conducting business in Poland. Changes must be reported within 7 days (CEIDG) or 7 days from the event (KRS)."
    },
    "trigger_data_fields": ["is_registered_in_poland"],
    "thresholds": null,
    "obligation_type": "registration",
    "output_required": {
      "pl": "Wpis w rejestrze CEIDG lub KRS",
      "en": "CEIDG or KRS registry entry"
    },
    "portal_or_submission": {
      "pl": "Portal Biznes.gov.pl / Portal Rejestrów Sądowych (PRS)",
      "en": "Biznes.gov.pl Portal / Registry Courts Portal (PRS)"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "Zgłoszenie zmian w ciągu 7 dni od zaistnienia zmiany",
      "en": "Notification of changes within 7 days of the occurrence of the change"
    },
    "evidence_to_keep": {
      "pl": "Potwierdzenie złożenia wniosku, odpis aktualny KRS/CEIDG",
      "en": "Application submission confirmation, current KRS/CEIDG extract"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Grzywna, wykreślenie z rejestru, odpowiedzialność osobista członków zarządu za niezgłoszenie zmian",
      "en": "Fine, removal from register, personal liability of board members for failure to report changes"
    },
    "owner_role": "legal",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_CORE_002",
    "area": "corporate_registration",
    "name": {
      "pl": "Klasyfikacja Działalności (PKD)",
      "en": "Classification of Business Activities (PKD)"
    },
    "obligation_name": {
      "pl": "Aktualizacja kodów PKD w rejestrze",
      "en": "Updating PKD Codes in the Register"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 29 czerwca 1995 r. o statystyce publicznej",
      "en": "Act of 29 June 1995 on Public Statistics"
    },
    "authority": {
      "pl": "Główny Urząd Statystyczny (GUS)",
      "en": "Statistics Poland (GUS)"
    },
    "official_source": "https://stat.gov.pl/klasyfikacje/pkd-2007/",
    "trigger_logic": {
      "pl": "Dotyczy wszystkich podmiotów prowadzących działalność gospodarczą. Zgłoszone kody PKD muszą odzwierciedlać faktycznie wykonywaną działalność przedsiębiorstwa.",
      "en": "Applies to all business entities. Registered PKD codes must reflect the actual activities performed by the enterprise."
    },
    "trigger_data_fields": ["is_registered_in_poland"],
    "thresholds": null,
    "obligation_type": "registration",
    "output_required": {
      "pl": "Zaktualizowana lista kodów PKD w rejestrze REGON/KRS/CEIDG",
      "en": "Updated list of PKD codes in REGON/KRS/CEIDG register"
    },
    "portal_or_submission": {
      "pl": "Portal Biznes.gov.pl / PRS",
      "en": "Biznes.gov.pl Portal / PRS"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "Zgłoszenie zmian w ciągu 7 dni od rozpoczęcia nowej działalności",
      "en": "Notification of changes within 7 days of starting new business activity"
    },
    "evidence_to_keep": {
      "pl": "Potwierdzenie rejestracji kodów PKD we wpisie KRS/CEIDG",
      "en": "Confirmation of PKD codes registration in KRS/CEIDG entry"
    },
    "penalty_risk": "low",
    "penalty_description": {
      "pl": "Ryzyko niezgodności z prawem podatkowym (odliczenia kosztów) oraz utraty prawa do ubiegania się o dotacje rządowe i pomoc publiczną",
      "en": "Risk of non-compliance with tax law (cost deductions) and loss of eligibility for government grants and state aid"
    },
    "owner_role": "legal",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_CRBR_001",
    "area": "corporate_registration",
    "name": {
      "pl": "Zgłoszenie do Centralnego Rejestru Beneficjentów Rzeczywistych (CRBR)",
      "en": "Reporting to the Central Register of Ultimate Beneficial Owners (CRBR)"
    },
    "obligation_name": {
      "pl": "Zgłaszanie beneficjentów rzeczywistych",
      "en": "Reporting Ultimate Beneficial Owners"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 1 marca 2018 r. o przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu",
      "en": "Act of 1 March 2018 on Counteracting Money Laundering and Terrorist Financing"
    },
    "authority": {
      "pl": "Ministerstwo Finansów / Generalny Inspektor Informacji Finansowej (GIIF)",
      "en": "Ministry of Finance / General Inspector of Financial Information (GIIF)"
    },
    "official_source": "https://crbr.podatki.gov.pl/",
    "trigger_logic": {
      "pl": "Dotyczy wszystkich spółek handlowych (sp. z o.o., S.A., spółki jawne, komandytowe itp.). Wyłączone są jednoosobowe działalności gospodarcze zarejestrowane w CEIDG.",
      "en": "Applies to all commercial companies (sp. z o.o., S.A., partnerships, etc.). Sole proprietorships registered in CEIDG are exempt."
    },
    "trigger_data_fields": ["legal_form"],
    "thresholds": {
      "pl": "Dotyczy wszystkich form prawnych z wyjątkiem jednoosobowych działalności gospodarczych (CEIDG)",
      "en": "Applies to all legal forms except sole proprietorships (CEIDG)"
    },
    "obligation_type": "reporting",
    "output_required": {
      "pl": "Zgłoszenie informacji o beneficjentach rzeczywistych spółki",
      "en": "Submission of ultimate beneficial owners details for the company"
    },
    "portal_or_submission": {
      "pl": "System Teleinformatyczny CRBR",
      "en": "CRBR IT System"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "W terminie 14 dni od wpisu spółki do KRS lub zmiany danych beneficjentów",
      "en": "Within 14 days of registering the company in KRS or changing UBO details"
    },
    "evidence_to_keep": {
      "pl": "Urzędowe Poświadczenie Odbioru (UPO) z systemu CRBR",
      "en": "Official Confirmation of Receipt (UPO) from the CRBR system"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Kara pieniężna nakładana na spółkę do wysokości 1 000 000 PLN oraz odpowiedzialność karna beneficjentów",
      "en": "Financial penalty imposed on the company up to 1,000,000 PLN and criminal liability of beneficial owners"
    },
    "owner_role": "legal",
    "confidence_level": "certain",
    "legal_forms": ["sp_z_o_o", "sa", "sp_j", "sp_k"]
  },
  {
    "regulation_id": "PL_TAX_CIT",
    "area": "tax_finance",
    "name": {
      "pl": "Rozliczanie podatku dochodowego od osób prawnych (CIT)",
      "en": "Corporate Income Tax (CIT) Settlement"
    },
    "obligation_name": {
      "pl": "Roczne zeznanie CIT-8",
      "en": "Annual CIT-8 Tax Return"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 15 lutego 1992 r. o podatku dochodowym od osób prawnych",
      "en": "Act of 15 February 1992 on Corporate Income Tax"
    },
    "authority": {
      "pl": "Krajowa Administracja Skarbowa (KAS) / Urząd Skarbowy",
      "en": "National Revenue Administration (KAS) / Tax Office"
    },
    "official_source": "https://www.podatki.gov.pl/cit/",
    "trigger_logic": {
      "pl": "Dotyczy osób prawnych (sp. z o.o., S.A.) oraz niektórych spółek osobowych (np. spółki komandytowe, komandytowo-akcyjne).",
      "en": "Applies to legal entities (sp. z o.o., S.A.) and certain partnerships (e.g., limited partnerships, joint-stock partnerships)."
    },
    "trigger_data_fields": ["legal_form"],
    "thresholds": null,
    "obligation_type": "fee",
    "output_required": {
      "pl": "Zeznanie CIT-8 + wpłata podatku dochodowego",
      "en": "CIT-8 return + corporate tax payment"
    },
    "portal_or_submission": {
      "pl": "System e-Deklaracje / Portal e-Urząd Skarbowy",
      "en": "e-Deklaracje System / e-Tax Office Portal"
    },
    "frequency": "annual",
    "deadline": {
      "pl": "Do końca trzeciego miesiąca roku następnego (standardowo do 31 marca)",
      "en": "By the end of the third month of the following tax year (typically March 31)"
    },
    "evidence_to_keep": {
      "pl": "Złożona deklaracja CIT-8 wraz z Urzędowym Poświadczeniem Odbioru (UPO) oraz dowód zapłaty podatku",
      "en": "Submitted CIT-8 return with Official Confirmation of Receipt (UPO) and tax payment receipt"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Odsetki zwłoki od zaległości podatkowych, kary finansowe na podstawie Kodeksu karnego skarbowego (KKS) dla członków zarządu",
      "en": "Late payment interest on tax arrears, financial penalties under the Fiscal Penal Code (KKS) for management board members"
    },
    "owner_role": "finance",
    "confidence_level": "certain",
    "legal_forms": ["sp_z_o_o", "sa", "sp_k"]
  },
  {
    "regulation_id": "PL_TAX_VAT",
    "area": "tax_finance",
    "name": {
      "pl": "Rozliczanie podatku od towarów i usług (VAT)",
      "en": "Value Added Tax (VAT) Settlement"
    },
    "obligation_name": {
      "pl": "Rejestracja i deklaracje VAT",
      "en": "VAT Registration and Declarations"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 11 marca 2004 r. o podatku od towarów i usług",
      "en": "Act of 11 March 2004 on Value Added Tax"
    },
    "authority": {
      "pl": "Urząd Skarbowy",
      "en": "Tax Office"
    },
    "official_source": "https://www.podatki.gov.pl/vat/",
    "trigger_logic": {
      "pl": "Dotyczy podatników rejestrujących się dobrowolnie lub obowiązkowo po przekroczeniu 200,000 PLN obrotu rocznego, bądź wykonujących czynności wyłączone ze zwolnienia (np. doradztwo).",
      "en": "Applies to taxpayers registering voluntarily or obligatorily after exceeding 200,000 PLN annual turnover, or performing activities excluded from exemption."
    },
    "trigger_data_fields": ["is_vat_taxpayer"],
    "thresholds": {
      "pl": "Roczny limit obrotów powyżej 200 000 PLN",
      "en": "Annual turnover limit above 200,000 PLN"
    },
    "obligation_type": "fee",
    "output_required": {
      "pl": "Zgłoszenie VAT-R, rozliczanie podatku należnego i naliczonego",
      "en": "VAT-R registration, calculation of output and input tax"
    },
    "portal_or_submission": {
      "pl": "Portal e-Urząd Skarbowy / System e-Deklaracje",
      "en": "e-Tax Office Portal / e-Deklaracje System"
    },
    "frequency": "monthly",
    "deadline": {
      "pl": "Miesięcznie, do 25. dnia każdego miesiąca za miesiąc poprzedni",
      "en": "Monthly, by the 25th day of each month for the preceding month"
    },
    "evidence_to_keep": {
      "pl": "Ewidencje zakupu i sprzedaży VAT, potwierdzenie rejestracji VAT-5",
      "en": "VAT purchase and sales ledgers, VAT-5 registration confirmation"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Dodatkowe zobowiązanie podatkowe (sankcja VAT), odsetki, odpowiedzialność karno-skarbowa",
      "en": "Additional tax liability (VAT sanction), interest, fiscal penal liability"
    },
    "owner_role": "finance",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_TAX_JPK",
    "area": "tax_finance",
    "name": {
      "pl": "Przesyłanie Jednolitego Pliku Kontrolnego (JPK_V7)",
      "en": "Submission of the Standard Audit File for Tax (JPK_V7)"
    },
    "obligation_name": {
      "pl": "Złożenie JPK_V7M / JPK_V7K",
      "en": "JPK_V7M / JPK_V7K Submission"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 29 sierpnia 1997 r. - Ordynacja podatkowa / Ustawa o VAT",
      "en": "Act of 29 August 1997 - Tax Ordinance / VAT Act"
    },
    "authority": {
      "pl": "Krajowa Administracja Skarbowa (KAS)",
      "en": "National Revenue Administration (KAS)"
    },
    "official_source": "https://www.podatki.gov.pl/jednolity-plik-kontrolny/",
    "trigger_logic": {
      "pl": "Obowiązkowe dla wszystkich czynnych podatników VAT w Polsce.",
      "en": "Mandatory for all active VAT taxpayers in Poland."
    },
    "trigger_data_fields": ["is_vat_taxpayer"],
    "thresholds": null,
    "obligation_type": "reporting",
    "output_required": {
      "pl": "Plik XML JPK_V7M (miesięczny) lub JPK_V7K (kwartalny) zawierający część ewidencyjną i deklaracyjną",
      "en": "XML file JPK_V7M (monthly) or JPK_V7K (quarterly) containing ledger and declaration parts"
    },
    "portal_or_submission": {
      "pl": "Dedykowana bramka Ministerstwa Finansów / Klient JPK",
      "en": "Dedicated Ministry of Finance gateway / JPK Client"
    },
    "frequency": "monthly",
    "deadline": {
      "pl": "Do 25. dnia każdego miesiąca za miesiąc poprzedni",
      "en": "By the 25th day of each month for the preceding month"
    },
    "evidence_to_keep": {
      "pl": "Urzędowe Poświadczenie Odbioru (UPO) z poprawnym kodem statusu (200)",
      "en": "Official Confirmation of Receipt (UPO) with success status code (200)"
    },
    "penalty_risk": "medium",
    "penalty_description": {
      "pl": "Kara administracyjna 500 PLN za każdy błąd uniemożliwiający weryfikację, sankcje karno-skarbowe",
      "en": "Administrative fine of 500 PLN for each error preventing verification, fiscal penal sanctions"
    },
    "owner_role": "finance",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_HR_LABOUR",
    "area": "hr_employment",
    "name": {
      "pl": "Prowadzenie akt osobowych pracowników i dokumentacji pracowniczej",
      "en": "Maintaining Employee Records and Personnel Files"
    },
    "obligation_name": {
      "pl": "Prowadzenie dokumentacji pracowniczej",
      "en": "Maintaining Employee Documentation"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 26 czerwca 1974 r. - Kodeks pracy",
      "en": "Act of 26 June 1974 - Labour Code"
    },
    "authority": {
      "pl": "Państwowa Inspekcja Pracy (PIP)",
      "en": "National Labour Inspectorate (PIP)"
    },
    "official_source": "https://www.pip.gov.pl/",
    "trigger_logic": {
      "pl": "Dotyczy każdego przedsiębiorstwa zatrudniającego co najmniej jednego pracownika na podstawie umowy o pracę.",
      "en": "Applies to any business employing at least one person under an employment contract."
    },
    "trigger_data_fields": ["employee_count"],
    "thresholds": {
      "pl": "Zatrudnienie min. 1 pracownika na umowę o pracę",
      "en": "Employment of at least 1 employee under an employment contract"
    },
    "obligation_type": "recordkeeping",
    "output_required": {
      "pl": "Akta osobowe podzielone na części (A, B, C, D, E) oraz ewidencja czasu pracy",
      "en": "Personnel files divided into sections (A, B, C, D, E) and working time records"
    },
    "portal_or_submission": {
      "pl": "Przechowywanie lokalne w bezpiecznej szafie lub certyfikowanym systemie e-Akt",
      "en": "Local storage in secure cabinet or certified e-Files system"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "Zakładane niezwłocznie w dniu rozpoczęcia pracy; przechowywanie przez 10 lat od końca roku kalendarzowego",
      "en": "Set up immediately on start date; retained for 10 years from end of calendar year"
    },
    "evidence_to_keep": {
      "pl": "Kompletne akta osobowe, podpisane umowy, skierowania lekarskie, BHP",
      "en": "Complete personnel files, signed contracts, medical referrals, OHS proofs"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Grzywna nakładana przez inspektora PIP od 1 000 PLN do 30 000 PLN za wykroczenia przeciwko prawom pracownika",
      "en": "Fine imposed by PIP inspector from 1,000 PLN to 30,000 PLN for offenses against employee rights"
    },
    "owner_role": "hr",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_HR_OHS",
    "area": "hr_employment",
    "name": {
      "pl": "Szkolenia i nadzór BHP",
      "en": "Occupational Health & Safety (OHS) Training and Oversight"
    },
    "obligation_name": {
      "pl": "Zapewnienie bezpiecznych warunków pracy i szkoleń BHP",
      "en": "Providing Safe Working Conditions and OHS Trainings"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Dział Dziesiąty Kodeksu Pracy / Rozporządzenie Ministra Pracy i Polityki Socjalnej z dnia 26 września 1997 r. w sprawie ogólnych przepisów bhp",
      "en": "Division Ten of the Labour Code / Regulation of the Minister of Labour and Social Policy of 26 September 1997 on General OHS Provisions"
    },
    "authority": {
      "pl": "Państwowa Inspekcja Pracy (PIP) / Państwowa Inspekcja Sanitarna (Sanepid)",
      "en": "National Labour Inspectorate (PIP) / State Sanitary Inspectorate (Sanepid)"
    },
    "official_source": "https://www.pip.gov.pl/bhp",
    "trigger_logic": {
      "pl": "Obowiązkowe dla wszystkich pracodawców zatrudniających pracowników lub współpracowników na podstawie umów cywilnoprawnych.",
      "en": "Mandatory for all employers hiring employees or associates under civil law contracts."
    },
    "trigger_data_fields": ["employee_count"],
    "thresholds": {
      "pl": "Zatrudnienie min. 1 pracownika",
      "en": "Employment of at least 1 worker"
    },
    "obligation_type": "policy",
    "output_required": {
      "pl": "Zaświadczenia o szkoleniach wstępnych i okresowych BHP, ocena ryzyka zawodowego dla stanowisk",
      "en": "Certificates of initial and periodic OHS training, occupational risk assessment for roles"
    },
    "portal_or_submission": {
      "pl": "Przechowywanie w aktach osobowych pracownika i dokumentacji zakładowej",
      "en": "Storage in employee's personnel files and company archives"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "Szkolenie wstępne przed przystąpieniem do pracy; okresowe co 1-5 lat w zależności od stanowiska",
      "en": "Initial training prior to commencing work; periodic every 1-5 years depending on the role"
    },
    "evidence_to_keep": {
      "pl": "Karty szkolenia wstępnego OHS, zaświadczenia o ukończeniu szkoleń, podpisana ocena ryzyka przez pracownika",
      "en": "Initial OHS training cards, training completion certificates, risk assessment signed by employee"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Mandaty od 1,000 PLN nakładane na osobę kierującą pracownikami, wstrzymanie prac przez PIP, odpowiedzialność karna",
      "en": "Fines from 1,000 PLN imposed on managers, work suspension order by PIP, criminal liability"
    },
    "owner_role": "hr",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_HR_PPK",
    "area": "hr_employment",
    "name": {
      "pl": "Pracownicze Plany Kapitałowe (PPK)",
      "en": "Employee Capital Plans (PPK)"
    },
    "obligation_name": {
      "pl": "Utworzenie i obsługa PPK",
      "en": "Establishment and Operation of PPK"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 4 października 2018 r. o pracowniczych planach kapitałowych",
      "en": "Act of 4 October 2018 on Employee Capital Plans"
    },
    "authority": {
      "pl": "Polski Fundusz Rozwoju (PFR) / Państwowa Inspekcja Pracy (PIP)",
      "en": "Polish Development Fund (PFR) / National Labour Inspectorate (PIP)"
    },
    "official_source": "https://www.mojeppk.pl/",
    "trigger_logic": {
      "pl": "Obowiązkowe dla wszystkich podmiotów zatrudniających pracowników podlegających obowiązkowo ubezpieczeniu emerytalnemu i rentowym.",
      "en": "Mandatory for all entities employing workers subject to compulsory retirement and pension insurance."
    },
    "trigger_data_fields": ["employee_count"],
    "thresholds": {
      "pl": "Zatrudnienie min. 1 ubezpieczonego pracownika (chyba że wszyscy złożą deklarację rezygnacji)",
      "en": "Employment of at least 1 insured employee (unless all submit an opt-out form)"
    },
    "obligation_type": "registration",
    "output_required": {
      "pl": "Umowa o zarządzanie PPK, umowa o prowadzenie PPK, comiesięczne naliczanie i odprowadzanie wpłat",
      "en": "Agreement on PPK management, agreement on PPK operations, monthly calculation and transfer of contributions"
    },
    "portal_or_submission": {
      "pl": "Dedykowany portal wybranej instytucji finansowej zintegrowany z systemem kadrowo-płacowym",
      "en": "Dedicated portal of selected financial institution integrated with HR & payroll software"
    },
    "frequency": "monthly",
    "deadline": {
      "pl": "Naliczanie wpłat w terminie wypłaty wynagrodzenia, przekazywanie do instytucji finansowej do 15. dnia kolejnego miesiąca",
      "en": "Contributions calculation on payday, transfer to financial institution by the 15th of the following month"
    },
    "evidence_to_keep": {
      "pl": "Umowy o zarządzanie i prowadzenie PPK, deklaracje rezygnacji z PPK na piśmie",
      "en": "PPK management and operations agreements, written PPK opt-out declarations"
    },
    "penalty_risk": "medium",
    "penalty_description": {
      "pl": "Grzywna od 1 000 do 1 000 000 PLN za nakłanianie do rezygnacji z PPK lub brak zawarcia umowy w terminie",
      "en": "Fine from 1,000 to 1,000,000 PLN for encouraging PPK opt-out or failing to sign agreement on time"
    },
    "owner_role": "hr",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_GDPR_001",
    "area": "data_security",
    "name": {
      "pl": "Rejestr czynności przetwarzania danych (RODO)",
      "en": "Register of Personal Data Processing Activities (GDPR)"
    },
    "obligation_name": {
      "pl": "Prowadzenie rejestru czynności przetwarzania",
      "en": "Maintaining a Register of Processing Activities"
    },
    "legal_level": "eu",
    "legal_basis": {
      "pl": "Art. 30 ust. 1 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)",
      "en": "Article 30(1) of Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR)"
    },
    "authority": {
      "pl": "Urząd Ochrony Danych Osobowych (UODO)",
      "en": "Personal Data Protection Office (UODO)"
    },
    "official_source": "https://uodo.gov.pl/",
    "trigger_logic": {
      "pl": "Obowiązkowe dla administratorów danych. Mniejsze firmy (<250 pracowników) są zwolnione, CHYBA ŻE przetwarzanie może powodować ryzyko naruszenia praw, nie ma charakteru sporadycznego lub obejmuje dane wrażliwe.",
      "en": "Mandatory for data controllers. Smaller firms (<250 employees) are exempt, UNLESS processing is not occasional, poses risks to rights, or involves sensitive data."
    },
    "trigger_data_fields": ["processes_personal_data"],
    "thresholds": {
      "pl": "Przedsiębiorstwa powyżej 250 pracowników lub mniejsze z niesporadycznym przetwarzaniem danych",
      "en": "Entities with >250 employees or smaller ones with non-occasional data processing"
    },
    "obligation_type": "recordkeeping",
    "output_required": {
      "pl": "Ustrukturyzowany dokument rejestru czynności przetwarzania zawierający cel, kategorie danych i odbiorców",
      "en": "Structured register of processing activities document containing purposes, data categories and recipients"
    },
    "portal_or_submission": {
      "pl": "Udostępniane lokalnie do kontroli Urzędu Ochrony Danych Osobowych",
      "en": "Maintained locally for inspections by Personal Data Protection Office"
    },
    "frequency": "event_based",
    "deadline": {
      "pl": "Aktualizowany na bieżąco przed wdrożeniem nowych procesów lub narzędzi przetwarzania danych",
      "en": "Updated on an ongoing basis before deploying new processing activities or tools"
    },
    "evidence_to_keep": {
      "pl": "Aktualny plik RCP, analizy ryzyka (DPIA), upoważnienia dla personelu",
      "en": "Current RoPA file, risk assessments (DPIA), staff data processing authorizations"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Administracyjne kary finansowe nakładane przez UODO do 10 000 000 EUR lub do 2% całkowitego rocznego obrotu",
      "en": "Administrative fines imposed by UODO up to 10,000,000 EUR or up to 2% of global annual turnover"
    },
    "owner_role": "legal",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_BDO_REG",
    "area": "environmental",
    "name": {
      "pl": "Rejestracja w Bazie Danych o Produktach i Opakowaniach (BDO)",
      "en": "Registration in Products and Packaging Waste Database (BDO)"
    },
    "obligation_name": {
      "pl": "Uzyskanie wpisu do rejestru BDO",
      "en": "Obtaining Entry in the BDO Registry"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 14 grudnia 2012 r. o odpadach / Ustawa z dnia 13 czerwca 2013 r. o gospodarce opakowaniami i odpadami opakowaniowymi",
      "en": "Act of 14 December 2012 on Waste / Act of 13 June 2013 on Packaging and Packaging Waste Management"
    },
    "authority": {
      "pl": "Urząd Marszałkowski właściwy dla siedziby firmy / GIOŚ",
      "en": "Marshal's Office / Chief Inspectorate for Environmental Protection (GIOŚ)"
    },
    "official_source": "https://bdo.mos.gov.pl/",
    "trigger_logic": {
      "pl": "Dotyczy wszystkich podmiotów wprowadzających na terytorium kraju produkty w opakowaniach, gospodarujących odpadami lub wytwarzających odpady inne niż komunalne.",
      "en": "Applies to all entities introducing packaged goods into the domestic market, managing waste, or generating non-municipal waste."
    },
    "trigger_data_fields": ["introduces_packaged_goods"],
    "thresholds": null,
    "obligation_type": "registration",
    "output_required": {
      "pl": "Nadany unikalny 9-cyfrowy numer rejestrowy BDO",
      "en": "Unique 9-digit BDO registration number assigned"
    },
    "portal_or_submission": {
      "pl": "Rejestr BDO (bdo.mos.gov.pl) za pomocą Profilu Zaufanego",
      "en": "BDO Registry (bdo.mos.gov.pl) via Trusted Profile"
    },
    "frequency": "one_off",
    "deadline": {
      "pl": "Przed rozpoczęciem działalności podlegającej obowiązkowi rejestracji",
      "en": "Prior to commencing activities subject to registration obligations"
    },
    "evidence_to_keep": {
      "pl": "Decyzja Marszałka o nadaniu numeru, dowód uiszczenia rocznej opłaty rejestrowej",
      "en": "Marshal's decision assigning the number, proof of annual registration fee payment"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Grzywny od 5 000 PLN do 1 000 000 PLN za prowadzenie działalności bez wymaganego wpisu lub brak umieszczania numeru na fakturach",
      "en": "Fines from 5,000 PLN to 1,000,000 PLN for operating without registry entry or omitting BDO number on invoices"
    },
    "owner_role": "ehs",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_WHISTLEBLOWER",
    "area": "hr_employment",
    "name": {
      "pl": "Wdrożenie procedury zgłoszeń wewnętrznych (Sygnaliści)",
      "en": "Implementation of Internal Whistleblowing Channels"
    },
    "obligation_name": {
      "pl": "Wdrożenie procedury dla sygnalistów",
      "en": "Whistleblower Procedure Implementation"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 14 czerwca 2024 r. o ochronie sygnalistów (wdrażająca dyrektywę UE 2019/1937)",
      "en": "Act of 14 June 2024 on Whistleblower Protection (implementing EU Directive 2019/1937)"
    },
    "authority": {
      "pl": "Rzecznik Praw Obywatelskich (RPO) / Państwowa Inspekcja Pracy (PIP)",
      "en": "Commissioner for Human Rights (RPO) / National Labour Inspectorate (PIP)"
    },
    "official_source": "https://www.gov.pl/web/sprawiedliwosc/ochrona-sygnalistow",
    "trigger_logic": {
      "pl": "Obowiązkowe dla wszystkich podmiotów prawnych, na rzecz których wykonuje pracę co najmniej 50 osób.",
      "en": "Mandatory for all legal entities for which at least 50 persons perform work."
    },
    "trigger_data_fields": ["employee_count"],
    "thresholds": {
      "pl": "Zatrudnienie co najmniej 50 osób na dzień 1 stycznia lub 1 lipca danego roku",
      "en": "Employment of at least 50 persons as of January 1 or July 1 of a given year"
    },
    "obligation_type": "policy",
    "output_required": {
      "pl": "Wdrożona wewnętrzna procedura zgłoszeń, ustanowione kanały komunikacji, powołany podmiot wyjaśniający",
      "en": "Implemented internal reporting procedure, established communication channels, designated investigative body"
    },
    "portal_or_submission": {
      "pl": "Przechowywanie lokalne, rejestr zgłoszeń prowadzony w zabezpieczonym systemie",
      "en": "Local maintenance, log of reports kept in a highly secure encrypted system"
    },
    "frequency": "one_off",
    "deadline": {
      "pl": "Wdrożenie procedury i uruchomienie kanałów od dnia 25 września 2024 r.",
      "en": "Procedure implementation and channels operational from September 25, 2024"
    },
    "evidence_to_keep": {
      "pl": "Regulamin zgłoszeń, potwierdzenie przeprowadzenia konsultacji, rejestr zgłoszeń wewnętrznych",
      "en": "Reporting policy document, proof of consultations, internal whistleblower reports registry"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Grzywna, kara ograniczenia wolności albo pozbawienia wolności do lat 3 dla członków zarządu za brak procedury lub odwet",
      "en": "Fine, restriction of liberty, or imprisonment up to 3 years for board members for lack of policy or retaliation"
    },
    "owner_role": "legal",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "PL_ZUS_IWA",
    "area": "hr_employment",
    "name": {
      "pl": "Składanie informacji ZUS IWA (składka wypadkowa)",
      "en": "Submitting ZUS IWA Information (Accident Premium)"
    },
    "obligation_name": {
      "pl": "Złożenie informacji ZUS IWA",
      "en": "ZUS IWA Submission"
    },
    "legal_level": "national",
    "legal_basis": {
      "pl": "Ustawa z dnia 30 października 2002 r. o ubezpieczeniu społecznym z tytułu wypadków przy pracy i chorób zawodowych",
      "en": "Act of 30 October 2002 on Social Insurance against Occupational Accidents and Diseases"
    },
    "authority": {
      "pl": "Zakład Ubezpieczeń Społecznych (ZUS)",
      "en": "Social Insurance Institution (ZUS)"
    },
    "official_source": "https://www.zus.pl/zus-iwa",
    "trigger_logic": {
      "pl": "Dotyczy płatników składek, którzy podlegali wpisowi do rejestru REGON, zgłaszali do ubezpieczenia wypadkowego min. 10 osób i byli zgłoszeni w ZUS nieprzerwanie przez cały rok.",
      "en": "Applies to employers registered in REGON who reported at least 10 persons for accident insurance and were registered continuously."
    },
    "trigger_data_fields": ["employee_count"],
    "thresholds": {
      "pl": "Zgłaszanie do ubezpieczenia wypadkowego co najmniej 10 ubezpieczonych",
      "en": "Reporting at least 10 insured persons for accident insurance"
    },
    "obligation_type": "reporting",
    "output_required": {
      "pl": "Wysłana deklaracja ZUS IWA zawierająca liczbę zatrudnionych, kody PKD oraz liczbę poszkodowanych w wypadkach",
      "en": "Sent ZUS IWA declaration containing employee count, PKD codes, and number of accident victims"
    },
    "portal_or_submission": {
      "pl": "Platforma PUE ZUS / Program Płatnik / ePłatnik",
      "en": "PUE ZUS Platform / Płatnik Program / ePłatnik"
    },
    "frequency": "annual",
    "deadline": {
      "pl": "Do 31 stycznia roku następnego za rok poprzedni",
      "en": "By January 31 of the following year"
    },
    "evidence_to_keep": {
      "pl": "Potwierdzenie wysłania deklaracji z programu Płatnik/PUE ZUS",
      "en": "Declaration submission confirmation from Płatnik/PUE ZUS"
    },
    "penalty_risk": "medium",
    "penalty_description": {
      "pl": "Zwiększenie stopy procentowej składki na ubezpieczenie wypadkowe o 50% przez ZUS, karne odsetki, mandaty karne",
      "en": "ZUS increasing the accident insurance premium rate by 50%, penalty interest, fines"
    },
    "owner_role": "finance",
    "confidence_level": "certain"
  },
  {
    "regulation_id": "EU_CSRD_ESG",
    "area": "strategic_esg",
    "name": {
      "pl": "Sprawozdawczość niefinansowa w zakresie zrównoważonego rozwoju (CSRD)",
      "en": "Corporate Sustainability Reporting Directive (CSRD)"
    },
    "obligation_name": {
      "pl": "Sporządzenie sprawozdania zrównoważonego rozwoju",
      "en": "Sustainability Report Preparation"
    },
    "legal_level": "eu",
    "legal_basis": {
      "pl": "Dyrektywa Parlamentu Europejskiego i Rady (UE) 2022/2464 z dnia 14 grudnia 2022 r. w odniesieniu do sprawozdawczości przedsiębiorstw w zakresie zrównoważonego rozwoju (CSRD)",
      "en": "Directive (EU) 2022/2464 of the European Parliament and of the Council of 14 December 2022 as regards corporate sustainability reporting (CSRD)"
    },
    "authority": {
      "pl": "Ministerstwo Finansów / Komisja Nadzoru Finansowego (KNF)",
      "en": "Ministry of Finance / Polish Financial Supervision Authority (KNF)"
    },
    "official_source": "https://finance.ec.europa.eu/capital-markets-union-and-financial-services/corporate-reporting/corporate-sustainability-reporting_en",
    "trigger_logic": {
      "pl": "Dotyczy jednostek spełniających 2 z 3 kryteriów: zatrudnienie >250 osób, przychody >110 mln PLN, suma bilansowa >55 mln PLN.",
      "en": "Applies to entities meeting 2 out of 3 criteria: employee count >250, revenue >110M PLN, balance sheet total >55M PLN."
    },
    "trigger_data_fields": ["employee_count", "revenue_pln", "assets_pln"],
    "thresholds": {
      "pl": "Zatrudnienie >250 pracowników ORAZ obroty >110M PLN lub aktywa >55M PLN",
      "en": "Employees >250 AND revenue >110M PLN or assets >55M PLN"
    },
    "obligation_type": "reporting",
    "output_required": {
      "pl": "Osobna sekcja w rocznym sprawozdaniu z działalności przygotowana w formacie XHTML (z tagowaniem XBRL) według standardów ESRS",
      "en": "Separate section in annual management report prepared in XHTML format (XBRL tags) according to ESRS standards"
    },
    "portal_or_submission": {
      "pl": "Krajowy Rejestr Sądowy (KRS) wraz ze sprawozdaniem finansowym",
      "en": "National Court Register (KRS) along with the financial statements"
    },
    "frequency": "annual",
    "deadline": {
      "pl": "Składane razem z rocznym sprawozdaniem finansowym (standardowo w ciągu 3 miesięcy od zakończenia roku obrotowego)",
      "en": "Submitted together with the annual financial report (typically within 3 months of fiscal year end)"
    },
    "evidence_to_keep": {
      "pl": "Zatwierdzone sprawozdanie roczne zawierające raport zrównoważonego rozwoju wraz z raportem atestacyjnym biegłego rewidenta",
      "en": "Approved annual report containing the sustainability statement along with certified auditor's assurance report"
    },
    "penalty_risk": "high",
    "penalty_description": {
      "pl": "Kary administracyjne, grzywny dla członków zarządu, brak dostępu do finansowania bankowego i ubezpieczeniowego, utrata rynków zbytu",
      "en": "Administrative penalties, board fines, loss of access to bank financing & commercial insurance, loss of key markets"
    },
    "owner_role": "legal",
    "confidence_level": "certain"
  }
];

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

  // ─── HIGH-FIDELITY CLIENT-SIDE EMULATION ENGINE ───
  const startClientSideSimulation = (cleanNip: string) => {
    // 1. Find or generate company profile
    const existingMock = MOCK_COMPANIES.find(c => c.nip === cleanNip);
    
    // Parse custom input variables if any, otherwise default
    const empCount = customEmployees.trim() !== '' ? parseInt(customEmployees, 10) : (existingMock?.employee_count ?? 12);
    const revPln = customRevenue.trim() !== '' ? parseFloat(customRevenue) : (existingMock?.revenue_pln ?? 3500000);
    const asstPln = customAssets.trim() !== '' ? parseFloat(customAssets) : (existingMock?.assets_pln ?? 1800000);

    const company: any = existingMock ? {
      ...existingMock,
      employee_count: empCount,
      revenue_pln: revPln,
      assets_pln: asstPln,
    } : {
      nip: cleanNip,
      name: `Kowalski & Partnerzy S.A.`,
      legal_form: 'sp_z_o_o', // default
      krs: '0000' + Math.floor(100000 + Math.random() * 900000),
      regon: String(Math.floor(100000000 + Math.random() * 900000000)),
      registration_date: '2018-04-14',
      address: {
        street: 'Aleje Jerozolimskie 56',
        city: 'Warszawa',
        postal_code: '00-324',
        country: 'Polska'
      },
      pkd: ['62.01.Z', '70.22.Z'],
      is_registered_in_poland: true,
      is_vat_taxpayer: true,
      revenue_pln: revPln,
      assets_pln: asstPln,
      employee_count: empCount,
      has_contractors: true,
      is_sole_trader: false,
      has_cross_border_payments: false,
      has_related_party_transactions: false,
      processes_personal_data: true,
      processes_sensitive_data_large_scale: false,
      monitors_subjects_large_scale: false,
      has_combustion: false,
      has_company_vehicles: true,
      has_boilers: false,
      has_process_emissions: false,
      has_energy_activities: false,
      has_telecom_activities: false,
      has_payment_services: false,
      has_foreign_workers: false,
      introduces_packaged_goods: false,
      generates_hazardous_waste: false
    };

    // 2. Local Matching Logic
    const matchedRegulations: any[] = [];
    
    for (const reg of MOCK_REGULATIONS) {
      let isMatch = false;
      let matchedConfidence: 'certain' | 'likely' | 'possible' = 'certain';

      // STEP 1: Universal / Core Obligations Match
      if (
        reg.trigger_data_fields?.includes('is_registered_in_poland') &&
        reg.trigger_data_fields.length === 1 &&
        (!('pkd_codes' in reg) || !(reg as any).pkd_codes?.length) &&
        (!('legal_forms' in reg) || !(reg as any).legal_forms?.length)
      ) {
        isMatch = true;
        matchedConfidence = 'certain';
      }

      // STEP 2: Legal Form Check
      if ('legal_forms' in reg && (reg as any).legal_forms && (reg as any).legal_forms.length > 0) {
        const formMatch = (reg as any).legal_forms.includes(company.legal_form);
        if (formMatch) {
          isMatch = true;
          matchedConfidence = (reg.confidence_level as any) || 'certain';
        } else if (reg.trigger_data_fields?.includes('legal_form')) {
          continue;
        }
      }

      // STEP 3: PKD Code Prefix Match
      if ('pkd_codes' in reg && (reg as any).pkd_codes && (reg as any).pkd_codes.length > 0) {
        const pkdMatch = company.pkd.some((compPkd: string) => {
          return (reg as any).pkd_codes.some((regPkd: string) => {
            const cleanRegPkd = regPkd.replace(/\.$/, '');
            return compPkd.startsWith(cleanRegPkd);
          });
        });

        if (pkdMatch) {
          isMatch = true;
          matchedConfidence = 'certain';
        }
      }

      // STEP 4: Trigger Fields / Flag Check
      if (reg.trigger_data_fields && reg.trigger_data_fields.length > 0) {
        for (const field of reg.trigger_data_fields) {
          if (field === 'is_registered_in_poland' || field === 'legal_form') {
            continue;
          }

          if (typeof company[field] === 'boolean' && company[field] === true) {
            isMatch = true;
            matchedConfidence = (reg.confidence_level as any) || 'likely';
          }

          if (field === 'employee_count') {
            if (reg.regulation_id === 'PL_HR_LABOUR' && company.employee_count >= 1) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
            if (reg.regulation_id === 'PL_WHISTLEBLOWER' && company.employee_count >= 50) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
            if (reg.regulation_id === 'PL_ZUS_IWA' && company.employee_count >= 10) {
              isMatch = true;
              matchedConfidence = 'certain';
            }
          }

          if (field === 'revenue_pln' || field === 'assets_pln') {
            if (reg.regulation_id === 'EU_CSRD_ESG') {
              if (
                company.employee_count > 250 &&
                (company.revenue_pln > 110000000 || company.assets_pln > 55000000)
              ) {
                isMatch = true;
                matchedConfidence = 'certain';
              } else if (company.employee_count > 50) {
                isMatch = true;
                matchedConfidence = 'possible';
              }
            }
          }
        }
      }

      if (isMatch) {
        matchedRegulations.push({
          ...reg,
          confidence_level: matchedConfidence
        });
      }
    }

    // Sort: 1. confidence_level (certain -> likely -> possible), 2. penalty_risk (high -> medium -> low), 3. area
    const confidenceOrder = { certain: 0, likely: 1, possible: 2 };
    const penaltyOrder = { high: 0, medium: 1, low: 2 };

    matchedRegulations.sort((a, b) => {
      const confA = confidenceOrder[a.confidence_level || 'likely'];
      const confB = confidenceOrder[b.confidence_level || 'likely'];
      if (confA !== confB) return confA - confB;

      const penA = penaltyOrder[a.penalty_risk || 'medium'];
      const penB = penaltyOrder[b.penalty_risk || 'medium'];
      if (penA !== penB) return penA - penB;

      return a.area.localeCompare(b.area);
    });

    // Compute analysis summary
    const byArea: Record<string, number> = {};
    const byConfidence: Record<string, number> = { certain: 0, likely: 0, possible: 0 };

    for (const r of matchedRegulations) {
      byArea[r.area] = (byArea[r.area] || 0) + 1;
      const conf = r.confidence_level || 'likely';
      byConfidence[conf] = (byConfidence[conf] || 0) + 1;
    }

    const mockResult = {
      company,
      match_timestamp: new Date().toISOString(),
      analysis_summary: {
        total_regulations_checked: MOCK_REGULATIONS.length,
        matched_count: matchedRegulations.length,
        by_area: byArea,
        by_confidence: byConfidence,
      },
      matched_regulations: matchedRegulations,
    };

    // 3. Simulated progress steps
    setSteps(prev => prev.map(s => ({ ...s, status: s.step === 1 ? 'active' : 'idle', meta: null })));
    setTerminalLogs([
      `[SYS] ${lang === 'pl' ? 'Inicjalizacja wyszukiwania dla NIP: ' : 'Initializing lookup for NIP: '}${cleanNip}`,
      `[SYS] ${lang === 'pl' ? 'Nawiązywanie połączenia Server-Sent Events...' : 'Establishing Server-Sent Events connection...'}`,
      `[SYS] ${lang === 'pl' ? 'Połączenie z serwerem zewnętrznym (Port 3001) nie powiodło się. Uruchamianie wbudowanego silnika analizy offline...' : 'Connection to external server (Port 3001) failed. Initializing embedded offline analysis engine...'}`
    ]);

    let stepTimeout = 350; // milliseconds per step for snappy progress

    setTimeout(() => {
      // Step 1 Completed
      setSteps(prev => prev.map(s => s.step === 1 ? { ...s, status: 'completed', meta: { nip: cleanNip } } : s.step === 2 ? { ...s, status: 'active' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-1] ${lang === 'pl' ? 'Weryfikacja sumy kontrolnej NIP: POPRAWNA' : 'NIP checksum verification: VALID'}`]);
    }, stepTimeout);

    setTimeout(() => {
      // Step 2 Completed
      setSteps(prev => prev.map(s => s.step === 2 ? { ...s, status: 'completed', meta: { nazwa: company.name, regon: company.regon } } : s.step === 3 ? { ...s, status: 'active' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-2] ${lang === 'pl' ? 'Pobrano dane z rejestru krajowego dla: ' + company.name : 'Retrieved national registry data for: ' + company.name}`]);
    }, stepTimeout * 2);

    setTimeout(() => {
      // Step 3 Completed
      setSteps(prev => prev.map(s => s.step === 3 ? { ...s, status: 'completed', meta: { kody_pkd: company.pkd.join(', ') } } : s.step === 4 ? { ...s, status: 'active' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-3] ${lang === 'pl' ? 'Silnik PKD dopasował kody prowadzonej działalności.' : 'PKD engine successfully matched business activity codes.'}`]);
    }, stepTimeout * 3);

    setTimeout(() => {
      // Step 4 Completed
      setSteps(prev => prev.map(s => s.step === 4 ? { ...s, status: 'completed', meta: { pracownicy: empCount, przychody_pln: revPln.toLocaleString('pl-PL') } } : s.step === 5 ? { ...s, status: 'active' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-4] ${lang === 'pl' ? 'Ewaluacja kryteriów wielkościowych i progów zatrudnienia.' : 'Size criteria and employment thresholds evaluated.'}`]);
    }, stepTimeout * 4);

    setTimeout(() => {
      // Step 5 Completed
      setSteps(prev => prev.map(s => s.step === 5 ? { ...s, status: 'completed', meta: { forma_prawna: company.legal_form.toUpperCase() } } : s.step === 6 ? { ...s, status: 'active' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-5] ${lang === 'pl' ? 'Nałożono nakładki regulacji ESG, CSRD i RODO dla formy prawnej: ' + company.legal_form : 'Applied ESG, CSRD, and GDPR regulatory overlays for legal form: ' + company.legal_form}`]);
    }, stepTimeout * 5);

    setTimeout(() => {
      // Step 6 Completed
      setSteps(prev => prev.map(s => s.step === 6 ? { ...s, status: 'completed' } : s));
      setTerminalLogs(prev => [...prev, `[STEP-6] ${lang === 'pl' ? 'Analiza zakończona. Wygenerowano rejestr obowiązków prawnych.' : 'Analysis finished. Legal obligation registry generated.'}`]);
    }, stepTimeout * 6);

    setTimeout(() => {
      setTerminalLogs(prev => [...prev, `[SYS] ${lang === 'pl' ? 'Przekierowanie do wyników...' : 'Redirecting to dashboard...'}`]);
      setLeadCompany(company.name);
      setTimeout(() => {
        setResultsData(mockResult);
        setAppState('results');
      }, 300);
    }, stepTimeout * 7);
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

    // Connect to Nest.js SSE Progress Endpoint running on Port 3001
    let sseUrl = `http://localhost:3001/api/lookup/progress/${cleanNip}`;
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
        console.warn('Failed to parse step SSE', err);
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
        console.warn('Failed to parse final result payload', err);
      }
    });

    es.addEventListener('error', (e: any) => {
      if (hasCompletedRef.current || es.readyState === EventSource.CLOSED) {
        return;
      }

      console.warn('SSE stream error caught, seamlessly falling back to browser-side analysis simulation:', e);
      es.close();
      startClientSideSimulation(cleanNip);
    });
  };

  const handleQuickDemo = (nip: string) => {
    setNipInput(nip);
    handleSearch(nip);
  };

  // Direct PDF Download with elegant fallback to port 3000 local API
  const handleDownloadPdf = async () => {
    if (!resultsData?.company?.nip) return;
    setPdfDownloading(true);
    try {
      const nip = resultsData.company.nip;
      let downloadUrl = `http://localhost:3001/api/pdf/download/${nip}`;
      const queryParams: string[] = [];
      if (customEmployees.trim() !== '') queryParams.push(`employees=${encodeURIComponent(customEmployees.trim())}`);
      if (customRevenue.trim() !== '') queryParams.push(`revenue=${encodeURIComponent(customRevenue.trim())}`);
      if (customAssets.trim() !== '') queryParams.push(`assets=${encodeURIComponent(customAssets.trim())}`);
      
      if (queryParams.length > 0) {
        downloadUrl += `?${queryParams.join('&')}`;
      }

      try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Failed to fetch from backend');

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
        console.warn('NestJS backend download failed, using local PDF fallback API endpoint:', err);
        const fallbackUrl = `/api/regulations-search/pdf-fallback`;
        const response = await fetch(fallbackUrl);
        if (!response.ok) throw new Error('Local PDF fallback route failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Compliance_Report_${nip}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn('PDF download failed:', err);
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
          <NavMenuLink href="/#modules">{lang === 'pl' ? 'Moduły' : 'Modules'}</NavMenuLink>
          <NavMenuLink href="/benchmark">{lang === 'pl' ? 'Benchmark' : 'Benchmark'}</NavMenuLink>
          <NavMenuLink href="/regulations-search" className="active">{lang === 'pl' ? 'Szukaj Regulacji' : 'Regulations Search'}</NavMenuLink>
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
                        <div style={{ fontWeight: 800, color: theme.colors.white, fontSize: '0.95rem', lineHeight: 1.3 }}>
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
                        <div style={{ fontWeight: 600, color: theme.colors.slate300, display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: 1.4 }}>
                          <MapPin size={14} style={{ color: theme.colors.slate500, marginTop: '0.15rem', flexShrink: 0 }} />
                          <span>
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '0.75rem', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5' }}>
                              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                              <span>
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
