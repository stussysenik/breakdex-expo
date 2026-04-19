import { create } from 'zustand';
import { Move } from './moveStore';

export interface ReviewCard {
  move: Move;
  due: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  state: 0 | 1 | 2 | 3; // FSRS states: New, Learning, Review, Relearning
}

export interface Deck {
  id: string;
  name: string;
  moveIds: string[];
  createdAt: string;
}

export interface DueCounts {
  new: number;
  learning: number;
  review: number;
  totalDueToday: number;
  dueTomorrow: number;
}

// Simplified FSRS rating grades
export type Rating = 'again' | 'hard' | 'good' | 'easy';

// FSRS algorithm implementation (simplified for React Native)
function calculateNextReview(
  card: ReviewCard,
  rating: Rating
): Partial<ReviewCard> {
  const now = new Date();
  let { interval, easeFactor, repetitions, lapses, state } = card;
  
  // Adjust ease factor based on rating
  switch (rating) {
    case 'again':
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      interval = 1;
      lapses++;
      state = 3; // Relearning
      break;
    case 'hard':
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (state === 0) interval = 1;
      else if (state === 1) interval = Math.max(1, interval * 1.2);
      else interval = Math.max(1, interval * easeFactor * 1.2);
      break;
    case 'good':
      if (state === 0) interval = 1;
      else if (state === 1) interval = Math.max(1, interval * 1.5);
      else interval = Math.max(1, interval * easeFactor);
      repetitions++;
      break;
    case 'easy':
      easeFactor = easeFactor + 0.15;
      if (state === 0) interval = 4;
      else if (state === 1) interval = 4;
      else interval = Math.max(1, interval * easeFactor * 1.3);
      repetitions++;
      break;
  }
  
  // Update state based on interval
  if (interval >= 21 && repetitions > 2) state = 2; // Review
  else if (interval > 0) state = 1; // Learning
  else state = 0; // New
  
  const due = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();
  
  return { interval, easeFactor, repetitions, lapses, state, due };
}

interface ReviewState {
  dueCounts: DueCounts;
  cards: ReviewCard[];
  decks: Deck[];
  currentSession: ReviewCard[];
  currentIndex: number;
  
  computeDueCounts: (moves: Move[]) => void;
  startSession: (deckId?: string) => void;
  rateCard: (rating: Rating) => void;
  nextCard: () => void;
  createDeck: (name: string) => void;
  deleteDeck: (id: string) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  dueCounts: { new: 0, learning: 0, review: 0, totalDueToday: 0, dueTomorrow: 0 },
  cards: [],
  decks: [],
  currentSession: [],
  currentIndex: 0,
  
  computeDueCounts: (moves) => {
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    
    const due = get().cards.filter(c => new Date(c.due) <= todayEnd);
    const tomorrow = get().cards.filter(c => 
      new Date(c.due) > todayEnd && new Date(c.due) <= tomorrowEnd
    );
    
    set({
      dueCounts: {
        new: due.filter(c => c.state === 0).length,
        learning: due.filter(c => c.state === 1 || c.state === 3).length,
        review: due.filter(c => c.state === 2).length,
        totalDueToday: due.length,
        dueTomorrow: tomorrow.length,
      },
    });
  },
  
  startSession: (deckId) => {
    const { cards, dueCounts } = get();
    const session = deckId
      ? cards.filter(c => dueCounts.totalDueToday > 0)
      : cards.filter(c => new Date(c.due) <= new Date());
    
    set({ currentSession: session, currentIndex: 0 });
  },
  
  rateCard: (rating) => {
    const { currentSession, currentIndex } = get();
    if (currentIndex >= currentSession.length) return;
    
    const card = currentSession[currentIndex];
    const updates = calculateNextReview(card, rating);
    
    set({
      cards: get().cards.map(c => 
        c.move.id === card.move.id ? { ...c, ...updates } : c
      ),
    });
  },
  
  nextCard: () => {
    const { currentIndex } = get();
    set({ currentIndex: currentIndex + 1 });
  },
  
  createDeck: (name) => set((state) => ({
    decks: [...state.decks, {
      id: crypto.randomUUID(),
      name,
      moveIds: [],
      createdAt: new Date().toISOString(),
    }],
  })),
  
  deleteDeck: (id) => set((state) => ({
    decks: state.decks.filter(d => d.id !== id),
  })),
}));