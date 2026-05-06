import { useColorScheme } from 'react-native';
import { light, dark } from './carbon-tokens';

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
  background: light.background,
  surface: light.layer01,
  primary: light.buttonPrimary,
  secondary: light.linkPrimary,
  accent: light.tagPurple,
  text: light.textPrimary,
  textSecondary: light.textSecondary,
  border: light.borderSubtle01,
  gray: light.toggleOff,
  success: light.supportSuccess,
  warning: light.supportWarning,
  error: light.supportError,
  new: light.tagBlue,
  learning: light.tagYellow,
  review: light.tagPurple,
  mastery: light.tagGreen,
};

const darkColors: ThemeColors = {
  background: dark.background,
  surface: dark.layer01,
  primary: dark.buttonPrimary,
  secondary: dark.linkPrimary,
  accent: dark.tagPurple,
  text: dark.textPrimary,
  textSecondary: dark.textSecondary,
  border: dark.borderSubtle01,
  gray: dark.toggleOff,
  success: dark.supportSuccess,
  warning: dark.supportWarning,
  error: dark.supportError,
  new: dark.tagBlue,
  learning: dark.tagYellow,
  review: dark.tagPurple,
  mastery: dark.tagGreen,
};

export function useColor(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export { lightColors, darkColors };
