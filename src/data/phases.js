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
      {
        name: 'IJzer',
        icon: 'Fe',
        description: 'Vult aan wat je verliest.',
        sources: [
          { food: 'Rood vlees', emoji: '' },
          { food: 'Spinazie', emoji: '🌿' },
          { food: 'Linzen', emoji: '' },
          { food: 'Pompoenpitten', emoji: '🎃' },
          { food: 'Tofu', emoji: '🧈' },
          { food: 'Zwarte bonen', emoji: '🫘' },
          { food: 'Quinoa', emoji: '🌾' }
        ]
      },
      {
        name: 'Vitamine C',
        icon: 'C',
        description: 'Helpt je lichaam ijzer opnemen.',
        sources: [
          { food: 'Paprika', emoji: '' },
          { food: 'Sinaasappel', emoji: '🍊' },
          { food: 'Broccoli', emoji: '🥦' },
          { food: 'Aardbeien', emoji: '🍓' },
          { food: 'Kiwi', emoji: '🥝' },
          { food: 'Spruitjes', emoji: '🥬' }
        ]
      },
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Kalmeert je zenuwstelsel.',
        sources: [
          { food: 'Pure chocolade', emoji: '🍫' },
          { food: 'Amandelen', emoji: '🌰' },
          { food: 'Avocado', emoji: '' },
          { food: 'Banaan', emoji: '🍌' },
          { food: 'Pompoenpitten', emoji: '🎃' },
          { food: 'Zwarte bonen', emoji: '🫘' }
        ]
      },
      {
        name: 'Omega-3',
        icon: 'O3',
        description: 'Verzacht ontstekingen.',
        sources: [
          { food: 'Zalm', emoji: '' },
          { food: 'Makreel', emoji: '🐟' },
          { food: 'Walnoten', emoji: '' },
          { food: 'Lijnzaad', emoji: '🌱' },
          { food: 'Chiazaad', emoji: '🌱' },
          { food: 'Hennepzaad', emoji: '🌱' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Zeewier', emoji: '🌊' }
        ]
      }
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
      {
        name: 'B-vitamines',
        icon: 'B',
        description: 'Geven je lichaam energie.',
        sources: [
          { food: 'Eieren', emoji: '' },
          { food: 'Havermout', emoji: '🥣' },
          { food: 'Kikkererwten', emoji: '🫘' },
          { food: 'Zonnebloempitten', emoji: '🌻' },
          { food: 'Edelgistvlokken', emoji: '🧀' },
          { food: 'Spinazie', emoji: '🌿' },
          { food: 'Zwarte bonen', emoji: '' }
        ]
      },
      {
        name: 'Zink',
        icon: 'Zn',
        description: 'Helpt je spieren herstellen.',
        sources: [
          { food: 'Rundvlees', emoji: '' },
          { food: 'Pompoenpitten', emoji: '🎃' },
          { food: 'Cashewnoten', emoji: '🥜' },
          { food: 'Tempeh', emoji: '🧈' },
          { food: 'Hennepzaad', emoji: '🌱' },
          { food: 'Linzen', emoji: '🫘' },
          { food: 'Quinoa', emoji: '🌾' }
        ]
      },
      {
        name: 'Eiwitten',
        icon: 'P',
        description: 'Bouwen je spieren op.',
        sources: [
          { food: 'Kipfilet', emoji: '' },
          { food: 'Griekse yoghurt', emoji: '🥛' },
          { food: 'Eieren', emoji: '🥚' },
          { food: 'Kwark', emoji: '🥛' },
          { food: 'Tofu', emoji: '🧈' },
          { food: 'Linzen', emoji: '🫘' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Kikkererwten', emoji: '🫘' },
          { food: 'Seitan', emoji: '🧈' },
          { food: 'Quinoa', emoji: '🌾' }
        ]
      }
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
      types: ['HIIT', 'Compound oefeningen', 'Running'],
      goal: 'Kracht & Piek',
      intensity: 'Hoog',
      focus: 'Jezelf uitdagen',
      icon: 'strength',
      why: 'Veel vrouwen ervaren in deze fase meer kracht en motivatie.'
    },

    nutrients: [
      {
        name: 'Antioxidanten',
        icon: 'AO',
        description: 'Beschermen bij hoge activiteit.',
        sources: [
          { food: 'Bosbessen', emoji: '🫐' },
          { food: 'Paprika', emoji: '' },
          { food: 'Groene thee', emoji: '🍵' },
          { food: 'Tomaten', emoji: '🍅' },
          { food: 'Pecannoten', emoji: '🌰' },
          { food: 'Pure chocolade', emoji: '🍫' }
        ]
      },
      {
        name: 'Omega-3',
        icon: 'O3',
        description: 'Herstellen na intensieve training.',
        sources: [
          { food: 'Zalm', emoji: '' },
          { food: 'Makreel', emoji: '🐟' },
          { food: 'Walnoten', emoji: '' },
          { food: 'Chiazaad', emoji: '🌱' },
          { food: 'Lijnzaad', emoji: '' },
          { food: 'Hennepzaad', emoji: '🌱' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Zeewier', emoji: '🌊' }
        ]
      },
      {
        name: 'Vezels',
        icon: 'VZ',
        description: 'Houden je spijsvertering stabiel.',
        sources: [
          { food: 'Quinoa', emoji: '🌾' },
          { food: 'Kikkererwten', emoji: '🫘' },
          { food: 'Broccoli', emoji: '🥦' },
          { food: 'Appel', emoji: '🍎' },
          { food: 'Havermout', emoji: '🥣' },
          { food: 'Chiazaad', emoji: '🌱' }
        ]
      }
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
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Kalmeert je zenuwstelsel en vermindert spanning.',
        sources: [
          { food: 'Pure chocolade', emoji: '🍫' },
          { food: 'Amandelen', emoji: '🌰' },
          { food: 'Spinazie', emoji: '🥬' },
          { food: 'Avocado', emoji: '🥑' },
          { food: 'Pompoenpitten', emoji: '🎃' },
          { food: 'Zwarte bonen', emoji: '' }
        ]
      },
      {
        name: 'Vitamine B6',
        icon: 'B6',
        description: 'Stabiliseert je stemming en ondersteunt serotonine.',
        sources: [
          { food: 'Kip', emoji: '🍗' },
          { food: 'Banaan', emoji: '🍌' },
          { food: 'Aardappel', emoji: '🥔' },
          { food: 'Zonnebloempitten', emoji: '🌻' },
          { food: 'Kikkererwten', emoji: '' },
          { food: 'Walnoten', emoji: '🥜' },
          { food: 'Spinazie', emoji: '' }
        ]
      },
      {
        name: 'Complexe koolhydraten',
        icon: 'KH',
        description: 'Houden je energie stabiel en stillen cravings.',
        sources: [
          { food: 'Zoete aardappel', emoji: '🍠' },
          { food: 'Havermout', emoji: '🥣' },
          { food: 'Zilvervliesrijst', emoji: '' },
          { food: 'Linzen', emoji: '🫘' },
          { food: 'Quinoa', emoji: '🌾' },
          { food: 'Zwarte bonen', emoji: '🫘' }
        ]
      }
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
      {
        name: 'Iron',
        icon: 'Fe',
        description: 'Replenishes what you lose.',
        sources: [
          { food: 'Red meat', emoji: '' },
          { food: 'Spinach', emoji: '🌿' },
          { food: 'Lentils', emoji: '' },
          { food: 'Pumpkin seeds', emoji: '🎃' },
          { food: 'Tofu', emoji: '🧈' },
          { food: 'Black beans', emoji: '🫘' },
          { food: 'Quinoa', emoji: '' }
        ]
      },
      {
        name: 'Vitamin C',
        icon: 'C',
        description: 'Helps your body absorb iron.',
        sources: [
          { food: 'Bell pepper', emoji: '' },
          { food: 'Orange', emoji: '' },
          { food: 'Broccoli', emoji: '🥦' },
          { food: 'Strawberries', emoji: '🍓' },
          { food: 'Kiwi', emoji: '🥝' },
          { food: 'Brussels sprouts', emoji: '🥬' }
        ]
      },
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Calms your nervous system.',
        sources: [
          { food: 'Dark chocolate', emoji: '🍫' },
          { food: 'Almonds', emoji: '🌰' },
          { food: 'Avocado', emoji: '' },
          { food: 'Banana', emoji: '🍌' },
          { food: 'Pumpkin seeds', emoji: '🎃' },
          { food: 'Black beans', emoji: '' }
        ]
      },
      {
        name: 'Omega-3',
        icon: 'O3',
        description: 'Reduces inflammation.',
        sources: [
          { food: 'Salmon', emoji: '' },
          { food: 'Mackerel', emoji: '' },
          { food: 'Walnuts', emoji: '' },
          { food: 'Flaxseed', emoji: '🌱' },
          { food: 'Chia seeds', emoji: '🌱' },
          { food: 'Hemp seeds', emoji: '🌱' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Seaweed', emoji: '🌊' }
        ]
      }
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
      {
        name: 'B-vitamins',
        icon: 'B',
        description: 'Fuel your energy and recovery.',
        sources: [
          { food: 'Eggs', emoji: '🥚' },
          { food: 'Oatmeal', emoji: '🥣' },
          { food: 'Chickpeas', emoji: '🫘' },
          { food: 'Sunflower seeds', emoji: '🌻' },
          { food: 'Nutritional yeast', emoji: '' },
          { food: 'Spinach', emoji: '🌿' },
          { food: 'Black beans', emoji: '' }
        ]
      },
      {
        name: 'Zinc',
        icon: 'Zn',
        description: 'Supports cell renewal and recovery.',
        sources: [
          { food: 'Beef', emoji: '' },
          { food: 'Pumpkin seeds', emoji: '🎃' },
          { food: 'Cashews', emoji: '🥜' },
          { food: 'Tempeh', emoji: '🧈' },
          { food: 'Hemp seeds', emoji: '🌱' },
          { food: 'Lentils', emoji: '🫘' },
          { food: 'Quinoa', emoji: '🌾' }
        ]
      },
      {
        name: 'Proteins',
        icon: 'P',
        description: 'Build and repair muscle.',
        sources: [
          { food: 'Chicken breast', emoji: '🍗' },
          { food: 'Greek yogurt', emoji: '🥛' },
          { food: 'Eggs', emoji: '🥚' },
          { food: 'Cottage cheese', emoji: '🧀' },
          { food: 'Tofu', emoji: '🧈' },
          { food: 'Lentils', emoji: '🫘' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Chickpeas', emoji: '🫘' },
          { food: 'Seitan', emoji: '' },
          { food: 'Quinoa', emoji: '🌾' }
        ]
      }
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
      types: ['HIIT', 'Compound lifts', 'Running'],
      goal: 'Power & Peak',
      intensity: 'High',
      focus: 'Challenging yourself',
      icon: 'strength',
      why: 'Many women experience more power and motivation in this phase.'
    },

    nutrients: [
      {
        name: 'Antioxidants',
        icon: 'AO',
        description: 'Protect your body during peak performance.',
        sources: [
          { food: 'Blueberries', emoji: '🫐' },
          { food: 'Bell pepper', emoji: '' },
          { food: 'Green tea', emoji: '🍵' },
          { food: 'Tomatoes', emoji: '🍅' },
          { food: 'Pecans', emoji: '🥜' },
          { food: 'Dark chocolate', emoji: '🍫' }
        ]
      },
      {
        name: 'Omega-3',
        icon: 'O3',
        description: 'Supports recovery from intense effort.',
        sources: [
          { food: 'Salmon', emoji: '' },
          { food: 'Mackerel', emoji: '' },
          { food: 'Walnuts', emoji: '' },
          { food: 'Chia seeds', emoji: '🌱' },
          { food: 'Flaxseed', emoji: '🌱' },
          { food: 'Hemp seeds', emoji: '🌱' },
          { food: 'Edamame', emoji: '🫘' },
          { food: 'Seaweed', emoji: '🌊' }
        ]
      },
      {
        name: 'Fiber',
        icon: 'VZ',
        description: 'Keeps digestion stable and balanced.',
        sources: [
          { food: 'Quinoa', emoji: '🌾' },
          { food: 'Chickpeas', emoji: '🫘' },
          { food: 'Broccoli', emoji: '🥦' },
          { food: 'Apple', emoji: '🍎' },
          { food: 'Oatmeal', emoji: '🥣' },
          { food: 'Chia seeds', emoji: '🌱' }
        ]
      }
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
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Calms your nervous system and reduces tension.',
        sources: [
          { food: 'Dark chocolate', emoji: '🍫' },
          { food: 'Almonds', emoji: '🌰' },
          { food: 'Spinach', emoji: '' },
          { food: 'Avocado', emoji: '🥑' },
          { food: 'Pumpkin seeds', emoji: '' },
          { food: 'Black beans', emoji: '' }
        ]
      },
      {
        name: 'Vitamin B6',
        icon: 'B6',
        description: 'Stabilizes mood and supports serotonin.',
        sources: [
          { food: 'Chicken', emoji: '🍗' },
          { food: 'Banana', emoji: '🍌' },
          { food: 'Potato', emoji: '' },
          { food: 'Sunflower seeds', emoji: '🌻' },
          { food: 'Chickpeas', emoji: '🫘' },
          { food: 'Walnuts', emoji: '🥜' },
          { food: 'Spinach', emoji: '' }
        ]
      },
      {
        name: 'Complex carbs',
        icon: 'KH',
        description: 'Keep energy stable and curb cravings.',
        sources: [
          { food: 'Sweet potato', emoji: '' },
          { food: 'Oatmeal', emoji: '🥣' },
          { food: 'Brown rice', emoji: '' },
          { food: 'Lentils', emoji: '🫘' },
          { food: 'Quinoa', emoji: '🌾' },
          { food: 'Black beans', emoji: '' }
        ]
      }
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

export const getPhaseContent = (language, phase, dietaryPreference = 'everything') => {
  const dict = language === 'en' ? PHASE_CONTENT_EN : PHASE_CONTENT_NL;
  if (!phase) {
    const adaptedDict = {};
    for (const p of Object.keys(dict)) {
      adaptedDict[p] = adaptPhaseContent(dict[p], dietaryPreference);
    }
    return adaptedDict;
  }
  return adaptPhaseContent(dict[phase], dietaryPreference);
}

function adaptPhaseContent(content, dietaryPreference) {
  if (!content || !content.nutrients) {
    return content;
  }
  
  const adapted = { ...content };
  
  adapted.nutrients = content.nutrients.map(nutrient => {
    if (!nutrient.sources) return nutrient;
    
    let filteredSources = nutrient.sources;
    
    if (dietaryPreference !== 'everything') {
      filteredSources = nutrient.sources.filter(source => {
        const foodLower = source.food.toLowerCase();
        
        const isAnimalMeat = [
          'vlees', 'meat', 'zalm', 'salmon', 'makreel', 'mackerel', 
          'kip', 'chicken', 'kalkoen', 'turkey', 'biefstuk', 'steak', 
          'vis', 'fish', 'tonijn', 'tuna', 'rundergehakt', 'kipgehakt', 
          'ground beef', 'chicken mince', 'kabeljauw', 'cod', 'witvis', 
          'white fish', 'oesters', 'oysters', 'bone broth', 'bottenbouillon'
        ].some(keyword => foodLower.includes(keyword));
        
        if (isAnimalMeat) return false;
        
        if (dietaryPreference === 'vegan') {
          const isAnimalByproduct = [
            'eieren', 'eggs', 'ei', 'egg', 'yoghurt', 'yogurt', 'kwark', 
            'quark', 'feta', 'mozzarella', 'kaas', 'cheese', 'hüttenkäse', 
            'cottage cheese', 'kefir', 'honing', 'honey'
          ].some(keyword => foodLower.includes(keyword));
          
          if (isAnimalByproduct) return false;
        }
        
        return true;
      });
    }
    
    return {
      ...nutrient,
      sources: filteredSources.slice(0, 6)
    };
  });
  
  return adapted;
}

// Keep a default for backward compatibility where needed (will use NL as default if not updated yet)
export const PHASE_CONTENT = PHASE_CONTENT_NL;

