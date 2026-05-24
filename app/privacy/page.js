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
  LegalMetaTable,
  Tag,
  GradientText,
  Footer
} from '../styles';

export default function PrivacyPolicy() {
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
            {txt('Bezpieczeństwo i RODO', 'Security & GDPR')}
          </Tag>
          <h1>
            <GradientText>{txt('Polityka Prywatności', 'Privacy Policy')}</GradientText>
          </h1>
          <p>
            {txt('Ostatnia aktualizacja: 24 maja 2026 r.', 'Last updated: May 24, 2026')}
          </p>
        </LegalHeader>

        <LegalCard>
          {lang === 'pl' ? (
            <div>
              <h2>1. Kto zarządza Twoimi danymi (Administrator)?</h2>
              <p>
                Administratorem Twoich danych osobowych zebranych za pośrednictwem serwisu internetowego oraz podczas rezerwacji depozytu założycielskiego jest spółka:
              </p>
              
              <LegalMetaTable>
                <tbody>
                  <tr>
                    <td className="label">Nazwa firmy</td>
                    <td className="value">QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</td>
                  </tr>
                  <tr>
                    <td className="label">Siedziba i adres</td>
                    <td className="value">ul. Hetmańska 25, 15-727 Białystok, Polska</td>
                  </tr>
                  <tr>
                    <td className="label">Rejestracja</td>
                    <td className="value">Sąd Rejonowy w Białymstoku, XII Wydział Gospodarczy KRS</td>
                  </tr>
                  <tr>
                    <td className="label">KRS</td>
                    <td className="value">0001197301</td>
                  </tr>
                  <tr>
                    <td className="label">NIP</td>
                    <td className="value">5423505856</td>
                  </tr>
                  <tr>
                    <td className="label">REGON</td>
                    <td className="value">542864985</td>
                  </tr>
                  <tr>
                    <td className="label">Kontakt e-mail</td>
                    <td className="value">INFO@F-SUITE.COM</td>
                  </tr>
                </tbody>
              </LegalMetaTable>

              <h2>2. Jakie dane zbieramy i po co to robimy?</h2>
              <p>Przetwarzamy wyłącznie dane niezbędne do realizacji celów biznesowych i komunikacyjnych:</p>
              <ul>
                <li><strong>Imię i nazwisko oraz nazwa firmy:</strong> aby wiedzieć, z kim zawieramy umowę rezerwacyjną i komu wystawiamy dokumenty.</li>
                <li><strong>Adres e-mail oraz numer telefonu:</strong> w celu przesłania instrukcji depozytowych, kontaktu w sprawie pilotażu oraz przesyłania istotnych powiadomień technicznych.</li>
                <li><strong>Dane dotyczące wybranej waluty i standardu ESG:</strong> aby poprawnie skonfigurować Twoje konto pilotażowe.</li>
                <li><strong>Informacje o płatnościach (konta bankowe):</strong> rejestrowane podczas dokonywania zwrotnego depozytu wyłącznie w celu ewentualnego wykonania zwrotu środków na to samo konto.</li>
              </ul>

              <h2>3. Podstawa prawna przetwarzania danych (zgodnie z RODO)</h2>
              <p>Twoje dane przetwarzamy w oparciu o następujące podstawy prawne:</p>
              <ol>
                <li><strong>Art. 6 ust. 1 lit. b RODO (Niezbędność do wykonania umowy):</strong> przetwarzanie jest konieczne do podjęcia działań na Twoje żądanie przed zawarciem umowy (rejestracja w programie pilotażowym) oraz do realizacji samej umowy rezerwacji depozytu.</li>
                <li><strong>Art. 6 ust. 1 lit. f RODO (Prawnie uzasadniony interes):</strong> utrzymywanie relacji biznesowej, zbieranie opinii i feedbacku dotyczących działania oprogramowania ESG w fazie pilotażu oraz obsługa zgłoszeń.</li>
                <li><strong>Art. 6 ust. 1 lit. c RODO (Obowiązek prawny):</strong> przechowywanie danych finansowych i księgowych w celu spełnienia wymogów prawa podatkowego w Polsce i UE.</li>
              </ol>

              <h2>4. Jak długo przechowujemy Twoje dane?</h2>
              <p>Okres przechowywania danych zależy od celu ich zebrania:</p>
              <ul>
                <li>Dane podane w formularzu rezerwacji przechowujemy przez czas trwania Programu Założycielskiego i pilotażu (30 dni), a w przypadku dokonania wpłaty – przez cały czas trwania aktywnego uczestnictwa oraz okres przedawnienia roszczeń (standardowo 3 lata).</li>
                <li>Dane finansowe i księgowe dotyczące transakcji depozytowych przechowujemy przez wymagany przepisami prawa polskiego okres 5 lat od końca roku podatkowego, w którym dokonano transakcji.</li>
              </ul>

              <h2>5. Komu udostępniamy Twoje dane?</h2>
              <p>
                Twoje dane nie są sprzedawane ani przekazywane podmiotom trzecim w celach marketingowych. Dostęp do nich mają wyłącznie podmioty wspierające nas w obsłudze technicznej i prawnej:
              </p>
              <ul>
                <li>Dostawcy usług hostingowych oraz infrastruktury serwerowej zlokalizowanej w Unii Europejskiej.</li>
                <li>Podmiot obsługujący nasze usługi księgowe oraz prawne.</li>
                <li>Banki obsługujące nasze rachunki depozytowe (PKO Bank Polski) wyłącznie w celu procesowania wpłat i zwrotów.</li>
              </ul>

              <h2>6. Twoje prawa (Zgodnie z RODO)</h2>
              <p>Jako właściciel danych masz prawo do:</p>
              <ul>
                <li>Dostępu do swoich danych oraz otrzymania ich kopii.</li>
                <li>Sprostowania (poprawienia) swoich danych.</li>
                <li>Usunięcia danych („prawo do bycia zapomnianym”) – chyba że ich przechowywanie jest wymagane przez prawo podatkowe.</li>
                <li>Ograniczenia przetwarzania danych.</li>
                <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
                <li>Przenoszenia danych do innego administratora.</li>
                <li>Cofnięcia zgody w dowolnym momencie (bez wpływu na zgodność z prawem przetwarzania przed jej cofnięciem).</li>
                <li>Wniesienia skargi do organu nadzorczego (w Polsce: Prezes Urzędu Ochrony Danych Osobowych - PUODO).</li>
              </ul>
              <p>W celu realizacji swoich praw skontaktuj się z nami pod adresem: <strong>INFO@F-SUITE.COM</strong>.</p>

              <h2>7. Architektura Local-First a dane w aplikacji</h2>
              <p>
                Zwracamy uwagę, że produkt ESG Compliance Agent został zaprojektowany w architekturze <strong>local-first</strong>. Oznacza to, że wszelkie wrażliwe dokumenty operacyjne, analizy oraz wygenerowane raporty ESG są przechowywane lokalnie na Twoim urządzeniu i nie są wysyłane do naszych baz danych ani serwerów chmurowych. Administrator witryny nie ma dostępu do plików Twojego przedsiębiorstwa wgrywanych wewnątrz aplikacji.
              </p>

              <h2>8. Pliki cookies i technologie śledzące</h2>
              <p>
                Nasza witryna internetowa używa minimalnej liczby plików cookies w celach funkcjonalnych (np. zapamiętanie wybranego języka PL/EN). Nie stosujemy inwazyjnych technologii śledzących ani profili reklamowych podmiotów trzecich.
              </p>
            </div>
          ) : (
            <div>
              <h2>1. Who is the Data Controller?</h2>
              <p>
                The controller of your personal data collected through the website and during the reservation of the founding deposit is:
              </p>
              
              <LegalMetaTable>
                <tbody>
                  <tr>
                    <td className="label">Company Name</td>
                    <td className="value">QIRE LAB SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</td>
                  </tr>
                  <tr>
                    <td className="label">HQ Address</td>
                    <td className="value">ul. Hetmańska 25, 15-727 Białystok, Poland</td>
                  </tr>
                  <tr>
                    <td className="label">Registry</td>
                    <td className="value">District Court in Białystok, XII Commercial Division of the National Court Register</td>
                  </tr>
                  <tr>
                    <td className="label">KRS No.</td>
                    <td className="value">0001197301</td>
                  </tr>
                  <tr>
                    <td className="label">NIP (VAT ID)</td>
                    <td className="value">PL5423505856</td>
                  </tr>
                  <tr>
                    <td className="label">REGON</td>
                    <td className="value">542864985</td>
                  </tr>
                  <tr>
                    <td className="label">Contact Email</td>
                    <td className="value">INFO@F-SUITE.COM</td>
                  </tr>
                </tbody>
              </LegalMetaTable>

              <h2>2. What Data We Process and Why</h2>
              <p>We process only the data necessary to achieve business and communication goals:</p>
              <ul>
                <li><strong>Full name & Company name:</strong> To identify who is reserving the spot and to issue deposit confirmation documents.</li>
                <li><strong>Email address & Phone number:</strong> To send deposit instructions, contact you regarding the pilot, and deliver critical technical updates.</li>
                <li><strong>Preferred currency & ESG standard:</strong> To properly set up and configure your pilot experience.</li>
                <li><strong>Payment information (bank accounts):</strong> Recorded during your deposit transfer solely to execute the refund to the exact same account if requested.</li>
              </ul>

              <h2>3. Legal Grounds for Processing (under GDPR)</h2>
              <p>We process your personal data based on the following provisions:</p>
              <ol>
                <li><strong>Art. 6(1)(b) GDPR (Performance of a contract):</strong> Processing is necessary to take steps at your request prior to entering into a contract (pilot registration) and to perform the deposit reservation agreement.</li>
                <li><strong>Art. 6(1)(f) GDPR (Legitimate interests):</strong> Maintaining business relationships, collecting feedback on the ESG software performance during the pilot phase, and handling inquiries.</li>
                <li><strong>Art. 6(1)(c) GDPR (Legal compliance):</strong> Keeping financial and accounting records to comply with Polish and EU tax regulations.</li>
              </ol>

              <h2>4. Data Retention Period</h2>
              <p>The period for storing data depends on the purpose of its collection:</p>
              <ul>
                <li>Form registration data is stored for the duration of the Founding Program and pilot (30 days); if a deposit is paid, for the duration of active participation plus the period of limitation for claims (typically 3 years).</li>
                <li>Financial and transaction data is archived for the legally required period of 5 years from the end of the tax year in which the transaction took place.</li>
              </ul>

              <h2>5. Data Disclosure</h2>
              <p>
                We do not sell or share your personal data with third parties for marketing purposes. Only service providers supporting our technical and business operations have access:
              </p>
              <ul>
                <li>Hosting and server infrastructure providers located inside the European Union.</li>
                <li>Professional accounting and legal advisors.</li>
                <li>The bank managing our deposit accounts (PKO Bank Polski) solely to process deposit payments and refunds.</li>
              </ul>

              <h2>6. Your Rights under GDPR</h2>
              <p>As a data subject, you have the right to:</p>
              <ul>
                <li>Access your personal data and obtain a copy of it.</li>
                <li>Rectify (correct) incorrect or outdated data.</li>
                <li>Erase your data ("the right to be forgotten") — unless storage is legally required (e.g., tax records).</li>
                <li>Restrict data processing.</li>
                <li>Object to the processing of your data.</li>
                <li>Request data portability.</li>
                <li>Withdraw your consent at any time (without affecting the lawfulness of processing based on consent before its withdrawal).</li>
                <li>File a complaint with a supervisory authority (in Poland: PUODO - President of the Personal Data Protection Office).</li>
              </ul>
              <p>To exercise your rights, please contact us at: <strong>INFO@F-SUITE.COM</strong>.</p>

              <h2>7. Local-First Architecture</h2>
              <p>
                Please note that the ESG Compliance Agent application is built with a <strong>local-first</strong> architecture. This means your sensitive business files, operational parameters, and generated ESG reports are kept locally on your device. They are not uploaded to our databases or server systems. The administrator of this website has no access to your corporate data processed inside the software.
              </p>

              <h2>8. Cookies and Tracking</h2>
              <p>
                Our website uses a minimal amount of functional cookies (e.g., storing your PL/EN language preference). We do not employ invasive third-party trackers or advertising profiles.
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
