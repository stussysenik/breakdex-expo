// Settings Screen — XState settings machine, Tamagui UI
import React from 'react';
import { ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { Ionicons } from '@expo/vector-icons';

const ACCENT_COLORS = ['#1F5EFF', '#E45D7A', '#1F8A70', '#F59E0B', '#8B5CF6', '#0D9F9A'];

function SectionHeader({ title, c }: { title: string; c: any }) {
  return (
    <Text fontSize={12} fontWeight="700" color={c.secondary} paddingHorizontal={20} paddingTop={24} paddingBottom={8} letterSpacing={1}>
      {title}
    </Text>
  );
}

function SettingRow({ label, value, onPress, isLast, c, right }: {
  label: string; value?: string; onPress?: () => void; isLast?: boolean; c: any; right?: React.ReactNode;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingHorizontal={16}
        paddingVertical={14}
        borderBottomWidth={isLast ? 0 : 1}
        borderBottomColor={c.separator}
      >
        <Text fontSize={16} color={c.text}>{label}</Text>
        {right ?? (
          <XStack alignItems="center" gap={6}>
            {value && <Text fontSize={15} color={c.secondary}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={14} color={c.secondary} />}
          </XStack>
        )}
      </XStack>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { settingsSnap, settingsActor } = useMachines();
  const c = useColors();
  const ctx = settingsSnap.context;

  const handleAddCategory = () => {
    Alert.prompt('New Category', 'Enter category name:', (name) => {
      if (name?.trim()) settingsActor({ type: 'ADD_CATEGORY', name: name.trim() });
    });
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will reset all settings to defaults. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: () => settingsActor({ type: 'RESET_ALL' }), style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={12}>
        <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Settings</Text>
      </YStack>

      {/* Appearance */}
      <SectionHeader title="APPEARANCE" c={c} />
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow
          label="Theme"
          c={c}
          right={
            <XStack alignItems="center" gap={10}>
              <Text fontSize={14} color={c.secondary}>{ctx.themeMode === 'light' ? '☀️ Light' : '🌙 Dark'}</Text>
              <Switch
                value={ctx.themeMode === 'dark'}
                onValueChange={() => settingsActor({ type: 'TOGGLE_THEME' })}
                trackColor={{ false: c.separator, true: c.accent }}
                thumbColor="#FFF"
              />
            </XStack>
          }
        />
        <SettingRow
          label="Accent Color"
          c={c}
          isLast
          right={
            <XStack gap={8} alignItems="center">
              {ACCENT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => settingsActor({ type: 'SET_ACCENT', color })}
                  activeOpacity={0.8}
                >
                  <YStack
                    width={24}
                    height={24}
                    borderRadius={12}
                    backgroundColor={color}
                    borderWidth={ctx.accentColor === color ? 3 : 0}
                    borderColor="#FFF"
                    shadowColor={color}
                    shadowOffset={{ width: 0, height: 2 } as any}
                    shadowOpacity={0.4 as any}
                    shadowRadius={4 as any}
                  />
                </TouchableOpacity>
              ))}
            </XStack>
          }
        />
      </YStack>

      {/* Review settings */}
      <SectionHeader title="DRILL SETTINGS" c={c} />
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="New Cards / Day" value={String(ctx.newCardsPerDay)} c={c}
          onPress={() => Alert.prompt('New Cards per Day', 'Enter number:', (v) => {
            const n = parseInt(v ?? '');
            if (!isNaN(n)) settingsActor({ type: 'SET_NEW_CARDS_PER_DAY', count: n });
          }, 'plain-text', String(ctx.newCardsPerDay), 'number-pad')}
        />
        <SettingRow label="Reviews / Day" value={String(ctx.reviewsPerDay)} c={c}
          onPress={() => Alert.prompt('Reviews per Day', 'Enter number:', (v) => {
            const n = parseInt(v ?? '');
            if (!isNaN(n)) settingsActor({ type: 'SET_REVIEWS_PER_DAY', count: n });
          }, 'plain-text', String(ctx.reviewsPerDay), 'number-pad')}
        />
        <SettingRow label="Show Timer" c={c} isLast
          right={
            <Switch
              value={ctx.showTimer}
              onValueChange={() => settingsActor({ type: 'TOGGLE_TIMER' })}
              trackColor={{ false: c.separator, true: c.accent }}
              thumbColor="#FFF"
            />
          }
        />
      </YStack>

      {/* Categories */}
      <SectionHeader title="CATEGORIES" c={c} />
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        {ctx.categories.map((cat, i) => (
          <SettingRow
            key={cat}
            label={cat}
            c={c}
            isLast={i === ctx.categories.length - 1}
            onPress={() => Alert.alert('Remove Category', `Remove "${cat}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', onPress: () => settingsActor({ type: 'REMOVE_CATEGORY', name: cat }), style: 'destructive' },
            ])}
            right={<Ionicons name="trash-outline" size={16} color={c.secondary} />}
          />
        ))}
      </YStack>
      <TouchableOpacity onPress={handleAddCategory} activeOpacity={0.7}>
        <YStack marginHorizontal={20} marginTop={8} borderRadius={12} borderWidth={1} borderColor={c.accent} padding={14} alignItems="center">
          <Text fontSize={14} fontWeight="600" color={c.accent}>+ Add Category</Text>
        </YStack>
      </TouchableOpacity>

      {/* About */}
      <SectionHeader title="ABOUT" c={c} />
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="Version" value="2.0.0" c={c} />
        <SettingRow label="Engine" value="XState v5" c={c} />
        <SettingRow label="Kernel" value="ReScript" c={c} />
        <SettingRow label="UI" value="Tamagui" c={c} isLast />
      </YStack>

      {/* Data */}
      <SectionHeader title="DATA" c={c} />
      <YStack marginHorizontal={20} marginBottom={48} backgroundColor={c.surface} borderRadius={16} overflow="hidden">
        <SettingRow label="Reset All Settings" c={c} onPress={handleClearData} isLast
          right={<Ionicons name="trash" size={16} color={c.error} />}
        />
      </YStack>
    </ScrollView>
  );
}
