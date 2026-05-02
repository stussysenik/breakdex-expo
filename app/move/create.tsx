'use client';

import { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { useRouter, Stack } from 'expo-router';
import { useStore } from '../../lib/store';
import { tokens } from '../../lib/design/tokens';

export default function CreateMoveScreen() {
  const router = useRouter();
  const store = useStore();
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;

  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    store.addMove(name.trim(), selectedCategory || null);
    router.back();
  };

  const handleAddCategory = () => {
    const category = window.prompt('New Category', '');
    if (category?.trim()) {
      store.addCategory(category.trim());
      setSelectedCategory(category.trim());
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Move', headerShown: true }} />
      <ScrollView style={{ flex: 1, backgroundColor: c.background }}>
        <YStack padding={16}>
          <YStack marginBottom={24}>
            <Text fontSize={14} fontWeight="600" color={c.secondary} marginBottom={8}>Name *</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Enter move name"
              placeholderTextColor={c.secondary}
              backgroundColor={c.surface}
              color={c.text}
              borderColor={c.separator}
              borderWidth={1}
              borderRadius={16}
              padding={16}
              fontSize={16}
            />
          </YStack>

          <YStack marginBottom={24}>
            <Text fontSize={14} fontWeight="600" color={c.secondary} marginBottom={8}>Category</Text>
            {store.categories.length === 0 ? (
              <Text fontSize={14} color={c.secondary} fontStyle="italic">
                No categories yet. Add moves to create categories.
              </Text>
            ) : (
              <XStack flexWrap="wrap" gap={8}>
                {store.categories.map((cat: string) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <YStack
                      key={cat}
                      paddingHorizontal={16}
                      paddingVertical={8}
                      borderRadius={20}
                      borderWidth={1}
                      backgroundColor={isSelected ? c.accent : c.surface}
                      borderColor={isSelected ? c.accent : c.separator}
                      onPress={() => setSelectedCategory(isSelected ? '' : cat)}
                      pressStyle={{ opacity: 0.7 }}
                      cursor="pointer"
                    >
                      <Text fontSize={14} color={isSelected ? '#FFF' : c.text}>{cat}</Text>
                    </YStack>
                  );
                })}
              </XStack>
            )}
            <YStack
              marginTop={8}
              padding={16}
              borderRadius={10}
              borderWidth={1}
              borderColor={c.separator}
              backgroundColor={c.fill}
              alignItems="center"
              onPress={handleAddCategory}
              pressStyle={{ opacity: 0.7 }}
              cursor="pointer"
            >
              <Text fontSize={14} fontWeight="600" color={c.accent}>+ Add New Category</Text>
            </YStack>
          </YStack>

          <YStack marginBottom={24}>
            <Text fontSize={14} fontWeight="600" color={c.secondary} marginBottom={8}>Notes</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={c.secondary}
              backgroundColor={c.surface}
              color={c.text}
              borderColor={c.separator}
              borderWidth={1}
              borderRadius={16}
              padding={16}
              fontSize={16}
              multiline
              height={100}
              verticalAlign="top"
            />
          </YStack>

          <YStack
            backgroundColor={c.accent}
            padding={16}
            borderRadius={16}
            alignItems="center"
            marginTop={8}
            onPress={handleSave}
            pressStyle={{ opacity: 0.8 }}
            cursor="pointer"
          >
            <Text color="#FFF" fontSize={17} fontWeight="600">Save Move</Text>
          </YStack>
        </YStack>
      </ScrollView>
    </>
  );
}
