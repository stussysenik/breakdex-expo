import { create } from 'zustand';
// import { getAllMoves, insertMove as dbInsertMove, updateMove as dbUpdateMove, deleteMove as dbDeleteMove, archiveMove as dbArchiveMove, restoreMove as dbRestoreMove } from '../database';

export interface Move {
  id: string;
  name: string;
  learningState: 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERY';
  category: string;
  videoPath: string | null;
  originalVideoName: string | null;
  notes: string | null;
  createdAt: string;
  archivedAt: string | null;
  archiveReason: string | null;
}

interface MoveState {
  moves: Move[];
  isLoading: boolean;
  loadMoves: () => Promise<void>;
  addMove: (move: Omit<Move, 'id' | 'createdAt' | 'archivedAt' | 'archiveReason'>) => Promise<void>;
  updateMove: (id: string, updates: Partial<Move>) => Promise<void>;
  deleteMove: (id: string) => Promise<void>;
  archiveMove: (id: string, reason: string) => Promise<void>;
  restoreMove: (id: string) => Promise<void>;
  setMoves: (moves: Move[]) => void;
}

export const useMoveStore = create<MoveState>((set) => ({
  moves: [],
  isLoading: false,
  
  loadMoves: async () => {
    set({ isLoading: true });
    // TODO: Re-enable database when expo-sqlite is fixed
    // const moves = await getAllMoves();
    set({ isLoading: false });
  },
  
  addMove: async (move) => {
    const newMove = {
      ...move,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      archivedAt: null,
      archiveReason: null,
    };
    // await dbInsertMove(newMove);
    set((state) => ({
      moves: [newMove, ...state.moves],
    }));
  },
  
  updateMove: async (id, updates) => {
    // await dbUpdateMove(id, updates);
    set((state) => ({
      moves: state.moves.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },
  
  deleteMove: async (id) => {
    // await dbDeleteMove(id);
    set((state) => ({
      moves: state.moves.filter((m) => m.id !== id),
    }));
  },
  
  archiveMove: async (id, reason) => {
    // await dbArchiveMove(id, reason);
    const now = new Date().toISOString();
    set((state) => ({
      moves: state.moves.map((m) =>
        m.id === id
          ? { ...m, archivedAt: now, archiveReason: reason }
          : m
      ),
    }));
  },
  
  restoreMove: async (id) => {
    // await dbRestoreMove(id);
    set((state) => ({
      moves: state.moves.map((m) =>
        m.id === id ? { ...m, archivedAt: null, archiveReason: null } : m
      ),
    }));
  },
  
  setMoves: (moves) => set({ moves }),
}));