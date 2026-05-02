// Arsenal Screen — XState orchestrated, Tamagui UI, animated rows
import React, { useState, useRef, useCallback } from 'react';
import { FlatList, Alert, Animated, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { useRouter } from 'expo-router';
import { useMachines, useFilteredMoves, useColors } from '../../lib/context/MachineContext';
import { STATE_COLORS } from '../../lib/kernel/learningState';
import { Move } from '../../lib/machines/moveMachine';
import { LearningState } from '../../lib/kernel/learningState';
import { Ionicons } from '@expo/vector-icons';

const STATE_FILTERS: Array<{ label: string; value: LearningState | null }> = [
  { label: 'All', value: null },
  { label: 'New', value: 'NEW' },
  { label: 'Learning', value: 'LEARNING' },
  { label: 'Mastery', value: 'MASTERY' },
];

function MoveRow({ item, onPress, onLongPress, c }: {
  item: Move; onPress: () => void; onLongPress: () => void; c: any;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
        <XStack
          alignItems="center"
          paddingHorizontal={20}
          paddingVertical={14}
          borderBottomWidth={1}
          borderBottomColor={c.separator}
        >
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="500" color={c.text}>{item.name}</Text>
            <Text fontSize={12} color={c.secondary} marginTop={2}>
              {item.category ?? 'Uncategorized'}
            </Text>
          </YStack>
          <YStack
            backgroundColor={STATE_COLORS[item.learningState] ?? STATE_COLORS.NEW}
            paddingHorizontal={10}
            paddingVertical={4}
            borderRadius={20}
          >
            <Text fontSize={11} color="#FFF" fontWeight="700" letterSpacing={0.5}>
              {item.learningState}
            </Text>
          </YStack>
          <Ionicons name="chevron-forward" size={16} color={c.secondary} style={{ marginLeft: 8 }} />
        </XStack>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ArsenalScreen() {
  const { moveSnap, moveActor } = useMachines();
  const router = useRouter();
  const c = useColors();
  const filtered = useFilteredMoves();

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Move', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => moveActor({ type: 'DELETE_MOVE', id }), style: 'destructive' },
    ]);
  };

  const handleStateFilter = (state: LearningState | null) => {
    moveActor({ type: 'SET_STATE_FILTER', state });
  };

  const activeFilter = moveSnap.context.filter.state;

  return (
    <YStack flex={1} backgroundColor={c.background}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={12}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Arsenal</Text>
            <Text fontSize={13} color={c.secondary} marginTop={2}>{filtered.length} moves</Text>
          </YStack>
          <TouchableOpacity onPress={() => router.push('/battle')} activeOpacity={0.7}>
            <YStack backgroundColor={c.fill} borderRadius={20} paddingHorizontal={14} paddingVertical={8}>
              <Text fontSize={13} fontWeight="600" color={c.accent}>⚔️ Battle</Text>
            </YStack>
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Search */}
      <YStack paddingHorizontal={20} marginBottom={12}>
        <XStack backgroundColor={c.fill} borderRadius={12} paddingHorizontal={12} paddingVertical={10} alignItems="center" gap={8}>
          <Ionicons name="search" size={16} color={c.secondary} />
          <Input
            flex={1}
            value={moveSnap.context.filter.search}
            onChangeText={(v) => moveActor({ type: 'SET_SEARCH', search: v })}
            placeholder="Search moves..."
            placeholderTextColor={c.secondary}
            backgroundColor="transparent"
            color={c.text}
            borderWidth={0}
            padding={0}
            fontSize={15}
            unstyled
          />
          {moveSnap.context.filter.search.length > 0 && (
            <TouchableOpacity onPress={() => moveActor({ type: 'SET_SEARCH', search: '' })}>
              <Ionicons name="close-circle" size={16} color={c.secondary} />
            </TouchableOpacity>
          )}
        </XStack>
      </YStack>

      {/* State filter chips */}
      <XStack paddingHorizontal={20} gap={8} marginBottom={12}>
        {STATE_FILTERS.map(({ label, value }) => {
          const isActive = activeFilter === value;
          return (
            <TouchableOpacity key={label} onPress={() => handleStateFilter(value)} activeOpacity={0.7}>
              <YStack
                paddingHorizontal={14}
                paddingVertical={6}
                borderRadius={20}
                borderWidth={1}
                backgroundColor={isActive ? c.accent : 'transparent'}
                borderColor={isActive ? c.accent : c.separator}
              >
                <Text fontSize={13} fontWeight="600" color={isActive ? '#FFF' : c.secondary}>{label}</Text>
              </YStack>
            </TouchableOpacity>
          );
        })}
      </XStack>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MoveRow
            item={item}
            c={c}
            onPress={() => router.push(`/move/${item.id}`)}
            onLongPress={() => handleDelete(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <YStack alignItems="center" paddingTop={80} gap={8}>
            <Ionicons name="layers-outline" size={52} color={c.secondary} />
            <Text fontSize={18} fontWeight="600" color={c.secondary}>No moves yet</Text>
            <Text fontSize={14} color={c.secondary}>Tap + to add your first move</Text>
          </YStack>
        }
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/move/create')}
        activeOpacity={0.85}
        style={{
          position: 'absolute', right: 20, bottom: 30,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </YStack>
  );
}
