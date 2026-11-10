// These values mirror the existing website's design tokens in src/index.css.
export const colors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFAFA',
  text: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textTertiary: '#7A7A7A',
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  primary: '#FF8FA3',
  primaryHover: '#FF7A91',
  accent: '#FF8FA3',
  primarySoft: 'rgba(255, 143, 163, 0.08)',
  primarySoftHover: 'rgba(255, 143, 163, 0.12)',
  onPrimary: '#FFFFFF',
  calories: '#FF8FA3',
  protein: '#6BCB77',
  carbs: '#FFB74D',
  fat: '#9B59B6',
  movement: '#4ECDC4',
  symptoms: '#E8785F',
  success: '#4CAF50',
  successSoft: 'rgba(76, 175, 80, 0.08)',
  warning: '#FF9800',
  error: '#F44336',
  errorSoft: 'rgba(244, 67, 54, 0.08)',
  info: '#2196F3',
};

export const phaseBaseColors = {
  menstrual: '#FF5C8A',
  follicular: '#7FB4D9',
  ovulatory: '#C58AC6',
  luteal: '#9D92D4',
};

export const phaseColors = {
  menstrual: '#A93660',
  follicular: '#396789',
  ovulatory: '#80457F',
  luteal: '#5C4F90',
};

export const phaseSoftColors = {
  menstrual: 'rgba(255, 92, 138, 0.14)',
  follicular: 'rgba(127, 180, 217, 0.14)',
  ovulatory: 'rgba(197, 138, 198, 0.14)',
  luteal: 'rgba(157, 146, 212, 0.14)',
};

export const textStyles = {
  largeTitle: { fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: -0.7 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text, lineHeight: 23 },
  label: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary, lineHeight: 17 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const shadows = {
  card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  raised: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04)',
} as const;
