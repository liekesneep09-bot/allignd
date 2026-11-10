import { FOOD_DATABASE } from '../../../src/data/foods';
import { addDays, todayString } from '@/lib/date';
import type { Food, FoodLog, MealCategory, TodayData } from '@/types/today';

function demoFoodLog(food: Food, date: string, amount: number, mealCategory: MealCategory): FoodLog {
  const factor = amount / 100;
  return {
    id: `demo-${food.id}`,
    date,
    foodId: food.id,
    name: food.name_nl,
    grams: amount,
    quantity: 1,
    unitName: null,
    kcal: Math.round(food.kcal_100 * factor),
    protein: Number((food.protein_100 * factor).toFixed(1)),
    carbs: Number((food.carbs_100 * factor).toFixed(1)),
    fat: Number((food.fat_100 * factor).toFixed(1)),
    fiber: Number(((food.fiber_100 ?? 0) * factor).toFixed(1)),
    mealCategory,
  };
}

export function createDemoData(): TodayData {
  const date = todayString();
  const cycleStart = addDays(date, -12);
  const foods = FOOD_DATABASE as Food[];
  const breakfast = foods.find((food) => food.name_nl.toLowerCase().includes('havermout')) ?? foods[0];
  const fruit = foods.find((food) => food.name_nl === 'Banaan') ?? foods[1];
  const lunch = foods.find((food) => food.name_nl.toLowerCase().includes('kipfilet')) ?? foods[2];

  return {
    profile: {
      id: 'demo',
      name: 'Demo',
      cycleStart,
      cycleLength: 28,
      periodLength: 5,
      bleedingLengthDays: 5,
      periodStartDates: [cycleStart],
      menstruationLogs: [
        { date: cycleStart, status: 'yes' },
        { date: addDays(cycleStart, 5), status: 'no' },
      ],
      cycleStats: { learnedCycleLength: null, variability: 0, confidence: 'low' },
      weight: 68.4,
      tracking: 'now',
      userLanguage: 'nl',
      dietaryPreference: 'everything',
    },
    targets: { calories: 2000, proteinMin: 120, fatMin: 65, carbsMin: 220 },
    foods,
    foodLogs: [
      demoFoodLog(breakfast, date, 60, 'breakfast'),
      demoFoodLog(fruit, date, 120, 'breakfast'),
      demoFoodLog(lunch, date, 150, 'lunch'),
    ],
    waterLogs: [{ date, amountMl: 1250 }],
    stepLogs: [{ date, steps: 6400 }],
    weightLogs: [
      { date: addDays(date, -14), weight: 69.1 },
      { date: addDays(date, -7), weight: 68.8 },
      { date, weight: 68.4 },
    ],
    symptomLogs: [{ date, symptoms: ['energetic'] }],
    movementLogs: [],
    dailyTopic: {
      id: 'demo-topic',
      question: 'Waar heb jij vandaag behoefte aan?',
      date,
    },
  };
}
