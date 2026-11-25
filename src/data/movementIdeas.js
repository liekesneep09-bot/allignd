export const movementPhases = {
  "menstrual": {
    "title": [
      "Kies je tempo bij de start.",
      "Find your starting pace."
    ],
    "lesson": [
      "Heb je kramp, kies dan iets wat je makkelijk kunt inkorten. Voel je je goed? Je vertrouwde training kan ook.",
      "If you have cramps, choose something easy to shorten. Feeling good? Your usual workout is an option too."
    ],
    "forms": [
      "mobility",
      "walk",
      "strength"
    ],
    "source": [
      "Cochrane · Bewegen bij menstruatiepijn",
      "https://doi.org/10.1002/14651858.CD004142.pub4"
    ]
  },
  "follicular": {
    "title": [
      "Vind je ritme weer.",
      "Find your rhythm again."
    ],
    "lesson": [
      "Na je menstruatie stijgt je oestrogeen meestal richting de eisprong. Een bekende oefening helpt je voelen welke belasting vandaag past.",
      "Oestrogen usually rises towards ovulation. A familiar exercise can help you find a comfortable effort today."
    ],
    "forms": [
      "strength",
      "cardio",
      "dance"
    ],
    "source": [
      "NHS · Hoe werkt de menstruatiecyclus?",
      "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/"
    ]
  },
  "ovulatory": {
    "title": [
      "Waar heb je zin in?",
      "What sounds good today?"
    ],
    "lesson": [
      "Veel vrouwen merken weinig van de eisprong. Kies een activiteit die je leuk vindt en gebruik je warming-up om je tempo te vinden.",
      "Many people barely notice ovulation. Pick an activity you enjoy and use the warm-up to find your pace."
    ],
    "forms": [
      "dance",
      "strength",
      "walk"
    ],
    "source": [
      "NHS · Pijn rond de eisprong",
      "https://www.nhs.uk/symptoms/ovulation-pain/"
    ]
  },
  "luteal": {
    "title": [
      "Houd je eigen ritme.",
      "Keep your own rhythm."
    ],
    "lesson": [
      "Voor je menstruatie kun je sneller moe zijn. Een vertrouwde sessie kan dan fijn voelen. Heb je veel energie? Ga gerust voor je gewone training.",
      "You may tire more easily before your period. A familiar session can feel good. If you feel energetic, follow your usual routine."
    ],
    "forms": [
      "pilates",
      "cardio",
      "strength"
    ],
    "source": [
      "NHS · Premenstruele klachten",
      "https://www.nhs.uk/conditions/pre-menstrual-syndrome/"
    ]
  }
}

export const movementForms = {
  "nl": {
    "strength": {
      "name": "Vertrouwde krachttraining",
      "description": "Kies bekende oefeningen. Zo voel je tijdens je eerste set of je het gewicht of het aantal sets wilt aanpassen.",
      "examples": "Squat · Roeibeweging · Heupbrug",
      "sessions": [
        [
          "8 min",
          "Eén rustige ronde",
          "Begin met rustig lopen. Doe één comfortabele set squats en één set heupbruggen."
        ],
        [
          "18 min",
          "Twee vertrouwde oefeningen",
          "Warm rustig op. Doe twee sets van een squat en een roeibeweging met je gebruikelijke weerstand. Rust tussen de sets."
        ],
        [
          "30 min",
          "Je gewone krachtsessie",
          "Warm op en volg je vertrouwde schema. Kies het gewicht op basis van je eerste set."
        ]
      ]
    },
    "pilates": {
      "name": "Pilates",
      "description": "Een rustige reeks op de mat is fijn als je aandacht wilt geven aan controle en ademhaling.",
      "examples": "Bird dog · Bekkenkanteling · Heupbrug",
      "sessions": [
        [
          "5 min",
          "Een moment op de mat",
          "Kantel je bekken rustig terwijl je op je rug ligt. Voeg een paar heupbruggen toe."
        ],
        [
          "12 min",
          "Een rustige matserie",
          "Wissel bekkenkantelingen en heupbruggen af. Eindig op handen en knieën en strek om beurten één been."
        ],
        [
          "20 min",
          "Je favoriete pilatesreeks",
          "Begin met bekkenkantelingen. Bouw op naar bird dogs en heupbruggen en herhaal de reeks op je eigen tempo."
        ]
      ]
    },
    "cardio": {
      "name": "Cardio op gelijkmatig tempo",
      "description": "Kies dit als je lekker wilt doorbewegen zonder steeds te versnellen.",
      "examples": "Loopband · Stairmaster · Crosstrainer · Hometrainer",
      "sessions": [
        [
          "6 min",
          "Rustig op de crosstrainer",
          "Start met weinig weerstand en beweeg een paar minuten op een comfortabel tempo."
        ],
        [
          "15 min",
          "Loopband op praattempo",
          "Wandel eerst rustig op de loopband. Kies daarna een tempo of lichte helling waarbij je nog kunt praten."
        ],
        [
          "25 min",
          "Een sessie op de stairmaster",
          "Begin op een lage stand. Zoek een gelijkmatig stapritme en schakel terug als je ademhaling te snel gaat."
        ]
      ]
    },
    "walk": {
      "name": "Wandelen",
      "description": "Een korte lus maakt het makkelijk om onderweg te kiezen of je verder wilt.",
      "examples": "Ommetje · Parkronde · Stevig wandelen",
      "sessions": [
        [
          "5 min",
          "Een frisse neus",
          "Loop tot het einde van je straat en terug."
        ],
        [
          "15 min",
          "Een rondje dichtbij",
          "Kies een vertrouwde route en loop in een prettig ritme."
        ],
        [
          "25 min",
          "Een stevige wandeling",
          "Begin op je gemak. Wandel het middenstuk vlot en eindig rustig."
        ]
      ]
    },
    "mobility": {
      "name": "Rustige mobiliteit",
      "description": "Kleine bewegingen kun je makkelijk aanpassen aan wat prettig voelt.",
      "examples": "Schouderrollen · Heupcirkels · Rug bewegen",
      "sessions": [
        [
          "4 min",
          "Even losmaken",
          "Rol je schouders en draai je heupen in kleine cirkels."
        ],
        [
          "8 min",
          "Van schouders tot heupen",
          "Wissel schouderrollen, heupcirkels en rustig buigen en strekken van je rug af."
        ],
        [
          "12 min",
          "Een vloeiende reeks",
          "Maak je schouders en heupen los. Herhaal je favoriete bewegingen in een rustig ritme."
        ]
      ]
    },
    "dance": {
      "name": "Dans",
      "description": "Met muziek kies je zelf hoe lang en hoe intensief je beweegt.",
      "examples": "Vrij dansen · Danspas oefenen · Danswork-out",
      "sessions": [
        [
          "4 min",
          "Eén favoriet nummer",
          "Zet een liedje op en stap rustig mee."
        ],
        [
          "12 min",
          "Een paar nummers voor jezelf",
          "Begin met een rustig nummer en beweeg daarna mee op je favoriete muziek."
        ],
        [
          "20 min",
          "Een korte danssessie",
          "Begin rustig, bouw op met een paar vlotte nummers en eindig met een langzamer lied."
        ]
      ]
    }
  },
  "en": {
    "strength": {
      "name": "Familiar strength training",
      "description": "Start with a familiar exercise and use the first set to choose your weight.",
      "examples": "Squat · Row · Glute bridge",
      "sessions": [
        [
          "8 min",
          "One easy round",
          "Warm up with a short walk. Try a comfortable set of squats and one set of glute bridges."
        ],
        [
          "18 min",
          "Two familiar exercises",
          "Warm up, then try two sets of squats and rows. Rest between sets."
        ],
        [
          "30 min",
          "Your usual strength session",
          "Warm up and follow your usual programme. Let the first set guide the weight."
        ]
      ]
    },
    "pilates": {
      "name": "Pilates",
      "description": "A mat sequence lets you focus on control and breathing.",
      "examples": "Bird dog · Pelvic tilt · Glute bridge",
      "sessions": []
    },
    "cardio": {
      "name": "Steady cardio",
      "description": "Choose a comfortable pace you can maintain.",
      "examples": "Treadmill · Stair climber · Elliptical · Exercise bike",
      "sessions": [
        [
          "6 min",
          "Easy elliptical",
          "Start with low resistance and move at a comfortable pace."
        ],
        [
          "15 min",
          "Treadmill walk",
          "Start slowly. Choose a pace or gentle incline that still lets you talk."
        ],
        [
          "25 min",
          "Stair climber session",
          "Start on a low setting. Find a steady rhythm and reduce the level if needed."
        ]
      ]
    },
    "walk": {
      "name": "Walking",
      "description": "A short loop makes it easy to adjust your distance.",
      "examples": "Short walk · Park loop · Brisk walk",
      "sessions": [
        [
          "5 min",
          "Fresh air",
          "Walk to the end of your street and back."
        ],
        [
          "15 min",
          "A local loop",
          "Pick a familiar route and a comfortable pace."
        ],
        [
          "25 min",
          "A brisk walk",
          "Start easy, walk briskly in the middle and slow down to finish."
        ]
      ]
    },
    "mobility": {
      "name": "Gentle mobility",
      "description": "Keep the movements small and comfortable.",
      "examples": "Shoulder rolls · Hip circles · Back stretches",
      "sessions": []
    },
    "dance": {
      "name": "Dance",
      "description": "Pick the music and set your own intensity.",
      "examples": "Freestyle · Dance steps · Dance workout",
      "sessions": [
        [
          "4 min",
          "One favourite song",
          "Put on a song and step to the beat."
        ],
        [
          "12 min",
          "A few songs to yourself",
          "Start with a slow track and move to your favourite music."
        ],
        [
          "20 min",
          "A short dance session",
          "Build up gradually with faster songs, then finish with a slower track."
        ]
      ]
    }
  }
}
