import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useStore } from '../../lib/store';
import { tokens } from '../../lib/design/tokens';

const STATE_COLORS: Record<string, string> = {
  NEW: tokens.colors.state.new,
  LEARNING: tokens.colors.state.learning,
  REVIEW: '#8B5CF6',
  MASTERY: tokens.colors.state.mastery,
};

export default function StatsScreen() {
  const store = useStore();
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;
  const movesByState = store.movesByState;

  const statCards = [
    { label: 'Total', value: store.movesCount, color: c.text },
    { label: 'New', value: movesByState.new?.length || 0, color: tokens.colors.state.new },
    { label: 'Learning', value: movesByState.learning?.length || 0, color: tokens.colors.state.learning },
    { label: 'Mastery', value: movesByState.mastery?.length || 0, color: tokens.colors.state.mastery },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }}>
      <YStack padding={16} paddingTop={24}>
        <Text fontSize={24} fontWeight="600" color={c.text}>Progress</Text>
      </YStack>

      <XStack flexWrap="wrap" padding={16} gap={12}>
        {statCards.map(({ label, value, color }) => (
          <YStack
            key={label}
            width="47%"
            backgroundColor={c.surface}
            borderRadius={16}
            padding={16}
            style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' } as any}
          >
            <Text fontSize={12} color={c.secondary} marginBottom={4}>{label}</Text>
            <Text fontSize={24} fontWeight="700" color={color}>{value}</Text>
          </YStack>
        ))}
      </XStack>

      <YStack padding={16}>
        <Text fontSize={14} fontWeight="600" color={c.text} marginBottom={12}>Categories</Text>
        {store.categories.length === 0 ? (
          <Text fontSize={14} color={c.secondary}>Add moves to see categories</Text>
        ) : (
          store.categories.map((category) => {
            const count = store.movesFiltered.filter((m: any) => m.category === category).length;
            return (
              <XStack
                key={category}
                justifyContent="space-between"
                paddingVertical={8}
                borderBottomWidth={1}
                borderBottomColor={c.separator}
              >
                <Text fontSize={16} color={c.text}>{category}</Text>
                <Text fontSize={16} color={c.secondary}>{count}</Text>
              </XStack>
            );
          })
        )}
      </YStack>

      <YStack padding={16}>
        <Text fontSize={14} fontWeight="600" color={c.text} marginBottom={12}>Learning States</Text>
        {['NEW', 'LEARNING', 'REVIEW', 'MASTERY'].map((state) => {
          const count = movesByState[state.toLowerCase()]?.length || 0;
          const total = store.movesCount || 1;
          const percent = Math.round((count / total) * 100);
          return (
            <XStack
              key={state}
              justifyContent="space-between"
              alignItems="center"
              paddingVertical={8}
              borderBottomWidth={1}
              borderBottomColor={c.separator}
            >
              <XStack alignItems="center" gap={8}>
                <YStack
                  width={12}
                  height={12}
                  borderRadius={6}
                  backgroundColor={STATE_COLORS[state] ?? STATE_COLORS.NEW}
                />
                <Text fontSize={16} color={c.text}>{state}</Text>
              </XStack>
              <Text fontSize={16} color={c.secondary}>{count} ({percent}%)</Text>
            </XStack>
          );
        })}
      </YStack>
    </ScrollView>
  );
}
