/**
 * Company Type-Specific Action Plan Comments
 *
 * Structure: companyType → horizon (30) → { pl, en }
 *
 * Company Types:
 * - MSP: Small/Medium enterprises (MŚP)
 * - SUPPLIER: Companies in supply chain
 * - LARGE: Large organizations
 */

const PLAN_COMMENTS = {
    MSP: {
        30: {
            pl: `Pierwsze 30 dni warto przeznaczyć na uporządkowanie podstaw działania firmy w obszarach, które dziś nie są jasno opisane lub mierzone.

W pierwszej kolejności:
- Zbierz w jednym miejscu dane dotyczące zużycia energii, paliwa i mediów.
- Spisz kto w firmie odpowiada za kluczowe obszary: finanse, ludzi, dostawców i dokumenty.
- Uporządkuj listę kluczowych dostawców i sprawdź, czy masz z nimi aktualne ustalenia.
- Ustal prosty schemat reagowania na sytuacje problemowe.

W praktyce oznacza to:
- Określ kto podejmuje decyzję w przypadku:
  - awarii sprzętu lub przestoju,
  - opóźnienia w realizacji zlecenia,
  - reklamacji lub skargi klienta,
  - problemu z dostawcą (brak towaru, zmiana warunków).
- Ustal maksymalny czas reakcji (np. 24h na kontakt z klientem).
- Zdefiniuj, kto informuje klienta i w jaki sposób.
- Spisz to w krótkiej, jedno- lub dwustronicowej instrukcji.
- Ustal zasadę dokumentowania takich sytuacji (np. prosty rejestr w Excelu).

Uporządkuj kluczowe dokumenty firmy w jednym, łatwo dostępnym miejscu:

1. Umowy i zobowiązania
- Umowy z kluczowymi klientami
- Umowy z dostawcami
- Umowy najmu / leasingu
- Kredyty, zobowiązania finansowe
- Ubezpieczenia
Sprawdź: czy są aktualne, kto je przechowuje, czy znasz ich kluczowe warunki (terminy, kary, wypowiedzenia).

2. Instrukcje i zasady wewnętrzne
- Zasady pracy i odpowiedzialności
- Instrukcje bezpieczeństwa
- Procedury reagowania na problemy
- Ustalenia dotyczące jakości lub obsługi klienta
Jeśli czegoś nie ma – zapisz to w prostej formie (1–2 strony wystarczą).

3. Dokumenty operacyjne
- Lista kluczowych dostawców
- Dane kontaktowe do osób decyzyjnych
- Harmonogramy kluczowych przeglądów lub płatności
- Dostępy do systemów i kont firmowych

4. Forma uporządkowania
- Jeden folder cyfrowy (np. w chmurze) z jasnym podziałem.
- Ograniczony dostęp tylko do osób odpowiedzialnych.
- Jedna osoba wskazana jako „właściciel porządku dokumentów".

Efekt po 30 dniach:
- Wiesz, jakie zobowiązania ma firma.
- W sytuacji problemowej nie szukasz dokumentów „po ludziach".
- Masz pełen obraz ustaleń z klientami i dostawcami.
- Firma jest gotowa na pytanie z zewnątrz bez chaosu.
- Firma reaguje według ustalonego schematu, a nie pod wpływem emocji.
- Problemy nie „rozlewają się" po organizacji i nie zaskakują przy powtórzeniu.`,

            en: `The first 30 days should be dedicated to organizing the company's operational foundations in areas that are currently not clearly described or measured.

As a first step:
- Gather in one place data on energy, fuel, and utility consumption.
- Identify who in the company is responsible for key areas: finance, people, suppliers, and documentation.
- Organize the list of key suppliers and verify whether your agreements with them are up to date.
- Establish a simple framework for responding to problematic situations.

In practice, this means:
- Define who makes decisions in the event of:
  - equipment failure or downtime,
  - delays in order execution,
  - customer complaints or claims,
  - supplier issues (lack of goods, change of terms).
- Set a maximum response time (e.g., 24 hours to contact the customer).
- Define who informs the customer and in what manner.
- Document this in a short, one- or two-page instruction.
- Establish a rule for documenting such situations (e.g., a simple register in Excel).

Organize the company's key documents in one easily accessible place:

1. Contracts and obligations
- Agreements with key customers
- Supplier contracts
- Lease / rental agreements
- Loans and financial liabilities
- Insurance policies
Verify: whether they are up to date, who stores them, whether you know their key terms (deadlines, penalties, termination clauses).

2. Internal instructions and policies
- Work and responsibility rules
- Safety instructions
- Problem response procedures
- Quality or customer service guidelines
If something is missing – write it down in a simple form (1–2 pages are enough).

3. Operational documents
- List of key suppliers
- Contact details of decision-makers
- Schedule of key inspections or payments
- Access credentials to company systems and accounts

4. Organization format
- One digital folder (e.g., in the cloud) with a clear structure.
- Limited access only to responsible persons.
- One designated person as the "owner" of document organization.

Result after 30 days:
- You know the company's obligations.
- In a problematic situation, you do not search for documents "through people."
- You have a full overview of agreements with customers and suppliers.
- The company is ready to answer external inquiries without chaos.
- The company reacts according to an established framework, not under the influence of emotions.
- Problems do not "spread" across the organization and do not come as a surprise when they recur.`
        }
    },

    SUPPLIER: {
        30: {
            pl: `Pierwsze 30 dni warto przeznaczyć na uporządkowanie informacji, które mogą być wymagane przez klientów biznesowych lub partnerów.

W pierwszej kolejności:

1. Zbierz dane, o które najczęściej pytają klienci
- zużycie energii i mediów,
- sposób doboru dostawców,
- zasady reagowania na problemy,
- informacje o bezpieczeństwie pracy.
Wszystkie dane powinny być dostępne w jednym miejscu.

2. Uporządkuj dokumenty potwierdzające sposób działania firmy
- aktualne umowy,
- procedury jakościowe,
- instrukcje bezpieczeństwa,
- zakresy odpowiedzialności.
Sprawdź, czy są spójne i aktualne.

3. Przeanalizuj zależność od kluczowych dostawców
- kto ma największy wpływ na Twoją terminowość,
- czy masz alternatywę,
- czy umowy jasno określają odpowiedzialność.

4. Ustal standard reakcji na zapytania klientów
- kto odpowiada,
- w jakim czasie,
- na jakiej podstawie (dane, dokumenty).

5. Sprawdź spójność informacji
To, co mówisz klientowi, powinno być zgodne z rzeczywistym sposobem działania firmy.

Efekt po 30 dniach:
Firma jest przygotowana na pytania kontrahentów i działa w sposób bardziej uporządkowany i przewidywalny.`,

            en: `The first 30 days should focus on organizing information that may be required by business clients or partners.

Start with:

1. Collect key operational data commonly requested by clients
- energy and utility consumption,
- supplier selection process,
- problem response procedures,
- workplace safety information.
All data should be available in one place.

2. Review and organize documents confirming how your company operates
- current contracts,
- quality procedures,
- safety instructions,
- responsibility assignments.
Check whether they are consistent and up to date.

3. Analyze dependence on critical suppliers
- who has the greatest impact on your timeliness,
- whether you have alternatives,
- whether contracts clearly define responsibilities.

4. Define a standard response process for client inquiries
- who responds,
- within what timeframe,
- based on what (data, documents).

5. Ensure consistency between declared practices and actual operations
What you tell clients should match how the company actually operates.

After 30 days:
The company should be more structured and ready to respond confidently to external requests.`
        }
    },

    LARGE: {
        30: {
            pl: `Pierwsze 30 dni powinny zostać przeznaczone na uporządkowanie odpowiedzialności i spójności działań w obszarze zrównoważonego rozwoju w całej organizacji.

1. Wyznacz właściciela obszaru
- Określ osobę lub komórkę odpowiedzialną za koordynację działań.
- Zdefiniuj zakres decyzyjny i raportowy.
- Ustal, kto zatwierdza kluczowe decyzje.
Bez jasnego właściciela działania pozostają rozproszone.

2. Zmapuj istniejące procedury
Zbierz informacje:
- jakie polityki już funkcjonują (HR, zakupy, jakość, środowisko),
- gdzie znajdują się procedury,
- kto za nie odpowiada,
- które są aktualne, a które wymagają przeglądu.
Celem nie jest tworzenie nowych dokumentów, tylko zrozumienie, co już działa.

3. Sprawdź przepływ informacji między działami
Zweryfikuj:
- czy dział zakupów wie, jakie są standardy współpracy,
- czy HR ma jasno określone zasady pracy i odpowiedzialności,
- czy dział operacyjny raportuje dane w jednolity sposób.
W dużej firmie największym problemem jest brak spójności, nie brak dokumentów.

4. Uporządkuj dane wyjściowe
Zidentyfikuj:
- jakie dane są już zbierane,
- w jakiej formie,
- kto je agreguje,
- czy są porównywalne między działami.
Na tym etapie nie chodzi o rozbudowane raportowanie. Chodzi o ustalenie punktu startowego.

5. Przygotuj wewnętrzną notę kierunkową
Krótki dokument (1–2 strony) określający:
- dlaczego firma porządkuje ten obszar,
- jakie są cele na najbliższe miesiące,
- kto odpowiada za realizację.
Dokument powinien zostać przekazany menedżerom, aby nadać działaniom wspólny kierunek.

Efekt po 30 dniach:
Organizacja:
- wie, kto odpowiada za koordynację,
- zna aktualny stan procedur,
- ma uporządkowaną strukturę odpowiedzialności,
- posiada punkt wyjścia do dalszej integracji działań.`,

            en: `The first 30 days should focus on structuring ownership, accountability, and alignment of sustainability-related activities across the organization.

In large companies, processes often already exist — the priority is ensuring consistency, clarity, and coordination.

1. Appoint a Clear Owner
- Designate a person or department responsible for coordination.
- Define decision-making and reporting authority.
- Clarify who approves key actions and policies.
Without a clearly assigned owner, initiatives remain fragmented and inconsistent.

2. Map Existing Policies and Procedures
Identify:
- which policies are already in place (HR, procurement, quality, environment, compliance),
- where documentation is stored,
- who is responsible for each area,
- which procedures are current and which require review.
The objective is not to create new documents, but to understand what already exists.

3. Review Cross-Department Information Flow
Verify:
- whether procurement applies consistent supplier standards,
- whether HR follows structured employment and working condition policies,
- whether operational teams report data in a unified format,
- whether management receives consolidated information.
In large organizations, inconsistency between departments is often the main challenge — not the absence of documentation.

4. Organize Baseline Data
Determine:
- what data is currently collected,
- in what format,
- who aggregates and reviews it,
- whether data is comparable across business units.
At this stage, the goal is not advanced reporting — but establishing a clear starting point.

5. Issue an Internal Directional Note
Prepare a short internal document (1–2 pages) outlining:
- why the company is structuring this area,
- what the priorities are for the next months,
- who is responsible for implementation.
This document should be shared with managers to provide alignment and a common direction.

Result After 30 Days:
The organization:
- has a clearly defined coordination structure,
- understands its current procedural landscape,
- has structured responsibility allocation,
- established a clear baseline for further integration.`
        }
    }
};

/**
 * Get plan comment for specific company type and horizon
 * @param {string} companyType - MSP, SUPPLIER, or LARGE
 * @param {number} horizon - 30
 * @param {string} lang - pl or en
 * @returns {string|null} Plan comment text
 */
function getPlanComment(companyType, horizon, lang = 'pl') {
    const type = companyType?.toUpperCase?.() || companyType;
    const h = parseInt(horizon);

    if (!PLAN_COMMENTS[type]) {
        console.warn(`Unknown company type: ${type}`);
        return null;
    }

    if (!PLAN_COMMENTS[type][h]) {
        console.warn(`Unknown horizon: ${h} for type ${type}`);
        return null;
    }

    return PLAN_COMMENTS[type][h][lang] || PLAN_COMMENTS[type][h]['en'];
}

/**
 * Get all plan comments for a company type
 * @param {string} companyType - MSP, SUPPLIER, or LARGE
 * @returns {Object|null} { 30: { pl, en } }
 */
function getPlanCommentsForType(companyType) {
    const type = companyType?.toUpperCase?.() || companyType;
    return PLAN_COMMENTS[type] || null;
}

module.exports = {
    PLAN_COMMENTS,
    getPlanComment,
    getPlanCommentsForType
};
