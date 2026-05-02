// Review Screen - Using EDN + Hiccup pattern
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize, tokens } from '../../lib/dsl';

export default function ReviewScreen() {
  const store = useStore();
  const { review } = store;
  
  setTheme(store.theme.mode);
  const theme = store.theme.mode;
  
  const currentCard = review.dueCards[0];
  const dueCount = store.dueCount;
  
  const ratingButtons = [
    { label: 'Again', rating: 'again', color: tokens.colors.review.again },
    { label: 'Hard', rating: 'hard', color: tokens.colors.review.hard },
    { label: 'Good', rating: 'good', color: tokens.colors.review.good },
    { label: 'Easy', rating: 'easy', color: tokens.colors.review.easy },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: getSpacing('lg') }]}>
        <Text style={[styles.title, { color: getColor(theme, 'text') }]}>
          Drill
        </Text>
        <Text style={[styles.subtitle, { color: getColor(theme, 'secondary') }]}>
          {dueCount} cards due
        </Text>
      </View>
      
      {/* Session stats */}
      <View style={[styles.statsRow, { paddingHorizontal: getSpacing('md') }]}>
        {['again', 'hard', 'good', 'easy'].map((rating) => (
          <View key={rating} style={styles.statCard}>
            <Text style={[styles.statLabel, { color: getColor(theme, 'secondary') }]}>
              {rating.charAt(0).toUpperCase() + rating.slice(1)}
            </Text>
            <Text style={[styles.statValue, { color: tokens.colors.review[rating] }]}>
              {review.session[rating]}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Card or empty */}
      <View style={styles.content}>
        {dueCount === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: getColor(theme, 'text') }]}>
              All caught up!
            </Text>
            <Text style={[styles.emptySubtext, { color: getColor(theme, 'secondary') }]}>
              No cards due for review
            </Text>
          </View>
        ) : (
          <View>
            <View style={[styles.card, { 
              backgroundColor: getColor(theme, 'surface'),
              borderRadius: getRadius('md')
            }]}>
              <Text style={[styles.cardTitle, { color: getColor(theme, 'text') }]}>
                {currentCard?.name || 'Move'}
              </Text>
              <Text style={[styles.cardCategory, { color: getColor(theme, 'secondary') }]}>
                {currentCard?.category || 'Uncategorized'}
              </Text>
              {currentCard?.notes && (
                <Text style={[styles.cardNotes, { color: getColor(theme, 'secondary') }]}>
                  {currentCard.notes}
                </Text>
              )}
            </View>
            
            {/* Rating buttons */}
            <View style={styles.ratingRow}>
              {ratingButtons.map(({ label, rating, color }) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingButton, { backgroundColor: color }]}
                  onPress={() => store.rateCard(rating)}
                >
                  <Text style={styles.ratingButtonText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* Accuracy */}
      {dueCount > 0 && (
        <View style={styles.accuracy}>
          <Text style={[styles.accuracyText, { color: getColor(theme, 'secondary') }]}>
            Session Accuracy: {store.reviewAccuracy}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: getSpacing('md') },
  title: { fontSize: getTypeSize('title-medium'), fontWeight: '600' },
  subtitle: { fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, padding: getSpacing('sm'), alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', padding: getSpacing('md') },
  empty: { alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, marginTop: 8 },
  card: { padding: getSpacing('lg'), elevation: 4, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  cardCategory: { fontSize: 14, marginTop: 8 },
  cardNotes: { fontSize: 14, marginTop: 12, fontStyle: 'italic' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: getSpacing('lg'), gap: 8 },
  ratingButton: { flex: 1, paddingVertical: getSpacing('sm'), borderRadius: getRadius('sm'), alignItems: 'center' },
  ratingButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  accuracy: { padding: getSpacing('md'), alignItems: 'center' },
  accuracyText: { fontSize: 14 },
});