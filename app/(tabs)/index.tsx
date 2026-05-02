import React, { useState } from 'react';
import { FlatList, Alert } from 'react-native';
import { YStack, XStack, Text, Input } from 'tamagui';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { tokens, getColor } from '../../lib/design/tokens';

const STATE_COLORS = {
  NEW: tokens.colors.state.new,
  LEARNING: tokens.colors.state.learning,
  REVIEW: '#8B5CF6',
  MASTERY: tokens.colors.state.mastery,
};

export default function MovesScreen() {
  const store = useStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const theme = store.theme.mode;
  const c = tokens.colors[theme] ?? tokens.colors.light;

  const handleDeleteMove = (id: string, name: string) => {
    Alert.alert('Delete Move', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => store.deleteMove(id), style: 'destructive' },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <XStack
      alignItems="center"
      padding={16}
      borderBottomWidth={1}
      borderBottomColor={c.separator}
      onPress={() => router.push(`/move/${item.id}`)}
      pressStyle={{ opacity: 0.7 }}
      cursor="pointer"
    >
      <YStack flex={1}>
        <Text fontSize={16} fontWeight="500" color={c.text}>
          {item.name}
        </Text>
        <Text fontSize={12} color={c.secondary} marginTop={4}>
          {item.category || 'Uncategorized'}
        </Text>
      </YStack>
      <YStack
        backgroundColor={STATE_COLORS[item.learningState] ?? STATE_COLORS.NEW}
        paddingHorizontal={8}
        paddingVertical={4}
        borderRadius={6}
      >
        <Text fontSize={12} color="#FFF" fontWeight="500">
          {item.learningState}
        </Text>
      </YStack>
    </XStack>
  );

  return (
    <YStack flex={1} backgroundColor={c.background}>
      <YStack padding={16} paddingTop={24}>
        <Text fontSize={24} fontWeight="600" color={c.text}>Arsenal</Text>
        <Text fontSize={14} color={c.secondary} marginTop={4}>
          {store.movesCount} moves
        </Text>
      </YStack>

      <YStack paddingHorizontal={16} marginBottom={16}>
        <Input
          value={search}
          onChangeText={(v) => { setSearch(v); store.searchMoves(v); }}
          placeholder="Search moves..."
          placeholderTextColor={c.secondary}
          backgroundColor={c.fill}
          color={c.text}
          borderColor={c.separator}
          borderWidth={1}
          borderRadius={10}
          padding={10}
          fontSize={16}
        />
      </YStack>

      <FlatList
        data={store.movesFiltered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <YStack flex={1} justifyContent="center" alignItems="center" paddingTop={100}>
            <Text fontSize={18} color={c.secondary}>No moves yet</Text>
            <Text fontSize={14} color={c.secondary} marginTop={8}>Tap + to add your first move</Text>
          </YStack>
        }
      />

      <YStack
        position="absolute"
        right={16}
        bottom={16}
        width={56}
        height={56}
        borderRadius={28}
        backgroundColor={c.accent}
        alignItems="center"
        justifyContent="center"
        onPress={() => router.push('/move/create')}
        pressStyle={{ opacity: 0.8 }}
        cursor="pointer"
        style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.3)' } as any}
      >
        <Text color="#FFF" fontSize={28} fontWeight="300">+</Text>
      </YStack>
    </YStack>
  );
}
