// Battle Machine — XState v5
// Orchestrates battle mode: difficulty selection → timed quiz → results

import { createMachine, assign } from 'xstate';
import { Move } from './moveMachine';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; duration: number; pointsPerCorrect: number }> = {
  easy: { label: 'Easy', duration: 30, pointsPerCorrect: 1 },
  medium: { label: 'Medium', duration: 20, pointsPerCorrect: 2 },
  hard: { label: 'Hard', duration: 10, pointsPerCorrect: 3 },
};

export type BattlePhase = 'intro' | 'active' | 'results';

export type BattleContext = {
  phase: BattlePhase;
  difficulty: Difficulty;
  moves: Move[];
  currentMove: Move | null;
  score: number;
  streak: number;
  maxStreak: number;
  timeRemaining: number;
  totalAttempts: number;
  correctAttempts: number;
  timerActive: boolean;
};

type BattleEvent =
  | { type: 'SELECT_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'LOAD_MOVES'; moves: Move[] }
  | { type: 'START' }
  | { type: 'MARK_KNOW' }
  | { type: 'MARK_SKIP' }
  | { type: 'TICK' }
  | { type: 'RESET' };

function pickRandomMove(moves: Move[], exclude?: Move | null): Move | null {
  const filtered = exclude ? moves.filter((m) => m.id !== exclude.id) : moves;
  if (filtered.length === 0) return moves[0] ?? null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export const battleMachine = createMachine(
  {
    id: 'battle',
    types: {} as {
      context: BattleContext;
      events: BattleEvent;
    },
    context: {
      phase: 'intro',
      difficulty: 'medium',
      moves: [],
      currentMove: null,
      score: 0,
      streak: 0,
      maxStreak: 0,
      timeRemaining: 20,
      totalAttempts: 0,
      correctAttempts: 0,
      timerActive: false,
    },
    initial: 'intro',
    states: {
      intro: {
        on: {
          SELECT_DIFFICULTY: {
            actions: 'setDifficulty',
          },
          LOAD_MOVES: {
            actions: 'loadMoves',
          },
          START: {
            target: 'active',
            guard: 'hasMoves',
            actions: 'startBattle',
          },
        },
      },

      active: {
        on: {
          MARK_KNOW: {
            actions: 'markKnow',
          },
          MARK_SKIP: {
            actions: 'markSkip',
          },
          TICK: [
            {
              target: 'results',
              guard: 'timeUp',
            },
            {
              actions: 'decrementTimer',
            },
          ],
          RESET: {
            target: 'intro',
            actions: 'resetBattle',
          },
        },
      },

      results: {
        on: {
          RESET: {
            target: 'intro',
            actions: 'resetBattle',
          },
          START: {
            target: 'active',
            guard: 'hasMoves',
            actions: 'startBattle',
          },
        },
      },
    },
  },
  {
    guards: {
      hasMoves: ({ context }) => context.moves.length > 0,
      timeUp: ({ context }) => context.timeRemaining <= 0,
    },
    actions: {
      setDifficulty: assign({
        difficulty: ({ event }) =>
          event.type === 'SELECT_DIFFICULTY' ? event.difficulty : 'medium',
        timeRemaining: ({ event }) => {
          if (event.type !== 'SELECT_DIFFICULTY') return 20;
          return DIFFICULTY_CONFIG[event.difficulty].duration;
        },
      }),
      loadMoves: assign({
        moves: ({ event }) => (event.type === 'LOAD_MOVES' ? event.moves : []),
      }),
      startBattle: assign({
        phase: 'active',
        currentMove: ({ context }) => pickRandomMove(context.moves),
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        timeRemaining: ({ context }) => DIFFICULTY_CONFIG[context.difficulty].duration,
        timerActive: true,
      }),
      markKnow: assign({
        score: ({ context }) => {
          const pts = DIFFICULTY_CONFIG[context.difficulty].pointsPerCorrect;
          return context.score + pts + Math.max(0, context.streak - 1);
        },
        streak: ({ context }) => context.streak + 1,
        maxStreak: ({ context }) => Math.max(context.maxStreak, context.streak + 1),
        totalAttempts: ({ context }) => context.totalAttempts + 1,
        correctAttempts: ({ context }) => context.correctAttempts + 1,
        currentMove: ({ context }) => pickRandomMove(context.moves, context.currentMove),
        timeRemaining: ({ context }) => DIFFICULTY_CONFIG[context.difficulty].duration,
      }),
      markSkip: assign({
        streak: 0,
        totalAttempts: ({ context }) => context.totalAttempts + 1,
        currentMove: ({ context }) => pickRandomMove(context.moves, context.currentMove),
      }),
      decrementTimer: assign({
        timeRemaining: ({ context }) => Math.max(0, context.timeRemaining - 1),
      }),
      resetBattle: assign({
        phase: 'intro',
        currentMove: null,
        score: 0,
        streak: 0,
        maxStreak: 0,
        timeRemaining: ({ context }) => DIFFICULTY_CONFIG[context.difficulty].duration,
        totalAttempts: 0,
        correctAttempts: 0,
        timerActive: false,
      }),
    },
  }
);
