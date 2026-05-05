// Create Set Screen — XState set machine, Tamagui UI
import React, { useState, useRef } from "react";
import { TouchableOpacity, Animated, TextInput } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useRouter, Stack } from "expo-router";
import { useMachines, useColors } from "../../lib/context/MachineContext";
import { Ionicons } from "@expo/vector-icons";

export default function CreateSetScreen() {
  const router = useRouter();
  const { setActor } = useMachines();
  const c = useColors();

  const [name, setName] = useState("");
  const btnScale = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (!name.trim()) return;
    Animated.sequence([
      Animated.spring(btnScale, {
        toValue: 0.94,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    setActor({ type: "CREATE_SET", name: name.trim() });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor={c.background}>
        <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={16}>
          <XStack justifyContent="space-between" alignItems="center">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <XStack alignItems="center" gap={4}>
                <Ionicons name="chevron-back" size={20} color={c.accent} />
                <Text fontSize={16} color={c.accent}>
                  Cancel
                </Text>
              </XStack>
            </TouchableOpacity>
            <Text fontSize={18} fontWeight="700" color={c.text}>
              New Set
            </Text>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                <Text fontSize={16} fontWeight="700" color={c.accent}>
                  Save
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </XStack>
        </YStack>

        <YStack padding={20} gap={24}>
          <YStack gap={8}>
            <Text
              fontSize={13}
              fontWeight="700"
              color={c.secondary}
              letterSpacing={0.8}
            >
              SET NAME *
            </Text>
            <YStack
              backgroundColor={c.surface}
              borderRadius={16}
              borderWidth={name.trim() ? 2 : 1}
              borderColor={name.trim() ? c.accent : c.separator}
              paddingHorizontal={16}
              paddingVertical={14}
            >
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Competition Prep, Morning Routine..."
                placeholderTextColor={c.secondary}
                style={{ fontSize: 16, color: c.text }}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </YStack>
          </YStack>

          <YStack
            backgroundColor={c.fill}
            borderRadius={14}
            padding={16}
            gap={8}
          >
            <Text fontSize={13} color={c.secondary}>
              Sets are containers for your moves and combos. After creating a
              set, you can add moves and combos to it from the set detail
              screen.
            </Text>
          </YStack>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
              <YStack
                backgroundColor={name.trim() ? c.accent : c.separator}
                borderRadius={16}
                paddingVertical={18}
                alignItems="center"
                shadowColor={c.accent}
                shadowOffset={{ width: 0, height: 4 } as any}
                shadowOpacity={name.trim() ? 0.3 : 0}
                shadowRadius={8 as any}
                elevation={name.trim() ? 4 : 0}
              >
                <Text color="#FFF" fontSize={17} fontWeight="700">
                  Save Set
                </Text>
              </YStack>
            </TouchableOpacity>
          </Animated.View>
        </YStack>
      </YStack>
    </>
  );
}
