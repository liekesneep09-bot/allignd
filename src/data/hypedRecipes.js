import { PHASES } from '../logic/cycle'

export const HYPED_RECIPES_NL = {
    [PHASES.MENSTRUAL]: {
        ontbijt: {
            title: 'Warme Golden Milk Chia Pudding',
            emoji: '💛',
            explanation: 'Helemaal trendy en wetenschappelijk een topper: kurkuma werkt krachtig ontstekingsremmend (ideaal tegen krampen) en chia zit vol omega-3.',
            ingredients: ['40g chiazaad', '200ml plantaardige melk', '1 tl kurkuma', 'Snufje zwarte peper (voor opname)', 'Schepje eiwitpoeder (optioneel)'],
            instructions: ['Verwarm de melk lichtjes.', 'Roer de kruiden, chia en eiwitpoeder erdoor.', 'Laat 10-15 minuten indikken.', 'Serveer warm.'],
            macros: { p: 15, c: 25, f: 15, kcal: 295, fiber: 12.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        lunch: {
            title: 'Bone Broth Ramen met ei en spinazie',
            emoji: '🍜',
            explanation: 'Bone broth (bottenbouillon) is extreem populair vanwege collageen en mineralen. Helpt om je tekorten aan te vullen tijdens je menstruatie.',
            ingredients: ['250ml bone broth (of runderbouillon)', '50g ramen noedels', '1 zachtgekookt ei', 'Handvol verse spinazie', 'Paddenstoelen'],
            instructions: ['Verwarm de bouillon en kook de noedels erin gaar.', 'Kook intussen het ei 6 minuten.', 'Voeg op het laatst de spinazie en paddenstoelen toe aan de bouillon.', 'Giet in een kom en leg het gehalveerde ei erop.'],
            macros: { p: 20, c: 40, f: 10, kcal: 330, fiber: 4.2 },
            suitability: ['maintain', 'gain_muscle']
        },
        diner: {
            title: 'Miso-glazed Zalm met groene asperges',
            emoji: '🍣',
            explanation: 'Gefermenteerde miso ondersteunt je darmen (die nu soms van slag zijn) en zalm levert ontstekingsremmende omega-3 vetzuren.',
            ingredients: ['120g zalmfilet', '1 el misopasta', '150g groene asperges', '50g zilvervliesrijst', 'Scheutje sojasaus'],
            instructions: ['Kook de rijst.', 'Smeer de zalm in met miso en bak of grill deze in 8 min gaar.', 'Roerbak of stoom de asperges kort.', 'Serveer samen met een drupje sojasaus.'],
            macros: { p: 30, c: 45, f: 15, kcal: 435, fiber: 5.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        snack: {
            title: 'Matcha Energy Balls',
            emoji: '🍵',
            explanation: 'Matcha zit vol antioxidanten en geeft een zachte, langdurige energieboost zonder de kriebels van koffie. Pompoenpitten leveren magnesium.',
            ingredients: ['2 dadels (ontpit)', '30g pompoenpitten', '1 tl matcha poeder', '15g havermout'],
            instructions: ['Mix alle ingrediënten in een blender of keukenmachine tot een plakkerig deeg.', 'Rol er 2 of 3 balletjes van.', 'Laat even opstijven in de koelkast.'],
            macros: { p: 6, c: 25, f: 12, kcal: 232, fiber: 4.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        }
    },
    [PHASES.FOLLICULAR]: {
        ontbijt: {
            title: 'Cottage Cheese Pancakes',
            emoji: '🥞',
            explanation: 'Dé virale eiwit-hack van dit moment. Extreem eiwitrijk om de spieropbouw (gestimuleerd door stijgend oestrogeen) te ondersteunen.',
            ingredients: ['100g hüttenkäse (cottage cheese)', '1 ei', '30g havermout', 'Snufje kaneel', 'Rood fruit als topping'],
            instructions: ['Blend de hüttenkäse, ei, havermout en kaneel tot een glad beslag.', 'Bak kleine pannenkoekjes in een anti-aanbakpan.', 'Serveer met vers fruit.'],
            macros: { p: 22, c: 25, f: 10, kcal: 278, fiber: 3.8 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'High-Protein Edamame Crunch Salade',
            emoji: '🥗',
            explanation: 'Edamame levert perfecte plantaardige eiwitten en lichte fyto-oestrogenen die prachtig samenwerken met je follikelfase.',
            ingredients: ['100g edamame boontjes', '40g quinoa', 'Witte kool en wortel julienne', '1 el pindakaas', 'Limoensap voor de dressing'],
            instructions: ['Kook de quinoa en edamame.', 'Maak een dressing van pindakaas, limoen en wat warm water.', 'Meng alle groenten en quinoa, en hussel de dressing erdoor.'],
            macros: { p: 20, c: 45, f: 15, kcal: 395, fiber: 9.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        diner: {
            title: 'Zoodles met Kipgehaktballetjes',
            emoji: '🍝',
            explanation: 'Zucchini noodles (courgetti) houden de maaltijd heerlijk fris en licht, terwijl het kipgehakt zorgt voor stevige spieropbouwende eiwitten.',
            ingredients: ['200g courgetti (zoodles)', '150g kipgehakt', 'Verse tomatensaus', '1 el parmezaanse kaas', 'Italiaanse kruiden'],
            instructions: ['Draai balletjes van het kipgehakt met de kruiden en bak goudbruin.', 'Voeg de tomatensaus toe en laat pruttelen.', 'Roerbak de zoodles heel kort (1-2 min) in een andere pan.', 'Serveer samen en top met parmezaan.'],
            macros: { p: 38, c: 15, f: 16, kcal: 356, fiber: 4.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        snack: {
            title: 'Kefir Berry Smoothie',
            emoji: '🥤',
            explanation: 'Kefir is een enorme hype voor darmgezondheid. Een sterke darmflora helpt bij een soepele hormoonbalans.',
            ingredients: ['200ml kefir', 'Handje bevroren bessen'],
            instructions: ['Blend de kefir en bessen tot een romige smoothie.', 'Direct opdrinken.'],
            macros: { p: 8, c: 20, f: 3, kcal: 139, fiber: 3.0 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        }
    },
    [PHASES.OVULATORY]: {
        ontbijt: {
            title: 'Açaí Bowl met Maca',
            emoji: '🫐',
            explanation: 'Açaí zit vol antioxidanten en de toevoeging van maca-poeder is populair om energie en hormoonbalans in deze piekfase te ondersteunen.',
            ingredients: ['1 pure açaí pulp pad (ongezoet)', 'Halve banaan', '1 tl maca poeder', '1 schep eiwitpoeder', 'Beetje amandelmelk'],
            instructions: ['Blend alles tot een dikke, ijs-achtige textuur.', 'Serveer in een kom.', 'Optioneel: top met wat kokosrasp.'],
            macros: { p: 22, c: 35, f: 8, kcal: 300, fiber: 6.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'Smashed Cucumber & Tofu Salad',
            emoji: '🥒',
            explanation: 'De razend populaire Aziatische "smashed cucumber". Zeer hydraterend (helpt bij de eisprong) en tofu levert schone eiwitten.',
            ingredients: ['150g stevige tofu (in blokjes)', '1 komkommer (geslagen en in stukken)', '40g rijstnoedels', 'Sesamolie en sojasaus', 'Chili flakes'],
            instructions: ['Kook de rijstnoedels.', 'Sla de komkommer plat met een mes en snijd in stukken.', 'Bak de tofu krokant.', 'Meng alles met sesamolie, soja en wat chili.'],
            macros: { p: 25, c: 45, f: 18, kcal: 442, fiber: 5.0 },
            suitability: ['maintain', 'gain_muscle']
        },
        diner: {
            title: 'Cauliflower Crust Pizza met Kip',
            emoji: '🍕',
            explanation: 'Bloemkool is een kruisbloemige groente die helpt om overtollig oestrogeen na je eisprong af te voeren. En pizza is altijd een goed idee.',
            ingredients: ['1 kleine bloemkoolbodem', '100g gegrilde kipstukjes', 'Tomatensaus', 'Handje rucola', 'Beetje geraspte mozzarella'],
            instructions: ['Besmeer de bodem met saus.', 'Beleg met kip en kaas.', 'Bak 10-12 minuten krokant in de oven.', 'Garneer met verse rucola.'],
            macros: { p: 35, c: 30, f: 15, kcal: 395, fiber: 8.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        snack: {
            title: 'Kombucha en Paranoten',
            emoji: '🍹',
            explanation: 'Kombucha geeft je een sprankelende probiotica-boost, en paranoten (Brazil nuts) zijn dé ultieme bron van selenium, cruciaal voor een gezonde eisprong.',
            ingredients: ['1 glas kombucha (kies een variant met weinig suiker)', '3 paranoten'],
            instructions: ['Geniet van je drankje en kauw de noten goed.'],
            macros: { p: 4, c: 10, f: 10, kcal: 146, fiber: 1.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        }
    },
    [PHASES.LUTEAL]: {
        ontbijt: {
            title: 'Baked Oats met Appel en Pecan',
            emoji: '🥧',
            explanation: 'Voelt als appeltaart als ontbijt! Het comfort waar je om vraagt, maar met complexe koolhydraten om je bloedsuiker stabiel te houden tegen cravings.',
            ingredients: ['40g havermout', 'Halve appel in stukjes', '1 ei (of eiwitpoeder)', '10g pecannoten', 'Kaneel en scheutje melk'],
            instructions: ['Meng alles in een ovenvast schaaltje.', 'Bak 20 min in de oven op 180 graden.', 'Laat iets afkoelen en geniet.'],
            macros: { p: 15, c: 35, f: 12, kcal: 308, fiber: 6.0 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'Sweet Potato Toast met Hummus en Hennepzaad',
            emoji: '🍠',
            explanation: 'Een geniale vervanger voor brood. Zoete aardappel zit vol vitamine B6, wat superbelangrijk is om PMS-symptomen te verminderen.',
            ingredients: ['150g zoete aardappel (in lange plakken gesneden)', '2 el hummus', '1 el hennepzaad', 'Peper en zout'],
            instructions: ['Rooster de plakken zoete aardappel 2-3 keer in een broodrooster tot ze zacht en iets krokant zijn.', 'Besmeer met hummus.', 'Strooi het hennepzaad eroverheen.'],
            macros: { p: 10, c: 40, f: 12, kcal: 308, fiber: 8.0 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        diner: {
            title: 'Creamy Vegan Cashew Pasta',
            emoji: '🍝',
            explanation: 'Ultiem, romig comfort food zonder de zware dip erna. Cashewnoten zijn een geweldige bron van magnesium tegen krampen.',
            ingredients: ['75g volkoren pasta', '30g ongebrande cashewnoten (geweekt in heet water)', 'Eetlepel edelgistvlokken (nutritional yeast)', 'Knoflookpoeder', 'Gestoomde doperwten'],
            instructions: ['Kook de pasta en doperwten.', 'Blend de geweekte cashewnoten met een scheutje pastawater, edelgist en knoflook tot een gladde "kaas"saus.', 'Meng de saus door de hete pasta.'],
            macros: { p: 18, c: 55, f: 15, kcal: 427, fiber: 7.5 },
            suitability: ['maintain', 'gain_muscle', 'recomp']
        },
        snack: {
            title: 'Crunchy Geroosterde Kikkererwten',
            emoji: '🍿',
            explanation: 'Hét hartige, knapperige antwoord op chips-cravings. Vol vezels en eiwitten waardoor je sneller vol zit.',
            ingredients: ['50g kikkererwten (uitgelekt)', 'Olijfoliespray', 'Paprikapoeder en zeezout'],
            instructions: ['Dep de kikkererwten goed droog.', 'Kruid ze en spray er wat olie over.', 'Rooster 20 min in oven of Airfryer op 200C tot ze knapperig zijn.'],
            macros: { p: 10, c: 25, f: 5, kcal: 185, fiber: 6.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        }
    }
}

export const HYPED_RECIPES_EN = {
    [PHASES.MENSTRUAL]: {
        ontbijt: {
            title: 'Warm Golden Milk Chia Pudding',
            emoji: '💛',
            explanation: 'Totally trendy and scientifically sound: turmeric acts as a powerful anti-inflammatory (ideal for cramps) and chia is full of omega-3.',
            ingredients: ['40g chia seeds', '200ml plant-based milk', '1 tsp turmeric', 'Pinch of black pepper (for absorption)', 'Scoop of protein powder (optional)'],
            instructions: ['Warm the milk slightly.', 'Stir in the spices, chia, and protein powder.', 'Let thicken for 10-15 minutes.', 'Serve warm.'],
            macros: { p: 15, c: 25, f: 15, kcal: 295, fiber: 12.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        lunch: {
            title: 'Bone Broth Ramen with egg and spinach',
            emoji: '🍜',
            explanation: 'Bone broth is extremely popular due to collagen and minerals. Helps replenish your deficiencies during your period.',
            ingredients: ['250ml bone broth (or beef broth)', '50g ramen noodles', '1 soft-boiled egg', 'Handful of fresh spinach', 'Mushrooms'],
            instructions: ['Heat the broth and cook the noodles in it.', 'Meanwhile, boil the egg for 6 minutes.', 'Add the spinach and mushrooms to the broth at the last minute.', 'Pour into a bowl and top with the halved egg.'],
            macros: { p: 20, c: 40, f: 10, kcal: 330, fiber: 4.2 },
            suitability: ['maintain', 'gain_muscle']
        },
        diner: {
            title: 'Miso-glazed Salmon with green asparagus',
            emoji: '🍣',
            explanation: 'Fermented miso supports your gut (which can be upset right now) and salmon provides anti-inflammatory omega-3 fatty acids.',
            ingredients: ['120g salmon fillet', '1 tbsp miso paste', '150g green asparagus', '50g brown rice', 'Dash of soy sauce'],
            instructions: ['Cook the rice.', 'Rub the salmon with miso and bake or grill for 8 min until done.', 'Stir-fry or steam the asparagus briefly.', 'Serve together with a drop of soy sauce.'],
            macros: { p: 30, c: 45, f: 15, kcal: 435, fiber: 5.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        snack: {
            title: 'Matcha Energy Balls',
            emoji: '🍵',
            explanation: 'Matcha is full of antioxidants and provides a smooth, long-lasting energy boost without the coffee jitters. Pumpkin seeds provide magnesium.',
            ingredients: ['2 dates (pitted)', '30g pumpkin seeds', '1 tsp matcha powder', '15g oatmeal'],
            instructions: ['Mix all ingredients in a blender or food processor to a sticky dough.', 'Roll into 2 or 3 balls.', 'Let set in the fridge for a bit.'],
            macros: { p: 6, c: 25, f: 12, kcal: 232, fiber: 4.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        }
    },
    [PHASES.FOLLICULAR]: {
        ontbijt: {
            title: 'Cottage Cheese Pancakes',
            emoji: '🥞',
            explanation: 'The viral protein hack of the moment. Extremely high in protein to support muscle building (stimulated by rising estrogen).',
            ingredients: ['100g cottage cheese', '1 egg', '30g oatmeal', 'Pinch of cinnamon', 'Red fruit as topping'],
            instructions: ['Blend the cottage cheese, egg, oatmeal, and cinnamon into a smooth batter.', 'Bake small pancakes in a non-stick pan.', 'Serve with fresh fruit.'],
            macros: { p: 22, c: 25, f: 10, kcal: 278, fiber: 3.8 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'High-Protein Edamame Crunch Salad',
            emoji: '🥗',
            explanation: 'Edamame provides perfect plant proteins and light phytoestrogens that work beautifully with your follicular phase.',
            ingredients: ['100g edamame beans', '40g quinoa', 'White cabbage and carrot julienne', '1 tbsp peanut butter', 'Lime juice for the dressing'],
            instructions: ['Cook the quinoa and edamame.', 'Make a dressing of peanut butter, lime, and some warm water.', 'Mix all vegetables and quinoa, and toss the dressing through it.'],
            macros: { p: 20, c: 45, f: 15, kcal: 395, fiber: 9.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        diner: {
            title: 'Zoodles with Chicken Meatballs',
            emoji: '🍝',
            explanation: 'Zucchini noodles (zoodles) keep the meal wonderfully fresh and light, while the chicken mince provides solid muscle-building proteins.',
            ingredients: ['200g zucchini noodles (zoodles)', '150g ground chicken', 'Fresh tomato sauce', '1 tbsp parmesan cheese', 'Italian herbs'],
            instructions: ['Roll balls of the chicken mince with the herbs and bake until golden brown.', 'Add the tomato sauce and let simmer.', 'Stir-fry the zoodles very briefly (1-2 min) in another pan.', 'Serve together and top with parmesan.'],
            macros: { p: 38, c: 15, f: 16, kcal: 356, fiber: 4.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        snack: {
            title: 'Kefir Berry Smoothie',
            emoji: '🥤',
            explanation: 'Kefir is a huge hype for gut health. A strong gut flora helps with smooth hormone balance.',
            ingredients: ['200ml kefir', 'Handful of frozen berries'],
            instructions: ['Blend the kefir and berries into a creamy smoothie.', 'Drink immediately.'],
            macros: { p: 8, c: 20, f: 3, kcal: 139, fiber: 3.0 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        }
    },
    [PHASES.OVULATORY]: {
        ontbijt: {
            title: 'Açaí Bowl with Maca',
            emoji: '🫐',
            explanation: 'Açaí is full of antioxidants and adding maca powder is popular to support energy and hormone balance during this peak phase.',
            ingredients: ['1 pure açaí pulp pad (unsweetened)', 'Half banana', '1 tsp maca powder', '1 scoop protein powder', 'Dash of almond milk'],
            instructions: ['Blend everything into a thick, ice cream-like texture.', 'Serve in a bowl.', 'Optional: top with some grated coconut.'],
            macros: { p: 22, c: 35, f: 8, kcal: 300, fiber: 6.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'Smashed Cucumber & Tofu Salad',
            emoji: '🥒',
            explanation: 'The highly popular Asian "smashed cucumber". Very hydrating (helps with ovulation) and tofu provides clean proteins.',
            ingredients: ['150g firm tofu (cubed)', '1 cucumber (smashed and cut into pieces)', '40g rice noodles', 'Sesame oil and soy sauce', 'Chili flakes'],
            instructions: ['Cook the rice noodles.', 'Smash the cucumber flat with a knife and cut into pieces.', 'Fry the tofu crispy.', 'Mix everything with sesame oil, soy, and some chili.'],
            macros: { p: 25, c: 45, f: 18, kcal: 442, fiber: 5.0 },
            suitability: ['maintain', 'gain_muscle']
        },
        diner: {
            title: 'Cauliflower Crust Pizza with Chicken',
            emoji: '🍕',
            explanation: 'Cauliflower is a cruciferous vegetable that helps drain excess estrogen after your ovulation. And pizza is always a good idea.',
            ingredients: ['1 small cauliflower crust', '100g grilled chicken pieces', 'Tomato sauce', 'Handful of arugula', 'Bit of grated mozzarella'],
            instructions: ['Spread the crust with sauce.', 'Top with chicken and cheese.', 'Bake crispy in the oven for 10-12 minutes.', 'Garnish with fresh arugula.'],
            macros: { p: 35, c: 30, f: 15, kcal: 395, fiber: 8.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        snack: {
            title: 'Kombucha and Brazil Nuts',
            emoji: '🍹',
            explanation: 'Kombucha gives you a sparkling probiotic boost, and Brazil nuts are the ultimate source of selenium, crucial for healthy ovulation.',
            ingredients: ['1 glass kombucha (choose a low sugar variant)', '3 Brazil nuts'],
            instructions: ['Enjoy your drink and chew the nuts well.'],
            macros: { p: 4, c: 10, f: 10, kcal: 146, fiber: 1.5 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        }
    },
    [PHASES.LUTEAL]: {
        ontbijt: {
            title: 'Baked Oats with Apple and Pecan',
            emoji: '🥧',
            explanation: 'Feels like apple pie for breakfast! The comfort you crave, but with complex carbohydrates to keep your blood sugar stable against cravings.',
            ingredients: ['40g oatmeal', 'Half an apple in pieces', '1 egg (or protein powder)', '10g pecans', 'Cinnamon and a splash of milk'],
            instructions: ['Mix everything in an ovenproof dish.', 'Bake for 20 min in the oven at 180 degrees.', 'Let cool slightly and enjoy.'],
            macros: { p: 15, c: 35, f: 12, kcal: 308, fiber: 6.0 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        },
        lunch: {
            title: 'Sweet Potato Toast with Hummus and Hemp Seeds',
            emoji: '🍠',
            explanation: 'A brilliant bread replacement. Sweet potato is full of vitamin B6, which is super important to reduce PMS symptoms.',
            ingredients: ['150g sweet potato (cut into long slices)', '2 tbsp hummus', '1 tbsp hemp seeds', 'Pepper and salt'],
            instructions: ['Toast the sweet potato slices 2-3 times in a toaster until soft and slightly crispy.', 'Spread with hummus.', 'Sprinkle the hemp seeds over it.'],
            macros: { p: 10, c: 40, f: 12, kcal: 308, fiber: 8.0 },
            suitability: ['lose_fat', 'maintain', 'recomp']
        },
        diner: {
            title: 'Creamy Vegan Cashew Pasta',
            emoji: '🍝',
            explanation: 'Ultimate, creamy comfort food without the heavy dip afterwards. Cashews are a great source of magnesium against cramps.',
            ingredients: ['75g whole wheat pasta', '30g unroasted cashews (soaked in hot water)', 'Tablespoon nutritional yeast', 'Garlic powder', 'Steamed peas'],
            instructions: ['Cook the pasta and peas.', 'Blend the soaked cashews with a splash of pasta water, nutritional yeast, and garlic into a smooth "cheese" sauce.', 'Mix the sauce through the hot pasta.'],
            macros: { p: 18, c: 55, f: 15, kcal: 427, fiber: 7.5 },
            suitability: ['maintain', 'gain_muscle', 'recomp']
        },
        snack: {
            title: 'Crunchy Roasted Chickpeas',
            emoji: '🍿',
            explanation: 'The savory, crunchy answer to chip cravings. Full of fiber and protein that makes you full faster.',
            ingredients: ['50g chickpeas (drained)', 'Olive oil spray', 'Paprika powder and sea salt'],
            instructions: ['Pat the chickpeas well dry.', 'Season them and spray some oil over them.', 'Roast for 20 min in the oven or Airfryer at 200C until crispy.'],
            macros: { p: 10, c: 25, f: 5, kcal: 185, fiber: 6.5 },
            suitability: ['lose_fat', 'maintain', 'recomp', 'gain_muscle']
        }
    }
}
