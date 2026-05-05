// Breakdex Screens - All App Screens
// =========================
// Using Hiccup-style components from lib/dsl

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useStore } from '../store';
import { 
  view, text, textInput, pressable, button, card, listItem, tabBar, statCard,
  setTheme, getColor, getSpacing, getRadius, getTypeSize
} from '../dsl';
import { tokens } from '../design/tokens';

// ═══════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════

export const MovesScreen = () => {
  const store = useStore();
  const [search, setSearch] = useState('');
  const movesFiltered = store.movesFiltered;
  
  setTheme(store.theme.mode);
  
  const renderItem = ({ item }) => listItem(
    item,
    (move) => {
      Alert.alert('Selected', move.name, [
        { text: 'Delete', onPress: () => store.deleteMove(move.id), style: 'destructive' },
        { text: 'Close', style: 'cancel' }
      ]);
    }
  );
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Arsenal'),
      text({
        style: { 
          fontSize: 14, 
          color: getColor('secondary'),
          marginTop: 4
        }
      }, `${store.movesCount} moves`)
    ),
    
    // Search
    view(
      { style: { paddingHorizontal: getSpacing('md'), marginBottom: getSpacing('md') } },
      textInput(
        'Search moves...',
        search,
        (v) => { setSearch(v); store.searchMoves(v); }
      )
    ),
    
    // List
    view(
      { style: { flex: 1 } },
      movesFiltered.length === 0
        ? view(
            { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
            text({
              style: { color: getColor('secondary'), fontSize: 16 }
            }, 'No moves yet'),
            text({
              style: { color: getColor('secondary'), fontSize: 14, marginTop: 8 }
            }, 'Tap + to add your first move')
          )
        : view(
            { style: { flex: 1 } },
            ...movesFiltered.map(move => listItem(move, (m) => {
              Alert.alert('Selected', m.name, [
                { text: 'Delete', onPress: () => store.deleteMove(m.id), style: 'destructive' },
                { text: 'Close', style: 'cancel' }
              ]);
            })
          )
    ),
    
    // FAB
    pressable(
      {
        onPress: () => Alert.prompt('Add Move', 'Enter move name:', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add', onPress: (_, name) => name && store.addMove(name) }
        ]),
        style: {
          position: 'absolute',
          right: getSpacing('md'),
          bottom: getSpacing('md'),
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: getColor('accent'),
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
          elevation: 8
        }
      },
      text({ style: { color: '#FFF', fontSize: 24, fontWeight: '300' } }, '+')
    )
  );
};

export const ReviewScreen = () => {
  const store = useStore();
  const { review } = store;
  
  setTheme(store.theme.mode);
  
  const currentCard = review.dueCards[0];
  const dueCount = store.dueCount;
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Drill'),
      text({
        style: { 
          fontSize: 14, 
          color: getColor('secondary'),
          marginTop: 4
        }
      }, `${dueCount} cards due`)
    ),
    
    // Session stats
    view(
      { style: { flexDirection: 'row', padding: getSpacing('md'), gap: 8 } },
      statCard('Again', review.session.again, tokens.colors.review.again),
      statCard('Hard', review.session.hard, tokens.colors.review.hard),
      statCard('Good', review.session.good, tokens.colors.review.good),
      statCard('Easy', review.session.easy, tokens.colors.review.easy)
    ),
    
    // Card or empty
    view(
      { style: { flex: 1, justifyContent: 'center', padding: getSpacing('md') } },
      dueCount === 0
        ? view(
            { style: { alignItems: 'center' } },
            text({
              style: { fontSize: 48, marginBottom: 16 }
            }, '🎉'),
            text({
              style: { fontSize: 18, color: getColor('text'), fontWeight: '600' }
            }, 'All caught up!'),
            text({
              style: { fontSize: 14, color: getColor('secondary'), marginTop: 8 }
            }, 'No cards due for review')
          )
        : view(
            { style: {} },
            card(
              { raised: true },
              text({
                style: { fontSize: 20, color: getColor('text'), fontWeight: '600' }
              }, currentCard?.name || 'Move'),
              text({
                style: { fontSize: 14, color: getColor('secondary'), marginTop: 8 }
              }, currentCard?.category || 'Uncategorized')
            ),
            
            // Rating buttons
            view(
              { 
                style: { 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  marginTop: getSpacing('lg'),
                  gap: 8
                }
              },
              button('Again', () => store.rateCard('again'), 'review'),
              button('Hard', () => store.rateCard('hard'), 'review'),
              button('Good', () => store.rateCard('good'), 'review'),
              button('Easy', () => store.rateCard('easy'), 'review')
            )
          )
    ),
    
    // Accuracy
    dueCount > 0 && view(
      { style: { padding: getSpacing('md'), alignItems: 'center' } },
      text({
        style: { fontSize: 14, color: getColor('secondary') }
      }, `Accuracy: ${store.reviewAccuracy}%`)
    )
  );
};

export const StatsScreen = () => {
  const store = useStore();
  const movesByState = store.movesByState;
  
  setTheme(store.theme.mode);
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Progress')
    ),
    
    // Stats grid
    view(
      { style: { flexDirection: 'row', flexWrap: 'wrap', padding: getSpacing('md'), gap: 12 } },
      statCard('Total', store.movesCount, getColor('text')),
      statCard('New', movesByState.new?.length || 0, tokens.colors.state.new),
      statCard('Learning', movesByState.learning?.length || 0, tokens.colors.state.learning),
      statCard('Mastery', movesByState.mastery?.length || 0, tokens.colors.state.mastery)
    ),
    
    // Categories
    view(
      { style: { padding: getSpacing('md') } },
      text({
        style: { 
          fontSize: 14, 
          fontWeight: '600',
          color: getColor('text'),
          marginBottom: 12
      }
      }, 'Categories'),
      ...store.categories.length === 0
        ? [text({ style: { color: getColor('secondary') } }, 'Add moves to see categories')]
        : store.categories.map(cat => 
            view(
              { 
                style: { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: getSpacing('sm'),
                  borderBottomWidth: 1,
                  borderBottomColor: getColor('separator')
                }
              },
              text({ style: { color: getColor('text') } }, cat),
              text(
                { style: { color: getColor('secondary') } },
                store.movesFiltered.filter(m => m.category === cat).length
              )
            )
          )
    )
  );
};

export const LabScreen = () => {
  setTheme('light');
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Lab')
    ),
    
    view(
      { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
      text({
        style: { fontSize: 48, marginBottom: 16 }
      }, '🔬'),
      text({
        style: { fontSize: 18, color: getColor('text'), fontWeight: '600' }
      }, 'Training Lab'),
      text({
        style: { fontSize: 14, color: getColor('secondary'), marginTop: 8, textAlign: 'center' }
      }, 'Practice sessions and milestones\nComing soon')
    )
  );
};

export const FlowScreen = () => {
  setTheme('light');
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Flow')
    ),
    
    view(
      { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
      text({
        style: { fontSize: 48, marginBottom: 16 }
      }, '🌀'),
      text({
        style: { fontSize: 18, color: getColor('text'), fontWeight: '600' }
      }, 'Move Graph'),
      text({
        style: { fontSize: 14, color: getColor('secondary'), marginTop: 8, textAlign: 'center' }
      }, 'Visualize move relationships\nComing soon')
    )
  );
};

export const SettingsScreen = () => {
  const store = useStore();
  const [fontFamily, setFontFamily] = useState(store.settings.fontFamily);
  
  setTheme(store.theme.mode);
  
  const SettingRow = (label, value, onPress) => pressable(
    {
      onPress,
      style: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: getSpacing('md'),
        borderBottomWidth: 1,
        borderBottomColor: getColor('separator')
      }
    },
    text({ style: { fontSize: 16, color: getColor('text') } }, label),
    text({ style: { fontSize: 16, color: getColor('secondary') } }, value)
  );
  
  return view(
    { style: { flex: 1, backgroundColor: getColor('background') } },
    // Header
    view(
      { style: { padding: getSpacing('md'), paddingTop: getSpacing('lg') } },
      text({
        style: { 
          fontSize: getTypeSize('title-medium'),
          fontWeight: '600',
          color: getColor('text')
        }
      }, 'Settings')
    ),
    
    // Sections
    view(
      { style: { flex: 1 } },
      
      // Appearance
      text({
        style: { 
          fontSize: 12, 
          fontWeight: '600', 
          color: getColor('secondary'),
          padding: getSpacing('md'),
          paddingBottom: getSpacing('xs')
        }
      }, 'APPEARANCE'),
      card(
        {},
        SettingRow('Theme', store.theme.mode, () => 
          store.setTheme(store.theme.mode === 'light' ? 'dark' : 'light')
        ),
        SettingRow('Font', fontFamily, () => {})
      ),
      
      // Data
      text({
        style: { 
          fontSize: 12, 
          fontWeight: '600', 
          color: getColor('secondary'),
          padding: getSpacing('md'),
          paddingBottom: getSpacing('xs')
        }
      }, 'DATA'),
      card(
        {},
        SettingRow('Export Data', '→', () => {}),
        SettingRow('Import Data', '→', () => {})
      ),
      
      // About
      text({
        style: { 
          fontSize: 12, 
          fontWeight: '600', 
          color: getColor('secondary'),
          padding: getSpacing('md'),
          paddingBottom: getSpacing('xs')
        }
      }, 'ABOUT'),
      card(
        {},
        SettingRow('Version', '1.0.0', () => {}),
        SettingRow('Build', 'EDN+Hiccup', () => {})
      )
    )
  );
};

// ═══════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════

const TABS = [
  { key: 'moves', title: 'Moves' },
  { key: 'review', title: 'Drill' },
  { key: 'stats', title: 'Progress' },
  { key: 'lab', title: 'Lab' },
  { key: 'flow', title: 'Flow' }
];

export const MainScreen = () => {
  const [activeTab, setActiveTab] = useState('moves');
  
  const ScreenComponent = {
    moves: MovesScreen,
    review: ReviewScreen,
    stats: StatsScreen,
    lab: LabScreen,
    flow: FlowScreen
  }[activeTab];
  
  return view(
    { style: { flex: 1 } },
    // Content
    ScreenComponent ? <ScreenComponent /> : <MovesScreen />,
    
    // Tab bar
    tabBar(TABS, activeTab, setActiveTab)
  );
};

export default {
  MovesScreen,
  ReviewScreen,
  StatsScreen,
  LabScreen,
  FlowScreen,
  SettingsScreen,
  MainScreen
};