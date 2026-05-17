import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useLanguage } from './LanguageContext'
// ... (omitting lines for brevity, targeting the import)
import { calculateCycleDay, getPhaseForDay, calculateStartDateFromPhase, getCyclePrediction } from '../logic/cycle'
import { calculateCycleStats, addPeriodStart as addPeriodStartToHistory, predictNextPeriodStart, getOvulationWindow, calculateAveragePeriodLength } from '../logic/cycle-learning'
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
  // Contexts
  const { user: authUser, getAccessToken, signOut } = useAuth()
  const { language: currentUiLanguage, setLanguage: setUiLanguage } = useLanguage()

  // 1. Loading State
  const [isLoading, setIsLoading] = useState(true)

  // 2. Onboarding State
  // Initialize synchronously from localStorage to prevent onboarding flash
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('cyclus_onboarded') === 'true')

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
    resultTempo: 'average', // New Field
    tracking: 'now',
    cycleHistory: [], // [{ startDate, endDate, length }] - Legacy
    logs: {}, // Archived logs

    // MVP Food Database (Seeded)
    foods: FOOD_DATABASE || [],

    foodLogs: [], // Array of { id, date, foodId, grams, ... }
    movementLogs: [], // Array of { id, date, status }
    weightLogs: [], // Array of { date, weight }
    waterLogs: [], // Array of { date, amount_ml }
    stepLogs: [], // Array of { date, steps }
    symptomLogs: [], // Array of { date, symptoms: [] }

    // Menstruation Logs (Explicit Check-ins)
    // Menstruation Logs (Explicit Check-ins)
    menstruationLogs: [], // { date, status }
    
    // Language Preference
    user_language: localStorage.getItem('app_language') || 'nl'
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

  // --- CORE CYCLE LOGIC (Source of Truth) ---
  const isDateInPeriod = (dateStr, currentUser) => {
    const logs = currentUser?.menstruationLogs || []
    const explicitLog = logs.find(l => l.date === dateStr)

    // 1. Explicit match overrides everything
    if (explicitLog) {
      return explicitLog.status === 'yes'
    }

    // 2. Intelligent Auto-fill logic
    const checkDate = new Date(dateStr)
    checkDate.setHours(0, 0, 0, 0)
    const today = new Date(getLocalDateStr())
    today.setHours(0, 0, 0, 0)

    // Find most recent 'yes' BEFORE or EXACTLY at this checkDate
    const pastYesLogs = logs
      .filter(l => l.status === 'yes' && new Date(l.date) <= checkDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    if (pastYesLogs.length === 0) return false

    // We need to find the TRUE start date of the current cluster.
    // If the database has consecutive explicit 'yes' logs (e.g. from old auto-fill),
    // pastYesLogs[0] might be the LAST day of the explicit logs, not the first!
    // So we walk backwards through the consecutive days.
    let clusterStartDate = new Date(pastYesLogs[0].date)
    clusterStartDate.setHours(0, 0, 0, 0)

    for (let i = 1; i < pastYesLogs.length; i++) {
      const prevDate = new Date(pastYesLogs[i].date)
      prevDate.setHours(0, 0, 0, 0)
      const diff = Math.round((clusterStartDate - prevDate) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        // It's consecutive, so push the start date back
        clusterStartDate = prevDate
      } else if (diff === 0) {
        // Redundant log for same day, ignore
      } else {
        // Gap > 1 day, we found the boundary
        break
      }
    }

    const startDate = clusterStartDate

    // Find if there is a 'no' (stop event) AFTER this start date
    // Sort ascending to find the FIRST stop event
    const stopLogs = logs
      .filter(l => l.status === 'no' && new Date(l.date) > startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const stopDate = stopLogs.length > 0 ? new Date(stopLogs[0].date) : null
    if (stopDate) stopDate.setHours(0, 0, 0, 0)

    const expectedLength = currentUser.bleedingLengthDays || currentUser.periodLength || 5
    const expectedEndDate = new Date(startDate)
    expectedEndDate.setDate(startDate.getDate() + expectedLength - 1)

    // Three rules for being an active period day:
    // Case A: The period was explicitly stopped
    if (stopDate) {
      // It is a period day if it falls BEFORE the stop date
      return checkDate >= startDate && checkDate < stopDate
    }

    // Case B: The period has NOT been stopped yet
    // Rule B1: Up to today, EVERY day since startDate is a period day
    if (checkDate <= today) {
      return checkDate >= startDate
    }
    
    // Rule B2: For future dates (> today), it projects linearly up to expectedEndDate
    if (checkDate > today) {
      return checkDate <= expectedEndDate
    }

    return false
  }

  const getPhaseForDate = useCallback((dateStr) => {
    if (!user) return { phase: 'follicular', day: 1, confidence: 'low' }
    const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength || 28
    const effectiveBleedingDays = user.bleedingLengthDays || user.periodLength || 5
    const dayCount = calculateCycleDay(user.cycleStart, effectiveCycleLength, dateStr)
    const hasValidStart = !!user.cycleStart

    // 1. PRIORITY: Manual Log check for THIS specific date
    if (isDateInPeriod(dateStr, user)) {
      return {
        phase: 'menstrual',
        day: dayCount,
        confidence: 'high'
      }
    }

    // 2. Check for manual override or live toggle (TODAY ONLY)
    const todayStr = getLocalDateStr()
    const isViewingToday = dateStr === todayStr

    if (isViewingToday && user.manualPhaseOverride && user.manualPhase) {
      return {
        phase: user.manualPhase,
        day: dayCount,
        confidence: 'high'
      }
    }

    const isMenstruating = isViewingToday && user.isMenstruatingNow

    return {
      phase: getPhaseForDay(dayCount, effectiveCycleLength, effectiveBleedingDays, isMenstruating, hasValidStart),
      day: dayCount,
      confidence: user.cycleStats?.confidence || 'low'
    }
  // Only regenerate when cycle-related data changes, NOT on food/water/step log changes
  }, [user.cycleStart, user.cycleLength, user.cycleStats, user.bleedingLengthDays, user.periodLength, user.menstruationLogs, user.isMenstruatingNow, user.manualPhaseOverride, user.manualPhase])

  // Determine current phase - MUST match getPhaseForDate logic for today
  const currentPhase = useMemo(() => {
    const todayStr = getLocalDateStr()
    return getPhaseForDate(todayStr).phase
  }, [user, user.menstruationLogs, currentDay]) // Recalculate when user logs change

  // Derived: Is Menstruating NOW? (Absolute Source of Truth for UI)
  const isMenstruatingNow = useMemo(() => {
    const todayStr = getLocalDateStr()
    return isDateInPeriod(todayStr, user)
  }, [user.menstruationLogs])

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
            resultTempo: profile.result_tempo || 'average',
            experienceLevel: profile.experience_level || 'beginner',
            trainingType: profile.training_type || 'combination',
            // Cycle Learning
            periodStartDates: profile.period_start_dates || [],
            cycleHistory: profile.cycle_history || [],
            cycleStats: profile.cycle_stats || {},
            manualPhaseOverride: profile.manual_phase_override || false,
            manualPhase: profile.manual_phase || null,
            macroTargets: null,
            isAdmin: profile.is_admin || false,
            // CRITICAL: Restore menstruationLogs from Supabase so phase persists across reloads
            menstruationLogs: profile.menstruation_logs || [],
            user_language: profile.user_language || 'nl'
          }

          // Sync UI language with profile preference if they differ
          if (profile.user_language && profile.user_language !== currentUiLanguage) {
            setUiLanguage(profile.user_language)
          }

          if (profile.is_onboarded) {
            setIsOnboarded(true)
            localStorage.setItem('cyclus_onboarded', 'true')
          }

          // AFTER LOAD: Safety check (isMenstruatingNow is now derived, so we just set state)
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
            fiber_100: Number(f.fiber_100 || 0),
            unit_type: f.unit_type || 'per_100g',
            unit_name: f.unit_name,
            unit_weight: f.unit_weight ? Number(f.unit_weight) : null,
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
            unitName: log.unit_name,
            kcal: Number(log.kcal),
            p: Number(log.protein),
            c: Number(log.carbs),
            f: Number(log.fat),
            fiber: Number(log.fiber || 0),
            item_type: log.item_type,
            configId: log.config_id,
            selectedVariants: log.selected_variants
          }))
          setUser(prev => ({
            ...prev,
            foodLogs: mappedLogs
          }))
        }

        // B4. Fetch Movement Logs (NEW)
        const { data: dbMovement } = await supabase
          .from('movement_logs')
          .select('*')
          .eq('user_id', authUser.id)

        // Always set property, default to empty array
        setUser(prev => ({
          ...prev,
          movementLogs: dbMovement ? dbMovement.map(m => ({ date: m.date, status: m.status, id: m.id })) : []
        }))

        // B5. Fetch Weight Logs
        const { data: dbWeightLogs } = await supabase
          .from('weight_logs')
          .select('weight, date')
          .eq('user_id', authUser.id)
          .order('date', { ascending: true })

        if (dbWeightLogs && dbWeightLogs.length > 0) {
          setUser(prev => ({
            ...prev,
            weightLogs: dbWeightLogs.map(w => ({ date: w.date, weight: Number(w.weight) }))
          }))
        }

        // B6. Fetch Water Logs
        const { data: dbWaterLogs } = await supabase
          .from('water_logs')
          .select('date, amount_ml')
          .eq('user_id', authUser.id)

        if (dbWaterLogs) {
          setUser(prev => ({
            ...prev,
            waterLogs: dbWaterLogs.map(w => ({ date: w.date, amount_ml: Number(w.amount_ml) }))
          }))
        }

        // B7. Fetch Symptom Logs
        const { data: dbSymptomLogs } = await supabase
          .from('symptom_logs')
          .select('*')
          .eq('user_id', authUser.id)

        if (dbSymptomLogs) {
          setUser(prev => ({
            ...prev,
            symptomLogs: dbSymptomLogs.map(s => ({ date: s.date, symptoms: s.symptoms || [] }))
          }))
        }
        
        // B8. Fetch Step Logs
        const { data: dbStepLogs } = await supabase
          .from('step_logs')
          .select('date, steps')
          .eq('user_id', authUser.id)

        if (dbStepLogs) {
          setUser(prev => ({
            ...prev,
            stepLogs: dbStepLogs.map(s => ({ date: s.date, steps: Number(s.steps) }))
          }))
        }

        // End of try
        setIsLoading(false)
      } catch (err) {
        console.error('User init/sync failed:', err)
        // If we fail critically and don't know the onboarding state, DO NOT stop loading!
        // Stopping loading would force the user to Onboarding by mistake.
        if (!isOnboarded && authUser) {
           console.error('Critical sync failed! Staying in loading state to prevent onboarding flash.')
           return // Keep isLoading true
        }
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

  // Helper: Defensive Upsert for Profiles (handles missing columns gracefully)
  const defensiveProfileUpsert = async (payload) => {
    try {
      const { error } = await supabase.from('profiles').upsert(payload)
      if (error) {
        if (error.code === '42703') {
          // Haal de kolomnaam uit de error message (bijv: column "is_menstruating_now" of relation "profiles" does not exist)
          const match = error.message.match(/column "([^"]+)"/);
          if (match && match[1]) {
            const badCol = match[1];
            console.warn(`Column ${badCol} missing in profiles table, retrying without it.`);
            const newPayload = { ...payload };
            delete newPayload[badCol];
            // Retry met de gestripte payload
            const { error: retryError } = await supabase.from('profiles').upsert(newPayload);
            if (retryError) {
              if (retryError.code === '42703') {
                 // Als er nog een mist, laat de backend falen zodat we het zien, of wees recursief (voor nu gooien we het om loop te voorkomen)
                 throw retryError;
              } else {
                 throw retryError;
              }
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error("Defensive profile upsert failed:", err)
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
      if (data.trainingFrequency !== undefined) updates.training_days_per_week = data.trainingFrequency
      if (data.trainingType !== undefined) updates.training_type = data.trainingType
      if (data.experienceLevel !== undefined) updates.experience_level = data.experienceLevel
      if (data.resultTempo !== undefined) updates.result_tempo = data.resultTempo
      if (data.isMenstruatingNow !== undefined) updates.is_menstruating_now = data.isMenstruatingNow

      // Cycle Learning
      if (data.periodStartDates !== undefined) updates.period_start_dates = data.periodStartDates
      if (data.cycleHistory !== undefined) updates.cycle_history = data.cycleHistory
      if (data.cycleStats !== undefined) updates.cycle_stats = data.cycleStats

      // Menstruation Logs (Calendar Interactions)
      if (data.menstruationLogs !== undefined) updates.menstruation_logs = data.menstruationLogs

      // Manual Phase Override
      if (data.manualPhaseOverride !== undefined) updates.manual_phase_override = data.manualPhaseOverride
      if (data.manualPhase !== undefined) updates.manual_phase = data.manualPhase

      if (data.user_language !== undefined) updates.user_language = data.user_language

      if (data.experienceLevel !== undefined) updates.experience_level = data.experienceLevel
      if (data.resultTempo !== undefined) updates.result_tempo = data.resultTempo
      if (data.trainingType !== undefined) updates.training_type = data.trainingType

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
        await defensiveProfileUpsert({
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
    // Safety: prevent clobbering isMenstruatingNow if accidentally passed
    const { isMenstruatingNow: _ignored, ...cleanUpdates } = updates

    // 1. Update local state immediately (optimistic)
    setUser(prev => {
      return { ...prev, ...cleanUpdates }
    })

    // 2. Sync to Supabase in background
    await syncProfileUpdateToSupabase(updates)

    // 3. Sync UI Language if language was updated
    if (updates.user_language) {
      setUiLanguage(updates.user_language)
    }
  }

  // ------------------------------------------------------------------
  // NEW DETERMINISTIC SYSTEM (Feb 2026)
  // ------------------------------------------------------------------

  const saveProfileAndCalculate = async (profileData) => {
    try {
      // Find the user ID: either passed in (for first signup), or from authUser, or from profileData
      const userId = profileData.id || authUser?.id;
      if (!userId) throw new Error("Gebruiker niet gevonden (niet ingelogd)");

      // 1. Prepare Profile Object
      // Ensure numbers are numbers
      const cleanProfile = {
        ...user,
        ...profileData,
        weight_kg: Number(profileData.weight || user.weight || 0),
        target_weight: Number(profileData.targetWeight || user.targetWeight || 0), // Fix: use targetWeight
        height_cm: Number(profileData.height || user.height || 0),
        age: Number(profileData.age || user.age || 0),
        goal: profileData.goal || user.goal,
        training_days_per_week: Number(profileData.trainingFrequency || user.trainingFrequency || 0),
        lifestyle_level: profileData.lifestyle_level || user.lifestyle_level || 'sedentary',
        steps_range: profileData.steps_range || user.steps_range || 'lt4k',
        resultTempo: profileData.resultTempo || user.resultTempo || 'average' // Explicitly captured
      };

      // 2. Calculate Targets (Range Based)
      const targets = calculateTargetRanges(cleanProfile);
      if (!targets) throw new Error("Failed to calculate targets");

      console.log("Calculated Targets:", targets);

      // 3. Save to Supabase
      // B1. Upsert Profile
      // Zorg dat we cycleStart direct ook in menstruationLogs zetten zodat de kalender het ziet!
      const cycleStartDate = profileData.cycleStart || user.cycleStart;
      let updatedMenstruationLogs = user.menstruationLogs || [];
      
      if (cycleStartDate) {
        const cycleStartStr = String(cycleStartDate).split('T')[0];
        if (!updatedMenstruationLogs.some(l => l.date === cycleStartStr && l.status === 'yes')) {
          updatedMenstruationLogs = [...updatedMenstruationLogs.filter(l => l.date !== cycleStartStr), { date: cycleStartStr, status: 'yes' }];
        }
      }

      await defensiveProfileUpsert({
        id: userId,
        name: profileData.name || user.name || '',
        age: profileData.age || user.age || 0,
        height: profileData.height || user.height || 0,
        weight: profileData.weight || user.weight || 0,
        target_weight: profileData.targetWeight || user.targetWeight || 0,
        cycle_start: cycleStartDate,
        cycle_length: profileData.cycleLength || user.cycleLength || 28,
        period_length: profileData.periodLength || user.periodLength || 5,
        bleeding_length_days: profileData.periodLength || user.periodLength || 5,
        goal: profileData.goal || user.goal || 'maintain',
        activity_level: profileData.activity || user.activity || 'sedentary',
        training_days_per_week: Number(profileData.trainingFrequency || user.trainingFrequency || 0),
        lifestyle_level: profileData.lifestyle_level || user.lifestyle_level || 'sedentary',
        steps_range: profileData.steps_range || user.steps_range || 'lt4k',
        result_tempo: profileData.resultTempo || user.resultTempo || 'average',
        experience_level: profileData.experienceLevel || user.experienceLevel || 'beginner',
        training_type: profileData.trainingType || user.trainingType || 'combination',
        is_onboarded: true,
        is_menstruating_now: profileData.isMenstruatingNow !== undefined ? profileData.isMenstruatingNow : (user.isMenstruatingNow || false),
        menstruation_logs: updatedMenstruationLogs,
        updated_at: new Date().toISOString()
      });

      // AUTO-LOG cycleStart into period_start_dates (so it shows on the calendar legacy views)
      if (cycleStartDate) {
        const cycleStartStr = String(cycleStartDate).split('T')[0]; // ensure YYYY-MM-DD
        const existingDates = user.periodStartDates || [];
        if (!existingDates.includes(cycleStartStr)) {
          const updatedDates = [...existingDates, cycleStartStr].sort();
          await supabase.from('profiles').update({
            period_start_dates: updatedDates,
            updated_at: new Date().toISOString()
          }).eq('id', userId);
          // Update local state too
          setUser(prev => ({ 
             ...prev, 
             periodStartDates: updatedDates,
             menstruationLogs: updatedMenstruationLogs 
          }));
        } else {
          // If existingDates already included it, we still want to make sure menstruationLogs is updated in local state
          setUser(prev => ({ 
             ...prev, 
             menstruationLogs: updatedMenstruationLogs 
          }));
        }
      }

      // B2. Auto-log weight if changed
      const newWeight = cleanProfile.weight_kg
      if (newWeight && newWeight > 0) {
        const todayStr = new Date().toISOString().split('T')[0]
        
        // Manual check-and-update to avoid missing unique constraint crashing the upsert
        const { data: existingLog } = await supabase
          .from('weight_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .maybeSingle()

        if (existingLog) {
          await supabase.from('weight_logs').update({ weight: newWeight }).eq('id', existingLog.id)
        } else {
          await supabase.from('weight_logs').insert({ id: crypto.randomUUID(), user_id: userId, weight: newWeight, date: todayStr })
        }
                // Update local weight logs
        setUser(prev => {
          const existing = (prev.weightLogs || []).filter(l => l.date !== todayStr)
          return { ...prev, weightLogs: [...existing, { date: todayStr, weight: newWeight }].sort((a, b) => a.date.localeCompare(b.date)) }
        })
      }

      const { error: targetError } = await supabase.from('computed_targets').upsert({
        user_id: userId,
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

    // SUBSCRIPTION BYPASSED FOR TESTING - redirect straight to app
    window.location.href = '/'
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

  // LOGOUT (Simple) - defined inline in context value to avoid HMR scoping issues

  // DELETE ACCOUNT (Secure Server-Side Deletion)
  const deleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Niet ingelogd')

      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Verwijderen mislukt')
      }

      // Clear Local State
      setIsOnboarded(false)
      localStorage.clear() 

      // Sign Out locally
      await signOut()

      // Hard Reload to reset app state
      window.location.href = '/'

    } catch (e) {
      console.error("Delete Account Failed:", e)
      throw e // Let the UI handle the error message
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
          fat: newLog.f,
          fiber: newLog.fiber
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

    // Support for unit-based logging
    let finalGrams = grams
    let finalQuantity = 1
    let finalUnitName = null

    // If configData contains unit info from FoodModal
    if (configData?.unitType === 'unit' && food.unit_weight) {
      finalQuantity = grams // In this case 'grams' param is actually quantity
      finalGrams = Math.round(finalQuantity * food.unit_weight)
      finalUnitName = food.unit_name
    } else {
      finalGrams = parseInt(grams)
    }

    const factor = finalGrams / 100
    const newLog = {
      id: crypto.randomUUID(),
      user_id: authUser.id,
      date: targetDate,
      foodId: food.id,
      name: food.name_nl,
      grams: finalGrams,
      quantity: finalQuantity,
      unitName: finalUnitName,
      item_type: 'product',
      kcal: Math.round(food.kcal_100 * factor),
      p: parseFloat((food.protein_100 * factor).toFixed(1)),
      c: parseFloat((food.carbs_100 * factor).toFixed(1)),
      f: parseFloat((food.fat_100 * factor).toFixed(1)),
      fiber: parseFloat(((food.fiber_100 || 0) * factor).toFixed(1))
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
        quantity: newLog.quantity,
        unit_name: newLog.unitName,
        item_type: 'product',
        kcal: newLog.kcal,
        protein: newLog.p,
        carbs: newLog.c,
        fat: newLog.f,
        fiber: newLog.fiber
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
        fiber_100: food.fiber_100 || 0,
        unit_type: food.unit_type,
        unit_name: food.unit_name,
        unit_weight: food.unit_weight
      })
    } catch (e) {
      console.error("Failed to add custom food", e)
    }
  }

  // NEW: Log Movement
  const logMovement = async (dateStr, status) => {
    if (!authUser) return

    const newLog = {
      id: crypto.randomUUID(),
      date: dateStr,
      status: status,
      user_id: authUser.id,
      updated_at: new Date().toISOString()
    }

    // 1. Optimistic UI Update
    setUser(prev => {
      // Remove any existing log for this date and add the new one
      const others = prev.movementLogs.filter(l => l.date !== dateStr) || []
      return {
        ...prev,
        movementLogs: [...others, { date: dateStr, status: status, id: newLog.id }]
      }
    })

    // 2. Persist to DB
    try {
      const { error } = await supabase.from('movement_logs').upsert({
        id: newLog.id, // Use the generated ID for upsert
        user_id: newLog.user_id,
        date: newLog.date,
        status: newLog.status,
        updated_at: newLog.updated_at
      }, { onConflict: 'user_id,date' }) // Conflict on user_id and date to update existing entry

      if (error) throw error
    } catch (e) {
      console.error("Failed to log movement to Supabase", e)
      alert(`Fout bij opslaan van beweging: ${e.message || JSON.stringify(e)}`)
      // Rollback optimistic update if DB fails
      setUser(prev => ({
        ...prev,
        movementLogs: prev.movementLogs.filter(l => l.id !== newLog.id)
      }))
    }
  }

  // NEW: Log Water
  const logWater = async (dateStr, amount_ml) => {
    if (!authUser) return

    // 1. Optimistic UI Update
    setUser(prev => {
      const existingLogs = prev.waterLogs || []
      const currentAmount = existingLogs.find(l => l.date === dateStr)?.amount_ml || 0
      const newAmount = currentAmount + amount_ml

      const others = existingLogs.filter(l => l.date !== dateStr)
      return {
        ...prev,
        waterLogs: [...others, { date: dateStr, amount_ml: newAmount }]
      }
    })

    // 2. Persist DB
    try {
      const { data: current } = await supabase.from('water_logs')
        .select('amount_ml').eq('user_id', authUser.id).eq('date', dateStr).maybeSingle()

      const newTotal = (current?.amount_ml || 0) + amount_ml

      const { error } = await supabase.from('water_logs').upsert({
        user_id: authUser.id,
        date: dateStr,
        amount_ml: newTotal,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' })
      if (error) throw error
    } catch (e) { console.error("Failed to log water", e) }
  }

  // NEW: Log Steps
  const logSteps = async (dateStr, steps) => {
    if (!authUser) return
    const newSteps = parseInt(steps) || 0

    // 1. Optimistic UI Update
    setUser(prev => {
      const existingLogs = prev.stepLogs || []
      const others = existingLogs.filter(l => l.date !== dateStr)
      return {
        ...prev,
        stepLogs: [...others, { date: dateStr, steps: newSteps }]
      }
    })

    // 2. Persist DB
    try {
      const { error } = await supabase.from('step_logs').upsert({
        user_id: authUser.id,
        date: dateStr,
        steps: newSteps,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' })
      if (error) throw error
    } catch (e) { console.error("Failed to log steps", e) }
  }

  // NEW: Log Weight
  const logWeight = async (dateStr, weight) => {
    if (!authUser) return
    const newWeight = parseFloat(weight)
    if (isNaN(newWeight)) return

    // 1. Optimistic UI Update
    setUser(prev => {
      const existingLogs = prev.weightLogs || []
      const others = existingLogs.filter(l => l.date !== dateStr)
      return {
        ...prev,
        weight: dateStr === getLocalDateStr(new Date()) ? newWeight : prev.weight,
        weightLogs: [...others, { date: dateStr, weight: newWeight }].sort((a, b) => a.date.localeCompare(b.date))
      }
    })

    // 2. Persist DB safely without relying on a potentially missing unique constraint
    try {
      // First check if it exists
      const { data: existing } = await supabase
        .from('weight_logs')
        .select('id')
        .eq('user_id', authUser.id)
        .eq('date', dateStr)
        .maybeSingle()

      let dbError = null
      if (existing) {
        const { error } = await supabase.from('weight_logs')
          .update({ weight: newWeight })
          .eq('id', existing.id)
        dbError = error
      } else {
        const { error } = await supabase.from('weight_logs')
          .insert({ id: crypto.randomUUID(), user_id: authUser.id, date: dateStr, weight: newWeight })
        dbError = error
      }
      
      if (dbError) throw dbError

      // Also update profile if it's today's weight
      if (dateStr === getLocalDateStr(new Date())) {
        await supabase.from('profiles').update({ weight: newWeight }).eq('id', authUser.id)
      }
    } catch (e) {
      console.error("Failed to log weight", e) 
      alert("Kon gewicht niet opslaan in database: " + (e.message || JSON.stringify(e)))
    }
  }

  // NEW: Save Symptoms
  const saveSymptoms = async (dateStr, symptomsArray) => {
    if (!authUser) return

    // 1. Optimistic UI Update
    setUser(prev => {
      const others = (prev.symptomLogs || []).filter(l => l.date !== dateStr)
      return {
        ...prev,
        symptomLogs: [...others, { date: dateStr, symptoms: symptomsArray }]
      }
    })

    // 2. Persist
    try {
      const { error } = await supabase.from('symptom_logs').upsert({
        user_id: authUser.id,
        date: dateStr,
        symptoms: symptomsArray,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date' })
      if (error) throw error
    } catch (e) { console.error("Failed to save symptoms", e) }
  }

  // NEW: Helper function to determine if a day is a period day (explicit or auto-filled)

  // CORE: Log period start -> explicit 'yes' anchor
  const startPeriod = (dateStr) => {
    // Only insert a single 'yes' event – isDateInPeriod handles the continuity intelligently
    let newLogs = [...(user.menstruationLogs || []).filter(l => l.date !== dateStr)]
    newLogs.push({ date: dateStr, status: 'yes' })

    // Recalculate period start dates from all 'yes' logs (cluster consecutive days)
    const sortedYes = newLogs
      .filter(l => l.status === 'yes')
      .map(l => l.date)
      .sort()

    const newStartDates = []
    if (sortedYes.length > 0) {
      newStartDates.push(sortedYes[0])
      for (let i = 1; i < sortedYes.length; i++) {
        const prev = new Date(sortedYes[i - 1])
        const curr = new Date(sortedYes[i])
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)
        if (diffDays > 10) newStartDates.push(sortedYes[i])
      }
    }

    const stats = calculateCycleStats(newStartDates, user.cycleLength)

    const updates = {
      menstruationLogs: newLogs,
      periodStartDates: newStartDates,
      cycleLengthHistory: stats.cycleLengthHistory,
      ...(stats.learnedCycleLength ? { cycleLength: stats.learnedCycleLength } : {}),
      cycleStats: {
        learnedCycleLength: stats.learnedCycleLength,
        variability: stats.variability,
        confidence: stats.confidence
      },
      currentPeriodLength: null,
      manualPhaseOverride: false,
      manualPhase: null
    }

    if (newStartDates.length > 0) {
      const latestStart = newStartDates[newStartDates.length - 1]
      updates.cycleStart = new Date(latestStart).toISOString()
    }

    updateUser(updates)

    // Persist start day to local day log
    try {
      if (authUser?.id) {
        const dayData = loadDayLog(dateStr, authUser.id)
        dayData.menstruation = { status: 'yes', updatedAt: new Date().toISOString() }
        saveDayLog(dateStr, dayData, authUser.id)
        syncDayLogToCloud(dateStr, dayData)
      }
    } catch (e) { console.error(e) }
  }

  // CORE: Stop period — explicitly mark end and allow learning
  const stopPeriod = (dateStr) => {
    const today = new Date(dateStr)
    today.setHours(0, 0, 0, 0)

    // Remove any explicit 'no' for this date if it exists, then add the new 'no'
    let newLogs = (user.menstruationLogs || []).filter(l => l.date !== dateStr)
    newLogs.push({ date: dateStr, status: 'no' })

    // To calculate cycle stats and actual bleeding length, we need the raw logs
    // find the most recent 'yes' BEFORE this 'no'
    const pastYes = newLogs
      .filter(l => l.status === 'yes' && new Date(l.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date))



    // Now recalculate StartDates across all history
    // A start date is a 'yes' that comes after > 10 days of gap from previous 'yes' 
    // OR it follows a 'no' stop event. So we just filter the sorted 'yes' logs.
    const sortedYesLogs = newLogs
      .filter(l => l.status === 'yes')
      .map(l => l.date)
      .sort()

    // Recalculate cycle stats
    const newStartDates = []
    if (sortedYesLogs.length > 0) {
      newStartDates.push(sortedYesLogs[0])
      for (let i = 1; i < sortedYesLogs.length; i++) {
        const prev = new Date(sortedYesLogs[i - 1])
        const curr = new Date(sortedYesLogs[i])
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)
        if (diffDays > 10) newStartDates.push(sortedYesLogs[i])
      }
    }

    // Calculate actual period length (average over history)
    const actualPeriodLength = calculateAveragePeriodLength(newLogs, user.bleedingLengthDays || 5)

    const stats = calculateCycleStats(newStartDates, user.cycleLength)

    const updates = {
      menstruationLogs: newLogs,
      periodStartDates: newStartDates,
      cycleLengthHistory: stats.cycleLengthHistory,
      ...(stats.learnedCycleLength ? { cycleLength: stats.learnedCycleLength } : {}),
      cycleStats: {
        learnedCycleLength: stats.learnedCycleLength,
        variability: stats.variability,
        confidence: stats.confidence
      },
      // Force phase update to follicular when stopped early, overriding auto-fallback
      manualPhaseOverride: true,
      manualPhase: 'follicular',
      // Learn the actual period length using the robust history average
      ...(actualPeriodLength > 1
        ? { bleedingLengthDays: actualPeriodLength, periodLength: actualPeriodLength }
        : {})
    }

    updateUser(updates)

    // Persist to local day log
    try {
      if (authUser?.id) {
        const dayData = loadDayLog(dateStr, authUser.id)
        dayData.menstruation = { status: 'no', updatedAt: new Date().toISOString() }
        saveDayLog(dateStr, dayData, authUser.id)
        syncDayLogToCloud(dateStr, dayData)
      }
    } catch (e) { console.error(e) }
  }

  // Completely delete a log for a specific date (Undo mistake)
  const deletePeriodLog = (dateStr) => {
    let newLogs = (user.menstruationLogs || []).filter(l => l.date !== dateStr)
    
    // Recalculate stats based on remaining 'yes' logs
    const sortedYes = newLogs.filter(l => l.status === 'yes').map(l => l.date).sort()
    const newStartDates = []
    if (sortedYes.length > 0) {
      newStartDates.push(sortedYes[0])
      for (let i = 1; i < sortedYes.length; i++) {
        const prev = new Date(sortedYes[i - 1])
        const curr = new Date(sortedYes[i])
        if ((curr - prev) / (1000 * 60 * 60 * 24) > 10) newStartDates.push(sortedYes[i])
      }
    }
    const stats = calculateCycleStats(newStartDates, user.cycleLength)
    const updates = {
      menstruationLogs: newLogs,
      periodStartDates: newStartDates,
      cycleLengthHistory: stats.cycleLengthHistory,
      ...(stats.learnedCycleLength ? { cycleLength: stats.learnedCycleLength } : {}),
      cycleStats: { learnedCycleLength: stats.learnedCycleLength, variability: stats.variability, confidence: stats.confidence },
      manualPhaseOverride: false,
      manualPhase: null
    }
    if (newStartDates.length > 0) updates.cycleStart = new Date(newStartDates[newStartDates.length - 1]).toISOString()
    updateUser(updates)

    try {
      if (authUser?.id) {
        const dayData = loadDayLog(dateStr, authUser.id)
        dayData.menstruation = null // Wipe it from local storage
        saveDayLog(dateStr, dayData, authUser.id)
        syncDayLogToCloud(dateStr, dayData)
      }
    } catch (e) { console.error(e) }
  }

  // LEGACY: togglePeriodDate — used in calendar for manual corrections on past dates
  const togglePeriodDate = (dateStr) => {
    const currentlyActive = isDateInPeriod(dateStr, user)

    if (currentlyActive) {
      // User tapped "Verwijderen" / undo — completely delete any log for this date 
      // instead of force-stopping it with 'no'. This allows the cycle to fully return to normal.
      deletePeriodLog(dateStr)
    } else {
      // User tapped "Loggen +"
      startPeriod(dateStr)
    }
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
    // NOTE: isMenstruatingNow is derived via useMemo — we only update menstruationLogs
    updateUser({
      cycleStart: dateStr,
      cycleLength: newLen, // ENABLED: App learns from history
      periodLength: newPeriodLen,
      currentPeriodLength: null,
      lastCheckInDate: null,
      cycleHistory: newHistory,
      manualPhaseOverride: false, // Ensure learning takes precedence
      manualPhase: null,
      // Add to logs — this drives isMenstruatingNow via isDateInPeriod useMemo
      menstruationLogs: [...(user.menstruationLogs || []).filter(l => l.date !== dateStr), { date: dateStr, status: 'yes' }]
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

      // NOTE: isMenstruatingNow is derived — only update menstruationLogs
      updateUser({
        lastCheckInDate: todayStr,
        menstruationLogs: [...(user.menstruationLogs || []).filter(l => l.date !== todayStr), { date: todayStr, status: 'yes' }]
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

    // NOTE: isMenstruatingNow is derived — log 'no' status which drives it to false via useMemo
    updateUser({
      currentPeriodLength: newLen,
      lastCheckInDate: todayStr,
      manualPhaseOverride: false, // Clear any overrides so phase logic calculates naturally
      manualPhase: null,
      menstruationLogs: [...(user.menstruationLogs || []).filter(l => l.date !== todayStr), { date: todayStr, status: 'no' }]
    })
  }

  // Manual Phase Correction - sets manual override flag
  const adjustCyclePhase = (targetPhase) => {
    const effectiveCycleLength = user.cycleStats?.learnedCycleLength || user.cycleLength
    const newStartDate = calculateStartDateFromPhase(targetPhase, effectiveCycleLength, user.bleedingLengthDays || user.periodLength)
    const dateStr = newStartDate.toISOString()

    // Set manual override - this phase will be used until cycle naturally progresses
    // NOTE: isMenstruatingNow is derived from menstruationLogs, not manually set
    updateUser({
      cycleStart: dateStr,
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

    // NOTE: isMenstruatingNow is derived from menstruationLogs via useMemo — do NOT set it directly
    updateUser({
      periodStartDates: newStarts,
      cycleLengthHistory: stats.cycleLengthHistory,
      // Keep main cycleLength in sync with learned stats
      ...(stats.learnedCycleLength ? { cycleLength: stats.learnedCycleLength } : {}),
      cycleStats: {
        learnedCycleLength: stats.learnedCycleLength,
        variability: stats.variability,
        confidence: stats.confidence
      },
      // Also set cycle start to this date (for backwards compatibility)
      cycleStart: new Date(todayStr).toISOString(),
      // Clear manual override when new period is logged
      manualPhaseOverride: false,
      manualPhase: null,
      // Adding 'yes' log for this date drives isMenstruatingNow=true via useMemo
      menstruationLogs: [...(user.menstruationLogs || []).filter(l => l.date !== todayStr), { date: todayStr, status: 'yes' }]
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
  const getStatsForDate = useCallback((dateStr) => {
    // dateStr should be YYYY-MM-DD
    const logs = user.foodLogs?.filter(log => log.date === dateStr) || []

    return logs.reduce((acc, log) => ({
      kcal: acc.kcal + toNum(log.kcal),
      p: acc.p + toNum(log.p),
      c: acc.c + toNum(log.c),
      f: acc.f + toNum(log.f),
      fiber: acc.fiber + toNum(log.fiber || 0)
    }), { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 })
  // Only regenerate when food logs change, NOT on cycle/water/step changes
  }, [user.foodLogs])


  // DEPRECATED: Legacy manual log (keeping for compatibility if needed, but UI will stop using it)
  const logMacros = (macros) => {
    // No-op or migration logic could go here
    console.warn("logMacros is deprecated. Use logFood instead.")
  }



  // 7. Derived Logic (Moved to top)
  // [REMOVED] - Already declared above

  // 8. Context Value
  // LOGOUT (Simple)
  // LOGOUT (Simple)
  const logout = () => {
    setIsOnboarded(false)
    localStorage.removeItem('cyclus_onboarded')
    // Also sign out from Supabase auth
    if (signOut) signOut()
  }

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
    addCustomFood,
    logMovement,
    logMenstruation,
    togglePeriodDate,
    startPeriod,
    stopPeriod,
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
    isMenstruatingNow,
    isPeriodOverridden: user?.currentPeriodLength !== null,
    targets,
    movementLogs: user?.movementLogs || [],
    weightLogs: user?.weightLogs || [],
    menstruationLogs: user?.menstruationLogs || [],
    waterLogs: user?.waterLogs || [], // NEW
    stepLogs: user?.stepLogs || [], // NEW
    symptomLogs: user?.symptomLogs || [], // NEW
    logWater, // NEW
    logSteps, // NEW
    logWeight, // NEW
    saveSymptoms, // NEW
    cycleStats: user?.cycleStats,
    periodStartDates: user?.periodStartDates || [],
    isDateInPeriod: (dateStr) => isDateInPeriod(dateStr, user)
  }), [
    user,
    isOnboarded,
    isLoading,
    currentDay,
    currentPhase,
    targets,
    getStatsForDate,
    getPhaseForDate,
    isMenstruatingNow
  ])

  return (
    <UserContext.Provider value={value} >
      {children}
    </UserContext.Provider >
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within a UserProvider")
  return ctx
}
