/**
 * Industry-specific TOP 3 Risk Comments
 * Auto-generated from COMMENTS.md
 *
 * Structure: industry → pillar → riskType → state → { pl, en }
 */

const INDUSTRY_TOP_RISKS = {
    construction: {
        E: {
            Business: {
                green: {
                    pl: "Koszty materiałów, zużycie energii na placu budowy oraz zgodność z dokumentacją projektową są pod bieżącą kontrolą kierownictwa kontraktu. Odchylenia mieszczą się w założonym budżecie i nie wpływają na marżę projektu, o ile utrzymana zostaje dyscyplina kosztowa i nadzór nad zamówieniami.",
                    pl: "Koszty materiałów, zużycie energii na placu budowy oraz zgodność z dokumentacją projektową są pod bieżącą kontrolą kierownictwa kontraktu. Odchylenia mieszczą się w założonym budżecie i nie wpływają na marżę projektu, o ile utrzymana zostaje dyscyplina kosztowa i nadzór nad zamówieniami.",
                    en: "Material costs, energy consumption at the construction site, and compliance with project documentation are under the ongoing supervision of contract management. Deviations remain within the assumed budget and do not affect the project margin, provided that cost discipline and procurement oversight are maintained."
                },
                yellow: {
                    pl: "Wzrost cen stali, betonu lub paliwa do maszyn budowlanych może zwiększyć koszt realizacji robót. Przy kontrakcie ryczałtowym firma ponosi to ryzyko, co bezpośrednio obniża marżę projektu i ogranicza przestrzeń na nieprzewidziane wydatki.",
                    en: "An increase in the prices of steel, concrete, or fuel for construction machinery may raise the cost of executing the works. Under a lump-sum contract, the company bears this risk, which directly reduces the project margin and limits flexibility for unforeseen expenses."
                },
                orange: {
                    pl: "Znaczące przekroczenie kosztów materiałów lub błędy w dokumentacji technicznej mogą doprowadzić do trwałego przekroczenia budżetu projektu. Skutkiem jest spadek rentowności kontraktu, napięcia w przepływach pieniężnych oraz ryzyko sporów finansowych z kontrahentem.",
                    en: "Significant overruns in material costs or errors in technical documentation may lead to a permanent budget overrun of the project. The consequences include reduced contract profitability, pressure on cash flows, and the risk of financial disputes with the counterparty."
                },
                critical: {
                    pl: "Brak kontroli nad kosztami materiałów, energii oraz zmianami projektowymi może doprowadzić do utraty rentowności całego kontraktu i zagrozić płynności finansowej projektu. W skrajnym przypadku może to oznaczać kary umowne, utratę kontraktu i bezpośredni spadek przychodów przy utrzymaniu kosztów stałych.",
                    en: "Lack of control over material costs, energy consumption, and design changes may lead to the loss of profitability of the entire contract and threaten the project’s financial liquidity. In extreme cases, this may result in contractual penalties, loss of the contract, and a direct decline in revenue while fixed costs remain in place."
                }
            },
            Reputation: {
                green: {
                    pl: "Realizacja robót przebiega zgodnie z harmonogramem i budżetem, a kontrola kosztów materiałów oraz jakości wykonania jest stabilna. Firma utrzymuje wiarygodność w oczach kontrahentów i nie traci pozycji przy ubieganiu się o kolejne zlecenia.",
                    en: "Project execution remains aligned with schedule and budget, with stable control over material costs and workmanship quality. The company maintains credibility with contractors and preserves its position in future tenders."
                },
                yellow: {
                    pl: "Pojawiające się odchylenia kosztowe lub drobne korekty harmonogramu mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się problemy obniżają wiarygodność firmy i utrudniają pozyskiwanie kolejnych kontraktów.",
                    en: "Emerging cost deviations or minor schedule adjustments may raise concerns on the client's side. Repeated issues reduce company credibility and make winning future contracts more difficult."
                },
                orange: {
                    pl: "Znaczące przekroczenia kosztów lub poważne błędy w realizacji robót mogą podważyć zaufanie kontrahenta. Negatywna ocena jakości lub nieterminowości prowadzi do utraty referencji i ogranicza możliwość pozyskiwania kolejnych projektów.",
                    en: "Significant cost overruns or serious deficiencies in the execution of works may undermine the counterparty's trust. A negative assessment of quality or timeliness leads to the loss of references and limits the ability to secure future projects."
                },
                critical: {
                    pl: "Trwałe przekroczenia budżetu, poważne uchybienia jakościowe lub niedotrzymanie terminów mogą doprowadzić do utraty zaufania kluczowych kontrahentów. W skrajnym przypadku oznacza to wykluczenie z przyszłych przetargów oraz trwałe ograniczenie możliwości pozyskiwania nowych kontraktów.",
                    en: "Persistent budget overruns, serious quality deficiencies, or failure to meet deadlines may result in the loss of trust of key counterparties. In extreme cases, this may lead to exclusion from future tenders and a permanent limitation in the ability to secure new contracts."
                }
            },
            Operational: {
                green: {
                    pl: "Realizacja robót przebiega zgodnie z harmonogramem, a dostawy materiałów i praca brygad są skoordynowane. Ewentualne zakłócenia mają charakter incydentalny i nie powodują przestojów na placu budowy.",
                    en: "Construction works are progressing according to schedule, with coordinated material deliveries and crew availability. Any disruptions are incidental and do not result in downtime on site."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach materiałów lub krótkotrwała niedostępność sprzętu mogą zakłócić harmonogram prac. Pojedyncze przestoje brygad wydłużają czas realizacji i wymagają korekt w organizacji robót.",
                    en: "Delays in material deliveries or temporary equipment unavailability may disrupt the work schedule. Isolated crew downtime extends project duration and requires adjustments in site organization."
                },
                orange: {
                    pl: "Powtarzające się braki materiałowe, awarie maszyn lub nieskoordynowana praca podwykonawców mogą doprowadzić do istotnego opóźnienia harmonogramu. Zakłócenia robót generują przestoje brygad i utrudniają utrzymanie ciągłości realizacji projektu.",
                    en: "Repeated material shortages, equipment failures, or poorly coordinated subcontractors may lead to significant schedule delays. Work disruptions generate crew downtime and compromise project continuity."
                },
                critical: {
                    pl: "Brak ciągłości dostaw, poważne awarie sprzętu lub długotrwałe wstrzymanie robót mogą doprowadzić do zatrzymania prac na budowie. W skrajnym przypadku oznacza to utratę kontroli nad harmonogramem, paraliż operacyjny projektu oraz konieczność reorganizacji robót i poniesienia dodatkowych kosztów przywrócenia prac.",
                    en: "Supply interruptions, major equipment failures, or prolonged work suspension may result in a complete halt of construction activities. In extreme cases, this leads to loss of schedule control, operational paralysis of the project, and the need for project reorganization with additional recovery costs."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Dostępność wykwalifikowanych pracowników oraz stabilna współpraca z podwykonawcami pozwalają utrzymać tempo robót i kontrolę kosztów osobowych. Sporadyczne incydenty BHP nie wpływają istotnie na realizację kontraktu ani jego rentowność.",
                    en: "The availability of qualified workers and stable cooperation with subcontractors allow for maintaining the pace of works and controlling labor costs. Occasional health and safety incidents do not materially affect contract execution or its profitability."
                },
                yellow: {
                    pl: "Ograniczona dostępność wykwalifikowanych pracowników lub wzrost stawek podwykonawców może zwiększyć koszt realizacji robót. W dłuższej perspektywie obniża to marżę projektu i może wymagać renegocjacji zakresu prac lub przesunięcia harmonogramu.",
                    en: "Limited availability of qualified workers or an increase in subcontractor rates may raise the cost of executing the works. In the longer term, this reduces the project margin and may require renegotiation of the scope of work or adjustments to the schedule."
                },
                orange: {
                    pl: "Braki kadrowe, częste zmiany podwykonawców lub poważne naruszenia zasad BHP mogą znacząco podnieść koszt realizacji inwestycji. Skutkiem jest spadek rentowności kontraktu oraz ryzyko naliczenia kar za niewywiązanie się z warunków umowy.",
                    en: "Workforce shortages, frequent changes of subcontractors, or serious health and safety violations may significantly increase the cost of project execution. The consequences include reduced contract profitability and the risk of penalties for failure to meet contractual terms."
                },
                critical: {
                    pl: "Utrata kluczowych brygad, poważny wypadek na budowie lub zerwanie współpracy z głównym podwykonawcą mogą zagrozić realizacji kontraktu. W skrajnym przypadku może to doprowadzić do utraty kontraktu i trwałego osłabienia wyniku finansowego firmy.",
                    en: "Loss of key crews, a serious accident on the construction site, or termination of cooperation with the main subcontractor may jeopardize contract execution. In extreme cases, this may lead to the loss of the contract and a lasting deterioration of the company's financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Stabilna kadra, przestrzeganie zasad BHP oraz sprawdzona współpraca z podwykonawcami wzmacniają postrzeganie firmy jako rzetelnego partnera. Pojedyncze incydenty nie wpływają istotnie na relacje z kontrahentami ani ocenę współpracy.",
                    en: "A stable workforce, compliance with health and safety regulations, and proven cooperation with subcontractors strengthen the company's perception as a reliable partner. Isolated incidents do not materially affect relationships with counterparties or the overall assessment of cooperation."
                },
                yellow: {
                    pl: "Częstsza rotacja brygad, drobne naruszenia zasad BHP lub niestabilność podwykonawców mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się problemy osłabiają zaufanie i utrudniają budowanie długofalowych relacji biznesowych.",
                    en: "Increased crew turnover, minor safety breaches, or unstable subcontractor performance may raise concerns on the client's side. Repeated issues weaken trust and complicate long-term business relationships."
                },
                orange: {
                    pl: "Poważne naruszenia zasad BHP, konflikty z podwykonawcami lub niska jakość pracy brygad mogą podważyć wiarygodność firmy na budowie. Negatywna ocena współpracy ogranicza możliwość uzyskania rekomendacji i udziału w kolejnych projektach.",
                    en: "Serious safety breaches, subcontractor disputes, or poor crew performance may undermine the company's credibility on site. Negative cooperation assessments limit the ability to obtain references and participate in future projects."
                },
                critical: {
                    pl: "Wypadek śmiertelny, poważne naruszenia zasad bezpieczeństwa lub zerwanie współpracy z kluczowym podwykonawcą mogą doprowadzić do utraty zaufania kontrahentów. W skrajnym przypadku oznacza to wykluczenie z przyszłych realizacji i trwałe ograniczenie możliwości pozyskiwania nowych kontraktów.",
                    en: "A fatal accident, serious safety violations, or termination of cooperation with a key subcontractor may result in loss of contractor trust. In extreme cases, this leads to exclusion from future projects and long-term limitations in securing new contracts."
                }
            },
            Operational: {
                green: {
                    pl: "Brygady pracują przy pełnym obłożeniu, a współpraca z podwykonawcami jest stabilna. Sporadyczne nieobecności lub drobne incydenty BHP nie zakłócają organizacji pracy ani harmonogramu projektu.",
                    en: "Crews operate at full capacity, and cooperation with subcontractors remains stable. Occasional absences or minor safety incidents do not disrupt work organization or the project schedule."
                },
                yellow: {
                    pl: "Przejściowe niedobory kadry lub rotacja podwykonawców mogą spowolnić postęp robót. Zastępowanie pracowników wymaga reorganizacji prac i korekt harmonogramu.",
                    en: "Temporary labor shortages or subcontractor turnover may slow down work progress. Replacing crew members requires work reorganization and schedule adjustments."
                },
                orange: {
                    pl: "Znaczące niedobory kadrowe, konflikty z podwykonawcami lub poważne naruszenia zasad bezpieczeństwa mogą doprowadzić do wstrzymania części robót. Zakłócenia organizacyjne utrudniają utrzymanie ciągłości prac i destabilizują realizację projektu.",
                    en: "Significant labor shortages, subcontractor disputes, or serious safety breaches may lead to suspension of part of the works. Organizational disruptions compromise work continuity and destabilize project execution."
                },
                critical: {
                    pl: "Poważny wypadek na budowie, decyzja organu nadzoru o wstrzymaniu prac lub nagłe odejście kluczowych brygad mogą całkowicie zatrzymać realizację robót. W skrajnym przypadku oznacza to utratę kontroli nad harmonogramem i konieczność odbudowy organizacji pracy od podstaw.",
                    en: "A major site accident, an authority's decision to suspend works, or sudden loss of key crews may completely halt construction activities. In extreme cases, this results in loss of schedule control and the need to rebuild work organization from scratch."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Dokumentacja projektowa, odbiory etapowe oraz rozliczenia z kontrahentem są prowadzone zgodnie z warunkami umowy. Ewentualne korekty formalne nie wpływają na płatności ani rentowność kontraktu.",
                    en: "Project documentation, stage approvals, and settlements with the contractor are handled in accordance with contractual terms. Any formal corrections do not affect payments or contract profitability."
                },
                yellow: {
                    pl: "Nieścisłości w dokumentacji, opóźnienia w odbiorach lub niepełne rozliczenia mogą przesunąć termin płatności. W konsekwencji pogarsza się płynność finansowa projektu i rośnie ryzyko sporów rozliczeniowych.",
                    en: "Inconsistencies in documentation, delays in approvals, or incomplete settlements may postpone payments. As a result, project cash flow weakens and the risk of financial disputes increases."
                },
                orange: {
                    pl: "Istotne braki formalne, błędy w umowie lub niezgodność zakresu prac z zapisami kontraktu mogą skutkować odmową odbioru robót lub wstrzymaniem płatności. Skutkiem jest realne zagrożenie dla rentowności projektu oraz napięcia w przepływach pieniężnych firmy.",
                    en: "Material formal deficiencies, contractual errors, or inconsistencies between scope and contract terms may result in refusal of work acceptance or payment suspension. This creates a real threat to project profitability and company cash flow."
                },
                critical: {
                    pl: "Poważne naruszenia warunków umowy, brak wymaganych decyzji administracyjnych lub istotne uchybienia formalne mogą doprowadzić do rozwiązania kontraktu. W skrajnym przypadku oznacza to utratę części należnych płatności lub roszczeń kontraktowych oraz bezpośredni spadek przychodów firmy.",
                    en: "Serious breaches of contractual terms, lack of required administrative decisions, or major formal deficiencies may lead to contract termination. In extreme cases, this results in loss of part of the due payments or contractual claims and a direct decline in company revenue."
                }
            },
            Reputation: {
                green: {
                    pl: "Dokumentacja projektowa, odbiory oraz rozliczenia są prowadzone zgodnie z warunkami umowy i obowiązującymi przepisami. Kontrole formalne nie wykazują istotnych uchybień, co wzmacnia wiarygodność firmy jako partnera kontraktowego.",
                    en: "Project documentation, approvals, and settlements are handled in line with contractual terms and applicable regulations. Formal inspections reveal no material deficiencies, reinforcing the company's credibility as a contractual partner."
                },
                yellow: {
                    pl: "Drobne nieścisłości w dokumentacji lub opóźnienia w formalnych odbiorach mogą budzić zastrzeżenia po stronie zamawiającego. Powtarzające się uchybienia osłabiają postrzeganie firmy jako podmiotu rzetelnie zarządzającego kontraktem.",
                    en: "Minor inconsistencies in documentation or delays in formal approvals may raise concerns on the client's side. Repeated deficiencies weaken the perception of the company as a reliably managed contractor."
                },
                orange: {
                    pl: "Istotne braki formalne, niezgodność zakresu prac z umową lub negatywne wyniki kontroli mogą podważyć wiarygodność firmy w oczach kontrahentów. Taka sytuacja ogranicza możliwość uzyskiwania rekomendacji i udziału w kolejnych postępowaniach przetargowych.",
                    en: "Material formal deficiencies, scope inconsistencies, or negative inspection outcomes may undermine the company's credibility among contractors. This situation limits the ability to obtain references and participate in future tender procedures."
                },
                critical: {
                    pl: "Poważne naruszenia warunków umowy, sankcje administracyjne lub publiczne spory kontraktowe mogą doprowadzić do utraty zaufania kluczowych partnerów. W skrajnym przypadku oznacza to wykluczenie z przyszłych przetargów oraz trwałe osłabienie pozycji rynkowej firmy.",
                    en: "Serious contractual breaches, administrative sanctions, or public contract disputes may lead to loss of trust among key partners. In extreme cases, this results in exclusion from future tenders and long-term weakening of the company’s market position."
                }
            },
            Operational: {
                green: {
                    pl: "Dokumentacja budowy, dziennik budowy oraz wymagane zgłoszenia są prowadzone zgodnie z przepisami. Kontrole nadzoru nie wykazują uchybień, a odbiory etapowe przebiegają bez zakłóceń.",
                    en: "Construction documentation, site logbooks, and required notifications are maintained in compliance with regulations. Supervisory inspections reveal no deficiencies, and stage approvals proceed without disruption."
                },
                yellow: {
                    pl: "Drobne braki formalne lub opóźnienia w uzupełnianiu dokumentacji mogą spowolnić procedury odbiorowe. Konieczność wyjaśnień lub uzupełnień wydłuża proces administracyjny i wpływa na organizację robót.",
                    en: "Minor formal deficiencies or delays in documentation updates may slow down approval procedures. The need for clarifications or corrections extends administrative processes and affects work organization."
                },
                orange: {
                    pl: "Istotne niezgodności formalne, brak wymaganych uzgodnień lub negatywne wyniki kontroli mogą doprowadzić do wstrzymania części robót. Decyzje organów nadzoru destabilizują harmonogram i utrudniają kontynuację prac.",
                    en: "Material formal inconsistencies, missing required approvals, or negative inspection results may lead to partial suspension of works. Decisions by supervisory authorities destabilize the schedule and hinder project continuation."
                },
                critical: {
                    pl: "Brak wymaganych decyzji administracyjnych, poważne naruszenia przepisów budowlanych lub zakwestionowanie legalności robót mogą skutkować całkowitym wstrzymaniem prac. W skrajnym przypadku oznacza to paraliż realizacji projektu do czasu usunięcia uchybień i przywrócenia formalnej możliwości prowadzenia robót.",
                    en: "Lack of required administrative decisions, serious violations of construction regulations, or challenges to the legality of the works may result in a complete suspension of activities. In extreme cases, this means a paralysis of project execution until the deficiencies are remedied and the formal authorization to carry out the works is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z kluczowymi dostawcami materiałów oraz podwykonawcami branżowymi jest stabilna, a warunki handlowe pozostają przewidywalne i kontrolowane. Realizacja zobowiązań kontraktowych nie wpływa na zakładaną marżę projektu.",
                    en: "Cooperation with key material suppliers and specialist subcontractors remains stable, and commercial terms are predictable and controlled. Contract execution does not affect the planned project margin."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców lub pogorszenie warunków handlowych dostawców może zwiększyć koszt realizacji robót. Przy ograniczonej możliwości przeniesienia kosztów na zamawiającego prowadzi to do obniżenia marży kontraktu.",
                    en: "Rising subcontractor rates or deteriorating supplier terms may increase project execution costs. Limited ability to pass these costs on to the client directly reduces contract margins."
                },
                orange: {
                    pl: "Niewywiązywanie się kluczowych podwykonawców z zakresu prac lub konieczność ich pilnej zmiany może generować dodatkowe koszty i zaburzyć plan finansowy kontraktu. Skutkiem jest spadek rentowności projektu oraz utrata części zakładanej marży.",
                    en: "Failure of key subcontractors to deliver their scope or the urgent need to replace them may generate additional costs and disrupt the project’s financial plan. This results in reduced profitability and loss of part of the expected margin."
                },
                critical: {
                    pl: "Utrata kluczowego podwykonawcy branżowego lub zerwanie umowy przez strategicznego dostawcę może uniemożliwić realizację części kontraktu w zakładanym zakresie finansowym. W skrajnym przypadku prowadzi to do istotnych strat, utraty części przychodów oraz trwałego pogorszenia wyniku finansowego firmy.",
                    en: "Loss of a key specialist subcontractor or termination of an agreement by a strategic supplier may prevent execution of part of the contract within the planned financial framework. In extreme cases, this leads to significant losses, partial revenue loss, and longterm deterioration of the company’s financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z podwykonawcami i dostawcami jest stabilna, a jakość ich pracy spełnia wymagania kontraktowe. Nie występują sytuacje podważające wiarygodność firmy jako koordynatora projektu.",
                    en: "Cooperation with subcontractors and suppliers remains stable, and their work quality meets contractual requirements. No issues arise that would undermine the company's credibility as a project coordinator."
                },
                yellow: {
                    pl: "Pojedyncze problemy z jakością pracy podwykonawców lub opóźnienia po stronie dostawców mogą budzić zastrzeżenia kontrahentów. Powtarzalne sytuacje tego typu osłabiają postrzeganie firmy jako podmiotu skutecznie nadzorującego łańcuch wykonawczy.",
                    en: "Isolated quality issues with subcontractors or supplier delays may raise concerns among contracting parties. Repeated incidents weaken the perception of the company as effectively supervising its execution chain."
                },
                orange: {
                    pl: "Poważne problemy z kluczowymi podwykonawcami, w tym niewywiązywanie się z zakresu prac, mogą podważyć zaufanie do zdolności firmy do realizacji inwestycji. Skutkiem może być negatywna ocena ze strony zamawiającego oraz ograniczenie udziału w kolejnych procesach kwalifikacyjnych.",
                    en: "Serious issues with key subcontractors, including failure to deliver agreed scope, may undermine trust in the company’s execution capability. This may result in negative client evaluation and limited participation in future qualification procedures."
                },
                critical: {
                    pl: "Utrata kontroli nad kluczowymi partnerami zewnętrznymi lub publiczne spory z podwykonawcami mogą trwale podważyć wiarygodność firmy na rynku. W skrajnym przypadku prowadzi to do wykluczenia z przyszłych przetargów oraz utraty pozycji konkurencyjnej w branży.",
                    en: "Loss of control over key external partners or public disputes with subcontractors may permanently damage the company’s market credibility. In extreme cases, this leads to exclusion from future tenders and loss of competitive positioning in the sector."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z podwykonawcami i dostawcami kluczowych materiałów przebiega zgodnie z harmonogramem. Dostępność zasobów zewnętrznych pozostaje stabilna, a ciągłość realizacji robót jest utrzymana.",
                    en: "Cooperation with subcontractors and suppliers of key materials proceeds in accordance with the schedule. The availability of external resources remains stable, and the continuity of project execution is maintained."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw lub przesunięcia w dostępności podwykonawców mogą wymagać korekty harmonogramu. Zakłócenia te nie zatrzymują robót, lecz zwiększają presję organizacyjną na budowie.",
                    en: "Isolated delivery delays or shifts in subcontractor availability may require schedule adjustments. These disruptions do not stop the works but increase organizational pressure on site."
                },
                orange: {
                    pl: "Niewywiązywanie się kluczowych podwykonawców z terminów lub brak dostępu do specjalistycznych ekip może doprowadzić do istotnych opóźnień etapów prac. Skutkiem jest destabilizacja harmonogramu i ryzyko kumulacji robót w kolejnych fazach projektu.",
                    en: "Failure of key subcontractors to meet deadlines or lack of access to specialized crews may lead to significant delays in work stages. This results in schedule destabilization and risk of work accumulation in subsequent project phases."
                },
                critical: {
                    pl: "Utrata kluczowego podwykonawcy branżowego lub zerwanie ciągłości dostaw strategicznych elementów może całkowicie zatrzymać realizację części robót. W skrajnym przypadku oznacza to konieczność reorganizacji projektu oraz poniesienie kosztów przywrócenia ciągłości operacyjnej.",
                    en: "The loss of a key specialist subcontractor or a disruption in the supply of strategic components may completely halt the execution of certain works. In extreme cases, this may require project reorganization and the incurrence of costs to restore operational continuity."
                }
            }
        }
    },
    energy_resources: {
        E: {
            Business: {
                green: {
                    pl: "Koszt paliwa, efektywność instalacji oraz poziom emisji pozostają pod kontrolą, a produkcja energii lub wydobycie surowca odbywa się zgodnie z założeniami finansowymi. Rentowność projektów nie jest zagrożona przy obecnych warunkach rynkowych i regulacyjnych.",
                    en: "Fuel costs, plant efficiency, and emission levels remain under control, and energy generation or resource extraction is carried out in line with financial assumptions. Project profitability is not threatened under current market and regulatory conditions."
                },
                yellow: {
                    pl: "Wzrost kosztu paliwa, surowca lub opłat za emisję może ograniczyć marżę na sprzedaży energii lub wydobycia. Przy częściowej regulacji cen sprzedaży możliwości przeniesienia kosztów na odbiorców są ograniczone, co bezpośrednio obniża marżę operacyjną.",
                    en: "An increase in the cost of fuel, raw materials, or emission charges may reduce the margin on energy sales or extraction activities. Where sales prices are partially regulated, the ability to pass costs on to customers is limited, which directly reduces the operating margin."
                },
                orange: {
                    pl: "Znaczący wzrost kosztów operacyjnych instalacji lub pogorszenie efektywności wydobycia może trwale obniżyć rentowność aktywów. W modelu kapitałochłonnym ogranicza to możliwość finansowania modernizacji instalacji i nowych inwestycji.",
                    en: "A significant increase in the operating costs of installations or a decline in extraction efficiency may permanently reduce asset profitability. In a capital-intensive model, this limits the ability to finance installation upgrades and new investments."
                },
                critical: {
                    pl: "Gwałtowny wzrost kosztów paliwa, surowca lub opłat regulacyjnych przy jednoczesnym ograniczeniu cen sprzedaży może doprowadzić do utraty rentowności instalacji. W skrajnym przypadku oznacza to wstrzymanie części działalności, utratę przychodów oraz istotne pogorszenie wyniku finansowego Twojej firmy.",
                    en: "A sharp increase in fuel, raw material, or regulatory costs combined with restrictions on sales prices may lead to the loss of installation profitability. In extreme cases, this may result in the suspension of part of the operations, loss of revenue, and a significant deterioration in your company's financial performance."
                }
            },
            Reputation: {
                green: {
                    pl: "Instalacje pracują stabilnie, a poziom emisji i zużycia paliwa mieści się w obowiązujących normach. Nie występują zdarzenia mogące podważyć wiarygodność firmy jako odpowiedzialnego operatora.",
                    en: "Production assets operate stably, and emission levels and fuel consumption remain within regulatory limits. No incidents occur that could undermine the company’s credibility as a responsible operator."
                },
                yellow: {
                    pl: "Pojedyncze przekroczenia parametrów emisji lub krótkotrwałe awarie instalacji mogą budzić zainteresowanie regulatora i społeczności lokalnej. Powtarzalność takich zdarzeń osłabia postrzeganie firmy jako podmiotu bezpiecznego technologicznie i utrudnia uzyskiwanie zgód administracyjnych w przyszłości.",
                    en: "Isolated emission exceedances or short-term plant failures may attract attention from regulators and local communities. Repeated incidents weaken the perception of the company as technologically reliable and may complicate future administrative approvals."
                },
                orange: {
                    pl: "Poważniejsze awarie instalacji lub istotne przekroczenia limitów emisji mogą wywołać negatywne reakcje regulatora oraz presję społeczną. Skutkiem jest osłabienie pozycji firmy jako stabilnego operatora w sektorze energetycznym lub wydobywczym.",
                    en: "Major plant failures or significant emission limit exceedances may trigger negative regulatory reactions and public pressure. This weakens the company's standing as a stable operator in the energy or extraction sector."
                },
                critical: {
                    pl: "Poważna awaria technologiczna, wypadek przemysłowy lub długotrwałe naruszenie norm środowiskowych mogą trwale podważyć zaufanie regulatora i lokalnego otoczenia. W skrajnym przypadku oznacza to podważenie wiarygodności firmy jako operatora instalacji oraz ograniczenie możliwości prowadzenia działalności, w tym ryzyko cofnięcia decyzji administracyjnych lub koncesji.",
                    en: "A major technological failure, industrial accident, or prolonged environmental non-compliance may permanently damage trust among regulators and local stakeholders. In extreme cases, this may undermine the company’s credibility as a plant operator and restrict operations, including the risk of withdrawal of administrative decisions or licenses."
                }
            },
            Operational: {
                green: {
                    pl: "Instalacje wytwórcze lub wydobywcze pracują stabilnie, a parametry technologiczne pozostają w dopuszczalnych zakresach. Nie występują zakłócenia wpływające na ciągłość produkcji energii lub surowca.",
                    en: "Generation or extraction assets operate stably, and technological parameters remain within acceptable ranges. No disruptions affect continuity of energy production or resource extraction."
                },
                yellow: {
                    pl: "Krótkotrwałe awarie instalacji lub odchylenia parametrów pracy mogą powodować ograniczenie mocy wytwórczej. Zdarzenia te nie zatrzymują działalności, lecz wymagają interwencji technicznej i korekty planów produkcyjnych.",
                    en: "Short-term equipment failures or deviations in operating parameters may reduce production capacity. These events do not stop operations but require technical intervention and adjustment of production plans."
                },
                orange: {
                    pl: "Poważniejsze awarie bloków energetycznych lub infrastruktury wydobywczej mogą doprowadzić do istotnego ograniczenia produkcji. Skutkiem jest destabilizacja planów dostaw oraz ryzyko niedotrzymania umów sprzedaży energii lub dostaw surowca.",
                    en: "More serious failures of power generation units or extraction infrastructure may lead to a significant reduction in production. The consequences include the destabilization of supply plans and the risk of failing to meet energy sales contracts or raw material delivery obligations."
                },
                critical: {
                    pl: "Długotrwała awaria kluczowej instalacji, uszkodzenie infrastruktury przesyłowej lub zatrzymanie wydobycia mogą całkowicie przerwać działalność operacyjną. W skrajnym przypadku oznacza to paraliż produkcji do czasu usunięcia awarii, brak przychodów przy utrzymaniu kosztów stałych instalacji oraz presję na płynność finansową firmy.",
                    en: "A prolonged failure of a key installation, damage to transmission infrastructure, or a suspension of extraction activities may completely disrupt operational activity. In extreme cases, this means a production standstill until the failure is remedied, no revenue while fixed installation costs remain in place, and increased pressure on the company’s financial liquidity."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Dostępność wykwalifikowanych operatorów instalacji, służb utrzymania ruchu oraz specjalistów z uprawnieniami energetycznymi pozostaje stabilna. Rotacja kadry i incydenty BHP nie wpływają istotnie na ciągłość produkcji ani na rentowność prowadzonej działalności.",
                    en: "Availability of qualified plant operators, maintenance crews and licensed technical staff remains stable. Staff turnover and isolated safety incidents do not materially affect production continuity or operating profitability."
                },
                yellow: {
                    pl: "Rosnąca rotacja operatorów lub trudności w pozyskaniu pracowników z wymaganymi uprawnieniami mogą zwiększyć koszty wynagrodzeń i szkoleń. Ograniczona dostępność kadry podnosi presję kosztową i bezpośrednio obniża marżę operacyjną instalacji.",
                    en: "Increasing turnover of plant operators or difficulties in recruiting certified technical staff may raise payroll and training costs. Limited workforce availability creates cost pressure and directly reduces operating margins of the installation."
                },
                orange: {
                    pl: "Niedobór kluczowych specjalistów, utrata uprawnień lub poważne naruszenia zasad BHP mogą ograniczyć zdolność do bezpiecznej eksploatacji instalacji. Skutkiem jest konieczność ograniczenia mocy produkcyjnych, wzrost kosztów operacyjnych oraz realne pogorszenie wyniku finansowego Twojej firmy.",
                    en: "A shortage of key specialists, loss of required certifications, or serious violations of health and safety regulations may limit the ability to operate installations safely. The consequences include the need to reduce production capacity, an increase in operating costs, and a tangible deterioration in your company’s financial performance."
                },
                critical: {
                    pl: "Utrata kluczowej kadry technicznej, cofnięcie uprawnień personelu lub ciężki wypadek przy pracy mogą doprowadzić do wstrzymania części działalności operacyjnej. W skrajnym przypadku oznacza to spadek produkcji, utratę przychodów przy utrzymaniu kosztów stałych oraz istotne zagrożenie dla płynności finansowej firmy.",
                    en: "Loss of key technical staff, withdrawal of mandatory certifications or a severe workplace accident may result in partial suspension of operations. In extreme cases, this leads to reduced output, loss of revenue while fixed costs remain, and significant pressure on the company’s liquidity."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół posiada wymagane uprawnienia, a standardy BHP są konsekwentnie przestrzegane na terenie instalacji. Nie występują zdarzenia podważające wizerunek firmy jako odpowiedzialnego operatora instalacji.",
                    en: "The team holds the required certifications, and health and safety standards are consistently observed at the installation site. There are no incidents that would undermine the company's reputation as a responsible operator of the installation."
                },
                yellow: {
                    pl: "Pojedyncze naruszenia procedur BHP lub zwiększona rotacja personelu mogą budzić zastrzeżenia co do stabilności operacyjnej zespołu. Sytuacje te osłabiają postrzeganie firmy jako podmiotu bezpiecznego technologicznie i utrudniają budowanie zaufania w relacjach z partnerami oraz organami administracji.",
                    en: "Isolated breaches of safety procedures or increased staff turnover may raise concerns about operational stability. Such situations weaken the perception of the company as a technologically safe operator and make it harder to maintain trust with partners and public authorities."
                },
                orange: {
                    pl: "Poważniejsze incydenty BHP, brak kluczowych uprawnień personelu lub problemy z utrzymaniem wyspecjalizowanej kadry mogą podważyć wiarygodność firmy jako operatora instalacji. Skutkiem jest utrata zaufania regulatora, negatywna ocena w procesach administracyjnych oraz osłabienie pozycji w rozmowach z odbiorcami energii lub surowców.",
                    en: "Serious safety incidents, missing mandatory certifications or difficulties in retaining qualified specialists may undermine the company’s credibility as a facility operator. This can lead to reduced trust from regulators, negative administrative assessments and a weaker position in negotiations with energy or commodity customers."
                },
                critical: {
                    pl: "Ciężki wypadek przy pracy, systemowe naruszenia zasad bezpieczeństwa lub utrata kluczowych uprawnień personelu mogą trwale podważyć wiarygodność firmy jako operatora infrastruktury. W skrajnym przypadku prowadzi to do zaostrzonego nadzoru, ograniczenia zakresu działalności oraz ryzyka cofnięcia decyzji administracyjnych lub koncesji.",
                    en: "A severe workplace accident, systemic safety breaches or loss of essential staff certifications may permanently damage the company’s credibility as an infrastructure operator. In extreme cases, this may result in intensified regulatory supervision, restrictions on operations and the risk of revocation of administrative decisions or licenses."
                }
            },
            Operational: {
                green: {
                    pl: "Obsada zmianowa operatorów i służb utrzymania ruchu pozostaje kompletna, a wymagane uprawnienia personelu są aktualne. Nie występują zakłócenia w pracy instalacji wynikające z braków kadrowych ani naruszeń zasad BHP.",
                    en: "Shift staffing of operators and maintenance teams remains complete, and required certifications are up to date. No operational disruptions occur due to workforce shortages or safety breaches."
                },
                yellow: {
                    pl: "Pojedyncze braki kadrowe lub absencje wśród operatorów mogą utrudniać utrzymanie pełnej obsady zmianowej. Skutkiem są okresowe przeciążenia zespołu oraz zwiększone ryzyko błędów operacyjnych wpływających na stabilność pracy instalacji.",
                    en: "Isolated staff shortages or operator absences may make it difficult to maintain full shift coverage. This results in temporary overload of personnel and an increased risk of operational errors affecting plant stability."
                },
                orange: {
                    pl: "Niedobór wykwalifikowanych operatorów lub utrata wymaganych uprawnień może ograniczyć zdolność do prowadzenia instalacji z pełną mocą. Może to wymusić redukcję produkcji, przesunięcie planowanych prac serwisowych oraz zwiększyć ryzyko nieplanowanych przestojów.",
                    en: "A shortage of qualified operators or loss of mandatory certifications may restrict the ability to run the facility at full capacity. This may force output reductions, postponement of planned maintenance and increase the risk of unplanned downtime."
                },
                critical: {
                    pl: "Utrata kluczowej obsady zmianowej, ciężki wypadek przy pracy lub systemowe naruszenia zasad bezpieczeństwa mogą doprowadzić do wstrzymania pracy instalacji. W skrajnym przypadku oznacza to całkowite zatrzymanie produkcji do czasu przywrócenia pełnej obsady i spełnienia wymogów bezpieczeństwa. Oznacza to brak przychodów przy utrzymaniu kosztów stałych instalacji oraz silną presję na płynność finansową Twojej firmy.",
                    en: "The loss of key shift personnel, a serious workplace accident, or systemic safety violations may lead to the suspension of installation operations. In extreme cases, this means a complete halt of production until full staffing levels are restored and safety requirements are met. This results in no revenue while fixed installation costs remain in place, creating significant pressure on your company’s financial liquidity."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Działalność prowadzona jest zgodnie z warunkami koncesji oraz decyzji administracyjnych, a system kontroli wewnętrznej działa skutecznie. Nie występują naruszenia, które mogłyby wpływać na możliwość sprzedaży energii lub surowców ani na stabilność przychodów wynikających z posiadanych koncesji.",
                    en: "Operations are conducted in accordance with the terms of the licenses and administrative decisions, and the internal control system functions effectively. There are no violations that could affect the ability to sell energy or raw materials, nor the stability of revenues arising from the licenses held."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia w raportowaniu do regulatora lub niepełna dokumentacja środowiskowa mogą skutkować dodatkowymi kontrolami. Może to zwiększyć koszty administracyjne oraz ograniczyć elastyczność w prowadzeniu działalności, wpływając na marżę operacyjną.",
                    en: "Isolated deficiencies in regulatory reporting or incomplete environmental documentation may result in additional inspections. This can increase administrative costs and limit operational flexibility, directly affecting operating margins."
                },
                orange: {
                    pl: "Istotne naruszenia warunków koncesji, decyzji środowiskowych lub obowiązków sprawozdawczych mogą skutkować sankcjami finansowymi i ograniczeniem zakresu działalności. Oznacza to ryzyko zmniejszenia wolumenu sprzedaży energii lub surowca oraz pogorszenie wyniku finansowego Twojej firmy.",
                    en: "Significant breaches of license conditions, environmental decisions or reporting obligations may lead to financial penalties and restrictions on operations. This creates a risk of reduced sales volumes and deterioration of the company’s financial performance."
                },
                critical: {
                    pl: "Poważne naruszenie warunków koncesji, cofnięcie decyzji administracyjnej lub negatywny wynik kontroli regulatora mogą doprowadzić do zawieszenia albo utraty prawa do prowadzenia działalności. W skrajnym przypadku oznacza to utratę części należnych przychodów, konieczność wstrzymania sprzedaży energii lub surowca oraz istotne zagrożenie dla stabilności finansowej Twojej firmy.",
                    en: "Serious breach of license conditions, withdrawal of an administrative decision or a negative outcome of a regulatory inspection may lead to suspension or loss of the right to operate. In extreme cases, this results in loss of entitled revenues, interruption of energy or commodity sales and a significant threat to the company's financial stability."
                }
            },
            Reputation: {
                green: {
                    pl: "Działalność prowadzona jest zgodnie z warunkami koncesji oraz decyzjami administracyjnymi, a raportowanie do regulatora jest terminowe i kompletne. Nie występują zdarzenia podważające wiarygodność firmy w relacjach z organami nadzoru.",
                    en: "Operations comply with license conditions and administrative decisions, and regulatory reporting is timely and complete. No events occur that would undermine the company's credibility in relations with supervisory authorities."
                },
                yellow: {
                    pl: "Pojedyncze nieścisłości w sprawozdawczości lub opóźnienia w przekazywaniu danych do regulatora mogą budzić zastrzeżenia podczas kontroli. Osłabia to postrzeganie firmy jako podmiotu rzetelnie wywiązującego się z obowiązków koncesyjnych.",
                    en: "Isolated inconsistencies in reporting or delays in submitting data to the regulator may raise concerns during inspections. This weakens the perception of the company as a reliable license holder fulfilling its regulatory obligations."
                },
                orange: {
                    pl: "Istotne uchybienia w realizacji warunków koncesji lub decyzji środowiskowych mogą skutkować negatywną oceną ze strony organów nadzoru. Może to podważyć wiarygodność firmy jako operatora instalacji oraz opóźnić modernizację instalacji i realizację nowych inwestycji.",
                    en: "Material breaches in the fulfillment of license conditions or environmental decisions may result in a negative assessment by supervisory authorities. This may undermine the company’s credibility as an installation operator and delay installation upgrades as well as the implementation of new investments."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów, decyzji administracyjnych lub warunków koncesji mogą doprowadzić do utraty zaufania regulatora i zaostrzonego nadzoru. W skrajnym przypadku oznacza to trwałe podważenie wiarygodności firmy, ryzyko cofnięcia koncesji oraz wykluczenie z realizacji nowych projektów energetycznych.",
                    en: "Serious violations of regulations, administrative decisions or license conditions may lead to loss of trust from the regulator and intensified supervision. In extreme cases, this may permanently damage the company’s credibility, create a risk of license revocation and exclude the company from new energy projects."
                }
            },
            Operational: {
                green: {
                    pl: "Wszystkie wymagane decyzje administracyjne, pozwolenia oraz warunki koncesji są aktualne i spełniane. Nie występują ograniczenia formalne wpływające na bieżące prowadzenie instalacji ani realizację planowanych prac.",
                    en: "All required administrative decisions, permits and license conditions are valid and fulfilled. No formal restrictions affect ongoing plant operations or planned activities."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub opóźnienia w aktualizacji dokumentacji mogą skutkować dodatkowymi kontrolami regulatora. Może to spowolnić proces zatwierdzania zmian technicznych lub planowanych modernizacji instalacji.",
                    en: "Isolated formal deficiencies or delays in updating documentation may trigger additional regulatory inspections. This may slow down approval of technical changes or planned facility upgrades."
                },
                orange: {
                    pl: "Istotne braki w spełnianiu warunków koncesji lub decyzji środowiskowych mogą doprowadzić do czasowego ograniczenia zakresu działalności. Skutkiem jest wstrzymanie części prac, opóźnienie inwestycji oraz zakłócenie harmonogramu eksploatacji instalacji.",
                    en: "Significant non-compliance with license conditions or environmental decisions may lead to temporary restrictions on operations. This may result in suspension of certain activities, delays in investments and disruption of the facility’s operational schedule."
                },
                critical: {
                    pl: "Poważne naruszenia decyzji administracyjnych lub warunków koncesji mogą skutkować zawieszeniem działalności przez organ nadzoru. W skrajnym przypadku oznacza to wstrzymanie eksploatacji instalacji do czasu usunięcia nieprawidłowości i przywrócenia formalnej możliwości prowadzenia działalności. W praktyce oznacza to brak przychodów przy utrzymaniu kosztów stałych instalacji oraz silną presję na płynność finansową Twojej firmy.",
                    en: "Serious violations of administrative decisions or license conditions may result in the suspension of operations by the supervisory authority. In extreme cases, this means the suspension of installation operations until the irregularities are remedied and the formal authorization to conduct activities is restored. In practice, this results in no revenue while fixed installation costs remain in place, creating significant pressure on your company’s financial liquidity."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Dostawy paliwa, surowców oraz usług serwisowych realizowane są zgodnie z umowami długoterminowymi, a warunki handlowe pozostają stabilne. Nie występują czynniki zewnętrzne, które mogłyby istotnie wpłynąć na koszt wytwarzania energii ani na rentowność działalności.",
                    en: "Fuel, raw material and maintenance services are delivered in line with long-term contracts, and commercial terms remain stable. No external factors materially affect production costs or overall profitability."
                },
                yellow: {
                    pl: "Wzrost cen paliwa, surowca lub usług serwisowych może zwiększyć koszt eksploatacji instalacji. Przy ograniczonej możliwości przeniesienia tych kosztów na odbiorców oznacza to bezpośrednie obniżenie marży operacyjnej.",
                    en: "Rising prices of fuel, raw materials or maintenance services may increase operating costs of the facility. If cost pass-through to customers is limited, this directly reduces operating margins."
                },
                orange: {
                    pl: "Istotne zakłócenia w dostawach paliwa lub zerwanie umów z kluczowymi dostawcami mogą wymusić zakup surowca po wyższych cenach rynkowych. Skutkiem jest trwałe podniesienie kosztu wytwarzania energii oraz trwałe obniżenie marży operacyjnej instalacji.",
                    en: "Significant disruptions in fuel supplies or the termination of contracts with key suppliers may force the purchase of raw materials at higher market prices. The result is a permanent increase in the cost of energy generation and a lasting reduction in the installation’s operating margin."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa lub surowca, brak alternatywnych źródeł zaopatrzenia albo gwałtowny wzrost cen może doprowadzić do nieopłacalności dalszej produkcji. W skrajnym przypadku oznacza to konieczność ograniczenia sprzedaży energii lub surowca, spadek przychodów przy utrzymaniu kosztów stałych instalacji oraz istotne zagrożenie dla płynności finansowej Twojej firmy.",
                    en: "Loss of a key fuel or raw material supplier, lack of alternative sourcing or a sharp price surge may render continued production economically unviable. In extreme cases, this results in reduced sales volumes, loss of revenue while fixed plant costs remain, and significant pressure on the company’s liquidity."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami paliwa, surowców oraz firmami serwisowymi przebiega stabilnie i zgodnie z zawartymi umowami. Nie występują spory kontraktowe, reklamacje odbiorców ani zakłócenia dostaw podważające wiarygodność firmy jako podmiotu skutecznie zarządzającego łańcuchem zaopatrzenia.",
                    en: "Cooperation with fuel suppliers, raw material providers, and service companies proceeds in a stable manner and in accordance with the concluded agreements. There are no contractual disputes, customer complaints, or supply disruptions that would undermine the company’s credibility as an entity effectively managing its supply chain."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw paliwa lub problemy z realizacją usług serwisowych mogą budzić zastrzeżenia co do stabilności łańcucha zaopatrzenia. Osłabia to postrzeganie firmy jako operatora zapewniającego ciągłość i przewidywalność dostaw energii lub surowca.",
                    en: "Isolated fuel delivery delays or issues with maintenance service providers may raise concerns about supply chain stability. This weakens the perception of the company as an operator ensuring continuity and predictability of energy or commodity supply."
                },
                orange: {
                    pl: "Poważniejsze zakłócenia w relacjach z kluczowymi dostawcami paliwa lub częste zmiany partnerów serwisowych mogą podważyć wiarygodność firmy jako stabilnego producenta energii. Może to skutkować negatywną oceną ze strony odbiorców oraz utrudnić budowanie długoterminowych kontraktów sprzedażowych.",
                    en: "Significant disruptions in relationships with key fuel suppliers or frequent changes of service partners may undermine the company’s credibility as a stable energy producer. This may lead to negative assessments by customers and make it more difficult to secure long-term sales contracts."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa, publiczny spór z partnerem strategicznym lub brak kontroli nad łańcuchem zaopatrzenia mogą trwale podważyć wiarygodność firmy jako operatora instalacji. W skrajnym przypadku oznacza to utratę zaufania odbiorców, wykluczenie z negocjacji nowych umów oraz ograniczenie możliwości dalszego rozwoju działalności.",
                    en: "Loss of a key fuel supplier, a public dispute with a strategic partner or lack of control over the supply chain may permanently damage the company’s credibility as a facility operator. In extreme cases, this results in loss of customer trust, exclusion from new contract negotiations and limited opportunities for further business development."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy paliwa, surowców oraz usług serwisowych przebiegają zgodnie z harmonogramem, a współpraca z partnerami zewnętrznymi jest stabilna. Instalacja pracuje bez redukcji mocy, bez konieczności zmiany grafików pracy oraz bez uruchamiania rezerwowych źródeł zasilania.",
                    en: "Fuel, raw material and maintenance deliveries are carried out according to schedule, and cooperation with external partners remains stable. The installation operates without capacity reduction, schedule adjustments or activation of backup sources."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach paliwa lub ograniczona dostępność usług serwisowych mogą czasowo zaburzyć harmonogram pracy instalacji. Wymaga to reorganizacji produkcji i zwiększonego nadzoru operacyjnego, aby uniknąć krótkotrwałych przestojów.",
                    en: "Delays in fuel deliveries or limited availability of maintenance services may temporarily disrupt the plant's operating schedule. This requires production reorganization and increased operational oversight to avoid short-term downtime."
                },
                orange: {
                    pl: "Poważne zakłócenia w dostawach surowca lub niewywiązywanie się kluczowego partnera serwisowego z umowy mogą doprowadzić do wymuszonego ograniczenia mocy produkcyjnych. Skutkiem jest niestabilność pracy instalacji oraz ryzyko niedotrzymania umów sprzedaży energii lub dostaw surowca.",
                    en: "Significant disruptions in raw material deliveries or failure of a key maintenance partner to meet contractual obligations may force a reduction in production capacity. This results in unstable plant operations and the risk of failing to meet energy sales or raw material supply agreements."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy paliwa lub długotrwałe przerwanie łańcucha dostaw może doprowadzić do całkowitego zatrzymania pracy instalacji. W praktyce oznacza to wstrzymanie produkcji, utratę zdolności wytwórczej oraz konieczność uruchomienia procedur awaryjnych do czasu przywrócenia dostaw.",
                    en: "The loss of a key fuel supplier or a prolonged disruption of the supply chain may lead to a complete shutdown of plant operations. In practice, this means halting production, losing generation capacity and activating emergency procedures until deliveries are restored."
                }
            }
        }
    },
    industrial_production: {
        E: {
            Business: {
                green: {
                    pl: "Koszty energii, surowców oraz wydajność linii produkcyjnych pozostają pod kontrolą, a odpad technologiczny utrzymuje się na zakładanym poziomie. Produkcja realizowana jest bez przekroczeń kosztów jednostkowych, co pozwala utrzymać planowaną marżę na wyrobach.",
                    en: "Energy and raw material costs as well as production line efficiency remain under control, and technological waste stays within planned limits. Production is carried out without exceeding unit costs, allowing the planned product margin to be maintained."
                },
                yellow: {
                    pl: "Wzrost cen energii lub pogorszenie jakości surowca może zwiększyć poziom odpadu oraz obniżyć wydajność linii. Skutkuje to podniesieniem kosztu jednostkowego produkcji i stopniowym ograniczeniem marży na realizowanych zamówieniach.",
                    en: "An increase in energy prices or a decline in raw material quality may raise waste levels and reduce line efficiency. This results in higher unit production costs and a gradual reduction of margins on executed orders."
                },
                orange: {
                    pl: "Znaczące wahania cen energii, częste awarie linii lub surowiec poza specyfikacją mogą doprowadzić do trwałego wzrostu kosztów jednostkowych. W efekcie rentowność serii produkcyjnych spada, a realizacja kontraktów zaczyna generować ograniczoną lub zerową marżę.",
                    en: "Significant energy price volatility, frequent line failures or off-spec raw materials may lead to a sustained increase in unit costs. As a result, the profitability of production batches declines and contract execution begins to generate limited or zero margin."
                },
                critical: {
                    pl: "Brak kontroli nad kosztami energii, wysokim poziomem odpadu oraz powtarzające się przestoje technologiczne mogą doprowadzić do utraty rentowności kluczowych linii produkcyjnych. W skrajnym przypadku realizacja zamówień generuje stratę, pochłania kapitał obrotowy i wymusza finansowanie bieżącej działalności z dodatkowych źródeł.",
                    en: "Lack of control over energy costs, a high level of waste, and recurring technological downtime may lead to the loss of profitability of key production lines. In extreme cases, order fulfillment generates losses, consumes working capital, and forces the company to finance its ongoing operations from additional sources."
                }
            },
            Reputation: {
                green: {
                    pl: "Parametry jakościowe wyrobów, poziom odpadu oraz stabilność procesu produkcyjnego utrzymują się w założonych normach. Nie występują reklamacje ani opóźnienia dostaw, które mogłyby podważyć wiarygodność firmy jako rzetelnego producenta.",
                    en: "Product quality parameters, waste levels and process stability remain within planned standards. No complaints or delivery delays occur that could undermine the company's credibility as a reliable manufacturer."
                },
                yellow: {
                    pl: "Pogorszenie jakości surowców lub spadek stabilności linii może prowadzić do zwiększonej liczby reklamacji i korekt produkcyjnych. Powtarzające się odchylenia parametrów technicznych osłabiają postrzeganie firmy jako producenta gwarantującego powtarzalną jakość.",
                    en: "Deterioration in raw material quality or reduced line stability may result in an increased number of complaints and production adjustments. Repeated deviations from technical parameters weaken the perception of the company as a manufacturer ensuring consistent quality."
                },
                orange: {
                    pl: "Częste wady produkcyjne, wysoki poziom odpadu lub niedotrzymywanie terminów realizacji partii mogą podważyć zaufanie kluczowych odbiorców. W efekcie firma traci referencje branżowe i może zostać wykluczona z kolejnych procesów kwalifikacyjnych u stałych klientów.",
                    en: "Frequent production defects, high waste levels or failure to meet batch delivery deadlines may undermine the trust of key customers. As a result, the company loses industry references and may be excluded from future qualification processes with regular clients."
                },
                critical: {
                    pl: "Trwałe problemy z jakością wyrobów, powtarzające się niezgodności partii oraz brak stabilności procesu mogą doprowadzić do utraty zaufania strategicznych odbiorców. W skrajnym przypadku firma traci status zatwierdzonego dostawcy, podlega obowiązkowemu audytowi naprawczemu lub traci certyfikację jakościową, co skutkuje rozwiązaniem umów ramowych i wykluczeniem z długoterminowej współpracy.",
                    en: "Persistent product quality issues, repeated batch non-conformities and lack of process stability may lead to the loss of trust from strategic customers. In extreme cases, the company may lose its approved supplier status, be subject to mandatory corrective audits or lose quality certification, resulting in termination of framework agreements and exclusion from long-term cooperation."
                }
            },
            Operational: {
                green: {
                    pl: "Linie produkcyjne pracują zgodnie z planem, a zużycie energii i poziom odpadu mieszczą się w normach technologicznych. Nie występują przestoje ani konieczność ograniczania mocy produkcyjnych.",
                    en: "Production lines operate according to plan, and energy consumption and waste levels remain within technological standards. No downtime or capacity reductions occur."
                },
                yellow: {
                    pl: "Pojedyncze awarie linii lub niestabilność parametrów technologicznych mogą powodować krótkotrwałe przestoje. Wymaga to korekt ustawień maszyn i zwiększonego nadzoru produkcji, aby utrzymać ciągłość realizacji zleceń.",
                    en: "Isolated line failures or unstable technological parameters may cause short-term downtime. This requires machine adjustments and increased production supervision to maintain order continuity."
                },
                orange: {
                    pl: "Powtarzające się awarie linii, surowiec poza specyfikacją lub wysoki poziom odpadu mogą doprowadzić do ograniczenia wydajności produkcji. Skutkiem jest niestabilna realizacja harmonogramu oraz ryzyko opóźnień w dostawach partii produkcyjnych.",
                    en: "Recurring line failures, off-spec raw materials or high waste levels may lead to reduced production efficiency. This results in unstable schedule execution and the risk of delays in batch deliveries."
                },
                critical: {
                    pl: "Brak stabilności technologicznej, powtarzające się przestoje oraz poważne awarie kluczowych linii mogą doprowadzić do utraty zdolności produkcyjnej zakładu. W praktyce oznacza to całkowite zatrzymanie wytwarzania do czasu przywrócenia pełnej sprawności parku maszynowego.",
                    en: "Lack of technological stability, recurring downtime, and serious failures of key production lines may lead to the loss of the plant’s production capacity. In practice, this means a complete halt of manufacturing until full operational efficiency of the machinery park is restored."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Stabilna obsada wykwalifikowanych pracowników oraz niska rotacja personelu pozwalają utrzymać planowaną wydajność linii i kontrolę kosztów robocizny. Koszt jednostkowy produkcji pozostaje zgodny z założeniami, co pozwala zachować zakładaną marżę na realizowanych zamówieniach.",
                    en: "A stable workforce and low employee turnover allow production lines to maintain planned efficiency and labor cost control. Unit production costs remain in line with assumptions, enabling the planned margin on executed orders to be maintained."
                },
                yellow: {
                    pl: "Wzrost absencji lub trudności w pozyskaniu wykwalifikowanych operatorów mogą obniżyć wydajność brygad i zwiększyć koszt roboczogodziny. W efekcie rośnie koszt jednostkowy produkcji, co stopniowo ogranicza marżę na kontraktach.",
                    en: "Increased absenteeism or difficulties in recruiting qualified operators may reduce crew efficiency and raise labor costs per hour. As a result, unit production costs increase, gradually reducing margins on contracts."
                },
                orange: {
                    pl: "Wysoka rotacja pracowników, niedobór operatorów lub poważne naruszenia zasad BHP mogą doprowadzić do istotnego wzrostu kosztów osobowych i spadku wydajności linii. Rentowność serii produkcyjnych ulega pogorszeniu, a realizacja zamówień zaczyna generować minimalną lub zerową marżę.",
                    en: "High employee turnover, a shortage of operators or serious safety breaches may lead to a significant increase in labor costs and reduced line efficiency. The profitability of production batches deteriorates, and order execution begins to generate minimal or zero margin."
                },
                critical: {
                    pl: "Utrata kluczowych brygadzistów lub brak wykwalifikowanej kadry do obsługi linii może doprowadzić do gwałtownego spadku wydajności i wzrostu kosztu roboczogodziny. W skrajnym przypadku firma traci konkurencyjność kosztową, zmuszona jest do podniesienia cen wyrobów lub ograniczenia zakresu realizowanych zamówień.",
                    en: "Loss of key supervisors or a shortage of qualified personnel to operate production lines may result in a sharp decline in productivity and increased labor costs. In extreme cases, the company loses cost competitiveness, is forced to raise product prices or reduce the scope of executed orders."
                }
            },
            Reputation: {
                green: {
                    pl: "Stabilna kadra, przestrzeganie zasad BHP oraz niska rotacja pracowników wzmacniają wizerunek firmy jako rzetelnego pracodawcy i przewidywalnego partnera produkcyjnego. Nie występują sytuacje podważające zaufanie odbiorców do organizacji pracy zakładu.",
                    en: "A stable workforce, compliance with safety standards and low employee turnover strengthen the company’s image as a reliable employer and predictable production partner. No situations occur that could undermine customers’ trust in the organization of the plant."
                },
                yellow: {
                    pl: "Rosnąca rotacja pracowników lub pojedyncze naruszenia zasad BHP mogą budzić zastrzeżenia co do stabilności organizacyjnej zakładu. Powtarzające się problemy osłabiają postrzeganie firmy jako producenta zapewniającego ciągłość i bezpieczeństwo procesu.",
                    en: "Increasing employee turnover or isolated safety breaches may raise concerns about the plant’s organizational stability. Repeated issues weaken the perception of the company as a manufacturer ensuring process continuity and safety."
                },
                orange: {
                    pl: "Poważne naruszenia zasad BHP, konflikty pracownicze lub wysoka rotacja kluczowych operatorów mogą podważyć wiarygodność firmy jako stabilnego partnera produkcyjnego. W efekcie odbiorcy mogą ograniczyć wolumen współpracy lub zażądać dodatkowych audytów organizacyjnych.",
                    en: "Serious safety violations, labor conflicts or high turnover of key operators may undermine the company’s credibility as a stable production partner. As a result, customers may reduce cooperation volumes or require additional organizational audits."
                },
                critical: {
                    pl: "Trwałe problemy kadrowe, poważne wypadki przy pracy lub brak nadzoru nad organizacją produkcji mogą doprowadzić do utraty zaufania strategicznych odbiorców. W skrajnym przypadku firma może zostać objęta obowiązkowym audytem naprawczym, utracić certyfikację bezpieczeństwa pracy lub zostać wykluczona z długoterminowych umów dostawczych.",
                    en: "Persistent workforce issues, serious workplace accidents or lack of production supervision may lead to the loss of trust from strategic customers. In extreme cases, the company may be subject to mandatory corrective audits, lose occupational safety certification or be excluded from long-term supply agreements."
                }
            },
            Operational: {
                green: {
                    pl: "Dostępność wykwalifikowanych pracowników oraz stabilna organizacja zmian pozwalają utrzymać ciągłość pracy zakładu. Nie występują braki kadrowe wymagające nadgodzin ani reorganizacji produkcji, a realizacja zleceń przebiega zgodnie z planem.",
                    en: "Stable workforce availability and well-organized shift planning ensure uninterrupted plant operations. There are no staffing shortages requiring overtime or production reorganization, and order execution remains on schedule."
                },
                yellow: {
                    pl: "Okresowe niedobory pracowników lub zwiększona rotacja mogą powodować konieczność pracy w nadgodzinach i przesunięć między liniami produkcyjnymi. Może to prowadzić do obniżenia wydajności i ryzyka opóźnień w realizacji części zamówień.",
                    en: "Temporary workforce shortages or increased staff turnover may require overtime and reallocating employees between production lines. This can reduce efficiency and create a risk of partial delivery delays."
                },
                orange: {
                    pl: "Znaczące braki kadrowe, spory pracownicze lub naruszenia zasad BHP mogą wymusić ograniczenie pracy wybranych wydziałów. Skutkiem jest spadek zdolności produkcyjnej zakładu oraz realne opóźnienia w realizacji kluczowych zamówień.",
                    en: "Significant staffing shortages, labor disputes, or safety breaches may force partial shutdown of specific departments. This results in reduced production capacity and tangible delays in fulfilling key orders."
                },
                critical: {
                    pl: "Utrata kluczowych zespołów produkcyjnych, poważny wypadek lub długotrwały konflikt pracowniczy mogą doprowadzić do niemożności utrzymania ciągłości produkcji. W praktyce oznacza to zatrzymanie wydziałów z przyczyn kadrowych oraz brak pełnej obsady uniemożliwiający pracę zmianową do czasu przywrócenia bezpiecznych warunków pracy.",
                    en: "Loss of key production teams, a serious workplace accident, or prolonged labor conflict may result in inability to maintain production continuity. In practice, this means shutdown of departments due to staffing shortages and insufficient workforce to sustain shift operations until safe working conditions are restored."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Procesy nadzorcze, dokumentacyjne i kontraktowe są prowadzone prawidłowo, a wymagane certyfikacje oraz audyty nie generują dodatkowych obciążeń finansowych. Nie występują zdarzenia wpływające na stabilność przychodów ani warunki współpracy z kluczowymi odbiorcami.",
                    en: "Supervisory, documentation, and contractual processes are properly managed, and required certifications and audits do not generate additional financial burdens. There are no governance-related events affecting revenue stability or key customer relationships."
                },
                yellow: {
                    pl: "Pojedyncze nieprawidłowości formalne, opóźnienia w dokumentacji lub dodatkowe wymagania audytowe mogą zwiększać koszty administracyjne i obniżać efektywność operacyjną. W dłuższej perspektywie może to ograniczać marżę na wybranych kontraktach.",
                    en: "Isolated compliance issues, documentation delays, or additional audit requirements may increase administrative costs and reduce operational efficiency. Over time, this may limit margins on selected contracts."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w obszarze zgodności, brak aktualnych certyfikacji lub spory kontraktowe mogą prowadzić do wstrzymania części zamówień oraz utraty preferencyjnych warunków współpracy. Skutkiem jest trwałe obniżenie rentowności wybranych linii produkcyjnych oraz ograniczenie zdolności do pozyskiwania nowych kontraktów przemysłowych.",
                    en: "Repeated compliance failures, expired certifications, or contractual disputes may result in partial suspension of orders and loss of preferential commercial terms. This leads to sustained margin pressure on selected production lines and limits the company’s ability to secure new industrial contracts."
                },
                critical: {
                    pl: "Poważne naruszenia zasad zgodności, utrata kluczowych certyfikacji jakościowych lub rozwiązanie istotnych umów ramowych mogą doprowadzić do wstrzymania realizacji strategicznych kontraktów. W skrajnym przypadku oznacza to konieczność renegocjacji warunków handlowych oraz utratę preferencyjnych stawek kontraktowych, co bezpośrednio osłabia pozycję negocjacyjną firmy wobec kluczowych odbiorców.",
                    en: "Serious compliance breaches, loss of key quality certifications, or termination of major framework agreements may lead to suspension of strategic contracts. In extreme cases, this may require renegotiation of commercial terms and loss of preferential contractual rates, directly weakening the company’s bargaining position with key customers."
                }
            },
            Reputation: {
                green: {
                    pl: "Procesy nadzorcze i zgodnościowe są prowadzone w sposób przejrzysty i udokumentowany. Firma utrzymuje aktualne certyfikacje jakościowe, a audyty zewnętrzne nie wykazują istotnych uchybień. Nie występują zdarzenia podważające wiarygodność firmy jako rzetelnego partnera przemysłowego.",
                    en: "Governance and compliance processes are transparent and properly documented. The company maintains valid quality certifications, and external audits do not reveal significant deficiencies. There are no events undermining the company’s credibility as a reliable industrial partner."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub uwagi audytowe mogą budzić zastrzeżenia wśród odbiorców i partnerów biznesowych. Choć nie wpływają bezpośrednio na realizację zamówień, mogą osłabiać postrzeganie firmy jako podmiotu w pełni zgodnego i dobrze zarządzanego.",
                    en: "Isolated compliance issues or audit remarks may raise concerns among customers and business partners. Although they do not directly affect order execution, they may weaken the perception of the company as fully compliant and well-managed."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w obszarze zgodności, opóźnienia w odnawianiu certyfikacji lub spory kontraktowe mogą podważać reputację firmy jako stabilnego dostawcy. Może to skutkować utratą statusu preferowanego partnera, negatywną oceną w procesach kwalifikacyjnych oraz ograniczeniem udziału w nowych projektach przemysłowych.",
                    en: "Repeated compliance failures, delays in certification renewal, or contractual disputes may undermine the company’s reputation as a stable supplier. This may result in loss of preferred supplier status, negative scoring in qualification processes, and reduced participation in new industrial projects."
                },
                critical: {
                    pl: "Poważne naruszenia zasad zgodności, cofnięcie kluczowych certyfikacji jakościowych lub publiczne spory kontraktowe mogą trwale podważyć wiarygodność firmy w oczach rynku. W skrajnym przypadku oznacza to utratę statusu zatwierdzonego dostawcy, obniżenie ratingu w systemach odbiorców oraz objęcie firmy rozszerzonym nadzorem jakościowym.",
                    en: "Serious compliance breaches, withdrawal of key quality certifications, or public contractual disputes may permanently undermine the company’s credibility in the eyes of the market. In extreme cases, this may result in the loss of approved supplier status, a downgrade in customers’ rating systems, and the company being placed under enhanced quality supervision."
                }
            },
            Operational: {
                green: {
                    pl: "Procedury zgodności, dokumentacja techniczna oraz wymagane dopuszczenia są aktualne i kompletne. Audyty oraz kontrole nie powodują zakłóceń w pracy zakładu, a działalność operacyjna może być prowadzona bez ograniczeń formalnych.",
                    en: "Compliance procedures, technical documentation, and required permits are up to date and complete. Audits and inspections do not disrupt plant operations, and activities can be conducted without formal restrictions."
                },
                yellow: {
                    pl: "Pojedyncze braki formalne, opóźnienia w aktualizacji dokumentacji lub zalecenia pokontrolne mogą wymagać dodatkowych działań administracyjnych. Choć nie zatrzymują produkcji, mogą powodować czasowe utrudnienia organizacyjne i zwiększoną liczbę kontroli.",
                    en: "Isolated documentation gaps, delays in updates, or post-audit recommendations may require additional administrative actions. Although they do not stop production, they may cause temporary organizational disruptions and increased inspection frequency."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w obszarze zgodności, brak aktualnych pozwoleń lub niespełnienie wymogów technicznych mogą skutkować ograniczeniem zakresu działalności operacyjnej. Może to oznaczać czasowe wstrzymanie pracy wybranych linii produkcyjnych do momentu usunięcia nieprawidłowości.",
                    en: "Repeated compliance failures, expired permits, or unmet technical requirements may result in restriction of operational scope. This may involve temporary suspension of selected production lines until deficiencies are resolved."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów, cofnięcie kluczowych pozwoleń lub decyzja organu nadzorczego mogą doprowadzić do formalnego wstrzymania działalności zakładu. W praktyce oznacza to obowiązkowe zatrzymanie produkcji do czasu przywrócenia pełnej zgodności regulacyjnej.",
                    en: "Serious regulatory breaches, withdrawal of key permits, or a supervisory authority decision may lead to formal suspension of plant operations. In practice, this means mandatory shutdown of production until full regulatory compliance is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z dostawcami surowców i komponentów przebiega stabilnie, a warunki handlowe są przewidywalne. Koszty zakupowe pozostają pod kontrolą i nie wpływają negatywnie na marżę realizowanych zamówień.",
                    en: "Cooperation with suppliers of raw materials and components remains stable, and commercial terms are predictable. Procurement costs are under control and do not negatively affect order margins."
                },
                yellow: {
                    pl: "Wzrost cen surowców, komponentów lub usług logistycznych może zwiększyć koszt wytworzenia produktów. Ograniczona możliwość przeniesienia tych kosztów na odbiorców prowadzi do stopniowego obniżenia marży na wybranych kontraktach.",
                    en: "An increase in the prices of raw materials, components, or logistics services may raise the cost of manufacturing products. A limited ability to pass these costs on to customers leads to a gradual reduction in margins on selected contracts."
                },
                orange: {
                    pl: "Zależność od wąskiej grupy dostawców lub niekorzystne zmiany warunków zakupowych mogą prowadzić do trwałego wzrostu kosztów produkcji. Skutkiem jest utrata konkurencyjności cenowej oraz konieczność renegocjacji warunków handlowych z kluczowymi odbiorcami.",
                    en: "Dependence on a limited number of suppliers or unfavorable changes in purchasing terms may lead to a sustained increase in production costs. This results in loss of price competitiveness and the need to renegotiate commercial terms with key customers."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy, długotrwałe zakłócenia w łańcuchu dostaw lub gwałtowny wzrost cen strategicznych surowców mogą doprowadzić do istotnego wzrostu kosztów wytworzenia. W skrajnym przypadku oznacza to konieczność ograniczenia zakresu realizowanych zamówień oraz utratę części portfela kontraktów.",
                    en: "Loss of a key supplier, prolonged supply chain disruptions, or sharp increases in prices of strategic raw materials may significantly raise production costs. In extreme cases, this may require reducing the scope of fulfilled orders and result in partial loss of the contract portfolio."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami surowców i komponentów przebiega stabilnie, a firma utrzymuje opinię rzetelnego i przewidywalnego partnera zakupowego. Nie występują spory logistyczne ani reklamacje związane z organizacją łańcucha dostaw, które mogłyby podważyć wiarygodność operacyjną.",
                    en: "Cooperation with raw material and component suppliers remains stable, and the company is perceived as a reliable and predictable procurement partner. There are no logistical disputes or complaints related to supply chain organization that could undermine operational credibility."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw, zmiany warunków współpracy lub napięcia z podwykonawcami mogą budzić zastrzeżenia wśród odbiorców. Choć nie wpływają bezpośrednio na realizację zamówień, mogą osłabiać postrzeganie firmy jako podmiotu skutecznie zarządzającego łańcuchem dostaw.",
                    en: "Isolated delivery delays, changes in cooperation terms, or tensions with subcontractors may raise concerns among customers. Although they do not directly affect order fulfillment, they may weaken the perception of the company as effectively managing its supply chain."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostawcami, brak alternatywnych źródeł zaopatrzenia lub publiczne spory logistyczne mogą podważać wiarygodność firmy jako stabilnego organizatora łańcucha dostaw. Może to skutkować obniżeniem oceny w procesach kwalifikacyjnych oraz utratą statusu preferowanego partnera zakupowego.",
                    en: "Repeated supplier issues, lack of alternative sourcing options, or public logistical disputes may undermine the company’s credibility as a stable supply chain organizer. This may result in lower scores in qualification processes and loss of preferred supplier status."
                },
                critical: {
                    pl: "Utrata kluczowych dostawców, długotrwałe konflikty logistyczne lub brak kontroli nad strategicznymi podwykonawcami mogą trwale podważyć zaufanie rynku do zdolności firmy do zarządzania łańcuchem dostaw. W skrajnym przypadku oznacza to utratę statusu zatwierdzonego dostawcy w systemach odbiorców oraz objęcie firmy rozszerzonym monitoringiem łańcucha dostaw.",
                    en: "Loss of key suppliers, prolonged logistical conflicts, or lack of control over strategic subcontractors may permanently undermine market confidence in the company’s ability to manage its supply chain. In extreme cases, this may result in loss of approved supplier status in customer systems and placement under enhanced supply chain monitoring."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy surowców i komponentów realizowane są zgodnie z harmonogramem, a zapasy bezpieczeństwa pozwalają utrzymać płynność produkcji. Nie występują zakłócenia logistyczne wpływające na realizację planu produkcyjnego.",
                    en: "Deliveries of raw materials and components are carried out according to schedule, and safety stock levels ensure production continuity. There are no logistical disruptions affecting the production plan."
                },
                yellow: {
                    pl: "Okresowe opóźnienia dostaw lub ograniczona dostępność wybranych komponentów mogą wymagać przesunięć w harmonogramie produkcji. Może to prowadzić do czasowego przeplanowania zleceń i zwiększonej pracy działu logistyki.",
                    en: "Temporary delivery delays or limited availability of selected components may require adjustments to the production schedule. This can result in rescheduling orders and increased workload for the logistics team."
                },
                orange: {
                    pl: "Brak terminowych dostaw kluczowych surowców lub zależność od pojedynczego dostawcy mogą prowadzić do wstrzymania pracy wybranych linii produkcyjnych. Skutkiem jest ograniczenie ciągłości realizacji zamówień oraz konieczność reorganizacji planu produkcyjnego.",
                    en: "Failure to receive timely deliveries of critical raw materials or dependence on a single supplier may lead to suspension of selected production lines. This results in reduced continuity of order execution and the need to reorganize the production plan."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy, zerwanie ciągłości dostaw strategicznych komponentów lub długotrwała blokada logistyczna mogą doprowadzić do zatrzymania części wydziałów produkcyjnych. W praktyce oznacza to wstrzymanie realizacji zamówień do czasu przywrócenia stabilności łańcucha dostaw.",
                    en: "Loss of a key supplier, disruption of strategic component deliveries, or prolonged logistical blockage may lead to shutdown of parts of the production departments. In practice, this means suspension of order fulfillment until supply chain stability is restored."
                }
            }
        }
    },
    logistics_transport: {
        E: {
            Business: {
                green: {
                    pl: "Zużycie paliwa, koszty energii oraz efektywność floty pozostają pod kontrolą. Nie występują istotne odchylenia od założeń budżetowych, a koszty środowiskowe nie wpływają negatywnie na rentowność realizowanych zleceń transportowych.",
                    en: "Fuel consumption, energy costs, and fleet efficiency remain under control. There are no significant deviations from budget assumptions, and environmental costs do not negatively affect the profitability of transport contracts."
                },
                yellow: {
                    pl: "Wzrost cen paliwa, energii lub opłat środowiskowych może zwiększać koszt realizacji usług transportowych. Ograniczona możliwość przeniesienia tych kosztów na klientów prowadzi do stopniowego obniżenia marży na wybranych trasach i kontraktach.",
                    en: "Rising fuel prices, energy costs, or environmental charges may increase the cost of providing transport services. Limited ability to pass these costs on to customers gradually reduces margins on selected routes and contracts."
                },
                orange: {
                    pl: "Znaczący wzrost kosztów paliwa lub konieczność dostosowania floty do bardziej rygorystycznych norm emisyjnych może prowadzić do trwałego wzrostu kosztów operacyjnych. Skutkiem jest utrata konkurencyjności cenowej oraz konieczność renegocjacji warunków umów z kluczowymi kontrahentami.",
                    en: "A significant increase in fuel costs or the need to adapt the fleet to stricter emission standards may result in a sustained rise in operating costs. This leads to loss of price competitiveness and the need to renegotiate terms with key clients."
                },
                critical: {
                    pl: "Gwałtowny wzrost cen paliw, rosnące koszty dostosowania floty do wymogów środowiskowych lub utrata efektywności energetycznej mogą doprowadzić do trwałej nieopłacalności realizowanych kontraktów. W skrajnym przypadku oznacza to konieczność wycofania części floty z eksploatacji oraz ograniczenie zakresu świadczonych usług transportowych.",
                    en: "A sharp increase in fuel prices, rising costs of adapting the fleet to environmental requirements, or declining energy efficiency may lead to the sustained unprofitability of transport contracts. In extreme cases, this may require withdrawing part of the fleet from operation and reducing the scope of transport services provided."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje kontrolę nad emisjami i zużyciem paliwa, a flota spełnia obowiązujące normy środowiskowe. Nie występują zdarzenia podważające postrzeganie firmy jako odpowiedzialnego i nowoczesnego operatora transportowego.",
                    en: "The company maintains control over emissions and fuel consumption, and the fleet complies with applicable environmental standards. There are no incidents undermining the company's reputation as a responsible and modern transport operator."
                },
                yellow: {
                    pl: "Pojedyncze przekroczenia norm emisji lub brak transparentności w raportowaniu środowiskowym mogą budzić zastrzeżenia klientów. Osłabia to wizerunek firmy jako partnera spełniającego rosnące oczekiwania w zakresie zrównoważonego transportu.",
                    en: "Isolated emission exceedances or limited transparency in environmental reporting may raise concerns among clients. This weakens the company's image as a partner meeting growing expectations in sustainable transport."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia norm emisji, wysoki ślad węglowy floty lub negatywne publikacje dotyczące wpływu środowiskowego działalności mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu preferowanego przewoźnika u części kluczowych klientów.",
                    en: "Repeated emission exceedances, a high fleet carbon footprint, or negative media coverage regarding environmental impact may significantly undermine the company’s credibility. This may result in losing preferred carrier status with selected key clients."
                },
                critical: {
                    pl: "Poważne naruszenia norm środowiskowych, brak kontroli nad emisjami lub publiczne ujawnienie istotnych nieprawidłowości mogą trwale podważyć zaufanie rynku do firmy jako operatora spełniającego standardy środowiskowe. W skrajnym przypadku oznacza to utratę kluczowych kontraktów oraz wykluczenie z przetargów wymagających spełnienia wysokich standardów środowiskowych.",
                    en: "Serious environmental violations, lack of emission control, or public disclosure of significant irregularities may permanently undermine market trust in the company as an operator meeting environmental standards. In extreme cases, this may result in the loss of key contracts and exclusion from tenders requiring high environmental compliance standards."
                }
            },
            Operational: {
                green: {
                    pl: "Flota spełnia obowiązujące normy emisyjne, a zużycie paliwa pozostaje na poziomie zgodnym z planem operacyjnym. Realizacja zleceń odbywa się bez ograniczeń wynikających z wymogów środowiskowych, w tym bez problemów z dostępem do stref niskoemisyjnych.",
                    en: "The fleet complies with applicable emission standards, and fuel consumption remains in line with the operational plan. Transport orders are executed without environmental constraints, including unrestricted access to low-emission zones."
                },
                yellow: {
                    pl: "Częściowe przekroczenia norm emisji lub ograniczona efektywność paliwowa wybranych pojazdów mogą utrudniać dostęp do niektórych stref transportowych. Może to wymagać modyfikacji tras lub wykorzystania alternatywnej floty.",
                    en: "Partial emission exceedances or reduced fuel efficiency of selected vehicles may limit access to certain transport zones. This may require route adjustments or the use of alternative fleet units."
                },
                orange: {
                    pl: "Brak dostosowania części floty do obowiązujących norm środowiskowych może prowadzić do wyłączenia pojazdów z obsługi wybranych rynków lub stref miejskich. Skutkiem jest konieczność reorganizacji pracy floty oraz ograniczenie dostępności mocy przewozowych.",
                    en: "Failure to adapt part of the fleet to applicable environmental standards may result in vehicles being excluded from certain markets or urban zones. This leads to fleet reorganization and reduced transport capacity availability."
                },
                critical: {
                    pl: "Systemowe niedostosowanie floty do wymogów środowiskowych lub utrata dostępu do kluczowych obszarów transportowych może wyłączyć znaczącą część floty z realizacji zleceń transportowych. W praktyce oznacza to zatrzymanie obsługi wybranych tras oraz wymuszone wyłączenie pojazdów z eksploatacji do czasu przywrócenia stabilności operacyjnej.",
                    en: "Systemic non-compliance of the fleet with environmental requirements or loss of access to key transport areas may remove a significant portion of the fleet from active order execution. In practice, this means suspension of selected routes and forced withdrawal of vehicles from operation until operational stability is restored."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Stabilna dostępność kierowców oraz personelu operacyjnego pozwala utrzymać ciągłość realizacji usług transportowych. Koszty pracy pozostają pod kontrolą i nie wpływają negatywnie na rentowność kontraktów.",
                    en: "Stable availability of drivers and operational staff ensures continuity of transport services. Labor costs remain under control and do not negatively affect contract profitability."
                },
                yellow: {
                    pl: "Wzrost wynagrodzeń kierowców, rosnąca rotacja kadry lub presja płacowa na rynku pracy mogą podnosić koszty realizacji usług. Ograniczona możliwość przeniesienia tych kosztów na klientów prowadzi do stopniowego obniżenia marży na wybranych kontraktach.",
                    en: "Rising driver wages, increased staff turnover, or labor market pressure may raise service delivery costs. Limited ability to pass these costs on to clients gradually reduces margins on selected contracts."
                },
                orange: {
                    pl: "Niedobór wykwalifikowanych kierowców, konieczność korzystania z droższych podwykonawców lub znaczący wzrost kosztów pracy może trwale obniżyć rentowność działalności transportowej. Skutkiem może być utrata konkurencyjności cenowej oraz konieczność renegocjacji stawek z kluczowymi klientami.",
                    en: "A shortage of qualified drivers, reliance on more expensive subcontractors, or a significant increase in labor costs may permanently reduce transport business profitability. This may lead to loss of price competitiveness and the need to renegotiate rates with key clients."
                },
                critical: {
                    pl: "Systemowy brak kierowców, masowe odejścia pracowników lub trwała niestabilność kadrowa mogą doprowadzić do utraty kluczowych kontraktów transportowych. W skrajnym przypadku oznacza to redukcję portfela klientów oraz konieczność ograniczenia skali działalności transportowej.",
                    en: "Systemic driver shortages, mass staff departures, or prolonged workforce instability may lead to the loss of key transport contracts. In extreme cases, this may require reducing the client portfolio and scaling down transport operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje stabilną kadrę kierowców oraz przestrzega standardów bezpieczeństwa i warunków pracy. Nie występują zdarzenia podważające postrzeganie firmy jako rzetelnego i odpowiedzialnego pracodawcy w branży transportowej.",
                    en: "The company maintains a stable driver workforce and complies with safety and labor standards. There are no incidents undermining its reputation as a reliable and responsible employer in the transport sector."
                },
                yellow: {
                    pl: "Pojedyncze skargi pracownicze, podwyższona rotacja kierowców lub incydenty związane z warunkami pracy mogą budzić zastrzeżenia klientów. Osłabia to wizerunek firmy jako rzetelnego przewoźnika.",
                    en: "Isolated employee complaints, increased driver turnover, or incidents related to working conditions may raise concerns among clients. This weakens the company's image as a reliable carrier."
                },
                orange: {
                    pl: "Powtarzające się problemy kadrowe, publiczne spory z pracownikami lub zarzuty dotyczące naruszeń standardów pracy mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu preferowanego przewoźnika u części kluczowych klientów.",
                    en: "Recurring workforce issues, public disputes with employees, or allegations of labor standard violations may significantly undermine the company’s credibility. This may result in losing preferred carrier status with selected key clients."
                },
                critical: {
                    pl: "Poważne naruszenia praw pracowniczych, masowe protesty kierowców lub szeroko nagłośnione incydenty związane z bezpieczeństwem pracy mogą trwale podważyć zaufanie rynku do firmy jako odpowiedzialnego operatora transportowego. W skrajnym przypadku oznacza to utratę strategicznych klientów oraz wykluczenie z długoterminowych umów ramowych.",
                    en: "Serious labor law violations, mass driver protests, or widely publicized safety incidents may permanently undermine market trust in the company as a responsible transport operator. In extreme cases, this may result in the loss of strategic clients and exclusion from long-term framework agreements."
                }
            },
            Operational: {
                green: {
                    pl: "Dostępność kierowców oraz personelu operacyjnego pozwala na realizację wszystkich zaplanowanych tras bez zakłóceń. Obsada zmianowa pozostaje stabilna, a harmonogramy przewozów są utrzymywane zgodnie z planem.",
                    en: "Driver and operational staff availability ensures the execution of all scheduled routes without disruption. Shift coverage remains stable, and transport schedules are maintained as planned."
                },
                yellow: {
                    pl: "Czasowe braki kadrowe lub zwiększona absencja kierowców mogą powodować konieczność modyfikacji grafików i przesunięć tras. Realizacja usług jest możliwa, jednak wymaga większej elastyczności organizacyjnej.",
                    en: "Temporary staff shortages or increased driver absenteeism may require schedule adjustments and route rescheduling. Services remain deliverable but require greater organizational flexibility."
                },
                orange: {
                    pl: "Znaczący niedobór kierowców lub wysoka rotacja kadry może prowadzić do odwoływania części kursów oraz ograniczenia dostępności floty. Konieczna jest reorganizacja pracy i czasowe wyłączenie wybranych tras.",
                    en: "A significant shortage of drivers or high workforce turnover may lead to cancellation of certain routes and reduced fleet availability. This requires operational reorganization and temporary suspension of selected routes."
                },
                critical: {
                    pl: "Trwała niestabilność kadrowa wśród kierowców może uniemożliwić utrzymanie harmonogramu przewozów. Oznacza to odwołanie części kursów oraz ograniczenie pracy floty do poziomu zapewniającego jedynie podstawową obsługę kluczowych tras.",
                    en: "Persistent workforce instability among drivers may make it impossible to maintain the transport schedule. This means the cancellation of part of the routes and limiting fleet operations to a level that ensures only basic service of key routes."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma posiada wszystkie wymagane licencje i zezwolenia transportowe, a procesy zgodności regulacyjnej są skutecznie nadzorowane. Nie występują ryzyka formalne mogące wpływać na stabilność przychodów z realizowanych kontraktów.",
                    en: "The company holds all required transport licenses and permits, and regulatory compliance processes are effectively supervised. There are no formal risks that could affect the stability of revenues from ongoing contracts."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub opóźnienia w odnowieniu zezwoleń mogą powodować zwiększoną kontrolę regulacyjną. Może to opóźniać pozyskiwanie nowych kontraktów i ograniczać dynamikę przychodów.",
                    en: "Isolated formal deficiencies or delays in renewing permits may result in increased regulatory scrutiny. This may delay the acquisition of new contracts and limit revenue growth dynamics."
                },
                orange: {
                    pl: "Powtarzające się naruszenia przepisów transportowych lub decyzje administracyjne nakładające ograniczenia na działalność mogą prowadzić do czasowego zawieszenia części uprawnień. Skutkiem jest ograniczenie możliwości realizacji wybranych kontraktów oraz konieczność renegocjacji warunków handlowych.",
                    en: "Repeated violations of transport regulations or administrative decisions imposing restrictions on operations may result in temporary suspension of certain authorizations. This limits the ability to perform selected contracts and may require renegotiation of commercial terms."
                },
                critical: {
                    pl: "Cofnięcie kluczowej licencji transportowej, zakaz wykonywania działalności na wybranych rynkach lub długotrwałe ograniczenia administracyjne mogą doprowadzić do utraty znaczącej części przychodów. W skrajnym przypadku oznacza to konieczność wstrzymania działalności w dotychczasowym zakresie oraz restrukturyzację modelu operacyjnego firmy.",
                    en: "Revocation of a key transport license, prohibition from operating in selected markets, or prolonged administrative restrictions may lead to the loss of a significant portion of revenue. In extreme cases, this may require suspension of operations in their current scope and restructuring of the company’s operating model."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z przepisami transportowymi, a kontrole regulacyjne nie wykazują istotnych nieprawidłowości. Nie występują zdarzenia podważające wiarygodność firmy jako podmiotu działającego zgodnie z obowiązującymi wymogami formalnymi.",
                    en: "The company maintains full compliance with transport regulations, and regulatory inspections do not reveal significant irregularities. There are no incidents undermining its credibility as an entity operating in line with formal requirements."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub uwagi pokontrolne mogą budzić zainteresowanie organów nadzoru. Osłabia to postrzeganie firmy jako w pełni zdyscyplinowanego podmiotu regulacyjnego.",
                    en: "Isolated formal deficiencies or inspection remarks may attract increased attention from supervisory authorities. This weakens the perception of the company as a fully compliant regulatory entity."
                },
                orange: {
                    pl: "Powtarzające się naruszenia przepisów transportowych lub publicznie dostępne decyzje administracyjne mogą istotnie podważyć wiarygodność firmy. Skutkiem może być utrata statusu zatwierdzonego przewoźnika u części klientów wymagających wysokich standardów zgodności.",
                    en: "Repeated violations of transport regulations or publicly available administrative decisions may significantly undermine the company’s credibility. This may result in losing approved carrier status with clients requiring high compliance standards."
                },
                critical: {
                    pl: "Cofnięcie licencji transportowej, publikacja decyzji administracyjnych o poważnych naruszeniach lub wpisanie firmy do rejestrów podmiotów naruszających przepisy może trwale podważyć wiarygodność regulacyjną firmy na rynku. W skrajnym przypadku oznacza to utratę statusu uprawnionego przewoźnika w systemach kluczowych kontrahentów.",
                    en: "Revocation of a transport license, publication of administrative decisions regarding serious violations, or inclusion of the company in registers of non-compliant entities may permanently undermine the company’s regulatory credibility in the market. In extreme cases, this may result in the loss of approved carrier status in key clients’ systems."
                }
            },
            Operational: {
                green: {
                    pl: "Firma posiada wszystkie wymagane licencje i zezwolenia, a działalność transportowa prowadzona jest zgodnie z obowiązującymi przepisami. Nie występują formalne ograniczenia wpływające na realizację przewozów.",
                    en: "The company holds all required licenses and permits, and transport operations are conducted in compliance with applicable regulations. There are no formal restrictions affecting the execution of transport services."
                },
                yellow: {
                    pl: "Pojedyncze uchybienia formalne lub zalecenia pokontrolne mogą wymagać wprowadzenia działań korygujących. Do czasu ich wdrożenia możliwe są ograniczenia w realizacji wybranych przewozów.",
                    en: "Isolated formal deficiencies or inspection recommendations may require corrective actions. Until implemented, certain transport operations may be subject to limitations."
                },
                orange: {
                    pl: "Decyzje administracyjne nakładające ograniczenia na zakres działalności lub czasowe zawieszenie części uprawnień mogą prowadzić do wyłączenia wybranych pojazdów lub tras z eksploatacji. Wymaga to reorganizacji działalności transportowej w ramach dostępnych zezwoleń.",
                    en: "Administrative decisions imposing operational restrictions or temporary suspension of certain authorizations may result in specific vehicles or routes being taken out of service. This requires reorganization of transport operations within the scope of available permits."
                },
                critical: {
                    pl: "Cofnięcie kluczowej licencji transportowej, zakaz wykonywania przewozów na określonych rynkach lub formalne wstrzymanie działalności przez organ nadzoru skutkuje obowiązkowym wstrzymaniem realizacji przewozów. W praktyce oznacza to całkowite zatrzymanie działalności w objętym decyzją zakresie do czasu przywrócenia pełnej zgodności regulacyjnej.",
                    en: "Revocation of a key transport license, a ban on operating in specific markets, or a formal suspension of activities by the supervisory authority results in a mandatory halt of transport operations. In practice, this means a complete suspension of activities within the scope covered by the decision until full regulatory compliance is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami transportowymi, dostawcami usług serwisowych oraz operatorami zewnętrznymi przebiega stabilnie. Warunki handlowe pozostają przewidywalne, a koszty usług zewnętrznych nie wpływają negatywnie na rentowność realizowanych kontraktów.",
                    en: "Cooperation with subcontracted carriers, service providers and external operators remains stable. Commercial terms are predictable and external service costs do not negatively affect the profitability of ongoing contracts."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców, kosztów usług serwisowych lub opłat logistycznych może ograniczać marżę realizowanych przewozów. Możliwości przeniesienia tych kosztów na klientów są ograniczone, co bezpośrednio obniża rentowność kontraktów.",
                    en: "Increases in subcontractor rates, servicing costs or logistics fees may reduce margins on transport operations. The ability to pass these costs on to clients is limited, directly lowering contract profitability."
                },
                orange: {
                    pl: "Niestabilność współpracy z kluczowymi podwykonawcami lub ograniczona dostępność usług zewnętrznych może prowadzić do konieczności korzystania z droższych alternatyw. Powoduje to wyraźne pogorszenie wyniku finansowego realizowanych kontraktów oraz trwałe obniżenie marży operacyjnej floty.",
                    en: "Instability in cooperation with key subcontractors or limited availability of external services may require the use of more expensive alternatives. This leads to a noticeable deterioration in contract performance and a sustained reduction in fleet operating margins."
                },
                critical: {
                    pl: "Utrata kluczowych podwykonawców lub trwałe zakłócenia w dostępie do usług zewnętrznych mogą doprowadzić do nieopłacalności realizowanych kontraktów transportowych. W konsekwencji firma zmuszona jest do realizacji zleceń poniżej progu rentowności, co wymusza wycofanie się z części nierentownych kontraktów oraz ograniczenie zakresu działalności transportowej.",
                    en: "The loss of key subcontractors or persistent disruptions in access to external services may render ongoing transport contracts unprofitable. As a consequence, the company may be forced to perform assignments below the break-even threshold, which necessitates withdrawing from certain unprofitable contracts and reducing the scope of its transport operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z przewoźnikami i firmami podwykonawczymi przebiega stabilnie, a dostawy docierają do klientów zgodnie z ustalonymi terminami. Nie występują reklamacje dotyczące opóźnień ani uszkodzeń towaru, co utrzymuje postrzeganie Twojej firmy jako rzetelnego partnera transportowego.",
                    en: "Cooperation with carriers and subcontracted transport companies remains stable, and deliveries reach clients according to agreed deadlines. There are no complaints regarding delays or cargo damage, which maintains your company’s image as a reliable logistics partner."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia po stronie przewoźników lub przejściowe braki dostępnych pojazdów powodują reklamacje klientów. Jeżeli takie sytuacje zaczynają się powtarzać, osłabiają ocenę Twojej firmy jako podmiotu, który skutecznie nadzoruje łańcuch realizacji usług transportowych.",
                    en: "Isolated delays by carriers or temporary shortages of available vehicles lead to customer complaints. If such situations begin to repeat, they weaken the assessment of your company as an operator that effectively supervises the transport execution chain."
                },
                orange: {
                    pl: "Niedotrzymywanie terminów dostaw przez kluczowych przewoźników lub częste uszkodzenia ładunku podważają zaufanie klientów do jakości realizacji usług. Negatywne oceny współpracy oraz formalne skargi obniżają status Twojej firmy jako preferowanego partnera logistycznego i mogą ograniczyć zaproszenia do nowych postępowań ofertowych.",
                    en: "Failure of key carriers to meet delivery deadlines or frequent cargo damage undermines client trust in service execution quality. Negative cooperation assessments and formal complaints reduce your company’s status as a preferred logistics partner and may limit invitations to future bidding procedures."
                },
                critical: {
                    pl: "Brak skutecznej kontroli nad siecią podwykonawców, powtarzające się opóźnienia tras lub publiczne spory z przewoźnikami mogą trwale podważyć wiarygodność Twojej firmy jako operatora logistycznego. W konsekwencji firma traci status zaufanego partnera w systemach kluczowych klientów oraz zostaje wykluczona z procesów kwalifikacyjnych przy nowych postępowaniach przetargowych.",
                    en: "Lack of effective control over the subcontractor network, repeated route delays, or public disputes with carriers may permanently damage your company’s credibility as a logistics operator. As a result, the company may lose its trusted partner status in key clients’ systems and be excluded from qualification processes in future tender procedures."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z przewoźnikami i firmami podwykonawczymi zapewnia ciągłość realizacji tras, a pojazdy są dostępne zgodnie z harmonogramem. Dostawy odbywają się bez zakłóceń, co pozwala utrzymać stabilną realizację całej siatki transportowej.",
                    en: "Cooperation with carriers and subcontracted transport companies ensures route continuity, and vehicles are available according to schedule. Deliveries proceed without disruption, allowing stable execution of the entire transport network."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia dostaw lub przejściowa niedostępność pojazdów po stronie podwykonawców powodują korekty harmonogramów tras. Zakłócenia te nie zatrzymują realizacji usług, lecz zwiększają presję organizacyjną i utrudniają płynne planowanie pracy floty.",
                    en: "Isolated delivery delays or temporary vehicle unavailability on the subcontractor side require route schedule adjustments. These disruptions do not stop operations, but they increase organizational pressure and make fleet planning less stable."
                },
                orange: {
                    pl: "Powtarzające się braki dostępnych przewoźników lub opóźnienia w podstawianiu pojazdów prowadzą do istotnych przesunięć tras i kumulacji zleceń. Zakłócenia te destabilizują realizację transportów i ograniczają zdolność Twojej firmy do terminowego wykonywania usług.",
                    en: "Repeated shortages of available carriers or delays in vehicle allocation lead to significant route shifts and accumulation of orders. These disruptions destabilize transport execution and limit your company’s ability to deliver services on time."
                },
                critical: {
                    pl: "Nagłe zerwanie współpracy z kluczowym przewoźnikiem lub przerwanie ciągłości dostaw transportowych może całkowicie zatrzymać realizację części tras. Oznacza to utratę zdolności operacyjnej w obsłudze wybranych kierunków oraz konieczność awaryjnej reorganizacji całej siatki transportowej.",
                    en: "Sudden termination of cooperation with a key carrier or disruption in transport continuity may completely halt execution of certain routes. This results in loss of operational capacity on selected lanes and requires emergency reorganization of the entire transport network."
                }
            }
        }
    },
    retail_trade: {
        E: {
            Business: {
                green: {
                    pl: "Poziom zapasów w magazynie i na półce jest dopasowany do rotacji sprzedaży, a zatowarowanie nie generuje nadmiernego zamrożenia kapitału. Struktura marży pozostaje stabilna, co pozwala utrzymać zakładany poziom rentowności sprzedaży.",
                    en: "Inventory levels in the warehouse and on shelves are aligned with sales turnover, and stock does not create excessive capital lock-up. The margin structure remains stable, allowing the planned level of sales profitability to be maintained."
                },
                yellow: {
                    pl: "Wzrost stanów magazynowych lub wolniejsza rotacja części asortymentu powodują zamrożenie kapitału obrotowego. Nadwyżka towaru zwiększa koszty magazynowania i obniża bieżącą marżę, ograniczając elastyczność finansową Twojej firmy.",
                    en: "An increase in inventory levels or slower turnover of part of the assortment leads to working capital being tied up. Excess stock raises storage costs and reduces current margin, limiting your company's financial flexibility."
                },
                orange: {
                    pl: "Istotne przeszacowanie zamówień lub spadek sprzedaży kluczowych produktów prowadzi do nadmiernego zalegania towaru w magazynie. Konieczność wyprzedaży z obniżoną ceną obniża marżę handlową i wyraźnie pogarsza wynik finansowy Twojego sklepu.",
                    en: "Significant overordering or a decline in sales of key products results in excessive stock remaining in the warehouse. The need to sell goods at reduced prices lowers trade margins and clearly weakens the financial result of your store."
                },
                critical: {
                    pl: "Długotrwałe zaleganie dużych partii towaru, szczególnie sezonowego, blokuje kapitał i wymusza agresywne obniżki cen w celu odzyskania gotówki. Spadek marży oraz ograniczona sprzedaż bieżąca wymuszają restrukturyzację asortymentu i redukcję zamówień w kolejnych okresach, co bezpośrednio zmniejsza skalę działalności Twojego sklepu.",
                    en: "Long-term accumulation of large stock volumes, especially seasonal goods, blocks capital and forces aggressive price reductions to recover cash. Margin erosion and weakened current sales require assortment restructuring and reduced purchasing in subsequent periods, directly shrinking the scale of your store’s operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Poziom zapasów i dostępność towaru na półce są dopasowane do popytu, a braki magazynowe nie występują w okresach zwiększonej sprzedaży. Klienci postrzegają Twoją firmę jako dobrze zorganizowany sklep, w którym towar jest dostępny zgodnie z oczekiwaniami.",
                    en: "Inventory levels and product availability on shelves are aligned with demand, and stock shortages do not occur during peak sales periods. Customers perceive your company as a well-organized retailer where products are available as expected."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub nadmiar wolno rotującego asortymentu powodują niezadowolenie części klientów. Powtarzające się sytuacje osłabiają ocenę Twojego sklepu jako miejsca, w którym można liczyć na stałą dostępność towaru.",
                    en: "Temporary shortages of selected products or excess slow-moving stock cause dissatisfaction among some customers. Repeated situations weaken the perception of your store as a place where product availability can be relied upon."
                },
                orange: {
                    pl: "Częste braki kluczowych produktów na półce lub ciągłe wyprzedaże nadmiernych zapasów obniżają wiarygodność Twojej firmy jako sprawnie zarządzającego detalisty. Klienci zaczynają postrzegać sklep jako nieprzewidywalny pod względem dostępności asortymentu, co osłabia lojalność zakupową.",
                    en: "Frequent shortages of key products or continuous clearance sales of excessive stock reduce your company’s credibility as an efficiently managed retailer. Customers begin to perceive the store as unpredictable in terms of assortment availability, weakening purchase loyalty."
                },
                critical: {
                    pl: "Długotrwałe braki podstawowych produktów lub masowe wyprzedaże niesprzedanego towaru podważają zaufanie do sposobu zarządzania sklepem. Utrwalona opinia o niestabilnej dostępności asortymentu prowadzi do odpływu stałych klientów i trwałej utraty pozycji sklepu jako preferowanego miejsca zakupów w swojej kategorii.",
                    en: "Prolonged shortages of essential products or large-scale clearance of unsold stock undermine trust in how the store is managed. A persistent perception of unstable product availability leads to customer outflow and permanent loss of the store’s position as a preferred shopping destination within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Zatowarowanie sklepu jest dopasowane do bieżącej sprzedaży, a uzupełnianie półek odbywa się bez opóźnień. Towar jest dostępny w kluczowych kategoriach, co pozwala realizować sprzedaż zgodnie z planem dnia.",
                    en: "Store replenishment is aligned with current sales, and shelf restocking takes place without delays. Key product categories remain available, allowing daily sales to proceed according to plan."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub opóźnienia w uzupełnianiu półek powodują konieczność korekt ekspozycji i reorganizacji pracy personelu. Zakłócenia te nie zatrzymują sprzedaży, lecz utrudniają płynne funkcjonowanie sklepu w godzinach szczytu.",
                    en: "Temporary shortages of selected products or delays in shelf restocking require adjustments in product display and staff organization. These disruptions do not stop sales but make store operations less smooth during peak hours."
                },
                orange: {
                    pl: "Powtarzające się braki towaru w kluczowych kategoriach lub nadmierne zaleganie niesprzedanych produktów istotnie destabilizują organizację sprzedaży. Personel musi stale zmieniać ekspozycję i układ asortymentu, co ogranicza zdolność sklepu do sprawnej obsługi klientów.",
                    en: "Repeated shortages in key categories or excessive accumulation of unsold products significantly destabilize sales organization. Staff must constantly adjust displays and assortment layout, limiting the store’s ability to serve customers efficiently."
                },
                critical: {
                    pl: "Długotrwały brak podstawowych produktów lub całe sekcje półek z niesprzedanym towarem prowadzą do dezorganizacji pracy sklepu. Sprzedaż kluczowych kategorii zostaje wstrzymana, co wymaga gruntownej reorganizacji zatowarowania i sposobu prowadzenia sprzedaży.",
                    en: "Prolonged absence of essential products or entire shelf sections filled with unsold stock lead to store disorganization. Sales in key categories are suspended, requiring a fundamental reorganization of inventory management and sales operations."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Obsada sklepu jest stabilna, a rotacja pracowników nie zakłóca organizacji sprzedaży. Koszty pracy pozostają pod kontrolą, co pozwala utrzymać marżę handlową na zakładanym poziomie.",
                    en: "Store staffing remains stable, and employee turnover does not disrupt sales organization. Labor costs stay under control, allowing the planned trade margin to be maintained."
                },
                yellow: {
                    pl: "Wzrost rotacji sprzedawców lub częstsze absencje powodują konieczność zatrudniania pracowników tymczasowych i dodatkowych szkoleń. Wyższe koszty pracy obniżają marżę sklepu, prowadząc do realizacji części sprzedaży poniżej zakładanego poziomu rentowności.",
                    en: "Increased turnover among sales staff or more frequent absences require temporary hiring and additional training. Higher labor costs reduce store margins, leading to part of sales being executed below the planned profitability level."
                },
                orange: {
                    pl: "Niedobór doświadczonych pracowników sprzedaży lub częste zmiany w zespole obniżają efektywność obsługi klientów i wydłużają proces sprzedaży. Spadek wydajności pracy zwiększa koszt jednostkowy sprzedaży, co bezpośrednio obniża marżę realizowanych transakcji.",
                    en: "A shortage of experienced sales staff or frequent team changes reduce customer service efficiency and extend the sales process. Lower productivity increases the unit cost of sales, directly reducing transaction margins."
                },
                critical: {
                    pl: "Utrata kluczowych pracowników lub trwałe braki kadrowe uniemożliwiają utrzymanie pełnych godzin otwarcia i sprawnej obsługi klientów. Ograniczona sprzedaż przy utrzymaniu stałych kosztów wynagrodzeń prowadzi do spadku rentowności sklepu i wymusza ograniczenie zakresu działalności.",
                    en: "Loss of key employees or persistent staffing shortages make it impossible to maintain full opening hours and efficient customer service. Reduced sales while fixed payroll costs remain in place lead to declining store profitability and force a reduction in the scope of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół sprzedaży jest stabilny, a poziom obsługi klientów pozostaje spójny niezależnie od pory dnia. Klienci postrzegają Twój sklep jako miejsce, w którym mogą liczyć na kompetentną pomoc i profesjonalną obsługę.",
                    en: "The sales team remains stable, and the level of customer service is consistent throughout the day. Customers perceive your store as a place where they can rely on competent assistance and professional service."
                },
                yellow: {
                    pl: "Częstsza rotacja pracowników lub różnice w poziomie doświadczenia sprzedawców powodują nierówną jakość obsługi. Powtarzające się uwagi klientów osłabiają wizerunek sklepu jako miejsca zapewniającego stały standard obsługi.",
                    en: "Increased employee turnover or differences in staff experience lead to inconsistent service quality. Repeated customer remarks weaken the image of the store as a place that delivers a consistent service standard."
                },
                orange: {
                    pl: "Braki kadrowe lub niedostateczne przeszkolenie personelu prowadzą do błędów sprzedażowych i wydłużonej obsługi klientów. Negatywne opinie i spadek ocen jakości obsługi podważają wiarygodność Twojego sklepu jako rzetelnego sprzedawcy.",
                    en: "Staff shortages or insufficient training lead to sales errors and extended customer service times. Negative feedback and declining service ratings undermine your store's credibility as a reliable retailer."
                },
                critical: {
                    pl: "Utrata kluczowych sprzedawców lub trwała niestabilność zespołu skutkują widocznym pogorszeniem jakości obsługi klientów. Utrwalona opinia o niskim standardzie obsługi prowadzi do trwałej utraty zaufania i osłabienia pozycji sklepu jako preferowanego miejsca zakupów w swojej kategorii.",
                    en: "Loss of key sales employees or persistent team instability results in a visible decline in customer service quality. A lasting perception of poor service standards leads to permanent loss of trust and weakening of the store’s position as a preferred shopping destination within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Obsada sklepu jest kompletna, a grafik pracy zapewnia płynną obsługę klientów w godzinach szczytu. Zespół realizuje sprzedaż bez zakłóceń, co pozwala utrzymać stabilną organizację pracy na sali sprzedaży.",
                    en: "Store staffing is complete, and the work schedule ensures smooth customer service during peak hours. The team handles sales without disruption, maintaining stable organization on the shop floor."
                },
                yellow: {
                    pl: "Czasowe braki kadrowe lub częstsze zmiany w grafiku powodują konieczność reorganizacji pracy zespołu. Obsługa klientów trwa dłużej, a w godzinach zwiększonego ruchu pojawiają się kolejki.",
                    en: "Temporary staff shortages or frequent schedule changes require reorganization of team duties. Customer service takes longer, and queues appear during peak hours."
                },
                orange: {
                    pl: "Powtarzające się braki personelu lub niedostateczna liczba sprzedawców na zmianie prowadzą do wyraźnych zakłóceń w obsłudze klientów. Część zadań sprzedażowych i ekspozycyjnych nie jest realizowana na bieżąco, co istotnie destabilizuje codzienną pracę sklepu.",
                    en: "Repeated staff shortages or an insufficient number of sales employees per shift lead to clear disruptions in customer service. Some sales and merchandising tasks are not completed on time, which significantly destabilizes daily store operations."
                },
                critical: {
                    pl: "Trwałe braki kadrowe lub nagłe odejście większej części zespołu uniemożliwiają utrzymanie standardowych godzin otwarcia. Sklep ogranicza zakres obsługi klientów, a organizacja pracy wymaga natychmiastowej reorganizacji.",
                    en: "Persistent staffing shortages or sudden departure of a significant part of the team make it impossible to maintain standard opening hours. The store must limit customer service scope, and work organization requires immediate restructuring."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Dokumentacja sprzedażowa, oznaczenia cen oraz procedury reklamacyjne są prowadzone zgodnie z obowiązującymi przepisami. Kontrole nie wykazują uchybień, co pozwala utrzymać stabilną sprzedaż bez ryzyka kar administracyjnych obciążających wynik finansowy sklepu.",
                    en: "Sales documentation, price labeling and complaint procedures comply with applicable regulations. Inspections reveal no deficiencies, allowing stable sales without the risk of administrative penalties affecting the store’s financial result."
                },
                yellow: {
                    pl: "Drobne nieścisłości w oznaczeniach cen lub dokumentacji sprzedażowej zwiększają ryzyko korekt i interwencji ze strony organów kontrolnych. Ewentualne kary lub obowiązek zwrotu części należności prowadzą do obniżenia marży handlowej na wybranych produktach.",
                    en: "Minor inconsistencies in price labeling or sales documentation increase the risk of corrections and regulatory interventions. Potential fines or required refunds reduce trade margins on selected products."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie oznaczeń cen, promocji lub rozliczeń reklamacji mogą skutkować sankcjami administracyjnymi. Nałożone kary oraz obowiązek korekty sprzedaży obniżają rentowność sklepu i wymuszają dostosowanie zasad promocji i rozliczeń sprzedaży.",
                    en: "Repeated irregularities in price labeling, promotions or complaint settlements may result in administrative sanctions. Imposed penalties and required sales corrections reduce store profitability and force adjustments to promotion rules and sales settlement practices."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów konsumenckich lub decyzja organu o czasowym wstrzymaniu sprzedaży określonych produktów bezpośrednio ograniczają możliwość prowadzenia działalności. Utrata części asortymentu przy stałych kosztach operacyjnych prowadzi do spadku rentowności i wymusza ograniczenie zakresu działalności.",
                    en: "Serious breaches of consumer regulations or a decision by authorities to temporarily suspend sales of specific products directly limit business activity. Loss of part of the assortment while fixed operating costs remain leads to declining profitability and forces a reduction in the scope of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Oznaczenia cen, zasady promocji oraz procedury reklamacyjne są przejrzyste i zgodne z obowiązującymi przepisami. Sklep postrzegany jest jako uczciwy i rzetelny podmiot działający zgodnie z zasadami rynku.",
                    en: "Price labeling, promotion rules and complaint procedures are transparent and compliant with applicable regulations. The store is perceived as a fair and reliable business operating in accordance with market rules."
                },
                yellow: {
                    pl: "Pojedyncze nieścisłości w oznaczeniach cen lub komunikacji promocji budzą wątpliwości części klientów. Powtarzające się uwagi osłabiają wizerunek sklepu jako podmiotu w pełni transparentnego w swoich działaniach.",
                    en: "Isolated inconsistencies in price labeling or promotion communication raise concerns among some customers. Repeated remarks weaken the store's image as a fully transparent business."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie prezentowania cen lub warunków promocji prowadzą do skarg klientów i interwencji organów kontrolnych. Informacje o uchybieniach podważają wiarygodność sklepu jako podmiotu działającego zgodnie z przepisami.",
                    en: "Repeated irregularities in price presentation or promotion conditions lead to customer complaints and regulatory interventions. Public information about such deficiencies undermines the store’s credibility as a business operating in compliance with regulations."
                },
                critical: {
                    pl: "Stwierdzone naruszenia przepisów konsumenckich lub decyzje administracyjne o nałożeniu sankcji stają się publicznie znane. Utrwalona opinia o nieuczciwych praktykach prowadzi do trwałej utraty zaufania oraz utraty statusu rzetelnego sprzedawcy w swojej kategorii.",
                    en: "Confirmed breaches of consumer regulations or administrative sanctions become publicly known. A sustained perception of unfair practices leads to permanent loss of trust and loss of status as a reputable retailer within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Sklep spełnia wymogi formalne dotyczące oznaczeń, procedur sprzedaży oraz warunków prowadzenia działalności. Kontrole nie wykazują uchybień, co pozwala prowadzić sprzedaż bez ograniczeń administracyjnych.",
                    en: "The store complies with formal requirements regarding labeling, sales procedures and operating conditions. Inspections reveal no deficiencies, allowing sales to continue without administrative restrictions."
                },
                yellow: {
                    pl: "Stwierdzone drobne uchybienia formalne wymagają korekt w dokumentacji lub sposobie oznaczania towaru. Do czasu ich usunięcia działalność sklepu podlega zwiększonemu nadzorowi ze strony organów kontrolnych.",
                    en: "Identified minor formal deficiencies require corrections in documentation or product labeling. Until they are resolved, the store operates under increased scrutiny from regulatory authorities."
                },
                orange: {
                    pl: "Powtarzające się niezgodności z przepisami dotyczącymi sprzedaży lub promocji prowadzą do wydania zaleceń pokontrolnych i terminów obowiązkowej korekty. Niewykonanie zaleceń w wyznaczonym czasie może skutkować czasowym ograniczeniem sprzedaży wybranych produktów.",
                    en: "Repeated non-compliance with regulations related to sales or promotions leads to official corrective orders and mandatory deadlines. Failure to implement required changes within the specified time may result in temporary restriction of sales of selected products."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów handlowych lub sanitarno-konsumenckich mogą skutkować decyzją o czasowym zamknięciu sklepu lub wstrzymaniu sprzedaży określonych kategorii towarów. W praktyce oznacza to obowiązkowe wstrzymanie działalności do czasu przywrócenia pełnej zgodności z decyzją organu.",
                    en: "Serious breaches of commercial or consumer regulations may result in a decision to temporarily close the store or suspend sales of specific product categories. In practice, this means mandatory suspension of operations until full compliance with the authority’ s decision is restored."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z dostawcami przebiega stabilnie, a dostawy towaru realizowane są terminowo i zgodnie z zamówieniami. Warunki zakupu pozwalają utrzymać zakładaną marżę handlową bez presji na poziom cen sprzedaży.",
                    en: "Cooperation with suppliers remains stable, and product deliveries are carried out on time and in line with orders. Purchasing terms allow the planned trade margin to be maintained without pressure on sales prices."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach lub mniej korzystne warunki zakupu wybranych produktów zwiększają koszt zatowarowania. Wyższe ceny zakupu ograniczają rentowność sprzedaży, prowadząc do spadku marży na wybranych kategoriach.",
                    en: "Delivery delays or less favorable purchasing terms for selected products increase stocking costs. Higher purchase prices limit sales profitability, leading to margin decline in selected categories."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach lub znaczący wzrost cen zakupu towaru destabilizują politykę cenową sklepu. Konieczność sprzedaży części asortymentu przy wyższym koszcie jednostkowym bez proporcjonalnej podwyżki cen bezpośrednio obniża marżę realizowanych produktów.",
                    en: "Repeated supply disruptions or a significant increase in purchase prices destabilize the store’s pricing policy. The need to sell part of the assortment at a higher unit cost without proportional price increases directly reduces product margins."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy lub gwałtowny wzrost cen zakupu podstawowego asortymentu ograniczają dostępność towaru i wymuszają zakupy na mniej korzystnych warunkach. Sprzedaż przy podwyższonym koszcie zakupu prowadzi do realizacji części obrotu poniżej progu rentowności, co wymusza wycofanie się z nierentownych kategorii oraz ograniczenie skali działalności.",
                    en: "Loss of a key supplier or a sharp increase in purchase prices of core products limits product availability and forces procurement on less favorable terms. Selling goods at elevated purchase costs results in part of turnover being executed below the profitability threshold, forcing withdrawal from unprofitable categories and a reduction in the scale of operations."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami przebiega stabilnie, a dostępność kluczowego asortymentu utrzymuje się na stałym poziomie. Klienci postrzegają sklep jako miejsce, w którym towar jest regularnie dostępny i zgodny z deklarowaną ofertą.",
                    en: "Cooperation with suppliers remains stable, and the availability of key products is consistent. Customers perceive the store as a place where products are regularly available and aligned with the declared offer."
                },
                yellow: {
                    pl: "Czasowe braki wybranych produktów lub opóźnienia w dostawach budzą pytania klientów o stabilność oferty. Powtarzające się sytuacje osłabiają postrzeganie sklepu jako podmiotu mającego pełną kontrolę nad swoim asortymentem.",
                    en: "Temporary shortages of selected products or delivery delays raise customer concerns about offer stability. Repeated situations weaken the perception of the store as a business fully controlling its assortment."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach lub nagłe wycofanie produktów przez dostawców prowadzą do widocznych braków w kluczowych kategoriach. Klienci zaczynają postrzegać sklep jako nieprzewidywalny pod względem dostępności towaru, co osłabia jego wiarygodność jako stałego partnera zakupowego.",
                    en: "Repeated supply disruptions or sudden withdrawal of products by suppliers lead to visible shortages in key categories. Customers begin to perceive the store as unpredictable in terms of product availability, weakening its credibility as a consistent shopping partner."
                },
                critical: {
                    pl: "Utrata kluczowych dostawców lub długotrwałe braki podstawowego asortymentu podważają stabilność oferty sklepu. Utrwalona opinia o nieregularnej dostępności asortymentu prowadzi do trwałej utraty zaufania oraz utraty pozycji sklepu jako stabilnego sprzedawcy w swojej kategorii.",
                    en: "Loss of key suppliers or prolonged shortages of core products undermine the stability of the store’s offer. A sustained perception of irregular assortment availability leads to permanent loss of trust and loss of the store’s position as a stable retailer within its category."
                }
            },
            Operational: {
                green: {
                    pl: "Dostawy od kluczowych dostawców realizowane są terminowo, a zatowarowanie sklepu przebiega zgodnie z planem. Uzupełnianie półek odbywa się bez zakłóceń, co pozwala utrzymać ciągłość sprzedaży we wszystkich głównych kategoriach.",
                    en: "Deliveries from key suppliers are carried out on time, and store replenishment follows the planned schedule. Shelf restocking proceeds without disruption, allowing continuous sales across all main categories."
                },
                yellow: {
                    pl: "Opóźnienia w dostawach wybranych produktów wymagają korekt zamówień i reorganizacji ekspozycji. Sklep utrzymuje sprzedaż, jednak dostępność części asortymentu jest okresowo ograniczona.",
                    en: "Delays in deliveries of selected products require order adjustments and reorganization of product displays. Sales continue, but availability of part of the assortment is temporarily limited."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w dostawach prowadzą do braków w kluczowych kategoriach oraz konieczności częstych zmian w planie zatowarowania. Organizacja sprzedaży wymaga stałej interwencji, co destabilizuje bieżące funkcjonowanie sklepu i utrudnia utrzymanie ciągłości sprzedaży w głównych segmentach asortymentu.",
                    en: "Repeated supply disruptions lead to shortages in key categories and require frequent changes in replenishment planning. Sales organization demands constant intervention, destabilizing the store’s day-to-day operations and making it difficult to maintain continuous sales across core assortment segments."
                },
                critical: {
                    pl: "Długotrwałe wstrzymanie dostaw od kluczowych partnerów lub zerwanie współpracy z głównym dostawcą uniemożliwia utrzymanie podstawowego asortymentu. Sklep traci zdolność do prowadzenia regularnej sprzedaży w wybranych kategoriach, co wymaga natychmiastowej reorganizacji źródeł zaopatrzenia.",
                    en: "Prolonged suspension of deliveries from key partners or termination of cooperation with a main supplier makes it impossible to maintain core assortment. The store loses the ability to conduct regular sales in selected categories, requiring immediate reorganization of sourcing channels."
                }
            }
        }
    },
    it_software: {
        E: {
            Business: {
                green: {
                    pl: "Koszt wytworzenia oprogramowania jest zgodny z budżetem projektowym, a wykorzystanie zespołu pozostaje na stabilnym poziomie. Realizowane projekty utrzymują zakładaną marżę i zapewniają przewidywalny wynik finansowy.",
                    en: "Software development costs remain in line with project budgets, and team utilization stays at a stable level. Ongoing projects maintain the planned margin and deliver a predictable financial result."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji zadań lub niższa wydajność zespołu zwiększają koszt roboczogodziny w projekcie. Część kontraktów realizowana jest przy obniżonej marży, co ogranicza rentowność wybranych projektów.",
                    en: "Extended task completion times or lower team productivity increase the effective hourly cost within projects. Some contracts are executed at reduced margins, limiting profitability of selected projects."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia budżetu projektowego lub niedoszacowanie zakresu prac prowadzą do istotnego wzrostu kosztu wytworzenia oprogramowania. Realizacja projektów przy podwyższonym koszcie pracy powoduje spadek marży operacyjnej i osłabia rentowność całego portfela zleceń.",
                    en: "Repeated budget overruns or underestimation of project scope lead to a significant increase in software development costs. Executing projects at elevated labor costs reduces operating margins and weakens profitability across the project portfolio."
                },
                critical: {
                    pl: "Systematyczne przekraczanie budżetów oraz niska efektywność wykorzystania zespołu prowadzą do realizacji projektów poniżej progu rentowności. Spadek marży przy stałych kosztach wynagrodzeń prowadzi do presji na płynność projektową i wymusza ograniczenie skali działalności oraz selektywne przyjmowanie nowych zleceń.",
                    en: "Systematic budget overruns and low team utilization result in projects being delivered below the profitability threshold. Margin decline combined with fixed payroll costs creates pressure on project cash flow and forces a reduction in operational scale as well as selective acceptance of new contracts."
                }
            },
            Reputation: {
                green: {
                    pl: "Proces wytwórczy oprogramowania jest stabilny, a liczba błędów wdrożeniowych utrzymuje się na niskim poziomie. Systemy działają zgodnie z uzgodnionymi parametrami jakości i dostępności, co buduje wizerunek Twojej firmy jako technologicznie solidnego partnera.",
                    en: "The software development process remains stable, and the number of deployment defects stays low. Systems operate in line with agreed quality and availability parameters, strengthening your company’s image as a technologically reliable partner."
                },
                yellow: {
                    pl: "Zwiększona liczba poprawek po wdrożeniu oraz niestabilność wybranych środowisk produkcyjnych wskazują na obniżenie powtarzalności procesu technologicznego. Klienci zaczynają postrzegać Twoją firmę jako mniej przewidywalną pod względem jakości technicznej realizowanych projektów.",
                    en: "An increased number of post-deployment fixes and instability in selected production environments indicate reduced consistency of the development process. Clients begin to perceive your company as less predictable in terms of technical quality."
                },
                orange: {
                    pl: "Powtarzające się błędy wdrożeniowe oraz brak stabilności środowisk produkcyjnych prowadzą do utraty referencji technicznych i pogorszenia ocen jakości wykonania. Twoja firma może przestać być postrzegana jako dostawca gwarantujący powtarzalny standard technologiczny.",
                    en: "Repeated deployment defects and unstable production environments result in the loss of technical references and lower quality assessments. Your company may cease to be perceived as a provider ensuring consistent technological standards."
                },
                critical: {
                    pl: "Utrzymujące się problemy z jakością kodu i stabilnością systemów powodują utrwalenie opinii o niskiej dojrzałości procesu technologicznego. Twoja firma może utracić status rzetelnego wykonawcy projektów informatycznych i zostać wykluczona z list kwalifikowanych dostawców przy kluczowych wdrożeniach.",
                    en: "Ongoing issues with code quality and system stability solidify a perception of low technological process maturity. Your company may lose its status as a reliable IT project provider and be excluded from qualified supplier lists for key implementations."
                }
            },
            Operational: {
                green: {
                    pl: "Wdrożenia przebiegają bez zakłóceń, a systemy po uruchomieniu działają stabilnie. Zespół realizuje zaplanowane etapy prac w przewidywalnym tempie i utrzymuje kontrolę nad harmonogramem projektów.",
                    en: "Deployments proceed without disruption, and systems remain stable after launch. The team delivers planned work at a predictable pace and maintains control over project timelines."
                },
                yellow: {
                    pl: "Pojawiają się opóźnienia po wdrożeniach, które wymagają dodatkowych poprawek i przesunięć części zaplanowanych prac. Tempo realizacji sprintów spada, a kolejne wydania systemu są przesuwane, co ogranicza bieżącą przepustowość zespołu.",
                    en: "Post-deployment issues require additional fixes and force adjustments to planned work. Sprint execution slows down, and system releases are postponed, reducing the team's current delivery capacity."
                },
                orange: {
                    pl: "Powtarzające się problemy po wdrożeniach prowadzą do wstrzymania kolejnych uruchomień systemu i zamrożenia części zaplanowanych funkcjonalności. Zespół koncentruje się na stabilizacji istniejących rozwiązań, a rozwój roadmapy zostaje czasowo zatrzymany.",
                    en: "Repeated post-deployment issues result in suspension of further system releases and freezing of planned features. The team focuses on stabilizing existing solutions, while roadmap development is temporarily halted."
                },
                critical: {
                    pl: "Środowisko produkcyjne pozostaje niestabilne przez dłuższy czas, a kolejne wdrożenia są odkładane bez jasno określonego terminu. Organizacja przechodzi w stały tryb reagowania na awarie i traci zdolność do planowania kolejnych etapów rozwoju.",
                    en: "The production environment remains unstable for an extended period, and further deployments are postponed without a clear timeline. The organization shifts into a constant incident-response mode and loses the ability to plan future development stages."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół jest stabilny, a rotacja niska. Projekty realizowane są zgodnie z planem obsadowym, utrzymując zakładaną marżę oraz przewidywalny zysk z kontraktów.",
                    en: "The team remains stable, and turnover is low. Projects are delivered according to staffing plans, maintaining expected margins and predictable profit from contracts."
                },
                yellow: {
                    pl: "Pojedyncze odejścia kluczowych specjalistów lub opóźnienia w rekrutacji wydłużają czas kompletowania zespołów projektowych. Część prac wymaga angażowania droższych podwykonawców, co skutkuje niższym niż zakładany zyskiem z wybranych kontraktów.",
                    en: "Isolated departures of key specialists or recruitment delays extend project staffing timelines. Some work requires engaging higher-cost subcontractors, resulting in lower-than-planned profit on selected contracts."
                },
                orange: {
                    pl: "Powtarzająca się rotacja w kluczowych rolach oraz presja płacowa powodują trwały wzrost kosztu pracy w projektach. Przy niezmienionych stawkach dla klientów zysk z realizowanych kontraktów zaczyna być niższy niż zakładano na etapie sprzedaży, co ogranicza rentowność całej działalności.",
                    en: "Repeated turnover in key roles and salary pressure lead to a structural increase in project labor costs. With client rates unchanged, profit from ongoing contracts becomes lower than originally estimated at the sales stage, reducing overall business profitability."
                },
                critical: {
                    pl: "Utrata doświadczonych członków zespołu przy jednoczesnym wzroście wynagrodzeń powoduje trwały wzrost kosztu realizacji projektów. Znaczna część kontraktów realizowana jest poniżej progu opłacalności, co zmusza właściciela do ograniczenia skali działalności lub selektywnego przyjmowania nowych zleceń.",
                    en: "Loss of experienced team members combined with rising payroll costs permanently increases project delivery costs. A significant portion of contracts is executed below the profitability threshold, forcing the owner to reduce operational scale or selectively accept new projects."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół programistyczny jest stabilny, a kluczowe role pozostają obsadzone przez doświadczonych specjalistów. Klienci postrzegają Twoją firmę jako przewidywalnego partnera, który zapewnia ciągłość kompetencji w trakcie realizacji projektów.",
                    en: "The development team remains stable, with key roles held by experienced specialists. Clients perceive your company as a predictable partner that ensures continuity of expertise throughout project delivery."
                },
                yellow: {
                    pl: "Pojedyncze odejścia specjalistów lub częste zmiany w składzie zespołu zaczynają być zauważalne dla klientów. Współpraca pozostaje możliwa, jednak pojawiają się pytania o stabilność kompetencji przy dłuższych projektach.",
                    en: "Isolated departures of specialists or frequent team changes become noticeable to clients. Cooperation continues, but questions arise regarding the stability of expertise in long-term projects."
                },
                orange: {
                    pl: "Powtarzająca się rotacja w kluczowych rolach oraz brak ciągłości zespołu prowadzą do spadku zaufania do jakości realizacji projektów. Twoja firma może przestać być postrzegana jako partner gwarantujący stabilny skład i przewidywalny poziom kompetencji.",
                    en: "Repeated turnover in key roles and lack of team continuity lead to declining trust in project delivery quality. Your company may cease to be perceived as a partner ensuring a stable team structure and predictable competence levels."
                },
                critical: {
                    pl: "Częste zmiany w zespole oraz brak doświadczonych specjalistów powodują utrwalenie opinii o niestabilności kadrowej. Twoja firma może utracić status rzetelnego wykonawcy wymagających projektów i zostać pomijana przy wyborze dostawców do kluczowych wdrożeń.",
                    en: "Frequent team changes and lack of experienced specialists reinforce a perception of staffing instability. Your company may lose its status as a reliable contractor for demanding projects and be overlooked in supplier selection for key implementations."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół jest kompletny, a kluczowe role pozostają obsadzone. Projekty realizowane są zgodnie z planem, a obciążenie pracą jest równomiernie rozłożone, co pozwala utrzymać przewidywalne tempo realizacji.",
                    en: "The team is fully staffed, with key roles properly covered. Projects are delivered according to plan, and workload is evenly distributed, maintaining a predictable delivery pace."
                },
                yellow: {
                    pl: "Pojawiają się okresowe braki kadrowe lub zwiększone obciążenie wybranych specjalistów. Część zaplanowanych prac jest przesuwana, a tempo realizacji projektów spada, choć organizacja nadal zachowuje kontrolę nad harmonogramem.",
                    en: "Temporary staffing gaps or increased workload among selected specialists occur. Some planned tasks are postponed, and project execution slows down, although overall schedule control is still maintained."
                },
                orange: {
                    pl: "Powtarzające się braki kadrowe oraz nierównomierne obciążenie zespołu prowadzą do wstrzymania części nowych inicjatyw. Organizacja koncentruje się na dokończeniu rozpoczętych projektów, a możliwość przyjmowania kolejnych zleceń zostaje istotnie ograniczona.",
                    en: "Repeated staffing shortages and uneven workload distribution lead to suspension of certain new initiatives. The organization focuses on completing ongoing projects, and its ability to take on additional work becomes significantly limited."
                },
                critical: {
                    pl: "Długotrwałe braki w kluczowych rolach oraz przeciążenie zespołu powodują dezorganizację pracy i brak przewidywalności realizacji projektów. Firma traci zdolność planowania kolejnych etapów rozwoju i funkcjonuje w trybie ciągłego reagowania na bieżące braki kadrowe.",
                    en: "Prolonged gaps in key roles and sustained team overload lead to work disorganization and unpredictable project delivery. The company loses the ability to plan further development stages and operates in a constant reactive mode driven by staffing shortages."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z wymogami dotyczącymi ochrony danych, licencji oraz zapisów umownych. Koszty związane z bezpieczeństwem i zgodnością są przewidywalne i uwzględnione w wycenie projektów, co pozwala utrzymać zakładaną marżę.",
                    en: "The company maintains full compliance with data protection requirements, licensing obligations, and contractual terms. Compliance-related costs are predictable and included in project pricing, allowing planned margins to be maintained."
                },
                yellow: {
                    pl: "Pojawiają się dodatkowe wymagania prawne lub audytowe, które wymagają korekt w dokumentacji i zabezpieczeniach systemów. Część projektów generuje nieplanowane koszty dostosowawcze, co obniża zysk w stosunku do pierwotnych założeń.",
                    en: "Additional legal or audit requirements require adjustments to documentation and system safeguards. Some projects generate unplanned compliance costs, reducing profit compared to initial estimates."
                },
                orange: {
                    pl: "Powtarzające się wymogi regulacyjne oraz konieczność wdrażania dodatkowych zabezpieczeń zwiększają koszt realizacji projektów. Przy stałych stawkach dla klientów zysk z części kontraktów spada poniżej zakładanego poziomu rentowności, co ogranicza opłacalność przyjmowania podobnych zleceń.",
                    en: "Recurring regulatory requirements and the need for additional safeguards increase project delivery costs. With client rates unchanged, profit from certain contracts falls below the expected profitability level, limiting the viability of similar engagements."
                },
                critical: {
                    pl: "Znaczące naruszenia wymogów regulacyjnych lub wysokie kary administracyjne lub odszkodowania wynikające z naruszeń umownych powodują gwałtowny wzrost kosztów działalności. Firma realizuje część projektów poniżej progu opłacalności, co wymusza ograniczenie zakresu oferowanych usług lub rezygnację z wybranych segmentów rynku.",
                    en: "Significant regulatory breaches or substantial administrative penalties or contractual damages resulting from compliance failures cause a sharp increase in operating costs. The company executes part of its projects below the profitability threshold, forcing a reduction in service scope or withdrawal from selected market segments."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma utrzymuje pełną zgodność z wymaganiami dotyczącymi ochrony danych, licencji oraz zapisów umownych. Klienci postrzegają ją jako partnera, który zapewnia bezpieczne i zgodne z przepisami środowisko realizacji projektów.",
                    en: "The company maintains full compliance with data protection requirements, licensing obligations, and contractual terms. Clients perceive it as a partner that ensures a secure and compliant project environment."
                },
                yellow: {
                    pl: "Pojawiają się pojedyncze uchybienia w dokumentacji lub opóźnienia w aktualizacji procedur bezpieczeństwa. Współpraca pozostaje stabilna, jednak klienci zaczynają oczekiwać dodatkowych wyjaśnień dotyczących sposobu zarządzania zgodnością.",
                    en: "Isolated documentation gaps or delays in updating security procedures occur. Cooperation remains stable, but clients begin to request additional clarification regarding compliance management."
                },
                orange: {
                    pl: "Powtarzające się nieprawidłowości w zakresie ochrony danych lub niespójności w zapisach umownych prowadzą do spadku zaufania do standardów zgodności. Twoja firma może przestać być postrzegana jako partner gwarantujący bezpieczne przetwarzanie danych i zgodne z prawem realizowanie projektów.",
                    en: "Repeated irregularities in data protection practices or inconsistencies in contractual provisions reduce trust in compliance standards. Your company may cease to be perceived as a partner ensuring secure data processing and legally compliant project execution."
                },
                critical: {
                    pl: "Poważne naruszenia wymogów regulacyjnych lub publicznie ujawnione incydenty związane z bezpieczeństwem danych powodują utrwalenie opinii o niewystarczającym poziomie bezpieczeństwa i nadzoru prawnego. Twoja firma może utracić status wiarygodnego dostawcy w projektach wymagających wysokiego poziomu bezpieczeństwa i nadzoru prawnego.",
                    en: "Serious regulatory breaches or publicly disclosed data security incidents reinforce a perception of insufficient security and legal oversight standards. Your company may lose its status as a trusted provider in projects requiring a high level of security and regulatory supervision."
                }
            },
            Operational: {
                green: {
                    pl: "Procesy ochrony danych, zarządzania licencjami oraz realizacji obowiązków umownych są aktualne i zgodne z wymaganiami. Projekty mogą być realizowane bez dodatkowych ograniczeń formalnych, a organizacja zachowuje pełną swobodę operacyjną.",
                    en: "Data protection processes, license management, and contractual obligations are up to date and compliant. Projects can be executed without additional formal restrictions, and the organization maintains full operational freedom."
                },
                yellow: {
                    pl: "Stwierdzone uchybienia wymagają uzupełnienia dokumentacji lub dostosowania procedur bezpieczeństwa. Projekty są kontynuowane, jednak część działań projektowych lub wdrożeniowych musi zostać czasowo wstrzymana do momentu usunięcia niezgodności.",
                    en: "Identified deficiencies require updates to documentation or adjustments to security procedures. Projects continue, but certain project or deployment activities must be temporarily suspended until compliance gaps are resolved."
                },
                orange: {
                    pl: "Powtarzające się niezgodności lub negatywne wyniki audytów prowadzą do nałożenia dodatkowych wymogów nadzorczych. Realizacja wybranych projektów zostaje ograniczona do czasu wdrożenia wymaganych zabezpieczeń i procedur, co wyraźnie zawęża zakres bieżącej działalności.",
                    en: "Repeated compliance issues or negative audit findings lead to the imposition of additional supervisory requirements. Execution of selected projects is restricted until required safeguards and procedures are implemented, significantly narrowing current operational scope."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub decyzje organów nadzorczych skutkują obowiązkowym wstrzymaniem części działalności do czasu przywrócenia pełnej zgodności. Firma traci możliwość realizacji projektów objętych nadzorem, co wymaga natychmiastowej reorganizacji sposobu prowadzenia działalności.",
                    en: "Serious regulatory breaches or supervisory authority decisions result in mandatory suspension of part of the business until full compliance is restored. The company loses the ability to execute projects under supervision, requiring immediate reorganization of operational activities."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami oraz dostawcami technologii przebiega stabilnie, a koszty usług zewnętrznych są zgodne z założeniami projektowymi. Marża na realizowanych kontraktach pozostaje na planowanym poziomie.",
                    en: "Cooperation with subcontractors and technology providers remains stable, and external service costs align with project assumptions. Margins on delivered contracts remain at the planned level."
                },
                yellow: {
                    pl: "Wzrost stawek podwykonawców lub kosztów usług chmurowych powoduje korekty budżetów projektowych. Część kontraktów generuje niższy zysk niż zakładano, choć rentowność całej działalności pozostaje pod kontrolą.",
                    en: "Increased subcontractor rates or cloud service costs require adjustments to project budgets. Some contracts generate lower profit than expected, although overall business profitability remains under control."
                },
                orange: {
                    pl: "Powtarzające się podwyżki cen usług zewnętrznych oraz rosnące koszty infrastruktury powodują trwały wzrost kosztu realizacji projektów. Przy niezmienionych stawkach dla klientów zysk z części kontraktów spada poniżej zakładanego poziomu rentowności, co ogranicza opłacalność przyjmowania nowych zleceń.",
                    en: "Recurring price increases from external providers and rising infrastructure costs lead to a structural increase in project delivery expenses. With client rates unchanged, profit from certain contracts falls below the expected profitability level, limiting the viability of accepting new projects."
                },
                critical: {
                    pl: "Utrata kluczowego dostawcy technologii lub gwałtowny wzrost kosztów usług zewnętrznych powodują, że znacząca część projektów realizowana jest poniżej progu opłacalności. Firma zmuszona jest ograniczyć zakres działalności lub wycofać się z części projektów wymagających wysokiego udziału usług zewnętrznych.",
                    en: "Loss of a key technology provider or a sharp increase in external service costs causes a significant portion of projects to be executed below the profitability threshold. The company is forced to reduce its operational scope or withdraw from projects requiring a high reliance on external services."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z dostawcami technologii i podwykonawcami przebiega stabilnie, a relacje są długoterminowe i przewidywalne. Klienci postrzegają Twoją firmę jako partnera, który zapewnia ciągłość dostępu do kluczowych rozwiązań technologicznych.",
                    en: "Cooperation with technology providers and subcontractors remains stable, with long-term and predictable relationships. Clients perceive your company as a partner ensuring continuous access to key technological solutions."
                },
                yellow: {
                    pl: "Pojedyncze zmiany dostawców lub przerwy we współpracy z podwykonawcami zaczynają być zauważalne w projektach. Zaufanie do stabilności zaplecza technologicznego pozostaje, jednak klienci oczekują większej przejrzystości w zakresie wyboru partnerów.",
                    en: "Isolated supplier changes or temporary interruptions in subcontractor cooperation become noticeable within projects. Trust in the stability of the technological base remains, but clients expect greater transparency regarding partner selection."
                },
                orange: {
                    pl: "Powtarzające się zmiany dostawców technologii lub problemy z ciągłością współpracy z kluczowymi partnerami prowadzą do spadku zaufania do stabilności realizowanych rozwiązań. Twoja firma może przestać być postrzegana jako integrator gwarantujący trwałe i przewidywalne środowisko technologiczne.",
                    en: "Repeated changes of technology providers or continuity issues with key partners reduce trust in the stability of delivered solutions. Your company may cease to be perceived as an integrator ensuring a durable and predictable technological environment."
                },
                critical: {
                    pl: "Częste zerwania współpracy z kluczowymi dostawcami lub publiczne konflikty lub nagłe zerwania umów z partnerami technologicznymi powodują utrwalenie opinii o braku stabilnego zaplecza zewnętrznego. Twoja firma może zostać pomijana przy projektach wymagających długoterminowej współpracy i wysokiej niezawodności infrastruktury.",
                    en: "Frequent termination of cooperation with key suppliers or public conflicts or sudden contract terminations with technology partners reinforce a perception of unstable external support. Your company may be overlooked in projects requiring long-term cooperation and high infrastructure reliability."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z dostawcami chmury, infrastruktury i podwykonawcami przebiega bez zakłóceń. Systemy zewnętrzne działają stabilnie, co pozwala realizować projekty zgodnie z planem i utrzymywać ciągłość wdrożeń.",
                    en: "Cooperation with cloud providers, infrastructure partners, and subcontractors remains uninterrupted. External systems operate reliably, enabling projects to be delivered according to plan and ensuring continuity of deployments."
                },
                yellow: {
                    pl: "Pojawiają się czasowe przerwy w dostępności usług zewnętrznych lub opóźnienia po stronie partnerów technologicznych. Część prac wdrożeniowych musi zostać przesunięta, jednak organizacja nadal zachowuje kontrolę nad harmonogramem projektów.",
                    en: "Temporary service outages or delays on the side of technology partners occur. Some deployment activities must be postponed, but the organization still maintains overall control of project timelines."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostępnością usług chmurowych lub niestabilność współpracy z kluczowym dostawcą prowadzą do wstrzymania części wdrożeń. Zespół koncentruje się na utrzymaniu bieżących systemów, a realizacja nowych projektów zostaje istotnie ograniczona.",
                    en: "Repeated cloud service disruptions or instability in cooperation with a key provider lead to suspension of certain deployments. The team focuses on maintaining existing systems, while execution of new projects becomes significantly limited."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych usług zewnętrznych lub zerwanie współpracy z głównym dostawcą uniemożliwia realizację projektów wymagających tej infrastruktury. Organizacja traci zdolność planowania kolejnych wdrożeń w tym obszarze i musi pilnie reorganizować źródła technologiczne.",
                    en: "Prolonged unavailability of critical external services or termination of cooperation with a main provider makes it impossible to execute projects dependent on that infrastructure. The organization loses the ability to plan further deployments in this area and must urgently reorganize its technology sources."
                }
            }
        }
    },
    finance_fintech: {
        E: {
            Business: {
                green: {
                    pl: "Koszt obsługi transakcji oraz utrzymania systemów finansowych pozostaje zgodny z założeniami budżetowymi. Efektywność procesów operacyjnych pozwala utrzymać planowaną marżę na oferowanych usługach finansowych.",
                    en: "The cost of transaction processing and maintaining financial systems remains in line with budget assumptions. Operational efficiency allows the company to maintain planned margins on financial services."
                },
                yellow: {
                    pl: "Wzrost kosztów obsługi transakcji lub utrzymania infrastruktury powoduje korekty w budżetach operacyjnych. Część produktów finansowych generuje niższy zysk niż zakładano, choć rentowność całej działalności pozostaje stabilna.",
                    en: "Increased transaction processing or infrastructure costs require adjustments to operating budgets. Some financial products generate lower profit than expected, although overall business profitability remains stable."
                },
                orange: {
                    pl: "Powtarzający się wzrost kosztu jednostkowego transakcji oraz rosnące koszty technologiczne powodują trwałe obniżenie marży na wybranych usługach. Część produktów realizowana jest poniżej zakładanego poziomu rentowności, co ogranicza opłacalność dalszego skalowania działalności.",
                    en: "Recurring increases in per-transaction costs and rising technology expenses lead to a structural decline in margins on selected services. Some products are delivered below the expected profitability level, limiting the viability of further scaling."
                },
                critical: {
                    pl: "Znaczący wzrost kosztu przetwarzania operacji finansowych oraz utrzymania infrastruktury powoduje, że istotna część oferty realizowana jest poniżej progu opłacalności. Firma zmuszona jest ograniczyć zakres usług, podnieść opłaty dla klientów lub wycofać się z nierentownych segmentów rynku.",
                    en: "A substantial increase in transaction processing and infrastructure costs results in a significant portion of services being delivered below the profitability threshold. The company is forced to reduce its service scope, raise client fees, or withdraw from unprofitable market segments."
                }
            },
            Reputation: {
                green: {
                    pl: "Systemy finansowe działają sprawnie, a przetwarzanie transakcji przebiega bez opóźnień. Klienci postrzegają firmę jako stabilnego i przewidywalnego partnera w obsłudze operacji finansowych.",
                    en: "Financial systems operate smoothly, and transaction processing runs without delays. Clients perceive the company as a stable and predictable partner in handling financial operations."
                },
                yellow: {
                    pl: "Pojawiają się okresowe opóźnienia w realizacji transakcji lub wydłużony czas reakcji systemów. Obsługa klientów pozostaje możliwa, jednak zaczynają pojawiać się pytania o skalowalność i wydajność infrastruktury.",
                    en: "Occasional transaction delays or extended system response times occur. Client service continues, but questions arise regarding the scalability and performance of the infrastructure."
                },
                orange: {
                    pl: "Powtarzające się zakłócenia w przetwarzaniu operacji finansowych lub dłuższe przerwy w dostępności usług prowadzą do spadku zaufania do stabilności systemu. Firma może przestać być postrzegana jako podmiot zapewniający nieprzerwaną i przewidywalną obsługę transakcji.",
                    en: "Repeated disruptions in financial transaction processing or extended service outages reduce trust in system stability. The company may cease to be perceived as an entity ensuring uninterrupted and predictable transaction handling."
                },
                critical: {
                    pl: "Poważne lub publicznie nagłośnione przerwy w działaniu systemów finansowych powodują utrwalenie opinii o niewystarczającej sprawności operacyjnej. Firma może utracić status wiarygodnego operatora usług finansowych, szczególnie w obszarach wymagających wysokiej dostępności 24/7 lub obsługi dużego wolumenu transakcji.",
                    en: "Serious or publicly reported disruptions in financial systems reinforce a perception of insufficient operational reliability. The company may lose its status as a trusted financial services operator, particularly in areas requiring 24/7 availability or high transaction volumes."
                }
            },
            Operational: {
                green: {
                    pl: "Systemy przetwarzania transakcji działają stabilnie, a czas realizacji operacji pozostaje przewidywalny. Infrastruktura finansowa obsługuje bieżący wolumen bez przeciążeń, co pozwala utrzymać pełną kontrolę nad procesami operacyjnymi.",
                    en: "Transaction processing systems operate stably, and execution times remain predictable. The financial infrastructure handles current volumes without overload, maintaining full operational control."
                },
                yellow: {
                    pl: "Pojawiają się okresowe spowolnienia w przetwarzaniu operacji lub chwilowe przeciążenia systemu. Zespół musi reagować na zwiększoną liczbę zgłoszeń technicznych, co ogranicza część dostępnej przepustowości, jednak ciągłość działania zostaje zachowana.",
                    en: "Occasional slowdowns in transaction processing or temporary system overloads occur. The team must respond to an increased number of technical incidents, reducing available capacity, but operational continuity is maintained."
                },
                orange: {
                    pl: "Powtarzające się przeciążenia systemów lub niestabilność infrastruktury powodują wstrzymywanie części operacji finansowych oraz ograniczenie dostępności wybranych funkcji. Organizacja przechodzi w tryb stałej interwencji technicznej, co istotnie ogranicza zdolność do planowego rozwoju systemu.",
                    en: "Recurring system overloads or infrastructure instability lead to partial suspension of financial operations and limited availability of selected functions. The organization shifts into continuous technical intervention mode, significantly restricting planned system development."
                },
                critical: {
                    pl: "Długotrwała niestabilność systemów finansowych uniemożliwia przewidywalne przetwarzanie operacji i wymusza działanie w trybie ciągłego reagowania na incydenty. Organizacja traci zdolność do planowania wdrożeń oraz utrzymania stałej dostępności usług.",
                    en: "Prolonged instability of financial systems makes transaction processing unpredictable and forces the organization into constant incident response mode. The company loses the ability to plan deployments and maintain consistent service availability."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół projektowy i operacyjny realizuje zadania zgodnie z planowaną wydajnością, a koszt pracy pozostaje zgodny z założeniami budżetowymi. Projekty finansowe generują zakładany poziom zysku, bez presji na marżę.",
                    en: "The project and operations team delivers work in line with planned productivity, and labor costs remain within budget assumptions. Financial projects generate the expected level of profit without margin pressure."
                },
                yellow: {
                    pl: "Wydłużony czas realizacji zadań lub zwiększona rotacja pracowników powodują wzrost kosztu projektu. Część kontraktów zaczyna generować niższy zysk niż zakładano na etapie sprzedaży, choć rentowność całego portfela pozostaje pod kontrolą.",
                    en: "Extended task completion times or increased employee turnover raise project costs. Some contracts begin to generate lower profit than expected at the sales stage, although overall portfolio profitability remains under control."
                },
                orange: {
                    pl: "Powtarzające się braki kadrowe lub konieczność angażowania droższych specjalistów powodują stały wzrost kosztów realizacji usług finansowych. Zysk z realizowanych kontraktów zaczyna być wyraźnie niższy niż zakładano, co ogranicza możliwość przyjmowania nowych projektów na dotychczasowych warunkach.",
                    en: "Recurring staffing gaps or the need to engage higher-cost specialists lead to a sustained increase in service delivery costs. Profit from ongoing contracts becomes clearly lower than initially projected, limiting the ability to accept new projects under existing terms."
                },
                critical: {
                    pl: "Znacząca utrata kluczowych kompetencji lub trwałe niedobory kadrowe powodują, że projekty realizowane są przy wysokim koszcie pracy i obniżonej wydajności. Część usług finansowych wykonywana jest poniżej progu rentowności, co wymusza ograniczenie skali działalności lub restrukturyzację zespołu.",
                    en: "Significant loss of key competencies or persistent staffing shortages result in projects being delivered at high labor costs and reduced productivity. Some financial services are performed below the profitability threshold, forcing the company to reduce its scale of operations or restructure the team."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół realizujący usługi finansowe działa stabilnie, a kompetencje specjalistów są postrzegane jako adekwatne do skali i złożoności projektów. Firma buduje wizerunek rzetelnego partnera w obszarze usług finansowych i technologii płatniczych.",
                    en: "The team delivering financial services operates steadily, and its competencies are perceived as adequate for the scale and complexity of projects. The company builds a reputation as a reliable partner in financial and payment technology services."
                },
                yellow: {
                    pl: "Pojawiają się zmiany kadrowe lub wydłużony czas wdrażania nowych specjalistów, co zaczyna być zauważalne w odbiorze klientów. Firma pozostaje wiarygodnym partnerem, jednak pojawiają się pierwsze pytania o stabilność zespołu przy bardziej wymagających projektach.",
                    en: "Staff changes or extended onboarding of new specialists become noticeable to clients. The company remains a credible partner, but initial questions arise regarding team stability in more demanding projects."
                },
                orange: {
                    pl: "Powtarzająca się rotacja kluczowych specjalistów lub brak ciągłości zespołu projektowego prowadzą do spadku zaufania do stabilności kompetencyjnej firmy. Organizacja może przestać być postrzegana jako partner zdolny do realizacji projektów finansowych o podwyższonym stopniu złożoności.",
                    en: "Recurring turnover of key specialists or lack of continuity within project teams reduces trust in the company's competence stability. The organization may cease to be perceived as a partner capable of delivering more complex financial projects."
                },
                critical: {
                    pl: "Długotrwałe niedobory kadrowe lub utrata kluczowych ekspertów powodują utrwalenie opinii o osłabionym potencjale kompetencyjnym firmy. Organizacja może utracić status wiarygodnego wykonawcy projektów o wysokiej złożoności technologicznej i regulacyjnej.",
                    en: "Prolonged staffing shortages or loss of key experts reinforce a perception of weakened professional capability. The organization may lose its status as a credible contractor for projects involving high technological and regulatory complexity."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół projektowy i operacyjny pracuje w stabilnym składzie, a obciążenie zadaniami pozostaje na kontrolowanym poziomie. Projekty finansowe realizowane są zgodnie z harmonogramem, bez konieczności pracy w trybie nadzwyczajnym.",
                    en: "The project and operations team works in a stable structure, with workload kept at a controlled level. Financial projects are delivered according to schedule without the need for emergency working modes."
                },
                yellow: {
                    pl: "Wzrost liczby zadań lub czasowe braki kadrowe powodują spadek przepustowości zespołu. Część projektów wymaga przesunięć terminów, a zespół pracuje w wydłużonych cyklach realizacyjnych, jednak kontrola nad harmonogramem jest utrzymana.",
                    en: "An increase in workload or temporary staffing gaps reduces team capacity. Some projects require deadline adjustments, and the team operates in extended delivery cycles, although overall schedule control is maintained."
                },
                orange: {
                    pl: "Powtarzające się niedobory kadrowe lub przeciążenie zespołu powodują wstrzymanie nowych inicjatyw oraz ograniczenie prac rozwojowych. Organizacja koncentruje się głównie na bieżącej obsłudze i reagowaniu na zgłoszenia, co istotnie ogranicza możliwość planowego rozwoju usług finansowych.",
                    en: "Recurring staffing shortages or sustained overload lead to suspension of new initiatives and reduced development work. The organization focuses primarily on ongoing support and incident response, significantly limiting planned development of financial services."
                },
                critical: {
                    pl: "Długotrwałe braki kompetencyjne lub przeciążenie zespołu powodują utratę zdolności do planowania projektów finansowych w przewidywalnych terminach. Organizacja przechodzi w stały tryb reagowania na bieżące problemy, bez realnej możliwości realizacji zaplanowanej roadmapy.",
                    en: "Prolonged competency gaps or sustained overload result in the loss of ability to plan financial projects within predictable timelines. The organization shifts into a permanent reactive mode, without realistic capacity to execute the planned roadmap."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Procesy zgodności regulacyjnej są realizowane terminowo, a koszty nadzoru i raportowania pozostają zgodne z założeniami budżetowymi. Wymogi prawne nie wywierają presji na marżę oferowanych usług finansowych.",
                    en: "Regulatory compliance processes are carried out on time, and supervision and reporting costs remain within budget assumptions. Legal requirements do not create pressure on service margins."
                },
                yellow: {
                    pl: "Wzrost wymagań regulacyjnych lub dodatkowe obowiązki raportowe powodują zwiększenie kosztów operacyjnych. Część usług finansowych generuje niższy zysk niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Increased regulatory requirements or additional reporting obligations raise operating costs. Some financial services generate lower profit than expected, although the business remains profitable."
                },
                orange: {
                    pl: "Powtarzające się kontrole, kary administracyjne lub dodatkowe wymogi związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz obowiązkami raportowymi powodują trwały wzrost kosztów zgodności. Część produktów finansowych realizowana jest na minimalnej marży, co ogranicza opłacalność dalszego rozwoju wybranych segmentów.",
                    en: "Recurring inspections, administrative fines, or additional requirements related to anti-money laundering, customer identity verification, and reporting obligations lead to a sustained increase in compliance costs. Some financial products are delivered at minimal margins, limiting the viability of further development in selected segments."
                },
                critical: {
                    pl: "Wysokie kary administracyjne lub odszkodowania wynikające z naruszeń umownych powodują istotne obciążenie wyniku finansowego. Część działalności realizowana jest poniżej progu rentowności, co wymusza ograniczenie zakresu usług lub wycofanie się z najbardziej obciążonych regulacyjnie obszarów.",
                    en: "High administrative fines or contractual penalties resulting from regulatory breaches place significant pressure on financial results. Parts of the business operate below the profitability threshold, forcing the company to reduce its service scope or withdraw from the most heavily regulated areas."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma realizuje obowiązki regulacyjne terminowo, a procesy związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz ochroną danych funkcjonują stabilnie. Organizacja postrzegana jest jako stabilny i odpowiedzialny podmiot regulowany.",
                    en: "The company fulfills regulatory obligations on time, and processes related to anti-money laundering, customer identity verification, and data protection operate reliably. The organization is perceived as a stable and responsible regulated entity."
                },
                yellow: {
                    pl: "Pojawiają się drobne nieprawidłowości w raportowaniu lub opóźnienia w aktualizacji procedur. Firma pozostaje zgodna z wymogami, jednak w odbiorze partnerów zaczynają pojawiać się pytania o poziom nadzoru i aktualność procesów kontrolnych.",
                    en: "Minor reporting irregularities or delays in updating procedures occur. The company remains compliant, but partners begin to raise questions about the level of oversight and the timeliness of control processes."
                },
                orange: {
                    pl: "Powtarzające się uwagi ze strony organów nadzorczych lub konieczność częstych korekt dokumentacji powodują spadek zaufania do stabilności systemu zgodności. Firma może przestać być postrzegana jako w pełni przewidywalny i dojrzały regulacyjnie partner w projektach finansowych.",
                    en: "Recurring remarks from supervisory authorities or the need for frequent documentation corrections reduce trust in the stability of the compliance framework. The company may cease to be perceived as a fully predictable and mature regulatory partner in financial projects."
                },
                critical: {
                    pl: "Poważne naruszenia wymogów prawnych lub publicznie nagłośnione postępowania nadzorcze prowadzą do utrwalenia opinii o niewystarczającym poziomie bezpieczeństwa i nadzoru prawnego. Firma może utracić status wiarygodnego partnera w obszarach wymagających ścisłej zgodności regulacyjnej.",
                    en: "Serious legal breaches or publicly reported supervisory proceedings reinforce a perception of insufficient security and regulatory oversight. The company may lose its status as a trusted partner in areas requiring strict regulatory compliance."
                }
            },
            Operational: {
                green: {
                    pl: "Procesy związane z przeciwdziałaniem praniu pieniędzy, weryfikacją tożsamości klientów oraz raportowaniem do organów nadzorczych funkcjonują zgodnie z przyjętymi procedurami. Kontrole wewnętrzne i zewnętrzne nie powodują zakłóceń w bieżącej działalności.",
                    en: "Processes related to anti-money laundering, customer identity verification, and reporting to supervisory authorities operate in line with established procedures. Internal and external audits do not disrupt day-to-day operations."
                },
                yellow: {
                    pl: "Pojawiają się dodatkowe zapytania ze strony organów nadzorczych lub konieczność częstszej aktualizacji procedur. Część działań projektowych lub wdrożeniowych musi zostać czasowo przesunięta, jednak organizacja utrzymuje kontrolę nad zgodnością.",
                    en: "Additional inquiries from supervisory authorities or more frequent procedural updates occur. Some project or implementation activities must be temporarily postponed, but compliance remains under control."
                },
                orange: {
                    pl: "Powtarzające się kontrole, korekty dokumentacji lub konieczność wdrażania nowych wymogów regulacyjnych powodują wstrzymanie wybranych projektów oraz ograniczenie prac rozwojowych. Organizacja koncentruje się głównie na dostosowaniu do wymogów prawnych, co istotnie ogranicza zdolność do planowego rozwoju usług finansowych.",
                    en: "Recurring inspections, documentation corrections, or implementation of new regulatory requirements lead to suspension of selected projects and reduced development work. The organization focuses primarily on regulatory adjustments, significantly limiting its ability to develop financial services as planned."
                },
                critical: {
                    pl: "Długotrwałe postępowania nadzorcze, decyzje administracyjne lub obowiązkowe działania naprawcze powodują, że działalność prowadzona jest pod stałym nadzorem regulacyjnym. Organizacja traci zdolność do swobodnego planowania nowych inicjatyw i funkcjonuje w trybie ciągłego dostosowywania się do wymogów organów nadzorczych.",
                    en: "Prolonged supervisory proceedings, administrative decisions, or mandatory corrective actions result in operations being conducted under constant regulatory oversight. The organization loses the ability to freely plan new initiatives and operates in continuous adjustment mode to supervisory requirements."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Umowy z operatorami płatności, bankami rozliczeniowymi oraz dostawcami technologii funkcjonują na przewidywalnych warunkach. Koszt przetwarzania transakcji pozostaje zgodny z założeniami, co pozwala utrzymać planowaną rentowność usług.",
                    en: "Agreements with payment operators, settlement banks, and technology providers operate under predictable terms. Transaction processing costs remain in line with assumptions, supporting planned service profitability."
                },
                yellow: {
                    pl: "Zmiany w cennikach partnerów zewnętrznych lub mniej korzystne warunki rozliczeń powodują wzrost kosztu jednostkowego transakcji. Część usług finansowych generuje niższy zysk niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Changes in external partners' pricing or less favorable settlement terms increase per-transaction costs. Some financial services generate lower profit than expected, although the business remains profitable."
                },
                orange: {
                    pl: "Powtarzające się podwyżki opłat ze strony operatorów płatności lub dostawców infrastruktury powodują trwałe obniżenie marży na wybranych usługach finansowych. Część produktów realizowana jest poniżej zakładanego poziomu rentowności, co wymusza renegocjację umów lub korektę cennika dla klientów.",
                    en: "Recurring fee increases from payment operators or infrastructure providers lead to a sustained decline in margins on selected financial services. Some products are delivered below the expected profitability level, forcing contract renegotiations or price adjustments for clients."
                },
                critical: {
                    pl: "Istotne podwyżki opłat, wypowiedzenie kluczowych umów lub niekorzystne zmiany warunków współpracy powodują, że znacząca część oferty realizowana jest poniżej progu rentowności. Firma zmuszona jest ograniczyć zakres usług, wycofać się z części segmentów rynku lub pilnie przebudować model współpracy z partnerami.",
                    en: "Significant fee increases, termination of key agreements, or unfavorable changes in cooperation terms result in a substantial part of the offering being delivered below the profitability threshold. The company is forced to reduce its service scope, withdraw from certain market segments, or urgently restructure its partnership model."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z operatorami płatności, bankami rozliczeniowymi oraz dostawcami technologii przebiega stabilnie i bez zakłóceń. Firma postrzegana jest jako przewidywalny partner funkcjonujący w uporządkowanym i trwałym ekosystemie finansowym.",
                    en: "Cooperation with payment operators, settlement banks, and technology providers remains stable and uninterrupted. The company is perceived as a predictable partner operating within a structured and reliable financial ecosystem."
                },
                yellow: {
                    pl: "Pojawiają się incydentalne nieporozumienia z partnerami technologicznymi lub opóźnienia w uzgodnieniach operacyjnych. Współpraca trwa, jednak wśród partnerów i instytucji współpracujących zaczynają pojawiać się pytania o długoterminową stabilność relacji.",
                    en: "Occasional misunderstandings with technology partners or delays in operational arrangements occur. Cooperation continues, but among partners and cooperating institutions questions begin to arise about the long-term stability of these relationships."
                },
                orange: {
                    pl: "Powtarzające się napięcia, publiczne sygnały o zmianach warunków współpracy lub częste zmiany partnerów technologicznych prowadzą do spadku zaufania do stabilności ekosystemu. Firma może przestać być postrzegana jako podmiot działający w przewidywalnym i trwałym układzie partnerskim.",
                    en: "Recurring tensions, public signals of changing cooperation terms, or frequent changes of technology partners reduce trust in the stability of the ecosystem. The company may cease to be perceived as operating within a predictable and durable partnership structure."
                },
                critical: {
                    pl: "Publiczne konflikty lub nagłe zerwania umów z kluczowymi partnerami finansowymi prowadzą do utrwalenia opinii o niestabilności relacji zewnętrznych. Firma może utracić status wiarygodnego uczestnika rynku, szczególnie w obszarach wymagających trwałych i długoterminowych partnerstw.",
                    en: "Public conflicts or abrupt termination of agreements with key financial partners reinforce a perception of unstable external relationships. The company may lose its status as a credible market participant, especially in areas requiring durable and longterm partnerships."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z operatorami płatności, bankami rozliczeniowymi oraz dostawcami infrastruktury przebiega bez zakłóceń. Integracje działają stabilnie, a przetwarzanie transakcji odbywa się zgodnie z przyjętymi parametrami czasowymi.",
                    en: "Cooperation with payment operators, settlement banks, and infrastructure providers remains uninterrupted. Integrations operate reliably, and transaction processing meets agreed time parameters."
                },
                yellow: {
                    pl: "Pojawiają się okresowe opóźnienia po stronie partnerów zewnętrznych lub czasowe ograniczenia dostępności wybranych usług. Część operacji wymaga ręcznej weryfikacji lub dodatkowych uzgodnień, jednak ciągłość przetwarzania zostaje zachowana.",
                    en: "Occasional delays on the side of external partners or temporary limitations in selected services occur. Some operations require manual verification or additional coordination, but overall processing continuity is maintained."
                },
                orange: {
                    pl: "Powtarzające się przerwy w działaniu systemów partnerów lub istotne ograniczenia integracyjne prowadzą do wstrzymania części transakcji lub wyłączenia wybranych funkcjonalności. Organizacja koncentruje się na obejściach technicznych i działaniach awaryjnych, co ogranicza możliwość planowego rozwoju usług.",
                    en: "Recurring outages in partner systems or significant integration constraints lead to suspension of selected transactions or disabling certain functionalities. The organization focuses on technical workarounds and emergency actions, limiting its ability to develop services as planned."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych partnerów rozliczeniowych lub zerwanie współpracy uniemożliwia przetwarzanie istotnej części operacji finansowych. Organizacja traci zdolność do zapewnienia regularnej obsługi transakcji i funkcjonuje w trybie stałego zarządzania kryzysowego.",
                    en: "Prolonged unavailability of key settlement partners or termination of cooperation makes it impossible to process a significant portion of financial operations. The organization loses the ability to ensure regular transaction handling and operates in continuous crisis management mode."
                }
            }
        }
    },
    services_other: {
        E: {
            Business: {
                green: {
                    pl: "Usługi realizowane są przy założonym poziomie wykorzystania zespołu i zasobów. Koszt wykonania zleceń pozostaje pod kontrolą, a zysk z realizowanych usług odpowiada poziomowi przyjętemu na etapie ofertowania.",
                    en: "Services are delivered with the planned level of team and resource utilization. Execution costs remain under control, and the profit from completed services aligns with the assumptions made during the sales stage."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji lub dodatkowe nakłady pracy powodują wzrost kosztu wykonania części zleceń. Zysk z wybranych usług zaczyna być niższy niż zakładano, jednak działalność pozostaje rentowna na poziomie całego portfela.",
                    en: "Extended delivery time or additional workload increases the execution cost of selected assignments. Profit from certain services becomes lower than initially assumed, although the overall service portfolio remains profitable."
                },
                orange: {
                    pl: "Powtarzające się przekroczenia budżetów projektowych oraz niska efektywność wykorzystania zasobów prowadzą do realizacji części usług na minimalnej marży. Koszt utrzymania zespołu zaczyna przewyższać zysk z części zleceń, co wymusza ograniczenie zakresu przyjmowanych projektów.",
                    en: "Recurring budget overruns and low resource efficiency result in selected services being delivered at minimal margin. The cost of maintaining the team begins to exceed the profit generated by some assignments, forcing a reduction in the scope of accepted projects."
                },
                critical: {
                    pl: "Część usług realizowana jest poniżej progu rentowności, a przychody nie pokrywają pełnych kosztów zespołu i infrastruktury. Firma zmuszona jest ograniczyć skalę działalności, zrezygnować z nierentownych segmentów lub przeprowadzić restrukturyzację modelu operacyjnego.",
                    en: "A portion of services is delivered below the profitability threshold, and revenues no longer cover the full cost of the team and infrastructure. The company is forced to reduce its scale of operations, withdraw from unprofitable segments, or restructure its operating model."
                }
            },
            Reputation: {
                green: {
                    pl: "Usługi realizowane są terminowo i zgodnie z ustalonym zakresem. Klienci postrzegają firmę jako rzetelnego wykonawcę zapewniającego spójny i przewidywalny standard jakości.",
                    en: "Services are delivered on time and within the agreed scope. Clients perceive the company as a reliable provider ensuring a consistent and predictable quality standard."
                },
                yellow: {
                    pl: "Pojedyncze opóźnienia lub konieczność dodatkowych korekt zaczynają być zauważalne przez klientów. Wizerunek firmy jako w pełni przewidywalnego partnera ulega osłabieniu, choć zaufanie pozostaje zachowane.",
                    en: "Isolated delays or additional corrections begin to be noticed by clients. The image of the company as a fully predictable partner weakens, although overall trust remains intact."
                },
                orange: {
                    pl: "Powtarzające się problemy z dotrzymaniem zakresu lub jakości usług prowadzą do utraty części referencji i ograniczenia rekomendacji. Firma może przestać być postrzegana jako wykonawca gwarantujący stabilny i powtarzalny poziom realizacji.",
                    en: "Recurring issues with scope or service quality lead to the loss of selected references and reduced recommendations. The company may cease to be perceived as a provider ensuring stable and repeatable delivery standards."
                },
                critical: {
                    pl: "Utrwalona opinia o niestabilnej jakości usług prowadzi do trwałej utraty zaufania oraz ograniczenia dostępu do bardziej wymagających projektów. Firma może utracić pozycję preferowanego wykonawcy w swojej kategorii usług.",
                    en: "A sustained perception of unstable service quality leads to a lasting loss of trust and reduced access to more demanding projects. The company may lose its position as a preferred provider within its service category."
                }
            },
            Operational: {
                green: {
                    pl: "Usługi realizowane są zgodnie z harmonogramem, a obciążenie zespołu pozostaje na planowanym poziomie. Proces wykonawczy jest stabilny, a firma utrzymuje pełną kontrolę nad terminami i zakresem prac.",
                    en: "Services are delivered according to schedule, and team workload remains at the planned level. The execution process is stable, and the company maintains full control over deadlines and scope."
                },
                yellow: {
                    pl: "Wydłużenie czasu realizacji wybranych zleceń oraz nierównomierne obciążenie zespołu powodują spadek części przepustowości. Konieczne stają się korekty harmonogramów, jednak organizacja zachowuje kontrolę nad realizacją usług.",
                    en: "Extended delivery time of selected assignments and uneven team workload reduce part of the operational capacity. Schedule adjustments become necessary, but the organization retains control over service execution."
                },
                orange: {
                    pl: "Powtarzające się opóźnienia oraz przeciążenie kluczowych zasobów prowadzą do wstrzymania przyjmowania nowych zleceń lub przesuwania rozpoczęcia kolejnych projektów. Plan realizacyjny ulega zaburzeniu, a organizacja koncentruje się na nadrabianiu zaległości zamiast na planowym rozwoju.",
                    en: "Recurring delays and overload of key resources lead to suspension of new assignments or postponement of upcoming projects. The execution plan becomes disrupted, and the organization focuses on clearing backlogs instead of planned development."
                },
                critical: {
                    pl: "Długotrwałe przeciążenie zasobów oraz brak stabilności procesu realizacyjnego powodują, że firma traci zdolność do przewidywalnego planowania nowych usług. Organizacja funkcjonuje w trybie stałego reagowania na opóźnienia, a harmonogram przestaje być wiarygodnym narzędziem zarządczym.",
                    en: "Prolonged resource overload and instability of the execution process cause the company to lose the ability to plan new services predictably. The organization operates in continuous reactive mode, and the schedule ceases to be a reliable management tool."
                }
            }
        },
        S: {
            Business: {
                green: {
                    pl: "Zespół pracuje w stabilnym składzie, a poziom wykorzystania czasu pracy odpowiada założeniom. Koszt utrzymania zespołu pozostaje adekwatny do generowanych przychodów z realizowanych usług.",
                    en: "The team operates with a stable structure, and time utilization remains in line with assumptions. The cost of maintaining the team is aligned with revenues generated from delivered services."
                },
                yellow: {
                    pl: "Zwiększona absencja, przeciążenie wybranych pracowników lub rotacja kadry powodują spadek efektywności części realizowanych usług. Koszt pracy zaczyna rosnąć szybciej niż przychody z wybranych zleceń, co obniża zysk z części kontraktów.",
                    en: "Increased absenteeism, overload of selected employees, or staff turnover reduce the efficiency of certain services. Labor costs begin to grow faster than revenues from selected assignments, lowering profit from part of the contracts."
                },
                orange: {
                    pl: "Utrata kluczowych pracowników lub trwałe niedobory kompetencyjne prowadzą do konieczności korzystania z droższych zastępstw lub nadgodzin. Koszt utrzymania zespołu zaczyna wyraźnie przewyższać zysk z części usług, co wymusza ograniczenie zakresu działalności lub podniesienie cen.",
                    en: "Loss of key employees or persistent skill shortages require more expensive replacements or overtime work. The cost of maintaining the team clearly exceeds profit from certain services, forcing a reduction in business scope or price adjustments."
                },
                critical: {
                    pl: "Trwała destabilizacja zespołu powoduje, że przychody z realizowanych usług nie pokrywają całkowitych kosztów zespołu. Firma zmuszona jest ograniczyć skalę działalności, zrezygnować z części usług lub przeprowadzić restrukturyzację zatrudnienia.",
                    en: "Persistent team instability results in service revenues no longer covering the total cost of the team. The company is forced to reduce its scale of operations, withdraw from selected services, or restructure employment."
                }
            },
            Reputation: {
                green: {
                    pl: "Zespół pracuje w stabilnym składzie, a kompetencje pracowników odpowiadają zakresowi realizowanych usług. Klienci postrzegają firmę jako partnera dysponującego doświadczonym i odpowiedzialnym zespołem.",
                    en: "The team operates with a stable structure, and employee competencies match the scope of delivered services. Clients perceive the company as a partner supported by an experienced and responsible team."
                },
                yellow: {
                    pl: "Rotacja pracowników lub czasowe braki kompetencyjne zaczynają być zauważalne przez klientów. Wizerunek firmy jako w pełni stabilnego partnera ulega osłabieniu, choć zaufanie do realizacji usług pozostaje zachowane.",
                    en: "Staff turnover or temporary skill gaps begin to be noticed by clients. The image of the company as a fully stable partner weakens, although trust in service delivery remains intact."
                },
                orange: {
                    pl: "Utrata kluczowych specjalistów lub powtarzające się zmiany w składzie zespołu powodują, że klienci zaczynają kwestionować stabilność personalną firmy. Decyzje o nowych projektach są odkładane do czasu potwierdzenia stałości zespołu, a firma może przestać być postrzegana jako stabilny partner wykonawczy.",
                    en: "Loss of key specialists or recurring team changes lead clients to question the company’s personnel stability. Decisions on new projects are postponed until team continuity is confirmed, and the company may cease to be perceived as a stable delivery partner."
                },
                critical: {
                    pl: "Utrwalona opinia o niestabilnym lub niedostatecznie doświadczonym zespole prowadzi do trwałej utraty zaufania oraz ograniczenia dostępu do bardziej wymagających projektów. Firma może utracić pozycję preferowanego partnera w swojej kategorii usług.",
                    en: "A sustained perception of an unstable or insufficiently experienced team leads to a lasting loss of trust and reduced access to more demanding projects. The company may lose its position as a preferred partner within its service category."
                }
            },
            Operational: {
                green: {
                    pl: "Zespół pracuje w pełnym składzie, a kompetencje są dopasowane do realizowanych usług. Obciążenie pracą pozostaje na planowanym poziomie, co pozwala utrzymać stabilny rytm realizacji zleceń.",
                    en: "The team operates at full capacity, with competencies aligned to delivered services. Workload remains at the planned level, allowing for a stable execution rhythm."
                },
                yellow: {
                    pl: "Czasowa absencja pracowników lub nierównomierne obciążenie zespołu powodują wydłużenie realizacji części zleceń. Konieczne stają się korekty podziału zadań, jednak organizacja zachowuje kontrolę nad harmonogramem.",
                    en: "Temporary staff absences or uneven workload distribution extend the delivery time of selected assignments. Task redistribution becomes necessary, but the organization retains control over the schedule."
                },
                orange: {
                    pl: "Utrata kluczowych pracowników lub długotrwałe niedobory kadrowe prowadzą do przesuwania terminów oraz ograniczenia możliwości przyjmowania nowych zleceń. Plan pracy zespołu ulega zaburzeniu, a organizacja koncentruje się na bieżącym zabezpieczaniu realizacji zamiast na planowym rozwoju usług.",
                    en: "Loss of key employees or prolonged staffing shortages lead to deadline shifts and reduced ability to accept new assignments. The team’s work plan becomes disrupted, and the organization focuses on securing current deliveries rather than developing services as planned."
                },
                critical: {
                    pl: "Trwała destabilizacja zespołu powoduje brak możliwości przewidywalnego planowania pracy i realizacji nowych usług. Organizacja funkcjonuje w stałym trybie reagowania na braki kadrowe, a harmonogram przestaje być realnym narzędziem zarządzania.",
                    en: "Persistent team instability eliminates the ability to plan work and new services predictably. The organization operates in continuous reaction mode due to staffing gaps, and the schedule ceases to be a reliable management tool."
                }
            }
        },
        G: {
            Business: {
                green: {
                    pl: "Firma realizuje usługi zgodnie z obowiązującymi przepisami oraz warunkami umów. Nie występują kary ani dodatkowe koszty związane z niezgodnością, a działalność prowadzona jest bez ryzyka finansowych konsekwencji regulacyjnych.",
                    en: "The company delivers services in compliance with applicable regulations and contractual terms. No penalties or additional costs related to non-compliance occur, and operations are conducted without regulatory financial risk."
                },
                yellow: {
                    pl: "Pojawiają się drobne niezgodności lub konieczność aktualizacji procedur. Wymaga to dodatkowych nakładów organizacyjnych i prawnych, co podnosi koszt prowadzenia działalności, jednak nie wpływa jeszcze istotnie na skalę usług.",
                    en: "Minor non-compliance issues or the need to update procedures arise. This requires additional organizational and legal effort, increasing operating costs, but it does not yet significantly affect the scale of services."
                },
                orange: {
                    pl: "Powtarzające się niezgodności lub brak pełnego dostosowania do wymogów prowadzą do nałożenia kar administracyjnych albo konieczności wdrożenia kosztownych zmian proceduralnych. Obciążenia te zaczynają ograniczać rentowność części usług i wymuszają ograniczenie zakresu działalności.",
                    en: "Recurring non-compliance or insufficient alignment with requirements leads to administrative penalties or the need to implement costly procedural changes. These burdens begin to limit the profitability of certain services and force a reduction in business scope."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub warunków umownych skutkują wysokimi karami finansowymi, odszkodowaniami lub ograniczeniem możliwości świadczenia części usług. W konsekwencji model działalności traci stabilność ekonomiczną i wymaga zasadniczej reorganizacji.",
                    en: "Serious breaches of regulations or contractual terms result in substantial financial penalties, compensation claims, or restrictions on providing certain services. As a result, the business model loses economic stability and requires fundamental reorganization."
                }
            },
            Reputation: {
                green: {
                    pl: "Firma realizuje usługi zgodnie z obowiązującymi przepisami i warunkami umownymi. W otoczeniu rynkowym postrzegana jest jako stabilny i odpowiedzialny podmiot działający zgodnie z wymaganiami formalnymi.",
                    en: "The company delivers services in compliance with applicable regulations and contractual terms. In the market environment, it is perceived as a stable and responsible entity operating in line with formal requirements."
                },
                yellow: {
                    pl: "Pojedyncze niezgodności lub opóźnienia w aktualizacji dokumentacji zaczynają być zauważalne wśród partnerów i instytucji współpracujących. Wizerunek firmy jako w pełni uporządkowanego podmiotu ulega osłabieniu, choć zaufanie pozostaje zachowane.",
                    en: "Isolated compliance issues or delays in updating documentation begin to be noticed among partners and cooperating institutions. The image of the company as a fully structured entity weakens, although overall trust remains intact."
                },
                orange: {
                    pl: "Powtarzające się uchybienia w zakresie zgodności prowadzą do zwiększonej uwagi ze strony partnerów lub instytucji nadzorczych, co buduje obraz firmy wymagającej dodatkowego nadzoru. Organizacja może przestać być postrzegana jako w pełni uporządkowany podmiot formalny, co ogranicza dostęp do bardziej wymagających współprac.",
                    en: "Recurring compliance deficiencies attract increased attention from partners or supervisory institutions, creating an image of a company requiring additional oversight. The organization may cease to be perceived as a fully structured and compliant entity, limiting access to more demanding collaborations."
                },
                critical: {
                    pl: "Utrwalona opinia o braku należytej staranności w zakresie zgodności prowadzi do trwałej utraty zaufania wśród partnerów i instytucji. Firma może zostać wykluczona z części współprac wymagających wysokiego poziomu nadzoru formalnego.",
                    en: "A sustained perception of insufficient due diligence in compliance leads to a lasting loss of trust among partners and institutions. The company may be excluded from collaborations requiring a high level of formal oversight."
                }
            },
            Operational: {
                green: {
                    pl: "Usługi realizowane są zgodnie z obowiązującymi przepisami i warunkami umownymi. Procedury formalne są aktualne, a wymagania regulacyjne nie wpływają na bieżącą realizację zleceń.",
                    en: "Services are delivered in compliance with applicable regulations and contractual terms. Formal procedures are up to date, and regulatory requirements do not affect ongoing service delivery."
                },
                yellow: {
                    pl: "Pojawiają się drobne niezgodności lub konieczność aktualizacji dokumentacji, co wymaga czasowego wstrzymania części działań projektowych lub wdrożeniowych. Realizacja usług jest możliwa, jednak wymaga dodatkowej koordynacji formalnej.",
                    en: "Minor compliance issues or the need to update documentation require temporary suspension of selected project or implementation activities. Service delivery continues but requires additional formal coordination."
                },
                orange: {
                    pl: "Powtarzające się uchybienia formalne lub brak wymaganych zgód prowadzą do czasowego wstrzymania wybranych usług. Harmonogram realizacji ulega zaburzeniu, a organizacja koncentruje się na usuwaniu niezgodności zamiast na planowym prowadzeniu działalności.",
                    en: "Recurring formal deficiencies or missing required approvals lead to temporary suspension of selected services. Delivery schedules become disrupted, and the organization focuses on resolving compliance gaps instead of conducting planned operations."
                },
                critical: {
                    pl: "Poważne naruszenia przepisów lub warunków umownych skutkują formalnym zakazem realizacji części usług lub zawieszeniem działalności w określonym zakresie. Organizacja traci możliwość prowadzenia regularnej działalności i funkcjonuje w trybie stałego przywracania zgodności.",
                    en: "Serious breaches of regulations or contractual terms result in a formal prohibition of selected services or suspension of operations in a defined scope. The organization loses the ability to conduct regular activities and operates in continuous compliance restoration mode."
                }
            }
        },
        SC: {
            Business: {
                green: {
                    pl: "Współpraca z podwykonawcami i partnerami zewnętrznymi przebiega zgodnie z ustalonymi warunkami. Koszty usług zewnętrznych pozostają na założonym poziomie, a marża na realizowanych zleceniach jest zgodna z planem.",
                    en: "Cooperation with subcontractors and external partners proceeds according to agreed terms. External service costs remain at the planned level, and margins on delivered assignments align with expectations."
                },
                yellow: {
                    pl: "Podwyższenie stawek przez partnerów lub konieczność korzystania z dodatkowego wsparcia zewnętrznego powodują wzrost kosztu realizacji części usług. Zysk z wybranych zleceń zaczyna być niższy niż zakładano, jednak działalność pozostaje rentowna.",
                    en: "Rate increases by partners or the need for additional external support raise the execution cost of selected services. Profit from certain assignments becomes lower than initially assumed, although the business remains profitable overall."
                },
                orange: {
                    pl: "Powtarzające się wzrosty kosztów współpracy lub brak przewidywalności kosztów współpracy z partnerami zewnętrznymi prowadzą do realizacji części usług na minimalnej marży. Koszt współpracy zaczyna przewyższać zysk z wybranych projektów, co wymusza ograniczenie zakresu działalności lub rezygnację z mniej rentownych zleceń.",
                    en: "Recurring cost increases or lack of predictability in cooperation costs with external partners result in selected services being delivered at minimal margin. The cost of cooperation begins to exceed profit from certain projects, forcing a reduction in business scope or withdrawal from less profitable assignments."
                },
                critical: {
                    pl: "Trwały wzrost kosztów współpracy zewnętrznej lub ich nieprzewidywalność powodują, że realizacja usług przestaje być opłacalna w obecnym modelu. Firma zmuszona jest ograniczyć skalę działalności, zmienić strukturę dostawców lub zasadniczo przebudować model współpracy.",
                    en: "Persistent increases in external cooperation costs or their unpredictability make service delivery unprofitable under the current model. The company is forced to reduce its scale of operations, change its supplier structure, or fundamentally redesign its cooperation model."
                }
            },
            Reputation: {
                green: {
                    pl: "Współpraca z partnerami zewnętrznymi przebiega w sposób przewidywalny i zgodny z ustaleniami. Firma postrzegana jest jako rzetelny i stabilny podmiot, który odpowiedzialnie zarządza relacjami z dostawcami i podwykonawcami.",
                    en: "Cooperation with external partners proceeds in a predictable and agreed manner. The company is perceived as a reliable and stable entity that responsibly manages relationships with suppliers and subcontractors."
                },
                yellow: {
                    pl: "Pojedyncze napięcia we współpracy z partnerami zewnętrznymi zaczynają być zauważalne wśród partnerów i instytucji współpracujących. Firma nadal utrzymuje relacje biznesowe, jednak w otoczeniu pojawia się większa ostrożność w podejmowaniu nowych wspólnych projektów.",
                    en: "Isolated tensions in cooperation with external partners become noticeable among collaborating partners and institutions. The company continues its business relationships, but increased caution appears when initiating new joint projects."
                },
                orange: {
                    pl: "Powtarzające się trudności w relacjach z podwykonawcami lub partnerami outsourcingowymi zaczynają budować obraz firmy wymagającej dodatkowego nadzoru lub bardziej szczegółowych zabezpieczeń umownych. Ograniczeniu ulega skłonność partnerów do rekomendowania współpracy.",
                    en: "Recurring difficulties in relationships with subcontractors or outsourcing partners begin to create an image of a company requiring additional oversight or more detailed contractual safeguards. Partners become less inclined to recommend cooperation."
                },
                critical: {
                    pl: "Utrwalone konflikty, publiczne spory lub nagłe zerwania umów z kluczowymi partnerami prowadzą do trwałej utraty zaufania w relacjach zewnętrznych. Firma może być postrzegana jako podmiot wysokiego ryzyka współpracy, co znacząco ogranicza możliwość nawiązywania nowych partnerstw.",
                    en: "Persistent conflicts, public disputes, or sudden termination of agreements with key partners lead to lasting loss of trust in external relationships. The company may be perceived as a high-risk cooperation partner, significantly limiting opportunities to establish new partnerships."
                }
            },
            Operational: {
                green: {
                    pl: "Współpraca z podwykonawcami i partnerami zewnętrznymi przebiega zgodnie z harmonogramem. Realizacja usług odbywa się bez zakłóceń, a firma zachowuje pełną kontrolę nad terminami i planowaniem prac.",
                    en: "Cooperation with subcontractors and external partners follows the agreed schedule. Service delivery proceeds without disruption, and the company maintains full control over timelines and work planning."
                },
                yellow: {
                    pl: "Opóźnienia lub ograniczona dostępność partnerów zewnętrznych powodują przesunięcia w realizacji części zleceń. Firma nadal wywiązuje się z zobowiązań, jednak planowanie prac wymaga dodatkowych korekt i większej koordynacji.",
                    en: "Delays or limited availability of external partners cause shifts in the execution of selected assignments. The company continues to meet its commitments, but work planning requires additional adjustments and coordination."
                },
                orange: {
                    pl: "Powtarzające się problemy z dostępnością podwykonawców lub partnerów prowadzą do wstrzymania części prac lub konieczności zmiany zakresu usług. Harmonogramy stają się niestabilne, a utrzymanie ciągłości realizacji wymaga stałej interwencji zarządczej.",
                    en: "Recurring issues with the availability of subcontractors or partners lead to suspension of certain activities or changes in service scope. Schedules become unstable, and maintaining continuity requires constant managerial intervention."
                },
                critical: {
                    pl: "Długotrwała niedostępność kluczowych partnerów zewnętrznych uniemożliwia realizację istotnej części usług. Firma traci zdolność do planowania kolejnych projektów i działa w trybie reakcyjnym, koncentrując się na bieżącym zabezpieczeniu podstawowych zobowiązań.",
                    en: "Prolonged unavailability of key external partners makes it impossible to deliver a significant portion of services. The company loses the ability to plan future projects and operates in a reactive mode, focusing on safeguarding its most basic commitments."
                }
            }
        }
    }
};

module.exports = { INDUSTRY_TOP_RISKS };
