import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Card, IconButton, InlineMessage, NativeButton, ScreenState } from '@/components/ui';
import { CalendarSheet } from '@/components/today/calendar-sheet';
import { SymptomSheet } from '@/components/today/forms';
import { useToday } from '@/context/today-context';
import { phaseContent, phaseLabels, symptomLabel } from '@/data/content';
import { getCalendarCycleInfo, getFuturePeriodWindows, getNextPeriodMilestone } from '@/lib/calendar';
import { getPhaseForDate, isDateInPeriod } from '@/lib/cycle';
import { getDateLabel, getMonthGrid, getMonthLabel, parseDate, todayString } from '@/lib/date';
import { colors, phaseBaseColors, phaseColors, phaseSoftColors, radius, spacing } from '@/theme';
import type { Phase } from '@/types/today';

const phaseOrder: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
const weekdays = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

function LegendItem({ label, color, dashed = false }: { label: string; color: string; dashed?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View style={{
        width: 12,
        height: 12,
        borderRadius: radius.full,
        backgroundColor: dashed ? 'transparent' : color,
        borderWidth: dashed ? 1.5 : 0,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: color,
      }} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

export function GuideScreen() {
  const router = useRouter();
  const { data, loading, refreshing, error, refresh, actions } = useToday();
  const today = todayString();
  const initialMonth = parseDate(today)!;
  const [selectedDate, setSelectedDate] = useState(today);
  const [cursor, setCursor] = useState({ year: initialMonth.getFullYear(), month: initialMonth.getMonth() });
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showPeriodCalendar, setShowPeriodCalendar] = useState(false);

  if (loading && !data) {
    return <ScreenState loading title="Je cyclus wordt klaargezet" description="Je kalender en fasegegevens ophalen…" />;
  }
  if (!data) {
    return (
      <ScreenState
        title={error ? 'Je cyclus kon niet worden geladen' : 'Geen cyclusgegevens beschikbaar'}
        description={error ?? 'Probeer het opnieuw om je kalender te openen.'}
        action={<NativeButton label="Opnieuw proberen" onPress={() => void refresh()} loading={refreshing} />}
      />
    );
  }

  const { profile } = data;
  if (!profile.cycleStart) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.lg }}>
        <Card>
          <AppText variant="title">Je cycluskalender begint bij je gegevens</AppText>
          <AppText variant="label">Voeg je cyclusstart en verwachte cycluslengte toe om fasen en een volgende menstruatieschatting te zien.</AppText>
          <NativeButton label="Terug naar vandaag" onPress={() => router.back()} variant="outlined" />
        </Card>
      </View>
    );
  }

  const cycleLength = profile.cycleStats.learnedCycleLength || profile.cycleLength || 28;
  const periodLength = profile.bleedingLengthDays || profile.periodLength || 5;
  const cells = getMonthGrid(cursor.year, cursor.month);
  const futurePeriods = getFuturePeriodWindows(
    profile.periodStartDates,
    cycleLength,
    periodLength,
    profile.cycleStats.variability,
    4,
  );
  const nextPeriod = getNextPeriodMilestone(profile.cycleStart, cycleLength, today);
  const selectedIsPeriod = isDateInPeriod(profile, selectedDate, today);
  const selectedCycle = selectedIsPeriod
    ? { day: null, phase: 'menstrual' as Phase }
    : getCalendarCycleInfo(selectedDate, profile.cycleStart, cycleLength, periodLength);
  const currentCycle = getPhaseForDate(profile, today, today);
  const phase = selectedCycle?.phase ?? currentCycle.phase;
  const phaseDay = selectedCycle?.day ?? currentCycle.day;
  const phaseVariant = phaseContent[phase][profile.periodStartDates.length % phaseContent[phase].length];
  const selectedSymptoms = data.symptomLogs.find((log) => log.date === selectedDate)?.symptoms ?? [];
  const selectedMovement = data.movementLogs.find((log) => log.date === selectedDate)?.status;

  const moveMonth = (amount: number) => {
    const next = new Date(cursor.year, cursor.month + amount, 1, 12);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const goToToday = () => {
    const date = parseDate(today)!;
    setSelectedDate(today);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    const parsed = parseDate(date);
    if (parsed) setCursor({ year: parsed.getFullYear(), month: parsed.getMonth() });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: '100%',
          maxWidth: 520,
          alignSelf: 'center',
          padding: spacing.md,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
      >
        {error && <InlineMessage error>Vernieuwen is niet gelukt. We tonen je laatst geladen gegevens. {error}</InlineMessage>}

        <Card style={{ padding: spacing.md, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton name="previous" label="Vorige maand" onPress={() => moveMonth(-1)} />
            <AppText variant="heading" style={{ textTransform: 'capitalize' }}>{getMonthLabel(cursor.year, cursor.month)}</AppText>
            <IconButton name="next" label="Volgende maand" onPress={() => moveMonth(1)} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.full,
              backgroundColor: phaseSoftColors[phase],
            }}>
              <View style={{ width: 7, height: 7, borderRadius: radius.full, backgroundColor: phaseBaseColors[phase] }} />
              <AppText variant="caption" style={{ color: phaseColors[phase], fontWeight: '700' }}>{phaseLabels[phase]}</AppText>
            </View>
            {selectedDate !== today && (
              <Pressable accessibilityRole="button" onPress={goToToday} style={({ pressed }) => ({ minHeight: 36, justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}>
                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>Naar vandaag</AppText>
              </Pressable>
            )}
          </View>

          <View style={{ flexDirection: 'row' }}>
            {weekdays.map((day) => (
              <AppText key={day} variant="caption" style={{ width: '14.2857%', textAlign: 'center', textTransform: 'uppercase' }}>{day}</AppText>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.xs }}>
            {cells.map((date, index) => {
              if (!date) return <View key={`empty-${index}`} style={{ width: '14.2857%', height: 48 }} />;
              const period = isDateInPeriod(profile, date, today);
              const predicted = !period && futurePeriods.has(date);
              const cycle = getCalendarCycleInfo(date, profile.cycleStart, cycleLength, periodLength);
              const dayPhase = period ? 'menstrual' : cycle?.phase;
              const selected = date === selectedDate;
              const isToday = date === today;
              const hasMovement = data.movementLogs.some((log) => log.date === date && log.status === 'moved');
              const hasSymptoms = data.symptomLogs.some((log) => log.date === date && log.symptoms.length > 0);
              const textColor = period
                ? colors.text
                : predicted
                  ? colors.primary
                  : dayPhase
                    ? phaseColors[dayPhase]
                    : colors.text;

              return (
                <Pressable
                  key={date}
                  accessibilityRole="button"
                  accessibilityLabel={`${getDateLabel(date)}${period ? ', menstruatie gelogd' : predicted ? ', verwachte menstruatie' : dayPhase ? `, ${phaseLabels[dayPhase]}` : ''}`}
                  accessibilityState={{ selected }}
                  onPress={() => selectDate(date)}
                  style={({ pressed }) => ({ width: '14.2857%', height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: period ? colors.primary : dayPhase ? phaseSoftColors[dayPhase] : 'transparent',
                    borderWidth: selected || predicted || isToday ? 2 : 0,
                    borderStyle: predicted && !selected ? 'dashed' : 'solid',
                    borderColor: selected ? colors.text : colors.primary,
                  }}>
                    <AppText variant="label" style={{ color: textColor, fontWeight: isToday || period || selected ? '700' : '500' }}>{Number(date.slice(-2))}</AppText>
                  </View>
                  <View style={{ height: 5, flexDirection: 'row', gap: 3 }}>
                    {hasMovement && <View style={{ width: 5, height: 5, borderRadius: radius.full, backgroundColor: colors.movement }} />}
                    {hasSymptoms && <View style={{ width: 5, height: 5, borderRadius: radius.full, backgroundColor: colors.symptoms }} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {nextPeriod && (
            <View style={{ padding: spacing.md, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: phaseSoftColors[phase], gap: spacing.xs }}>
              <AppText variant="caption">Verwachte volgende menstruatie</AppText>
              <AppText variant="heading" style={{ color: phaseColors[phase] }}>Rond {getDateLabel(nextPeriod)}</AppText>
            </View>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md }}>
            <LegendItem label="Menstruatie gelogd" color={colors.primary} />
            <LegendItem label="Verwacht" color={colors.primary} dashed />
            {phaseOrder.map((item) => <LegendItem key={item} label={phaseLabels[item]} color={phaseBaseColors[item]} />)}
            <LegendItem label="Bewogen" color={colors.movement} />
            <LegendItem label="Symptomen" color={colors.symptoms} />
          </View>
          <AppText variant="caption" style={{ textAlign: 'center' }}>Fase- en menstruatiedatums zijn schattingen op basis van je gegevens, geen exacte voorspellingen.</AppText>
        </Card>

        <Card style={{ borderTopWidth: 4, borderTopColor: phaseBaseColors[phase], backgroundColor: phaseSoftColors[phase] }}>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="caption" style={{ color: phaseColors[phase], fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {getDateLabel(selectedDate)} · cyclusdag {phaseDay}
            </AppText>
            <AppText variant="title" style={{ color: phaseColors[phase] }}>{phaseVariant.title}</AppText>
          </View>
          <AppText style={{ color: colors.textSecondary }}>{phaseVariant.normal}</AppText>
          <View style={{ gap: spacing.xs }}>
            <AppText variant="heading">Voeding in deze fase</AppText>
            <AppText variant="label">{phaseVariant.nutrition}</AppText>
          </View>
        </Card>

        <Card>
          <AppText variant="heading">Check-in voor {getDateLabel(selectedDate)}</AppText>
          {selectedSymptoms.length > 0 ? (
            <AppText variant="label" selectable>{selectedSymptoms.map(symptomLabel).join(', ')}</AppText>
          ) : (
            <AppText variant="label">Nog geen symptomen genoteerd voor deze dag.</AppText>
          )}
          {selectedMovement && <AppText variant="caption">{selectedMovement === 'moved' ? 'Beweging gelogd' : 'Rustdag gelogd'}</AppText>}
          {selectedDate <= today ? (
            <View style={{ gap: spacing.sm }}>
              <NativeButton label={selectedSymptoms.length ? 'Check-in bewerken' : 'Check-in toevoegen'} onPress={() => setShowCheckIn(true)} variant="outlined" />
              <NativeButton label="Menstruatie bewerken" onPress={() => setShowPeriodCalendar(true)} variant="text" />
            </View>
          ) : (
            <AppText variant="caption">Je kunt een check-in toevoegen zodra deze dag is aangebroken.</AppText>
          )}
        </Card>
      </ScrollView>

      <SymptomSheet
        isPresented={showCheckIn}
        onDismiss={() => setShowCheckIn(false)}
        selectedSymptoms={selectedSymptoms}
        onSave={(symptoms) => actions.saveSymptoms(selectedDate, symptoms)}
      />
      <CalendarSheet
        isPresented={showPeriodCalendar}
        onDismiss={() => setShowPeriodCalendar(false)}
        selectedDate={selectedDate}
        onSelect={selectDate}
        profile={profile}
        waterLogs={data.waterLogs}
        symptomLogs={data.symptomLogs}
        onSavePeriod={actions.savePeriodRange}
      />
    </View>
  );
}
