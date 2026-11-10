# Allignd: mobiele app-migratie

## Doel en afgesproken richting

- De bestaande Allignd-webapp is de inhoudelijke en visuele referentie. De mobiele
  versie moet dezelfde belangrijke schermen en functies behouden; geen nieuwe
  herontwerprichting voordat de huidige ervaring is overgenomen.
- De Expo-app in `mobile/` wordt het uiteindelijke mobiele product voor iOS en
  Android. Er komt niet eerst een aparte, publiek gelanceerde PWA.
- Goedgekeurd fasepalet “Barbie cool” (9 november 2026): Barbie-roze `#FF5C8A`
  voor menstruatie, koel blauw `#7FB4D9` voor folliculair, orchidee `#C58AC6` voor
  ovulatoir en zacht paars `#9D92D4` voor luteaal. Geen geel of groen als fasekleur.
  Niet-actieve cyclusringsegmenten blijven met opacity `0.96` zichtbaar. Grote fase-
  titels gebruiken dezelfde basiskleur als de ring; kleine teksten behouden donkere,
  leesbare tekstkleuren.
- We migreren scherm voor scherm. Waar haalbaar bundelen/we hergebruiken we bestaande
  React-webschermen in de Expo-app; waar dat niet goed werkt maken we een passend
  mobiel scherm. Een scherm mag er bij de eerste versie hybride uitzien, maar mag
  niet afhankelijk blijven van de publieke live website als definitieve oplossing.
- Eerste markt en taal: Nederlandstalig / Nederland. Doelgroep: vrouwen van 18 jaar
  en ouder. Houd de teksten vertaalbaar zodat Engels later toegevoegd kan worden.
- Productgrens: voeding en beweging afstemmen op de cyclus. Geen zwangerschap-,
  vruchtbaarheids-, ovulatie- of anticonceptievoorspellingen.
- Abonnementen: volledige app-toegang na aankoop via Apple/Google; €7,99 per maand
  of €59,99 per jaar, beide met een proefperiode van 7 dagen voor gebruikers die
  daarvoor in aanmerking komen. Er zijn geen actieve Stripe-klanten om over te zetten.

## Belangrijke open punten vóór winkelpublicatie

- Apple is per e-mail gevraagd of een Nederlandse eenmanszaak de app mag indienen
  onder richtlijn 5.1.1(ix), omdat de app cyclus- en symptoomgegevens verwerkt. Geen
  betaald Apple Developer-account of juridische rechtsvormkeuze baseren op een
  aanname; wacht op antwoord en bespreek dit met een jurist.
- Google kan het adres van een ontwikkelaar met betaalde functies openbaar tonen.
  De eigenaar wil geen woonadres publiceren. Onderzoek vóór Play Console-registratie
  welke geldige zakelijke adresopties er zijn; gebruik nooit een onjuist adres.
- De automatische verlenging en opzegbaarheid van het jaarabonnement moet een
  Nederlandse consumentenrechtjurist beoordelen.
- Privacy, toestemming voor gezondheidsgegevens, accountverwijdering en community-
  voorwaarden moeten overeenkomen met de werkelijke techniek en juridisch worden
  gecontroleerd. Huidige voorwaarden zijn gemarkeerd als concept.

## Huidige technische situatie

- Hoofdmap: React 18 + Vite-webapp, Vercel API/backend en ook een bestaande
  Capacitor 8 iOS/Android-wrapper.
- `mobile/`: aparte Expo SDK 58 / React Native-app. De app-ID's zijn
  `nl.allignd.app` voor iOS en Android, gelijk aan de Capacitor-configuratie.
  Behoud beide projecten voorlopig; gebruik Expo als enige mobiele release-route.
- Expo start met e-mail inloggen/account maken of demo. Daarna toont een gebundelde
  Expo DOM-component de echte `MainLayout` uit `src/App.jsx`, met exact dezelfde
  webschermen, CSS, logo-header en vijf tabs. Dit is geen native nabouw en laadt de
  publieke live website niet als schermbron. De losse route `mobile/src/app/website.tsx`
  blijft alleen een oude tijdelijke brug.
- De eigenaar heeft expliciet gekozen voor eerst exact dezelfde vormgeving als de
  webapp. De eerder gemaakte, afwijkende native Cyclusgids wordt daarom niet gebruikt
  in de hoofdweergave. De native Vandaag-bestanden blijven voorlopig bewaard als
  experiment, maar vormen evenmin de primaire visuele route.
- De preview gebruikt een afgeschermde `previewProfile`-modus zonder account-sync.
  Bij een echte Expo-sessie krijgt de web-Supabase-client de bestaande tokens. Alle vijf
  tabs zijn in de browser geopend zonder consolefouten; backendacties, beta/autorisatie,
  accountwisseling en echte iOS-/Android-apparaatweergave moeten nog worden geverifieerd.
- Backend: Supabase voor authenticatie en gegevens; Vercel voor API-eindpunten.
  Behoud backend en bestaande accounts waar mogelijk. Controleer vóór iedere
  migratie welke gegevens in Supabase staan en welke mogelijk alleen in browser-
  `localStorage` staan.
- De Expo-app heeft nog geen `eas.json` of EAS-projectkoppeling. App-icoon en enkele
  afbeeldingen zijn nog Expo-startermateriaal.
- Eerder geslaagd: Expo TypeScript-controle, Expo Doctor (20/20), iOS- en Android-
  JavaScript-export, en de bestaande mobiele cycluslogica-tests. Dit zijn geen
  apparaat-, betaal- of winkelgoedkeuringstests.

## Scherm-voor-scherm checklist

Statusbetekenis: **Overnemen** = nog niet aanwezig of geen functionele pariteit;
**Vergelijken** = er is al een Expo-scherm, maar gedrag/inhoud moet met web worden
vergeleken; **Buiten app** = website-informatie, niet noodzakelijk een app-scherm.

| Webscherm / flow | Huidige inhoud en functies | Expo-status / werk |
| --- | --- | --- |
| Publieke landingspagina en wachtlijst | Merkverhaal, functies, taalkeuze, wachtlijst, login-ingang | **Buiten app** als marketingwebsite, tenzij de eigenaar later vraagt om dit ook in de app te tonen. Beta-toegangspoort vóór openbare lancering apart controleren. |
| Account aanmaken en inloggen | E-mail/wachtwoord, Google OAuth, foutmeldingen, bevestigingsmail opnieuw sturen, e-mailbevestiging, wachtwoord vergeten/resetten, NL/EN | **Overnemen.** Expo heeft e-mail inloggen/registreren en demo, maar nog geen volledige reset-/callback-flow of Google-login. Test bevestigingslinks en sessieherstel op echte apparaten. |
| Onboarding | Welkom; cyclusstart/eerdere menstruatie, menstruatieduur en cycluslengte; geboortedatum/leeftijd, lengte/gewicht, lichaamsdoel en tempo; activiteit/stappen/trainingsdagen/ervaring; voedingsvoorkeur; berekende doelen/resultaat; proefaanbod; account maken en e-mail verifiëren | **Vergelijken.** De bestaande flow opent in Expo voor nieuwe/niet-onboardede gebruikers en slaat de oude betaalstap over. Resultaten worden via `computed_targets` opgeslagen; daarna rendert `MainLayout` Vandaag zonder web-redirect. Preview van welkom tot dashboard is geslaagd met 2226 kcal/294 g/123 g/62 g en zonder Supabase-writes. Op 10 november ook geverifieerd: resultaat/Vandaag/Cyclus op Ovulatiefase, dag 13, 16 dagen aftellen tot 26 november; 29 okt–2 nov gelogd als menstruatie en 3 nov als stop-/folliculaire dag. Echte accountopslag, e-mailcallback en apparaatbevestiging nog testen. Apple-betaalstroom wordt later apart gekoppeld. |
| Proefperiode en abonnement | Web-onboarding toont een proefaanbod; een losse Stripe-pagina toont jaar-/maandplannen en profiel heeft een Stripe-beheerlink. De hoofd-abonnementenmuur in `App.jsx` is momenteel uitgecommentarieerd; controleer daarom de live betaalflow. | **Opnieuw bouwen voor winkels.** Zelfde merkervaring, maar Apple/Google-aankoop, prijs/duur na proef, aankopen herstellen en abonnement beheren. Stripe mag niet de mobiele betaalroute zijn. Definitieve implementatie wacht op Apple-/juridische duidelijkheid. |
| Vandaag | Dagstrip/kalender, cyclusfase en dag, menstruatie starten/stoppen, cyclusstatus, dagelijkse vraag/community-link, calorieën en macro's inclusief vezels, eten toevoegen, maaltijden bekijken/verwijderen, gewoontes, gewicht, symptomen, voortgang en community-links | **Vergelijken.** De echte web-Vandaag is de primaire gebundelde app-weergave en is visueel in de demo gecontroleerd. Verifieer nog alle acties met echte accountdata en op apparaten. |
| Cyclusgids / fasekalender | Maandkalender, historische/toekomstige datums, cyclusfasen, verwachte menstruatievensters/mijlpaal, dagdetails, symptomen/check-in en links naar voeding/fitness | **Vergelijken.** De echte web-Cyclusgids met de nieuwe fasekleuren is overgenomen via dezelfde `MainLayout`; geen afwijkende native kalender meer. Controleer dagselectie, check-in, menstruatie en links nog op apparaten. |
| Fitness | Faseadvies, intensiteit, weekdoel en weekoverzicht, beweging/rustdag loggen, lichaamsdeel kiezen, oefeningen/instructies en doel-/fasefocus | **Vergelijken.** Het echte web-Fitness-scherm opent via de bestaande tab. Verifieer logging, oefeningen en accountdata op apparaten. |
| Recepten en voeding | Fase- en dieetafhankelijk voedingsadvies/nutriënten, ontbijt/lunch/diner/snacks, receptdetails, macro's/vezels, ingrediënten/instructies, toevoegen aan dagboek | **Vergelijken.** Het echte web-Recepten-scherm opent via de bestaande tab. Verifieer receptdetails en toevoegen aan het dagboek op apparaten. |
| Community-feed | Categorieën, nieuwste/populairst, eigen/gelikete/gereageerde filters, feed, laden/leeg/fout | **Vergelijken.** Het echte web-Community-scherm opent via de bestaande tab. API-basis-URL's, sessie, feeddata en alle toestanden moeten nog mobiel worden getest. |
| Community-bericht en reacties | Bericht maken, categorie en optionele fasetag, anoniem posten, detail, reacties, likes, eigen inhoud verwijderen | **Vergelijken.** De bestaande webschermen zijn gebundeld; schrijven, toetsenbord, API-autorisatie en alle acties moeten nog mobiel worden geverifieerd. |
| Community-veiligheid/moderatie | Inhoud melden, leden blokkeren/deblokkeren, geblokkeerde lijst, moderatiepaneel voor beheerders en inhoudsfilters | **Vergelijken en apparaat testen.** De bestaande webschermen zijn gebundeld. Verifieer dat meld-, blokkeer- en moderatieflows echt werken; dit blijft essentieel voor winkelreview. |
| Voortgang / inzichten | Weekgemiddelden voeding/macro's, gewichtsgeschiedenis, symptomen vergelijken tussen cycli/fasen | **Vergelijken.** Het bestaande web-Progress-scherm is onderdeel van de gebundelde `MainLayout`. Controleer navigatie, berekeningen en grafiek-/datumgedrag op apparaten. |
| Profiel en instellingen | Persoonsgegevens, lichaamsdoel/tempo, cyclusinstellingen en correctie, voedingsvoorkeur, activiteit/stappen/trainingsdagen/ervaring, NL/EN, privacy, voorwaarden, abonnement, uitloggen en account verwijderen | **Vergelijken.** Het bestaande web-Profiel is onderdeel van de gebundelde `MainLayout`. Accountacties en logout-synchronisatie met Expo moeten nog worden overbrugd/getest; voeg een werkende externe verwijderpagina toe. |
| Privacy en voorwaarden | Privacyuitleg, gegevens/rechten/contact, voorwaarden en cyclus-/gezondheidsdisclaimer | **Vergelijken met goedgekeurde tekst.** De bestaande webschermen zijn gebundeld, maar de voorwaarden zijn nog een concept en niet klaar voor publicatie. |

## Eerste migratievorm per scherm (werkvoorstel)

Dit is de volgorde om dezelfde ervaring in de uiteindelijke Expo-app te krijgen; het
betekent niet dat elk scherm direct opnieuw ontworpen wordt.

- **App-shell en native basis:** gebruik de gebundelde echte `MainLayout` met de vijf
  webtabs als visuele basis. Native code dient vooral voor sessie, veilige schermranden,
  storefuncties en platformintegratie; verander de schermvormgeving niet zelfstandig.
- **Native of hybride vóór release:** registratie/inloggen en deep links, onboarding,
  betaalmuur/store-aankoop en profiel/accountverwijdering. Deze stromen raken native
  toetsenborden, storebetalingen, privacy en accounts; ze moeten in de echte Expo-app
  betrouwbaar werken.
- **Hybride/gebundelde DOM eerst waar dat de getrouwste en veiligste hergebruikroute
  is:** cyclusgids, fitness, recepten, community, voortgang en statische juridische
  schermen. Bundel content in de app; gebruik niet de publieke live website als
  definitieve schermbron. Koppel per scherm de juiste sessie en gegevens.
- **Later eventueel nativiseren op basis van gebruik:** bijvoorbeeld grotere communityfeeds,
  grafieken en formulieren. Eerst de exacte webweergave en werking op apparaten goedkeuren;
  daarna alleen met expliciete instemming van de eigenaar native verfijnen.
- De bestaande websitepagina's gebruiken Vite-variabelen, browseropslag, globale
  providers en DOM-API's. Daarom is een technische proef per scherm nodig; de hele
  `App.jsx` kan niet zonder aanpassingen in één keer in Expo worden geïmporteerd.
  Een hybride aanpak verlaagt herbouw, maar is op zichzelf geen garantie voor
  App Store-goedkeuring.

## Inhoudelijke controle vóór overnemen

- De bestaande website én Expo-code gebruiken een fase met het label “ovulatoir” / “ovulatiefase”. Dit botst mogelijk met de expliciete productgrens: geen ovulatie-, vruchtbaarheids-, zwangerschap- of anticonceptieclaims. Controleer alle labels, uitleg, fasecontent, onboarding en community-fasetags en pas ze vóór publicatie aan naar een door de eigenaar goedgekeurde, cyclus-neutrale formulering. Niet automatisch dezelfde woorden kopiëren.
- Houd Nederlandse tekst als eerste release. Maak geen Engelse schermen af als dat de Nederlandse pariteit vertraagt, maar voorkom hard-coded strings waar een vertaalbare tekst nodig is.
- De eigenaar vereist dat de app er hetzelfde uitziet als de webapp voordat verder wordt gegaan. Gebruik daarom de echte webcomponenten en CSS via de gebundelde DOM-weergave; geen eigen native interpretatie van kaarten, typografie of indeling. Controleer veilige randen en apparaatweergave zonder die afspraak te wijzigen.

## Gedeelde techniek die tijdens de schermmigratie gecontroleerd moet worden

- Auth en account: Expo Supabase-sessie, webview-cookies, Google OAuth, e-mailverificatie, wachtwoordreset, logout en accountwisseling. Eén gebruiker mag niet onverwacht twee keer moeten inloggen.
- Gegevens: profiel, berekende doelen, cycle history, menstruatielogs, voeding, custom foods, water, stappen, gewicht, symptomen, beweging en community. Verifieer server- en eventuele lokale opslag en behoud bestaande accounts/records.
- Logica: vergelijk web- en Expo-berekeningen voor cyclus, datum/tijd, menstruatielog, voeding en macro's. Native helperlogica heeft al tests; voeg parity-tests toe vóór functies worden vervangen.
- Push: web/Capacitor heeft pushregistratie en meldingen. De Expo-app heeft dit nog niet. Als dagelijkse/faseherinneringen bij de volledige app horen, migreer naar Expo-compatibele notificaties en test toestemming, openen naar het juiste scherm en uitschrijven.
- Offline/fouten: behoud relevante offline-, laden-, lege-, fout- en opnieuw-proberen-toestanden; maak geen offline-opslaan-belofte zonder syncgedrag.
- Navigatie: de gebundelde `MainLayout` gebruikt nu dezelfde vijf vaste tabs als web (Vandaag, Community, Fitness, Recepten, Gids). De Expo Stack verzorgt alleen de buitenroutes en sessie; behoud profiel-/kalenderingangen en test apparaatnavigatie.
- Betaalstatus: na store-aankoop moet backend/app toegang consistent bijhouden; herstel aankopen, verlopen proefperiode, annuleren, terugbetaling en accountverwijdering testen. Productkeuze voor storevalidatie nog vastleggen.
- Toegang en autorisatie: de DOM-weergave gebruikt bewust `MainLayout` en niet de web-only beta-/landingsgates van default `App`. Voor productie moeten bèta-/eigenaarsautorisatie, logout/accountwisseling, API-basis-URL's en accountverwijdering native correct worden overbrugd; visuele pariteit is hiervan geen bewijs.

## Release-voorbereiding (later, niet nodig om schermpariteit te starten)

- Apple schriftelijk antwoord en juridische beoordeling van app-/accountgeschiktheid.
- Geldige Google Play-adresoplossing, zonder een onjuist of ongewenst woonadres te publiceren.
- App Store Connect en Play Console-producten/introductieaanbiedingen configureren; correcte prijzen en lokale winkelweergave controleren.
- EAS-project koppelen, `eas.json` toevoegen, app-icoon/splash vervangen, productieomgevingen instellen en iOS-/Android-testbuilds maken.
- Privacyverklaring, voorwaarden, toestemming, accountverwijdering, communityrichtlijnen, data-/health-app-declaraties, reviewdemo en Nederlandse storeteksten afronden.
- Eerst testen op echte iPhone en Android, daarna TestFlight/Play-testtrack en pas daarna openbare release.

## Afgerond en volgende stappen

- [x] Expo-project en bestaande webapp/backend in kaart gebracht.
- [x] Bestaande app-schermen en huidige native Expo-schermen geïnventariseerd.
- [x] Scope bijgewerkt: iOS én Android, Nederlands eerst, volledige feature-pariteit, geen publieke PWA-lancering.
- [x] Eerder gecontroleerd: Expo Doctor (20/20) en iOS/Android JS-export.
- [x] 8 november 2026: TypeScript en 26 Expo-cyclus-/kalenderlogica-tests geslaagd; webpreview-opslag gescheiden van native SQLite-opslag.
- [x] 8 november 2026: na expliciete keuze van de eigenaar de afwijkende native gids vervangen door de echte web-`MainLayout` in een gebundelde Expo DOM-component. Alle vijf tabs in de browser geopend zonder consolefouten; iOS-/Android-export inclusief DOM en afbeeldingen geslaagd. Dit zijn nog geen apparaat- of winkeltests.
- [ ] Alle schermen op echte iPhones/Android-apparaten en met echte accounts visueel/gedragsmatig vergelijken; verschillen aanvullen in deze tabel.
- [ ] Onboarding en volledige account-/authflow migreren.
- [ ] Vandaag-scherm tegen web afwerken en parity-tests toevoegen.
- [ ] Overige schermen in de tabel implementeren en op apparaat verifiëren.
- [ ] In-app betalingen en backend entitlement-flow bouwen nadat de juridische/accountgates zijn opgelost.
