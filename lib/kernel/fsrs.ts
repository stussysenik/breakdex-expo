// FSRS Kernel — TypeScript interface to ReScript logic
// Pure functional FSRS algorithm (mirrors src/rescript/Fsrs.res)

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type FsrsCard = {
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
};

export type ReviewResult = FsrsCard & {
  dueMs: number;
};

export type DueSummary = {
  newDue: number;
  learningDue: number;
  reviewDue: number;
  totalDueToday: number;
  dueTomorrow: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const clampEase = (e: number) => Math.max(1.3, e);

function nextIntervalForHard(state: number, interval: number, ease: number): number {
  if (state === 0) return 1;
  if (state === 1) return Math.max(1, Math.round(interval * 1.2));
  return Math.max(1, Math.round(interval * ease * 1.2));
}

function nextIntervalForGood(state: number, interval: number, ease: number): number {
  if (state === 0) return 1;
  if (state === 1) return Math.max(1, Math.round(interval * 1.5));
  return Math.max(1, Math.round(interval * ease));
}

function nextIntervalForEasy(state: number, interval: number, ease: number): number {
  if (state === 0 || state === 1) return 4;
  return Math.max(1, Math.round(interval * (ease + 0.15) * 1.3));
}

function deriveNextState(interval: number, repetitions: number, rating: Rating): number {
  if (rating === 'again') return 3;
  if (rating === 'hard') return interval === 0 ? 0 : 1;
  if (rating === 'good') return interval >= 21 && repetitions > 2 ? 2 : 1;
  return 2;
}

export function calculateNextReview(card: FsrsCard, rating: Rating): ReviewResult {
  const { interval, easeFactor, repetitions, lapses, state } = card;
  const nowMs = Date.now();

  let newInterval: number;
  let newEase: number;
  let newReps: number;
  let newLapses: number;

  switch (rating) {
    case 'again':
      newInterval = 1;
      newEase = clampEase(easeFactor - 0.2);
      newReps = repetitions;
      newLapses = lapses + 1;
      break;
    case 'hard':
      newInterval = nextIntervalForHard(state, interval, easeFactor);
      newEase = clampEase(easeFactor - 0.15);
      newReps = repetitions;
      newLapses = lapses;
      break;
    case 'good':
      newInterval = nextIntervalForGood(state, interval, easeFactor);
      newEase = easeFactor;
      newReps = repetitions + 1;
      newLapses = lapses;
      break;
    case 'easy':
      newInterval = nextIntervalForEasy(state, interval, easeFactor);
      newEase = easeFactor + 0.15;
      newReps = repetitions + 1;
      newLapses = lapses;
      break;
  }

  const newState = deriveNextState(newInterval, newReps, rating);
  const dueMs = nowMs + newInterval * DAY_MS;

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newReps,
    lapses: newLapses,
    state: newState,
    dueMs,
  };
}

export function makeDefaultCard(): FsrsCard {
  return { interval: 0, easeFactor: 2.5, repetitions: 0, lapses: 0, state: 0 };
}

export function isDueNow(dueMs: number): boolean {
  return dueMs <= Date.now();
}

export function computeDueSummary(cards: Array<FsrsCard & { dueMs: number }>): DueSummary {
  const now = Date.now();
  const todayEnd = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  })();
  const tomorrowEnd = todayEnd + DAY_MS;

  const dueNow = cards.filter((c) => c.dueMs <= now);
  const dueToday = cards.filter((c) => c.dueMs <= todayEnd);
  const dueTomorrow = cards.filter((c) => c.dueMs > todayEnd && c.dueMs <= tomorrowEnd);

  return {
    newDue: dueNow.filter((c) => c.state === 0).length,
    learningDue: dueNow.filter((c) => c.state === 1 || c.state === 3).length,
    reviewDue: dueNow.filter((c) => c.state === 2).length,
    totalDueToday: dueToday.length,
    dueTomorrow: dueTomorrow.length,
  };
}

export function estimateNextDueLabel(result: ReviewResult): string {
  const days = result.interval;
  if (days === 0) return '<1d';
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}
