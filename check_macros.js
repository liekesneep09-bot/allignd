import fs from 'fs';

// Read file
const lines = fs.readFileSync('src/data/foods.js', 'utf8');

// evaluate the array
// We need to safely extract it
const match = lines.match(/export const FOOD_DATABASE = (\[[\s\S]*\]);/);
if (!match) {
    console.log("Could not find FOOD_DATABASE array");
    process.exit(1);
}

const foodList = eval(match[1]);

let needsFix = [];

foodList.forEach(food => {
    // 4 kcal per gram of protein and carb, 9 per gram of fat
    const calculated = (food.protein_100 * 4) + (food.carbs_100 * 4) + (food.fat_100 * 9);
    const diff = Math.abs(calculated - food.kcal_100);
    
    // Some allowance for fiber (which is 2 kcal/g, often counted in total carbs but not in net carbs) 
    // and rounding differences. Let's flag anything > 15 kcal difference
    if (diff > 15) {
        needsFix.push({
            id: food.id,
            name: food.name_nl,
            listed_kcal: food.kcal_100,
            calculated_kcal: Math.round(calculated),
            diff: Math.round(diff),
            p: food.protein_100,
            c: food.carbs_100,
            f: food.fat_100
        });
    }
});

console.log(`Found ${needsFix.length} items with >15 kcal discrepancy.`);
needsFix.sort((a,b) => b.diff - a.diff).forEach(f => {
    console.log(`${f.name}: Listed ${f.listed_kcal}, Calculated ${f.calculated_kcal} (Diff: ${f.diff}) | P:${f.p} C:${f.c} F:${f.f}`);
});
