// Combo Machine — XState v5
// Orchestrates combo (sequence) creation, editing, and detail view
// Persists to SQLite DAG entity graph with typed edges

import { createMachine, assign, fromPromise } from "xstate";
import { Move } from "./moveMachine";
import {
  getAllEntities,
  insertEntity,
  deleteEntity,
  getEdgesForParent,
  insertEdge,
  deleteEdgesForParent,
  type EntityRow,
} from "../database";

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
  | { type: "CREATE_COMBO"; name: string; moveIds: string[]; notes?: string }
  | { type: "DELETE_COMBO"; id: string }
  | { type: "SELECT_COMBO"; id: string }
  | { type: "DESELECT_COMBO" }
  | { type: "ADD_DRAFT_MOVE"; moveId: string }
  | { type: "REMOVE_DRAFT_MOVE"; moveId: string }
  | { type: "REORDER_DRAFT_MOVES"; moveIds: string[] }
  | { type: "SET_DRAFT_NAME"; name: string }
  | { type: "SET_DRAFT_NOTES"; notes: string }
  | { type: "COMMIT_DRAFT" }
  | { type: "CLEAR_DRAFT" }
  | { type: "SET_ACTIVE_STEP"; index: number };

function loadCombosWithEdges(): Combo[] {
  const rows = getAllEntities("combo");
  return rows.map((row) => {
    const edges = getEdgesForParent(row.id);
    const moveIds = edges
      .filter((e) => e.relation_type === "contains")
      .sort((a, b) => a.position - b.position)
      .map((e) => e.child_id);
    return {
      id: row.id,
      name: row.name,
      notes: (JSON.parse(row.data).notes as string) ?? null,
      moveIds,
      createdAt: row.created_at,
    };
  });
}

export const comboMachine = createMachine(
  {
    id: "combo",
    types: {} as {
      context: ComboContext;
      events: ComboEvent;
    },
    context: {
      combos: [],
      selectedComboId: null,
      draftMoveIds: [],
      draftName: "",
      draftNotes: "",
      activeStepIndex: 0,
      error: null,
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "loadCombos",
          onDone: {
            target: "idle",
            actions: assign({
              combos: ({ event }) => event.output as Combo[],
            }),
          },
          onError: {
            target: "error",
            actions: assign({
              error: ({ event }) =>
                `Failed to load combos: ${(event.error as Error).message}`,
            }),
          },
        },
      },
      idle: {
        on: {
          CREATE_COMBO: { actions: ["createCombo", "persistCreateCombo"] },
          DELETE_COMBO: { actions: ["deleteCombo", "persistDeleteCombo"] },
          SELECT_COMBO: { actions: "selectCombo" },
          DESELECT_COMBO: { actions: "deselectCombo" },
          ADD_DRAFT_MOVE: { actions: "addDraftMove" },
          REMOVE_DRAFT_MOVE: { actions: "removeDraftMove" },
          REORDER_DRAFT_MOVES: { actions: "reorderDraftMoves" },
          SET_DRAFT_NAME: { actions: "setDraftName" },
          SET_DRAFT_NOTES: { actions: "setDraftNotes" },
          COMMIT_DRAFT: { actions: ["commitDraft", "persistCommitDraft"] },
          CLEAR_DRAFT: { actions: "clearDraft" },
          SET_ACTIVE_STEP: { actions: "setActiveStep" },
        },
      },
      error: {
        on: {
          CREATE_COMBO: { actions: ["createCombo", "persistCreateCombo"], target: "idle" },
        },
      },
    },
  },
  {
    actors: {
      loadCombos: fromPromise(async () => loadCombosWithEdges()),
    },
    actions: {
      createCombo: assign({
        combos: ({ context, event }) => {
          if (event.type !== "CREATE_COMBO") return context.combos;
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
      persistCreateCombo: ({ context }) => {
        const combo = context.combos[0];
        if (!combo) return;
        try {
          insertEntity(combo.id, "combo", combo.name, {
            notes: combo.notes,
          });
          combo.moveIds.forEach((moveId, i) => {
            insertEdge(
              crypto.randomUUID(),
              combo.id,
              moveId,
              "contains",
              i,
            );
          });
        } catch (e) {
          console.error("persistCreateCombo failed:", e);
        }
      },

      deleteCombo: assign({
        combos: ({ context, event }) => {
          if (event.type !== "DELETE_COMBO") return context.combos;
          return context.combos.filter((c) => c.id !== event.id);
        },
        selectedComboId: ({ context, event }) => {
          if (event.type !== "DELETE_COMBO") return context.selectedComboId;
          return context.selectedComboId === event.id
            ? null
            : context.selectedComboId;
        },
      }),
      persistDeleteCombo: ({ event }) => {
        if (event.type !== "DELETE_COMBO") return;
        try {
          deleteEntity(event.id);
        } catch (e) {
          console.error("persistDeleteCombo failed:", e);
        }
      },

      selectCombo: assign({
        selectedComboId: ({ event }) =>
          event.type === "SELECT_COMBO" ? event.id : null,
      }),
      deselectCombo: assign({ selectedComboId: null }),

      addDraftMove: assign({
        draftMoveIds: ({ context, event }) => {
          if (event.type !== "ADD_DRAFT_MOVE") return context.draftMoveIds;
          return [...context.draftMoveIds, event.moveId];
        },
      }),

      removeDraftMove: assign({
        draftMoveIds: ({ context, event }) => {
          if (event.type !== "REMOVE_DRAFT_MOVE") return context.draftMoveIds;
          const idx = context.draftMoveIds.lastIndexOf(event.moveId);
          if (idx === -1) return context.draftMoveIds;
          return [
            ...context.draftMoveIds.slice(0, idx),
            ...context.draftMoveIds.slice(idx + 1),
          ];
        },
      }),

      reorderDraftMoves: assign({
        draftMoveIds: ({ event }) =>
          event.type === "REORDER_DRAFT_MOVES" ? event.moveIds : [],
      }),

      setDraftName: assign({
        draftName: ({ event }) =>
          event.type === "SET_DRAFT_NAME" ? event.name : "",
      }),

      setDraftNotes: assign({
        draftNotes: ({ event }) =>
          event.type === "SET_DRAFT_NOTES" ? event.notes : "",
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
        draftName: "",
        draftNotes: "",
      }),
      persistCommitDraft: ({ context }) => {
        const combo = context.combos[0];
        if (!combo) return;
        try {
          insertEntity(combo.id, "combo", combo.name, {
            notes: combo.notes,
          });
          combo.moveIds.forEach((moveId, i) => {
            insertEdge(
              crypto.randomUUID(),
              combo.id,
              moveId,
              "contains",
              i,
            );
          });
        } catch (e) {
          console.error("persistCommitDraft failed:", e);
        }
      },

      clearDraft: assign({
        draftMoveIds: [],
        draftName: "",
        draftNotes: "",
      }),

      setActiveStep: assign({
        activeStepIndex: ({ event }) =>
          event.type === "SET_ACTIVE_STEP" ? event.index : 0,
      }),
    },
  },
);
