import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAppState } from "../state/AppContext";
import WeeklyChart from "../components/WeeklyChart";

export default function Diary() {
  const { state, actions } = useAppState();
  const [hours, setHours] = useState<string>("1");
  const [text, setText] = useState("");

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
      const label = dayjs(d).format('dd');
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
        <div className="label-muted" style={{ marginBottom: 6 }}>Часы за 7 дней</div>
        <WeeklyChart data={weeklyData} />
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {state.motivation.diary.map((e) => (
          <div key={e.id} className="card">
            <div className="label-muted" style={{ marginBottom: 6 }}>
              {dayjs(e.date).format("DD.MM.YYYY HH:mm")} • {e.hours} ч
            </div>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
