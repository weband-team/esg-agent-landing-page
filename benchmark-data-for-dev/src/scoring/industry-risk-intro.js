/**
 * Industry Risk Introduction Dictionary
 * Auto-generated from COMMENTS.md TOP_INTRO entries
 *
 * Provides industry-specific context for TOP 3 risk areas.
 * Structure: INDUSTRY_RISK_INTRO[industryCode][pillar][language]
 *
 * Industry codes:
 * - construction
 * - energy_resources
 * - industrial_production
 * - logistics_transport
 * - retail_trade
 * - it_software
 * - finance_fintech
 * - services_other
 */

const INDUSTRY_RISK_INTRO = {
    construction: {
        E: {
            pl: "W budownictwie decyzje środowiskowe, kompletność dokumentacji projektowej oraz kontrola jakości materiałów wpływają bezpośrednio na harmonogram robót. Błąd formalny lub niezgodność materiałowa może wstrzymać prace, wydłużyć termin realizacji i narazić wykonawcę na kary umowne.",
            en: "In construction, environmental issues directly influence investor decisions, administrative permits, and the ability to execute contracts."
        },
        S: {
            pl: "BHP na budowie oraz nadzór nad podwykonawcami decydują o ciągłości prac i terminowości realizacji. Wypadek lub niewłaściwy nadzór nad podwykonawcą może wstrzymać roboty, zwiększyć koszty i przenieść odpowiedzialność na generalnego wykonawcę.",
            en: "Health and safety on the construction site, as well as supervision of subcontractors, determine the continuity of works and the timely completion of the project. An accident or improper supervision of a subcontractor may halt the works, increase costs, and shift liability to the general contractor."
        },
        G: {
            pl: "W budownictwie jakość dokumentacji, sprawny obieg decyzji oraz kontrola zmian projektowych wpływają na tempo realizacji inwestycji. Niespójności w dokumentach lub brak formalnego zatwierdzania zmian mogą prowadzić do roszczeń, sporów oraz dodatkowych kosztów po stronie wykonawcy.",
            en: "In the construction sector, the quality of documentation, efficient circulation of decisions, and control of design changes influence the pace of project execution. Inconsistencies in documents or the lack of formal approval of changes may lead to claims, disputes, and additional costs on the contractor's side."
        },
        SC: {
            pl: "Kontrola podwykonawców i jakości materiałów warunkuje dotrzymanie harmonogramu budowy. Opóźnienie dostaw lub wada materiałowa może spowodować przestój, naliczenie kar umownych oraz obniżenie rentowności kontraktu.",
            en: "Control over subcontractors and the quality of materials determines adherence to the construction schedule. A delay in deliveries or a material defect may cause downtime, trigger contractual penalties, and reduce the profitability of the contract."
        }
    },

    energy_resources: {
        E: {
            pl: "W sektorze energetyki i surowców emisje, pozwolenia środowiskowe i decyzje regulatora bezpośrednio wpływają na możliwość uruchomienia instalacji. Opóźnienie w uzyskaniu decyzji administracyjnych może wstrzymać projekt wart setki milionów złotych.",
            en: "In the energy and raw materials sector, emissions, environmental permits, and regulatory decisions directly affect the ability to commission installations. Delays in obtaining administrative decisions can halt projects worth hundreds of millions in capital investment."
        },
        S: {
            pl: "Bezpieczeństwo pracy, nadzór nad podwykonawcami oraz relacje ze społecznością lokalną wpływają bezpośrednio na ciągłość wydobycia lub produkcji. Wypadek, protest lub konflikt społeczny mogą zatrzymać działalność i wygenerować dodatkowe koszty oraz kontrole ze strony instytucji.",
            en: "Workplace safety, supervision of subcontractors, and relations with the local community directly affect the continuity of extraction or production. An accident, protest, or social conflict may halt operations and generate additional costs as well as inspections by authorities."
        },
        G: {
            pl: "W tej branży sposób zarządzania oraz zgodność z wymaganiami regulatora wpływają na tempo uzyskiwania koncesji i finansowania inwestycji. Braki w nadzorze, dokumentacji lub procedurach mogą opóźniać decyzje administracyjne i utrudniać pozyskanie finansowania.",
            en: "In this industry, management practices and compliance with regulatory requirements influence the speed of obtaining concessions and investment financing. Deficiencies in oversight, documentation, or procedures may delay administrative decisions and make it more difficult to secure financing."
        },
        SC: {
            pl: "Stabilność dostaw surowców i dostęp do infrastruktury przesyłowej warunkują ciągłość produkcji. Przerwa w dostawach oznacza przestój instalacji, a przy wysokich kosztach stałych każdy dzień bez produkcji bezpośrednio obniża rentowność działalności.",
            en: "The stability of raw material supplies and access to transmission infrastructure determine the continuity of production. A disruption in supplies means downtime for the installation, and with high fixed costs, every day without production directly reduces operational profitability."
        }
    },

    industrial_production: {
        E: {
            pl: "Zużycie energii, poziom odpadu oraz stabilność parametrów linii bezpośrednio wpływają na koszt jednostkowy wyrobu. Niekontrolowane straty materiałowe lub wahania zużycia energii obniżają wydajność linii i zwiększają koszt produkcji przy tej samej zdolności wytwórczej.",
            en: "Energy consumption, scrap rate, and line parameter stability directly impact unit production cost. Uncontrolled material losses or energy fluctuations reduce line efficiency and increase cost at the same production capacity."
        },
        S: {
            pl: "Ciągłość pracy linii zależy od dyscypliny operacyjnej, przestrzegania procedur oraz bezpieczeństwa pracy na hali produkcyjnej. Błąd operatora lub brak kontroli procesu może wywołać przestój technologiczny, zwiększyć odsetek braków i podnieść koszt jednostkowy całej partii.",
            en: "Production continuity depends on operational discipline, procedural compliance, and shop-floor safety. Operator error or weak process control may trigger downtime, increase defect rates, and raise unit cost for the entire batch."
        },
        G: {
            pl: "Jakość dokumentacji technologicznej, formalna kontrola zmian receptur oraz nadzór nad parametrami linii decydują o stabilności produkcji. Brak kontroli nad zmianą procesu może skutkować reklamacjami, serią wadliwych wyrobów oraz utratą rentowności całej partii.",
            en: "Technical documentation quality, formal change control, and line parameter supervision determine production stability. Weak process governance may result in customer claims, defective batches, and margin loss across the entire production run."
        },
        SC: {
            pl: "Jakość surowców i terminowość dostaw wpływają bezpośrednio na wydajność linii produkcyjnej. Surowiec poza specyfikacją powoduje przestoje, zwiększony odpad i spadek efektywności linii, co natychmiast podnosi koszt jednostkowy.",
            en: "Raw material quality and delivery timeliness directly affect production line performance. Off-spec materials cause downtime, increased scrap, and reduced line efficiency, which immediately raises unit production costs."
        }
    },

    logistics_transport: {
        E: {
            pl: "Zużycie paliwa, emisje oraz stan techniczny floty bezpośrednio wpływają na koszt kilometra i rentowność kontraktów transportowych. Wahania cen paliwa lub nowe ograniczenia emisyjne mogą obniżyć marżę i wymusić renegocjację stawek przy długoterminowych umowach z klientami.",
            en: "Fuel consumption, emissions, and fleet condition directly impact cost per kilometer and contract profitability. Fuel price volatility or new emission regulations may reduce margins and force rate renegotiations under long-term client contracts."
        },
        S: {
            pl: "Bezpieczeństwo kierowców i organizacja czasu pracy wpływają bezpośrednio na terminowość dostaw. Wypadek lub naruszenie norm czasu jazdy może oznaczać unieruchomienie pojazdu lub części floty, kary umowne oraz utratę wiarygodności w oczach kontrahentów.",
            en: "Driver safety and working time compliance directly affect delivery punctuality. An accident or violation of driving time regulations may immobilize a vehicle or part of the fleet, trigger contractual penalties, and damage credibility with clients."
        },
        G: {
            pl: "Kontrola harmonogramów, monitorowanie floty i egzekwowanie warunków umów decydują o dotrzymaniu warunków kontraktowych. Brak nadzoru nad terminami lub dokumentacją przewozową może skutkować karami za opóźnienia i utratą długoterminowych kontraktów.",
            en: "Schedule control, fleet monitoring, and enforcement of contract terms determine whether contractual obligations are met. Weak supervision over deadlines or transport documentation may result in delay penalties and loss of long-term contracts."
        },
        SC: {
            pl: "Sprawność floty, dostępność kierowców oraz stabilność dostaw paliwa warunkują ciągłość realizacji tras. Opóźnienie dostawy lub awaria pojazdu generują kary za niedotrzymanie terminu oraz podnoszą koszt operacyjny każdej trasy.",
            en: "Fleet reliability, driver availability, and stable fuel supply determine route continuity. Delivery delays or vehicle breakdowns trigger contractual penalties and increase operational cost per route."
        }
    },

    retail_trade: {
        E: {
            pl: "Zarządzanie zapasami, sezonowość sprzedaży oraz kontrola stanów magazynowych bezpośrednio wpływają na dostępność towaru i poziom marży. Nadmiar zapasu zamraża kapitał obrotowy, a braki magazynowe w szczycie sezonu oznaczają utraconą sprzedaż i osłabienie relacji z klientem.",
            en: "Inventory management, seasonality, and warehouse stock control directly affect product availability and margin levels. Excess inventory ties up working capital, while stock shortages during peak season result in lost sales and weakened customer relationships."
        },
        S: {
            pl: "Obsługa zwrotów i reklamacji wpływa bezpośrednio na koszt sprzedaży oraz postrzeganie marki. Wysoki poziom zwrotów obniża marżę jednostkową i może podważyć zaufanie klientów przy powtarzających się problemach jakościowych.",
            en: "Returns and complaint handling directly affect cost of sales and brand perception. A high return rate reduces unit margin and may undermine customer trust when quality issues repeatedly occur."
        },
        G: {
            pl: "Zgodność z przepisami konsumenckimi, poprawność oznaczeń oraz kontrola dokumentacji sprzedażowej decydują o bezpieczeństwie działalności handlowej. Naruszenie regulacji może skutkować karami administracyjnymi, zwrotem środków oraz utratą reputacji marki.",
            en: "Compliance with consumer regulations, correct labeling, and control of sales documentation determine the security of retail operations. Regulatory breaches may result in administrative penalties, forced refunds, and damage to brand reputation."
        },
        SC: {
            pl: "Sprawność łańcucha dostaw oraz terminowość dostaw do magazynu warunkują ciągłość ekspozycji towaru na półce. Opóźnienia dostaw lub błędy kompletacyjne obniżają dostępność produktu, generują utraconą sprzedaż i bezpośrednio wpływają na rentowność sprzedaży.",
            en: "Supply chain efficiency and on-time warehouse deliveries determine shelf availability. Delivery delays or picking errors reduce product availability, generate lost sales, and directly impact sales profitability."
        }
    },

    it_software: {
        E: {
            pl: "Stabilność infrastruktury IT, zużycie zasobów serwerowych i architektura systemu wpływają bezpośrednio na dostępność usług dla klienta. Przeciążenie lub awaria środowiska produkcyjnego może skutkować przerwą w działaniu systemu, utratą przychodów abonamentowych oraz roszczeniami wynikającymi z umów z klientami.",
            en: "IT infrastructure stability, server resource usage, and system architecture directly impact service availability for clients. Overload or production environment failure may cause service downtime, recurring revenue loss, and compensation claims under client contracts."
        },
        S: {
            pl: "Zależność od kluczowych programistów oraz kompetencje zespołu wpływają na tempo wdrożeń i utrzymanie systemów. Odejście kluczowego programisty może opóźnić realizację projektu, narazić firmę na kary umowne oraz osłabić relację z klientem.",
            en: "Dependence on key developers and team expertise directly affects deployment timelines and system maintenance. The departure of a key developer may delay project delivery, trigger contractual penalties, and weaken client relationships."
        },
        G: {
            pl: "Bezpieczeństwo danych, zgodność z przepisami o ochronie danych oraz kontrola dostępu do systemów decydują o zaufaniu klientów. Wycieki danych lub naruszenie regulacji mogą skutkować odpowiedzialnością prawną, karami finansowymi oraz utratą kluczowych klientów.",
            en: "Data security, compliance with data protection regulations, and access control determine client trust. Data breaches or regulatory violations may result in legal liability, financial penalties, and loss of key clients."
        },
        SC: {
            pl: "Zależność od dostawców chmury, integratorów oraz zewnętrznych API wpływa na ciągłość działania systemu. Awaria kluczowego partnera technologicznego może przerwać dostępność usług, wygenerować kary umowne oraz doprowadzić do utraty kontraktu.",
            en: "Dependence on cloud providers, integrators, and external APIs directly affects system continuity. Failure of a critical technology partner may interrupt service availability, trigger contractual penalties, and lead to contract loss."
        }
    },

    finance_fintech: {
        E: {
            pl: "Zgodność z regulacjami oraz bieżący nadzór nad działalnością decydują o możliwości oferowania usług finansowych. Naruszenie przepisów może skutkować karą administracyjną, ograniczeniem działalności lub utratą licencji, co bezpośrednio wpływa na ciągłość przychodów i zaufanie klientów.",
            en: "Regulatory compliance and ongoing supervisory oversight determine the ability to provide financial services. Regulatory breaches may result in administrative penalties, business restrictions, or license withdrawal, directly affecting revenue continuity and client trust."
        },
        S: {
            pl: "Ochrona danych klientów, bezpieczeństwo transakcji oraz jakość obsługi wpływają na reputację instytucji finansowej. Incydent związany z wyciekiem danych lub nieautoryzowaną transakcją może doprowadzić do odpływu klientów, roszczeń oraz trwałego spadku przychodów.",
            en: "Customer data protection, transaction security, and service quality directly impact institutional reputation. A data breach or unauthorized transaction may trigger customer outflow, legal claims, and long-term revenue decline."
        },
        G: {
            pl: "Sprawny system kontroli wewnętrznej i zarządzania ryzykiem wpływa na relacje z instytucjami nadzorczymi oraz dostęp do finansowania. Braki w nadzorze lub systemie kontroli wewnętrznej mogą skutkować dodatkowymi kontrolami, sankcjami oraz ograniczeniem współpracy z bankami lub inwestorami.",
            en: "A strong internal control and risk management system determines relationships with supervisory authorities and access to funding. Weak oversight or internal control gaps may lead to intensified supervision, regulatory sanctions, and restricted cooperation with banks or investors."
        },
        SC: {
            pl: "Zależność od dostawców systemów płatniczych, infrastruktury IT oraz partnerów technologicznych wpływa na ciągłość realizacji transakcji. Awaria systemu lub cyberatak może przerwać obsługę klientów, wygenerować odpowiedzialność finansową i osłabić reputację na rynku.",
            en: "Dependence on payment systems, IT infrastructure, and technology partners directly affects transaction continuity. System failure or cyberattack may disrupt customer service, create financial liability, and damage market reputation."
        }
    },

    services_other: {
        E: {
            pl: "Jakość obsługi oraz terminowość realizacji zleceń bezpośrednio wpływają na satysfakcję klienta i powtarzalność przychodów. Opóźnienie w realizacji usługi może skutkować utratą klienta, spadkiem rekomendacji oraz ograniczeniem powtarzalnych przychodów.",
            en: "Service quality and timely execution directly affect client satisfaction and recurring revenue. A delay in service delivery may result in client loss, reduced referrals, and a decline in recurring income."
        },
        S: {
            pl: "Stabilność zespołu i kompetencje pracowników wpływają na jakość świadczonej usługi oraz relacje z klientami. Odejście kluczowej osoby lub błąd merytoryczny może osłabić zaufanie klienta i doprowadzić do zakończenia współpracy.",
            en: "Team stability and employee competence determine service quality and client relationships. The departure of a key specialist or a professional error may undermine client trust and lead to contract termination."
        },
        G: {
            pl: "Odpowiedzialność zawodowa oraz poufność informacji klientów decydują o reputacji firmy na rynku. Naruszenie poufności lub błąd w realizacji usługi może skutkować roszczeniami, utratą klientów i trwałym spadkiem przychodów.",
            en: "Professional liability and client confidentiality determine market reputation. A confidentiality breach or service error may result in legal claims, client loss, and long-term revenue decline."
        },
        SC: {
            pl: "Zależność od kluczowych współpracowników i podwykonawców wpływa na ciągłość realizacji usług. Opóźnienia lub niska jakość pracy partnerów zewnętrznych mogą obniżyć poziom obsługi klienta i ograniczyć utrzymanie kontraktów.",
            en: "Dependence on key collaborators and subcontractors affects service continuity. Delays or poor performance by external partners may reduce service quality and limit client retention."
        }
    }
};

/**
 * Get risk intro for a specific industry and pillar
 * @param {string} industryCode - Industry code
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} lang - Language (pl or en)
 * @returns {string|null} Risk intro text
 */
function getIndustryRiskIntro(industryCode, pillar, lang = 'pl') {
    const industry = INDUSTRY_RISK_INTRO[industryCode];
    if (!industry) return null;

    const pillarData = industry[pillar];
    if (!pillarData) return null;

    return pillarData[lang] || pillarData['en'];
}

module.exports = {
    INDUSTRY_RISK_INTRO,
    getIndustryRiskIntro
};
