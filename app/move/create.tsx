// Create Move Screen — XState move machine, animated form, Tamagui UI
import React, { useState, useRef } from 'react';
import { ScrollView, Alert, TouchableOpacity, Animated, TextInput } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { Ionicons } from '@expo/vector-icons';

export default function CreateMoveScreen() {
  const router = useRouter();
  const { moveActor, moveSnap, settingsSnap } = useMachines();
  const c = useColors();

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');

  const categories = settingsSnap.context.categories;

  const btnScale = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a move name');
      return;
    }
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.94, tension: 200, friction: 10, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
    moveActor({ type: 'ADD_MOVE', name: name.trim(), category: selectedCategory || null, notes: notes.trim() || null });
    router.back();
  };

  const handleAddCategory = () => {
    Alert.prompt('New Category', 'Category name:', (cat) => {
      if (cat?.trim()) {
        moveActor({ type: 'ADD_CATEGORY', category: cat.trim() });
        setSelectedCategory(cat.trim());
      }
    });
  };

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
            <Text fontSize={18} fontWeight="700" color={c.text}>New Move</Text>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                <Text fontSize={16} fontWeight="700" color={c.accent}>Save</Text>
              </TouchableOpacity>
            </Animated.View>
          </XStack>
        </YStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <YStack padding={20} gap={24}>
            {/* Name */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>MOVE NAME *</Text>
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
                  placeholder="e.g. Six Step, Windmill..."
                  placeholderTextColor={c.secondary}
                  style={{ fontSize: 16, color: c.text }}
                  autoFocus
                  returnKeyType="next"
                />
              </YStack>
            </YStack>

            {/* Category */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>CATEGORY</Text>
              <XStack flexWrap="wrap" gap={8}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(isSelected ? '' : cat)}
                      activeOpacity={0.7}
                    >
                      <YStack
                        paddingHorizontal={16}
                        paddingVertical={9}
                        borderRadius={20}
                        borderWidth={1.5}
                        backgroundColor={isSelected ? c.accent : 'transparent'}
                        borderColor={isSelected ? c.accent : c.separator}
                      >
                        <Text fontSize={14} fontWeight="600" color={isSelected ? '#FFF' : c.text}>{cat}</Text>
                      </YStack>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={handleAddCategory} activeOpacity={0.7}>
                  <YStack
                    paddingHorizontal={16}
                    paddingVertical={9}
                    borderRadius={20}
                    borderWidth={1.5}
                    borderColor={c.accent}
                    borderStyle="dashed"
                  >
                    <Text fontSize={14} fontWeight="600" color={c.accent}>+ New</Text>
                  </YStack>
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Notes */}
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="700" color={c.secondary} letterSpacing={0.8}>NOTES</Text>
              <YStack
                backgroundColor={c.surface}
                borderRadius={16}
                borderWidth={1}
                borderColor={c.separator}
                paddingHorizontal={16}
                paddingTop={14}
                paddingBottom={14}
                minHeight={120}
              >
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Cues, references, links..."
                  placeholderTextColor={c.secondary}
                  style={{ fontSize: 15, color: c.text, lineHeight: 22 }}
                  multiline
                  textAlignVertical="top"
                />
              </YStack>
            </YStack>

            {/* Save button */}
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
                  <Text color="#FFF" fontSize={17} fontWeight="700">Save Move</Text>
                </YStack>
              </TouchableOpacity>
            </Animated.View>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  );
}
