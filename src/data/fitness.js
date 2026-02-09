import { GOAL_TYPES } from '../logic/nutrition'
import { PHASES } from '../logic/cycle'

export function getFitnessAdvice(goal, phase) {
    // 1. Define Goal Baseline (The "Strategy")
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
            advice.main = 'Krachtbehoud & Vetverbranding'
            advice.intensity = 'Gemiddeld - Hoog'
            advice.volume = 'Laag - Gemiddeld (3-4 sets)'
            advice.rest = 'Kort (30-60s) of Actief'
            advice.muscleFocus = 'Full Body of Upper/Lower'
            advice.types = ['Krachttraining (Compound)', 'Circuit Training', 'LISS Cardio']
            advice.explanation = 'Bij gewichtsverlies is kracht essentieel om spiermassa te beschermen, terwijl een iets hogere hartslag helpt bij calorieverbruik.'
            break
        case GOAL_TYPES.RECOMP:
            advice.main = 'Spieropbouw & Vetverlies'
            advice.intensity = 'Hoog (tot falen)'
            advice.volume = 'Gemiddeld (3-4 sets)'
            advice.rest = 'Gemiddeld (60-90s)'
            advice.muscleFocus = 'Push/Pull/Legs of Upper/Lower'
            advice.types = ['Hypertrofie Kracht', 'Metabolic Conditioning', 'Sprints']
            advice.explanation = 'Recomp vraagt om een sterke groeiprikkel voor spieren, gecombineerd met voldoende intensiteit om de stofwisseling hoog te houden.'
            break
        case GOAL_TYPES.MAINTAIN:
            advice.main = 'Fitheid & Prestatie'
            advice.intensity = 'Gemiddeld'
            advice.volume = 'Gemiddeld (3 sets)'
            advice.rest = 'Op gevoel'
            advice.muscleFocus = 'Gebalanceerd'
            advice.types = ['Krachttraining', 'Duurloop', 'Interval']
            advice.explanation = 'Een gebalanceerde aanpak om je huidige vorm vast te houden en langzaam sterker te worden zonder extreme belasting.'
            break
        case GOAL_TYPES.GAIN:
            advice.main = 'Maximale Spiergroei'
            advice.intensity = 'Hoog (Progressive Overload)'
            advice.volume = 'Hoog (4-5 sets)'
            advice.rest = 'Lang (90-120s)'
            advice.muscleFocus = 'Bodypart Split of PPL'
            advice.types = ['Hypertrofie (8-12 reps)', 'Zwaar liften (5x5)', 'Weinig Cardio']
            advice.explanation = 'Om te groeien moet je het volume en de intensiteit maximaliseren en cardio minimaliseren om calorieën te sparen.'
            break
        default:
            advice.main = 'Algemene Fitheid'
    }

    // 2. Apply Phase Modifiers (The "Reality Check")
    switch (phase) {
        case PHASES.MENSTRUAL:
            advice.main += ' (Focus op Herstel)'
            advice.intensity = 'Laag'
            advice.volume = 'Verlaagd (-20%)'
            advice.rest = 'Lang & Ontspannen'
            advice.types = ['Mobiliteit', 'Techniekflow', 'Wandelen']
            advice.explanation = `Tijdens je menstruatie is je energie lager. ${goal === GOAL_TYPES.LOSE_FAT ? 'Blijf bewegen, maar kies voor wandelen.' : 'Focus op techniek met lichte gewichten.'}`
            break

        case PHASES.FOLLICULAR:
            // Baseline is fine, maybe emphasize progression
            advice.explanation += ' De folliculaire fase is ideaal om het volume en de intensiteit op te schroeven.'
            break

        case PHASES.OVULATORY:
            advice.intensity = 'Maximaal (PR Poging)'
            advice.explanation += ' Je bent nu op je sterkst (ovulatie). Dit is hét moment voor persoonlijke records.'
            break

        case PHASES.LUTEAL:
            advice.intensity = 'Gemiddeld (Gecontroleerd)'
            advice.rest += ' (Luister naar lichaam)'
            advice.explanation += ' In de luteale fase verhoogt je lichaamstemperatuur. Train stabiel, maar vermijd uitputting.'
            break
    }

    return advice
}

// ... existing getFitnessAdvice code ...

export const BODY_PARTS = [
    { id: 'glutes', label: 'Billen' },
    { id: 'legs', label: 'Benen' },
    { id: 'back', label: 'Rug' },
    { id: 'chest', label: 'Borst' },
    { id: 'shoulders', label: 'Schouders' },
    { id: 'core', label: 'Core' }
]

export function getBodyPartExercises(partId) {
    const exercises = {
        glutes: ['Hip Thrust', 'Romanian Deadlift', 'Glute Bridge', 'Cable Kickback', 'Bulgarian Split Squat'],
        legs: ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl'],
        back: ['Lat Pulldown', 'Seated Row', 'Barbell Row', 'Deadlift', 'Face Pull'],
        chest: ['Bench Press', 'Push Up', 'Chest Fly', 'Dumbbell Press'],
        shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly'],
        core: ['Plank', 'Crunches', 'Leg Raises', 'Russian Twist', 'Dead Bug']
    }
    return exercises[partId] || []
}

export function getBodyPartAdvice(goal, phase) {
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
            advice.intensity = 'Laag - Gemiddeld'
            advice.weight = 'Licht - Matig'
            advice.reps = '12 - 15'
            advice.sets = '2 - 3'
            advice.label = 'Vandaag liever rustiger'
            break
        case PHASES.FOLLICULAR:
            advice.intensity = 'Gemiddeld - Hoog'
            advice.weight = 'Matig - Zwaar'
            advice.reps = '8 - 12'
            advice.sets = '3 - 4'
            advice.label = 'Aanbevolen vandaag'
            break
        case PHASES.OVULATORY:
            advice.intensity = 'Hoog (Maximaal)'
            advice.weight = 'Zwaar (PR poging)'
            advice.reps = '5 - 8'
            advice.sets = '4 - 5'
            advice.label = 'Top fit vandaag!'
            break
        case PHASES.LUTEAL:
            advice.intensity = 'Gemiddeld'
            advice.weight = 'Matig (Gecontroleerd)'
            advice.reps = '10 - 12'
            advice.sets = '3 - 4'
            advice.label = 'Luister naar je lichaam'
            break
        default:
            advice.intensity = 'Gemiddeld'
            advice.weight = 'Matig'
            advice.reps = '10 - 12'
            advice.sets = '3'
            advice.label = 'Aanbevolen vandaag'
    }

    // Goal Adjustments (Subtle tweaks)
    if (goal === GOAL_TYPES.GAIN && phase !== PHASES.MENSTRUAL) {
        advice.reps = '8 - 12 (Hypertrofie)'
        advice.sets = '4 - 5'
    } else if (goal === GOAL_TYPES.LOSE_FAT && phase !== PHASES.MENSTRUAL) {
        advice.reps = '12 - 15 (Metabool)'
        advice.sets = '3 - 4'
    }

    return advice
}
