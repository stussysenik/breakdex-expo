// Combo Detail Screen — dot-line sequence, XState combo machine, Tamagui UI
import React from 'react';
import { ScrollView, TouchableOpacity, Alert, View } from 'react-native';
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
    .map((mid) => moveSnap.context.moves.find((m) => m.id === mid))
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
          <XStack justifyContent="space-between" alignItems="center" marginBottom={14}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={22} color={c.accent} />
                <Text fontSize={16} color={c.accent}>Back</Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="trash-outline" size={20} color={c.error} />
            </TouchableOpacity>
          </XStack>
          <Text fontSize={26} fontWeight="700" color={c.text} letterSpacing={-0.5}>{combo.name}</Text>
          <Text fontSize={13} color={c.secondary} marginTop={4}>{moves.length} moves in sequence</Text>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack padding={20} gap={24}>

            {/* Dot-line sequence */}
            <YStack gap={12}>
              <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>SEQUENCE</Text>

              <YStack paddingLeft={8}>
                {moves.map((move, i) => {
                  if (!move) return null;
                  const stateColor = STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW;
                  const isLast = i === moves.length - 1;

                  return (
                    <View key={`${move.id}-${i}`} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                      {/* Dot + vertical line column */}
                      <View style={{ width: 36, alignItems: 'center' }}>
                        {/* Top connector line */}
                        <View style={{
                          width: 2,
                          height: 14,
                          backgroundColor: i === 0 ? 'transparent' : c.separator,
                        }} />

                        {/* Step number dot */}
                        <View style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: stateColor,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text fontSize={12} fontWeight="700" color="#FFF">{i + 1}</Text>
                        </View>

                        {/* Bottom connector line */}
                        <View style={{
                          width: 2,
                          flex: 1,
                          minHeight: 12,
                          backgroundColor: isLast ? 'transparent' : c.separator,
                        }} />
                      </View>

                      {/* Move card */}
                      <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 10, paddingTop: 2 }}>
                        <XStack
                          backgroundColor={c.surface}
                          borderRadius={14}
                          paddingHorizontal={16}
                          paddingVertical={14}
                          alignItems="center"
                          gap={12}
                          borderLeftWidth={3}
                          borderLeftColor={stateColor}
                        >
                          <YStack flex={1}>
                            <Text fontSize={16} fontWeight="600" color={c.text}>{move.name}</Text>
                            {move.category && (
                              <Text fontSize={12} color={c.secondary} marginTop={2}>{move.category}</Text>
                            )}
                          </YStack>
                          <YStack
                            backgroundColor={stateColor + '22'}
                            borderRadius={8}
                            paddingHorizontal={8}
                            paddingVertical={4}
                          >
                            <Text fontSize={10} fontWeight="700" color={stateColor}>{move.learningState}</Text>
                          </YStack>
                        </XStack>
                      </View>
                    </View>
                  );
                })}
              </YStack>
            </YStack>

            {/* Notes */}
            {combo.notes && (
              <YStack gap={8}>
                <Text fontSize={12} fontWeight="700" color={c.secondary} letterSpacing={1}>NOTES</Text>
                <YStack backgroundColor={c.surface} borderRadius={14} padding={16}>
                  <Text fontSize={15} color={c.text} lineHeight={22}>{combo.notes}</Text>
                </YStack>
              </YStack>
            )}

            {/* Meta */}
            <YStack backgroundColor={c.surface} borderRadius={14} padding={16} gap={14}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={c.secondary}>Created</Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>
                  {new Date(combo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </XStack>
              <View style={{ height: 1, backgroundColor: c.separator }} />
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={c.secondary}>Total moves</Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>{combo.moveIds.length}</Text>
              </XStack>
            </YStack>

            <YStack height={32} />
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
