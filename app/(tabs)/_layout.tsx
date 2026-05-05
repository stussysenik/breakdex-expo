import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMachines, useColors } from '../../lib/context/MachineContext';

export default function TabLayout() {
  const { settingsSnap } = useMachines();
  const theme = settingsSnap.context.themeMode;
  const c = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.secondary,
        tabBarStyle: { backgroundColor: c.background, borderTopColor: c.separator, borderTopWidth: 1 },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Arsenal', tabBarIcon: ({ color, size }) => <Ionicons name="layers" size={size} color={color} /> }} />
      <Tabs.Screen name="review" options={{ title: 'Drill', tabBarIcon: ({ color, size }) => <Ionicons name="repeat" size={size} color={color} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="lab" options={{ title: 'Lab', tabBarIcon: ({ color, size }) => <Ionicons name="flask" size={size} color={color} /> }} />
      <Tabs.Screen name="flow" options={{ title: 'Flow', tabBarIcon: ({ color, size }) => <Ionicons name="git-branch" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
    </Tabs>
  );
}
