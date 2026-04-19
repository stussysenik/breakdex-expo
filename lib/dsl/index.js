// Breakdex DSL - Hiccup-Style Component Builder
// =====================================
// Pure data in → React elements out
// Pattern: [Component props children]

import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image, Pressable } from 'react-native';
import { tokens, getColor, getSpacing, getRadius, getTypeSize } from '../design/tokens';

// ═══════════════════════════════════════════════════
// THEME CONTEXT
// ═══════════════════════════════════════════════════

let currentTheme = 'light';

export const setTheme = (theme) => {
  currentTheme = theme;
};

export const useTheme = () => currentTheme;

// ═══════════════════════════════════════════════════
// BASE ELEMENT - Creates React element from hiccup data
// =======================

export const element = (Component, props = {}, ...children) => {
  const { style, ...rest } = props;
  
  // Resolve style tokens
  const resolved = resolveStyles(style);
  
  return { Component, props: { ...rest, style: resolved }, children };
};

// ═══════════════════════════════════════════════════
// STYLE RESOLUTION
// ═══════════════════════════════════════════════════

const resolveStyles = (style) => {
  if (!style) return {};
  if (typeof style === 'string') {
    // Token reference: "color:background" or "spacing:md"
    const [ns, key] = style.split(':');
    switch (ns) {
      case 'color':
        return { color: getColor(currentTheme, key) };
      case 'spacing':
        return { padding: getSpacing(key) };
      case 'radius':
        return { borderRadius: getRadius(key) };
      case 'type':
        return { fontSize: getTypeSize(key) };
      default:
        return {};
    }
  }
  if (typeof style === 'object') {
    const resolved = {};
    for (const [k, v] of Object.entries(style)) {
      if (typeof v === 'string' && v.includes(':')) {
        resolved[k] = resolveToken(v);
      } else if (typeof v === 'object') {
        resolved[k] = resolveStyles(v);
      } else {
        resolved[k] = v;
      }
    }
    return resolved;
  }
  return style;
};

const resolveToken = (token) => {
  if (typeof token !== 'string' || !token.includes(':')) return token;
  const [ns, key] = token.split(':');
  switch (ns) {
    case 'color': return getColor(currentTheme, key);
    case 'spacing': return getSpacing(key);
    case 'radius': return getRadius(key);
    case 'type': return getTypeSize(key);
    default: return token;
  }
};

// ═══════════════════════════════════════════════════════════
// HICCUP COMPONENTS - Following [tag props & children] pattern
// ═══════════════════════════════════════════════════

export const view = (props, ...children) => 
  element(View, props, ...children);

export const text = (props, ...children) => 
  element(Text, props, ...children);

export const textInput = (props) => 
  element(TextInput, props);

export const scrollView = (props, ...children) => 
  element(ScrollView, props, ...children);

export const flatList = (props) => 
  element(FlatList, props);

export const image = (props) => 
  element(Image, props);

export const pressable = (props, ...children) => 
  element(Pressable, props, ...children);

export const touchable = (props, ...children) => 
  element(TouchableOpacity, props, ...children);

// ═══════════════════════════════════════════════════
// COMPOSITE COMPONENTS - Pre-built patterns
// ═══════════════════════════════════════════════════

export const screen = (title, ...children) => view(
  { style: { flex: 1, backgroundColor: getColor(currentTheme, 'background') } },
  ...children
);

export const header = (title, actions) => view(
  { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
  text({
    style: { 
      fontSize: getTypeSize('title-medium'),
      fontWeight: '600',
      color: getColor(currentTheme, 'text')
    }
  }, title)
  // Actions would be rendered here
);

export const card = (props, ...children) => view(
  { 
    style: {
      backgroundColor: getColor(currentTheme, 'surface'),
      borderRadius: getRadius('md'),
      padding: getSpacing('md'),
      ...props?.raised && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4
      }
    }
  },
  ...children
);

export const listItem = (move, onPress) => pressable(
  {
    onPress: () => onPress?.(move),
    style: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('md'),
      borderBottomWidth: 1,
      borderBottomColor: getColor(currentTheme, 'separator')
    }
  },
  view(
    { style: { flex: 1 } },
    text({ style: { fontSize: 16, color: getColor(currentTheme, 'text') } }, move.name),
    text(
      { style: { fontSize: 12, color: getColor(currentTheme, 'secondary'), marginTop: 4 } },
      move.category || 'Uncategorized'
    )
  ),
  // State badge
  view(
    { 
      style: {
        backgroundColor: getStateColor(move.learningState),
        paddingHorizontal: getSpacing('sm'),
        paddingVertical: getSpacing('xs'),
        borderRadius: getRadius('xs')
      }
    },
    text(
      { style: { fontSize: 12, color: '#FFF', fontWeight: '500' } },
      move.learningState
    )
  )
);

const getStateColor = (state) => ({
  'NEW': tokens.colors.state.new,
  'LEARNING': tokens.colors.state.learning,
  'REVIEW': '#8B5CF6',
  'MASTERY': tokens.colors.state.mastery
}[state] || tokens.colors.state.new);

export const button = (label, onPress, variant = 'primary') => touchable(
  {
    onPress,
    style: {
      backgroundColor: variant === 'primary' 
        ? getColor(currentTheme, 'accent')
        : 'transparent',
      paddingVertical: getSpacing('sm'),
      paddingHorizontal: getSpacing('md'),
      borderRadius: getRadius('sm'),
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  text({
    style: {
      color: variant === 'primary' ? '#FFF' : getColor(currentTheme, 'accent'),
      fontWeight: '600',
      fontSize: 14
    }
  }, label)
);

export const input = (placeholder, value, onChangeText) => textInput({
  placeholder,
  value,
  onChangeText,
  style: {
    flex: 1,
    fontSize: 16,
    color: getColor(currentTheme, 'text'),
    padding: getSpacing('sm'),
    backgroundColor: getColor(currentTheme, 'fill'),
    borderRadius: getRadius('sm')
  },
  placeholderTextColor: getColor(currentTheme, 'secondary')
});

export const tabBar = (tabs, activeTab, onTabPress) => view(
  {
    style: {
      flexDirection: 'row',
      backgroundColor: getColor(currentTheme, 'surface'),
      borderTopWidth: 1,
      borderTopColor: getColor(currentTheme, 'separator'),
      paddingBottom: getSpacing('sm')
    }
  },
  ...tabs.map(tab => 
    touchable(
      {
        onPress: () => onTabPress(tab.key),
        style: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: getSpacing('sm'),
          borderBottomWidth: tab.key === activeTab ? 2 : 0,
          borderBottomColor: getColor(currentTheme, 'accent')
        }
      },
      text({
        style: {
          fontSize: 12,
          color: tab.key === activeTab 
            ? getColor(currentTheme, 'accent')
            : getColor(currentTheme, 'secondary'),
          fontWeight: tab.key === activeTab ? '600' : '400'
        }
      }, tab.title)
    )
  )
);

export const statCard = (label, value, color) => card(
  {},
  text({
    style: { fontSize: 12, color: getColor(currentTheme, 'secondary'), marginBottom: 4 }
  }, label),
  text({
    style: { fontSize: 24, fontWeight: '700', color: color || getColor(currentTheme, 'text') }
  }, value)
);

// ═══════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════

export { tokens, getColor, getSpacing, getRadius, getTypeSize };
export default {
  view, text, textInput, scrollView, flatList, pressable, touchable, image,
  screen, header, card, listItem, button, input, tabBar, statCard,
  tokens, getColor, getSpacing, getRadius, getTypeSize
};