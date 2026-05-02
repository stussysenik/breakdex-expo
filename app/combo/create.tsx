// Create Combo Screen — XState combo machine, move picker, Tamagui UI
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { Move } from '../../lib/machines/moveMachine';
import { STATE_COLORS } from '../../lib/kernel/learningState';
import { Ionicons } from '@expo/vector-icons';

export default function CreateComboScreen() {
  const router = useRouter();
  const { comboActor, comboSnap, moveSnap } = useMachines();
  const c = useColors();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMoveIds, setSelectedMoveIds] = useState<string[]>([]);

  const moves = moveSnap.context.moves.filter((m) => !m.archivedAt);

  const toggleMove = (id: string) => {
    setSelectedMoveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selectedMoveIds.length < 2) return;
    comboActor({
      type: 'CREATE_COMBO',
      name: name.trim(),
      moveIds: selectedMoveIds,
      notes: notes.trim() || undefined,
    });
    router.back();
  };

  const canSave = name.trim().length > 0 && selectedMoveIds.length >= 2;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        {/* Header */}
        <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={20} color={c.accent} />
                <Text fontSize={16} color={c.accent}>Cancel</Text>
              </XStack>
            </TouchableOpacity>
            <Text fontSize={18} fontWeight="700" color={c.text}>New Combo</Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave} activeOpacity={0.8}>
              <Text fontSize={16} fontWeight="700" color={canSave ? c.accent : c.secondary}>Save</Text>
            </TouchableOpacity>
          </XStack>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <YStack padding={20} gap={20}>
            {/* Name */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>COMBO NAME *</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Six Step → Windmill → Freeze"
                placeholderTextColor={c.secondary}
                backgroundColor={c.surface}
                color={c.text}
                borderColor={name.trim() ? c.accent : c.separator}
                borderWidth={name.trim() ? 2 : 1}
                borderRadius={16}
                paddingHorizontal={16}
                paddingVertical={14}
                fontSize={16}
                unstyled
              />
            </YStack>

            {/* Sequence builder */}
            {selectedMoveIds.length > 0 && (
              <YStack gap={8}>
                <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>
                  SEQUENCE ({selectedMoveIds.length} moves)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap={8} alignItems="center">
                    {selectedMoveIds.map((id, i) => {
                      const move = moves.find((m) => m.id === id);
                      if (!move) return null;
                      return (
                        <XStack key={`${id}-${i}`} alignItems="center" gap={6}>
                          <YStack
                            backgroundColor={STATE_COLORS[move.learningState] + '22'}
                            borderRadius={10}
                            paddingHorizontal={12}
                            paddingVertical={8}
                            borderWidth={1}
                            borderColor={STATE_COLORS[move.learningState]}
                          >
                            <Text fontSize={13} fontWeight="600" color={c.text}>{move.name}</Text>
                          </YStack>
                          {i < selectedMoveIds.length - 1 && (
                            <Ionicons name="arrow-forward" size={14} color={c.secondary} />
                          )}
                        </XStack>
                      );
                    })}
                  </XStack>
                </ScrollView>
              </YStack>
            )}

            {/* Move picker */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>
                ADD MOVES {selectedMoveIds.length < 2 && <Text color={c.error}>(min 2)</Text>}
              </Text>
              {moves.map((move) => {
                const isSelected = selectedMoveIds.includes(move.id);
                const count = selectedMoveIds.filter((id) => id === move.id).length;
                return (
                  <TouchableOpacity key={move.id} onPress={() => toggleMove(move.id)} activeOpacity={0.7}>
                    <XStack
                      backgroundColor={isSelected ? c.accent + '15' : c.surface}
                      borderRadius={12}
                      padding={14}
                      alignItems="center"
                      borderWidth={isSelected ? 2 : 1}
                      borderColor={isSelected ? c.accent : c.separator}
                      gap={12}
                    >
                      <YStack
                        width={20}
                        height={20}
                        borderRadius={10}
                        backgroundColor={isSelected ? c.accent : 'transparent'}
                        borderWidth={isSelected ? 0 : 2}
                        borderColor={c.separator}
                        alignItems="center"
                        justifyContent="center"
                      >
                        {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </YStack>
                      <Text fontSize={15} color={c.text} flex={1}>{move.name}</Text>
                      {move.category && <Text fontSize={12} color={c.secondary}>{move.category}</Text>}
                      <YStack
                        backgroundColor={STATE_COLORS[move.learningState]}
                        paddingHorizontal={8}
                        paddingVertical={3}
                        borderRadius={8}
                      >
                        <Text fontSize={10} fontWeight="700" color="#FFF">{move.learningState}</Text>
                      </YStack>
                    </XStack>
                  </TouchableOpacity>
                );
              })}
              {moves.length === 0 && (
                <Text fontSize={14} color={c.secondary} textAlign="center" paddingVertical={20}>
                  Add moves to Arsenal first
                </Text>
              )}
            </YStack>

            {/* Notes */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>NOTES (OPTIONAL)</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Tips, counts, timing..."
                placeholderTextColor={c.secondary}
                backgroundColor={c.surface}
                color={c.text}
                borderColor={c.separator}
                borderWidth={1}
                borderRadius={16}
                paddingHorizontal={16}
                paddingVertical={14}
                fontSize={15}
                multiline
                height={100}
                unstyled
                textAlignVertical="top"
              />
            </YStack>

            {/* Save */}
            <TouchableOpacity onPress={handleSave} disabled={!canSave} activeOpacity={0.85}>
              <YStack
                backgroundColor={canSave ? c.accent : c.separator}
                borderRadius={16}
                paddingVertical={18}
                alignItems="center"
              >
                <Text color="#FFF" fontSize={17} fontWeight="700">Save Combo</Text>
              </YStack>
            </TouchableOpacity>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
