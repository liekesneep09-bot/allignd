import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useToday } from '@/context/today-context';
import { phaseContent, phaseLabels } from '@/data/content';
import { getPhaseForDate, getPhaseTransition, isDateInPeriod } from '@/lib/cycle';
import { todayString } from '@/lib/date';
import { colors, phaseBaseColors, phaseColors, radius, shadows, spacing } from '@/theme';
import { AppIcon, AppText, Card, InlineMessage, NativeButton, ScreenState } from '@/components/ui';
import { CalendarSheet } from '@/components/today/calendar-sheet';
import { CycleSummary } from '@/components/today/cycle-summary';
import { DayStrip } from '@/components/today/day-strip';
import { FoodLogCard, NutritionCard } from '@/components/today/nutrition';
import { HabitsCard, SymptomsCard, WeightCard } from '@/components/today/habits';
import { FoodSheet, MovementCard, NumberSheet, SymptomSheet } from '@/components/today/forms';

function InfoCard({ title, description, onPress }: { title: string; description: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primarySoft }}>
          <AppIcon name="movement" color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="label" style={{ color: colors.primary, fontWeight: '700' }}>{title}</AppText>
          <AppText variant="label" style={{ color: colors.text }}>{description}</AppText>
          <AppText variant="caption">Openen op de website →</AppText>
        </View>
      </Card>
    </Pressable>
  );
}

function NutritionShortcut({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voeding openen"
      onPress={onPress}
      style={({ pressed }) => ({
        marginTop: spacing.sm,
        width: '100%',
        maxWidth: 320,
        padding: spacing.sm + spacing.xs,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        boxShadow: shadows.card,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22 0-2.25-1.94-4.22-4.14-4.22-2.19 0-3.69 1.62-5.86 1.62-2.16 0-3.65-1.62-5.84-1.62C3.97 5.56 2 7.72 2 10.41c0 4.19 3 11.59 6 11.59 1.25 0 2.5-1.06 4-1.06Z" />
          <Path d="M10 2c1 0 3.5 1.5 3.5 3.5" />
        </Svg>
      </View>
      <AppText variant="label" style={{ flex: 1, color: colors.text, fontWeight: '600', lineHeight: 17 }}>Voeding</AppText>
      <AppText style={{ color: colors.primary, fontSize: 20, lineHeight: 22 }}>→</AppText>
    </Pressable>
  );
}

const transitionLabels = {
  follicular: 'Op weg naar je Folliculaire Fase',
  ovulatory: 'Op weg naar je Ovulatiefase',
  luteal: 'Op weg naar je Luteale Fase (PMS)',
  menstrual: 'Op weg naar je Menstruatie',
} as const;

export function TodayScreen() {
  const router = useRouter();
  const { signOut, isPreview } = useAuth();
  const { data, loading, refreshing, error, refresh, actions } = useToday();
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [sheet, setSheet] = useState<'calendar' | 'food' | 'water' | 'steps' | 'weight' | 'symptoms' | null>(null);
  const [periodPending, setPeriodPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const today = todayString();
  const selectedLogs = useMemo(
    () => data?.foodLogs.filter((log) => log.date === selectedDate) ?? [],
    [data?.foodLogs, selectedDate],
  );
  const selectedSymptoms = data?.symptomLogs.find((log) => log.date === selectedDate)?.symptoms ?? [];
  const selectedMovement = data?.movementLogs.find((log) => log.date === selectedDate)?.status ?? null;

  if (loading && !data) {
    return <ScreenState loading title="Je dag wordt klaargezet" description="Je gegevens veilig ophalen…" />;
  }
  if (!data) {
    return (
      <ScreenState
        title={error ? 'Je gegevens konden niet worden geladen' : 'Geen gegevens beschikbaar'}
        description={error ?? 'Probeer het opnieuw. Je ingevoerde gegevens blijven veilig bewaard.'}
        action={<NativeButton label="Opnieuw proberen" onPress={() => void refresh()} loading={refreshing} />}
      />
    );
  }

  const cycleInfo = getPhaseForDate(data.profile, selectedDate);
  const phase = cycleInfo.phase;
  const phaseColor = phaseBaseColors[phase];
  const phaseVariant = phaseContent[phase][(data.profile.periodStartDates.length || 0) % 3];
  const isPeriod = isDateInPeriod(data.profile, selectedDate);
  const isToday = selectedDate === today;
  const dailySymptoms = selectedSymptoms;
  const cycleLength = data.profile.cycleStats.learnedCycleLength || data.profile.cycleLength || 28;
  const periodLength = data.profile.bleedingLengthDays || data.profile.periodLength || 5;
  const phaseTransition = getPhaseTransition(cycleInfo.day, cycleLength, periodLength, phase);

  const runPeriodAction = async (kind: 'start' | 'stop') => {
    setPeriodPending(true);
    setActionError(null);
    try {
      if (kind === 'start') await actions.startPeriod(selectedDate);
      else await actions.stopPeriod(selectedDate);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.');
    } finally {
      setPeriodPending(false);
    }
  };

  const activeSheet = (name: typeof sheet) => setSheet(name);
  const openWebsite = () => router.push('/website' as Href);

  const periodAction = selectedDate > today
    ? null
    : isPeriod
      ? { label: isToday && phase === 'menstrual' ? 'Menstruatie gestopt?' : 'Menstruatie gelogd', kind: isToday && phase === 'menstrual' ? 'stop' as const : 'calendar' as const }
      : phase === 'luteal' || phase === 'menstrual'
        ? { label: 'Log Menstruatie', kind: 'start' as const }
        : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 120, width: '100%', maxWidth: 480, alignSelf: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ position: 'relative', paddingTop: spacing.sm + spacing.xs, paddingBottom: spacing.md }}>
          <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Defs>
              <LinearGradient id={`phase-gradient-${phase}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={phaseBaseColors[phase]} stopOpacity={0.25} />
                <Stop offset="60%" stopColor={phaseBaseColors[phase]} stopOpacity={0.12} />
                <Stop offset="100%" stopColor={colors.surface} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#phase-gradient-${phase})`} />
          </Svg>

          <View style={{ paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm + spacing.xs }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profiel"
                onPress={openWebsite}
                style={({ pressed }) => ({ padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderCurve: 'continuous', boxShadow: shadows.card, opacity: pressed ? 0.6 : 1 })}
              >
                <AppIcon name="profile" color={colors.text} size={20} />
              </Pressable>
              <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600', textTransform: 'capitalize', letterSpacing: 0.24, lineHeight: 14 }}>
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kalender"
                onPress={() => router.push('/guide' as Href)}
                style={({ pressed }) => ({ padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderCurve: 'continuous', boxShadow: shadows.card, opacity: pressed ? 0.6 : 1 })}
              >
                <AppIcon name="calendar" color={colors.text} size={20} />
              </Pressable>
            </View>

            <DayStrip selectedDate={selectedDate} onSelect={setSelectedDate} accentColor={phaseColor} />

            <View style={{ marginTop: spacing.sm + spacing.xs, alignItems: 'center', gap: spacing.sm }}>
              {!!phaseVariant.prefix && <AppText variant="label" style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '500' }}>{phaseVariant.prefix}</AppText>}
              <AppText style={{ color: phaseColor, textAlign: 'center', fontSize: 36, fontWeight: '800', letterSpacing: -1.08, lineHeight: 38 }}>
                {phaseVariant.title}
              </AppText>
              {phaseTransition?.isTransition && phase !== 'menstrual' && (
                <AppText style={{ color: phaseColor, textAlign: 'center', fontSize: 14, fontWeight: '600', fontStyle: 'italic', opacity: 0.85 }}>
                  {transitionLabels[phaseTransition.nextPhase]}
                </AppText>
              )}
              <AppText style={{ color: colors.textSecondary, textAlign: 'center', maxWidth: 320, fontSize: 16, lineHeight: 24 }}>
                {phaseVariant.normal}
              </AppText>

              {periodAction && (
                <Pressable
                  accessibilityRole="button"
                  disabled={periodPending}
                  onPress={() => periodAction.kind === 'calendar'
                    ? activeSheet('calendar')
                    : void runPeriodAction(periodAction.kind)}
                  style={({ pressed }) => ({
                    marginTop: spacing.sm,
                    width: '100%',
                    maxWidth: 320,
                    minHeight: 44,
                    paddingVertical: spacing.sm + spacing.xs,
                    paddingHorizontal: spacing.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    borderRadius: radius.md,
                    borderCurve: 'continuous',
                    boxShadow: shadows.card,
                    opacity: periodPending ? 0.5 : pressed ? 0.65 : 1,
                  })}
                >
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: phaseColor }}>
                    {periodPending ? 'Opslaan…' : periodAction.label}
                  </AppText>
                </Pressable>
              )}

              <NutritionShortcut onPress={openWebsite} />
            </View>
          </View>
        </View>

        {actionError && <InlineMessage error>{actionError}</InlineMessage>}
        {error && data && <InlineMessage error>Vernieuwen is niet gelukt. We tonen je laatst geladen gegevens. {error}</InlineMessage>}

        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm + spacing.xs }}>
          {actionError && <InlineMessage error>{actionError}</InlineMessage>}
          {error && data && <InlineMessage error>Vernieuwen is niet gelukt. We tonen je laatst geladen gegevens. {error}</InlineMessage>}

          <CycleSummary profile={data.profile} date={selectedDate} />

          {data.dailyTopic && (
            <InfoCard title="Vraag van de dag" description={data.dailyTopic.question} onPress={openWebsite} />
          )}

          {data.profile.tracking !== 'none' && (
            data.targets ? (
              <NutritionCard targets={data.targets} logs={selectedLogs} onAddFood={() => activeSheet('food')} />
            ) : (
              <Card>
                <AppText variant="heading">Je voedingsdoelen ontbreken</AppText>
                <AppText variant="label">Rond de persoonlijke instellingen op de website af om je dagdoelen te zien.</AppText>
                <NativeButton label="Instellingen openen" onPress={openWebsite} variant="outlined" />
              </Card>
            )
          )}

          <HabitsCard
            date={selectedDate}
            waterLogs={data.waterLogs}
            stepLogs={data.stepLogs}
            onWater={() => activeSheet('water')}
            onSteps={() => activeSheet('steps')}
          />
          <WeightCard date={selectedDate} logs={data.weightLogs} fallbackWeight={data.profile.weight} onEdit={() => activeSheet('weight')} />
          <SymptomsCard symptoms={dailySymptoms} onEdit={() => activeSheet('symptoms')} />
          <MovementCard status={selectedMovement} onSave={(status) => actions.saveMovement(selectedDate, status)} />
          <FoodLogCard logs={selectedLogs} foods={data.foods} onDelete={actions.deleteFood} />

          <InfoCard title="Jouw inzichten" description={`Bekijk je voortgang en eerdere ${phaseLabels[phase].toLowerCase()}-gegevens.`} onPress={openWebsite} />

          <View style={{ gap: spacing.sm, paddingTop: spacing.md }}>
            {isPreview && <InlineMessage>Demoweergave — niets wordt opgeslagen in je account.</InlineMessage>}
            <NativeButton label={isPreview ? 'Demo afsluiten' : 'Uitloggen'} onPress={() => void signOut()} variant="text" />
          </View>
        </View>
      </ScrollView>

      <CalendarSheet
        isPresented={sheet === 'calendar'}
        onDismiss={() => activeSheet(null)}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        profile={data.profile}
        waterLogs={data.waterLogs}
        symptomLogs={data.symptomLogs}
        onSavePeriod={actions.savePeriodRange}
      />
      <FoodSheet
        isPresented={sheet === 'food'}
        onDismiss={() => activeSheet(null)}
        date={selectedDate}
        foods={data.foods}
        onAdd={actions.addFood}
      />
      <NumberSheet
        kind="water"
        isPresented={sheet === 'water'}
        onDismiss={() => activeSheet(null)}
        date={selectedDate}
        currentValue={data.waterLogs.find((log) => log.date === selectedDate)?.amountMl ?? 0}
        onSave={(amountMl) => actions.addWater(selectedDate, amountMl)}
      />
      <NumberSheet
        kind="steps"
        isPresented={sheet === 'steps'}
        onDismiss={() => activeSheet(null)}
        date={selectedDate}
        currentValue={data.stepLogs.find((log) => log.date === selectedDate)?.steps ?? 0}
        onSave={(steps) => actions.setSteps(selectedDate, steps)}
      />
      <NumberSheet
        kind="weight"
        isPresented={sheet === 'weight'}
        onDismiss={() => activeSheet(null)}
        date={selectedDate}
        currentValue={data.weightLogs.find((log) => log.date === selectedDate)?.weight ?? data.profile.weight ?? 0}
        onSave={(weight) => actions.setWeight(selectedDate, weight)}
      />
      <SymptomSheet
        isPresented={sheet === 'symptoms'}
        onDismiss={() => activeSheet(null)}
        selectedSymptoms={selectedSymptoms}
        onSave={(symptoms) => actions.saveSymptoms(selectedDate, symptoms)}
      />
    </View>
  );
}
