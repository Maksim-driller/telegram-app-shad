import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type TaskBase = {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
};

type TaskProblem = TaskBase & {
  type: 'problem';
};

type TaskChapter = TaskBase & {
  type: 'chapter';
  pagesTotal: number;
  pagesDone: number;
};

type TaskVideo = TaskBase & {
  type: 'video';
  url?: string;
};

type Task = TaskProblem | TaskChapter | TaskVideo;

type Stage = {
  id: string;
  title: string;
  tasks: Task[];
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
  addTask: (
    stageId: string,
    task:
      | { type: 'problem'; title: string }
      | { type: 'chapter'; title: string; pagesTotal: number }
      | { type: 'video'; title: string; url?: string }
  ) => void;
  removeTask: (stageId: string, taskId: string) => void;
  toggleTask: (stageId: string, taskId: string, completed: boolean) => void;
  updateChapterProgress: (stageId: string, taskId: string, pagesDone: number) => void;
  setQuote: (q: string) => void;
  addDiaryEntry: (payload: { hours: number; text: string }) => void;
  resetAll: () => void;
};

const AppContext = createContext<{ state: AppState; actions: AppActions } | null>(null);

const STORAGE_KEY = 'shad-prep-app-state-v2';

const demoState: AppState = {
  plan: {
    stages: [
      {
        id: crypto.randomUUID(),
        title: 'Математический анализ',
        tasks: [
          { id: crypto.randomUUID(), title: 'Прочитать главу 1', type: 'chapter', pagesTotal: 50, pagesDone: 0, completed: false },
          { id: crypto.randomUUID(), title: 'Решить задачи 1-10', type: 'problem', completed: false },
        ],
      },
      {
        id: crypto.randomUUID(),
        title: 'Алгоритмы',
        tasks: [
          { id: crypto.randomUUID(), title: 'Лекция: сортировки', type: 'video', url: '', completed: false },
        ],
      },
    ],
  },
  motivation: {
    quote: 'ШАД — это инвестиция в себя. Продолжай!',
    diary: [],
    why: '',
  },
  stats: {
    totalTasks: 3,
    solvedTasks: 0,
    totalHours: 0,
    streakDays: 0,
  },
};

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

  const actions = useMemo<AppActions>(() => ({
    addStage: (title) =>
      setState((s) => ({
        ...s,
        plan: { stages: [...s.plan.stages, { id: crypto.randomUUID(), title, tasks: [] }] },
      })),
    removeStage: (stageId) =>
      setState((s) => ({
        ...s,
        plan: { stages: s.plan.stages.filter((st) => st.id !== stageId) },
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
                      if (payload.type === 'chapter') {
                        return {
                          id: crypto.randomUUID(),
                          type: 'chapter',
                          title: payload.title,
                          pagesTotal: Math.max(1, Math.floor(payload.pagesTotal)),
                          pagesDone: 0,
                          completed: false,
                        };
                      }
                      if (payload.type === 'video') {
                        return {
                          id: crypto.randomUUID(),
                          type: 'video',
                          title: payload.title,
                          url: payload.url,
                          completed: false,
                        };
                      }
                      return {
                        id: crypto.randomUUID(),
                        type: 'problem',
                        title: payload.title,
                        completed: false,
                      };
                    })(),
                  ],
                }
              : st,
          ),
        },
        stats: { ...s.stats, totalTasks: s.stats.totalTasks + 1 },
      })),
    removeTask: (stageId, taskId) =>
      setState((s) => ({
        ...s,
        plan: {
          stages: s.plan.stages.map((st) =>
            st.id === stageId ? { ...st, tasks: st.tasks.filter((t) => t.id !== taskId) } : st,
          ),
        },
        stats: { ...s.stats, totalTasks: Math.max(0, s.stats.totalTasks - 1) },
      })),
    toggleTask: (stageId, taskId, completed) =>
      setState((s) => {
        const nextStages = s.plan.stages.map((st) =>
          st.id === stageId
            ? {
                ...st,
                tasks: st.tasks.map((t) => (t.id === taskId ? { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined } : t)),
              }
            : st,
        );
        const solved = nextStages.reduce(
          (acc, st) => acc + st.tasks.filter((t) => t.completed).length,
          0,
        );
        const streakDays = computeStreakDays(s.motivation.diary, nextStages);
        return { ...s, plan: { stages: nextStages }, stats: { ...s.stats, solvedTasks: solved, streakDays } };
      }),
    updateChapterProgress: (stageId, taskId, pagesDone) =>
      setState((s) => {
        const next = s.plan.stages.map((st) =>
          st.id === stageId
            ? {
                ...st,
                tasks: st.tasks.map((t) =>
                  t.id === taskId && t.type === 'chapter'
                    ? {
                        ...t,
                        pagesDone: Math.max(0, Math.min(pagesDone, t.pagesTotal)),
                        completed: Math.max(0, Math.min(pagesDone, t.pagesTotal)) >= t.pagesTotal,
                        completedAt:
                          Math.max(0, Math.min(pagesDone, t.pagesTotal)) >= t.pagesTotal
                            ? new Date().toISOString()
                            : t.completedAt,
                      }
                    : t,
                ),
              }
            : st,
        );
        const solved = next.reduce((acc, st) => acc + st.tasks.filter((t) => t.completed).length, 0);
        const streakDays = computeStreakDays(s.motivation.diary, next);
        return { ...s, plan: { stages: next }, stats: { ...s.stats, solvedTasks: solved, streakDays } };
      }),
    setQuote: (q) => setState((s) => ({ ...s, motivation: { ...s.motivation, quote: q } })),
    addDiaryEntry: ({ hours, text }) =>
      setState((s) => ({
        ...s,
        motivation: {
          ...s.motivation,
          diary: [
            { id: crypto.randomUUID(), date: new Date().toISOString(), hours, text },
            ...s.motivation.diary,
          ],
        },
        stats: { ...s.stats, totalHours: s.stats.totalHours + hours, streakDays: computeStreakDays([{ id: 'tmp', date: new Date().toISOString(), hours, text }, ...s.motivation.diary], s.plan.stages) },
      })),
    resetAll: () => setState(demoState),
  }), []);

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

function computeStreakDays(diary: DiaryEntry[], stages: Stage[]): number {
  // Collect activity dates: diary entries and tasks completedAt
  const dates = new Set<string>();
  diary.forEach((d) => dates.add(new Date(d.date).toDateString()));
  stages.forEach((st) =>
    st.tasks.forEach((t) => {
      if (t.completedAt) dates.add(new Date(t.completedAt).toDateString());
    }),
  );
  // Count consecutive days ending today
  let count = 0;
  const today = new Date();
  for (;;) {
    const key = new Date(today.getFullYear(), today.getMonth(), today.getDate() - count).toDateString();
    if (dates.has(key)) count += 1; else break;
  }
  return count;
}


