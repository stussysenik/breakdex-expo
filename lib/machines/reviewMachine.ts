// Review Machine — XState v5
// Orchestrates the full FSRS flashcard review session lifecycle
// Persists FSRS cards to SQLite, supports custom entity selection

import { createMachine, assign, fromPromise } from "xstate";
import {
  calculateNextReview,
  makeDefaultCard,
  FsrsCard,
  Rating,
  estimateNextDueLabel,
} from "../kernel/fsrs";
import { Move } from "./moveMachine";
import { applyRating, LearningState } from "../kernel/learningState";
import {
  getAllFsrsCards,
  getFsrsCard,
  upsertFsrsCard,
  getDueCards,
  insertPracticeEvent,
  type FsrsCardRow,
} from "../database";

export type { Rating };

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
  cardMap: Record<string, FsrsCard & { dueMs: number }>;
  selectedScope: string | null;
  scopeEntityCount: number;
};

type ReviewEvent =
  | {
      type: "START_SESSION";
      moves: Move[];
      cardMap?: Record<string, FsrsCard & { dueMs: number }>;
      entityIds?: string[];
      scope?: string | null;
      scopeCount?: number;
    }
  | { type: "SHOW_ASSESSMENT" }
  | { type: "RATE"; rating: Rating }
  | { type: "NEXT_CARD" }
  | { type: "RESET" }
  | { type: "TOGGLE_LOOP" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "EXIT_ANIMATION_DONE" };

const EMPTY_STATS: SessionStats = {
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
  total: 0,
};

function mapFsrsRow(row: FsrsCardRow): FsrsCard & { dueMs: number } {
  return {
    interval: row.scheduled_days,
    easeFactor: row.stability || 2.5,
    repetitions: row.reps,
    lapses: row.lapses,
    state: row.state,
    dueMs: new Date(row.due).getTime(),
  };
}

function fsrsCardToRow(
  entityId: string,
  card: FsrsCard & { dueMs: number },
): {
  entity_id: string;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
} {
  return {
    entity_id: entityId,
    state: card.state,
    due: new Date(card.dueMs).toISOString(),
    stability: card.easeFactor,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: card.interval,
    reps: card.repetitions,
    lapses: card.lapses,
    last_review: new Date().toISOString(),
  };
}

export const reviewMachine = createMachine(
  {
    id: "review",
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
      nextDueLabel: "",
      loopEnabled: true,
      playbackSpeed: 1.0,
      exitAnimating: false,
      cardMap: {},
      selectedScope: null,
      scopeEntityCount: 0,
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "loadFsrsCards",
          onDone: {
            target: "idle",
            actions: assign({
              cardMap: ({ event }) => event.output as Record<string, FsrsCard & { dueMs: number }>,
            }),
          },
          onError: { target: "idle" },
        },
      },
      idle: {
        on: {
          START_SESSION: {
            target: "prescreen",
            actions: "buildQueue",
          },
        },
      },

      prescreen: {
        on: {
          START_SESSION: {
            target: "reviewing",
            guard: "hasCards",
          },
          RESET: "idle",
        },
        always: [{ target: "complete", guard: "noCards" }],
      },

      reviewing: {
        initial: "question",
        on: {
          RESET: {
            target: "idle",
            actions: "resetSession",
          },
          TOGGLE_LOOP: { actions: "toggleLoop" },
          SET_SPEED: { actions: "setSpeed" },
        },
        states: {
          question: {
            on: {
              SHOW_ASSESSMENT: "assessment",
            },
          },
          assessment: {
            on: {
              RATE: {
                target: "exiting",
                actions: ["recordRating", "persistRating"],
              },
            },
          },
          exiting: {
            entry: "setExitAnimating",
            on: {
              EXIT_ANIMATION_DONE: [
                {
                  target: "#review.complete",
                  guard: "sessionDone",
                  actions: "clearExitAnimating",
                },
                {
                  target: "question",
                  actions: ["advanceCard", "clearExitAnimating"],
                },
              ],
            },
          },
        },
      },

      complete: {
        on: {
          RESET: {
            target: "idle",
            actions: "resetSession",
          },
          START_SESSION: {
            target: "reviewing",
            actions: "buildQueue",
            guard: "hasCards",
          },
        },
      },
    },
  },
  {
    guards: {
      hasCards: ({ context }) => context.queue.length > 0,
      noCards: ({ context }) => context.queue.length === 0,
      sessionDone: ({ context }) =>
        context.currentIndex >= context.queue.length - 1,
    },
    actors: {
      loadFsrsCards: fromPromise(async () => {
        const rows = getAllFsrsCards();
        const map: Record<string, FsrsCard & { dueMs: number }> = {};
        for (const row of rows) {
          map[row.entity_id] = mapFsrsRow(row);
        }
        return map;
      }),
    },
    actions: {
      buildQueue: assign({
        queue: ({ context, event }) => {
          if (event.type !== "START_SESSION") return [];
          const now = Date.now();
          const entityIdSet = event.entityIds
            ? new Set(event.entityIds)
            : null;

          let moves = event.moves.filter((m) => !m.archivedAt);

          if (entityIdSet) {
            moves = moves.filter((m) => entityIdSet.has(m.id));
          }

          return moves
            .map((m) => ({
              moveId: m.id,
              moveName: m.name,
              moveCategory: m.category,
              moveNotes: m.notes,
              fsrs: context.cardMap[m.id] ?? {
                ...makeDefaultCard(),
                dueMs: now,
              },
            }))
            .filter((c) => c.fsrs.dueMs <= now)
            .sort((a, b) => a.fsrs.dueMs - b.fsrs.dueMs);
        },
        currentIndex: 0,
        assessmentVisible: false,
        sessionStats: EMPTY_STATS,
        completedCards: [],
        updatedStates: {},
        exitAnimating: false,
        selectedScope: ({ event }) =>
          event.type === "START_SESSION" ? (event.scope ?? null) : null,
        scopeEntityCount: ({ event }) =>
          event.type === "START_SESSION" ? (event.scopeCount ?? 0) : 0,
      }),

      recordRating: assign({
        queue: ({ context, event }) => {
          if (event.type !== "RATE") return context.queue;
          const card = context.queue[context.currentIndex];
          if (!card) return context.queue;
          const result = calculateNextReview(card.fsrs, event.rating);
          return context.queue.map((c, i) =>
            i === context.currentIndex ? { ...c, fsrs: result } : c,
          );
        },
        sessionStats: ({ context, event }) => {
          if (event.type !== "RATE") return context.sessionStats;
          const stats = { ...context.sessionStats };
          stats[event.rating] = (stats[event.rating] ?? 0) + 1;
          stats.total += 1;
          return stats;
        },
        updatedStates: ({ context, event }) => {
          if (event.type !== "RATE") return context.updatedStates;
          const card = context.queue[context.currentIndex];
          if (!card) return context.updatedStates;
          const prev =
            context.updatedStates[card.moveId] ?? ("NEW" as LearningState);
          return {
            ...context.updatedStates,
            [card.moveId]: applyRating(prev, event.rating),
          };
        },
        nextDueLabel: ({ context, event }) => {
          if (event.type !== "RATE") return context.nextDueLabel;
          const card = context.queue[context.currentIndex];
          if (!card) return "";
          const result = calculateNextReview(card.fsrs, event.rating);
          return estimateNextDueLabel(result);
        },
        completedCards: ({ context }) => {
          const card = context.queue[context.currentIndex];
          if (!card) return context.completedCards;
          return [...context.completedCards, card];
        },
      }),

      persistRating: ({ context, event }) => {
        if (event.type !== "RATE") return;
        const card = context.queue[context.currentIndex];
        if (!card) return;
        try {
          const row = fsrsCardToRow(card.moveId, card.fsrs);
          upsertFsrsCard(row);
          insertPracticeEvent(crypto.randomUUID(), card.moveId, "reviewed", {
            rating: event.rating,
            stability: card.fsrs.easeFactor,
            difficulty: 0,
          });
        } catch (e) {
          console.error("persistRating failed:", e);
        }
      },

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
        nextDueLabel: "",
        exitAnimating: false,
        selectedScope: null,
        scopeEntityCount: 0,
      }),

      setExitAnimating: assign({ exitAnimating: true }),
      clearExitAnimating: assign({ exitAnimating: false }),
      toggleLoop: assign({
        loopEnabled: ({ context }) => !context.loopEnabled,
      }),
      setSpeed: assign({
        playbackSpeed: ({ event }) =>
          event.type === "SET_SPEED" ? event.speed : 1.0,
      }),
    },
  },
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
