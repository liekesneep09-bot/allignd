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
        description: 'Kan helpen bij het aanvullen van wat je lichaam verliest tijdens de menstruatie.',
        sources: [
          { food: 'Rood vlees' },
          { food: 'Spinazie' },
          { food: 'Linzen' },
          { food: 'Pompoenpitten' },
          { food: 'Tofu' },
          { food: 'Zwarte bonen' },
          { food: 'Quinoa' }
        ]
      },
      {
        name: 'Vitamine C',
        icon: 'C',
        description: 'Ondersteunt de opname van ijzer in het lichaam.',
        sources: [
          { food: 'Paprika' },
          { food: 'Sinaasappel' },
          { food: 'Broccoli' },
          { food: 'Aardbeien' },
          { food: 'Kiwi' },
          { food: 'Spruitjes' }
        ]
      },
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Wordt vaak gelinkt aan ontspanning van spieren en het zenuwstelsel.',
        sources: [
          { food: 'Pure chocolade' },
          { food: 'Amandelen' },
          { food: 'Avocado' },
          { food: 'Banaan' },
          { food: 'Pompoenpitten' },
          { food: 'Zwarte bonen' }
        ]
      },
      {
        name: 'Omega-3 vetzuren',
        icon: 'O3',
        description: 'Kunnen ondersteunend zijn bij ontstekingsprocessen in het lichaam.',
        sources: [
          { food: 'Zalm' },
          { food: 'Makreel' },
          { food: 'Walnoten' },
          { food: 'Lijnzaad' },
          { food: 'Chiazaad' },
          { food: 'Hennepzaad' },
          { food: 'Edamame' },
          { food: 'Zeewier' }
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
        description: 'Spelen een rol in energieproductie en herstelprocessen in het lichaam.',
        sources: [
          { food: 'Eieren' },
          { food: 'Havermout' },
          { food: 'Kikkererwten' },
          { food: 'Zonnebloempitten' },
          { food: 'Edelgistvlokken' },
          { food: 'Spinazie' },
          { food: 'Zwarte bonen' }
        ]
      },
      {
        name: 'Zink',
        icon: 'Zn',
        description: 'Ondersteunt celvernieuwing en herstel na inspanning.',
        sources: [
          { food: 'Rundvlees' },
          { food: 'Pompoenpitten' },
          { food: 'Cashewnoten' },
          { food: 'Tempeh' },
          { food: 'Hennepzaad' },
          { food: 'Linzen' },
          { food: 'Quinoa' }
        ]
      },
      {
        name: 'Eiwitten',
        icon: 'P',
        description: 'Belangrijk voor de opbouw en het herstel van spierweefsel.',
        sources: [
          { food: 'Kipfilet' },
          { food: 'Griekse yoghurt' },
          { food: 'Eieren' },
          { food: 'Kwark' },
          { food: 'Tofu' },
          { food: 'Linzen' },
          { food: 'Edamame' },
          { food: 'Kikkererwten' },
          { food: 'Seitan' },
          { food: 'Quinoa' }
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
      types: ['HIIT', 'Compounds', 'Running'],
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
        description: 'Ondersteunen het lichaam bij hogere activiteit en dragen bij aan herstel.',
        sources: [
          { food: 'Bosbessen' },
          { food: 'Paprika' },
          { food: 'Groene thee' },
          { food: 'Tomaten' },
          { food: 'Pecannoten' },
          { food: 'Pure chocolade' }
        ]
      },
      {
        name: 'Omega-3 vetzuren',
        icon: 'O3',
        description: 'Kunnen bijdragen aan herstel bij intensievere beweging en inspanning.',
        sources: [
          { food: 'Zalm' },
          { food: 'Makreel' },
          { food: 'Walnoten' },
          { food: 'Chiazaad' },
          { food: 'Lijnzaad' },
          { food: 'Hennepzaad' },
          { food: 'Edamame' },
          { food: 'Zeewier' }
        ]
      },
      {
        name: 'Vezels',
        icon: 'VZ',
        description: 'Dragen bij aan een stabiele spijsvertering en een goede balans in je lichaam.',
        sources: [
          { food: 'Quinoa' },
          { food: 'Kikkererwten' },
          { food: 'Broccoli' },
          { food: 'Appel' },
          { food: 'Havermout' },
          { food: 'Chiazaad' }
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
        description: 'Wordt vaak genoemd in relatie tot ontspanning en prikkelgevoeligheid.',
        sources: [
          { food: 'Pure chocolade' },
          { food: 'Amandelen' },
          { food: 'Spinazie' },
          { food: 'Avocado' },
          { food: 'Pompoenpitten' },
          { food: 'Zwarte bonen' }
        ]
      },
      {
        name: 'Vitamine B6',
        icon: 'B6',
        description: 'Speelt een rol in hormonale processen en de aanmaak van serotonine in het lichaam.',
        sources: [
          { food: 'Kip' },
          { food: 'Banaan' },
          { food: 'Aardappel' },
          { food: 'Zonnebloempitten' },
          { food: 'Kikkererwten' },
          { food: 'Walnoten' },
          { food: 'Spinazie' }
        ]
      },
      {
        name: 'Complexe koolhydraten',
        icon: 'KH',
        description: 'Kunnen helpen bij stabiele energie en een langer verzadigd gevoel.',
        sources: [
          { food: 'Zoete aardappel' },
          { food: 'Havermout' },
          { food: 'Zilvervliesrijst' },
          { food: 'Linzen' },
          { food: 'Quinoa' },
          { food: 'Zwarte bonen' }
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
        description: 'Can help replenish what your body loses during menstruation.',
        sources: [
          { food: 'Red meat' },
          { food: 'Spinach' },
          { food: 'Lentils' },
          { food: 'Pumpkin seeds' },
          { food: 'Tofu' },
          { food: 'Black beans' },
          { food: 'Quinoa' }
        ]
      },
      {
        name: 'Vitamin C',
        icon: 'C',
        description: 'Supports the absorption of iron in the body.',
        sources: [
          { food: 'Bell pepper' },
          { food: 'Orange' },
          { food: 'Broccoli' },
          { food: 'Strawberries' },
          { food: 'Kiwi' },
          { food: 'Brussels sprouts' }
        ]
      },
      {
        name: 'Magnesium',
        icon: 'Mg',
        description: 'Is often linked to relaxation of muscles and the nervous system.',
        sources: [
          { food: 'Dark chocolate' },
          { food: 'Almonds' },
          { food: 'Avocado' },
          { food: 'Banana' },
          { food: 'Pumpkin seeds' },
          { food: 'Black beans' }
        ]
      },
      {
        name: 'Omega-3 fatty acids',
        icon: 'O3',
        description: 'Can be supportive in inflammatory processes in the body.',
        sources: [
          { food: 'Salmon' },
          { food: 'Mackerel' },
          { food: 'Walnuts' },
          { food: 'Flaxseed' },
          { food: 'Chia seeds' },
          { food: 'Hemp seeds' },
          { food: 'Edamame' },
          { food: 'Seaweed' }
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
        description: 'Play a role in energy production and recovery processes in the body.',
        sources: [
          { food: 'Eggs' },
          { food: 'Oatmeal' },
          { food: 'Chickpeas' },
          { food: 'Sunflower seeds' },
          { food: 'Nutritional yeast' },
          { food: 'Spinach' },
          { food: 'Black beans' }
        ]
      },
      {
        name: 'Zinc',
        icon: 'Zn',
        description: 'Supports cell renewal and recovery after exertion.',
        sources: [
          { food: 'Beef' },
          { food: 'Pumpkin seeds' },
          { food: 'Cashews' },
          { food: 'Tempeh' },
          { food: 'Hemp seeds' },
          { food: 'Lentils' },
          { food: 'Quinoa' }
        ]
      },
      {
        name: 'Proteins',
        icon: 'P',
        description: 'Important for the building and recovery of muscle tissue.',
        sources: [
          { food: 'Chicken breast' },
          { food: 'Greek yogurt' },
          { food: 'Eggs' },
          { food: 'Cottage cheese' },
          { food: 'Tofu' },
          { food: 'Lentils' },
          { food: 'Edamame' },
          { food: 'Chickpeas' },
          { food: 'Seitan' },
          { food: 'Quinoa' }
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
      types: ['HIIT', 'Compounds', 'Running'],
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
        description: 'Support the body during higher activity and contribute to recovery.',
        sources: [
          { food: 'Blueberries' },
          { food: 'Bell pepper' },
          { food: 'Green tea' },
          { food: 'Tomatoes' },
          { food: 'Pecans' },
          { food: 'Dark chocolate' }
        ]
      },
      {
        name: 'Omega-3 fatty acids',
        icon: 'O3',
        description: 'Can contribute to recovery with more intensive movement and exertion.',
        sources: [
          { food: 'Salmon' },
          { food: 'Mackerel' },
          { food: 'Walnuts' },
          { food: 'Chia seeds' },
          { food: 'Flaxseed' },
          { food: 'Hemp seeds' },
          { food: 'Edamame' },
          { food: 'Seaweed' }
        ]
      },
      {
        name: 'Fiber',
        icon: 'VZ',
        description: 'Contributes to a stable digestion and a good balance in your body.',
        sources: [
          { food: 'Quinoa' },
          { food: 'Chickpeas' },
          { food: 'Broccoli' },
          { food: 'Apple' },
          { food: 'Oatmeal' },
          { food: 'Chia seeds' }
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
        description: 'Is often mentioned in relation to relaxation and stimulus sensitivity.',
        sources: [
          { food: 'Dark chocolate' },
          { food: 'Almonds' },
          { food: 'Spinach' },
          { food: 'Avocado' },
          { food: 'Pumpkin seeds' },
          { food: 'Black beans' }
        ]
      },
      {
        name: 'Vitamin B6',
        icon: 'B6',
        description: 'Plays a role in hormonal processes and the production of serotonin in the body.',
        sources: [
          { food: 'Chicken' },
          { food: 'Banana' },
          { food: 'Potato' },
          { food: 'Sunflower seeds' },
          { food: 'Chickpeas' },
          { food: 'Walnuts' },
          { food: 'Spinach' }
        ]
      },
      {
        name: 'Complex carbohydrates',
        icon: 'KH',
        description: 'Can help with stable energy and a longer feeling of satiety.',
        sources: [
          { food: 'Sweet potato' },
          { food: 'Oatmeal' },
          { food: 'Brown rice' },
          { food: 'Lentils' },
          { food: 'Quinoa' },
          { food: 'Black beans' }
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

