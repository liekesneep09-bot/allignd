import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui';
import { addDays, todayString } from '@/lib/date';
import { colors, radius, spacing } from '@/theme';

export function DayStrip({ selectedDate, onSelect, accentColor }: { selectedDate: string; onSelect: (date: string) => void; accentColor: string }) {
  const today = todayString();
  const selected = new Date(`${selectedDate}T12:00:00`);
  const weekday = selected.getDay();
  const daysFromMonday = weekday === 0 ? -6 : 1 - weekday;
  const monday = addDays(selectedDate, daysFromMonday);
  const dates = Array.from({ length: 7 }, (_, index) => addDays(monday, index));

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm }}>
      {dates.map((date) => {
        const parsed = new Date(`${date}T12:00:00`);
        const isSelected = date === selectedDate;
        const isToday = date === today;
        return (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={parsed.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(date)}
            style={({ pressed }) => ({
              alignItems: 'center', gap: spacing.xs, padding: spacing.sm, minWidth: 36,
              borderRadius: radius.lg, borderCurve: 'continuous',
              backgroundColor: isSelected ? colors.surface : 'transparent',
              boxShadow: isSelected ? '0 2px 10px rgba(0, 0, 0, 0.05)' : 'none',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <AppText variant="caption" style={{ color: isSelected ? accentColor : colors.text, opacity: isSelected ? 1 : 0.6, textTransform: 'uppercase', fontSize: 11, lineHeight: 14 }}>
              {parsed.toLocaleDateString('nl-NL', { weekday: 'narrow' })}
            </AppText>
            <View style={{ position: 'relative' }}>
              <AppText variant="label" style={{ color: isSelected ? accentColor : colors.text, fontWeight: isSelected || isToday ? '700' : '400', lineHeight: 18 }}>{parsed.getDate()}</AppText>
              {isToday && !isSelected && <View style={{ position: 'absolute', bottom: -4, left: '50%', marginLeft: -2, width: 4, height: 4, borderRadius: radius.full, backgroundColor: colors.primary }} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
