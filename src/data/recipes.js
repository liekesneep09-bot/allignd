import { PHASES } from '../logic/cycle'

export const RECIPES = {
    [PHASES.MENSTRUAL]: {
        description: 'Je lichaam vraagt om rust, warmte en herstel. Wees zacht voor jezelf met deze voedende recepten.',
        focusPoints: [
            'Warme, licht verteerbare maaltijden',
            'IJzerrijke voeding',
            'Magnesiumrijke ingrediënten',
            'Voldoende eiwiten voor herstel'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Warme havermout met cacao en rood fruit',
                    emoji: '🥣',
                    explanation: 'De cacao geeft een vleugje magnesium en de warmte voelt als een knuffel voor je buik.',
                    ingredients: ['50g havermout', '200ml amandelmelk', '1 el rauwe cacao', 'Handje bevroren rood fruit', '1 el lijnzaad'],
                    instructions: ['Verwarm de melk in een steelpan.', 'Voeg havermout en cacao toe, kook zachtjes 5 min.', 'Roer het lijnzaad erdoor.', 'Serveer met het rode fruit on top.'],
                    macros: { p: 12, c: 45, f: 14, kcal: 354 }
                },
                {
                    title: 'Roerei met spinazie op volkoren toast',
                    emoji: '🍳',
                    explanation: 'Een zachte, voedzame start met wat extra plantaardig ijzer uit de spinazie.',
                    ingredients: ['2 eieren', 'Handvol verse spinazie', '2 sneetjes volkoren brood', 'Snufje kurkuma', 'Olijfolie'],
                    instructions: ['Verhit olie in de pan en slink de spinazie kort.', 'Kluts eieren met kurkuma en voeg toe.', 'Roerbak tot het ei gestold is.', 'Serveer op geroosterd brood.'],
                    macros: { p: 22, c: 30, f: 18, kcal: 370 }
                }
            ],
            lunch: [
                {
                    title: 'Rijke linzensoep',
                    emoji: '🍲',
                    explanation: 'Een kom vol warmte en vezels, precies wat je nu kunt gebruiken.',
                    ingredients: ['150g linzen (uit blik)', '1 wortel', '1 stengel bleekselderij', '500ml groentebouillon', 'Komijnpoeder'],
                    instructions: ['Snijd groenten fijn en fruit aan in olie.', 'Voeg linzen, bouillon en komijn toe.', 'Laat 10 min zachtjes pruttelen.', 'Pureer grof of eet als heldere soep.'],
                    macros: { p: 18, c: 40, f: 8, kcal: 304 }
                },
                {
                    title: 'Quinoa salade met geroosterde biet',
                    emoji: '🥗',
                    explanation: 'Aardse smaken die je voeden zonder zwaar op de maag te liggen.',
                    ingredients: ['75g quinoa (gekookt)', '2 gekookte bieten', 'Handje walnoten', 'Beetje feta', 'Dressing van olijfolie/citroen'],
                    instructions: ['Snijd de bieten in blokjes.', 'Meng met de quinoa en walnoten.', 'Brokkel de feta eroverheen.', 'Besprenkel met dressing.'],
                    macros: { p: 15, c: 45, f: 20, kcal: 420 }
                }
            ],
            diner: [
                {
                    title: 'Langzaam gegaarde runderstoof',
                    emoji: '🍖',
                    explanation: 'Rijk en troostend; perfect om je energie rustig weer op te bouwen.',
                    ingredients: ['150g runderlappen', '1 ui', '1 winterpeen', 'Tomatenpuree', 'Runderbouillon'],
                    instructions: ['Braad het vlees aan met ui.', 'Voeg groenten en bouillon toe.', 'Laat minstens 2 uur sudderen (of gebruik snelkookpan).', 'Serveer met aardappelpuree (optioneel).'],
                    macros: { p: 35, c: 15, f: 20, kcal: 380 }
                },
                {
                    title: 'Gebakken zalm met zoete aardappel',
                    emoji: '🐟',
                    explanation: 'Zachte vetten en vitaminen die je lichaam liefdevol ondersteunen.',
                    ingredients: ['1 zalmfilet', '1 zoete aardappel', 'Gestoomde broccoli', 'Citroen', 'Olijfolie'],
                    instructions: ['Snijd aardappel in partjes en rooster 25 min in oven (200C).', 'Bak de zalm 3-4 min per kant in de pan.', 'Stoom de broccoli kort.', 'Serveer samen met citroen.'],
                    macros: { p: 30, c: 40, f: 18, kcal: 442 }
                }
            ],
            snack: [
                {
                    title: 'Pure chocolade (70%+)',
                    emoji: '🍫',
                    explanation: 'Een momentje voor jezelf met een klein beetje magnesium-support.',
                    ingredients: ['2-3 blokjes pure chocolade', 'Kop gemberthee'],
                    instructions: ['Neem de tijd om er rustig van te genieten.'],
                    macros: { p: 2, c: 8, f: 10, kcal: 130 }
                },
                {
                    title: 'Een handje walnoten',
                    emoji: '🥜',
                    explanation: 'Eenvoudig en voedzaam, voor als je even snel iets nodig hebt.',
                    ingredients: ['30g walnoten (ongezouten)'],
                    instructions: ['Direct uit het vuistje.'],
                    macros: { p: 5, c: 4, f: 20, kcal: 216 }
                }
            ]
        }
    },
    [PHASES.FOLLICULAR]: {
        description: 'De energie keert terug. Je lichaam is klaar voor opbouw. Kies voor frisse, lichte voeding.',
        focusPoints: [
            'Frisse, lichte energie',
            'Eiwitten voor opbouw',
            'Gevarieerde groenten',
            'Langzame koolhydraten'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Griekse yoghurt met granola en fruit',
                    emoji: '🫐',
                    explanation: 'Een frisse, energieke start om je dag actief te beginnen.',
                    ingredients: ['200g Griekse yoghurt', '30g granola (laag suiker)', 'Halve banaan', 'Blauwe bessen'],
                    instructions: ['Doe yoghurt in een kom.', 'Snijd banaan in plakjes.', 'Voeg fruit en granola toe.', 'Eventueel toppen met beetje honing.'],
                    macros: { p: 20, c: 35, f: 8, kcal: 292 }
                },
                {
                    title: 'Avocado toast met gepocheerd ei',
                    emoji: '🥑',
                    explanation: 'Heerlijk in balans, zodat je je lang verzadigd en scherp voelt.',
                    ingredients: ['2 snee volkoren brood', 'Halve avocado', '2 eieren', 'Chilivlokken', 'Citroensap'],
                    instructions: ['Rooster het brood en prak de avocado erop.', 'Pocheer of kook de eieren zacht (6 min).', 'Leg eieren op de toast.', 'Kruid met peper, zout en chili.'],
                    macros: { p: 18, c: 30, f: 22, kcal: 390 }
                }
            ],
            lunch: [
                {
                    title: 'Volkoren wrap met kip en hummus',
                    emoji: '🌯',
                    explanation: 'Lekker licht en makkelijk mee te nemen voor je drukke dag.',
                    ingredients: ['1 volkoren wrap', '75g kipfilet (waren)', '2 el hummus', 'Rucola', 'Geraspte wortel'],
                    instructions: ['Besmeer wrap met hummus.', 'Beleg met kip en groenten.', 'Oprollen en doorsnijden.'],
                    macros: { p: 25, c: 35, f: 12, kcal: 348 }
                },
                {
                    title: 'Frisse couscous salade met feta',
                    emoji: '🥙',
                    explanation: 'Kleurrijk en vullend, geeft je precies de energie die je nu voelt.',
                    ingredients: ['75g couscous (droog)', 'Komkommer', 'Tomaat', '50g feta', 'Verse munt'],
                    instructions: ['Wel de couscous in heet water (5 min).', 'Snijd groenten en feta in blokjes.', 'Meng alles door elkaar met de munt.', 'Breng op smaak met citroensap.'],
                    macros: { p: 12, c: 55, f: 14, kcal: 394 }
                }
            ],
            diner: [
                {
                    title: 'Wokgerecht met kip en groenten',
                    emoji: '🍜',
                    explanation: 'Snel klaar en vol vitaminen, past perfect bij je stijgende energie.',
                    ingredients: ['150g kipfilet', 'Wokgroenten (paprika, courgette)', 'Sojasaus', 'Gember', 'Zilvervliesrijst'],
                    instructions: ['Kook de rijst.', 'Wok de kip goudbruin in olie.', 'Voeg groenten, gember en soja toe.', 'Roerbak kort op hoog vuur.'],
                    macros: { p: 35, c: 45, f: 10, kcal: 410 }
                },
                {
                    title: 'Witvis met rijst en broccoli',
                    emoji: '🐠',
                    explanation: 'Licht verteerbaar en puur, om je lichaam te voeden in de opbouwfase.',
                    ingredients: ['150g kabeljauw', '75g rijst', '200g broccoli', 'Dille', 'Citroen'],
                    instructions: ['Kook rijst en broccoli.', 'Bak de vis in 5-6 min gaar in de pan.', 'Serveer met verse dille en citroen.'],
                    macros: { p: 30, c: 50, f: 5, kcal: 365 }
                }
            ],
            snack: [
                {
                    title: 'Appel met amandelpasta',
                    emoji: '🍎',
                    explanation: 'Een knapperige, frisse snack voor tussendoor.',
                    ingredients: ['1 appel', '1 el amandelpasta'],
                    instructions: ['Snijd appel in partjes.', 'Dip in de pasta.'],
                    macros: { p: 4, c: 20, f: 8, kcal: 168 }
                },
                {
                    title: 'Rijstwafel met kalkoenfilet',
                    emoji: '🍘',
                    explanation: 'Licht en eiwitrijk, ideaal voor na het sporten of onderweg.',
                    ingredients: ['2 rijstwafels', '2 plakjes kalkoenfilet', 'Komkommer'],
                    instructions: ['Beleg de wafels.'],
                    macros: { p: 8, c: 14, f: 2, kcal: 106 }
                }
            ]
        }
    },
    [PHASES.OVULATORY]: {
        description: 'Je prestatievermogen piekt. Ondersteun je hoge energieverbruik met volwaardige voeding.',
        focusPoints: [
            'Brandstof voor hoge energie',
            'Koolhydraten',
            'Eiwitten voor spierherstel',
            'Voldoende hydratatie'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Groene smoothie bowl met hennepzaad',
                    emoji: '🥬',
                    explanation: 'Een power-ontbijt dat je direct klaarzet voor een actieve dag.',
                    ingredients: ['1 banaan', 'Hand spinazie', '200ml amandelmelk', '1 schep eiwitpoeder', '1 el hennepzaad'],
                    instructions: ['Blend banaan, spinazie, melk en eiwitpoeder.', 'Giet in een kom.', 'Top af met hennepzaad.'],
                    macros: { p: 25, c: 35, f: 10, kcal: 330 }
                },
                {
                    title: 'Omelet met paddenstoelen en tomaat',
                    emoji: '🍳',
                    explanation: 'Stevig en voedzaam, zodat je er weer even tegenaan kunt.',
                    ingredients: ['3 eieren', 'Handje champignons', '1 tomaat', '1 volkoren boterham'],
                    instructions: ['Bak de groenten aan.', 'Kluts de eieren en giet erover.', 'Bak tot omelet gaar is.', 'Eet met de boterham erbij.'],
                    macros: { p: 24, c: 20, f: 18, kcal: 338 }
                }
            ],
            lunch: [
                {
                    title: 'Maaltijdsalade met tonijn en ei',
                    emoji: '🥗',
                    explanation: 'Een krachtige lunch die je spieren blij maakt na inspanning.',
                    ingredients: ['Blikje tonijn (op water)', '1 gekookt ei', 'Gemengde sla', 'Olijven', 'Aardappel (gekookt)'],
                    instructions: ['Meng sla met tonijn en partjes ei.', 'Voeg gekookte aardappelblokjes toe voor energie.', 'Breng op smaak met peper en olijfolie.'],
                    macros: { p: 35, c: 25, f: 15, kcal: 375 }
                },
                {
                    title: 'Pasta salade met mozzarella',
                    emoji: '🍝',
                    explanation: 'Fijne energiebron die je helpt om je volle agenda bij te benen.',
                    ingredients: ['75g pasta (ongekookt)', 'Halve bol mozzarella', 'Cherrytomaten', 'Basilicum', 'Pijnboompitten'],
                    instructions: ['Kook de pasta en laat afkoelen.', 'Meng met tomaat, mozzarella en basilicum.', 'Top met pijnboompitten.'],
                    macros: { p: 18, c: 55, f: 20, kcal: 472 }
                }
            ],
            diner: [
                {
                    title: 'Biefstuk met groentefriet',
                    emoji: '🥩',
                    explanation: 'Een echte krachtmaaltijd om je lichaam te ondersteunen tijdens je piek.',
                    ingredients: ['1 biefstuk (150g)', 'Zoete aardappel of pastinaak', 'Groene salade'],
                    instructions: ['Snijd groenten in frietvorm en bak 25 min in oven.', 'Bak biefstuk 2-3 min per kant.', 'Laat vlees even rusten voor aansnijden.'],
                    macros: { p: 35, c: 30, f: 15, kcal: 395 }
                },
                {
                    title: 'Rijke quinoa bowl met kikkererwten',
                    emoji: '🥘',
                    explanation: 'Volledige plant-power voor langdurige energie.',
                    ingredients: ['75g quinoa', '100g kikkererwten', 'Geroosterde pompoen', 'Tahini dressing'],
                    instructions: ['Rooster de pompoen in de oven.', 'Kook quinoa.', 'Meng alles in een kom en besprenkel met tahini.'],
                    macros: { p: 15, c: 55, f: 18, kcal: 442 }
                }
            ],
            snack: [
                {
                    title: 'Gekookt ei',
                    emoji: '🥚',
                    explanation: 'De ultieme snelle snack voor spierherstel.',
                    ingredients: ['1 ei', 'Snufje zout'],
                    instructions: ['Kook het ei in 8 minuten hard.', 'Pel en eet.'],
                    macros: { p: 7, c: 0, f: 5, kcal: 73 }
                },
                {
                    title: 'Edamame boontjes',
                    emoji: '🫛',
                    explanation: 'Leuk om te pellen en vol goede eiwitten.',
                    ingredients: ['100g edamame (in peul)'],
                    instructions: ['Stoom kort of ontdooi.', 'Bestrooi met zeezout.'],
                    macros: { p: 11, c: 10, f: 5, kcal: 129 }
                }
            ]
        }
    },
    [PHASES.LUTEAL]: {
        description: 'Je lichaam bereidt zich voor. Focus op stabiliteit en verzadiging om je goed te blijven voelen.',
        focusPoints: [
            'Stabiele bloedsuiker',
            'Vezelrijke voeding',
            'Gezonde vetten',
            'Verzadiging'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Havermout met notenpasta en banaan',
                    emoji: '🥣',
                    explanation: 'Houdt je bloedsuiker stabiel en geeft een lang, fijn verzadigd gevoel.',
                    ingredients: ['50g havermout', '1 el pindakaas', 'Halve banaan', 'Kaneel'],
                    instructions: ['Kook havermout met water of melk.', 'Roer kaneel erdoor.', 'Top met banaan en pindakaas.'],
                    macros: { p: 12, c: 45, f: 15, kcal: 363 }
                },
                {
                    title: 'Volkoren toast met pindakaas',
                    emoji: '🍞',
                    explanation: 'Simpel comfort food dat helpt tegen die middagdip.',
                    ingredients: ['2 sneetjes volkoren brood', 'Dik laagje 100% pindakaas', 'Plakjes komkommer erbij'],
                    instructions: ['Rooster brood.', 'Besmeer met pindakaas.', 'Eet komkommer erbij voor frisheid en vocht.'],
                    macros: { p: 14, c: 30, f: 20, kcal: 356 }
                }
            ],
            lunch: [
                {
                    title: 'Buddha bowl met tempeh',
                    emoji: '🥗',
                    explanation: 'Rustgevend voor je darmen en rijk aan vezels.',
                    ingredients: ['75g zilvervliesrijst', '100g tempeh (gemarineerd)', 'Gestoomde broccoli', 'Avocado'],
                    instructions: ['Bak de tempeh goudbruin.', 'Kook rijst en broccoli.', 'Serveer in een kom met plakjes avocado.'],
                    macros: { p: 20, c: 45, f: 22, kcal: 458 }
                },
                {
                    title: 'Wrap met zalm en roomkaas',
                    emoji: '🌯',
                    explanation: 'De combinatie van vetten en eiwitten houdt cravings op afstand.',
                    ingredients: ['1 volkoren wrap', '50g gerookte zalm', 'Kruidenroomkaas', 'Ijsbergsla'],
                    instructions: ['Besmeer wrap met roomkaas.', 'Beleg met zalm en sla.', 'Rol stevig op.'],
                    macros: { p: 20, c: 30, f: 18, kcal: 362 }
                }
            ],
            diner: [
                {
                    title: 'Volkoren pasta bolognese',
                    emoji: '🍝',
                    explanation: 'Een warm bord comfort, met extra vezels om je goed te voelen.',
                    ingredients: ['75g volkoren pasta', '100g mager rundergehakt', 'Tomatensaus met groenten', 'Parmezaan'],
                    instructions: ['Rul het gehakt.', 'Voeg saus toe en verwarm.', 'Kook pasta gaar.', 'Meng en serveer met kaas.'],
                    macros: { p: 30, c: 50, f: 15, kcal: 455 }
                },
                {
                    title: 'Gele curry met rijst',
                    emoji: '🍛',
                    explanation: 'Kruidig en verwarmend; precies waar je in deze fase behoefte aan hebt.',
                    ingredients: ['75g rijst', 'Kip of Tofu', 'Kokosmelk (light)', 'Currypasta', 'Bloemkool'],
                    instructions: ['Bak eiwitbron met currypasta.', 'Voeg groenten en kokosmelk toe.', 'Stoof gaar in 10-15 min.', 'Serveer met rijst.'],
                    macros: { p: 25, c: 45, f: 18, kcal: 442 }
                }
            ],
            snack: [
                {
                    title: 'Volle kwark met zaden',
                    emoji: '🥛',
                    explanation: 'Een rustige avondsnack om de trek te stillen voor het slapen.',
                    ingredients: ['200g kwark', '1 el pompoenpitten', 'Druppeltje honing'],
                    instructions: ['Meng alles in een schaaltje.'],
                    macros: { p: 22, c: 8, f: 5, kcal: 165 }
                },
                {
                    title: 'Blokje kaas en druiven',
                    emoji: '🧀',
                    explanation: 'Een fijne balans tussen hartig en zoet.',
                    ingredients: ['3 blokjes jonge kaas', 'Handje druiven'],
                    instructions: ['Samen eten.'],
                    macros: { p: 8, c: 10, f: 10, kcal: 162 }
                }
            ]
        }
    }
}
