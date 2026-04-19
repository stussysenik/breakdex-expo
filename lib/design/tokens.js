// Breakdex Design Tokens - Generated from EDN
// =========================================
// IBM Carbon-inspired design system as pure JS modules

export const tokens = {
  colors: {
    light: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      fill: "#F1F5F9",
      text: "#0B0D12",
      secondary: "#5A6272",
      separator: "#D9E0EA",
      accent: "#1F5EFF",
      error: "#C23B2A",
      warning: "#B7791F",
      success: "#1F7A4F"
    },
    dark: {
      background: "#090B10",
      surface: "#11141B",
      fill: "#1A1F29",
      text: "#F7FAFF",
      secondary: "#A7B1C2",
      separator: "#283041",
      accent: "#4F7AFF",
      error: "#F87171",
      warning: "#FBBF24",
      success: "#34D399"
    },
    state: {
      new: "#E45D7A",
      learning: "#2F6BFF",
      mastery: "#1F8A70"
    },
    review: {
      again: "#C23B2A",
      hard: "#B7791F",
      good: "#1F7A4F",
      easy: "#0D9F9A"
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    edge: 20
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30
  },
  typography: {
    "title-large": 30,
    "title-medium": 24,
    "title-small": 20,
    "body-medium": 16,
    "body-small": 14,
    caption: 12
  },
  shadows: {
    soft: { blur: 12, offset: [0, 4], opacity: 0.08 },
    raised: { blur: 22, offset: [0, 10], opacity: 0.12 },
    focus: { blur: 34, offset: [0, 16], opacity: 0.18 }
  }
};

export function getColor(theme, colorName) {
  const colors = tokens.colors;
  return colors[theme]?.[colorName] ?? colors.light[colorName] ?? "#000000";
}

export function getSpacing(key) {
  return tokens.spacing[key] ?? 0;
}

export function getRadius(key) {
  return tokens.radius[key] ?? 0;
}

export function getTypeSize(key) {
  return tokens.typography[key] ?? 16;
}

export default tokens;