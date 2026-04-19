// Move Detail Screen - Using EDN + Hiccup pattern
'use client';

import { Text, View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize, tokens } from '../../lib/dsl';

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const theme = store.theme.mode;
  
  setTheme(theme);
  
  const move = store.moves.collection.find(m => m.id === id);
  
  if (!move) {
    return (
      <View style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
        <Text style={[styles.errorText, { color: getColor(theme, 'error') }]}>Move not found</Text>
      </View>
    );
  }
  
  const handleUpdateState = (newState) => {
    store.updateMoveState(id, newState);
    Alert.alert('Updated', `State changed to ${newState}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Move',
      `Delete "${move.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            store.deleteMove(id);
            router.back();
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const getStateColor = (state) => ({
    'NEW': tokens.colors.state.new,
    'LEARNING': tokens.colors.state.learning,
    'REVIEW': '#8B5CF6',
    'MASTERY': tokens.colors.state.mastery
  }[state] || tokens.colors.state.new);
  
  return (
    <>
      <Stack.Screen options={{ title: move.name, headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
        {/* Video placeholder */}
        <View style={[styles.mediaContainer, { backgroundColor: getColor(theme, 'surface') }]}>
          {move.videoPath ? (
            <Text style={[styles.mediaPlaceholder, { color: getColor(theme, 'secondary') }]}>
              Video: {move.videoPath}
            </Text>
          ) : (
            <Text style={[styles.emptyMedia, { color: getColor(theme, 'secondary') }]}>
              No video
            </Text>
          )}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.name, { color: getColor(theme, 'text') }]}>
            {move.name}
          </Text>
          
          {/* Category Badge */}
          {move.category && (
            <View style={[styles.categoryBadge, { backgroundColor: getColor(theme, 'accent') }]}>
              <Text style={styles.categoryText}>{move.category}</Text>
            </View>
          )}
          
          {/* State */}
          <View style={[styles.infoRow, { backgroundColor: getColor(theme, 'surface') }]}>
            <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>State</Text>
            <Text style={[styles.value, { color: getStateColor(move.learningState) }]}>
              {move.learningState}
            </Text>
          </View>
          
          {/* Created */}
          <View style={[styles.infoRow, { backgroundColor: getColor(theme, 'surface') }]}>
            <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>Created</Text>
            <Text style={[styles.value, { color: getColor(theme, 'text') }]}>
              {new Date(move.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          {/* Notes */}
          {move.notes && (
            <View style={[styles.notesSection, { backgroundColor: getColor(theme, 'surface') }]}>
              <Text style={[styles.label, { color: getColor(theme, 'secondary') }]}>Notes</Text>
              <Text style={[styles.notes, { color: getColor(theme, 'text') }]}>
                {move.notes}
              </Text>
            </View>
          )}
          
          {/* Update State */}
          <View style={styles.stateSection}>
            <Text style={[styles.sectionTitle, { color: getColor(theme, 'text') }]}>
              Update State
            </Text>
            <View style={styles.stateButtons}>
              {['NEW', 'LEARNING', 'REVIEW', 'MASTERY'].map((state) => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateButton,
                    { 
                      backgroundColor: getStateColor(state),
                      opacity: move.learningState === state ? 1 : 0.5
                    }
                  ]}
                  onPress={() => handleUpdateState(state)}
                >
                  <Text style={styles.stateButtonText}>{state}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Delete */}
          <TouchableOpacity
            style={[styles.deleteButton, { 
              backgroundColor: getColor(theme, 'error'),
              marginTop: getSpacing('lg')
            }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Move</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { fontSize: 16, padding: getSpacing('md') },
  mediaContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  mediaPlaceholder: { fontSize: 14 },
  emptyMedia: { fontSize: 14 },
  content: { padding: getSpacing('md') },
  name: { fontSize: getTypeSize('title-medium'), fontWeight: '600', marginBottom: getSpacing('sm') },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getRadius('xs'),
    marginBottom: getSpacing('md'),
  },
  categoryText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: getSpacing('md'), borderRadius: getRadius('sm'), marginBottom: getSpacing('sm') },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  notesSection: { padding: getSpacing('md'), borderRadius: getRadius('sm'), marginBottom: getSpacing('sm') },
  notes: { fontSize: 14, marginTop: getSpacing('xs') },
  stateSection: { marginTop: getSpacing('md') },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: getSpacing('sm') },
  stateButtons: { flexDirection: 'row', gap: getSpacing('sm') },
  stateButton: { flex: 1, paddingVertical: getSpacing('sm'), borderRadius: getRadius('sm'), alignItems: 'center' },
  stateButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  deleteButton: { padding: getSpacing('md'), borderRadius: getRadius('md'), alignItems: 'center' },
  deleteButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});