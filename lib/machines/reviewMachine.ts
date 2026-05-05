// Review Machine — XState v5
// Orchestrates the full FSRS flashcard review session lifecycle

import { createMachine, assign } from 'xstate';
import { calculateNextReview, makeDefaultCard, FsrsCard, Rating, estimateNextDueLabel } from '../kernel/fsrs';
import { Move } from './moveMachine';
import { applyRating, LearningState } from '../kernel/learningState';

export type ReviewCard = {
  moveId: string;
  moveName: string;
  moveCategory: string | null;
  moveNotes: string | null;
  fsrs: FsrsCard & { dueMs: number };
};

export type SessionStats = {
  again: number;
  hard: number;
  good: number;
  easy: number;
  total: number;
};

export type ReviewContext = {
  queue: ReviewCard[];
  currentIndex: number;
  assessmentVisible: boolean;
  sessionStats: SessionStats;
  completedCards: ReviewCard[];
  updatedStates: Record<string, LearningState>;
  nextDueLabel: string;
  loopEnabled: boolean;
  playbackSpeed: number;
  exitAnimating: boolean;
};

type ReviewEvent =
  | { type: 'START_SESSION'; moves: Move[]; cardMap: Record<string, FsrsCard & { dueMs: number }> }
  | { type: 'SHOW_ASSESSMENT' }
  | { type: 'RATE'; rating: Rating }
  | { type: 'NEXT_CARD' }
  | { type: 'RESET' }
  | { type: 'TOGGLE_LOOP' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'EXIT_ANIMATION_DONE' };

const EMPTY_STATS: SessionStats = { again: 0, hard: 0, good: 0, easy: 0, total: 0 };

function buildQueue(
  moves: Move[],
  cardMap: Record<string, FsrsCard & { dueMs: number }>
): ReviewCard[] {
  const now = Date.now();
  return moves
    .filter((m) => !m.archivedAt)
    .map((m) => ({
      moveId: m.id,
      moveName: m.name,
      moveCategory: m.category,
      moveNotes: m.notes,
      fsrs: cardMap[m.id] ?? { ...makeDefaultCard(), dueMs: now },
    }))
    .filter((c) => c.fsrs.dueMs <= now)
    .sort((a, b) => a.fsrs.dueMs - b.fsrs.dueMs);
}

export const reviewMachine = createMachine(
  {
    id: 'review',
    types: {} as {
      context: ReviewContext;
      events: ReviewEvent;
    },
    context: {
      queue: [],
      currentIndex: 0,
      assessmentVisible: false,
      sessionStats: EMPTY_STATS,
      completedCards: [],
      updatedStates: {},
      nextDueLabel: '',
      loopEnabled: true,
      playbackSpeed: 1.0,
      exitAnimating: false,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          START_SESSION: {
            target: 'prescreen',
            actions: 'buildQueue',
          },
        },
      },

      prescreen: {
        on: {
          START_SESSION: {
            target: 'reviewing',
            guard: 'hasCards',
          },
          RESET: 'idle',
        },
        always: [{ target: 'complete', guard: 'noCards' }],
      },

      reviewing: {
        initial: 'question',
        on: {
          RESET: {
            target: 'idle',
            actions: 'resetSession',
          },
          TOGGLE_LOOP: { actions: 'toggleLoop' },
          SET_SPEED: { actions: 'setSpeed' },
        },
        states: {
          question: {
            on: {
              SHOW_ASSESSMENT: 'assessment',
            },
          },
          assessment: {
            on: {
              RATE: {
                target: 'exiting',
                actions: 'recordRating',
              },
            },
          },
          exiting: {
            entry: 'setExitAnimating',
            on: {
              EXIT_ANIMATION_DONE: [
                {
                  target: '#review.complete',
                  guard: 'sessionDone',
                  actions: 'clearExitAnimating',
                },
                {
                  target: 'question',
                  actions: ['advanceCard', 'clearExitAnimating'],
                },
              ],
            },
          },
        },
      },

      complete: {
        on: {
          RESET: {
            target: 'idle',
            actions: 'resetSession',
          },
          START_SESSION: {
            target: 'reviewing',
            actions: 'buildQueue',
            guard: 'hasCards',
          },
        },
      },
    },
  },
  {
    guards: {
      hasCards: ({ context }) => context.queue.length > 0,
      noCards: ({ context }) => context.queue.length === 0,
      sessionDone: ({ context }) => context.currentIndex >= context.queue.length - 1,
    },
    actions: {
      buildQueue: assign({
        queue: ({ event }) => {
          if (event.type !== 'START_SESSION') return [];
          return buildQueue(event.moves, event.cardMap);
        },
        currentIndex: 0,
        assessmentVisible: false,
        sessionStats: EMPTY_STATS,
        completedCards: [],
        updatedStates: {},
        exitAnimating: false,
      }),

      recordRating: assign({
        queue: ({ context, event }) => {
          if (event.type !== 'RATE') return context.queue;
          const card = context.queue[context.currentIndex];
          if (!card) return context.queue;
          const result = calculateNextReview(card.fsrs, event.rating);
          return context.queue.map((c, i) =>
            i === context.currentIndex ? { ...c, fsrs: result } : c
          );
        },
        sessionStats: ({ context, event }) => {
          if (event.type !== 'RATE') return context.sessionStats;
          const stats = { ...context.sessionStats };
          stats[event.rating] = (stats[event.rating] ?? 0) + 1;
          stats.total += 1;
          return stats;
        },
        updatedStates: ({ context, event }) => {
          if (event.type !== 'RATE') return context.updatedStates;
          const card = context.queue[context.currentIndex];
          if (!card) return context.updatedStates;
          const prev = context.updatedStates[card.moveId] ?? ('NEW' as LearningState);
          return {
            ...context.updatedStates,
            [card.moveId]: applyRating(prev, event.rating),
          };
        },
        nextDueLabel: ({ context, event }) => {
          if (event.type !== 'RATE') return context.nextDueLabel;
          const card = context.queue[context.currentIndex];
          if (!card) return '';
          const result = calculateNextReview(card.fsrs, event.rating);
          return estimateNextDueLabel(result);
        },
        completedCards: ({ context }) => {
          const card = context.queue[context.currentIndex];
          if (!card) return context.completedCards;
          return [...context.completedCards, card];
        },
      }),

      advanceCard: assign({
        currentIndex: ({ context }) => context.currentIndex + 1,
        assessmentVisible: false,
      }),

      resetSession: assign({
        queue: [],
        currentIndex: 0,
        assessmentVisible: false,
        sessionStats: EMPTY_STATS,
        completedCards: [],
        updatedStates: {},
        nextDueLabel: '',
        exitAnimating: false,
      }),

      setExitAnimating: assign({ exitAnimating: true }),
      clearExitAnimating: assign({ exitAnimating: false }),
      toggleLoop: assign({ loopEnabled: ({ context }) => !context.loopEnabled }),
      setSpeed: assign({
        playbackSpeed: ({ event }) => (event.type === 'SET_SPEED' ? event.speed : 1.0),
      }),
    },
  }
);

// Pure selectors
export const selectCurrentCard = (ctx: ReviewContext): ReviewCard | null =>
  ctx.queue[ctx.currentIndex] ?? null;

export const selectSessionAccuracy = (ctx: ReviewContext): number => {
  const { total, again } = ctx.sessionStats;
  if (total === 0) return 0;
  return Math.round(((total - again) / total) * 100);
};

export const selectProgress = (ctx: ReviewContext): number => {
  if (ctx.queue.length === 0) return 0;
  return Math.round((ctx.currentIndex / ctx.queue.length) * 100);
};
