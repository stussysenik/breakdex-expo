// Create Combo Screen — dot-line sequence builder, XState, Tamagui UI
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { Move } from '../../lib/machines/moveMachine';
import { STATE_COLORS } from '../../lib/kernel/learningState';
import { Ionicons } from '@expo/vector-icons';

function DotLineSequence({ moveIds, moves, onRemove, c }: {
  moveIds: string[];
  moves: Move[];
  onRemove: (index: number) => void;
  c: any;
}) {
  if (moveIds.length === 0) {
    return (
      <YStack
        backgroundColor={c.fill}
        borderRadius={16}
        padding={20}
        alignItems="center"
        gap={6}
        borderWidth={1}
        borderColor={c.separator}
        borderStyle="dashed"
      >
        <Ionicons name="add-circle-outline" size={28} color={c.secondary} />
        <Text fontSize={14} color={c.secondary} textAlign="center">
          Tap moves below to build your sequence
        </Text>
      </YStack>
    );
  }

  return (
    <YStack paddingLeft={8} paddingRight={4} paddingVertical={4}>
      {moveIds.map((id, i) => {
        const move = moves.find((m) => m.id === id);
        if (!move) return null;
        const stateColor = STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW;
        const isLast = i === moveIds.length - 1;

        return (
          <View key={`${id}-${i}`} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
            {/* Dot + Line column */}
            <View style={{ width: 32, alignItems: 'center' }}>
              {/* Top line (not for first item) */}
              <View style={{
                width: 2,
                height: 12,
                backgroundColor: i === 0 ? 'transparent' : c.separator,
              }} />
              {/* Dot */}
              <View style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: stateColor,
                borderWidth: 2,
                borderColor: stateColor,
              }} />
              {/* Bottom line (not for last item) */}
              <View style={{
                width: 2,
                flex: 1,
                minHeight: 16,
                backgroundColor: isLast ? 'transparent' : c.separator,
              }} />
            </View>

            {/* Move card */}
            <View style={{ flex: 1, paddingLeft: 10, paddingBottom: isLast ? 0 : 8, paddingTop: 2 }}>
              <XStack
                backgroundColor={c.surface}
                borderRadius={12}
                paddingHorizontal={14}
                paddingVertical={12}
                alignItems="center"
                borderLeftWidth={3}
                borderLeftColor={stateColor}
                gap={10}
              >
                <YStack flex={1}>
                  <Text fontSize={15} fontWeight="600" color={c.text}>{move.name}</Text>
                  {move.category && (
                    <Text fontSize={12} color={c.secondary} marginTop={2}>{move.category}</Text>
                  )}
                </YStack>
                <YStack
                  backgroundColor={stateColor + '22'}
                  borderRadius={8}
                  paddingHorizontal={8}
                  paddingVertical={3}
                  marginRight={6}
                >
                  <Text fontSize={10} fontWeight="700" color={stateColor}>{move.learningState}</Text>
                </YStack>
                <TouchableOpacity onPress={() => onRemove(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={20} color={c.secondary} />
                </TouchableOpacity>
              </XStack>
            </View>
          </View>
        );
      })}
    </YStack>
  );
}

export default function CreateComboScreen() {
  const router = useRouter();
  const { comboActor, moveSnap } = useMachines();
  const c = useColors();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedMoveIds, setSelectedMoveIds] = useState<string[]>([]);

  const moves = moveSnap.context.moves.filter((m) => !m.archivedAt);

  const addMove = (id: string) => {
    setSelectedMoveIds((prev) => [...prev, id]);
  };

  const removeAtIndex = (index: number) => {
    setSelectedMoveIds((prev) => prev.filter((_, i) => i !== index));
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
        <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16} borderBottomWidth={1} borderBottomColor={c.separator}>
          <XStack justifyContent="space-between" alignItems="center">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={22} color={c.accent} />
                <Text fontSize={16} color={c.accent}>Cancel</Text>
              </XStack>
            </TouchableOpacity>
            <Text fontSize={18} fontWeight="700" color={c.text}>New Combo</Text>
            <TouchableOpacity onPress={handleSave} disabled={!canSave} activeOpacity={0.8} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text fontSize={16} fontWeight="700" color={canSave ? c.accent : c.secondary}>Save</Text>
            </TouchableOpacity>
          </XStack>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <YStack padding={20} gap={24}>

            {/* Name */}
            <YStack gap={8}>
              <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>COMBO NAME</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Six Step → Windmill → Freeze"
                placeholderTextColor={c.secondary as any}
                backgroundColor={c.surface}
                color={c.text}
                borderColor={name.trim() ? c.accent : c.separator}
                borderWidth={name.trim() ? 2 : 1}
                borderRadius={14}
                paddingHorizontal={16}
                paddingVertical={14}
                fontSize={16}
                unstyled
              />
            </YStack>

            {/* Dot-line sequence */}
            <YStack gap={10}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>
                  SEQUENCE {selectedMoveIds.length > 0 ? `· ${selectedMoveIds.length} moves` : ''}
                </Text>
                {selectedMoveIds.length > 0 && (
                  <TouchableOpacity onPress={() => setSelectedMoveIds([])} activeOpacity={0.7}>
                    <Text fontSize={12} color={c.error}>Clear all</Text>
                  </TouchableOpacity>
                )}
              </XStack>
              <DotLineSequence
                moveIds={selectedMoveIds}
                moves={moves}
                onRemove={removeAtIndex}
                c={c}
              />
              {selectedMoveIds.length === 1 && (
                <Text fontSize={12} color={c.secondary} paddingLeft={2}>Add at least one more move</Text>
              )}
            </YStack>

            {/* Move picker */}
            <YStack gap={10}>
              <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>ADD MOVES</Text>
              {moves.length === 0 ? (
                <YStack backgroundColor={c.fill} borderRadius={14} padding={20} alignItems="center" gap={8}>
                  <Ionicons name="layers-outline" size={28} color={c.secondary} />
                  <Text fontSize={14} color={c.secondary} textAlign="center">
                    Add moves to your Arsenal first
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/move/create')} activeOpacity={0.8}>
                    <Text fontSize={14} fontWeight="600" color={c.accent}>Create a Move →</Text>
                  </TouchableOpacity>
                </YStack>
              ) : (
                <YStack gap={8}>
                  {moves.map((move) => {
                    const stateColor = STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW;
                    const countInSeq = selectedMoveIds.filter((id) => id === move.id).length;
                    return (
                      <TouchableOpacity key={move.id} onPress={() => addMove(move.id)} activeOpacity={0.75}>
                        <XStack
                          backgroundColor={countInSeq > 0 ? stateColor + '12' : c.surface}
                          borderRadius={14}
                          paddingHorizontal={16}
                          paddingVertical={14}
                          alignItems="center"
                          borderWidth={countInSeq > 0 ? 2 : 1}
                          borderColor={countInSeq > 0 ? stateColor : c.separator}
                          gap={12}
                        >
                          {/* Dot indicator */}
                          <View style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: stateColor,
                          }} />
                          <YStack flex={1}>
                            <Text fontSize={15} fontWeight="500" color={c.text}>{move.name}</Text>
                            {move.category && (
                              <Text fontSize={12} color={c.secondary} marginTop={1}>{move.category}</Text>
                            )}
                          </YStack>
                          {countInSeq > 0 && (
                            <YStack
                              backgroundColor={stateColor}
                              borderRadius={10}
                              width={22}
                              height={22}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize={11} fontWeight="700" color="#FFF">{countInSeq}</Text>
                            </YStack>
                          )}
                          <Ionicons name="add-circle-outline" size={22} color={countInSeq > 0 ? stateColor : c.secondary} />
                        </XStack>
                      </TouchableOpacity>
                    );
                  })}
                </YStack>
              )}
            </YStack>

            {/* Notes */}
            <YStack gap={8}>
              <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>NOTES (OPTIONAL)</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Tips, counts, timing..."
                placeholderTextColor={c.secondary as any}
                backgroundColor={c.surface}
                color={c.text}
                borderColor={c.separator}
                borderWidth={1}
                borderRadius={14}
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

            <YStack height={32} />
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
