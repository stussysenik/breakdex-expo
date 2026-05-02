// Root Machine Context — XState v5
// Provides all machine actors to the component tree via React context
// XState is the single orchestrator for all app state

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useMachine, useSelector } from '@xstate/react';
import { AnyActorRef } from 'xstate';

import { moveMachine, selectFilteredMoves, selectMovesByState, selectCategoryBreakdown } from '../machines/moveMachine';
import { reviewMachine, selectCurrentCard, selectSessionAccuracy, selectProgress } from '../machines/reviewMachine';
import { battleMachine } from '../machines/battleMachine';
import { labMachine, selectBoardColumns } from '../machines/labMachine';
import { flowMachine } from '../machines/flowMachine';
import { settingsMachine } from '../machines/settingsMachine';
import { comboMachine } from '../machines/comboMachine';
import { makeDefaultCard } from '../kernel/fsrs';
import { tokens } from '../design/tokens';

// ── Context shape ──────────────────────────────────────────────────────────

type MachineContextValue = {
  // Actors (send events to these)
  moveActor: ReturnType<typeof useMachine<typeof moveMachine>>[1];
  reviewActor: ReturnType<typeof useMachine<typeof reviewMachine>>[1];
  battleActor: ReturnType<typeof useMachine<typeof battleMachine>>[1];
  labActor: ReturnType<typeof useMachine<typeof labMachine>>[1];
  flowActor: ReturnType<typeof useMachine<typeof flowMachine>>[1];
  settingsActor: ReturnType<typeof useMachine<typeof settingsMachine>>[1];
  comboActor: ReturnType<typeof useMachine<typeof comboMachine>>[1];

  // Snapshots (current state)
  moveSnap: ReturnType<typeof useMachine<typeof moveMachine>>[0];
  reviewSnap: ReturnType<typeof useMachine<typeof reviewMachine>>[0];
  battleSnap: ReturnType<typeof useMachine<typeof battleMachine>>[0];
  labSnap: ReturnType<typeof useMachine<typeof labMachine>>[0];
  flowSnap: ReturnType<typeof useMachine<typeof flowMachine>>[0];
  settingsSnap: ReturnType<typeof useMachine<typeof settingsMachine>>[0];
  comboSnap: ReturnType<typeof useMachine<typeof comboMachine>>[0];

  // Derived helpers
  colors: typeof tokens.colors.light;
  theme: 'light' | 'dark';
};

const MachineContext = createContext<MachineContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [moveSnap, moveSend] = useMachine(moveMachine);
  const [reviewSnap, reviewSend] = useMachine(reviewMachine);
  const [battleSnap, battleSend] = useMachine(battleMachine);
  const [labSnap, labSend] = useMachine(labMachine);
  const [flowSnap, flowSend] = useMachine(flowMachine);
  const [settingsSnap, settingsSend] = useMachine(settingsMachine);
  const [comboSnap, comboSend] = useMachine(comboMachine);

  // Sync moves to flow graph whenever moves change
  const movesRef = useRef(moveSnap.context.moves);
  useEffect(() => {
    movesRef.current = moveSnap.context.moves;
    flowSend({
      type: 'SYNC_FROM_MOVES',
      moves: moveSnap.context.moves
        .filter((m) => !m.archivedAt)
        .map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          learningState: m.learningState,
        })),
    });
  }, [moveSnap.context.moves]);

  // Sync moves to battle actor
  useEffect(() => {
    battleSend({
      type: 'LOAD_MOVES',
      moves: moveSnap.context.moves.filter((m) => !m.archivedAt),
    });
  }, [moveSnap.context.moves]);

  const theme = settingsSnap.context.themeMode;
  const colors = tokens.colors[theme] ?? tokens.colors.light;

  const value: MachineContextValue = {
    moveActor: moveSend,
    reviewActor: reviewSend,
    battleActor: battleSend,
    labActor: labSend,
    flowActor: flowSend,
    settingsActor: settingsSend,
    comboActor: comboSend,
    moveSnap,
    reviewSnap,
    battleSnap,
    labSnap,
    flowSnap,
    settingsSnap,
    comboSnap,
    colors,
    theme,
  };

  return <MachineContext.Provider value={value}>{children}</MachineContext.Provider>;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useMachines() {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error('useMachines must be used within MachineProvider');
  return ctx;
}

// Convenience selector hooks that re-render only when derived value changes

export function useColors() {
  return useMachines().colors;
}

export function useTheme() {
  return useMachines().theme;
}

export function useFilteredMoves() {
  const { moveSnap } = useMachines();
  return selectFilteredMoves(moveSnap.context);
}

export function useMovesByState() {
  const { moveSnap } = useMachines();
  return selectMovesByState(moveSnap.context);
}

export function useCategoryBreakdown() {
  const { moveSnap } = useMachines();
  return selectCategoryBreakdown(moveSnap.context);
}

export function useCurrentReviewCard() {
  const { reviewSnap } = useMachines();
  return selectCurrentCard(reviewSnap.context);
}

export function useSessionAccuracy() {
  const { reviewSnap } = useMachines();
  return selectSessionAccuracy(reviewSnap.context);
}

export function useReviewProgress() {
  const { reviewSnap } = useMachines();
  return selectProgress(reviewSnap.context);
}

export function useBoardColumns() {
  const { labSnap } = useMachines();
  return selectBoardColumns(labSnap.context.labs);
}
