import type { MealCategory, Phase } from '@/types/today';

export const phaseContent: Record<Phase, { title: string; prefix: string; normal: string; nutrition: string }[]> = {
  menstrual: [
    { title: 'Menstruatie fase', prefix: '', normal: 'Krampen of moe? Wees mild voor jezelf, maar blijf goed voor je lichaam zorgen. Houd jezelf warm en neem rust wanneer dat nodig is.', nutrition: 'IJzerrijke voeding, magnesium en omega-3 ondersteunen je van binnenuit.' },
    { title: 'Menstruatie fase', prefix: '', normal: 'Je lichaam werkt hard achter de schermen. Zachte beweging, warmte en rust zijn nu je beste vrienden: geen verplichtingen, gewoon goed voor jezelf zorgen.', nutrition: 'Soepen, warme maaltijden en ijzerrijke producten zoals spinazie of peulvruchten helpen je lichaam herstellen.' },
    { title: 'Menstruatie fase', prefix: '', normal: 'Lagere energie is geen falen, het is je lichaam dat reset. Luister naar wat je nodig hebt en geef jezelf daar toestemming voor.', nutrition: 'Magnesium en omega-3 kunnen helpen bij krampen. Vermijd te veel cafeïne als je er gevoelig voor bent.' },
  ],
  follicular: [
    { title: 'Folliculaire fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Je energie bouwt zich weer op. Een fase waarin je vooruit wilt en dingen in beweging brengt.', nutrition: 'Koolhydraten geven je energie, terwijl eiwitten bijdragen aan opbouw en herstel.' },
    { title: 'Folliculaire fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Dit is een mooie fase om nieuwe dingen op te pakken of gewoontes weer aan te scherpen. Je hoofd is helder en je herstel gaat sneller.', nutrition: 'B-vitamines en zink ondersteunen je energieproductie en herstel: denk aan eieren, noten en volle granen.' },
    { title: 'Folliculaire fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Je oestrogeen stijgt en dat merk je: meer motivatie, betere focus en een lichtere stemming. Benut dit, maar houd ook ruimte voor wat rust.', nutrition: 'Voldoende eiwitten en koolhydraten geven je lichaam de brandstof om op te bouwen.' },
  ],
  ovulatory: [
    { title: 'Ovulatiefase', prefix: 'Je zit waarschijnlijk in je', normal: 'Je zit vaak op je sterkst: energiek, helder en krachtig. Vertrouw op je lichaam en benut deze fase op een manier die bij je past.', nutrition: 'Lichte, voedzame maaltijden en antioxidanten ondersteunen je energie en vitaliteit.' },
    { title: 'Ovulatiefase', prefix: 'Je zit waarschijnlijk in je', normal: 'Dit is je energiepiek. Je voelt je socialer, sterker en meer in flow. Een goede tijd om dingen aan te pakken waar je anders tegenop ziet.', nutrition: 'Omega-3 vetzuren en antioxidanten, zoals in vette vis, bessen en noten, ondersteunen je bij hogere activiteit.' },
    { title: 'Ovulatiefase', prefix: 'Je zit waarschijnlijk in je', normal: 'Hormonen pieken nu en dat geeft je een natuurlijk voordeel. Geniet ervan, maar overdrijf het niet: herstel blijft ook in deze fase belangrijk.', nutrition: 'Vezels helpen je hormoonhuishouding in balans te houden. Denk aan groenten, fruit en peulvruchten.' },
  ],
  luteal: [
    { title: 'Luteale fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Je lichaam schakelt langzaam over naar meer rust. Meer trek, minder energie of wat extra vocht vasthouden is helemaal normaal in deze fase.', nutrition: 'Magnesium, complexe koolhydraten, calcium en vitamine B6 ondersteunen je verzadiging en energiebalans. Denk aan havermout, banaan, yoghurt, zoete aardappel en noten.' },
    { title: 'Luteale fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Dit is vaak een fase waarin je lichaam meer behoefte heeft aan stabiliteit en herstel. Wat zachter voor jezelf zijn mag juist nu.', nutrition: 'Magnesium, complexe koolhydraten, calcium en vitamine B6 ondersteunen je verzadiging en energiebalans. Kies bijvoorbeeld voor quinoa, pure chocolade, avocado, spinazie en eieren.' },
    { title: 'Luteale fase', prefix: 'Je zit waarschijnlijk in je', normal: 'Je energie kan deze dagen wat meer schommelen. Dat is normaal en hoort bij de veranderingen die in je lichaam plaatsvinden.', nutrition: 'Magnesium, complexe koolhydraten, calcium en vitamine B6 ondersteunen je verzadiging en energiebalans. Denk aan volkoren pasta, amandelen, zalm, pompoenpitten en yoghurt.' },
  ],
};

export const phaseLabels: Record<Phase, string> = {
  menstrual: 'Menstruatie',
  follicular: 'Folliculaire fase',
  ovulatory: 'Ovulatiefase',
  luteal: 'Luteale fase',
};

export const mealLabels: Record<string, string> = {
  breakfast: 'Ontbijt',
  lunch: 'Lunch',
  dinner: 'Diner',
  snack: 'Snack',
  other: 'Overig',
};

export const symptomGroups = [
  { title: 'Gemoed', items: [
    { id: 'energetic', label: 'Energiek' },
    { id: 'relaxed', label: 'Ontspannen' },
    { id: 'anxious', label: 'Onrustig' },
    { id: 'irritable', label: 'Prikkelbaar' },
    { id: 'sad', label: 'Somber' },
  ] },
  { title: 'Lichaam', items: [
    { id: 'cramps', label: 'Krampen' },
    { id: 'bloated', label: 'Opgeblazen' },
    { id: 'headache', label: 'Hoofdpijn' },
    { id: 'tender_breasts', label: 'Gevoelige borsten' },
    { id: 'cravings', label: 'Cravings' },
    { id: 'fatigue', label: 'Vermoeid' },
  ] },
];

export function symptomLabel(id: string) {
  return symptomGroups.flatMap((group) => group.items).find((item) => item.id === id)?.label ?? id;
}

export function mealLabel(category: MealCategory) {
  return mealLabels[category ?? 'other'];
}
