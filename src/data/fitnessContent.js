import { PHASES } from '../logic/cycle'
import { GOAL_TYPES } from '../logic/nutrition'

export const FITNESS_CONTENT_NL = {
    goals: {
        [GOAL_TYPES.LOSE_FAT]: 'Afvallen',
        [GOAL_TYPES.RECOMP]: 'Afvallen + Spier',
        [GOAL_TYPES.MAINTAIN]: 'Gewicht Behouden',
        [GOAL_TYPES.GAIN]: 'Spiermassa Opbouwen'
    },
    bodyParts: [
        { id: 'glutes', label: 'Billen' },
        { id: 'legs', label: 'Benen' },
        { id: 'back', label: 'Rug' },
        { id: 'chest', label: 'Borst' },
        { id: 'shoulders', label: 'Schouders' },
        { id: 'core', label: 'Core' }
    ],
    exercises: {
        glutes: ['Hip Thrust', 'Romanian Deadlift', 'Glute Bridge', 'Cable Kickback', 'Bulgarian Split Squat'],
        legs: ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl'],
        back: ['Lat Pulldown', 'Seated Row', 'Barbell Row', 'Deadlift', 'Face Pull'],
        chest: ['Bench Press', 'Push Up', 'Chest Fly', 'Dumbbell Press'],
        shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly'],
        core: ['Plank', 'Crunches', 'Leg Raises', 'Russian Twist', 'Dead Bug']
    },
    exerciseInstructions: {
        glutes: {
            'Hip Thrust': 'Leun met je bovenrug tegen een bankje. Plaats je voeten heupbreed op de grond. Duw je heupen omhoog tot je lichaam een rechte lijn vormt. Knijp je billen samen bovenaan en laat gecontroleerd zakken.',
            'Romanian Deadlift': 'Sta met voeten heupbreed, houd een lichte buiging in je knieën. Buig voorover vanuit je heupen terwijl je je rug recht houdt. Laat het gewicht langs je benen glijden tot je rek in je hamstrings voelt. Duw je heupen naar voren om terug te komen.',
            'Glute Bridge': 'Ga op je rug liggen met gebogen knieën en voeten plat op de grond. Duw je heupen omhoog door je billen aan te spannen. Houd even vast bovenaan en laat gecontroleerd zakken.',
            'Cable Kickback': 'Sta voor een kabelmachine met een enkelband aan de lage kabel. Leun licht voorover en houd je core aangespannen. Duw je been recht naar achteren door je bil aan te spannen. Breng gecontroleerd terug.',
            'Bulgarian Split Squat': 'Sta met je rug naar een bankje. Plaats één voet op de bank achter je. Zak door je voorste knie tot je bovenbeen parallel is aan de grond. Duw terug omhoog via je voorste hiel.'
        },
        legs: {
            'Squat': 'Sta met voeten schouderbreed, tenen licht naar buiten. Zak door je heupen en knieën alsof je gaat zitten. Houd je borst omhoog en je knieën in lijn met je tenen. Duw terug omhoog via je hielen.',
            'Leg Press': 'Ga zitten in de leg press machine met voeten heupbreed op het platform. Laat de gewichten zakken door je knieën te buigen tot 90 graden. Duw het platform weg zonder je knieën te vergrendelen.',
            'Lunges': 'Sta rechtop en maak een grote stap naar voren. Zak door beide knieën tot je achterste knie bijna de grond raakt. Duw terug omhoog via je voorste hiel en wissel van been.',
            'Leg Extension': 'Ga zitten in de leg extension machine met je knieën onder de as. Strek je benen tot ze bijna recht zijn. Knijp je quadriceps even samen en laat gecontroleerd zakken.',
            'Leg Curl': 'Ga liggen of zitten in de leg curl machine met je enkels onder de rol. Buig je knieën om het gewicht naar je billen te trekken. Knijp je hamstrings samen en laat gecontroleerd zakken.'
        },
        back: {
            'Lat Pulldown': 'Ga zitten aan de lat pulldown machine met een brede greep. Trek de stang naar je borst terwijl je je schouderbladen naar elkaar toe trekt. Laat gecontroleerd omhoog komen.',
            'Seated Row': 'Ga zitten aan de kabelrow met voeten op de steunen. Trek het handvat naar je middel terwijl je je ellebogen langs je lichaam houdt. Knijp je schouderbladen samen en laat gecontroleerd gaan.',
            'Barbell Row': 'Buig voorover met een rechte rug en houd de barbell met gestrekte armen. Trek de stang naar je middel terwijl je je ellebogen langs je lichaam houdt. Laat gecontroleerd zakken.',
            'Deadlift': 'Sta met voeten heupbreed, hurk naar de barbell. Pak de stang vast met rechte armen. Duw door je hielen en strek je heupen en knieën tegelijk tot je rechtop staat. Laat gecontroleerd zakken.',
            'Face Pull': 'Sta voor een kabelmachine met een touw op ooghoogte. Trek het touw naar je gezicht terwijl je je ellebogen hoog houdt en naar buiten draait. Knijp je schouderbladen samen.'
        },
        chest: {
            'Bench Press': 'Ga liggen op een bankje met voeten plat op de grond. Pak de stang iets breder dan schouderbreed. Laat de stang zakken tot je borst en duw terug omhoog.',
            'Push Up': 'Ga in plank positie met handen iets breder dan schouderbreed. Laat je lichaam zakken door je ellebogen te buigen. Duw terug omhoog terwijl je je core aanspant.',
            'Chest Fly': 'Ga liggen op een bankje met dumbbells boven je borst, handpalmen naar elkaar. Open je armen in een boog tot je een rek in je borst voelt. Breng ze terug alsof je een boom omhelst.',
            'Dumbbell Press': 'Ga liggen op een bankje met dumbbells op borsthoogte. Duw de gewichten omhoog tot je armen gestrekt zijn. Laat gecontroleerd zakken tot dumbbells naast je borst.'
        },
        shoulders: {
            'Overhead Press': 'Sta of zit met dumbbells op schouderhoogte, handpalmen naar voren. Duw de gewichten recht omhoog tot je armen gestrekt zijn. Laat gecontroleerd zakken naar schouderhoogte.',
            'Lateral Raise': 'Sta rechtop met dumbbells langs je lichaam. Hef je armen zijwaarts tot schouderhoogte met een lichte buiging in je ellebogen. Laat gecontroleerd zakken.',
            'Front Raise': 'Sta rechtop met dumbbells voor je lichaam. Hef één arm recht naar voren tot schouderhoogte. Laat gecontroleerd zakken en wissel van arm.',
            'Rear Delt Fly': 'Buig licht voorover met dumbbells langs je lichaam. Hef je armen zijwaarts terwijl je je schouderbladen naar elkaar trekt. Laat gecontroleerd zakken.'
        },
        core: {
            'Plank': 'Ga in plank positie op je onderarmen en tenen. Houd je lichaam in een rechte lijn van hoofd tot hielen. Span je core aan en houd deze positie vast.',
            'Crunches': 'Ga op je rug liggen met gebogen knieën en handen achter je hoofd. Rol je schouderbladen van de grond door je core aan te spannen. Laat gecontroleerd zakken.',
            'Leg Raises': 'Ga op je rug liggen met gestrekte benen. Hef je benen omhoog tot ze recht naar boven wijzen. Laat gecontroleerd zakken zonder je onderrug van de grond te tillen.',
            'Russian Twist': 'Ga zitten met gebogen knieën en leun licht achterover. Houd een gewicht voor je borst en draai je romp van links naar rechts. Houd je core aangespannen.',
            'Dead Bug': 'Ga op je rug liggen met armen recht omhoog en knieën in 90 graden. Strek één arm en het tegenovergestelde been uit terwijl je je core aanspant. Wissel van kant.'
        }
    },
    focusBullets: {
        [GOAL_TYPES.LOSE_FAT]: {
            menstrual: [
                'Beweeg zacht om spanning los te laten',
                'Gun jezelf rust zonder schuldgevoel',
                'Luister naar je lichaam vandaag'
            ],
            follicular: [
                'Bouw langzaam op in intensiteit',
                'Geniet van sneller herstel',
                'Kies beweging die energie geeft'
            ],
            ovulatory: [
                'Benut je hogere energieniveau',
                'Verkort rustpauzes als het past',
                'Train iets intensiever als je wilt'
            ],
            luteal: [
                'Houd vast aan je routine',
                'Beweeg tegen opgezet gevoel',
                'Accepteer schommelingen in kracht'
            ]
        },
        [GOAL_TYPES.RECOMP]: {
            menstrual: [
                'Neem rust voor herstel en groei',
                'Houd je soepel met lichte beweging',
                'Sla zware sets vandaag over'
            ],
            follicular: [
                'Verhoog geleidelijk de intensiteit',
                'Benut je betere herstelvermogen',
                'Focus op opbouw en techniek'
            ],
            ovulatory: [
                'Train op je sterkste moment',
                'Pak compounds en zwaardere sets',
                'Daag jezelf uit met goede vorm'
            ],
            luteal: [
                'Onderhoud wat je hebt opgebouwd',
                'Verfijn je techniek deze fase',
                'Eet voldoende voor herstel'
            ]
        },
        [GOAL_TYPES.GAIN]: {
            menstrual: [
                'Neem rust voor spiergroei',
                'Beweeg licht of neem rustdag',
                'Eet voldoende voor herstel'
            ],
            follicular: [
                'Verhoog gewicht en intensiteit',
                'Benut optimaal spierherstel',
                'Focus op compound-oefeningen'
            ],
            ovulatory: [
                'Pak je zwaarste sets nu',
                'Benut je piek in kracht',
                'Train met perfecte techniek'
            ],
            luteal: [
                'Verlaag volume, verhoog kwaliteit',
                'Werk aan techniek en vorm',
                'Luister naar vermoeidheidssignalen'
            ]
        },
        [GOAL_TYPES.MAINTAIN]: {
            menstrual: [
                'Beweeg zacht of neem rust',
                'Laat verplichtingen los vandaag',
                'Volg wat je lichaam vraagt'
            ],
            follicular: [
                'Geniet van terugkerende energie',
                'Probeer variatie in trainingsvormen',
                'Kies beweging die je leuk vindt'
            ],
            ovulatory: [
                'Gebruik energie op jouw manier',
                'Probeer sociale of actieve workouts',
                'Laat plezier voorop staan'
            ],
            luteal: [
                'Houd routine zonder druk',
                'Kies steady-state beweging',
                'Accepteer wisselende energieniveaus'
            ]
        }
    },
    bodyPartFocus: {
        glutes: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Houd billen actief met lichte bridges', 'Rek je hamstrings en heupbuigers', 'Focus op activatie, niet op gewicht'],
                follicular: ['Bouw op met progressive overload', 'Voeg weerstand toe aan je bridges', 'Je herstel versnelt, profiteer ervan'],
                ovulatory: ['Pak je zwaarste hip thrusts nu', 'Je billen reageren optimaal op spanning', 'Train met volledige contractie'],
                luteal: ['Onderhoud met consistente training', 'Luister naar je heupen en onderrug', 'Kwaliteit boven kwantiteit vandaag']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Activeer je billen met lichte sets', 'Focus op mind-muscle connection', 'Neem rust als je lichaam daarom vraagt'],
                follicular: ['Verhoog het gewicht geleidelijk', 'Train hip thrusts en squats zwaar', 'Je spiersynthese is optimaal'],
                ovulatory: ['Ga voor persoonlijke records', 'Je kracht is op zijn piek', 'Train met maximale intensiteit'],
                luteal: ['Behoud je spiermassa met volume', 'Focus op techniek en controle', 'Eet voldoende eiwit voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Beweeg je billen zacht actief', 'Kies wat goed voelt vandaag', 'Rust is ook training'],
                follicular: ['Geniet van je terugkerende kracht', 'Probeer nieuwe bil-oefeningen', 'Bouw op zonder druk'],
                ovulatory: ['Train je billen met plezier', 'Je energie is hoog, gebruik het', 'Maak het zo zwaar als je wilt'],
                luteal: ['Houd je routine vol zonder stress', 'Variatie houdt het leuk', 'Accepteer je energieniveau']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte activatie voor bloedstroom', 'Focus op vorm en gevoel', 'Herstel is groei'],
                follicular: ['Maximale progressie nu', 'Verhoog gewicht elke sessie', 'Je spiersynthese piekt'],
                ovulatory: ['Zwaarste sets van de maand', 'Je kracht is op zijn hoogst', 'Train tot falen met goede vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar vermoeidheid']
            }
        },
        legs: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Lichte squats en lunges houden', 'Rek je benen goed', 'Beweeg zonder druk'],
                follicular: ['Verhoog gewicht bij squats', 'Je benen herstellen snel nu', 'Train met progressieve overload'],
                ovulatory: ['Pak je zwaarste leg day', 'Je kracht is maximaal', 'Train met volledige range of motion'],
                luteal: ['Onderhoud met matig gewicht', 'Luister naar je knieën en heupen', 'Kwaliteit boven zwaarte']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Lichte beentraining voor actieve herstel', 'Focus op techniek', 'Neem extra rust tussen sets'],
                follicular: ['Verhoog intensiteit geleidelijk', 'Squats en deadlifts zwaar trainen', 'Je spieropbouw is optimaal'],
                ovulatory: ['Ga voor zware persoonlijke records', 'Je benen zijn op hun sterkst', 'Train met maximale effort'],
                luteal: ['Behoud spiermassa met volume', 'Focus op gecontroleerde bewegingen', 'Eet voldoende voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Beweeg je benen licht actief', 'Kies oefeningen die goed voelen', 'Rust is oké'],
                follicular: ['Geniet van terugkerende energie', 'Probeer variatie in been-oefeningen', 'Bouw op zonder stress'],
                ovulatory: ['Train je benen met plezier', 'Je energie is hoog', 'Maak het zo uitdagend als je wilt'],
                luteal: ['Houd routine zonder druk', 'Accepteer wisselende kracht', 'Beweeg consistent']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte training voor bloedstroom', 'Focus op vorm en diepte', 'Herstel is essentieel'],
                follicular: ['Maximale progressie in squats', 'Verhoog gewicht systematisch', 'Je spieropbouw piekt'],
                ovulatory: ['Zwaarste leg day van de maand', 'Je kracht is op piek', 'Train tot falen met perfecte vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar je benen']
            }
        },
        back: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Lichte rows voor houding', 'Rek je rug en schouders', 'Beweeg zonder belasting'],
                follicular: ['Verhoog gewicht bij pull-ups en rows', 'Je rug herstelt snel', 'Train met progressive overload'],
                ovulatory: ['Pak je zwaarste deadlifts nu', 'Je rug is op zijn sterkst', 'Train met maximale spanning'],
                luteal: ['Onderhoud met matige gewichten', 'Let op je onderrug', 'Techniek boven gewicht']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Lichte activatie voor je rug', 'Focus op schouderblad retractie', 'Neem rust als nodig'],
                follicular: ['Verhoog intensiteit bij rows', 'Deadlifts en pull-ups zwaar trainen', 'Je spieropbouw is optimaal'],
                ovulatory: ['Ga voor zware PRs op deadlift', 'Je rug is op zijn sterkst', 'Train met maximale intensiteit'],
                luteal: ['Behoud volume met gecontroleerde sets', 'Focus op mind-muscle connection', 'Eet voldoende voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Lichte rug-oefeningen voor houding', 'Kies wat goed voelt', 'Rust is ook waardevol'],
                follicular: ['Geniet van terugkerende kracht', 'Probeer nieuwe back oefeningen', 'Bouw op zonder druk'],
                ovulatory: ['Train je rug met plezier', 'Je energie is hoog', 'Maak het zo zwaar als je wilt'],
                luteal: ['Houd routine zonder stress', 'Variatie houdt het interessant', 'Accepteer je niveau']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte training voor bloedstroom', 'Focus op vorm en retractie', 'Herstel is groei'],
                follicular: ['Maximale progressie in deadlifts', 'Verhoog gewicht systematisch', 'Je rugspieren groeien optimaal'],
                ovulatory: ['Zwaarste back day van de maand', 'Je kracht is op piek', 'Train tot falen met perfecte vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar je rug']
            }
        },
        chest: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Lichte push-ups en presses', 'Rek je borst en schouders', 'Beweeg zonder druk'],
                follicular: ['Verhoog gewicht bij bench press', 'Je borst herstelt snel', 'Train met progressive overload'],
                ovulatory: ['Pak je zwaarste presses nu', 'Je bovenlichaam is sterk', 'Train met maximale spanning'],
                luteal: ['Onderhoud met matige gewichten', 'Let op je schouders', 'Techniek boven gewicht']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Lichte activatie voor borst', 'Focus op mind-muscle connection', 'Neem rust als nodig'],
                follicular: ['Verhoog intensiteit bij presses', 'Bench press zwaar trainen', 'Je spieropbouw is optimaal'],
                ovulatory: ['Ga voor zware PRs op bench', 'Je borst is op zijn sterkst', 'Train met maximale intensiteit'],
                luteal: ['Behoud volume met gecontroleerde sets', 'Focus op stretch en contractie', 'Eet voldoende voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Lichte borst-oefeningen', 'Kies wat goed voelt', 'Rust is oké'],
                follicular: ['Geniet van terugkerende kracht', 'Probeer variatie in presses', 'Bouw op zonder stress'],
                ovulatory: ['Train je borst met plezier', 'Je energie is hoog', 'Maak het zo uitdagend als je wilt'],
                luteal: ['Houd routine zonder druk', 'Accepteer wisselende kracht', 'Beweeg consistent']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte training voor bloedstroom', 'Focus op vorm en diepte', 'Herstel is essentieel'],
                follicular: ['Maximale progressie in bench press', 'Verhoog gewicht systematisch', 'Je borstspieren groeien optimaal'],
                ovulatory: ['Zwaarste chest day van de maand', 'Je kracht is op piek', 'Train tot falen met perfecte vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar je borst']
            }
        },
        shoulders: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Lichte raises voor mobiliteit', 'Rek je schouders en nek', 'Beweeg zonder belasting'],
                follicular: ['Verhoog gewicht bij overhead press', 'Je schouders herstellen snel', 'Train met progressive overload'],
                ovulatory: ['Pak je zwaarste presses nu', 'Je schouders zijn sterk', 'Train met maximale spanning'],
                luteal: ['Onderhoud met matige gewichten', 'Let op je schoudergewrichten', 'Techniek boven gewicht']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Lichte activatie voor schouders', 'Focus op rotator cuff stabiliteit', 'Neem rust als nodig'],
                follicular: ['Verhoog intensiteit bij presses', 'Overhead press zwaar trainen', 'Je spieropbouw is optimaal'],
                ovulatory: ['Ga voor zware PRs op overhead press', 'Je schouders zijn op hun sterkst', 'Train met maximale intensiteit'],
                luteal: ['Behoud volume met gecontroleerde raises', 'Focus op mind-muscle connection', 'Eet voldoende voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Lichte schouder-oefeningen', 'Kies wat goed voelt', 'Rust is waardevol'],
                follicular: ['Geniet van terugkerende kracht', 'Probeer variatie in raises', 'Bouw op zonder druk'],
                ovulatory: ['Train je schouders met plezier', 'Je energie is hoog', 'Maak het zo zwaar als je wilt'],
                luteal: ['Houd routine zonder stress', 'Variatie houdt het leuk', 'Accepteer je niveau']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte training voor bloedstroom', 'Focus op vorm en stabiliteit', 'Herstel is groei'],
                follicular: ['Maximale progressie in overhead press', 'Verhoog gewicht systematisch', 'Je schouders groeien optimaal'],
                ovulatory: ['Zwaarste shoulder day van de maand', 'Je kracht is op piek', 'Train tot falen met perfecte vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar je schouders']
            }
        },
        core: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Zachte core-activatie', 'Rek je buik en heupen', 'Beweeg zonder druk'],
                follicular: ['Verhoog intensiteit bij planks', 'Je core herstelt snel', 'Train met progressive overload'],
                ovulatory: ['Pak je zwaarste core work nu', 'Je stabiliteit is maximaal', 'Train met maximale spanning'],
                luteal: ['Onderhoud met matige intensiteit', 'Luister naar je onderrug', 'Kwaliteit boven kwantiteit']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Lichte core-activatie', 'Focus op ademhaling en spanning', 'Neem rust als nodig'],
                follicular: ['Verhoog intensiteit bij core work', 'Planks en raises zwaar trainen', 'Je spieropbouw is optimaal'],
                ovulatory: ['Ga voor uitdagende core sets', 'Je core is op zijn sterkst', 'Train met maximale intensiteit'],
                luteal: ['Behoud volume met gecontroleerde bewegingen', 'Focus op mind-muscle connection', 'Eet voldoende voor herstel']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Lichte core-oefeningen', 'Kies wat goed voelt', 'Rust is oké'],
                follicular: ['Geniet van terugkerende kracht', 'Probeer variatie in core work', 'Bouw op zonder stress'],
                ovulatory: ['Train je core met plezier', 'Je energie is hoog', 'Maak het zo uitdagend als je wilt'],
                luteal: ['Houd routine zonder druk', 'Accepteer wisselende kracht', 'Beweeg consistent']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Lichte training voor activatie', 'Focus op vorm en ademhaling', 'Herstel is essentieel'],
                follicular: ['Maximale progressie in core work', 'Verhoog weerstand systematisch', 'Je core groeit optimaal'],
                ovulatory: ['Zwaarste core day van de maand', 'Je kracht is op piek', 'Train tot falen met perfecte vorm'],
                luteal: ['Behoud volume met lagere intensiteit', 'Focus op stretch en contractie', 'Luister naar je core']
            }
        }
    }
}

export const FITNESS_CONTENT_EN = {
    goals: {
        [GOAL_TYPES.LOSE_FAT]: 'Lose Fat',
        [GOAL_TYPES.RECOMP]: 'Lose Fat + Muscle',
        [GOAL_TYPES.MAINTAIN]: 'Maintain Weight',
        [GOAL_TYPES.GAIN]: 'Build Muscle Mass'
    },
    bodyParts: [
        { id: 'glutes', label: 'Glutes' },
        { id: 'legs', label: 'Legs' },
        { id: 'back', label: 'Back' },
        { id: 'chest', label: 'Chest' },
        { id: 'shoulders', label: 'Shoulders' },
        { id: 'core', label: 'Core' }
    ],
    exercises: {
        glutes: ['Hip Thrust', 'Romanian Deadlift', 'Glute Bridge', 'Cable Kickback', 'Bulgarian Split Squat'],
        legs: ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl'],
        back: ['Lat Pulldown', 'Seated Row', 'Barbell Row', 'Deadlift', 'Face Pull'],
        chest: ['Bench Press', 'Push Up', 'Chest Fly', 'Dumbbell Press'],
        shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly'],
        core: ['Plank', 'Crunches', 'Leg Raises', 'Russian Twist', 'Dead Bug']
    },
    exerciseInstructions: {
        glutes: {
            'Hip Thrust': 'Lean your upper back against a bench. Place your feet hip-width apart on the floor. Push your hips up until your body forms a straight line. Squeeze your glutes at the top and lower with control.',
            'Romanian Deadlift': 'Stand with feet hip-width apart, keeping a slight bend in your knees. Hinge forward at the hips while keeping your back straight. Let the weight slide down your legs until you feel a stretch in your hamstrings. Push your hips forward to return.',
            'Glute Bridge': 'Lie on your back with bent knees and feet flat on the floor. Push your hips up by squeezing your glutes. Hold briefly at the top and lower with control.',
            'Cable Kickback': 'Stand in front of a cable machine with an ankle strap on the low cable. Lean slightly forward and keep your core engaged. Push your leg straight back by squeezing your glute. Return with control.',
            'Bulgarian Split Squat': 'Stand with your back to a bench. Place one foot on the bench behind you. Lower through your front knee until your thigh is parallel to the floor. Push back up through your front heel.'
        },
        legs: {
            'Squat': 'Stand with feet shoulder-width apart, toes slightly outward. Lower through your hips and knees as if sitting down. Keep your chest up and knees in line with your toes. Push back up through your heels.',
            'Leg Press': 'Sit in the leg press machine with feet hip-width on the platform. Lower the weights by bending your knees to 90 degrees. Push the platform away without locking your knees.',
            'Lunges': 'Stand tall and take a large step forward. Lower through both knees until your back knee nearly touches the ground. Push back up through your front heel and alternate legs.',
            'Leg Extension': 'Sit in the leg extension machine with your knees under the axis. Extend your legs until nearly straight. Squeeze your quadriceps briefly and lower with control.',
            'Leg Curl': 'Lie or sit in the leg curl machine with your ankles under the pad. Bend your knees to pull the weight toward your glutes. Squeeze your hamstrings and lower with control.'
        },
        back: {
            'Lat Pulldown': 'Sit at the lat pulldown machine with a wide grip. Pull the bar to your chest while squeezing your shoulder blades together. Return with control.',
            'Seated Row': 'Sit at the cable row with feet on the supports. Pull the handle to your waist while keeping your elbows close to your body. Squeeze your shoulder blades and return with control.',
            'Barbell Row': 'Bend forward with a straight back and hold the barbell with straight arms. Pull the bar to your waist while keeping your elbows close to your body. Lower with control.',
            'Deadlift': 'Stand with feet hip-width apart, squat down to the barbell. Grab the bar with straight arms. Push through your heels and extend your hips and knees together until standing tall. Lower with control.',
            'Face Pull': 'Stand in front of a cable machine with a rope at eye level. Pull the rope toward your face while keeping your elbows high and rotating outward. Squeeze your shoulder blades together.'
        },
        chest: {
            'Bench Press': 'Lie on a bench with feet flat on the floor. Grab the bar slightly wider than shoulder-width. Lower the bar to your chest and push back up.',
            'Push Up': 'Get into plank position with hands slightly wider than shoulder-width. Lower your body by bending your elbows. Push back up while keeping your core engaged.',
            'Chest Fly': 'Lie on a bench with dumbbells above your chest, palms facing each other. Open your arms in an arc until you feel a stretch in your chest. Bring them back as if hugging a tree.',
            'Dumbbell Press': 'Lie on a bench with dumbbells at chest height. Push the weights up until your arms are straight. Lower with control until dumbbells are beside your chest.'
        },
        shoulders: {
            'Overhead Press': 'Stand or sit with dumbbells at shoulder height, palms facing forward. Press the weights straight up until your arms are extended. Lower with control to shoulder height.',
            'Lateral Raise': 'Stand tall with dumbbells at your sides. Raise your arms sideways to shoulder height with a slight bend in your elbows. Lower with control.',
            'Front Raise': 'Stand tall with dumbbells in front of your body. Raise one arm straight forward to shoulder height. Lower with control and alternate arms.',
            'Rear Delt Fly': 'Bend slightly forward with dumbbells at your sides. Raise your arms sideways while squeezing your shoulder blades together. Lower with control.'
        },
        core: {
            'Plank': 'Get into plank position on your forearms and toes. Keep your body in a straight line from head to heels. Engage your core and hold this position.',
            'Crunches': 'Lie on your back with bent knees and hands behind your head. Roll your shoulder blades off the ground by engaging your core. Lower with control.',
            'Leg Raises': 'Lie on your back with straight legs. Raise your legs up until they point straight up. Lower with control without lifting your lower back off the ground.',
            'Russian Twist': 'Sit with bent knees and lean slightly back. Hold a weight in front of your chest and rotate your torso from left to right. Keep your core engaged.',
            'Dead Bug': 'Lie on your back with arms straight up and knees at 90 degrees. Extend one arm and the opposite leg while engaging your core. Alternate sides.'
        }
    },
    focusBullets: {
        [GOAL_TYPES.LOSE_FAT]: {
            menstrual: [
                'Move gently to release tension',
                'Give yourself rest without guilt',
                'Listen to your body today'
            ],
            follicular: [
                'Build up slowly in intensity',
                'Enjoy faster recovery',
                'Choose movement that gives energy'
            ],
            ovulatory: [
                'Utilize your higher energy level',
                'Shorten rest breaks if it fits',
                'Train slightly more intensely if you want'
            ],
            luteal: [
                'Stick to your routine',
                'Move against bloated feeling',
                'Accept fluctuations in strength'
            ]
        },
        [GOAL_TYPES.RECOMP]: {
            menstrual: [
                'Take rest for recovery and growth',
                'Keep yourself flexible with light movement',
                'Skip heavy sets today'
            ],
            follicular: [
                'Gradually increase intensity',
                'Utilize your better recovery capacity',
                'Focus on build-up and technique'
            ],
            ovulatory: [
                'Train at your strongest moment',
                'Take compounds and heavier sets',
                'Challenge yourself with good form'
            ],
            luteal: [
                'Maintain what you have built up',
                'Refine your technique this phase',
                'Eat enough for recovery'
            ]
        },
        [GOAL_TYPES.GAIN]: {
            menstrual: [
                'Take rest for muscle growth',
                'Move lightly or take a rest day',
                'Eat enough for recovery'
            ],
            follicular: [
                'Increase weight and intensity',
                'Utilize optimal muscle recovery',
                'Focus on compound exercises'
            ],
            ovulatory: [
                'Take your heaviest sets now',
                'Utilize your peak in strength',
                'Train with perfect technique'
            ],
            luteal: [
                'Decrease volume, increase quality',
                'Work on technique and form',
                'Listen to fatigue signals'
            ]
        },
        [GOAL_TYPES.MAINTAIN]: {
            menstrual: [
                'Move gently or take rest',
                'Let go of obligations today',
                'Follow what your body asks'
            ],
            follicular: [
                'Enjoy returning energy',
                'Try variety in training forms',
                'Choose movement that you enjoy'
            ],
            ovulatory: [
                'Use energy in your way',
                'Try social or active workouts',
                'Let fun come first'
            ],
            luteal: [
                'Keep routine without pressure',
                'Choose steady-state movement',
                'Accept fluctuating energy levels'
            ]
        }
    },
    bodyPartFocus: {
        glutes: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Keep glutes active with light bridges', 'Stretch your hamstrings and hip flexors', 'Focus on activation, not weight'],
                follicular: ['Build up with progressive overload', 'Add resistance to your bridges', 'Your recovery speeds up, take advantage'],
                ovulatory: ['Hit your heaviest hip thrusts now', 'Your glutes respond optimally to tension', 'Train with full contraction'],
                luteal: ['Maintain with consistent training', 'Listen to your hips and lower back', 'Quality over quantity today']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Activate your glutes with light sets', 'Focus on mind-muscle connection', 'Take rest when your body asks'],
                follicular: ['Increase weight gradually', 'Train hip thrusts and squats heavy', 'Your muscle synthesis is optimal'],
                ovulatory: ['Go for personal records', 'Your strength is at its peak', 'Train with maximum intensity'],
                luteal: ['Maintain muscle mass with volume', 'Focus on technique and control', 'Eat enough protein for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Move your glutes gently active', 'Choose what feels good today', 'Rest is also training'],
                follicular: ['Enjoy your returning strength', 'Try new glute exercises', 'Build up without pressure'],
                ovulatory: ['Train your glutes with joy', 'Your energy is high, use it', 'Make it as heavy as you want'],
                luteal: ['Keep your routine without stress', 'Variety keeps it fun', 'Accept your energy level']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light activation for blood flow', 'Focus on form and feeling', 'Recovery is growth'],
                follicular: ['Maximum progression now', 'Increase weight every session', 'Your muscle synthesis peaks'],
                ovulatory: ['Heaviest sets of the month', 'Your strength is at its highest', 'Train to failure with good form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to fatigue']
            }
        },
        legs: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Keep light squats and lunges', 'Stretch your legs well', 'Move without pressure'],
                follicular: ['Increase weight on squats', 'Your legs recover quickly now', 'Train with progressive overload'],
                ovulatory: ['Hit your heaviest leg day', 'Your strength is maximal', 'Train with full range of motion'],
                luteal: ['Maintain with moderate weight', 'Listen to your knees and hips', 'Quality over heaviness']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Light leg training for active recovery', 'Focus on technique', 'Take extra rest between sets'],
                follicular: ['Increase intensity gradually', 'Train squats and deadlifts heavy', 'Your muscle building is optimal'],
                ovulatory: ['Go for heavy personal records', 'Your legs are at their strongest', 'Train with maximum effort'],
                luteal: ['Maintain muscle mass with volume', 'Focus on controlled movements', 'Eat enough for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Move your legs lightly active', 'Choose exercises that feel good', 'Rest is okay'],
                follicular: ['Enjoy returning energy', 'Try variety in leg exercises', 'Build up without stress'],
                ovulatory: ['Train your legs with joy', 'Your energy is high', 'Make it as challenging as you want'],
                luteal: ['Keep routine without pressure', 'Accept fluctuating strength', 'Move consistently']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light training for blood flow', 'Focus on form and depth', 'Recovery is essential'],
                follicular: ['Maximum progression in squats', 'Increase weight systematically', 'Your muscle building peaks'],
                ovulatory: ['Heaviest leg day of the month', 'Your strength is at peak', 'Train to failure with perfect form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to your legs']
            }
        },
        back: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Light rows for posture', 'Stretch your back and shoulders', 'Move without load'],
                follicular: ['Increase weight on pull-ups and rows', 'Your back recovers quickly', 'Train with progressive overload'],
                ovulatory: ['Hit your heaviest deadlifts now', 'Your back is at its strongest', 'Train with maximum tension'],
                luteal: ['Maintain with moderate weights', 'Watch your lower back', 'Technique over weight']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Light activation for your back', 'Focus on shoulder blade retraction', 'Take rest when needed'],
                follicular: ['Increase intensity on rows', 'Train deadlifts and pull-ups heavy', 'Your muscle building is optimal'],
                ovulatory: ['Go for heavy PRs on deadlift', 'Your back is at its strongest', 'Train with maximum intensity'],
                luteal: ['Maintain volume with controlled sets', 'Focus on mind-muscle connection', 'Eat enough for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Light back exercises for posture', 'Choose what feels good', 'Rest is also valuable'],
                follicular: ['Enjoy returning strength', 'Try new back exercises', 'Build up without pressure'],
                ovulatory: ['Train your back with joy', 'Your energy is high', 'Make it as heavy as you want'],
                luteal: ['Keep routine without stress', 'Variety keeps it interesting', 'Accept your level']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light training for blood flow', 'Focus on form and retraction', 'Recovery is growth'],
                follicular: ['Maximum progression in deadlifts', 'Increase weight systematically', 'Your back muscles grow optimally'],
                ovulatory: ['Heaviest back day of the month', 'Your strength is at peak', 'Train to failure with perfect form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to your back']
            }
        },
        chest: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Light push-ups and presses', 'Stretch your chest and shoulders', 'Move without pressure'],
                follicular: ['Increase weight on bench press', 'Your chest recovers quickly', 'Train with progressive overload'],
                ovulatory: ['Hit your heaviest presses now', 'Your upper body is strong', 'Train with maximum tension'],
                luteal: ['Maintain with moderate weights', 'Watch your shoulders', 'Technique over weight']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Light activation for chest', 'Focus on mind-muscle connection', 'Take rest when needed'],
                follicular: ['Increase intensity on presses', 'Train bench press heavy', 'Your muscle building is optimal'],
                ovulatory: ['Go for heavy PRs on bench', 'Your chest is at its strongest', 'Train with maximum intensity'],
                luteal: ['Maintain volume with controlled sets', 'Focus on stretch and contraction', 'Eat enough for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Light chest exercises', 'Choose what feels good', 'Rest is okay'],
                follicular: ['Enjoy returning strength', 'Try variety in presses', 'Build up without stress'],
                ovulatory: ['Train your chest with joy', 'Your energy is high', 'Make it as challenging as you want'],
                luteal: ['Keep routine without pressure', 'Accept fluctuating strength', 'Move consistently']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light training for blood flow', 'Focus on form and depth', 'Recovery is essential'],
                follicular: ['Maximum progression in bench press', 'Increase weight systematically', 'Your chest muscles grow optimally'],
                ovulatory: ['Heaviest chest day of the month', 'Your strength is at peak', 'Train to failure with perfect form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to your chest']
            }
        },
        shoulders: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Light raises for mobility', 'Stretch your shoulders and neck', 'Move without load'],
                follicular: ['Increase weight on overhead press', 'Your shoulders recover quickly', 'Train with progressive overload'],
                ovulatory: ['Hit your heaviest presses now', 'Your shoulders are strong', 'Train with maximum tension'],
                luteal: ['Maintain with moderate weights', 'Watch your shoulder joints', 'Technique over weight']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Light activation for shoulders', 'Focus on rotator cuff stability', 'Take rest when needed'],
                follicular: ['Increase intensity on presses', 'Train overhead press heavy', 'Your muscle building is optimal'],
                ovulatory: ['Go for heavy PRs on overhead press', 'Your shoulders are at their strongest', 'Train with maximum intensity'],
                luteal: ['Maintain volume with controlled raises', 'Focus on mind-muscle connection', 'Eat enough for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Light shoulder exercises', 'Choose what feels good', 'Rest is valuable'],
                follicular: ['Enjoy returning strength', 'Try variety in raises', 'Build up without pressure'],
                ovulatory: ['Train your shoulders with joy', 'Your energy is high', 'Make it as heavy as you want'],
                luteal: ['Keep routine without stress', 'Variety keeps it fun', 'Accept your level']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light training for blood flow', 'Focus on form and stability', 'Recovery is growth'],
                follicular: ['Maximum progression in overhead press', 'Increase weight systematically', 'Your shoulders grow optimally'],
                ovulatory: ['Heaviest shoulder day of the month', 'Your strength is at peak', 'Train to failure with perfect form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to your shoulders']
            }
        },
        core: {
            [GOAL_TYPES.LOSE_FAT]: {
                menstrual: ['Gentle core activation', 'Stretch your abs and hips', 'Move without pressure'],
                follicular: ['Increase intensity on planks', 'Your core recovers quickly', 'Train with progressive overload'],
                ovulatory: ['Hit your heaviest core work now', 'Your stability is maximal', 'Train with maximum tension'],
                luteal: ['Maintain with moderate intensity', 'Listen to your lower back', 'Quality over quantity']
            },
            [GOAL_TYPES.RECOMP]: {
                menstrual: ['Light core activation', 'Focus on breathing and tension', 'Take rest when needed'],
                follicular: ['Increase intensity on core work', 'Train planks and raises heavy', 'Your muscle building is optimal'],
                ovulatory: ['Go for challenging core sets', 'Your core is at its strongest', 'Train with maximum intensity'],
                luteal: ['Maintain volume with controlled movements', 'Focus on mind-muscle connection', 'Eat enough for recovery']
            },
            [GOAL_TYPES.MAINTAIN]: {
                menstrual: ['Light core exercises', 'Choose what feels good', 'Rest is okay'],
                follicular: ['Enjoy returning strength', 'Try variety in core work', 'Build up without stress'],
                ovulatory: ['Train your core with joy', 'Your energy is high', 'Make it as challenging as you want'],
                luteal: ['Keep routine without pressure', 'Accept fluctuating strength', 'Move consistently']
            },
            [GOAL_TYPES.GAIN]: {
                menstrual: ['Light training for activation', 'Focus on form and breathing', 'Recovery is essential'],
                follicular: ['Maximum progression in core work', 'Increase resistance systematically', 'Your core grows optimally'],
                ovulatory: ['Heaviest core day of the month', 'Your strength is at peak', 'Train to failure with perfect form'],
                luteal: ['Maintain volume with lower intensity', 'Focus on stretch and contraction', 'Listen to your core']
            }
        }
    }
}

export function getFitnessContent(language) {
    return language === 'en' ? FITNESS_CONTENT_EN : FITNESS_CONTENT_NL
}

export function getFitnessAdvice(goal, phase, language) {
    const content = getFitnessContent(language)
    const isEn = language === 'en'

    let advice = {
        main: '',
        intensity: '',
        volume: '',
        rest: '',
        muscleFocus: '',
        types: [],
        explanation: ''
    }

    // Set Baseline based on Goal
    switch (goal) {
        case GOAL_TYPES.LOSE_FAT:
            advice.main = isEn ? 'Fat Loss & Strength Retention' : 'Krachtbehoud & Vetverbranding'
            advice.intensity = isEn ? 'Medium - High' : 'Gemiddeld - Hoog'
            advice.volume = isEn ? 'Low - Medium (3-4 sets)' : 'Laag - Gemiddeld (3-4 sets)'
            advice.rest = isEn ? 'Short (30-60s) or Active' : 'Kort (30-60s) of Actief'
            advice.muscleFocus = 'Full Body or Upper/Lower'
            advice.types = isEn ? ['Strength Training (Compound)', 'Circuit Training', 'LISS Cardio'] : ['Krachttraining (Compound)', 'Circuit Training', 'LISS Cardio']
            advice.explanation = isEn 
                ? 'During weight loss, strength is essential to protect muscle mass, while a slightly higher heart rate helps with calorie consumption.'
                : 'Bij gewichtsverlies is kracht essentieel om spiermassa te beschermen, terwijl een iets hogere hartslag helpt bij calorieverbruik.'
            break
        case GOAL_TYPES.RECOMP:
            advice.main = isEn ? 'Muscle Building & Fat Loss' : 'Spieropbouw & Vetverlies'
            advice.intensity = isEn ? 'High (to failure)' : 'Hoog (tot falen)'
            advice.volume = isEn ? 'Medium (3-4 sets)' : 'Gemiddeld (3-4 sets)'
            advice.rest = isEn ? 'Medium (60-90s)' : 'Gemiddeld (60-90s)'
            advice.muscleFocus = 'Push/Pull/Legs or Upper/Lower'
            advice.types = isEn ? ['Hypertrophy Strength', 'Metabolic Conditioning', 'Sprints'] : ['Hypertrofie Kracht', 'Metabolic Conditioning', 'Sprints']
            advice.explanation = isEn
                ? 'Recomp requires a strong growth stimulus for muscles, combined with sufficient intensity to keep metabolism high.'
                : 'Recomp vraagt om een sterke groeiprikkel voor spieren, gecombineerd met voldoende intensiteit om de stofwisseling hoog te houden.'
            break
        case GOAL_TYPES.MAINTAIN:
            advice.main = isEn ? 'Fitness & Performance' : 'Fitheid & Prestatie'
            advice.intensity = isEn ? 'Medium' : 'Gemiddeld'
            advice.volume = isEn ? 'Medium (3 sets)' : 'Gemiddeld (3 sets)'
            advice.rest = isEn ? 'By feel' : 'Op gevoel'
            advice.muscleFocus = isEn ? 'Balanced' : 'Gebalanceerd'
            advice.types = isEn ? ['Strength Training', 'Running', 'Interval'] : ['Krachttraining', 'Duurloop', 'Interval']
            advice.explanation = isEn
                ? 'A balanced approach to maintain your current form and slowly get stronger without extreme load.'
                : 'Een gebalanceerde aanpak om je huidige vorm vast te houden en langzaam sterker te worden zonder extreme belasting.'
            break
        case GOAL_TYPES.GAIN_MUSCLE:
            advice.main = isEn ? 'Maximum Muscle Growth' : 'Maximale Spiergroei'
            advice.intensity = isEn ? 'High (Progressive Overload)' : 'Hoog (Progressive Overload)'
            advice.volume = isEn ? 'High (4-5 sets)' : 'Hoog (4-5 sets)'
            advice.rest = isEn ? 'Long (90-120s)' : 'Lang (90-120s)'
            advice.muscleFocus = 'Bodypart Split or PPL'
            advice.types = isEn ? ['Hypertrophy (8-12 reps)', 'Heavy lifting (5x5)', 'Low Cardio'] : ['Hypertrofie (8-12 reps)', 'Zwaar liften (5x5)', 'Weinig Cardio']
            advice.explanation = isEn
                ? 'To grow you must maximize volume and intensity and minimize cardio to save calories.'
                : 'Om te groeien moet je het volume en de intensiteit maximaliseren en cardio minimaliseren om calorieën te sparen.'
            break
        default:
            advice.main = isEn ? 'General Fitness' : 'Algemene Fitheid'
    }

    // 2. Apply Phase Modifiers
    switch (phase) {
        case PHASES.MENSTRUAL:
            advice.main += isEn ? ' (Focus on Recovery)' : ' (Focus op Herstel)'
            advice.intensity = isEn ? 'Low' : 'Laag'
            advice.volume = isEn ? 'Reduced (-20%)' : 'Verlaagd (-20%)'
            advice.rest = isEn ? 'Long & Relaxed' : 'Lang & Ontspannen'
            advice.types = isEn ? ['Mobility', 'Technique flow', 'Walking'] : ['Mobiliteit', 'Techniekflow', 'Wandelen']
            advice.explanation = isEn
                ? `During your menstruation your energy is lower. ${goal === GOAL_TYPES.LOSE_FAT ? 'Keep moving, but choose walking.' : 'Focus on technique with light weights.'}`
                : `Tijdens je menstruatie is je energie lager. ${goal === GOAL_TYPES.LOSE_FAT ? 'Blijf bewegen, maar kies voor wandelen.' : 'Focus op techniek met lichte gewichten.'}`
            break

        case PHASES.FOLLICULAR:
            advice.explanation += isEn 
                ? ' The follicular phase is ideal to ramp up volume and intensity.'
                : ' De folliculaire fase is ideaal om het volume en de intensiteit op te schroeven.'
            break

        case PHASES.OVULATORY:
            advice.intensity = isEn ? 'Maximum (PR Attempt)' : 'Maximaal (PR Poging)'
            advice.explanation += isEn
                ? ' You are at your strongest now (ovulation). This is the moment for personal records.'
                : ' Je bent nu op je sterkst (ovulatie). Dit is hét moment voor persoonlijke records.'
            break

        case PHASES.LUTEAL:
            advice.intensity = isEn ? 'Medium (Controlled)' : 'Gemiddeld (Gecontroleerd)'
            advice.rest += isEn ? ' (Listen to body)' : ' (Luister naar lichaam)'
            advice.explanation += isEn
                ? ' In the luteal phase your body temperature increases. Train steadily, but avoid exhaustion.'
                : ' In de luteale fase verhoogt je lichaamstemperatuur. Train stabiel, maar vermijd uitputting.'
            break
    }

    return advice
}

export function getBodyPartAdvice(goal, phase, language) {
    const isEn = language === 'en'
    let advice = {
        intensity: '',
        weight: '',
        reps: '',
        sets: '',
        label: ''
    }

    // Phase Logic (Cycle)
    switch (phase) {
        case PHASES.MENSTRUAL:
            advice.intensity = isEn ? 'Low - Medium' : 'Laag - Gemiddeld'
            advice.weight = isEn ? 'Light - Moderate' : 'Licht - Matig'
            advice.reps = '12 - 15'
            advice.sets = '2 - 3'
            advice.label = isEn ? 'Preferably take it easy today' : 'Vandaag liever rustiger'
            break
        case PHASES.FOLLICULAR:
            advice.intensity = isEn ? 'Medium - High' : 'Gemiddeld - Hoog'
            advice.weight = isEn ? 'Moderate - Heavy' : 'Matig - Zwaar'
            advice.reps = '8 - 12'
            advice.sets = '3 - 4'
            advice.label = isEn ? 'Recommended today' : 'Aanbevolen vandaag'
            break
        case PHASES.OVULATORY:
            advice.intensity = isEn ? 'High (Maximum)' : 'Hoog (Maximaal)'
            advice.weight = isEn ? 'Heavy (PR attempt)' : 'Zwaar (PR poging)'
            advice.reps = '5 - 8'
            advice.sets = '4 - 5'
            advice.label = isEn ? 'Top fit today!' : 'Top fit vandaag!'
            break
        case PHASES.LUTEAL:
            advice.intensity = isEn ? 'Medium' : 'Gemiddeld'
            advice.weight = isEn ? 'Moderate (Controlled)' : 'Matig (Gecontroleerd)'
            advice.reps = '10 - 12'
            advice.sets = '3 - 4'
            advice.label = isEn ? 'Listen to your body' : 'Luister naar je lichaam'
            break
        default:
            advice.intensity = isEn ? 'Medium' : 'Gemiddeld'
            advice.weight = isEn ? 'Moderate' : 'Matig'
            advice.reps = '10 - 12'
            advice.sets = '3'
            advice.label = isEn ? 'Recommended today' : 'Aanbevolen vandaag'
    }

    // Goal Adjustments
    if (goal === GOAL_TYPES.GAIN && phase !== PHASES.MENSTRUAL) {
        advice.reps = isEn ? '8 - 12 (Hypertrophy)' : '8 - 12 (Hypertrofie)'
        advice.sets = '4 - 5'
    } else if (goal === GOAL_TYPES.LOSE_FAT && phase !== PHASES.MENSTRUAL) {
        advice.reps = isEn ? '12 - 15 (Metabolic)' : '12 - 15 (Metabool)'
        advice.sets = '3 - 4'
    }

    return advice
}
