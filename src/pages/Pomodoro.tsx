import { useEffect, useState } from "react";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function Pomodoro() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          const completed = sessionsCompleted + (isBreak ? 0 : 1);
          setSessionsCompleted(completed);
          if (!isBreak) {
            setIsBreak(true);
            return BREAK_MINUTES * 60;
          } else {
            setIsBreak(false);
            return WORK_MINUTES * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, sessionsCompleted]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60 - secondsLeft) / ((isBreak ? BREAK_MINUTES : WORK_MINUTES) * 60);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(WORK_MINUTES * 60);
  };

  return (
    <div>
      <h1 className="h1">Pomodoro Таймер</h1>

      <div className="card" style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
          {isBreak ? "Перерыв" : "Фокус"}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="progress" style={{ marginBottom: 16 }}>
          <div className="bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Пауза" : "Старт"}
          </button>
          <button className="btn btn-outline" onClick={reset}>
            Сброс
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="stat-title">Сессий завершено сегодня</div>
        <div className="stat-value">{sessionsCompleted}</div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="label-muted" style={{ marginBottom: 6 }}>Как работает</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          • 25 минут фокуса — работай над задачами<br />
          • 5 минут перерыва — отдохни<br />
          • После каждого цикла — награди себя!
        </div>
      </div>
    </div>
  );
}

