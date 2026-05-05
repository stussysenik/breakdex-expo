// Drill (Review) Screen — XState review machine, FSRS kernel, animated cards
// Supports custom review sessions via entity picker
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  TouchableOpacity,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { YStack, XStack, Text } from "tamagui";
import {
  useMachines,
  useCurrentReviewCard,
  useSessionAccuracy,
  useColors,
} from "../../lib/context/MachineContext";
import { makeDefaultCard, computeDueSummary, estimateNextDueLabel } from "../../lib/kernel/fsrs";
import { RATING_COLORS, RATING_LABELS, STATE_COLORS } from "../../lib/kernel/learningState";
import { Rating } from "../../lib/machines/reviewMachine";
import { resolveSubtree, getDueCards } from "../../lib/database";
import { Ionicons } from "@expo/vector-icons";

const RATINGS: Rating[] = ["again", "hard", "good", "easy"];

function ProgressBar({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: progress / 100,
      tension: 60,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  return (
    <YStack
      height={3}
      backgroundColor="rgba(0,0,0,0.08)"
      borderRadius={2}
      overflow="hidden"
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: 2,
          backgroundColor: color,
          width: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </YStack>
  );
}

function ReviewCard({
  moveName,
  category,
  notes,
  visible,
  c,
}: {
  moveName: string;
  category: string | null;
  notes: string | null;
  visible: boolean;
  c: any;
}) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
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
        <Text fontSize={24} fontWeight="700" color={c.text} marginBottom={8}>
          {moveName}
        </Text>
        {category && (
          <YStack
            alignSelf="flex-start"
            backgroundColor={c.accent + "22"}
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={12}
            marginBottom={12}
          >
            <Text fontSize={12} fontWeight="600" color={c.accent}>
              {category}
            </Text>
          </YStack>
        )}
        {notes && (
          <Text
            fontSize={14}
            color={c.secondary}
            lineHeight={20}
            fontStyle="italic"
          >
            {notes}
          </Text>
        )}
      </YStack>
    </Animated.View>
  );
}

function RatingButton({
  rating,
  onPress,
  nextDue,
  c,
}: {
  rating: Rating;
  onPress: () => void;
  nextDue?: string;
  c: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.92,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
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
          <Text color="#FFF" fontWeight="700" fontSize={14}>
            {RATING_LABELS[rating]}
          </Text>
          {nextDue && (
            <Text color="rgba(255,255,255,0.75)" fontSize={10}>
              {nextDue}
            </Text>
          )}
        </YStack>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DrillScreen() {
  const {
    reviewSnap,
    reviewActor,
    moveSnap,
    comboSnap,
    setSnap,
  } = useMachines();
  const c = useColors();
  const currentCard = useCurrentReviewCard();
  const accuracy = useSessionAccuracy();
  const ctx = reviewSnap.context;
  const state = reviewSnap.value;
  const isIdle = state === "idle" || state === "loading";
  const isComplete = state === "complete";
  const isReviewing =
    typeof state === "object" || state === "reviewing";
  const reviewState =
    typeof state === "object"
      ? Object.keys(state as object)[0]
      : state;
  const isQuestion =
    reviewState === "reviewing" &&
    typeof reviewSnap.value === "object"
      ? (reviewSnap.value as any).reviewing === "question"
      : false;
  const isAssessment =
    typeof reviewSnap.value === "object"
      ? (reviewSnap.value as any).reviewing === "assessment"
      : false;

  const [showPicker, setShowPicker] = useState(false);
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [pickerTab, setPickerTab] = useState<"moves" | "combos" | "sets">(
    "moves",
  );

  const moves = moveSnap.context.moves.filter((m) => !m.archivedAt);
  const combos = comboSnap.context.combos;
  const sets = setSnap.context.sets;

  const cardMap = reviewSnap.context.cardMap;
  const dueNow = moves.filter((m) => {
    const card = cardMap[m.id];
    if (!card) return true;
    return card.dueMs <= Date.now();
  }).length;

  const toggleEntitySelection = (id: string) => {
    setSelectedEntityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleStart = (entityIds?: string[], scope?: string | null) => {
    const ids = entityIds ?? selectedEntityIds;
    const scopeLabel = scope ?? selectedScope;
    if (ids.length > 0) {
      let resolvedMoveIds: string[] = [];
      const moveIds = new Set(moves.map((m) => m.id));

      for (const entityId of ids) {
        if (moveIds.has(entityId)) {
          // Direct move selection
          resolvedMoveIds.push(entityId);
        } else {
          // Combo or set — resolve subtree to descendant moves
          try {
            const subtree = resolveSubtree(entityId);
            for (const row of subtree) {
              resolvedMoveIds.push(row.id);
            }
          } catch {
            // Fallback: just include the ID if subtree fails
            resolvedMoveIds.push(entityId);
          }
        }
      }
      resolvedMoveIds = [...new Set(resolvedMoveIds)];

      reviewActor({
        type: "START_SESSION",
        moves,
        cardMap,
        entityIds: resolvedMoveIds,
        scope: scopeLabel,
        scopeCount: resolvedMoveIds.length,
      });
    } else {
      reviewActor({ type: "START_SESSION", moves, cardMap });
    }
  };

  const handleRate = (rating: Rating) => {
    reviewActor({ type: "RATE", rating });
    setTimeout(() => reviewActor({ type: "EXIT_ANIMATION_DONE" }), 300);
  };

  const stats = ctx.sessionStats;

  return (
    <YStack flex={1} backgroundColor={c.background}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text
              fontSize={30}
              fontWeight="700"
              color={c.text}
              letterSpacing={-0.5}
            >
              Drill
            </Text>
            <Text fontSize={13} color={c.secondary} marginTop={2}>
              {isReviewing
                ? `${ctx.queue.length - ctx.currentIndex} remaining`
                : ctx.selectedScope
                  ? `${ctx.scopeEntityCount} moves in scope`
                  : `${dueNow} moves to review`}
            </Text>
          </YStack>
          {isReviewing && (
            <TouchableOpacity
              onPress={() => reviewActor({ type: "RESET" })}
              activeOpacity={0.7}
            >
              <YStack
                backgroundColor={c.fill}
                borderRadius={20}
                paddingHorizontal={14}
                paddingVertical={8}
              >
                <Text fontSize={13} fontWeight="600" color={c.secondary}>
                  End
                </Text>
              </YStack>
            </TouchableOpacity>
          )}
        </XStack>

        {/* Scope indicator */}
        {ctx.selectedScope && isReviewing && (
          <YStack
            backgroundColor={c.accent + "15"}
            borderRadius={12}
            paddingHorizontal={14}
            paddingVertical={8}
            marginTop={12}
          >
            <Text fontSize={13} color={c.accent} fontWeight="600">
              {ctx.selectedScope} · {ctx.scopeEntityCount} moves
            </Text>
          </YStack>
        )}

        {/* Session stats bar */}
        {isReviewing && (
          <XStack marginTop={16} gap={8}>
            {(["again", "hard", "good", "easy"] as Rating[]).map((r) => (
              <YStack key={r} flex={1} alignItems="center" gap={2}>
                <Text fontSize={16} fontWeight="700" color={RATING_COLORS[r]}>
                  {stats[r]}
                </Text>
                <Text fontSize={10} color={c.secondary}>
                  {RATING_LABELS[r]}
                </Text>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>

      {/* Progress bar */}
      {isReviewing && ctx.queue.length > 0 && (
        <YStack paddingHorizontal={20} marginBottom={16}>
          <ProgressBar
            progress={(ctx.currentIndex / ctx.queue.length) * 100}
            color={c.accent}
          />
        </YStack>
      )}

      {/* Main content */}
      <YStack flex={1} justifyContent="center">
        {isIdle && (
          <YStack alignItems="center" gap={20} paddingHorizontal={20}>
            <Ionicons name="repeat-outline" size={64} color={c.secondary} />
            <YStack alignItems="center" gap={8}>
              <Text fontSize={22} fontWeight="700" color={c.text}>
                Ready to drill?
              </Text>
              <Text fontSize={15} color={c.secondary} textAlign="center">
                {dueNow > 0
                  ? `${dueNow} moves in your queue`
                  : "Add moves to start reviewing"}
              </Text>
            </YStack>
            {dueNow > 0 && (
              <YStack gap={10} width="100%" alignItems="center">
                <TouchableOpacity
                  onPress={() => handleStart()}
                  activeOpacity={0.85}
                >
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
                    <Text color="#FFF" fontSize={17} fontWeight="700">
                      Start Session
                    </Text>
                  </YStack>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.7}
                >
                  <XStack
                    backgroundColor={c.fill}
                    paddingHorizontal={20}
                    paddingVertical={12}
                    borderRadius={14}
                    alignItems="center"
                    gap={8}
                    borderWidth={1}
                    borderColor={c.separator}
                  >
                    <Ionicons name="options-outline" size={18} color={c.accent} />
                    <Text fontSize={14} color={c.accent} fontWeight="600">
                      {selectedEntityIds.length > 0
                        ? `${selectedEntityIds.length} selected`
                        : "Custom Review"}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              </YStack>
            )}
          </YStack>
        )}

        {isComplete && (
          <YStack alignItems="center" gap={16} paddingHorizontal={20}>
            <Text fontSize={56}>🎉</Text>
            <Text fontSize={24} fontWeight="700" color={c.text}>
              Session Complete!
            </Text>
            <YStack
              backgroundColor={c.surface}
              borderRadius={16}
              padding={20}
              width="100%"
              gap={12}
            >
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>
                  Cards reviewed
                </Text>
                <Text fontSize={15} fontWeight="700" color={c.text}>
                  {stats.total}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize={15} color={c.secondary}>
                  Accuracy
                </Text>
                <Text fontSize={15} fontWeight="700" color={c.success}>
                  {accuracy}%
                </Text>
              </XStack>
            </YStack>
            <TouchableOpacity
              onPress={() => reviewActor({ type: "RESET" })}
              activeOpacity={0.7}
            >
              <YStack
                backgroundColor={c.accent}
                paddingHorizontal={40}
                paddingVertical={14}
                borderRadius={14}
              >
                <Text color="#FFF" fontSize={16} fontWeight="700">
                  Done
                </Text>
              </YStack>
            </TouchableOpacity>
          </YStack>
        )}

        {currentCard &&
          (isQuestion ||
            isAssessment ||
            (typeof reviewSnap.value === "object" &&
              (reviewSnap.value as any).reviewing)) && (
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
                  <TouchableOpacity
                    onPress={() => reviewActor({ type: "SHOW_ASSESSMENT" })}
                    activeOpacity={0.85}
                  >
                    <YStack
                      backgroundColor={c.surface}
                      borderRadius={14}
                      paddingVertical={16}
                      alignItems="center"
                      borderWidth={2}
                      borderColor={c.accent}
                    >
                      <Text fontSize={16} fontWeight="700" color={c.accent}>
                        Show Rating
                      </Text>
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
          <Text fontSize={13} color={c.secondary}>
            Accuracy: {accuracy}%
          </Text>
        </YStack>
      )}

      {/* Custom Review Entity Picker Modal */}
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
            maxHeight="75%"
          >
            <XStack
              paddingHorizontal={20}
              justifyContent="space-between"
              alignItems="center"
              marginBottom={16}
            >
              <Text fontSize={18} fontWeight="700" color={c.text}>
                Custom Review
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={c.secondary} />
              </TouchableOpacity>
            </XStack>

            {/* Tab filter */}
            <XStack paddingHorizontal={20} gap={8} marginBottom={16}>
              {(["moves", "combos", "sets"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setPickerTab(tab)}
                  style={{ flex: 1 }}
                >
                  <YStack
                    backgroundColor={
                      pickerTab === tab ? c.accent : c.fill
                    }
                    borderRadius={12}
                    paddingVertical={10}
                    alignItems="center"
                  >
                    <Text
                      fontWeight="600"
                      fontSize={14}
                      color={
                        pickerTab === tab ? "#FFF" : c.secondary
                      }
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              ))}
            </XStack>

            {/* Selection summary */}
            {selectedEntityIds.length > 0 && (
              <XStack
                paddingHorizontal={20}
                justifyContent="space-between"
                alignItems="center"
                marginBottom={12}
              >
                <Text fontSize={13} color={c.secondary}>
                  {selectedEntityIds.length} selected
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedEntityIds([]);
                    setSelectedScope(null);
                  }}
                >
                  <Text fontSize={13} color={c.error}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              </XStack>
            )}

            <ScrollView
              style={{ paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <YStack gap={8}>
                {pickerTab === "moves" &&
                  moves.map((move) => {
                    const stateColor =
                      STATE_COLORS[move.learningState] ??
                      STATE_COLORS.NEW;
                    const isSelected = selectedEntityIds.includes(
                      move.id,
                    );
                    return (
                      <TouchableOpacity
                        key={move.id}
                        onPress={() => toggleEntitySelection(move.id)}
                        activeOpacity={0.7}
                      >
                        <XStack
                          backgroundColor={
                            isSelected
                              ? c.accent + "15"
                              : c.surface
                          }
                          borderRadius={14}
                          paddingHorizontal={16}
                          paddingVertical={14}
                          alignItems="center"
                          gap={12}
                          borderWidth={isSelected ? 2 : 1}
                          borderColor={
                            isSelected ? c.accent : c.separator
                          }
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
                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={c.accent}
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={22}
                              color={c.secondary}
                            />
                          )}
                        </XStack>
                      </TouchableOpacity>
                    );
                  })}

                {pickerTab === "combos" &&
                  combos.map((combo) => {
                    const isSelected = selectedEntityIds.includes(
                      combo.id,
                    );
                    return (
                      <TouchableOpacity
                        key={combo.id}
                        onPress={() => toggleEntitySelection(combo.id)}
                        activeOpacity={0.7}
                      >
                        <XStack
                          backgroundColor={
                            isSelected
                              ? c.accent + "15"
                              : c.surface
                          }
                          borderRadius={14}
                          paddingHorizontal={16}
                          paddingVertical={14}
                          alignItems="center"
                          gap={12}
                          borderWidth={isSelected ? 2 : 1}
                          borderColor={
                            isSelected ? c.accent : c.separator
                          }
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
                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={c.accent}
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={22}
                              color={c.secondary}
                            />
                          )}
                        </XStack>
                      </TouchableOpacity>
                    );
                  })}

                {pickerTab === "sets" &&
                  sets.map((set) => {
                    const isSelected = selectedEntityIds.includes(
                      set.id,
                    );
                    return (
                      <TouchableOpacity
                        key={set.id}
                        onPress={() => toggleEntitySelection(set.id)}
                        activeOpacity={0.7}
                      >
                        <XStack
                          backgroundColor={
                            isSelected
                              ? c.accent + "15"
                              : c.surface
                          }
                          borderRadius={14}
                          paddingHorizontal={16}
                          paddingVertical={14}
                          alignItems="center"
                          gap={12}
                          borderWidth={isSelected ? 2 : 1}
                          borderColor={
                            isSelected ? c.accent : c.separator
                          }
                        >
                          <Ionicons
                            name="folder-outline"
                            size={18}
                            color={c.accent}
                          />
                          <YStack flex={1}>
                            <Text
                              fontSize={15}
                              fontWeight="500"
                              color={c.text}
                            >
                              {set.name}
                            </Text>
                            <Text
                              fontSize={12}
                              color={c.secondary}
                              marginTop={1}
                            >
                              {set.moveIds.length + set.comboIds.length}{" "}
                              items
                            </Text>
                          </YStack>
                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={c.accent}
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={22}
                              color={c.secondary}
                            />
                          )}
                        </XStack>
                      </TouchableOpacity>
                    );
                  })}
              </YStack>
            </ScrollView>

            {/* Confirm button */}
            <YStack paddingHorizontal={20} marginTop={16}>
              <TouchableOpacity
                onPress={() => {
                  let scopeLabel: string | null = null;
                  if (selectedEntityIds.length > 0) {
                    const scopeNames = selectedEntityIds
                      .map((eid) => {
                        const m = moves.find((x) => x.id === eid);
                        if (m) return m.name;
                        const co = combos.find((x) => x.id === eid);
                        if (co) return co.name;
                        const s = sets.find((x) => x.id === eid);
                        if (s) return s.name;
                        return null;
                      })
                      .filter(Boolean);
                    scopeLabel =
                      scopeNames.length > 2
                        ? `${scopeNames[0]} + ${scopeNames.length - 1} more`
                        : scopeNames.join(", ");
                  }
                  setSelectedScope(scopeLabel);
                  setShowPicker(false);
                  handleStart(selectedEntityIds, scopeLabel);
                }}
                activeOpacity={0.85}
              >
                <YStack
                  backgroundColor={c.accent}
                  borderRadius={16}
                  paddingVertical={18}
                  alignItems="center"
                >
                  <Text color="#FFF" fontSize={17} fontWeight="700">
                    {selectedEntityIds.length > 0
                      ? `Review ${selectedEntityIds.length} Selected`
                      : "Review All Due"}
                  </Text>
                </YStack>
              </TouchableOpacity>
            </YStack>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}
