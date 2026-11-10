import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { AppText, Card } from '@/components/ui';
import { CycleRing } from '@/components/today/progress-ring';
import { phaseLabels } from '@/data/content';
import { getPhaseForDate, predictNextPeriodDate } from '@/lib/cycle';
import { calculateDaysUntilPeriod } from '../../../../src/logic/cycle.js';
import { colors, spacing } from '@/theme';
import type { Profile } from '@/types/today';

export function CycleSummary({ profile, date }: { profile: Profile; date: string }) {
  const router = useRouter();
  if (!profile.cycleStart) return null;
  const cycleLength = profile.cycleStats.learnedCycleLength || profile.cycleLength || 28;
  const periodLength = profile.bleedingLengthDays || profile.periodLength || 5;
  const info = getPhaseForDate(profile, date);
  const remaining = calculateDaysUntilPeriod(info.day, cycleLength);
  const prediction = predictNextPeriodDate(profile.periodStartDates, cycleLength);
  let countdown = String(remaining);
  let countdownLabel = remaining === 1 ? 'dag tot je menstruatie' : 'dagen tot je menstruatie';
  if (info.phase === 'menstrual') {
    countdown = `${Math.min(info.day, periodLength)}e`;
    countdownLabel = 'dag van je menstruatie';
  } else if (info.overdueDays > 0) {
    countdown = String(info.overdueDays);
    countdownLabel = info.overdueDays === 1 ? 'dag langer dan verwacht' : 'dagen langer dan verwacht';
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cycluskalender en faseuitleg openen"
      onPress={() => router.push('/guide' as Href)}
      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <CycleRing day={info.day} cycleLength={cycleLength} periodLength={periodLength} phase={info.phase}>
            <AppText style={{ fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{countdown}</AppText>
            <AppText variant="caption" style={{ maxWidth: 84, textAlign: 'center' }}>{countdownLabel}</AppText>
          </CycleRing>
          <View style={{ flex: 1, gap: spacing.sm }}>
            <AppText variant="heading">{info.overdueDays > 0 ? 'Einde van je cyclus' : phaseLabels[info.phase]}</AppText>
            <AppText variant="label">Dag {info.linearDay}{info.overdueDays > 0 ? '' : ` van ${cycleLength}`}</AppText>
            {prediction && <AppText variant="caption">Verwachte menstruatie: rond {new Date(`${prediction}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}</AppText>}
            <AppText variant="caption">Een schatting, geen exacte voorspelling.</AppText>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <AppText variant="caption">De fase wordt berekend uit je cyclusgegevens en handmatige menstruatielogs.</AppText>
        <AppText variant="label" style={{ color: colors.primary, fontWeight: '700' }}>Kalender en faseuitleg →</AppText>
      </Card>
    </Pressable>
  );
}
