// Flow Machine — XState v5
// Orchestrates the move flow graph: nodes, links, view modes, selection

import { createMachine, assign } from 'xstate';

export type FlowViewMode = 'map' | 'focus' | 'path';

export type FlowNode = {
  id: string;
  moveId: string;
  moveName: string;
  category: string | null;
  learningState: string;
  x: number;
  y: number;
};

export type FlowLink = {
  id: string;
  fromMoveId: string;
  toMoveId: string;
  preset: string | null;
};

export type FlowContext = {
  nodes: FlowNode[];
  links: FlowLink[];
  selectedNodeId: string | null;
  viewMode: FlowViewMode;
  focusMoveId: string | null;
  highlightedPath: string[];
  isDragging: boolean;
  dragNodeId: string | null;
};

type FlowEvent =
  | { type: 'LOAD_GRAPH'; nodes: FlowNode[]; links: FlowLink[] }
  | { type: 'SELECT_NODE'; nodeId: string }
  | { type: 'DESELECT_NODE' }
  | { type: 'SET_VIEW_MODE'; mode: FlowViewMode }
  | { type: 'SET_FOCUS_MOVE'; moveId: string }
  | { type: 'ADD_LINK'; fromMoveId: string; toMoveId: string; preset?: string }
  | { type: 'REMOVE_LINK'; id: string }
  | { type: 'START_DRAG'; nodeId: string }
  | { type: 'DRAG_NODE'; nodeId: string; x: number; y: number }
  | { type: 'END_DRAG' }
  | { type: 'SYNC_FROM_MOVES'; moves: Array<{ id: string; name: string; category: string | null; learningState: string }> };

export const flowMachine = createMachine(
  {
    id: 'flow',
    types: {} as {
      context: FlowContext;
      events: FlowEvent;
    },
    context: {
      nodes: [],
      links: [],
      selectedNodeId: null,
      viewMode: 'map',
      focusMoveId: null,
      highlightedPath: [],
      isDragging: false,
      dragNodeId: null,
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          LOAD_GRAPH: { actions: 'loadGraph' },
          SELECT_NODE: { actions: 'selectNode' },
          DESELECT_NODE: { actions: 'deselectNode' },
          SET_VIEW_MODE: { actions: 'setViewMode' },
          SET_FOCUS_MOVE: { actions: 'setFocusMove' },
          ADD_LINK: { actions: 'addLink' },
          REMOVE_LINK: { actions: 'removeLink' },
          SYNC_FROM_MOVES: { actions: 'syncFromMoves' },
          START_DRAG: {
            target: 'dragging',
            actions: 'startDrag',
          },
        },
      },
      dragging: {
        on: {
          DRAG_NODE: { actions: 'dragNode' },
          END_DRAG: {
            target: 'idle',
            actions: 'endDrag',
          },
        },
      },
    },
  },
  {
    actions: {
      loadGraph: assign({
        nodes: ({ event }) => (event.type === 'LOAD_GRAPH' ? event.nodes : []),
        links: ({ event }) => (event.type === 'LOAD_GRAPH' ? event.links : []),
      }),
      selectNode: assign({
        selectedNodeId: ({ event }) =>
          event.type === 'SELECT_NODE' ? event.nodeId : null,
      }),
      deselectNode: assign({ selectedNodeId: null }),
      setViewMode: assign({
        viewMode: ({ event }) =>
          event.type === 'SET_VIEW_MODE' ? event.mode : 'map',
      }),
      setFocusMove: assign({
        focusMoveId: ({ event }) =>
          event.type === 'SET_FOCUS_MOVE' ? event.moveId : null,
      }),
      addLink: assign({
        links: ({ context, event }) => {
          if (event.type !== 'ADD_LINK') return context.links;
          const exists = context.links.some(
            (l) => l.fromMoveId === event.fromMoveId && l.toMoveId === event.toMoveId
          );
          if (exists) return context.links;
          return [
            ...context.links,
            {
              id: crypto.randomUUID(),
              fromMoveId: event.fromMoveId,
              toMoveId: event.toMoveId,
              preset: event.preset ?? null,
            },
          ];
        },
      }),
      removeLink: assign({
        links: ({ context, event }) => {
          if (event.type !== 'REMOVE_LINK') return context.links;
          return context.links.filter((l) => l.id !== event.id);
        },
      }),
      syncFromMoves: assign({
        nodes: ({ context, event }) => {
          if (event.type !== 'SYNC_FROM_MOVES') return context.nodes;
          const existingById = new Map(context.nodes.map((n) => [n.moveId, n]));
          return event.moves.map((m, i) => {
            const existing = existingById.get(m.id);
            return existing
              ? { ...existing, moveName: m.name, category: m.category, learningState: m.learningState }
              : {
                  id: crypto.randomUUID(),
                  moveId: m.id,
                  moveName: m.name,
                  category: m.category,
                  learningState: m.learningState,
                  x: 80 + (i % 4) * 160,
                  y: 80 + Math.floor(i / 4) * 140,
                };
          });
        },
      }),
      startDrag: assign({
        isDragging: true,
        dragNodeId: ({ event }) =>
          event.type === 'START_DRAG' ? event.nodeId : null,
      }),
      dragNode: assign({
        nodes: ({ context, event }) => {
          if (event.type !== 'DRAG_NODE') return context.nodes;
          return context.nodes.map((n) =>
            n.id === event.nodeId ? { ...n, x: event.x, y: event.y } : n
          );
        },
      }),
      endDrag: assign({
        isDragging: false,
        dragNodeId: null,
      }),
    },
  }
);

// Pure selectors
export const selectNeighbors = (ctx: FlowContext, moveId: string): string[] => {
  const out = ctx.links
    .filter((l) => l.fromMoveId === moveId)
    .map((l) => l.toMoveId);
  const inc = ctx.links
    .filter((l) => l.toMoveId === moveId)
    .map((l) => l.fromMoveId);
  return [...new Set([...out, ...inc])];
};

export const selectNodeLinks = (ctx: FlowContext, nodeId: string): FlowLink[] =>
  ctx.links.filter((l) => l.fromMoveId === nodeId || l.toMoveId === nodeId);
