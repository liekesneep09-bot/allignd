import { PHASES } from '../logic/cycle'
import { GOAL_TYPES } from '../logic/nutrition'

export const FITNESS_CONTENT_NL = {
    goals: {
        [GOAL_TYPES.LOSE_FAT]: 'Afvallen',
        [GOAL_TYPES.RECOMP]: 'Afvallen + Spier',
        [GOAL_TYPES.MAINTAIN]: 'Gewicht Behouden',
        [GOAL_TYPES.GAIN_MUSCLE]: 'Spiermassa Opbouwen'
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
        [GOAL_TYPES.GAIN_MUSCLE]: {
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
    }
}

export const FITNESS_CONTENT_EN = {
    goals: {
        [GOAL_TYPES.LOSE_FAT]: 'Lose Fat',
        [GOAL_TYPES.RECOMP]: 'Lose Fat + Muscle',
        [GOAL_TYPES.MAINTAIN]: 'Maintain Weight',
        [GOAL_TYPES.GAIN_MUSCLE]: 'Build Muscle Mass'
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
        [GOAL_TYPES.GAIN_MUSCLE]: {
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
    if (goal === GOAL_TYPES.GAIN_MUSCLE && phase !== PHASES.MENSTRUAL) {
        advice.reps = isEn ? '8 - 12 (Hypertrophy)' : '8 - 12 (Hypertrofie)'
        advice.sets = '4 - 5'
    } else if (goal === GOAL_TYPES.LOSE_FAT && phase !== PHASES.MENSTRUAL) {
        advice.reps = isEn ? '12 - 15 (Metabolic)' : '12 - 15 (Metabool)'
        advice.sets = '3 - 4'
    }

    return advice
}
