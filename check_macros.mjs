import fs from 'fs';

const lines = fs.readFileSync('src/data/foods.js', 'utf8');
const arrayStr = lines.substring(lines.indexOf('['), lines.lastIndexOf(']') + 1);
const foods = eval(`(${arrayStr})`);

const needsFix = [];
foods.forEach(f => {
    // Alcohol (7) and Fiber (2) can alter kcals, but let's just flag egregious differences
    const calc = (f.protein_100 * 4) + (f.carbs_100 * 4) + (f.fat_100 * 9);
    const diff = Math.abs(calc - f.kcal_100);
    if (diff > 25) { // allow 25 kcal for things like fiber / rounding
        needsFix.push({
            id: f.id,
            name: f.name_nl,
            stated: f.kcal_100,
            calc: Math.round(calc),
            diff: Math.round(diff)
        });
    }
});

console.log(JSON.stringify(needsFix, null, 2));
