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
  LegalContainer,
  LegalHeader,
  LegalCard,
  Tag,
  GradientText,
  Footer
} from '../styles';

export default function TermsOfService() {
  const [lang, setLang] = useState('pl');

  const txt = (pl, en) => (lang === 'pl' ? pl : en);

  // Sync language class to body for styled components support
  useEffect(() => {
    if (lang === 'en') {
      document.body.classList.add('en');
    } else {
      document.body.classList.remove('en');
    }
  }, [lang]);

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
          <NavCta href="/#join">
            {txt('Dołącz do pilotażu →', 'Join pilot →')}
          </NavCta>
        </div>
      </Nav>

      {/* CONTENT */}
      <LegalContainer>
        <LegalHeader>
          <Tag style={{ marginBottom: '1rem' }}>
            {txt('Zasady i warunki', 'Rules & Conditions')}
          </Tag>
          <h1>
            <GradientText>{txt('Regulamin', 'Terms of Service')}</GradientText>
          </h1>
          <p>
            {txt('Ostatnia aktualizacja: 24 maja 2026 r.', 'Last updated: May 24, 2026')}
          </p>
        </LegalHeader>

        <LegalCard>
          {lang === 'pl' ? (
            <div>
              <h2>1. Postanowienia ogólne</h2>
              <p>
                Niniejszy regulamin określa zasady i warunki uczestnictwa w bezpłatnym <strong>Programie Założycielskim (Pre-Launch)</strong> platformy <strong>ESG Compliance Agent</strong> oraz zasady rezerwacji przedpremierowego pakietu korzyści.
              </p>
              <p>
                Operatorem platformy oraz organizatorem Programu Założycielskiego jest:
              </p>
              <p style={{ paddingLeft: '1rem', borderLeft: '3px solid #22c55e', color: '#ffffff', fontWeight: 500 }}>
                QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ<br/>
                ul. Hetmańska 25, 15-727 Białystok, Polska<br/>
                KRS: 0001197301 · NIP: 5423505856 · REGON: 542864985
              </p>

              <h2>2. Definicje</h2>
              <ul>
                <li><strong>Użytkownik / Aplikant:</strong> podmiot prowadzący działalność gospodarczą, który dokonał zgłoszenia w Programie Założycielskim za pośrednictwem formularza.</li>
                <li><strong>Operator:</strong> spółka QIRE LAB SP. Z O.O., właściciel autorskich praw majątkowych do oprogramowania.</li>
                <li><strong>Program Założycielski (Pre-Launch):</strong> bezpłatna oferta pilotażowa i program rezerwacji przedpremierowych korzyści przed oficjalnym wydaniem komercyjnym.</li>
                <li><strong>Kod Rejestracji:</strong> unikalny kod referencyjny wygenerowany automatycznie przez system po rejestracji, potwierdzający zablokowanie korzyści przedpremierowych.</li>
                <li><strong>Pilotaż:</strong> okres przedpremierowego użytkowania platformy w celu testowania i gromadzenia feedbacku.</li>
              </ul>

              <h2>3. Warunki Programu Założycielskiego</h2>
              <p>Członkowie Założyciele, którzy dokonają bezpłatnej rejestracji, otrzymują następujące, gwarantowane uprawnienia:</p>
              <ol>
                <li><strong>Darmowy dostęp:</strong> Pełny, bezpłatny dostęp do komercyjnej wersji platformy przez pierwsze 6 miesięcy (pół roku) od dnia jej oficjalnej premiery rynkowej, która zaplanowana jest na 1 października 2026 r.</li>
                <li><strong>Zamrożona cena:</strong> Stała zniżka o wartości 40% na wybrane plany abonamentowe po zakończeniu okresu darmowego — gwarantowana dożywotnio.</li>
                <li><strong>Dedykowany Onboarding:</strong> Prywatna sesja wdrożeniowa online, podczas której zaprezentujemy działanie asystenta w oparciu o wybrane regulacje i specyfikę firmy.</li>
                <li><strong>Priorytet Rozwoju:</strong> Bezpośredni wpływ na kierunek rozwoju AI i pierwszeństwo we wdrażaniu sugerowanych modułów regulacyjnych.</li>
              </ol>

              <h2>4. Opłaty i Brak Zobowiązań</h2>
              <p>
                Rejestracja przedpremierowa oraz udział w Programie Założycielskim i pilotażu są <strong>w 100% bezpłatne</strong>. Operator nie pobiera żadnych opłat, kaucji ani depozytów. W celu rejestracji i zablokowania benefitów nie jest wymagane podpinanie kart płatniczych ani dokonywanie jakichkolwiek płatności.
              </p>

              <h2>5. Rezygnacja i Usunięcie Danych (Opt-out)</h2>
              <p>
                Udział w programie jest w pełni dobrowolny i nie nakłada na Użytkownika żadnego zobowiązania do zakupu płatnej subskrypcji w przyszłości.
              </p>
              <p>Użytkownik może w każdej chwili zrezygnować z udziału w programie i zażądać usunięcia swoich danych oraz kodu rejestracyjnego:</p>
              <ol>
                <li>Wysyłając wiadomość e-mail o rezygnacji na adres: <strong>INFO@F-SUITE.COM</strong>.</li>
                <li>W treści wiadomości podając nazwę firmy oraz wygenerowany kod rejestracji.</li>
              </ol>
              <p>
                Operator zobowiązuje się do usunięcia danych i potwierdzenia rezygnacji w ciągu <strong>2 dni roboczych</strong> od otrzymania zgłoszenia. Rezygnacja oznacza anulowanie przyznanych przywilejów Członka Założyciela.
              </p>

              <h2>6. Prawa i obowiązki stron</h2>
              <ul>
                <li>Operator zobowiązuje się do utrzymania najwyższych standardów bezpieczeństwa serwisu oraz ochrony danych rejestracyjnych Użytkowników.</li>
                <li>Użytkownik zobowiązuje się do korzystania z platformy w sposób zgodny z prawem oraz dobrymi obyczajami, a także do zachowania poufności swoich danych uwierzytelniających.</li>
                <li>Z uwagi na pilotażowy charakter oprogramowania, Operator zastrzega, że niektóre funkcje mogą być aktualizowane w trybie ciągłym.</li>
              </ul>

              <h2>7. Reklamacje i kontakt</h2>
              <p>
                Wszelkie reklamacje, zapytania techniczne, prośby o wsparcie oraz wnioski o rezygnację mogą być zgłaszane bezpośrednio na adres mailowy: <strong>INFO@F-SUITE.COM</strong> lub drogą telefoniczną pod numerem: <strong>+48 731 270 861</strong>. Operator rozpatruje zgłoszenia reklamacyjne w terminie do 14 dni, przy czym zgłoszenia dotyczące rezygnacji z programu realizowane są priorytetowo (do 2 dni roboczych).
              </p>
            </div>
          ) : (
            <div>
              <h2>1. General Provisions</h2>
              <p>
                These Terms of Service outline the rules and conditions for participating in the free <strong>Pre-Launch Founding Member Program</strong> of the <strong>ESG Compliance Agent</strong> platform and securing your pre-launch benefit package.
              </p>
              <p>
                The operator of the platform and organizer of the Founding Program is:
              </p>
              <p style={{ paddingLeft: '1rem', borderLeft: '3px solid #22c55e', color: '#ffffff', fontWeight: 500 }}>
                QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ<br/>
                ul. Hetmańska 25, 15-727 Białystok, Poland<br/>
                KRS: 0001197301 · NIP: 5423505856 · REGON: 542864985
              </p>

              <h2>2. Definitions</h2>
              <ul>
                <li><strong>User / Applicant:</strong> Any business entity registering for the Founding Program using the website application form.</li>
                <li><strong>Operator:</strong> QIRE LAB SP. Z O.O., owner of all intellectual property rights to the platform.</li>
                <li><strong>Founding Program (Pre-Launch):</strong> A free, time-limited early-adopter pilot and benefit reservation promotion.</li>
                <li><strong>Registration Code:</strong> A unique reference code generated automatically upon registration, confirming the reservation of founding benefits.</li>
                <li><strong>Pilot:</strong> A pre-launch phase of the application designed for system testing and gathering feedback.</li>
              </ul>

              <h2>3. Founding Member Benefits</h2>
              <p>Founding Members who submit their free registration receive the following guaranteed benefits:</p>
              <ol>
                <li><strong>Free Access:</strong> Full, unrestricted access to the software for 6 months (half of the year) starting from the official commercial launch date, which is planned for October 1, 2026.</li>
                <li><strong>Locked Pricing:</strong> A permanent 40% discount on subscription plans after the free trial ends — guaranteed for the lifetime of use.</li>
                <li><strong>Priority Onboarding:</strong> A personal online setup and walkthrough session to demonstrate the AI assistant's capabilities tailored to your requirements.</li>
                <li><strong>Product Influence:</strong> Direct feedback pipeline to product engineers and top priority for custom regulatory feature requests.</li>
              </ol>

              <h2>4. Fees & Zero Commitment</h2>
              <p>
                Pre-registration, participation in the Founding Program, and pilot testing are <strong>100% free</strong>. The Operator does not collect any fees, deposits, or credit card details. No payment or bank transfer of any kind is required to secure your benefits.
              </p>

              <h2>5. Cancellation & Opt-out</h2>
              <p>
                Participation is fully voluntary and carries zero obligation to purchase a paid subscription in the future.
              </p>
              <p>The User can opt out and request the deletion of their registration details and code at any time:</p>
              <ol>
                <li>By sending an email expressing your intent to: <strong>INFO@F-SUITE.COM</strong>.</li>
                <li>Providing your company name and the unique registration code in the email body.</li>
              </ol>
              <p>
                The Operator guarantees the deletion of data and processing of opt-out requests within <strong>2 business days</strong> of receipt. Opting out terminates active Founding Member status and its corresponding benefits.
              </p>

              <h2>6. Rights and Obligations</h2>
              <ul>
                <li>The Operator agrees to maintain maximum security standards on the platform and absolute protection of registration data.</li>
                <li>The User agrees to use the software in a lawful manner, respecting copyright and intellectual property policies.</li>
                <li>Due to the pilot nature of the launch, the Operator reserves the right to make continuous software and feature updates.</li>
              </ul>

              <h2>7. Complaints & Contact</h2>
              <p>
                Any complaints, technical inquiries, support requests, or opt-out notifications should be submitted directly via email to: <strong>INFO@F-SUITE.COM</strong> or by phone at: <strong>+48 731 270 861</strong>. The Operator reviews standard complaints within 14 days, while opt-out and data deletion requests are expedited and handled within 2 business days.
              </p>
            </div>
          )}
        </LegalCard>
      </LegalContainer>

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
    </>
  );
}
