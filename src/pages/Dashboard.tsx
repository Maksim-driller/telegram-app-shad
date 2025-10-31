import { useMemo } from "react";
import { useAppState } from "../state/AppContext";

export default function Dashboard() {
  const { state } = useAppState();

  const { overallProgress, totalTasks, solvedTasks } = useMemo(() => {
    const { stages } = state.plan;
    const total = stages.reduce((acc, s) => acc + s.tasks.length, 0);
    const done = stages.reduce(
      (acc, s) => acc + s.tasks.filter((t) => t.completed).length,
      0
    );
    return {
      overallProgress: total === 0 ? 0 : Math.round((done / total) * 100),
      totalTasks: total,
      solvedTasks: done,
    };
  }, [state.plan]);

  return (
    <div>
      <h1 className="h1">Ваш прогресс</h1>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          <span>Общий план</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="progress">
          <div className="bar" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        <StatCard title="Всего задач" value={totalTasks.toString()} />
        <StatCard title="Решено" value={solvedTasks.toString()} />
        <StatCard title="Часы" value={state.stats.totalHours.toString()} />
        <StatCard title="Серия" value={`${state.stats.streakDays} дн.`} />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="label-muted" style={{ marginBottom: 6 }}>
          Мотивация дня
        </div>
        <div style={{ fontSize: 14 }}>
          {state.motivation.quote || "Ты уже ближе к цели, чем вчера."}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
