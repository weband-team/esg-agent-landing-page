"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown
} from "lucide-react";

// Bilingual translations
const t = {
  pl: {
    title: "Centrum Regulacji Przedsiębiorstw",
    subtitle: "Zautomatyzowany Silnik Dopasowania Regulacyjnego ESG & Compliance",
    desc: "Wpisz NIP dowolnego polskiego podmiotu, aby uruchomić 7-stopniowy algorytm weryfikacyjny. Przeskanujemy ponad 40 krajowych i unijnych aktów prawnych pod kątem Twoich obowiązków.",
    placeholder: "Wpisz 10-cyfrowy numer NIP (np. 5252625123)...",
    searchBtn: "Uruchom Analizę",
    validating: "Weryfikacja podmiotu...",
    invalidNip: "Wprowadzony numer NIP jest niepoprawny (błąd sumy kontrolnej modulo-11).",
    wrongLength: "NIP musi składać się dokładnie z 10 cyfr.",
    foreignBlockTitle: "Ograniczenie Terytorialne",
    foreignBlockDesc: "Wykryto zagraniczny prefiks VAT EU ({prefix}). Bieżąca wersja systemu obsługuje wyłącznie podmioty zarejestrowane na terytorium Rzeczypospolitej Polskiej.",
    foreignBlockClose: "Zrozumiałem, zmień",
    demoTitle: "Szybki start: Wybierz profil demonstracyjny",
    demoSaaS: "Tech SaaS (Mała Sp. z o.o.)",
    demoMetal: "Huta & Metal (Duża S.A.)",
    demoRestaurant: "Restauracja (Mikro Sp. j.)",
    demoTransport: "Spółka Transportowa (Średnia Sp. z o.o.)",
    analysisProgress: "Postęp analizy regulacyjnej",
    liveLogs: "Dziennik zdarzeń silnika RegTech (SSE)",
    resultsTitle: "Raport Zgodności Regulacyjnej",
    downloadReport: "Pobierz Raport PDF",
    newSearch: "Nowe Wyszukiwanie",
    companyDetails: "Metadane Podmiotu",
    krs: "KRS",
    regon: "REGON",
    legalForm: "Forma prawna",
    registeredDate: "Data rejestracji",
    address: "Siedziba",
    pkd: "Kody PKD",
    summaryTitle: "Podsumowanie Dopasowań",
    matchedCount: "Dopasowane przepisy",
    totalChecked: "Przeanalizowano bazę",
    confidence: "Poziom pewności",
    certain: "Pewny (Bezpośredni trigger)",
    likely: "Prawdopodobny",
    possible: "Potencjalny ( PKD / Branża )",
    tabs: {
      all: "Wszystkie",
      environmental_ehs: "Środowisko & EHS",
      tax_finance: "Podatki & Finanse",
      employment_social: "Zatrudnienie & ZUS",
      data_privacy: "Prywatność & RODO",
      consumer_competition: "Konsument & Konkurencja",
      corporate_registration: "Rejestry & Spółka",
      sector_specific: "Branżowe & KNF",
      eu_compliance: "Standardy UE & ESG"
    },
    obligations: "Szczegóły obowiązku",
    legalBasis: "Podstawa prawna",
    authority: "Organ nadzorczy",
    frequency: "Częstotliwość",
    deadline: "Termin złożenia",
    evidence: "Dowody do archiwizacji",
    penalty: "Ryzyko sankcji / kary",
    penaltyBadge: "Ryzyko",
    triggerReason: "Dlaczego dopasowano?",
    officialLink: "Strona urzędowa / Zgłoszenie",
    confidenceLevel: "Pewność dopasowania",
    noObligations: "Brak zidentyfikowanych specyficznych obowiązków w tej kategorii.",
    downloading: "Generowanie PDF...",
    revenue: "Roczny obrót",
    employees: "Zatrudnienie",
    advancedTitle: "Zaawansowane kryteria wielkościowe (opcjonalnie)",
    advancedEmployeesLabel: "Liczba pracowników",
    advancedEmployeesPlaceholder: "np. 0",
    advancedRevenueLabel: "Roczny obrót (PLN)",
    advancedRevenuePlaceholder: "np. 50000",
    advancedAssetsLabel: "Suma bilansowa (PLN)",
    advancedAssetsPlaceholder: "np. 20000",
    advancedHint: "Wprowadź rzeczywiste dane podmiotu, aby nadpisać domyślne oszacowania heurystyczne systemu."
  },
  en: {
    title: "Corporate Compliance Centre",
    subtitle: "Automated ESG & Compliance Regulatory Matching Engine",
    desc: "Enter the NIP of any Polish company to execute the 7-step validation algorithm. We cross-reference over 40 national and EU regulations against your legal profile.",
    placeholder: "Enter 10-digit NIP number (e.g. 5252625123)...",
    searchBtn: "Run Compliance Scan",
    validating: "Validating entity...",
    invalidNip: "The entered NIP is invalid (failed modulo-11 checksum verification).",
    wrongLength: "The NIP must consist of exactly 10 digits.",
    foreignBlockTitle: "Territorial Limitation",
    foreignBlockDesc: "Foreign EU VAT prefix detected ({prefix}). The current version of the system only supports legal entities registered in the Republic of Poland.",
    foreignBlockClose: "Understood, change",
    demoTitle: "Quick Start: Choose a Sandbox Profile",
    demoSaaS: "Tech SaaS (Small Sp. z o.o.)",
    demoMetal: "Metal Manufacturing (Large S.A.)",
    demoRestaurant: "Restaurant (Micro Sp. j.)",
    demoTransport: "Transport Logistics (Medium Sp. z o.o.)",
    analysisProgress: "Regulatory Analysis Progress",
    liveLogs: "RegTech Engine Event Log (SSE)",
    resultsTitle: "Regulatory Compliance Report",
    downloadReport: "Download PDF Report",
    newSearch: "New Search",
    companyDetails: "Entity Metadata",
    krs: "KRS Registry",
    regon: "REGON",
    legalForm: "Legal form",
    registeredDate: "Registration date",
    address: "Registered address",
    pkd: "PKD Industry Codes",
    summaryTitle: "Match Summary",
    matchedCount: "Matched regulations",
    totalChecked: "Total catalog checked",
    confidence: "Confidence Level",
    certain: "Certain (Direct trigger)",
    likely: "Likely",
    possible: "Possible (PKD / Sector)",
    tabs: {
      all: "All",
      environmental_ehs: "EHS & Environment",
      tax_finance: "Taxes & Finance",
      employment_social: "Employment & Social",
      data_privacy: "RODO & GDPR",
      consumer_competition: "Consumer & Antitrust",
      corporate_registration: "Corporate Registries",
      sector_specific: "Sector Regulatory",
      eu_compliance: "EU ESG Standards"
    },
    obligations: "Obligation details",
    legalBasis: "Legal basis",
    authority: "Regulatory authority",
    frequency: "Frequency",
    deadline: "Filing deadline",
    evidence: "Evidence to maintain",
    penalty: "Sanction / penalty risk",
    penaltyBadge: "Risk",
    triggerReason: "Why did this match?",
    officialLink: "Official portal / submission",
    confidenceLevel: "Match confidence",
    noObligations: "No specific obligations identified in this category.",
    downloading: "Generating PDF...",
    revenue: "Annual revenue",
    employees: "Employees count",
    advancedTitle: "Advanced sizing criteria (optional)",
    advancedEmployeesLabel: "Employees count",
    advancedEmployeesPlaceholder: "e.g. 0",
    advancedRevenueLabel: "Annual revenue (PLN)",
    advancedRevenuePlaceholder: "e.g. 50000",
    advancedAssetsLabel: "Balance sheet assets (PLN)",
    advancedAssetsPlaceholder: "e.g. 20000",
    advancedHint: "Enter the actual entity data to override the system's default heuristic estimations."
  }
};

interface StepData {
  step: number;
  title: { pl: string; en: string };
  status: "idle" | "active" | "completed";
  meta?: any;
}

export default function Home() {
  const [lang, setLang] = useState<"pl" | "en">("pl");
  const [nipInput, setNipInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Custom sizing override states
  const [customEmployees, setCustomEmployees] = useState<string>("");
  const [customRevenue, setCustomRevenue] = useState<string>("");
  const [customAssets, setCustomAssets] = useState<string>("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  
  // Custom dialog state for foreign EU VAT
  const [foreignBlock, setForeignBlock] = useState<{ active: boolean; prefix: string } | null>(null);
  
  // App States: 'search' | 'processing' | 'results'
  const [appState, setAppState] = useState<"search" | "processing" | "results">("search");
  
  // SSE Processing states
  const [steps, setSteps] = useState<StepData[]>([
    { step: 1, title: { pl: "Rozpoczynanie weryfikacji NIP...", en: "Starting NIP validation..." }, status: "idle" },
    { step: 2, title: { pl: "Pobieranie danych rejestrowych CEIDG/KRS...", en: "Retrieving CEIDG/KRS registry data..." }, status: "idle" },
    { step: 3, title: { pl: "Uruchamianie 7-stopniowego silnika dopasowania PKD...", en: "Running 7-step PKD matching engine..." }, status: "idle" },
    { step: 4, title: { pl: "Sprawdzanie progów wielkościowych i zatrudnienia...", en: "Checking size and employment thresholds..." }, status: "idle" },
    { step: 5, title: { pl: "Nakładanie unijnych regulacji ESG/CSRD/GDPR...", en: "Applying EU ESG/CSRD/GDPR overlays..." }, status: "idle" },
    { step: 6, title: { pl: "Kategoryzacja obowiązków i generowanie rejestru...", en: "Categorizing obligations and generating registry..." }, status: "idle" },
  ]);
  
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [resultsData, setResultsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [pdfDownloading, setPdfDownloading] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalBottomRef = useRef<HTMLDivElement | null>(null);
  const hasCompletedRef = useRef<boolean>(false);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Client-side NIP Checksum Validation (Modulo-11)
  const validateNipModulo11 = (nip: string): boolean => {
    const cleanNip = nip.replace(/[\s-]/g, "");
    if (!/^\d{10}$/.test(cleanNip)) return false;

    // Bypass strict checksum check for predefined sandbox demo NIPs
    const sandboxNips = ["5252625123", "7251892345", "1234567890", "9012345678"];
    if (sandboxNips.includes(cleanNip)) return true;

    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNip[i], 10) * weights[i];
    }
    const control = sum % 11;
    return control === parseInt(cleanNip[9], 10);
  };

  // Main submit handler
  const handleSearch = (nipToSubmit?: string) => {
    const targetNip = (nipToSubmit || nipInput).trim();
    setError(null);
    setForeignBlock(null);

    if (!targetNip) return;

    // Detect Foreign EU prefix (e.g. DE, FR, GB, PL)
    const prefixMatch = targetNip.match(/^([A-Za-z]{2})/);
    if (prefixMatch) {
      const detectedPrefix = prefixMatch[1].toUpperCase();
      if (detectedPrefix !== "PL") {
        setForeignBlock({ active: true, prefix: detectedPrefix });
        return;
      }
    }

    const cleanNip = targetNip.replace(/[^0-9]/g, "");
    
    if (cleanNip.length !== 10) {
      setError(t[lang].wrongLength);
      return;
    }

    if (!validateNipModulo11(cleanNip)) {
      setError(t[lang].invalidNip);
      return;
    }

    // Initialize state for SSE progress view
    setSteps(prev => prev.map(s => ({ ...s, status: s.step === 1 ? "active" : "idle", meta: null })));
    setTerminalLogs([
      `[SYS] ${lang === 'pl' ? 'Inicjalizacja wyszukiwania dla NIP: ' : 'Initializing lookup for NIP: '}${cleanNip}`,
      `[SYS] ${lang === 'pl' ? 'Nawiązywanie połączenia Server-Sent Events...' : 'Establishing Server-Sent Events connection...'}`
    ]);
    setAppState("processing");

    // Close any previous stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Connect to Nest.js SSE Progress Endpoint
    let sseUrl = `http://localhost:3000/api/lookup/progress/${cleanNip}`;
    const queryParams: string[] = [];
    if (customEmployees.trim() !== "") {
      queryParams.push(`employees=${encodeURIComponent(customEmployees.trim())}`);
    }
    if (customRevenue.trim() !== "") {
      queryParams.push(`revenue=${encodeURIComponent(customRevenue.trim())}`);
    }
    if (customAssets.trim() !== "") {
      queryParams.push(`assets=${encodeURIComponent(customAssets.trim())}`);
    }
    if (queryParams.length > 0) {
      sseUrl += `?${queryParams.join("&")}`;
    }

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;
    hasCompletedRef.current = false;

    es.onopen = () => {
      setTerminalLogs(prev => [...prev, `[SYS] ${lang === 'pl' ? 'Połączenie SSE otwarte pomyślnie.' : 'SSE Connection successfully opened.'}`]);
    };

    es.addEventListener("step", (e: any) => {
      try {
        const eventData = JSON.parse(e.data);
        const stepNum = eventData.step;
        
        // Update current step status
        setSteps(prevSteps => prevSteps.map(s => {
          if (s.step === stepNum) {
            return { ...s, status: "completed", meta: eventData.meta };
          } else if (s.step === stepNum + 1) {
            return { ...s, status: "active" };
          }
          return s;
        }));

        // Log steps bilingual descriptive lines
        const plLog = eventData.title.pl;
        const enLog = eventData.title.en;
        const activeLog = lang === "pl" ? plLog : enLog;

        setTerminalLogs(prev => [
          ...prev, 
          `[STEP-${stepNum}] ${activeLog}`,
          ...(eventData.meta ? Object.entries(eventData.meta).map(([k, v]) => `  -> ${k.toUpperCase()}: ${v}`) : [])
        ]);

      } catch (err) {
        console.error("Failed to parse step SSE", err);
      }
    });

    es.addEventListener("result", (e: any) => {
      try {
        hasCompletedRef.current = true;
        // Instantly close the EventSource connection to prevent browser connection close errors
        es.close();

        const resultPayload = JSON.parse(e.data);
        setTerminalLogs(prev => [
          ...prev, 
          `[SYS] ${lang === 'pl' ? 'Analiza zakończona sukcesem. Przekierowanie do wyników...' : 'Analysis completed successfully. Redirecting to dashboard...'}`
        ]);
        
        // Let user see completed state briefly for a natural flow
        setTimeout(() => {
          setResultsData(resultPayload);
          setAppState("results");
        }, 800);

      } catch (err) {
        console.error("Failed to parse final result payload", err);
      }
    });

    es.addEventListener("error", (e: any) => {
      // If we have already completed successfully or if the event source is closed, ignore connection-level errors
      if (hasCompletedRef.current || es.readyState === EventSource.CLOSED) {
        return;
      }

      // We only suppress the error console log if we completed successfully.
      // For any other error (including connection dropped midway or server offline), we log it.
      console.error("SSE stream error:", e);

      let errorMsg = lang === "pl" 
        ? "Wystąpił błąd podczas analizy. Podany NIP może nie istnieć w bazie demonstracyjnej." 
        : "An error occurred during analysis. The provided NIP might not exist in our sandbox database.";
      
      if (e && e.data) {
        try {
          const errParsed = JSON.parse(e.data);
          if (errParsed.message) errorMsg = errParsed.message;
        } catch(_) {}
      }

      setTerminalLogs(prev => [...prev, `[ERROR] ${errorMsg}`]);
      setError(errorMsg);
      es.close();
      
      // Keep in processing state briefly so they can read the logs, then go back to search
      setTimeout(() => {
        setAppState("search");
      }, 4000);
    });
  };

  // Direct quick profile selection
  const handleQuickDemo = (nip: string) => {
    setNipInput(nip);
    handleSearch(nip);
  };

  // Trigger PDF streaming
  const handleDownloadPdf = async () => {
    if (!resultsData?.company?.nip) return;
    setPdfDownloading(true);
    try {
      const nip = resultsData.company.nip;
      let downloadUrl = `http://localhost:3000/api/pdf/download/${nip}`;
      const queryParams: string[] = [];
      if (customEmployees.trim() !== "") {
        queryParams.push(`employees=${encodeURIComponent(customEmployees.trim())}`);
      }
      if (customRevenue.trim() !== "") {
        queryParams.push(`revenue=${encodeURIComponent(customRevenue.trim())}`);
      }
      if (customAssets.trim() !== "") {
        queryParams.push(`assets=${encodeURIComponent(customAssets.trim())}`);
      }
      if (queryParams.length > 0) {
        downloadUrl += `?${queryParams.join("&")}`;
      }
      
      // Perform direct download triggers
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Failed to compile report");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const today = new Date().toISOString().split("T")[0];
      a.download = `Compliance_Report_${nip}_${today}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(lang === "pl" ? "Generowanie PDF nie powiodło się." : "PDF report compilation failed.");
    } finally {
      setPdfDownloading(false);
    }
  };

  // Reset to original search state
  const resetSearch = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setNipInput("");
    setCustomEmployees("");
    setCustomRevenue("");
    setCustomAssets("");
    setIsAdvancedOpen(false);
    setResultsData(null);
    setError(null);
    setAppState("search");
    setActiveTab("all");
  };

  // Filter regulations by tab area
  const getFilteredRegulations = () => {
    if (!resultsData) return [];
    if (activeTab === "all") return resultsData.matched_regulations;
    return resultsData.matched_regulations.filter((reg: any) => reg.area === activeTab);
  };

  // Get active tab count of matched obligations
  const getTabCount = (areaKey: string) => {
    if (!resultsData) return 0;
    if (areaKey === "all") return resultsData.matched_regulations.length;
    return resultsData.matched_regulations.filter((reg: any) => reg.area === areaKey).length;
  };

  return (
    <div className="flex-1 relative pb-20">
      {/* Background aesthetics */}
      <div className="grid-bg"></div>
      <div className="nebula-glow-1"></div>
      <div className="nebula-glow-2"></div>

      {/* Top bilingual & logo Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              ESG Compliance
            </div>
            <div className="text-[10px] text-indigo-400 tracking-wider font-semibold uppercase">
              Regtech Poland Suite
            </div>
          </div>
        </div>

        {/* Custom language picker */}
        <div className="lang-toggle" role="group" aria-label={lang === "pl" ? "Wybór języka" : "Language selection"}>
          <button 
            onClick={() => setLang("pl")}
            className={`lang-btn ${lang === "pl" ? "active" : ""}`}
            aria-label="Wybierz język polski / Select Polish language"
            aria-current={lang === "pl" ? "true" : "false"}
          >
            PL
          </button>
          <button 
            onClick={() => setLang("en")}
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            aria-label="Wybierz język angielski / Select English language"
            aria-current={lang === "en" ? "true" : "false"}
          >
            EN
          </button>
        </div>
      </header>

      {/* Application Main Layout */}
      <main className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
        
        {/* VIEW 1: SEARCH CONSOLE */}
        {appState === "search" && (
          <div className="max-w-3xl mx-auto text-center mt-8">
            
            {/* Pulsing visual tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>v1.2 Sandbox Compliant</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              {t[lang].title}
            </h1>
            <p className="text-lg text-indigo-300 font-semibold mb-2">
              {t[lang].subtitle}
            </p>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              {t[lang].desc}
            </p>

            {/* Custom Input Form Panel */}
            <div className="glass-panel p-8 mb-10 text-left">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <label htmlFor="nip-input" className="sr-only">NIP</label>
                <input
                  id="nip-input"
                  type="text"
                  value={nipInput}
                  onChange={(e) => setNipInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={t[lang].placeholder}
                  aria-label={t[lang].placeholder}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-lg transition-all"
                />
              </div>

              {/* Advanced Sizing Parameters Accordion */}
              <div className="mt-5 border border-white/5 rounded-xl bg-slate-950/20 overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-all focus:outline-none"
                  aria-expanded={isAdvancedOpen}
                  aria-controls="advanced-sizing-panel"
                >
                  <div className="flex items-center gap-3">
                    <Sliders className={`w-4 h-4 text-indigo-400 transition-all ${isAdvancedOpen ? 'rotate-90 text-indigo-300' : ''}`} />
                    <span className="text-sm font-semibold tracking-wide">
                      {t[lang].advancedTitle}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isAdvancedOpen && (
                  <div 
                    id="advanced-sizing-panel"
                    className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 animate-fadeIn"
                  >
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t[lang].advancedHint}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Custom Employees */}
                      <div className="space-y-1.5">
                        <label htmlFor="custom-employees" className="text-xs font-semibold text-slate-400">
                          {t[lang].advancedEmployeesLabel}
                        </label>
                        <input
                          id="custom-employees"
                          type="number"
                          min="0"
                          value={customEmployees}
                          onChange={(e) => setCustomEmployees(e.target.value)}
                          placeholder={t[lang].advancedEmployeesPlaceholder}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
                        />
                      </div>

                      {/* Custom Revenue */}
                      <div className="space-y-1.5">
                        <label htmlFor="custom-revenue" className="text-xs font-semibold text-slate-400">
                          {t[lang].advancedRevenueLabel}
                        </label>
                        <input
                          id="custom-revenue"
                          type="number"
                          min="0"
                          value={customRevenue}
                          onChange={(e) => setCustomRevenue(e.target.value)}
                          placeholder={t[lang].advancedRevenuePlaceholder}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
                        />
                      </div>

                      {/* Custom Assets */}
                      <div className="space-y-1.5">
                        <label htmlFor="custom-assets" className="text-xs font-semibold text-slate-400">
                          {t[lang].advancedAssetsLabel}
                        </label>
                        <input
                          id="custom-assets"
                          type="number"
                          min="0"
                          value={customAssets}
                          onChange={(e) => setCustomAssets(e.target.value)}
                          placeholder={t[lang].advancedAssetsPlaceholder}
                          className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={() => handleSearch()}
                className="btn-neon w-full mt-5 py-4 text-lg"
              >
                <RefreshCw className="w-5 h-5 animate-spin" style={{ display: 'none' }} />
                <span>{t[lang].searchBtn}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sandbox Profiles selector */}
            <div className="text-left">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{t[lang].demoTitle}</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleQuickDemo("5252625123")}
                  className="glass-card-subtle flex items-start gap-4 text-left group"
                >
                  <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-all">
                      F-Suite Sp. z o.o.
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t[lang].demoSaaS}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo("7251892345")}
                  className="glass-card-subtle flex items-start gap-4 text-left group"
                >
                  <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-all">
                      PolMetal S.A.
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t[lang].demoMetal}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo("1234567890")}
                  className="glass-card-subtle flex items-start gap-4 text-left group"
                >
                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-amber-300 transition-all">
                      Restauracja Smak Sp. j.
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t[lang].demoRestaurant}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo("9012345678")}
                  className="glass-card-subtle flex items-start gap-4 text-left group"
                >
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-purple-300 transition-all">
                      TransLogistic Sp. z o.o.
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t[lang].demoTransport}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* VIEW 2: PROGRESS CONSOLE SCREEN (SSE FEED) */}
        {appState === "processing" && (
          <div className="max-w-3xl mx-auto mt-6">
            
            {/* Upper Indicator */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-white mb-1">
                {t[lang].validating}
              </h2>
              <p className="text-sm text-slate-400">
                {t[lang].analysisProgress}
              </p>
            </div>

            {/* Glowing Progressive Steps Stepper */}
            <div className="glass-panel p-8 mb-8">
              <div className="space-y-6">
                {steps.map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    {/* Stepper Dot */}
                    <div className="relative pt-1 flex items-center justify-center">
                      <div className={`step-dot ${s.status === "completed" ? "completed" : s.status === "active" ? "active" : ""}`} />
                      {s.step < steps.length && (
                        <div className="absolute top-4 bottom-0 left-1.5 w-0.5 h-12 bg-white/5" />
                      )}
                    </div>

                    {/* Step description */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-semibold transition-all ${
                          s.status === "completed" ? "text-cyan-400" : s.status === "active" ? "text-white text-shadow-glow" : "text-slate-500"
                        }`}>
                          {lang === "pl" ? s.title.pl : s.title.en}
                        </h3>
                        {s.status === "completed" && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>

                      {/* Display retrieved data details dynamically on Step 2 & 4 */}
                      {s.status === "completed" && s.meta && (
                        <div className="mt-2 text-xs grid grid-cols-2 gap-3 p-3 bg-white/5 border border-white/5 rounded-lg text-slate-300 animate-fadeIn">
                          {Object.entries(s.meta).map(([key, val]: any) => (
                            <div key={key} className="truncate">
                              <span className="text-slate-500 uppercase font-mono mr-1">{key}:</span>
                              <span>{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Live Stream Logs */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{t[lang].liveLogs}</span>
              </h3>
              
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed text-cyan-500 space-y-1 shadow-inner">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={`whitespace-pre-wrap ${
                    log.startsWith('[ERROR]') ? 'text-rose-400 font-bold' : log.startsWith('[STEP') ? 'text-indigo-400' : 'text-cyan-400/90'
                  }`}>
                    {log}
                  </div>
                ))}
                <div ref={terminalBottomRef} />
              </div>
            </div>

          </div>
        )}


        {/* VIEW 3: COMPLIANCE RESULTS DASHBOARD */}
        {appState === "results" && resultsData && (
          <div className="space-y-8 animate-fadeIn">
            <h1 className="sr-only">
              {t[lang].resultsTitle} - {resultsData.company.name}
            </h1>
            
            {/* Top Back/Reset & PDF Download Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <button
                  onClick={resetSearch}
                  className="btn-secondary px-5 py-2.5 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t[lang].newSearch}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfDownloading}
                  className="btn-neon px-6 py-3 text-sm shadow-xl"
                >
                  {pdfDownloading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t[lang].downloading}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{t[lang].downloadReport}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Layout Grid: 1. Left (Company profile & analysis summary) | 2. Right (Regulation registry) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT SIDE PANEL (4 cols): Profile & Metadata */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Company Details Card */}
                <div className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-base">
                        {t[lang].companyDetails}
                      </h2>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                        NIP: {resultsData.company.nip}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 uppercase mb-1">{lang === 'pl' ? 'Nazwa firmy' : 'Company name'}</div>
                      <div className="font-bold text-white text-base leading-snug">
                        {resultsData.company.name}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-0.5">{t[lang].krs}</div>
                        <div className="font-semibold text-slate-200">{resultsData.company.krs || "—"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-0.5">{t[lang].regon}</div>
                        <div className="font-semibold text-slate-200">{resultsData.company.regon}</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-slate-500 uppercase mb-0.5">{t[lang].legalForm}</div>
                      <div className="font-semibold text-indigo-300">
                        {resultsData.company.legal_form === "sp_z_o_o" ? "Sp. z o.o. (LLC)" : 
                         resultsData.company.legal_form === "sa" ? "S.A. (Joint-Stock)" :
                         resultsData.company.legal_form === "sp_j" ? "Sp. j. (Partnership)" : "CEIDG (Sole Trader)"}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-slate-500 uppercase mb-0.5">{t[lang].registeredDate}</div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{resultsData.company.registration_date}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-slate-500 uppercase mb-0.5">{t[lang].address}</div>
                      <div className="font-semibold text-slate-200 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <span>
                          {resultsData.company.address.street}, {resultsData.company.address.postal_code} {resultsData.company.address.city}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <div className="text-xs text-slate-500 uppercase mb-1.5">{t[lang].pkd}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {resultsData.company.pkd.map((code: string) => (
                          <span key={code} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono font-semibold text-indigo-300">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric Summary Statistics */}
                <div className="glass-panel p-6">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Scale className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-white text-base">
                      {t[lang].summaryTitle}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                      <div className="text-3xl font-black text-indigo-400">
                        {resultsData.analysis_summary.matched_count}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        {t[lang].matchedCount}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl text-center">
                      <div className="text-3xl font-black text-slate-300">
                        {resultsData.analysis_summary.total_regulations_checked}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                        {t[lang].totalChecked}
                      </div>
                    </div>
                  </div>

                  {/* Thresholds Display */}
                  <div className="space-y-3 pt-3 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>{t[lang].employees}</span>
                      </div>
                      <div className="font-bold text-white">
                        {resultsData.company.employee_count}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span>{t[lang].revenue}</span>
                      </div>
                      <div className="font-bold text-white">
                        {resultsData.company.revenue_pln.toLocaleString("pl-PL")} PLN
                      </div>
                    </div>
                  </div>

                  {/* Confidence metrics breakdown */}
                  <div className="mt-5 space-y-2 text-xs">
                    <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">
                      {t[lang].confidence}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-semibold">{t[lang].certain}</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-bold font-mono">
                        {resultsData.analysis_summary.by_confidence.certain || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-semibold">{t[lang].likely}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 font-bold font-mono">
                        {resultsData.analysis_summary.by_confidence.likely || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-semibold">{t[lang].possible}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold font-mono">
                        {resultsData.analysis_summary.by_confidence.possible || 0}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT OBLIGATIONS CATALOGUE (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Horizontal Categories Tabs Scroll */}
                <div role="tablist" aria-label={lang === 'pl' ? 'Kategorie wymogów' : 'Regulation categories'} className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar scroll-smooth">
                  {Object.entries(t[lang].tabs).map(([key, label]) => {
                    const count = getTabCount(key);
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={activeTab === key ? "true" : "false"}
                        onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                          activeTab === key
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-glow"
                            : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          activeTab === key ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-slate-500"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Regulation Cards List */}
                <div className="space-y-4">
                  {getFilteredRegulations().length > 0 ? (
                    getFilteredRegulations().map((reg: any) => (
                      <div
                        key={reg.regulation_id}
                        className={`glass-panel p-6 border-l-4 ${
                          reg.confidence_level === "certain" ? "card-certain" :
                          reg.confidence_level === "likely" ? "card-likely" : "card-possible"
                        }`}
                      >
                        {/* Upper Badges Block */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <span className="px-2.5 py-1 rounded bg-slate-900/80 border border-white/5 text-[10px] font-extrabold uppercase text-indigo-400">
                            {t[lang].tabs[reg.area as keyof typeof t.pl.tabs]}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {reg.regulation_id}
                            </span>
                            
                            {/* Risk Level Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              reg.penalty_risk === "high" ? "badge-high" :
                              reg.penalty_risk === "medium" ? "badge-medium" : "badge-low"
                            }`}>
                              {t[lang].penaltyBadge}: {reg.penalty_risk.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Title of obligation */}
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-all">
                          {lang === "pl" ? reg.obligation_name.pl : reg.obligation_name.en}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 mb-4 font-semibold">
                          {lang === "pl" ? reg.name.pl : reg.name.en}
                        </p>

                        {/* Trigger Reason Box */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs mb-5">
                          <div className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mb-1">
                            {t[lang].triggerReason}
                          </div>
                          <div className="text-slate-300 leading-relaxed">
                            {lang === "pl" ? reg.trigger_logic.pl : reg.trigger_logic.en}
                          </div>
                        </div>

                        {/* Core regulatory fields grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-3.5">
                            <div>
                              <div className="text-slate-500 uppercase tracking-widest font-mono text-[9px] mb-1">{t[lang].legalBasis}</div>
                              <div className="text-slate-200 font-semibold leading-relaxed">
                                {lang === "pl" ? reg.legal_basis.pl : reg.legal_basis.en}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-500 uppercase tracking-widest font-mono text-[9px] mb-1">{t[lang].authority}</div>
                              <div className="text-slate-200 font-semibold">
                                {lang === "pl" ? reg.authority.pl : reg.authority.en}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-slate-500 uppercase tracking-widest font-mono text-[9px] mb-0.5">{t[lang].frequency}</div>
                                <div className="text-slate-200 font-semibold capitalize">
                                  {reg.frequency}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500 uppercase tracking-widest font-mono text-[9px] mb-0.5">{t[lang].deadline}</div>
                                <div className="text-slate-200 font-semibold">
                                  {lang === "pl" ? reg.deadline.pl : reg.deadline.en}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-500 uppercase tracking-widest font-mono text-[9px] mb-1">{t[lang].evidence}</div>
                              <div className="text-slate-300 italic">
                                {lang === "pl" ? reg.evidence_to_keep.pl : reg.evidence_to_keep.en}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Penalty descriptions & official source link at bottom */}
                        <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-rose-300">
                            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
                            <span className="leading-snug">
                              <strong className="uppercase mr-1 text-[10px] tracking-wider text-rose-400">{t[lang].penalty}:</strong>
                              {lang === "pl" ? reg.penalty_description.pl : reg.penalty_description.en}
                            </span>
                          </div>

                          {reg.official_source && (
                            <a
                              href={reg.official_source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 hover:underline whitespace-nowrap"
                            >
                              <span>{t[lang].officialLink}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="glass-panel p-12 text-center">
                      <BadgeAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-sm font-semibold">
                        {t[lang].noObligations}
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER CONTROLS */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-white/5 mt-16 relative z-10">
        <p className="text-xs text-slate-500 leading-relaxed">
          &copy; {new Date().getFullYear()} RegTech Polish Compliance Checker. Powered by AI Agents on Next.js & Nest.js.
          <br />
          All data is mock sandbox structured representing current Polish national legal codes for testing.
        </p>
      </footer>

      {/* DETECTED FOREIGN VAT CODE BLOCK POPUP DIALOG */}
      {foreignBlock && foreignBlock.active && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="glass-panel max-w-md w-full p-8 border border-rose-500/20 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-slate-500 hover:text-white bg-transparent border-none outline-none cursor-pointer text-xl"
              onClick={() => setForeignBlock(null)}
              aria-label={lang === 'pl' ? 'Zamknij okno' : 'Close dialog'}
            >
              &times;
            </button>
            
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {t[lang].foreignBlockTitle}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {t[lang].foreignBlockDesc.replace("{prefix}", foreignBlock.prefix)}
            </p>

            <button
              onClick={() => setForeignBlock(null)}
              className="btn-neon w-full py-3"
            >
              <span>{t[lang].foreignBlockClose}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
