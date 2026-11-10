import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Host, Picker } from '@expo/ui';
import { AppText, Field, FormSheet, InlineMessage, NativeButton } from '@/components/ui';
import { mealLabel, mealLabels, symptomGroups } from '@/data/content';
import { colors, radius, spacing } from '@/theme';
import type { AddFoodInput, Food, MealCategory } from '@/types/today';

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => ({
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44, justifyContent: 'center',
      borderRadius: radius.full, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.border,
      backgroundColor: selected ? colors.primarySoft : colors.surface, opacity: pressed ? 0.65 : 1,
    })}>
      <AppText variant="label" style={{ color: selected ? colors.primary : colors.text }}>{label}</AppText>
    </Pressable>
  );
}

function MealPicker({ value, onChange }: { value: MealCategory; onChange: (category: MealCategory) => void }) {
  const options: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', null];
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="label">Maaltijd</AppText>
      <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
        <Picker selectedValue={value ?? 'other'} onValueChange={(next) => onChange(next === 'other' ? null : next as MealCategory)}>
          {options.map((option) => <Picker.Item key={String(option)} label={mealLabel(option)} value={option ?? 'other'} />)}
        </Picker>
      </Host>
    </View>
  );
}

export function FoodSheet({ isPresented, onDismiss, date, foods, onAdd }: {
  isPresented: boolean;
  onDismiss: () => void;
  date: string;
  foods: Food[];
  onAdd: (input: AddFoodInput) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [amount, setAmount] = useState('100');
  const [unit, setUnit] = useState<'grams' | 'portion'>('grams');
  const [mealCategory, setMealCategory] = useState<MealCategory>('breakfast');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPresented) {
      setQuery('');
      setSelected(null);
      setAmount('100');
      setUnit('grams');
      setError(null);
    }
  }, [isPresented, date]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('nl');
    if (!normalized) return foods;
    return foods.filter((food) => [food.name_nl, food.name_en, ...(food.aliases ?? [])]
      .filter(Boolean).some((name) => name!.toLocaleLowerCase('nl').includes(normalized)));
  }, [foods, query]);

  const numericAmount = Number(amount.replace(',', '.'));
  const grams = selected ? (unit === 'portion' ? numericAmount * (selected.unit_weight ?? 100) : numericAmount) : 0;
  const estimatedCalories = selected && Number.isFinite(grams) ? Math.round(selected.kcal_100 * grams / 100) : 0;

  const save = async () => {
    if (!selected) { setError('Kies eerst een product.'); return; }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) { setError('Vul een geldige hoeveelheid in.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onAdd({ food: selected, amount: numericAmount, unit, mealCategory, date });
      onDismiss();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.');
    } finally { setSaving(false); }
  };

  return (
    <FormSheet isPresented={isPresented} onDismiss={onDismiss} title="Voeding toevoegen" scrollable={false} full>
      <Field label="Zoeken" value={query} onChangeText={setQuery} placeholder="Bijvoorbeeld banaan of havermout" />
      <FlatList
        data={filtered}
        keyExtractor={(food) => String(food.id)}
        style={{ maxHeight: 250 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<AppText variant="label">Geen producten gevonden. Probeer een andere zoekterm.</AppText>}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityState={{ selected: selected?.id === item.id }} onPress={() => {
            setSelected(item);
            setAmount(String(item.unit_weight ?? 100));
            setUnit('grams');
            setError(null);
          }} style={({ pressed }) => ({ paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.border, backgroundColor: selected?.id === item.id ? colors.primarySoft : 'transparent', opacity: pressed ? 0.6 : 1 })}>
            <AppText variant="label" style={{ color: colors.text }} selectable>{item.name_nl}</AppText>
            <AppText variant="caption">{item.kcal_100} kcal / 100 {item.unit_type === 'per_100ml' ? 'ml' : 'g'}{item.isCustom ? ' · Eigen product' : ''}</AppText>
          </Pressable>
        )}
      />
      {selected && (
        <View style={{ gap: spacing.md }}>
          <AppText variant="heading" selectable>{selected.name_nl}</AppText>
          <MealPicker value={mealCategory} onChange={setMealCategory} />
          <Field key={selected.id} label={unit === 'portion' ? `Aantal (${selected.unit_name ?? 'porties'})` : `Hoeveelheid (${selected.unit_type === 'per_100ml' ? 'ml' : 'gram'})`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          {selected.unit_weight && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <ChoiceChip label={selected.unit_type === 'per_100ml' ? 'Milliliter' : 'Gram'} selected={unit === 'grams'} onPress={() => setUnit('grams')} />
              <ChoiceChip label={selected.unit_name ?? 'Portie'} selected={unit === 'portion'} onPress={() => setUnit('portion')} />
            </View>
          )}
          <AppText variant="label">Ongeveer {estimatedCalories} kcal</AppText>
        </View>
      )}
      {error && <InlineMessage error>{error}</InlineMessage>}
      <NativeButton label="Toevoegen aan mijn dag" onPress={() => void save()} loading={saving} disabled={!selected} />
    </FormSheet>
  );
}

export function NumberSheet({ kind, isPresented, onDismiss, date, currentValue, onSave }: {
  kind: 'water' | 'steps' | 'weight';
  isPresented: boolean;
  onDismiss: () => void;
  date: string;
  currentValue: number;
  onSave: (value: number) => Promise<void>;
}) {
  const config = {
    water: { title: 'Water toevoegen', label: 'Hoeveelheid in ml', button: 'Water toevoegen', initial: '', quick: [250, 500] },
    steps: { title: 'Stappen bijwerken', label: 'Totaal aantal stappen', button: 'Stappen opslaan', initial: String(currentValue || ''), quick: [] },
    weight: { title: 'Gewicht loggen', label: 'Gewicht in kg', button: 'Gewicht opslaan', initial: currentValue ? String(currentValue) : '', quick: [] },
  }[kind];
  const [value, setValue] = useState(config.initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (isPresented) { setValue(config.initial); setError(null); } }, [isPresented, date, config.initial]);

  const save = async (nextValue: number) => {
    if (!Number.isFinite(nextValue) || nextValue <= 0 || (kind === 'steps' && !Number.isInteger(nextValue))) {
      setError('Vul een geldige waarde in.'); return;
    }
    setSaving(true); setError(null);
    try { await onSave(nextValue); onDismiss(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.'); }
    finally { setSaving(false); }
  };

  return (
    <FormSheet isPresented={isPresented} onDismiss={onDismiss} title={config.title}>
      <Field key={`${kind}-${date}-${isPresented}`} label={config.label} value={value} onChangeText={setValue} keyboardType={kind === 'steps' ? 'number-pad' : 'decimal-pad'} />
      {kind === 'water' && <AppText variant="caption">Deze hoeveelheid wordt bij je dagtotaal opgeteld.</AppText>}
      {kind === 'steps' && <AppText variant="caption">Vul het totaal voor deze dag in, niet alleen de extra stappen.</AppText>}
      {config.quick.length > 0 && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {config.quick.map((amount) => <ChoiceChip key={amount} label={`+ ${amount} ml`} selected={false} onPress={() => void save(amount)} />)}
        </View>
      )}
      {error && <InlineMessage error>{error}</InlineMessage>}
      <NativeButton label={config.button} onPress={() => void save(Number(value.replace(',', '.')))} loading={saving} />
    </FormSheet>
  );
}

export function SymptomSheet({ isPresented, onDismiss, selectedSymptoms, onSave }: {
  isPresented: boolean;
  onDismiss: () => void;
  selectedSymptoms: string[];
  onSave: (symptoms: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState(selectedSymptoms);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (isPresented) { setSelected(selectedSymptoms); setError(null); } }, [isPresented, selectedSymptoms]);

  const save = async () => {
    setSaving(true); setError(null);
    try { await onSave(selected); onDismiss(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.'); }
    finally { setSaving(false); }
  };

  return (
    <FormSheet isPresented={isPresented} onDismiss={onDismiss} title="Hoe voel je je?">
      {symptomGroups.map((group) => (
        <View key={group.title} style={{ gap: spacing.sm }}>
          <AppText variant="heading">{group.title}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {group.items.map((item) => <ChoiceChip key={item.id} label={item.label} selected={selected.includes(item.id)} onPress={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} />)}
          </View>
        </View>
      ))}
      {error && <InlineMessage error>{error}</InlineMessage>}
      <NativeButton label="Check-in opslaan" onPress={() => void save()} loading={saving} />
    </FormSheet>
  );
}

export function MovementCard({ status, onSave }: { status: string | null; onSave: (status: 'moved' | 'rest') => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (next: 'moved' | 'rest') => {
    setSaving(true); setError(null);
    try { await onSave(next); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Opslaan is niet gelukt.'); }
    finally { setSaving(false); }
  };
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="heading">Beweging</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <ChoiceChip label={status === 'moved' ? '✓ Bewogen' : 'Ik heb bewogen'} selected={status === 'moved'} onPress={() => { if (!saving) void save('moved'); }} />
        <ChoiceChip label={status === 'rest' ? '✓ Rustdag' : 'Rustdag'} selected={status === 'rest'} onPress={() => { if (!saving) void save('rest'); }} />
      </View>
      {error && <InlineMessage error>{error}</InlineMessage>}
    </View>
  );
}

export { mealLabels };
