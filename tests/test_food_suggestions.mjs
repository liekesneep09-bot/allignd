import { suggestMeals } from '../src/logic/foodSuggestions.js'

let passed = 0
let failed = 0

function check(name, condition) {
    if (condition) {
        passed++
        console.log(`  ✅ ${name}`)
    } else {
        failed++
        console.log(`  ❌ ${name}`)
    }
}

const meals = [
    { title: 'Zware stoof', macros: { kcal: 900, p: 40 } },
    { title: 'Kipsalade', macros: { kcal: 350, p: 32 } },
    { title: 'Havermout', macros: { kcal: 300, p: 12 } },
    { title: 'Soep', macros: { kcal: 250, p: 22 } },
    { title: 'Crackers', macros: { kcal: 150, p: 4 } }
]

console.log('🍽️  food-suggestions.js')

const remaining = { kcal: 400, p: 50 }

const result = suggestMeals(meals, remaining, 4)
check('returns at most `count` suggestions', result.length === 4)
check('meals that fit the remaining kcal come first', result[0].meal.title === 'Kipsalade')
check('the meal that does not fit is left out when space runs out', !result.some(r => r.meal.title === 'Zware stoof'))
check('fits flag is true for meals within budget', result.find(r => r.meal.title === 'Soep').fits === true)

const all = suggestMeals(meals, remaining, 5)
check('the meal that does not fit comes last', all[all.length - 1].meal.title === 'Zware stoof')
check('fits flag is false for the heavy meal', all.find(r => r.meal.title === 'Zware stoof').fits === false)

const fitting = result.filter(r => r.fits)
check('within fitting meals, protein-rich comes before protein-poor', fitting[0].proteinRich === true)

check('empty input returns empty array', suggestMeals([], remaining).length === 0)
check('null input returns empty array', suggestMeals(null, remaining).length === 0)

const noBudget = suggestMeals(meals, { kcal: null, p: null }, 2)
check('without a budget everything counts as fitting', noBudget.every(r => r.fits))

console.log(`\nResults: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
