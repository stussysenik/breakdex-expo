// Set Machine — XState v5
// Orchestrates Set CRUD: load sets from DB, create, add/remove entities, delete
// Sets are container entities that hold moves and combos via edges

import { createMachine, assign, fromPromise } from "xstate";
import {
  getAllEntities,
  insertEntity,
  deleteEntity,
  updateEntity,
  getEdgesForParent,
  insertEdge,
  deleteEdge,
  type EntityRow,
} from "../database";

export type SetEntity = {
  id: string;
  name: string;
  moveIds: string[];
  comboIds: string[];
  createdAt: string;
};

export type SetContext = {
  sets: SetEntity[];
  selectedSetId: string | null;
  error: string | null;
};

type SetEvent =
  | { type: "CREATE_SET"; name: string }
  | { type: "DELETE_SET"; id: string }
  | { type: "SELECT_SET"; id: string }
  | { type: "DESELECT_SET" }
  | { type: "ADD_ENTITY"; setId: string; entityId: string; entityType: "move" | "combo" }
  | { type: "REMOVE_ENTITY"; setId: string; entityId: string };

function loadSets(): SetEntity[] {
  const rows = getAllEntities("set");
  return rows.map((row) => {
    const edges = getEdgesForParent(row.id);
    const moveIds: string[] = [];
    const comboIds: string[] = [];
    for (const e of edges) {
      if (e.relation_type !== "contains") continue;
      const childRow = getAllEntities().find((r) => r.id === e.child_id);
      if (childRow?.type === "move") moveIds.push(e.child_id);
      else if (childRow?.type === "combo") comboIds.push(e.child_id);
    }
    return {
      id: row.id,
      name: row.name,
      moveIds,
      comboIds,
      createdAt: row.created_at,
    };
  });
}

export const setMachine = createMachine(
  {
    id: "sets",
    types: {} as {
      context: SetContext;
      events: SetEvent;
    },
    context: {
      sets: [],
      selectedSetId: null,
      error: null,
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "loadSets",
          onDone: {
            target: "idle",
            actions: assign({
              sets: ({ event }) => event.output as SetEntity[],
            }),
          },
          onError: {
            target: "idle",
            actions: assign({
              error: ({ event }) =>
                `Failed to load sets: ${(event.error as Error).message}`,
            }),
          },
        },
      },
      idle: {
        on: {
          CREATE_SET: { actions: ["createSet", "persistCreateSet"] },
          DELETE_SET: { actions: ["deleteSet", "persistDeleteSet"] },
          SELECT_SET: { actions: "selectSet" },
          DESELECT_SET: { actions: "deselectSet" },
          ADD_ENTITY: { actions: ["addEntity", "persistAddEntity"] },
          REMOVE_ENTITY: { actions: ["removeEntity", "persistRemoveEntity"] },
        },
      },
    },
  },
  {
    actors: {
      loadSets: fromPromise(async () => loadSets()),
    },
    actions: {
      createSet: assign({
        sets: ({ context, event }) => {
          if (event.type !== "CREATE_SET") return context.sets;
          const set: SetEntity = {
            id: crypto.randomUUID(),
            name: event.name,
            moveIds: [],
            comboIds: [],
            createdAt: new Date().toISOString(),
          };
          return [set, ...context.sets];
        },
      }),
      persistCreateSet: ({ context }) => {
        const set = context.sets[0];
        if (!set) return;
        try {
          insertEntity(set.id, "set", set.name);
        } catch (e) {
          console.error("persistCreateSet failed:", e);
        }
      },

      deleteSet: assign({
        sets: ({ context, event }) => {
          if (event.type !== "DELETE_SET") return context.sets;
          return context.sets.filter((s) => s.id !== event.id);
        },
        selectedSetId: ({ context, event }) => {
          if (event.type !== "DELETE_SET") return context.selectedSetId;
          return context.selectedSetId === event.id
            ? null
            : context.selectedSetId;
        },
      }),
      persistDeleteSet: ({ event }) => {
        if (event.type !== "DELETE_SET") return;
        try {
          deleteEntity(event.id);
        } catch (e) {
          console.error("persistDeleteSet failed:", e);
        }
      },

      selectSet: assign({
        selectedSetId: ({ event }) =>
          event.type === "SELECT_SET" ? event.id : null,
      }),
      deselectSet: assign({ selectedSetId: null }),

      addEntity: assign({
        sets: ({ context, event }) => {
          if (event.type !== "ADD_ENTITY") return context.sets;
          return context.sets.map((s) => {
            if (s.id !== event.setId) return s;
            if (event.entityType === "move" && !s.moveIds.includes(event.entityId)) {
              return { ...s, moveIds: [...s.moveIds, event.entityId] };
            }
            if (event.entityType === "combo" && !s.comboIds.includes(event.entityId)) {
              return { ...s, comboIds: [...s.comboIds, event.entityId] };
            }
            return s;
          });
        },
      }),
      persistAddEntity: ({ event }) => {
        if (event.type !== "ADD_ENTITY") return;
        try {
          insertEdge(
            crypto.randomUUID(),
            event.setId,
            event.entityId,
            "contains",
          );
        } catch (e) {
          console.error("persistAddEntity failed:", e);
        }
      },

      removeEntity: assign({
        sets: ({ context, event }) => {
          if (event.type !== "REMOVE_ENTITY") return context.sets;
          return context.sets.map((s) => {
            if (s.id !== event.setId) return s;
            return {
              ...s,
              moveIds: s.moveIds.filter((id) => id !== event.entityId),
              comboIds: s.comboIds.filter((id) => id !== event.entityId),
            };
          });
        },
      }),
      persistRemoveEntity: ({ event }) => {
        if (event.type !== "REMOVE_ENTITY") return;
        try {
          const edges = getEdgesForParent(event.setId);
          const edge = edges.find(
            (e) =>
              e.child_id === event.entityId &&
              e.relation_type === "contains",
          );
          if (edge) deleteEdge(edge.id);
        } catch (e) {
          console.error("persistRemoveEntity failed:", e);
        }
      },
    },
  },
);
