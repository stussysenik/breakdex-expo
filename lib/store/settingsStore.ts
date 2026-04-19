import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  darkMode: boolean;
  showTimer: boolean;
  autoSync: boolean;
  wifiOnly: boolean;
  accentColor: string;
  categories: string[];
  deckMovesPerDay: number;
  newCardsPerDay: number;
  
  setDarkMode: (v: boolean) => void;
  setShowTimer: (v: boolean) => void;
  setAutoSync: (v: boolean) => void;
  setWifiOnly: (v: boolean) => void;
  setAccentColor: (v: string) => void;
  setCategories: (v: string[]) => void;
  setDeckMovesPerDay: (v: number) => void;
  setNewCardsPerDay: (v: number) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const DEFAULT_CATEGORIES = ['Toprock', 'Footwork', 'Power', 'Freezes', 'Flow', 'Transitions'];

export const useSettingsStore = create<Settings>((set, get) => ({
  darkMode: false,
  showTimer: true,
  autoSync: true,
  wifiOnly: true,
  accentColor: '#6366F1',
  categories: DEFAULT_CATEGORIES,
  deckMovesPerDay: 50,
  newCardsPerDay: 20,
  
  setDarkMode: (v) => {
    set({ darkMode: v });
    get().saveSettings();
  },
  setShowTimer: (v) => {
    set({ showTimer: v });
    get().saveSettings();
  },
  setAutoSync: (v) => {
    set({ autoSync: v });
    get().saveSettings();
  },
  setWifiOnly: (v) => {
    set({ wifiOnly: v });
    get().saveSettings();
  },
  setAccentColor: (v) => {
    set({ accentColor: v });
    get().saveSettings();
  },
  setCategories: (v) => {
    set({ categories: v });
    get().saveSettings();
  },
  setDeckMovesPerDay: (v) => {
    set({ deckMovesPerDay: v });
    get().saveSettings();
  },
  setNewCardsPerDay: (v) => {
    set({ newCardsPerDay: v });
    get().saveSettings();
  },
  
  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem('settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ ...parsed });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  },
  
  saveSettings: async () => {
    try {
      const { darkMode, showTimer, autoSync, wifiOnly, accentColor, categories, deckMovesPerDay, newCardsPerDay } = get();
      await AsyncStorage.setItem('settings', JSON.stringify({
        darkMode, showTimer, autoSync, wifiOnly, accentColor, categories, deckMovesPerDay, newCardsPerDay
      }));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },
}));