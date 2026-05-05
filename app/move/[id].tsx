// Move Detail Screen — XState move machine, full details, practice timeline, Tamagui UI
import React, { useRef, useState, useCallback } from "react";
import {
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  TextInput,
} from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useFocusEffect } from "expo-router";
import { useMachines, useColors } from "../../lib/context/MachineContext";
import {
  STATE_COLORS,
  LearningState,
} from "../../lib/kernel/learningState";
import {
  getPracticeEvents,
  insertPracticeEvent,
  type PracticeEventRow,
} from "../../lib/database";
import { Ionicons } from "@expo/vector-icons";

const ALL_STATES: LearningState[] = ["NEW", "LEARNING", "MASTERY"];

const STATE_DESCRIPTIONS: Record<LearningState, string> = {
  NEW: "Just added — not yet drilled",
  LEARNING: "In progress — actively drilling",
  MASTERY: "Mastered — review periodically",
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  reviewed: "star-outline",
  noted: "pencil-outline",
  state_change: "swap-horizontal-outline",
  created: "add-circle-outline",
  archived: "archive-outline",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  reviewed: "Reviewed",
  noted: "Note",
  state_change: "State Change",
  created: "Created",
  archived: "Archived",
};

function StatePill({
  state,
  isActive,
  onPress,
  c,
}: {
  state: LearningState;
  isActive: boolean;
  onPress: () => void;
  c: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const color = STATE_COLORS[state];
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.9,
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
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <YStack
          backgroundColor={isActive ? color : color + "22"}
          paddingVertical={12}
          borderRadius={14}
          alignItems="center"
          borderWidth={isActive ? 2 : 0}
          borderColor={color}
          gap={3}
        >
          <Text
            color={isActive ? "#FFF" : color}
            fontSize={12}
            fontWeight="700"
          >
            {state}
          </Text>
        </YStack>
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MoveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { moveSnap, moveActor } = useMachines();
  const c = useColors();

  const [events, setEvents] = useState<PracticeEventRow[]>([]);
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  const loadEvents = useCallback(() => {
    try {
      const rows = getPracticeEvents(id);
      setEvents(rows);
    } catch {
      setEvents([]);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  const move = moveSnap.context.moves.find((m) => m.id === id);

  if (!move) {
    return (
      <YStack
        flex={1}
        backgroundColor={c.background}
        padding={20}
        justifyContent="center"
        alignItems="center"
      >
        <Text fontSize={16} color={c.secondary}>
          Move not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text fontSize={15} color={c.accent}>
            ← Go back
          </Text>
        </TouchableOpacity>
      </YStack>
    );
  }

  const stateColor = STATE_COLORS[move.learningState] ?? STATE_COLORS.NEW;

  const handleUpdateState = (newState: LearningState) => {
    moveActor({
      type: "UPDATE_MOVE",
      id,
      updates: { learningState: newState },
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Move", `Delete "${move.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          moveActor({ type: "DELETE_MOVE", id });
          router.back();
        },
        style: "destructive",
      },
    ]);
  };

  const handleArchive = () => {
    Alert.alert(
      "Archive Move",
      `Archive "${move.name}"? You can restore it later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          onPress: () => {
            moveActor({ type: "ARCHIVE_MOVE", id, reason: "Manually archived" });
            router.back();
          },
        },
      ],
    );
  };

  const handleEditNotes = () => {
    Alert.prompt(
      "Edit Notes",
      "Update your notes:",
      (notes) => {
        if (notes !== null) {
          moveActor({
            type: "UPDATE_MOVE",
            id,
            updates: { notes: notes.trim() || null },
          });
        }
      },
      "plain-text",
      move.notes ?? "",
    );
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    try {
      insertPracticeEvent(crypto.randomUUID(), id, "noted", {
        note: noteText.trim(),
      });
      setNoteText("");
      setShowNoteInput(false);
      loadEvents();
    } catch (e) {
      console.error("Failed to add note:", e);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        {/* Custom header */}
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
            marginBottom={16}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={20} color={c.accent} />
                <Text fontSize={16} color={c.accent}>
                  Moves
                </Text>
              </XStack>
            </TouchableOpacity>
            <XStack gap={16}>
              <TouchableOpacity onPress={handleArchive} activeOpacity={0.7}>
                <Ionicons
                  name="archive-outline"
                  size={22}
                  color={c.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={22} color={c.error} />
              </TouchableOpacity>
            </XStack>
          </XStack>
          <XStack justifyContent="space-between" alignItems="flex-end">
            <YStack flex={1} marginRight={12}>
              <Text
                fontSize={26}
                fontWeight="700"
                color={c.text}
                letterSpacing={-0.5}
              >
                {move.name}
              </Text>
              {move.category && (
                <YStack
                  alignSelf="flex-start"
                  backgroundColor={c.accent + "22"}
                  paddingHorizontal={10}
                  paddingVertical={4}
                  borderRadius={10}
                  marginTop={6}
                >
                  <Text fontSize={12} fontWeight="600" color={c.accent}>
                    {move.category}
                  </Text>
                </YStack>
              )}
            </YStack>
            <YStack
              backgroundColor={stateColor + "22"}
              paddingHorizontal={12}
              paddingVertical={6}
              borderRadius={12}
              borderWidth={1.5}
              borderColor={stateColor}
            >
              <Text fontSize={13} fontWeight="700" color={stateColor}>
                {move.learningState}
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack padding={20} gap={20}>
            {/* Video placeholder */}
            <YStack
              backgroundColor={c.surface}
              borderRadius={20}
              height={200}
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              borderWidth={1}
              borderColor={c.separator}
            >
              <Ionicons name="videocam-outline" size={40} color={c.secondary} />
              <Text fontSize={14} color={c.secondary} marginTop={8}>
                {move.videoPath ? "▶ Play Video" : "No video attached"}
              </Text>
            </YStack>

            {/* State picker */}
            <YStack gap={10}>
              <Text
                fontSize={13}
                fontWeight="700"
                color={c.secondary}
                letterSpacing={0.8}
              >
                STATE
              </Text>
              <XStack gap={8}>
                {ALL_STATES.map((state) => (
                  <StatePill
                    key={state}
                    state={state}
                    isActive={move.learningState === state}
                    onPress={() => handleUpdateState(state)}
                    c={c}
                  />
                ))}
              </XStack>
              <Text fontSize={12} color={c.secondary}>
                {STATE_DESCRIPTIONS[move.learningState]}
              </Text>
            </YStack>

            {/* Details */}
            <YStack
              backgroundColor={c.surface}
              borderRadius={16}
              overflow="hidden"
              borderWidth={1}
              borderColor={c.separator}
            >
              <XStack
                justifyContent="space-between"
                alignItems="center"
                padding={16}
                borderBottomWidth={1}
                borderBottomColor={c.separator}
              >
                <Text fontSize={14} color={c.secondary}>
                  Created
                </Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>
                  {new Date(move.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </XStack>
              <XStack
                justifyContent="space-between"
                alignItems="center"
                padding={16}
              >
                <Text fontSize={14} color={c.secondary}>
                  Category
                </Text>
                <Text fontSize={14} fontWeight="600" color={c.text}>
                  {move.category ?? "None"}
                </Text>
              </XStack>
            </YStack>

            {/* Notes */}
            <YStack gap={10}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={13}
                  fontWeight="700"
                  color={c.secondary}
                  letterSpacing={0.8}
                >
                  NOTES
                </Text>
                <TouchableOpacity
                  onPress={handleEditNotes}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={16} color={c.accent} />
                </TouchableOpacity>
              </XStack>
              <TouchableOpacity onPress={handleEditNotes} activeOpacity={0.8}>
                <YStack
                  backgroundColor={c.surface}
                  borderRadius={16}
                  padding={16}
                  minHeight={80}
                  borderWidth={1}
                  borderColor={c.separator}
                >
                  <Text
                    fontSize={15}
                    color={move.notes ? c.text : c.secondary}
                    lineHeight={22}
                  >
                    {move.notes ?? "Tap to add notes, cues, or references..."}
                  </Text>
                </YStack>
              </TouchableOpacity>
            </YStack>

            {/* Practice Timeline */}
            <YStack gap={10}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={13}
                  fontWeight="700"
                  color={c.secondary}
                  letterSpacing={0.8}
                >
                  PRACTICE TIMELINE
                </Text>
                <TouchableOpacity
                  onPress={() => setShowNoteInput(!showNoteInput)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNoteInput ? "close-circle-outline" : "add-circle-outline"}
                    size={20}
                    color={c.accent}
                  />
                </TouchableOpacity>
              </XStack>

              {/* Manual note input */}
              {showNoteInput && (
                <YStack gap={8}>
                  <YStack
                    backgroundColor={c.surface}
                    borderRadius={14}
                    borderWidth={1}
                    borderColor={c.accent}
                    paddingHorizontal={14}
                    paddingVertical={10}
                  >
                    <TextInput
                      value={noteText}
                      onChangeText={setNoteText}
                      placeholder="Add a practice note..."
                      placeholderTextColor={c.secondary}
                      style={{
                        fontSize: 14,
                        color: c.text,
                        lineHeight: 20,
                      }}
                      multiline
                      textAlignVertical="top"
                      autoFocus
                    />
                  </YStack>
                  <XStack justifyContent="flex-end" gap={8}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowNoteInput(false);
                        setNoteText("");
                      }}
                      activeOpacity={0.7}
                    >
                      <YStack
                        backgroundColor={c.fill}
                        paddingHorizontal={16}
                        paddingVertical={8}
                        borderRadius={10}
                      >
                        <Text fontSize={13} color={c.secondary}>
                          Cancel
                        </Text>
                      </YStack>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddNote}
                      disabled={!noteText.trim()}
                      activeOpacity={0.8}
                    >
                      <YStack
                        backgroundColor={
                          noteText.trim() ? c.accent : c.separator
                        }
                        paddingHorizontal={16}
                        paddingVertical={8}
                        borderRadius={10}
                      >
                        <Text fontSize={13} fontWeight="600" color="#FFF">
                          Save Note
                        </Text>
                      </YStack>
                    </TouchableOpacity>
                  </XStack>
                </YStack>
              )}

              {/* Timeline entries */}
              {events.length === 0 ? (
                <YStack
                  backgroundColor={c.fill}
                  borderRadius={14}
                  padding={20}
                  alignItems="center"
                  gap={6}
                >
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={c.secondary}
                  />
                  <Text fontSize={13} color={c.secondary}>
                    No practice history yet
                  </Text>
                </YStack>
              ) : (
                <YStack gap={0}>
                  {events.map((event, i) => {
                    const icon =
                      EVENT_TYPE_ICONS[event.event_type] ?? "ellipse-outline";
                    const label =
                      EVENT_TYPE_LABELS[event.event_type] ?? event.event_type;
                    let detail = "";
                    try {
                      const payload = JSON.parse(event.payload);
                      if (event.event_type === "reviewed") {
                        detail = `Rating: ${payload.rating ?? "?"}`;
                      } else if (event.event_type === "noted") {
                        detail = payload.note ?? "";
                      } else if (event.event_type === "state_change") {
                        detail = `${payload.from ?? "?"} → ${payload.to ?? "?"}`;
                      } else if (event.event_type === "created") {
                        detail = payload.name ?? "";
                      } else if (event.event_type === "archived") {
                        detail = payload.reason ?? "";
                      }
                    } catch { /* ignore parse errors */ }

                    return (
                      <XStack key={event.id} style={{ minHeight: 44 }}>
                        {/* Timeline line + dot */}
                        <YStack width={32} alignItems="center">
                          <YStack
                            width={2}
                            height={10}
                            backgroundColor={
                              i === 0 ? "transparent" : c.separator
                            }
                          />
                          <YStack
                            width={10}
                            height={10}
                            borderRadius={5}
                            backgroundColor={c.accent}
                            marginVertical={4}
                          />
                          <YStack
                            flex={1}
                            width={2}
                            backgroundColor={
                              i === events.length - 1
                                ? "transparent"
                                : c.separator
                            }
                          />
                        </YStack>
                        {/* Content */}
                        <YStack flex={1} paddingLeft={8} paddingBottom={12}>
                          <XStack alignItems="center" gap={6}>
                            <Ionicons
                              name={icon as any}
                              size={14}
                              color={c.accent}
                            />
                            <Text
                              fontSize={13}
                              fontWeight="600"
                              color={c.text}
                            >
                              {label}
                            </Text>
                          </XStack>
                          {detail ? (
                            <Text fontSize={13} color={c.secondary} marginTop={2}>
                              {detail}
                            </Text>
                          ) : null}
                          <Text fontSize={11} color={c.secondary} marginTop={2}>
                            {formatEventDate(event.created_at)} ·{" "}
                            {formatEventTime(event.created_at)}
                          </Text>
                        </YStack>
                      </XStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
