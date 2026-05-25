'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Nav,
  NavLogo,
  LangToggle,
  LangBtn,
  NavCta,
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
  ModalFooter
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
        body: JSON.stringify({
          ...formData,
          currency: currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      // Populate modal details from API response
      setModalDetails({
        reference: data.deposit.reference,
        amount: data.bankInfo.amount,
        currencyCode: data.bankInfo.currencyCode,
        currencySymbol: data.bankInfo.currencySymbol,
        accountNumber: data.bankInfo.accountNumber,
        swiftBic: data.bankInfo.swiftBic,
        bankName: data.bankInfo.bankName,
        bankAddress: data.bankInfo.bankAddress,
        companyName: data.bankInfo.companyName,
        companyAddress: data.bankInfo.companyAddress
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LangToggle>
            <LangBtn className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</LangBtn>
            <LangBtn className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</LangBtn>
          </LangToggle>
          <NavCta href="#join">
            {txt('Dołącz do pilotażu →', 'Join pilot →')}
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
              {txt('Pilotaż dostępny tylko przez 30 dni', 'Pilot available for 30 days only')}
            </HeroEyebrow>
            <HeroTitle>
              {txt('ESG bez konsultanta.', 'ESG without a consultant.')}
              <br />
              <GradientText>{txt('Z AI. W godzinę.', 'With AI. In an hour.')}</GradientText>
            </HeroTitle>
            <HeroSub>
              {txt(
                'Wgraj dokumenty swojej firmy. Wybierz regulację. Otrzymaj kompletny raport ESG gotowy na audyt — bez prawnika, bez agencji, bez miesięcy pracy.',
                'Upload your company documents. Select a regulation. Get a complete, audit-ready ESG report — no lawyers, no agencies, no months of work.'
              )}
            </HeroSub>
            <HeroCtaGroup>
              <ButtonPrimaryLink href="#join">
                {txt('🚀 Zarezerwuj miejsce w pilotażu', '🚀 Reserve your pilot spot')}
              </ButtonPrimaryLink>
              <ButtonSecondaryLink href="https://app.esgsyncpro.qirelab.com" target="_blank">
                {txt('Urunom aplikację ↗', 'Launch Application ↗')}
              </ButtonSecondaryLink>
            </HeroCtaGroup>
            <HeroStats>
              <HeroStat>
                <div className="num">9+</div>
                <div className="label">{txt('regulacji ESG', 'ESG frameworks')}</div>
              </HeroStat>
              <HeroStat>
                <div className="num">&lt;1h</div>
                <div className="label">{txt('do pierwszego raportu', 'to your first report')}</div>
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
              <TrustBadge>{txt('Licencjonowany Operator ESG', 'Licensed ESG Operator')}</TrustBadge>
              <h3>{txt('Bezpieczeństwo i legalność gwarantowane', 'Security & compliance guaranteed')}</h3>
              <p>
                {txt(
                  'Produkt jest tworzony i obsługiwany przez polską spółkę kapitałową, podlegającą pełnemu nadzorowi prawnemu w Unii Europejskiej. Twoje dane i depozyty są bezpieczne.',
                  'The product is developed and operated by a Polish joint-stock company, subject to full legal oversight in the European Union. Your data and deposits are safe.'
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

      {/* PROBLEM SECTION */}
      <ProblemSection id="problem">
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Problem', 'The Problem')}</Tag>
            <SectionTitle>
              {txt('Raportowanie ESG to ', 'ESG reporting is a ')}
              <GradientText>{txt('koszmar', 'nightmare')}</GradientText>
              {txt(' dla MŚP', ' for SMEs')}
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto 3rem auto', textAlign: 'center' }}>
              {txt(
                'Regulacje brzmią jak inny język. Konsultanci kosztują fortunę. A inspekcja może przyjść w każdej chwili.',
                'Regulations sound like another language. Consultants cost a fortune. And an audit can show up any time.'
              )}
            </SectionSub>
          </div>
          <ProblemGrid>
            <ProblemCard>
              <div className="problem-icon">😵</div>
              <h3>{txt('Żargon niemożliwy do opanowania', 'Impenetrable jargon')}</h3>
              <p>
                {txt(
                  'CSRD, ESRS E1-6, EUDR, ISO 14067 — każda regulacja to setki stron wymagań, które trzeba przełożyć na dane operacyjne firmy.',
                  'CSRD, ESRS E1-6, EUDR, ISO 14067 — each framework is hundreds of pages of requirements to map to your actual operations.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">💸</div>
              <h3>{txt('Konsultanci: 20 000–80 000 PLN za raport', 'Consultants: €5k–€20k per report')}</h3>
              <p>
                {txt(
                  'Zewnętrzni doradcy ESG są poza zasięgiem małych firm. A kolejna regulacja oznacza kolejną fakturę.',
                  'External ESG advisors are out of reach for small businesses. And every new regulation means a new invoice.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">⏳</div>
              <h3>{txt('Miesiące pracy, by osiągnąć zgodność', 'Months of work to achieve compliance')}</h3>
              <p>
                {txt(
                  'Zbieranie danych, wypełnianie szablonów, weryfikacja przez dział prawny — zanim firma ukończy jeden raport, regulacje już się zmieniają.',
                  'Gathering data, filling templates, legal review — before you finish one report, regulations have already changed.'
                )}
              </p>
            </ProblemCard>
            <ProblemCard>
              <div className="problem-icon">🚨</div>
              <h3>{txt('Brak zgodności = ryzyko kar i utraty kontraktów', 'Non-compliance = fines and lost contracts')}</h3>
              <p>
                {txt(
                  'Duże firmy wymagają raportów ESG od swoich dostawców. Brak dokumentacji to brak kontraktu — albo kara.',
                  'Large corporations demand ESG reports from their suppliers. No documentation means no contract — or a penalty.'
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
                'Żadnego kodowania. Żadnych szkoleń. Wystarczy wgrać dokumenty i porozmawiać z agentem.',
                'No coding. No training. Just upload your documents and talk to the agent.'
              )}
            </SectionSub>
          </div>
          <StepsGrid>
            <StepCard>
              <div className="step-num">01</div>
              <h3>{txt('Wgraj dokumenty firmy', 'Upload company documents')}</h3>
              <p>
                {txt(
                  'Excel, PDF, Word, skany, linki do stron — agent odczytuje wszystko automatycznie, również skany przez OCR. Działa lokalnie — Twoje dane nie opuszczają Twojej infrastruktury.',
                  'Excel, PDF, Word, scans, links — the agent reads everything automatically, including scans via OCR. Runs locally — your data never leaves your infrastructure.'
                )}
              </p>
            </StepCard>
            <StepCard>
              <div className="step-num">02</div>
              <h3>{txt('Wybierz regulację i zadaj pytania', 'Select a regulation and ask questions')}</h3>
              <p>
                {txt(
                  'Wybierz CSRD VSME, ISO 14067, GRI lub inny standard. Agent analizuje luki, wskazuje brakujące dane i odpowiada na pytania w Twoim języku — jak ekspert, który siedzi obok.',
                  'Pick CSRD VSME, ISO 14067, GRI or any other standard. The agent analyses gaps, highlights missing data, and answers questions in your language — like an expert sitting next to you.'
                )}
              </p>
            </StepCard>
            <StepCard>
              <div className="step-num">03</div>
              <h3>{txt('Pobierz raport gotowy na audyt', 'Download an audit-ready report')}</h3>
              <p>
                {txt(
                  'Jeden klik generuje kompletny raport ESG w DOCX i PDF, zgodny ze strukturą wybranej regulacji. Z cytatami źródeł, listą luk i rekomendacjami.',
                  'One click generates a complete ESG report in DOCX and PDF, structured to the selected regulation. With source citations, gap list, and recommendations.'
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
              <h3>{txt('Projekty dla kilku spółek / lat', 'Projects for multiple companies / years')}</h3>
              <p>
                {txt(
                  'Zarządzaj kilkoma firmami lub cyklami raportowania naraz. Współdziel projekty z zespołem: księgowym, specjalistą ESG, zarządem — każdy z właściwymi uprawnieniami.',
                  'Manage multiple companies or reporting cycles at once. Share projects with your team: accountant, ESG officer, management — each with the right access level.'
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
              {txt('Przetestuj produkt teraz.', 'Try the product now.')}
              <br />
              {txt('Zostań ', 'Become a ')}
              <GradientText>{txt('Członkiem Założycielem', 'Founding Member')}</GradientText>
              .
            </h2>
            <p>
              {txt(
                'Przez 30 dni udostępniamy pilotażową wersję ESG Compliance Agent wybranej grupie firm. Tylko uczestnicy pilotażu mogą zostać Członkami Założycielami — z dostępem do ekskluzywnych korzyści niedostępnych dla późniejszych użytkowników.',
                "For 30 days we're opening the pilot version of ESG Compliance Agent to a select group of companies. Only pilot participants can become Founding Members — with access to exclusive benefits unavailable to later users."
              )}
            </p>
            <ButtonPrimaryLink href="#join">
              {txt('Sprawdź warunki Programu Założycielskiego →', 'See the Founding Member program →')}
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
              {txt('Korzyści, które ', 'Benefits worth ')}
              <GradientText>{txt('warte są wielokrotność', 'many times')}</GradientText>
              {txt(' depozytu', ' the deposit')}
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
                      'Gdy produkt zostanie oficjalnie wydany (premiera planowana jest na 24 czerwca), Członkowie Założyciele otrzymają pół roku (6 miesięcy) bezpłatnego użytkowania bez żadnych zobowiązań. Zacznij korzystać od pierwszego dnia premiery.',
                      'When the product officially launches (release is planned for June 24th), Founding Members get free access for half of the year (6 months) with no strings attached. Start using it from day one of the release.'
                    )}
                  </p>
                  <BenefitValueBadge>{txt('Wartość: ~1 800–3 600 PLN', 'Value: ~€450–900')}</BenefitValueBadge>
                </BenefitText>
              </BenefitItem>
              <BenefitItem>
                <BenefitIconWrap>🔐</BenefitIconWrap>
                <BenefitText>
                  <h4>{txt('Cena założycielska — zamrożona na zawsze', 'Founder pricing — locked forever')}</h4>
                  <p>
                    {txt(
                      'Po zakończeniu okresu darmowego, płacisz 50% regularnej ceny przez cały okres użytkowania. Nawet gdy ceny wzrosną dla nowych klientów.',
                      'After your free period ends, you pay 50% of the regular price for as long as you use the product. Even as prices rise for new customers.'
                    )}
                  </p>
                  <BenefitValueBadge>{txt('Oszczędność: 50% na zawsze', 'Saving: 50% forever')}</BenefitValueBadge>
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
                {txt('🔑 Depozyt założycielski', '🔑 Founding deposit')}
              </div>
              <DepositPrice>
                <DepositAmount>
                  {currency === 'PLN' ? '399' : '99'}
                </DepositAmount>
                <DepositCurrency>{currency === 'PLN' ? 'PLN' : currency}</DepositCurrency>
              </DepositPrice>
              <DepositLabel>
                {txt('jednorazowy depozyt · w pełni zwrotny w każdej chwili', 'one-time deposit · fully refundable at any time')}
              </DepositLabel>
              <DepositFeatures>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Dostęp do 30-dniowego pilotażu od razu po potwierdzeniu', 'Immediate access to the 30-day pilot on confirmation')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Pół roku (6 miesięcy) bezpłatnego dostępu po premierze (od 24 czerwca)', 'Half of the year (6 months) free access after release (from June 24th)')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Cena założycielska 50% przez cały czas korzystania', 'Founder price 50% off for lifetime')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Osobista sesja wdrożeniowa (prezentacja systemu)', 'Personal setup session (system walkthrough)')}</span>
                </li>
                <li>
                  <span className="check">✓</span>
                  <span>{txt('Depozyt zalicza się na poczet subskrypcji lub jest zwracany', 'Deposit credited to subscription or fully refunded')}</span>
                </li>
              </DepositFeatures>
              <DepositRefundBanner>
                🛡️&nbsp;
                <span>
                  <strong>{txt('Zero ryzyka.', 'Zero risk.')}</strong>
                  {txt(
                    ' Depozyt jest zamrożony — nie zostanie pobrany od razu. Możesz go odzyskać w dowolnym momencie w ciągu 30 dni pilotażu. Bez pytań, bez formalności.',
                    ' The deposit is held — not charged upfront. You can reclaim it at any time within the 30-day pilot. No questions asked, no paperwork.'
                  )}
                </span>
              </DepositRefundBanner>
              <ButtonPrimaryLink href="#join" style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}>
                {currency === 'PLN' 
                  ? txt('Zarezerwuj miejsce — 399 PLN →', 'Reserve your spot — 399 PLN →')
                  : txt(`Zarezerwuj miejsce — ${currency === 'EUR' ? '99 €' : '$99'} →`, `Reserve your spot — ${currency === 'EUR' ? '€99' : '$99'} →`)}
              </ButtonPrimaryLink>
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
                {txt('Zabezpiecz swoje korzyści jako Członek Założyciel.', 'Secure your benefits as a Founding Member.')}
              </p>
            </DepositCard>
          </FoundingLayout>
        </Container>
      </FoundingSection>

      {/* HOW DEPOSIT WORKS SECTION */}
      <DepositFlowSection>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <Tag>{txt('Jak działa depozyt', 'How the deposit works')}</Tag>
            <SectionTitle style={{ marginBottom: '2.5rem' }}>
              {txt('Przejrzyste zasady. ', 'Transparent rules. ')}
              <GradientText>{txt('Żadnych pułapek.', 'No tricks.')}</GradientText>
            </SectionTitle>
          </div>
          <FlowStepsGrid>
            <FlowStepCard>
              <div className="flow-num">1</div>
              <h4>{txt('Wypełnij formularz i wybierz walutę', 'Fill the form and choose currency')}</h4>
              <p>{txt('Podaj dane kontaktowe i zaznacz, że chcesz zostać Członkiem Założycielem. Wybierz region depozytu.', 'Enter your contact details and select Founding Member status. Choose your deposit region.')}</p>
              <p className="flow-note">{txt('→ Działa jak kaucja, nie abonament', '→ Security deposit, not subscription')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num">2</div>
              <h4>{txt('Otrzymaj natychmiastowe instrukcje przelewu', 'Get instant bank transfer details')}</h4>
              <p>{txt('Po wysłaniu system automatycznie wygeneruje unikalny kod referencyjny i pokaże dedykowane konto bankowe.', 'Upon submission, the system generates a unique reference title and shows the exact bank details.')}</p>
              <p className="flow-note">{txt('→ Dedykowane konta PLN / EUR / USD', '→ Specific PLN / EUR / USD accounts')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num">3</div>
              <h4>{txt('Depozyt podlega zwrotowi', 'Full refund protection')}</h4>
              <p>{txt('Środki są zablokowane na Twoim koncie — możesz żądać zwrotu w każdej chwili podczas pilotażu, bez pytań i bez biurokracji.', 'Funds are protected — request a full refund at any point of the pilot phase, no questions asked.')}</p>
              <p className="flow-note">{txt('→ 100% zwrotu w 2 dni robocze', '→ 100% refunded in 2 business days')}</p>
            </FlowStepCard>
            <FlowStepCard>
              <div className="flow-num flow-num-check">✓</div>
              <h4>{txt('Korzyści z pełni korzyści Założyciela', 'Enjoy full Founding Member benefits')}</h4>
              <p>{txt('Pół roku bezpłatnie (od premiery 24 czerwca), cena 50% na zawsze, priorytetowy support i wpływ na kierunek produktu. Warunki gwarantowane.', 'Half of the year free (from release on June 24th), 50% price forever, priority support and direct product influence. Guaranteed in writing.')}</p>
              <p className="flow-note">{txt('→ Certyfikat statusu Założyciela', '→ Founding Member certificate')}</p>
            </FlowStepCard>
          </FlowStepsGrid>
        </Container>
      </DepositFlowSection>

      {/* SIGN-UP FORM SECTION */}
      <FormSection id="join">
        <Container>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Tag>{txt('Dołącz do pilotażu', 'Join the pilot')}</Tag>
            <SectionTitle>
              {txt('Zarezerwuj swoje miejsce', 'Reserve your spot')}
              <br />
              <GradientText>{txt('wśród Członków Założycielskich', 'among Founding Members')}</GradientText>
            </SectionTitle>
            <SectionSub style={{ margin: '0 auto', textAlign: 'center' }}>
              {txt(
                'Pilotaż trwa 30 dni. Wypełnij formularz poniżej, aby natychmiast zapisać dane i wygenerować dane do depozytu bankowego.',
                'Pilot runs 30 days. Fill the form below to register your details and instantly generate bank deposit details.'
              )}
            </SectionSub>
          </div>
          <FormWrap>
            <h3>{txt('Formularz zgłoszeniowy', 'Application form')}</h3>
            <p className="form-sub">
              {txt(
                'Zarezerwuj warunki założycielskie w kilka sekund. Dane zostaną zapisane w bezpiecznej bazie.',
                'Secure your founder pricing in seconds. Details saved in a secured database.'
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
                  <label>{txt('Numer telefonu (komórkowy) *', 'Phone number *')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="+48 731 270 861"
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
                  <label>{txt('Opcja depozytu & Waluta *', 'Deposit region & Currency *')}</label>
                  <select
                    required
                    value={currency}
                    onChange={(e) => {
                      handleInputChange(e, 'currency');
                      handleCurrencyChange(e.target.value);
                    }}
                  >
                    <option value="PLN">{txt('Polska (PLN) — 399 zł', 'Poland (PLN) — 399 PLN')}</option>
                    <option value="EUR">{txt('Kraje strefy Euro (EUR) — 99 €', 'Eurozone Countries (EUR) — €99')}</option>
                    <option value="USD">{txt('Inne kraje / USD — 99 $', 'International / USD — $99')}</option>
                  </select>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <label>{txt('Który standard ESG jest dla Ciebie najważniejszy?', 'Which ESG standard matters most to you?')}</label>
                <select
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
              <FormCheck>
                <input type="checkbox" required />
                <span>
                  {txt(
                    'Chcę zostać ',
                    'I want to become a '
                  )}
                  <strong>{txt('Członkiem Założycielem', 'Founding Member')}</strong>
                  {txt(
                    ' i rozumiem, że po przesłaniu zgłoszenia wygenerowane zostaną dane do wpłaty w pełni zwrotnego depozytu w celu aktywacji statusu.*',
                    ' and understand that upon submission, bank details will be generated to pay a fully refundable deposit to activate my status.*'
                  )}
                </span>
              </FormCheck>
              <FormCheck>
                <input type="checkbox" required />
                <span>
                  {txt(
                    'Wyrażam zgodę na przetwarzanie moich danych w celu rezerwacji depozytu zgodnie z ',
                    'I consent to the processing of my data for the purpose of deposit reservation in line with the '
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
                  : txt('🚀 Zarejestruj depozyt i pobierz dane przelewu', '🚀 Register deposit & get bank transfer details')}
              </ButtonPrimary>
            </form>
            <FormNote>
              {txt(
                'Twoje dane są u nas bezpieczne. Rejestracja jest całkowicie bezpłatna i nie zobowiązuje do natychmiastowej zapłaty, ale gwarantuje utrzymanie warunków założycielskich w bazie.',
                'Your data is safe with us. Registration is free and does not commit you to immediate payment, but guarantees your founding benefits are secured in our system.'
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
                    'Tak — mamy działający produkt MVP z pełną funkcjonalnością: wgrywaniem dokumentów, agentem AI, trackerem zgodności i generowaniem raportów. Pilotaż to 30-dniowy okres testowania z prawdziwymi użytkownikami przed oficjalną premierą komercyjną, która zaplanowana jest na 24 czerwca. Zbieramy feedback, aby produkt był doskonały w dniu premiery.',
                    "Yes — we have a fully working MVP: document upload, AI agent, compliance tracker, and report generation. The pilot is a 30-day testing period with real users before the official commercial release, which is planned for June 24th. We're collecting feedback to make the product perfect on launch day."
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 1 ? 'open' : ''} onClick={() => toggleFaq(1)}>
              <FaqQuestion>
                <span>{txt('Czy depozyt jest obowiązkowy?', 'Is the deposit mandatory?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Depozyt jest wymagany wyłącznie do aktywacji statusu Członka Założyciela i wszystkich związanych z nim korzyści (pół roku bezpłatnego dostępu po premierze od 24 czerwca, cena 50% na zawsze, etc.). Możesz też dołączyć do pilotażu bez depozytu — ale wtedy nie przysługują Ci korzyści założycielskie.',
                    "The deposit is required only to activate Founding Member status and associated benefits (half of the year of free access after release on June 24th, 50% price forever, etc.). You can also join the pilot without a deposit — but you won't receive the founding benefits."
                  )}
                </p>
              </FaqAnswer>
            </FaqItem>

            <FaqItem className={openFaq === 2 ? 'open' : ''} onClick={() => toggleFaq(2)}>
              <FaqQuestion>
                <span>{txt('Co się stanie z depozytem, jeśli zdecyduję się nie korzystać z produktu?', 'What happens to the deposit if I decide not to use the product?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Zwrot 100% depozytu na Twoje konto — bez pytań, bez opłat, bez formalności. Możesz wnioskować o zwrot w dowolnym momencie w ciągu 30-dniowego pilotażu i przez 30 dni po jego zakończeniu.',
                    '100% deposit refund to your account — no questions, no fees, no paperwork. You can request a refund at any time during the 30-day pilot and for 30 days after it ends.'
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
                <span>{txt('Dla jakich firm jest ten produkt?', 'Which companies is this product for?')}</span>
                <FaqIcon className="faq-icon">+</FaqIcon>
              </FaqQuestion>
              <FaqAnswer className="faq-a">
                <p>
                  {txt(
                    'Przede wszystkim dla MŚP w Polsce i UE, które muszą lub chcą raportować ESG — m.in. dostawcy dużych korporacji, firmy ubiegające się o unijne fundusze, spółki przygotowujące się do obowiązkowego raportowania CSRD. Produkt jest idealny dla firm bez dedykowanego działu ESG.',
                    'Primarily SMEs in Poland and the EU that need or want ESG reporting — including suppliers to large corporations, companies applying for EU funds, companies preparing for mandatory CSRD reporting. The product is ideal for companies without a dedicated ESG team.'
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
              'Dołącz do firm, które kształtują przyszłość ESG dla MŚP. Zostań Członkiem Założycielem — 30 dni testu, zero ryzyka, lata korzyści.',
              'Join companies shaping the future of SME ESG compliance. Become a Founding Member — 30 days of testing, zero risk, years of benefits.'
            )}
          </p>
          <ButtonPrimaryLink href="#join" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
            {txt('🌿 Zarezerwuj swoje miejsce →', '🌿 Reserve your spot →')}
          </ButtonPrimaryLink>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#475569' }}>
            {txt(
              '* Pół roku (6 miesięcy) bezpłatnego dostępu dla Członków Założycielskich po oficjalnej premierze produktu, która zaplanowana jest na 24 czerwca. Warunki gwarantowane pisemnie dla wszystkich uczestników Programu Założycielskiego.',
              '* Half of the year (6 months) free access for Founding Members upon official product launch, which is planned for June 24th. Conditions guaranteed in writing for all Founding Member program participants.'
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

      {/* DEPOSIT INSTRUCTIONS MODAL */}
      <ModalOverlay className={isModalOpen ? 'active' : ''}>
        <ModalCard>
          <ModalClose onClick={() => setIsModalOpen(false)}>×</ModalClose>
          <ModalHeader>
            <ModalIcon>🏦</ModalIcon>
            <div>
              <h3>{txt('Instrukcja Depozytu Bankowego', 'Bank Transfer Instructions')}</h3>
              <p>
                {txt(
                  'Zgłoszenie pomyślnie zapisane w bazie! Dokonaj przelewu, aby zatwierdzić status.',
                  'Application saved! Complete your transfer to activate your founding status.'
                )}
              </p>
            </div>
          </ModalHeader>

          <ModalTrustBanner>
            🛡️{' '}
            <span>
              {txt(
                'Wpłacasz do zweryfikowanego podmiotu: ',
                'Paying a verified legal entity: '
              )}
              <strong>QIRE LAB SP. Z O.O.</strong> (KRS: 0001197301, NIP: 5423505856)
            </span>
          </ModalTrustBanner>

          <ModalFields>
            <ModalFieldRow>
              <div className="field-label">{txt('Odbiorca (Nazwa Spółki)', 'Beneficiary Name')}</div>
              <FieldValueWrap>
                <FieldValue id="modal-company-name">{modalDetails.companyName}</FieldValue>
                <CopyBtn
                  className={copiedId === 'company-name' ? 'copied' : ''}
                  onClick={() => copyToClipboard('company-name', modalDetails.companyName)}
                >
                  {copiedId === 'company-name' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Adres Odbiorcy', 'Beneficiary Address')}</div>
              <FieldValueWrap>
                <FieldValue id="modal-company-address">{modalDetails.companyAddress}</FieldValue>
                <CopyBtn
                  className={copiedId === 'company-address' ? 'copied' : ''}
                  onClick={() => copyToClipboard('company-address', modalDetails.companyAddress)}
                >
                  {copiedId === 'company-address' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Bank Odbiorcy', 'Receiving Bank')}</div>
              <FieldValueWrap>
                <FieldValue id="modal-bank-name">{modalDetails.bankName}</FieldValue>
                <CopyBtn
                  className={copiedId === 'bank-name' ? 'copied' : ''}
                  onClick={() => copyToClipboard('bank-name', modalDetails.bankName)}
                >
                  {copiedId === 'bank-name' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Adres Banku', 'Bank Address')}</div>
              <FieldValueWrap>
                <FieldValue id="modal-bank-address">{modalDetails.bankAddress}</FieldValue>
                <CopyBtn
                  className={copiedId === 'bank-address' ? 'copied' : ''}
                  onClick={() => copyToClipboard('bank-address', modalDetails.bankAddress)}
                >
                  {copiedId === 'bank-address' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Numer Konta (IBAN)', 'Account Number (IBAN)')}</div>
              <FieldValueWrap>
                <FieldValue className="highlight-value" id="modal-iban">{modalDetails.accountNumber}</FieldValue>
                <CopyBtn
                  className={copiedId === 'iban' ? 'copied' : ''}
                  onClick={() => copyToClipboard('iban', modalDetails.accountNumber)}
                >
                  {copiedId === 'iban' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">BIC / SWIFT</div>
              <FieldValueWrap>
                <FieldValue className="highlight-value" id="modal-swift">{modalDetails.swiftBic}</FieldValue>
                <CopyBtn
                  className={copiedId === 'swift' ? 'copied' : ''}
                  onClick={() => copyToClipboard('swift', modalDetails.swiftBic)}
                >
                  {copiedId === 'swift' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>

            <ModalFieldRow>
              <div className="field-label">{txt('Tytuł przelewu (Niezbędny do weryfikacji!)', 'Transfer Title / Reference (Required!)')}</div>
              <FieldValueWrap>
                <FieldValue className="highlight-value" id="modal-reference" style={{ color: '#fcd34d', fontWeight: 800 }}>
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
              <div className="field-label">{txt('Kwota do przelewu', 'Transfer Amount')}</div>
              <FieldValueWrap>
                <FieldValue className="highlight-value" id="modal-amount">
                  {modalDetails.amount} {modalDetails.currencySymbol === 'zł' ? 'PLN' : modalDetails.currencyCode}
                </FieldValue>
                <CopyBtn
                  className={copiedId === 'amount' ? 'copied' : ''}
                  onClick={() => copyToClipboard('amount', `${modalDetails.amount} ${modalDetails.currencySymbol === 'zł' ? 'PLN' : modalDetails.currencyCode}`)}
                >
                  {copiedId === 'amount' ? txt('Skopiowano!', 'Copied!') : txt('Kopiuj', 'Copy')}
                </CopyBtn>
              </FieldValueWrap>
            </ModalFieldRow>
          </ModalFields>

          <ModalFooter>
            <p>
              {txt(
                'Instrukcja przelewu została również wysłana na Twój adres e-mail. Po dokonaniu wpłaty możesz przejść do aplikacji.',
                'Transfer details were also sent to your email. Once the transfer is sent, you can access the application.'
              )}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <ButtonSecondary onClick={() => setIsModalOpen(false)}>
                {txt('Zamknij', 'Close')}
              </ButtonSecondary>
              <ButtonPrimaryLink href="https://app.esgsyncpro.qirelab.com" target="_blank" style={{ boxShadow: 'none' }}>
                {txt('Przejdź do Aplikacji ↗', 'Go to App ↗')}
              </ButtonPrimaryLink>
            </div>
          </ModalFooter>
        </ModalCard>
      </ModalOverlay>
    </>
  );
}
