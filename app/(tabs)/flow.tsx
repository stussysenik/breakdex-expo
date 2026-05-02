import React from 'react';
import { YStack, Text } from 'tamagui';
import { tokens } from '../../lib/design/tokens';

const c = tokens.colors.light;

export default function FlowScreen() {
  return (
    <YStack flex={1} backgroundColor={c.background}>
      <YStack padding={16} paddingTop={24}>
        <Text fontSize={24} fontWeight="600" color={c.text}>Flow</Text>
      </YStack>
      <YStack flex={1} justifyContent="center" alignItems="center" padding={24}>
        <Text fontSize={48} marginBottom={16}>🌀</Text>
        <Text fontSize={18} fontWeight="600" color={c.text}>Move Graph</Text>
        <Text fontSize={14} color={c.secondary} marginTop={8} textAlign="center" lineHeight={22}>
          {'Visualize move relationships\nand learning flow\n\nComing soon'}
        </Text>
      </YStack>
    </YStack>
  );
}
