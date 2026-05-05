// Set Detail Screen — XState set machine, entity picker, Tamagui UI
import React, { useState, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
} from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from "expo-router";
import { useMachines, useColors } from "../../lib/context/MachineContext";
import { STATE_COLORS } from "../../lib/kernel/learningState";
import { Ionicons } from "@expo/vector-icons";

export default function SetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setSnap, setActor, moveSnap, comboSnap } = useMachines();
  const c = useColors();

  const [showPicker, setShowPicker] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<"move" | "combo">("move");

  const setEntity = setSnap.context.sets.find((s) => s.id === id);

  if (!setEntity) {
    return (
      <YStack
        flex={1}
        backgroundColor={c.background}
        padding={20}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={16} color={c.secondary}>
          Set not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text fontSize={15} color={c.accent}>
            ← Go back
          </Text>
        </TouchableOpacity>
      </YStack>
    );
  }

  const moves = setEntity.moveIds
    .map((mid) => moveSnap.context.moves.find((m) => m.id === mid))
    .filter(Boolean);
  const combos = setEntity.comboIds
    .map((cid) => comboSnap.context.combos.find((c) => c.id === cid))
    .filter(Boolean);

  const handleDelete = () => {
    Alert.alert("Delete Set", `Delete "${setEntity.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          setActor({ type: "DELETE_SET", id });
          router.back();
        },
        style: "destructive",
      },
    ]);
  };

  const handleAddEntity = (entityId: string) => {
    setActor({
      type: "ADD_ENTITY",
      setId: id,
      entityId,
      entityType: pickerFilter,
    });
  };

  const handleRemoveEntity = (entityId: string) => {
    setActor({
      type: "REMOVE_ENTITY",
      setId: id,
      entityId,
    });
  };

  const availableMoves = moveSnap.context.moves.filter(
    (m) => !m.archivedAt && !setEntity.moveIds.includes(m.id),
  );
  const availableCombos = comboSnap.context.combos.filter(
    (c) => !setEntity.comboIds.includes(c.id),
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        {/* Header */}
        <YStack
          paddingHorizontal={20}
          paddingTop={56}
          paddingBottom={16}
          borderBottomWidth={1}
          borderBottomColor={c.separator}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom={14}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={22} color={c.accent} />
                <Text fontSize={16} color={c.accent}>
                  Sets
                </Text>
              </XStack>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={c.error} />
            </TouchableOpacity>
          </XStack>
          <Text fontSize={26} fontWeight="700" color={c.text} letterSpacing={-0.5}>
            {setEntity.name}
          </Text>
          <Text fontSize={13} color={c.secondary} marginTop={4}>
            {moves.length + combos.length} items
          </Text>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack padding={20} gap={24}>
            {/* Moves section */}
            <YStack gap={10}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={c.secondary}
                  letterSpacing={1}
                >
                  MOVES · {moves.length}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerFilter("move");
                    setShowPicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={c.accent} />
                </TouchableOpacity>
              </XStack>

              {moves.length === 0 ? (
                <YStack
                  backgroundColor={c.fill}
                  borderRadius={14}
                  padding={20}
                  alignItems="center"
                  gap={6}
                  borderWidth={1}
                  borderColor={c.separator}
                  borderStyle="dashed"
                >
                  <Ionicons name="layers-outline" size={24} color={c.secondary} />
                  <Text fontSize={13} color={c.secondary}>
                    No moves in this set
                  </Text>
                </YStack>
              ) : (
                <YStack gap={8}>
                  {moves.map((move) => {
                    if (!move) return null;
                    const stateColor =
                      STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW;
                    return (
                      <XStack
                        key={move.id}
                        backgroundColor={c.surface}
                        borderRadius={14}
                        paddingHorizontal={16}
                        paddingVertical={14}
                        alignItems="center"
                        gap={12}
                        borderWidth={1}
                        borderColor={c.separator}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: stateColor,
                          }}
                        />
                        <YStack flex={1}>
                          <Text fontSize={15} fontWeight="500" color={c.text}>
                            {move.name}
                          </Text>
                          {move.category && (
                            <Text fontSize={12} color={c.secondary} marginTop={1}>
                              {move.category}
                            </Text>
                          )}
                        </YStack>
                        <TouchableOpacity
                          onPress={() => handleRemoveEntity(move.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={c.secondary}
                          />
                        </TouchableOpacity>
                      </XStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>

            {/* Combos section */}
            <YStack gap={10}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={c.secondary}
                  letterSpacing={1}
                >
                  COMBOS · {combos.length}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerFilter("combo");
                    setShowPicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={c.accent} />
                </TouchableOpacity>
              </XStack>

              {combos.length === 0 ? (
                <YStack
                  backgroundColor={c.fill}
                  borderRadius={14}
                  padding={20}
                  alignItems="center"
                  gap={6}
                  borderWidth={1}
                  borderColor={c.separator}
                  borderStyle="dashed"
                >
                  <Ionicons name="git-branch-outline" size={24} color={c.secondary} />
                  <Text fontSize={13} color={c.secondary}>
                    No combos in this set
                  </Text>
                </YStack>
              ) : (
                <YStack gap={8}>
                  {combos.map((combo) => {
                    if (!combo) return null;
                    return (
                      <XStack
                        key={combo.id}
                        backgroundColor={c.surface}
                        borderRadius={14}
                        paddingHorizontal={16}
                        paddingVertical={14}
                        alignItems="center"
                        gap={12}
                        borderWidth={1}
                        borderColor={c.separator}
                      >
                        <Ionicons
                          name="git-branch-outline"
                          size={18}
                          color={c.accent}
                        />
                        <YStack flex={1}>
                          <Text fontSize={15} fontWeight="500" color={c.text}>
                            {combo.name}
                          </Text>
                          <Text fontSize={12} color={c.secondary} marginTop={1}>
                            {combo.moveIds.length} moves
                          </Text>
                        </YStack>
                        <TouchableOpacity
                          onPress={() => handleRemoveEntity(combo.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={c.secondary}
                          />
                        </TouchableOpacity>
                      </XStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>

            {/* Meta */}
            <YStack
              backgroundColor={c.surface}
              borderRadius={14}
              padding={16}
              gap={14}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={14} color={c.secondary}>
                  Created
                </Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>
                  {new Date(setEntity.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </XStack>
            </YStack>

            <YStack height={32} />
          </YStack>
        </ScrollView>

        {/* Entity Picker Modal */}
        {showPicker && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor="rgba(0,0,0,0.5)"
            justifyContent="flex-end"
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            />
            <YStack
              backgroundColor={c.background}
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              paddingTop={20}
              paddingBottom={40}
              maxHeight="70%"
            >
              <XStack
                paddingHorizontal={20}
                justifyContent="space-between"
                alignItems="center"
                marginBottom={16}
              >
                <Text fontSize={18} fontWeight="700" color={c.text}>
                  Add {pickerFilter === "move" ? "Moves" : "Combos"}
                </Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Ionicons name="close" size={24} color={c.secondary} />
                </TouchableOpacity>
              </XStack>

              <XStack paddingHorizontal={20} gap={8} marginBottom={16}>
                <TouchableOpacity
                  onPress={() => setPickerFilter("move")}
                  style={{ flex: 1 }}
                >
                  <YStack
                    backgroundColor={
                      pickerFilter === "move" ? c.accent : c.fill
                    }
                    borderRadius={12}
                    paddingVertical={10}
                    alignItems="center"
                  >
                    <Text
                      fontWeight="600"
                      fontSize={14}
                      color={
                        pickerFilter === "move" ? "#FFF" : c.secondary
                      }
                    >
                      Moves
                    </Text>
                  </YStack>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPickerFilter("combo")}
                  style={{ flex: 1 }}
                >
                  <YStack
                    backgroundColor={
                      pickerFilter === "combo" ? c.accent : c.fill
                    }
                    borderRadius={12}
                    paddingVertical={10}
                    alignItems="center"
                  >
                    <Text
                      fontWeight="600"
                      fontSize={14}
                      color={
                        pickerFilter === "combo" ? "#FFF" : c.secondary
                      }
                    >
                      Combos
                    </Text>
                  </YStack>
                </TouchableOpacity>
              </XStack>

              <ScrollView
                style={{ paddingHorizontal: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <YStack gap={8}>
                  {pickerFilter === "move"
                    ? availableMoves.map((move) => {
                        const stateColor =
                          STATE_COLORS[move.learningState] ??
                          STATE_COLORS.NEW;
                        return (
                          <TouchableOpacity
                            key={move.id}
                            onPress={() => {
                              handleAddEntity(move.id);
                              setShowPicker(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <XStack
                              backgroundColor={c.surface}
                              borderRadius={14}
                              paddingHorizontal={16}
                              paddingVertical={14}
                              alignItems="center"
                              gap={12}
                            >
                              <View
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: stateColor,
                                }}
                              />
                              <YStack flex={1}>
                                <Text
                                  fontSize={15}
                                  fontWeight="500"
                                  color={c.text}
                                >
                                  {move.name}
                                </Text>
                                {move.category && (
                                  <Text
                                    fontSize={12}
                                    color={c.secondary}
                                    marginTop={1}
                                  >
                                    {move.category}
                                  </Text>
                                )}
                              </YStack>
                              <Ionicons
                                name="add-circle-outline"
                                size={22}
                                color={c.accent}
                              />
                            </XStack>
                          </TouchableOpacity>
                        );
                      })
                    : availableCombos.map((combo) => (
                        <TouchableOpacity
                          key={combo.id}
                          onPress={() => {
                            handleAddEntity(combo.id);
                            setShowPicker(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <XStack
                            backgroundColor={c.surface}
                            borderRadius={14}
                            paddingHorizontal={16}
                            paddingVertical={14}
                            alignItems="center"
                            gap={12}
                          >
                            <Ionicons
                              name="git-branch-outline"
                              size={18}
                              color={c.accent}
                            />
                            <YStack flex={1}>
                              <Text
                                fontSize={15}
                                fontWeight="500"
                                color={c.text}
                              >
                                {combo.name}
                              </Text>
                              <Text
                                fontSize={12}
                                color={c.secondary}
                                marginTop={1}
                              >
                                {combo.moveIds.length} moves
                              </Text>
                            </YStack>
                            <Ionicons
                              name="add-circle-outline"
                              size={22}
                              color={c.accent}
                            />
                          </XStack>
                        </TouchableOpacity>
                      ))}
                  {(pickerFilter === "move"
                    ? availableMoves
                    : availableCombos
                  ).length === 0 && (
                    <YStack alignItems="center" padding={20}>
                      <Text color={c.secondary}>No more to add</Text>
                    </YStack>
                  )}
                </YStack>
              </ScrollView>
            </YStack>
          </YStack>
        )}
      </YStack>
    </>
  );
}
