import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { MachineProvider } from '../lib/context/MachineContext';

export default function RootLayout() {
  return (
    <MachineProvider>
      <TamaguiProvider config={config} defaultTheme="light">
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="move/create" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="move/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="combo/create" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="combo/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="battle" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </TamaguiProvider>
    </MachineProvider>
  );
}
