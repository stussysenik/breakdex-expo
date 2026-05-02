// Combo Detail Screen — XState combo machine, Tamagui UI
import React, { useRef } from 'react';
import { ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { STATE_COLORS } from '../../lib/kernel/learningState';
import { Ionicons } from '@expo/vector-icons';

export default function ComboDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { comboSnap, comboActor, moveSnap } = useMachines();
  const c = useColors();

  const combo = comboSnap.context.combos.find((c) => c.id === id);

  if (!combo) {
    return (
      <YStack flex={1} backgroundColor={c.background} justifyContent="center" alignItems="center" gap={12}>
        <Text fontSize={16} color={c.secondary}>Combo not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text fontSize={15} color={c.accent}>← Go back</Text>
        </TouchableOpacity>
      </YStack>
    );
  }

  const moves = combo.moveIds
    .map((id) => moveSnap.context.moves.find((m) => m.id === id))
    .filter(Boolean);

  const handleDelete = () => {
    Alert.alert('Delete Combo', `Delete "${combo.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => { comboActor({ type: 'DELETE_COMBO', id }); router.back(); },
        style: 'destructive',
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        {/* Header */}
        <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16} borderBottomWidth={1} borderBottomColor={c.separator}>
          <XStack justifyContent="space-between" alignItems="center" marginBottom={12}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={20} color={c.accent} />
                <Text fontSize={16} color={c.accent}>Back</Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={c.error} />
            </TouchableOpacity>
          </XStack>
          <Text fontSize={26} fontWeight="700" color={c.text} letterSpacing={-0.5}>{combo.name}</Text>
          <Text fontSize={13} color={c.secondary} marginTop={4}>{moves.length} moves</Text>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack padding={20} gap={20}>
            {/* Flow visualization */}
            <YStack gap={10}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>SEQUENCE</Text>
              {moves.map((move, i) => {
                if (!move) return null;
                const isLast = i === moves.length - 1;
                return (
                  <YStack key={`${move.id}-${i}`}>
                    <XStack
                      backgroundColor={c.surface}
                      borderRadius={16}
                      padding={16}
                      alignItems="center"
                      gap={12}
                      borderLeftWidth={4}
                      borderLeftColor={STATE_COLORS[move.learningState]}
                    >
                      <YStack
                        width={28}
                        height={28}
                        borderRadius={14}
                        backgroundColor={c.accent}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize={13} fontWeight="700" color="#FFF">{i + 1}</Text>
                      </YStack>
                      <YStack flex={1}>
                        <Text fontSize={16} fontWeight="600" color={c.text}>{move.name}</Text>
                        {move.category && <Text fontSize={12} color={c.secondary}>{move.category}</Text>}
                      </YStack>
                      <YStack
                        backgroundColor={STATE_COLORS[move.learningState]}
                        paddingHorizontal={8}
                        paddingVertical={3}
                        borderRadius={8}
                      >
                        <Text fontSize={10} fontWeight="700" color="#FFF">{move.learningState}</Text>
                      </YStack>
                    </XStack>
                    {!isLast && (
                      <YStack alignItems="center" paddingVertical={4}>
                        <Ionicons name="arrow-down" size={18} color={c.secondary} />
                      </YStack>
                    )}
                  </YStack>
                );
              })}
            </YStack>

            {/* Notes */}
            {combo.notes && (
              <YStack gap={8}>
                <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>NOTES</Text>
                <YStack backgroundColor={c.surface} borderRadius={16} padding={16}>
                  <Text fontSize={15} color={c.text} lineHeight={22}>{combo.notes}</Text>
                </YStack>
              </YStack>
            )}

            {/* Created */}
            <YStack backgroundColor={c.surface} borderRadius={16} padding={16} gap={12}>
              <XStack justifyContent="space-between">
                <Text fontSize={14} color={c.secondary}>Created</Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>
                  {new Date(combo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={14} color={c.secondary}>Moves</Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>{combo.moveIds.length}</Text>
              </XStack>
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
