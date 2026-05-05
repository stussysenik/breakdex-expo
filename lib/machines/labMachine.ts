// Lab Machine — XState v5
// Orchestrates the Lab training space: projects, board, sets, quick log

import { createMachine, assign } from 'xstate';

export type LabStatus = 'idea' | 'attempting' | 'landed' | 'clean';
export type LabType = 'project' | 'set';
export type LabViewMode = 'projects' | 'board' | 'sets';

export const LAB_STATUS_LABELS: Record<LabStatus, string> = {
  idea: 'Idea',
  attempting: 'Attempting',
  landed: 'Landed',
  clean: 'Clean',
};

export const LAB_STATUS_COLORS: Record<LabStatus, string> = {
  idea: '#8B5CF6',
  attempting: '#F59E0B',
  landed: '#10B981',
  clean: '#3B82F6',
};

export type Lab = {
  id: string;
  name: string;
  type: LabType;
  status: LabStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LabEntry = {
  id: string;
  content: string;
  labId: string | null;
  createdAt: string;
};

export type LabContext = {
  labs: Lab[];
  entries: LabEntry[];
  viewMode: LabViewMode;
  selectedLabId: string | null;
  quickLogText: string;
  error: string | null;
};

type LabEvent =
  | { type: 'CREATE_LAB'; name: string; type: LabType }
  | { type: 'DELETE_LAB'; id: string }
  | { type: 'UPDATE_LAB'; id: string; updates: Partial<Lab> }
  | { type: 'SET_STATUS'; id: string; status: LabStatus }
  | { type: 'SELECT_LAB'; id: string }
  | { type: 'DESELECT_LAB' }
  | { type: 'SET_VIEW_MODE'; mode: LabViewMode }
  | { type: 'SET_QUICK_LOG'; text: string }
  | { type: 'SUBMIT_QUICK_LOG' }
  | { type: 'ADD_ENTRY'; content: string; labId?: string };

export const labMachine = createMachine(
  {
    id: 'lab',
    types: {} as {
      context: LabContext;
      events: LabEvent;
    },
    context: {
      labs: [],
      entries: [],
      viewMode: 'projects',
      selectedLabId: null,
      quickLogText: '',
      error: null,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          CREATE_LAB: { actions: 'createLab' },
          DELETE_LAB: { actions: 'deleteLab' },
          UPDATE_LAB: { actions: 'updateLab' },
          SET_STATUS: { actions: 'setStatus' },
          SELECT_LAB: { actions: 'selectLab' },
          DESELECT_LAB: { actions: 'deselectLab' },
          SET_VIEW_MODE: { actions: 'setViewMode' },
          SET_QUICK_LOG: { actions: 'setQuickLog' },
          SUBMIT_QUICK_LOG: { actions: 'submitQuickLog' },
          ADD_ENTRY: { actions: 'addEntry' },
        },
      },
    },
  },
  {
    actions: {
      createLab: assign({
        labs: ({ context, event }) => {
          if (event.type !== 'CREATE_LAB') return context.labs;
          const now = new Date().toISOString();
          const lab: Lab = {
            id: crypto.randomUUID(),
            name: event.name,
            type: event.type,
            status: 'idea',
            notes: null,
            createdAt: now,
            updatedAt: now,
          };
          return [lab, ...context.labs];
        },
      }),
      deleteLab: assign({
        labs: ({ context, event }) => {
          if (event.type !== 'DELETE_LAB') return context.labs;
          return context.labs.filter((l) => l.id !== event.id);
        },
        selectedLabId: ({ context, event }) => {
          if (event.type !== 'DELETE_LAB') return context.selectedLabId;
          return context.selectedLabId === event.id ? null : context.selectedLabId;
        },
      }),
      updateLab: assign({
        labs: ({ context, event }) => {
          if (event.type !== 'UPDATE_LAB') return context.labs;
          return context.labs.map((l) =>
            l.id === event.id
              ? { ...l, ...event.updates, updatedAt: new Date().toISOString() }
              : l
          );
        },
      }),
      setStatus: assign({
        labs: ({ context, event }) => {
          if (event.type !== 'SET_STATUS') return context.labs;
          return context.labs.map((l) =>
            l.id === event.id
              ? { ...l, status: event.status, updatedAt: new Date().toISOString() }
              : l
          );
        },
      }),
      selectLab: assign({
        selectedLabId: ({ event }) =>
          event.type === 'SELECT_LAB' ? event.id : null,
      }),
      deselectLab: assign({ selectedLabId: null }),
      setViewMode: assign({
        viewMode: ({ event }) =>
          event.type === 'SET_VIEW_MODE' ? event.mode : 'projects',
      }),
      setQuickLog: assign({
        quickLogText: ({ event }) =>
          event.type === 'SET_QUICK_LOG' ? event.text : '',
      }),
      submitQuickLog: assign({
        entries: ({ context }) => {
          if (!context.quickLogText.trim()) return context.entries;
          const entry: LabEntry = {
            id: crypto.randomUUID(),
            content: context.quickLogText.trim(),
            labId: context.selectedLabId,
            createdAt: new Date().toISOString(),
          };
          return [entry, ...context.entries];
        },
        quickLogText: '',
      }),
      addEntry: assign({
        entries: ({ context, event }) => {
          if (event.type !== 'ADD_ENTRY') return context.entries;
          const entry: LabEntry = {
            id: crypto.randomUUID(),
            content: event.content,
            labId: event.labId ?? null,
            createdAt: new Date().toISOString(),
          };
          return [entry, ...context.entries];
        },
      }),
    },
  }
);

// Pure selectors
export const selectLabsByType = (labs: Lab[], type: LabType): Lab[] =>
  labs.filter((l) => l.type === type);

export const selectLabsByStatus = (labs: Lab[], status: LabStatus): Lab[] =>
  labs.filter((l) => l.status === status);

export const selectBoardColumns = (
  labs: Lab[]
): Record<LabStatus, Lab[]> => ({
  idea: selectLabsByStatus(labs, 'idea'),
  attempting: selectLabsByStatus(labs, 'attempting'),
  landed: selectLabsByStatus(labs, 'landed'),
  clean: selectLabsByStatus(labs, 'clean'),
});
