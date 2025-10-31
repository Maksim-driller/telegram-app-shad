import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import WeeklyChart from "../components/WeeklyChart";
import { useAppState } from "../state/AppContext";

export default function Diary() {
  const { state, actions } = useAppState();
  const [hours, setHours] = useState<string>("1");
  const [text, setText] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const addEntry = () => {
    const h = Math.max(0, Number(hours) || 0);
    actions.addDiaryEntry({ text: text.trim(), hours: h });
    setText("");
    setHours("1");
  };

  const weeklyData = useMemo(() => {
    const days: { date: string; label: string; hours: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = dayjs(d).format("dd");
      days.push({ date: key, label, hours: 0 });
    }
    for (const e of state.motivation.diary) {
      const key = e.date.slice(0, 10);
      const target = days.find((d) => d.date === key);
      if (target) target.hours += e.hours;
    }
    return days;
  }, [state.motivation.diary]);

  return (
    <div>
      <h1 className="h1">Дневник усилий</h1>

      <div className="card" style={{ display: "grid", gap: 8 }}>
        <input
          className="input"
          placeholder="Сколько часов?"
          inputMode="decimal"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <textarea
          className="textarea"
          rows={3}
          placeholder="Короткая заметка про сегодняшний прогресс"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addEntry}>
          Добавить запись
        </button>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="label-muted" style={{ marginBottom: 6 }}>
          Часы за 7 дней
        </div>
        <WeeklyChart data={weeklyData} />
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {state.motivation.diary.map((e) => (
          <div key={e.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <div className="label-muted">
                {dayjs(e.date).format("DD.MM.YYYY HH:mm")} • {e.hours} ч
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn ghost"
                  style={{ padding: "4px 8px", fontSize: 11 }}
                  onClick={() => setEditingEntryId(e.id)}
                >
                  ✏️ Редактировать
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: "4px 8px", fontSize: 11 }}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Вы уверены, что хотите удалить эту запись?"
                      )
                    ) {
                      actions.removeDiaryEntry(e.id);
                    }
                  }}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{e.text}</div>
          </div>
        ))}
      </div>

      <EditDiaryEntryModal
        open={!!editingEntryId}
        onClose={() => setEditingEntryId(null)}
        entryId={editingEntryId}
        entry={
          editingEntryId
            ? state.motivation.diary.find((e) => e.id === editingEntryId)
            : undefined
        }
        onSave={(hours, text) => {
          if (editingEntryId) {
            actions.updateDiaryEntry(editingEntryId, {
              hours,
              text,
            });
            setEditingEntryId(null);
          }
        }}
      />
    </div>
  );
}

function EditDiaryEntryModal({
  open,
  onClose,
  entryId,
  entry,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  entryId: string | null;
  entry?: { id: string; date: string; hours: number; text: string };
  onSave: (hours: number, text: string) => void;
}) {
  const [hours, setHours] = useState<string>("1");
  const [text, setText] = useState<string>("");

  // Обновляем состояние при открытии модального окна или изменении entry
  useEffect(() => {
    if (open && entry) {
      setHours(entry.hours.toString());
      setText(entry.text);
    } else if (!open) {
      // Сбрасываем при закрытии
      setHours("1");
      setText("");
    }
  }, [open, entry]);

  const handleSave = () => {
    const h = Math.max(0, Number(hours) || 0);
    if (h > 0 && text.trim()) {
      onSave(h, text.trim());
    }
  };

  const canSave = useMemo(() => {
    const h = Math.max(0, Number(hours) || 0);
    return h > 0 && text.trim().length > 0;
  }, [hours, text]);

  return (
    <Modal open={open} onClose={onClose} title="Редактировать запись">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="label-muted">Сколько часов?</label>
          <input
            className="input"
            placeholder="Сколько часов?"
            inputMode="decimal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label className="label-muted">Заметка</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Короткая заметка про сегодняшний прогресс"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        {entry && (
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Дата создания: {dayjs(entry.date).format("DD.MM.YYYY HH:mm")}
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
            style={{ flex: 1, opacity: canSave ? 1 : 0.6 }}
            disabled={!canSave}
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
}
