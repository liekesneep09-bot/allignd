import { PHASES } from '../logic/cycle'
import { HYPED_RECIPES_NL, HYPED_RECIPES_EN } from './hypedRecipes'

export const RECIPES_NL = {
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
                    macros: { p: 12, c: 45, f: 14, kcal: 354, fiber: 7.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Roerei met spinazie op volkoren toast',
                    emoji: '🍳',
                    explanation: 'Een zachte, voedzame start met wat extra plantaardig ijzer uit de spinazie.',
                    ingredients: ['2 eieren', 'Handvol verse spinazie', '2 sneetjes volkoren brood', 'Snufje kurkuma', 'Olijfolie'],
                    instructions: ['Verhit olie in de pan en slink de spinazie kort.', 'Kluts eieren met kurkuma en voeg toe.', 'Roerbak tot het ei gestold is.', 'Serveer op geroosterd brood.'],
                    macros: { p: 22, c: 30, f: 18, kcal: 370, fiber: 4.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Rijke linzensoep',
                    emoji: '🍲',
                    explanation: 'Een kom vol warmte en vezels, precies wat je nu kunt gebruiken.',
                    ingredients: ['150g linzen (uit blik)', '1 wortel', '1 stengel bleekselderij', '500ml groentebouillon', 'Komijnpoeder'],
                    instructions: ['Snijd groenten fijn en fruit aan in olie.', 'Voeg linzen, bouillon en komijn toe.', 'Laat 10 min zachtjes pruttelen.', 'Pureer grof of eet als heldere soep.'],
                    macros: { p: 18, c: 40, f: 8, kcal: 304, fiber: 12.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Warme quinoa met geroosterde biet en walnoten',
                    emoji: '🍲',
                    explanation: 'Aardse, verwarmende smaken die je voeden zonder zwaar op de maag te liggen. Biet levert folaat en walnoten leveren omega-3.',
                    ingredients: ['75g quinoa (ongekookt)', '2 bieten', 'Handje walnoten', 'Beetje feta', '1 el olijfolie', 'Snufje komijn'],
                    instructions: ['Rooster de bieten in blokjes 25 min in de oven op 200C.', 'Kook ondertussen de quinoa.', 'Meng warm met walnoten en komijn.', 'Brokkel de feta eroverheen en serveer direct.'],
                    macros: { p: 15, c: 45, f: 20, kcal: 420, fiber: 6.2 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Langzaam gegaarde runderstoof',
                    emoji: '🍖',
                    explanation: 'Rijk en troostend; perfect om je energie rustig weer op te bouwen.',
                    ingredients: ['150g runderlappen', '1 ui', '1 winterpeen', 'Tomatenpuree', 'Runderbouillon'],
                    instructions: ['Braad het vlees aan met ui.', 'Voeg groenten en bouillon toe.', 'Laat minstens 2 uur sudderen (of gebruik snelkookpan).', 'Serveer met aardappelpuree (optioneel).'],
                    macros: { p: 35, c: 15, f: 20, kcal: 380, fiber: 4.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Gebakken vis (bijv. kabeljauw) met zoete aardappel',
                    emoji: '🐟',
                    explanation: 'Lichte vetten en vitaminen die je lichaam liefdevol ondersteunen. Goedkoop en voedzaam.',
                    ingredients: ['1 witvis- of zalmfilet', '1 zoete aardappel', 'Gestoomde broccoli', 'Citroen', 'Olijfolie'],
                    instructions: ['Snijd aardappel in partjes en rooster 25 min in oven (200C).', 'Bak de vis 3-4 min per kant in de pan.', 'Stoom de broccoli kort.', 'Serveer samen met citroen.'],
                    macros: { p: 30, c: 40, f: 18, kcal: 442, fiber: 8.5 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                }
            ],
            snack: [
                {
                    title: 'Pure chocolade (70%+)',
                    emoji: '🍫',
                    explanation: 'Een momentje voor jezelf met een klein beetje magnesium-support.',
                    ingredients: ['2-3 blokjes pure chocolade', 'Kop gemberthee'],
                    instructions: ['Neem de tijd om er rustig van te genieten.'],
                    macros: { p: 2, c: 8, f: 10, kcal: 130, fiber: 2.1 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Een handje walnoten',
                    emoji: '🥜',
                    explanation: 'Eenvoudig en voedzaam, voor als je even snel iets nodig hebt.',
                    ingredients: ['30g walnoten (ongezouten)'],
                    instructions: ['Direct uit het vuistje.'],
                    macros: { p: 5, c: 4, f: 20, kcal: 216, fiber: 2.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
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
                    macros: { p: 20, c: 35, f: 8, kcal: 292, fiber: 4.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Avocado toast met gepocheerd ei',
                    emoji: '🥑',
                    explanation: 'Heerlijk in balans, zodat je je lang verzadigd en scherp voelt.',
                    ingredients: ['2 snee volkoren brood', 'Halve avocado', '2 eieren', 'Chilivlokken', 'Citroensap'],
                    instructions: ['Rooster het brood en prak de avocado erop.', 'Pocheer of kook de eieren zacht (6 min).', 'Leg eieren op de toast.', 'Kruid met peper, zout en chili.'],
                    macros: { p: 18, c: 30, f: 22, kcal: 390, fiber: 9.5 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                }
            ],
            lunch: [
                {
                    title: 'Volkoren wrap met kip en hummus',
                    emoji: '🌯',
                    explanation: 'Lekker licht en makkelijk mee te nemen voor je drukke dag.',
                    ingredients: ['1 volkoren wrap', '75g kipfilet (waren)', '2 el hummus', 'Rucola', 'Geraspte wortel'],
                    instructions: ['Besmeer wrap met hummus.', 'Beleg met kip en groenten.', 'Oprollen en doorsnijden.'],
                    macros: { p: 25, c: 35, f: 12, kcal: 348, fiber: 6.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Frisse couscous salade met feta',
                    emoji: '🥙',
                    explanation: 'Kleurrijk en vullend, geeft je precies de energie die je nu voelt.',
                    ingredients: ['75g couscous (droog)', 'Komkommer', 'Tomaat', '50g feta', 'Verse munt'],
                    instructions: ['Wel de couscous in heet water (5 min).', 'Snijd groenten en feta in blokjes.', 'Meng alles door elkaar met de munt.', 'Breng op smaak met citroensap.'],
                    macros: { p: 12, c: 55, f: 14, kcal: 394, fiber: 7.5 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Wokgerecht met kip en groenten',
                    emoji: '🍜',
                    explanation: 'Snel klaar en vol vitaminen, past perfect bij je stijgende energie.',
                    ingredients: ['150g kipfilet', 'Wokgroenten (paprika, courgette)', 'Sojasaus', 'Gember', 'Zilvervliesrijst'],
                    instructions: ['Kook de rijst.', 'Wok de kip goudbruin in olie.', 'Voeg groenten, gember en soja toe.', 'Roerbak kort op hoog vuur.'],
                    macros: { p: 35, c: 45, f: 10, kcal: 410, fiber: 6.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Witvis met rijst en broccoli',
                    emoji: '🐠',
                    explanation: 'Licht verteerbaar en puur, om je lichaam te voeden in de opbouwfase.',
                    ingredients: ['150g kabeljauw', '75g rijst', '200g broccoli', 'Dille', 'Citroen'],
                    instructions: ['Kook rijst en broccoli.', 'Bak de vis in 5-6 min gaar in de pan.', 'Serveer met verse dille en citroen.'],
                    macros: { p: 30, c: 50, f: 5, kcal: 365, fiber: 5.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ],
            snack: [
                {
                    title: 'Appel met amandelpasta',
                    emoji: '🍎',
                    explanation: 'Een knapperige, frisse snack voor tussendoor.',
                    ingredients: ['1 appel', '1 el amandelpasta'],
                    instructions: ['Snijd appel in partjes.', 'Dip in de pasta.'],
                    macros: { p: 4, c: 20, f: 8, kcal: 168, fiber: 4.4 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Rijstwafel met kalkoenfilet',
                    emoji: '🍘',
                    explanation: 'Licht en eiwitrijk, ideaal voor na het sporten of onderweg.',
                    ingredients: ['2 rijstwafels', '2 plakjes kalkoenfilet', 'Komkommer'],
                    instructions: ['Beleg de wafels.'],
                    macros: { p: 8, c: 14, f: 2, kcal: 106, fiber: 1.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
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
                    macros: { p: 25, c: 35, f: 10, kcal: 330, fiber: 5.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Omelet met paddenstoelen en tomaat',
                    emoji: '🍳',
                    explanation: 'Stevig en voedzaam, zodat je er weer even tegenaan kunt.',
                    ingredients: ['3 eieren', 'Handje champignons', '1 tomaat', '1 volkoren boterham'],
                    instructions: ['Bak de groenten aan.', 'Kluts de eieren en giet erover.', 'Bak tot omelet gaar is.', 'Eet met de boterham erbij.'],
                    macros: { p: 24, c: 20, f: 18, kcal: 338, fiber: 3.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Maaltijdsalade met tonijn en ei',
                    emoji: '🥗',
                    explanation: 'Een krachtige lunch die je spieren blij maakt na inspanning.',
                    ingredients: ['Blikje tonijn (op water)', '1 gekookt ei', 'Gemengde sla', 'Olijven', 'Aardappel (gekookt)'],
                    instructions: ['Meng sla met tonijn en partjes ei.', 'Voeg gekookte aardappelblokjes toe voor energie.', 'Breng op smaak met peper en olijfolie.'],
                    macros: { p: 35, c: 25, f: 15, kcal: 375, fiber: 6.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Pasta salade met mozzarella',
                    emoji: '🍝',
                    explanation: 'Fijne energiebron die je helpt om je volle agenda bij te benen.',
                    ingredients: ['75g pasta (ongekookt)', 'Halve bol mozzarella', 'Cherrytomaten', 'Basilicum', 'Pijnboompitten'],
                    instructions: ['Kook de pasta en laat afkoelen.', 'Meng met tomaat, mozzarella en basilicum.', 'Top met pijnboompitten.'],
                    macros: { p: 18, c: 55, f: 20, kcal: 472, fiber: 5.8 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Gegrilde kip of biefstuk met groentefriet',
                    emoji: '🥩',
                    explanation: 'Een echte krachtmaaltijd om je lichaam te ondersteunen. Werkt ook perfect met kip.',
                    ingredients: ['150g kipfilet of biefstuk', 'Zoete aardappel of wortel', 'Groene salade'],
                    instructions: ['Snijd groenten in frietvorm en bak 25 min in oven.', 'Bak het vlees 2-4 min per kant naar wens.', 'Laat vlees even rusten voor aansnijden.'],
                    macros: { p: 35, c: 30, f: 15, kcal: 395, fiber: 8.4 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Rijke quinoa bowl met kikkererwten',
                    emoji: '🥘',
                    explanation: 'Volledige plant-power voor langdurige energie.',
                    ingredients: ['75g quinoa', '100g kikkererwten', 'Geroosterde pompoen', 'Tahini dressing'],
                    instructions: ['Rooster de pompoen in de oven.', 'Kook quinoa.', 'Meng alles in een kom en besprenkel met tahini.'],
                    macros: { p: 15, c: 55, f: 18, kcal: 442, fiber: 11.2 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            snack: [
                {
                    title: 'Gekookt ei',
                    emoji: '🥚',
                    explanation: 'De ultieme snelle snack voor spierherstel.',
                    ingredients: ['1 ei', 'Snufje zout'],
                    instructions: ['Kook het ei in 8 minuten hard.', 'Pel en eet.'],
                    macros: { p: 7, c: 0, f: 5, kcal: 73, fiber: 0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Edamame boontjes',
                    emoji: '🫛',
                    explanation: 'Leuk om te pellen en vol goede eiwitten.',
                    ingredients: ['100g edamame (in peul)'],
                    instructions: ['Stoom kort of ontdooi.', 'Bestrooi met zeezout.'],
                    macros: { p: 11, c: 10, f: 5, kcal: 129, fiber: 5.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
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
                    macros: { p: 12, c: 45, f: 15, kcal: 363, fiber: 8.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Volkoren toast met pindakaas',
                    emoji: '🍞',
                    explanation: 'Simpel comfort food dat helpt tegen die middagdip.',
                    ingredients: ['2 sneetjes volkoren brood', 'Dik laagje 100% pindakaas', 'Plakjes komkommer erbij'],
                    instructions: ['Rooster brood.', 'Besmeer met pindakaas.', 'Eet komkommer erbij voor frisheid en vocht.'],
                    macros: { p: 14, c: 30, f: 20, kcal: 356, fiber: 5.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Buddha bowl met tempeh',
                    emoji: '🥗',
                    explanation: 'Rustgevend voor je darmen en rijk aan vezels.',
                    ingredients: ['75g zilvervliesrijst', '100g tempeh (gemarineerd)', 'Gestoomde broccoli', 'Avocado'],
                    instructions: ['Bak de tempeh goudbruin.', 'Kook rijst en broccoli.', 'Serveer in een kom met plakjes avocado.'],
                    macros: { p: 20, c: 45, f: 22, kcal: 458, fiber: 14.2 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                },
                {
                    title: 'Wrap met zalm en roomkaas',
                    emoji: '🌯',
                    explanation: 'De combinatie van vetten en eiwitten houdt cravings op afstand.',
                    ingredients: ['1 volkoren wrap', '50g gerookte zalm', 'Kruidenroomkaas', 'Ijsbergsla'],
                    instructions: ['Besmeer wrap met roomkaas.', 'Beleg met zalm en sla.', 'Rol stevig op.'],
                    macros: { p: 20, c: 30, f: 18, kcal: 362, fiber: 4.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ],
            diner: [
                {
                    title: 'Volkoren pasta bolognese',
                    emoji: '🍝',
                    explanation: 'Een warm bord comfort, met extra vezels om je goed te voelen.',
                    ingredients: ['75g volkoren pasta', '100g mager rundergehakt', 'Tomatensaus met groenten', 'Parmezaan'],
                    instructions: ['Rul het gehakt.', 'Voeg saus toe en verwarm.', 'Kook pasta gaar.', 'Meng en serveer met kaas.'],
                    macros: { p: 30, c: 50, f: 15, kcal: 455, fiber: 9.8 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                },
                {
                    title: 'Gele curry met rijst',
                    emoji: '🍛',
                    explanation: 'Kruidig en verwarmend; precies waar je in deze fase behoefte aan hebt.',
                    ingredients: ['75g rijst', 'Kip of Tofu', 'Kokosmelk (light)', 'Currypasta', 'Bloemkool'],
                    instructions: ['Bak eiwitbron met currypasta.', 'Voeg groenten en kokosmelk toe.', 'Stoof gaar in 10-15 min.', 'Serveer met rijst.'],
                    macros: { p: 25, c: 45, f: 18, kcal: 442, fiber: 6.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            snack: [
                {
                    title: 'Volle kwark met zaden',
                    emoji: '🥛',
                    explanation: 'Een rustige avondsnack om de trek te stillen voor het slapen.',
                    ingredients: ['200g kwark', '1 el pompoenpitten', 'Druppeltje honing'],
                    instructions: ['Meng alles in een schaaltje.'],
                    macros: { p: 22, c: 8, f: 5, kcal: 165, fiber: 2.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Blokje kaas en druiven',
                    emoji: '🧀',
                    explanation: 'Een fijne balans tussen hartig en zoet.',
                    ingredients: ['3 blokjes jonge kaas', 'Handje druiven'],
                    instructions: ['Samen eten.'],
                    macros: { p: 8, c: 10, f: 10, kcal: 162, fiber: 1.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ]
        }
    }
}

export const RECIPES_EN = {
    [PHASES.MENSTRUAL]: {
        description: 'Your body asks for rest, warmth and recovery. Be gentle with yourself with these nourishing recipes.',
        focusPoints: [
            'Warm, easily digestible meals',
            'Iron-rich nutrition',
            'Magnesium-rich ingredients',
            'Sufficient proteins for recovery'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Warm oatmeal with cocoa and red fruit',
                    emoji: '🥣',
                    explanation: 'The cocoa gives a hint of magnesium and the warmth feels like a hug for your stomach.',
                    ingredients: ['50g oatmeal', '200ml almond milk', '1 tbsp raw cocoa', 'Handful frozen red fruit', '1 tbsp flaxseed'],
                    instructions: ['Heat the milk in a saucepan.', 'Add oatmeal and cocoa, cook gently for 5 min.', 'Stir in the flaxseed.', 'Serve with the red fruit on top.'],
                    macros: { p: 12, c: 45, f: 14, kcal: 354, fiber: 7.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Scrambled eggs with spinach on whole wheat toast',
                    emoji: '🍳',
                    explanation: 'A soft, nutritious start with some extra plant-based iron from the spinach.',
                    ingredients: ['2 eggs', 'Handful fresh spinach', '2 slices whole wheat bread', 'Pinch of turmeric', 'Olive oil'],
                    instructions: ['Heat oil in the pan and wilt the spinach briefly.', 'Whisk eggs with turmeric and add.', 'Stir-fry until egg is set.', 'Serve on toasted bread.'],
                    macros: { p: 22, c: 30, f: 18, kcal: 370, fiber: 4.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Rich lentil soup',
                    emoji: '🍲',
                    explanation: 'A bowl full of warmth and fiber, exactly what you can use now.',
                    ingredients: ['150g lentils (canned)', '1 carrot', '1 stalk celery', '500ml vegetable broth', 'Cumin powder'],
                    instructions: ['Chop vegetables finely and fry in oil.', 'Add lentils, broth and cumin.', 'Let simmer gently for 10 min.', 'Puree roughly or eat as clear soup.'],
                    macros: { p: 18, c: 40, f: 8, kcal: 304, fiber: 12.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Warm quinoa with roasted beet and walnuts',
                    emoji: '🍲',
                    explanation: 'Earthy, warming flavors that nourish you without being heavy on the stomach. Beet provides folate and walnuts provide omega-3.',
                    ingredients: ['75g quinoa (uncooked)', '2 beets', 'Handful walnuts', 'Bit of feta', '1 tbsp olive oil', 'Pinch of cumin'],
                    instructions: ['Roast the beets in cubes for 25 min in the oven at 200C.', 'Cook the quinoa in the meantime.', 'Mix warm with walnuts and cumin.', 'Crumble the feta over it and serve immediately.'],
                    macros: { p: 15, c: 45, f: 20, kcal: 420, fiber: 6.2 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Slow-cooked beef stew',
                    emoji: '🍖',
                    explanation: 'Rich and comforting; perfect to rebuild your energy quietly.',
                    ingredients: ['150g beef chuck', '1 onion', '1 carrot', 'Tomato paste', 'Beef broth'],
                    instructions: ['Brown the meat with onion.', 'Add vegetables and broth.', 'Simmer for at least 2 hours (or use pressure cooker).', 'Serve with mashed potatoes (optional).'],
                    macros: { p: 35, c: 15, f: 20, kcal: 380, fiber: 4.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Fried fish (e.g. cod) with sweet potato',
                    emoji: '🐟',
                    explanation: 'Light fats and vitamins that support your body lovingly. Cheap and nutritious.',
                    ingredients: ['1 white fish or salmon fillet', '1 sweet potato', 'Steamed broccoli', 'Lemon', 'Olive oil'],
                    instructions: ['Cut potato into wedges and roast for 25 min in oven (200C).', 'Fry the fish 3-4 min per side in the pan.', 'Steam the broccoli briefly.', 'Serve with lemon.'],
                    macros: { p: 30, c: 40, f: 18, kcal: 442, fiber: 8.5 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                }
            ],
            snack: [
                {
                    title: 'Dark chocolate (70%+)',
                    emoji: '🍫',
                    explanation: 'A moment for yourself with a little magnesium support.',
                    ingredients: ['2-3 cubes dark chocolate', 'Cup of ginger tea'],
                    instructions: ['Take the time to enjoy it quietly.'],
                    macros: { p: 2, c: 8, f: 10, kcal: 130, fiber: 2.1 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'A handful of walnuts',
                    emoji: '🥜',
                    explanation: 'Simple and nutritious, for when you need something quickly.',
                    ingredients: ['30g walnuts (unsalted)'],
                    instructions: ['Directly from the hand.'],
                    macros: { p: 5, c: 4, f: 20, kcal: 216, fiber: 2.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ]
        }
    },
    [PHASES.FOLLICULAR]: {
        description: 'Energy returns. Your body is ready for building. Choose fresh, light food.',
        focusPoints: [
            'Fresh, light energy',
            'Proteins for building',
            'Varied vegetables',
            'Slow carbohydrates'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Greek yogurt with granola and fruit',
                    emoji: '🫐',
                    explanation: 'A fresh, energetic start to begin your day actively.',
                    ingredients: ['200g Greek yogurt', '30g granola (low sugar)', 'Half banana', 'Blueberries'],
                    instructions: ['Put yogurt in a bowl.', 'Slice banana.', 'Add fruit and granola.', 'Optionally top with bit of honey.'],
                    macros: { p: 20, c: 35, f: 8, kcal: 292, fiber: 4.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Avocado toast with poached egg',
                    emoji: '🥑',
                    explanation: 'Deliciously balanced, so you feel satiated and sharp for a long time.',
                    ingredients: ['2 slices whole wheat bread', 'Half avocado', '2 eggs', 'Chili flakes', 'Lemon juice'],
                    instructions: ['Toast the bread and mash the avocado on it.', 'Poach or boil the eggs soft (6 min).', 'Place eggs on the toast.', 'Season with pepper, salt and chili.'],
                    macros: { p: 18, c: 30, f: 22, kcal: 390, fiber: 9.5 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                }
            ],
            lunch: [
                {
                    title: 'Whole wheat wrap with chicken and hummus',
                    emoji: '🌯',
                    explanation: 'Nice light and easy to take with you for your busy day.',
                    ingredients: ['1 whole wheat wrap', '75g chicken breast (cooked)', '2 tbsp hummus', 'Arugula', 'Grated carrot'],
                    instructions: ['Spread wrap with hummus.', 'Top with chicken and vegetables.', 'Roll up and cut in half.'],
                    macros: { p: 25, c: 35, f: 12, kcal: 348, fiber: 6.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Fresh couscous salad with feta',
                    emoji: '🥙',
                    explanation: 'Colorful and filling, gives you exactly the energy you feel now.',
                    ingredients: ['75g couscous (dry)', 'Cucumber', 'Tomato', '50g feta', 'Fresh mint'],
                    instructions: ['Wilt the couscous in hot water (5 min).', 'Cut vegetables and feta into cubes.', 'Mix everything together with the mint.', 'Season with lemon juice.'],
                    macros: { p: 12, c: 55, f: 14, kcal: 394, fiber: 7.5 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Stir-fry with chicken and vegetables',
                    emoji: '🍜',
                    explanation: 'Ready quickly and full of vitamins, fits perfectly with your rising energy.',
                    ingredients: ['150g chicken breast', 'Stir-fry vegetables (bell pepper, zucchini)', 'Soy sauce', 'Ginger', 'Brown rice'],
                    instructions: ['Cook the rice.', 'Stir-fry the chicken golden brown in oil.', 'Add vegetables, ginger and soy.', 'Stir-fry briefly on high heat.'],
                    macros: { p: 35, c: 45, f: 10, kcal: 410, fiber: 6.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'White fish with rice and broccoli',
                    emoji: '🐠',
                    explanation: 'Easily digestible and pure, to nourish your body in the build-up phase.',
                    ingredients: ['150g cod', '75g rice', '200g broccoli', 'Dill', 'Lemon'],
                    instructions: ['Cook rice and broccoli.', 'Fry the fish until done in 5-6 min in the pan.', 'Serve with fresh dill and lemon.'],
                    macros: { p: 30, c: 50, f: 5, kcal: 365, fiber: 5.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ],
            snack: [
                {
                    title: 'Apple with almond butter',
                    emoji: '🍎',
                    explanation: 'A crunchy, fresh snack for in between.',
                    ingredients: ['1 apple', '1 tbsp almond butter'],
                    instructions: ['Slice apple into wedges.', 'Dip in the butter.'],
                    macros: { p: 4, c: 20, f: 8, kcal: 168, fiber: 4.4 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Rice cake with turkey breast',
                    emoji: '🍘',
                    explanation: 'Light and protein-rich, ideal for after exercising or on the go.',
                    ingredients: ['2 rice cakes', '2 slices turkey breast', 'Cucumber'],
                    instructions: ['Top the cakes.'],
                    macros: { p: 8, c: 14, f: 2, kcal: 106, fiber: 1.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ]
        }
    },
    [PHASES.OVULATORY]: {
        description: 'Your performance peaks. Support your high energy consumption with full-fledged nutrition.',
        focusPoints: [
            'Fuel for high energy',
            'Carbohydrates',
            'Proteins for muscle recovery',
            'Sufficient hydration'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Green smoothie bowl with hemp seeds',
                    emoji: '🥬',
                    explanation: 'A power breakfast that immediately prepares you for an active day.',
                    ingredients: ['1 banana', 'Handful spinach', '200ml almond milk', '1 scoop protein powder', '1 tbsp hemp seeds'],
                    instructions: ['Blend banana, spinach, milk and protein powder.', 'Pour into a bowl.', 'Top with hemp seeds.'],
                    macros: { p: 25, c: 35, f: 10, kcal: 330, fiber: 5.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Omelet with mushrooms and tomato',
                    emoji: '🍳',
                    explanation: 'Solid and nutritious, so you can go at it again.',
                    ingredients: ['3 eggs', 'Handful mushrooms', '1 tomato', '1 slice whole wheat bread'],
                    instructions: ['Fry the vegetables.', 'Whisk the eggs and pour over.', 'Fry until omelet is done.', 'Eat with the bread on the side.'],
                    macros: { p: 24, c: 20, f: 18, kcal: 338, fiber: 3.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Meal salad with tuna and egg',
                    emoji: '🥗',
                    explanation: 'A powerful lunch that makes your muscles happy after exercise.',
                    ingredients: ['Can of tuna (in water)', '1 boiled egg', 'Mixed lettuce', 'Olives', 'Potato (boiled)'],
                    instructions: ['Mix lettuce with tuna and egg wedges.', 'Add boiled potato cubes for energy.', 'Season with pepper and olive oil.'],
                    macros: { p: 35, c: 25, f: 15, kcal: 375, fiber: 6.0 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Pasta salad with mozzarella',
                    emoji: '🍝',
                    explanation: 'Nice energy source that helps you keep up with your full schedule.',
                    ingredients: ['75g pasta (uncooked)', 'Half ball mozzarella', 'Cherry tomatoes', 'Basil', 'Pine nuts'],
                    instructions: ['Cook the pasta and let cool.', 'Mix with tomato, mozzarella and basil.', 'Top with pine nuts.'],
                    macros: { p: 18, c: 55, f: 20, kcal: 472, fiber: 5.8 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            diner: [
                {
                    title: 'Grilled chicken or steak with vegetable fries',
                    emoji: '🥩',
                    explanation: 'A real power meal to support your body. Works perfectly with chicken too.',
                    ingredients: ['150g chicken breast or steak', 'Sweet potato or carrot', 'Green salad'],
                    instructions: ['Cut vegetables into fry shapes and bake for 25 min in oven.', 'Fry the meat 2-4 min per side as desired.', 'Let meat rest before slicing.'],
                    macros: { p: 35, c: 30, f: 15, kcal: 395, fiber: 8.4 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Rich quinoa bowl with chickpeas',
                    emoji: '🥘',
                    explanation: 'Full plant power for long-lasting energy.',
                    ingredients: ['75g quinoa', '100g chickpeas', 'Roasted pumpkin', 'Tahini dressing'],
                    instructions: ['Roast the pumpkin in the oven.', 'Cook quinoa.', 'Mix everything in a bowl and drizzle with tahini.'],
                    macros: { p: 15, c: 55, f: 18, kcal: 442, fiber: 11.2 },
                    suitability: ['maintain', 'gain_muscle']
                }
            ],
            snack: [
                {
                    title: 'Boiled egg',
                    emoji: '🥚',
                    explanation: 'The ultimate quick snack for muscle recovery.',
                    ingredients: ['1 egg', 'Pinch of salt'],
                    instructions: ['Boil the egg hard in 8 minutes.', 'Peel and eat.'],
                    macros: { p: 7, c: 0, f: 5, kcal: 73, fiber: 0 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Edamame beans',
                    emoji: '🫛',
                    explanation: 'Fun to peel and full of good proteins.',
                    ingredients: ['100g edamame (in pod)'],
                    instructions: ['Steam briefly or thaw.', 'Sprinkle with sea salt.'],
                    macros: { p: 11, c: 10, f: 5, kcal: 129, fiber: 5.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ]
        }
    },
    [PHASES.LUTEAL]: {
        description: 'Your body prepares itself. Focus on stability and satiety to keep feeling good.',
        focusPoints: [
            'Stable blood sugar',
            'Fiber-rich nutrition',
            'Healthy fats',
            'Satiety'
        ],
        meals: {
            ontbijt: [
                {
                    title: 'Oatmeal with nut butter and banana',
                    emoji: '🥣',
                    explanation: 'Keeps your blood sugar stable and gives a long, fine saturated feeling.',
                    ingredients: ['50g oatmeal', '1 tbsp peanut butter', 'Half banana', 'Cinnamon'],
                    instructions: ['Cook oatmeal with water or milk.', 'Stir in cinnamon.', 'Top with banana and peanut butter.'],
                    macros: { p: 12, c: 45, f: 15, kcal: 363, fiber: 8.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                },
                {
                    title: 'Whole wheat toast with peanut butter',
                    emoji: '🍞',
                    explanation: 'Simple comfort food that helps against that afternoon dip.',
                    ingredients: ['2 slices whole wheat bread', 'Thick layer of 100% peanut butter', 'Cucumber slices on the side'],
                    instructions: ['Toast bread.', 'Spread with peanut butter.', 'Eat cucumber with it for freshness and hydration.'],
                    macros: { p: 14, c: 30, f: 20, kcal: 356, fiber: 5.8 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            lunch: [
                {
                    title: 'Buddha bowl with tempeh',
                    emoji: '🥗',
                    explanation: 'Soothing for your gut and rich in fiber.',
                    ingredients: ['75g brown rice', '100g tempeh (marinated)', 'Steamed broccoli', 'Avocado'],
                    instructions: ['Fry the tempeh golden brown.', 'Cook rice and broccoli.', 'Serve in a bowl with avocado slices.'],
                    macros: { p: 20, c: 45, f: 22, kcal: 458, fiber: 14.2 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                },
                {
                    title: 'Wrap with salmon and cream cheese',
                    emoji: '🌯',
                    explanation: 'The combination of fats and proteins keeps cravings at bay.',
                    ingredients: ['1 whole wheat wrap', '50g smoked salmon', 'Herb cream cheese', 'Iceberg lettuce'],
                    instructions: ['Spread wrap with cream cheese.', 'Top with salmon and lettuce.', 'Roll up tightly.'],
                    macros: { p: 20, c: 30, f: 18, kcal: 362, fiber: 4.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ],
            diner: [
                {
                    title: 'Whole wheat pasta bolognese',
                    emoji: '🍝',
                    explanation: 'A warm plate of comfort, with extra fibers to make you feel good.',
                    ingredients: ['75g whole wheat pasta', '100g lean ground beef', 'Tomato sauce with vegetables', 'Parmesan'],
                    instructions: ['Brown the ground beef.', 'Add sauce and heat.', 'Cook pasta until done.', 'Mix and serve with cheese.'],
                    macros: { p: 30, c: 50, f: 15, kcal: 455, fiber: 9.8 },
                    suitability: ['maintain', 'gain_muscle', 'recomp']
                },
                {
                    title: 'Yellow curry with rice',
                    emoji: '🍛',
                    explanation: 'Spicy and warming; exactly what you need in this phase.',
                    ingredients: ['75g rice', 'Chicken or Tofu', 'Coconut milk (light)', 'Curry paste', 'Cauliflower'],
                    instructions: ['Fry protein source with curry paste.', 'Add vegetables and coconut milk.', 'Stew until done in 10-15 min.', 'Serve with rice.'],
                    macros: { p: 25, c: 45, f: 18, kcal: 442, fiber: 6.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                }
            ],
            snack: [
                {
                    title: 'Full quark with seeds',
                    emoji: '🥛',
                    explanation: 'A quiet evening snack to satisfy hunger before sleeping.',
                    ingredients: ['200g quark', '1 tbsp pumpkin seeds', 'Drop of honey'],
                    instructions: ['Mix everything in a bowl.'],
                    macros: { p: 22, c: 8, f: 5, kcal: 165, fiber: 2.5 },
                    suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
                },
                {
                    title: 'Cube of cheese and grapes',
                    emoji: '🧀',
                    explanation: 'A fine balance between savory and sweet.',
                    ingredients: ['3 cubes young cheese', 'Handful of grapes'],
                    instructions: ['Eat together.'],
                    macros: { p: 8, c: 10, f: 10, kcal: 162, fiber: 1.2 },
                    suitability: ['lose_fat', 'maintain', 'recomp']
                }
            ]
        }
    }
}

// Voeg de hyped recipes dynamisch toe als 3e optie per maaltijd
for (const phase of Object.values(PHASES)) {
    if (RECIPES_NL[phase] && HYPED_RECIPES_NL[phase]) {
        RECIPES_NL[phase].meals.ontbijt.push(HYPED_RECIPES_NL[phase].ontbijt)
        RECIPES_NL[phase].meals.lunch.push(HYPED_RECIPES_NL[phase].lunch)
        RECIPES_NL[phase].meals.diner.push(HYPED_RECIPES_NL[phase].diner)
        RECIPES_NL[phase].meals.snack.push(HYPED_RECIPES_NL[phase].snack)
    }
    if (RECIPES_EN[phase] && HYPED_RECIPES_EN[phase]) {
        RECIPES_EN[phase].meals.ontbijt.push(HYPED_RECIPES_EN[phase].ontbijt)
        RECIPES_EN[phase].meals.lunch.push(HYPED_RECIPES_EN[phase].lunch)
        RECIPES_EN[phase].meals.diner.push(HYPED_RECIPES_EN[phase].diner)
        RECIPES_EN[phase].meals.snack.push(HYPED_RECIPES_EN[phase].snack)
    }
}

export function getRecipeContent(language) {
    return language === 'en' ? RECIPES_EN : RECIPES_NL
}
