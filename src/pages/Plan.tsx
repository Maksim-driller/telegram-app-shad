import confetti from "canvas-confetti";
import { useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import { useAppState } from "../state/AppContext";

export default function Plan() {
  const { state, actions } = useAppState();
  const [newStage, setNewStage] = useState("");

  const handleToggle = (
    stageId: string,
    taskId: string,
    completed: boolean
  ) => {
    actions.toggleTask(stageId, taskId, completed);
    if (completed)
      confetti({ scalar: 0.6, ticks: 120, spread: 70, startVelocity: 25 });
  };

  const addStage = () => {
    if (!newStage.trim()) return;
    actions.addStage(newStage.trim());
    setNewStage("");
  };

  const [openForStage, setOpenForStage] = useState<string | null>(null);

  return (
    <div>
      <h1 className="h1">Учебный план</h1>

      <div className="card" style={{ display: 'flex', gap: 8 }}>
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

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {state.plan.stages.map((stage) => (
          <div key={stage.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{stage.title}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setOpenForStage(stage.id)}>
                  Добавить задачу
                </button>
                <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => actions.removeStage(stage.id)}>
                  Удалить
                </button>
              </div>
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
                    {task.type === 'chapter' && (
                      <span className="label-muted"> — {task.pagesDone}/{task.pagesTotal} стр.</span>
                    )}
                    {task.type === 'video' && task.url && (
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="label-muted" style={{ marginLeft: 6 }}>ссылка</a>
                    )}
                  </span>
                  {task.type === 'chapter' && (
                    <input
                      className="input"
                      style={{ width: 90 }}
                      inputMode="numeric"
                      value={task.pagesDone}
                      onChange={(e) => actions.updateChapterProgress(stage.id, task.id, Math.max(0, Number(e.target.value) || 0))}
                    />
                  )}
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => actions.removeTask(stage.id, task.id)}>
                    Удалить
                  </button>
                </label>
              ))}

              <AddTaskButton onClick={() => setOpenForStage(stage.id)} />
            </div>
          </div>
        ))}
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
      payload = { type: "chapter", title: `Глава ${chapter.trim()}`, pagesTotal: Math.max(1, Number(pages) || 1) };
    if (type === "video") payload = { type: "video", title: videoTitle.trim(), url: videoUrl.trim() };
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
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <button
            className="btn btn-outline"
            style={ type === 'problem' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)'} : {} }
            onClick={() => setType("problem")}
          >
            Задача
          </button>
          <button
            className="btn btn-outline"
            style={ type === 'chapter' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)'} : {} }
            onClick={() => setType("chapter")}
          >
            Глава
          </button>
          <button
            className="btn btn-outline"
            style={ type === 'video' ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)'} : {} }
            onClick={() => setType("video")}
          >
            Видео
          </button>
        </div>

        {type === "problem" && (
          <div style={{ display: 'grid', gap: 8 }}>
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
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="label-muted">Глава</label>
              <input
                className="input"
                placeholder="Напр.: 3"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
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
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="label-muted">Название</label>
              <input
                className="input"
                placeholder="Напр.: Лекция по сортировкам"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
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

        <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" style={{ flex: 1, opacity: canSubmit ? 1 : .6 }} disabled={!canSubmit} onClick={handleSubmit}>Добавить</button>
        </div>
      </div>
    </Modal>
  );
}
