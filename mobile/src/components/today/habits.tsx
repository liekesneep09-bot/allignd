import { Pressable, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { AppIcon, AppText, Card, NativeButton, type AppIconName } from '@/components/ui';
import { symptomLabel } from '@/data/content';
import { colors, radius, spacing } from '@/theme';
import type { StepLog, WaterLog, WeightLog } from '@/types/today';

function HabitRow({ icon, title, value, target, unit, onPress }: {
  icon: AppIconName; title: string; value: number; target: number; unit: string; onPress: () => void;
}) {
  const progress = Math.min(1, value / target);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title} bijwerken`} onPress={onPress} style={({ pressed }) => ({ gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primarySoft }}>
          <AppIcon name={icon} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <AppText variant="label" style={{ color: colors.text }}>{title}</AppText>
          <AppText variant="caption">{value.toLocaleString('nl-NL')} / {target.toLocaleString('nl-NL')} {unit}</AppText>
        </View>
        <AppIcon name="add" color={colors.primary} />
      </View>
      <View style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${progress * 100}%`, borderRadius: radius.full, backgroundColor: colors.primary }} />
      </View>
    </Pressable>
  );
}

export function HabitsCard({ date, waterLogs, stepLogs, onWater, onSteps }: {
  date: string; waterLogs: WaterLog[]; stepLogs: StepLog[]; onWater: () => void; onSteps: () => void;
}) {
  return (
    <Card>
      <View>
        <AppText variant="heading">Gewoontes</AppText>
        <AppText variant="caption">Kleine stappen, elke dag</AppText>
      </View>
      <HabitRow icon="water" title="Water" value={waterLogs.find((log) => log.date === date)?.amountMl ?? 0} target={2500} unit="ml" onPress={onWater} />
      <HabitRow icon="steps" title="Stappen" value={stepLogs.find((log) => log.date === date)?.steps ?? 0} target={10000} unit="stappen" onPress={onSteps} />
    </Card>
  );
}

export function WeightCard({ date, logs, fallbackWeight, onEdit }: {
  date: string; logs: WeightLog[]; fallbackWeight: number | null; onEdit: () => void;
}) {
  const recent = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const selected = logs.find((log) => log.date === date)?.weight;
  const latest = recent.at(-1)?.weight ?? fallbackWeight;
  const current = selected ?? latest;
  const values = recent.map((log) => log.weight);
  const min = values.length ? Math.min(...values) - 0.5 : 0;
  const max = values.length ? Math.max(...values) + 0.5 : 1;
  const points = recent.map((log, index) => ({
    ...log,
    x: recent.length === 1 ? 150 : 8 + (index / (recent.length - 1)) * 284,
    y: 88 - ((log.weight - min) / Math.max(1, max - min)) * 76,
  }));
  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <AppText variant="heading">Gewicht</AppText>
          <AppText style={{ fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{current ? `${current.toLocaleString('nl-NL')} kg` : 'Nog niet gelogd'}</AppText>
        </View>
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md }}>
          <AppIcon name="weight" color={colors.primary} />
        </View>
      </View>
      {points.length > 1 && (
        <Svg width="100%" height={100} viewBox="0 0 300 100" accessibilityLabel="Gewichtsverloop van de laatste metingen">
          <Polyline points={pointString} fill="none" stroke={colors.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((point) => <Circle key={point.date} cx={point.x} cy={point.y} r={4} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />)}
        </Svg>
      )}
      <AppText variant="caption">Schommelingen zijn normaal; kijk naar de trend, niet naar één dag.</AppText>
      <NativeButton label={selected ? 'Gewicht aanpassen' : 'Gewicht loggen'} onPress={onEdit} variant="outlined" />
    </Card>
  );
}

export function SymptomsCard({ symptoms, onEdit }: { symptoms: string[]; onEdit: () => void }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md }}>
          <AppIcon name="mood" color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">Symptomen</AppText>
          <AppText variant="caption">{symptoms.length ? `${symptoms.length} gelogd` : 'Hoe voel je je vandaag?'}</AppText>
        </View>
      </View>
      {symptoms.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {symptoms.map((symptom) => (
            <View key={symptom} style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surfaceMuted }}>
              <AppText variant="caption">{symptomLabel(symptom)}</AppText>
            </View>
          ))}
        </View>
      )}
      <NativeButton label="Check-in doen" onPress={onEdit} />
    </Card>
  );
}
