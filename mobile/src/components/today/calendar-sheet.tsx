import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppIcon, AppText, FormSheet, InlineMessage, NativeButton } from '@/components/ui';
import { symptomLabel } from '@/data/content';
import { getMonthGrid, todayString } from '@/lib/date';
import { isDateInPeriod } from '@/lib/cycle';
import { findPeriodRangeForDate } from '@/lib/period';
import { colors, phaseColors, phaseSoftColors, radius, spacing } from '@/theme';
import type { PeriodRange, Profile, SymptomLog, WaterLog } from '@/types/today';

export function CalendarSheet({ isPresented, onDismiss, selectedDate, onSelect, profile, waterLogs, symptomLogs, onSavePeriod }: {
  isPresented: boolean;
  onDismiss: () => void;
  selectedDate: string;
  onSelect: (date: string) => void;
  profile: Profile;
  waterLogs: WaterLog[];
  symptomLogs: SymptomLog[];
  onSavePeriod: (range: PeriodRange) => Promise<void>;
}) {
  const initial = new Date(`${selectedDate}T12:00:00`);
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const [summaryDate, setSummaryDate] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wasPresented = useRef(false);

  useEffect(() => {
    if (!isPresented) {
      wasPresented.current = false;
      return;
    }
    if (!wasPresented.current) {
      const date = new Date(`${selectedDate}T12:00:00`);
      setCursor({ year: date.getFullYear(), month: date.getMonth() });
      setSummaryDate(null);
      setEditing(false);
      setStartDate(null);
      setEndDate(null);
      setError(null);
      setMessage(null);
      wasPresented.current = true;
    }
  }, [isPresented, selectedDate]);

  const moveMonth = (amount: number) => {
    const next = new Date(cursor.year, cursor.month + amount, 1, 12);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
    setSummaryDate(null);
  };

  const chooseDay = (date: string) => {
    setMessage(null);
    if (editing) {
      if (date > todayString()) { setError('Je kunt geen menstruatie in de toekomst loggen.'); return; }
      setError(null);
      if (!startDate || endDate) {
        setStartDate(date); setEndDate(null);
      } else if (date < startDate) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    } else {
      setSummaryDate(date);
      onSelect(date);
    }
  };

  const beginEditing = () => {
    if (!summaryDate) return;
    const existing = isDateInPeriod(profile, summaryDate)
      ? findPeriodRangeForDate(summaryDate, profile.menstruationLogs, profile.bleedingLengthDays)
      : null;
    setStartDate(existing?.startDate ?? summaryDate);
    setEndDate(existing?.endDate ?? null);
    setEditing(true);
    setError(null);
  };

  const save = async () => {
    if (!startDate || !endDate) { setError('Kies eerst de eerste en laatste menstruatiedag.'); return; }
    setSaving(true); setError(null);
    try {
      const originalRange = summaryDate && isDateInPeriod(profile, summaryDate)
        ? findPeriodRangeForDate(summaryDate, profile.menstruationLogs, profile.bleedingLengthDays)
        : null;
      await onSavePeriod({ startDate, endDate, originalRange });
      setEditing(false);
      setMessage('Je menstruatieperiode is opgeslagen.');
    } catch (reason) {
      const text = reason instanceof Error ? reason.message : '';
      const code = typeof reason === 'object' && reason !== null && 'code' in reason ? String(reason.code) : '';
      if (code === 'end-before-start' || text.includes('before')) setError('De laatste dag kan niet voor de eerste dag liggen.');
      else if (code === 'period-too-long' || text.includes('14')) setError('Een periode kan maximaal 14 dagen duren.');
      else setError(text || 'Opslaan is niet gelukt.');
    } finally { setSaving(false); }
  };

  const cells = getMonthGrid(cursor.year, cursor.month);
  const symptoms = symptomLogs.find((log) => log.date === summaryDate)?.symptoms ?? [];
  const water = waterLogs.find((log) => log.date === summaryDate)?.amountMl ?? 0;

  return (
    <FormSheet isPresented={isPresented} onDismiss={onDismiss} title="Menstruatiekalender" full>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Vorige maand" onPress={() => moveMonth(-1)} style={{ padding: spacing.sm }}><AppIcon name="previous" /></Pressable>
        <AppText variant="heading" style={{ textTransform: 'capitalize' }}>{new Date(cursor.year, cursor.month, 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Volgende maand" onPress={() => moveMonth(1)} style={{ padding: spacing.sm }}><AppIcon name="next" /></Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'].map((day) => <AppText key={day} variant="caption" style={{ width: '14.2857%', textAlign: 'center', textTransform: 'uppercase' }}>{day}</AppText>)}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm }}>
        {cells.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={{ width: '14.2857%', height: 48 }} />;
          const day = Number(date.slice(-2));
          const period = isDateInPeriod(profile, date);
          const phase = period ? 'menstrual' : null;
          const selected = date === summaryDate || date === startDate || date === endDate;
          const inRange = editing && startDate && endDate && date >= startDate && date <= endDate;
          const future = date > todayString();
          return (
            <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${day} ${new Date(`${date}T12:00:00`).toLocaleDateString('nl-NL', { month: 'long' })}${period ? ', menstruatie' : ''}`} accessibilityState={{ selected: Boolean(selected) }} onPress={() => chooseDay(date)} style={({ pressed }) => ({
              width: '14.2857%', height: 48, alignItems: 'center', justifyContent: 'center',
              borderRadius: radius.full, backgroundColor: selected || inRange ? colors.primary : phase ? phaseSoftColors[phase] : 'transparent',
              borderWidth: date === todayString() ? 1 : 0, borderColor: colors.primary, opacity: pressed ? 0.55 : future && editing ? 0.35 : 1,
            })}>
              <AppText variant="label" style={{ color: selected || inRange ? colors.onPrimary : phase ? phaseColors[phase] : colors.text, fontWeight: date === todayString() ? '700' : '500' }}>{day}</AppText>
              {period && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: selected || inRange ? colors.onPrimary : colors.primary }} />}
            </Pressable>
          );
        })}
      </View>
      {editing ? (
        <View style={{ gap: spacing.md }}>
          <InlineMessage>Kies de eerste en daarna de laatste menstruatiedag. Maximaal 14 dagen.</InlineMessage>
          <AppText variant="label" selectable>{startDate ?? 'Eerste dag kiezen'} {endDate ? `tot ${endDate}` : '— kies de laatste dag'}</AppText>
          <NativeButton label="Periode opslaan" onPress={() => void save()} loading={saving} />
          <NativeButton label="Annuleren" onPress={() => { setEditing(false); setError(null); }} variant="text" />
        </View>
      ) : summaryDate ? (
        <View style={{ gap: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md }}>
          <AppText variant="heading">{new Date(`${summaryDate}T12:00:00`).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</AppText>
          <AppText variant="label">{isDateInPeriod(profile, summaryDate) ? 'Menstruatie gelogd' : 'Geen menstruatie gelogd'} · {water} ml water</AppText>
          {symptoms.length > 0 && <AppText variant="caption" selectable>{symptoms.map(symptomLabel).join(', ')}</AppText>}
          {summaryDate <= todayString() && <NativeButton label="Menstruatie bewerken" onPress={beginEditing} variant="outlined" />}
        </View>
      ) : (
        <AppText variant="caption">Tik op een dag om details te zien of je menstruatie aan te passen.</AppText>
      )}
      {message && <InlineMessage>{message}</InlineMessage>}
      {error && <InlineMessage error>{error}</InlineMessage>}
    </FormSheet>
  );
}
