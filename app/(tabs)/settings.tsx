import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useStore } from '../../lib/store';
import { tokens } from '../../lib/design/tokens';

export default function SettingsScreen() {
  const store = useStore();
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;

  const SettingRow = ({
    label,
    value,
    onPress,
    isLast = false,
  }: {
    label: string;
    value: string;
    onPress: () => void;
    isLast?: boolean;
  }) => (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      padding={16}
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={c.separator}
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      cursor="pointer"
    >
      <Text fontSize={16} color={c.text}>{label}</Text>
      <Text fontSize={16} color={c.secondary}>{value}</Text>
    </XStack>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text
      fontSize={12}
      fontWeight="600"
      color={c.secondary}
      paddingHorizontal={16}
      paddingTop={16}
      paddingBottom={4}
    >
      {title}
    </Text>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }}>
      <YStack padding={16} paddingTop={24}>
        <Text fontSize={24} fontWeight="600" color={c.text}>Settings</Text>
      </YStack>

      <SectionHeader title="APPEARANCE" />
      <YStack marginHorizontal={16} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow
          label="Theme"
          value={store.theme.mode}
          onPress={() => store.setTheme(store.theme.mode === 'light' ? 'dark' : 'light')}
        />
        <SettingRow label="Accent Color" value={store.theme.accent} onPress={() => {}} />
        <SettingRow label="Font" value={store.settings.fontFamily} onPress={() => {}} isLast />
      </YStack>

      <SectionHeader title="LEARNING" />
      <YStack marginHorizontal={16} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="New State Color" value="#E45D7A" onPress={() => {}} />
        <SettingRow label="Learning State Color" value="#2F6BFF" onPress={() => {}} />
        <SettingRow label="Mastery State Color" value="#1F8A70" onPress={() => {}} isLast />
      </YStack>

      <SectionHeader title="DATA" />
      <YStack marginHorizontal={16} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="Export Data" value="→" onPress={() => {}} />
        <SettingRow label="Import Data" value="→" onPress={() => {}} />
        <SettingRow label="Clear All Data" value="→" onPress={() => {}} isLast />
      </YStack>

      <SectionHeader title="ABOUT" />
      <YStack marginHorizontal={16} marginBottom={32} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="Version" value="1.0.0" onPress={() => {}} />
        <SettingRow label="Build" value="Tamagui" onPress={() => {}} />
        <SettingRow label="Architecture" value="DOP+FRP" onPress={() => {}} isLast />
      </YStack>
    </ScrollView>
  );
}
