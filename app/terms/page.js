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
                Niniejszy regulamin określa zasady i warunki uczestnictwa w <strong>Programie Założycielskim</strong> platformy <strong>ESG Compliance Agent</strong>, procedurę wnoszenia i zabezpieczania dobrowolnego <strong>Depozytu Założycielskiego</strong> oraz zasady wnioskowania o jego pełny zwrot.
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
                <li><strong>Użytkownik / Aplikant:</strong> podmiot prowadzący działalność gospodarczą, który zarejestrował się w Programie Założycielskim za pośrednictwem formularza.</li>
                <li><strong>Operator:</strong> spółka QIRE LAB SP. Z O.O., właściciel autorskich praw majątkowych do oprogramowania.</li>
                <li><strong>Program Założycielski:</strong> ekskluzywna oferta pilotażowa ograniczona czasowo (30 dni).</li>
                <li><strong>Depozyt Założycielski:</strong> dobrowolna, kaucja zwrotna wpłacana na rachunek Operatora w celu potwierdzenia intencji aktywacji statusu Członka Założyciela.</li>
                <li><strong>Pilotaż:</strong> 30-dniowy okres przedpremierowego użytkowania platformy w celu testowania i gromadzenia feedbacku.</li>
              </ul>

              <h2>3. Warunki Programu Założycielskiego</h2>
              <p>Członkowie Założyciele, którzy dokonają rejestracji i opłacą Depozyt Założycielski, otrzymują następujące, gwarantowane uprawnienia:</p>
              <ol>
                <li><strong>Darmowy dostęp:</strong> Pełny, bezpłatny dostęp do platformy przez pierwsze 6 miesięcy (pół roku) od dnia jej oficjalnej komercyjnej premiery rynkowej, która zaplanowana jest na 1 października 2026 r.</li>
                <li><strong>Zamrożona cena:</strong> Stała zniżka o wartości 50% na wybrane plany abonamentowe po zakończeniu okresu darmowego — gwarantowana dożywotnio.</li>
                <li><strong>Dedykowany Onboarding:</strong> Prywatne spotkanie wdrożeniowe, podczas którego pokażemy, jak korzystać z systemu w oparciu o wybrane regulacje i specyfikę firmy.</li>
                <li><strong>Priorytet Rozwoju:</strong> Bezpośredni kontakt z deweloperami i pierwszeństwo we wdrażaniu sugerowanych modułów regulacyjnych.</li>
              </ol>

              <h2>4. Kwoty i Realizacja Depozytu</h2>
              <p>Wysokość Depozytu Założycielskiego jest jednorazowa i zależy od wybranej przez Użytkownika strefy walutowej:</p>
              <ul>
                <li>Dla podmiotów z Polski (rachunek PLN): <strong>399 PLN</strong></li>
                <li>Dla podmiotów ze strefy Euro (rachunek EUR): <strong>99 EUR</strong></li>
                <li>Dla podmiotów międzynarodowych (rachunek USD): <strong>99 USD</strong></li>
              </ul>
              <p>
                Wpłata dokonywana jest przelewem tradycyjnym na unikalny rachunek bankowy wygenerowany automatycznie przez system po przesłaniu formularza zgłoszeniowego. W tytule przelewu należy bezwzględnie podać wygenerowany kod referencyjny (np. <em>ESG-QIRE-XXXXXX</em>).
              </p>

              <h2>5. Procedura Gwarantowanego Zwrotu (Refund Policy)</h2>
              <p style={{ color: '#fcd34d', fontWeight: 600 }}>
                Depozyt ma charakter kaucji i podlega pełnemu zwrotowi (100% wpłaconej kwoty) w dowolnym momencie, na pierwsze żądanie Użytkownika.
              </p>
              <p>W celu odzyskania depozytu należy:</p>
              <ol>
                <li>Wyrazić wolę zwrotu poprzez wysłanie wiadomości e-mail na adres: <strong>INFO@F-SUITE.COM</strong>.</li>
                <li>W treści wiadomości podać nazwę firmy, kod referencyjny rezerwacji oraz numer rachunku bankowego, na który mają zostać odesłane środki (dla ułatwienia powinien być to ten sam rachunek, z którego dokonano wpłaty).</li>
              </ol>
              <p>
                Operator gwarantuje realizację przelewu zwrotnego w ciągu <strong>2 dni roboczych</strong> od dnia otrzymania zgłoszenia. Zwrot dokonywany jest bez potrącania jakichkolwiek opłat manipulacyjnych, prowizji czy kar umownych. Wnioskowanie o zwrot depozytu oznacza rezygnację z przywilejów Członka Założyciela.
              </p>

              <h2>6. Prawa i obowiązki stron</h2>
              <ul>
                <li>Operator zobowiązuje się do utrzymania najwyższych standardów bezpieczeństwa serwisu oraz nienaruszalności zgromadzonych środków depozytowych.</li>
                <li>Użytkownik zobowiązuje się do korzystania z platformy w sposób zgodny z prawem oraz dobrymi obyczajami, a także do zachowania poufności swoich danych uwierzytelniających.</li>
                <li>Z uwagi na pilotażowy charakter oprogramowania, Operator zastrzega, że niektóre funkcje mogą być aktualizowane w trybie ciągłym.</li>
              </ul>

              <h2>7. Reklamacje i kontakt</h2>
              <p>
                Wszelkie reklamacje, zapytania techniczne, prośby o wsparcie oraz wnioski o zwrot środków mogą być zgłaszane bezpośrednio na adres mailowy: <strong>INFO@F-SUITE.COM</strong> lub drogą telefoniczną pod numerem: <strong>+48 731 270 861</strong>. Operator rozpatruje zgłoszenia reklamacyjne w terminie do 14 dni, przy czym zgłoszenia dotyczące zwrotu depozytu realizowane są priorytetowo (do 2 dni roboczych).
              </p>
            </div>
          ) : (
            <div>
              <h2>1. General Provisions</h2>
              <p>
                These Terms of Service outline the rules and conditions for participating in the <strong>Founding Member Program</strong> of the <strong>ESG Compliance Agent</strong> platform, the procedure for making and securing the voluntary <strong>Founding Deposit</strong>, and the rules for requesting its full refund.
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
                <li><strong>Founding Member Program:</strong> A time-limited (30 days) early-adopter pilot promotion.</li>
                <li><strong>Founding Deposit:</strong> A voluntary, fully refundable security deposit paid to the Operator's account to secure Founding Member status.</li>
                <li><strong>Pilot:</strong> A 30-day pre-launch phase of the application designed for system testing and gathering feedback.</li>
              </ul>

              <h2>3. Founding Member Benefits</h2>
              <p>Founding Members who submit their application and pay the Founding Deposit receive the following guaranteed benefits:</p>
              <ol>
                <li><strong>Free Access:</strong> Full, unrestricted access to the software for 6 months (half of the year) starting from the official commercial launch date, which is planned for October 1, 2026.</li>
                <li><strong>Locked Pricing:</strong> A permanent 50% discount on subscription plans after the free trial ends — guaranteed for the lifetime of use.</li>
                <li><strong>Priority Onboarding:</strong> A private setup and walkthrough call to show you how to use the system based on your specific regulations and company information.</li>
                <li><strong>Product Influence:</strong> Direct feedback pipeline to product engineers and top priority for custom regulatory feature requests.</li>
              </ol>

              <h2>4. Deposit Amounts & Bank Details</h2>
              <p>The Founding Deposit is a one-off payment based on the preferred currency zone selected in the form:</p>
              <ul>
                <li>For Polish entities (PLN account): <strong>399 PLN</strong></li>
                <li>For Eurozone entities (EUR account): <strong>99 EUR</strong></li>
                <li>For International entities (USD account): <strong>99 USD</strong></li>
              </ul>
              <p>
                The deposit is paid via standard bank transfer to the unique account details generated upon form submission. The transfer title must contain the system-generated unique reference code (e.g., <em>ESG-QIRE-XXXXXX</em>) to automatically secure the spot.
              </p>

              <h2>5. Guaranteed Refund Procedure (Refund Policy)</h2>
              <p style={{ color: '#fcd34d', fontWeight: 600 }}>
                The deposit functions as a secure escrow and is 100% refundable at any time, upon first demand of the User.
              </p>
              <p>To request a refund, follow these simple steps:</p>
              <ol>
                <li>Send an email expressing your intent to: <strong>INFO@F-SUITE.COM</strong>.</li>
                <li>Provide your company name, the booking reference code, and the bank account number for the refund transfer (preferably the same bank account from which the initial payment originated).</li>
              </ol>
              <p>
                The Operator guarantees the execution of the refund bank transfer within <strong>2 business days</strong> from receiving the email request. Refunds are executed in full, with no handling fees, processing deductions, or cancellation penalties. Reclaiming the deposit terminates the active Founding Member status and its corresponding benefits.
              </p>

              <h2>6. Rights and Obligations</h2>
              <ul>
                <li>The Operator agrees to maintain maximum security standards on the platform and absolute protection of deposit funds.</li>
                <li>The User agrees to use the software in a lawful manner, respecting copyright and intellectual property policies.</li>
                <li>Due to the pilot nature of the launch, the Operator reserves the right to make continuous software and feature updates.</li>
              </ul>

              <h2>7. Complaints & Contact</h2>
              <p>
                Any complaints, technical inquiries, support requests, or refund notifications should be submitted directly via email to: <strong>INFO@F-SUITE.COM</strong> or by phone at: <strong>+48 731 270 861</strong>. The Operator reviews standard complaints within 14 days, while deposit refund requests are expedited and handled within 2 business days.
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
