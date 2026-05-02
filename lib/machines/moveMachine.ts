// Move Machine — XState v5
// Orchestrates all move CRUD, selection, search, filter, and animation states

import { createMachine, assign, fromPromise } from 'xstate';
import { LearningState } from '../kernel/learningState';

export type Move = {
  id: string;
  name: string;
  learningState: LearningState;
  category: string | null;
  videoPath: string | null;
  notes: string | null;
  createdAt: string;
  archivedAt: string | null;
  archiveReason: string | null;
};

export type MoveFilter = {
  search: string;
  category: string | null;
  state: LearningState | null;
};

type MoveContext = {
  moves: Move[];
  selectedId: string | null;
  filter: MoveFilter;
  categories: string[];
  error: string | null;
  animatingIds: string[];
};

type MoveEvent =
  | { type: 'ADD_MOVE'; name: string; category: string | null; notes: string | null }
  | { type: 'DELETE_MOVE'; id: string }
  | { type: 'UPDATE_MOVE'; id: string; updates: Partial<Move> }
  | { type: 'ARCHIVE_MOVE'; id: string; reason: string }
  | { type: 'RESTORE_MOVE'; id: string }
  | { type: 'SELECT_MOVE'; id: string }
  | { type: 'DESELECT_MOVE' }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_CATEGORY_FILTER'; category: string | null }
  | { type: 'SET_STATE_FILTER'; state: LearningState | null }
  | { type: 'ADD_CATEGORY'; category: string }
  | { type: 'REMOVE_CATEGORY'; category: string }
  | { type: 'ANIMATION_DONE'; id: string }
  | { type: 'LOAD_MOVES'; moves: Move[] };

const SAMPLE_CATEGORIES = ['Toprock', 'Footwork', 'Power', 'Freezes', 'Flow', 'Transitions'];

export const moveMachine = createMachine(
  {
    id: 'moves',
    types: {} as {
      context: MoveContext;
      events: MoveEvent;
    },
    context: {
      moves: [],
      selectedId: null,
      filter: { search: '', category: null, state: null },
      categories: SAMPLE_CATEGORIES,
      error: null,
      animatingIds: [],
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          ADD_MOVE: {
            actions: 'addMove',
          },
          DELETE_MOVE: {
            actions: 'deleteMove',
          },
          UPDATE_MOVE: {
            actions: 'updateMove',
          },
          ARCHIVE_MOVE: {
            actions: 'archiveMove',
          },
          RESTORE_MOVE: {
            actions: 'restoreMove',
          },
          SELECT_MOVE: {
            actions: 'selectMove',
          },
          DESELECT_MOVE: {
            actions: 'deselectMove',
          },
          SET_SEARCH: {
            actions: 'setSearch',
          },
          SET_CATEGORY_FILTER: {
            actions: 'setCategoryFilter',
          },
          SET_STATE_FILTER: {
            actions: 'setStateFilter',
          },
          ADD_CATEGORY: {
            actions: 'addCategory',
          },
          REMOVE_CATEGORY: {
            actions: 'removeCategory',
          },
          LOAD_MOVES: {
            actions: 'loadMoves',
          },
          ANIMATION_DONE: {
            actions: 'clearAnimation',
          },
        },
      },
    },
  },
  {
    actions: {
      addMove: assign({
        moves: ({ context, event }) => {
          if (event.type !== 'ADD_MOVE') return context.moves;
          const newMove: Move = {
            id: crypto.randomUUID(),
            name: event.name,
            learningState: 'NEW',
            category: event.category,
            videoPath: null,
            notes: event.notes,
            createdAt: new Date().toISOString(),
            archivedAt: null,
            archiveReason: null,
          };
          return [newMove, ...context.moves];
        },
        animatingIds: ({ context, event }) => {
          if (event.type !== 'ADD_MOVE') return context.animatingIds;
          return context.animatingIds;
        },
      }),

      deleteMove: assign({
        moves: ({ context, event }) => {
          if (event.type !== 'DELETE_MOVE') return context.moves;
          return context.moves.filter((m) => m.id !== event.id);
        },
        selectedId: ({ context, event }) => {
          if (event.type !== 'DELETE_MOVE') return context.selectedId;
          return context.selectedId === event.id ? null : context.selectedId;
        },
      }),

      updateMove: assign({
        moves: ({ context, event }) => {
          if (event.type !== 'UPDATE_MOVE') return context.moves;
          return context.moves.map((m) =>
            m.id === event.id ? { ...m, ...event.updates } : m
          );
        },
      }),

      archiveMove: assign({
        moves: ({ context, event }) => {
          if (event.type !== 'ARCHIVE_MOVE') return context.moves;
          const now = new Date().toISOString();
          return context.moves.map((m) =>
            m.id === event.id ? { ...m, archivedAt: now, archiveReason: event.reason } : m
          );
        },
      }),

      restoreMove: assign({
        moves: ({ context, event }) => {
          if (event.type !== 'RESTORE_MOVE') return context.moves;
          return context.moves.map((m) =>
            m.id === event.id ? { ...m, archivedAt: null, archiveReason: null } : m
          );
        },
      }),

      selectMove: assign({
        selectedId: ({ event }) => {
          if (event.type !== 'SELECT_MOVE') return null;
          return event.id;
        },
      }),

      deselectMove: assign({ selectedId: null }),

      setSearch: assign({
        filter: ({ context, event }) => {
          if (event.type !== 'SET_SEARCH') return context.filter;
          return { ...context.filter, search: event.search };
        },
      }),

      setCategoryFilter: assign({
        filter: ({ context, event }) => {
          if (event.type !== 'SET_CATEGORY_FILTER') return context.filter;
          return { ...context.filter, category: event.category };
        },
      }),

      setStateFilter: assign({
        filter: ({ context, event }) => {
          if (event.type !== 'SET_STATE_FILTER') return context.filter;
          return { ...context.filter, state: event.state };
        },
      }),

      addCategory: assign({
        categories: ({ context, event }) => {
          if (event.type !== 'ADD_CATEGORY') return context.categories;
          if (context.categories.includes(event.category)) return context.categories;
          return [...context.categories, event.category];
        },
      }),

      removeCategory: assign({
        categories: ({ context, event }) => {
          if (event.type !== 'REMOVE_CATEGORY') return context.categories;
          return context.categories.filter((c) => c !== event.category);
        },
      }),

      loadMoves: assign({
        moves: ({ event }) => {
          if (event.type !== 'LOAD_MOVES') return [];
          return event.moves;
        },
      }),

      clearAnimation: assign({
        animatingIds: ({ context, event }) => {
          if (event.type !== 'ANIMATION_DONE') return context.animatingIds;
          return context.animatingIds.filter((id) => id !== event.id);
        },
      }),
    },
  }
);

// Pure derived selectors — called outside the machine, ReScript-style
export const selectFilteredMoves = (context: MoveContext): Move[] => {
  const { moves, filter } = context;
  return moves
    .filter((m) => !m.archivedAt)
    .filter((m) => {
      if (!filter.search) return true;
      return m.name.toLowerCase().includes(filter.search.toLowerCase());
    })
    .filter((m) => {
      if (!filter.category) return true;
      return m.category === filter.category;
    })
    .filter((m) => {
      if (!filter.state) return true;
      return m.learningState === filter.state;
    });
};

export const selectMoveById = (context: MoveContext, id: string): Move | undefined =>
  context.moves.find((m) => m.id === id);

export const selectMovesByState = (context: MoveContext) => ({
  NEW: context.moves.filter((m) => !m.archivedAt && m.learningState === 'NEW'),
  LEARNING: context.moves.filter((m) => !m.archivedAt && m.learningState === 'LEARNING'),
  MASTERY: context.moves.filter((m) => !m.archivedAt && m.learningState === 'MASTERY'),
});

export const selectCategoryBreakdown = (context: MoveContext) => {
  const active = context.moves.filter((m) => !m.archivedAt);
  const map: Record<string, number> = {};
  for (const m of active) {
    const cat = m.category ?? 'Uncategorized';
    map[cat] = (map[cat] ?? 0) + 1;
  }
  return map;
};
