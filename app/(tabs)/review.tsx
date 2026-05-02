import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useStore } from '../../lib/store';
import { tokens } from '../../lib/design/tokens';

const RATING_BUTTONS = [
  { label: 'Again', rating: 'again', color: tokens.colors.review.again },
  { label: 'Hard', rating: 'hard', color: tokens.colors.review.hard },
  { label: 'Good', rating: 'good', color: tokens.colors.review.good },
  { label: 'Easy', rating: 'easy', color: tokens.colors.review.easy },
];

export default function ReviewScreen() {
  const store = useStore();
  const { review } = store;
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;
  const currentCard = review.dueCards[0];
  const dueCount = store.dueCount;

  return (
    <YStack flex={1} backgroundColor={c.background}>
      <YStack padding={16} paddingTop={24}>
        <Text fontSize={24} fontWeight="600" color={c.text}>Drill</Text>
        <Text fontSize={14} color={c.secondary} marginTop={4}>{dueCount} cards due</Text>
      </YStack>

      <XStack paddingHorizontal={16} gap={8}>
        {(['again', 'hard', 'good', 'easy'] as const).map((rating) => (
          <YStack key={rating} flex={1} padding={8} alignItems="center">
            <Text fontSize={12} color={c.secondary} marginBottom={4}>
              {rating.charAt(0).toUpperCase() + rating.slice(1)}
            </Text>
            <Text fontSize={20} fontWeight="700" color={tokens.colors.review[rating]}>
              {review.session[rating]}
            </Text>
          </YStack>
        ))}
      </XStack>

      <YStack flex={1} justifyContent="center" padding={16}>
        {dueCount === 0 ? (
          <YStack alignItems="center">
            <Text fontSize={48} marginBottom={16}>🎉</Text>
            <Text fontSize={18} fontWeight="600" color={c.text}>All caught up!</Text>
            <Text fontSize={14} color={c.secondary} marginTop={8}>No cards due for review</Text>
          </YStack>
        ) : (
          <YStack>
            <YStack
              backgroundColor={c.surface}
              borderRadius={16}
              padding={24}
              style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' } as any}
            >
              <Text fontSize={20} fontWeight="600" color={c.text}>
                {currentCard?.name || 'Move'}
              </Text>
              <Text fontSize={14} color={c.secondary} marginTop={8}>
                {currentCard?.category || 'Uncategorized'}
              </Text>
              {currentCard?.notes && (
                <Text fontSize={14} color={c.secondary} marginTop={12} fontStyle="italic">
                  {currentCard.notes}
                </Text>
              )}
            </YStack>

            <XStack justifyContent="space-between" marginTop={24} gap={8}>
              {RATING_BUTTONS.map(({ label, rating, color }) => (
                <YStack
                  key={rating}
                  flex={1}
                  backgroundColor={color}
                  paddingVertical={12}
                  borderRadius={10}
                  alignItems="center"
                  onPress={() => store.rateCard(rating)}
                  pressStyle={{ opacity: 0.8 }}
                  cursor="pointer"
                >
                  <Text color="#FFF" fontWeight="600" fontSize={14}>{label}</Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}
      </YStack>

      {dueCount > 0 && (
        <YStack padding={16} alignItems="center">
          <Text fontSize={14} color={c.secondary}>
            Session Accuracy: {store.reviewAccuracy}%
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
