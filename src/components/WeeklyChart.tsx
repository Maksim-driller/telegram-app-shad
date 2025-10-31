import { ErrorBoundary } from "./ErrorBoundary";

type ChartData = { date: string; label: string; hours: number }[];

// Simple HTML/CSS chart that works everywhere (including Telegram WebView)
// Recharts causes errors in Telegram WebView, so we use a fallback implementation
export default function WeeklyChart({ data }: { data: ChartData }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 0);

  return (
    <ErrorBoundary>
      <div
        style={{
          width: "100%",
          height: 160,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {data.map((day) => (
          <div
            key={day.date}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 30 }}>
              {day.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 20,
                background: "var(--card-stroke)",
                borderRadius: 4,
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: maxHours > 0 ? `${(day.hours / maxHours) * 100}%` : 0,
                  background: "var(--primary)",
                  borderRadius: 4,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "var(--text)", minWidth: 30 }}>
              {day.hours}ч
            </span>
          </div>
        ))}
      </div>
    </ErrorBoundary>
  );
}
