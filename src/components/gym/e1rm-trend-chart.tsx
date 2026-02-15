"use client";

import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface E1RMTrendChartProps {
  history: { date: string; e1rm: number }[];
  goalE1RM: number | null;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { date: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{payload[0].value} lbs</p>
      <p className="text-muted-foreground">{payload[0].payload.date}</p>
    </div>
  );
}

export function E1RMTrendChart({ history, goalE1RM }: E1RMTrendChartProps) {
  if (history.length < 2) {
    return (
      <div className="rounded-2xl border bg-card p-5 text-center">
        <TrendingUp className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Complete a few sessions to see your 1RM trend 📈
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Estimated 1RM Trend
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={history}>
          <Line
            type="monotone"
            dataKey="e1rm"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(142, 71%, 45%)" }}
          />
          {goalE1RM && (
            <ReferenceLine
              y={goalE1RM}
              stroke="hsl(0, 0%, 50%)"
              strokeDasharray="4 4"
              label={{
                value: "Goal",
                position: "right",
                fontSize: 10,
                fill: "hsl(0, 0%, 50%)",
              }}
            />
          )}
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
