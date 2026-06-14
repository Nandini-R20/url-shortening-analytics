import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface DailyClick {
  date: string;
  clicks: number;
}

export function DailyClicksChart({ data }: { data: DailyClick[] }) {
  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.22 0.03 270)",
              border: "1px solid oklch(1 0 0 / 10%)",
              borderRadius: "12px",
              color: "var(--color-foreground)",
              fontSize: 13,
              boxShadow: "0 8px 32px -8px oklch(0 0 0 / 50%)",
            }}
            labelStyle={{ color: "var(--color-muted-foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="var(--brand)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--brand)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--brand-2)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
