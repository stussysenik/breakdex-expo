// Breakdex - Main Tab Screen
// ========================
// Using EDN tokens + Hiccup DSL

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize, tokens } from '../../lib/dsl';

export default function MovesScreen() {
  const store = useStore();
  const [search, setSearch] = useState('');
  
  // Set theme from store
  setTheme(store.theme.mode);
  const theme = store.theme.mode;
  
  const movesFiltered = store.movesFiltered;
  
  const handleAddMove = () => {
    Alert.prompt(
      'Add Move',
      'Enter move name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: (name) => name?.trim() && store.addMove(name.trim()) 
        }
      ]
    );
  };
  
  const handleDeleteMove = (id, name) => {
    Alert.alert(
      'Delete Move',
      `Delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => store.deleteMove(id),
          style: 'destructive'
        }
      ]
    );
  };
  
  const renderItem = ({ item }) => (
    <Link href={`/move/${item.id}`} asChild>
      <TouchableOpacity style={styles.listItem}>
        <View style={styles.listItemContent}>
          <Text style={[styles.moveName, { color: getColor(theme, 'text') }]}>
            {item.name}
          </Text>
          <Text style={[styles.moveCategory, { color: getColor(theme, 'secondary') }]}>
            {item.category || 'Uncategorized'}
          </Text>
        </View>
        <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.learningState) }]}>
          <Text style={styles.stateBadgeText}>{item.learningState}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
  
  const getStateColor = (state) => ({
    'NEW': tokens.colors.state.new,
    'LEARNING': tokens.colors.state.learning,
    'REVIEW': '#8B5CF6',
    'MASTERY': tokens.colors.state.mastery
  }[state] || tokens.colors.state.new);
  
  return (
    <View style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: getSpacing('lg') }]}>
        <Text style={[styles.title, { color: getColor(theme, 'text') }]}>
          Arsenal
        </Text>
        <Text style={[styles.subtitle, { color: getColor(theme, 'secondary') }]}>
          {store.movesCount} moves
        </Text>
      </View>
      
      {/* Search */}
      <View style={[styles.searchContainer, { paddingHorizontal: getSpacing('md') }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: getColor(theme, 'fill'),
            color: getColor(theme, 'text')
          }]}
          placeholder="Search moves..."
          placeholderTextColor={getColor(theme, 'secondary')}
          value={search}
          onChangeText={(v) => { setSearch(v); store.searchMoves(v); }}
        />
      </View>
      
      {/* List */}
      <FlatList
        data={movesFiltered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: getColor(theme, 'secondary') }]}>
              No moves yet
            </Text>
            <Text style={[styles.emptySubtext, { color: getColor(theme, 'secondary') }]}>
              Tap + to add your first move
            </Text>
          </View>
        }
      />
      
      {/* FAB */}
      <Link href="/move/create" asChild>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: getColor(theme, 'accent') }]}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: getSpacing('md') },
  title: { fontSize: getTypeSize('title-medium'), fontWeight: '600' },
  subtitle: { fontSize: 14, marginTop: 4 },
  searchContainer: { marginBottom: getSpacing('md') },
  searchInput: {
    padding: getSpacing('sm'),
    borderRadius: getRadius('sm'),
    fontSize: 16,
  },
  list: { flexGrow: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing('md'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemContent: { flex: 1 },
  moveName: { fontSize: 16, fontWeight: '500' },
  moveCategory: { fontSize: 12, marginTop: 4 },
  stateBadge: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getRadius('xs'),
  },
  stateBadgeText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  fab: {
    position: 'absolute',
    right: getSpacing('md'),
    bottom: getSpacing('md'),
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
  },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: '300' },
});