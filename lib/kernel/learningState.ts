// Learning State Kernel — TypeScript interface to ReScript logic
// Pure functional state transitions (mirrors src/rescript/LearningState.res)

export type LearningState = 'NEW' | 'LEARNING' | 'MASTERY';
export type Rating = 'again' | 'hard' | 'good' | 'easy';

export const STATE_COLORS: Record<LearningState, string> = {
  NEW: '#E45D7A',
  LEARNING: '#2F6BFF',
  MASTERY: '#1F8A70',
};

export const RATING_COLORS: Record<Rating, string> = {
  again: '#C23B2A',
  hard: '#B7791F',
  good: '#1F7A4F',
  easy: '#0D9F9A',
};

export const RATING_LABELS: Record<Rating, string> = {
  again: 'Again',
  hard: 'Hard',
  good: 'Good',
  easy: 'Easy',
};

export function applyRating(state: LearningState, rating: Rating): LearningState {
  switch (rating) {
    case 'again':
      return 'NEW';
    case 'hard':
      return 'LEARNING';
    case 'good':
      return state === 'NEW' ? 'LEARNING' : 'MASTERY';
    case 'easy':
      return 'MASTERY';
  }
}

export function stateColor(state: LearningState): string {
  return STATE_COLORS[state] ?? STATE_COLORS.NEW;
}

export function masteryPercent(total: number, mastered: number): number {
  if (total === 0) return 0;
  return Math.round((mastered / total) * 100);
}

export function ALL_RATINGS(): Rating[] {
  return ['again', 'hard', 'good', 'easy'];
}

export function ALL_STATES(): LearningState[] {
  return ['NEW', 'LEARNING', 'MASTERY'];
}
