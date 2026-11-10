'use dom';

import React, { useEffect, useState } from 'react';
import { MainLayout, SplashScreen } from '../../../../src/App.jsx';
import { AuthProvider } from '../../../../src/context/AuthContext.jsx';
import { LanguageProvider } from '../../../../src/context/LanguageContext.jsx';
import { UserProvider } from '../../../../src/context/UserContext.jsx';
import { supabase } from '../../../../src/utils/supabaseClient.js';
import '../../../../src/index.css';

function localDate(offset = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createPreviewProfile() {
  const today = localDate();
  const cycleStart = localDate(-12);
  return {
    name: 'Demo',
    cycleStart,
    cycleLength: 28,
    periodLength: 5,
    bleedingLengthDays: 5,
    currentPeriodLength: null,
    isMenstruatingNow: false,
    periodEnded: 'no',
    periodEndDate: localDate(-7),
    previousPeriodStart: localDate(-40),
    previousPeriodEnd: localDate(-35),
    periodStartDates: [localDate(-40), cycleStart],
    cycleLengthHistory: [],
    cycleStats: { learnedCycleLength: null, variability: 0, confidence: 'medium' },
    menstruationLogs: [
      { date: cycleStart, status: 'yes' },
      { date: localDate(-7), status: 'no' },
    ],
    macroTargets: {
      calories: 2000,
      caloriesMax: 2100,
      proteinMin: 120,
      proteinMax: 135,
      fatMin: 65,
      fatMax: 75,
      carbsMin: 220,
      carbsMax: 245,
    },
    age: 30,
    height: 170,
    weight: 68.4,
    goal: 'maintain',
    tracking: 'now',
    trainingFrequency: 3,
    training_days_per_week: 3,
    lifestyle_level: 'moderately_active',
    steps_range: '4k8k',
    resultTempo: 'average',
    experienceLevel: 'beginner',
    trainingType: 'combination',
    user_language: 'nl',
    dietary_preference: 'everything',
    subscription_status: 'active',
    foodLogs: [
      { id: 'preview-oats', date: today, foodId: null, name: 'Havermout', grams: 60, kcal: 228, p: 7.8, c: 36, f: 4.2, fiber: 6 },
      { id: 'preview-banana', date: today, foodId: null, name: 'Banaan', grams: 120, kcal: 105, p: 1.3, c: 27.6, f: 0.4, fiber: 3.1 },
      { id: 'preview-chicken', date: today, foodId: null, name: 'Kipfilet', grams: 150, kcal: 248, p: 46.5, c: 0, f: 4.5, fiber: 0 },
    ],
    movementLogs: [{ id: 'preview-movement', date: localDate(-1), status: 'moved' }],
    weightLogs: [
      { date: localDate(-14), weight: 69.1 },
      { date: localDate(-7), weight: 68.8 },
      { date: today, weight: 68.4 },
    ],
    waterLogs: [{ date: today, amount_ml: 1250 }],
    stepLogs: [{ date: today, steps: 6400 }],
    symptomLogs: [{ date: today, symptoms: ['energetic'] }],
    logs: {},
    cycleHistory: [],
  };
}

export default function AlligndApp({
  preview = false,
  initialView = 'today',
  showOnboarding = false,
  accessToken = null,
  refreshToken = null,
  onPreviewSignOut,
}) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(preview);
  const [error, setError] = useState(null);
  const [previewProfile] = useState(() => preview ? createPreviewProfile() : null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || preview) return;
    if (!accessToken || !refreshToken || !supabase) {
      setError('Je sessie kon niet worden geopend. Log opnieuw in.');
      return;
    }

    let cancelled = false;
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (cancelled) return;
        if (sessionError) setError(sessionError.message);
        else setReady(true);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Je sessie kon niet worden hersteld.');
      });
    return () => { cancelled = true; };
  }, [mounted, preview, accessToken, refreshToken]);

  if (!mounted || !ready) {
    return error
      ? <div role="alert" style={{ padding: 24, fontFamily: 'var(--font-family)' }}>{error}</div>
      : <SplashScreen />;
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      <LanguageProvider>
        <AuthProvider preview={preview} onPreviewSignOut={onPreviewSignOut}>
          <UserProvider previewProfile={previewProfile} previewOnboarded={showOnboarding ? false : null} isExpoApp>
            <MainLayout initialView={initialView} isExpoApp />
          </UserProvider>
        </AuthProvider>
      </LanguageProvider>
    </>
  );
}
