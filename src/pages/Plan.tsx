import confetti from "canvas-confetti";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import { useAppState } from "../state/AppContext";

export default function Plan() {
  const { state, actions } = useAppState();
  const [newStage, setNewStage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompleted, setFilterCompleted] = useState<
    "all" | "completed" | "active"
  >("all");

  const handleToggle = (
    stageId: string,
    taskId: string,
    completed: boolean
  ) => {
    actions.toggleTask(stageId, taskId, completed);
    if (completed) {
      try {
        // Check if canvas-confetti is available and works
        if (typeof confetti === "function") {
          confetti({ scalar: 0.6, ticks: 120, spread: 70, startVelocity: 25 });
        }
      } catch (error) {
        // Silently fail if confetti doesn't work (e.g., in Telegram WebView)
        console.warn("Confetti animation failed:", error);
      }
    }
  };

  const addStage = () => {
    if (!newStage.trim()) return;
    actions.addStage(newStage.trim());
    setNewStage("");
  };

  const [openForStage, setOpenForStage] = useState<string | null>(null);
  const [deadlineStageId, setDeadlineStageId] = useState<string | null>(null);

  const filteredStages = useMemo(() => {
    if (!searchQuery.trim() && filterCompleted === "all") {
      return state.plan.stages;
    }

    return state.plan.stages
      .map((stage) => {
        let filteredTasks = stage.tasks;

        // Filter by search query
        if (searchQuery.trim()) {
          filteredTasks = filteredTasks.filter((task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Filter by completion status
        if (filterCompleted === "completed") {
          filteredTasks = filteredTasks.filter((task) => task.completed);
        } else if (filterCompleted === "active") {
          filteredTasks = filteredTasks.filter((task) => !task.completed);
        }

        return { ...stage, tasks: filteredTasks };
      })
      .filter((stage) => stage.tasks.length > 0 || !searchQuery.trim());
  }, [state.plan.stages, searchQuery, filterCompleted]);

  return (
    <div>
      <h1 className="h1">Учебный план</h1>

      <div className="card" style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          placeholder="Новый этап (например, ТА/Матан)"
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addStage}>
          Добавить
        </button>
      </div>

      {(state.plan.stages.length > 0 || searchQuery.trim()) && (
        <div
          className="card"
          style={{ marginTop: 12, display: "grid", gap: 8 }}
        >
          <input
            className="input"
            placeholder="🔍 Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${
                filterCompleted === "all" ? "btn-primary" : "btn-outline"
              }`}
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setFilterCompleted("all")}
            >
              Все
            </button>
            <button
              className={`btn ${
                filterCompleted === "active" ? "btn-primary" : "btn-outline"
              }`}
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setFilterCompleted("active")}
            >
              Активные
            </button>
            <button
              className={`btn ${
                filterCompleted === "completed" ? "btn-primary" : "btn-outline"
              }`}
              style={{ flex: 1, fontSize: 12 }}
              onClick={() => setFilterCompleted("completed")}
            >
              Завершенные
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {filteredStages.length === 0 && state.plan.stages.length > 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "20px",
              color: "var(--muted)",
            }}
          >
            {searchQuery.trim()
              ? "Задачи не найдены"
              : "Нет задач по выбранному фильтру"}
          </div>
        ) : (
          filteredStages.map((stage) => {
            const originalStage = state.plan.stages.find(
              (s) => s.id === stage.id
            )!;
            return (
              <div key={stage.id} className="card">
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{stage.title}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => setOpenForStage(stage.id)}
                      >
                        Добавить задачу
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => actions.removeStage(stage.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 11,
                    }}
                  >
                    <button
                      className="btn ghost"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() => setDeadlineStageId(stage.id)}
                    >
                      {stage.deadline ? (
                        <>
                          📅 {dayjs(stage.deadline).format("DD.MM.YYYY")}
                          {(() => {
                            const daysLeft = dayjs(stage.deadline).diff(
                              dayjs(),
                              "day"
                            );
                            if (daysLeft < 0) {
                              return (
                                <span
                                  style={{
                                    color: "var(--danger)",
                                    marginLeft: 4,
                                  }}
                                >
                                  Просрочено
                                </span>
                              );
                            } else if (daysLeft === 0) {
                              return (
                                <span
                                  style={{
                                    color: "var(--danger)",
                                    marginLeft: 4,
                                  }}
                                >
                                  Сегодня!
                                </span>
                              );
                            } else if (daysLeft <= 7) {
                              return (
                                <span
                                  style={{
                                    color: "var(--danger)",
                                    marginLeft: 4,
                                  }}
                                >
                                  Осталось {daysLeft} дн.
                                </span>
                              );
                            } else {
                              return (
                                <span
                                  style={{
                                    color: "var(--muted)",
                                    marginLeft: 4,
                                  }}
                                >
                                  Осталось {daysLeft} дн.
                                </span>
                              );
                            }
                          })()}
                        </>
                      ) : (
                        "📅 Установить дедлайн"
                      )}
                    </button>
                    {stage.deadline && (
                      <button
                        className="btn ghost"
                        style={{
                          padding: "4px 8px",
                          fontSize: 11,
                          color: "var(--danger)",
                        }}
                        onClick={() =>
                          actions.setStageDeadline(stage.id, undefined)
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {stage.deadline &&
                    (() => {
                      const totalTasks = stage.tasks.length;
                      const completedTasks = stage.tasks.filter(
                        (t) => t.completed
                      ).length;
                      const progress =
                        totalTasks > 0
                          ? Math.round((completedTasks / totalTasks) * 100)
                          : 0;
                      const daysLeft = dayjs(stage.deadline).diff(
                        dayjs(),
                        "day"
                      );
                      return (
                        <div style={{ marginTop: 6 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 11,
                              color: "var(--muted)",
                              marginBottom: 4,
                            }}
                          >
                            <span>Прогресс этапа</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="progress" style={{ height: 4 }}>
                            <div
                              className="bar"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                </div>
                <div>
                  {stage.tasks.map((task) => (
                    <label key={task.id} className="row">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) =>
                          handleToggle(stage.id, task.id, e.target.checked)
                        }
                      />
                      <span className="grow" style={{ fontSize: 14 }}>
                        {task.title}
                        {task.type === "chapter" && (
                          <span className="label-muted">
                            {" "}
                            — {task.pagesDone}/{task.pagesTotal} стр.
                          </span>
                        )}
                        {task.type === "video" && task.url && (
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label-muted"
                            style={{ marginLeft: 6 }}
                          >
                            ссылка
                          </a>
                        )}
                      </span>
                      {task.type === "chapter" && (
                        <input
                          className="input"
                          style={{ width: 90 }}
                          inputMode="numeric"
                          value={task.pagesDone}
                          onChange={(e) =>
                            actions.updateChapterProgress(
                              stage.id,
                              task.id,
                              Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                        />
                      )}
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => actions.removeTask(stage.id, task.id)}
                      >
                        Удалить
                      </button>
                    </label>
                  ))}

                  {stage.tasks.length < originalStage.tasks.length && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      Показано {stage.tasks.length} из{" "}
                      {originalStage.tasks.length} задач
                    </div>
                  )}
                  <AddTaskButton onClick={() => setOpenForStage(stage.id)} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <TaskModal
        open={!!openForStage}
        onClose={() => setOpenForStage(null)}
        onSubmit={(task) => {
          if (!openForStage) return;
          actions.addTask(openForStage, task);
          setOpenForStage(null);
        }}
      />

      <DeadlineModal
        open={!!deadlineStageId}
        onClose={() => setDeadlineStageId(null)}
        stageId={deadlineStageId}
        currentDeadline={
          deadlineStageId
            ? state.plan.stages.find((s) => s.id === deadlineStageId)?.deadline
            : undefined
        }
        onSetDeadline={(deadline) => {
          if (deadlineStageId) {
            actions.setStageDeadline(deadlineStageId, deadline);
            setDeadlineStageId(null);
          }
        }}
      />
    </div>
  );
}

function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn ghost" style={{ marginTop: 8 }} onClick={onClick}>
      + Добавить задачу
    </button>
  );
}

type TaskType = "problem" | "chapter" | "video";

type NewTaskPayload =
  | { type: "problem"; title: string }
  | { type: "chapter"; title: string; pagesTotal: number }
  | { type: "video"; title: string; url?: string };

function TaskModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: NewTaskPayload) => void;
}) {
  const [type, setType] = useState<TaskType>("problem");
  const [title, setTitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [pages, setPages] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const canSubmit = useMemo(() => {
    if (type === "problem") return title.trim().length > 0;
    if (type === "chapter")
      return chapter.trim().length > 0 && pages.trim().length > 0;
    if (type === "video")
      return videoTitle.trim().length > 0 && videoUrl.trim().length > 0;
    return false;
  }, [type, title, chapter, pages, videoTitle, videoUrl]);

  const handleSubmit = () => {
    let payload: NewTaskPayload | null = null;
    if (type === "problem") payload = { type: "problem", title: title.trim() };
    if (type === "chapter")
      payload = {
        type: "chapter",
        title: `Глава ${chapter.trim()}`,
        pagesTotal: Math.max(1, Number(pages) || 1),
      };
    if (type === "video")
      payload = {
        type: "video",
        title: videoTitle.trim(),
        url: videoUrl.trim(),
      };
    if (!payload) return;
    onSubmit(payload);
    onClose();
    setTitle("");
    setChapter("");
    setPages("");
    setVideoTitle("");
    setVideoUrl("");
    setType("problem");
  };

  return (
    <Modal open={open} onClose={onClose} title="Новая задача">
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          <button
            className="btn btn-outline"
            style={
              type === "problem"
                ? {
                    background: "var(--primary)",
                    color: "#fff",
                    borderColor: "var(--primary)",
                  }
                : {}
            }
            onClick={() => setType("problem")}
          >
            Задача
          </button>
          <button
            className="btn btn-outline"
            style={
              type === "chapter"
                ? {
                    background: "var(--primary)",
                    color: "#fff",
                    borderColor: "var(--primary)",
                  }
                : {}
            }
            onClick={() => setType("chapter")}
          >
            Глава
          </button>
          <button
            className="btn btn-outline"
            style={
              type === "video"
                ? {
                    background: "var(--primary)",
                    color: "#fff",
                    borderColor: "var(--primary)",
                  }
                : {}
            }
            onClick={() => setType("video")}
          >
            Видео
          </button>
        </div>

        {type === "problem" && (
          <div style={{ display: "grid", gap: 8 }}>
            <label className="label-muted">Описание</label>
            <input
              className="input"
              placeholder="Напр.: задачи 1-20 из сборника"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        )}
        {type === "chapter" && (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label className="label-muted">Глава</label>
              <input
                className="input"
                placeholder="Напр.: 3"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label className="label-muted">Страниц</label>
              <input
                className="input"
                placeholder="Напр.: 50"
                inputMode="numeric"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
              />
            </div>
          </div>
        )}
        {type === "video" && (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label className="label-muted">Название</label>
              <input
                className="input"
                placeholder="Напр.: Лекция по сортировкам"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              <label className="label-muted">Ссылка</label>
              <input
                className="input"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, opacity: canSubmit ? 1 : 0.6 }}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Добавить
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeadlineModal({
  open,
  onClose,
  stageId,
  currentDeadline,
  onSetDeadline,
}: {
  open: boolean;
  onClose: () => void;
  stageId: string | null;
  currentDeadline?: string;
  onSetDeadline: (deadline: string | undefined) => void;
}) {
  const [deadline, setDeadline] = useState(
    currentDeadline
      ? dayjs(currentDeadline).format("YYYY-MM-DD")
      : dayjs().add(7, "day").format("YYYY-MM-DD")
  );

  const handleSubmit = () => {
    if (deadline) {
      const deadlineDate = dayjs(deadline).endOf("day").toISOString();
      onSetDeadline(deadlineDate);
    } else {
      onSetDeadline(undefined);
    }
  };

  const handleRemove = () => {
    onSetDeadline(undefined);
  };

  return (
    <Modal open={open} onClose={onClose} title="Установить дедлайн">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="label-muted">Дата дедлайна</label>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={dayjs().format("YYYY-MM-DD")}
          />
        </div>
        {currentDeadline && (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Текущий дедлайн: {dayjs(currentDeadline).format("DD.MM.YYYY")}
            {(() => {
              const daysLeft = dayjs(currentDeadline).diff(dayjs(), "day");
              if (daysLeft < 0) {
                return (
                  <span style={{ color: "var(--danger)", marginLeft: 8 }}>
                    Просрочено
                  </span>
                );
              } else {
                return (
                  <span style={{ marginLeft: 8 }}>Осталось {daysLeft} дн.</span>
                );
              }
            })()}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
          {currentDeadline && (
            <button
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={handleRemove}
            >
              Удалить
            </button>
          )}
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSubmit}
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
