export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;

export type PeriodLog = {
  date: string;
  status: 'yes' | 'no';
};

export type CycleStats = {
  learnedCycleLength: number | null;
  variability: number;
  confidence: 'low' | 'medium' | 'high';
};

export type Profile = {
  id: string;
  name: string;
  cycleStart: string | null;
  cycleLength: number;
  periodLength: number;
  bleedingLengthDays: number;
  periodStartDates: string[];
  menstruationLogs: PeriodLog[];
  cycleStats: CycleStats;
  weight: number | null;
  tracking: string;
  userLanguage: string;
  dietaryPreference: string;
};

export type MacroTargets = {
  calories: number;
  proteinMin: number;
  fatMin: number;
  carbsMin: number;
} | null;

export type Food = {
  id: string;
  name_nl: string;
  name_en?: string;
  aliases?: string[];
  unit_type?: string;
  unit_name?: string | null;
  unit_weight?: number | null;
  kcal_100: number;
  protein_100: number;
  carbs_100: number;
  fat_100: number;
  fiber_100?: number;
  isCustom?: boolean;
};

export type FoodLog = {
  id: string;
  date: string;
  foodId: string | null;
  name: string;
  grams: number | null;
  quantity: number | null;
  unitName: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealCategory: MealCategory;
};

export type WeightLog = { date: string; weight: number };
export type WaterLog = { date: string; amountMl: number };
export type StepLog = { date: string; steps: number };
export type SymptomLog = { date: string; symptoms: string[] };
export type MovementLog = { date: string; status: string };

export type DailyTopic = {
  id: string;
  question: string;
  date: string;
};

export type TodayData = {
  profile: Profile;
  targets: MacroTargets;
  foods: Food[];
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  stepLogs: StepLog[];
  symptomLogs: SymptomLog[];
  movementLogs: MovementLog[];
  dailyTopic: DailyTopic | null;
};

export type AddFoodInput = {
  food: Food;
  amount: number;
  unit: 'grams' | 'portion';
  mealCategory: MealCategory;
  date: string;
};

export type PeriodRange = {
  startDate: string;
  endDate: string;
  originalRange?: { startDate: string; endDate: string } | null;
};

export type TodayActions = {
  addFood: (input: AddFoodInput) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  addWater: (date: string, amountMl: number) => Promise<void>;
  setSteps: (date: string, steps: number) => Promise<void>;
  setWeight: (date: string, weight: number) => Promise<void>;
  saveSymptoms: (date: string, symptoms: string[]) => Promise<void>;
  startPeriod: (date: string) => Promise<void>;
  stopPeriod: (date: string) => Promise<void>;
  savePeriodRange: (range: PeriodRange) => Promise<void>;
  saveMovement: (date: string, status: 'moved' | 'rest') => Promise<void>;
};
