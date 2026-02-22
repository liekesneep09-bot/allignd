import fs from 'fs';

let content = fs.readFileSync('src/data/foods.js', 'utf8');

const regex = /{ id: '([^']+)', name_nl: '([^']+)', aliases: \[([^\]]*)\], unit_type: 'per_100g', kcal_100: (\d+), protein_100: ([\d\.]+), carbs_100: ([\d\.]+), fat_100: ([\d\.]+) }/g;

let matchCount = 0;
let updatedContent = content.replace(regex, (match, id, name, aliases, kcal, p, c, f) => {
    matchCount++;
    const pVal = parseFloat(p);
    const cVal = parseFloat(c);
    const fVal = parseFloat(f);

    // Calculate new exact kcal
    const exactKcal = Math.round((pVal * 4) + (cVal * 4) + (fVal * 9));

    return `{ id: '${id}', name_nl: '${name}', aliases: [${aliases}], unit_type: 'per_100g', kcal_100: ${exactKcal}, protein_100: ${pVal}, carbs_100: ${cVal}, fat_100: ${fVal} }`;
});

fs.writeFileSync('src/data/foods.js', updatedContent);
console.log(`Updated ${matchCount} items with exact calculated kcals.`);
