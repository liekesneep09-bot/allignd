import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { AppIcon, AppText, Card, InlineMessage, NativeButton } from '@/components/ui';
import { ProgressRing } from '@/components/today/progress-ring';
import { mealLabel } from '@/data/content';
import { colors, radius, spacing } from '@/theme';
import type { FoodLog, MacroTargets, MealCategory } from '@/types/today';

type Totals = { kcal: number; protein: number; carbs: number; fat: number; fiber: number };

export function nutritionTotals(logs: FoodLog[]): Totals {
  return logs.reduce((total, log) => ({
    kcal: total.kcal + log.kcal,
    protein: total.protein + log.protein,
    carbs: total.carbs + log.carbs,
    fat: total.fat + log.fat,
    fiber: total.fiber + log.fiber,
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
}

function MacroRow({ label, current, target }: { label: string; current: number; target: number }) {
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="label" style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>{Math.round(current)} / {target} g</AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="caption" style={{ width: 36, color: colors.text, fontVariant: ['tabular-nums'] }}>{percentage}%</AppText>
        <View style={{ flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
          <View style={{ width: `${percentage}%`, height: 6, borderRadius: radius.full, backgroundColor: colors.primary }} />
        </View>
      </View>
    </View>
  );
}

export function NutritionCard({ targets, logs, onAddFood }: { targets: NonNullable<MacroTargets>; logs: FoodLog[]; onAddFood: () => void }) {
  const totals = nutritionTotals(logs);
  return (
    <>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
          <View style={{ gap: spacing.xs, flex: 1 }}>
            <AppText variant="label">Dagdoel</AppText>
            <AppText style={{ fontSize: 28, fontWeight: '800', lineHeight: 32, fontVariant: ['tabular-nums'] }}>
              {Math.round(totals.kcal)} <AppText variant="label">/ {targets.calories} kcal</AppText>
            </AppText>
            <AppText variant="label" style={{ color: colors.primary }}>{Math.max(0, Math.round(targets.calories - totals.kcal))} kcal te gaan</AppText>
          </View>
          <ProgressRing current={totals.kcal} target={targets.calories} />
        </View>
        <MacroRow label="Koolhydraten" current={totals.carbs} target={targets.carbsMin} />
        <MacroRow label="Vetten" current={totals.fat} target={targets.fatMin} />
        <MacroRow label="Eiwitten" current={totals.protein} target={targets.proteinMin} />
        <AppText variant="caption" style={{ textAlign: 'center' }}>Vezels: {Math.round(totals.fiber)} g / 25 g aanbevolen</AppText>
      </Card>
      <NativeButton label="Voeding toevoegen" onPress={onAddFood} />
    </>
  );
}

export function FoodLogCard({ logs, foods, onDelete }: {
  logs: FoodLog[];
  foods: { id: string; unit_type?: string }[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!logs.length) return null;

  const order: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', null];
  const groups = order.map((category) => ({
    category,
    logs: logs.filter((log) => log.mealCategory === category),
  })).filter((group) => group.logs.length > 0);

  const remove = (log: FoodLog) => {
    Alert.alert('Voeding verwijderen?', `${log.name} wordt uit deze dag verwijderd.`, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => {
        setPendingId(log.id);
        setError(null);
        void onDelete(log.id).catch((reason: unknown) => {
          setError(reason instanceof Error ? reason.message : 'Verwijderen is niet gelukt.');
        }).finally(() => setPendingId(null));
      } },
    ]);
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="heading" style={{ flex: 1 }}>Wat je lichaam vandaag kreeg</AppText>
        <Pressable accessibilityRole="button" onPress={() => setExpanded((value) => !value)} style={({ pressed }) => ({ padding: spacing.sm, opacity: pressed ? 0.5 : 1 })}>
          <AppText variant="label" style={{ color: colors.primary }}>{expanded ? 'Verbergen' : 'Tonen'}</AppText>
        </Pressable>
      </View>
      {error && <InlineMessage error>{error}</InlineMessage>}
      {expanded && groups.map((group) => (
        <View key={String(group.category)} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0.5, borderBottomColor: colors.border, paddingBottom: spacing.sm }}>
            <AppText variant="label" style={{ color: colors.primary, textTransform: 'uppercase' }}>{mealLabel(group.category)}</AppText>
            <AppText variant="label" style={{ color: colors.text }}>{Math.round(nutritionTotals(group.logs).kcal)} kcal</AppText>
          </View>
          {group.logs.map((log) => {
            const unit = foods.find((food) => food.id === log.foodId)?.unit_type === 'per_100ml' ? 'ml' : 'g';
            const amount = log.quantity && log.unitName ? `${log.quantity} ${log.unitName}` : log.grams ? `${log.grams} ${unit}` : '';
            return (
              <View key={log.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted, padding: spacing.md, borderRadius: radius.md, borderCurve: 'continuous' }}>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <AppText variant="label" style={{ color: colors.text }} selectable>{log.name}</AppText>
                  <AppText variant="caption" selectable>{amount}{amount ? ' · ' : ''}{log.kcal} kcal · {log.protein} g eiwit</AppText>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel={`${log.name} verwijderen`} disabled={pendingId !== null} onPress={() => remove(log)} style={({ pressed }) => ({ padding: spacing.sm, opacity: pendingId === log.id || pressed ? 0.35 : 0.7 })}>
                  <AppIcon name="delete" size={20} color={colors.error} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </Card>
  );
}
