// Root Machine Context — XState v5
// Provides all machine actors to the component tree via React context
// XState is the single orchestrator for all app state

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useMachine, useSelector } from "@xstate/react";

import {
  moveMachine,
  selectFilteredMoves,
  selectMovesByState,
  selectCategoryBreakdown,
} from "../machines/moveMachine";
import {
  reviewMachine,
  selectCurrentCard,
  selectSessionAccuracy,
  selectProgress,
} from "../machines/reviewMachine";
import { battleMachine } from "../machines/battleMachine";
import { labMachine, selectBoardColumns } from "../machines/labMachine";
import { flowMachine } from "../machines/flowMachine";
import { settingsMachine } from "../machines/settingsMachine";
import { comboMachine } from "../machines/comboMachine";
import { setMachine } from "../machines/setMachine";
import { light as carbonLight, dark as carbonDark } from "../carbon-tokens";

const THEME_COLORS = {
  light: {
    accent: carbonLight.buttonPrimary,
    secondary: carbonLight.textSecondary,
    background: carbonLight.background,
    separator: carbonLight.borderSubtle01,
    text: carbonLight.textPrimary,
    surface: carbonLight.layer01,
    fill: carbonLight.field01,
    success: carbonLight.supportSuccess,
    error: carbonLight.supportError,
    warning: carbonLight.supportWarning,
  },
  dark: {
    accent: carbonDark.buttonPrimary,
    secondary: carbonDark.textSecondary,
    background: carbonDark.background,
    separator: carbonDark.borderSubtle01,
    text: carbonDark.textPrimary,
    surface: carbonDark.layer01,
    fill: carbonDark.field01,
    success: carbonDark.supportSuccess,
    error: carbonDark.supportError,
    warning: carbonDark.supportWarning,
  },
} as const;

type ThemeColors = {
  accent: string;
  secondary: string;
  background: string;
  separator: string;
  text: string;
  surface: string;
  fill: string;
  success: string;
  error: string;
  warning: string;
};

// ── Context shape ──────────────────────────────────────────────────────────

type MachineContextValue = {
  moveActor: ReturnType<typeof useMachine<typeof moveMachine>>[1];
  reviewActor: ReturnType<typeof useMachine<typeof reviewMachine>>[1];
  battleActor: ReturnType<typeof useMachine<typeof battleMachine>>[1];
  labActor: ReturnType<typeof useMachine<typeof labMachine>>[1];
  flowActor: ReturnType<typeof useMachine<typeof flowMachine>>[1];
  settingsActor: ReturnType<typeof useMachine<typeof settingsMachine>>[1];
  comboActor: ReturnType<typeof useMachine<typeof comboMachine>>[1];
  setActor: ReturnType<typeof useMachine<typeof setMachine>>[1];

  moveSnap: ReturnType<typeof useMachine<typeof moveMachine>>[0];
  reviewSnap: ReturnType<typeof useMachine<typeof reviewMachine>>[0];
  battleSnap: ReturnType<typeof useMachine<typeof battleMachine>>[0];
  labSnap: ReturnType<typeof useMachine<typeof labMachine>>[0];
  flowSnap: ReturnType<typeof useMachine<typeof flowMachine>>[0];
  settingsSnap: ReturnType<typeof useMachine<typeof settingsMachine>>[0];
  comboSnap: ReturnType<typeof useMachine<typeof comboMachine>>[0];
  setSnap: ReturnType<typeof useMachine<typeof setMachine>>[0];

  colors: ThemeColors;
  theme: "light" | "dark";
  dbError: string | null;
};

const MachineContext = createContext<MachineContextValue | null>(null);

// ── Error Boundary ─────────────────────────────────────────────────────────

class DbErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error: error.message.includes("Database not initialized")
        ? "Database failed to load. Restart the app."
        : error.message,
    };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────

export function MachineProvider({ children }: { children: React.ReactNode }) {
  const [moveSnap, moveSend] = useMachine(moveMachine);
  const [reviewSnap, reviewSend] = useMachine(reviewMachine);
  const [battleSnap, battleSend] = useMachine(battleMachine);
  const [labSnap, labSend] = useMachine(labMachine);
  const [flowSnap, flowSend] = useMachine(flowMachine);
  const [settingsSnap, settingsSend] = useMachine(settingsMachine);
  const [comboSnap, comboSend] = useMachine(comboMachine);
  const [setSnap, setSend] = useMachine(setMachine);

  const [dbError, setDbError] = React.useState<string | null>(null);

  const movesRef = useRef(moveSnap.context.moves);
  useEffect(() => {
    movesRef.current = moveSnap.context.moves;
    flowSend({
      type: "SYNC_FROM_MOVES",
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

  useEffect(() => {
    battleSend({
      type: "LOAD_MOVES",
      moves: moveSnap.context.moves.filter((m) => !m.archivedAt),
    });
  }, [moveSnap.context.moves]);

  const theme = settingsSnap.context.themeMode;
  const colors = THEME_COLORS[theme] ?? THEME_COLORS.light;

  const value: MachineContextValue = {
    moveActor: moveSend,
    reviewActor: reviewSend,
    battleActor: battleSend,
    labActor: labSend,
    flowActor: flowSend,
    settingsActor: settingsSend,
    comboActor: comboSend,
    setActor: setSend,
    moveSnap,
    reviewSnap,
    battleSnap,
    labSnap,
    flowSnap,
    settingsSnap,
    comboSnap,
    setSnap,
    colors,
    theme,
    dbError,
  };

  return (
    <DbErrorBoundary
      fallback={
        <MachineContext.Provider value={value}>
          {children}
        </MachineContext.Provider>
      }
    >
      <MachineContext.Provider value={value}>
        {children}
      </MachineContext.Provider>
    </DbErrorBoundary>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useMachines() {
  const ctx = useContext(MachineContext);
  if (!ctx) throw new Error("useMachines must be used within MachineProvider");
  return ctx;
}

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
