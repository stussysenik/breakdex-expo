// Stats Screen - Using EDN + Hiccup pattern
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize, tokens } from '../../lib/dsl';

export default function StatsScreen() {
  const store = useStore();
  const movesByState = store.movesByState;
  
  setTheme(store.theme.mode);
  const theme = store.theme.mode;
  
  const statCards = [
    { label: 'Total', value: store.movesCount, color: getColor(theme, 'text') },
    { label: 'New', value: movesByState.new?.length || 0, color: tokens.colors.state.new },
    { label: 'Learning', value: movesByState.learning?.length || 0, color: tokens.colors.state.learning },
    { label: 'Mastery', value: movesByState.mastery?.length || 0, color: tokens.colors.state.mastery },
  ];
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: getSpacing('lg') }]}>
        <Text style={[styles.title, { color: getColor(theme, 'text') }]}>
          Progress
        </Text>
      </View>
      
      {/* Stats grid */}
      <View style={[styles.statsGrid, { padding: getSpacing('md') }]}>
        {statCards.map(({ label, value, color }) => (
          <View key={label} style={[styles.statCard, { 
            backgroundColor: getColor(theme, 'surface'),
            borderRadius: getRadius('md')
          }]}>
            <Text style={[styles.statLabel, { color: getColor(theme, 'secondary') }]}>
              {label}
            </Text>
            <Text style={[styles.statValue, { color }]}>
              {value}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Categories */}
      <View style={[styles.section, { padding: getSpacing('md') }]}>
        <Text style={[styles.sectionTitle, { color: getColor(theme, 'text') }]}>
          Categories
        </Text>
        {store.categories.length === 0 ? (
          <Text style={[styles.emptyText, { color: getColor(theme, 'secondary') }]}>
            Add moves to see categories
          </Text>
        ) : (
          store.categories.map(category => {
            const count = store.movesFiltered.filter(m => m.category === category).length;
            return (
              <View key={category} style={[styles.categoryRow, { 
                borderBottomColor: getColor(theme, 'separator')
              }]}>
                <Text style={[styles.categoryName, { color: getColor(theme, 'text') }]}>
                  {category}
                </Text>
                <Text style={[styles.categoryCount, { color: getColor(theme, 'secondary') }]}>
                  {count}
                </Text>
              </View>
            );
          })
        )}
      </View>
      
      {/* Learning states breakdown */}
      <View style={[styles.section, { padding: getSpacing('md') }]}>
        <Text style={[styles.sectionTitle, { color: getColor(theme, 'text') }]}>
          Learning States
        </Text>
        {['NEW', 'LEARNING', 'REVIEW', 'MASTERY'].map(state => {
          const count = movesByState[state.toLowerCase()]?.length || 0;
          const total = store.movesCount || 1;
          const percent = Math.round((count / total) * 100);
          return (
            <View key={state} style={[styles.stateRow, { 
              borderBottomColor: getColor(theme, 'separator')
            }]}>
              <View style={styles.stateInfo}>
                <View style={[styles.stateDot, { backgroundColor: getStateColor(state) }]} />
                <Text style={[styles.stateName, { color: getColor(theme, 'text') }]}>
                  {state}
                </Text>
              </View>
              <Text style={[styles.statePercent, { color: getColor(theme, 'secondary') }]}>
                {count} ({percent}%)
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const getStateColor = (state) => ({
  'NEW': tokens.colors.state.new,
  'LEARNING': tokens.colors.state.learning,
  'REVIEW': '#8B5CF6',
  'MASTERY': tokens.colors.state.mastery
}[state] || tokens.colors.state.new);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: getSpacing('md') },
  title: { fontSize: getTypeSize('title-medium'), fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', padding: getSpacing('md'), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700' },
  section: { marginTop: getSpacing('md') },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  emptyText: { fontSize: 14 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: getSpacing('sm'), borderBottomWidth: 1 },
  categoryName: { fontSize: 16 },
  categoryCount: { fontSize: 16 },
  stateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: getSpacing('sm'), borderBottomWidth: 1 },
  stateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateDot: { width: 12, height: 12, borderRadius: 6 },
  stateName: { fontSize: 16 },
  statePercent: { fontSize: 16 },
});