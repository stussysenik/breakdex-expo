// Settings Screen - Using EDN + Hiccup pattern
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../../lib/store';
import { setTheme, getColor, getSpacing, getRadius, getTypeSize } from '../../lib/dsl';

export default function SettingsScreen() {
  const store = useStore();
  const theme = store.theme.mode;
  
  setTheme(theme);
  
  const SettingRow = (label, value, onPress, isLast = false) => (
    <TouchableOpacity
      style={[styles.settingRow, !isLast && { borderBottomWidth: 1, borderBottomColor: getColor(theme, 'separator') }]}
      onPress={onPress}
    >
      <Text style={[styles.settingLabel, { color: getColor(theme, 'text') }]}>
        {label}
      </Text>
      <Text style={[styles.settingValue, { color: getColor(theme, 'secondary') }]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
  
  const SectionHeader = (title) => (
    <Text style={[styles.sectionTitle, { color: getColor(theme, 'secondary') }]}>
      {title}
    </Text>
  );
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: getColor(theme, 'background') }]}>
      <View style={[styles.header, { paddingTop: getSpacing('lg') }]}>
        <Text style={[styles.title, { color: getColor(theme, 'text') }]}>
          Settings
        </Text>
      </View>
      
      {/* Appearance */}
      {SectionHeader('APPEARANCE')}
      <View style={[styles.section, { backgroundColor: getColor(theme, 'surface'), borderRadius: getRadius('md') }]}>
        {SettingRow('Theme', store.theme.mode, () => 
          store.setTheme(store.theme.mode === 'light' ? 'dark' : 'light')
        )}
        {SettingRow('Accent Color', store.theme.accent, () => {})}
        {SettingRow('Font', store.settings.fontFamily, () => {}, true)}
      </View>
      
      {/* Learning */}
      {SectionHeader('LEARNING')}
      <View style={[styles.section, { backgroundColor: getColor(theme, 'surface'), borderRadius: getRadius('md') }]}>
        {SettingRow('New State Color', '#E45D7A', () => {})}
        {SettingRow('Learning State Color', '#2F6BFF', () => {})}
        {SettingRow('Mastery State Color', '#1F8A70', () => {}, true)}
      </View>
      
      {/* Data */}
      {SectionHeader('DATA')}
      <View style={[styles.section, { backgroundColor: getColor(theme, 'surface'), borderRadius: getRadius('md') }]}>
        {SettingRow('Export Data', '→', () => {})}
        {SettingRow('Import Data', '→', () => {})}
        {SettingRow('Clear All Data', '→', () => {}, true)}
      </View>
      
      {/* About */}
      {SectionHeader('ABOUT')}
      <View style={[styles.section, { backgroundColor: getColor(theme, 'surface'), borderRadius: getRadius('md') }]}>
        {SettingRow('Version', '1.0.0', () => {})}
        {SettingRow('Build', 'EDN+Hiccup', () => {})}
        {SettingRow('Architecture', 'DOP+FRP', () => {}, true)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: getSpacing('md') },
  title: { fontSize: getTypeSize('title-medium'), fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: '600', padding: getSpacing('md'), paddingBottom: getSpacing('xs') },
  section: { marginHorizontal: getSpacing('md'), overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: getSpacing('md') },
  settingLabel: { fontSize: 16 },
  settingValue: { fontSize: 16 },
});