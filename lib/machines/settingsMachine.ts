// Settings Machine — XState v5
// Orchestrates settings persistence and theme control

import { createMachine, assign, fromPromise } from 'xstate';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export type SettingsContext = {
  themeMode: ThemeMode;
  accentColor: string;
  fontFamily: string;
  categories: string[];
  newCardsPerDay: number;
  reviewsPerDay: number;
  showTimer: boolean;
  autoAdvance: boolean;
  loaded: boolean;
  error: string | null;
};

type SettingsEvent =
  | { type: 'LOAD' }
  | { type: 'LOADED'; settings: Partial<SettingsContext> }
  | { type: 'SET_THEME'; mode: ThemeMode }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_ACCENT'; color: string }
  | { type: 'SET_FONT'; family: string }
  | { type: 'ADD_CATEGORY'; name: string }
  | { type: 'REMOVE_CATEGORY'; name: string }
  | { type: 'SET_NEW_CARDS_PER_DAY'; count: number }
  | { type: 'SET_REVIEWS_PER_DAY'; count: number }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'TOGGLE_AUTO_ADVANCE' }
  | { type: 'RESET_ALL' };

const DEFAULT_CATEGORIES = ['Toprock', 'Footwork', 'Power', 'Freezes', 'Flow', 'Transitions'];

const STORAGE_KEY = 'breakdex_settings';

export const settingsMachine = createMachine(
  {
    id: 'settings',
    types: {} as {
      context: SettingsContext;
      events: SettingsEvent;
    },
    context: {
      themeMode: 'light',
      accentColor: '#1F5EFF',
      fontFamily: 'Inter',
      categories: DEFAULT_CATEGORIES,
      newCardsPerDay: 20,
      reviewsPerDay: 50,
      showTimer: true,
      autoAdvance: false,
      loaded: false,
      error: null,
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: fromPromise(async () => {
            try {
              const raw = await AsyncStorage.getItem(STORAGE_KEY);
              return raw ? JSON.parse(raw) : {};
            } catch {
              return {};
            }
          }),
          onDone: {
            target: 'ready',
            actions: assign({
              loaded: true,
              themeMode: ({ event }) => (event.output?.themeMode as ThemeMode) ?? 'light',
              accentColor: ({ event }) => event.output?.accentColor ?? '#1F5EFF',
              fontFamily: ({ event }) => event.output?.fontFamily ?? 'Inter',
              categories: ({ event }) => event.output?.categories ?? DEFAULT_CATEGORIES,
              newCardsPerDay: ({ event }) => event.output?.newCardsPerDay ?? 20,
              reviewsPerDay: ({ event }) => event.output?.reviewsPerDay ?? 50,
              showTimer: ({ event }) => event.output?.showTimer ?? true,
              autoAdvance: ({ event }) => event.output?.autoAdvance ?? false,
            }),
          },
          onError: {
            target: 'ready',
            actions: assign({ loaded: true, error: 'Failed to load settings' }),
          },
        },
      },

      ready: {
        on: {
          SET_THEME: {
            actions: ['setTheme', 'persist'],
          },
          TOGGLE_THEME: {
            actions: ['toggleTheme', 'persist'],
          },
          SET_ACCENT: {
            actions: ['setAccent', 'persist'],
          },
          SET_FONT: {
            actions: ['setFont', 'persist'],
          },
          ADD_CATEGORY: {
            actions: ['addCategory', 'persist'],
          },
          REMOVE_CATEGORY: {
            actions: ['removeCategory', 'persist'],
          },
          SET_NEW_CARDS_PER_DAY: {
            actions: ['setNewCardsPerDay', 'persist'],
          },
          SET_REVIEWS_PER_DAY: {
            actions: ['setReviewsPerDay', 'persist'],
          },
          TOGGLE_TIMER: {
            actions: ['toggleTimer', 'persist'],
          },
          TOGGLE_AUTO_ADVANCE: {
            actions: ['toggleAutoAdvance', 'persist'],
          },
          RESET_ALL: {
            actions: ['resetAll', 'persist'],
          },
        },
      },
    },
  },
  {
    actions: {
      setTheme: assign({
        themeMode: ({ event }) =>
          event.type === 'SET_THEME' ? event.mode : 'light',
      }),
      toggleTheme: assign({
        themeMode: ({ context }) =>
          context.themeMode === 'light' ? 'dark' : 'light',
      }),
      setAccent: assign({
        accentColor: ({ event }) =>
          event.type === 'SET_ACCENT' ? event.color : '#1F5EFF',
      }),
      setFont: assign({
        fontFamily: ({ event }) =>
          event.type === 'SET_FONT' ? event.family : 'Inter',
      }),
      addCategory: assign({
        categories: ({ context, event }) => {
          if (event.type !== 'ADD_CATEGORY') return context.categories;
          if (context.categories.includes(event.name)) return context.categories;
          return [...context.categories, event.name];
        },
      }),
      removeCategory: assign({
        categories: ({ context, event }) => {
          if (event.type !== 'REMOVE_CATEGORY') return context.categories;
          return context.categories.filter((c) => c !== event.name);
        },
      }),
      setNewCardsPerDay: assign({
        newCardsPerDay: ({ event }) =>
          event.type === 'SET_NEW_CARDS_PER_DAY' ? event.count : 20,
      }),
      setReviewsPerDay: assign({
        reviewsPerDay: ({ event }) =>
          event.type === 'SET_REVIEWS_PER_DAY' ? event.count : 50,
      }),
      toggleTimer: assign({
        showTimer: ({ context }) => !context.showTimer,
      }),
      toggleAutoAdvance: assign({
        autoAdvance: ({ context }) => !context.autoAdvance,
      }),
      resetAll: assign({
        themeMode: 'light' as ThemeMode,
        accentColor: '#1F5EFF',
        fontFamily: 'Inter',
        categories: DEFAULT_CATEGORIES,
        newCardsPerDay: 20,
        reviewsPerDay: 50,
        showTimer: true,
        autoAdvance: false,
      }),
      persist: ({ context }) => {
        const { loaded, error, ...data } = context;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(console.error);
      },
    },
  }
);
