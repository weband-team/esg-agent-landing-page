'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Nav,
  NavLogo,
  LangToggle,
  LangBtn,
  NavCta,
  NavSecondaryCta,
  Container,
  Section,
  SectionSm,
  Tag,
  SectionTitle,
  SectionSub,
  GradientText,
  Divider,
  HeroSection,
  HeroBg,
  HeroGrid,
  HeroContent,
  HeroEyebrow,
  HeroTitle,
  HeroSub,
  HeroCtaGroup,
  ButtonPrimary,
  ButtonPrimaryLink,
  ButtonSecondary,
  ButtonSecondaryLink,
  HeroStats,
  HeroStat,
  TrustStrip,
  TrustGrid,
  TrustTitleCol,
  TrustBadge,
  TrustInfoCard,
  TrustMetaRow,
  ProblemSection,
  ProblemGrid,
  ProblemCard,
  HowSection,
  StepsGrid,
  StepCard,
  FeaturesSection,
  FeaturesGrid,
  FeatureCard,
  RegsStrip,
  RegsLabel,
  RegsList,
  RegPill,
  PilotBanner,
  PilotCountdown,
  FoundingSection,
  FoundingLayout,
  DepositCard,
  DepositPrice,
  DepositAmount,
  DepositCurrency,
  DepositLabel,
  DepositFeatures,
  DepositRefundBanner,
  BenefitList,
  BenefitItem,
  BenefitIconWrap,
  BenefitText,
  BenefitValueBadge,
  FormSection,
  FormWrap,
  NavMenu,
  NavMenuLink,
  ModulesSection,
  ModulesGrid,
  ModuleCard,
  FormGroup,
  FormRow,
  FormCheck,
  FormNote,
  DepositFlowSection,
  FlowStepsGrid,
  FlowStepCard,
  FaqSection,
  FaqList,
  FaqItem,
  FaqQuestion,
  FaqIcon,
  FaqAnswer,
  FinalCtaSection,
  Footer,
  ModalOverlay,
  ModalCard,
  ModalClose,
  ModalHeader,
  ModalIcon,
  ModalTrustBanner,
  ModalFields,
  ModalFieldRow,
  FieldValueWrap,
  FieldValue,
  CopyBtn,
  ModalFooter,
  VideoSection,
  VideoWrapper
} from './styles';

export default function Home() {
  // States
  const [lang, setLang] = useState('pl');
  const [currency, setCurrency] = useState('PLN');
  const [openFaq, setOpenFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Form input fields
  const [formData, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    standard: 'CSRD VSME'
  });

  // Response details for Modal
  const [modalDetails, setModalDetails] = useState({
    reference: 'ESG-QIRE-XXXXXX',
    amount: 399,
    currencyCode: 'PLN',
    currencySymbol: 'zł',
    accountNumber: '84102013320000150216354384',
    swiftBic: 'BPKOPLPW',
    bankName: 'PKO Bank Polski',
    bankAddress: 'ul. Świętokrzyska 36, 00-116 Warszawa, Polska',
    companyName: 'QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
    companyAddress: 'ul. Hetmańska 25, 15-727 Białystok, Polska'
  });

  // Inline bilingual text helper
  const txt = (pl, en) => (lang === 'pl' ? pl : en);

  // Sync language class to body for styled components support
  useEffect(() => {
    if (lang === 'en') {
      document.body.classList.add('en');
    } else {
      document.body.classList.remove('en');
    }
  }, [lang]);

  // Handle FAQ item click
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Handle form changes
  const handleInputChange = (e, field) => {
    setFormState({
      ...formData,
      [field]: e.target.value
    });
  };

  // Sync select currency selection changes with general state
  const handleCurrencyChange = (val) => {
    setCurrency(val);
  };

  // Copy helper
  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      // Populate modal details from API response
      setModalDetails({
        reference: data.deposit.reference
      });

      // Open Modal
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert(txt(
        `Wystąpił błąd podczas rejestracji: ${err.message}. Spróbuj ponownie lub skontaktuj się z nami.`,
        `An error occurred during registration: ${err.message}. Please try again or contact support.`
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <Nav>
        <NavLogo href="/">
          🌿 <span>ESG</span> Compliance Agent
        </NavLogo>
        <NavMenu>
          <NavMenuLink href="/benchmark">{txt('Benchmark', 'Benchmark')}</NavMenuLink>
        </NavMenu>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LangToggle>
            <LangBtn className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</LangBtn>
            <LangBtn className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangBtn>
          </LangToggle>
          <NavSecondaryCta href="https://app.esgsyncpro.qirelab.com" target="_blank">
            {txt('Uruchom wersję testową (Pilot) ↗', 'Launch Pilot App ↗')}
          </NavSecondaryCta>
          <NavCta href="#join">
            {txt('Odbierz darmowy dostęp →', 'Get free access →')}
          </NavCta>
        </div>
      </Nav>

      {/* HERO SECTION */}
      <HeroSection>
        <HeroBg />
        <HeroGrid />
        <Container>
          <HeroContent>
            <HeroEyebrow>
              <div className="dot"></div>
              {txt('Wersja pilotażowa dostępna do testów', 'Pilot version available for testing')}
            </HeroEyebrow>
            <HeroTitle>
              {txt('AI Copilot dla Ekspertów ESG.', 'The AI Copilot for ESG Consultants.')}
              <br />
              <GradientText>{txt('Analiza w minutę, decyzje w godzinę.', 'Automate data analysis. Focus on expert decisions.')}</GradientText>
            </HeroTitle>
            <HeroSub>
              {txt(
                'Wgraj dokumenty źródłowe, skany i bazy ERP Twoich klientów. Nasz agent AI automatycznie wyszuka dane, porówna je z regulacjami i przygotuje audytowalną analizę luk w godzinę zamiast tygodni. Wypróbuj pilotażową wersję za darmo.',
                'Upload raw client files, policies, and ERP exports. Our AI agent instantly compares and analyzes scattered sustainability data, producing professional, audit-ready ESG report drafts in hours instead of months. Try the pilot for free.'
              )}
            </HeroSub>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '3.5rem' }}>
              <HeroCtaGroup style={{ marginBottom: 0 }}>
                <ButtonPrimaryLink href="https://app.esgsyncpro.qirelab.com" target="_blank">
                  {txt('🚀 Wypróbuj wersję testową (Pilot) ↗', '🚀 Try the live Pilot version ↗')}
                </ButtonPrimaryLink>
                <ButtonSecondaryLink href="#join">
                  {txt('🎁 Odbierz darmowy dostęp na 6 mies. ↓', '🎁 Get 6 months free access ↓')}
                </ButtonSecondaryLink>
              </HeroCtaGroup>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {txt('⚠️ System wciąż się doskonali i jest intensywnie rozwijany', '⚠️ The system is in active development and improving daily')}
              </p>
            </div>
            <HeroStats>
              <HeroStat>
                <div className="num">9+</div>
                <div className="label">{txt('regulacji ESG', 'ESG frameworks')}</div>
              </HeroStat>
              <HeroStat>
                <div className="num">&lt;1h</div>
                <div className="label">{txt('do pierwszej analizy', 'to your first analysis')}</div>
              </HeroStat>
              <HeroStat>
                <div className="num">100%</div>
                <div className="label">{txt('prywatność danych', 'data privacy (EU)')}</div>
              </HeroStat>
              <HeroStat>
                <div className="num">6 mies.</div>
                <div className="label">{txt('darmowego dostępu*', 'free access*')}</div>
              </HeroStat>
            </HeroStats>
          </HeroContent>
        </Container>
      </HeroSection>

      <Divider />

      {/* TRUST & OPERATOR SECTION */}
      <TrustStrip>
        <Container>
          <TrustGrid>
            <TrustTitleCol>
              <TrustBadge>{txt('Zweryfikowany Operator ESG', 'Verified ESG Operator')}</TrustBadge>
              <h3>{txt('Bezpieczeństwo i legalność gwarantowane', 'Security & compliance guaranteed')}</h3>
              <p>
                {txt(
                  'Produkt jest tworzony i obsługiwany przez polską spółkę kapitałową, podlegającą pełnemu nadzorowi prawnemu w Unii Europejskiej. Twoje dane i prywatność są w pełni bezpieczne.',
                  'The product is developed and operated by a Polish joint-stock company, subject to full legal oversight in the European Union. Your data and privacy are fully safe.'
                )}
              </p>
            </TrustTitleCol>
            <TrustInfoCard>
              <TrustMetaRow>
                <span className="meta-label">{txt('Operator:', 'Operator:')}</span>
                <span className="meta-val">QIRE LAB SPÓŁKA Z O.O.</span>
              </TrustMetaRow>
              <TrustMetaRow>
                <span className="meta-label">KRS:</span>
                <span className="meta-val">0001197301</span>
              </TrustMetaRow>
              <TrustMetaRow>
                <span className="meta-label">NIP:</span>
                <span className="meta-val">5423505856</span>
              </TrustMetaRow>
              <TrustMetaRow>
                <span className="meta-label">REGON:</span>
                <span className="meta-val">542864985</span>
              </TrustMetaRow>
              <TrustMetaRow>
                <span className="meta-label">{txt('Siedziba:', 'HQ Address:')}</span>
                <span className="meta-val">ul. Hetmańska 25, 15-727 Białystok, PL</span>
              </TrustMetaRow>
            </TrustInfoCard>
          </TrustGrid>
        </Container>
      </TrustStrip>

      <Divider />

      {/* AVAILABLE MODULES SECTION */}
      <ModulesSection id="modules">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Moduły platformy', 'Platform Modules')}</Tag>
            <SectionTitle>
              {txt('Dostępne ', 'Available ')}
              <GradientText>{txt('bezpłatne moduły', 'free modules')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto 3rem auto', textAlign: 'center' }}>
              {txt(
                'Wybierz moduł, aby uruchomić dedykowanego asystenta AI, przeprowadzić szybką ocenę dojrzałości ESG lub wygenerować wymagane sprawozdania i raporty.',
                'Select a module to run a dedicated AI copilot, perform rapid ESG maturity assessments, or generate audit-ready reports.'
              )}
            </SectionSub>
          </div>
          <ModulesGrid>
            <ModuleCard style={{ border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div>
                <div className="module-icon">📊</div>
                <h3>{txt('ESG Benchmark (Maturity Assessment)', 'ESG Benchmark (Maturity Assessment)')}</h3>
                <p>
                  {txt(
                    'Interaktywny test dojrzałości ESG Twojego przedsiębiorstwa. Oceń obszary E, S i G, poznaj swój poziom zaawansowania oraz pobierz kompletny raport PDF z gotowymi rekomendacjami wdrożeniowymi i wyślij go na e-mail.',
                    'An interactive ESG maturity assessment of your enterprise. Evaluate E, S, and G categories, view your maturity tier, download a complete recommendations report in PDF format, and receive it via email.'
                  )}
                </p>
              </div>
              <ButtonPrimaryLink as={Link} href="/benchmark" style={{ width: '100%', justifyContent: 'center' }}>
                {txt('Uruchom moduł Benchmark →', 'Launch Benchmark Module →')}
              </ButtonPrimaryLink>
            </ModuleCard>

            <ModuleCard className="coming-soon">
              <span className="module-tag">{txt('Wkrótce', 'Coming soon')}</span>
              <div>
                <div className="module-icon coming-soon-icon">🍃</div>
                <h3>{txt('Analiza Śladu Węglowego (Carbon)', 'Carbon Footprint Calculator')}</h3>
                <p>
                  {txt(
                    'Precyzyjny moduł wyliczania śladu węglowego firmy (Emisje Zakresów 1, 2, 3) zgodny z GHG Protocol oraz normą ISO 14067. Automatyczne importowanie faktur za prąd, paliwo oraz tabele transportowe i wyliczenie śladu węglowego w kilka minut.',
                    'Advanced carbon accounting module for greenhouse gas emissions (Scope 1, 2, 3) compliant with the GHG Protocol and ISO 14067. Auto-import fuel & power invoices to compute carbon footprints instantly.'
                  )}
                </p>
              </div>
              <ButtonPrimary disabled style={{ width: '100%', justifyContent: 'center' }}>
                {txt('Moduł zablokowany', 'Module locked')}
              </ButtonPrimary>
            </ModuleCard>
          </ModulesGrid>
        </Container>
      </ModulesSection>

      <Divider />

      {/* PROBLEM SECTION */}
      <ProblemSection id="problem">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Problem', 'The Problem')}</Tag>
            <SectionTitle>
              {txt('ESG to gąszcz danych i ', 'ESG is a maze of ')}
              <GradientText>{txt('chaos w komunikacji', 'data & communication chaos')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto 3rem auto', textAlign: 'center' }}>
              {txt(
                'Chasowanie klientów i działów po dane zajmuje tygodnie. Regulacje ewoluują w zawrotnym tempie. Ręczna analiza i porównywanie tabel marnuje Twój cenny czas doradczy.',
                'Chasing clients or departments for data takes weeks. Sustainability regulations evolve faster than companies can adapt. Manual spreadsheet auditing eats into your high-value advisory time.'
              )}
            </SectionSub>
          </div>
          <ProblemGrid>
            <ProblemCard>
              <div className="problem-icon">😵</div>
              <h3>{txt('Rozproszone dane i chaos w plikach', 'Scattered data & endless chasing')}</h3>
              <p>
                {txt(
                  'Dane ESG leżą w mailach, dziesiątkach Exceli i systemach ERP. Zbieranie kompletnego zestawu do raportu CSRD lub weryfikacji EUDR to tygodnie gonienia ludzi.',
                  'Sustainability data is buried in endless email threads, multiple Excel spreadsheets, and legacy ERP systems. Pulling it together is a manual chasing nightmare.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">🔄</div>
              <h3>{txt('Regulacyjny ruchomy cel', 'Regulatory uncertainty')}</h3>
              <p>
                {txt(
                  'Terminy EUDR, standardy ESRS i wytyczne Komisji ciągle się zmieniają. Śledzenie zmian i re-edukacja zespołów marnuje setki godzin, które powinieneś przeznaczyć na strategię.',
                  'EUDR timelines shift, ESRS standards update, and national guidelines issue short notices. Tracking regulatory updates manually takes up valuable billable hours.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">⏳</div>
              <h3>{txt('Mordercza, powtarzalna praca manualna', 'Overwhelming manual overhead')}</h3>
              <p>
                {txt(
                  'Zamiast skupić się na doradztwie i decyzjach strategicznych, tracisz 80% czasu na manualne przeklejanie danych, sprawdzanie braków i wypełnianie powtarzalnych szablonów.',
                  'Instead of delivering high-level advisory value and strategy, you waste up to 80% of your time on manual copy-pasting, gap checking, and cross-referencing tables.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">🤝</div>
              <h3>{txt('Brak zaufania i opór zespołów', 'Stakeholder friction & trust gaps')}</h3>
              <p>
                {txt(
                  'Działy finansowe, zakupowe i logistyczne widzą w ESG tylko zbędne koszty i opóźniają dane. Nasz Agent dostarcza twarde fakty, cytując dokładne źródła, co buduje natychmiastową wiarygodność.',
                  'Internal departments or suppliers treat ESG requests as low priority. The AI agent extracts verifiable facts with precise source citations, establishing immediate authority and alignment.'
                )}
              </p>
            </ProblemCard>
          </ProblemGrid>
        </Container>
      </ProblemSection>

      {/* HOW IT WORKS SECTION */}
      <HowSection id="how">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Jak to działa', 'How it works')}</Tag>
            <SectionTitle>
              {txt('Trzy kroki do ', 'Three steps to a ')}
              <GradientText>{txt('gotowego raportu ESG', 'complete ESG report')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto 3rem auto', textAlign: 'center' }}>
              {txt(
                'Dla profesjonalistów, którzy faktycznie wdrażają ESG. Bez zbędnego żargonu, w pełni profesjonalny workflow.',
                'Built for professionals who actually do ESG. Professional workflow, zero fluff.'
              )}
            </SectionSub>
          </div>
          <StepsGrid>
            <StepCard>
              <div className="step-num">01</div>
              <h3>{txt('Wgraj dane źródłowe i operacyjne', 'Upload raw operational data')}</h3>
              <p>
                {txt(
                  'Wgraj surowe pliki finansowe, polityki HR, certyfikaty, skany rachunków za energię czy dane o łańcuchu dostaw. Nasz agent AI odczyta i ustrukturyzuje wszystko automatycznie.',
                  'Upload raw financial reports, HR policies, certificates, scanned energy bills, or supply chain spreadsheets. The agent instantly parses and structures everything.'
                )}
              </p>
            </StepCard>
            <StepCard>
              <div className="step-num">02</div>
              <h3>{txt('Uruchom inteligentną analizę i porównania', 'Run automated analysis & comparisons')}</h3>
              <p>
                {txt(
                  'Wybierz CSRD, EUDR, GRI lub inny standard. Agent automatycznie porównuje dokumenty z wymogami prawnymi, wskazuje brakujące dane i natychmiast uzupełnia analizę luk.',
                  'Select CSRD, EUDR, GRI, or national frameworks. The AI agent automatically analyzes gaps, cross-references files, and answers queries with strict source-backed logic.'
                )}
              </p>
            </StepCard>
            <StepCard>
              <div className="step-num">03</div>
              <h3>{txt('Wygeneruj profesjonalny raport dla audytora', 'Generate professional, audit-ready drafts')}</h3>
              <p>
                {txt(
                  'Wygeneruj kompletny projekt raportu ESG w DOCX i PDF, ze spójną strukturą wybranej regulacji i dokładną listą cytowań źródeł, ułatwiającą pracę biegłym rewidentom.',
                  'Export complete, fully structured reports in DOCX/PDF formats. Includes a rigorous audit trail of source citations and gap analyses, saving hours of regulatory review.'
                )}
              </p>
            </StepCard>
            <StepCard>
              <div className="step-num step-num-plus">+</div>
              <h3>{txt('Iteruj i doskonalaj', 'Iterate and improve')}</h3>
              <p>
                {txt(
                  'Poproś agenta o przepisanie sekcji, dodanie danych, zmianę tonu. Raport aktualizuje się natychmiast. Każda nowa wersja jest zapisywana w projekcie.',
                  'Ask the agent to rewrite a section, add data, or change the tone. Report updates instantly. Every version is saved in your project.'
                )}
              </p>
            </StepCard>
          </StepsGrid>
        </Container>
      </HowSection>

      <Divider />

      {/* VIDEO DEMO SECTION */}
      <VideoSection id="demo">
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Tag>{txt('Prezentacja wideo', 'Demo Video')}</Tag>
            <SectionTitle>
              {txt('Zobacz agenta ', 'See the agent ')}
              <GradientText>{txt('w akcji', 'in action')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto', textAlign: 'center' }}>
              {txt(
                'Obejrzyj krótkie nagranie prezentacyjne i przekonaj się, jak intuicyjne jest generowanie raportów ESG z naszym asystentem AI.',
                'Watch a short product demonstration to see how intuitive generating ESG reports with our AI assistant can be.'
              )}
            </SectionSub>
          </div>
          <VideoWrapper>
            <iframe
              key={lang}
              src={lang === 'pl' 
                ? 'https://drive.google.com/file/d/1y4pSu5FPl482U4cZ6-MkPp_XRHw_0Bi0/preview' 
                : 'https://drive.google.com/file/d/1-I0Dvt3ZXE0eu-cTrJwC4N18UA3N7t-J/preview'}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={txt('Prezentacja wideo ESG Compliance Agent', 'ESG Compliance Agent Presentation Video')}
            />
          </VideoWrapper>
        </Container>
      </VideoSection>

      <Divider />

      {/* REGULATIONS STRIP */}
      <RegsStrip>
        <Container>
          <RegsLabel>{txt('Obsługiwane regulacje w wersji pilotażowej', 'Supported frameworks in the pilot')}</RegsLabel>
          <RegsList>
            <RegPill>CSRD / VSME</RegPill>
            <RegPill>ESRS E1–E5</RegPill>
            <RegPill>ESRS S1–S4</RegPill>
            <RegPill>ESRS G1</RegPill>
            <RegPill>ISO 14067</RegPill>
            <RegPill>ISO 14001</RegPill>
            <RegPill>GRI Standards</RegPill>
            <RegPill>EU Taxonomy</RegPill>
            <RegPill style={{ borderColor: 'rgba(34,197,94,0.35)', color: '#4ade80' }}>
              {txt('+ Polskie wymogi krajowe', '+ Polish national requirements')}
            </RegPill>
          </RegsList>
        </Container>
      </RegsStrip>

      {/* FEATURES SECTION */}
      <FeaturesSection id="features">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Funkcjonalności', 'Features')}</Tag>
            <SectionTitle>
              {txt('Wszystko, czego potrzebujesz ', 'Everything you need ')}
              <br />
              <GradientText>{txt('do pełnej zgodności ESG', 'for full ESG compliance')}</GradientText>
            </SectionTitle>
          </div>
          <FeaturesGrid style={{ marginTop: '3rem' }}>
            <FeatureCard>
              <div className="feature-icon">🤖</div>
              <h3>{txt('Konwersacyjny agent AI', 'Conversational AI agent')}</h3>
              <p>
                {txt(
                  'Zadaj pytanie po polsku lub angielsku. Agent przeszuka Twoje dokumenty i regulacje, odpowie z dokładnymi cytatami źródeł. Jak ChatGPT — ale tylko dla Twojej firmy.',
                  'Ask in Polish or English. The agent searches your documents and regulations, responds with exact source citations. Like ChatGPT — but only for your company data.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Strumieniowanie odpowiedzi', '✓ Real-time streaming')}</span>
            </FeatureCard>
            <FeatureCard>
              <div className="feature-icon">📋</div>
              <h3>{txt('Tracker zgodności z wynikiem procentowym', 'Compliance tracker with percentage score')}</h3>
              <p>
                {txt(
                  'Lista kontrolna wszystkich wymogów regulacji. Każdy punkt ma status: Spełnione / Częściowe / Brakujące. Widzisz swój wynik „CSRD VSME: 72%" na bieżąco.',
                  'Checklist of all regulation requirements. Each item shows: Covered / Partial / Missing. You see your "CSRD VSME: 72%" score live.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Auto-aktualizacja', '✓ Auto-updates')}</span>
            </FeatureCard>
            <FeatureCard>
              <div className="feature-icon">📄</div>
              <h3>{txt('Generator raportów DOCX / PDF', 'DOCX / PDF report generator')}</h3>
              <p>
                {txt(
                  'Raport zgodny z oficjalną strukturą regulacji. Wypełniony danymi z Twoich dokumentów, z listą luk i sugestiami uzupełnień. Gotowy do przekazania audytorowi.',
                  'Report structured to the official regulation template. Populated with your data, gap list, and fill-in suggestions. Ready to hand to an auditor.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Raport w PL i EN', '✓ Report in PL & EN')}</span>
            </FeatureCard>
            <FeatureCard>
              <div className="feature-icon">🔒</div>
              <h3>{txt('Local-first — dane zostają u Ciebie', 'Local-first — your data stays with you')}</h3>
              <p>
                {txt(
                  'Architektura lokalna oznacza, że dokumenty nie są wysyłane do żadnej chmury. Pełna zgodność z RODO. Idealne dla firm z wrażliwymi danymi operacyjnymi.',
                  'Local architecture means documents are never sent to the cloud. Full GDPR compliance. Ideal for companies with sensitive operational data.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Tylko dane w UE', '✓ EU data only')}</span>
            </FeatureCard>
            <FeatureCard>
              <div className="feature-icon">📊</div>
              <h3>{txt('Multi-format: Excel, PDF, Word, skany', 'Multi-format: Excel, PDF, Word, scans')}</h3>
              <p>
                {txt(
                  'Wgraj dowolny plik. OCR automatycznie przetwarza zeskanowane dokumenty. Obsługujemy tabele energetyczne, polityki HR, certyfikaty, raporty roczne i linki do stron.',
                  'Upload any file. OCR auto-processes scanned documents. We handle energy tables, HR policies, certificates, annual reports, and website links.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Do 50 plików na projekt', '✓ Up to 50 files per project')}</span>
            </FeatureCard>
            <FeatureCard>
              <div className="feature-icon">🏢</div>
              <h3>{txt('Zarządzanie wieloma klientami i spółkami', 'Multi-Client & Multi-Entity Management')}</h3>
              <p>
                {txt(
                  'Prowadź projekty dla wielu klientów, spółek grupy kapitałowej i różnych okresów sprawozdawczych w jednym miejscu. Współdziel dostęp z asystentami, audytorami czy klientami.',
                  'Manage multiple clients, capital group entities, or different reporting cycles from a single dashboard. Securely share project-level access with assistants, auditors, or client teams.'
                )}
              </p>
              <span className="feature-badge">{txt('✓ Role: Owner / Editor / Viewer', '✓ Roles: Owner / Editor / Viewer')}</span>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      <Divider />

      {/* PILOT BANNER */}
      <SectionSm id="pilot">
        <Container>
          <PilotBanner>
            <PilotCountdown>
              ⏱️ {txt('Wersja pilotażowa — ograniczona dostępność przez 30 dni', 'Pilot version — limited availability for 30 days')}
            </PilotCountdown>
            <h2>
              {txt('Zautomatyzuj nudną pracę już dziś.', 'Automate manual workloads today.')}
              <br />
              {txt('Dołącz do ', 'Join the ')}
              <GradientText>{txt('Programu Założycielskiego', 'Founding Program')}</GradientText>
              .
            </h2>
            <p>
              {txt(
                'Otwieramy pilotażową wersję ESG Compliance Agent dla wybranej grupy doradców i dyrektorów ds. zrównoważonego rozwoju. Zabezpiecz swoje warunki jako Członek Założyciel i odzyskaj cenny czas doradczy.',
                'We are opening the pilot version of ESG Compliance Agent to a select cohort of ESG consultants and sustainability leaders. Lock in your founding benefits and free up your time for high-level decision making.'
              )}
            </p>
            <ButtonPrimaryLink href="#join">
              {txt('Zarejestruj się za darmo →', 'Register for free →')}
            </ButtonPrimaryLink>
          </PilotBanner>
        </Container>
      </SectionSm>

      {/* FOUNDING MEMBER PROGRAM */}
      <FoundingSection id="founding">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Program Założycielski', 'Founding Member Program')}</Tag>
            <SectionTitle style={{ marginBottom: '3rem' }}>
              {txt('Prezent przedpremierowy ', 'Pre-launch gifts ')}
              <GradientText>{txt('dla Członków Założycielskich', 'for Founding Members')}</GradientText>
            </SectionTitle>
          </div>
          <FoundingLayout>
            <BenefitList>
              <BenefitItem>
                <BenefitIconWrap>🎁</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Pół roku (6 miesięcy) pełnego dostępu — bezpłatnie', 'Half of the year (6 months) full access — free')}</h4>
                  <p>
                    {txt(
                      'Gdy produkt zostanie oficjalnie wydany (premiera planowana jest na 1 października), Członkowie Założyciele otrzymają pół roku (6 miesięcy) bezpłatnego użytkowania bez żadnych zobowiązań. Zacznij korzystać od pierwszego dnia premiery.',
                      'When the product officially launches (release is planned for October 1st), Founding Members get free access for half of the year (6 months) with no strings attached. Start using it from day one of the release.'
                    )}
                  </p>
                  <BenefitValueBadge>{txt('Wartość: ~1 800–3 600 PLN', 'Value: ~€450–900')}</BenefitValueBadge>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>🔐</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('40% dożywotniej zniżki na subskrypcję', '40% lifetime subscription discount')}</h4>
                  <p>
                    {txt(
                      'Po zakończeniu okresu darmowego, płacisz 40% mniej od regularnej ceny subskrypcji przez cały okres użytkowania. Twoja zniżka jest zamrożona na zawsze i gwarantowana, nawet gdy ceny wzrosną dla nowych klientów.',
                      'After your free period ends, you pay 40% less than the regular price for as long as you use the product. Your discount is locked forever and guaranteed, even as prices rise for new customers.'
                    )}
                  </p>
                  <BenefitValueBadge>{txt('Oszczędność: 40% na zawsze', 'Saving: 40% forever')}</BenefitValueBadge>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>🚀</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Priorytetowy onboarding — osobista sesja wdrożeniowa', 'Priority onboarding — personal setup session')}</h4>
                  <p>
                    {txt(
                      'Dedykowane spotkanie online, podczas którego pokażemy, jak korzystać z systemu w oparciu o wybrane regulacje oraz dane i specyfikę Twojej firmy.',
                      'A personal call where we will show you how to use the system step-by-step according to your specific regulations and company information.'
                    )}
                  </p>
                  <BenefitValueBadge>{txt('Wartość: 600 PLN', 'Value: €150')}</BenefitValueBadge>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>🗳️</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Bezpośredni wpływ na rozwój produktu', 'Direct input on product development')}</h4>
                  <p>
                    {txt(
                      'Twoje uwagi mają priorytet. Jako Członek Założyciel masz prywatny kanał feedbacku i Twoje prośby są rozpatrywane w pierwszej kolejności przez zespół developerski.',
                      'Your feedback takes priority. As a Founding Member you have a private feedback channel and your requests are processed first by the development team.'
                    )}
                  </p>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>⚡</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Wczesny dostęp do nowych modułów regulacyjnych', 'Early access to new regulation modules')}</h4>
                  <p>
                    {txt(
                      'EUDR, SFDR, polskie wymogi krajowe, sektorowe standardy — Członkowie Założyciele jako pierwsi testują nowe moduły jeszcze przed oficjalnym wydaniem.',
                      'EUDR, SFDR, Polish national requirements, sector standards — Founding Members test new modules first, before official release.'
                    )}
                  </p>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>🏆</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Status „Członka Założyciela" na stałe', 'Permanent „Founding Member" status')}</h4>
                  <p>
                    {txt(
                      'Odznaka Członka Założyciela w profilu, wymieniona strona w sekcji „Nasi pierwsi klienci", dostęp do zamkniętej sieci pierwszych użytkowników produktu.',
                      'Founding Member badge in your profile, listed on our "First customers" page, access to the closed network of early adopters.'
                    )}
                  </p>
                </BenefitText>
              </BenefitItem>
            </BenefitList>

            {/* DEPOSIT STICKY CARD */}
            <DepositCard id="deposit-card">
              <div style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '1rem' }}>
                {txt('🔑 Program Założycielski', '🔑 Founding Program')}
              </div>
              <DepositPrice>
                <DepositAmount>
                  0
                </DepositAmount>
                <DepositCurrency>{currency === 'PLN' ? 'zł' : currency === 'EUR' ? '€' : '$'}</DepositCurrency>
              </DepositPrice>
              <DepositLabel>
                {txt('rejestracja bez opłat · bez żadnego ryzyka', 'free pre-registration · zero commitment')}
              </DepositLabel>
              <DepositFeatures>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Natychmiastowy dostęp do pilotażu i testów AI', 'Immediate access to the pilot app and AI testing')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Pół roku (6 miesięcy) bezpłatnego dostępu po premierze (od 1 października)', 'Half of the year (6 months) free access after release (from October 1st)')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Dożywotnia zniżka 40% na subskrypcję po darmowym okresie', '40% lifetime subscription discount after the free period')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Osobista sesja wdrożeniowa (prezentacja asystenta)', 'Personal setup session (system walk-through)')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Rejestracja gwarantuje zablokowanie najlepszych warunków', 'Registration guarantees locking in the best benefits')}</span>
                </li>
              </DepositFeatures>
              <DepositRefundBanner>
                🛡️&nbsp;
                <span>
                  <strong>{txt('W 100% bezpłatnie.', '100% free.')}</strong>
                  {txt(
                    ' Rejestracja jest całkowicie darmowa i nie wymaga podpinania kart ani dokonywania płatności. Zyskujesz darmowy dostęp do pilotażu bez żadnych zobowiązań.',
                    ' Pre-registration is fully free and does not require credit cards or payments. You gain free access to the pilot with zero obligations.'
                  )}
                </span>
              </DepositRefundBanner>
              <ButtonPrimaryLink href="#join" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}>
                {txt('Zarejestruj się za darmo i odbierz prezenty →', 'Register for free and claim gifts →')}
              </ButtonPrimaryLink>
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
                {txt('Zabezpiecz swoje korzyści przedpremierowe już teraz.', 'Secure your pre-launch benefits right now.')}
              </p>
            </DepositCard>
          </FoundingLayout>
        </Container>
      </FoundingSection>

      {/* HOW DEPOSIT WORKS SECTION */}
      <DepositFlowSection>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Jak to działa', 'How it works')}</Tag>
            <SectionTitle style={{ marginBottom: '2.5rem' }}>
              {txt('Prosty proces. ', 'Simple process. ')}
              <GradientText>{txt('Maksimum korzyści.', 'Maximum benefits.')}</GradientText>
            </SectionTitle>
          </div>
          <FlowStepsGrid>
            <FlowStepCard>
              <div className="flow-num">1</div>
              <h4>{txt('Wypełnij krótki formularz', 'Fill in the short form')}</h4>
              <p>{txt('Podaj swoje dane kontaktowe, nazwę firmy oraz zaznacz standard ESG, który najbardziej Cię interesuje.', 'Provide your basic contact details, company name, and select the ESG standard that matters most to you.')}</p>
              <p className="flow-note">{txt('→ Rejestracja jest w 100% bezpłatna', '→ Pre-registration is 100% free')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num">2</div>
              <h4>{txt('Otrzymaj osobisty kod rejestracji', 'Get your unique registration code')}</h4>
              <p>{txt('Po wysłaniu system automatycznie wygeneruje Twój kod rejestracji (np. ESG-REG-XXXXXX), który blokuje przyznane prezenty.', 'Upon submission, the system generates your registration code (e.g. ESG-REG-XXXXXX), locking in your benefits.')}</p>
              <p className="flow-note">{txt('→ Kod przypisany na stałe do firmy', '→ Code locked to your company')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num">3</div>
              <h4>{txt('Testuj asystenta w wersji pilotażowej', 'Test the pilot version immediately')}</h4>
              <p>{txt('Możesz natychmiast przejść do wersji pilotażowej, aby przetestować asystenta AI, wgrać testowe pliki oraz sprawdzić, jak generowany jest gotowy raport.', 'You can instantly launch the pilot application to test the AI assistant, upload raw files, and see how compliance reports are generated.')}</p>
              <p className="flow-note">{txt('→ Wersja testowa dostępna od razu', '→ Pilot app is ready for testing')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num flow-num-check">✓</div>
              <h4>{txt('Odbierz prezenty po premierze', 'Claim your launch benefits')}</h4>
              <p>{txt('Gdy produkt wystartuje komercyjnie 1 października, otrzymasz pół roku pełnego darmowego dostępu bez żadnych zobowiązań oraz 40% dożywotniej zniżki.', 'When the product officially launches on October 1st, you get 6 months of free access with zero commitment and a 40% lifetime discount.')}</p>
              <p className="flow-note">{txt('→ Gwarantowane warunki założycielskie', '→ Guaranteed founding member terms')}</p>
            </FlowStepCard>
          </FlowStepsGrid>
        </Container>
      </DepositFlowSection>

      {/* SIGN-UP FORM SECTION */}
      <FormSection id="join">
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Tag>{txt('Rejestracja Pre-Launch', 'Pre-Launch Registration')}</Tag>
            <SectionTitle>
              {txt('Zarejestruj się bezpłatnie i ', 'Register for free and ')}
              <br />
              <GradientText>{txt('odbierz pakiet korzyści', 'claim your benefit package')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto', textAlign: 'center' }}>
              {txt(
                'Rejestracja przedpremierowa jest w 100% darmowa. Zabezpiecz 6 miesięcy darmowego dostępu i wypróbuj wersję testową (Pilot) już teraz.',
                'Pre-launch registration is 100% free. Secure 6 months of free access and try the pilot version right now.'
              )}
            </SectionSub>
          </div>
          <FormWrap>
            <h3>{txt('Krótki formularz zgłoszeniowy', 'Quick application form')}</h3>
            <p className="form-sub">
              {txt(
                'Zabezpiecz warunki założycielskie w kilka sekund. Dane zostaną zapisane w bezpiecznej bazie.',
                'Secure your founder benefits in seconds. Details saved in a secured database.'
              )}
            </p>
            <form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <label>{txt('Imię i nazwisko *', 'Full name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="Jan Kowalski"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                  />
                </FormGroup>
                <FormGroup>
                  <label>{txt('Adres e-mail *', 'Email address *')}</label>
                  <input
                    type="email"
                    required
                    placeholder="jan@firma.pl"
                    value={formData.email}
                    onChange={(e) => handleInputChange(e, 'email')}
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <label>{txt('Numer telefonu', 'Phone number')}</label>
                  <input
                    type="tel"
                    placeholder={txt('+48 731 270 861 (opcjonalnie)', '+48 731 270 861 (optional)')}
                    value={formData.phone}
                    onChange={(e) => handleInputChange(e, 'phone')}
                  />
                </FormGroup>
                <FormGroup>
                  <label>{txt('Nazwa firmy *', 'Company name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Sp. z o.o."
                    value={formData.company}
                    onChange={(e) => handleInputChange(e, 'company')}
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <label>{txt('Branża', 'Industry')}</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange(e, 'industry')}
                  >
                    <option value="">{txt('Wybierz...', 'Select...')}</option>
                    <option value="Manufacturing">{txt('Produkcja / Manufacturing', 'Manufacturing')}</option>
                    <option value="Retail">{txt('Handel / Retail', 'Retail / Trade')}</option>
                    <option value="Services">{txt('Usługi profesjonalne', 'Professional services')}</option>
                    <option value="Construction">{txt('Budownictwo', 'Construction')}</option>
                    <option value="Logistics">{txt('Logistyka / Transport', 'Logistics / Transport')}</option>
                    <option value="Finance">{txt('Finanse / Ubezpieczenia', 'Finance / Insurance')}</option>
                    <option value="Other">{txt('Inne', 'Other')}</option>
                  </select>
                </FormGroup>
                <FormGroup>
                  <label>{txt('Standard ESG *', 'ESG Standard *')}</label>
                  <select
                    required
                    value={formData.standard}
                    onChange={(e) => handleInputChange(e, 'standard')}
                  >
                    <option value="CSRD VSME">{txt('CSRD / VSME — wymagania EU dla MŚP', 'CSRD / VSME — EU requirements for SMEs')}</option>
                    <option value="ISO 14067">ISO 14067 — Carbon Footprint of Products</option>
                    <option value="GRI Standards">GRI Standards</option>
                    <option value="EU Taxonomy">EU Taxonomy</option>
                    <option value="Undecided">{txt('Nie wiem jeszcze — potrzebuję doradztwa', 'Not sure yet — need guidance')}</option>
                  </select>
                </FormGroup>
              </FormRow>
              <FormCheck>
                <input type="checkbox" required />
                <span>
                  {txt(
                    'Chcę zarezerwować przedpremierowy pakiet korzyści (6 miesięcy darmowego dostępu oraz 40% zniżki na zawsze) i zgadzam się na warunki udziału w Programie Pre-Launch.*',
                    'I want to reserve the pre-launch benefit package (6 months of free access and 40% discount forever) and agree to the Pre-Launch Program terms.*'
                  )}
                </span>
              </FormCheck>
              <FormCheck>
                <input type="checkbox" required />
                <span>
                  {txt(
                    'Wyrażam zgodę na przetwarzanie moich danych w celu rezerwacji darmowego pakietu przedpremierowego zgodnie z ',
                    'I consent to the processing of my data for the purpose of free pre-launch package reservation in line with the '
                  )}
                  <Link href="/privacy" target="_blank">
                    {txt('polityką prywatności', 'privacy policy')}
                  </Link>
                  .*
                </span>
              </FormCheck>
              <ButtonPrimary type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1.1rem', fontSize: '1.05rem' }}>
                {isSubmitting 
                  ? txt('Rejestrowanie...', 'Registering...') 
                  : txt('🚀 Odbierz darmowy pakiet korzyści i przejdź do pilotażu', '🚀 Claim free benefits & launch pilot app')}
              </ButtonPrimary>
            </form>
            <FormNote>
              {txt(
                'Twoje dane są u nas bezpieczne. Rejestracja jest całkowicie bezpłatna i nie wymaga podpinania kart ani dokonywania płatności.',
                'Your data is safe with us. Pre-registration is 100% free and does not require credit cards or payments.'
              )}
            </FormNote>
          </FormWrap>
        </Container>
      </FormSection>

      {/* FAQ SECTION */}
      <FaqSection>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Tag>FAQ</Tag>
            <SectionTitle>{txt('Najczęstsze pytania', 'Frequently asked questions')}</SectionTitle>
          </div>
          <FaqList>
            <FaqItem className={openFaq === 0 ? 'open' : ''} onClick={() => toggleFaq(0)}>
              <FaqQuestion>
                <span>{txt('Czy produkt jest gotowy? Co to znaczy „pilotaż"?', 'Is the product ready? What does "pilot" mean?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Tak — mamy działający produkt MVP z pełną funkcjonalnością: wgrywaniem dokumentów, agentem AI, trackerem zgodności i generowaniem raportów. Pilotaż to 30-dniowy okres testowania z prawdziwymi użytkownikami przed oficjalną premierą komercyjną, która zaplanowana jest na 1 października. Zbieramy feedback, aby produkt był doskonały w dniu premiery.',
                    "Yes — we have a fully working MVP: document upload, AI agent, compliance tracker, and report generation. The pilot is a 30-day testing period with real users before the official commercial release, which is planned for October 1st. We're collecting feedback to make the product perfect on launch day."
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 1 ? 'open' : ''} onClick={() => toggleFaq(1)}>
              <FaqQuestion>
                <span>{txt('Czy udział w pilotażu i rejestracja są płatne?', 'Is the pilot participation and registration paid?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Nie, rejestracja i udział w pilotażu są w 100% bezpłatne. Nie wymagamy podpinania kart kredytowych ani dokonywania płatności. Zyskujesz darmowy dostęp do pilotażu i gwarancję korzyści założycielskich po premierze bez żadnych zobowiązań.',
                    'No, registration and pilot participation are 100% free. We do not require credit cards or any payments. You get free access to the pilot and a guarantee of founding benefits upon launch with zero commitment.'
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 2 ? 'open' : ''} onClick={() => toggleFaq(2)}>
              <FaqQuestion>
                <span>{txt('Jakie prezenty otrzymam w ramach rejestracji przedpremierowej?', 'What gifts do I receive for pre-launch registration?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Jako uczestnik rejestracji przedpremierowej otrzymasz 6 miesięcy pełnego darmowego dostępu do komercyjnej wersji asystenta (od premiery 1 października 2026 r.) oraz 40% zniżki na zawsze na dowolny plan abonamentowy.',
                    'As a pre-launch registrant, you get 6 months of full, free access to the commercial version of the assistant (from launch on October 1, 2026) and 40% off forever on any subscription plan.'
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 3 ? 'open' : ''} onClick={() => toggleFaq(3)}>
              <FaqQuestion>
                <span>{txt('Czy moje dokumenty firmowe są bezpieczne?', 'Are my company documents safe?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Architektura local-first oznacza, że Twoje dokumenty przetwarzane są lokalnie i nie są przesyłane do zewnętrznych chmur. Wszystkie dane są szyfrowane (AES-256 at rest, TLS 1.3 in transit) i przechowywane wyłącznie w infrastrukturze EU (RODO). Możesz usunąć wszystkie swoje dane w każdej chwili.',
                    'Our local-first architecture means your documents are processed locally and not sent to external clouds. All data is encrypted (AES-256 at rest, TLS 1.3 in transit) and stored exclusively in EU infrastructure (GDPR). You can delete all your data at any time.'
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 4 ? 'open' : ''} onClick={() => toggleFaq(4)}>
              <FaqQuestion>
                <span>{txt('Dla kogo przeznaczony jest ten produkt?', 'Who is this product designed for?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Dla niezależnych doradców ESG, butików konsultingowych, biur rachunkowych oraz wewnętrznych dyrektorów i menedżerów ds. zrównoważonego rozwoju (Sustainability Managers) w średnich i dużych firmach, którzy chcą zredukować czas poświęcany na mechaniczną pracę z danymi i skupić się na decyzjach zarządczych i strategicznym doradztwie.',
                    'It is designed for independent ESG consultants, advisory boutiques, corporate Sustainability Directors, and internal ESG managers who want to automate tedious data analysis, gap mapping, and report generation so they can focus on high-value client advisory and business strategy.'
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>
          </FaqList>
        </Container>
      </FaqSection>

      {/* FINAL CTA SECTION */}
      <FinalCtaSection>
        <Container>
          <h2>
            {txt('Nie czekaj na audyt.', "Don't wait for the audit.")}
            <br />
            <GradientText>{txt('Bądź gotowy już dziś.', 'Be ready today.')}</GradientText>
          </h2>
          <p>
            {txt(
              'Dołącz do liderów, którzy kształtują przyszłość doradztwa ESG z AI. Zostań Członkiem Założycielem — 100% za darmo, zero ryzyka, lata korzyści.',
              'Join the leaders shaping the future of AI-powered ESG consulting. Become a Founding Member — 100% free, zero risk, years of benefits.'
            )}
          </p>
          <ButtonPrimaryLink href="#join" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
            {txt('🌿 Zarejestruj się za darmo teraz →', '🌿 Register for free now →')}
          </ButtonPrimaryLink>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
            {txt(
              '* Pół roku (6 miesięcy) bezpłatnego dostępu dla Członków Założycielskich po oficjalnej premierze produktu, która zaplanowana jest na 1 października 2026 r. Warunki gwarantowane dla wszystkich uczestników Programu Przedpremierowego.',
              '* Half of the year (6 months) free access for Founding Members upon official product launch, which is planned for October 1st, 2026. Conditions guaranteed for all Pre-Launch Program participants.'
            )}
          </p>
        </Container>
      </FinalCtaSection>

      {/* FOOTER */}
      <Footer>
        <Container>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: '#22c55e' }}>🌿 ESG Compliance Agent</strong>
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <strong>QIRE LAB SPÓŁKA Z O.O.</strong> · KRS 0001197301 · NIP 5423505856 · REGON 542864985
            <br />
            ul. Hetmańska 25, 15-727 Białystok, Polska · Email:{' '}
            <a href="mailto:INFO@F-SUITE.COM">INFO@F-SUITE.COM</a> · Tel: +48 731 270 861
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <Link href="/privacy">{txt('Polityka prywatności', 'Privacy policy')}</Link>
            <Link href="/terms">{txt('Regulamin', 'Terms of service')}</Link>
          </p>
          <p>
            {txt(
              '© 2026 F-Suite. Wszelkie prawa zastrzeżone. Produkt w fazie pilotażowej.',
              '© 2026 F-Suite. All rights reserved. Product in pilot phase.'
            )}
          </p>
        </Container>
      </Footer>

      {/* REGISTRATION SUCCESS MODAL */}
      <ModalOverlay className={isModalOpen ? 'active' : ''}>
        <ModalCard>
          <ModalClose onClick={() => setIsModalOpen(false)}>×</ModalClose>
          <ModalHeader>
            <ModalIcon style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)' }}>🎉</ModalIcon>
            <div>
              <h3>{txt('Gratulacje! Twoje miejsce jest bezpieczne', 'Congratulations! Your spot is secured')}</h3>
              <p>
                {txt(
                  'Pomyślnie zarejestrowaliśmy Twoje zgłoszenie. Twój przedpremierowy pakiet korzyści został zablokowany!',
                  'We have successfully registered your application. Your pre-launch benefit package is officially locked in!'
                )}
              </p>
            </div>
          </ModalHeader>

          <ModalTrustBanner>
            🛡️{' '}
            <span>
              {txt(
                'Status Członka Założyciela zarezerwowany dla firmy: ',
                'Founding Member status reserved for: '
              )}
              <strong>{formData.company || '-'}</strong>
            </span>
          </ModalTrustBanner>

          <ModalFields>
            <ModalFieldRow>
              <div className="field-label">{txt('Twój kod rejestracji (Pre-Launch Code)', 'Your Registration Code')}</div>
              <FieldValueWrap>
                <FieldValue className="highlight-value" id="modal-reference" style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.25rem' }}>
                  {modalDetails.reference}
                </FieldValue>
                <CopyBtn
                  className={copiedId === 'reference' ? 'copied' : ''}
                  onClick={() => copyToClipboard('reference', modalDetails.reference)}
                >
                  {copiedId === 'reference' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Zabezpieczone korzyści', 'Secured Benefits')}</div>
              <div style={{ padding: '0.5rem 0', fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>🌿</span>
                  <span><strong>{txt('6 miesięcy bezpłatnego dostępu', '6 months of free access')}</strong> {txt('po premierze (od 1 października 2026 r.)', 'upon official launch (October 1, 2026)')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>🏷️</span>
                  <span><strong>{txt('40% dożywotnego rabatu', '40% lifetime discount')}</strong> {txt('na dowolny abonament', 'on any subscription plan')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e' }}>💬</span>
                  <span><strong>{txt('Priorytetowy feedback', 'Priority product feedback')}</strong> {txt('i wpływ na kierunek rozwoju AI', 'and direct influence on AI features')}</span>
                </div>
              </div>
            </ModalFieldRow>
          </ModalFields>

          <ModalFooter>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {txt(
                'Możesz już teraz bezpłatnie przetestować asystenta AI w wersji pilotażowej. Przesyłaj dokumenty, zadawaj pytania i generuj darmowe raporty zgodności.',
                'You can instantly test the AI assistant in the pilot version for free. Upload source documents, ask questions, and draft compliance reports.'
              )}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <ButtonSecondary onClick={() => setIsModalOpen(false)}>
                {txt('Zamknij', 'Close')}
              </ButtonSecondary>
              <ButtonPrimaryLink href="https://app.esgsyncpro.qirelab.com" target="_blank" style={{ boxShadow: 'none' }}>
                {txt('🚀 Uruchom Wersję Testową (Pilot) ↗', '🚀 Launch Pilot App (Live) ↗')}
              </ButtonPrimaryLink>
            </div>
          </ModalFooter>
        </ModalCard>
      </ModalOverlay>
    </>
  );
}
