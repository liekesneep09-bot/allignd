import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View, type ColorValue, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { BottomSheet, Button, Host, RNHostView, TextInput } from '@expo/ui';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { colors, radius, shadows, spacing, textStyles } from '@/theme';

export type AppIconName = 'profile' | 'calendar' | 'add' | 'water' | 'steps' | 'weight' | 'food' | 'mood' | 'next' | 'previous' | 'close' | 'delete' | 'check' | 'movement';

const icons: Record<AppIconName, { ios: SFSymbol; android: AndroidSymbol; web: AndroidSymbol }> = {
  profile: { ios: 'person.crop.circle', android: 'person', web: 'person' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  water: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  steps: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
  weight: { ios: 'scalemass', android: 'monitor_weight', web: 'monitor_weight' },
  food: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  mood: { ios: 'face.smiling', android: 'sentiment_satisfied', web: 'sentiment_satisfied' },
  next: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  previous: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  delete: { ios: 'trash', android: 'delete', web: 'delete' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  movement: { ios: 'figure.strengthtraining.traditional', android: 'exercise', web: 'exercise' },
};

export function AppIcon({ name, size = 22, color = colors.text }: { name: AppIconName; size?: number; color?: ColorValue }) {
  return <SymbolView name={icons[name]} size={size} tintColor={color} style={{ width: size, height: size }} />;
}

export function AppText({ variant = 'body', style, selectable, ...props }: TextProps & { variant?: keyof typeof textStyles }) {
  return <Text style={[textStyles[variant] as TextStyle, style]} selectable={selectable ?? variant === 'body'} {...props} />;
}

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[{ backgroundColor: colors.surface, borderColor: colors.borderLight, borderWidth: 1, borderRadius: radius.lg, borderCurve: 'continuous', padding: spacing.lg, gap: spacing.md, boxShadow: shadows.card }, style]}>{children}</View>;
}

export function NativeButton({ label, onPress, disabled = false, loading = false, variant = 'filled' }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'text';
}) {
  return (
    <Host seedColor={colors.primary} matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Button
        label={loading ? 'Even geduld…' : label}
        onPress={onPress}
        disabled={disabled || loading}
        variant={variant}
        style={{ height: 48 }}
      />
    </Host>
  );
}

export function IconButton({ name, label, onPress, disabled = false }: { name: AppIconName; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44, height: 44, borderRadius: radius.md, borderCurve: 'continuous',
        backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.35 : pressed ? 0.55 : 1,
      })}
    >
      <AppIcon name={name} />
    </Pressable>
  );
}

export function InlineMessage({ children, error = false }: PropsWithChildren<{ error?: boolean }>) {
  return (
    <View accessibilityRole={error ? 'alert' : undefined} style={{ backgroundColor: error ? colors.errorSoft : colors.primarySoft, borderRadius: radius.md, borderCurve: 'continuous', padding: spacing.md }}>
      <AppText variant="label" style={{ color: error ? colors.error : colors.text }} selectable>{children}</AppText>
    </View>
  );
}

export function ScreenState({ loading = false, title, description, action }: {
  loading?: boolean;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
      {loading && <ActivityIndicator color={colors.primary} size="large" />}
      <AppText variant="title" style={{ textAlign: 'center' }}>{title}</AppText>
      {description && <AppText style={{ textAlign: 'center', color: colors.textSecondary }} selectable>{description}</AppText>}
      {action}
    </View>
  );
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, autoCapitalize = 'none' }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad' | 'number-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ gap: spacing.xs, width: '100%' }}>
      <AppText variant="label">{label}</AppText>
      <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
        <TextInput
          defaultValue={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          cursorColor={colors.primary}
          style={{ minHeight: 48, width: '100%', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.text } as never}
        />
      </Host>
    </View>
  );
}

export function FormSheet({ isPresented, onDismiss, title, children, scrollable = true, full = false }: PropsWithChildren<{
  isPresented: boolean;
  onDismiss: () => void;
  title: string;
  scrollable?: boolean;
  full?: boolean;
}>) {
  const content = (
    <View style={{ width: '100%', gap: spacing.lg, padding: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <AppText variant="heading" style={{ flex: 1 }}>{title}</AppText>
        <IconButton name="close" label="Sluiten" onPress={onDismiss} />
      </View>
      {children}
    </View>
  );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={full ? ['full'] : undefined}
      contentPadding={0}
    >
      <RNHostView matchContents={{ vertical: !full }} style={{ width: '100%' }}>
        {scrollable ? (
          <ScrollView
            style={{ width: '100%', maxHeight: full ? undefined : 680, flex: full ? 1 : undefined }}
            contentContainerStyle={{ flexGrow: full ? 1 : undefined }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {content}
          </ScrollView>
        ) : content}
      </RNHostView>
    </BottomSheet>
  );
}
