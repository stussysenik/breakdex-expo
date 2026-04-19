// Breakdex State - FRP + DOP Style
// ============================
// Immutable state, event-driven updates, derived state

import { create } from 'zustand';

// ═══════════════════════════════════════════════════
// INITIAL STATE - Pure EDN data
// ═══════════════════════════════════════════════════

const initialState = {
  app: { initialized: false },
  
  theme: { 
    mode: 'light',
    accent: '#1F5EFF'
  },
  
  moves: {
    collection: [],
    selectedId: null,
    filter: {},
    search: ''
  },
  
  review: {
    decks: [],
    currentDeck: null,
    dueCards: [],
    currentCard: null,
    session: {
      cardsReviewed: 0,
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    }
  },
  
  stats: {
    period: 'week',
    data: {}
  },
  
  lab: {
    sessions: [],
    milestones: [],
    achievements: []
  },
  
  flow: {
    nodes: [],
    links: []
  },
  
  settings: {
    fontFamily: 'Inter',
    categories: []
  }
};

// ═══════════════════════════════════════════════════
// LENS HELPERS - Path-based data access
// ═══════════════════════════════════════════════════

const getIn = (obj, path) => {
  if (!path || path.length === 0) return obj;
  return path.reduce((o, k) => o?.[k], obj);
};

const updateIn = (obj, path, fn) => {
  if (path.length === 0) return fn(obj);
  const newObj = { ...obj };
  let o = newObj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (o[k] && typeof o[k] === 'object') {
      o[k] = { ...o[k] };
    } else {
      o[k] = {};
    }
    o = o[k];
  }
  const lastKey = path[path.length - 1];
  o[lastKey] = fn(o[lastKey]);
  return newObj;
};

// ═══════════════════════════════════════════════════
// REDUCERS - Pure functions (map/filter/reduce style)
// ═══════════════════════════════════════════════════

const reducers = {
  'app/initialize': (state) => ({
    ...state,
    app: { ...state.app, initialized: true }
  }),
  
  'theme/set': (state, { theme }) => ({
    ...state,
    theme: { ...state.theme, mode: theme }
  }),
  
  'moves/add': (state, { name, category }) => ({
    ...state,
    moves: {
      ...state.moves,
      collection: [
        { 
          id: crypto.randomUUID(),
          name,
          category: category || null,
          learningState: 'NEW',
          createdAt: new Date().toISOString()
        },
        ...state.moves.collection
      ]
    }
  }),
  
  'moves/delete': (state, { id }) => ({
    ...state,
    moves: {
      ...state.moves,
      collection: state.moves.collection.filter(m => m.id !== id)
    }
  }),
  
  'moves/select': (state, { id }) => ({
    ...state,
    moves: { ...state.moves, selectedId: id }
  }),
  
  'moves/filter': (state, { filter }) => ({
    ...state,
    moves: { ...state.moves, filter: filter || {} }
  }),
  
  'moves/search': (state, { query }) => ({
    ...state,
    moves: { ...state.moves, search: query || '' }
  }),
  
  'moves/update-state': (state, { id, learningState }) => ({
    ...state,
    moves: {
      ...state.moves,
      collection: state.moves.collection.map(m => 
        m.id === id ? { ...m, learningState } : m
      )
    }
  }),
  
  'review/start': (state, { deck }) => ({
    ...state,
    review: {
      ...state.review,
      currentDeck: deck,
      dueCards: deck?.moves || [],
      currentCard: null,
      session: { cardsReviewed: 0, again: 0, hard: 0, good: 0, easy: 0 }
    }
  }),
  
  'review/rate': (state, { rating }) => {
    const { review } = state;
    const newSession = {
      ...review.session,
      cardsReviewed: review.session.cardsReviewed + 1,
      [rating]: (review.session[rating] || 0) + 1
    };
    // Move to next card - simplified for now
    const nextCard = review.dueCards[1] || null;
    return {
      ...state,
      review: {
        ...review,
        session: newSession,
        currentCard: nextCard,
        dueCards: review.dueCards.slice(1)
      }
    };
  },
  
  'settings/set-font': (state, { fontFamily }) => ({
    ...state,
    settings: { ...state.settings, fontFamily }
  }),
  
  'settings/add-category': (state, { category }) => ({
    ...state,
    settings: {
      ...state.settings,
      categories: [...(state.settings.categories || []), category]
    }
  })
};

// ═══════════════════════════════════════════════════
// DERIVED STATE - DOP lenses
// ═══════════════════════════════════════════════════

const derivedGetters = {
  movesFiltered: (state) => {
    const { filter, search, collection } = state.moves;
    return collection.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filter?.state && m.learningState !== filter.state) {
        return false;
      }
      if (filter?.category && m.category !== filter.category) {
        return false;
      }
      return true;
    });
  },
  
  movesByState: (state) => {
    const { collection } = state.moves;
    return {
      new: collection.filter(m => m.learningState === 'NEW'),
      learning: collection.filter(m => m.learningState === 'LEARNING'),
      review: collection.filter(m => m.learningState === 'REVIEW'),
      mastery: collection.filter(m => m.learningState === 'MASTERY')
    };
  },
  
  movesCount: (state) => state.moves.collection.length,
  
  dueCount: (state) => state.review.dueCards.length,
  
  reviewAccuracy: (state) => {
    const { session } = state.review;
    const total = session.again + session.hard + session.good + session.easy;
    if (total === 0) return 0;
    return Math.round((session.good + session.easy) / total * 100);
  },
  
  statsPeriod: (state) => state.stats.period,
  
  totalMoves: (state) => state.moves.collection.length,
  
  categories: (state) => {
    const cats = new Set(state.moves.collection.map(m => m.category).filter(Boolean));
    return Array.from(cats);
  }
};

// ═══════════════════════════════════════════════════
// STORE - Zustand with FRP pattern
// ═══════════════════════════════════════════════════

const useStore = create((set, get) => ({
  ...initialState,
  
  // Dispatch - main entry for state updates
  dispatch: (type, payload) => {
    const reducer = reducers[type];
    if (reducer) {
      set(state => reducer(state, payload));
    }
  },
  
  // Initialize app
  init: () => get().dispatch('app/initialize', {}),
  
  // Theme
  setTheme: (mode) => get().dispatch('theme/set', { theme: mode }),
  
  // Moves
  addMove: (name, category) => get().dispatch('moves/add', { name, category }),
  deleteMove: (id) => get().dispatch('moves/delete', { id }),
  selectMove: (id) => get().dispatch('moves/select', { id }),
  filterMoves: (filter) => get().dispatch('moves/filter', { filter }),
  searchMoves: (query) => get().dispatch('moves/search', { query }),
  updateMoveState: (id, learningState) => get().dispatch('moves/update-state', { id, learningState }),
  
  // Review
  startReview: (deck) => get().dispatch('review/start', { deck }),
  rateCard: (rating) => get().dispatch('review/rate', { rating }),
  
  // Settings
  setFont: (fontFamily) => get().dispatch('settings/set-font', { fontFamily }),
  addCategory: (category) => get().dispatch('settings/add-category', { category }),
  
  // Getters - derived state
  get movesFiltered() { return derivedGetters.movesFiltered(get()); },
  get movesByState() { return derivedGetters.movesByState(get()); },
  get movesCount() { return derivedGetters.movesCount(get()); },
  get dueCount() { return derivedGetters.dueCount(get()); },
  get reviewAccuracy() { return derivedGetters.reviewAccuracy(get()); },
  get categories() { return derivedGetters.categories(get()); }
}));

export { useStore, initialState, reducers, derivedGetters };
export default useStore;