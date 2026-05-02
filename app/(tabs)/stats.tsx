// Progress (Stats) Screen — XState move machine data, Tamagui UI
import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useMachines, useMovesByState, useCategoryBreakdown, useColors } from '../../lib/context/MachineContext';
import { STATE_COLORS, masteryPercent } from '../../lib/kernel/learningState';
import { tokens } from '../../lib/design/tokens';

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <YStack
      width="47%"
      backgroundColor="#FFF"
      borderRadius={16}
      padding={18}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 } as any}
      shadowOpacity={0.06 as any}
      shadowRadius={8 as any}
      elevation={2}
      gap={4}
    >
      <Text fontSize={12} color={tokens.colors.light.secondary} fontWeight="600" letterSpacing={0.5}>{label.toUpperCase()}</Text>
      <Text fontSize={28} fontWeight="700" color={color}>{value}</Text>
      {sub && <Text fontSize={11} color={tokens.colors.light.secondary}>{sub}</Text>}
    </YStack>
  );
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <YStack gap={4}>
      <YStack height={6} backgroundColor="rgba(0,0,0,0.08)" borderRadius={3} overflow="hidden">
        <YStack height="100%" borderRadius={3} backgroundColor={color} width={`${pct}%` as any} />
      </YStack>
    </YStack>
  );
}

export default function ProgressScreen() {
  const { moveSnap } = useMachines();
  const c = useColors();
  const byState = useMovesByState();
  const catBreakdown = useCategoryBreakdown();
  const total = moveSnap.context.moves.filter((m) => !m.archivedAt).length;
  const archived = moveSnap.context.moves.filter((m) => !!m.archivedAt).length;
  const mastery = masteryPercent(total, byState.MASTERY.length);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={20}>
        <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Progress</Text>
        <Text fontSize={13} color={c.secondary} marginTop={2}>Your learning breakdown</Text>
      </YStack>

      {/* Mastery ring summary */}
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={20} padding={20} marginBottom={20} gap={8}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={14} color={c.secondary} fontWeight="600">Overall Mastery</Text>
            <Text fontSize={36} fontWeight="700" color={c.accent}>{mastery}%</Text>
          </YStack>
          <YStack alignItems="flex-end" gap={4}>
            <Text fontSize={13} color={c.secondary}>{total} active moves</Text>
            {archived > 0 && <Text fontSize={12} color={c.secondary}>{archived} archived</Text>}
          </YStack>
        </XStack>
        <ProgressBar value={byState.MASTERY.length} total={total} color={STATE_COLORS.MASTERY} />
      </YStack>

      {/* State grid */}
      <XStack flexWrap="wrap" paddingHorizontal={20} gap={12} marginBottom={24}>
        <StatCard label="Total" value={total} color={c.text} />
        <StatCard label="New" value={byState.NEW.length} color={STATE_COLORS.NEW}
          sub={`${total === 0 ? 0 : Math.round((byState.NEW.length / total) * 100)}%`} />
        <StatCard label="Learning" value={byState.LEARNING.length} color={STATE_COLORS.LEARNING}
          sub={`${total === 0 ? 0 : Math.round((byState.LEARNING.length / total) * 100)}%`} />
        <StatCard label="Mastery" value={byState.MASTERY.length} color={STATE_COLORS.MASTERY}
          sub={`${total === 0 ? 0 : Math.round((byState.MASTERY.length / total) * 100)}%`} />
      </XStack>

      {/* State breakdown with bars */}
      <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={20} padding={20} marginBottom={24} gap={16}>
        <Text fontSize={16} fontWeight="700" color={c.text}>State Breakdown</Text>
        {(['NEW', 'LEARNING', 'MASTERY'] as const).map((state) => {
          const count = byState[state].length;
          const pct = total === 0 ? 0 : Math.round((count / total) * 100);
          return (
            <YStack key={state} gap={6}>
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap={10}>
                  <YStack width={10} height={10} borderRadius={5} backgroundColor={STATE_COLORS[state]} />
                  <Text fontSize={14} fontWeight="600" color={c.text}>{state}</Text>
                </XStack>
                <Text fontSize={14} color={c.secondary}>{count} · {pct}%</Text>
              </XStack>
              <ProgressBar value={count} total={total} color={STATE_COLORS[state]} />
            </YStack>
          );
        })}
      </YStack>

      {/* Category breakdown */}
      {Object.keys(catBreakdown).length > 0 && (
        <YStack marginHorizontal={20} backgroundColor={c.surface} borderRadius={20} padding={20} marginBottom={40} gap={12}>
          <Text fontSize={16} fontWeight="700" color={c.text}>By Category</Text>
          {Object.entries(catBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => (
              <XStack key={cat} justifyContent="space-between" alignItems="center" paddingVertical={4}>
                <Text fontSize={15} color={c.text}>{cat}</Text>
                <XStack alignItems="center" gap={8}>
                  <ProgressBar value={count} total={total} color={c.accent} />
                  <Text fontSize={14} fontWeight="600" color={c.secondary} width={28} textAlign="right">{count}</Text>
                </XStack>
              </XStack>
            ))}
        </YStack>
      )}
    </ScrollView>
  );
}
