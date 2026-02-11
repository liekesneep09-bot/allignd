import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { calculateCycleDay, getPhaseForDay, calculateStartDateFromPhase, getCyclePrediction } from '../logic/cycle'
import { calculateCycleStats, addPeriodStart as addPeriodStartToHistory, predictNextPeriodStart, getOvulationWindow } from '../logic/cycle-learning'
import { calculateTargetRanges } from '../logic/nutrition'
import { FOOD_DATABASE } from '../data/foods'
import { scanDayLogs, loadDayLog, saveDayLog, loadUserProfile, saveUserProfile, loadCustomFoods, saveCustomFoods } from '../utils/storage'
import { toNum } from '../utils/numbers'
import { getDeviceId } from '../utils/device'
import { api } from '../utils/api'
import { useAuth } from './AuthContext'
import { supabase } from '../utils/supabaseClient'
import { getLocalDateStr } from '../utils/date'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  // Auth Context
  const { user: authUser, getAccessToken, signOut } = useAuth()

  // 1. Loading State
  const [isLoading, setIsLoading] = useState(true)

  // 2. Onboarding State
  const [isOnboarded, setIsOnboarded] = useState(false)

  // 3. User Data State
  const [user, setUser] = useState(() => ({
    email: '',
    password: '',
    cycleStart: null, // Default to null (missing)
    cycleLength: 28, // Onboarding default, used as fallback
    periodLength: 5, // Legacy field
    bleedingLengthDays: 5, // User-editable bleeding duration
    isMenstruatingNow: false, // Explicit override
    currentPeriodLength: null, // Override for current cycle
    lastCheckInDate: null, // 'YYYY-MM-DD'
    manualPhaseOverride: false, // TRUE when user manually selects phase
    manualPhase: null, // The phase user selected (menstrual, follicular, ovulatory, luteal)

    // Cycle Learning System
    periodStartDates: [], // Array of YYYY-MM-DD (day 1 of each period)
    cycleLengthHistory: [], // [{ length, startDate, isOutlier }]
    cycleStats: {
      learnedCycleLength: null, // Calculated median from history
      variability: null, // Standard deviation
      confidence: 'low' // 'low' | 'medium' | 'high'
    },

    // PERSISTED MACROS (Single Source of Truth)
    // NO FALLBACKS - if null, UI shows empty state
    macroTargets: null,

    age: '',
    height: '',
    weight: '',
    trainingFrequency: 3, // Default
    activity: 1.55, // Deprecated but kept for compatibility
    goal: 'maintain',
    // New Fields
    training_days_per_week: 3,
    lifestyle_level: 'sedentary',
    steps_range: 'lt4k',
    tracking: 'now',
    cycleHistory: [], // [{ startDate, endDate, length }] - Legacy
    logs: {}, // Deprecated legacy logs

    // MVP Food Database (Seeded)
    foods: FOOD_DATABASE || [],

    // Food Logs
    foodLogs: [], // { id, date, foodId, grams, kcal, p, c, f }

    // Movement Logs
    movementLogs: [], // { date: 'YYYY-MM-DD', status: 'moved' | 'rest' }

    // Menstruation Logs (Explicit Check-ins)
    menstruationLogs: [] // { date, status }
  }))

  // 4. Derived State (Prioritize calculations)
  const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength || 28
  // Don't calculate if cycleStart is null, default to 1
  const currentDay = user.cycleStart
    ? calculateCycleDay(user.cycleStart, effectiveCycleLength)
    : 1

  const effectivePeriodLength = user.currentPeriodLength !== null && user.currentPeriodLength !== undefined
    ? user.currentPeriodLength
    : (user.bleedingLengthDays || user.periodLength)

  const currentPhase = user.cycleStart
    ? getPhaseForDay(
      currentDay,
      effectiveCycleLength,
      effectivePeriodLength,
      user.isMenstruatingNow,
      !!user.cycleStart
    )
    : 'follicular' // Default phase

  // USE STORED TARGETS (No fallback defaults!)
  const targets = user.macroTargets || null

  // 5. Init & Sync Data
  useEffect(() => {
    async function initAndSync() {
      if (!authUser) return

      try {
        // --- A. LOCAL LOAD (Optimistic) ---
        const savedOnboarded = localStorage.getItem('cyclus_onboarded') === 'true'
        const userId = authUser.id

        // Load legacy profile for migration
        let localProfile = loadUserProfile(userId)

        // Legacy migration check
        const isProfileEmpty = !localProfile || (!localProfile.weight && !localProfile.height && !localProfile.cycleStart)
        if (isProfileEmpty) {
          const legacyUser = localStorage.getItem('cyclus_user')
          if (legacyUser) {
            try {
              localProfile = JSON.parse(legacyUser)
              saveUserProfile(localProfile, userId)
            } catch (e) { console.error("Migration failed", e) }
          }
        }

        // Apply Local State immediately (Optimistic)
        let initialUserState = { ...user }
        if (localProfile) {
          if (localProfile.tempo && !localProfile.resultTempo) {
            localProfile.resultTempo = localProfile.tempo
            delete localProfile.tempo
          }
          initialUserState = { ...initialUserState, ...localProfile }
        }
        setUser(initialUserState)
        if (savedOnboarded) setIsOnboarded(true)


        // --- B. SERVER SYNC (Source of Truth) ---

        // B1. Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          console.log('Loaded profile from Supabase')
          const profileData = {
            name: profile.name,
            cycleStart: profile.cycle_start,
            cycleLength: profile.cycle_length,
            periodLength: profile.period_length,
            bleedingLengthDays: profile.bleeding_length_days,
            age: profile.age,
            height: profile.height,
            weight: profile.weight,
            targetWeight: profile.target_weight,
            goal: profile.goal,
            activity: profile.activity_level,
            trainingFrequency: profile.training_days_per_week, // Map DB to UI
            training_days_per_week: profile.training_days_per_week,
            lifestyle_level: profile.lifestyle_level,
            steps_range: profile.steps_range,
            // Cycle Learning
            periodStartDates: profile.period_start_dates || [],
            cycleHistory: profile.cycle_history || [],
            cycleStats: profile.cycle_stats || {},
            isMenstruatingNow: false,
            macroTargets: null
          }

          if (profile.is_onboarded) {
            setIsOnboarded(true)
            localStorage.setItem('cyclus_onboarded', 'true')
          }

          setUser(prev => ({ ...prev, ...profileData }))

          // B1.5. Fetch Computed Targets
          const { data: targetData } = await supabase
            .from('computed_targets')
            .select('*')
            .eq('user_id', authUser.id)
            .maybeSingle()

          if (targetData) {
            setUser(prev => ({
              ...prev,
              macroTargets: {
                calories: targetData.calorie_target_min, // Use Min as base or range? Let's store range
                caloriesMax: targetData.calorie_target_max,
                proteinMin: targetData.protein_g_min,
                proteinMax: targetData.protein_g_max,
                fatMin: targetData.fat_g_min,
                fatMax: targetData.fat_g_max,
                carbsMin: targetData.carbs_g_min,
                carbsMax: targetData.carbs_g_max
              },
              nutritionDebug: {
                tdee: targetData.tdee_estimate
              }
            }))
          }
        }

        // B2. Fetch Custom Foods (ISOLATED)
        const { data: dbCustomFoods } = await supabase
          .from('custom_foods')
          .select('*')
          .eq('user_id', authUser.id)

        let customFoods = []
        if (dbCustomFoods) {
          // Map DB format to internal format if needed
          customFoods = dbCustomFoods.map(f => ({
            id: f.id,
            name_nl: f.name_nl,
            kcal_100: Number(f.kcal_100),
            protein_100: Number(f.protein_100),
            carbs_100: Number(f.carbs_100),
            fat_100: Number(f.fat_100),
            unit_type: f.unit_type || 'per_100g',
            isCustom: true
          }))
        }

        // Merge with Seed Database
        setUser(prev => ({
          ...prev,
          foods: [...FOOD_DATABASE, ...customFoods]
        }))

        // B3. Fetch Food Logs (Last 30 days or just today + recent? Let's fetch active logs)
        // For MVP, maybe just fetch TODAY and handle history when viewed
        // But user wants "Refresh page -> items remain".
        // Let's fetch ALL logs for now (MVP, small data) or last 7 days.
        // Actually, scanDayLogs used earlier fetched everything from localStorage.
        // We will fetch ALL food_logs for now from Supabase to populate state.
        const { data: dbLogs } = await supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: true })

        if (dbLogs) {
          const mappedLogs = dbLogs.map(log => ({
            id: log.id,
            date: log.date,
            foodId: log.food_id,
            name: log.name,
            grams: Number(log.grams),
            quantity: Number(log.quantity),
            kcal: Number(log.kcal),
            p: Number(log.protein),
            c: Number(log.carbs),
            f: Number(log.fat),
            item_type: log.item_type,
            configId: log.config_id,
            selectedVariants: log.selected_variants
          }))
          setUser(prev => ({
            ...prev,
            foodLogs: mappedLogs
          }))
        }

      } catch (err) {
        console.error('User init/sync failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAndSync()
  }, [authUser])

  // 5. Persist User Data (Profile Only)
  useEffect(() => {
    if (!isLoading) {
      // Destructure logs & computed data out to avoid bloating profile
      const { foodLogs, movementLogs, foods, ...profileData } = user
      if (authUser?.id) {
        saveUserProfile(profileData, authUser.id)
      }
    }
  }, [user, isLoading])

  // Helper: Sync single day log to Cloud
  const syncDayLogToCloud = async (dateStr, dayData) => {
    if (!authUser) return
    try {
      await supabase.from('daily_logs').upsert({
        user_id: authUser.id,
        date: dateStr,
        data: dayData,
        updated_at: new Date().toISOString()
      })
    } catch (e) {
      console.error("Failed to sync log to cloud", e)
    }
  }

  // Helper: Sync profile updates to Supabase
  const syncProfileUpdateToSupabase = async (data, newMacros) => {
    if (!authUser) return
    try {
      const updates = {}
      if (data.name !== undefined) updates.name = data.name
      if (data.cycleStart !== undefined) updates.cycle_start = data.cycleStart
      if (data.cycleLength !== undefined) updates.cycle_length = data.cycleLength
      if (data.periodLength !== undefined) updates.period_length = data.periodLength
      if (data.bleedingLengthDays !== undefined) updates.bleeding_length_days = data.bleedingLengthDays
      if (data.age !== undefined) updates.age = data.age
      if (data.height !== undefined) updates.height = data.height
      if (data.weight !== undefined) updates.weight = data.weight
      if (data.targetWeight !== undefined) updates.target_weight = data.targetWeight
      if (data.goal !== undefined) updates.goal = data.goal
      if (data.activity !== undefined) updates.activity_level = data.activity
      if (data.trainingFrequency !== undefined) updates.training_frequency = data.trainingFrequency
      if (data.trainingType !== undefined) updates.training_type = data.trainingType
      if (data.experienceLevel !== undefined) updates.experience_level = data.experienceLevel
      if (data.resultTempo !== undefined) updates.result_tempo = data.resultTempo

      // Cycle Learning
      if (data.periodStartDates !== undefined) updates.period_start_dates = data.periodStartDates
      if (data.cycleHistory !== undefined) updates.cycle_history = data.cycleHistory
      if (data.cycleStats !== undefined) updates.cycle_stats = data.cycleStats

      // Add New Macros if recalculated
      if (newMacros) {
        updates.target_calories = newMacros.calories
        updates.target_protein = newMacros.p
        updates.target_carbs = newMacros.c
        updates.target_fat = newMacros.f
      }

      // Only fire update if we mapped fields
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString()

        await supabase.from('profiles').upsert({
          id: authUser.id,
          ...updates
        })
      }
    } catch (err) {
      console.error('Failed to sync profile update to Supabase:', err)
    }
  }

  // ------------------------------------------------------------------
  // UPDATE USER FUNCTION
  // ------------------------------------------------------------------

  const updateUser = async (updates) => {
    // 1. Update local state immediately (optimistic)
    setUser(prev => ({ ...prev, ...updates }))

    // 2. Sync to Supabase in background
    await syncProfileUpdateToSupabase(updates)
  }

  // ------------------------------------------------------------------
  // NEW DETERMINISTIC SYSTEM (Feb 2026)
  // ------------------------------------------------------------------

  const saveProfileAndCalculate = async (profileData) => {
    try {
      if (!authUser) throw new Error("User not authenticated");

      // 1. Prepare Profile Object
      // Ensure numbers are numbers
      const cleanProfile = {
        ...user,
        ...profileData,
        weight_kg: Number(profileData.weight || user.weight),
        height_cm: Number(profileData.height || user.height),
        age: Number(profileData.age || user.age),
        goal: profileData.goal || user.goal,
        training_days_per_week: Number(profileData.trainingFrequency || user.trainingFrequency || 0),
        lifestyle_level: profileData.lifestyle_level || user.lifestyle_level || 'sedentary',
        steps_range: profileData.steps_range || user.steps_range || 'lt4k'
      };

      // 2. Calculate Targets (Range Based)
      const targets = calculateTargetRanges(cleanProfile);
      if (!targets) throw new Error("Failed to calculate targets");

      console.log("Calculated Targets:", targets);

      // 3. Save to Supabase
      // A. Update Profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUser.id,
        // Nutrition/Body Fields
        name: cleanProfile.name, // Ensure Name is saved
        weight: cleanProfile.weight_kg,
        target_weight: cleanProfile.target_weight, // Ensure Target Weight
        height: cleanProfile.height_cm,
        age: cleanProfile.age,
        goal: cleanProfile.goal,
        training_days_per_week: cleanProfile.training_days_per_week,
        lifestyle_level: cleanProfile.lifestyle_level,
        steps_range: cleanProfile.steps_range,

        // Preserve other fields
        cycle_start: cleanProfile.cycleStart,
        cycle_length: cleanProfile.cycleLength,
        period_length: cleanProfile.periodLength,
        updated_at: new Date().toISOString()
      });

      if (profileError) throw profileError;

      // B. Save Computed Targets
      const { error: targetError } = await supabase.from('computed_targets').upsert({
        user_id: authUser.id,
        tdee_estimate: targets.tdee_estimate,
        calorie_target_min: targets.calorie_target_min,
        calorie_target_max: targets.calorie_target_max,
        protein_g_min: targets.protein_g_min,
        protein_g_max: targets.protein_g_max,
        fat_g_min: targets.fat_g_min,
        fat_g_max: targets.fat_g_max,
        carbs_g_min: targets.carbs_g_min,
        carbs_g_max: targets.carbs_g_max,
        updated_at: new Date().toISOString()
      });

      if (targetError) throw targetError;

      // 4. Update Local State
      setUser(prev => ({
        ...prev,
        ...cleanProfile,
        macroTargets: {
          calories: targets.calorie_target_min,
          caloriesMax: targets.calorie_target_max,
          proteinMin: targets.protein_g_min,
          proteinMax: targets.protein_g_max,
          fatMin: targets.fat_g_min,
          fatMax: targets.fat_g_max,
          carbsMin: targets.carbs_g_min,
          carbsMax: targets.carbs_g_max
        },
        nutritionDebug: {
          tdee: targets.tdee_estimate
        }
      }));

      return targets;

    } catch (err) {
      console.error("Save & Calculate Error:", err);
      throw err;
    }
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true)
    localStorage.setItem('cyclus_onboarded', 'true')

    // Sync to Supabase
    if (authUser) {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        is_onboarded: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  // NEW: Explicitly Reset Onboarding (Keep data, just redo setup)
  // Fix: Force reload to ensure clean state
  const resetOnboarding = async () => {
    try {
      if (authUser?.id) {
        const { error } = await supabase.from('profiles').update({
          is_onboarded: false,
          updated_at: new Date().toISOString()
        }).eq('id', authUser.id)

        if (error) throw error
      }

      setIsOnboarded(false)
      localStorage.removeItem('cyclus_onboarded')

      // Force reload to clear all context state and re-route to Onboarding
      window.location.href = '/'

    } catch (e) {
      console.error("Reset Onboarding Failed:", e)
      alert("Kon onboarding niet resetten: " + e.message)
    }
  }

  // Soft Reset: Clear stats but keep Account (Name, Email, Password)
  const resetData = () => {
    // Note: This logic might need to clear actual localStorage keys if "reset" means "wipe data"
    // For now keeping UI reset behavior
    setUser(prev => ({
      ...prev,
      cycleStart: null,
      cycleLength: 28,
      periodLength: 5,
      isMenstruatingNow: false,
      lastCheckInDate: null,
      age: '',
      height: '',
      weight: '',
      goal: 'maintain',
      logs: {},
      foodLogs: [],
      movementLogs: []
    }))
    setIsOnboarded(false)
    localStorage.removeItem('cyclus_onboarded')
  }

  // DELETE ACCOUNT (Real Deletion)
  const deleteAccount = async () => {
    try {
      if (!authUser?.id) return

      // 1. Try to call RPC (Best Case: Deletes Auth User + Cascade)
      const { error: rpcError } = await supabase.rpc('delete_user_account')

      if (rpcError) {
        console.warn("RPC delete_user_account failed (likely not exists), falling back to manual delete.", rpcError)

        // 2. Fallback: Delete Profile + Data manually
        // Note: This leaves the Auth User, but removes all app data.
        await supabase.from('food_logs').delete().eq('user_id', authUser.id)
        await supabase.from('custom_foods').delete().eq('user_id', authUser.id)
        await supabase.from('computed_targets').delete().eq('user_id', authUser.id)
        await supabase.from('profiles').delete().eq('id', authUser.id)
      }

      // 3. Clear Local State
      setIsOnboarded(false)
      localStorage.clear() // Wipe everything

      // 4. Sign Out
      await signOut()

      // 5. Hard Reload
      window.location.href = '/'

    } catch (e) {
      console.error("Delete Account Failed:", e)
      alert("Kon account niet verwijderen (probeer opnieuw): " + e.message)
    }
  }

  // NEW: Log Food with Auto-Calculation
  // Supports both regular foods (foodId + grams) and configurable foods (configData)
  const logFood = async (foodId, grams, dateStrOrConfigData, configData) => {
    const today = getLocalDateStr()

    // Handle configurable food (when grams is null and configData is passed)
    if (grams === null && typeof dateStrOrConfigData === 'object') {
      const config = dateStrOrConfigData
      const targetDate = today

      const newLog = {
        id: crypto.randomUUID(), // Use real UUID
        user_id: authUser.id,
        date: targetDate, // YYYY-MM-DD
        foodId: foodId, // 'config-ID'
        name: config.foodName,
        grams: null,
        quantity: config.quantity,
        item_type: 'product', // or 'recipe' if needed
        configId: config.configId,
        selectedVariants: config.selectedVariants,
        kcal: config.calculatedMacros.kcal,
        p: config.calculatedMacros.protein,
        c: config.calculatedMacros.carbs,
        f: config.calculatedMacros.fat,
        fiber: config.calculatedMacros.fiber
      }

      // 1. Optimistic UI
      setUser(prev => ({
        ...prev,
        foodLogs: [...(prev.foodLogs || []), newLog]
      }))

      // 2. Persist to DB
      try {
        const { error } = await supabase.from('food_logs').insert({
          id: newLog.id,
          user_id: newLog.user_id,
          date: newLog.date,
          food_id: newLog.foodId,
          name: newLog.name,
          quantity: newLog.quantity,
          item_type: 'product',
          config_id: newLog.configId,
          selected_variants: newLog.selectedVariants,
          kcal: newLog.kcal,
          protein: newLog.p,
          carbs: newLog.c,
          fat: newLog.f
        })
        if (error) throw error
      } catch (e) {
        console.error("Failed to log food:", e)
        alert(`Fout bij opslaan: ${e.message || JSON.stringify(e)}`)
        // Rollback optimistic update
        setUser(prev => ({
          ...prev,
          foodLogs: prev.foodLogs.filter(l => l.id !== newLog.id)
        }))
      }
      return
    }

    // Handle regular food (foodId + grams)
    const targetDate = (typeof dateStrOrConfigData === 'string') ? dateStrOrConfigData : today
    // Fix: Handle both string and number inputs for IDs
    const food = user.foods.find(f => String(f.id) === String(foodId))

    if (!food) {
      console.error("Food not found for ID:", foodId)
      return
    }

    const factor = grams / 100
    const newLog = {
      id: crypto.randomUUID(),
      user_id: authUser.id,
      date: targetDate,
      foodId: food.id,
      name: food.name_nl,
      grams: parseInt(grams),
      quantity: 1,
      item_type: 'product',
      kcal: Math.round(food.kcal_100 * factor),
      p: parseFloat((food.protein_100 * factor).toFixed(1)),
      c: parseFloat((food.carbs_100 * factor).toFixed(1)),
      f: parseFloat((food.fat_100 * factor).toFixed(1))
    }

    // 1. Optimistic UI
    setUser(prev => ({
      ...prev,
      foodLogs: [...(prev.foodLogs || []), newLog]
    }))

    // 2. Persist to DB
    try {
      const { error } = await supabase.from('food_logs').insert({
        id: newLog.id,
        user_id: newLog.user_id,
        date: newLog.date,
        food_id: newLog.foodId,
        name: newLog.name,
        grams: newLog.grams,
        quantity: 1,
        item_type: 'product',
        kcal: newLog.kcal,
        protein: newLog.p,
        carbs: newLog.c,
        fat: newLog.f
      })
      if (error) throw error
    } catch (e) {
      console.error("Failed to log food:", e)
      alert(`Fout bij opslaan: ${e.message || JSON.stringify(e)}`)
      // Rollback optimistic update
      setUser(prev => ({
        ...prev,
        foodLogs: prev.foodLogs.filter(l => l.id !== newLog.id)
      }))
    }
  }

  // NEW: Delete Log
  const deleteFoodLog = async (logId) => {
    // 1. Update State
    setUser(prev => ({
      ...prev,
      foodLogs: prev.foodLogs.filter(log => log.id !== logId)
    }))

    // 2. Persist
    // 2. Persist
    try {
      const { error } = await supabase.from('food_logs').delete().eq('id', logId)
      if (error) throw error
    } catch (e) {
      console.error("Failed to delete log", e)
      alert("Kon item niet verwijderen: " + e.message)
      // No easy rollback for delete yet without refetch
    }
  }

  // NEW: Add Custom Food
  const addCustomFood = async (food) => {
    // 1. Optimistic
    setUser(prev => ({
      ...prev,
      foods: [...prev.foods, food]
    }))

    // 2. Persist
    try {
      await supabase.from('custom_foods').insert({
        id: food.id,
        user_id: authUser.id,
        name_nl: food.name_nl,
        kcal_100: food.kcal_100,
        protein_100: food.protein_100,
        carbs_100: food.carbs_100,
        fat_100: food.fat_100,
        unit_type: food.unit_type
      })
    } catch (e) {
      console.error("Failed to add custom food", e)
    }
  }

  // NEW: Log Movement
  const logMovement = (dateStr, status) => {

    // 1. Update State
    setUser(prev => {
      const others = prev.movementLogs.filter(l => l.date !== dateStr) || []
      return {
        ...prev,
        movementLogs: [...others, { date: dateStr, status }]
      }
    })

    // 2. Persist to Day Log
    try {
      if (!authUser?.id) return
      const dayData = loadDayLog(dateStr, authUser.id)
      dayData.movement = {
        status: status, // 'moved' | 'rest'
        updatedAt: new Date().toISOString()
      }
      saveDayLog(dateStr, dayData, authUser.id)
      syncDayLogToCloud(dateStr, dayData) // Sync
    } catch (e) { console.error(e) }
  }

  // NEW: Log Menstruation (Start of new cycle)
  const logMenstruation = (dateStr = new Date().toISOString()) => {
    const today = new Date(dateStr)
    today.setHours(0, 0, 0, 0)

    // 1. Close previous cycle
    const prevStart = new Date(user.cycleStart)
    prevStart.setHours(0, 0, 0, 0)

    const diffTime = today - prevStart
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Only save history if it's a reasonable length (e.g. > 10 days) to avoid accidental double clicks
    let newHistory = user.cycleHistory || []
    if (diffDays > 10) {
      // Determine what the period length was for this closing cycle
      const periodLen = user.currentPeriodLength !== null && user.currentPeriodLength !== undefined
        ? user.currentPeriodLength
        : user.periodLength

      newHistory = [
        { startDate: user.cycleStart, endDate: dateStr, length: diffDays, periodLength: periodLen },
        ...newHistory
      ]
    }

    // 2. Calculate new average length (Adaptive for Cycle AND Period)
    let newLen = user.cycleLength
    let newPeriodLen = user.periodLength

    if (newHistory.length > 0) {
      // Average Cycle Length: ROLLING AVERAGE (Last 5 confirmed cycles)
      // This allows the app to adapt faster to recent changes.
      const recentHistory = newHistory.slice(0, 5)

      // Filter out outliers (e.g. missed periods > 45 days) before averaging
      const validCycles = recentHistory.filter(c => c.length >= 21 && c.length <= 45)

      if (validCycles.length > 0) {
        const totalLen = validCycles.reduce((sum, c) => sum + c.length, 0)
        newLen = Math.round(totalLen / validCycles.length)
        // newLen = Math.max(21, Math.min(45, newLen)) // Clamp implied
      } else {
        // Fallback to existing length if recent history is all outliers
        newLen = user.cycleLength
      }

      // Average Period Length (only if recorded in history)
      const validPeriodHist = recentHistory.filter(c => c.periodLength)
      if (validPeriodHist.length > 0) {
        const totalPeriod = validPeriodHist.reduce((sum, c) => sum + c.periodLength, 0)
        newPeriodLen = Math.round(totalPeriod / validPeriodHist.length)
        newPeriodLen = Math.max(2, Math.min(10, newPeriodLen)) // Clamp 2-10 days
      }
    }

    // 4. Persist to Day Log (Explicit Status)
    try {
      if (authUser?.id) {
        const dayData = loadDayLog(dateStr, authUser.id)
        dayData.menstruation = { status: 'yes', updatedAt: new Date().toISOString() }
        saveDayLog(dateStr, dayData, authUser.id)
        syncDayLogToCloud(dateStr, dayData)
      }
    } catch (e) { console.error(e) }

    // 3. Update User
    updateUser({
      isMenstruatingNow: true,
      cycleStart: dateStr,
      cycleLength: newLen, // ENABLED: App learns from history
      periodLength: newPeriodLen,
      currentPeriodLength: null,
      lastCheckInDate: null,
      cycleHistory: newHistory,
      // Add to logs
      menstruationLogs: [...user.menstruationLogs.filter(l => l.date !== dateStr), { date: dateStr, status: 'yes' }]
    })
  }

  // NEW: Daily Confirmations
  const confirmPeriodToday = () => {
    const day = currentDay // derived from state (linear count)
    const todayStr = getLocalDateStr()

    // LOGIC: Is this a NEW cycle or continuing an existing one?
    // If day > 5 (arbitrary buffer) and we are not currently menstruating according to state (or just late cycle),
    // and user clicks "Yes", it's likely a new period.
    // If day <= 5, we assume it's the same period.

    // Better logic: If day > periodLength + buffer (e.g. 10), treat as NEW cycle start.
    // OR: If user.isMenstruatingNow is FALSE and day > 5, treat as start.

    // Strict Rule: If we are deep in the cycle (e.g. day 25) and user says "Menstruation", it is Day 1.
    // If we are on day 3 and user says "Menstruation", it is still Day 3 (continuation).

    const isNewCycle = day > 10 // Simple heuristic: after day 10, bleeding = new period.

    if (isNewCycle) {
      logPeriodStart(todayStr)
    } else {
      // Just log confirmation for today, no cycle reset
      // Persist to Day Log
      try {
        if (authUser?.id) {
          const dayData = loadDayLog(todayStr, authUser.id)
          dayData.menstruation = { status: 'yes', updatedAt: new Date().toISOString() }
          saveDayLog(todayStr, dayData, authUser.id)
          syncDayLogToCloud(todayStr, dayData)
        }
      } catch (e) { console.error(e) }

      updateUser({
        isMenstruatingNow: true,
        lastCheckInDate: todayStr,
        menstruationLogs: [...user.menstruationLogs.filter(l => l.date !== todayStr), { date: todayStr, status: 'yes' }]
      })
    }
  }

  const endPeriodToday = () => {
    // If user says "Stopped", it means yesterday was last day.
    // So length = currentDay - 1.
    const day = currentDay
    const todayStr = getLocalDateStr()
    const newLen = Math.max(0, day - 1)

    // Persist 'no' status for today
    try {
      if (authUser?.id) {
        const dayData = loadDayLog(todayStr, authUser.id)
        dayData.menstruation = { status: 'no', updatedAt: new Date().toISOString() }
        saveDayLog(todayStr, dayData, authUser.id)
        syncDayLogToCloud(todayStr, dayData)
      }
    } catch (e) { console.error(e) }

    updateUser({
      isMenstruatingNow: false,
      currentPeriodLength: newLen,
      lastCheckInDate: todayStr,
      menstruationLogs: [...user.menstruationLogs.filter(l => l.date !== todayStr), { date: todayStr, status: 'no' }]
    })
  }

  // Manual Phase Correction - sets manual override flag
  const adjustCyclePhase = (targetPhase) => {
    const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength
    const newStartDate = calculateStartDateFromPhase(targetPhase, effectiveCycleLength, user.bleedingLengthDays || user.periodLength)
    const dateStr = newStartDate.toISOString()

    // Set manual override - this phase will be used until cycle naturally progresses
    const isMenstruating = targetPhase === 'menstrual'

    updateUser({
      cycleStart: dateStr,
      isMenstruatingNow: isMenstruating,
      manualPhaseOverride: true,
      manualPhase: targetPhase
    })
  }

  // Log Period Start - core of cycle learning system
  const logPeriodStart = (date) => {
    const todayStr = date || new Date().toISOString().split('T')[0]

    // Add to history and calculate new stats
    const { periodStartDates: newStarts } = addPeriodStartToHistory(todayStr, user.periodStartDates || [])
    const stats = calculateCycleStats(newStarts, user.cycleLength)

    updateUser({
      periodStartDates: newStarts,
      cycleLengthHistory: stats.cycleLengthHistory,
      // Keep main cycleLength in sync with learned stats
      cycleLength: stats.learnedCycleLength,
      cycleStats: {
        learnedCycleLength: stats.learnedCycleLength,
        variability: stats.variability,
        confidence: stats.confidence
      },
      // Also set cycle start to this date (for backwards compatibility)
      cycleStart: new Date(todayStr).toISOString(),
      isMenstruatingNow: true,
      // Clear manual override when new period is logged
      manualPhaseOverride: false,
      manualPhase: null
    })
  }

  // Get Cycle Predictions with learning system
  const getCyclePredictions = () => {
    const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength
    const bleedingDays = user.bleedingLengthDays || user.periodLength || 5
    const confidence = user.cycleStats?.confidence || 'low'

    // Calculate days until next period
    const nextPeriodDate = predictNextPeriodStart(user.periodStartDates || [], effectiveCycleLength)
    let daysUntilNext = null

    if (nextPeriodDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const next = new Date(nextPeriodDate)
      next.setHours(0, 0, 0, 0)
      daysUntilNext = Math.round((next - today) / (1000 * 60 * 60 * 24))
    } else {
      // Fallback to old calculation
      daysUntilNext = effectiveCycleLength - currentDay + 1
    }

    // Get ovulation window (estimated)
    let ovulationWindow = null
    if (nextPeriodDate) {
      ovulationWindow = getOvulationWindow(nextPeriodDate, 14) // 14 day luteal
    }

    return {
      nextPeriodIn: Math.max(0, daysUntilNext || 0),
      nextPeriodDate,
      ovulationWindow,
      isFertile: currentPhase === 'ovulatory',
      confidence,
      cycleLength: effectiveCycleLength,
      bleedingDays,
      isEstimated: true // Always mark ovulation as estimated
    }
  }



  // NEW: Get Stats for ANY Date
  const getStatsForDate = (dateStr) => {
    // dateStr should be YYYY-MM-DD
    const logs = user.foodLogs?.filter(log => log.date === dateStr) || []

    return logs.reduce((acc, log) => ({
      kcal: acc.kcal + toNum(log.kcal),
      p: acc.p + toNum(log.p),
      c: acc.c + toNum(log.c),
      f: acc.f + toNum(log.f)
    }), { kcal: 0, p: 0, c: 0, f: 0 })
  }

  // Get Phase for ANY Date - prioritizes manual override, uses learned cycle length
  const getPhaseForDate = (dateStr) => {
    const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength
    const effectiveBleedingDays = user.bleedingLengthDays || user.periodLength || 5
    const dayCount = calculateCycleDay(user.cycleStart, effectiveCycleLength, dateStr)
    const hasValidStart = !!user.cycleStart

    // Check if viewing today
    const todayStr = new Date().toISOString().split('T')[0]
    const isViewingToday = dateStr === todayStr

    // PRIORITY: If manual phase override is active and viewing today, use manual phase
    if (isViewingToday && user.manualPhaseOverride && user.manualPhase) {
      return {
        phase: user.manualPhase,
        day: dayCount,
        confidence: user.cycleStats?.confidence || 'low'
      }
    }

    // Normal calculation using learned data
    const isMenstruating = isViewingToday && user.isMenstruatingNow

    return {
      phase: getPhaseForDay(dayCount, effectiveCycleLength, effectiveBleedingDays, isMenstruating, hasValidStart),
      day: dayCount,
      confidence: user.cycleStats?.confidence || 'low'
    }
  }

  // DEPRECATED: Legacy manual log (keeping for compatibility if needed, but UI will stop using it)
  const logMacros = (macros) => {
    // No-op or migration logic could go here
    console.warn("logMacros is deprecated. Use logFood instead.")
  }

  const logout = () => {
    setIsOnboarded(false)
    localStorage.removeItem('cyclus_onboarded')
    // Also sign out from Supabase auth
    if (signOut) signOut()
  }

  const deleteAccount = () => {
    setIsOnboarded(false)
    localStorage.removeItem('cyclus_onboarded')
    localStorage.removeItem('cyclus_user')
    // Reset state to empty
    setUser({
      name: '',
      email: '',
      password: '',
      cycleStart: new Date().toISOString(),
      cycleLength: 28,
      periodLength: 5,
      age: '',
      height: '',
      weight: '',
      activity: 1.55,
      goal: 'maintain',
      tracking: 'now',
      logs: {},
      foodLogs: [],
      foods: user.foods // Keep seeds
    })
  }

  // 7. Derived Logic (Moved to top)
  // [REMOVED] - Already declared above

  // 8. Context Value
  const value = useMemo(() => ({
    user,
    isOnboarded,
    hasOnboarded: isOnboarded,
    isLoading,
    updateUser,
    saveProfileAndCalculate, // EXPORTED
    completeOnboarding,
    resetOnboarding,
    resetData,
    logFood,
    deleteFoodLog,
    addCustomFood, // NEW
    logMovement,
    logMenstruation,
    confirmPeriodToday,
    endPeriodToday,
    adjustCyclePhase,
    logPeriodStart,
    getCyclePredictions,
    logout,
    deleteAccount,
    getStatsForDate,
    getPhaseForDate,
    currentDay,
    currentPhase,
    isPeriodOverridden: user.currentPeriodLength !== null,
    targets,
    movementLogs: user.movementLogs || [],
    menstruationLogs: user.menstruationLogs || [],
    // Cycle learning data exports
    cycleStats: user.cycleStats,
    periodStartDates: user.periodStartDates || []
  }), [user, isOnboarded, isLoading, currentDay, currentPhase, targets])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
