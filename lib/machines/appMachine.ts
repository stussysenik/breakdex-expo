// App Machine — XState v5
// Root orchestrator: manages global navigation state and app lifecycle

import { createMachine, assign } from 'xstate';

export type AppTab = 'arsenal' | 'drill' | 'progress' | 'lab' | 'flow';

export type AppContext = {
  activeTab: AppTab;
  isReady: boolean;
  error: string | null;
};

type AppEvent =
  | { type: 'NAVIGATE'; tab: AppTab }
  | { type: 'APP_READY' }
  | { type: 'APP_ERROR'; message: string };

export const appMachine = createMachine({
  id: 'app',
  types: {} as {
    context: AppContext;
    events: AppEvent;
  },
  context: {
    activeTab: 'arsenal',
    isReady: false,
    error: null,
  },
  initial: 'booting',
  states: {
    booting: {
      on: {
        APP_READY: {
          target: 'running',
          actions: assign({ isReady: true }),
        },
        APP_ERROR: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.message,
          }),
        },
      },
    },
    running: {
      on: {
        NAVIGATE: {
          actions: assign({
            activeTab: ({ event }) => event.tab,
          }),
        },
      },
    },
    error: {
      on: {
        APP_READY: {
          target: 'running',
          actions: assign({ isReady: true, error: null }),
        },
      },
    },
  },
});
