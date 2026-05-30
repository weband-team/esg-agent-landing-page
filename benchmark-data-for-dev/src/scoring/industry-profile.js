/**
 * Industry Profile Dictionary
 * Auto-generated from COMMENTS.md PROFILE entries
 *
 * Provides explanations of why each pillar is important for a specific industry.
 * Used in "Szczegolowe wyniki ESG" section.
 *
 * Structure: industryProfile[industryCode][pillar][language]
 *
 * Industry codes match industryCodeMapping in pdf-template.js:
 * - construction
 * - energy_resources
 * - finance_fintech
 * - retail_trade
 * - it_software
 * - logistics_transport
 * - industrial_production
 * - services_other
 */

const INDUSTRY_PROFILE = {
    'construction': {
        'E': {
            'pl': 'W budownictwie istotne znaczenie ma wplyw inwestycji na srodowisko na kazdym etapie realizacji — od przygotowania terenu po oddanie obiektu do uzytkowania. Branza charakteryzuje sie wysokim zuzyciem surowcow, energii oraz znaczna iloscia odpadow budowlanych i rozbiórkowych. Kluczowe obszary obejmuja gospodarke odpadami, kontrole emisji i pylow na placu budowy, efektywnosc energetyczna wznoszonych obiektow oraz spelnienie wymogow srodowiskowych wynikajacych z decyzji administracyjnych.',
            'en': 'In construction, environmental impact matters at every stage of a project — from site preparation to building commissioning. The sector is characterized by high consumption of raw materials and energy, as well as significant volumes of construction and demolition waste. Key areas include waste management, control of emissions and dust on-site, energy efficiency of constructed buildings, and compliance with environmental requirements arising from administrative decisions.'
        },
        'S': {
            'pl': 'Budownictwo opiera sie na pracy zespolow wykonawczych dzialajacych w warunkach podwyzszonego ryzyka fizycznego i zmiennych warunkach srodowiskowych. Kluczowe znaczenie maja bezpieczenstwo pracy, kwalifikacje specjalistow oraz wlasciwa organizacja pracy na placu budowy. Branza wymaga stabilnych zespolow, jasnych zasad wspolpracy i przestrzegania standardow BHP.',
            'en': 'Construction relies on operational teams working in environments with elevated physical risk and variable site conditions. Occupational safety, specialist qualifications, and proper on-site organization are essential. The sector requires stable teams, clear cooperation rules, and adherence to health and safety standards.'
        },
        'G': {
            'pl': 'Dzialalnosc budowlana podlega rozbudowanym regulacjom prawnym, obejmujacym prawo budowlane, normy techniczne, wymogi srodowiskowe oraz procedury administracyjne zwiazane z pozwoleniami, zgloszeniami i odbiorami inwestycji. Prawidlowe prowadzenie dokumentacji budowy, nadzor nad zgodnoscia techniczna oraz wspolpraca z organami administracji stanowia staly element funkcjonowania firm w tej branzy.',
            'en': 'Construction activity is subject to extensive legal and technical regulations, including building law, technical standards, environmental requirements, and administrative procedures related to permits and project approvals. Proper site documentation, compliance supervision, and cooperation with public authorities are ongoing elements of operating in this sector.'
        },
        'SC': {
            'pl': 'Branza budowlana w duzym stopniu opiera sie na wspolpracy z podwykonawcami, dostawcami materialow oraz firmami specjalistycznymi. Realizacja inwestycji wymaga koordynacji wielu podmiotow na roznych etapach prac oraz synchronizacji dostaw z harmonogramem budowy. Struktura i organizacja lancucha dostaw ksztaltuja sposob planowania oraz przebieg realizacji inwestycji.',
            'en': 'The construction sector heavily relies on subcontractors, material suppliers, and specialized service providers. Project execution requires coordination of multiple parties across different construction phases and synchronization of deliveries with the project schedule. The structure and organization of the supply chain shape planning and project execution processes.'
        }
    },

    'energy_resources': {
        'E': {
            'pl': 'Branza energetyczna i surowcowa wiaze sie z bezposrednim oddzialywaniem na srodowisko naturalne na etapie wydobycia, przetwarzania oraz wytwarzania energii. Kluczowe obszary obejmuja emisje do powietrza, gospodarowanie woda procesowa, rekultywacje terenow pogorniczych oraz zarzadzanie odpadami i produktami ubocznymi procesow przemyslowych. Charakter dzialalnosci wymaga stalego monitorowania parametrow srodowiskowych oraz realizacji warunkow okreslonych w decyzjach administracyjnych i pozwoleniach.',
            'en': 'The energy and raw materials sector is directly connected with environmental impact during extraction, processing, and energy generation. Key areas include air emissions, process water management, land restoration of post-extraction sites, and handling of industrial waste and by-products. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze energetyki i surowcow obejmuje prace w warunkach podwyzszonego ryzyka technicznego i przemyslowego, czesto w srodowisku instalacji wysokiej mocy lub terenow wydobywczych. Kluczowe znaczenie maja standardy bezpieczenstwa pracy, kwalifikacje techniczne personelu oraz organizacja pracy w zakladach produkcyjnych i na obszarach eksploatacji. Branza funkcjonuje w bezposrednim sasiedztwie spolecznosci lokalnych, co wymaga stalego dialogu oraz uwzgledniania kwestii zdrowia i bezpieczenstwa otoczenia.',
            'en': 'Operations in the energy and raw materials sector involve work under elevated technical and industrial risk conditions, often within high-capacity installations or extraction sites. Occupational safety standards, technical qualifications of personnel, and structured work organization at production facilities and operating sites are essential. The sector often operates in close proximity to local communities, requiring ongoing dialogue and consideration of health and safety aspects of the surrounding area.'
        },
        'G': {
            'pl': 'Sektor energetyczny i surowcowy podlega rozbudowanym regulacjom krajowym i miedzynarodowym, obejmujacym koncesje, pozwolenia srodowiskowe, normy techniczne, wymogi raportowe oraz nadzor sektorowy. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja regulacyjna, biezacej kontroli zgodnosci oraz wspolpracy z organami nadzoru i instytucjami publicznymi.',
            'en': 'The energy and raw materials sector is subject to extensive national and international regulations, including licenses, environmental permits, technical standards, reporting obligations, and sectoral supervision. Operating in this sector requires structured regulatory documentation management, ongoing compliance oversight, and cooperation with supervisory authorities and public institutions.'
        },
        'SC': {
            'pl': 'Branza opiera sie na rozbudowanych i czesto miedzynarodowych lancuchach dostaw obejmujacych surowce, komponenty technologiczne oraz uslugi specjalistyczne. Istotne znaczenie ma koordynacja dostaw, dostepnosc infrastruktury logistycznej oraz wspolpraca z partnerami technologicznymi i serwisowymi. Struktura lancucha dostaw ksztaltuje sposob organizacji procesow produkcyjnych oraz realizacji projektow inwestycyjnych.',
            'en': 'The sector relies on extensive and often international supply chains covering raw materials, technological components, and specialized services. Coordination of deliveries, availability of logistics infrastructure, and cooperation with technology and service partners are important elements. The supply chain structure shapes the organization of production processes and execution of investment projects.'
        }
    },

    'industrial_production': {
        'E': {
            'pl': 'Produkcja przemyslowa wiaze sie z wykorzystaniem energii, surowcow oraz procesow technologicznych generujacych emisje, odpady i scieki przemyslowe. Kluczowe obszary obejmuja efektywnosc energetyczna linii produkcyjnych, ograniczanie strat materialowych, gospodarowanie odpadami poprodukcyjnymi, kontrole emisji do powietrza oraz zarzadzanie woda procesowa w obiegach zamknietych i otwartych. Charakter dzialalnosci wymaga stalego monitorowania parametrow srodowiskowych oraz realizacji warunkow okreslonych w pozwoleniach i decyzjach administracyjnych.',
            'en': 'Industrial production involves the use of energy, raw materials, and technological processes that generate emissions, waste, and industrial wastewater. Key areas include energy efficiency of production lines, reduction of material losses, management of post-production waste, control of air emissions, and process water management in closed and open systems. The nature of operations requires continuous monitoring of environmental parameters and adherence to conditions defined in permits and administrative decisions.'
        },
        'S': {
            'pl': 'Dzialalnosc produkcyjna opiera sie na pracy w srodowisku maszynowym i technologicznym, czesto w systemie zmianowym oraz w warunkach podwyzszonego halasu i obciazenia fizycznego. Kluczowe znaczenie maja standardy bezpieczenstwa pracy, wlasciwa organizacja stanowisk produkcyjnych, kwalifikacje operatorow oraz nadzor nad procesami technicznymi. Istotnym elementem funkcjonowania zakladow jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunkow pracy w halach produkcyjnych.',
            'en': 'Industrial operations rely on machine-based and technological environments, often operating in shift systems and under conditions of elevated noise and physical load. Occupational safety standards, proper organization of production workstations, operator qualifications, and supervision of technical processes are essential. Adherence to health and safety rules and ensuring appropriate working conditions within production facilities are integral elements of plant operations.'
        },
        'G': {
            'pl': 'Produkcja przemyslowa podlega regulacjom obejmujacym normy techniczne, wymagania jakosciowe, przepisy srodowiskowe oraz obowiazki sprawozdawcze i certyfikacyjne. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja procesowa, utrzymania zgodnosci z normami branzowymi oraz nadzoru nad procedurami wewnetrznymi. Stalym elementem funkcjonowania zakladu jest kontrola zgodnosci procesow z obowiazujacymi regulacjami i standardami.',
            'en': 'Industrial production is subject to regulations covering technical standards, quality requirements, environmental rules, reporting obligations, and certification schemes. Operating in this sector requires structured process documentation management, compliance with industry standards, and supervision of internal procedures. Ongoing control of process compliance with applicable regulations and standards is a permanent element of plant operations.'
        },
        'SC': {
            'pl': 'Branza produkcyjna opiera sie na dostawach surowcow, komponentow oraz uslug technicznych, czesto realizowanych w modelu wielostopniowego lancucha dostaw obejmujacego dostawcow krajowych i zagranicznych. Istotne znaczenie ma synchronizacja dostaw z planem produkcyjnym, dostepnosc materialow magazynowych oraz wspolpraca z dostawcami kluczowych komponentow i czesci zamiennych. Struktura lancucha dostaw ksztaltuje organizacje procesow wytworczych oraz planowanie produkcji.',
            'en': 'The manufacturing sector relies on the supply of raw materials, components, and technical services, often organized within multi-tier supply chains involving both domestic and international suppliers. Synchronization of deliveries with production schedules, material availability in storage, and cooperation with key component and spare part suppliers are important elements. The supply chain structure shapes production organization and planning processes.'
        }
    },

    'logistics_transport': {
        'E': {
            'pl': 'Branza logistyczna i transportowa wiaze sie z wykorzystaniem floty pojazdow, infrastruktury magazynowej oraz systemow dystrybucyjnych generujacych emisje do powietrza oraz zuzycie paliw i energii. Kluczowe obszary obejmuja efektywnosc paliwowa floty, zarzadzanie emisjami z transportu drogowego, kolejowego, lotniczego lub morskiego, a takze organizacje procesow magazynowych, zuzycie energii w obiektach oraz ograniczanie ilosci opakowan transportowych. Charakter dzialalnosci wymaga monitorowania parametrow srodowiskowych zwiazanych z eksploatacja pojazdow i funkcjonowaniem centrow logistycznych.',
            'en': 'The logistics and transport sector involves the use of vehicle fleets, warehouse infrastructure, and distribution systems that generate air emissions and consume fuel and energy. Key areas include fleet fuel efficiency, management of emissions from road, rail, air, or maritime transport, as well as energy use in logistics facilities and reduction of transport packaging. The nature of operations requires monitoring environmental parameters related to vehicle operation and logistics center performance.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze logistyki i transportu opiera sie na pracy kierowcow, operatorow magazynowych oraz personelu planistycznego, czesto w systemie zmianowym i w warunkach pracy zaleznych od harmonogramow dostaw. Istotne znaczenie maja bezpieczenstwo w ruchu drogowym i w przestrzeni magazynowej, kwalifikacje kierowcow oraz wlasciwa organizacja pracy zwiazana z planowaniem tras i obsluga ladunkow. Waznym elementem jest przestrzeganie zasad BHP oraz zapewnienie odpowiednich warunkow pracy w centrach logistycznych i podczas realizacji transportu.',
            'en': 'Operations in the logistics and transport sector rely on drivers, warehouse operators, and planning staff, often working in shift systems and according to structured delivery schedules. Road safety, warehouse safety standards, driver qualifications, and proper route and cargo handling organization are essential elements. Adherence to health and safety rules and ensuring appropriate working conditions in logistics centers and during transport are integral aspects of sector operations.'
        },
        'G': {
            'pl': 'Sektor logistyczny i transportowy podlega regulacjom dotyczacym czasu pracy kierowcow, bezpieczenstwa przewozow, norm emisji, licencji transportowych oraz obowiazkow sprawozdawczych i dokumentacyjnych. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja przewozowa, utrzymania zgodnosci z przepisami branzowymi oraz nadzoru nad procedurami administracyjnymi i operacyjnymi. Stalym elementem funkcjonowania firm jest kontrola zgodnosci z regulacjami krajowymi i miedzynarodowymi.',
            'en': 'The logistics and transport sector is subject to regulations covering driver working time, transport safety, emission standards, transport licenses, and reporting and documentation obligations. Operating in this sector requires structured management of transport documentation, compliance with industry regulations, and supervision of administrative and operational procedures. Ongoing compliance with national and international regulations is a permanent element of business operations.'
        },
        'SC': {
            'pl': 'Branza logistyki i transportu funkcjonuje w ramach rozbudowanych sieci dostaw obejmujacych nadawcow, przewoznikow, operatorow magazynowych oraz odbiorcow koncowych. Istotne znaczenie ma koordynacja przeplywu towarow pomiedzy roznymi srodkami transportu oraz synchronizacja procesow przeladunkowych, magazynowych i dystrybucyjnych. Struktura sieci logistycznej ksztaltuje organizacje procesow transportowych oraz planowanie operacji dostawczych.',
            'en': 'The logistics and transport sector operates within extensive supply networks involving shippers, carriers, warehouse operators, and end recipients. Coordination of goods flow across different transport modes, as well as synchronization of handling, warehousing, and distribution processes, are key elements. The structure of the logistics network shapes the organization of transport processes and delivery planning.'
        }
    },

    'retail_trade': {
        'E': {
            'pl': 'Branza handlowa wiaze sie z funkcjonowaniem sklepow stacjonarnych, centrow dystrybucyjnych oraz kanalow sprzedazy internetowej, generujacych zuzycie energii, opakowan i odpadow. Kluczowe obszary obejmuja efektywnosc energetyczna obiektow handlowych, zuzycie energii w systemach chlodniczych i oswietleniowych, gospodarke odpadami opakowaniowymi oraz organizacje logistyki dostaw do punktow sprzedazy. Charakter dzialalnosci wymaga monitorowania zuzycia mediow oraz zarzadzania strumieniem produktow i opakowan w calym cyklu sprzedazy.',
            'en': 'The trade and retail sector involves the operation of physical stores, distribution centers, and online sales channels that generate energy consumption, packaging use, and waste. Key areas include energy efficiency of retail facilities, energy use in refrigeration and lighting systems, packaging waste management, and organization of deliveries to sales outlets. The nature of operations requires monitoring utility consumption and managing product and packaging flows throughout the sales cycle.'
        },
        'S': {
            'pl': 'Dzialalnosc handlowa opiera sie na pracy personelu sprzedazowego, magazynowego oraz obslugi klienta, czesto w systemie zmianowym i w bezposrednim kontakcie z klientami. Istotne znaczenie maja warunki pracy w punktach sprzedazy, organizacja czasu pracy, standardy obslugi oraz bezpieczenstwo w przestrzeni sklepowej i magazynowej. Branza wymaga odpowiedniego przygotowania pracownikow do obslugi klientow oraz przestrzegania zasad bezpieczenstwa i higieny pracy.',
            'en': 'Retail operations rely on sales staff, warehouse personnel, and customer service teams, often working in shift systems and in direct contact with customers. Working conditions in retail outlets, organization of working time, service standards, and safety in store and warehouse areas are key elements. The sector requires proper employee preparation for customer interaction and adherence to health and safety rules.'
        },
        'G': {
            'pl': 'Sektor handlu podlega regulacjom dotyczacym ochrony konsumentow, zasad sprzedazy, bezpieczenstwa produktow, ochrony danych osobowych oraz obowiazkow podatkowych i sprawozdawczych. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja sprzedazowa, utrzymania zgodnosci z przepisami branzowymi oraz nadzoru nad procedurami wewnetrznymi w punktach sprzedazy i kanalach online. Stalym elementem funkcjonowania firm jest kontrola zgodnosci dzialan handlowych z obowiazujacymi regulacjami.',
            'en': 'The trade and retail sector is subject to regulations covering consumer protection, sales rules, product safety, data protection, and tax and reporting obligations. Operating in this sector requires management of sales documentation, compliance with industry regulations, and supervision of internal procedures in both physical stores and online channels. Ongoing control of commercial activities in line with applicable regulations is a standard element of business operations.'
        },
        'SC': {
            'pl': 'Branza handlowa funkcjonuje w ramach rozbudowanych lancuchow dostaw obejmujacych producentow, importerow, hurtownie oraz centra dystrybucyjne i sklepy detaliczne. Istotne znaczenie ma koordynacja dostaw do punktow sprzedazy, zarzadzanie zapasami magazynowymi oraz synchronizacja przeplywu towarow pomiedzy magazynami, sklepami i kanalami e-commerce. Struktura lancucha dostaw ksztaltuje organizacje procesow zaopatrzenia i dystrybucji w sieci handlowej.',
            'en': 'The trade and retail sector operates within extensive supply chains involving manufacturers, importers, wholesalers, distribution centers, and retail outlets. Coordination of deliveries to sales outlets, inventory management, and synchronization of goods flow between warehouses, stores, and e-commerce channels are key elements. The supply chain structure shapes procurement and distribution processes within the retail network.'
        }
    },

    'it_software': {
        'E': {
            'pl': 'Dzialalnosc w sektorze IT i oprogramowania wiaze sie z wykorzystaniem infrastruktury serwerowej, centrow danych, urzadzen koncowych oraz sprzetu elektronicznego, generujacych zuzycie energii i zasobow technicznych. Kluczowe obszary obejmuja efektywnosc energetyczna srodowisk serwerowych, systemy chlodzenia centrow danych, cykl zycia sprzetu IT oraz gospodarowanie zuzytym sprzetem elektronicznym. Charakter dzialalnosci wymaga monitorowania zuzycia energii w infrastrukturze cyfrowej oraz racjonalnego zarzadzania zasobami technologicznymi wykorzystywanymi do swiadczenia uslug.',
            'en': 'The IT and software sector involves the use of server infrastructure, data centers, end-user devices, and electronic equipment that generate energy consumption and use technical resources. Key areas include energy efficiency of server environments, data center cooling systems, IT equipment life cycle management, and handling of electronic waste. The nature of operations requires monitoring energy use within digital infrastructure and rational management of technological resources used to deliver services.'
        },
        'S': {
            'pl': 'Sektor IT opiera sie na pracy specjalistow technicznych, programistow, analitykow oraz zespolow projektowych, czesto funkcjonujacych w modelu pracy hybrydowej lub zdalnej. Istotne znaczenie maja organizacja czasu pracy, ergonomia stanowisk komputerowych, rozwoj kompetencji technologicznych oraz wspolpraca zespolowa w srodowisku projektowym. Dzialalnosc w tej branzy wiaze sie z koniecznoscia zapewnienia odpowiednich warunkow pracy oraz przestrzegania zasad bezpieczenstwa i higieny pracy w srodowisku biurowym i domowym.',
            'en': 'The IT sector relies on technical specialists, developers, analysts, and project teams, often operating in hybrid or remote work models. Organization of working time, workstation ergonomics, development of technological competencies, and team collaboration within project environments are key elements. Activities in this sector involve ensuring appropriate working conditions and adherence to health and safety principles in both office and home environments.'
        },
        'G': {
            'pl': 'Dzialalnosc w sektorze IT podlega regulacjom dotyczacym ochrony danych osobowych, bezpieczenstwa informacji, praw wlasnosci intelektualnej oraz obowiazkow umownych wobec klientow i partnerow biznesowych. Prowadzenie dzialalnosci wymaga uporzadkowanego zarzadzania dokumentacja projektowa, procedurami bezpieczenstwa informacji oraz nadzoru nad zgodnoscia z wymogami ochrony danych i praw wlasnosci intelektualnej. Stalym elementem funkcjonowania firm IT jest kontrola zgodnosci dzialan z obowiazujacymi regulacjami i standardami branzowymi.',
            'en': 'The IT sector is subject to regulations covering data protection, information security, intellectual property rights, and contractual obligations toward clients and business partners. Operating in this sector requires structured management of project documentation, information security procedures, and oversight of compliance with data protection and intellectual property requirements. Ongoing control of compliance with applicable regulations and industry standards is a standard element of IT operations.'
        },
        'SC': {
            'pl': 'Sektor IT funkcjonuje w oparciu o wspolprace z dostawcami infrastruktury technologicznej, uslug chmurowych, sprzetu komputerowego oraz zewnetrznymi firmami programistycznymi i serwisowymi. Istotne znaczenie ma dostepnosc uslug zewnetrznych dostawcow, ciaglosc wsparcia technicznego, koordinacja z partnerami odpowiedzialnymi za hosting i infrastrukture oraz zarzadzanie relacjami z podwykonawcami. Struktura wspolpracy z dostawcami uslug i sprzetu ksztaltuje sposob realizacji projektow oraz ciaglosc swiadczenia uslug informatycznych.',
            'en': 'The IT sector operates through cooperation with providers of technological infrastructure, cloud services, computer hardware, and external software development and service companies. The availability of external provider services, continuity of technical support, coordination with partners responsible for hosting and infrastructure, and management of subcontractor relationships are important elements. The structure of cooperation with service and equipment providers shapes project execution and the continuity of IT service delivery.'
        }
    },

    'finance_fintech': {
        'E': {
            'pl': 'Sektor finansowy, w tym fintech, funkcjonuje glownie w oparciu o infrastrukture biurowa i cyfrowa, obejmujaca centra danych, systemy transakcyjne, sieci teleinformatyczne oraz sprzet informatyczny. Kluczowe obszary srodowiskowe dotycza zuzycia energii w infrastrukturze IT, funkcjonowania powierzchni biurowych oraz cyklu zycia urzadzen elektronicznych. Charakter dzialalnosci wiaze sie z monitorowaniem zuzycia energii i zasobow technicznych wykorzystywanych do obslugi procesow finansowych i uslug cyfrowych.',
            'en': 'The finance sector, including fintech, operates primarily through office and digital infrastructure, including data centers, transaction systems, telecommunication networks, and IT equipment. Key environmental aspects relate to energy consumption within IT infrastructure, operation of office facilities, and the life cycle of electronic devices. The nature of operations involves monitoring energy use and technical resources required to support financial processes and digital services.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze finansowym opiera sie na pracy specjalistow z zakresu finansow, analityki, technologii oraz obslugi klienta, funkcjonujacych w srodowisku biurowym lub w modelu hybrydowym. Istotne znaczenie maja organizacja czasu pracy, standardy obslugi klienta, rozwoj kompetencji zawodowych oraz ergonomia stanowisk pracy. Funkcjonowanie branzy wiaze sie z zapewnieniem odpowiednich warunkow pracy oraz przestrzeganiem zasad bezpieczenstwa i higieny pracy w srodowisku biurowym.',
            'en': 'The finance sector relies on finance professionals, analysts, technology specialists, and customer service teams operating in office or hybrid work environments. Organization of working time, customer service standards, professional development, and workstation ergonomics are key elements. Sector operations involve ensuring appropriate working conditions and adherence to health and safety principles in office environments.'
        },
        'G': {
            'pl': 'Sektor finansowy podlega rozbudowanym regulacjom obejmujacym wymogi nadzorcze, standardy raportowe, ochrone danych osobowych, przeciwdzialanie praniu pieniedzy oraz zarzadzanie ryzykiem operacyjnym i technologicznym. Prowadzenie dzialalnosci wymaga utrzymania procedur zgodnosci, dokumentacji regulacyjnej, systemow kontroli wewnetrznej oraz jasnego podzialu odpowiedzialnosci. Stalym elementem funkcjonowania instytucji finansowych jest nadzor nad zgodnoscia dzialan z obowiazujacymi przepisami i standardami branzowymi.',
            'en': 'The financial sector is subject to extensive regulations covering supervisory requirements, reporting standards, data protection, anti-money laundering obligations, and management of operational and technological risks. Operating in this sector requires maintaining compliance procedures, regulatory documentation, internal control systems, and clear allocation of responsibilities. Ongoing oversight of activities in line with applicable regulations and industry standards is a standard element of financial institutions\' operations.'
        },
        'SC': {
            'pl': 'Sektor finansowy funkcjonuje w oparciu o wspolprace z dostawcami technologii, operatorami platnosci, partnerami bankowymi oraz podmiotami swiadczacymi uslugi przetwarzania danych i infrastruktury transakcyjnej. Istotne znaczenie ma dostepnosc i ciaglosc dzialania dostawcow uslug zewnetrznych, koordinacja z podmiotami odpowiedzialnymi za infrastrukture platnicza oraz zarzadzanie relacjami z partnerami technologicznymi i outsourcingowymi. Struktura wspolpracy z dostawcami uslug ksztaltuje ciaglosc i organizacje procesow finansowych oraz swiadczenia uslug cyfrowych.',
            'en': 'The financial sector operates through cooperation with technology providers, payment operators, banking partners, and entities delivering data processing and transaction infrastructure services. The availability and continuity of external service providers, coordination with entities responsible for payment infrastructure, and management of relationships with technology and outsourcing partners are important elements. The structure of cooperation with service providers shapes the continuity and organization of financial processes and digital service delivery.'
        }
    },

    'services_other': {
        'E': {
            'pl': 'Sektor uslugowy funkcjonuje glownie w oparciu o infrastrukture biurowa, lokale uslugowe oraz sprzet wykorzystywany do swiadczenia uslug specjalistycznych. Kluczowe obszary srodowiskowe obejmuja zuzycie energii w budynkach, wykorzystanie materialow eksploatacyjnych (np. papier, srodki czystosci, materialy techniczne) oraz gospodarowanie odpadami powstajacymi w trakcie realizacji uslug. Charakter dzialalnosci wiaze sie z monitorowaniem zuzycia mediow oraz racjonalnym zarzadzaniem zasobami wykorzystywanymi w codziennej dzialalnosci.',
            'en': 'The services sector operates primarily through office infrastructure, service premises, and equipment used to deliver specialized services. Key environmental aspects include energy consumption in buildings, use of operational materials (e.g., paper, cleaning agents, technical supplies), and waste management related to service activities. The nature of operations involves monitoring utility consumption and rational management of resources used in daily activities.'
        },
        'S': {
            'pl': 'Dzialalnosc w sektorze uslugowym opiera sie na pracy specjalistow swiadczacych uslugi doradcze, techniczne, administracyjne lub wsparcia operacyjnego. Istotne znaczenie maja organizacja czasu pracy, rozwoj kompetencji zawodowych oraz zapewnienie odpowiednich warunkow pracy. Funkcjonowanie branzy wiaze sie z przestrzeganiem zasad bezpieczenstwa i higieny pracy oraz utrzymaniem stabilnych zespolow realizujacych uslugi.',
            'en': 'The services sector relies on professionals delivering advisory, technical, administrative, or operational support services. Organization of working time, professional development, and appropriate working conditions are key elements. Sector operations involve adherence to health and safety principles and maintaining stable teams delivering services.'
        },
        'G': {
            'pl': 'Sektor uslugowy podlega regulacjom dotyczacym prowadzenia dzialalnosci gospodarczej, standardow zawodowych, ochrony danych osobowych oraz wymagan jakosciowych zwiazanych z danym rodzajem uslug. Prowadzenie dzialalnosci wymaga zarzadzania dokumentacja umowna, utrzymania przejrzystych procedur wewnetrznych oraz nadzoru nad zgodnoscia dzialan z obowiazujacymi przepisami branzowymi. Stalym elementem funkcjonowania firm uslugowych jest kontrola zgodnosci procesow z regulacjami sektorowymi i standardami zawodowymi.',
            'en': 'The services sector is subject to regulations covering business operations, professional standards, personal data protection, and quality requirements related to specific types of services. Operating in this sector requires management of contractual documentation, maintenance of transparent internal procedures, and oversight of compliance with applicable industry regulations. Ongoing control of processes in line with sector regulations and professional standards is a standard element of service providers\' operations.'
        },
        'SC': {
            'pl': 'Sektor uslugowy funkcjonuje w oparciu o wspolprace z podwykonawcami oraz dostawcami specjalistycznych narzedzi, systemow informatycznych i uslug wspierajacych. Istotne znaczenie ma koordynacja wspolpracy z partnerami zewnetrznymi oraz zarzadzanie relacjami z dostawcami uslug wspierajacych i podwykonawcami. Struktura wspolpracy z dostawcami i podwykonawcami ksztaltuje sposob realizacji projektow oraz organizacje swiadczenia uslug.',
            'en': 'The services sector operates through cooperation with subcontractors and providers of specialized tools, IT systems, and supporting services. Coordination with external partners and management of relationships with supporting service providers and subcontractors are important elements. The structure of cooperation with suppliers and subcontractors shapes project execution and service delivery organization.'
        }
    }
};

/**
 * Gets industry-specific profile text explaining why a pillar is important for an industry
 * @param {string} industryCode - Industry code (e.g., 'construction', 'energy_resources')
 * @param {string} pillar - Pillar code (E, S, G, SC)
 * @param {string} language - Language code ('pl' or 'en')
 * @returns {string} Industry profile text or empty string
 */
function getIndustryProfileText(industryCode, pillar, language = 'pl') {
    if (!industryCode || !pillar) return '';

    const effectiveLanguage = language === 'en' ? 'en' : 'pl';

    return INDUSTRY_PROFILE[industryCode]?.[pillar]?.[effectiveLanguage] || '';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INDUSTRY_PROFILE,
        getIndustryProfileText
    };
}

// Also expose globally if in browser context
if (typeof window !== 'undefined') {
    window.IndustryProfile = {
        INDUSTRY_PROFILE,
        getIndustryProfileText
    };
}
