import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from '@tamagui/core';
import {
  tamaguiLightPalette,
  tamaguiDarkPalette,
  carbonLightTheme,
  carbonDarkTheme,
} from './lib/carbon-tokens';

const lightPalette = tamaguiLightPalette as unknown as string[];
const darkPalette = tamaguiDarkPalette as unknown as string[];

const baseLight = defaultConfig.themes.light;
const baseDark = defaultConfig.themes.dark;

const carbonLight = {
  ...baseLight,
  // Base palette: 12-step carbon gray scale
  color1: lightPalette[0],
  color2: lightPalette[1],
  color3: lightPalette[2],
  color4: lightPalette[3],
  color5: lightPalette[4],
  color6: lightPalette[5],
  color7: lightPalette[6],
  color8: lightPalette[7],
  color9: lightPalette[8],
  color10: lightPalette[9],
  color11: lightPalette[10],
  color12: lightPalette[11],
  // Surface layers
  background0: lightPalette[0],
  background02: lightPalette[1],
  background04: lightPalette[2],
  background06: lightPalette[3],
  background08: lightPalette[4],
  // Semantic UI
  ...carbonLightTheme,
};

const carbonDark = {
  ...baseDark,
  // Base palette: 12-step carbon gray scale (dark)
  color1: darkPalette[0],
  color2: darkPalette[1],
  color3: darkPalette[2],
  color4: darkPalette[3],
  color5: darkPalette[4],
  color6: darkPalette[5],
  color7: darkPalette[6],
  color8: darkPalette[7],
  color9: darkPalette[8],
  color10: darkPalette[9],
  color11: darkPalette[10],
  color12: darkPalette[11],
  // Surface layers
  background0: darkPalette[0],
  background02: darkPalette[1],
  background04: darkPalette[2],
  background06: darkPalette[3],
  background08: darkPalette[4],
  // Semantic UI
  ...carbonDarkTheme,
};

export default createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: carbonLight,
    dark: carbonDark,
  },
});
