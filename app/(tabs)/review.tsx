// Drill (Review) Screen — XState review machine, FSRS kernel, animated cards
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useMachines, useCurrentReviewCard, useSessionAccuracy, useColors } from '../../lib/context/MachineContext';
import { makeDefaultCard, computeDueSummary, estimateNextDueLabel } from '../../lib/kernel/fsrs';
import { RATING_COLORS, RATING_LABELS } from '../../lib/kernel/learningState';
import { Rating } from '../../lib/machines/reviewMachine';
import { Ionicons } from '@expo/vector-icons';

const RATINGS: Rating[] = ['again', 'hard', 'good', 'easy'];

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: progress / 100, tension: 60, friction: 10, useNativeDriver: false }).start();
  }, [progress]);
  return (
    <YStack height={3} backgroundColor="rgba(0,0,0,0.08)" borderRadius={2} overflow="hidden">
      <Animated.View style={{ height: '100%', borderRadius: 2, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </YStack>
  );
}

function ReviewCard({ moveName, category, notes, visible, c }: {
  moveName: string; category: string | null; notes: string | null; visible: boolean; c: any;
}) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.92);
      fade.setValue(0);
    }
  }, [visible, moveName]);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
      <YStack
        backgroundColor={c.surface}
        borderRadius={20}
        padding={28}
        marginHorizontal={20}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 6 } as any}
        shadowOpacity={0.1 as any}
        shadowRadius={16 as any}
        elevation={4}
        minHeight={220}
        justifyContent="center"
      >
        <Text fontSize={24} fontWeight="700" color={c.text} marginBottom={8}>{moveName}</Text>
        {category && (
          <YStack alignSelf="flex-start" backgroundColor={c.accent + '22'} paddingHorizontal={10} paddingVertical={4} borderRadius={12} marginBottom={12}>
            <Text fontSize={12} fontWeight="600" color={c.accent}>{category}</Text>
          </YStack>
        )}
        {notes && <Text fontSize={14} color={c.secondary} lineHeight={20} fontStyle="italic">{notes}</Text>}
      </YStack>
    </Animated.View>
  );
}

function RatingButton({ rating, onPress, nextDue, c }: { rating: Rating; onPress: () => void; nextDue?: string; c: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, tension: 200, friction: 10, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <YStack
          backgroundColor={RATING_COLORS[rating]}
          paddingVertical={14}
          borderRadius={14}
          alignItems="center"
          gap={2}
        >
          <Text color="#FFF" fontWeight="700" fontSize={14}>{RATING_LABELS[rating]}</Text>
          {nextDue && <Text color="rgba(255,255,255,0.75)" fontSize={10}>{nextDue}</Text>}
        </YStack>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DrillScreen() {
  const { reviewSnap, reviewActor, moveSnap } = useMachines();
  const c = useColors();
  const currentCard = useCurrentReviewCard();
  const accuracy = useSessionAccuracy();
  const ctx = reviewSnap.context;
  const state = reviewSnap.value;
  const isIdle = state === 'idle';
  const isComplete = state === 'complete';
  const isReviewing = typeof state === 'object' || state === 'reviewing';
  const reviewState = typeof state === 'object' ? Object.keys(state as object)[0] : state;
  const isQuestion = reviewState === 'reviewing' && typeof reviewSnap.value === 'object'
    ? (reviewSnap.value as any).reviewing === 'question'
    : false;
  const isAssessment = typeof reviewSnap.value === 'object'
    ? (reviewSnap.value as any).reviewing === 'assessment'
    : false;

  const moves = moveSnap.context.moves;
  const cardMap: Record<string, any> = {};
  for (const m of moves) {
    cardMap[m.id] = { ...makeDefaultCard(), dueMs: Date.now() };
  }

  const dueNow = moves.filter((m) => !m.archivedAt).length;

  const handleStart = () => {
    reviewActor({ type: 'START_SESSION', moves, cardMap });
  };

  const handleRate = (rating: Rating) => {
    reviewActor({ type: 'RATE', rating });
    setTimeout(() => reviewActor({ type: 'EXIT_ANIMATION_DONE' }), 300);
  };

  const stats = ctx.sessionStats;

  return (
    <YStack flex={1} backgroundColor={c.background}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Drill</Text>
            <Text fontSize={13} color={c.secondary} marginTop={2}>
              {isReviewing ? `${ctx.queue.length - ctx.currentIndex} remaining` : `${dueNow} moves to review`}
            </Text>
          </YStack>
          {isReviewing && (
            <TouchableOpacity onPress={() => reviewActor({ type: 'RESET' })} activeOpacity={0.7}>
              <YStack backgroundColor={c.fill} borderRadius={20} paddingHorizontal={14} paddingVertical={8}>
                <Text fontSize={13} fontWeight="600" color={c.secondary}>End</Text>
              </YStack>
            </TouchableOpacity>
          )}
        </XStack>

        {/* Session stats bar */}
        {isReviewing && (
          <XStack marginTop={16} gap={8}>
            {(['again', 'hard', 'good', 'easy'] as Rating[]).map((r) => (
              <YStack key={r} flex={1} alignItems="center" gap={2}>
                <Text fontSize={16} fontWeight="700" color={RATING_COLORS[r]}>{stats[r]}</Text>
                <Text fontSize={10} color={c.secondary}>{RATING_LABELS[r]}</Text>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>

      {/* Progress bar */}
      {isReviewing && ctx.queue.length > 0 && (
        <YStack paddingHorizontal={20} marginBottom={16}>
          <ProgressBar progress={(ctx.currentIndex / ctx.queue.length) * 100} color={c.accent} />
        </YStack>
      )}

      {/* Main content */}
      <YStack flex={1} justifyContent="center">
        {isIdle && (
          <YStack alignItems="center" gap={20} paddingHorizontal={20}>
            <Ionicons name="repeat-outline" size={64} color={c.secondary} />
            <YStack alignItems="center" gap={8}>
              <Text fontSize={22} fontWeight="700" color={c.text}>Ready to drill?</Text>
              <Text fontSize={15} color={c.secondary} textAlign="center">
                {dueNow > 0 ? `${dueNow} moves in your queue` : 'Add moves to start reviewing'}
              </Text>
            </YStack>
            {dueNow > 0 && (
              <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
                <YStack
                  backgroundColor={c.accent}
                  paddingHorizontal={40}
                  paddingVertical={16}
                  borderRadius={16}
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 4 } as any}
                  shadowOpacity={0.2 as any}
                  shadowRadius={8 as any}
                  elevation={4}
                >
                  <Text color="#FFF" fontSize={17} fontWeight="700">Start Session</Text>
                </YStack>
              </TouchableOpacity>
            )}
          </YStack>
        )}

        {isComplete && (
          <YStack alignItems="center" gap={16} paddingHorizontal={20}>
            <Text fontSize={56}>🎉</Text>
            <Text fontSize={24} fontWeight="700" color={c.text}>Session Complete!</Text>
            <YStack backgroundColor={c.surface} borderRadius={16} padding={20} width="100%" gap={12}>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>Cards reviewed</Text>
                <Text fontSize={15} fontWeight="700" color={c.text}>{stats.total}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>Accuracy</Text>
                <Text fontSize={15} fontWeight="700" color={c.success}>{accuracy}%</Text>
              </XStack>
            </YStack>
            <TouchableOpacity onPress={() => reviewActor({ type: 'RESET' })} activeOpacity={0.7}>
              <YStack backgroundColor={c.accent} paddingHorizontal={40} paddingVertical={14} borderRadius={14}>
                <Text color="#FFF" fontSize={16} fontWeight="700">Done</Text>
              </YStack>
            </TouchableOpacity>
          </YStack>
        )}

        {currentCard && (isQuestion || isAssessment || (typeof reviewSnap.value === 'object' && (reviewSnap.value as any).reviewing)) && (
          <YStack gap={20}>
            <ReviewCard
              moveName={currentCard.moveName}
              category={currentCard.moveCategory}
              notes={currentCard.moveNotes}
              visible={true}
              c={c}
            />

            {!isAssessment ? (
              <YStack paddingHorizontal={20}>
                <TouchableOpacity onPress={() => reviewActor({ type: 'SHOW_ASSESSMENT' })} activeOpacity={0.85}>
                  <YStack
                    backgroundColor={c.surface}
                    borderRadius={14}
                    paddingVertical={16}
                    alignItems="center"
                    borderWidth={2}
                    borderColor={c.accent}
                  >
                    <Text fontSize={16} fontWeight="700" color={c.accent}>Show Rating</Text>
                  </YStack>
                </TouchableOpacity>
              </YStack>
            ) : (
              <XStack paddingHorizontal={20} gap={8}>
                {RATINGS.map((rating) => (
                  <RatingButton
                    key={rating}
                    rating={rating}
                    onPress={() => handleRate(rating)}
                    c={c}
                  />
                ))}
              </XStack>
            )}
          </YStack>
        )}
      </YStack>

      {/* Accuracy footer */}
      {isReviewing && stats.total > 0 && (
        <YStack paddingBottom={16} alignItems="center">
          <Text fontSize={13} color={c.secondary}>Accuracy: {accuracy}%</Text>
        </YStack>
      )}
    </YStack>
  );
}
