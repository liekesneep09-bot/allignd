import fs from 'fs';

// Accurate fiber mapping per 100g for the 253 items
// If a food is missing from the explicit map, it will get 0.0
const fiberMap = {
    // GROENTEN
    'v1': 0.6, // Komkommer
    'v2': 1.2, // Tomaat
    'v3': 2.1, // Paprika
    'v4': 2.6, // Broccoli rauw
    'v4b': 2.6, // Broccoli bereid
    'v5': 2.7, // Sperziebonen rauw
    'v5b': 2.7, // Sperziebonen bereid
    'v6': 2.2, // Spinazie rauw
    'v6b': 2.2, // Spinazie bereid
    'v7': 2.8, // Wortel rauw
    'v7b': 2.8, // Wortel bereid
    'v8': 1.0, // Courgette
    'v9': 3.0, // Aubergine
    'v10': 2.0, // Bloemkool gekookt
    'v11': 1.2, // Ijsbergsla
    'v12': 1.6, // Rucola
    'v13': 1.7, // Ui
    'v14': 1.0, // Champignons
    'v15': 3.0, // Zoete aardappel
    'v16': 1.8, // Aardappel gekookt
    'v17': 0.5, // Pompoen
    'v18': 5.5, // Doperwten
    'v19': 2.0, // Mais blik
    'v20': 3.1, // Witlof
    'v21': 2.1, // Asperges groen
    'v22': 4.1, // Boerenkool rauw
    'v23': 3.8, // Spruitjes gekookt
    'v24': 1.6, // Radijs
    'v25': 1.8, // Prei
    'v26': 1.6, // Selderij
    'v27': 2.8, // Rode biet
    'v28': 2.5, // Witkool
    'v29': 3.2, // Snijbonen
    'v30': 2.1, // Knoflook

    // FRUIT
    'fr1': 2.6, // Banaan
    'fr2': 2.4, // Appel
    'fr3': 3.1, // Peer
    'fr4': 2.4, // Blauwe bessen
    'fr5': 2.0, // Aardbeien
    'fr6': 6.5, // Frambozen
    'fr7': 2.4, // Sinaasappel
    'fr8': 1.8, // Mandarijn
    'fr9': 0.9, // Druiven
    'fr10': 3.0, // Kiwi
    'fr11': 1.6, // Mango
    'fr12': 1.4, // Ananas
    'fr13': 0.8, // Meloen (Galia)
    'fr14': 0.4, // Watermeloen
    'fr15': 1.5, // Perzik
    'fr16': 1.4, // Pruim
    'fr17': 6.7, // Avocado
    'fr18': 2.8, // Citroen
    'fr19': 2.1, // Kersen
    'fr20': 1.6, // Grapefruit
    'fr21': 2.8, // Limoen
    'fr22': 1.5, // Nectarine
    'fr23': 10.4, // Passievrucht
    'fr24': 4.0, // Granaatappel
    'fr25': 5.3, // Bramen
    'fr26': 2.9, // Vijgen
    'fr27': 8.0, // Dadels gedroogd
    'fr28': 3.7, // Rozijnen
    'fr29': 2.0, // Abrikoos
    'fr30': 1.7, // Papaya

    // BASICS KOOLHYDRATEN
    'c1a': 1.3, // Rijst wit droog
    'c1': 0.4,  // Rijst wit gekookt
    'c2a': 3.5, // Zilvervlies droog
    'c2': 1.8,  // Zilvervlies gekookt
    'c3a': 3.2, // Pasta wit droog
    'c3': 1.2,  // Pasta wit gekookt
    'c4a': 8.0, // Volkoren pasta droog
    'c4': 4.5,  // Volkoren pasta gekookt
    'c5': 10.6, // Havermout
    'c6': 6.0,  // Volkorenbrood
    'c7': 2.7,  // Witbrood
    'c8': 7.5,  // Volkorenbeschuit
    'c9': 10.0, // Volkorencracker
    'c10': 1.4, // Couscous bereid
    'c11': 2.8, // Quinoa bereid
    'c12': 2.0, // Wrap
    'c13': 9.0, // Muesli
    'c14': 8.0, // Granola
    'c15': 3.0, // Rijstwafel
    'c16': 10.0, // Boekweit
    'c17': 4.5, // Bulgur bereid
    'c18': 3.8, // Parelgort bereid
    'c19': 1.2, // Mie
    'c20': 1.2, // Udon
    'c21': 4.0, // Soba
    'c22': 5.5, // Speltbrood
    'c23': 12.0, // Roggebrood
    'c24': 2.6, // Croissant
    'c25': 3.0, // Stokbrood
    'c26': 4.0, // Wortel wrap
    'c27': 8.5, // Volkoren wrap

    // EIWITBRONNEN (Vlees, vis, vega, bonen)
    'p11': 2.3, // Tofu
    'p12': 8.5, // Tempeh
    'p13': 7.9, // Linzen gekookt
    'p14': 7.6, // Kikkererwten
    'p15': 4.5, // Vega gehakt
    'p28': 5.2, // Edamame
    'p29': 6.5, // Bruine bonen
    'p30': 6.4, // Kidneybonen
    'p31': 8.7, // Zwarte bonen
    'p32': 6.3, // Cannellini
    'p33': 6.0, // Falafel
    'p34': 5.0, // Vegaburger
    'p35': 3.0, // Valess
    'p27': 0.6, // Seitan
    'p19': 2.0, // Vegan protein

    // DIARY
    'd7': 0.4, // Amandelmelk
    'd8': 0.6, // Sojamelk
    'd9': 0.8, // Havermelk

    // VETTEN / NOTEN
    'f4': 8.0,  // Pindakaas
    'f5': 12.5, // Amandelen
    'f6': 6.7,  // Walnoten
    'f7': 3.3,  // Cashews
    'f8': 8.5,  // Pindas
    'f9': 27.3, // Lijnzaad
    'f10': 34.4, // Chiazaad
    'f11': 8.6, // Zonnebloempitten
    'f13': 1.8, // Pesto
    'f14': 4.0, // Hummus
    'f15': 9.7, // Hazelnoten
    'f16': 9.6, // Pecans
    'f17': 10.6, // Pistachenoten
    'f18': 8.6, // Macadamia
    'f19': 6.0, // Pompoenpitten
    'f20': 11.8, // Sesamzaad
    'f24': 5.0, // Guacamole
    'f25': 9.3, // Tahin

    // SNACKS
    's1': 11.0, // Puur choc
    's2': 3.4,  // Melkchoc
    's3': 14.5, // Popcorn
    's4': 4.8,  // Chips naturel
    's8': 3.5,  // Ontbijtkoek
    's9': 2.5,  // Speculaas
    's10': 1.5, // Eierkoek
    's11': 6.0, // Mueslireep
    's12': 3.0, // Digestive
    's13': 1.5, // Stroopwafel
    's19': 1.8, // Gevulde koek
    's20': 1.5, // Bitterbal
    's21': 2.5, // Frikandel
    's22': 2.0, // Kroket
    's23': 2.0, // Kaassouffle
    's38': 1.5, // Tiramisu
    's39': 1.2, // Cheesecake
    's40': 2.5, // Brownie
    's41': 1.5, // Muffin
    's42': 1.8, // Donut
    's43': 2.0, // Pannenkoek
    's44': 1.5, // Poffertjes
    's45': 2.5  // Luikse wafel
};

// Regex to capture the whole food object line up to `fat_100: ... }`
// Because of my prev script, some lines might have exact matches, let's just make sure we insert `fiber_100: ...` right before the closing brace.
let content = fs.readFileSync('src/data/foods.js', 'utf8');

const updatedContent = content.replace(/({ id: '([^']+)',[^}]+fat_100: [\d\.]+ )\}/g, (match, beforeClose, id) => {
    // If it already has fiber_100, do not append again
    if (match.includes('fiber_100')) return match;
    
    // Lookup fiber or default to 0
    const fiberVal = fiberMap[id] !== undefined ? fiberMap[id] : 0;
    
    return `${beforeClose}, fiber_100: ${fiberVal} }`;
});

fs.writeFileSync('src/data/foods.js', updatedContent);
console.log('Added fiber_100 to foods database!');
