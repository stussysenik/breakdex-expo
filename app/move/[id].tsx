'use client';

import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useStore } from '../../lib/store';
import { tokens } from '../../lib/design/tokens';

const STATE_COLORS: Record<string, string> = {
  NEW: tokens.colors.state.new,
  LEARNING: tokens.colors.state.learning,
  REVIEW: '#8B5CF6',
  MASTERY: tokens.colors.state.mastery,
};

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;

  const move = store.moves.collection.find((m: any) => m.id === id);

  if (!move) {
    return (
      <YStack flex={1} backgroundColor={c.background} padding={16}>
        <Text fontSize={16} color={c.error}>Move not found</Text>
      </YStack>
    );
  }

  const handleUpdateState = (newState: string) => {
    store.updateMoveState(id, newState);
    Alert.alert('Updated', `State changed to ${newState}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Move', `Delete "${move.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => { store.deleteMove(id); router.back(); },
        style: 'destructive',
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: move.name, headerShown: true }} />
      <ScrollView style={{ flex: 1, backgroundColor: c.background }}>
        <YStack height={200} backgroundColor={c.surface} justifyContent="center" alignItems="center">
          {move.videoPath ? (
            <Text fontSize={14} color={c.secondary}>Video: {move.videoPath}</Text>
          ) : (
            <Text fontSize={14} color={c.secondary}>No video</Text>
          )}
        </YStack>

        <YStack padding={16}>
          <Text fontSize={24} fontWeight="600" color={c.text} marginBottom={8}>
            {move.name}
          </Text>

          {move.category && (
            <YStack
              alignSelf="flex-start"
              backgroundColor={c.accent}
              paddingHorizontal={8}
              paddingVertical={4}
              borderRadius={6}
              marginBottom={16}
            >
              <Text color="#FFF" fontSize={12} fontWeight="500">{move.category}</Text>
            </YStack>
          )}

          <XStack
            justifyContent="space-between"
            backgroundColor={c.surface}
            padding={16}
            borderRadius={10}
            marginBottom={8}
          >
            <Text fontSize={14} color={c.secondary}>State</Text>
            <Text fontSize={14} fontWeight="600" color={STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW}>
              {move.learningState}
            </Text>
          </XStack>

          <XStack
            justifyContent="space-between"
            backgroundColor={c.surface}
            padding={16}
            borderRadius={10}
            marginBottom={8}
          >
            <Text fontSize={14} color={c.secondary}>Created</Text>
            <Text fontSize={14} fontWeight="600" color={c.text}>
              {new Date(move.createdAt).toLocaleDateString()}
            </Text>
          </XStack>

          {move.notes && (
            <YStack backgroundColor={c.surface} padding={16} borderRadius={10} marginBottom={8}>
              <Text fontSize={14} color={c.secondary}>Notes</Text>
              <Text fontSize={14} color={c.text} marginTop={4}>{move.notes}</Text>
            </YStack>
          )}

          <YStack marginTop={16}>
            <Text fontSize={14} fontWeight="600" color={c.text} marginBottom={8}>Update State</Text>
            <XStack gap={8}>
              {['NEW', 'LEARNING', 'REVIEW', 'MASTERY'].map((state) => (
                <YStack
                  key={state}
                  flex={1}
                  backgroundColor={STATE_COLORS[state]}
                  paddingVertical={8}
                  borderRadius={10}
                  alignItems="center"
                  opacity={move.learningState === state ? 1 : 0.5}
                  onPress={() => handleUpdateState(state)}
                  pressStyle={{ opacity: 0.6 }}
                  cursor="pointer"
                >
                  <Text color="#FFF" fontSize={12} fontWeight="600">{state}</Text>
                </YStack>
              ))}
            </XStack>
          </YStack>

          <YStack
            backgroundColor={c.error}
            padding={16}
            borderRadius={16}
            alignItems="center"
            marginTop={24}
            onPress={handleDelete}
            pressStyle={{ opacity: 0.8 }}
            cursor="pointer"
          >
            <Text color="#FFF" fontSize={16} fontWeight="600">Delete Move</Text>
          </YStack>
        </YStack>
      </ScrollView>
    </>
  );
}
