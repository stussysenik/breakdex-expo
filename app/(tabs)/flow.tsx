// Flow Screen - Using EDN + Hiccup pattern
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { setTheme, getColor, getSpacing, getTypeSize } from '../../lib/dsl';

export default function FlowScreen() {
  setTheme('light');
  
  return (
    <View style={[styles.container, { backgroundColor: getColor('light', 'background') }]}>
      <View style={[styles.header, { paddingTop: getSpacing('lg') }]}>
        <Text style={[styles.title, { color: getColor('light', 'text') }]}>
          Flow
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.emoji}>🌀</Text>
        <Text style={[styles.heading, { color: getColor('light', 'text') }]}>
          Move Graph
        </Text>
        <Text style={[styles.subtext, { color: getColor('light', 'secondary') }]}>
          Visualize move relationships{'\n'}and learning flow{'\n'}{'\n'}Coming soon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: getSpacing('md') },
  title: { fontSize: getTypeSize('title-medium'), fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: getSpacing('lg') },
  emoji: { fontSize: 48, marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: '600' },
  subtext: { fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 22 },
});