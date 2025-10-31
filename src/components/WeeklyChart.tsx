import { useEffect, useState } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

type ChartData = { date: string; label: string; hours: number }[];

// Fallback chart component that doesn't use Recharts
function FallbackChart({ data }: { data: ChartData }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 0);
  return (
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
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "var(--text)", minWidth: 30 }}>
            {day.hours}ч
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartInner({ data }: { data: ChartData }) {
  const [rechartsLoaded, setRechartsLoaded] = useState(false);
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);

  useEffect(() => {
    // Try to load Recharts dynamically with error handling
    let cancelled = false;

    // Use setTimeout to avoid blocking initial render
    const timer = setTimeout(() => {
      try {
        import("recharts")
          .then((mod) => {
            if (!cancelled && mod) {
              setRechartsComponents(mod);
              setRechartsLoaded(true);
            }
          })
          .catch((error) => {
            console.warn("Recharts failed to load, using fallback:", error);
            // Keep using fallback - don't change state
          });
      } catch (error) {
        console.warn("Recharts import failed:", error);
        // Keep using fallback
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Use fallback by default or if Recharts failed to load
  if (!rechartsLoaded || !RechartsComponents) {
    return <FallbackChart data={data} />;
  }

  // Try to render with Recharts
  try {
    const { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } =
      RechartsComponents;
    return (
      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -18, right: 0, top: 10 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, "dataMax + 1"]} />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--card-stroke)",
              }}
            />
            <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Chart rendering error:", error);
    return <FallbackChart data={data} />;
  }
}

export default function WeeklyChart({ data }: { data: ChartData }) {
  return (
    <ErrorBoundary>
      <ChartInner data={data} />
    </ErrorBoundary>
  );
}
