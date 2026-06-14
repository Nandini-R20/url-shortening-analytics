import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#7c5cff", "#22d3ee", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"];

export function StatPie({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) {
    return <div className="h-64 grid place-items-center text-sm text-muted-foreground">No data yet.</div>;
  }
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "oklch(0.22 0.03 270)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "12px",
              fontSize: 13,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
