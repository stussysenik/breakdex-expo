// Create Move Screen - Using EDN + Hiccup pattern
'use client';

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize, tokens } from '../../lib/dsl';

export default function CreateMoveScreen() {
  const router = useRouter();
  const store = useStore();
  const theme = store.theme.mode;
  
  setTheme(theme);
  
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    
    store.addMove(name.trim(), selectedCategory || null);
    router.back();
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'New Move', headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: getColor(theme, 'surface'),
              color: getColor(theme, 'text'),
              borderColor: getColor(theme, 'separator')
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter move name"
            placeholderTextColor={getColor(theme, 'secondary')}
          />
        </View>
        
        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {store.categories.length === 0 ? (
              <Text style={[styles.emptyText, { color: getColor(theme, 'secondary') }]}>
                No categories yet. Add moves to create categories.
              </Text>
            ) : (
              store.categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: getColor(theme, 'surface'),
                      borderColor: getColor(theme, 'separator')
                    },
                    selectedCategory === cat && { 
                      backgroundColor: getColor(theme, 'accent'),
                      borderColor: getColor(theme, 'accent')
                    },
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: getColor(theme, 'text') },
                      selectedCategory === cat && { color: '#FFF' },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
        
        {/* Add new category */}
        {selectedCategory === '' && store.categories.length > 0 && (
          <TouchableOpacity
            style={[styles.addCategoryButton, {
              backgroundColor: getColor(theme, 'fill'),
              borderColor: getColor(theme, 'separator')
            }]}
            onPress={() => {
              Alert.prompt(
                'New Category',
                'Enter category name:',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Add',
                    onPress: (_, category) => {
                      if (category?.trim()) {
                        store.addCategory(category.trim());
                        setSelectedCategory(category.trim());
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={[styles.addCategoryText, { color: getColor(theme, 'accent') }]}>
              + Add New Category
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>Notes</Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              { 
                backgroundColor: getColor(theme, 'surface'),
                color: getColor(theme, 'text'),
                borderColor: getColor(theme, 'separator')
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={getColor(theme, 'secondary')}
            multiline
          />
        </View>
        
        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: getColor(theme, 'accent') }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Move</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getSpacing('md'),
  },
  field: {
    marginBottom: getSpacing('lg'),
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: getSpacing('sm'),
  },
  input: {
    padding: getSpacing('md'),
    borderRadius: getRadius('md'),
    fontSize: 16,
    borderWidth: 1,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing('sm'),
  },
  categoryChip: {
    paddingHorizontal: getSpacing('md'),
    paddingVertical: getSpacing('sm'),
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  addCategoryButton: {
    padding: getSpacing('md'),
    borderRadius: getRadius('sm'),
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: getSpacing('lg'),
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    padding: getSpacing('md'),
    borderRadius: getRadius('md'),
    alignItems: 'center',
    marginTop: getSpacing('lg'),
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});