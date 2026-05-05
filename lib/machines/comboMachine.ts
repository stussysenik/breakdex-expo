// Combo Machine — XState v5
// Orchestrates combo (sequence) creation, editing, and detail view

import { createMachine, assign } from 'xstate';
import { Move } from './moveMachine';

export type Combo = {
  id: string;
  name: string;
  notes: string | null;
  moveIds: string[];
  createdAt: string;
};

export type ComboContext = {
  combos: Combo[];
  selectedComboId: string | null;
  draftMoveIds: string[];
  draftName: string;
  draftNotes: string;
  activeStepIndex: number;
  error: string | null;
};

type ComboEvent =
  | { type: 'CREATE_COMBO'; name: string; moveIds: string[]; notes?: string }
  | { type: 'DELETE_COMBO'; id: string }
  | { type: 'UPDATE_COMBO'; id: string; updates: Partial<Combo> }
  | { type: 'SELECT_COMBO'; id: string }
  | { type: 'DESELECT_COMBO' }
  | { type: 'ADD_DRAFT_MOVE'; moveId: string }
  | { type: 'REMOVE_DRAFT_MOVE'; moveId: string }
  | { type: 'REORDER_DRAFT_MOVES'; moveIds: string[] }
  | { type: 'SET_DRAFT_NAME'; name: string }
  | { type: 'SET_DRAFT_NOTES'; notes: string }
  | { type: 'COMMIT_DRAFT' }
  | { type: 'CLEAR_DRAFT' }
  | { type: 'SET_ACTIVE_STEP'; index: number };

export const comboMachine = createMachine(
  {
    id: 'combo',
    types: {} as {
      context: ComboContext;
      events: ComboEvent;
    },
    context: {
      combos: [],
      selectedComboId: null,
      draftMoveIds: [],
      draftName: '',
      draftNotes: '',
      activeStepIndex: 0,
      error: null,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          CREATE_COMBO: { actions: 'createCombo' },
          DELETE_COMBO: { actions: 'deleteCombo' },
          UPDATE_COMBO: { actions: 'updateCombo' },
          SELECT_COMBO: { actions: 'selectCombo' },
          DESELECT_COMBO: { actions: 'deselectCombo' },
          ADD_DRAFT_MOVE: { actions: 'addDraftMove' },
          REMOVE_DRAFT_MOVE: { actions: 'removeDraftMove' },
          REORDER_DRAFT_MOVES: { actions: 'reorderDraftMoves' },
          SET_DRAFT_NAME: { actions: 'setDraftName' },
          SET_DRAFT_NOTES: { actions: 'setDraftNotes' },
          COMMIT_DRAFT: { actions: 'commitDraft' },
          CLEAR_DRAFT: { actions: 'clearDraft' },
          SET_ACTIVE_STEP: { actions: 'setActiveStep' },
        },
      },
    },
  },
  {
    actions: {
      createCombo: assign({
        combos: ({ context, event }) => {
          if (event.type !== 'CREATE_COMBO') return context.combos;
          const combo: Combo = {
            id: crypto.randomUUID(),
            name: event.name,
            notes: event.notes ?? null,
            moveIds: event.moveIds,
            createdAt: new Date().toISOString(),
          };
          return [combo, ...context.combos];
        },
      }),
      deleteCombo: assign({
        combos: ({ context, event }) => {
          if (event.type !== 'DELETE_COMBO') return context.combos;
          return context.combos.filter((c) => c.id !== event.id);
        },
        selectedComboId: ({ context, event }) => {
          if (event.type !== 'DELETE_COMBO') return context.selectedComboId;
          return context.selectedComboId === event.id ? null : context.selectedComboId;
        },
      }),
      updateCombo: assign({
        combos: ({ context, event }) => {
          if (event.type !== 'UPDATE_COMBO') return context.combos;
          return context.combos.map((c) =>
            c.id === event.id ? { ...c, ...event.updates } : c
          );
        },
      }),
      selectCombo: assign({
        selectedComboId: ({ event }) =>
          event.type === 'SELECT_COMBO' ? event.id : null,
      }),
      deselectCombo: assign({ selectedComboId: null }),
      addDraftMove: assign({
        draftMoveIds: ({ context, event }) => {
          if (event.type !== 'ADD_DRAFT_MOVE') return context.draftMoveIds;
          return [...context.draftMoveIds, event.moveId];
        },
      }),
      removeDraftMove: assign({
        draftMoveIds: ({ context, event }) => {
          if (event.type !== 'REMOVE_DRAFT_MOVE') return context.draftMoveIds;
          const idx = context.draftMoveIds.lastIndexOf(event.moveId);
          if (idx === -1) return context.draftMoveIds;
          return [...context.draftMoveIds.slice(0, idx), ...context.draftMoveIds.slice(idx + 1)];
        },
      }),
      reorderDraftMoves: assign({
        draftMoveIds: ({ event }) =>
          event.type === 'REORDER_DRAFT_MOVES' ? event.moveIds : [],
      }),
      setDraftName: assign({
        draftName: ({ event }) =>
          event.type === 'SET_DRAFT_NAME' ? event.name : '',
      }),
      setDraftNotes: assign({
        draftNotes: ({ event }) =>
          event.type === 'SET_DRAFT_NOTES' ? event.notes : '',
      }),
      commitDraft: assign({
        combos: ({ context }) => {
          if (!context.draftName.trim() || context.draftMoveIds.length === 0)
            return context.combos;
          const combo: Combo = {
            id: crypto.randomUUID(),
            name: context.draftName.trim(),
            notes: context.draftNotes || null,
            moveIds: context.draftMoveIds,
            createdAt: new Date().toISOString(),
          };
          return [combo, ...context.combos];
        },
        draftMoveIds: [],
        draftName: '',
        draftNotes: '',
      }),
      clearDraft: assign({
        draftMoveIds: [],
        draftName: '',
        draftNotes: '',
      }),
      setActiveStep: assign({
        activeStepIndex: ({ event }) =>
          event.type === 'SET_ACTIVE_STEP' ? event.index : 0,
      }),
    },
  }
);
