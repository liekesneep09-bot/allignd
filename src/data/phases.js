import { PHASES } from '../logic/cycle'

export const PHASE_CONTENT = {
  [PHASES.MENSTRUAL]: {
    name: 'Menstruatie',
    label: 'Menstruatie',
    colorVar: '--phase-menstrual',

    // Collapsible info structure (MVP Copy)
    validation: 'Het is logisch als je je nu wat rustiger voelt.',
    explanation: 'Lage hormoonspiegels zorgen ervoor dat je lichaam zich herstelt.',
    bullets: [
      'Lagere energie of sneller vermoeid',
      'Meer behoefte aan rust, warmte of comfort',
      'Je lichaam kan gevoeliger aanvoelen',
      'Mogelijke krampen of ongemak',
      'Iets minder focus of motivatie'
    ],
    phaseClosing: 'Dit is een fase waarin zachter zijn juist helpend is.',

    // Legacy (kept for compatibility)
    intro: 'Je lichaam is aan het herstellen. Minder energie vandaag is normaal.',
    overview: 'Je zit nu in de menstruatiefase. Je lichaam is aan het herstellen en vraagt om rust.',
    closing: 'Vandaag rust nemen ondersteunt het herstel van je lichaam.',
    context: 'Lage hormoonspiegels.',
    loadCapacity: 'Je lichaam vraagt om rust.',

    // Training (cyclus-first, motiverend, geen prestatiedruk)
    training: {
      title: 'Beweging die je lichaam nu helpt',
      subtitle: 'Herstel & Zachte Beweging',
      description: 'Voor veel vrouwen helpt rustige beweging in deze fase om spanning te verminderen en ontspanning te brengen.',
      types: ['Wandelen', 'Zachte yoga', 'Rustdag'],
      goal: 'Herstel & Comfort',
      intensity: 'Laag',
      focus: 'Zacht bewegen',
      icon: 'rest',
      why: 'Voor veel vrouwen helpt rustige beweging in deze fase om spanning te verminderen en ontspanning te brengen.'
    },

    // Nutrients (educational, not prescriptive)
    nutrients: [
      { name: 'IJzer', description: 'Kan helpen bij het aanvullen van wat je lichaam verliest tijdens menstruatie.' },
      { name: 'Vitamine C', description: 'Ondersteunt de opname van ijzer in het lichaam.' },
      { name: 'Magnesium', description: 'Wordt vaak gelinkt aan ontspanning van spieren en het zenuwstelsel.' },
      { name: 'Omega-3 vetzuren', description: 'Kunnen ondersteunend zijn bij ontstekingsprocessen in het lichaam.' }
    ],

    // Nutrition (legacy)
    nutrition: {
      focus: 'Warmte & Comfort',
      purpose: 'Comfort & IJzer',
      timing: 'Warme, makkelijke maaltijden.',
      examples: ['Soepen', 'Stoofpotjes', 'IJzerrijk voedsel']
    },

    bodySignal: 'Je temperatuur is lager. Houd jezelf lekker warm.'
  },

  [PHASES.FOLLICULAR]: {
    name: 'Folliculair',
    label: 'Folliculaire fase',
    colorVar: '--phase-follicular',

    // Collapsible info structure (MVP Copy)
    validation: 'Je merkt misschien dat je energie langzaam terugkomt.',
    explanation: 'Oestrogeen stijgt, waardoor je lichaam zich weer wat actiever voelt.',
    bullets: [
      'Meer helderheid in je hoofd',
      'Minder gevoelig voor prikkels',
      'Meer zin om dingen op te pakken',
      'Beter slaapritme',
      'Meer rust rondom eten'
    ],
    phaseClosing: 'Dit is een fase waarin dingen weer lichter mogen aanvoelen, in je eigen tempo.',

    // Legacy (kept for compatibility)
    intro: 'Je energie komt langzaam terug. Je lichaam staat meer open.',
    overview: 'Je zit nu in de folliculaire fase. Je energie neemt toe en je lichaam staat open voor opbouw.',
    closing: 'Een fijne fase om rustig weer vooruit te bewegen.',
    context: 'Energie stijgt.',
    loadCapacity: 'Je belastbaarheid neemt toe.',

    // Training (cyclus-first, motiverend, geen prestatiedruk)
    training: {
      title: 'Beweging die je lichaam nu helpt',
      subtitle: 'Opbouw & Energie',
      description: 'Veel vrouwen herstellen in deze fase sneller en voelen meer zin om te bewegen. Als je wilt, is dit een fijne periode om rustig weer op te bouwen.',
      types: ['Krachttraining', 'Nieuwe skills', 'Cardio'],
      goal: 'Opbouw & Energie',
      intensity: 'Gemiddeld',
      focus: 'Spieropbouw & Plezier',
      icon: 'strength',
      why: 'Veel vrouwen herstellen in deze fase sneller en voelen meer zin om te bewegen.'
    },

    // Nutrients (educational, not prescriptive)
    nutrients: [
      { name: 'B-vitamines', description: 'Spelen een rol in energieproductie en herstelprocessen.' },
      { name: 'Zink', description: 'Ondersteunt celvernieuwing en herstel na inspanning.' },
      { name: 'Eiwitten', description: 'Belangrijk voor opbouw en herstel van spierweefsel.' }
    ],

    // Nutrition (legacy)
    nutrition: {
      focus: 'Brandstof',
      purpose: 'Energie ondersteunen',
      timing: 'Koolhydraten voor herstel.',
      examples: ['Havermout', 'Rijst/Pasta', 'Kip/Vis/Tofu']
    },

    bodySignal: 'Je lichaam gaat efficiënt om met koolhydraten voor energie.'
  },

  [PHASES.OVULATORY]: {
    name: 'Ovulatie',
    label: 'Ovulatie',
    colorVar: '--phase-ovulatory',

    // Collapsible info structure (MVP Copy)
    validation: 'Dit is een fase waarin veel vrouwen zich sterker voelen.',
    explanation: 'Hormonen pieken, wat vaak gepaard gaat met meer beschikbare energie.',
    bullets: [
      'Meer kracht en zelfvertrouwen',
      'Focus en beweging voelen vaak makkelijker',
      'Hogere sociale energie',
      'Meer drive of motivatie',
      'Sommigen ervaren een lichte piek in temperatuur'
    ],
    phaseClosing: 'Je mag deze energie gebruiken op een manier die bij jou past.',

    // Legacy (kept for compatibility)
    intro: 'Je lichaam zit in een natuurlijke piek van energie.',
    overview: 'Je zit nu in de ovulatiefase. Je zit in je natuurlijke energie-piek en bent op je sterkst.',
    closing: 'Gebruik deze energie op een manier die bij jou past.',
    context: 'Hormonale piek.',
    loadCapacity: 'Fysiek en mentaal sterk.',

    // Training (cyclus-first, motiverend, geen prestatiedruk)
    training: {
      title: 'Beweging die goed kan werken in deze fase',
      subtitle: 'Meer kracht & energie',
      description: 'Veel vrouwen ervaren in deze fase meer kracht en motivatie. Als je zin hebt om jezelf uit te dagen, kan dat nu makkelijker voelen.',
      types: ['HIIT', 'Compounds', 'Running'],
      goal: 'Kracht & Piek',
      intensity: 'Hoog',
      focus: 'Jezelf uitdagen',
      icon: 'strength',
      why: 'Veel vrouwen ervaren in deze fase meer kracht en motivatie.'
    },

    // Nutrients (educational, not prescriptive)
    nutrients: [
      { name: 'Antioxidanten (vitamine C en E)', description: 'Ondersteunen het lichaam bij hogere activiteit en herstel.' },
      { name: 'Omega-3 vetzuren', description: 'Kunnen bijdragen aan herstel bij intensievere beweging.' },
      { name: 'Vezelrijke voeding', description: 'Draagt bij aan een stabiele spijsvertering en balans.' }
    ],

    // Nutrition (legacy)
    nutrition: {
      focus: 'Ondersteuning',
      purpose: 'Hoog verbruik dekken',
      timing: 'Voldoende brandstof rondom bewegen.',
      examples: ['Snelle carbs', 'Eiwitrijke voeding']
    },

    bodySignal: 'Hoge energie, maar let op stabiliteit bij zwaar tillen.'
  },

  [PHASES.LUTEAL]: {
    name: 'Luteaal',
    label: 'Luteale fase',
    colorVar: '--phase-luteal',

    // Collapsible info structure (MVP Copy)
    validation: 'Het is normaal als je je nu iets trager of gevoeliger voelt.',
    explanation: 'Progesteron stijgt en je lichaam bereidt zich voor op rust.',
    bullets: [
      'Meer kans op vocht vasthouden of een opgeblazen gevoel',
      'Toename in honger of cravings',
      'Sneller overprikkeld of minder stressbestendig'
    ],
    phaseClosing: 'Vertraging zegt niets over je inzet of discipline.',

    // Legacy (kept for compatibility)
    intro: 'Je lichaam bereidt zich voor op rust. Dat vraagt meer van je systeem.',
    overview: 'Je zit nu in de luteale fase. Je lichaam bereidt zich voor op rust. Minder energie is normaal.',
    closing: 'Dit betekent niet dat je iets verkeerd doet. Je lichaam houdt nu simpelweg meer vast.',
    context: 'Energie vertraagt.',
    loadCapacity: 'Tijd voor afronding.',

    // Training (cyclus-first, motiverend, geen prestatiedruk)
    training: {
      title: 'Beweging die je lichaam nu helpt',
      subtitle: 'Onderhoud & Balans',
      description: 'In deze fase voelt het vaak fijner om te bewegen met focus op consistentie, niet op records.',
      types: ['Pilates', 'Steady cardio', 'Techniek'],
      goal: 'Onderhoud & Balans',
      intensity: 'Op gevoel',
      focus: 'Luisteren naar je lijf',
      icon: 'light',
      why: 'In deze fase voelt het vaak fijner om te bewegen met focus op consistentie, niet op records.'
    },

    // Nutrients (educational, not prescriptive)
    nutrients: [
      { name: 'Magnesium', description: 'Wordt vaak genoemd in relatie tot ontspanning en prikkelgevoeligheid.' },
      { name: 'Vitamine B6', description: 'Speelt een rol in hormonale processen in het lichaam.' },
      { name: 'Complexe koolhydraten', description: 'Kunnen helpen bij stabiele energie en verzadiging.' }
    ],

    // Nutrition (legacy)
    nutrition: {
      focus: 'Verzadiging',
      purpose: 'Bloedsuiker balans',
      timing: 'Regelmatig eten tegen cravings.',
      examples: ['Zoete aardappel', 'Noten/Avocado', 'Pure chocolade']
    },

    bodySignal: 'Je verbranding is iets hoger. Gezonde vetten stillen de trek.'
  }
}
