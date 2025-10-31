import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext";

export default function Dashboard() {
  const { state } = useAppState();
  const [showToday, setShowToday] = useState(false);

  const {
    overallProgress,
    totalTasks,
    solvedTasks,
    todayStats,
    stageProgress,
  } = useMemo(() => {
    const { stages } = state.plan;
    const total = stages.reduce((acc, s) => acc + s.tasks.length, 0);
    const done = stages.reduce(
      (acc, s) => acc + s.tasks.filter((t) => t.completed).length,
      0
    );

    // Today's stats
    const today = dayjs().startOf("day");
    const todayTasks = stages.reduce((acc, s) => {
      return (
        acc +
        s.tasks.filter((t) => {
          if (!t.completedAt) return false;
          return dayjs(t.completedAt).isSame(today, "day");
        }).length
      );
    }, 0);

    const todayHours = state.motivation.diary
      .filter((e) => dayjs(e.date).isSame(today, "day"))
      .reduce((acc, e) => acc + e.hours, 0);

    // Stage progress
    const stageProgressData = stages.map((stage) => {
      const stageTotal = stage.tasks.length;
      const stageDone = stage.tasks.filter((t) => t.completed).length;
      return {
        title: stage.title,
        progress:
          stageTotal === 0 ? 0 : Math.round((stageDone / stageTotal) * 100),
        done: stageDone,
        total: stageTotal,
        deadline: stage.deadline,
      };
    });

    return {
      overallProgress: total === 0 ? 0 : Math.round((done / total) * 100),
      totalTasks: total,
      solvedTasks: done,
      todayStats: {
        tasks: todayTasks,
        hours: todayHours,
      },
      stageProgress: stageProgressData,
    };
  }, [state.plan, state.motivation.diary]);

  const handleShare = () => {
    const text = `🎯 Мой прогресс подготовки к ШАД:

✅ Решено задач: ${solvedTasks}/${totalTasks} (${overallProgress}%)
⏱️ Всего часов: ${state.stats.totalHours}
🔥 Серия дней: ${state.stats.streakDays}
📅 За сегодня: ${todayStats.tasks} задач, ${todayStats.hours} часов

${state.motivation.quote || "ШАД — это инвестиция в себя!"}`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Прогресс скопирован в буфер обмена!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Прогресс скопирован в буфер обмена!");
      });
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div className="label-muted">За сегодня</div>
          <button
            className="btn ghost"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={() => setShowToday(!showToday)}
          >
            {showToday ? "Скрыть" : "Показать"}
          </button>
        </div>
        {showToday && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                {todayStats.tasks}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                задач сегодня
              </div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                {todayStats.hours}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                часов сегодня
              </div>
            </div>
          </div>
        )}
      </div>

      {stageProgress.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="label-muted" style={{ marginBottom: 8 }}>
            Прогресс по этапам
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {stageProgress.map((stage) => (
              <div key={stage.title}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  <span>{stage.title}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {stage.done}/{stage.total} ({stage.progress}%)
                  </span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className="bar"
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
                {stage.deadline && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    📅 {dayjs(stage.deadline).format("DD.MM.YYYY")}
                    {(() => {
                      const daysLeft = dayjs(stage.deadline).diff(
                        dayjs(),
                        "day"
                      );
                      if (daysLeft < 0) {
                        return (
                          <span
                            style={{ color: "var(--danger)", marginLeft: 4 }}
                          >
                            Просрочено
                          </span>
                        );
                      } else if (daysLeft <= 7) {
                        return (
                          <span
                            style={{ color: "var(--danger)", marginLeft: 4 }}
                          >
                            Осталось {daysLeft} дн.
                          </span>
                        );
                      } else {
                        return (
                          <span style={{ marginLeft: 4 }}>
                            Осталось {daysLeft} дн.
                          </span>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="label-muted" style={{ marginBottom: 6 }}>
          Мотивация дня
        </div>
        <div style={{ fontSize: 14 }}>
          {state.motivation.quote || "Ты уже ближе к цели, чем вчера."}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={handleShare}
        >
          📤 Поделиться прогрессом
        </button>
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
