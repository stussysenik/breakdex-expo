// IBM Carbon v11 Design Tokens
// https://carbondesignsystem.com/guidelines/color/overview
//
// These are the canonical Carbon v11 values, organized for Tamagui integration.
// Gray scale: gray-10 through gray-100 (10 steps)
// Color families: blue, red, green, yellow, teal, purple, magenta, cyan, orange
// Each family has 10-100 step values.

// ── Gray Scale ──────────────────────────────────────────────────────────────

export const gray = {
  10: '#f4f4f4',
  20: '#e0e0e0',
  30: '#c6c6c6',
  40: '#a8a8a8',
  50: '#8d8d8d',
  60: '#6f6f6f',
  70: '#525252',
  80: '#393939',
  90: '#262626',
  100: '#161616',
} as const;

// ── Color Families ──────────────────────────────────────────────────────────

export const blue = {
  10: '#d0e2ff',
  20: '#a6c8ff',
  30: '#78a9ff',
  40: '#4589ff',
  50: '#0f62fe',
  60: '#0043ce',
  70: '#002d9c',
  80: '#001d6c',
  90: '#001141',
  100: '#00071f',
} as const;

export const red = {
  10: '#fff1f1',
  20: '#ffd7d9',
  30: '#ffb3b8',
  40: '#ff8389',
  50: '#fa4d56',
  60: '#da1e28',
  70: '#a2191f',
  80: '#750e13',
  90: '#520408',
  100: '#2d0709',
} as const;

export const green = {
  10: '#defbe6',
  20: '#a7f0ba',
  30: '#6fdc8c',
  40: '#42be65',
  50: '#24a148',
  60: '#198038',
  70: '#0e6027',
  80: '#044317',
  90: '#022d0d',
  100: '#071908',
} as const;

export const yellow = {
  10: '#fcf4d6',
  20: '#fddc69',
  30: '#f1c21b',
  40: '#d2a106',
  50: '#b28600',
  60: '#8e6a00',
  70: '#684e00',
  80: '#483700',
  90: '#302400',
  100: '#1c1500',
} as const;

export const teal = {
  10: '#d9fbfb',
  20: '#9ef0f0',
  30: '#3ddbd9',
  40: '#08bdba',
  50: '#009d9a',
  60: '#007d79',
  70: '#005d5d',
  80: '#004144',
  90: '#022b30',
  100: '#081a1c',
} as const;

export const purple = {
  10: '#f6f2ff',
  20: '#e8daff',
  30: '#d4bbff',
  40: '#be95ff',
  50: '#a56eff',
  60: '#8a3ffc',
  70: '#6929c4',
  80: '#491d8b',
  90: '#31135e',
  100: '#1c0f30',
} as const;

export const magenta = {
  10: '#fff0f7',
  20: '#ffd6e8',
  30: '#ffafd2',
  40: '#ff7eb6',
  50: '#ee5396',
  60: '#d12771',
  70: '#9f1853',
  80: '#740937',
  90: '#510224',
  100: '#2a0a18',
} as const;

export const cyan = {
  10: '#e5f6ff',
  20: '#bae6ff',
  30: '#82cfff',
  40: '#33b1ff',
  50: '#1192e8',
  60: '#0072c3',
  70: '#00539a',
  80: '#003a6d',
  90: '#012749',
  100: '#061727',
} as const;

export const orange = {
  10: '#fff2e8',
  20: '#ffd9be',
  30: '#ffb784',
  40: '#ff832b',
  50: '#eb6200',
  60: '#ba4e00',
  70: '#8a3800',
  80: '#5e2900',
  90: '#3e1a00',
  100: '#231000',
} as const;

export const warmGray = {
  10: '#f7f3f1',
  20: '#e5e0df',
  30: '#cac5c4',
  40: '#ada8a8',
  50: '#8f8b8b',
  60: '#726e6e',
  70: '#565151',
  80: '#3c3838',
  90: '#272525',
  100: '#171414',
} as const;

export const coolGray = {
  10: '#f2f4f8',
  20: '#dde1e6',
  30: '#c1c7cd',
  40: '#a2a9b0',
  50: '#878d96',
  60: '#697077',
  70: '#4d5358',
  80: '#343a3f',
  90: '#21272a',
  100: '#121619',
} as const;

// ── Semantic Light Tokens ───────────────────────────────────────────────────

export const light = {
  background: '#ffffff',
  backgroundInverse: gray[100],
  backgroundHover: 'rgba(141, 141, 141, 0.12)',
  backgroundActive: gray[30],
  backgroundSelected: 'rgba(141, 141, 141, 0.20)',
  backgroundSelectedHover: 'rgba(141, 141, 141, 0.32)',

  layer01: gray[10],
  layer02: '#ffffff',
  layer03: gray[10],
  layerAccent01: gray[20],
  layerAccent02: gray[20],
  layerAccent03: gray[20],

  field01: gray[10],
  field02: '#ffffff',

  borderSubtle00: gray[20],
  borderSubtle01: gray[20],
  borderSubtleSelected: gray[30],
  borderStrong01: gray[50],
  borderStrong02: gray[50],
  borderStrong03: gray[50],
  borderInteractive: blue[60],

  textPrimary: gray[100],
  textSecondary: gray[70],
  textPlaceholder: gray[40],
  textOnColor: '#ffffff',
  textOnColorDisabled: gray[50],
  textHelper: gray[60],
  textError: red[60],
  textInverse: '#ffffff',

  linkPrimary: blue[60],
  linkPrimaryHover: blue[70],
  linkSecondary: blue[70],
  linkVisited: purple[60],
  linkInverse: blue[40],

  iconPrimary: gray[100],
  iconSecondary: gray[70],
  iconOnColor: '#ffffff',
  iconOnColorDisabled: gray[50],
  iconInteractive: blue[60],
  iconInverse: '#ffffff',

  buttonPrimary: blue[60],
  buttonPrimaryHover: blue[70],
  buttonPrimaryActive: blue[80],
  buttonSecondary: gray[80],
  buttonSecondaryHover: gray[70],
  buttonSecondaryActive: gray[60],
  buttonTertiary: blue[60],
  buttonTertiaryHover: blue[70],
  buttonTertiaryActive: blue[80],
  buttonDangerPrimary: red[60],
  buttonDangerHover: red[70],
  buttonDangerActive: red[80],
  buttonDangerSecondary: red[60],
  buttonSeparator: gray[20],
  buttonDisabled: gray[30],

  supportError: red[60],
  supportSuccess: green[60],
  supportWarning: yellow[30],
  supportInfo: blue[70],
  supportErrorInverse: red[50],
  supportSuccessInverse: green[40],
  supportWarningInverse: yellow[30],
  supportInfoInverse: blue[40],
  supportCautionMinor: yellow[30],
  supportCautionMajor: orange[40],
  supportCautionUndefined: purple[60],

  focus: blue[60],
  focusInset: '#ffffff',
  focusInverse: '#ffffff',

  skeleton01: gray[10],
  skeleton02: gray[30],

  highlight: blue[20],
  overlay: 'rgba(22, 22, 22, 0.5)',

  toggleOff: gray[50],

  // Tag colors
  tagBlue: blue[60],
  tagRed: red[60],
  tagGreen: green[60],
  tagYellow: yellow[40],
  tagTeal: teal[60],
  tagPurple: purple[60],
  tagMagenta: magenta[60],
  tagCyan: cyan[60],
  tagOrange: orange[60],
  tagWarmGray: warmGray[60],
  tagCoolGray: coolGray[60],
  tagGray: gray[60],
} as const;

// ── Semantic Dark Tokens (Gray 100) ─────────────────────────────────────────

export const dark = {
  background: gray[100],
  backgroundInverse: gray[10],
  backgroundHover: 'rgba(141, 141, 141, 0.16)',
  backgroundActive: gray[70],
  backgroundSelected: 'rgba(141, 141, 141, 0.24)',
  backgroundSelectedHover: 'rgba(141, 141, 141, 0.32)',

  layer01: gray[90],
  layer02: gray[80],
  layer03: gray[70],
  layerAccent01: gray[80],
  layerAccent02: gray[70],
  layerAccent03: gray[60],

  field01: gray[90],
  field02: gray[80],

  borderSubtle00: gray[70],
  borderSubtle01: gray[70],
  borderSubtleSelected: gray[60],
  borderStrong01: gray[50],
  borderStrong02: gray[40],
  borderStrong03: gray[30],
  borderInteractive: blue[50],

  textPrimary: gray[10],
  textSecondary: gray[30],
  textPlaceholder: gray[60],
  textOnColor: gray[100],
  textOnColorDisabled: gray[50],
  textHelper: gray[40],
  textError: red[30],
  textInverse: gray[100],

  linkPrimary: blue[40],
  linkPrimaryHover: blue[30],
  linkSecondary: blue[40],
  linkVisited: purple[40],
  linkInverse: blue[60],

  iconPrimary: gray[10],
  iconSecondary: gray[30],
  iconOnColor: gray[100],
  iconOnColorDisabled: gray[50],
  iconInteractive: blue[40],
  iconInverse: gray[100],

  buttonPrimary: blue[60],
  buttonPrimaryHover: blue[50],
  buttonPrimaryActive: blue[80],
  buttonSecondary: gray[60],
  buttonSecondaryHover: gray[50],
  buttonSecondaryActive: gray[80],
  buttonTertiary: blue[40],
  buttonTertiaryHover: blue[30],
  buttonTertiaryActive: blue[50],
  buttonDangerPrimary: red[60],
  buttonDangerHover: red[50],
  buttonDangerActive: red[80],
  buttonDangerSecondary: red[40],
  buttonSeparator: gray[70],
  buttonDisabled: gray[70],

  supportError: red[50],
  supportSuccess: green[40],
  supportWarning: yellow[30],
  supportInfo: blue[40],
  supportErrorInverse: red[60],
  supportSuccessInverse: green[60],
  supportWarningInverse: yellow[30],
  supportInfoInverse: blue[50],
  supportCautionMinor: yellow[30],
  supportCautionMajor: orange[40],
  supportCautionUndefined: purple[50],

  focus: '#ffffff',
  focusInset: gray[100],
  focusInverse: blue[60],

  skeleton01: gray[80],
  skeleton02: gray[70],

  highlight: blue[90],
  overlay: 'rgba(22, 22, 22, 0.7)',

  toggleOff: gray[60],

  tagBlue: blue[40],
  tagRed: red[50],
  tagGreen: green[50],
  tagYellow: yellow[40],
  tagTeal: teal[40],
  tagPurple: purple[50],
  tagMagenta: magenta[50],
  tagCyan: cyan[40],
  tagOrange: orange[40],
  tagWarmGray: warmGray[50],
  tagCoolGray: coolGray[50],
  tagGray: gray[50],
} as const;

// ── Carbon Spacing Scale (base 4px, step size = 2px × step) ─────────────────

export const spacing = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
  11: 80,
  12: 96,
  13: 160,
} as const;

// ── Carbon Type Scale ───────────────────────────────────────────────────────

export const typeScale = {
  code01: 12,
  code02: 14,
  label01: 12,
  label02: 14,
  helperText01: 12,
  helperText02: 14,
  bodyCompact01: 14,
  bodyCompact02: 16,
  body01: 14,
  body02: 16,
  headingCompact01: 14,
  headingCompact02: 16,
  heading01: 14,
  heading02: 16,
  heading03: 20,
  heading04: 28,
  heading05: 32,
  heading06: 42,
  heading07: 54,
  productiveHeading01: 14,
  productiveHeading02: 16,
  productiveHeading03: 20,
  productiveHeading04: 28,
  productiveHeading05: 32,
  productiveHeading06: 42,
  productiveHeading07: 54,
  expressiveHeading01: 14,
  expressiveHeading02: 16,
  expressiveHeading03: 20,
  expressiveHeading04: 28,
  expressiveHeading05: 32,
  expressiveHeading06: 42,
  expressiveHeading07: 54,
  expressiveHeading08: 72,
  quotedisplay: 20,
  quote01: 28,
  quote02: 32,
  display01: 42,
  display02: 54,
  display03: 54,
  display04: 72,
} as const;

export const lineHeights = {
  code01: 16,
  code02: 20,
  label01: 16,
  label02: 18,
  helperText01: 16,
  helperText02: 18,
  bodyCompact01: 18,
  bodyCompact02: 22,
  body01: 20,
  body02: 24,
  headingCompact01: 18,
  headingCompact02: 22,
  heading04: 36,
  heading05: 40,
  heading06: 50,
  heading07: 64,
  productiveHeading04: 36,
  productiveHeading05: 40,
  productiveHeading06: 50,
  productiveHeading07: 64,
  expressiveHeading04: 36,
  expressiveHeading05: 40,
  expressiveHeading06: 50,
  expressiveHeading07: 64,
  expressiveHeading08: 88,
  quotedisplay: 26,
  quote01: 36,
  quote02: 40,
  display01: 50,
  display02: 64,
  display03: 64,
  display04: 88,
} as const;

// ── Carbon Font Families ────────────────────────────────────────────────────

export const fonts = {
  sans: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
  mono: '"IBM Plex Mono", "Menlo", "Courier New", monospace',
  serif: '"IBM Plex Serif", "Georgia", serif',
} as const;

// ── Carbon Font Weights ─────────────────────────────────────────────────────

export const fontWeight = {
  light: 300,
  regular: 400,
  semibold: 600,
} as const;

// ── Tamagui-Compatible Theme Maps ───────────────────────────────────────────

// 12-step palette for Tamagui's theme system
// Light: starts at white, progresses to gray-100
// Dark:  starts at gray-100, progresses to white
export const tamaguiLightPalette = [
  '#ffffff',     // color1  (white)
  gray[10],      // color2
  gray[20],      // color3
  gray[30],      // color4
  gray[40],      // color5
  gray[50],      // color6
  gray[60],      // color7
  gray[70],      // color8
  gray[80],      // color9
  gray[90],      // color10
  gray[100],     // color11
  gray[100],     // color12 (text)
] as const;

export const tamaguiDarkPalette = [
  gray[100],     // color1  (darkest surface)
  gray[90],      // color2
  gray[80],      // color3
  gray[70],      // color4
  gray[60],      // color5
  gray[50],      // color6
  gray[40],      // color7
  gray[30],      // color8
  gray[20],      // color9
  gray[10],      // color10
  '#ffffff',     // color11
  '#ffffff',     // color12 (text)
] as const;

// Full theme overrides that map Carbon semantics to Tamagui theme keys
export const carbonLightTheme = {
  background: light.background,
  backgroundHover: light.backgroundHover,
  backgroundPress: light.backgroundActive,
  backgroundFocus: light.backgroundSelected,
  color: light.textPrimary,
  colorHover: light.textPrimary,
  colorPress: light.textPrimary,
  colorFocus: light.textPrimary,
  borderColor: light.borderSubtle01,
  borderColorHover: light.borderStrong01,
  borderColorPress: light.borderInteractive,
  borderColorFocus: light.focus,
  shadowColor: 'rgba(0,0,0,0.08)',
  shadowColorHover: 'rgba(0,0,0,0.12)',
  shadowColorPress: 'rgba(0,0,0,0.16)',
  shadowColorFocus: 'rgba(0,0,0,0.20)',
  placeholderColor: light.textPlaceholder,
  outlineColor: light.focus,
} as const;

export const carbonDarkTheme = {
  background: dark.background,
  backgroundHover: dark.backgroundHover,
  backgroundPress: dark.backgroundActive,
  backgroundFocus: dark.backgroundSelected,
  color: dark.textPrimary,
  colorHover: dark.textPrimary,
  colorPress: dark.textPrimary,
  colorFocus: dark.textPrimary,
  borderColor: dark.borderSubtle01,
  borderColorHover: dark.borderStrong01,
  borderColorPress: dark.borderInteractive,
  borderColorFocus: dark.focus,
  shadowColor: 'rgba(0,0,0,0.4)',
  shadowColorHover: 'rgba(0,0,0,0.5)',
  shadowColorPress: 'rgba(0,0,0,0.6)',
  shadowColorFocus: 'rgba(0,0,0,0.7)',
  placeholderColor: dark.textPlaceholder,
  outlineColor: dark.focus,
} as const;
