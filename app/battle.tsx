// Battle Screen — XState battle machine, timed quiz mode, Tamagui UI
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { useMachines, useColors } from '../lib/context/MachineContext';
import { Difficulty, DIFFICULTY_CONFIG } from '../lib/machines/battleMachine';
import { Ionicons } from '@expo/vector-icons';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

function TimerRing({ timeRemaining, total, c }: { timeRemaining: number; total: number; c: any }) {
  const animTime = useRef(new Animated.Value(timeRemaining)).current;
  useEffect(() => {
    Animated.timing(animTime, { toValue: timeRemaining, duration: 800, useNativeDriver: false }).start();
  }, [timeRemaining]);

  const pct = total === 0 ? 0 : timeRemaining / total;
  const color = pct > 0.5 ? c.success : pct > 0.25 ? c.warning : c.error;

  return (
    <YStack alignItems="center" justifyContent="center" width={120} height={120} borderRadius={60}
      borderWidth={6} borderColor={color} backgroundColor={color + '15'}>
      <Text fontSize={32} fontWeight="800" color={color}>{timeRemaining}</Text>
      <Text fontSize={11} color={c.secondary}>seconds</Text>
    </YStack>
  );
}

function DifficultyCard({ difficulty, isSelected, onPress, c }: {
  difficulty: Difficulty; isSelected: boolean; onPress: () => void; c: any;
}) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const colors: Record<Difficulty, string> = { easy: c.success, medium: c.warning, hard: c.error };
  const color = colors[difficulty];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flex: 1 }}>
      <YStack
        backgroundColor={isSelected ? color : color + '15'}
        borderRadius={16}
        padding={16}
        alignItems="center"
        borderWidth={2}
        borderColor={isSelected ? color : 'transparent'}
        gap={4}
      >
        <Text fontSize={14} fontWeight="700" color={isSelected ? '#FFF' : color}>
          {cfg.label}
        </Text>
        <Text fontSize={12} color={isSelected ? 'rgba(255,255,255,0.8)' : c.secondary}>
          {cfg.duration}s
        </Text>
        <Text fontSize={11} color={isSelected ? 'rgba(255,255,255,0.7)' : c.secondary}>
          ×{cfg.pointsPerCorrect} pts
        </Text>
      </YStack>
    </TouchableOpacity>
  );
}

export default function BattleScreen() {
  const router = useRouter();
  const { battleSnap, battleActor } = useMachines();
  const c = useColors();
  const ctx = battleSnap.context;
  const state = battleSnap.value;

  // Timer tick
  useEffect(() => {
    if (state !== 'active') return;
    const timer = setInterval(() => {
      battleActor({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  const cfg = DIFFICULTY_CONFIG[ctx.difficulty];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        {/* Header */}
        <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <TouchableOpacity onPress={() => { battleActor({ type: 'RESET' }); router.back(); }} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={c.secondary} />
            </TouchableOpacity>
            <Text fontSize={20} fontWeight="700" color={c.text}>
              {state === 'active' ? `Score: ${ctx.score}` : 'Battle Mode'}
            </Text>
            <YStack width={24} />
          </XStack>
        </YStack>

        {/* Intro */}
        {state === 'intro' && (
          <YStack flex={1} padding={20} gap={24} justifyContent="center">
            <YStack alignItems="center" gap={8}>
              <Text fontSize={48}>⚔️</Text>
              <Text fontSize={28} fontWeight="800" color={c.text} textAlign="center">Battle Mode</Text>
              <Text fontSize={15} color={c.secondary} textAlign="center" lineHeight={22}>
                A move flashes on screen. Say if you know it or skip. Score as many as you can before time runs out!
              </Text>
            </YStack>

            <YStack gap={10}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8} textAlign="center">
                SELECT DIFFICULTY
              </Text>
              <XStack gap={10}>
                {DIFFICULTIES.map((d) => (
                  <DifficultyCard
                    key={d}
                    difficulty={d}
                    isSelected={ctx.difficulty === d}
                    onPress={() => battleActor({ type: 'SELECT_DIFFICULTY', difficulty: d })}
                    c={c}
                  />
                ))}
              </XStack>
            </YStack>

            {ctx.moves.length === 0 ? (
              <YStack backgroundColor={c.fill} borderRadius={14} padding={16} alignItems="center">
                <Text fontSize={14} color={c.secondary} textAlign="center">
                  Add moves to your Arsenal first to play Battle mode
                </Text>
              </YStack>
            ) : (
              <TouchableOpacity onPress={() => battleActor({ type: 'START' })} activeOpacity={0.85}>
                <YStack
                  backgroundColor={c.accent}
                  borderRadius={18}
                  paddingVertical={20}
                  alignItems="center"
                  shadowColor={c.accent}
                  shadowOffset={{ width: 0, height: 6 } as any}
                  shadowOpacity={0.35 as any}
                  shadowRadius={12 as any}
                  elevation={6}
                >
                  <Text color="#FFF" fontSize={20} fontWeight="800">Start Battle!</Text>
                </YStack>
              </TouchableOpacity>
            )}
          </YStack>
        )}

        {/* Active */}
        {state === 'active' && ctx.currentMove && (
          <YStack flex={1} padding={20} gap={20} justifyContent="center" alignItems="center">
            {/* Timer + streak */}
            <XStack alignItems="center" gap={20}>
              <TimerRing timeRemaining={ctx.timeRemaining} total={cfg.duration} c={c} />
              {ctx.streak >= 2 && (
                <YStack alignItems="center">
                  <Text fontSize={32} fontWeight="800" color={c.warning}>{ctx.streak}×</Text>
                  <Text fontSize={13} color={c.secondary}>streak!</Text>
                </YStack>
              )}
            </XStack>

            {/* Move card */}
            <YStack
              backgroundColor={c.surface}
              borderRadius={24}
              padding={32}
              width="100%"
              alignItems="center"
              borderWidth={2}
              borderColor={c.separator}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 8 } as any}
              shadowOpacity={0.1 as any}
              shadowRadius={20 as any}
              elevation={6}
            >
              <Text fontSize={11} color={c.secondary} fontWeight="600" letterSpacing={1} marginBottom={12}>
                DO YOU KNOW THIS?
              </Text>
              <Text fontSize={28} fontWeight="800" color={c.text} textAlign="center">
                {ctx.currentMove.name}
              </Text>
              {ctx.currentMove.category && (
                <Text fontSize={14} color={c.secondary} marginTop={8}>{ctx.currentMove.category}</Text>
              )}
            </YStack>

            {/* Action buttons */}
            <XStack gap={16} width="100%">
              <TouchableOpacity
                onPress={() => battleActor({ type: 'MARK_SKIP' })}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <YStack
                  backgroundColor={c.error + '22'}
                  borderRadius={18}
                  paddingVertical={18}
                  alignItems="center"
                  borderWidth={2}
                  borderColor={c.error}
                >
                  <Ionicons name="close" size={28} color={c.error} />
                  <Text fontSize={13} fontWeight="700" color={c.error} marginTop={4}>Skip</Text>
                </YStack>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => battleActor({ type: 'MARK_KNOW' })}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <YStack
                  backgroundColor={c.success + '22'}
                  borderRadius={18}
                  paddingVertical={18}
                  alignItems="center"
                  borderWidth={2}
                  borderColor={c.success}
                >
                  <Ionicons name="checkmark" size={28} color={c.success} />
                  <Text fontSize={13} fontWeight="700" color={c.success} marginTop={4}>I Know It!</Text>
                </YStack>
              </TouchableOpacity>
            </XStack>

            <Text fontSize={13} color={c.secondary}>Score: {ctx.score} · Streak: {ctx.streak}</Text>
          </YStack>
        )}

        {/* Results */}
        {state === 'results' && (
          <YStack flex={1} padding={20} gap={20} justifyContent="center" alignItems="center">
            <Text fontSize={56}>{ctx.score > 10 ? '🔥' : '⚔️'}</Text>
            <Text fontSize={28} fontWeight="800" color={c.text} textAlign="center">
              Time&apos;s Up!
            </Text>
            <YStack backgroundColor={c.surface} borderRadius={20} padding={24} width="100%" gap={16}>
              <XStack justifyContent="space-between">
                <Text fontSize={16} color={c.secondary}>Final Score</Text>
                <Text fontSize={20} fontWeight="800" color={c.accent}>{ctx.score}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>Correct</Text>
                <Text fontSize={15} fontWeight="700" color={c.success}>{ctx.correctAttempts}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>Skipped</Text>
                <Text fontSize={15} fontWeight="700" color={c.error}>{ctx.totalAttempts - ctx.correctAttempts}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>Best Streak</Text>
                <Text fontSize={15} fontWeight="700" color={c.warning}>{ctx.maxStreak}×</Text>
              </XStack>
            </YStack>

            <XStack gap={12} width="100%">
              <TouchableOpacity onPress={() => { battleActor({ type: 'RESET' }); router.back(); }} activeOpacity={0.7} style={{ flex: 1 }}>
                <YStack backgroundColor={c.fill} borderRadius={16} paddingVertical={16} alignItems="center">
                  <Text fontSize={15} fontWeight="700" color={c.secondary}>Done</Text>
                </YStack>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => battleActor({ type: 'START' })} activeOpacity={0.85} style={{ flex: 1 }}>
                <YStack backgroundColor={c.accent} borderRadius={16} paddingVertical={16} alignItems="center">
                  <Text fontSize={15} fontWeight="800" color="#FFF">Play Again</Text>
                </YStack>
              </TouchableOpacity>
            </XStack>
          </YStack>
        )}
      </YStack>
    </>
  );
}
