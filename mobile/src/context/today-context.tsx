import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useAuth } from '@/context/auth-context';
import { createDemoData } from '@/data/demo-data';
import { getSupabase } from '@/lib/supabase';
import { loadTodayData } from '@/lib/today-repository';
import { addPeriodStart, createPeriodRangeLogs } from '@/lib/period';
import { getCycleStats } from '@/lib/cycle';
import { todayString } from '@/lib/date';
import { createId } from '../../../src/utils/id.js';
import type { AddFoodInput, FoodLog, PeriodRange, Profile, TodayActions, TodayData } from '@/types/today';

type TodayContextValue = {
  data: TodayData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isDemo: boolean;
  refresh: () => Promise<void>;
  actions: TodayActions;
};

const TodayContext = createContext<TodayContextValue | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Er ging iets mis. Probeer het opnieuw.';
}

function profileUpdate(data: TodayData, profile: Profile): TodayData {
  return { ...data, profile };
}

function learnedPeriodLength(logs: Profile['menstruationLogs'], fallback: number) {
  const stops = logs.filter((log) => log.status === 'no').map((log) => log.date).sort();
  const lengths = stops.flatMap((stop) => {
    const starts = logs.filter((log) => log.status === 'yes' && log.date < stop).map((log) => log.date).sort();
    const start = starts.at(-1);
    if (!start) return [];
    const days = Math.round((new Date(`${stop}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / 86400000);
    return days >= 1 && days <= 14 ? [days] : [];
  });
  if (!lengths.length) return fallback;
  const average = lengths.slice(-6).reduce((sum, days) => sum + days, 0) / Math.min(lengths.length, 6);
  return average > 1 ? Math.round(average) : fallback;
}

export function TodayProvider({ children }: PropsWithChildren) {
  const { session, isPreview } = useAuth();
  const userId = session?.user.id ?? null;
  const isDemo = isPreview && !userId;
  const [data, setData] = useState<TodayData | null>(null);
  const dataRef = useRef<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const updateData = useCallback((next: TodayData | null) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    setError(null);
    if (isDemo) {
      updateData(createDemoData());
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (!userId) {
      updateData(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (dataRef.current) setRefreshing(true);
    else setLoading(true);
    try {
      const next = await loadTodayData(userId);
      if (requestRef.current === requestId) updateData(next);
    } catch (reason) {
      if (requestRef.current === requestId) setError(errorMessage(reason));
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [isDemo, userId, updateData]);

  useEffect(() => {
    updateData(null);
    setLoading(true);
    void refresh();
    return () => { requestRef.current += 1; };
  }, [userId, isDemo, refresh, updateData]);

  const commit = useCallback(async (
    updater: (current: TodayData) => TodayData,
    persist: (next: TodayData) => Promise<void>,
  ) => {
    const previous = dataRef.current;
    if (!previous) throw new Error('Je gegevens zijn nog niet geladen.');
    const next = updater(previous);
    updateData(next);
    try {
      if (!isDemo) await persist(next);
    } catch (reason) {
      updateData(previous);
      throw new Error(errorMessage(reason));
    }
  }, [isDemo, updateData]);

  const saveProfile = useCallback(async (user: string, profile: Profile) => {
    await getSupabase().from('profiles').update({
      cycle_start: profile.cycleStart,
      cycle_length: profile.cycleLength,
      period_length: profile.periodLength,
      bleeding_length_days: profile.bleedingLengthDays,
      period_start_dates: profile.periodStartDates,
      menstruation_logs: profile.menstruationLogs,
      cycle_stats: profile.cycleStats,
      updated_at: new Date().toISOString(),
    }).eq('id', user).then(({ error: saveError }) => {
      if (saveError) throw saveError;
    });
  }, []);

  const actions = useMemo<TodayActions>(() => ({
    addFood: async ({ food, amount, unit, mealCategory, date }) => {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error('Vul een geldige hoeveelheid in.');
      if (!userId && !isDemo) throw new Error('Log in om voeding op te slaan.');
      const grams = unit === 'portion' ? amount * (food.unit_weight ?? 100) : amount;
      const factor = grams / 100;
      const id = createId();
      const log: FoodLog = {
        id, date, foodId: food.id, name: food.name_nl, grams,
        quantity: unit === 'portion' ? amount : 1,
        unitName: unit === 'portion' ? (food.unit_name ?? 'portie') : null,
        kcal: Math.round(food.kcal_100 * factor),
        protein: Number((food.protein_100 * factor).toFixed(1)),
        carbs: Number((food.carbs_100 * factor).toFixed(1)),
        fat: Number((food.fat_100 * factor).toFixed(1)),
        fiber: Number(((food.fiber_100 ?? 0) * factor).toFixed(1)),
        mealCategory,
      };
      await commit((current) => ({ ...current, foodLogs: [...current.foodLogs, log] }), async () => {
        const { error: saveError } = await getSupabase().from('food_logs').insert({
          id, user_id: userId, date, food_id: food.id, name: food.name_nl,
          grams, quantity: log.quantity, unit_name: log.unitName, item_type: 'product',
          meal_category: mealCategory, kcal: log.kcal, protein: log.protein,
          carbs: log.carbs, fat: log.fat, fiber: log.fiber,
        });
        if (saveError) throw saveError;
      });
    },
    deleteFood: async (id) => {
      await commit((current) => ({ ...current, foodLogs: current.foodLogs.filter((log) => log.id !== id) }), async () => {
        const { error: saveError } = await getSupabase().from('food_logs').delete().eq('id', id).eq('user_id', userId);
        if (saveError) throw saveError;
      });
    },
    addWater: async (date, amountMl) => {
      if (!Number.isFinite(amountMl) || amountMl <= 0) throw new Error('Vul een geldige hoeveelheid water in.');
      let total = 0;
      await commit((current) => {
        total = (current.waterLogs.find((log) => log.date === date)?.amountMl ?? 0) + amountMl;
        return { ...current, waterLogs: [...current.waterLogs.filter((log) => log.date !== date), { date, amountMl: total }] };
      }, async () => {
        const { error: saveError } = await getSupabase().from('water_logs').upsert({
          user_id: userId, date, amount_ml: total, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
        if (saveError) throw saveError;
      });
    },
    setSteps: async (date, steps) => {
      if (!Number.isInteger(steps) || steps < 0) throw new Error('Vul een geldig aantal stappen in.');
      await commit((current) => ({
        ...current, stepLogs: [...current.stepLogs.filter((log) => log.date !== date), { date, steps }],
      }), async () => {
        const { error: saveError } = await getSupabase().from('step_logs').upsert({
          user_id: userId, date, steps, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
        if (saveError) throw saveError;
      });
    },
    setWeight: async (date, weight) => {
      if (!Number.isFinite(weight) || weight < 20 || weight > 400) throw new Error('Vul een geldig gewicht in kilogram in.');
      await commit((current) => ({
        ...current,
        profile: date === todayString() ? { ...current.profile, weight } : current.profile,
        weightLogs: [...current.weightLogs.filter((log) => log.date !== date), { date, weight }].sort((a, b) => a.date.localeCompare(b.date)),
      }), async () => {
        const db = getSupabase();
        const { data: existing, error: readError } = await db.from('weight_logs').select('id').eq('user_id', userId).eq('date', date).maybeSingle();
        if (readError) throw readError;
        const { error: saveError } = existing
          ? await db.from('weight_logs').update({ weight }).eq('id', existing.id).eq('user_id', userId)
          : await db.from('weight_logs').insert({ id: createId(), user_id: userId, date, weight });
        if (saveError) throw saveError;
        if (date === todayString()) {
          const { error: profileError } = await db.from('profiles').update({ weight }).eq('id', userId);
          if (profileError) throw profileError;
        }
      });
    },
    saveSymptoms: async (date, symptoms) => {
      await commit((current) => ({
        ...current, symptomLogs: [...current.symptomLogs.filter((log) => log.date !== date), { date, symptoms }],
      }), async () => {
        const { error: saveError } = await getSupabase().from('symptom_logs').upsert({
          user_id: userId, date, symptoms, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
        if (saveError) throw saveError;
      });
    },
    startPeriod: async (date) => {
      await commit((current) => {
        const starts = addPeriodStart(date, current.profile.periodStartDates).periodStartDates;
        const stats = getCycleStats(starts, current.profile.cycleLength);
        const profile: Profile = {
          ...current.profile,
          menstruationLogs: [...current.profile.menstruationLogs.filter((log) => log.date !== date), { date, status: 'yes' as const }].sort((a, b) => a.date.localeCompare(b.date)),
          periodStartDates: starts,
          cycleLength: stats.learnedCycleLength || current.profile.cycleLength,
          cycleStats: { learnedCycleLength: stats.learnedCycleLength, variability: stats.variability, confidence: stats.confidence },
          cycleStart: starts.at(-1) ?? current.profile.cycleStart,
        };
        return profileUpdate(current, profile);
      }, async (next) => { if (userId) await saveProfile(userId, next.profile); });
    },
    stopPeriod: async (date) => {
      await commit((current) => {
        const logs = [...current.profile.menstruationLogs.filter((log) => log.date !== date), { date, status: 'no' as const }].sort((a, b) => a.date.localeCompare(b.date));
        const length = learnedPeriodLength(logs, current.profile.bleedingLengthDays);
        return profileUpdate(current, {
          ...current.profile, menstruationLogs: logs, bleedingLengthDays: length, periodLength: length,
        });
      }, async (next) => { if (userId) await saveProfile(userId, next.profile); });
    },
    savePeriodRange: async ({ startDate, endDate, originalRange = null }: PeriodRange) => {
      await commit((current) => {
        const { logs, periodLength } = createPeriodRangeLogs(current.profile.menstruationLogs, startDate, endDate, originalRange);
        let starts = current.profile.periodStartDates;
        if (originalRange?.startDate && originalRange.startDate !== startDate) {
          starts = starts.filter((date) => date !== originalRange.startDate);
        }
        starts = addPeriodStart(startDate, starts).periodStartDates;
        const stats = getCycleStats(starts, current.profile.cycleLength);
        return profileUpdate(current, {
          ...current.profile,
          menstruationLogs: logs,
          periodStartDates: starts,
          cycleStart: starts.at(-1) ?? current.profile.cycleStart,
          cycleLength: stats.learnedCycleLength || current.profile.cycleLength,
          cycleStats: { learnedCycleLength: stats.learnedCycleLength, variability: stats.variability, confidence: stats.confidence },
          bleedingLengthDays: periodLength,
          periodLength,
        });
      }, async (next) => { if (userId) await saveProfile(userId, next.profile); });
    },
    saveMovement: async (date, status) => {
      await commit((current) => ({
        ...current, movementLogs: [...current.movementLogs.filter((log) => log.date !== date), { date, status }],
      }), async () => {
        const { error: saveError } = await getSupabase().from('movement_logs').upsert({
          id: createId(), user_id: userId, date, status, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
        if (saveError) throw saveError;
      });
    },
  }), [commit, isDemo, userId, saveProfile]);

  const value = useMemo(() => ({ data, loading, refreshing, error, isDemo, refresh, actions }), [data, loading, refreshing, error, isDemo, refresh, actions]);
  return <TodayContext.Provider value={value}>{children}</TodayContext.Provider>;
}

export function useToday() {
  const context = use(TodayContext);
  if (!context) throw new Error('useToday moet binnen TodayProvider worden gebruikt.');
  return context;
}
