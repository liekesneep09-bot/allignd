import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '@/components/ui';
import { colors, phaseBaseColors, phaseColors } from '@/theme';
import type { Phase } from '@/types/today';

export function ProgressRing({ current, target, size = 108 }: { current: number; target: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceMuted} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius} stroke={colors.accent} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - percentage / 100)}
          rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <AppText variant="heading" style={{ color: colors.primary, fontVariant: ['tabular-nums'] }}>{percentage}%</AppText>
      <AppText variant="caption">van dagdoel</AppText>
    </View>
  );
}

export function CycleRing({ day, cycleLength, periodLength, phase, children }: PropsWithChildren<{
  day: number;
  cycleLength: number;
  periodLength: number;
  phase: Phase;
}>) {
  const size = 144;
  const stroke = 10;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const ovulationCenter = cycleLength - 14;
  const segments: { phase: Phase; start: number; end: number }[] = [
    { phase: 'menstrual', start: 0, end: periodLength },
    { phase: 'follicular', start: periodLength, end: ovulationCenter - 3 },
    { phase: 'ovulatory', start: ovulationCenter - 3, end: ovulationCenter + 2 },
    { phase: 'luteal', start: ovulationCenter + 2, end: cycleLength },
  ];
  const ringDay = Math.max(0.5, Math.min(day - 0.5, cycleLength));
  const angle = ((ringDay / cycleLength) * 360 - 90) * (Math.PI / 180);
  const dotX = size / 2 + radius * Math.cos(angle);
  const dotY = size / 2 + radius * Math.sin(angle);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {segments.map((segment) => {
          const length = Math.max(0, segment.end - segment.start);
          const dash = (length / cycleLength) * circumference;
          return (
            <Circle
              key={segment.phase}
              cx={size / 2} cy={size / 2} r={radius} fill="none"
              stroke={phaseBaseColors[segment.phase]} strokeWidth={stroke}
              opacity={segment.phase === phase ? 1 : 0.96}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-(segment.start / cycleLength) * circumference}
              rotation={-90} origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
        <Circle cx={dotX} cy={dotY} r={7} fill={colors.surface} stroke={phaseColors[phase]} strokeWidth={3} />
      </Svg>
      {children}
    </View>
  );
}
