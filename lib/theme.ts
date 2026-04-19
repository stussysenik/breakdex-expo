import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  gray: string;
  success: string;
  warning: string;
  error: string;
  new: string;
  learning: string;
  review: string;
  mastery: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#EC4899',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  gray: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  new: '#3B82F6',
  learning: '#F59E0B',
  review: '#8B5CF6',
  mastery: '#10B981',
};

const darkColors: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  primary: '#818CF8',
  secondary: '#A78BFA',
  accent: '#F472B6',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  gray: '#6B7280',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  new: '#60A5FA',
  learning: '#FBBF24',
  review: '#A78BFA',
  mastery: '#34D399',
};

export function useColor(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export { lightColors, darkColors };