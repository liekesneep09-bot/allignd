import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foodsPath = path.join(__dirname, 'src/data/foods.js');
let content = fs.readFileSync(foodsPath, 'utf-8');

const targetIds = [
  'd24', 'd25', 'd26', 'd27', 'd28', 'd29', 'd30', 'd33',
  'f29', 'f30',
  'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'
];

targetIds.forEach(id => {
  const regex = new RegExp(`({\\s*id:\\s*'${id}'.*?unit_type:\\s*)'per_100g'`, 'g');
  content = content.replace(regex, `$1'per_100ml'`);
});

fs.writeFileSync(foodsPath, content, 'utf-8');
console.log('Successfully updated foods.js with per_100ml');
