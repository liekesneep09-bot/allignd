import { PHASES } from '../logic/cycle'

export const PHASE_CONTENT_NL = {
  [PHASES.MENSTRUAL]: {
    name: 'Menstruatie',
    label: 'Menstruatie',
    colorVar: '--phase-menstrual',

    validation: 'Het is logisch als je je nu wat rustiger of kwetsbaarder voelt.',
    explanation: 'Je hormoonspiegels zijn laag en je lichaam is vooral bezig met herstel.',
    bullets: [
      'Lagere energie of sneller vermoeid',
      'Meer behoefte aan rust, warmte of comfort',
      'Regelmatige maaltijden, warm eten en voldoende rust kunnen je lichaam nu ondersteunen.'
    ],
    phaseClosing: 'Rust nemen is geen achteruitgang, maar herstel.',

    intro: 'Je lichaam is aan het herstellen. Minder energie vandaag is normaal.',
    overview: 'Je zit nu in de menstruatiefase. Je lichaam is aan het herstellen en vraagt om rust.',
    closing: 'Vandaag rust nemen ondersteunt het herstel van je lichaam.',
    context: 'Lage hormoonspiegels.',
    loadCapacity: 'Je lichaam vraagt om rust.',

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

    nutrients: [
      { name: 'IJzer', description: 'Kan helpen bij het aanvullen van wat je lichaam verliest tijdens menstruatie.' },
      { name: 'Vitamine C', description: 'Ondersteunt de opname van ijzer in het lichaam.' },
      { name: 'Magnesium', description: 'Wordt vaak gelinkt aan ontspanning van spieren en het zenuwstelsel.' },
      { name: 'Omega-3 vetzuren', description: 'Kunnen ondersteunend zijn bij ontstekingsprocessen in het lichaam.' }
    ],

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

    validation: 'Je merkt misschien dat je energie langzaam weer terugkomt.',
    explanation: 'Oestrogeen stijgt, waardoor je lichaam zich lichter en actiever kan voelen.',
    bullets: [
      'Meer helderheid in je hoofd',
      'Minder gevoelig voor prikkels',
      'Meer zin om dingen op te pakken',
      'Vaak beter slaapritme en meer rust rondom eten',
      'Dit is een fijne fase om je ritme weer op te bouwen en iets actiever te worden.'
    ],
    phaseClosing: 'Je hoeft niets te forceren om vooruit te gaan.',

    intro: 'Je energie komt langzaam terug. Je lichaam staat meer open.',
    overview: 'Je zit nu in de folliculaire fase. Je energie neemt toe en je lichaam staat open voor opbouw.',
    closing: 'Een fijne fase om rustig weer vooruit te bewegen.',
    context: 'Energie stijgt.',
    loadCapacity: 'Je belastbaarheid neemt toe.',

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

    nutrients: [
      { name: 'B-vitamines', description: 'Spelen een rol in energieproductie en herstelprocessen.' },
      { name: 'Zink', description: 'Ondersteunt celvernieuwing en herstel na inspanning.' },
      { name: 'Eiwitten', description: 'Belangrijk voor opbouw en herstel van spierweefsel.' }
    ],

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

    validation: 'Dit is een fase waarin veel vrouwen zich krachtig en zelfverzekerd voelen.',
    explanation: 'Hormonen pieken, wat vaak gepaard gaat met meer beschikbare energie.',
    bullets: [
      'Meer kracht en zelfvertrouwen',
      'Focus en beweging voelen vaak makkelijker',
      'Hogere sociale energie',
      'Meer drive of motivatie',
      'Sommigen ervaren een lichte stijging in lichaamstemperatuur',
      'Deze energie kan prettig zijn om dingen aan te pakken of jezelf iets meer uit te dagen.'
    ],
    phaseClosing: 'Gebruik je energie bewust, niet tot uitputting.',

    intro: 'Je lichaam zit in een natuurlijke piek van energie.',
    overview: 'Je zit nu in de ovulatiefase. Je zit in je natuurlijke energie-piek en bent op je sterkst.',
    closing: 'Gebruik deze energie op een manier die bij jou past.',
    context: 'Hormonale piek.',
    loadCapacity: 'Fysiek en mentaal sterk.',

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

    nutrients: [
      { name: 'Antioxidanten (vitamine C en E)', description: 'Ondersteunen het lichaam bij hogere activiteit en herstel.' },
      { name: 'Omega-3 vetzuren', description: 'Kunnen bijdragen aan herstel bij intensievere beweging.' },
      { name: 'Vezelrijke voeding', description: 'Draagt bij aan een stabiele spijsvertering en balans.' }
    ],

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

    validation: 'Het is normaal als je je nu wat trager, gevoeliger of sneller vol voelt.',
    explanation: 'Progesteron stijgt en je lichaam schakelt geleidelijk over naar meer rust en herstel.',
    bullets: [
      'Meer kans op vocht vasthouden of een opgeblazen gevoel',
      'Toename in honger of cravings',
      'Sneller overprikkeld of minder stressbestendig',
      'Iets meer structuur in maaltijden, voldoende eten en een lager tempo kunnen nu helpen.'
    ],
    phaseClosing: 'Vertraging zegt niets over je inzet of discipline.',

    intro: 'Je lichaam bereidt zich voor op rust. Dat vraagt meer van je systeem.',
    overview: 'Je zit nu in de luteale fase. Je lichaam bereidt zich voor op rust. Minder energie is normaal.',
    closing: 'Dit betekent niet dat je iets verkeerd doet. Je lichaam houdt nu simpelweg meer vast.',
    context: 'Energie vertraagt.',
    loadCapacity: 'Tijd voor afronding.',

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

    nutrients: [
      { name: 'Magnesium', description: 'Wordt vaak genoemd in relatie tot ontspanning en prikkelgevoeligheid.' },
      { name: 'Vitamine B6', description: 'Speelt een rol in hormonale processen in het lichaam.' },
      { name: 'Complexe koolhydraten', description: 'Kunnen helpen bij stabiele energie en verzadiging.' }
    ],

    nutrition: {
      focus: 'Verzadiging',
      purpose: 'Bloedsuiker balans',
      timing: 'Regelmatig eten tegen cravings.',
      examples: ['Zoete aardappel', 'Noten/Avocado', 'Pure chocolade']
    },

    bodySignal: 'Je verbranding is iets hoger. Gezonde vetten stillen de trek.'
  }
}

export const PHASE_CONTENT_EN = {
  [PHASES.MENSTRUAL]: {
    name: 'Menstrual',
    label: 'Menstrual Phase',
    colorVar: '--phase-menstrual',

    validation: 'It makes sense if you feel a bit calmer or more vulnerable right now.',
    explanation: 'Your hormone levels are low and your body is mainly focused on recovery.',
    bullets: [
      'Lower energy or fatigued more quickly',
      'More need for rest, warmth or comfort',
      'Regular meals, warm food and sufficient rest can support your body now.'
    ],
    phaseClosing: 'Taking a rest is not a step back, but recovery.',

    intro: 'Your body is recovering. Less energy today is normal.',
    overview: 'You are now in the menstrual phase. Your body is recovering and asks for rest.',
    closing: 'Taking rest today supports the recovery of your body.',
    context: 'Low hormone levels.',
    loadCapacity: 'Your body asks for rest.',

    training: {
      title: 'Movement that helps your body now',
      subtitle: 'Recovery & Gentle Movement',
      description: 'For many women, gentle movement in this phase helps to reduce tension and bring relaxation.',
      types: ['Walking', 'Gentle yoga', 'Rest day'],
      goal: 'Recovery & Comfort',
      intensity: 'Low',
      focus: 'Gentle movement',
      icon: 'rest',
      why: 'For many women, gentle movement in this phase helps to reduce tension and bring relaxation.'
    },

    nutrients: [
      { name: 'Iron', description: 'Can help replenish what your body loses during menstruation.' },
      { name: 'Vitamin C', description: 'Supports the absorption of iron in the body.' },
      { name: 'Magnesium', description: 'Is often linked to relaxation of muscles and the nervous system.' },
      { name: 'Omega-3 fatty acids', description: 'Can be supportive in inflammatory processes in the body.' }
    ],

    nutrition: {
      focus: 'Warmth & Comfort',
      purpose: 'Comfort & Iron',
      timing: 'Warm, easy meals.',
      examples: ['Soups', 'Stews', 'Iron-rich foods']
    },

    bodySignal: 'Your temperature is lower. Keep yourself nice and warm.'
  },

  [PHASES.FOLLICULAR]: {
    name: 'Follicular',
    label: 'Follicular Phase',
    colorVar: '--phase-follicular',

    validation: 'You may notice your energy slowly coming back.',
    explanation: 'Estrogen rises, making your body feel lighter and more active.',
    bullets: [
      'More clarity in your head',
      'Less sensitive to stimuli',
      'More desire to pick things up',
      'Often better sleep rhythm and more peace around food',
      'This is a great phase to build up your rhythm again and become slightly more active.'
    ],
    phaseClosing: 'You do not have to force anything to move forward.',

    intro: 'Your energy slowly returns. Your body is more open.',
    overview: 'You are now in the follicular phase. Your energy increases and your body is open to building.',
    closing: 'A nice phase to slowly move forward again.',
    context: 'Energy rises.',
    loadCapacity: 'Your capacity increases.',

    training: {
      title: 'Movement that helps your body now',
      subtitle: 'Building & Energy',
      description: 'Many women recover faster in this phase and feel more desire to move. If you want, this is a great period to slowly build up again.',
      types: ['Strength training', 'New skills', 'Cardio'],
      goal: 'Building & Energy',
      intensity: 'Medium',
      focus: 'Muscle building & Fun',
      icon: 'strength',
      why: 'Many women recover faster in this phase and feel more desire to move.'
    },

    nutrients: [
      { name: 'B-vitamins', description: 'Play a role in energy production and recovery processes.' },
      { name: 'Zinc', description: 'Supports cell renewal and recovery after exertion.' },
      { name: 'Proteins', description: 'Important for building and recovery of muscle tissue.' }
    ],

    nutrition: {
      focus: 'Fuel',
      purpose: 'Support energy',
      timing: 'Carbohydrates for recovery.',
      examples: ['Oatmeal', 'Rice/Pasta', 'Chicken/Fish/Tofu']
    },

    bodySignal: 'Your body handles carbohydrates efficiently for energy.'
  },

  [PHASES.OVULATORY]: {
    name: 'Ovulation',
    label: 'Ovulation',
    colorVar: '--phase-ovulatory',

    validation: 'This is a phase in which many women feel powerful and confident.',
    explanation: 'Hormones peak, which is often accompanied by more available energy.',
    bullets: [
      'More power and self-confidence',
      'Focus and movement often feel easier',
      'Higher social energy',
      'More drive or motivation',
      'Some experience a slight rise in body temperature',
      'This energy can be pleasant to tackle things or challenge yourself a little more.'
    ],
    phaseClosing: 'Use your energy consciously, not to exhaustion.',

    intro: 'Your body is in a natural peak of energy.',
    overview: 'You are now in the ovulatory phase. You are in your natural energy peak and at your strongest.',
    closing: 'Use this energy in a way that suits you.',
    context: 'Hormonal peak.',
    loadCapacity: 'Physically and mentally strong.',

    training: {
      title: 'Movement that can work well in this phase',
      subtitle: 'More power & energy',
      description: 'Many women experience more power and motivation in this phase. If you feel like challenging yourself, it can feel easier now.',
      types: ['HIIT', 'Compounds', 'Running'],
      goal: 'Power & Peak',
      intensity: 'High',
      focus: 'Challenging yourself',
      icon: 'strength',
      why: 'Many women experience more power and motivation in this phase.'
    },

    nutrients: [
      { name: 'Antioxidants (vitamin C and E)', description: 'Support the body during higher activity and recovery.' },
      { name: 'Omega-3 fatty acids', description: 'Can contribute to recovery with more intensive movement.' },
      { name: 'Fiber-rich food', description: 'Contributes to a stable digestion and balance.' }
    ],

    nutrition: {
      focus: 'Support',
      purpose: 'Cover high consumption',
      timing: 'Sufficient fuel around movement.',
      examples: ['Fast carbs', 'Protein-rich food']
    },

    bodySignal: 'High energy, but pay attention to stability during heavy lifting.'
  },

  [PHASES.LUTEAL]: {
    name: 'Luteal',
    label: 'Luteal Phase',
    colorVar: '--phase-luteal',

    validation: 'It is normal if you feel a bit slower, more sensitive or fuller more quickly now.',
    explanation: 'Progesterone rises and your body gradually switches to more rest and recovery.',
    bullets: [
      'More likely to retain fluid or feel bloated',
      'Increase in hunger or cravings',
      'More easily overstimulated or less stress resistant',
      'A little more structure in meals, eating enough and a slower pace can help now.'
    ],
    phaseClosing: 'Slowing down says nothing about your commitment or discipline.',

    intro: 'Your body is preparing for rest. That requires more from your system.',
    overview: 'You are now in the luteal phase. Your body is preparing for rest. Less energy is normal.',
    closing: 'This does not mean you are doing something wrong. Your body is simply retaining more now.',
    context: 'Energy slows down.',
    loadCapacity: 'Time for rounding off.',

    training: {
      title: 'Movement that helps your body now',
      subtitle: 'Maintenance & Balance',
      description: 'In this phase it often feels better to move with a focus on consistency, not records.',
      types: ['Pilates', 'Steady cardio', 'Technique'],
      goal: 'Maintenance & Balance',
      intensity: 'By feel',
      focus: 'Listening to your body',
      icon: 'light',
      why: 'In this phase it often feels better to move with a focus on consistency, not records.'
    },

    nutrients: [
      { name: 'Magnesium', description: 'Is often mentioned in relation to relaxation and stimulus sensitivity.' },
      { name: 'Vitamin B6', description: 'Plays a role in hormonal processes in the body.' },
      { name: 'Complex carbohydrates', description: 'Can help with stable energy and satiety.' }
    ],

    nutrition: {
      focus: 'Satiety',
      purpose: 'Blood sugar balance',
      timing: 'Eating regularly against cravings.',
      examples: ['Sweet potato', 'Nuts/Avocado', 'Dark chocolate']
    },

    bodySignal: 'Your metabolism is slightly higher. Healthy fats satisfy the appetite.'
  }
}

export const getPhaseContent = (language, phase) => {
  const dict = language === 'en' ? PHASE_CONTENT_EN : PHASE_CONTENT_NL;
  return phase ? dict[phase] : dict;
}

// Keep a default for backward compatibility where needed (will use NL as default if not updated yet)
export const PHASE_CONTENT = PHASE_CONTENT_NL;

