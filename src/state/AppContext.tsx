import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type TaskBase = {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
};

type TaskProblem = TaskBase & {
  type: "problem";
};

type TaskChapter = TaskBase & {
  type: "chapter";
  pagesTotal: number;
  pagesDone: number;
};

type TaskVideo = TaskBase & {
  type: "video";
  url?: string;
};

type Task = TaskProblem | TaskChapter | TaskVideo;

type Stage = {
  id: string;
  title: string;
  tasks: Task[];
  deadline?: string; // ISO date string
};

type DiaryEntry = {
  id: string;
  date: string;
  hours: number;
  text: string;
};

type PlanState = { stages: Stage[] };

type MotivationState = {
  quote: string;
  diary: DiaryEntry[];
  why: string;
};

type StatsState = {
  totalTasks: number;
  solvedTasks: number;
  totalHours: number;
  streakDays: number;
};

type AppState = {
  user?: { id?: string; name?: string };
  plan: PlanState;
  motivation: MotivationState;
  stats: StatsState;
};

type AppActions = {
  addStage: (title: string) => void;
  removeStage: (stageId: string) => void;
  setStageDeadline: (stageId: string, deadline: string | undefined) => void;
  addTask: (
    stageId: string,
    task:
      | { type: "problem"; title: string }
      | { type: "chapter"; title: string; pagesTotal: number }
      | { type: "video"; title: string; url?: string }
  ) => void;
  removeTask: (stageId: string, taskId: string) => void;
  toggleTask: (stageId: string, taskId: string, completed: boolean) => void;
  updateChapterProgress: (
    stageId: string,
    taskId: string,
    pagesDone: number
  ) => void;
  setQuote: (q: string) => void;
  addDiaryEntry: (payload: { hours: number; text: string }) => void;
  updateDiaryEntry: (
    entryId: string,
    payload: { hours: number; text: string }
  ) => void;
  removeDiaryEntry: (entryId: string) => void;
  resetAll: () => void;
  exportData: () => void;
  importData: (data: AppState) => void;
};

const AppContext = createContext<{
  state: AppState;
  actions: AppActions;
} | null>(null);

const STORAGE_KEY = "shad-prep-app-state-v2";

const demoState: AppState = {
  plan: {
    stages: [],
  },
  motivation: {
    quote: "ШАД — это инвестиция в себя. Продолжай!",
    diary: [],
    why: "",
  },
  stats: {
    totalTasks: 0,
    solvedTasks: 0,
    totalHours: 0,
    streakDays: 0,
  },
};

// UUID generator fallback for environments without crypto.randomUUID
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoState;
    const parsed = JSON.parse(raw) as AppState;
    return parsed;
  } catch {
    return demoState;
  }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const actions = useMemo<AppActions>(
    () => ({
      addStage: (title) =>
        setState((s) => ({
          ...s,
          plan: {
            stages: [
              ...s.plan.stages,
              { id: generateUUID(), title, tasks: [] },
            ],
          },
        })),
      removeStage: (stageId) =>
        setState((s) => ({
          ...s,
          plan: { stages: s.plan.stages.filter((st) => st.id !== stageId) },
        })),
      setStageDeadline: (stageId, deadline) =>
        setState((s) => ({
          ...s,
          plan: {
            stages: s.plan.stages.map((st) =>
              st.id === stageId ? { ...st, deadline } : st
            ),
          },
        })),
      addTask: (stageId, payload) =>
        setState((s) => ({
          ...s,
          plan: {
            stages: s.plan.stages.map((st) =>
              st.id === stageId
                ? {
                    ...st,
                    tasks: [
                      ...st.tasks,
                      ((): Task => {
                        if (payload.type === "chapter") {
                          return {
                            id: generateUUID(),
                            type: "chapter",
                            title: payload.title,
                            pagesTotal: Math.max(
                              1,
                              Math.floor(payload.pagesTotal)
                            ),
                            pagesDone: 0,
                            completed: false,
                          };
                        }
                        if (payload.type === "video") {
                          return {
                            id: generateUUID(),
                            type: "video",
                            title: payload.title,
                            url: payload.url,
                            completed: false,
                          };
                        }
                        return {
                          id: generateUUID(),
                          type: "problem",
                          title: payload.title,
                          completed: false,
                        };
                      })(),
                    ],
                  }
                : st
            ),
          },
        })),
      removeTask: (stageId, taskId) =>
        setState((s) => ({
          ...s,
          plan: {
            stages: s.plan.stages.map((st) =>
              st.id === stageId
                ? { ...st, tasks: st.tasks.filter((t) => t.id !== taskId) }
                : st
            ),
          },
        })),
      toggleTask: (stageId, taskId, completed) =>
        setState((s) => {
          const nextStages = s.plan.stages.map((st) =>
            st.id === stageId
              ? {
                  ...st,
                  tasks: st.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          completed,
                          completedAt: completed
                            ? new Date().toISOString()
                            : undefined,
                        }
                      : t
                  ),
                }
              : st
          );
          const solved = nextStages.reduce(
            (acc, st) => acc + st.tasks.filter((t) => t.completed).length,
            0
          );
          const streakDays = computeStreakDays(s.motivation.diary, nextStages);
          return {
            ...s,
            plan: { stages: nextStages },
            stats: { ...s.stats, solvedTasks: solved, streakDays },
          };
        }),
      updateChapterProgress: (stageId, taskId, pagesDone) =>
        setState((s) => {
          const next = s.plan.stages.map((st) =>
            st.id === stageId
              ? {
                  ...st,
                  tasks: st.tasks.map((t) =>
                    t.id === taskId && t.type === "chapter"
                      ? {
                          ...t,
                          pagesDone: Math.max(
                            0,
                            Math.min(pagesDone, t.pagesTotal)
                          ),
                          completed:
                            Math.max(0, Math.min(pagesDone, t.pagesTotal)) >=
                            t.pagesTotal,
                          completedAt:
                            Math.max(0, Math.min(pagesDone, t.pagesTotal)) >=
                            t.pagesTotal
                              ? new Date().toISOString()
                              : t.completedAt,
                        }
                      : t
                  ),
                }
              : st
          );
          const solved = next.reduce(
            (acc, st) => acc + st.tasks.filter((t) => t.completed).length,
            0
          );
          const streakDays = computeStreakDays(s.motivation.diary, next);
          return {
            ...s,
            plan: { stages: next },
            stats: { ...s.stats, solvedTasks: solved, streakDays },
          };
        }),
      setQuote: (q) =>
        setState((s) => ({ ...s, motivation: { ...s.motivation, quote: q } })),
      addDiaryEntry: ({ hours, text }) =>
        setState((s) => {
          const newEntry = {
            id: generateUUID(),
            date: new Date().toISOString(),
            hours,
            text,
          };
          return {
            ...s,
            motivation: {
              ...s.motivation,
              diary: [newEntry, ...s.motivation.diary],
            },
            stats: {
              ...s.stats,
              totalHours: s.stats.totalHours + hours,
              streakDays: computeStreakDays(
                [newEntry, ...s.motivation.diary],
                s.plan.stages
              ),
            },
          };
        }),
      updateDiaryEntry: (entryId, { hours, text }) =>
        setState((s) => {
          const entry = s.motivation.diary.find((e) => e.id === entryId);
          if (!entry) return s;

          const hoursDiff = hours - entry.hours;
          const updatedDiary = s.motivation.diary.map((e) =>
            e.id === entryId ? { ...e, hours, text } : e
          );

          return {
            ...s,
            motivation: {
              ...s.motivation,
              diary: updatedDiary,
            },
            stats: {
              ...s.stats,
              totalHours: s.stats.totalHours + hoursDiff,
              streakDays: computeStreakDays(updatedDiary, s.plan.stages),
            },
          };
        }),
      removeDiaryEntry: (entryId) =>
        setState((s) => {
          const entry = s.motivation.diary.find((e) => e.id === entryId);
          if (!entry) return s;

          const updatedDiary = s.motivation.diary.filter(
            (e) => e.id !== entryId
          );

          return {
            ...s,
            motivation: {
              ...s.motivation,
              diary: updatedDiary,
            },
            stats: {
              ...s.stats,
              totalHours: Math.max(0, s.stats.totalHours - entry.hours),
              streakDays: computeStreakDays(updatedDiary, s.plan.stages),
            },
          };
        }),
      resetAll: () => setState(demoState),
      exportData: () => {
        setState((currentState) => {
          const dataStr = JSON.stringify(currentState, null, 2);
          const dataBlob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `shad-backup-${
            new Date().toISOString().split("T")[0]
          }.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return currentState;
        });
      },
      importData: (data: AppState) => {
        try {
          setState(data);
          saveState(data);
        } catch (error) {
          console.error("Failed to import data:", error);
          throw error;
        }
      },
    }),
    []
  );

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

function computeStreakDays(diary: DiaryEntry[], stages: Stage[]): number {
  // Collect activity dates: diary entries and tasks completedAt
  const dates = new Set<string>();
  diary.forEach((d) => dates.add(new Date(d.date).toDateString()));
  stages.forEach((st) =>
    st.tasks.forEach((t) => {
      if (t.completedAt) dates.add(new Date(t.completedAt).toDateString());
    })
  );
  // Count consecutive days ending today
  let count = 0;
  const today = new Date();
  for (;;) {
    const key = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - count
    ).toDateString();
    if (dates.has(key)) count += 1;
    else break;
  }
  return count;
}
