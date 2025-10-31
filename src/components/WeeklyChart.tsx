import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ChartData = { date: string; label: string; hours: number }[];

export default function WeeklyChart({ data }: { data: ChartData }) {
  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -18, right: 0, top: 10 }}>
          <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 'dataMax + 1']} />
          <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--card-stroke)' }} />
          <Bar dataKey="hours" fill="var(--primary)" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

